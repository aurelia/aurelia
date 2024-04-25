import { IExpressionParser } from '@aurelia/expression-parser';
import { camelCase, emptyArray, firstDefined, getResourceKeyFor, mergeArrays, resolve, resource, resourceBaseName } from '@aurelia/kernel';
// import { oneTime, toView, fromView, twoWay, defaultMode as $defaultMode, type BindingMode } from '../binding/interfaces-bindings';
import { defineMetadata, getAnnotationKeyFor, getDefinitionFromStaticAu, getMetadata } from './utilities-metadata';
import { IAttrMapper } from './attribute-mapper';
import {
  AttributeBindingInstruction,
  IteratorBindingInstruction,
  ListenerBindingInstruction,
  MultiAttrInstruction,
  PropertyBindingInstruction,
  RefBindingInstruction,
  SpreadBindingInstruction,
} from './instructions';
import { aliasRegistration, definitionTypeElement, etIsFunction, etIsIterator, etIsProperty, isString, objectFreeze, singletonRegistration } from './utilities';

import type {
  Constructable,
  IContainer,
  IServiceLocator,
  PartialResourceDefinition,
  ResourceDefinition,
  ResourceType,
} from '@aurelia/kernel';
import { AttrSyntax, IAttributeParser } from './attribute-pattern';
import { ErrorNames, createMappedError } from './errors';
import { IAttributeComponentDefinition, IElementComponentDefinition, IComponentBindablePropDefinition } from './interfaces-template-compiler';
import type { IInstruction } from './instructions';
import { BindingMode, InternalBindingMode } from './binding-mode';

export type PartialBindingCommandDefinition = PartialResourceDefinition;
export type BindingCommandStaticAuDefinition = PartialBindingCommandDefinition & {
  type: 'binding-command';
};

export interface IPlainAttrCommandInfo {
  readonly node: Element;
  readonly attr: AttrSyntax;
  readonly bindable: null;
  readonly def: null;
}

export interface IBindableCommandInfo {
  readonly node: Element;
  readonly attr: AttrSyntax;
  readonly bindable: IComponentBindablePropDefinition;
  readonly def: IAttributeComponentDefinition | IElementComponentDefinition;
}

export type ICommandBuildInfo = IPlainAttrCommandInfo | IBindableCommandInfo;

export type BindingCommandInstance<T extends {} = {}> = {
  /**
   * Characteristics of a binding command.
   * - `false`: The normal process (check custom attribute -> check bindable -> command.build()) should take place.
   * - `true`: The binding command wants to take over the processing of an attribute. The template compiler keeps the attribute as is in compilation, instead of executing the normal process.
   */
  ignoreAttr: boolean;
  build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): IInstruction;
} & T;

export type BindingCommandType<T extends Constructable = Constructable> = ResourceType<T, BindingCommandInstance, PartialBindingCommandDefinition>;
export type BindingCommandKind = {
  readonly name: string;
  keyFrom(name: string): string;
  // isType<T>(value: T): value is (T extends Constructable ? BindingCommandType<T> : never);
  define<T extends Constructable>(name: string, Type: T): BindingCommandType<T>;
  define<T extends Constructable>(def: PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
  getAnnotation<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K): PartialBindingCommandDefinition[K] | undefined;
  find(container: IContainer, name: string): BindingCommandDefinition | null;
  get(container: IServiceLocator, name: string): BindingCommandInstance;
};

export type BindingCommandDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext) => BindingCommandType<T>;

/**
 * Decorator to describe a class as a binding command resource
 */
export function bindingCommand(name: string): BindingCommandDecorator;
export function bindingCommand(definition: PartialBindingCommandDefinition): BindingCommandDecorator;
export function bindingCommand(nameOrDefinition: string | PartialBindingCommandDefinition): BindingCommandDecorator {
  return function <T extends Constructable>(target: T, context: ClassDecoratorContext): BindingCommandType<T> {
    context.addInitializer(function (this) {
      BindingCommand.define(nameOrDefinition, target);
    });
    return target as BindingCommandType<T>;
  };
}

export class BindingCommandDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, BindingCommandInstance> {
  private constructor(
    public readonly Type: BindingCommandType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string,
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
    );
  }

  public register(container: IContainer, aliasName?: string | undefined): void {
    const $Type = this.Type;
    const key = typeof aliasName === 'string' ? getCommandKeyFrom(aliasName) : this.key;
    const aliases = this.aliases;

    if (!container.has(key, false)) {
      container.register(
        container.has($Type, false) ? null : singletonRegistration($Type, $Type),
        aliasRegistration($Type, key),
        ...aliases.map(alias => aliasRegistration($Type, getCommandKeyFrom(alias))),
      );
    } /* istanbul ignore next */ else if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[DEV:aurelia] ${createMappedError(ErrorNames.binding_command_existed, this.name)}`);
    }
  }
}

const bindingCommandTypeName = 'binding-command';
const cmdBaseName = /*@__PURE__*/getResourceKeyFor(bindingCommandTypeName);
const getCommandKeyFrom = (name: string): string => `${cmdBaseName}:${name}`;
const getCommandAnnotation = <K extends keyof PartialBindingCommandDefinition>(
  Type: Constructable,
  prop: K,
): PartialBindingCommandDefinition[K] | undefined =>
  getMetadata<PartialBindingCommandDefinition[K]>(getAnnotationKeyFor(prop), Type);

export const BindingCommand = objectFreeze<BindingCommandKind>({
  name: cmdBaseName,
  keyFrom: getCommandKeyFrom,
  // isType<T>(value: T): value is (T extends Constructable ? BindingCommandType<T> : never) {
  //   return isFunction(value) && hasOwnMetadata(cmdBaseName, value);
  // },
  define<T extends Constructable<BindingCommandInstance>>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): T & BindingCommandType<T> {
    const definition = BindingCommandDefinition.create(nameOrDef, Type as Constructable<BindingCommandInstance>);
    const $Type = definition.Type as BindingCommandType<T>;

    // registration of resource name is a requirement for the resource system in kernel (module-loader)
    defineMetadata(definition, $Type, cmdBaseName, resourceBaseName);

    return $Type;
  },
  getAnnotation: getCommandAnnotation,
  find(container, name) {
    const Type = container.find<BindingCommandType>(bindingCommandTypeName, name);
    return Type == null
      ? null
      : getMetadata<BindingCommandDefinition>(cmdBaseName, Type) ?? getDefinitionFromStaticAu<BindingCommandDefinition, BindingCommandType>(Type, bindingCommandTypeName, BindingCommandDefinition.create) ?? null;
  },
  get(container, name) {
    if (__DEV__) {
      try {
        return container.get<BindingCommandInstance>(resource(getCommandKeyFrom(name)));
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.log(`\n\n\n[DEV:aurelia] Cannot retrieve binding command with name\n\n\n\n\n`, name);
        throw ex;
      }
    }
    return container.get<BindingCommandInstance>(resource(getCommandKeyFrom(name)));
  },
});

export class OneTimeBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'one-time',
  };

  public get ignoreAttr() { return false; }

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
      if (value === '' && info.def.type === definitionTypeElement) {
        value = camelCase(target);
      }
      target = info.bindable.name;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, etIsProperty), target, InternalBindingMode.oneTime);
  }
}

export class ToViewBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'to-view',
  };
  public get ignoreAttr() { return false; }

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
      if (value === '' && info.def.type === definitionTypeElement) {
        value = camelCase(target);
      }
      target = info.bindable.name;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, etIsProperty), target, InternalBindingMode.toView);
  }
}

export class FromViewBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'from-view',
  };
  public get ignoreAttr() { return false; }

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
      if (value === '' && info.def.type === definitionTypeElement) {
        value = camelCase(target);
      }
      target = info.bindable.name;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, etIsProperty), target, InternalBindingMode.fromView);
  }
}

export class TwoWayBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'two-way',
  };
  public get ignoreAttr() { return false; }

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
      if (value === '' && info.def.type === definitionTypeElement) {
        value = camelCase(target);
      }
      target = info.bindable.name;
    }
    return new PropertyBindingInstruction(exprParser.parse(value, etIsProperty), target, InternalBindingMode.twoWay);
  }
}

export class DefaultBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'bind',
  };
  public get ignoreAttr() { return false; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction {
    const attr = info.attr;
    const bindable = info.bindable;
    let defDefaultMode: string | number;
    let mode: string | number;
    let target = attr.target;
    let value = attr.rawValue;
    if (bindable == null) {
      mode = attrMapper.isTwoWay(info.node, target) ? InternalBindingMode.twoWay : InternalBindingMode.toView;
      target = attrMapper.map(info.node, target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      // if it looks like: <my-el value.bind>
      // it means        : <my-el value.bind="value">
      if (value === '' && info.def.type === definitionTypeElement) {
        value = camelCase(target);
      }
      defDefaultMode = (info.def as IAttributeComponentDefinition).defaultBindingMode ?? 0;
      mode = bindable.mode === 0 || bindable.mode == null
        ? defDefaultMode == null || defDefaultMode === 0
          ? InternalBindingMode.toView
          : defDefaultMode
        : bindable.mode;
      target = bindable.name;
    }
    return new PropertyBindingInstruction(
      exprParser.parse(value, etIsProperty),
      target,
      isString(mode)
        ? BindingMode[mode as keyof typeof BindingMode] ?? InternalBindingMode.default
        : mode as BindingMode
    );
  }
}

export class ForBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'for',
  };

  public get ignoreAttr() { return false; }

  /** @internal */
  private readonly _attrParser = resolve(IAttributeParser);

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.name;
    const forOf = exprParser.parse(info.attr.rawValue, etIsIterator);
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

export class TriggerBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'trigger',
  };
  public get ignoreAttr() { return true; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new ListenerBindingInstruction(
      exprParser.parse(info.attr.rawValue, etIsFunction),
      info.attr.target,
      false,
      info.attr.parts?.[2] ?? null
    );
  }
}

export class CaptureBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'capture',
  };
  public get ignoreAttr() { return true; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new ListenerBindingInstruction(
      exprParser.parse(info.attr.rawValue, etIsFunction),
      info.attr.target,
      true,
      info.attr.parts?.[2] ?? null
    );
  }
}

/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
export class AttrBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'attr',
  };
  public get ignoreAttr() { return true; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new AttributeBindingInstruction(info.attr.target, exprParser.parse(info.attr.rawValue, etIsProperty), info.attr.target);
  }
}

/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
export class StyleBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'style',
  };
  public get ignoreAttr() { return true; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new AttributeBindingInstruction('style', exprParser.parse(info.attr.rawValue, etIsProperty), info.attr.target);
  }
}

/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
export class ClassBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'class',
  };
  public get ignoreAttr() { return true; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new AttributeBindingInstruction('class', exprParser.parse(info.attr.rawValue, etIsProperty), info.attr.target);
  }
}

/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
export class RefBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: 'ref',
  };
  public get ignoreAttr() { return true; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new RefBindingInstruction(exprParser.parse(info.attr.rawValue, etIsProperty), info.attr.target);
  }
}

export class SpreadBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: bindingCommandTypeName,
    name: '...$attrs',
  };
  public get ignoreAttr() { return true; }

  public build(_info: ICommandBuildInfo): IInstruction {
    return new SpreadBindingInstruction();
  }
}
