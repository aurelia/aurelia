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
/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
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
/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
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
/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
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
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
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
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
export class StyleBindingCommand implements IBindingCommand {
  public static readonly register: IRegistry['register'];
  public readonly bindingType: BindingType.IsProperty;

  constructor() {
    this.bindingType = BindingType.IsProperty;
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new AttributeBindingInstruction('style', binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
BindingCommandResource.define('style', StyleBindingCommand);

export interface ClassBindingCommand extends IBindingCommand {}
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
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
