import { isArrayIndex } from '../../../../kernel/dist/native-modules/index.js';
import { subscriberCollection } from './subscriber-collection.js';
import { ensureProto } from '../utilities-objects.js';
export class CollectionLengthObserver {
    constructor(owner) {
        this.owner = owner;
        this.type = 18 /* Array */;
        this.value = (this.obj = owner.collection).length;
    }
    getValue() {
        return this.obj.length;
    }
    setValue(newValue, flags) {
        const currentValue = this.value;
        // if in the template, length is two-way bound directly
        // then there's a chance that the new value is invalid
        // add a guard so that we don't accidentally broadcast invalid values
        if (newValue !== currentValue && isArrayIndex(newValue)) {
            if ((flags & 1024 /* noFlush */) === 0) {
                this.obj.length = newValue;
            }
            this.value = newValue;
            this.subs.notify(newValue, currentValue, flags);
        }
    }
    handleCollectionChange(_, flags) {
        const oldValue = this.value;
        const value = this.obj.length;
        if ((this.value = value) !== oldValue) {
            this.subs.notify(value, oldValue, flags);
        }
    }
}
export class CollectionSizeObserver {
    constructor(owner) {
        this.owner = owner;
        this.value = (this.obj = owner.collection).size;
        this.type = this.obj instanceof Map ? 66 /* Map */ : 34 /* Set */;
    }
    getValue() {
        return this.obj.size;
    }
    setValue() {
        throw new Error('Map/Set "size" is a readonly property');
    }
    handleCollectionChange(_, flags) {
        const oldValue = this.value;
        const value = this.obj.size;
        this.value = value;
        if (value !== oldValue) {
            this.subs.notify(value, oldValue, flags);
        }
    }
}
function implementLengthObserver(klass) {
    const proto = klass.prototype;
    ensureProto(proto, 'subscribe', subscribe, true);
    ensureProto(proto, 'unsubscribe', unsubscribe, true);
    subscriberCollection(klass);
}
function subscribe(subscriber) {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
        this.owner.subscribe(this);
    }
}
function unsubscribe(subscriber) {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
        this.owner.subscribe(this);
    }
}
implementLengthObserver(CollectionLengthObserver);
implementLengthObserver(CollectionSizeObserver);
//# sourceMappingURL=collection-length-observer.js.map