import { IContainer } from '@aurelia/kernel';
import {
  AttrSyntax,
  BindingSymbol,
  getTarget,
  BindingCommandInstance,
  PlainAttributeSymbol,
} from '@aurelia/jit';
import {
  BindingMode,
  BindingType,
  ICallBindingInstruction,
  IController,
  IDOM,
  IExpressionParser,
  IInstructionRenderer,
  instructionRenderer,
  IObserverLocator,
  IsBindingBehavior,
  LifecycleFlags
} from '@aurelia/runtime';
import { TranslationBinding } from './translation-binding';

export const TranslationInstructionType = 'tt';

export class TranslationAttributePattern {
  [key: string]: ((rawName: string, rawValue: string, parts: string[]) => AttrSyntax);

  public static registerAlias(alias: string) {
    this.prototype[alias] = function (rawName: string, rawValue: string, parts: string[]): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, '', alias);
    };
  }
}

export class TranslationBindingInstruction {
  public readonly type: string = TranslationInstructionType;
  public mode: BindingMode.toView = BindingMode.toView;

  public constructor(
    public from: IsBindingBehavior,
    public to: string,
  ) { }
}

export class TranslationBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.CustomCommand = BindingType.CustomCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationBindingInstruction {
    return new TranslationBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@instructionRenderer(TranslationInstructionType)
export class TranslationBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) { }

  public render(flags: LifecycleFlags, dom: IDOM, context: IContainer, renderable: IController, target: HTMLElement, instruction: ICallBindingInstruction): void {
    TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction });
  }
}

export const TranslationBindInstructionType = 'tbt';

export class TranslationBindAttributePattern {
  [key: string]: ((rawName: string, rawValue: string, parts: string[]) => AttrSyntax);

  public static registerAlias(alias: string) {
    const bindPattern = `${alias}.bind`;
    this.prototype[bindPattern] = function (rawName: string, rawValue: string, parts: string[]): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, parts[1], bindPattern);
    };
  }
}

export class TranslationBindBindingInstruction {
  public readonly type: string = TranslationBindInstructionType;
  public mode: BindingMode.toView = BindingMode.toView;

  public constructor(
    public from: IsBindingBehavior,
    public to: string,
  ) { }
}

export class TranslationBindBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.BindCommand = BindingType.BindCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationBindBindingInstruction {
    return new TranslationBindBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@instructionRenderer(TranslationBindInstructionType)
export class TranslationBindBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) { }

  public render(flags: LifecycleFlags, dom: IDOM, context: IContainer, renderable: IController, target: HTMLElement, instruction: ICallBindingInstruction): void {
    TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction });
  }
}
