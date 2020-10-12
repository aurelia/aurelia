import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { ITask } from '@aurelia/scheduler';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IObservable } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IsExpression } from './ast';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
import type { Scope } from '../observation/binding-context';
export interface LetBinding extends IConnectableBinding {
}
export declare class LetBinding implements IPartialConnectableBinding {
    sourceExpression: IsExpression;
    targetProperty: string;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    private readonly toBindingContext;
    interceptor: this;
    id: number;
    isBound: boolean;
    $lifecycle: ILifecycle;
    $scope?: Scope;
    $hostScope: Scope | null;
    task: ITask | null;
    target: (IObservable & IIndexable) | null;
    constructor(sourceExpression: IsExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toBindingContext?: boolean);
    handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=let-binding.d.ts.map