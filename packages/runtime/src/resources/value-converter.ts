/* eslint-disable @typescript-eslint/no-use-before-define */
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
} from '@aurelia/kernel';
import { registerAliases } from '../definitions';

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
};

export type ValueConverterDecorator = <T extends Constructable>(Type: T) => ValueConverterType<T>;

export function valueConverter(definition: PartialValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(name: string): ValueConverterDecorator;
export function valueConverter(nameOrDefinition: string | PartialValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(nameOrDefinition: string | PartialValueConverterDefinition): ValueConverterDecorator {
  return function (target) {
    return ValueConverter.define(nameOrDefinition, target);
  };
}

export class ValueConverterDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, ValueConverterInstance> {
  private constructor(
    public readonly Type: ValueConverterType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string = ValueConverter.keyFrom(name),
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialResourceDefinition,
    Type: ValueConverterType<T>,
  ): ValueConverterDefinition<T> {
    let name: string;
    let aliases: string[];

    if (typeof nameOrDef === 'string') {
      name = nameOrDef;
      aliases = mergeArrays(Type.aliases);
    } else {
      name = nameOrDef.name;
      aliases = mergeArrays(Type.aliases, nameOrDef.aliases);
    }

    return new ValueConverterDefinition(Type, name, aliases);
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.singleton(key, Type).register(container);
    Registration.alias(key, Type).register(container);
    registerAliases(aliases, ValueConverter, key, container);
  }
}

export const ValueConverter: ValueConverterKind = {
  name: Protocol.resource.keyFor('value-converter'),
  keyFrom(name: string): string {
    return `${ValueConverter.name}:${name}`;
  },
  isType<T>(value: T): value is (T extends Constructable ? ValueConverterType<T> : never) {
    return typeof value === 'function' && Metadata.hasOwn(ValueConverter.name, value);
  },
  define<T extends Constructable>(nameOrDef: string | PartialValueConverterDefinition, Type: T): ValueConverterType<T> {
    const $Type = Type as ValueConverterType<T>;
    const description = ValueConverterDefinition.create(nameOrDef, $Type);
    Metadata.define(ValueConverter.name, description, Type);
    Protocol.resource.appendTo(Type, ValueConverter.name);

    return $Type;
  },
  getDefinition<T extends Constructable>(Type: T): ValueConverterDefinition<T> {
    const def = Metadata.getOwn(ValueConverter.name, Type);
    if (def === void 0) {
      throw new Error(`No definition found for type ${Type.name}`);
    }

    return def;
  },
};
