import { IResourceType, Resource } from "../resource";
import { Constructable, Immutable, Writable } from "../../kernel/interfaces";
import { IContainer, Registration } from "../../kernel/di";

export interface IValueConverterSource {
  name: string;
}

export type ValueConverterDefinition = Immutable<Required<IValueConverterSource>>;
export interface IValueConverterType extends IResourceType {
  readonly definition: ValueConverterDefinition;
}

export function valueConverter(nameOrSource: string | IValueConverterSource) {
  return function<T extends Constructable>(target: T) {
    return defineValueConverter(nameOrSource, target);
  }
}

export function defineValueConverter<T extends Constructable>(nameOrSource: string | IValueConverterSource, ctor: T): T & IValueConverterType {
  const definition = createDefinition(nameOrSource);
  const Type: T & IValueConverterType = ctor as any;

  (Type as Writable<IValueConverterType>).kind = Resource.valueConverter;
  (Type as Writable<IValueConverterType>).definition = definition;
  Type.register = function(container: IContainer) {
    container.register(Registration.singleton(Type.kind.key(definition.name), Type));
  };

  return Type;
}

function createDefinition(nameOrSource: string | IValueConverterSource): Immutable<IValueConverterSource> {
  if (typeof nameOrSource === 'string') {
    return { name: nameOrSource } as any;
  } else {
    return nameOrSource as any;
  }
}
