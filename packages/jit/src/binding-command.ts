import { Class, Constructable, IContainer, IRegistry, Registration, Writable } from '@aurelia/kernel';
import {
  BindingMode,
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
import { PotentialBindingCommandAttributeSymbol, SymbolKind, TemplateControllerAttributeSymbol } from './semantic-model-2';

export interface IBindingCommand {
  compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction;
  handles?($symbol: PotentialBindingCommandAttributeSymbol): boolean;
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

function defaultHandles(this: IBindingCommand, $symbol: PotentialBindingCommandAttributeSymbol): boolean {
  return $symbol.kind !== SymbolKind.templateControllerAttribute;
}

export interface OneTimeBindingCommand extends IBindingCommand {}

@bindingCommand('one-time')
export class OneTimeBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];

  public compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction {
    return new OneTimeBindingInstruction(<IsBindingBehavior>$symbol.expr, $symbol.syntax.target);
  }
}

export interface ToViewBindingCommand extends IBindingCommand {}

@bindingCommand('to-view')
export class ToViewBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];

  public compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction {
    return new ToViewBindingInstruction(<IsBindingBehavior>$symbol.expr, $symbol.syntax.target);
  }
}

export interface FromViewBindingCommand extends IBindingCommand {}

@bindingCommand('from-view')
export class FromViewBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];

  public compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction {
    return new FromViewBindingInstruction(<IsBindingBehavior>$symbol.expr, $symbol.syntax.target);
  }
}

export interface TwoWayBindingCommand extends IBindingCommand {}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];

  public compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction {
    return new TwoWayBindingInstruction(<IsBindingBehavior>$symbol.expr, $symbol.syntax.target);
  }
}

// Not bothering to throw on non-existing modes, should never happen anyway.
// Keeping all array elements of the same type for better optimizeability.
const compileMode = ['', '$1', '$2', '', '$4', '', '$6'];

export interface DefaultBindingCommand extends IBindingCommand {}

@bindingCommand('bind')
export class DefaultBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public $1: typeof OneTimeBindingCommand.prototype.compile;
  public $2: typeof ToViewBindingCommand.prototype.compile;
  public $4: typeof FromViewBindingCommand.prototype.compile;
  public $6: typeof TwoWayBindingCommand.prototype.compile;

  constructor() {
    this.$1 = OneTimeBindingCommand.prototype.compile;
    this.$2 = ToViewBindingCommand.prototype.compile;
    this.$4 = FromViewBindingCommand.prototype.compile;
    this.$6 = TwoWayBindingCommand.prototype.compile;
  }

  public compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction {
    return this[compileMode[BindingMode.toView]]($symbol); //TODO: temp hard-coded, need to fix again
  }
}

export interface TriggerBindingCommand extends IBindingCommand {}

@bindingCommand('trigger')
export class TriggerBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];

  public compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction {
    return new TriggerBindingInstruction(<IsBindingBehavior>$symbol.expr, $symbol.syntax.target);
  }
}

export interface DelegateBindingCommand extends IBindingCommand {}

@bindingCommand('delegate')
export class DelegateBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];

  public compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction {
    return new DelegateBindingInstruction(<IsBindingBehavior>$symbol.expr, $symbol.syntax.target);
  }
}

export interface CaptureBindingCommand extends IBindingCommand {}

@bindingCommand('capture')
export class CaptureBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];

  public compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction {
    return new CaptureBindingInstruction(<IsBindingBehavior>$symbol.expr, $symbol.syntax.target);
  }
}

export interface CallBindingCommand extends IBindingCommand {}

@bindingCommand('call')
export class CallBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];

  public compile($symbol: PotentialBindingCommandAttributeSymbol): TargetedInstruction {
    return new CallBindingInstruction(<IsBindingBehavior>$symbol.expr, $symbol.syntax.target);
  }
}

@bindingCommand('for')
export class ForBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];

  public compile($symbol: TemplateControllerAttributeSymbol): TargetedInstruction {
    const def: ITemplateDefinition = {
      name: 'repeat',
      template: $symbol.targetSurrogate.element,
      instructions: []
    };
    const instructions = [
      new IteratorBindingInstruction(<ForOfStatement>$symbol.expr, 'items'),
      new SetPropertyInstruction('item', 'local')
    ];
    return new HydrateTemplateController(def, 'repeat', instructions, false);
  }

  public handles($symbol: PotentialBindingCommandAttributeSymbol): boolean {
    return $symbol.syntax.target === 'repeat';
  }
}
