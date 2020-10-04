import {
  IServiceLocator,
} from '@aurelia/kernel';
import {
  AccessorOrObserver,
  INodeAccessor,
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
  IScheduler,
  INode,
  CustomElementDefinition,
  AccessorType,
  IDOM,
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
  public interceptor: this = this;

  public id!: number;
  public isBound: boolean = false;
  public $scheduler: IScheduler;
  public $scope: IScope = null!;
  public $hostScope: IScope | null = null;
  public projection?: CustomElementDefinition;

  /**
   * Target key. In case Attr has inner structure, such as class -> classList, style -> CSSStyleDeclaration
   */

  public targetObserver!: AccessorOrObserver;

  public persistentFlags: LifecycleFlags = LifecycleFlags.none;

  public target: Element;

  public constructor(
    public sourceExpression: IsBindingBehavior | IForOfStatement,
    target: INode,
    // some attributes may have inner structure
    // such as class -> collection of class names
    // such as style -> collection of style rules
    //
    // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
    public targetAttribute: string,
    public targetProperty: string,
    public mode: BindingMode,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    private dom: IDOM,
  ) {
    this.target = target as Element;
    connectable.assignIdTo(this);
    this.$scheduler = locator.get(IScheduler);
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.sourceExpression.assign!(flags | LifecycleFlags.updateSourceExpression, this.$scope, this.$hostScope, this.locator, value);
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    flags |= this.persistentFlags;

    const mode = this.mode;
    const interceptor = this.interceptor;
    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;

    if (mode === BindingMode.fromView) {
      flags &= ~LifecycleFlags.updateTargetInstance;
      flags |= LifecycleFlags.updateSourceExpression;
    }

    if (flags & LifecycleFlags.updateTargetInstance) {
      const targetObserver = this.targetObserver;
      // Alpha: during bind a simple strategy for bind is always flush immediately
      // todo:
      //  (1). determine whether this should be the behavior
      //  (2). if not, then fix tests to reflect the changes/scheduler to properly yield all with aurelia.start().wait()
      const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (targetObserver.type & AccessorType.Layout) > 0;
      const oldValue = targetObserver.getValue();

      if (sourceExpression.$kind !== ExpressionKind.AccessScope || this.observerSlots > 1) {
        newValue = sourceExpression.evaluate(flags, $scope, this.$hostScope, locator);
      }

      if (newValue !== oldValue) {
        if (shouldQueueFlush) {
          flags |= LifecycleFlags.noTargetObserverQueue;
          // this.dom.queueFlushChanges(targetObserver as unknown as INodeAccessor);
          (this.dom as any).queueFlushChanges(targetObserver, this);
        }

        interceptor.updateTarget(newValue, flags);
      }

      if ((mode & oneTime) === 0) {
        this.version++;
        sourceExpression.connect(flags, $scope, this.$hostScope, interceptor);
        interceptor.unobserve(false);
      }

      return;
    }

    if (flags & LifecycleFlags.updateSourceExpression) {
      if (newValue !== this.sourceExpression.evaluate(flags, $scope, this.$hostScope, locator)) {
        interceptor.updateSource(newValue, flags);
      }
      return;
    }

    throw new Error('Unexpected handleChange context in AttributeBinding');
  }

  public $bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, projection?: CustomElementDefinition): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    // Store flags which we can only receive during $bind and need to pass on
    // to the AST during evaluate/connect/assign
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;

    this.$scope = scope;
    this.$hostScope = hostScope;
    this.projection = projection;

    let sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, hostScope, this.interceptor);
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
    const $mode = this.mode;
    const interceptor = this.interceptor;

    if ($mode & toViewOrOneTime) {
      interceptor.updateTarget(sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator), flags);
    }
    if ($mode & toView) {
      sourceExpression.connect(flags, scope, this.$hostScope, this);
    }
    if ($mode & fromView) {
      targetObserver[this.id] |= LifecycleFlags.updateSourceExpression;
      targetObserver.subscribe(interceptor);
    }

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    // clear persistent flags
    this.persistentFlags = LifecycleFlags.none;

    if (hasUnbind(this.sourceExpression)) {
      this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
    }
    this.$scope = null!;

    const targetObserver = this.targetObserver as IBindingTargetObserver & INodeAccessor;
    if (targetObserver.unbind) {
      targetObserver.unbind!(flags);
    }
    if (targetObserver.unsubscribe) {
      targetObserver.unsubscribe(this.interceptor);
      targetObserver[this.id] &= ~LifecycleFlags.updateSourceExpression;
    }
    (this.dom as any).dequeueFlushChanges(targetObserver, this);
    this.interceptor.unobserve(true);

    // remove isBound and isUnbinding flags
    this.isBound = false;
  }

  public connect(flags: LifecycleFlags): void {
    if (this.isBound) {
      flags |= this.persistentFlags;
      this.sourceExpression.connect(flags | LifecycleFlags.mustEvaluate, this.$scope, this.$hostScope, this.interceptor); // why do we have a connect method here in the first place? will this be called after bind?
    }
  }

  public dispose(): void {
    this.interceptor
      = this.sourceExpression
      = this.locator
      = this.targetObserver
      = this.target
      = this.dom
      = (void 0)!;
  }
}
