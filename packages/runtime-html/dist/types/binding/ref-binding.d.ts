import type { IServiceLocator } from '@aurelia/kernel';
import { type ICollectionSubscriber, type IObserverLocatorBasedConnectable, type ISubscriber, type Scope, type IAstEvaluator } from '@aurelia/runtime';
import { type IsBindingBehavior } from '@aurelia/expression-parser';
import { IBinding } from './interfaces-bindings';
export interface RefBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class RefBinding implements IBinding, ISubscriber, ICollectionSubscriber {
    ast: IsBindingBehavior;
    target: object;
    strict: boolean;
    static mix: <T extends import("@aurelia/kernel").Constructable<IBinding>>(this: T) => void;
    isBound: boolean;
    constructor(locator: IServiceLocator, ast: IsBindingBehavior, target: object, strict: boolean);
    bind(_scope: Scope): void;
    unbind(): void;
}
//# sourceMappingURL=ref-binding.d.ts.map