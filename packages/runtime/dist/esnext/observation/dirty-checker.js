var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DI, Reporter } from '@aurelia/kernel';
import { subscriberCollection } from './subscriber-collection';
import { IScheduler } from '@aurelia/scheduler';
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
let DirtyChecker = class DirtyChecker {
    constructor(scheduler) {
        this.scheduler = scheduler;
        this.tracked = [];
        this.task = null;
        this.elapsedFrames = 0;
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
            this.task = this.scheduler.queueRenderTask(() => this.check(), { persistent: true });
        }
    }
    removeProperty(property) {
        this.tracked.splice(this.tracked.indexOf(property), 1);
        if (this.tracked.length === 0) {
            this.task.cancel();
            this.task = null;
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
};
DirtyChecker = __decorate([
    __param(0, IScheduler),
    __metadata("design:paramtypes", [Object])
], DirtyChecker);
export { DirtyChecker };
let DirtyCheckProperty = class DirtyCheckProperty {
    constructor(dirtyChecker, obj, propertyKey) {
        this.dirtyChecker = dirtyChecker;
        this.obj = obj;
        this.propertyKey = propertyKey;
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
    subscriberCollection(),
    __metadata("design:paramtypes", [Object, Object, String])
], DirtyCheckProperty);
export { DirtyCheckProperty };
//# sourceMappingURL=dirty-checker.js.map