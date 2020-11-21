import { LifecycleFlags } from '../observation.js';
import { BindingInterceptor } from '../binding-behavior.js';
import type { IInterceptableBinding } from '../binding-behavior.js';
import type { Scope } from '../observation/binding-context.js';
import type { BindingBehaviorExpression } from '../binding/ast.js';
export declare class DebounceBindingBehavior extends BindingInterceptor {
    private readonly taskQueue;
    private readonly opts;
    private readonly firstArg;
    private task;
    constructor(binding: IInterceptableBinding, expr: BindingBehaviorExpression);
    callSource(args: object): unknown;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    private queueTask;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=debounce.d.ts.map