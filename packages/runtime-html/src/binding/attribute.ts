import { IServiceLocator } from '@aurelia/kernel';
import {
  AccessorType,
  IObserver,
  connectable,
  astEvaluate,
  astBind,
  astUnbind,
  astAssign,
} from '@aurelia/runtime';

import { BindingMode } from './interfaces-bindings';
import { AttributeObserver } from '../observation/element-attribute-observer';
import { IFlushQueue, BindingTargetSubscriber, astEvaluator } from './binding-utils';
import { State } from '../templating/controller';

import type {
  ITask,
  QueueTaskOptions,
  TaskQueue,
} from '@aurelia/platform';
import type {
  ForOfStatement,
  IObserverLocator,
  IsBindingBehavior,
  Scope,
} from '@aurelia/runtime';
import type { INode } from '../dom';
import type { IAstBasedBinding, IBindingController } from './interfaces-bindings';

const taskOptions: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

export interface AttributeBinding extends IAstBasedBinding {}

/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export class AttributeBinding implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope: Scope = null!;
  public task: ITask | null = null;
  private targetSubscriber: BindingTargetSubscriber | null = null;

  /**
   * Target key. In case Attr has inner structure, such as class -> classList, style -> CSSStyleDeclaration
   */
  public targetObserver!: IObserver;

  public target: Element;
  public value: unknown = void 0;

  /**
   * A semi-private property used by connectable mixin
   */
  public oL: IObserverLocator;

  /** @internal */
  private readonly _controller: IBindingController;
  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    controller: IBindingController,
    public locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public taskQueue: TaskQueue,
    public ast: IsBindingBehavior | ForOfStatement,
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
    this._controller = controller;
    this.target = target as Element;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown): void {
    this.targetObserver.setValue(value, this.target, this.targetProperty);
  }

  public updateSource(value: unknown): void {
    astAssign(this.ast, this.$scope, this, value);
  }

  public handleChange(): void {
    if (!this.isBound) {
      return;
    }

    const mode = this.mode;
    const interceptor = this.interceptor;
    const $scope = this.$scope;
    const targetObserver = this.targetObserver;
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
    const shouldQueueFlush = this._controller.state !== State.activating && (targetObserver.type & AccessorType.Layout) > 0;
    let shouldConnect: boolean = false;
    let task: ITask | null;
    shouldConnect = (mode & BindingMode.oneTime) === 0;
    if (shouldConnect) {
      this.obs.version++;
    }
    const newValue = astEvaluate(this.ast, $scope, this, interceptor);
    if (shouldConnect) {
      this.obs.clear();
    }

    if (newValue !== this.value) {
      this.value = newValue;
      if (shouldQueueFlush) {
        // Queue the new one before canceling the old one, to prevent early yield
        task = this.task;
        this.task = this.taskQueue.queueTask(() => {
          this.task = null;
          interceptor.updateTarget(newValue);
        }, taskOptions);
        task?.cancel();
      } else {
        interceptor.updateTarget(newValue);
      }
    }
  }

  // todo: based off collection and handle update accordingly instead off always start
  public handleCollectionChange(): void {
    this.handleChange();
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind();
    }

    this.$scope = scope;

    astBind(this.ast, scope, this.interceptor);

    let targetObserver = this.targetObserver;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!targetObserver) {
      targetObserver = this.targetObserver = new AttributeObserver(
        this.target as HTMLElement,
        this.targetProperty,
        this.targetAttribute,
      );
    }

    const $mode = this.mode;
    const interceptor = this.interceptor;
    let shouldConnect: boolean = false;

    if ($mode & (BindingMode.toView | BindingMode.oneTime)) {
      shouldConnect = ($mode & BindingMode.toView) > 0;
      interceptor.updateTarget(
        this.value = astEvaluate(this.ast, scope, this, shouldConnect ? interceptor : null)
      );
    }
    if ($mode & BindingMode.fromView) {
      targetObserver.subscribe(this.targetSubscriber ??= new BindingTargetSubscriber(interceptor, this.locator.get(IFlushQueue)));
    }

    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }

    astUnbind(this.ast, this.$scope, this.interceptor);

    this.$scope = null!;
    this.value = void 0;

    if (this.targetSubscriber) {
      this.targetObserver.unsubscribe(this.targetSubscriber);
    }

    this.task?.cancel();
    this.task = null;
    this.obs.clearAll();

    // remove isBound and isUnbinding flags
    this.isBound = false;
  }
}

connectable(AttributeBinding);
astEvaluator(true)(AttributeBinding);
