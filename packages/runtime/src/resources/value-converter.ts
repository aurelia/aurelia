import {
  Class,
  Constructable,
  IContainer,
  IResourceDefinition,
  IResourceKind,
  IResourceType,
  Registration,
  Writable
} from '@aurelia/kernel';

export interface IValueConverter {
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
}

export interface IValueConverterDefinition extends IResourceDefinition { }

export interface IValueConverterType<C extends Constructable = Constructable> extends IResourceType<IValueConverterDefinition, InstanceType<C> & IValueConverter> { }

export interface IValueConverterResource extends
  IResourceKind<IValueConverterDefinition, IValueConverter, Class<IValueConverter>> { }

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
    const Type = ctor as T & Writable<IValueConverterType>;
    const description = typeof nameOrDefinition === 'string'
      ? { name: nameOrDefinition }
      : nameOrDefinition;

    Type.kind = ValueConverter;
    Type.description = description;
    Type.register = function register(container: IContainer): void {
      const key = ValueConverter.keyFrom(description.name);
      Registration.singleton(key, this).register(container);
      Registration.alias(key, this).register(container);
    };

    return Type as T & IValueConverterType<T>;
  },
});

export type ValueConverterDecorator = <T extends Constructable>(target: T) => T & IValueConverterType<T>;
