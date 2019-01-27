import { Reporter, DI, Registration, PLATFORM, Profiler, RuntimeCompilationResources, IContainer, all } from '@aurelia/kernel';

/*
* Note: the oneTime binding now has a non-zero value for 2 reasons:
*  - plays nicer with bitwise operations (more consistent code, more explicit settings)
*  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
*
* Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
* This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
*/
var BindingMode;
(function (BindingMode) {
    BindingMode[BindingMode["oneTime"] = 1] = "oneTime";
    BindingMode[BindingMode["toView"] = 2] = "toView";
    BindingMode[BindingMode["fromView"] = 4] = "fromView";
    BindingMode[BindingMode["twoWay"] = 6] = "twoWay";
    BindingMode[BindingMode["default"] = 8] = "default";
})(BindingMode || (BindingMode = {}));
var State;
(function (State) {
    State[State["none"] = 0] = "none";
    State[State["isBinding"] = 1] = "isBinding";
    State[State["isBound"] = 2] = "isBound";
    State[State["isAttaching"] = 4] = "isAttaching";
    State[State["isAttached"] = 8] = "isAttached";
    State[State["isMounted"] = 16] = "isMounted";
    State[State["isDetaching"] = 32] = "isDetaching";
    State[State["isUnbinding"] = 64] = "isUnbinding";
    State[State["isCached"] = 128] = "isCached";
    State[State["isContainerless"] = 256] = "isContainerless";
})(State || (State = {}));
var Hooks;
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
})(Hooks || (Hooks = {}));
var LifecycleFlags;
(function (LifecycleFlags) {
    LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
    LifecycleFlags[LifecycleFlags["mustEvaluate"] = 524288] = "mustEvaluate";
    LifecycleFlags[LifecycleFlags["mutation"] = 3] = "mutation";
    LifecycleFlags[LifecycleFlags["isCollectionMutation"] = 1] = "isCollectionMutation";
    LifecycleFlags[LifecycleFlags["isInstanceMutation"] = 2] = "isInstanceMutation";
    LifecycleFlags[LifecycleFlags["update"] = 28] = "update";
    LifecycleFlags[LifecycleFlags["updateTargetObserver"] = 4] = "updateTargetObserver";
    LifecycleFlags[LifecycleFlags["updateTargetInstance"] = 8] = "updateTargetInstance";
    LifecycleFlags[LifecycleFlags["updateSourceExpression"] = 16] = "updateSourceExpression";
    LifecycleFlags[LifecycleFlags["from"] = 524256] = "from";
    LifecycleFlags[LifecycleFlags["fromFlush"] = 224] = "fromFlush";
    LifecycleFlags[LifecycleFlags["fromAsyncFlush"] = 32] = "fromAsyncFlush";
    LifecycleFlags[LifecycleFlags["fromSyncFlush"] = 64] = "fromSyncFlush";
    LifecycleFlags[LifecycleFlags["fromTick"] = 128] = "fromTick";
    LifecycleFlags[LifecycleFlags["fromStartTask"] = 256] = "fromStartTask";
    LifecycleFlags[LifecycleFlags["fromStopTask"] = 512] = "fromStopTask";
    LifecycleFlags[LifecycleFlags["fromBind"] = 1024] = "fromBind";
    LifecycleFlags[LifecycleFlags["fromUnbind"] = 2048] = "fromUnbind";
    LifecycleFlags[LifecycleFlags["fromAttach"] = 4096] = "fromAttach";
    LifecycleFlags[LifecycleFlags["fromDetach"] = 8192] = "fromDetach";
    LifecycleFlags[LifecycleFlags["fromCache"] = 16384] = "fromCache";
    LifecycleFlags[LifecycleFlags["fromDOMEvent"] = 32768] = "fromDOMEvent";
    LifecycleFlags[LifecycleFlags["fromObserverSetter"] = 65536] = "fromObserverSetter";
    LifecycleFlags[LifecycleFlags["fromBindableHandler"] = 131072] = "fromBindableHandler";
    LifecycleFlags[LifecycleFlags["fromLifecycleTask"] = 262144] = "fromLifecycleTask";
    LifecycleFlags[LifecycleFlags["parentUnmountQueued"] = 1048576] = "parentUnmountQueued";
    // this flag is for the synchronous flush before detach (no point in updating the
    // DOM if it's about to be detached)
    LifecycleFlags[LifecycleFlags["doNotUpdateDOM"] = 2097152] = "doNotUpdateDOM";
    LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 4194304] = "isTraversingParentScope";
    // Bitmask for flags that need to be stored on a binding during $bind for mutation
    // callbacks outside of $bind
    LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 58720256] = "persistentBindingFlags";
    LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 8388608] = "allowParentScopeTraversal";
    LifecycleFlags[LifecycleFlags["useProxies"] = 16777216] = "useProxies";
    LifecycleFlags[LifecycleFlags["keyedMode"] = 33554432] = "keyedMode";
})(LifecycleFlags || (LifecycleFlags = {}));
function stringifyLifecycleFlags(flags) {
    const flagNames = [];
    if (flags & LifecycleFlags.mustEvaluate) {
        flagNames.push('mustEvaluate');
    }
    if (flags & LifecycleFlags.isCollectionMutation) {
        flagNames.push('isCollectionMutation');
    }
    if (flags & LifecycleFlags.isInstanceMutation) {
        flagNames.push('isInstanceMutation');
    }
    if (flags & LifecycleFlags.updateTargetObserver) {
        flagNames.push('updateTargetObserver');
    }
    if (flags & LifecycleFlags.updateTargetInstance) {
        flagNames.push('updateTargetInstance');
    }
    if (flags & LifecycleFlags.updateSourceExpression) {
        flagNames.push('updateSourceExpression');
    }
    if (flags & LifecycleFlags.fromAsyncFlush) {
        flagNames.push('fromAsyncFlush');
    }
    if (flags & LifecycleFlags.fromSyncFlush) {
        flagNames.push('fromSyncFlush');
    }
    if (flags & LifecycleFlags.fromStartTask) {
        flagNames.push('fromStartTask');
    }
    if (flags & LifecycleFlags.fromStopTask) {
        flagNames.push('fromStopTask');
    }
    if (flags & LifecycleFlags.fromBind) {
        flagNames.push('fromBind');
    }
    if (flags & LifecycleFlags.fromUnbind) {
        flagNames.push('fromUnbind');
    }
    if (flags & LifecycleFlags.fromAttach) {
        flagNames.push('fromAttach');
    }
    if (flags & LifecycleFlags.fromDetach) {
        flagNames.push('fromDetach');
    }
    if (flags & LifecycleFlags.fromCache) {
        flagNames.push('fromCache');
    }
    if (flags & LifecycleFlags.fromDOMEvent) {
        flagNames.push('fromDOMEvent');
    }
    if (flags & LifecycleFlags.fromObserverSetter) {
        flagNames.push('fromObserverSetter');
    }
    if (flags & LifecycleFlags.fromBindableHandler) {
        flagNames.push('fromBindableHandler');
    }
    if (flags & LifecycleFlags.fromLifecycleTask) {
        flagNames.push('fromLifecycleTask');
    }
    if (flags & LifecycleFlags.parentUnmountQueued) {
        flagNames.push('parentUnmountQueued');
    }
    if (flags & LifecycleFlags.doNotUpdateDOM) {
        flagNames.push('doNotUpdateDOM');
    }
    if (flags & LifecycleFlags.isTraversingParentScope) {
        flagNames.push('isTraversingParentScope');
    }
    if (flags & LifecycleFlags.allowParentScopeTraversal) {
        flagNames.push('allowParentScopeTraversal');
    }
    if (flags & LifecycleFlags.useProxies) {
        flagNames.push('useProxies');
    }
    return flagNames.join('|');
}
var ExpressionKind;
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
})(ExpressionKind || (ExpressionKind = {}));

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
var DelegationStrategy;
(function (DelegationStrategy) {
    DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
    DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
    DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
})(DelegationStrategy || (DelegationStrategy = {}));
/**
 * Mostly just a marker enum to help with typings (specifically to reduce duplication)
 */
var MutationKind;
(function (MutationKind) {
    MutationKind[MutationKind["instance"] = 1] = "instance";
    MutationKind[MutationKind["collection"] = 2] = "collection";
    MutationKind[MutationKind["proxy"] = 4] = "proxy";
})(MutationKind || (MutationKind = {}));
var CollectionKind;
(function (CollectionKind) {
    CollectionKind[CollectionKind["indexed"] = 8] = "indexed";
    CollectionKind[CollectionKind["keyed"] = 4] = "keyed";
    CollectionKind[CollectionKind["array"] = 9] = "array";
    CollectionKind[CollectionKind["map"] = 6] = "map";
    CollectionKind[CollectionKind["set"] = 7] = "set";
})(CollectionKind || (CollectionKind = {}));

function subscriberCollection(mutationKind) {
    // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
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
        switch (mutationKind) {
            case MutationKind.instance:
                proto.callSubscribers = callPropertySubscribers;
                break;
            case MutationKind.collection:
                proto.callSubscribers = callCollectionSubscribers;
                break;
            case MutationKind.proxy:
                proto.callSubscribers = callProxySubscribers;
        }
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
    this._subscribersRest.push(subscriber);
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
                subscribers.splice(i, 1);
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
    const length = subscribers && subscribers.length;
    if (length !== undefined && length > 0) {
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
    const length = subscribers && subscribers.length;
    if (length !== undefined && length > 0) {
        for (let i = 0; i < length; ++i) {
            const subscriber = subscribers[i];
            if (subscriber !== null) {
                subscriber.handleChange(origin, args, flags);
            }
        }
    }
    this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
}
function callProxySubscribers(key, newValue, previousValue, flags) {
    const subscriber0 = this._subscriber0;
    const subscriber1 = this._subscriber1;
    const subscriber2 = this._subscriber2;
    let subscribers = this._subscribersRest;
    if (subscribers !== null) {
        subscribers = subscribers.slice();
    }
    if (subscriber0 !== null) {
        subscriber0.handleChange(key, newValue, previousValue, flags);
    }
    if (subscriber1 !== null) {
        subscriber1.handleChange(key, newValue, previousValue, flags);
    }
    if (subscriber2 !== null) {
        subscriber2.handleChange(key, newValue, previousValue, flags);
    }
    const length = subscribers && subscribers.length;
    if (length !== undefined && length > 0) {
        for (let i = 0; i < length; ++i) {
            const subscriber = subscribers[i];
            if (subscriber !== null) {
                subscriber.handleChange(key, newValue, previousValue, flags);
            }
        }
    }
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
    // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
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
    this._batchedSubscribersRest.push(subscriber);
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
                subscribers.splice(i, 1);
                if (ii === 1) {
                    this._batchedSubscriberFlags &= ~8 /* SubscribersRest */;
                }
                return true;
            }
        }
    }
    return false;
}
function callBatchedCollectionSubscribers(indexMap, flags) {
    const subscriber0 = this._batchedSubscriber0;
    const subscriber1 = this._batchedSubscriber1;
    const subscriber2 = this._batchedSubscriber2;
    let subscribers = this._batchedSubscribersRest;
    if (subscribers !== null) {
        subscribers = subscribers.slice();
    }
    if (subscriber0 !== null) {
        subscriber0.handleBatchedChange(indexMap, flags);
    }
    if (subscriber1 !== null) {
        subscriber1.handleBatchedChange(indexMap, flags);
    }
    if (subscriber2 !== null) {
        subscriber2.handleBatchedChange(indexMap, flags);
    }
    const length = subscribers && subscribers.length;
    if (length !== undefined && length > 0) {
        for (let i = 0; i < length; ++i) {
            const subscriber = subscribers[i];
            if (subscriber !== null) {
                subscriber.handleBatchedChange(indexMap, flags);
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

var ProxyObserver_1;
const lookup = new WeakMap();
let ProxySubscriberCollection = class ProxySubscriberCollection {
    constructor(proxy, raw, key) {
        this.raw = raw;
        this.key = key;
        this.proxy = proxy;
        this.subscribe = this.addSubscriber;
        this.unsubscribe = this.removeSubscriber;
    }
    setValue(value, flags) {
        const oldValue = this.raw[this.key];
        if (oldValue !== value) {
            this.raw[this.key] = value;
            this.callSubscribers(value, oldValue, flags | LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
        }
    }
    getValue() {
        return this.raw[this.key];
    }
};
ProxySubscriberCollection = __decorate([
    subscriberCollection(MutationKind.instance)
], ProxySubscriberCollection);
let ProxyObserver = ProxyObserver_1 = class ProxyObserver {
    constructor(obj) {
        this.raw = obj;
        this.proxy = new Proxy(obj, this);
        lookup.set(obj, this.proxy);
        this.subscribers = {};
    }
    static getProxyOrSelf(obj) {
        if (obj.$raw === undefined) {
            const proxy = lookup.get(obj);
            if (proxy === undefined) {
                return obj;
            }
            return proxy;
        }
        return obj;
    }
    static getRawIfProxy(obj) {
        const raw = obj.$raw;
        if (raw === undefined) {
            return obj;
        }
        return raw;
    }
    static getOrCreate(obj, key) {
        let proxyObserver;
        if (obj.$raw === undefined) {
            const proxy = lookup.get(obj);
            if (proxy === undefined) {
                proxyObserver = new ProxyObserver_1(obj);
            }
            else {
                proxyObserver = proxy.$observer;
            }
        }
        else {
            proxyObserver = obj.$observer;
        }
        if (arguments.length === 1) {
            return proxyObserver;
        }
        let subscribers = proxyObserver.subscribers[key];
        if (subscribers === undefined) {
            const raw = this.getRawIfProxy(obj);
            const proxy = proxyObserver.proxy;
            subscribers = proxyObserver.subscribers[key] = new ProxySubscriberCollection(proxy, raw, key);
        }
        return subscribers;
    }
    static isProxy(obj) {
        return obj.$raw !== undefined;
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
            Reflect.set(target, p, value, target);
            this.callPropertySubscribers(value, oldValue, p);
            this.callSubscribers(p, value, oldValue, LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
        }
        return true;
    }
    deleteProperty(target, p) {
        const oldValue = target[p];
        if (Reflect.deleteProperty(target, p)) {
            if (oldValue !== undefined) {
                this.callPropertySubscribers(undefined, oldValue, p);
                this.callSubscribers(p, undefined, oldValue, LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
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
                this.callSubscribers(p, attributes.value, oldValue, LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
            }
            return true;
        }
        return false;
    }
    apply(target, thisArg, argArray) {
        // tslint:disable-next-line:ban-types // Reflect API dictates this
        return Reflect.apply(target, target, argArray);
    }
    subscribe(subscriber, key) {
        if (arguments.length === 1) {
            this.addSubscriber(subscriber);
        }
        else {
            let subscribers = this.subscribers[key];
            if (subscribers === undefined) {
                subscribers = this.subscribers[key] = new ProxySubscriberCollection(this.proxy, this.raw, key);
            }
            subscribers.addSubscriber(subscriber);
        }
    }
    unsubscribe(subscriber, key) {
        if (arguments.length === 1) {
            this.removeSubscriber(subscriber);
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
        if (subscribers !== undefined) {
            subscribers.callSubscribers(newValue, oldValue, LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
        }
    }
};
ProxyObserver = ProxyObserver_1 = __decorate([
    subscriberCollection(MutationKind.proxy)
], ProxyObserver);

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
        const { obj, propertyKey } = this;
        this.currentValue = obj[propertyKey];
        observedPropertyDescriptor.get = () => this.getValue();
        observedPropertyDescriptor.set = value => { this.setValue(value, LifecycleFlags.updateTargetInstance); };
        if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
            Reporter.write(1, propertyKey, obj);
        }
    }
    this.addSubscriber(subscriber);
}
function dispose() {
    Reflect.deleteProperty(this.obj, this.propertyKey);
    this.obj = null;
    this.propertyKey = null;
    this.currentValue = null;
}
function propertyObserver() {
    // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
    return function (target) {
        subscriberCollection(MutationKind.instance)(target);
        const proto = target.prototype;
        proto.observing = false;
        proto.obj = null;
        proto.propertyKey = null;
        // Note: this will generate some "false positive" changes when setting a target undefined from a source undefined,
        // but those aren't harmful because the changes won't be propagated through to subscribers during $bind anyway.
        // It will, however, solve some "false negative" changes when the source value is undefined but the target value is not;
        // in such cases, this.currentValue in the observer being undefined will block the change from propagating to the target.
        // This is likely not working correctly in vCurrent either.
        proto.currentValue = Symbol();
        proto.subscribe = proto.subscribe || subscribe;
        proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
        proto.dispose = proto.dispose || dispose;
    };
}

let SetterObserver = class SetterObserver {
    constructor(flags, obj, propertyKey) {
        this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
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
            if (!(flags & LifecycleFlags.fromBind)) {
                this.callSubscribers(newValue, currentValue, this.persistentFlags | flags);
            }
            // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
            // so calling obj[propertyKey] will actually return this.currentValue.
            // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
            // is unmodified and we need to explicitly set the property value.
            // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
            // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
            if (!this.observing) {
                this.obj[this.propertyKey] = newValue;
            }
        }
    }
};
SetterObserver = __decorate([
    propertyObserver()
], SetterObserver);

var RuntimeError;
(function (RuntimeError) {
    RuntimeError[RuntimeError["UndefinedScope"] = 250] = "UndefinedScope";
    RuntimeError[RuntimeError["NullScope"] = 251] = "NullScope";
    RuntimeError[RuntimeError["NilOverrideContext"] = 252] = "NilOverrideContext";
    RuntimeError[RuntimeError["NilParentScope"] = 253] = "NilParentScope";
})(RuntimeError || (RuntimeError = {}));
/** @internal */
class InternalObserversLookup {
    getOrCreate(flags, obj, key) {
        if (this[key] === undefined) {
            this[key] = new SetterObserver(flags, obj, key);
        }
        return this[key];
    }
}
class BindingContext {
    constructor(keyOrObj, value) {
        this.$synthetic = true;
        if (keyOrObj !== undefined) {
            if (value !== undefined) {
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
        if (flags & LifecycleFlags.useProxies) {
            return ProxyObserver.getOrCreate(bc).proxy;
        }
        return bc;
    }
    static get(scope, name, ancestor, flags) {
        if (scope === undefined) {
            throw Reporter.error(250 /* UndefinedScope */);
        }
        if (scope === null) {
            throw Reporter.error(251 /* NullScope */);
        }
        let overrideContext = scope.overrideContext;
        if (ancestor > 0) {
            // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
            while (ancestor > 0) {
                if (overrideContext.parentOverrideContext === null) {
                    return undefined;
                }
                ancestor--;
                overrideContext = overrideContext.parentOverrideContext;
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
        // the name wasn't found. see if parent scope traversal is allowed and if so, try that
        if ((flags & LifecycleFlags.allowParentScopeTraversal) && scope.parentScope !== null) {
            const result = this.get(scope.parentScope, name, ancestor, flags
                // unset the flag; only allow one level of scope boundary traversal
                & ~LifecycleFlags.allowParentScopeTraversal
                // tell the scope to return null if the name could not be found
                | LifecycleFlags.isTraversingParentScope);
            if (result !== null) {
                return result;
            }
        }
        // still nothing found. return the root binding context (or null
        // if this is a parent scope traversal, to ensure we fall back to the
        // correct level)
        if (flags & LifecycleFlags.isTraversingParentScope) {
            return null;
        }
        return scope.bindingContext || scope.overrideContext;
    }
    getObservers(flags) {
        if (this.$observers === undefined) {
            this.$observers = new InternalObserversLookup();
        }
        return this.$observers;
    }
}
class Scope {
    constructor(bindingContext, overrideContext) {
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
        this.parentScope = null;
    }
    static create(flags, bc, oc) {
        return new Scope(bc, oc === null || oc === undefined ? OverrideContext.create(flags, bc, oc) : oc);
    }
    static fromOverride(flags, oc) {
        if (oc === null || oc === undefined) {
            throw Reporter.error(252 /* NilOverrideContext */);
        }
        return new Scope(oc.bindingContext, oc);
    }
    static fromParent(flags, ps, bc) {
        if (ps === null || ps === undefined) {
            throw Reporter.error(253 /* NilParentScope */);
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
        return new OverrideContext(bc, poc === undefined ? null : poc);
    }
    getObservers() {
        if (this.$observers === undefined) {
            this.$observers = new InternalObserversLookup();
        }
        return this.$observers;
    }
}

const ISignaler = DI.createInterface('ISignaler').withDefault(x => x.singleton(Signaler));
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
            listener.handleChange(undefined, undefined, flags | LifecycleFlags.updateTargetInstance);
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
    container.register(Registration.singleton(resourceKey, this));
}
function bindingBehavior(nameOrDefinition) {
    return target => BindingBehaviorResource.define(nameOrDefinition, target);
}
function keyFrom(name) {
    return `${this.name}:${name}`;
}
function isType(Type) {
    return Type.kind === this;
}
function define(nameOrDefinition, ctor) {
    const Type = ctor;
    const description = typeof nameOrDefinition === 'string'
        ? { name: nameOrDefinition }
        : nameOrDefinition;
    Type.kind = BindingBehaviorResource;
    Type.description = description;
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
    container.register(Registration.singleton(resourceKey, this));
}
function valueConverter(nameOrDefinition) {
    return target => ValueConverterResource.define(nameOrDefinition, target);
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
    if (expressions === undefined || expressions.length === 0) {
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
    RuntimeError[RuntimeError["UndefinedScope"] = 250] = "UndefinedScope";
    RuntimeError[RuntimeError["NullScope"] = 251] = "NullScope";
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
        if (scope === undefined) {
            throw Reporter.error(250 /* UndefinedScope */, this);
        }
        if (scope === null) {
            throw Reporter.error(251 /* NullScope */, this);
        }
        if (!binding) {
            throw Reporter.error(206 /* NoBinding */, this);
        }
        const locator = binding.locator;
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        if (hasBind(this.expression)) {
            this.expression.bind(flags, scope, binding);
        }
        const behaviorKey = this.behaviorKey;
        const behavior = locator.get(behaviorKey);
        if (!behavior) {
            throw Reporter.error(203 /* NoBehaviorFound */, this);
        }
        if (binding[behaviorKey] === undefined || binding[behaviorKey] === null) {
            binding[behaviorKey] = behavior;
            behavior.bind.apply(behavior, [flags, scope, binding].concat(evalList(flags, scope, locator, this.args)));
        }
        else {
            Reporter.write(204 /* BehaviorAlreadyApplied */, this);
        }
    }
    unbind(flags, scope, binding) {
        const behaviorKey = this.behaviorKey;
        if (binding[behaviorKey] !== undefined && binding[behaviorKey] !== null) {
            binding[behaviorKey].unbind(flags, scope, binding);
            binding[behaviorKey] = null;
        }
        else {
            // TODO: this is a temporary hack to make testing repeater keyed mode easier,
            // we should remove this idempotency again when track-by attribute is implemented
            Reporter.write(204 /* BehaviorAlreadyApplied */, this);
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
            throw Reporter.error(202 /* NoLocator */, this);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
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
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
        }
        if ('fromView' in converter) {
            value = converter.fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
        }
        return this.expression.assign(flags, scope, locator, value);
    }
    connect(flags, scope, binding) {
        if (scope === undefined) {
            throw Reporter.error(250 /* UndefinedScope */, this);
        }
        if (scope === null) {
            throw Reporter.error(251 /* NullScope */, this);
        }
        if (!binding) {
            throw Reporter.error(206 /* NoBinding */, this);
        }
        const locator = binding.locator;
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        this.expression.connect(flags, scope, binding);
        const args = this.args;
        for (let i = 0, ii = args.length; i < ii; ++i) {
            args[i].connect(flags, scope, binding);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
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
        this.assign = PLATFORM.noop;
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
        this.assign = PLATFORM.noop;
        this.connect = PLATFORM.noop;
        this.ancestor = ancestor;
    }
    evaluate(flags, scope, locator) {
        if (scope === undefined) {
            throw Reporter.error(250 /* UndefinedScope */, this);
        }
        if (scope === null) {
            throw Reporter.error(251 /* NullScope */, this);
        }
        let oc = scope.overrideContext;
        let i = this.ancestor;
        while (i-- && oc) {
            oc = oc.parentOverrideContext;
        }
        return i < 1 && oc ? oc.bindingContext : undefined;
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
        const context = BindingContext.get(scope, this.name, this.ancestor, flags);
        return context ? (context[this.name] = value) : undefined;
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
        this.assign = PLATFORM.noop;
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
        return undefined;
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
        this.assign = PLATFORM.noop;
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
        if (getFunction(flags & ~LifecycleFlags.mustEvaluate, obj, this.name)) {
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
        this.assign = PLATFORM.noop;
        this.func = func;
        this.args = args;
    }
    evaluate(flags, scope, locator) {
        const func = this.func.evaluate(flags, scope, locator);
        if (typeof func === 'function') {
            return func.apply(null, evalList(flags, scope, locator, this.args));
        }
        if (!(flags & LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
            return undefined;
        }
        throw Reporter.error(207 /* NotAFunction */, this);
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
        this.assign = PLATFORM.noop;
        this.operation = operation;
        this.left = left;
        this.right = right;
        // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
        // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
        // work to do; we can do this because the operation can't change after it's parsed
        this.evaluate = this[operation];
    }
    evaluate(flags, scope, locator) {
        throw Reporter.error(208 /* UnknownOperator */, this);
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
    // tslint:disable-next-line:member-ordering
    accept(visitor) {
        return visitor.visitBinary(this);
    }
}
class Unary {
    constructor(operation, expression) {
        this.$kind = 39 /* Unary */;
        this.assign = PLATFORM.noop;
        this.operation = operation;
        this.expression = expression;
        // see Binary (we're doing the same thing here)
        this.evaluate = this[operation];
    }
    evaluate(flags, scope, locator) {
        throw Reporter.error(208 /* UnknownOperator */, this);
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
        this.assign = PLATFORM.noop;
        this.connect = PLATFORM.noop;
        this.value = value;
    }
    evaluate(flags, scope, locator) {
        return this.value;
    }
    accept(visitor) {
        return visitor.visitPrimitiveLiteral(this);
    }
}
PrimitiveLiteral.$undefined = new PrimitiveLiteral(undefined);
PrimitiveLiteral.$null = new PrimitiveLiteral(null);
PrimitiveLiteral.$true = new PrimitiveLiteral(true);
PrimitiveLiteral.$false = new PrimitiveLiteral(false);
PrimitiveLiteral.$empty = new PrimitiveLiteral('');
class HtmlLiteral {
    constructor(parts) {
        this.$kind = 51 /* HtmlLiteral */;
        this.assign = PLATFORM.noop;
        this.parts = parts;
    }
    evaluate(flags, scope, locator) {
        const elements = this.parts;
        let result = '';
        let value;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            value = elements[i].evaluate(flags, scope, locator);
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
    accept(visitor) {
        return visitor.visitHtmlLiteral(this);
    }
}
class ArrayLiteral {
    constructor(elements) {
        this.$kind = 17955 /* ArrayLiteral */;
        this.assign = PLATFORM.noop;
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
ArrayLiteral.$empty = new ArrayLiteral(PLATFORM.emptyArray);
class ObjectLiteral {
    constructor(keys, values) {
        this.$kind = 17956 /* ObjectLiteral */;
        this.assign = PLATFORM.noop;
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
ObjectLiteral.$empty = new ObjectLiteral(PLATFORM.emptyArray, PLATFORM.emptyArray);
class Template {
    constructor(cooked, expressions) {
        this.$kind = 17958 /* Template */;
        this.assign = PLATFORM.noop;
        this.cooked = cooked;
        this.expressions = expressions === undefined ? PLATFORM.emptyArray : expressions;
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
        this.assign = PLATFORM.noop;
        this.cooked = cooked;
        this.cooked.raw = raw;
        this.func = func;
        this.expressions = expressions === undefined ? PLATFORM.emptyArray : expressions;
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
            throw Reporter.error(207 /* NotAFunction */, this);
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
        return undefined;
    }
    assign(flags, scope, locator, obj) {
        // TODO
        return undefined;
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
        return undefined;
    }
    assign(flags, scope, locator, obj) {
        // TODO
        return undefined;
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
        this.assign = PLATFORM.noop;
        this.declaration = declaration;
        this.iterable = iterable;
    }
    evaluate(flags, scope, locator) {
        return this.iterable.evaluate(flags, scope, locator);
    }
    count(result) {
        return CountForOfStatement[toStringTag.call(result)](result);
    }
    iterate(result, func) {
        IterateForOfStatement[toStringTag.call(result)](result, func);
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
        this.assign = PLATFORM.noop;
        this.parts = parts;
        this.expressions = expressions === undefined ? PLATFORM.emptyArray : expressions;
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
    const func = obj === null || obj === undefined ? null : obj[name];
    if (typeof func === 'function') {
        return func;
    }
    if (!(flags & LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
        return null;
    }
    throw Reporter.error(207 /* NotAFunction */, obj, name, func);
}
function isNumeric(value) {
    const valueType = typeof value;
    if (valueType === 'number')
        return true;
    if (valueType !== 'string')
        return false;
    const len = value.length;
    if (len === 0)
        return false;
    let char;
    for (let i = 0; i < len; ++i) {
        char = value.charCodeAt(i);
        if (char < 0x30 /*0*/ || char > 0x39 /*9*/) {
            return false;
        }
    }
    return true;
}
/** @internal */
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
    ['[object Null]'](result, func) {
        return;
    },
    ['[object Undefined]'](result, func) {
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

const IRenderable = DI.createInterface('IRenderable').noDefault();
const IViewFactory = DI.createInterface('IViewFactory').noDefault();
const marker = Object.freeze(Object.create(null));
const ILifecycle = DI.createInterface('ILifecycle').withDefault(x => x.singleton(Lifecycle));
/** @internal */
class Lifecycle {
    constructor() {
        this.bindDepth = 0;
        this.attachDepth = 0;
        this.detachDepth = 0;
        this.unbindDepth = 0;
        this.flushHead = this;
        this.flushTail = this;
        this.connectHead = this; // this cast is safe because we know exactly which properties we'll use
        this.connectTail = this;
        this.patchHead = this;
        this.patchTail = this;
        this.boundHead = this;
        this.boundTail = this;
        this.mountHead = this;
        this.mountTail = this;
        this.attachedHead = this;
        this.attachedTail = this;
        this.unmountHead = this;
        this.unmountTail = this;
        this.detachedHead = this; //LOL
        this.detachedTail = this;
        this.unbindAfterDetachHead = this;
        this.unbindAfterDetachTail = this;
        this.unboundHead = this;
        this.unboundTail = this;
        this.flushed = null;
        this.promise = Promise.resolve();
        this.flushCount = 0;
        this.connectCount = 0;
        this.patchCount = 0;
        this.boundCount = 0;
        this.mountCount = 0;
        this.attachedCount = 0;
        this.unmountCount = 0;
        this.detachedCount = 0;
        this.unbindAfterDetachCount = 0;
        this.unboundCount = 0;
        this.$nextFlush = marker;
        this.flush = PLATFORM.noop;
        this.$nextConnect = marker;
        this.connect = PLATFORM.noop;
        this.$nextPatch = marker;
        this.patch = PLATFORM.noop;
        this.$nextBound = marker;
        this.bound = PLATFORM.noop;
        this.$nextMount = marker;
        this.$mount = PLATFORM.noop;
        this.$nextAttached = marker;
        this.attached = PLATFORM.noop;
        this.$nextUnmount = marker;
        this.$unmount = PLATFORM.noop;
        this.$nextDetached = marker;
        this.detached = PLATFORM.noop;
        this.$nextUnbindAfterDetach = marker;
        this.$unbind = PLATFORM.noop;
        this.$nextUnbound = marker;
        this.unbound = PLATFORM.noop;
        this.task = null;
    }
    static register(container) {
        return Registration.singleton(ILifecycle, this).register(container);
    }
    registerTask(task) {
        if (this.task === null) {
            this.task = new AggregateLifecycleTask();
        }
        this.task.addTask(task);
    }
    finishTask(task) {
        if (this.task !== null) {
            if (this.task === task) {
                this.task = null;
            }
            else {
                this.task.removeTask(task);
            }
        }
    }
    enqueueFlush(requestor) {
        // Queue a flush() callback; the depth is just for debugging / testing purposes and has
        // no effect on execution. flush() will automatically be invoked when the promise resolves,
        // or it can be manually invoked synchronously.
        if (this.flushHead === this) {
            this.flushed = this.promise.then(() => { this.processFlushQueue(LifecycleFlags.fromAsyncFlush); });
        }
        if (requestor.$nextFlush === null) {
            requestor.$nextFlush = marker;
            this.flushTail.$nextFlush = requestor;
            this.flushTail = requestor;
            ++this.flushCount;
        }
        return this.flushed;
    }
    processFlushQueue(flags) {
        flags |= LifecycleFlags.fromSyncFlush;
        // flush callbacks may lead to additional flush operations, so keep looping until
        // the flush head is back to `this` (though this will typically happen in the first iteration)
        while (this.flushCount > 0) {
            let current = this.flushHead.$nextFlush;
            this.flushHead = this.flushTail = this;
            this.flushCount = 0;
            let next;
            do {
                next = current.$nextFlush;
                current.$nextFlush = null;
                current.flush(flags);
                current = next;
            } while (current !== marker);
            // doNotUpdateDOM will cause DOM updates to be re-queued which results in an infinite loop
            // unless we break here
            // Note that breaking on this flag is still not the ideal solution; future improvement would
            // be something like a separate DOM queue and a non-DOM queue, but for now this fixes the infinite
            // loop without breaking anything (apart from the edgiest of edge cases which are not yet tested)
            if (flags & LifecycleFlags.doNotUpdateDOM) {
                break;
            }
        }
    }
    beginBind() {
        ++this.bindDepth;
    }
    enqueueBound(requestor) {
        // build a standard singly linked list for bound callbacks
        if (requestor.$nextBound === null) {
            requestor.$nextBound = marker;
            this.boundTail.$nextBound = requestor;
            this.boundTail = requestor;
            ++this.boundCount;
        }
    }
    enqueueConnect(requestor) {
        // enqueue connect and patch calls in separate lists so that they can be invoked
        // independently from eachother
        // TODO: see if we can eliminate/optimize some of this, because this is a relatively hot path
        // (first get all the necessary integration tests working, then look for optimizations)
        // build a standard singly linked list for connect callbacks
        if (requestor.$nextConnect === null) {
            requestor.$nextConnect = marker;
            this.connectTail.$nextConnect = requestor;
            this.connectTail = requestor;
            ++this.connectCount;
        }
        // build a standard singly linked list for patch callbacks
        if (requestor.$nextPatch === null) {
            requestor.$nextPatch = marker;
            this.patchTail.$nextPatch = requestor;
            this.patchTail = requestor;
            ++this.patchCount;
        }
    }
    processConnectQueue(flags) {
        // connects cannot lead to additional connects, so we don't need to loop here
        if (this.connectCount > 0) {
            this.connectCount = 0;
            let current = this.connectHead.$nextConnect;
            this.connectHead = this.connectTail = this;
            let next;
            do {
                current.connect(flags);
                next = current.$nextConnect;
                current.$nextConnect = null;
                current = next;
            } while (current !== marker);
        }
    }
    processPatchQueue(flags) {
        // flush before patching, but only if this is the initial bind;
        // no DOM is attached yet so we can safely let everything propagate
        if (flags & LifecycleFlags.fromStartTask) {
            this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
        }
        // patch callbacks may lead to additional bind operations, so keep looping until
        // the patch head is back to `this` (though this will typically happen in the first iteration)
        while (this.patchCount > 0) {
            this.patchCount = 0;
            let current = this.patchHead.$nextPatch;
            this.patchHead = this.patchTail = this;
            let next;
            do {
                current.patch(flags);
                next = current.$nextPatch;
                current.$nextPatch = null;
                current = next;
            } while (current !== marker);
        }
    }
    endBind(flags) {
        // close / shrink a bind batch
        if (--this.bindDepth === 0) {
            if (this.task !== null && !this.task.done) {
                this.task.owner = this;
                return this.task;
            }
            this.processBindQueue(flags);
            return LifecycleTask.done;
        }
    }
    processBindQueue(flags) {
        // flush before processing bound callbacks, but only if this is the initial bind;
        // no DOM is attached yet so we can safely let everything propagate
        if (flags & LifecycleFlags.fromStartTask) {
            this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
        }
        // bound callbacks may lead to additional bind operations, so keep looping until
        // the bound head is back to `this` (though this will typically happen in the first iteration)
        while (this.boundCount > 0) {
            this.boundCount = 0;
            let current = this.boundHead.$nextBound;
            let next;
            this.boundHead = this.boundTail = this;
            do {
                current.bound(flags);
                next = current.$nextBound;
                current.$nextBound = null;
                current = next;
            } while (current !== marker);
        }
    }
    beginUnbind() {
        // open up / expand an unbind batch; the very first caller will close it again with endUnbind
        ++this.unbindDepth;
    }
    enqueueUnbound(requestor) {
        // This method is idempotent; adding the same item more than once has the same effect as
        // adding it once.
        // build a standard singly linked list for unbound callbacks
        if (requestor.$nextUnbound === null) {
            requestor.$nextUnbound = marker;
            this.unboundTail.$nextUnbound = requestor;
            this.unboundTail = requestor;
            ++this.unboundCount;
        }
    }
    endUnbind(flags) {
        // close / shrink an unbind batch
        if (--this.unbindDepth === 0) {
            if (this.task !== null && !this.task.done) {
                this.task.owner = this;
                return this.task;
            }
            this.processUnbindQueue(flags);
            return LifecycleTask.done;
        }
    }
    processUnbindQueue(flags) {
        // unbound callbacks may lead to additional unbind operations, so keep looping until
        // the unbound head is back to `this` (though this will typically happen in the first iteration)
        while (this.unboundCount > 0) {
            this.unboundCount = 0;
            let current = this.unboundHead.$nextUnbound;
            let next;
            this.unboundHead = this.unboundTail = this;
            do {
                current.unbound(flags);
                next = current.$nextUnbound;
                current.$nextUnbound = null;
                current = next;
            } while (current !== marker);
        }
    }
    beginAttach() {
        // open up / expand an attach batch; the very first caller will close it again with endAttach
        ++this.attachDepth;
    }
    enqueueMount(requestor) {
        // This method is idempotent; adding the same item more than once has the same effect as
        // adding it once.
        // build a standard singly linked list for mount callbacks
        if (requestor.$nextMount === null) {
            requestor.$nextMount = marker;
            this.mountTail.$nextMount = requestor;
            this.mountTail = requestor;
            ++this.mountCount;
        }
    }
    enqueueAttached(requestor) {
        // This method is idempotent; adding the same item more than once has the same effect as
        // adding it once.
        // build a standard singly linked list for attached callbacks
        if (requestor.$nextAttached === null) {
            requestor.$nextAttached = marker;
            this.attachedTail.$nextAttached = requestor;
            this.attachedTail = requestor;
            ++this.attachedCount;
        }
    }
    endAttach(flags) {
        // close / shrink an attach batch
        if (--this.attachDepth === 0) {
            if (this.task !== null && !this.task.done) {
                this.task.owner = this;
                return this.task;
            }
            this.processAttachQueue(flags);
            return LifecycleTask.done;
        }
    }
    processAttachQueue(flags) {
        // flush and patch before starting the attach lifecycle to ensure batched collection changes are propagated to repeaters
        // and the DOM is updated
        this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
        // TODO: prevent duplicate updates coming from the patch queue (or perhaps it's just not needed in its entirety?)
        //this.processPatchQueue(flags | LifecycleFlags.fromSyncFlush);
        if (this.mountCount > 0) {
            this.mountCount = 0;
            let currentMount = this.mountHead.$nextMount;
            this.mountHead = this.mountTail = this;
            let nextMount;
            do {
                currentMount.$mount(flags);
                nextMount = currentMount.$nextMount;
                currentMount.$nextMount = null;
                currentMount = nextMount;
            } while (currentMount !== marker);
        }
        // Connect all connect-queued bindings AFTER mounting is done, so that the DOM is visible asap,
        // but connect BEFORE running the attached callbacks to ensure any changes made during those callbacks
        // are still accounted for.
        // TODO: add a flag/option to further delay connect with a RAF callback (the tradeoff would be that we'd need
        // to run an additional patch cycle before that connect, which can be expensive and unnecessary in most real
        // world scenarios, but can significantly speed things up with nested, highly volatile data like in dbmonster)
        this.processConnectQueue(LifecycleFlags.mustEvaluate);
        if (this.attachedCount > 0) {
            this.attachedCount = 0;
            let currentAttached = this.attachedHead.$nextAttached;
            this.attachedHead = this.attachedTail = this;
            let nextAttached;
            do {
                currentAttached.attached(flags);
                nextAttached = currentAttached.$nextAttached;
                currentAttached.$nextAttached = null;
                currentAttached = nextAttached;
            } while (currentAttached !== marker);
        }
    }
    beginDetach() {
        // open up / expand a detach batch; the very first caller will close it again with endDetach
        ++this.detachDepth;
    }
    enqueueUnmount(requestor) {
        // This method is idempotent; adding the same item more than once has the same effect as
        // adding it once.
        // build a standard singly linked list for unmount callbacks
        if (requestor.$nextUnmount === null) {
            requestor.$nextUnmount = marker;
            this.unmountTail.$nextUnmount = requestor;
            this.unmountTail = requestor;
            ++this.unmountCount;
        }
        // this is a temporary solution until a cleaner method surfaces.
        // if an item being queued for unmounting is already in the mount queue,
        // remove it from the mount queue (this can occur in some very exotic situations
        // and should be dealt with in a less hacky way)
        if (requestor.$nextMount !== null) {
            let current = this.mountHead;
            let next = current.$nextMount;
            while (next !== requestor) {
                current = next;
                next = current.$nextMount;
            }
            current.$nextMount = next.$nextMount;
            next.$nextMount = null;
            if (this.mountTail === next) {
                this.mountTail = this;
            }
            --this.mountCount;
        }
    }
    enqueueDetached(requestor) {
        // This method is idempotent; adding the same item more than once has the same effect as
        // adding it once.
        // build a standard singly linked list for detached callbacks
        if (requestor.$nextDetached === null) {
            requestor.$nextDetached = marker;
            this.detachedTail.$nextDetached = requestor;
            this.detachedTail = requestor;
            ++this.detachedCount;
        }
    }
    enqueueUnbindAfterDetach(requestor) {
        // This method is idempotent; adding the same item more than once has the same effect as
        // adding it once.
        // build a standard singly linked list for unbindAfterDetach callbacks
        if (requestor.$nextUnbindAfterDetach === null) {
            requestor.$nextUnbindAfterDetach = marker;
            this.unbindAfterDetachTail.$nextUnbindAfterDetach = requestor;
            this.unbindAfterDetachTail = requestor;
            ++this.unbindAfterDetachCount;
        }
    }
    endDetach(flags) {
        // close / shrink a detach batch
        if (--this.detachDepth === 0) {
            if (this.task !== null && !this.task.done) {
                this.task.owner = this;
                return this.task;
            }
            this.processDetachQueue(flags);
            return LifecycleTask.done;
        }
    }
    processDetachQueue(flags) {
        // flush before unmounting to ensure batched collection changes propagate to the repeaters,
        // which may lead to additional unmount operations
        this.processFlushQueue(flags | LifecycleFlags.fromFlush | LifecycleFlags.doNotUpdateDOM);
        if (this.unmountCount > 0) {
            this.unmountCount = 0;
            let currentUnmount = this.unmountHead.$nextUnmount;
            this.unmountHead = this.unmountTail = this;
            let nextUnmount;
            do {
                currentUnmount.$unmount(flags);
                nextUnmount = currentUnmount.$nextUnmount;
                currentUnmount.$nextUnmount = null;
                currentUnmount = nextUnmount;
            } while (currentUnmount !== marker);
        }
        if (this.detachedCount > 0) {
            this.detachedCount = 0;
            let currentDetached = this.detachedHead.$nextDetached;
            this.detachedHead = this.detachedTail = this;
            let nextDetached;
            do {
                currentDetached.detached(flags);
                nextDetached = currentDetached.$nextDetached;
                currentDetached.$nextDetached = null;
                currentDetached = nextDetached;
            } while (currentDetached !== marker);
        }
        if (this.unbindAfterDetachCount > 0) {
            this.beginUnbind();
            this.unbindAfterDetachCount = 0;
            let currentUnbind = this.unbindAfterDetachHead.$nextUnbindAfterDetach;
            this.unbindAfterDetachHead = this.unbindAfterDetachTail = this;
            let nextUnbind;
            do {
                currentUnbind.$unbind(flags);
                nextUnbind = currentUnbind.$nextUnbindAfterDetach;
                currentUnbind.$nextUnbindAfterDetach = null;
                currentUnbind = nextUnbind;
            } while (currentUnbind !== marker);
            this.endUnbind(flags);
        }
    }
}
class CompositionCoordinator {
    constructor($lifecycle) {
        this.$lifecycle = $lifecycle;
        this.onSwapComplete = PLATFORM.noop;
        this.currentView = null;
        this.isAttached = false;
        this.isBound = false;
        this.queue = null;
        this.swapTask = LifecycleTask.done;
    }
    static register(container) {
        return Registration.transient(this, this).register(container, this);
    }
    compose(value, flags) {
        if (this.swapTask.done) {
            if (value instanceof Promise) {
                this.enqueue(new PromiseSwap(this, value));
                this.processNext();
            }
            else {
                this.swap(value, flags);
            }
        }
        else {
            if (value instanceof Promise) {
                this.enqueue(new PromiseSwap(this, value));
            }
            else {
                this.enqueue(value);
            }
            if (this.swapTask.canCancel()) {
                this.swapTask.cancel();
            }
        }
    }
    binding(flags, scope) {
        this.scope = scope;
        this.isBound = true;
        if (this.currentView !== null) {
            this.currentView.$bind(flags, scope);
        }
    }
    attaching(flags) {
        this.isAttached = true;
        if (this.currentView !== null) {
            this.currentView.$attach(flags);
        }
    }
    detaching(flags) {
        this.isAttached = false;
        if (this.currentView !== null) {
            this.currentView.$detach(flags);
        }
    }
    unbinding(flags) {
        this.isBound = false;
        if (this.currentView !== null) {
            this.currentView.$unbind(flags);
        }
    }
    caching(flags) {
        this.currentView = null;
    }
    enqueue(view) {
        if (this.queue === null) {
            this.queue = [];
        }
        this.queue.push(view);
    }
    swap(view, flags) {
        if (this.currentView === view) {
            return;
        }
        const $lifecycle = this.$lifecycle;
        const swapTask = new AggregateLifecycleTask();
        let lifecycleTask;
        let currentView = this.currentView;
        if (currentView === null) {
            lifecycleTask = LifecycleTask.done;
        }
        else {
            $lifecycle.enqueueUnbindAfterDetach(currentView);
            $lifecycle.beginDetach();
            currentView.$detach(flags);
            lifecycleTask = $lifecycle.endDetach(flags);
        }
        swapTask.addTask(lifecycleTask);
        currentView = this.currentView = view;
        if (currentView === null) {
            lifecycleTask = LifecycleTask.done;
        }
        else {
            if (this.isBound) {
                $lifecycle.beginBind();
                currentView.$bind(flags, this.scope);
                $lifecycle.endBind(flags);
            }
            if (this.isAttached) {
                $lifecycle.beginAttach();
                currentView.$attach(flags);
                lifecycleTask = $lifecycle.endAttach(flags);
            }
            else {
                lifecycleTask = LifecycleTask.done;
            }
        }
        swapTask.addTask(lifecycleTask);
        if (swapTask.done) {
            this.swapTask = LifecycleTask.done;
            this.onSwapComplete();
        }
        else {
            this.swapTask = swapTask;
            this.swapTask.wait().then(() => {
                this.onSwapComplete();
                this.processNext();
            }).catch(error => { throw error; });
        }
    }
    processNext() {
        if (this.queue !== null && this.queue.length > 0) {
            const next = this.queue.pop();
            this.queue.length = 0;
            if (PromiseSwap.is(next)) {
                this.swapTask = next.start();
            }
            else {
                this.swap(next, LifecycleFlags.fromLifecycleTask);
            }
        }
        else {
            this.swapTask = LifecycleTask.done;
        }
    }
}
CompositionCoordinator.inject = [ILifecycle];
const LifecycleTask = {
    done: {
        done: true,
        canCancel() { return false; },
        cancel() { return; },
        wait() { return Promise.resolve(); }
    }
};
class AggregateLifecycleTask {
    constructor() {
        this.done = true;
        this.owner = null;
        this.resolve = null;
        this.tasks = [];
        this.waiter = null;
    }
    addTask(task) {
        if (!task.done) {
            this.done = false;
            this.tasks.push(task);
            task.wait().then(() => { this.tryComplete(); }).catch(error => { throw error; });
        }
    }
    removeTask(task) {
        if (task.done) {
            const idx = this.tasks.indexOf(task);
            if (idx !== -1) {
                this.tasks.splice(idx, 1);
            }
        }
        if (this.tasks.length === 0 && this.owner !== null) {
            this.owner.finishTask(this);
            this.owner = null;
        }
    }
    canCancel() {
        if (this.done) {
            return false;
        }
        return this.tasks.every(x => x.canCancel());
    }
    cancel() {
        if (this.canCancel()) {
            this.tasks.forEach(x => { x.cancel(); });
            this.done = false;
        }
    }
    wait() {
        if (this.waiter === null) {
            if (this.done) {
                this.waiter = Promise.resolve();
            }
            else {
                // tslint:disable-next-line:promise-must-complete
                this.waiter = new Promise((resolve) => this.resolve = resolve);
            }
        }
        return this.waiter;
    }
    tryComplete() {
        if (this.done) {
            return;
        }
        if (this.tasks.every(x => x.done)) {
            this.complete(true);
        }
    }
    complete(notCancelled) {
        this.done = true;
        if (notCancelled && this.owner !== null) {
            this.owner.processDetachQueue(LifecycleFlags.fromLifecycleTask);
            this.owner.processUnbindQueue(LifecycleFlags.fromLifecycleTask);
            this.owner.processBindQueue(LifecycleFlags.fromLifecycleTask);
            this.owner.processAttachQueue(LifecycleFlags.fromLifecycleTask);
        }
        this.owner.finishTask(this);
        if (this.resolve !== null) {
            this.resolve();
        }
    }
}
/** @internal */
class PromiseSwap {
    constructor(coordinator, promise) {
        this.coordinator = coordinator;
        this.done = false;
        this.isCancelled = false;
        this.promise = promise;
    }
    static is(object) {
        return 'start' in object;
    }
    start() {
        if (this.isCancelled) {
            return LifecycleTask.done;
        }
        this.promise = this.promise.then(x => {
            this.onResolve(x);
            return x;
        });
        return this;
    }
    canCancel() {
        return !this.done;
    }
    cancel() {
        if (this.canCancel()) {
            this.isCancelled = true;
        }
    }
    wait() {
        return this.promise;
    }
    onResolve(value) {
        if (this.isCancelled) {
            return;
        }
        this.done = true;
        this.coordinator.compose(value, LifecycleFlags.fromLifecycleTask);
    }
}
// tslint:disable:jsdoc-format
/**
 * A general-purpose ILifecycleTask implementation that can be placed
 * before an attached, detached, bound or unbound hook during attaching,
 * detaching, binding or unbinding, respectively.
 *
 * The provided promise will be awaited before the corresponding lifecycle
 * hook (and any hooks following it) is invoked.
 *
 * The provided callback will be invoked after the promise is resolved
 * and before the next lifecycle hook.
 *
 * Example:
```ts
export class MyViewModel {
  private $lifecycle: ILifecycle; // set before created() hook
  private answer: number;

  public binding(flags: LifecycleFlags): void {
    // this.answer === undefined
    this.$lifecycle.registerTask(new PromiseTask(
      this.getAnswerAsync,
      answer => {
        this.answer = answer;
      }
    ));
  }

  public bound(flags: LifecycleFlags): void {
    // this.answer === 42
  }

  private getAnswerAsync(): Promise<number> {
    return Promise.resolve().then(() => 42);
  }
}
```
 */
// tslint:enable:jsdoc-format
class PromiseTask {
    constructor(promise, callback) {
        this.done = false;
        this.isCancelled = false;
        this.callback = callback;
        this.promise = promise.then(value => {
            if (this.isCancelled === true) {
                return;
            }
            this.done = true;
            this.callback(value);
            return value;
        });
    }
    canCancel() {
        return !this.done;
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
    const observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
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
    ensureEnoughSlotNames(i);
}
/** @internal */
function observeProperty(flags, obj, propertyName) {
    const observer = this.observerLocator.getObserver(flags, obj, propertyName);
    /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
     *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
     *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
     *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
     *
     * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
     */
    this.addObserver(observer);
}
/** @internal */
function unobserve(all$$1) {
    const slots = this.observerSlots;
    let slotName;
    let observer;
    if (all$$1 === true) {
        for (let i = 0; i < slots; ++i) {
            slotName = slotNames[i];
            observer = this[slotName];
            if (observer !== null && observer !== undefined) {
                this[slotName] = null;
                observer.unsubscribe(this);
            }
        }
    }
    else {
        const version = this.version;
        for (let i = 0; i < slots; ++i) {
            if (this[versionSlotNames[i]] !== version) {
                slotName = slotNames[i];
                observer = this[slotName];
                if (observer !== null && observer !== undefined) {
                    this[slotName] = null;
                    observer.unsubscribe(this);
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
    return target === undefined ? connectableDecorator : connectableDecorator(target);
}

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;
let Binding = class Binding {
    constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
        this.$nextBinding = null;
        this.$prevBinding = null;
        this.$state = 0 /* none */;
        this.$lifecycle = locator.get(ILifecycle);
        this.$nextConnect = null;
        this.$nextPatch = null;
        this.$scope = null;
        this.locator = locator;
        this.mode = mode;
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.persistentFlags = LifecycleFlags.none;
    }
    updateTarget(value, flags) {
        flags |= this.persistentFlags;
        this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
    }
    updateSource(value, flags) {
        flags |= this.persistentFlags;
        this.sourceExpression.assign(flags | LifecycleFlags.updateSourceExpression, this.$scope, this.locator, value);
    }
    handleChange(newValue, _previousValue, flags) {
        if (!(this.$state & 2 /* isBound */)) {
            return;
        }
        flags |= this.persistentFlags;
        if (this.mode === BindingMode.fromView) {
            flags &= ~LifecycleFlags.updateTargetInstance;
            flags |= LifecycleFlags.updateSourceExpression;
        }
        if (flags & LifecycleFlags.updateTargetInstance) {
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
            return;
        }
        if (flags & LifecycleFlags.updateSourceExpression) {
            if (newValue !== this.sourceExpression.evaluate(flags, this.$scope, this.locator)) {
                this.updateSource(newValue, flags);
            }
            return;
        }
        throw Reporter.error(15, LifecycleFlags[flags]);
    }
    $bind(flags, scope) {
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags | LifecycleFlags.fromBind);
        }
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        // Store flags which we can only receive during $bind and need to pass on
        // to the AST during evaluate/connect/assign
        this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
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
        if (targetObserver.bind) {
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
        }
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
    }
    $unbind(flags) {
        if (!(this.$state & 2 /* isBound */)) {
            return;
        }
        // add isUnbinding flag
        this.$state |= 64 /* isUnbinding */;
        // clear persistent flags
        this.persistentFlags = LifecycleFlags.none;
        if (hasUnbind(this.sourceExpression)) {
            this.sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        if (this.targetObserver.unbind) {
            this.targetObserver.unbind(flags);
        }
        if (this.targetObserver.unsubscribe) {
            this.targetObserver.unsubscribe(this);
        }
        this.unobserve(true);
        // remove isBound and isUnbinding flags
        this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
    }
    connect(flags) {
        if (this.$state & 2 /* isBound */) {
            flags |= this.persistentFlags;
            this.sourceExpression.connect(flags | LifecycleFlags.mustEvaluate, this.$scope, this);
        }
    }
    patch(flags) {
        if (this.$state & 2 /* isBound */) {
            flags |= this.persistentFlags;
            this.updateTarget(this.sourceExpression.evaluate(flags | LifecycleFlags.mustEvaluate, this.$scope, this.locator), flags);
        }
    }
};
Binding = __decorate([
    connectable()
], Binding);

class Call {
    constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
        this.$nextBinding = null;
        this.$prevBinding = null;
        this.$state = 0 /* none */;
        this.locator = locator;
        this.sourceExpression = sourceExpression;
        this.targetObserver = observerLocator.getObserver(LifecycleFlags.none, target, targetProperty);
    }
    callSource(args) {
        const overrideContext = this.$scope.overrideContext;
        Object.assign(overrideContext, args);
        const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator);
        for (const prop in args) {
            Reflect.deleteProperty(overrideContext, prop);
        }
        return result;
    }
    $bind(flags, scope) {
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags | LifecycleFlags.fromBind);
        }
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        this.$scope = scope;
        if (hasBind(this.sourceExpression)) {
            this.sourceExpression.bind(flags, scope, this);
        }
        this.targetObserver.setValue($args => this.callSource($args), flags);
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
    }
    $unbind(flags) {
        if (!(this.$state & 2 /* isBound */)) {
            return;
        }
        // add isUnbinding flag
        this.$state |= 64 /* isUnbinding */;
        if (hasUnbind(this.sourceExpression)) {
            this.sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        this.targetObserver.setValue(null, flags);
        // remove isBound and isUnbinding flags
        this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
    }
    observeProperty(flags, obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}

const IExpressionParser = DI.createInterface('IExpressionParser').withDefault(x => x.singleton(ExpressionParser));
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
                if (found === undefined) {
                    found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
                }
                return found;
            }
            case 539 /* ForCommand */: {
                let found = this.forOfLookup[expression];
                if (found === undefined) {
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
                if (found === undefined) {
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
                current = new CallScope(firstPart.replace('()', ''), PLATFORM.emptyArray);
            }
            else {
                current = new AccessScope(parts[0]);
            }
            let index = 1;
            while (index < parts.length) {
                const currentPart = parts[index];
                if (currentPart.endsWith('()')) {
                    current = new CallMember(current, currentPart.replace('()', ''), PLATFORM.emptyArray);
                }
                else {
                    current = new AccessMember(current, parts[index]);
                }
                index++;
            }
            return current;
        }
        catch (e) {
            throw Reporter.error(3, e);
        }
    }
}
var BindingType;
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
})(BindingType || (BindingType = {}));

const { toView: toView$1, oneTime: oneTime$1 } = BindingMode;
class MultiInterpolationBinding {
    constructor(observerLocator, interpolation, target, targetProperty, mode, locator) {
        this.$nextBinding = null;
        this.$prevBinding = null;
        this.$state = 0 /* none */;
        this.$scope = null;
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
            parts[i] = new InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
        }
    }
    $bind(flags, scope) {
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        this.$state |= 2 /* isBound */;
        this.$scope = scope;
        const parts = this.parts;
        for (let i = 0, ii = parts.length; i < ii; ++i) {
            parts[i].$bind(flags, scope);
        }
    }
    $unbind(flags) {
        if (!(this.$state & 2 /* isBound */)) {
            return;
        }
        this.$state &= ~2 /* isBound */;
        this.$scope = null;
        const parts = this.parts;
        for (let i = 0, ii = parts.length; i < ii; ++i) {
            parts[i].$unbind(flags);
        }
    }
}
let InterpolationBinding = class InterpolationBinding {
    // tslint:disable-next-line:parameters-max-number
    constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
        this.$state = 0 /* none */;
        this.interpolation = interpolation;
        this.isFirst = isFirst;
        this.mode = mode;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.targetObserver = observerLocator.getAccessor(LifecycleFlags.none, target, targetProperty);
    }
    updateTarget(value, flags) {
        this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
    }
    handleChange(_newValue, _previousValue, flags) {
        if (!(this.$state & 2 /* isBound */)) {
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
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        this.$state |= 2 /* isBound */;
        this.$scope = scope;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.bind) {
            sourceExpression.bind(flags, scope, this);
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
        if (!(this.$state & 2 /* isBound */)) {
            return;
        }
        this.$state &= ~2 /* isBound */;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.unbind) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        this.unobserve(true);
    }
};
InterpolationBinding = __decorate([
    connectable()
], InterpolationBinding);

let LetBinding = class LetBinding {
    constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
        this.$nextBinding = null;
        this.$prevBinding = null;
        this.$state = 0 /* none */;
        this.$lifecycle = locator.get(ILifecycle);
        this.$scope = null;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.target = null;
        this.targetProperty = targetProperty;
        this.toViewModel = toViewModel;
    }
    handleChange(_newValue, _previousValue, flags) {
        if (!(this.$state & 2 /* isBound */)) {
            return;
        }
        if (flags & LifecycleFlags.updateTargetInstance) {
            const { target, targetProperty } = this;
            const previousValue = target[targetProperty];
            const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
            if (newValue !== previousValue) {
                target[targetProperty] = newValue;
            }
            return;
        }
        throw Reporter.error(15, flags);
    }
    $bind(flags, scope) {
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags | LifecycleFlags.fromBind);
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
        this.target[this.targetProperty] = this.sourceExpression.evaluate(LifecycleFlags.fromBind, scope, this.locator);
        this.sourceExpression.connect(flags, scope, this);
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
    }
    $unbind(flags) {
        if (!(this.$state & 2 /* isBound */)) {
            return;
        }
        // add isUnbinding flag
        this.$state |= 64 /* isUnbinding */;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.unbind) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        this.unobserve(true);
        // remove isBound and isUnbinding flags
        this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
    }
};
LetBinding = __decorate([
    connectable()
], LetBinding);

class Ref {
    constructor(sourceExpression, target, locator) {
        this.$nextBinding = null;
        this.$prevBinding = null;
        this.$state = 0 /* none */;
        this.locator = locator;
        this.sourceExpression = sourceExpression;
        this.target = target;
    }
    $bind(flags, scope) {
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags | LifecycleFlags.fromBind);
        }
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        this.$scope = scope;
        if (hasBind(this.sourceExpression)) {
            this.sourceExpression.bind(flags, scope, this);
        }
        this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
    }
    $unbind(flags) {
        if (!(this.$state & 2 /* isBound */)) {
            return;
        }
        // add isUnbinding flag
        this.$state |= 64 /* isUnbinding */;
        if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
            this.sourceExpression.assign(flags, this.$scope, this.locator, null);
        }
        const sourceExpression = this.sourceExpression;
        if (hasUnbind(sourceExpression)) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        // remove isBound and isUnbinding flags
        this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
    }
    observeProperty(flags, obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}

function setValue(newValue, flags) {
    const currentValue = this.currentValue;
    newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
    if (currentValue !== newValue) {
        this.currentValue = newValue;
        if ((flags & (LifecycleFlags.fromFlush | LifecycleFlags.fromBind)) &&
            !(this.isDOMObserver && (flags & LifecycleFlags.doNotUpdateDOM))) {
            this.setValueCore(newValue, flags);
        }
        else {
            this.currentFlags = flags;
            return this.lifecycle.enqueueFlush(this);
        }
    }
    return Promise.resolve();
}
function flush(flags) {
    if (this.isDOMObserver && (flags & LifecycleFlags.doNotUpdateDOM)) {
        // re-queue the change so it will still propagate on flush when it's attached again
        this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
        return;
    }
    const currentValue = this.currentValue;
    // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
    // in which case the target doesn't need to be updated
    if (this.oldValue !== currentValue) {
        this.setValueCore(currentValue, this.currentFlags | flags | LifecycleFlags.updateTargetInstance);
        this.oldValue = this.currentValue;
    }
}
function dispose$1() {
    this.currentValue = null;
    this.oldValue = null;
    this.defaultValue = null;
    this.obj = null;
    this.propertyKey = '';
}
function targetObserver(defaultValue = null) {
    // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
    return function (target) {
        subscriberCollection(MutationKind.instance)(target);
        const proto = target.prototype;
        proto.$nextFlush = null;
        proto.currentValue = defaultValue;
        proto.oldValue = defaultValue;
        proto.defaultValue = defaultValue;
        proto.obj = null;
        proto.propertyKey = '';
        proto.setValue = proto.setValue || setValue;
        proto.flush = proto.flush || flush;
        proto.dispose = proto.dispose || dispose$1;
    };
}

function flush$1(flags) {
    this.callBatchedSubscribers(this.indexMap, flags | this.persistentFlags);
    if (!!this.lengthObserver) {
        this.lengthObserver.patch(LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance | this.persistentFlags);
    }
    this.resetIndexMap();
}
function dispose$2() {
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
    return this.lengthObserver === undefined ? (this.lengthObserver = new CollectionLengthObserver(this, this.lengthPropertyName)) : this.lengthObserver;
}
function collectionObserver(kind) {
    // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
    return function (target) {
        subscriberCollection(MutationKind.collection)(target);
        batchedSubscriberCollection()(target);
        const proto = target.prototype;
        proto.$nextFlush = null;
        proto.collection = null;
        proto.indexMap = null;
        proto.hasChanges = false;
        proto.lengthPropertyName = kind & 8 /* indexed */ ? 'length' : 'size';
        proto.collectionKind = kind;
        proto.resetIndexMap = kind & 8 /* indexed */ ? resetIndexMapIndexed : resetIndexMapKeyed;
        proto.flush = flush$1;
        proto.dispose = dispose$2;
        proto.getLengthObserver = getLengthObserver;
        proto.subscribe = proto.subscribe || proto.addSubscriber;
        proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
        proto.subscribeBatched = proto.subscribeBatched || proto.addBatchedSubscriber;
        proto.unsubscribeBatched = proto.unsubscribeBatched || proto.removeBatchedSubscriber;
    };
}
let CollectionLengthObserver = class CollectionLengthObserver {
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
    patch(flags) {
        this.callSubscribers(this.obj[this.propertyKey], this.currentValue, flags);
        this.currentValue = this.obj[this.propertyKey];
    }
    subscribe(subscriber) {
        this.addSubscriber(subscriber);
    }
    unsubscribe(subscriber) {
        this.removeSubscriber(subscriber);
    }
};
CollectionLengthObserver = __decorate([
    targetObserver()
], CollectionLengthObserver);

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
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = $this.$observer;
        if (o === undefined) {
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
        o.callSubscribers('push', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
        return $this.length;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
    unshift: function () {
        let $this = this;
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = $this.$observer;
        if (o === undefined) {
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
        o.callSubscribers('unshift', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
        return len;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.pop
    pop: function () {
        let $this = this;
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = $this.$observer;
        if (o === undefined) {
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
        o.callSubscribers('pop', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
        return element;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.shift
    shift: function () {
        let $this = this;
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = $this.$observer;
        if (o === undefined) {
            return $shift.call($this);
        }
        const indexMap = o.indexMap;
        const element = $shift.call($this);
        // only mark indices as deleted if they actually existed in the original array
        if (indexMap[0] > -1) {
            indexMap.deletedItems.push(indexMap[0]);
        }
        $shift.call(indexMap);
        o.callSubscribers('shift', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
        return element;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.splice
    splice: function (start, deleteCount) {
        let $this = this;
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = $this.$observer;
        if (o === undefined) {
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
        o.callSubscribers('splice', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
        return deleted;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
    reverse: function () {
        let $this = this;
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = $this.$observer;
        if (o === undefined) {
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
        o.callSubscribers('reverse', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
        return this;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.sort
    // https://github.com/v8/v8/blob/master/src/js/array.js
    sort: function (compareFn) {
        let $this = this;
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = $this.$observer;
        if (o === undefined) {
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
            if ($this[i] === undefined) {
                break;
            }
            i++;
        }
        if (compareFn === undefined || typeof compareFn !== 'function' /*spec says throw a TypeError, should we do that too?*/) {
            compareFn = sortCompare;
        }
        quickSort($this, o.indexMap, 0, i, compareFn);
        o.callSubscribers('sort', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
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
function enableArrayObservation() {
    for (const method of methods) {
        if (proto[method].observing !== true) {
            def(proto, method, Object.assign({}, descriptorProps, { value: observe[method] }));
        }
    }
}
enableArrayObservation();
function disableArrayObservation() {
    for (const method of methods) {
        if (proto[method].observing === true) {
            def(proto, method, Object.assign({}, descriptorProps, { value: native[method] }));
        }
    }
}
let ArrayObserver = class ArrayObserver {
    constructor(flags, lifecycle, array) {
        this.lifecycle = lifecycle;
        array.$observer = this;
        this.collection = array;
        this.flags = flags & LifecycleFlags.persistentBindingFlags;
        this.resetIndexMap();
    }
};
ArrayObserver = __decorate([
    collectionObserver(9 /* array */)
], ArrayObserver);
function getArrayObserver(flags, lifecycle, array) {
    return array.$observer || new ArrayObserver(flags, lifecycle, array);
}

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
        o.callSubscribers('set', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
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
            o.callSubscribers('clear', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
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
        o.callSubscribers('delete', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
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
function enableMapObservation() {
    for (const method of methods$1) {
        if (proto$1[method].observing !== true) {
            def$1(proto$1, method, Object.assign({}, descriptorProps$1, { value: observe$1[method] }));
        }
    }
}
enableMapObservation();
function disableMapObservation() {
    for (const method of methods$1) {
        if (proto$1[method].observing === true) {
            def$1(proto$1, method, Object.assign({}, descriptorProps$1, { value: native$1[method] }));
        }
    }
}
let MapObserver = class MapObserver {
    constructor(flags, lifecycle, map) {
        this.lifecycle = lifecycle;
        map.$observer = this;
        this.collection = map;
        this.flags = flags & LifecycleFlags.persistentBindingFlags;
        this.resetIndexMap();
    }
};
MapObserver = __decorate([
    collectionObserver(6 /* map */)
], MapObserver);
function getMapObserver(flags, lifecycle, map) {
    return map.$observer || new MapObserver(flags, lifecycle, map);
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
        o.callSubscribers('add', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
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
            o.callSubscribers('clear', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
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
        o.callSubscribers('delete', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
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
function enableSetObservation() {
    for (const method of methods$2) {
        if (proto$2[method].observing !== true) {
            def$2(proto$2, method, Object.assign({}, descriptorProps$2, { value: observe$2[method] }));
        }
    }
}
enableSetObservation();
function disableSetObservation() {
    for (const method of methods$2) {
        if (proto$2[method].observing === true) {
            def$2(proto$2, method, Object.assign({}, descriptorProps$2, { value: native$2[method] }));
        }
    }
}
let SetObserver = class SetObserver {
    constructor(flags, lifecycle, observedSet) {
        this.lifecycle = lifecycle;
        observedSet.$observer = this;
        this.collection = observedSet;
        this.flags = flags & LifecycleFlags.persistentBindingFlags;
        this.resetIndexMap();
    }
};
SetObserver = __decorate([
    collectionObserver(7 /* set */)
], SetObserver);
function getSetObserver(flags, lifecycle, observedSet) {
    return observedSet.$observer || new SetObserver(flags, lifecycle, observedSet);
}

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
        const overrides = instance.constructor.computed && instance.constructor.computed[propertyName] || computedOverrideDefaults;
        if (descriptor.set) {
            if (overrides.volatile) {
                return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
            }
            return new CustomSetterObserver(instance, propertyName, descriptor);
        }
        return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
    }
    throw Reporter.error(18, propertyName);
}
// Used when the getter is dependent solely on changes that happen within the setter.
let CustomSetterObserver = class CustomSetterObserver {
    constructor(obj, propertyKey, descriptor) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.currentValue = this.oldValue = undefined;
        this.descriptor = descriptor;
        this.observing = false;
    }
    setValue(newValue) {
        this.descriptor.set.call(this.obj, newValue);
        if (this.currentValue !== newValue) {
            this.oldValue = this.currentValue;
            this.currentValue = newValue;
            this.callSubscribers(newValue, this.oldValue, LifecycleFlags.updateTargetInstance);
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
        this.observing = true;
        this.currentValue = this.obj[this.propertyKey];
        const set = (newValue) => { this.setValue(newValue); };
        Reflect.defineProperty(this.obj, this.propertyKey, { set });
    }
};
CustomSetterObserver = __decorate([
    subscriberCollection(MutationKind.instance)
], CustomSetterObserver);
// Used when there is no setter, and the getter is dependent on other properties of the object;
// Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
/** @internal */
let GetterObserver = class GetterObserver {
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
        if (this.subscriberCount === 0 || this.isCollecting) {
            this.currentValue = Reflect.apply(this.descriptor.get, this.proxy, PLATFORM.emptyArray);
        }
        else {
            this.currentValue = Reflect.apply(this.descriptor.get, this.obj, PLATFORM.emptyArray);
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
            this.callSubscribers(newValue, oldValue, LifecycleFlags.updateTargetInstance);
        }
    }
    handleBatchedChange() {
        const oldValue = this.currentValue;
        const newValue = this.getValueAndCollectDependencies(false);
        if (oldValue !== newValue) {
            this.callSubscribers(newValue, oldValue, LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance);
        }
    }
    getValueAndCollectDependencies(requireCollect) {
        const dynamicDependencies = !this.overrides.static || requireCollect;
        if (dynamicDependencies) {
            this.unsubscribeAllDependencies();
            this.isCollecting = true;
        }
        this.currentValue = this.getValue();
        if (dynamicDependencies) {
            this.propertyDeps.forEach(x => { x.subscribe(this); });
            this.collectionDeps.forEach(x => { x.subscribeBatched(this); });
            this.isCollecting = false;
        }
        return this.currentValue;
    }
    doNotCollect(key) {
        return !this.isCollecting || key === '$observers';
    }
    unsubscribeAllDependencies() {
        this.propertyDeps.forEach(x => { x.unsubscribe(this); });
        this.propertyDeps.length = 0;
        this.collectionDeps.forEach(x => { x.unsubscribeBatched(this); });
        this.collectionDeps.length = 0;
    }
};
GetterObserver = __decorate([
    subscriberCollection(MutationKind.instance)
], GetterObserver);
const toStringTag$1 = Object.prototype.toString;
function createGetterTraps(flags, observerLocator, observer) {
    const traps = {
        get: function (target, key, receiver) {
            if (observer.doNotCollect(key)) {
                return Reflect.get(target, key, receiver);
            }
            // The length and iterator properties need to be invoked on the original object (for Map and Set
            // at least) or they will throw.
            switch (toStringTag$1.call(target)) {
                case '[object Array]':
                    observer.addCollectionDep(observerLocator.getArrayObserver(flags, target));
                    if (key === 'length') {
                        return Reflect.get(target, key, target);
                    }
                case '[object Map]':
                    observer.addCollectionDep(observerLocator.getMapObserver(flags, target));
                    if (key === 'size') {
                        return Reflect.get(target, key, target);
                    }
                case '[object Set]':
                    observer.addCollectionDep(observerLocator.getSetObserver(flags, target));
                    if (key === 'size') {
                        return Reflect.get(target, key, target);
                    }
                default:
                    observer.addPropertyDep(observerLocator.getObserver(flags, target, key));
            }
            return proxyOrValue(flags, target, key, observerLocator, observer);
        }
    };
    return traps;
}
function proxyOrValue(flags, target, key, observerLocator, observer) {
    const value = Reflect.get(target, key, target);
    if (typeof value === 'function') {
        return target[key].bind(target);
    }
    if (typeof value !== 'object' || value === null) {
        return value;
    }
    return new Proxy(value, createGetterTraps(flags, observerLocator, observer));
}

const IDirtyChecker = DI.createInterface('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));
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
    constructor() {
        this.elapsedFrames = 0;
        this.tracked = [];
    }
    createProperty(obj, propertyName) {
        if (DirtyCheckSettings.throw) {
            throw Reporter.error(800); // TODO: create/organize error code
        }
        if (DirtyCheckSettings.warn) {
            Reporter.write(801);
        }
        return new DirtyCheckProperty(this, obj, propertyName);
    }
    addProperty(property) {
        this.tracked.push(property);
        if (this.tracked.length === 1) {
            PLATFORM.ticker.add(this.check, this);
        }
    }
    removeProperty(property) {
        this.tracked.splice(this.tracked.indexOf(property), 1);
        if (this.tracked.length === 0) {
            PLATFORM.ticker.remove(this.check, this);
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
                current.flush(LifecycleFlags.fromTick);
            }
        }
    }
}
let DirtyCheckProperty = class DirtyCheckProperty {
    constructor(dirtyChecker, obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.dirtyChecker = dirtyChecker;
    }
    isDirty() {
        return this.oldValue !== this.obj[this.propertyKey];
    }
    flush(flags) {
        const oldValue = this.oldValue;
        const newValue = this.obj[this.propertyKey];
        this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTargetInstance);
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
DirtyCheckProperty = __decorate([
    propertyObserver()
], DirtyCheckProperty);

const noop = PLATFORM.noop;
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

class PropertyAccessor {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValue(value) {
        this.obj[this.propertyKey] = value;
    }
}

const toStringTag$2 = Object.prototype.toString;
const IObserverLocator = DI.createInterface('IObserverLocator').noDefault();
const ITargetObserverLocator = DI.createInterface('ITargetObserverLocator').noDefault();
const ITargetAccessorLocator = DI.createInterface('ITargetAccessorLocator').noDefault();
function getPropertyDescriptor(subject, name) {
    let pd = Object.getOwnPropertyDescriptor(subject, name);
    let proto = Object.getPrototypeOf(subject);
    while (pd === undefined && proto !== null) {
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
        return Registration.singleton(IObserverLocator, this).register(container);
    }
    getObserver(flags, obj, propertyName) {
        if (flags & LifecycleFlags.useProxies && typeof obj === 'object') {
            return ProxyObserver.getOrCreate(obj, propertyName); // TODO: fix typings (and ensure proper contracts ofc)
        }
        if (isBindingContext(obj)) {
            return obj.getObservers(flags).getOrCreate(flags, obj, propertyName);
        }
        let observersLookup = obj.$observers;
        let observer;
        if (observersLookup && propertyName in observersLookup) {
            return observersLookup[propertyName];
        }
        observer = this.createPropertyObserver(flags, obj, propertyName);
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
    getAccessor(flags, obj, propertyName) {
        if (this.targetAccessorLocator.handles(flags, obj)) {
            if (this.targetObserverLocator.overridesAccessor(flags, obj, propertyName)) {
                return this.getObserver(flags, obj, propertyName);
            }
            return this.targetAccessorLocator.getAccessor(flags, this.lifecycle, obj, propertyName);
        }
        if (flags & LifecycleFlags.useProxies) {
            return ProxyObserver.getOrCreate(obj, propertyName);
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
            Reporter.write(0, obj);
        }
        return value;
    }
    getAdapterObserver(flags, obj, propertyName, descriptor) {
        for (let i = 0, ii = this.adapters.length; i < ii; i++) {
            const adapter = this.adapters[i];
            const observer = adapter.getObserver(flags, obj, propertyName, descriptor);
            if (observer) {
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
            if (observer !== null) {
                return observer;
            }
            if (observer !== null) {
                return observer;
            }
            isNode = true;
        }
        const tag = toStringTag$2.call(obj);
        switch (tag) {
            case '[object Array]':
                if (propertyName === 'length') {
                    return this.getArrayObserver(flags, obj).getLengthObserver(flags);
                }
                return this.dirtyChecker.createProperty(obj, propertyName);
            case '[object Map]':
                if (propertyName === 'size') {
                    return this.getMapObserver(flags, obj).getLengthObserver(flags);
                }
                return this.dirtyChecker.createProperty(obj, propertyName);
            case '[object Set]':
                if (propertyName === 'size') {
                    return this.getSetObserver(flags, obj).getLengthObserver(flags);
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
        return new SetterObserver(flags, obj, propertyName);
    }
}
ObserverLocator.inject = [ILifecycle, IDirtyChecker, ITargetObserverLocator, ITargetAccessorLocator];
function getCollectionObserver(flags, lifecycle, collection) {
    switch (toStringTag$2.call(collection)) {
        case '[object Array]':
            return getArrayObserver(flags, lifecycle, collection);
        case '[object Map]':
            return getMapObserver(flags, lifecycle, collection);
        case '[object Set]':
            return getSetObserver(flags, lifecycle, collection);
    }
    return null;
}
function isBindingContext(obj) {
    return obj.$synthetic === true;
}

const noop$1 = PLATFORM.noop;
let SelfObserver = class SelfObserver {
    constructor(flags, instance, propertyName, callbackName) {
        this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
        if (ProxyObserver.isProxy(instance)) {
            instance.$observer.subscribe(this, propertyName);
            this.obj = instance.$raw;
            this.propertyKey = propertyName;
            this.currentValue = instance.$raw[propertyName];
            this.callback = callbackName in instance.$raw
                ? instance[callbackName].bind(instance)
                : noop$1;
        }
        else {
            this.obj = instance;
            this.propertyKey = propertyName;
            this.currentValue = instance[propertyName];
            this.callback = callbackName in instance
                ? instance[callbackName].bind(instance)
                : noop$1;
        }
    }
    handleChange(newValue, oldValue, flags) {
        this.setValue(newValue, flags);
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        const currentValue = this.currentValue;
        if (currentValue !== newValue) {
            this.currentValue = newValue;
            if (!(flags & LifecycleFlags.fromBind)) {
                const coercedValue = this.callback(newValue, currentValue, flags);
                if (coercedValue !== undefined) {
                    this.currentValue = newValue = coercedValue;
                }
                this.callSubscribers(newValue, currentValue, flags);
            }
        }
    }
};
SelfObserver = __decorate([
    propertyObserver()
], SelfObserver);

const { oneTime: oneTime$2, toView: toView$2, fromView: fromView$1, twoWay } = BindingMode;
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
    PLATFORM.global.clearTimeout(state.timeoutId);
    state.timeoutId = PLATFORM.global.setTimeout(() => { this.debouncedMethod(newValue, oldValue, flags); }, state.delay);
}
/** @internal */
function debounceCall(newValue, oldValue, flags) {
    const state = this.debounceState;
    PLATFORM.global.clearTimeout(state.timeoutId);
    if (!(flags & state.callContextToDebounce)) {
        state.oldValue = unset;
        this.debouncedMethod(newValue, oldValue, flags);
        return;
    }
    if (state.oldValue === unset) {
        state.oldValue = oldValue;
    }
    const timeoutId = PLATFORM.global.setTimeout(() => {
        const ov = state.oldValue;
        state.oldValue = unset;
        this.debouncedMethod(newValue, ov, flags);
    }, state.delay);
    state.timeoutId = timeoutId;
}
const fromView$2 = BindingMode.fromView;
class DebounceBindingBehavior {
    bind(flags, scope, binding, delay = 200) {
        let methodToDebounce;
        let callContextToDebounce;
        let debouncer;
        if (binding instanceof Binding) {
            methodToDebounce = 'handleChange';
            debouncer = debounceCall;
            callContextToDebounce = binding.mode & fromView$2 ? LifecycleFlags.updateSourceExpression : LifecycleFlags.updateTargetInstance;
        }
        else {
            methodToDebounce = 'callSource';
            debouncer = debounceCallSource;
            callContextToDebounce = LifecycleFlags.updateTargetInstance;
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
        PLATFORM.global.clearTimeout(binding.debounceState.timeoutId);
        binding.debounceState = null;
    }
}
BindingBehaviorResource.define('debounce', DebounceBindingBehavior);

class SignalBindingBehavior {
    constructor(signaler) {
        this.signaler = signaler;
    }
    bind(flags, scope, binding, ...args) {
        if (!binding.updateTarget) {
            throw Reporter.error(11);
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
            throw Reporter.error(12);
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
        PLATFORM.global.clearTimeout(state.timeoutId);
        state.timeoutId = -1;
        state.last = +new Date();
        this.throttledMethod(newValue);
        return;
    }
    state.newValue = newValue;
    if (state.timeoutId === -1) {
        const timeoutId = PLATFORM.global.setTimeout(() => {
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
        if (binding instanceof Binding) {
            if (binding.mode === BindingMode.twoWay) {
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
        PLATFORM.global.clearTimeout(binding.throttleState.timeoutId);
        binding.throttleState = null;
    }
}
BindingBehaviorResource.define('throttle', ThrottleBindingBehavior);

/** @internal */
const customElementName = 'custom-element';
/** @internal */
function customElementKey(name) {
    return `${customElementName}:${name}`;
}
/** @internal */
function customElementBehavior(node) {
    return node.$customElement === undefined ? null : node.$customElement;
}
/** @internal */
const customAttributeName = 'custom-attribute';
/** @internal */
function customAttributeKey(name) {
    return `${customAttributeName}:${name}`;
}
/**
 * TargetedInstructionType enum values become the property names for the associated renderers when they are injected
 * into the `Renderer`.
 *
 * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
 *
 * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
 * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
 */
var TargetedInstructionType;
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
})(TargetedInstructionType || (TargetedInstructionType = {}));
const ITargetedInstruction = DI.createInterface('createInterface').noDefault();
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
// Note: this is a little perf thing; having one predefined class with the properties always
// assigned in the same order ensures the browser can keep reusing the same generated hidden
// class
class DefaultTemplateDefinition {
    constructor() {
        this.name = 'unnamed';
        this.template = null;
        this.cache = 0;
        this.build = buildNotRequired;
        this.bindables = PLATFORM.emptyObject;
        this.instructions = PLATFORM.emptyArray;
        this.dependencies = PLATFORM.emptyArray;
        this.surrogates = PLATFORM.emptyArray;
        this.containerless = false;
        this.shadowOptions = null;
        this.hasSlots = false;
        this.useProxies = false;
    }
}
const templateDefinitionAssignables = [
    'name',
    'template',
    'cache',
    'build',
    'containerless',
    'shadowOptions',
    'hasSlots',
    'useProxies'
];
const templateDefinitionArrays = [
    'instructions',
    'dependencies',
    'surrogates'
];
// tslint:disable-next-line:parameters-max-number // TODO: Reduce complexity (currently at 64)
function buildTemplateDefinition(ctor, nameOrDef, template, cache, build, bindables, instructions, dependencies, surrogates, containerless, shadowOptions, hasSlots, useProxies) {
    const def = new DefaultTemplateDefinition();
    // all cases fall through intentionally
    const argLen = arguments.length;
    switch (argLen) {
        case 13: if (useProxies !== null)
            def.useProxies = useProxies;
        case 12: if (hasSlots !== null)
            def.hasSlots = hasSlots;
        case 11: if (shadowOptions !== null)
            def.shadowOptions = shadowOptions;
        case 10: if (containerless !== null)
            def.containerless = containerless;
        case 9: if (surrogates !== null)
            def.surrogates = PLATFORM.toArray(surrogates);
        case 8: if (dependencies !== null)
            def.dependencies = PLATFORM.toArray(dependencies);
        case 7: if (instructions !== null)
            def.instructions = PLATFORM.toArray(instructions);
        case 6: if (bindables !== null)
            def.bindables = Object.assign({}, bindables);
        case 5: if (build !== null)
            def.build = build === true ? buildRequired : build === false ? buildNotRequired : Object.assign({}, build);
        case 4: if (cache !== null)
            def.cache = cache;
        case 3: if (template !== null)
            def.template = template;
        case 2:
            if (ctor !== null) {
                if (ctor['bindables']) {
                    def.bindables = Object.assign({}, ctor.bindables);
                }
                if (ctor['containerless']) {
                    def.containerless = ctor.containerless;
                }
                if (ctor['shadowOptions']) {
                    def.shadowOptions = ctor.shadowOptions;
                }
            }
            if (typeof nameOrDef === 'string') {
                if (nameOrDef.length > 0) {
                    def.name = nameOrDef;
                }
            }
            else if (nameOrDef !== null) {
                templateDefinitionAssignables.forEach(prop => {
                    if (nameOrDef[prop]) {
                        def[prop] = nameOrDef[prop];
                    }
                });
                templateDefinitionArrays.forEach(prop => {
                    if (nameOrDef[prop]) {
                        def[prop] = PLATFORM.toArray(nameOrDef[prop]);
                    }
                });
                if (nameOrDef['bindables']) {
                    if (def.bindables === PLATFORM.emptyObject) {
                        def.bindables = Object.assign({}, nameOrDef.bindables);
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

const { enter, leave } = Profiler.createTimer('AttachLifecycle');
/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
function $attachAttribute(flags) {
    if (this.$state & 8 /* isAttached */) {
        return;
    }
    const lifecycle = this.$lifecycle;
    lifecycle.beginAttach();
    // add isAttaching flag
    this.$state |= 4 /* isAttaching */;
    flags |= LifecycleFlags.fromAttach;
    const hooks = this.$hooks;
    if (hooks & 16 /* hasAttaching */) {
        this.attaching(flags);
    }
    // add isAttached flag, remove isAttaching flag
    this.$state |= 8 /* isAttached */;
    this.$state &= ~4 /* isAttaching */;
    if (hooks & 32 /* hasAttached */) {
        lifecycle.enqueueAttached(this);
    }
    lifecycle.endAttach(flags);
}
/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
function $attachElement(flags) {
    if (this.$state & 8 /* isAttached */) {
        return;
    }
    const lifecycle = this.$lifecycle;
    lifecycle.beginAttach();
    // add isAttaching flag
    this.$state |= 4 /* isAttaching */;
    flags |= LifecycleFlags.fromAttach;
    const hooks = this.$hooks;
    if (hooks & 16 /* hasAttaching */) {
        this.attaching(flags);
    }
    let current = this.$componentHead;
    while (current !== null) {
        current.$attach(flags);
        current = current.$nextComponent;
    }
    lifecycle.enqueueMount(this);
    // add isAttached flag, remove isAttaching flag
    this.$state |= 8 /* isAttached */;
    this.$state &= ~4 /* isAttaching */;
    if (hooks & 32 /* hasAttached */) {
        lifecycle.enqueueAttached(this);
    }
    lifecycle.endAttach(flags);
}
/** @internal */
function $attachView(flags) {
    if (this.$state & 8 /* isAttached */) {
        return;
    }
    // add isAttaching flag
    this.$state |= 4 /* isAttaching */;
    flags |= LifecycleFlags.fromAttach;
    let current = this.$componentHead;
    while (current !== null) {
        current.$attach(flags);
        current = current.$nextComponent;
    }
    this.$lifecycle.enqueueMount(this);
    // add isAttached flag, remove isAttaching flag
    this.$state |= 8 /* isAttached */;
    this.$state &= ~4 /* isAttaching */;
}
/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
function $detachAttribute(flags) {
    if (this.$state & 8 /* isAttached */) {
        const lifecycle = this.$lifecycle;
        lifecycle.beginDetach();
        // add isDetaching flag
        this.$state |= 32 /* isDetaching */;
        flags |= LifecycleFlags.fromDetach;
        const hooks = this.$hooks;
        if (hooks & 64 /* hasDetaching */) {
            this.detaching(flags);
        }
        // remove isAttached and isDetaching flags
        this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
        if (hooks & 128 /* hasDetached */) {
            lifecycle.enqueueDetached(this);
        }
        lifecycle.endDetach(flags);
    }
}
/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
function $detachElement(flags) {
    if (this.$state & 8 /* isAttached */) {
        const lifecycle = this.$lifecycle;
        lifecycle.beginDetach();
        // add isDetaching flag
        this.$state |= 32 /* isDetaching */;
        flags |= LifecycleFlags.fromDetach;
        // Only unmount if either:
        // - No parent view/element is queued for unmount yet, or
        // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
        if (((flags & LifecycleFlags.parentUnmountQueued) ^ LifecycleFlags.parentUnmountQueued) | (flags & LifecycleFlags.fromStopTask)) {
            lifecycle.enqueueUnmount(this);
            flags |= LifecycleFlags.parentUnmountQueued;
        }
        const hooks = this.$hooks;
        if (hooks & 64 /* hasDetaching */) {
            this.detaching(flags);
        }
        let current = this.$componentTail;
        while (current !== null) {
            current.$detach(flags);
            current = current.$prevComponent;
        }
        // remove isAttached and isDetaching flags
        this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
        if (hooks & 128 /* hasDetached */) {
            lifecycle.enqueueDetached(this);
        }
        lifecycle.endDetach(flags);
    }
}
/** @internal */
function $detachView(flags) {
    if (this.$state & 8 /* isAttached */) {
        // add isDetaching flag
        this.$state |= 32 /* isDetaching */;
        flags |= LifecycleFlags.fromDetach;
        // Only unmount if either:
        // - No parent view/element is queued for unmount yet, or
        // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
        if (((flags & LifecycleFlags.parentUnmountQueued) ^ LifecycleFlags.parentUnmountQueued) | (flags & LifecycleFlags.fromStopTask)) {
            this.$lifecycle.enqueueUnmount(this);
            flags |= LifecycleFlags.parentUnmountQueued;
        }
        let current = this.$componentTail;
        while (current !== null) {
            current.$detach(flags);
            current = current.$prevComponent;
        }
        // remove isAttached and isDetaching flags
        this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
    }
}
/** @internal */
function $cacheAttribute(flags) {
    flags |= LifecycleFlags.fromCache;
    if (this.$hooks & 2048 /* hasCaching */) {
        this.caching(flags);
    }
}
/** @internal */
function $cacheElement(flags) {
    flags |= LifecycleFlags.fromCache;
    if (this.$hooks & 2048 /* hasCaching */) {
        this.caching(flags);
    }
    let current = this.$componentTail;
    while (current !== null) {
        current.$cache(flags);
        current = current.$prevComponent;
    }
}
/** @internal */
function $cacheView(flags) {
    flags |= LifecycleFlags.fromCache;
    let current = this.$componentTail;
    while (current !== null) {
        current.$cache(flags);
        current = current.$prevComponent;
    }
}
/** @internal */
function $mountElement(flags) {
    if (!(this.$state & 16 /* isMounted */)) {
        this.$state |= 16 /* isMounted */;
        this.$projector.project(this.$nodes);
    }
}
/** @internal */
function $unmountElement(flags) {
    if (this.$state & 16 /* isMounted */) {
        this.$state &= ~16 /* isMounted */;
        this.$projector.take(this.$nodes);
    }
}
/** @internal */
function $mountView(flags) {
    if (!(this.$state & 16 /* isMounted */)) {
        this.$state |= 16 /* isMounted */;
        this.$nodes.insertBefore(this.location);
    }
}
/** @internal */
function $unmountView(flags) {
    if (this.$state & 16 /* isMounted */) {
        this.$state &= ~16 /* isMounted */;
        this.$nodes.remove();
        if (this.isFree) {
            this.isFree = false;
            if (this.cache.tryReturnToCache(this)) {
                this.$state |= 128 /* isCached */;
                return true;
            }
        }
        return false;
    }
    return false;
}

const { enter: enter$1, leave: leave$1 } = Profiler.createTimer('BindLifecycle');
/** @internal */
function $bindAttribute(flags, scope) {
    flags |= LifecycleFlags.fromBind;
    if (this.$state & 2 /* isBound */) {
        if (this.$scope === scope) {
            return;
        }
        this.$unbind(flags);
    }
    const lifecycle = this.$lifecycle;
    lifecycle.beginBind();
    // add isBinding flag
    this.$state |= 1 /* isBinding */;
    const hooks = this.$hooks;
    if (hooks & 8 /* hasBound */) {
        lifecycle.enqueueBound(this);
    }
    this.$scope = scope;
    if (hooks & 4 /* hasBinding */) {
        this.binding(flags);
    }
    // add isBound flag and remove isBinding flag
    this.$state |= 2 /* isBound */;
    this.$state &= ~1 /* isBinding */;
    lifecycle.endBind(flags);
}
/** @internal */
function $bindElement(flags, parentScope) {
    if (this.$state & 2 /* isBound */) {
        return;
    }
    const scope = this.$scope;
    scope.parentScope = parentScope;
    const lifecycle = this.$lifecycle;
    lifecycle.beginBind();
    // add isBinding flag
    this.$state |= 1 /* isBinding */;
    const hooks = this.$hooks;
    flags |= LifecycleFlags.fromBind;
    if (hooks & 8 /* hasBound */) {
        lifecycle.enqueueBound(this);
    }
    let binding = this.$bindingHead;
    while (binding !== null) {
        binding.$bind(flags, scope);
        binding = binding.$nextBinding;
    }
    if (hooks & 4 /* hasBinding */) {
        this.binding(flags);
    }
    let component = this.$componentHead;
    while (component !== null) {
        component.$bind(flags, scope);
        component = component.$nextComponent;
    }
    // add isBound flag and remove isBinding flag
    this.$state |= 2 /* isBound */;
    this.$state &= ~1 /* isBinding */;
    lifecycle.endBind(flags);
}
/** @internal */
function $bindView(flags, scope) {
    flags |= LifecycleFlags.fromBind;
    if (this.$state & 2 /* isBound */) {
        if (this.$scope === scope) {
            return;
        }
        this.$unbind(flags);
    }
    // add isBinding flag
    this.$state |= 1 /* isBinding */;
    this.$scope = scope;
    let binding = this.$bindingHead;
    while (binding !== null) {
        binding.$bind(flags, scope);
        binding = binding.$nextBinding;
    }
    let component = this.$componentHead;
    while (component !== null) {
        component.$bind(flags, scope);
        component = component.$nextComponent;
    }
    // add isBound flag and remove isBinding flag
    this.$state |= 2 /* isBound */;
    this.$state &= ~1 /* isBinding */;
}
/** @internal */
function $lockedBind(flags) {
    flags |= LifecycleFlags.fromBind;
    if (this.$state & 2 /* isBound */) {
        return;
    }
    // add isBinding flag
    this.$state |= 1 /* isBinding */;
    const scope = this.$scope;
    let binding = this.$bindingHead;
    while (binding !== null) {
        binding.$bind(flags, scope);
        binding = binding.$nextBinding;
    }
    let component = this.$componentHead;
    while (component !== null) {
        component.$bind(flags, scope);
        component = component.$nextComponent;
    }
    // add isBound flag and remove isBinding flag
    this.$state |= 2 /* isBound */;
    this.$state &= ~1 /* isBinding */;
}
/** @internal */
function $unbindAttribute(flags) {
    if (this.$state & 2 /* isBound */) {
        const lifecycle = this.$lifecycle;
        lifecycle.beginUnbind();
        // add isUnbinding flag
        this.$state |= 64 /* isUnbinding */;
        const hooks = this.$hooks;
        flags |= LifecycleFlags.fromUnbind;
        if (hooks & 512 /* hasUnbound */) {
            lifecycle.enqueueUnbound(this);
        }
        if (hooks & 256 /* hasUnbinding */) {
            this.unbinding(flags);
        }
        // remove isBound and isUnbinding flags
        this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        lifecycle.endUnbind(flags);
    }
}
/** @internal */
function $unbindElement(flags) {
    if (this.$state & 2 /* isBound */) {
        const lifecycle = this.$lifecycle;
        lifecycle.beginUnbind();
        // add isUnbinding flag
        this.$state |= 64 /* isUnbinding */;
        const hooks = this.$hooks;
        flags |= LifecycleFlags.fromUnbind;
        if (hooks & 512 /* hasUnbound */) {
            lifecycle.enqueueUnbound(this);
        }
        if (hooks & 256 /* hasUnbinding */) {
            this.unbinding(flags);
        }
        let component = this.$componentTail;
        while (component !== null) {
            component.$unbind(flags);
            component = component.$prevComponent;
        }
        let binding = this.$bindingTail;
        while (binding !== null) {
            binding.$unbind(flags);
            binding = binding.$prevBinding;
        }
        this.$scope.parentScope = null;
        // remove isBound and isUnbinding flags
        this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        lifecycle.endUnbind(flags);
    }
}
/** @internal */
function $unbindView(flags) {
    if (this.$state & 2 /* isBound */) {
        // add isUnbinding flag
        this.$state |= 64 /* isUnbinding */;
        flags |= LifecycleFlags.fromUnbind;
        let component = this.$componentTail;
        while (component !== null) {
            component.$unbind(flags);
            component = component.$prevComponent;
        }
        let binding = this.$bindingTail;
        while (binding !== null) {
            binding.$unbind(flags);
            binding = binding.$prevBinding;
        }
        // remove isBound and isUnbinding flags
        this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        this.$scope = null;
    }
}
/** @internal */
function $lockedUnbind(flags) {
    if (this.$state & 2 /* isBound */) {
        // add isUnbinding flag
        this.$state |= 64 /* isUnbinding */;
        flags |= LifecycleFlags.fromUnbind;
        let component = this.$componentTail;
        while (component !== null) {
            component.$unbind(flags);
            component = component.$prevComponent;
        }
        let binding = this.$bindingTail;
        while (binding !== null) {
            binding.$unbind(flags);
            binding = binding.$prevBinding;
        }
        // remove isBound and isUnbinding flags
        this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
    }
}

const INode = DI.createInterface('INode').noDefault();
const IRenderLocation = DI.createInterface('IRenderLocation').noDefault();
const IDOM = DI.createInterface('IDOM').noDefault();
const ni = function (...args) {
    throw Reporter.error(1000); // TODO: create error code (not implemented exception)
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
const DOM = Object.assign({}, niDOM, { get isInitialized() {
        return Reflect.get(this, '$initialized') === true;
    },
    initialize(dom) {
        if (this.isInitialized) {
            throw Reporter.error(1001); // TODO: create error code (already initialized, check isInitialized property and call destroy() if you want to assign a different dom)
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
            throw Reporter.error(1002); // TODO: create error code (already destroyed)
        }
        const keys = Reflect.get(this, '$domKeys');
        keys.forEach(key => {
            Reflect.deleteProperty(this, key);
        });
        Object.assign(this, niDOM);
        Reflect.set(this, '$domKeys', PLATFORM.emptyArray);
        Reflect.set(this, '$initialized', false);
    } });
// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence = {
    childNodes: PLATFORM.emptyArray,
    firstChild: null,
    lastChild: null,
    findTargets() { return PLATFORM.emptyArray; },
    insertBefore(refNode) { },
    appendTo(parent) { },
    remove() { }
};
const NodeSequence = {
    empty: emptySequence
};

/** @internal */
class View {
    constructor($lifecycle, cache) {
        this.$bindingHead = null;
        this.$bindingTail = null;
        this.$componentHead = null;
        this.$componentTail = null;
        this.$componentHead = null;
        this.$componentTail = null;
        this.$nextComponent = null;
        this.$prevComponent = null;
        this.$nextMount = null;
        this.$nextUnmount = null;
        this.$nextUnbindAfterDetach = null;
        this.$state = 0 /* none */;
        this.$scope = null;
        this.isFree = false;
        this.$lifecycle = $lifecycle;
        this.cache = cache;
    }
    /**
     * Reserves this `View` for mounting at a particular `IRenderLocation`.
     * Also marks this `View` such that it cannot be returned to the cache until
     * it is released again.
     *
     * @param location The RenderLocation before which the view will be appended to the DOM.
     */
    hold(location) {
        this.isFree = false;
        this.location = location;
    }
    /**
     * Marks this `View` such that it can be returned to the cache when it is unmounted.
     *
     * If this `View` is not currently attached, it will be unmounted immediately.
     *
     * @param flags The `LifecycleFlags` to pass to the unmount operation (only effective
     * if the view is already in detached state).
     *
     * @returns Whether this `View` can/will be returned to cache
     */
    release(flags) {
        this.isFree = true;
        if (this.$state & 8 /* isAttached */) {
            return this.cache.canReturnToCache(this);
        }
        return !!this.$unmount(flags);
    }
    lockScope(scope) {
        this.$scope = scope;
        this.$bind = $lockedBind;
        this.$unbind = $lockedUnbind;
    }
}
/** @internal */
class ViewFactory {
    constructor(name, template, lifecycle) {
        this.isCaching = false;
        this.cacheSize = -1;
        this.cache = null;
        this.lifecycle = lifecycle;
        this.name = name;
        this.template = template;
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
    canReturnToCache(view) {
        return this.cache !== null && this.cache.length < this.cacheSize;
    }
    tryReturnToCache(view) {
        if (this.canReturnToCache(view)) {
            view.$cache(LifecycleFlags.none);
            this.cache.push(view);
            return true;
        }
        return false;
    }
    create(flags) {
        const cache = this.cache;
        let view;
        if (cache !== null && cache.length > 0) {
            view = cache.pop();
            view.$state &= ~128 /* isCached */;
            return view;
        }
        view = new View(this.lifecycle, this);
        this.template.render(view, null, null, flags);
        if (!view.$nodes) {
            throw Reporter.error(90);
        }
        return view;
    }
}
ViewFactory.maxCacheSize = 0xFFFF;
((proto) => {
    proto.$bind = $bindView;
    proto.$unbind = $unbindView;
    proto.$attach = $attachView;
    proto.$detach = $detachView;
    proto.$cache = $cacheView;
    proto.$mount = $mountView;
    proto.$unmount = $unmountView;
})(View.prototype);

const ITemplateCompiler = DI.createInterface('ITemplateCompiler').noDefault();
var ViewCompileFlags;
(function (ViewCompileFlags) {
    ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
    ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
    ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
})(ViewCompileFlags || (ViewCompileFlags = {}));
const ITemplateFactory = DI.createInterface('ITemplateFactory').noDefault();
// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
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
    render(renderable, host, parts, flags = LifecycleFlags.none) {
        const nodes = renderable.$nodes = this.factory.createNodeSequence();
        renderable.$context = this.renderContext;
        if (this.definition.useProxies) {
            flags |= LifecycleFlags.useProxies;
        }
        this.renderContext.render(flags, renderable, nodes.findTargets(), this.definition, host, parts);
    }
}
// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/** @internal */
const noViewTemplate = {
    renderContext: null,
    dom: null,
    render(renderable) {
        renderable.$nodes = NodeSequence.empty;
        renderable.$context = null;
    }
};
const defaultCompilerName = 'default';
const IInstructionRenderer = DI.createInterface('IInstructionRenderer').noDefault();
const IRenderer = DI.createInterface('IRenderer').noDefault();
const IRenderingEngine = DI.createInterface('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));
/** @internal */
class RenderingEngine {
    constructor(container, templateFactory, lifecycle, templateCompilers) {
        this.behaviorLookup = new Map();
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
    getElementTemplate(dom, definition, parentContext, componentType) {
        if (!definition) {
            return null;
        }
        let found = this.templateLookup.get(definition);
        if (!found) {
            found = this.templateFromSource(dom, definition, parentContext, componentType);
            this.templateLookup.set(definition, found);
        }
        return found;
    }
    getViewFactory(dom, definition, parentContext) {
        if (!definition) {
            return null;
        }
        let factory = this.viewFactoryLookup.get(definition);
        if (!factory) {
            const validSource = buildTemplateDefinition(null, definition);
            const template = this.templateFromSource(dom, validSource, parentContext, null);
            factory = new ViewFactory(validSource.name, template, this.lifecycle);
            factory.setCacheSize(validSource.cache, true);
            this.viewFactoryLookup.set(definition, factory);
        }
        return factory;
    }
    applyRuntimeBehavior(flags, Type, instance) {
        let found = this.behaviorLookup.get(Type);
        if (!found) {
            found = RuntimeBehavior.create(Type);
            this.behaviorLookup.set(Type, found);
        }
        found.applyTo(flags, instance, this.lifecycle);
    }
    templateFromSource(dom, definition, parentContext, componentType) {
        if (parentContext === null) {
            parentContext = this.container;
        }
        if (definition.template !== null) {
            const renderContext = createRenderContext(dom, parentContext, definition.dependencies, componentType);
            if (definition.build.required) {
                const compilerName = definition.build.compiler || defaultCompilerName;
                const compiler = this.compilers[compilerName];
                if (compiler === undefined) {
                    throw Reporter.error(20, compilerName);
                }
                definition = compiler.compile(dom, definition, new RuntimeCompilationResources(renderContext), ViewCompileFlags.surrogate);
            }
            return this.templateFactory.create(renderContext, definition);
        }
        return noViewTemplate;
    }
}
RenderingEngine.inject = [IContainer, ITemplateFactory, ILifecycle, all(ITemplateCompiler)];
function createRenderContext(dom, parentRenderContext, dependencies, componentType) {
    const context = parentRenderContext.createChild();
    const renderableProvider = new InstanceProvider();
    const elementProvider = new InstanceProvider();
    const instructionProvider = new InstanceProvider();
    const factoryProvider = new ViewFactoryProvider();
    const renderLocationProvider = new InstanceProvider();
    const renderer = context.get(IRenderer);
    dom.registerElementResolver(context, elementProvider);
    context.registerResolver(IViewFactory, factoryProvider);
    context.registerResolver(IRenderable, renderableProvider);
    context.registerResolver(ITargetedInstruction, instructionProvider);
    context.registerResolver(IRenderLocation, renderLocationProvider);
    if (dependencies) {
        context.register(...dependencies);
    }
    //If the element has a view, support Recursive Components by adding self to own view template container.
    if (componentType) {
        componentType.register(context);
    }
    context.render = function (flags, renderable, targets, templateDefinition, host, parts) {
        renderer.render(flags, dom, this, renderable, targets, templateDefinition, host, parts);
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
/** @internal */
class InstanceProvider {
    constructor() {
        this.instance = null;
    }
    prepare(instance) {
        this.instance = instance;
    }
    resolve(handler, requestor) {
        if (this.instance === undefined) { // unmet precondition: call prepare
            throw Reporter.error(50); // TODO: organize error codes
        }
        return this.instance;
    }
    dispose() {
        this.instance = null;
    }
}
/** @internal */
class ViewFactoryProvider {
    prepare(factory, parts) {
        this.factory = factory;
        this.replacements = parts || PLATFORM.emptyObject;
    }
    resolve(handler, requestor) {
        const factory = this.factory;
        if (factory === undefined || factory === null) { // unmet precondition: call prepare
            throw Reporter.error(50); // TODO: organize error codes
        }
        if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
            throw Reporter.error(51); // TODO: organize error codes
        }
        const found = this.replacements[factory.name];
        if (found) {
            const renderingEngine = handler.get(IRenderingEngine);
            const dom = handler.get(IDOM);
            return renderingEngine.getViewFactory(dom, found, requestor);
        }
        return factory;
    }
    dispose() {
        this.factory = null;
        this.replacements = PLATFORM.emptyObject;
    }
}
/** @internal */
let ChildrenObserver = class ChildrenObserver {
    constructor(lifecycle, customElement) {
        this.hasChanges = false;
        this.children = null;
        this.customElement = customElement;
        this.lifecycle = lifecycle;
        this.observing = false;
    }
    getValue() {
        if (!this.observing) {
            this.observing = true;
            this.customElement.$projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); });
            this.children = findElements(this.customElement.$projector.children);
        }
        return this.children;
    }
    setValue(newValue) { }
    flush(flags) {
        this.callSubscribers(this.children, undefined, flags | LifecycleFlags.updateTargetInstance);
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
        this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
        this.hasChanges = true;
    }
};
ChildrenObserver = __decorate([
    subscriberCollection(MutationKind.instance)
], ChildrenObserver);
/** @internal */
function findElements(nodes) {
    const components = [];
    for (let i = 0, ii = nodes.length; i < ii; ++i) {
        const current = nodes[i];
        const component = customElementBehavior(current);
        if (component !== null) {
            components.push(component);
        }
    }
    return components;
}
/** @internal */
class RuntimeBehavior {
    constructor() { }
    static create(Component) {
        const behavior = new RuntimeBehavior();
        behavior.bindables = Component.description.bindables;
        return behavior;
    }
    applyTo(flags, instance, lifecycle) {
        instance.$lifecycle = lifecycle;
        if ('$projector' in instance) {
            this.applyToElement(flags, lifecycle, instance);
        }
        else {
            this.applyToCore(flags, instance);
        }
    }
    applyToElement(flags, lifecycle, instance) {
        const observers = this.applyToCore(flags, instance);
        observers.$children = new ChildrenObserver(lifecycle, instance);
        Reflect.defineProperty(instance, '$children', {
            enumerable: false,
            get: function () {
                return this['$observers'].$children.getValue();
            }
        });
    }
    applyToCore(flags, instance) {
        const observers = {};
        const bindables = this.bindables;
        const observableNames = Object.getOwnPropertyNames(bindables);
        if (flags & LifecycleFlags.useProxies) {
            for (let i = 0, ii = observableNames.length; i < ii; ++i) {
                const name = observableNames[i];
                observers[name] = new SelfObserver(flags, ProxyObserver.getOrCreate(instance).proxy, name, bindables[name].callback);
            }
        }
        else {
            for (let i = 0, ii = observableNames.length; i < ii; ++i) {
                const name = observableNames[i];
                observers[name] = new SelfObserver(flags, instance, name, bindables[name].callback);
                createGetterSetter(flags, instance, name);
            }
            Reflect.defineProperty(instance, '$observers', {
                enumerable: false,
                value: observers
            });
        }
        return observers;
    }
}
function createGetterSetter(flags, instance, name) {
    Reflect.defineProperty(instance, name, {
        enumerable: true,
        get: function () { return this['$observers'][name].getValue(); },
        set: function (value) { this['$observers'][name].setValue(value, (flags & LifecycleFlags.persistentBindingFlags) | LifecycleFlags.updateTargetInstance); }
    });
}

const IProjectorLocator = DI.createInterface('IProjectorLocator').noDefault();
/** @internal */
function registerElement(container) {
    const resourceKey = this.kind.keyFrom(this.description.name);
    container.register(Registration.transient(resourceKey, this));
}
function customElement(nameOrDefinition) {
    return (target => CustomElementResource.define(nameOrDefinition, target));
}
function isType$2(Type) {
    return Type.kind === this;
}
function define$2(nameOrDefinition, ctor = null) {
    if (!nameOrDefinition) {
        throw Reporter.error(70);
    }
    const Type = (ctor === null ? class HTMLOnlyElement {
    } : ctor);
    const description = buildTemplateDefinition(Type, nameOrDefinition);
    const proto = Type.prototype;
    Type.kind = CustomElementResource;
    Type.description = description;
    Type.register = registerElement;
    proto.$hydrate = $hydrateElement;
    proto.$bind = $bindElement;
    proto.$attach = $attachElement;
    proto.$detach = $detachElement;
    proto.$unbind = $unbindElement;
    proto.$cache = $cacheElement;
    proto.$prevComponent = null;
    proto.$nextComponent = null;
    proto.$nextUnbindAfterDetach = null;
    proto.$scope = null;
    proto.$hooks = 0;
    proto.$bindingHead = null;
    proto.$bindingTail = null;
    proto.$componentHead = null;
    proto.$componentTail = null;
    proto.$mount = $mountElement;
    proto.$unmount = $unmountElement;
    proto.$nextMount = null;
    proto.$nextUnmount = null;
    proto.$projector = null;
    if ('flush' in proto) {
        proto.$nextFlush = null;
    }
    if ('binding' in proto)
        proto.$hooks |= 4 /* hasBinding */;
    if ('bound' in proto) {
        proto.$hooks |= 8 /* hasBound */;
        proto.$nextBound = null;
    }
    if ('unbinding' in proto)
        proto.$hooks |= 256 /* hasUnbinding */;
    if ('unbound' in proto) {
        proto.$hooks |= 512 /* hasUnbound */;
        proto.$nextUnbound = null;
    }
    if ('render' in proto)
        proto.$hooks |= 1024 /* hasRender */;
    if ('created' in proto)
        proto.$hooks |= 2 /* hasCreated */;
    if ('attaching' in proto)
        proto.$hooks |= 16 /* hasAttaching */;
    if ('attached' in proto) {
        proto.$hooks |= 32 /* hasAttached */;
        proto.$nextAttached = null;
    }
    if ('detaching' in proto)
        proto.$hooks |= 64 /* hasDetaching */;
    if ('caching' in proto)
        proto.$hooks |= 2048 /* hasCaching */;
    if ('detached' in proto) {
        proto.$hooks |= 128 /* hasDetached */;
        proto.$nextDetached = null;
    }
    return Type;
}
const CustomElementResource = {
    name: customElementName,
    keyFrom: customElementKey,
    isType: isType$2,
    behaviorFor: customElementBehavior,
    define: define$2
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

const { enter: enter$2, leave: leave$2 } = Profiler.createTimer('RenderLifecycle');
/** @internal */
function $hydrateAttribute(flags, parentContext) {
    const Type = this.constructor;
    const renderingEngine = parentContext.get(IRenderingEngine);
    renderingEngine.applyRuntimeBehavior(flags, Type, this);
    if (this.$hooks & 2 /* hasCreated */) {
        this.created(flags);
    }
}
/** @internal */
function $hydrateElement(flags, parentContext, host, options = PLATFORM.emptyObject) {
    const Type = this.constructor;
    const description = Type.description;
    const projectorLocator = parentContext.get(IProjectorLocator);
    const renderingEngine = parentContext.get(IRenderingEngine);
    const dom = parentContext.get(IDOM);
    let bindingContext;
    if (flags & LifecycleFlags.useProxies) {
        bindingContext = ProxyObserver.getOrCreate(this).proxy;
    }
    else {
        bindingContext = this;
    }
    this.$scope = Scope.create(flags, bindingContext, null);
    this.$host = host;
    this.$projector = projectorLocator.getElementProjector(dom, this, host, description);
    renderingEngine.applyRuntimeBehavior(flags, Type, this);
    if (this.$hooks & 1024 /* hasRender */) {
        const result = this.render(flags, host, options.parts, parentContext);
        if (result && 'getElementTemplate' in result) {
            const template = result.getElementTemplate(renderingEngine, Type, parentContext);
            template.render(this, host, options.parts);
        }
    }
    else {
        const template = renderingEngine.getElementTemplate(dom, description, parentContext, Type);
        template.render(this, host, options.parts);
    }
    if (this.$hooks & 2 /* hasCreated */) {
        this.created(flags);
    }
}

/** @internal */
function registerAttribute(container) {
    const description = this.description;
    const resourceKey = this.kind.keyFrom(description.name);
    const aliases = description.aliases;
    container.register(Registration.transient(resourceKey, this));
    for (let i = 0, ii = aliases.length; i < ii; ++i) {
        const aliasKey = this.kind.keyFrom(aliases[i]);
        container.register(Registration.alias(resourceKey, aliasKey));
    }
}
function customAttribute(nameOrDefinition) {
    return target => CustomAttributeResource.define(nameOrDefinition, target);
}
function templateController(nameOrDefinition) {
    return target => CustomAttributeResource.define(typeof nameOrDefinition === 'string'
        ? { isTemplateController: true, name: nameOrDefinition }
        : Object.assign({ isTemplateController: true }, nameOrDefinition), target);
}
function dynamicOptionsDecorator(target) {
    target.hasDynamicOptions = true;
    return target;
}
function dynamicOptions(target) {
    return target === undefined ? dynamicOptionsDecorator : dynamicOptionsDecorator(target);
}
function isType$3(Type) {
    return Type.kind === this;
}
function define$3(nameOrDefinition, ctor) {
    const Type = ctor;
    const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
    const proto = Type.prototype;
    Type.kind = CustomAttributeResource;
    Type.description = description;
    Type.register = registerAttribute;
    proto.$hydrate = $hydrateAttribute;
    proto.$bind = $bindAttribute;
    proto.$attach = $attachAttribute;
    proto.$detach = $detachAttribute;
    proto.$unbind = $unbindAttribute;
    proto.$cache = $cacheAttribute;
    proto.$prevComponent = null;
    proto.$nextComponent = null;
    proto.$nextUnbindAfterDetach = null;
    proto.$scope = null;
    proto.$hooks = 0;
    proto.$state = 0;
    if ('flush' in proto) {
        proto.$nextFlush = null;
    }
    if ('binding' in proto)
        proto.$hooks |= 4 /* hasBinding */;
    if ('bound' in proto) {
        proto.$hooks |= 8 /* hasBound */;
        proto.$nextBound = null;
    }
    if ('unbinding' in proto)
        proto.$hooks |= 256 /* hasUnbinding */;
    if ('unbound' in proto) {
        proto.$hooks |= 512 /* hasUnbound */;
        proto.$nextUnbound = null;
    }
    if ('created' in proto)
        proto.$hooks |= 2 /* hasCreated */;
    if ('attaching' in proto)
        proto.$hooks |= 16 /* hasAttaching */;
    if ('attached' in proto) {
        proto.$hooks |= 32 /* hasAttached */;
        proto.$nextAttached = null;
    }
    if ('detaching' in proto)
        proto.$hooks |= 64 /* hasDetaching */;
    if ('caching' in proto)
        proto.$hooks |= 2048 /* hasCaching */;
    if ('detached' in proto) {
        proto.$hooks |= 128 /* hasDetached */;
        proto.$nextDetached = null;
    }
    return Type;
}
const CustomAttributeResource = {
    name: customAttributeName,
    keyFrom: customAttributeKey,
    isType: isType$3,
    define: define$3
};
/** @internal */
function createCustomAttributeDescription(def, Type) {
    const aliases = def.aliases;
    const defaultBindingMode = def.defaultBindingMode;
    return {
        name: def.name,
        aliases: aliases === undefined || aliases === null ? PLATFORM.emptyArray : aliases,
        defaultBindingMode: defaultBindingMode === undefined || defaultBindingMode === null ? BindingMode.toView : defaultBindingMode,
        hasDynamicOptions: def.hasDynamicOptions === undefined ? false : def.hasDynamicOptions,
        isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
        bindables: Object.assign({}, Type.bindables, def.bindables),
        useProxies: def.useProxies === undefined ? false : def.useProxies
    };
}

function bindable(configOrTarget, prop) {
    let config;
    const decorator = function decorate($target, $prop) {
        const Type = $target.constructor;
        let bindables = Type.bindables;
        if (bindables === undefined) {
            bindables = Type.bindables = {};
        }
        if (!config.attribute) {
            config.attribute = PLATFORM.kebabCase($prop);
        }
        if (!config.callback) {
            config.callback = `${$prop}Changed`;
        }
        if (config.mode === undefined) {
            config.mode = BindingMode.toView;
        }
        if (config.useProxies === undefined) {
            config.useProxies = false;
        }
        if (arguments.length > 1) {
            // Non invocation:
            // - @bindable
            // Invocation with or w/o opts:
            // - @bindable()
            // - @bindable({...opts})
            config.property = $prop;
        }
        bindables[config.property] = config;
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

class If {
    constructor(ifFactory, location, coordinator) {
        this.value = false;
        this.coordinator = coordinator;
        this.elseFactory = null;
        this.elseView = null;
        this.ifFactory = ifFactory;
        this.ifView = null;
        this.location = location;
    }
    binding(flags) {
        const view = this.updateView(flags);
        this.coordinator.compose(view, flags);
        this.coordinator.binding(flags, this.$scope);
    }
    attaching(flags) {
        this.coordinator.attaching(flags);
    }
    detaching(flags) {
        this.coordinator.detaching(flags);
    }
    unbinding(flags) {
        this.coordinator.unbinding(flags);
    }
    caching(flags) {
        if (this.ifView !== null && this.ifView.release(flags)) {
            this.ifView = null;
        }
        if (this.elseView !== null && this.elseView.release(flags)) {
            this.elseView = null;
        }
        this.coordinator.caching(flags);
    }
    valueChanged(newValue, oldValue, flags) {
        if (this.$state & (2 /* isBound */ | 1 /* isBinding */)) {
            if (ProxyObserver.isProxy(this)) {
                flags |= LifecycleFlags.useProxies;
            }
            if (flags & LifecycleFlags.fromFlush) {
                const view = this.updateView(flags);
                this.coordinator.compose(view, flags);
            }
            else {
                this.$lifecycle.enqueueFlush(this).catch(error => { throw error; });
            }
        }
    }
    flush(flags) {
        if (ProxyObserver.isProxy(this)) {
            flags |= LifecycleFlags.useProxies;
        }
        const view = this.updateView(flags);
        this.coordinator.compose(view, flags);
    }
    /** @internal */
    updateView(flags) {
        let view;
        if (this.value) {
            view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
        }
        else if (this.elseFactory !== null) {
            view = this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
        }
        else {
            view = null;
        }
        return view;
    }
    /** @internal */
    ensureView(view, factory, flags) {
        if (view === null) {
            view = factory.create(flags);
        }
        view.hold(this.location);
        return view;
    }
}
If.inject = [IViewFactory, IRenderLocation, CompositionCoordinator];
__decorate([
    bindable
], If.prototype, "value", void 0);
CustomAttributeResource.define({ name: 'if', isTemplateController: true }, If);
class Else {
    constructor(factory) {
        this.factory = factory;
    }
    link(ifBehavior) {
        ifBehavior.elseFactory = this.factory;
    }
}
Else.inject = [IViewFactory];
CustomAttributeResource.define({ name: 'else', isTemplateController: true }, Else);

class Repeat {
    constructor(location, renderable, factory) {
        this.factory = factory;
        this.hasPendingInstanceMutation = false;
        this.location = location;
        this.observer = null;
        this.renderable = renderable;
        this.views = [];
        this.key = null;
        this.keyed = false;
    }
    binding(flags) {
        this.checkCollectionObserver(flags);
        let current = this.renderable.$bindingHead;
        while (current !== null) {
            if (ProxyObserver.getRawIfProxy(current.target) === ProxyObserver.getRawIfProxy(this) && current.targetProperty === 'items') {
                this.forOf = current.sourceExpression;
                break;
            }
            current = current.$nextBinding;
        }
        this.local = this.forOf.declaration.evaluate(flags, this.$scope, null);
        if (this.keyed || (flags & LifecycleFlags.keyedMode) > 0) {
            this.processViewsKeyed(null, flags);
        }
        else {
            this.processViewsNonKeyed(null, flags);
        }
    }
    attaching(flags) {
        const { views, location } = this;
        let view;
        for (let i = 0, ii = views.length; i < ii; ++i) {
            view = views[i];
            view.hold(location);
            view.$attach(flags);
        }
    }
    detaching(flags) {
        const { views } = this;
        let view;
        for (let i = 0, ii = views.length; i < ii; ++i) {
            view = views[i];
            view.$detach(flags);
            view.release(flags);
        }
    }
    unbinding(flags) {
        this.checkCollectionObserver(flags);
        const { views } = this;
        let view;
        for (let i = 0, ii = views.length; i < ii; ++i) {
            view = views[i];
            view.$unbind(flags);
        }
    }
    // called by SetterObserver (sync)
    itemsChanged(newValue, oldValue, flags) {
        this.checkCollectionObserver(flags);
        flags |= LifecycleFlags.updateTargetInstance;
        if (this.keyed || (flags & LifecycleFlags.keyedMode) > 0) {
            this.processViewsKeyed(null, flags);
        }
        else {
            this.processViewsNonKeyed(null, flags);
        }
    }
    // called by a CollectionObserver (async)
    handleBatchedChange(indexMap, flags) {
        flags |= (LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance);
        if (this.keyed || (flags & LifecycleFlags.keyedMode) > 0) {
            this.processViewsKeyed(indexMap, flags);
        }
        else {
            this.processViewsNonKeyed(indexMap, flags);
        }
    }
    // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
    // TODO: Reduce complexity (currently at 46)
    processViewsNonKeyed(indexMap, flags) {
        if (ProxyObserver.isProxy(this)) {
            flags |= LifecycleFlags.useProxies;
        }
        const { views, $lifecycle } = this;
        let view;
        if (this.$state & (2 /* isBound */ | 1 /* isBinding */)) {
            const { local, $scope, factory, forOf, items } = this;
            const oldLength = views.length;
            const newLength = forOf.count(items);
            if (oldLength < newLength) {
                views.length = newLength;
                for (let i = oldLength; i < newLength; ++i) {
                    views[i] = factory.create(flags);
                }
            }
            else if (newLength < oldLength) {
                $lifecycle.beginDetach();
                for (let i = newLength; i < oldLength; ++i) {
                    view = views[i];
                    view.release(flags);
                    view.$detach(flags);
                }
                $lifecycle.endDetach(flags);
                $lifecycle.beginUnbind();
                for (let i = newLength; i < oldLength; ++i) {
                    view = views[i];
                    view.$unbind(flags);
                }
                $lifecycle.endUnbind(flags);
                views.length = newLength;
                if (newLength === 0) {
                    return;
                }
            }
            else if (newLength === 0) {
                return;
            }
            $lifecycle.beginBind();
            if (indexMap === null) {
                forOf.iterate(items, (arr, i, item) => {
                    view = views[i];
                    if (!!view.$scope && view.$scope.bindingContext[local] === item) {
                        view.$bind(flags, Scope.fromParent(flags, $scope, view.$scope.bindingContext));
                    }
                    else {
                        view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, item)));
                    }
                });
            }
            else {
                forOf.iterate(items, (arr, i, item) => {
                    view = views[i];
                    if (!!view.$scope && (indexMap[i] === i || view.$scope.bindingContext[local] === item)) {
                        view.$bind(flags, Scope.fromParent(flags, $scope, view.$scope.bindingContext));
                    }
                    else {
                        view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, item)));
                    }
                });
            }
            $lifecycle.endBind(flags);
        }
        if (this.$state & (8 /* isAttached */ | 4 /* isAttaching */)) {
            const { location } = this;
            $lifecycle.beginAttach();
            if (indexMap === null) {
                for (let i = 0, ii = views.length; i < ii; ++i) {
                    view = views[i];
                    view.hold(location);
                    view.$attach(flags);
                }
            }
            else {
                for (let i = 0, ii = views.length; i < ii; ++i) {
                    if (indexMap[i] !== i) {
                        view = views[i];
                        view.hold(location);
                        view.$attach(flags);
                    }
                }
            }
            $lifecycle.endAttach(flags);
        }
    }
    processViewsKeyed(indexMap, flags) {
        if (ProxyObserver.isProxy(this)) {
            flags |= LifecycleFlags.useProxies;
        }
        const { $lifecycle, local, $scope, factory, forOf, items } = this;
        let views = this.views;
        if (indexMap === null) {
            if (this.$state & (2 /* isBound */ | 1 /* isBinding */)) {
                $lifecycle.beginDetach();
                const oldLength = views.length;
                let view;
                for (let i = 0; i < oldLength; ++i) {
                    view = views[i];
                    view.release(flags);
                    view.$detach(flags);
                }
                $lifecycle.endDetach(flags);
                $lifecycle.beginUnbind();
                for (let i = 0; i < oldLength; ++i) {
                    view = views[i];
                    view.$unbind(flags);
                }
                $lifecycle.endUnbind(flags);
                const newLen = forOf.count(items);
                views = this.views = Array(newLen);
                $lifecycle.beginBind();
                forOf.iterate(items, (arr, i, item) => {
                    view = views[i] = factory.create(flags);
                    view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, item)));
                });
                $lifecycle.endBind(flags);
            }
            if (this.$state & (8 /* isAttached */ | 4 /* isAttaching */)) {
                const { location } = this;
                $lifecycle.beginAttach();
                let view;
                const len = views.length;
                for (let i = 0; i < len; ++i) {
                    view = views[i];
                    view.hold(location);
                    view.$attach(flags);
                }
                $lifecycle.endAttach(flags);
            }
        }
        else {
            const mapLen = indexMap.length;
            let view;
            const deleted = indexMap.deletedItems;
            const deletedLen = deleted.length;
            let i = 0;
            if (this.$state & (2 /* isBound */ | 1 /* isBinding */)) {
                // first detach+unbind+(remove from array) the deleted view indices
                if (deletedLen > 0) {
                    $lifecycle.beginDetach();
                    i = 0;
                    for (; i < deletedLen; ++i) {
                        view = views[deleted[i]];
                        view.release(flags);
                        view.$detach(flags);
                    }
                    $lifecycle.endDetach(flags);
                    $lifecycle.beginUnbind();
                    for (i = 0; i < deletedLen; ++i) {
                        view = views[deleted[i]];
                        view.$unbind(flags);
                    }
                    $lifecycle.endUnbind(flags);
                    i = 0;
                    let j = 0;
                    let k = 0;
                    deleted.sort();
                    for (; i < deletedLen; ++i) {
                        j = deleted[i] - i;
                        views.splice(j, 1);
                        k = 0;
                        for (; k < mapLen; ++k) {
                            if (indexMap[k] >= j) {
                                --indexMap[k];
                            }
                        }
                    }
                }
                // then insert new views at the "added" indices to bring the views array in aligment with indexMap size
                $lifecycle.beginBind();
                i = 0;
                for (; i < mapLen; ++i) {
                    if (indexMap[i] === -2) {
                        view = factory.create(flags);
                        view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, items[i])));
                        views.splice(i, 0, view);
                    }
                }
                $lifecycle.endBind(flags);
                if (views.length !== mapLen) {
                    // TODO: create error code and use reporter with more informative message
                    throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
                }
            }
            if (this.$state & (8 /* isAttached */ | 4 /* isAttaching */)) {
                const { location } = this;
                // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
                // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
                const seq = longestIncreasingSubsequence(indexMap);
                const seqLen = seq.length;
                $lifecycle.beginDetach();
                $lifecycle.beginAttach();
                const operation = {
                    $mount() {
                        let next = location;
                        let j = seqLen - 1;
                        i = indexMap.length - 1;
                        for (; i >= 0; --i) {
                            if (indexMap[i] === -2) {
                                view = views[i];
                                view.$state |= 4 /* isAttaching */;
                                let current = view.$componentHead;
                                while (current !== null) {
                                    current.$attach(flags | LifecycleFlags.fromAttach);
                                    current = current.$nextComponent;
                                }
                                view.$nodes.insertBefore(next);
                                view.$state |= (16 /* isMounted */ | 8 /* isAttached */);
                                view.$state &= ~4 /* isAttaching */;
                                next = view.$nodes.firstChild;
                            }
                            else if (j < 0 || seqLen === 1 || i !== seq[j]) {
                                view = views[indexMap[i]];
                                view.$state |= 32 /* isDetaching */;
                                let current = view.$componentTail;
                                while (current !== null) {
                                    current.$detach(flags | LifecycleFlags.fromDetach);
                                    current = current.$prevComponent;
                                }
                                view.$nodes.remove();
                                view.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */ | 16 /* isMounted */);
                                view.$state |= 4 /* isAttaching */;
                                current = view.$componentHead;
                                while (current !== null) {
                                    current.$attach(flags | LifecycleFlags.fromAttach);
                                    current = current.$nextComponent;
                                }
                                view.$nodes.insertBefore(next);
                                view.$state |= (16 /* isMounted */ | 8 /* isAttached */);
                                view.$state &= ~4 /* isAttaching */;
                                next = view.$nodes.firstChild;
                            }
                            else {
                                view = views[i];
                                next = view.$nodes.firstChild;
                                --j;
                            }
                        }
                    },
                    $nextMount: null
                };
                $lifecycle.enqueueMount(operation);
                $lifecycle.endDetach(flags);
                $lifecycle.endAttach(flags);
            }
        }
    }
    checkCollectionObserver(flags) {
        const oldObserver = this.observer;
        if (this.$state & (2 /* isBound */ | 1 /* isBinding */)) {
            const newObserver = this.observer = getCollectionObserver(flags, this.$lifecycle, this.items);
            if (oldObserver !== newObserver && oldObserver) {
                oldObserver.unsubscribeBatched(this);
            }
            if (newObserver) {
                newObserver.subscribeBatched(this);
            }
        }
        else if (oldObserver) {
            oldObserver.unsubscribeBatched(this);
        }
    }
}
Repeat.inject = [IRenderLocation, IRenderable, IViewFactory];
__decorate([
    bindable
], Repeat.prototype, "items", void 0);
CustomAttributeResource.define({ name: 'repeat', isTemplateController: true }, Repeat);
let prevIndices;
let tailIndices;
let maxLen = 0;
// Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
// with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
/** @internal */
function longestIncreasingSubsequence(indexMap) {
    const len = indexMap.length;
    const origLen = len + (indexMap.deletedItems && indexMap.deletedItems.length || 0);
    const TArr = origLen < 0xFF ? Uint8Array : origLen < 0xFFFF ? Uint16Array : Uint32Array;
    if (len > maxLen) {
        maxLen = len;
        prevIndices = new TArr(len);
        tailIndices = new TArr(len);
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
                    prevIndices[i] = prevIndices[low - 1];
                }
                prevIndices[low] = i;
            }
        }
    }
    i = ++cursor;
    const result = new TArr(i);
    cur = prevIndices[cursor - 1];
    while (cursor-- > 0) {
        result[cursor] = cur;
        cur = tailIndices[cur];
    }
    while (i-- > 0)
        prevIndices[i] = 0;
    return result;
}

class Replaceable {
    constructor(factory, location) {
        this.factory = factory;
        this.currentView = this.factory.create();
        this.currentView.hold(location);
    }
    binding(flags) {
        this.currentView.$bind(flags | LifecycleFlags.allowParentScopeTraversal, this.$scope);
    }
    attaching(flags) {
        this.currentView.$attach(flags);
    }
    detaching(flags) {
        this.currentView.$detach(flags);
    }
    unbinding(flags) {
        this.currentView.$unbind(flags);
    }
}
Replaceable.inject = [IViewFactory, IRenderLocation];
CustomAttributeResource.define({ name: 'replaceable', isTemplateController: true }, Replaceable);

class With {
    constructor(factory, location) {
        this.value = null;
        this.factory = factory;
        this.currentView = this.factory.create();
        this.currentView.hold(location);
    }
    valueChanged() {
        if (this.$state & (2 /* isBound */ | 1 /* isBinding */)) {
            this.bindChild(LifecycleFlags.fromBindableHandler);
        }
    }
    binding(flags) {
        this.bindChild(flags);
    }
    attaching(flags) {
        this.currentView.$attach(flags);
    }
    detaching(flags) {
        this.currentView.$detach(flags);
    }
    unbinding(flags) {
        this.currentView.$unbind(flags);
    }
    bindChild(flags) {
        const scope = Scope.fromParent(flags, this.$scope, this.value);
        this.currentView.$bind(flags, scope);
    }
}
With.inject = [IViewFactory, IRenderLocation];
__decorate([
    bindable
], With.prototype, "value", void 0);
CustomAttributeResource.define({ name: 'with', isTemplateController: true }, With);

const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ISanitizer = DI.createInterface('ISanitizer').withDefault(x => x.singleton(class {
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
        if (untrustedMarkup === null || untrustedMarkup === undefined) {
            return null;
        }
        return this.sanitizer.sanitize(untrustedMarkup);
    }
}
SanitizeValueConverter.inject = [ISanitizer];
ValueConverterResource.define('sanitize', SanitizeValueConverter);

const { enter: enterStart, leave: leaveStart } = Profiler.createTimer('Aurelia.start');
const { enter: enterStop, leave: leaveStop } = Profiler.createTimer('Aurelia.stop');
class Aurelia {
    constructor(container = DI.createContainer()) {
        this.container = container;
        this.components = [];
        this.startTasks = [];
        this.stopTasks = [];
        this.isStarted = false;
        this._root = null;
        Registration
            .instance(Aurelia, this)
            .register(container, Aurelia);
    }
    register(...params) {
        this.container.register(...params);
        return this;
    }
    app(config) {
        const host = config.host;
        const domInitializer = this.container.get(IDOMInitializer);
        domInitializer.initialize(config);
        let startFlags = LifecycleFlags.fromStartTask;
        let stopFlags = LifecycleFlags.fromStopTask;
        if (config.useProxies) {
            startFlags |= LifecycleFlags.useProxies;
            stopFlags |= LifecycleFlags.useProxies;
        }
        let component;
        const componentOrType = config.component;
        if (CustomElementResource.isType(componentOrType)) {
            this.container.register(componentOrType);
            component = this.container.get(CustomElementResource.keyFrom(componentOrType.description.name));
        }
        else {
            component = componentOrType;
        }
        component = ProxyObserver.getRawIfProxy(component);
        const startTask = () => {
            host.$au = this;
            if (!this.components.includes(component)) {
                this._root = component;
                this.components.push(component);
                component.$hydrate(startFlags, this.container, host);
            }
            component.$bind(startFlags | LifecycleFlags.fromBind, null);
            component.$attach(startFlags | LifecycleFlags.fromAttach);
        };
        this.startTasks.push(startTask);
        this.stopTasks.push(() => {
            component.$detach(stopFlags | LifecycleFlags.fromDetach);
            component.$unbind(stopFlags | LifecycleFlags.fromUnbind);
            host.$au = null;
        });
        if (this.isStarted) {
            startTask();
        }
        return this;
    }
    root() {
        return ProxyObserver.getProxyOrSelf(this._root);
    }
    start() {
        for (const runStartTask of this.startTasks) {
            runStartTask();
        }
        this.isStarted = true;
        return this;
    }
    stop() {
        this.isStarted = false;
        for (const runStopTask of this.stopTasks) {
            runStopTask();
        }
        return this;
    }
}
PLATFORM.global.Aurelia = Aurelia;
const IDOMInitializer = DI.createInterface('IDOMInitializer').noDefault();

function instructionRenderer(instructionType) {
    return function decorator(target) {
        // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
        const decoratedTarget = function (...args) {
            const instance = new target(...args);
            instance.instructionType = instructionType;
            return instance;
        };
        // make sure we register the decorated constructor with DI
        decoratedTarget.register = function register(container) {
            return Registration.singleton(IInstructionRenderer, decoratedTarget).register(container, IInstructionRenderer);
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
        return Registration.singleton(IRenderer, this).register(container);
    }
    // tslint:disable-next-line:parameters-max-number
    render(flags, dom, context, renderable, targets, definition, host, parts) {
        const targetInstructions = definition.instructions;
        const instructionRenderers = this.instructionRenderers;
        if (targets.length !== targetInstructions.length) {
            if (targets.length > targetInstructions.length) {
                throw Reporter.error(30);
            }
            else {
                throw Reporter.error(31);
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
    }
}
Renderer.inject = [all(IInstructionRenderer)];
function ensureExpression(parser, srcOrExpr, bindingType) {
    if (typeof srcOrExpr === 'string') {
        return parser.parse(srcOrExpr, bindingType);
    }
    return srcOrExpr;
}
function addBinding(renderable, binding) {
    binding.$prevBinding = renderable.$bindingTail;
    binding.$nextBinding = null;
    if (renderable.$bindingTail === null) {
        renderable.$bindingHead = binding;
    }
    else {
        renderable.$bindingTail.$nextBinding = binding;
    }
    renderable.$bindingTail = binding;
}
function addComponent(renderable, component) {
    component.$prevComponent = renderable.$componentTail;
    component.$nextComponent = null;
    if (renderable.$componentTail === null) {
        renderable.$componentHead = component;
    }
    else {
        renderable.$componentTail.$nextComponent = component;
    }
    renderable.$componentTail = component;
}
let SetPropertyRenderer = 
/** @internal */
class SetPropertyRenderer {
    render(flags, dom, context, renderable, target, instruction) {
        target[instruction.to] = instruction.value;
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
        const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
        const component = context.get(customElementKey(instruction.res));
        const instructionRenderers = context.get(IRenderer).instructionRenderers;
        const childInstructions = instruction.instructions;
        component.$hydrate(flags, context, target, instruction);
        let current;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            current = childInstructions[i];
            instructionRenderers[current.type].render(flags, dom, context, renderable, component, current);
        }
        addComponent(renderable, component);
        operation.dispose();
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
        const operation = context.beginComponentOperation(renderable, target, instruction);
        const component = context.get(customAttributeKey(instruction.res));
        const instructionRenderers = context.get(IRenderer).instructionRenderers;
        const childInstructions = instruction.instructions;
        component.$hydrate(flags, context);
        let current;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            current = childInstructions[i];
            instructionRenderers[current.type].render(flags, dom, context, renderable, component, current);
        }
        addComponent(renderable, component);
        operation.dispose();
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
        const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
        const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
        const component = context.get(customAttributeKey(instruction.res));
        const instructionRenderers = context.get(IRenderer).instructionRenderers;
        const childInstructions = instruction.instructions;
        component.$hydrate(flags, context);
        if (instruction.link) {
            component.link(renderable.$componentTail);
        }
        let current;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            current = childInstructions[i];
            instructionRenderers[current.type].render(flags, dom, context, renderable, component, current);
        }
        addComponent(renderable, component);
        operation.dispose();
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
        dom.remove(target);
        const childInstructions = instruction.instructions;
        const toViewModel = instruction.toViewModel;
        let childInstruction;
        let expr;
        let binding;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            childInstruction = childInstructions[i];
            expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
            binding = new LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
            addBinding(renderable, binding);
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
        const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
        const binding = new Call(expr, target, instruction.to, this.observerLocator, context);
        addBinding(renderable, binding);
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
        const expr = ensureExpression(this.parser, instruction.from, 1280 /* IsRef */);
        const binding = new Ref(expr, target, context);
        addBinding(renderable, binding);
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
        let binding;
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        if (expr.isMulti) {
            binding = new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, BindingMode.toView, context);
        }
        else {
            binding = new InterpolationBinding(expr.firstExpression, expr, target, instruction.to, BindingMode.toView, this.observerLocator, context, true);
        }
        addBinding(renderable, binding);
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
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
        const binding = new Binding(expr, target, instruction.to, instruction.mode, this.observerLocator, context);
        addBinding(renderable, binding);
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
        const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
        const binding = new Binding(expr, target, instruction.to, BindingMode.toView, this.observerLocator, context);
        addBinding(renderable, binding);
    }
};
IteratorBindingRenderer.inject = [IExpressionParser, IObserverLocator];
IteratorBindingRenderer = __decorate([
    instructionRenderer("rk" /* iteratorBinding */)
    /** @internal */
], IteratorBindingRenderer);

class KeyedBindingBehavior {
    bind(flags, scope, binding, key) {
        // key is a lie (at the moment), we don't actually use it
        binding.target.key = key;
        // we do use keyeD though
        binding.target.keyed = true;
    }
    unbind(flags, scope, binding) {
        binding.target.key = null;
        binding.target.keyed = false;
    }
}
BindingBehaviorResource.define('keyed', KeyedBindingBehavior);

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
const KeyedBindingBehaviorRegistration = KeyedBindingBehavior;
const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior;
const ToViewBindingBehaviorRegistration = ToViewBindingBehavior;
const FromViewBindingBehaviorRegistration = FromViewBindingBehavior;
const SignalBindingBehaviorRegistration = SignalBindingBehavior;
const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior;
const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior;
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
    KeyedBindingBehaviorRegistration,
    OneTimeBindingBehaviorRegistration,
    ToViewBindingBehaviorRegistration,
    FromViewBindingBehaviorRegistration,
    SignalBindingBehaviorRegistration,
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
        return this.register(DI.createContainer());
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
        this.mode = BindingMode.oneTime;
        this.oneTime = true;
        this.to = to;
    }
}
class ToViewBindingInstruction {
    constructor(from, to) {
        this.type = "rg" /* propertyBinding */;
        this.from = from;
        this.mode = BindingMode.toView;
        this.oneTime = false;
        this.to = to;
    }
}
class FromViewBindingInstruction {
    constructor(from, to) {
        this.type = "rg" /* propertyBinding */;
        this.from = from;
        this.mode = BindingMode.fromView;
        this.oneTime = false;
        this.to = to;
    }
}
class TwoWayBindingInstruction {
    constructor(from, to) {
        this.type = "rg" /* propertyBinding */;
        this.type = "rg" /* propertyBinding */;
        this.from = from;
        this.mode = BindingMode.twoWay;
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
    constructor(def, res, instructions, link) {
        this.type = "rc" /* hydrateTemplateController */;
        this.def = def;
        this.instructions = instructions;
        this.link = link;
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

export { CallFunction, connects, observes, callsFunction, hasAncestor, isAssignable, isLeftHandSide, isPrimary, isResource, hasBind, hasUnbind, isLiteral, arePureLiterals, isPureLiteral, BindingBehavior, ValueConverter, Assign, Conditional, AccessThis, AccessScope, AccessMember, AccessKeyed, CallScope, CallMember, Binary, Unary, PrimitiveLiteral, HtmlLiteral, ArrayLiteral, ObjectLiteral, Template, TaggedTemplate, ArrayBindingPattern, ObjectBindingPattern, BindingIdentifier, ForOfStatement, Interpolation, Binding, Call, connectable, IExpressionParser, BindingType, MultiInterpolationBinding, InterpolationBinding, LetBinding, Ref, ArrayObserver, enableArrayObservation, disableArrayObservation, MapObserver, enableMapObservation, disableMapObservation, SetObserver, enableSetObservation, disableSetObservation, BindingContext, Scope, OverrideContext, collectionObserver, CollectionLengthObserver, computed, CustomSetterObserver, GetterObserver, IDirtyChecker, DirtyCheckProperty, DirtyCheckSettings, IObserverLocator, ITargetObserverLocator, ITargetAccessorLocator, getCollectionObserver, PrimitiveObserver, PropertyAccessor, propertyObserver, ProxyObserver, SelfObserver, SetterObserver, ISignaler, subscriberCollection, batchedSubscriberCollection, targetObserver, bindingBehavior, BindingBehaviorResource, BindingModeBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, TwoWayBindingBehavior, DebounceBindingBehavior, SignalBindingBehavior, ThrottleBindingBehavior, customAttribute, CustomAttributeResource, dynamicOptions, templateController, If, Else, Repeat, Replaceable, With, containerless, customElement, CustomElementResource, IProjectorLocator, useShadowDOM, valueConverter, ValueConverterResource, ISanitizer, SanitizeValueConverter, bindable, Aurelia, IDOMInitializer, IfRegistration, ElseRegistration, RepeatRegistration, ReplaceableRegistration, WithRegistration, SanitizeValueConverterRegistration, DebounceBindingBehaviorRegistration, OneTimeBindingBehaviorRegistration, ToViewBindingBehaviorRegistration, FromViewBindingBehaviorRegistration, SignalBindingBehaviorRegistration, ThrottleBindingBehaviorRegistration, TwoWayBindingBehaviorRegistration, DefaultResources as BasicResources, IObserverLocatorRegistration as ObserverLocatorRegistration, ILifecycleRegistration as LifecycleRegistration, IRendererRegistration as RendererRegistration, RuntimeBasicConfiguration as BasicConfiguration, buildTemplateDefinition, isTargetedInstruction, ITargetedInstruction, TargetedInstructionType, DOM, INode, IRenderLocation, IDOM, NodeSequence, BindingMode, ExpressionKind, Hooks, LifecycleFlags, State, stringifyLifecycleFlags, CallBindingInstruction, FromViewBindingInstruction, HydrateAttributeInstruction, HydrateElementInstruction, HydrateTemplateController, InterpolationInstruction, IteratorBindingInstruction, LetBindingInstruction, LetElementInstruction, OneTimeBindingInstruction, RefBindingInstruction, SetPropertyInstruction, ToViewBindingInstruction, TwoWayBindingInstruction, AggregateLifecycleTask, CompositionCoordinator, ILifecycle, IRenderable, IViewFactory, LifecycleTask, PromiseTask, CollectionKind, DelegationStrategy, MutationKind, instructionRenderer, ensureExpression, addComponent, addBinding, CompiledTemplate, createRenderContext, IInstructionRenderer, IRenderer, IRenderingEngine, ITemplateCompiler, ITemplateFactory, ViewCompileFlags };
//# sourceMappingURL=index.es6.js.map
