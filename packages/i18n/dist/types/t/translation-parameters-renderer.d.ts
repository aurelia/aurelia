import { BindingMode, BindingType, IHydratableController, IExpressionParser, IRenderer, IObserverLocator, IsBindingBehavior, AttrSyntax, IPlatform, IAttrMapper, ICommandBuildInfo } from '@aurelia/runtime-html';
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
    private readonly m;
    private readonly xp;
    readonly bindingType: BindingType.BindCommand;
    static inject: (import("@aurelia/kernel").InterfaceSymbol<IAttrMapper> | import("@aurelia/kernel").InterfaceSymbol<IExpressionParser>)[];
    constructor(m: IAttrMapper, xp: IExpressionParser);
    build(info: ICommandBuildInfo): TranslationParametersBindingInstruction;
}
export declare class TranslationParametersBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    private readonly p;
    constructor(parser: IExpressionParser, oL: IObserverLocator, p: IPlatform);
    render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: CallBindingInstruction): void;
}
export {};
//# sourceMappingURL=translation-parameters-renderer.d.ts.map