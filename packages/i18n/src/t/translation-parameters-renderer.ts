import { camelCase } from '@aurelia/kernel';
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
  attributePattern,
  AttrSyntax,
  bindingCommand,
  IPlatform,
  IAttrMapper,
  ICommandBuildInfo,
} from '@aurelia/runtime-html';

import type {
  CallBindingInstruction,
  BindingCommandInstance,
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
  public readonly type: BindingType.BindCommand = BindingType.BindCommand;

  public static inject = [IAttrMapper, IExpressionParser];
  public constructor(
    private readonly m: IAttrMapper,
    private readonly xp: IExpressionParser,
  ) {}

  public build(info: ICommandBuildInfo): TranslationParametersBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    if (info.bindable == null) {
      target = this.m.map(info.node, target)
        // if the transformer doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      target = info.bindable.property;
    }
    return new TranslationParametersBindingInstruction(this.xp.parse(attr.rawValue, BindingType.BindCommand), target);
  }
}

@renderer(TranslationParametersInstructionType)
export class TranslationParametersBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
    @IPlatform private readonly p: IPlatform,
  ) { }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: CallBindingInstruction,
  ): void {
    TranslationBinding.create({
      parser: this.parser,
      observerLocator: this.oL,
      context: renderingCtrl.container,
      controller: renderingCtrl,
      target,
      instruction,
      isParameterContext: true,
      platform: this.p
    });
  }
}
