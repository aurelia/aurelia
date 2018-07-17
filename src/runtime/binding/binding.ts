import { ConnectableBinding } from './connectable-binding';
import { enqueueBindingConnect } from './connect-queue';
import { IObserverLocator } from './observer-locator';
import { IExpression } from './ast';
import { IBindScope, IBindingTargetObserver, IBindingTargetAccessor } from './observation';
import { IServiceLocator } from '../../kernel/di';
import { IScope, sourceContext, targetContext } from './binding-context';
import { Reporter } from '../../kernel/reporter';

export enum BindingFlags {
  none             = 0b00000,
  mustEvaluate     = 0b00001,
  instanceMutation = 0b00010,
  itemsMutation    = 0b00100,
  connectImmediate = 0b01000,
  createObjects    = 0b10000
}

export enum BindingMode {
  oneTime  = 0b00,
  toView   = 0b01,
  fromView = 0b10,
  twoWay   = 0b11
}

export interface IBinding extends IBindScope {
  locator: IServiceLocator;
  observeProperty(context: any, name: string): void;
}

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;
const primitiveTypes = { string: true, number: true, boolean: true, undefined: true };

export class Binding extends ConnectableBinding implements IBinding {
  public targetObserver: IBindingTargetObserver | IBindingTargetAccessor;
  private $scope: IScope;
  private $isBound = false;
  private prevValue: any;

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
    if (primitiveTypes[typeof value]) {
      // this is a "last defense" of sorts against unnecessary setters, particularly beneficial for
      // the performance and simplicity of the repeater 

      // this might not be the best place to be checking if the target value needs to be set or not
      // and the mechanism of checking that might not be correct / robust enough (are there any cases when it absolutely
      // must be done by the observer?) and this may promote sloppy code ("binding will take care of it anyway")

      // in other words, this is a hack and we should not rest until we found the ultimate clean method of
      // preventing redundant setters
      if (value === this.prevValue) {
        return;
      } else {
        this.prevValue = value;
      }
    }
    this.targetObserver.setValue(value, this.target, this.targetProperty);
  }

  updateSource(value: any) {
    this.sourceExpression.assign(BindingFlags.none, this.$scope, this.locator, value);
  }

  call(context: string, newValue?: any, oldValue?: any) {
    if (!this.$isBound) {
      return;
    }

    if (context === sourceContext) {
      oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
      newValue = this.sourceExpression.evaluate(BindingFlags.none, this.$scope, this.locator);

      if (newValue !== oldValue) {
        this.updateTarget(newValue);
      }

      if (this.mode !== BindingMode.oneTime) {
        this.version++;
        this.sourceExpression.connect(BindingFlags.none, this.$scope, this);
        this.unobserve(false);
      }

      return;
    }

    if (context === targetContext) {
      if (newValue !== this.sourceExpression.evaluate(BindingFlags.none, this.$scope, this.locator)) {
        this.updateSource(newValue);
      }

      return;
    }

    throw Reporter.error(15, context);
  }

  $bind(flags: BindingFlags, scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$isBound = true;
    this.$scope = scope;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(flags, scope, this);
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
      this.updateTarget(this.sourceExpression.evaluate(flags, scope, this.locator));
    } else {
      if (mode & BindingMode.toView) {
        this.updateTarget(this.sourceExpression.evaluate(flags, scope, this.locator));
      }
      if (flags & BindingFlags.connectImmediate) {
        this.sourceExpression.connect(flags, scope, this);
      } else {
        enqueueBindingConnect(this);
      }
    }
    if (mode & BindingMode.fromView) {
      (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
    }
  }

  $unbind(flags: BindingFlags) {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(flags, this.$scope, this);
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
      let value = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
      this.updateTarget(value);
    }

    this.sourceExpression.connect(flags, this.$scope, this);
  }
}
