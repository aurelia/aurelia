import {
  IServiceLocator,
} from '@aurelia/kernel';
import {
  IForOfStatement,
  IsBindingBehavior,
} from '../ast';
import {
  BindingMode,
  ExpressionKind,
  LifecycleFlags,
} from '../flags';
import {
  AccessorOrObserver,
  IBindingTargetObserver,
  IScope,
  AccessorType,
  INodeAccessor,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import {
  hasBind,
  hasUnbind,
} from './ast';
import {
  connectable,
  IConnectableBinding,
  IPartialConnectableBinding,
} from './connectable';
import { IDOM } from '../dom';

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

export interface PropertyBinding extends IConnectableBinding {}

@connectable()
export class PropertyBinding implements IPartialConnectableBinding {
  public interceptor: this = this;

  public id!: number;
  public isBound: boolean = false;
  public $scope?: IScope = void 0;
  public $hostScope: IScope | null = null;

  public targetObserver?: AccessorOrObserver = void 0;;

  public persistentFlags: LifecycleFlags = LifecycleFlags.none;

  public constructor(
    public sourceExpression: IsBindingBehavior | IForOfStatement,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    private dom: IDOM,
  ) {
    connectable.assignIdTo(this);
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver!.setValue(value, flags);
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.sourceExpression.assign!(flags, this.$scope!, this.$hostScope, this.locator, value);
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    flags |= this.persistentFlags;

    const targetObserver = this.targetObserver!;
    const interceptor = this.interceptor;
    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope!;
    const locator = this.locator;

    if ((flags & LifecycleFlags.updateTargetInstance) > 0) {
      // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
      if (this.sourceExpression.$kind !== ExpressionKind.AccessScope || this.observerSlots > 1) {
        newValue = this.sourceExpression.evaluate(flags, $scope!, this.$hostScope, locator);
      }
      // Alpha: during bind a simple strategy for bind is always flush immediately
      // todo:
      //  (1). determine whether this should be the behavior
      //  (2). if not, then fix tests to reflect the changes/scheduler to properly yield all with aurelia.start().wait()
      const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (targetObserver.type & AccessorType.Layout) > 0;
      const oldValue = targetObserver.getValue();

      if (sourceExpression.$kind !== ExpressionKind.AccessScope || this.observerSlots > 1) {
        newValue = sourceExpression.evaluate(flags, $scope!, this.$hostScope, locator);
      }

      // todo(fred): maybe let the obsrever decides whether it updates
      if (newValue !== oldValue) {
        if (shouldQueueFlush) {
          flags |= LifecycleFlags.noTargetObserverQueue;
          this.dom.queueFlushChanges(targetObserver as unknown as INodeAccessor);
        }

        interceptor.updateTarget(newValue, flags);
      }

      if ((this.mode & oneTime) === 0) {
        this.version++;
        sourceExpression.connect(flags, $scope!, this.$hostScope, interceptor);
        interceptor.unobserve(false);
      }

      return;
    }

    if ((flags & LifecycleFlags.updateSourceExpression) > 0) {
      if (newValue !== sourceExpression.evaluate(flags, $scope!, this.$hostScope, locator)) {
        interceptor.updateSource(newValue, flags);
      }
      return;
    }

    throw new Error('Unexpected handleChange context in PropertyBinding');
  }

  public $bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }
    // Force property binding to always be strict
    flags |= LifecycleFlags.isStrictBindingStrategy;

    // Store flags which we can only receive during $bind and need to pass on
    // to the AST during evaluate/connect/assign
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;

    this.$scope = scope;
    this.$hostScope = hostScope;

    let sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, hostScope, this.interceptor);
    }

    let $mode = this.mode;
    let targetObserver = this.targetObserver as IBindingTargetObserver;
    if (!targetObserver) {
      const observerLocator = this.observerLocator;
      if ($mode & fromView) {
        targetObserver = observerLocator.getObserver(flags, this.target, this.targetProperty) as IBindingTargetObserver;
      } else {
        targetObserver = observerLocator.getAccessor(flags, this.target, this.targetProperty) as IBindingTargetObserver;
      }
      this.targetObserver = targetObserver;
    }
    if ($mode !== BindingMode.oneTime && targetObserver.bind) {
      targetObserver.bind(flags);
    }

    // deepscan-disable-next-line
    $mode = this.mode;

    // during bind, binding behavior might have changed sourceExpression
    sourceExpression = this.sourceExpression;
    const interceptor = this.interceptor;

    if ($mode & toViewOrOneTime) {
      interceptor.updateTarget(sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator), flags);
    }
    if ($mode & toView) {
      sourceExpression.connect(flags, scope, this.$hostScope, interceptor);
    }
    if ($mode & fromView) {
      targetObserver.subscribe(interceptor);
      if (($mode & toView) === 0) {
        interceptor.updateSource(targetObserver.getValue(), flags);
      }
      targetObserver[this.id] |= LifecycleFlags.updateSourceExpression;
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
      this.sourceExpression.unbind(flags, this.$scope!, this.$hostScope, this.interceptor);
    }

    this.$scope = void 0;

    const targetObserver = this.targetObserver as IBindingTargetObserver;
    if ((targetObserver.type & AccessorType.Layout) > 0) {
      this.dom.dequeueFlushChanges(targetObserver as unknown as INodeAccessor);
    }
    if (targetObserver.unbind) {
      targetObserver.unbind(flags);
    }
    if (targetObserver.unsubscribe) {
      targetObserver.unsubscribe(this.interceptor);
      targetObserver[this.id] &= ~LifecycleFlags.updateSourceExpression;
    }
    this.interceptor.unobserve(true);

    this.isBound = false;
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
