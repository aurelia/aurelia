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

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & IValueConverterType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IValueConverterSource, ctor: T): T & IValueConverterType {
    const Type = ctor as T & IValueConverterType;
    const description = typeof nameOrSource === 'string'
      ? { name: nameOrSource }
      : nameOrSource;

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
