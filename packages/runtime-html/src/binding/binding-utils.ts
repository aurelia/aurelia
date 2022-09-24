import { DI, type Constructable, type Key } from '@aurelia/kernel';
import { def, defineHiddenProp } from '../utilities';
import { astEvaluate, BindingBehaviorInstance, type IAstEvaluator, type ISubscriber, type ValueConverterInstance } from '@aurelia/runtime';
import { BindingBehavior } from '../resources/binding-behavior';
import { ValueConverter } from '../resources/value-converter';
import { resource } from '../utilities-di';
import { type IAstBasedBinding } from './interfaces-bindings';

interface ITwoWayBindingImpl extends IAstBasedBinding {
  updateSource(value: unknown): void;
}

/**
 * A subscriber that is used for subcribing to target observer & invoking `updateSource` on a binding
 */
export class BindingTargetSubscriber implements ISubscriber {
  /** @internal */
  private readonly b: ITwoWayBindingImpl;
  // flush queue is a way to handle the notification order in a synchronous change notification system
  // without a flush queue, changes are notified depth first
  // with    a flush queue, changes are notified breadth first
  //
  // though we are only queueing target->source direction and that's already enough to prevent such issues
  /** @internal */
  private readonly _flushQueue: IFlushQueue;
  /** @internal */
  private _value: unknown = void 0;

  public constructor(
    b: ITwoWayBindingImpl,
    // flush queue is a way to handle the notification order in a synchronous change notification system
    // without a flush queue, changes are notified depth first
    // with    a flush queue, changes are notified breadth first
    flushQueue: IFlushQueue,
  ) {
    this.b = b;
    this._flushQueue = flushQueue;
  }

  public flush() {
    this.b.updateSource(this._value);
  }

  // deepscan-disable-next-line
  public handleChange(value: unknown, _: unknown): void {
    const b = this.b;
    if (value !== astEvaluate(b.ast, b.$scope!, b, null)) {
      this._value = value;
      this._flushQueue.add(this);
    }
  }
}

/**
 * Turns a class into AST evaluator
 *
 * @param strict - whether the evaluation of AST nodes will be in strict mode
 */
export function astEvaluator(strict?: boolean | undefined, strictFnCall = true) {
  return (target: Constructable<IAstEvaluator>) => {
    const proto = target.prototype;
    // some evaluator may have their strict configurable in some way
    // undefined to leave the property alone
    if (strict != null) {
      def(proto, 'strict', { enumerable: true, get: function () { return strict; } });
    }
    def(proto, 'strictFnCall', { enumerable: true, get: function () { return strictFnCall; } });
    defineHiddenProp(proto, 'get', function (this: IAstBasedBinding, key: Key) {
      return this.locator.get(key);
    });
    defineHiddenProp(proto, 'getConverter', function (this: IAstBasedBinding, name: string) {
      const key = ValueConverter.keyFrom(name);
      let resourceLookup = resourceLookupCache.get(this);
      if (resourceLookup == null) {
        resourceLookupCache.set(this, resourceLookup = new ResourceLookup());
      }
      return resourceLookup[key] ??= this.locator.get<ValueConverterInstance>(resource(key));
    });
    defineHiddenProp(proto, 'getBehavior', function (this: IAstBasedBinding, name: string) {
      const key = BindingBehavior.keyFrom(name);
      let resourceLookup = resourceLookupCache.get(this);
      if (resourceLookup == null) {
        resourceLookupCache.set(this, resourceLookup = new ResourceLookup());
      }
      return resourceLookup[key] ??= this.locator.get<BindingBehaviorInstance>(resource(key));
    });
  };
}

const resourceLookupCache = new WeakMap<IAstBasedBinding, ResourceLookup>();
class ResourceLookup {
  [key: string]: ValueConverterInstance | BindingBehaviorInstance;
}

export interface IFlushable {
  flush(): void;
}

export const IFlushQueue = DI.createInterface<IFlushQueue>('IFlushQueue', x => x.singleton(FlushQueue));
export interface IFlushQueue {
  get count(): number;
  add(flushable: IFlushable): void;
}

export class FlushQueue implements IFlushQueue {
  /** @internal */
  private _flushing: boolean = false;
  /** @internal */
  private readonly _items: Set<IFlushable> = new Set();

  public get count(): number {
    return this._items.size;
  }

  public add(flushable: IFlushable): void {
    this._items.add(flushable);
    if (this._flushing) {
      return;
    }
    this._flushing = true;
    try {
      this._items.forEach(flushItem);
    } finally {
      this._flushing = false;
    }
  }

  public clear(): void {
    this._items.clear();
    this._flushing = false;
  }
}

function flushItem(item: IFlushable, _: IFlushable, items: Set<IFlushable>) {
  items.delete(item);
  item.flush();
}
