import {
  bindingCommand,
  BindingSymbol,
  getTarget,
  BindingCommandInstance,
  PlainAttributeSymbol,
} from '@aurelia/jit';
import { BindingType, IsBindingBehavior, RefBindingInstruction } from '@aurelia/runtime';
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
export class TriggerBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.TriggerCommand = BindingType.TriggerCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new TriggerBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
@bindingCommand('delegate')
export class DelegateBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.DelegateCommand = BindingType.DelegateCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new DelegateBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
@bindingCommand('capture')
export class CaptureBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.CaptureCommand = BindingType.CaptureCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new CaptureBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
@bindingCommand('attr')
export class AttrBindingCommand implements BindingCommandInstance {
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
export class StyleBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new AttributeBindingInstruction('style', binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
@bindingCommand('class')
export class ClassBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction {
    return new AttributeBindingInstruction('class', binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
@bindingCommand('ref')
export class RefBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty | BindingType.IgnoreCustomAttr = BindingType.IsProperty | BindingType.IgnoreCustomAttr;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): RefBindingInstruction {
    return new RefBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
