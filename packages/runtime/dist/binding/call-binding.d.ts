import { LifecycleFlags } from '../observation.js';
import type { IServiceLocator } from '@aurelia/kernel';
import type { IObserverLocator } from '../observation/observer-locator.js';
import type { Scope } from '../observation/binding-context.js';
import type { IsBindingBehavior } from './ast.js';
import type { IAccessor } from '../observation.js';
import type { IConnectableBinding } from './connectable.js';
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
    observeProperty(obj: object, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=call-binding.d.ts.map