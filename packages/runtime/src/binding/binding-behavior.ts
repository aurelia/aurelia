import { Class, Constructable, IContainer, Registration, Writable } from '../../kernel';
import { IScope, LifecycleFlags } from '../observation';
import { IResourceDefinition, IResourceKind, IResourceType } from '../resource';
import { IBinding } from './binding';

export interface IBindingBehavior {
  bind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
}

export interface IBindingBehaviorDefinition extends IResourceDefinition { }

export interface IBindingBehaviorType extends IResourceType<IBindingBehaviorDefinition, IBindingBehavior> { }

export interface IBindingBehaviorResource extends
  IResourceKind<IBindingBehaviorDefinition, IBindingBehavior, Class<IBindingBehavior>> {
}

type BindingBehaviorDecorator = <TProto, TClass>(target: Class<TProto, TClass> & Partial<IBindingBehaviorType>) => Class<TProto, TClass> & IBindingBehaviorType;

function register(this: IBindingBehaviorType, container: IContainer): void {
  const resourceKey = BindingBehaviorResource.keyFrom(this.description.name);
  container.register(Registration.singleton(resourceKey, this));
}

export function bindingBehavior(name: string): BindingBehaviorDecorator;
export function bindingBehavior(definition: IBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDefinition: string | IBindingBehaviorDefinition): BindingBehaviorDecorator {
  return target => BindingBehaviorResource.define(nameOrDefinition, target);
}

function keyFrom(this: IBindingBehaviorResource, name: string): string {
  return `${this.name}:${name}`;
}

function isType<T>(this: IBindingBehaviorResource, Type: T & Partial<IBindingBehaviorType>): Type is T & IBindingBehaviorType {
  return Type.kind === this;
}

function define<T extends Constructable>(this: IBindingBehaviorResource, name: string, ctor: T): T & IBindingBehaviorType;
function define<T extends Constructable>(this: IBindingBehaviorResource, ndefinition: IBindingBehaviorDefinition, ctor: T): T & IBindingBehaviorType;
function define<T extends Constructable>(this: IBindingBehaviorResource, nameOrDefinition: string | IBindingBehaviorDefinition, ctor: T): T & IBindingBehaviorType {
  const Type = ctor as T & Writable<IBindingBehaviorType>;
  const description = typeof nameOrDefinition === 'string'
    ? { name: nameOrDefinition }
    : nameOrDefinition;

  Type.kind = BindingBehaviorResource;
  Type.description = description;
  Type.register = register;

  return Type;
}

export const BindingBehaviorResource: IBindingBehaviorResource = {
  name: 'binding-behavior',
  keyFrom,
  isType,
  define
};
