import { IServiceLocator, Reporter } from '@aurelia/kernel';
import { IExpression } from './ast';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { BindingMode } from './binding-mode';
import { IBindingTargetAccessor, IBindingTargetObserver, IBindScope, IPropertySubscriber, ISubscribable, MutationKind, IBatchedPropertySubscriber } from './observation';
import { IObserverLocator } from './observer-locator';

const slotNames: string[] = new Array(100);
const versionSlotNames: string[] = new Array(100);

for (let i = 0; i < 100; i++) {
  slotNames[i] = '_observer' + i;
  versionSlotNames[i] = '_observerVersion' + i;
}

export interface IBinding extends IBindScope {
  locator: IServiceLocator;
  observeProperty(flags: BindingFlags, context: any, name: string): void;
}

// TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

export class Binding implements IBinding, IPropertySubscriber, IBatchedPropertySubscriber {
  public handleBatchedChange: (newValue: any, oldValue?: any, flags?: BindingFlags) => void;
  public targetObserver: IBindingTargetObserver | IBindingTargetAccessor;
  /*@internal*/public __connectQueueId: number;
  private observerSlots: any;
  private version: number;
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

  public updateTarget(value: any) {
    this.targetObserver.setValue(value, this.target, this.targetProperty);
  }

  public updateSource(value: any) {
    this.sourceExpression.assign(BindingFlags.none, this.$scope, this.locator, value);
  }

  public handleChange(newValue: any, previousValue?: any, flags?: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;

    if (flags & BindingFlags.sourceContext) {
      const target = this.target;
      const targetProperty = this.targetProperty;
      const targetObserver = this.targetObserver;
      const mode = this.mode;

      previousValue = targetObserver.getValue(target, targetProperty);
      newValue = sourceExpression.evaluate(flags, $scope, locator);
      if (newValue !== previousValue) {
        targetObserver.setValue(newValue, target, targetProperty);
      }
      if (!(mode & oneTime)) {
        this.version++;
        sourceExpression.connect(flags, $scope, this);
        this.unobserve(false);
      }
      return;
    }

    if (flags & BindingFlags.targetContext) {
      if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
        sourceExpression.assign(flags, $scope, locator, newValue)
      }
      return;
    }

    throw Reporter.error(15, context);
  }

  public $bind(flags: BindingFlags, scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags);
    }

    this.$isBound = true;
    this.$scope = scope;
    const mode = this.mode;
    const sourceExpression = this.sourceExpression;
    let targetObserver = this.targetObserver;

    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this);
    }
    if (!targetObserver) {
      if (mode & fromView) {
        targetObserver = this.targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty);
      } else {
        targetObserver = this.targetObserver = this.observerLocator.getAccessor(this.target, this.targetProperty);
      }
    }
    if ((<any>targetObserver).bind) {
      (<any>targetObserver).bind(flags);
    }

    if (mode & toViewOrOneTime) {
      targetObserver.setValue(sourceExpression.evaluate(flags, scope, this.locator), this.target, this.targetProperty);
    }
    if (mode & toView) {
      sourceExpression.connect(flags, scope, this);
    }
    if (mode & fromView) {
      (<ISubscribable<MutationKind.instance>>targetObserver).subscribe(this, BindingFlags.targetContext);
    }
  }

  public $unbind(flags: BindingFlags) {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;
    const sourceExpression = this.sourceExpression;
    const targetObserver = this.targetObserver as IBindingTargetObserver;

    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;

    if (targetObserver.unbind) {
      targetObserver.unbind(flags);
    }
    if (targetObserver.unsubscribe) {
      targetObserver.unsubscribe(this, BindingFlags.targetContext);
    }

    this.unobserve(true);
  }

  public connect(flags: BindingFlags) {
    if (!this.$isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;

    if (flags & BindingFlags.mustEvaluate) {
      const value = sourceExpression.evaluate(flags, $scope, this.locator);
      this.targetObserver.setValue(value, this.target, this.targetProperty);
    }

    sourceExpression.connect(flags, $scope, this);
  }

  //#region ConnectableBinding
  public addObserver(observer: IBindingTargetObserver) {
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
      observer.subscribe(this, BindingFlags.sourceContext);
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

  public observeProperty(flags: BindingFlags, obj: any, propertyName: string) {
    let observer = this.observerLocator.getObserver(obj, propertyName);
    this.addObserver(<any>observer);
  }

  public observeArray(array: any[]) {
    // TODO: fix this
    // let observer = this.observerLocator.getArrayObserver(array);
    // this.addObserver(observer);
  }

  public unobserve(all?: boolean) {
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

Binding.prototype.handleBatchedChange = Binding.prototype.handleChange;
