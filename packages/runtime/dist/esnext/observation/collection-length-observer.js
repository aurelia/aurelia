var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { subscriberCollection } from './subscriber-collection.js';
let CollectionLengthObserver = class CollectionLengthObserver {
    constructor(obj) {
        this.obj = obj;
        this.type = 10 /* Array */;
        this.currentValue = obj.length;
    }
    getValue() {
        return this.obj.length;
    }
    setValue(newValue, flags) {
        const currentValue = this.currentValue;
        if (newValue !== currentValue) {
            this.currentValue = newValue;
            this.callSubscribers(newValue, currentValue, flags | 8 /* updateTarget */);
        }
    }
};
CollectionLengthObserver = __decorate([
    subscriberCollection()
], CollectionLengthObserver);
export { CollectionLengthObserver };
//# sourceMappingURL=collection-length-observer.js.map