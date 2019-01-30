import { IRegistry } from '@aurelia/kernel';
import { LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IObservable, IScope } from '../../observation';
declare type WithKey = IObservable & {
    key: string | null;
    keyed?: boolean;
};
declare type BindingWithKeyedTarget = IBinding & {
    target: WithKey;
};
export declare class KeyedBindingBehavior {
    static register: IRegistry['register'];
    bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithKeyedTarget, key: string): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: BindingWithKeyedTarget): void;
}
export {};
//# sourceMappingURL=keyed.d.ts.map