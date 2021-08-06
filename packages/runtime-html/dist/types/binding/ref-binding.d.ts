import { LifecycleFlags } from '@aurelia/runtime';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IsBindingBehavior, Scope } from '@aurelia/runtime';
import type { IAstBasedBinding } from './interfaces-bindings.js';
export interface RefBinding extends IAstBasedBinding {
}
export declare class RefBinding implements IAstBasedBinding {
    sourceExpression: IsBindingBehavior;
    target: object;
    locator: IServiceLocator;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    constructor(sourceExpression: IsBindingBehavior, target: object, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
    observe(obj: IIndexable, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=ref-binding.d.ts.map