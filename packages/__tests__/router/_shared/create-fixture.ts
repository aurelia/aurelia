import { Constructable, LogLevel, Registration, ILogConfig, DI, LoggerConfiguration, ConsoleSink } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime-html';
import { IRouterOptions, RouterConfiguration, IRouter } from '@aurelia/router';
import { TestContext } from '@aurelia/testing';

import { IHIAConfig, IHookInvocationAggregator } from './hook-invocation-tracker.js';
import { TestRouterConfiguration } from './configuration.js';

export const IActivityTracker = DI.createInterface<IActivityTracker>('IActivityTracker', x => x.singleton(ActivityTracker));
export interface IActivityTracker extends ActivityTracker {}
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
  deps: Constructable[],
  createHIAConfig: () => IHIAConfig,
  createRouterOptions: () => IRouterOptions,
  level: LogLevel = LogLevel.fatal,
) {
  const hiaConfig = createHIAConfig();
  const routerOptions = createRouterOptions();
  const ctx = TestContext.create();
  const { container, platform } = ctx;

  container.register(Registration.instance(IHIAConfig, hiaConfig));
  container.register(TestRouterConfiguration.for(ctx, level));
  container.register(RouterConfiguration.customize(routerOptions));
  container.register(LoggerConfiguration.create({ sinks: [ConsoleSink], level: LogLevel.fatal }));
  container.register(...deps);

  const activityTracker = container.get(IActivityTracker);
  const hia = container.get(IHookInvocationAggregator);
  const router = container.get(IRouter);
  const component = container.get(Component);

  const au = new Aurelia(container);
  const host = ctx.createElement('div');

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

      await au.stop(true);
    },
  };
}
