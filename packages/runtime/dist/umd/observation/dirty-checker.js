(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../lifecycle", "./subscriber-collection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const lifecycle_1 = require("../lifecycle");
    const subscriber_collection_1 = require("./subscriber-collection");
    exports.IDirtyChecker = kernel_1.DI.createInterface('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));
    exports.DirtyCheckSettings = {
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
        constructor(lifecycle) {
            this.elapsedFrames = 0;
            this.tracked = [];
            this.lifecycle = lifecycle;
        }
        createProperty(obj, propertyName) {
            if (exports.DirtyCheckSettings.throw) {
                throw kernel_1.Reporter.error(800, propertyName); // TODO: create/organize error code
            }
            if (exports.DirtyCheckSettings.warn) {
                kernel_1.Reporter.write(801, propertyName);
            }
            return new DirtyCheckProperty(this, obj, propertyName);
        }
        addProperty(property) {
            this.tracked.push(property);
            if (this.tracked.length === 1) {
                this.lifecycle.enqueueRAF(this.check, this, 4096 /* low */);
            }
        }
        removeProperty(property) {
            this.tracked.splice(this.tracked.indexOf(property), 1);
            if (this.tracked.length === 0) {
                this.lifecycle.dequeueRAF(this.check, this);
            }
        }
        check(delta) {
            if (exports.DirtyCheckSettings.disabled) {
                return;
            }
            if (++this.elapsedFrames < exports.DirtyCheckSettings.framesPerCheck) {
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
                    current.flush(256 /* fromTick */);
                }
            }
        }
    }
    exports.DirtyChecker = DirtyChecker;
    DirtyChecker.inject = [lifecycle_1.ILifecycle];
    const slice = Array.prototype.slice;
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
            this.callSubscribers(newValue, oldValue, flags | 16 /* updateTargetInstance */);
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
    DirtyCheckProperty = tslib_1.__decorate([
        subscriber_collection_1.subscriberCollection()
    ], DirtyCheckProperty);
    exports.DirtyCheckProperty = DirtyCheckProperty;
});
//# sourceMappingURL=dirty-checker.js.map