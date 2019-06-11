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

function register(this: IBindingBehaviorType, container: IContainer): void {
  const resourceKey = BindingBehaviorResource.keyFrom(this.description.name);
  container.register(Registration.singleton(resourceKey, this));
  container.register(Registration.singleton(this, this));
}

export function bindingBehavior(definition: IBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(name: string): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDefinition: string | IBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDefinition: string | IBindingBehaviorDefinition): BindingBehaviorDecorator {
  return target => BindingBehaviorResource.define(nameOrDefinition, target);
}

function keyFrom(this: IBindingBehaviorResource, name: string): string {
  return `${this.name}:${name}`;
}

function isType<T>(this: IBindingBehaviorResource, Type: T & Partial<IBindingBehaviorType>): Type is T & IBindingBehaviorType {
  return Type.kind === this;
}

function define<T extends Constructable = Constructable>(this: IBindingBehaviorResource, definition: IBindingBehaviorDefinition, ctor: T): T & IBindingBehaviorType<T>;
function define<T extends Constructable = Constructable>(this: IBindingBehaviorResource, name: string, ctor: T): T & IBindingBehaviorType<T>;
function define<T extends Constructable = Constructable>(this: IBindingBehaviorResource, nameOrDefinition: string | IBindingBehaviorDefinition, ctor: T): T & IBindingBehaviorType<T>;
function define<T extends Constructable = Constructable>(this: IBindingBehaviorResource, nameOrDefinition: string | IBindingBehaviorDefinition, ctor: T): T & IBindingBehaviorType<T> {
  const Type = ctor as T & IBindingBehaviorType<T>;
  const WritableType = Type as T & Writable<IBindingBehaviorType<T>>;
  const description = typeof nameOrDefinition === 'string'
    ? { name: nameOrDefinition }
    : nameOrDefinition;

  WritableType.kind = BindingBehaviorResource as IBindingBehaviorResource;
  WritableType.description = description;
  Type.register = register;

  return Type;
}

export const BindingBehaviorResource = {
  name: 'binding-behavior',
  keyFrom,
  isType,
  define
};

export type BindingBehaviorDecorator = <T extends Constructable>(target: T) => T & IBindingBehaviorType<T>;
