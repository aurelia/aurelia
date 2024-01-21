
import { IDisposable, type IServiceLocator, type Writable } from '@aurelia/kernel';
import { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import {
  astEvaluate,
  connectable,
  IAstEvaluator,
  IBinding,
  IConnectableBinding,
  Scope,
  type IAccessor,
  type IObserverLocator, type IOverrideContext, type IsBindingBehavior
} from '@aurelia/runtime';
import { BindingMode, type IBindingController, State, mixinAstEvaluator, mixingBindingLimited } from '@aurelia/runtime-html';
import {
  IStore,
  type IStoreSubscriber
} from './interfaces';
import { atLayout, createStateBindingScope } from './state-utilities';

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateBinding extends IAstEvaluator, IConnectableBinding { }
export class StateBinding implements IBinding, IStoreSubscriber<object> {
  public isBound: boolean = false;

  /** @internal */
  public readonly oL: IObserverLocator;

  /** @internal */
  public l: IServiceLocator;

  /** @internal */
  public _scope?: Scope | undefined;

  public ast: IsBindingBehavior;
  private readonly target: object;
  private readonly targetProperty: PropertyKey;

  /** @internal */ private _task: ITask | null = null;
  /** @internal */ private readonly _taskQueue: TaskQueue;

  /** @internal */ private readonly _store: IStore<object>;
  /** @internal */ private _targetObserver!: IAccessor;
  /** @internal */ private _value: unknown = void 0;
  /** @internal */ private _sub?: IDisposable | Unsubscribable | (() => void) = void 0;
  /** @internal */ private _updateCount = 0;
  /** @internal */ private readonly _controller: IBindingController;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public mode: BindingMode = BindingMode.toView;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    taskQueue: TaskQueue,
    ast: IsBindingBehavior,
    target: object,
    prop: PropertyKey,
    store: IStore<object>,
  ) {
    this._controller = controller;
    this.l = locator;
    this._taskQueue = taskQueue;
    this._store = store;
    this.oL = observerLocator;
    this.ast = ast;
    this.target = target;
    this.targetProperty = prop;
  }

  public updateTarget(value: unknown) {
    const targetAccessor = this._targetObserver;
    const target = this.target;
    const prop = this.targetProperty;
    const updateCount = this._updateCount++;
    const isCurrentValue = () => updateCount === this._updateCount - 1;
    this._unsub();

    if (isSubscribable(value)) {
      this._sub = value.subscribe($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, target, prop);
        }
      });
      return;
    }

    if (value instanceof Promise) {
      void value.then($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, target, prop);
        }
      }, () => {/* todo: don't ignore */});
      return;
    }

    targetAccessor.setValue(value, target, prop);
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this._targetObserver = this.oL.getAccessor(this.target, this.targetProperty);
    this._store.subscribe(this);
    this.updateTarget(this._value = astEvaluate(
      this.ast,
      this._scope = createStateBindingScope(this._store.getState(), _scope),
      this,
      this.mode > BindingMode.oneTime ? this : null),
    );
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this._unsub();
    // also disregard incoming future value of promise resolution if any
    this._updateCount++;
    this._scope = void 0;
    this._task?.cancel();
    this._task = null;
    this._store.unsubscribe(this);
  }

  public handleChange(newValue: unknown): void {
    if (!this.isBound) {
      return;
    }

    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
    const shouldQueueFlush = this._controller.state !== State.activating && (this._targetObserver.type & atLayout) > 0;
    const obsRecord = this.obs;
    obsRecord.version++;
    newValue = astEvaluate(this.ast, this._scope!, this, this);
    obsRecord.clear();

    let task: ITask | null;
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this._task;
      this._task = this._taskQueue.queueTask(() => {
        this.updateTarget(newValue);
        this._task = null;
      }, updateTaskOpts);
      task?.cancel();
      task = null;
    } else {
      this.updateTarget(newValue);
    }
  }

  public handleStateChange(): void {
    if (!this.isBound) {
      return;
    }
    const state = this._store.getState();
    const _scope = this._scope!;
    const overrideContext = _scope.overrideContext as Writable<IOverrideContext>;
    _scope.bindingContext = overrideContext.bindingContext = overrideContext.$state = state;
    const value = astEvaluate(
      this.ast,
      _scope,
      this,
      this.mode > BindingMode.oneTime ? this : null
    );
    const shouldQueueFlush = this._controller.state !== State.activating && (this._targetObserver.type & atLayout) > 0;

    if (value === this._value) {
      return;
    }
    this._value = value;
    let task: ITask | null = null;
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this._task;
      this._task = this._taskQueue.queueTask(() => {
        this.updateTarget(value);
        this._task = null;
      }, updateTaskOpts);
      task?.cancel();
    } else {
      this.updateTarget(this._value);
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

connectable(StateBinding);
mixinAstEvaluator(true)(StateBinding);
mixingBindingLimited(StateBinding, () => 'updateTarget');
