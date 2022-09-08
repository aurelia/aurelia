
import { IDisposable, type IServiceLocator, type Writable } from '@aurelia/kernel';
import { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import {
  AccessorType,
  BindingMode,
  connectable, LifecycleFlags,
  Scope,
  type IAccessor,
  type IObserverLocator, type IOverrideContext, type IsBindingBehavior
} from '@aurelia/runtime';
import { connectableBinding, type IAstBasedBinding } from '@aurelia/runtime-html';
import {
  IStore,
  type IStoreSubscriber
} from './interfaces';
import { createStateBindingScope } from './state-utilities';

const { toView, oneTime } = BindingMode;

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateBinding extends IAstBasedBinding { }
export class StateBinding implements IAstBasedBinding, IStoreSubscriber<object> {
  public readonly oL: IObserverLocator;
  public interceptor: this = this;
  public locator: IServiceLocator;
  public $scope?: Scope | undefined;
  public isBound: boolean = false;
  public sourceExpression: IsBindingBehavior;
  private readonly target: object;
  private readonly targetProperty: PropertyKey;
  private task: ITask | null = null;
  private readonly taskQueue: TaskQueue;
  /** @internal */
  private _isBinding = 0;

  /** @internal */ private readonly _store: IStore<object>;
  /** @internal */ private targetObserver!: IAccessor;
  /** @internal */ private _value: unknown = void 0;
  /** @internal */ private _sub?: IDisposable | Unsubscribable | (() => void) = void 0;
  /** @internal */ private _updateCount = 0;

  public persistentFlags: LifecycleFlags = LifecycleFlags.none;
  public mode: BindingMode = toView;

  public constructor(
    locator: IServiceLocator,
    taskQueue: TaskQueue,
    store: IStore<object>,
    observerLocator: IObserverLocator,
    expr: IsBindingBehavior,
    target: object,
    prop: PropertyKey,
  ) {
    this.locator = locator;
    this.taskQueue = taskQueue;
    this._store = store;
    this.oL = observerLocator;
    this.sourceExpression = expr;
    this.target = target;
    this.targetProperty = prop;
  }

  public updateTarget(value: unknown, flags: LifecycleFlags) {
    const targetAccessor = this.targetObserver;
    const target = this.target;
    const prop = this.targetProperty;
    const updateCount = this._updateCount++;
    const isCurrentValue = () => updateCount === this._updateCount - 1;
    this._unsub();

    if (isSubscribable(value)) {
      this._sub = value.subscribe($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, flags, target, prop);
        }
      });
      return;
    }

    if (value instanceof Promise) {
      void value.then($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, flags, target, prop);
        }
      }, () => {/* todo: don't ignore */});
      return;
    }

    targetAccessor.setValue(value, flags, target, prop);
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    this._isBinding++;
    this.targetObserver = this.oL.getAccessor(this.target, this.targetProperty);
    this.$scope = createStateBindingScope(this._store.getState(), scope);
    this._store.subscribe(this);
    this.updateTarget(this._value = this.sourceExpression.evaluate(
      this.$scope,
      this.locator,
      this.mode > oneTime ? this : null),
      LifecycleFlags.none
    );
    this._isBinding--;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this._unsub();
    // also disregard incoming future value of promise resolution if any
    this._updateCount++;
    this.isBound = false;
    this.$scope = void 0;
    this.task?.cancel();
    this.task = null;
    this._store.unsubscribe(this);
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    flags |= this.persistentFlags;

    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
    const shouldQueueFlush = this._isBinding === 0 && (this.targetObserver.type & AccessorType.Layout) > 0;
    const obsRecord = this.obs;
    obsRecord.version++;
    newValue = this.sourceExpression.evaluate(this.$scope!, this.locator, this.interceptor);
    obsRecord.clear();

    let task: ITask | null;
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this.task;
      this.task = this.taskQueue.queueTask(() => {
        this.interceptor.updateTarget(newValue, flags);
        this.task = null;
      }, updateTaskOpts);
      task?.cancel();
      task = null;
    } else {
      this.interceptor.updateTarget(newValue, flags);
    }
  }

  public handleStateChange(state: object): void {
    const $scope = this.$scope!;
    const overrideContext = $scope.overrideContext as Writable<IOverrideContext>;
    $scope.bindingContext = overrideContext.bindingContext = overrideContext.$state = state;
    const value = this.sourceExpression.evaluate(
      $scope,
      this.locator,
      this.mode > oneTime ? this : null
    );
    const shouldQueueFlush = this._isBinding === 0 && (this.targetObserver.type & AccessorType.Layout) > 0;

    if (value === this._value) {
      return;
    }
    this._value = value;
    let task: ITask | null = null;
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this.task;
      this.task = this.taskQueue.queueTask(() => {
        this.interceptor.updateTarget(value, LifecycleFlags.isStrictBindingStrategy);
        this.task = null;
      }, updateTaskOpts);
      task?.cancel();
    } else {
      this.interceptor.updateTarget(this._value, LifecycleFlags.none);
    }
  }

  /** @internal */
  private _unsub() {
    if (typeof this._sub === 'function') {
      this._sub();
    } else if (this._sub !== void 0) {
      (this._sub as IDisposable).dispose?.();
      (this._sub as Unsubscribable).unsubscribe?.();
    }
    this._sub = void 0;
  }
}

function isSubscribable(v: unknown): v is SubscribableValue {
  return v instanceof Object && 'subscribe' in (v as SubscribableValue);
}

type SubscribableValue = {
  subscribe(cb: (res: unknown) => void): IDisposable | Unsubscribable | (() => void);
};

type Unsubscribable = {
  unsubscribe(): void;
};

const updateTaskOpts: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

connectableBinding(true, true)(StateBinding);
