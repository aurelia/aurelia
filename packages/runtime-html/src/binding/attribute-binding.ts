import { type IServiceLocator, isString } from '@aurelia/kernel';
import {
  connectable,
  type IObserverLocator,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  ICollectionSubscriber,
  astBind,
  astEvaluate,
  astUnbind,
  type IAstEvaluator,
  type Scope,
  queueTask,
} from '@aurelia/runtime';
import { createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { oneTime, toView } from './interfaces-bindings';

import type { INode } from '../dom.node';
import type { IBinding, BindingMode, IBindingController } from './interfaces-bindings';
import { safeString } from '../utilities';
import { ForOfStatement, IsBindingBehavior } from '@aurelia/expression-parser';

// the 2 interfaces implemented come from mixin
export interface AttributeBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {}

/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export class AttributeBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  /** @internal */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
      mixinUseScope(AttributeBinding);
      mixingBindingLimited(AttributeBinding, () => 'updateTarget');
      connectable(AttributeBinding, null!);
      mixinAstEvaluator(AttributeBinding);
  });

  /** @internal */
  private static readonly _splitString: Map<string, string[]> = new Map();

  public isBound: boolean = false;
  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  private _isQueued: boolean = false;

  public target: HTMLElement;

  /** @internal */
  private _value: unknown = void 0;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  private readonly _controller: IBindingController;

  /** @internal */
  public readonly l: IServiceLocator;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public ast: IsBindingBehavior | ForOfStatement;

  /** @internal */
  private readonly _isMulti: boolean = false;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    ast: IsBindingBehavior | ForOfStatement,
    target: INode,
    // some attributes may have inner structure
    // such as class -> collection of class names
    // such as style -> collection of style rules
    //
    // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
    public targetAttribute: string,
    // is the classes to be toggled
    public targetProperty: string,
    public mode: BindingMode,
    public strict: boolean,
  ) {
    this.l = locator;
    this.ast = ast;
    this._controller = controller;
    this.target = target as HTMLElement;
    this.oL = observerLocator;
    // eslint-disable-next-line @typescript-eslint/prefer-includes
    if ((this._isMulti = targetProperty.indexOf(' ') > -1)
      && !AttributeBinding._splitString.has(targetProperty)
    ) {
      // split the string once and cache it
      AttributeBinding._splitString.set(targetProperty, targetProperty.split(' '));
    }
  }

  public updateTarget(value: unknown): void {
    const target = this.target;
    const targetAttribute = this.targetAttribute;
    const targetProperty = this.targetProperty;
    switch (targetAttribute) {
      case 'class':
        if (this._isMulti) {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          const force = !!value;
          for (const cls of AttributeBinding._splitString.get(targetProperty)!) {
            target.classList.toggle(cls, force);
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          target.classList.toggle(targetProperty, !!value);
        }
        break;
      case 'style': {
        let priority = '';
        let newValue = safeString(value);
        if (isString(newValue) && newValue.includes('!important')) {
          priority = 'important';
          newValue = newValue.replace('!important', '');
        }
        target.style.setProperty(targetProperty, newValue, priority);
        break;
      }
      default: {
        if (value == null) {
          target.removeAttribute(targetAttribute);
        } else {
          target.setAttribute(targetAttribute, safeString(value));
        }
      }
    }
  }

  public handleChange(): void {
    if (!this.isBound) return;
    if (this._isQueued) return;
    this._isQueued = true;

    queueTask(() => {
      this._isQueued = false;
      if (!this.isBound) return;

      this.obs.version++;
      const newValue = astEvaluate(this.ast, this._scope!, this, (this.mode & toView) > 0 ? this : null);
      this.obs.clear();

      if (newValue !== this._value) {
        this._value = newValue;
        this.updateTarget(newValue);
      }
    });
  }

  // todo: based off collection and handle update accordingly instead off always start
  public handleCollectionChange(): void {
    this.handleChange();
  }

  public bind(scope: Scope): void {
    if (this.isBound) {
      if (this._scope === scope) return;
      this.unbind();
    }
    this._scope = scope;

    astBind(this.ast, scope, this);

    if (this.mode & (toView | oneTime)) {
      this.updateTarget(
        this._value = astEvaluate(this.ast, scope, this, (this.mode & toView) > 0 ? this : null)
      );
    }

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) return;
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this._value = void 0;
    this.obs.clearAll();
  }
}
