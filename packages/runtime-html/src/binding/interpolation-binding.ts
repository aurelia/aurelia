import {
  AccessorOrObserver,
  AccessorType,
  BindingMode,
  ExpressionKind,
  LifecycleFlags,
  connectable,
} from '@aurelia/runtime';

import type { IIndexable, IServiceLocator, ITask, QueueTaskOptions, TaskQueue } from '@aurelia/kernel';
import type {
  ICollectionSubscriber,
  IndexMap,
  Interpolation,
  IConnectableBinding,
  IObserverLocator,
  IsExpression,
  IBinding,
  Scope,
} from '@aurelia/runtime';
import type {
  IPlatform,
} from '../platform';

const { toView } = BindingMode;
const queueTaskOptions: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

// a pseudo binding to manage multiple InterpolationBinding s
// ========
// Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
// value converters and binding behaviors.
// Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
// in which case the renderer will create the TextBinding directly
export class InterpolationBinding implements IBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;
  public $hostScope: Scope | null = null;

  public partBindings: InterpolationPartBinding[];

  private readonly targetObserver: AccessorOrObserver;
  private task: ITask | null = null;

  public constructor(
    public observerLocator: IObserverLocator,
    public interpolation: Interpolation,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    public locator: IServiceLocator,
    private readonly taskQueue: TaskQueue,
  ) {
    this.targetObserver = observerLocator.getAccessor(target, targetProperty);
    const expressions = interpolation.expressions;
    const partBindings = this.partBindings = Array(expressions.length);
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      partBindings[i] = new InterpolationPartBinding(expressions[i], target, targetProperty, locator, observerLocator, this);
    }
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    const partBindings = this.partBindings;
    const staticParts = this.interpolation.parts;
    const ii = partBindings.length;
    let result = '';
    if (ii === 1) {
      result = staticParts[0] + partBindings[0].value + staticParts[1];
    } else {
      result = staticParts[0];
      for (let i = 0; ii > i; ++i) {
        result += partBindings[i].value + staticParts[i + 1];
      }
    }

    const targetObserver = this.targetObserver;
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
    const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (targetObserver.type & AccessorType.Layout) > 0;
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      const task = this.task;
      this.task = this.taskQueue.queueTask(() => {
        this.task = null;
        targetObserver.setValue(result, flags, this.target, this.targetProperty);
      }, queueTaskOptions);
      task?.cancel();
    } else {
      targetObserver.setValue(result, flags, this.target, this.targetProperty);
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }
    this.isBound = true;
    this.$scope = scope;
    const partBindings = this.partBindings;
    for (let i = 0, ii = partBindings.length; ii > i; ++i) {
      partBindings[i].$bind(flags, scope, hostScope);
    }
    this.updateTarget(void 0, flags);
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.$scope = void 0;
    const partBindings = this.partBindings;
    for (let i = 0, ii = partBindings.length; i < ii; ++i) {
      partBindings[i].interceptor.$unbind(flags);
    }
    this.task?.cancel();
    this.task = null;
  }
}

// a pseudo binding, part of a larger interpolation binding
// employed to support full expression per expression part of an interpolation
export interface InterpolationPartBinding extends IConnectableBinding {}

export class InterpolationPartBinding implements InterpolationPartBinding, ICollectionSubscriber {
  public interceptor: this = this;

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = BindingMode.toView;
  public value: unknown = '';
  public $scope?: Scope;
  public $hostScope: Scope | null = null;
  public task: ITask | null = null;
  public isBound: boolean = false;

  public constructor(
    public readonly sourceExpression: IsExpression,
    public readonly target: object,
    public readonly targetProperty: string,
    public readonly locator: IServiceLocator,
    public readonly observerLocator: IObserverLocator,
    public readonly owner: InterpolationBinding,
  ) {

  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    const sourceExpression = this.sourceExpression;
    const obsRecord = this.obs;
    const canOptimize = sourceExpression.$kind === ExpressionKind.AccessScope && obsRecord.count === 1;
    if (!canOptimize) {
      const shouldConnect = (this.mode & toView) > 0;
      if (shouldConnect) {
        obsRecord.version++;
      }
      newValue = sourceExpression.evaluate(flags, this.$scope!, this.$hostScope, this.locator, shouldConnect ? this.interceptor : null);
      if (shouldConnect) {
        obsRecord.clear(false);
      }
    }
    if (newValue != this.value) {
      this.value = newValue;
      if (newValue instanceof Array) {
        this.observeCollection(newValue);
      }
      this.owner.updateTarget(newValue, flags);
    }
  }

  public handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void {
    this.owner.updateTarget(void 0, flags);
  }

  public $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }

    this.isBound = true;
    this.$scope = scope;
    this.$hostScope = hostScope;

    if (this.sourceExpression.hasBind) {
      this.sourceExpression.bind(flags, scope, hostScope, this.interceptor as IIndexable & this);
    }

    const v = this.value = this.sourceExpression.evaluate(
      flags,
      scope,
      hostScope,
      this.locator,
      (this.mode & toView) > 0 ?  this.interceptor : null,
    );
    if (v instanceof Array) {
      this.observeCollection(v);
    }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    if (this.sourceExpression.hasUnbind) {
      this.sourceExpression.unbind(flags, this.$scope!, this.$hostScope, this.interceptor);
    }

    this.$scope = void 0;
    this.$hostScope = null;
    this.obs.clear(true);
  }
}

connectable(InterpolationPartBinding);

export interface ContentBinding extends IConnectableBinding {}

/**
 * A binding for handling the element content interpolation
 */
export class ContentBinding implements ContentBinding, ICollectionSubscriber {
  public interceptor: this = this;

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = BindingMode.toView;
  public value: unknown = '';
  public $scope?: Scope;
  public $hostScope: Scope | null = null;
  public task: ITask | null = null;
  public isBound: boolean = false;

  public constructor(
    public readonly sourceExpression: IsExpression,
    public readonly target: Text,
    public readonly locator: IServiceLocator,
    public readonly observerLocator: IObserverLocator,
    private readonly p: IPlatform,
  ) {

  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    const target = this.target;
    const NodeCtor = this.p.Node;
    const oldValue = this.value;
    this.value = value;
    if (oldValue instanceof NodeCtor) {
      oldValue.parentNode?.removeChild(oldValue);
    }
    if (value instanceof NodeCtor) {
      target.textContent = '';
      target.parentNode?.insertBefore(value, target);
    } else {
      target.textContent = String(value);
    }
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    const sourceExpression = this.sourceExpression;
    const obsRecord = this.obs;
    const canOptimize = sourceExpression.$kind === ExpressionKind.AccessScope && obsRecord.count === 1;
    if (!canOptimize) {
      const shouldConnect = (this.mode & toView) > 0;
      if (shouldConnect) {
        obsRecord.version++;
      }
      newValue = sourceExpression.evaluate(flags, this.$scope!, this.$hostScope, this.locator, shouldConnect ? this.interceptor : null);
      if (shouldConnect) {
        obsRecord.clear(false);
      }
    }
    if (newValue === this.value) {
      // in a frequent update, e.g collection mutation in a loop
      // value could be changing frequently and previous update task may be stale at this point
      // cancel if any task going on because the latest value is already the same
      this.task?.cancel();
      this.task = null;
      return;
    }
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
    const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0;
    if (shouldQueueFlush) {
      this.queueUpdate(newValue, flags);
    } else {
      this.updateTarget(newValue, flags);
    }
  }

  public handleCollectionChange(): void {
    this.queueUpdate(this.value, LifecycleFlags.none);
  }

  public $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }

    this.isBound = true;
    this.$scope = scope;
    this.$hostScope = hostScope;

    if (this.sourceExpression.hasBind) {
      this.sourceExpression.bind(flags, scope, hostScope, this.interceptor as IIndexable & this);
    }

    const v = this.value = this.sourceExpression.evaluate(
      flags,
      scope,
      hostScope,
      this.locator,
      (this.mode & toView) > 0 ?  this.interceptor : null,
    );
    if (v instanceof Array) {
      this.observeCollection(v);
    }
    this.updateTarget(v, flags);
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    if (this.sourceExpression.hasUnbind) {
      this.sourceExpression.unbind(flags, this.$scope!, this.$hostScope, this.interceptor);
    }

    // TODO: should existing value (either connected node, or a string)
    // be removed when this binding is unbound?
    // this.updateTarget('', flags);
    this.$scope = void 0;
    this.$hostScope = null;
    this.obs.clear(true);
    this.task?.cancel();
    this.task = null;
  }

  // queue a force update
  private queueUpdate(newValue: unknown, flags: LifecycleFlags): void {
    const task = this.task;
    this.task = this.p.domWriteQueue.queueTask(() => {
      this.task = null;
      this.updateTarget(newValue, flags);
    }, queueTaskOptions);
    task?.cancel();
  }
}

connectable(ContentBinding);
