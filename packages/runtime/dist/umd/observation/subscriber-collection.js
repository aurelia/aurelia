(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // TODO: see if we can de-duplicate these 3 decorators and their functions without killing performance or readability
    function subscriberCollection() {
        // eslint-disable-next-line @typescript-eslint/ban-types
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
    exports.subscriberCollection = subscriberCollection;
    function proxySubscriberCollection() {
        // eslint-disable-next-line @typescript-eslint/ban-types
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
    exports.proxySubscriberCollection = proxySubscriberCollection;
    function collectionSubscriberCollection() {
        // eslint-disable-next-line @typescript-eslint/ban-types
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
    exports.collectionSubscriberCollection = collectionSubscriberCollection;
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._subscribersRest.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._proxySubscribersRest.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._collectionSubscribersRest.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._subscribersRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._proxySubscribersRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._collectionSubscribersRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._subscribersRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._proxySubscribersRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._collectionSubscribersRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
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
});
//# sourceMappingURL=subscriber-collection.js.map