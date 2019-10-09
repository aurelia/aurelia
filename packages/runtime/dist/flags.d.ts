export declare enum BindingMode {
    oneTime = 1,
    toView = 2,
    fromView = 4,
    twoWay = 6,
    default = 8
}
export declare const enum BindingStrategy {
    /**
     * Configures all components "below" this one to operate in getterSetter binding mode.
     * This is the default; if no strategy is specified, this one is implied.
     *
     * This strategy is the most compatible, convenient and has the best performance on frequently updated bindings on components that are infrequently replaced.
     * However, it also consumes the most resources on initialization.
     */
    getterSetter = 1,
    /**
     * Configures all components "below" this one to operate in proxy binding mode.
     * No getters/setters are created.
     *
     * This strategy consumes significantly fewer resources than `getterSetter` on initialization and has the best performance on infrequently updated bindings on
     * components that are frequently replaced.
     * However, it consumes more resources on updates.
     */
    proxies = 2
}
export declare function ensureValidStrategy(strategy: BindingStrategy | null | undefined): BindingStrategy;
export declare const enum State {
    none = 0,
    isBinding = 1,
    isUnbinding = 2,
    isBound = 4,
    isBoundOrBinding = 5,
    isBoundOrUnbinding = 6,
    isAttaching = 8,
    isDetaching = 16,
    isAttached = 32,
    isAttachedOrAttaching = 40,
    isAttachedOrDetaching = 48,
    isMounted = 64,
    isCached = 128,
    needsBind = 256,
    needsUnbind = 512,
    needsAttach = 1024,
    needsDetach = 2048,
    needsMount = 4096,
    needsUnmount = 8192,
    hasLockedScope = 16384,
    canBeCached = 32768,
    inBoundQueue = 65536,
    inUnboundQueue = 131072,
    inAttachedQueue = 262144,
    inDetachedQueue = 524288,
    inMountQueue = 1048576,
    inUnmountQueue = 2097152
}
export declare const enum Hooks {
    none = 1,
    hasCreated = 2,
    hasBinding = 4,
    hasBound = 8,
    hasAttaching = 16,
    hasAttached = 32,
    hasDetaching = 64,
    hasDetached = 128,
    hasUnbinding = 256,
    hasUnbound = 512,
    hasRender = 1024,
    hasCaching = 2048
}
export declare const enum LifecycleFlags {
    none = 0,
    persistentBindingFlags = 2080374799,
    allowParentScopeTraversal = 67108864,
    observeLeafPropertiesOnly = 134217728,
    targetObserverFlags = 805306383,
    noTargetObserverQueue = 268435456,
    persistentTargetObserverQueue = 536870912,
    secondaryExpression = 1073741824,
    bindingStrategy = 15,
    getterSetterStrategy = 1,
    proxyStrategy = 2,
    isStrictBindingStrategy = 4,
    update = 48,
    updateTargetInstance = 16,
    updateSourceExpression = 32,
    from = 524224,
    fromFlush = 960,
    fromAsyncFlush = 64,
    fromSyncFlush = 128,
    fromTick = 256,
    fromBatch = 512,
    fromStartTask = 1024,
    fromStopTask = 2048,
    fromBind = 4096,
    fromUnbind = 8192,
    fromAttach = 16384,
    fromDetach = 32768,
    fromCache = 65536,
    fromDOMEvent = 131072,
    fromLifecycleTask = 262144,
    allowPublishRoundtrip = 524288,
    isPublishing = 1048576,
    mustEvaluate = 2097152,
    isTraversingParentScope = 4194304,
    isOriginalArray = 8388608,
    isCollectionMutation = 16777216,
    reorderNodes = 33554432
}
export declare const enum ExpressionKind {
    Connects = 32,
    Observes = 64,
    CallsFunction = 128,
    HasAncestor = 256,
    IsPrimary = 512,
    IsLeftHandSide = 1024,
    HasBind = 2048,
    HasUnbind = 4096,
    IsAssignable = 8192,
    IsLiteral = 16384,
    IsResource = 32768,
    IsForDeclaration = 65536,
    Type = 31,
    AccessThis = 1793,
    AccessScope = 10082,
    ArrayLiteral = 17955,
    ObjectLiteral = 17956,
    PrimitiveLiteral = 17925,
    Template = 17958,
    Unary = 39,
    CallScope = 1448,
    CallMember = 1161,
    CallFunction = 1162,
    AccessMember = 9323,
    AccessKeyed = 9324,
    TaggedTemplate = 1197,
    Binary = 46,
    Conditional = 63,
    Assign = 8208,
    ValueConverter = 36913,
    BindingBehavior = 38962,
    HtmlLiteral = 51,
    ArrayBindingPattern = 65556,
    ObjectBindingPattern = 65557,
    BindingIdentifier = 65558,
    ForOfStatement = 6199,
    Interpolation = 24
}
//# sourceMappingURL=flags.d.ts.map