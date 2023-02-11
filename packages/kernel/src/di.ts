/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { applyMetadataPolyfill } from '@aurelia/metadata';

applyMetadataPolyfill(Reflect, false, false);

import { isArrayIndex } from './functions';
import { Container } from './di.container';
import { Constructable, IDisposable, Writable } from './interfaces';
import { appendAnnotation, getAnnotationKeyFor, IResourceKind, ResourceDefinition, ResourceType } from './resource';
import { createError, defineMetadata, getOwnMetadata, isFunction, isString, toStringSafe } from './utilities';
import { instanceRegistration, singletonRegistration, transientRegistation, callbackRegistration, cachedCallbackRegistration, aliasToRegistration, deferRegistration, cacheCallbackResult } from './di.registration';

export type ResolveCallback<T = any> = (handler: IContainer, requestor: IContainer, resolver: IResolver<T>) => T;

export type InterfaceSymbol<K = any> = (target: Injectable<K>, property: string, index: number) => void;

// This interface exists only to break a circular type referencing issue in the IServiceLocator interface.
// Otherwise IServiceLocator references IResolver, which references IContainer, which extends IServiceLocator.
interface IResolverLike<C, K = any> {
  readonly $isResolver: true;
  resolve(handler: C, requestor: C): Resolved<K>;
  getFactory?(container: C): (K extends Constructable ? IFactory<K> : never) | null;
}

export interface IResolver<K = any> extends IResolverLike<IContainer, K> { }
export interface IDisposableResolver<K = any> extends IResolver<K> {
  dispose(): void;
}

export interface IRegistration<K = any> {
  register(container: IContainer, key?: Key): IResolver<K>;
}

export type Transformer<K> = (instance: Resolved<K>) => Resolved<K>;

export interface IFactory<T extends Constructable = any> {
  readonly Type: T;
  registerTransformer(transformer: Transformer<T>): void;
  construct(container: IContainer, dynamicDependencies?: unknown[]): Resolved<T>;
}

export interface IServiceLocator {
  readonly root: IServiceLocator;
  has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
  get<K extends Key>(key: INewInstanceResolver<K>): Resolved<K>;
  get<K extends Key>(key: ILazyResolver<K>): IResolvedLazy<K>;
  get<K extends Key>(key: IFactoryResolver<K>): IResolvedFactory<K>;
  get<K extends Key>(key: IResolver<K>): Resolved<K>;
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
  // deregisterResolverFor<K extends Key>(key: K, searchAncestors: boolean): void;
  registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
  getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
  registerFactory<T extends Constructable>(key: T, factory: IFactory<T>): void;
  invoke<T extends {}, TDeps extends unknown[] = unknown[]>(key: Constructable<T>, dynamicDependencies?: TDeps): T;
  getFactory<T extends Constructable>(key: T): IFactory<T>;
  createChild(config?: IContainerConfiguration): IContainer;
  disposeResolvers(): void;
  find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null;
  create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null;
}

export class ResolverBuilder<K> {
  public constructor(
    /** @internal */ private _container: IContainer,
    /** @internal */ private _key: Key,
  ) {}

  public instance(value: K): IResolver<K> {
    return this._registerResolver(ResolverStrategy.instance, value);
  }

  public singleton(value: Constructable): IResolver<K> {
    return this._registerResolver(ResolverStrategy.singleton, value);
  }

  public transient(value: Constructable): IResolver<K> {
    return this._registerResolver(ResolverStrategy.transient, value);
  }

  public callback(value: ResolveCallback<K>): IResolver<K> {
    return this._registerResolver(ResolverStrategy.callback, value);
  }

  public cachedCallback(value: ResolveCallback<K>): IResolver<K> {
    return this._registerResolver(ResolverStrategy.callback, cacheCallbackResult(value));
  }

  public aliasTo(destinationKey: Key): IResolver<K> {
    return this._registerResolver(ResolverStrategy.alias, destinationKey);
  }

  /** @internal */
  private _registerResolver(strategy: ResolverStrategy, state: unknown): IResolver<K> {
    const { _container: container, _key: key } = this;
    this._container = this._key = (void 0)!;
    return container.registerResolver(key, new Resolver(key, strategy, state));
  }
}

export type RegisterSelf<T extends Constructable> = {
  register(container: IContainer): IResolver<InstanceType<T>>;
  registerInRequestor: boolean;
};

export type Key = PropertyKey | object | InterfaceSymbol | Constructable | IResolver;

export type Resolved<K> = (
  K extends InterfaceSymbol<infer T>
    ? T
    : K extends Constructable
      ? InstanceType<K>
      : K extends IResolverLike<any, infer T1>
        ? T1 extends Constructable
          ? InstanceType<T1>
          : T1
        : K
);

export type Injectable<T = {}> = Constructable<T> & { inject?: Key[] };

const cloneArrayWithPossibleProps = <T>(source: readonly T[]): T[] => {
  const clone = source.slice();
  const keys = Object.keys(source);
  const len = keys.length;
  let key: string;
  for (let i = 0; i < len; ++i) {
    key = keys[i];
    if (!isArrayIndex(key)) {
      clone[key] = source[key];
    }
  }
  return clone;
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

export const DefaultResolver = {
  none(key: Key): IResolver {
    throw noResolverForKeyError(key);
  },
  singleton: (key: Key): IResolver => new Resolver(key, ResolverStrategy.singleton, key),
  transient: (key: Key): IResolver => new Resolver(key, ResolverStrategy.transient, key),
};

const noResolverForKeyError = (key: Key) =>
  __DEV__
    ? createError(`AUR0002: ${toStringSafe(key)} not registered, did you forget to add @singleton()?`)
    : createError(`AUR0002:${toStringSafe(key)}`);

export class ContainerConfiguration implements IContainerConfiguration {
  public static readonly DEFAULT: ContainerConfiguration = ContainerConfiguration.from({});

  private constructor(
    public readonly inheritParentResources: boolean,
    public readonly defaultResolver: (key: Key, handler: IContainer) => IResolver,
  ) {}

  public static from(config?: IContainerConfiguration): ContainerConfiguration {
    if (
      config === void 0 ||
      config === ContainerConfiguration.DEFAULT
    ) {
      return ContainerConfiguration.DEFAULT;
    }
    return new ContainerConfiguration(
      config.inheritParentResources ?? false,
      config.defaultResolver ?? DefaultResolver.singleton,
    );
  }
}

/** @internal */
export const createContainer = (config?: Partial<IContainerConfiguration>): IContainer => new Container(null, ContainerConfiguration.from(config));

const getAnnotationParamtypes = (Type: Constructable | Injectable): readonly Key[] | undefined => {
  const key = getAnnotationKeyFor('di:paramtypes');
  return getOwnMetadata(key, Type);
};

const getDesignParamtypes = (Type: Constructable | Injectable): readonly Key[] | undefined =>
  getOwnMetadata('design:paramtypes', Type);

const getOrCreateAnnotationParamTypes = (Type: Constructable | Injectable): Key[] => {
  const key = getAnnotationKeyFor('di:paramtypes');
  let annotationParamtypes = getOwnMetadata(key, Type);
  if (annotationParamtypes === void 0) {
    defineMetadata(key, annotationParamtypes = [], Type);
    appendAnnotation(Type, key);
  }
  return annotationParamtypes;
};

export const getDependencies = (Type: Constructable | Injectable): Key[] => {
  // Note: Every detail of this getDependencies method is pretty deliberate at the moment, and probably not yet 100% tested from every possible angle,
  // so be careful with making changes here as it can have a huge impact on complex end user apps.
  // Preferably, only make changes to the dependency resolution process via a RFC.

  const key = getAnnotationKeyFor('di:dependencies');
  let dependencies = getOwnMetadata(key, Type) as Key[] | undefined;
  if (dependencies === void 0) {
    // Type.length is the number of constructor parameters. If this is 0, it could mean the class has an empty constructor
    // but it could also mean the class has no constructor at all (in which case it inherits the constructor from the prototype).

    // Non-zero constructor length + no paramtypes means emitDecoratorMetadata is off, or the class has no decorator.
    // We're not doing anything with the above right now, but it's good to keep in mind for any future issues.

    const inject = (Type as Injectable).inject;
    if (inject === void 0) {
      // design:paramtypes is set by tsc when emitDecoratorMetadata is enabled.
      const designParamtypes = DI.getDesignParamtypes(Type);
      // au:annotation:di:paramtypes is set by the parameter decorator from DI.createInterface or by @inject
      const annotationParamtypes = getAnnotationParamtypes(Type);
      if (designParamtypes === void 0) {
        if (annotationParamtypes === void 0) {
          // Only go up the prototype if neither static inject nor any of the paramtypes is defined, as
          // there is no sound way to merge a type's deps with its prototype's deps
          const Proto = Object.getPrototypeOf(Type);
          if (isFunction(Proto) && Proto !== Function.prototype) {
            dependencies = cloneArrayWithPossibleProps(getDependencies(Proto));
          } else {
            dependencies = [];
          }
        } else {
          // No design:paramtypes so just use the au:annotation:di:paramtypes
          dependencies = cloneArrayWithPossibleProps(annotationParamtypes);
        }
      } else if (annotationParamtypes === void 0) {
        // No au:annotation:di:paramtypes so just use the design:paramtypes
        dependencies = cloneArrayWithPossibleProps(designParamtypes);
      } else {
        // We've got both, so merge them (in case of conflict on same index, au:annotation:di:paramtypes take precedence)
        dependencies = cloneArrayWithPossibleProps(designParamtypes);
        let len = annotationParamtypes.length;
        let auAnnotationParamtype: Key;
        let i = 0;
        for (; i < len; ++i) {
          auAnnotationParamtype = annotationParamtypes[i];
          if (auAnnotationParamtype !== void 0) {
            dependencies[i] = auAnnotationParamtype;
          }
        }

        const keys = Object.keys(annotationParamtypes);
        let key: string;
        i = 0;
        len = keys.length;
        for (i = 0; i < len; ++i) {
          key = keys[i];
          if (!isArrayIndex(key)) {
            dependencies[key] = annotationParamtypes[key];
          }
        }
      }
    } else {
      // Ignore paramtypes if we have static inject
      dependencies = cloneArrayWithPossibleProps(inject);
    }

    defineMetadata(key, dependencies, Type);
    appendAnnotation(Type, key);
  }

  return dependencies;
};

/**
 * @internal
 *
 * @param configureOrName - Use for improving error messaging
 */
export const createInterface = <K extends Key>(configureOrName?: string | ((builder: ResolverBuilder<K>) => IResolver<K>), configuror?: (builder: ResolverBuilder<K>) => IResolver<K>): InterfaceSymbol<K> => {
 const configure = isFunction(configureOrName) ? configureOrName : configuror;
 const friendlyName = isString(configureOrName) ? configureOrName : undefined;

 const Interface = function (target: Injectable<K>, property: string, index: number): void {
   if (target == null || new.target !== undefined) {
    throw createNoRegistrationError(Interface.friendlyName);
   }
   const annotationParamtypes = getOrCreateAnnotationParamTypes(target);
   annotationParamtypes[index] = Interface;
 };
 Interface.$isInterface = true;
 Interface.friendlyName = friendlyName == null ? '(anonymous)' : friendlyName;

 if (configure != null) {
   Interface.register = (container: IContainer, key?: Key): IResolver<K> =>
     configure(new ResolverBuilder(container, key ?? Interface));
 }

 Interface.toString = (): string => `InterfaceSymbol<${Interface.friendlyName}>`;

 return Interface;
};
const createNoRegistrationError = (name: string) =>
  __DEV__
    ? createError(`AUR0001: No registration for interface: '${name}'`)
    : createError(`AUR0001:${name}`);

export const DI = {
  createContainer,
  getDesignParamtypes,
  getAnnotationParamtypes,
  getOrCreateAnnotationParamTypes,
  getDependencies: getDependencies,
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
   * - @param configureOrName - supply a string to improve error messaging
   */
  createInterface,
  inject(...dependencies: Key[]): (target: Injectable, key?: string | number, descriptor?: PropertyDescriptor | number) => void {
    return (target: Injectable, key?: string | number, descriptor?: PropertyDescriptor | number): void => {
      if (typeof descriptor === 'number') { // It's a parameter decorator.
        const annotationParamtypes = getOrCreateAnnotationParamTypes(target);
        const dep = dependencies[0];
        if (dep !== void 0) {
          annotationParamtypes[descriptor] = dep;
        }
      } else if (key) { // It's a property decorator. Not supported by the container without plugins.
        const annotationParamtypes = getOrCreateAnnotationParamTypes((target as unknown as { constructor: Injectable }).constructor);
        const dep = dependencies[0];
        if (dep !== void 0) {
          annotationParamtypes[key as number] = dep;
        }
      } else if (descriptor) { // It's a function decorator (not a Class constructor)
        const fn = descriptor.value;
        const annotationParamtypes = getOrCreateAnnotationParamTypes(fn);
        let dep: Key;
        let i = 0;
        for (; i < dependencies.length; ++i) {
          dep = dependencies[i];
          if (dep !== void 0) {
            annotationParamtypes[i] = dep;
          }
        }
      } else { // It's a class decorator.
        const annotationParamtypes = getOrCreateAnnotationParamTypes(target);
        let dep: Key;
        let i = 0;
        for (; i < dependencies.length; ++i) {
          dep = dependencies[i];
          if (dep !== void 0) {
            annotationParamtypes[i] = dep;
          }
        }
      }
    };
  },
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
  transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> {
    target.register = function (container: IContainer): IResolver<InstanceType<T>> {
      const registration = Registration.transient(target as T, target as T);
      return registration.register(container, target);
    };
    target.registerInRequestor = false;
    return target as T & RegisterSelf<T>;
  },
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
  singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>, options: SingletonOptions = defaultSingletonOptions):
    T & RegisterSelf<T> {
    target.register = function (container: IContainer): IResolver<InstanceType<T>> {
      const registration = Registration.singleton(target, target);
      return registration.register(container, target);
    };
    target.registerInRequestor = options.scoped;
    return target as T & RegisterSelf<T>;
  },
};

export const IContainer = createInterface<IContainer>('IContainer');
export const IServiceLocator = IContainer as unknown as InterfaceSymbol<IServiceLocator>;

function createResolver(getter: (key: any, handler: IContainer, requestor: IContainer) => any): (key: any) => any {
  return function (key: any): ReturnType<typeof DI.inject> {
    const resolver: ReturnType<typeof DI.inject> & Partial<Pick<IResolver, 'resolve'>> & { $isResolver: true} = function (target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number): void {
      inject(resolver)(target, property, descriptor);
    };

    resolver.$isResolver = true;
    resolver.resolve = function (handler: IContainer, requestor: IContainer): any {
      return getter(key, handler, requestor);
    };

    return resolver;
  };
}

export const inject = DI.inject;

function transientDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>):
  T & RegisterSelf<T> {
  return DI.transient(target);
}
/**
 * Registers the decorated class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * @example ```ts
 * &#64;transient()
 * class Foo { }
 * ```
 */
export function transient<T extends Constructable>(): typeof transientDecorator;
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
export function transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
export function transient<T extends Constructable>(target?: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> | typeof transientDecorator {
  return target == null ? transientDecorator : transientDecorator(target);
}

type SingletonOptions = { scoped: boolean };
const defaultSingletonOptions = { scoped: false };
const decorateSingleton = DI.singleton;

const singletonDecorator = <T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> => {
  return decorateSingleton(target);
};
/**
 * Registers the decorated class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @example ```ts
 * &#64;singleton()
 * class Foo { }
 * ```
 */
export function singleton<T extends Constructable>(): typeof singletonDecorator;
export function singleton<T extends Constructable>(options?: SingletonOptions): typeof singletonDecorator;
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
export function singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
export function singleton<T extends Constructable>(targetOrOptions?: (T & Partial<RegisterSelf<T>>) | SingletonOptions): T & RegisterSelf<T> | typeof singletonDecorator {
  if (isFunction(targetOrOptions)) {
    return decorateSingleton(targetOrOptions);
  }
  return function <T extends Constructable>($target: T) {
    return decorateSingleton($target, targetOrOptions);
  };
}

const createAllResolver = (
  getter: (key: any, handler: IContainer, requestor: IContainer, searchAncestors: boolean) => readonly any[]
): (key: any, searchAncestors?: boolean) => ReturnType<typeof DI.inject> => {
  return (key: any, searchAncestors?: boolean): ReturnType<typeof DI.inject> => {
    searchAncestors = !!searchAncestors;
    const resolver: ReturnType<typeof DI.inject>
      & Required<Pick<IResolver, 'resolve'>>
      & { $isResolver: true}
      = function (
          target: Injectable,
          property?: string | number,
          descriptor?: PropertyDescriptor | number
        ): void {
          inject(resolver)(target, property, descriptor);
        };

    resolver.$isResolver = true;
    resolver.resolve = function (handler: IContainer, requestor: IContainer): any {
      return getter(key, handler, requestor, searchAncestors!);
    };

    return resolver;
  };
};

export const all = createAllResolver(
  (key: any,
    handler: IContainer,
    requestor: IContainer,
    searchAncestors: boolean
  ) => requestor.getAll(key, searchAncestors)
);

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
export const lazy = createResolver((key: Key, handler: IContainer, requestor: IContainer) =>  {
  return () => requestor.get(key);
});
export type ILazyResolver<K = any> = IResolver<K>
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
export const optional = createResolver((key: Key, handler: IContainer, requestor: IContainer) =>  {
  if (requestor.has(key, true)) {
    return requestor.get(key);
  } else {
    return undefined;
  }
});
/**
 * ignore tells the container not to try to inject a dependency
 */
export const ignore = (target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number): void => {
  inject(ignore)(target, property, descriptor);
};
ignore.$isResolver = true;
ignore.resolve = () => undefined;

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
export const factory = createResolver((key: any, handler: IContainer, requestor: IContainer) => {
  return (...args: unknown[]) => handler.getFactory(key).construct(requestor, args);
}) as <K>(key: K) => IFactoryResolver<K>;
export type IFactoryResolver<K = any> = IResolver<K>
  // type only hack
  & { __isFactory: undefined }
  // any is needed for decorator usage
  & ((...args: unknown[]) => any);
export type IResolvedFactory<K> = (...args: unknown[]) => Resolved<K>;

export const newInstanceForScope = createResolver(
  (key: any, handler: IContainer, requestor: IContainer) => {
    const instance = createNewInstance(key, handler, requestor);
    const instanceProvider: InstanceProvider<any> = new InstanceProvider<any>(toStringSafe(key), instance);
    /**
     * By default the new instances for scope are disposable.
     * If need be, we can always enhance the `createNewInstance` to support a 'injection' context, to make a non/disposable registration here.
     */
    requestor.registerResolver(key, instanceProvider, true);

    return instance;
  }) as <K>(key: K) => INewInstanceResolver<K>;

export const newInstanceOf = createResolver(
  (key: any, handler: IContainer, requestor: IContainer) => createNewInstance(key, handler, requestor)
) as <K>(key: K) => INewInstanceResolver<K>;

export type INewInstanceResolver<T> = {
  __newInstance: undefined;
  // any is needed for decorator usage
  (...args: unknown[]): any;
};

const createNewInstance = (key: any, handler: IContainer, requestor: IContainer) => {
  return handler.getFactory(key).construct(requestor);
};

_START_CONST_ENUM();
export const enum ResolverStrategy {
  instance = 0,
  singleton = 1,
  transient = 2,
  callback = 3,
  array = 4,
  alias = 5
}
_END_CONST_ENUM();

export class Resolver implements IResolver, IRegistration {
  public constructor(
    public _key: Key,
    public _strategy: ResolverStrategy,
    public _state: any,
  ) {}

  public get $isResolver(): true { return true; }

  private resolving: boolean = false;

  public register(container: IContainer, key?: Key): IResolver {
    return container.registerResolver(key || this._key, this);
  }

  public resolve(handler: IContainer, requestor: IContainer): any {
    switch (this._strategy) {
      case ResolverStrategy.instance:
        return this._state;
      case ResolverStrategy.singleton: {
        if (this.resolving) {
          throw cyclicDependencyError(this._state.name);
        }
        this.resolving = true;
        this._state = handler.getFactory(this._state as Constructable).construct(requestor);
        this._strategy = ResolverStrategy.instance;
        this.resolving = false;
        return this._state;
      }
      case ResolverStrategy.transient: {
        // Always create transients from the requesting container
        const factory = handler.getFactory(this._state as Constructable);
        if (factory === null) {
          throw nullFactoryError(this._key);
        }
        return factory.construct(requestor);
      }
      case ResolverStrategy.callback:
        return (this._state as ResolveCallback)(handler, requestor, this);
      case ResolverStrategy.array:
        return (this._state as IResolver[])[0].resolve(handler, requestor);
      case ResolverStrategy.alias:
        return requestor.get(this._state);
      default:
        throw invalidResolverStrategyError(this._strategy);
    }
  }

  public getFactory(container: IContainer): IFactory | null {
    switch (this._strategy) {
      case ResolverStrategy.singleton:
      case ResolverStrategy.transient:
        return container.getFactory(this._state as Constructable);
      case ResolverStrategy.alias:
        return container.getResolver(this._state)?.getFactory?.(container) ?? null;
      default:
        return null;
    }
  }
}
const cyclicDependencyError = (name: string) =>
  __DEV__
    ? createError(`AUR0003: Cyclic dependency found: ${name}`)
    : createError(`AUR0003:${name}`);
const nullFactoryError = (key: Key) =>
  __DEV__
    ? createError(`AUR0004: Resolver for ${toStringSafe(key)} returned a null factory`)
    : createError(`AUR0004:${toStringSafe(key)}`);
const invalidResolverStrategyError = (strategy: ResolverStrategy) =>
  __DEV__
    ? createError(`AUR0005: Invalid resolver strategy specified: ${strategy}.`)
    : createError(`AUR0005:${strategy}`);

/** @internal */
export interface IInvoker<T extends Constructable = any> {
  invoke(container: IContainer, fn: T, dependencies: Key[]): Resolved<T>;
  invokeWithDynamicDependencies(
    container: IContainer,
    fn: T,
    staticDependencies: Key[],
    dynamicDependencies: Key[]
  ): Resolved<T>;
}

export function containerGetKey(this: IContainer, d: Key) {
  return this.get(d);
}

function transformInstance<T>(inst: Resolved<T>, transform: (instance: any) => any) {
  return transform(inst);
}

/** @internal */
export class Factory<T extends Constructable = any> implements IFactory<T> {
  private transformers: ((instance: any) => any)[] | null = null;
  public constructor(
    public Type: T,
    private readonly dependencies: Key[],
  ) {}

  public construct(container: IContainer, dynamicDependencies?: unknown[]): Resolved<T> {
    let instance: Resolved<T>;
    if (dynamicDependencies === void 0) {
      instance = new this.Type(...this.dependencies.map(containerGetKey, container)) as Resolved<T>;
    } else {
      instance = new this.Type(...this.dependencies.map(containerGetKey, container), ...dynamicDependencies) as Resolved<T>;
    }

    if (this.transformers == null) {
      return instance;
    }

    return this.transformers.reduce(transformInstance, instance);
  }

  public registerTransformer(transformer: (instance: any) => any): void {
    (this.transformers ??= []).push(transformer);
  }
}

/**
 * An implementation of IRegistry that delegates registration to a
 * separately registered class. The ParameterizedRegistry facilitates the
 * passing of parameters to the final registry.
 */
export class ParameterizedRegistry implements IRegistry {
  public constructor(
    private readonly key: Key,
    private readonly params: unknown[]
  ) {}

  public register(container: IContainer): void {
    if (container.has(this.key, true)) {
      const registry = container.get<IRegistry>(this.key);
      registry.register(container, ...this.params);
    } else {
      container.register(...this.params.filter(x => typeof x === 'object'));
    }
  }
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
 export const Registration = {
  /**
   * allows you to pass an instance.
   * Every time you request this {@linkcode Key} you will get this instance back.
   * ```
   * Registration.instance(Foo, new Foo()));
   * ```
   *
   * @param key - key to register the instance with
   * @param value - the instance associated with the key
   */
  instance: instanceRegistration,
  /**
   * Creates an instance from the class.
   * Every time you request this {@linkcode Key} you will get the same one back.
   * ```
   * Registration.singleton(Foo, Foo);
   * ```
   *
   * @param key - key to register the singleton class with
   * @param value - the singleton class to instantiate when a container resolves the associated key
   */
  singleton: singletonRegistration,
  /**
   * Creates an instance from a class.
   * Every time you request this {@linkcode Key} you will get a new instance.
   * ```
   * Registration.instance(Foo, Foo);
   * ```
   *
   * @param key - key to register the transient class with
   * @param value - the class to instantiate when a container resolves the associated key
   */
  transient: transientRegistation,
  /**
   * Creates an instance from the method passed.
   * Every time you request this {@linkcode Key} you will get a new instance.
   * ```
   * Registration.callback(Foo, () => new Foo());
   * Registration.callback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
   * ```
   *
   * @param key - key to register the callback with
   * @param callback - the callback to invoke when a container resolves the associated key
   */
  callback: callbackRegistration,
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
   * @param key - key to register the cached callback with
   * @param callback - the cache callback to invoke when a container resolves the associated key
   */
  cachedCallback: cachedCallbackRegistration,
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
   * @param originalKey - the real key to resolve the get call from a container
   * @param aliasKey - the key that a container allows to resolve the real key associated
   */
  aliasTo: aliasToRegistration,
  /**
   * @internal
   * @param key - the key to register a defer registration
   * @param params - the parameters that should be passed to the resolution of the key
   */
  defer: deferRegistration,
};

export class InstanceProvider<K extends Key> implements IDisposableResolver<K | null> {
  /** @internal */ private _instance: Resolved<K> | null = null;
  /** @internal */ private readonly _name?: string;

  public get friendlyName() {
    return this._name;
  }

  public constructor(
    name?: string,
    /**
     * if not undefined, then this is the value this provider will resolve to
     * until overridden by explicit prepare call
     */
    instance?: Resolved<K> | null,
  ) {
    this._name = name;
    if (instance !== void 0) {
      this._instance = instance;
    }
  }

  public prepare(instance: Resolved<K>): void {
    this._instance = instance;
  }

  public get $isResolver(): true {return true;}

  public resolve(): Resolved<K> | null {
    if (this._instance == null) {
      throw noInstanceError(this._name);
    }
    return this._instance;
  }

  public dispose(): void {
    this._instance = null;
  }
}

const noInstanceError = (name?: string) => {
  if (__DEV__) {
    return createError(`AUR0013: Cannot call resolve ${name} before calling prepare or after calling dispose.`);
  } else {
    return createError(`AUR0013:${name}`);
  }
};
