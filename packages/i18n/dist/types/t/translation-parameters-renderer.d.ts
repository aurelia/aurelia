import { IExpressionParser, IObserverLocator } from '@aurelia/runtime';
import { BindingMode, CommandType, IHydratableController, IRenderer, IsBindingBehavior, AttrSyntax, IPlatform, IAttrMapper, ICommandBuildInfo } from '@aurelia/runtime-html';
import type { CallBindingInstruction, BindingCommandInstance } from '@aurelia/runtime-html';
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
    readonly type: CommandType.None;
    get name(): string;
    constructor(m: IAttrMapper, xp: IExpressionParser);
    build(info: ICommandBuildInfo): TranslationParametersBindingInstruction;
}
export declare class TranslationParametersBindingRenderer implements IRenderer {
    constructor(exprParser: IExpressionParser, observerLocator: IObserverLocator, p: IPlatform);
    render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: CallBindingInstruction): void;
}
export {};
//# sourceMappingURL=translation-parameters-renderer.d.ts.map