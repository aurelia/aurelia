import { IExpressionParser, type IsBindingBehavior } from '@aurelia/expression-parser';
import { type IServiceLocator, type Key } from '@aurelia/kernel';
import { TaskQueue } from '@aurelia/platform';
import { type IObserverLocator, type IObserverLocatorBasedConnectable, Scope, type IAstEvaluator } from '@aurelia/runtime';
import { ITemplateCompiler } from '@aurelia/template-compiler';
import { IPlatform } from '../platform';
import { IHasController } from '../renderer';
import { CustomElementDefinition } from '../resources/custom-element';
import { IController, ICustomElementController, IHydrationContext } from '../templating/controller';
import { IRendering } from '../templating/rendering';
import { IBinding, IBindingController } from './interfaces-bindings';
/**
 * The public methods of this binding emulates the necessary of an IHydratableController,
 * which mainly is the addBinding method since a spread binding
 * is a surrogate of other bindings created from the captured attrs
 */
export declare class SpreadBinding implements IBinding, IHasController {
    /**
     * Create a list of SpreadBinding by searching for captured attributes in HydrationContexts
     * from a container
     */
    static create(hydrationContext: IHydrationContext, target: HTMLElement, 
    /**
     * To be supplied to the compilation of spread' attrs
     * Sometimes in dynamic compilation scenario, this could be used to influence
     * what attributes can be compiled into (i.e bindable vs normal)
     */
    targetDef: CustomElementDefinition | undefined, rendering: IRendering, compiler: ITemplateCompiler, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): SpreadBinding[];
    scope?: Scope | undefined;
    isBound: boolean;
    readonly locator: IServiceLocator;
    readonly $controller: ICustomElementController;
    get container(): IServiceLocator;
    get definition(): CustomElementDefinition;
    get state(): import("../templating/controller").State;
    constructor(hydrationContext: IHydrationContext<object>);
    get(key: Key): any;
    bind(_scope: Scope): void;
    unbind(): void;
    addBinding(binding: IBinding): void;
    addChild(controller: IController): void;
}
export interface SpreadValueBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {
}
export declare class SpreadValueBinding implements IBinding {
    target: object;
    targetKeys: string[];
    ast: IsBindingBehavior;
    strict: boolean;
    isBound: boolean;
    constructor(controller: IBindingController, target: object, targetKeys: string[], ast: IsBindingBehavior, ol: IObserverLocator, l: IServiceLocator, taskQueue: TaskQueue, strict: boolean);
    updateTarget(): void;
    handleChange(): void;
    handleCollectionChange(): void;
    bind(scope: Scope): void;
    unbind(): void;
}
//# sourceMappingURL=spread-binding.d.ts.map