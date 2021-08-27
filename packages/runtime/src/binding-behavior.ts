import {
  ResourceType,
  Registration,
  mergeArrays,
  firstDefined,
  DI,
  fromAnnotationOrDefinitionOrTypeOrDefault,
} from '@aurelia/kernel';
import { Collection, IndexMap, LifecycleFlags } from './observation.js';
import { registerAliases } from './alias.js';
import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata, getResourceKeyFor, hasOwnMetadata } from './utilities-objects.js';

import type {
  Constructable,
  IContainer,
  ResourceDefinition,
  IResourceKind,
  PartialResourceDefinition,
  IServiceLocator,
  Key,
} from '@aurelia/kernel';
import type { BindingObserverRecord, IConnectableBinding } from './binding/connectable.js';
import type { BindingBehaviorExpression, ForOfStatement, IsBindingBehavior } from './binding/ast.js';
import type { IObserverLocator } from './observation/observer-locator.js';
import type { IBinding } from './observation.js';
import type { Scope } from './observation/binding-context.js';

export type PartialBindingBehaviorDefinition = PartialResourceDefinition<{
  strategy?: BindingBehaviorStrategy;
}>;

export type BindingBehaviorInstance<T extends {} = {}> = {
  bind(flags: LifecycleFlags, scope: Scope, binding: IBinding, ...args: T[]): void;
  unbind(flags: LifecycleFlags, scope: Scope, binding: IBinding, ...args: T[]): void;
} & T;

export const enum BindingBehaviorStrategy {
  singleton = 1,
  interceptor = 2,
}

export type BindingBehaviorType<T extends Constructable = Constructable> = ResourceType<T, BindingBehaviorInstance>;
export type BindingBehaviorKind = IResourceKind<BindingBehaviorType, BindingBehaviorDefinition> & {
  isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never);
  define<T extends Constructable>(name: string, Type: T): BindingBehaviorType<T>;
  define<T extends Constructable>(def: PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
  getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T>;
  annotate<K extends keyof PartialBindingBehaviorDefinition>(Type: Constructable, prop: K, value: PartialBindingBehaviorDefinition[K]): void;
  getAnnotation<K extends keyof PartialBindingBehaviorDefinition>(Type: Constructable, prop: K): PartialBindingBehaviorDefinition[K];
};

export type BindingBehaviorDecorator = <T extends Constructable>(Type: T) => BindingBehaviorType<T>;

export function bindingBehavior(definition: PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(name: string): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDef: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDef: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator {
  return function (target) {
    return BindingBehavior.define(nameOrDef, target);
  };
}

export class BindingBehaviorDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, BindingBehaviorInstance> {
  private constructor(
    public readonly Type: BindingBehaviorType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string,
    public readonly strategy: BindingBehaviorStrategy,
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialBindingBehaviorDefinition,
    Type: BindingBehaviorType<T>,
  ): BindingBehaviorDefinition<T> {

    let name: string;
    let def: PartialBindingBehaviorDefinition;
    if (typeof nameOrDef === 'string') {
      name = nameOrDef;
      def = { name };
    } else {
      name = nameOrDef.name;
      def = nameOrDef;
    }

    const inheritsFromInterceptor = Object.getPrototypeOf(Type) === BindingInterceptor;

    return new BindingBehaviorDefinition(
      Type,
      firstDefined(getBehaviorAnnotation(Type, 'name'), name),
      mergeArrays(getBehaviorAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
      BindingBehavior.keyFrom(name),
      fromAnnotationOrDefinitionOrTypeOrDefault('strategy', def, Type, () => inheritsFromInterceptor ? BindingBehaviorStrategy.interceptor : BindingBehaviorStrategy.singleton),
    );
  }

  public register(container: IContainer): void {
    const { Type, key, aliases, strategy } = this;
    switch (strategy) {
      case BindingBehaviorStrategy.singleton:
        Registration.singleton(key, Type).register(container);
        break;
      case BindingBehaviorStrategy.interceptor:
        Registration.instance(key, new BindingBehaviorFactory(container, Type)).register(container);
        break;
    }
    Registration.aliasTo(key, Type).register(container);
    registerAliases(aliases, BindingBehavior, key, container);
  }
}

export class BindingBehaviorFactory<T extends Constructable = Constructable> {
  private readonly deps: readonly Key[];

  public constructor(
    private readonly ctn: IContainer,
    private readonly Type: BindingBehaviorType<T>,
  ) {
    this.deps = DI.getDependencies(Type);
  }

  public construct(
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ): IInterceptableBinding {
    const container = this.ctn;
    const deps = this.deps;
    switch (deps.length) {
      case 0:
        // TODO(fkleuver): fix this cast
        return new this.Type(binding, expr) as unknown as IInterceptableBinding;
      case 1:
        return new this.Type(container.get(deps[0]), binding, expr) as unknown as IInterceptableBinding;
      case 2:
        return new this.Type(container.get(deps[0]), container.get(deps[1]), binding, expr) as unknown as IInterceptableBinding;
      default:
        return new this.Type(...deps.map(d => container.get(d) as unknown), binding, expr) as unknown as IInterceptableBinding;
    }
  }
}

export type IInterceptableBinding = Exclude<IConnectableBinding, 'updateTarget' | 'updateSource' | 'callSource' | 'handleChange'> & {
  updateTarget?(value: unknown, flags: LifecycleFlags): void;
  updateSource?(value: unknown, flags: LifecycleFlags): void;

  callSource?(args: object): unknown;
  handleChange?(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
};

export interface BindingInterceptor extends IConnectableBinding {}

export class BindingInterceptor implements IInterceptableBinding {
  public interceptor: this = this;
  public get oL(): IObserverLocator {
    return this.binding.oL;
  }
  public get locator(): IServiceLocator {
    return this.binding.locator;
  }
  public get $scope(): Scope | undefined {
    return this.binding.$scope;
  }
  public get isBound(): boolean {
    return this.binding.isBound;
  }
  public get obs(): BindingObserverRecord {
    return this.binding.obs;
  }
  public get sourceExpression(): IsBindingBehavior | ForOfStatement {
    return (this.binding as unknown as { sourceExpression: IsBindingBehavior | ForOfStatement }).sourceExpression;
  }

  public constructor(
    public readonly binding: IInterceptableBinding,
    public readonly expr: BindingBehaviorExpression,
  ) {
    let interceptor: IBinding;
    while (binding.interceptor !== this) {
      interceptor = binding.interceptor;
      binding.interceptor = this;
      binding = interceptor as IInterceptableBinding;
    }
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    this.binding.updateTarget!(value, flags);
  }
  public updateSource(value: unknown, flags: LifecycleFlags): void {
    this.binding.updateSource!(value, flags);
  }
  public callSource(args: object): unknown {
    return this.binding.callSource!(args);
  }
  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    this.binding.handleChange(newValue, previousValue, flags);
  }
  public handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void {
    this.binding.handleCollectionChange(indexMap, flags);
  }
  public observe(obj: object, key: string): void {
    this.binding.observe(obj, key);
  }
  public observeCollection(observer: Collection): void {
    this.binding.observeCollection(observer);
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    this.binding.$bind(flags, scope);
  }
  public $unbind(flags: LifecycleFlags): void {
    this.binding.$unbind(flags);
  }
}

const bbBaseName = getResourceKeyFor('binding-behavior');
const getBehaviorAnnotation = <K extends keyof PartialBindingBehaviorDefinition>(
  Type: Constructable,
  prop: K,
): PartialBindingBehaviorDefinition[K] => getOwnMetadata(getAnnotationKeyFor(prop), Type) as PartialBindingBehaviorDefinition[K];

export const BindingBehavior = Object.freeze<BindingBehaviorKind>({
  name: bbBaseName,
  keyFrom(name: string): string {
    return `${bbBaseName}:${name}`;
  },
  isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never) {
    return typeof value === 'function' && hasOwnMetadata(bbBaseName, value);
  },
  define<T extends Constructable<BindingBehaviorInstance>>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T> {
    const definition = BindingBehaviorDefinition.create(nameOrDef, Type as Constructable<BindingBehaviorInstance>);
    defineMetadata(bbBaseName, definition, definition.Type);
    defineMetadata(bbBaseName, definition, definition);
    appendResourceKey(Type, bbBaseName);

    return definition.Type as BindingBehaviorType<T>;
  },
  getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T> {
    const def = getOwnMetadata(bbBaseName, Type) as BindingBehaviorDefinition<T>;
    if (def === void 0) {
      if (__DEV__)
        throw new Error(`No definition found for type ${Type.name}`);
      else
        throw new Error(`AUR0151:${Type.name}`);
    }

    return def;
  },
  annotate<K extends keyof PartialBindingBehaviorDefinition>(Type: Constructable, prop: K, value: PartialBindingBehaviorDefinition[K]): void {
    defineMetadata(getAnnotationKeyFor(prop), value, Type);
  },
  getAnnotation: getBehaviorAnnotation,
});
