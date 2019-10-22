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

export type BindingCommandType<T extends Constructable = Constructable> = ResourceType<T, BindingCommandInstance, PartialBindingCommandDefinition>;
export type BindingCommandKind = IResourceKind<BindingCommandType, BindingCommandDefinition> & {
  isType<T>(value: T): value is (T extends Constructable ? BindingCommandType<T> : never);
  define<T extends Constructable>(name: string, Type: T): BindingCommandType<T>;
  define<T extends Constructable>(def: PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
  getDefinition<T extends Constructable>(Type: T): BindingCommandDefinition<T>;
  annotate<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K, value: PartialBindingCommandDefinition[K]): void;
  getAnnotation<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K): PartialBindingCommandDefinition[K];
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
    let def: PartialBindingCommandDefinition;
    if (typeof nameOrDef === 'string') {
      name = nameOrDef;
      def = { name };
    } else {
      name = nameOrDef.name;
      def = nameOrDef;
    }

    return new BindingCommandDefinition(
      Type,
      firstDefined(BindingCommand.getAnnotation(Type, 'name'), name),
      mergeArrays(BindingCommand.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
      BindingCommand.keyFrom(name),
      firstDefined(BindingCommand.getAnnotation(Type, 'type'), def.type, Type.type, null),
    );
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
  isType<T>(value: T): value is (T extends Constructable ? BindingCommandType<T> : never) {
    return typeof value === 'function' && Metadata.hasOwn(BindingCommand.name, value);
  },
  define<T extends Constructable<BindingCommandInstance>>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): T & BindingCommandType<T> {
    const definition = BindingCommandDefinition.create(nameOrDef, Type as Constructable<BindingCommandInstance>);
    Metadata.define(BindingCommand.name, definition, definition.Type);
    Metadata.define(BindingCommand.name, definition, definition);
    Protocol.resource.appendTo(Type, BindingCommand.name);

    return definition.Type as BindingCommandType<T>;
  },
  getDefinition<T extends Constructable>(Type: T): BindingCommandDefinition<T> {
    const def = Metadata.getOwn(BindingCommand.name, Type);
    if (def === void 0) {
      throw new Error(`No definition found for type ${Type.name}`);
    }

    return def;
  },
  annotate<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K, value: PartialBindingCommandDefinition[K]): void {
    Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
  },
  getAnnotation<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K): PartialBindingCommandDefinition[K] {
    return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
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
