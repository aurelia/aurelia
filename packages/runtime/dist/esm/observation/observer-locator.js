import { DI, isArrayIndex, ILogger } from '@aurelia/kernel';
import { getArrayObserver } from './array-observer.js';
import { ComputedObserver } from './computed-observer.js';
import { IDirtyChecker } from './dirty-checker.js';
import { getMapObserver } from './map-observer.js';
import { PrimitiveObserver } from './primitive-observer.js';
import { PropertyAccessor } from './property-accessor.js';
import { getSetObserver } from './set-observer.js';
import { SetterObserver } from './setter-observer.js';
import { def } from '../utilities-objects.js';
export const propertyAccessor = new PropertyAccessor();
export const IObserverLocator = DI.createInterface('IObserverLocator', x => x.singleton(ObserverLocator));
export const INodeObserverLocator = DI
    .createInterface('INodeObserverLocator', x => x.cachedCallback(handler => {
    handler.getAll(ILogger).forEach(logger => {
        logger.error('Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).');
    });
    return new DefaultNodeObserverLocator();
}));
class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return propertyAccessor;
    }
    getAccessor() {
        return propertyAccessor;
    }
}
export class ObserverLocator {
    constructor(dirtyChecker, nodeObserverLocator) {
        this.dirtyChecker = dirtyChecker;
        this.nodeObserverLocator = nodeObserverLocator;
        this.adapters = [];
    }
    addAdapter(adapter) {
        this.adapters.push(adapter);
    }
    getObserver(obj, key) {
        var _a, _b;
        return (_b = (_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : this.cache(obj, key, this.createObserver(obj, key));
    }
    getAccessor(obj, key) {
        var _a;
        const cached = (_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[key];
        if (cached !== void 0) {
            return cached;
        }
        if (this.nodeObserverLocator.handles(obj, key, this)) {
            return this.nodeObserverLocator.getAccessor(obj, key, this);
        }
        return propertyAccessor;
    }
    getArrayObserver(observedArray) {
        return getArrayObserver(observedArray);
    }
    getMapObserver(observedMap) {
        return getMapObserver(observedMap);
    }
    getSetObserver(observedSet) {
        return getSetObserver(observedSet);
    }
    createObserver(obj, key) {
        var _a, _b, _c, _d;
        if (!(obj instanceof Object)) {
            return new PrimitiveObserver(obj, key);
        }
        if (this.nodeObserverLocator.handles(obj, key, this)) {
            return this.nodeObserverLocator.getObserver(obj, key, this);
        }
        switch (key) {
            case 'length':
                if (obj instanceof Array) {
                    return getArrayObserver(obj).getLengthObserver();
                }
                break;
            case 'size':
                if (obj instanceof Map) {
                    return getMapObserver(obj).getLengthObserver();
                }
                else if (obj instanceof Set) {
                    return getSetObserver(obj).getLengthObserver();
                }
                break;
            default:
                if (obj instanceof Array && isArrayIndex(key)) {
                    return getArrayObserver(obj).getIndexObserver(Number(key));
                }
                break;
        }
        let pd = Object.getOwnPropertyDescriptor(obj, key);
        // Only instance properties will yield a descriptor here, otherwise walk up the proto chain
        if (pd === void 0) {
            let proto = Object.getPrototypeOf(obj);
            while (proto !== null) {
                pd = Object.getOwnPropertyDescriptor(proto, key);
                if (pd === void 0) {
                    proto = Object.getPrototypeOf(proto);
                }
                else {
                    break;
                }
            }
        }
        // If the descriptor does not have a 'value' prop, it must have a getter and/or setter
        if (pd !== void 0 && !Object.prototype.hasOwnProperty.call(pd, 'value')) {
            let obs = this.getAdapterObserver(obj, key, pd);
            if (obs == null) {
                obs = (_d = ((_b = (_a = pd.get) === null || _a === void 0 ? void 0 : _a.getObserver) !== null && _b !== void 0 ? _b : (_c = pd.set) === null || _c === void 0 ? void 0 : _c.getObserver)) === null || _d === void 0 ? void 0 : _d(obj, this);
            }
            return obs == null
                ? pd.configurable
                    ? ComputedObserver.create(obj, key, pd, this, /* AOT: not true for IE11 */ true)
                    : this.dirtyChecker.createProperty(obj, key)
                : obs;
        }
        // Ordinary get/set observation (the common use case)
        // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
        return new SetterObserver(obj, key);
    }
    getAdapterObserver(obj, propertyName, pd) {
        if (this.adapters.length > 0) {
            for (const adapter of this.adapters) {
                const observer = adapter.getObserver(obj, propertyName, pd, this);
                if (observer != null) {
                    return observer;
                }
            }
        }
        return null;
    }
    cache(obj, key, observer) {
        if (observer.doNotCache === true) {
            return observer;
        }
        if (obj.$observers === void 0) {
            def(obj, '$observers', { value: { [key]: observer } });
            return observer;
        }
        return obj.$observers[key] = observer;
    }
}
ObserverLocator.inject = [IDirtyChecker, INodeObserverLocator];
export function getCollectionObserver(collection) {
    let obs;
    if (collection instanceof Array) {
        obs = getArrayObserver(collection);
    }
    else if (collection instanceof Map) {
        obs = getMapObserver(collection);
    }
    else if (collection instanceof Set) {
        obs = getSetObserver(collection);
    }
    return obs;
}
//# sourceMappingURL=observer-locator.js.map