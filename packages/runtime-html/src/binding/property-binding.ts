import type {
  AccessorOrObserver,
  ForOfStatement,
  IConnectableBinding,
  IObserver,
  IObserverLocator,
  IObserverLocatorBasedConnectable,
  IsBindingBehavior,
  Scope,
} from '@aurelia/runtime';
import { AccessorType, BindingMode, ExpressionKind, LifecycleFlags, connectable } from '@aurelia/runtime';
import type { IServiceLocator, ITask, QueueTaskOptions, TaskQueue } from '@aurelia/kernel';

import { BindingTargetSubscriber } from './binding-utils.js';
import type { IAstBasedBinding } from './interfaces-bindings.js';
import { IDomWriteTask } from '../../../platform-browser/dist/types/index.js';
import { IPlatform } from '../platform.js';

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;
// const updateTaskOpts: QueueTaskOptions = {
//   reusable: false,
//   preempt: true,
// };

export interface PropertyBinding extends IAstBasedBinding {}

export class PropertyBinding implements IAstBasedBinding, IDomWriteTask {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;

  public targetObserver?: AccessorOrObserver = void 0;

  public persistentFlags: LifecycleFlags = LifecycleFlags.none;

  // private _task: ITask | null = null;
  private targetSubscriber: BindingTargetSubscriber | null = null;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;
  private readonly p: IPlatform;
  /** @internal */ private _value: unknown = void 0;
  /** @internal */ private _flags: LifecycleFlags = LifecycleFlags.none;
  /** @internal */ private _queue = false;

  public constructor(
    public sourceExpression: IsBindingBehavior | ForOfStatement,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    private readonly taskQueue: TaskQueue,
  ) {
    this.oL = observerLocator;
    this.p = locator.get(IPlatform);
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver!.setValue(value, flags, this.target, this.targetProperty);
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.sourceExpression.assign!(flags, this.$scope!, this.locator, value);
  }

  public writeDom() {
    this._queue = false;
    this.interceptor.updateTarget(this._value, this._flags);
    // !queued = not updated during .updateTarget(), clean up
    // queued = updated during .updateTarget(), leave intact
    if (!this._queue) {
      this._value = void (this._flags = 0);
    }
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    flags |= this.persistentFlags;

    const targetObserver = this.targetObserver!;
    const interceptor = this.interceptor;
    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;

    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
    const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (targetObserver.type & AccessorType.Layout) > 0;
    const obsRecord = this.obs;
    let shouldConnect: boolean = false;

    // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
    if (sourceExpression.$kind !== ExpressionKind.AccessScope || obsRecord.count > 1) {
      // todo: in VC expressions, from view also requires connect
      shouldConnect = this.mode > oneTime;
      if (shouldConnect) {
        obsRecord.version++;
      }
      newValue = sourceExpression.evaluate(flags, $scope!, locator, interceptor);
      if (shouldConnect) {
        obsRecord.clear(false);
      }
    }

    if (shouldQueueFlush) {
      this._value = newValue;
      this._flags = flags;
      if (!this._queue) {
        this._queue = true;
        this.p.queueDomWrite(this);
      }
    } else {
      interceptor.updateTarget(newValue, flags);
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }
    // Force property binding to always be strict
    flags |= LifecycleFlags.isStrictBindingStrategy;

    // Store flags which we can only receive during $bind and need to pass on
    // to the AST during evaluate/connect/assign
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;

    this.$scope = scope;

    let sourceExpression = this.sourceExpression;
    if (sourceExpression.hasBind) {
      sourceExpression.bind(flags, scope, this.interceptor);
    }

    const observerLocator = this.oL;
    const $mode = this.mode;
    let targetObserver = this.targetObserver;
    if (!targetObserver) {
      if ($mode & fromView) {
        targetObserver = observerLocator.getObserver(this.target, this.targetProperty);
      } else {
        targetObserver = observerLocator.getAccessor(this.target, this.targetProperty);
      }
      this.targetObserver = targetObserver;
    }

    // during bind, binding behavior might have changed sourceExpression
    // deepscan-disable-next-line
    sourceExpression = this.sourceExpression;
    const interceptor = this.interceptor;
    const shouldConnect = ($mode & toView) > 0;

    if ($mode & toViewOrOneTime) {
      interceptor.updateTarget(
        sourceExpression.evaluate(flags, scope, this.locator, shouldConnect ? interceptor : null),
        flags,
      );
    }
    if ($mode & fromView) {
      (targetObserver as IObserver).subscribe(this.targetSubscriber ??= new BindingTargetSubscriber(interceptor));
      if (!shouldConnect) {
        interceptor.updateSource(targetObserver.getValue(this.target, this.targetProperty), flags);
      }
    }

    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    this.persistentFlags = LifecycleFlags.none;

    if (this.sourceExpression.hasUnbind) {
      this.sourceExpression.unbind(flags, this.$scope!, this.interceptor);
    }

    this.$scope
      = this._value
      = void (this._flags = 0);

    if (this.targetSubscriber) {
      (this.targetObserver as IObserver).unsubscribe(this.targetSubscriber);
    }
    this.obs.clearAll();

    this.isBound = false;
  }
}

connectable(PropertyBinding);
