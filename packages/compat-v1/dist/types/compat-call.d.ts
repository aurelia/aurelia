import { type IContainer, type IServiceLocator } from '@aurelia/kernel';
import { IExpressionParser, IsBindingBehavior } from '@aurelia/expression-parser';
import { IAccessor, IObserverLocator, IObserverLocatorBasedConnectable, type IAstEvaluator, Scope } from '@aurelia/runtime';
import { IController, IHydratableController, IPlatform, type IBinding } from '@aurelia/runtime-html';
import { type BindingCommandInstance, type ICommandBuildInfo, type IInstruction, type BindingCommandStaticAuDefinition } from '@aurelia/template-compiler';
export declare const callSyntax: {
    register(container: IContainer): void;
};
export declare class CallBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    readonly type = "rh";
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class CallBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
export declare const CallBindingRenderer: {
    new (): {
        readonly target: "rh";
        render(renderingCtrl: IHydratableController, target: IController, instruction: CallBindingInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
/**
 * A binding for handling .call syntax
 */
export interface CallBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class CallBinding implements IBinding {
    ast: IsBindingBehavior;
    readonly target: object;
    readonly targetProperty: string;
    isBound: boolean;
    targetObserver: IAccessor;
    constructor(locator: IServiceLocator, observerLocator: IObserverLocator, ast: IsBindingBehavior, target: object, targetProperty: string);
    callSource(args: object): unknown;
    bind(_scope: Scope): void;
    unbind(): void;
}
//# sourceMappingURL=compat-call.d.ts.map