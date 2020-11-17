var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { createIndexMap } from '../observation.js';
import { CollectionSizeObserver } from './collection-size-observer.js';
import { collectionSubscriberCollection } from './subscriber-collection.js';
const observerLookup = new WeakMap();
const proto = Set.prototype;
const $add = proto.add;
const $clear = proto.clear;
const $delete = proto.delete;
const native = { add: $add, clear: $clear, delete: $delete };
const methods = ['add', 'clear', 'delete'];
// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap
const observe = {
    // https://tc39.github.io/ecma262/#sec-set.prototype.add
    add: function (value) {
        let $this = this;
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = observerLookup.get($this);
        if (o === undefined) {
            $add.call($this, value);
            return this;
        }
        const oldSize = $this.size;
        $add.call($this, value);
        const newSize = $this.size;
        if (newSize === oldSize) {
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.notify();
        return this;
    },
    // https://tc39.github.io/ecma262/#sec-set.prototype.clear
    clear: function () {
        let $this = this;
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = observerLookup.get($this);
        if (o === undefined) {
            return $clear.call($this);
        }
        const size = $this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            // deepscan-disable-next-line
            for (const _ of $this.keys()) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
                }
                i++;
            }
            $clear.call($this);
            indexMap.length = 0;
            o.notify();
        }
        return undefined;
    },
    // https://tc39.github.io/ecma262/#sec-set.prototype.delete
    delete: function (value) {
        let $this = this;
        if ($this.$raw !== undefined) {
            $this = $this.$raw;
        }
        const o = observerLookup.get($this);
        if (o === undefined) {
            return $delete.call($this, value);
        }
        const size = $this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of $this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
                }
                indexMap.splice(i, 1);
                const deleteResult = $delete.call($this, value);
                if (deleteResult === true) {
                    o.notify();
                }
                return deleteResult;
            }
            i++;
        }
        return false;
    }
};
const descriptorProps = {
    writable: true,
    enumerable: false,
    configurable: true
};
const def = Reflect.defineProperty;
for (const method of methods) {
    def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
let enableSetObservationCalled = false;
export function enableSetObservation() {
    for (const method of methods) {
        if (proto[method].observing !== true) {
            def(proto, method, { ...descriptorProps, value: observe[method] });
        }
    }
}
export function disableSetObservation() {
    for (const method of methods) {
        if (proto[method].observing === true) {
            def(proto, method, { ...descriptorProps, value: native[method] });
        }
    }
}
let SetObserver = class SetObserver {
    constructor(lifecycle, observedSet) {
        this.type = 18 /* Set */;
        if (!enableSetObservationCalled) {
            enableSetObservationCalled = true;
            enableSetObservation();
        }
        this.inBatch = false;
        this.collection = observedSet;
        this.indexMap = createIndexMap(observedSet.size);
        this.lifecycle = lifecycle;
        this.lengthObserver = (void 0);
        observerLookup.set(observedSet, this);
    }
    notify() {
        if (this.lifecycle.batch.depth > 0) {
            if (!this.inBatch) {
                this.inBatch = true;
                this.lifecycle.batch.add(this);
            }
        }
        else {
            this.flushBatch(0 /* none */);
        }
    }
    getLengthObserver() {
        var _a;
        return (_a = this.lengthObserver) !== null && _a !== void 0 ? _a : (this.lengthObserver = new CollectionSizeObserver(this.collection));
    }
    getIndexObserver(index) {
        throw new Error('Set index observation not supported');
    }
    flushBatch(flags) {
        var _a;
        const indexMap = this.indexMap;
        const size = this.collection.size;
        this.inBatch = false;
        this.indexMap = createIndexMap(size);
        this.callCollectionSubscribers(indexMap, 8 /* updateTarget */);
        (_a = this.lengthObserver) === null || _a === void 0 ? void 0 : _a.notify();
    }
};
SetObserver = __decorate([
    collectionSubscriberCollection()
], SetObserver);
export { SetObserver };
export function getSetObserver(lifecycle, observedSet) {
    const observer = observerLookup.get(observedSet);
    if (observer === void 0) {
        return new SetObserver(lifecycle, observedSet);
    }
    return observer;
}
//# sourceMappingURL=set-observer.js.map