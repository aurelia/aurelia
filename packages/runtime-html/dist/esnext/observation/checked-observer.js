var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { subscriberCollection, } from '@aurelia/runtime';
import { getCollectionObserver } from './observer-locator.js';
function defaultMatcher(a, b) {
    return a === b;
}
let CheckedObserver = class CheckedObserver {
    constructor(obj, 
    // deepscan-disable-next-line
    _key, handler, observerLocator) {
        this.handler = handler;
        this.observerLocator = observerLocator;
        this.currentValue = void 0;
        this.oldValue = void 0;
        this.persistentFlags = 0 /* none */;
        this.hasChanges = false;
        this.type = 2 /* Node */ | 1 /* Observer */ | 64 /* Layout */;
        this.collectionObserver = void 0;
        this.valueObserver = void 0;
        this.subscriberCount = 0;
        this.obj = obj;
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        this.currentValue = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 4096 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        var _a, _b, _c;
        if (this.hasChanges) {
            this.hasChanges = false;
            const obj = this.obj;
            const currentValue = this.oldValue = this.currentValue;
            if (this.valueObserver === void 0) {
                if (obj.$observers !== void 0) {
                    if (obj.$observers.model !== void 0) {
                        this.valueObserver = obj.$observers.model;
                    }
                    else if (obj.$observers.value !== void 0) {
                        this.valueObserver = obj.$observers.value;
                    }
                }
                (_a = this.valueObserver) === null || _a === void 0 ? void 0 : _a.subscribe(this);
            }
            (_b = this.collectionObserver) === null || _b === void 0 ? void 0 : _b.unsubscribeFromCollection(this);
            this.collectionObserver = void 0;
            if (obj.type === 'checkbox') {
                (_c = (this.collectionObserver = getCollectionObserver(currentValue, this.observerLocator))) === null || _c === void 0 ? void 0 : _c.subscribeToCollection(this);
            }
            this.synchronizeElement();
        }
    }
    handleCollectionChange(indexMap, flags) {
        this.synchronizeElement();
    }
    handleChange(newValue, previousValue, flags) {
        this.synchronizeElement();
        this.callSubscribers(newValue, previousValue, flags);
        this.flushChanges(flags);
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
            if (currentValue instanceof Array) {
                hasMatch = currentValue.findIndex(item => !!matcher(item, elementValue)) !== -1;
            }
            else if (currentValue instanceof Set) {
                for (const v of currentValue) {
                    if (matcher(v, elementValue)) {
                        hasMatch = true;
                        break;
                    }
                }
            }
            else if (currentValue instanceof Map) {
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
            if (currentValue instanceof Array) {
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
            else if (currentValue instanceof Set) {
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
            else if (currentValue instanceof Map) {
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
        this.callSubscribers(this.currentValue, this.oldValue, 0 /* none */);
    }
    // deepscan-disable-next-line
    bind(_flags) {
        // this is incorrect, needs to find a different way to initialize observer value,
        // relative to binding value
        // for now keeping this to do everything at once later
        this.currentValue = this.obj.checked;
    }
    // deepscan-disable-next-line
    unbind(_flags) {
        this.currentValue = void 0;
    }
    start() {
        this.handler.subscribe(this.obj, this);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stop() {
        this.handler.dispose();
        if (this.collectionObserver !== void 0) {
            this.collectionObserver.unsubscribeFromCollection(this);
            this.collectionObserver = void 0;
        }
        if (this.valueObserver !== void 0) {
            this.valueObserver.unsubscribe(this);
        }
    }
    subscribe(subscriber) {
        if (this.addSubscriber(subscriber) && ++this.subscriberCount === 1) {
            this.start();
        }
    }
    unsubscribe(subscriber) {
        if (this.removeSubscriber(subscriber) && --this.subscriberCount === 0) {
            this.stop();
        }
    }
};
CheckedObserver = __decorate([
    subscriberCollection(),
    __metadata("design:paramtypes", [Object, Object, Function, Object])
], CheckedObserver);
export { CheckedObserver };
//# sourceMappingURL=checked-observer.js.map