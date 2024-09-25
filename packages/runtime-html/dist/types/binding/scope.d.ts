export interface IBindingContext {
    [key: PropertyKey]: any;
}
export interface IOverrideContext {
    [key: PropertyKey]: any;
}
export declare class Scope {
    parent: Scope | null;
    bindingContext: IBindingContext;
    overrideContext: IOverrideContext;
    readonly isBoundary: boolean;
    private constructor();
    static getContext(scope: Scope, name: string, ancestor: number): IBindingContext | IOverrideContext | undefined | null;
    /**
     * Create a new `Scope` backed by the provided `BindingContext` and a new standalone `OverrideContext`.
     *
     * Use this overload when the scope is for the root component, in a unit test,
     * or when you simply want to prevent binding expressions from traversing up the scope.
     *
     * @param bc - The `BindingContext` to back the `Scope` with.
     */
    static create(bc: object): Scope;
    /**
     * Create a new `Scope` backed by the provided `BindingContext` and `OverrideContext`.
     *
     * @param bc - The `BindingContext` to back the `Scope` with.
     * @param oc - The `OverrideContext` to back the `Scope` with.
     * If a binding expression attempts to access a property that does not exist on the `BindingContext`
     * during binding, it will traverse up via the `parentScope` of the scope until
     * it finds the property.
     */
    static create(bc: object, oc: IOverrideContext, isBoundary?: boolean): Scope;
    /**
     * Create a new `Scope` backed by the provided `BindingContext` and `OverrideContext`.
     *
     * Use this overload when the scope is for the root component, in a unit test,
     * or when you simply want to prevent binding expressions from traversing up the scope.
     *
     * @param bc - The `BindingContext` to back the `Scope` with.
     * @param oc - null. This overload is functionally equivalent to not passing this argument at all.
     */
    static create(bc: object, oc: null, isBoundary?: boolean): Scope;
    static fromParent(ps: Scope | null, bc: object, oc?: IOverrideContext): Scope;
}
/**
 * A class for creating context in synthetic scope to keep the number of classes of context in scope small
 */
export declare class BindingContext implements IBindingContext {
    [key: PropertyKey]: unknown;
    constructor();
    constructor(key: PropertyKey, value: unknown);
}
//# sourceMappingURL=scope.d.ts.map