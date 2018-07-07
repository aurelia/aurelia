import { IResourceType, IResourceKind } from "../resource";
import { Constructable, Writable } from "../../kernel/interfaces";
import { IContainer, Registration } from "../../kernel/di";

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

  key(name: string) {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & IValueConverterType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IValueConverterSource, ctor: T): T & IValueConverterType {
    const definition = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
    const Type: T & IValueConverterType = ctor as any;
  
    (Type as Writable<IValueConverterType>).kind = ValueConverterResource;
    (Type as Writable<IValueConverterType>).definition = definition;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(Type.kind.key(definition.name), Type));
    };
  
    return Type;
  }
};
