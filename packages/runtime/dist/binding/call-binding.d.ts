import { IServiceLocator } from '@aurelia/kernel';
import { IAccessor, LifecycleFlags } from '../observation.js';
import { IObserverLocator } from '../observation/observer-locator.js';
import { IsBindingBehavior } from './ast.js';
import { IConnectableBinding } from './connectable.js';
import type { Scope } from '../observation/binding-context.js';
export interface CallBinding extends IConnectableBinding {
}
export declare class CallBinding {
    sourceExpression: IsBindingBehavior;
    readonly target: object;
    readonly targetProperty: string;
    locator: IServiceLocator;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    $hostScope: Scope | null;
    targetObserver: IAccessor;
    constructor(sourceExpression: IsBindingBehavior, target: object, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator);
    callSource(args: object): unknown;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=call-binding.d.ts.map