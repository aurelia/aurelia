import type { IServiceLocator } from '@aurelia/kernel';
import { ICollectionSubscriber, IObserverLocatorBasedConnectable, ISubscriber } from '@aurelia/runtime';
import { type Scope } from './scope';
import { IAstEvaluator } from '../ast.eval';
import { type IsBindingBehavior } from '@aurelia/expression-parser';
import { IBinding } from './interfaces-bindings';
export interface RefBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class RefBinding implements IBinding, ISubscriber, ICollectionSubscriber {
    ast: IsBindingBehavior;
    target: object;
    static mix: <T extends import("@aurelia/kernel").Constructable<IBinding>>(this: T) => void;
    isBound: boolean;
    constructor(locator: IServiceLocator, ast: IsBindingBehavior, target: object);
    bind(_scope: Scope): void;
    unbind(): void;
}
//# sourceMappingURL=ref-binding.d.ts.map