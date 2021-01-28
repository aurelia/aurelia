"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckedObserver = void 0;
const runtime_1 = require("@aurelia/runtime");
const observer_locator_js_1 = require("./observer-locator.js");
function defaultMatcher(a, b) {
    return a === b;
}
class CheckedObserver {
    constructor(obj, 
    // deepscan-disable-next-line
    _key, handler, observerLocator) {
        this.handler = handler;
        this.observerLocator = observerLocator;
        this.value = void 0;
        this.oldValue = void 0;
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.collectionObserver = void 0;
        this.valueObserver = void 0;
        this.obj = obj;
    }
    getValue() {
        return this.value;
    }
    setValue(newValue, flags) {
        const currentValue = this.value;
        if (newValue === currentValue) {
            return;
        }
        this.value = newValue;
        this.oldValue = currentValue;
        this.observe();
        this.synchronizeElement();
        this.subs.notify(newValue, currentValue, flags);
    }
    handleCollectionChange(indexMap, flags) {
        this.synchronizeElement();
    }
    handleChange(newValue, previousValue, flags) {
        this.synchronizeElement();
    }
    synchronizeElement() {
        const currentValue = this.value;
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
        let currentValue = this.oldValue = this.value;
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
        this.value = currentValue;
        this.subs.notify(this.value, this.oldValue, 0 /* none */);
    }
    start() {
        this.handler.subscribe(this.obj, this);
        this.observe();
    }
    stop() {
        var _a, _b;
        this.handler.dispose();
        (_a = this.collectionObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this.collectionObserver = void 0;
        (_b = this.valueObserver) === null || _b === void 0 ? void 0 : _b.unsubscribe(this);
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.start();
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.stop();
        }
    }
    observe() {
        var _a, _b, _c, _d, _e, _f, _g;
        const obj = this.obj;
        (_e = ((_a = this.valueObserver) !== null && _a !== void 0 ? _a : (this.valueObserver = (_c = (_b = obj.$observers) === null || _b === void 0 ? void 0 : _b.model) !== null && _c !== void 0 ? _c : (_d = obj.$observers) === null || _d === void 0 ? void 0 : _d.value))) === null || _e === void 0 ? void 0 : _e.subscribe(this);
        (_f = this.collectionObserver) === null || _f === void 0 ? void 0 : _f.unsubscribe(this);
        this.collectionObserver = void 0;
        if (obj.type === 'checkbox') {
            (_g = (this.collectionObserver = observer_locator_js_1.getCollectionObserver(this.value, this.observerLocator))) === null || _g === void 0 ? void 0 : _g.subscribe(this);
        }
    }
}
exports.CheckedObserver = CheckedObserver;
runtime_1.subscriberCollection(CheckedObserver);
//# sourceMappingURL=checked-observer.js.map