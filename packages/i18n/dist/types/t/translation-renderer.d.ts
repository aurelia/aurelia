import { BindingMode, BindingType, IExpressionParser, IRenderer, IObserverLocator, IsBindingBehavior, IHydratableController, AttrSyntax, IPlatform, IAttrMapper, ICommandBuildInfo } from '@aurelia/runtime-html';
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
    private readonly m;
    readonly bindingType: BindingType.CustomCommand;
    static inject: import("@aurelia/kernel").InterfaceSymbol<IAttrMapper>[];
    constructor(m: IAttrMapper);
    build(info: ICommandBuildInfo): TranslationBindingInstruction;
}
export declare class TranslationBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly oL;
    private readonly p;
    constructor(parser: IExpressionParser, oL: IObserverLocator, p: IPlatform);
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
    private readonly m;
    private readonly xp;
    readonly bindingType: BindingType.BindCommand;
    static inject: (import("@aurelia/kernel").InterfaceSymbol<IAttrMapper> | import("@aurelia/kernel").InterfaceSymbol<IExpressionParser>)[];
    constructor(m: IAttrMapper, xp: IExpressionParser);
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