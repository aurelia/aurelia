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
    var BindingStrategy;
    (function (BindingStrategy) {
        /**
         * Configures all components "below" this one to operate in getterSetter binding mode.
         * This is the default; if no strategy is specified, this one is implied.
         *
         * This strategy is the most compatible, convenient and has the best performance on frequently updated bindings on components that are infrequently replaced.
         * However, it also consumes the most resources on initialization.
         */
        BindingStrategy[BindingStrategy["getterSetter"] = 1] = "getterSetter";
        /**
         * Configures all components "below" this one to operate in proxy binding mode.
         * No getters/setters are created.
         *
         * This strategy consumes significantly fewer resources than `getterSetter` on initialization and has the best performance on infrequently updated bindings on
         * components that are frequently replaced.
         * However, it consumes more resources on updates.
         */
        BindingStrategy[BindingStrategy["proxies"] = 2] = "proxies";
    })(BindingStrategy = exports.BindingStrategy || (exports.BindingStrategy = {}));
    const mandatoryStrategy = 1 /* getterSetter */ | 2 /* proxies */;
    function ensureValidStrategy(strategy) {
        if ((strategy & mandatoryStrategy) === 0) {
            // TODO: probably want to validate that user isn't trying to mix getterSetter/proxy
            // TODO: also need to make sure that strategy can be changed away from proxies inside the component tree (not here though, but just making a note)
            return strategy | 1 /* getterSetter */;
        }
        return strategy;
    }
    exports.ensureValidStrategy = ensureValidStrategy;
    var State;
    (function (State) {
        State[State["none"] = 0] = "none";
        State[State["isBinding"] = 1] = "isBinding";
        State[State["isUnbinding"] = 2] = "isUnbinding";
        State[State["isBound"] = 4] = "isBound";
        State[State["isBoundOrBinding"] = 5] = "isBoundOrBinding";
        State[State["isBoundOrUnbinding"] = 6] = "isBoundOrUnbinding";
        State[State["isAttaching"] = 8] = "isAttaching";
        State[State["isDetaching"] = 16] = "isDetaching";
        State[State["isAttached"] = 32] = "isAttached";
        State[State["isAttachedOrAttaching"] = 40] = "isAttachedOrAttaching";
        State[State["isAttachedOrDetaching"] = 48] = "isAttachedOrDetaching";
        State[State["isMounted"] = 64] = "isMounted";
        State[State["isCached"] = 128] = "isCached";
        State[State["needsBind"] = 256] = "needsBind";
        State[State["needsUnbind"] = 512] = "needsUnbind";
        State[State["needsAttach"] = 1024] = "needsAttach";
        State[State["needsDetach"] = 2048] = "needsDetach";
        State[State["needsMount"] = 4096] = "needsMount";
        State[State["needsUnmount"] = 8192] = "needsUnmount";
        State[State["hasLockedScope"] = 16384] = "hasLockedScope";
        State[State["canBeCached"] = 32768] = "canBeCached";
        State[State["inBoundQueue"] = 65536] = "inBoundQueue";
        State[State["inUnboundQueue"] = 131072] = "inUnboundQueue";
        State[State["inAttachedQueue"] = 262144] = "inAttachedQueue";
        State[State["inDetachedQueue"] = 524288] = "inDetachedQueue";
        State[State["inMountQueue"] = 1048576] = "inMountQueue";
        State[State["inUnmountQueue"] = 2097152] = "inUnmountQueue";
    })(State = exports.State || (exports.State = {}));
    var Hooks;
    (function (Hooks) {
        Hooks[Hooks["none"] = 1] = "none";
        Hooks[Hooks["hasCreated"] = 2] = "hasCreated";
        Hooks[Hooks["hasBinding"] = 4] = "hasBinding";
        Hooks[Hooks["hasBound"] = 8] = "hasBound";
        Hooks[Hooks["hasAttaching"] = 16] = "hasAttaching";
        Hooks[Hooks["hasAttached"] = 32] = "hasAttached";
        Hooks[Hooks["hasDetaching"] = 64] = "hasDetaching";
        Hooks[Hooks["hasDetached"] = 128] = "hasDetached";
        Hooks[Hooks["hasUnbinding"] = 256] = "hasUnbinding";
        Hooks[Hooks["hasUnbound"] = 512] = "hasUnbound";
        Hooks[Hooks["hasRender"] = 1024] = "hasRender";
        Hooks[Hooks["hasCaching"] = 2048] = "hasCaching";
    })(Hooks = exports.Hooks || (exports.Hooks = {}));
    var LifecycleFlags;
    (function (LifecycleFlags) {
        LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
        // Bitmask for flags that need to be stored on a binding during $bind for mutation
        // callbacks outside of $bind
        LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 2080374799] = "persistentBindingFlags";
        LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 67108864] = "allowParentScopeTraversal";
        LifecycleFlags[LifecycleFlags["observeLeafPropertiesOnly"] = 134217728] = "observeLeafPropertiesOnly";
        LifecycleFlags[LifecycleFlags["targetObserverFlags"] = 805306383] = "targetObserverFlags";
        LifecycleFlags[LifecycleFlags["noTargetObserverQueue"] = 268435456] = "noTargetObserverQueue";
        LifecycleFlags[LifecycleFlags["persistentTargetObserverQueue"] = 536870912] = "persistentTargetObserverQueue";
        LifecycleFlags[LifecycleFlags["secondaryExpression"] = 1073741824] = "secondaryExpression";
        LifecycleFlags[LifecycleFlags["bindingStrategy"] = 15] = "bindingStrategy";
        LifecycleFlags[LifecycleFlags["getterSetterStrategy"] = 1] = "getterSetterStrategy";
        LifecycleFlags[LifecycleFlags["proxyStrategy"] = 2] = "proxyStrategy";
        LifecycleFlags[LifecycleFlags["isStrictBindingStrategy"] = 4] = "isStrictBindingStrategy";
        LifecycleFlags[LifecycleFlags["update"] = 48] = "update";
        LifecycleFlags[LifecycleFlags["updateTargetInstance"] = 16] = "updateTargetInstance";
        LifecycleFlags[LifecycleFlags["updateSourceExpression"] = 32] = "updateSourceExpression";
        LifecycleFlags[LifecycleFlags["from"] = 524224] = "from";
        LifecycleFlags[LifecycleFlags["fromFlush"] = 960] = "fromFlush";
        LifecycleFlags[LifecycleFlags["fromAsyncFlush"] = 64] = "fromAsyncFlush";
        LifecycleFlags[LifecycleFlags["fromSyncFlush"] = 128] = "fromSyncFlush";
        LifecycleFlags[LifecycleFlags["fromTick"] = 256] = "fromTick";
        LifecycleFlags[LifecycleFlags["fromBatch"] = 512] = "fromBatch";
        LifecycleFlags[LifecycleFlags["fromStartTask"] = 1024] = "fromStartTask";
        LifecycleFlags[LifecycleFlags["fromStopTask"] = 2048] = "fromStopTask";
        LifecycleFlags[LifecycleFlags["fromBind"] = 4096] = "fromBind";
        LifecycleFlags[LifecycleFlags["fromUnbind"] = 8192] = "fromUnbind";
        LifecycleFlags[LifecycleFlags["fromAttach"] = 16384] = "fromAttach";
        LifecycleFlags[LifecycleFlags["fromDetach"] = 32768] = "fromDetach";
        LifecycleFlags[LifecycleFlags["fromCache"] = 65536] = "fromCache";
        LifecycleFlags[LifecycleFlags["fromDOMEvent"] = 131072] = "fromDOMEvent";
        LifecycleFlags[LifecycleFlags["fromLifecycleTask"] = 262144] = "fromLifecycleTask";
        LifecycleFlags[LifecycleFlags["allowPublishRoundtrip"] = 524288] = "allowPublishRoundtrip";
        LifecycleFlags[LifecycleFlags["isPublishing"] = 1048576] = "isPublishing";
        LifecycleFlags[LifecycleFlags["mustEvaluate"] = 2097152] = "mustEvaluate";
        LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 4194304] = "isTraversingParentScope";
        LifecycleFlags[LifecycleFlags["isOriginalArray"] = 8388608] = "isOriginalArray";
        LifecycleFlags[LifecycleFlags["isCollectionMutation"] = 16777216] = "isCollectionMutation";
        LifecycleFlags[LifecycleFlags["reorderNodes"] = 33554432] = "reorderNodes";
    })(LifecycleFlags = exports.LifecycleFlags || (exports.LifecycleFlags = {}));
    var ExpressionKind;
    (function (ExpressionKind) {
        ExpressionKind[ExpressionKind["Connects"] = 32] = "Connects";
        ExpressionKind[ExpressionKind["Observes"] = 64] = "Observes";
        ExpressionKind[ExpressionKind["CallsFunction"] = 128] = "CallsFunction";
        ExpressionKind[ExpressionKind["HasAncestor"] = 256] = "HasAncestor";
        ExpressionKind[ExpressionKind["IsPrimary"] = 512] = "IsPrimary";
        ExpressionKind[ExpressionKind["IsLeftHandSide"] = 1024] = "IsLeftHandSide";
        ExpressionKind[ExpressionKind["HasBind"] = 2048] = "HasBind";
        ExpressionKind[ExpressionKind["HasUnbind"] = 4096] = "HasUnbind";
        ExpressionKind[ExpressionKind["IsAssignable"] = 8192] = "IsAssignable";
        ExpressionKind[ExpressionKind["IsLiteral"] = 16384] = "IsLiteral";
        ExpressionKind[ExpressionKind["IsResource"] = 32768] = "IsResource";
        ExpressionKind[ExpressionKind["IsForDeclaration"] = 65536] = "IsForDeclaration";
        ExpressionKind[ExpressionKind["Type"] = 31] = "Type";
        // ---------------------------------------------------------------------------------------------------------------------------
        ExpressionKind[ExpressionKind["AccessThis"] = 1793] = "AccessThis";
        ExpressionKind[ExpressionKind["AccessScope"] = 10082] = "AccessScope";
        ExpressionKind[ExpressionKind["ArrayLiteral"] = 17955] = "ArrayLiteral";
        ExpressionKind[ExpressionKind["ObjectLiteral"] = 17956] = "ObjectLiteral";
        ExpressionKind[ExpressionKind["PrimitiveLiteral"] = 17925] = "PrimitiveLiteral";
        ExpressionKind[ExpressionKind["Template"] = 17958] = "Template";
        ExpressionKind[ExpressionKind["Unary"] = 39] = "Unary";
        ExpressionKind[ExpressionKind["CallScope"] = 1448] = "CallScope";
        ExpressionKind[ExpressionKind["CallMember"] = 1161] = "CallMember";
        ExpressionKind[ExpressionKind["CallFunction"] = 1162] = "CallFunction";
        ExpressionKind[ExpressionKind["AccessMember"] = 9323] = "AccessMember";
        ExpressionKind[ExpressionKind["AccessKeyed"] = 9324] = "AccessKeyed";
        ExpressionKind[ExpressionKind["TaggedTemplate"] = 1197] = "TaggedTemplate";
        ExpressionKind[ExpressionKind["Binary"] = 46] = "Binary";
        ExpressionKind[ExpressionKind["Conditional"] = 63] = "Conditional";
        ExpressionKind[ExpressionKind["Assign"] = 8208] = "Assign";
        ExpressionKind[ExpressionKind["ValueConverter"] = 36913] = "ValueConverter";
        ExpressionKind[ExpressionKind["BindingBehavior"] = 38962] = "BindingBehavior";
        ExpressionKind[ExpressionKind["HtmlLiteral"] = 51] = "HtmlLiteral";
        ExpressionKind[ExpressionKind["ArrayBindingPattern"] = 65556] = "ArrayBindingPattern";
        ExpressionKind[ExpressionKind["ObjectBindingPattern"] = 65557] = "ObjectBindingPattern";
        ExpressionKind[ExpressionKind["BindingIdentifier"] = 65558] = "BindingIdentifier";
        ExpressionKind[ExpressionKind["ForOfStatement"] = 6199] = "ForOfStatement";
        ExpressionKind[ExpressionKind["Interpolation"] = 24] = "Interpolation"; //
    })(ExpressionKind = exports.ExpressionKind || (exports.ExpressionKind = {}));
});
//# sourceMappingURL=flags.js.map