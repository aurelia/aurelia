import { Class, Constructable, IContainer, IIndexable, IRegistry, Registration, Writable } from '@aurelia/kernel';
import {
  BindingType,
  CallBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  FromViewBindingInstruction,
  HydrateTemplateController,
  IExpressionParser,
  IResourceDefinition,
  IResourceKind,
  IResourceType,
  ITemplateDefinition,
  IteratorBindingInstruction,
  OneTimeBindingInstruction,
  SetPropertyInstruction,
  TargetedInstruction,
  ToViewBindingInstruction,
  TriggerBindingInstruction,
  TwoWayBindingInstruction
} from '@aurelia/runtime';
import { IAttributeSymbol } from './semantic-model';

export interface IBindingCommand {
  compile($symbol: IAttributeSymbol): TargetedInstruction;
  handles?($symbol: IAttributeSymbol): boolean;
}

export interface IBindingCommandDefinition extends IResourceDefinition { }

export interface IBindingCommandType extends IResourceType<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand, IIndexable>> { }

export interface IBindingCommandResource extends
  IResourceKind<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>> { }

type BindingCommandDecorator = <TProto, TClass>(target: Class<TProto, TClass> & Partial<IBindingCommandType>) => Class<TProto, TClass> & IBindingCommandType;

function register(this: IBindingCommandType, container: IContainer): void {
  const resourceKey = BindingCommandResource.keyFrom(this.description.name);
  container.register(Registration.singleton(resourceKey, this));
}

export function bindingCommand(name: string): BindingCommandDecorator;
export function bindingCommand(definition: IBindingCommandDefinition): BindingCommandDecorator;
export function bindingCommand(nameOrDefinition: string | IBindingCommandDefinition): BindingCommandDecorator {
  return target => BindingCommandResource.define(nameOrDefinition, target);
}

function keyFrom(this: IBindingCommandResource, name: string): string {
  return `${this.name}:${name}`;
}

function isType<T>(this: IBindingCommandResource, Type: T & Partial<IBindingCommandType>): Type is T & IBindingCommandType {
  return Type.kind === this;
}

function define<T extends Constructable>(this: IBindingCommandResource, name: string, ctor: T): T & IBindingCommandType;
function define<T extends Constructable>(this: IBindingCommandResource, definition: IBindingCommandDefinition, ctor: T): T & IBindingCommandType;
function define<T extends Constructable>(this: IBindingCommandResource, nameOrDefinition: string | IBindingCommandDefinition, ctor: T): T & IBindingCommandType {
  const Type = ctor as T & Writable<IBindingCommandType>;
  const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;

  Type.kind = BindingCommandResource;
  Type.description = description;
  Type.register = register;

  const proto = Type.prototype;

  proto.handles = proto.handles || defaultHandles;

  return Type;
}

export const BindingCommandResource: IBindingCommandResource = {
  name: 'binding-command',
  keyFrom,
  isType,
  define
};

function defaultHandles(this: IBindingCommand, $symbol: IAttributeSymbol): boolean {
  return !$symbol.isTemplateController;
}

export interface OneTimeBindingCommand extends IBindingCommand {}

@bindingCommand('one-time')
export class OneTimeBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new OneTimeBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.OneTimeCommand), $symbol.to);
  }
}

export interface ToViewBindingCommand extends IBindingCommand {}

@bindingCommand('to-view')
export class ToViewBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new ToViewBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.ToViewCommand), $symbol.to);
  }
}

export interface FromViewBindingCommand extends IBindingCommand {}

@bindingCommand('from-view')
export class FromViewBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new FromViewBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.FromViewCommand), $symbol.to);
  }
}

export interface TwoWayBindingCommand extends IBindingCommand {}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new TwoWayBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.TwoWayCommand), $symbol.to);
  }
}

// Not bothering to throw on non-existing modes, should never happen anyway.
// Keeping all array elements of the same type for better optimizeability.
const compileMode = ['', '$1', '$2', '', '$4', '', '$6'];

export interface DefaultBindingCommand extends IBindingCommand {}

@bindingCommand('bind')
export class DefaultBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];
  public $1: typeof OneTimeBindingCommand.prototype.compile;
  public $2: typeof ToViewBindingCommand.prototype.compile;
  public $4: typeof FromViewBindingCommand.prototype.compile;
  public $6: typeof TwoWayBindingCommand.prototype.compile;

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
    this.$1 = OneTimeBindingCommand.prototype.compile;
    this.$2 = ToViewBindingCommand.prototype.compile;
    this.$4 = FromViewBindingCommand.prototype.compile;
    this.$6 = TwoWayBindingCommand.prototype.compile;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return this[compileMode[$symbol.mode]]($symbol);
  }
}

export interface TriggerBindingCommand extends IBindingCommand {}

@bindingCommand('trigger')
export class TriggerBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new TriggerBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.TriggerCommand), $symbol.to);
  }
}

export interface DelegateBindingCommand extends IBindingCommand {}

@bindingCommand('delegate')
export class DelegateBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new DelegateBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.DelegateCommand), $symbol.to);
  }
}

export interface CaptureBindingCommand extends IBindingCommand {}

@bindingCommand('capture')
export class CaptureBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new CaptureBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.CaptureCommand), $symbol.to);
  }
}

export interface CallBindingCommand extends IBindingCommand {}

@bindingCommand('call')
export class CallBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new CallBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.CallCommand), $symbol.to);
  }
}

@bindingCommand('for')
export class ForBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  public static register: IRegistry['register'];

  private parser: IExpressionParser;
  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    const def: ITemplateDefinition = {
      name: 'repeat',
      template: $symbol.$element.node,
      instructions: []
    };
    const instructions = [
      new IteratorBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.ForCommand), 'items'),
      new SetPropertyInstruction('item', 'local')
    ];
    return new HydrateTemplateController(def, 'repeat', instructions, false);
  }

  public handles($symbol: IAttributeSymbol): boolean {
    return $symbol.target === 'repeat';
  }
}
