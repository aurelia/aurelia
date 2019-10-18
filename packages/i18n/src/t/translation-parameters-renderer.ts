import {
  attributePattern,
  AttrSyntax,
  bindingCommand,
  BindingSymbol,
  getTarget,
  BindingCommandInstance,
  PlainAttributeSymbol
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
  IRenderContext,
  IsBindingBehavior,
  LifecycleFlags
} from '@aurelia/runtime';
import { TranslationBinding } from './translation-binding';

export const TranslationParametersInstructionType = 'tpt';
// `.bind` part is needed here only for vCurrent compliance
const attribute = 't-params.bind';

@attributePattern({ pattern: attribute, symbols: '' })
export class TranslationParametersAttributePattern {
  public [attribute](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, '', attribute);
  }
}

export class TranslationParametersBindingInstruction {
  public readonly type: string = TranslationParametersInstructionType;
  public mode: BindingMode.toView = BindingMode.toView;

  public constructor(public from: IsBindingBehavior, public to: string) {
  }
}

@bindingCommand(attribute)
export class TranslationParametersBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.BindCommand = BindingType.BindCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationParametersBindingInstruction {
    return new TranslationParametersBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@instructionRenderer(TranslationParametersInstructionType)
export class TranslationParametersBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) { }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ICallBindingInstruction): void {
    TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction, isParameterContext: true });
  }
}
