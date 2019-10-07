var ProxyObserver_1;
import { __decorate } from "tslib";
import { PLATFORM } from '@aurelia/kernel';
import { proxySubscriberCollection, subscriberCollection } from './subscriber-collection';
const slice = Array.prototype.slice;
const lookup = new WeakMap();
let ProxySubscriberCollection = class ProxySubscriberCollection {
    constructor(proxy, raw, key) {
        this.inBatch = false;
        this.raw = raw;
        this.key = key;
        this.proxy = proxy;
        this.subscribe = this.addSubscriber;
        this.unsubscribe = this.removeSubscriber;
        if (raw[key] instanceof Object) { // Ensure we observe array indices and newly created object properties
            raw[key] = ProxyObserver.getOrCreate(raw[key]).proxy;
        }
    }
    setValue(value, flags) {
        const oldValue = this.raw[this.key];
        if (oldValue !== value) {
            this.raw[this.key] = value;
            this.callSubscribers(value, oldValue, flags | 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
        }
    }
    getValue() {
        return this.raw[this.key];
    }
    flushBatch(flags) {
        return;
    }
};
ProxySubscriberCollection = __decorate([
    subscriberCollection()
], ProxySubscriberCollection);
export { ProxySubscriberCollection };
let ProxyObserver = ProxyObserver_1 = class ProxyObserver {
    constructor(obj) {
        this.raw = obj;
        this.proxy = new Proxy(obj, this);
        lookup.set(obj, this.proxy);
        this.subscribers = {};
    }
    static getProxyOrSelf(obj) {
        if (obj.$raw === void 0) {
            const proxy = lookup.get(obj);
            if (proxy === void 0) {
                return obj;
            }
            return proxy;
        }
        return obj;
    }
    static getRawIfProxy(obj) {
        const raw = obj.$raw;
        if (raw === void 0) {
            return obj;
        }
        return raw;
    }
    static getOrCreate(obj, key) {
        let proxyObserver;
        if (obj.$raw === void 0) {
            const proxy = lookup.get(obj);
            if (proxy === void 0) {
                proxyObserver = new ProxyObserver_1(obj);
            }
            else {
                proxyObserver = proxy.$observer;
            }
        }
        else {
            proxyObserver = obj.$observer;
        }
        if (key === void 0) {
            return proxyObserver;
        }
        let subscribers = proxyObserver.subscribers[key];
        if (subscribers === void 0) {
            const raw = this.getRawIfProxy(obj);
            const proxy = proxyObserver.proxy;
            subscribers = proxyObserver.subscribers[key] = new ProxySubscriberCollection(proxy, raw, key);
        }
        return subscribers;
    }
    static isProxy(obj) {
        return obj.$raw !== void 0;
    }
    get(target, p, receiver) {
        if (p === '$observer') {
            return this;
        }
        if (p === '$raw') {
            return target;
        }
        return target[p];
    }
    set(target, p, value, receiver) {
        const oldValue = target[p];
        if (oldValue !== value) {
            target[p] = value;
            this.callPropertySubscribers(value, oldValue, p);
            this.callProxySubscribers(p, value, oldValue, 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
        }
        return true;
    }
    deleteProperty(target, p) {
        const oldValue = target[p];
        if (Reflect.deleteProperty(target, p)) {
            if (oldValue !== void 0) {
                this.callPropertySubscribers(undefined, oldValue, p);
                this.callProxySubscribers(p, undefined, oldValue, 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
            }
            return true;
        }
        return false;
    }
    defineProperty(target, p, attributes) {
        const oldValue = target[p];
        if (Reflect.defineProperty(target, p, attributes)) {
            if (attributes.value !== oldValue) {
                this.callPropertySubscribers(attributes.value, oldValue, p);
                this.callProxySubscribers(p, attributes.value, oldValue, 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
            }
            return true;
        }
        return false;
    }
    apply(target, thisArg, argArray = PLATFORM.emptyArray) {
        // eslint-disable-next-line @typescript-eslint/ban-types
        return Reflect.apply(target, target, argArray); // Reflect API dictates this
    }
    subscribe(subscriber, key) {
        if (key === void 0) {
            this.addProxySubscriber(subscriber);
        }
        else {
            let subscribers = this.subscribers[key];
            if (subscribers === void 0) {
                subscribers = this.subscribers[key] = new ProxySubscriberCollection(this.proxy, this.raw, key);
            }
            subscribers.addSubscriber(subscriber);
        }
    }
    unsubscribe(subscriber, key) {
        if (key === void 0) {
            this.removeProxySubscriber(subscriber);
        }
        else {
            const subscribers = this.subscribers[key];
            if (subscribers !== undefined) {
                subscribers.removeSubscriber(subscriber);
            }
        }
    }
    callPropertySubscribers(newValue, oldValue, key) {
        const subscribers = this.subscribers[key];
        if (subscribers !== void 0) {
            subscribers.callSubscribers(newValue, oldValue, 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
        }
    }
};
ProxyObserver = ProxyObserver_1 = __decorate([
    proxySubscriberCollection()
], ProxyObserver);
export { ProxyObserver };
//# sourceMappingURL=proxy-observer.js.map