import {
  IServiceLocator,
  Reporter,
} from '@aurelia/kernel';
import {
  AccessorOrObserver,
  BindingMode,
  connectable,
  ExpressionKind,
  hasBind,
  hasUnbind,
  IBindingTargetObserver,
  IConnectableBinding,
  IForOfStatement,
  IObserverLocator,
  IPartialConnectableBinding,
  IsBindingBehavior,
  IScope,
  LifecycleFlags,
  State,
  IScheduler,
} from '@aurelia/runtime';
import {
  AttributeObserver,
  IHtmlElement,
} from '../observation/element-attribute-observer';

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

export interface AttributeBinding extends IConnectableBinding {}

/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
@connectable()
export class AttributeBinding implements IPartialConnectableBinding {
  public id!: number;
  public $state: State;
  public $scheduler: IScheduler;
  public $scope: IScope;
  public part?: string;

  /**
   * Target key. In case Attr has inner structure, such as class -> classList, style -> CSSStyleDeclaration
   */

  public targetObserver!: AccessorOrObserver;

  public persistentFlags: LifecycleFlags;

  public constructor(
    public sourceExpression: IsBindingBehavior | IForOfStatement,
    public target: Element,
    // some attributes may have inner structure
    // such as class -> collection of class names
    // such as style -> collection of style rules
    //
    // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
    public targetAttribute: string,
    public targetProperty: string,
    public mode: BindingMode,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator
  ) {
    connectable.assignIdTo(this);
    this.$state = State.none;
    this.$scheduler = locator.get(IScheduler);
    this.$scope = null!;

    this.persistentFlags = LifecycleFlags.none;
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.sourceExpression.assign!(flags | LifecycleFlags.updateSourceExpression, this.$scope, this.locator, value);
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }

    flags |= this.persistentFlags;

    if (this.mode === BindingMode.fromView) {
      flags &= ~LifecycleFlags.updateTargetInstance;
      flags |= LifecycleFlags.updateSourceExpression;
    }

    if (flags & LifecycleFlags.updateTargetInstance) {
      const previousValue = this.targetObserver.getValue();
      // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
      if (this.sourceExpression.$kind !== ExpressionKind.AccessScope || this.observerSlots > 1) {
        newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part);
      }
      if (newValue !== previousValue) {
        this.updateTarget(newValue, flags);
      }
      if ((this.mode & oneTime) === 0) {
        this.version++;
        this.sourceExpression.connect(flags, this.$scope, this, this.part);
        this.unobserve(false);
      }
      return;
    }

    if (flags & LifecycleFlags.updateSourceExpression) {
      if (newValue !== this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part)) {
        this.updateSource(newValue, flags);
      }
      return;
    }

    throw Reporter.error(15, flags);
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
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
    this.part = part;

    let sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    let targetObserver = this.targetObserver as IBindingTargetObserver;
    if (!targetObserver) {
      targetObserver = this.targetObserver = new AttributeObserver(
        this.$scheduler,
        flags,
        this.observerLocator,
        this.target as IHtmlElement,
        this.targetProperty,
        this.targetAttribute,
      );
    }
    if (targetObserver.bind) {
      targetObserver.bind(flags);
    }

    // during bind, binding behavior might have changed sourceExpression
    sourceExpression = this.sourceExpression;
    if (this.mode & toViewOrOneTime) {
      this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator, part), flags);
    }
    if (this.mode & toView) {
      sourceExpression.connect(flags, scope, this, part);
    }
    if (this.mode & fromView) {
      (targetObserver as IBindingTargetObserver & { [key: string]: number })[this.id] |= LifecycleFlags.updateSourceExpression;
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

    // clear persistent flags
    this.persistentFlags = LifecycleFlags.none;

    if (hasUnbind(this.sourceExpression)) {
      this.sourceExpression.unbind(flags, this.$scope, this);
    }
    this.$scope = null!;

    if ((this.targetObserver as IBindingTargetObserver).unbind) {
      (this.targetObserver as IBindingTargetObserver).unbind!(flags);
    }
    if ((this.targetObserver as IBindingTargetObserver).unsubscribe) {
      (this.targetObserver as IBindingTargetObserver).unsubscribe(this);
      (this.targetObserver as IBindingTargetObserver & { [key: string]: number })[this.id] &= ~LifecycleFlags.updateSourceExpression;
    }
    this.unobserve(true);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }

  public connect(flags: LifecycleFlags): void {
    if (this.$state & State.isBound) {
      flags |= this.persistentFlags;
      this.sourceExpression.connect(flags | LifecycleFlags.mustEvaluate, this.$scope, this, this.part); // why do we have a connect method here in the first place? will this be called after bind?
    }
  }
}
