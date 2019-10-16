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
} from '@aurelia/kernel';
import { registerAliases, mergeArrays } from '../definitions';

export type ValueConverterInstance<T extends {} = {}> = {
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
} & T;

export type ValueConverterType<T extends Constructable = Constructable> = ResourceType<T, ValueConverterInstance>;
export type ValueConverterKind = IResourceKind<ValueConverterType, ValueConverterDefinition> & {
  define<T extends Constructable>(name: string, Type: T): ValueConverterType<T>;
};

export type ValueConverterDecorator = <T extends Constructable>(Type: T) => ValueConverterType<T>;

export function valueConverter(name: string): ValueConverterDecorator {
  return function (target) {
    return ValueConverter.define(name, target);
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
  define<T extends Constructable>(nameOrDef: string | ValueConverterDefinition, Type: T): ValueConverterType<T> {
    const $Type = Type as ValueConverterType<T>;
    const description = ValueConverterDefinition.create(nameOrDef, $Type);
    Metadata.define(ValueConverter.name, description, Type);
    Protocol.resource.appendTo(Type, ValueConverter.name);

    return $Type;
  },
};
