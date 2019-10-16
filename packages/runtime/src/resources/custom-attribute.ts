/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Constructable,
  IContainer,
  IResourceKind,
  Omit,
  Registration,
  Protocol,
  Metadata,
  ResourceDefinition,
  PartialResourceDefinition,
  ResourceType,
} from '@aurelia/kernel';
import {
  HooksDefinition,
  registerAliases,
  IBindableDescription,
  mergeArrays,
  firstDefined
} from '../definitions';
import {
  BindingMode,
  BindingStrategy,
} from '../flags';
import {
  IViewModel,
} from '../lifecycle';
import { Bindable } from '../templating/bindable';

type CustomAttributeDef = PartialResourceDefinition<{
  readonly defaultBindingMode?: BindingMode;
  readonly isTemplateController?: boolean;
  readonly bindables?: Record<string, IBindableDescription>;
  readonly strategy?: BindingStrategy;
  readonly hooks?: HooksDefinition;
}>;

export type CustomAttributeType<T extends Constructable = Constructable> = ResourceType<T, IViewModel, CustomAttributeDef>;
export type CustomAttributeKind = IResourceKind<CustomAttributeType, CustomAttributeDefinition> & {
  define<T extends Constructable>(name: string, Type: T): CustomAttributeType<T>;
  define<T extends Constructable>(def: CustomAttributeDef, Type: T): CustomAttributeType<T>;
  define<T extends Constructable>(nameOrDef: string | CustomAttributeDef, Type: T): CustomAttributeType<T>;
  annotate<K extends keyof CustomAttributeDef>(Type: Constructable, prop: K, value: CustomAttributeDef[K]): void;
  getAnnotation<K extends keyof CustomAttributeDef>(Type: Constructable, prop: K): CustomAttributeDef[K];
};

export type CustomAttributeDecorator = <T extends Constructable>(Type: T) => CustomAttributeType<T>;

/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export function customAttribute(definition: CustomAttributeDef): CustomAttributeDecorator;
export function customAttribute(name: string): CustomAttributeDecorator;
export function customAttribute(nameOrDefinition: string | CustomAttributeDef): CustomAttributeDecorator;
export function customAttribute(nameOrDefinition: string | CustomAttributeDef): CustomAttributeDecorator {
  return function (target) {
    return CustomAttribute.define(nameOrDefinition, target);
  };
}

/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export function templateController(definition: Omit<CustomAttributeDef, 'isTemplateController'>): CustomAttributeDecorator;
export function templateController(name: string): CustomAttributeDecorator;
export function templateController(nameOrDefinition: string | Omit<CustomAttributeDef, 'isTemplateController'>): CustomAttributeDecorator;
export function templateController(nameOrDefinition: string | Omit<CustomAttributeDef, 'isTemplateController'>): CustomAttributeDecorator {
  return function (target) {
    return CustomAttribute.define(
      typeof nameOrDefinition === 'string'
        ? { isTemplateController: true, name: nameOrDefinition }
        : { isTemplateController: true, ...nameOrDefinition },
      target
    );
  };
}

export class CustomAttributeDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, IViewModel, CustomAttributeDef> {
  private constructor(
    public readonly Type: CustomAttributeType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string,
    public readonly defaultBindingMode: BindingMode,
    public readonly isTemplateController: boolean,
    public readonly bindables: Record<string, IBindableDescription>,
    public readonly strategy: BindingStrategy,
    public readonly hooks: HooksDefinition,
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | CustomAttributeDef,
    Type: CustomAttributeType<T>,
  ): CustomAttributeDefinition<T> {

    let name: string;
    let def: CustomAttributeDef;
    if (typeof nameOrDef === 'string') {
      name = nameOrDef;
      def = { name };
    } else {
      name = nameOrDef.name;
      def = nameOrDef;
    }

    return new CustomAttributeDefinition(
      Type,
      firstDefined(CustomAttribute.getAnnotation(Type, 'name'), name),
      mergeArrays(CustomAttribute.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
      CustomAttribute.keyFrom(name),
      firstDefined(CustomAttribute.getAnnotation(Type, 'defaultBindingMode'), def.defaultBindingMode, Type.defaultBindingMode, BindingMode.toView),
      firstDefined(CustomAttribute.getAnnotation(Type, 'isTemplateController'), def.isTemplateController, Type.isTemplateController, false),
      Bindable.from(...Bindable.getAll(Type), CustomAttribute.getAnnotation(Type, 'bindables'), Type.bindables, def.bindables),
      firstDefined(CustomAttribute.getAnnotation(Type, 'strategy'), def.strategy, Type.strategy, BindingStrategy.getterSetter),
      firstDefined(CustomAttribute.getAnnotation(Type, 'hooks'), def.hooks, Type.hooks, new HooksDefinition(Type.prototype)),
    );
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.singleton(key, Type).register(container);
    Registration.alias(key, Type).register(container);
    registerAliases(aliases, CustomAttribute, key, container);
  }
}

export const CustomAttribute: CustomAttributeKind = {
  name: Protocol.resource.keyFor('custom-attribute'),
  keyFrom(name: string): string {
    return `${CustomAttribute.name}:${name}`;
  },
  define<T extends Constructable>(nameOrDefinition: string | CustomAttributeDef, Type: T): CustomAttributeType<T> {
    const $Type = Type as CustomAttributeType<T>;
    const description = CustomAttributeDefinition.create(nameOrDefinition, $Type);
    Metadata.define(CustomAttribute.name, description, Type);
    Protocol.resource.appendTo(Type, CustomAttribute.name);

    return $Type;
  },
  annotate<K extends keyof CustomAttributeDef>(Type: Constructable, prop: K, value: CustomAttributeDef[K]): void {
    Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
  },
  getAnnotation<K extends keyof CustomAttributeDef>(Type: Constructable, prop: K): CustomAttributeDef[K] {
    return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
  },
};
