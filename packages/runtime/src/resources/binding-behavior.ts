import {
  Constructable,
  IContainer,
  ResourceDefinition,
  IResourceKind,
  ResourceType,
  Registration,
  Metadata,
  Protocol,
  PartialResourceDefinition,
  mergeArrays,
  firstDefined,
  IServiceLocator,
  DI,
  Key,
  fromAnnotationOrDefinitionOrTypeOrDefault,
} from '@aurelia/kernel';
import { registerAliases } from '../definitions';
import { LifecycleFlags, State } from '../flags';
import { IScope, ISubscribable, IProxySubscribable } from '../observation';
import { IBinding } from '../lifecycle';
import { connectable, IConnectableBinding } from '../binding/connectable';
import { IObserverLocator } from '../observation/observer-locator';
import { IBindingBehaviorExpression } from '../ast';

export type PartialBindingBehaviorDefinition = PartialResourceDefinition<{
  strategy?: BindingBehaviorStrategy;
}>;

export type BindingBehaviorInstance<T extends {} = {}> = {
  bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
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
      firstDefined(BindingBehavior.getAnnotation(Type, 'name'), name),
      mergeArrays(BindingBehavior.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
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
    private readonly container: IContainer,
    private readonly Type: BindingBehaviorType<T>,
  ) {
    this.deps = DI.getDependencies(Type);
  }

  public construct(
    binding: IInterceptableBinding,
    expr: IBindingBehaviorExpression,
  ): IInterceptableBinding {
    const container = this.container;
    const deps = this.deps;
    switch (deps.length) {
      case 0:
      case 1:
      case 2:
        return new this.Type(binding, expr) as IInterceptableBinding;
      case 3:
        return new this.Type(container.get(deps[0]), binding, expr) as IInterceptableBinding;
      case 4:
        return new this.Type(container.get(deps[0]), container.get(deps[1]), binding, expr) as IInterceptableBinding;
      default:
        return new this.Type(...deps.map(d => container.get(d)), binding, expr) as IInterceptableBinding;
    }
  }
}

export interface IInterceptableBinding extends IBinding {
  id?: number;
  readonly observerLocator?: IObserverLocator;
  updateTarget?(value: unknown, flags: LifecycleFlags): void;
  updateSource?(value: unknown, flags: LifecycleFlags): void;

  callSource?(args: object): unknown;
  handleChange?(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;

  observeProperty?(flags: LifecycleFlags, obj: object, propertyName: string): void;
  addObserver?(observer: ISubscribable | IProxySubscribable): void;
  unobserve?(all?: boolean): void;
}

export interface BindingInterceptor extends IConnectableBinding {}

@connectable
export class BindingInterceptor implements IInterceptableBinding {
  public interceptor: this = this;
  public get id(): number {
    return this.binding.id!;
  }
  public get observerLocator(): IObserverLocator {
    return this.binding.observerLocator!;
  }
  public get locator(): IServiceLocator {
    return this.binding.locator;
  }
  public get $scope(): IScope | undefined {
    return this.binding.$scope;
  }
  public get part(): string | undefined {
    return this.binding.part;
  }
  public get $state(): State {
    return this.binding.$state;
  }

  public constructor(
    public readonly binding: IInterceptableBinding,
    public readonly expr: IBindingBehaviorExpression,
  ) {
    let interceptor: IBinding;
    while (binding.interceptor !== this) {
      interceptor = binding.interceptor;
      binding.interceptor = this;
      binding = interceptor;
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
    this.binding.handleChange!(newValue, previousValue, flags);
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void {
    this.binding.$bind(flags, scope, part);
  }
  public $unbind(flags: LifecycleFlags): void {
    this.binding.$unbind(flags);
  }
}

export const BindingBehavior: BindingBehaviorKind = {
  name: Protocol.resource.keyFor('binding-behavior'),
  keyFrom(name: string): string {
    return `${BindingBehavior.name}:${name}`;
  },
  isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never) {
    return typeof value === 'function' && Metadata.hasOwn(BindingBehavior.name, value);
  },
  define<T extends Constructable<BindingBehaviorInstance>>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T> {
    const definition = BindingBehaviorDefinition.create(nameOrDef, Type as Constructable<BindingBehaviorInstance>);
    Metadata.define(BindingBehavior.name, definition, definition.Type);
    Metadata.define(BindingBehavior.name, definition, definition);
    Protocol.resource.appendTo(Type, BindingBehavior.name);

    return definition.Type as BindingBehaviorType<T>;
  },
  getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T> {
    const def = Metadata.getOwn(BindingBehavior.name, Type);
    if (def === void 0) {
      throw new Error(`No definition found for type ${Type.name}`);
    }

    return def;
  },
  annotate<K extends keyof PartialBindingBehaviorDefinition>(Type: Constructable, prop: K, value: PartialBindingBehaviorDefinition[K]): void {
    Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
  },
  getAnnotation<K extends keyof PartialBindingBehaviorDefinition>(Type: Constructable, prop: K): PartialBindingBehaviorDefinition[K] {
    return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
  },
};
