import { Constructable, type Key } from '@aurelia/kernel';
import { def, defineHiddenProp } from '../utilities';
import { BindingBehavior, connectable, IConnectableBinding, ISubscriber, LifecycleFlags, ValueConverter } from '@aurelia/runtime';
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
    if (value !== b.sourceExpression.evaluate(b.$scope!, b.locator, null)) {
      b.updateSource(value, flags);
    }
  }
}

export function connectableBinding(strict: boolean | undefined, strictFnCall: boolean, makeConnectable = true) {
  return function (target: Constructable<IConnectableBinding>) {
    const proto = target.prototype;
    if (makeConnectable) {
      connectable(target);
    }
    if (strict != null) {
      def(proto, 'strict', { enumerable: true, get: function () { return strict; } });
    }
    def(proto, 'strictFnCall', { enumerable: true, get: function () { return strictFnCall; } });
    defineHiddenProp(proto, 'get', function (this: IAstBasedBinding, key: Key) {
      return this.locator.get(key);
    });
    defineHiddenProp(proto, 'getConverter', function (this: IAstBasedBinding, name: string) {
      return this.locator.get(ValueConverter.keyFrom(name));
    });
    defineHiddenProp(proto, 'getBehavior', function (this: IAstBasedBinding, name: string) {
      return this.locator.get(BindingBehavior.keyFrom(name));
    });
  };
}
