import { Constructable, Decoratable, Decorated, IContainer, Registration, Writable } from '@aurelia/kernel';
import { IScope, LifecycleFlags } from '../observation';
import { IResourceKind, IResourceType } from '../resource';
import { IBinding } from './binding';

export interface IBindingBehavior {
  bind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
}

export interface IBindingBehaviorSource {
  name: string;
}

export interface IBindingBehaviorType extends IResourceType<IBindingBehaviorSource> {
}

type BindingBehaviorDecorator = <T extends Constructable>(target: Decoratable<IBindingBehavior, T>) => Decorated<IBindingBehavior, T> & IBindingBehaviorType;

export function bindingBehavior(name: string): BindingBehaviorDecorator;
export function bindingBehavior(source: IBindingBehaviorSource): BindingBehaviorDecorator;
export function bindingBehavior(nameOrSource: string | IBindingBehaviorSource): BindingBehaviorDecorator {
  return target => BindingBehaviorResource.define(nameOrSource, target);
}

export const BindingBehaviorResource: IResourceKind<IBindingBehaviorSource, IBindingBehaviorType> = {
  name: 'binding-behavior',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable & Partial<IBindingBehaviorType>>(Type: T): Type is T & IBindingBehaviorType {
    return Type.kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IBindingBehaviorSource, ctor: T): T & IBindingBehaviorType {
    const Type = ctor as T & IBindingBehaviorType;
    const description = typeof nameOrSource === 'string'
      ? { name: nameOrSource }
      : nameOrSource;

    (Type as Writable<IBindingBehaviorType>).kind = BindingBehaviorResource;
    (Type as Writable<IBindingBehaviorType>).description = description;
    Type.register = register;

    return Type;
  }
};

function register(this: IBindingBehaviorType, container: IContainer): void {
  container.register(
    Registration.singleton(
      BindingBehaviorResource.keyFrom(this.description.name),
      this
    )
  );
}
