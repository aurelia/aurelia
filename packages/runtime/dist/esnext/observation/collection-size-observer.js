import { __decorate, __metadata } from "tslib";
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
    subscriberCollection(),
    __metadata("design:paramtypes", [Object])
], CollectionSizeObserver);
export { CollectionSizeObserver };
//# sourceMappingURL=collection-size-observer.js.map