(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time
    const slice = Array.prototype.slice;
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
        const observerSlots = this.observerSlots == null ? 0 : this.observerSlots;
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
            observer[this.id] |= 16 /* updateTargetInstance */;
            // increment the slot count.
            if (i === observerSlots) {
                this.observerSlots = i + 1;
            }
        }
        // set the "version" when the observer was used.
        if (this.version == null) {
            this.version = 0;
        }
        this[versionSlotNames[i]] = this.version;
        ensureEnoughSlotNames(i);
    }
    exports.addObserver = addObserver;
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
    exports.observeProperty = observeProperty;
    /** @internal */
    function unobserve(all) {
        const slots = this.observerSlots;
        let slotName;
        let observer;
        if (all === true) {
            for (let i = 0; i < slots; ++i) {
                slotName = slotNames[i];
                observer = this[slotName];
                if (observer != null) {
                    this[slotName] = void 0;
                    observer.unsubscribe(this);
                    observer[this.id] &= ~16 /* updateTargetInstance */;
                }
            }
        }
        else {
            const version = this.version;
            for (let i = 0; i < slots; ++i) {
                if (this[versionSlotNames[i]] !== version) {
                    slotName = slotNames[i];
                    observer = this[slotName];
                    if (observer != null) {
                        this[slotName] = void 0;
                        observer.unsubscribe(this);
                        observer[this.id] &= ~16 /* updateTargetInstance */;
                    }
                }
            }
        }
    }
    exports.unobserve = unobserve;
    function connectableDecorator(target) {
        const proto = target.prototype;
        if (!Object.prototype.hasOwnProperty.call(proto, 'observeProperty'))
            proto.observeProperty = observeProperty;
        if (!Object.prototype.hasOwnProperty.call(proto, 'unobserve'))
            proto.unobserve = unobserve;
        if (!Object.prototype.hasOwnProperty.call(proto, 'addObserver'))
            proto.addObserver = addObserver;
        return target;
    }
    function connectable(target) {
        return target == null ? connectableDecorator : connectableDecorator(target);
    }
    exports.connectable = connectable;
    let value = 0;
    connectable.assignIdTo = (instance) => {
        instance.id = ++value;
    };
});
//# sourceMappingURL=connectable.js.map