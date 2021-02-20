/*
* Note: the oneTime binding now has a non-zero value for 2 reasons:
*  - plays nicer with bitwise operations (more consistent code, more explicit settings)
*  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
*
* Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
* This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
*/
export var BindingMode;
(function (BindingMode) {
    BindingMode[BindingMode["oneTime"] = 1] = "oneTime";
    BindingMode[BindingMode["toView"] = 2] = "toView";
    BindingMode[BindingMode["fromView"] = 4] = "fromView";
    BindingMode[BindingMode["twoWay"] = 6] = "twoWay";
    BindingMode[BindingMode["default"] = 8] = "default";
})(BindingMode || (BindingMode = {}));
export var LifecycleFlags;
(function (LifecycleFlags) {
    LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
    // Bitmask for flags that need to be stored on a binding during $bind for mutation
    // callbacks outside of $bind
    LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 961] = "persistentBindingFlags";
    LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 64] = "allowParentScopeTraversal";
    LifecycleFlags[LifecycleFlags["observeLeafPropertiesOnly"] = 128] = "observeLeafPropertiesOnly";
    LifecycleFlags[LifecycleFlags["targetObserverFlags"] = 769] = "targetObserverFlags";
    LifecycleFlags[LifecycleFlags["noFlush"] = 256] = "noFlush";
    LifecycleFlags[LifecycleFlags["persistentTargetObserverQueue"] = 512] = "persistentTargetObserverQueue";
    LifecycleFlags[LifecycleFlags["bindingStrategy"] = 1] = "bindingStrategy";
    LifecycleFlags[LifecycleFlags["isStrictBindingStrategy"] = 1] = "isStrictBindingStrategy";
    LifecycleFlags[LifecycleFlags["fromBind"] = 2] = "fromBind";
    LifecycleFlags[LifecycleFlags["fromUnbind"] = 4] = "fromUnbind";
    LifecycleFlags[LifecycleFlags["mustEvaluate"] = 8] = "mustEvaluate";
    LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 16] = "isTraversingParentScope";
    LifecycleFlags[LifecycleFlags["dispose"] = 32] = "dispose";
})(LifecycleFlags || (LifecycleFlags = {}));
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
export var AccessorType;
(function (AccessorType) {
    AccessorType[AccessorType["None"] = 0] = "None";
    AccessorType[AccessorType["Observer"] = 1] = "Observer";
    AccessorType[AccessorType["Node"] = 2] = "Node";
    // misc characteristic of accessors/observers when update
    //
    // by default, everything is synchronous
    // except changes that are supposed to cause reflow/heavy computation
    // an observer can use this flag to signal binding that don't carelessly tell it to update
    // queue it instead
    // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    // todo: https://csstriggers.com/
    AccessorType[AccessorType["Layout"] = 4] = "Layout";
    // by default, everything is an object
    // eg: a property is accessed on an object
    // unless explicitly not so
    AccessorType[AccessorType["Primtive"] = 8] = "Primtive";
    AccessorType[AccessorType["Array"] = 18] = "Array";
    AccessorType[AccessorType["Set"] = 34] = "Set";
    AccessorType[AccessorType["Map"] = 66] = "Map";
})(AccessorType || (AccessorType = {}));
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