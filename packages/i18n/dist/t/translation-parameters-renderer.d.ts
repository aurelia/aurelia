import { IContainer } from '@aurelia/kernel';
import { BindingMode, BindingType, IHydratableController, IExpressionParser, IRenderer, IObserverLocator, IsBindingBehavior, LifecycleFlags, AttrSyntax, IPlatform, IAttrMapper } from '@aurelia/runtime-html';
import type { CallBindingInstruction, BindingCommandInstance } from '@aurelia/runtime-html';
import { ICommandBuildInfo } from '@aurelia/runtime-html/dist/resources/binding-command';
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
    readonly bindingType: BindingType.BindCommand;
    static get inject(): import("@aurelia/kernel").InterfaceSymbol<IAttrMapper>[];
    constructor(m: IAttrMapper);
    build(info: ICommandBuildInfo): TranslationParametersBindingInstruction;
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