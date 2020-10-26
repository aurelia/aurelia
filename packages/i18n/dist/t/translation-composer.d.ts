import { IContainer } from '@aurelia/kernel';
import { BindingMode, BindingType, IExpressionParser, IInstructionComposer, IObserverLocator, IsBindingBehavior, LifecycleFlags, IComposableController, AttrSyntax } from '@aurelia/runtime-html';
import type { CallBindingInstruction, BindingSymbol, BindingCommandInstance, PlainAttributeSymbol } from '@aurelia/runtime-html';
export declare const TranslationInstructionType = "tt";
export declare class TranslationAttributePattern {
    [key: string]: ((rawName: string, rawValue: string, parts: string[]) => AttrSyntax);
    static registerAlias(alias: string): void;
}
export declare class TranslationBindingInstruction {
    from: IsBindingBehavior;
    to: string;
    readonly type: string;
    mode: BindingMode.toView;
    constructor(from: IsBindingBehavior, to: string);
}
export declare class TranslationBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.CustomCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationBindingInstruction;
}
export declare class TranslationBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    compose(flags: LifecycleFlags, context: IContainer, controller: IComposableController, target: HTMLElement, instruction: CallBindingInstruction): void;
}
export declare const TranslationBindInstructionType = "tbt";
export declare class TranslationBindAttributePattern {
    [key: string]: ((rawName: string, rawValue: string, parts: string[]) => AttrSyntax);
    static registerAlias(alias: string): void;
}
export declare class TranslationBindBindingInstruction {
    from: IsBindingBehavior;
    to: string;
    readonly type: string;
    mode: BindingMode.toView;
    constructor(from: IsBindingBehavior, to: string);
}
export declare class TranslationBindBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.BindCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): TranslationBindBindingInstruction;
}
export declare class TranslationBindBindingComposer implements IInstructionComposer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    compose(flags: LifecycleFlags, context: IContainer, controller: IComposableController, target: HTMLElement, instruction: CallBindingInstruction): void;
}
//# sourceMappingURL=translation-composer.d.ts.map