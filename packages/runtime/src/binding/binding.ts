import { IServiceLocator, Reporter } from '@aurelia/kernel';
import { IBindScope, LifecycleState } from '../lifecycle';
import { AccessorOrObserver, BindingFlags, IBindingTargetObserver, IScope } from '../observation';
import { ExpressionKind, ForOfStatement, hasBind, hasUnbind, IsBindingBehavior } from './ast';
import { BindingMode } from './binding-mode';
import { connectable, IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';

// tslint:disable:no-any

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
  public $nextBind: IBindScope = null;
  public $prevBind: IBindScope = null;

  public $state: LifecycleState = LifecycleState.none;
  public $scope: IScope = null;

  public targetObserver: AccessorOrObserver;

  constructor(
    public sourceExpression: IsBindingBehavior | ForOfStatement,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator) { }

  public updateTarget(value: any, flags: BindingFlags): void {
    this.targetObserver.setValue(value, flags | BindingFlags.updateTargetInstance);
  }

  public updateSource(value: any, flags: BindingFlags): void {
    this.sourceExpression.assign(flags | BindingFlags.updateSourceExpression, this.$scope, this.locator, value);
  }

  public handleChange(newValue: any, previousValue: any, flags: BindingFlags): void {
    if (!(this.$state & LifecycleState.isBound)) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;

    if (flags & BindingFlags.updateTargetInstance) {
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

    if (flags & BindingFlags.updateSourceExpression) {
      if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
        this.updateSource(newValue, flags);
      }
      return;
    }

    throw Reporter.error(15, BindingFlags[flags]);
  }

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$state & LifecycleState.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags | BindingFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= LifecycleState.isBinding;

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
      targetObserver.setValue(sourceExpression.evaluate(flags, scope, this.locator), flags);
    }
    if (mode & toView) {
      sourceExpression.connect(flags, scope, this);
    }
    if (mode & fromView) {
      targetObserver.subscribe(this);
    }

    // add isBound flag and remove isBinding flag
    this.$state |= LifecycleState.isBound;
    this.$state &= ~LifecycleState.isBinding;
  }

  public $unbind(flags: BindingFlags): void {
    if (!(this.$state & LifecycleState.isBound)) {
      return;
    }
    // add isUnbinding flag
    this.$state |= LifecycleState.isUnbinding;

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
    this.$state &= ~(LifecycleState.isBound | LifecycleState.isUnbinding);
  }
}
