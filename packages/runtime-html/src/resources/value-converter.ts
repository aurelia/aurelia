import {
  mergeArrays,
  firstDefined,
  Registrable,
} from '@aurelia/kernel';
import { aliasRegistration, singletonRegistration } from '../utilities-di';
import { isFunction, isString, objectFreeze } from '../utilities';
import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata, getResourceKeyFor, hasOwnMetadata } from '../utilities-metadata';

import type {
  Constructable,
  IContainer,
  ResourceDefinition,
  ResourceType,
  PartialResourceDefinition,
} from '@aurelia/kernel';
import { ValueConverterInstance } from '@aurelia/runtime';
import { ErrorNames, createMappedError } from '../errors';
import { type IResourceKind } from './resources-shared';

export type PartialValueConverterDefinition = PartialResourceDefinition;

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
}

const vcBaseName = getResourceKeyFor('value-converter');
const getConverterAnnotation = <K extends keyof PartialValueConverterDefinition>(
  Type: Constructable,
  prop: K,
): PartialValueConverterDefinition[K] => getOwnMetadata(getAnnotationKeyFor(prop), Type);

const getValueConverterKeyFor = (name: string): string => `${vcBaseName}:${name}`;
export const ValueConverter = objectFreeze<ValueConverterKind>({
  name: vcBaseName,
  keyFrom: getValueConverterKeyFor,
  isType<T>(value: T): value is (T extends Constructable ? ValueConverterType<T> : never) {
    return isFunction(value) && hasOwnMetadata(vcBaseName, value);
  },
  define<T extends Constructable<ValueConverterInstance>>(nameOrDef: string | PartialValueConverterDefinition, Type: T): ValueConverterType<T> {
    const definition = ValueConverterDefinition.create(nameOrDef, Type as Constructable<ValueConverterInstance>);
    const $Type = definition.Type as ValueConverterType<T>;

    defineMetadata(vcBaseName, definition, definition.Type);
    appendResourceKey($Type, vcBaseName);

    return Registrable.define($Type, container => {
      const { key, aliases } = definition;
      if (!container.has(key, false)) {
        container.register(
          singletonRegistration(key, $Type),
          aliasRegistration(key, $Type),
          ...aliases.map(alias => aliasRegistration($Type, getValueConverterKeyFor(alias)))
        );
      } /* istanbul ignore next */ else if(__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[DEV:aurelia] ${createMappedError(ErrorNames.value_converter_existed, definition.name)}`);
      }
    });
  },
  getDefinition<T extends Constructable>(Type: T): ValueConverterDefinition<T> {
    const def = getOwnMetadata(vcBaseName, Type);
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
    const key = getValueConverterKeyFor(name);
    const Type = container.find(key);
    return Type == null ? null : getOwnMetadata(vcBaseName, Type) ?? null;
  },
});
