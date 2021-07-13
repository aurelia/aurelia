import { LifecycleFlags } from '@aurelia/runtime';
import type { ITask } from '@aurelia/platform';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IConnectableBinding, IObservable, IObserverLocator, IPartialConnectableBinding, IsExpression, Scope } from '@aurelia/runtime';
export interface LetBinding extends IConnectableBinding {
}
export declare class LetBinding implements IPartialConnectableBinding {
    sourceExpression: IsExpression;
    targetProperty: string;
    observerLocator: IObserverLocator;
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