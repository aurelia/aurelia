"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputedObserver = void 0;
const subscriber_collection_js_1 = require("./subscriber-collection.js");
const connectable_switcher_js_1 = require("./connectable-switcher.js");
const connectable_js_1 = require("../binding/connectable.js");
const proxy_observation_js_1 = require("./proxy-observation.js");
const utilities_objects_js_1 = require("../utilities-objects.js");
class ComputedObserver {
    constructor(obj, get, set, useProxy, observerLocator) {
        this.obj = obj;
        this.get = get;
        this.set = set;
        this.useProxy = useProxy;
        this.observerLocator = observerLocator;
        this.interceptor = this;
        this.type = 1 /* Observer */;
        this.value = void 0;
        // todo: maybe use a counter allow recursive call to a certain level
        /**
         * @internal
         */
        this.running = false;
        this.isDirty = false;
        connectable_js_1.connectable.assignIdTo(this);
    }
    static create(obj, key, descriptor, observerLocator, useProxy) {
        const getter = descriptor.get;
        const setter = descriptor.set;
        const observer = new ComputedObserver(obj, getter, setter, useProxy, observerLocator);
        const $get = (( /* Computed Observer */) => observer.getValue());
        $get.getObserver = () => observer;
        utilities_objects_js_1.def(obj, key, {
            enumerable: descriptor.enumerable,
            configurable: true,
            get: $get,
            set: (/* Computed Observer */ v) => {
                observer.setValue(v, 0 /* none */);
            },
        });
        return observer;
    }
    getValue() {
        if (this.subs.count === 0) {
            return this.get.call(this.obj, this);
        }
        if (this.isDirty) {
            this.compute();
            this.isDirty = false;
        }
        return this.value;
    }
    // deepscan-disable-next-line
    setValue(v, _flags) {
        if (typeof this.set === 'function') {
            if (v !== this.value) {
                // setting running true as a form of batching
                this.running = true;
                this.set.call(this.obj, v);
                this.running = false;
                this.run();
            }
        }
        else {
            throw new Error('Property is readonly');
        }
    }
    handleChange() {
        this.isDirty = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    handleCollectionChange() {
        this.isDirty = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    subscribe(subscriber) {
        // in theory, a collection subscriber could be added before a property subscriber
        // and it should be handled similarly in subscribeToCollection
        // though not handling for now, and wait until the merge of normal + collection subscription
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.compute();
            this.isDirty = false;
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.isDirty = true;
            this.obs.clear(true);
        }
    }
    run() {
        if (this.running) {
            return;
        }
        const oldValue = this.value;
        const newValue = this.compute();
        this.isDirty = false;
        if (!Object.is(newValue, oldValue)) {
            // should optionally queue
            this.subs.notify(newValue, oldValue, 0 /* none */);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            connectable_switcher_js_1.enterConnectable(this);
            return this.value = proxy_observation_js_1.unwrap(this.get.call(this.useProxy ? proxy_observation_js_1.wrap(this.obj) : this.obj, this));
        }
        finally {
            this.obs.clear(false);
            this.running = false;
            connectable_switcher_js_1.exitConnectable(this);
        }
    }
}
exports.ComputedObserver = ComputedObserver;
connectable_js_1.connectable(ComputedObserver);
subscriber_collection_js_1.subscriberCollection(ComputedObserver);
//# sourceMappingURL=computed-observer.js.map