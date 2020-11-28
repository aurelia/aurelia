import {
  Class,
  IServiceLocator,
  ResourceDefinition
} from '@aurelia/kernel';
import {
  IConnectable,
  IBindingTargetObserver,
  ISubscribable,
  ISubscriber,
  IBinding,
  LifecycleFlags,
} from '../observation.js';
import { IObserverLocator } from '../observation/observer-locator.js';
import { defineHiddenProp, ensureProto } from '../utilities-objects.js';
import type { Scope } from '../observation/binding-context.js';

// TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time

const slotNames: string[] = [];
const versionSlotNames: string[] = [];
let lastSlot = -1;
function ensureEnoughSlotNames(currentSlot: number): void {
  if (currentSlot === lastSlot) {
    lastSlot += 5;
    const ii = slotNames.length = versionSlotNames.length = lastSlot + 1;
    for (let i = currentSlot + 1; i < ii; ++i) {
      slotNames[i] = `_o${i}`;
      versionSlotNames[i] = `_v${i}`;
    }
  }
}
ensureEnoughSlotNames(-1);

export interface IPartialConnectableBinding extends IBinding, ISubscriber {
  observerLocator: IObserverLocator;
}

export interface IConnectableBinding extends IPartialConnectableBinding, IConnectable {
  // probably this id shouldn't be on binding
  id: number;
  record: BindingObserverRecord;
  addObserver(observer: ISubscribable): void;
  unobserve(all?: boolean): void;
}

/** @internal */
export function addObserver(
  this: IConnectableBinding & { [key: string]: ISubscribable & { [id: number]: number } | number },
  observer: ISubscribable & { [id: number]: number }
): void {
  this.record.add(observer);
  // // find the observer.
  // const observerSlots = this.observerSlots == null ? 0 : this.observerSlots;
  // let i = observerSlots;

  // while (i-- && this[slotNames[i]] !== observer);

  // // if we are not already observing, put the observer in an open slot and subscribe.
  // if (i === -1) {
  //   i = 0;
  //   while (this[slotNames[i]]) {
  //     i++;
  //   }
  //   this[slotNames[i]] = observer;
  //   observer.subscribe(this);
  //   observer[this.id] |= LifecycleFlags.updateTarget;
  //   // increment the slot count.
  //   if (i === observerSlots) {
  //     this.observerSlots = i + 1;
  //   }
  // }
  // // set the "version" when the observer was used.
  // if (this.version == null) {
  //   this.version = 0;
  // }
  // this[versionSlotNames[i]] = this.version;
  // ensureEnoughSlotNames(i);
}

/** @internal */
export function observeProperty(this: IConnectableBinding, obj: object, propertyName: string): void {
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

/** @internal */
export function unobserve(this: IConnectableBinding & { [key: string]: unknown }, all?: boolean): void {
  this.record.clear(all);
  // const slots = this.observerSlots;
  // let slotName: string;
  // let observer: IBindingTargetObserver & { [key: string]: number };
  // if (all === true) {
  //   for (let i = 0; i < slots; ++i) {
  //     slotName = slotNames[i];
  //     observer = this[slotName] as IBindingTargetObserver & { [key: string]: number };
  //     if (observer != null) {
  //       this[slotName] = void 0;
  //       observer.unsubscribe(this);
  //       observer[this.id] &= ~LifecycleFlags.updateTarget;
  //     }
  //   }
  //   this.observerSlots = 0;
  // } else {
  //   const version = this.version;
  //   for (let i = 0; i < slots; ++i) {
  //     if (this[versionSlotNames[i]] !== version) {
  //       slotName = slotNames[i];
  //       observer = this[slotName] as IBindingTargetObserver & { [key: string]: number };
  //       if (observer != null) {
  //         this[slotName] = void 0;
  //         observer.unsubscribe(this);
  //         observer[this.id] &= ~LifecycleFlags.updateTarget;
  //         this.observerSlots--;
  //       }
  //     }
  //   }
  // }
}

export function getRecord(this: IConnectableBinding) {
  const record = new BindingObserverRecord(this);
  defineHiddenProp(this, 'record', record);
  return record;
}

type ObservationRecordImplType = {
  id: number;
  version: number;
  count: number;
  binding: IConnectableBinding;
} & ISubscriber & Record<string, unknown>;

export interface BindingObserverRecord extends ISubscriber, ObservationRecordImplType {}
export class BindingObserverRecord implements ISubscriber {
  public id!: number;
  public version: number = 0;
  public count: number = 0;

  public constructor(
    public binding: IConnectableBinding
  ) {
    connectable.assignIdTo(this);
  }

  public handleChange(value: unknown, oldValue: unknown, flags: LifecycleFlags): unknown {
    return this.binding.interceptor.handleChange(value, oldValue, flags);
  }

  public add(observer: ISubscribable & { [id: number]: number }): void {
    // find the observer.
    const observerSlots = this.count == null ? 0 : this.count;
    let i = observerSlots;

    while (i-- && this[slotNames[i]] !== observer);

    // if we are not already observing, put the observer in an open slot and subscribe.
    if (i === -1) {
      i = 0;
      while (this[slotNames[i]]) {
        i++;
      }
      this[slotNames[i]] = observer;
      observer.subscribe(this);
      observer[this.id] |= LifecycleFlags.updateTarget;
      // increment the slot count.
      if (i === observerSlots) {
        this.count = i + 1;
      }
    }
    this[versionSlotNames[i]] = this.version;
    ensureEnoughSlotNames(i);
  }

  public clear(all?: boolean): void {
    const slotCount = this.count;
    let slotName: string;
    let observer: IBindingTargetObserver & { [key: string]: number };
    if (all === true) {
      for (let i = 0; i < slotCount; ++i) {
        slotName = slotNames[i];
        observer = this[slotName] as IBindingTargetObserver & { [key: string]: number };
        if (observer != null) {
          this[slotName] = void 0;
          observer.unsubscribe(this);
          observer[this.id] &= ~LifecycleFlags.updateTarget;
        }
      }
      this.count = 0;
    } else {
      for (let i = 0; i < slotCount; ++i) {
        if (this[versionSlotNames[i]] !== this.version) {
          slotName = slotNames[i];
          observer = this[slotName] as IBindingTargetObserver & { [key: string]: number };
          if (observer != null) {
            this[slotName] = void 0;
            observer.unsubscribe(this);
            observer[this.id] &= ~LifecycleFlags.updateTarget;
            this.count--;
          }
        }
      }
    }
  }
}

type DecoratableConnectable<TProto, TClass> = Class<TProto & Partial<IConnectableBinding> & IPartialConnectableBinding, TClass>;
type DecoratedConnectable<TProto, TClass> = Class<TProto & IConnectableBinding, TClass>;

function connectableDecorator<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass> {
  const proto = target.prototype;
  ensureProto(proto, 'observeProperty', observeProperty, true);
  ensureProto(proto, 'unobserve', unobserve, true);
  ensureProto(proto, 'addObserver', addObserver, true);
  Reflect.defineProperty(proto, 'record', {
    configurable: true,
    get: getRecord,
  });
  return target as DecoratedConnectable<TProto, TClass>;
}

export function connectable(): typeof connectableDecorator;
export function connectable<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export function connectable<TProto, TClass>(target?: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass> | typeof connectableDecorator {
  return target == null ? connectableDecorator : connectableDecorator(target);
}

let value = 0;

connectable.assignIdTo = (instance: IConnectableBinding | BindingObserverRecord): void => {
  instance.id = ++value;
};

export type MediatedBinding<K extends string> = {
  [key in K]: (newValue: unknown, previousValue: unknown, flags: LifecycleFlags) => void;
};

export interface BindingMediator<K extends string> extends IConnectableBinding { }
// @connectable
export class BindingMediator<K extends string> implements IConnectableBinding {
  public constructor(
    public readonly key: K,
    public readonly binding: MediatedBinding<K>,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
  ) {
    connectable.assignIdTo(this);
  }

  public $bind(flags: LifecycleFlags, scope: Scope, hostScope?: Scope | null, projection?: ResourceDefinition): void {
    throw new Error('Method not implemented.');
  }

  public $unbind(flags: LifecycleFlags): void {
    throw new Error('Method not implemented.');
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    this.binding[this.key](newValue, previousValue, flags);
  }
}

connectableDecorator(BindingMediator);
