import { IServiceLocator } from '@aurelia/kernel';
import {
  IExpression,
  IInterpolationExpression,
} from '../ast';
import {
  BindingMode,
  LifecycleFlags,
  State,
} from '../flags';
import { IBinding } from '../lifecycle';
import {
  IBindingTargetAccessor,
  IScope,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import {
  connectable,
  IConnectableBinding,
  IPartialConnectableBinding,
} from './connectable';

const { toView, oneTime } = BindingMode;

export class MultiInterpolationBinding implements IBinding {
  public interceptor: this = this;

  public $state: State = State.none;;
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
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }
    this.$state |= State.isBound;
    this.$scope = scope;
    this.part = part;

    const parts = this.parts;
    for (let i = 0, ii = parts.length; i < ii; ++i) {
      parts[i].interceptor.$bind(flags, scope, part);
    }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    this.$state &= ~State.isBound;
    this.$scope = void 0;
    const parts = this.parts;
    for (let i = 0, ii = parts.length; i < ii; ++i) {
      parts[i].interceptor.$unbind(flags);
    }
  }
}

export interface InterpolationBinding extends IConnectableBinding {}

@connectable()
export class InterpolationBinding implements IPartialConnectableBinding {
  public interceptor: this = this;

  public id!: number;
  public $scope?: IScope;
  public part?: string;
  public $state: State = State.none;

  public targetObserver: IBindingTargetAccessor;

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

    this.targetObserver = observerLocator.getAccessor(LifecycleFlags.none, target, targetProperty);
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }

    const previousValue = this.targetObserver.getValue();
    const newValue = this.interpolation.evaluate(flags, this.$scope!, this.locator, this.part);
    if (newValue !== previousValue) {
      this.interceptor.updateTarget(newValue, flags);
    }

    if ((this.mode & oneTime) === 0) {
      this.version++;
      this.sourceExpression.connect(flags, this.$scope!, this.interceptor, this.part);
      this.interceptor.unobserve(false);
    }
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }

    this.$state |= State.isBound;
    this.$scope = scope;
    this.part = part;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this.interceptor);
    }
    if (this.mode !== BindingMode.oneTime && this.targetObserver.bind) {
      this.targetObserver.bind(flags);
    }

    // since the interpolation already gets the whole value, we only need to let the first
    // text binding do the update if there are multiple
    if (this.isFirst) {
      this.interceptor.updateTarget(this.interpolation.evaluate(flags, scope, this.locator, part), flags);
    }
    if (this.mode & toView) {
      sourceExpression.connect(flags, scope, this.interceptor, part);
    }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    this.$state &= ~State.isBound;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope!, this.interceptor);
    }
    if (this.targetObserver.unbind) {
      this.targetObserver.unbind(flags);
    }

    this.$scope = void 0;
    this.interceptor.unobserve(true);
  }
}
