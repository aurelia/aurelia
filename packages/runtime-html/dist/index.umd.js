(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@aurelia/kernel'), require('@aurelia/runtime')) :
  typeof define === 'function' && define.amd ? define(['exports', '@aurelia/kernel', '@aurelia/runtime'], factory) :
  (global = global || self, factory(global.runtimeHtml = {}, global.kernel, global.runtime));
}(this, function (exports, kernel, runtime) { 'use strict';

  class Listener {
      constructor(dom, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
          this.dom = dom;
          this.$nextBind = null;
          this.$prevBind = null;
          this.$state = 0 /* none */;
          this.delegationStrategy = delegationStrategy;
          this.locator = locator;
          this.preventDefault = preventDefault;
          this.sourceExpression = sourceExpression;
          this.target = target;
          this.targetEvent = targetEvent;
          this.eventManager = eventManager;
      }
      callSource(event) {
          const overrideContext = this.$scope.overrideContext;
          overrideContext.$event = event;
          const result = this.sourceExpression.evaluate(runtime.LifecycleFlags.mustEvaluate, this.$scope, this.locator);
          delete overrideContext.$event;
          if (result !== true && this.preventDefault) {
              event.preventDefault();
          }
          return result;
      }
      handleEvent(event) {
          this.callSource(event);
      }
      $bind(flags, scope) {
          if (this.$state & 2 /* isBound */) {
              if (this.$scope === scope) {
                  return;
              }
              this.$unbind(flags | runtime.LifecycleFlags.fromBind);
          }
          // add isBinding flag
          this.$state |= 1 /* isBinding */;
          this.$scope = scope;
          const sourceExpression = this.sourceExpression;
          if (runtime.hasBind(sourceExpression)) {
              sourceExpression.bind(flags, scope, this);
          }
          this.handler = this.eventManager.addEventListener(this.dom, this.target, this.targetEvent, this, this.delegationStrategy);
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
          if (runtime.hasUnbind(sourceExpression)) {
              sourceExpression.unbind(flags, this.$scope, this);
          }
          this.$scope = null;
          this.handler.dispose();
          this.handler = null;
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

  exports.AttributeNSAccessor = class AttributeNSAccessor {
      constructor(lifecycle, obj, propertyKey, attributeName, namespace) {
          this.isDOMObserver = true;
          this.attributeName = attributeName;
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.oldValue = this.currentValue = this.getValue();
          this.propertyKey = propertyKey;
          this.namespace = namespace;
      }
      getValue() {
          return this.obj.getAttributeNS(this.namespace, this.attributeName);
      }
      setValueCore(newValue) {
          this.obj.setAttributeNS(this.namespace, this.attributeName, newValue);
      }
  };
  exports.AttributeNSAccessor = __decorate([
      runtime.targetObserver('')
  ], exports.AttributeNSAccessor);

  const handleEventFlags = runtime.LifecycleFlags.fromDOMEvent | runtime.LifecycleFlags.updateSourceExpression;
  const defaultHandleBatchedChangeFlags = runtime.LifecycleFlags.fromFlush | runtime.LifecycleFlags.updateTargetInstance;
  const defaultMatcher = (a, b) => {
      return a === b;
  };
  exports.CheckedObserver = class CheckedObserver {
      constructor(lifecycle, obj, handler, observerLocator) {
          this.isDOMObserver = true;
          this.handler = handler;
          this.lifecycle = lifecycle;
          this.obj = obj;
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
          const matcher = element['matcher'] || defaultMatcher;
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
          if (flags & runtime.LifecycleFlags.fromBind) {
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
          const matcher = element['matcher'] || defaultMatcher;
          if (element.type === 'checkbox') {
              if (Array.isArray(value)) {
                  index = value.findIndex(item => !!matcher(item, elementValue));
                  if (element.checked && index === -1) {
                      value.push(elementValue);
                  }
                  else if (!element.checked && index !== -1) {
                      value.splice(index, 1);
                  }
                  // when existing value is array, do not invoke callback as only the array element has changed
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
      runtime.targetObserver()
  ], exports.CheckedObserver);

  exports.ClassAttributeAccessor = class ClassAttributeAccessor {
      constructor(lifecycle, obj) {
          this.isDOMObserver = true;
          this.doNotCache = true;
          this.lifecycle = lifecycle;
          this.nameIndex = null;
          this.obj = obj;
          this.version = 0;
      }
      getValue() {
          return this.currentValue;
      }
      setValueCore(newValue) {
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
                  node.classList.add(name);
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
              this.obj.classList.remove(name);
          }
      }
  };
  exports.ClassAttributeAccessor = __decorate([
      runtime.targetObserver('')
  ], exports.ClassAttributeAccessor);

  exports.DataAttributeAccessor = class DataAttributeAccessor {
      constructor(lifecycle, obj, propertyKey) {
          this.isDOMObserver = true;
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.oldValue = this.currentValue = this.getValue();
          this.propertyKey = propertyKey;
      }
      getValue() {
          return this.obj.getAttribute(this.propertyKey);
      }
      setValueCore(newValue) {
          if (newValue === null) {
              this.obj.removeAttribute(this.propertyKey);
          }
          else {
              this.obj.setAttribute(this.propertyKey, newValue);
          }
      }
  };
  exports.DataAttributeAccessor = __decorate([
      runtime.targetObserver()
  ], exports.DataAttributeAccessor);

  exports.ElementPropertyAccessor = class ElementPropertyAccessor {
      constructor(lifecycle, obj, propertyKey) {
          this.isDOMObserver = true;
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.propertyKey = propertyKey;
      }
      getValue() {
          return this.obj[this.propertyKey];
      }
      setValueCore(value) {
          this.obj[this.propertyKey] = value;
      }
  };
  exports.ElementPropertyAccessor = __decorate([
      runtime.targetObserver('')
  ], exports.ElementPropertyAccessor);

  //Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
  /** @internal */
  function findOriginalEventTarget(event) {
      return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
  }
  function stopPropagation() {
      this.standardStopPropagation();
      this.propagationStopped = true;
  }
  function handleCapturedEvent(event) {
      event.propagationStopped = false;
      let target = findOriginalEventTarget(event);
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
      let target = findOriginalEventTarget(event);
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
      constructor(dom, eventName, listener, capture) {
          this.dom = dom;
          this.capture = capture;
          this.count = 0;
          this.eventName = eventName;
          this.listener = listener;
      }
      increment() {
          this.count++;
          if (this.count === 1) {
              this.dom.addEventListener(this.eventName, this.listener, null, this.capture);
          }
      }
      decrement() {
          this.count--;
          if (this.count === 0) {
              this.dom.removeEventListener(this.eventName, this.listener, null, this.capture);
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
      constructor(dom, target, targetEvent, callback) {
          this.dom = dom;
          this.target = target;
          this.targetEvent = targetEvent;
          this.callback = callback;
          dom.addEventListener(targetEvent, callback, target);
      }
      dispose() {
          this.dom.removeEventListener(this.targetEvent, this.callback, this.target);
      }
  }
  class EventSubscriber {
      constructor(dom, events) {
          this.dom = dom;
          this.events = events;
          this.target = null;
          this.handler = null;
      }
      subscribe(node, callbackOrListener) {
          this.target = node;
          this.handler = callbackOrListener;
          const add = this.dom.addEventListener;
          const events = this.events;
          for (let i = 0, ii = events.length; ii > i; ++i) {
              add(events[i], callbackOrListener, node);
          }
      }
      dispose() {
          const node = this.target;
          const callbackOrListener = this.handler;
          const events = this.events;
          const remove = this.dom.removeEventListener;
          for (let i = 0, ii = events.length; ii > i; ++i) {
              remove(events[i], callbackOrListener, node);
          }
          this.target = this.handler = null;
      }
  }
  const IEventManager = kernel.DI.createInterface('IEventManager').withDefault(x => x.singleton(EventManager));
  /** @internal */
  class EventManager {
      constructor() {
          this.elementHandlerLookup = {};
          this.delegatedHandlers = {};
          this.capturedHandlers = {};
      }
      addEventListener(dom, target, targetEvent, callbackOrListener, strategy) {
          let delegatedHandlers;
          let capturedHandlers;
          let handlerEntry;
          if (strategy === runtime.DelegationStrategy.bubbling) {
              delegatedHandlers = this.delegatedHandlers;
              handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new ListenerTracker(dom, targetEvent, handleDelegatedEvent, false));
              handlerEntry.increment();
              const delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
              return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
          }
          if (strategy === runtime.DelegationStrategy.capturing) {
              capturedHandlers = this.capturedHandlers;
              handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new ListenerTracker(dom, targetEvent, handleCapturedEvent, true));
              handlerEntry.increment();
              const capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});
              return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
          }
          return new TriggerSubscription(dom, target, targetEvent, callbackOrListener);
      }
  }

  const handleEventFlags$1 = runtime.LifecycleFlags.fromDOMEvent | runtime.LifecycleFlags.updateSourceExpression;
  const childObserverOptions = {
      childList: true,
      subtree: true,
      characterData: true
  };
  function defaultMatcher$1(a, b) {
      return a === b;
  }
  exports.SelectValueObserver = class SelectValueObserver {
      constructor(lifecycle, obj, handler, observerLocator) {
          this.isDOMObserver = true;
          this.lifecycle = lifecycle;
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
          if (flags & runtime.LifecycleFlags.fromBind) {
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
          const shouldNotify = this.synchronizeValue();
          if (shouldNotify) {
              this.notify(handleEventFlags$1);
          }
      }
      synchronizeOptions(indexMap) {
          const currentValue = this.currentValue;
          const isArray = Array.isArray(currentValue);
          const obj = this.obj;
          const matcher = obj.matcher || defaultMatcher$1;
          const options = obj.options;
          let i = options.length;
          while (i--) {
              const option = options[i];
              const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
              if (isArray) {
                  option.selected = currentValue.findIndex(item => !!matcher(optionValue, item)) !== -1;
                  continue;
              }
              option.selected = !!matcher(optionValue, currentValue);
          }
      }
      synchronizeValue() {
          // Spec for synchronizing value from `SelectObserver` to `<select/>`
          // When synchronizing value to observed <select/> element, do the following steps:
          // A. If `<select/>` is multiple
          //    1. Check if current value, called `currentValue` is an array
          //      a. If not an array, return true to signal value has changed
          //      b. If is an array:
          //        i. gather all current selected <option/>, in to array called `values`
          //        ii. loop through the `currentValue` array and remove items that are nolonger selected based on matcher
          //        iii. loop through the `values` array and add items that are selected based on matcher
          //        iv. Return false to signal value hasn't changed
          // B. If the select is single
          //    1. Let `value` equal the first selected option, if no option selected, then `value` is `null`
          //    2. assign `this.currentValue` to `this.oldValue`
          //    3. assign `value` to `this.currentValue`
          //    4. return `true` to signal value has changed
          const obj = this.obj;
          const options = obj.options;
          const len = options.length;
          const currentValue = this.currentValue;
          let i = 0;
          if (obj.multiple) {
              // A.
              if (!Array.isArray(currentValue)) {
                  // A.1.a
                  return true;
              }
              // A.1.b
              // multi select
              let option;
              const matcher = obj.matcher || defaultMatcher$1;
              // A.1.b.i
              const values = [];
              while (i < len) {
                  option = options[i];
                  if (option.selected) {
                      values.push(option.hasOwnProperty('model')
                          ? option.model
                          : option.value);
                  }
                  ++i;
              }
              // A.1.b.ii
              i = 0;
              while (i < currentValue.length) {
                  const a = currentValue[i];
                  // Todo: remove arrow fn
                  if (values.findIndex(b => !!matcher(a, b)) === -1) {
                      currentValue.splice(i, 1);
                  }
                  else {
                      ++i;
                  }
              }
              // A.1.b.iii
              i = 0;
              while (i < values.length) {
                  const a = values[i];
                  // Todo: remove arrow fn
                  if (currentValue.findIndex(b => !!matcher(a, b)) === -1) {
                      currentValue.push(a);
                  }
                  ++i;
              }
              // A.1.b.iv
              return false;
          }
          // B. single select
          // B.1
          let value = null;
          while (i < len) {
              const option = options[i];
              if (option.selected) {
                  value = option.hasOwnProperty('model')
                      ? option.model
                      : option.value;
                  break;
              }
              ++i;
          }
          // B.2
          this.oldValue = this.currentValue;
          // B.3
          this.currentValue = value;
          // B.4
          return true;
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
          this.nodeObserver = new MutationObserver(this.handleNodeChange.bind(this));
          this.nodeObserver.observe(this.obj, childObserverOptions);
      }
      unbind() {
          this.nodeObserver.disconnect();
          this.nodeObserver = null;
          if (this.arrayObserver) {
              this.arrayObserver.unsubscribeBatched(this);
              this.arrayObserver = null;
          }
      }
      handleNodeChange() {
          this.synchronizeOptions();
          const shouldNotify = this.synchronizeValue();
          if (shouldNotify) {
              this.notify(handleEventFlags$1);
          }
      }
  };
  exports.SelectValueObserver = __decorate([
      runtime.targetObserver()
  ], exports.SelectValueObserver);

  exports.StyleAttributeAccessor = class StyleAttributeAccessor {
      constructor(lifecycle, obj) {
          this.isDOMObserver = true;
          this.oldValue = this.currentValue = obj.style.cssText;
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.styles = null;
          this.version = 0;
      }
      getValue() {
          return this.obj.style.cssText;
      }
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
                  const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
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
      runtime.targetObserver()
  ], exports.StyleAttributeAccessor);

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
  const handleEventFlags$2 = runtime.LifecycleFlags.fromDOMEvent | runtime.LifecycleFlags.updateSourceExpression;
  exports.ValueAttributeObserver = class ValueAttributeObserver {
      constructor(lifecycle, obj, propertyKey, handler) {
          this.isDOMObserver = true;
          this.handler = handler;
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.propertyKey = propertyKey;
          // note: input.files can be assigned and this was fixed in Firefox 57:
          // https://bugzilla.mozilla.org/show_bug.cgi?id=1384030
          // input.value (for type='file') however, can only be assigned an empty string
          if (propertyKey === 'value') {
              const nodeType = obj['type'];
              this.defaultValue = inputValueDefaults[nodeType || 'text'];
              if (nodeType === 'file') {
                  this.flush = this.flushFileChanges;
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
          if (flags & runtime.LifecycleFlags.fromBind) {
              return;
          }
          this.callSubscribers(this.currentValue, this.oldValue, flags);
      }
      handleEvent() {
          const oldValue = this.oldValue = this.currentValue;
          const newValue = this.currentValue = this.getValue();
          if (oldValue !== newValue) {
              this.callSubscribers(newValue, oldValue, handleEventFlags$2);
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
          if (this.oldValue !== currentValue && currentValue === '') {
              this.setValueCore(currentValue, this.currentFlags);
              this.oldValue = this.currentValue;
          }
      }
  };
  exports.ValueAttributeObserver = __decorate([
      runtime.targetObserver('')
  ], exports.ValueAttributeObserver);

  const xlinkNS = 'http://www.w3.org/1999/xlink';
  const xmlNS = 'http://www.w3.org/XML/1998/namespace';
  const xmlnsNS = 'http://www.w3.org/2000/xmlns/';
  // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
  const nsAttributes = (function (o) {
      o['xlink:actuate'] = ['actuate', xlinkNS];
      o['xlink:arcrole'] = ['arcrole', xlinkNS];
      o['xlink:href'] = ['href', xlinkNS];
      o['xlink:role'] = ['role', xlinkNS];
      o['xlink:show'] = ['show', xlinkNS];
      o['xlink:title'] = ['title', xlinkNS];
      o['xlink:type'] = ['type', xlinkNS];
      o['xml:lang'] = ['lang', xmlNS];
      o['xml:space'] = ['space', xmlNS];
      o['xmlns'] = ['xmlns', xmlnsNS];
      o['xmlns:xlink'] = ['xlink', xmlnsNS];
      return o;
  })(Object.create(null));
  const inputEvents = ['change', 'input'];
  const selectEvents = ['change'];
  const contentEvents = ['change', 'input', 'blur', 'keyup', 'paste'];
  const scrollEvents = ['scroll'];
  const overrideProps = (function (o) {
      o['class'] = true;
      o['style'] = true;
      o['css'] = true;
      o['checked'] = true;
      o['value'] = true;
      o['model'] = true;
      o['xlink:actuate'] = true;
      o['xlink:arcrole'] = true;
      o['xlink:href'] = true;
      o['xlink:role'] = true;
      o['xlink:show'] = true;
      o['xlink:title'] = true;
      o['xlink:type'] = true;
      o['xml:lang'] = true;
      o['xml:space'] = true;
      o['xmlns'] = true;
      o['xmlns:xlink'] = true;
      return o;
  })(Object.create(null));
  class TargetObserverLocator {
      constructor(dom) {
          this.dom = dom;
      }
      getObserver(lifecycle, observerLocator, obj, propertyName) {
          switch (propertyName) {
              case 'checked':
                  return new exports.CheckedObserver(lifecycle, obj, new EventSubscriber(this.dom, inputEvents), observerLocator);
              case 'value':
                  if (obj['tagName'] === 'SELECT') {
                      return new exports.SelectValueObserver(lifecycle, obj, new EventSubscriber(this.dom, selectEvents), observerLocator);
                  }
                  return new exports.ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, inputEvents));
              case 'files':
                  return new exports.ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, inputEvents));
              case 'textContent':
              case 'innerHTML':
                  return new exports.ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, contentEvents));
              case 'scrollTop':
              case 'scrollLeft':
                  return new exports.ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, scrollEvents));
              case 'class':
                  return new exports.ClassAttributeAccessor(lifecycle, obj);
              case 'style':
              case 'css':
                  return new exports.StyleAttributeAccessor(lifecycle, obj);
              case 'model':
                  return new runtime.SetterObserver(obj, propertyName);
              case 'role':
                  return new exports.DataAttributeAccessor(lifecycle, obj, propertyName);
              default:
                  if (nsAttributes[propertyName] !== undefined) {
                      const nsProps = nsAttributes[propertyName];
                      return new exports.AttributeNSAccessor(lifecycle, obj, propertyName, nsProps[0], nsProps[1]);
                  }
                  const prefix = propertyName.slice(0, 5);
                  // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
                  // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
                  if (prefix === 'aria-' || prefix === 'data-') {
                      return new exports.DataAttributeAccessor(lifecycle, obj, propertyName);
                  }
          }
          return null;
      }
      overridesAccessor(obj, propertyName) {
          return overrideProps[propertyName] === true;
      }
      handles(obj) {
          return this.dom.isNodeInstance(obj);
      }
  }
  TargetObserverLocator.inject = [runtime.IDOM];
  class TargetAccessorLocator {
      constructor(dom) {
          this.dom = dom;
      }
      getAccessor(lifecycle, obj, propertyName) {
          switch (propertyName) {
              case 'textContent':
                  // note: this case is just an optimization (textContent is the most often used property)
                  return new exports.ElementPropertyAccessor(lifecycle, obj, propertyName);
              case 'class':
                  return new exports.ClassAttributeAccessor(lifecycle, obj);
              case 'style':
              case 'css':
                  return new exports.StyleAttributeAccessor(lifecycle, obj);
              // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
              // but for now stick to what vCurrent does
              case 'src':
              case 'href':
              // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
              case 'role':
                  return new exports.DataAttributeAccessor(lifecycle, obj, propertyName);
              default:
                  if (nsAttributes[propertyName] !== undefined) {
                      const nsProps = nsAttributes[propertyName];
                      return new exports.AttributeNSAccessor(lifecycle, obj, propertyName, nsProps[0], nsProps[1]);
                  }
                  const prefix = propertyName.slice(0, 5);
                  // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
                  // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
                  if (prefix === 'aria-' || prefix === 'data-') {
                      return new exports.DataAttributeAccessor(lifecycle, obj, propertyName);
                  }
                  return new exports.ElementPropertyAccessor(lifecycle, obj, propertyName);
          }
      }
      handles(obj) {
          return this.dom.isNodeInstance(obj);
      }
  }
  TargetAccessorLocator.inject = [runtime.IDOM];

  const ISVGAnalyzer = kernel.DI.createInterface('ISVGAnalyzer').withDefault(x => x.singleton(class {
      isStandardSvgAttribute(node, attributeName) {
          return false;
      }
  }));

  class AttrBindingBehavior {
      bind(flags, scope, binding) {
          binding.targetObserver = new exports.DataAttributeAccessor(binding.locator.get(runtime.ILifecycle), binding.target, binding.targetProperty);
      }
      unbind(flags, scope, binding) {
          return;
      }
  }
  runtime.BindingBehaviorResource.define('attr', AttrBindingBehavior);

  /** @internal */
  function handleSelfEvent(event) {
      const target = findOriginalEventTarget(event);
      if (this.target !== target) {
          return;
      }
      return this.selfEventCallSource(event);
  }
  class SelfBindingBehavior {
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
  }
  runtime.BindingBehaviorResource.define('self', SelfBindingBehavior);

  class UpdateTriggerBindingBehavior {
      constructor(observerLocator) {
          this.observerLocator = observerLocator;
      }
      bind(flags, scope, binding, ...events) {
          if (events.length === 0) {
              throw kernel.Reporter.error(9);
          }
          if (binding.mode !== runtime.BindingMode.twoWay && binding.mode !== runtime.BindingMode.fromView) {
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
          targetObserver.handler = new EventSubscriber(binding.locator.get(runtime.IDOM), events);
      }
      unbind(flags, scope, binding) {
          // restore the state of the binding.
          binding.targetObserver.handler.dispose();
          binding.targetObserver.handler = binding.targetObserver.originalHandler;
          binding.targetObserver.originalHandler = null;
      }
  }
  UpdateTriggerBindingBehavior.inject = [runtime.IObserverLocator];
  runtime.BindingBehaviorResource.define('updateTrigger', UpdateTriggerBindingBehavior);

  function isHTMLTargetedInstruction(value) {
      const type = value.type;
      return typeof type === 'string' && type.length === 2;
  }

  class TextBindingInstruction {
      constructor(from) {
          this.type = "ha" /* textBinding */;
          this.from = from;
      }
  }
  class TriggerBindingInstruction {
      constructor(from, to) {
          this.type = "hb" /* listenerBinding */;
          this.from = from;
          this.preventDefault = true;
          this.strategy = runtime.DelegationStrategy.none;
          this.to = to;
      }
  }
  class DelegateBindingInstruction {
      constructor(from, to) {
          this.type = "hb" /* listenerBinding */;
          this.from = from;
          this.preventDefault = false;
          this.strategy = runtime.DelegationStrategy.bubbling;
          this.to = to;
      }
  }
  class CaptureBindingInstruction {
      constructor(from, to) {
          this.type = "hb" /* listenerBinding */;
          this.from = from;
          this.preventDefault = false;
          this.strategy = runtime.DelegationStrategy.capturing;
          this.to = to;
      }
  }
  class StylePropertyBindingInstruction {
      constructor(from, to) {
          this.type = "hc" /* stylePropertyBinding */;
          this.from = from;
          this.to = to;
      }
  }
  class SetAttributeInstruction {
      constructor(value, to) {
          this.type = "hd" /* setAttribute */;
          this.to = to;
          this.value = value;
      }
  }

  function createElement(dom, tagOrType, props, children) {
      if (typeof tagOrType === 'string') {
          return createElementForTag(dom, tagOrType, props, children);
      }
      else {
          return createElementForType(dom, tagOrType, props, children);
      }
  }
  class RenderPlan {
      constructor(dom, node, instructions, dependencies) {
          this.dom = dom;
          this.dependencies = dependencies;
          this.instructions = instructions;
          this.node = node;
      }
      get definition() {
          return this.lazyDefinition || (this.lazyDefinition =
              runtime.buildTemplateDefinition(null, null, this.node, null, typeof this.node === 'string', null, this.instructions, this.dependencies));
      }
      getElementTemplate(engine, Type) {
          return engine.getElementTemplate(this.dom, this.definition, null, Type);
      }
      createView(engine, parentContext) {
          return this.getViewFactory(engine, parentContext).create();
      }
      getViewFactory(engine, parentContext) {
          return engine.getViewFactory(this.dom, this.definition, parentContext);
      }
      /** @internal */
      mergeInto(parent, instructions, dependencies) {
          this.dom.appendChild(parent, this.node);
          instructions.push(...this.instructions);
          dependencies.push(...this.dependencies);
      }
  }
  function createElementForTag(dom, tagName, props, children) {
      const instructions = [];
      const allInstructions = [];
      const dependencies = [];
      const element = dom.createElement(tagName);
      let hasInstructions = false;
      if (props) {
          Object.keys(props)
              .forEach(to => {
              const value = props[to];
              if (isHTMLTargetedInstruction(value)) {
                  hasInstructions = true;
                  instructions.push(value);
              }
              else {
                  dom.setAttribute(element, to, value);
              }
          });
      }
      if (hasInstructions) {
          dom.makeTarget(element);
          allInstructions.push(instructions);
      }
      if (children) {
          addChildren(dom, element, children, allInstructions, dependencies);
      }
      return new RenderPlan(dom, element, allInstructions, dependencies);
  }
  function createElementForType(dom, Type, props, children) {
      const tagName = Type.description.name;
      const instructions = [];
      const allInstructions = [instructions];
      const dependencies = [];
      const childInstructions = [];
      const bindables = Type.description.bindables;
      const element = dom.createElement(tagName);
      dom.makeTarget(element);
      if (!dependencies.includes(Type)) {
          dependencies.push(Type);
      }
      instructions.push(new runtime.HydrateElementInstruction(tagName, childInstructions));
      if (props) {
          Object.keys(props)
              .forEach(to => {
              const value = props[to];
              if (isHTMLTargetedInstruction(value)) {
                  childInstructions.push(value);
              }
              else {
                  const bindable = bindables[to];
                  if (bindable) {
                      childInstructions.push({
                          type: "re" /* setProperty */,
                          to,
                          value
                      });
                  }
                  else {
                      childInstructions.push(new SetAttributeInstruction(value, to));
                  }
              }
          });
      }
      if (children) {
          addChildren(dom, element, children, allInstructions, dependencies);
      }
      return new RenderPlan(dom, element, allInstructions, dependencies);
  }
  function addChildren(dom, parent, children, allInstructions, dependencies) {
      for (let i = 0, ii = children.length; i < ii; ++i) {
          const current = children[i];
          switch (typeof current) {
              case 'string':
                  dom.appendChild(parent, dom.createTextNode(current));
                  break;
              case 'object':
                  if (dom.isNodeInstance(current)) {
                      dom.appendChild(parent, current);
                  }
                  else if ('mergeInto' in current) {
                      current.mergeInto(parent, allInstructions, dependencies);
                  }
          }
      }
  }

  const composeSource = {
      name: 'au-compose',
      containerless: true
  };
  const composeProps = ['subject', 'composing'];
  class Compose {
      constructor(dom, renderable, instruction, renderingEngine, coordinator) {
          this.dom = dom;
          this.subject = null;
          this.composing = false;
          this.coordinator = coordinator;
          this.lastSubject = null;
          this.renderable = renderable;
          this.renderingEngine = renderingEngine;
          this.coordinator.onSwapComplete = () => {
              this.composing = false;
          };
          this.properties = instruction.instructions
              .filter((x) => !composeProps.includes(x.to))
              .reduce((acc, item) => {
              if (item.to) {
                  acc[item.to] = item;
              }
              return acc;
          }, {});
      }
      binding(flags) {
          this.startComposition(this.subject, null, flags);
          this.coordinator.binding(flags, this.$scope);
      }
      attaching(flags) {
          this.coordinator.attaching(flags);
      }
      detaching(flags) {
          this.coordinator.detaching(flags);
      }
      unbinding(flags) {
          this.lastSubject = null;
          this.coordinator.unbinding(flags);
      }
      caching(flags) {
          this.coordinator.caching(flags);
      }
      subjectChanged(newValue, previousValue, flags) {
          this.startComposition(newValue, previousValue, flags);
      }
      startComposition(subject, _previousSubject, flags) {
          if (this.lastSubject === subject) {
              return;
          }
          this.lastSubject = subject;
          if (subject instanceof Promise) {
              subject = subject.then(x => this.resolveView(x, flags));
          }
          else {
              subject = this.resolveView(subject, flags);
          }
          this.composing = true;
          this.coordinator.compose(subject, flags);
      }
      resolveView(subject, flags) {
          const view = this.provideViewFor(subject);
          if (view) {
              view.hold(this.$projector.host);
              view.lockScope(this.renderable.$scope);
              return view;
          }
          return null;
      }
      provideViewFor(subject) {
          if (!subject) {
              return null;
          }
          if ('lockScope' in subject) { // IView
              return subject;
          }
          if ('createView' in subject) { // RenderPlan
              return subject.createView(this.renderingEngine, this.renderable.$context);
          }
          if ('create' in subject) { // IViewFactory
              return subject.create();
          }
          if ('template' in subject) { // Raw Template Definition
              return this.renderingEngine.getViewFactory(this.dom, subject, this.renderable.$context).create();
          }
          // Constructable (Custom Element Constructor)
          return createElement(this.dom, subject, this.properties, this.$projector.children).createView(this.renderingEngine, this.renderable.$context);
      }
  }
  Compose.inject = [runtime.IDOM, runtime.IRenderable, runtime.ITargetedInstruction, runtime.IRenderingEngine, runtime.CompositionCoordinator];
  __decorate([
      runtime.bindable
  ], Compose.prototype, "subject", void 0);
  __decorate([
      runtime.bindable
  ], Compose.prototype, "composing", void 0);
  runtime.CustomElementResource.define(composeSource, Compose);

  function isRenderLocation(node) {
      return node.textContent === 'au-end';
  }
  class HTMLDOM {
      constructor(doc) {
          this.doc = doc;
      }
      addEventListener(eventName, subscriber, publisher, options) {
          (publisher || this.doc).addEventListener(eventName, subscriber, options);
      }
      appendChild(parent, child) {
          parent.appendChild(child);
      }
      cloneNode(node, deep) {
          return node.cloneNode(deep !== false);
      }
      convertToRenderLocation(node) {
          if (this.isRenderLocation(node)) {
              return node; // it's already a IRenderLocation (converted by FragmentNodeSequence)
          }
          if (node.parentNode === null) {
              throw kernel.Reporter.error(52);
          }
          const locationEnd = this.doc.createComment('au-end');
          const locationStart = this.doc.createComment('au-start');
          node.parentNode.replaceChild(locationEnd, node);
          locationEnd.parentNode.insertBefore(locationStart, locationEnd);
          locationEnd.$start = locationStart;
          locationStart.$nodes = null;
          return locationEnd;
      }
      createDocumentFragment(markupOrNode) {
          if (markupOrNode === undefined || markupOrNode === null) {
              return this.doc.createDocumentFragment();
          }
          if (this.isNodeInstance(markupOrNode)) {
              if (markupOrNode.content !== undefined) {
                  return markupOrNode.content;
              }
              const fragment = this.doc.createDocumentFragment();
              fragment.appendChild(markupOrNode);
              return fragment;
          }
          return this.createTemplate(markupOrNode).content;
      }
      createElement(name) {
          return this.doc.createElement(name);
      }
      createTemplate(markup) {
          if (markup === undefined || markup === null) {
              return this.doc.createElement('template');
          }
          const template = this.doc.createElement('template');
          template.innerHTML = markup.toString();
          return template;
      }
      createTextNode(text) {
          return this.doc.createTextNode(text);
      }
      insertBefore(nodeToInsert, referenceNode) {
          referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
      }
      isMarker(node) {
          return node.nodeName === 'AU-M';
      }
      isNodeInstance(potentialNode) {
          return potentialNode.nodeType > 0;
      }
      isRenderLocation(node) {
          return node.textContent === 'au-end';
      }
      makeTarget(node) {
          node.className = 'au';
      }
      registerElementResolver(container, resolver) {
          container.registerResolver(runtime.INode, resolver);
          container.registerResolver(Node, resolver);
          container.registerResolver(Element, resolver);
          container.registerResolver(HTMLElement, resolver);
          container.registerResolver(SVGElement, resolver);
      }
      remove(node) {
          if (node.remove) {
              node.remove();
          }
          else {
              node.parentNode.removeChild(node);
          }
      }
      removeEventListener(eventName, subscriber, publisher, options) {
          (publisher || this.doc).removeEventListener(eventName, subscriber, options);
      }
      setAttribute(node, name, value) {
          node.setAttribute(name, value);
      }
  }
  /**
   * A specialized INodeSequence with optimizations for text (interpolation) bindings
   * The contract of this INodeSequence is:
   * - the previous element is an `au-m` node
   * - text is the actual text node
   */
  /** @internal */
  class TextNodeSequence {
      constructor(dom, text) {
          this.dom = dom;
          this.firstChild = text;
          this.lastChild = text;
          this.childNodes = [text];
          this.targets = [new AuMarker(text)];
      }
      findTargets() {
          return this.targets;
      }
      insertBefore(refNode) {
          refNode.parentNode.insertBefore(this.firstChild, refNode);
      }
      appendTo(parent) {
          parent.appendChild(this.firstChild);
      }
      remove() {
          this.firstChild.remove();
      }
  }
  // tslint:enable:no-any
  // This is the most common form of INodeSequence.
  // Every custom element or template controller whose node sequence is based on an HTML template
  // has an instance of this under the hood. Anyone who wants to create a node sequence from
  // a string of markup would also receive an instance of this.
  // CompiledTemplates create instances of FragmentNodeSequence.
  /** @internal */
  class FragmentNodeSequence {
      constructor(dom, fragment) {
          this.dom = dom;
          this.fragment = fragment;
          // tslint:disable-next-line:no-any
          const targetNodeList = fragment.querySelectorAll('.au');
          let i = 0;
          let ii = targetNodeList.length;
          const targets = this.targets = Array(ii);
          while (i < ii) {
              // eagerly convert all markers to RenderLocations (otherwise the renderer
              // will do it anyway) and store them in the target list (since the comments
              // can't be queried)
              const target = targetNodeList[i];
              if (target.nodeName === 'AU-M') {
                  // note the renderer will still call this method, but it will just return the
                  // location if it sees it's already a location
                  targets[i] = this.dom.convertToRenderLocation(target);
              }
              else {
                  // also store non-markers for consistent ordering
                  targets[i] = target;
              }
              ++i;
          }
          const childNodeList = fragment.childNodes;
          i = 0;
          ii = childNodeList.length;
          const childNodes = this.childNodes = Array(ii);
          while (i < ii) {
              childNodes[i] = childNodeList[i];
              ++i;
          }
          this.firstChild = fragment.firstChild;
          this.lastChild = fragment.lastChild;
          this.start = this.end = null;
      }
      findTargets() {
          return this.targets;
      }
      insertBefore(refNode) {
          // tslint:disable-next-line:no-any
          refNode.parentNode.insertBefore(this.fragment, refNode);
          // internally we could generally assume that this is an IRenderLocation,
          // but since this is also public API we still need to double check
          // (or horrible things might happen)
          if (isRenderLocation(refNode)) {
              this.end = refNode;
              const start = this.start = refNode.$start;
              if (start.$nodes === null) {
                  start.$nodes = this;
              }
              else {
                  // if more than one INodeSequence uses the same IRenderLocation, it's an child
                  // of a repeater (or something similar) and we shouldn't remove all nodes between
                  // start - end since that would always remove all items from a repeater, even
                  // when only one is removed
                  // so we set $nodes to PLATFORM.emptyObject to 1) tell other sequences that it's
                  // occupied and 2) prevent start.$nodes === this from ever evaluating to true
                  // during remove()
                  start.$nodes = kernel.PLATFORM.emptyObject;
              }
          }
      }
      appendTo(parent) {
          // tslint:disable-next-line:no-any
          parent.appendChild(this.fragment);
          // this can never be a IRenderLocation, and if for whatever reason we moved
          // from a IRenderLocation to a host, make sure "start" and "end" are null
          this.start = this.end = null;
      }
      remove() {
          const fragment = this.fragment;
          if (this.start !== null && this.start.$nodes === this) {
              // if we're between a valid "start" and "end" (e.g. if/else, containerless, or a
              // repeater with a single item) then simply remove everything in-between (but not
              // the comments themselves as they belong to the parent)
              const end = this.end;
              let next;
              let current = this.start.nextSibling;
              while (current !== end) {
                  next = current.nextSibling;
                  // tslint:disable-next-line:no-any
                  fragment.appendChild(current);
                  current = next;
              }
              this.start.$nodes = null;
              this.start = this.end = null;
          }
          else {
              // otherwise just remove from first to last child in the regular way
              let current = this.firstChild;
              if (current.parentNode !== fragment) {
                  const end = this.lastChild;
                  let next;
                  while (current !== null) {
                      next = current.nextSibling;
                      // tslint:disable-next-line:no-any
                      fragment.appendChild(current);
                      if (current === end) {
                          break;
                      }
                      current = next;
                  }
              }
          }
      }
  }
  /** @internal */
  class NodeSequenceFactory {
      constructor(dom, markupOrNode) {
          this.dom = dom;
          const fragment = dom.createDocumentFragment(markupOrNode);
          const childNodes = fragment.childNodes;
          switch (childNodes.length) {
              case 0:
                  this.createNodeSequence = () => runtime.NodeSequence.empty;
                  return;
              case 2:
                  const target = childNodes[0];
                  if (target.nodeName === 'AU-M' || target.nodeName === '#comment') {
                      const text = childNodes[1];
                      if (text.nodeType === 3 /* Text */ && text.textContent.length === 0) {
                          this.deepClone = false;
                          this.node = text;
                          this.Type = TextNodeSequence;
                          return;
                      }
                  }
              // falls through if not returned
              default:
                  this.deepClone = true;
                  this.node = fragment;
                  this.Type = FragmentNodeSequence;
          }
      }
      createNodeSequence() {
          return new this.Type(this.dom, this.node.cloneNode(this.deepClone));
      }
  }
  /** @internal */
  class AuMarker {
      get parentNode() {
          return this.nextSibling.parentNode;
      }
      constructor(next) {
          this.nextSibling = next;
          this.textContent = '';
      }
      remove() { }
  }
  (proto => {
      proto.previousSibling = null;
      proto.childNodes = kernel.PLATFORM.emptyArray;
      proto.nodeName = 'AU-M';
      proto.nodeType = 1 /* Element */;
  })(AuMarker.prototype);
  /** @internal */
  class HTMLDOMInitializer {
      constructor(container) {
          this.container = container;
      }
      /**
       * Either create a new HTML `DOM` backed by the supplied `document` or uses the supplied `DOM` directly.
       *
       * If no argument is provided, uses the default global `document` variable.
       * (this will throw an error in non-browser environments).
       */
      initialize(config) {
          if (this.container.has(runtime.IDOM, false)) {
              return this.container.get(runtime.IDOM);
          }
          let dom;
          if (config !== undefined) {
              if (config.dom !== undefined) {
                  dom = config.dom;
              }
              else if (config.host.ownerDocument !== null) {
                  dom = new HTMLDOM(config.host.ownerDocument);
              }
              else {
                  dom = new HTMLDOM(document);
              }
          }
          else {
              dom = new HTMLDOM(document);
          }
          kernel.Registration.instance(runtime.IDOM, dom).register(this.container, runtime.IDOM);
          return dom;
      }
  }
  HTMLDOMInitializer.inject = [kernel.IContainer];
  /** @internal */
  class HTMLTemplateFactory {
      constructor(dom) {
          this.dom = dom;
      }
      create(parentRenderContext, definition) {
          return new runtime.CompiledTemplate(this.dom, definition, new NodeSequenceFactory(this.dom, definition.template), parentRenderContext);
      }
  }
  HTMLTemplateFactory.inject = [runtime.IDOM];

  let TextBindingRenderer = 
  /** @internal */
  class TextBindingRenderer {
      constructor(parser, observerLocator) {
          this.parser = parser;
          this.observerLocator = observerLocator;
      }
      render(dom, context, renderable, target, instruction) {
          const next = target.nextSibling;
          if (dom.isMarker(target)) {
              dom.remove(target);
          }
          let bindable;
          const expr = runtime.ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
          if (expr.isMulti) {
              bindable = new runtime.MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', runtime.BindingMode.toView, context);
          }
          else {
              bindable = new runtime.InterpolationBinding(expr.firstExpression, expr, next, 'textContent', runtime.BindingMode.toView, this.observerLocator, context, true);
          }
          runtime.addBindable(renderable, bindable);
      }
  };
  TextBindingRenderer.inject = [runtime.IExpressionParser, runtime.IObserverLocator];
  TextBindingRenderer = __decorate([
      runtime.instructionRenderer("ha" /* textBinding */)
      /** @internal */
  ], TextBindingRenderer);
  let ListenerBindingRenderer = 
  /** @internal */
  class ListenerBindingRenderer {
      constructor(parser, eventManager) {
          this.parser = parser;
          this.eventManager = eventManager;
      }
      render(dom, context, renderable, target, instruction) {
          const expr = runtime.ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
          const bindable = new Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
          runtime.addBindable(renderable, bindable);
      }
  };
  ListenerBindingRenderer.inject = [runtime.IExpressionParser, IEventManager];
  ListenerBindingRenderer = __decorate([
      runtime.instructionRenderer("hb" /* listenerBinding */)
      /** @internal */
  ], ListenerBindingRenderer);
  let SetAttributeRenderer = 
  /** @internal */
  class SetAttributeRenderer {
      render(dom, context, renderable, target, instruction) {
          target.setAttribute(instruction.to, instruction.value);
      }
  };
  SetAttributeRenderer = __decorate([
      runtime.instructionRenderer("hd" /* setAttribute */)
      /** @internal */
  ], SetAttributeRenderer);
  let StylePropertyBindingRenderer = 
  /** @internal */
  class StylePropertyBindingRenderer {
      constructor(parser, observerLocator) {
          this.parser = parser;
          this.observerLocator = observerLocator;
      }
      render(dom, context, renderable, target, instruction) {
          const expr = runtime.ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime.BindingMode.toView);
          const bindable = new runtime.Binding(expr, target.style, instruction.to, runtime.BindingMode.toView, this.observerLocator, context);
          runtime.addBindable(renderable, bindable);
      }
  };
  StylePropertyBindingRenderer.inject = [runtime.IExpressionParser, runtime.IObserverLocator];
  StylePropertyBindingRenderer = __decorate([
      runtime.instructionRenderer("hc" /* stylePropertyBinding */)
      /** @internal */
  ], StylePropertyBindingRenderer);
  const HTMLRenderer = {
      register(container) {
          container.register(TextBindingRenderer, ListenerBindingRenderer, SetAttributeRenderer, StylePropertyBindingRenderer);
      }
  };

  const defaultShadowOptions = {
      mode: 'open'
  };
  class HTMLProjectorLocator {
      getElementProjector(dom, $component, host, def) {
          if (def.shadowOptions || def.hasSlots) {
              if (def.containerless) {
                  throw kernel.Reporter.error(21);
              }
              return new ShadowDOMProjector($component, host, def);
          }
          if (def.containerless) {
              return new ContainerlessProjector(dom, $component, host);
          }
          return new HostProjector($component, host);
      }
  }
  const childObserverOptions$1 = { childList: true };
  /** @internal */
  class ShadowDOMProjector {
      constructor($customElement, host, definition) {
          this.host = host;
          let shadowOptions;
          if (definition.shadowOptions !== undefined &&
              definition.shadowOptions !== null &&
              typeof definition.shadowOptions === 'object' &&
              'mode' in definition.shadowOptions) {
              shadowOptions = definition.shadowOptions;
          }
          else {
              shadowOptions = defaultShadowOptions;
          }
          this.shadowRoot = host.attachShadow(shadowOptions);
          this.host.$customElement = $customElement;
          this.shadowRoot.$customElement = $customElement;
      }
      get children() {
          return this.shadowRoot.childNodes;
      }
      subscribeToChildrenChange(callback) {
          // TODO: add a way to dispose/disconnect
          const observer = new MutationObserver(callback);
          observer.observe(this.shadowRoot, childObserverOptions$1);
      }
      provideEncapsulationSource() {
          return this.shadowRoot;
      }
      project(nodes) {
          nodes.appendTo(this.shadowRoot);
      }
      take(nodes) {
          nodes.remove();
      }
  }
  /** @internal */
  class ContainerlessProjector {
      constructor(dom, $customElement, host) {
          if (host.childNodes.length) {
              this.childNodes = kernel.PLATFORM.toArray(host.childNodes);
          }
          else {
              this.childNodes = kernel.PLATFORM.emptyArray;
          }
          this.host = dom.convertToRenderLocation(host);
          this.host.$customElement = $customElement;
      }
      get children() {
          return this.childNodes;
      }
      subscribeToChildrenChange(callback) {
          // TODO: add a way to dispose/disconnect
          const observer = new MutationObserver(callback);
          observer.observe(this.host, childObserverOptions$1);
      }
      provideEncapsulationSource() {
          return this.host.getRootNode();
      }
      project(nodes) {
          nodes.insertBefore(this.host);
      }
      take(nodes) {
          nodes.remove();
      }
  }
  /** @internal */
  class HostProjector {
      constructor($customElement, host) {
          this.host = host;
          this.host.$customElement = $customElement;
      }
      get children() {
          return this.host.childNodes;
      }
      subscribeToChildrenChange(callback) {
          // Do nothing since this scenario will never have children.
      }
      provideEncapsulationSource() {
          return this.host.getRootNode();
      }
      project(nodes) {
          nodes.appendTo(this.host);
      }
      take(nodes) {
          nodes.remove();
      }
  }

  const HTMLRuntimeResources = [
      AttrBindingBehavior,
      SelfBindingBehavior,
      UpdateTriggerBindingBehavior,
      Compose
  ];
  const HTMLRuntimeConfiguration = {
      register(container) {
          container.register(...HTMLRuntimeResources, runtime.RuntimeConfiguration, HTMLRenderer, kernel.Registration.singleton(runtime.IDOMInitializer, HTMLDOMInitializer), kernel.Registration.singleton(runtime.IProjectorLocator, HTMLProjectorLocator), kernel.Registration.singleton(runtime.ITargetAccessorLocator, TargetAccessorLocator), kernel.Registration.singleton(runtime.ITargetObserverLocator, TargetObserverLocator), kernel.Registration.singleton(runtime.ITemplateFactory, HTMLTemplateFactory));
      },
      createContainer() {
          const container = kernel.DI.createContainer();
          container.register(HTMLRuntimeConfiguration);
          return container;
      }
  };

  exports.Listener = Listener;
  exports.ListenerTracker = ListenerTracker;
  exports.DelegateOrCaptureSubscription = DelegateOrCaptureSubscription;
  exports.TriggerSubscription = TriggerSubscription;
  exports.IEventManager = IEventManager;
  exports.EventSubscriber = EventSubscriber;
  exports.TargetAccessorLocator = TargetAccessorLocator;
  exports.TargetObserverLocator = TargetObserverLocator;
  exports.ISVGAnalyzer = ISVGAnalyzer;
  exports.AttrBindingBehavior = AttrBindingBehavior;
  exports.SelfBindingBehavior = SelfBindingBehavior;
  exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;
  exports.Compose = Compose;
  exports.HTMLRuntimeConfiguration = HTMLRuntimeConfiguration;
  exports.createElement = createElement;
  exports.RenderPlan = RenderPlan;
  exports.isHTMLTargetedInstruction = isHTMLTargetedInstruction;
  exports.HTMLDOM = HTMLDOM;
  exports.HTMLRenderer = HTMLRenderer;
  exports.CaptureBindingInstruction = CaptureBindingInstruction;
  exports.DelegateBindingInstruction = DelegateBindingInstruction;
  exports.SetAttributeInstruction = SetAttributeInstruction;
  exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;
  exports.TextBindingInstruction = TextBindingInstruction;
  exports.TriggerBindingInstruction = TriggerBindingInstruction;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
