import {
  camelCase,
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
  SymbolFlags,
} from './semantic-model';

export interface IBindingCommand {
  bindingType: BindingType;
  override?: boolean;
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

export const BindingCommandResource: Readonly<IBindingCommandResource> = Object.freeze({
  name: 'binding-command',
  keyFrom(name: string): string {
    return `${BindingCommandResource.name}:${name}`;
  },
  isType<T>(Type: T & Partial<IBindingCommandType>): Type is T & IBindingCommandType {
    return Type.kind === BindingCommandResource;
  },
  define<T extends Constructable>(nameOrDefinition: string | IBindingCommandDefinition, ctor: T): T & IBindingCommandType {
    const Type = ctor as T & IBindingCommandType;
    const WritableType = Type as T & Writable<IBindingCommandType>;
    const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;

    WritableType.kind = BindingCommandResource;
    WritableType.description = description;

    Type.register = function register(container: IContainer): void {
      const key = BindingCommandResource.keyFrom(description.name);
      Registration.singleton(key, Type).register(container);
      Registration.alias(key, Type).register(container);
    };

    return Type;
  },
});

export function getTarget(binding: PlainAttributeSymbol | BindingSymbol, makeCamelCase: boolean): string {
  if (binding.flags & SymbolFlags.isBinding) {
    return (binding as BindingSymbol).bindable.propName;
  } else if (makeCamelCase) {
    return camelCase((binding as PlainAttributeSymbol).syntax.target);
  } else {
    return (binding as PlainAttributeSymbol).syntax.target;
  }
}
