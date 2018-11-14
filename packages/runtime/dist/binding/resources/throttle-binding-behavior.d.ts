import { IScope, LifecycleFlags } from '../../observation';
import { Binding } from '../binding';
import { Call } from '../call';
import { Listener } from '../listener';
export declare type ThrottleableBinding = (Binding | Call | Listener) & {
    throttledMethod: ((value: any) => any) & {
        originalName: string;
    };
    throttleState: {
        delay: number;
        timeoutId: any;
        last: any;
        newValue?: any;
    };
};
export declare class ThrottleBindingBehavior {
    bind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding, delay?: number): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding): void;
}
//# sourceMappingURL=throttle-binding-behavior.d.ts.map