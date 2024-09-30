import { IAstEvaluator } from '@aurelia/runtime';
import { type IServiceLocator } from '@aurelia/kernel';
import type { TaskQueue } from '@aurelia/platform';
import type { ICollectionSubscriber, IObserverLocator, IObserverLocatorBasedConnectable, ISubscriber, Scope } from '@aurelia/runtime';
import type { IPlatform } from '../platform';
import type { BindingMode, IBinding, IBindingController } from './interfaces-bindings';
import { IsExpression } from '@aurelia/expression-parser';
export interface ContentBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {
}
/**
 * A binding for handling the element content interpolation
 */
export declare class ContentBinding implements IBinding, ISubscriber, ICollectionSubscriber {
    private readonly p;
    readonly ast: IsExpression;
    readonly target: Text;
    strict: boolean;
    isBound: boolean;
    readonly mode: BindingMode;
    constructor(controller: IBindingController, locator: IServiceLocator, observerLocator: IObserverLocator, taskQueue: TaskQueue, p: IPlatform, ast: IsExpression, target: Text, strict: boolean);
    updateTarget(value: unknown): void;
    handleChange(): void;
    handleCollectionChange(): void;
    bind(_scope: Scope): void;
    unbind(): void;
}
//# sourceMappingURL=content-binding.d.ts.map