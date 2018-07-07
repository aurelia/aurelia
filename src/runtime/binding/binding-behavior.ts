import { IResourceType, Resource } from "../resource";
import { Constructable, Writable, Immutable } from "../../kernel/interfaces";
import { IContainer, Registration } from "../../kernel/di";

export interface IBindingBehaviorSource {
  name: string;
}

export type BindingBehaviorDefinition = Immutable<Required<IBindingBehaviorSource>>;

export interface IBindingBehaviorType extends IResourceType {
  readonly definition: BindingBehaviorDefinition;
}

export function bindingBehavior(nameOrSource: string | IBindingBehaviorSource) {
  return function<T extends Constructable>(target: T) {
    return defineBindingBehavior(nameOrSource, target);
  }
}

export function defineBindingBehavior<T extends Constructable>(nameOrSource: string | IBindingBehaviorSource, ctor: T): T & IBindingBehaviorType {
  const definition = createDefinition(nameOrSource);
  const Type: T & IBindingBehaviorType = ctor as any;

  (Type as Writable<IBindingBehaviorType>).kind = Resource.bindingBehavior;
  (Type as Writable<IBindingBehaviorType>).definition = definition;
  Type.register = function(container: IContainer) {
    container.register(Registration.singleton(Type.kind.key(definition.name), Type));
  };

  return Type;
}

function createDefinition(nameOrSource: string | IBindingBehaviorSource): Immutable<IBindingBehaviorSource> {
  if (typeof nameOrSource === 'string') {
    return { name: nameOrSource };
  } else {
    return nameOrSource;
  }
}
