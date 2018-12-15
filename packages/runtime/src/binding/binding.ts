import { IServiceLocator, Reporter } from '../../kernel';
import { IBindScope, ILifecycle, State } from '../lifecycle';
import { AccessorOrObserver, IBindingTargetObserver, IScope, LifecycleFlags } from '../observation';
import { ExpressionKind, ForOfStatement, hasBind, hasUnbind, IsBindingBehavior, StrictAny } from './ast';
import { BindingMode } from './binding-mode';
import { connectable, IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';

export interface IBinding extends IBindScope {
  readonly locator: IServiceLocator;
  readonly $scope: IScope;
}

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

export interface Binding extends IConnectableBinding {}

@connectable()
export class Binding implements IPartialConnectableBinding {
  public $nextConnect: IConnectableBinding = null;
  public $nextPatch: IConnectableBinding = null;
  public $nextBind: IBindScope = null;
  public $prevBind: IBindScope = null;

  public $state: State = State.none;
  public $scope: IScope = null;
  public $lifecycle: ILifecycle;

  public targetObserver: AccessorOrObserver;

  constructor(
    public sourceExpression: IsBindingBehavior | ForOfStatement,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator) {
    this.$lifecycle = locator.get(ILifecycle);
  }

  public updateTarget(value: StrictAny, flags: LifecycleFlags): void {
    this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
  }

  public updateSource(value: StrictAny, flags: LifecycleFlags): void {
    this.sourceExpression.assign(flags | LifecycleFlags.updateSourceExpression, this.$scope, this.locator, value);
  }

  public handleChange(newValue: StrictAny, previousValue: StrictAny, flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;

    if (flags & LifecycleFlags.updateTargetInstance) {
      const targetObserver = this.targetObserver;
      const mode = this.mode;

      previousValue = targetObserver.getValue();
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
      return;
    }

    if (flags & LifecycleFlags.updateSourceExpression) {
      if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
        this.updateSource(newValue, flags);
      }
      return;
    }

    throw Reporter.error(15, LifecycleFlags[flags]);
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

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
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

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
  }

  public connect(flags: LifecycleFlags): void {
    if (this.$state & State.isBound) {
      this.sourceExpression.connect(flags | LifecycleFlags.mustEvaluate, this.$scope, this);
    }
  }

  public patch(flags: LifecycleFlags): void {
    if (this.$state & State.isBound) {
      this.updateTarget(this.sourceExpression.evaluate(flags | LifecycleFlags.mustEvaluate, this.$scope, this.locator), flags);
    }
  }
}
