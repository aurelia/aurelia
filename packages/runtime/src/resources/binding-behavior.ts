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
} from '@aurelia/kernel';
import { registerAliases } from '../definitions';
import { LifecycleFlags } from '../flags';
import { IScope } from '../observation';
import { IBinding } from '../lifecycle';

export type BindingBehaviorInstance<T extends {} = {}> = {
  bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
} & T;

export type BindingBehaviorType<T extends Constructable = Constructable> = ResourceType<T, BindingBehaviorInstance>;
export type BindingBehaviorKind = IResourceKind<BindingBehaviorType, BindingBehaviorDefinition> & {
  define<T extends Constructable>(name: string, Type: T): BindingBehaviorType<T>;
};

export type BindingBehaviorDecorator = <T extends Constructable>(Type: T) => BindingBehaviorType<T>;

export function bindingBehavior(name: string): BindingBehaviorDecorator {
  return function (target) {
    return BindingBehavior.define(name, target);
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
    nameOrDefinition: string | PartialResourceDefinition,
    Type: BindingBehaviorType<T>,
  ): BindingBehaviorDefinition<T> {
    let name: string;
    let aliases: string[];

    if (typeof nameOrDefinition === 'string') {
      name = nameOrDefinition;
      aliases = [];
    } else {
      name = nameOrDefinition.name;
      aliases = nameOrDefinition.aliases === void 0 ? [] : nameOrDefinition.aliases.slice();
    }

    if (Type.aliases !== void 0) {
      aliases.push(...Type.aliases);
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
  define<T extends Constructable>(nameOrDefinition: string | BindingBehaviorDefinition, Type: T): BindingBehaviorType<T> {
    const $Type = Type as BindingBehaviorType<T>;
    const description = BindingBehaviorDefinition.create(nameOrDefinition, $Type);
    Metadata.define(BindingBehavior.name, description, Type);
    Protocol.resource.appendTo(Type, BindingBehavior.name);

    return $Type;
  },
};
