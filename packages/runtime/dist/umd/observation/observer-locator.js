(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../lifecycle", "./array-observer", "./computed-observer", "./dirty-checker", "./map-observer", "./primitive-observer", "./property-accessor", "./proxy-observer", "./set-observer", "./setter-observer", "../scheduler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const lifecycle_1 = require("../lifecycle");
    const array_observer_1 = require("./array-observer");
    const computed_observer_1 = require("./computed-observer");
    const dirty_checker_1 = require("./dirty-checker");
    const map_observer_1 = require("./map-observer");
    const primitive_observer_1 = require("./primitive-observer");
    const property_accessor_1 = require("./property-accessor");
    const proxy_observer_1 = require("./proxy-observer");
    const set_observer_1 = require("./set-observer");
    const setter_observer_1 = require("./setter-observer");
    const scheduler_1 = require("../scheduler");
    const toStringTag = Object.prototype.toString;
    exports.IObserverLocator = kernel_1.DI.createInterface('IObserverLocator').noDefault();
    exports.ITargetObserverLocator = kernel_1.DI.createInterface('ITargetObserverLocator').noDefault();
    exports.ITargetAccessorLocator = kernel_1.DI.createInterface('ITargetAccessorLocator').noDefault();
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
            return kernel_1.Registration.singleton(exports.IObserverLocator, this).register(container);
        }
        getObserver(flags, obj, propertyName) {
            if (flags & 2 /* proxyStrategy */ && typeof obj === 'object') {
                return proxy_observer_1.ProxyObserver.getOrCreate(obj, propertyName); // TODO: fix typings (and ensure proper contracts ofc)
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
                return proxy_observer_1.ProxyObserver.getOrCreate(obj, propertyName);
            }
            return new property_accessor_1.PropertyAccessor(obj, propertyName);
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
                kernel_1.Reporter.write(0, obj);
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
                return new primitive_observer_1.PrimitiveObserver(obj, propertyName);
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
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Map]':
                    if (propertyName === 'size') {
                        return this.getMapObserver(flags, obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Set]':
                    if (propertyName === 'size') {
                        return this.getSetObserver(flags, obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
            }
            const descriptor = getPropertyDescriptor(obj, propertyName);
            if (descriptor && (descriptor.get || descriptor.set)) {
                if (descriptor.get && descriptor.get.getObserver) {
                    return descriptor.get.getObserver(obj);
                }
                // attempt to use an adapter before resorting to dirty checking.
                const adapterObserver = this.getAdapterObserver(flags, obj, propertyName, descriptor);
                if (adapterObserver) {
                    return adapterObserver;
                }
                if (isNode) {
                    // TODO: use MutationObserver
                    return this.dirtyChecker.createProperty(obj, propertyName);
                }
                return computed_observer_1.createComputedObserver(flags, this, this.dirtyChecker, this.lifecycle, obj, propertyName, descriptor);
            }
            return new setter_observer_1.SetterObserver(this.lifecycle, flags, obj, propertyName);
        }
    };
    ObserverLocator = tslib_1.__decorate([
        tslib_1.__param(0, lifecycle_1.ILifecycle),
        tslib_1.__param(1, scheduler_1.IScheduler),
        tslib_1.__param(2, dirty_checker_1.IDirtyChecker),
        tslib_1.__param(3, exports.ITargetObserverLocator),
        tslib_1.__param(4, exports.ITargetAccessorLocator)
    ], ObserverLocator);
    exports.ObserverLocator = ObserverLocator;
    function getCollectionObserver(flags, lifecycle, collection) {
        // If the collection is wrapped by a proxy then `$observer` will return the proxy observer instead of the collection observer, which is not what we want
        // when we ask for getCollectionObserver
        const rawCollection = collection instanceof Object ? proxy_observer_1.ProxyObserver.getRawIfProxy(collection) : collection;
        switch (toStringTag.call(collection)) {
            case '[object Array]':
                return array_observer_1.getArrayObserver(flags, lifecycle, rawCollection);
            case '[object Map]':
                return map_observer_1.getMapObserver(flags, lifecycle, rawCollection);
            case '[object Set]':
                return set_observer_1.getSetObserver(flags, lifecycle, rawCollection);
        }
        return void 0;
    }
    exports.getCollectionObserver = getCollectionObserver;
    function isBindingContext(obj) {
        return obj.$synthetic === true;
    }
});
//# sourceMappingURL=observer-locator.js.map