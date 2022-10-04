import { camelCase } from '@aurelia/kernel';
import { TranslationBinding } from './translation-binding';
import {
  CustomExpression,
  ExpressionType,
  IExpressionParser,
  IObserverLocator,
  type IsBindingBehavior,
} from '@aurelia/runtime';
import {
  BindingMode,
  CommandType,
  IRenderer,
  renderer,
  IHydratableController,
  AttrSyntax,
  IPlatform,
  IAttrMapper,
  ICommandBuildInfo,
} from '@aurelia/runtime-html';

import type {
  BindingCommandInstance,
} from '@aurelia/runtime-html';

export const TranslationInstructionType = 'tt';

export class TranslationAttributePattern {
  [key: string]: ((rawName: string, rawValue: string, parts: string[]) => AttrSyntax);

  public static registerAlias(alias: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  public readonly type: CommandType.None = CommandType.None;
  public get name() { return 't'; }

  public build(info: ICommandBuildInfo, parser: IExpressionParser, attrMapper: IAttrMapper): TranslationBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, info.attr.target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.property;
    }
    return new TranslationBindingInstruction(new CustomExpression(info.attr.rawValue) as IsBindingBehavior, target);
  }
}

@renderer(TranslationInstructionType)
export class TranslationBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator, IPlatform];
  /** @internal */ private readonly _exprParser: IExpressionParser;
  /** @internal */ private readonly _observerLocator: IObserverLocator;
  /** @internal */ private readonly _platform: IPlatform;

  public target!: typeof TranslationInstructionType;
  public constructor(
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
    p: IPlatform,
  ) {
    this._exprParser = exprParser;
    this._observerLocator = observerLocator;
    this._platform = p;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: TranslationBindingInstruction,
  ): void {
    TranslationBinding.create({
      parser: this._exprParser,
      observerLocator: this._observerLocator,
      context: renderingCtrl.container,
      controller: renderingCtrl,
      target,
      instruction,
      platform: this._platform,
    });
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
  public readonly type: CommandType.None = CommandType.None;
  public get name() { return 't-bind'; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): TranslationBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = attrMapper.map(info.node, info.attr.target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.property;
    }
    return new TranslationBindBindingInstruction(exprParser.parse(info.attr.rawValue, ExpressionType.IsProperty), target);
  }
}

@renderer(TranslationBindInstructionType)
export class TranslationBindBindingRenderer implements IRenderer {
  public target!: typeof TranslationBindInstructionType;
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
    @IPlatform private readonly p: IPlatform,
  ) { }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: TranslationBindBindingInstruction,
  ): void {
    TranslationBinding.create({
      parser: this.parser,
      observerLocator: this.oL,
      context: renderingCtrl.container,
      controller: renderingCtrl,
      target,
      instruction,
      platform: this.p
    });
  }
}
