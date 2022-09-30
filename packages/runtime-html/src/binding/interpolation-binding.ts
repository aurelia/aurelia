import {
  AccessorOrObserver,
  AccessorType,
  astBind,
  astEvaluate,
  astUnbind,
  connectable
} from '@aurelia/runtime';
import { State } from '../templating/controller';
import { implementAstEvaluator, mixinBindingUseScope, mixingBindingLimited } from './binding-utils';
import { BindingMode } from './interfaces-bindings';

import type { IServiceLocator } from '@aurelia/kernel';
import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type {
  IBinding, ICollectionSubscriber,
  Interpolation,
  IObserverLocator,
  IsExpression, Scope
} from '@aurelia/runtime';
import type { IPlatform } from '../platform';
import { isArray } from '../utilities';
import type { IAstBasedBinding, IBindingController } from './interfaces-bindings';

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

  public isBound: boolean = false;
  public scope?: Scope = void 0;

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

  /** @internal */
  public _handlePartChange() {
    this.updateTarget();
  }

  public updateTarget(): void {
    const partBindings = this.partBindings;
    const staticParts = this.ast.parts;
    const ii = partBindings.length;
    let result = '';
    let i = 0;
    if (ii === 1) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      result = staticParts[0] + partBindings[0]._value + staticParts[1];
    } else {
      result = staticParts[0];
      for (; ii > i; ++i) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        result += partBindings[i]._value + staticParts[i + 1];
      }
    }

    const targetObserver = this.targetObserver;
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
    const shouldQueueFlush = this._controller.state !== State.activating && (targetObserver.type & AccessorType.Layout) > 0;
    let task: ITask | null;
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this.task;
      this.task = this.taskQueue.queueTask(() => {
        this.task = null;
        targetObserver.setValue(result, this.target, this.targetProperty);
      }, queueTaskOptions);
      task?.cancel();
      task = null;
    } else {
      targetObserver.setValue(result, this.target, this.targetProperty);
    }
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.scope === scope) {
        return;
      }
      this.$unbind();
    }
    this.scope = scope;

    const partBindings = this.partBindings;
    const ii = partBindings.length;
    let i = 0;
    for (; ii > i; ++i) {
      partBindings[i].$bind(scope);
    }
    this.updateTarget();
    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.scope = void 0;
    const partBindings = this.partBindings;
    const ii = partBindings.length;
    let i = 0;
    for (; ii > i; ++i) {
      partBindings[i].$unbind();
    }
    this.task?.cancel();
    this.task = null;
  }
}
implementAstEvaluator(true)(InterpolationBinding);

// a pseudo binding, part of a larger interpolation binding
// employed to support full expression per expression part of an interpolation
export interface InterpolationPartBinding extends IAstBasedBinding {}

export class InterpolationPartBinding implements IAstBasedBinding, ICollectionSubscriber {

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = BindingMode.toView;
  public scope?: Scope;
  public task: ITask | null = null;
  public isBound: boolean = false;

  /** @internal */
  public _value: unknown = '';
  /**
   * A semi-private property used by connectable mixin
   */
  public readonly oL: IObserverLocator;
  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

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

  public updateTarget() {
    this.owner._handlePartChange();
  }

  public handleChange(): void {
    if (!this.isBound) {
      return;
    }
    const obsRecord = this.obs;
    let shouldConnect: boolean = false;
    shouldConnect = (this.mode & BindingMode.toView) > 0;
    if (shouldConnect) {
      obsRecord.version++;
    }
    const newValue = astEvaluate(this.ast, this.scope!, this, shouldConnect ? this : null);
    if (shouldConnect) {
      obsRecord.clear();
    }
    // todo(!=): maybe should do strict comparison?
    // eslint-disable-next-line eqeqeq
    if (newValue != this._value) {
      this._value = newValue;
      if (isArray(newValue)) {
        this.observeCollection(newValue);
      }
      this.updateTarget();
    }
  }

  public handleCollectionChange(): void {
    this.handleChange();
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.scope === scope) {
        return;
      }
      this.$unbind();
    }
    this.scope = scope;

    astBind(this.ast, scope, this);

    this._value = astEvaluate(
      this.ast,
      this.scope,
      this,
      (this.mode & BindingMode.toView) > 0 ?  this : null,
    );
    if (isArray(this._value)) {
      this.observeCollection(this._value);
    }

    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this.scope!, this);

    this.scope = void 0;
    this.obs.clearAll();
  }
}

mixinBindingUseScope(InterpolationPartBinding);
mixingBindingLimited(InterpolationPartBinding, () => 'updateTarget');
connectable(InterpolationPartBinding);
implementAstEvaluator(true)(InterpolationPartBinding);

export interface ContentBinding extends IAstBasedBinding {}

/**
 * A binding for handling the element content interpolation
 */
export class ContentBinding implements IAstBasedBinding, ICollectionSubscriber {
  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = BindingMode.toView;
  public scope?: Scope;
  public task: ITask | null = null;
  public isBound: boolean = false;

  /**
   * A semi-private property used by connectable mixin
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  private _value: unknown = '';
  /** @internal */
  private readonly _controller: IBindingController;
  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

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

  public updateTarget(value: unknown): void {
    const target = this.target;
    const NodeCtor = this.p.Node;
    const oldValue = this._value;
    this._value = value;
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

  public handleChange(): void {
    if (!this.isBound) {
      return;
    }
    const shouldConnect = (this.mode & BindingMode.toView) > 0;
    if (shouldConnect) {
      this.obs.version++;
    }
    const newValue = astEvaluate(this.ast, this.scope!, this, shouldConnect ? this : null);
    if (shouldConnect) {
      this.obs.clear();
    }
    if (newValue === this._value) {
      // in a frequent update, e.g collection mutation in a loop
      // value could be changing frequently and previous update task may be stale at this point
      // cancel if any task going on because the latest value is already the same
      this.task?.cancel();
      this.task = null;
      return;
    }
    const shouldQueueFlush = this._controller.state !== State.activating;
    if (shouldQueueFlush) {
      this._queueUpdate(newValue);
    } else {
      this.updateTarget(newValue);
    }
  }

  public handleCollectionChange(): void {
    if (!this.isBound) {
      return;
    }
    this.obs.version++;
    const v = this._value = astEvaluate(
      this.ast,
      this.scope!,
      this,
      (this.mode & BindingMode.toView) > 0 ?  this : null,
    );
    this.obs.clear();
    if (isArray(v)) {
      this.observeCollection(v);
    }
    const shouldQueueFlush = this._controller.state !== State.activating;
    if (shouldQueueFlush) {
      this._queueUpdate(v);
    } else {
      this.updateTarget(v);
    }
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.scope === scope) {
        return;
      }
      this.$unbind();
    }
    this.scope = scope;

    astBind(this.ast, scope, this);

    const v = this._value = astEvaluate(
      this.ast,
      this.scope,
      this,
      (this.mode & BindingMode.toView) > 0 ?  this : null,
    );
    if (isArray(v)) {
      this.observeCollection(v);
    }
    this.updateTarget(v);

    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this.scope!, this);

    // TODO: should existing value (either connected node, or a string)
    // be removed when this binding is unbound?
    // this.updateTarget('', flags);
    this.scope = void 0;
    this.obs.clearAll();
    this.task?.cancel();
    this.task = null;
  }

  // queue a force update
  /** @internal */
  private _queueUpdate(newValue: unknown): void {
    const task = this.task;
    this.task = this.taskQueue.queueTask(() => {
      this.task = null;
      this.updateTarget(newValue);
    }, queueTaskOptions);
    task?.cancel();
  }
}

mixinBindingUseScope(ContentBinding);
mixingBindingLimited(ContentBinding, () => 'updateTarget');
connectable()(ContentBinding);
implementAstEvaluator(void 0, false)(ContentBinding);
