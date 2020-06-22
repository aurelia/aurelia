import { Constructable, Registration, LogLevel } from '@aurelia/kernel';
import { Aurelia, customElement } from '@aurelia/runtime';
import { RouterConfiguration, IRouter } from '@aurelia/router';
import { TestContext, assert } from '@aurelia/testing';

import { TestRouterConfiguration } from './_shared/configuration';
import { IHIAConfig, IHookInvocationAggregator } from './_shared/hook-invocation-tracker';
import { TestRouteViewModelBase } from './_shared/view-models';

async function createFixture<T extends Constructable>(
  Component: T,
  deps: Constructable[],
  createConfig: () => IHIAConfig,
  level: LogLevel = LogLevel.warn,
) {
  const config = createConfig();
  const ctx = TestContext.createHTMLTestContext();
  const { container, scheduler } = ctx;

  container.register(Registration.instance(IHIAConfig, config));
  container.register(TestRouterConfiguration.for(ctx, level));
  container.register(RouterConfiguration);
  container.register(...deps);

  const hia = container.get(IHookInvocationAggregator);
  const router = container.get(IRouter);
  const component = container.get(Component);

  const au = new Aurelia(container);
  const host = ctx.createElement('div');

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
    async tearDown() {
      assert.isSchedulerEmpty();

      hia.setPhase('stop');

      await au.stop().wait();

      assert.isSchedulerEmpty();
    },
  };
}

function getDefaultHIAConfig(): IHIAConfig {
  return {
    resolveTimeoutMs: 100,
    resolveLabels: [],
  };
}

describe('router hooks', function () {
  it('works', async function () {
    @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
    class Root extends TestRouteViewModelBase {}

    @customElement({ name: 'child' })
    class Child extends TestRouteViewModelBase {}

    const {
      router,
      hia,
      tearDown,
    } = await createFixture(Root, [Child], getDefaultHIAConfig);

    hia.setPhase('goto(child)');

    await router.goto(Child);

    await tearDown();

    assert.deepStrictEqual(
      hia.notifyHistory,
      [
        'start.root.beforeBind',
        'start.root.afterBind',
        'start.root.afterAttach',
        'start.root.afterAttachChildren',

        'goto(child).child.canEnter',
        'goto(child).child.enter',
        'goto(child).child.beforeBind',
        'goto(child).child.afterBind',
        'goto(child).child.afterAttach',
        'goto(child).child.afterAttachChildren',

        'stop.root.beforeDetach',
        'stop.root.beforeUnbind',
        'stop.root.afterUnbind',
        'stop.child.beforeDetach',
        'stop.child.beforeUnbind',
        'stop.child.afterUnbind',
        'stop.child.afterUnbindChildren',
        'stop.root.afterUnbindChildren',
      ],
    );

    hia.dispose();
  });
});
