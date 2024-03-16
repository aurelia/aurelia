/* eslint-disable @typescript-eslint/no-explicit-any */
import { IContainer, IFactory, IRegistry, IResolver, Injectable, InstanceProvider, InterfaceSymbol, Key, Resolved, inject } from './di';
import { createContainer } from './di.container';
import { ErrorNames, createMappedError } from './errors';
import { Constructable } from './interfaces';
import { isFunction, objectAssign, safeString } from './utilities';

export type ICallableResolver<T> = IResolver<T> & ((...args: unknown[]) => any);

/**
 * ! Semi private API to avoid repetitive work creating resolvers.
 *
 * Naming isn't entirely correct, but it's good enough for internal usage.
 */
export function createResolver<T extends Key>(getter: (key: T, handler: IContainer, requestor: IContainer) => any): ((key: T) => ICallableResolver<T>) {
  return function (key: any) {
    function Resolver(target: any, property?: string | number, descriptor?: PropertyDescriptor | number): void {
      inject(Resolver)(target, property, descriptor);
    }

    Resolver.$isResolver = true;
    Resolver.resolve = function (handler: IContainer, requestor: IContainer): any {
      return getter(key, handler, requestor);
    };

    return Resolver as ICallableResolver<T>;
  };
}

/**
 * Create a resolver that will resolve all values of a key from resolving container
 */
export const all = <T extends Key>(key: T, searchAncestors: boolean = false): IAllResolver<T> => {
  function resolver(target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number): void {
    inject(resolver)(target, property, descriptor);
  }

  resolver.$isResolver = true;
  resolver.resolve = (handler: IContainer, requestor: IContainer) => requestor.getAll(key, searchAncestors);

  return resolver as IAllResolver<T>;
};
export type IAllResolver<T> = IResolver<Resolved<T>[]> & {
  // type only hack
  __isAll: undefined;
  // any for decorator
  (...args: unknown[]): any;
};

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
export const lazy = /*@__PURE__*/createResolver((key: Key, handler: IContainer, requestor: IContainer) =>  {
  return () => requestor.get(key);
}) as <K extends Key>(key: K) => ILazyResolver<K>;
export type ILazyResolver<K extends Key = Key> = IResolver<() => K>
  // type only hack
  & { __isLazy: undefined }
  // any is needed for decorator usages
  & ((...args: unknown[]) => any);
export type IResolvedLazy<K> = () => Resolved<K>;

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
export const optional = /*@__PURE__*/createResolver((key: Key, handler: IContainer, requestor: IContainer) =>  {
  if (requestor.has(key, true)) {
    return requestor.get(key);
  } else {
    return undefined;
  }
}) as <K extends Key>(key: K) => IOptionalResolver<K>;
export type IOptionalResolver<K extends Key = Key> = IResolver<K | undefined> & {
  // type only hack
  __isOptional: undefined;
  // any is needed for decorator usages
  (...args: unknown[]): any;
};

/**
 * ignore tells the container not to try to inject a dependency
 */
export const ignore: IResolver<undefined> = /*@__PURE__*/objectAssign((target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number): void => {
  inject(ignore)(target, property, descriptor);
}, { $isResolver: true, resolve: () => void 0 } as const);

/**
 * Inject a function that will return a resolved instance of the [[key]] given.
 * Also supports passing extra parameters to the invocation of the resolved constructor of [[key]]
 *
 * For typings, it's a function that take 0 or more arguments and return an instance. Example:
 * ```ts
 * class Foo {
 *   constructor( @factory(MyService) public createService: (...args: unknown[]) => MyService)
 * }
 * const foo = container.get(Foo); // instanceof Foo
 * const myService_1 = foo.createService('user service')
 * const myService_2 = foo.createService('content service')
 * ```
 *
 * ```ts
 * class Foo {
 *   constructor( @factory('random') public createRandomizer: () => Randomizer)
 * }
 * container.get(Foo).createRandomizer(); // create a randomizer
 * ```
 * would throw an exception because you haven't registered `'random'` before calling the method. This, would give you a
 * new instance of Randomizer each time.
 *
 * `@factory` does not manage the lifecycle of the underlying key. If you want a singleton, you have to register as a
 * `singleton`, `transient` would also behave as you would expect, providing you a new instance each time.
 *
 * - @param key [[`Key`]]
 * see { @link DI.createInterface } on interactions with interfaces
 */
export const factory = /*@__PURE__*/createResolver((key: any, handler: IContainer, requestor: IContainer) => {
  return (...args: unknown[]) => handler.getFactory(key).construct(requestor, args);
}) as <K>(key: K) => IFactoryResolver<K>;
export type IFactoryResolver<K = any> = IResolver<K>
  // type only hack
  & { __isFactory: undefined }
  // any is needed for decorator usage
  & ((...args: unknown[]) => any);
export type IResolvedFactory<K> = (...args: unknown[]) => Resolved<K>;

/**
 * Create a resolver that will only resolve if the requesting container has the key pre-registered
 */
export const own = /*@__PURE__*/createResolver((key: any, handler: IContainer, requestor: IContainer) => {
  return requestor.has(key, false) ? requestor.get(key) : void 0;
}) as <T extends Key>(key: T) => IOptionalResolver<T>;

/**
 * Create a resolver that will resolve a key based on resource semantic (leaf + root + ignore middle layer container)
 * Will resolve at the root level if the key is not registered in the requestor container
 */
export const resource = /*@__PURE__*/createResolver((key, handler, requestor) =>
  requestor.has(key, false)
    ? requestor.get(key)
    : requestor.root.get(key)
) as <K extends Key>(key: K) => ICallableResolver<K>;

/**
 * Create a resolver that will resolve a key based on resource semantic (leaf + root + ignore middle layer container)
 * only if the key is registered either in the requestor container or in the root container
 *
 * Returns `undefined` if the key is not registered in either container
 */
export const optionalResource = /*@__PURE__*/createResolver((key, handler, requestor) =>
  requestor.has(key, false)
    ? requestor.get(key)
    : requestor.root.has(key, false)
      ? requestor.root.get(key)
      : void 0
) as <K extends Key>(key: K) => IOptionalResolver<K>;

/**
 * Create a resolver for resolving all registrations of a key with resource semantic (leaf + root + ignore middle layer container)
 */
export const allResources = /*@__PURE__*/createResolver((key, handler, requestor) =>
  // prevent duplicate retrieval
  requestor === requestor.root
    ? requestor.getAll(key, false)
    : requestor.has(key, false)
      ? requestor.getAll(key, false).concat(requestor.root.getAll(key, false))
      : requestor.root.getAll(key, false)
) as <T>(key: T) => IAllResolver<T>;

/**
 * Create a resolver that will resolve a new instance of a key, and register the newly created instance with the requestor container
 */
export const newInstanceForScope = /*@__PURE__*/createResolver(
  (key: any, handler: IContainer, requestor: IContainer) => {
    const instance = createNewInstance(key, handler, requestor);
    const instanceProvider = new InstanceProvider<{}>(safeString(key), instance);
    /**
     * By default the new instances for scope are disposable.
     * If need be, we can always enhance the `createNewInstance` to support a 'injection' context, to make a non/disposable registration here.
     */
    requestor.registerResolver(key, instanceProvider, true);

    return instance;
  }) as <K>(key: K) => INewInstanceResolver<K>;

/**
 * Create a resolver that will resolve a new instance of a key
 */
export const newInstanceOf = /*@__PURE__*/createResolver(
  (key: any, handler: IContainer, requestor: IContainer) => createNewInstance(key, handler, requestor)
) as <K>(key: K) => INewInstanceResolver<K>;

export type INewInstanceResolver<T> = IResolver<T> & {
  // type only hack
  __newInstance: undefined;
  // any is needed for decorator usage
  (...args: unknown[]): any;
};

const createNewInstance = (key: any, handler: IContainer, requestor: IContainer) => {
  // 1. if there's a factory registration for the key
  if (handler.hasFactory(key)) {
    return handler.getFactory(key).construct(requestor);
  }
  // 2. if key is an interface
  if (isInterface(key)) {
    const hasDefault = isFunction((key as unknown as IRegistry).register);
    const resolver = handler.getResolver(key, false) as IResolver<Constructable<typeof key>>;
    let factory: IFactory | null | undefined;
    if (resolver == null) {
      if (hasDefault) {
        // creating a new container as we do not want to pollute the resolver registry
        factory = (newInstanceContainer ??= createContainer()).getResolver(key, true)?.getFactory?.(handler);
      }
      newInstanceContainer.dispose();
    } else {
      factory = resolver.getFactory?.(handler);
    }
    // 2.1 and has resolvable factory
    if (factory != null) {
      return factory.construct(requestor);
    }
    // 2.2 cannot instantiate a dummy interface
    throw createMappedError(ErrorNames.invalid_new_instance_on_interface, key);
  }
  // 3. jit factory, in case of newInstanceOf(SomeClass)
  return handler.getFactory(key).construct(requestor);
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isInterface = <K>(key: any): key is InterfaceSymbol<K> => isFunction(key) && key.$isInterface === true;

let newInstanceContainer: IContainer;
