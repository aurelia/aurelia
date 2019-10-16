/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Constructable,
  DI,
  IContainer,
  IResourceKind,
  ResourceType,
  Registration,
  Protocol,
  Metadata,
  PartialResourceDefinition,
  Key,
  ResourceDefinition
} from '@aurelia/kernel';
import {
  registerAliases,
  ITargetedInstruction,
  IBuildInstruction,
  IBindableDescription,
  IChildrenObserverDescription,
  HooksDefinition,
  firstDefined,
  mergeArrays,
  mergeObjects
} from '../definitions';
import {
  IDOM,
  INode,
  INodeSequence,
  IRenderLocation
} from '../dom';
import {
  IController,
  IViewModel,
} from '../lifecycle';
import { BindingStrategy } from '../flags';
import { Bindable } from '../templating/bindable';

type CustomElementDef = PartialResourceDefinition<{
  readonly cache?: '*' | number;
  readonly template?: unknown;
  readonly instructions?: readonly (readonly ITargetedInstruction[])[];
  readonly dependencies?: readonly Key[];
  readonly build?: IBuildInstruction;
  readonly surrogates?: readonly ITargetedInstruction[];
  readonly bindables?: Record<string, IBindableDescription> | readonly string[];
  readonly childrenObservers?: Record<string, IChildrenObserverDescription>;
  readonly containerless?: boolean;
  readonly isStrictBinding?: boolean;
  readonly shadowOptions?: { mode: 'open' | 'closed' } | null;
  readonly hasSlots?: boolean;
  readonly strategy?: BindingStrategy;
  readonly hooks?: Readonly<HooksDefinition>;
  readonly scopeParts?: readonly string[];
}>;

export type CustomElementType<T extends Constructable = Constructable> = ResourceType<T, IViewModel, CustomElementDef>;
export type CustomElementKind = IResourceKind<CustomElementType, CustomElementDefinition> & {
  define<T extends Constructable>(name: string, Type: T): CustomElementType<T>;
  define<T extends Constructable>(def: CustomElementDef, Type: T): CustomElementType<T>;
  define<T extends Constructable>(nameOrDef: string | CustomElementDef, Type: T): CustomElementType<T>;
  getDefinition<T extends Constructable>(Type: T): CustomElementDefinition<T>;
  annotate<K extends keyof CustomElementDef>(Type: Constructable, prop: K, value: CustomElementDef[K]): void;
  getAnnotation<K extends keyof CustomElementDef>(Type: Constructable, prop: K): CustomElementDef[K];
};

export type CustomElementDecorator = <T extends Constructable>(Type: T) => CustomElementType<T>;

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(definition: CustomElementDef): CustomElementDecorator;
export function customElement(name: string): CustomElementDecorator;
export function customElement(nameOrDefinition: string | CustomElementDef): CustomElementDecorator;
export function customElement(nameOrDefinition: string | CustomElementDef): CustomElementDecorator {
  return function (target) {
    return CustomElement.define(nameOrDefinition, target);
  };
}

type ShadowOptions = Pick<CustomElementDef, 'shadowOptions'>['shadowOptions'];

/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM(options?: ShadowOptions): (target: Constructable) => void;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM(target: Constructable): void;
export function useShadowDOM(targetOrOptions?: Constructable | ShadowOptions): void | ((target: Constructable) => void) {
  if (targetOrOptions === void 0) {
    return function ($target: Constructable) {
      CustomElement.annotate($target, 'shadowOptions', { mode: 'open' });
    };
  }

  if (typeof targetOrOptions !== 'function') {
    return function ($target: Constructable) {
      CustomElement.annotate($target, 'shadowOptions', targetOrOptions);
    };
  }

  CustomElement.annotate(targetOrOptions, 'shadowOptions', { mode: 'open' });
}

/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(target: Constructable): void;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(): (target: Constructable) => void;
export function containerless(target?: Constructable): void | ((target: Constructable) => void) {
  if (target === void 0) {
    return function ($target: Constructable) {
      CustomElement.annotate($target, 'containerless', true);
    };
  }

  CustomElement.annotate(target, 'containerless', true);
}

/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export function strict(target: Constructable): void;
/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export function strict(): (target: Constructable) => void;
export function strict(target?: Constructable): void | ((target: Constructable) => void) {
  if (target === void 0) {
    return function ($target: Constructable) {
      CustomElement.annotate($target, 'isStrictBinding', true);
    };
  }

  CustomElement.annotate(target, 'isStrictBinding', true);
}

export class CustomElementDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, IViewModel, CustomElementDef> {
  private constructor(
    public readonly Type: CustomElementType<T>,
    public readonly name: string,
    public readonly aliases: string[],
    public readonly key: string,
    public readonly cache: '*' | number,
    public readonly template: unknown,
    public readonly instructions: readonly (readonly ITargetedInstruction[])[],
    public readonly dependencies: readonly Key[],
    public readonly build: IBuildInstruction,
    public readonly surrogates: readonly ITargetedInstruction[],
    public readonly bindables: Record<string, IBindableDescription>,
    public readonly childrenObservers: Record<string, IChildrenObserverDescription>,
    public readonly containerless: boolean,
    public readonly isStrictBinding: boolean,
    public readonly shadowOptions: { mode: 'open' | 'closed' } | null,
    public readonly hasSlots: boolean,
    public readonly strategy: BindingStrategy,
    public readonly hooks: Readonly<HooksDefinition>,
    public readonly scopeParts: string[],
  ) {}

  public static create<T extends Constructable = Constructable>(
    name: string,
    Type: CustomElementType<T>,
  ): CustomElementDefinition<T>;
  public static create<T extends Constructable = Constructable>(
    def: CustomElementDef,
    Type?: null,
  ): CustomElementDefinition<T>;
  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | CustomElementDef,
    Type?: CustomElementType<T> | null,
  ): CustomElementDefinition<T>;
  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | CustomElementDef,
    Type: CustomElementType<T> | null = null,
  ): CustomElementDefinition<T> {

    let name: string;
    let def: CustomElementDef;
    if (typeof nameOrDef === 'string') {
      name = nameOrDef;
      def = { name };
    } else {
      name = nameOrDef.name;
      def = nameOrDef;
    }

    if (Type === null) {
      Type = class HTMLOnlyElement { /* HTML Only */ } as CustomElementType<T>;
    }

    return new CustomElementDefinition(
      Type,
      firstDefined(CustomElement.getAnnotation(Type, 'name'), name),
      mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
      CustomElement.keyFrom(name),
      firstDefined(CustomElement.getAnnotation(Type, 'cache'), def.cache, Type.cache, 0),
      firstDefined(CustomElement.getAnnotation(Type, 'template'), def.template, Type.template, null),
      mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), def.instructions, Type.instructions),
      mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), def.dependencies, Type.dependencies),
      firstDefined(CustomElement.getAnnotation(Type, 'build'), def.build, Type.build, { compiler: 'default', required: true }),
      mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), def.surrogates, Type.surrogates),
      Bindable.from(...Bindable.getAll(Type), CustomElement.getAnnotation(Type, 'bindables'), Type.bindables, def.bindables),
      mergeObjects(CustomElement.getAnnotation(Type, 'childrenObservers'), def.childrenObservers, Type.childrenObservers),
      firstDefined(CustomElement.getAnnotation(Type, 'containerless'), def.containerless, Type.containerless, false),
      firstDefined(CustomElement.getAnnotation(Type, 'isStrictBinding'), def.isStrictBinding, Type.isStrictBinding, false),
      firstDefined(CustomElement.getAnnotation(Type, 'shadowOptions'), def.shadowOptions, Type.shadowOptions, null),
      firstDefined(CustomElement.getAnnotation(Type, 'hasSlots'), def.hasSlots, Type.hasSlots, false),
      firstDefined(CustomElement.getAnnotation(Type, 'strategy'), def.strategy, Type.strategy, BindingStrategy.getterSetter),
      firstDefined(CustomElement.getAnnotation(Type, 'hooks'), def.hooks, Type.hooks, new HooksDefinition(Type.prototype)),
      mergeArrays(CustomElement.getAnnotation(Type, 'scopeParts'), def.scopeParts, Type.scopeParts),
    );
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.singleton(key, Type).register(container);
    Registration.alias(key, Type).register(container);
    registerAliases(aliases, CustomElement, key, container);
  }
}

export const CustomElement: CustomElementKind = {
  name: Protocol.resource.keyFor('custom-element'),
  keyFrom(name: string): string {
    return `${CustomElement.name}:${name}`;
  },
  define<T extends Constructable>(nameOrDefinition: string | CustomElementDef, Type: T): CustomElementType<T> {
    const $Type = Type as CustomElementType<T>;
    const description = CustomElementDefinition.create(nameOrDefinition, $Type);
    Metadata.define(CustomElement.name, description, Type);
    Protocol.resource.appendTo(Type, CustomElement.name);

    return $Type;
  },
  getDefinition<T extends Constructable>(Type: T): CustomElementDefinition<T> {
    const def = Metadata.getOwn(CustomElement.name, Type);
    if (def === void 0) {
      throw new Error(`No definition found for type ${Type.name}`);
    }

    return def;
  },
  annotate<K extends keyof CustomElementDef>(Type: Constructable, prop: K, value: CustomElementDef[K]): void {
    Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
  },
  getAnnotation<K extends keyof CustomElementDef>(Type: Constructable, prop: K): CustomElementDef[K] {
    return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
  },
};

export type CustomElementHost<T extends INode = INode> = IRenderLocation<T> & T & {
  $controller?: IController<T>;
};

export interface IElementProjector<T extends INode = INode> {
  readonly host: CustomElementHost<T>;
  readonly children: ArrayLike<CustomElementHost<T>>;

  provideEncapsulationSource(): T;
  project(nodes: INodeSequence<T>): void;
  take(nodes: INodeSequence<T>): void;

  subscribeToChildrenChange(callback: () => void, options?: any): void;
}

export const IProjectorLocator = DI.createInterface<IProjectorLocator>('IProjectorLocator').noDefault();

export interface IProjectorLocator<T extends INode = INode> {
  getElementProjector(dom: IDOM<T>, $component: IController<T>, host: CustomElementHost<T>, def: CustomElementDefinition): IElementProjector<T>;
}
