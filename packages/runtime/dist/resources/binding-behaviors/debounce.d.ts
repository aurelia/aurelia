import { LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { BindingInterceptor, IInterceptableBinding } from '../binding-behavior';
import { BindingBehaviorExpression } from '../../binding/ast';
export declare class DebounceBindingBehavior extends BindingInterceptor {
    private readonly taskQueue;
    private readonly opts;
    private readonly firstArg;
    private task;
    constructor(binding: IInterceptableBinding, expr: BindingBehaviorExpression);
    callSource(args: object): unknown;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    private queueTask;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void;
}
//# sourceMappingURL=debounce.d.ts.map