import { camelCase, Registration, mergeArrays, firstDefined } from '@aurelia/kernel';
import { BindingMode, ExpressionType, DelegationStrategy, IExpressionParser, IsBindingBehavior, registerAliases } from '@aurelia/runtime';
import { IAttrMapper } from '../attribute-mapper.js';
import {
  AttributeBindingInstruction,
  PropertyBindingInstruction,
  CallBindingInstruction,
  IteratorBindingInstruction,
  RefBindingInstruction,
  ListenerBindingInstruction,
  SpreadBindingInstruction,
} from '../renderer.js';
import { DefinitionType } from './resources-shared.js';
import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata, getResourceKeyFor } from '../shared.js';

import type {
  Constructable,
  IContainer,
  IResourceKind,
  ResourceType,
  ResourceDefinition,
  PartialResourceDefinition,
} from '@aurelia/kernel';
import type { IInstruction } from '../renderer.js';
import type { AttrSyntax } from './attribute-pattern.js';
import type { BindableDefinition } from '../bindable.js';
import type { CustomAttributeDefinition } from './custom-attribute.js';
import type { CustomElementDefinition } from './custom-element.js';

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
  name: string;
  build(info: ICommandBuildInfo): IInstruction;
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
    if (typeof nameOrDef === 'string') {
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
    Registration.singleton(key, Type).register(container);
    Registration.aliasTo(key, Type).register(container);
    registerAliases(aliases, BindingCommand, key, container);
  }
}

const cmdBaseName = getResourceKeyFor('binding-command');
const getCommandKeyFrom = (name: string): string => `${cmdBaseName}:${name}`;
const getCommandAnnotation = <K extends keyof PartialBindingCommandDefinition>(
  Type: Constructable,
  prop: K,
): PartialBindingCommandDefinition[K] => getOwnMetadata(getAnnotationKeyFor(prop), Type);

export const BindingCommand = Object.freeze<BindingCommandKind>({
  name: cmdBaseName,
  keyFrom: getCommandKeyFrom,
  // isType<T>(value: T): value is (T extends Constructable ? BindingCommandType<T> : never) {
  //   return typeof value === 'function' && hasOwnMetadata(cmdBaseName, value);
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
  //       throw new Error(`No definition found for type ${Type.name}`);
  //     else
  //       throw new Error(`AUR0758:${Type.name}`);
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
  public readonly type: CommandType.None = CommandType.None;
  public get name() { return 'one-time'; }

  /** @internal */ protected static inject = [IAttrMapper, IExpressionParser];

  /** @internal */ private readonly _attrMapper: IAttrMapper;
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(m: IAttrMapper, xp: IExpressionParser) {
    this._attrMapper = m;
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = info.attr.rawValue;
    if (info.bindable == null) {
      target = this._attrMapper.map(info.node, target)
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
    return new PropertyBindingInstruction(this._exprParser.parse(value, ExpressionType.IsProperty), target, BindingMode.oneTime);
  }
}

@bindingCommand('to-view')
export class ToViewBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.None = CommandType.None;
  public get name() { return 'to-view'; }

  /** @internal */ protected static inject = [IAttrMapper, IExpressionParser];

  /** @internal */ private readonly _attrMapper: IAttrMapper;
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(attrMapper: IAttrMapper, exprParser: IExpressionParser) {
    this._attrMapper = attrMapper;
    this._exprParser = exprParser;
  }

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = info.attr.rawValue;
    if (info.bindable == null) {
      target = this._attrMapper.map(info.node, target)
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
    return new PropertyBindingInstruction(this._exprParser.parse(value, ExpressionType.IsProperty), target, BindingMode.toView);
  }
}

@bindingCommand('from-view')
export class FromViewBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.None = CommandType.None;
  public get name() { return 'from-view'; }

  /** @internal */ protected static inject = [IAttrMapper, IExpressionParser];

  /** @internal */ private readonly _attrMapper: IAttrMapper;
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(m: IAttrMapper, xp: IExpressionParser) {
    this._attrMapper = m;
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = attr.rawValue;
    if (info.bindable == null) {
      target = this._attrMapper.map(info.node, target)
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
    return new PropertyBindingInstruction(this._exprParser.parse(value, ExpressionType.IsProperty), target, BindingMode.fromView);
  }
}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.None = CommandType.None;
  public get name() { return 'two-way'; }

  /** @internal */ protected static inject = [IAttrMapper, IExpressionParser];

  /** @internal */ private readonly _attrMapper: IAttrMapper;
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(m: IAttrMapper, xp: IExpressionParser) {
    this._attrMapper = m;
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    let value = attr.rawValue;
    if (info.bindable == null) {
      target = this._attrMapper.map(info.node, target)
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
    return new PropertyBindingInstruction(this._exprParser.parse(value, ExpressionType.IsProperty), target, BindingMode.twoWay);
  }
}

@bindingCommand('bind')
export class DefaultBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.None = CommandType.None;
  public get name() { return 'bind'; }

  /** @internal */ protected static inject = [IAttrMapper, IExpressionParser];
  /** @internal */ private readonly _attrMapper: IAttrMapper;
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(m: IAttrMapper, xp: IExpressionParser) {
    this._attrMapper = m;
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): PropertyBindingInstruction {
    type CA = CustomAttributeDefinition;
    const attr = info.attr;
    const bindable = info.bindable;
    let defaultMode: BindingMode;
    let mode: BindingMode;
    let target = attr.target;
    let value = attr.rawValue;
    if (bindable == null) {
      mode = this._attrMapper.isTwoWay(info.node, target) ? BindingMode.twoWay : BindingMode.toView;
      target = this._attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      // if it looks like: <my-el value.bind>
      // it means        : <my-el value.bind="value">
      if (value === '' && info.def!.type === DefinitionType.Element) {
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
    return new PropertyBindingInstruction(this._exprParser.parse(value, ExpressionType.IsProperty), target, mode);
  }
}

@bindingCommand('call')
export class CallBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.None = CommandType.None;
  public get name() { return 'call'; }

  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(xp: IExpressionParser) {
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.property;
    return new CallBindingInstruction(this._exprParser.parse(info.attr.rawValue, (ExpressionType.IsProperty | ExpressionType.IsFunction) as ExpressionType) as IsBindingBehavior, target);
  }
}

@bindingCommand('for')
export class ForBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.None = CommandType.None;
  public get name() { return 'for'; }

  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(xp: IExpressionParser) {
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.property;
    return new IteratorBindingInstruction(this._exprParser.parse(info.attr.rawValue, ExpressionType.IsIterator), target);
  }
}

@bindingCommand('trigger')
export class TriggerBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.IgnoreAttr = CommandType.IgnoreAttr;
  public get name() { return 'trigger'; }

  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(xp: IExpressionParser) {
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): IInstruction {
    return new ListenerBindingInstruction(this._exprParser.parse(info.attr.rawValue, ExpressionType.IsFunction), info.attr.target, true, DelegationStrategy.none);
  }
}

@bindingCommand('delegate')
export class DelegateBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.IgnoreAttr = CommandType.IgnoreAttr;
  public get name() { return 'delegate'; }

  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(xp: IExpressionParser) {
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): IInstruction {
    return new ListenerBindingInstruction(this._exprParser.parse(info.attr.rawValue, ExpressionType.IsFunction), info.attr.target, false, DelegationStrategy.bubbling);
  }
}

@bindingCommand('capture')
export class CaptureBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.IgnoreAttr = CommandType.IgnoreAttr;
  public get name() { return 'capture'; }

  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(xp: IExpressionParser) {
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): IInstruction {
    return new ListenerBindingInstruction(this._exprParser.parse(info.attr.rawValue, ExpressionType.IsFunction), info.attr.target, false, DelegationStrategy.capturing);
  }
}

/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
@bindingCommand('attr')
export class AttrBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.IgnoreAttr = CommandType.IgnoreAttr;
  public get name() { return 'attr'; }

  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(xp: IExpressionParser) {
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): IInstruction {
    return new AttributeBindingInstruction(info.attr.target, this._exprParser.parse(info.attr.rawValue, ExpressionType.IsProperty), info.attr.target);
  }
}

/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
@bindingCommand('style')
export class StyleBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.IgnoreAttr = CommandType.IgnoreAttr;
  public get name() { return 'style'; }

  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(xp: IExpressionParser) {
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): IInstruction {
    return new AttributeBindingInstruction('style', this._exprParser.parse(info.attr.rawValue, ExpressionType.IsProperty), info.attr.target);
  }
}

/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
@bindingCommand('class')
export class ClassBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.IgnoreAttr = CommandType.IgnoreAttr;
  public get name() { return 'class'; }

  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(xp: IExpressionParser) {
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): IInstruction {
    return new AttributeBindingInstruction('class', this._exprParser.parse(info.attr.rawValue, ExpressionType.IsProperty), info.attr.target);
  }
}

/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
@bindingCommand('ref')
export class RefBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType.IgnoreAttr = CommandType.IgnoreAttr;
  public get name() { return 'ref'; }

  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public constructor(xp: IExpressionParser) {
    this._exprParser = xp;
  }

  public build(info: ICommandBuildInfo): IInstruction {
    return new RefBindingInstruction(this._exprParser.parse(info.attr.rawValue, ExpressionType.IsProperty), info.attr.target);
  }
}

@bindingCommand('...$attrs')
export class SpreadBindingCommand implements BindingCommandInstance {
  public readonly type: CommandType = CommandType.IgnoreAttr;
  public get name(): string { return '...$attrs'; }

  public build(info: ICommandBuildInfo): IInstruction {
    return new SpreadBindingInstruction();
  }
}
