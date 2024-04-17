import { camelCase } from '@aurelia/kernel';
import { TranslationBinding } from './translation-binding';
import {
  IObserverLocator,
} from '@aurelia/runtime';
import { IExpressionParser, type IsBindingBehavior } from '@aurelia/expression-parser';
import {
  IHydratableController,
  IRenderer,
  renderer,
  AttrSyntax,
  IPlatform,
  IAttrMapper,
  ICommandBuildInfo,
  AttributePattern,
} from '@aurelia/runtime-html';

import type {
  BindingMode,
  BindingCommandInstance,
  BindingCommandStaticAuDefinition,
} from '@aurelia/runtime-html';
import { bmToView, etIsProperty } from '../utils';

export const TranslationParametersInstructionType = 'tpt';
// `.bind` part is needed here only for vCurrent compliance
const attribute = 't-params.bind';

export const TranslationParametersAttributePattern = AttributePattern.define(
  [{ pattern: attribute, symbols: '' }],
  class TranslationParametersAttributePattern {
    public [attribute](rawName: string, rawValue: string): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, '', attribute);
    }
  }
);

export class TranslationParametersBindingInstruction {
  public readonly type: string = TranslationParametersInstructionType;
  public mode: typeof BindingMode.toView = bmToView;

  public constructor(
    public from: IsBindingBehavior,
    public to: string,
  ) {}
}

export class TranslationParametersBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: 'binding-command',
    name: attribute,
  };

  public readonly ignoreAttr = false;

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): TranslationParametersBindingInstruction {
    const attr = info.attr;
    let target = attr.target;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, target)
        // if the transformer doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(target);
    } else {
      target = info.bindable.name;
    }
    return new TranslationParametersBindingInstruction(exprParser.parse(attr.rawValue, etIsProperty), target);
  }
}

export const TranslationParametersBindingRenderer = /*@__PURE__*/ renderer(class TranslationParametersBindingRenderer implements IRenderer {
  public readonly target = TranslationParametersInstructionType;
  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: TranslationParametersBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    TranslationBinding.create({
      parser: exprParser,
      observerLocator,
      context: renderingCtrl.container,
      controller: renderingCtrl,
      target,
      instruction,
      isParameterContext: true,
      platform,
    });
  }
}, null!);
