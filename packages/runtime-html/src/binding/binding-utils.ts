import { Constructable, type Key } from '@aurelia/kernel';
import { def, defineHiddenProp } from '../utilities';
import { connectable, IAstEvaluator, IConnectableBinding, ISubscriber, LifecycleFlags } from '@aurelia/runtime';
import { BindingBehavior } from '../resources/binding-behavior';
import { ValueConverter } from '../resources/value-converter';
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
    if (value !== b.sourceExpression.evaluate(b.$scope!, b, null)) {
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

/**
 * Turns a class into AST evaluator, and optionally connectable
 *
 * @param strict - whether the evaluation of AST nodes will be in strict mode
 */
export function astEvaluator(strict = true, strictFnCall = true) {
  return (target: Constructable<IAstEvaluator>) => {
    const proto = target.prototype;
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
