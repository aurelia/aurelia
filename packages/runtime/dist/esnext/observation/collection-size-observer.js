import { __decorate } from "tslib";
import { subscriberCollection } from './subscriber-collection';
let CollectionSizeObserver = class CollectionSizeObserver {
    constructor(obj) {
        this.obj = obj;
        this.currentValue = obj.size;
    }
    getValue() {
        return this.obj.size;
    }
    setValue(newValue, flags) {
        const { currentValue } = this;
        if (newValue !== currentValue) {
            this.currentValue = newValue;
            this.callSubscribers(newValue, currentValue, flags | 16 /* updateTargetInstance */);
        }
    }
};
CollectionSizeObserver = __decorate([
    subscriberCollection()
], CollectionSizeObserver);
export { CollectionSizeObserver };
//# sourceMappingURL=collection-size-observer.js.map