import { BindingMode } from './binding-mode';
import { ConnectableBinding } from './connectable-binding';
import { enqueueBindingConnect } from './connect-queue';
import { IObserverLocator } from './observer-locator';
import { IExpression } from './ast';
import { IBindScope, IBindingTargetObserver, IBindingTargetAccessor } from './observation';
import { IServiceLocator } from '../../kernel/di';
import { IScope, sourceContext, targetContext } from './binding-context';
import { Reporter } from '../../kernel/reporter';
import { BindingFlags } from './binding-flags';

export interface IBinding extends IBindScope {
  locator: IServiceLocator;
  observeProperty(context: any, name: string): void;
}

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;

export class Binding extends ConnectableBinding implements IBinding {
  public targetObserver: IBindingTargetObserver | IBindingTargetAccessor;
  private $scope: IScope;
  private $isBound = false;

  constructor(
    public sourceExpression: IExpression,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    observerLocator: IObserverLocator,
    public locator: IServiceLocator) {
    super(observerLocator);
  }

  updateTarget(value: any) {
    this.targetObserver.setValue(value, this.target, this.targetProperty);
  }

  updateSource(value: any) {
    this.sourceExpression.assign(this.$scope, value, this.locator, BindingFlags.none);
  }

  call(context: string, newValue?: any, oldValue?: any) {
    if (!this.$isBound) {
      return;
    }

    if (context === sourceContext) {
      oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
      newValue = this.sourceExpression.evaluate(this.$scope, this.locator, BindingFlags.none);

      if (newValue !== oldValue) {
        this.updateTarget(newValue);
      }

      if (this.mode !== BindingMode.oneTime) {
        this.version++;
        this.sourceExpression.connect(this, this.$scope, BindingFlags.none);
        this.unobserve(false);
      }

      return;
    }

    if (context === targetContext) {
      if (newValue !== this.sourceExpression.evaluate(this.$scope, this.locator, BindingFlags.none)) {
        this.updateSource(newValue);
      }

      return;
    }

    throw Reporter.error(15, context);
  }

  $bind(scope: IScope, flags: BindingFlags) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$isBound = true;
    this.$scope = scope;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, scope, flags);
    }

    let mode = this.mode;

    if (!this.targetObserver) {
      let method: 'getObserver' | 'getAccessor' = mode & BindingMode.fromView ? 'getObserver' : 'getAccessor';
      this.targetObserver = <any>this.observerLocator[method](this.target, this.targetProperty);
    }

    if ('bind' in this.targetObserver) {
      this.targetObserver.bind(flags);
    }

    if (mode === BindingMode.oneTime) {
      const value = this.sourceExpression.evaluate(scope, this.locator, flags);
      this.updateTarget(value);
    } else {
      if (mode & BindingMode.toView) {
        const value = this.sourceExpression.evaluate(scope, this.locator, flags);
        this.updateTarget(value);
        if (flags & BindingFlags.connectImmediate) {
          this.sourceExpression.connect(this, this.$scope, flags);
        } else {
          enqueueBindingConnect(this);
        }
      }
      if (mode & BindingMode.fromView) {
        (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
      }
    }
  }

  $unbind(flags: BindingFlags) {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.$scope, flags);
    }

    this.$scope = null;

    if ('unbind' in this.targetObserver) {
      (this.targetObserver as IBindingTargetObserver).unbind(flags);
    }

    if ('unsubscribe' in this.targetObserver) {
      this.targetObserver.unsubscribe(targetContext, this);
    }

    this.unobserve(true);
  }

  connect(flags: BindingFlags) {
    if (!this.$isBound) {
      return;
    }

    if (flags & BindingFlags.mustEvaluate) {
      let value = this.sourceExpression.evaluate(this.$scope, this.locator, flags);
      this.updateTarget(value);
    }

    this.sourceExpression.connect(this, this.$scope, flags);
  }
}
