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
import { registerAliases } from '../definitions';

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
    nameOrDefinition: string | PartialResourceDefinition,
    Type: ValueConverterType<T>,
  ): ValueConverterDefinition<T> {
    let name: string;
    let aliases: string[];

    if (typeof nameOrDefinition === 'string') {
      name = nameOrDefinition;
      aliases = [];
    } else {
      name = nameOrDefinition.name;
      aliases = nameOrDefinition.aliases === void 0 ? [] : nameOrDefinition.aliases.slice();
    }

    if (Type.aliases !== void 0) {
      aliases.push(...Type.aliases);
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
  define<T extends Constructable>(nameOrDefinition: string | ValueConverterDefinition, Type: T): ValueConverterType<T> {
    const $Type = Type as ValueConverterType<T>;
    const description = ValueConverterDefinition.create(nameOrDefinition, $Type);
    Metadata.define(ValueConverter.name, description, Type);
    Protocol.resource.appendTo(Type, ValueConverter.name);

    return $Type;
  },
};
