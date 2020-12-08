import { subscriberCollection } from './subscriber-collection.js';
import { enterConnectable, exitConnectable } from './connectable-switcher.js';
import { connectable } from '../binding/connectable.js';
import { wrap, unwrap } from './proxy-observation.js';
export class ComputedObserver {
    constructor(obj, get, set, useProxy, observerLocator) {
        this.obj = obj;
        this.get = get;
        this.set = set;
        this.useProxy = useProxy;
        this.observerLocator = observerLocator;
        this.interceptor = this;
        this.type = 4 /* Obj */;
        this.value = void 0;
        /**
         * @internal
         */
        this.subCount = 0;
        // todo: maybe use a counter allow recursive call to a certain level
        /**
         * @internal
         */
        this.running = false;
        this.isDirty = false;
        connectable.assignIdTo(this);
    }
    static create(obj, key, descriptor, observerLocator, useProxy) {
        const getter = descriptor.get;
        const setter = descriptor.set;
        const observer = new ComputedObserver(obj, getter, setter, useProxy, observerLocator);
        const $get = (( /* Computed Observer */) => observer.getValue());
        $get.getObserver = () => observer;
        Reflect.defineProperty(obj, key, {
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
        if (this.subCount === 0) {
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
        if (this.subCount > 0) {
            this.run();
        }
    }
    handleCollectionChange() {
        this.isDirty = true;
        if (this.subCount > 0) {
            this.run();
        }
    }
    subscribe(subscriber) {
        // in theory, a collection subscriber could be added before a property subscriber
        // and it should be handled similarly in subscribeToCollection
        // though not handling for now, and wait until the merge of normal + collection subscription
        if (this.addSubscriber(subscriber) && ++this.subCount === 1) {
            this.compute();
            this.isDirty = false;
        }
    }
    unsubscribe(subscriber) {
        if (this.removeSubscriber(subscriber) && --this.subCount === 0) {
            this.isDirty = true;
            this.record.clear(true);
            this.cRecord.clear(true);
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
            this.callSubscribers(newValue, oldValue, 0 /* none */);
        }
    }
    compute() {
        this.running = true;
        this.record.version++;
        try {
            enterConnectable(this);
            return this.value = unwrap(this.get.call(this.useProxy ? wrap(this.obj) : this.obj, this));
        }
        finally {
            this.record.clear(false);
            this.cRecord.clear(false);
            this.running = false;
            exitConnectable(this);
        }
    }
}
export class ComputedWatcher {
    constructor(obj, observerLocator, get, cb, useProxy) {
        this.obj = obj;
        this.observerLocator = observerLocator;
        this.get = get;
        this.cb = cb;
        this.useProxy = useProxy;
        this.interceptor = this;
        this.value = void 0;
        this.isBound = false;
        // todo: maybe use a counter allow recursive call to a certain level
        this.running = false;
        connectable.assignIdTo(this);
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    $bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.compute();
    }
    $unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.record.clear(true);
        this.cRecord.clear(true);
    }
    run() {
        if (!this.isBound || this.running) {
            return;
        }
        const obj = this.obj;
        const oldValue = this.value;
        const newValue = this.compute();
        if (!Object.is(newValue, oldValue)) {
            // should optionally queue
            this.cb.call(obj, newValue, oldValue, obj);
        }
    }
    compute() {
        this.running = true;
        this.record.version++;
        try {
            enterConnectable(this);
            return this.value = unwrap(this.get.call(void 0, this.useProxy ? wrap(this.obj) : this.obj, this));
        }
        finally {
            this.record.clear(false);
            this.cRecord.clear(false);
            this.running = false;
            exitConnectable(this);
        }
    }
}
export class ExpressionWatcher {
    constructor(scope, locator, observerLocator, expression, callback) {
        this.scope = scope;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.expression = expression;
        this.callback = callback;
        this.interceptor = this;
        this.isBound = false;
        this.obj = scope.bindingContext;
        connectable.assignIdTo(this);
    }
    handleChange(value) {
        const expr = this.expression;
        const obj = this.obj;
        const oldValue = this.value;
        const canOptimize = expr.$kind === 10082 /* AccessScope */ && this.record.count === 1;
        if (!canOptimize) {
            this.record.version++;
            value = expr.evaluate(0, this.scope, null, this.locator, this);
            this.record.clear(false);
        }
        if (!Object.is(value, oldValue)) {
            this.value = value;
            // should optionally queue for batch synchronous
            this.callback.call(obj, value, oldValue, obj);
        }
    }
    $bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.record.version++;
        this.value = this.expression.evaluate(0 /* none */, this.scope, null, this.locator, this);
        this.record.clear(false);
    }
    $unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.record.clear(true);
        this.value = void 0;
    }
}
connectable(ComputedObserver);
subscriberCollection()(ComputedObserver);
connectable(ComputedWatcher);
connectable(ExpressionWatcher);
//# sourceMappingURL=computed-observer.js.map