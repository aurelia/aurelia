import { __decorate } from "tslib";
import { DI, Reporter } from '@aurelia/kernel';
import { ILifecycle } from '../lifecycle';
import { subscriberCollection } from './subscriber-collection';
export const IDirtyChecker = DI.createInterface('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));
export const DirtyCheckSettings = {
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
export class DirtyChecker {
    constructor(lifecycle) {
        this.elapsedFrames = 0;
        this.tracked = [];
        this.lifecycle = lifecycle;
    }
    createProperty(obj, propertyName) {
        if (DirtyCheckSettings.throw) {
            throw Reporter.error(800, propertyName); // TODO: create/organize error code
        }
        if (DirtyCheckSettings.warn) {
            Reporter.write(801, propertyName);
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
                current.flush(256 /* fromTick */);
            }
        }
    }
}
DirtyChecker.inject = [ILifecycle];
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
DirtyCheckProperty = __decorate([
    subscriberCollection()
], DirtyCheckProperty);
export { DirtyCheckProperty };
//# sourceMappingURL=dirty-checker.js.map