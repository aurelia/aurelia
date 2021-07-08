import type { IRegistry } from './di.js';
import type { Constructable, IDisposable } from './interfaces.js';
import type { ResourceDefinition } from './resource.js';
export interface IModule {
    [key: string]: unknown;
    default?: unknown;
}
export interface IModuleLoader extends ModuleLoader {
}
export declare const IModuleLoader: import("./di.js").InterfaceSymbol<IModuleLoader>;
export declare class ModuleLoader implements IDisposable {
    private readonly transformers;
    /**
     * Await a module promise and then analyzes and transforms it. The result is cached, using the transform function + promise as the cache key.
     *
     * @param promise - A promise (returning a module, or an object resembling a module), e.g. the return value of a dynamic `import()` or `require()` call.
     * @param transform - A transform function, e.g. to select the appropriate default or first non-default resource export.
     * Note: The return value of `transform` is cached, so it is recommended to perform any processing here that is intended to happen only once per unique module promise.
     *
     * @returns The (cached) transformed result. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
     */
    load<TMod extends IModule = IModule, TRet = AnalyzedModule<TMod>>(promise: Promise<TMod>, transform: (m: AnalyzedModule<TMod>) => TRet | Promise<TRet>): Promise<TRet> | TRet;
    /**
     * Await a module promise and then analyzes it. The result is cached, using the transform function + promise as the cache key.
     *
     * @param promise - A promise (returning a module, or an object resembling a module), e.g. the return value of a dynamic `import()` or `require()` call.
     *
     * @returns The analyzed module. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
     */
    load<TMod extends IModule = IModule>(promise: Promise<TMod>): Promise<AnalyzedModule<TMod>> | AnalyzedModule<TMod>;
    /**
     * Analyzes and transforms a module-like object. The result is cached, using the transform function + object as the cache key.
     *
     * @param promise - A module-like object, e.g. the awaited return value of a dynamic `import()` or `require()` call, or a statically imported module such as `import * as Module from './my-module';`.
     * @param transform - A transform function, e.g. to select the appropriate default or first non-default resource export.
     * Note: The return value of `transform` is cached, so it is recommended to perform any processing here that is intended to happen only once per unique module promise.
     *
     * @returns The (cached) transformed result. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
     */
    load<TMod extends IModule = IModule, TRet = AnalyzedModule<TMod>>(obj: TMod, transform: (m: AnalyzedModule<TMod>) => TRet | Promise<TRet>): Promise<TRet> | TRet;
    /**
     * Analyzes a module-like object. The result is cached, using the transform function + object as the cache key.
     *
     * @param promise - A module-like object, e.g. the awaited return value of a dynamic `import()` or `require()` call, or a statically imported module such as `import * as Module from './my-module';`.
     *
     * @returns The analyzed module. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
     */
    load<TMod extends IModule = IModule>(obj: TMod): AnalyzedModule<TMod>;
    /**
     * Analyzes and transforms a module-like object or a promise thereof. The result is cached, using the transform function + object as the cache key.
     *
     * @param promise - A module-like object or a promise thereof, e.g. the (awaited) return value of a dynamic `import()` or `require()` call, or a statically imported module such as `import * as Module from './my-module';`.
     * @param transform - A transform function, e.g. to select the appropriate default or first non-default resource export.
     * Note: The return value of `transform` is cached, so it is recommended to perform any processing here that is intended to happen only once per unique module promise.
     *
     * @returns The (cached) transformed result. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
     */
    load<TMod extends IModule = IModule, TRet = AnalyzedModule<TMod>>(objOrPromise: TMod | Promise<TMod>, transform?: (m: AnalyzedModule<TMod>) => TRet | Promise<TRet>): Promise<TRet> | TRet;
    dispose(): void;
}
export declare class AnalyzedModule<TMod extends IModule = IModule> {
    readonly raw: TMod;
    readonly items: readonly ITypedModuleItem_T[];
    constructor(raw: TMod, items: readonly ITypedModuleItem_T[]);
}
export interface ITypedModuleItem<TisRegistry extends boolean, TisConstructable extends boolean, TValue> {
    readonly key: string;
    readonly value: TValue;
    readonly isRegistry: TisRegistry;
    readonly isConstructable: TisConstructable;
    readonly definitions: readonly ResourceDefinition[];
}
export interface ITypedModuleItem_Unknown extends ITypedModuleItem<false, false, unknown> {
}
export interface ITypedModuleItem_Registry extends ITypedModuleItem<true, false, IRegistry> {
}
export interface ITypedModuleItem_Constructable extends ITypedModuleItem<false, true, Constructable> {
}
export interface ITypedModuleItem_ConstructableRegistry extends ITypedModuleItem<true, true, Constructable & IRegistry> {
}
export declare type ITypedModuleItem_T = (ITypedModuleItem_Unknown | ITypedModuleItem_Registry | ITypedModuleItem_Constructable | ITypedModuleItem_ConstructableRegistry);
export declare class ModuleItem {
    readonly key: string;
    readonly value: unknown;
    readonly isRegistry: boolean;
    readonly isConstructable: boolean;
    readonly definitions: readonly ResourceDefinition[];
    constructor(key: string, value: unknown, isRegistry: boolean, isConstructable: boolean, definitions: readonly ResourceDefinition[]);
}
//# sourceMappingURL=module-loader.d.ts.map