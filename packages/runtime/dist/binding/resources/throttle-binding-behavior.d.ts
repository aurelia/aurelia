import { IRegistry } from '@aurelia/kernel';
import { IScope, LifecycleFlags } from '../../observation';
import { IBinding } from '../binding';
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
//# sourceMappingURL=throttle-binding-behavior.d.ts.map