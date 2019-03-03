import {
  BindingCommandResource,
  BindingSymbol,
  getTarget,
  IBindingCommand,
  PlainAttributeSymbol
} from '@aurelia/jit';
import { IRegistry } from '@aurelia/kernel';
import { BindingType, IsBindingBehavior } from '@aurelia/runtime';
import {
  AttributeBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  HTMLAttributeInstruction,
  TriggerBindingInstruction
} from '@aurelia/runtime-html';

export interface TriggerBindingCommand extends IBindingCommand {}
export class TriggerBindingCommand implements IBindingCommand {
  public static readonly register: IRegistry['register'];
  public readonly bindingType: BindingType.TriggerCommand;

  constructor() {
    this.bindingType = BindingType.TriggerCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new TriggerBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
BindingCommandResource.define('trigger', TriggerBindingCommand);

export interface DelegateBindingCommand extends IBindingCommand {}
export class DelegateBindingCommand implements IBindingCommand {
  public static readonly register: IRegistry['register'];
  public readonly bindingType: BindingType.DelegateCommand;

  constructor() {
    this.bindingType = BindingType.DelegateCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new DelegateBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
BindingCommandResource.define('delegate', DelegateBindingCommand);

export interface CaptureBindingCommand extends IBindingCommand {}
export class CaptureBindingCommand implements IBindingCommand {
  public static readonly register: IRegistry['register'];
  public readonly bindingType: BindingType.CaptureCommand;

  constructor() {
    this.bindingType = BindingType.CaptureCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new CaptureBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
BindingCommandResource.define('capture', CaptureBindingCommand);

export interface AttrBindingCommand extends IBindingCommand {}
export class AttrBindingCommand implements IBindingCommand {
  public static readonly register: IRegistry['register'];
  public readonly bindingType: BindingType.IsProperty;

  constructor() {
    this.bindingType = BindingType.IsProperty;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    const target = getTarget(binding, false);
    return new AttributeBindingInstruction(target, binding.expression as IsBindingBehavior, target);
  }
}
BindingCommandResource.define('attr', AttrBindingCommand);

export interface StyleBindingCommand extends IBindingCommand {}
export class StyleBindingCommand implements IBindingCommand {
  public static readonly register: IRegistry['register'];
  public readonly bindingType: BindingType.IsProperty;

  constructor() {
    this.bindingType = BindingType.IsProperty;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new AttributeBindingInstruction('style', binding.expression as IsBindingBehavior, getTarget(binding, true));
  }
}
BindingCommandResource.define('style', StyleBindingCommand);

export interface ClassBindingCommand extends IBindingCommand {}
export class ClassBindingCommand implements IBindingCommand {
  public static readonly register: IRegistry['register'];
  public readonly bindingType: BindingType.IsProperty;

  constructor() {
    this.bindingType = BindingType.IsProperty;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new AttributeBindingInstruction('class', binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
BindingCommandResource.define('class', ClassBindingCommand);
