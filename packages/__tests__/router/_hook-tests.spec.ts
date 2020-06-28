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
    @customElement({ name: 'a01', template: null })
    class A01 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }
    @customElement({ name: 'a02', template: null })
    class A02 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }
    @customElement({ name: 'a03', template: null })
    class A03 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }
    @customElement({ name: 'a04', template: null })
    class A04 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }

    const A0 = [A01, A02, A03, A04];

    @customElement({ name: 'root1', template: '<au-viewport></au-viewport>'.repeat(1) })
    class Root1 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }
    @customElement({ name: 'a11', template: '<au-viewport></au-viewport>'.repeat(1) })
    class A11 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }
    @customElement({ name: 'a12', template: '<au-viewport></au-viewport>'.repeat(1) })
    class A12 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }

    const A1 = [A11, A12];

    @customElement({ name: 'root2', template: '<au-viewport></au-viewport>'.repeat(2) })
    class Root2 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }
    @customElement({ name: 'a21', template: '<au-viewport></au-viewport>'.repeat(2) })
    class A21 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }
    @customElement({ name: 'a22', template: '<au-viewport></au-viewport>'.repeat(2) })
    class A22 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
    }

    const A2 = [A21, A22];

    const A = [...A0, ...A1, ...A2];

    for (const [$1, $2, $3, $4] of [
      ['a01', 'a02', 'a01', 'a02'],
      ['a01', 'a02', 'a03', 'a01'],
      ['a01', 'a02', 'a01', 'a04'],
    ]) {
      it(`${$1} -> ${$2} -> ${$3} -> ${$4}`, async function () {
        const { router, hia, tearDown } = await createFixture(Root1, A, getDefaultHIAConfig);

        hia.setPhase(`goto(${$1})#1`);
        await router.goto($1);

        hia.setPhase(`goto(${$2})#2`);
        await router.goto($2);

        hia.setPhase(`goto(${$3})#3`);
        await router.goto($3);

        hia.setPhase(`goto(${$4})#4`);
        await router.goto($4);

        await tearDown();

        function computeExpectedCalls(
          path: string,
          num: number,
          _1: string,
          _2: string,
        ): string[] {
          return [
            `goto(${path})#${num}.${_1}.canLeave`,
            `goto(${path})#${num}.${_2}.canEnter`,
            `goto(${path})#${num}.${_1}.leave`,
            `goto(${path})#${num}.${_2}.enter`,
            `goto(${path})#${num}.${_2}.beforeBind`,
            `goto(${path})#${num}.${_2}.afterBind`,
            `goto(${path})#${num}.${_2}.afterAttach`,
            `goto(${path})#${num}.${_2}.afterAttachChildren`,
            `goto(${path})#${num}.${_1}.beforeDetach`,
            `goto(${path})#${num}.${_1}.beforeUnbind`,
            `goto(${path})#${num}.${_1}.afterUnbind`,
            `goto(${path})#${num}.${_1}.afterUnbindChildren`,
          ];
        }

        assert.deepStrictEqual(
          hia.notifyHistory,
          [
            `start.root1.beforeBind`,
            `start.root1.afterBind`,
            `start.root1.afterAttach`,
            `start.root1.afterAttachChildren`,

            `goto(${$1})#1.${$1}.canEnter`,
            `goto(${$1})#1.${$1}.enter`,
            `goto(${$1})#1.${$1}.beforeBind`,
            `goto(${$1})#1.${$1}.afterBind`,
            `goto(${$1})#1.${$1}.afterAttach`,
            `goto(${$1})#1.${$1}.afterAttachChildren`,

            ...computeExpectedCalls($2, 2, $1, $2),

            ...computeExpectedCalls($3, 3, $2, $3),

            ...computeExpectedCalls($4, 4, $3, $4),

            `stop.root1.beforeDetach`,
            `stop.root1.beforeUnbind`,
            `stop.root1.afterUnbind`,
            `stop.${$4}.beforeDetach`,
            `stop.${$4}.beforeUnbind`,
            `stop.${$4}.afterUnbind`,
            `stop.${$4}.afterUnbindChildren`,
            `stop.root1.afterUnbindChildren`,
          ],
        );

        hia.dispose();
      });
    }

    for (const [[$1l, $1r], [$2l, $2r], [$3l, $3r], [$4l, $4r]] of [
      // Both left and right change with every nav
      [['a01','a02'], ['a03', 'a04'], ['a01', 'a02'], ['a03', 'a04']],
      [['a01','a02'], ['a02', 'a01'], ['a01', 'a02'], ['a02', 'a01']],
      [['a01','a02'], ['a04', 'a01'], ['a03', 'a04'], ['a04', 'a02']],
      // Only left changes with every nav
      [['a01','a02'], ['a03', 'a02'], ['a01', 'a02'], ['a03', 'a02']],
      [['a01','a02'], ['a02', 'a02'], ['a01', 'a02'], ['a02', 'a02']],
      // Only right changes with every nav
      [['a01','a02'], ['a01', 'a03'], ['a01', 'a02'], ['a01', 'a03']],
      [['a01','a02'], ['a01', 'a01'], ['a01', 'a02'], ['a01', 'a01']],
    ]) {
      const $1 = `${$1l}+${$1r}`;
      const $2 = `${$2l}+${$2r}`;
      const $3 = `${$3l}+${$3r}`;
      const $4 = `${$4l}+${$4r}`;
      it(`${$1} -> ${$2} -> ${$3} -> ${$4}`, async function () {
        const { router, hia, tearDown } = await createFixture(Root2, A, getDefaultHIAConfig);

        hia.setPhase(`goto(${$1})#1`);
        await router.goto($1);

        hia.setPhase(`goto(${$2})#2`);
        await router.goto($2);

        hia.setPhase(`goto(${$3})#3`);
        await router.goto($3);

        hia.setPhase(`goto(${$4})#4`);
        await router.goto($4);

        await tearDown();

        function computeExpectedCalls(
          path: string,
          num: number,
          _1l: string,
          _1r: string,
          _2l: string,
          _2r: string,
        ): string[] {
          if (_1l === _2l) {
            return [
              `goto(${path})#${num}.${_1r}.canLeave`,
              `goto(${path})#${num}.${_2r}.canEnter`,
              `goto(${path})#${num}.${_1r}.leave`,
              `goto(${path})#${num}.${_2r}.enter`,
              `goto(${path})#${num}.${_2r}.beforeBind`,
              `goto(${path})#${num}.${_2r}.afterBind`,
              `goto(${path})#${num}.${_2r}.afterAttach`,
              `goto(${path})#${num}.${_2r}.afterAttachChildren`,
              `goto(${path})#${num}.${_1r}.beforeDetach`,
              `goto(${path})#${num}.${_1r}.beforeUnbind`,
              `goto(${path})#${num}.${_1r}.afterUnbind`,
              `goto(${path})#${num}.${_1r}.afterUnbindChildren`,
            ];
          }

          if (_1r === _2r) {
            return [
              `goto(${path})#${num}.${_1l}.canLeave`,
              `goto(${path})#${num}.${_2l}.canEnter`,
              `goto(${path})#${num}.${_1l}.leave`,
              `goto(${path})#${num}.${_2l}.enter`,
              `goto(${path})#${num}.${_2l}.beforeBind`,
              `goto(${path})#${num}.${_2l}.afterBind`,
              `goto(${path})#${num}.${_2l}.afterAttach`,
              `goto(${path})#${num}.${_2l}.afterAttachChildren`,
              `goto(${path})#${num}.${_1l}.beforeDetach`,
              `goto(${path})#${num}.${_1l}.beforeUnbind`,
              `goto(${path})#${num}.${_1l}.afterUnbind`,
              `goto(${path})#${num}.${_1l}.afterUnbindChildren`,
            ];
          }

          return [
            `goto(${path})#${num}.${_1l}.canLeave`,
            `goto(${path})#${num}.${_1r}.canLeave`,
            `goto(${path})#${num}.${_2l}.canEnter`,
            `goto(${path})#${num}.${_2r}.canEnter`,
            `goto(${path})#${num}.${_1l}.leave`,
            `goto(${path})#${num}.${_1r}.leave`,
            `goto(${path})#${num}.${_2l}.enter`,
            `goto(${path})#${num}.${_2r}.enter`,
            `goto(${path})#${num}.${_2l}.beforeBind`,
            `goto(${path})#${num}.${_2l}.afterBind`,
            `goto(${path})#${num}.${_2l}.afterAttach`,
            `goto(${path})#${num}.${_2l}.afterAttachChildren`,
            `goto(${path})#${num}.${_1l}.beforeDetach`,
            `goto(${path})#${num}.${_1l}.beforeUnbind`,
            `goto(${path})#${num}.${_1l}.afterUnbind`,
            `goto(${path})#${num}.${_1l}.afterUnbindChildren`,
            `goto(${path})#${num}.${_2r}.beforeBind`,
            `goto(${path})#${num}.${_2r}.afterBind`,
            `goto(${path})#${num}.${_2r}.afterAttach`,
            `goto(${path})#${num}.${_2r}.afterAttachChildren`,
            `goto(${path})#${num}.${_1r}.beforeDetach`,
            `goto(${path})#${num}.${_1r}.beforeUnbind`,
            `goto(${path})#${num}.${_1r}.afterUnbind`,
            `goto(${path})#${num}.${_1r}.afterUnbindChildren`,
          ];
        }

        assert.deepStrictEqual(
          hia.notifyHistory,
          [
            `start.root2.beforeBind`,
            `start.root2.afterBind`,
            `start.root2.afterAttach`,
            `start.root2.afterAttachChildren`,

            `goto(${$1})#1.${$1l}.canEnter`,
            `goto(${$1})#1.${$1r}.canEnter`,
            `goto(${$1})#1.${$1l}.enter`,
            `goto(${$1})#1.${$1r}.enter`,
            `goto(${$1})#1.${$1l}.beforeBind`,
            `goto(${$1})#1.${$1l}.afterBind`,
            `goto(${$1})#1.${$1l}.afterAttach`,
            `goto(${$1})#1.${$1l}.afterAttachChildren`,
            `goto(${$1})#1.${$1r}.beforeBind`,
            `goto(${$1})#1.${$1r}.afterBind`,
            `goto(${$1})#1.${$1r}.afterAttach`,
            `goto(${$1})#1.${$1r}.afterAttachChildren`,

            ...computeExpectedCalls($2, 2, $1l, $1r, $2l, $2r),

            ...computeExpectedCalls($3, 3, $2l, $2r, $3l, $3r),

            ...computeExpectedCalls($4, 4, $3l, $3r, $4l, $4r),

            `stop.root2.beforeDetach`,
            `stop.root2.beforeUnbind`,
            `stop.root2.afterUnbind`,
            `stop.${$4l}.beforeDetach`,
            `stop.${$4l}.beforeUnbind`,
            `stop.${$4l}.afterUnbind`,
            `stop.${$4r}.beforeDetach`,
            `stop.${$4r}.beforeUnbind`,
            `stop.${$4r}.afterUnbind`,
            `stop.${$4l}.afterUnbindChildren`,
            `stop.${$4r}.afterUnbindChildren`,
            `stop.root2.afterUnbindChildren`,
          ],
        );

        hia.dispose();
      });
    }

    it('a11/a01 -> a12/a02 -> a11/a01 -> a12/a02', async function () {
      const { router, hia, tearDown } = await createFixture(Root1, A, getDefaultHIAConfig);

      hia.setPhase('goto(a11/a01)#1');
      await router.goto('a11/a01');

      hia.setPhase('goto(a12/a02)#1');
      await router.goto('a12/a02');

      hia.setPhase('goto(a11/a01)#2');
      await router.goto('a11/a01');

      hia.setPhase('goto(a12/a02)#2');
      await router.goto('a12/a02');

      await tearDown();

      const goto_p2_c2 = [
        'goto(a12/a02)#.a11.canLeave',
        'goto(a12/a02)#.a01.canLeave',
        'goto(a12/a02)#.a12.canEnter',
        'goto(a12/a02)#.a11.leave',
        'goto(a12/a02)#.a01.leave',
        'goto(a12/a02)#.a12.enter',
        'goto(a12/a02)#.a12.beforeBind',
        'goto(a12/a02)#.a12.afterBind',
        'goto(a12/a02)#.a12.afterAttach',
        'goto(a12/a02)#.a12.afterAttachChildren',
        'goto(a12/a02)#.a11.beforeDetach',
        'goto(a12/a02)#.a11.beforeUnbind',
        'goto(a12/a02)#.a11.afterUnbind',
        'goto(a12/a02)#.a01.beforeDetach',
        'goto(a12/a02)#.a01.beforeUnbind',
        'goto(a12/a02)#.a01.afterUnbind',
        'goto(a12/a02)#.a01.afterUnbindChildren',
        'goto(a12/a02)#.a11.afterUnbindChildren',
        'goto(a12/a02)#.a02.canEnter',
        'goto(a12/a02)#.a02.enter',
        'goto(a12/a02)#.a02.beforeBind',
        'goto(a12/a02)#.a02.afterBind',
        'goto(a12/a02)#.a02.afterAttach',
        'goto(a12/a02)#.a02.afterAttachChildren',
      ];

      assert.deepStrictEqual(
        hia.notifyHistory,
        [
          'start.root1.beforeBind',
          'start.root1.afterBind',
          'start.root1.afterAttach',
          'start.root1.afterAttachChildren',

          'goto(a11/a01)#1.a11.canEnter',
          'goto(a11/a01)#1.a11.enter',
          'goto(a11/a01)#1.a11.beforeBind',
          'goto(a11/a01)#1.a11.afterBind',
          'goto(a11/a01)#1.a11.afterAttach',
          'goto(a11/a01)#1.a11.afterAttachChildren',
          'goto(a11/a01)#1.a01.canEnter',
          'goto(a11/a01)#1.a01.enter',
          'goto(a11/a01)#1.a01.beforeBind',
          'goto(a11/a01)#1.a01.afterBind',
          'goto(a11/a01)#1.a01.afterAttach',
          'goto(a11/a01)#1.a01.afterAttachChildren',

          ...setNumber(goto_p2_c2, 1),

          'goto(a11/a01)#2.a12.canLeave',
          'goto(a11/a01)#2.a02.canLeave',
          'goto(a11/a01)#2.a11.canEnter',
          'goto(a11/a01)#2.a12.leave',
          'goto(a11/a01)#2.a02.leave',
          'goto(a11/a01)#2.a11.enter',
          'goto(a11/a01)#2.a11.beforeBind',
          'goto(a11/a01)#2.a11.afterBind',
          'goto(a11/a01)#2.a11.afterAttach',
          'goto(a11/a01)#2.a11.afterAttachChildren',
          'goto(a11/a01)#2.a12.beforeDetach',
          'goto(a11/a01)#2.a12.beforeUnbind',
          'goto(a11/a01)#2.a12.afterUnbind',
          'goto(a11/a01)#2.a02.beforeDetach',
          'goto(a11/a01)#2.a02.beforeUnbind',
          'goto(a11/a01)#2.a02.afterUnbind',
          'goto(a11/a01)#2.a02.afterUnbindChildren',
          'goto(a11/a01)#2.a12.afterUnbindChildren',
          'goto(a11/a01)#2.a01.canEnter',
          'goto(a11/a01)#2.a01.enter',
          'goto(a11/a01)#2.a01.beforeBind',
          'goto(a11/a01)#2.a01.afterBind',
          'goto(a11/a01)#2.a01.afterAttach',
          'goto(a11/a01)#2.a01.afterAttachChildren',

          ...setNumber(goto_p2_c2, 2),

          'stop.root1.beforeDetach',
          'stop.root1.beforeUnbind',
          'stop.root1.afterUnbind',
          'stop.a12.beforeDetach',
          'stop.a12.beforeUnbind',
          'stop.a12.afterUnbind',
          'stop.a02.beforeDetach',
          'stop.a02.beforeUnbind',
          'stop.a02.afterUnbind',
          'stop.a02.afterUnbindChildren',
          'stop.a12.afterUnbindChildren',
          'stop.root1.afterUnbindChildren',
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
