import { IServiceLocator } from '@aurelia/kernel';
import { ICallBindingInstruction, IConnectableBinding, IController, IExpressionParser, IObserverLocator, IPartialConnectableBinding, IRenderContext, IScope, IsExpression, LifecycleFlags, State, INode } from '@aurelia/runtime';
import i18next from 'i18next';
interface TranslationBindingCreationContext {
    parser: IExpressionParser;
    observerLocator: IObserverLocator;
    context: IRenderContext;
    renderable: IController;
    target: HTMLElement;
    instruction: ICallBindingInstruction;
    isParameterContext?: boolean;
}
export interface TranslationBinding extends IConnectableBinding {
}
export declare class TranslationBinding implements IPartialConnectableBinding {
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    interceptor: this;
    id: number;
    $state: State;
    expr: IsExpression;
    parametersExpr?: IsExpression;
    private readonly i18n;
    private readonly contentAttributes;
    private keyExpression;
    private translationParameters;
    private scope;
    private isInterpolatedSourceExpr;
    private readonly targetObservers;
    readonly target: HTMLElement;
    constructor(target: INode, observerLocator: IObserverLocator, locator: IServiceLocator);
    static create({ parser, observerLocator, context, renderable, target, instruction, isParameterContext }: TranslationBindingCreationContext): void;
    private static getBinding;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void;
    $unbind(flags: LifecycleFlags): void;
    handleChange(newValue: string | i18next.TOptions, _previousValue: string | i18next.TOptions, flags: LifecycleFlags): void;
    private handleLocaleChange;
    private updateTranslations;
    private updateAttribute;
    private preprocessAttributes;
    private isContentAttribute;
    private updateContent;
    private prepareTemplate;
    private addContentToTemplate;
    private unobserveTargets;
}
export {};
//# sourceMappingURL=translation-binding.d.ts.map