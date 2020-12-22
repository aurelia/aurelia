"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionObserver = exports.ObserverLocator = exports.INodeObserverLocator = exports.IObserverLocator = exports.propertyAccessor = void 0;
const kernel_1 = require("@aurelia/kernel");
const array_observer_js_1 = require("./array-observer.js");
const computed_observer_js_1 = require("./computed-observer.js");
const dirty_checker_js_1 = require("./dirty-checker.js");
const map_observer_js_1 = require("./map-observer.js");
const primitive_observer_js_1 = require("./primitive-observer.js");
const property_accessor_js_1 = require("./property-accessor.js");
const set_observer_js_1 = require("./set-observer.js");
const setter_observer_js_1 = require("./setter-observer.js");
const utilities_objects_js_1 = require("../utilities-objects.js");
exports.propertyAccessor = new property_accessor_js_1.PropertyAccessor();
exports.IObserverLocator = kernel_1.DI.createInterface('IObserverLocator', x => x.singleton(ObserverLocator));
exports.INodeObserverLocator = kernel_1.DI
    .createInterface('INodeObserverLocator', x => x.cachedCallback(handler => {
    handler.getAll(kernel_1.ILogger).forEach(logger => {
        logger.error('Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).');
    });
    return new DefaultNodeObserverLocator();
}));
class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return exports.propertyAccessor;
    }
    getAccessor() {
        return exports.propertyAccessor;
    }
}
class ObserverLocator {
    constructor(dirtyChecker, nodeObserverLocator) {
        this.dirtyChecker = dirtyChecker;
        this.nodeObserverLocator = nodeObserverLocator;
        this.adapters = [];
    }
    addAdapter(adapter) {
        this.adapters.push(adapter);
    }
    getObserver(obj, key) {
        return obj.$observers?.[key]
            ?? this.cache(obj, key, this.createObserver(obj, key));
    }
    getAccessor(obj, key) {
        const cached = obj.$observers?.[key];
        if (cached !== void 0) {
            return cached;
        }
        if (this.nodeObserverLocator.handles(obj, key, this)) {
            return this.nodeObserverLocator.getAccessor(obj, key, this);
        }
        return exports.propertyAccessor;
    }
    getArrayObserver(observedArray) {
        return array_observer_js_1.getArrayObserver(observedArray);
    }
    getMapObserver(observedMap) {
        return map_observer_js_1.getMapObserver(observedMap);
    }
    getSetObserver(observedSet) {
        return set_observer_js_1.getSetObserver(observedSet);
    }
    createObserver(obj, key) {
        if (!(obj instanceof Object)) {
            return new primitive_observer_js_1.PrimitiveObserver(obj, key);
        }
        if (this.nodeObserverLocator.handles(obj, key, this)) {
            return this.nodeObserverLocator.getObserver(obj, key, this);
        }
        switch (key) {
            case 'length':
                if (obj instanceof Array) {
                    return array_observer_js_1.getArrayObserver(obj).getLengthObserver();
                }
                break;
            case 'size':
                if (obj instanceof Map) {
                    return map_observer_js_1.getMapObserver(obj).getLengthObserver();
                }
                else if (obj instanceof Set) {
                    return set_observer_js_1.getSetObserver(obj).getLengthObserver();
                }
                break;
            default:
                if (obj instanceof Array && kernel_1.isArrayIndex(key)) {
                    return array_observer_js_1.getArrayObserver(obj).getIndexObserver(Number(key));
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
                obs = (pd.get?.getObserver ?? pd.set?.getObserver)?.(obj, this);
            }
            return obs == null
                ? pd.configurable
                    ? computed_observer_js_1.ComputedObserver.create(obj, key, pd, this, /* AOT: not true for IE11 */ true)
                    : this.dirtyChecker.createProperty(obj, key)
                : obs;
        }
        // Ordinary get/set observation (the common use case)
        // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
        return new setter_observer_js_1.SetterObserver(obj, key);
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
            utilities_objects_js_1.def(obj, '$observers', { value: { [key]: observer } });
            return observer;
        }
        return obj.$observers[key] = observer;
    }
}
exports.ObserverLocator = ObserverLocator;
ObserverLocator.inject = [dirty_checker_js_1.IDirtyChecker, exports.INodeObserverLocator];
function getCollectionObserver(collection) {
    let obs;
    if (collection instanceof Array) {
        obs = array_observer_js_1.getArrayObserver(collection);
    }
    else if (collection instanceof Map) {
        obs = map_observer_js_1.getMapObserver(collection);
    }
    else if (collection instanceof Set) {
        obs = set_observer_js_1.getSetObserver(collection);
    }
    return obs;
}
exports.getCollectionObserver = getCollectionObserver;
//# sourceMappingURL=observer-locator.js.map