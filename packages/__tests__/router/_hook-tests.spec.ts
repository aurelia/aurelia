import { Constructable, Registration, LogLevel, ILogConfig } from '@aurelia/kernel';
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
  describe('simple cases', function () {
    it('child1,child2', async function () {
      @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
      class Root extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'child1' })
      class Child1 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'child2' })
      class Child2 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      const { router, hia, tearDown } = await createFixture(Root, [Child1, Child2], getDefaultHIAConfig);

      hia.setPhase('goto(child1)');

      await router.goto(Child1);

      hia.setPhase('goto(child2)');

      await router.goto(Child2);

      await tearDown();

      assert.deepStrictEqual(
        hia.notifyHistory,
        [
          'start.root.beforeBind',
          'start.root.afterBind',
          'start.root.afterAttach',
          'start.root.afterAttachChildren',

          'goto(child1).child1.canEnter',
          'goto(child1).child1.enter',
          'goto(child1).child1.beforeBind',
          'goto(child1).child1.afterBind',
          'goto(child1).child1.afterAttach',
          'goto(child1).child1.afterAttachChildren',

          'goto(child2).child1.canLeave',
          'goto(child2).child2.canEnter',
          'goto(child2).child1.leave',
          'goto(child2).child2.enter',
          'goto(child2).child2.beforeBind',
          'goto(child2).child2.afterBind',
          'goto(child2).child2.afterAttach',
          'goto(child2).child2.afterAttachChildren',
          'goto(child2).child1.beforeDetach',
          'goto(child2).child1.beforeUnbind',
          'goto(child2).child1.afterUnbind',
          'goto(child2).child1.afterUnbindChildren',

          'stop.root.beforeDetach',
          'stop.root.beforeUnbind',
          'stop.root.afterUnbind',
          'stop.child2.beforeDetach',
          'stop.child2.beforeUnbind',
          'stop.child2.afterUnbind',
          'stop.child2.afterUnbindChildren',
          'stop.root.afterUnbindChildren',
        ],
      );

      hia.dispose();
    });

    it('child1+child2,child3+child4', async function () {
      @customElement({ name: 'root', template: '<au-viewport></au-viewport><au-viewport></au-viewport>' })
      class Root extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'child1' })
      class Child1 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'child2' })
      class Child2 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'child3' })
      class Child3 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'child4' })
      class Child4 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      const { router, hia, tearDown } = await createFixture(Root, [Child1, Child2, Child3, Child4], getDefaultHIAConfig);

      hia.setPhase('goto(child1+child2)');

      await router.goto([Child1, Child2]);

      hia.setPhase('goto(child3+child4)');

      await router.goto([Child3, Child4]);

      await tearDown();

      assert.deepStrictEqual(
        hia.notifyHistory,
        [
          'start.root.beforeBind',
          'start.root.afterBind',
          'start.root.afterAttach',
          'start.root.afterAttachChildren',

          'goto(child1+child2).child1.canEnter',
          'goto(child1+child2).child2.canEnter',
          'goto(child1+child2).child1.enter',
          'goto(child1+child2).child2.enter',
          'goto(child1+child2).child1.beforeBind',
          'goto(child1+child2).child1.afterBind',
          'goto(child1+child2).child1.afterAttach',
          'goto(child1+child2).child1.afterAttachChildren',
          'goto(child1+child2).child2.beforeBind',
          'goto(child1+child2).child2.afterBind',
          'goto(child1+child2).child2.afterAttach',
          'goto(child1+child2).child2.afterAttachChildren',

          'goto(child3+child4).child1.canLeave',
          'goto(child3+child4).child2.canLeave',
          'goto(child3+child4).child3.canEnter',
          'goto(child3+child4).child4.canEnter',
          'goto(child3+child4).child1.leave',
          'goto(child3+child4).child2.leave',
          'goto(child3+child4).child3.enter',
          'goto(child3+child4).child4.enter',
          'goto(child3+child4).child3.beforeBind',
          'goto(child3+child4).child3.afterBind',
          'goto(child3+child4).child3.afterAttach',
          'goto(child3+child4).child3.afterAttachChildren',
          'goto(child3+child4).child1.beforeDetach',
          'goto(child3+child4).child1.beforeUnbind',
          'goto(child3+child4).child1.afterUnbind',
          'goto(child3+child4).child1.afterUnbindChildren',
          'goto(child3+child4).child4.beforeBind',
          'goto(child3+child4).child4.afterBind',
          'goto(child3+child4).child4.afterAttach',
          'goto(child3+child4).child4.afterAttachChildren',
          'goto(child3+child4).child2.beforeDetach',
          'goto(child3+child4).child2.beforeUnbind',
          'goto(child3+child4).child2.afterUnbind',
          'goto(child3+child4).child2.afterUnbindChildren',

          'stop.root.beforeDetach',
          'stop.root.beforeUnbind',
          'stop.root.afterUnbind',
          'stop.child3.beforeDetach',
          'stop.child3.beforeUnbind',
          'stop.child3.afterUnbind',
          'stop.child4.beforeDetach',
          'stop.child4.beforeUnbind',
          'stop.child4.afterUnbind',
          'stop.child3.afterUnbindChildren',
          'stop.child4.afterUnbindChildren',
          'stop.root.afterUnbindChildren',
        ],
      );

      hia.dispose();
    });

    it('parent1/child1,parent2/child2', async function () {
      @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
      class Root extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'parent1', template: '<au-viewport></au-viewport>' })
      class Parent1 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'child1' })
      class Child1 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'parent2', template: '<au-viewport></au-viewport>' })
      class Parent2 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'child2' })
      class Child2 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      const { router, hia, tearDown } = await createFixture(Root, [Parent1, Child1, Parent2, Child2], getDefaultHIAConfig);

      hia.setPhase('goto(parent1/child1)');

      await router.goto({ component: Parent1, children: [Child1] });

      hia.setPhase('goto(parent2/child2)');

      await router.goto({ component: Parent2, children: [Child2] });

      await tearDown();

      assert.deepStrictEqual(
        hia.notifyHistory,
        [
          'start.root.beforeBind',
          'start.root.afterBind',
          'start.root.afterAttach',
          'start.root.afterAttachChildren',

          'goto(parent1/child1).parent1.canEnter',
          'goto(parent1/child1).parent1.enter',
          'goto(parent1/child1).parent1.beforeBind',
          'goto(parent1/child1).parent1.afterBind',
          'goto(parent1/child1).parent1.afterAttach',
          'goto(parent1/child1).parent1.afterAttachChildren',
          'goto(parent1/child1).child1.canEnter',
          'goto(parent1/child1).child1.enter',
          'goto(parent1/child1).child1.beforeBind',
          'goto(parent1/child1).child1.afterBind',
          'goto(parent1/child1).child1.afterAttach',
          'goto(parent1/child1).child1.afterAttachChildren',

          'goto(parent2/child2).parent1.canLeave',
          'goto(parent2/child2).child1.canLeave',
          'goto(parent2/child2).parent2.canEnter',
          'goto(parent2/child2).parent1.leave',
          'goto(parent2/child2).child1.leave',
          'goto(parent2/child2).parent2.enter',
          'goto(parent2/child2).parent2.beforeBind',
          'goto(parent2/child2).parent2.afterBind',
          'goto(parent2/child2).parent2.afterAttach',
          'goto(parent2/child2).parent2.afterAttachChildren',
          'goto(parent2/child2).parent1.beforeDetach',
          'goto(parent2/child2).parent1.beforeUnbind',
          'goto(parent2/child2).parent1.afterUnbind',
          'goto(parent2/child2).child1.beforeDetach',
          'goto(parent2/child2).child1.beforeUnbind',
          'goto(parent2/child2).child1.afterUnbind',
          'goto(parent2/child2).child1.afterUnbindChildren',
          'goto(parent2/child2).parent1.afterUnbindChildren',
          'goto(parent2/child2).child2.canEnter',
          'goto(parent2/child2).child2.enter',
          'goto(parent2/child2).child2.beforeBind',
          'goto(parent2/child2).child2.afterBind',
          'goto(parent2/child2).child2.afterAttach',
          'goto(parent2/child2).child2.afterAttachChildren',

          'stop.root.beforeDetach',
          'stop.root.beforeUnbind',
          'stop.root.afterUnbind',
          'stop.parent2.beforeDetach',
          'stop.parent2.beforeUnbind',
          'stop.parent2.afterUnbind',
          'stop.child2.beforeDetach',
          'stop.child2.beforeUnbind',
          'stop.child2.afterUnbind',
          'stop.child2.afterUnbindChildren',
          'stop.parent2.afterUnbindChildren',
          'stop.root.afterUnbindChildren',
        ],
      );

      hia.dispose();
    });
  });
});
