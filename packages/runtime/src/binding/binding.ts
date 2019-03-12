import { IServiceLocator, Reporter, Tracer } from '@aurelia/kernel';
import { IForOfStatement, IsBindingBehavior } from '../ast';
import { BindingMode, ExpressionKind, LifecycleFlags, State } from '../flags';
import { IBinding, ILifecycle } from '../lifecycle';
import { AccessorOrObserver, IBindingTargetObserver, IObservable, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { hasBind, hasUnbind } from './ast';
import { connectable, IConnectableBinding, IPartialConnectableBinding } from './connectable';

const slice = Array.prototype.slice;

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

export interface Binding extends IConnectableBinding {}

@connectable()
export class Binding implements IPartialConnectableBinding {
  public id!: string;
  public $nextBinding?: IBinding;
  public $prevBinding?: IBinding;
  public $state: State;
  public $lifecycle: ILifecycle;
  public $nextConnect?: IConnectableBinding;
  public $scope?: IScope;

  public locator: IServiceLocator;
  public mode: BindingMode;
  public observerLocator: IObserverLocator;
  public sourceExpression: IsBindingBehavior | IForOfStatement;
  public target: IObservable;
  public targetProperty: string;

  public targetObserver?: AccessorOrObserver;

  public persistentFlags: LifecycleFlags;

  constructor(sourceExpression: IsBindingBehavior | IForOfStatement, target: IObservable, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator) {
    connectable.assignIdTo(this);
    this.$nextBinding = void 0;
    this.$prevBinding = void 0;
    this.$state = State.none;
    this.$lifecycle = locator.get(ILifecycle);
    this.$nextConnect = void 0;
    this.$scope = void 0;

    this.locator = locator;
    this.mode = mode;
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.targetProperty = targetProperty;
    this.targetObserver = void 0;
    this.persistentFlags = LifecycleFlags.none;
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver!.setValue(value, flags);
    if (flags & LifecycleFlags.patchStrategy) {
      this.targetObserver!.$patch(flags);
    }
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.sourceExpression.assign!(flags, this.$scope!, this.locator, value);
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Binding', 'handleChange', slice.call(arguments)); }
    if ((this.$state & State.isBound) === 0) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    flags |= this.persistentFlags;

    if ((flags & LifecycleFlags.updateTargetInstance) > 0) {
      const previousValue = this.targetObserver!.getValue();
      // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
      if (this.sourceExpression.$kind !== ExpressionKind.AccessScope || this.observerSlots > 1) {
        newValue = this.sourceExpression.evaluate(flags, this.$scope!, this.locator);
      }
      if (newValue !== previousValue) {
        this.updateTarget(newValue, flags);
      }
      if ((this.mode & oneTime) === 0) {
        this.version++;
        this.sourceExpression.connect(flags, this.$scope!, this);
        this.unobserve(false);
      }
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    if ((flags & LifecycleFlags.updateSourceExpression) > 0) {
      if (newValue !== this.sourceExpression.evaluate(flags, this.$scope!, this.locator)) {
        this.updateSource(newValue, flags);
      }
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    if (Tracer.enabled) { Tracer.leave(); }
    throw Reporter.error(15, flags);
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (Tracer.enabled) { Tracer.enter('Binding', '$bind', slice.call(arguments)); }
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

    let targetObserver = this.targetObserver as IBindingTargetObserver | undefined;
    if (!targetObserver) {
      if (this.mode & fromView) {
        targetObserver = this.targetObserver = this.observerLocator.getObserver(flags, this.target, this.targetProperty) as IBindingTargetObserver;
      } else {
        targetObserver = this.targetObserver = this.observerLocator.getAccessor(flags, this.target, this.targetProperty) as IBindingTargetObserver;
      }
    }
    if (targetObserver.bind) {
      targetObserver.bind(flags);
    }

    // during bind, binding behavior might have changed sourceExpression
    sourceExpression = this.sourceExpression;
    if (this.mode & toViewOrOneTime) {
      this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator), flags);
    }
    if (this.mode & toView) {
      sourceExpression.connect(flags, scope, this);
    }
    if (this.mode & fromView) {
      targetObserver.subscribe(this);
      (targetObserver as typeof targetObserver & { [key: string]: number })[this.id] |= LifecycleFlags.updateSourceExpression;
    }

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Binding', '$unbind', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    // clear persistent flags
    this.persistentFlags = LifecycleFlags.none;

    if (hasUnbind(this.sourceExpression)) {
      this.sourceExpression.unbind(flags, this.$scope!, this);
    }
    this.$scope = void 0;

    if ((this.targetObserver as IBindingTargetObserver).unbind) {
      (this.targetObserver as IBindingTargetObserver).unbind!(flags);
    }
    if ((this.targetObserver as IBindingTargetObserver).unsubscribe) {
      (this.targetObserver as IBindingTargetObserver).unsubscribe(this);
      (this.targetObserver as this['targetObserver'] & { [key: string]: number })[this.id] &= ~LifecycleFlags.updateSourceExpression;
    }
    this.unobserve(true);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public $patch(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Binding', '$patch', slice.call(arguments)); }
    if (this.$state & State.isBound) {
      this.targetObserver!.$patch(flags | this.persistentFlags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}
