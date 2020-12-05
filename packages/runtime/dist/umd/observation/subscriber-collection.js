(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../utilities-objects.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.collectionSubscriberCollection = exports.subscriberCollection = void 0;
    const utilities_objects_js_1 = require("../utilities-objects.js");
    function subscriberCollection() {
        // eslint-disable-next-line @typescript-eslint/ban-types
        return function (target) {
            const proto = target.prototype;
            utilities_objects_js_1.ensureProto(proto, '_sFlags', 0 /* None */, true);
            utilities_objects_js_1.ensureProto(proto, 'addSubscriber', addSubscriber, true);
            utilities_objects_js_1.ensureProto(proto, 'removeSubscriber', removeSubscriber, true);
            utilities_objects_js_1.ensureProto(proto, 'hasSubscriber', hasSubscriber, true);
            utilities_objects_js_1.ensureProto(proto, 'hasSubscribers', hasSubscribers, true);
            utilities_objects_js_1.ensureProto(proto, 'callSubscribers', callSubscribers, true);
            utilities_objects_js_1.ensureProto(proto, 'subscribe', addSubscriber);
            utilities_objects_js_1.ensureProto(proto, 'unsubscribe', removeSubscriber);
        };
    }
    exports.subscriberCollection = subscriberCollection;
    function collectionSubscriberCollection() {
        // eslint-disable-next-line @typescript-eslint/ban-types
        return function (target) {
            const proto = target.prototype;
            utilities_objects_js_1.ensureProto(proto, '_csFlags', 0 /* None */, true);
            utilities_objects_js_1.ensureProto(proto, 'addCollectionSubscriber', addCollectionSubscriber, true);
            utilities_objects_js_1.ensureProto(proto, 'removeCollectionSubscriber', removeCollectionSubscriber, true);
            utilities_objects_js_1.ensureProto(proto, 'hasCollectionSubscriber', hasCollectionSubscriber, true);
            utilities_objects_js_1.ensureProto(proto, 'hasCollectionSubscribers', hasCollectionSubscribers, true);
            utilities_objects_js_1.ensureProto(proto, 'callCollectionSubscribers', callCollectionSubscribers, true);
            utilities_objects_js_1.ensureProto(proto, 'subscribeToCollection', addCollectionSubscriber);
            utilities_objects_js_1.ensureProto(proto, 'unsubscribeFromCollection', removeCollectionSubscriber);
        };
    }
    exports.collectionSubscriberCollection = collectionSubscriberCollection;
    function addSubscriber(subscriber) {
        if (this.hasSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._sFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._s0 = subscriber;
            this._sFlags |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._s1 = subscriber;
            this._sFlags |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._s2 = subscriber;
            this._sFlags |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._sRest = [subscriber];
            this._sFlags |= 8 /* SubscribersRest */;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._sRest.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
        }
        return true;
    }
    function addCollectionSubscriber(subscriber) {
        if (this.hasCollectionSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._csFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._cs0 = subscriber;
            this._csFlags |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._cs1 = subscriber;
            this._csFlags |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._cs2 = subscriber;
            this._csFlags |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._csRest = [subscriber];
            this._csFlags |= 8 /* SubscribersRest */;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._csRest.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
        }
        return true;
    }
    function removeSubscriber(subscriber) {
        const subscriberFlags = this._sFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._s0 === subscriber) {
            this._s0 = void 0;
            this._sFlags = (this._sFlags | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._s1 === subscriber) {
            this._s1 = void 0;
            this._sFlags = (this._sFlags | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._s2 === subscriber) {
            this._s2 = void 0;
            this._sFlags = (this._sFlags | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._sRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._sFlags = (this._sFlags | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function removeCollectionSubscriber(subscriber) {
        const subscriberFlags = this._csFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._cs0 === subscriber) {
            this._cs0 = void 0;
            this._csFlags = (this._csFlags | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._cs1 === subscriber) {
            this._cs1 = void 0;
            this._csFlags = (this._csFlags | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._cs2 === subscriber) {
            this._cs2 = void 0;
            this._csFlags = (this._csFlags | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._csRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._csFlags = (this._csFlags | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function hasSubscribers() {
        return this._sFlags !== 0 /* None */;
    }
    function hasCollectionSubscribers() {
        return this._csFlags !== 0 /* None */;
    }
    function hasSubscriber(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._sFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._s0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._s1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._s2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._sRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function hasCollectionSubscriber(subscriber) {
        const subscriberFlags = this._csFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._cs0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._cs1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._cs2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._csRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
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
        const subscriber0 = this._s0;
        const subscriber1 = this._s1;
        const subscriber2 = this._s2;
        let subscribers = this._sRest;
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
            const length = subscribers.length;
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
        subscriber.handleChange(newValue, previousValue, ((flags | 24 /* update */) ^ 24 /* update */) | ownFlags);
    }
    function callCollectionSubscribers(indexMap, flags) {
        const subscriber0 = this._cs0;
        const subscriber1 = this._cs1;
        const subscriber2 = this._cs2;
        let subscribers = this._csRest;
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
            const length = subscribers.length;
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