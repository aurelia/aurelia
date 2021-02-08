import { IContainer } from '@aurelia/kernel';
import { TranslationBinding } from './translation-binding.js';
import {
  BindingMode,
  BindingType,
  IHydratableController,
  IExpressionParser,
  IRenderer,
  renderer,
  IObserverLocator,
  IsBindingBehavior,
  LifecycleFlags,
  attributePattern,
  AttrSyntax,
  bindingCommand,
  getTarget,
  IPlatform,
} from '@aurelia/runtime-html';

import type {
  CallBindingInstruction,
  BindingSymbol,
  BindingCommandInstance,
  PlainAttributeSymbol,
} from '@aurelia/runtime-html';

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

  public constructor(
    public from: IsBindingBehavior,
    public to: string,
  ) {}
}

@bindingCommand(attribute)
export class TranslationParametersBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.BindCommand = BindingType.BindCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationParametersBindingInstruction {
    return new TranslationParametersBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@renderer(TranslationParametersInstructionType)
export class TranslationParametersBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
    @IPlatform private readonly platform: IPlatform,
  ) { }

  public render(
    flags: LifecycleFlags,
    context: IContainer,
    controller: IHydratableController,
    target: HTMLElement,
    instruction: CallBindingInstruction,
  ): void {
    TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, controller: controller, target, instruction, isParameterContext: true, platform: this.platform });
  }
}
