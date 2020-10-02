(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isIndexMap = exports.cloneIndexMap = exports.createIndexMap = exports.copyIndexMap = exports.AccessorType = exports.CollectionKind = exports.DelegationStrategy = exports.SubscriberFlags = void 0;
    /** @internal */
    var SubscriberFlags;
    (function (SubscriberFlags) {
        SubscriberFlags[SubscriberFlags["None"] = 0] = "None";
        SubscriberFlags[SubscriberFlags["Subscriber0"] = 1] = "Subscriber0";
        SubscriberFlags[SubscriberFlags["Subscriber1"] = 2] = "Subscriber1";
        SubscriberFlags[SubscriberFlags["Subscriber2"] = 4] = "Subscriber2";
        SubscriberFlags[SubscriberFlags["SubscribersRest"] = 8] = "SubscribersRest";
        SubscriberFlags[SubscriberFlags["Any"] = 15] = "Any";
    })(SubscriberFlags = exports.SubscriberFlags || (exports.SubscriberFlags = {}));
    var DelegationStrategy;
    (function (DelegationStrategy) {
        DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
        DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
        DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
    })(DelegationStrategy = exports.DelegationStrategy || (exports.DelegationStrategy = {}));
    var CollectionKind;
    (function (CollectionKind) {
        CollectionKind[CollectionKind["indexed"] = 8] = "indexed";
        CollectionKind[CollectionKind["keyed"] = 4] = "keyed";
        CollectionKind[CollectionKind["array"] = 9] = "array";
        CollectionKind[CollectionKind["map"] = 6] = "map";
        CollectionKind[CollectionKind["set"] = 7] = "set";
    })(CollectionKind = exports.CollectionKind || (exports.CollectionKind = {}));
    var AccessorType;
    (function (AccessorType) {
        AccessorType[AccessorType["None"] = 0] = "None";
        AccessorType[AccessorType["Observer"] = 1] = "Observer";
        AccessorType[AccessorType["Node"] = 2] = "Node";
        AccessorType[AccessorType["Obj"] = 4] = "Obj";
        AccessorType[AccessorType["Array"] = 10] = "Array";
        AccessorType[AccessorType["Set"] = 18] = "Set";
        AccessorType[AccessorType["Map"] = 34] = "Map";
        // misc characteristic of observer when update
        //
        // by default, everything is synchronous
        // except changes that are supposed to cause reflow/heavy computation
        // an observer can use this flag to signal binding that don't carelessly tell it to update
        // queue it instead
        // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
        // todo: https://csstriggers.com/
        AccessorType[AccessorType["Layout"] = 64] = "Layout";
        // there needs to be a flag to signal that accessor real value
        // may get out of sync with binding value
        // so that binding can ask for a force read instead of cache read
    })(AccessorType = exports.AccessorType || (exports.AccessorType = {}));
    function copyIndexMap(existing, deletedItems) {
        const { length } = existing;
        const arr = Array(length);
        let i = 0;
        while (i < length) {
            arr[i] = existing[i];
            ++i;
        }
        if (deletedItems !== void 0) {
            arr.deletedItems = deletedItems.slice(0);
        }
        else if (existing.deletedItems !== void 0) {
            arr.deletedItems = existing.deletedItems.slice(0);
        }
        else {
            arr.deletedItems = [];
        }
        arr.isIndexMap = true;
        return arr;
    }
    exports.copyIndexMap = copyIndexMap;
    function createIndexMap(length = 0) {
        const arr = Array(length);
        let i = 0;
        while (i < length) {
            arr[i] = i++;
        }
        arr.deletedItems = [];
        arr.isIndexMap = true;
        return arr;
    }
    exports.createIndexMap = createIndexMap;
    function cloneIndexMap(indexMap) {
        const clone = indexMap.slice();
        clone.deletedItems = indexMap.deletedItems.slice();
        clone.isIndexMap = true;
        return clone;
    }
    exports.cloneIndexMap = cloneIndexMap;
    function isIndexMap(value) {
        return value instanceof Array && value.isIndexMap === true;
    }
    exports.isIndexMap = isIndexMap;
});
//# sourceMappingURL=observation.js.map