import { isString, type IServiceLocator } from '@aurelia/kernel';
import {
  connectable,
  type IObserverLocator,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  ICollectionSubscriber,
  type IAstEvaluator,
  type Scope,
} from '@aurelia/runtime';
import { createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';

import type { INode } from '../dom';
import type { IBinding, BindingMode, IBindingController } from './interfaces-bindings';
import { ForOfStatement, IsBindingBehavior } from '@aurelia/expression-parser';
import { safeString } from '../utilities';
import { bindingHandleChange, bindingHandleCollectionChange } from './_lifecycle';

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

  public get $kind() { return 'Attribute' as const; }

  public isBound: boolean = false;
  /** @internal */
  public _scope?: Scope = void 0;

  public target: HTMLElement;

  /** @internal */
  public _value: unknown = void 0;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public readonly _controller: IBindingController;

  /** @internal */
  public readonly l: IServiceLocator;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public ast: IsBindingBehavior | ForOfStatement;

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
    public targetProperty: string,
    public mode: BindingMode,
    public strict: boolean,
  ) {
    this.l = locator;
    this.ast = ast;
    this._controller = controller;
    this.target = target as HTMLElement;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown): void {
    console.log('AttributeBinding#updateTarget');
    const { target, targetAttribute, targetProperty } = this;
    switch (targetAttribute) {
      case 'class':
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        target.classList.toggle(targetProperty, !!value);
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
    // TODO: see if we can get rid of this by integrating this call in connectable
    bindingHandleChange(this);
  }

  public handleCollectionChange(): void {
    bindingHandleCollectionChange(this);
  }
}
