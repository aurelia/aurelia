import { IScope } from '../observation';
import { IConnectableBinding, connectable } from '../binding/connectable';
import { IObserverLocator } from './observer-locator';
import { IsBindingBehavior } from '../binding/ast';
import { IServiceLocator } from '@aurelia/kernel';
import { ExpressionKind } from '../flags';

export interface ICallable {
  call(): any;
}

export type IPropertyAccessFn<T extends object, R = unknown> = (vm: T) => R;
export type IWatcherCallback<T extends object = object, TValue = unknown> = (this: T, newValue: TValue, oldValue: TValue, vm: T) => unknown;

export interface Constructable<T extends object = object> {
  new (...args: any[]): T;
}

export interface IWatchConfiguration<T extends object = object> {
  expression: PropertyKey | ((vm: object) => any);
  callback: PropertyKey | IWatcherCallback<T>;
}

export interface INormalizedWatchConfiguration<T extends object = object> {
  expression: string;
  callback: PropertyKey | IWatcherCallback<T>;
}

/**
 * @internal The interface describes methods added by `connectable` & `subscriberCollection` decorators
 */
export interface CallbackBinding extends IConnectableBinding {
  scope: IScope;
  callback: IWatcherCallback;
  start(): void;
  stop(): void;
}

@connectable()
export class CallbackBinding implements CallbackBinding {
  /**
   * @internal
   */
  private oV: any;
  /**
   * @internal
   */
  private obj: object;

  public callback: IWatcherCallback<object>;

  public constructor(
    public sourceExpression: IsBindingBehavior,
    public scope: IScope,
    callback: string | IWatcherCallback,
    public locator: IServiceLocator,
    public observerLocator: IObserverLocator,
  ) {
    const obj = this.obj = scope.bindingContext;
    callback = this.callback = typeof callback !== 'function'
      ? obj[callback]
      : callback;
    if (typeof callback !== 'function') {
      throw new Error('Invalid callback');
    }
  }

  public handleChange(value: unknown): void {
    const expression = this.sourceExpression;
    const canOptimize = expression.$kind === ExpressionKind.AccessScope;
    const oldValue = this.oV;
    const obj = this.obj;
    if (!canOptimize) {
      this.version++;
      value = expression.evaluate(0, this.scope, null, this.locator, this);
      this.unobserve(false);
    }
    if (!Object.is(value, oldValue)) {
      this.oV = value;
      this.callback.call(obj, value, oldValue, obj);
    }
  }

  public start(): void {
    this.version++;
    this.oV = this.sourceExpression.evaluate(0, this.scope, null, this.locator, this);
    this.unobserve(false);
  }

  public stop(): void {
    this.unobserve(true);
    this.oV = void 0;
  }
}
