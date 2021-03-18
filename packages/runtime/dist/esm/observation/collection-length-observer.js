import { isArrayIndex } from '@aurelia/kernel';
import { subscriberCollection } from './subscriber-collection.js';
import { ensureProto } from '../utilities-objects.js';
import { withFlushQueue } from './flush-queue.js';
export class CollectionLengthObserver {
    constructor(owner) {
        this.owner = owner;
        this.f = 0 /* none */;
        this.type = 18 /* Array */;
        this.value = this.oldvalue = (this.obj = owner.collection).length;
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
            if ((flags & 256 /* noFlush */) === 0) {
                this.obj.length = newValue;
            }
            this.value = newValue;
            this.oldvalue = currentValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    handleCollectionChange(_, flags) {
        const oldValue = this.value;
        const value = this.obj.length;
        if ((this.value = value) !== oldValue) {
            this.oldvalue = oldValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    flush() {
        oV = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, oV, this.f);
    }
}
export class CollectionSizeObserver {
    constructor(owner) {
        this.owner = owner;
        this.f = 0 /* none */;
        this.value = this.oldvalue = (this.obj = owner.collection).size;
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
        if ((this.value = value) !== oldValue) {
            this.oldvalue = oldValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    flush() {
        oV = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, oV, this.f);
    }
}
function implementLengthObserver(klass) {
    const proto = klass.prototype;
    ensureProto(proto, 'subscribe', subscribe, true);
    ensureProto(proto, 'unsubscribe', unsubscribe, true);
    withFlushQueue(klass);
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
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV = void 0;
//# sourceMappingURL=collection-length-observer.js.map