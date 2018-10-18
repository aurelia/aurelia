import { Binding } from '../binding';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { Call } from '../call';
import { Listener } from '../listener';
export declare type DebounceableBinding = (Binding | Call | Listener) & {
    debouncedMethod: ((newValue: any, oldValue: any, flags: BindingFlags) => void) & {
        originalName: string;
    };
    debounceState: {
        callContextToDebounce: BindingFlags;
        delay: number;
        timeoutId: any;
        oldValue: any;
    };
};
export declare class DebounceBindingBehavior {
    bind(flags: BindingFlags, scope: IScope, binding: DebounceableBinding, delay?: number): void;
    unbind(flags: BindingFlags, scope: IScope, binding: DebounceableBinding): void;
}
//# sourceMappingURL=debounce-binding-behavior.d.ts.map