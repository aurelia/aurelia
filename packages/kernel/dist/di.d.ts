import { Constructable } from './interfaces';
export declare type ResolveCallback<T = any> = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => T;
export declare type InterfaceSymbol<K = any> = (target: Injectable<K>, property: string, index: number) => void;
export interface IDefaultableInterfaceSymbol<K> extends InterfaceSymbol<K> {
    withDefault(configure: (builder: IResolverBuilder<K>) => IResolver<K>): InterfaceSymbol<K>;
    noDefault(): InterfaceSymbol<K>;
}
interface IResolverLike<C, K = any> {
    resolve(handler: C, requestor: C): Resolved<K>;
    getFactory?(container: C): (K extends Constructable ? IFactory<K> : never) | null;
}
export interface IResolver<K = any> extends IResolverLike<IContainer, K> {
}
export interface IRegistration<K = any> {
    register(container: IContainer, key?: Key): IResolver<K>;
}
export declare type Transformer<K> = (instance: Resolved<K>) => Resolved<K>;
export interface IFactory<T extends Constructable = any> {
    readonly Type: T;
    registerTransformer(transformer: Transformer<T>): boolean;
    construct(container: IContainer, dynamicDependencies?: Key[]): Resolved<T>;
}
export interface IServiceLocator {
    has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
    get<K extends Key>(key: K): Resolved<K>;
    get<K extends Key>(key: Key): Resolved<K>;
    get<K extends Key>(key: K | Key): Resolved<K>;
    getAll<K extends Key>(key: K): readonly Resolved<K>[];
    getAll<K extends Key>(key: Key): readonly Resolved<K>[];
    getAll<K extends Key>(key: K | Key): readonly Resolved<K>[];
}
export interface IRegistry {
    register(container: IContainer, ...params: unknown[]): void | IResolver | IContainer;
}
export interface IContainer extends IServiceLocator {
    readonly id: number;
    readonly path: string;
    register(...params: any[]): IContainer;
    registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T>;
    registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
    getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
    getFactory<T extends Constructable>(key: T): IFactory<T> | null;
    createChild(): IContainer;
}
export interface IResolverBuilder<K> {
    instance(value: K): IResolver<K>;
    singleton(value: Constructable): IResolver<K>;
    transient(value: Constructable): IResolver<K>;
    callback(value: ResolveCallback<K>): IResolver<K>;
    aliasTo(destinationKey: Key): IResolver<K>;
}
export declare type RegisterSelf<T extends Constructable> = {
    register(container: IContainer): IResolver<InstanceType<T>>;
};
export declare type Key = PropertyKey | object | InterfaceSymbol | Constructable | IResolver;
export declare type Resolved<K> = (K extends InterfaceSymbol<infer T> ? T : K extends Constructable ? InstanceType<K> : K extends IResolverLike<any, infer T1> ? T1 extends Constructable ? InstanceType<T1> : T1 : K);
export declare type Injectable<T = {}> = Constructable<T> & {
    inject?: Key[];
};
export declare class DI {
    private constructor();
    static createContainer(...params: any[]): IContainer;
    static getDesignParamtypes(Type: Constructable | Injectable): readonly Key[] | undefined;
    static getAnnotationParamtypes(Type: Constructable | Injectable): readonly Key[] | undefined;
    static getOrCreateAnnotationParamTypes(Type: Constructable | Injectable): Key[];
    static getDependencies(Type: Constructable | Injectable): Key[];
    static createInterface<K extends Key>(friendlyName?: string): IDefaultableInterfaceSymbol<K>;
    static inject(...dependencies: Key[]): (target: Injectable, key?: string | number, descriptor?: PropertyDescriptor | number) => void;
    /**
     * Registers the `target` class as a transient dependency; each time the dependency is resolved
     * a new instance will be created.
     *
     * @param target - The class / constructor function to register as transient.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     *
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.transient(Foo);
     *
     * // Inline declaration
     * const Foo = DI.transient(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    static transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
    /**
     * Registers the `target` class as a singleton dependency; the class will only be created once. Each
     * consecutive time the dependency is resolved, the same instance will be returned.
     *
     * @param target - The class / constructor function to register as a singleton.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.singleton(Foo);
     *
     * // Inline declaration
     * const Foo = DI.singleton(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    static singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
}
export declare const IContainer: InterfaceSymbol<IContainer>;
export declare const IServiceLocator: InterfaceSymbol<IServiceLocator>;
export declare const inject: typeof DI.inject;
declare function transientDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
/**
 * Registers the decorated class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * @example ```ts
 * @transient()
 * class Foo { }
 * ```
 */
export declare function transient<T extends Constructable>(): typeof transientDecorator;
/**
 * Registers the `target` class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * @param target - The class / constructor function to register as transient.
 *
 * @example ```ts
 * @transient()
 * class Foo { }
 * ```
 */
export declare function transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
declare function singletonDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
/**
 * Registers the decorated class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @example ```ts
 * @singleton()
 * class Foo { }
 * ```
 */
export declare function singleton<T extends Constructable>(): typeof singletonDecorator;
/**
 * Registers the `target` class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @param target - The class / constructor function to register as a singleton.
 *
 * @example ```ts
 * @singleton()
 * class Foo { }
 * ```
 */
export declare function singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
export declare const all: (key: any) => any;
export declare const lazy: (key: any) => any;
export declare const optional: (key: any) => any;
/**
 * An implementation of IRegistry that delegates registration to a
 * separately registered class. The ParameterizedRegistry facilitates the
 * passing of parameters to the final registry.
 */
export declare class ParameterizedRegistry implements IRegistry {
    private readonly key;
    private readonly params;
    constructor(key: Key, params: unknown[]);
    register(container: IContainer): void;
}
export declare const Registration: Readonly<{
    instance<T>(key: Key, value: T): IRegistration<T>;
    singleton<T_1 extends Constructable<{}>>(key: Key, value: T_1): IRegistration<InstanceType<T_1>>;
    transient<T_2 extends Constructable<{}>>(key: Key, value: T_2): IRegistration<InstanceType<T_2>>;
    callback<T_3>(key: Key, callback: ResolveCallback<T_3>): IRegistration<T_3 extends InterfaceSymbol<infer T_4> ? T_4 : T_3 extends Constructable<{}> ? InstanceType<T_3> : T_3 extends IResolverLike<any, infer T1> ? T1 extends Constructable<{}> ? InstanceType<T1> : T1 : T_3>;
    alias<T_5>(originalKey: T_5, aliasKey: Key): IRegistration<T_5 extends InterfaceSymbol<infer T_4> ? T_4 : T_5 extends Constructable<{}> ? InstanceType<T_5> : T_5 extends IResolverLike<any, infer T1> ? T1 extends Constructable<{}> ? InstanceType<T1> : T1 : T_5>;
    defer(key: Key, ...params: unknown[]): IRegistry;
}>;
export declare class InstanceProvider<K extends Key> implements IResolver<K | null> {
    private instance;
    constructor();
    prepare(instance: Resolved<K>): void;
    resolve(handler: IContainer, requestor: IContainer): Resolved<K> | null;
    dispose(): void;
}
export {};
//# sourceMappingURL=di.d.ts.map