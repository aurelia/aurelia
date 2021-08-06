import type { ISubscriber, LifecycleFlags } from '@aurelia/runtime';
import type { IAstBasedBinding } from './interfaces-bindings.js';
interface ITwoWayBindingImpl extends IAstBasedBinding {
    updateSource(value: unknown, flags: LifecycleFlags): void;
}
/**
 * A subscriber that is used for subcribing to target observer & invoking `updateSource` on a binding
 */
export declare class BindingTargetSubscriber implements ISubscriber {
    private readonly b;
    constructor(b: ITwoWayBindingImpl);
    handleChange(value: unknown, _: unknown, flags: LifecycleFlags): void;
}
export {};
//# sourceMappingURL=binding-utils.d.ts.map