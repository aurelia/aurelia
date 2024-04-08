import { mergeArrays, firstDefined, Key, resourceBaseName, getResourceKeyFor } from '@aurelia/kernel';
import { Bindable } from '../bindable';
import { Watch } from '../watch';
import { INode, getEffectiveParentNode, getRef } from '../dom';
import { defineMetadata, getAnnotationKeyFor, getOwnMetadata, hasOwnMetadata } from '../utilities-metadata';
import { isFunction, isString, objectFreeze } from '../utilities';
import { aliasRegistration, singletonRegistration } from '../utilities-di';
import { type BindingMode, toView } from '../binding/interfaces-bindings';

import type {
  Constructable,
  IContainer,
  ResourceDefinition,
  PartialResourceDefinition,
  ResourceType,
  StaticResourceType,
} from '@aurelia/kernel';
import type { BindableDefinition, PartialBindableDefinition } from '../bindable';
import type { ICustomAttributeViewModel, ICustomAttributeController, Controller } from '../templating/controller';
import type { IWatchDefinition } from '../watch';
import { ErrorNames, createMappedError } from '../errors';
import { dtAttribute, type IResourceKind } from './resources-shared';

export type PartialCustomAttributeDefinition<TBindables extends string = string> = PartialResourceDefinition<{
  readonly defaultBindingMode?: BindingMode;
  readonly isTemplateController?: boolean;
  readonly bindables?: (Record<TBindables, true | Exclude<PartialBindableDefinition, 'name'>>) | (TBindables | PartialBindableDefinition & { name: TBindables })[];
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
  readonly dependencies?: readonly Key[];
  /**
   * **Only used by template controller custom attributes.**
   *
   * Container strategy for the view factory of this template controller.
   *
   * By default, the view factory will be reusing the container of the parent view (controller),
   * as this container has information about the resources registered.
   *
   * Specify `'new'` to create a new container for the view factory.
   */
  readonly containerStrategy?: 'reuse' | 'new';
}>;

export type CustomAttributeStaticAuDefinition<TBindables extends string = string> = PartialCustomAttributeDefinition<TBindables> & {
  type: 'custom-attribute';
};

export type CustomAttributeType<T extends Constructable = Constructable> = ResourceType<T, ICustomAttributeViewModel, PartialCustomAttributeDefinition>;
export type CustomAttributeKind = IResourceKind & {
  for<C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(node: Node, name: string): ICustomAttributeController<C> | undefined;
  closest<A extends object | Constructable, TType extends A extends Constructable<infer T extends object> ? Constructable<T> : Constructable<A> = A extends Constructable<infer T extends object> ? Constructable<T> : Constructable<A>>(node: Node, Type: CustomAttributeType<TType>): ICustomAttributeController<InstanceType<TType>> | null;
  closest<A extends object | Constructable, TType extends A extends Constructable<infer T extends object> ? Constructable<T> : Constructable<A> = A extends Constructable<infer T extends object> ? Constructable<T> : Constructable<A>>(node: Node, name: string): ICustomAttributeController<InstanceType<TType>> | null;
  isType<T>(value: T): value is (T extends Constructable ? CustomAttributeType<T> : never);
  define<T extends Constructable>(name: string, Type: T): CustomAttributeType<T>;
  define<T extends Constructable>(def: PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
  getDefinition<T extends Constructable>(Type: T): CustomAttributeDefinition<T>;
  // eslint-disable-next-line
  getDefinition<T extends Constructable>(Type: Function): CustomAttributeDefinition<T>;
  annotate<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K, value: PartialCustomAttributeDefinition[K]): void;
  getAnnotation<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K): PartialCustomAttributeDefinition[K];
  find(c: IContainer, name: string): CustomAttributeDefinition | null;
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
    return defineAttribute(nameOrDef, target);
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
    return defineAttribute(
      isString(nameOrDef)
        ? { isTemplateController: true, name: nameOrDef }
        : { isTemplateController: true, ...nameOrDef },
      target
    );
  };
}

export class CustomAttributeDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, ICustomAttributeViewModel, PartialCustomAttributeDefinition> {
  // a simple marker to distinguish between Custom Element definition & Custom attribute definition
  public get kind(): 'attribute' { return dtAttribute; }

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
    public readonly dependencies: Key[],
    public readonly containerStrategy: 'reuse' | 'new',
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
      getAttributeKeyFrom(name),
      firstDefined(getAttributeAnnotation(Type, 'defaultBindingMode'), def.defaultBindingMode, Type.defaultBindingMode, toView),
      firstDefined(getAttributeAnnotation(Type, 'isTemplateController'), def.isTemplateController, Type.isTemplateController, false),
      Bindable.from(Type, ...Bindable.getAll(Type), getAttributeAnnotation(Type, 'bindables'), Type.bindables, def.bindables),
      firstDefined(getAttributeAnnotation(Type, 'noMultiBindings'), def.noMultiBindings, Type.noMultiBindings, false),
      mergeArrays(Watch.getDefinitions(Type), Type.watches),
      mergeArrays(getAttributeAnnotation(Type, 'dependencies'), def.dependencies, Type.dependencies),
      firstDefined(getAttributeAnnotation(Type, 'containerStrategy'), def.containerStrategy, Type.containerStrategy, 'reuse'),
    );
  }

  public register(container: IContainer, aliasName?: string | undefined): void {
    const $Type = this.Type;
    const key = typeof aliasName === 'string' ? getAttributeKeyFrom(aliasName) : this.key;
    const aliases = this.aliases;

    if (!container.has(key, false)) {
      container.register(
        container.has($Type, false) ? null : singletonRegistration($Type, $Type),
        aliasRegistration($Type, key),
        ...aliases.map(alias => aliasRegistration($Type, getAttributeKeyFrom(alias)))
      );
    } /* istanbul ignore next */ else if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[DEV:aurelia] ${createMappedError(ErrorNames.attribute_existed, this.name)}`);
    }
  }

  public toString() {
    return `au:ca:${this.name}`;
  }
}

const attrTypeName = 'custom-attribute';
const attributeBaseName = /*@__PURE__*/getResourceKeyFor(attrTypeName);
const getAttributeKeyFrom = (name: string): string => `${attributeBaseName}:${name}`;

const getAttributeAnnotation = <K extends keyof PartialCustomAttributeDefinition>(
  Type: Constructable,
  prop: K,
): PartialCustomAttributeDefinition[K] =>getOwnMetadata(getAnnotationKeyFor(prop), Type);

/** @internal */
export const isAttributeType = <T>(value: T): value is (T extends Constructable ? CustomAttributeType<T> : never) => {
  return isFunction(value) && (
    hasOwnMetadata(attributeBaseName, value)
    || (value as StaticResourceType).$au?.type === attrTypeName
  );
};

/** @internal */
export const findAttributeControllerFor = <C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(node: Node, name: string): ICustomAttributeController<C> | undefined => {
  return (getRef(node, getAttributeKeyFrom(name)) ?? void 0) as ICustomAttributeController<C> | undefined;
};

/** @internal */
export const defineAttribute = <T extends Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T> => {
  const definition = CustomAttributeDefinition.create(nameOrDef, Type as Constructable);
  const $Type = definition.Type as CustomAttributeType<T>;

  defineMetadata(attributeBaseName, definition, $Type);
  // a requirement for the resource system in kernel
  defineMetadata(resourceBaseName, definition, $Type);

  return $Type;
};

/** @internal */
// eslint-disable-next-line @typescript-eslint/ban-types
export const getAttributeDefinition = <T extends Constructable>(Type: T | Function): CustomAttributeDefinition<T> => {
  const def: CustomAttributeDefinition<T> = getOwnMetadata(attributeBaseName, Type) ?? getDefinitionFromStaticAu(Type);
  if (def === void 0) {
    throw createMappedError(ErrorNames.attribute_def_not_found, Type);
  }

  return def;
};

const staticResourceDefinitionMetadataKey = 'static:resource-definition:metadata';

// eslint-disable-next-line @typescript-eslint/ban-types
const getDefinitionFromStaticAu = <C extends Constructable>(Type: C | Function): CustomAttributeDefinition<C> => {
  let def = getOwnMetadata(staticResourceDefinitionMetadataKey, Type) as CustomAttributeDefinition<C>;
  if (def == null) {
    if ((Type as StaticResourceType).$au?.type === 'custom-attribute') {
      def = CustomAttributeDefinition.create((Type as StaticResourceType).$au as PartialCustomAttributeDefinition, Type as CustomAttributeType<C>);
      defineMetadata(staticResourceDefinitionMetadataKey, def, Type);
    }
  }
  return def;
};

const findClosestControllerByName = (node: Node, attrNameOrType: string | CustomAttributeType): ICustomAttributeController | null => {
  let key = '';
  let attrName = '';
  if (isString(attrNameOrType)) {
    key = getAttributeKeyFrom(attrNameOrType);
    attrName = attrNameOrType;
  } else {
    const definition = getAttributeDefinition(attrNameOrType);
    key = definition.key;
    attrName = definition.name;
  }
  let cur = node as INode | null;
  while (cur !== null) {
    const controller = getRef(cur, key) as Controller | null;
    if (controller?.is(attrName)) {
      return controller as ICustomAttributeController;
    }

    cur = getEffectiveParentNode(cur);
  }

  return null;
};

export const CustomAttribute = objectFreeze<CustomAttributeKind>({
  name: attributeBaseName,
  keyFrom: getAttributeKeyFrom,
  isType: isAttributeType,
  for: findAttributeControllerFor,
  closest: findClosestControllerByName,
  define: defineAttribute,
  getDefinition: getAttributeDefinition,
  annotate<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K, value: PartialCustomAttributeDefinition[K]): void {
    defineMetadata(getAnnotationKeyFor(prop), value, Type);
  },
  getAnnotation: getAttributeAnnotation,
  find(c, name) {
    const Type = c.find(attrTypeName, name);
    return Type === null ? null : getOwnMetadata(attributeBaseName, Type) ?? getDefinitionFromStaticAu(Type) ?? null;
  },
});
