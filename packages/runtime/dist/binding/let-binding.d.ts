import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { ITask } from '@aurelia/scheduler';
import { IExpression } from '../ast';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IObservable, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
export interface LetBinding extends IConnectableBinding {
}
export declare class LetBinding implements IPartialConnectableBinding {
    sourceExpression: IExpression;
    targetProperty: string;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    private readonly toBindingContext;
    interceptor: this;
    id: number;
    isBound: boolean;
    $lifecycle: ILifecycle;
    $scope?: IScope;
    $hostScope: IScope | null;
    task: ITask | null;
    target: (IObservable & IIndexable) | null;
    constructor(sourceExpression: IExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toBindingContext?: boolean);
    handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null): void;
    $unbind(flags: LifecycleFlags): void;
    dispose(): void;
}
//# sourceMappingURL=let-binding.d.ts.map