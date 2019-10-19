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
  mergeArrays,
  firstDefined,
} from '@aurelia/kernel';
import {
  HooksDefinition,
  registerAliases,
} from '../definitions';
import {
  BindingMode,
  BindingStrategy,
} from '../flags';
import {
  IViewModel,
} from '../lifecycle';
import { Bindable, BindableDefinition, PartialBindableDefinition } from '../templating/bindable';

export type PartialCustomAttributeDefinition = PartialResourceDefinition<{
  readonly defaultBindingMode?: BindingMode;
  readonly isTemplateController?: boolean;
  readonly bindables?: Record<string, PartialBindableDefinition> | readonly string[];
  readonly strategy?: BindingStrategy;
  readonly hooks?: HooksDefinition;
}>;

export type CustomAttributeType<T extends Constructable = Constructable> = ResourceType<T, IViewModel, PartialCustomAttributeDefinition>;
export type CustomAttributeKind = IResourceKind<CustomAttributeType, CustomAttributeDefinition> & {
  isType<T>(value: T): value is (T extends Constructable ? CustomAttributeType<T> : never);
  define<T extends Constructable>(name: string, Type: T): CustomAttributeType<T>;
  define<T extends Constructable>(def: PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
  getDefinition<T extends Constructable>(Type: T): CustomAttributeDefinition<T>;
  annotate<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K, value: PartialCustomAttributeDefinition[K]): void;
  getAnnotation<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K): PartialCustomAttributeDefinition[K];
};

export type CustomAttributeDecorator = <T extends Constructable>(Type: T) => CustomAttributeType<T>;

/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export function customAttribute(definition: PartialCustomAttributeDefinition): CustomAttributeDecorator;
export function customAttribute(name: string): CustomAttributeDecorator;
export function customAttribute(nameOrDef: string | PartialCustomAttributeDefinition): CustomAttributeDecorator;
export function customAttribute(nameOrDef: string | PartialCustomAttributeDefinition): CustomAttributeDecorator {
  return function (target) {
    return CustomAttribute.define(nameOrDef, target);
  };
}

/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export function templateController(definition: Omit<PartialCustomAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator;
export function templateController(name: string): CustomAttributeDecorator;
export function templateController(nameOrDef: string | Omit<PartialCustomAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator;
export function templateController(nameOrDef: string | Omit<PartialCustomAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator {
  return function (target) {
    return CustomAttribute.define(
      typeof nameOrDef === 'string'
        ? { isTemplateController: true, name: nameOrDef }
        : { isTemplateController: true, ...nameOrDef },
      target
    );
  };
}

export class CustomAttributeDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, IViewModel, PartialCustomAttributeDefinition> {
  private constructor(
    public readonly Type: CustomAttributeType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string,
    public readonly defaultBindingMode: BindingMode,
    public readonly isTemplateController: boolean,
    public readonly bindables: Record<string, BindableDefinition>,
    public readonly strategy: BindingStrategy,
    public readonly hooks: HooksDefinition,
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialCustomAttributeDefinition,
    Type: CustomAttributeType<T>,
  ): CustomAttributeDefinition<T> {

    let name: string;
    let def: PartialCustomAttributeDefinition;
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
    Registration.transient(key, Type).register(container);
    Registration.alias(key, Type).register(container);
    registerAliases(aliases, CustomAttribute, key, container);
  }
}

export const CustomAttribute: CustomAttributeKind = {
  name: Protocol.resource.keyFor('custom-attribute'),
  keyFrom(name: string): string {
    return `${CustomAttribute.name}:${name}`;
  },
  isType<T>(value: T): value is (T extends Constructable ? CustomAttributeType<T> : never) {
    return typeof value === 'function' && Metadata.hasOwn(CustomAttribute.name, value);
  },
  define<T extends Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T> {
    const definition = CustomAttributeDefinition.create(nameOrDef, Type as Constructable);
    Metadata.define(CustomAttribute.name, definition, definition.Type);
    Metadata.define(CustomAttribute.name, definition, definition);
    Protocol.resource.appendTo(Type, CustomAttribute.name);

    return definition.Type as CustomAttributeType<T>;
  },
  getDefinition<T extends Constructable>(Type: T): CustomAttributeDefinition<T> {
    const def = Metadata.getOwn(CustomAttribute.name, Type) as CustomAttributeDefinition<T>;
    if (def === void 0) {
      throw new Error(`No definition found for type ${Type.name}`);
    }

    return def;
  },
  annotate<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K, value: PartialCustomAttributeDefinition[K]): void {
    Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
  },
  getAnnotation<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K): PartialCustomAttributeDefinition[K] {
    return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
  },
};
