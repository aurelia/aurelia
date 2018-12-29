import { IServiceLocator, Reporter, Tracer } from '@aurelia/kernel';
import { IBindScope, ILifecycle, State } from '../lifecycle';
import { AccessorOrObserver, IBindingTargetObserver, IScope, LifecycleFlags } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { ExpressionKind, ForOfStatement, hasBind, hasUnbind, IsBindingBehavior } from './ast';
import { BindingMode } from './binding-mode';
import { connectable, IConnectableBinding, IPartialConnectableBinding } from './connectable';

const slice = Array.prototype.slice;

export interface IBinding extends IBindScope {
  readonly locator: IServiceLocator;
  readonly $scope: IScope;
}

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

export interface Binding extends IConnectableBinding {}

@connectable()
export class Binding implements IPartialConnectableBinding {
  public $nextBind: IBindScope;
  public $prevBind: IBindScope;
  public $state: State;
  public $lifecycle: ILifecycle;
  public $nextConnect: IConnectableBinding;
  public $nextPatch: IConnectableBinding;
  public $scope: IScope;

  public locator: IServiceLocator;
  public mode: BindingMode;
  public observerLocator: IObserverLocator;
  public sourceExpression: IsBindingBehavior | ForOfStatement;
  public target: Object;
  public targetProperty: string;

  public targetObserver: AccessorOrObserver;

  public persistentFlags: LifecycleFlags;

  constructor(sourceExpression: IsBindingBehavior | ForOfStatement, target: Object, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator) {
    this.$nextBind = null;
    this.$prevBind = null;
    this.$state = State.none;
    this.$lifecycle = locator.get(ILifecycle);
    this.$nextConnect = null;
    this.$nextPatch = null;
    this.$scope = null;

    this.locator = locator;
    this.mode = mode;
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.targetProperty = targetProperty;
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.sourceExpression.assign(flags | LifecycleFlags.updateSourceExpression, this.$scope, this.locator, value);
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Binding.handleChange', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;
    flags |= this.persistentFlags;

    if (flags & LifecycleFlags.updateTargetInstance) {
      const targetObserver = this.targetObserver;
      const mode = this.mode;

      const previousValue = targetObserver.getValue();
      // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
      if (sourceExpression.$kind !== ExpressionKind.AccessScope || this.observerSlots > 1) {
        newValue = sourceExpression.evaluate(flags, $scope, locator);
      }
      if (newValue !== previousValue) {
        this.updateTarget(newValue, flags);
      }
      if ((mode & oneTime) === 0) {
        this.version++;
        sourceExpression.connect(flags, $scope, this);
        this.unobserve(false);
      }
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    if (flags & LifecycleFlags.updateSourceExpression) {
      if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
        this.updateSource(newValue, flags);
      }
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    throw Reporter.error(15, LifecycleFlags[flags]);
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (Tracer.enabled) { Tracer.enter('Binding.$bind', slice.call(arguments)); }
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        if (Tracer.enabled) { Tracer.leave(); }
        return;
      }
      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    // Store flags which we can only receive during $bind and need to pass on
    // to the AST during evaluate/connect/assign
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;

    this.$scope = scope;

    let sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    const mode = this.mode;
    let targetObserver = this.targetObserver as IBindingTargetObserver;
    if (!targetObserver) {
      if (mode & fromView) {
        targetObserver = this.targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty) as IBindingTargetObserver;
      } else {
        targetObserver = this.targetObserver = this.observerLocator.getAccessor(this.target, this.targetProperty) as IBindingTargetObserver;
      }
    }
    if (targetObserver.bind) {
      targetObserver.bind(flags);
    }

    // during bind, binding behavior might have changed sourceExpression
    sourceExpression = this.sourceExpression;
    if (mode & toViewOrOneTime) {
      this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator), flags);
    }
    if (mode & toView) {
      this.$lifecycle.enqueueConnect(this);
    }
    if (mode & fromView) {
      targetObserver.subscribe(this);
    }

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Binding.$unbind', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    // clear persistent flags
    this.persistentFlags = LifecycleFlags.none;

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope, this);
    }
    this.$scope = null;

    const targetObserver = this.targetObserver as IBindingTargetObserver;
    if (targetObserver.unbind) {
      targetObserver.unbind(flags);
    }
    if (targetObserver.unsubscribe) {
      targetObserver.unsubscribe(this);
    }
    this.unobserve(true);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public connect(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Binding.connect', slice.call(arguments)); }
    if (this.$state & State.isBound) {
      flags |= this.persistentFlags;
      this.sourceExpression.connect(flags | LifecycleFlags.mustEvaluate, this.$scope, this);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public patch(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Binding.patch', slice.call(arguments)); }
    if (this.$state & State.isBound) {
      flags |= this.persistentFlags;
      this.updateTarget(this.sourceExpression.evaluate(flags | LifecycleFlags.mustEvaluate, this.$scope, this.locator), flags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}
