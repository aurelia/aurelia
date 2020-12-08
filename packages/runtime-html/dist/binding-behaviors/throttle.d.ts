import { BindingInterceptor, LifecycleFlags } from '@aurelia/runtime';
import type { BindingBehaviorExpression, IInterceptableBinding, Scope } from '@aurelia/runtime';
export declare class ThrottleBindingBehavior extends BindingInterceptor {
    private readonly taskQueue;
    private readonly platform;
    private readonly opts;
    private readonly firstArg;
    private task;
    private lastCall;
    constructor(binding: IInterceptableBinding, expr: BindingBehaviorExpression);
    callSource(args: object): unknown;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    private queueTask;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=throttle.d.ts.map