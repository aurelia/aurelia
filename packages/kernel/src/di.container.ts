/* eslint-disable @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import { isObject } from '@aurelia/metadata';
import { isNativeFunction } from './functions';
import { Class, Constructable, IDisposable } from './interfaces';
import { emptyArray } from './platform';
import { IResourceKind, Protocol, ResourceDefinition, ResourceType } from './resource';
import { createError, createObject, getOwnMetadata, isFunction, isString, toStringSafe } from './utilities';
import { IContainer, type Key, type IResolver, type IDisposableResolver, Factory, ContainerConfiguration, type IRegistry, Registration, Resolver, ResolverStrategy, Transformer, type RegisterSelf, type Resolved, getDependencies, containerGetKey, IFactory, IContainerConfiguration } from './di';

const InstrinsicTypeNames = new Set<string>('Array ArrayBuffer Boolean DataView Date Error EvalError Float32Array Float64Array Function Int8Array Int16Array Int32Array Map Number Object Promise RangeError ReferenceError RegExp Set SharedArrayBuffer String SyntaxError TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array URIError WeakMap WeakSet'.split(' '));
// const factoryKey = 'di:factory';
// const factoryAnnotationKey = Protocol.annotation.keyFor(factoryKey);
let containerId = 0;
/** @internal */
export class Container implements IContainer {
  public readonly id: number = ++containerId;
  /** @internal */
  private _registerDepth: number = 0;

  public get depth(): number {
    return this.parent === null ? 0 : this.parent.depth + 1;
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

  public constructor(
    private readonly parent: Container | null,
    private readonly config: ContainerConfiguration
  ) {
    if (parent === null) {
      this.root = this;

      this._resolvers = new Map();
      this._factories = new Map<Constructable, Factory>();

      this.res = createObject();
    } else {
      this.root = parent.root;

      this._resolvers = new Map();
      this._factories = parent._factories;

      if (config.inheritParentResources) {
        this.res = Object.assign(
          createObject(),
          parent.res,
          this.root.res
        );
      } else {
        this.res = createObject();
      }
    }

    this._resolvers.set(IContainer, containerResolver);
  }

  public register(...params: any[]): IContainer {
    if (++this._registerDepth === 100) {
      throw registrationError(params);
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
      } else if (Protocol.resource.has(current)) {
        const defs = Protocol.resource.getAll(current);
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
          throw resourceExistError(key);
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

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: Container = this;
    let resolver: IResolver | undefined;
    let handler: Container;

    while (current != null) {
      resolver = current._resolvers.get(key);

      if (resolver == null) {
        if (current.parent == null) {
          handler = (isRegisterInRequester(key as unknown as RegisterSelf<Constructable>)) ? this : current;
          return autoRegister ? this._jitRegister(key, handler) : null;
        }

        current = current.parent;
      } else {
        return resolver;
      }
    }

    return null;
  }

  public has<K extends Key>(key: K, searchAncestors: boolean = false): boolean {
    return this._resolvers.has(key)
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

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: Container = this;
    let resolver: IResolver | undefined;
    let handler: Container;

    while (current != null) {
      resolver = current._resolvers.get(key);

      if (resolver == null) {
        if (current.parent == null) {
          handler = (isRegisterInRequester(key as unknown as RegisterSelf<Constructable>)) ? this : current;
          resolver = this._jitRegister(key, handler);
          return resolver.resolve(current, this);
        }

        current = current.parent;
      } else {
        return resolver.resolve(current, this);
      }
    }

    throw cantResolveKeyError(key);
  }

  public getAll<K extends Key>(key: K, searchAncestors: boolean = false): readonly Resolved<K>[] {
    validateKey(key);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const requestor = this;
    let current: Container | null = requestor;
    let resolver: IResolver | undefined;

    if (searchAncestors) {
      let resolutions: Resolved<K>[] = emptyArray;
      while (current != null) {
        resolver = current._resolvers.get(key);
        if (resolver != null) {
          resolutions = resolutions.concat(buildAllResponse(resolver, current, requestor));
        }
        current = current.parent;
      }
      return resolutions;
    } else {
      while (current != null) {
        resolver = current._resolvers.get(key);

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
    if (dynamicDependencies === void 0) {
      return new Type(...getDependencies(Type).map(containerGetKey, this));
    } else {
      return new Type(...getDependencies(Type).map(containerGetKey, this), ...dynamicDependencies);
    }
  }

  public getFactory<K extends Constructable>(Type: K): IFactory<K> {
    let factory = this._factories.get(Type);
    if (factory === void 0) {
      if (isNativeFunction(Type)) {
        throw createNativeInvocationError(Type);
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
      throw jitRegisterNonFunctionError(keyAsValue);
    }
    if (InstrinsicTypeNames.has(keyAsValue.name)) {
      throw jitInstrinsicTypeError(keyAsValue);
    }

    if (isRegistry(keyAsValue)) {
      const registrationResolver = keyAsValue.register(handler, keyAsValue);
      if (!(registrationResolver instanceof Object) || (registrationResolver as IResolver).resolve == null) {
        const newResolver = handler._resolvers.get(keyAsValue);
        if (newResolver != null) {
          return newResolver;
        }
        throw invalidResolverFromRegisterError();
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
      const newResolver = handler._resolvers.get(keyAsValue);
      if (newResolver != null) {
        return newResolver;
      }
      throw invalidResolverFromRegisterError();
    } else if (keyAsValue.$isInterface) {
      throw jitInterfaceError(keyAsValue.friendlyName);
    } else {
      const resolver = this.config.defaultResolver(keyAsValue, handler);
      handler._resolvers.set(keyAsValue, resolver);
      return resolver;
    }
  }
}

function validateKey(key: any): void {
  if (key === null || key === void 0) {
    if (__DEV__) {
      throw createError(`AUR0014: key/value cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?`);
    } else {
      throw createError(`AUR0014`);
    }
  }
}

const buildAllResponse = (resolver: IResolver, handler: IContainer, requestor: IContainer): any[] => {
  if (resolver instanceof Resolver && resolver._strategy === ResolverStrategy.array) {
    const state = resolver._state as IResolver[];
    let i = state.length;
    const results = new Array(i);

    while (i--) {
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

const registrationError = (deps: Key[]) =>
  // TODO: change to reporter.error and add various possible causes in description.
  // Most likely cause is trying to register a plain object that does not have a
  // register method and is not a class constructor
  __DEV__
    ? createError(`AUR0006: Unable to autoregister dependency: [${deps.map(toStringSafe)}]`)
    : createError(`AUR0006:${deps.map(toStringSafe)}`);
const resourceExistError = (key: Key) =>
  __DEV__
    ? createError(`AUR0007: Resource key "${toStringSafe(key)}" already registered`)
    : createError(`AUR0007:${toStringSafe(key)}`);
const cantResolveKeyError = (key: Key) =>
  __DEV__
    ? createError(`AUR0008: Unable to resolve key: ${toStringSafe(key)}`)
    : createError(`AUR0008:${toStringSafe(key)}`);
const jitRegisterNonFunctionError = (keyAsValue: Key) =>
  __DEV__
    ? createError(`AUR0009: Attempted to jitRegister something that is not a constructor: '${toStringSafe(keyAsValue)}'. Did you forget to register this resource?`)
    : createError(`AUR0009:${toStringSafe(keyAsValue)}`);
const jitInstrinsicTypeError = (keyAsValue: any) =>
  __DEV__
    ? createError(`AUR0010: Attempted to jitRegister an intrinsic type: ${keyAsValue.name}. Did you forget to add @inject(Key)`)
    : createError(`AUR0010:${keyAsValue.name}`);
const invalidResolverFromRegisterError = () =>
  __DEV__
    ? createError(`AUR0011: Invalid resolver returned from the static register method`)
    : createError(`AUR0011`);
const jitInterfaceError = (name: string) =>
  __DEV__
    ? createError(`AUR0012: Attempted to jitRegister an interface: ${name}`)
    : createError(`AUR0012:${name}`);
const createNativeInvocationError = (Type: Constructable): Error =>
  __DEV__
    ? createError(`AUR0015: ${Type.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`)
    : createError(`AUR0015:${Type.name}`);
