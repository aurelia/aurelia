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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../observation", "./array-observer", "./computed-observer", "./dirty-checker", "./map-observer", "./primitive-observer", "./property-accessor", "./set-observer", "./setter-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCollectionObserver = exports.ObserverLocator = exports.ITargetAccessorLocator = exports.ITargetObserverLocator = exports.IObserverLocator = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const observation_1 = require("../observation");
    const array_observer_1 = require("./array-observer");
    const computed_observer_1 = require("./computed-observer");
    const dirty_checker_1 = require("./dirty-checker");
    const map_observer_1 = require("./map-observer");
    const primitive_observer_1 = require("./primitive-observer");
    const property_accessor_1 = require("./property-accessor");
    const set_observer_1 = require("./set-observer");
    const setter_observer_1 = require("./setter-observer");
    exports.IObserverLocator = kernel_1.DI.createInterface('IObserverLocator').withDefault(x => x.singleton(ObserverLocator));
    exports.ITargetObserverLocator = kernel_1.DI.createInterface('ITargetObserverLocator').noDefault();
    exports.ITargetAccessorLocator = kernel_1.DI.createInterface('ITargetAccessorLocator').noDefault();
    let ObserverLocator = class ObserverLocator {
        constructor(lifecycle, dirtyChecker, targetObserverLocator, targetAccessorLocator) {
            this.lifecycle = lifecycle;
            this.dirtyChecker = dirtyChecker;
            this.targetObserverLocator = targetObserverLocator;
            this.targetAccessorLocator = targetAccessorLocator;
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
            if (this.targetAccessorLocator.handles(flags, obj)) {
                if (this.targetObserverLocator.overridesAccessor(flags, obj, key)) {
                    const observer = this.targetObserverLocator.getObserver(flags, this, obj, key);
                    if (observer !== null) {
                        return this.cache(obj, key, observer);
                    }
                }
                return this.targetAccessorLocator.getAccessor(flags, obj, key);
            }
            return property_accessor_1.propertyAccessor;
        }
        getArrayObserver(flags, observedArray) {
            return array_observer_1.getArrayObserver(flags, this.lifecycle, observedArray);
        }
        getMapObserver(flags, observedMap) {
            return map_observer_1.getMapObserver(flags, this.lifecycle, observedMap);
        }
        getSetObserver(flags, observedSet) {
            return set_observer_1.getSetObserver(flags, this.lifecycle, observedSet);
        }
        createObserver(flags, obj, key) {
            if (!(obj instanceof Object)) {
                return new primitive_observer_1.PrimitiveObserver(obj, key);
            }
            let isNode = false;
            // Never use proxies for observing nodes, so check target observer first and only then evaluate proxy strategy
            if (this.targetObserverLocator.handles(flags, obj)) {
                const observer = this.targetObserverLocator.getObserver(flags, this, obj, key);
                if (observer !== null) {
                    return observer;
                }
                isNode = true;
            }
            switch (key) {
                case 'length':
                    if (obj instanceof Array) {
                        return array_observer_1.getArrayObserver(flags, this.lifecycle, obj).getLengthObserver();
                    }
                    break;
                case 'size':
                    if (obj instanceof Map) {
                        return map_observer_1.getMapObserver(flags, this.lifecycle, obj).getLengthObserver();
                    }
                    else if (obj instanceof Set) {
                        return set_observer_1.getSetObserver(flags, this.lifecycle, obj).getLengthObserver();
                    }
                    break;
                default:
                    if (obj instanceof Array && kernel_1.isArrayIndex(key)) {
                        return array_observer_1.getArrayObserver(flags, this.lifecycle, obj).getIndexObserver(Number(key));
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
                if (isNode) {
                    // TODO: use MutationObserver
                    return this.dirtyChecker.createProperty(obj, key);
                }
                return computed_observer_1.createComputedObserver(flags, this, this.dirtyChecker, this.lifecycle, obj, key, pd);
            }
            // Ordinary get/set observation (the common use case)
            // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
            return new setter_observer_1.SetterObserver(flags, obj, key);
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
        __param(0, observation_1.ILifecycle),
        __param(1, dirty_checker_1.IDirtyChecker),
        __param(2, exports.ITargetObserverLocator),
        __param(3, exports.ITargetAccessorLocator),
        __metadata("design:paramtypes", [Object, Object, Object, Object])
    ], ObserverLocator);
    exports.ObserverLocator = ObserverLocator;
    function getCollectionObserver(flags, lifecycle, collection) {
        if (collection instanceof Array) {
            return array_observer_1.getArrayObserver(flags, lifecycle, collection);
        }
        else if (collection instanceof Map) {
            return map_observer_1.getMapObserver(flags, lifecycle, collection);
        }
        else if (collection instanceof Set) {
            return set_observer_1.getSetObserver(flags, lifecycle, collection);
        }
        return void 0;
    }
    exports.getCollectionObserver = getCollectionObserver;
});
//# sourceMappingURL=observer-locator.js.map