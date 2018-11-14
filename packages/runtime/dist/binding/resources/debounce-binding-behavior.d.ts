import { IScope, LifecycleFlags } from '../../observation';
import { Binding } from '../binding';
import { Call } from '../call';
import { Listener } from '../listener';
export declare type DebounceableBinding = (Binding | Call | Listener) & {
    debouncedMethod: ((newValue: any, oldValue: any, flags: LifecycleFlags) => void) & {
        originalName: string;
    };
    debounceState: {
        callContextToDebounce: LifecycleFlags;
        delay: number;
        timeoutId: any;
        oldValue: any;
    };
};
export declare class DebounceBindingBehavior {
    bind(flags: LifecycleFlags, scope: IScope, binding: DebounceableBinding, delay?: number): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: DebounceableBinding): void;
}
//# sourceMappingURL=debounce-binding-behavior.d.ts.map