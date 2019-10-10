import {
  Class,
  Constructable,
  IContainer,
  IResourceDefinition,
  IResourceKind,
  IResourceType,
  Registration,
  Writable,
  PLATFORM
} from '@aurelia/kernel';
import { registerAliases } from '../definitions';

export interface IValueConverter {
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
}

export interface IValueConverterDefinition extends IResourceDefinition {
}

type ValueConverterStaticProperties = Required<Pick<IValueConverterDefinition, 'aliases'>>;
export interface IValueConverterType<C extends Constructable = Constructable> extends IResourceType<IValueConverterDefinition, InstanceType<C> & IValueConverter>, ValueConverterStaticProperties { }

export interface IValueConverterResource extends
  IResourceKind<IValueConverterDefinition, IValueConverter, Class<IValueConverter>> {
}

export function valueConverter(definition: IValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(name: string): ValueConverterDecorator;
export function valueConverter(nameOrDefinition: string | IValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(nameOrDefinition: string | IValueConverterDefinition): ValueConverterDecorator {
  return target => ValueConverter.define(nameOrDefinition, target) as any; // TODO: fix this at some point
}

export const ValueConverter: Readonly<IValueConverterResource> = Object.freeze({
  name: 'value-converter',
  keyFrom(name: string): string {
    return `${ValueConverter.name}:${name}`;
  },
  isType<T>(Type: T & Partial<IValueConverterType>): Type is T & IValueConverterType {
    return Type.kind === ValueConverter;
  },
  define<T extends Constructable = Constructable>(nameOrDefinition: string | IValueConverterDefinition, ctor: T): T & IValueConverterType<T> {
    const Type = ctor as T & IValueConverterType<T>;
    const WritableType = Type as T & Writable<IValueConverterType<T>>;
    const description = createCustomValueDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);

    WritableType.kind = ValueConverter;
    WritableType.description = description;
    WritableType.aliases = Type.aliases == null ? PLATFORM.emptyArray : Type.aliases;
    Type.register = function register(container: IContainer): void {
      const aliases = description.aliases;
      const key = ValueConverter.keyFrom(description.name);
      Registration.singleton(key, this).register(container);
      Registration.alias(key, this).register(container);
      registerAliases([...aliases, ...this.aliases], ValueConverter, key, container);
    };

    return Type;
  },
});

/** @internal */
export function createCustomValueDescription(def: IValueConverterDefinition, Type: IValueConverterType): Required<IValueConverterDefinition> {
  const aliases = def.aliases;
  return {
    name: def.name,
    aliases: aliases == null ? PLATFORM.emptyArray : aliases,
  };
}

export type ValueConverterDecorator = <T extends Constructable>(target: T) => T & IValueConverterType<T>;
