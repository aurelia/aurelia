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
export declare const enum LifecycleFlags {
    none = 0,
    persistentBindingFlags = 31751,
    allowParentScopeTraversal = 1024,
    observeLeafPropertiesOnly = 2048,
    targetObserverFlags = 12295,
    noTargetObserverQueue = 4096,
    persistentTargetObserverQueue = 8192,
    secondaryExpression = 16384,
    bindingStrategy = 7,
    getterSetterStrategy = 1,
    proxyStrategy = 2,
    isStrictBindingStrategy = 4,
    update = 24,
    updateTargetInstance = 8,
    updateSourceExpression = 16,
    from = 96,
    fromBind = 32,
    fromUnbind = 64,
    mustEvaluate = 128,
    isTraversingParentScope = 256,
    dispose = 512
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