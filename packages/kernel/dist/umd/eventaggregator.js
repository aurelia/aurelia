(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./di", "./reporter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const di_1 = require("./di");
    const reporter_1 = require("./reporter");
    /**
     * Represents a handler for an EventAggregator event.
     */
    class Handler {
        constructor(messageType, callback) {
            this.messageType = messageType;
            this.callback = callback;
        }
        handle(message) {
            if (message instanceof this.messageType) {
                this.callback.call(null, message);
            }
        }
    }
    function invokeCallback(callback, data, event) {
        try {
            callback(data, event);
        }
        catch (e) {
            reporter_1.Reporter.error(0, e); // TODO: create error code
        }
    }
    function invokeHandler(handler, data) {
        try {
            handler.handle(data);
        }
        catch (e) {
            reporter_1.Reporter.error(0, e); // TODO: create error code
        }
    }
    exports.IEventAggregator = di_1.DI.createInterface('IEventAggregator').withDefault(x => x.singleton(EventAggregator));
    /**
     * Enables loosely coupled publish/subscribe messaging.
     */
    class EventAggregator {
        /**
         * Creates an instance of the EventAggregator class.
         */
        constructor() {
            this.eventLookup = {};
            this.messageHandlers = [];
        }
        publish(channelOrInstance, data) {
            let subscribers;
            let i;
            if (!channelOrInstance) {
                throw reporter_1.Reporter.error(0); // TODO: create error code for 'Event was invalid.'
            }
            if (typeof channelOrInstance === 'string') {
                const channel = channelOrInstance;
                subscribers = this.eventLookup[channel];
                if (subscribers != null) {
                    subscribers = subscribers.slice();
                    i = subscribers.length;
                    while (i--) {
                        invokeCallback(subscribers[i], data, channel);
                    }
                }
            }
            else {
                const instance = channelOrInstance;
                subscribers = this.messageHandlers.slice();
                i = subscribers.length;
                while (i--) {
                    invokeHandler(subscribers[i], instance);
                }
            }
        }
        subscribe(channelOrType, callback) {
            let handler;
            let subscribers;
            if (!channelOrType) {
                throw reporter_1.Reporter.error(0); // TODO: create error code for 'Event channel/type was invalid.'
            }
            if (typeof channelOrType === 'string') {
                const channel = channelOrType;
                handler = callback;
                if (this.eventLookup[channel] === void 0) {
                    this.eventLookup[channel] = [];
                }
                subscribers = this.eventLookup[channel];
            }
            else {
                handler = new Handler(channelOrType, callback);
                subscribers = this.messageHandlers;
            }
            subscribers.push(handler);
            return {
                dispose() {
                    const idx = subscribers.indexOf(handler);
                    if (idx !== -1) {
                        subscribers.splice(idx, 1);
                    }
                }
            };
        }
        subscribeOnce(channelOrType, callback) {
            const sub = this.subscribe(channelOrType, (data, event) => {
                sub.dispose();
                return callback(data, event);
            });
            return sub;
        }
    }
    exports.EventAggregator = EventAggregator;
});
//# sourceMappingURL=eventaggregator.js.map