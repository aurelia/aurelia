import { LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IScope } from '../../observation';
export declare type DebounceableBinding = IBinding & {
    debouncedMethod: ((newValue: unknown, oldValue: unknown, flags: LifecycleFlags) => void) & {
        originalName: string;
    };
    debounceState: {
        callContextToDebounce: LifecycleFlags;
        delay: number;
        timeoutId: number;
        oldValue: unknown;
    };
};
export declare class DebounceBindingBehavior {
    bind(flags: LifecycleFlags, scope: IScope, binding: DebounceableBinding, delay?: number): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: DebounceableBinding): void;
}
//# sourceMappingURL=debounce.d.ts.map