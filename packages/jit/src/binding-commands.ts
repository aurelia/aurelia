import {
  AttributeInstruction,
  BindingMode,
  BindingType,
  CallBindingInstruction,
  ForOfStatement,
  FromViewBindingInstruction,
  IsBindingBehavior,
  IteratorBindingInstruction,
  OneTimeBindingInstruction,
  ToViewBindingInstruction,
  TwoWayBindingInstruction,
} from '@aurelia/runtime';
import {
  bindingCommand,
  getTarget,
  BindingCommandInstance,
} from './binding-command';
import {
  BindingSymbol,
  PlainAttributeSymbol,
} from './semantic-model';

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
