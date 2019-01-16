import { Constructable, IIndexable, Injectable, InterfaceSymbol, Primitive } from './interfaces';
export declare type ResolveCallback<T = unknown> = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => T;
export declare type Key<T> = InterfaceSymbol<T> | Primitive | IIndexable | Constructable;
export interface IDefaultableInterfaceSymbol<T> extends InterfaceSymbol<T> {
    withDefault(configure: (builder: IResolverBuilder<T>) => IResolver): InterfaceSymbol<T>;
    noDefault(): InterfaceSymbol<T>;
}
interface IResolverLike<TValue, TContainer> {
    resolve(handler: TContainer, requestor: TContainer): TValue;
    getFactory?(container: TContainer): IFactory<TValue> | null;
}
export interface IResolver<T = any> extends IResolverLike<T, IContainer> {
}
export interface IRegistration<T = any> {
    register(container: IContainer, key?: Key<T>): IResolver<T>;
}
export interface IFactory<T = any> {
    readonly Type: Constructable;
    registerTransformer(transformer: (instance: T) => T): boolean;
    construct(container: IContainer, dynamicDependencies?: Key<unknown>[]): T;
}
export interface IServiceLocator {
    has<K>(key: Constructable | Key<unknown> | IResolver<unknown> | K, searchAncestors: boolean): boolean;
    get<K>(key: Constructable | Key<unknown> | IResolver<unknown> | K): K extends InterfaceSymbol<infer T> ? T : K extends Constructable ? InstanceType<K> : K extends IResolverLike<infer T1, unknown> ? T1 extends Constructable ? InstanceType<T1> : T1 : K;
    getAll<K>(key: Constructable | Key<unknown> | IResolver<unknown> | K): K extends InterfaceSymbol<infer T> ? ReadonlyArray<T> : K extends Constructable ? ReadonlyArray<InstanceType<K>> : K extends IResolverLike<infer T1, unknown> ? T1 extends Constructable ? ReadonlyArray<InstanceType<T1>> : ReadonlyArray<T1> : ReadonlyArray<K>;
}
export interface IRegistry {
    register(container: IContainer): void;
}
export interface IContainer extends IServiceLocator {
    register(...params: IRegistry[]): IContainer;
    register(...params: Record<string, Partial<IRegistry>>[]): IContainer;
    register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): IContainer;
    register(registry: Record<string, Partial<IRegistry>>): IContainer;
    register(registry: IRegistry): IContainer;
    register(registry: IRegistry | Record<string, Partial<IRegistry>>): IContainer;
    registerResolver<T>(key: Key<T>, resolver: IResolver<T>): IResolver<T>;
    registerResolver<T extends Constructable>(key: T, resolver: IResolver<InstanceType<T>>): IResolver<InstanceType<T>>;
    registerTransformer<T>(key: Key<T>, transformer: (instance: T) => T): boolean;
    registerTransformer<T extends Constructable>(key: T, transformer: (instance: InstanceType<T>) => T): boolean;
    getResolver<T>(key: Key<T>, autoRegister?: boolean): IResolver<T> | null;
    getResolver<T extends Constructable>(key: T, autoRegister?: boolean): IResolver<InstanceType<T>> | null;
    getFactory<T extends Constructable>(Type: T): IFactory<InstanceType<T>>;
    createChild(): IContainer;
}
export interface IResolverBuilder<T> {
    instance(value: T & IIndexable): IResolver;
    singleton(value: Constructable): IResolver;
    transient(value: Constructable): IResolver;
    callback(value: ResolveCallback<T>): IResolver;
    aliasTo(destinationKey: Key<T>): IResolver;
}
export declare type RegisterSelf<T extends Constructable> = {
    register(container: IContainer): IResolver<InstanceType<T>>;
};
declare function createContainer(...params: IRegistry[]): IContainer;
declare function createContainer(...params: Record<string, Partial<IRegistry>>[]): IContainer;
declare function createContainer(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): IContainer;
declare function createContainer(registry: Record<string, Partial<IRegistry>>): IContainer;
declare function createContainer(registry: IRegistry): IContainer;
declare function createContainer(registry: IRegistry | Record<string, Partial<IRegistry>>): IContainer;
export declare const DI: {
    createContainer: typeof createContainer;
    getDesignParamTypes(target: Constructable<{}>): Key<unknown>[];
    getDependencies(Type: Constructable<{}> | Injectable<{}>): Key<unknown>[];
    createInterface<T = unknown>(friendlyName?: string): IDefaultableInterfaceSymbol<T>;
    inject(...dependencies: Key<unknown>[]): (target: Injectable<{}>, key?: string, descriptor?: number | PropertyDescriptor) => void;
    /**
     * Registers the `target` class as a transient dependency; each time the dependency is resolved
     * a new instance will be created.
     *
     * @param target The class / constructor function to register as transient.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     *
     * Example usage:
  ```ts
  // On an existing class
  class Foo { }
  DI.transient(Foo);
  
  // Inline declaration
  const Foo = DI.transient(class { });
  // Foo is now strongly typed with register
  Foo.register(container);
  ```
     */
    transient<T extends Constructable<{}>>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
    /**
     * Registers the `target` class as a singleton dependency; the class will only be created once. Each
     * consecutive time the dependency is resolved, the same instance will be returned.
     *
     * @param target The class / constructor function to register as a singleton.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     * Example usage:
  ```ts
  // On an existing class
  class Foo { }
  DI.singleton(Foo);
  
  // Inline declaration
  const Foo = DI.singleton(class { });
  // Foo is now strongly typed with register
  Foo.register(container);
  ```
     */
    singleton<T extends Constructable<{}>>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
};
export declare const IContainer: InterfaceSymbol<IContainer>;
export declare const IServiceLocator: InterfaceSymbol<IServiceLocator>;
export declare const inject: (...dependencies: Key<unknown>[]) => (target: Injectable<{}>, key?: string, descriptor?: number | PropertyDescriptor) => void;
declare function transientDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
/**
 * Registers the decorated class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * Example usage:
```ts
@transient
class Foo { }
```
 */
export declare function transient<T extends Constructable>(): typeof transientDecorator;
/**
 * Registers the `target` class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * @param target The class / constructor function to register as transient.
 *
 * Example usage:
```ts
@transient()
class Foo { }
```
 */
export declare function transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
declare function singletonDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
/**
 * Registers the decorated class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * Example usage:
```ts
@singleton
class Foo { }
```
 */
export declare function singleton<T extends Constructable>(): typeof singletonDecorator;
/**
 * Registers the `target` class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @param target The class / constructor function to register as a singleton.
 *
 * Example usage:
```ts
@singleton()
class Foo { }
```
 */
export declare function singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
export declare const all: (key: unknown) => (target: Injectable<{}>, key?: string, descriptor?: number | PropertyDescriptor) => void;
export declare const lazy: (key: unknown) => (target: Injectable<{}>, key?: string, descriptor?: number | PropertyDescriptor) => void;
export declare const optional: (key: unknown) => (target: Injectable<{}>, key?: string, descriptor?: number | PropertyDescriptor) => void;
export declare const Registration: {
    instance(key: Key<unknown>, value: unknown): IRegistration<any>;
    singleton(key: Key<unknown>, value: Constructable<{}>): IRegistration<any>;
    transient(key: Key<unknown>, value: Constructable<{}>): IRegistration<any>;
    callback(key: Key<unknown>, callback: ResolveCallback<unknown>): IRegistration<any>;
    alias(originalKey: Key<unknown>, aliasKey: Key<unknown>): IRegistration<any>;
    interpret(interpreterKey: Key<{}>, ...rest: Constructable<{}>[]): IRegistry;
};
export {};
//# sourceMappingURL=di.d.ts.map