import {
  ICollectionSubscriber,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  connectable,
  type IObservable,
  type IObserverLocator,
  type Scope,
  type IAstEvaluator,
} from '@aurelia/runtime';
import { createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';

import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IsExpression } from '@aurelia/expression-parser';
import { BindingMode, IBinding } from './interfaces-bindings';
import { bindingHandleChange, bindingHandleCollectionChange } from './_lifecycle';
export interface LetBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {}

export class LetBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  /**
   * The renderer can call this method to prepare the prototype,
   * so that it can be effectively tree shaken before decorator can be officially applied with tree shaking.
   * @internal
   */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    mixinUseScope(LetBinding);
    mixingBindingLimited(LetBinding, () => 'updateTarget');
    connectable(LetBinding, null!);
    mixinAstEvaluator(LetBinding);
  });

  public get $kind() { return 'Let' as const; }

  public isBound: boolean = false;
  public mode: BindingMode = BindingMode.toView;

  /** @internal */
  public _scope?: Scope = void 0;

  public target: (IObservable & IIndexable) | null = null;
  /** @internal */
  public readonly _toBindingContext: boolean;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public l: IServiceLocator;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public strict: boolean;

  public constructor(
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public ast: IsExpression,
    public targetProperty: string,
    toBindingContext: boolean,
    strict: boolean,
  ) {
    this.l = locator;
    this.oL = observerLocator;
    this.strict = strict;
    this._toBindingContext = toBindingContext;
  }

  public updateTarget(newValue: unknown): void {
    this.target![this.targetProperty] = newValue;
  }

  public handleChange(): void {
    // TODO: see if we can get rid of this by integrating this call in connectable
    bindingHandleChange(this);
  }

  public handleCollectionChange(): void {
    bindingHandleCollectionChange(this);
  }
}
