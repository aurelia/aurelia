import {
  connectable,
  type IObserverLocator,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  ICollectionSubscriber
} from '@aurelia/runtime';
import { type Scope } from './scope';
import {
  astBind,
  astEvaluate,
  astUnbind,
  IAstEvaluator,
} from '../ast.eval';
import { activating } from '../templating/controller';
import { mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { oneTime, toView } from './interfaces-bindings';

import type {
  ITask,
  QueueTaskOptions,
  TaskQueue
} from '@aurelia/platform';
import type { IServiceLocator } from '@aurelia/kernel';
import type { INode } from '../dom';
import type { IBinding, BindingMode, IBindingController } from './interfaces-bindings';
import { isString, safeString } from '../utilities';
import { ForOfStatement, IsBindingBehavior } from '@aurelia/expression-parser';

const taskOptions: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

// the 2 interfaces implemented come from mixin
export interface AttributeBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {}

/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export class AttributeBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  public isBound: boolean = false;
  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  private _task: ITask | null = null;

  public target: HTMLElement;

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
    this.target = target as HTMLElement;
    this.oL = observerLocator;
    this._taskQueue = taskQueue;
  }

  public updateTarget(value: unknown): void {
    const target = this.target;
    const targetAttribute = this.targetAttribute;
    const targetProperty = this.targetProperty;

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
    if (!this.isBound) {
      /* istanbul-ignore-next */
      return;
    }

    let task: ITask | null;
    this.obs.version++;
    const newValue = astEvaluate(
      this.ast,
      this._scope!,
      this,
      // should observe?
      (this.mode & toView) > 0 ? this : null
    );
    this.obs.clear();

    if (newValue !== this._value) {
      this._value = newValue;
      const shouldQueueFlush = this._controller.state !== activating;
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
      /* istanbul-ignore-next */
        return;
      }
      this.unbind();
    }
    this._scope = _scope;

    astBind(this.ast, _scope, this);

    if (this.mode & (toView | oneTime)) {
      this.updateTarget(
        this._value = astEvaluate(this.ast, _scope, this, /* should connect? */(this.mode & toView) > 0 ? this : null)
      );
    }

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      /* istanbul-ignore-next */
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
connectable(AttributeBinding, null!);
mixinAstEvaluator(true)(AttributeBinding);
