this.au = this.au || {};
this.au.runtime = (function (exports,kernel) {
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

    function bindingBehavior(nameOrSource) {
        return function (target) {
            return BindingBehaviorResource.define(nameOrSource, target);
        };
    }
    const BindingBehaviorResource = {
        name: 'binding-behavior',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(type) {
            return type.kind === this;
        },
        define(nameOrSource, ctor) {
            const Type = ctor;
            const description = typeof nameOrSource === 'string'
                ? { name: nameOrSource }
                : nameOrSource;
            Type.kind = BindingBehaviorResource;
            Type.description = description;
            Type.register = register;
            return Type;
        }
    };
    function register(container) {
        container.register(kernel.Registration.singleton(BindingBehaviorResource.keyFrom(this.description.name), this));
    }

    (function (BindingFlags) {
        BindingFlags[BindingFlags["none"] = 0] = "none";
        BindingFlags[BindingFlags["mustEvaluate"] = 1073741824] = "mustEvaluate";
        BindingFlags[BindingFlags["mutation"] = 3] = "mutation";
        BindingFlags[BindingFlags["isCollectionMutation"] = 1] = "isCollectionMutation";
        BindingFlags[BindingFlags["isInstanceMutation"] = 2] = "isInstanceMutation";
        BindingFlags[BindingFlags["update"] = 28] = "update";
        BindingFlags[BindingFlags["updateTargetObserver"] = 4] = "updateTargetObserver";
        BindingFlags[BindingFlags["updateTargetInstance"] = 8] = "updateTargetInstance";
        BindingFlags[BindingFlags["updateSourceExpression"] = 16] = "updateSourceExpression";
        BindingFlags[BindingFlags["from"] = 8160] = "from";
        BindingFlags[BindingFlags["fromFlushChanges"] = 32] = "fromFlushChanges";
        BindingFlags[BindingFlags["fromStartTask"] = 64] = "fromStartTask";
        BindingFlags[BindingFlags["fromStopTask"] = 128] = "fromStopTask";
        BindingFlags[BindingFlags["fromBind"] = 256] = "fromBind";
        BindingFlags[BindingFlags["fromUnbind"] = 512] = "fromUnbind";
        BindingFlags[BindingFlags["fromDOMEvent"] = 1024] = "fromDOMEvent";
        BindingFlags[BindingFlags["fromObserverSetter"] = 2048] = "fromObserverSetter";
        BindingFlags[BindingFlags["fromBindableHandler"] = 4096] = "fromBindableHandler";
    })(exports.BindingFlags || (exports.BindingFlags = {}));

    /**
     * Mostly just a marker enum to help with typings (specifically to reduce duplication)
     */
    (function (MutationKind) {
        MutationKind[MutationKind["instance"] = 1] = "instance";
        MutationKind[MutationKind["collection"] = 2] = "collection";
    })(exports.MutationKind || (exports.MutationKind = {}));

    function subscriberCollection(mutationKind) {
        return function (target) {
            const proto = target.prototype;
            proto._subscriberFlags = 0 /* None */;
            proto._subscriber0 = null;
            proto._subscriber1 = null;
            proto._subscriber2 = null;
            proto._subscribersRest = null;
            proto.addSubscriber = addSubscriber;
            proto.removeSubscriber = removeSubscriber;
            proto.hasSubscriber = hasSubscriber;
            proto.hasSubscribers = hasSubscribers;
            proto.callSubscribers = (mutationKind === exports.MutationKind.instance ? callPropertySubscribers : callCollectionSubscribers);
        };
    }
    function addSubscriber(subscriber) {
        if (this.hasSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._subscriberFlags;
        if (!(subscriberFlags & 1 /* Subscriber0 */)) {
            this._subscriber0 = subscriber;
            this._subscriberFlags |= 1 /* Subscriber0 */;
            return true;
        }
        if (!(subscriberFlags & 2 /* Subscriber1 */)) {
            this._subscriber1 = subscriber;
            this._subscriberFlags |= 2 /* Subscriber1 */;
            return true;
        }
        if (!(subscriberFlags & 4 /* Subscriber2 */)) {
            this._subscriber2 = subscriber;
            this._subscriberFlags |= 4 /* Subscriber2 */;
            return true;
        }
        if (!(subscriberFlags & 8 /* SubscribersRest */)) {
            this._subscribersRest = [subscriber];
            this._subscriberFlags |= 8 /* SubscribersRest */;
            return true;
        }
        nativePush.call(this._subscribersRest, subscriber);
        return true;
    }
    function removeSubscriber(subscriber) {
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._subscriber0 === subscriber) {
            this._subscriber0 = null;
            this._subscriberFlags &= ~1 /* Subscriber0 */;
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._subscriber1 === subscriber) {
            this._subscriber1 = null;
            this._subscriberFlags &= ~2 /* Subscriber1 */;
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._subscriber2 === subscriber) {
            this._subscriber2 = null;
            this._subscriberFlags &= ~4 /* Subscriber2 */;
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    nativeSplice.call(subscribers, i, 1);
                    if (ii === 1) {
                        this._subscriberFlags &= ~8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function callPropertySubscribers(newValue, previousValue, flags) {
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
        if (subscribers !== null) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== null) {
            subscriber0.handleChange(newValue, previousValue, flags);
        }
        if (subscriber1 !== null) {
            subscriber1.handleChange(newValue, previousValue, flags);
        }
        if (subscriber2 !== null) {
            subscriber2.handleChange(newValue, previousValue, flags);
        }
        const length = subscribers && subscribers.length || 0;
        if (length > 0) {
            for (let i = 0; i < length; ++i) {
                const subscriber = subscribers[i];
                if (subscriber !== null) {
                    subscriber.handleChange(newValue, previousValue, flags);
                }
            }
        }
    }
    function callCollectionSubscribers(origin, args, flags) {
        const subscriber0 = this._subscriber0;
        const subscriber1 = this._subscriber1;
        const subscriber2 = this._subscriber2;
        let subscribers = this._subscribersRest;
        if (subscribers !== null) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== null) {
            subscriber0.handleChange(origin, args, flags);
        }
        if (subscriber1 !== null) {
            subscriber1.handleChange(origin, args, flags);
        }
        if (subscriber2 !== null) {
            subscriber2.handleChange(origin, args, flags);
        }
        const length = subscribers && subscribers.length || 0;
        if (length > 0) {
            for (let i = 0; i < length; ++i) {
                const subscriber = subscribers[i];
                if (subscriber !== null) {
                    subscriber.handleChange(origin, args, flags);
                }
            }
        }
        this.changeSet.add(this);
    }
    function hasSubscribers() {
        return this._subscriberFlags !== 0 /* None */;
    }
    function hasSubscriber(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._subscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._subscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._subscriber2 === subscriber) {
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            // no need to check length; if the flag is set, there's always at least one
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function batchedSubscriberCollection() {
        return function (target) {
            const proto = target.prototype;
            proto._batchedSubscriberFlags = 0 /* None */;
            proto._batchedSubscriber0 = null;
            proto._batchedSubscriber1 = null;
            proto._batchedSubscriber2 = null;
            proto._batchedSubscribersRest = null;
            proto.addBatchedSubscriber = addBatchedSubscriber;
            proto.removeBatchedSubscriber = removeBatchedSubscriber;
            proto.hasBatchedSubscriber = hasBatchedSubscriber;
            proto.hasBatchedSubscribers = hasBatchedSubscribers;
            proto.callBatchedSubscribers = callBatchedCollectionSubscribers;
        };
    }
    function addBatchedSubscriber(subscriber) {
        if (this.hasBatchedSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._batchedSubscriberFlags;
        if (!(subscriberFlags & 1 /* Subscriber0 */)) {
            this._batchedSubscriber0 = subscriber;
            this._batchedSubscriberFlags |= 1 /* Subscriber0 */;
            return true;
        }
        if (!(subscriberFlags & 2 /* Subscriber1 */)) {
            this._batchedSubscriber1 = subscriber;
            this._batchedSubscriberFlags |= 2 /* Subscriber1 */;
            return true;
        }
        if (!(subscriberFlags & 4 /* Subscriber2 */)) {
            this._batchedSubscriber2 = subscriber;
            this._batchedSubscriberFlags |= 4 /* Subscriber2 */;
            return true;
        }
        if (!(subscriberFlags & 8 /* SubscribersRest */)) {
            this._batchedSubscribersRest = [subscriber];
            this._batchedSubscriberFlags |= 8 /* SubscribersRest */;
            return true;
        }
        nativePush.call(this._batchedSubscribersRest, subscriber);
        return true;
    }
    function removeBatchedSubscriber(subscriber) {
        const subscriberFlags = this._batchedSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._batchedSubscriber0 === subscriber) {
            this._batchedSubscriber0 = null;
            this._batchedSubscriberFlags &= ~1 /* Subscriber0 */;
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._batchedSubscriber1 === subscriber) {
            this._batchedSubscriber1 = null;
            this._batchedSubscriberFlags &= ~2 /* Subscriber1 */;
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._batchedSubscriber2 === subscriber) {
            this._batchedSubscriber2 = null;
            this._batchedSubscriberFlags &= ~4 /* Subscriber2 */;
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            const subscribers = this._batchedSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    nativeSplice.call(subscribers, i, 1);
                    if (ii === 1) {
                        this._batchedSubscriberFlags &= ~8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function callBatchedCollectionSubscribers(indexMap) {
        const subscriber0 = this._batchedSubscriber0;
        const subscriber1 = this._batchedSubscriber1;
        const subscriber2 = this._batchedSubscriber2;
        let subscribers = this._batchedSubscribersRest;
        if (subscribers !== null) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== null) {
            subscriber0.handleBatchedChange(indexMap);
        }
        if (subscriber1 !== null) {
            subscriber1.handleBatchedChange(indexMap);
        }
        if (subscriber2 !== null) {
            subscriber2.handleBatchedChange(indexMap);
        }
        const length = subscribers && subscribers.length || 0;
        if (length > 0) {
            for (let i = 0; i < length; ++i) {
                const subscriber = subscribers[i];
                if (subscriber !== null) {
                    subscriber.handleBatchedChange(indexMap);
                }
            }
        }
    }
    function hasBatchedSubscribers() {
        return this._batchedSubscriberFlags !== 0 /* None */;
    }
    function hasBatchedSubscriber(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._batchedSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._batchedSubscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._batchedSubscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._batchedSubscriber2 === subscriber) {
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            // no need to check length; if the flag is set, there's always at least one
            const subscribers = this._batchedSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }

    function setValue(newValue, flags) {
        const currentValue = this.currentValue;
        newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
        if (currentValue !== newValue) {
            this.currentValue = newValue;
            if (flags & exports.BindingFlags.fromFlushChanges) {
                this.setValueCore(newValue, flags);
            }
            else {
                this.currentFlags = flags;
                return this.changeSet.add(this);
            }
        }
        return Promise.resolve();
    }
    const defaultFlushChangesFlags = exports.BindingFlags.fromFlushChanges | exports.BindingFlags.updateTargetInstance;
    function flushChanges() {
        const currentValue = this.currentValue;
        // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
        // in which case the target doesn't need to be updated
        if (this.oldValue !== currentValue) {
            this.setValueCore(currentValue, this.currentFlags | defaultFlushChangesFlags);
            this.oldValue = this.currentValue;
        }
    }
    function dispose() {
        this.currentValue = null;
        this.oldValue = null;
        this.defaultValue = null;
        this.obj = null;
        this.propertyKey = '';
        this.changeSet = null;
    }
    function targetObserver(defaultValue = null) {
        return function (target) {
            subscriberCollection(exports.MutationKind.instance)(target);
            const proto = target.prototype;
            proto.currentValue = defaultValue;
            proto.oldValue = defaultValue;
            proto.defaultValue = defaultValue;
            proto.obj = null;
            proto.propertyKey = '';
            proto.setValue = proto.setValue || setValue;
            proto.flushChanges = proto.flushChanges || flushChanges;
            proto.dispose = proto.dispose || dispose;
            proto.changeSet = null;
        };
    }

    function flushChanges$1() {
        this.callBatchedSubscribers(this.indexMap);
        this.resetIndexMap();
    }
    function dispose$1() {
        this.collection.$observer = undefined;
        this.collection = null;
        this.indexMap = null;
    }
    function resetIndexMapIndexed() {
        const len = this.collection.length;
        const indexMap = (this.indexMap = Array(len));
        let i = 0;
        while (i < len) {
            indexMap[i] = i++;
        }
        indexMap.deletedItems = [];
    }
    function resetIndexMapKeyed() {
        const len = this.collection.size;
        const indexMap = (this.indexMap = Array(len));
        let i = 0;
        while (i < len) {
            indexMap[i] = i++;
        }
        indexMap.deletedItems = [];
    }
    function getLengthObserver() {
        return this.lengthObserver || (this.lengthObserver = new exports.CollectionLengthObserver(this, this.lengthPropertyName));
    }
    function collectionObserver(kind) {
        return function (target) {
            subscriberCollection(exports.MutationKind.collection)(target);
            batchedSubscriberCollection()(target);
            const proto = target.prototype;
            proto.collection = null;
            proto.indexMap = null;
            proto.hasChanges = false;
            proto.lengthPropertyName = kind & 8 /* indexed */ ? 'length' : 'size';
            proto.collectionKind = kind;
            proto.resetIndexMap = kind & 8 /* indexed */ ? resetIndexMapIndexed : resetIndexMapKeyed;
            proto.flushChanges = flushChanges$1;
            proto.dispose = dispose$1;
            proto.getLengthObserver = getLengthObserver;
            proto.subscribe = proto.subscribe || proto.addSubscriber;
            proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
            proto.subscribeBatched = proto.subscribeBatched || proto.addBatchedSubscriber;
            proto.unsubscribeBatched = proto.unsubscribeBatched || proto.removeBatchedSubscriber;
        };
    }
    exports.CollectionLengthObserver = class CollectionLengthObserver {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = obj[propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
    };
    exports.CollectionLengthObserver = __decorate([
        targetObserver()
    ], exports.CollectionLengthObserver);

    const proto = Array.prototype;
    const nativePush = proto.push; // TODO: probably want to make these internal again
    const nativeUnshift = proto.unshift;
    const nativePop = proto.pop;
    const nativeShift = proto.shift;
    const nativeSplice = proto.splice;
    const nativeReverse = proto.reverse;
    const nativeSort = proto.sort;
    // https://tc39.github.io/ecma262/#sec-array.prototype.push
    function observePush() {
        const o = this.$observer;
        if (o === undefined) {
            return nativePush.apply(this, arguments);
        }
        const len = this.length;
        const argCount = arguments.length;
        if (argCount === 0) {
            return len;
        }
        this.length = o.indexMap.length = len + argCount;
        let i = len;
        while (i < this.length) {
            this[i] = arguments[i - len];
            o.indexMap[i] = -2;
            i++;
        }
        o.callSubscribers('push', arguments, exports.BindingFlags.isCollectionMutation);
        return this.length;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
    function observeUnshift() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeUnshift.apply(this, arguments);
        }
        const argCount = arguments.length;
        const inserts = new Array(argCount);
        let i = 0;
        while (i < argCount) {
            inserts[i++] = -2;
        }
        nativeUnshift.apply(o.indexMap, inserts);
        const len = nativeUnshift.apply(this, arguments);
        o.callSubscribers('unshift', arguments, exports.BindingFlags.isCollectionMutation);
        return len;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.pop
    function observePop() {
        const o = this.$observer;
        if (o === undefined) {
            return nativePop.call(this);
        }
        const indexMap = o.indexMap;
        const element = nativePop.call(this);
        // only mark indices as deleted if they actually existed in the original array
        const index = indexMap.length - 1;
        if (indexMap[index] > -1) {
            nativePush.call(indexMap.deletedItems, element);
        }
        nativePop.call(indexMap);
        o.callSubscribers('pop', arguments, exports.BindingFlags.isCollectionMutation);
        return element;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.shift
    function observeShift() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeShift.call(this);
        }
        const indexMap = o.indexMap;
        const element = nativeShift.call(this);
        // only mark indices as deleted if they actually existed in the original array
        if (indexMap[0] > -1) {
            nativePush.call(indexMap.deletedItems, element);
        }
        nativeShift.call(indexMap);
        o.callSubscribers('shift', arguments, exports.BindingFlags.isCollectionMutation);
        return element;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.splice
    function observeSplice(start, deleteCount) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeSplice.apply(this, arguments);
        }
        const indexMap = o.indexMap;
        if (deleteCount > 0) {
            let i = start || 0;
            const to = i + deleteCount;
            while (i < to) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, this[i]);
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
            nativeSplice.call(indexMap, start, deleteCount, ...inserts);
        }
        else if (argCount === 2) {
            nativeSplice.call(indexMap, start, deleteCount);
        }
        const deleted = nativeSplice.apply(this, arguments);
        o.callSubscribers('splice', arguments, exports.BindingFlags.isCollectionMutation);
        return deleted;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
    function observeReverse() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeReverse.call(this);
        }
        const len = this.length;
        const middle = (len / 2) | 0;
        let lower = 0;
        while (lower !== middle) {
            const upper = len - lower - 1;
            const lowerValue = this[lower];
            const lowerIndex = o.indexMap[lower];
            const upperValue = this[upper];
            const upperIndex = o.indexMap[upper];
            this[lower] = upperValue;
            o.indexMap[lower] = upperIndex;
            this[upper] = lowerValue;
            o.indexMap[upper] = lowerIndex;
            lower++;
        }
        o.callSubscribers('reverse', arguments, exports.BindingFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.sort
    // https://github.com/v8/v8/blob/master/src/js/array.js
    function observeSort(compareFn) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeSort.call(this, compareFn);
        }
        const len = this.length;
        if (len < 2) {
            return this;
        }
        quickSort(this, o.indexMap, 0, len, preSortCompare);
        let i = 0;
        while (i < len) {
            if (this[i] === undefined) {
                break;
            }
            i++;
        }
        if (compareFn === undefined || typeof compareFn !== 'function' /*spec says throw a TypeError, should we do that too?*/) {
            compareFn = sortCompare;
        }
        quickSort(this, o.indexMap, 0, i, compareFn);
        o.callSubscribers('sort', arguments, exports.BindingFlags.isCollectionMutation);
        return this;
    }
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
        if (x === undefined) {
            if (y === undefined) {
                return 0;
            }
            else {
                return 1;
            }
        }
        if (y === undefined) {
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
    for (const observe of [observePush, observeUnshift, observePop, observeShift, observeSplice, observeReverse, observeSort]) {
        Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableArrayObservation() {
        if (proto.push['observing'] !== true)
            proto.push = observePush;
        if (proto.unshift['observing'] !== true)
            proto.unshift = observeUnshift;
        if (proto.pop['observing'] !== true)
            proto.pop = observePop;
        if (proto.shift['observing'] !== true)
            proto.shift = observeShift;
        if (proto.splice['observing'] !== true)
            proto.splice = observeSplice;
        if (proto.reverse['observing'] !== true)
            proto.reverse = observeReverse;
        if (proto.sort['observing'] !== true)
            proto.sort = observeSort;
    }
    enableArrayObservation();
    function disableArrayObservation() {
        if (proto.push['observing'] === true)
            proto.push = nativePush;
        if (proto.unshift['observing'] === true)
            proto.unshift = nativeUnshift;
        if (proto.pop['observing'] === true)
            proto.pop = nativePop;
        if (proto.shift['observing'] === true)
            proto.shift = nativeShift;
        if (proto.splice['observing'] === true)
            proto.splice = nativeSplice;
        if (proto.reverse['observing'] === true)
            proto.reverse = nativeReverse;
        if (proto.sort['observing'] === true)
            proto.sort = nativeSort;
    }
    exports.ArrayObserver = class ArrayObserver {
        constructor(changeSet, array) {
            this.changeSet = changeSet;
            array.$observer = this;
            this.collection = array;
            this.resetIndexMap();
        }
    };
    exports.ArrayObserver = __decorate([
        collectionObserver(9 /* array */)
    ], exports.ArrayObserver);
    function getArrayObserver(changeSet, array) {
        return array.$observer || new exports.ArrayObserver(changeSet, array);
    }

    const proto$1 = Set.prototype;
    const nativeAdd = proto$1.add; // TODO: probably want to make these internal again
    const nativeClear = proto$1.clear;
    const nativeDelete = proto$1.delete;
    // note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, add/delete/clear are easy to reconstruct for the indexMap
    // https://tc39.github.io/ecma262/#sec-set.prototype.add
    function observeAdd(value) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeAdd.call(this, value);
        }
        const oldSize = this.size;
        nativeAdd.call(this, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.callSubscribers('add', arguments, exports.BindingFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-set.prototype.clear
    function observeClear() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeClear.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            for (const entry of this.keys()) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, entry);
                }
                i++;
            }
            nativeClear.call(this);
            indexMap.length = 0;
            o.callSubscribers('clear', arguments, exports.BindingFlags.isCollectionMutation);
        }
        return undefined;
    }
    // https://tc39.github.io/ecma262/#sec-set.prototype.delete
    function observeDelete(value) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeDelete.call(this, value);
        }
        const size = this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, entry);
                }
                nativeSplice.call(indexMap, i, 1);
                return nativeDelete.call(this, value);
            }
            i++;
        }
        o.callSubscribers('delete', arguments, exports.BindingFlags.isCollectionMutation);
        return false;
    }
    for (const observe of [observeAdd, observeClear, observeDelete]) {
        Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableSetObservation() {
        if (proto$1.add['observing'] !== true)
            proto$1.add = observeAdd;
        if (proto$1.clear['observing'] !== true)
            proto$1.clear = observeClear;
        if (proto$1.delete['observing'] !== true)
            proto$1.delete = observeDelete;
    }
    enableSetObservation();
    function disableSetObservation() {
        if (proto$1.add['observing'] === true)
            proto$1.add = nativeAdd;
        if (proto$1.clear['observing'] === true)
            proto$1.clear = nativeClear;
        if (proto$1.delete['observing'] === true)
            proto$1.delete = nativeDelete;
    }
    exports.SetObserver = class SetObserver {
        constructor(changeSet, set) {
            this.changeSet = changeSet;
            set.$observer = this;
            this.collection = set;
            this.resetIndexMap();
        }
    };
    exports.SetObserver = __decorate([
        collectionObserver(7 /* set */)
    ], exports.SetObserver);
    function getSetObserver(changeSet, set) {
        return set.$observer || new exports.SetObserver(changeSet, set);
    }

    const IChangeSet = kernel.DI.createInterface()
        .withDefault(x => x.singleton(ChangeSet));
    /*@internal*/
    class ChangeSet extends Set {
        constructor() {
            super(...arguments);
            this.flushing = false;
            /*@internal*/
            this.promise = Promise.resolve();
            /**
             * This particular implementation is recursive; any changes added as a side-effect of flushing changes, will be flushed during the same tick.
             */
            this.flushChanges = () => {
                this.flushing = true;
                while (this.size > 0) {
                    const items = this.toArray();
                    this.clear();
                    const len = items.length;
                    let i = 0;
                    while (i < len) {
                        items[i++].flushChanges();
                    }
                }
                this.flushing = false;
            };
        }
        toArray() {
            const items = new Array(this.size);
            let i = 0;
            for (const item of this.keys()) {
                items[i++] = item;
            }
            return items;
        }
        add(changeTracker) {
            if (this.size === 0) {
                this.flushed = this.promise.then(this.flushChanges);
            }
            nativeAdd.call(this, changeTracker);
            return this.flushed;
        }
    }

    const INode = kernel.DI.createInterface().noDefault();
    const IRenderLocation = kernel.DI.createInterface().noDefault();
    /*@internal*/
    function createNodeSequenceFromFragment(fragment) {
        return new FragmentNodeSequence(fragment.cloneNode(true));
    }
    function removeNormal(node) {
        node.remove();
    }
    function removePolyfilled(node) {
        // not sure if we still actually need this, this used to be an IE9/10 thing
        node.parentNode.removeChild(node);
    }
    const DOM = {
        createFactoryFromMarkupOrNode(markupOrNode) {
            let template;
            if (markupOrNode instanceof Node) {
                if (markupOrNode.content) {
                    template = markupOrNode;
                }
                else {
                    template = DOM.createTemplate();
                    template.content.appendChild(markupOrNode);
                }
            }
            else {
                template = DOM.createTemplate();
                template.innerHTML = markupOrNode;
            }
            // bind performs a bit better and gives a cleaner closure than an arrow function
            return createNodeSequenceFromFragment.bind(null, template.content);
        },
        createElement(name) {
            return document.createElement(name);
        },
        createText(text) {
            return document.createTextNode(text);
        },
        createNodeObserver(target, callback, options) {
            const observer = new MutationObserver(callback);
            observer.observe(target, options);
            return observer;
        },
        attachShadow(host, options) {
            return host.attachShadow(options);
        },
        /*@internal*/
        createTemplate() {
            return document.createElement('template');
        },
        cloneNode(node, deep) {
            return node.cloneNode(deep !== false); // use true unless the caller explicitly passes in false
        },
        migrateChildNodes(currentParent, newParent) {
            const append = DOM.appendChild;
            while (currentParent.firstChild) {
                append(newParent, currentParent.firstChild);
            }
        },
        isNodeInstance(potentialNode) {
            return potentialNode instanceof Node;
        },
        isElementNodeType(node) {
            return node.nodeType === 1;
        },
        isTextNodeType(node) {
            return node.nodeType === 3;
        },
        remove(node) {
            // only check the prototype once and then permanently set a polyfilled or non-polyfilled call to save a few cycles
            if (Element.prototype.remove === undefined) {
                (DOM.remove = removePolyfilled)(node);
            }
            else {
                (DOM.remove = removeNormal)(node);
            }
        },
        replaceNode(newChild, oldChild) {
            if (oldChild.parentNode) {
                oldChild.parentNode.replaceChild(newChild, oldChild);
            }
        },
        appendChild(parent, child) {
            parent.appendChild(child);
        },
        insertBefore(nodeToInsert, referenceNode) {
            referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
        },
        getAttribute(node, name) {
            return node.getAttribute(name);
        },
        setAttribute(node, name, value) {
            node.setAttribute(name, value);
        },
        removeAttribute(node, name) {
            node.removeAttribute(name);
        },
        hasClass(node, className) {
            return node.classList.contains(className);
        },
        addClass(node, className) {
            node.classList.add(className);
        },
        removeClass(node, className) {
            node.classList.remove(className);
        },
        addEventListener(eventName, subscriber, publisher, options) {
            (publisher || document).addEventListener(eventName, subscriber, options);
        },
        removeEventListener(eventName, subscriber, publisher, options) {
            (publisher || document).removeEventListener(eventName, subscriber, options);
        },
        isAllWhitespace(node) {
            if (node.auInterpolationTarget === true) {
                return false;
            }
            const text = node.textContent;
            const len = text.length;
            let i = 0;
            // for perf benchmark of this compared to the regex method: http://jsben.ch/p70q2 (also a general case against using regex)
            while (i < len) {
                // charCodes 0-0x20(32) can all be considered whitespace (non-whitespace chars in this range don't have a visual representation anyway)
                if (text.charCodeAt(i) > 0x20) {
                    return false;
                }
                i++;
            }
            return true;
        },
        treatAsNonWhitespace(node) {
            // see isAllWhitespace above
            node.auInterpolationTarget = true;
        },
        convertToRenderLocation(node) {
            const location = document.createComment('au-loc');
            // let this throw if node does not have a parent
            node.parentNode.replaceChild(location, node);
            return location;
        },
        registerElementResolver(container, resolver) {
            container.registerResolver(INode, resolver);
            container.registerResolver(Element, resolver);
            container.registerResolver(HTMLElement, resolver);
            container.registerResolver(SVGElement, resolver);
        }
    };
    // This is an implementation of INodeSequence that represents "no DOM" to render.
    // It's used in various places to avoid null and to encode
    // the explicit idea of "no view".
    const emptySequence = {
        firstChild: null,
        lastChild: null,
        childNodes: kernel.PLATFORM.emptyArray,
        findTargets() { return kernel.PLATFORM.emptyArray; },
        insertBefore(refNode) { },
        appendTo(parent) { },
        remove() { }
    };
    const NodeSequence = {
        empty: emptySequence,
        // This creates an instance of INodeSequence based on an existing INode.
        // It's used by the rendering engine to create an instance of IView,
        // based on a single component. The rendering engine's createViewFromComponent
        // method has one consumer: the compose element. The compose element uses this
        // to create an IView based on a dynamically determined component instance.
        // This is required because there's no way to get a "loose" component into the view
        // hierarchy without it being part of an IView.
        // IViews can only be added via an IViewSlot or IRenderLocation.
        // So, this form of node sequence effectively enables a single component to be added into an IViewSlot.
        fromNode(node) {
            return {
                firstChild: node,
                lastChild: node,
                childNodes: [node],
                findTargets() {
                    return kernel.PLATFORM.emptyArray;
                },
                insertBefore(refNode) {
                    DOM.insertBefore(node, refNode);
                },
                appendTo(parent) {
                    DOM.appendChild(parent, node);
                },
                remove() {
                    DOM.remove(node);
                }
            };
        }
    };
    // This is the most common form of INodeSequence.
    // Every custom element or template controller whose node sequence is based on an HTML template
    // has an instance of this under the hood. Anyone who wants to create a node sequence from
    // a string of markup would also receive an instance of this.
    // CompiledTemplates create instances of FragmentNodeSequence.
    /*@internal*/
    class FragmentNodeSequence {
        constructor(fragment) {
            this.fragment = fragment;
            this.firstChild = fragment.firstChild;
            this.lastChild = fragment.lastChild;
            this.childNodes = kernel.PLATFORM.toArray(fragment.childNodes);
        }
        findTargets() {
            return this.fragment.querySelectorAll('.au');
        }
        insertBefore(refNode) {
            refNode.parentNode.insertBefore(this.fragment, refNode);
        }
        appendTo(parent) {
            parent.appendChild(this.fragment);
        }
        remove() {
            const fragment = this.fragment;
            // this bind is a small perf tweak to minimize member accessors
            const append = fragment.appendChild.bind(fragment);
            let current = this.firstChild;
            const end = this.lastChild;
            let next;
            while (current) {
                next = current.nextSibling;
                append(current);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
    }

    // tslint:disable-next-line:no-http-string
    const xlinkAttributeNS = 'http://www.w3.org/1999/xlink';
    exports.XLinkAttributeAccessor = class XLinkAttributeAccessor {
        // xlink namespaced attributes require getAttributeNS/setAttributeNS
        // (even though the NS version doesn't work for other namespaces
        // in html5 documents)
        // Using very HTML-specific code here since this isn't likely to get
        // called unless operating against a real HTML element.
        constructor(changeSet, obj, propertyKey, attributeName) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.attributeName = attributeName;
            this.oldValue = this.currentValue = this.getValue();
        }
        getValue() {
            return this.obj.getAttributeNS(xlinkAttributeNS, this.attributeName);
        }
        setValueCore(newValue) {
            this.obj.setAttributeNS(xlinkAttributeNS, this.attributeName, newValue);
        }
    };
    exports.XLinkAttributeAccessor = __decorate([
        targetObserver('')
    ], exports.XLinkAttributeAccessor);
    exports.XLinkAttributeAccessor.prototype.attributeName = '';
    exports.DataAttributeAccessor = class DataAttributeAccessor {
        constructor(changeSet, obj, propertyKey) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.oldValue = this.currentValue = this.getValue();
        }
        getValue() {
            return DOM.getAttribute(this.obj, this.propertyKey);
        }
        setValueCore(newValue) {
            if (newValue === null) {
                DOM.removeAttribute(this.obj, this.propertyKey);
            }
            else {
                DOM.setAttribute(this.obj, this.propertyKey, newValue);
            }
        }
    };
    exports.DataAttributeAccessor = __decorate([
        targetObserver()
    ], exports.DataAttributeAccessor);
    exports.StyleAttributeAccessor = class StyleAttributeAccessor {
        constructor(changeSet, obj) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.oldValue = this.currentValue = obj.style.cssText;
        }
        getValue() {
            return this.obj.style.cssText;
        }
        // tslint:disable-next-line:function-name
        _setProperty(style, value) {
            let priority = '';
            if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
                priority = 'important';
                value = value.replace('!important', '');
            }
            this.obj.style.setProperty(style, value, priority);
        }
        setValueCore(newValue) {
            const styles = this.styles || {};
            let style;
            let version = this.version;
            if (newValue !== null) {
                if (newValue instanceof Object) {
                    let value;
                    for (style in newValue) {
                        if (newValue.hasOwnProperty(style)) {
                            value = newValue[style];
                            style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
                            styles[style] = version;
                            this._setProperty(style, value);
                        }
                    }
                }
                else if (newValue.length) {
                    const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
                    let pair;
                    while ((pair = rx.exec(newValue)) !== null) {
                        style = pair[1];
                        if (!style) {
                            continue;
                        }
                        styles[style] = version;
                        this._setProperty(style, pair[2]);
                    }
                }
            }
            this.styles = styles;
            this.version += 1;
            if (version === 0) {
                return;
            }
            version -= 1;
            for (style in styles) {
                if (!styles.hasOwnProperty(style) || styles[style] !== version) {
                    continue;
                }
                this.obj.style.removeProperty(style);
            }
        }
    };
    exports.StyleAttributeAccessor = __decorate([
        targetObserver()
    ], exports.StyleAttributeAccessor);
    exports.StyleAttributeAccessor.prototype.styles = null;
    exports.StyleAttributeAccessor.prototype.version = 0;
    exports.StyleAttributeAccessor.prototype.propertyKey = 'style';
    exports.ClassAttributeAccessor = class ClassAttributeAccessor {
        constructor(changeSet, obj) {
            this.changeSet = changeSet;
            this.obj = obj;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue) {
            const addClass = DOM.addClass;
            const removeClass = DOM.removeClass;
            const nameIndex = this.nameIndex || {};
            let version = this.version;
            let names;
            let name;
            // Add the classes, tracking the version at which they were added.
            if (newValue.length) {
                const node = this.obj;
                names = newValue.split(/\s+/);
                for (let i = 0, length = names.length; i < length; i++) {
                    name = names[i];
                    if (!name.length) {
                        continue;
                    }
                    nameIndex[name] = version;
                    addClass(node, name);
                }
            }
            // Update state variables.
            this.nameIndex = nameIndex;
            this.version += 1;
            // First call to setValue?  We're done.
            if (version === 0) {
                return;
            }
            // Remove classes from previous version.
            version -= 1;
            for (name in nameIndex) {
                if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
                    continue;
                }
                // TODO: this has the side-effect that classes already present which are added again,
                // will be removed if they're not present in the next update.
                // Better would be do have some configurability for this behavior, allowing the user to
                // decide whether initial classes always need to be kept, always removed, or something in between
                removeClass(this.obj, name);
            }
        }
    };
    exports.ClassAttributeAccessor = __decorate([
        targetObserver('')
    ], exports.ClassAttributeAccessor);
    exports.ClassAttributeAccessor.prototype.doNotCache = true;
    exports.ClassAttributeAccessor.prototype.version = 0;
    exports.ClassAttributeAccessor.prototype.nameIndex = null;
    exports.PropertyAccessor = class PropertyAccessor {
        constructor(changeSet, obj, propertyKey) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.oldValue = this.currentValue = obj[propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(value) {
            this.obj[this.propertyKey] = value;
        }
    };
    exports.PropertyAccessor = __decorate([
        targetObserver()
    ], exports.PropertyAccessor);

    exports.AttrBindingBehavior = class AttrBindingBehavior {
        bind(flags, scope, binding) {
            binding.targetObserver = new exports.DataAttributeAccessor(binding.locator.get(IChangeSet), binding.target, binding.targetProperty);
        }
        // tslint:disable-next-line:no-empty
        unbind(flags, scope, binding) { }
    };
    exports.AttrBindingBehavior = __decorate([
        bindingBehavior('attr')
    ], exports.AttrBindingBehavior);

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

    const { oneTime, toView, fromView, twoWay } = exports.BindingMode;
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
    exports.OneTimeBindingBehavior = class OneTimeBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(oneTime);
        }
    };
    exports.OneTimeBindingBehavior = __decorate([
        bindingBehavior('oneTime')
    ], exports.OneTimeBindingBehavior);
    exports.ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(toView);
        }
    };
    exports.ToViewBindingBehavior = __decorate([
        bindingBehavior('toView')
    ], exports.ToViewBindingBehavior);
    exports.FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(fromView);
        }
    };
    exports.FromViewBindingBehavior = __decorate([
        bindingBehavior('fromView')
    ], exports.FromViewBindingBehavior);
    exports.TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(twoWay);
        }
    };
    exports.TwoWayBindingBehavior = __decorate([
        bindingBehavior('twoWay')
    ], exports.TwoWayBindingBehavior);

    const slotNames = new Array(100);
    const versionSlotNames = new Array(100);
    for (let i = 0; i < 100; i++) {
        slotNames[i] = `_observer${i}`;
        versionSlotNames[i] = `_observerVersion${i}`;
    }
    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { oneTime: oneTime$1, toView: toView$1, fromView: fromView$1 } = exports.BindingMode;
    // pre-combining flags for bitwise checks is a minor perf tweak
    const toViewOrOneTime = toView$1 | oneTime$1;
    // tslint:disable:no-any
    class Binding {
        constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.$isBound = false;
        }
        updateTarget(value) {
            this.targetObserver.setValue(value, exports.BindingFlags.updateTargetInstance);
        }
        updateSource(value) {
            this.sourceExpression.assign(exports.BindingFlags.updateSourceExpression, this.$scope, this.locator, value);
        }
        handleChange(newValue, previousValue, flags) {
            if (!this.$isBound) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            const $scope = this.$scope;
            const locator = this.locator;
            if (flags & exports.BindingFlags.updateTargetInstance) {
                const targetObserver = this.targetObserver;
                const mode = this.mode;
                previousValue = targetObserver.getValue();
                newValue = sourceExpression.evaluate(flags, $scope, locator);
                if (newValue !== previousValue) {
                    targetObserver.setValue(newValue, flags);
                }
                if (!(mode & oneTime$1)) {
                    this.version++;
                    sourceExpression.connect(flags, $scope, this);
                    this.unobserve(false);
                }
                return;
            }
            if (flags & exports.BindingFlags.updateSourceExpression) {
                if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
                    sourceExpression.assign(flags, $scope, locator, newValue);
                }
                return;
            }
            throw kernel.Reporter.error(15, exports.BindingFlags[flags]);
        }
        $bind(flags, scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$isBound = true;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            const mode = this.mode;
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                if (mode & fromView$1) {
                    targetObserver = this.targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty);
                }
                else {
                    targetObserver = this.targetObserver = this.observerLocator.getAccessor(this.target, this.targetProperty);
                }
            }
            if (targetObserver.bind) {
                targetObserver.bind(flags);
            }
            if (mode & toViewOrOneTime) {
                targetObserver.setValue(sourceExpression.evaluate(flags, scope, this.locator), flags);
            }
            if (mode & toView$1) {
                sourceExpression.connect(flags, scope, this);
            }
            if (mode & fromView$1) {
                targetObserver.subscribe(this);
            }
        }
        $unbind(flags) {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            const targetObserver = this.targetObserver;
            if (targetObserver.unbind) {
                targetObserver.unbind(flags);
            }
            if (targetObserver.unsubscribe) {
                targetObserver.unsubscribe(this);
            }
            this.unobserve(true);
        }
        connect(flags) {
            if (!this.$isBound) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            const $scope = this.$scope;
            if (flags & exports.BindingFlags.mustEvaluate) {
                const value = sourceExpression.evaluate(flags, $scope, this.locator);
                this.targetObserver.setValue(value, flags);
            }
            sourceExpression.connect(flags, $scope, this);
        }
        //#region ConnectableBinding
        addObserver(observer) {
            // find the observer.
            const observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
            let i = observerSlots;
            while (i-- && this[slotNames[i]] !== observer) {
                // Do nothing
            }
            // if we are not already observing, put the observer in an open slot and subscribe.
            if (i === -1) {
                i = 0;
                while (this[slotNames[i]]) {
                    i++;
                }
                this[slotNames[i]] = observer;
                observer.subscribe(this);
                // increment the slot count.
                if (i === observerSlots) {
                    this.observerSlots = i + 1;
                }
            }
            // set the "version" when the observer was used.
            if (this.version === undefined) {
                this.version = 0;
            }
            this[versionSlotNames[i]] = this.version;
        }
        observeProperty(obj, propertyName) {
            const observer = this.observerLocator.getObserver(obj, propertyName);
            /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
             *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
             *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
             *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
             *
             * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
             */
            this.addObserver(observer);
        }
        unobserve(all) {
            const slots = this.observerSlots;
            let i = 0;
            let slotName;
            let observer;
            if (all) {
                // forward array processing is easier on the cpu than backwards (unlike a loop without array processing)
                while (i < slots) {
                    slotName = slotNames[i];
                    if (observer = this[slotName]) {
                        this[slotName] = null;
                        observer.unsubscribe(this);
                    }
                    i++;
                }
            }
            else {
                const version = this.version;
                while (i < slots) {
                    if (this[versionSlotNames[i]] !== version) {
                        slotName = slotNames[i];
                        if (observer = this[slotName]) {
                            this[slotName] = null;
                            observer.unsubscribe(this);
                        }
                    }
                    i++;
                }
            }
        }
    }
    // tslint:enable:no-any

    const unset = {};
    /*@internal*/
    function debounceCallSource(event) {
        const state = this.debounceState;
        clearTimeout(state.timeoutId);
        state.timeoutId = setTimeout(() => this.debouncedMethod(event), state.delay);
    }
    /*@internal*/
    function debounceCall(newValue, oldValue, flags) {
        const state = this.debounceState;
        clearTimeout(state.timeoutId);
        if (!(flags & state.callContextToDebounce)) {
            state.oldValue = unset;
            this.debouncedMethod(newValue, oldValue, flags);
            return;
        }
        if (state.oldValue === unset) {
            state.oldValue = oldValue;
        }
        state.timeoutId = setTimeout(() => {
            const ov = state.oldValue;
            state.oldValue = unset;
            this.debouncedMethod(newValue, ov, flags);
        }, state.delay);
    }
    const fromView$2 = exports.BindingMode.fromView;
    exports.DebounceBindingBehavior = class DebounceBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToDebounce;
            let callContextToDebounce;
            let debouncer;
            if (binding instanceof Binding) {
                methodToDebounce = 'handleChange';
                debouncer = debounceCall;
                callContextToDebounce = binding.mode & fromView$2 ? exports.BindingFlags.updateSourceExpression : exports.BindingFlags.updateTargetInstance;
            }
            else {
                methodToDebounce = 'callSource';
                debouncer = debounceCallSource;
                callContextToDebounce = exports.BindingFlags.updateTargetInstance;
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
            clearTimeout(binding.debounceState.timeoutId);
            binding.debounceState = null;
        }
    };
    exports.DebounceBindingBehavior = __decorate([
        bindingBehavior('debounce')
    ], exports.DebounceBindingBehavior);

    function valueConverter(nameOrSource) {
        return function (target) {
            return ValueConverterResource.define(nameOrSource, target);
        };
    }
    const ValueConverterResource = {
        name: 'value-converter',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(type) {
            return type.kind === this;
        },
        define(nameOrSource, ctor) {
            const Type = ctor;
            const description = typeof nameOrSource === 'string'
                ? { name: nameOrSource }
                : nameOrSource;
            Type.kind = ValueConverterResource;
            Type.description = description;
            Type.register = register$1;
            return Type;
        }
    };
    function register$1(container) {
        container.register(kernel.Registration.singleton(ValueConverterResource.keyFrom(this.description.name), this));
    }

    const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const ISanitizer = kernel.DI.createInterface()
        .withDefault(x => x.singleton(class {
        sanitize(input) {
            return input.replace(SCRIPT_REGEX, '');
        }
    }));
    /**
     * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
     */
    exports.SanitizeValueConverter = class SanitizeValueConverter {
        constructor(sanitizer) {
            this.sanitizer = sanitizer;
            this.sanitizer = sanitizer;
        }
        /**
         * Process the provided markup that flows to the view.
         * @param untrustedMarkup The untrusted markup to be sanitized.
         */
        toView(untrustedMarkup) {
            if (untrustedMarkup === null || untrustedMarkup === undefined) {
                return null;
            }
            return this.sanitizer.sanitize(untrustedMarkup);
        }
    };
    exports.SanitizeValueConverter = __decorate([
        valueConverter('sanitize'),
        kernel.inject(ISanitizer)
    ], exports.SanitizeValueConverter);

    /*@internal*/
    function findOriginalEventTarget(event) {
        return (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
    }
    /*@internal*/
    function handleSelfEvent(event) {
        let target = findOriginalEventTarget(event);
        if (this.target !== target) {
            return;
        }
        this.selfEventCallSource(event);
    }
    exports.SelfBindingBehavior = class SelfBindingBehavior {
        bind(flags, scope, binding) {
            if (!binding.callSource || !binding.targetEvent) {
                throw kernel.Reporter.error(8);
            }
            binding.selfEventCallSource = binding.callSource;
            binding.callSource = handleSelfEvent;
        }
        unbind(flags, scope, binding) {
            binding.callSource = binding.selfEventCallSource;
            binding.selfEventCallSource = null;
        }
    };
    exports.SelfBindingBehavior = __decorate([
        bindingBehavior('self')
    ], exports.SelfBindingBehavior);

    const ISignaler = kernel.DI.createInterface()
        .withDefault(x => x.singleton(class {
        dispatchSignal(name) {
            let bindings = this.signals[name];
            if (!bindings) {
                return;
            }
            let i = bindings.length;
            while (i--) {
                bindings[i].handleChange(undefined, undefined, exports.BindingFlags.updateTargetInstance);
            }
        }
        addSignalListener(name, listener) {
            (this.signals[name] || (this.signals[name] = [])).push(listener);
        }
        removeSignalListener(name, listener) {
            let listeners = this.signals[name];
            if (listeners) {
                listeners.splice(listeners.indexOf(listener), 1);
            }
        }
    }));

    exports.SignalBindingBehavior = class SignalBindingBehavior {
        constructor(signaler) {
            this.signaler = signaler;
        }
        bind(flags, scope, binding) {
            if (!binding.updateTarget) {
                throw kernel.Reporter.error(11);
            }
            if (arguments.length === 4) {
                let name = arguments[3];
                this.signaler.addSignalListener(name, binding);
                binding.signal = name;
            }
            else if (arguments.length > 4) {
                let names = Array.prototype.slice.call(arguments, 3);
                let i = names.length;
                while (i--) {
                    let name = names[i];
                    this.signaler.addSignalListener(name, binding);
                }
                binding.signal = names;
            }
            else {
                throw kernel.Reporter.error(12);
            }
        }
        unbind(flags, scope, binding) {
            let name = binding.signal;
            binding.signal = null;
            if (Array.isArray(name)) {
                let names = name;
                let i = names.length;
                while (i--) {
                    this.signaler.removeSignalListener(names[i], binding);
                }
            }
            else {
                this.signaler.removeSignalListener(name, binding);
            }
        }
    };
    exports.SignalBindingBehavior = __decorate([
        bindingBehavior('signal'),
        kernel.inject(ISignaler)
    ], exports.SignalBindingBehavior);

    /*@internal*/
    function throttle(newValue) {
        let state = this.throttleState;
        let elapsed = +new Date() - state.last;
        if (elapsed >= state.delay) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
            state.last = +new Date();
            this.throttledMethod(newValue);
            return;
        }
        state.newValue = newValue;
        if (state.timeoutId === null) {
            state.timeoutId = setTimeout(() => {
                state.timeoutId = null;
                state.last = +new Date();
                this.throttledMethod(state.newValue);
            }, state.delay - elapsed);
        }
    }
    exports.ThrottleBindingBehavior = class ThrottleBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToThrottle;
            if (binding instanceof Binding) {
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
                timeoutId: null
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            let methodToRestore = binding.throttledMethod.originalName;
            binding[methodToRestore] = binding.throttledMethod;
            binding.throttledMethod = null;
            clearTimeout(binding.throttleState.timeoutId);
            binding.throttleState = null;
        }
    };
    exports.ThrottleBindingBehavior = __decorate([
        bindingBehavior('throttle')
    ], exports.ThrottleBindingBehavior);

    //Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
    function findOriginalEventTarget$1(event) {
        return (event.composedPath && event.composedPath()[0]) || (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
    }
    function stopPropagation() {
        this.standardStopPropagation();
        this.propagationStopped = true;
    }
    function handleCapturedEvent(event) {
        event.propagationStopped = false;
        let target = findOriginalEventTarget$1(event);
        const orderedCallbacks = [];
        /**
         * During capturing phase, event 'bubbles' down from parent. Needs to reorder callback from root down to target
         */
        while (target) {
            if (target.capturedCallbacks) {
                const callback = target.capturedCallbacks[event.type];
                if (callback) {
                    if (event.stopPropagation !== stopPropagation) {
                        event.standardStopPropagation = event.stopPropagation;
                        event.stopPropagation = stopPropagation;
                    }
                    orderedCallbacks.push(callback);
                }
            }
            target = target.parentNode;
        }
        for (let i = orderedCallbacks.length - 1; i >= 0 && !event.propagationStopped; i--) {
            const orderedCallback = orderedCallbacks[i];
            if ('handleEvent' in orderedCallback) {
                orderedCallback.handleEvent(event);
            }
            else {
                orderedCallback(event);
            }
        }
    }
    function handleDelegatedEvent(event) {
        event.propagationStopped = false;
        let target = findOriginalEventTarget$1(event);
        while (target && !event.propagationStopped) {
            if (target.delegatedCallbacks) {
                const callback = target.delegatedCallbacks[event.type];
                if (callback) {
                    if (event.stopPropagation !== stopPropagation) {
                        event.standardStopPropagation = event.stopPropagation;
                        event.stopPropagation = stopPropagation;
                    }
                    if ('handleEvent' in callback) {
                        callback.handleEvent(event);
                    }
                    else {
                        callback(event);
                    }
                }
            }
            target = target.parentNode;
        }
    }
    class ListenerTracker {
        constructor(eventName, listener, capture) {
            this.eventName = eventName;
            this.listener = listener;
            this.capture = capture;
            this.count = 0;
        }
        increment() {
            this.count++;
            if (this.count === 1) {
                DOM.addEventListener(this.eventName, this.listener, null, this.capture);
            }
        }
        decrement() {
            this.count--;
            if (this.count === 0) {
                DOM.removeEventListener(this.eventName, this.listener, null, this.capture);
            }
        }
    }
    /**
     * Enable dispose() pattern for `delegate` & `capture` commands
     */
    class DelegateOrCaptureSubscription {
        constructor(entry, lookup, targetEvent, callback) {
            this.entry = entry;
            this.lookup = lookup;
            this.targetEvent = targetEvent;
            lookup[targetEvent] = callback;
        }
        dispose() {
            this.entry.decrement();
            this.lookup[this.targetEvent] = null;
        }
    }
    /**
     * Enable dispose() pattern for addEventListener for `trigger`
     */
    class TriggerSubscription {
        constructor(target, targetEvent, callback) {
            this.target = target;
            this.targetEvent = targetEvent;
            this.callback = callback;
            DOM.addEventListener(targetEvent, callback, target);
        }
        dispose() {
            DOM.removeEventListener(this.targetEvent, this.callback, this.target);
        }
    }
    (function (DelegationStrategy) {
        DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
        DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
        DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
    })(exports.DelegationStrategy || (exports.DelegationStrategy = {}));
    class EventSubscriber {
        constructor(events) {
            this.events = events;
            this.events = events;
            this.target = null;
            this.handler = null;
        }
        subscribe(node, callbackOrListener) {
            this.target = node;
            this.handler = callbackOrListener;
            const add = DOM.addEventListener;
            const events = this.events;
            for (let i = 0, ii = events.length; ii > i; ++i) {
                add(events[i], callbackOrListener, node);
            }
        }
        dispose() {
            const node = this.target;
            const callbackOrListener = this.handler;
            const events = this.events;
            const remove = DOM.removeEventListener;
            for (let i = 0, ii = events.length; ii > i; ++i) {
                remove(events[i], callbackOrListener, node);
            }
            this.target = this.handler = null;
        }
    }
    const IEventManager = kernel.DI.createInterface()
        .withDefault(x => x.singleton(EventManager));
    /*@internal*/
    class EventManager {
        constructor() {
            this.elementHandlerLookup = {};
            this.delegatedHandlers = {};
            this.capturedHandlers = {};
            this.registerElementConfiguration({
                tagName: 'INPUT',
                properties: {
                    value: ['change', 'input'],
                    checked: ['change', 'input'],
                    files: ['change', 'input']
                }
            });
            this.registerElementConfiguration({
                tagName: 'TEXTAREA',
                properties: {
                    value: ['change', 'input']
                }
            });
            this.registerElementConfiguration({
                tagName: 'SELECT',
                properties: {
                    value: ['change']
                }
            });
            this.registerElementConfiguration({
                tagName: 'content editable',
                properties: {
                    value: ['change', 'input', 'blur', 'keyup', 'paste']
                }
            });
            this.registerElementConfiguration({
                tagName: 'scrollable element',
                properties: {
                    scrollTop: ['scroll'],
                    scrollLeft: ['scroll']
                }
            });
        }
        registerElementConfiguration(config) {
            const properties = config.properties;
            const lookup = this.elementHandlerLookup[config.tagName] = {};
            for (const propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    lookup[propertyName] = properties[propertyName];
                }
            }
        }
        getElementHandler(target, propertyName) {
            const tagName = target['tagName'];
            const lookup = this.elementHandlerLookup;
            if (tagName) {
                if (lookup[tagName] && lookup[tagName][propertyName]) {
                    return new EventSubscriber(lookup[tagName][propertyName]);
                }
                if (propertyName === 'textContent' || propertyName === 'innerHTML') {
                    return new EventSubscriber(lookup['content editable'].value);
                }
                if (propertyName === 'scrollTop' || propertyName === 'scrollLeft') {
                    return new EventSubscriber(lookup['scrollable element'][propertyName]);
                }
            }
            return null;
        }
        addEventListener(target, targetEvent, callbackOrListener, strategy) {
            let delegatedHandlers;
            let capturedHandlers;
            let handlerEntry;
            if (strategy === exports.DelegationStrategy.bubbling) {
                delegatedHandlers = this.delegatedHandlers;
                handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleDelegatedEvent, false));
                handlerEntry.increment();
                const delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
                return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
            }
            if (strategy === exports.DelegationStrategy.capturing) {
                capturedHandlers = this.capturedHandlers;
                handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleCapturedEvent, true));
                handlerEntry.increment();
                const capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});
                return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
            }
            return new TriggerSubscription(target, targetEvent, callbackOrListener);
        }
    }

    function computed(config) {
        return function (target, key) {
            const computed = target.computed || (target.computed = {});
            computed[key] = config;
        };
    }
    const noProxy = !(typeof Proxy !== undefined);
    const computedOverrideDefaults = { static: false, volatile: false };
    /* @internal */
    function createComputedObserver(observerLocator, dirtyChecker, changeSet, 
    // tslint:disable-next-line:no-reserved-keywords
    instance, propertyName, descriptor) {
        if (descriptor.configurable === false) {
            return dirtyChecker.createProperty(instance, propertyName);
        }
        if (descriptor.get) {
            const overrides = instance.constructor.computed
                ? instance.constructor.computed[propertyName] || computedOverrideDefaults
                : computedOverrideDefaults;
            if (descriptor.set) {
                if (overrides.volatile) {
                    return noProxy
                        ? dirtyChecker.createProperty(instance, propertyName)
                        : new exports.GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, changeSet);
                }
                return new exports.CustomSetterObserver(instance, propertyName, descriptor, changeSet);
            }
            return noProxy
                ? dirtyChecker.createProperty(instance, propertyName)
                : new exports.GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, changeSet);
        }
        throw kernel.Reporter.error(18, propertyName);
    }
    // Used when the getter is dependent solely on changes that happen within the setter.
    exports.CustomSetterObserver = class CustomSetterObserver {
        constructor(obj, propertyKey, descriptor, changeSet) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.descriptor = descriptor;
            this.changeSet = changeSet;
            this.observing = false;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        flushChanges() {
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            this.callSubscribers(newValue, oldValue, exports.BindingFlags.updateTargetInstance | exports.BindingFlags.fromFlushChanges);
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
            const setter = this.descriptor.set;
            // tslint:disable-next-line:no-this-assignment
            const that = this;
            this.observing = true;
            this.currentValue = this.obj[this.propertyKey];
            Reflect.defineProperty(this.obj, this.propertyKey, {
                set: function (newValue) {
                    setter(newValue);
                    const oldValue = this.currentValue;
                    if (oldValue !== newValue) {
                        that.oldValue = oldValue;
                        that.changeSet.add(that);
                        that.currentValue = newValue;
                    }
                }
            });
        }
    };
    exports.CustomSetterObserver = __decorate([
        subscriberCollection(exports.MutationKind.instance)
    ], exports.CustomSetterObserver);
    exports.CustomSetterObserver.prototype.dispose = kernel.PLATFORM.noop;
    // Used when there is no setter, and the getter is dependent on other properties of the object;
    // Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
    /*@internal*/
    exports.GetterObserver = class GetterObserver {
        constructor(overrides, obj, propertyKey, descriptor, observerLocator, changeSet) {
            this.overrides = overrides;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.descriptor = descriptor;
            this.observerLocator = observerLocator;
            this.changeSet = changeSet;
            this.controller = new GetterController(overrides, obj, propertyKey, descriptor, this, observerLocator, changeSet);
        }
        getValue() {
            return this.controller.value;
        }
        // tslint:disable-next-line:no-empty
        setValue(newValue) { }
        flushChanges() {
            const oldValue = this.controller.value;
            const newValue = this.controller.getValueAndCollectDependencies();
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, exports.BindingFlags.updateTargetInstance);
            }
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
            this.controller.onSubscriberAdded();
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            this.controller.onSubscriberRemoved();
        }
    };
    exports.GetterObserver = __decorate([
        subscriberCollection(exports.MutationKind.instance)
    ], exports.GetterObserver);
    exports.GetterObserver.prototype.dispose = kernel.PLATFORM.noop;
    /*@internal*/
    class GetterController {
        constructor(overrides, instance, propertyName, descriptor, owner, observerLocator, changeSet) {
            this.overrides = overrides;
            this.instance = instance;
            this.propertyName = propertyName;
            this.owner = owner;
            this.changeSet = changeSet;
            this.isCollecting = false;
            this.dependencies = [];
            this.subscriberCount = 0;
            const proxy = new Proxy(instance, createGetterTraps(observerLocator, this));
            const getter = descriptor.get;
            // tslint:disable-next-line:no-this-assignment
            const ctrl = this;
            Reflect.defineProperty(instance, propertyName, {
                get: function () {
                    if (ctrl.subscriberCount < 1 || ctrl.isCollecting) {
                        ctrl.value = getter.apply(proxy);
                    }
                    return ctrl.value;
                }
            });
        }
        addDependency(subscribable) {
            if (this.dependencies.includes(subscribable)) {
                return;
            }
            this.dependencies.push(subscribable);
        }
        onSubscriberAdded() {
            this.subscriberCount++;
            if (this.subscriberCount > 1) {
                return;
            }
            this.getValueAndCollectDependencies(true);
        }
        getValueAndCollectDependencies(requireCollect = false) {
            const dynamicDependencies = !this.overrides.static || requireCollect;
            if (dynamicDependencies) {
                this.unsubscribeAllDependencies();
                this.isCollecting = true;
            }
            this.value = this.instance[this.propertyName]; // triggers observer collection
            if (dynamicDependencies) {
                this.isCollecting = false;
                this.dependencies.forEach(x => x.subscribe(this));
            }
            return this.value;
        }
        onSubscriberRemoved() {
            this.subscriberCount--;
            if (this.subscriberCount === 0) {
                this.unsubscribeAllDependencies();
            }
        }
        handleChange() {
            this.changeSet.add(this.owner);
        }
        unsubscribeAllDependencies() {
            this.dependencies.forEach(x => x.unsubscribe(this));
            this.dependencies.length = 0;
        }
    }
    function createGetterTraps(observerLocator, controller) {
        return {
            get: function (instance, key) {
                const value = instance[key];
                if (key === '$observers' || typeof value === 'function' || !controller.isCollecting) {
                    return value;
                }
                // TODO: fix this
                if (instance instanceof Array) {
                    controller.addDependency(observerLocator.getArrayObserver(instance));
                    if (key === 'length') {
                        controller.addDependency(observerLocator.getArrayObserver(instance).getLengthObserver());
                    }
                }
                else if (instance instanceof Map) {
                    controller.addDependency(observerLocator.getMapObserver(instance));
                    if (key === 'size') {
                        controller.addDependency(observerLocator.getMapObserver(instance).getLengthObserver());
                    }
                }
                else if (instance instanceof Set) {
                    controller.addDependency(observerLocator.getSetObserver(instance));
                    if (key === 'size') {
                        return observerLocator.getSetObserver(instance).getLengthObserver();
                    }
                }
                else {
                    controller.addDependency(observerLocator.getObserver(instance, key));
                }
                return proxyOrValue(observerLocator, controller, value);
            }
        };
    }
    function proxyOrValue(observerLocator, controller, value) {
        if (!(value instanceof Object)) {
            return value;
        }
        return new Proxy(value, createGetterTraps(observerLocator, controller));
    }

    const defineProperty = Reflect.defineProperty;
    // note: we're reusing the same object for setting all descriptors, just changing some properties as needed
    //   this works, because the properties are copied by defineProperty (so changing them afterwards doesn't affect existing descriptors)
    // see also: https://tc39.github.io/ecma262/#sec-topropertydescriptor
    const observedPropertyDescriptor = {
        get: undefined,
        set: undefined,
        enumerable: true,
        configurable: true
    };
    function subscribe(subscriber) {
        if (this.observing === false) {
            this.observing = true;
            // tslint:disable-next-line:no-this-assignment
            const { obj, propertyKey } = this;
            this.currentValue = obj[propertyKey];
            observedPropertyDescriptor.get = () => this.getValue();
            observedPropertyDescriptor.set = value => this.setValue(value, exports.BindingFlags.updateTargetInstance);
            if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
                kernel.Reporter.write(1, propertyKey, obj);
            }
        }
        this.addSubscriber(subscriber);
    }
    function dispose$2() {
        delete this.obj[this.propertyKey];
        this.obj = null;
        this.propertyKey = null;
        this.currentValue = null;
    }
    function propertyObserver() {
        return function (target) {
            subscriberCollection(exports.MutationKind.instance)(target);
            const proto = target.prototype;
            proto.observing = false;
            proto.obj = null;
            proto.propertyKey = null;
            proto.currentValue = null;
            proto.subscribe = proto.subscribe || subscribe;
            proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
            proto.dispose = proto.dispose || dispose$2;
        };
    }

    const IDirtyChecker = kernel.DI.createInterface()
        .withDefault(x => x.singleton(DirtyChecker));
    /*@internal*/
    class DirtyChecker {
        constructor() {
            this.tracked = [];
            this.checkDelay = 120;
        }
        createProperty(obj, propertyName) {
            return new exports.DirtyCheckProperty(this, obj, propertyName);
        }
        addProperty(property) {
            const tracked = this.tracked;
            tracked.push(property);
            if (tracked.length === 1) {
                this.scheduleDirtyCheck();
            }
        }
        removeProperty(property) {
            const tracked = this.tracked;
            tracked.splice(tracked.indexOf(property), 1);
        }
        scheduleDirtyCheck() {
            setTimeout(() => this.check(), this.checkDelay);
        }
        check() {
            const tracked = this.tracked;
            let i = tracked.length;
            while (i--) {
                const current = tracked[i];
                if (current.isDirty()) {
                    current.flushChanges();
                }
            }
            if (tracked.length) {
                this.scheduleDirtyCheck();
            }
        }
    }
    /*@internal*/
    exports.DirtyCheckProperty = class DirtyCheckProperty {
        constructor(dirtyChecker, obj, propertyKey) {
            this.dirtyChecker = dirtyChecker;
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        isDirty() {
            return this.oldValue !== this.obj[this.propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        flushChanges() {
            const oldValue = this.oldValue;
            const newValue = this.getValue();
            this.callSubscribers(newValue, oldValue, exports.BindingFlags.updateTargetInstance | exports.BindingFlags.fromFlushChanges);
            this.oldValue = newValue;
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
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
        propertyObserver()
    ], exports.DirtyCheckProperty);

    const inputValueDefaults = {
        ['button']: '',
        ['checkbox']: 'on',
        ['color']: '#000000',
        ['date']: '',
        ['datetime-local']: '',
        ['email']: '',
        ['file']: '',
        ['hidden']: '',
        ['image']: '',
        ['month']: '',
        ['number']: '',
        ['password']: '',
        ['radio']: 'on',
        ['range']: '50',
        ['reset']: '',
        ['search']: '',
        ['submit']: '',
        ['tel']: '',
        ['text']: '',
        ['time']: '',
        ['url']: '',
        ['week']: ''
    };
    const handleEventFlags = exports.BindingFlags.fromDOMEvent | exports.BindingFlags.updateSourceExpression;
    exports.ValueAttributeObserver = class ValueAttributeObserver {
        constructor(changeSet, obj, propertyKey, handler) {
            // note: input.files can be assigned and this was fixed in Firefox 57:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1384030
            this.changeSet = changeSet;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.handler = handler;
            // input.value (for type='file') however, can only be assigned an empty string
            if (propertyKey === 'value') {
                const nodeType = obj['type'];
                this.defaultValue = inputValueDefaults[nodeType || 'text'];
                if (nodeType === 'file') {
                    this.flushChanges = this.flushFileChanges;
                }
            }
            else {
                this.defaultValue = '';
            }
            this.oldValue = this.currentValue = obj[propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(newValue, flags) {
            this.obj[this.propertyKey] = newValue;
            if (flags & exports.BindingFlags.fromBind) {
                return;
            }
            this.callSubscribers(this.currentValue, this.oldValue, flags);
        }
        handleEvent() {
            const oldValue = this.oldValue = this.currentValue;
            const newValue = this.currentValue = this.getValue();
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, handleEventFlags);
                this.oldValue = newValue;
            }
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        flushFileChanges() {
            const currentValue = this.currentValue;
            if (this.oldValue !== currentValue) {
                if (currentValue === '') {
                    this.setValueCore(currentValue, this.currentFlags);
                    this.oldValue = this.currentValue;
                }
            }
        }
    };
    exports.ValueAttributeObserver = __decorate([
        targetObserver('')
    ], exports.ValueAttributeObserver);
    exports.ValueAttributeObserver.prototype.propertyKey = '';
    exports.ValueAttributeObserver.prototype.handler = null;
    const defaultHandleBatchedChangeFlags = exports.BindingFlags.fromFlushChanges | exports.BindingFlags.updateTargetInstance;
    exports.CheckedObserver = class CheckedObserver {
        constructor(changeSet, obj, handler, observerLocator) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.handler = handler;
            this.observerLocator = observerLocator;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue, flags) {
            if (!this.valueObserver) {
                this.valueObserver = this.obj['$observers'] && (this.obj['$observers'].model || this.obj['$observers'].value);
                if (this.valueObserver) {
                    this.valueObserver.subscribe(this);
                }
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (this.obj.type === 'checkbox' && Array.isArray(newValue)) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribeBatched(this);
            }
            this.synchronizeElement();
        }
        // handleBatchedCollectionChange (todo: rename to make this explicit?)
        handleBatchedChange() {
            this.synchronizeElement();
            this.notify(defaultHandleBatchedChangeFlags);
        }
        // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
        handleChange(newValue, previousValue, flags) {
            this.synchronizeElement();
            this.notify(flags);
        }
        synchronizeElement() {
            const value = this.currentValue;
            const element = this.obj;
            const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            const isRadio = element.type === 'radio';
            const matcher = element['matcher'] || ((a, b) => a === b);
            if (isRadio) {
                element.checked = !!matcher(value, elementValue);
            }
            else if (value === true) {
                element.checked = true;
            }
            else if (Array.isArray(value)) {
                element.checked = value.findIndex(item => !!matcher(item, elementValue)) !== -1;
            }
            else {
                element.checked = false;
            }
        }
        notify(flags) {
            if (flags & exports.BindingFlags.fromBind) {
                return;
            }
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            if (newValue === oldValue) {
                return;
            }
            this.callSubscribers(this.currentValue, this.oldValue, flags);
        }
        handleEvent() {
            let value = this.currentValue;
            const element = this.obj;
            const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            let index;
            const matcher = element['matcher'] || ((a, b) => a === b);
            if (element.type === 'checkbox') {
                if (Array.isArray(value)) {
                    index = value.findIndex(item => !!matcher(item, elementValue));
                    if (element.checked && index === -1) {
                        value.push(elementValue);
                    }
                    else if (!element.checked && index !== -1) {
                        value.splice(index, 1);
                    }
                    return;
                }
                value = element.checked;
            }
            else if (element.checked) {
                value = elementValue;
            }
            else {
                return;
            }
            this.oldValue = this.currentValue;
            this.currentValue = value;
            this.notify(handleEventFlags);
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        unbind() {
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (this.valueObserver) {
                this.valueObserver.unsubscribe(this);
            }
        }
    };
    exports.CheckedObserver = __decorate([
        targetObserver()
    ], exports.CheckedObserver);
    exports.CheckedObserver.prototype.handler = null;
    exports.CheckedObserver.prototype.observerLocator = null;
    const childObserverOptions = {
        childList: true,
        subtree: true,
        characterData: true
    };
    function defaultMatcher(a, b) {
        return a === b;
    }
    exports.SelectValueObserver = class SelectValueObserver {
        constructor(changeSet, obj, handler, observerLocator) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.handler = handler;
            this.observerLocator = observerLocator;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue, flags) {
            const isArray = Array.isArray(newValue);
            if (!isArray && newValue !== null && newValue !== undefined && this.obj.multiple) {
                throw new Error('Only null or Array instances can be bound to a multi-select.');
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (isArray) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribeBatched(this);
            }
            this.synchronizeOptions();
            this.notify(flags);
        }
        // called when the array mutated (items sorted/added/removed, etc)
        handleBatchedChange(indexMap) {
            // we don't need to go through the normal setValue logic and can directly call synchronizeOptions here,
            // because the change already waited one tick (batched) and there's no point in calling notify when the instance didn't change
            this.synchronizeOptions(indexMap);
        }
        // called when a different value was assigned
        handleChange(newValue, previousValue, flags) {
            this.setValue(newValue, flags);
        }
        notify(flags) {
            if (flags & exports.BindingFlags.fromBind) {
                return;
            }
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            if (newValue === oldValue) {
                return;
            }
            this.callSubscribers(newValue, oldValue, flags);
        }
        handleEvent() {
            // "from-view" changes are always synchronous now, so immediately sync the value and notify subscribers
            this.synchronizeValue();
            // TODO: need to clean up / improve the way collection changes are handled here (we currently just create and assign a new array to the source each change)
            this.notify(handleEventFlags);
        }
        synchronizeOptions(indexMap) {
            const currentValue = this.currentValue;
            const isArray = Array.isArray(currentValue);
            const obj = this.obj;
            const matcher = obj.matcher || defaultMatcher;
            const options = obj.options;
            let i = options.length;
            while (i--) {
                const option = options.item(i);
                const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
                if (isArray) {
                    option.selected = currentValue.findIndex(item => !!matcher(optionValue, item)) !== -1;
                    continue;
                }
                option.selected = !!matcher(optionValue, currentValue);
            }
        }
        synchronizeValue() {
            const obj = this.obj;
            const options = obj.options;
            const len = options.length;
            this.oldValue = this.currentValue;
            if (obj.multiple) {
                // multi select
                let i = 0;
                const newValue = [];
                while (i < len) {
                    const option = options.item(i);
                    if (option.selected) {
                        const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
                        newValue.push(optionValue);
                    }
                    i++;
                }
                this.currentValue = newValue;
            }
            else {
                // single select
                let i = 0;
                while (i < len) {
                    const option = options.item(i);
                    if (option.selected) {
                        const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
                        this.currentValue = optionValue;
                        return;
                    }
                    i++;
                }
            }
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        bind() {
            this.nodeObserver = DOM.createNodeObserver(this.obj, () => {
                this.synchronizeOptions();
                this.synchronizeValue();
            }, childObserverOptions);
        }
        unbind() {
            this.nodeObserver.disconnect();
            this.nodeObserver = null;
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
        }
    };
    exports.SelectValueObserver = __decorate([
        targetObserver()
    ], exports.SelectValueObserver);
    exports.SelectValueObserver.prototype.handler = null;
    exports.SelectValueObserver.prototype.observerLocator = null;

    const proto$2 = Map.prototype;
    const nativeSet = proto$2.set; // TODO: probably want to make these internal again
    const nativeClear$1 = proto$2.clear;
    const nativeDelete$1 = proto$2.delete;
    // note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, map/delete/clear are easy to reconstruct for the indexMap
    // https://tc39.github.io/ecma262/#sec-map.prototype.map
    function observeSet(key, value) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeSet.call(this, key, value);
        }
        const oldSize = this.size;
        nativeSet.call(this, key, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            let i = 0;
            for (const entry of this.entries()) {
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
        o.callSubscribers('set', arguments, exports.BindingFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-map.prototype.clear
    function observeClear$1() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeClear$1.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            for (const entry of this.keys()) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, entry);
                }
                i++;
            }
            nativeClear$1.call(this);
            indexMap.length = 0;
            o.callSubscribers('clear', arguments, exports.BindingFlags.isCollectionMutation);
        }
        return undefined;
    }
    // https://tc39.github.io/ecma262/#sec-map.prototype.delete
    function observeDelete$1(value) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeDelete$1.call(this, value);
        }
        const size = this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, entry);
                }
                nativeSplice.call(indexMap, i, 1);
                return nativeDelete$1.call(this, value);
            }
            i++;
        }
        o.callSubscribers('delete', arguments, exports.BindingFlags.isCollectionMutation);
        return false;
    }
    for (const observe of [observeSet, observeClear$1, observeDelete$1]) {
        Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableMapObservation() {
        if (proto$2.set['observing'] !== true)
            proto$2.set = observeSet;
        if (proto$2.clear['observing'] !== true)
            proto$2.clear = observeClear$1;
        if (proto$2.delete['observing'] !== true)
            proto$2.delete = observeDelete$1;
    }
    enableMapObservation();
    function disableMapObservation() {
        if (proto$2.set['observing'] === true)
            proto$2.set = nativeSet;
        if (proto$2.clear['observing'] === true)
            proto$2.clear = nativeClear$1;
        if (proto$2.delete['observing'] === true)
            proto$2.delete = nativeDelete$1;
    }
    exports.MapObserver = class MapObserver {
        constructor(changeSet, map) {
            this.changeSet = changeSet;
            map.$observer = this;
            this.collection = map;
            this.resetIndexMap();
        }
    };
    exports.MapObserver = __decorate([
        collectionObserver(6 /* map */)
    ], exports.MapObserver);
    function getMapObserver(changeSet, map) {
        return map.$observer || new exports.MapObserver(changeSet, map);
    }

    const noop = kernel.PLATFORM.noop;
    // note: string.length is the only property of any primitive that is not a function,
    // so we can hardwire it to that and simply return undefined for anything else
    // note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
    class PrimitiveObserver {
        constructor(obj, propertyKey) {
            this.doNotCache = true;
            // we don't need to store propertyName because only 'length' can return a useful value
            if (propertyKey === 'length') {
                // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
                this.obj = obj;
                this.getValue = this.getStringLength;
            }
            else {
                this.getValue = this.returnUndefined;
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
    exports.SetterObserver = class SetterObserver {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            const currentValue = this.currentValue;
            if (currentValue !== newValue) {
                this.currentValue = newValue;
                if (!(flags & exports.BindingFlags.fromBind)) {
                    this.callSubscribers(newValue, currentValue, flags);
                }
            }
        }
    };
    exports.SetterObserver = __decorate([
        propertyObserver()
    ], exports.SetterObserver);
    exports.Observer = class Observer {
        constructor(instance, propertyName, callbackName) {
            this.obj = instance;
            this.propertyKey = propertyName;
            this.currentValue = instance[propertyName];
            this.callback = callbackName in instance
                ? instance[callbackName].bind(instance)
                : noop;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            const currentValue = this.currentValue;
            if (currentValue !== newValue) {
                this.currentValue = newValue;
                if (!(flags & exports.BindingFlags.fromBind)) {
                    const coercedValue = this.callback(newValue, currentValue);
                    if (coercedValue !== undefined) {
                        this.currentValue = newValue = coercedValue;
                    }
                    this.callSubscribers(newValue, currentValue, flags);
                }
            }
        }
    };
    exports.Observer = __decorate([
        propertyObserver()
    ], exports.Observer);

    const ISVGAnalyzer = kernel.DI.createInterface()
        .withDefault(x => x.singleton(class {
        isStandardSvgAttribute(node, attributeName) {
            return false;
        }
    }));

    const toStringTag = Object.prototype.toString;
    const IObserverLocator = kernel.DI.createInterface()
        .withDefault(x => x.singleton(exports.ObserverLocator));
    function getPropertyDescriptor(subject, name) {
        let pd = Object.getOwnPropertyDescriptor(subject, name);
        let proto = Object.getPrototypeOf(subject);
        while (pd === undefined && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
        }
        return pd;
    }
    exports.ObserverLocator = 
    /*@internal*/
    class ObserverLocator {
        constructor(changeSet, eventManager, dirtyChecker, svgAnalyzer) {
            this.changeSet = changeSet;
            this.eventManager = eventManager;
            this.dirtyChecker = dirtyChecker;
            this.svgAnalyzer = svgAnalyzer;
            this.adapters = [];
        }
        getObserver(obj, propertyName) {
            let observersLookup = obj.$observers;
            let observer;
            if (observersLookup && propertyName in observersLookup) {
                return observersLookup[propertyName];
            }
            observer = this.createPropertyObserver(obj, propertyName);
            if (!observer.doNotCache) {
                if (observersLookup === undefined) {
                    observersLookup = this.getOrCreateObserversLookup(obj);
                }
                observersLookup[propertyName] = observer;
            }
            return observer;
        }
        addAdapter(adapter) {
            this.adapters.push(adapter);
        }
        getAccessor(obj, propertyName) {
            if (DOM.isNodeInstance(obj)) {
                const tagName = obj['tagName'];
                if (propertyName === 'class' || propertyName === 'style' || propertyName === 'css'
                    || propertyName === 'value' && (tagName === 'INPUT' || tagName === 'SELECT')
                    || propertyName === 'checked' && tagName === 'INPUT'
                    || propertyName === 'model' && tagName === 'INPUT'
                    || /^xlink:.+$/.exec(propertyName)) {
                    return this.getObserver(obj, propertyName);
                }
                if (/^\w+:|^data-|^aria-/.test(propertyName)
                    || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)
                    || tagName === 'IMG' && propertyName === 'src'
                    || tagName === 'A' && propertyName === 'href') {
                    return new exports.DataAttributeAccessor(this.changeSet, obj, propertyName);
                }
            }
            return new exports.PropertyAccessor(this.changeSet, obj, propertyName);
        }
        getArrayObserver(array) {
            return getArrayObserver(this.changeSet, array);
        }
        getMapObserver(map) {
            return getMapObserver(this.changeSet, map);
        }
        // tslint:disable-next-line:no-reserved-keywords
        getSetObserver(set) {
            return getSetObserver(this.changeSet, set);
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
        getAdapterObserver(obj, propertyName, descriptor) {
            for (let i = 0, ii = this.adapters.length; i < ii; i++) {
                const adapter = this.adapters[i];
                const observer = adapter.getObserver(obj, propertyName, descriptor);
                if (observer) {
                    return observer;
                }
            }
            return null;
        }
        createPropertyObserver(obj, propertyName) {
            if (!(obj instanceof Object)) {
                return new PrimitiveObserver(obj, propertyName);
            }
            if (DOM.isNodeInstance(obj)) {
                if (propertyName === 'class') {
                    return new exports.ClassAttributeAccessor(this.changeSet, obj);
                }
                if (propertyName === 'style' || propertyName === 'css') {
                    return new exports.StyleAttributeAccessor(this.changeSet, obj);
                }
                const tagName = obj['tagName'];
                const handler = this.eventManager.getElementHandler(obj, propertyName);
                if (propertyName === 'value' && tagName === 'SELECT') {
                    return new exports.SelectValueObserver(this.changeSet, obj, handler, this);
                }
                if (propertyName === 'checked' && tagName === 'INPUT') {
                    return new exports.CheckedObserver(this.changeSet, obj, handler, this);
                }
                if (handler) {
                    return new exports.ValueAttributeObserver(this.changeSet, obj, propertyName, handler);
                }
                const xlinkResult = /^xlink:(.+)$/.exec(propertyName);
                if (xlinkResult) {
                    return new exports.XLinkAttributeAccessor(this.changeSet, obj, propertyName, xlinkResult[1]);
                }
                if (propertyName === 'role'
                    || /^\w+:|^data-|^aria-/.test(propertyName)
                    || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
                    return new exports.DataAttributeAccessor(this.changeSet, obj, propertyName);
                }
            }
            const tag = toStringTag.call(obj);
            switch (tag) {
                case '[object Array]':
                    if (propertyName === 'length') {
                        return this.getArrayObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Map]':
                    if (propertyName === 'size') {
                        return this.getMapObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Set]':
                    if (propertyName === 'size') {
                        return this.getSetObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
            }
            const descriptor = getPropertyDescriptor(obj, propertyName);
            if (descriptor) {
                if (descriptor.get || descriptor.set) {
                    if (descriptor.get && descriptor.get.getObserver) {
                        return descriptor.get.getObserver(obj);
                    }
                    // attempt to use an adapter before resorting to dirty checking.
                    const adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
                    if (adapterObserver) {
                        return adapterObserver;
                    }
                    return createComputedObserver(this, this.dirtyChecker, this.changeSet, obj, propertyName, descriptor);
                }
            }
            return new exports.SetterObserver(obj, propertyName);
        }
    };
    exports.ObserverLocator = __decorate([
        kernel.inject(IChangeSet, IEventManager, IDirtyChecker, ISVGAnalyzer)
        /*@internal*/
    ], exports.ObserverLocator);

    exports.UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
        constructor(observerLocator) {
            this.observerLocator = observerLocator;
        }
        bind(flags, scope, binding, ...events) {
            if (events.length === 0) {
                throw kernel.Reporter.error(9);
            }
            if (binding.mode !== exports.BindingMode.twoWay && binding.mode !== exports.BindingMode.fromView) {
                throw kernel.Reporter.error(10);
            }
            // ensure the binding's target observer has been set.
            const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty);
            if (!targetObserver.handler) {
                throw kernel.Reporter.error(10);
            }
            binding.targetObserver = targetObserver;
            // stash the original element subscribe function.
            targetObserver.originalHandler = binding.targetObserver.handler;
            // replace the element subscribe function with one that uses the correct events.
            targetObserver.handler = new EventSubscriber(events);
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            binding.targetObserver.handler.dispose();
            binding.targetObserver.handler = binding.targetObserver.originalHandler;
            binding.targetObserver.originalHandler = null;
        }
    };
    exports.UpdateTriggerBindingBehavior = __decorate([
        bindingBehavior('updateTrigger'),
        kernel.inject(IObserverLocator)
    ], exports.UpdateTriggerBindingBehavior);

    const BindingContext = {
        createScope(bindingContext, overrideContext) {
            return {
                bindingContext: bindingContext,
                overrideContext: overrideContext || BindingContext.createOverride()
            };
        },
        createScopeFromOverride(overrideContext) {
            return {
                bindingContext: overrideContext.bindingContext,
                overrideContext
            };
        },
        createScopeFromParent(parentScope, bindingContext) {
            return {
                bindingContext: bindingContext,
                overrideContext: BindingContext.createOverride(bindingContext, parentScope.overrideContext)
            };
        },
        createOverride(bindingContext, parentOverrideContext) {
            return {
                bindingContext: bindingContext,
                parentOverrideContext: parentOverrideContext || null
            };
        },
        get(scope, name, ancestor) {
            let overrideContext = scope.overrideContext;
            if (ancestor) {
                // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
                while (ancestor && overrideContext) {
                    ancestor--;
                    overrideContext = overrideContext.parentOverrideContext;
                }
                if (ancestor || !overrideContext) {
                    return undefined;
                }
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // traverse the context and it's ancestors, searching for a context that has the name.
            while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
                overrideContext = overrideContext.parentOverrideContext;
            }
            if (overrideContext) {
                // we located a context with the property.  return it.
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // the name wasn't found.  return the root binding context.
            return scope.bindingContext || scope.overrideContext;
        }
    };

    class BindingBehavior {
        constructor(expression, name, args) {
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.behaviorKey = BindingBehaviorResource.keyFrom(this.name);
            if (expression.expression) {
                this.expressionHasBind = !!expression.bind;
                this.expressionHasUnbind = !!expression.unbind;
            }
            else {
                this.expressionHasBind = false;
                this.expressionHasUnbind = false;
            }
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
            if (this.expressionHasBind) {
                this.expression.bind(flags, scope, binding);
            }
            const behaviorKey = this.behaviorKey;
            const locator = binding.locator;
            const behavior = locator.get(behaviorKey);
            if (!behavior) {
                throw new Error(`No BindingBehavior named "${this.name}" was found!`);
            }
            if (binding[behaviorKey]) {
                throw new Error(`A binding behavior named "${this.name}" has already been applied to "${this.expression}"`);
            }
            binding[behaviorKey] = behavior;
            behavior.bind.apply(behavior, [flags, scope, binding].concat(evalList(flags, scope, locator, this.args)));
        }
        unbind(flags, scope, binding) {
            const behaviorKey = this.behaviorKey;
            binding[behaviorKey].unbind(flags, scope, binding);
            binding[behaviorKey] = null;
            if (this.expressionHasUnbind) {
                this.expression.unbind(flags, scope, binding);
            }
        }
    }
    class ValueConverter {
        constructor(expression, name, args) {
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.converterKey = ValueConverterResource.keyFrom(this.name);
        }
        evaluate(flags, scope, locator) {
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw new Error(`No ValueConverter named "${this.name}" was found!`);
            }
            if ('toView' in converter) {
                const args = this.args;
                const len = args.length;
                const result = Array(len + 1);
                result[0] = this.expression.evaluate(flags, scope, locator);
                for (let i = 0; i < len; ++i) {
                    result[i + 1] = args[i].evaluate(flags, scope, locator);
                }
                return converter.toView.apply(converter, result);
            }
            return this.expression.evaluate(flags, scope, locator);
        }
        assign(flags, scope, locator, value) {
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw new Error(`No ValueConverter named "${this.name}" was found!`);
            }
            if ('fromView' in converter) {
                value = converter.fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
            }
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
            const locator = binding.locator;
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw new Error(`No ValueConverter named "${this.name}" was found!`);
            }
            const signals = converter.signals;
            if (signals === undefined) {
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
            if (signals === undefined) {
                return;
            }
            const signaler = locator.get(ISignaler);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
                signaler.removeSignalListener(signals[i], binding);
            }
        }
    }
    class Assign {
        constructor(target, value) {
            this.target = target;
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator));
        }
        connect(flags, scope, binding) { }
        assign(flags, scope, locator, value) {
            this.value.assign(flags, scope, locator, value);
            this.target.assign(flags, scope, locator, value);
        }
    }
    class Conditional {
        constructor(condition, yes, no) {
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
    }
    class AccessThis {
        constructor(ancestor = 0) {
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            let oc = scope.overrideContext;
            let i = this.ancestor;
            while (i-- && oc) {
                oc = oc.parentOverrideContext;
            }
            return i < 1 && oc ? oc.bindingContext : undefined;
        }
        connect(flags, scope, binding) { }
    }
    class AccessScope {
        constructor(name, ancestor = 0) {
            this.name = name;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            const name = this.name;
            return BindingContext.get(scope, name, this.ancestor)[name];
        }
        assign(flags, scope, locator, value) {
            const name = this.name;
            const context = BindingContext.get(scope, name, this.ancestor);
            return context ? (context[name] = value) : undefined;
        }
        connect(flags, scope, binding) {
            const name = this.name;
            const context = BindingContext.get(scope, name, this.ancestor);
            binding.observeProperty(context, name);
        }
    }
    class AccessMember {
        constructor(object, name) {
            this.object = object;
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            return instance === null || instance === undefined ? instance : instance[this.name];
        }
        assign(flags, scope, locator, value) {
            let instance = this.object.evaluate(flags, scope, locator);
            if (instance === null || typeof instance !== 'object') {
                instance = {};
                this.object.assign(flags, scope, locator, instance);
            }
            instance[this.name] = value;
            return value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (obj) {
                binding.observeProperty(obj, this.name);
            }
        }
    }
    class AccessKeyed {
        constructor(object, key) {
            this.object = object;
            this.key = key;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            if (instance === null || instance === undefined) {
                return undefined;
            }
            const key = this.key.evaluate(flags, scope, locator);
            // note: getKeyed and setKeyed are removed because they are identical to the default spec behavior
            // and the runtime does this this faster
            return instance[key];
        }
        assign(flags, scope, locator, value) {
            const instance = this.object.evaluate(flags, scope, locator);
            const key = this.key.evaluate(flags, scope, locator);
            return instance[key] = value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (typeof obj === 'object' && obj !== null) {
                this.key.connect(flags, scope, binding);
                const key = this.key.evaluate(flags, scope, null);
                // observe the property represented by the key as long as it's not an array indexer
                // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
                if (!(Array.isArray(obj) && isNumeric(key))) {
                    binding.observeProperty(obj, key);
                }
            }
        }
    }
    class CallScope {
        constructor(name, args, ancestor = 0) {
            this.name = name;
            this.args = args;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            const args = evalList(flags, scope, locator, this.args);
            const context = BindingContext.get(scope, this.name, this.ancestor);
            const func = getFunction(flags, context, this.name);
            if (func) {
                return func.apply(context, args);
            }
            return undefined;
        }
        connect(flags, scope, binding) {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
        }
    }
    class CallMember {
        constructor(object, name, args) {
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
            return undefined;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (getFunction(flags & ~exports.BindingFlags.mustEvaluate, obj, this.name)) {
                const args = this.args;
                for (let i = 0, ii = args.length; i < ii; ++i) {
                    args[i].connect(flags, scope, binding);
                }
            }
        }
    }
    class CallFunction {
        constructor(func, args) {
            this.func = func;
            this.args = args;
        }
        evaluate(flags, scope, locator) {
            const func = this.func.evaluate(flags, scope, locator);
            if (typeof func === 'function') {
                return func.apply(null, evalList(flags, scope, locator, this.args));
            }
            if (!(flags & exports.BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
                return undefined;
            }
            throw new Error(`${this.func} is not a function`);
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
    }
    class Binary {
        constructor(operation, left, right) {
            this.operation = operation;
            this.left = left;
            this.right = right;
            // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
            // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
            // work to do; we can do this because the operation can't change after it's parsed
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) { }
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
            if (right !== null && typeof right === 'object') {
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
    }
    class Unary {
        constructor(operation, expression) {
            this.operation = operation;
            this.expression = expression;
            // see Binary (we're doing the same thing here)
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) { }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
        }
        assign(flags, scope, locator, value) {
            throw new Error(`Binding expression "${this}" cannot be assigned to.`);
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
    }
    class PrimitiveLiteral {
        constructor(value) {
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.value;
        }
        connect(flags, scope, binding) {
        }
    }
    class HtmlLiteral {
        constructor(parts) {
            this.parts = parts;
        }
        evaluate(flags, scope, locator) {
            const elements = this.parts;
            let result = '';
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                const value = elements[i].evaluate(flags, scope, locator);
                if (value === undefined || value === null) {
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
    }
    class ArrayLiteral {
        constructor(elements) {
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
    }
    class ObjectLiteral {
        constructor(keys, values) {
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
    }
    class Template {
        constructor(cooked, expressions) {
            this.cooked = cooked;
            this.expressions = expressions;
            this.expressions = expressions || [];
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
    }
    class TaggedTemplate {
        constructor(cooked, raw, func, expressions) {
            this.cooked = cooked;
            this.func = func;
            this.expressions = expressions;
            cooked.raw = raw;
            this.expressions = expressions || [];
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
                throw new Error(`${this.func} is not a function`);
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
    }
    class ArrayBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(elements) {
            this.elements = elements;
        }
        evaluate(flags, scope, locator) {
            // TODO
        }
        assign(flags, scope, locator, obj) {
            // TODO
        }
        connect(flags, scope, binding) { }
    }
    class ObjectBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(keys, values) {
            this.keys = keys;
            this.values = values;
        }
        evaluate(flags, scope, locator) {
            // TODO
        }
        assign(flags, scope, locator, obj) {
            // TODO
        }
        connect(flags, scope, binding) { }
    }
    class BindingIdentifier {
        constructor(name) {
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            return this.name;
        }
        connect(flags, scope, binding) { }
    }
    const toStringTag$1 = Object.prototype.toString;
    // https://tc39.github.io/ecma262/#sec-iteration-statements
    // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
    class ForOfStatement {
        constructor(declaration, iterable) {
            this.declaration = declaration;
            this.iterable = iterable;
        }
        evaluate(flags, scope, locator) {
            return this.iterable.evaluate(flags, scope, locator);
        }
        count(result) {
            return CountForOfStatement[toStringTag$1.call(result)](result);
        }
        iterate(result, func) {
            IterateForOfStatement[toStringTag$1.call(result)](result, func);
        }
        connect(flags, scope, binding) {
            this.declaration.connect(flags, scope, binding);
            this.iterable.connect(flags, scope, binding);
        }
    }
    /*
    * Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
    * so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
    * but this class might be a candidate for removal if it turns out it does provide all we need
    */
    class Interpolation {
        constructor(parts, expressions) {
            this.parts = parts;
            this.expressions = expressions;
        }
        evaluate(flags, scope, locator) {
            const expressions = this.expressions;
            const parts = this.parts;
            let result = parts[0];
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                result += expressions[i].evaluate(flags, scope, locator);
                result += parts[i + 1];
            }
            return result;
        }
        connect(flags, scope, binding) {
            const expressions = this.expressions;
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                expressions[i].connect(flags, scope, binding);
            }
        }
    }
    /*
    * Note: for a property that is always the same, directly assigning it to the prototype is more efficient CPU wise
    * (gets assigned once, instead of per constructor call) as well as memory wise (stored once, instead of per instance)
    *
    * This gives us a cheap way to add some extra information to the AST for the runtime to do things more efficiently.
    */
    BindingBehavior.prototype.$kind = 530 /* BindingBehavior */;
    ValueConverter.prototype.$kind = 529 /* ValueConverter */;
    Assign.prototype.$kind = 272 /* Assign */;
    Conditional.prototype.$kind = 287 /* Conditional */;
    AccessThis.prototype.$kind = 289 /* AccessThis */;
    AccessScope.prototype.$kind = 418 /* AccessScope */;
    AccessMember.prototype.$kind = 459 /* AccessMember */;
    AccessKeyed.prototype.$kind = 460 /* AccessKeyed */;
    CallScope.prototype.$kind = 328 /* CallScope */;
    CallMember.prototype.$kind = 329 /* CallMember */;
    CallFunction.prototype.$kind = 330 /* CallFunction */;
    Binary.prototype.$kind = 270 /* Binary */;
    Unary.prototype.$kind = 263 /* Unary */;
    PrimitiveLiteral.prototype.$kind = 293 /* PrimitiveLiteral */;
    HtmlLiteral.prototype.$kind = 19 /* HtmlLiteral */;
    ArrayLiteral.prototype.$kind = 291 /* ArrayLiteral */;
    ObjectLiteral.prototype.$kind = 292 /* ObjectLiteral */;
    Template.prototype.$kind = 294 /* Template */;
    TaggedTemplate.prototype.$kind = 333 /* TaggedTemplate */;
    ArrayBindingPattern.prototype.$kind = 6164 /* ArrayBindingPattern */;
    ObjectBindingPattern.prototype.$kind = 6165 /* ObjectBindingPattern */;
    BindingIdentifier.prototype.$kind = 4118 /* BindingIdentifier */;
    ForOfStatement.prototype.$kind = 1047 /* ForOfStatement */;
    Interpolation.prototype.$kind = 280 /* Interpolation */;
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
        const func = obj === null || obj === undefined ? null : obj[name];
        if (typeof func === 'function') {
            return func;
        }
        if (!(flags & exports.BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
            return null;
        }
        throw new Error(`${name} is not a function`);
    }
    function isNumeric(value) {
        // tslint:disable-next-line:no-reserved-keywords
        const type = typeof value;
        if (type === 'number')
            return true;
        if (type !== 'string')
            return false;
        const len = value.length;
        if (len === 0)
            return false;
        for (let i = 0; i < len; ++i) {
            const char = value.charCodeAt(i);
            if (char < 0x30 /*0*/ || char > 0x39 /*9*/) {
                return false;
            }
        }
        return true;
    }
    /*@internal*/
    const IterateForOfStatement = {
        ['[object Array]'](result, func) {
            for (let i = 0, ii = result.length; i < ii; ++i) {
                func(result, i, result[i]);
            }
        },
        ['[object Map]'](result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const entry of result.entries()) {
                arr[++i] = entry;
            }
            IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Set]'](result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const key of result.keys()) {
                arr[++i] = key;
            }
            IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Number]'](result, func) {
            const arr = Array(result);
            for (let i = 0; i < result; ++i) {
                arr[i] = i;
            }
            IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Null]'](result, func) { },
        ['[object Undefined]'](result, func) { }
    };
    /*@internal*/
    const CountForOfStatement = {
        ['[object Array]'](result) { return result.length; },
        ['[object Map]'](result) { return result.size; },
        ['[object Set]'](result) { return result.size; },
        ['[object Number]'](result) { return result; },
        ['[object Null]'](result) { return 0; },
        ['[object Undefined]'](result) { return 0; }
    };

    class Call {
        constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.locator = locator;
            this.$isBound = false;
            this.targetObserver = observerLocator.getObserver(target, targetProperty);
        }
        callSource($event) {
            let overrideContext = this.$scope.overrideContext;
            Object.assign(overrideContext, $event);
            overrideContext.$event = $event; // deprecate this?
            let result = this.sourceExpression.evaluate(exports.BindingFlags.mustEvaluate, this.$scope, this.locator);
            delete overrideContext.$event;
            for (let prop in $event) {
                delete overrideContext[prop];
            }
            return result;
        }
        $bind(flags, scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$isBound = true;
            this.$scope = scope;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(flags, scope, this);
            }
            this.targetObserver.setValue($event => this.callSource($event), flags);
        }
        $unbind(flags) {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.targetObserver.setValue(null, flags);
        }
        observeProperty() { }
    }

    const IExpressionParser = kernel.DI.createInterface()
        .withDefault(x => x.singleton(ExpressionParser));
    /*@internal*/
    class ExpressionParser {
        constructor() {
            this.lookup = Object.create(null);
            // we use a separate cache for storing plain attribute values (attributes without a binding command)
            // that were not found to be valid interpolations, to prevent the parser from trying to find
            // interpolations repeatedly in the same attribute values
            this.nonInterpolationLookup = Object.create(null);
        }
        parse(expression, bindingType) {
            if (bindingType & 2048 /* Interpolation */) {
                if (this.nonInterpolationLookup[expression] === null) {
                    return null;
                }
                let found = this.lookup[expression];
                if (found === undefined) {
                    found = this.parseCore(expression, bindingType);
                    if (found === null) {
                        this.nonInterpolationLookup[expression] = null;
                    }
                    else {
                        this.lookup[expression] = found;
                    }
                }
                return found;
            }
            let found = this.lookup[expression];
            if (found === undefined) {
                found = this.parseCore(expression, bindingType);
                this.lookup[expression] = found;
            }
            return found;
        }
        cache(expressions) {
            Object.assign(this.lookup, expressions);
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
                    let currentPart = parts[index];
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

    class Listener {
        constructor(targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
            this.targetEvent = targetEvent;
            this.delegationStrategy = delegationStrategy;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.preventDefault = preventDefault;
            this.eventManager = eventManager;
            this.locator = locator;
            this.$isBound = false;
        }
        callSource(event) {
            const overrideContext = this.source.overrideContext;
            overrideContext['$event'] = event;
            const result = this.sourceExpression.evaluate(exports.BindingFlags.mustEvaluate, this.source, this.locator);
            delete overrideContext['$event'];
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            return result;
        }
        handleEvent(event) {
            this.callSource(event);
        }
        $bind(flags, source) {
            if (this.$isBound) {
                if (this.source === source) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$isBound = true;
            this.source = source;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(flags, source, this);
            }
            this.handler = this.eventManager.addEventListener(this.target, this.targetEvent, this, this.delegationStrategy);
        }
        $unbind(flags) {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(flags, this.source, this);
            }
            this.source = null;
            this.handler.dispose();
            this.handler = null;
        }
        // tslint:disable-next-line:no-empty
        observeProperty() { }
    }

    class Ref {
        constructor(sourceExpression, target, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.locator = locator;
            this.$isBound = false;
        }
        $bind(flags, scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$isBound = true;
            this.$scope = scope;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(flags, scope, this);
            }
            this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
        }
        $unbind(flags) {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
                this.sourceExpression.assign(flags, this.$scope, this.locator, null);
            }
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(flags, this.$scope, null);
            }
            this.$scope = null;
        }
        observeProperty(context, name) { }
    }

    /**
     * Decorator: Specifies custom behavior for a bindable property.
     * @param configOrTarget The overrides.
     */
    function bindable(configOrTarget, key, descriptor) {
        let deco = function (target, key2, descriptor2) {
            target = target.constructor;
            let bindables = target.bindables || (target.bindables = {});
            let config = configOrTarget || {};
            if (!config.attribute) {
                config.attribute = kernel.PLATFORM.kebabCase(key2);
            }
            if (!config.callback) {
                config.callback = `${key2}Changed`;
            }
            if (!config.mode) {
                config.mode = exports.BindingMode.toView;
            }
            config.property = key2;
            bindables[key2] = config;
        };
        if (key) { //placed on a property without parens
            var target = configOrTarget;
            configOrTarget = null; //ensure that the closure captures the fact that there's actually no config
            return deco(target, key, descriptor);
        }
        return deco;
    }

    // tslint:disable:no-reserved-keywords
    const instructionTypeValues = 'abcdefghij';
    const ITargetedInstruction = kernel.DI.createInterface();
    function isTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && instructionTypeValues.indexOf(type) !== -1;
    }

    function createElement(tagOrType, props, children) {
        if (typeof tagOrType === 'string') {
            return createElementForTag(tagOrType, props, children);
        }
        else {
            return createElementForType(tagOrType, props, children);
        }
    }
    class PotentialRenderable {
        constructor(node, instructions, dependencies) {
            this.node = node;
            this.instructions = instructions;
            this.dependencies = dependencies;
        }
        get definition() {
            return this.lazyDefinition || (this.lazyDefinition = {
                name: 'unnamed',
                templateOrNode: this.node,
                cache: 0,
                build: {
                    required: false
                },
                dependencies: this.dependencies,
                instructions: this.instructions,
                bindables: {},
                containerless: false,
                hasSlots: false,
                shadowOptions: null,
                surrogates: kernel.PLATFORM.emptyArray
            });
        }
        getElementTemplate(engine, type) {
            return engine.getElementTemplate(this.definition, type);
        }
        createView(engine, parentContext) {
            return this.getViewFactory(engine, parentContext).create();
        }
        getViewFactory(engine, parentContext) {
            return engine.getViewFactory(this.definition, parentContext);
        }
        /*@internal*/
        mergeInto(parent, instructions, dependencies) {
            DOM.appendChild(parent, this.node);
            instructions.push(...this.instructions);
            dependencies.push(...this.dependencies);
        }
    }
    function createElementForTag(tagName, props, children) {
        const instructions = [];
        const allInstructions = [];
        const dependencies = [];
        const element = DOM.createElement(tagName);
        let hasInstructions = false;
        if (props) {
            Object.keys(props)
                .forEach(dest => {
                const value = props[dest];
                if (isTargetedInstruction(value)) {
                    hasInstructions = true;
                    instructions.push(value);
                }
                else {
                    DOM.setAttribute(element, dest, value);
                }
            });
        }
        if (hasInstructions) {
            DOM.setAttribute(element, 'class', 'au');
            allInstructions.push(instructions);
        }
        if (children) {
            addChildren(element, children, allInstructions, dependencies);
        }
        return new PotentialRenderable(element, allInstructions, dependencies);
    }
    function createElementForType(Type, props, children) {
        const tagName = Type.description.name;
        const instructions = [];
        const allInstructions = [instructions];
        const dependencies = [];
        const childInstructions = [];
        const bindables = Type.description.bindables;
        const element = DOM.createElement(tagName);
        DOM.setAttribute(element, 'class', 'au');
        if (!dependencies.includes(Type)) {
            dependencies.push(Type);
        }
        instructions.push({
            type: "i" /* hydrateElement */,
            res: tagName,
            instructions: childInstructions
        });
        if (props) {
            Object.keys(props)
                .forEach(dest => {
                const value = props[dest];
                if (isTargetedInstruction(value)) {
                    childInstructions.push(value);
                }
                else {
                    const bindable = bindables[dest];
                    if (bindable) {
                        childInstructions.push({
                            type: "g" /* setProperty */,
                            dest,
                            value
                        });
                    }
                    else {
                        childInstructions.push({
                            type: "h" /* setAttribute */,
                            dest,
                            value
                        });
                    }
                }
            });
        }
        if (children) {
            addChildren(element, children, allInstructions, dependencies);
        }
        return new PotentialRenderable(element, allInstructions, dependencies);
    }
    function addChildren(parent, children, allInstructions, dependencies) {
        for (let i = 0, ii = children.length; i < ii; ++i) {
            const current = children[i];
            if (typeof current === 'string') {
                DOM.appendChild(parent, DOM.createText(current));
            }
            else if (DOM.isNodeInstance(current)) {
                DOM.appendChild(parent, current);
            }
            else {
                current.mergeInto(parent, allInstructions, dependencies);
            }
        }
    }

    class AttachLifecycle {
        constructor(owner) {
            this.owner = owner;
            this.tail = null;
            this.head = null;
            this.$nextAttached = null;
            this.tail = this.head = this;
        }
        static start(owner, existingLifecycle) {
            return existingLifecycle || new AttachLifecycle(owner);
        }
        queueAttachedCallback(requestor) {
            this.tail.$nextAttached = requestor;
            this.tail = requestor;
        }
        end(owner) {
            if (owner === this.owner) {
                let current = this.head;
                let next;
                while (current) {
                    current.attached();
                    next = current.$nextAttached;
                    current.$nextAttached = null;
                    current = next;
                }
            }
        }
        attached() { }
    }
    const dummyNodeSequence = { remove() { } };
    class DetachLifecycle {
        constructor(owner) {
            this.owner = owner;
            this.detachedHead = null; //LOL
            this.detachedTail = null;
            this.viewRemoveHead = null;
            this.viewRemoveTail = null;
            this.$nextDetached = null;
            this.$nextRemoveView = null;
            this.$nodes = dummyNodeSequence;
            this.detachedTail = this.detachedHead = this;
            this.viewRemoveTail = this.viewRemoveHead = this;
        }
        static start(owner, existingLifecycle) {
            return existingLifecycle || new DetachLifecycle(owner);
        }
        queueViewRemoval(requestor) {
            this.viewRemoveTail.$nextRemoveView = requestor;
            this.viewRemoveTail = requestor;
        }
        queueDetachedCallback(requestor) {
            this.detachedTail.$nextDetached = requestor;
            this.detachedTail = requestor;
        }
        end(owner) {
            if (owner == this.owner) {
                let current = this.detachedHead;
                let next;
                while (current) {
                    current.detached();
                    next = current.$nextDetached;
                    current.$nextDetached = null;
                    current = next;
                }
                let current2 = this.viewRemoveHead;
                let next2;
                while (current2) {
                    current2.$nodes.remove();
                    next2 = current2.$nextRemoveView;
                    current2.$nextRemoveView = null;
                    current2 = next2;
                }
            }
        }
        detached() { }
    }

    const IRenderable = kernel.DI.createInterface().noDefault();
    /*@internal*/
    function addRenderableChild(child, flags) {
        if ('$bind' in child) {
            this.$bindables.push(child);
            if (this.$isBound) {
                child.$bind(flags, this.$scope);
            }
        }
        if ('$attach' in child) {
            this.$attachables.push(child);
            if (this.$isAttached) {
                child.$attach(this.$encapsulationSource);
            }
        }
    }
    /*@internal*/
    function removeRenderableChild(child) {
        const attachableIndex = this.$attachables.indexOf(child);
        if (attachableIndex !== -1) {
            this.$attachables.splice(attachableIndex, 1);
            child.$detach();
        }
        const bindableIndex = this.$bindables.indexOf(child);
        if (bindableIndex !== -1) {
            this.$bindables.splice(bindableIndex, 1);
            child.$unbind(exports.BindingFlags.fromUnbind);
        }
    }

    /**
     * Decorator: Indicates that the decorated class is a custom element.
     */
    function customElement(nameOrSource) {
        return function (target) {
            return CustomElementResource.define(nameOrSource, target);
        };
    }
    const defaultShadowOptions = {
        mode: 'open'
    };
    /**
     * Decorator: Indicates that the custom element should render its view in Shadow
     * DOM.
     */
    function useShadowDOM(targetOrOptions) {
        let options = typeof targetOrOptions === 'function' || !targetOrOptions
            ? defaultShadowOptions
            : targetOrOptions;
        let deco = function (target) {
            target.shadowOptions = options;
            return target;
        };
        return typeof targetOrOptions === 'function' ? deco(targetOrOptions) : deco;
    }
    /**
     * Decorator: Indicates that the custom element should be rendered without its
     * element container.
     */
    function containerless(target) {
        let deco = function (target) {
            target.containerless = true;
            return target;
        };
        return target ? deco(target) : deco;
    }
    const CustomElementResource = {
        name: 'custom-element',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(type) {
            return type.kind === this;
        },
        behaviorFor(node) {
            return node.$customElement || null;
        },
        define(nameOrSource, ctor = null) {
            const Type = ctor === null ? class HTMLOnlyElement {
            } : ctor;
            const description = createCustomElementDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
            const proto = Type.prototype;
            Type.kind = CustomElementResource;
            Type.description = description;
            Type.register = register$2;
            proto.$hydrate = hydrate;
            proto.$bind = bind;
            proto.$attach = attach;
            proto.$detach = detach;
            proto.$unbind = unbind;
            proto.$addChild = addRenderableChild;
            proto.$removeChild = removeRenderableChild;
            return Type;
        }
    };
    function register$2(container) {
        container.register(kernel.Registration.transient(CustomElementResource.keyFrom(this.description.name), this));
    }
    function hydrate(renderingEngine, host, options = kernel.PLATFORM.emptyObject) {
        const Type = this.constructor;
        const description = Type.description;
        this.$bindables = [];
        this.$attachables = [];
        this.$isAttached = false;
        this.$isBound = false;
        this.$scope = BindingContext.createScope(this);
        this.$projector = determineProjector(this, host, description);
        renderingEngine.applyRuntimeBehavior(Type, this);
        let template;
        if (this.$behavior.hasRender) {
            const result = this.render(host, options.parts);
            if (result.getElementTemplate) {
                template = result.getElementTemplate(renderingEngine, Type);
            }
            else {
                this.$nodes = result;
            }
        }
        else {
            template = renderingEngine.getElementTemplate(description, Type);
        }
        if (template) {
            this.$context = template.renderContext;
            this.$nodes = template.createFor(this, host, options.parts);
        }
        if (this.$behavior.hasCreated) {
            this.created();
        }
    }
    function bind(flags) {
        if (this.$isBound) {
            return;
        }
        const scope = this.$scope;
        const bindables = this.$bindables;
        for (let i = 0, ii = bindables.length; i < ii; ++i) {
            bindables[i].$bind(flags | exports.BindingFlags.fromBind, scope);
        }
        this.$isBound = true;
        if (this.$behavior.hasBound) {
            this.bound(flags | exports.BindingFlags.fromBind);
        }
    }
    function unbind(flags) {
        if (this.$isBound) {
            const bindables = this.$bindables;
            let i = bindables.length;
            while (i--) {
                bindables[i].$unbind(flags | exports.BindingFlags.fromUnbind);
            }
            this.$isBound = false;
            if (this.$behavior.hasUnbound) {
                this.unbound(flags | exports.BindingFlags.fromUnbind);
            }
        }
    }
    function attach(encapsulationSource, lifecycle) {
        if (this.$isAttached) {
            return;
        }
        lifecycle = AttachLifecycle.start(this, lifecycle);
        this.$encapsulationSource = encapsulationSource
            = this.$projector.provideEncapsulationSource(encapsulationSource);
        if (this.$behavior.hasAttaching) {
            this.attaching(encapsulationSource);
        }
        const attachables = this.$attachables;
        for (let i = 0, ii = attachables.length; i < ii; ++i) {
            attachables[i].$attach(encapsulationSource, lifecycle);
        }
        this.$projector.project(this.$nodes);
        this.$isAttached = true;
        if (this.$behavior.hasAttached) {
            lifecycle.queueAttachedCallback(this);
        }
        lifecycle.end(this);
    }
    function detach(lifecycle) {
        if (this.$isAttached) {
            lifecycle = DetachLifecycle.start(this, lifecycle);
            if (this.$behavior.hasDetaching) {
                this.detaching();
            }
            lifecycle.queueViewRemoval(this);
            const attachables = this.$attachables;
            let i = attachables.length;
            while (i--) {
                attachables[i].$detach();
            }
            this.$isAttached = false;
            if (this.$behavior.hasDetached) {
                lifecycle.queueDetachedCallback(this);
            }
            lifecycle.end(this);
        }
    }
    /*@internal*/
    function createCustomElementDescription(templateSource, Type) {
        return {
            name: templateSource.name || 'unnamed',
            templateOrNode: templateSource.templateOrNode || null,
            cache: 0,
            build: templateSource.build || {
                required: false,
                compiler: 'default'
            },
            bindables: Object.assign({}, Type.bindables, templateSource.bindables),
            instructions: templateSource.instructions ? kernel.PLATFORM.toArray(templateSource.instructions) : kernel.PLATFORM.emptyArray,
            dependencies: templateSource.dependencies ? kernel.PLATFORM.toArray(templateSource.dependencies) : kernel.PLATFORM.emptyArray,
            surrogates: templateSource.surrogates ? kernel.PLATFORM.toArray(templateSource.surrogates) : kernel.PLATFORM.emptyArray,
            containerless: templateSource.containerless || Type.containerless || false,
            shadowOptions: templateSource.shadowOptions || Type.shadowOptions || null,
            hasSlots: templateSource.hasSlots || false
        };
    }
    function determineProjector(customElement, host, definition) {
        if (definition.shadowOptions || definition.hasSlots) {
            if (definition.containerless) {
                throw kernel.Reporter.error(21);
            }
            return new ShadowDOMProjector(customElement, host, definition);
        }
        if (definition.containerless) {
            return new ContainerlessProjector(customElement, host);
        }
        return new HostProjector(customElement, host);
    }
    const childObserverOptions$1 = { childList: true };
    class ShadowDOMProjector {
        constructor(customElement, host, definition) {
            this.host = host;
            this.shadowRoot = DOM.attachShadow(host, definition.shadowOptions || defaultShadowOptions);
            host.$customElement = customElement;
            this.shadowRoot.$customElement = customElement;
        }
        get children() {
            return this.host.childNodes;
        }
        onChildrenChanged(callback) {
            DOM.createNodeObserver(this.host, callback, childObserverOptions$1);
        }
        provideEncapsulationSource(parentEncapsulationSource) {
            return this.shadowRoot;
        }
        project(nodes) {
            nodes.appendTo(this.shadowRoot);
        }
    }
    class ContainerlessProjector {
        constructor(customElement, host) {
            if (host.childNodes.length) {
                this.childNodes = Array.from(host.childNodes);
            }
            else {
                this.childNodes = kernel.PLATFORM.emptyArray;
            }
            this.host = DOM.convertToRenderLocation(host);
            this.host.$customElement = customElement;
        }
        get children() {
            return this.childNodes;
        }
        onChildrenChanged(callback) {
            // Do nothing since this scenario will never have children.
        }
        provideEncapsulationSource(parentEncapsulationSource) {
            if (!parentEncapsulationSource) {
                throw kernel.Reporter.error(22);
            }
            return parentEncapsulationSource;
        }
        project(nodes) {
            nodes.insertBefore(this.host);
        }
    }
    class HostProjector {
        constructor(customElement, host) {
            this.host = host;
            host.$customElement = customElement;
        }
        get children() {
            return kernel.PLATFORM.emptyArray;
        }
        onChildrenChanged(callback) {
            // Do nothing since this scenario will never have children.
        }
        provideEncapsulationSource(parentEncapsulationSource) {
            return parentEncapsulationSource || this.host;
        }
        project(nodes) {
            nodes.appendTo(this.host);
        }
    }
    // TODO
    // ## DefaultSlotProjector
    // An implementation of IElementProjector that can handle a subset of default
    // slot projection scenarios without needing real Shadow DOM.
    // ### Conditions
    // We can do a one-time, static composition of the content and view,
    // to emulate shadow DOM, if the following constraints are met:
    // * There must be exactly one slot and it must be a default slot.
    // * The default slot must not have any fallback content.
    // * The default slot must not have a custom element as its immediate parent or
    //   a slot attribute (re-projection).
    // ### Projection
    // The projector copies all content nodes to the slot's location.
    // The copy process should inject a comment node before and after the slotted
    // content, so that the bounds of the content can be clearly determined,
    // even if the slotted content has template controllers or string interpolation.
    // ### Encapsulation Source
    // Uses the same strategy as HostProjector.
    // ### Children
    // The projector adds a mutation observer to the parent node of the
    // slot comment. When direct children of that node change, the projector
    // will gather up all nodes between the start and end slot comments.

    const IAnimator = kernel.DI.createInterface()
        .withDefault(x => x.singleton(class {
        enter(node) {
            return Promise.resolve(false);
        }
        leave(node) {
            return Promise.resolve(false);
        }
        removeClass(node, className) {
            node.classList.remove(className);
            return Promise.resolve(false);
        }
        addClass(node, className) {
            node.classList.add(className);
            return Promise.resolve(false);
        }
    }));

    const IViewFactory = kernel.DI.createInterface().noDefault();
    /*@internal*/
    class View {
        constructor(factory, template, animator) {
            this.factory = factory;
            this.template = template;
            this.animator = animator;
            this.$bindables = [];
            this.$attachables = [];
            this.$scope = null;
            this.$nodes = null;
            this.$isBound = false;
            this.$isAttached = false;
            this.inCache = false;
            this.$nodes = this.createNodes();
        }
        createNodes() {
            return this.template.createFor(this);
        }
        lockScope(scope) {
            this.$scope = scope;
            this.$bind = lockedBind;
        }
        $bind(flags, scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$scope = scope;
            const bindables = this.$bindables;
            for (let i = 0, ii = bindables.length; i < ii; ++i) {
                bindables[i].$bind(flags, scope);
            }
            this.$isBound = true;
        }
        $attach(encapsulationSource, lifecycle) {
            if (this.$isAttached) {
                return;
            }
            this.$encapsulationSource = encapsulationSource;
            lifecycle = AttachLifecycle.start(this, lifecycle);
            const attachables = this.$attachables;
            for (let i = 0, ii = attachables.length; i < ii; ++i) {
                attachables[i].$attach(encapsulationSource, lifecycle);
            }
            this.onRender(this);
            this.$isAttached = true;
            lifecycle.end(this);
        }
        $detach(lifecycle) {
            if (this.$isAttached) {
                lifecycle = DetachLifecycle.start(this, lifecycle);
                lifecycle.queueViewRemoval(this);
                const attachables = this.$attachables;
                let i = attachables.length;
                while (i--) {
                    attachables[i].$detach(lifecycle);
                }
                this.$isAttached = false;
                lifecycle.end(this);
            }
        }
        $unbind(flags) {
            if (this.$isBound) {
                const bindables = this.$bindables;
                let i = bindables.length;
                while (i--) {
                    bindables[i].$unbind(flags);
                }
                this.$isBound = false;
                this.$scope = null;
            }
        }
        tryReturnToCache() {
            return this.factory.tryReturnToCache(this);
        }
    }
    View.prototype.$addChild = addRenderableChild;
    View.prototype.$removeChild = removeRenderableChild;
    /*@internal*/
    class ViewFactory {
        constructor(name, template, animator) {
            this.name = name;
            this.template = template;
            this.animator = animator;
            this.isCaching = false;
            this.cacheSize = -1;
            this.cache = null;
        }
        setCacheSize(size, doNotOverrideIfAlreadySet) {
            if (size) {
                if (size === '*') {
                    size = Number.MAX_VALUE;
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
        tryReturnToCache(view) {
            if (this.cache !== null && this.cache.length < this.cacheSize) {
                view.inCache = true;
                this.cache.push(view);
                return true;
            }
            return false;
        }
        create() {
            const cache = this.cache;
            if (cache !== null && cache.length > 0) {
                const view = cache.pop();
                view.inCache = false;
                return view;
            }
            return new View(this, this.template, this.animator);
        }
    }
    function lockedBind(flags) {
        if (this.$isBound) {
            return;
        }
        const lockedScope = this.$scope;
        const bindables = this.$bindables;
        for (let i = 0, ii = bindables.length; i < ii; ++i) {
            bindables[i].$bind(flags, lockedScope);
        }
        this.$isBound = true;
    }

    function createRenderContext(renderingEngine, parentRenderContext, dependencies) {
        const context = parentRenderContext.createChild();
        const renderableProvider = new InstanceProvider();
        const elementProvider = new InstanceProvider();
        const instructionProvider = new InstanceProvider();
        const factoryProvider = new ViewFactoryProvider(renderingEngine);
        const renderLocationProvider = new InstanceProvider();
        const renderer = renderingEngine.createRenderer(context);
        DOM.registerElementResolver(context, elementProvider);
        context.registerResolver(IViewFactory, factoryProvider);
        context.registerResolver(IRenderable, renderableProvider);
        context.registerResolver(ITargetedInstruction, instructionProvider);
        context.registerResolver(IRenderLocation, renderLocationProvider);
        if (dependencies) {
            context.register(...dependencies);
        }
        context.render = function (renderable, targets, templateDefinition, host, parts) {
            renderer.render(renderable, targets, templateDefinition, host, parts);
        };
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
    /*@internal*/
    class InstanceProvider {
        constructor() {
            this.instance = null;
        }
        prepare(instance) {
            this.instance = instance;
        }
        resolve(handler, requestor) {
            return this.instance;
        }
        dispose() {
            this.instance = null;
        }
    }
    /*@internal*/
    class ViewFactoryProvider {
        constructor(renderingEngine) {
            this.renderingEngine = renderingEngine;
        }
        prepare(factory, parts) {
            this.factory = factory;
            this.replacements = parts || kernel.PLATFORM.emptyObject;
        }
        resolve(handler, requestor) {
            const found = this.replacements[this.factory.name];
            if (found) {
                return this.renderingEngine.getViewFactory(found, requestor);
            }
            return this.factory;
        }
        dispose() {
            this.factory = null;
            this.replacements = null;
        }
    }

    /**
     * Decorator: Indicates that the decorated class is a custom attribute.
     */
    function customAttribute(nameOrSource) {
        return function (target) {
            return CustomAttributeResource.define(nameOrSource, target);
        };
    }
    /**
     * Decorator: Applied to custom attributes. Indicates that whatever element the
     * attribute is placed on should be converted into a template and that this
     * attribute controls the instantiation of the template.
     */
    function templateController(nameOrSource) {
        return function (target) {
            let source;
            if (typeof nameOrSource === 'string') {
                source = {
                    name: nameOrSource,
                    isTemplateController: true
                };
            }
            else {
                source = Object.assign({ isTemplateController: true }, nameOrSource);
            }
            return CustomAttributeResource.define(source, target);
        };
    }
    const CustomAttributeResource = {
        name: 'custom-attribute',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(type) {
            return type.kind === this;
        },
        define(nameOrSource, ctor) {
            const Type = ctor;
            const proto = Type.prototype;
            const description = createCustomAttributeDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
            Type.kind = CustomAttributeResource;
            Type.description = description;
            Type.register = register$3;
            proto.$hydrate = hydrate$1;
            proto.$bind = bind$1;
            proto.$attach = attach$1;
            proto.$detach = detach$1;
            proto.$unbind = unbind$1;
            return Type;
        }
    };
    function register$3(container) {
        const description = this.description;
        const resourceKey = CustomAttributeResource.keyFrom(description.name);
        const aliases = description.aliases;
        container.register(kernel.Registration.transient(resourceKey, this));
        for (let i = 0, ii = aliases.length; i < ii; ++i) {
            container.register(kernel.Registration.alias(resourceKey, aliases[i]));
        }
    }
    function hydrate$1(renderingEngine) {
        this.$isAttached = false;
        this.$isBound = false;
        this.$scope = null;
        this.$child = this.$child || null;
        renderingEngine.applyRuntimeBehavior(this.constructor, this);
        if (this.$behavior.hasCreated) {
            this.created();
        }
    }
    function bind$1(flags, scope) {
        if (this.$isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags | exports.BindingFlags.fromBind);
        }
        this.$scope = scope;
        this.$isBound = true;
        if (this.$behavior.hasBound) {
            this.bound(flags | exports.BindingFlags.fromBind, scope);
        }
    }
    function unbind$1(flags) {
        if (this.$isBound) {
            this.$isBound = false;
            if (this.$behavior.hasUnbound) {
                this.unbound(flags | exports.BindingFlags.fromUnbind);
            }
        }
    }
    function attach$1(encapsulationSource, lifecycle) {
        if (this.$isAttached) {
            return;
        }
        if (this.$behavior.hasAttaching) {
            this.attaching(encapsulationSource);
        }
        if (this.$child !== null) {
            this.$child.$attach(encapsulationSource, lifecycle);
        }
        this.$isAttached = true;
        if (this.$behavior.hasAttached) {
            lifecycle.queueAttachedCallback(this);
        }
    }
    function detach$1(lifecycle) {
        if (this.$isAttached) {
            if (this.$behavior.hasDetaching) {
                this.detaching();
            }
            if (this.$child !== null) {
                this.$child.$detach(lifecycle);
            }
            this.$isAttached = false;
            if (this.$behavior.hasDetached) {
                lifecycle.queueDetachedCallback(this);
            }
        }
    }
    /*@internal*/
    function createCustomAttributeDescription(attributeSource, Type) {
        return {
            name: attributeSource.name,
            aliases: attributeSource.aliases || kernel.PLATFORM.emptyArray,
            defaultBindingMode: attributeSource.defaultBindingMode || exports.BindingMode.toView,
            isTemplateController: attributeSource.isTemplateController || false,
            bindables: Object.assign({}, Type.bindables, attributeSource.bindables)
        };
    }

    function renderStrategy(nameOrSource) {
        return function (target) {
            return RenderStrategyResource.define(nameOrSource, target);
        };
    }
    const RenderStrategyResource = {
        name: 'render-strategy',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(type) {
            return type.kind === this;
        },
        define(nameOrSource, ctor) {
            const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
            const Type = ctor;
            Type.kind = RenderStrategyResource;
            Type.description = description;
            Type.register = function (container) {
                container.register(kernel.Registration.singleton(Type.kind.keyFrom(description.name), Type));
            };
            return Type;
        }
    };

    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { toView: toView$2 } = exports.BindingMode;
    // tslint:disable:no-any
    class LetBinding extends Binding {
        constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
            super(sourceExpression, null, targetProperty, toView$2, observerLocator, locator);
            this.toViewModel = toViewModel;
        }
        updateTarget(value) {
            throw new Error('Updating target not allowed in LetBinding.');
        }
        updateSource(value) {
            throw new Error('Updating source not allowed in LetBinding.');
        }
        handleChange(newValue, previousValue, flags) {
            if (!this.$isBound) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            const $scope = this.$scope;
            const locator = this.locator;
            const target = this.target;
            const targetProperty = this.targetProperty;
            if (flags & exports.BindingFlags.updateTargetInstance) {
                const currValue = target[targetProperty];
                const newValue = sourceExpression.evaluate(flags, $scope, locator);
                if (newValue !== currValue) {
                    target[targetProperty] = newValue;
                }
                return;
            }
            throw kernel.Reporter.error(15, flags);
        }
        $bind(flags, scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$isBound = true;
            this.$scope = scope;
            this.target = this.toViewModel ? scope.bindingContext : scope.overrideContext;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            // sourceExpression might have been changed during bind
            this.target[this.targetProperty] = this.sourceExpression.evaluate(exports.BindingFlags.fromBind, scope, this.locator);
            const mode = this.mode;
            if ((mode & toView$2) !== toView$2) {
                throw new Error('Let binding only supports [toView] binding mode.');
            }
            this.sourceExpression.connect(flags, scope, this);
        }
        $unbind(flags) {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.unobserve(true);
        }
        connect(flags) {
            if (!this.$isBound) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            const $scope = this.$scope;
            const value = sourceExpression.evaluate(flags, $scope, this.locator);
            // Let binding should initialize on their own
            // not waiting to be intied
            this.target[this.targetProperty] = value;
            sourceExpression.connect(flags, $scope, this);
        }
    }
    // tslint:enable:no-any

    // tslint:disable:function-name
    // tslint:disable:no-any
    /* @internal */
    class Renderer {
        constructor(context, observerLocator, eventManager, parser, renderingEngine) {
            this.context = context;
            this.observerLocator = observerLocator;
            this.eventManager = eventManager;
            this.parser = parser;
            this.renderingEngine = renderingEngine;
        }
        render(renderable, targets, definition, host, parts) {
            const targetInstructions = definition.instructions;
            for (let i = 0, ii = targets.length; i < ii; ++i) {
                const instructions = targetInstructions[i];
                const target = targets[i];
                for (let j = 0, jj = instructions.length; j < jj; ++j) {
                    const current = instructions[j];
                    this[current.type](renderable, target, current, parts);
                }
            }
            if (host) {
                const surrogateInstructions = definition.surrogates;
                for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    const current = surrogateInstructions[i];
                    this[current.type](renderable, host, current, parts);
                }
            }
        }
        hydrateElementInstance(renderable, target, instruction, component) {
            const childInstructions = instruction.instructions;
            component.$hydrate(this.renderingEngine, target, instruction);
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                const currentType = current.type;
                let realTarget;
                if (currentType === "f" /* stylePropertyBinding */ || currentType === "c" /* listenerBinding */) {
                    realTarget = target;
                }
                else {
                    realTarget = component;
                }
                this[currentType](renderable, realTarget, current);
            }
            renderable.$bindables.push(component);
            renderable.$attachables.push(component);
        }
        ["a" /* textBinding */](renderable, target, instruction) {
            const next = target.nextSibling;
            DOM.treatAsNonWhitespace(next);
            DOM.remove(target);
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 2048 /* Interpolation */), next, 'textContent', exports.BindingMode.toView, this.observerLocator, this.context));
        }
        ["b" /* propertyBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 48 /* IsPropertyCommand */ | instruction.mode), target, instruction.dest, instruction.mode, this.observerLocator, this.context));
        }
        ["c" /* listenerBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new Listener(instruction.dest, instruction.strategy, srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */)), target, instruction.preventDefault, this.eventManager, this.context));
        }
        ["d" /* callBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new Call(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 153 /* CallCommand */), target, instruction.dest, this.observerLocator, this.context));
        }
        ["e" /* refBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new Ref(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 1280 /* IsRef */), target, this.context));
        }
        ["f" /* stylePropertyBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 48 /* IsPropertyCommand */ | exports.BindingMode.toView), target.style, instruction.dest, exports.BindingMode.toView, this.observerLocator, this.context));
        }
        ["g" /* setProperty */](renderable, target, instruction) {
            target[instruction.dest] = instruction.value;
        }
        ["h" /* setAttribute */](renderable, target, instruction) {
            DOM.setAttribute(target, instruction.dest, instruction.value);
        }
        ["i" /* hydrateElement */](renderable, target, instruction) {
            const context = this.context;
            const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
            const component = context.get(CustomElementResource.keyFrom(instruction.res));
            this.hydrateElementInstance(renderable, target, instruction, component);
            operation.dispose();
        }
        ["j" /* hydrateAttribute */](renderable, target, instruction) {
            const childInstructions = instruction.instructions;
            const context = this.context;
            const operation = context.beginComponentOperation(renderable, target, instruction);
            const component = context.get(CustomAttributeResource.keyFrom(instruction.res));
            component.$hydrate(this.renderingEngine);
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                this[current.type](renderable, component, current);
            }
            renderable.$bindables.push(component);
            renderable.$attachables.push(component);
            operation.dispose();
        }
        ["k" /* hydrateTemplateController */](renderable, target, instruction, parts) {
            const childInstructions = instruction.instructions;
            const factory = this.renderingEngine.getViewFactory(instruction.src, this.context);
            const context = this.context;
            const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, DOM.convertToRenderLocation(target), false);
            const component = context.get(CustomAttributeResource.keyFrom(instruction.res));
            component.$hydrate(this.renderingEngine);
            if (instruction.link) {
                component.link(renderable.$attachables[renderable.$attachables.length - 1]);
            }
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                this[current.type](renderable, component, current);
            }
            renderable.$bindables.push(component);
            renderable.$attachables.push(component);
            operation.dispose();
        }
        ["n" /* renderStrategy */](renderable, target, instruction) {
            const strategyName = instruction.name;
            if (this[strategyName] === undefined) {
                const strategy = this.context.get(RenderStrategyResource.keyFrom(strategyName));
                if (strategy === null || strategy === undefined) {
                    throw new Error(`Unknown renderStrategy "${strategyName}"`);
                }
                this[strategyName] = strategy.render.bind(strategy);
            }
            this[strategyName](renderable, target, instruction);
        }
        ["l" /* letElement */](renderable, target, instruction) {
            target.remove();
            const childInstructions = instruction.instructions;
            const toViewModel = instruction.toViewModel;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const childInstruction = childInstructions[i];
                const srcOrExpr = childInstruction.srcOrExpr;
                renderable.$bindables.push(new LetBinding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 48 /* IsPropertyCommand */), childInstruction.dest, this.observerLocator, this.context, toViewModel));
            }
        }
    }

    /** @internal */
    class RuntimeBehavior {
        constructor() {
            this.hasCreated = false;
            this.hasBound = false;
            this.hasAttaching = false;
            this.hasAttached = false;
            this.hasDetaching = false;
            this.hasDetached = false;
            this.hasUnbound = false;
            this.hasRender = false;
        }
        static create(Component, instance) {
            const behavior = new RuntimeBehavior();
            behavior.bindables = Component.description.bindables;
            behavior.hasCreated = 'created' in instance;
            behavior.hasBound = 'bound' in instance;
            behavior.hasAttaching = 'attaching' in instance;
            behavior.hasAttached = 'attached' in instance;
            behavior.hasDetaching = 'detaching' in instance;
            behavior.hasDetached = 'detached' in instance;
            behavior.hasUnbound = 'unbound' in instance;
            behavior.hasRender = 'render' in instance;
            return behavior;
        }
        applyTo(instance, changeSet) {
            if ('$projector' in instance) {
                this.applyToElement(changeSet, instance);
            }
            else {
                this.applyToCore(changeSet, instance);
            }
        }
        applyToElement(changeSet, instance) {
            const observers = this.applyToCore(changeSet, instance);
            observers.$children = new exports.ChildrenObserver(changeSet, instance);
            Reflect.defineProperty(instance, '$children', {
                enumerable: false,
                get: function () {
                    return this.$observers.$children.getValue();
                }
            });
        }
        applyToCore(changeSet, instance) {
            const observers = {};
            const bindables = this.bindables;
            const observableNames = Object.getOwnPropertyNames(bindables);
            for (let i = 0, ii = observableNames.length; i < ii; ++i) {
                const name = observableNames[i];
                observers[name] = new exports.Observer(instance, name, bindables[name].callback);
                createGetterSetter(instance, name);
            }
            Reflect.defineProperty(instance, '$observers', {
                enumerable: false,
                value: observers
            });
            instance.$behavior = this;
            return observers;
        }
    }
    function createGetterSetter(instance, name) {
        Reflect.defineProperty(instance, name, {
            enumerable: true,
            get: function () { return this.$observers[name].getValue(); },
            set: function (value) { this.$observers[name].setValue(value, exports.BindingFlags.updateTargetInstance); }
        });
    }
    /*@internal*/
    exports.ChildrenObserver = class ChildrenObserver {
        constructor(changeSet, customElement$$1) {
            this.changeSet = changeSet;
            this.customElement = customElement$$1;
            this.hasChanges = false;
            this.children = null;
            this.observing = false;
        }
        getValue() {
            if (!this.observing) {
                this.observing = true;
                this.customElement.$projector.onChildrenChanged(() => this.onChildrenChanged());
                this.children = findElements(this.customElement.$projector.children);
            }
            return this.children;
        }
        setValue(newValue) { }
        flushChanges() {
            this.callSubscribers(this.children, undefined, exports.BindingFlags.updateTargetInstance | exports.BindingFlags.fromFlushChanges);
            this.hasChanges = false;
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
        onChildrenChanged() {
            this.children = findElements(this.customElement.$projector.children);
            if ('$childrenChanged' in this.customElement) {
                this.customElement.$childrenChanged();
            }
            this.changeSet.add(this);
            this.hasChanges = true;
        }
    };
    exports.ChildrenObserver = __decorate([
        subscriberCollection(exports.MutationKind.instance)
    ], exports.ChildrenObserver);
    const elementBehaviorFor = CustomElementResource.behaviorFor;
    /*@internal*/
    function findElements(nodes) {
        const components = [];
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            const current = nodes[i];
            const component = elementBehaviorFor(current);
            if (component !== null) {
                components.push(component);
            }
        }
        return components;
    }

    const ITemplateCompiler = kernel.DI.createInterface().noDefault();

    (function (ViewCompileFlags) {
        ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
        ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
        ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
    })(exports.ViewCompileFlags || (exports.ViewCompileFlags = {}));

    const IRenderingEngine = kernel.DI.createInterface()
        .withDefault(x => x.singleton(exports.RenderingEngine));
    // This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
    const noViewTemplate = {
        renderContext: null,
        createFor(renderable) {
            return NodeSequence.empty;
        }
    };
    const defaultCompilerName = 'default';
    exports.RenderingEngine = 
    /*@internal*/
    class RenderingEngine {
        constructor(container, changeSet, observerLocator, eventManager, parser, animator, templateCompilers) {
            this.container = container;
            this.changeSet = changeSet;
            this.observerLocator = observerLocator;
            this.eventManager = eventManager;
            this.parser = parser;
            this.animator = animator;
            this.templateLookup = new Map();
            this.factoryLookup = new Map();
            this.behaviorLookup = new Map();
            this.compilers = templateCompilers.reduce((acc, item) => {
                acc[item.name] = item;
                return acc;
            }, Object.create(null));
        }
        getElementTemplate(definition, componentType) {
            if (!definition) {
                return null;
            }
            let found = this.templateLookup.get(definition);
            if (!found) {
                found = this.templateFromSource(definition);
                //If the element has a view, support Recursive Components by adding self to own view template container.
                if (found.renderContext !== null && componentType) {
                    componentType.register(found.renderContext);
                }
                this.templateLookup.set(definition, found);
            }
            return found;
        }
        getViewFactory(definition, parentContext) {
            if (!definition) {
                return null;
            }
            let found = this.factoryLookup.get(definition);
            if (!found) {
                const validSource = createDefinition(definition);
                found = this.factoryFromSource(validSource, parentContext);
                this.factoryLookup.set(definition, found);
            }
            return found;
        }
        applyRuntimeBehavior(type, instance) {
            let found = this.behaviorLookup.get(type);
            if (!found) {
                found = RuntimeBehavior.create(type, instance);
                this.behaviorLookup.set(type, found);
            }
            found.applyTo(instance, this.changeSet);
        }
        createRenderer(context) {
            return new Renderer(context, this.observerLocator, this.eventManager, this.parser, this);
        }
        factoryFromSource(definition, parentContext) {
            const template = this.templateFromSource(definition, parentContext);
            const factory = new ViewFactory(definition.name, template, this.animator);
            factory.setCacheSize(definition.cache, true);
            return factory;
        }
        templateFromSource(definition, parentContext) {
            parentContext = parentContext || this.container;
            if (definition && definition.templateOrNode) {
                if (definition.build.required) {
                    const compilerName = definition.build.compiler || defaultCompilerName;
                    const compiler = this.compilers[compilerName];
                    if (!compiler) {
                        throw kernel.Reporter.error(20, compilerName);
                    }
                    definition = compiler.compile(definition, new RuntimeCompilationResources(parentContext), exports.ViewCompileFlags.surrogate);
                }
                return new CompiledTemplate(this, parentContext, definition);
            }
            return noViewTemplate;
        }
    };
    exports.RenderingEngine = __decorate([
        kernel.inject(kernel.IContainer, IChangeSet, IObserverLocator, IEventManager, IExpressionParser, IAnimator, kernel.all(ITemplateCompiler))
        /*@internal*/
    ], exports.RenderingEngine);
    /*@internal*/
    function createDefinition(definition) {
        return {
            name: definition.name || 'Unnamed Template',
            templateOrNode: definition.templateOrNode,
            cache: definition.cache || 0,
            build: definition.build || {
                required: false
            },
            bindables: definition.bindables || kernel.PLATFORM.emptyObject,
            instructions: definition.instructions ? kernel.PLATFORM.toArray(definition.instructions) : kernel.PLATFORM.emptyArray,
            dependencies: definition.dependencies ? kernel.PLATFORM.toArray(definition.dependencies) : kernel.PLATFORM.emptyArray,
            surrogates: definition.surrogates ? kernel.PLATFORM.toArray(definition.surrogates) : kernel.PLATFORM.emptyArray,
            containerless: definition.containerless || false,
            shadowOptions: definition.shadowOptions || null,
            hasSlots: definition.hasSlots || false
        };
    }
    // This is the main implementation of ITemplate.
    // It is used to create instances of IView based on a compiled TemplateDefinition.
    // TemplateDefinitions are hand-coded today, but will ultimately be the output of the
    // TemplateCompiler either through a JIT or AOT process.
    // Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
    // and create instances of it on demand.
    /*@internal*/
    class CompiledTemplate {
        constructor(renderingEngine, parentRenderContext, templateDefinition) {
            this.templateDefinition = templateDefinition;
            this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
            this.createNodeSequence = DOM.createFactoryFromMarkupOrNode(templateDefinition.templateOrNode);
        }
        createFor(renderable, host, replacements) {
            const nodes = this.createNodeSequence();
            this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, replacements);
            return nodes;
        }
    }
    /*@internal*/
    class RuntimeCompilationResources {
        constructor(context) {
            this.context = context;
        }
        find(kind, name) {
            const key = kind.keyFrom(name);
            const resolver = this.context.getResolver(key);
            if (resolver !== null && resolver.getFactory) {
                const factory = resolver.getFactory(this.context);
                if (factory !== null) {
                    return factory.type.description;
                }
            }
            return null;
        }
        create(kind, name) {
            return this.context.get(kind.keyFrom(name)) || null;
        }
    }

    const composeSource = {
        name: 'au-compose',
        containerless: true
    };
    const composeProps = ['subject', 'composing'];
    exports.Compose = class Compose {
        constructor(renderable, instruction, renderingEngine) {
            this.renderable = renderable;
            this.renderingEngine = renderingEngine;
            this.subject = null;
            this.composing = false;
            this.task = null;
            this.currentView = null;
            this.properties = null;
            this.properties = instruction.instructions
                .filter((x) => !composeProps.includes(x.dest))
                .reduce((acc, item) => {
                if (item.dest) {
                    acc[item.dest] = item;
                }
                return acc;
            }, {});
        }
        /** @internal */
        subjectChanged(newValue) {
            this.startComposition(newValue, exports.BindingFlags.fromBindableHandler);
        }
        /** @internal */
        bound() {
            this.startComposition(this.subject, exports.BindingFlags.fromBind);
        }
        /** @internal */
        endComposition(subject, flags) {
            const view = this.provideViewFor(subject);
            this.clear();
            if (view) {
                view.onRender = () => view.$nodes.insertBefore(this.$projector.host);
                view.lockScope(this.renderable.$scope);
                this.currentView = view;
                this.$addChild(view, flags);
            }
            this.composing = false;
        }
        provideViewFor(subject) {
            if (!subject) {
                return null;
            }
            if ('templateOrNode' in subject) { // Raw Template Definition
                return this.renderingEngine.getViewFactory(subject, this.renderable.$context).create();
            }
            if ('create' in subject) { // IViewFactory
                return subject.create();
            }
            if ('createView' in subject) { // PotentialRenderable
                return subject.createView(this.renderingEngine, this.renderable.$context);
            }
            if ('lockScope' in subject) { // IView
                return subject;
            }
            // Constructable (Custom Element Constructor)
            return createElement(subject, this.properties, this.$projector.children).createView(this.renderingEngine, this.renderable.$context);
        }
        startComposition(subject, flags) {
            if (this.task) {
                this.task.cancel();
            }
            this.task = new CompositionTask(this, flags);
            this.task.start(subject);
        }
        clear() {
            if (this.currentView) {
                this.$removeChild(this.currentView);
                this.currentView = null;
            }
        }
    };
    __decorate([
        bindable
    ], exports.Compose.prototype, "subject", void 0);
    __decorate([
        bindable
    ], exports.Compose.prototype, "composing", void 0);
    exports.Compose = __decorate([
        customElement(composeSource),
        kernel.inject(IRenderable, ITargetedInstruction, IRenderingEngine)
    ], exports.Compose);
    class CompositionTask {
        constructor(compose, flags) {
            this.compose = compose;
            this.flags = flags;
            this.isCancelled = false;
        }
        start(subject) {
            if (this.isCancelled) {
                return;
            }
            this.compose.composing = true;
            if (subject instanceof Promise) {
                subject.then(x => this.complete(x));
            }
            else {
                this.complete(subject);
            }
        }
        cancel() {
            this.isCancelled = true;
            this.compose.composing = false;
        }
        complete(subject) {
            if (this.isCancelled) {
                return;
            }
            this.compose.endComposition(subject, this.flags);
        }
    }

    exports.If = class If {
        constructor(ifFactory, location) {
            this.ifFactory = ifFactory;
            this.location = location;
            this.value = false;
        }
        bound() {
            this.update(this.value, exports.BindingFlags.fromBind);
        }
        attaching(encapsulationSource) {
            this.encapsulationSource = encapsulationSource;
        }
        unbound() {
            if (this.$child) {
                this.$child.$unbind(exports.BindingFlags.fromUnbind);
                this.$child = null;
            }
        }
        valueChanged(newValue) {
            this.update(newValue, exports.BindingFlags.fromBindableHandler);
        }
        update(shouldRenderTrueBranch, flags) {
            if (shouldRenderTrueBranch) {
                this.activateBranch('if', flags);
            }
            else if (this.elseFactory) {
                this.activateBranch('else', flags);
            }
            else if (this.$child) {
                this.deactivateCurrentBranch(flags);
            }
        }
        activateBranch(name, flags) {
            const branchView = this.ensureViewCreated(name);
            if (this.$child) {
                if (this.$child === branchView) {
                    return;
                }
                this.deactivateCurrentBranch(flags);
            }
            this.$child = branchView;
            branchView.$bind(flags, this.$scope);
            if (this.$isAttached) {
                branchView.$attach(this.encapsulationSource);
            }
        }
        ensureViewCreated(name) {
            const viewPropertyName = `${name}View`;
            let branchView = this[viewPropertyName];
            if (!branchView) {
                this[viewPropertyName] = branchView
                    = this[`${name}Factory`].create();
                branchView.onRender = view => view.$nodes.insertBefore(this.location);
            }
            return branchView;
        }
        deactivateCurrentBranch(flags) {
            this.$child.$detach();
            this.$child.$unbind(flags);
            this.$child = null;
        }
    };
    __decorate([
        bindable
    ], exports.If.prototype, "value", void 0);
    exports.If = __decorate([
        templateController('if'),
        kernel.inject(IViewFactory, IRenderLocation)
    ], exports.If);
    exports.Else = class Else {
        constructor(factory, location) {
            this.factory = factory;
            DOM.remove(location); // Only the location of the "if" is relevant.
        }
        link(ifBehavior) {
            ifBehavior.elseFactory = this.factory;
        }
    };
    exports.Else = __decorate([
        templateController('else'),
        kernel.inject(IViewFactory, IRenderLocation)
    ], exports.Else);

    var Repeat_1;
    function getCollectionObserver(changeSet, collection) {
        if (Array.isArray(collection)) {
            return getArrayObserver(changeSet, collection);
        }
        else if (collection instanceof Map) {
            return getMapObserver(changeSet, collection);
        }
        else if (collection instanceof Set) {
            return getSetObserver(changeSet, collection);
        }
    }
    exports.Repeat = Repeat_1 = class Repeat {
        constructor(changeSet, location, renderable, factory, container) {
            this.changeSet = changeSet;
            this.location = location;
            this.renderable = renderable;
            this.factory = factory;
            this.container = container;
            // tslint:disable:member-ordering
            this.$changeCallbacks = [];
            this.$isAttached = false;
            this.$isBound = false;
            this.$scope = null;
            this.$behavior = new RuntimeBehavior();
            this.views = [];
            this.encapsulationSource = null;
            this.observer = null;
            this.hasPendingInstanceMutation = false;
        }
        static register(container) {
            container.register(kernel.Registration.transient('custom-attribute:repeat', Repeat_1));
        }
        $hydrate(renderingEngine) {
            let b = renderingEngine['behaviorLookup'].get(Repeat_1);
            if (!b) {
                b = new RuntimeBehavior();
                b.bindables = Repeat_1.description.bindables;
                b.hasCreated = b.hasAttaching = b.hasAttached = b.hasDetaching = b.hasDetached = b.hasRender = false;
                b.hasBound = b.hasUnbound = true;
                renderingEngine['behaviorLookup'].set(Repeat_1, b);
            }
            this.$behavior = b;
        }
        set items(newValue) {
            const oldValue = this._items;
            if (oldValue === newValue) {
                // don't do anything if the same instance is re-assigned (the existing observer should pick up on any changes)
                return;
            }
            this._items = newValue;
            this.hasPendingInstanceMutation = true;
            if (this.$isBound) {
                this.changeSet.add(this);
            }
        }
        get items() {
            return this._items;
        }
        // tslint:enable:member-ordering
        $bind(flags, scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | exports.BindingFlags.fromBind);
            }
            this.$scope = scope;
            this.$isBound = true;
            this.sourceExpression = this.renderable.$bindables.find(b => b.target === this && b.targetProperty === 'items').sourceExpression;
            this.local = this.sourceExpression.declaration.evaluate(flags, scope, null);
            if (this.hasPendingInstanceMutation) {
                this.changeSet.add(this);
            }
        }
        $attach(encapsulationSource, lifecycle) {
            this.encapsulationSource = encapsulationSource;
            this.$isAttached = true;
        }
        $detach(lifecycle) {
            this.$isAttached = false;
            this.encapsulationSource = null;
        }
        $unbind(flags) {
            if (this.$isBound) {
                this.$isBound = false;
                if (this.observer) {
                    this.observer.unsubscribeBatched(this);
                }
                this.observer = this._items = null;
                // if this is a re-bind triggered by some ancestor repeater, then keep the views so we can reuse them
                // (this flag is passed down from handleInstanceMutation/handleItemsMutation down below at view.$bind)
                if (!(flags & exports.BindingFlags.fromBind)) {
                    this.removeAllViews();
                }
            }
        }
        flushChanges() {
            this.handleBatchedChange();
        }
        handleBatchedChange(indexMap) {
            if (this.hasPendingInstanceMutation) {
                if (this.observer) {
                    this.observer.unsubscribeBatched(this);
                }
                const items = this._items;
                this.observer = getCollectionObserver(this.changeSet, items);
                if (this.observer) {
                    this.observer.subscribeBatched(this);
                }
                this.handleBatchedItemsOrInstanceMutation();
            }
            else {
                this.handleBatchedItemsOrInstanceMutation(indexMap);
            }
        }
        // if the indexMap === undefined, it is an instance mutation, otherwise it's an items mutation
        handleBatchedItemsOrInstanceMutation(indexMap) {
            // determine if there is anything to process and whether or not we can return early
            const location = this.location;
            const views = this.views;
            const items = this._items;
            const oldLength = views.length;
            const sourceExpression = this.sourceExpression;
            const newLength = sourceExpression.count(items);
            if (newLength === 0) {
                if (oldLength === 0) {
                    // if we had 0 items and still have 0 items, we don't need to do anything
                    return;
                }
                else {
                    // if we had >0 items and now have 0 items, just remove all and return
                    this.removeAllViews();
                    return;
                }
            }
            // store the scopes of the current indices so we can reuse them for other views
            const previousScopes = new Array(oldLength);
            let i = 0;
            while (i < oldLength) {
                previousScopes[i] = views[i].$scope;
                i++;
            }
            let flags = exports.BindingFlags.none;
            const isAttached = this.$isAttached;
            const scope = this.$scope;
            const overrideContext = scope.overrideContext;
            const local = this.local;
            if (oldLength < newLength) {
                // expand the array (we add the views later)
                views.length = newLength;
            }
            else if (newLength < oldLength) {
                // remove any surplus views
                i = newLength;
                const lifecycle = DetachLifecycle.start(this);
                while (i < oldLength) {
                    const view = views[i++];
                    if (isAttached) {
                        view.$detach(lifecycle);
                    }
                    view.tryReturnToCache();
                }
                lifecycle.end(this);
                views.length = newLength;
            }
            if (indexMap === undefined) {
                this.hasPendingInstanceMutation = false;
            }
            const factory = this.factory;
            const encapsulationSource = this.encapsulationSource;
            const lifecycle = AttachLifecycle.start(this);
            i = 0;
            sourceExpression.iterate(items, (arr, i, item) => {
                let view = views[i];
                if (view === undefined) {
                    // add view if it doesn't exist yet
                    view = views[i] = factory.create();
                    view.$bind(flags, createChildScope(overrideContext, { [local]: item }));
                    view.onRender = () => {
                        view.$nodes.insertBefore(location);
                    };
                    if (isAttached) {
                        view.$attach(encapsulationSource, lifecycle);
                    }
                }
                else {
                    // TODO: optimize this again (but in a more efficient way and one that works in multiple scenarios)
                    view.$bind(flags | exports.BindingFlags.fromBind, createChildScope(overrideContext, { [local]: item }));
                }
            });
            lifecycle.end(this);
        }
        removeAllViews() {
            const views = this.views;
            this.views = [];
            const len = views.length;
            let i = 0;
            const isAttached = this.$isAttached;
            const lifecycle = DetachLifecycle.start(this);
            while (i < len) {
                const view = views[i++];
                if (isAttached) {
                    view.$detach(lifecycle);
                }
                view.tryReturnToCache();
            }
            lifecycle.end(this);
        }
    };
    exports.Repeat.kind = CustomAttributeResource;
    exports.Repeat.description = {
        name: 'repeat',
        aliases: kernel.PLATFORM.emptyArray,
        defaultBindingMode: exports.BindingMode.toView,
        isTemplateController: true,
        bindables: {
            items: { attribute: 'items', mode: exports.BindingMode.toView, property: 'items' },
            local: { attribute: 'local', mode: exports.BindingMode.toView, property: 'local' }
        }
    };
    exports.Repeat = Repeat_1 = __decorate([
        kernel.inject(IChangeSet, IRenderLocation, IRenderable, IViewFactory, kernel.IContainer)
    ], exports.Repeat);
    exports.Repeat.prototype.observer = null;
    function createChildScope(parentOverrideContext, bindingContext) {
        return {
            bindingContext,
            overrideContext: {
                bindingContext,
                parentOverrideContext
            }
        };
    }

    exports.Replaceable = class Replaceable {
        constructor(factory, location) {
            this.factory = factory;
            this.$child = this.factory.create();
            this.$child.onRender = view => view.$nodes.insertBefore(location);
        }
        bound(flags, scope) {
            this.$child.$bind(flags, scope);
        }
        unbound(flags) {
            this.$child.$unbind(flags);
        }
    };
    exports.Replaceable = __decorate([
        templateController('replaceable'),
        kernel.inject(IViewFactory, IRenderLocation)
    ], exports.Replaceable);

    exports.With = class With {
        constructor(factory, location) {
            this.factory = factory;
            this.value = null;
            this.$child = null;
            this.$child = this.factory.create();
            this.$child.onRender = view => view.$nodes.insertBefore(location);
        }
        valueChanged() {
            this.bindChild(exports.BindingFlags.fromBindableHandler);
        }
        bound(flags) {
            this.bindChild(flags);
        }
        unbound(flags) {
            this.$child.$unbind(flags);
        }
        bindChild(flags) {
            this.$child.$bind(flags, BindingContext.createScopeFromParent(this.$scope, this.value));
        }
    };
    __decorate([
        bindable
    ], exports.With.prototype, "value", void 0);
    exports.With = __decorate([
        templateController('with'),
        kernel.inject(IViewFactory, IRenderLocation)
    ], exports.With);

    class Aurelia {
        constructor(container = kernel.DI.createContainer()) {
            this.container = container;
            this.components = [];
            this.startTasks = [];
            this.stopTasks = [];
            this.isStarted = false;
        }
        register(...params) {
            this.container.register(...params);
            return this;
        }
        app(config) {
            let component = config.component;
            let startTask = () => {
                if (!this.components.includes(component)) {
                    this.components.push(component);
                    component.$hydrate(this.container.get(IRenderingEngine), config.host);
                }
                component.$bind(exports.BindingFlags.fromStartTask | exports.BindingFlags.fromBind);
                component.$attach(config.host);
            };
            this.startTasks.push(startTask);
            this.stopTasks.push(() => {
                component.$detach();
                component.$unbind(exports.BindingFlags.fromStopTask | exports.BindingFlags.fromUnbind);
            });
            if (this.isStarted) {
                startTask();
            }
            return this;
        }
        start() {
            this.startTasks.forEach(x => x());
            this.isStarted = true;
            return this;
        }
        stop() {
            this.isStarted = false;
            this.stopTasks.forEach(x => x());
            return this;
        }
    }
    kernel.PLATFORM.global.Aurelia = Aurelia;

    const ITaskQueue = kernel.DI.createInterface()
        .withDefault(x => x.singleton(TaskQueue));
    /*@internal*/
    class TaskQueue {
        constructor() {
            this.microTaskQueue = new Array(0xFF); // a "fixed-size" preallocated task queue (it will be expanded in steps of 255 if it runs full)
            this.microTaskCursor = 0; // the index of that last microTask that was queued
            this.microTaskIndex = 0; // the index of the current microTask being executed
            this.taskQueue = new Array(0xFF);
            this.taskCursor = 0;
            this.taskIndex = 0;
            this.requestFlushMicroTaskQueue = kernel.PLATFORM.createMicroTaskFlushRequestor(() => this.flushMicroTaskQueue());
            this.requestFlushTaskQueue = kernel.PLATFORM.createTaskFlushRequester(() => this.flushTaskQueue());
            this.flushing = false;
            this.longStacks = false;
        }
        queueMicroTask(task) {
            // the cursor and the index being the same number, is the equivalent of an empty queue
            // note: when a queue is done flushing, both of these are set to 0 again to keep queue expansion to a minimum
            if (this.microTaskIndex === this.microTaskCursor) {
                this.requestFlushMicroTaskQueue();
            }
            if (this.longStacks) {
                task.stack = this.prepareMicroTaskStack();
            }
            this.microTaskQueue[this.microTaskCursor++] = task;
            // if the queue is full, simply increase its size
            if (this.microTaskCursor === this.microTaskQueue.length) {
                this.microTaskQueue.length += 0xFF;
            }
        }
        flushMicroTaskQueue() {
            let task;
            const longStacks = this.longStacks;
            const queue = this.microTaskQueue;
            this.flushing = true;
            // when the index catches up to the cursor, that means the queue is empty
            // note: the cursor can change during flushing (if new microTasks are queued from within microTasks)
            while (this.microTaskIndex < this.microTaskCursor) {
                task = queue[this.microTaskIndex];
                // immediately clear the array item to minimize memory usage
                queue[this.microTaskIndex] = undefined;
                if (longStacks) {
                    this.stack = typeof task.stack === 'string' ? task.stack : undefined;
                }
                // doing the try/catch only on the bit that really needs it, so the loop itself can more
                // easily be optimized by the browser runtime
                try {
                    task.call();
                }
                catch (error) {
                    this.onError(error, task);
                    break;
                }
                this.microTaskIndex++;
            }
            this.microTaskIndex = this.microTaskCursor = 0;
            this.flushing = false;
        }
        queueTask(task) {
            // works similar to queueMicroTask, with the difference being that the taskQueue will
            // only run tasks up to the cursor of when the flush was invoked
            if (this.taskIndex === this.taskCursor) {
                // because flushTaskQueue isn't allowed to run up to the current value of the cursor, it also
                // can't reset the indices to 0 without potentially causing tasks to get lost, so we do it here
                this.taskIndex = this.taskCursor = 0;
                this.requestFlushTaskQueue();
            }
            if (this.longStacks) {
                task.stack = this.prepareTaskStack();
            }
            this.taskQueue[this.taskCursor++] = task;
            if (this.taskCursor === this.taskQueue.length) {
                this.taskQueue.length += 0xFF;
            }
        }
        flushTaskQueue() {
            let task;
            const longStacks = this.longStacks;
            const queue = this.taskQueue;
            const cursor = this.taskCursor;
            this.flushing = true;
            // only run up to the cursor that it was at the time of flushing
            while (this.taskIndex !== cursor) {
                task = queue[this.taskIndex];
                queue[this.taskIndex] = undefined;
                if (longStacks) {
                    this.stack = typeof task.stack === 'string' ? task.stack : undefined;
                }
                try {
                    task.call();
                }
                catch (error) {
                    this.onError(error, task);
                    break;
                }
                this.taskIndex++;
            }
            this.flushing = false;
        }
        // Overwritten in debug mode.
        prepareTaskStack() {
            throw kernel.Reporter.error(13);
        }
        // Overwritten in debug mode.
        prepareMicroTaskStack() {
            throw kernel.Reporter.error(13);
        }
        // Overwritten in debug mode.
        onError(error, task) {
            if ('onError' in task) {
                task.onError(error);
            }
            else {
                setTimeout(() => { throw error; }, 0);
            }
        }
    }

    exports.enableArrayObservation = enableArrayObservation;
    exports.disableArrayObservation = disableArrayObservation;
    exports.nativePush = nativePush;
    exports.nativePop = nativePop;
    exports.nativeShift = nativeShift;
    exports.nativeUnshift = nativeUnshift;
    exports.nativeSplice = nativeSplice;
    exports.nativeReverse = nativeReverse;
    exports.nativeSort = nativeSort;
    exports.enableMapObservation = enableMapObservation;
    exports.disableMapObservation = disableMapObservation;
    exports.nativeSet = nativeSet;
    exports.nativeMapDelete = nativeDelete$1;
    exports.nativeMapClear = nativeClear$1;
    exports.enableSetObservation = enableSetObservation;
    exports.disableSetObservation = disableSetObservation;
    exports.nativeAdd = nativeAdd;
    exports.nativeSetDelete = nativeDelete;
    exports.nativeSetClear = nativeClear;
    exports.BindingModeBehavior = BindingModeBehavior;
    exports.debounceCallSource = debounceCallSource;
    exports.debounceCall = debounceCall;
    exports.ISanitizer = ISanitizer;
    exports.findOriginalEventTarget = findOriginalEventTarget;
    exports.handleSelfEvent = handleSelfEvent;
    exports.throttle = throttle;
    exports.BindingBehavior = BindingBehavior;
    exports.ValueConverter = ValueConverter;
    exports.Assign = Assign;
    exports.Conditional = Conditional;
    exports.AccessThis = AccessThis;
    exports.AccessScope = AccessScope;
    exports.AccessMember = AccessMember;
    exports.AccessKeyed = AccessKeyed;
    exports.CallScope = CallScope;
    exports.CallMember = CallMember;
    exports.CallFunction = CallFunction;
    exports.Binary = Binary;
    exports.Unary = Unary;
    exports.PrimitiveLiteral = PrimitiveLiteral;
    exports.HtmlLiteral = HtmlLiteral;
    exports.ArrayLiteral = ArrayLiteral;
    exports.ObjectLiteral = ObjectLiteral;
    exports.Template = Template;
    exports.TaggedTemplate = TaggedTemplate;
    exports.ArrayBindingPattern = ArrayBindingPattern;
    exports.ObjectBindingPattern = ObjectBindingPattern;
    exports.BindingIdentifier = BindingIdentifier;
    exports.ForOfStatement = ForOfStatement;
    exports.Interpolation = Interpolation;
    exports.IterateForOfStatement = IterateForOfStatement;
    exports.CountForOfStatement = CountForOfStatement;
    exports.bindingBehavior = bindingBehavior;
    exports.BindingBehaviorResource = BindingBehaviorResource;
    exports.BindingContext = BindingContext;
    exports.Binding = Binding;
    exports.Call = Call;
    exports.IChangeSet = IChangeSet;
    exports.ChangeSet = ChangeSet;
    exports.collectionObserver = collectionObserver;
    exports.computed = computed;
    exports.createComputedObserver = createComputedObserver;
    exports.GetterController = GetterController;
    exports.IDirtyChecker = IDirtyChecker;
    exports.DirtyChecker = DirtyChecker;
    exports.ListenerTracker = ListenerTracker;
    exports.DelegateOrCaptureSubscription = DelegateOrCaptureSubscription;
    exports.TriggerSubscription = TriggerSubscription;
    exports.EventSubscriber = EventSubscriber;
    exports.IEventManager = IEventManager;
    exports.EventManager = EventManager;
    exports.IExpressionParser = IExpressionParser;
    exports.ExpressionParser = ExpressionParser;
    exports.Listener = Listener;
    exports.IObserverLocator = IObserverLocator;
    exports.PrimitiveObserver = PrimitiveObserver;
    exports.Ref = Ref;
    exports.ISignaler = ISignaler;
    exports.subscriberCollection = subscriberCollection;
    exports.batchedSubscriberCollection = batchedSubscriberCollection;
    exports.ISVGAnalyzer = ISVGAnalyzer;
    exports.targetObserver = targetObserver;
    exports.valueConverter = valueConverter;
    exports.ValueConverterResource = ValueConverterResource;
    exports.getCollectionObserver = getCollectionObserver;
    exports.IAnimator = IAnimator;
    exports.bindable = bindable;
    exports.customAttribute = customAttribute;
    exports.templateController = templateController;
    exports.CustomAttributeResource = CustomAttributeResource;
    exports.createCustomAttributeDescription = createCustomAttributeDescription;
    exports.customElement = customElement;
    exports.useShadowDOM = useShadowDOM;
    exports.containerless = containerless;
    exports.CustomElementResource = CustomElementResource;
    exports.createCustomElementDescription = createCustomElementDescription;
    exports.ShadowDOMProjector = ShadowDOMProjector;
    exports.ContainerlessProjector = ContainerlessProjector;
    exports.HostProjector = HostProjector;
    exports.ITargetedInstruction = ITargetedInstruction;
    exports.isTargetedInstruction = isTargetedInstruction;
    exports.AttachLifecycle = AttachLifecycle;
    exports.DetachLifecycle = DetachLifecycle;
    exports.createRenderContext = createRenderContext;
    exports.InstanceProvider = InstanceProvider;
    exports.ViewFactoryProvider = ViewFactoryProvider;
    exports.renderStrategy = renderStrategy;
    exports.RenderStrategyResource = RenderStrategyResource;
    exports.Renderer = Renderer;
    exports.IRenderable = IRenderable;
    exports.addRenderableChild = addRenderableChild;
    exports.removeRenderableChild = removeRenderableChild;
    exports.IRenderingEngine = IRenderingEngine;
    exports.createDefinition = createDefinition;
    exports.CompiledTemplate = CompiledTemplate;
    exports.RuntimeCompilationResources = RuntimeCompilationResources;
    exports.RuntimeBehavior = RuntimeBehavior;
    exports.findElements = findElements;
    exports.ITemplateCompiler = ITemplateCompiler;
    exports.IViewFactory = IViewFactory;
    exports.View = View;
    exports.ViewFactory = ViewFactory;
    exports.Aurelia = Aurelia;
    exports.INode = INode;
    exports.IRenderLocation = IRenderLocation;
    exports.createNodeSequenceFromFragment = createNodeSequenceFromFragment;
    exports.DOM = DOM;
    exports.NodeSequence = NodeSequence;
    exports.FragmentNodeSequence = FragmentNodeSequence;
    exports.ITaskQueue = ITaskQueue;
    exports.TaskQueue = TaskQueue;

    return exports;

}({},au.kernel));
