import { IIndexable } from '@aurelia/kernel';
import { IBinding, IBindingContext, IOverrideContext, LifecycleFlags } from '../observation.js';
export declare class BindingContext implements IBindingContext {
    [key: string]: unknown;
    private constructor();
    /**
     * Create a new synthetic `BindingContext` for use in a `Scope`.
     *
     * @param obj - Optional. An existing object or `BindingContext` to (shallow) clone (own) properties from.
     */
    static create(flags: LifecycleFlags, obj?: IIndexable): BindingContext;
    /**
     * Create a new synthetic `BindingContext` for use in a `Scope`.
     *
     * @param key - The name of the only property to initialize this `BindingContext` with.
     * @param value - The value of the only property to initialize this `BindingContext` with.
     */
    static create(flags: LifecycleFlags, key: string, value: unknown): BindingContext;
    /**
     * Create a new synthetic `BindingContext` for use in a `Scope`.
     *
     * This overload signature is simply the combined signatures of the other two, and can be used
     * to keep strong typing in situations where the arguments are dynamic.
     */
    static create(flags: LifecycleFlags, keyOrObj?: string | IIndexable, value?: unknown): BindingContext;
    static get(scope: Scope, name: string, ancestor: number, flags: LifecycleFlags, hostScope?: Scope | null): IBindingContext | IOverrideContext | IBinding | undefined | null;
}
export declare class Scope {
    parentScope: Scope | null;
    bindingContext: IBindingContext;
    overrideContext: IOverrideContext;
    readonly isComponentBoundary: boolean;
    private constructor();
    /**
     * Create a new `Scope` backed by the provided `BindingContext` and a new standalone `OverrideContext`.
     *
     * Use this overload when the scope is for the root component, in a unit test,
     * or when you simply want to prevent binding expressions from traversing up the scope.
     *
     * @param bc - The `BindingContext` to back the `Scope` with.
     */
    static create(flags: LifecycleFlags, bc: object): Scope;
    /**
     * Create a new `Scope` backed by the provided `BindingContext` and `OverrideContext`.
     *
     * @param bc - The `BindingContext` to back the `Scope` with.
     * @param oc - The `OverrideContext` to back the `Scope` with.
     * If a binding expression attempts to access a property that does not exist on the `BindingContext`
     * during binding, it will traverse up via the `parentScope` of the scope until
     * it finds the property.
     */
    static create(flags: LifecycleFlags, bc: object, oc: IOverrideContext, isComponentBoundary?: boolean): Scope;
    /**
     * Create a new `Scope` backed by the provided `BindingContext` and `OverrideContext`.
     *
     * Use this overload when the scope is for the root component, in a unit test,
     * or when you simply want to prevent binding expressions from traversing up the scope.
     *
     * @param bc - The `BindingContext` to back the `Scope` with.
     * @param oc - null. This overload is functionally equivalent to not passing this argument at all.
     */
    static create(flags: LifecycleFlags, bc: object, oc: null, isComponentBoundary?: boolean): Scope;
    static fromOverride(flags: LifecycleFlags, oc: IOverrideContext): Scope;
    static fromParent(flags: LifecycleFlags, ps: Scope | null, bc: object): Scope;
}
export declare class OverrideContext implements IOverrideContext {
    [key: string]: unknown;
    bindingContext: IBindingContext;
    private constructor();
    static create(flags: LifecycleFlags, bc: object): OverrideContext;
}
//# sourceMappingURL=binding-context.d.ts.map