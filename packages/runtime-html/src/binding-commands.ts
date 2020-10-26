import {
  BindingType,
  IsBindingBehavior,
  BindingMode,
  ForOfStatement,
} from '@aurelia/runtime';
import { bindingCommand, BindingCommandInstance, getTarget } from './binding-command';
import {
  AttributeBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  OneTimeBindingInstruction,
  TriggerBindingInstruction,
  CallBindingInstruction,
  FromViewBindingInstruction,
  IteratorBindingInstruction,
  ToViewBindingInstruction,
  TwoWayBindingInstruction,
  AttributeInstruction,
  RefBindingInstruction,
} from './instructions';
import { BindingSymbol, PlainAttributeSymbol } from './semantic-model';

@bindingCommand('one-time')
export class OneTimeBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.OneTimeCommand = BindingType.OneTimeCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new OneTimeBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@bindingCommand('to-view')
export class ToViewBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.ToViewCommand = BindingType.ToViewCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new ToViewBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@bindingCommand('from-view')
export class FromViewBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.FromViewCommand = BindingType.FromViewCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new FromViewBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@bindingCommand('two-way')
export class TwoWayBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.TwoWayCommand = BindingType.TwoWayCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new TwoWayBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@bindingCommand('bind')
export class DefaultBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.BindCommand = BindingType.BindCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    let mode: BindingMode = BindingMode.default;
    if (binding instanceof BindingSymbol) {
      mode = binding.bindable.mode;
    } else {
      const command = binding.syntax.command;
      switch (command) {
        case 'bind':
        case 'to-view':
          mode = BindingMode.toView;
          break;
        case 'one-time':
          mode = BindingMode.oneTime;
          break;
        case 'from-view':
          mode = BindingMode.fromView;
          break;
        case 'two-way':
          mode = BindingMode.twoWay;
          break;
      }
    }

    switch (mode) {
      case BindingMode.default:
      case BindingMode.toView:
        return ToViewBindingCommand.prototype.compile(binding);
      case BindingMode.oneTime:
        return OneTimeBindingCommand.prototype.compile(binding);
      case BindingMode.fromView:
        return FromViewBindingCommand.prototype.compile(binding);
      case BindingMode.twoWay:
        return TwoWayBindingCommand.prototype.compile(binding);
    }
  }
}

@bindingCommand('call')
export class CallBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.CallCommand = BindingType.CallCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new CallBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, true));
  }
}

@bindingCommand('for')
export class ForBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.ForCommand = BindingType.ForCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new IteratorBindingInstruction(binding.expression as ForOfStatement, getTarget(binding, false));
  }
}

/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
@bindingCommand('trigger')
export class TriggerBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.TriggerCommand = BindingType.TriggerCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new TriggerBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
@bindingCommand('delegate')
export class DelegateBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.DelegateCommand = BindingType.DelegateCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new DelegateBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
@bindingCommand('capture')
export class CaptureBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.CaptureCommand = BindingType.CaptureCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new CaptureBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
@bindingCommand('attr')
export class AttrBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
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

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new AttributeBindingInstruction('style', binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
@bindingCommand('class')
export class ClassBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty = BindingType.IsProperty;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction {
    return new AttributeBindingInstruction('class', binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) afterAttachChildren to an element
 */
@bindingCommand('ref')
export class RefBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty | BindingType.IgnoreCustomAttr = BindingType.IsProperty | BindingType.IgnoreCustomAttr;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): RefBindingInstruction {
    return new RefBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
