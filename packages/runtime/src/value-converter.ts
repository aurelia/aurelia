import {
  Registration,
  mergeArrays,
  firstDefined,
} from '@aurelia/kernel';
import { registerAliases } from './alias';
import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata, getResourceKeyFor, hasOwnMetadata, isFunction, isString } from './utilities-objects';

import type {
  Constructable,
  IContainer,
  ResourceDefinition,
  IResourceKind,
  ResourceType,
  PartialResourceDefinition,
} from '@aurelia/kernel';

export type PartialValueConverterDefinition = PartialResourceDefinition;

export type ValueConverterInstance<T extends {} = {}> = {
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
} & T;

export type ValueConverterType<T extends Constructable = Constructable> = ResourceType<T, ValueConverterInstance>;
export type ValueConverterKind = IResourceKind<ValueConverterType, ValueConverterDefinition> & {
  isType<T>(value: T): value is (T extends Constructable ? ValueConverterType<T> : never);
  define<T extends Constructable>(name: string, Type: T): ValueConverterType<T>;
  define<T extends Constructable>(def: PartialValueConverterDefinition, Type: T): ValueConverterType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialValueConverterDefinition, Type: T): ValueConverterType<T>;
  getDefinition<T extends Constructable>(Type: T): ValueConverterDefinition<T>;
  annotate<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K, value: PartialValueConverterDefinition[K]): void;
  getAnnotation<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K): PartialValueConverterDefinition[K];
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

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.singleton(key, Type).register(container);
    Registration.aliasTo(key, Type).register(container);
    registerAliases(aliases, ValueConverter, key, container);
  }
}

const vcBaseName = getResourceKeyFor('value-converter');
const getConverterAnnotation = <K extends keyof PartialValueConverterDefinition>(
  Type: Constructable,
  prop: K,
): PartialValueConverterDefinition[K] => getOwnMetadata(getAnnotationKeyFor(prop), Type);

export const ValueConverter = Object.freeze<ValueConverterKind>({
  name: vcBaseName,
  keyFrom: (name: string): string => `${vcBaseName}:${name}`,
  isType<T>(value: T): value is (T extends Constructable ? ValueConverterType<T> : never) {
    return isFunction(value) && hasOwnMetadata(vcBaseName, value);
  },
  define<T extends Constructable<ValueConverterInstance>>(nameOrDef: string | PartialValueConverterDefinition, Type: T): ValueConverterType<T> {
    const definition = ValueConverterDefinition.create(nameOrDef, Type as Constructable<ValueConverterInstance>);
    defineMetadata(vcBaseName, definition, definition.Type);
    defineMetadata(vcBaseName, definition, definition);
    appendResourceKey(Type, vcBaseName);

    return definition.Type as ValueConverterType<T>;
  },
  getDefinition<T extends Constructable>(Type: T): ValueConverterDefinition<T> {
    const def = getOwnMetadata(vcBaseName, Type);
    if (def === void 0) {
      if (__DEV__)
        throw new Error(`AUR0152: No definition found for type ${Type.name}`);
      else
        throw new Error(`AUR0152:${Type.name}`);
    }

    return def;
  },
  annotate<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K, value: PartialValueConverterDefinition[K]): void {
    defineMetadata(getAnnotationKeyFor(prop), value, Type);
  },
  getAnnotation: getConverterAnnotation,
});
