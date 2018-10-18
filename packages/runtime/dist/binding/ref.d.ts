import { IServiceLocator } from '@aurelia/kernel';
import { IsBindingBehavior, StrictAny } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { IConnectableBinding } from './connectable';
export interface Ref extends IConnectableBinding {
}
export declare class Ref implements IBinding {
    sourceExpression: IsBindingBehavior;
    target: IBindingTarget;
    locator: IServiceLocator;
    $isBound: boolean;
    $scope: IScope;
    constructor(sourceExpression: IsBindingBehavior, target: IBindingTarget, locator: IServiceLocator);
    $bind(flags: BindingFlags, scope: IScope): void;
    $unbind(flags: BindingFlags): void;
    observeProperty(obj: StrictAny, propertyName: StrictAny): void;
    handleChange(newValue: any, previousValue: any, flags: BindingFlags): void;
}
//# sourceMappingURL=ref.d.ts.map