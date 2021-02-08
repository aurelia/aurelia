import { IContainer } from '@aurelia/kernel';
import { BindingMode, BindingType, IHydratableController, IExpressionParser, IRenderer, IObserverLocator, IsBindingBehavior, LifecycleFlags, AttrSyntax, IPlatform } from '@aurelia/runtime-html';
import type { CallBindingInstruction, BindingSymbol, BindingCommandInstance, PlainAttributeSymbol } from '@aurelia/runtime-html';
export declare const TranslationParametersInstructionType = "tpt";
declare const attribute = "t-params.bind";
export declare class TranslationParametersAttributePattern {
    [attribute](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export declare class TranslationParametersBindingInstruction {
    from: IsBindingBehavior;
    to: string;
    readonly type: string;
    mode: BindingMode.toView;
    constructor(from: IsBindingBehavior, to: string);
}
export declare class TranslationParametersBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.BindCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationParametersBindingInstruction;
}
export declare class TranslationParametersBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly observerLocator;
    private readonly platform;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator, platform: IPlatform);
    render(flags: LifecycleFlags, context: IContainer, controller: IHydratableController, target: HTMLElement, instruction: CallBindingInstruction): void;
}
export {};
//# sourceMappingURL=translation-parameters-renderer.d.ts.map