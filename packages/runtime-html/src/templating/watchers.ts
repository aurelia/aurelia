import {
  connectable,
  ConnectableSwitcher,
  ProxyObservable,
} from '@aurelia/runtime';
import {
  astEvaluate,
} from '../ast.eval';
import { mixinAstEvaluator } from '../binding/binding-utils';
import { type Scope } from '../binding/scope';

import type { IServiceLocator } from '@aurelia/kernel';
import type {
  ICollectionSubscriber,
  IConnectable,
  IObservable,
  IObserverLocator,
  IObserverLocatorBasedConnectable,
  ISubscriber,
} from '@aurelia/runtime';
import type { IWatcherCallback } from '../watch';
import { areEqual } from '../utilities';
import { IsBindingBehavior } from '@aurelia/expression-parser';
import { IBinding } from '../binding/interfaces-bindings';

const { enter, exit } = ConnectableSwitcher;
const { wrap, unwrap } = ProxyObservable;

// watchers (Computed & Expression) are basically binding,
// they are treated as special and setup before all other bindings

export interface ComputedWatcher extends IObserverLocatorBasedConnectable, IServiceLocator { }

export class ComputedWatcher implements IBinding, ISubscriber, ICollectionSubscriber {
  static {
    connectable(ComputedWatcher, null!);
  }

  public isBound: boolean = false;

  // todo: maybe use a counter allow recursive call to a certain level
  private running: boolean = false;

  /** @internal */
  private _value: unknown = void 0;
  public get value(): unknown {
    return this._value;
  }
  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  private readonly _callback: IWatcherCallback<object>;

  public constructor(
    public readonly obj: IObservable,
    observerLocator: IObserverLocator,
    public readonly $get: (obj: object, watcher: IConnectable) => unknown,
    cb: IWatcherCallback<object>,
    public readonly useProxy: boolean,
  ) {
    this._callback = cb;
    this.oL = observerLocator;
  }

  public handleChange(): void {
    this.run();
  }

  public handleCollectionChange(): void {
    this.run();
  }

  public bind(): void {
    if (this.isBound) {
      return;
    }
    this.compute();
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.obs.clearAll();
  }

  private run(): void {
    if (!this.isBound || this.running) {
      return;
    }
    const obj = this.obj;
    const oldValue = this._value;
    const newValue = this.compute();

    if (!areEqual(newValue, oldValue)) {
      // should optionally queue
      this._callback.call(obj, newValue, oldValue, obj);
    }
  }

  private compute(): unknown {
    this.running = true;
    this.obs.version++;
    try {
      enter(this);
      return this._value = unwrap(this.$get.call(void 0, this.useProxy ? wrap(this.obj) : this.obj, this));
    } finally {
      this.obs.clear();
      this.running = false;
      exit(this);
    }
  }
}

export interface ExpressionWatcher extends IObserverLocatorBasedConnectable, /* a hack, but it's only for internal */IServiceLocator { }

export class ExpressionWatcher implements IBinding, IObserverLocatorBasedConnectable {
  static {
    connectable(ExpressionWatcher, null!);
    mixinAstEvaluator(true)(ExpressionWatcher);
  }

  public isBound: boolean = false;
  /**
   * @internal
   */
  private readonly obj: object;

  /** @internal */
  private _value: unknown;
  public get value(): unknown {
    return this._value;
  }

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  /** @internal */
  private readonly _expression: IsBindingBehavior;

  /** @internal */
  private readonly _callback: IWatcherCallback<object>;

  public constructor(
    public scope: Scope,
    public l: IServiceLocator,
    public oL: IObserverLocator,
    expression: IsBindingBehavior,
    callback: IWatcherCallback<object>,
  ) {
    this.obj = scope.bindingContext;
    this._expression = expression;
    this._callback = callback;
  }

  public handleChange(value: unknown): void {
    const expr = this._expression;
    const obj = this.obj;
    const oldValue = this._value;
    const canOptimize = expr.$kind === 'AccessScope' && this.obs.count === 1;
    if (!canOptimize) {
      this.obs.version++;
      value = astEvaluate(expr, this.scope, this, this);
      this.obs.clear();
    }
    if (!areEqual(value, oldValue)) {
      this._value = value;
      // should optionally queue for batch synchronous
      this._callback.call(obj, value, oldValue, obj);
    }
  }

  public bind(): void {
    if (this.isBound) {
      return;
    }
    this.obs.version++;
    this._value = astEvaluate(this._expression, this.scope, this, this);
    this.obs.clear();
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.obs.clearAll();
    this._value = void 0;
  }
}
