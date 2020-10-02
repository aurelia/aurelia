import { IServiceLocator } from '@aurelia/kernel';
import {
  IScheduler,
} from '@aurelia/scheduler';
import {
  IExpression,
  IInterpolationExpression,
} from '../ast';
import {
  BindingMode,
  LifecycleFlags,
} from '../flags';
import { IBinding } from '../lifecycle';
import {
  IBindingTargetAccessor,
  IScope,
  AccessorType,
  INodeAccessor,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import {
  connectable,
  IConnectableBinding,
  IPartialConnectableBinding,
} from './connectable';
import { IDOM } from '../dom';

const { toView, oneTime } = BindingMode;

export class MultiInterpolationBinding implements IBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: IScope = void 0;
  public part?: string;

  public parts: InterpolationBinding[];

  public constructor(
    public observerLocator: IObserverLocator,
    public interpolation: IInterpolationExpression,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    public locator: IServiceLocator,
  ) {
    // Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
    // value converters and binding behaviors.
    // Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
    // in which case the renderer will create the TextBinding directly
    const expressions = interpolation.expressions;
    const parts = this.parts = Array(expressions.length);
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      parts[i] = new InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
    }
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }
    this.isBound = true;
    this.$scope = scope;
    this.part = part;

    const parts = this.parts;
    for (let i = 0, ii = parts.length; i < ii; ++i) {
      parts[i].interceptor.$bind(flags, scope, part);
    }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.$scope = void 0;
    const parts = this.parts;
    for (let i = 0, ii = parts.length; i < ii; ++i) {
      parts[i].interceptor.$unbind(flags);
    }
  }

  public dispose(): void {
    this.interceptor = (void 0)!;
    this.interpolation = (void 0)!;
    this.locator = (void 0)!;
    this.target = (void 0)!;
  }
}

export interface InterpolationBinding extends IConnectableBinding {}

@connectable()
export class InterpolationBinding implements IPartialConnectableBinding {
  public interceptor: this = this;

  public id!: number;
  public $scope?: IScope;
  public part?: string;
  public $scheduler: IScheduler;
  public targetObserver: IBindingTargetAccessor & INodeAccessor;
  public isBound: boolean = false;

  private readonly dom: IDOM;

  public constructor(
    public sourceExpression: IExpression,
    public interpolation: IInterpolationExpression,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    public isFirst: boolean,
  ) {
    connectable.assignIdTo(this);

    this.$scheduler = locator.get(IScheduler);
    this.targetObserver = observerLocator.getAccessor(LifecycleFlags.none, target, targetProperty) as IBindingTargetAccessor & INodeAccessor;
    this.dom = locator.get(IDOM);
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const targetObserver = this.targetObserver;
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/scheduler to properly yield all with aurelia.start().wait()
    const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (targetObserver.type & AccessorType.Layout) > 0;
    const oldValue = targetObserver.getValue();
    const interceptor = this.interceptor;
    const newValue = this.interpolation.evaluate(flags, this.$scope!, this.locator, this.part);

    // todo(fred): maybe let the observer decides whether it updates
    if (newValue !== oldValue) {
      if (shouldQueueFlush) {
        flags |= LifecycleFlags.noTargetObserverQueue;
        this.dom.queueFlushChanges(targetObserver);
      }

      interceptor.updateTarget(newValue, flags);
    }

    if ((this.mode & oneTime) === 0) {
      this.version++;
      this.sourceExpression.connect(flags, this.$scope!, interceptor, this.part);
      interceptor.unobserve(false);
    }
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }

    this.isBound = true;
    this.$scope = scope;
    this.part = part;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this.interceptor);
    }

    const targetObserver = this.targetObserver;
    const mode = this.mode;

    if (mode !== BindingMode.oneTime && targetObserver.bind) {
      targetObserver.bind(flags);
    }

    // since the interpolation already gets the whole value, we only need to let the first
    // text binding do the update if there are multiple
    if (this.isFirst) {
      this.interceptor.updateTarget(this.interpolation.evaluate(flags, scope, this.locator, part), flags);
    }
    if ((mode & toView) > 0) {
      sourceExpression.connect(flags, scope, this.interceptor, part);
    }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope!, this.interceptor);
    }

    const targetObserver = this.targetObserver;
    if (targetObserver.unbind) {
      targetObserver.unbind(flags);
    }

    this.$scope = void 0;
    this.interceptor.unobserve(true);
  }

  public dispose(): void {
    this.interceptor = (void 0)!;
    this.sourceExpression = (void 0)!;
    this.locator = (void 0)!;
    this.targetObserver = (void 0)!;
  }
}
