import { __decorate } from "tslib";
import { subscriberCollection } from './subscriber-collection';
let CollectionLengthObserver = class CollectionLengthObserver {
    constructor(obj) {
        this.obj = obj;
        this.currentValue = obj.length;
    }
    getValue() {
        return this.obj.length;
    }
    setValue(newValue, flags) {
        const { currentValue } = this;
        if (newValue !== currentValue) {
            this.currentValue = newValue;
            this.callSubscribers(newValue, currentValue, flags | 16 /* updateTargetInstance */);
        }
    }
};
CollectionLengthObserver = __decorate([
    subscriberCollection()
], CollectionLengthObserver);
export { CollectionLengthObserver };
//# sourceMappingURL=collection-length-observer.js.map