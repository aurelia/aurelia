import { camelCase, IContainer } from '@aurelia/kernel';
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
  IAttrSyntaxTransformer,
} from '@aurelia/runtime-html';

import type {
  CallBindingInstruction,
  BindingSymbol,
  BindingCommandInstance,
  PlainAttributeSymbol,
} from '@aurelia/runtime-html';
import { ICommandBuildInfo } from '@aurelia/runtime-html/dist/resources/binding-command';

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

  public static get inject() { return [IAttrSyntaxTransformer]; }
  public constructor(private readonly t: IAttrSyntaxTransformer) {}

  public compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationParametersBindingInstruction {
    return new TranslationParametersBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }

  public build(info: ICommandBuildInfo): TranslationParametersBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = this.t.map(info.node, info.attr.target)
        // if the transformer doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.property;
    }
    return new TranslationParametersBindingInstruction(info.expr as IsBindingBehavior, target);
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
