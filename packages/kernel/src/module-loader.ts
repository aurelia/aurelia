import { DI } from './di';
import { emptyArray } from './platform';
import { Protocol } from './resource';
import { isFunction } from './utilities';

import type { IRegistry } from './di';
import type { Constructable, IDisposable, IIndexable } from './interfaces';
import type { ResourceDefinition } from './resource';

export interface IModule {
  [key: string]: unknown;
  default?: unknown;
}

export interface IModuleLoader extends ModuleLoader {}
export const IModuleLoader = DI.createInterface<IModuleLoader>(x => x.singleton(ModuleLoader));

function noTransform<TRet = AnalyzedModule>(m: AnalyzedModule): TRet {
  return m as unknown as TRet;
}

type TransformFn<TMod extends IModule = IModule, TRet = AnalyzedModule<TMod>> = (m: AnalyzedModule<TMod>) => TRet | Promise<TRet>;

class ModuleTransformer<TMod extends IModule = IModule, TRet = AnalyzedModule<TMod>> {
  private readonly _promiseCache: Map<Promise<IModule>, unknown> = new Map<Promise<IModule>, unknown>();
  private readonly _objectCache: Map<IModule, unknown> = new Map<IModule, unknown>();

  public constructor(
    private readonly $transform: TransformFn<TMod, TRet>,
  ) {}

  public transform(objOrPromise: TMod | Promise<TMod>): Promise<TRet> | TRet {
    if (objOrPromise instanceof Promise) {
      return this._transformPromise(objOrPromise);
    } else if (typeof objOrPromise === 'object' && objOrPromise !== null) {
      return this._transformObject(objOrPromise);
    } else {
      throw new Error(`Invalid input: ${String(objOrPromise)}. Expected Promise or Object.`);
    }
  }

  /** @internal */
  private _transformPromise(promise: Promise<TMod>): TRet | Promise<TRet> {
    if (this._promiseCache.has(promise)) {
      return this._promiseCache.get(promise) as TRet | Promise<TRet>;
    }

    const ret = promise.then(obj => {
      return this._transformObject(obj);
    });
    this._promiseCache.set(promise, ret);
    void ret.then(value => {
      // make it synchronous for future requests
      this._promiseCache.set(promise, value);
    });
    return ret;
  }

  /** @internal */
  private _transformObject(obj: TMod): TRet | Promise<TRet> {
    if (this._objectCache.has(obj)) {
      return this._objectCache.get(obj) as TRet | Promise<TRet>;
    }

    const ret = this.$transform(this._analyze(obj));
    this._objectCache.set(obj, ret);
    if (ret instanceof Promise) {
      void ret.then(value => {
        // make it synchronous for future requests
        this._objectCache.set(obj, value);
      });
    }
    return ret;
  }

  /** @internal */
  private _analyze(m: TMod): AnalyzedModule<TMod> {
    if (m == null) throw new Error(`Invalid input: ${String(m)}. Expected Object.`);
    if (typeof m !== 'object') return new AnalyzedModule(m, []);
    let value: unknown;
    let isRegistry: boolean;
    let isConstructable: boolean;
    let definitions: readonly ResourceDefinition[];
    const items: ModuleItem[] = [];

    for (const key in m) {
      switch (typeof (value = m[key])) {
        case 'object':
          if (value === null) {
            continue;
          }
          isRegistry = isFunction((value as IIndexable).register);
          isConstructable = false;
          definitions = emptyArray;
          break;
        case 'function':
          isRegistry = isFunction((value as Constructable & IIndexable).register);
          isConstructable = (value as Constructable).prototype !== void 0;
          definitions = Protocol.resource.getAll(value as Constructable);
          break;
        default:
          continue;
      }

      items.push(new ModuleItem(
        key,
        value,
        isRegistry,
        isConstructable,
        definitions,
      ));
    }

    return new AnalyzedModule(m, items as ITypedModuleItem_T[]);
  }
}

export class ModuleLoader implements IDisposable {
  private readonly transformers: Map<TransformFn, ModuleTransformer> = new Map<TransformFn, ModuleTransformer>();

  /**
   * Await a module promise and then analyzes and transforms it. The result is cached, using the transform function + promise as the cache key.
   *
   * @param promise - A promise (returning a module, or an object resembling a module), e.g. the return value of a dynamic `import()` or `require()` call.
   * @param transform - A transform function, e.g. to select the appropriate default or first non-default resource export.
   * Note: The return value of `transform` is cached, so it is recommended to perform any processing here that is intended to happen only once per unique module promise.
   *
   * @returns The (cached) transformed result. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
   */
  public load<TMod extends IModule = IModule, TRet = AnalyzedModule<TMod>>(promise: Promise<TMod>, transform: (m: AnalyzedModule<TMod>) => TRet | Promise<TRet>): Promise<TRet> | TRet;
  /**
   * Await a module promise and then analyzes it. The result is cached, using the transform function + promise as the cache key.
   *
   * @param promise - A promise (returning a module, or an object resembling a module), e.g. the return value of a dynamic `import()` or `require()` call.
   *
   * @returns The analyzed module. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
   */
  public load<TMod extends IModule = IModule>(promise: Promise<TMod>): Promise<AnalyzedModule<TMod>> | AnalyzedModule<TMod>;
  /**
   * Analyzes and transforms a module-like object. The result is cached, using the transform function + object as the cache key.
   *
   * @param promise - A module-like object, e.g. the awaited return value of a dynamic `import()` or `require()` call, or a statically imported module such as `import * as Module from './my-module';`.
   * @param transform - A transform function, e.g. to select the appropriate default or first non-default resource export.
   * Note: The return value of `transform` is cached, so it is recommended to perform any processing here that is intended to happen only once per unique module promise.
   *
   * @returns The (cached) transformed result. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
   */
  public load<TMod extends IModule = IModule, TRet = AnalyzedModule<TMod>>(obj: TMod, transform: (m: AnalyzedModule<TMod>) => TRet | Promise<TRet>): Promise<TRet> | TRet;
  /**
   * Analyzes a module-like object. The result is cached, using the transform function + object as the cache key.
   *
   * @param promise - A module-like object, e.g. the awaited return value of a dynamic `import()` or `require()` call, or a statically imported module such as `import * as Module from './my-module';`.
   *
   * @returns The analyzed module. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
   */
  public load<TMod extends IModule = IModule>(obj: TMod): AnalyzedModule<TMod>;
  /**
   * Analyzes and transforms a module-like object or a promise thereof. The result is cached, using the transform function + object as the cache key.
   *
   * @param promise - A module-like object or a promise thereof, e.g. the (awaited) return value of a dynamic `import()` or `require()` call, or a statically imported module such as `import * as Module from './my-module';`.
   * @param transform - A transform function, e.g. to select the appropriate default or first non-default resource export.
   * Note: The return value of `transform` is cached, so it is recommended to perform any processing here that is intended to happen only once per unique module promise.
   *
   * @returns The (cached) transformed result. On subsequent calls, if the original promise resolved, the resolved result will be returned (rather than a promise).
   */
  public load<TMod extends IModule = IModule, TRet = AnalyzedModule<TMod>>(objOrPromise: TMod | Promise<TMod>, transform?: (m: AnalyzedModule<TMod>) => TRet | Promise<TRet>): Promise<TRet> | TRet;
  public load<TMod extends IModule = IModule, TRet = AnalyzedModule<TMod>>(objOrPromise: TMod | Promise<TMod>, transform: (m: AnalyzedModule<TMod>) => TRet | Promise<TRet> = noTransform): Promise<TRet> | TRet {
    const transformers = this.transformers as Map<TransformFn, ModuleTransformer> & Map<TransformFn<TMod, TRet>, ModuleTransformer<TMod, TRet>>;
    let transformer = transformers.get(transform);
    if (transformer === void 0) {
      transformers.set(transform, transformer = new ModuleTransformer(transform));
    }

    return transformer.transform(objOrPromise);
  }

  public dispose(): void {
    this.transformers.clear();
  }
}

export class AnalyzedModule<TMod extends IModule = IModule> {
  public constructor(
    public readonly raw: TMod,
    public readonly items: readonly ITypedModuleItem_T[],
  ) {}
}

export interface ITypedModuleItem<
  TisRegistry extends boolean,
  TisConstructable extends boolean,
  TValue
> {
  readonly key: string;
  readonly value: TValue;
  readonly isRegistry: TisRegistry;
  readonly isConstructable: TisConstructable;
  readonly definitions: readonly ResourceDefinition[];
}
export interface ITypedModuleItem_Unknown extends ITypedModuleItem<false, false, unknown> {}
export interface ITypedModuleItem_Registry extends ITypedModuleItem<true, false, IRegistry> {}
export interface ITypedModuleItem_Constructable extends ITypedModuleItem<false, true, Constructable> {}
export interface ITypedModuleItem_ConstructableRegistry extends ITypedModuleItem<true, true, Constructable & IRegistry> {}
export type ITypedModuleItem_T = (
  ITypedModuleItem_Unknown |
  ITypedModuleItem_Registry |
  ITypedModuleItem_Constructable |
  ITypedModuleItem_ConstructableRegistry
);
export class ModuleItem {
  public constructor(
    public readonly key: string,
    public readonly value: unknown,
    public readonly isRegistry: boolean,
    public readonly isConstructable: boolean,
    public readonly definitions: readonly ResourceDefinition[],
  ) {}
}
