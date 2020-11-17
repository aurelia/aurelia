var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../observation.js", "./array-observer.js", "./computed-observer.js", "./dirty-checker.js", "./map-observer.js", "./primitive-observer.js", "./property-accessor.js", "./set-observer.js", "./setter-observer.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCollectionObserver = exports.ObserverLocator = exports.INodeObserverLocator = exports.IObserverLocator = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const observation_js_1 = require("../observation.js");
    const array_observer_js_1 = require("./array-observer.js");
    const computed_observer_js_1 = require("./computed-observer.js");
    const dirty_checker_js_1 = require("./dirty-checker.js");
    const map_observer_js_1 = require("./map-observer.js");
    const primitive_observer_js_1 = require("./primitive-observer.js");
    const property_accessor_js_1 = require("./property-accessor.js");
    const set_observer_js_1 = require("./set-observer.js");
    const setter_observer_js_1 = require("./setter-observer.js");
    exports.IObserverLocator = kernel_1.DI.createInterface('IObserverLocator').withDefault(x => x.singleton(ObserverLocator));
    exports.INodeObserverLocator = kernel_1.DI
        .createInterface('INodeObserverLocator')
        .withDefault(x => x.cachedCallback(handler => {
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
            return property_accessor_js_1.propertyAccessor;
        }
        getAccessor() {
            return property_accessor_js_1.propertyAccessor;
        }
    }
    let ObserverLocator = class ObserverLocator {
        constructor(lifecycle, dirtyChecker, nodeObserverLocator) {
            this.lifecycle = lifecycle;
            this.dirtyChecker = dirtyChecker;
            this.nodeObserverLocator = nodeObserverLocator;
            this.adapters = [];
        }
        addAdapter(adapter) {
            this.adapters.push(adapter);
        }
        getObserver(flags, obj, key) {
            var _a, _b;
            return (_b = (_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : this.cache(obj, key, this.createObserver(flags, obj, key));
        }
        getAccessor(flags, obj, key) {
            var _a;
            const cached = (_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[key];
            if (cached !== void 0) {
                return cached;
            }
            if (this.nodeObserverLocator.handles(obj, key, this)) {
                return this.nodeObserverLocator.getAccessor(obj, key, this);
            }
            return property_accessor_js_1.propertyAccessor;
        }
        getArrayObserver(flags, observedArray) {
            return array_observer_js_1.getArrayObserver(this.lifecycle, observedArray);
        }
        getMapObserver(flags, observedMap) {
            return map_observer_js_1.getMapObserver(this.lifecycle, observedMap);
        }
        getSetObserver(flags, observedSet) {
            return set_observer_js_1.getSetObserver(this.lifecycle, observedSet);
        }
        createObserver(flags, obj, key) {
            if (!(obj instanceof Object)) {
                return new primitive_observer_js_1.PrimitiveObserver(obj, key);
            }
            if (this.nodeObserverLocator.handles(obj, key, this)) {
                return this.nodeObserverLocator.getObserver(obj, key, this);
            }
            switch (key) {
                case 'length':
                    if (obj instanceof Array) {
                        return array_observer_js_1.getArrayObserver(this.lifecycle, obj).getLengthObserver();
                    }
                    break;
                case 'size':
                    if (obj instanceof Map) {
                        return map_observer_js_1.getMapObserver(this.lifecycle, obj).getLengthObserver();
                    }
                    else if (obj instanceof Set) {
                        return set_observer_js_1.getSetObserver(this.lifecycle, obj).getLengthObserver();
                    }
                    break;
                default:
                    if (obj instanceof Array && kernel_1.isArrayIndex(key)) {
                        return array_observer_js_1.getArrayObserver(this.lifecycle, obj).getIndexObserver(Number(key));
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
                if (pd.get === void 0) {
                    // The user could decide to read from a different prop, so don't assume the absense of a setter won't work for custom adapters
                    const obs = this.getAdapterObserver(flags, obj, key, pd);
                    if (obs !== null) {
                        return obs;
                    }
                    // None of our built-in stuff can read a setter-only without throwing, so just throw right away
                    throw new Error(`You cannot observe a setter only property: '${key}'`);
                }
                // Check custom getter-specific override first
                if (pd.get.getObserver !== void 0) {
                    return pd.get.getObserver(obj);
                }
                // Then check if any custom adapter handles it (the obj could be any object, including a node )
                const obs = this.getAdapterObserver(flags, obj, key, pd);
                if (obs !== null) {
                    return obs;
                }
                return computed_observer_js_1.createComputedObserver(flags, this, this.dirtyChecker, this.lifecycle, obj, key, pd);
            }
            // Ordinary get/set observation (the common use case)
            // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
            return new setter_observer_js_1.SetterObserver(obj, key);
        }
        getAdapterObserver(flags, obj, propertyName, pd) {
            if (this.adapters.length > 0) {
                for (const adapter of this.adapters) {
                    const observer = adapter.getObserver(flags, obj, propertyName, pd);
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
                Reflect.defineProperty(obj, '$observers', { value: { [key]: observer } });
                return observer;
            }
            return obj.$observers[key] = observer;
        }
    };
    ObserverLocator = __decorate([
        __param(0, observation_js_1.ILifecycle),
        __param(1, dirty_checker_js_1.IDirtyChecker),
        __param(2, exports.INodeObserverLocator)
    ], ObserverLocator);
    exports.ObserverLocator = ObserverLocator;
    function getCollectionObserver(lifecycle, collection) {
        if (collection instanceof Array) {
            return array_observer_js_1.getArrayObserver(lifecycle, collection);
        }
        else if (collection instanceof Map) {
            return map_observer_js_1.getMapObserver(lifecycle, collection);
        }
        else if (collection instanceof Set) {
            return set_observer_js_1.getSetObserver(lifecycle, collection);
        }
        return void 0;
    }
    exports.getCollectionObserver = getCollectionObserver;
});
//# sourceMappingURL=observer-locator.js.map