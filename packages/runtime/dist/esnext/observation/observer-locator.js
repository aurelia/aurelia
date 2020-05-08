var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DI, Registration, Reporter, isArrayIndex, } from '@aurelia/kernel';
import { ILifecycle } from '../lifecycle';
import { getArrayObserver } from './array-observer';
import { createComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { getMapObserver } from './map-observer';
import { PrimitiveObserver } from './primitive-observer';
import { PropertyAccessor } from './property-accessor';
import { ProxyObserver } from './proxy-observer';
import { getSetObserver } from './set-observer';
import { SetterObserver } from './setter-observer';
import { IScheduler } from '@aurelia/scheduler';
const toStringTag = Object.prototype.toString;
export const IObserverLocator = DI.createInterface('IObserverLocator').noDefault();
export const ITargetObserverLocator = DI.createInterface('ITargetObserverLocator').noDefault();
export const ITargetAccessorLocator = DI.createInterface('ITargetAccessorLocator').noDefault();
function getPropertyDescriptor(subject, name) {
    let pd = Object.getOwnPropertyDescriptor(subject, name);
    let proto = Object.getPrototypeOf(subject);
    while (pd == null && proto != null) {
        pd = Object.getOwnPropertyDescriptor(proto, name);
        proto = Object.getPrototypeOf(proto);
    }
    return pd;
}
/** @internal */
let ObserverLocator = class ObserverLocator {
    constructor(lifecycle, scheduler, dirtyChecker, targetObserverLocator, targetAccessorLocator) {
        this.lifecycle = lifecycle;
        this.scheduler = scheduler;
        this.dirtyChecker = dirtyChecker;
        this.targetObserverLocator = targetObserverLocator;
        this.targetAccessorLocator = targetAccessorLocator;
        this.adapters = [];
    }
    static register(container) {
        return Registration.singleton(IObserverLocator, this).register(container);
    }
    getObserver(flags, obj, propertyName) {
        if (flags & 2 /* proxyStrategy */ && typeof obj === 'object') {
            return ProxyObserver.getOrCreate(obj, propertyName); // TODO: fix typings (and ensure proper contracts ofc)
        }
        if (isBindingContext(obj)) {
            return obj.getObservers(flags).getOrCreate(this.lifecycle, flags, obj, propertyName);
        }
        let observersLookup = obj.$observers;
        if (observersLookup && propertyName in observersLookup) {
            return observersLookup[propertyName];
        }
        const observer = this.createPropertyObserver(flags, obj, propertyName);
        if (!observer.doNotCache) {
            if (observersLookup === void 0) {
                observersLookup = this.getOrCreateObserversLookup(obj);
            }
            observersLookup[propertyName] = observer;
        }
        return observer;
    }
    addAdapter(adapter) {
        this.adapters.push(adapter);
    }
    getAccessor(flags, obj, propertyName) {
        if (this.targetAccessorLocator.handles(flags, obj)) {
            if (this.targetObserverLocator.overridesAccessor(flags, obj, propertyName)) {
                return this.getObserver(flags, obj, propertyName);
            }
            return this.targetAccessorLocator.getAccessor(flags, this.scheduler, this.lifecycle, obj, propertyName);
        }
        if (flags & 2 /* proxyStrategy */) {
            return ProxyObserver.getOrCreate(obj, propertyName);
        }
        return new PropertyAccessor(obj, propertyName);
    }
    getArrayObserver(flags, observedArray) {
        return getArrayObserver(flags, this.lifecycle, observedArray);
    }
    getMapObserver(flags, observedMap) {
        return getMapObserver(flags, this.lifecycle, observedMap);
    }
    getSetObserver(flags, observedSet) {
        return getSetObserver(flags, this.lifecycle, observedSet);
    }
    getOrCreateObserversLookup(obj) {
        return obj.$observers || this.createObserversLookup(obj);
    }
    createObserversLookup(obj) {
        const value = {};
        if (!Reflect.defineProperty(obj, '$observers', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: value
        })) {
            Reporter.write(0, obj);
        }
        return value;
    }
    getAdapterObserver(flags, obj, propertyName, descriptor) {
        for (let i = 0, ii = this.adapters.length; i < ii; i++) {
            const adapter = this.adapters[i];
            const observer = adapter.getObserver(flags, obj, propertyName, descriptor);
            if (observer != null) {
                return observer;
            }
        }
        return null;
    }
    createPropertyObserver(flags, obj, propertyName) {
        if (!(obj instanceof Object)) {
            return new PrimitiveObserver(obj, propertyName);
        }
        let isNode = false;
        if (this.targetObserverLocator.handles(flags, obj)) {
            const observer = this.targetObserverLocator.getObserver(flags, this.scheduler, this.lifecycle, this, obj, propertyName);
            if (observer != null) {
                return observer;
            }
            isNode = true;
        }
        const tag = toStringTag.call(obj);
        switch (tag) {
            case '[object Array]':
                if (propertyName === 'length') {
                    return this.getArrayObserver(flags, obj).getLengthObserver();
                }
                // is numer only returns true for integer
                if (isArrayIndex(propertyName)) {
                    return this.getArrayObserver(flags, obj).getIndexObserver(Number(propertyName));
                }
                break;
            case '[object Map]':
                if (propertyName === 'size') {
                    return this.getMapObserver(flags, obj).getLengthObserver();
                }
                break;
            case '[object Set]':
                if (propertyName === 'size') {
                    return this.getSetObserver(flags, obj).getLengthObserver();
                }
                break;
        }
        const descriptor = getPropertyDescriptor(obj, propertyName);
        if (descriptor != null && (descriptor.get != null || descriptor.set != null)) {
            if (descriptor.get != null && descriptor.get.getObserver != null) {
                return descriptor.get.getObserver(obj);
            }
            // attempt to use an adapter before resorting to dirty checking.
            const adapterObserver = this.getAdapterObserver(flags, obj, propertyName, descriptor);
            if (adapterObserver != null) {
                return adapterObserver;
            }
            if (isNode) {
                // TODO: use MutationObserver
                return this.dirtyChecker.createProperty(obj, propertyName);
            }
            return createComputedObserver(flags, this, this.dirtyChecker, this.lifecycle, obj, propertyName, descriptor);
        }
        return new SetterObserver(this.lifecycle, flags, obj, propertyName);
    }
};
ObserverLocator = __decorate([
    __param(0, ILifecycle),
    __param(1, IScheduler),
    __param(2, IDirtyChecker),
    __param(3, ITargetObserverLocator),
    __param(4, ITargetAccessorLocator),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ObserverLocator);
export { ObserverLocator };
export function getCollectionObserver(flags, lifecycle, collection) {
    // If the collection is wrapped by a proxy then `$observer` will return the proxy observer instead of the collection observer, which is not what we want
    // when we ask for getCollectionObserver
    const rawCollection = collection instanceof Object ? ProxyObserver.getRawIfProxy(collection) : collection;
    switch (toStringTag.call(collection)) {
        case '[object Array]':
            return getArrayObserver(flags, lifecycle, rawCollection);
        case '[object Map]':
            return getMapObserver(flags, lifecycle, rawCollection);
        case '[object Set]':
            return getSetObserver(flags, lifecycle, rawCollection);
    }
    return void 0;
}
function isBindingContext(obj) {
    return obj.$synthetic === true;
}
//# sourceMappingURL=observer-locator.js.map