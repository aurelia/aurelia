import { Constructable, LogLevel, Registration, ILogConfig } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime';
import { IRouterOptions, RouterConfiguration, IRouter } from '@aurelia/router';
import { TestContext, assert } from '@aurelia/testing';

import { IHIAConfig, IHookInvocationAggregator } from './hook-invocation-tracker';
import { TestRouterConfiguration } from './configuration';

export async function createFixture<T extends Constructable>(
  Component: T,
  deps: Constructable[],
  createHIAConfig: () => IHIAConfig,
  createRouterOptions: () => IRouterOptions,
  level: LogLevel = LogLevel.warn,
) {
  const hiaConfig = createHIAConfig();
  const routerOptions = createRouterOptions();
  const ctx = TestContext.createHTMLTestContext();
  const { container, scheduler } = ctx;

  container.register(Registration.instance(IHIAConfig, hiaConfig));
  container.register(TestRouterConfiguration.for(ctx, level));
  container.register(RouterConfiguration.customize(routerOptions));
  container.register(...deps);

  const hia = container.get(IHookInvocationAggregator);
  const router = container.get(IRouter);
  const component = container.get(Component);

  const au = new Aurelia(container);
  const host = ctx.createElement('div');

  const logConfig = container.get(ILogConfig);

  au.app({ component, host });

  hia.setPhase('start');

  await au.start().wait();

  return {
    ctx,
    au,
    host,
    hia,
    component,
    scheduler,
    router,
    startTracing() {
      logConfig.level = LogLevel.trace;
    },
    stopTracing() {
      logConfig.level = level;
    },
    async tearDown() {
      // assert.isSchedulerEmpty();

      hia.setPhase('stop');

      await au.stop().wait();

      // assert.isSchedulerEmpty();
    },
  };
}
