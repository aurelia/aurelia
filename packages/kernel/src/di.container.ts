/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import { isObject } from '@aurelia/metadata';
import { isNativeFunction } from './functions';
import { type Class, type Constructable, type IDisposable } from './interfaces';
import { emptyArray } from './platform';
import { type IResourceKind, type ResourceDefinition, type ResourceType, getAllResources, hasResources } from './resource';
import { getOwnMetadata, isFunction, isString } from './utilities';
import {
  IContainer,
  type Key,
  type IResolver,
  type IDisposableResolver,
  ContainerConfiguration,
  type IRegistry,
  Registration,
  Resolver,
  ResolverStrategy,
  type Transformer,
  type RegisterSelf,
  type Resolved,
  getDependencies,
  type IFactory,
  type IContainerConfiguration,
  type IFactoryResolver,
  type ILazyResolver,
  type INewInstanceResolver,
  type IResolvedFactory,
  type IResolvedLazy,
  type IAllResolver,
  type IOptionalResolver,
} from './di';
import { ErrorNames, createMappedError } from './errors';

const InstrinsicTypeNames = new Set<string>('Array ArrayBuffer Boolean DataView Date Error EvalError Float32Array Float64Array Function Int8Array Int16Array Int32Array Map Number Object Promise RangeError ReferenceError RegExp Set SharedArrayBuffer String SyntaxError TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array URIError WeakMap WeakSet'.split(' '));
// const factoryKey = 'di:factory';
// const factoryAnnotationKey = Protocol.annotation.keyFor(factoryKey);
let containerId = 0;

let currentContainer: IContainer | null = null;

/** @internal */
export class Container implements IContainer {
  public readonly id: number = ++containerId;
  /** @internal */
  private _registerDepth: number = 0;

  public get depth(): number {
    return this._parent === null ? 0 : this._parent.depth + 1;
  }
  public readonly root: Container;

  /**
   * All own resolvers of this container
   *
   * @internal
   */
  private readonly _resolvers: Map<Key, IResolver | IDisposableResolver>;
  /**
   * A map of Factory per Constructor (Type) of this container tree.
   *
   * Factories are "global" per container tree
   *
   * @internal
   */
  private readonly _factories: Map<Constructable, Factory>;

  /**
   * A map of all resources resolver by their key
   */
  private res: Record<string, IResolver | IDisposableResolver | undefined>;

  /** @internal */
  private readonly _disposableResolvers: Map<Key, IDisposableResolver> = new Map<Key, IDisposableResolver>();

  public get parent(): IContainer | null {
    return this._parent as (IContainer | null);
  }

  public constructor(
    private readonly _parent: Container | null,
    private readonly config: ContainerConfiguration
  ) {
    if (_parent === null) {
      this.root = this;

      this._resolvers = new Map();
      this._factories = new Map<Constructable, Factory>();

      this.res = {};
    } else {
      this.root = _parent.root;

      this._resolvers = new Map();
      this._factories = _parent._factories;
      this.res = {};

      if (config.inheritParentResources) {
        // todo: when the simplify resource system work is commenced
        //       this resource inheritance can just be a Object.create() call
        //       with parent resources as the prototype of the child resources
        for (const key in _parent.res) {
          this.registerResolver(key, _parent.res[key]!);
        }
      }
    }

    this._resolvers.set(IContainer, containerResolver);
  }

  public register(...params: any[]): IContainer {
    if (++this._registerDepth === 100) {
      throw createMappedError(ErrorNames.unable_auto_register, ...params);
    }
    let current: IRegistry | Record<string, IRegistry>;
    let keys: string[];
    let value: IRegistry;
    let j: number;
    let jj: number;
    let i = 0;
    // eslint-disable-next-line
    let ii = params.length;
    for (; i < ii; ++i) {
      current = params[i];
      if (!isObject(current)) {
        continue;
      }
      if (isRegistry(current)) {
        current.register(this);
      } else if (hasResources(current)) {
        const defs = getAllResources(current);
        if (defs.length === 1) {
          // Fast path for the very common case
          defs[0].register(this);
        } else {
          j = 0;
          jj = defs.length;
          while (jj > j) {
            defs[j].register(this);
            ++j;
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
    --this._registerDepth;
    return this;
  }

  public registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>, isDisposable: boolean = false): IResolver<T> {
    validateKey(key);

    const resolvers = this._resolvers;
    const result = resolvers.get(key);

    if (result == null) {
      resolvers.set(key, resolver);
      if (isResourceKey(key)) {
        if (this.res[key] !== void 0) {
          throw createMappedError(ErrorNames.resource_already_exists, key);
        }
        this.res[key] = resolver;
      }
    } else if (result instanceof Resolver && result._strategy === ResolverStrategy.array) {
      (result._state as IResolver[]).push(resolver);
    } else {
      resolvers.set(key, new Resolver(key, ResolverStrategy.array, [result, resolver]));
    }

    if (isDisposable) {
      this._disposableResolvers.set(key, resolver as IDisposableResolver<T>);
    }

    return resolver;
  }

  // public deregisterResolverFor<K extends Key>(key: K, searchAncestors: boolean): void {
  //   validateKey(key);
  //   // eslint-disable-next-line @typescript-eslint/no-this-alias
  //   let current: Container | null = this;
  //   let resolver: IResolver | undefined;
  //   while (current != null) {
  //     resolver = current._resolvers.get(key);
  //     if (resolver != null) {
  //       current._resolvers.delete(key);
  //       break;
  //     }
  //     if (current.parent == null) { return; }
  //     current = searchAncestors ? current.parent : null;
  //   }
  //   if (resolver == null) { return; }
  //   if (resolver instanceof Resolver && resolver.strategy === ResolverStrategy.array) {
  //     throw createError('Cannot deregister a resolver with array strategy');
  //   }
  //   if (this._disposableResolvers.has(resolver as IDisposableResolver<K>)) {
  //     (resolver as IDisposableResolver<K>).dispose();
  //   }
  //   if (isResourceKey(key)) {
  //     // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  //     delete this.res[key];
  //   }
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

    const previousContainer = currentContainer;
    let current: Container = currentContainer = this;
    let resolver: IResolver | undefined;
    let handler: Container;

    try {
      while (current != null) {
        resolver = current._resolvers.get(key);

        if (resolver == null) {
          if (current._parent == null) {
            handler = (isRegisterInRequester(key as unknown as RegisterSelf<Constructable>)) ? this : current;
            if (autoRegister) {
              return this._jitRegister(key, handler);
            }
            return null;
          }

          current = current._parent;
        } else {
          return resolver;
        }
      }
    } finally {
      currentContainer = previousContainer;
    }

    return null;
  }

  public has<K extends Key>(key: K, searchAncestors: boolean = false): boolean {
    return this._resolvers.has(key) || isResourceKey(key) && key in this.res
      ? true
      : searchAncestors && this._parent != null
        ? this._parent.has(key, true)
        : false;
  }

  public get<K extends Key>(key: K): Resolved<K> {
    validateKey(key);

    if ((key as IResolver).$isResolver) {
      return (key as IResolver).resolve(this, this);
    }

    const previousContainer = currentContainer;
    let current: Container = currentContainer = this;
    let resolver: IResolver | undefined;
    let handler: Container;
    try {
      while (current != null) {
        resolver = current._resolvers.get(key);

        if (resolver == null) {
          if (current._parent == null) {
            handler = (isRegisterInRequester(key as unknown as RegisterSelf<Constructable>)) ? this : current;
            resolver = this._jitRegister(key, handler);
            return resolver.resolve(current, this);
          }
          current = current._parent;
        } else {
          return resolver.resolve(current, this);
        }
      }
    } finally {
      currentContainer = previousContainer;
    }

    throw createMappedError(ErrorNames.unable_resolve_key, key);
  }

  public getAll<K extends Key>(key: K, searchAncestors: boolean = false): readonly Resolved<K>[] {
    validateKey(key);

    const previousContainer = currentContainer;
    const requestor = currentContainer = this;
    let current: Container | null = requestor;
    let resolver: IResolver | undefined;
    let resolutions: Resolved<K>[] = emptyArray;

    try {
      if (searchAncestors) {
        while (current != null) {
          resolver = current._resolvers.get(key);
          if (resolver != null) {
            resolutions = resolutions.concat(buildAllResponse(resolver, current, requestor));
          }
          current = current._parent;
        }
        return resolutions;
      }

      while (current != null) {
        resolver = current._resolvers.get(key);

        if (resolver == null) {
          current = current._parent;

          if (current == null) {
            return emptyArray;
          }
        } else {
          return buildAllResponse(resolver, current, requestor);
        }
      }
    } finally {
      currentContainer = previousContainer;
    }

    return emptyArray;
  }

  public invoke<T extends {}, TDeps extends unknown[] = unknown[]>(Type: Constructable<T>, dynamicDependencies?: TDeps): T {
    const previousContainer = currentContainer;
    currentContainer = this;
    try {
      if (isNativeFunction(Type)) {
        throw createMappedError(ErrorNames.no_construct_native_fn, Type);
      }
      return dynamicDependencies === void 0
        ? new Type(...getDependencies(Type).map(containerGetKey, this))
        : new Type(...getDependencies(Type).map(containerGetKey, this), ...dynamicDependencies);
    } finally {
      currentContainer = previousContainer;
    }
  }

  public hasFactory<T extends Constructable>(key: T): boolean {
    return this._factories.has(key);
  }

  public getFactory<K extends Constructable>(Type: K): IFactory<K> {
    let factory = this._factories.get(Type);
    if (factory === void 0) {
      if (isNativeFunction(Type)) {
        throw createMappedError(ErrorNames.no_construct_native_fn, Type);
      }
      this._factories.set(Type, factory = new Factory<K>(Type, getDependencies(Type)));
    }
    return factory;
  }

  public registerFactory<K extends Constructable>(key: K, factory: IFactory<K>): void {
    this._factories.set(key, factory as Factory);
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
        })
      );
    }
    return new Container(this, ContainerConfiguration.from(config ?? this.config));
  }

  public disposeResolvers(): void {
    const resolvers = this._resolvers;
    const disposableResolvers = this._disposableResolvers;

    let disposable: IDisposable;
    let key: Key;

    for ([key, disposable] of disposableResolvers.entries()) {
      disposable.dispose();
      resolvers.delete(key);
    }
    disposableResolvers.clear();
  }

  public find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null {
    const key = kind.keyFrom(name);
    let resolver = this.res[key];
    if (resolver === void 0) {
      resolver = this.root.res[key];
      if (resolver === void 0) {
        return null;
      }
    }

    if (resolver === null) {
      return null;
    }

    if (isFunction(resolver.getFactory)) {
      const factory = resolver.getFactory(this);
      if (factory === null || factory === void 0) {
        return null;
      }

      const definition = getOwnMetadata(kind.name, factory.Type);
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
    let resolver = this.res[key];
    if (resolver === void 0) {
      resolver = this.root.res[key];
      if (resolver === void 0) {
        return null;
      }
      return resolver.resolve(this.root, this) ?? null;
    }
    return resolver.resolve(this, this) ?? null;
  }

  public dispose(): void {
    if (this._disposableResolvers.size > 0) {
      this.disposeResolvers();
    }
    this._resolvers.clear();
  }

  /** @internal */
  private _jitRegister(keyAsValue: any, handler: Container): IResolver {
    if (!isFunction(keyAsValue)) {
      throw createMappedError(ErrorNames.unable_jit_non_constructor, keyAsValue);
    }

    if (InstrinsicTypeNames.has(keyAsValue.name)) {
      throw createMappedError(ErrorNames.no_jit_intrinsic_type, keyAsValue);
    }

    if (isRegistry(keyAsValue)) {
      const registrationResolver = keyAsValue.register(handler, keyAsValue);
      if (!(registrationResolver instanceof Object) || (registrationResolver as IResolver).resolve == null) {
        const newResolver = handler._resolvers.get(keyAsValue);
        if (newResolver != null) {
          return newResolver;
        }
        throw createMappedError(ErrorNames.null_resolver_from_register, keyAsValue);
      }
      return registrationResolver as IResolver;
    }

    if (hasResources(keyAsValue)) {
      const defs = getAllResources(keyAsValue);
      if (defs.length === 1) {
        // Fast path for the very common case
        defs[0].register(handler);
      } else {
        const len = defs.length;
        for (let d = 0; d < len; ++d) {
          defs[d].register(handler);
        }
      }
      const newResolver = handler._resolvers.get(keyAsValue);
      if (newResolver != null) {
        return newResolver;
      }
      throw createMappedError(ErrorNames.null_resolver_from_register, keyAsValue);
    }

    if (keyAsValue.$isInterface) {
      throw createMappedError(ErrorNames.no_jit_interface, keyAsValue.friendlyName);
    }

    const resolver = this.config.defaultResolver(keyAsValue, handler);
    handler._resolvers.set(keyAsValue, resolver);
    return resolver;
  }
}

/** @internal */
class Factory<T extends Constructable = any> implements IFactory<T> {
  private transformers: ((instance: any) => any)[] | null = null;
  public constructor(
    public Type: T,
    private readonly dependencies: Key[],
  ) {}

  public construct(container: IContainer, dynamicDependencies?: unknown[]): Resolved<T> {
    const previousContainer = currentContainer;
    currentContainer = container;
    let instance: Resolved<T>;
    try {
        if (dynamicDependencies === void 0) {
          instance = new this.Type(...this.dependencies.map(containerGetKey, container)) as Resolved<T>;
        } else {
          instance = new this.Type(...this.dependencies.map(containerGetKey, container), ...dynamicDependencies) as Resolved<T>;
        }

      if (this.transformers == null) {
        return instance;
      }

      return this.transformers.reduce(transformInstance, instance);
    } finally {
      currentContainer = previousContainer;
    }
  }

  public registerTransformer(transformer: (instance: any) => any): void {
    (this.transformers ??= []).push(transformer);
  }
}

function transformInstance<T>(inst: Resolved<T>, transform: (instance: any) => any) {
  return transform(inst);
}

function validateKey(key: any): void {
  if (key === null || key === void 0) {
    throw createMappedError(ErrorNames.null_undefined_key);
  }
}

function containerGetKey(this: IContainer, d: Key) {
  return this.get(d);
}

export type IResolvedInjection<K extends Key> =
  K extends IAllResolver<infer R>
    ? readonly Resolved<R>[]
    : K extends INewInstanceResolver<infer R>
      ? Resolved<R>
      : K extends ILazyResolver<infer R>
        ? IResolvedLazy<R>
        : K extends IOptionalResolver<infer R>
          ? Resolved<R> | undefined
          : K extends IFactoryResolver<infer R>
            ? IResolvedFactory<R>
            : K extends IResolver<infer R>
              ? Resolved<R>
              : K extends [infer R1 extends Key, ...infer R2]
                ? [IResolvedInjection<R1>, ...IResolvedInjection<R2>]
                : Resolved<K>;

/**
 * Retrieve the resolved value of a key, or values of a list of keys from the currently active container.
 *
 * Calling this without an active container will result in an error.
 */
export function resolve<K extends Key>(key: K): IResolvedInjection<K>;
export function resolve<K extends Key[]>(...keys: K): IResolvedInjection<K>;
export function resolve<K extends Key, A extends K[]>(...keys: A): Resolved<K> | Resolved<K>[] {
  if (currentContainer == null) {
    throw createMappedError(ErrorNames.no_active_container_for_resolve, ...keys);
  }
  return keys.length === 1
    ? currentContainer.get(keys[0])
    : keys.map(containerGetKey, currentContainer);
}

const buildAllResponse = (resolver: IResolver, handler: IContainer, requestor: IContainer): any[] => {
  if (resolver instanceof Resolver && resolver._strategy === ResolverStrategy.array) {
    const state = resolver._state as IResolver[];
    const ii = state.length;
    const results = Array(ii);
    let i = 0;

    for (; i < ii; ++i) {
      results[i] = state[i].resolve(handler, requestor);
    }

    return results;
  }

  return [resolver.resolve(handler, requestor)];
};

const containerResolver: IResolver = {
  $isResolver: true,
  resolve(handler: IContainer, requestor: IContainer): IContainer {
    return requestor;
  }
};

const isRegistry = (obj: IRegistry | Record<string, IRegistry>): obj is IRegistry =>
  isFunction(obj.register);

const isSelfRegistry = <T extends Constructable>(obj: RegisterSelf<T>): obj is RegisterSelf<T> =>
  isRegistry(obj) && typeof obj.registerInRequestor === 'boolean';

const isRegisterInRequester = <T extends Constructable>(obj: RegisterSelf<T>): obj is RegisterSelf<T> =>
  isSelfRegistry(obj) && obj.registerInRequestor;

const isClass = <T extends { prototype?: any }>(obj: T): obj is Class<any, T> =>
  obj.prototype !== void 0;

const isResourceKey = (key: Key): key is string =>
  isString(key) && key.indexOf(':') > 0;
