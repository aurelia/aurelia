import { LifecycleFlags } from '@aurelia/runtime';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IBinding, IConnectableBinding, IsBindingBehavior, Scope } from '@aurelia/runtime';
export interface RefBinding extends IConnectableBinding {
}
export declare class RefBinding implements IBinding {
    sourceExpression: IsBindingBehavior;
    target: object;
    locator: IServiceLocator;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    constructor(sourceExpression: IsBindingBehavior, target: object, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(obj: IIndexable, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=ref-binding.d.ts.map