import { Constructable, LogLevel, Registration, ILogConfig, LoggerConfiguration, DI, IPlatform } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime-html';
import { RouterConfiguration, IRouter, IRouterStartOptions, NavigationState } from '@aurelia/router';
import { TestContext } from '@aurelia/testing';

import { IHIAConfig, IHookInvocationAggregator } from './hook-invocation-tracker.js';
import { TestRouterConfiguration } from './configuration.js';
import { startTickLogging } from './tick-logger.js';

export interface IRouterOptionsSpec {
  deferUntil?: DeferralJuncture;
  swapStrategy?: SwapStrategy;
  routingMode?: 'configured-first' | 'configured-only' | 'direct-only';
  toString(): string;
}

export type SwapStrategy = 'sequential-add-first' | 'sequential-remove-first' | 'parallel-remove-first';
export type DeferralJuncture = 'guard-hooks' | 'load-hooks' | 'none';

export function translateOptions(routerOptionsSpec: IRouterOptionsSpec): IRouterStartOptions {
  let swap;
  switch (routerOptionsSpec.swapStrategy) {
    case 'sequential-add-first':
      swap = 'add-first-sequential';
      break;
    case 'sequential-remove-first':
      swap = 'remove-first-sequential';
      break;
    case 'parallel-remove-first':
      swap = 'remove-first-parallel';
      break;
    default:
      swap = 'add-first-sequential';
      break;
  }
  const syncStates = ['guardedUnload', 'swapped', 'completed'] as NavigationState[];
  switch (routerOptionsSpec.deferUntil) {
    case 'load-hooks':
      syncStates.push('loaded', 'unloaded', 'routed');
    // eslint-disable-next-line no-fallthrough
    case 'guard-hooks':
      syncStates.push('guardedLoad', 'guarded');
  }

  // const integration = routerOptionsSpec.resolutionStrategy === 'static' ||
  //   routerOptionsSpec.lifecycleStrategy === 'phased'
  //   ? 'separate'
  //   : 'integrated';
  // console.log('SyncStates', syncStates.toString());
  return {
    additiveInstructionDefault: false,
    swapStrategy: swap,
    navigationSyncStates: syncStates,
    // routingHookIntegration: integration,
  };
}

export const IActivityTracker = DI.createInterface<IActivityTracker>('IActivityTracker').withDefault(x => x.singleton(ActivityTracker));
export interface IActivityTracker extends ActivityTracker { }
export class ActivityTracker {
  public readonly activeVMs: string[] = [];

  public setActive(vm: string): void {
    this.activeVMs.push(vm);
  }
  public setNonActive(vm: string): void {
    this.activeVMs.splice(this.activeVMs.indexOf(vm), 1);
  }
}
export async function createFixture<T extends Constructable>(
  Component: T,
  deps: Constructable[] = [],
  createHIAConfig: () => IHIAConfig = null,
  createRouterOptions: () => IRouterStartOptions = null,
  level: LogLevel = LogLevel.warn,
) {
  const hiaConfig = createHIAConfig != null ? createHIAConfig() : null;
  const routerOptions = createRouterOptions != null ? createRouterOptions() : null;
  const ctx = TestContext.create();
  const { container, platform } = ctx;

  // clearBrowserState(platform);

  container.register(Registration.instance(IHIAConfig, hiaConfig));
  container.register(TestRouterConfiguration.for(ctx, level));
  container.register(RouterConfiguration.customize(routerOptions));
  container.register(LoggerConfiguration.create({ $console: console, level: LogLevel.trace }));
  container.register(...deps);

  const activityTracker = container.get(IActivityTracker);
  const hia = container.get(IHookInvocationAggregator);
  const router = container.get(IRouter);
  const component = container.get(Component);

  const au = new Aurelia(container);
  const host = ctx.createElement('div');
  ctx.doc.body.appendChild(host as any);

  const logConfig = container.get(ILogConfig);

  au.app({ component, host });

  hia.setPhase('start');

  await au.start();

  return {
    ctx,
    container,
    au,
    host,
    hia,
    component,
    platform,
    router,
    activityTracker,
    startTracing() {
      logConfig.level = LogLevel.trace;
    },
    stopTracing() {
      logConfig.level = level;
    },
    async tearDown() {
      hia.setPhase('stop');

      RouterConfiguration.customize();

      await au.stop(true);
    },
    logTicks(callback: (tick: number) => void): () => void {
      return startTickLogging(window, callback);
    }
  };
}

export async function clearBrowserState(platform: any, router: IRouter | null = null): Promise<void> {
  const { href } = platform.location;
  // const { state } = platform.history;
  const index = href.indexOf('#');
  if (index >= 0) {
    if (router?.navigation?.replaceNavigatorState == null) {
      platform.history.replaceState({}, '', href.slice(0, index));
      await Promise.resolve();
    } else {
      await router.navigation.replaceNavigatorState({}, '', href.slice(0, index));
    }
  }
}

export async function wait(milliseconds: number): Promise<void> {
  return new Promise(res => { setTimeout(res, milliseconds); });
}
