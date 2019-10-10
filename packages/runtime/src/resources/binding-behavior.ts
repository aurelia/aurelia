import {
  Class,
  Constructable,
  IContainer,
  IResourceDefinition,
  IResourceKind,
  IResourceType,
  Registration,
  Writable,
  PLATFORM
} from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { IScope } from '../observation';
import { registerAliases } from '../definitions';

export interface IBindingBehavior<T = any[]> {
  bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
}

export interface IBindingBehaviorDefinition extends IResourceDefinition {
}

type BindingBehaviorStaticProperties = Required<Pick<IBindingBehaviorDefinition, 'aliases'>>;
export interface IBindingBehaviorType<C extends Constructable = Constructable> extends IResourceType<IBindingBehaviorDefinition, InstanceType<C> & IBindingBehavior>, BindingBehaviorStaticProperties { }

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
    const description = createBindingBehaviorDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);

    WritableType.kind = BindingBehavior;
    WritableType.description = description;
    WritableType.aliases = Type.aliases == null ? PLATFORM.emptyArray : Type.aliases;
    Type.register = function register(container: IContainer): void {
      const aliases = description.aliases;
      const key = BindingBehavior.keyFrom(description.name);
      Registration.singleton(key, this).register(container);
      Registration.alias(key, this).register(container);
      registerAliases([...aliases, ...this.aliases], BindingBehavior, key, container);
    };

    return Type;
  },
});

/** @internal */
export function createBindingBehaviorDescription(def: IBindingBehaviorDefinition, Type: IBindingBehaviorType): Required<IBindingBehaviorDefinition> {
  const aliases = def.aliases;
  return {
    name: def.name,
    aliases: aliases == null ? PLATFORM.emptyArray : aliases,
  };
}

export type BindingBehaviorDecorator = <T extends Constructable>(target: T) => T & IBindingBehaviorType<T>;
