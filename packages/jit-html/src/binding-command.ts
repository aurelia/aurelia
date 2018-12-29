import {
  bindingCommand,
  BindingSymbol,
  getTarget,
  IBindingCommand,
  PlainAttributeSymbol
} from '@aurelia/jit';
import { IRegistry } from '@aurelia/kernel';
import { BindingType, IsBindingBehavior } from '@aurelia/runtime';
import {
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  HTMLAttributeInstruction,
  TriggerBindingInstruction
} from '@aurelia/runtime-html';

export interface TriggerBindingCommand extends IBindingCommand {}

@bindingCommand('trigger')
export class TriggerBindingCommand implements IBindingCommand {
  public static register: IRegistry['register'];
  public bindingType: BindingType.TriggerCommand;

  constructor() {
    this.bindingType = BindingType.TriggerCommand;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
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

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
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

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new CaptureBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
