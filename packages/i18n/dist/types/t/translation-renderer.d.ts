import { IExpressionParser, IObserverLocator, IsBindingBehavior } from '@aurelia/runtime';
import { BindingMode, CommandType, IRenderer, IHydratableController, AttrSyntax, IPlatform, IAttrMapper, ICommandBuildInfo } from '@aurelia/runtime-html';
import type { CallBindingInstruction, BindingCommandInstance } from '@aurelia/runtime-html';
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
    readonly type: CommandType.None;
    get name(): string;
    constructor(m: IAttrMapper);
    build(info: ICommandBuildInfo): TranslationBindingInstruction;
}
export declare class TranslationBindingRenderer implements IRenderer {
    constructor(exprParser: IExpressionParser, observerLocator: IObserverLocator, p: IPlatform);
    render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: CallBindingInstruction): void;
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
    readonly type: CommandType.None;
    get name(): string;
    constructor(attrMapper: IAttrMapper, exprParser: IExpressionParser);
    build(info: ICommandBuildInfo): TranslationBindingInstruction;
}
export declare class TranslationBindBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    private readonly p;
    constructor(parser: IExpressionParser, oL: IObserverLocator, p: IPlatform);
    render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: CallBindingInstruction): void;
}
//# sourceMappingURL=translation-renderer.d.ts.map