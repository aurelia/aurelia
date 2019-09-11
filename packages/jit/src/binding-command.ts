import {
  camelCase,
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
import {
  BindingType,
  ITargetedInstruction,
  registerAliases
} from '@aurelia/runtime';

import {
  BindingSymbol,
  PlainAttributeSymbol,
  SymbolFlags,
} from './semantic-model';

export interface IBindingCommand {
  bindingType: BindingType;
  compile(binding: PlainAttributeSymbol | BindingSymbol): ITargetedInstruction;
}

type BindingCommandStaticProperties = Required<Pick<IBindingCommandDefinition, 'aliases'>>;
export interface IBindingCommandDefinition extends IResourceDefinition {
  type?: string | null
}

export interface IBindingCommandType extends IResourceType<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>>, BindingCommandStaticProperties { }

export interface IBindingCommandResource extends
  IResourceKind<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>> { }

type BindingCommandDecorator = <TProto, TClass>(target: Class<TProto, TClass> & Partial<IBindingCommandType>) => Class<TProto, TClass> & IBindingCommandType;

export function bindingCommand(name: string): BindingCommandDecorator;
export function bindingCommand(definition: IBindingCommandDefinition): BindingCommandDecorator;
export function bindingCommand(nameOrDefinition: string | IBindingCommandDefinition): BindingCommandDecorator {
  return target => BindingCommandResource.define(nameOrDefinition, target) as any; // TODO: fix this at some point
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
    const description = createBindingCommandDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);

    WritableType.kind = BindingCommandResource;
    WritableType.description = description;

    Type.register = function register(container: IContainer): void {
      const aliases = description.aliases;
      const key = BindingCommandResource.keyFrom(description.name);
      Registration.singleton(key, Type).register(container);
      Registration.alias(key, Type).register(container);      
      registerAliases(aliases, BindingCommandResource, key, container);
      registerAliases(this.aliases, BindingCommandResource, key, container);
    };

    return Type;
  },
});

/** @internal */
export function createBindingCommandDescription(def: IBindingCommandDefinition, Type: IBindingCommandType): Required<IBindingCommandDefinition> {
  const aliases = def.aliases;
  return {
    name: def.name,
    type: null,
    aliases: aliases == null ? PLATFORM.emptyArray : aliases,
  };
}

export function getTarget(binding: PlainAttributeSymbol | BindingSymbol, makeCamelCase: boolean): string {
  if (binding.flags & SymbolFlags.isBinding) {
    return (binding as BindingSymbol).bindable.propName;
  } else if (makeCamelCase) {
    return camelCase((binding as PlainAttributeSymbol).syntax.target);
  } else {
    return (binding as PlainAttributeSymbol).syntax.target;
  }
}
