var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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