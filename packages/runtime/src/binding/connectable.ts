import { Class, IIndexable, Tracer } from '@aurelia/kernel';
import { IConnectable } from '../ast';
import { LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { IBindingTargetObserver, IPatchable, IPropertySubscriber, ISubscribable, MutationKind } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';

// TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time

const slice = Array.prototype.slice;

const slotNames: string[] = [];
const versionSlotNames: string[] = [];
let lastSlot = -1;
function ensureEnoughSlotNames(currentSlot: number): void {
  if (currentSlot === lastSlot) {
    lastSlot += 5;
    const ii = slotNames.length = versionSlotNames.length = lastSlot + 1;
    for (let i = currentSlot + 1; i < ii; ++i) {
      slotNames[i] = `_observer${i}`;
      versionSlotNames[i] = `_observerVersion${i}`;
    }
  }
}
ensureEnoughSlotNames(-1);

export interface IPartialConnectableBinding extends IBinding, IPropertySubscriber {
  observerLocator: IObserverLocator;
}

export interface IConnectableBinding extends IPartialConnectableBinding, IConnectable, IPatchable {
  id: string;
  $nextConnect?: IConnectableBinding;
  observerSlots: number;
  version: number;
  addObserver(observer: ISubscribable<MutationKind.instance | MutationKind.proxy>): void;
  unobserve(all?: boolean): void;
}

/** @internal */
export function addObserver(this: IConnectableBinding, observer: ISubscribable<MutationKind.instance | MutationKind.proxy>): void {
  // find the observer.
  const observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
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
    observer[this.id] |= LifecycleFlags.updateTargetInstance;
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
  ensureEnoughSlotNames(i);
}

/** @internal */
export function observeProperty(this: IConnectableBinding, flags: LifecycleFlags, obj: IIndexable, propertyName: string): void {
  if (Tracer.enabled) { Tracer.enter(this['constructor'].name, 'observeProperty', slice.call(arguments)); }
  const observer = this.observerLocator.getObserver(flags, obj, propertyName) as IBindingTargetObserver;
  /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
   *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
   *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
   *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
   *
   * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
   */
  this.addObserver(observer);
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function unobserve(this: IConnectableBinding, all?: boolean): void {
  const slots = this.observerSlots;
  let slotName: string;
  let observer: IBindingTargetObserver;
  if (all === true) {
    for (let i = 0; i < slots; ++i) {
      slotName = slotNames[i];
      observer = this[slotName];
      if (observer !== null && observer !== undefined) {
        this[slotName] = null;
        observer.unsubscribe(this);
        observer[this.id] &= ~LifecycleFlags.updateTargetInstance;
      }
    }
  } else {
    const version = this.version;
    for (let i = 0; i < slots; ++i) {
      if (this[versionSlotNames[i]] !== version) {
        slotName = slotNames[i];
        observer = this[slotName];
        if (observer !== null && observer !== undefined) {
          this[slotName] = null;
          observer.unsubscribe(this);
          observer[this.id] &= ~LifecycleFlags.updateTargetInstance;
        }
      }
    }
  }
}

type DecoratableConnectable<TProto, TClass> = Class<TProto & Partial<IConnectableBinding> & IPartialConnectableBinding, TClass>;
type DecoratedConnectable<TProto, TClass> = Class<TProto & IConnectableBinding, TClass>;

function connectableDecorator<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass> {
  const proto = target.prototype;
  if (!proto.hasOwnProperty('observeProperty')) proto.observeProperty = observeProperty;
  if (!proto.hasOwnProperty('unobserve')) proto.unobserve = unobserve;
  if (!proto.hasOwnProperty('addObserver')) proto.addObserver = addObserver;
  return target as DecoratedConnectable<TProto, TClass>;
}

export function connectable(): typeof connectableDecorator;
export function connectable<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export function connectable<TProto, TClass>(target?: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass> | typeof connectableDecorator {
  return target === undefined ? connectableDecorator : connectableDecorator(target);
}

const idAttributes: PropertyDescriptor = {
  configurable: false,
  enumerable: false,
  writable: false,
  value: 0
};
connectable.assignIdTo = (instance: IConnectableBinding): void => {
  ++idAttributes.value;
  Reflect.defineProperty(instance, 'id', idAttributes);
};
