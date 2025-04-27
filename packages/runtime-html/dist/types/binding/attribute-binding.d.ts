import { type IServiceLocator } from '@aurelia/kernel';
import { type IObserverLocator, IObserverLocatorBasedConnectable, ISubscriber, ICollectionSubscriber, type IAstEvaluator, type Scope } from '@aurelia/runtime';
import type { TaskQueue } from '@aurelia/platform';
import type { INode } from '../dom.node';
import type { IBinding, BindingMode, IBindingController } from './interfaces-bindings';
import { ForOfStatement, IsBindingBehavior } from '@aurelia/expression-parser';
export interface AttributeBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {
}
/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export declare class AttributeBinding implements IBinding, ISubscriber, ICollectionSubscriber {
    targetAttribute: string;
    targetProperty: string;
    mode: BindingMode;
    strict: boolean;
    isBound: boolean;
    target: HTMLElement;
    ast: IsBindingBehavior | ForOfStatement;
    constructor(controller: IBindingController, locator: IServiceLocator, observerLocator: IObserverLocator, taskQueue: TaskQueue, ast: IsBindingBehavior | ForOfStatement, target: INode, targetAttribute: string, targetProperty: string, mode: BindingMode, strict: boolean);
    updateTarget(value: unknown): void;
    handleChange(): void;
    handleCollectionChange(): void;
    bind(_scope: Scope): void;
    unbind(): void;
}
//# sourceMappingURL=attribute-binding.d.ts.map