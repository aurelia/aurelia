import {
  bindingCommand,
  BindingSymbol,
  getTarget,
  IBindingCommand,
  PlainAttributeSymbol,
} from '@aurelia/jit';
import { BindingType, IsBindingBehavior } from '@aurelia/runtime';
import {
  AttributeBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  HTMLAttributeInstruction,
  TriggerBindingInstruction
} from '@aurelia/runtime-html';

/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
@bindingCommand('trigger')
export class TriggerBindingCommand implements IBindingCommand {
  public readonly bindingType: BindingType.TriggerCommand = BindingType.TriggerCommand;
  public readonly override: boolean = true;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new TriggerBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
@bindingCommand('delegate')
export class DelegateBindingCommand implements IBindingCommand {
  public readonly bindingType: BindingType.DelegateCommand = BindingType.DelegateCommand;
  public readonly override: boolean = true;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new DelegateBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
@bindingCommand('capture')
export class CaptureBindingCommand implements IBindingCommand {
  public readonly bindingType: BindingType.CaptureCommand = BindingType.CaptureCommand;
  public readonly override: boolean = true;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new CaptureBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
@bindingCommand('attr')
export class AttrBindingCommand implements IBindingCommand {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    const target = getTarget(binding, false);
    return new AttributeBindingInstruction(target, binding.expression as IsBindingBehavior, target);
  }
}

/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
@bindingCommand('style')
export class StyleBindingCommand implements IBindingCommand {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new AttributeBindingInstruction('style', binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
@bindingCommand('class')
export class ClassBindingCommand implements IBindingCommand {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new AttributeBindingInstruction('class', binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
