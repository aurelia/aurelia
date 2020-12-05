var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ComputedObserver_1;
import { subscriberCollection, collectionSubscriberCollection } from './subscriber-collection.js';
import { enterWatcher, exitWatcher } from './watcher-switcher.js';
import { connectable } from '../binding/connectable.js';
import { wrap, unwrap } from './proxy-observation.js';
import { defineHiddenProp, ensureProto } from '../utilities-objects.js';
function watcherImpl(klass) {
    return klass == null ? watcherImplDecorator : watcherImplDecorator(klass);
}
function watcherImplDecorator(klass) {
    const proto = klass.prototype;
    connectable()(klass);
    subscriberCollection()(klass);
    collectionSubscriberCollection()(klass);
    ensureProto(proto, 'observeCollection', observeCollection);
    defineHiddenProp(proto, 'unobserveCollection', unobserveCollection);
}
function observeCollection(collection) {
    const obs = getCollectionObserver(this.observerLocator, collection);
    this.observers.set(obs, this.record.version);
    obs.subscribeToCollection(this);
}
function unobserveCollection(all) {
    const version = this.record.version;
    const observers = this.observers;
    observers.forEach((v, o) => {
        if (all || v !== version) {
            o.unsubscribeFromCollection(this);
            observers.delete(o);
        }
    });
}
function getCollectionObserver(observerLocator, collection) {
    let observer;
    if (collection instanceof Array) {
        observer = observerLocator.getArrayObserver(collection);
    }
    else if (collection instanceof Set) {
        observer = observerLocator.getSetObserver(collection);
    }
    else if (collection instanceof Map) {
        observer = observerLocator.getMapObserver(collection);
    }
    else {
        throw new Error('Unrecognised collection type.');
    }
    return observer;
}
let ComputedObserver = ComputedObserver_1 = class ComputedObserver {
    constructor(obj, get, set, useProxy, observerLocator) {
        this.obj = obj;
        this.get = get;
        this.set = set;
        this.useProxy = useProxy;
        this.observerLocator = observerLocator;
        this.interceptor = this;
        this.observers = new Map();
        this.type = 4 /* Obj */;
        this.value = void 0;
        /**
         * @internal
         */
        this.subscriberCount = 0;
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
        const observer = new ComputedObserver_1(obj, getter, setter, useProxy, observerLocator);
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
        if (this.subscriberCount === 0) {
            return this.get.call(this.obj, this);
        }
        if (this.isDirty) {
            this.compute();
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
        if (this.record.count > 0) {
            this.run();
        }
    }
    handleCollectionChange() {
        this.isDirty = true;
        if (this.record.count > 0) {
            this.run();
        }
    }
    subscribe(subscriber) {
        if (this.addSubscriber(subscriber) && ++this.subscriberCount === 1) {
            this.compute();
            this.isDirty = false;
        }
    }
    unsubscribe(subscriber) {
        if (this.removeSubscriber(subscriber) && --this.subscriberCount === 0) {
            this.isDirty = true;
            this.record.clear(true);
            this.unobserveCollection(true);
        }
    }
    run() {
        if (this.running) {
            return;
        }
        const oldValue = this.value;
        const newValue = this.compute();
        if (!Object.is(newValue, oldValue)) {
            // should optionally queue
            this.callSubscribers(newValue, oldValue, 0 /* none */);
        }
    }
    compute() {
        this.running = true;
        this.record.version++;
        try {
            enterWatcher(this);
            return this.value = unwrap(this.get.call(this.useProxy ? wrap(this.obj) : this.obj, this));
        }
        finally {
            this.record.clear(false);
            this.unobserveCollection(false);
            this.running = false;
            exitWatcher(this);
        }
    }
};
ComputedObserver = ComputedObserver_1 = __decorate([
    watcherImpl
], ComputedObserver);
export { ComputedObserver };
let ComputedWatcher = class ComputedWatcher {
    constructor(obj, observerLocator, get, cb, useProxy) {
        this.obj = obj;
        this.observerLocator = observerLocator;
        this.get = get;
        this.cb = cb;
        this.useProxy = useProxy;
        this.interceptor = this;
        /**
         * @internal
         */
        this.observers = new Map();
        // todo: maybe use a counter allow recursive call to a certain level
        this.running = false;
        this.value = void 0;
        this.isBound = false;
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
        this.unobserveCollection(true);
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
            enterWatcher(this);
            return this.value = unwrap(this.get.call(void 0, this.useProxy ? wrap(this.obj) : this.obj, this));
        }
        finally {
            this.record.clear(false);
            this.unobserveCollection(false);
            this.running = false;
            exitWatcher(this);
        }
    }
};
ComputedWatcher = __decorate([
    watcherImpl
], ComputedWatcher);
export { ComputedWatcher };
let ExpressionWatcher = class ExpressionWatcher {
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
};
ExpressionWatcher = __decorate([
    connectable()
], ExpressionWatcher);
export { ExpressionWatcher };
//# sourceMappingURL=computed-observer.js.map