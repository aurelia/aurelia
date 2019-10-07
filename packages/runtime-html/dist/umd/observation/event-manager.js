(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    // Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
    /** @internal */
    function findOriginalEventTarget(event) {
        return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
    }
    exports.findOriginalEventTarget = findOriginalEventTarget;
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
        /* @internal */
        dispose() {
            if (this.count > 0) {
                this.count = 0;
                this.dom.removeEventListener(this.eventName, this.listener, null, this.capture);
            }
        }
    }
    exports.ListenerTracker = ListenerTracker;
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
    exports.DelegateOrCaptureSubscription = DelegateOrCaptureSubscription;
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
    exports.TriggerSubscription = TriggerSubscription;
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
            const dom = this.dom;
            for (let i = 0, ii = events.length; ii > i; ++i) {
                dom.removeEventListener(events[i], callbackOrListener, node);
            }
            this.target = this.handler = null;
        }
    }
    exports.EventSubscriber = EventSubscriber;
    exports.IEventManager = kernel_1.DI.createInterface('IEventManager').withDefault(x => x.singleton(EventManager));
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
            if (strategy === runtime_1.DelegationStrategy.bubbling) {
                delegatedHandlers = this.delegatedHandlers;
                handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new ListenerTracker(dom, targetEvent, handleDelegatedEvent, false));
                handlerEntry.increment();
                const delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
                return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
            }
            if (strategy === runtime_1.DelegationStrategy.capturing) {
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
    exports.EventManager = EventManager;
});
//# sourceMappingURL=event-manager.js.map