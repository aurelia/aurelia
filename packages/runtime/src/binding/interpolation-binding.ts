import { IServiceLocator } from '../../kernel';
import { IBindScope, State } from '../lifecycle';
import { IBindingTargetAccessor, IScope, LifecycleFlags } from '../observation';
import { IExpression, Interpolation } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { BindingMode } from './binding-mode';
import { connectable, IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';

// tslint:disable:no-any

const { toView, oneTime } = BindingMode;

export class MultiInterpolationBinding implements IBinding {
  public $nextBind: IBindScope = null;
  public $prevBind: IBindScope = null;

  public $state: State = State.none;

  public $scope: IScope = null;

  public parts: InterpolationBinding[];

  constructor(
    public observerLocator: IObserverLocator,
    public interpolation: Interpolation,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    public locator: IServiceLocator) {

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

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags);
    }
    this.$state |= State.isBound;
    this.$scope = scope;

    const parts = this.parts;
    for (let i = 0, ii = parts.length; i < ii; ++i) {
      parts[i].$bind(flags, scope);
    }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    this.$state &= ~State.isBound;
    this.$scope = null;
    const parts = this.parts;
    for (let i = 0, ii = parts.length; i < ii; ++i) {
      parts[i].$unbind(flags);
    }
  }
}

export interface InterpolationBinding extends IConnectableBinding {}

@connectable()
export class InterpolationBinding implements IPartialConnectableBinding {
  public $scope: IScope;
  public $state: State = State.none;

  public targetObserver: IBindingTargetAccessor;

  constructor(
    public sourceExpression: IExpression,
    public interpolation: Interpolation,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    public isFirst: boolean) {

    this.targetObserver = observerLocator.getAccessor(target, targetProperty);
  }

  public updateTarget(value: any, flags: LifecycleFlags): void {
    this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
  }

  public handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }

    previousValue = this.targetObserver.getValue();
    newValue = this.interpolation.evaluate(flags, this.$scope, this.locator);
    if (newValue !== previousValue) {
      this.updateTarget(newValue, flags);
    }

    if ((this.mode & oneTime) === 0) {
      this.version++;
      this.sourceExpression.connect(flags, this.$scope, this);
      this.unobserve(false);
    }
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags);
    }

    this.$state |= State.isBound;
    this.$scope = scope;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this);
    }

    // since the interpolation already gets the whole value, we only need to let the first
    // text binding do the update if there are multiple
    if (this.isFirst) {
      this.updateTarget(this.interpolation.evaluate(flags, scope, this.locator), flags);
    }
    if (this.mode & toView) {
      sourceExpression.connect(flags, scope, this);
    }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    this.$state &= ~State.isBound;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;
    this.unobserve(true);
  }
}
