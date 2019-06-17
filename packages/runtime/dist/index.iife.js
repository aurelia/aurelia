this.au = this.au || {};
this.au.runtime = (function (exports, kernel) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    // TODO: see if we can de-duplicate these 3 decorators and their functions without killing performance or readability
    function subscriberCollection() {
        // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
        return function (target) {
            const proto = target.prototype;
            proto._subscriberFlags = 0 /* None */;
            proto.addSubscriber = addSubscriber;
            proto.removeSubscriber = removeSubscriber;
            proto.hasSubscriber = hasSubscriber;
            proto.hasSubscribers = hasSubscribers;
            proto.callSubscribers = callSubscribers;
            if (proto.subscribe === void 0)
                proto.subscribe = addSubscriber;
            if (proto.unsubscribe === void 0)
                proto.unsubscribe = removeSubscriber;
        };
    }
    function proxySubscriberCollection() {
        // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
        return function (target) {
            const proto = target.prototype;
            proto._proxySubscriberFlags = 0 /* None */;
            proto.addProxySubscriber = addProxySubscriber;
            proto.removeProxySubscriber = removeProxySubscriber;
            proto.hasProxySubscriber = hasProxySubscriber;
            proto.hasProxySubscribers = hasProxySubscribers;
            proto.callProxySubscribers = callProxySubscribers;
            if (proto.subscribeToProxy === void 0)
                proto.subscribeToProxy = addProxySubscriber;
            if (proto.unsubscribeFromProxy === void 0)
                proto.unsubscribeFromProxy = removeProxySubscriber;
        };
    }
    function collectionSubscriberCollection() {
        // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
        return function (target) {
            const proto = target.prototype;
            proto._collectionSubscriberFlags = 0 /* None */;
            proto.addCollectionSubscriber = addCollectionSubscriber;
            proto.removeCollectionSubscriber = removeCollectionSubscriber;
            proto.hasCollectionSubscriber = hasCollectionSubscriber;
            proto.hasCollectionSubscribers = hasCollectionSubscribers;
            proto.callCollectionSubscribers = callCollectionSubscribers;
            if (proto.subscribeToCollection === void 0)
                proto.subscribeToCollection = addCollectionSubscriber;
            if (proto.unsubscribeFromCollection === void 0)
                proto.unsubscribeFromCollection = removeCollectionSubscriber;
        };
    }
    function addSubscriber(subscriber) {
        if (this.hasSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._subscriber0 = subscriber;
            this._subscriberFlags |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._subscriber1 = subscriber;
            this._subscriberFlags |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._subscriber2 = subscriber;
            this._subscriberFlags |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._subscribersRest = [subscriber];
            this._subscriberFlags |= 8 /* SubscribersRest */;
        }
        else {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
            this._subscribersRest.push(subscriber);
        }
        return true;
    }
    function addProxySubscriber(subscriber) {
        if (this.hasProxySubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._proxySubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._proxySubscriber0 = subscriber;
            this._proxySubscriberFlags |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._proxySubscriber1 = subscriber;
            this._proxySubscriberFlags |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._proxySubscriber2 = subscriber;
            this._proxySubscriberFlags |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._proxySubscribersRest = [subscriber];
            this._proxySubscriberFlags |= 8 /* SubscribersRest */;
        }
        else {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
            this._proxySubscribersRest.push(subscriber);
        }
        return true;
    }
    function addCollectionSubscriber(subscriber) {
        if (this.hasCollectionSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._collectionSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._collectionSubscriber0 = subscriber;
            this._collectionSubscriberFlags |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._collectionSubscriber1 = subscriber;
            this._collectionSubscriberFlags |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._collectionSubscriber2 = subscriber;
            this._collectionSubscriberFlags |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._collectionSubscribersRest = [subscriber];
            this._collectionSubscriberFlags |= 8 /* SubscribersRest */;
        }
        else {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
            this._collectionSubscribersRest.push(subscriber);
        }
        return true;
    }
    function removeSubscriber(subscriber) {
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._subscriber0 === subscriber) {
            this._subscriber0 = void 0;
            this._subscriberFlags = (this._subscriberFlags | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._subscriber1 === subscriber) {
            this._subscriber1 = void 0;
            this._subscriberFlags = (this._subscriberFlags | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._subscriber2 === subscriber) {
            this._subscriber2 = void 0;
            this._subscriberFlags = (this._subscriberFlags | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._subscriberFlags = (this._subscriberFlags | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function removeProxySubscriber(subscriber) {
        const subscriberFlags = this._proxySubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._proxySubscriber0 === subscriber) {
            this._proxySubscriber0 = void 0;
            this._proxySubscriberFlags = (this._proxySubscriberFlags | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._proxySubscriber1 === subscriber) {
            this._proxySubscriber1 = void 0;
            this._proxySubscriberFlags = (this._proxySubscriberFlags | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._proxySubscriber2 === subscriber) {
            this._proxySubscriber2 = void 0;
            this._proxySubscriberFlags = (this._proxySubscriberFlags | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._proxySubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._proxySubscriberFlags = (this._proxySubscriberFlags | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function removeCollectionSubscriber(subscriber) {
        const subscriberFlags = this._collectionSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._collectionSubscriber0 === subscriber) {
            this._collectionSubscriber0 = void 0;
            this._collectionSubscriberFlags = (this._collectionSubscriberFlags | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._collectionSubscriber1 === subscriber) {
            this._collectionSubscriber1 = void 0;
            this._collectionSubscriberFlags = (this._collectionSubscriberFlags | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._collectionSubscriber2 === subscriber) {
            this._collectionSubscriber2 = void 0;
            this._collectionSubscriberFlags = (this._collectionSubscriberFlags | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._collectionSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._collectionSubscriberFlags = (this._collectionSubscriberFlags | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function hasSubscribers() {
        return this._subscriberFlags !== 0 /* None */;
    }
    function hasProxySubscribers() {
        return this._proxySubscriberFlags !== 0 /* None */;
    }
    function hasCollectionSubscribers() {
        return this._collectionSubscriberFlags !== 0 /* None */;
    }
    function hasSubscriber(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._subscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._subscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._subscriber2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function hasProxySubscriber(subscriber) {
        const subscriberFlags = this._proxySubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._proxySubscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._proxySubscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._proxySubscriber2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._proxySubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function hasCollectionSubscriber(subscriber) {
        const subscriberFlags = this._collectionSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._collectionSubscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._collectionSubscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._collectionSubscriber2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._collectionSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function callSubscribers(newValue, previousValue, flags) {
        /**
         * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
         * callSubscribers invocation, so we're caching them all before invoking any.
         * Subscribers added during this invocation are not invoked (and they shouldn't be).
         * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
         * however this is accounted for via $isBound and similar flags on the subscriber objects)
         */
        const subscriber0 = this._subscriber0;
        const subscriber1 = this._subscriber1;
        const subscriber2 = this._subscriber2;
        let subscribers = this._subscribersRest;
        if (subscribers !== void 0) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== void 0) {
            callSubscriber(subscriber0, newValue, previousValue, flags, subscriber0.id === void 0 ? 0 : this[subscriber0.id]);
        }
        if (subscriber1 !== void 0) {
            callSubscriber(subscriber1, newValue, previousValue, flags, subscriber1.id === void 0 ? 0 : this[subscriber1.id]);
        }
        if (subscriber2 !== void 0) {
            callSubscriber(subscriber2, newValue, previousValue, flags, subscriber2.id === void 0 ? 0 : this[subscriber2.id]);
        }
        if (subscribers !== void 0) {
            const { length } = subscribers;
            let subscriber;
            for (let i = 0; i < length; ++i) {
                subscriber = subscribers[i];
                if (subscriber !== void 0) {
                    callSubscriber(subscriber, newValue, previousValue, flags, subscriber.id === void 0 ? 0 : this[subscriber.id]);
                }
            }
        }
    }
    function callSubscriber(subscriber, newValue, previousValue, flags, ownFlags) {
        subscriber.handleChange(newValue, previousValue, ((flags | 48 /* update */) ^ 48 /* update */) | ownFlags);
    }
    function callProxySubscribers(key, newValue, previousValue, flags) {
        const subscriber0 = this._proxySubscriber0;
        const subscriber1 = this._proxySubscriber1;
        const subscriber2 = this._proxySubscriber2;
        let subscribers = this._proxySubscribersRest;
        if (subscribers !== void 0) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== void 0) {
            subscriber0.handleProxyChange(key, newValue, previousValue, flags);
        }
        if (subscriber1 !== void 0) {
            subscriber1.handleProxyChange(key, newValue, previousValue, flags);
        }
        if (subscriber2 !== void 0) {
            subscriber2.handleProxyChange(key, newValue, previousValue, flags);
        }
        if (subscribers !== void 0) {
            const { length } = subscribers;
            let subscriber;
            for (let i = 0; i < length; ++i) {
                subscriber = subscribers[i];
                if (subscriber !== void 0) {
                    subscriber.handleProxyChange(key, newValue, previousValue, flags);
                }
            }
        }
    }
    function callCollectionSubscribers(indexMap, flags) {
        const subscriber0 = this._collectionSubscriber0;
        const subscriber1 = this._collectionSubscriber1;
        const subscriber2 = this._collectionSubscriber2;
        let subscribers = this._collectionSubscribersRest;
        if (subscribers !== void 0) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== void 0) {
            subscriber0.handleCollectionChange(indexMap, flags);
        }
        if (subscriber1 !== void 0) {
            subscriber1.handleCollectionChange(indexMap, flags);
        }
        if (subscriber2 !== void 0) {
            subscriber2.handleCollectionChange(indexMap, flags);
        }
        if (subscribers !== void 0) {
            const { length } = subscribers;
            let subscriber;
            for (let i = 0; i < length; ++i) {
                subscriber = subscribers[i];
                if (subscriber !== void 0) {
                    subscriber.handleCollectionChange(indexMap, flags);
                }
            }
        }
    }

    var ProxyObserver_1;
    const slice = Array.prototype.slice;
    const lookup = new WeakMap();
    let ProxySubscriberCollection = class ProxySubscriberCollection {
        constructor(proxy, raw, key) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('ProxySubscriberCollection', 'constructor', slice.call(arguments));
            }
            this.inBatch = false;
            this.raw = raw;
            this.key = key;
            this.proxy = proxy;
            this.subscribe = this.addSubscriber;
            this.unsubscribe = this.removeSubscriber;
            if (raw[key] instanceof Object) { // Ensure we observe array indices and newly created object properties
                raw[key] = exports.ProxyObserver.getOrCreate(raw[key]).proxy;
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
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
        }
    };
    ProxySubscriberCollection = __decorate([
        subscriberCollection()
    ], ProxySubscriberCollection);
    exports.ProxyObserver = ProxyObserver_1 = class ProxyObserver {
        constructor(obj) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('ProxyObserver', 'constructor', slice.call(arguments));
            }
            this.raw = obj;
            this.proxy = new Proxy(obj, this);
            lookup.set(obj, this.proxy);
            this.subscribers = {};
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
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
        apply(target, thisArg, argArray = kernel.PLATFORM.emptyArray) {
            // tslint:disable-next-line:ban-types // Reflect API dictates this
            return Reflect.apply(target, target, argArray);
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
    exports.ProxyObserver = ProxyObserver_1 = __decorate([
        proxySubscriberCollection()
    ], exports.ProxyObserver);

    exports.SetterObserver = class SetterObserver {
        constructor(lifecycle, flags, obj, propertyKey) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.inBatch = false;
            this.observing = false;
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            if (this.observing) {
                const currentValue = this.currentValue;
                this.currentValue = newValue;
                if (this.lifecycle.batch.depth === 0) {
                    if ((flags & 4096 /* fromBind */) === 0) {
                        this.callSubscribers(newValue, currentValue, this.persistentFlags | flags);
                    }
                }
                else if (!this.inBatch) {
                    this.inBatch = true;
                    this.oldValue = currentValue;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
                // so calling obj[propertyKey] will actually return this.currentValue.
                // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
                // is unmodified and we need to explicitly set the property value.
                // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
                // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
                this.obj[this.propertyKey] = newValue;
            }
        }
        flushBatch(flags) {
            this.inBatch = false;
            const currentValue = this.currentValue;
            const oldValue = this.oldValue;
            this.oldValue = currentValue;
            this.callSubscribers(currentValue, oldValue, this.persistentFlags | flags);
        }
        subscribe(subscriber) {
            if (this.observing === false) {
                this.observing = true;
                this.currentValue = this.obj[this.propertyKey];
                if (!Reflect.defineProperty(this.obj, this.propertyKey, {
                    enumerable: true,
                    configurable: true,
                    get: () => {
                        return this.getValue();
                    },
                    set: value => {
                        this.setValue(value, 0 /* none */);
                    },
                })) {
                    kernel.Reporter.write(1, this.propertyKey, this.obj);
                }
            }
            this.addSubscriber(subscriber);
        }
    };
    exports.SetterObserver = __decorate([
        subscriberCollection()
    ], exports.SetterObserver);

    const slice$1 = Array.prototype.slice;
    var RuntimeError;
    (function (RuntimeError) {
        RuntimeError[RuntimeError["NilScope"] = 250] = "NilScope";
        RuntimeError[RuntimeError["NilOverrideContext"] = 252] = "NilOverrideContext";
        RuntimeError[RuntimeError["NilParentScope"] = 253] = "NilParentScope";
    })(RuntimeError || (RuntimeError = {}));
    /** @internal */
    class InternalObserversLookup {
        getOrCreate(lifecycle, flags, obj, key) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('InternalObserversLookup', 'getOrCreate', slice$1.call(arguments));
            }
            if (this[key] === void 0) {
                this[key] = new exports.SetterObserver(lifecycle, flags, obj, key);
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return this[key];
        }
    }
    class BindingContext {
        constructor(keyOrObj, value) {
            this.$synthetic = true;
            if (keyOrObj !== void 0) {
                if (value !== void 0) {
                    // if value is defined then it's just a property and a value to initialize with
                    this[keyOrObj] = value;
                }
                else {
                    // can either be some random object or another bindingContext to clone from
                    for (const prop in keyOrObj) {
                        if (keyOrObj.hasOwnProperty(prop)) {
                            this[prop] = keyOrObj[prop];
                        }
                    }
                }
            }
        }
        static create(flags, keyOrObj, value) {
            const bc = new BindingContext(keyOrObj, value);
            if (flags & 2 /* proxyStrategy */) {
                return exports.ProxyObserver.getOrCreate(bc).proxy;
            }
            return bc;
        }
        static get(scope, name, ancestor, flags) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('BindingContext', 'get', slice$1.call(arguments));
            }
            if (scope == null) {
                throw kernel.Reporter.error(250 /* NilScope */);
            }
            let overrideContext = scope.overrideContext;
            if (ancestor > 0) {
                // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
                while (ancestor > 0) {
                    if (overrideContext.parentOverrideContext == null) {
                        if (kernel.Tracer.enabled) {
                            kernel.Tracer.leave();
                        }
                        return void 0;
                    }
                    ancestor--;
                    overrideContext = overrideContext.parentOverrideContext;
                }
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // traverse the context and it's ancestors, searching for a context that has the name.
            while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
                overrideContext = overrideContext.parentOverrideContext;
            }
            if (overrideContext) {
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                // we located a context with the property.  return it.
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // the name wasn't found. see if parent scope traversal is allowed and if so, try that
            if ((flags & 536870912 /* allowParentScopeTraversal */) > 0) {
                const partScope = scope.partScopes[BindingContext.partName];
                const result = this.get(partScope, name, ancestor, flags
                    // unset the flag; only allow one level of scope boundary traversal
                    & ~536870912 /* allowParentScopeTraversal */
                    // tell the scope to return null if the name could not be found
                    | 16777216 /* isTraversingParentScope */);
                if (result !== null) {
                    if (kernel.Tracer.enabled) {
                        kernel.Tracer.leave();
                    }
                    return result;
                }
            }
            // still nothing found. return the root binding context (or null
            // if this is a parent scope traversal, to ensure we fall back to the
            // correct level)
            if (flags & 16777216 /* isTraversingParentScope */) {
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return null;
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return scope.bindingContext || scope.overrideContext;
        }
        getObservers(flags) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('BindingContext', 'getObservers', slice$1.call(arguments));
            }
            if (this.$observers == null) {
                this.$observers = new InternalObserversLookup();
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return this.$observers;
        }
    }
    BindingContext.partName = null;
    class Scope {
        constructor(bindingContext, overrideContext) {
            this.bindingContext = bindingContext;
            this.overrideContext = overrideContext;
            this.partScopes = void 0;
        }
        static create(flags, bc, oc) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Scope', 'create', slice$1.call(arguments));
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return new Scope(bc, oc == null ? OverrideContext.create(flags, bc, oc) : oc);
        }
        static fromOverride(flags, oc) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Scope', 'fromOverride', slice$1.call(arguments));
            }
            if (oc == null) {
                throw kernel.Reporter.error(252 /* NilOverrideContext */);
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return new Scope(oc.bindingContext, oc);
        }
        static fromParent(flags, ps, bc) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Scope', 'fromParent', slice$1.call(arguments));
            }
            if (ps == null) {
                throw kernel.Reporter.error(253 /* NilParentScope */);
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return new Scope(bc, OverrideContext.create(flags, bc, ps.overrideContext));
        }
    }
    class OverrideContext {
        constructor(bindingContext, parentOverrideContext) {
            this.$synthetic = true;
            this.bindingContext = bindingContext;
            this.parentOverrideContext = parentOverrideContext;
        }
        static create(flags, bc, poc) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('OverrideContext', 'create', slice$1.call(arguments));
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return new OverrideContext(bc, poc === void 0 ? null : poc);
        }
        getObservers() {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('OverrideContext', 'getObservers', slice$1.call(arguments));
            }
            if (this.$observers === void 0) {
                this.$observers = new InternalObserversLookup();
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return this.$observers;
        }
    }

    const ISignaler = kernel.DI.createInterface('ISignaler').withDefault(x => x.singleton(Signaler));
    /** @internal */
    class Signaler {
        constructor() {
            this.signals = Object.create(null);
        }
        dispatchSignal(name, flags) {
            const listeners = this.signals[name];
            if (listeners === undefined) {
                return;
            }
            for (const listener of listeners.keys()) {
                listener.handleChange(undefined, undefined, flags | 16 /* updateTargetInstance */);
            }
        }
        addSignalListener(name, listener) {
            const signals = this.signals;
            const listeners = signals[name];
            if (listeners === undefined) {
                signals[name] = new Set([listener]);
            }
            else {
                listeners.add(listener);
            }
        }
        removeSignalListener(name, listener) {
            const listeners = this.signals[name];
            if (listeners) {
                listeners.delete(listener);
            }
        }
    }

    function register(container) {
        const resourceKey = BindingBehaviorResource.keyFrom(this.description.name);
        container.register(kernel.Registration.singleton(resourceKey, this));
        container.register(kernel.Registration.singleton(this, this));
    }
    function bindingBehavior(nameOrDefinition) {
        return target => BindingBehaviorResource.define(nameOrDefinition, target); // TODO: fix this at some point
    }
    function keyFrom(name) {
        return `${this.name}:${name}`;
    }
    function isType(Type) {
        return Type.kind === this;
    }
    function define(nameOrDefinition, ctor) {
        const Type = ctor;
        const WritableType = Type;
        const description = typeof nameOrDefinition === 'string'
            ? { name: nameOrDefinition }
            : nameOrDefinition;
        WritableType.kind = BindingBehaviorResource;
        WritableType.description = description;
        Type.register = register;
        return Type;
    }
    const BindingBehaviorResource = {
        name: 'binding-behavior',
        keyFrom,
        isType,
        define
    };

    function register$1(container) {
        const resourceKey = this.kind.keyFrom(this.description.name);
        container.register(kernel.Registration.singleton(resourceKey, this));
        container.register(kernel.Registration.singleton(this, this));
    }
    function valueConverter(nameOrDefinition) {
        return target => ValueConverterResource.define(nameOrDefinition, target); // TODO: fix this at some point
    }
    function keyFrom$1(name) {
        return `${this.name}:${name}`;
    }
    function isType$1(Type) {
        return Type.kind === this;
    }
    function define$1(nameOrDefinition, ctor) {
        const Type = ctor;
        const description = typeof nameOrDefinition === 'string'
            ? { name: nameOrDefinition }
            : nameOrDefinition;
        Type.kind = ValueConverterResource;
        Type.description = description;
        Type.register = register$1;
        return Type;
    }
    const ValueConverterResource = {
        name: 'value-converter',
        keyFrom: keyFrom$1,
        isType: isType$1,
        define: define$1
    };

    function connects(expr) {
        return (expr.$kind & 32 /* Connects */) === 32 /* Connects */;
    }
    function observes(expr) {
        return (expr.$kind & 64 /* Observes */) === 64 /* Observes */;
    }
    function callsFunction(expr) {
        return (expr.$kind & 128 /* CallsFunction */) === 128 /* CallsFunction */;
    }
    function hasAncestor(expr) {
        return (expr.$kind & 256 /* HasAncestor */) === 256 /* HasAncestor */;
    }
    function isAssignable(expr) {
        return (expr.$kind & 8192 /* IsAssignable */) === 8192 /* IsAssignable */;
    }
    function isLeftHandSide(expr) {
        return (expr.$kind & 1024 /* IsLeftHandSide */) === 1024 /* IsLeftHandSide */;
    }
    function isPrimary(expr) {
        return (expr.$kind & 512 /* IsPrimary */) === 512 /* IsPrimary */;
    }
    function isResource(expr) {
        return (expr.$kind & 32768 /* IsResource */) === 32768 /* IsResource */;
    }
    function hasBind(expr) {
        return (expr.$kind & 2048 /* HasBind */) === 2048 /* HasBind */;
    }
    function hasUnbind(expr) {
        return (expr.$kind & 4096 /* HasUnbind */) === 4096 /* HasUnbind */;
    }
    function isLiteral(expr) {
        return (expr.$kind & 16384 /* IsLiteral */) === 16384 /* IsLiteral */;
    }
    function arePureLiterals(expressions) {
        if (expressions === void 0 || expressions.length === 0) {
            return true;
        }
        for (let i = 0; i < expressions.length; ++i) {
            if (!isPureLiteral(expressions[i])) {
                return false;
            }
        }
        return true;
    }
    function isPureLiteral(expr) {
        if (isLiteral(expr)) {
            switch (expr.$kind) {
                case 17955 /* ArrayLiteral */:
                    return arePureLiterals(expr.elements);
                case 17956 /* ObjectLiteral */:
                    return arePureLiterals(expr.values);
                case 17958 /* Template */:
                    return arePureLiterals(expr.expressions);
                case 17925 /* PrimitiveLiteral */:
                    return true;
            }
        }
        return false;
    }
    var RuntimeError$1;
    (function (RuntimeError) {
        RuntimeError[RuntimeError["NoLocator"] = 202] = "NoLocator";
        RuntimeError[RuntimeError["NoBehaviorFound"] = 203] = "NoBehaviorFound";
        RuntimeError[RuntimeError["BehaviorAlreadyApplied"] = 204] = "BehaviorAlreadyApplied";
        RuntimeError[RuntimeError["NoConverterFound"] = 205] = "NoConverterFound";
        RuntimeError[RuntimeError["NoBinding"] = 206] = "NoBinding";
        RuntimeError[RuntimeError["NotAFunction"] = 207] = "NotAFunction";
        RuntimeError[RuntimeError["UnknownOperator"] = 208] = "UnknownOperator";
        RuntimeError[RuntimeError["NilScope"] = 250] = "NilScope";
    })(RuntimeError$1 || (RuntimeError$1 = {}));
    class BindingBehavior {
        constructor(expression, name, args) {
            this.$kind = 38962 /* BindingBehavior */;
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.behaviorKey = BindingBehaviorResource.keyFrom(this.name);
        }
        evaluate(flags, scope, locator) {
            return this.expression.evaluate(flags, scope, locator);
        }
        assign(flags, scope, locator, value) {
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
        }
        bind(flags, scope, binding) {
            if (scope == null) {
                throw kernel.Reporter.error(250 /* NilScope */, this);
            }
            if (!binding) {
                throw kernel.Reporter.error(206 /* NoBinding */, this);
            }
            const locator = binding.locator;
            if (!locator) {
                throw kernel.Reporter.error(202 /* NoLocator */, this);
            }
            if (hasBind(this.expression)) {
                this.expression.bind(flags, scope, binding);
            }
            const behaviorKey = this.behaviorKey;
            const behavior = locator.get(behaviorKey);
            if (!behavior) {
                throw kernel.Reporter.error(203 /* NoBehaviorFound */, this);
            }
            if (binding[behaviorKey] === void 0) {
                binding[behaviorKey] = behavior;
                behavior.bind.call(behavior, flags, scope, binding, ...evalList(flags, scope, locator, this.args));
            }
            else {
                kernel.Reporter.write(204 /* BehaviorAlreadyApplied */, this);
            }
        }
        unbind(flags, scope, binding) {
            const behaviorKey = this.behaviorKey;
            if (binding[behaviorKey] !== void 0) {
                binding[behaviorKey].unbind(flags, scope, binding);
                binding[behaviorKey] = void 0;
            }
            else {
                // TODO: this is a temporary hack to make testing repeater keyed mode easier,
                // we should remove this idempotency again when track-by attribute is implemented
                kernel.Reporter.write(204 /* BehaviorAlreadyApplied */, this);
            }
            if (hasUnbind(this.expression)) {
                this.expression.unbind(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitBindingBehavior(this);
        }
    }
    class ValueConverter {
        constructor(expression, name, args) {
            this.$kind = 36913 /* ValueConverter */;
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.converterKey = ValueConverterResource.keyFrom(this.name);
        }
        evaluate(flags, scope, locator) {
            if (!locator) {
                throw kernel.Reporter.error(202 /* NoLocator */, this);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw kernel.Reporter.error(205 /* NoConverterFound */, this);
            }
            if ('toView' in converter) {
                const args = this.args;
                const len = args.length;
                const result = Array(len + 1);
                result[0] = this.expression.evaluate(flags, scope, locator);
                for (let i = 0; i < len; ++i) {
                    result[i + 1] = args[i].evaluate(flags, scope, locator);
                }
                return converter.toView.call(converter, ...result);
            }
            return this.expression.evaluate(flags, scope, locator);
        }
        assign(flags, scope, locator, value) {
            if (!locator) {
                throw kernel.Reporter.error(202 /* NoLocator */, this);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw kernel.Reporter.error(205 /* NoConverterFound */, this);
            }
            if ('fromView' in converter) {
                value = converter.fromView.call(converter, value, ...(evalList(flags, scope, locator, this.args)));
            }
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            if (scope == null) {
                throw kernel.Reporter.error(250 /* NilScope */, this);
            }
            if (!binding) {
                throw kernel.Reporter.error(206 /* NoBinding */, this);
            }
            const locator = binding.locator;
            if (!locator) {
                throw kernel.Reporter.error(202 /* NoLocator */, this);
            }
            this.expression.connect(flags, scope, binding);
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw kernel.Reporter.error(205 /* NoConverterFound */, this);
            }
            const signals = converter.signals;
            if (signals === void 0) {
                return;
            }
            const signaler = locator.get(ISignaler);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
                signaler.addSignalListener(signals[i], binding);
            }
        }
        unbind(flags, scope, binding) {
            const locator = binding.locator;
            const converter = locator.get(this.converterKey);
            const signals = converter.signals;
            if (signals === void 0) {
                return;
            }
            const signaler = locator.get(ISignaler);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
                signaler.removeSignalListener(signals[i], binding);
            }
        }
        accept(visitor) {
            return visitor.visitValueConverter(this);
        }
    }
    class Assign {
        constructor(target, value) {
            this.$kind = 8208 /* Assign */;
            this.target = target;
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator));
        }
        connect(flags, scope, binding) {
            return;
        }
        assign(flags, scope, locator, value) {
            this.value.assign(flags, scope, locator, value);
            return this.target.assign(flags, scope, locator, value);
        }
        accept(visitor) {
            return visitor.visitAssign(this);
        }
    }
    class Conditional {
        constructor(condition, yes, no) {
            this.$kind = 63 /* Conditional */;
            this.assign = kernel.PLATFORM.noop;
            this.condition = condition;
            this.yes = yes;
            this.no = no;
        }
        evaluate(flags, scope, locator) {
            return (!!this.condition.evaluate(flags, scope, locator))
                ? this.yes.evaluate(flags, scope, locator)
                : this.no.evaluate(flags, scope, locator);
        }
        connect(flags, scope, binding) {
            const condition = this.condition;
            if (condition.evaluate(flags, scope, null)) {
                this.condition.connect(flags, scope, binding);
                this.yes.connect(flags, scope, binding);
            }
            else {
                this.condition.connect(flags, scope, binding);
                this.no.connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitConditional(this);
        }
    }
    class AccessThis {
        constructor(ancestor = 0) {
            this.$kind = 1793 /* AccessThis */;
            this.assign = kernel.PLATFORM.noop;
            this.connect = kernel.PLATFORM.noop;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            if (scope == null) {
                throw kernel.Reporter.error(250 /* NilScope */, this);
            }
            let oc = scope.overrideContext;
            let i = this.ancestor;
            while (i-- && oc) {
                oc = oc.parentOverrideContext;
            }
            return i < 1 && oc ? oc.bindingContext : void 0;
        }
        accept(visitor) {
            return visitor.visitAccessThis(this);
        }
    }
    AccessThis.$this = new AccessThis(0);
    AccessThis.$parent = new AccessThis(1);
    class AccessScope {
        constructor(name, ancestor = 0) {
            this.$kind = 10082 /* AccessScope */;
            this.name = name;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            return BindingContext.get(scope, this.name, this.ancestor, flags)[this.name];
        }
        assign(flags, scope, locator, value) {
            const obj = BindingContext.get(scope, this.name, this.ancestor, flags);
            if (obj instanceof Object) {
                if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                    obj.$observers[this.name].setValue(value, flags);
                    return value;
                }
                else {
                    return obj[this.name] = value;
                }
            }
            return void 0;
        }
        connect(flags, scope, binding) {
            const context = BindingContext.get(scope, this.name, this.ancestor, flags);
            binding.observeProperty(flags, context, this.name);
        }
        accept(visitor) {
            return visitor.visitAccessScope(this);
        }
    }
    class AccessMember {
        constructor(object, name) {
            this.$kind = 9323 /* AccessMember */;
            this.object = object;
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            return instance == null ? instance : instance[this.name];
        }
        assign(flags, scope, locator, value) {
            const obj = this.object.evaluate(flags, scope, locator);
            if (obj instanceof Object) {
                if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                    obj.$observers[this.name].setValue(value, flags);
                }
                else {
                    obj[this.name] = value;
                }
            }
            else {
                this.object.assign(flags, scope, locator, { [this.name]: value });
            }
            return value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (obj instanceof Object) {
                binding.observeProperty(flags, obj, this.name);
            }
        }
        accept(visitor) {
            return visitor.visitAccessMember(this);
        }
    }
    class AccessKeyed {
        constructor(object, key) {
            this.$kind = 9324 /* AccessKeyed */;
            this.object = object;
            this.key = key;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            if (instance instanceof Object) {
                const key = this.key.evaluate(flags, scope, locator);
                return instance[key];
            }
            return void 0;
        }
        assign(flags, scope, locator, value) {
            const instance = this.object.evaluate(flags, scope, locator);
            const key = this.key.evaluate(flags, scope, locator);
            return instance[key] = value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (obj instanceof Object) {
                this.key.connect(flags, scope, binding);
                const key = this.key.evaluate(flags, scope, null);
                if (Array.isArray(obj) && kernel.isNumeric(key)) {
                    // Only observe array indexers in proxy mode
                    if (flags & 2 /* proxyStrategy */) {
                        binding.observeProperty(flags, obj, key);
                    }
                }
                else {
                    // observe the property represented by the key as long as it's not an array indexer
                    // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
                    binding.observeProperty(flags, obj, key);
                }
            }
        }
        accept(visitor) {
            return visitor.visitAccessKeyed(this);
        }
    }
    class CallScope {
        constructor(name, args, ancestor = 0) {
            this.$kind = 1448 /* CallScope */;
            this.assign = kernel.PLATFORM.noop;
            this.name = name;
            this.args = args;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            const args = evalList(flags, scope, locator, this.args);
            const context = BindingContext.get(scope, this.name, this.ancestor, flags);
            const func = getFunction(flags, context, this.name);
            if (func) {
                return func.apply(context, args);
            }
            return void 0;
        }
        connect(flags, scope, binding) {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitCallScope(this);
        }
    }
    class CallMember {
        constructor(object, name, args) {
            this.$kind = 1161 /* CallMember */;
            this.assign = kernel.PLATFORM.noop;
            this.object = object;
            this.name = name;
            this.args = args;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            const args = evalList(flags, scope, locator, this.args);
            const func = getFunction(flags, instance, this.name);
            if (func) {
                return func.apply(instance, args);
            }
            return void 0;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (getFunction(flags & ~2097152 /* mustEvaluate */, obj, this.name)) {
                const args = this.args;
                for (let i = 0, ii = args.length; i < ii; ++i) {
                    args[i].connect(flags, scope, binding);
                }
            }
        }
        accept(visitor) {
            return visitor.visitCallMember(this);
        }
    }
    class CallFunction {
        constructor(func, args) {
            this.$kind = 1162 /* CallFunction */;
            this.assign = kernel.PLATFORM.noop;
            this.func = func;
            this.args = args;
        }
        evaluate(flags, scope, locator) {
            const func = this.func.evaluate(flags, scope, locator);
            if (typeof func === 'function') {
                return func.apply(null, evalList(flags, scope, locator, this.args));
            }
            if (!(flags & 2097152 /* mustEvaluate */) && (func == null)) {
                return void 0;
            }
            throw kernel.Reporter.error(207 /* NotAFunction */, this);
        }
        connect(flags, scope, binding) {
            const func = this.func.evaluate(flags, scope, null);
            this.func.connect(flags, scope, binding);
            if (typeof func === 'function') {
                const args = this.args;
                for (let i = 0, ii = args.length; i < ii; ++i) {
                    args[i].connect(flags, scope, binding);
                }
            }
        }
        accept(visitor) {
            return visitor.visitCallFunction(this);
        }
    }
    class Binary {
        constructor(operation, left, right) {
            this.$kind = 46 /* Binary */;
            this.assign = kernel.PLATFORM.noop;
            this.operation = operation;
            this.left = left;
            this.right = right;
            // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
            // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
            // work to do; we can do this because the operation can't change after it's parsed
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) {
            throw kernel.Reporter.error(208 /* UnknownOperator */, this);
        }
        connect(flags, scope, binding) {
            const left = this.left.evaluate(flags, scope, null);
            this.left.connect(flags, scope, binding);
            if (this.operation === '&&' && !left || this.operation === '||' && left) {
                return;
            }
            this.right.connect(flags, scope, binding);
        }
        ['&&'](f, s, l) {
            return this.left.evaluate(f, s, l) && this.right.evaluate(f, s, l);
        }
        ['||'](f, s, l) {
            return this.left.evaluate(f, s, l) || this.right.evaluate(f, s, l);
        }
        ['=='](f, s, l) {
            // tslint:disable-next-line:triple-equals
            return this.left.evaluate(f, s, l) == this.right.evaluate(f, s, l);
        }
        ['==='](f, s, l) {
            return this.left.evaluate(f, s, l) === this.right.evaluate(f, s, l);
        }
        ['!='](f, s, l) {
            // tslint:disable-next-line:triple-equals
            return this.left.evaluate(f, s, l) != this.right.evaluate(f, s, l);
        }
        ['!=='](f, s, l) {
            return this.left.evaluate(f, s, l) !== this.right.evaluate(f, s, l);
        }
        ['instanceof'](f, s, l) {
            const right = this.right.evaluate(f, s, l);
            if (typeof right === 'function') {
                return this.left.evaluate(f, s, l) instanceof right;
            }
            return false;
        }
        ['in'](f, s, l) {
            const right = this.right.evaluate(f, s, l);
            if (right instanceof Object) {
                return this.left.evaluate(f, s, l) in right;
            }
            return false;
        }
        // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
        // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
        // this makes bugs in user code easier to track down for end users
        // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
        ['+'](f, s, l) {
            return this.left.evaluate(f, s, l) + this.right.evaluate(f, s, l);
        }
        ['-'](f, s, l) {
            return this.left.evaluate(f, s, l) - this.right.evaluate(f, s, l);
        }
        ['*'](f, s, l) {
            return this.left.evaluate(f, s, l) * this.right.evaluate(f, s, l);
        }
        ['/'](f, s, l) {
            return this.left.evaluate(f, s, l) / this.right.evaluate(f, s, l);
        }
        ['%'](f, s, l) {
            return this.left.evaluate(f, s, l) % this.right.evaluate(f, s, l);
        }
        ['<'](f, s, l) {
            return this.left.evaluate(f, s, l) < this.right.evaluate(f, s, l);
        }
        ['>'](f, s, l) {
            return this.left.evaluate(f, s, l) > this.right.evaluate(f, s, l);
        }
        ['<='](f, s, l) {
            return this.left.evaluate(f, s, l) <= this.right.evaluate(f, s, l);
        }
        ['>='](f, s, l) {
            return this.left.evaluate(f, s, l) >= this.right.evaluate(f, s, l);
        }
        // tslint:disable-next-line:member-ordering
        accept(visitor) {
            return visitor.visitBinary(this);
        }
    }
    class Unary {
        constructor(operation, expression) {
            this.$kind = 39 /* Unary */;
            this.assign = kernel.PLATFORM.noop;
            this.operation = operation;
            this.expression = expression;
            // see Binary (we're doing the same thing here)
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) {
            throw kernel.Reporter.error(208 /* UnknownOperator */, this);
        }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
        }
        ['void'](f, s, l) {
            return void this.expression.evaluate(f, s, l);
        }
        ['typeof'](f, s, l) {
            return typeof this.expression.evaluate(f, s, l);
        }
        ['!'](f, s, l) {
            return !this.expression.evaluate(f, s, l);
        }
        ['-'](f, s, l) {
            return -this.expression.evaluate(f, s, l);
        }
        ['+'](f, s, l) {
            return +this.expression.evaluate(f, s, l);
        }
        accept(visitor) {
            return visitor.visitUnary(this);
        }
    }
    class PrimitiveLiteral {
        constructor(value) {
            this.$kind = 17925 /* PrimitiveLiteral */;
            this.assign = kernel.PLATFORM.noop;
            this.connect = kernel.PLATFORM.noop;
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.value;
        }
        accept(visitor) {
            return visitor.visitPrimitiveLiteral(this);
        }
    }
    PrimitiveLiteral.$undefined = new PrimitiveLiteral(void 0);
    PrimitiveLiteral.$null = new PrimitiveLiteral(null);
    PrimitiveLiteral.$true = new PrimitiveLiteral(true);
    PrimitiveLiteral.$false = new PrimitiveLiteral(false);
    PrimitiveLiteral.$empty = new PrimitiveLiteral('');
    class HtmlLiteral {
        constructor(parts) {
            this.$kind = 51 /* HtmlLiteral */;
            this.assign = kernel.PLATFORM.noop;
            this.parts = parts;
        }
        evaluate(flags, scope, locator) {
            const elements = this.parts;
            let result = '';
            let value;
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                value = elements[i].evaluate(flags, scope, locator);
                if (value == null) {
                    continue;
                }
                result += value;
            }
            return result;
        }
        connect(flags, scope, binding) {
            for (let i = 0, ii = this.parts.length; i < ii; ++i) {
                this.parts[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitHtmlLiteral(this);
        }
    }
    class ArrayLiteral {
        constructor(elements) {
            this.$kind = 17955 /* ArrayLiteral */;
            this.assign = kernel.PLATFORM.noop;
            this.elements = elements;
        }
        evaluate(flags, scope, locator) {
            const elements = this.elements;
            const length = elements.length;
            const result = Array(length);
            for (let i = 0; i < length; ++i) {
                result[i] = elements[i].evaluate(flags, scope, locator);
            }
            return result;
        }
        connect(flags, scope, binding) {
            const elements = this.elements;
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                elements[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitArrayLiteral(this);
        }
    }
    ArrayLiteral.$empty = new ArrayLiteral(kernel.PLATFORM.emptyArray);
    class ObjectLiteral {
        constructor(keys, values) {
            this.$kind = 17956 /* ObjectLiteral */;
            this.assign = kernel.PLATFORM.noop;
            this.keys = keys;
            this.values = values;
        }
        evaluate(flags, scope, locator) {
            const instance = {};
            const keys = this.keys;
            const values = this.values;
            for (let i = 0, ii = keys.length; i < ii; ++i) {
                instance[keys[i]] = values[i].evaluate(flags, scope, locator);
            }
            return instance;
        }
        connect(flags, scope, binding) {
            const keys = this.keys;
            const values = this.values;
            for (let i = 0, ii = keys.length; i < ii; ++i) {
                values[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitObjectLiteral(this);
        }
    }
    ObjectLiteral.$empty = new ObjectLiteral(kernel.PLATFORM.emptyArray, kernel.PLATFORM.emptyArray);
    class Template {
        constructor(cooked, expressions) {
            this.$kind = 17958 /* Template */;
            this.assign = kernel.PLATFORM.noop;
            this.cooked = cooked;
            this.expressions = expressions === void 0 ? kernel.PLATFORM.emptyArray : expressions;
        }
        evaluate(flags, scope, locator) {
            const expressions = this.expressions;
            const cooked = this.cooked;
            let result = cooked[0];
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                result += expressions[i].evaluate(flags, scope, locator);
                result += cooked[i + 1];
            }
            return result;
        }
        connect(flags, scope, binding) {
            const expressions = this.expressions;
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                expressions[i].connect(flags, scope, binding);
                i++;
            }
        }
        accept(visitor) {
            return visitor.visitTemplate(this);
        }
    }
    Template.$empty = new Template(['']);
    class TaggedTemplate {
        constructor(cooked, raw, func, expressions) {
            this.$kind = 1197 /* TaggedTemplate */;
            this.assign = kernel.PLATFORM.noop;
            this.cooked = cooked;
            this.cooked.raw = raw;
            this.func = func;
            this.expressions = expressions === void 0 ? kernel.PLATFORM.emptyArray : expressions;
        }
        evaluate(flags, scope, locator) {
            const expressions = this.expressions;
            const len = expressions.length;
            const results = Array(len);
            for (let i = 0, ii = len; i < ii; ++i) {
                results[i] = expressions[i].evaluate(flags, scope, locator);
            }
            const func = this.func.evaluate(flags, scope, locator);
            if (typeof func !== 'function') {
                throw kernel.Reporter.error(207 /* NotAFunction */, this);
            }
            return func.apply(null, [this.cooked].concat(results));
        }
        connect(flags, scope, binding) {
            const expressions = this.expressions;
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                expressions[i].connect(flags, scope, binding);
            }
            this.func.connect(flags, scope, binding);
        }
        accept(visitor) {
            return visitor.visitTaggedTemplate(this);
        }
    }
    class ArrayBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(elements) {
            this.$kind = 65556 /* ArrayBindingPattern */;
            this.elements = elements;
        }
        evaluate(flags, scope, locator) {
            // TODO
            return void 0;
        }
        assign(flags, scope, locator, obj) {
            // TODO
            return void 0;
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitArrayBindingPattern(this);
        }
    }
    class ObjectBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(keys, values) {
            this.$kind = 65557 /* ObjectBindingPattern */;
            this.keys = keys;
            this.values = values;
        }
        evaluate(flags, scope, locator) {
            // TODO
            return void 0;
        }
        assign(flags, scope, locator, obj) {
            // TODO
            return void 0;
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitObjectBindingPattern(this);
        }
    }
    class BindingIdentifier {
        constructor(name) {
            this.$kind = 65558 /* BindingIdentifier */;
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            return this.name;
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitBindingIdentifier(this);
        }
    }
    const toStringTag = Object.prototype.toString;
    // https://tc39.github.io/ecma262/#sec-iteration-statements
    // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
    class ForOfStatement {
        constructor(declaration, iterable) {
            this.$kind = 6199 /* ForOfStatement */;
            this.assign = kernel.PLATFORM.noop;
            this.declaration = declaration;
            this.iterable = iterable;
        }
        evaluate(flags, scope, locator) {
            return this.iterable.evaluate(flags, scope, locator);
        }
        count(flags, result) {
            return CountForOfStatement[toStringTag.call(result)](result);
        }
        iterate(flags, result, func) {
            IterateForOfStatement[toStringTag.call(result)](flags | 33554432 /* isOriginalArray */, result, func);
        }
        connect(flags, scope, binding) {
            this.declaration.connect(flags, scope, binding);
            this.iterable.connect(flags, scope, binding);
        }
        bind(flags, scope, binding) {
            if (hasBind(this.iterable)) {
                this.iterable.bind(flags, scope, binding);
            }
        }
        unbind(flags, scope, binding) {
            if (hasUnbind(this.iterable)) {
                this.iterable.unbind(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitForOfStatement(this);
        }
    }
    /*
    * Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
    * so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
    * but this class might be a candidate for removal if it turns out it does provide all we need
    */
    class Interpolation {
        constructor(parts, expressions) {
            this.$kind = 24 /* Interpolation */;
            this.assign = kernel.PLATFORM.noop;
            this.parts = parts;
            this.expressions = expressions === void 0 ? kernel.PLATFORM.emptyArray : expressions;
            this.isMulti = this.expressions.length > 1;
            this.firstExpression = this.expressions[0];
        }
        evaluate(flags, scope, locator) {
            if (this.isMulti) {
                const expressions = this.expressions;
                const parts = this.parts;
                let result = parts[0];
                for (let i = 0, ii = expressions.length; i < ii; ++i) {
                    result += expressions[i].evaluate(flags, scope, locator);
                    result += parts[i + 1];
                }
                return result;
            }
            else {
                const parts = this.parts;
                return parts[0] + this.firstExpression.evaluate(flags, scope, locator) + parts[1];
            }
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitInterpolation(this);
        }
    }
    /// Evaluate the [list] in context of the [scope].
    function evalList(flags, scope, locator, list) {
        const len = list.length;
        const result = Array(len);
        for (let i = 0; i < len; ++i) {
            result[i] = list[i].evaluate(flags, scope, locator);
        }
        return result;
    }
    function getFunction(flags, obj, name) {
        const func = obj == null ? null : obj[name];
        if (typeof func === 'function') {
            return func;
        }
        if (!(flags & 2097152 /* mustEvaluate */) && func == null) {
            return null;
        }
        throw kernel.Reporter.error(207 /* NotAFunction */, obj, name, func);
    }
    const proxyAndOriginalArray = 2 /* proxyStrategy */ | 33554432 /* isOriginalArray */;
    /** @internal */
    const IterateForOfStatement = {
        ['[object Array]'](flags, result, func) {
            if ((flags & proxyAndOriginalArray) === proxyAndOriginalArray) {
                // If we're in proxy mode, and the array is the original "items" (and not an array we created here to iterate over e.g. a set)
                // then replace all items (which are Objects) with proxies so their properties are observed in the source view model even if no
                // observers are explicitly created
                const rawArray = exports.ProxyObserver.getRawIfProxy(result);
                const len = rawArray.length;
                let item;
                let i = 0;
                for (; i < len; ++i) {
                    item = rawArray[i];
                    if (item instanceof Object) {
                        item = rawArray[i] = exports.ProxyObserver.getOrCreate(item).proxy;
                    }
                    func(rawArray, i, item);
                }
            }
            else {
                for (let i = 0, ii = result.length; i < ii; ++i) {
                    func(result, i, result[i]);
                }
            }
        },
        ['[object Map]'](flags, result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const entry of result.entries()) {
                arr[++i] = entry;
            }
            IterateForOfStatement['[object Array]'](flags & ~33554432 /* isOriginalArray */, arr, func);
        },
        ['[object Set]'](flags, result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const key of result.keys()) {
                arr[++i] = key;
            }
            IterateForOfStatement['[object Array]'](flags & ~33554432 /* isOriginalArray */, arr, func);
        },
        ['[object Number]'](flags, result, func) {
            const arr = Array(result);
            for (let i = 0; i < result; ++i) {
                arr[i] = i;
            }
            IterateForOfStatement['[object Array]'](flags & ~33554432 /* isOriginalArray */, arr, func);
        },
        ['[object Null]'](flags, result, func) {
            return;
        },
        ['[object Undefined]'](flags, result, func) {
            return;
        }
    };
    /** @internal */
    const CountForOfStatement = {
        ['[object Array]'](result) { return result.length; },
        ['[object Map]'](result) { return result.size; },
        ['[object Set]'](result) { return result.size; },
        ['[object Number]'](result) { return result; },
        ['[object Null]'](result) { return 0; },
        ['[object Undefined]'](result) { return 0; }
    };

    /*
    * Note: the oneTime binding now has a non-zero value for 2 reasons:
    *  - plays nicer with bitwise operations (more consistent code, more explicit settings)
    *  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
    *
    * Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
    * This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
    */
    (function (BindingMode) {
        BindingMode[BindingMode["oneTime"] = 1] = "oneTime";
        BindingMode[BindingMode["toView"] = 2] = "toView";
        BindingMode[BindingMode["fromView"] = 4] = "fromView";
        BindingMode[BindingMode["twoWay"] = 6] = "twoWay";
        BindingMode[BindingMode["default"] = 8] = "default";
    })(exports.BindingMode || (exports.BindingMode = {}));
    (function (BindingStrategy) {
        /**
         * Configures all components "below" this one to operate in getterSetter binding mode.
         * This is the default; if no strategy is specified, this one is implied.
         *
         * This strategy is the most compatible, convenient and has the best performance on frequently updated bindings on components that are infrequently replaced.
         * However, it also consumes the most resources on initialization.
         */
        BindingStrategy[BindingStrategy["getterSetter"] = 1] = "getterSetter";
        /**
         * Configures all components "below" this one to operate in proxy binding mode.
         * No getters/setters are created.
         *
         * This strategy consumes significantly fewer resources than `getterSetter` on initialization and has the best performance on infrequently updated bindings on
         * components that are frequently replaced.
         * However, it consumes more resources on updates.
         */
        BindingStrategy[BindingStrategy["proxies"] = 2] = "proxies";
    })(exports.BindingStrategy || (exports.BindingStrategy = {}));
    const mandatoryStrategy = 1 /* getterSetter */ | 2 /* proxies */;
    function ensureValidStrategy(strategy) {
        if ((strategy & mandatoryStrategy) === 0) {
            // TODO: probably want to validate that user isn't trying to mix getterSetter/proxy
            // TODO: also need to make sure that strategy can be changed away from proxies inside the component tree (not here though, but just making a note)
            return strategy | 1 /* getterSetter */;
        }
        return strategy;
    }
    (function (State) {
        State[State["none"] = 0] = "none";
        State[State["isBinding"] = 1] = "isBinding";
        State[State["isUnbinding"] = 2] = "isUnbinding";
        State[State["isBound"] = 4] = "isBound";
        State[State["isBoundOrBinding"] = 5] = "isBoundOrBinding";
        State[State["isBoundOrUnbinding"] = 6] = "isBoundOrUnbinding";
        State[State["isAttaching"] = 8] = "isAttaching";
        State[State["isDetaching"] = 16] = "isDetaching";
        State[State["isAttached"] = 32] = "isAttached";
        State[State["isAttachedOrAttaching"] = 40] = "isAttachedOrAttaching";
        State[State["isAttachedOrDetaching"] = 48] = "isAttachedOrDetaching";
        State[State["isMounted"] = 64] = "isMounted";
        State[State["isCached"] = 128] = "isCached";
        State[State["needsBind"] = 256] = "needsBind";
        State[State["needsUnbind"] = 512] = "needsUnbind";
        State[State["needsAttach"] = 1024] = "needsAttach";
        State[State["needsDetach"] = 2048] = "needsDetach";
        State[State["needsMount"] = 4096] = "needsMount";
        State[State["needsUnmount"] = 8192] = "needsUnmount";
        State[State["hasLockedScope"] = 16384] = "hasLockedScope";
        State[State["canBeCached"] = 32768] = "canBeCached";
        State[State["inBoundQueue"] = 65536] = "inBoundQueue";
        State[State["inUnboundQueue"] = 131072] = "inUnboundQueue";
        State[State["inAttachedQueue"] = 262144] = "inAttachedQueue";
        State[State["inDetachedQueue"] = 524288] = "inDetachedQueue";
        State[State["inMountQueue"] = 1048576] = "inMountQueue";
        State[State["inUnmountQueue"] = 2097152] = "inUnmountQueue";
    })(exports.State || (exports.State = {}));
    (function (Hooks) {
        Hooks[Hooks["none"] = 1] = "none";
        Hooks[Hooks["hasCreated"] = 2] = "hasCreated";
        Hooks[Hooks["hasBinding"] = 4] = "hasBinding";
        Hooks[Hooks["hasBound"] = 8] = "hasBound";
        Hooks[Hooks["hasAttaching"] = 16] = "hasAttaching";
        Hooks[Hooks["hasAttached"] = 32] = "hasAttached";
        Hooks[Hooks["hasDetaching"] = 64] = "hasDetaching";
        Hooks[Hooks["hasDetached"] = 128] = "hasDetached";
        Hooks[Hooks["hasUnbinding"] = 256] = "hasUnbinding";
        Hooks[Hooks["hasUnbound"] = 512] = "hasUnbound";
        Hooks[Hooks["hasRender"] = 1024] = "hasRender";
        Hooks[Hooks["hasCaching"] = 2048] = "hasCaching";
    })(exports.Hooks || (exports.Hooks = {}));
    (function (LifecycleFlags) {
        LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
        // Bitmask for flags that need to be stored on a binding during $bind for mutation
        // callbacks outside of $bind
        LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 536870927] = "persistentBindingFlags";
        LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 536870912] = "allowParentScopeTraversal";
        LifecycleFlags[LifecycleFlags["bindingStrategy"] = 15] = "bindingStrategy";
        LifecycleFlags[LifecycleFlags["getterSetterStrategy"] = 1] = "getterSetterStrategy";
        LifecycleFlags[LifecycleFlags["proxyStrategy"] = 2] = "proxyStrategy";
        LifecycleFlags[LifecycleFlags["update"] = 48] = "update";
        LifecycleFlags[LifecycleFlags["updateTargetInstance"] = 16] = "updateTargetInstance";
        LifecycleFlags[LifecycleFlags["updateSourceExpression"] = 32] = "updateSourceExpression";
        LifecycleFlags[LifecycleFlags["from"] = 524224] = "from";
        LifecycleFlags[LifecycleFlags["fromFlush"] = 960] = "fromFlush";
        LifecycleFlags[LifecycleFlags["fromAsyncFlush"] = 64] = "fromAsyncFlush";
        LifecycleFlags[LifecycleFlags["fromSyncFlush"] = 128] = "fromSyncFlush";
        LifecycleFlags[LifecycleFlags["fromTick"] = 256] = "fromTick";
        LifecycleFlags[LifecycleFlags["fromBatch"] = 512] = "fromBatch";
        LifecycleFlags[LifecycleFlags["fromStartTask"] = 1024] = "fromStartTask";
        LifecycleFlags[LifecycleFlags["fromStopTask"] = 2048] = "fromStopTask";
        LifecycleFlags[LifecycleFlags["fromBind"] = 4096] = "fromBind";
        LifecycleFlags[LifecycleFlags["fromUnbind"] = 8192] = "fromUnbind";
        LifecycleFlags[LifecycleFlags["fromAttach"] = 16384] = "fromAttach";
        LifecycleFlags[LifecycleFlags["fromDetach"] = 32768] = "fromDetach";
        LifecycleFlags[LifecycleFlags["fromCache"] = 65536] = "fromCache";
        LifecycleFlags[LifecycleFlags["fromDOMEvent"] = 131072] = "fromDOMEvent";
        LifecycleFlags[LifecycleFlags["fromLifecycleTask"] = 262144] = "fromLifecycleTask";
        LifecycleFlags[LifecycleFlags["allowPublishRoundtrip"] = 524288] = "allowPublishRoundtrip";
        LifecycleFlags[LifecycleFlags["isPublishing"] = 1048576] = "isPublishing";
        LifecycleFlags[LifecycleFlags["mustEvaluate"] = 2097152] = "mustEvaluate";
        LifecycleFlags[LifecycleFlags["parentUnmountQueued"] = 4194304] = "parentUnmountQueued";
        // this flag is for the synchronous flush before detach (no point in updating the
        // DOM if it's about to be detached)
        LifecycleFlags[LifecycleFlags["doNotUpdateDOM"] = 8388608] = "doNotUpdateDOM";
        LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 16777216] = "isTraversingParentScope";
        LifecycleFlags[LifecycleFlags["isOriginalArray"] = 33554432] = "isOriginalArray";
        LifecycleFlags[LifecycleFlags["isCollectionMutation"] = 67108864] = "isCollectionMutation";
        LifecycleFlags[LifecycleFlags["updateOneTimeBindings"] = 134217728] = "updateOneTimeBindings";
        LifecycleFlags[LifecycleFlags["reorderNodes"] = 268435456] = "reorderNodes";
    })(exports.LifecycleFlags || (exports.LifecycleFlags = {}));
    (function (ExpressionKind) {
        ExpressionKind[ExpressionKind["Connects"] = 32] = "Connects";
        ExpressionKind[ExpressionKind["Observes"] = 64] = "Observes";
        ExpressionKind[ExpressionKind["CallsFunction"] = 128] = "CallsFunction";
        ExpressionKind[ExpressionKind["HasAncestor"] = 256] = "HasAncestor";
        ExpressionKind[ExpressionKind["IsPrimary"] = 512] = "IsPrimary";
        ExpressionKind[ExpressionKind["IsLeftHandSide"] = 1024] = "IsLeftHandSide";
        ExpressionKind[ExpressionKind["HasBind"] = 2048] = "HasBind";
        ExpressionKind[ExpressionKind["HasUnbind"] = 4096] = "HasUnbind";
        ExpressionKind[ExpressionKind["IsAssignable"] = 8192] = "IsAssignable";
        ExpressionKind[ExpressionKind["IsLiteral"] = 16384] = "IsLiteral";
        ExpressionKind[ExpressionKind["IsResource"] = 32768] = "IsResource";
        ExpressionKind[ExpressionKind["IsForDeclaration"] = 65536] = "IsForDeclaration";
        ExpressionKind[ExpressionKind["Type"] = 31] = "Type";
        // ---------------------------------------------------------------------------------------------------------------------------
        ExpressionKind[ExpressionKind["AccessThis"] = 1793] = "AccessThis";
        ExpressionKind[ExpressionKind["AccessScope"] = 10082] = "AccessScope";
        ExpressionKind[ExpressionKind["ArrayLiteral"] = 17955] = "ArrayLiteral";
        ExpressionKind[ExpressionKind["ObjectLiteral"] = 17956] = "ObjectLiteral";
        ExpressionKind[ExpressionKind["PrimitiveLiteral"] = 17925] = "PrimitiveLiteral";
        ExpressionKind[ExpressionKind["Template"] = 17958] = "Template";
        ExpressionKind[ExpressionKind["Unary"] = 39] = "Unary";
        ExpressionKind[ExpressionKind["CallScope"] = 1448] = "CallScope";
        ExpressionKind[ExpressionKind["CallMember"] = 1161] = "CallMember";
        ExpressionKind[ExpressionKind["CallFunction"] = 1162] = "CallFunction";
        ExpressionKind[ExpressionKind["AccessMember"] = 9323] = "AccessMember";
        ExpressionKind[ExpressionKind["AccessKeyed"] = 9324] = "AccessKeyed";
        ExpressionKind[ExpressionKind["TaggedTemplate"] = 1197] = "TaggedTemplate";
        ExpressionKind[ExpressionKind["Binary"] = 46] = "Binary";
        ExpressionKind[ExpressionKind["Conditional"] = 63] = "Conditional";
        ExpressionKind[ExpressionKind["Assign"] = 8208] = "Assign";
        ExpressionKind[ExpressionKind["ValueConverter"] = 36913] = "ValueConverter";
        ExpressionKind[ExpressionKind["BindingBehavior"] = 38962] = "BindingBehavior";
        ExpressionKind[ExpressionKind["HtmlLiteral"] = 51] = "HtmlLiteral";
        ExpressionKind[ExpressionKind["ArrayBindingPattern"] = 65556] = "ArrayBindingPattern";
        ExpressionKind[ExpressionKind["ObjectBindingPattern"] = 65557] = "ObjectBindingPattern";
        ExpressionKind[ExpressionKind["BindingIdentifier"] = 65558] = "BindingIdentifier";
        ExpressionKind[ExpressionKind["ForOfStatement"] = 6199] = "ForOfStatement";
        ExpressionKind[ExpressionKind["Interpolation"] = 24] = "Interpolation"; //
    })(exports.ExpressionKind || (exports.ExpressionKind = {}));

    (function (ViewModelKind) {
        ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
        ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
        ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
    })(exports.ViewModelKind || (exports.ViewModelKind = {}));
    const IController = kernel.DI.createInterface('IController').noDefault();
    const IViewFactory = kernel.DI.createInterface('IViewFactory').noDefault();
    class LinkedCallback {
        get first() {
            let cur = this;
            while (cur.prev !== void 0 && cur.prev.priority === this.priority) {
                cur = cur.prev;
            }
            return cur;
        }
        get last() {
            let cur = this;
            while (cur.next !== void 0 && cur.next.priority === this.priority) {
                cur = cur.next;
            }
            return cur;
        }
        constructor(cb, context = void 0, priority = 16384 /* normal */, once = false) {
            this.cb = cb;
            this.context = context;
            this.priority = priority;
            this.once = once;
            this.next = void 0;
            this.prev = void 0;
            this.unlinked = false;
        }
        equals(fn, context) {
            return this.cb === fn && this.context === context;
        }
        call(flags) {
            if (this.cb !== void 0) {
                if (this.context !== void 0) {
                    this.cb.call(this.context, flags);
                }
                else {
                    this.cb(flags);
                }
            }
            if (this.once) {
                return this.unlink(true);
            }
            else if (this.unlinked) {
                const next = this.next;
                this.next = void 0;
                return next;
            }
            else {
                return this.next;
            }
        }
        rotate() {
            if (this.prev === void 0 || this.prev.priority > this.priority) {
                return;
            }
            const { first, last } = this;
            const firstPrev = first.prev;
            const lastNext = last.next;
            const thisPrev = this.prev;
            this.prev = firstPrev;
            if (firstPrev !== void 0) {
                firstPrev.next = this;
            }
            last.next = first;
            first.prev = last;
            thisPrev.next = lastNext;
            if (lastNext !== void 0) {
                lastNext.prev = thisPrev;
            }
        }
        link(prev) {
            this.prev = prev;
            if (prev.next !== void 0) {
                prev.next.prev = this;
            }
            this.next = prev.next;
            prev.next = this;
        }
        unlink(removeNext = false) {
            this.unlinked = true;
            this.cb = void 0;
            this.context = void 0;
            if (this.prev !== void 0) {
                this.prev.next = this.next;
            }
            if (this.next !== void 0) {
                this.next.prev = this.prev;
            }
            this.prev = void 0;
            if (removeNext) {
                const { next } = this;
                this.next = void 0;
                return next;
            }
            return this.next;
        }
    }
    (function (Priority) {
        Priority[Priority["preempt"] = 32768] = "preempt";
        Priority[Priority["high"] = 28672] = "high";
        Priority[Priority["bind"] = 24576] = "bind";
        Priority[Priority["attach"] = 20480] = "attach";
        Priority[Priority["normal"] = 16384] = "normal";
        Priority[Priority["propagate"] = 12288] = "propagate";
        Priority[Priority["connect"] = 8192] = "connect";
        Priority[Priority["low"] = 4096] = "low";
    })(exports.Priority || (exports.Priority = {}));
    const ILifecycle = kernel.DI.createInterface('ILifecycle').withDefault(x => x.singleton(Lifecycle));
    const { min, max } = Math;
    class BoundQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.depth = 0;
            this.head = void 0;
            this.tail = void 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevBound = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by boundHead not being undefined
                this.tail.nextBound = controller;
            }
            this.tail = controller;
            controller.state |= 65536 /* inBoundQueue */;
        }
        remove(controller) {
            if (controller.prevBound !== void 0) {
                controller.prevBound.nextBound = controller.nextBound;
            }
            if (controller.nextBound !== void 0) {
                controller.nextBound.prevBound = controller.prevBound;
            }
            controller.prevBound = void 0;
            controller.nextBound = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevBound;
            }
            if (this.head === controller) {
                this.head = controller.nextBound;
            }
            controller.state = (controller.state | 65536 /* inBoundQueue */) ^ 65536 /* inBoundQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 65536 /* inBoundQueue */) ^ 65536 /* inBoundQueue */;
                    cur.bound(flags);
                    next = cur.nextBound;
                    cur.nextBound = void 0;
                    cur.prevBound = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class UnboundQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.depth = 0;
            this.head = void 0;
            this.tail = void 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevUnbound = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by unboundHead not being undefined
                this.tail.nextUnbound = controller;
            }
            this.tail = controller;
            controller.state |= 131072 /* inUnboundQueue */;
        }
        remove(controller) {
            if (controller.prevUnbound !== void 0) {
                controller.prevUnbound.nextUnbound = controller.nextUnbound;
            }
            if (controller.nextUnbound !== void 0) {
                controller.nextUnbound.prevUnbound = controller.prevUnbound;
            }
            controller.prevUnbound = void 0;
            controller.nextUnbound = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevUnbound;
            }
            if (this.head === controller) {
                this.head = controller.nextUnbound;
            }
            controller.state = (controller.state | 131072 /* inUnboundQueue */) ^ 131072 /* inUnboundQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 131072 /* inUnboundQueue */) ^ 131072 /* inUnboundQueue */;
                    cur.unbound(flags);
                    next = cur.nextUnbound;
                    cur.nextUnbound = void 0;
                    cur.prevUnbound = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class AttachedQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.depth = 0;
            this.head = void 0;
            this.tail = void 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                // temporary, until everything else works and we're ready for integrating mount/unmount in the RAF queue
                this.lifecycle.mount.process(flags);
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevAttached = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by attachedHead not being undefined
                this.tail.nextAttached = controller;
            }
            this.tail = controller;
            controller.state |= 262144 /* inAttachedQueue */;
        }
        remove(controller) {
            if (controller.prevAttached !== void 0) {
                controller.prevAttached.nextAttached = controller.nextAttached;
            }
            if (controller.nextAttached !== void 0) {
                controller.nextAttached.prevAttached = controller.prevAttached;
            }
            controller.prevAttached = void 0;
            controller.nextAttached = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevAttached;
            }
            if (this.head === controller) {
                this.head = controller.nextAttached;
            }
            controller.state = (controller.state | 262144 /* inAttachedQueue */) ^ 262144 /* inAttachedQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 262144 /* inAttachedQueue */) ^ 262144 /* inAttachedQueue */;
                    cur.attached(flags);
                    next = cur.nextAttached;
                    cur.nextAttached = void 0;
                    cur.prevAttached = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class DetachedQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.depth = 0;
            this.head = void 0;
            this.tail = void 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                // temporary, until everything else works and we're ready for integrating mount/unmount in the RAF queue
                this.lifecycle.unmount.process(flags);
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevDetached = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by detachedHead not being undefined
                this.tail.nextDetached = controller;
            }
            this.tail = controller;
            controller.state |= 524288 /* inDetachedQueue */;
        }
        remove(controller) {
            if (controller.prevDetached !== void 0) {
                controller.prevDetached.nextDetached = controller.nextDetached;
            }
            if (controller.nextDetached !== void 0) {
                controller.nextDetached.prevDetached = controller.prevDetached;
            }
            controller.prevDetached = void 0;
            controller.nextDetached = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevDetached;
            }
            if (this.head === controller) {
                this.head = controller.nextDetached;
            }
            controller.state = (controller.state | 524288 /* inDetachedQueue */) ^ 524288 /* inDetachedQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 524288 /* inDetachedQueue */) ^ 524288 /* inDetachedQueue */;
                    cur.detached(flags);
                    next = cur.nextDetached;
                    cur.nextDetached = void 0;
                    cur.prevDetached = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class MountQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.head = void 0;
            this.tail = void 0;
        }
        add(controller) {
            if ((controller.state & 2097152 /* inUnmountQueue */) > 0) {
                this.lifecycle.unmount.remove(controller);
                console.log(`in unmount queue during mountQueue.add, so removing`, this);
                return;
            }
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevMount = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by mountHead not being undefined
                this.tail.nextMount = controller;
            }
            this.tail = controller;
            controller.state |= 1048576 /* inMountQueue */;
        }
        remove(controller) {
            if (controller.prevMount !== void 0) {
                controller.prevMount.nextMount = controller.nextMount;
            }
            if (controller.nextMount !== void 0) {
                controller.nextMount.prevMount = controller.prevMount;
            }
            controller.prevMount = void 0;
            controller.nextMount = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevMount;
            }
            if (this.head === controller) {
                this.head = controller.nextMount;
            }
            controller.state = (controller.state | 1048576 /* inMountQueue */) ^ 1048576 /* inMountQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 1048576 /* inMountQueue */) ^ 1048576 /* inMountQueue */;
                    cur.mount(flags);
                    next = cur.nextMount;
                    cur.nextMount = void 0;
                    cur.prevMount = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class UnmountQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.head = void 0;
            this.tail = void 0;
        }
        add(controller) {
            if ((controller.state & 1048576 /* inMountQueue */) > 0) {
                this.lifecycle.mount.remove(controller);
                return;
            }
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevUnmount = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by unmountHead not being undefined
                this.tail.nextUnmount = controller;
            }
            this.tail = controller;
            controller.state |= 2097152 /* inUnmountQueue */;
        }
        remove(controller) {
            if (controller.prevUnmount !== void 0) {
                controller.prevUnmount.nextUnmount = controller.nextUnmount;
            }
            if (controller.nextUnmount !== void 0) {
                controller.nextUnmount.prevUnmount = controller.prevUnmount;
            }
            controller.prevUnmount = void 0;
            controller.nextUnmount = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevUnmount;
            }
            if (this.head === controller) {
                this.head = controller.nextUnmount;
            }
            controller.state = (controller.state | 2097152 /* inUnmountQueue */) ^ 2097152 /* inUnmountQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 2097152 /* inUnmountQueue */) ^ 2097152 /* inUnmountQueue */;
                    cur.unmount(flags);
                    next = cur.nextUnmount;
                    cur.nextUnmount = void 0;
                    cur.prevUnmount = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class BatchQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.queue = [];
            this.depth = 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(requestor) {
            this.queue.push(requestor);
        }
        remove(requestor) {
            const index = this.queue.indexOf(requestor);
            if (index > -1) {
                this.queue.splice(index, 1);
            }
        }
        process(flags) {
            flags |= 512 /* fromBatch */;
            while (this.queue.length > 0) {
                const batch = this.queue.slice();
                this.queue = [];
                const { length } = batch;
                for (let i = 0; i < length; ++i) {
                    batch[i].flushBatch(flags);
                }
            }
        }
    }
    class Lifecycle {
        get FPS() {
            return 1000 / this.prevFrameDuration;
        }
        get minFPS() {
            return 1000 / this.maxFrameDuration;
        }
        set minFPS(fps) {
            this.maxFrameDuration = 1000 / min(max(0, min(this.maxFPS, fps)), 60);
        }
        get maxFPS() {
            if (this.minFrameDuration > 0) {
                return 1000 / this.minFrameDuration;
            }
            return 60;
        }
        set maxFPS(fps) {
            if (fps >= 60) {
                this.minFrameDuration = 0;
            }
            else {
                this.minFrameDuration = 1000 / min(max(1, max(this.minFPS, fps)), 60);
            }
        }
        constructor() {
            this.rafHead = new LinkedCallback(void 0, void 0, Infinity);
            this.rafTail = (void 0);
            this.currentTick = 0;
            this.isFlushingRAF = false;
            this.rafRequestId = -1;
            this.rafStartTime = -1;
            this.isTicking = false;
            this.batch = new BatchQueue(this);
            this.mount = new MountQueue(this);
            this.unmount = new UnmountQueue(this);
            this.bound = new BoundQueue(this);
            this.unbound = new UnboundQueue(this);
            this.attached = new AttachedQueue(this);
            this.detached = new DetachedQueue(this);
            this.minFrameDuration = 0;
            this.maxFrameDuration = 1000 / 30;
            this.prevFrameDuration = 0;
            // tslint:disable-next-line: promise-must-complete
            this.nextFrame = new Promise(resolve => {
                this.resolveNextFrame = resolve;
            });
            this.tick = (timestamp) => {
                this.rafRequestId = -1;
                if (this.isTicking) {
                    this.processRAFQueue(960 /* fromFlush */, timestamp);
                    if (this.isTicking && this.rafRequestId === -1 && this.rafHead.next !== void 0) {
                        this.rafRequestId = kernel.PLATFORM.requestAnimationFrame(this.tick);
                    }
                    if (++this.currentTick > 1) {
                        this.resolveNextFrame(timestamp);
                        // tslint:disable-next-line: promise-must-complete
                        this.nextFrame = new Promise(resolve => {
                            this.resolveNextFrame = resolve;
                        });
                    }
                }
            };
            this.pendingChanges = 0;
            this.timeslicingEnabled = false;
            this.adaptiveTimeslicing = false;
            this.frameDurationFactor = 1;
        }
        static register(container) {
            return kernel.Registration.singleton(ILifecycle, this).register(container);
        }
        startTicking() {
            if (!this.isTicking) {
                this.isTicking = true;
                if (this.rafRequestId === -1 && this.rafHead.next !== void 0) {
                    this.rafStartTime = kernel.PLATFORM.now();
                    this.rafRequestId = kernel.PLATFORM.requestAnimationFrame(this.tick);
                }
            }
            else if (this.rafRequestId === -1 && this.rafHead.next !== void 0) {
                this.rafStartTime = kernel.PLATFORM.now();
                this.rafRequestId = kernel.PLATFORM.requestAnimationFrame(this.tick);
            }
        }
        stopTicking() {
            if (this.isTicking) {
                this.isTicking = false;
                if (this.rafRequestId !== -1) {
                    kernel.PLATFORM.cancelAnimationFrame(this.rafRequestId);
                    this.rafRequestId = -1;
                }
            }
            else if (this.rafRequestId !== -1) {
                kernel.PLATFORM.cancelAnimationFrame(this.rafRequestId);
                this.rafRequestId = -1;
            }
        }
        enqueueRAF(cb, context = void 0, priority = 16384 /* normal */, once = false) {
            const node = new LinkedCallback(cb, context, priority, once);
            let prev = this.rafHead;
            let current = prev.next;
            if (current === void 0) {
                node.link(prev);
            }
            else {
                do {
                    if (priority > current.priority || (priority === current.priority && once && !current.once)) {
                        node.link(prev);
                        break;
                    }
                    prev = current;
                    current = current.next;
                } while (current !== void 0);
                if (node.prev === void 0) {
                    node.link(prev);
                }
            }
            if (node.next === void 0) {
                this.rafTail = node;
            }
            this.startTicking();
        }
        dequeueRAF(cb, context = void 0) {
            let current = this.rafHead.next;
            while (current !== void 0) {
                if (current.equals(cb, context)) {
                    current = current.unlink();
                }
                else {
                    current = current.next;
                }
            }
        }
        processRAFQueue(flags, timestamp = kernel.PLATFORM.now()) {
            if (this.isFlushingRAF) {
                return;
            }
            this.isFlushingRAF = true;
            if (timestamp >= this.rafStartTime) {
                const prevFrameDuration = this.prevFrameDuration = timestamp - this.rafStartTime;
                if (prevFrameDuration + 1 < this.minFrameDuration) {
                    return;
                }
                let i = 0;
                if (this.adaptiveTimeslicing && this.maxFrameDuration > 0) {
                    // Clamp the factor between 10 and 0.1 to prevent hanging or unjustified skipping during sudden shifts in workload
                    this.frameDurationFactor = min(max(this.frameDurationFactor * (this.maxFrameDuration / prevFrameDuration), 0.1), 10);
                }
                else {
                    this.frameDurationFactor = 1;
                }
                const deadlineLow = timestamp + max(this.maxFrameDuration * this.frameDurationFactor, 1);
                const deadlineNormal = timestamp + max(this.maxFrameDuration * this.frameDurationFactor * 5, 5);
                const deadlineHigh = timestamp + max(this.maxFrameDuration * this.frameDurationFactor * 15, 15);
                flags |= 256 /* fromTick */;
                do {
                    this.pendingChanges = 0;
                    let current = this.rafHead.next;
                    while (current !== void 0) {
                        // only call performance.now() every 10 calls to reduce the overhead (is this low enough though?)
                        if (++i === 10) {
                            i = 0;
                            if (this.timeslicingEnabled) {
                                const { priority } = current;
                                const now = kernel.PLATFORM.now();
                                if (priority <= 4096 /* low */) {
                                    if (now >= deadlineLow) {
                                        current.rotate();
                                        if (current.last != void 0 && current.last.next != void 0) {
                                            current = current.last.next;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                else if (priority < 28672 /* high */) {
                                    if (now >= deadlineNormal) {
                                        current.rotate();
                                        if (current.last != void 0 && current.last.next != void 0) {
                                            current = current.last.next;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                else {
                                    if (now >= deadlineHigh) {
                                        current.rotate();
                                        if (current.last != void 0 && current.last.next != void 0) {
                                            current = current.last.next;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        current = current.call(flags);
                    }
                } while (this.pendingChanges > 0);
                if (this.rafHead.next === void 0) {
                    this.stopTicking();
                }
            }
            this.rafStartTime = timestamp;
            this.isFlushingRAF = false;
        }
        enableTimeslicing(adaptive = true) {
            this.timeslicingEnabled = true;
            this.adaptiveTimeslicing = adaptive === true;
        }
        disableTimeslicing() {
            this.timeslicingEnabled = false;
        }
    }

    // TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time
    const slice$2 = Array.prototype.slice;
    const slotNames = [];
    const versionSlotNames = [];
    let lastSlot = -1;
    function ensureEnoughSlotNames(currentSlot) {
        if (currentSlot === lastSlot) {
            lastSlot += 5;
            const ii = slotNames.length = versionSlotNames.length = lastSlot + 1;
            for (let i = currentSlot + 1; i < ii; ++i) {
                slotNames[i] = `_observer${i}`;
                versionSlotNames[i] = `_observerVersion${i}`;
            }
        }
    }
    ensureEnoughSlotNames(-1);
    /** @internal */
    function addObserver(observer) {
        // find the observer.
        const observerSlots = this.observerSlots == null ? 0 : this.observerSlots;
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
            observer[this.id] |= 16 /* updateTargetInstance */;
            // increment the slot count.
            if (i === observerSlots) {
                this.observerSlots = i + 1;
            }
        }
        // set the "version" when the observer was used.
        if (this.version == null) {
            this.version = 0;
        }
        this[versionSlotNames[i]] = this.version;
        ensureEnoughSlotNames(i);
    }
    /** @internal */
    function observeProperty(flags, obj, propertyName) {
        if (kernel.Tracer.enabled) {
            kernel.Tracer.enter(this['constructor'].name, 'observeProperty', slice$2.call(arguments));
        }
        const observer = this.observerLocator.getObserver(flags, obj, propertyName);
        /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
         *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
         *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
         *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
         *
         * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
         */
        this.addObserver(observer);
        if (kernel.Tracer.enabled) {
            kernel.Tracer.leave();
        }
    }
    /** @internal */
    function unobserve(all) {
        const slots = this.observerSlots;
        let slotName;
        let observer;
        if (all === true) {
            for (let i = 0; i < slots; ++i) {
                slotName = slotNames[i];
                observer = this[slotName];
                if (observer != null) {
                    this[slotName] = void 0;
                    observer.unsubscribe(this);
                    observer[this.id] &= ~16 /* updateTargetInstance */;
                }
            }
        }
        else {
            const version = this.version;
            for (let i = 0; i < slots; ++i) {
                if (this[versionSlotNames[i]] !== version) {
                    slotName = slotNames[i];
                    observer = this[slotName];
                    if (observer != null) {
                        this[slotName] = void 0;
                        observer.unsubscribe(this);
                        observer[this.id] &= ~16 /* updateTargetInstance */;
                    }
                }
            }
        }
    }
    function connectableDecorator(target) {
        const proto = target.prototype;
        if (!proto.hasOwnProperty('observeProperty'))
            proto.observeProperty = observeProperty;
        if (!proto.hasOwnProperty('unobserve'))
            proto.unobserve = unobserve;
        if (!proto.hasOwnProperty('addObserver'))
            proto.addObserver = addObserver;
        return target;
    }
    function connectable(target) {
        return target == null ? connectableDecorator : connectableDecorator(target);
    }
    let value = 0;
    connectable.assignIdTo = (instance) => {
        instance.id = ++value;
    };

    const slice$3 = Array.prototype.slice;
    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { oneTime, toView, fromView } = exports.BindingMode;
    // pre-combining flags for bitwise checks is a minor perf tweak
    const toViewOrOneTime = toView | oneTime;
    exports.Binding = class Binding {
        constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
            connectable.assignIdTo(this);
            this.$state = 0 /* none */;
            this.$lifecycle = locator.get(ILifecycle);
            this.$scope = void 0;
            this.locator = locator;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.targetObserver = void 0;
            this.persistentFlags = 0 /* none */;
        }
        updateTarget(value, flags) {
            flags |= this.persistentFlags;
            this.targetObserver.setValue(value, flags);
        }
        updateSource(value, flags) {
            flags |= this.persistentFlags;
            this.sourceExpression.assign(flags, this.$scope, this.locator, value);
        }
        handleChange(newValue, _previousValue, flags) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Binding', 'handleChange', slice$3.call(arguments));
            }
            if ((this.$state & 4 /* isBound */) === 0) {
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return;
            }
            flags |= this.persistentFlags;
            if ((flags & 16 /* updateTargetInstance */) > 0) {
                const previousValue = this.targetObserver.getValue();
                // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
                if (this.sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
                }
                if (newValue !== previousValue) {
                    this.updateTarget(newValue, flags);
                }
                if ((this.mode & oneTime) === 0) {
                    this.version++;
                    this.sourceExpression.connect(flags, this.$scope, this);
                    this.unobserve(false);
                }
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return;
            }
            if ((flags & 32 /* updateSourceExpression */) > 0) {
                if (newValue !== this.sourceExpression.evaluate(flags, this.$scope, this.locator)) {
                    this.updateSource(newValue, flags);
                }
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return;
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            throw kernel.Reporter.error(15, flags);
        }
        $bind(flags, scope) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Binding', '$bind', slice$3.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (kernel.Tracer.enabled) {
                        kernel.Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            // Store flags which we can only receive during $bind and need to pass on
            // to the AST during evaluate/connect/assign
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            this.$scope = scope;
            let sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                if (this.mode & fromView) {
                    targetObserver = this.targetObserver = this.observerLocator.getObserver(flags, this.target, this.targetProperty);
                }
                else {
                    targetObserver = this.targetObserver = this.observerLocator.getAccessor(flags, this.target, this.targetProperty);
                }
            }
            if (this.mode !== exports.BindingMode.oneTime && targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            if (this.mode & toViewOrOneTime) {
                this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator), flags);
            }
            if (this.mode & toView) {
                sourceExpression.connect(flags, scope, this);
            }
            if (this.mode & fromView) {
                targetObserver.subscribe(this);
                targetObserver[this.id] |= 32 /* updateSourceExpression */;
            }
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        $unbind(flags) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Binding', '$unbind', slice$3.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            // clear persistent flags
            this.persistentFlags = 0 /* none */;
            if (hasUnbind(this.sourceExpression)) {
                this.sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            if (this.targetObserver.unbind) {
                this.targetObserver.unbind(flags);
            }
            if (this.targetObserver.unsubscribe) {
                this.targetObserver.unsubscribe(this);
                this.targetObserver[this.id] &= ~32 /* updateSourceExpression */;
            }
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    exports.Binding = __decorate([
        connectable()
    ], exports.Binding);

    const slice$4 = Array.prototype.slice;
    class Call {
        constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
            this.$state = 0 /* none */;
            this.locator = locator;
            this.sourceExpression = sourceExpression;
            this.targetObserver = observerLocator.getObserver(0 /* none */, target, targetProperty);
        }
        callSource(args) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Call', 'callSource', slice$4.call(arguments));
            }
            const overrideContext = this.$scope.overrideContext;
            Object.assign(overrideContext, args);
            const result = this.sourceExpression.evaluate(2097152 /* mustEvaluate */, this.$scope, this.locator);
            for (const prop in args) {
                Reflect.deleteProperty(overrideContext, prop);
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return result;
        }
        $bind(flags, scope) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Call', '$bind', slice$4.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (kernel.Tracer.enabled) {
                        kernel.Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            if (hasBind(this.sourceExpression)) {
                this.sourceExpression.bind(flags, scope, this);
            }
            this.targetObserver.setValue(($args) => this.callSource($args), flags);
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        $unbind(flags) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Call', '$unbind', slice$4.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            if (hasUnbind(this.sourceExpression)) {
                this.sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            this.targetObserver.setValue(null, flags);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        observeProperty(flags, obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
    }

    const IExpressionParser = kernel.DI.createInterface('IExpressionParser').withDefault(x => x.singleton(ExpressionParser));
    /** @internal */
    class ExpressionParser {
        constructor() {
            this.expressionLookup = Object.create(null);
            this.forOfLookup = Object.create(null);
            this.interpolationLookup = Object.create(null);
        }
        parse(expression, bindingType) {
            switch (bindingType) {
                case 2048 /* Interpolation */: {
                    let found = this.interpolationLookup[expression];
                    if (found === void 0) {
                        found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
                case 539 /* ForCommand */: {
                    let found = this.forOfLookup[expression];
                    if (found === void 0) {
                        found = this.forOfLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
                default: {
                    // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
                    // But don't cache it, because empty strings are always invalid for any other type of binding
                    if (expression.length === 0 && (bindingType & (53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */))) {
                        return PrimitiveLiteral.$empty;
                    }
                    let found = this.expressionLookup[expression];
                    if (found === void 0) {
                        found = this.expressionLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
            }
        }
        cache(expressions) {
            const { forOfLookup, expressionLookup, interpolationLookup } = this;
            for (const expression in expressions) {
                const expr = expressions[expression];
                switch (expr.$kind) {
                    case 24 /* Interpolation */:
                        interpolationLookup[expression] = expr;
                        break;
                    case 6199 /* ForOfStatement */:
                        forOfLookup[expression] = expr;
                        break;
                    default:
                        expressionLookup[expression] = expr;
                }
            }
        }
        parseCore(expression, bindingType) {
            try {
                const parts = expression.split('.');
                const firstPart = parts[0];
                let current;
                if (firstPart.endsWith('()')) {
                    current = new CallScope(firstPart.replace('()', ''), kernel.PLATFORM.emptyArray);
                }
                else {
                    current = new AccessScope(parts[0]);
                }
                let index = 1;
                while (index < parts.length) {
                    const currentPart = parts[index];
                    if (currentPart.endsWith('()')) {
                        current = new CallMember(current, currentPart.replace('()', ''), kernel.PLATFORM.emptyArray);
                    }
                    else {
                        current = new AccessMember(current, parts[index]);
                    }
                    index++;
                }
                return current;
            }
            catch (e) {
                throw kernel.Reporter.error(3, e);
            }
        }
    }
    (function (BindingType) {
        BindingType[BindingType["None"] = 0] = "None";
        BindingType[BindingType["Interpolation"] = 2048] = "Interpolation";
        BindingType[BindingType["IsRef"] = 1280] = "IsRef";
        BindingType[BindingType["IsIterator"] = 512] = "IsIterator";
        BindingType[BindingType["IsCustom"] = 256] = "IsCustom";
        BindingType[BindingType["IsFunction"] = 128] = "IsFunction";
        BindingType[BindingType["IsEvent"] = 64] = "IsEvent";
        BindingType[BindingType["IsProperty"] = 32] = "IsProperty";
        BindingType[BindingType["IsCommand"] = 16] = "IsCommand";
        BindingType[BindingType["IsPropertyCommand"] = 48] = "IsPropertyCommand";
        BindingType[BindingType["IsEventCommand"] = 80] = "IsEventCommand";
        BindingType[BindingType["DelegationStrategyDelta"] = 6] = "DelegationStrategyDelta";
        BindingType[BindingType["Command"] = 15] = "Command";
        BindingType[BindingType["OneTimeCommand"] = 49] = "OneTimeCommand";
        BindingType[BindingType["ToViewCommand"] = 50] = "ToViewCommand";
        BindingType[BindingType["FromViewCommand"] = 51] = "FromViewCommand";
        BindingType[BindingType["TwoWayCommand"] = 52] = "TwoWayCommand";
        BindingType[BindingType["BindCommand"] = 53] = "BindCommand";
        BindingType[BindingType["TriggerCommand"] = 86] = "TriggerCommand";
        BindingType[BindingType["CaptureCommand"] = 87] = "CaptureCommand";
        BindingType[BindingType["DelegateCommand"] = 88] = "DelegateCommand";
        BindingType[BindingType["CallCommand"] = 153] = "CallCommand";
        BindingType[BindingType["OptionsCommand"] = 26] = "OptionsCommand";
        BindingType[BindingType["ForCommand"] = 539] = "ForCommand";
        BindingType[BindingType["CustomCommand"] = 284] = "CustomCommand";
    })(exports.BindingType || (exports.BindingType = {}));

    const { toView: toView$1, oneTime: oneTime$1 } = exports.BindingMode;
    class MultiInterpolationBinding {
        constructor(observerLocator, interpolation, target, targetProperty, mode, locator) {
            this.$state = 0 /* none */;
            this.$scope = void 0;
            this.interpolation = interpolation;
            this.locator = locator;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.target = target;
            this.targetProperty = targetProperty;
            // Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
            // value converters and binding behaviors.
            // Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
            // in which case the renderer will create the TextBinding directly
            const expressions = interpolation.expressions;
            const parts = this.parts = Array(expressions.length);
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                parts[i] = new exports.InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
            }
        }
        $bind(flags, scope) {
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 4 /* isBound */;
            this.$scope = scope;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$bind(flags, scope);
            }
        }
        $unbind(flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            this.$state &= ~4 /* isBound */;
            this.$scope = void 0;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$unbind(flags);
            }
        }
    }
    exports.InterpolationBinding = class InterpolationBinding {
        // tslint:disable-next-line:parameters-max-number
        constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
            connectable.assignIdTo(this);
            this.$state = 0 /* none */;
            this.interpolation = interpolation;
            this.isFirst = isFirst;
            this.mode = mode;
            this.locator = locator;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.targetObserver = observerLocator.getAccessor(0 /* none */, target, targetProperty);
        }
        updateTarget(value, flags) {
            this.targetObserver.setValue(value, flags | 16 /* updateTargetInstance */);
        }
        handleChange(_newValue, _previousValue, flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            const previousValue = this.targetObserver.getValue();
            const newValue = this.interpolation.evaluate(flags, this.$scope, this.locator);
            if (newValue !== previousValue) {
                this.updateTarget(newValue, flags);
            }
            if ((this.mode & oneTime$1) === 0) {
                this.version++;
                this.sourceExpression.connect(flags, this.$scope, this);
                this.unobserve(false);
            }
        }
        $bind(flags, scope) {
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 4 /* isBound */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            if (this.mode !== exports.BindingMode.oneTime && this.targetObserver.bind) {
                this.targetObserver.bind(flags);
            }
            // since the interpolation already gets the whole value, we only need to let the first
            // text binding do the update if there are multiple
            if (this.isFirst) {
                this.updateTarget(this.interpolation.evaluate(flags, scope, this.locator), flags);
            }
            if (this.mode & toView$1) {
                sourceExpression.connect(flags, scope, this);
            }
        }
        $unbind(flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            this.$state &= ~4 /* isBound */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            if (this.targetObserver.unbind) {
                this.targetObserver.unbind(flags);
            }
            this.$scope = void 0;
            this.unobserve(true);
        }
    };
    exports.InterpolationBinding = __decorate([
        connectable()
    ], exports.InterpolationBinding);

    const slice$5 = Array.prototype.slice;
    exports.LetBinding = class LetBinding {
        constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
            connectable.assignIdTo(this);
            this.$state = 0 /* none */;
            this.$lifecycle = locator.get(ILifecycle);
            this.$scope = void 0;
            this.locator = locator;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = null;
            this.targetProperty = targetProperty;
            this.toViewModel = toViewModel;
        }
        handleChange(_newValue, _previousValue, flags) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('LetBinding', 'handleChange', slice$5.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return;
            }
            if (flags & 16 /* updateTargetInstance */) {
                const { target, targetProperty } = this;
                const previousValue = target[targetProperty];
                const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
                if (newValue !== previousValue) {
                    target[targetProperty] = newValue;
                }
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return;
            }
            throw kernel.Reporter.error(15, flags);
        }
        $bind(flags, scope) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('LetBinding', '$bind', slice$5.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (kernel.Tracer.enabled) {
                        kernel.Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            this.target = (this.toViewModel ? scope.bindingContext : scope.overrideContext);
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            // sourceExpression might have been changed during bind
            this.target[this.targetProperty] = this.sourceExpression.evaluate(4096 /* fromBind */, scope, this.locator);
            this.sourceExpression.connect(flags, scope, this);
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        $unbind(flags) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('LetBinding', '$unbind', slice$5.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    exports.LetBinding = __decorate([
        connectable()
    ], exports.LetBinding);

    const slice$6 = Array.prototype.slice;
    class Ref {
        constructor(sourceExpression, target, locator) {
            this.$state = 0 /* none */;
            this.$scope = void 0;
            this.locator = locator;
            this.sourceExpression = sourceExpression;
            this.target = target;
        }
        $bind(flags, scope) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Ref', '$bind', slice$6.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (kernel.Tracer.enabled) {
                        kernel.Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            if (hasBind(this.sourceExpression)) {
                this.sourceExpression.bind(flags, scope, this);
            }
            this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        $unbind(flags) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Ref', '$unbind', slice$6.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
                this.sourceExpression.assign(flags, this.$scope, this.locator, null);
            }
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        observeProperty(flags, obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
    }

    /** @internal */
    var SubscriberFlags;
    (function (SubscriberFlags) {
        SubscriberFlags[SubscriberFlags["None"] = 0] = "None";
        SubscriberFlags[SubscriberFlags["Subscriber0"] = 1] = "Subscriber0";
        SubscriberFlags[SubscriberFlags["Subscriber1"] = 2] = "Subscriber1";
        SubscriberFlags[SubscriberFlags["Subscriber2"] = 4] = "Subscriber2";
        SubscriberFlags[SubscriberFlags["SubscribersRest"] = 8] = "SubscribersRest";
        SubscriberFlags[SubscriberFlags["Any"] = 15] = "Any";
    })(SubscriberFlags || (SubscriberFlags = {}));
    (function (DelegationStrategy) {
        DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
        DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
        DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
    })(exports.DelegationStrategy || (exports.DelegationStrategy = {}));
    (function (CollectionKind) {
        CollectionKind[CollectionKind["indexed"] = 8] = "indexed";
        CollectionKind[CollectionKind["keyed"] = 4] = "keyed";
        CollectionKind[CollectionKind["array"] = 9] = "array";
        CollectionKind[CollectionKind["map"] = 6] = "map";
        CollectionKind[CollectionKind["set"] = 7] = "set";
    })(exports.CollectionKind || (exports.CollectionKind = {}));
    function copyIndexMap(existing, deletedItems) {
        const { length } = existing;
        const arr = Array(length);
        let i = 0;
        while (i < length) {
            arr[i] = existing[i];
            ++i;
        }
        if (deletedItems !== void 0) {
            arr.deletedItems = deletedItems.slice(0);
        }
        else if (existing.deletedItems !== void 0) {
            arr.deletedItems = existing.deletedItems.slice(0);
        }
        else {
            arr.deletedItems = [];
        }
        arr.isIndexMap = true;
        return arr;
    }
    function createIndexMap(length = 0) {
        const arr = Array(length);
        let i = 0;
        while (i < length) {
            arr[i] = i++;
        }
        arr.deletedItems = [];
        arr.isIndexMap = true;
        return arr;
    }
    function cloneIndexMap(indexMap) {
        const clone = indexMap.slice();
        clone.deletedItems = indexMap.deletedItems.slice();
        clone.isIndexMap = true;
        return clone;
    }
    function isIndexMap(value) {
        return value instanceof Array && value.isIndexMap === true;
    }

    exports.CollectionLengthObserver = class CollectionLengthObserver {
        constructor(obj) {
            this.obj = obj;
            this.currentValue = obj.length;
        }
        getValue() {
            return this.obj.length;
        }
        setValue(newValue, flags) {
            const { currentValue } = this;
            if (newValue !== currentValue) {
                this.currentValue = newValue;
                this.callSubscribers(newValue, currentValue, flags | 16 /* updateTargetInstance */);
            }
        }
    };
    exports.CollectionLengthObserver = __decorate([
        subscriberCollection()
    ], exports.CollectionLengthObserver);

    // https://tc39.github.io/ecma262/#sec-sortcompare
    function sortCompare(x, y) {
        if (x === y) {
            return 0;
        }
        x = x === null ? 'null' : x.toString();
        y = y === null ? 'null' : y.toString();
        return x < y ? -1 : 1;
    }
    function preSortCompare(x, y) {
        if (x === void 0) {
            if (y === void 0) {
                return 0;
            }
            else {
                return 1;
            }
        }
        if (y === void 0) {
            return -1;
        }
        return 0;
    }
    function insertionSort(arr, indexMap, from, to, compareFn) {
        let velement, ielement, vtmp, itmp, order;
        let i, j;
        for (i = from + 1; i < to; i++) {
            velement = arr[i];
            ielement = indexMap[i];
            for (j = i - 1; j >= from; j--) {
                vtmp = arr[j];
                itmp = indexMap[j];
                order = compareFn(vtmp, velement);
                if (order > 0) {
                    arr[j + 1] = vtmp;
                    indexMap[j + 1] = itmp;
                }
                else {
                    break;
                }
            }
            arr[j + 1] = velement;
            indexMap[j + 1] = ielement;
        }
    }
    // tslint:disable-next-line:cognitive-complexity
    function quickSort(arr, indexMap, from, to, compareFn) {
        let thirdIndex = 0, i = 0;
        let v0, v1, v2;
        let i0, i1, i2;
        let c01, c02, c12;
        let vtmp, itmp;
        let vpivot, ipivot, lowEnd, highStart;
        let velement, ielement, order, vtopElement;
        // tslint:disable-next-line:no-constant-condition
        while (true) {
            if (to - from <= 10) {
                insertionSort(arr, indexMap, from, to, compareFn);
                return;
            }
            // tslint:disable:no-statements-same-line
            thirdIndex = from + ((to - from) >> 1);
            v0 = arr[from];
            i0 = indexMap[from];
            v1 = arr[to - 1];
            i1 = indexMap[to - 1];
            v2 = arr[thirdIndex];
            i2 = indexMap[thirdIndex];
            c01 = compareFn(v0, v1);
            if (c01 > 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v1;
                i0 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            c02 = compareFn(v0, v2);
            if (c02 >= 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v2;
                i0 = i2;
                v2 = v1;
                i2 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            else {
                c12 = compareFn(v1, v2);
                if (c12 > 0) {
                    vtmp = v1;
                    itmp = i1;
                    v1 = v2;
                    i1 = i2;
                    v2 = vtmp;
                    i2 = itmp;
                }
            }
            arr[from] = v0;
            indexMap[from] = i0;
            arr[to - 1] = v2;
            indexMap[to - 1] = i2;
            vpivot = v1;
            ipivot = i1;
            lowEnd = from + 1;
            highStart = to - 1;
            arr[thirdIndex] = arr[lowEnd];
            indexMap[thirdIndex] = indexMap[lowEnd];
            arr[lowEnd] = vpivot;
            indexMap[lowEnd] = ipivot;
            partition: for (i = lowEnd + 1; i < highStart; i++) {
                velement = arr[i];
                ielement = indexMap[i];
                order = compareFn(velement, vpivot);
                if (order < 0) {
                    arr[i] = arr[lowEnd];
                    indexMap[i] = indexMap[lowEnd];
                    arr[lowEnd] = velement;
                    indexMap[lowEnd] = ielement;
                    lowEnd++;
                }
                else if (order > 0) {
                    do {
                        highStart--;
                        // tslint:disable-next-line:triple-equals
                        if (highStart == i) {
                            break partition;
                        }
                        vtopElement = arr[highStart];
                        order = compareFn(vtopElement, vpivot);
                    } while (order > 0);
                    arr[i] = arr[highStart];
                    indexMap[i] = indexMap[highStart];
                    arr[highStart] = velement;
                    indexMap[highStart] = ielement;
                    if (order < 0) {
                        velement = arr[i];
                        ielement = indexMap[i];
                        arr[i] = arr[lowEnd];
                        indexMap[i] = indexMap[lowEnd];
                        arr[lowEnd] = velement;
                        indexMap[lowEnd] = ielement;
                        lowEnd++;
                    }
                }
            }
            // tslint:enable:no-statements-same-line
            if (to - highStart < lowEnd - from) {
                quickSort(arr, indexMap, highStart, to, compareFn);
                to = lowEnd;
            }
            else {
                quickSort(arr, indexMap, from, lowEnd, compareFn);
                from = highStart;
            }
        }
    }
    const proto = Array.prototype;
    const $push = proto.push;
    const $unshift = proto.unshift;
    const $pop = proto.pop;
    const $shift = proto.shift;
    const $splice = proto.splice;
    const $reverse = proto.reverse;
    const $sort = proto.sort;
    const native = { push: $push, unshift: $unshift, pop: $pop, shift: $shift, splice: $splice, reverse: $reverse, sort: $sort };
    const methods = ['push', 'unshift', 'pop', 'shift', 'splice', 'reverse', 'sort'];
    const observe = {
        // https://tc39.github.io/ecma262/#sec-array.prototype.push
        push: function () {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $push.apply($this, arguments);
            }
            const len = $this.length;
            const argCount = arguments.length;
            if (argCount === 0) {
                return len;
            }
            $this.length = o.indexMap.length = len + argCount;
            let i = len;
            while (i < $this.length) {
                $this[i] = arguments[i - len];
                o.indexMap[i] = -2;
                i++;
            }
            o.notify();
            return $this.length;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
        unshift: function () {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $unshift.apply($this, arguments);
            }
            const argCount = arguments.length;
            const inserts = new Array(argCount);
            let i = 0;
            while (i < argCount) {
                inserts[i++] = -2;
            }
            $unshift.apply(o.indexMap, inserts);
            const len = $unshift.apply($this, arguments);
            o.notify();
            return len;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.pop
        pop: function () {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $pop.call($this);
            }
            const indexMap = o.indexMap;
            const element = $pop.call($this);
            // only mark indices as deleted if they actually existed in the original array
            const index = indexMap.length - 1;
            if (indexMap[index] > -1) {
                indexMap.deletedItems.push(indexMap[index]);
            }
            $pop.call(indexMap);
            o.notify();
            return element;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.shift
        shift: function () {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $shift.call($this);
            }
            const indexMap = o.indexMap;
            const element = $shift.call($this);
            // only mark indices as deleted if they actually existed in the original array
            if (indexMap[0] > -1) {
                indexMap.deletedItems.push(indexMap[0]);
            }
            $shift.call(indexMap);
            o.notify();
            return element;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.splice
        splice: function (start, deleteCount) {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $splice.apply($this, arguments);
            }
            const indexMap = o.indexMap;
            if (deleteCount > 0) {
                let i = isNaN(start) ? 0 : start;
                const to = i + deleteCount;
                while (i < to) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    i++;
                }
            }
            const argCount = arguments.length;
            if (argCount > 2) {
                const itemCount = argCount - 2;
                const inserts = new Array(itemCount);
                let i = 0;
                while (i < itemCount) {
                    inserts[i++] = -2;
                }
                $splice.call(indexMap, start, deleteCount, ...inserts);
            }
            else if (argCount === 2) {
                $splice.call(indexMap, start, deleteCount);
            }
            const deleted = $splice.apply($this, arguments);
            o.notify();
            return deleted;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
        reverse: function () {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                $reverse.call($this);
                return this;
            }
            const len = $this.length;
            const middle = (len / 2) | 0;
            let lower = 0;
            // tslint:disable:no-statements-same-line
            while (lower !== middle) {
                const upper = len - lower - 1;
                const lowerValue = $this[lower];
                const lowerIndex = o.indexMap[lower];
                const upperValue = $this[upper];
                const upperIndex = o.indexMap[upper];
                $this[lower] = upperValue;
                o.indexMap[lower] = upperIndex;
                $this[upper] = lowerValue;
                o.indexMap[upper] = lowerIndex;
                lower++;
            }
            // tslint:enable:no-statements-same-line
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.sort
        // https://github.com/v8/v8/blob/master/src/js/array.js
        sort: function (compareFn) {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                $sort.call($this, compareFn);
                return this;
            }
            const len = $this.length;
            if (len < 2) {
                return this;
            }
            quickSort($this, o.indexMap, 0, len, preSortCompare);
            let i = 0;
            while (i < len) {
                if ($this[i] === void 0) {
                    break;
                }
                i++;
            }
            if (compareFn === void 0 || typeof compareFn !== 'function' /*spec says throw a TypeError, should we do that too?*/) {
                compareFn = sortCompare;
            }
            quickSort($this, o.indexMap, 0, i, compareFn);
            o.notify();
            return this;
        }
    };
    const descriptorProps = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def = Reflect.defineProperty;
    for (const method of methods) {
        def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    let enableArrayObservationCalled = false;
    function enableArrayObservation() {
        for (const method of methods) {
            if (proto[method].observing !== true) {
                def(proto, method, { ...descriptorProps, value: observe[method] });
            }
        }
    }
    function disableArrayObservation() {
        for (const method of methods) {
            if (proto[method].observing === true) {
                def(proto, method, { ...descriptorProps, value: native[method] });
            }
        }
    }
    const slice$7 = Array.prototype.slice;
    exports.ArrayObserver = class ArrayObserver {
        constructor(flags, lifecycle, array) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('ArrayObserver', 'constructor', slice$7.call(arguments));
            }
            if (!enableArrayObservationCalled) {
                enableArrayObservationCalled = true;
                enableArrayObservation();
            }
            this.inBatch = false;
            this.collection = array;
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            this.indexMap = createIndexMap(array.length);
            this.lifecycle = lifecycle;
            this.lengthObserver = (void 0);
            Reflect.defineProperty(array, '$observer', {
                value: this,
                enumerable: false,
                writable: true,
                configurable: true,
            });
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        notify() {
            if (this.lifecycle.batch.depth > 0) {
                if (!this.inBatch) {
                    this.inBatch = true;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                this.flushBatch(0 /* none */);
            }
        }
        getLengthObserver() {
            if (this.lengthObserver === void 0) {
                this.lengthObserver = new exports.CollectionLengthObserver(this.collection);
            }
            return this.lengthObserver;
        }
        flushBatch(flags) {
            this.inBatch = false;
            const { indexMap, collection } = this;
            const { length } = collection;
            this.indexMap = createIndexMap(length);
            this.callCollectionSubscribers(indexMap, 16 /* updateTargetInstance */ | this.persistentFlags);
            if (this.lengthObserver !== void 0) {
                this.lengthObserver.setValue(length, 16 /* updateTargetInstance */);
            }
        }
    };
    exports.ArrayObserver = __decorate([
        collectionSubscriberCollection()
    ], exports.ArrayObserver);
    function getArrayObserver(flags, lifecycle, array) {
        if (array.$observer === void 0) {
            array.$observer = new exports.ArrayObserver(flags, lifecycle, array);
        }
        return array.$observer;
    }

    exports.CollectionSizeObserver = class CollectionSizeObserver {
        constructor(obj) {
            this.obj = obj;
            this.currentValue = obj.size;
        }
        getValue() {
            return this.obj.size;
        }
        setValue(newValue, flags) {
            const { currentValue } = this;
            if (newValue !== currentValue) {
                this.currentValue = newValue;
                this.callSubscribers(newValue, currentValue, flags | 16 /* updateTargetInstance */);
            }
        }
    };
    exports.CollectionSizeObserver = __decorate([
        subscriberCollection()
    ], exports.CollectionSizeObserver);

    const proto$1 = Map.prototype;
    const $set = proto$1.set;
    const $clear = proto$1.clear;
    const $delete = proto$1.delete;
    const native$1 = { set: $set, clear: $clear, delete: $delete };
    const methods$1 = ['set', 'clear', 'delete'];
    // note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, map/delete/clear are easy to reconstruct for the indexMap
    const observe$1 = {
        // https://tc39.github.io/ecma262/#sec-map.prototype.map
        set: function (key, value) {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                $set.call($this, key, value);
                return this;
            }
            const oldSize = $this.size;
            $set.call($this, key, value);
            const newSize = $this.size;
            if (newSize === oldSize) {
                let i = 0;
                for (const entry of $this.entries()) {
                    if (entry[0] === key) {
                        if (entry[1] !== value) {
                            o.indexMap[i] = -2;
                        }
                        return this;
                    }
                    i++;
                }
                return this;
            }
            o.indexMap[oldSize] = -2;
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.clear
        clear: function () {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                return $clear.call($this);
            }
            const size = $this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                for (const entry of $this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    i++;
                }
                $clear.call($this);
                indexMap.length = 0;
                o.notify();
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.delete
        delete: function (value) {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                return $delete.call($this, value);
            }
            const size = $this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of $this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    indexMap.splice(i, 1);
                    return $delete.call($this, value);
                }
                i++;
            }
            o.notify();
            return false;
        }
    };
    const descriptorProps$1 = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def$1 = Reflect.defineProperty;
    for (const method of methods$1) {
        def$1(observe$1[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    let enableMapObservationCalled = false;
    function enableMapObservation() {
        for (const method of methods$1) {
            if (proto$1[method].observing !== true) {
                def$1(proto$1, method, { ...descriptorProps$1, value: observe$1[method] });
            }
        }
    }
    function disableMapObservation() {
        for (const method of methods$1) {
            if (proto$1[method].observing === true) {
                def$1(proto$1, method, { ...descriptorProps$1, value: native$1[method] });
            }
        }
    }
    const slice$8 = Array.prototype.slice;
    exports.MapObserver = class MapObserver {
        constructor(flags, lifecycle, map) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('MapObserver', 'constructor', slice$8.call(arguments));
            }
            if (!enableMapObservationCalled) {
                enableMapObservationCalled = true;
                enableMapObservation();
            }
            this.inBatch = false;
            this.collection = map;
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            this.indexMap = createIndexMap(map.size);
            this.lifecycle = lifecycle;
            this.lengthObserver = (void 0);
            map.$observer = this;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        notify() {
            if (this.lifecycle.batch.depth > 0) {
                if (!this.inBatch) {
                    this.inBatch = true;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                this.flushBatch(0 /* none */);
            }
        }
        getLengthObserver() {
            if (this.lengthObserver === void 0) {
                this.lengthObserver = new exports.CollectionSizeObserver(this.collection);
            }
            return this.lengthObserver;
        }
        flushBatch(flags) {
            this.inBatch = false;
            const { indexMap, collection } = this;
            const { size } = collection;
            this.indexMap = createIndexMap(size);
            this.callCollectionSubscribers(indexMap, 16 /* updateTargetInstance */ | this.persistentFlags);
            if (this.lengthObserver !== void 0) {
                this.lengthObserver.setValue(size, 16 /* updateTargetInstance */);
            }
        }
    };
    exports.MapObserver = __decorate([
        collectionSubscriberCollection()
    ], exports.MapObserver);
    function getMapObserver(flags, lifecycle, map) {
        if (map.$observer === void 0) {
            map.$observer = new exports.MapObserver(flags, lifecycle, map);
        }
        return map.$observer;
    }

    const proto$2 = Set.prototype;
    const $add = proto$2.add;
    const $clear$1 = proto$2.clear;
    const $delete$1 = proto$2.delete;
    const native$2 = { add: $add, clear: $clear$1, delete: $delete$1 };
    const methods$2 = ['add', 'clear', 'delete'];
    // note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, add/delete/clear are easy to reconstruct for the indexMap
    const observe$2 = {
        // https://tc39.github.io/ecma262/#sec-set.prototype.add
        add: function (value) {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                $add.call($this, value);
                return this;
            }
            const oldSize = $this.size;
            $add.call($this, value);
            const newSize = $this.size;
            if (newSize === oldSize) {
                return this;
            }
            o.indexMap[oldSize] = -2;
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.clear
        clear: function () {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                return $clear$1.call($this);
            }
            const size = $this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                for (const entry of $this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    i++;
                }
                $clear$1.call($this);
                indexMap.length = 0;
                o.notify();
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.delete
        delete: function (value) {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                return $delete$1.call($this, value);
            }
            const size = $this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of $this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    indexMap.splice(i, 1);
                    return $delete$1.call($this, value);
                }
                i++;
            }
            o.notify();
            return false;
        }
    };
    const descriptorProps$2 = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def$2 = Reflect.defineProperty;
    for (const method of methods$2) {
        def$2(observe$2[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    let enableSetObservationCalled = false;
    function enableSetObservation() {
        for (const method of methods$2) {
            if (proto$2[method].observing !== true) {
                def$2(proto$2, method, { ...descriptorProps$2, value: observe$2[method] });
            }
        }
    }
    function disableSetObservation() {
        for (const method of methods$2) {
            if (proto$2[method].observing === true) {
                def$2(proto$2, method, { ...descriptorProps$2, value: native$2[method] });
            }
        }
    }
    const slice$9 = Array.prototype.slice;
    exports.SetObserver = class SetObserver {
        constructor(flags, lifecycle, observedSet) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('SetObserver', 'constructor', slice$9.call(arguments));
            }
            if (!enableSetObservationCalled) {
                enableSetObservationCalled = true;
                enableSetObservation();
            }
            this.inBatch = false;
            this.collection = observedSet;
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            this.indexMap = createIndexMap(observedSet.size);
            this.lifecycle = lifecycle;
            this.lengthObserver = (void 0);
            observedSet.$observer = this;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        notify() {
            if (this.lifecycle.batch.depth > 0) {
                if (!this.inBatch) {
                    this.inBatch = true;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                this.flushBatch(0 /* none */);
            }
        }
        getLengthObserver() {
            if (this.lengthObserver === void 0) {
                this.lengthObserver = new exports.CollectionSizeObserver(this.collection);
            }
            return this.lengthObserver;
        }
        flushBatch(flags) {
            this.inBatch = false;
            const { indexMap, collection } = this;
            const { size } = collection;
            this.indexMap = createIndexMap(size);
            this.callCollectionSubscribers(indexMap, 16 /* updateTargetInstance */ | this.persistentFlags);
            if (this.lengthObserver !== void 0) {
                this.lengthObserver.setValue(size, 16 /* updateTargetInstance */);
            }
        }
    };
    exports.SetObserver = __decorate([
        collectionSubscriberCollection()
    ], exports.SetObserver);
    function getSetObserver(flags, lifecycle, observedSet) {
        if (observedSet.$observer === void 0) {
            observedSet.$observer = new exports.SetObserver(flags, lifecycle, observedSet);
        }
        return observedSet.$observer;
    }

    const slice$a = Array.prototype.slice;
    function computed(config) {
        return function (target, key) {
            (target.computed || (target.computed = {}))[key] = config;
        };
    }
    const computedOverrideDefaults = { static: false, volatile: false };
    /* @internal */
    function createComputedObserver(flags, observerLocator, dirtyChecker, lifecycle, instance, propertyName, descriptor) {
        if (descriptor.configurable === false) {
            return dirtyChecker.createProperty(instance, propertyName);
        }
        if (descriptor.get) {
            const overrides = (instance.constructor.computed
                && instance.constructor.computed[propertyName]
                || computedOverrideDefaults);
            if (descriptor.set) {
                if (overrides.volatile) {
                    return new exports.GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
                }
                return new exports.CustomSetterObserver(instance, propertyName, descriptor);
            }
            return new exports.GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
        }
        throw kernel.Reporter.error(18, propertyName);
    }
    // Used when the getter is dependent solely on changes that happen within the setter.
    exports.CustomSetterObserver = class CustomSetterObserver {
        constructor(obj, propertyKey, descriptor) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = this.oldValue = undefined;
            this.descriptor = descriptor;
            this.observing = false;
        }
        setValue(newValue) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('CustomSetterObserver', 'setValue', slice$a.call(arguments));
            }
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied because descriptors without setters won't end up here
            this.descriptor.set.call(this.obj, newValue);
            if (this.currentValue !== newValue) {
                this.oldValue = this.currentValue;
                this.currentValue = newValue;
                this.callSubscribers(newValue, this.oldValue, 16 /* updateTargetInstance */);
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        subscribe(subscriber) {
            if (!this.observing) {
                this.convertProperty();
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
        convertProperty() {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('CustomSetterObserver', 'convertProperty', slice$a.call(arguments));
            }
            this.observing = true;
            this.currentValue = this.obj[this.propertyKey];
            const set = (newValue) => { this.setValue(newValue); };
            Reflect.defineProperty(this.obj, this.propertyKey, { set });
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    exports.CustomSetterObserver = __decorate([
        subscriberCollection()
    ], exports.CustomSetterObserver);
    // Used when there is no setter, and the getter is dependent on other properties of the object;
    // Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
    /** @internal */
    exports.GetterObserver = class GetterObserver {
        constructor(flags, overrides, obj, propertyKey, descriptor, observerLocator, lifecycle) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.isCollecting = false;
            this.currentValue = this.oldValue = undefined;
            this.propertyDeps = [];
            this.collectionDeps = [];
            this.overrides = overrides;
            this.subscriberCount = 0;
            this.descriptor = descriptor;
            this.proxy = new Proxy(obj, createGetterTraps(flags, observerLocator, this));
            const get = () => this.getValue();
            Reflect.defineProperty(obj, propertyKey, { get });
        }
        addPropertyDep(subscribable) {
            if (this.propertyDeps.indexOf(subscribable) === -1) {
                this.propertyDeps.push(subscribable);
            }
        }
        addCollectionDep(subscribable) {
            if (this.collectionDeps.indexOf(subscribable) === -1) {
                this.collectionDeps.push(subscribable);
            }
        }
        getValue() {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('GetterObserver', 'getValue', slice$a.call(arguments));
            }
            if (this.subscriberCount === 0 || this.isCollecting) {
                // tslint:disable-next-line: no-non-null-assertion // Non-null is implied because descriptors without getters won't end up here
                this.currentValue = Reflect.apply(this.descriptor.get, this.proxy, kernel.PLATFORM.emptyArray);
            }
            else {
                // tslint:disable-next-line: no-non-null-assertion // Non-null is implied because descriptors without getters won't end up here
                this.currentValue = Reflect.apply(this.descriptor.get, this.obj, kernel.PLATFORM.emptyArray);
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return this.currentValue;
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
            if (++this.subscriberCount === 1) {
                this.getValueAndCollectDependencies(true);
            }
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (--this.subscriberCount === 0) {
                this.unsubscribeAllDependencies();
            }
        }
        handleChange() {
            const oldValue = this.currentValue;
            const newValue = this.getValueAndCollectDependencies(false);
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, 16 /* updateTargetInstance */);
            }
        }
        handleCollectionChange() {
            const oldValue = this.currentValue;
            const newValue = this.getValueAndCollectDependencies(false);
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, 16 /* updateTargetInstance */);
            }
        }
        getValueAndCollectDependencies(requireCollect) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('GetterObserver', 'getValueAndCollectDependencies', slice$a.call(arguments));
            }
            const dynamicDependencies = !this.overrides.static || requireCollect;
            if (dynamicDependencies) {
                this.unsubscribeAllDependencies();
                this.isCollecting = true;
            }
            this.currentValue = this.getValue();
            if (dynamicDependencies) {
                this.propertyDeps.forEach(x => { x.subscribe(this); });
                this.collectionDeps.forEach(x => { x.subscribeToCollection(this); });
                this.isCollecting = false;
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
            return this.currentValue;
        }
        doNotCollect(key) {
            return !this.isCollecting || key === '$observers';
        }
        unsubscribeAllDependencies() {
            this.propertyDeps.forEach(x => { x.unsubscribe(this); });
            this.propertyDeps.length = 0;
            this.collectionDeps.forEach(x => { x.unsubscribeFromCollection(this); });
            this.collectionDeps.length = 0;
        }
    };
    exports.GetterObserver = __decorate([
        subscriberCollection()
    ], exports.GetterObserver);
    const toStringTag$1 = Object.prototype.toString;
    function createGetterTraps(flags, observerLocator, observer) {
        if (kernel.Tracer.enabled) {
            kernel.Tracer.enter('computed', 'createGetterTraps', slice$a.call(arguments));
        }
        const traps = {
            get: function (target, key, receiver) {
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.enter('computed', 'get', slice$a.call(arguments));
                }
                if (observer.doNotCollect(key)) {
                    if (kernel.Tracer.enabled) {
                        kernel.Tracer.leave();
                    }
                    return Reflect.get(target, key, receiver);
                }
                // The length and iterator properties need to be invoked on the original object (for Map and Set
                // at least) or they will throw.
                switch (toStringTag$1.call(target)) {
                    case '[object Array]':
                        observer.addCollectionDep(observerLocator.getArrayObserver(flags, target));
                        if (key === 'length') {
                            if (kernel.Tracer.enabled) {
                                kernel.Tracer.leave();
                            }
                            return Reflect.get(target, key, target);
                        }
                    case '[object Map]':
                        observer.addCollectionDep(observerLocator.getMapObserver(flags, target));
                        if (key === 'size') {
                            if (kernel.Tracer.enabled) {
                                kernel.Tracer.leave();
                            }
                            return Reflect.get(target, key, target);
                        }
                    case '[object Set]':
                        observer.addCollectionDep(observerLocator.getSetObserver(flags, target));
                        if (key === 'size') {
                            if (kernel.Tracer.enabled) {
                                kernel.Tracer.leave();
                            }
                            return Reflect.get(target, key, target);
                        }
                    default:
                        observer.addPropertyDep(observerLocator.getObserver(flags, target, key));
                }
                if (kernel.Tracer.enabled) {
                    kernel.Tracer.leave();
                }
                return proxyOrValue(flags, target, key, observerLocator, observer);
            }
        };
        if (kernel.Tracer.enabled) {
            kernel.Tracer.leave();
        }
        return traps;
    }
    function proxyOrValue(flags, target, key, observerLocator, observer) {
        const value = Reflect.get(target, key, target);
        if (typeof value === 'function') {
            // tslint:disable-next-line: ban-types // We need Function's bind() method here
            return target[key].bind(target);
        }
        if (typeof value !== 'object' || value === null) {
            return value;
        }
        return new Proxy(value, createGetterTraps(flags, observerLocator, observer));
    }

    const IDirtyChecker = kernel.DI.createInterface('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));
    const DirtyCheckSettings = {
        /**
         * Default: `6`
         *
         * Adjust the global dirty check frequency.
         * Measures in "frames per check", such that (given an FPS of 60):
         * - A value of 1 will result in 60 dirty checks per second
         * - A value of 6 will result in 10 dirty checks per second
         */
        framesPerCheck: 6,
        /**
         * Default: `false`
         *
         * Disable dirty-checking entirely. Properties that cannot be observed without dirty checking
         * or an adapter, will simply not be observed.
         */
        disabled: false,
        /**
         * Default: `true`
         *
         * Log a warning message to the console if a property is being dirty-checked.
         */
        warn: true,
        /**
         * Default: `false`
         *
         * Throw an error if a property is being dirty-checked.
         */
        throw: false,
        /**
         * Resets all dirty checking settings to the framework's defaults.
         */
        resetToDefault() {
            this.framesPerCheck = 6;
            this.disabled = false;
            this.warn = true;
            this.throw = false;
        }
    };
    /** @internal */
    class DirtyChecker {
        constructor(lifecycle) {
            this.elapsedFrames = 0;
            this.tracked = [];
            this.lifecycle = lifecycle;
        }
        createProperty(obj, propertyName) {
            if (DirtyCheckSettings.throw) {
                throw kernel.Reporter.error(800, propertyName); // TODO: create/organize error code
            }
            if (DirtyCheckSettings.warn) {
                kernel.Reporter.write(801, propertyName);
            }
            return new exports.DirtyCheckProperty(this, obj, propertyName);
        }
        addProperty(property) {
            this.tracked.push(property);
            if (this.tracked.length === 1) {
                this.lifecycle.enqueueRAF(this.check, this, 4096 /* low */);
            }
        }
        removeProperty(property) {
            this.tracked.splice(this.tracked.indexOf(property), 1);
            if (this.tracked.length === 0) {
                this.lifecycle.dequeueRAF(this.check, this);
            }
        }
        check(delta) {
            if (DirtyCheckSettings.disabled) {
                return;
            }
            if (++this.elapsedFrames < DirtyCheckSettings.framesPerCheck) {
                return;
            }
            this.elapsedFrames = 0;
            const tracked = this.tracked;
            const len = tracked.length;
            let current;
            let i = 0;
            for (; i < len; ++i) {
                current = tracked[i];
                if (current.isDirty()) {
                    current.flush(256 /* fromTick */);
                }
            }
        }
    }
    DirtyChecker.inject = [ILifecycle];
    const slice$b = Array.prototype.slice;
    exports.DirtyCheckProperty = class DirtyCheckProperty {
        constructor(dirtyChecker, obj, propertyKey) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('DirtyCheckProperty', 'constructor', slice$b.call(arguments));
            }
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.dirtyChecker = dirtyChecker;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        isDirty() {
            return this.oldValue !== this.obj[this.propertyKey];
        }
        flush(flags) {
            const oldValue = this.oldValue;
            const newValue = this.obj[this.propertyKey];
            this.callSubscribers(newValue, oldValue, flags | 16 /* updateTargetInstance */);
            this.oldValue = newValue;
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.obj[this.propertyKey];
                this.dirtyChecker.addProperty(this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.dirtyChecker.removeProperty(this);
            }
        }
    };
    exports.DirtyCheckProperty = __decorate([
        subscriberCollection()
    ], exports.DirtyCheckProperty);

    const slice$c = Array.prototype.slice;
    const noop = kernel.PLATFORM.noop;
    // note: string.length is the only property of any primitive that is not a function,
    // so we can hardwire it to that and simply return undefined for anything else
    // note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
    class PrimitiveObserver {
        constructor(obj, propertyKey) {
            this.doNotCache = true;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('PrimitiveObserver', 'constructor', slice$c.call(arguments));
            }
            // we don't need to store propertyName because only 'length' can return a useful value
            if (propertyKey === 'length') {
                // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
                this.obj = obj;
                this.getValue = this.getStringLength;
            }
            else {
                this.getValue = this.returnUndefined;
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        getStringLength() {
            return this.obj.length;
        }
        returnUndefined() {
            return undefined;
        }
    }
    PrimitiveObserver.prototype.setValue = noop;
    PrimitiveObserver.prototype.subscribe = noop;
    PrimitiveObserver.prototype.unsubscribe = noop;
    PrimitiveObserver.prototype.dispose = noop;

    const slice$d = Array.prototype.slice;
    class PropertyAccessor {
        constructor(obj, propertyKey) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('PropertyAccessor', 'constructor', slice$d.call(arguments));
            }
            this.obj = obj;
            this.propertyKey = propertyKey;
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(value) {
            this.obj[this.propertyKey] = value;
        }
    }

    const toStringTag$2 = Object.prototype.toString;
    const IObserverLocator = kernel.DI.createInterface('IObserverLocator').noDefault();
    const ITargetObserverLocator = kernel.DI.createInterface('ITargetObserverLocator').noDefault();
    const ITargetAccessorLocator = kernel.DI.createInterface('ITargetAccessorLocator').noDefault();
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
    class ObserverLocator {
        constructor(lifecycle, dirtyChecker, targetObserverLocator, targetAccessorLocator) {
            this.adapters = [];
            this.dirtyChecker = dirtyChecker;
            this.lifecycle = lifecycle;
            this.targetObserverLocator = targetObserverLocator;
            this.targetAccessorLocator = targetAccessorLocator;
        }
        static register(container) {
            return kernel.Registration.singleton(IObserverLocator, this).register(container);
        }
        getObserver(flags, obj, propertyName) {
            if (flags & 2 /* proxyStrategy */ && typeof obj === 'object') {
                return exports.ProxyObserver.getOrCreate(obj, propertyName); // TODO: fix typings (and ensure proper contracts ofc)
            }
            if (isBindingContext(obj)) {
                return obj.getObservers(flags).getOrCreate(this.lifecycle, flags, obj, propertyName);
            }
            let observersLookup = obj.$observers;
            let observer;
            if (observersLookup && propertyName in observersLookup) {
                return observersLookup[propertyName];
            }
            observer = this.createPropertyObserver(flags, obj, propertyName);
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
                return this.targetAccessorLocator.getAccessor(flags, this.lifecycle, obj, propertyName);
            }
            if (flags & 2 /* proxyStrategy */) {
                return exports.ProxyObserver.getOrCreate(obj, propertyName);
            }
            return new PropertyAccessor(obj, propertyName);
        }
        getArrayObserver(flags, observedArray) {
            return getArrayObserver(flags, this.lifecycle, observedArray);
        }
        getMapObserver(flags, observedMap) {
            return getMapObserver(flags, this.lifecycle, observedMap);
        }
        getSetObserver(flags, observedSet) {
            return getSetObserver(flags, this.lifecycle, observedSet);
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
                kernel.Reporter.write(0, obj);
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
                return new PrimitiveObserver(obj, propertyName);
            }
            let isNode = false;
            if (this.targetObserverLocator.handles(flags, obj)) {
                const observer = this.targetObserverLocator.getObserver(flags, this.lifecycle, this, obj, propertyName);
                if (observer != null) {
                    return observer;
                }
                isNode = true;
            }
            const tag = toStringTag$2.call(obj);
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
                return createComputedObserver(flags, this, this.dirtyChecker, this.lifecycle, obj, propertyName, descriptor);
            }
            return new exports.SetterObserver(this.lifecycle, flags, obj, propertyName);
        }
    }
    ObserverLocator.inject = [ILifecycle, IDirtyChecker, ITargetObserverLocator, ITargetAccessorLocator];
    function getCollectionObserver(flags, lifecycle, collection) {
        // If the collection is wrapped by a proxy then `$observer` will return the proxy observer instead of the collection observer, which is not what we want
        // when we ask for getCollectionObserver
        const rawCollection = collection instanceof Object ? exports.ProxyObserver.getRawIfProxy(collection) : collection;
        switch (toStringTag$2.call(collection)) {
            case '[object Array]':
                return getArrayObserver(flags, lifecycle, rawCollection);
            case '[object Map]':
                return getMapObserver(flags, lifecycle, rawCollection);
            case '[object Set]':
                return getSetObserver(flags, lifecycle, rawCollection);
        }
        return void 0;
    }
    function isBindingContext(obj) {
        return obj.$synthetic === true;
    }

    var SelfObserver_1;
    exports.SelfObserver = SelfObserver_1 = class SelfObserver {
        constructor(lifecycle, flags, obj, propertyName, cbName) {
            this.lifecycle = lifecycle;
            let isProxy = false;
            if (exports.ProxyObserver.isProxy(obj)) {
                isProxy = true;
                obj.$observer.subscribe(this, propertyName);
                this.obj = obj.$raw;
            }
            else {
                this.obj = obj;
            }
            this.propertyKey = propertyName;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.inBatch = false;
            this.callback = this.obj[cbName];
            if (this.callback === void 0) {
                this.observing = false;
            }
            else {
                this.observing = true;
                this.currentValue = this.obj[this.propertyKey];
                if (!isProxy) {
                    this.createGetterSetter();
                }
            }
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
        }
        handleChange(newValue, oldValue, flags) {
            this.setValue(newValue, flags);
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            if (this.observing) {
                const currentValue = this.currentValue;
                this.currentValue = newValue;
                if (this.lifecycle.batch.depth === 0) {
                    if ((flags & 4096 /* fromBind */) === 0) {
                        this.callSubscribers(newValue, currentValue, this.persistentFlags | flags);
                        if (this.callback !== void 0) {
                            this.callback.call(this.obj, newValue, currentValue, this.persistentFlags | flags);
                        }
                    }
                }
                else if (!this.inBatch) {
                    this.inBatch = true;
                    this.oldValue = currentValue;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                // See SetterObserver.setValue for explanation
                this.obj[this.propertyKey] = newValue;
            }
        }
        subscribe(subscriber) {
            if (this.observing === false) {
                this.observing = true;
                this.currentValue = this.obj[this.propertyKey];
                this.createGetterSetter();
            }
            this.addSubscriber(subscriber);
        }
        createGetterSetter() {
            if (!Reflect.defineProperty(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                get: () => {
                    return this.currentValue;
                },
                set: value => {
                    this.setValue(value, 0 /* none */);
                },
            })) {
                kernel.Reporter.write(1, this.propertyKey, this.obj);
            }
        }
    };
    exports.SelfObserver = SelfObserver_1 = __decorate([
        subscriberCollection()
    ], exports.SelfObserver);

    const { oneTime: oneTime$2, toView: toView$2, fromView: fromView$1, twoWay } = exports.BindingMode;
    class BindingModeBehavior {
        constructor(mode) {
            this.mode = mode;
        }
        bind(flags, scope, binding) {
            binding.originalMode = binding.mode;
            binding.mode = this.mode;
        }
        unbind(flags, scope, binding) {
            binding.mode = binding.originalMode;
            binding.originalMode = null;
        }
    }
    class OneTimeBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(oneTime$2);
        }
    }
    BindingBehaviorResource.define('oneTime', OneTimeBindingBehavior);
    class ToViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(toView$2);
        }
    }
    BindingBehaviorResource.define('toView', ToViewBindingBehavior);
    class FromViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(fromView$1);
        }
    }
    BindingBehaviorResource.define('fromView', FromViewBindingBehavior);
    class TwoWayBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(twoWay);
        }
    }
    BindingBehaviorResource.define('twoWay', TwoWayBindingBehavior);

    const unset = {};
    /** @internal */
    function debounceCallSource(newValue, oldValue, flags) {
        const state = this.debounceState;
        kernel.PLATFORM.global.clearTimeout(state.timeoutId);
        state.timeoutId = kernel.PLATFORM.global.setTimeout(() => { this.debouncedMethod(newValue, oldValue, flags); }, state.delay);
    }
    /** @internal */
    function debounceCall(newValue, oldValue, flags) {
        const state = this.debounceState;
        kernel.PLATFORM.global.clearTimeout(state.timeoutId);
        if (!(flags & state.callContextToDebounce)) {
            state.oldValue = unset;
            this.debouncedMethod(newValue, oldValue, flags);
            return;
        }
        if (state.oldValue === unset) {
            state.oldValue = oldValue;
        }
        const timeoutId = kernel.PLATFORM.global.setTimeout(() => {
            const ov = state.oldValue;
            state.oldValue = unset;
            this.debouncedMethod(newValue, ov, flags);
        }, state.delay);
        state.timeoutId = timeoutId;
    }
    const fromView$2 = exports.BindingMode.fromView;
    class DebounceBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToDebounce;
            let callContextToDebounce;
            let debouncer;
            if (binding instanceof exports.Binding) {
                methodToDebounce = 'handleChange';
                debouncer = debounceCall;
                callContextToDebounce = binding.mode & fromView$2 ? 32 /* updateSourceExpression */ : 16 /* updateTargetInstance */;
            }
            else {
                methodToDebounce = 'callSource';
                debouncer = debounceCallSource;
                callContextToDebounce = 16 /* updateTargetInstance */;
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.debouncedMethod = binding[methodToDebounce];
            binding.debouncedMethod.originalName = methodToDebounce;
            // replace the original method with the debouncing version.
            binding[methodToDebounce] = debouncer;
            // create the debounce state.
            binding.debounceState = {
                callContextToDebounce,
                delay,
                timeoutId: 0,
                oldValue: unset
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            const methodToRestore = binding.debouncedMethod.originalName;
            binding[methodToRestore] = binding.debouncedMethod;
            binding.debouncedMethod = null;
            kernel.PLATFORM.global.clearTimeout(binding.debounceState.timeoutId);
            binding.debounceState = null;
        }
    }
    BindingBehaviorResource.define('debounce', DebounceBindingBehavior);

    class PriorityBindingBehavior {
        static register(container) {
            container.register(kernel.Registration.singleton(`binding-behavior:priority`, this));
            container.register(kernel.Registration.singleton(this, this));
        }
        bind(binding, priority = 4096 /* low */) {
            const { targetObserver } = binding;
            if (targetObserver != void 0) {
                this[binding.id] = targetObserver.priority;
                if (typeof priority === 'number') {
                    targetObserver.priority = priority;
                }
                else {
                    switch (priority) {
                        case 'preempt':
                            targetObserver.priority = 32768 /* 'preempt' */;
                            break;
                        case 'high':
                            targetObserver.priority = 28672 /* 'high' */;
                            break;
                        case 'bind':
                            targetObserver.priority = 24576 /* 'bind' */;
                            break;
                        case 'attach':
                            targetObserver.priority = 20480 /* 'attach' */;
                            break;
                        case 'normal':
                            targetObserver.priority = 16384 /* 'normal' */;
                            break;
                        case 'propagate':
                            targetObserver.priority = 12288 /* 'propagate' */;
                            break;
                        case 'connect':
                            targetObserver.priority = 8192 /* 'connect' */;
                            break;
                        case 'low':
                            targetObserver.priority = 4096 /* 'low' */;
                    }
                }
            }
        }
        unbind(binding) {
            if (binding.targetObserver != void 0) {
                binding.targetObserver.priority = this[binding.id];
            }
        }
    }
    PriorityBindingBehavior.kind = BindingBehaviorResource;
    PriorityBindingBehavior.description = Object.freeze({
        name: 'priority',
    });

    class SignalBindingBehavior {
        constructor(signaler) {
            this.signaler = signaler;
        }
        bind(flags, scope, binding, ...args) {
            if (!binding.updateTarget) {
                throw kernel.Reporter.error(11);
            }
            if (arguments.length === 4) {
                const name = args[0];
                this.signaler.addSignalListener(name, binding);
                binding.signal = name;
            }
            else if (arguments.length > 4) {
                const names = Array.prototype.slice.call(arguments, 3);
                let i = names.length;
                while (i--) {
                    const name = names[i];
                    this.signaler.addSignalListener(name, binding);
                }
                binding.signal = names;
            }
            else {
                throw kernel.Reporter.error(12);
            }
        }
        unbind(flags, scope, binding) {
            const name = binding.signal;
            binding.signal = null;
            if (Array.isArray(name)) {
                const names = name;
                let i = names.length;
                while (i--) {
                    this.signaler.removeSignalListener(names[i], binding);
                }
            }
            else {
                this.signaler.removeSignalListener(name, binding);
            }
        }
    }
    SignalBindingBehavior.inject = [ISignaler];
    BindingBehaviorResource.define('signal', SignalBindingBehavior);

    /** @internal */
    function throttle(newValue) {
        const state = this.throttleState;
        const elapsed = +new Date() - state.last;
        if (elapsed >= state.delay) {
            kernel.PLATFORM.global.clearTimeout(state.timeoutId);
            state.timeoutId = -1;
            state.last = +new Date();
            this.throttledMethod(newValue);
            return;
        }
        state.newValue = newValue;
        if (state.timeoutId === -1) {
            const timeoutId = kernel.PLATFORM.global.setTimeout(() => {
                state.timeoutId = -1;
                state.last = +new Date();
                this.throttledMethod(state.newValue);
            }, state.delay - elapsed);
            state.timeoutId = timeoutId;
        }
    }
    class ThrottleBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToThrottle;
            if (binding instanceof exports.Binding) {
                if (binding.mode === exports.BindingMode.twoWay) {
                    methodToThrottle = 'updateSource';
                }
                else {
                    methodToThrottle = 'updateTarget';
                }
            }
            else {
                methodToThrottle = 'callSource';
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.throttledMethod = binding[methodToThrottle];
            binding.throttledMethod.originalName = methodToThrottle;
            // replace the original method with the throttling version.
            binding[methodToThrottle] = throttle;
            // create the throttle state.
            binding.throttleState = {
                delay: delay,
                last: 0,
                timeoutId: -1
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            const methodToRestore = binding.throttledMethod.originalName;
            binding[methodToRestore] = binding.throttledMethod;
            binding.throttledMethod = null;
            kernel.PLATFORM.global.clearTimeout(binding.throttleState.timeoutId);
            binding.throttleState = null;
        }
    }
    BindingBehaviorResource.define('throttle', ThrottleBindingBehavior);

    function bindable(configOrTarget, prop) {
        let config;
        const decorator = function decorate($target, $prop) {
            if (arguments.length > 1) {
                // Non invocation:
                // - @bindable
                // Invocation with or w/o opts:
                // - @bindable()
                // - @bindable({...opts})
                config.property = $prop;
            }
            Bindable.for($target.constructor).add(config);
        };
        if (arguments.length > 1) {
            // Non invocation:
            // - @bindable
            config = {};
            decorator(configOrTarget, prop);
            return;
        }
        else if (typeof configOrTarget === 'string') {
            // ClassDecorator
            // - @bindable('bar')
            // Direct call:
            // - @bindable('bar')(Foo)
            config = {};
            return decorator;
        }
        // Invocation with or w/o opts:
        // - @bindable()
        // - @bindable({...opts})
        config = (configOrTarget || {});
        return decorator;
    }
    const Bindable = {
        for(obj) {
            const builder = {
                add(nameOrConfig) {
                    let description = (void 0);
                    if (nameOrConfig instanceof Object) {
                        description = nameOrConfig;
                    }
                    else if (typeof nameOrConfig === 'string') {
                        description = {
                            property: nameOrConfig
                        };
                    }
                    const prop = description.property;
                    if (!prop) {
                        throw kernel.Reporter.error(0); // TODO: create error code (must provide a property name)
                    }
                    if (!description.attribute) {
                        description.attribute = kernel.kebabCase(prop);
                    }
                    if (!description.callback) {
                        description.callback = `${prop}Changed`;
                    }
                    if (description.mode === undefined) {
                        description.mode = exports.BindingMode.toView;
                    }
                    obj.bindables[prop] = description;
                    return this;
                },
                get() {
                    return obj.bindables;
                }
            };
            if (obj.bindables === undefined) {
                obj.bindables = {};
            }
            else if (Array.isArray(obj.bindables)) {
                const props = obj.bindables;
                obj.bindables = {};
                props.forEach(builder.add);
            }
            return builder;
        }
    };

    /** @internal */
    const customElementName = 'custom-element';
    /** @internal */
    function customElementKey(name) {
        return `${customElementName}:${name}`;
    }
    /** @internal */
    function customElementBehavior(node) {
        return node.$controller;
    }
    /** @internal */
    const customAttributeName = 'custom-attribute';
    /** @internal */
    function customAttributeKey(name) {
        return `${customAttributeName}:${name}`;
    }
    (function (TargetedInstructionType) {
        TargetedInstructionType["hydrateElement"] = "ra";
        TargetedInstructionType["hydrateAttribute"] = "rb";
        TargetedInstructionType["hydrateTemplateController"] = "rc";
        TargetedInstructionType["hydrateLetElement"] = "rd";
        TargetedInstructionType["setProperty"] = "re";
        TargetedInstructionType["interpolation"] = "rf";
        TargetedInstructionType["propertyBinding"] = "rg";
        TargetedInstructionType["callBinding"] = "rh";
        TargetedInstructionType["letBinding"] = "ri";
        TargetedInstructionType["refBinding"] = "rj";
        TargetedInstructionType["iteratorBinding"] = "rk";
    })(exports.TargetedInstructionType || (exports.TargetedInstructionType = {}));
    const ITargetedInstruction = kernel.DI.createInterface('createInterface').noDefault();
    function isTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && type.length === 2;
    }
    /** @internal */
    const buildRequired = Object.freeze({
        required: true,
        compiler: 'default'
    });
    const buildNotRequired = Object.freeze({
        required: false,
        compiler: 'default'
    });
    class HooksDefinition {
        constructor(target) {
            this.hasRender = 'render' in target;
            this.hasCreated = 'created' in target;
            this.hasBinding = 'binding' in target;
            this.hasBound = 'bound' in target;
            this.hasUnbinding = 'unbinding' in target;
            this.hasUnbound = 'unbound' in target;
            this.hasAttaching = 'attaching' in target;
            this.hasAttached = 'attached' in target;
            this.hasDetaching = 'detaching' in target;
            this.hasDetached = 'detached' in target;
            this.hasCaching = 'caching' in target;
        }
    }
    HooksDefinition.none = Object.freeze(new HooksDefinition({}));
    // Note: this is a little perf thing; having one predefined class with the properties always
    // assigned in the same order ensures the browser can keep reusing the same generated hidden
    // class
    class DefaultTemplateDefinition {
        constructor() {
            this.name = 'unnamed';
            this.template = null;
            this.cache = 0;
            this.build = buildNotRequired;
            this.bindables = kernel.PLATFORM.emptyObject;
            this.instructions = kernel.PLATFORM.emptyArray;
            this.dependencies = kernel.PLATFORM.emptyArray;
            this.surrogates = kernel.PLATFORM.emptyArray;
            this.containerless = false;
            this.shadowOptions = null;
            this.hasSlots = false;
            this.strategy = 1 /* getterSetter */;
            this.hooks = HooksDefinition.none;
        }
    }
    const templateDefinitionAssignables = [
        'name',
        'template',
        'cache',
        'build',
        'containerless',
        'shadowOptions',
        'hasSlots'
    ];
    const templateDefinitionArrays = [
        'instructions',
        'dependencies',
        'surrogates'
    ];
    // tslint:disable-next-line:parameters-max-number // TODO: Reduce complexity (currently at 64)
    function buildTemplateDefinition(ctor, nameOrDef, template, cache, build, bindables, instructions, dependencies, surrogates, containerless, shadowOptions, hasSlots, strategy) {
        const def = new DefaultTemplateDefinition();
        // all cases fall through intentionally
        const argLen = arguments.length;
        switch (argLen) {
            case 13: if (strategy != null)
                def.strategy = ensureValidStrategy(strategy);
            case 12: if (hasSlots != null)
                def.hasSlots = hasSlots;
            case 11: if (shadowOptions != null)
                def.shadowOptions = shadowOptions;
            case 10: if (containerless != null)
                def.containerless = containerless;
            case 9: if (surrogates != null)
                def.surrogates = kernel.toArray(surrogates);
            case 8: if (dependencies != null)
                def.dependencies = kernel.toArray(dependencies);
            case 7: if (instructions != null)
                def.instructions = kernel.toArray(instructions);
            case 6: if (bindables != null)
                def.bindables = { ...bindables };
            case 5: if (build != null)
                def.build = build === true ? buildRequired : build === false ? buildNotRequired : { ...build };
            case 4: if (cache != null)
                def.cache = cache;
            case 3: if (template != null)
                def.template = template;
            case 2:
                if (ctor != null) {
                    if (ctor.bindables) {
                        def.bindables = Bindable.for(ctor).get();
                    }
                    if (ctor.containerless) {
                        def.containerless = ctor.containerless;
                    }
                    if (ctor.shadowOptions) {
                        def.shadowOptions = ctor.shadowOptions;
                    }
                    if (ctor.prototype) {
                        def.hooks = new HooksDefinition(ctor.prototype);
                    }
                }
                if (typeof nameOrDef === 'string') {
                    if (nameOrDef.length > 0) {
                        def.name = nameOrDef;
                    }
                }
                else if (nameOrDef != null) {
                    def.strategy = ensureValidStrategy(nameOrDef.strategy);
                    templateDefinitionAssignables.forEach(prop => {
                        if (nameOrDef[prop]) {
                            // @ts-ignore // TODO: wait for fix for https://github.com/microsoft/TypeScript/issues/31904
                            def[prop] = nameOrDef[prop];
                        }
                    });
                    templateDefinitionArrays.forEach(prop => {
                        if (nameOrDef[prop]) {
                            // @ts-ignore // TODO: wait for fix for https://github.com/microsoft/TypeScript/issues/31904
                            def[prop] = kernel.toArray(nameOrDef[prop]);
                        }
                    });
                    if (nameOrDef['bindables']) {
                        if (def.bindables === kernel.PLATFORM.emptyObject) {
                            def.bindables = Bindable.for(nameOrDef).get();
                        }
                        else {
                            Object.assign(def.bindables, nameOrDef.bindables);
                        }
                    }
                }
        }
        // special handling for invocations that quack like a @customElement decorator
        if (argLen === 2 && ctor !== null && (typeof nameOrDef === 'string' || !('build' in nameOrDef))) {
            def.build = buildRequired;
        }
        return def;
    }

    /** @internal */
    function registerAttribute(container) {
        const description = this.description;
        const resourceKey = this.kind.keyFrom(description.name);
        const aliases = description.aliases;
        container.register(kernel.Registration.transient(resourceKey, this));
        container.register(kernel.Registration.transient(this, this));
        for (let i = 0, ii = aliases.length; i < ii; ++i) {
            const aliasKey = this.kind.keyFrom(aliases[i]);
            container.register(kernel.Registration.alias(resourceKey, aliasKey));
        }
    }
    function customAttribute(nameOrDefinition) {
        return target => CustomAttributeResource.define(nameOrDefinition, target); // TODO: fix this at some point
    }
    function templateController(nameOrDefinition) {
        return target => CustomAttributeResource.define(typeof nameOrDefinition === 'string'
            ? { isTemplateController: true, name: nameOrDefinition }
            : { isTemplateController: true, ...nameOrDefinition }, target); // TODO: fix this at some point
    }
    function dynamicOptionsDecorator(target) {
        target.hasDynamicOptions = true;
        return target;
    }
    function dynamicOptions(target) {
        return target === undefined ? dynamicOptionsDecorator : dynamicOptionsDecorator(target);
    }
    function isType$2(Type) {
        return Type.kind === this;
    }
    function define$2(nameOrDefinition, ctor) {
        const Type = ctor;
        const WritableType = Type;
        const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
        WritableType.kind = CustomAttributeResource;
        WritableType.description = description;
        Type.register = registerAttribute;
        return Type;
    }
    const CustomAttributeResource = {
        name: customAttributeName,
        keyFrom: customAttributeKey,
        isType: isType$2,
        define: define$2
    };
    /** @internal */
    function createCustomAttributeDescription(def, Type) {
        const aliases = def.aliases;
        const defaultBindingMode = def.defaultBindingMode;
        return {
            name: def.name,
            aliases: aliases == null ? kernel.PLATFORM.emptyArray : aliases,
            defaultBindingMode: defaultBindingMode == null ? exports.BindingMode.toView : defaultBindingMode,
            hasDynamicOptions: def.hasDynamicOptions === undefined ? false : def.hasDynamicOptions,
            isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
            bindables: { ...Bindable.for(Type).get(), ...Bindable.for(def).get() },
            strategy: ensureValidStrategy(def.strategy),
            hooks: new HooksDefinition(Type.prototype)
        };
    }

    const INode = kernel.DI.createInterface('INode').noDefault();
    const IRenderLocation = kernel.DI.createInterface('IRenderLocation').noDefault();
    const IDOM = kernel.DI.createInterface('IDOM').noDefault();
    const ni = function (...args) {
        throw kernel.Reporter.error(1000); // TODO: create error code (not implemented exception)
        // tslint:disable-next-line:no-any // this function doesn't need typing because it is never directly called
    };
    const niDOM = {
        addEventListener: ni,
        appendChild: ni,
        cloneNode: ni,
        convertToRenderLocation: ni,
        createDocumentFragment: ni,
        createElement: ni,
        createCustomEvent: ni,
        dispatchEvent: ni,
        createNodeObserver: ni,
        createTemplate: ni,
        createTextNode: ni,
        insertBefore: ni,
        isMarker: ni,
        isNodeInstance: ni,
        isRenderLocation: ni,
        makeTarget: ni,
        registerElementResolver: ni,
        remove: ni,
        removeEventListener: ni,
        setAttribute: ni
    };
    const DOM = {
        ...niDOM,
        get isInitialized() {
            return Reflect.get(this, '$initialized') === true;
        },
        initialize(dom) {
            if (this.isInitialized) {
                throw kernel.Reporter.error(1001); // TODO: create error code (already initialized, check isInitialized property and call destroy() if you want to assign a different dom)
            }
            const descriptors = {};
            const protos = [dom];
            let proto = Object.getPrototypeOf(dom);
            while (proto && proto !== Object.prototype) {
                protos.unshift(proto);
                proto = Object.getPrototypeOf(proto);
            }
            for (proto of protos) {
                Object.assign(descriptors, Object.getOwnPropertyDescriptors(proto));
            }
            const keys = [];
            let key;
            let descriptor;
            for (key in descriptors) {
                descriptor = descriptors[key];
                if (descriptor.configurable && descriptor.writable) {
                    Reflect.defineProperty(this, key, descriptor);
                    keys.push(key);
                }
            }
            Reflect.set(this, '$domKeys', keys);
            Reflect.set(this, '$initialized', true);
        },
        destroy() {
            if (!this.isInitialized) {
                throw kernel.Reporter.error(1002); // TODO: create error code (already destroyed)
            }
            const keys = Reflect.get(this, '$domKeys');
            keys.forEach(key => {
                Reflect.deleteProperty(this, key);
            });
            Object.assign(this, niDOM);
            Reflect.set(this, '$domKeys', kernel.PLATFORM.emptyArray);
            Reflect.set(this, '$initialized', false);
        }
    };
    // This is an implementation of INodeSequence that represents "no DOM" to render.
    // It's used in various places to avoid null and to encode
    // the explicit idea of "no view".
    const emptySequence = {
        isMounted: false,
        isLinked: false,
        next: void 0,
        childNodes: kernel.PLATFORM.emptyArray,
        firstChild: null,
        lastChild: null,
        findTargets() { return kernel.PLATFORM.emptyArray; },
        insertBefore(refNode) { },
        appendTo(parent) { },
        remove() { },
        addToLinked() { },
        unlink() { },
        link(next) { },
    };
    const NodeSequence = {
        empty: emptySequence
    };

    const LifecycleTask = {
        done: {
            done: true,
            canCancel() { return false; },
            cancel() { return; },
            wait() { return Promise.resolve(); }
        }
    };
    class PromiseTask {
        constructor(promise, next, context, ...args) {
            this.done = false;
            this.isCancelled = false;
            this.hasStarted = false;
            this.promise = promise.then(value => {
                if (this.isCancelled === true) {
                    return;
                }
                this.hasStarted = true;
                if (next !== null) {
                    // @ts-ignore
                    const nextResult = next.call(context, value, ...args);
                    if (nextResult === void 0) {
                        this.done = true;
                    }
                    else {
                        const nextPromise = nextResult.then instanceof Function
                            ? nextResult
                            : nextResult.wait();
                        return nextPromise.then(() => {
                            this.done = true;
                        });
                    }
                }
            });
        }
        canCancel() {
            return !this.hasStarted;
        }
        cancel() {
            if (this.canCancel()) {
                this.isCancelled = true;
            }
        }
        wait() {
            return this.promise;
        }
    }
    class ContinuationTask {
        constructor(antecedent, next, context, ...args) {
            this.done = false;
            this.hasStarted = false;
            this.isCancelled = false;
            const promise = antecedent.then instanceof Function
                ? antecedent
                : antecedent.wait();
            this.promise = promise.then(() => {
                if (this.isCancelled === true) {
                    return;
                }
                this.hasStarted = true;
                const nextResult = next.call(context, ...args);
                if (nextResult === void 0) {
                    this.done = true;
                }
                else {
                    const nextPromise = nextResult.then instanceof Function
                        ? nextResult
                        : nextResult.wait();
                    return nextPromise.then(() => {
                        this.done = true;
                    });
                }
            });
        }
        canCancel() {
            return !this.hasStarted;
        }
        cancel() {
            if (this.canCancel()) {
                this.isCancelled = true;
            }
        }
        wait() {
            return this.promise;
        }
    }
    class TerminalTask {
        constructor(antecedent) {
            this.done = false;
            this.promise = antecedent.then instanceof Function
                ? antecedent
                : antecedent.wait();
            this.promise.then(() => {
                this.done = true;
            }).catch(e => { throw e; });
        }
        canCancel() {
            return false;
        }
        cancel() {
            return;
        }
        wait() {
            return this.promise;
        }
    }
    class AggregateContinuationTask {
        constructor(antecedents, next, context, ...args) {
            this.done = false;
            this.hasStarted = false;
            this.isCancelled = false;
            this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
                if (this.isCancelled === true) {
                    return;
                }
                this.hasStarted = true;
                const nextResult = next.call(context, ...args);
                if (nextResult === void 0) {
                    this.done = true;
                }
                else {
                    return nextResult.wait().then(() => {
                        this.done = true;
                    });
                }
            });
        }
        canCancel() {
            return !this.hasStarted;
        }
        cancel() {
            if (this.canCancel()) {
                this.isCancelled = true;
            }
        }
        wait() {
            return this.promise;
        }
    }
    class AggregateTerminalTask {
        constructor(antecedents) {
            this.done = false;
            this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
                this.done = true;
            });
        }
        canCancel() {
            return false;
        }
        cancel() {
            return;
        }
        wait() {
            return this.promise;
        }
    }
    function hasAsyncWork(value) {
        return !(value === void 0 || value.done === true);
    }

    class If {
        constructor(ifFactory, location) {
            this.$observers = Object.freeze({
                value: this,
            });
            this.id = kernel.nextId('au$component');
            this.elseFactory = void 0;
            this.elseView = void 0;
            this.ifFactory = ifFactory;
            this.ifView = void 0;
            this.location = location;
            this.noProxy = true;
            this.task = LifecycleTask.done;
            this.view = void 0;
            this._value = false;
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            const oldValue = this._value;
            if (oldValue !== newValue) {
                this._value = newValue;
                this.valueChanged(newValue, oldValue, this.$controller.flags);
            }
        }
        static register(container) {
            container.register(kernel.Registration.transient('custom-attribute:if', this));
            container.register(kernel.Registration.transient(this, this));
        }
        getValue() {
            return this._value;
        }
        setValue(newValue, flags) {
            const oldValue = this._value;
            if (oldValue !== newValue) {
                this._value = newValue;
                this.valueChanged(newValue, oldValue, flags | this.$controller.flags);
            }
        }
        binding(flags) {
            if (this.task.done) {
                this.task = this.swap(this.value, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
            }
            return this.task;
        }
        attaching(flags) {
            if (this.task.done) {
                this.attachView(flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.attachView, this, flags);
            }
        }
        detaching(flags) {
            if (this.view !== void 0) {
                if (this.task.done) {
                    this.view.detach(flags);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.view.detach, this.view, flags);
                }
            }
            return this.task;
        }
        unbinding(flags) {
            if (this.view !== void 0) {
                if (this.task.done) {
                    this.task = this.view.unbind(flags);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.view.unbind, this.view, flags);
                }
            }
            return this.task;
        }
        caching(flags) {
            if (this.ifView !== void 0 && this.ifView.release(flags)) {
                this.ifView = void 0;
            }
            if (this.elseView !== void 0 && this.elseView.release(flags)) {
                this.elseView = void 0;
            }
            this.view = void 0;
        }
        valueChanged(newValue, oldValue, flags) {
            if ((this.$controller.state & 4 /* isBound */) === 0) {
                return;
            }
            if (this.task.done) {
                this.task = this.swap(this.value, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
            }
        }
        /** @internal */
        updateView(value, flags) {
            let view;
            if (value) {
                view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
            }
            else if (this.elseFactory != void 0) {
                view = this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
            }
            else {
                view = void 0;
            }
            return view;
        }
        /** @internal */
        ensureView(view, factory, flags) {
            if (view === void 0) {
                view = factory.create(flags);
            }
            view.hold(this.location);
            return view;
        }
        swap(value, flags) {
            let task = LifecycleTask.done;
            if ((value === true && this.elseView !== void 0)
                || (value !== true && this.ifView !== void 0)) {
                task = this.deactivate(flags);
            }
            if (task.done) {
                const view = this.updateView(value, flags);
                task = this.activate(view, flags);
            }
            else {
                task = new PromiseTask(task.wait().then(() => this.updateView(value, flags)), this.activate, this, flags);
            }
            return task;
        }
        deactivate(flags) {
            const view = this.view;
            if (view === void 0) {
                return LifecycleTask.done;
            }
            view.detach(flags); // TODO: link this up with unbind
            return view.unbind(flags);
        }
        activate(view, flags) {
            this.view = view;
            if (view === void 0) {
                return LifecycleTask.done;
            }
            let task = this.bindView(flags);
            if ((this.$controller.state & 32 /* isAttached */) === 0) {
                return task;
            }
            if (task.done) {
                this.attachView(flags);
            }
            else {
                task = new ContinuationTask(task, this.attachView, this, flags);
            }
            return task;
        }
        bindView(flags) {
            if (this.view !== void 0 && (this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                return this.view.bind(flags, this.$controller.scope);
            }
            return LifecycleTask.done;
        }
        attachView(flags) {
            if (this.view !== void 0 && (this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
                this.view.attach(flags);
            }
        }
    }
    If.inject = [IViewFactory, IRenderLocation];
    If.kind = CustomAttributeResource;
    If.description = Object.freeze({
        name: 'if',
        aliases: kernel.PLATFORM.emptyArray,
        defaultBindingMode: exports.BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new HooksDefinition(If.prototype)),
    });
    class Else {
        constructor(factory) {
            this.factory = factory;
        }
        static register(container) {
            container.register(kernel.Registration.transient('custom-attribute:else', this));
        }
        link(ifBehavior) {
            if (ifBehavior instanceof If) {
                ifBehavior.elseFactory = this.factory;
            }
            else if (ifBehavior.viewModel instanceof If) {
                ifBehavior.viewModel.elseFactory = this.factory;
            }
            else {
                throw new Error(`Unsupported IfBehavior`); // TODO: create error code
            }
        }
    }
    Else.inject = [IViewFactory];
    Else.kind = CustomAttributeResource;
    Else.description = {
        name: 'else',
        aliases: kernel.PLATFORM.emptyArray,
        defaultBindingMode: exports.BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: kernel.PLATFORM.emptyObject,
        strategy: 1 /* getterSetter */,
        hooks: HooksDefinition.none,
    };

    class Repeat {
        constructor(location, renderable, factory) {
            this.$observers = Object.freeze({
                items: this,
            });
            this.id = kernel.nextId('au$component');
            this.factory = factory;
            this.hasPendingInstanceMutation = false;
            this.location = location;
            this.observer = void 0;
            this.renderable = renderable;
            this.views = [];
            this.key = void 0;
            this.noProxy = true;
            this.task = LifecycleTask.done;
        }
        get items() {
            return this._items;
        }
        set items(newValue) {
            const oldValue = this._items;
            if (oldValue !== newValue) {
                this._items = newValue;
                this.itemsChanged(this.$controller.flags);
            }
        }
        static register(container) {
            container.register(kernel.Registration.transient('custom-attribute:repeat', this));
            container.register(kernel.Registration.transient(this, this));
        }
        binding(flags) {
            this.checkCollectionObserver(flags);
            const bindings = this.renderable.bindings;
            const { length } = bindings;
            let binding;
            for (let i = 0; i < length; ++i) {
                binding = bindings[i];
                if (binding.target === this && binding.targetProperty === 'items') {
                    this.forOf = binding.sourceExpression;
                    break;
                }
            }
            this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope, null);
            this.processViewsKeyed(void 0, flags);
            return this.task;
        }
        attaching(flags) {
            if (this.task.done) {
                this.attachViews(void 0, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.attachViews, this, void 0, flags);
            }
        }
        detaching(flags) {
            if (this.task.done) {
                this.detachViewsByRange(0, this.views.length, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.detachViewsByRange, this, 0, this.views.length, flags);
            }
        }
        unbinding(flags) {
            this.checkCollectionObserver(flags);
            if (this.task.done) {
                this.task = this.unbindAndRemoveViewsByRange(0, this.views.length, flags, false);
            }
            else {
                this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, 0, this.views.length, flags, false);
            }
            return this.task;
        }
        // called by SetterObserver
        itemsChanged(flags) {
            flags |= this.$controller.flags;
            this.checkCollectionObserver(flags);
            flags |= 16 /* updateTargetInstance */;
            this.processViewsKeyed(void 0, flags);
        }
        // called by a CollectionObserver
        handleCollectionChange(indexMap, flags) {
            flags |= this.$controller.flags;
            flags |= (960 /* fromFlush */ | 16 /* updateTargetInstance */);
            this.processViewsKeyed(indexMap, flags);
        }
        processViewsKeyed(indexMap, flags) {
            if (indexMap === void 0) {
                if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                    const oldLength = this.views.length;
                    this.detachViewsByRange(0, oldLength, flags);
                    if (this.task.done) {
                        this.task = this.unbindAndRemoveViewsByRange(0, oldLength, flags, false);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, 0, oldLength, flags, false);
                    }
                    if (this.task.done) {
                        this.task = this.createAndBindAllViews(flags);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.createAndBindAllViews, this, flags);
                    }
                }
                if ((this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
                    if (this.task.done) {
                        this.attachViewsKeyed(flags);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.attachViewsKeyed, this, flags);
                    }
                }
            }
            else {
                applyMutationsToIndices(indexMap);
                if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                    // first detach+unbind+(remove from array) the deleted view indices
                    if (indexMap.deletedItems.length > 0) {
                        indexMap.deletedItems.sort(kernel.compareNumber);
                        if (this.task.done) {
                            this.detachViewsByKey(indexMap, flags);
                        }
                        else {
                            this.task = new ContinuationTask(this.task, this.detachViewsByKey, this, indexMap, flags);
                        }
                        if (this.task.done) {
                            this.task = this.unbindAndRemoveViewsByKey(indexMap, flags);
                        }
                        else {
                            this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByKey, this, indexMap, flags);
                        }
                    }
                    // then insert new views at the "added" indices to bring the views array in aligment with indexMap size
                    if (this.task.done) {
                        this.task = this.createAndBindNewViewsByKey(indexMap, flags);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.createAndBindNewViewsByKey, this, indexMap, flags);
                    }
                }
                if ((this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
                    if (this.task.done) {
                        this.sortViewsByKey(indexMap, flags);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.sortViewsByKey, this, indexMap, flags);
                    }
                }
            }
        }
        checkCollectionObserver(flags) {
            const oldObserver = this.observer;
            if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                const newObserver = this.observer = getCollectionObserver(flags, this.$controller.lifecycle, this.items);
                if (oldObserver !== newObserver && oldObserver) {
                    oldObserver.unsubscribeFromCollection(this);
                }
                if (newObserver) {
                    newObserver.subscribeToCollection(this);
                }
            }
            else if (oldObserver) {
                oldObserver.unsubscribeFromCollection(this);
            }
        }
        detachViewsByRange(iStart, iEnd, flags) {
            const views = this.views;
            this.$controller.lifecycle.detached.begin();
            let view;
            for (let i = iStart; i < iEnd; ++i) {
                view = views[i];
                view.release(flags);
                view.detach(flags);
            }
            this.$controller.lifecycle.detached.end(flags);
        }
        unbindAndRemoveViewsByRange(iStart, iEnd, flags, adjustLength) {
            const views = this.views;
            let tasks = void 0;
            let task;
            this.$controller.lifecycle.unbound.begin();
            let view;
            for (let i = iStart; i < iEnd; ++i) {
                view = views[i];
                task = view.unbind(flags);
                if (!task.done) {
                    if (tasks === undefined) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            }
            if (adjustLength) {
                this.views.length = iStart;
            }
            if (tasks === undefined) {
                this.$controller.lifecycle.unbound.end(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.$controller.lifecycle.unbound.end, this.$controller.lifecycle.unbound, flags);
        }
        detachViewsByKey(indexMap, flags) {
            const views = this.views;
            this.$controller.lifecycle.detached.begin();
            const deleted = indexMap.deletedItems;
            const deletedLen = deleted.length;
            let view;
            for (let i = 0; i < deletedLen; ++i) {
                view = views[deleted[i]];
                view.release(flags);
                view.detach(flags);
            }
            this.$controller.lifecycle.detached.end(flags);
        }
        unbindAndRemoveViewsByKey(indexMap, flags) {
            const views = this.views;
            let tasks = void 0;
            let task;
            this.$controller.lifecycle.unbound.begin();
            const deleted = indexMap.deletedItems;
            const deletedLen = deleted.length;
            let view;
            let i = 0;
            for (; i < deletedLen; ++i) {
                view = views[deleted[i]];
                task = view.unbind(flags);
                if (!task.done) {
                    if (tasks === undefined) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            }
            i = 0;
            let j = 0;
            for (; i < deletedLen; ++i) {
                j = deleted[i] - i;
                this.views.splice(j, 1);
            }
            if (tasks === undefined) {
                this.$controller.lifecycle.unbound.end(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.$controller.lifecycle.unbound.end, this.$controller.lifecycle.unbound, flags);
        }
        createAndBindAllViews(flags) {
            let tasks = void 0;
            let task;
            let view;
            this.$controller.lifecycle.bound.begin();
            const factory = this.factory;
            const local = this.local;
            const items = this.items;
            const newLen = this.forOf.count(flags, items);
            const views = this.views = Array(newLen);
            this.forOf.iterate(flags, items, (arr, i, item) => {
                view = views[i] = factory.create(flags);
                task = view.bind(flags, this.createScope(flags, local, item, view));
                if (!task.done) {
                    if (tasks === undefined) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            });
            if (tasks === undefined) {
                this.$controller.lifecycle.bound.end(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.$controller.lifecycle.bound.end, this.$controller.lifecycle.bound, flags);
        }
        createAndBindNewViewsByKey(indexMap, flags) {
            let tasks = void 0;
            let task;
            let view;
            const factory = this.factory;
            const views = this.views;
            const local = this.local;
            const items = this.items;
            this.$controller.lifecycle.bound.begin();
            const mapLen = indexMap.length;
            for (let i = 0; i < mapLen; ++i) {
                if (indexMap[i] === -2) {
                    view = factory.create(flags);
                    // TODO: test with map/set/undefined/null, make sure we can use strong typing here as well, etc
                    task = view.bind(flags, this.createScope(flags, local, items[i], view));
                    views.splice(i, 0, view);
                    if (!task.done) {
                        if (tasks === undefined) {
                            tasks = [];
                        }
                        tasks.push(task);
                    }
                }
            }
            if (views.length !== mapLen) {
                // TODO: create error code and use reporter with more informative message
                throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
            }
            if (tasks === undefined) {
                this.$controller.lifecycle.bound.end(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.$controller.lifecycle.bound.end, this.$controller.lifecycle.bound, flags);
        }
        createScope(flags, local, item, view) {
            const controller = this.$controller;
            const parentScope = controller.scope;
            const ctx = BindingContext.create(flags, local, item);
            ctx.$view = view;
            const scope = Scope.fromParent(flags, parentScope, ctx);
            if (controller.scopeParts !== kernel.PLATFORM.emptyArray) {
                if (parentScope.partScopes !== void 0 &&
                    parentScope.partScopes !== kernel.PLATFORM.emptyObject) {
                    scope.partScopes = { ...parentScope.partScopes };
                }
                else {
                    scope.partScopes = {};
                }
                for (const partName of controller.scopeParts) {
                    scope.partScopes[partName] = scope;
                }
            }
            return scope;
        }
        attachViews(indexMap, flags) {
            let view;
            const { views, location } = this;
            this.$controller.lifecycle.attached.begin();
            if (indexMap === void 0) {
                for (let i = 0, ii = views.length; i < ii; ++i) {
                    view = views[i];
                    view.hold(location);
                    view.nodes.unlink();
                    view.attach(flags);
                }
            }
            else {
                for (let i = 0, ii = views.length; i < ii; ++i) {
                    if (indexMap[i] !== i) {
                        view = views[i];
                        view.hold(location);
                        view.nodes.unlink();
                        view.attach(flags);
                    }
                }
            }
            this.$controller.lifecycle.attached.end(flags);
        }
        attachViewsKeyed(flags) {
            let view;
            const { views, location } = this;
            this.$controller.lifecycle.attached.begin();
            for (let i = 0, ii = views.length; i < ii; ++i) {
                view = views[i];
                view.hold(location);
                view.nodes.unlink();
                view.attach(flags);
            }
            this.$controller.lifecycle.attached.end(flags);
        }
        sortViewsByKey(indexMap, flags) {
            // TODO: integrate with tasks
            const location = this.location;
            const views = this.views;
            synchronizeIndices(views, indexMap);
            // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
            // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
            const seq = longestIncreasingSubsequence(indexMap);
            const seqLen = seq.length;
            this.$controller.lifecycle.attached.begin();
            flags |= 268435456 /* reorderNodes */;
            let next;
            let j = seqLen - 1;
            let i = indexMap.length - 1;
            for (; i >= 0; --i) {
                if (indexMap[i] === -2) {
                    views[i].hold(location);
                    views[i].attach(flags);
                }
                else if (j < 0 || seqLen === 1 || i !== seq[j]) {
                    views[i].attach(flags);
                }
                else {
                    --j;
                }
                next = views[i + 1];
                if (next !== void 0) {
                    views[i].nodes.link(next.nodes);
                }
                else {
                    views[i].nodes.link(location);
                }
            }
            this.$controller.lifecycle.attached.end(flags);
        }
    }
    Repeat.inject = [IRenderLocation, IController, IViewFactory];
    Repeat.kind = CustomAttributeResource;
    Repeat.description = Object.freeze({
        name: 'repeat',
        aliases: kernel.PLATFORM.emptyArray,
        defaultBindingMode: exports.BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: Object.freeze(Bindable.for({ bindables: ['items'] }).get()),
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new HooksDefinition(Repeat.prototype)),
    });
    let prevIndices;
    let tailIndices;
    let maxLen = 0;
    // Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
    // with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
    /** @internal */
    function longestIncreasingSubsequence(indexMap) {
        const len = indexMap.length;
        if (len > maxLen) {
            maxLen = len;
            prevIndices = new Int32Array(len);
            tailIndices = new Int32Array(len);
        }
        let cursor = 0;
        let cur = 0;
        let prev = 0;
        let i = 0;
        let j = 0;
        let low = 0;
        let high = 0;
        let mid = 0;
        for (; i < len; i++) {
            cur = indexMap[i];
            if (cur !== -2) {
                j = prevIndices[cursor];
                prev = indexMap[j];
                if (prev !== -2 && prev < cur) {
                    tailIndices[i] = j;
                    prevIndices[++cursor] = i;
                    continue;
                }
                low = 0;
                high = cursor;
                while (low < high) {
                    mid = (low + high) >> 1;
                    prev = indexMap[prevIndices[mid]];
                    if (prev !== -2 && prev < cur) {
                        low = mid + 1;
                    }
                    else {
                        high = mid;
                    }
                }
                prev = indexMap[prevIndices[low]];
                if (cur < prev || prev === -2) {
                    if (low > 0) {
                        tailIndices[i] = prevIndices[low - 1];
                    }
                    prevIndices[low] = i;
                }
            }
        }
        i = ++cursor;
        const result = new Int32Array(i);
        cur = prevIndices[cursor - 1];
        while (cursor-- > 0) {
            result[cursor] = cur;
            cur = tailIndices[cur];
        }
        while (i-- > 0)
            prevIndices[i] = 0;
        return result;
    }
    /**
     * Applies offsets to the non-negative indices in the IndexMap
     * based on added and deleted items relative to those indices.
     *
     * e.g. turn `[-2, 0, 1]` into `[-2, 1, 2]`, allowing the values at the indices to be
     * used for sorting/reordering items if needed
     */
    function applyMutationsToIndices(indexMap) {
        let offset = 0;
        let j = 0;
        const len = indexMap.length;
        for (let i = 0; i < len; ++i) {
            while (indexMap.deletedItems[j] <= i - offset) {
                ++j;
                --offset;
            }
            if (indexMap[i] === -2) {
                ++offset;
            }
            else {
                indexMap[i] += offset;
            }
        }
    }
    /**
     * After `applyMutationsToIndices`, this function can be used to reorder items in a derived
     * array (e.g.  the items in the `views` in the repeater are derived from the `items` property)
     */
    function synchronizeIndices(items, indexMap) {
        const copy = items.slice();
        const len = indexMap.length;
        let to = 0;
        let from = 0;
        while (to < len) {
            from = indexMap[to];
            if (from !== -2) {
                items[to] = copy[from];
            }
            ++to;
        }
    }

    class Replaceable {
        constructor(factory, location) {
            this.id = kernel.nextId('au$component');
            this.factory = factory;
            this.view = this.factory.create();
            this.view.hold(location);
        }
        static register(container) {
            container.register(kernel.Registration.transient('custom-attribute:replaceable', this));
            container.register(kernel.Registration.transient(this, this));
        }
        binding(flags) {
            const prevName = BindingContext.partName;
            BindingContext.partName = this.factory.name;
            const task = this.view.bind(flags | 536870912 /* allowParentScopeTraversal */, this.$controller.scope);
            if (task.done) {
                BindingContext.partName = prevName;
            }
            else {
                task.wait().then(() => {
                    BindingContext.partName = prevName;
                });
            }
            return task;
        }
        attaching(flags) {
            this.view.attach(flags);
        }
        detaching(flags) {
            this.view.detach(flags);
        }
        unbinding(flags) {
            return this.view.unbind(flags);
        }
    }
    Replaceable.inject = [IViewFactory, IRenderLocation];
    Replaceable.kind = CustomAttributeResource;
    Replaceable.description = Object.freeze({
        name: 'replaceable',
        aliases: kernel.PLATFORM.emptyArray,
        defaultBindingMode: exports.BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: kernel.PLATFORM.emptyObject,
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new HooksDefinition(Replaceable.prototype)),
    });

    class With {
        constructor(factory, location) {
            this.$observers = Object.freeze({
                value: this,
            });
            this.id = kernel.nextId('au$component');
            this.factory = factory;
            this.view = this.factory.create();
            this.view.hold(location);
            this._value = void 0;
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            const oldValue = this._value;
            if (oldValue !== newValue) {
                this._value = newValue;
                this.valueChanged(newValue, oldValue, 0 /* none */);
            }
        }
        static register(container) {
            container.register(kernel.Registration.transient('custom-attribute:with', this));
            container.register(kernel.Registration.transient(this, this));
        }
        valueChanged(newValue, oldValue, flags) {
            if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                this.bindChild(4096 /* fromBind */);
            }
        }
        binding(flags) {
            this.bindChild(flags);
        }
        attaching(flags) {
            this.view.attach(flags);
        }
        detaching(flags) {
            this.view.detach(flags);
        }
        unbinding(flags) {
            this.view.unbind(flags);
        }
        bindChild(flags) {
            const scope = Scope.fromParent(flags, this.$controller.scope, this.value === void 0 ? {} : this.value);
            this.view.bind(flags, scope);
        }
    }
    With.inject = [IViewFactory, IRenderLocation];
    With.kind = CustomAttributeResource;
    With.description = Object.freeze({
        name: 'with',
        aliases: kernel.PLATFORM.emptyArray,
        defaultBindingMode: exports.BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new HooksDefinition(With.prototype)),
    });

    const IProjectorLocator = kernel.DI.createInterface('IProjectorLocator').noDefault();
    /** @internal */
    function registerElement(container) {
        const resourceKey = this.kind.keyFrom(this.description.name);
        container.register(kernel.Registration.transient(resourceKey, this));
        container.register(kernel.Registration.transient(this, this));
    }
    function customElement(nameOrDefinition) {
        return (target => CustomElementResource.define(nameOrDefinition, target));
    }
    function isType$3(Type) {
        return Type.kind === this;
    }
    function define$3(nameOrDefinition, ctor = null) {
        if (!nameOrDefinition) {
            throw kernel.Reporter.error(70);
        }
        const Type = (ctor == null ? class HTMLOnlyElement {
        } : ctor);
        const WritableType = Type;
        const description = buildTemplateDefinition(Type, nameOrDefinition);
        WritableType.kind = CustomElementResource;
        Type.description = description;
        Type.register = registerElement;
        return Type;
    }
    const CustomElementResource = {
        name: customElementName,
        keyFrom: customElementKey,
        isType: isType$3,
        behaviorFor: customElementBehavior,
        define: define$3
    };
    const defaultShadowOptions = {
        mode: 'open'
    };
    function useShadowDOM(targetOrOptions) {
        const options = typeof targetOrOptions === 'function' || !targetOrOptions
            ? defaultShadowOptions
            : targetOrOptions;
        function useShadowDOMDecorator(target) {
            target.shadowOptions = options;
            return target;
        }
        return typeof targetOrOptions === 'function' ? useShadowDOMDecorator(targetOrOptions) : useShadowDOMDecorator;
    }
    function containerlessDecorator(target) {
        target.containerless = true;
        return target;
    }
    function containerless(target) {
        return target === undefined ? containerlessDecorator : containerlessDecorator(target);
    }

    const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const ISanitizer = kernel.DI.createInterface('ISanitizer').withDefault(x => x.singleton(class {
        sanitize(input) {
            return input.replace(SCRIPT_REGEX, '');
        }
    }));
    /**
     * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
     */
    class SanitizeValueConverter {
        constructor(sanitizer) {
            this.sanitizer = sanitizer;
        }
        /**
         * Process the provided markup that flows to the view.
         * @param untrustedMarkup The untrusted markup to be sanitized.
         */
        toView(untrustedMarkup) {
            if (untrustedMarkup == null) {
                return null;
            }
            return this.sanitizer.sanitize(untrustedMarkup);
        }
    }
    SanitizeValueConverter.inject = [ISanitizer];
    ValueConverterResource.define('sanitize', SanitizeValueConverter);

    class ViewFactory {
        constructor(name, template, lifecycle) {
            this.isCaching = false;
            this.cacheSize = -1;
            this.cache = null;
            this.lifecycle = lifecycle;
            this.name = name;
            this.template = template;
            this.parts = kernel.PLATFORM.emptyObject;
        }
        setCacheSize(size, doNotOverrideIfAlreadySet) {
            if (size) {
                if (size === '*') {
                    size = ViewFactory.maxCacheSize;
                }
                else if (typeof size === 'string') {
                    size = parseInt(size, 10);
                }
                if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
                    this.cacheSize = size;
                }
            }
            if (this.cacheSize > 0) {
                this.cache = [];
            }
            else {
                this.cache = null;
            }
            this.isCaching = this.cacheSize > 0;
        }
        canReturnToCache(controller) {
            return this.cache != null && this.cache.length < this.cacheSize;
        }
        tryReturnToCache(controller) {
            if (this.canReturnToCache(controller)) {
                controller.cache(0 /* none */);
                this.cache.push(controller);
                return true;
            }
            return false;
        }
        create(flags) {
            const cache = this.cache;
            let controller;
            if (cache != null && cache.length > 0) {
                controller = cache.pop();
                controller.state = (controller.state | 128 /* isCached */) ^ 128 /* isCached */;
                return controller;
            }
            controller = Controller.forSyntheticView(this, this.lifecycle, flags);
            this.template.render(controller, null, this.parts, flags);
            if (!controller.nodes) {
                throw kernel.Reporter.error(90);
            }
            return controller;
        }
        addParts(parts) {
            if (this.parts === kernel.PLATFORM.emptyObject) {
                this.parts = { ...parts };
            }
            else {
                Object.assign(this.parts, parts);
            }
        }
    }
    ViewFactory.maxCacheSize = 0xFFFF;

    const ITemplateCompiler = kernel.DI.createInterface('ITemplateCompiler').noDefault();
    (function (ViewCompileFlags) {
        ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
        ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
        ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
    })(exports.ViewCompileFlags || (exports.ViewCompileFlags = {}));
    const ITemplateFactory = kernel.DI.createInterface('ITemplateFactory').noDefault();
    // This is the main implementation of ITemplate.
    // It is used to create instances of IController based on a compiled TemplateDefinition.
    // TemplateDefinitions are hand-coded today, but will ultimately be the output of the
    // TemplateCompiler either through a JIT or AOT process.
    // Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
    // and create instances of it on demand.
    class CompiledTemplate {
        constructor(dom, definition, factory, renderContext) {
            this.dom = dom;
            this.definition = definition;
            this.factory = factory;
            this.renderContext = renderContext;
        }
        render(viewModelOrController, host, parts, flags = 0 /* none */) {
            const controller = viewModelOrController instanceof Controller
                ? viewModelOrController
                : viewModelOrController.$controller;
            if (controller == void 0) {
                throw new Error(`Controller is missing from the view model`); // TODO: create error code
            }
            const nodes = controller.nodes = this.factory.createNodeSequence();
            controller.context = this.renderContext;
            flags |= this.definition.strategy;
            this.renderContext.render(flags, controller, nodes.findTargets(), this.definition, host, parts);
        }
    }
    // This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
    /** @internal */
    const noViewTemplate = {
        renderContext: (void 0),
        dom: (void 0),
        definition: (void 0),
        render(viewModelOrController) {
            const controller = viewModelOrController instanceof Controller ? viewModelOrController : viewModelOrController.$controller;
            controller.nodes = NodeSequence.empty;
            controller.context = void 0;
        }
    };
    const defaultCompilerName = 'default';
    const IInstructionRenderer = kernel.DI.createInterface('IInstructionRenderer').noDefault();
    const IRenderer = kernel.DI.createInterface('IRenderer').noDefault();
    const IRenderingEngine = kernel.DI.createInterface('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));
    /** @internal */
    class RenderingEngine {
        constructor(container, templateFactory, lifecycle, templateCompilers) {
            this.container = container;
            this.templateFactory = templateFactory;
            this.viewFactoryLookup = new Map();
            this.lifecycle = lifecycle;
            this.templateLookup = new Map();
            this.compilers = templateCompilers.reduce((acc, item) => {
                acc[item.name] = item;
                return acc;
            }, Object.create(null));
        }
        // @ts-ignore
        getElementTemplate(dom, definition, parentContext, componentType) {
            if (definition == void 0) {
                return void 0;
            }
            let found = this.templateLookup.get(definition);
            if (!found) {
                found = this.templateFromSource(dom, definition, parentContext, componentType);
                this.templateLookup.set(definition, found);
            }
            return found;
        }
        getViewFactory(dom, definition, parentContext) {
            if (definition == void 0) {
                throw new Error(`No definition provided`); // TODO: create error code
            }
            let factory = this.viewFactoryLookup.get(definition);
            if (!factory) {
                const validSource = buildTemplateDefinition(null, definition);
                const template = this.templateFromSource(dom, validSource, parentContext, void 0);
                factory = new ViewFactory(validSource.name, template, this.lifecycle);
                factory.setCacheSize(validSource.cache, true);
                this.viewFactoryLookup.set(definition, factory);
            }
            return factory;
        }
        templateFromSource(dom, definition, parentContext, componentType) {
            if (parentContext == void 0) {
                parentContext = this.container;
            }
            if (definition.template != void 0) {
                const renderContext = createRenderContext(dom, parentContext, definition.dependencies, componentType);
                if (definition.build.required) {
                    const compilerName = definition.build.compiler || defaultCompilerName;
                    const compiler = this.compilers[compilerName];
                    if (compiler === undefined) {
                        throw kernel.Reporter.error(20, compilerName);
                    }
                    definition = compiler.compile(dom, definition, new kernel.RuntimeCompilationResources(renderContext), exports.ViewCompileFlags.surrogate);
                }
                return this.templateFactory.create(renderContext, definition);
            }
            return noViewTemplate;
        }
    }
    RenderingEngine.inject = [kernel.IContainer, ITemplateFactory, ILifecycle, kernel.all(ITemplateCompiler)];
    function createRenderContext(dom, parent, dependencies, componentType) {
        const context = parent.createChild();
        const renderableProvider = new kernel.InstanceProvider();
        const elementProvider = new kernel.InstanceProvider();
        const instructionProvider = new kernel.InstanceProvider();
        const factoryProvider = new ViewFactoryProvider();
        const renderLocationProvider = new kernel.InstanceProvider();
        const renderer = context.get(IRenderer);
        dom.registerElementResolver(context, elementProvider);
        context.registerResolver(IViewFactory, factoryProvider);
        context.registerResolver(IController, renderableProvider);
        context.registerResolver(ITargetedInstruction, instructionProvider);
        context.registerResolver(IRenderLocation, renderLocationProvider);
        if (dependencies != void 0) {
            context.register(...dependencies);
        }
        //If the element has a view, support Recursive Components by adding self to own view template container.
        if (componentType) {
            componentType.register(context);
        }
        context.render = function (flags, renderable, targets, templateDefinition, host, parts) {
            renderer.render(flags, dom, this, renderable, targets, templateDefinition, host, parts);
        };
        // @ts-ignore
        context.beginComponentOperation = function (renderable, target, instruction, factory, parts, location) {
            renderableProvider.prepare(renderable);
            elementProvider.prepare(target);
            instructionProvider.prepare(instruction);
            if (factory) {
                factoryProvider.prepare(factory, parts);
            }
            if (location) {
                renderLocationProvider.prepare(location);
            }
            return context;
        };
        context.dispose = function () {
            factoryProvider.dispose();
            renderableProvider.dispose();
            instructionProvider.dispose();
            elementProvider.dispose();
            renderLocationProvider.dispose();
        };
        return context;
    }
    /** @internal */
    class ViewFactoryProvider {
        prepare(factory, parts) {
            this.factory = factory;
            factory.addParts(parts);
        }
        resolve(handler, requestor) {
            const factory = this.factory;
            if (factory == null) { // unmet precondition: call prepare
                throw kernel.Reporter.error(50); // TODO: organize error codes
            }
            if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
                throw kernel.Reporter.error(51); // TODO: organize error codes
            }
            const found = factory.parts[factory.name];
            if (found) {
                const renderingEngine = handler.get(IRenderingEngine);
                const dom = handler.get(IDOM);
                return renderingEngine.getViewFactory(dom, found, requestor);
            }
            return factory;
        }
        dispose() {
            this.factory = null;
        }
    }
    function hasChildrenChanged(viewModel) {
        return viewModel != void 0 && '$childrenChanged' in viewModel;
    }
    /** @internal */
    let ChildrenObserver = class ChildrenObserver {
        constructor(lifecycle, controller) {
            this.hasChanges = false;
            this.children = (void 0);
            this.controller = controller;
            this.lifecycle = lifecycle;
            this.controller = Controller.forCustomElement(controller, (void 0), (void 0));
            this.projector = this.controller.projector;
            this.observing = false;
            this.ticking = false;
        }
        getValue() {
            if (!this.observing) {
                this.observing = true;
                this.projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); });
                this.children = findElements(this.projector.children);
            }
            return this.children;
        }
        setValue(newValue) { }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.callSubscribers(this.children, undefined, flags | 16 /* updateTargetInstance */);
                this.hasChanges = false;
            }
        }
        subscribe(subscriber) {
            if (!this.ticking) {
                this.ticking = true;
                this.lifecycle.enqueueRAF(this.flushRAF, this, 24576 /* bind */);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (this.ticking && !this.hasSubscribers()) {
                this.ticking = false;
                this.lifecycle.dequeueRAF(this.flushRAF, this);
            }
        }
        onChildrenChanged() {
            this.children = findElements(this.projector.children);
            if (hasChildrenChanged(this.controller.viewModel)) {
                this.controller.viewModel.$childrenChanged();
            }
            this.hasChanges = true;
        }
    };
    ChildrenObserver = __decorate([
        subscriberCollection()
    ], ChildrenObserver);
    /** @internal */
    function findElements(nodes) {
        const components = [];
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            const current = nodes[i];
            const component = customElementBehavior(current);
            if (component != void 0) {
                components.push(component);
            }
        }
        return components;
    }

    function hasDescription(type) {
        return type.description != void 0;
    }
    class Controller {
        constructor(flags, viewCache, lifecycle, viewModel, parentContext, host, options, scopeParts) {
            this.id = kernel.nextId('au$component');
            this.nextBound = void 0;
            this.nextUnbound = void 0;
            this.prevBound = void 0;
            this.prevUnbound = void 0;
            this.nextAttached = void 0;
            this.nextDetached = void 0;
            this.prevAttached = void 0;
            this.prevDetached = void 0;
            this.nextMount = void 0;
            this.nextUnmount = void 0;
            this.prevMount = void 0;
            this.prevUnmount = void 0;
            this.flags = flags;
            this.viewCache = viewCache;
            this.bindings = void 0;
            this.controllers = void 0;
            this.state = 0 /* none */;
            this.scopeParts = scopeParts;
            if (viewModel == void 0) {
                if (viewCache == void 0) {
                    // TODO: create error code
                    throw new Error(`No IViewCache was provided when rendering a synthetic view.`);
                }
                if (lifecycle == void 0) {
                    // TODO: create error code
                    throw new Error(`No ILifecycle was provided when rendering a synthetic view.`);
                }
                this.lifecycle = lifecycle;
                this.hooks = HooksDefinition.none;
                this.viewModel = void 0;
                this.bindingContext = void 0; // stays undefined
                this.host = void 0; // stays undefined
                this.vmKind = 2 /* synthetic */;
                this.scope = void 0; // will be populated during bindSynthetic()
                this.projector = void 0; // stays undefined
                this.nodes = void 0; // will be populated during ITemplate.render() immediately after the constructor is done
                this.context = void 0; // will be populated during ITemplate.render() immediately after the constructor is done
                this.location = void 0; // should be set with `hold(location)` by the consumer
            }
            else {
                if (parentContext == void 0) {
                    // TODO: create error code
                    throw new Error(`No parentContext was provided when rendering a custom element or attribute.`);
                }
                this.lifecycle = parentContext.get(ILifecycle);
                viewModel.$controller = this;
                const Type = viewModel.constructor;
                if (!hasDescription(Type)) {
                    // TODO: create error code
                    throw new Error(`The provided viewModel does not have a (valid) description.`);
                }
                const { description } = Type;
                flags |= description.strategy;
                createObservers(this.lifecycle, description, flags, viewModel);
                this.hooks = description.hooks;
                this.viewModel = viewModel;
                this.bindingContext = getBindingContext(flags, viewModel);
                this.host = host;
                switch (Type.kind.name) {
                    case 'custom-element':
                        if (host == void 0) {
                            // TODO: create error code
                            throw new Error(`No host element was provided when rendering a custom element.`);
                        }
                        this.vmKind = 0 /* customElement */;
                        const renderingEngine = parentContext.get(IRenderingEngine);
                        let template = void 0;
                        if (this.hooks.hasRender) {
                            const result = this.bindingContext.render(flags, host, options.parts == void 0
                                ? kernel.PLATFORM.emptyObject
                                : options.parts, parentContext);
                            if (result != void 0 && 'getElementTemplate' in result) {
                                template = result.getElementTemplate(renderingEngine, Type, parentContext);
                            }
                        }
                        else {
                            const dom = parentContext.get(IDOM);
                            template = renderingEngine.getElementTemplate(dom, description, parentContext, Type);
                        }
                        if (template !== void 0) {
                            let parts;
                            if (template.definition == null ||
                                template.definition.instructions.length === 0 ||
                                template.definition.instructions[0].length === 0 ||
                                (template.definition.instructions[0][0].parts == void 0)) {
                                if (options.parts == void 0) {
                                    parts = kernel.PLATFORM.emptyObject;
                                }
                                else {
                                    parts = options.parts;
                                }
                            }
                            else {
                                const instruction = template.definition.instructions[0][0];
                                if (options.parts == void 0) {
                                    parts = instruction.parts;
                                }
                                else {
                                    parts = { ...options.parts, ...instruction.parts };
                                }
                                if (scopeParts === kernel.PLATFORM.emptyArray) {
                                    this.scopeParts = Object.keys(instruction.parts);
                                }
                            }
                            template.render(this, host, parts);
                        }
                        this.scope = Scope.create(flags, this.bindingContext, null);
                        this.projector = parentContext.get(IProjectorLocator).getElementProjector(parentContext.get(IDOM), this, host, description);
                        this.location = void 0;
                        break;
                    case 'custom-attribute':
                        this.vmKind = 1 /* customAttribute */;
                        this.scope = void 0;
                        this.projector = void 0;
                        this.nodes = void 0;
                        this.context = void 0;
                        this.location = void 0;
                        break;
                    default:
                        throw new Error(`Invalid resource kind: '${Type.kind.name}'`);
                }
                if (this.hooks.hasCreated) {
                    this.bindingContext.created(flags);
                }
            }
        }
        static forCustomElement(viewModel, parentContext, host, flags = 0 /* none */, options = kernel.PLATFORM.emptyObject) {
            let controller = Controller.lookup.get(viewModel);
            if (controller === void 0) {
                controller = new Controller(flags, void 0, void 0, viewModel, parentContext, host, options, kernel.PLATFORM.emptyArray);
                this.lookup.set(viewModel, controller);
            }
            return controller;
        }
        static forCustomAttribute(viewModel, parentContext, flags = 0 /* none */, scopeParts = kernel.PLATFORM.emptyArray) {
            let controller = Controller.lookup.get(viewModel);
            if (controller === void 0) {
                controller = new Controller(flags, void 0, void 0, viewModel, parentContext, void 0, kernel.PLATFORM.emptyObject, scopeParts);
                this.lookup.set(viewModel, controller);
            }
            return controller;
        }
        static forSyntheticView(viewCache, lifecycle, flags = 0 /* none */) {
            return new Controller(flags, viewCache, lifecycle, void 0, void 0, void 0, kernel.PLATFORM.emptyObject, kernel.PLATFORM.emptyArray);
        }
        lockScope(scope) {
            this.scope = scope;
            this.state |= 16384 /* hasLockedScope */;
        }
        hold(location) {
            this.state = (this.state | 32768 /* canBeCached */) ^ 32768 /* canBeCached */;
            this.location = location;
        }
        release(flags) {
            this.state |= 32768 /* canBeCached */;
            if ((this.state & 32 /* isAttached */) > 0) {
                // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
                return this.viewCache.canReturnToCache(this);
            }
            return this.unmountSynthetic(flags);
        }
        bind(flags, scope) {
            // TODO: benchmark which of these techniques is fastest:
            // - the current one (enum with switch)
            // - set the name of the method in the constructor, e.g. this.bindMethod = 'bindCustomElement'
            //    and then doing this[this.bindMethod](flags, scope) instead of switch (eliminates branching
            //    but computed property access might be harmful to browser optimizations)
            // - make bind() a property and set it to one of the 3 methods in the constructor,
            //    e.g. this.bind = this.bindCustomElement (eliminates branching + reduces call stack depth by 1,
            //    but might make the call site megamorphic)
            flags |= 4096 /* fromBind */;
            switch (this.vmKind) {
                case 0 /* customElement */:
                    return this.bindCustomElement(flags, scope);
                case 1 /* customAttribute */:
                    return this.bindCustomAttribute(flags, scope);
                case 2 /* synthetic */:
                    return this.bindSynthetic(flags, scope);
            }
        }
        unbind(flags) {
            flags |= 8192 /* fromUnbind */;
            switch (this.vmKind) {
                case 0 /* customElement */:
                    return this.unbindCustomElement(flags);
                case 1 /* customAttribute */:
                    return this.unbindCustomAttribute(flags);
                case 2 /* synthetic */:
                    return this.unbindSynthetic(flags);
            }
        }
        bound(flags) {
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.bindingContext.bound(flags);
        }
        unbound(flags) {
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.bindingContext.unbound(flags);
        }
        attach(flags) {
            if ((this.state & 40 /* isAttachedOrAttaching */) > 0 && (flags & 268435456 /* reorderNodes */) === 0) {
                return;
            }
            flags |= 16384 /* fromAttach */;
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.attachCustomElement(flags);
                    break;
                case 1 /* customAttribute */:
                    this.attachCustomAttribute(flags);
                    break;
                case 2 /* synthetic */:
                    this.attachSynthetic(flags);
            }
        }
        detach(flags) {
            if ((this.state & 40 /* isAttachedOrAttaching */) === 0) {
                return;
            }
            flags |= 32768 /* fromDetach */;
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.detachCustomElement(flags);
                    break;
                case 1 /* customAttribute */:
                    this.detachCustomAttribute(flags);
                    break;
                case 2 /* synthetic */:
                    this.detachSynthetic(flags);
            }
        }
        attached(flags) {
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.bindingContext.attached(flags);
        }
        detached(flags) {
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.bindingContext.detached(flags);
        }
        mount(flags) {
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.mountCustomElement(flags);
                    break;
                case 2 /* synthetic */:
                    this.mountSynthetic(flags);
            }
        }
        unmount(flags) {
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.unmountCustomElement(flags);
                    break;
                case 2 /* synthetic */:
                    this.unmountSynthetic(flags);
            }
        }
        cache(flags) {
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.cacheCustomElement(flags);
                    break;
                case 1 /* customAttribute */:
                    this.cacheCustomAttribute(flags);
                    break;
                case 2 /* synthetic */:
                    this.cacheSynthetic(flags);
            }
        }
        getTargetAccessor(propertyName) {
            const { bindings } = this;
            if (bindings !== void 0) {
                const binding = bindings.find(b => b.targetProperty === propertyName);
                if (binding !== void 0) {
                    return binding.targetObserver;
                }
            }
            return void 0;
        }
        // #region bind/unbind
        bindCustomElement(flags, scope) {
            const $scope = this.scope;
            if ($scope.partScopes == void 0) {
                if (scope != null &&
                    scope.partScopes != void 0 &&
                    scope.partScopes !== kernel.PLATFORM.emptyObject) {
                    $scope.partScopes = { ...scope.partScopes };
                }
                else if (this.scopeParts !== kernel.PLATFORM.emptyArray) {
                    $scope.partScopes = {};
                }
                if ($scope.partScopes == void 0) {
                    $scope.partScopes = kernel.PLATFORM.emptyObject;
                }
                else {
                    for (const partName of this.scopeParts) {
                        $scope.partScopes[partName] = $scope;
                    }
                }
            }
            if ((flags & 134217728 /* updateOneTimeBindings */) > 0) {
                this.bindBindings(flags, $scope);
                return LifecycleTask.done;
            }
            if ((this.state & 4 /* isBound */) > 0) {
                return LifecycleTask.done;
            }
            flags |= 4096 /* fromBind */;
            this.state |= 1 /* isBinding */;
            this.lifecycle.bound.begin();
            this.bindBindings(flags, $scope);
            if (this.hooks.hasBinding) {
                const ret = this.bindingContext.binding(flags);
                if (hasAsyncWork(ret)) {
                    return new ContinuationTask(ret, this.bindControllers, this, flags, $scope);
                }
            }
            return this.bindControllers(flags, $scope);
        }
        bindCustomAttribute(flags, scope) {
            if ((this.state & 4 /* isBound */) > 0) {
                if (this.scope === scope) {
                    return LifecycleTask.done;
                }
                flags |= 4096 /* fromBind */;
                const task = this.unbind(flags);
                if (!task.done) {
                    return new ContinuationTask(task, this.bind, this, flags, scope);
                }
            }
            else {
                flags |= 4096 /* fromBind */;
            }
            this.state |= 1 /* isBinding */;
            this.scope = scope;
            this.lifecycle.bound.begin();
            if (this.hooks.hasBinding) {
                const ret = this.bindingContext.binding(flags);
                if (hasAsyncWork(ret)) {
                    return new ContinuationTask(ret, this.endBind, this, flags);
                }
            }
            this.endBind(flags);
            return LifecycleTask.done;
        }
        bindSynthetic(flags, scope) {
            if (scope == void 0) {
                throw new Error(`Scope is null or undefined`); // TODO: create error code
            }
            if ((flags & 134217728 /* updateOneTimeBindings */) > 0) {
                this.bindBindings(flags, scope);
                return LifecycleTask.done;
            }
            if ((this.state & 4 /* isBound */) > 0) {
                if (this.scope === scope || (this.state & 16384 /* hasLockedScope */) > 0) {
                    return LifecycleTask.done;
                }
                flags |= 4096 /* fromBind */;
                const task = this.unbind(flags);
                if (!task.done) {
                    return new ContinuationTask(task, this.bind, this, flags, scope);
                }
            }
            else {
                flags |= 4096 /* fromBind */;
            }
            if ((this.state & 16384 /* hasLockedScope */) === 0) {
                this.scope = scope;
            }
            this.state |= 1 /* isBinding */;
            this.lifecycle.bound.begin();
            this.bindBindings(flags, scope);
            return this.bindControllers(flags, scope);
        }
        bindBindings(flags, scope) {
            const { bindings } = this;
            if (bindings !== void 0) {
                const { length } = bindings;
                for (let i = 0; i < length; ++i) {
                    bindings[i].$bind(flags, scope);
                }
            }
        }
        bindControllers(flags, scope) {
            let tasks = void 0;
            let task;
            const { controllers } = this;
            if (controllers !== void 0) {
                const { length } = controllers;
                for (let i = 0; i < length; ++i) {
                    task = controllers[i].bind(flags, scope);
                    if (!task.done) {
                        if (tasks === void 0) {
                            tasks = [];
                        }
                        tasks.push(task);
                    }
                }
            }
            if (tasks === void 0) {
                this.endBind(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.endBind, this, flags);
        }
        endBind(flags) {
            if (this.hooks.hasBound) {
                this.lifecycle.bound.add(this);
            }
            this.state = this.state ^ 1 /* isBinding */ | 4 /* isBound */;
            this.lifecycle.bound.end(flags);
        }
        unbindCustomElement(flags) {
            if ((this.state & 4 /* isBound */) === 0) {
                return LifecycleTask.done;
            }
            this.state |= 2 /* isUnbinding */;
            flags |= 8192 /* fromUnbind */;
            this.lifecycle.unbound.begin();
            if (this.hooks.hasUnbinding) {
                const ret = this.bindingContext.unbinding(flags);
                if (hasAsyncWork(ret)) {
                    return new ContinuationTask(ret, this.unbindControllers, this, flags);
                }
            }
            return this.unbindControllers(flags);
        }
        unbindCustomAttribute(flags) {
            if ((this.state & 4 /* isBound */) === 0) {
                return LifecycleTask.done;
            }
            this.state |= 2 /* isUnbinding */;
            flags |= 8192 /* fromUnbind */;
            this.lifecycle.unbound.begin();
            if (this.hooks.hasUnbinding) {
                const ret = this.bindingContext.unbinding(flags);
                if (hasAsyncWork(ret)) {
                    return new ContinuationTask(ret, this.endUnbind, this, flags);
                }
            }
            this.endUnbind(flags);
            return LifecycleTask.done;
        }
        unbindSynthetic(flags) {
            if ((this.state & 4 /* isBound */) === 0) {
                return LifecycleTask.done;
            }
            this.state |= 2 /* isUnbinding */;
            flags |= 8192 /* fromUnbind */;
            this.lifecycle.unbound.begin();
            return this.unbindControllers(flags);
        }
        unbindBindings(flags) {
            const { bindings } = this;
            if (bindings !== void 0) {
                for (let i = bindings.length - 1; i >= 0; --i) {
                    bindings[i].$unbind(flags);
                }
            }
            this.endUnbind(flags);
        }
        unbindControllers(flags) {
            let tasks = void 0;
            let task;
            const { controllers } = this;
            if (controllers !== void 0) {
                for (let i = controllers.length - 1; i >= 0; --i) {
                    task = controllers[i].unbind(flags);
                    if (!task.done) {
                        if (tasks === void 0) {
                            tasks = [];
                        }
                        tasks.push(task);
                    }
                }
            }
            if (tasks === void 0) {
                this.unbindBindings(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.unbindBindings, this, flags);
        }
        endUnbind(flags) {
            switch (this.vmKind) {
                case 1 /* customAttribute */:
                    this.scope = void 0;
                    break;
                case 2 /* synthetic */:
                    if ((this.state & 16384 /* hasLockedScope */) === 0) {
                        this.scope = void 0;
                    }
            }
            if (this.hooks.hasUnbound) {
                this.lifecycle.unbound.add(this);
            }
            this.state = (this.state | 6 /* isBoundOrUnbinding */) ^ 6 /* isBoundOrUnbinding */;
            this.lifecycle.unbound.end(flags);
        }
        // #endregion
        // #region attach/detach
        attachCustomElement(flags) {
            flags |= 16384 /* fromAttach */;
            this.state |= 8 /* isAttaching */;
            this.lifecycle.mount.add(this);
            this.lifecycle.attached.begin();
            if (this.hooks.hasAttaching) {
                this.bindingContext.attaching(flags);
            }
            this.attachControllers(flags);
            if (this.hooks.hasAttached) {
                this.lifecycle.attached.add(this);
            }
            this.state = this.state ^ 8 /* isAttaching */ | 32 /* isAttached */;
            this.lifecycle.attached.end(flags);
        }
        attachCustomAttribute(flags) {
            flags |= 16384 /* fromAttach */;
            this.state |= 8 /* isAttaching */;
            this.lifecycle.attached.begin();
            if (this.hooks.hasAttaching) {
                this.bindingContext.attaching(flags);
            }
            if (this.hooks.hasAttached) {
                this.lifecycle.attached.add(this);
            }
            this.state = this.state ^ 8 /* isAttaching */ | 32 /* isAttached */;
            this.lifecycle.attached.end(flags);
        }
        attachSynthetic(flags) {
            if (((this.state & 32 /* isAttached */) > 0 && flags & 268435456 /* reorderNodes */) > 0) {
                this.lifecycle.mount.add(this);
            }
            else {
                flags |= 16384 /* fromAttach */;
                this.state |= 8 /* isAttaching */;
                this.lifecycle.mount.add(this);
                this.lifecycle.attached.begin();
                this.attachControllers(flags);
                this.state = this.state ^ 8 /* isAttaching */ | 32 /* isAttached */;
                this.lifecycle.attached.end(flags);
            }
        }
        detachCustomElement(flags) {
            flags |= 32768 /* fromDetach */;
            this.state |= 16 /* isDetaching */;
            this.lifecycle.detached.begin();
            this.lifecycle.unmount.add(this);
            if (this.hooks.hasDetaching) {
                this.bindingContext.detaching(flags);
            }
            this.detachControllers(flags);
            if (this.hooks.hasDetached) {
                this.lifecycle.detached.add(this);
            }
            this.state = (this.state | 48 /* isAttachedOrDetaching */) ^ 48 /* isAttachedOrDetaching */;
            this.lifecycle.detached.end(flags);
        }
        detachCustomAttribute(flags) {
            flags |= 32768 /* fromDetach */;
            this.state |= 16 /* isDetaching */;
            this.lifecycle.detached.begin();
            if (this.hooks.hasDetaching) {
                this.bindingContext.detaching(flags);
            }
            if (this.hooks.hasDetached) {
                this.lifecycle.detached.add(this);
            }
            this.state = (this.state | 48 /* isAttachedOrDetaching */) ^ 48 /* isAttachedOrDetaching */;
            this.lifecycle.detached.end(flags);
        }
        detachSynthetic(flags) {
            flags |= 32768 /* fromDetach */;
            this.state |= 16 /* isDetaching */;
            this.lifecycle.detached.begin();
            this.lifecycle.unmount.add(this);
            this.detachControllers(flags);
            this.state = (this.state | 48 /* isAttachedOrDetaching */) ^ 48 /* isAttachedOrDetaching */;
            this.lifecycle.detached.end(flags);
        }
        attachControllers(flags) {
            const { controllers } = this;
            if (controllers !== void 0) {
                const { length } = controllers;
                for (let i = 0; i < length; ++i) {
                    controllers[i].attach(flags);
                }
            }
        }
        detachControllers(flags) {
            const { controllers } = this;
            if (controllers !== void 0) {
                for (let i = controllers.length - 1; i >= 0; --i) {
                    controllers[i].detach(flags);
                }
            }
        }
        // #endregion
        // #region mount/unmount/cache
        mountCustomElement(flags) {
            if ((this.state & 64 /* isMounted */) > 0) {
                return;
            }
            this.state |= 64 /* isMounted */;
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.projector.project(this.nodes);
        }
        mountSynthetic(flags) {
            this.state |= 64 /* isMounted */;
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.nodes.insertBefore(this.location);
        }
        unmountCustomElement(flags) {
            if ((this.state & 64 /* isMounted */) === 0) {
                return;
            }
            this.state = (this.state | 64 /* isMounted */) ^ 64 /* isMounted */;
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.projector.take(this.nodes);
        }
        unmountSynthetic(flags) {
            if ((this.state & 64 /* isMounted */) === 0) {
                return false;
            }
            this.state = (this.state | 64 /* isMounted */) ^ 64 /* isMounted */;
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.nodes.remove();
            this.nodes.unlink();
            if ((this.state & 32768 /* canBeCached */) > 0) {
                this.state = (this.state | 32768 /* canBeCached */) ^ 32768 /* canBeCached */;
                // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
                if (this.viewCache.tryReturnToCache(this)) {
                    this.state |= 128 /* isCached */;
                    return true;
                }
            }
            return false;
        }
        cacheCustomElement(flags) {
            flags |= 65536 /* fromCache */;
            if (this.hooks.hasCaching) {
                // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
                this.bindingContext.caching(flags);
            }
        }
        cacheCustomAttribute(flags) {
            flags |= 65536 /* fromCache */;
            if (this.hooks.hasCaching) {
                // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
                this.bindingContext.caching(flags);
            }
            const { controllers } = this;
            if (controllers !== void 0) {
                const { length } = controllers;
                for (let i = length - 1; i >= 0; --i) {
                    controllers[i].cache(flags);
                }
            }
        }
        cacheSynthetic(flags) {
            const { controllers } = this;
            if (controllers !== void 0) {
                const { length } = controllers;
                for (let i = length - 1; i >= 0; --i) {
                    controllers[i].cache(flags);
                }
            }
        }
    }
    Controller.lookup = new WeakMap();
    function createObservers(lifecycle, description, flags, instance) {
        const hasLookup = instance.$observers != void 0;
        const observers = hasLookup ? instance.$observers : {};
        const bindables = description.bindables;
        const observableNames = Object.getOwnPropertyNames(bindables);
        const useProxy = (flags & 2 /* proxyStrategy */) > 0;
        const { length } = observableNames;
        let name;
        for (let i = 0; i < length; ++i) {
            name = observableNames[i];
            if (observers[name] == void 0) {
                observers[name] = new exports.SelfObserver(lifecycle, flags, useProxy ? exports.ProxyObserver.getOrCreate(instance).proxy : instance, name, bindables[name].callback);
            }
        }
        if (!useProxy) {
            Reflect.defineProperty(instance, '$observers', {
                enumerable: false,
                value: observers
            });
        }
    }
    function getBindingContext(flags, instance) {
        if (instance.noProxy === true || (flags & 2 /* proxyStrategy */) === 0) {
            return instance;
        }
        return exports.ProxyObserver.getOrCreate(instance).proxy;
    }

    const IActivator = kernel.DI.createInterface('IActivator').withDefault(x => x.singleton(Activator));
    /** @internal */
    class Activator {
        static register(container) {
            return kernel.Registration.singleton(IActivator, this).register(container);
        }
        activate(host, component, locator, flags = 1024 /* fromStartTask */, parentScope) {
            flags = flags === void 0 ? 0 /* none */ : flags;
            const controller = Controller.forCustomElement(component, locator, host, flags);
            let task = controller.bind(flags | 4096 /* fromBind */, parentScope);
            if (task.done) {
                controller.attach(flags | 16384 /* fromAttach */);
            }
            else {
                task = new ContinuationTask(task, controller.attach, controller, flags | 16384 /* fromAttach */);
            }
            return task;
        }
        deactivate(component, flags = 2048 /* fromStopTask */) {
            const controller = Controller.forCustomElement(component, (void 0), (void 0));
            controller.detach(flags | 32768 /* fromDetach */);
            return controller.unbind(flags | 8192 /* fromUnbind */);
        }
    }

    const { enter: enterStart, leave: leaveStart } = kernel.Profiler.createTimer('Aurelia.start');
    const { enter: enterStop, leave: leaveStop } = kernel.Profiler.createTimer('Aurelia.stop');
    class CompositionRoot {
        constructor(config, container) {
            this.config = config;
            if (config.host != void 0) {
                if (container.has(INode, false)) {
                    this.container = container.createChild();
                }
                else {
                    this.container = container;
                }
                kernel.Registration.instance(INode, config.host).register(this.container);
                this.host = config.host;
            }
            else if (container.has(INode, true)) {
                this.container = container;
                this.host = container.get(INode);
            }
            else {
                throw new Error(`No host element found.`);
            }
            this.strategy = config.strategy != void 0 ? config.strategy : 1 /* getterSetter */;
            const initializer = this.container.get(IDOMInitializer);
            this.dom = initializer.initialize(config);
            this.viewModel = CustomElementResource.isType(config.component)
                ? this.container.get(config.component)
                : config.component;
            this.controller = Controller.forCustomElement(this.viewModel, this.container, this.host, this.strategy);
            this.lifecycle = this.container.get(ILifecycle);
            this.activator = this.container.get(IActivator);
            if (config.enableTimeSlicing === true) {
                this.lifecycle.enableTimeslicing(config.adaptiveTimeSlicing);
            }
            else {
                this.lifecycle.disableTimeslicing();
            }
            this.task = LifecycleTask.done;
            this.hasPendingStartFrame = true;
            this.hasPendingStopFrame = true;
        }
        activate(antecedent) {
            const { task, host, viewModel, container, activator, strategy } = this;
            const flags = strategy | 1024 /* fromStartTask */;
            if (task.done) {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = activator.activate(host, viewModel, container, flags, void 0);
                }
                else {
                    this.task = new ContinuationTask(antecedent, activator.activate, activator, host, viewModel, container, flags, void 0);
                }
            }
            else {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = new ContinuationTask(task, activator.activate, activator, host, viewModel, container, flags, void 0);
                }
                else {
                    const combinedAntecedent = new ContinuationTask(task, antecedent.wait, antecedent);
                    this.task = new ContinuationTask(combinedAntecedent, activator.activate, activator, host, viewModel, container, flags, void 0);
                }
            }
            return this.task;
        }
        deactivate(antecedent) {
            const { task, viewModel, activator, strategy } = this;
            const flags = strategy | 2048 /* fromStopTask */;
            if (task.done) {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = activator.deactivate(viewModel, flags);
                }
                else {
                    this.task = new ContinuationTask(antecedent, activator.deactivate, activator, viewModel, flags);
                }
            }
            else {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = new ContinuationTask(task, activator.deactivate, activator, viewModel, flags);
                }
                else {
                    const combinedAntecedent = new ContinuationTask(task, antecedent.wait, antecedent);
                    this.task = new ContinuationTask(combinedAntecedent, activator.deactivate, activator, viewModel, flags);
                }
            }
            return this.task;
        }
    }
    class Aurelia {
        constructor(container = kernel.DI.createContainer()) {
            this.container = container;
            this.task = LifecycleTask.done;
            this._isRunning = false;
            this._isStarting = false;
            this._isStopping = false;
            this._root = void 0;
            this.next = (void 0);
            kernel.Registration.instance(Aurelia, this).register(container);
        }
        get isRunning() {
            return this._isRunning;
        }
        get isStarting() {
            return this._isStarting;
        }
        get isStopping() {
            return this._isStopping;
        }
        get root() {
            if (this._root == void 0) {
                if (this.next == void 0) {
                    throw new Error(`root is not defined`); // TODO: create error code
                }
                return this.next;
            }
            return this._root;
        }
        register(...params) {
            this.container.register(...params);
            return this;
        }
        app(config) {
            this.next = new CompositionRoot(config, this.container);
            if (this.isRunning) {
                this.start();
            }
            return this;
        }
        start(root = this.next) {
            if (root == void 0) {
                throw new Error(`There is no composition root`); // TODO: create error code
            }
            this.stop(root);
            if (this.task.done) {
                this.onBeforeStart(root);
            }
            else {
                this.task = new ContinuationTask(this.task, this.onBeforeStart, this, root);
            }
            this.task = this.root.activate(this.task);
            if (this.task.done) {
                this.task = this.onAfterStart(root);
            }
            else {
                this.task = new ContinuationTask(this.task, this.onAfterStart, this, root);
            }
            return this.task;
        }
        stop(root = this._root) {
            if (this._isRunning && root != void 0) {
                if (this.task.done) {
                    this.onBeforeStop(root);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.onBeforeStop, this, root);
                }
                this.task = root.deactivate(this.task);
                if (this.task.done) {
                    this.task = this.onAfterStop(root);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.onAfterStop, this, root);
                }
            }
            return this.task;
        }
        wait() {
            return this.task.wait();
        }
        onBeforeStart(root) {
            Reflect.set(root.host, '$au', this);
            this._root = root;
            this._isStarting = true;
            if (kernel.Profiler.enabled) {
                enterStart();
            }
        }
        onAfterStart(root) {
            this._isRunning = true;
            this._isStarting = false;
            this.dispatchEvent(root, 'aurelia-composed', root.dom);
            this.dispatchEvent(root, 'au-started', root.host);
            if (kernel.Profiler.enabled) {
                leaveStart();
            }
            return LifecycleTask.done;
        }
        onBeforeStop(root) {
            this._isRunning = false;
            this._isStopping = true;
            if (kernel.Profiler.enabled) {
                enterStop();
            }
        }
        onAfterStop(root) {
            Reflect.deleteProperty(root.host, '$au');
            this._root = void 0;
            this._isStopping = false;
            this.dispatchEvent(root, 'au-stopped', root.host);
            if (kernel.Profiler.enabled) {
                leaveStop();
            }
            return LifecycleTask.done;
        }
        dispatchEvent(root, name, target) {
            target = 'dispatchEvent' in target ? target : root.dom;
            target.dispatchEvent(root.dom.createCustomEvent(name, { detail: this, bubbles: true, cancelable: true }));
        }
    }
    kernel.PLATFORM.global.Aurelia = Aurelia;
    const IDOMInitializer = kernel.DI.createInterface('IDOMInitializer').noDefault();

    const slice$e = Array.prototype.slice;
    function instructionRenderer(instructionType) {
        return function decorator(target) {
            // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
            const decoratedTarget = function (...args) {
                // TODO: fix this
                // @ts-ignore
                const instance = new target(...args);
                instance.instructionType = instructionType;
                return instance;
            };
            // make sure we register the decorated constructor with DI
            decoratedTarget.register = function register(container) {
                return kernel.Registration.singleton(IInstructionRenderer, decoratedTarget).register(container, IInstructionRenderer);
            };
            // copy over any static properties such as inject (set by preceding decorators)
            // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
            // the length (number of ctor arguments) is copied for the same reason
            const ownProperties = Object.getOwnPropertyDescriptors(target);
            Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
                Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
            });
            return decoratedTarget;
        };
    }
    /* @internal */
    class Renderer {
        constructor(instructionRenderers) {
            const record = this.instructionRenderers = {};
            instructionRenderers.forEach(item => {
                record[item.instructionType] = item;
            });
        }
        static register(container) {
            return kernel.Registration.singleton(IRenderer, this).register(container);
        }
        // tslint:disable-next-line:parameters-max-number
        render(flags, dom, context, renderable, targets, definition, host, parts) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('Renderer', 'render', slice$e.call(arguments));
            }
            const targetInstructions = definition.instructions;
            const instructionRenderers = this.instructionRenderers;
            if (targets.length !== targetInstructions.length) {
                if (targets.length > targetInstructions.length) {
                    throw kernel.Reporter.error(30);
                }
                else {
                    throw kernel.Reporter.error(31);
                }
            }
            let instructions;
            let target;
            let current;
            for (let i = 0, ii = targets.length; i < ii; ++i) {
                instructions = targetInstructions[i];
                target = targets[i];
                for (let j = 0, jj = instructions.length; j < jj; ++j) {
                    current = instructions[j];
                    instructionRenderers[current.type].render(flags, dom, context, renderable, target, current, parts);
                }
            }
            if (host) {
                const surrogateInstructions = definition.surrogates;
                for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    current = surrogateInstructions[i];
                    instructionRenderers[current.type].render(flags, dom, context, renderable, host, current, parts);
                }
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    }
    // TODO: fix this
    // @ts-ignore
    Renderer.inject = [kernel.all(IInstructionRenderer)];
    function ensureExpression(parser, srcOrExpr, bindingType) {
        if (typeof srcOrExpr === 'string') {
            return parser.parse(srcOrExpr, bindingType);
        }
        return srcOrExpr;
    }
    function addBinding(renderable, binding) {
        if (kernel.Tracer.enabled) {
            kernel.Tracer.enter('Renderer', 'addBinding', slice$e.call(arguments));
        }
        if (renderable.bindings == void 0) {
            renderable.bindings = [binding];
        }
        else {
            renderable.bindings.push(binding);
        }
        if (kernel.Tracer.enabled) {
            kernel.Tracer.leave();
        }
    }
    function addComponent(renderable, component) {
        if (kernel.Tracer.enabled) {
            kernel.Tracer.enter('Renderer', 'addComponent', slice$e.call(arguments));
        }
        if (renderable.controllers == void 0) {
            renderable.controllers = [component];
        }
        else {
            renderable.controllers.push(component);
        }
        if (kernel.Tracer.enabled) {
            kernel.Tracer.leave();
        }
    }
    function getTarget(potentialTarget) {
        if (potentialTarget.bindingContext !== void 0) {
            return potentialTarget.bindingContext;
        }
        return potentialTarget;
    }
    let SetPropertyRenderer = 
    /** @internal */
    class SetPropertyRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('SetPropertyRenderer', 'render', slice$e.call(arguments));
            }
            getTarget(target)[instruction.to] = instruction.value; // Yeah, yeah..
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    SetPropertyRenderer = __decorate([
        instructionRenderer("re" /* setProperty */)
        /** @internal */
    ], SetPropertyRenderer);
    let CustomElementRenderer = 
    /** @internal */
    class CustomElementRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('CustomElementRenderer', 'render', slice$e.call(arguments));
            }
            const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
            const component = context.get(customElementKey(instruction.res));
            const instructionRenderers = context.get(IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = Controller.forCustomElement(component, context, target, flags, instruction);
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    CustomElementRenderer = __decorate([
        instructionRenderer("ra" /* hydrateElement */)
        /** @internal */
    ], CustomElementRenderer);
    let CustomAttributeRenderer = 
    /** @internal */
    class CustomAttributeRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('CustomAttributeRenderer', 'render', slice$e.call(arguments));
            }
            const operation = context.beginComponentOperation(renderable, target, instruction);
            const component = context.get(customAttributeKey(instruction.res));
            const instructionRenderers = context.get(IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = Controller.forCustomAttribute(component, context, flags);
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    CustomAttributeRenderer = __decorate([
        instructionRenderer("rb" /* hydrateAttribute */)
        /** @internal */
    ], CustomAttributeRenderer);
    let TemplateControllerRenderer = 
    /** @internal */
    class TemplateControllerRenderer {
        constructor(renderingEngine) {
            this.renderingEngine = renderingEngine;
        }
        render(flags, dom, context, renderable, target, instruction, parts) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('TemplateControllerRenderer', 'render', slice$e.call(arguments));
            }
            const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
            const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
            const component = context.get(customAttributeKey(instruction.res));
            const instructionRenderers = context.get(IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = Controller.forCustomAttribute(component, context, flags, instruction.parts == void 0
                ? kernel.PLATFORM.emptyArray
                : Object.keys(instruction.parts));
            if (instruction.link) {
                const controllers = renderable.controllers;
                component.link(controllers[controllers.length - 1]);
            }
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    TemplateControllerRenderer.inject = [IRenderingEngine];
    TemplateControllerRenderer = __decorate([
        instructionRenderer("rc" /* hydrateTemplateController */)
        /** @internal */
    ], TemplateControllerRenderer);
    let LetElementRenderer = 
    /** @internal */
    class LetElementRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('LetElementRenderer', 'render', slice$e.call(arguments));
            }
            dom.remove(target);
            const childInstructions = instruction.instructions;
            const toViewModel = instruction.toViewModel;
            let childInstruction;
            let expr;
            let binding;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                childInstruction = childInstructions[i];
                expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
                binding = new exports.LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
                addBinding(renderable, binding);
            }
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    LetElementRenderer.inject = [IExpressionParser, IObserverLocator];
    LetElementRenderer = __decorate([
        instructionRenderer("rd" /* hydrateLetElement */)
        /** @internal */
    ], LetElementRenderer);
    let CallBindingRenderer = 
    /** @internal */
    class CallBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('CallBindingRenderer', 'render', slice$e.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
            const binding = new Call(expr, getTarget(target), instruction.to, this.observerLocator, context);
            addBinding(renderable, binding);
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    CallBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    CallBindingRenderer = __decorate([
        instructionRenderer("rh" /* callBinding */)
        /** @internal */
    ], CallBindingRenderer);
    let RefBindingRenderer = 
    /** @internal */
    class RefBindingRenderer {
        constructor(parser) {
            this.parser = parser;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('RefBindingRenderer', 'render', slice$e.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 1280 /* IsRef */);
            const binding = new Ref(expr, getTarget(target), context);
            addBinding(renderable, binding);
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    RefBindingRenderer.inject = [IExpressionParser];
    RefBindingRenderer = __decorate([
        instructionRenderer("rj" /* refBinding */)
        /** @internal */
    ], RefBindingRenderer);
    let InterpolationBindingRenderer = 
    /** @internal */
    class InterpolationBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('InterpolationBindingRenderer', 'render', slice$e.call(arguments));
            }
            let binding;
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            if (expr.isMulti) {
                binding = new MultiInterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, exports.BindingMode.toView, context);
            }
            else {
                binding = new exports.InterpolationBinding(expr.firstExpression, expr, getTarget(target), instruction.to, exports.BindingMode.toView, this.observerLocator, context, true);
            }
            addBinding(renderable, binding);
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    InterpolationBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    InterpolationBindingRenderer = __decorate([
        instructionRenderer("rf" /* interpolation */)
        /** @internal */
    ], InterpolationBindingRenderer);
    let PropertyBindingRenderer = 
    /** @internal */
    class PropertyBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('PropertyBindingRenderer', 'render', slice$e.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
            const binding = new exports.Binding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context);
            addBinding(renderable, binding);
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    PropertyBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    PropertyBindingRenderer = __decorate([
        instructionRenderer("rg" /* propertyBinding */)
        /** @internal */
    ], PropertyBindingRenderer);
    let IteratorBindingRenderer = 
    /** @internal */
    class IteratorBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel.Tracer.enabled) {
                kernel.Tracer.enter('IteratorBindingRenderer', 'render', slice$e.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
            const binding = new exports.Binding(expr, getTarget(target), instruction.to, exports.BindingMode.toView, this.observerLocator, context);
            addBinding(renderable, binding);
            if (kernel.Tracer.enabled) {
                kernel.Tracer.leave();
            }
        }
    };
    IteratorBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    IteratorBindingRenderer = __decorate([
        instructionRenderer("rk" /* iteratorBinding */)
        /** @internal */
    ], IteratorBindingRenderer);

    const IObserverLocatorRegistration = ObserverLocator;
    const ILifecycleRegistration = Lifecycle;
    const IRendererRegistration = Renderer;
    /**
     * Default implementations for the following interfaces:
     * - `IObserverLocator`
     * - `ILifecycle`
     * - `IRenderer`
     */
    const DefaultComponents = [
        IObserverLocatorRegistration,
        ILifecycleRegistration,
        IRendererRegistration
    ];
    const IfRegistration = If;
    const ElseRegistration = Else;
    const RepeatRegistration = Repeat;
    const ReplaceableRegistration = Replaceable;
    const WithRegistration = With;
    const SanitizeValueConverterRegistration = SanitizeValueConverter;
    const DebounceBindingBehaviorRegistration = DebounceBindingBehavior;
    const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior;
    const ToViewBindingBehaviorRegistration = ToViewBindingBehavior;
    const FromViewBindingBehaviorRegistration = FromViewBindingBehavior;
    const SignalBindingBehaviorRegistration = SignalBindingBehavior;
    const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior;
    const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior;
    const PriorityBindingBehaviorRegistration = PriorityBindingBehavior;
    /**
     * Default resources:
     * - Template controllers (`if`/`else`, `repeat`, `replaceable`, `with`)
     * - Value Converters (`sanitize`)
     * - Binding Behaviors (`oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`)
     */
    const DefaultResources = [
        IfRegistration,
        ElseRegistration,
        RepeatRegistration,
        ReplaceableRegistration,
        WithRegistration,
        SanitizeValueConverterRegistration,
        DebounceBindingBehaviorRegistration,
        OneTimeBindingBehaviorRegistration,
        ToViewBindingBehaviorRegistration,
        FromViewBindingBehaviorRegistration,
        SignalBindingBehaviorRegistration,
        PriorityBindingBehaviorRegistration,
        ThrottleBindingBehaviorRegistration,
        TwoWayBindingBehaviorRegistration
    ];
    const CallBindingRendererRegistration = CallBindingRenderer;
    const CustomAttributeRendererRegistration = CustomAttributeRenderer;
    const CustomElementRendererRegistration = CustomElementRenderer;
    const InterpolationBindingRendererRegistration = InterpolationBindingRenderer;
    const IteratorBindingRendererRegistration = IteratorBindingRenderer;
    const LetElementRendererRegistration = LetElementRenderer;
    const PropertyBindingRendererRegistration = PropertyBindingRenderer;
    const RefBindingRendererRegistration = RefBindingRenderer;
    const SetPropertyRendererRegistration = SetPropertyRenderer;
    const TemplateControllerRendererRegistration = TemplateControllerRenderer;
    /**
     * Default renderers for:
     * - PropertyBinding: `bind`, `one-time`, `to-view`, `from-view`, `two-way`
     * - IteratorBinding: `for`
     * - CallBinding: `call`
     * - RefBinding: `ref`
     * - InterpolationBinding: `${}`
     * - SetProperty
     * - `customElement` hydration
     * - `customAttribute` hydration
     * - `templateController` hydration
     * - `let` element hydration
     */
    const DefaultRenderers = [
        PropertyBindingRendererRegistration,
        IteratorBindingRendererRegistration,
        CallBindingRendererRegistration,
        RefBindingRendererRegistration,
        InterpolationBindingRendererRegistration,
        SetPropertyRendererRegistration,
        CustomElementRendererRegistration,
        CustomAttributeRendererRegistration,
        TemplateControllerRendererRegistration,
        LetElementRendererRegistration
    ];
    /**
     * A DI configuration object containing environment/runtime-agnostic registrations:
     * - `DefaultComponents`
     * - `DefaultResources`
     * - `DefaultRenderers`
     */
    const RuntimeBasicConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return container.register(...DefaultComponents, ...DefaultResources, ...DefaultRenderers);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(kernel.DI.createContainer());
        }
    };

    class InterpolationInstruction {
        constructor(from, to) {
            this.type = "rf" /* interpolation */;
            this.from = from;
            this.to = to;
        }
    }
    class OneTimeBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = exports.BindingMode.oneTime;
            this.oneTime = true;
            this.to = to;
        }
    }
    class ToViewBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = exports.BindingMode.toView;
            this.oneTime = false;
            this.to = to;
        }
    }
    class FromViewBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = exports.BindingMode.fromView;
            this.oneTime = false;
            this.to = to;
        }
    }
    class TwoWayBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = exports.BindingMode.twoWay;
            this.oneTime = false;
            this.to = to;
        }
    }
    class IteratorBindingInstruction {
        constructor(from, to) {
            this.type = "rk" /* iteratorBinding */;
            this.from = from;
            this.to = to;
        }
    }
    class CallBindingInstruction {
        constructor(from, to) {
            this.type = "rh" /* callBinding */;
            this.from = from;
            this.to = to;
        }
    }
    class RefBindingInstruction {
        constructor(from) {
            this.type = "rj" /* refBinding */;
            this.from = from;
        }
    }
    class SetPropertyInstruction {
        constructor(value, to) {
            this.type = "re" /* setProperty */;
            this.to = to;
            this.value = value;
        }
    }
    class HydrateElementInstruction {
        constructor(res, instructions, parts) {
            this.type = "ra" /* hydrateElement */;
            this.instructions = instructions;
            this.parts = parts;
            this.res = res;
        }
    }
    class HydrateAttributeInstruction {
        constructor(res, instructions) {
            this.type = "rb" /* hydrateAttribute */;
            this.instructions = instructions;
            this.res = res;
        }
    }
    class HydrateTemplateController {
        constructor(def, res, instructions, link, parts) {
            this.type = "rc" /* hydrateTemplateController */;
            this.def = def;
            this.instructions = instructions;
            this.link = link;
            this.parts = parts;
            this.res = res;
        }
    }
    class LetElementInstruction {
        constructor(instructions, toViewModel) {
            this.type = "rd" /* hydrateLetElement */;
            this.instructions = instructions;
            this.toViewModel = toViewModel;
        }
    }
    class LetBindingInstruction {
        constructor(from, to) {
            this.type = "ri" /* letBinding */;
            this.from = from;
            this.to = to;
        }
    }

    exports.AccessKeyed = AccessKeyed;
    exports.AccessMember = AccessMember;
    exports.AccessScope = AccessScope;
    exports.AccessThis = AccessThis;
    exports.AggregateContinuationTask = AggregateContinuationTask;
    exports.AggregateTerminalTask = AggregateTerminalTask;
    exports.ArrayBindingPattern = ArrayBindingPattern;
    exports.ArrayLiteral = ArrayLiteral;
    exports.Assign = Assign;
    exports.Aurelia = Aurelia;
    exports.Binary = Binary;
    exports.Bindable = Bindable;
    exports.BindingBehavior = BindingBehavior;
    exports.BindingBehaviorResource = BindingBehaviorResource;
    exports.BindingContext = BindingContext;
    exports.BindingIdentifier = BindingIdentifier;
    exports.BindingModeBehavior = BindingModeBehavior;
    exports.Call = Call;
    exports.CallBindingInstruction = CallBindingInstruction;
    exports.CallBindingRendererRegistration = CallBindingRendererRegistration;
    exports.CallFunction = CallFunction;
    exports.CallMember = CallMember;
    exports.CallScope = CallScope;
    exports.CompiledTemplate = CompiledTemplate;
    exports.CompositionRoot = CompositionRoot;
    exports.Conditional = Conditional;
    exports.ContinuationTask = ContinuationTask;
    exports.Controller = Controller;
    exports.CustomAttributeRendererRegistration = CustomAttributeRendererRegistration;
    exports.CustomAttributeResource = CustomAttributeResource;
    exports.CustomElementRendererRegistration = CustomElementRendererRegistration;
    exports.CustomElementResource = CustomElementResource;
    exports.DOM = DOM;
    exports.DebounceBindingBehavior = DebounceBindingBehavior;
    exports.DebounceBindingBehaviorRegistration = DebounceBindingBehaviorRegistration;
    exports.DefaultResources = DefaultResources;
    exports.DirtyCheckSettings = DirtyCheckSettings;
    exports.Else = Else;
    exports.ElseRegistration = ElseRegistration;
    exports.ForOfStatement = ForOfStatement;
    exports.FromViewBindingBehavior = FromViewBindingBehavior;
    exports.FromViewBindingBehaviorRegistration = FromViewBindingBehaviorRegistration;
    exports.FromViewBindingInstruction = FromViewBindingInstruction;
    exports.HooksDefinition = HooksDefinition;
    exports.HtmlLiteral = HtmlLiteral;
    exports.HydrateAttributeInstruction = HydrateAttributeInstruction;
    exports.HydrateElementInstruction = HydrateElementInstruction;
    exports.HydrateTemplateController = HydrateTemplateController;
    exports.IController = IController;
    exports.IDOM = IDOM;
    exports.IDOMInitializer = IDOMInitializer;
    exports.IDirtyChecker = IDirtyChecker;
    exports.IExpressionParser = IExpressionParser;
    exports.IInstructionRenderer = IInstructionRenderer;
    exports.ILifecycle = ILifecycle;
    exports.ILifecycleRegistration = ILifecycleRegistration;
    exports.INode = INode;
    exports.IObserverLocator = IObserverLocator;
    exports.IObserverLocatorRegistration = IObserverLocatorRegistration;
    exports.IProjectorLocator = IProjectorLocator;
    exports.IRenderLocation = IRenderLocation;
    exports.IRenderer = IRenderer;
    exports.IRendererRegistration = IRendererRegistration;
    exports.IRenderingEngine = IRenderingEngine;
    exports.ISanitizer = ISanitizer;
    exports.ISignaler = ISignaler;
    exports.ITargetAccessorLocator = ITargetAccessorLocator;
    exports.ITargetObserverLocator = ITargetObserverLocator;
    exports.ITargetedInstruction = ITargetedInstruction;
    exports.ITemplateCompiler = ITemplateCompiler;
    exports.ITemplateFactory = ITemplateFactory;
    exports.IViewFactory = IViewFactory;
    exports.If = If;
    exports.IfRegistration = IfRegistration;
    exports.Interpolation = Interpolation;
    exports.InterpolationBindingRendererRegistration = InterpolationBindingRendererRegistration;
    exports.InterpolationInstruction = InterpolationInstruction;
    exports.IteratorBindingInstruction = IteratorBindingInstruction;
    exports.IteratorBindingRendererRegistration = IteratorBindingRendererRegistration;
    exports.LetBindingInstruction = LetBindingInstruction;
    exports.LetElementInstruction = LetElementInstruction;
    exports.LetElementRendererRegistration = LetElementRendererRegistration;
    exports.LifecycleTask = LifecycleTask;
    exports.MultiInterpolationBinding = MultiInterpolationBinding;
    exports.NodeSequence = NodeSequence;
    exports.ObjectBindingPattern = ObjectBindingPattern;
    exports.ObjectLiteral = ObjectLiteral;
    exports.ObserverLocator = ObserverLocator;
    exports.OneTimeBindingBehavior = OneTimeBindingBehavior;
    exports.OneTimeBindingBehaviorRegistration = OneTimeBindingBehaviorRegistration;
    exports.OneTimeBindingInstruction = OneTimeBindingInstruction;
    exports.OverrideContext = OverrideContext;
    exports.PrimitiveLiteral = PrimitiveLiteral;
    exports.PrimitiveObserver = PrimitiveObserver;
    exports.PriorityBindingBehavior = PriorityBindingBehavior;
    exports.PriorityBindingBehaviorRegistration = PriorityBindingBehaviorRegistration;
    exports.PromiseTask = PromiseTask;
    exports.PropertyAccessor = PropertyAccessor;
    exports.PropertyBindingRendererRegistration = PropertyBindingRendererRegistration;
    exports.Ref = Ref;
    exports.RefBindingInstruction = RefBindingInstruction;
    exports.RefBindingRendererRegistration = RefBindingRendererRegistration;
    exports.Repeat = Repeat;
    exports.RepeatRegistration = RepeatRegistration;
    exports.Replaceable = Replaceable;
    exports.ReplaceableRegistration = ReplaceableRegistration;
    exports.RuntimeBasicConfiguration = RuntimeBasicConfiguration;
    exports.SanitizeValueConverter = SanitizeValueConverter;
    exports.SanitizeValueConverterRegistration = SanitizeValueConverterRegistration;
    exports.Scope = Scope;
    exports.SetPropertyInstruction = SetPropertyInstruction;
    exports.SetPropertyRendererRegistration = SetPropertyRendererRegistration;
    exports.SignalBindingBehavior = SignalBindingBehavior;
    exports.SignalBindingBehaviorRegistration = SignalBindingBehaviorRegistration;
    exports.TaggedTemplate = TaggedTemplate;
    exports.Template = Template;
    exports.TemplateControllerRendererRegistration = TemplateControllerRendererRegistration;
    exports.TerminalTask = TerminalTask;
    exports.ThrottleBindingBehavior = ThrottleBindingBehavior;
    exports.ThrottleBindingBehaviorRegistration = ThrottleBindingBehaviorRegistration;
    exports.ToViewBindingBehavior = ToViewBindingBehavior;
    exports.ToViewBindingBehaviorRegistration = ToViewBindingBehaviorRegistration;
    exports.ToViewBindingInstruction = ToViewBindingInstruction;
    exports.TwoWayBindingBehavior = TwoWayBindingBehavior;
    exports.TwoWayBindingBehaviorRegistration = TwoWayBindingBehaviorRegistration;
    exports.TwoWayBindingInstruction = TwoWayBindingInstruction;
    exports.Unary = Unary;
    exports.ValueConverter = ValueConverter;
    exports.ValueConverterResource = ValueConverterResource;
    exports.ViewFactory = ViewFactory;
    exports.With = With;
    exports.WithRegistration = WithRegistration;
    exports.addBinding = addBinding;
    exports.addComponent = addComponent;
    exports.arePureLiterals = arePureLiterals;
    exports.bindable = bindable;
    exports.bindingBehavior = bindingBehavior;
    exports.buildTemplateDefinition = buildTemplateDefinition;
    exports.callsFunction = callsFunction;
    exports.cloneIndexMap = cloneIndexMap;
    exports.collectionSubscriberCollection = collectionSubscriberCollection;
    exports.computed = computed;
    exports.connectable = connectable;
    exports.connects = connects;
    exports.containerless = containerless;
    exports.copyIndexMap = copyIndexMap;
    exports.createComputedObserver = createComputedObserver;
    exports.createIndexMap = createIndexMap;
    exports.createRenderContext = createRenderContext;
    exports.customAttribute = customAttribute;
    exports.customElement = customElement;
    exports.disableArrayObservation = disableArrayObservation;
    exports.disableMapObservation = disableMapObservation;
    exports.disableSetObservation = disableSetObservation;
    exports.dynamicOptions = dynamicOptions;
    exports.enableArrayObservation = enableArrayObservation;
    exports.enableMapObservation = enableMapObservation;
    exports.enableSetObservation = enableSetObservation;
    exports.ensureExpression = ensureExpression;
    exports.getCollectionObserver = getCollectionObserver;
    exports.hasAncestor = hasAncestor;
    exports.hasBind = hasBind;
    exports.hasUnbind = hasUnbind;
    exports.instructionRenderer = instructionRenderer;
    exports.isAssignable = isAssignable;
    exports.isIndexMap = isIndexMap;
    exports.isLeftHandSide = isLeftHandSide;
    exports.isLiteral = isLiteral;
    exports.isPrimary = isPrimary;
    exports.isPureLiteral = isPureLiteral;
    exports.isResource = isResource;
    exports.isTargetedInstruction = isTargetedInstruction;
    exports.observes = observes;
    exports.proxySubscriberCollection = proxySubscriberCollection;
    exports.subscriberCollection = subscriberCollection;
    exports.templateController = templateController;
    exports.useShadowDOM = useShadowDOM;
    exports.valueConverter = valueConverter;

    return exports;

}({}, kernel));
//# sourceMappingURL=index.iife.js.map
