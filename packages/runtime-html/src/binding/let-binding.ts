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
import { bind, handleChange, handleCollectionChange, unbind, updateTarget } from './_lifecycle';
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

  /** @internal */
  public _value: unknown;

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

  public updateTarget() {
    updateTarget(this, void 0);
  }

  public handleChange(): void {
    handleChange(this);
  }

  public handleCollectionChange(): void {
    handleCollectionChange(this);
  }

  public bind(scope: Scope): void {
    bind(this, scope);
  }

  public unbind(): void {
    unbind(this);
  }
}
