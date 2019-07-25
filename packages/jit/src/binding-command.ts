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
import {
  BindingType,
  ITargetedInstruction,
} from '@aurelia/runtime';

import {
  BindingSymbol,
  PlainAttributeSymbol,
} from './semantic-model';

export interface IBindingCommand {
  bindingType: BindingType;
  compile(binding: PlainAttributeSymbol | BindingSymbol): ITargetedInstruction;
}

export interface IBindingCommandDefinition extends IResourceDefinition { }

export interface IBindingCommandType extends IResourceType<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>> { }

export interface IBindingCommandResource extends
  IResourceKind<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>> { }

type BindingCommandDecorator = <TProto, TClass>(target: Class<TProto, TClass> & Partial<IBindingCommandType>) => Class<TProto, TClass> & IBindingCommandType;

export function bindingCommand(name: string): BindingCommandDecorator;
export function bindingCommand(definition: IBindingCommandDefinition): BindingCommandDecorator;
export function bindingCommand(nameOrDefinition: string | IBindingCommandDefinition): BindingCommandDecorator {
  return target => BindingCommandResource.define(nameOrDefinition, target);
}

export const BindingCommandResource: IBindingCommandResource = Object.freeze({
  name: 'binding-command',
  keyFrom(this: IBindingCommandResource, name: string): string {
    return `${BindingCommandResource.name}:${name}`;
  },
  isType<T>(this: IBindingCommandResource, Type: T & Partial<IBindingCommandType>): Type is T & IBindingCommandType {
    return Type.kind === BindingCommandResource;
  },
  define<T extends Constructable>(this: IBindingCommandResource, nameOrDefinition: string | IBindingCommandDefinition, ctor: T): T & IBindingCommandType {
    const Type = ctor as T & IBindingCommandType;
    const WritableType = Type as T & Writable<IBindingCommandType>;
    const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;

    WritableType.kind = BindingCommandResource;
    WritableType.description = description;

    Type.register = function register(container: IContainer): void {
      Registration.singleton(Type, Type).register(container);
      Registration.alias(BindingCommandResource.keyFrom(description.name), Type).register(container);
    };

    return Type;
  },
});
