import { type IServiceLocator, isArray } from '@aurelia/kernel';
import {
  connectable,
  astBind,
  astEvaluate,
  astUnbind,
  IAstEvaluator,
  queueTask,
} from '@aurelia/runtime';
import { createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { toView } from './interfaces-bindings';

import type {
  AccessorOrObserver,
  IAccessor,
  ICollectionSubscriber,
  IObserverLocator,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  Scope,
} from '@aurelia/runtime';
import type { IBinding, BindingMode, IBindingController } from './interfaces-bindings';
import { type Interpolation, IsExpression } from '@aurelia/expression-parser';
import { activating } from '../templating/controller';
import { atLayout } from '../utilities';

// a pseudo binding to manage multiple InterpolationBinding s
// ========
// Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
// value converters and binding behaviors.
// Each expression represents one ${interpolation}, and for each we create a child InterpolationPartBinding

export interface InterpolationBinding extends IObserverLocatorBasedConnectable, IAstEvaluator, IServiceLocator {}
export class InterpolationBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  private _isQueued: boolean = false;

  public partBindings: InterpolationPartBinding[];

  /** @internal */
  public _targetObserver: AccessorOrObserver;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  private readonly _controller: IBindingController;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public ast: Interpolation,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    public strict: boolean,
  ) {
    this._controller = controller;
    this.oL = observerLocator;
    this._targetObserver = observerLocator.getAccessor(target, targetProperty);
    const expressions = ast.expressions;
    const partBindings = this.partBindings = Array(expressions.length);
    const ii = expressions.length;
    let i = 0;
    for (; ii > i; ++i) {
      partBindings[i] = new InterpolationPartBinding(expressions[i], target, targetProperty, locator, observerLocator, strict, this);
    }
  }

  /** @internal */
  public _handlePartChange() {
    if (!this.isBound) return;

    const shouldQueue = this._controller.state !== activating && (this._targetObserver.type & atLayout) > 0;

    if (shouldQueue) {
      if (this._isQueued) return;
      this._isQueued = true;

      queueTask(() => {
        this._isQueued = false;
        if (!this.isBound) return;

        this.updateTarget();
      });
    } else {
      this.updateTarget();
    }
  }

  public updateTarget(): void {
    const partBindings = this.partBindings;
    const ast = this.ast;
    const target = this.target;
    const targetProperty = this.targetProperty;
    const staticParts = ast.parts;
    const ii = partBindings.length;
    let result = '';
    let i = 0;
    if (ii === 1) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      result = staticParts[0] + partBindings[0]._evaluate() + staticParts[1];
    } else {
      result = staticParts[0];
      for (; ii > i; ++i) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        result += partBindings[i]._evaluate() + staticParts[i + 1];
      }
    }

    this._targetObserver.setValue(result, target, targetProperty);
  }

  public bind(scope: Scope): void {
    if (this.isBound) {
      if (this._scope === scope) return;
      this.unbind();
    }
    this._scope = scope;

    const partBindings = this.partBindings;
    const ii = partBindings.length;
    let i = 0;
    for (; ii > i; ++i) {
      partBindings[i].bind(scope);
    }
    this.updateTarget();
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) return;
    this.isBound = false;
    this._scope = void 0;
    const partBindings = this.partBindings;
    const ii = partBindings.length;
    let i = 0;
    for (; ii > i; ++i) {
      partBindings[i].unbind();
    }
  }

  /**
   * Start using a given observer to update the target
   */
  public useAccessor(accessor: IAccessor): void {
    this._targetObserver = accessor;
  }
}

// a pseudo binding, part of a larger interpolation binding
// employed to support full expression per expression part of an interpolation
export interface InterpolationPartBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {}

export class InterpolationPartBinding implements IBinding, ICollectionSubscriber {
  /** @internal */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    mixinUseScope(InterpolationPartBinding);
    mixingBindingLimited(InterpolationPartBinding, () => 'updateTarget');
    connectable(InterpolationPartBinding, null!);
    mixinAstEvaluator(InterpolationPartBinding);
  });

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = toView;
  public _scope?: Scope;
  public isBound: boolean = false;

  /** @internal */
  public _value: unknown = '';
  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public readonly l: IServiceLocator;
  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  /** @internal */
  private _isDirty = false;

  public constructor(
    public readonly ast: IsExpression,
    public readonly target: object,
    public readonly targetProperty: string,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public strict: boolean,
    public readonly owner: InterpolationBinding,
  ) {
    this.l = locator;
    this.oL = observerLocator;
  }

  public updateTarget() {
    this.owner._handlePartChange();
  }

  public handleChange(): void {
    if (!this.isBound) return;
    this._isDirty = true;
    this.updateTarget();
  }

  public handleCollectionChange(): void {
    if (!this.isBound) return;
    this._isDirty = true;
    this.updateTarget();
  }

  /** @internal */
  public _evaluate() {
    if (!this._isDirty) return this._value;

    this.obs.version++;
    const newValue = astEvaluate(this.ast, this._scope!, this, (this.mode & toView) > 0 ? this : null);
    this.obs.clear();

    // unlike handleChange, this is always called
    this._value = newValue;
    if (isArray(newValue)) {
      this.observeCollection(newValue);
    }

    this._isDirty = false;
    return this._value;
  }

  public bind(scope: Scope): void {
    if (this.isBound) {
      if (this._scope === scope) return;
      this.unbind();
    }
    this._scope = scope;

    astBind(this.ast, scope, this);

    this._value = astEvaluate(this.ast, this._scope, this, (this.mode & toView) > 0 ?  this : null);
    if (isArray(this._value)) {
      this.observeCollection(this._value);
    }

    this._isDirty = false;
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) return;
    this.isBound = false;
    this._value = void 0;
    this._isDirty = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this.obs.clearAll();
  }
}
