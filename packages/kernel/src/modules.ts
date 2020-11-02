/* eslint-disable @typescript-eslint/class-name-casing */
/* eslint-disable @typescript-eslint/camelcase */
import { DI, IRegistry } from './di';
import { Constructable, IDisposable, IIndexable } from './interfaces';
import { emptyArray } from './platform';
import { Protocol, ResourceDefinition } from './resource';

export interface IModule {
  [key: string]: unknown;
  default?: unknown;
}

export interface IModuleLoader extends ModuleLoader {}
export const IModuleLoader = DI.createInterface<IModuleLoader>().withDefault(x => x.singleton(ModuleLoader));

/**
 * A simple store for dynamically imported modules that caches modules by their `import()` promise or path,
 * so that future requests for the same module can be served synchronously.
 */
export class ModuleLoader implements IDisposable {
  private readonly promiseCache: Map<Promise<IModule>, IModule> = new Map();
  private readonly pathCache: Map<string, Promise<IModule>> = new Map();

  public load<TRet>(path: string, callback: (m: IModule) => TRet): Promise<TRet> | TRet;
  public load<TRet>(promise: Promise<IModule>, callback: (m: IModule) => TRet): Promise<TRet> | TRet;
  public load<TRet>(pathOrPromise: string | Promise<IModule>, callback: (m: IModule) => TRet): Promise<TRet> | TRet;
  public load<TRet>(pathOrPromise: string | Promise<IModule>, callback: (m: IModule) => TRet): Promise<TRet> | TRet {
    let promise: Promise<IModule>;
    if (typeof pathOrPromise === 'string') {
      const path = pathOrPromise;
      const cachedPromise = this.pathCache.get(path);
      if (cachedPromise === void 0) {
        this.pathCache.set(path, promise = import(path));
      } else {
        promise = cachedPromise;
      }
    } else if (pathOrPromise instanceof Promise) {
      promise = pathOrPromise;
    } else {
      throw new Error(`Expected a path (string) or a promise, but got: ${String(pathOrPromise)}`);
    }

    const cachedModule = this.promiseCache.get(promise);
    if (cachedModule !== void 0) {
      return callback(cachedModule);
    }

    return promise.then(value => {
      this.promiseCache.set(promise, value);
      return callback(value);
    });
  }

  public dispose(): void {
    this.promiseCache.clear();
    this.pathCache.clear();
  }
}

export class AnalyzedModule {
  public constructor(
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

export interface IModuleAnalyzer extends ModuleAnalyzer {}
export const IModuleAnalyzer = DI.createInterface<IModuleAnalyzer>().withDefault(x => x.singleton(ModuleAnalyzer));

export class ModuleAnalyzer implements IDisposable {
  private readonly cache: Map<IModule, AnalyzedModule> = new Map();

  public analyze(m: IModule): AnalyzedModule {
    let result = this.cache.get(m);
    if (result === void 0) {
      this.cache.set(m, result = this.$analyze(m));
    }
    return result;
  }

  private $analyze(m: IModule): AnalyzedModule {
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
          isRegistry = typeof (value as IIndexable).register === 'function';
          isConstructable = false;
          definitions = emptyArray;
          break;
        case 'function':
          isRegistry = typeof (value as Constructable & IIndexable).register === 'function';
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

    return new AnalyzedModule(items as ITypedModuleItem_T[]);
  }

  public dispose(): void {
    this.cache.clear();
  }
}
