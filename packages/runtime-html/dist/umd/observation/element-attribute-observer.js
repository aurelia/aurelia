(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    /**
     * Observer for handling two-way binding with attributes
     * Has different strategy for class/style and normal attributes
     * TODO: handle SVG/attributes with namespace
     */
    let AttributeObserver = class AttributeObserver {
        constructor(scheduler, flags, observerLocator, obj, propertyKey, targetAttribute) {
            this.scheduler = scheduler;
            this.observerLocator = observerLocator;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.targetAttribute = targetAttribute;
            this.currentValue = null;
            this.oldValue = null;
            this.hasChanges = false;
            this.task = null;
            this.persistentFlags = flags & 805306383 /* targetObserverFlags */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
                this.flushChanges(flags);
            }
            else if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */ && this.task === null) {
                this.task = this.scheduler.queueRenderTask(() => {
                    this.flushChanges(flags);
                    this.task = null;
                });
            }
        }
        flushChanges(flags) {
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
            if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
                if (this.task !== null) {
                    this.task.cancel();
                }
                this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
            }
        }
        unbind(flags) {
            if (this.task !== null) {
                this.task.cancel();
                this.task = null;
            }
        }
    };
    AttributeObserver = tslib_1.__decorate([
        runtime_1.subscriberCollection()
    ], AttributeObserver);
    exports.AttributeObserver = AttributeObserver;
    const startObservation = (element, subscription) => {
        if (element.$eMObservers === undefined) {
            element.$eMObservers = new Set();
        }
        if (element.$mObserver === undefined) {
            element.$mObserver = runtime_1.DOM.createNodeObserver(element, handleMutation, { attributes: true });
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
});
//# sourceMappingURL=element-attribute-observer.js.map