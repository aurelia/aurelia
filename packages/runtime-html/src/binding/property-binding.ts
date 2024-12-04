import {
  connectable,
  ISubscriber,
  astAssign,
  astEvaluate,
  astUnbind,
  IAstEvaluator,
  type Scope,
  type AccessorOrObserver,
  type ICollectionSubscriber,
  type IObserver,
  type IObserverLocator,
  type IObserverLocatorBasedConnectable,
  queueTask,
} from '@aurelia/runtime';
import { createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { IBinding, fromView, toView } from './interfaces-bindings';

import type { IServiceLocator } from '@aurelia/kernel';
import type { BindingMode, IBindingController } from './interfaces-bindings';
import { createMappedError, ErrorNames } from '../errors';
import { type IsBindingBehavior, ForOfStatement } from '@aurelia/expression-parser';
import { bind } from './_lifecycle';

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
  private _isQueued: boolean = false;

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
    this._targetObserver!.setValue(value, this.target, this.targetProperty);
  }

  public updateSource(value: unknown): void {
    astAssign(this.ast, this._scope!, this, value);
  }

  public handleChange(): void {
    if (!this.isBound) {
      /* istanbul-ignore-next */
      return;
    }

    if (!this._isQueued) {
      this._isQueued = true;
      queueTask(() => {
        this._flush();
      });
    }
  }

  private _flush() {
    if (!this._isQueued) {
      return;
    }

    this._isQueued = false;

    this.obs.version++;
    const newValue = astEvaluate(
      this.ast,
      this._scope!,
      this,
      // should observe?
      (this.mode & toView) > 0 ? this : null
    );
    this.obs.clear();

    this.updateTarget(newValue);
  }

  // todo: based off collection and handle update accordingly instead off always start
  public handleCollectionChange(): void {
    this.handleChange();
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

    if (this._targetSubscriber) {
      (this._targetObserver as IObserver).unsubscribe(this._targetSubscriber);
      this._targetSubscriber = null;
    }
    this._isQueued = false;
    this.obs.clearAll();
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
