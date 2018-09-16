import { IServiceLocator, Reporter } from '@aurelia/kernel';
import { IExpression } from './ast';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { BindingMode } from './binding-mode';
import { AccessorOrObserver, IBindingTargetObserver, IBindScope, IPropertySubscriber, ISubscribable, MutationKind } from './observation';
import { IObserverLocator } from './observer-locator';

const slotNames: string[] = new Array(100);
const versionSlotNames: string[] = new Array(100);

for (let i = 0; i < 100; i++) {
  slotNames[i] = `_observer${i}`;
  versionSlotNames[i] = `_observerVersion${i}`;
}

export interface IBinding extends IBindScope {
  locator: IServiceLocator;
  observeProperty(obj: any, name: string): void;
}

// TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

// tslint:disable:no-any
export class Binding implements IBinding, IPropertySubscriber {
  public $isBound: boolean = false;

  public targetObserver: AccessorOrObserver;
  /*@internal*/public __connectQueueId: number;
  protected observerSlots: number;
  protected version: number;
  protected $scope: IScope;

  constructor(
    public sourceExpression: IExpression,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    protected observerLocator: IObserverLocator,
    public locator: IServiceLocator) {
  }

  public updateTarget(value: any): void {
    this.targetObserver.setValue(value, BindingFlags.updateTargetInstance);
  }

  public updateSource(value: any): void {
    this.sourceExpression.assign(BindingFlags.updateSourceExpression, this.$scope, this.locator, value);
  }

  public handleChange(newValue: any, previousValue: any, flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;

    if (flags & BindingFlags.updateTargetInstance) {
      const targetObserver = this.targetObserver;
      const mode = this.mode;

      previousValue = targetObserver.getValue();
      newValue = sourceExpression.evaluate(flags, $scope, locator);
      if (newValue !== previousValue) {
        targetObserver.setValue(newValue, flags);
      }
      if (!(mode & oneTime)) {
        this.version++;
        sourceExpression.connect(flags, $scope, this);
        this.unobserve(false);
      }
      return;
    }

    if (flags & BindingFlags.updateSourceExpression) {
      if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
        sourceExpression.assign(flags, $scope, locator, newValue);
      }
      return;
    }

    throw Reporter.error(15, BindingFlags[flags]);
  }

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags);
    }

    this.$isBound = true;
    this.$scope = scope;

    let sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this);
    }

    const mode = this.mode;
    let targetObserver = this.targetObserver as IBindingTargetObserver;
    if (!targetObserver) {
      if (mode & fromView) {
        targetObserver = this.targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty) as IBindingTargetObserver;
      } else {
        targetObserver = this.targetObserver = this.observerLocator.getAccessor(this.target, this.targetProperty) as IBindingTargetObserver;
      }
    }
    if (targetObserver.bind) {
      targetObserver.bind(flags);
    }

    // during bind, binding behavior might have changed sourceExpression
    sourceExpression = this.sourceExpression;
    if (mode & toViewOrOneTime) {
      targetObserver.setValue(sourceExpression.evaluate(flags, scope, this.locator), flags);
    }
    if (mode & toView) {
      sourceExpression.connect(flags, scope, this);
    }
    if (mode & fromView) {
      targetObserver.subscribe(this);
    }
  }

  public $unbind(flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }
    this.$isBound = false;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope, this);
    }
    this.$scope = null;

    const targetObserver = this.targetObserver as IBindingTargetObserver;
    if (targetObserver.unbind) {
      targetObserver.unbind(flags);
    }
    if (targetObserver.unsubscribe) {
      targetObserver.unsubscribe(this);
    }
    this.unobserve(true);
  }

  public connect(flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;

    if (flags & BindingFlags.mustEvaluate) {
      const value = sourceExpression.evaluate(flags, $scope, this.locator);
      this.targetObserver.setValue(value, flags);
    }

    sourceExpression.connect(flags, $scope, this);
  }

  //#region ConnectableBinding
  public addObserver(observer: IBindingTargetObserver): void {
    // find the observer.
    const observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
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
      observer.subscribe(this);
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

  public observeProperty(obj: any, propertyName: string): void {
    const observer = this.observerLocator.getObserver(obj, propertyName) as IBindingTargetObserver;
    /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
     *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
     *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
     *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
     *
     * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
     */
    this.addObserver(observer);
  }

  public unobserve(all?: boolean): void {
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
// tslint:enable:no-any
