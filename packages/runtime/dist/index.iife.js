this.au = this.au || {};
this.au.runtime = (function (exports, kernel) {
  'use strict';

  (function (LifecycleFlags) {
      LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
      LifecycleFlags[LifecycleFlags["mustEvaluate"] = 262144] = "mustEvaluate";
      LifecycleFlags[LifecycleFlags["mutation"] = 3] = "mutation";
      LifecycleFlags[LifecycleFlags["isCollectionMutation"] = 1] = "isCollectionMutation";
      LifecycleFlags[LifecycleFlags["isInstanceMutation"] = 2] = "isInstanceMutation";
      LifecycleFlags[LifecycleFlags["update"] = 28] = "update";
      LifecycleFlags[LifecycleFlags["updateTargetObserver"] = 4] = "updateTargetObserver";
      LifecycleFlags[LifecycleFlags["updateTargetInstance"] = 8] = "updateTargetInstance";
      LifecycleFlags[LifecycleFlags["updateSourceExpression"] = 16] = "updateSourceExpression";
      LifecycleFlags[LifecycleFlags["from"] = 262112] = "from";
      LifecycleFlags[LifecycleFlags["fromFlush"] = 96] = "fromFlush";
      LifecycleFlags[LifecycleFlags["fromAsyncFlush"] = 32] = "fromAsyncFlush";
      LifecycleFlags[LifecycleFlags["fromSyncFlush"] = 64] = "fromSyncFlush";
      LifecycleFlags[LifecycleFlags["fromStartTask"] = 128] = "fromStartTask";
      LifecycleFlags[LifecycleFlags["fromStopTask"] = 256] = "fromStopTask";
      LifecycleFlags[LifecycleFlags["fromBind"] = 512] = "fromBind";
      LifecycleFlags[LifecycleFlags["fromUnbind"] = 1024] = "fromUnbind";
      LifecycleFlags[LifecycleFlags["fromAttach"] = 2048] = "fromAttach";
      LifecycleFlags[LifecycleFlags["fromDetach"] = 4096] = "fromDetach";
      LifecycleFlags[LifecycleFlags["fromCache"] = 8192] = "fromCache";
      LifecycleFlags[LifecycleFlags["fromDOMEvent"] = 16384] = "fromDOMEvent";
      LifecycleFlags[LifecycleFlags["fromObserverSetter"] = 32768] = "fromObserverSetter";
      LifecycleFlags[LifecycleFlags["fromBindableHandler"] = 65536] = "fromBindableHandler";
      LifecycleFlags[LifecycleFlags["fromLifecycleTask"] = 131072] = "fromLifecycleTask";
      LifecycleFlags[LifecycleFlags["parentUnmountQueued"] = 524288] = "parentUnmountQueued";
      // this flag is for the synchronous flush before detach (no point in updating the
      // DOM if it's about to be detached)
      LifecycleFlags[LifecycleFlags["doNotUpdateDOM"] = 1048576] = "doNotUpdateDOM";
      LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 2097152] = "isTraversingParentScope";
      // Bitmask for flags that need to be stored on a binding during $bind for mutation
      // callbacks outside of $bind
      LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 4194304] = "persistentBindingFlags";
      LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 4194304] = "allowParentScopeTraversal";
  })(exports.LifecycleFlags || (exports.LifecycleFlags = {}));
  function stringifyLifecycleFlags(flags) {
      const flagNames = [];
      if (flags & exports.LifecycleFlags.mustEvaluate) {
          flagNames.push('mustEvaluate');
      }
      if (flags & exports.LifecycleFlags.isCollectionMutation) {
          flagNames.push('isCollectionMutation');
      }
      if (flags & exports.LifecycleFlags.isInstanceMutation) {
          flagNames.push('isInstanceMutation');
      }
      if (flags & exports.LifecycleFlags.updateTargetObserver) {
          flagNames.push('updateTargetObserver');
      }
      if (flags & exports.LifecycleFlags.updateTargetInstance) {
          flagNames.push('updateTargetInstance');
      }
      if (flags & exports.LifecycleFlags.updateSourceExpression) {
          flagNames.push('updateSourceExpression');
      }
      if (flags & exports.LifecycleFlags.fromAsyncFlush) {
          flagNames.push('fromAsyncFlush');
      }
      if (flags & exports.LifecycleFlags.fromSyncFlush) {
          flagNames.push('fromSyncFlush');
      }
      if (flags & exports.LifecycleFlags.fromStartTask) {
          flagNames.push('fromStartTask');
      }
      if (flags & exports.LifecycleFlags.fromStopTask) {
          flagNames.push('fromStopTask');
      }
      if (flags & exports.LifecycleFlags.fromBind) {
          flagNames.push('fromBind');
      }
      if (flags & exports.LifecycleFlags.fromUnbind) {
          flagNames.push('fromUnbind');
      }
      if (flags & exports.LifecycleFlags.fromAttach) {
          flagNames.push('fromAttach');
      }
      if (flags & exports.LifecycleFlags.fromDetach) {
          flagNames.push('fromDetach');
      }
      if (flags & exports.LifecycleFlags.fromCache) {
          flagNames.push('fromCache');
      }
      if (flags & exports.LifecycleFlags.fromDOMEvent) {
          flagNames.push('fromDOMEvent');
      }
      if (flags & exports.LifecycleFlags.fromObserverSetter) {
          flagNames.push('fromObserverSetter');
      }
      if (flags & exports.LifecycleFlags.fromBindableHandler) {
          flagNames.push('fromBindableHandler');
      }
      if (flags & exports.LifecycleFlags.fromLifecycleTask) {
          flagNames.push('fromLifecycleTask');
      }
      if (flags & exports.LifecycleFlags.parentUnmountQueued) {
          flagNames.push('parentUnmountQueued');
      }
      if (flags & exports.LifecycleFlags.doNotUpdateDOM) {
          flagNames.push('doNotUpdateDOM');
      }
      if (flags & exports.LifecycleFlags.isTraversingParentScope) {
          flagNames.push('isTraversingParentScope');
      }
      if (flags & exports.LifecycleFlags.allowParentScopeTraversal) {
          flagNames.push('allowParentScopeTraversal');
      }
      return flagNames.join('|');
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
  (function (MutationKind) {
      MutationKind[MutationKind["instance"] = 1] = "instance";
      MutationKind[MutationKind["collection"] = 2] = "collection";
  })(exports.MutationKind || (exports.MutationKind = {}));
  (function (CollectionKind) {
      CollectionKind[CollectionKind["indexed"] = 8] = "indexed";
      CollectionKind[CollectionKind["keyed"] = 4] = "keyed";
      CollectionKind[CollectionKind["array"] = 9] = "array";
      CollectionKind[CollectionKind["map"] = 6] = "map";
      CollectionKind[CollectionKind["set"] = 7] = "set";
  })(exports.CollectionKind || (exports.CollectionKind = {}));

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
      const length = subscribers && subscribers.length;
      if (length !== undefined && length > 0) {
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
          observedPropertyDescriptor.set = value => { this.setValue(value, exports.LifecycleFlags.updateTargetInstance); };
          if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
              kernel.Reporter.write(1, propertyKey, obj);
          }
      }
      this.addSubscriber(subscriber);
  }
  function dispose() {
      // tslint:disable-next-line:no-dynamic-delete
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
              if (!(flags & exports.LifecycleFlags.fromBind)) {
                  this.callSubscribers(newValue, currentValue, flags);
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
  exports.SetterObserver = __decorate([
      propertyObserver()
  ], exports.SetterObserver);

  var RuntimeError;
  (function (RuntimeError) {
      RuntimeError[RuntimeError["UndefinedScope"] = 250] = "UndefinedScope";
      RuntimeError[RuntimeError["NullScope"] = 251] = "NullScope";
      RuntimeError[RuntimeError["NilOverrideContext"] = 252] = "NilOverrideContext";
      RuntimeError[RuntimeError["NilParentScope"] = 253] = "NilParentScope";
  })(RuntimeError || (RuntimeError = {}));
  /** @internal */
  class InternalObserversLookup {
      getOrCreate(obj, key) {
          let observer = this[key];
          if (observer === undefined) {
              observer = this[key] = new exports.SetterObserver(obj, key);
          }
          return observer;
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
      static create(keyOrObj, value) {
          return new BindingContext(keyOrObj, value);
      }
      static get(scope, name, ancestor, flags) {
          if (scope === undefined) {
              throw kernel.Reporter.error(250 /* UndefinedScope */);
          }
          if (scope === null) {
              throw kernel.Reporter.error(251 /* NullScope */);
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
          if ((flags & exports.LifecycleFlags.allowParentScopeTraversal) && scope.parentScope !== null) {
              const result = this.get(scope.parentScope, name, ancestor, flags
                  // unset the flag; only allow one level of scope boundary traversal
                  & ~exports.LifecycleFlags.allowParentScopeTraversal
                  // tell the scope to return null if the name could not be found
                  | exports.LifecycleFlags.isTraversingParentScope);
              if (result !== null) {
                  return result;
              }
          }
          // still nothing found. return the root binding context (or null
          // if this is a parent scope traversal, to ensure we fall back to the
          // correct level)
          if (flags & exports.LifecycleFlags.isTraversingParentScope) {
              return null;
          }
          return scope.bindingContext || scope.overrideContext;
      }
      getObservers() {
          let observers = this.$observers;
          if (observers === undefined) {
              this.$observers = observers = new InternalObserversLookup();
          }
          return observers;
      }
  }
  class Scope {
      constructor(bindingContext, overrideContext) {
          this.bindingContext = bindingContext;
          this.overrideContext = overrideContext;
          this.parentScope = null;
      }
      static create(bc, oc) {
          return new Scope(bc, oc === null || oc === undefined ? OverrideContext.create(bc, oc) : oc);
      }
      static fromOverride(oc) {
          if (oc === null || oc === undefined) {
              throw kernel.Reporter.error(252 /* NilOverrideContext */);
          }
          return new Scope(oc.bindingContext, oc);
      }
      static fromParent(ps, bc) {
          if (ps === null || ps === undefined) {
              throw kernel.Reporter.error(253 /* NilParentScope */);
          }
          return new Scope(bc, OverrideContext.create(bc, ps.overrideContext));
      }
  }
  class OverrideContext {
      constructor(bindingContext, parentOverrideContext) {
          this.$synthetic = true;
          this.bindingContext = bindingContext;
          this.parentOverrideContext = parentOverrideContext;
      }
      static create(bc, poc) {
          return new OverrideContext(bc, poc === undefined ? null : poc);
      }
      getObservers() {
          let observers = this.$observers;
          if (observers === undefined) {
              this.$observers = observers = new InternalObserversLookup();
          }
          return observers;
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
              listener.handleChange(undefined, undefined, flags | exports.LifecycleFlags.updateTargetInstance);
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
      container.register(kernel.Registration.singleton(resourceKey, this));
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
      ExpressionKind[ExpressionKind["ForOfStatement"] = 55] = "ForOfStatement";
      ExpressionKind[ExpressionKind["Interpolation"] = 24] = "Interpolation"; //
  })(exports.ExpressionKind || (exports.ExpressionKind = {}));
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
          this.expressionHasBind = hasBind(expression);
          this.expressionHasUnbind = hasUnbind(expression);
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
              throw kernel.Reporter.error(250 /* UndefinedScope */, this);
          }
          if (scope === null) {
              throw kernel.Reporter.error(251 /* NullScope */, this);
          }
          if (!binding) {
              throw kernel.Reporter.error(206 /* NoBinding */, this);
          }
          const locator = binding.locator;
          if (!locator) {
              throw kernel.Reporter.error(202 /* NoLocator */, this);
          }
          if (this.expressionHasBind) {
              this.expression.bind(flags, scope, binding);
          }
          const behaviorKey = this.behaviorKey;
          const behavior = locator.get(behaviorKey);
          if (!behavior) {
              throw kernel.Reporter.error(203 /* NoBehaviorFound */, this);
          }
          if (binding[behaviorKey] !== undefined && binding[behaviorKey] !== null) {
              throw kernel.Reporter.error(204 /* BehaviorAlreadyApplied */, this);
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
              return converter.toView.apply(converter, result);
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
              value = converter.fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
          }
          return this.expression.assign(flags, scope, locator, value);
      }
      connect(flags, scope, binding) {
          if (scope === undefined) {
              throw kernel.Reporter.error(250 /* UndefinedScope */, this);
          }
          if (scope === null) {
              throw kernel.Reporter.error(251 /* NullScope */, this);
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
          if (scope === undefined) {
              throw kernel.Reporter.error(250 /* UndefinedScope */, this);
          }
          if (scope === null) {
              throw kernel.Reporter.error(251 /* NullScope */, this);
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
          const name = this.name;
          return BindingContext.get(scope, name, this.ancestor, flags)[name];
      }
      assign(flags, scope, locator, value) {
          const name = this.name;
          const context = BindingContext.get(scope, name, this.ancestor, flags);
          return context ? (context[name] = value) : undefined;
      }
      connect(flags, scope, binding) {
          const name = this.name;
          const context = BindingContext.get(scope, name, this.ancestor, flags);
          binding.observeProperty(context, name);
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
              binding.observeProperty(obj, this.name);
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
                  binding.observeProperty(obj, key);
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
          return undefined;
      }
      connect(flags, scope, binding) {
          const obj = this.object.evaluate(flags, scope, null);
          this.object.connect(flags, scope, binding);
          if (getFunction(flags & ~exports.LifecycleFlags.mustEvaluate, obj, this.name)) {
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
          if (!(flags & exports.LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
              return undefined;
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
  PrimitiveLiteral.$undefined = new PrimitiveLiteral(undefined);
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
          this.expressions = expressions === undefined ? kernel.PLATFORM.emptyArray : expressions;
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
          this.expressions = expressions === undefined ? kernel.PLATFORM.emptyArray : expressions;
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
          this.$kind = 55 /* ForOfStatement */;
          this.assign = kernel.PLATFORM.noop;
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
          this.expressions = expressions === undefined ? kernel.PLATFORM.emptyArray : expressions;
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
  /*
  * Note: for a property that is always the same, directly assigning it to the prototype is more efficient CPU wise
  * (gets assigned once, instead of per constructor call) as well as memory wise (stored once, instead of per instance)
  *
  * This gives us a cheap way to add some extra information to the AST for the runtime to do things more efficiently.
  */
  BindingBehavior.prototype.$kind = 38962 /* BindingBehavior */;
  ValueConverter.prototype.$kind = 36913 /* ValueConverter */;
  Assign.prototype.$kind = 8208 /* Assign */;
  Conditional.prototype.$kind = 63 /* Conditional */;
  AccessThis.prototype.$kind = 1793 /* AccessThis */;
  AccessScope.prototype.$kind = 10082 /* AccessScope */;
  AccessMember.prototype.$kind = 9323 /* AccessMember */;
  AccessKeyed.prototype.$kind = 9324 /* AccessKeyed */;
  CallScope.prototype.$kind = 1448 /* CallScope */;
  CallMember.prototype.$kind = 1161 /* CallMember */;
  CallFunction.prototype.$kind = 1162 /* CallFunction */;
  Binary.prototype.$kind = 46 /* Binary */;
  Unary.prototype.$kind = 39 /* Unary */;
  PrimitiveLiteral.prototype.$kind = 17925 /* PrimitiveLiteral */;
  HtmlLiteral.prototype.$kind = 51 /* HtmlLiteral */;
  ArrayLiteral.prototype.$kind = 17955 /* ArrayLiteral */;
  ObjectLiteral.prototype.$kind = 17956 /* ObjectLiteral */;
  Template.prototype.$kind = 17958 /* Template */;
  TaggedTemplate.prototype.$kind = 1197 /* TaggedTemplate */;
  ArrayBindingPattern.prototype.$kind = 65556 /* ArrayBindingPattern */;
  ObjectBindingPattern.prototype.$kind = 65557 /* ObjectBindingPattern */;
  BindingIdentifier.prototype.$kind = 65558 /* BindingIdentifier */;
  ForOfStatement.prototype.$kind = 55 /* ForOfStatement */;
  Interpolation.prototype.$kind = 24 /* Interpolation */;
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
      if (!(flags & exports.LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
          return null;
      }
      throw kernel.Reporter.error(207 /* NotAFunction */, obj, name, func);
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
      for (let i = 0; i < len; ++i) {
          const char = value.charCodeAt(i);
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
  const IRenderable = kernel.DI.createInterface('IRenderable').noDefault();
  const IViewFactory = kernel.DI.createInterface('IViewFactory').noDefault();
  const marker = Object.freeze(Object.create(null));
  const ILifecycle = kernel.DI.createInterface('ILifecycle').withDefault(x => x.singleton(Lifecycle));
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
          this.flush = kernel.PLATFORM.noop;
          this.$nextConnect = marker;
          this.connect = kernel.PLATFORM.noop;
          this.$nextPatch = marker;
          this.patch = kernel.PLATFORM.noop;
          this.$nextBound = marker;
          this.bound = kernel.PLATFORM.noop;
          this.$nextMount = marker;
          this.$mount = kernel.PLATFORM.noop;
          this.$nextAttached = marker;
          this.attached = kernel.PLATFORM.noop;
          this.$nextUnmount = marker;
          this.$unmount = kernel.PLATFORM.noop;
          this.$nextDetached = marker;
          this.detached = kernel.PLATFORM.noop;
          this.$nextUnbindAfterDetach = marker;
          this.$unbind = kernel.PLATFORM.noop;
          this.$nextUnbound = marker;
          this.unbound = kernel.PLATFORM.noop;
          this.task = null;
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
              this.flushed = this.promise.then(() => { this.processFlushQueue(exports.LifecycleFlags.fromAsyncFlush); });
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
          flags |= exports.LifecycleFlags.fromSyncFlush;
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
              if (flags & exports.LifecycleFlags.doNotUpdateDOM) {
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
          if (flags & exports.LifecycleFlags.fromStartTask) {
              this.processFlushQueue(flags | exports.LifecycleFlags.fromSyncFlush);
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
          if (flags & exports.LifecycleFlags.fromStartTask) {
              this.processFlushQueue(flags | exports.LifecycleFlags.fromSyncFlush);
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
          this.processFlushQueue(flags | exports.LifecycleFlags.fromSyncFlush);
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
          this.processConnectQueue(exports.LifecycleFlags.mustEvaluate);
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
          this.processFlushQueue(flags | exports.LifecycleFlags.fromFlush | exports.LifecycleFlags.doNotUpdateDOM);
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
          this.onSwapComplete = kernel.PLATFORM.noop;
          this.currentView = null;
          this.isAttached = false;
          this.isBound = false;
          this.queue = null;
          this.swapTask = LifecycleTask.done;
      }
      static register(container) {
          return kernel.Registration.transient(this, this).register(container, this);
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
                  this.swap(next, exports.LifecycleFlags.fromLifecycleTask);
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
              this.owner.processDetachQueue(exports.LifecycleFlags.fromLifecycleTask);
              this.owner.processUnbindQueue(exports.LifecycleFlags.fromLifecycleTask);
              this.owner.processBindQueue(exports.LifecycleFlags.fromLifecycleTask);
              this.owner.processAttachQueue(exports.LifecycleFlags.fromLifecycleTask);
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
          this.coordinator.compose(value, exports.LifecycleFlags.fromLifecycleTask);
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
  function observeProperty(obj, propertyName) {
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
  /** @internal */
  function unobserve(all) {
      const slots = this.observerSlots;
      let slotName;
      let observer;
      if (all === true) {
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
  const { oneTime, toView, fromView } = exports.BindingMode;
  // pre-combining flags for bitwise checks is a minor perf tweak
  const toViewOrOneTime = toView | oneTime;
  exports.Binding = class Binding {
      constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
          this.$nextBind = null;
          this.$prevBind = null;
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
      }
      updateTarget(value, flags) {
          flags |= this.persistentFlags;
          this.targetObserver.setValue(value, flags | exports.LifecycleFlags.updateTargetInstance);
      }
      updateSource(value, flags) {
          flags |= this.persistentFlags;
          this.sourceExpression.assign(flags | exports.LifecycleFlags.updateSourceExpression, this.$scope, this.locator, value);
      }
      handleChange(newValue, _previousValue, flags) {
          if (!(this.$state & 2 /* isBound */)) {
              return;
          }
          const sourceExpression = this.sourceExpression;
          const $scope = this.$scope;
          const locator = this.locator;
          flags |= this.persistentFlags;
          if (this.mode === exports.BindingMode.fromView) {
              flags &= ~exports.LifecycleFlags.updateTargetInstance;
              flags |= exports.LifecycleFlags.updateSourceExpression;
          }
          if (flags & exports.LifecycleFlags.updateTargetInstance) {
              const targetObserver = this.targetObserver;
              const mode = this.mode;
              const previousValue = targetObserver.getValue();
              // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
              if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                  newValue = sourceExpression.evaluate(flags, $scope, locator);
              }
              if (newValue !== previousValue) {
                  this.updateTarget(newValue, flags);
              }
              if ((mode & oneTime) === 0) {
                  this.version++;
                  sourceExpression.connect(flags, $scope, this);
                  this.unobserve(false);
              }
              return;
          }
          if (flags & exports.LifecycleFlags.updateSourceExpression) {
              if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
                  this.updateSource(newValue, flags);
              }
              return;
          }
          throw kernel.Reporter.error(15, exports.LifecycleFlags[flags]);
      }
      $bind(flags, scope) {
          if (this.$state & 2 /* isBound */) {
              if (this.$scope === scope) {
                  return;
              }
              this.$unbind(flags | exports.LifecycleFlags.fromBind);
          }
          // add isBinding flag
          this.$state |= 1 /* isBinding */;
          // Store flags which we can only receive during $bind and need to pass on
          // to the AST during evaluate/connect/assign
          this.persistentFlags = flags & exports.LifecycleFlags.persistentBindingFlags;
          this.$scope = scope;
          let sourceExpression = this.sourceExpression;
          if (hasBind(sourceExpression)) {
              sourceExpression.bind(flags, scope, this);
          }
          const mode = this.mode;
          let targetObserver = this.targetObserver;
          if (!targetObserver) {
              if (mode & fromView) {
                  targetObserver = this.targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty);
              }
              else {
                  targetObserver = this.targetObserver = this.observerLocator.getAccessor(this.target, this.targetProperty);
              }
          }
          if (targetObserver.bind) {
              targetObserver.bind(flags);
          }
          // during bind, binding behavior might have changed sourceExpression
          sourceExpression = this.sourceExpression;
          if (mode & toViewOrOneTime) {
              this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator), flags);
          }
          if (mode & toView) {
              this.$lifecycle.enqueueConnect(this);
          }
          if (mode & fromView) {
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
          this.persistentFlags = exports.LifecycleFlags.none;
          const sourceExpression = this.sourceExpression;
          if (hasUnbind(sourceExpression)) {
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
          // remove isBound and isUnbinding flags
          this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
      }
      connect(flags) {
          if (this.$state & 2 /* isBound */) {
              flags |= this.persistentFlags;
              this.sourceExpression.connect(flags | exports.LifecycleFlags.mustEvaluate, this.$scope, this);
          }
      }
      patch(flags) {
          if (this.$state & 2 /* isBound */) {
              flags |= this.persistentFlags;
              this.updateTarget(this.sourceExpression.evaluate(flags | exports.LifecycleFlags.mustEvaluate, this.$scope, this.locator), flags);
          }
      }
  };
  exports.Binding = __decorate([
      connectable()
  ], exports.Binding);

  class Call {
      constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
          this.$nextBind = null;
          this.$prevBind = null;
          this.$state = 0 /* none */;
          this.locator = locator;
          this.sourceExpression = sourceExpression;
          this.targetObserver = observerLocator.getObserver(target, targetProperty);
      }
      callSource(args) {
          const overrideContext = this.$scope.overrideContext;
          Object.assign(overrideContext, args);
          const result = this.sourceExpression.evaluate(exports.LifecycleFlags.mustEvaluate, this.$scope, this.locator);
          for (const prop in args) {
              // tslint:disable-next-line:no-dynamic-delete
              delete overrideContext[prop];
          }
          return result;
      }
      $bind(flags, scope) {
          if (this.$state & 2 /* isBound */) {
              if (this.$scope === scope) {
                  return;
              }
              this.$unbind(flags | exports.LifecycleFlags.fromBind);
          }
          // add isBinding flag
          this.$state |= 1 /* isBinding */;
          this.$scope = scope;
          const sourceExpression = this.sourceExpression;
          if (hasBind(sourceExpression)) {
              sourceExpression.bind(flags, scope, this);
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
          const sourceExpression = this.sourceExpression;
          if (hasUnbind(sourceExpression)) {
              sourceExpression.unbind(flags, this.$scope, this);
          }
          this.$scope = null;
          this.targetObserver.setValue(null, flags);
          // remove isBound and isUnbinding flags
          this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
      }
      observeProperty(obj, propertyName) {
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
                  case 55 /* ForOfStatement */:
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
          this.$nextBind = null;
          this.$prevBind = null;
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
              parts[i] = new exports.InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
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
  exports.InterpolationBinding = class InterpolationBinding {
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
          this.targetObserver = observerLocator.getAccessor(target, targetProperty);
      }
      updateTarget(value, flags) {
          this.targetObserver.setValue(value, flags | exports.LifecycleFlags.updateTargetInstance);
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
  exports.InterpolationBinding = __decorate([
      connectable()
  ], exports.InterpolationBinding);

  exports.LetBinding = class LetBinding {
      constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
          this.$nextBind = null;
          this.$prevBind = null;
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
          if (flags & exports.LifecycleFlags.updateTargetInstance) {
              const { target, targetProperty } = this;
              const previousValue = target[targetProperty];
              const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
              if (newValue !== previousValue) {
                  target[targetProperty] = newValue;
              }
              return;
          }
          throw kernel.Reporter.error(15, flags);
      }
      $bind(flags, scope) {
          if (this.$state & 2 /* isBound */) {
              if (this.$scope === scope) {
                  return;
              }
              this.$unbind(flags | exports.LifecycleFlags.fromBind);
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
          this.target[this.targetProperty] = this.sourceExpression.evaluate(exports.LifecycleFlags.fromBind, scope, this.locator);
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
  exports.LetBinding = __decorate([
      connectable()
  ], exports.LetBinding);

  class Ref {
      constructor(sourceExpression, target, locator) {
          this.$nextBind = null;
          this.$prevBind = null;
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
              this.$unbind(flags | exports.LifecycleFlags.fromBind);
          }
          // add isBinding flag
          this.$state |= 1 /* isBinding */;
          this.$scope = scope;
          const sourceExpression = this.sourceExpression;
          if (hasBind(sourceExpression)) {
              sourceExpression.bind(flags, scope, this);
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
      observeProperty(obj, propertyName) {
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
          if ((flags & (exports.LifecycleFlags.fromFlush | exports.LifecycleFlags.fromBind)) &&
              !(this.isDOMObserver && (flags & exports.LifecycleFlags.doNotUpdateDOM))) {
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
      if (this.isDOMObserver && (flags & exports.LifecycleFlags.doNotUpdateDOM)) {
          // re-queue the change so it will still propagate on flush when it's attached again
          this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
          return;
      }
      const currentValue = this.currentValue;
      // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
      // in which case the target doesn't need to be updated
      if (this.oldValue !== currentValue) {
          this.setValueCore(currentValue, this.currentFlags | flags | exports.LifecycleFlags.updateTargetInstance);
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
      return function (target) {
          subscriberCollection(exports.MutationKind.instance)(target);
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

  function flush$1() {
      this.callBatchedSubscribers(this.indexMap);
      if (!!this.lengthObserver) {
          this.lengthObserver.patch(exports.LifecycleFlags.fromFlush | exports.LifecycleFlags.updateTargetInstance);
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
      return this.lengthObserver === undefined ? (this.lengthObserver = new exports.CollectionLengthObserver(this, this.lengthPropertyName)) : this.lengthObserver;
  }
  function collectionObserver(kind) {
      return function (target) {
          subscriberCollection(exports.MutationKind.collection)(target);
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
  exports.CollectionLengthObserver = __decorate([
      targetObserver()
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
          const o = this.$observer;
          if (o === undefined) {
              return $push.apply(this, arguments);
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
          o.callSubscribers('push', arguments, exports.LifecycleFlags.isCollectionMutation);
          return this.length;
      },
      // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
      unshift: function () {
          const o = this.$observer;
          if (o === undefined) {
              return $unshift.apply(this, arguments);
          }
          const argCount = arguments.length;
          const inserts = new Array(argCount);
          let i = 0;
          while (i < argCount) {
              inserts[i++] = -2;
          }
          $unshift.apply(o.indexMap, inserts);
          const len = $unshift.apply(this, arguments);
          o.callSubscribers('unshift', arguments, exports.LifecycleFlags.isCollectionMutation);
          return len;
      },
      // https://tc39.github.io/ecma262/#sec-array.prototype.pop
      pop: function () {
          const o = this.$observer;
          if (o === undefined) {
              return $pop.call(this);
          }
          const indexMap = o.indexMap;
          const element = $pop.call(this);
          // only mark indices as deleted if they actually existed in the original array
          const index = indexMap.length - 1;
          if (indexMap[index] > -1) {
              $pop.call(indexMap.deletedItems, element);
          }
          $pop.call(indexMap);
          o.callSubscribers('pop', arguments, exports.LifecycleFlags.isCollectionMutation);
          return element;
      },
      // https://tc39.github.io/ecma262/#sec-array.prototype.shift
      shift: function () {
          const o = this.$observer;
          if (o === undefined) {
              return $shift.call(this);
          }
          const indexMap = o.indexMap;
          const element = $shift.call(this);
          // only mark indices as deleted if they actually existed in the original array
          if (indexMap[0] > -1) {
              $shift.call(indexMap.deletedItems, element);
          }
          $shift.call(indexMap);
          o.callSubscribers('shift', arguments, exports.LifecycleFlags.isCollectionMutation);
          return element;
      },
      // https://tc39.github.io/ecma262/#sec-array.prototype.splice
      splice: function (start, deleteCount) {
          const o = this.$observer;
          if (o === undefined) {
              return $splice.apply(this, arguments);
          }
          const indexMap = o.indexMap;
          if (deleteCount > 0) {
              let i = isNaN(start) ? 0 : start;
              const to = i + deleteCount;
              while (i < to) {
                  if (indexMap[i] > -1) {
                      $splice.call(indexMap.deletedItems, this[i]);
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
          const deleted = $splice.apply(this, arguments);
          o.callSubscribers('splice', arguments, exports.LifecycleFlags.isCollectionMutation);
          return deleted;
      },
      // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
      reverse: function () {
          const o = this.$observer;
          if (o === undefined) {
              return $reverse.call(this);
          }
          const len = this.length;
          const middle = (len / 2) | 0;
          let lower = 0;
          // tslint:disable:no-statements-same-line
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
          // tslint:enable:no-statements-same-line
          o.callSubscribers('reverse', arguments, exports.LifecycleFlags.isCollectionMutation);
          return this;
      },
      // https://tc39.github.io/ecma262/#sec-array.prototype.sort
      // https://github.com/v8/v8/blob/master/src/js/array.js
      sort: function (compareFn) {
          const o = this.$observer;
          if (o === undefined) {
              return $sort.call(this, compareFn);
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
          o.callSubscribers('sort', arguments, exports.LifecycleFlags.isCollectionMutation);
          return this;
      }
  };
  const descriptorProps = {
      writable: true,
      enumerable: false,
      configurable: true
  };
  const def = Object.defineProperty;
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
  exports.ArrayObserver = class ArrayObserver {
      constructor(lifecycle, array) {
          this.lifecycle = lifecycle;
          array.$observer = this;
          this.collection = array;
          this.resetIndexMap();
      }
  };
  exports.ArrayObserver = __decorate([
      collectionObserver(9 /* array */)
  ], exports.ArrayObserver);
  function getArrayObserver(lifecycle, array) {
      return array.$observer || new exports.ArrayObserver(lifecycle, array);
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
          const o = this.$observer;
          if (o === undefined) {
              return $set.call(this, key, value);
          }
          const oldSize = this.size;
          $set.call(this, key, value);
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
          o.callSubscribers('set', arguments, exports.LifecycleFlags.isCollectionMutation);
          return this;
      },
      // https://tc39.github.io/ecma262/#sec-map.prototype.clear
      clear: function () {
          const o = this.$observer;
          if (o === undefined) {
              return $clear.call(this);
          }
          const size = this.size;
          if (size > 0) {
              const indexMap = o.indexMap;
              let i = 0;
              for (const entry of this.keys()) {
                  if (indexMap[i] > -1) {
                      indexMap.deletedItems.push(entry);
                  }
                  i++;
              }
              $clear.call(this);
              indexMap.length = 0;
              o.callSubscribers('clear', arguments, exports.LifecycleFlags.isCollectionMutation);
          }
          return undefined;
      },
      // https://tc39.github.io/ecma262/#sec-map.prototype.delete
      delete: function (value) {
          const o = this.$observer;
          if (o === undefined) {
              return $delete.call(this, value);
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
                      indexMap.deletedItems.push(entry);
                  }
                  indexMap.splice(i, 1);
                  return $delete.call(this, value);
              }
              i++;
          }
          o.callSubscribers('delete', arguments, exports.LifecycleFlags.isCollectionMutation);
          return false;
      }
  };
  const descriptorProps$1 = {
      writable: true,
      enumerable: false,
      configurable: true
  };
  const def$1 = Object.defineProperty;
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
  exports.MapObserver = class MapObserver {
      constructor(lifecycle, map) {
          this.lifecycle = lifecycle;
          map.$observer = this;
          this.collection = map;
          this.resetIndexMap();
      }
  };
  exports.MapObserver = __decorate([
      collectionObserver(6 /* map */)
  ], exports.MapObserver);
  function getMapObserver(lifecycle, map) {
      return map.$observer || new exports.MapObserver(lifecycle, map);
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
          const o = this.$observer;
          if (o === undefined) {
              return $add.call(this, value);
          }
          const oldSize = this.size;
          $add.call(this, value);
          const newSize = this.size;
          if (newSize === oldSize) {
              return this;
          }
          o.indexMap[oldSize] = -2;
          o.callSubscribers('add', arguments, exports.LifecycleFlags.isCollectionMutation);
          return this;
      },
      // https://tc39.github.io/ecma262/#sec-set.prototype.clear
      clear: function () {
          const o = this.$observer;
          if (o === undefined) {
              return $clear$1.call(this);
          }
          const size = this.size;
          if (size > 0) {
              const indexMap = o.indexMap;
              let i = 0;
              for (const entry of this.keys()) {
                  if (indexMap[i] > -1) {
                      indexMap.deletedItems.push(entry);
                  }
                  i++;
              }
              $clear$1.call(this);
              indexMap.length = 0;
              o.callSubscribers('clear', arguments, exports.LifecycleFlags.isCollectionMutation);
          }
          return undefined;
      },
      // https://tc39.github.io/ecma262/#sec-set.prototype.delete
      delete: function (value) {
          const o = this.$observer;
          if (o === undefined) {
              return $delete$1.call(this, value);
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
                      indexMap.deletedItems.push(entry);
                  }
                  indexMap.splice(i, 1);
                  return $delete$1.call(this, value);
              }
              i++;
          }
          o.callSubscribers('delete', arguments, exports.LifecycleFlags.isCollectionMutation);
          return false;
      }
  };
  const descriptorProps$2 = {
      writable: true,
      enumerable: false,
      configurable: true
  };
  const def$2 = Object.defineProperty;
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
  exports.SetObserver = class SetObserver {
      constructor(lifecycle, observedSet) {
          this.lifecycle = lifecycle;
          observedSet.$observer = this;
          this.collection = observedSet;
          this.resetIndexMap();
      }
  };
  exports.SetObserver = __decorate([
      collectionObserver(7 /* set */)
  ], exports.SetObserver);
  function getSetObserver(lifecycle, observedSet) {
      return observedSet.$observer || new exports.SetObserver(lifecycle, observedSet);
  }

  function computed(config) {
      return function (target, key) {
          (target.computed || (target.computed = {}))[key] = config;
      };
  }
  // tslint:disable-next-line:no-typeof-undefined
  const noProxy = typeof Proxy === 'undefined';
  const computedOverrideDefaults = { static: false, volatile: false };
  /* @internal */
  function createComputedObserver(observerLocator, dirtyChecker, lifecycle, instance, propertyName, descriptor) {
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
                      : new exports.GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
              }
              return new exports.CustomSetterObserver(instance, propertyName, descriptor, lifecycle);
          }
          return noProxy
              ? dirtyChecker.createProperty(instance, propertyName)
              : new exports.GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
      }
      throw kernel.Reporter.error(18, propertyName);
  }
  // Used when the getter is dependent solely on changes that happen within the setter.
  exports.CustomSetterObserver = class CustomSetterObserver {
      constructor(obj, propertyKey, descriptor, lifecycle) {
          this.$nextFlush = null;
          this.obj = obj;
          this.observing = false;
          this.propertyKey = propertyKey;
          this.descriptor = descriptor;
          this.lifecycle = lifecycle;
      }
      getValue() {
          return this.obj[this.propertyKey];
      }
      setValue(newValue) {
          this.obj[this.propertyKey] = newValue;
      }
      flush(flags) {
          const oldValue = this.oldValue;
          const newValue = this.currentValue;
          this.callSubscribers(newValue, oldValue, flags | exports.LifecycleFlags.updateTargetInstance);
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
          const that = this;
          this.observing = true;
          this.currentValue = this.obj[this.propertyKey];
          Reflect.defineProperty(this.obj, this.propertyKey, {
              set: function (newValue) {
                  setter.call(that.obj, newValue);
                  const oldValue = that.currentValue;
                  if (oldValue !== newValue) {
                      that.oldValue = oldValue;
                      that.lifecycle.enqueueFlush(that).catch(error => { throw error; });
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
  /** @internal */
  exports.GetterObserver = class GetterObserver {
      constructor(overrides, obj, propertyKey, descriptor, observerLocator, lifecycle) {
          this.obj = obj;
          this.propertyKey = propertyKey;
          this.controller = new GetterController(overrides, obj, propertyKey, descriptor, this, observerLocator, lifecycle);
      }
      getValue() {
          return this.controller.value;
      }
      setValue(newValue) {
          return;
      }
      flush(flags) {
          const oldValue = this.controller.value;
          const newValue = this.controller.getValueAndCollectDependencies();
          if (oldValue !== newValue) {
              this.callSubscribers(newValue, oldValue, flags | exports.LifecycleFlags.updateTargetInstance);
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
  /** @internal */
  class GetterController {
      constructor(overrides, instance, propertyName, descriptor, owner, observerLocator, lifecycle) {
          this.isCollecting = false;
          this.dependencies = [];
          this.instance = instance;
          this.lifecycle = lifecycle;
          this.overrides = overrides;
          this.owner = owner;
          this.propertyName = propertyName;
          this.subscriberCount = 0;
          const proxy = new Proxy(instance, createGetterTraps(observerLocator, this));
          const getter = descriptor.get;
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
              this.dependencies.forEach(x => { x.subscribe(this); });
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
          this.lifecycle.enqueueFlush(this.owner).catch(error => { throw error; });
      }
      unsubscribeAllDependencies() {
          this.dependencies.forEach(x => { x.unsubscribe(this); });
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

  const IDirtyChecker = kernel.DI.createInterface('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));
  /** @internal */
  class DirtyChecker {
      constructor() {
          this.checkDelay = 120;
          this.tracked = [];
      }
      createProperty(obj, propertyName) {
          return new DirtyCheckProperty(this, obj, propertyName);
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
          kernel.PLATFORM.global.setTimeout(() => { this.check(); }, this.checkDelay);
      }
      check() {
          const tracked = this.tracked;
          let i = tracked.length;
          while (i--) {
              const current = tracked[i];
              if (current.isDirty()) {
                  current.flush(exports.LifecycleFlags.fromFlush);
              }
          }
          if (tracked.length) {
              this.scheduleDirtyCheck();
          }
      }
  }
  /** @internal */
  let DirtyCheckProperty = class DirtyCheckProperty {
      constructor(dirtyChecker, obj, propertyKey) {
          this.obj = obj;
          this.propertyKey = propertyKey;
          this.dirtyChecker = dirtyChecker;
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
      flush(flags) {
          const oldValue = this.oldValue;
          const newValue = this.getValue();
          this.callSubscribers(newValue, oldValue, flags | exports.LifecycleFlags.updateTargetInstance);
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
  DirtyCheckProperty = __decorate([
      propertyObserver()
  ], DirtyCheckProperty);

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

  const toStringTag$1 = Object.prototype.toString;
  const IObserverLocator = kernel.DI.createInterface('IObserverLocator').noDefault();
  const ITargetObserverLocator = kernel.DI.createInterface('ITargetObserverLocator').noDefault();
  const ITargetAccessorLocator = kernel.DI.createInterface('ITargetAccessorLocator').noDefault();
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
      getObserver(obj, propertyName) {
          if (isBindingContext(obj)) {
              return obj.getObservers().getOrCreate(obj, propertyName);
          }
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
          if (this.targetAccessorLocator.handles(obj)) {
              if (this.targetObserverLocator.overridesAccessor(obj, propertyName)) {
                  return this.getObserver(obj, propertyName);
              }
              return this.targetAccessorLocator.getAccessor(this.lifecycle, obj, propertyName);
          }
          return new PropertyAccessor(obj, propertyName);
      }
      getArrayObserver(observedArray) {
          return getArrayObserver(this.lifecycle, observedArray);
      }
      getMapObserver(observedMap) {
          return getMapObserver(this.lifecycle, observedMap);
      }
      getSetObserver(observedSet) {
          return getSetObserver(this.lifecycle, observedSet);
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
          let isNode = false;
          if (this.targetObserverLocator.handles(obj)) {
              const observer = this.targetObserverLocator.getObserver(this.lifecycle, this, obj, propertyName);
              if (observer !== null) {
                  return observer;
              }
              if (observer !== null) {
                  return observer;
              }
              isNode = true;
          }
          const tag = toStringTag$1.call(obj);
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
          if (descriptor && (descriptor.get || descriptor.set)) {
              if (descriptor.get && descriptor.get.getObserver) {
                  return descriptor.get.getObserver(obj);
              }
              // attempt to use an adapter before resorting to dirty checking.
              const adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
              if (adapterObserver) {
                  return adapterObserver;
              }
              if (isNode) {
                  // TODO: use MutationObserver
                  return this.dirtyChecker.createProperty(obj, propertyName);
              }
              return createComputedObserver(this, this.dirtyChecker, this.lifecycle, obj, propertyName, descriptor);
          }
          return new exports.SetterObserver(obj, propertyName);
      }
  }
  ObserverLocator.inject = [ILifecycle, IDirtyChecker, ITargetObserverLocator, ITargetAccessorLocator];
  function getCollectionObserver(lifecycle, collection) {
      switch (toStringTag$1.call(collection)) {
          case '[object Array]':
              return getArrayObserver(lifecycle, collection);
          case '[object Map]':
              return getMapObserver(lifecycle, collection);
          case '[object Set]':
              return getSetObserver(lifecycle, collection);
      }
      return null;
  }
  function isBindingContext(obj) {
      return obj.$synthetic === true;
  }

  const noop$1 = kernel.PLATFORM.noop;
  exports.SelfObserver = class SelfObserver {
      constructor(instance, propertyName, callbackName) {
          this.obj = instance;
          this.propertyKey = propertyName;
          this.currentValue = instance[propertyName];
          this.callback = callbackName in instance
              ? instance[callbackName].bind(instance)
              : noop$1;
      }
      getValue() {
          return this.currentValue;
      }
      setValue(newValue, flags) {
          const currentValue = this.currentValue;
          if (currentValue !== newValue) {
              this.currentValue = newValue;
              if (!(flags & exports.LifecycleFlags.fromBind)) {
                  const coercedValue = this.callback(newValue, currentValue);
                  if (coercedValue !== undefined) {
                      this.currentValue = newValue = coercedValue;
                  }
                  this.callSubscribers(newValue, currentValue, flags);
              }
          }
      }
  };
  exports.SelfObserver = __decorate([
      propertyObserver()
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
              callContextToDebounce = binding.mode & fromView$2 ? exports.LifecycleFlags.updateSourceExpression : exports.LifecycleFlags.updateTargetInstance;
          }
          else {
              methodToDebounce = 'callSource';
              debouncer = debounceCallSource;
              callContextToDebounce = exports.LifecycleFlags.updateTargetInstance;
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
  function buildTemplateDefinition(ctor, nameOrDef, template, cache, build, bindables, instructions, dependencies, surrogates, containerless, shadowOptions, hasSlots) {
      const def = new DefaultTemplateDefinition();
      // all cases fall through intentionally
      const argLen = arguments.length;
      switch (argLen) {
          case 12: if (hasSlots !== null)
              def.hasSlots = hasSlots;
          case 11: if (shadowOptions !== null)
              def.shadowOptions = shadowOptions;
          case 10: if (containerless !== null)
              def.containerless = containerless;
          case 9: if (surrogates !== null)
              def.surrogates = kernel.PLATFORM.toArray(surrogates);
          case 8: if (dependencies !== null)
              def.dependencies = kernel.PLATFORM.toArray(dependencies);
          case 7: if (instructions !== null)
              def.instructions = kernel.PLATFORM.toArray(instructions);
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
                          def[prop] = kernel.PLATFORM.toArray(nameOrDef[prop]);
                      }
                  });
                  if (nameOrDef['bindables']) {
                      if (def.bindables === kernel.PLATFORM.emptyObject) {
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
      flags |= exports.LifecycleFlags.fromAttach;
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
      flags |= exports.LifecycleFlags.fromAttach;
      const hooks = this.$hooks;
      if (hooks & 16 /* hasAttaching */) {
          this.attaching(flags);
      }
      let current = this.$attachableHead;
      while (current !== null) {
          current.$attach(flags);
          current = current.$nextAttach;
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
      flags |= exports.LifecycleFlags.fromAttach;
      let current = this.$attachableHead;
      while (current !== null) {
          current.$attach(flags);
          current = current.$nextAttach;
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
          flags |= exports.LifecycleFlags.fromDetach;
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
          flags |= exports.LifecycleFlags.fromDetach;
          // Only unmount if either:
          // - No parent view/element is queued for unmount yet, or
          // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
          if (((flags & exports.LifecycleFlags.parentUnmountQueued) ^ exports.LifecycleFlags.parentUnmountQueued) | (flags & exports.LifecycleFlags.fromStopTask)) {
              lifecycle.enqueueUnmount(this);
              flags |= exports.LifecycleFlags.parentUnmountQueued;
          }
          const hooks = this.$hooks;
          if (hooks & 64 /* hasDetaching */) {
              this.detaching(flags);
          }
          let current = this.$attachableTail;
          while (current !== null) {
              current.$detach(flags);
              current = current.$prevAttach;
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
          flags |= exports.LifecycleFlags.fromDetach;
          // Only unmount if either:
          // - No parent view/element is queued for unmount yet, or
          // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
          if (((flags & exports.LifecycleFlags.parentUnmountQueued) ^ exports.LifecycleFlags.parentUnmountQueued) | (flags & exports.LifecycleFlags.fromStopTask)) {
              this.$lifecycle.enqueueUnmount(this);
              flags |= exports.LifecycleFlags.parentUnmountQueued;
          }
          let current = this.$attachableTail;
          while (current !== null) {
              current.$detach(flags);
              current = current.$prevAttach;
          }
          // remove isAttached and isDetaching flags
          this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
      }
  }
  /** @internal */
  function $cacheAttribute(flags) {
      flags |= exports.LifecycleFlags.fromCache;
      if (this.$hooks & 2048 /* hasCaching */) {
          this.caching(flags);
      }
  }
  /** @internal */
  function $cacheElement(flags) {
      flags |= exports.LifecycleFlags.fromCache;
      if (this.$hooks & 2048 /* hasCaching */) {
          this.caching(flags);
      }
      let current = this.$attachableTail;
      while (current !== null) {
          current.$cache(flags);
          current = current.$prevAttach;
      }
  }
  /** @internal */
  function $cacheView(flags) {
      flags |= exports.LifecycleFlags.fromCache;
      let current = this.$attachableTail;
      while (current !== null) {
          current.$cache(flags);
          current = current.$prevAttach;
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

  /** @internal */
  function $bindAttribute(flags, scope) {
      flags |= exports.LifecycleFlags.fromBind;
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
      flags |= exports.LifecycleFlags.fromBind;
      if (hooks & 8 /* hasBound */) {
          lifecycle.enqueueBound(this);
      }
      if (hooks & 4 /* hasBinding */) {
          this.binding(flags);
      }
      let current = this.$bindableHead;
      while (current !== null) {
          current.$bind(flags, scope);
          current = current.$nextBind;
      }
      // add isBound flag and remove isBinding flag
      this.$state |= 2 /* isBound */;
      this.$state &= ~1 /* isBinding */;
      lifecycle.endBind(flags);
  }
  /** @internal */
  function $bindView(flags, scope) {
      flags |= exports.LifecycleFlags.fromBind;
      if (this.$state & 2 /* isBound */) {
          if (this.$scope === scope) {
              return;
          }
          this.$unbind(flags);
      }
      // add isBinding flag
      this.$state |= 1 /* isBinding */;
      this.$scope = scope;
      let current = this.$bindableHead;
      while (current !== null) {
          current.$bind(flags, scope);
          current = current.$nextBind;
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
          flags |= exports.LifecycleFlags.fromUnbind;
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
          flags |= exports.LifecycleFlags.fromUnbind;
          if (hooks & 512 /* hasUnbound */) {
              lifecycle.enqueueUnbound(this);
          }
          if (hooks & 256 /* hasUnbinding */) {
              this.unbinding(flags);
          }
          let current = this.$bindableTail;
          while (current !== null) {
              current.$unbind(flags);
              current = current.$prevBind;
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
          flags |= exports.LifecycleFlags.fromUnbind;
          let current = this.$bindableTail;
          while (current !== null) {
              current.$unbind(flags);
              current = current.$prevBind;
          }
          // remove isBound and isUnbinding flags
          this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
          this.$scope = null;
      }
  }

  /** @internal */
  function $hydrateAttribute(renderingEngine) {
      const Type = this.constructor;
      renderingEngine.applyRuntimeBehavior(Type, this);
      if (this.$hooks & 2 /* hasCreated */) {
          this.created();
      }
  }
  /** @internal */
  function $hydrateElement(dom, projectorLocator, renderingEngine, host, parentContext, options = kernel.PLATFORM.emptyObject) {
      const Type = this.constructor;
      const description = Type.description;
      this.$scope = Scope.create(this, null);
      this.$host = host;
      this.$projector = projectorLocator.getElementProjector(dom, this, host, description);
      renderingEngine.applyRuntimeBehavior(Type, this);
      if (this.$hooks & 1024 /* hasRender */) {
          const result = this.render(host, options.parts, parentContext);
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
          this.created();
      }
  }

  /** @internal */
  function registerAttribute(container) {
      const description = this.description;
      const resourceKey = this.kind.keyFrom(description.name);
      const aliases = description.aliases;
      container.register(kernel.Registration.transient(resourceKey, this));
      for (let i = 0, ii = aliases.length; i < ii; ++i) {
          const aliasKey = this.kind.keyFrom(aliases[i]);
          container.register(kernel.Registration.alias(resourceKey, aliasKey));
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
  function isType$2(Type) {
      return Type.kind === this;
  }
  function define$2(nameOrDefinition, ctor) {
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
      proto.$prevBind = null;
      proto.$nextBind = null;
      proto.$prevAttach = null;
      proto.$nextAttach = null;
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
      isType: isType$2,
      define: define$2
  };
  /** @internal */
  function createCustomAttributeDescription(def, Type) {
      const aliases = def.aliases;
      const defaultBindingMode = def.defaultBindingMode;
      return {
          name: def.name,
          aliases: aliases === undefined || aliases === null ? kernel.PLATFORM.emptyArray : aliases,
          defaultBindingMode: defaultBindingMode === undefined || defaultBindingMode === null ? exports.BindingMode.toView : defaultBindingMode,
          hasDynamicOptions: def.hasDynamicOptions === undefined ? false : def.hasDynamicOptions,
          isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
          bindables: Object.assign({}, Type.bindables, def.bindables)
      };
  }

  const INode = kernel.DI.createInterface('INode').noDefault();
  const IRenderLocation = kernel.DI.createInterface('IRenderLocation').noDefault();
  const IDOM = kernel.DI.createInterface('IDOM').noDefault();
  // This is an implementation of INodeSequence that represents "no DOM" to render.
  // It's used in various places to avoid null and to encode
  // the explicit idea of "no view".
  const emptySequence = {
      childNodes: kernel.PLATFORM.emptyArray,
      firstChild: null,
      lastChild: null,
      findTargets() { return kernel.PLATFORM.emptyArray; },
      insertBefore(refNode) { },
      appendTo(parent) { },
      remove() { }
  };
  const NodeSequence = {
      empty: emptySequence
  };

  function bindable(configOrTarget, prop) {
      let config;
      const decorator = function decorate($target, $prop) {
          const Type = $target.constructor;
          let bindables = Type.bindables;
          if (bindables === undefined) {
              bindables = Type.bindables = {};
          }
          if (!config.attribute) {
              config.attribute = kernel.PLATFORM.kebabCase($prop);
          }
          if (!config.callback) {
              config.callback = `${$prop}Changed`;
          }
          if (config.mode === undefined) {
              config.mode = exports.BindingMode.toView;
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
          if (flags & exports.LifecycleFlags.fromFlush) {
              const view = this.updateView(flags);
              this.coordinator.compose(view, flags);
          }
          else {
              this.$lifecycle.enqueueFlush(this).catch(error => { throw error; });
          }
      }
      flush(flags) {
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
              view = factory.create();
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
      }
      binding(flags) {
          this.checkCollectionObserver();
      }
      bound(flags) {
          let current = this.renderable.$bindableHead;
          while (current !== null) {
              if (current.target === this && current.targetProperty === 'items') {
                  this.forOf = current.sourceExpression;
                  break;
              }
              current = current.$nextBind;
          }
          this.local = this.forOf.declaration.evaluate(flags, this.$scope, null);
          this.processViews(null, flags);
      }
      attaching(flags) {
          const { views, location } = this;
          for (let i = 0, ii = views.length; i < ii; ++i) {
              const view = views[i];
              view.hold(location);
              view.$attach(flags);
          }
      }
      detaching(flags) {
          const { views } = this;
          for (let i = 0, ii = views.length; i < ii; ++i) {
              const view = views[i];
              view.$detach(flags);
              view.release(flags);
          }
      }
      unbound(flags) {
          this.checkCollectionObserver();
          const { views } = this;
          for (let i = 0, ii = views.length; i < ii; ++i) {
              const view = views[i];
              view.$unbind(flags);
          }
      }
      // called by SetterObserver (sync)
      itemsChanged(newValue, oldValue, flags) {
          this.checkCollectionObserver();
          this.processViews(null, flags | exports.LifecycleFlags.updateTargetInstance);
      }
      // called by a CollectionObserver (async)
      handleBatchedChange(indexMap) {
          this.processViews(indexMap, exports.LifecycleFlags.fromFlush | exports.LifecycleFlags.updateTargetInstance);
      }
      // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
      // TODO: Reduce complexity (currently at 46)
      processViews(indexMap, flags) {
          const { views, $lifecycle } = this;
          if (this.$state & 2 /* isBound */) {
              const { local, $scope, factory, forOf, items } = this;
              const oldLength = views.length;
              const newLength = forOf.count(items);
              if (oldLength < newLength) {
                  views.length = newLength;
                  for (let i = oldLength; i < newLength; ++i) {
                      views[i] = factory.create();
                  }
              }
              else if (newLength < oldLength) {
                  $lifecycle.beginDetach();
                  for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
                      view.release(flags);
                      view.$detach(flags);
                  }
                  $lifecycle.endDetach(flags);
                  $lifecycle.beginUnbind();
                  for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
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
                      const view = views[i];
                      if (!!view.$scope && view.$scope.bindingContext[local] === item) {
                          view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
                      }
                      else {
                          view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
                      }
                  });
              }
              else {
                  forOf.iterate(items, (arr, i, item) => {
                      const view = views[i];
                      if (!!view.$scope && (indexMap[i] === i || view.$scope.bindingContext[local] === item)) {
                          view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
                      }
                      else {
                          view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
                      }
                  });
              }
              $lifecycle.endBind(flags);
          }
          if (this.$state & 8 /* isAttached */) {
              const { location } = this;
              $lifecycle.beginAttach();
              if (indexMap === null) {
                  for (let i = 0, ii = views.length; i < ii; ++i) {
                      const view = views[i];
                      view.hold(location);
                      view.$attach(flags);
                  }
              }
              else {
                  for (let i = 0, ii = views.length; i < ii; ++i) {
                      if (indexMap[i] !== i) {
                          const view = views[i];
                          view.hold(location);
                          view.$attach(flags);
                      }
                  }
              }
              $lifecycle.endAttach(flags);
          }
      }
      checkCollectionObserver() {
          const oldObserver = this.observer;
          if (this.$state & (2 /* isBound */ | 1 /* isBinding */)) {
              const newObserver = this.observer = getCollectionObserver(this.$lifecycle, this.items);
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

  class Replaceable {
      constructor(factory, location) {
          this.factory = factory;
          this.currentView = this.factory.create();
          this.currentView.hold(location);
      }
      binding(flags) {
          this.currentView.$bind(flags | exports.LifecycleFlags.allowParentScopeTraversal, this.$scope);
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
          if (this.$state & 2 /* isBound */) {
              this.bindChild(exports.LifecycleFlags.fromBindableHandler);
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
          const scope = Scope.fromParent(this.$scope, this.value);
          this.currentView.$bind(flags, scope);
      }
  }
  With.inject = [IViewFactory, IRenderLocation];
  __decorate([
      bindable
  ], With.prototype, "value", void 0);
  CustomAttributeResource.define({ name: 'with', isTemplateController: true }, With);

  const IProjectorLocator = kernel.DI.createInterface('IProjectorLocator').noDefault();
  /** @internal */
  function registerElement(container) {
      const resourceKey = this.kind.keyFrom(this.description.name);
      container.register(kernel.Registration.transient(resourceKey, this));
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
      proto.$prevBind = null;
      proto.$nextBind = null;
      proto.$prevAttach = null;
      proto.$nextAttach = null;
      proto.$nextUnbindAfterDetach = null;
      proto.$scope = null;
      proto.$hooks = 0;
      proto.$bindableHead = null;
      proto.$bindableTail = null;
      proto.$attachableHead = null;
      proto.$attachableTail = null;
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
          if (untrustedMarkup === null || untrustedMarkup === undefined) {
              return null;
          }
          return this.sanitizer.sanitize(untrustedMarkup);
      }
  }
  SanitizeValueConverter.inject = [ISanitizer];
  ValueConverterResource.define('sanitize', SanitizeValueConverter);

  /** @internal */
  class View {
      constructor($lifecycle, cache) {
          this.$bindableHead = null;
          this.$bindableTail = null;
          this.$nextBind = null;
          this.$prevBind = null;
          this.$attachableHead = null;
          this.$attachableTail = null;
          this.$nextAttach = null;
          this.$prevAttach = null;
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
          this.$bind = lockedBind;
          this.$unbind = lockedUnbind;
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
              view.$cache(exports.LifecycleFlags.none);
              this.cache.push(view);
              return true;
          }
          return false;
      }
      create() {
          const cache = this.cache;
          let view;
          if (cache !== null && cache.length > 0) {
              view = cache.pop();
              view.$state &= ~128 /* isCached */;
              return view;
          }
          view = new View(this.lifecycle, this);
          this.template.render(view);
          if (!view.$nodes) {
              throw kernel.Reporter.error(90);
          }
          return view;
      }
  }
  ViewFactory.maxCacheSize = 0xFFFF;
  function lockedBind(flags) {
      if (this.$state & 2 /* isBound */) {
          return;
      }
      flags |= exports.LifecycleFlags.fromBind;
      const lockedScope = this.$scope;
      let current = this.$bindableHead;
      while (current !== null) {
          current.$bind(flags, lockedScope);
          current = current.$nextBind;
      }
      this.$state |= 2 /* isBound */;
  }
  function lockedUnbind(flags) {
      if (this.$state & 2 /* isBound */) {
          // add isUnbinding flag
          this.$state |= 64 /* isUnbinding */;
          flags |= exports.LifecycleFlags.fromUnbind;
          let current = this.$bindableTail;
          while (current !== null) {
              current.$unbind(flags);
              current = current.$prevBind;
          }
          // remove isBound and isUnbinding flags
          this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
      }
  }
  ((proto) => {
      proto.$bind = $bindView;
      proto.$unbind = $unbindView;
      proto.$attach = $attachView;
      proto.$detach = $detachView;
      proto.$cache = $cacheView;
      proto.$mount = $mountView;
      proto.$unmount = $unmountView;
  })(View.prototype);

  const ITemplateCompiler = kernel.DI.createInterface('ITemplateCompiler').noDefault();
  (function (ViewCompileFlags) {
      ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
      ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
      ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
  })(exports.ViewCompileFlags || (exports.ViewCompileFlags = {}));
  const ITemplateFactory = kernel.DI.createInterface('ITemplateFactory').noDefault();
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
      render(renderable, host, parts) {
          const nodes = renderable.$nodes = this.factory.createNodeSequence();
          renderable.$context = this.renderContext;
          this.renderContext.render(renderable, nodes.findTargets(), this.definition, host, parts);
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
  const IInstructionRenderer = kernel.DI.createInterface('IInstructionRenderer').noDefault();
  const IRenderer = kernel.DI.createInterface('IRenderer').noDefault();
  const IRenderingEngine = kernel.DI.createInterface('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));
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
      applyRuntimeBehavior(Type, instance) {
          let found = this.behaviorLookup.get(Type);
          if (!found) {
              found = RuntimeBehavior.create(Type);
              this.behaviorLookup.set(Type, found);
          }
          found.applyTo(instance, this.lifecycle);
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
      context.render = function (renderable, targets, templateDefinition, host, parts) {
          renderer.render(dom, this, renderable, targets, templateDefinition, host, parts);
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
              throw kernel.Reporter.error(50); // TODO: organize error codes
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
          this.replacements = parts || kernel.PLATFORM.emptyObject;
      }
      resolve(handler, requestor) {
          const factory = this.factory;
          if (factory === undefined || factory === null) { // unmet precondition: call prepare
              throw kernel.Reporter.error(50); // TODO: organize error codes
          }
          if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
              throw kernel.Reporter.error(51); // TODO: organize error codes
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
          this.replacements = kernel.PLATFORM.emptyObject;
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
          this.callSubscribers(this.children, undefined, flags | exports.LifecycleFlags.updateTargetInstance);
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
      subscriberCollection(exports.MutationKind.instance)
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
      applyTo(instance, lifecycle) {
          instance.$lifecycle = lifecycle;
          if ('$projector' in instance) {
              this.applyToElement(lifecycle, instance);
          }
          else {
              this.applyToCore(instance);
          }
      }
      applyToElement(lifecycle, instance) {
          const observers = this.applyToCore(instance);
          observers.$children = new ChildrenObserver(lifecycle, instance);
          Reflect.defineProperty(instance, '$children', {
              enumerable: false,
              get: function () {
                  return this['$observers'].$children.getValue();
              }
          });
      }
      applyToCore(instance) {
          const observers = {};
          const bindables = this.bindables;
          const observableNames = Object.getOwnPropertyNames(bindables);
          for (let i = 0, ii = observableNames.length; i < ii; ++i) {
              const name = observableNames[i];
              observers[name] = new exports.SelfObserver(instance, name, bindables[name].callback);
              createGetterSetter(instance, name);
          }
          Reflect.defineProperty(instance, '$observers', {
              enumerable: false,
              value: observers
          });
          return observers;
      }
  }
  function createGetterSetter(instance, name) {
      Reflect.defineProperty(instance, name, {
          enumerable: true,
          get: function () { return this['$observers'][name].getValue(); },
          set: function (value) { this['$observers'][name].setValue(value, exports.LifecycleFlags.updateTargetInstance); }
      });
  }

  class Aurelia {
      constructor(container = kernel.DI.createContainer()) {
          this.container = container;
          this.components = [];
          this.startTasks = [];
          this.stopTasks = [];
          this.isStarted = false;
          this._root = null;
          kernel.Registration
              .instance(Aurelia, this)
              .register(container, Aurelia);
      }
      register(...params) {
          this.container.register(...params);
          return this;
      }
      app(config) {
          const host = config.host;
          let component;
          const componentOrType = config.component;
          if (CustomElementResource.isType(componentOrType)) {
              this.container.register(componentOrType);
              component = this.container.get(CustomElementResource.keyFrom(componentOrType.description.name));
          }
          else {
              component = componentOrType;
          }
          const domInitializer = this.container.get(IDOMInitializer);
          const dom = domInitializer.initialize(config);
          const startTask = () => {
              host.$au = this;
              if (!this.components.includes(component)) {
                  this._root = component;
                  this.components.push(component);
                  const re = this.container.get(IRenderingEngine);
                  const pl = this.container.get(IProjectorLocator);
                  component.$hydrate(dom, pl, re, host, this.container);
              }
              component.$bind(exports.LifecycleFlags.fromStartTask | exports.LifecycleFlags.fromBind, null);
              component.$attach(exports.LifecycleFlags.fromStartTask | exports.LifecycleFlags.fromAttach);
          };
          this.startTasks.push(startTask);
          this.stopTasks.push(() => {
              component.$detach(exports.LifecycleFlags.fromStopTask | exports.LifecycleFlags.fromDetach);
              component.$unbind(exports.LifecycleFlags.fromStopTask | exports.LifecycleFlags.fromUnbind);
              host.$au = null;
          });
          if (this.isStarted) {
              startTask();
          }
          return this;
      }
      root() {
          return this._root;
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
  kernel.PLATFORM.global.Aurelia = Aurelia;
  const IDOMInitializer = kernel.DI.createInterface('IDOMInitializer').noDefault();

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
      render(dom, context, renderable, targets, definition, host, parts) {
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
          for (let i = 0, ii = targets.length; i < ii; ++i) {
              const instructions = targetInstructions[i];
              const target = targets[i];
              for (let j = 0, jj = instructions.length; j < jj; ++j) {
                  const current = instructions[j];
                  instructionRenderers[current.type].render(dom, context, renderable, target, current, parts);
              }
          }
          if (host) {
              const surrogateInstructions = definition.surrogates;
              for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                  const current = surrogateInstructions[i];
                  instructionRenderers[current.type].render(dom, context, renderable, host, current, parts);
              }
          }
      }
  }
  Renderer.inject = [kernel.all(IInstructionRenderer)];
  function ensureExpression(parser, srcOrExpr, bindingType) {
      if (typeof srcOrExpr === 'string') {
          return parser.parse(srcOrExpr, bindingType);
      }
      return srcOrExpr;
  }
  function addBindable(renderable, bindable) {
      bindable.$prevBind = renderable.$bindableTail;
      bindable.$nextBind = null;
      if (renderable.$bindableTail === null) {
          renderable.$bindableHead = bindable;
      }
      else {
          renderable.$bindableTail.$nextBind = bindable;
      }
      renderable.$bindableTail = bindable;
  }
  function addAttachable(renderable, attachable) {
      attachable.$prevAttach = renderable.$attachableTail;
      attachable.$nextAttach = null;
      if (renderable.$attachableTail === null) {
          renderable.$attachableHead = attachable;
      }
      else {
          renderable.$attachableTail.$nextAttach = attachable;
      }
      renderable.$attachableTail = attachable;
  }
  let SetPropertyRenderer = 
  /** @internal */
  class SetPropertyRenderer {
      render(dom, context, renderable, target, instruction) {
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
      constructor(renderingEngine) {
          this.renderingEngine = renderingEngine;
      }
      render(dom, context, renderable, target, instruction) {
          const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
          const component = context.get(customElementKey(instruction.res));
          const instructionRenderers = context.get(IRenderer).instructionRenderers;
          const projectorLocator = context.get(IProjectorLocator);
          const childInstructions = instruction.instructions;
          component.$hydrate(dom, projectorLocator, this.renderingEngine, target, context, instruction);
          for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
              const current = childInstructions[i];
              instructionRenderers[current.type].render(dom, context, renderable, component, current);
          }
          addBindable(renderable, component);
          addAttachable(renderable, component);
          operation.dispose();
      }
  };
  CustomElementRenderer.inject = [IRenderingEngine];
  CustomElementRenderer = __decorate([
      instructionRenderer("ra" /* hydrateElement */)
      /** @internal */
  ], CustomElementRenderer);
  let CustomAttributeRenderer = 
  /** @internal */
  class CustomAttributeRenderer {
      constructor(renderingEngine) {
          this.renderingEngine = renderingEngine;
      }
      render(dom, context, renderable, target, instruction) {
          const operation = context.beginComponentOperation(renderable, target, instruction);
          const component = context.get(customAttributeKey(instruction.res));
          const instructionRenderers = context.get(IRenderer).instructionRenderers;
          const childInstructions = instruction.instructions;
          component.$hydrate(this.renderingEngine);
          for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
              const current = childInstructions[i];
              instructionRenderers[current.type].render(dom, context, renderable, component, current);
          }
          addBindable(renderable, component);
          addAttachable(renderable, component);
          operation.dispose();
      }
  };
  CustomAttributeRenderer.inject = [IRenderingEngine];
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
      render(dom, context, renderable, target, instruction, parts) {
          const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
          const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
          const component = context.get(customAttributeKey(instruction.res));
          const instructionRenderers = context.get(IRenderer).instructionRenderers;
          const childInstructions = instruction.instructions;
          component.$hydrate(this.renderingEngine);
          if (instruction.link) {
              component.link(renderable.$attachableTail);
          }
          for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
              const current = childInstructions[i];
              instructionRenderers[current.type].render(dom, context, renderable, component, current);
          }
          addBindable(renderable, component);
          addAttachable(renderable, component);
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
      render(dom, context, renderable, target, instruction) {
          dom.remove(target);
          const childInstructions = instruction.instructions;
          const toViewModel = instruction.toViewModel;
          for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
              const childInstruction = childInstructions[i];
              const expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
              const bindable = new exports.LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
              addBindable(renderable, bindable);
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
      render(dom, context, renderable, target, instruction) {
          const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
          const bindable = new Call(expr, target, instruction.to, this.observerLocator, context);
          addBindable(renderable, bindable);
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
      render(dom, context, renderable, target, instruction) {
          const expr = ensureExpression(this.parser, instruction.from, 1280 /* IsRef */);
          const bindable = new Ref(expr, target, context);
          addBindable(renderable, bindable);
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
      render(dom, context, renderable, target, instruction) {
          let bindable;
          const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
          if (expr.isMulti) {
              bindable = new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, exports.BindingMode.toView, context);
          }
          else {
              bindable = new exports.InterpolationBinding(expr.firstExpression, expr, target, instruction.to, exports.BindingMode.toView, this.observerLocator, context, true);
          }
          addBindable(renderable, bindable);
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
      render(dom, context, renderable, target, instruction) {
          const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
          const bindable = new exports.Binding(expr, target, instruction.to, instruction.mode, this.observerLocator, context);
          addBindable(renderable, bindable);
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
      render(dom, context, renderable, target, instruction) {
          const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
          const bindable = new exports.Binding(expr, target, instruction.to, exports.BindingMode.toView, this.observerLocator, context);
          addBindable(renderable, bindable);
      }
  };
  IteratorBindingRenderer.inject = [IExpressionParser, IObserverLocator];
  IteratorBindingRenderer = __decorate([
      instructionRenderer("rk" /* iteratorBinding */)
      /** @internal */
  ], IteratorBindingRenderer);
  const BasicRenderer = {
      register(container) {
          container.register(SetPropertyRenderer, CustomElementRenderer, CustomAttributeRenderer, TemplateControllerRenderer, LetElementRenderer, CallBindingRenderer, RefBindingRenderer, InterpolationBindingRenderer, PropertyBindingRenderer, IteratorBindingRenderer);
      }
  };

  const GlobalResources = [
      If,
      Else,
      Repeat,
      Replaceable,
      With,
      SanitizeValueConverter,
      DebounceBindingBehavior,
      OneTimeBindingBehavior,
      ToViewBindingBehavior,
      FromViewBindingBehavior,
      SignalBindingBehavior,
      ThrottleBindingBehavior,
      TwoWayBindingBehavior
  ];
  const RuntimeConfiguration = {
      register(container) {
          container.register(BasicRenderer, kernel.Registration.singleton(IObserverLocator, ObserverLocator), kernel.Registration.singleton(ILifecycle, Lifecycle), kernel.Registration.singleton(IRenderer, Renderer), ...GlobalResources);
      },
      createContainer() {
          const container = kernel.DI.createContainer();
          container.register(RuntimeConfiguration);
          return container;
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

  exports.CallFunction = CallFunction;
  exports.connects = connects;
  exports.observes = observes;
  exports.callsFunction = callsFunction;
  exports.hasAncestor = hasAncestor;
  exports.isAssignable = isAssignable;
  exports.isLeftHandSide = isLeftHandSide;
  exports.isPrimary = isPrimary;
  exports.isResource = isResource;
  exports.hasBind = hasBind;
  exports.hasUnbind = hasUnbind;
  exports.isLiteral = isLiteral;
  exports.arePureLiterals = arePureLiterals;
  exports.isPureLiteral = isPureLiteral;
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
  exports.Call = Call;
  exports.connectable = connectable;
  exports.IExpressionParser = IExpressionParser;
  exports.MultiInterpolationBinding = MultiInterpolationBinding;
  exports.Ref = Ref;
  exports.enableArrayObservation = enableArrayObservation;
  exports.disableArrayObservation = disableArrayObservation;
  exports.enableMapObservation = enableMapObservation;
  exports.disableMapObservation = disableMapObservation;
  exports.enableSetObservation = enableSetObservation;
  exports.disableSetObservation = disableSetObservation;
  exports.BindingContext = BindingContext;
  exports.Scope = Scope;
  exports.OverrideContext = OverrideContext;
  exports.collectionObserver = collectionObserver;
  exports.computed = computed;
  exports.IDirtyChecker = IDirtyChecker;
  exports.IObserverLocator = IObserverLocator;
  exports.ITargetObserverLocator = ITargetObserverLocator;
  exports.ITargetAccessorLocator = ITargetAccessorLocator;
  exports.getCollectionObserver = getCollectionObserver;
  exports.PrimitiveObserver = PrimitiveObserver;
  exports.PropertyAccessor = PropertyAccessor;
  exports.propertyObserver = propertyObserver;
  exports.ISignaler = ISignaler;
  exports.subscriberCollection = subscriberCollection;
  exports.batchedSubscriberCollection = batchedSubscriberCollection;
  exports.targetObserver = targetObserver;
  exports.bindingBehavior = bindingBehavior;
  exports.BindingBehaviorResource = BindingBehaviorResource;
  exports.BindingModeBehavior = BindingModeBehavior;
  exports.OneTimeBindingBehavior = OneTimeBindingBehavior;
  exports.ToViewBindingBehavior = ToViewBindingBehavior;
  exports.FromViewBindingBehavior = FromViewBindingBehavior;
  exports.TwoWayBindingBehavior = TwoWayBindingBehavior;
  exports.DebounceBindingBehavior = DebounceBindingBehavior;
  exports.SignalBindingBehavior = SignalBindingBehavior;
  exports.ThrottleBindingBehavior = ThrottleBindingBehavior;
  exports.customAttribute = customAttribute;
  exports.CustomAttributeResource = CustomAttributeResource;
  exports.dynamicOptions = dynamicOptions;
  exports.templateController = templateController;
  exports.If = If;
  exports.Else = Else;
  exports.Repeat = Repeat;
  exports.Replaceable = Replaceable;
  exports.With = With;
  exports.containerless = containerless;
  exports.customElement = customElement;
  exports.CustomElementResource = CustomElementResource;
  exports.IProjectorLocator = IProjectorLocator;
  exports.useShadowDOM = useShadowDOM;
  exports.valueConverter = valueConverter;
  exports.ValueConverterResource = ValueConverterResource;
  exports.ISanitizer = ISanitizer;
  exports.SanitizeValueConverter = SanitizeValueConverter;
  exports.bindable = bindable;
  exports.Aurelia = Aurelia;
  exports.IDOMInitializer = IDOMInitializer;
  exports.RuntimeConfiguration = RuntimeConfiguration;
  exports.buildTemplateDefinition = buildTemplateDefinition;
  exports.isTargetedInstruction = isTargetedInstruction;
  exports.ITargetedInstruction = ITargetedInstruction;
  exports.INode = INode;
  exports.IRenderLocation = IRenderLocation;
  exports.IDOM = IDOM;
  exports.NodeSequence = NodeSequence;
  exports.CallBindingInstruction = CallBindingInstruction;
  exports.FromViewBindingInstruction = FromViewBindingInstruction;
  exports.HydrateAttributeInstruction = HydrateAttributeInstruction;
  exports.HydrateElementInstruction = HydrateElementInstruction;
  exports.HydrateTemplateController = HydrateTemplateController;
  exports.InterpolationInstruction = InterpolationInstruction;
  exports.IteratorBindingInstruction = IteratorBindingInstruction;
  exports.LetBindingInstruction = LetBindingInstruction;
  exports.LetElementInstruction = LetElementInstruction;
  exports.OneTimeBindingInstruction = OneTimeBindingInstruction;
  exports.RefBindingInstruction = RefBindingInstruction;
  exports.SetPropertyInstruction = SetPropertyInstruction;
  exports.ToViewBindingInstruction = ToViewBindingInstruction;
  exports.TwoWayBindingInstruction = TwoWayBindingInstruction;
  exports.AggregateLifecycleTask = AggregateLifecycleTask;
  exports.CompositionCoordinator = CompositionCoordinator;
  exports.ILifecycle = ILifecycle;
  exports.IRenderable = IRenderable;
  exports.IViewFactory = IViewFactory;
  exports.LifecycleTask = LifecycleTask;
  exports.PromiseTask = PromiseTask;
  exports.stringifyLifecycleFlags = stringifyLifecycleFlags;
  exports.instructionRenderer = instructionRenderer;
  exports.ensureExpression = ensureExpression;
  exports.addAttachable = addAttachable;
  exports.addBindable = addBindable;
  exports.BasicRenderer = BasicRenderer;
  exports.CompiledTemplate = CompiledTemplate;
  exports.createRenderContext = createRenderContext;
  exports.IInstructionRenderer = IInstructionRenderer;
  exports.IRenderer = IRenderer;
  exports.IRenderingEngine = IRenderingEngine;
  exports.ITemplateCompiler = ITemplateCompiler;
  exports.ITemplateFactory = ITemplateFactory;

  return exports;

}({}, kernel));
//# sourceMappingURL=index.iife.js.map
