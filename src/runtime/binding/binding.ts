import { BindingMode } from './binding-mode';
import { ConnectableBinding } from './connectable-binding';
import { enqueueBindingConnect } from './connect-queue';
import { IObserverLocator } from './observer-locator';
import { IExpression } from './ast';
import { Observer } from './property-observation';
import { IBindScope, IBindingTargetObserver, IBindingTargetAccessor } from './observation';
import { IServiceLocator } from '../di';
import { IScope, sourceContext, targetContext } from './binding-context';
import { Reporter } from '../reporter';

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
    this.sourceExpression.assign(this.$scope, value, this.locator);
  }

  call(context: string, newValue?: any, oldValue?: any) {
    if (!this.$isBound) {
      return;
    }

    if (context === sourceContext) {
      oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
      newValue = this.sourceExpression.evaluate(this.$scope, this.locator);

      if (newValue !== oldValue) {
        this.updateTarget(newValue);
      }

      if (this.mode !== BindingMode.oneTime) {
        this.version++;
        this.sourceExpression.connect(this, this.$scope);
        this.unobserve(false);
      }

      return;
    }

    if (context === targetContext) {
      if (newValue !== this.sourceExpression.evaluate(this.$scope, this.locator)) {
        this.updateSource(newValue);
      }

      return;
    }

    throw Reporter.error(15, context);
  }

  $bind(scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind();
    }

    this.$isBound = true;
    this.$scope = scope;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, scope);
    }

    let mode = this.mode;

    if (!this.targetObserver) {
      let method: 'getObserver' | 'getAccessor' = mode === BindingMode.twoWay || mode === BindingMode.fromView ? 'getObserver' : 'getAccessor';
      this.targetObserver = <any>this.observerLocator[method](this.target, this.targetProperty);
    }

    if ('bind' in this.targetObserver) {
      this.targetObserver.bind();
    }

    if (this.mode !== BindingMode.fromView) {
      let value = this.sourceExpression.evaluate(scope, this.locator);
      this.updateTarget(value);
    }

    if (mode === BindingMode.oneTime) {
      return;
    } else if (mode === BindingMode.toView) {
      enqueueBindingConnect(this);
    } else if (mode === BindingMode.twoWay) {
      this.sourceExpression.connect(this, scope);
      (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
    } else if (mode === BindingMode.fromView) {
      (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
    }
  }

  $unbind() {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.$scope);
    }

    this.$scope = null;

    if ('unbind' in this.targetObserver) {
      (this.targetObserver as IBindingTargetObserver).unbind();
    }

    if ('unsubscribe' in this.targetObserver) {
      this.targetObserver.unsubscribe(targetContext, this);
    }

    this.unobserve(true);
  }

  connect(evaluate?: boolean) {
    if (!this.$isBound) {
      return;
    }

    if (evaluate) {
      let value = this.sourceExpression.evaluate(this.$scope, this.locator);
      this.updateTarget(value);
    }

    this.sourceExpression.connect(this, this.$scope);
  }
}
