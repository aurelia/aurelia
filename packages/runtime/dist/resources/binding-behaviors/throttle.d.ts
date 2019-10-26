import { LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IScope } from '../../observation';
interface ICallSource {
    callSource(arg: object): void;
}
interface IHandleChange {
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
}
interface IThrottleableBinding extends ICallSource, IHandleChange, IBinding {
}
export declare class ThrottleBindingBehavior {
    bind(flags: LifecycleFlags, scope: IScope, binding: IThrottleableBinding, delay?: number): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IThrottleableBinding): void;
}
export {};
//# sourceMappingURL=throttle.d.ts.map