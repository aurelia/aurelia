(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../observation.js", "./collection-length-observer.js", "./subscriber-collection.js", "../utilities-objects.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMapObserver = exports.MapObserver = exports.disableMapObservation = exports.enableMapObservation = void 0;
    const observation_js_1 = require("../observation.js");
    const collection_length_observer_js_1 = require("./collection-length-observer.js");
    const subscriber_collection_js_1 = require("./subscriber-collection.js");
    const utilities_objects_js_1 = require("../utilities-objects.js");
    const observerLookup = new WeakMap();
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
            const o = observerLookup.get(this);
            if (o === undefined) {
                $set.call(this, key, value);
                return this;
            }
            const oldValue = this.get(key);
            const oldSize = this.size;
            $set.call(this, key, value);
            const newSize = this.size;
            if (newSize === oldSize) {
                let i = 0;
                for (const entry of this.entries()) {
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
            const o = observerLookup.get(this);
            if (o === undefined) {
                return $clear.call(this);
            }
            const size = this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                // deepscan-disable-next-line
                for (const _ of this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    i++;
                }
                $clear.call(this);
                indexMap.length = 0;
                o.notify();
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.delete
        delete: function (value) {
            const o = observerLookup.get(this);
            if (o === undefined) {
                return $delete.call(this, value);
            }
            const size = this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    indexMap.splice(i, 1);
                    const deleteResult = $delete.call(this, value);
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
    for (const method of methods) {
        utilities_objects_js_1.def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    let enableMapObservationCalled = false;
    function enableMapObservation() {
        for (const method of methods) {
            if (proto[method].observing !== true) {
                utilities_objects_js_1.def(proto, method, { ...descriptorProps, value: observe[method] });
            }
        }
    }
    exports.enableMapObservation = enableMapObservation;
    function disableMapObservation() {
        for (const method of methods) {
            if (proto[method].observing === true) {
                utilities_objects_js_1.def(proto, method, { ...descriptorProps, value: native[method] });
            }
        }
    }
    exports.disableMapObservation = disableMapObservation;
    class MapObserver {
        constructor(map) {
            this.type = 66 /* Map */;
            if (!enableMapObservationCalled) {
                enableMapObservationCalled = true;
                enableMapObservation();
            }
            this.collection = map;
            this.indexMap = observation_js_1.createIndexMap(map.size);
            this.lenObs = void 0;
            observerLookup.set(map, this);
        }
        notify() {
            const indexMap = this.indexMap;
            const size = this.collection.size;
            this.indexMap = observation_js_1.createIndexMap(size);
            this.subs.notifyCollection(indexMap, 8 /* updateTarget */);
        }
        getLengthObserver() {
            var _a;
            return (_a = this.lenObs) !== null && _a !== void 0 ? _a : (this.lenObs = new collection_length_observer_js_1.CollectionSizeObserver(this));
        }
    }
    exports.MapObserver = MapObserver;
    subscriber_collection_js_1.subscriberCollection(MapObserver);
    function getMapObserver(map) {
        let observer = observerLookup.get(map);
        if (observer === void 0) {
            observer = new MapObserver(map);
        }
        return observer;
    }
    exports.getMapObserver = getMapObserver;
});
//# sourceMappingURL=map-observer.js.map