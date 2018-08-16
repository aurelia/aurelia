import { Constructable, IContainer, Registration, Writable } from '@aurelia/kernel';
import { IResourceKind, IResourceType } from '../resource';

export interface IValueConverterSource {
  name: string;
}

export type IValueConverterType = IResourceType<IValueConverterSource>;

export function valueConverter(nameOrSource: string | IValueConverterSource) {
  return function<T extends Constructable>(target: T) {
    return ValueConverterResource.define(nameOrSource, target);
  }
}

export const ValueConverterResource: IResourceKind<IValueConverterSource, IValueConverterType> = {
  name: 'value-converter',

  keyFrom(name: string) {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & IValueConverterType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IValueConverterSource, ctor: T): T & IValueConverterType {
    const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
    const Type: T & IValueConverterType = ctor as any;

    (Type as Writable<IValueConverterType>).kind = ValueConverterResource;
    (Type as Writable<IValueConverterType>).description = description;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(Type.kind.keyFrom(description.name), Type));
    };

    return Type;
  }
};
