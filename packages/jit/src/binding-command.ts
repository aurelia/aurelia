import { Class, Constructable, IContainer, IRegistry, PLATFORM, Registration, Writable } from '@aurelia/kernel';
import {
  AttributeInstruction,
  BindingMode,
  BindingType,
  CallBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  ForOfStatement,
  FromViewBindingInstruction,
  IResourceDefinition,
  IResourceKind,
  IResourceType,
  IsBindingBehavior,
  IteratorBindingInstruction,
  OneTimeBindingInstruction,
  ToViewBindingInstruction,
  TriggerBindingInstruction,
  TwoWayBindingInstruction
} from '@aurelia/runtime';
import { BindingSymbol, PlainAttributeSymbol, SymbolFlags } from './template-binder';

export interface IBindingCommand {
  bindingType: BindingType;
  compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}

export interface IBindingCommandDefinition extends IResourceDefinition { }

export interface IBindingCommandType extends IResourceType<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>> { }

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

  return Type;
}

export const BindingCommandResource: IBindingCommandResource = {
  name: 'binding-command',
  keyFrom,
  isType,
  define
};

function getTarget(binding: PlainAttributeSymbol | BindingSymbol, camelCase: boolean): string {
  if ((binding.flags & SymbolFlags.type) === SymbolFlags.isBinding) {
    return (binding as BindingSymbol).bindable.propName;
  } else if (camelCase) {
    return PLATFORM.camelCase((binding as PlainAttributeSymbol).syntax.target);
  } else {
    return (binding as PlainAttributeSymbol).syntax.target;
  }
}

function getMode(binding: PlainAttributeSymbol | BindingSymbol): BindingMode {
  if ((binding.flags & SymbolFlags.type) === SymbolFlags.isBinding) {
    return (binding as BindingSymbol).bindable.mode;
  } else {
    return commandToMode[(binding as PlainAttributeSymbol).syntax.command];
  }
}

export interface OneTimeBindingCommand extends IBindingCommand {}

@bindingCommand('one-time')
export class OneTimeBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.OneTimeCommand;

  constructor() {
    this.bindingType = BindingType.OneTimeCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new OneTimeBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

export interface ToViewBindingCommand extends IBindingCommand {}

@bindingCommand('to-view')
export class ToViewBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.ToViewCommand;

  constructor() {
    this.bindingType = BindingType.ToViewCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new ToViewBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

export interface FromViewBindingCommand extends IBindingCommand {}

@bindingCommand('from-view')
export class FromViewBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.FromViewCommand;

  constructor() {
    this.bindingType = BindingType.FromViewCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new FromViewBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

export interface TwoWayBindingCommand extends IBindingCommand {}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.TwoWayCommand;

  constructor() {
    this.bindingType = BindingType.TwoWayCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new TwoWayBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

// Not bothering to throw on non-existing modes, should never happen anyway.
// Keeping all array elements of the same type for better optimizeability.
const modeToProperty = ['', '$1', '$2', '', '$4', '', '$6'];
const commandToMode = {
  'bind': BindingMode.toView,
  'one-time': BindingMode.oneTime,
  'to-view': BindingMode.toView,
  'from-view': BindingMode.fromView,
  'two-way': BindingMode.twoWay,
};

export interface DefaultBindingCommand extends IBindingCommand {}

@bindingCommand('bind')
export class DefaultBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.BindCommand;
  public $1: typeof OneTimeBindingCommand.prototype.compile;
  public $2: typeof ToViewBindingCommand.prototype.compile;
  public $4: typeof FromViewBindingCommand.prototype.compile;
  public $6: typeof TwoWayBindingCommand.prototype.compile;

  constructor() {
    this.bindingType = BindingType.BindCommand;
    this.$1 = OneTimeBindingCommand.prototype.compile;
    this.$2 = ToViewBindingCommand.prototype.compile;
    this.$4 = FromViewBindingCommand.prototype.compile;
    this.$6 = TwoWayBindingCommand.prototype.compile;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return this[modeToProperty[getMode(binding)]](binding);
  }
}

export interface TriggerBindingCommand extends IBindingCommand {}

@bindingCommand('trigger')
export class TriggerBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.TriggerCommand;

  constructor() {
    this.bindingType = BindingType.TriggerCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new TriggerBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

export interface DelegateBindingCommand extends IBindingCommand {}

@bindingCommand('delegate')
export class DelegateBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.DelegateCommand;

  constructor() {
    this.bindingType = BindingType.DelegateCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new DelegateBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

export interface CaptureBindingCommand extends IBindingCommand {}

@bindingCommand('capture')
export class CaptureBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.CaptureCommand;

  constructor() {
    this.bindingType = BindingType.CaptureCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new CaptureBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

export interface CallBindingCommand extends IBindingCommand {}

@bindingCommand('call')
export class CallBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.CallCommand;

  constructor() {
    this.bindingType = BindingType.CallCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new CallBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, true));
  }
}

@bindingCommand('for')
export class ForBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.ForCommand;

  constructor() {
    this.bindingType = BindingType.ForCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new IteratorBindingInstruction(binding.expression as ForOfStatement, getTarget(binding, false));
  }
}
