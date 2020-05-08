var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { subscriberCollection, IScheduler, getCollectionObserver, ILifecycle, } from '@aurelia/runtime';
const toStringTag = Object.prototype.toString;
function defaultMatcher(a, b) {
    return a === b;
}
let CheckedObserver = class CheckedObserver {
    constructor(scheduler, flags, lifecycle, handler, obj) {
        this.scheduler = scheduler;
        this.lifecycle = lifecycle;
        this.handler = handler;
        this.obj = obj;
        this.currentValue = void 0;
        this.oldValue = void 0;
        this.hasChanges = false;
        this.task = null;
        this.collectionObserver = void 0;
        this.valueObserver = void 0;
        this.persistentFlags = flags & 805306383 /* targetObserverFlags */;
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        this.currentValue = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 4096 /* fromBind */) === 4096 /* fromBind */ || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
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
            const currentValue = this.oldValue = this.currentValue;
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
            if (this.collectionObserver !== void 0) {
                this.collectionObserver.unsubscribeFromCollection(this);
                this.collectionObserver = void 0;
            }
            if (this.obj.type === 'checkbox') {
                this.collectionObserver = getCollectionObserver(flags, this.lifecycle, currentValue);
                if (this.collectionObserver !== void 0) {
                    this.collectionObserver.subscribeToCollection(this);
                }
            }
            this.synchronizeElement();
        }
    }
    handleCollectionChange(indexMap, flags) {
        const { currentValue, oldValue } = this;
        if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
            this.oldValue = currentValue;
            this.synchronizeElement();
        }
        else {
            this.hasChanges = true;
        }
        if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */ && this.task === null) {
            this.task = this.scheduler.queueRenderTask(() => {
                this.flushChanges(flags);
                this.task = null;
            });
        }
        this.callSubscribers(currentValue, oldValue, flags);
    }
    handleChange(newValue, previousValue, flags) {
        if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
            this.synchronizeElement();
        }
        else {
            this.hasChanges = true;
        }
        if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */ && this.task === null) {
            this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags));
        }
        this.callSubscribers(newValue, previousValue, flags);
    }
    synchronizeElement() {
        const currentValue = this.currentValue;
        const obj = this.obj;
        const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
        const isRadio = obj.type === 'radio';
        const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;
        if (isRadio) {
            obj.checked = !!matcher(currentValue, elementValue);
        }
        else if (currentValue === true) {
            obj.checked = true;
        }
        else {
            let hasMatch = false;
            switch (toStringTag.call(currentValue)) {
                case '[object Array]':
                    hasMatch = currentValue.findIndex(item => !!matcher(item, elementValue)) !== -1;
                    break;
                case '[object Set]':
                    for (const v of currentValue) {
                        if (matcher(v, elementValue)) {
                            hasMatch = true;
                            break;
                        }
                    }
                    break;
                case '[object Map]':
                    for (const pair of currentValue) {
                        const existingItem = pair[0];
                        const $isChecked = pair[1];
                        // a potential complain, when only `true` is supported
                        // but it's consistent with array
                        if (matcher(existingItem, elementValue) && $isChecked === true) {
                            hasMatch = true;
                            break;
                        }
                    }
            }
            obj.checked = hasMatch;
        }
    }
    handleEvent() {
        let currentValue = this.oldValue = this.currentValue;
        const obj = this.obj;
        const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
        const isChecked = obj.checked;
        const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;
        if (obj.type === 'checkbox') {
            const toStringRet = toStringTag.call(currentValue);
            if (toStringRet === '[object Array]') {
                // Array binding steps on a change event:
                // 1. find corresponding item INDEX in the Set based on current model/value and matcher
                // 2. is the checkbox checked?
                //    2.1. Yes: is the corresponding item in the Array (index === -1)?
                //        2.1.1 No: push the current model/value to the Array
                //    2.2. No: is the corresponding item in the Array (index !== -1)?
                //        2.2.1: Yes: remove the corresponding item
                // =================================================
                const index = currentValue.findIndex(item => !!matcher(item, elementValue));
                // if the checkbox is checkde, and there's no matching value in the existing array
                // add the checkbox model/value to the array
                if (isChecked && index === -1) {
                    currentValue.push(elementValue);
                }
                else if (!isChecked && index !== -1) {
                    // if the checkbox is not checked, and found a matching item in the array
                    // based on the checkbox model/value
                    // remove the existing item
                    currentValue.splice(index, 1);
                }
                // when existing currentValue is an array,
                // do not invoke callback as only the array obj has changed
                return;
            }
            else if (toStringRet === '[object Set]') {
                // Set binding steps on a change event:
                // 1. find corresponding item in the Set based on current model/value and matcher
                // 2. is the checkbox checked?
                //    2.1. Yes: is the corresponding item in the Set?
                //        2.1.1 No: add the current model/value to the Set
                //    2.2. No: is the corresponding item in the Set?
                //        2.2.1: Yes: remove the corresponding item
                // =================================================
                // 1. find corresponding item
                const unset = {};
                let existingItem = unset;
                for (const value of currentValue) {
                    if (matcher(value, elementValue) === true) {
                        existingItem = value;
                        break;
                    }
                }
                // 2.1. Checkbox is checked, is the corresponding item in the Set?
                //
                // if checkbox is checked and there's no value in the existing Set
                // add the checkbox model/value to the Set
                if (isChecked && existingItem === unset) {
                    // 2.1.1. add the current model/value to the Set
                    currentValue.add(elementValue);
                }
                else if (!isChecked && existingItem !== unset) {
                    // 2.2.1 Checkbox is unchecked, corresponding is in the Set
                    //
                    // if checkbox is not checked, and found a matching item in the Set
                    // based on the checkbox model/value
                    // remove the existing item
                    currentValue.delete(existingItem);
                }
                // when existing value is a Set,
                // do not invoke callback as only the Set has been mutated
                return;
            }
            else if (toStringRet === '[object Map]') {
                // Map binding steps on a change event
                // 1. find corresponding item in the Map based on current model/value and matcher
                // 2. Set the value of the corresponding item in the Map based on checked state of the checkbox
                // =================================================
                // 1. find the corresponding item
                let existingItem;
                for (const pair of currentValue) {
                    const currItem = pair[0];
                    if (matcher(currItem, elementValue) === true) {
                        existingItem = currItem;
                        break;
                    }
                }
                // 2. set the value of the corresponding item in the map
                // if checkbox is checked and there's no value in the existing Map
                // add the checkbox model/value to the Map as key,
                // and value will be checked state of the checkbox
                currentValue.set(existingItem, isChecked);
                // when existing value is a Map,
                // do not invoke callback as only the Map has been mutated
                return;
            }
            currentValue = isChecked;
        }
        else if (isChecked) {
            currentValue = elementValue;
        }
        else {
            // if it's a radio and it has been unchecked
            // do nothing, as the radio that was checked will fire change event and it will be handle there
            // a radio cannot be unchecked by user
            return;
        }
        this.currentValue = currentValue;
        this.callSubscribers(this.currentValue, this.oldValue, 131072 /* fromDOMEvent */ | 524288 /* allowPublishRoundtrip */);
    }
    bind(flags) {
        if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
            if (this.task !== null) {
                this.task.cancel();
            }
            this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
        }
        this.currentValue = this.obj.checked;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unbind(flags) {
        if (this.collectionObserver !== void 0) {
            this.collectionObserver.unsubscribeFromCollection(this);
            this.collectionObserver = void 0;
        }
        if (this.valueObserver !== void 0) {
            this.valueObserver.unsubscribe(this);
        }
        if (this.task !== null) {
            this.task.cancel();
            this.task = null;
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
CheckedObserver = __decorate([
    subscriberCollection(),
    __metadata("design:paramtypes", [Object, Number, Object, Object, Object])
], CheckedObserver);
export { CheckedObserver };
//# sourceMappingURL=checked-observer.js.map