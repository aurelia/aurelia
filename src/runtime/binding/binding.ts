import { BindingMode } from './binding-mode';
import { ConnectableBinding } from './connectable-binding';
import { enqueueBindingConnect } from './connect-queue';
import { ObserverLocator, IObserverLocator } from './observer-locator';
import { IExpression } from './ast';
import { Observer } from './property-observation';
import { IBindScope, IBindingTargetObserver, IBindingTargetAccessor } from './observation';
import { IContainer } from '../di';
import { IScope, sourceContext, targetContext } from './binding-context';

export interface IBinding extends IBindScope {
  container: IContainer;
  observeProperty(context: any, name: string): void;
}

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;

export class Binding extends ConnectableBinding implements IBinding {
  public targetObserver: IBindingTargetObserver | IBindingTargetAccessor;
  private source: IScope;
  private $isBound = false;

  constructor(
    private sourceExpression: IExpression,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    public container: IContainer) {
    super();
  }

  updateTarget(value: any) {
    this.targetObserver.setValue(value, this.target, this.targetProperty);
  }

  updateSource(value: any) {
    this.sourceExpression.assign(this.source, value, this.container);
  }

  call(context: string, newValue: any, oldValue: any) {
    if (!this.$isBound) {
      return;
    }

    if (context === sourceContext) {
      oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
      newValue = this.sourceExpression.evaluate(this.source, this.container);

      if (newValue !== oldValue) {
        this.updateTarget(newValue);
      }

      if (this.mode !== BindingMode.oneTime) {
        this.version++;
        this.sourceExpression.connect(this, this.source);
        this.unobserve(false);
      }

      return;
    }

    if (context === targetContext) {
      if (newValue !== this.sourceExpression.evaluate(this.source, this.container)) {
        this.updateSource(newValue);
      }

      return;
    }

    throw new Error(`Unexpected call context ${context}`);
  }

  $bind(source: IScope) {
    if (this.$isBound) {
      if (this.source === source) {
        return;
      }

      this.$unbind();
    }

    this.$isBound = true;
    this.source = source;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, source);
    }

    let mode = this.mode;

    if (!this.targetObserver) {
      let method: 'getObserver' | 'getAccessor' = mode === BindingMode.twoWay || mode === BindingMode.fromView ? 'getObserver' : 'getAccessor';
      this.targetObserver = <any>ObserverLocator[method](this.target, this.targetProperty);
    }

    if ('bind' in this.targetObserver) {
      this.targetObserver.bind();
    }

    if (this.mode !== BindingMode.fromView) {
      let value = this.sourceExpression.evaluate(source, this.container);
      this.updateTarget(value);
    }

    if (mode === BindingMode.oneTime) {
      return;
    } else if (mode === BindingMode.toView) {
      enqueueBindingConnect(this);
    } else if (mode === BindingMode.twoWay) {
      this.sourceExpression.connect(this, source);
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
      this.sourceExpression.unbind(this, this.source);
    }

    this.source = null;

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
      let value = this.sourceExpression.evaluate(this.source, this.container);
      this.updateTarget(value);
    }

    this.sourceExpression.connect(this, this.source);
  }
}
