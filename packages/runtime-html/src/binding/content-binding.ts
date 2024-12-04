import {
  connectable,
  IAstEvaluator,
  astEvaluate,
  queueTask,
} from '@aurelia/runtime';
import { toView } from './interfaces-bindings';
import { type IServiceLocator, isArray } from '@aurelia/kernel';
import type {
  ICollectionSubscriber,
  IObserverLocator,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  Scope,
} from '@aurelia/runtime';
import type { IPlatform } from '../platform';
import { safeString } from '../utilities';
import type { BindingMode, IBinding, IBindingController } from './interfaces-bindings';
import { mixinUseScope, mixingBindingLimited, mixinAstEvaluator, createPrototypeMixer } from './binding-utils';
import { IsExpression } from '@aurelia/expression-parser';
import { bind, unbind } from './_lifecycle';

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

  /** @internal */
  public _isQueued: boolean = false;

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
    private readonly p: IPlatform,
    public readonly ast: IsExpression,
    public readonly target: Text,
    public strict: boolean,
  ) {
    this.l = locator;
    this._controller = controller;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown): void {
    const target = this.target;
    const oldValue = this._value;
    this._value = value;
    if (this._needsRemoveNode) {
      (oldValue as Node).parentNode?.removeChild(oldValue as Node);
      this._needsRemoveNode = false;
    }
    if (value instanceof this.p.Node) {
      target.parentNode?.insertBefore(value, target);
      value = '';
      this._needsRemoveNode = true;
    }
    // console.log({ value, type: typeof value });
    target.textContent = safeString(value ?? '');
  }

  public handleChange(): void {
    if (!this.isBound) {
      /* istanbul ignore next */
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
    if (newValue === this._value) {
      // in a frequent update, e.g collection mutation in a loop
      // value could be changing frequently and previous update task may be stale at this point
      // cancel if any task going on because the latest value is already the same
      this._isQueued = false;
      return;
    }

    if (!this._isQueued) {
      this._isQueued = true;
      queueTask(() => {
        if (this._isQueued) {
          this._isQueued = false;
          this.updateTarget(newValue);
        }
      });
    }
  }

  public handleCollectionChange(): void {
    if (!this.isBound) {
      /* istanbul-ignore-next */
      return;
    }
    this.obs.version++;
    const v = this._value = astEvaluate(
      this.ast,
      this._scope!,
      this,
      (this.mode & toView) > 0 ? this : null
    );
    this.obs.clear();
    if (isArray(v)) {
      this.observeCollection(v);
    }

    if (!this._isQueued) {
      this._isQueued = true;
      queueTask(() => {
        if (this._isQueued) {
          this._isQueued = false;
          this.updateTarget(v);
        }
      });
    }
  }

  public bind(scope: Scope): void {
    bind(this, scope);
  }

  public unbind(): void {
    unbind(this);
  }
}
