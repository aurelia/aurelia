import { IAstEvaluator, type Scope, type IObserverLocator, type IObserverLocatorBasedConnectable } from '@aurelia/runtime';
import { IPlatform, type IBindingController, type IHydratableController, type INode, IBinding } from '@aurelia/runtime-html';
import type * as i18next from 'i18next';
import type { IContainer, IServiceLocator } from '@aurelia/kernel';
import { IExpressionParser, IsExpression } from '@aurelia/expression-parser';
import type { TranslationBindBindingInstruction, TranslationBindingInstruction } from './translation-renderer';
import type { TranslationParametersBindingInstruction } from './translation-parameters-renderer';
interface TranslationBindingCreationContext {
    parser: IExpressionParser;
    observerLocator: IObserverLocator;
    context: IContainer;
    controller: IHydratableController;
    target: HTMLElement;
    instruction: TranslationBindingInstruction | TranslationBindBindingInstruction | TranslationParametersBindingInstruction;
    platform: IPlatform;
    isParameterContext?: boolean;
}
export interface TranslationBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class TranslationBinding implements IBinding {
    static create({ parser, observerLocator, context, controller, target, instruction, platform, isParameterContext, }: TranslationBindingCreationContext): void;
    isBound: boolean;
    ast: IsExpression;
    private readonly i18n;
    target: HTMLElement;
    private parameter;
    /**
     * A semi-private property used by connectable mixin
     */
    readonly oL: IObserverLocator;
    strict: boolean;
    constructor(controller: IBindingController, locator: IServiceLocator, observerLocator: IObserverLocator, platform: IPlatform, target: INode);
    bind(_scope: Scope): void;
    unbind(): void;
    handleChange(_newValue: string | i18next.TOptions, _previousValue: string | i18next.TOptions): void;
    handleLocaleChange(): void;
    useParameter(expr: IsExpression): void;
    updateTranslations(): void;
}
export {};
//# sourceMappingURL=translation-binding.d.ts.map