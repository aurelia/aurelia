import {
  astEvaluate,
  connectable,
  ConnectableSwitcher,
  ExpressionKind,
  ProxyObservable,
} from '@aurelia/runtime';
import { mixinAstEvaluator } from '../binding/binding-utils';

import type { IServiceLocator } from '@aurelia/kernel';
import type {
  ICollectionSubscriber,
  IConnectable,
  IConnectableBinding,
  IObservable,
  IObserverLocator,
  IsBindingBehavior,
  ISubscriber,
  Scope,
} from '@aurelia/runtime';
import type { IWatcherCallback } from '../watch';

const { enter, exit } = ConnectableSwitcher;
const { wrap, unwrap } = ProxyObservable;

// watchers (Computed & Expression) are basically binding,
// they are treated as special and setup before all other bindings

export interface ComputedWatcher extends IConnectableBinding { }

export class ComputedWatcher implements IConnectableBinding, ISubscriber, ICollectionSubscriber {
  public value: unknown = void 0;
  public isBound: boolean = false;

  // todo: maybe use a counter allow recursive call to a certain level
  private running: boolean = false;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  public constructor(
    public readonly obj: IObservable,
    observerLocator: IObserverLocator,
    public readonly $get: (obj: object, watcher: IConnectable) => unknown,
    private readonly cb: IWatcherCallback<object>,
    public readonly useProxy: boolean,
  ) {
    this.oL = observerLocator;
  }

  public handleChange(): void {
    this.run();
  }

  public handleCollectionChange(): void {
    this.run();
  }

  public $bind(): void {
    if (this.isBound) {
      return;
    }
    this.compute();
    this.isBound = true;
  }

  public $unbind(): void {
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
    const oldValue = this.value;
    const newValue = this.compute();

    if (!Object.is(newValue, oldValue)) {
      // should optionally queue
      this.cb.call(obj, newValue, oldValue, obj);
    }
  }

  private compute(): unknown {
    this.running = true;
    this.obs.version++;
    try {
      enter(this);
      return this.value = unwrap(this.$get.call(void 0, this.useProxy ? wrap(this.obj) : this.obj, this));
    } finally {
      this.obs.clear();
      this.running = false;
      exit(this);
    }
  }
}

export interface ExpressionWatcher extends IConnectableBinding { }

export class ExpressionWatcher implements IConnectableBinding {
  /**
   * @internal
   */
  private readonly obj: object;

  public value: unknown;
  public isBound: boolean = false;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    public scope: Scope,
    public l: IServiceLocator,
    public oL: IObserverLocator,
    private readonly expression: IsBindingBehavior,
    private readonly callback: IWatcherCallback<object>,
  ) {
    this.obj = scope.bindingContext;
  }

  public handleChange(value: unknown): void {
    const expr = this.expression;
    const obj = this.obj;
    const oldValue = this.value;
    const canOptimize = expr.$kind === ExpressionKind.AccessScope && this.obs.count === 1;
    if (!canOptimize) {
      this.obs.version++;
      value = astEvaluate(expr, this.scope, this, this);
      this.obs.clear();
    }
    if (!Object.is(value, oldValue)) {
      this.value = value;
      // should optionally queue for batch synchronous
      this.callback.call(obj, value, oldValue, obj);
    }
  }

  public $bind(): void {
    if (this.isBound) {
      return;
    }
    this.obs.version++;
    this.value = astEvaluate(this.expression, this.scope, this, this);
    this.obs.clear();
    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.obs.clearAll();
    this.value = void 0;
  }
}

connectable(ComputedWatcher);

connectable(ExpressionWatcher);
mixinAstEvaluator(true)(ExpressionWatcher);
