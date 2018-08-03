import { Constructable, IContainer, Registration, Writable } from '@aurelia/kernel';
import { IResourceKind, IResourceType } from '../resource';

export interface IBindingBehaviorSource {
  name: string;
}

export type IBindingBehaviorType = IResourceType<IBindingBehaviorSource>;

export function bindingBehavior(nameOrSource: string | IBindingBehaviorSource) {
  return function<T extends Constructable>(target: T) {
    return BindingBehaviorResource.define(nameOrSource, target);
  }
}

export const BindingBehaviorResource: IResourceKind<IBindingBehaviorSource, IBindingBehaviorType> = {
  name: 'binding-behavior',

  key(name: string) {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & IBindingBehaviorType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IBindingBehaviorSource, ctor: T): T & IBindingBehaviorType {
    const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
    const Type: T & IBindingBehaviorType = ctor as any;

    (Type as Writable<IBindingBehaviorType>).kind = BindingBehaviorResource;
    (Type as Writable<IBindingBehaviorType>).description = description;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(Type.kind.key(description.name), Type));
    };

    return Type;
  }
};
