import {
  LifecycleFlags,
} from '@aurelia/runtime';
import type {
  ForOfStatement,
  IConnectableBinding,
  IsBindingBehavior,
  ISubscriber,
} from '@aurelia/runtime';

interface ITwoWayBindingImpl extends IConnectableBinding {
  sourceExpression: IsBindingBehavior | ForOfStatement;
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
    if (value !== b.sourceExpression.evaluate(flags, b.$scope!, b.$hostScope, b.locator, null)) {
      // TODO: adding the update source flag, to ensure existing `bindable` works in stable manner
      // should be removed
      b.updateSource(value, flags | LifecycleFlags.updateSource);
    }
  }
}
