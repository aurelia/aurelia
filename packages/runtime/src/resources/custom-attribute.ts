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
  IBindableDescription
} from '../definitions';
import {
  BindingMode,
  ensureValidStrategy,
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
      target);
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
    nameOrDef: string | PartialResourceDefinition<CustomAttributeDef>,
    Type: CustomAttributeType<T>,
  ): CustomAttributeDefinition<T> {
    let name: string;
    let aliases: string[];
    let defaultBindingMode: BindingMode;
    let isTemplateController: boolean;
    let bindables: Record<string, IBindableDescription>;
    let strategy: BindingStrategy;
    let hooks: HooksDefinition;

    if (typeof nameOrDef === 'string') {
      name = nameOrDef;
      aliases = [];
      defaultBindingMode = BindingMode.toView;
      isTemplateController = false;
      bindables = { ...Bindable.for(Type).get() };
      strategy = BindingStrategy.getterSetter;
      hooks = new HooksDefinition(Type.prototype);
    } else {
      name = nameOrDef.name;
      aliases = nameOrDef.aliases === void 0 ? [] : nameOrDef.aliases.slice();
      defaultBindingMode = nameOrDef.defaultBindingMode === void 0 ? BindingMode.toView : nameOrDef.defaultBindingMode;
      isTemplateController = nameOrDef.isTemplateController === true;
      bindables = { ...Bindable.for(Type).get(), ...Bindable.for(nameOrDef).get() };
      strategy = ensureValidStrategy(nameOrDef.strategy);
      hooks = new HooksDefinition(Type.prototype);
    }

    if (Type.aliases !== void 0) {
      aliases.push(...Type.aliases);
    }

    return new CustomAttributeDefinition(
      Type,
      name,
      aliases,
      CustomAttribute.keyFrom(name),
      defaultBindingMode,
      isTemplateController,
      bindables,
      strategy,
      hooks,
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
  define<T extends Constructable>(nameOrDefinition: string | PartialResourceDefinition<CustomAttributeDef>, Type: T): CustomAttributeType<T> {
    const $Type = Type as CustomAttributeType<T>;
    const description = CustomAttributeDefinition.create(nameOrDefinition, $Type);
    Metadata.define(CustomAttribute.name, description, Type);
    Protocol.resource.appendTo(Type, CustomAttribute.name);

    return $Type;
  },
};
