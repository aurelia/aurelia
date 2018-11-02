import { Constructable, IContainer, Registration, Writable } from '@aurelia/kernel';
import { BindingType, IExpressionParser, IResourceKind, IResourceType, ITemplateDefinition, TargetedInstruction } from '@aurelia/runtime';
import {
  CallBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  FromViewBindingInstruction,
  HydrateTemplateController,
  IteratorBindingInstruction,
  OneTimeBindingInstruction,
  SetPropertyInstruction,
  ToViewBindingInstruction,
  TriggerBindingInstruction,
  TwoWayBindingInstruction
} from './instructions';
import { IAttributeSymbol } from './semantic-model';

export interface IBindingCommandSource {
  name: string;
}

export interface IBindingCommand {
  compile($symbol: IAttributeSymbol): TargetedInstruction;
  handles($symbol: IAttributeSymbol): boolean;
}

export type IBindingCommandType = IResourceType<IBindingCommandSource, IBindingCommand>;

export function bindingCommand(nameOrSource: string | IBindingCommandSource): any {
  return function<T extends Constructable>(target: T): T & IResourceType<IBindingCommandSource, IBindingCommand> {
    return BindingCommandResource.define(nameOrSource, target);
  };
}

export const BindingCommandResource: IResourceKind<IBindingCommandSource, IBindingCommandType> = {
  name: 'binding-command',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  // tslint:disable-next-line:no-reserved-keywords
  isType<T extends Constructable>(type: T): type is T & IBindingCommandType {
    return (type as T & {kind?: unknown}).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IBindingCommandSource, ctor: T): T & IBindingCommandType {
    const description = typeof nameOrSource === 'string' ? { name: nameOrSource, target: null } : nameOrSource;
    const Type = ctor as T & IBindingCommandType;

    (Type as Writable<IBindingCommandType>).kind = BindingCommandResource;
    (Type as Writable<IBindingCommandType>).description = description;
    Type.register = function(container: IContainer): void {
      container.register(Registration.singleton(Type.kind.keyFrom(description.name), Type));
    };

    const proto = Type.prototype;

    proto.handles = proto.handles || defaultHandles;

    return Type;
  }
};

function defaultHandles(this: IBindingCommand, $symbol: IAttributeSymbol): boolean {
  return !$symbol.isTemplateController;
}

export interface OneTimeBindingCommand extends IBindingCommand {}

@bindingCommand('one-time')
export class OneTimeBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new OneTimeBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.OneTimeCommand), $symbol.to);
  }
}

export interface ToViewBindingCommand extends IBindingCommand {}

@bindingCommand('to-view')
export class ToViewBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new ToViewBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.ToViewCommand), $symbol.to);
  }
}

export interface FromViewBindingCommand extends IBindingCommand {}

@bindingCommand('from-view')
export class FromViewBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new FromViewBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.FromViewCommand), $symbol.to);
  }
}

export interface TwoWayBindingCommand extends IBindingCommand {}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
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
  public $1: typeof OneTimeBindingCommand.prototype.compile;
  public $2: typeof ToViewBindingCommand.prototype.compile;
  public $4: typeof FromViewBindingCommand.prototype.compile;
  public $6: typeof TwoWayBindingCommand.prototype.compile;

  constructor(private parser: IExpressionParser) {}

  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return this[compileMode[$symbol.mode]]($symbol);
  }
}

DefaultBindingCommand.prototype.$1 = OneTimeBindingCommand.prototype.compile;
DefaultBindingCommand.prototype.$2 = ToViewBindingCommand.prototype.compile;
DefaultBindingCommand.prototype.$4 = FromViewBindingCommand.prototype.compile;
DefaultBindingCommand.prototype.$6 = TwoWayBindingCommand.prototype.compile;

export interface TriggerBindingCommand extends IBindingCommand {}

@bindingCommand('trigger')
export class TriggerBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new TriggerBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.TriggerCommand), $symbol.to);
  }
}

export interface DelegateBindingCommand extends IBindingCommand {}

@bindingCommand('delegate')
export class DelegateBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new DelegateBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.DelegateCommand), $symbol.to);
  }
}

export interface CaptureBindingCommand extends IBindingCommand {}

@bindingCommand('capture')
export class CaptureBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new CaptureBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.CaptureCommand), $symbol.to);
  }
}

export interface CallBindingCommand extends IBindingCommand {}

@bindingCommand('call')
export class CallBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    return new CallBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.CallCommand), $symbol.to);
  }
}

@bindingCommand('for')
export class ForBindingCommand implements IBindingCommand {
  public static inject: Function[] = [IExpressionParser];
  constructor(private parser: IExpressionParser) {}
  public compile($symbol: IAttributeSymbol): TargetedInstruction {
    const def: ITemplateDefinition = {
      name: 'repeat',
      template: $symbol.$element.node,
      instructions: []
    };
    return new HydrateTemplateController(def, 'repeat', [
      new IteratorBindingInstruction(this.parser.parse($symbol.rawValue, BindingType.ForCommand), 'items'),
      new SetPropertyInstruction('item', 'local')
    // tslint:disable-next-line:align
    ], false);
  }

  public handles($symbol: IAttributeSymbol): boolean {
    return $symbol.target === 'repeat';
  }
}
