import { Constructable, Decoratable, Decorated, IContainer, Registration, Writable } from '@aurelia/kernel';
import { IResourceDefinition, IResourceKind, IResourceType } from '../resource';

export interface IValueConverter {
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
}

export interface IValueConverterDefinition extends IResourceDefinition { }

export interface IValueConverterType extends IResourceType<IValueConverterDefinition, IValueConverter> { }

type ValueConverterDecorator = <T extends Constructable>(target: Decoratable<IValueConverter, T>) => Decorated<IValueConverter, T> & IValueConverterType;

export function valueConverter(name: string): ValueConverterDecorator;
export function valueConverter(definition: IValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(nameOrDefinition: string | IValueConverterDefinition): ValueConverterDecorator {
  return target => ValueConverterResource.define(nameOrDefinition, target);
}

export const ValueConverterResource: IResourceKind<IValueConverterDefinition, IValueConverterType> = {
  name: 'value-converter',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable & Partial<IValueConverterType>>(Type: T): Type is T & IValueConverterType {
    return Type.kind === this;
  },

  define<T extends Constructable>(nameOrDefinition: string | IValueConverterDefinition, ctor: T): T & IValueConverterType {
    const Type = ctor as T & IValueConverterType;
    const description = typeof nameOrDefinition === 'string'
      ? { name: nameOrDefinition }
      : nameOrDefinition;

    (Type as Writable<IValueConverterType>).kind = ValueConverterResource;
    (Type as Writable<IValueConverterType>).description = description;
    Type.register = register;

    return Type;
  }
};

function register(this: IValueConverterType, container: IContainer): void {
  container.register(
    Registration.singleton(
      ValueConverterResource.keyFrom(this.description.name),
      this
    )
  );
}
