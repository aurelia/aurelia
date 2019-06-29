import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IsBindingBehavior } from '../ast';
import { LifecycleFlags, State } from '../flags';
import { IBinding } from '../lifecycle';
import { IObservable, IScope } from '../observation';
import { IConnectableBinding } from './connectable';
export interface RefBinding extends IConnectableBinding {
}
export declare class RefBinding implements IBinding {
    $state: State;
    $scope?: IScope;
    part?: string;
    locator: IServiceLocator;
    sourceExpression: IsBindingBehavior;
    target: IObservable;
    constructor(sourceExpression: IsBindingBehavior, target: object, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=ref-binding.d.ts.map