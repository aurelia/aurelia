import { def, defineHiddenProp, ensureProto } from '../utilities-objects.js';
export function subscriberCollection(target) {
    return target == null ? subscriberCollectionDeco : subscriberCollectionDeco(target);
}
function subscriberCollectionDeco(target) {
    const proto = target.prototype;
    // not configurable, as in devtool, the getter could be invoked on the prototype,
    // and become permanently broken
    def(proto, 'subs', { get: getSubscriberRecord });
    ensureProto(proto, 'subscribe', addSubscriber);
    ensureProto(proto, 'unsubscribe', removeSubscriber);
}
/* eslint-enable @typescript-eslint/ban-types */
export class SubscriberRecord {
    constructor() {
        /**
         * subscriber flags: bits indicating the existence status of the subscribers of this record
         */
        this._sf = 0 /* None */;
        this.count = 0;
    }
    add(subscriber) {
        if (this.has(subscriber)) {
            return false;
        }
        const subscriberFlags = this._sf;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._s0 = subscriber;
            this._sf |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._s1 = subscriber;
            this._sf |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._s2 = subscriber;
            this._sf |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._sr = [subscriber];
            this._sf |= 8 /* SubscribersRest */;
        }
        else {
            this._sr.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
        }
        ++this.count;
        return true;
    }
    has(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._sf;
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
            const subscribers = this._sr; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const ii = subscribers.length;
            let i = 0;
            for (; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    any() {
        return this._sf !== 0 /* None */;
    }
    remove(subscriber) {
        const subscriberFlags = this._sf;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._s0 === subscriber) {
            this._s0 = void 0;
            this._sf = (this._sf | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._s1 === subscriber) {
            this._s1 = void 0;
            this._sf = (this._sf | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._s2 === subscriber) {
            this._s2 = void 0;
            this._sf = (this._sf | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            const subscribers = this._sr; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const ii = subscribers.length;
            let i = 0;
            for (; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._sf = (this._sf | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
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
        const sub0 = this._s0;
        const sub1 = this._s1;
        const sub2 = this._s2;
        let subs = this._sr;
        if (subs !== void 0) {
            subs = subs.slice();
        }
        if (sub0 !== void 0) {
            sub0.handleChange(val, oldVal, flags);
        }
        if (sub1 !== void 0) {
            sub1.handleChange(val, oldVal, flags);
        }
        if (sub2 !== void 0) {
            sub2.handleChange(val, oldVal, flags);
        }
        if (subs !== void 0) {
            const ii = subs.length;
            let sub;
            let i = 0;
            for (; i < ii; ++i) {
                sub = subs[i];
                if (sub !== void 0) {
                    sub.handleChange(val, oldVal, flags);
                }
            }
        }
    }
    notifyCollection(indexMap, flags) {
        const sub0 = this._s0;
        const sub1 = this._s1;
        const sub2 = this._s2;
        let subs = this._sr;
        if (subs !== void 0) {
            subs = subs.slice();
        }
        if (sub0 !== void 0) {
            sub0.handleCollectionChange(indexMap, flags);
        }
        if (sub1 !== void 0) {
            sub1.handleCollectionChange(indexMap, flags);
        }
        if (sub2 !== void 0) {
            sub2.handleCollectionChange(indexMap, flags);
        }
        if (subs !== void 0) {
            const ii = subs.length;
            let sub;
            let i = 0;
            for (; i < ii; ++i) {
                sub = subs[i];
                if (sub !== void 0) {
                    sub.handleCollectionChange(indexMap, flags);
                }
            }
        }
    }
}
function getSubscriberRecord() {
    const record = new SubscriberRecord();
    defineHiddenProp(this, 'subs', record);
    return record;
}
function addSubscriber(subscriber) {
    return this.subs.add(subscriber);
}
function removeSubscriber(subscriber) {
    return this.subs.remove(subscriber);
}
//# sourceMappingURL=subscriber-collection.js.map