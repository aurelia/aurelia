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
import { DI, IPlatform } from '@aurelia/kernel';
import { subscriberCollection } from './subscriber-collection.js';
export const IDirtyChecker = DI.createInterface('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));
export const DirtyCheckSettings = {
    /**
     * Default: `6`
     *
     * Adjust the global dirty check frequency.
     * Measures in "timeouts per check", such that (given a default of 250 timeouts per second in modern browsers):
     * - A value of 1 will result in 250 dirty checks per second (or 1 dirty check per second for an inactive tab)
     * - A value of 25 will result in 10 dirty checks per second (or 1 dirty check per 25 seconds for an inactive tab)
     */
    timeoutsPerCheck: 25,
    /**
     * Default: `false`
     *
     * Disable dirty-checking entirely. Properties that cannot be observed without dirty checking
     * or an adapter, will simply not be observed.
     */
    disabled: false,
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
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};
const queueTaskOpts = {
    persistent: true,
};
let DirtyChecker = class DirtyChecker {
    constructor(platform) {
        this.platform = platform;
        this.tracked = [];
        this.task = null;
        this.elapsedFrames = 0;
        this.check = () => {
            if (DirtyCheckSettings.disabled) {
                return;
            }
            if (++this.elapsedFrames < DirtyCheckSettings.timeoutsPerCheck) {
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
                    current.flush(0 /* none */);
                }
            }
        };
    }
    createProperty(obj, propertyName) {
        if (DirtyCheckSettings.throw) {
            throw new Error(`Property '${propertyName}' is being dirty-checked.`);
        }
        return new DirtyCheckProperty(this, obj, propertyName);
    }
    addProperty(property) {
        this.tracked.push(property);
        if (this.tracked.length === 1) {
            this.task = this.platform.macroTaskQueue.queueTask(this.check, queueTaskOpts);
        }
    }
    removeProperty(property) {
        this.tracked.splice(this.tracked.indexOf(property), 1);
        if (this.tracked.length === 0) {
            this.task.cancel();
            this.task = null;
        }
    }
};
DirtyChecker = __decorate([
    __param(0, IPlatform),
    __metadata("design:paramtypes", [Object])
], DirtyChecker);
export { DirtyChecker };
let DirtyCheckProperty = class DirtyCheckProperty {
    constructor(dirtyChecker, obj, propertyKey) {
        this.dirtyChecker = dirtyChecker;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.type = 4 /* Obj */;
    }
    isDirty() {
        return this.oldValue !== this.obj[this.propertyKey];
    }
    flush(flags) {
        const oldValue = this.oldValue;
        const newValue = this.obj[this.propertyKey];
        this.callSubscribers(newValue, oldValue, flags | 8 /* updateTarget */);
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