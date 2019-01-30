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
     *
     * Cannot be combined with `proxies` or `patch`.
     */
    getterSetter = 1,
    /**
     * Configures all components "below" this one to operate in proxy binding mode.
     * No getters/setters are created.
     *
     * This strategy consumes significantly fewer resources than `getterSetter` on initialization and has the best performance on infrequently updated bindings on
     * components that are frequently replaced.
     * However, it consumes more resources on updates.
     *
     * Cannot be combined with `getterSetter` or `patch`.
     */
    proxies = 2,
    /**
     * Configures all components "below" this one to operate in patched binding mode.
     * Nothing is observed; to propagate changes, you manually need to call `$patch` on the component.
     *
     * This strategy consumes the least amount of resources and has the fastest initialization.
     * Performance on updates will depend heavily on how it's used, but tends to be worse on a large number of
     * nested bindings/components due to a larger number of reads on all properties.
     *
     * Cannot be combined with `getterSetter` or `proxies`.
     */
    patch = 4,
    /**
     * Configures any repeaters "below" this component to operate in keyed mode.
     * To only put a single repeater in that mode, use `& keyed` (this will change to track-by etc soon)
     *
     * Can be combined with either `getterSetter`, `proxies` or `patch`.
     */
    keyed = 8
}
export declare function ensureValidStrategy(strategy: BindingStrategy | null | undefined): BindingStrategy;
export declare const enum State {
    none = 0,
    isBinding = 1,
    isBound = 2,
    isAttaching = 4,
    isAttached = 8,
    isMounted = 16,
    isDetaching = 32,
    isUnbinding = 64,
    isCached = 128,
    isContainerless = 256,
    isPatching = 512
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
export declare enum LifecycleFlags {
    none = 0,
    mustEvaluate = 8388608,
    bindingStrategy = 15,
    getterSetterStrategy = 1,
    proxyStrategy = 2,
    patchStrategy = 4,
    keyedStrategy = 8,
    mutation = 48,
    isCollectionMutation = 16,
    isInstanceMutation = 32,
    update = 448,
    updateTargetObserver = 64,
    updateTargetInstance = 128,
    updateSourceExpression = 256,
    from = 8388096,
    fromFlush = 3584,
    fromAsyncFlush = 512,
    fromSyncFlush = 1024,
    fromTick = 2048,
    fromStartTask = 4096,
    fromStopTask = 8192,
    fromBind = 16384,
    fromUnbind = 32768,
    fromAttach = 65536,
    fromDetach = 131072,
    fromCache = 262144,
    fromDOMEvent = 524288,
    fromObserverSetter = 1048576,
    fromBindableHandler = 2097152,
    fromLifecycleTask = 4194304,
    parentUnmountQueued = 16777216,
    doNotUpdateDOM = 33554432,
    isTraversingParentScope = 67108864,
    isOriginalArray = 134217728,
    persistentBindingFlags = 268435471,
    allowParentScopeTraversal = 268435456
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