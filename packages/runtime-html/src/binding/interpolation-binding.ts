import {
  AccessorOrObserver,
  AccessorType,
  BindingMode,
  ExpressionKind,
  LifecycleFlags,
  connectable,
} from '@aurelia/runtime';
import { astEvaluator } from './binding-utils';
import { State } from '../templating/controller';

import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type {
  ICollectionSubscriber,
  IndexMap,
  Interpolation,
  IObserverLocator,
  IsExpression,
  IBinding,
  Scope,
} from '@aurelia/runtime';
import type { IPlatform } from '../platform';
import type { IAstBasedBinding, IBindingController } from './interfaces-bindings';

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
export interface InterpolationBinding extends IBinding {}
export class InterpolationBinding implements IBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;

  public partBindings: InterpolationPartBinding[];

  private readonly targetObserver: AccessorOrObserver;
  private task: ITask | null = null;

  /**
   * A semi-private property used by connectable mixin
   */
  public readonly oL: IObserverLocator;
  /** @internal */
  private readonly _controller: IBindingController;

  public constructor(
    controller: IBindingController,
    public locator: IServiceLocator,
    observerLocator: IObserverLocator,
    private readonly taskQueue: TaskQueue,
    public ast: Interpolation,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
  ) {
    this._controller = controller;
    this.oL = observerLocator;
    this.targetObserver = observerLocator.getAccessor(target, targetProperty);
    const expressions = ast.expressions;
    const partBindings = this.partBindings = Array(expressions.length);
    const ii = expressions.length;
    let i = 0;
    for (; ii > i; ++i) {
      partBindings[i] = new InterpolationPartBinding(expressions[i], target, targetProperty, locator, observerLocator, this);
    }
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    const partBindings = this.partBindings;
    const staticParts = this.ast.parts;
    const ii = partBindings.length;
    let result = '';
    let i = 0;
    if (ii === 1) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      result = staticParts[0] + partBindings[0].value + staticParts[1];
    } else {
      result = staticParts[0];
      for (; ii > i; ++i) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        result += partBindings[i].value + staticParts[i + 1];
      }
    }

    const targetObserver = this.targetObserver;
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
    const shouldQueueFlush = this._controller.state !== State.activating && (targetObserver.type & AccessorType.Layout) > 0;
    let task: ITask | null;
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this.task;
      this.task = this.taskQueue.queueTask(() => {
        this.task = null;
        targetObserver.setValue(result, flags, this.target, this.targetProperty);
      }, queueTaskOptions);
      task?.cancel();
      task = null;
    } else {
      targetObserver.setValue(result, flags, this.target, this.targetProperty);
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }
    this.isBound = true;
    this.$scope = scope;

    const partBindings = this.partBindings;
    const ii = partBindings.length;
    let i = 0;
    for (; ii > i; ++i) {
      partBindings[i].$bind(flags, scope);
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
    const ii = partBindings.length;
    let i = 0;
    for (; ii > i; ++i) {
      partBindings[i].interceptor.$unbind(flags);
    }
    this.task?.cancel();
    this.task = null;
  }
}
astEvaluator(true)(InterpolationBinding);

// a pseudo binding, part of a larger interpolation binding
// employed to support full expression per expression part of an interpolation
export interface InterpolationPartBinding extends IAstBasedBinding {}

export class InterpolationPartBinding implements IAstBasedBinding, ICollectionSubscriber {
  public interceptor: this = this;

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = BindingMode.toView;
  public value: unknown = '';
  public $scope?: Scope;
  public task: ITask | null = null;
  public isBound: boolean = false;

  /**
   * A semi-private property used by connectable mixin
   */
  public readonly oL: IObserverLocator;

  public constructor(
    public readonly ast: IsExpression,
    public readonly target: object,
    public readonly targetProperty: string,
    public readonly locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public readonly owner: InterpolationBinding,
  ) {
    this.oL = observerLocator;
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    const ast = this.ast;
    const obsRecord = this.obs;
    const canOptimize = ast.$kind === ExpressionKind.AccessScope && obsRecord.count === 1;
    let shouldConnect: boolean = false;
    if (!canOptimize) {
      shouldConnect = (this.mode & toView) > 0;
      if (shouldConnect) {
        obsRecord.version++;
      }
      newValue = ast.evaluate(this.$scope!, this, shouldConnect ? this.interceptor : null);
      if (shouldConnect) {
        obsRecord.clear();
      }
    }
    // todo(!=): maybe should do strict comparison?
    // eslint-disable-next-line eqeqeq
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

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }

    this.isBound = true;
    this.$scope = scope;

    if (this.ast.hasBind) {
      this.ast.bind(flags, scope, this.interceptor as IIndexable & this);
    }

    this.value = this.ast.evaluate(
      scope,
      this,
      (this.mode & toView) > 0 ?  this.interceptor : null,
    );
    if (this.value instanceof Array) {
      this.observeCollection(this.value);
    }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    if (this.ast.hasUnbind) {
      this.ast.unbind(flags, this.$scope!, this.interceptor);
    }

    this.$scope = void 0;
    this.obs.clearAll();
  }
}

connectable(InterpolationPartBinding);
astEvaluator(true)(InterpolationPartBinding);

export interface ContentBinding extends IAstBasedBinding {}

/**
 * A binding for handling the element content interpolation
 */
export class ContentBinding implements IAstBasedBinding, ICollectionSubscriber {
  public interceptor: this = this;

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = BindingMode.toView;
  public value: unknown = '';
  public $scope?: Scope;
  public task: ITask | null = null;
  public isBound: boolean = false;

  /** @internal */
  private _isBinding = 0;

  /**
   * A semi-private property used by connectable mixin
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  private readonly _controller: IBindingController;

  public constructor(
    controller: IBindingController,
    public readonly locator: IServiceLocator,
    observerLocator: IObserverLocator,
    private readonly taskQueue: TaskQueue,
    private readonly p: IPlatform,
    public readonly ast: IsExpression,
    public readonly target: Text,
    public readonly strict: boolean,
  ) {
    this._controller = controller;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown, _flags: LifecycleFlags): void {
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
    const ast = this.ast;
    const obsRecord = this.obs;
    const canOptimize = ast.$kind === ExpressionKind.AccessScope && obsRecord.count === 1;
    let shouldConnect: boolean = false;
    if (!canOptimize) {
      shouldConnect = (this.mode & toView) > 0;
      if (shouldConnect) {
        obsRecord.version++;
      }
      flags |= this.strict ? LifecycleFlags.isStrictBindingStrategy : 0;
      newValue = ast.evaluate(this.$scope!, this, shouldConnect ? this.interceptor : null);
      if (shouldConnect) {
        obsRecord.clear();
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
    const shouldQueueFlush = this._controller.state !== State.activating;
    if (shouldQueueFlush) {
      this.queueUpdate(newValue, flags);
    } else {
      this.updateTarget(newValue, flags);
    }
  }

  public handleCollectionChange(): void {
    if (!this.isBound) {
      return;
    }
    this.obs.version++;
    const v = this.value = this.ast.evaluate(
      this.$scope!,
      this,
      (this.mode & toView) > 0 ?  this.interceptor : null,
    );
    this.obs.clear();
    if (v instanceof Array) {
      this.observeCollection(v);
    }
    const shouldQueueFlush = this._isBinding === 0;
    if (shouldQueueFlush) {
      this.queueUpdate(v, LifecycleFlags.none);
    } else {
      this.updateTarget(v, LifecycleFlags.none);
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }

    this.isBound = true;
    this.$scope = scope;
    this._isBinding++;

    if (this.ast.hasBind) {
      this.ast.bind(flags, scope, this.interceptor as IIndexable & this);
    }

    flags |= this.strict ? LifecycleFlags.isStrictBindingStrategy : 0;

    const v = this.value = this.ast.evaluate(
      scope,
      this,
      (this.mode & toView) > 0 ?  this.interceptor : null,
    );
    if (v instanceof Array) {
      this.observeCollection(v);
    }
    this.updateTarget(v, flags);
    this._isBinding--;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    if (this.ast.hasUnbind) {
      this.ast.unbind(flags, this.$scope!, this.interceptor);
    }

    // TODO: should existing value (either connected node, or a string)
    // be removed when this binding is unbound?
    // this.updateTarget('', flags);
    this.$scope = void 0;
    this.obs.clearAll();
    this.task?.cancel();
    this.task = null;
  }

  // queue a force update
  private queueUpdate(newValue: unknown, flags: LifecycleFlags): void {
    const task = this.task;
    this.task = this.taskQueue.queueTask(() => {
      this.task = null;
      this.updateTarget(newValue, flags);
    }, queueTaskOptions);
    task?.cancel();
  }
}

connectable()(ContentBinding);
astEvaluator(void 0, false)(ContentBinding);
