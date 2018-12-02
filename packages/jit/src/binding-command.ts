import { Class, Constructable, IContainer, IRegistry, Registration, Writable } from '@aurelia/kernel';
import {
  BindingType,
  CallBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  ForOfStatement,
  FromViewBindingInstruction,
  HydrateTemplateController,
  IResourceDefinition,
  IResourceKind,
  IResourceType,
  IsBindingBehavior,
  ITemplateDefinition,
  IteratorBindingInstruction,
  OneTimeBindingInstruction,
  SetPropertyInstruction,
  TargetedInstruction,
  ToViewBindingInstruction,
  TriggerBindingInstruction,
  TwoWayBindingInstruction
} from '@aurelia/runtime';
import { AttributeSymbol, SymbolKind, TemplateControllerAttributeSymbol } from './semantic-model';

export interface IBindingCommand {
  bindingType: BindingType;
  compile($symbol: AttributeSymbol): TargetedInstruction;
  handles?($symbol: AttributeSymbol): boolean;
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

function defaultHandles(this: IBindingCommand, $symbol: AttributeSymbol): boolean {
  return $symbol.kind !== SymbolKind.templateControllerAttribute;
}

export interface OneTimeBindingCommand extends IBindingCommand {}

@bindingCommand('one-time')
export class OneTimeBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.OneTimeCommand;

  constructor() {
    this.bindingType = BindingType.OneTimeCommand;
  }

  public compile($symbol: AttributeSymbol): TargetedInstruction {
    switch ($symbol.kind) {
      case SymbolKind.customAttribute:
      case SymbolKind.templateControllerAttribute:
        return new OneTimeBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.info.bindable.propName);
      case SymbolKind.elementBinding:
        return new OneTimeBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.info.propName);
      default:
        return new OneTimeBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.syntax.target);
    }
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

  public compile($symbol: AttributeSymbol): TargetedInstruction {
    switch ($symbol.kind) {
      case SymbolKind.customAttribute:
      case SymbolKind.templateControllerAttribute:
        return new ToViewBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.info.bindable.propName);
      case SymbolKind.elementBinding:
        return new ToViewBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.info.propName);
      default:
        return new ToViewBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.syntax.target);
    }
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

  public compile($symbol: AttributeSymbol): TargetedInstruction {
    switch ($symbol.kind) {
      case SymbolKind.customAttribute:
      case SymbolKind.templateControllerAttribute:
        return new FromViewBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.info.bindable.propName);
      case SymbolKind.elementBinding:
        return new FromViewBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.info.propName);
      default:
        return new FromViewBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.syntax.target);
    }
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

  public compile($symbol: AttributeSymbol): TargetedInstruction {
    switch ($symbol.kind) {
      case SymbolKind.customAttribute:
      case SymbolKind.templateControllerAttribute:
        return new TwoWayBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.info.bindable.propName);
      case SymbolKind.elementBinding:
        return new TwoWayBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.info.propName);
      default:
        return new TwoWayBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.syntax.target);
    }
  }
}

// Not bothering to throw on non-existing modes, should never happen anyway.
// Keeping all array elements of the same type for better optimizeability.
const compileMode = ['', '$1', '$2', '', '$4', '', '$6'];
const compileCommand = {
  'bind': '$2',
  'one-time': '$1',
  'to-view': '$2',
  'from-view': '$4',
  'two-way': '$6',
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

  public compile($symbol: AttributeSymbol): TargetedInstruction {
    switch ($symbol.kind) {
      case SymbolKind.customAttribute:
      case SymbolKind.templateControllerAttribute:
        return this[compileMode[$symbol.info.bindable.mode]]($symbol);
      case SymbolKind.attributeBinding:
        return this[compileCommand[$symbol.syntax.command]]($symbol);
      case SymbolKind.elementBinding:
        return this[compileMode[$symbol.info.mode]]($symbol);
      case SymbolKind.boundAttribute:
        return this[compileCommand[$symbol.syntax.command]]($symbol);
    }
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

  public compile($symbol: AttributeSymbol): TargetedInstruction {
    return new TriggerBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.syntax.target);
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

  public compile($symbol: AttributeSymbol): TargetedInstruction {
    return new DelegateBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.syntax.target);
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

  public compile($symbol: AttributeSymbol): TargetedInstruction {
    return new CaptureBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.syntax.target);
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

  public compile($symbol: AttributeSymbol): TargetedInstruction {
    return new CallBindingInstruction($symbol.expr as IsBindingBehavior, $symbol.syntax.target);
  }
}

@bindingCommand('for')
export class ForBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.ForCommand;

  constructor() {
    this.bindingType = BindingType.ForCommand;
  }

  public compile($symbol: TemplateControllerAttributeSymbol): TargetedInstruction {
    const def: ITemplateDefinition = {
      name: 'repeat',
      template: $symbol.targetSurrogate.element,
      instructions: []
    };
    const instructions = [
      new IteratorBindingInstruction($symbol.expr as ForOfStatement, 'items'),
      new SetPropertyInstruction('item', 'local')
    ];
    return new HydrateTemplateController(def, 'repeat', instructions, false);
  }

  public handles($symbol: AttributeSymbol): boolean {
    return $symbol.syntax.target === 'repeat';
  }
}
