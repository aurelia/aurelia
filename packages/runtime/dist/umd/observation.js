var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isIndexMap = exports.cloneIndexMap = exports.createIndexMap = exports.copyIndexMap = exports.AccessorType = exports.CollectionKind = exports.DelegationStrategy = exports.SubscriberFlags = exports.LifecycleFlags = exports.BindingMode = exports.BatchQueue = exports.Lifecycle = exports.ILifecycle = void 0;
    const kernel_1 = require("@aurelia/kernel");
    exports.ILifecycle = kernel_1.DI.createInterface('ILifecycle', x => x.singleton(Lifecycle));
    class Lifecycle {
        constructor() {
            this.batch = new BatchQueue(this);
        }
    }
    exports.Lifecycle = Lifecycle;
    let BatchQueue = class BatchQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.queue = [];
            this.depth = 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(requestor) {
            this.queue.push(requestor);
        }
        remove(requestor) {
            const index = this.queue.indexOf(requestor);
            if (index > -1) {
                this.queue.splice(index, 1);
            }
        }
        process(flags) {
            while (this.queue.length > 0) {
                const batch = this.queue.slice();
                this.queue = [];
                const { length } = batch;
                for (let i = 0; i < length; ++i) {
                    batch[i].flushBatch(flags);
                }
            }
        }
    };
    BatchQueue = __decorate([
        __param(0, exports.ILifecycle)
    ], BatchQueue);
    exports.BatchQueue = BatchQueue;
    /*
    * Note: the oneTime binding now has a non-zero value for 2 reasons:
    *  - plays nicer with bitwise operations (more consistent code, more explicit settings)
    *  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
    *
    * Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
    * This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
    */
    var BindingMode;
    (function (BindingMode) {
        BindingMode[BindingMode["oneTime"] = 1] = "oneTime";
        BindingMode[BindingMode["toView"] = 2] = "toView";
        BindingMode[BindingMode["fromView"] = 4] = "fromView";
        BindingMode[BindingMode["twoWay"] = 6] = "twoWay";
        BindingMode[BindingMode["default"] = 8] = "default";
    })(BindingMode = exports.BindingMode || (exports.BindingMode = {}));
    var LifecycleFlags;
    (function (LifecycleFlags) {
        LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
        // Bitmask for flags that need to be stored on a binding during $bind for mutation
        // callbacks outside of $bind
        LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 15367] = "persistentBindingFlags";
        LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 1024] = "allowParentScopeTraversal";
        LifecycleFlags[LifecycleFlags["observeLeafPropertiesOnly"] = 2048] = "observeLeafPropertiesOnly";
        LifecycleFlags[LifecycleFlags["targetObserverFlags"] = 12295] = "targetObserverFlags";
        LifecycleFlags[LifecycleFlags["noFlush"] = 4096] = "noFlush";
        LifecycleFlags[LifecycleFlags["persistentTargetObserverQueue"] = 8192] = "persistentTargetObserverQueue";
        LifecycleFlags[LifecycleFlags["bindingStrategy"] = 7] = "bindingStrategy";
        LifecycleFlags[LifecycleFlags["getterSetterStrategy"] = 1] = "getterSetterStrategy";
        LifecycleFlags[LifecycleFlags["proxyStrategy"] = 2] = "proxyStrategy";
        LifecycleFlags[LifecycleFlags["isStrictBindingStrategy"] = 4] = "isStrictBindingStrategy";
        LifecycleFlags[LifecycleFlags["update"] = 24] = "update";
        LifecycleFlags[LifecycleFlags["updateTarget"] = 8] = "updateTarget";
        LifecycleFlags[LifecycleFlags["updateSource"] = 16] = "updateSource";
        LifecycleFlags[LifecycleFlags["from"] = 96] = "from";
        LifecycleFlags[LifecycleFlags["fromBind"] = 32] = "fromBind";
        LifecycleFlags[LifecycleFlags["fromUnbind"] = 64] = "fromUnbind";
        LifecycleFlags[LifecycleFlags["mustEvaluate"] = 128] = "mustEvaluate";
        LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 256] = "isTraversingParentScope";
        LifecycleFlags[LifecycleFlags["dispose"] = 512] = "dispose";
    })(LifecycleFlags = exports.LifecycleFlags || (exports.LifecycleFlags = {}));
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
        // misc characteristic of accessors/observers when update
        //
        // by default, everything is synchronous
        // except changes that are supposed to cause reflow/heavy computation
        // an observer can use this flag to signal binding that don't carelessly tell it to update
        // queue it instead
        // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
        // todo: https://csstriggers.com/
        AccessorType[AccessorType["Layout"] = 8] = "Layout";
        AccessorType[AccessorType["Array"] = 18] = "Array";
        AccessorType[AccessorType["Set"] = 34] = "Set";
        AccessorType[AccessorType["Map"] = 66] = "Map";
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