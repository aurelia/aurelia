import { LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { BindingInterceptor, IInterceptableBinding } from '../binding-behavior';
import { BindingBehaviorExpression } from '../../binding/ast';
export declare class ThrottleBindingBehavior extends BindingInterceptor {
    private readonly taskQueue;
    private readonly now;
    private readonly opts;
    private readonly firstArg;
    private task;
    private lastCall;
    constructor(binding: IInterceptableBinding, expr: BindingBehaviorExpression);
    callSource(args: object): unknown;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    private queueTask;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void;
}
//# sourceMappingURL=throttle.d.ts.map