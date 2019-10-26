(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../observation", "./collection-size-observer", "./subscriber-collection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const observation_1 = require("../observation");
    const collection_size_observer_1 = require("./collection-size-observer");
    const subscriber_collection_1 = require("./subscriber-collection");
    const proto = Map.prototype;
    const $set = proto.set;
    const $clear = proto.clear;
    const $delete = proto.delete;
    const native = { set: $set, clear: $clear, delete: $delete };
    const methods = ['set', 'clear', 'delete'];
    // note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, map/delete/clear are easy to reconstruct for the indexMap
    const observe = {
        // https://tc39.github.io/ecma262/#sec-map.prototype.map
        set: function (key, value) {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                $set.call($this, key, value);
                return this;
            }
            const oldValue = $this.get(key);
            const oldSize = $this.size;
            $set.call($this, key, value);
            const newSize = $this.size;
            if (newSize === oldSize) {
                let i = 0;
                for (const entry of $this.entries()) {
                    if (entry[0] === key) {
                        if (entry[1] !== oldValue) {
                            o.indexMap.deletedItems.push(o.indexMap[i]);
                            o.indexMap[i] = -2;
                            o.notify();
                        }
                        return this;
                    }
                    i++;
                }
                return this;
            }
            o.indexMap[oldSize] = -2;
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.clear
        clear: function () {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                return $clear.call($this);
            }
            const size = $this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                for (const entry of $this.keys()) {
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
        // https://tc39.github.io/ecma262/#sec-map.prototype.delete
        delete: function (value) {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
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
                ++i;
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
    let enableMapObservationCalled = false;
    function enableMapObservation() {
        for (const method of methods) {
            if (proto[method].observing !== true) {
                def(proto, method, { ...descriptorProps, value: observe[method] });
            }
        }
    }
    exports.enableMapObservation = enableMapObservation;
    function disableMapObservation() {
        for (const method of methods) {
            if (proto[method].observing === true) {
                def(proto, method, { ...descriptorProps, value: native[method] });
            }
        }
    }
    exports.disableMapObservation = disableMapObservation;
    const slice = Array.prototype.slice;
    let MapObserver = class MapObserver {
        constructor(flags, lifecycle, map) {
            if (!enableMapObservationCalled) {
                enableMapObservationCalled = true;
                enableMapObservation();
            }
            this.inBatch = false;
            this.collection = map;
            this.persistentFlags = flags & 2080374799 /* persistentBindingFlags */;
            this.indexMap = observation_1.createIndexMap(map.size);
            this.lifecycle = lifecycle;
            this.lengthObserver = (void 0);
            map.$observer = this;
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
            if (this.lengthObserver === void 0) {
                this.lengthObserver = new collection_size_observer_1.CollectionSizeObserver(this.collection);
            }
            return this.lengthObserver;
        }
        flushBatch(flags) {
            this.inBatch = false;
            const { indexMap, collection } = this;
            const { size } = collection;
            this.indexMap = observation_1.createIndexMap(size);
            this.callCollectionSubscribers(indexMap, 16 /* updateTargetInstance */ | this.persistentFlags);
            if (this.lengthObserver !== void 0) {
                this.lengthObserver.setValue(size, 16 /* updateTargetInstance */);
            }
        }
    };
    MapObserver = tslib_1.__decorate([
        subscriber_collection_1.collectionSubscriberCollection()
    ], MapObserver);
    exports.MapObserver = MapObserver;
    function getMapObserver(flags, lifecycle, map) {
        if (map.$observer === void 0) {
            map.$observer = new MapObserver(flags, lifecycle, map);
        }
        return map.$observer;
    }
    exports.getMapObserver = getMapObserver;
});
//# sourceMappingURL=map-observer.js.map