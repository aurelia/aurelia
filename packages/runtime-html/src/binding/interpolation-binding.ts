import { type IServiceLocator, isArray } from '@aurelia/kernel';
import {
  connectable,
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
import { bind } from './_lifecycle';

// a pseudo binding to manage multiple InterpolationBinding s
// ========
// Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
// value converters and binding behaviors.
// Each expression represents one ${interpolation}, and for each we create a child InterpolationPartBinding

export interface InterpolationBinding extends IObserverLocatorBasedConnectable, IAstEvaluator, IServiceLocator {}
export class InterpolationBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  public get $kind() { return 'Interpolation' as const; }

  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope = void 0;

  public partBindings: InterpolationPartBinding[];

  /** @internal */
  private _targetObserver: AccessorOrObserver;

  /** @internal */
  private _isQueued: boolean = false;

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

    const targetObserver = this._targetObserver;

    if (!this._isQueued) {
      this._isQueued = true;
      queueTask(() => {
        if (this._isQueued) {
          this._isQueued = false;
          targetObserver.setValue(result, this.target, this.targetProperty);
        }
      });
    }
  }

  public bind(scope: Scope): void {
    bind(this, scope);
  }

  public unbind(): void {
    if (!this.isBound) {
        /* istanbul-ignore-next */
      return;
    }
    this.isBound = false;
    this._scope = void 0;
    const partBindings = this.partBindings;
    const ii = partBindings.length;
    let i = 0;
    for (; ii > i; ++i) {
      partBindings[i].unbind();
    }
    this._isQueued = false;
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

  public get $kind() { return 'InterpolationPart' as const; }

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
  private _isQueued: boolean = false;

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
    if (!this.isBound) {
        /* istanbul-ignore-next */
      return;
    }
    this.obs.version++;
    const newValue = astEvaluate(
      this.ast,
      this._scope!,
      this,
      // should observe?
      (this.mode & toView) > 0 ? this : null
    );
    this.obs.clear();
    // todo(!=): maybe should do strict comparison?
    // eslint-disable-next-line eqeqeq
    if (newValue != this._value) {
      this._value = newValue;
      if (isArray(newValue)) {
        this.observeCollection(newValue);
      }
      if (!this._isQueued) {
        this._isQueued = true;
        queueTask(() => {
          if (this._isQueued) {
            this._isQueued = false;
            this.updateTarget();
          }
        });
      }
    }
  }

  public handleCollectionChange(): void {
    this.updateTarget();
  }

  public bind(scope: Scope): void {
    bind(this, scope);
  }

  public unbind(): void {
    if (!this.isBound) {
        /* istanbul-ignore-next */
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this.obs.clearAll();
    this._isQueued = false;
  }
}
