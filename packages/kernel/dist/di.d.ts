import { Constructable, IDisposable } from './interfaces.js';
import { IResourceKind, ResourceDefinition, ResourceType } from './resource.js';
export declare type ResolveCallback<T = any> = (handler: IContainer, requestor: IContainer, resolver: IResolver<T>) => T;
export declare type InterfaceSymbol<K = any> = (target: Injectable<K>, property: string, index: number) => void;
interface IResolverLike<C, K = any> {
    readonly $isResolver: true;
    resolve(handler: C, requestor: C): Resolved<K>;
    getFactory?(container: C): (K extends Constructable ? IFactory<K> : never) | null;
}
export interface IResolver<K = any> extends IResolverLike<IContainer, K> {
}
export interface IDisposableResolver<K = any> extends IResolver<K> {
    dispose(): void;
}
export interface IRegistration<K = any> {
    register(container: IContainer, key?: Key): IResolver<K>;
}
export declare type Transformer<K> = (instance: Resolved<K>) => Resolved<K>;
export interface IFactory<T extends Constructable = any> {
    readonly Type: T;
    registerTransformer(transformer: Transformer<T>): void;
    construct(container: IContainer, dynamicDependencies?: unknown[]): Resolved<T>;
}
export interface IServiceLocator {
    has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
    get<K extends Key>(key: K): Resolved<K>;
    get<K extends Key>(key: Key): Resolved<K>;
    get<K extends Key>(key: K | Key): Resolved<K>;
    getAll<K extends Key>(key: K, searchAncestors?: boolean): readonly Resolved<K>[];
    getAll<K extends Key>(key: Key, searchAncestors?: boolean): readonly Resolved<K>[];
    getAll<K extends Key>(key: K | Key, searchAncestors?: boolean): readonly Resolved<K>[];
}
export interface IRegistry {
    register(container: IContainer, ...params: unknown[]): void | IResolver | IContainer;
}
export interface IContainer extends IServiceLocator, IDisposable {
    readonly id: number;
    readonly root: IContainer;
    register(...params: any[]): IContainer;
    registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>, isDisposable?: boolean): IResolver<T>;
    registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
    getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
    registerFactory<T extends Constructable>(key: T, factory: IFactory<T>): void;
    invoke<T, TDeps extends unknown[] = unknown[]>(key: Constructable<T>, dynamicDependencies?: TDeps): T;
    getFactory<T extends Constructable>(key: T): IFactory<T>;
    createChild(config?: IContainerConfiguration): IContainer;
    disposeResolvers(): void;
    find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null;
    create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null;
}
export declare class ResolverBuilder<K> {
    private container;
    private key;
    constructor(container: IContainer, key: Key);
    instance(value: K): IResolver<K>;
    singleton(value: Constructable): IResolver<K>;
    transient(value: Constructable): IResolver<K>;
    callback(value: ResolveCallback<K>): IResolver<K>;
    cachedCallback(value: ResolveCallback<K>): IResolver<K>;
    aliasTo(destinationKey: Key): IResolver<K>;
    private registerResolver;
}
export declare type RegisterSelf<T extends Constructable> = {
    register(container: IContainer): IResolver<InstanceType<T>>;
    registerInRequestor: boolean;
};
export declare type Key = PropertyKey | object | InterfaceSymbol | Constructable | IResolver;
export declare type Resolved<K> = (K extends InterfaceSymbol<infer T> ? T : K extends Constructable ? InstanceType<K> : K extends IResolverLike<any, infer T1> ? T1 extends Constructable ? InstanceType<T1> : T1 : K);
export declare type Injectable<T = {}> = Constructable<T> & {
    inject?: Key[];
};
export interface IContainerConfiguration {
    /**
     * If `true`, `createChild` will inherit the resource resolvers from its parent container
     * instead of only from the root container.
     *
     * Setting this flag will not implicitly perpetuate it in the child container hierarchy.
     * It must be explicitly set on each call to `createChild`.
     */
    inheritParentResources?: boolean;
    defaultResolver?(key: Key, handler: IContainer): IResolver;
}
export declare const DefaultResolver: {
    none(key: Key): IResolver;
    singleton(key: Key): IResolver;
    transient(key: Key): IResolver;
};
export declare class ContainerConfiguration implements IContainerConfiguration {
    readonly inheritParentResources: boolean;
    readonly defaultResolver: (key: Key, handler: IContainer) => IResolver;
    static readonly DEFAULT: ContainerConfiguration;
    private constructor();
    static from(config?: IContainerConfiguration): ContainerConfiguration;
}
export declare const DI: {
    createContainer(config?: Partial<IContainerConfiguration> | undefined): IContainer;
    getDesignParamtypes(Type: Constructable | Injectable): readonly Key[] | undefined;
    getAnnotationParamtypes(Type: Constructable | Injectable): readonly Key[] | undefined;
    getOrCreateAnnotationParamTypes(Type: Constructable | Injectable): Key[];
    getDependencies(Type: Constructable | Injectable): Key[];
    /**
     * creates a decorator that also matches an interface and can be used as a {@linkcode Key}.
     * ```ts
     * const ILogger = DI.createInterface<Logger>('Logger');
     * container.register(Registration.singleton(ILogger, getSomeLogger()));
     * const log = container.get(ILogger);
     * log.info('hello world');
     * class Foo {
     *   constructor( @ILogger log: ILogger ) {
     *     log.info('hello world');
     *   }
     * }
     * ```
     * you can also build default registrations into your interface.
     * ```ts
     * export const ILogger = DI.createInterface<Logger>('Logger', builder => builder.cachedCallback(LoggerDefault));
     * const log = container.get(ILogger);
     * log.info('hello world');
     * class Foo {
     *   constructor( @ILogger log: ILogger ) {
     *     log.info('hello world');
     *   }
     * }
     * ```
     * but these default registrations won't work the same with other decorators that take keys, for example
     * ```ts
     * export const MyStr = DI.createInterface<string>('MyStr', builder => builder.instance('somestring'));
     * class Foo {
     *   constructor( @optional(MyStr) public readonly str: string ) {
     *   }
     * }
     * container.get(Foo).str; // returns undefined
     * ```
     * to fix this add this line somewhere before you do a `get`
     * ```ts
     * container.register(MyStr);
     * container.get(Foo).str; // returns 'somestring'
     * ```
     *
     * - @param friendlyName used to improve error messaging
     */
    createInterface<K extends Key>(configureOrName?: string | ((builder: ResolverBuilder<K>) => IResolver<K>) | undefined, configuror?: ((builder: ResolverBuilder<K>) => IResolver<K>) | undefined): InterfaceSymbol<K>;
    inject(...dependencies: Key[]): (target: Injectable, key?: string | number | undefined, descriptor?: number | PropertyDescriptor | undefined) => void;
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
    transient<T extends Constructable<{}>>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
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
    singleton<T_1 extends Constructable<{}>>(target: T_1 & Partial<RegisterSelf<T_1>>, options?: SingletonOptions): T_1 & RegisterSelf<T_1>;
};
export declare const IContainer: InterfaceSymbol<IContainer>;
export declare const IServiceLocator: InterfaceSymbol<IServiceLocator>;
export declare const inject: (...dependencies: Key[]) => (target: Injectable, key?: string | number | undefined, descriptor?: number | PropertyDescriptor | undefined) => void;
declare function transientDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
/**
 * Registers the decorated class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * @example ```ts
 * &#64;transient()
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
 * &#64;transient()
 * class Foo { }
 * ```
 */
export declare function transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
declare type SingletonOptions = {
    scoped: boolean;
};
declare function singletonDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
/**
 * Registers the decorated class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @example ```ts
 * &#64;singleton()
 * class Foo { }
 * ```
 */
export declare function singleton<T extends Constructable>(): typeof singletonDecorator;
export declare function singleton<T extends Constructable>(options?: SingletonOptions): typeof singletonDecorator;
/**
 * Registers the `target` class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @param target - The class / constructor function to register as a singleton.
 *
 * @example ```ts
 * &#64;singleton()
 * class Foo { }
 * ```
 */
export declare function singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
export declare const all: (key: any, searchAncestors?: boolean | undefined) => ReturnType<typeof DI.inject>;
/**
 * Lazily inject a dependency depending on whether the [[`Key`]] is present at the time of function call.
 *
 * You need to make your argument a function that returns the type, for example
 * ```ts
 * class Foo {
 *   constructor( @lazy('random') public random: () => number )
 * }
 * const foo = container.get(Foo); // instanceof Foo
 * foo.random(); // throws
 * ```
 * would throw an exception because you haven't registered `'random'` before calling the method. This, would give you a
 * new [['Math.random()']] number each time.
 * ```ts
 * class Foo {
 *   constructor( @lazy('random') public random: () => random )
 * }
 * container.register(Registration.callback('random', Math.random ));
 * container.get(Foo).random(); // some random number
 * container.get(Foo).random(); // another random number
 * ```
 * `@lazy` does not manage the lifecycle of the underlying key. If you want a singleton, you have to register as a
 * `singleton`, `transient` would also behave as you would expect, providing you a new instance each time.
 *
 * - @param key [[`Key`]]
 * see { @link DI.createInterface } on interactions with interfaces
 */
export declare const lazy: (key: any) => any;
/**
 * Allows you to optionally inject a dependency depending on whether the [[`Key`]] is present, for example
 * ```ts
 * class Foo {
 *   constructor( @inject('mystring') public str: string = 'somestring' )
 * }
 * container.get(Foo); // throws
 * ```
 * would fail
 * ```ts
 * class Foo {
 *   constructor( @optional('mystring') public str: string = 'somestring' )
 * }
 * container.get(Foo).str // somestring
 * ```
 * if you use it without a default it will inject `undefined`, so rember to mark your input type as
 * possibly `undefined`!
 *
 * - @param key: [[`Key`]]
 *
 * see { @link DI.createInterface } on interactions with interfaces
 */
export declare const optional: (key: any) => any;
/**
 * ignore tells the container not to try to inject a dependency
 */
export declare function ignore(target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number): void;
export declare namespace ignore {
    var $isResolver: boolean;
    var resolve: () => undefined;
}
export declare const newInstanceForScope: (key: any) => any;
export declare const newInstanceOf: (key: any) => any;
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
/**
 * you can use the resulting {@linkcode IRegistration} of any of the factory methods
 * to register with the container, e.g.
 * ```
 * class Foo {}
 * const container = DI.createContainer();
 * container.register(Registration.instance(Foo, new Foo()));
 * container.get(Foo);
 * ```
 */
export declare const Registration: {
    /**
     * allows you to pass an instance.
     * Every time you request this {@linkcode Key} you will get this instance back.
     * ```
     * Registration.instance(Foo, new Foo()));
     * ```
     *
     * @param key
     * @param value
     */
    instance<T>(key: Key, value: T): IRegistration<T>;
    /**
     * Creates an instance from the class.
     * Every time you request this {@linkcode Key} you will get the same one back.
     * ```
     * Registration.singleton(Foo, Foo);
     * ```
     *
     * @param key
     * @param value
     */
    singleton<T_1 extends Constructable<{}>>(key: Key, value: T_1): IRegistration<InstanceType<T_1>>;
    /**
     * Creates an instance from a class.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.instance(Foo, Foo);
     * ```
     *
     * @param key
     * @param value
     */
    transient<T_2 extends Constructable<{}>>(key: Key, value: T_2): IRegistration<InstanceType<T_2>>;
    /**
     * Creates an instance from the method passed.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.callback(Foo, () => new Foo());
     * Registration.callback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
     * ```
     *
     * @param key
     * @param callback
     */
    callback<T_3>(key: Key, callback: ResolveCallback<T_3>): IRegistration<Resolved<T_3>>;
    /**
     * Creates an instance from the method passed.
     * On the first request for the {@linkcode Key} your callback is called and returns an instance.
     * subsequent requests for the {@linkcode Key}, the initial instance returned will be returned.
     * If you pass the same {@linkcode Registration} to another container the same cached value will be used.
     * Should all references to the resolver returned be removed, the cache will expire.
     * ```
     * Registration.cachedCallback(Foo, () => new Foo());
     * Registration.cachedCallback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
     * ```
     *
     * @param key
     * @param callback
     */
    cachedCallback<T_4>(key: Key, callback: ResolveCallback<T_4>): IRegistration<Resolved<T_4>>;
    /**
     * creates an alternate {@linkcode Key} to retrieve an instance by.
     * Returns the same scope as the original {@linkcode Key}.
     * ```
     * Register.singleton(Foo, Foo)
     * Register.aliasTo(Foo, MyFoos);
     *
     * container.getAll(MyFoos) // contains an instance of Foo
     * ```
     *
     * @param originalKey
     * @param aliasKey
     */
    aliasTo<T_5>(originalKey: T_5, aliasKey: Key): IRegistration<Resolved<T_5>>;
    /**
     * @internal
     * @param key
     * @param params
     */
    defer(key: Key, ...params: unknown[]): IRegistry;
};
export declare class InstanceProvider<K extends Key> implements IDisposableResolver<K | null> {
    readonly friendlyName?: string | undefined;
    private instance;
    constructor(friendlyName?: string | undefined);
    prepare(instance: Resolved<K>): void;
    get $isResolver(): true;
    resolve(): Resolved<K> | null;
    dispose(): void;
}
export {};
//# sourceMappingURL=di.d.ts.map