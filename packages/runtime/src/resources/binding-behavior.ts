/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Constructable,
  IContainer,
  ResourceDefinition,
  IResourceKind,
  ResourceType,
  Registration,
  Metadata,
  Protocol,
  PartialResourceDefinition,
  mergeArrays,
} from '@aurelia/kernel';
import { registerAliases } from '../definitions';
import { LifecycleFlags } from '../flags';
import { IScope } from '../observation';
import { IBinding } from '../lifecycle';

export type PartialBindingBehaviorDefinition = PartialResourceDefinition;

export type BindingBehaviorInstance<T extends {} = {}> = {
  bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
} & T;

export type BindingBehaviorType<T extends Constructable = Constructable> = ResourceType<T, BindingBehaviorInstance>;
export type BindingBehaviorKind = IResourceKind<BindingBehaviorType, BindingBehaviorDefinition> & {
  isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never);
  define<T extends Constructable>(name: string, Type: T): BindingBehaviorType<T>;
  define<T extends Constructable>(def: PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
  getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T>;
};

export type BindingBehaviorDecorator = <T extends Constructable>(Type: T) => BindingBehaviorType<T>;

export function bindingBehavior(definition: PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(name: string): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDefinition: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDefinition: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator {
  return function (target) {
    return BindingBehavior.define(nameOrDefinition, target);
  };
}

export class BindingBehaviorDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, BindingBehaviorInstance> {
  private constructor(
    public readonly Type: BindingBehaviorType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string = BindingBehavior.keyFrom(name),
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialBindingBehaviorDefinition,
    Type: BindingBehaviorType<T>,
  ): BindingBehaviorDefinition<T> {
    let name: string;
    let aliases: string[];

    if (typeof nameOrDef === 'string') {
      name = nameOrDef;
      aliases = mergeArrays(Type.aliases);
    } else {
      name = nameOrDef.name;
      aliases = mergeArrays(Type.aliases, nameOrDef.aliases);
    }

    return new BindingBehaviorDefinition(Type, name, aliases);
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.singleton(key, Type).register(container);
    Registration.alias(key, Type).register(container);
    registerAliases(aliases, BindingBehavior, key, container);
  }
}

export const BindingBehavior: BindingBehaviorKind = {
  name: Protocol.resource.keyFor('binding-behavior'),
  keyFrom(name: string): string {
    return `${BindingBehavior.name}:${name}`;
  },
  isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never) {
    return typeof value === 'function' && Metadata.hasOwn(BindingBehavior.name, value);
  },
  define<T extends Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T> {
    const $Type = Type as BindingBehaviorType<T>;
    const description = BindingBehaviorDefinition.create(nameOrDef, $Type);
    Metadata.define(BindingBehavior.name, description, Type);
    Protocol.resource.appendTo(Type, BindingBehavior.name);

    return $Type;
  },
  getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T> {
    const def = Metadata.getOwn(BindingBehavior.name, Type);
    if (def === void 0) {
      throw new Error(`No definition found for type ${Type.name}`);
    }

    return def;
  },
};
