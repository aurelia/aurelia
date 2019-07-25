import { LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IScope } from '../../observation';
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
    bind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding, delay?: number): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding): void;
}
//# sourceMappingURL=throttle.d.ts.map