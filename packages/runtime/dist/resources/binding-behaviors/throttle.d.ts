import { IRegistry } from '@aurelia/kernel';
import { IBinding } from '../../binding/binding';
import { IScope, LifecycleFlags } from '../../observation';
export declare type ThrottleableBinding = IBinding & {
    throttledMethod: ((value: unknown) => unknown) & {
        originalName: string;
    };
    throttleState: {
        delay: number;
        timeoutId: number;
        last: number;
        newValue?: unknown;
    };
};
export declare class ThrottleBindingBehavior {
    static register: IRegistry['register'];
    bind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding, delay?: number): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding): void;
}
//# sourceMappingURL=throttle.d.ts.map