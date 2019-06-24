/** @internal */
export var SubscriberFlags;
(function (SubscriberFlags) {
    SubscriberFlags[SubscriberFlags["None"] = 0] = "None";
    SubscriberFlags[SubscriberFlags["Subscriber0"] = 1] = "Subscriber0";
    SubscriberFlags[SubscriberFlags["Subscriber1"] = 2] = "Subscriber1";
    SubscriberFlags[SubscriberFlags["Subscriber2"] = 4] = "Subscriber2";
    SubscriberFlags[SubscriberFlags["SubscribersRest"] = 8] = "SubscribersRest";
    SubscriberFlags[SubscriberFlags["Any"] = 15] = "Any";
})(SubscriberFlags || (SubscriberFlags = {}));
export var DelegationStrategy;
(function (DelegationStrategy) {
    DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
    DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
    DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
})(DelegationStrategy || (DelegationStrategy = {}));
export var CollectionKind;
(function (CollectionKind) {
    CollectionKind[CollectionKind["indexed"] = 8] = "indexed";
    CollectionKind[CollectionKind["keyed"] = 4] = "keyed";
    CollectionKind[CollectionKind["array"] = 9] = "array";
    CollectionKind[CollectionKind["map"] = 6] = "map";
    CollectionKind[CollectionKind["set"] = 7] = "set";
})(CollectionKind || (CollectionKind = {}));
export function copyIndexMap(existing, deletedItems) {
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
export function createIndexMap(length = 0) {
    const arr = Array(length);
    let i = 0;
    while (i < length) {
        arr[i] = i++;
    }
    arr.deletedItems = [];
    arr.isIndexMap = true;
    return arr;
}
export function cloneIndexMap(indexMap) {
    const clone = indexMap.slice();
    clone.deletedItems = indexMap.deletedItems.slice();
    clone.isIndexMap = true;
    return clone;
}
export function isIndexMap(value) {
    return value instanceof Array && value.isIndexMap === true;
}
//# sourceMappingURL=observation.js.map