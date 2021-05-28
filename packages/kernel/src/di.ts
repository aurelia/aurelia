import { Metadata, isObject, applyMetadataPolyfill } from '@aurelia/metadata';

applyMetadataPolyfill(Reflect, false, false);

import { isArrayIndex, isNativeFunction } from './functions.js';
import { Class, Constructable, IDisposable } from './interfaces.js';
import { emptyArray } from './platform.js';
import { IResourceKind, Protocol, ResourceDefinition, ResourceType } from './resource.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

export class ResolverBuilder<K> {
  public constructor(
    private container: IContainer,
    private key: Key,
  ) {}

  public instance(value: K): IResolver<K> {
    return this.registerResolver(ResolverStrategy.instance, value);
  }

  public singleton(value: Constructable): IResolver<K> {
    return this.registerResolver(ResolverStrategy.singleton, value);
  }

  public transient(value: Constructable): IResolver<K> {
    return this.registerResolver(ResolverStrategy.transient, value);
  }

  public callback(value: ResolveCallback<K>): IResolver<K> {
    return this.registerResolver(ResolverStrategy.callback, value);
  }

  public cachedCallback(value: ResolveCallback<K>): IResolver<K> {
    return this.registerResolver(ResolverStrategy.callback, cacheCallbackResult(value));
  }

  public aliasTo(destinationKey: Key): IResolver<K> {
    return this.registerResolver(ResolverStrategy.alias, destinationKey);
  }

  private registerResolver(strategy: ResolverStrategy, state: unknown): IResolver<K> {
    const { container, key } = this;
    this.container = this.key = (void 0)!;
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

function cloneArrayWithPossibleProps<T>(source: readonly T[]): T[] {
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
}

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
  none(key: Key): IResolver {throw Error(`${key.toString()} not registered, did you forget to add @singleton()?`);},
  singleton(key: Key): IResolver {return new Resolver(key, ResolverStrategy.singleton, key);},
  transient(key: Key): IResolver {return new Resolver(key, ResolverStrategy.transient, key);},
};

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

export const DI = {
  createContainer(config?: Partial<IContainerConfiguration>): IContainer {
    return new Container(null, ContainerConfiguration.from(config));
  },
  getDesignParamtypes(Type: Constructable | Injectable): readonly Key[] | undefined {
    return Metadata.getOwn('design:paramtypes', Type);
  },
  getAnnotationParamtypes(Type: Constructable | Injectable): readonly Key[] | undefined {
    const key = Protocol.annotation.keyFor('di:paramtypes');
    return Metadata.getOwn(key, Type);
  },
  getOrCreateAnnotationParamTypes(Type: Constructable | Injectable): Key[] {
    const key = Protocol.annotation.keyFor('di:paramtypes');
    let annotationParamtypes = Metadata.getOwn(key, Type);
    if (annotationParamtypes === void 0) {
      Metadata.define(key, annotationParamtypes = [], Type);
      Protocol.annotation.appendTo(Type, key);
    }
    return annotationParamtypes;
  },
  getDependencies(Type: Constructable | Injectable): Key[] {
    // Note: Every detail of this getDependencies method is pretty deliberate at the moment, and probably not yet 100% tested from every possible angle,
    // so be careful with making changes here as it can have a huge impact on complex end user apps.
    // Preferably, only make changes to the dependency resolution process via a RFC.

    const key = Protocol.annotation.keyFor('di:dependencies');
    let dependencies = Metadata.getOwn(key, Type) as Key[] | undefined;
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
        const annotationParamtypes = DI.getAnnotationParamtypes(Type);
        if (designParamtypes === void 0) {
          if (annotationParamtypes === void 0) {
            // Only go up the prototype if neither static inject nor any of the paramtypes is defined, as
            // there is no sound way to merge a type's deps with its prototype's deps
            const Proto = Object.getPrototypeOf(Type);
            if (typeof Proto === 'function' && Proto !== Function.prototype) {
              dependencies = cloneArrayWithPossibleProps(DI.getDependencies(Proto));
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
          for (let i = 0; i < len; ++i) {
            auAnnotationParamtype = annotationParamtypes[i];
            if (auAnnotationParamtype !== void 0) {
              dependencies[i] = auAnnotationParamtype;
            }
          }

          const keys = Object.keys(annotationParamtypes);
          len = keys.length;
          let key: string;
          for (let i = 0; i < len; ++i) {
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

      Metadata.define(key, dependencies, Type);
      Protocol.annotation.appendTo(Type, key);
    }

    return dependencies;
  },
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
  createInterface<K extends Key>(configureOrName?: string | ((builder: ResolverBuilder<K>) => IResolver<K>), configuror?: (builder: ResolverBuilder<K>) => IResolver<K>): InterfaceSymbol<K> {
    const configure = typeof configureOrName === 'function' ? configureOrName : configuror;
    const friendlyName = typeof configureOrName === 'string' ? configureOrName : undefined;

    const Interface = function (target: Injectable<K>, property: string, index: number): void {
      if (target == null || new.target !== undefined) {
        throw new Error(`No registration for interface: '${Interface.friendlyName}'`); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
      }
      const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
      annotationParamtypes[index] = Interface;
    };
    Interface.$isInterface = true;
    Interface.friendlyName = friendlyName == null ? '(anonymous)' : friendlyName;

    if (configure != null) {
      Interface.register = function (container: IContainer, key?: Key): IResolver<K> {
          return configure(new ResolverBuilder(container, key ?? Interface));
      };
    }

    Interface.toString = function toString(): string {
      return `InterfaceSymbol<${Interface.friendlyName}>`;
    };

    return Interface;
  },
  inject(...dependencies: Key[]): (target: Injectable, key?: string | number, descriptor?: PropertyDescriptor | number) => void {
    return function (target: Injectable, key?: string | number, descriptor?: PropertyDescriptor | number): void {
      if (typeof descriptor === 'number') { // It's a parameter decorator.
        const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
        const dep = dependencies[0];
        if (dep !== void 0) {
          annotationParamtypes[descriptor] = dep;
        }
      } else if (key) { // It's a property decorator. Not supported by the container without plugins.
        const annotationParamtypes = DI.getOrCreateAnnotationParamTypes((target as unknown as { constructor: Injectable }).constructor);
        const dep = dependencies[0];
        if (dep !== void 0) {
          annotationParamtypes[key as number] = dep;
        }
      } else if (descriptor) { // It's a function decorator (not a Class constructor)
        const fn = descriptor.value;
        const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(fn);
        let dep: Key;
        for (let i = 0; i < dependencies.length; ++i) {
          dep = dependencies[i];
          if (dep !== void 0) {
            annotationParamtypes[i] = dep;
          }
        }
      } else { // It's a class decorator.
        const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
        let dep: Key;
        for (let i = 0; i < dependencies.length; ++i) {
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
    target.register = function register(container: IContainer): IResolver<InstanceType<T>> {
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
    target.register = function register(container: IContainer): IResolver<InstanceType<T>> {
      const registration = Registration.singleton(target, target);
      return registration.register(container, target);
    };
    target.registerInRequestor = options.scoped;
    return target as T & RegisterSelf<T>;
  },
};

export const IContainer = DI.createInterface<IContainer>('IContainer');
export const IServiceLocator = IContainer as unknown as InterfaceSymbol<IServiceLocator>;

function createResolver(getter: (key: any, handler: IContainer, requestor: IContainer) => any): (key: any) => any {
  return function (key: any): ReturnType<typeof DI.inject> {
    const resolver: ReturnType<typeof DI.inject> & Partial<Pick<IResolver, 'resolve'>> & { $isResolver: true} = function (target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number): void {
      DI.inject(resolver)(target, property, descriptor);
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

function singletonDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> {
  return DI.singleton(target);
}
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
  if (typeof targetOrOptions === 'function') {
    return DI.singleton(targetOrOptions);
  }
  return function <T extends Constructable>($target: T) {
    return DI.singleton($target, targetOrOptions as SingletonOptions | undefined);
  };
}

function createAllResolver(
  getter: (key: any, handler: IContainer, requestor: IContainer, searchAncestors: boolean) => readonly any[]
): (key: any, searchAncestors?: boolean) => ReturnType<typeof DI.inject> {
  return function (key: any, searchAncestors?: boolean): ReturnType<typeof DI.inject> {
    searchAncestors = !!searchAncestors;
    const resolver: ReturnType<typeof DI.inject>
      & Required<Pick<IResolver, 'resolve'>>
      & { $isResolver: true}
      = function (
          target: Injectable,
          property?: string | number,
          descriptor?: PropertyDescriptor | number
        ): void {
          DI.inject(resolver)(target, property, descriptor);
        };

    resolver.$isResolver = true;
    resolver.resolve = function (handler: IContainer, requestor: IContainer): any {
      return getter(key, handler, requestor, searchAncestors!);
    };

    return resolver;
  };
}

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
export function ignore(target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number): void {
  DI.inject(ignore)(target, property, descriptor);
}
ignore.$isResolver = true;
ignore.resolve = () => undefined;
export const newInstanceForScope = createResolver((key: any, handler: IContainer, requestor: IContainer) => {
  const instance = createNewInstance(key, handler);

  const instanceProvider: InstanceProvider<any> = new InstanceProvider<any>(String(key));
  instanceProvider.prepare(instance);

  requestor.registerResolver(key, instanceProvider, true);

  return instance;
});

export const newInstanceOf = createResolver((key: any, handler: IContainer, _requestor: IContainer) => createNewInstance(key, handler));

function createNewInstance(key: any, handler: IContainer) {
  return handler.getFactory(key).construct(handler);
}

/** @internal */
export const enum ResolverStrategy {
  instance = 0,
  singleton = 1,
  transient = 2,
  callback = 3,
  array = 4,
  alias = 5
}

/** @internal */
export class Resolver implements IResolver, IRegistration {
  public constructor(
    public key: Key,
    public strategy: ResolverStrategy,
    public state: any,
  ) {}

  public get $isResolver(): true { return true; }

  private resolving: boolean = false;

  public register(container: IContainer, key?: Key): IResolver {
    return container.registerResolver(key || this.key, this);
  }

  public resolve(handler: IContainer, requestor: IContainer): any {
    switch (this.strategy) {
      case ResolverStrategy.instance:
        return this.state;
      case ResolverStrategy.singleton: {
        if (this.resolving) {
          throw new Error(`Cyclic dependency found: ${this.state.name}`);
        }
        this.resolving = true;
        this.state = handler.getFactory(this.state as Constructable).construct(requestor);
        this.strategy = ResolverStrategy.instance;
        this.resolving = false;
        return this.state;
      }
      case ResolverStrategy.transient: {
        // Always create transients from the requesting container
        const factory = handler.getFactory(this.state as Constructable);
        if (factory === null) {
          throw new Error(`Resolver for ${String(this.key)} returned a null factory`);
        }
        return factory.construct(requestor);
      }
      case ResolverStrategy.callback:
        return (this.state as ResolveCallback)(handler, requestor, this);
      case ResolverStrategy.array:
        return (this.state as IResolver[])[0].resolve(handler, requestor);
      case ResolverStrategy.alias:
        return requestor.get(this.state);
      default:
        throw new Error(`Invalid resolver strategy specified: ${this.strategy}.`);
    }
  }

  public getFactory(container: IContainer): IFactory | null {
    switch (this.strategy) {
      case ResolverStrategy.singleton:
      case ResolverStrategy.transient:
        return container.getFactory(this.state as Constructable);
      case ResolverStrategy.alias:
        return container.getResolver(this.state)?.getFactory?.(container) ?? null;
      default:
        return null;
    }
  }
}

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

function containerGetKey(this: IContainer, d: Key) {
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

const containerResolver: IResolver = {
  $isResolver: true,
  resolve(handler: IContainer, requestor: IContainer): IContainer {
    return requestor;
  }
};

function isRegistry(obj: IRegistry | Record<string, IRegistry>): obj is IRegistry {
  return typeof obj.register === 'function';
}

function isSelfRegistry<T extends Constructable>(obj: RegisterSelf<T>): obj is RegisterSelf<T> {
  return isRegistry(obj) && typeof obj.registerInRequestor === 'boolean';
}

function isRegisterInRequester<T extends Constructable>(obj: RegisterSelf<T>): obj is RegisterSelf<T> {
  return isSelfRegistry(obj) && obj.registerInRequestor;
}

function isClass<T extends { prototype?: any }>(obj: T): obj is Class<any, T> {
  return obj.prototype !== void 0;
}

function isResourceKey(key: Key): key is string {
  return typeof key === 'string' && key.indexOf(':') > 0;
}

const InstrinsicTypeNames = new Set<string>([
  'Array',
  'ArrayBuffer',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'Float32Array',
  'Float64Array',
  'Function',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Map',
  'Number',
  'Object',
  'Promise',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  'SharedArrayBuffer',
  'String',
  'SyntaxError',
  'TypeError',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
  'URIError',
  'WeakMap',
  'WeakSet',
]);

const factoryKey = 'di:factory';
const factoryAnnotationKey = Protocol.annotation.keyFor(factoryKey);
let containerId = 0;
/** @internal */
export class Container implements IContainer {
  public readonly id: number = ++containerId;
  private registerDepth: number = 0;

  public get depth(): number {
    return this.parent === null ? 0 : this.parent.depth + 1;
  }
  public readonly root: Container;

  private readonly resolvers: Map<Key, IResolver | IDisposableResolver>;
  // Factories are "global" per container tree
  private readonly factories: Map<Constructable, Factory>;

  private resourceResolvers: Record<string, IResolver | IDisposableResolver | undefined>;

  private readonly disposableResolvers: Set<IDisposableResolver> = new Set<IDisposableResolver>();

  public constructor(
    private readonly parent: Container | null,
    private readonly config: ContainerConfiguration,
  ) {
    if (parent === null) {
      this.root = this;

      this.resolvers = new Map();
      this.factories = new Map<Constructable, Factory>();

      this.resourceResolvers = Object.create(null);
    } else {
      this.root = parent.root;

      this.resolvers = new Map();
      this.factories = parent.factories;

      if (config.inheritParentResources) {
        this.resourceResolvers = Object.assign(
          Object.create(null),
          parent.resourceResolvers,
          this.root.resourceResolvers,
        );
      } else {
        this.resourceResolvers = Object.assign(
          Object.create(null),
          this.root.resourceResolvers,
        );
      }
    }

    this.resolvers.set(IContainer, containerResolver);
  }

  public register(...params: any[]): IContainer {
    if (++this.registerDepth === 100) {
      throw new Error(`Unable to autoregister dependency: [${params.map(String)}]`);
      // TODO: change to reporter.error and add various possible causes in description.
      // Most likely cause is trying to register a plain object that does not have a
      // register method and is not a class constructor
    }
    let current: IRegistry | Record<string, IRegistry>;
    let keys: string[];
    let value: IRegistry;
    let j: number;
    let jj: number;
    for (let i = 0, ii = params.length; i < ii; ++i) {
      current = params[i];
      if (!isObject(current)) {
        continue;
      }
      if (isRegistry(current)) {
        current.register(this);
      } else if (Protocol.resource.has(current)) {
        const defs = Protocol.resource.getAll(current);
        if (defs.length === 1) {
          // Fast path for the very common case
          defs[0].register(this);
        } else {
          const len = defs.length;
          for (let d = 0; d < len; ++d) {
            defs[d].register(this);
          }
        }
      } else if (isClass(current)) {
        Registration.singleton(current, current as Constructable).register(this);
      } else {
        keys = Object.keys(current);
        j = 0;
        jj = keys.length;
        for (; j < jj; ++j) {
          value = current[keys[j]];
          if (!isObject(value)) {
            continue;
          }
          // note: we could remove this if-branch and call this.register directly
          // - the extra check is just a perf tweak to create fewer unnecessary arrays by the spread operator
          if (isRegistry(value)) {
            value.register(this);
          } else {
            this.register(value);
          }
        }
      }
    }
    --this.registerDepth;
    return this;
  }

  public registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>, isDisposable: boolean = false): IResolver<T> {
    validateKey(key);

    const resolvers = this.resolvers;
    const result = resolvers.get(key);

    if (result == null) {
      resolvers.set(key, resolver);
      if (isResourceKey(key)) {
        this.resourceResolvers[key] = resolver;
      }
    } else if (result instanceof Resolver && result.strategy === ResolverStrategy.array) {
      (result.state as IResolver[]).push(resolver);
    } else {
      resolvers.set(key, new Resolver(key, ResolverStrategy.array, [result, resolver]));
    }

    if (isDisposable) {
      this.disposableResolvers.add(resolver as IDisposableResolver<T>);
    }

    return resolver;
  }

  // public deregisterResolverFor<K extends Key, T = K>(key: K): void {
  //   // const console =  (globalThis as any).console;
  //   // console.group("deregisterResolverFor");
  //   validateKey(key);

  //   let current: Container = this;
  //   let resolver: IResolver | undefined;

  //   while (current != null) {
  //     resolver = current.resolvers.get(key);

  //     if (resolver != null) { break; }
  //     if (current.parent == null) { return; }
  //     current = current.parent;
  //   }

  //   if (resolver === void 0) { return; }
  //   if (resolver instanceof Resolver && resolver.strategy === ResolverStrategy.array) {
  //     throw new Error('Cannot deregister a resolver with array strategy');
  //   }
  //   if (this.disposableResolvers.has(resolver as IDisposableResolver<T>)) {
  //     (resolver as IDisposableResolver<T>).dispose();
  //   }
  //   if (isResourceKey(key)) {
  //     // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  //     delete this.resourceResolvers[key];
  //   }
  //   // console.log(`BEFORE delete ${Array.from(current.resolvers.keys()).map((k) => k.toString())}`);
  //   current.resolvers.delete(key);
  //   // console.log(`AFTER delete ${Array.from(current.resolvers.keys()).map((k) => k.toString())}`);
  //   // console.groupEnd();
  // }

  public registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean {
    const resolver = this.getResolver(key);

    if (resolver == null) {
      return false;
    }

    if (resolver.getFactory) {
      const factory = resolver.getFactory(this);

      if (factory == null) {
        return false;
      }

      // This type cast is a bit of a hacky one, necessary due to the duplicity of IResolverLike.
      // Problem is that that interface's type arg can be of type Key, but the getFactory method only works on
      // type Constructable. So the return type of that optional method has this additional constraint, which
      // seems to confuse the type checker.
      factory.registerTransformer(transformer as unknown as Transformer<Constructable>);
      return true;
    }

    return false;
  }

  public getResolver<K extends Key, T = K>(key: K | Key, autoRegister: boolean = true): IResolver<T> | null {
    validateKey(key);

    if ((key as unknown as IResolver).resolve !== void 0) {
      return key as unknown as IResolver;
    }

    let current: Container = this;
    let resolver: IResolver | undefined;

    while (current != null) {
      resolver = current.resolvers.get(key);

      if (resolver == null) {
        if (current.parent == null) {
          const handler = (isRegisterInRequester(key as unknown as RegisterSelf<Constructable>)) ? this : current;
          return autoRegister ? this.jitRegister(key, handler) : null;
        }

        current = current.parent;
      } else {
        return resolver;
      }
    }

    return null;
  }

  public has<K extends Key>(key: K, searchAncestors: boolean = false): boolean {
    return this.resolvers.has(key)
      ? true
      : searchAncestors && this.parent != null
        ? this.parent.has(key, true)
        : false;
  }

  public get<K extends Key>(key: K): Resolved<K> {
    validateKey(key);

    if ((key as IResolver).$isResolver) {
      return (key as IResolver).resolve(this, this);
    }

    let current: Container = this;
    let resolver: IResolver | undefined;

    while (current != null) {
      resolver = current.resolvers.get(key);

      if (resolver == null) {
        if (current.parent == null) {
          const handler = (isRegisterInRequester(key as unknown as RegisterSelf<Constructable>)) ? this : current;
          resolver = this.jitRegister(key, handler);
          return resolver.resolve(current, this);
        }

        current = current.parent;
      } else {
        return resolver.resolve(current, this);
      }
    }

    throw new Error(`Unable to resolve key: ${key}`);
  }

  public getAll<K extends Key>(key: K, searchAncestors: boolean = false): readonly Resolved<K>[] {
    validateKey(key);

    const requestor = this;
    let current: Container | null = requestor;
    let resolver: IResolver | undefined;

    if (searchAncestors) {
      let resolutions: any[] = emptyArray;
      while (current != null) {
        resolver = current.resolvers.get(key);
        if (resolver != null) {
          resolutions = resolutions.concat(buildAllResponse(resolver, current, requestor));
        }
        current = current.parent;
      }
      return resolutions;
    } else {
      while (current != null) {
        resolver = current.resolvers.get(key);

        if (resolver == null) {
          current = current.parent;

          if (current == null) {
            return emptyArray;
          }
        } else {
          return buildAllResponse(resolver, current, requestor);
        }
      }
    }

    return emptyArray;
  }

  public invoke<T, TDeps extends unknown[] = unknown[]>(Type: Constructable<T>, dynamicDependencies?: TDeps): T {
    if (isNativeFunction(Type)) {
      throw createNativeInvocationError(Type);
    }
    return new Factory<Constructable<T>>(Type, DI.getDependencies(Type)).construct(this, dynamicDependencies) as T;
  }

  public getFactory<K extends Constructable>(Type: K): IFactory<K> {
    let factory = this.factories.get(Type);
    if (factory === void 0) {
      if (isNativeFunction(Type)) {
        throw createNativeInvocationError(Type);
      }
      this.factories.set(Type, factory = new Factory<K>(Type, DI.getDependencies(Type)));
    }
    return factory;
  }

  public registerFactory<K extends Constructable>(key: K, factory: IFactory<K>): void {
    this.factories.set(key, factory as Factory);
  }

  public createChild(config?: Partial<IContainerConfiguration>): IContainer {
    if (config === void 0 && this.config.inheritParentResources) {
      if (this.config === ContainerConfiguration.DEFAULT) {
        return new Container(this, this.config);
      }
      return new Container(
        this,
        ContainerConfiguration.from({
          ...this.config,
          inheritParentResources: false,
        }),
      );
    }
    return new Container(this, ContainerConfiguration.from(config ?? this.config));
  }

  public disposeResolvers() {
    const disposables = Array.from(this.disposableResolvers);
    while (disposables.length > 0) {
      disposables.pop()?.dispose();
    }
  }

  public find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null {
    const key = kind.keyFrom(name);
    let resolver = this.resourceResolvers[key];
    if (resolver === void 0) {
      resolver = this.root.resourceResolvers[key];
      if (resolver === void 0) {
        return null;
      }
    }

    if (resolver === null) {
      return null;
    }

    if (typeof resolver.getFactory === 'function') {
      const factory = resolver.getFactory(this);
      if (factory === null || factory === void 0) {
        return null;
      }

      const definition = Metadata.getOwn(kind.name, factory.Type);
      if (definition === void 0) {
        // TODO: we may want to log a warning here, or even throw. This would happen if a dependency is registered with a resource-like key
        // but does not actually have a definition associated via the type's metadata. That *should* generally not happen.
        return null;
      }

      return definition;
    }

    return null;
  }

  public create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null {
    const key = kind.keyFrom(name);
    let resolver = this.resourceResolvers[key];
    if (resolver === void 0) {
      resolver = this.root.resourceResolvers[key];
      if (resolver === void 0) {
        return null;
      }
      return resolver.resolve(this.root, this) ?? null;
    }
    return resolver.resolve(this, this) ?? null;
  }

  public dispose(): void {
    this.disposeResolvers();
    this.resolvers.clear();
  }

  private jitRegister(keyAsValue: any, handler: Container): IResolver {
    if (typeof keyAsValue !== 'function') {
      throw new Error(`Attempted to jitRegister something that is not a constructor: '${keyAsValue}'. Did you forget to register this resource?`);
    }
    if (InstrinsicTypeNames.has(keyAsValue.name)) {
      throw new Error(`Attempted to jitRegister an intrinsic type: ${keyAsValue.name}. Did you forget to add @inject(Key)`);
    }

    if (isRegistry(keyAsValue)) {
      const registrationResolver = keyAsValue.register(handler, keyAsValue);
      if (!(registrationResolver instanceof Object) || (registrationResolver as IResolver).resolve == null) {
        const newResolver = handler.resolvers.get(keyAsValue);
        if (newResolver != void 0) {
          return newResolver;
        }
        throw new Error(`Invalid resolver returned from the static register method`);
      }
      return registrationResolver as IResolver;
    } else if (Protocol.resource.has(keyAsValue)) {
      const defs = Protocol.resource.getAll(keyAsValue);
      if (defs.length === 1) {
        // Fast path for the very common case
        defs[0].register(handler);
      } else {
        const len = defs.length;
        for (let d = 0; d < len; ++d) {
          defs[d].register(handler);
        }
      }
      const newResolver = handler.resolvers.get(keyAsValue);
      if (newResolver != void 0) {
        return newResolver;
      }
      throw new Error(`Invalid resolver returned from the static register method`);
    } else if (keyAsValue.$isInterface) {
      throw new Error(`Attempted to jitRegister an interface: ${keyAsValue.friendlyName}`);
    } else {
      const resolver = this.config.defaultResolver(keyAsValue, handler);
      handler.resolvers.set(keyAsValue, resolver);
      return resolver;
    }
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

type ResolverLookup = WeakMap<IResolver, unknown>;
const containerLookup = new WeakMap<IContainer, ResolverLookup>();

function cacheCallbackResult<T>(fun: ResolveCallback<T>): ResolveCallback<T> {
  return function (handler: IContainer, requestor: IContainer, resolver: IResolver): T {
    let resolverLookup = containerLookup.get(handler);
    if (resolverLookup === void 0) {
      containerLookup.set(handler, resolverLookup = new WeakMap());
    }
    if (resolverLookup.has(resolver)) {
      return resolverLookup.get(resolver) as T;
    }
    const t = fun(handler, requestor, resolver);
    resolverLookup.set(resolver, t);
    return t;
  };
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
   * @param key
   * @param value
   */
  instance<T>(key: Key, value: T): IRegistration<T> {
    return new Resolver(key, ResolverStrategy.instance, value);
  },
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
  singleton<T extends Constructable>(key: Key, value: T): IRegistration<InstanceType<T>> {
    return new Resolver(key, ResolverStrategy.singleton, value);
  },
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
  transient<T extends Constructable>(key: Key, value: T): IRegistration<InstanceType<T>> {
    return new Resolver(key, ResolverStrategy.transient, value);
  },
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
  callback<T>(key: Key, callback: ResolveCallback<T>): IRegistration<Resolved<T>> {
    return new Resolver(key, ResolverStrategy.callback, callback);
  },
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
  cachedCallback<T>(key: Key, callback: ResolveCallback<T>): IRegistration<Resolved<T>> {
    return new Resolver(key, ResolverStrategy.callback, cacheCallbackResult(callback));
  },
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
  aliasTo<T>(originalKey: T, aliasKey: Key): IRegistration<Resolved<T>> {
    return new Resolver(aliasKey, ResolverStrategy.alias, originalKey);
  },
  /**
   * @internal
   * @param key
   * @param params
   */
  defer(key: Key, ...params: unknown[]): IRegistry {
    return new ParameterizedRegistry(key, params);
  }
};

export class InstanceProvider<K extends Key> implements IDisposableResolver<K | null> {
  private instance: Resolved<K> | null = null;

  public constructor(
    public readonly friendlyName?: string,
  ) {}

  public prepare(instance: Resolved<K>): void {
    this.instance = instance;
  }

  public get $isResolver(): true {return true;}

  public resolve(): Resolved<K> | null {
    if (this.instance == null) {
      throw new Error(`Cannot call resolve ${this.friendlyName} before calling prepare or after calling dispose.`);
    }
    return this.instance;
  }

  public dispose(): void {
    this.instance = null;
  }
}

/** @internal */
export function validateKey(key: any): void {
  if (key === null || key === void 0) {
    throw new Error('key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
  }
}

function buildAllResponse(resolver: IResolver, handler: IContainer, requestor: IContainer): any[] {
  if (resolver instanceof Resolver && resolver.strategy === ResolverStrategy.array) {
    const state = resolver.state as IResolver[];
    let i = state.length;
    const results = new Array(i);

    while (i--) {
      results[i] = state[i].resolve(handler, requestor);
    }

    return results;
  }

  return [resolver.resolve(handler, requestor)];
}

function createNativeInvocationError(Type: Constructable): Error {
  return new Error(`${Type.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`);
}
