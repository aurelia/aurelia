import {
  AttributePatternDefinition,
  AttrSyntax,
  BindingCommand,
  BindingSymbol,
  getTarget,
  IAttributePattern,
  BindingCommandInstance,
  PlainAttributeSymbol
} from '@aurelia/jit';
import { IContainer, Registration } from '@aurelia/kernel';
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

export const TranslationInstructionType = 'tt';

export class TranslationAttributePattern implements IAttributePattern {
  [key: string]: ((rawName: string, rawValue: string, parts: string[]) => AttrSyntax) | AttributePatternDefinition[];

  /**
   * Enables aliases for translation/localization attribute.
   */
  public static aliases: string[] = ['t'];
  public $patternDefs!: AttributePatternDefinition[];

  public static register(container: IContainer): void {
    const patterns = this.aliases;
    const patternDefs: AttributePatternDefinition[] = [];

    for (const pattern of patterns) {
      this.prototype[pattern] = this.createPattern(pattern);
      patternDefs.push({ pattern, symbols: '' });
    }
    this.prototype.$patternDefs = patternDefs;
    Registration.singleton(IAttributePattern, this).register(container);
  }

  private static createPattern(pattern: string): (rawName: string, rawValue: string, parts: string[]) => AttrSyntax {
    return function (rawName: string, rawValue: string, parts: string[]): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, '', pattern);
    };
  }
}

export class TranslationBindingInstruction {
  public readonly type: string = TranslationInstructionType;
  public mode: BindingMode.toView = BindingMode.toView;

  public constructor(public from: IsBindingBehavior, public to: string) {
  }
}

export class TranslationBindingCommand implements BindingCommandInstance {
  /**
   * Enables aliases for translation/localization attribute.
   */
  public static aliases: string[] = ['t'];
  public readonly bindingType: BindingType.CustomCommand = BindingType.CustomCommand;

  public static register(container: IContainer) {
    for (const alias of this.aliases) {
      // `.bind` is directly used here as pattern to replicate the vCurrent syntax.
      // In this case, it probably has lesser or no significance as actual binding mode.
      const key = BindingCommand.keyFrom(alias);
      Registration.singleton(key, this).register(container);
      Registration.alias(key, this).register(container);
    }
  }

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

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ICallBindingInstruction): void {
    TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction });
  }
}

export const TranslationBindInstructionType = 'tbt';

export class TranslationBindAttributePattern implements IAttributePattern {
  [key: string]: ((rawName: string, rawValue: string, parts: string[]) => AttrSyntax) | AttributePatternDefinition[];

  /**
   * Enables aliases for translation/localization attribute.
   */
  public static aliases: string[] = ['t'];
  public $patternDefs!: AttributePatternDefinition[];

  public static register(container: IContainer): void {
    const patterns = this.aliases;
    const patternDefs: AttributePatternDefinition[] = [];

    for (const pattern of patterns) {
      // `.bind` is directly used her as pattern to replicate the vCurrent syntax.
      // In this case, it probably has lesser or no significance as actual binding mode.
      const bindPattern = `${pattern}.bind`;
      this.prototype[bindPattern] = this.createPattern(bindPattern);
      patternDefs.push({ pattern: bindPattern, symbols: '.' });
    }
    this.prototype.$patternDefs = patternDefs;
    Registration.singleton(IAttributePattern, this).register(container);
  }

  private static createPattern(pattern: string): (rawName: string, rawValue: string, parts: string[]) => AttrSyntax {
    return function (rawName: string, rawValue: string, parts: string[]): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, parts[1], pattern);
    };
  }
}

export class TranslationBindBindingInstruction {
  public readonly type: string = TranslationBindInstructionType;
  public mode: BindingMode.toView = BindingMode.toView;

  public constructor(public from: IsBindingBehavior, public to: string) {
  }
}

export class TranslationBindBindingCommand implements BindingCommandInstance {
  /**
   * Enables aliases for translation/localization attribute.
   */
  public static aliases: string[] = ['t'];
  public readonly bindingType: BindingType.BindCommand = BindingType.BindCommand;

  public static register(container: IContainer) {
    for (const alias of this.aliases) {
      // `.bind` is directly used here as pattern to replicate the vCurrent syntax.
      // In this case, it probably has lesser or no significance as actual binding mode.
      const key = BindingCommand.keyFrom(`${alias}.bind`);
      Registration.singleton(key, this).register(container);
      Registration.alias(key, this).register(container);
    }
  }

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

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ICallBindingInstruction): void {
    TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction });
  }
}
