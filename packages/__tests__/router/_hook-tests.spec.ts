/* eslint-disable @typescript-eslint/camelcase */
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
    it('c1 -> c2 -> c1 -> c2', async function () {
      @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
      class Root extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'c1' })
      class C1 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'c2' })
      class C2 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      const { router, hia, tearDown } = await createFixture(Root, [C1, C2], getDefaultHIAConfig);

      hia.setPhase('goto(c1)#1');
      await router.goto('c1');

      hia.setPhase('goto(c2)#1');
      await router.goto('c2');

      hia.setPhase('goto(c1)#2');
      await router.goto('c1');

      hia.setPhase('goto(c2)#2');
      await router.goto('c2');

      await tearDown();

      const goto_c2 = [
        'goto(c2)#.c1.canLeave',
        'goto(c2)#.c2.canEnter',
        'goto(c2)#.c1.leave',
        'goto(c2)#.c2.enter',
        'goto(c2)#.c2.beforeBind',
        'goto(c2)#.c2.afterBind',
        'goto(c2)#.c2.afterAttach',
        'goto(c2)#.c2.afterAttachChildren',
        'goto(c2)#.c1.beforeDetach',
        'goto(c2)#.c1.beforeUnbind',
        'goto(c2)#.c1.afterUnbind',
        'goto(c2)#.c1.afterUnbindChildren',
      ];

      assert.deepStrictEqual(
        hia.notifyHistory,
        [
          'start.root.beforeBind',
          'start.root.afterBind',
          'start.root.afterAttach',
          'start.root.afterAttachChildren',

          'goto(c1)#1.c1.canEnter',
          'goto(c1)#1.c1.enter',
          'goto(c1)#1.c1.beforeBind',
          'goto(c1)#1.c1.afterBind',
          'goto(c1)#1.c1.afterAttach',
          'goto(c1)#1.c1.afterAttachChildren',

          ...setNumber(goto_c2, 1),

          'goto(c1)#2.c2.canLeave',
          'goto(c1)#2.c1.canEnter',
          'goto(c1)#2.c2.leave',
          'goto(c1)#2.c1.enter',
          'goto(c1)#2.c1.beforeBind',
          'goto(c1)#2.c1.afterBind',
          'goto(c1)#2.c1.afterAttach',
          'goto(c1)#2.c1.afterAttachChildren',
          'goto(c1)#2.c2.beforeDetach',
          'goto(c1)#2.c2.beforeUnbind',
          'goto(c1)#2.c2.afterUnbind',
          'goto(c1)#2.c2.afterUnbindChildren',

          ...setNumber(goto_c2, 2),

          'stop.root.beforeDetach',
          'stop.root.beforeUnbind',
          'stop.root.afterUnbind',
          'stop.c2.beforeDetach',
          'stop.c2.beforeUnbind',
          'stop.c2.afterUnbind',
          'stop.c2.afterUnbindChildren',
          'stop.root.afterUnbindChildren',
        ],
      );

      hia.dispose();
    });

    it('c1+c2 -> c3+c4 -> c1+c2 -> c3+c4', async function () {
      @customElement({ name: 'root', template: '<au-viewport></au-viewport><au-viewport></au-viewport>' })
      class Root extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'c1' })
      class C1 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'c2' })
      class C2 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'c3' })
      class C3 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'c4' })
      class C4 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      const { router, hia, tearDown } = await createFixture(Root, [C1, C2, C3, C4], getDefaultHIAConfig);

      hia.setPhase('goto(c1+c2)#1');
      await router.goto('c1+c2');

      hia.setPhase('goto(c3+c4)#1');
      await router.goto('c3+c4');

      hia.setPhase('goto(c1+c2)#2');
      await router.goto('c1+c2');

      hia.setPhase('goto(c3+c4)#2');
      await router.goto('c3+c4');

      await tearDown();

      const goto_c3_c4 = [
        'goto(c3+c4)#.c1.canLeave',
        'goto(c3+c4)#.c2.canLeave',
        'goto(c3+c4)#.c3.canEnter',
        'goto(c3+c4)#.c4.canEnter',
        'goto(c3+c4)#.c1.leave',
        'goto(c3+c4)#.c2.leave',
        'goto(c3+c4)#.c3.enter',
        'goto(c3+c4)#.c4.enter',
        'goto(c3+c4)#.c3.beforeBind',
        'goto(c3+c4)#.c3.afterBind',
        'goto(c3+c4)#.c3.afterAttach',
        'goto(c3+c4)#.c3.afterAttachChildren',
        'goto(c3+c4)#.c1.beforeDetach',
        'goto(c3+c4)#.c1.beforeUnbind',
        'goto(c3+c4)#.c1.afterUnbind',
        'goto(c3+c4)#.c1.afterUnbindChildren',
        'goto(c3+c4)#.c4.beforeBind',
        'goto(c3+c4)#.c4.afterBind',
        'goto(c3+c4)#.c4.afterAttach',
        'goto(c3+c4)#.c4.afterAttachChildren',
        'goto(c3+c4)#.c2.beforeDetach',
        'goto(c3+c4)#.c2.beforeUnbind',
        'goto(c3+c4)#.c2.afterUnbind',
        'goto(c3+c4)#.c2.afterUnbindChildren',
      ];

      assert.deepStrictEqual(
        hia.notifyHistory,
        [
          'start.root.beforeBind',
          'start.root.afterBind',
          'start.root.afterAttach',
          'start.root.afterAttachChildren',

          'goto(c1+c2)#1.c1.canEnter',
          'goto(c1+c2)#1.c2.canEnter',
          'goto(c1+c2)#1.c1.enter',
          'goto(c1+c2)#1.c2.enter',
          'goto(c1+c2)#1.c1.beforeBind',
          'goto(c1+c2)#1.c1.afterBind',
          'goto(c1+c2)#1.c1.afterAttach',
          'goto(c1+c2)#1.c1.afterAttachChildren',
          'goto(c1+c2)#1.c2.beforeBind',
          'goto(c1+c2)#1.c2.afterBind',
          'goto(c1+c2)#1.c2.afterAttach',
          'goto(c1+c2)#1.c2.afterAttachChildren',

          ...setNumber(goto_c3_c4, 1),

          'goto(c1+c2)#2.c3.canLeave',
          'goto(c1+c2)#2.c4.canLeave',
          'goto(c1+c2)#2.c1.canEnter',
          'goto(c1+c2)#2.c2.canEnter',
          'goto(c1+c2)#2.c3.leave',
          'goto(c1+c2)#2.c4.leave',
          'goto(c1+c2)#2.c1.enter',
          'goto(c1+c2)#2.c2.enter',
          'goto(c1+c2)#2.c1.beforeBind',
          'goto(c1+c2)#2.c1.afterBind',
          'goto(c1+c2)#2.c1.afterAttach',
          'goto(c1+c2)#2.c1.afterAttachChildren',
          'goto(c1+c2)#2.c3.beforeDetach',
          'goto(c1+c2)#2.c3.beforeUnbind',
          'goto(c1+c2)#2.c3.afterUnbind',
          'goto(c1+c2)#2.c3.afterUnbindChildren',
          'goto(c1+c2)#2.c2.beforeBind',
          'goto(c1+c2)#2.c2.afterBind',
          'goto(c1+c2)#2.c2.afterAttach',
          'goto(c1+c2)#2.c2.afterAttachChildren',
          'goto(c1+c2)#2.c4.beforeDetach',
          'goto(c1+c2)#2.c4.beforeUnbind',
          'goto(c1+c2)#2.c4.afterUnbind',
          'goto(c1+c2)#2.c4.afterUnbindChildren',

          ...setNumber(goto_c3_c4, 2),

          'stop.root.beforeDetach',
          'stop.root.beforeUnbind',
          'stop.root.afterUnbind',
          'stop.c3.beforeDetach',
          'stop.c3.beforeUnbind',
          'stop.c3.afterUnbind',
          'stop.c4.beforeDetach',
          'stop.c4.beforeUnbind',
          'stop.c4.afterUnbind',
          'stop.c3.afterUnbindChildren',
          'stop.c4.afterUnbindChildren',
          'stop.root.afterUnbindChildren',
        ],
      );

      hia.dispose();
    });

    it('p1/c1 -> p2/c2 -> p1/c1 -> p2/c2', async function () {
      @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
      class Root extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'p1', template: '<au-viewport></au-viewport>' })
      class P1 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'c1' })
      class C1 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'p2', template: '<au-viewport></au-viewport>' })
      class P2 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      @customElement({ name: 'c2' })
      class C2 extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      const { router, hia, tearDown } = await createFixture(Root, [P1, C1, P2, C2], getDefaultHIAConfig);

      hia.setPhase('goto(p1/c1)#1');
      await router.goto('p1/c1');

      hia.setPhase('goto(p2/c2)#1');
      await router.goto('p2/c2');

      hia.setPhase('goto(p1/c1)#2');
      await router.goto('p1/c1');

      hia.setPhase('goto(p2/c2)#2');
      await router.goto('p2/c2');

      await tearDown();

      const goto_p2_c2 = [
        'goto(p2/c2)#.p1.canLeave',
        'goto(p2/c2)#.c1.canLeave',
        'goto(p2/c2)#.p2.canEnter',
        'goto(p2/c2)#.p1.leave',
        'goto(p2/c2)#.c1.leave',
        'goto(p2/c2)#.p2.enter',
        'goto(p2/c2)#.p2.beforeBind',
        'goto(p2/c2)#.p2.afterBind',
        'goto(p2/c2)#.p2.afterAttach',
        'goto(p2/c2)#.p2.afterAttachChildren',
        'goto(p2/c2)#.p1.beforeDetach',
        'goto(p2/c2)#.p1.beforeUnbind',
        'goto(p2/c2)#.p1.afterUnbind',
        'goto(p2/c2)#.c1.beforeDetach',
        'goto(p2/c2)#.c1.beforeUnbind',
        'goto(p2/c2)#.c1.afterUnbind',
        'goto(p2/c2)#.c1.afterUnbindChildren',
        'goto(p2/c2)#.p1.afterUnbindChildren',
        'goto(p2/c2)#.c2.canEnter',
        'goto(p2/c2)#.c2.enter',
        'goto(p2/c2)#.c2.beforeBind',
        'goto(p2/c2)#.c2.afterBind',
        'goto(p2/c2)#.c2.afterAttach',
        'goto(p2/c2)#.c2.afterAttachChildren',
      ];

      assert.deepStrictEqual(
        hia.notifyHistory,
        [
          'start.root.beforeBind',
          'start.root.afterBind',
          'start.root.afterAttach',
          'start.root.afterAttachChildren',

          'goto(p1/c1)#1.p1.canEnter',
          'goto(p1/c1)#1.p1.enter',
          'goto(p1/c1)#1.p1.beforeBind',
          'goto(p1/c1)#1.p1.afterBind',
          'goto(p1/c1)#1.p1.afterAttach',
          'goto(p1/c1)#1.p1.afterAttachChildren',
          'goto(p1/c1)#1.c1.canEnter',
          'goto(p1/c1)#1.c1.enter',
          'goto(p1/c1)#1.c1.beforeBind',
          'goto(p1/c1)#1.c1.afterBind',
          'goto(p1/c1)#1.c1.afterAttach',
          'goto(p1/c1)#1.c1.afterAttachChildren',

          ...setNumber(goto_p2_c2, 1),

          'goto(p1/c1)#2.p2.canLeave',
          'goto(p1/c1)#2.c2.canLeave',
          'goto(p1/c1)#2.p1.canEnter',
          'goto(p1/c1)#2.p2.leave',
          'goto(p1/c1)#2.c2.leave',
          'goto(p1/c1)#2.p1.enter',
          'goto(p1/c1)#2.p1.beforeBind',
          'goto(p1/c1)#2.p1.afterBind',
          'goto(p1/c1)#2.p1.afterAttach',
          'goto(p1/c1)#2.p1.afterAttachChildren',
          'goto(p1/c1)#2.p2.beforeDetach',
          'goto(p1/c1)#2.p2.beforeUnbind',
          'goto(p1/c1)#2.p2.afterUnbind',
          'goto(p1/c1)#2.c2.beforeDetach',
          'goto(p1/c1)#2.c2.beforeUnbind',
          'goto(p1/c1)#2.c2.afterUnbind',
          'goto(p1/c1)#2.c2.afterUnbindChildren',
          'goto(p1/c1)#2.p2.afterUnbindChildren',
          'goto(p1/c1)#2.c1.canEnter',
          'goto(p1/c1)#2.c1.enter',
          'goto(p1/c1)#2.c1.beforeBind',
          'goto(p1/c1)#2.c1.afterBind',
          'goto(p1/c1)#2.c1.afterAttach',
          'goto(p1/c1)#2.c1.afterAttachChildren',

          ...setNumber(goto_p2_c2, 2),

          'stop.root.beforeDetach',
          'stop.root.beforeUnbind',
          'stop.root.afterUnbind',
          'stop.p2.beforeDetach',
          'stop.p2.beforeUnbind',
          'stop.p2.afterUnbind',
          'stop.c2.beforeDetach',
          'stop.c2.beforeUnbind',
          'stop.c2.afterUnbind',
          'stop.c2.afterUnbindChildren',
          'stop.p2.afterUnbindChildren',
          'stop.root.afterUnbindChildren',
        ],
      );

      hia.dispose();
    });
  });
});

function setNumber(strings: string[], num: number): string[] {
  const value = `#${num}`;
  return strings.map(function (s) {
    return s.replace('#', value);
  });
}
