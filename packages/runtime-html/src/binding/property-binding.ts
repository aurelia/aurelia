import {
  connectable,
  ISubscriber,
  astAssign,
  IAstEvaluator,
  type Scope,
  type AccessorOrObserver,
  type ICollectionSubscriber,
  type IObserver,
  type IObserverLocator,
  type IObserverLocatorBasedConnectable,
} from '@aurelia/runtime';
import { createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { IBinding, fromView } from './interfaces-bindings';

import type { IServiceLocator } from '@aurelia/kernel';
import type { BindingMode, IBindingController } from './interfaces-bindings';
import { createMappedError, ErrorNames } from '../errors';
import { type IsBindingBehavior, ForOfStatement } from '@aurelia/expression-parser';
import { bindingHandleChange, bindingHandleCollectionChange } from './_lifecycle';

export interface PropertyBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {}

export class PropertyBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  /** @internal */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    mixinUseScope(PropertyBinding);
    mixingBindingLimited(PropertyBinding, (propBinding: PropertyBinding) => (propBinding.mode & fromView) ? 'updateSource' : 'updateTarget');
    connectable(PropertyBinding, null!);
    mixinAstEvaluator(PropertyBinding);
  });

  public get $kind() { return 'Property' as const; }

  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  public _targetObserver?: AccessorOrObserver = void 0;

  /** @internal */
  public _targetSubscriber: ISubscriber | null = null;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public l: IServiceLocator;

  /** @internal */
  private readonly _controller: IBindingController;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public ast: IsBindingBehavior | ForOfStatement,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    public strict: boolean,
  ) {
    this.l = locator;
    this._controller = controller;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown): void {
    console.log('PropertyBinding#updateTarget');
    this._targetObserver!.setValue(value, this.target, this.targetProperty);
  }

  public updateSource(value: unknown): void {
    console.log('PropertyBinding#updateSource');
    astAssign(this.ast, this._scope!, this, value);
  }

  public handleChange(): void {
    // TODO: see if we can get rid of this by integrating this call in connectable
    bindingHandleChange(this);
  }

  public handleCollectionChange(): void {
    bindingHandleCollectionChange(this);
  }

  /**
   * Start using a given observer to listen to changes on the target of this binding
   */
  public useTargetObserver(observer: IObserver): void {
    (this._targetObserver as IObserver)?.unsubscribe(this);
    (this._targetObserver = observer).subscribe(this);
  }

  /**
   * Provide a subscriber for target change observation.
   *
   * Binding behaviors can use this to setup custom observation handling during bind lifecycle
   * to alter the update source behavior during bind phase of this binding.
   */
  public useTargetSubscriber(subscriber: ISubscriber): void {
    if (this._targetSubscriber != null) {
      throw createMappedError(ErrorNames.binding_already_has_target_subscriber);
    }
    this._targetSubscriber = subscriber;
  }
}
