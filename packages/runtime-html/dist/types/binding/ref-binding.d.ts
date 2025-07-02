import type { IServiceLocator } from '@aurelia/kernel';
import { type ICollectionSubscriber, type IObserverLocatorBasedConnectable, type ISubscriber, type Scope, type IAstEvaluator, IObserverLocator } from '@aurelia/runtime';
import { type IsBindingBehavior } from '@aurelia/expression-parser';
import { IBinding } from './interfaces-bindings';
export interface RefBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class RefBinding implements IBinding, ISubscriber, ICollectionSubscriber {
    oL: IObserverLocator;
    ast: IsBindingBehavior;
    target: object;
    strict: boolean;
    static mix: <T extends import("@aurelia/kernel").Constructable<IBinding>>(this: T) => void;
    isBound: boolean;
    constructor(locator: IServiceLocator, oL: IObserverLocator, ast: IsBindingBehavior, target: object, strict: boolean);
    updateSource(): void;
    handleChange(): void;
    handleCollectionChange(): void;
    bind(scope: Scope): void;
    unbind(): void;
}
//# sourceMappingURL=ref-binding.d.ts.map