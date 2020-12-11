import { def, defineHiddenProp, ensureProto } from '../utilities-objects.js';
export function subscriberCollection() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target) {
        const proto = target.prototype;
        ensureProto(proto, 'addSubscriber', addSubscriber, true);
        ensureProto(proto, 'removeSubscriber', removeSubscriber, true);
        ensureProto(proto, 'hasSubscriber', hasSubscriber, true);
        ensureProto(proto, 'hasSubscribers', hasSubscribers, true);
        ensureProto(proto, 'callSubscribers', callSubscribers, true);
        // not configurable, as in devtool, the getter could be invoked on the prototype,
        // and become permanently broken
        def(proto, 'subs', { get: getSubscriberRecord });
        ensureProto(proto, 'subscribe', addSubscriber);
        ensureProto(proto, 'unsubscribe', removeSubscriber);
    };
}
export function collectionSubscriberCollection() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target) {
        const proto = target.prototype;
        ensureProto(proto, 'addCollectionSubscriber', addSubscriber, true);
        ensureProto(proto, 'removeCollectionSubscriber', removeSubscriber, true);
        ensureProto(proto, 'hasCollectionSubscriber', hasSubscriber, true);
        ensureProto(proto, 'hasCollectionSubscribers', hasSubscribers, true);
        ensureProto(proto, 'callCollectionSubscribers', callCollectionSubscribers, true);
        // not configurable, as in devtool, the getter could be invoked on the prototype,
        // and become permanently broken
        def(proto, 'subs', { get: getSubscriberRecord });
        ensureProto(proto, 'subscribeToCollection', addSubscriber);
        ensureProto(proto, 'unsubscribeFromCollection', removeSubscriber);
    };
}
export class SubscriberRecord {
    constructor(owner) {
        this._sFlags = 0 /* None */;
        this.count = 0;
        this.owner = owner;
    }
    add(subscriber) {
        if (this.has(subscriber)) {
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
        ++this.count;
        return true;
    }
    has(subscriber) {
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
    any() {
        return this._sFlags !== 0 /* None */;
    }
    remove(subscriber) {
        const subscriberFlags = this._sFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._s0 === subscriber) {
            this._s0 = void 0;
            this._sFlags = (this._sFlags | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._s1 === subscriber) {
            this._s1 = void 0;
            this._sFlags = (this._sFlags | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._s2 === subscriber) {
            this._s2 = void 0;
            this._sFlags = (this._sFlags | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const subscribers = this._sRest; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            let i = 0;
            let ii = subscribers.length;
            for (; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._sFlags = (this._sFlags | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    // deepscan-disable-next-line
                    --i;
                    --ii;
                    --this.count;
                    return true;
                }
            }
        }
        return false;
    }
    notify(val, oldVal, flags) {
        /**
         * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
         * callSubscribers invocation, so we're caching them all before invoking any.
         * Subscribers added during this invocation are not invoked (and they shouldn't be).
         * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
         * however this is accounted for via $isBound and similar flags on the subscriber objects)
         */
        const owner = this.owner;
        const sub0 = this._s0;
        const sub1 = this._s1;
        const sub2 = this._s2;
        let subRest = this._sRest;
        flags = (flags | 24 /* update */) ^ 24 /* update */;
        if (subRest !== void 0) {
            subRest = subRest.slice();
        }
        if (sub0 !== void 0) {
            sub0.handleChange(val, oldVal, flags | /* sub own flags */ (sub0.id === void 0 ? 0 : owner[sub0.id]));
        }
        if (sub1 !== void 0) {
            sub1.handleChange(val, oldVal, flags | /* sub own flags */ (sub1.id === void 0 ? 0 : owner[sub1.id]));
        }
        if (sub2 !== void 0) {
            sub2.handleChange(val, oldVal, flags | /* sub own flags */ (sub2.id === void 0 ? 0 : owner[sub2.id]));
        }
        if (subRest !== void 0) {
            const length = subRest.length;
            let sub;
            let i = 0;
            for (; i < length; ++i) {
                sub = subRest[i];
                if (sub !== void 0) {
                    sub.handleChange(val, oldVal, flags | /* sub own flags */ (sub.id === void 0 ? 0 : owner[sub.id]));
                }
            }
        }
    }
    notifyCollection(indexMap, flags) {
        const subscriber0 = this._s0;
        const subscriber1 = this._s1;
        const subscriber2 = this._s2;
        let subscribers = this._sRest;
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
            let i = 0;
            for (; i < length; ++i) {
                subscriber = subscribers[i];
                if (subscriber !== void 0) {
                    subscriber.handleCollectionChange(indexMap, flags);
                }
            }
        }
    }
}
function getSubscriberRecord() {
    const record = new SubscriberRecord(this);
    defineHiddenProp(this, 'subs', record);
    return record;
}
function addSubscriber(subscriber) {
    return this.subs.add(subscriber);
}
function removeSubscriber(subscriber) {
    return this.subs.remove(subscriber);
}
function hasSubscriber(subscriber) {
    return this.subs.has(subscriber);
}
function hasSubscribers() {
    return this.subs.any();
}
function callSubscribers(newValue, previousValue, flags) {
    this.subs.notify(newValue, previousValue, flags);
}
function callCollectionSubscribers(indexMap, flags) {
    this.subs.notifyCollection(indexMap, flags);
}
//# sourceMappingURL=subscriber-collection.js.map