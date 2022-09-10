import { IServiceLocator } from '@aurelia/kernel';
import {
  BindingMode,
  ExpressionKind,
  LifecycleFlags,
  AccessorType,
  IObserver,
} from '@aurelia/runtime';

import { AttributeObserver } from '../observation/element-attribute-observer';
import { IPlatform } from '../platform';
import { connectableBinding, BindingTargetSubscriber } from './binding-utils';

import type {
  ITask,
  QueueTaskOptions,
  TaskQueue,
} from '@aurelia/platform';
import type {
  ForOfStatement,
  IObserverLocator,
  IsBindingBehavior,
  Scope,
} from '@aurelia/runtime';
import type { INode } from '../dom';
import type { IAstBasedBinding } from './interfaces-bindings';

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

const taskOptions: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

export interface AttributeBinding extends IAstBasedBinding {}

/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export class AttributeBinding implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope: Scope = null!;
  public task: ITask | null = null;
  private targetSubscriber: BindingTargetSubscriber | null = null;

  /**
   * Target key. In case Attr has inner structure, such as class -> classList, style -> CSSStyleDeclaration
   */
  public targetObserver!: IObserver;

  public persistentFlags: LifecycleFlags = LifecycleFlags.none;

  public target: Element;
  public value: unknown = void 0;

  /**
   * A semi-private property used by connectable mixin
   */
  public oL: IObserverLocator;

  /** @internal */
  private _isBinding = 0;

  public constructor(
    public locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public taskQueue: TaskQueue,
    public ast: IsBindingBehavior | ForOfStatement,
    target: INode,
    // some attributes may have inner structure
    // such as class -> collection of class names
    // such as style -> collection of style rules
    //
    // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
    public targetAttribute: string,
    public targetProperty: string,
    public mode: BindingMode,
  ) {
    this.target = target as Element;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver.setValue(value, flags, this.target, this.targetProperty);
  }

  public updateSource(value: unknown, _flags: LifecycleFlags): void {
    // flags |= this.persistentFlags;
    this.ast.assign(this.$scope, this, value);
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    flags |= this.persistentFlags;

    const mode = this.mode;
    const interceptor = this.interceptor;
    const ast = this.ast;
    const $scope = this.$scope;
    const targetObserver = this.targetObserver;
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
    const shouldQueueFlush = this._isBinding === 0 && (targetObserver.type & AccessorType.Layout) > 0;
    let shouldConnect: boolean = false;
    let task: ITask | null;
    if (ast.$kind !== ExpressionKind.AccessScope || this.obs.count > 1) {
      shouldConnect = (mode & oneTime) === 0;
      if (shouldConnect) {
        this.obs.version++;
      }
      newValue = ast.evaluate($scope, this, interceptor);
      if (shouldConnect) {
        this.obs.clear();
      }
    }

    if (newValue !== this.value) {
      this.value = newValue;
      if (shouldQueueFlush) {
        // Queue the new one before canceling the old one, to prevent early yield
        task = this.task;
        this.task = this.taskQueue.queueTask(() => {
          this.task = null;
          interceptor.updateTarget(newValue, flags);
        }, taskOptions);
        task?.cancel();
      } else {
        interceptor.updateTarget(newValue, flags);
      }
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    // Store flags which we can only receive during $bind and need to pass on
    // to the AST during evaluate/connect/assign
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;

    this.$scope = scope;
    this._isBinding++;

    let ast = this.ast;
    if (ast.hasBind) {
      ast.bind(flags, scope, this.interceptor);
    }

    let targetObserver = this.targetObserver;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!targetObserver) {
      targetObserver = this.targetObserver = new AttributeObserver(
        this.target as HTMLElement,
        this.targetProperty,
        this.targetAttribute,
      );
    }

    // during bind, binding behavior might have changed ast
    ast = this.ast;
    const $mode = this.mode;
    const interceptor = this.interceptor;
    let shouldConnect: boolean = false;

    if ($mode & toViewOrOneTime) {
      shouldConnect = ($mode & toView) > 0;
      interceptor.updateTarget(
        this.value = ast.evaluate(scope, this, shouldConnect ? interceptor : null),
        flags
      );
    }
    if ($mode & fromView) {
      targetObserver.subscribe(this.targetSubscriber ??= new BindingTargetSubscriber(interceptor));
    }

    this._isBinding++;
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    // clear persistent flags
    this.persistentFlags = LifecycleFlags.none;

    if (this.ast.hasUnbind) {
      this.ast.unbind(flags, this.$scope, this.interceptor);
    }
    this.$scope = null!;
    this.value = void 0;

    if (this.targetSubscriber) {
      this.targetObserver.unsubscribe(this.targetSubscriber);
    }

    this.task?.cancel();
    this.task = null;
    this.obs.clearAll();

    // remove isBound and isUnbinding flags
    this.isBound = false;
  }
}

connectableBinding(true, true)(AttributeBinding);
