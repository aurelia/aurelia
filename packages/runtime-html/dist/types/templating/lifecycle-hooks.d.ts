import type { Constructable, IContainer } from '@aurelia/kernel';
declare type FuncPropNames<T> = {
    [K in keyof T]: K extends 'constructor' ? never : Required<T>[K] extends Function ? K : never;
}[keyof T];
export declare type LifecycleHook<TViewModel, TKey extends FuncPropNames<TViewModel>> = (vm: TViewModel, ...args: Parameters<Required<TViewModel>[TKey]>) => ReturnType<Required<TViewModel>[TKey]>;
export declare type ILifecycleHooks<TViewModel = {}, TKey extends FuncPropNames<TViewModel> = FuncPropNames<TViewModel>> = {
    [K in TKey]: LifecycleHook<TViewModel, K>;
};
export declare const ILifecycleHooks: import("@aurelia/kernel").InterfaceSymbol<ILifecycleHooks<{}, never>>;
export declare type LifecycleHooksLookup<TViewModel = {}> = {
    [K in FuncPropNames<TViewModel>]?: readonly LifecycleHooksEntry<TViewModel, K>[];
};
export declare class LifecycleHooksEntry<TViewModel = {}, TKey extends FuncPropNames<TViewModel> = FuncPropNames<TViewModel>, THooks extends Constructable = Constructable> {
    readonly definition: LifecycleHooksDefinition<THooks>;
    readonly instance: ILifecycleHooks<TViewModel, TKey>;
    constructor(definition: LifecycleHooksDefinition<THooks>, instance: ILifecycleHooks<TViewModel, TKey>);
}
/**
 * This definition has no specific properties yet other than the type, but is in place for future extensions.
 *
 * See: https://github.com/aurelia/aurelia/issues/1044
 */
export declare class LifecycleHooksDefinition<T extends Constructable = Constructable> {
    readonly Type: T;
    readonly propertyNames: ReadonlySet<string>;
    private constructor();
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    static create<T extends Constructable>(def: {}, Type: T): LifecycleHooksDefinition<T>;
    register(container: IContainer): void;
}
export declare const LifecycleHooks: Readonly<{
    name: string;
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    define<T extends Constructable<{}>>(def: {}, Type: T): T;
    resolve(ctx: IContainer): LifecycleHooksLookup;
}>;
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export declare function lifecycleHooks(): <T extends Constructable>(target: T) => T;
export {};
//# sourceMappingURL=lifecycle-hooks.d.ts.map