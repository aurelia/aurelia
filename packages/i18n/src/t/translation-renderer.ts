import { AttributePatternDefinition, AttrSyntax, BindingCommandResource, BindingSymbol, getTarget, IAttributePattern, IBindingCommand, PlainAttributeSymbol } from '@aurelia/jit';
import { IContainer, Registration } from '@aurelia/kernel';
import { addBinding, BindingMode, BindingType, ensureExpression, ICallBindingInstruction, IController, IDOM, IExpressionParser, IInstructionRenderer, instructionRenderer, IObserverLocator, IRenderContext, IsBindingBehavior, LifecycleFlags, PrimitiveLiteralExpression, AccessMemberExpression, IsExpression } from '@aurelia/runtime';
import { TranslationBinding } from './translation-binding';

export const TranslationInstructionType = 'tt';

// @attributePattern({ pattern: 't', symbols: '' })
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
      // `.bind` is directly used her as pattern to replicate the vCurrent syntax.
      // In this case, it probably has lesser or no significance as actual binding mode.
      const bindPattern = `${pattern}.bind`;
      this.prototype[pattern] = this.createPattern(pattern);
      this.prototype[bindPattern] = this.createPattern(bindPattern);
      patternDefs.push({ pattern, symbols: '' }, { pattern: bindPattern, symbols: '.' });
    }
    this.prototype.$patternDefs = patternDefs;
    Registration.singleton(IAttributePattern, this).register(container);
  }

  private static createPattern(pattern: string): (rawName: string, rawValue: string, parts: string[]) => AttrSyntax {
    return function (rawName: string, rawValue: string, parts: string[]): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, parts[1] || '', pattern);
    };
  }
}

export class TranslationBindingInstruction {
  public readonly type: string = TranslationInstructionType;
  public mode: BindingMode.toView = BindingMode.toView;

  constructor(public from: IsBindingBehavior, public to: string) {
  }
}

export class TranslationBindingCommand implements IBindingCommand {
  /**
   * Enables aliases for translation/localization attribute.
   */
  public static aliases: string[] = ['t'];
  public readonly bindingType: BindingType.BindCommand = BindingType.BindCommand /* | BindingType.Interpolation */;

  public static register(container: IContainer) {
    for (const alias of this.aliases) {
      for (const part of ['', '.bind']) {
        // `.bind` is directly used her as pattern to replicate the vCurrent syntax.
        // In this case, it probably has lesser or no significance as actual binding mode.
        const key = BindingCommandResource.keyFrom(`${alias}${part}`);
        Registration.singleton(key, this).register(container);
        Registration.alias(key, this).register(container);
      }
    }
  }

  public compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationBindingInstruction {
    return new TranslationBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

@instructionRenderer(TranslationInstructionType)
export class TranslationBindingRenderer implements IInstructionRenderer {
  constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) { }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ICallBindingInstruction): void {
    // Note that `to` part exists iff `t.bind` is used. In that case the `from` expression needs to be parsed to member access tree.
    // Otherwise get the raw value
    const expr = instruction.to
      ? ensureExpression(this.parser, instruction.from, BindingType.BindCommand) as AccessMemberExpression
      : instruction.from.toString();
    const binding = new TranslationBinding(expr, target, instruction.to, this.observerLocator, context);
    addBinding(renderable, binding);
  }
}
