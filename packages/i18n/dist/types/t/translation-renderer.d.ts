import { BindingMode, BindingType, IExpressionParser, IRenderer, IObserverLocator, IsBindingBehavior, LifecycleFlags, IHydratableController, AttrSyntax, IPlatform, IAttrMapper, ICompiledRenderContext, ICommandBuildInfo } from '@aurelia/runtime-html';
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
    static get inject(): import("@aurelia/kernel").InterfaceSymbol<IAttrMapper>[];
    constructor(m: IAttrMapper);
    build(info: ICommandBuildInfo): TranslationBindingInstruction;
}
export declare class TranslationBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly observerLocator;
    private readonly platform;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator, platform: IPlatform);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, renderingController: IHydratableController, target: HTMLElement, instruction: CallBindingInstruction): void;
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
    readonly bindingType: BindingType.BindCommand;
    static get inject(): import("@aurelia/kernel").InterfaceSymbol<IAttrMapper>[];
    constructor(m: IAttrMapper);
    build(info: ICommandBuildInfo): TranslationBindingInstruction;
}
export declare class TranslationBindBindingRenderer implements IRenderer {
    private readonly parser;
    private readonly observerLocator;
    private readonly platform;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator, platform: IPlatform);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, renderingController: IHydratableController, target: HTMLElement, instruction: CallBindingInstruction): void;
}
//# sourceMappingURL=translation-renderer.d.ts.map