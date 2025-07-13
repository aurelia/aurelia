import {
  connectable,
  ISubscriber,
  astAssign,
  astBind,
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
import { BindingTargetSubscriber, IFlushQueue, createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { IBinding, fromView, oneTime, toView } from './interfaces-bindings';

import type { IServiceLocator } from '@aurelia/kernel';
import type { BindingMode, IBindingController } from './interfaces-bindings';
import { createMappedError, ErrorNames } from '../errors';
import { atLayout } from '../utilities';
import { type IsBindingBehavior, ForOfStatement } from '@aurelia/expression-parser';
import { activating } from '../templating/controller';

export interface PropertyBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {}

export class PropertyBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  /** @internal */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    mixinUseScope(PropertyBinding);
    mixingBindingLimited(PropertyBinding, (propBinding: PropertyBinding) => (propBinding.mode & fromView) ? 'updateSource' : 'updateTarget');
    connectable(PropertyBinding, null!);
    mixinAstEvaluator(PropertyBinding);
  });

  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  private _targetObserver?: AccessorOrObserver = void 0;

  /** @internal */
  private _isQueued: boolean = false;

  /** @internal */
  private _targetSubscriber: ISubscriber | null = null;

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
    astAssign(this.ast, this._scope!, this, null, value);
  }

  public handleChange(): void {
    if (!this.isBound) return;

    const shouldQueue = this._controller.state !== activating && (this._targetObserver!.type & atLayout) > 0;
    if (shouldQueue) {
      if (this._isQueued) return;
      this._isQueued = true;

      queueTask(() => {
        this._isQueued = false;
        if (!this.isBound) return;

        this._handleChange();
      });
    } else {
      this._handleChange();
    }
  }

  /** @internal */
  private _handleChange() {
    this.obs.version++;
    const newValue = astEvaluate(this.ast, this._scope!, this, (this.mode & toView) > 0 ? this : null);
    this.obs.clear();

    this.updateTarget(newValue);
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

    const observerLocator = this.oL;
    const $mode = this.mode;
    let targetObserver = this._targetObserver;
    if (!targetObserver) {
      if ($mode & fromView) {
        targetObserver = observerLocator.getObserver(this.target, this.targetProperty);
      } else {
        targetObserver = observerLocator.getAccessor(this.target, this.targetProperty);
      }
      this._targetObserver = targetObserver;
    }

    const shouldConnect = ($mode & toView) > 0;

    if ($mode & (toView | oneTime)) {
      this.updateTarget(
        astEvaluate(this.ast, this._scope, this, shouldConnect ? this : null),
      );
    }

    if ($mode & fromView) {
      (targetObserver as IObserver).subscribe(this._targetSubscriber ??= new BindingTargetSubscriber(this, this.l.get(IFlushQueue)));
      if (!shouldConnect) {
        this.updateSource(targetObserver.getValue(this.target, this.targetProperty));
      }
    }

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) return;
    this.isBound = false;

    if (this._targetSubscriber) {
      (this._targetObserver as IObserver).unsubscribe(this._targetSubscriber);
      this._targetSubscriber = null;
    }

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;

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
