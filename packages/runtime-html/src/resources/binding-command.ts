import {
  camelCase,
  Registration,
  mergeArrays,
  Protocol,
  firstDefined,
  Metadata
} from '@aurelia/kernel';
import { BindingMode, BindingType, DelegationStrategy, registerAliases } from '@aurelia/runtime';
import { IAttrSyntaxTransformer } from '../attribute-syntax-transformer.js';
import {
  AttributeBindingInstruction,
  PropertyBindingInstruction,
  CallBindingInstruction,
  IteratorBindingInstruction,
  RefBindingInstruction,
  ListenerBindingInstruction,
} from '../renderer.js';

import type {
  Constructable,
  IContainer,
  IResourceKind,
  ResourceType,
  ResourceDefinition,
  PartialResourceDefinition,
} from '@aurelia/kernel';
import type { IInstruction } from '../renderer.js';
import type { AnyBindingExpression, ForOfStatement, IsBindingBehavior } from '@aurelia/runtime';
import type { AttrSyntax } from './attribute-pattern.js';
import type { BindableDefinition } from '../bindable.js';
import type { CustomAttributeDefinition } from './custom-attribute.js';
import type { CustomElementDefinition } from './custom-element.js';

export type PartialBindingCommandDefinition = PartialResourceDefinition<{
  readonly type?: string | null;
}>;

export interface ICommandBuildInfo {
  node: Element;
  attr: AttrSyntax;
  expr: AnyBindingExpression;
  bindable: BindableDefinition | null;
  def: CustomAttributeDefinition | CustomElementDefinition | null;
}

export type BindingCommandInstance<T extends {} = {}> = {
  bindingType: BindingType;
  build(info: ICommandBuildInfo): IInstruction;
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
    Registration.aliasTo(key, Type).register(container);
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

@bindingCommand('one-time')
export class OneTimeBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.OneTimeCommand = BindingType.OneTimeCommand;

  public static get inject() { return [IAttrSyntaxTransformer]; }
  public constructor(private readonly t: IAttrSyntaxTransformer) {}

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = this.t.map(info.node, info.attr.target)
        // if the transformer doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.property;
    }
    return new PropertyBindingInstruction(info.expr as IsBindingBehavior, target, BindingMode.oneTime);
  }
}

@bindingCommand('to-view')
export class ToViewBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.ToViewCommand = BindingType.ToViewCommand;

  public static get inject() { return [IAttrSyntaxTransformer]; }
  public constructor(private readonly t: IAttrSyntaxTransformer) {}

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = this.t.map(info.node, info.attr.target)
        // if the transformer doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.property;
    }
    return new PropertyBindingInstruction(info.expr as IsBindingBehavior, target, BindingMode.toView);
  }
}

@bindingCommand('from-view')
export class FromViewBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.FromViewCommand = BindingType.FromViewCommand;

  public static get inject() { return [IAttrSyntaxTransformer]; }
  public constructor(private readonly t: IAttrSyntaxTransformer) {}

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = this.t.map(info.node, info.attr.target)
        // if the transformer doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.property;
    }
    return new PropertyBindingInstruction(info.expr as IsBindingBehavior, target, BindingMode.fromView);
  }
}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.TwoWayCommand = BindingType.TwoWayCommand;

  public static get inject() { return [IAttrSyntaxTransformer]; }
  public constructor(private readonly t: IAttrSyntaxTransformer) {}

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = this.t.map(info.node, info.attr.target)
        // if the transformer doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.property;
    }
    return new PropertyBindingInstruction(info.expr as IsBindingBehavior, target, BindingMode.twoWay);
  }
}

@bindingCommand('bind')
export class DefaultBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.BindCommand = BindingType.BindCommand;

  public static get inject() { return [IAttrSyntaxTransformer]; }
  public constructor(private readonly t: IAttrSyntaxTransformer) {}

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    type CA = CustomAttributeDefinition;
    const attrName = info.attr.target;
    const bindable = info.bindable;
    let defaultMode: BindingMode;
    let mode: BindingMode;
    let target: string;
    if (bindable == null) {
      mode = this.t.isTwoWay(info.node, attrName) ? BindingMode.twoWay : BindingMode.toView;
      target = this.t.map(info.node, attrName)
        // if the transformer doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(attrName);
    } else {
      defaultMode = (info.def as CA).defaultBindingMode;
      mode = bindable.mode === BindingMode.default || bindable.mode == null
        ? defaultMode == null || defaultMode === BindingMode.default
          ? BindingMode.toView
          : defaultMode
        : bindable.mode;
      target = bindable.property;
    }
    return new PropertyBindingInstruction(info.expr as IsBindingBehavior, target, mode);
  }
}

@bindingCommand('call')
export class CallBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.CallCommand = BindingType.CallCommand;

  public build(info: ICommandBuildInfo): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.property;
    return new CallBindingInstruction(info.expr as IsBindingBehavior, target);
  }
}

@bindingCommand('for')
export class ForBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.ForCommand = BindingType.ForCommand;

  public build(info: ICommandBuildInfo): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.property;
    return new IteratorBindingInstruction(info.expr as ForOfStatement, target);
  }
}

@bindingCommand('trigger')
export class TriggerBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.TriggerCommand = BindingType.TriggerCommand;

  public build(info: ICommandBuildInfo): IInstruction {
    return new ListenerBindingInstruction(info.expr as IsBindingBehavior, info.attr.target, true, DelegationStrategy.none);
  }
}

@bindingCommand('delegate')
export class DelegateBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.DelegateCommand = BindingType.DelegateCommand;

  public build(info: ICommandBuildInfo): IInstruction {
    return new ListenerBindingInstruction(info.expr as IsBindingBehavior, info.attr.target, false, DelegationStrategy.bubbling);
  }
}

@bindingCommand('capture')
export class CaptureBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.CaptureCommand = BindingType.CaptureCommand;

  public build(info: ICommandBuildInfo): IInstruction {
    return new ListenerBindingInstruction(info.expr as IsBindingBehavior, info.attr.target, false, DelegationStrategy.capturing);
  }
}

/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
@bindingCommand('attr')
export class AttrBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty | BindingType.IgnoreAttr;

  public build(info: ICommandBuildInfo): IInstruction {
    return new AttributeBindingInstruction(info.attr.target, info.expr as IsBindingBehavior, info.attr.target);
  }
}

/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
@bindingCommand('style')
export class StyleBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty | BindingType.IgnoreAttr;

  public build(info: ICommandBuildInfo): IInstruction {
    return new AttributeBindingInstruction('style', info.expr as IsBindingBehavior, info.attr.target);
  }
}

/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
@bindingCommand('class')
export class ClassBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty | BindingType.IgnoreAttr;

  public build(info: ICommandBuildInfo): IInstruction {
    return new AttributeBindingInstruction('class', info.expr as IsBindingBehavior, info.attr.target);
  }
}

/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
@bindingCommand('ref')
export class RefBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty | BindingType.IgnoreAttr = BindingType.IsProperty | BindingType.IgnoreAttr;

  public build(info: ICommandBuildInfo): IInstruction {
    return new RefBindingInstruction(info.expr as IsBindingBehavior, info.attr.target);
  }
}
