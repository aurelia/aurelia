import { camelCase, mergeArrays, firstDefined, emptyArray } from '@aurelia/kernel';
import { ExpressionType, IExpressionParser } from '@aurelia/runtime';
import { BindingMode } from '../binding/interfaces-bindings';
import { IAttrMapper } from '../compiler/attribute-mapper';
import {
  AttributeBindingInstruction,
  PropertyBindingInstruction,
  IteratorBindingInstruction,
  RefBindingInstruction,
  ListenerBindingInstruction,
  SpreadBindingInstruction,
  MultiAttrInstruction,
} from '../renderer';
import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata, getResourceKeyFor } from '../utilities-metadata';
import { isString, objectFreeze } from '../utilities';
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
import { AttrSyntax, IAttributeParser } from './attribute-pattern';
import type { BindableDefinition } from '../bindable';
import type { CustomAttributeDefinition } from './custom-attribute';
import type { CustomElementDefinition } from './custom-element';

/**
 * Characteristics of a binding command.
 */
export type CommandType =
  'None'
  // if a binding command is taking over the processing of an attribute
  // then it should add this flag to its type
  // which then should be considered by the template compiler to keep the attribute as is in compilation,
  // instead of normal process: check custom attribute -> check bindable -> command.build()
  | 'IgnoreAttr';

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

const cmdBaseName = /*@__PURE__*/getResourceKeyFor('binding-command');
const getCommandKeyFrom = (name: string): string => `${cmdBaseName}:${name}`;
const getCommandAnnotation = <K extends keyof PartialBindingCommandDefinition>(
  Type: Constructable,
  prop: K,
): PartialBindingCommandDefinition[K] =>
  getOwnMetadata(getAnnotationKeyFor(prop), Type) as PartialBindingCommandDefinition[K];

export const BindingCommand = objectFreeze<BindingCommandKind>({
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
  getAnnotation: getCommandAnnotation,
});

@bindingCommand('one-time')
export class OneTimeBindingCommand implements BindingCommandInstance {
  public get type(): 'None' { return 'None'; }

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
      if (value === '' && info.def.type === 'Element') {
        value = camelCase(target);
      }
      target = info.bindable.name;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, 'IsProperty'), target, BindingMode.oneTime);
  }
}

@bindingCommand('to-view')
export class ToViewBindingCommand implements BindingCommandInstance {
  public get type(): 'None' { return 'None'; }

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
      if (value === '' && info.def.type === 'Element') {
        value = camelCase(target);
      }
      target = info.bindable.name;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, 'IsProperty'), target, BindingMode.toView);
  }
}

@bindingCommand('from-view')
export class FromViewBindingCommand implements BindingCommandInstance {
  public get type(): 'None' { return 'None'; }

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
      if (value === '' && info.def.type === 'Element') {
        value = camelCase(target);
      }
      target = info.bindable.name;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, 'IsProperty'), target, BindingMode.fromView);
  }
}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements BindingCommandInstance {
  public get type(): 'None' { return 'None'; }

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
      if (value === '' && info.def.type === 'Element') {
        value = camelCase(target);
      }
      target = info.bindable.name;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, 'IsProperty'), target, BindingMode.twoWay);
  }
}

@bindingCommand('bind')
export class DefaultBindingCommand implements BindingCommandInstance {
  public get type(): 'None' { return 'None'; }

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
      if (value === '' && info.def.type === 'Element') {
        value = camelCase(target);
      }
      defaultMode = (info.def as CA).defaultBindingMode;
      mode = bindable.mode === BindingMode.default || bindable.mode == null
        ? defaultMode == null || defaultMode === BindingMode.default
          ? BindingMode.toView
          : defaultMode
        : bindable.mode;
      target = bindable.name;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, 'IsProperty'), target, mode);
  }
}

@bindingCommand('for')
export class ForBindingCommand implements BindingCommandInstance {
  public get type(): 'None' { return 'None'; }

  public static get inject(): unknown[] { return [IAttributeParser]; }

  /** @internal */
  private readonly _attrParser: IAttributeParser;

  public constructor(attrParser: IAttributeParser) {
    this._attrParser = attrParser;
  }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.name;
    const forOf = exprParser.parse(info.attr.rawValue, 'IsIterator');
    let props: MultiAttrInstruction[] = emptyArray;
    if (forOf.semiIdx > -1) {
      const attr = info.attr.rawValue.slice(forOf.semiIdx + 1);
      const i = attr.indexOf(':');
      if (i > -1) {
        const attrName = attr.slice(0, i).trim();
        const attrValue = attr.slice(i + 1).trim();
        const attrSyntax = this._attrParser.parse(attrName, attrValue);
        props = [new MultiAttrInstruction(attrValue, attrSyntax.target, attrSyntax.command)];
      }
    }
    return new IteratorBindingInstruction(forOf, target, props);
  }
}

@bindingCommand('trigger')
export class TriggerBindingCommand implements BindingCommandInstance {
  public get type(): 'IgnoreAttr' { return 'IgnoreAttr'; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new ListenerBindingInstruction(exprParser.parse(info.attr.rawValue, 'IsFunction'), info.attr.target, true, false);
  }
}

@bindingCommand('capture')
export class CaptureBindingCommand implements BindingCommandInstance {
  public get type(): 'IgnoreAttr' { return 'IgnoreAttr'; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new ListenerBindingInstruction(exprParser.parse(info.attr.rawValue, 'IsFunction'), info.attr.target, false, true);
  }
}

/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
@bindingCommand('attr')
export class AttrBindingCommand implements BindingCommandInstance {
  public get type(): 'IgnoreAttr' { return 'IgnoreAttr'; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new AttributeBindingInstruction(info.attr.target, exprParser.parse(info.attr.rawValue, 'IsProperty'), info.attr.target);
  }
}

/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
@bindingCommand('style')
export class StyleBindingCommand implements BindingCommandInstance {
  public get type(): 'IgnoreAttr' { return 'IgnoreAttr'; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new AttributeBindingInstruction('style', exprParser.parse(info.attr.rawValue, 'IsProperty'), info.attr.target);
  }
}

/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
@bindingCommand('class')
export class ClassBindingCommand implements BindingCommandInstance {
  public get type(): 'IgnoreAttr' { return 'IgnoreAttr'; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new AttributeBindingInstruction('class', exprParser.parse(info.attr.rawValue, 'IsProperty'), info.attr.target);
  }
}

/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
@bindingCommand('ref')
export class RefBindingCommand implements BindingCommandInstance {
  public get type(): 'IgnoreAttr' { return 'IgnoreAttr'; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new RefBindingInstruction(exprParser.parse(info.attr.rawValue, 'IsProperty'), info.attr.target);
  }
}

@bindingCommand('...$attrs')
export class SpreadBindingCommand implements BindingCommandInstance {
  public get type(): 'IgnoreAttr' { return 'IgnoreAttr'; }

  public build(_info: ICommandBuildInfo): IInstruction {
    return new SpreadBindingInstruction();
  }
}
