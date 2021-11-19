import { Registration, mergeArrays, firstDefined } from '@aurelia/kernel';
import { BindingMode, registerAliases } from '@aurelia/runtime';
import { Bindable } from '../bindable.js';
import { Watch } from '../watch.js';
import { getRef } from '../dom.js';
import { DefinitionType } from './resources-shared.js';
import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata, getResourceKeyFor, hasOwnMetadata } from '../shared.js';
import { isFunction, isString } from '../utilities.js';

import type {
  Constructable,
  IContainer,
  IResourceKind,
  ResourceDefinition,
  PartialResourceDefinition,
  ResourceType,
} from '@aurelia/kernel';
import type { BindableDefinition, PartialBindableDefinition } from '../bindable.js';
import type { ICustomAttributeViewModel, ICustomAttributeController } from '../templating/controller.js';
import type { IWatchDefinition } from '../watch.js';

declare module '@aurelia/kernel' {
  interface IContainer {
    find<T extends ICustomAttributeViewModel>(kind: typeof CustomAttribute, name: string): CustomAttributeDefinition<Constructable<T>> | null;
  }
}

export type PartialCustomAttributeDefinition = PartialResourceDefinition<{
  readonly defaultBindingMode?: BindingMode;
  readonly isTemplateController?: boolean;
  readonly bindables?: Record<string, PartialBindableDefinition> | readonly string[];
  /**
   * A config that can be used by template compliler to change attr value parsing mode
   * `true` to always parse as a single value, mostly will be string in URL scenario
   * Example:
   * ```html
   * <div goto="http://bla.bla.com">
   * ```
   * With `noMultiBinding: true`, user does not need to escape the `:` with `\`
   * or use binding command to escape it.
   *
   * With `noMultiBinding: false (default)`, the above will be parsed as it's binding
   * to a property name `http`, with value equal to literal string `//bla.bla.com`
   */
  readonly noMultiBindings?: boolean;
  readonly watches?: IWatchDefinition[];
}>;

export type CustomAttributeType<T extends Constructable = Constructable> = ResourceType<T, ICustomAttributeViewModel, PartialCustomAttributeDefinition>;
export type CustomAttributeKind = IResourceKind<CustomAttributeType, CustomAttributeDefinition> & {
  for<C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(node: Node, name: string): ICustomAttributeController<C> | undefined;
  isType<T>(value: T): value is (T extends Constructable ? CustomAttributeType<T> : never);
  define<T extends Constructable>(name: string, Type: T): CustomAttributeType<T>;
  define<T extends Constructable>(def: PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
  getDefinition<T extends Constructable>(Type: T): CustomAttributeDefinition<T>;
  // eslint-disable-next-line
  getDefinition<T extends Constructable>(Type: Function): CustomAttributeDefinition<T>;
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
      isString(nameOrDef)
        ? { isTemplateController: true, name: nameOrDef }
        : { isTemplateController: true, ...nameOrDef },
      target
    );
  };
}

export class CustomAttributeDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, ICustomAttributeViewModel, PartialCustomAttributeDefinition> {
  // a simple marker to distinguish between Custom Element definition & Custom attribute definition
  public get type(): DefinitionType.Attribute { return DefinitionType.Attribute; }

  private constructor(
    public readonly Type: CustomAttributeType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string,
    public readonly defaultBindingMode: BindingMode,
    public readonly isTemplateController: boolean,
    public readonly bindables: Record<string, BindableDefinition>,
    public readonly noMultiBindings: boolean,
    public readonly watches: IWatchDefinition[],
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialCustomAttributeDefinition,
    Type: CustomAttributeType<T>,
  ): CustomAttributeDefinition<T> {
    let name: string;
    let def: PartialCustomAttributeDefinition;
    if (isString(nameOrDef)) {
      name = nameOrDef;
      def = { name };
    } else {
      name = nameOrDef.name;
      def = nameOrDef;
    }

    return new CustomAttributeDefinition(
      Type,
      firstDefined(getAttributeAnnotation(Type, 'name'), name),
      mergeArrays(getAttributeAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
      CustomAttribute.keyFrom(name),
      firstDefined(getAttributeAnnotation(Type, 'defaultBindingMode'), def.defaultBindingMode, Type.defaultBindingMode, BindingMode.toView),
      firstDefined(getAttributeAnnotation(Type, 'isTemplateController'), def.isTemplateController, Type.isTemplateController, false),
      Bindable.from(Type, ...Bindable.getAll(Type), getAttributeAnnotation(Type, 'bindables'), Type.bindables, def.bindables),
      firstDefined(getAttributeAnnotation(Type, 'noMultiBindings'), def.noMultiBindings, Type.noMultiBindings, false),
      mergeArrays(Watch.getAnnotation(Type), Type.watches),
    );
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.transient(key, Type).register(container);
    Registration.aliasTo(key, Type).register(container);
    registerAliases(aliases, CustomAttribute, key, container);
  }
}

const caBaseName = getResourceKeyFor('custom-attribute');
const getAttributeKeyFrom = (name: string): string => `${caBaseName}:${name}`;
const getAttributeAnnotation = <K extends keyof PartialCustomAttributeDefinition>(
  Type: Constructable,
  prop: K,
): PartialCustomAttributeDefinition[K] =>getOwnMetadata(getAnnotationKeyFor(prop), Type);

export const CustomAttribute = Object.freeze<CustomAttributeKind>({
  name: caBaseName,
  keyFrom: getAttributeKeyFrom,
  isType<T>(value: T): value is (T extends Constructable ? CustomAttributeType<T> : never) {
    return isFunction(value) && hasOwnMetadata(caBaseName, value);
  },
  for<C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(node: Node, name: string): ICustomAttributeController<C> | undefined {
    return (getRef(node, getAttributeKeyFrom(name)) ?? void 0) as ICustomAttributeController<C> | undefined;
  },
  define<T extends Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T> {
    const definition = CustomAttributeDefinition.create(nameOrDef, Type as Constructable);
    defineMetadata(caBaseName, definition, definition.Type);
    defineMetadata(caBaseName, definition, definition);
    appendResourceKey(Type, caBaseName);

    return definition.Type as CustomAttributeType<T>;
  },
  getDefinition<T extends Constructable>(Type: T): CustomAttributeDefinition<T> {
    const def = getOwnMetadata(caBaseName, Type) as CustomAttributeDefinition<T>;
    if (def === void 0) {
      if (__DEV__)
        throw new Error(`No definition found for type ${Type.name}`);
      else
        throw new Error(`AUR0759:${Type.name}`);
    }

    return def;
  },
  annotate<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K, value: PartialCustomAttributeDefinition[K]): void {
    defineMetadata(getAnnotationKeyFor(prop), value, Type);
  },
  getAnnotation: getAttributeAnnotation,
});
