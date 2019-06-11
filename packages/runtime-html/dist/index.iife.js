this.au = this.au || {};
this.au.runtimeHtml = (function (exports, kernel, runtime) {
  'use strict';

  const slice = Array.prototype.slice;
  /**
   * Listener binding. Handle event binding between view and view model
   */
  class Listener {
      // tslint:disable-next-line:parameters-max-number
      constructor(dom, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
          this.dom = dom;
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
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('Listener', 'callSource', slice.call(arguments));
          }
          const overrideContext = this.$scope.overrideContext;
          overrideContext.$event = event;
          const result = this.sourceExpression.evaluate(2097152 /* mustEvaluate */, this.$scope, this.locator);
          Reflect.deleteProperty(overrideContext, '$event');
          if (result !== true && this.preventDefault) {
              event.preventDefault();
          }
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
          return result;
      }
      handleEvent(event) {
          this.callSource(event);
      }
      $bind(flags, scope) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('Listener', '$bind', slice.call(arguments));
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
          const sourceExpression = this.sourceExpression;
          if (runtime.hasBind(sourceExpression)) {
              sourceExpression.bind(flags, scope, this);
          }
          this.handler = this.eventManager.addEventListener(this.dom, this.target, this.targetEvent, this, this.delegationStrategy);
          // add isBound flag and remove isBinding flag
          this.$state |= 4 /* isBound */;
          this.$state &= ~1 /* isBinding */;
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      $unbind(flags) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('Listener', '$unbind', slice.call(arguments));
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
          if (runtime.hasUnbind(sourceExpression)) {
              sourceExpression.unbind(flags, this.$scope, this);
          }
          this.$scope = null;
          this.handler.dispose();
          this.handler = null;
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

  /**
   * Observer for handling two-way binding with attributes
   * Has different strategy for class/style and normal attributes
   * TODO: handle SVG/attributes with namespace
   */
  let AttributeObserver = class AttributeObserver {
      constructor(lifecycle, observerLocator, element, propertyKey, targetAttribute) {
          this.observerLocator = observerLocator;
          this.lifecycle = lifecycle;
          this.obj = element;
          this.propertyKey = propertyKey;
          this.targetAttribute = targetAttribute;
          this.currentValue = null;
          this.oldValue = null;
          this.hasChanges = false;
          this.priority = 12288 /* propagate */;
      }
      getValue() {
          return this.currentValue;
      }
      setValue(newValue, flags) {
          this.currentValue = newValue;
          this.hasChanges = newValue !== this.oldValue;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.flushRAF(flags);
          }
      }
      flushRAF(flags) {
          if (this.hasChanges) {
              this.hasChanges = false;
              const { currentValue } = this;
              this.oldValue = currentValue;
              switch (this.targetAttribute) {
                  case 'class': {
                      // Why is class attribute observer setValue look different with class attribute accessor?
                      // ==============
                      // For class list
                      // newValue is simply checked if truthy or falsy
                      // and toggle the class accordingly
                      // -- the rule of this is quite different to normal attribute
                      //
                      // for class attribute, observer is different in a way that it only observe a particular class at a time
                      // this also comes from syntax, where it would typically be my-class.class="someProperty"
                      //
                      // so there is no need for separating class by space and add all of them like class accessor
                      if (!!currentValue) {
                          this.obj.classList.add(this.propertyKey);
                      }
                      else {
                          this.obj.classList.remove(this.propertyKey);
                      }
                      break;
                  }
                  case 'style': {
                      let priority = '';
                      let newValue = currentValue;
                      if (typeof newValue === 'string' && newValue.includes('!important')) {
                          priority = 'important';
                          newValue = newValue.replace('!important', '');
                      }
                      this.obj.style.setProperty(this.propertyKey, newValue, priority);
                  }
              }
          }
      }
      handleMutation(mutationRecords) {
          let shouldProcess = false;
          for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
              const record = mutationRecords[i];
              if (record.type === 'attributes' && record.attributeName === this.propertyKey) {
                  shouldProcess = true;
                  break;
              }
          }
          if (shouldProcess) {
              let newValue;
              switch (this.targetAttribute) {
                  case 'class':
                      newValue = this.obj.classList.contains(this.propertyKey);
                      break;
                  case 'style':
                      newValue = this.obj.style.getPropertyValue(this.propertyKey);
                      break;
                  default:
                      throw new Error(`Unsupported targetAttribute: ${this.targetAttribute}`);
              }
              if (newValue !== this.currentValue) {
                  const { currentValue } = this;
                  this.currentValue = this.oldValue = newValue;
                  this.hasChanges = false;
                  this.callSubscribers(newValue, currentValue, 131072 /* fromDOMEvent */);
              }
          }
      }
      subscribe(subscriber) {
          if (!this.hasSubscribers()) {
              this.currentValue = this.oldValue = this.obj.getAttribute(this.propertyKey);
              startObservation(this.obj, this);
          }
          this.addSubscriber(subscriber);
      }
      unsubscribe(subscriber) {
          this.removeSubscriber(subscriber);
          if (!this.hasSubscribers()) {
              stopObservation(this.obj, this);
          }
      }
      bind(flags) {
          this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
      }
      unbind(flags) {
          this.lifecycle.dequeueRAF(this.flushRAF, this);
      }
  };
  AttributeObserver = __decorate([
      runtime.subscriberCollection()
  ], AttributeObserver);
  const startObservation = (element, subscription) => {
      if (element.$eMObservers === undefined) {
          element.$eMObservers = new Set();
      }
      if (element.$mObserver === undefined) {
          element.$mObserver = runtime.DOM.createNodeObserver(element, 
          // @ts-ignore
          handleMutation, { attributes: true });
      }
      element.$eMObservers.add(subscription);
  };
  const stopObservation = (element, subscription) => {
      const $eMObservers = element.$eMObservers;
      if ($eMObservers.delete(subscription)) {
          if ($eMObservers.size === 0) {
              element.$mObserver.disconnect();
              element.$mObserver = undefined;
          }
          return true;
      }
      return false;
  };
  const handleMutation = (mutationRecords) => {
      mutationRecords[0].target.$eMObservers.forEach(invokeHandleMutation, mutationRecords);
  };
  function invokeHandleMutation(s) {
      s.handleMutation(this);
  }

  const slice$1 = Array.prototype.slice;
  // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
  const { oneTime, toView, fromView } = runtime.BindingMode;
  // pre-combining flags for bitwise checks is a minor perf tweak
  const toViewOrOneTime = toView | oneTime;
  /**
   * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
   */
  exports.AttributeBinding = class AttributeBinding {
      constructor(sourceExpression, target, 
      // some attributes may have inner structure
      // such as class -> collection of class names
      // such as style -> collection of style rules
      //
      // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
      targetAttribute, targetKey, mode, observerLocator, locator) {
          runtime.connectable.assignIdTo(this);
          this.$state = 0 /* none */;
          this.$lifecycle = locator.get(runtime.ILifecycle);
          this.$scope = null;
          this.locator = locator;
          this.mode = mode;
          this.observerLocator = observerLocator;
          this.sourceExpression = sourceExpression;
          this.target = target;
          this.targetAttribute = targetAttribute;
          this.targetProperty = targetKey;
          this.persistentFlags = 0 /* none */;
      }
      updateTarget(value, flags) {
          flags |= this.persistentFlags;
          this.targetObserver.setValue(value, flags | 16 /* updateTargetInstance */);
      }
      updateSource(value, flags) {
          flags |= this.persistentFlags;
          this.sourceExpression.assign(flags | 32 /* updateSourceExpression */, this.$scope, this.locator, value);
      }
      handleChange(newValue, _previousValue, flags) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('Binding', 'handleChange', slice$1.call(arguments));
          }
          if (!(this.$state & 4 /* isBound */)) {
              if (kernel.Tracer.enabled) {
                  kernel.Tracer.leave();
              }
              return;
          }
          flags |= this.persistentFlags;
          if (this.mode === runtime.BindingMode.fromView) {
              flags &= ~16 /* updateTargetInstance */;
              flags |= 32 /* updateSourceExpression */;
          }
          if (flags & 16 /* updateTargetInstance */) {
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
          if (flags & 32 /* updateSourceExpression */) {
              if (newValue !== this.sourceExpression.evaluate(flags, this.$scope, this.locator)) {
                  this.updateSource(newValue, flags);
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
              kernel.Tracer.enter('Binding', '$bind', slice$1.call(arguments));
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
          if (runtime.hasBind(sourceExpression)) {
              sourceExpression.bind(flags, scope, this);
          }
          let targetObserver = this.targetObserver;
          if (!targetObserver) {
              targetObserver = this.targetObserver = new AttributeObserver(this.$lifecycle, this.observerLocator, this.target, this.targetProperty, this.targetAttribute);
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
              targetObserver[this.id] |= 32 /* updateSourceExpression */;
              targetObserver.subscribe(this);
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
              kernel.Tracer.enter('Binding', '$unbind', slice$1.call(arguments));
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
          if (runtime.hasUnbind(this.sourceExpression)) {
              this.sourceExpression.unbind(flags, this.$scope, this);
          }
          this.$scope = null;
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
      connect(flags) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('Binding', 'connect', slice$1.call(arguments));
          }
          if (this.$state & 4 /* isBound */) {
              flags |= this.persistentFlags;
              this.sourceExpression.connect(flags | 2097152 /* mustEvaluate */, this.$scope, this);
          }
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
  };
  exports.AttributeBinding = __decorate([
      runtime.connectable()
  ], exports.AttributeBinding);

  class AttributeNSAccessor {
      constructor(lifecycle, obj, propertyKey, namespace) {
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.propertyKey = propertyKey;
          this.currentValue = null;
          this.oldValue = null;
          this.namespace = namespace;
          this.hasChanges = false;
          this.priority = 12288 /* propagate */;
      }
      getValue() {
          return this.currentValue;
      }
      setValue(newValue, flags) {
          this.currentValue = newValue;
          this.hasChanges = newValue !== this.oldValue;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.flushRAF(flags);
          }
      }
      flushRAF(flags) {
          if (this.hasChanges) {
              this.hasChanges = false;
              const { currentValue } = this;
              this.oldValue = currentValue;
              if (currentValue == void 0) {
                  this.obj.removeAttributeNS(this.namespace, this.propertyKey);
              }
              else {
                  this.obj.setAttributeNS(this.namespace, this.propertyKey, currentValue);
              }
          }
      }
      bind(flags) {
          this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
          this.currentValue = this.oldValue = this.obj.getAttributeNS(this.namespace, this.propertyKey);
      }
      unbind(flags) {
          this.lifecycle.dequeueRAF(this.flushRAF, this);
      }
  }

  function defaultMatcher(a, b) {
      return a === b;
  }
  exports.CheckedObserver = class CheckedObserver {
      constructor(lifecycle, observerLocator, handler, obj) {
          this.lifecycle = lifecycle;
          this.observerLocator = observerLocator;
          this.handler = handler;
          this.obj = obj;
          this.currentValue = void 0;
          this.oldValue = void 0;
          this.hasChanges = false;
          this.priority = 12288 /* propagate */;
          this.arrayObserver = void 0;
          this.valueObserver = void 0;
      }
      getValue() {
          return this.currentValue;
      }
      setValue(newValue, flags) {
          this.currentValue = newValue;
          this.hasChanges = newValue !== this.oldValue;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.flushRAF(flags);
          }
      }
      flushRAF(flags) {
          if (this.hasChanges) {
              this.hasChanges = false;
              const { currentValue } = this;
              this.oldValue = currentValue;
              if (this.valueObserver === void 0) {
                  if (this.obj.$observers !== void 0) {
                      if (this.obj.$observers.model !== void 0) {
                          this.valueObserver = this.obj.$observers.model;
                      }
                      else if (this.obj.$observers.value !== void 0) {
                          this.valueObserver = this.obj.$observers.value;
                      }
                  }
                  if (this.valueObserver !== void 0) {
                      this.valueObserver.subscribe(this);
                  }
              }
              if (this.arrayObserver !== void 0) {
                  this.arrayObserver.unsubscribeFromCollection(this);
                  this.arrayObserver = void 0;
              }
              if (this.obj.type === 'checkbox' && Array.isArray(currentValue)) {
                  this.arrayObserver = this.observerLocator.getArrayObserver(flags, currentValue);
                  this.arrayObserver.subscribeToCollection(this);
              }
              this.synchronizeElement();
          }
      }
      handleCollectionChange(indexMap, flags) {
          const { currentValue, oldValue } = this;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.oldValue = currentValue;
              this.synchronizeElement();
          }
          else {
              this.hasChanges = true;
          }
          this.callSubscribers(currentValue, oldValue, flags);
      }
      handleChange(newValue, previousValue, flags) {
          if ((flags & 4096 /* fromBind */) > 0) {
              this.synchronizeElement();
          }
          else {
              this.hasChanges = true;
          }
          this.callSubscribers(newValue, previousValue, flags);
      }
      synchronizeElement() {
          const { currentValue, obj } = this;
          const elementValue = obj.hasOwnProperty('model') ? obj.model : obj.value;
          const isRadio = obj.type === 'radio';
          const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;
          if (isRadio) {
              obj.checked = !!matcher(currentValue, elementValue);
          }
          else if (currentValue === true) {
              obj.checked = true;
          }
          else if (Array.isArray(currentValue)) {
              obj.checked = currentValue.findIndex(item => !!matcher(item, elementValue)) !== -1;
          }
          else {
              obj.checked = false;
          }
      }
      handleEvent() {
          this.oldValue = this.currentValue;
          let { currentValue } = this;
          const { obj } = this;
          const elementValue = obj.hasOwnProperty('model') ? obj.model : obj.value;
          let index;
          const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;
          if (obj.type === 'checkbox') {
              if (Array.isArray(currentValue)) {
                  index = currentValue.findIndex(item => !!matcher(item, elementValue));
                  if (obj.checked && index === -1) {
                      currentValue.push(elementValue);
                  }
                  else if (!obj.checked && index !== -1) {
                      currentValue.splice(index, 1);
                  }
                  // when existing currentValue is array, do not invoke callback as only the array obj has changed
                  return;
              }
              currentValue = obj.checked;
          }
          else if (obj.checked) {
              currentValue = elementValue;
          }
          else {
              return;
          }
          this.currentValue = currentValue;
          this.callSubscribers(this.currentValue, this.oldValue, 131072 /* fromDOMEvent */ | 524288 /* allowPublishRoundtrip */);
      }
      bind(flags) {
          this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
          this.currentValue = this.obj.checked;
      }
      unbind(flags) {
          if (this.arrayObserver !== void 0) {
              this.arrayObserver.unsubscribeFromCollection(this);
              this.arrayObserver = void 0;
          }
          if (this.valueObserver !== void 0) {
              this.valueObserver.unsubscribe(this);
          }
          this.lifecycle.dequeueRAF(this.flushRAF, this);
      }
      subscribe(subscriber) {
          if (!this.hasSubscribers()) {
              this.handler.subscribe(this.obj, this);
          }
          this.addSubscriber(subscriber);
      }
      unsubscribe(subscriber) {
          this.removeSubscriber(subscriber);
          if (!this.hasSubscribers()) {
              this.handler.dispose();
          }
      }
  };
  exports.CheckedObserver = __decorate([
      runtime.subscriberCollection()
  ], exports.CheckedObserver);

  class ClassAttributeAccessor {
      constructor(lifecycle, obj) {
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.currentValue = '';
          this.oldValue = '';
          this.doNotCache = true;
          this.nameIndex = {};
          this.version = 0;
          this.isActive = false;
          this.hasChanges = false;
          this.priority = 12288 /* propagate */;
      }
      getValue() {
          return this.currentValue;
      }
      setValue(newValue, flags) {
          this.currentValue = newValue;
          this.hasChanges = newValue !== this.oldValue;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.flushRAF(flags);
          }
      }
      flushRAF(flags) {
          if (this.hasChanges) {
              this.hasChanges = false;
              const { currentValue, nameIndex } = this;
              let { version } = this;
              this.oldValue = currentValue;
              let names;
              let name;
              // Add the classes, tracking the version at which they were added.
              if (currentValue.length) {
                  const node = this.obj;
                  names = currentValue.split(/\s+/);
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
      }
      bind(flags) {
          this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
      }
      unbind(flags) {
          this.lifecycle.dequeueRAF(this.flushRAF, this);
      }
  }

  class DataAttributeAccessor {
      constructor(lifecycle, obj, propertyKey) {
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.propertyKey = propertyKey;
          this.currentValue = null;
          this.oldValue = null;
          this.hasChanges = false;
          this.priority = 12288 /* propagate */;
      }
      getValue() {
          return this.currentValue;
      }
      setValue(newValue, flags) {
          this.currentValue = newValue;
          this.hasChanges = newValue !== this.oldValue;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.flushRAF(flags);
          }
      }
      flushRAF(flags) {
          if (this.hasChanges) {
              this.hasChanges = false;
              const { currentValue } = this;
              this.oldValue = currentValue;
              if (currentValue == void 0) {
                  this.obj.removeAttribute(this.propertyKey);
              }
              else {
                  this.obj.setAttribute(this.propertyKey, currentValue);
              }
          }
      }
      bind(flags) {
          this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
          this.currentValue = this.oldValue = this.obj.getAttribute(this.propertyKey);
      }
      unbind(flags) {
          this.lifecycle.dequeueRAF(this.flushRAF, this);
      }
  }

  class ElementPropertyAccessor {
      constructor(lifecycle, obj, propertyKey) {
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.propertyKey = propertyKey;
          this.currentValue = void 0;
          this.oldValue = void 0;
          this.hasChanges = false;
          this.priority = 12288 /* propagate */;
      }
      getValue() {
          return this.currentValue;
      }
      setValue(newValue, flags) {
          this.currentValue = newValue;
          this.hasChanges = newValue !== this.oldValue;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.flushRAF(flags);
          }
      }
      flushRAF(flags) {
          if (this.hasChanges) {
              this.hasChanges = false;
              const { currentValue } = this;
              this.oldValue = currentValue;
              this.obj[this.propertyKey] = currentValue;
          }
      }
      bind(flags) {
          this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
          this.currentValue = this.oldValue = this.obj[this.propertyKey];
      }
      unbind(flags) {
          this.lifecycle.dequeueRAF(this.flushRAF, this);
      }
  }

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
      /*@internal*/
      dispose() {
          if (this.count > 0) {
              this.count = 0;
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
          this.delegatedHandlers = {};
          this.capturedHandlers = {};
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
      dispose() {
          let key;
          const { delegatedHandlers, capturedHandlers } = this;
          for (key in delegatedHandlers) {
              delegatedHandlers[key].dispose();
          }
          for (key in capturedHandlers) {
              capturedHandlers[key].dispose();
          }
      }
  }

  const childObserverOptions = {
      childList: true,
      subtree: true,
      characterData: true
  };
  function defaultMatcher$1(a, b) {
      return a === b;
  }
  exports.SelectValueObserver = class SelectValueObserver {
      constructor(lifecycle, observerLocator, dom, handler, obj) {
          this.lifecycle = lifecycle;
          this.observerLocator = observerLocator;
          this.dom = dom;
          this.obj = obj;
          this.handler = handler;
          this.currentValue = void 0;
          this.oldValue = void 0;
          this.hasChanges = false;
          this.priority = 12288 /* propagate */;
          this.arrayObserver = void 0;
          this.nodeObserver = void 0;
          this.handleNodeChange = this.handleNodeChange.bind(this);
      }
      getValue() {
          return this.currentValue;
      }
      setValue(newValue, flags) {
          this.currentValue = newValue;
          this.hasChanges = newValue !== this.oldValue;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.flushRAF(flags);
          }
      }
      flushRAF(flags) {
          if (this.hasChanges) {
              this.hasChanges = false;
              const { currentValue } = this;
              this.oldValue = currentValue;
              const isArray = Array.isArray(currentValue);
              if (!isArray && currentValue != void 0 && this.obj.multiple) {
                  throw new Error('Only null or Array instances can be bound to a multi-select.');
              }
              if (this.arrayObserver) {
                  this.arrayObserver.unsubscribeFromCollection(this);
                  this.arrayObserver = void 0;
              }
              if (isArray) {
                  this.arrayObserver = this.observerLocator.getArrayObserver(flags, currentValue);
                  this.arrayObserver.subscribeToCollection(this);
              }
              this.synchronizeOptions();
              this.notify(flags);
          }
      }
      handleCollectionChange(indexMap, flags) {
          if ((flags & 4096 /* fromBind */) > 0) {
              this.synchronizeOptions();
          }
          else {
              this.hasChanges = true;
          }
          this.callSubscribers(this.currentValue, this.oldValue, flags);
      }
      handleChange(newValue, previousValue, flags) {
          if ((flags & 4096 /* fromBind */) > 0) {
              this.synchronizeOptions();
          }
          else {
              this.hasChanges = true;
          }
          this.callSubscribers(newValue, previousValue, flags);
      }
      notify(flags) {
          if ((flags & 4096 /* fromBind */) > 0) {
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
              this.callSubscribers(this.currentValue, this.oldValue, 131072 /* fromDOMEvent */ | 524288 /* allowPublishRoundtrip */);
          }
      }
      synchronizeOptions(indexMap) {
          const { currentValue, obj } = this;
          const isArray = Array.isArray(currentValue);
          const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher$1;
          const options = obj.options;
          let i = options.length;
          while (i-- > 0) {
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
      bind() {
          this.nodeObserver = this.dom.createNodeObserver(this.obj, this.handleNodeChange, childObserverOptions);
          this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
      }
      unbind() {
          this.nodeObserver.disconnect();
          this.nodeObserver = null;
          this.lifecycle.dequeueRAF(this.flushRAF, this);
          if (this.arrayObserver) {
              this.arrayObserver.unsubscribeFromCollection(this);
              this.arrayObserver = null;
          }
      }
      handleNodeChange() {
          this.synchronizeOptions();
          const shouldNotify = this.synchronizeValue();
          if (shouldNotify) {
              this.notify(131072 /* fromDOMEvent */);
          }
      }
      subscribe(subscriber) {
          if (!this.hasSubscribers()) {
              this.handler.subscribe(this.obj, this);
          }
          this.addSubscriber(subscriber);
      }
      unsubscribe(subscriber) {
          this.removeSubscriber(subscriber);
          if (!this.hasSubscribers()) {
              this.handler.dispose();
          }
      }
  };
  exports.SelectValueObserver = __decorate([
      runtime.subscriberCollection()
  ], exports.SelectValueObserver);

  class StyleAttributeAccessor {
      constructor(lifecycle, obj) {
          this.lifecycle = lifecycle;
          this.obj = obj;
          this.currentValue = '';
          this.oldValue = '';
          this.styles = {};
          this.version = 0;
          this.hasChanges = false;
          this.priority = 12288 /* propagate */;
      }
      getValue() {
          return this.obj.style.cssText;
      }
      setValue(newValue, flags) {
          this.currentValue = newValue;
          this.hasChanges = newValue !== this.oldValue;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.flushRAF(flags);
          }
      }
      flushRAF(flags) {
          if (this.hasChanges) {
              this.hasChanges = false;
              const { currentValue } = this;
              this.oldValue = currentValue;
              const styles = this.styles;
              let style;
              let version = this.version;
              if (currentValue instanceof Object) {
                  let value;
                  for (style in currentValue) {
                      if (currentValue.hasOwnProperty(style)) {
                          value = currentValue[style];
                          style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
                          styles[style] = version;
                          this.setProperty(style, value);
                      }
                  }
              }
              else if (typeof currentValue === 'string') {
                  const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
                  let pair;
                  while ((pair = rx.exec(currentValue)) != null) {
                      style = pair[1];
                      if (!style) {
                          continue;
                      }
                      styles[style] = version;
                      this.setProperty(style, pair[2]);
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
      }
      setProperty(style, value) {
          let priority = '';
          if (value != null && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
              priority = 'important';
              value = value.replace('!important', '');
          }
          this.obj.style.setProperty(style, value, priority);
      }
      bind(flags) {
          this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
          this.oldValue = this.currentValue = this.obj.style.cssText;
      }
      unbind(flags) {
          this.lifecycle.dequeueRAF(this.flushRAF, this);
      }
  }

  const ISVGAnalyzer = kernel.DI.createInterface('ISVGAnalyzer').withDefault(x => x.singleton(class {
      isStandardSvgAttribute(node, attributeName) {
          return false;
      }
  }));

  // TODO: handle file attribute properly again, etc
  exports.ValueAttributeObserver = class ValueAttributeObserver {
      constructor(lifecycle, handler, obj, propertyKey) {
          this.lifecycle = lifecycle;
          this.handler = handler;
          this.obj = obj;
          this.propertyKey = propertyKey;
          this.currentValue = '';
          this.oldValue = '';
          this.hasChanges = false;
          this.priority = 12288 /* propagate */;
      }
      getValue() {
          return this.currentValue;
      }
      setValue(newValue, flags) {
          this.currentValue = newValue;
          this.hasChanges = newValue !== this.oldValue;
          if ((flags & 4096 /* fromBind */) > 0) {
              this.flushRAF(flags);
          }
      }
      flushRAF(flags) {
          if (this.hasChanges) {
              this.hasChanges = false;
              const { currentValue, oldValue } = this;
              this.oldValue = currentValue;
              if (currentValue == void 0) {
                  this.obj[this.propertyKey] = '';
              }
              else {
                  this.obj[this.propertyKey] = currentValue;
              }
              if ((flags & 4096 /* fromBind */) === 0) {
                  this.callSubscribers(currentValue, oldValue, flags);
              }
          }
      }
      handleEvent() {
          const oldValue = this.oldValue = this.currentValue;
          const currentValue = this.currentValue = this.obj[this.propertyKey];
          if (oldValue !== currentValue) {
              this.oldValue = currentValue;
              this.callSubscribers(currentValue, oldValue, 131072 /* fromDOMEvent */ | 524288 /* allowPublishRoundtrip */);
          }
      }
      subscribe(subscriber) {
          if (!this.hasSubscribers()) {
              this.handler.subscribe(this.obj, this);
              this.currentValue = this.oldValue = this.obj[this.propertyKey];
          }
          this.addSubscriber(subscriber);
      }
      unsubscribe(subscriber) {
          this.removeSubscriber(subscriber);
          if (!this.hasSubscribers()) {
              this.handler.dispose();
          }
      }
      bind(flags) {
          this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
      }
      unbind(flags) {
          this.lifecycle.dequeueRAF(this.flushRAF, this);
      }
  };
  exports.ValueAttributeObserver = __decorate([
      runtime.subscriberCollection()
  ], exports.ValueAttributeObserver);

  const xlinkNS = 'http://www.w3.org/1999/xlink';
  const xmlNS = 'http://www.w3.org/XML/1998/namespace';
  const xmlnsNS = 'http://www.w3.org/2000/xmlns/';
  // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
  const nsAttributes = Object.assign(Object.create(null), {
      'xlink:actuate': ['actuate', xlinkNS],
      'xlink:arcrole': ['arcrole', xlinkNS],
      'xlink:href': ['href', xlinkNS],
      'xlink:role': ['role', xlinkNS],
      'xlink:show': ['show', xlinkNS],
      'xlink:title': ['title', xlinkNS],
      'xlink:type': ['type', xlinkNS],
      'xml:lang': ['lang', xmlNS],
      'xml:space': ['space', xmlNS],
      'xmlns': ['xmlns', xmlnsNS],
      'xmlns:xlink': ['xlink', xmlnsNS],
  });
  const inputEvents = ['change', 'input'];
  const selectEvents = ['change'];
  const contentEvents = ['change', 'input', 'blur', 'keyup', 'paste'];
  const scrollEvents = ['scroll'];
  const overrideProps = Object.assign(Object.create(null), {
      'class': true,
      'style': true,
      'css': true,
      'checked': true,
      'value': true,
      'model': true,
      'xlink:actuate': true,
      'xlink:arcrole': true,
      'xlink:href': true,
      'xlink:role': true,
      'xlink:show': true,
      'xlink:title': true,
      'xlink:type': true,
      'xml:lang': true,
      'xml:space': true,
      'xmlns': true,
      'xmlns:xlink': true,
  });
  class TargetObserverLocator {
      constructor(dom, svgAnalyzer) {
          this.dom = dom;
          this.svgAnalyzer = svgAnalyzer;
      }
      static register(container) {
          return kernel.Registration.singleton(runtime.ITargetObserverLocator, this).register(container);
      }
      getObserver(flags, lifecycle, observerLocator, obj, propertyName) {
          switch (propertyName) {
              case 'checked':
                  return new exports.CheckedObserver(lifecycle, observerLocator, new EventSubscriber(this.dom, inputEvents), obj);
              case 'value':
                  if (obj.tagName === 'SELECT') {
                      return new exports.SelectValueObserver(lifecycle, observerLocator, this.dom, new EventSubscriber(this.dom, selectEvents), obj);
                  }
                  return new exports.ValueAttributeObserver(lifecycle, new EventSubscriber(this.dom, inputEvents), obj, propertyName);
              case 'files':
                  return new exports.ValueAttributeObserver(lifecycle, new EventSubscriber(this.dom, inputEvents), obj, propertyName);
              case 'textContent':
              case 'innerHTML':
                  return new exports.ValueAttributeObserver(lifecycle, new EventSubscriber(this.dom, contentEvents), obj, propertyName);
              case 'scrollTop':
              case 'scrollLeft':
                  return new exports.ValueAttributeObserver(lifecycle, new EventSubscriber(this.dom, scrollEvents), obj, propertyName);
              case 'class':
                  return new ClassAttributeAccessor(lifecycle, obj);
              case 'style':
              case 'css':
                  return new StyleAttributeAccessor(lifecycle, obj);
              case 'model':
                  return new runtime.SetterObserver(lifecycle, flags, obj, propertyName);
              case 'role':
                  return new DataAttributeAccessor(lifecycle, obj, propertyName);
              default:
                  if (nsAttributes[propertyName] !== undefined) {
                      const nsProps = nsAttributes[propertyName];
                      return new AttributeNSAccessor(lifecycle, obj, nsProps[0], nsProps[1]);
                  }
                  if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
                      return new DataAttributeAccessor(lifecycle, obj, propertyName);
                  }
          }
          return null;
      }
      overridesAccessor(flags, obj, propertyName) {
          return overrideProps[propertyName] === true;
      }
      handles(flags, obj) {
          return this.dom.isNodeInstance(obj);
      }
  }
  TargetObserverLocator.inject = [runtime.IDOM, ISVGAnalyzer];
  class TargetAccessorLocator {
      constructor(dom, svgAnalyzer) {
          this.dom = dom;
          this.svgAnalyzer = svgAnalyzer;
      }
      static register(container) {
          return kernel.Registration.singleton(runtime.ITargetAccessorLocator, this).register(container);
      }
      getAccessor(flags, lifecycle, obj, propertyName) {
          switch (propertyName) {
              case 'textContent':
                  // note: this case is just an optimization (textContent is the most often used property)
                  return new ElementPropertyAccessor(lifecycle, obj, propertyName);
              case 'class':
                  return new ClassAttributeAccessor(lifecycle, obj);
              case 'style':
              case 'css':
                  return new StyleAttributeAccessor(lifecycle, obj);
              // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
              // but for now stick to what vCurrent does
              case 'src':
              case 'href':
              // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
              case 'role':
                  return new DataAttributeAccessor(lifecycle, obj, propertyName);
              default:
                  if (nsAttributes[propertyName] !== undefined) {
                      const nsProps = nsAttributes[propertyName];
                      return new AttributeNSAccessor(lifecycle, obj, nsProps[0], nsProps[1]);
                  }
                  if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
                      return new DataAttributeAccessor(lifecycle, obj, propertyName);
                  }
                  return new ElementPropertyAccessor(lifecycle, obj, propertyName);
          }
      }
      handles(flags, obj) {
          return this.dom.isNodeInstance(obj);
      }
  }
  TargetAccessorLocator.inject = [runtime.IDOM, ISVGAnalyzer];
  const IsDataAttribute = {};
  function isDataAttribute(obj, propertyName, svgAnalyzer) {
      if (IsDataAttribute[propertyName] === true) {
          return true;
      }
      const prefix = propertyName.slice(0, 5);
      // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
      // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
      return IsDataAttribute[propertyName] =
          prefix === 'aria-' ||
              prefix === 'data-' ||
              svgAnalyzer.isStandardSvgAttribute(obj, propertyName);
  }

  class AttrBindingBehavior {
      bind(flags, scope, binding) {
          binding.targetObserver = new DataAttributeAccessor(binding.locator.get(runtime.ILifecycle), binding.target, binding.targetProperty);
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
          this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
          // ensure the binding's target observer has been set.
          const targetObserver = this.observerLocator.getObserver(this.persistentFlags | flags, binding.target, binding.targetProperty);
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

  (function (HTMLTargetedInstructionType) {
      HTMLTargetedInstructionType["textBinding"] = "ha";
      HTMLTargetedInstructionType["listenerBinding"] = "hb";
      HTMLTargetedInstructionType["attributeBinding"] = "hc";
      HTMLTargetedInstructionType["stylePropertyBinding"] = "hd";
      HTMLTargetedInstructionType["setAttribute"] = "he";
  })(exports.HTMLTargetedInstructionType || (exports.HTMLTargetedInstructionType = {}));
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
          this.type = "hd" /* stylePropertyBinding */;
          this.from = from;
          this.to = to;
      }
  }
  class SetAttributeInstruction {
      constructor(value, to) {
          this.type = "he" /* setAttribute */;
          this.to = to;
          this.value = value;
      }
  }
  class AttributeBindingInstruction {
      constructor(attr, from, to) {
          this.type = "hc" /* attributeBinding */;
          this.from = from;
          this.attr = attr;
          this.to = to;
      }
  }

  const slice$2 = Array.prototype.slice;
  function createElement(dom, tagOrType, props, children) {
      if (typeof tagOrType === 'string') {
          return createElementForTag(dom, tagOrType, props, children);
      }
      else if (runtime.CustomElementResource.isType(tagOrType)) {
          return createElementForType(dom, tagOrType, props, children);
      }
      else {
          throw new Error(`Invalid tagOrType.`);
      }
  }
  /**
   * RenderPlan. Todo: describe goal of this class
   */
  class RenderPlan {
      constructor(dom, node, instructions, dependencies) {
          this.dom = dom;
          this.dependencies = dependencies;
          this.instructions = instructions;
          this.node = node;
          this.lazyDefinition = void 0;
      }
      get definition() {
          if (this.lazyDefinition === void 0) {
              this.lazyDefinition = runtime.buildTemplateDefinition(null, null, this.node, null, typeof this.node === 'string', null, this.instructions, this.dependencies);
          }
          return this.lazyDefinition;
      }
      getElementTemplate(engine, Type) {
          return engine.getElementTemplate(this.dom, this.definition, void 0, Type);
      }
      createView(flags, engine, parentContext) {
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
      if (kernel.Tracer.enabled) {
          kernel.Tracer.enter('createElement', 'createElementForTag', slice$2.call(arguments));
      }
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
      if (kernel.Tracer.enabled) {
          kernel.Tracer.leave();
      }
      return new RenderPlan(dom, element, allInstructions, dependencies);
  }
  function createElementForType(dom, Type, props, children) {
      if (kernel.Tracer.enabled) {
          kernel.Tracer.enter('createElement', 'createElementForType', slice$2.call(arguments));
      }
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
                  if (bindable !== void 0) {
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
      if (kernel.Tracer.enabled) {
          kernel.Tracer.leave();
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

  const bindables = ['subject', 'composing'];
  class Compose {
      constructor(dom, renderable, instruction, renderingEngine) {
          this.id = kernel.nextId('au$component');
          this.subject = void 0;
          this.composing = false;
          this.dom = dom;
          this.renderable = renderable;
          this.renderingEngine = renderingEngine;
          this.properties = instruction.instructions
              .filter((x) => !bindables.includes(x.to))
              .reduce((acc, item) => {
              if (item.to) {
                  acc[item.to] = item;
              }
              return acc;
          }, {});
          this.task = runtime.LifecycleTask.done;
          this.lastSubject = void 0;
          this.view = void 0;
      }
      static register(container) {
          container.register(kernel.Registration.transient('custom-element:au-compose', this));
          container.register(kernel.Registration.transient(this, this));
      }
      binding(flags) {
          if (this.task.done) {
              this.task = this.compose(this.subject, flags);
          }
          else {
              this.task = new runtime.ContinuationTask(this.task, this.compose, this, this.subject, flags);
          }
          if (this.task.done) {
              this.task = this.bindView(flags);
          }
          else {
              this.task = new runtime.ContinuationTask(this.task, this.bindView, this, flags);
          }
          return this.task;
      }
      attaching(flags) {
          if (this.task.done) {
              this.attachView(flags);
          }
          else {
              this.task = new runtime.ContinuationTask(this.task, this.attachView, this, flags);
          }
      }
      detaching(flags) {
          if (this.view != void 0) {
              if (this.task.done) {
                  this.view.detach(flags);
              }
              else {
                  this.task = new runtime.ContinuationTask(this.task, this.view.detach, this.view, flags);
              }
          }
      }
      unbinding(flags) {
          this.lastSubject = void 0;
          if (this.view != void 0) {
              if (this.task.done) {
                  this.task = this.view.unbind(flags);
              }
              else {
                  this.task = new runtime.ContinuationTask(this.task, this.view.unbind, this.view, flags);
              }
          }
          return this.task;
      }
      caching(flags) {
          this.view = void 0;
      }
      subjectChanged(newValue, previousValue, flags) {
          flags |= this.$controller.flags;
          if (this.task.done) {
              this.task = this.compose(newValue, flags);
          }
          else {
              this.task = new runtime.ContinuationTask(this.task, this.compose, this, newValue, flags);
          }
      }
      compose(subject, flags) {
          if (this.lastSubject === subject) {
              return runtime.LifecycleTask.done;
          }
          this.lastSubject = subject;
          this.composing = true;
          let task = this.deactivate(flags);
          if (subject instanceof Promise) {
              let viewPromise;
              if (task.done) {
                  viewPromise = subject.then(s => this.resolveView(s, flags));
              }
              else {
                  viewPromise = task.wait().then(() => subject.then(s => this.resolveView(s, flags)));
              }
              task = new runtime.PromiseTask(viewPromise, this.activate, this, flags);
          }
          else {
              const view = this.resolveView(subject, flags);
              if (task.done) {
                  task = this.activate(view, flags);
              }
              else {
                  task = new runtime.ContinuationTask(task, this.activate, this, view, flags);
              }
          }
          if (task.done) {
              this.onComposed();
          }
          else {
              task = new runtime.ContinuationTask(task, this.onComposed, this);
          }
          return task;
      }
      deactivate(flags) {
          const view = this.view;
          if (view == void 0) {
              return runtime.LifecycleTask.done;
          }
          view.detach(flags);
          return view.unbind(flags);
      }
      activate(view, flags) {
          this.view = view;
          if (view == void 0) {
              return runtime.LifecycleTask.done;
          }
          let task = this.bindView(flags);
          if (task.done) {
              this.attachView(flags);
          }
          else {
              task = new runtime.ContinuationTask(task, this.attachView, this, flags);
          }
          return task;
      }
      bindView(flags) {
          if (this.view != void 0 && (this.$controller.state & (5 /* isBoundOrBinding */)) > 0) {
              return this.view.bind(flags, this.renderable.scope);
          }
          return runtime.LifecycleTask.done;
      }
      attachView(flags) {
          if (this.view != void 0 && (this.$controller.state & (40 /* isAttachedOrAttaching */)) > 0) {
              this.view.attach(flags);
          }
      }
      onComposed() {
          this.composing = false;
      }
      resolveView(subject, flags) {
          const view = this.provideViewFor(subject, flags);
          if (view) {
              view.hold(this.$controller.projector.host);
              view.lockScope(this.renderable.scope);
              return view;
          }
          return void 0;
      }
      provideViewFor(subject, flags) {
          if (!subject) {
              return void 0;
          }
          if ('lockScope' in subject) { // IController
              return subject;
          }
          if ('createView' in subject) { // RenderPlan
              return subject.createView(flags, this.renderingEngine, this.renderable.context);
          }
          if ('create' in subject) { // IViewFactory
              return subject.create();
          }
          if ('template' in subject) { // Raw Template Definition
              return this.renderingEngine.getViewFactory(this.dom, subject, this.renderable.context).create();
          }
          // Constructable (Custom Element Constructor)
          return createElement(this.dom, subject, this.properties, this.$controller.projector === void 0
              ? kernel.PLATFORM.emptyArray
              : this.$controller.projector.children).createView(flags, this.renderingEngine, this.renderable.context);
      }
  }
  Compose.inject = [runtime.IDOM, runtime.IController, runtime.ITargetedInstruction, runtime.IRenderingEngine];
  Compose.kind = runtime.CustomElementResource;
  Compose.description = Object.freeze({
      name: 'au-compose',
      template: null,
      cache: 0,
      build: Object.freeze({ compiler: 'default', required: false }),
      bindables: Object.freeze({
          subject: runtime.Bindable.for({ bindables: ['subject'] }).get().subject,
          composing: {
              ...runtime.Bindable.for({ bindables: ['composing'] }).get().composing,
              mode: runtime.BindingMode.fromView,
          },
      }),
      instructions: kernel.PLATFORM.emptyArray,
      dependencies: kernel.PLATFORM.emptyArray,
      surrogates: kernel.PLATFORM.emptyArray,
      containerless: true,
      // tslint:disable-next-line: no-non-null-assertion
      shadowOptions: null,
      hasSlots: false,
      strategy: 1 /* getterSetter */,
      hooks: Object.freeze(new runtime.HooksDefinition(Compose.prototype)),
  });

  (function (NodeType) {
      NodeType[NodeType["Element"] = 1] = "Element";
      NodeType[NodeType["Attr"] = 2] = "Attr";
      NodeType[NodeType["Text"] = 3] = "Text";
      NodeType[NodeType["CDATASection"] = 4] = "CDATASection";
      NodeType[NodeType["EntityReference"] = 5] = "EntityReference";
      NodeType[NodeType["Entity"] = 6] = "Entity";
      NodeType[NodeType["ProcessingInstruction"] = 7] = "ProcessingInstruction";
      NodeType[NodeType["Comment"] = 8] = "Comment";
      NodeType[NodeType["Document"] = 9] = "Document";
      NodeType[NodeType["DocumentType"] = 10] = "DocumentType";
      NodeType[NodeType["DocumentFragment"] = 11] = "DocumentFragment";
      NodeType[NodeType["Notation"] = 12] = "Notation";
  })(exports.NodeType || (exports.NodeType = {}));
  /**
   * IDOM implementation for Html.
   */
  class HTMLDOM {
      constructor(window, document, TNode, TElement, THTMLElement, TCustomEvent) {
          this.window = window;
          this.document = document;
          this.Node = TNode;
          this.Element = TElement;
          this.HTMLElement = THTMLElement;
          this.CustomEvent = TCustomEvent;
          if (runtime.DOM.isInitialized) {
              kernel.Reporter.write(1001); // TODO: create reporters code // DOM already initialized (just info)
              runtime.DOM.destroy();
          }
          runtime.DOM.initialize(this);
      }
      static register(container) {
          return kernel.Registration.alias(runtime.IDOM, this).register(container);
      }
      addEventListener(eventName, subscriber, publisher, options) {
          (publisher || this.document).addEventListener(eventName, subscriber, options);
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
          if (node.parentNode == null) {
              throw kernel.Reporter.error(52);
          }
          const locationEnd = this.document.createComment('au-end');
          const locationStart = this.document.createComment('au-start');
          node.parentNode.replaceChild(locationEnd, node);
          locationEnd.parentNode.insertBefore(locationStart, locationEnd);
          locationEnd.$start = locationStart;
          locationStart.$nodes = null;
          return locationEnd;
      }
      createDocumentFragment(markupOrNode) {
          if (markupOrNode == null) {
              return this.document.createDocumentFragment();
          }
          if (this.isNodeInstance(markupOrNode)) {
              if (markupOrNode.content !== undefined) {
                  return markupOrNode.content;
              }
              const fragment = this.document.createDocumentFragment();
              fragment.appendChild(markupOrNode);
              return fragment;
          }
          return this.createTemplate(markupOrNode).content;
      }
      createElement(name) {
          return this.document.createElement(name);
      }
      fetch(input, init) {
          return this.window.fetch(input, init);
      }
      // tslint:disable-next-line:no-any // this is how the DOM is typed
      createCustomEvent(eventType, options) {
          return new this.CustomEvent(eventType, options);
      }
      dispatchEvent(evt) {
          this.document.dispatchEvent(evt);
      }
      createNodeObserver(node, cb, init) {
          if (typeof MutationObserver === 'undefined') {
              // TODO: find a proper response for this scenario
              return {
                  disconnect() { },
                  observe() { },
                  takeRecords() { return kernel.PLATFORM.emptyArray; }
              };
          }
          const observer = new MutationObserver(cb);
          observer.observe(node, init);
          return observer;
      }
      createTemplate(markup) {
          if (markup == null) {
              return this.document.createElement('template');
          }
          const template = this.document.createElement('template');
          template.innerHTML = markup.toString();
          return template;
      }
      createTextNode(text) {
          return this.document.createTextNode(text);
      }
      insertBefore(nodeToInsert, referenceNode) {
          referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
      }
      isMarker(node) {
          return node.nodeName === 'AU-M';
      }
      isNodeInstance(potentialNode) {
          return potentialNode != null && potentialNode.nodeType > 0;
      }
      isRenderLocation(node) {
          return node.textContent === 'au-end';
      }
      makeTarget(node) {
          node.className = 'au';
      }
      registerElementResolver(container, resolver) {
          container.registerResolver(runtime.INode, resolver);
          container.registerResolver(this.Node, resolver);
          container.registerResolver(this.Element, resolver);
          container.registerResolver(this.HTMLElement, resolver);
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
          (publisher || this.document).removeEventListener(eventName, subscriber, options);
      }
      setAttribute(node, name, value) {
          node.setAttribute(name, value);
      }
  }
  const $DOM = runtime.DOM;
  /**
   * A specialized INodeSequence with optimizations for text (interpolation) bindings
   * The contract of this INodeSequence is:
   * - the previous element is an `au-m` node
   * - text is the actual text node
   */
  /** @internal */
  class TextNodeSequence {
      constructor(dom, text) {
          this.isMounted = false;
          this.isLinked = false;
          this.dom = dom;
          this.firstChild = text;
          this.lastChild = text;
          this.childNodes = [text];
          this.targets = [new AuMarker(text)];
          this.next = void 0;
          this.refNode = void 0;
      }
      findTargets() {
          return this.targets;
      }
      insertBefore(refNode) {
          if (this.isLinked && !!this.refNode) {
              this.addToLinked();
          }
          else {
              this.isMounted = true;
              refNode.parentNode.insertBefore(this.firstChild, refNode);
          }
      }
      appendTo(parent) {
          if (this.isLinked && !!this.refNode) {
              this.addToLinked();
          }
          else {
              this.isMounted = true;
              parent.appendChild(this.firstChild);
          }
      }
      remove() {
          this.isMounted = false;
          this.firstChild.remove();
      }
      addToLinked() {
          const refNode = this.refNode;
          this.isMounted = true;
          refNode.parentNode.insertBefore(this.firstChild, refNode);
      }
      unlink() {
          this.isLinked = false;
          this.next = void 0;
          this.refNode = void 0;
      }
      link(next) {
          this.isLinked = true;
          if (this.dom.isRenderLocation(next)) {
              this.refNode = next;
          }
          else {
              this.next = next;
              this.obtainRefNode();
          }
      }
      obtainRefNode() {
          if (this.next !== void 0) {
              this.refNode = this.next.firstChild;
          }
          else {
              this.refNode = void 0;
          }
      }
  }
  // tslint:enable:no-any
  // This is the most common form of INodeSequence.
  // Every custom element or template controller whose node sequence is based on an HTML template
  // has an instance of this under the hood. Anyone who wants to create a node sequence from
  // a string of markup would also receive an instance of this.
  // CompiledTemplates create instances of FragmentNodeSequence.
  /**
   * This is the most common form of INodeSequence.
   * @internal
   */
  class FragmentNodeSequence {
      constructor(dom, fragment) {
          this.isMounted = false;
          this.isLinked = false;
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
          this.next = void 0;
          this.refNode = void 0;
      }
      findTargets() {
          return this.targets;
      }
      insertBefore(refNode) {
          if (this.isLinked && !!this.refNode) {
              this.addToLinked();
          }
          else {
              const parent = refNode.parentNode;
              if (this.isMounted) {
                  let current = this.firstChild;
                  const end = this.lastChild;
                  let next;
                  while (current != null) {
                      next = current.nextSibling;
                      parent.insertBefore(current, refNode);
                      if (current === end) {
                          break;
                      }
                      current = next;
                  }
              }
              else {
                  this.isMounted = true;
                  refNode.parentNode.insertBefore(this.fragment, refNode);
              }
          }
      }
      appendTo(parent) {
          if (this.isMounted) {
              let current = this.firstChild;
              const end = this.lastChild;
              let next;
              while (current != null) {
                  next = current.nextSibling;
                  parent.appendChild(current);
                  if (current === end) {
                      break;
                  }
                  current = next;
              }
          }
          else {
              this.isMounted = true;
              parent.appendChild(this.fragment);
          }
      }
      remove() {
          if (this.isMounted) {
              this.isMounted = false;
              const fragment = this.fragment;
              const end = this.lastChild;
              let next;
              let current = this.firstChild;
              while (current !== null) {
                  next = current.nextSibling;
                  fragment.appendChild(current);
                  if (current === end) {
                      break;
                  }
                  current = next;
              }
          }
      }
      addToLinked() {
          const refNode = this.refNode;
          const parent = refNode.parentNode;
          if (this.isMounted) {
              let current = this.firstChild;
              const end = this.lastChild;
              let next;
              while (current != null) {
                  next = current.nextSibling;
                  parent.insertBefore(current, refNode);
                  if (current === end) {
                      break;
                  }
                  current = next;
              }
          }
          else {
              this.isMounted = true;
              parent.insertBefore(this.fragment, refNode);
          }
      }
      unlink() {
          this.isLinked = false;
          this.next = void 0;
          this.refNode = void 0;
      }
      link(next) {
          this.isLinked = true;
          if (this.dom.isRenderLocation(next)) {
              this.refNode = next;
          }
          else {
              this.next = next;
              this.obtainRefNode();
          }
      }
      obtainRefNode() {
          if (this.next !== void 0) {
              this.refNode = this.next.firstChild;
          }
          else {
              this.refNode = void 0;
          }
      }
  }
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
  class HTMLTemplateFactory {
      constructor(dom) {
          this.dom = dom;
      }
      static register(container) {
          return kernel.Registration.singleton(runtime.ITemplateFactory, this).register(container);
      }
      create(parentRenderContext, definition) {
          return new runtime.CompiledTemplate(this.dom, definition, new NodeSequenceFactory(this.dom, definition.template), parentRenderContext);
      }
  }
  HTMLTemplateFactory.inject = [runtime.IDOM];

  const slice$3 = Array.prototype.slice;
  let TextBindingRenderer = 
  /** @internal */
  class TextBindingRenderer {
      constructor(parser, observerLocator) {
          this.parser = parser;
          this.observerLocator = observerLocator;
      }
      render(flags, dom, context, renderable, target, instruction) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TextBindingRenderer', 'render', slice$3.call(arguments));
          }
          const next = target.nextSibling;
          if (dom.isMarker(target)) {
              dom.remove(target);
          }
          let binding;
          const expr = runtime.ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
          if (expr.isMulti) {
              binding = new runtime.MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', runtime.BindingMode.toView, context);
          }
          else {
              binding = new runtime.InterpolationBinding(expr.firstExpression, expr, next, 'textContent', runtime.BindingMode.toView, this.observerLocator, context, true);
          }
          runtime.addBinding(renderable, binding);
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
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
      render(flags, dom, context, renderable, target, instruction) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('ListenerBindingRenderer', 'render', slice$3.call(arguments));
          }
          const expr = runtime.ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
          const binding = new Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
          runtime.addBinding(renderable, binding);
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
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
      render(flags, dom, context, renderable, target, instruction) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('SetAttributeRenderer', 'render', slice$3.call(arguments));
          }
          target.setAttribute(instruction.to, instruction.value);
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
  };
  SetAttributeRenderer = __decorate([
      runtime.instructionRenderer("he" /* setAttribute */)
      /** @internal */
  ], SetAttributeRenderer);
  let StylePropertyBindingRenderer = 
  /** @internal */
  class StylePropertyBindingRenderer {
      constructor(parser, observerLocator) {
          this.parser = parser;
          this.observerLocator = observerLocator;
      }
      render(flags, dom, context, renderable, target, instruction) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('StylePropertyBindingRenderer', 'render', slice$3.call(arguments));
          }
          const expr = runtime.ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime.BindingMode.toView);
          const binding = new runtime.Binding(expr, target.style, instruction.to, runtime.BindingMode.toView, this.observerLocator, context);
          runtime.addBinding(renderable, binding);
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
  };
  StylePropertyBindingRenderer.inject = [runtime.IExpressionParser, runtime.IObserverLocator];
  StylePropertyBindingRenderer = __decorate([
      runtime.instructionRenderer("hd" /* stylePropertyBinding */)
      /** @internal */
  ], StylePropertyBindingRenderer);
  let AttributeBindingRenderer = 
  /** @internal */
  class AttributeBindingRenderer {
      constructor(parser, observerLocator) {
          this.parser = parser;
          this.observerLocator = observerLocator;
      }
      render(flags, dom, context, renderable, target, instruction) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('StylePropertyBindingRenderer', 'render', slice$3.call(arguments));
          }
          const expr = runtime.ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime.BindingMode.toView);
          const binding = new exports.AttributeBinding(expr, target, instruction.attr /*targetAttribute*/, instruction.to /*targetKey*/, runtime.BindingMode.toView, this.observerLocator, context);
          runtime.addBinding(renderable, binding);
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
  };
  // @ts-ignore
  AttributeBindingRenderer.inject = [runtime.IExpressionParser, runtime.IObserverLocator];
  AttributeBindingRenderer = __decorate([
      runtime.instructionRenderer("hc" /* attributeBinding */)
      /** @internal */
  ], AttributeBindingRenderer);

  const slice$4 = Array.prototype.slice;
  const defaultShadowOptions = {
      mode: 'open'
  };
  class HTMLProjectorLocator {
      static register(container) {
          return kernel.Registration.singleton(runtime.IProjectorLocator, this).register(container);
      }
      getElementProjector(dom, $component, host, def) {
          if (def.shadowOptions || def.hasSlots) {
              if (def.containerless) {
                  throw kernel.Reporter.error(21);
              }
              return new ShadowDOMProjector(dom, $component, host, def);
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
      constructor(dom, $controller, host, definition) {
          this.dom = dom;
          this.host = host;
          let shadowOptions;
          if (definition.shadowOptions instanceof Object &&
              'mode' in definition.shadowOptions) {
              shadowOptions = definition.shadowOptions;
          }
          else {
              shadowOptions = defaultShadowOptions;
          }
          this.shadowRoot = host.attachShadow(shadowOptions);
          this.host.$controller = $controller;
          this.shadowRoot.$controller = $controller;
      }
      get children() {
          return this.shadowRoot.childNodes;
      }
      subscribeToChildrenChange(callback) {
          // TODO: add a way to dispose/disconnect
          this.dom.createNodeObserver(this.shadowRoot, callback, childObserverOptions$1);
      }
      provideEncapsulationSource() {
          return this.shadowRoot;
      }
      project(nodes) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('ShadowDOMProjector', 'project', slice$4.call(arguments));
          }
          nodes.appendTo(this.shadowRoot);
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      take(nodes) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('ShadowDOMProjector', 'take', slice$4.call(arguments));
          }
          nodes.remove();
          nodes.unlink();
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
  }
  /** @internal */
  class ContainerlessProjector {
      constructor(dom, $controller, host) {
          if (host.childNodes.length) {
              this.childNodes = kernel.toArray(host.childNodes);
          }
          else {
              this.childNodes = kernel.PLATFORM.emptyArray;
          }
          this.host = dom.convertToRenderLocation(host);
          this.host.$controller = $controller;
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
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('ContainerlessProjector', 'project', slice$4.call(arguments));
          }
          nodes.insertBefore(this.host);
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      take(nodes) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('ContainerlessProjector', 'take', slice$4.call(arguments));
          }
          nodes.remove();
          nodes.unlink();
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
  }
  /** @internal */
  class HostProjector {
      constructor($controller, host) {
          this.host = host;
          this.host.$controller = $controller;
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
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('HostProjector', 'project', slice$4.call(arguments));
          }
          nodes.appendTo(this.host);
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      take(nodes) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('HostProjector', 'take', slice$4.call(arguments));
          }
          nodes.remove();
          nodes.unlink();
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
  }

  const IProjectorLocatorRegistration = HTMLProjectorLocator;
  const ITargetAccessorLocatorRegistration = TargetAccessorLocator;
  const ITargetObserverLocatorRegistration = TargetObserverLocator;
  const ITemplateFactoryRegistration = HTMLTemplateFactory;
  /**
   * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
   * - `IProjectorLocator`
   * - `ITargetAccessorLocator`
   * - `ITargetObserverLocator`
   * - `ITemplateFactory`
   */
  const DefaultComponents = [
      IProjectorLocatorRegistration,
      ITargetAccessorLocatorRegistration,
      ITargetObserverLocatorRegistration,
      ITemplateFactoryRegistration
  ];
  const AttrBindingBehaviorRegistration = AttrBindingBehavior;
  const SelfBindingBehaviorRegistration = SelfBindingBehavior;
  const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior;
  const ComposeRegistration = Compose;
  /**
   * Default HTML-specific (but environment-agnostic) resources:
   * - Binding Behaviors: `attr`, `self`, `updateTrigger`
   * - Custom Elements: `au-compose`
   */
  const DefaultResources = [
      AttrBindingBehaviorRegistration,
      SelfBindingBehaviorRegistration,
      UpdateTriggerBindingBehaviorRegistration,
      ComposeRegistration,
  ];
  const ListenerBindingRendererRegistration = ListenerBindingRenderer;
  const AttributeBindingRendererRegistration = AttributeBindingRenderer;
  const SetAttributeRendererRegistration = SetAttributeRenderer;
  const StylePropertyBindingRendererRegistration = StylePropertyBindingRenderer;
  const TextBindingRendererRegistration = TextBindingRenderer;
  /**
   * Default HTML-specfic (but environment-agnostic) renderers for:
   * - Listener Bindings: `trigger`, `capture`, `delegate`
   * - SetAttribute
   * - StyleProperty: `style`, `css`
   * - TextBinding: `${}`
   */
  const DefaultRenderers = [
      ListenerBindingRendererRegistration,
      AttributeBindingRendererRegistration,
      SetAttributeRendererRegistration,
      StylePropertyBindingRendererRegistration,
      TextBindingRendererRegistration
  ];
  /**
   * A DI configuration object containing html-specific (but environment-agnostic) registrations:
   * - `BasicConfiguration` from `@aurelia/runtime`
   * - `DefaultComponents`
   * - `DefaultResources`
   * - `DefaultRenderers`
   */
  const BasicConfiguration = {
      /**
       * Apply this configuration to the provided container.
       */
      register(container) {
          return runtime.RuntimeBasicConfiguration
              .register(container)
              .register(...DefaultComponents, ...DefaultResources, ...DefaultRenderers);
      },
      /**
       * Create a new container with this configuration applied to it.
       */
      createContainer() {
          return this.register(kernel.DI.createContainer());
      }
  };

  exports.AttrBindingBehavior = AttrBindingBehavior;
  exports.AttrBindingBehaviorRegistration = AttrBindingBehaviorRegistration;
  exports.AttributeBindingInstruction = AttributeBindingInstruction;
  exports.AttributeBindingRendererRegistration = AttributeBindingRendererRegistration;
  exports.AttributeNSAccessor = AttributeNSAccessor;
  exports.BasicConfiguration = BasicConfiguration;
  exports.CaptureBindingInstruction = CaptureBindingInstruction;
  exports.ClassAttributeAccessor = ClassAttributeAccessor;
  exports.Compose = Compose;
  exports.ComposeRegistration = ComposeRegistration;
  exports.ContainerlessProjector = ContainerlessProjector;
  exports.DOM = $DOM;
  exports.DataAttributeAccessor = DataAttributeAccessor;
  exports.DefaultComponents = DefaultComponents;
  exports.DefaultRenderers = DefaultRenderers;
  exports.DefaultResources = DefaultResources;
  exports.DelegateBindingInstruction = DelegateBindingInstruction;
  exports.DelegateOrCaptureSubscription = DelegateOrCaptureSubscription;
  exports.ElementPropertyAccessor = ElementPropertyAccessor;
  exports.EventManager = EventManager;
  exports.EventSubscriber = EventSubscriber;
  exports.FragmentNodeSequence = FragmentNodeSequence;
  exports.HTMLDOM = HTMLDOM;
  exports.HTMLProjectorLocator = HTMLProjectorLocator;
  exports.HostProjector = HostProjector;
  exports.IEventManager = IEventManager;
  exports.IProjectorLocatorRegistration = IProjectorLocatorRegistration;
  exports.ISVGAnalyzer = ISVGAnalyzer;
  exports.ITargetAccessorLocatorRegistration = ITargetAccessorLocatorRegistration;
  exports.ITargetObserverLocatorRegistration = ITargetObserverLocatorRegistration;
  exports.ITemplateFactoryRegistration = ITemplateFactoryRegistration;
  exports.Listener = Listener;
  exports.ListenerBindingRendererRegistration = ListenerBindingRendererRegistration;
  exports.ListenerTracker = ListenerTracker;
  exports.NodeSequenceFactory = NodeSequenceFactory;
  exports.RenderPlan = RenderPlan;
  exports.SelfBindingBehavior = SelfBindingBehavior;
  exports.SelfBindingBehaviorRegistration = SelfBindingBehaviorRegistration;
  exports.SetAttributeInstruction = SetAttributeInstruction;
  exports.SetAttributeRendererRegistration = SetAttributeRendererRegistration;
  exports.ShadowDOMProjector = ShadowDOMProjector;
  exports.StyleAttributeAccessor = StyleAttributeAccessor;
  exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;
  exports.StylePropertyBindingRendererRegistration = StylePropertyBindingRendererRegistration;
  exports.TargetAccessorLocator = TargetAccessorLocator;
  exports.TargetObserverLocator = TargetObserverLocator;
  exports.TextBindingInstruction = TextBindingInstruction;
  exports.TextBindingRendererRegistration = TextBindingRendererRegistration;
  exports.TriggerBindingInstruction = TriggerBindingInstruction;
  exports.TriggerSubscription = TriggerSubscription;
  exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;
  exports.UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehaviorRegistration;
  exports.createElement = createElement;
  exports.isHTMLTargetedInstruction = isHTMLTargetedInstruction;

  return exports;

}({}, kernel, runtime));
//# sourceMappingURL=index.iife.js.map
