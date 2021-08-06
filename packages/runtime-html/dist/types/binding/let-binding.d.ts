import { LifecycleFlags } from '@aurelia/runtime';
import type { ITask } from '@aurelia/platform';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IObservable, IObserverLocator, IsExpression, Scope } from '@aurelia/runtime';
import type { IAstBasedBinding } from './interfaces-bindings';
export interface LetBinding extends IAstBasedBinding {
}
export declare class LetBinding implements IAstBasedBinding {
    sourceExpression: IsExpression;
    targetProperty: string;
    locator: IServiceLocator;
    private readonly toBindingContext;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    task: ITask | null;
    target: (IObservable & IIndexable) | null;
    constructor(sourceExpression: IsExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toBindingContext?: boolean);
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=let-binding.d.ts.map