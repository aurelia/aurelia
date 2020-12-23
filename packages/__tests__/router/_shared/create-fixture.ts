import { Constructable, LogLevel, Registration, ILogConfig, LoggerConfiguration } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime-html';
import { RouterConfiguration, IRouter, IRouterActivateOptions, NavigationState } from '@aurelia/router';
import { TestContext } from '@aurelia/testing';

import { IHIAConfig, IHookInvocationAggregator } from './hook-invocation-tracker.js';
import { TestRouterConfiguration } from './configuration.js';

export interface IRouterOptionsSpec {
  deferUntil: DeferralJuncture;
  swapStrategy: SwapStrategy;
  toString(): string;
}

export type SwapStrategy = 'sequential-add-first' | 'sequential-remove-first' | 'parallel-remove-first';
export type DeferralJuncture = 'guard-hooks' | 'load-hooks' | 'none';

export function translateOptions(routerOptionsSpec: IRouterOptionsSpec): IRouterActivateOptions {
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
  }
  const syncStates = ['guardedUnload', 'swapped', 'completed'] as NavigationState[];
  switch (routerOptionsSpec.deferUntil) {
    case 'load-hooks':
      syncStates.push('loaded', 'unloaded', 'routed');
      // falls through
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

export function transformNotifications(notifications: string[]): string[] {
  return notifications.filter(notification => !(/^stop\..*?\.unload$/.test(notification)));
}

export async function createFixture<T extends Constructable>(
  Component: T,
  deps: Constructable[],
  createHIAConfig: () => IHIAConfig,
  createRouterOptions: () => IRouterActivateOptions,
  level: LogLevel = LogLevel.warn,
) {
  const hiaConfig = createHIAConfig();
  const routerOptions = createRouterOptions();
  const ctx = TestContext.create();
  const { container, platform } = ctx;

  container.register(Registration.instance(IHIAConfig, hiaConfig));
  container.register(TestRouterConfiguration.for(ctx, level));
  container.register(RouterConfiguration.customize(routerOptions));
  container.register(LoggerConfiguration.create({ $console: console, level: LogLevel.trace }));
  container.register(...deps);

  // const activityTracker = container.get(IActivityTracker);
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
    // activityTracker,
    startTracing() {
      logConfig.level = LogLevel.trace;
    },
    stopTracing() {
      logConfig.level = level;
    },
    async tearDown() {
      hia.setPhase('stop');

      await au.stop();

      au.dispose();
    },
  };
}
