import {
  AccessorType, astBind, astEvaluate, astUnbind, connectable, type IBinding,  IObserver, IAstEvaluator, IConnectableBinding
} from '@aurelia/runtime';

import { AttributeObserver } from '../observation/element-attribute-observer';
import { State } from '../templating/controller';
import { mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { BindingMode } from './interfaces-bindings';

import type {
  ITask,
  QueueTaskOptions,
  TaskQueue
} from '@aurelia/platform';
import type { IServiceLocator } from '@aurelia/kernel';
import type {
  ForOfStatement,
  IObserverLocator,
  IsBindingBehavior,
  Scope
} from '@aurelia/runtime';
import type { INode } from '../dom';
import type { IBindingController } from './interfaces-bindings';

const taskOptions: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

// the 2 interfaces implemented come from mixin
export interface AttributeBinding extends IAstEvaluator, IConnectableBinding {}

/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export class AttributeBinding implements IBinding {
  public isBound: boolean = false;
  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  private _task: ITask | null = null;

  /**
   * In case Attr has inner structure, such as class -> classList, style -> CSSStyleDeclaration
   *
   * @internal
   */
  private _targetObserver!: IObserver;

  public target: Element;

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
  private readonly _taskQueue: TaskQueue;

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
    taskQueue: TaskQueue,
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
  ) {
    this.l = locator;
    this.ast = ast;
    this._controller = controller;
    this.target = target as Element;
    this.oL = observerLocator;
    this._taskQueue = taskQueue;
  }

  public updateTarget(value: unknown): void {
    this._targetObserver.setValue(value, this.target, this.targetProperty);
  }

  public handleChange(): void {
    if (!this.isBound) {
      return;
    }

    let task: ITask | null;
    this.obs.version++;
    const newValue = astEvaluate(
      this.ast,
      this._scope!,
      this,
      // should observe?
      (this.mode & BindingMode.toView) > 0 ? this : null
    );
    this.obs.clear();

    if (newValue !== this._value) {
      this._value = newValue;
      const shouldQueueFlush = this._controller.state !== State.activating && (this._targetObserver.type & AccessorType.Layout) > 0;
      if (shouldQueueFlush) {
        // Queue the new one before canceling the old one, to prevent early yield
        task = this._task;
        this._task = this._taskQueue.queueTask(() => {
          this._task = null;
          this.updateTarget(newValue);
        }, taskOptions);
        task?.cancel();
      } else {
        this.updateTarget(newValue);
      }
    }
  }

  // todo: based off collection and handle update accordingly instead off always start
  public handleCollectionChange(): void {
    this.handleChange();
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      if (this._scope === _scope) {
        return;
      }
      this.unbind();
    }
    this._scope = _scope;

    astBind(this.ast, _scope, this);

    this._targetObserver ??= new AttributeObserver(
      this.target as HTMLElement,
      this.targetProperty,
      this.targetAttribute,
    );

    if (this.mode & (BindingMode.toView | BindingMode.oneTime)) {
      this.updateTarget(
        this._value = astEvaluate(this.ast, _scope, this, /* should connect? */(this.mode & BindingMode.toView) > 0 ? this : null)
      );
    }

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this._value = void 0;

    this._task?.cancel();
    this._task = null;
    this.obs.clearAll();
  }
}

mixinUseScope(AttributeBinding);
mixingBindingLimited(AttributeBinding, () => 'updateTarget');
connectable(AttributeBinding);
mixinAstEvaluator(true)(AttributeBinding);
