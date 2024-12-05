import { type IServiceLocator } from '@aurelia/kernel';
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
import { $bind, $handleChange, $handleCollectionChange, $unbind, $updateTarget } from './_lifecycle';

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
    $updateTarget(this, value);
  }

  public handleChange(): void {
    $handleChange(this);
  }

  // todo: based off collection and handle update accordingly instead off always start
  public handleCollectionChange(): void {
    $handleCollectionChange(this);
  }

  public bind(scope: Scope): void {
    $bind(this, scope);
  }

  public unbind(): void {
    $unbind(this);
  }
}
