import { DI, Writable } from '@aurelia/kernel';
import { IPlatform } from '@aurelia/runtime-html';

export type HookName = (
  'beforeBind' |
  'afterBind' |
  'afterAttach' |
  'afterAttachChildren' |

  'beforeDetach' |
  'beforeUnbind' |
  'afterUnbind' |
  'afterUnbindChildren' |

  'dispose' |

  'canLoad' |
  'load' |
  'canUnload' |
  'unload'
);

export type MaybeHookName = HookName | '';

export class HookInvocationTracker {
  public get promise(): Promise<void> {
    this.setTimeout(this.aggregator.config.resolveTimeoutMs);
    return this._promise;
  }
  public _promise: Promise<void>;
  public timeout: number = -1;
  public $resolve: () => void;

  public readonly platform: IPlatform;

  public readonly notifyHistory: string[] = [];

  public constructor(
    public readonly aggregator: HookInvocationAggregator,
    public readonly methodName: HookName,
  ) {
    this.platform = aggregator.platform;
    this._promise = new Promise(resolve => this.$resolve = resolve);
  }

  public notify(componentName: string): void {
    this.notifyHistory.push(componentName);
    this.aggregator.notify(componentName, this);
  }

  public resolve(): void {
    const $resolve = this.$resolve;
    // Also re-create the promise immediately, for any potential subsequent await
    this._promise = new Promise(resolve => this.$resolve = resolve);
    this.clearTimeout();
    $resolve();
  }

  private setTimeout(ms: number): void {
    if (this.timeout === -1) {
      this.timeout = this.platform.setTimeout(() => {
        throw new Error(`${this.methodName} timed out after ${ms}ms. Notification history: [${this.notifyHistory.join(',')}]. Lifecycle call history: [${this.aggregator.notifyHistory.join(',')}]`);
      }, ms);
    }
  }

  private clearTimeout(): void {
    const timeout = this.timeout;
    if (timeout >= 0) {
      this.timeout = -1;
      this.platform.clearTimeout(timeout);
    }
  }

  public dispose(): void {
    const $this = this as Partial<Writable<this>>;
    this.clearTimeout();
    $this.notifyHistory = void 0;
    $this._promise = void 0;
    $this.$resolve = void 0;
    $this.platform = void 0;
    $this.aggregator = void 0;
  }
}

export const IHIAConfig = DI.createInterface<IHIAConfig>('IHIAConfig').noDefault();
export interface IHIAConfig extends HIAConfig {}
export class HIAConfig {
  public constructor(
    public readonly resolveLabels: string[],
    public readonly resolveTimeoutMs: number,
  ) {}
}

export const IHookInvocationAggregator = DI.createInterface<IHookInvocationAggregator>('IHookInvocationAggregator').withDefault(x => x.singleton(HookInvocationAggregator));
export interface IHookInvocationAggregator extends HookInvocationAggregator {}
export class HookInvocationAggregator {
  public readonly notifyHistory: string[] = [];
  public phase: string = '';

  public constructor(
    @IPlatform public readonly platform: IPlatform,
    @IHIAConfig public readonly config: IHIAConfig,
  ) {}

  public readonly beforeBind: HookInvocationTracker = new HookInvocationTracker(this, 'beforeBind');
  public readonly afterBind: HookInvocationTracker = new HookInvocationTracker(this, 'afterBind');
  public readonly afterAttach: HookInvocationTracker = new HookInvocationTracker(this, 'afterAttach');
  public readonly afterAttachChildren: HookInvocationTracker = new HookInvocationTracker(this, 'afterAttachChildren');

  public readonly beforeDetach: HookInvocationTracker = new HookInvocationTracker(this, 'beforeDetach');
  public readonly beforeUnbind: HookInvocationTracker = new HookInvocationTracker(this, 'beforeUnbind');
  public readonly afterUnbind: HookInvocationTracker = new HookInvocationTracker(this, 'afterUnbind');
  public readonly afterUnbindChildren: HookInvocationTracker = new HookInvocationTracker(this, 'afterUnbindChildren');

  public readonly $$dispose: HookInvocationTracker = new HookInvocationTracker(this, 'dispose');

  public readonly canLoad: HookInvocationTracker = new HookInvocationTracker(this, 'canLoad');
  public readonly load: HookInvocationTracker = new HookInvocationTracker(this, 'load');
  public readonly canUnload: HookInvocationTracker = new HookInvocationTracker(this, 'canUnload');
  public readonly unload: HookInvocationTracker = new HookInvocationTracker(this, 'unload');

  public notify(
    componentName: string,
    tracker: HookInvocationTracker,
  ): void {
    const label = `${this.phase}.${componentName}.${tracker.methodName}`;
    this.notifyHistory.push(label);

    if (this.config.resolveLabels.includes(label)) {
      tracker.resolve();
    }
  }

  public setPhase(label: string): void {
    this.phase = label;
  }

  public dispose(): void {
    this.beforeBind.dispose();
    this.afterBind.dispose();
    this.afterAttach.dispose();
    this.afterAttachChildren.dispose();
    this.beforeDetach.dispose();
    this.beforeUnbind.dispose();
    this.afterUnbind.dispose();
    this.afterUnbindChildren.dispose();
    this.$$dispose.dispose();
    this.canLoad.dispose();
    this.load.dispose();
    this.canUnload.dispose();
    this.unload.dispose();

    const $this = this as Partial<Writable<this>>;
    $this.notifyHistory = void 0;
    $this.platform = void 0;
    $this.config = void 0;

    $this.beforeBind = void 0;
    $this.afterBind = void 0;
    $this.afterAttach = void 0;
    $this.afterAttachChildren = void 0;
    $this.beforeDetach = void 0;
    $this.beforeUnbind = void 0;
    $this.afterUnbind = void 0;
    $this.afterUnbindChildren = void 0;
    $this.$$dispose = void 0;
    $this.canLoad = void 0;
    $this.load = void 0;
    $this.canUnload = void 0;
    $this.unload = void 0;
  }
}
