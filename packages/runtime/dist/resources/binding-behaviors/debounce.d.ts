import { LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IScope } from '../../observation';
interface ICallSource {
    callSource(arg: object): void;
}
interface IHandleChange {
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
}
interface IDebounceableBinding extends ICallSource, IHandleChange, IBinding {
}
export declare class DebounceBindingBehavior {
    bind(flags: LifecycleFlags, scope: IScope, binding: IDebounceableBinding, delay?: number): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IDebounceableBinding): void;
}
export {};
//# sourceMappingURL=debounce.d.ts.map