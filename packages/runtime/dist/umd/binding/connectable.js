(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../utilities-objects.js", "../observation/array-observer.js", "../observation/set-observer.js", "../observation/map-observer.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BindingMediator = exports.connectable = exports.BindingCollectionObserverRecord = exports.BindingObserverRecord = void 0;
    const utilities_objects_js_1 = require("../utilities-objects.js");
    const array_observer_js_1 = require("../observation/array-observer.js");
    const set_observer_js_1 = require("../observation/set-observer.js");
    const map_observer_js_1 = require("../observation/map-observer.js");
    // TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time
    const slotNames = [];
    const versionSlotNames = [];
    let lastSlot = -1;
    function ensureEnoughSlotNames(currentSlot) {
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
    function observeProperty(obj, key) {
        const observer = this.observerLocator.getObserver(obj, key);
        /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
         *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
         *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
         *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
         *
         * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
         */
        this.obs.add(observer);
    }
    function getObserverRecord() {
        const record = new BindingObserverRecord(this);
        utilities_objects_js_1.defineHiddenProp(this, 'obs', record);
        return record;
    }
    function observeCollection(collection) {
        let obs;
        if (collection instanceof Array) {
            obs = array_observer_js_1.getArrayObserver(collection);
        }
        else if (collection instanceof Set) {
            obs = set_observer_js_1.getSetObserver(collection);
        }
        else if (collection instanceof Map) {
            obs = map_observer_js_1.getMapObserver(collection);
        }
        else {
            throw new Error('Unrecognised collection type.');
        }
        this.cObs.add(obs);
    }
    function getCollectionObserverRecord() {
        const record = new BindingCollectionObserverRecord(this);
        utilities_objects_js_1.defineHiddenProp(this, 'cObs', record);
        return record;
    }
    function noopHandleChange() {
        throw new Error('method "handleChange" not implemented');
    }
    function noopHandleCollectionChange() {
        throw new Error('method "handleCollectionChange" not implemented');
    }
    class BindingObserverRecord {
        constructor(binding) {
            this.binding = binding;
            this.version = 0;
            this.count = 0;
            connectable.assignIdTo(this);
        }
        handleChange(value, oldValue, flags) {
            return this.binding.interceptor.handleChange(value, oldValue, flags);
        }
        /**
         * Add, and subscribe to a given observer
         */
        add(observer) {
            // find the observer.
            const observerSlots = this.count == null ? 0 : this.count;
            let i = observerSlots;
            while (i-- && this[slotNames[i]] !== observer)
                ;
            // if we are not already observing, put the observer in an open slot and subscribe.
            if (i === -1) {
                i = 0;
                while (this[slotNames[i]]) {
                    i++;
                }
                this[slotNames[i]] = observer;
                observer.subscribe(this);
                observer[this.id] |= 8 /* updateTarget */;
                // increment the slot count.
                if (i === observerSlots) {
                    this.count = i + 1;
                }
            }
            this[versionSlotNames[i]] = this.version;
            ensureEnoughSlotNames(i);
        }
        /**
         * Unsubscribe the observers that are not up to date with the record version
         */
        clear(all) {
            const slotCount = this.count;
            let slotName;
            let observer;
            if (all === true) {
                for (let i = 0; i < slotCount; ++i) {
                    slotName = slotNames[i];
                    observer = this[slotName];
                    if (observer != null) {
                        this[slotName] = void 0;
                        observer.unsubscribe(this);
                        observer[this.id] &= ~8 /* updateTarget */;
                    }
                }
                this.count = 0;
            }
            else {
                for (let i = 0; i < slotCount; ++i) {
                    if (this[versionSlotNames[i]] !== this.version) {
                        slotName = slotNames[i];
                        observer = this[slotName];
                        if (observer != null) {
                            this[slotName] = void 0;
                            observer.unsubscribe(this);
                            observer[this.id] &= ~8 /* updateTarget */;
                            this.count--;
                        }
                    }
                }
            }
        }
    }
    exports.BindingObserverRecord = BindingObserverRecord;
    class BindingCollectionObserverRecord {
        constructor(binding) {
            this.binding = binding;
            this.count = 0;
            this.observers = new Map();
            connectable.assignIdTo(this);
        }
        get version() {
            return this.binding.obs.version;
        }
        handleCollectionChange(indexMap, flags) {
            this.binding.interceptor.handleCollectionChange(indexMap, flags);
        }
        add(observer) {
            observer.subscribe(this);
            this.count = this.observers.set(observer, this.version).size;
        }
        clear(all) {
            if (this.count === 0) {
                return;
            }
            const observers = this.observers;
            const version = this.version;
            let observerAndVersionPair;
            let o;
            for (observerAndVersionPair of observers) {
                if (all || observerAndVersionPair[1] !== version) {
                    o = observerAndVersionPair[0];
                    o.unsubscribe(this);
                    observers.delete(o);
                }
            }
            this.count = observers.size;
        }
    }
    exports.BindingCollectionObserverRecord = BindingCollectionObserverRecord;
    function connectableDecorator(target) {
        const proto = target.prototype;
        utilities_objects_js_1.ensureProto(proto, 'observeProperty', observeProperty, true);
        utilities_objects_js_1.ensureProto(proto, 'observeCollection', observeCollection, true);
        utilities_objects_js_1.def(proto, 'obs', { get: getObserverRecord });
        utilities_objects_js_1.def(proto, 'cObs', { get: getCollectionObserverRecord });
        // optionally add these two methods to normalize a connectable impl
        utilities_objects_js_1.ensureProto(proto, 'handleChange', noopHandleChange);
        utilities_objects_js_1.ensureProto(proto, 'handleCollectionChange', noopHandleCollectionChange);
        return target;
    }
    function connectable(target) {
        return target == null ? connectableDecorator : connectableDecorator(target);
    }
    exports.connectable = connectable;
    let idValue = 0;
    connectable.assignIdTo = (instance) => {
        instance.id = ++idValue;
    };
    // @connectable
    class BindingMediator {
        constructor(key, binding, observerLocator, locator) {
            this.key = key;
            this.binding = binding;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.interceptor = this;
            connectable.assignIdTo(this);
        }
        $bind(flags, scope, hostScope, projection) {
            throw new Error('Method not implemented.');
        }
        $unbind(flags) {
            throw new Error('Method not implemented.');
        }
        handleChange(newValue, previousValue, flags) {
            this.binding[this.key](newValue, previousValue, flags);
        }
    }
    exports.BindingMediator = BindingMediator;
    connectableDecorator(BindingMediator);
});
//# sourceMappingURL=connectable.js.map