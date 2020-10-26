import { IContainer } from '@aurelia/kernel';
import { BindingMode, BindingType, IComposableController, IExpressionParser, IInstructionComposer, IObserverLocator, IsBindingBehavior, LifecycleFlags, AttrSyntax } from '@aurelia/runtime-html';
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
export declare class TranslationParametersBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    compose(flags: LifecycleFlags, context: IContainer, controller: IComposableController, target: HTMLElement, instruction: CallBindingInstruction): void;
}
export {};
//# sourceMappingURL=translation-parameters-composer.d.ts.map