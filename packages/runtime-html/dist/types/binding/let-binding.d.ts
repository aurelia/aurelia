import { ICollectionSubscriber, IObserverLocatorBasedConnectable, ISubscriber, type IObservable, type IObserverLocator, type Scope, type IAstEvaluator } from '@aurelia/runtime';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IsExpression } from '@aurelia/expression-parser';
import { IBinding } from './interfaces-bindings';
export interface LetBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class LetBinding implements IBinding, ISubscriber, ICollectionSubscriber {
    ast: IsExpression;
    targetProperty: string;
    isBound: boolean;
    target: (IObservable & IIndexable) | null;
    strict: boolean;
    constructor(locator: IServiceLocator, observerLocator: IObserverLocator, ast: IsExpression, targetProperty: string, toBindingContext: boolean, strict: boolean);
    updateTarget(): void;
    handleChange(): void;
    handleCollectionChange(): void;
    bind(_scope: Scope): void;
    unbind(): void;
}
//# sourceMappingURL=let-binding.d.ts.map