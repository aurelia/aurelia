import {
  camelCase,
  Constructable,
  IContainer,
  IResourceKind,
  Registration,
  ResourceType,
  ResourceDefinition,
  PartialResourceDefinition,
  mergeArrays,
  Protocol,
  firstDefined,
  Metadata
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

export type PartialBindingCommandDefinition = PartialResourceDefinition<{
  readonly type?: string | null;
}>;

export type BindingCommandInstance<T extends {} = {}> = {
  bindingType: BindingType;
  compile(binding: PlainAttributeSymbol | BindingSymbol): ITargetedInstruction;
} & T;

export type BindingCommandType<T extends Constructable = Constructable> = ResourceType<T, BindingCommandInstance>;
export type BindingCommandKind = IResourceKind<BindingCommandType, BindingCommandDefinition> & {
  define<T extends Constructable>(name: string, Type: T): BindingCommandType<T>;
  define<T extends Constructable>(def: PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
};

export type BindingCommandDecorator = <T extends Constructable>(Type: T) => BindingCommandType<T>;

export function bindingCommand(name: string): BindingCommandDecorator;
export function bindingCommand(definition: PartialBindingCommandDefinition): BindingCommandDecorator;
export function bindingCommand(nameOrDefinition: string | PartialBindingCommandDefinition): BindingCommandDecorator {
  return function (target) {
    return BindingCommand.define(nameOrDefinition, target);
  };
}

export class BindingCommandDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, BindingCommandInstance> {
  private constructor(
    public readonly Type: BindingCommandType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string,
    public readonly type: string | null,
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialBindingCommandDefinition,
    Type: BindingCommandType<T>,
  ): BindingCommandDefinition<T> {
    let name: string;
    let aliases: string[];
    let type: string | null;

    if (typeof nameOrDef === 'string') {
      name = nameOrDef;
      aliases = mergeArrays(Type.aliases);
      type = null;
    } else {
      name = nameOrDef.name;
      aliases = mergeArrays(Type.aliases, nameOrDef.aliases);
      type = firstDefined(nameOrDef.type, null);
    }

    return new BindingCommandDefinition(Type, name, aliases, BindingCommand.keyFrom(name), type);
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.singleton(key, Type).register(container);
    Registration.alias(key, Type).register(container);
    registerAliases(aliases, BindingCommand, key, container);
  }
}

export const BindingCommand: BindingCommandKind = {
  name: Protocol.resource.keyFor('binding-command'),
  keyFrom(name: string): string {
    return `${BindingCommand.name}:${name}`;
  },
  define<T extends Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): T & BindingCommandType<T> {
    const $Type = Type as BindingCommandType<T>;
    const description = BindingCommandDefinition.create(nameOrDef, $Type);
    Metadata.define(BindingCommand.name, description, Type);
    Protocol.resource.appendTo(Type, BindingCommand.name);

    return $Type;
  },
};

export function getTarget(binding: PlainAttributeSymbol | BindingSymbol, makeCamelCase: boolean): string {
  if (binding.flags & SymbolFlags.isBinding) {
    return (binding as BindingSymbol).bindable.propName;
  } else if (makeCamelCase) {
    return camelCase((binding as PlainAttributeSymbol).syntax.target);
  } else {
    return (binding as PlainAttributeSymbol).syntax.target;
  }
}
