import { bindingMode } from './binding-mode';
import { ConnectableBinding } from './connectable-binding';
import { enqueueBindingConnect } from './connect-queue';
import { sourceContext, targetContext } from './call-context';
import { ObserverLocator } from './observer-locator';
import { IExpression, ILookupFunctions } from './ast';
import { Observer } from './property-observation';
import { Scope, IBindScope, IBindingTargetObserver, IBindingTargetAccessor, IObserverLocator } from './binding-interfaces';

export interface IBinding extends IBindScope {
  lookupFunctions: ILookupFunctions;
  observeProperty(context: any, name: string): void;
}

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;

export class Binding extends ConnectableBinding implements IBinding {
  private targetObserver: IBindingTargetObserver | IBindingTargetAccessor;
  private source: Scope;
  private isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: IBindingTarget,
    private targetProperty: string,
    private mode: number,
    public lookupFunctions: ILookupFunctions,
    observerLocator: IObserverLocator = ObserverLocator.instance) {
    super(observerLocator);
  }

  updateTarget(value: any) {
    this.targetObserver.setValue(value, this.target, this.targetProperty);
  }

  updateSource(value: any) {
    this.sourceExpression.assign(this.source, value, this.lookupFunctions);
  }

  call(context: string, newValue: any, oldValue: any) {
    if (!this.isBound) {
      return;
    }

    if (context === sourceContext) {
      oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
      newValue = this.sourceExpression.evaluate(this.source, this.lookupFunctions);

      if (newValue !== oldValue) {
        this.updateTarget(newValue);
      }

      if (this.mode !== bindingMode.oneTime) {
        this.version++;
        this.sourceExpression.connect(this, this.source);
        this.unobserve(false);
      }

      return;
    }

    if (context === targetContext) {
      if (newValue !== this.sourceExpression.evaluate(this.source, this.lookupFunctions)) {
        this.updateSource(newValue);
      }

      return;
    }

    throw new Error(`Unexpected call context ${context}`);
  }

  bind(source: Scope) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }

      this.unbind();
    }

    this.isBound = true;
    this.source = source;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, source);
    }

    let mode = this.mode;

    if (!this.targetObserver) {
      let method: 'getObserver' | 'getAccessor' = mode === bindingMode.twoWay || mode === bindingMode.fromView ? 'getObserver' : 'getAccessor';
      this.targetObserver = this.observerLocator[method](this.target, this.targetProperty);
    }

    if ('bind' in this.targetObserver) {
      this.targetObserver.bind();
    }

    if (this.mode !== bindingMode.fromView) {
      let value = this.sourceExpression.evaluate(source, this.lookupFunctions);
      this.updateTarget(value);
    }

    if (mode === bindingMode.oneTime) {
      return;
    } else if (mode === bindingMode.toView) {
      enqueueBindingConnect(this);
    } else if (mode === bindingMode.twoWay) {
      this.sourceExpression.connect(this, source);
      (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
    } else if (mode === bindingMode.fromView) {
      (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
    }
  }

  unbind() {
    if (!this.isBound) {
      return;
    }

    this.isBound = false;

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
    if (!this.isBound) {
      return;
    }

    if (evaluate) {
      let value = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
      this.updateTarget(value);
    }

    this.sourceExpression.connect(this, this.source);
  }
}

export class TextBinding extends Binding {

  constructor(
    sourceExpression: IExpression,
    target: IBindingTarget,
    lookupFunctions: ILookupFunctions,
    observerLocator: ObserverLocator = ObserverLocator.instance
  ) {
    super(sourceExpression, target.nextSibling, 'textContent', bindingMode.oneWay, lookupFunctions);
    let next = target.nextSibling;
    next['auInterpolationTarget'] = true;
    target.parentNode.removeChild(target);
  }
}

// class NameBinding {
//   constructor(
//     public ast: IExpression,
//     public target: IBindingTarget,
//     public lookupFunctions: ILookupFunctions
//   ) {
//     super();
//   }

//   bind(source) {
//     if (this.isBound) {
//       if (this.source === source) {
//         return;
//       }
//       this.unbind();
//     }
//     this.isBound = true;
//     this.source = source;
//     if (this.sourceExpression.bind) {
//       this.sourceExpression.bind(this, source, this.lookupFunctions);
//     }
//     this.sourceExpression.assign(this.source, this.target, this.lookupFunctions);
//   }

//   unbind() {
//     if (!this.isBound) {
//       return;
//     }
//     this.isBound = false;
//     if (this.sourceExpression.evaluate(this.source, this.lookupFunctions) === this.target) {
//       this.sourceExpression.assign(this.source, null, this.lookupFunctions);
//     }
//     if (this.sourceExpression.unbind) {
//       this.sourceExpression.unbind(this, this.source);
//     }
//     this.source = null;
//   }
// }

