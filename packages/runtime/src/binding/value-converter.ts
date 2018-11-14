import { Constructable, IContainer, Registration, Writable } from '@aurelia/kernel';
import { IResourceKind, IResourceType } from '../resource';

export interface IValueConverterDefinition {
  name: string;
}

export type IValueConverterType = IResourceType<IValueConverterDefinition>;

export function valueConverter(nameOrDefinition: string | IValueConverterDefinition): <T extends Constructable>(target: T) => T & IResourceType<IValueConverterDefinition> {
  return function<T extends Constructable>(target: T): T & IResourceType<IValueConverterDefinition> {
    return ValueConverterResource.define(nameOrDefinition, target);
  };
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
