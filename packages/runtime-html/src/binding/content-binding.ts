import {
  connectable,
  IAstEvaluator,
} from '@aurelia/runtime';
import { toView } from './interfaces-bindings';
import { type IServiceLocator } from '@aurelia/kernel';
import type {
  ICollectionSubscriber,
  IObserverLocator,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  Scope,
} from '@aurelia/runtime';
import type { IPlatform } from '../platform';
import type { BindingMode, IBinding, IBindingController } from './interfaces-bindings';
import { mixinUseScope, mixingBindingLimited, mixinAstEvaluator, createPrototypeMixer } from './binding-utils';
import { IsExpression } from '@aurelia/expression-parser';
import { bind, handleChange, handleCollectionChange, unbind, updateTarget } from './_lifecycle';

export interface ContentBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {}

/**
 * A binding for handling the element content interpolation
 */

export class ContentBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  /** @internal */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    mixinUseScope(ContentBinding);
    mixingBindingLimited(ContentBinding, () => 'updateTarget');
    connectable(ContentBinding, null!);
    mixinAstEvaluator(ContentBinding);
  });

  public get $kind() { return 'Content' as const; }

  public isBound: boolean = false;

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = toView;

  /** @internal */
  public _scope?: Scope;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public readonly l: IServiceLocator;

  /** @internal */
  public _value: unknown = '';
  /** @internal */
  private readonly _controller: IBindingController;
  /** @internal */
  public _needsRemoveNode: boolean = false;
  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public readonly p: IPlatform,
    public readonly ast: IsExpression,
    public readonly target: Text,
    public strict: boolean,
  ) {
    this.l = locator;
    this._controller = controller;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown): void {
    updateTarget(this, value);
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
