import { IsBindingBehavior } from '@aurelia/expression-parser';
import { areEqual } from '@aurelia/kernel';
import { astAssign, astEvaluate } from './ast.eval';
import { mixinNoopAstEvaluator } from './ast.utilities';
import { IObserverLocatorBasedConnectable, connectable } from './connectable';
import { AccessorType, atObserver, ISubscriberRecord, type ICollectionSubscriber, type ISubscriber } from './interfaces';
import { IObserverLocator } from './observer-locator';
import { Scope } from './scope';
import { subscriberCollection } from './subscriber-collection';

export interface ExpressionObserver extends IObserverLocatorBasedConnectable, ICollectionSubscriber { }
export class ExpressionObserver implements IObserverLocatorBasedConnectable, ISubscriber {

  /** @internal */
  private static _mixed: boolean = false;

  public static create(
    obj: object,
    oL: IObserverLocator,
    expression: IsBindingBehavior,
    callback: (value: unknown, oldValue: unknown) => void
  ) {
    if (!this._mixed) {
      connectable(ExpressionObserver, null!);
      subscriberCollection(ExpressionObserver, null!);
      mixinNoopAstEvaluator(ExpressionObserver);
      this._mixed = true;
    }

    return new ExpressionObserver(Scope.create(obj), oL, expression, callback);
  }

  public get type(): AccessorType {
    return atObserver;
  }

  /** @internal */
  public subs!: ISubscriberRecord<ISubscriber>;

  /** @internal */
  private _value: unknown = void 0;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  /** @internal */
  private readonly ast: IsBindingBehavior;

  /** @internal */
  private _callback: (value: unknown, oldValue: unknown) => void;

  /** @internal */
  private readonly _scope: Scope;

  public constructor(
    scope: Scope,
    public oL: IObserverLocator,
    expression: IsBindingBehavior,
    callback: (value: unknown, oldValue: unknown) => void
  ) {
    this._scope = scope;
    this.ast = expression;
    this._callback = callback;
  }

  public getValue(): unknown {
    return this._value;
  }

  public setValue(value: unknown): void {
    astAssign(this.ast, this._scope, this, null, value);
  }

  public useCallback(cb: (value: unknown, oldValue: unknown) => void): boolean {
    this._callback = cb;
    return true;
  }

  public handleChange(): void {
    this.run();
  }

  public handleCollectionChange(): void {
    this.run();
  }

  public run(): void {
    this.obs.version++;
    const oldValue = this._value;
    const value = astEvaluate(this.ast, this._scope, this, this);
    this.obs.clear();
    if (!areEqual(value, oldValue)) {
      this._value = value;
      this.subs.notify(value, oldValue);
      this._callback.call(void 0, value, oldValue);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this._start();
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this.stop();
    }
  }

  /** @internal */
  private _start(): void {
    this.obs.version++;
    this._value = astEvaluate(this.ast, this._scope, this, this);
    this.obs.clear();
  }

  public stop(): void {
    this.obs.clearAll();
    this._value = void 0;
  }
}
