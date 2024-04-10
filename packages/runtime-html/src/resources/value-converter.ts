import {
  mergeArrays,
  firstDefined,
  resourceBaseName,
  getResourceKeyFor,
  resource,
} from '@aurelia/kernel';
import { aliasRegistration, singletonRegistration } from '../utilities-di';
import { isFunction, isString, objectFreeze } from '../utilities';
import { defineMetadata, getAnnotationKeyFor, getOwnMetadata, hasOwnMetadata } from '../utilities-metadata';

import type {
  Constructable,
  IContainer,
  ResourceDefinition,
  ResourceType,
  PartialResourceDefinition,
  IServiceLocator,
  StaticResourceType,
} from '@aurelia/kernel';
import { ValueConverterInstance } from '@aurelia/runtime';
import { ErrorNames, createMappedError } from '../errors';
import { staticResourceDefinitionMetadataKey, type IResourceKind } from './resources-shared';

export type PartialValueConverterDefinition = PartialResourceDefinition;
export type ValueConverterStaticAuDefinition = PartialValueConverterDefinition & {
  type: 'value-converter';
};

export type ValueConverterType<T extends Constructable = Constructable> = ResourceType<T, ValueConverterInstance>;
export type ValueConverterKind = IResourceKind & {
  isType<T>(value: T): value is (T extends Constructable ? ValueConverterType<T> : never);
  define<T extends Constructable>(name: string, Type: T): ValueConverterType<T>;
  define<T extends Constructable>(def: PartialValueConverterDefinition, Type: T): ValueConverterType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialValueConverterDefinition, Type: T): ValueConverterType<T>;
  getDefinition<T extends Constructable>(Type: T): ValueConverterDefinition<T>;
  annotate<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K, value: PartialValueConverterDefinition[K]): void;
  getAnnotation<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K): PartialValueConverterDefinition[K];
  find(container: IContainer, name: string): ValueConverterDefinition | null;
  get(container: IServiceLocator, name: string): ValueConverterInstance;
};

export type ValueConverterDecorator = <T extends Constructable>(Type: T) => ValueConverterType<T>;

export function valueConverter(definition: PartialValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(name: string): ValueConverterDecorator;
export function valueConverter(nameOrDef: string | PartialValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(nameOrDef: string | PartialValueConverterDefinition): ValueConverterDecorator {
  return function (target) {
    return ValueConverter.define(nameOrDef, target);
  };
}

export class ValueConverterDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, ValueConverterInstance> {
  private constructor(
    public readonly Type: ValueConverterType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string,
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialValueConverterDefinition,
    Type: ValueConverterType<T>,
  ): ValueConverterDefinition<T> {

    let name: string;
    let def: PartialValueConverterDefinition;
    if (isString(nameOrDef)) {
      name = nameOrDef;
      def = { name };
    } else {
      name = nameOrDef.name;
      def = nameOrDef;
    }

    return new ValueConverterDefinition(
      Type,
      firstDefined(getConverterAnnotation(Type, 'name'), name),
      mergeArrays(getConverterAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
      ValueConverter.keyFrom(name),
    );
  }

  public register(container: IContainer, aliasName?: string): void {
    const $Type = this.Type;
    const key = typeof aliasName === 'string' ? getValueConverterKeyFrom(aliasName) : this.key;
    const aliases = this.aliases;

    if (!container.has(key, false)) {
      container.register(
        container.has($Type, false) ? null : singletonRegistration($Type, $Type),
        aliasRegistration($Type, key),
        ...aliases.map(alias => aliasRegistration($Type, getValueConverterKeyFrom(alias)))
      );
    } /* istanbul ignore next */ else if(__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[DEV:aurelia] ${createMappedError(ErrorNames.value_converter_existed, this.name)}`);
    }
  }
}

/** @internal */ export const converterTypeName = 'value-converter';
const vcBaseName = /*@__PURE__*/getResourceKeyFor(converterTypeName);
const getConverterAnnotation = <K extends keyof PartialValueConverterDefinition>(
  Type: Constructable,
  prop: K,
): PartialValueConverterDefinition[K] => getOwnMetadata(getAnnotationKeyFor(prop), Type);

const getValueConverterKeyFrom = (name: string): string => `${vcBaseName}:${name}`;

// eslint-disable-next-line @typescript-eslint/ban-types
const getDefinitionFromStaticAu = <C extends Constructable>(Type: C | Function): ValueConverterDefinition<C> => {
  let def = getOwnMetadata(staticResourceDefinitionMetadataKey, Type) as ValueConverterDefinition<C>;
  if (def == null) {
    if ((Type as StaticResourceType).$au?.type === converterTypeName) {
      def = ValueConverterDefinition.create((Type as StaticResourceType).$au as PartialValueConverterDefinition, Type as ValueConverterType<C>);
      defineMetadata(staticResourceDefinitionMetadataKey, def, Type);
    }
  }
  return def;
};

export const ValueConverter = objectFreeze<ValueConverterKind>({
  name: vcBaseName,
  keyFrom: getValueConverterKeyFrom,
  isType<T>(value: T): value is (T extends Constructable ? ValueConverterType<T> : never) {
    return isFunction(value)
      && (hasOwnMetadata(vcBaseName, value) || (value as StaticResourceType).$au?.type === converterTypeName);
  },
  define<T extends Constructable<ValueConverterInstance>>(nameOrDef: string | PartialValueConverterDefinition, Type: T): ValueConverterType<T> {
    const definition = ValueConverterDefinition.create(nameOrDef, Type as Constructable<ValueConverterInstance>);
    const $Type = definition.Type as ValueConverterType<T>;

    defineMetadata(vcBaseName, definition, $Type);
  // a requirement for the resource system in kernel
    defineMetadata(resourceBaseName, definition, $Type);

    return $Type;
  },
  getDefinition<T extends Constructable>(Type: T): ValueConverterDefinition<T> {
    const def = getOwnMetadata(vcBaseName, Type) ?? getDefinitionFromStaticAu(Type);
    if (def === void 0) {
      throw createMappedError(ErrorNames.value_converter_def_not_found, Type);
    }

    return def;
  },
  annotate<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K, value: PartialValueConverterDefinition[K]): void {
    defineMetadata(getAnnotationKeyFor(prop), value, Type);
  },
  getAnnotation: getConverterAnnotation,
  find(container, name) {
    const Type = container.find(converterTypeName, name);
    return Type == null ? null : getOwnMetadata(vcBaseName, Type) ?? getDefinitionFromStaticAu(Type) ?? null;
  },
  get(container, name) {
    if (__DEV__) {
      try {
        return container.get<ValueConverterInstance>(resource(getValueConverterKeyFrom(name)));
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error('[DEV:aurelia] Cannot retrieve value converter with name', name);
        throw ex;
      }
    }
    return container.get<ValueConverterInstance>(resource(getValueConverterKeyFrom(name)));
  },
});
