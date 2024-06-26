import { camelCase } from '@aurelia/kernel';
import { TranslationBinding } from './translation-binding';
import {
  IObserverLocator,
} from '@aurelia/runtime';
import { IExpressionParser, CustomExpression, IsBindingBehavior } from '@aurelia/expression-parser';
import {
  IRenderer,
  renderer,
  IHydratableController,
  IPlatform,
} from '@aurelia/runtime-html';
import type {
  IAttrMapper,
  ICommandBuildInfo,
  BindingCommandInstance,
} from '@aurelia/template-compiler';

import type {
  BindingMode,
} from '@aurelia/runtime-html';
import { etIsProperty, bmToView } from '../utils';

export const TranslationInstructionType = 'tt';

export class TranslationBindingInstruction {
  public readonly type: string = TranslationInstructionType;
  public mode: typeof BindingMode.toView = bmToView;

  public constructor(
    public from: CustomExpression | IsBindingBehavior,
    public to: string,
  ) { }
}

export class TranslationBindingCommand implements BindingCommandInstance {
  public readonly ignoreAttr = false;

  public build(info: ICommandBuildInfo, parser: IExpressionParser, attrMapper: IAttrMapper): TranslationBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, info.attr.target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.name;
    }
    return new TranslationBindingInstruction(new CustomExpression(info.attr.rawValue), target);
  }
}

export const TranslationBindingRenderer = /*@__PURE__*/ renderer(class TranslationBindingRenderer implements IRenderer {
  public readonly target = TranslationInstructionType;
  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: TranslationBindingInstruction,
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
      platform,
    });
  }
}, null!);

export const TranslationBindInstructionType = 'tbt';

export class TranslationBindBindingInstruction {
  public readonly type: string = TranslationBindInstructionType;
  public mode: typeof BindingMode.toView = bmToView;

  public constructor(
    public from: IsBindingBehavior,
    public to: string,
  ) { }
}

export class TranslationBindBindingCommand implements BindingCommandInstance {
  public readonly ignoreAttr = false;

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): TranslationBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, info.attr.target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.name;
    }
    return new TranslationBindBindingInstruction(exprParser.parse(info.attr.rawValue, etIsProperty), target);
  }
}

export const TranslationBindBindingRenderer = /*@__PURE__*/ renderer(class TranslationBindBindingRenderer implements IRenderer {
  public target = TranslationBindInstructionType;
  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: TranslationBindBindingInstruction,
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
      platform
    });
  }
}, null!);
