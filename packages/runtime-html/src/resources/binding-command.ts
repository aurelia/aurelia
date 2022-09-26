import { camelCase, mergeArrays, firstDefined } from '@aurelia/kernel';
import { ExpressionType, IExpressionParser, IsBindingBehavior } from '@aurelia/runtime';
import { BindingMode } from '../binding/interfaces-bindings';
import { IAttrMapper } from '../attribute-mapper';
import {
  AttributeBindingInstruction,
  PropertyBindingInstruction,
  CallBindingInstruction,
  IteratorBindingInstruction,
  RefBindingInstruction,
  ListenerBindingInstruction,
  SpreadBindingInstruction,
  DelegationStrategy,
} from '../renderer';
import { DefinitionType } from './resources-shared';
import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata, getResourceKeyFor } from '../utilities-metadata';
import { isString } from '../utilities';
import { aliasRegistration, registerAliases, singletonRegistration } from '../utilities-di';

import type {
  Constructable,
  IContainer,
  IResourceKind,
  ResourceType,
  ResourceDefinition,
  PartialResourceDefinition,
} from '@aurelia/kernel';
import type { IInstruction } from '../renderer';
import type { AttrSyntax } from './attribute-pattern';
import type { BindableDefinition } from '../bindable';
import type { CustomAttributeDefinition } from './custom-attribute';
import type { CustomElementDefinition } from './custom-element';

/**
 * Characteristics of a binding command.
 */
export const enum CommandType {
  None       = 0b0_000,
  // if a binding command is taking over the processing of an attribute
  // then it should add this flag to its type
  // which then should be considered by the template compiler to keep the attribute as is in compilation,
  // instead of normal process: check custom attribute -> check bindable -> command.build()
  IgnoreAttr = 0b0_001,
}

export type PartialBindingCommandDefinition = PartialResourceDefinition<{
  readonly type?: string | null;
}>;

export interface IPlainAttrCommandInfo {
  readonly node: Element;
  readonly attr: AttrSyntax;
  readonly bindable: null;
  readonly def: null;
}

export interface IBindableCommandInfo {
  readonly node: Element;
  readonly attr: AttrSyntax;
  readonly bindable: BindableDefinition;
  readonly def: CustomAttributeDefinition | CustomElementDefinition;
}

export type ICommandBuildInfo = IPlainAttrCommandInfo | IBindableCommandInfo;

export type BindingCommandInstance<T extends {} = {}> = {
  type: CommandType;
  build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): IInstruction;
} & T;

export type BindingCommandType<T extends Constructable = Constructable> = ResourceType<T, BindingCommandInstance, PartialBindingCommandDefinition>;
export type BindingCommandKind = IResourceKind<BindingCommandType, BindingCommandDefinition> & {
  // isType<T>(value: T): value is (T extends Constructable ? BindingCommandType<T> : never);
  define<T extends Constructable>(name: string, Type: T): BindingCommandType<T>;
  define<T extends Constructable>(def: PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
  // getDefinition<T extends Constructable>(Type: T): BindingCommandDefinition<T>;
  // annotate<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K, value: PartialBindingCommandDefinition[K]): void;
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
    if (isString(nameOrDef)) {
      name = nameOrDef;
      def = { name };
    } else {
      name = nameOrDef.name;
      def = nameOrDef;
    }

    return new BindingCommandDefinition(
      Type,
      firstDefined(getCommandAnnotation(Type, 'name'), name),
      mergeArrays(getCommandAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
      getCommandKeyFrom(name),
      firstDefined(getCommandAnnotation(Type, 'type'), def.type, Type.type, null),
    );
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    singletonRegistration(key, Type).register(container);
    aliasRegistration(key, Type).register(container);
    registerAliases(aliases, BindingCommand, key, container);
  }
}

const cmdBaseName = getResourceKeyFor('binding-command');
const getCommandKeyFrom = (name: string): string => `${cmdBaseName}:${name}`;
const getCommandAnnotation = <K extends keyof PartialBindingCommandDefinition>(
  Type: Constructable,
  prop: K,
): PartialBindingCommandDefinition[K] =>
  getOwnMetadata(getAnnotationKeyFor(prop), Type) as PartialBindingCommandDefinition[K];

export const BindingCommand = Object.freeze<BindingCommandKind>({
  name: cmdBaseName,
  keyFrom: getCommandKeyFrom,
  // isType<T>(value: T): value is (T extends Constructable ? BindingCommandType<T> : never) {
  //   return isFunction(value) && hasOwnMetadata(cmdBaseName, value);
  // },
  define<T extends Constructable<BindingCommandInstance>>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): T & BindingCommandType<T> {
    const definition = BindingCommandDefinition.create(nameOrDef, Type as Constructable<BindingCommandInstance>);
    defineMetadata(cmdBaseName, definition, definition.Type);
    defineMetadata(cmdBaseName, definition, definition);
    appendResourceKey(Type, cmdBaseName);

    return definition.Type as BindingCommandType<T>;
  },
  // getDefinition<T extends Constructable>(Type: T): BindingCommandDefinition<T> {
  //   const def = getOwnMetadata(cmdBaseName, Type);
  //   if (def === void 0) {
  //     if (__DEV__)
  //       throw createError(`AUR0758: No definition found for type ${Type.name}`);
  //     else
  //       throw createError(`AUR0758:${Type.name}`);
  //   }

  //   return def;
  // },
  // annotate<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K, value: PartialBindingCommandDefinition[K]): void {
  //   defineMetadata(getAnnotationKeyFor(prop), value, Type);
  // },
  getAnnotation: getCommandAnnotation,
});

@bindingCommand('one-time')
export class OneTimeBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.None { return CommandType.None; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = info.attr.rawValue;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      // if it looks like: <my-el value.bind>
      // it means        : <my-el value.bind="value">
      if (value === '' && info.def.type === DefinitionType.Element) {
        value = camelCase(target);
      }
      target = info.bindable.property;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, ExpressionType.IsProperty), target, BindingMode.oneTime);
  }
}

@bindingCommand('to-view')
export class ToViewBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.None { return CommandType.None; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = info.attr.rawValue;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      // if it looks like: <my-el value.bind>
      // it means        : <my-el value.bind="value">
      if (value === '' && info.def.type === DefinitionType.Element) {
        value = camelCase(target);
      }
      target = info.bindable.property;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, ExpressionType.IsProperty), target, BindingMode.toView);
  }
}

@bindingCommand('from-view')
export class FromViewBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.None { return CommandType.None; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = attr.rawValue;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      // if it looks like: <my-el value.bind>
      // it means        : <my-el value.bind="value">
      if (value === '' && info.def.type === DefinitionType.Element) {
        value = camelCase(target);
      }
      target = info.bindable.property;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, ExpressionType.IsProperty), target, BindingMode.fromView);
  }
}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.None { return CommandType.None; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = attr.rawValue;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      // if it looks like: <my-el value.bind>
      // it means        : <my-el value.bind="value">
      if (value === '' && info.def.type === DefinitionType.Element) {
        value = camelCase(target);
      }
      target = info.bindable.property;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, ExpressionType.IsProperty), target, BindingMode.twoWay);
  }
}

@bindingCommand('bind')
export class DefaultBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.None { return CommandType.None; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction {
    type CA = CustomAttributeDefinition;
    const attr = info.attr;
    const bindable = info.bindable;
    let defaultMode: BindingMode;
    let mode: BindingMode;
    let target = attr.target;
    let value = attr.rawValue;
    if (bindable == null) {
      mode = attrMapper.isTwoWay(info.node, target) ? BindingMode.twoWay : BindingMode.toView;
      target = attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      // if it looks like: <my-el value.bind>
      // it means        : <my-el value.bind="value">
      if (value === '' && info.def.type === DefinitionType.Element) {
        value = camelCase(target);
      }
      defaultMode = (info.def as CA).defaultBindingMode;
      mode = bindable.mode === BindingMode.default || bindable.mode == null
        ? defaultMode == null || defaultMode === BindingMode.default
          ? BindingMode.toView
          : defaultMode
        : bindable.mode;
      target = bindable.property;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, ExpressionType.IsProperty), target, mode);
  }
}

@bindingCommand('call')
export class CallBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.None { return CommandType.None; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.property;
    return new CallBindingInstruction(exprParser.parse(info.attr.rawValue, (ExpressionType.IsProperty | ExpressionType.IsFunction) as ExpressionType) as IsBindingBehavior, target);
  }
}

@bindingCommand('for')
export class ForBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.None { return CommandType.None; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.property;
    return new IteratorBindingInstruction(exprParser.parse(info.attr.rawValue, ExpressionType.IsIterator), target);
  }
}

@bindingCommand('trigger')
export class TriggerBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.IgnoreAttr { return CommandType.IgnoreAttr; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new ListenerBindingInstruction(exprParser.parse(info.attr.rawValue, ExpressionType.IsFunction), info.attr.target, true, DelegationStrategy.none);
  }
}

@bindingCommand('delegate')
export class DelegateBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.IgnoreAttr { return CommandType.IgnoreAttr; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new ListenerBindingInstruction(exprParser.parse(info.attr.rawValue, ExpressionType.IsFunction), info.attr.target, false, DelegationStrategy.bubbling);
  }
}

@bindingCommand('capture')
export class CaptureBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.IgnoreAttr { return CommandType.IgnoreAttr; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new ListenerBindingInstruction(exprParser.parse(info.attr.rawValue, ExpressionType.IsFunction), info.attr.target, false, DelegationStrategy.capturing);
  }
}

/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
@bindingCommand('attr')
export class AttrBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.IgnoreAttr { return CommandType.IgnoreAttr; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new AttributeBindingInstruction(info.attr.target, exprParser.parse(info.attr.rawValue, ExpressionType.IsProperty), info.attr.target);
  }
}

/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
@bindingCommand('style')
export class StyleBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.IgnoreAttr { return CommandType.IgnoreAttr; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new AttributeBindingInstruction('style', exprParser.parse(info.attr.rawValue, ExpressionType.IsProperty), info.attr.target);
  }
}

/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
@bindingCommand('class')
export class ClassBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.IgnoreAttr { return CommandType.IgnoreAttr; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new AttributeBindingInstruction('class', exprParser.parse(info.attr.rawValue, ExpressionType.IsProperty), info.attr.target);
  }
}

/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
@bindingCommand('ref')
export class RefBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.IgnoreAttr { return CommandType.IgnoreAttr; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new RefBindingInstruction(exprParser.parse(info.attr.rawValue, ExpressionType.IsProperty), info.attr.target);
  }
}

@bindingCommand('...$attrs')
export class SpreadBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.IgnoreAttr { return CommandType.IgnoreAttr; }

  public build(_info: ICommandBuildInfo): IInstruction {
    return new SpreadBindingInstruction();
  }
}
