import { BindingMode } from './binding-mode';
import { IObserverLocator } from './observer-locator';
import { IExpression } from './ast';
import { IBindScope, IBindingTargetObserver, IBindingTargetAccessor, IBindingCollectionObserver } from './observation';
import { IServiceLocator } from '../../kernel/di';
import { IScope, sourceContext, targetContext } from './binding-context';
import { Reporter } from '../../kernel/reporter';
import { BindingFlags } from './binding-flags';

const slotNames: string[] = new Array(100);
const versionSlotNames: string[] = new Array(100);

for (let i = 0; i < 100; i++) {
  slotNames[i] = '_observer' + i;
  versionSlotNames[i] = '_observerVersion' + i;
}

export interface IBinding extends IBindScope {
  locator: IServiceLocator;
  observeProperty(context: any, name: string): void;
}

// TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;

export class Binding implements IBinding {
  /*@internal*/public __connectQueueId: number;
  private observerSlots: any;
  private version: number;
  public targetObserver: IBindingTargetObserver | IBindingTargetAccessor;
  private $scope: IScope;
  private $isBound = false;

  constructor(
    public sourceExpression: IExpression,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    private observerLocator: IObserverLocator,
    public locator: IServiceLocator) {
  }

  updateTarget(value: any) {
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
      let method: 'getObserver' | 'getAccessor' = mode === BindingMode.twoWay || mode === BindingMode.fromView ? 'getObserver' : 'getAccessor';
      this.targetObserver = <any>this.observerLocator[method](this.target, this.targetProperty);
    }

    if ('bind' in this.targetObserver) {
      this.targetObserver.bind(flags);
    }

    if (this.mode !== BindingMode.fromView) {
      let value = this.sourceExpression.evaluate(flags, scope, this.locator);
      this.updateTarget(value);
    }

    if (mode === BindingMode.oneTime) {
      return;
    } else if (mode === BindingMode.toView) {
      this.sourceExpression.connect(flags, scope, this);
    } else if (mode === BindingMode.twoWay) {
      this.sourceExpression.connect(flags, scope, this);
      (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
    } else if (mode === BindingMode.fromView) {
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

  //#region ConnectableBinding
  addObserver(observer: IBindingTargetObserver | IBindingCollectionObserver) {
    // find the observer.
    let observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
    let i = observerSlots;

    while (i-- && this[slotNames[i]] !== observer) {
      // Do nothing
    }

    // if we are not already observing, put the observer in an open slot and subscribe.
    if (i === -1) {
      i = 0;
      while (this[slotNames[i]]) {
        i++;
      }
      this[slotNames[i]] = observer;
      observer.subscribe(sourceContext, this);
      // increment the slot count.
      if (i === observerSlots) {
        this.observerSlots = i + 1;
      }
    }
    // set the "version" when the observer was used.
    if (this.version === undefined) {
      this.version = 0;
    }
    this[versionSlotNames[i]] = this.version;
  }

  observeProperty(obj: any, propertyName: string) {
    let observer = this.observerLocator.getObserver(obj, propertyName);
    this.addObserver(<any>observer);
  }

  observeArray(array: any[]) {
    let observer = this.observerLocator.getArrayObserver(array);
    this.addObserver(observer);
  }

  unobserve(all?: boolean) {
    const slots = this.observerSlots;
    let i = 0;
    let slotName;
    let observer;
    if (all) {
      // forward array processing is easier on the cpu than backwards (unlike a loop without array processing)
      while (i < slots) {
        slotName = slotNames[i];
        if (observer = this[slotName]) {
          this[slotName] = null;
          observer.unsubscribe(this);
        }
        i++;
      }
    } else {
      const version = this.version;
      while (i < slots) {
        if (this[versionSlotNames[i]] !== version) {
          slotName = slotNames[i];
          if (observer = this[slotName]) {
            this[slotName] = null;
            observer.unsubscribe(this);
          }
        }
        i++;
      }
    }
  }
  //#endregion
}
