import { IIndexable, IServiceLocator, Reporter, Tracer } from '@aurelia/kernel';
import { IExpression } from '../ast';
import { LifecycleFlags, State } from '../flags';
import { IBinding, ILifecycle } from '../lifecycle';
import { IObservable, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { connectable, IConnectableBinding, IPartialConnectableBinding } from './connectable';

const slice = Array.prototype.slice;

export interface LetBinding extends IConnectableBinding {}

@connectable()
export class LetBinding implements IPartialConnectableBinding {
  public $nextBinding: IBinding;
  public $prevBinding: IBinding;
  public $state: State;
  public $lifecycle: ILifecycle;
  public $scope: IScope;

  public locator: IServiceLocator;
  public observerLocator: IObserverLocator;
  public sourceExpression: IExpression;
  public target: IObservable | null;
  public targetProperty: string;

  private readonly toViewModel: boolean;

  constructor(sourceExpression: IExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toViewModel: boolean = false) {
    this.$nextBinding = null;
    this.$prevBinding = null;
    this.$state = State.none;
    this.$lifecycle = locator.get(ILifecycle);
    this.$scope = null;

    this.locator = locator;
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.target = null;
    this.targetProperty = targetProperty;

    this.toViewModel = toViewModel;
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('LetBinding.handleChange', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    if (flags & LifecycleFlags.updateTargetInstance) {
      const { target, targetProperty } = this as {target: IIndexable; targetProperty: string};
      const previousValue: unknown = target[targetProperty];
      const newValue: unknown = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
      if (newValue !== previousValue) {
        target[targetProperty] = newValue;
      }
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    throw Reporter.error(15, flags);
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (Tracer.enabled) { Tracer.enter('LetBinding.$bind', slice.call(arguments)); }
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        if (Tracer.enabled) { Tracer.leave(); }
        return;
      }
      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    this.$scope = scope;
    this.target = (this.toViewModel ? scope.bindingContext : scope.overrideContext) as IIndexable;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this);
    }
    // sourceExpression might have been changed during bind
    this.target[this.targetProperty] = this.sourceExpression.evaluate(LifecycleFlags.fromBind, scope, this.locator);
    this.sourceExpression.connect(flags, scope, this);

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('LetBinding.$unbind', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope, this);
    }
    this.$scope = null;
    this.unobserve(true);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}
