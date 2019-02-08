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
export declare const enum LifecycleFlags {
    none = 0,
    persistentBindingFlags = 67108879,
    allowParentScopeTraversal = 67108864,
    bindingStrategy = 15,
    getterSetterStrategy = 1,
    proxyStrategy = 2,
    patchStrategy = 4,
    keyedStrategy = 8,
    update = 48,
    updateTargetInstance = 16,
    updateSourceExpression = 32,
    from = 262080,
    fromFlush = 448,
    fromAsyncFlush = 64,
    fromSyncFlush = 128,
    fromTick = 256,
    fromStartTask = 512,
    fromStopTask = 1024,
    fromBind = 2048,
    fromUnbind = 4096,
    fromAttach = 8192,
    fromDetach = 16384,
    fromCache = 32768,
    fromDOMEvent = 65536,
    fromLifecycleTask = 131072,
    allowPublishRoundtrip = 262144,
    isPublishing = 524288,
    mustEvaluate = 1048576,
    parentUnmountQueued = 2097152,
    doNotUpdateDOM = 4194304,
    isTraversingParentScope = 8388608,
    isOriginalArray = 16777216,
    isCollectionMutation = 33554432
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