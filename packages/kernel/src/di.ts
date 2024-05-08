/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeTC39Metadata } from '@aurelia/metadata';

import { isArrayIndex } from './functions';
import { createContainer } from './di.container';
import { Constructable, IDisposable } from './interfaces';
import { getAnnotationKeyFor, ResourceType } from './resource';
import { defineMetadata, getMetadata, isFunction, isString } from './utilities';
import { singletonRegistration, cacheCallbackResult, transientRegistation } from './di.registration';
import { ErrorNames, createMappedError } from './errors';
import type { IAllResolver, ICallableResolver, IFactoryResolver, ILazyResolver, INewInstanceResolver, IOptionalResolver, IResolvedFactory, IResolvedLazy } from './di.resolvers';

export type ResolveCallback<T = any> = (handler: IContainer, requestor: IContainer, resolver: IResolver<T>) => T;

export interface InterfaceSymbol<K = any> {
  // We can activate decorator if the argument decorator proposal will be standardized by TC39 (https://github.com/tc39/proposal-class-method-parameter-decorators)
  // (target: Injectable | AbstractInjectable, property: string | symbol | undefined, index?: number): void;
  $isInterface: boolean;
  friendlyName?: string;
  register?(container: IContainer, key?: K): IResolver<K>;
  toString?(): string;
}

// This interface exists only to break a circular type referencing issue in the IServiceLocator interface.
// Otherwise IServiceLocator references IResolver, which references IContainer, which extends IServiceLocator.
interface IResolverLike<C, K = any> {
  readonly $isResolver: true;
  resolve(handler: C, requestor: C): Resolved<K>;
  getFactory?<T extends K extends Constructable ? IFactory<K> : IFactory<Constructable>>(container: C): T | null;
}

export interface IResolver<K = any> extends IResolverLike<IContainer, K>, Partial<IDisposable> { }
export interface IDisposableResolver<K = any> extends IResolver<K> {
  dispose(): void;
}

export interface IRegistration<K = any> extends IResolver<K> {
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
  get<K extends Key>(key: IAllResolver<K>): Resolved<K>[];
  get<K extends Key>(key: INewInstanceResolver<K>): Resolved<K>;
  get<K extends Key>(key: ILazyResolver<K>): IResolvedLazy<K>;
  get<K extends Key>(key: IOptionalResolver<K>): Resolved<K> | undefined;
  get<K extends Key>(key: IFactoryResolver<K>): IResolvedFactory<K>;
  get<K extends Key>(key: ICallableResolver<K>): Resolved<K>;
  get<K extends Key>(key: IResolver<K>): Resolved<K>;
  get<K extends Key>(key: K): Resolved<K>;
  get<K extends Key>(key: Key): Resolved<K>;
  get<K extends Key>(key: K | Key): Resolved<K>;
  getAll<K extends Key>(key: K, searchAncestors?: boolean): Resolved<K>[];
  getAll<K extends Key>(key: Key, searchAncestors?: boolean): Resolved<K>[];
  getAll<K extends Key>(key: K | Key, searchAncestors?: boolean): Resolved<K>[];
}

export interface IRegistry {
  register(container: IContainer, ...params: unknown[]): void | IResolver | IContainer;
}

export interface IContainer extends IServiceLocator, IDisposable {
  readonly id: number;
  readonly root: IContainer;
  readonly parent: IContainer | null;
  register(...params: any[]): IContainer;
  registerResolver<K extends Key, T extends IResolver<K>>(key: K, resolver: T, isDisposable?: boolean): T;
  // deregisterResolverFor<K extends Key>(key: K, searchAncestors: boolean): void;
  registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
  getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
  registerFactory<T extends Constructable>(key: T, factory: IFactory<T>): void;
  invoke<T extends {}, TDeps extends unknown[] = unknown[]>(key: Constructable<T>, dynamicDependencies?: TDeps): T;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasFactory<T extends Constructable>(key: any): boolean;
  getFactory<T extends Constructable>(key: T): IFactory<T>;
  createChild(config?: IContainerConfiguration): IContainer;
  disposeResolvers(): void;
  /**
   * Register resources from another container, an API for manually registering resources
   *
   * This is a semi private API, apps should avoid using it directly
   */
  useResources(container: IContainer): void;
  find<TResType extends ResourceType>(kind: string, name: string): TResType | null;
  find<TResType extends ResourceType>(key: string): TResType | null;
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
    return container.registerResolver(key, new Resolver(key, strategy, state)) as IResolver<K>;
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
export type AbstractInjectable<T = {}> = (abstract new (...args: any[]) => T) & { inject?: Key[] };

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

const diParamTypesKeys = getAnnotationKeyFor('di:paramtypes');
const getAnnotationParamtypes = (Type: Constructable | Injectable): readonly Key[] | undefined => {
  return getMetadata(diParamTypesKeys, Type);
};

const getDesignParamtypes = (Type: Constructable | Injectable): readonly Key[] | undefined =>
  getMetadata('design:paramtypes', Type);

const getOrCreateAnnotationParamTypes = (context: DecoratorContext): Key[] => {
  return (context.metadata[diParamTypesKeys] ??= []) as Key[];
};

/** @internal */
export const getDependencies = (Type: Constructable | Injectable): Key[] => {
  // Note: Every detail of this getDependencies method is pretty deliberate at the moment, and probably not yet 100% tested from every possible angle,
  // so be careful with making changes here as it can have a huge impact on complex end user apps.
  // Preferably, only make changes to the dependency resolution process via a RFC.

  const key = getAnnotationKeyFor('di:dependencies');
  let dependencies = getMetadata<Key[] | undefined>(key, Type);
  if (dependencies === void 0) {
    // Type.length is the number of constructor parameters. If this is 0, it could mean the class has an empty constructor
    // but it could also mean the class has no constructor at all (in which case it inherits the constructor from the prototype).

    // Non-zero constructor length + no paramtypes means emitDecoratorMetadata is off, or the class has no decorator.
    // We're not doing anything with the above right now, but it's good to keep in mind for any future issues.

    const inject = (Type as Injectable).inject;
    if (inject === void 0) {
      // design:paramtypes is set by tsc when emitDecoratorMetadata is enabled.
      const designParamtypes = getDesignParamtypes(Type);
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

    defineMetadata(dependencies, Type, key);
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
  const friendlyName = (isString(configureOrName) ? configureOrName : undefined) ?? '(anonymous)';

  const Interface = {
    // Old code kept with the hope that the argument decorator proposal will be standardized by TC39 (https://github.com/tc39/proposal-class-method-parameter-decorators)
    // function(_target: Injectable | AbstractInjectable, _property: string | symbol | undefined, _index: number | undefined): void {
    //    if (target == null || new.target !== undefined) {
    //     throw createMappedError(ErrorNames.no_registration_for_interface, friendlyName);
    //    }
    //    const annotationParamtypes = getOrCreateAnnotationParamTypes(target as Injectable);
    //    annotationParamtypes[index!] = Interface;
    // },
    $isInterface: true,
    friendlyName: friendlyName,
    toString: (): string => `InterfaceSymbol<${friendlyName}>`,
    register: configure != null
      ? (container: IContainer, key?: Key): IResolver<K> => configure(new ResolverBuilder(container, key ?? Interface))
      : void 0,
  };
  return Interface;
};

export const inject = (...dependencies: Key[]): (decorated: unknown, context: DecoratorContext) => void => {
  return (decorated: unknown, context: DecoratorContext): void => {
    switch (context.kind) {
      case 'class': {
        const annotationParamtypes = getOrCreateAnnotationParamTypes(context);
        let dep: Key;
        let i = 0;
        for (; i < dependencies.length; ++i) {
          dep = dependencies[i];
          if (dep !== void 0) {
            annotationParamtypes[i] = dep;
          }
        }
        break;
      }
      case 'field': {
        const annotationParamtypes: any = getOrCreateAnnotationParamTypes(context);
        const dep = dependencies[0];
        if (dep !== void 0) {
          annotationParamtypes[context.name] = dep;
        }
        break;
      }
      // TODO(sayan): support getter injection - new feature
      // TODO:
      //    support method parameter injection when the class-method-parameter-decorators proposal (https://github.com/tc39/proposal-class-method-parameter-decorators)
      //    reaches stage 4 and/or implemented by TS.
      default:
        throw createMappedError(ErrorNames.invalid_inject_decorator_usage, String(context.name), context.kind);
    }
  };
};

export const DI = /*@__PURE__*/ (() => {
  // putting this function inside this IIFE as we wants to call it without triggering side effect
  initializeTC39Metadata();

  return {
    createContainer,
    getDesignParamtypes,
    // getAnnotationParamtypes,
    // getOrCreateAnnotationParamTypes,
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
    inject,
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
        const registration = transientRegistation(target as T, target as T);
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
        const registration = singletonRegistration(target, target);
        return registration.register(container, target);
      };
      target.registerInRequestor = options.scoped;
      return target as T & RegisterSelf<T>;
    },
  };
})();

export const IContainer = /*@__PURE__*/createInterface<IContainer>('IContainer');
export const IServiceLocator = IContainer as unknown as InterfaceSymbol<IServiceLocator>;

function transientDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>, context: ClassDecoratorContext):
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
export function transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>, context: ClassDecoratorContext): T & RegisterSelf<T>;
export function transient<T extends Constructable>(target?: T & Partial<RegisterSelf<T>>, context?: ClassDecoratorContext): T & RegisterSelf<T> | typeof transientDecorator {
  return  target == null ? transientDecorator : transientDecorator(target, context!);
}

type SingletonOptions = { scoped: boolean };
const defaultSingletonOptions = { scoped: false };
const decorateSingleton = DI.singleton;

type SingletonDecorator = <T extends Constructable>(target: T & Partial<RegisterSelf<T>>, context: ClassDecoratorContext) => T & RegisterSelf<T>;
/**
 * Registers the decorated class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @example ```ts
 * &#64;singleton()
 * class Foo { }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function singleton<T extends Constructable>(): SingletonDecorator;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function singleton<T extends Constructable>(options?: SingletonOptions): SingletonDecorator;
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
export function singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>, context: ClassDecoratorContext): T & RegisterSelf<T>;
export function singleton<T extends Constructable>(targetOrOptions?: (T & Partial<RegisterSelf<T>>) | SingletonOptions, _context?: ClassDecoratorContext): T & RegisterSelf<T> | SingletonDecorator {
  return isFunction(targetOrOptions)
    // The decorator is applied without options. Example: `@singleton()` or `@singleton`
    ? decorateSingleton(targetOrOptions)
    : function <T extends Constructable>($target: T, _ctx: ClassDecoratorContext) {
      return decorateSingleton($target, targetOrOptions);
    };
}

_START_CONST_ENUM();
/** @internal */
export const enum ResolverStrategy {
  instance = 0,
  singleton = 1,
  transient = 2,
  callback = 3,
  array = 4,
  alias = 5,
}
_END_CONST_ENUM();

/** @internal */
export class Resolver<K extends Key = any> implements IResolver<K> {
  /** @internal */
  public _key: Key;
  /** @internal */
  public _strategy: ResolverStrategy;
  /** @internal */
  public _state: any;

  public get $isResolver(): true { return true; }

  /** @internal */
  private _resolving: boolean = false;

  public constructor(
    key: K,
    strategy: ResolverStrategy,
    state: any,
  ) {
    this._key = key;
    this._strategy = strategy;
    this._state = state;
  }

  /**
   * When resolving a singleton, the internal state is changed,
   * so cache the original constructable factory for future requests
   * @internal
   */
  private _cachedFactory: IFactory | null = null;

  public register(container: IContainer, key?: Key): IResolver {
    return container.registerResolver(key || this._key, this as IResolver<K>);
  }

  public resolve(handler: IContainer, requestor: IContainer): any {
    switch (this._strategy) {
      case ResolverStrategy.instance:
        return this._state;
      case ResolverStrategy.singleton: {
        if (this._resolving) {
          throw createMappedError(ErrorNames.cyclic_dependency, this._state.name);
        }
        this._resolving = true;
        this._state = (this._cachedFactory = handler.getFactory(this._state as Constructable)).construct(requestor);
        this._strategy = ResolverStrategy.instance;
        this._resolving = false;
        return this._state;
      }
      case ResolverStrategy.transient: {
        // Always create transients from the requesting container
        const factory = handler.getFactory(this._state as Constructable);
        if (factory === null) {
          throw createMappedError(ErrorNames.no_factory, this._key);
        }
        return factory.construct(requestor);
      }
      case ResolverStrategy.callback:
        return (this._state as ResolveCallback)(handler, requestor, this as IResolver<K>);
      case ResolverStrategy.array:
        return (this._state as IResolver[])[0].resolve(handler, requestor);
      case ResolverStrategy.alias:
        return requestor.get(this._state);
      default:
        throw createMappedError(ErrorNames.invalid_resolver_strategy, this._strategy);
    }
  }

  public getFactory<T extends K extends Constructable ? IFactory<K> : IFactory<Constructable>>(container: IContainer): T | null {
    switch (this._strategy) {
      case ResolverStrategy.singleton:
      case ResolverStrategy.transient:
        return container.getFactory(this._state as Constructable) as T;
      case ResolverStrategy.alias:
        return container.getResolver(this._state)?.getFactory?.(container) ?? null;
      case ResolverStrategy.instance:
        return this._cachedFactory as T;
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

export class InstanceProvider<K extends Key> implements IDisposableResolver<K> {
  /** @internal */ private _instance: Resolved<K> | null;
  /** @internal */ private readonly _name?: string;
  /** @internal */ private readonly _Type: Constructable | null;

  public get friendlyName() {
    return this._name;
  }

  public constructor(
    name?: string,
    /**
     * if not undefined, then this is the value this provider will resolve to
     * until overridden by explicit prepare call
     */
    instance: Resolved<K> | null = null,
    Type: Constructable | null = null,
  ) {
    this._name = name;
    this._instance = instance;
    this._Type = Type;
  }

  public prepare(instance: Resolved<K>): void {
    this._instance = instance;
  }

  public get $isResolver(): true {return true;}

  public resolve(): Resolved<K> {
    if (this._instance == null) {
      throw createMappedError(ErrorNames.no_instance_provided, this._name);
    }
    return this._instance;
  }

  public getFactory<T extends K extends Constructable ? IFactory<K> : IFactory<Constructable>>(container: IContainer): T | null {
    return this._Type == null ? null : container.getFactory(this._Type) as T;
  }

  public dispose(): void {
    this._instance = null;
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
