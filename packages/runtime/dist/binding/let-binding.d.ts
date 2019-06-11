import { IServiceLocator } from '@aurelia/kernel';
import { IExpression } from '../ast';
import { LifecycleFlags, State } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IObservable, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
export interface LetBinding extends IConnectableBinding {
}
export declare class LetBinding implements IPartialConnectableBinding {
    id: number;
    $state: State;
    $lifecycle: ILifecycle;
    $scope?: IScope;
    locator: IServiceLocator;
    observerLocator: IObserverLocator;
    sourceExpression: IExpression;
    target: IObservable | null;
    targetProperty: string;
    private readonly toViewModel;
    constructor(sourceExpression: IExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toViewModel?: boolean);
    handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=let-binding.d.ts.map