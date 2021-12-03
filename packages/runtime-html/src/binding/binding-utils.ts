import type { ISubscriber, LifecycleFlags } from '@aurelia/runtime';
import type { IAstBasedBinding } from './interfaces-bindings';

interface ITwoWayBindingImpl extends IAstBasedBinding {
  updateSource(value: unknown, flags: LifecycleFlags): void;
}

/**
 * A subscriber that is used for subcribing to target observer & invoking `updateSource` on a binding
 */
export class BindingTargetSubscriber implements ISubscriber {
  public constructor(
    private readonly b: ITwoWayBindingImpl,
  ) { }

  // deepscan-disable-next-line
  public handleChange(value: unknown, _: unknown, flags: LifecycleFlags): void {
    const b = this.b;
    if (value !== b.sourceExpression.evaluate(flags, b.$scope!, b.locator, null)) {
      b.updateSource(value, flags);
    }
  }
}
