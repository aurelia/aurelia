import { attributePattern, AttrSyntax, bindingCommand, BindingSymbol, getTarget, IBindingCommand, PlainAttributeSymbol } from '@aurelia/jit';
import { addBinding, BindingMode, BindingType, ensureExpression, ICallBindingInstruction, IController, IDOM, IExpressionParser, IInstructionRenderer, instructionRenderer, IObserverLocator, IRenderContext, IsBindingBehavior, LifecycleFlags } from '@aurelia/runtime';
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

  constructor(public from: IsBindingBehavior, public to: string) {
  }
}

@bindingCommand(attribute)
export class TranslationParametersBindingCommand implements IBindingCommand {
  public readonly bindingType: BindingType.BindCommand = BindingType.BindCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationParametersBindingInstruction {
    return new TranslationParametersBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@instructionRenderer(TranslationParametersInstructionType)
export class TranslationParametersBindingRenderer implements IInstructionRenderer {
  constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) { }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ICallBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.BindCommand);
    let binding: TranslationBinding | undefined = renderable.bindings &&
      renderable.bindings.find((b) => b instanceof TranslationBinding && b.target === target) as TranslationBinding;
    if (!binding) {
      binding = new TranslationBinding(target, this.observerLocator, context);
      addBinding(renderable, binding);
    }
    binding.parametersExpr = expr;
  }
}
