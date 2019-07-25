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
import { LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { IScope } from '../observation';

export interface IBindingBehavior {
  bind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
}

export interface IBindingBehaviorDefinition extends IResourceDefinition { }

export interface IBindingBehaviorType<C extends Constructable = Constructable> extends IResourceType<IBindingBehaviorDefinition, InstanceType<C> & IBindingBehavior> { }

export interface IBindingBehaviorResource extends
  IResourceKind<IBindingBehaviorDefinition, IBindingBehavior, Class<IBindingBehavior>> {
}

export function bindingBehavior(definition: IBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(name: string): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDefinition: string | IBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDefinition: string | IBindingBehaviorDefinition): BindingBehaviorDecorator {
  return target => BindingBehavior.define(nameOrDefinition, target) as any; // TODO: fix this at some point
}

export const BindingBehavior: Readonly<IBindingBehaviorResource> = Object.freeze({
  name: 'binding-behavior',
  keyFrom(name: string): string {
    return `${BindingBehavior.name}:${name}`;
  },
  isType<T>(Type: T & Partial<IBindingBehaviorType>): Type is T & IBindingBehaviorType {
    return Type.kind === BindingBehavior;
  },
  define<T extends Constructable = Constructable>(nameOrDefinition: string | IBindingBehaviorDefinition, ctor: T): T & IBindingBehaviorType<T> {
    const Type = ctor as T & IBindingBehaviorType<T>;
    const WritableType = Type as T & Writable<IBindingBehaviorType<T>>;
    const description = typeof nameOrDefinition === 'string'
      ? { name: nameOrDefinition }
      : nameOrDefinition;

    WritableType.kind = BindingBehavior;
    WritableType.description = description;
    Type.register = function register(container: IContainer): void {
      Registration.singleton(Type, Type).register(container);
      Registration.alias(Type, BindingBehavior.keyFrom(description.name)).register(container);
    };

    return Type;
  },
});

export type BindingBehaviorDecorator = <T extends Constructable>(target: T) => T & IBindingBehaviorType<T>;
