import { Constructable, Registration, LogLevel, ILogConfig } from '@aurelia/kernel';
import { Aurelia, customElement } from '@aurelia/runtime';
import { RouterConfiguration, IRouter, IRouterOptions } from '@aurelia/router';
import { TestContext, assert } from '@aurelia/testing';

import { TestRouterConfiguration, } from './_shared/configuration';
import { IHIAConfig, IHookInvocationAggregator } from './_shared/hook-invocation-tracker';
import { TestRouteViewModelBase, HookSpecs } from './_shared/view-models';
import { hookSpecs } from './_shared/hook-spec';

async function createFixture<T extends Constructable>(
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

function getDefaultRouterOptions(): IRouterOptions {
  return {};
}

function vp(count: number): string {
  if (count === 1) {
    return `<au-viewport></au-viewport>`;
  }
  let template = '';
  for (let i = 0; i < count; ++i) {
    template = `${template}<au-viewport name="$${i}"></au-viewport>`;
  }
  return template;
}

describe('router hooks', function () {
  const strategies = [
    'static',
    'dynamic',
  ] as const;

  const timings = [
    'sync',
    'async1',
    'async2',
  ] as const;

  for (const timing of timings) {
    const async = timing !== 'sync';

    const $hookSpecs = HookSpecs.create({
      beforeBind: hookSpecs.beforeBind[timing],
      afterBind: hookSpecs.afterBind[timing],
      afterAttach: hookSpecs.afterAttach[timing],
      afterAttachChildren: hookSpecs.afterAttachChildren[timing],

      beforeDetach: hookSpecs.beforeDetach[timing],
      beforeUnbind: hookSpecs.beforeUnbind[timing],
      afterUnbind: hookSpecs.afterUnbind[timing],
      afterUnbindChildren: hookSpecs.afterUnbindChildren[timing],

      canEnter: hookSpecs.canEnter[timing],
      enter: hookSpecs.enter[timing],
      canLeave: hookSpecs.canLeave[timing],
      leave: hookSpecs.leave[timing],
    });

    describe(`all ${timing}`, function () {
      describe('simple cases', function () {
        @customElement({ name: 'a01', template: null })
        class A01 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }
        @customElement({ name: 'a02', template: null })
        class A02 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }
        @customElement({ name: 'a03', template: null })
        class A03 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }
        @customElement({ name: 'a04', template: null })
        class A04 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }

        const A0 = [A01, A02, A03, A04];

        @customElement({ name: 'root1', template: vp(1) })
        class Root1 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }
        @customElement({ name: 'a11', template: vp(1) })
        class A11 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }
        @customElement({ name: 'a12', template: vp(1) })
        class A12 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }
        @customElement({ name: 'a13', template: vp(1) })
        class A13 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }
        @customElement({ name: 'a14', template: vp(1) })
        class A14 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }

        const A1 = [A11, A12, A13, A14];

        @customElement({ name: 'root2', template: vp(2) })
        class Root2 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }
        @customElement({ name: 'a21', template: vp(2) })
        class A21 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }
        @customElement({ name: 'a22', template: vp(2) })
        class A22 extends TestRouteViewModelBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, $hookSpecs); }
        }

        const A2 = [A21, A22];

        const A = [...A0, ...A1, ...A2];

        for (const strategy of strategies) {
          const getRouterOptions = (): IRouterOptions => {
            return {
              resolutionStrategy: strategy,
            };
          };

          describe(`strategy: '${strategy}'`, function () {
            for (const [$1, $2, $3, $4] of [
              ['a01', 'a02', 'a01', 'a02'],
              ['a01', 'a02', 'a03', 'a01'],
              ['a01', 'a02', 'a01', 'a04'],
            ]) {
              it(`'${$1}' -> '${$2}' -> '${$3}' -> '${$4}'`, async function () {
                const { router, hia, tearDown } = await createFixture(Root1, A, getDefaultHIAConfig, getRouterOptions);

                const t1 = `('' -> '${$1}')#1`;
                const t2 = `('${$1}' -> '${$2}')#2`;
                const t3 = `('${$2}' -> '${$3}')#3`;
                const t4 = `('${$3}' -> '${$4}')#4`;

                hia.setPhase(t1);
                await router.goto($1);

                hia.setPhase(t2);
                await router.goto($2);

                hia.setPhase(t3);
                await router.goto($3);

                hia.setPhase(t4);
                await router.goto($4);

                await tearDown();

                assert.deepStrictEqual(
                  hia.notifyHistory,
                  [
                    `start.root1.beforeBind`,
                    `start.root1.afterBind`,
                    `start.root1.afterAttach`,
                    `start.root1.afterAttachChildren`,

                    ...getCalls[`'' -> $x`](t1, $1),

                    ...getCalls[`$1 -> $2`](t2, $1, $2),

                    ...getCalls[`$1 -> $2`](t3, $2, $3),

                    ...getCalls[`$1 -> $2`](t4, $3, $4),

                    `stop.root1.beforeDetach`,
                    `stop.root1.beforeUnbind`,
                    `stop.root1.afterUnbind`,

                    ...getCalls[`$x -> ''`](`stop`, $4, true),

                    `stop.root1.afterUnbindChildren`,
                  ],
                );

                hia.dispose();
              });
            }

            for (const [[$1$0, $1$1], [$2$0, $2$1]] of [
              // Only $0 changes with every nav
              [['a01', 'a02'], ['a03', 'a02']],
              [[''   , 'a02'], ['a03', 'a02']],
              [['a01', 'a02'], [''   , 'a02']],

              [['a01', 'a02'], ['a02', 'a02']],
              [[''   , 'a02'], ['a02', 'a02']],
              [['a01', 'a02'], [''   , 'a02']],

              [['a02', 'a02'], ['a01', 'a02']],
              [[''   , 'a02'], ['a01', 'a02']],
              [['a02', 'a02'], [''   , 'a02']],
              // Only $1 changes with every nav
              [['a01', 'a02'], ['a01', 'a03']],
              [['a01', ''   ], ['a01', 'a03']],
              [['a01', 'a02'], ['a01', ''   ]],

              [['a01', 'a02'], ['a01', 'a01']],
              [['a01', ''   ], ['a01', 'a01']],
              [['a01', 'a02'], ['a01', ''   ]],

              [['a01', 'a01'], ['a01', 'a02']],
              [['a01', ''   ], ['a01', 'a02']],
              [['a01', 'a01'], ['a01', ''   ]],
              // Both $0 and $1 change with every nav
              [['a01', 'a02'], ['a03', 'a04']],
              [[''   , 'a02'], ['a03', 'a04']],
              [['a01', ''   ], ['a03', 'a04']],
              [['a01', 'a02'], [''   , 'a04']],
              [['a01', 'a02'], ['a03', ''   ]],

              [['a01', 'a02'], ['a02', 'a01']],
              [[''   , 'a02'], ['a02', 'a01']],
              [['a01', ''   ], ['a02', 'a01']],
              [['a01', 'a02'], [''   , 'a01']],
              [['a01', 'a02'], ['a02', ''   ]],

              [['a01', 'a02'], ['a04', 'a01']],
              [[''   , 'a02'], ['a04', 'a01']],
              [['a01', ''   ], ['a04', 'a01']],
              [['a01', 'a02'], [''   , 'a01']],
              [['a01', 'a02'], ['a04', ''   ]],
            ]) {
              const $1 = join('+', `${$1$0}@$0`, `${$1$1}@$1`);
              const $2 = join('+', `${$2$0}@$0`, `${$2$1}@$1`);
              it(`${$1}' -> '${$2}' -> '${$1}' -> '${$2}'`, async function () {
                const { router, hia, tearDown } = await createFixture(Root2, A, getDefaultHIAConfig, getRouterOptions);

                const t1 = `('' -> '${$1}')#1`;
                const t2 = `('${$1}' -> '${$2}')#2`;
                const t3 = `('${$2}' -> '${$1}')#3`;
                const t4 = `('${$1}' -> '${$2}')#4`;

                hia.setPhase(t1);
                await router.goto($1);

                hia.setPhase(t2);
                await router.goto($2);

                hia.setPhase(t3);
                await router.goto($1);

                hia.setPhase(t4);
                await router.goto($2);

                await tearDown();

                assert.deepStrictEqual(
                  hia.notifyHistory,
                  [
                    `start.root2.beforeBind`,
                    `start.root2.afterBind`,
                    `start.root2.afterAttach`,
                    `start.root2.afterAttachChildren`,

                    ...getCalls[`'' -> $x$0+$x$1`](t1, $1$0, $1$1, async),

                    ...getCalls[`$1$0+$1$1 -> $2$0+$2$1`](t2, $1$0, $1$1, $2$0, $2$1, async),

                    ...getCalls[`$1$0+$1$1 -> $2$0+$2$1`](t3, $2$0, $2$1, $1$0, $1$1, async),

                    ...getCalls[`$1$0+$1$1 -> $2$0+$2$1`](t4, $1$0, $1$1, $2$0, $2$1, async),

                    `stop.root2.beforeDetach`,
                    `stop.root2.beforeUnbind`,
                    `stop.root2.afterUnbind`,

                    ...getCalls[`$x$0+$x$1 -> ''`](`stop`, $2$0, $2$1, true, async),

                    `stop.root2.afterUnbindChildren`,
                  ],
                );

                hia.dispose();
              });
            }

            for (const [[$1p, $1c], [$2p, $2c]] of [
              // Only parent changes with every nav
              [['a11', 'a12'], ['a13', 'a12']],
              [['a11', 'a12'], ['a12', 'a12']],
              [['a12', 'a12'], ['a11', 'a12']],
              // Only child changes with every nav
              [['a11', 'a01'], ['a11', 'a02']],
              [['a11', ''   ], ['a11', 'a02']],
              [['a11', 'a01'], ['a11', ''   ]],

              [['a11', 'a11'], ['a11', 'a02']],
              [['a11', 'a11'], ['a11', ''   ]],

              [['a11', 'a01'], ['a11', 'a11']],
              [['a11', ''   ], ['a11', 'a11']],
              // Both parent and child change with every nav
              [['a11', 'a01'], ['a12', 'a02']],
              [['a11', ''   ], ['a12', 'a02']],
              [['a11', 'a01'], ['a12', ''   ]],

              [['a11', 'a11'], ['a12', 'a02']],
              [['a11', 'a11'], ['a12', 'a12']],
              [['a11', 'a11'], ['a12', ''   ]],

              [['a12', 'a02'], ['a11', 'a11']],
              [['a12', 'a12'], ['a11', 'a11']],
              [['a12', ''   ], ['a11', 'a11']],

              [['a11', 'a12'], ['a13', 'a14']],
              [['a11', 'a12'], ['a13', 'a11']],

              [['a13', 'a14'], ['a11', 'a12']],
              [['a13', 'a11'], ['a11', 'a12']],
            ]) {
              const $1 = join('/', $1p, $1c);
              const $2 = join('/', $2p, $2c);
              it(`'${$1}' -> '${$2}' -> '${$1}' -> '${$2}'`, async function () {
                const { router, hia, tearDown } = await createFixture(Root1, A, getDefaultHIAConfig, getRouterOptions);

                const t1 = `('' -> '${$1}')#1`;
                const t2 = `('${$1}' -> '${$2}')#2`;
                const t3 = `('${$2}' -> '${$1}')#3`;
                const t4 = `('${$1}' -> '${$2}')#4`;

                hia.setPhase(t1);
                await router.goto($1);

                hia.setPhase(t2);
                await router.goto($2);

                hia.setPhase(t3);
                await router.goto($1);

                hia.setPhase(t4);
                await router.goto($2);

                await tearDown();

                assert.deepStrictEqual(
                  hia.notifyHistory,
                  [
                    `start.root1.beforeBind`,
                    `start.root1.afterBind`,
                    `start.root1.afterAttach`,
                    `start.root1.afterAttachChildren`,

                    ...getCalls[`'' -> $x$p/$x$c`](t1, $1p, $1c, strategy),

                    ...getCalls[`$1$p/$1$c -> $2$p/$2$c`](t2, $1p, $1c, $2p, $2c, strategy),

                    ...getCalls[`$1$p/$1$c -> $2$p/$2$c`](t3, $2p, $2c, $1p, $1c, strategy),

                    ...getCalls[`$1$p/$1$c -> $2$p/$2$c`](t4, $1p, $1c, $2p, $2c, strategy),

                    `stop.root1.beforeDetach`,
                    `stop.root1.beforeUnbind`,
                    `stop.root1.afterUnbind`,

                    ...getCalls[`$x$p/$x$c -> ''`](`stop`, $2p, $2c, true),

                    `stop.root1.afterUnbindChildren`,
                  ],
                );

                hia.dispose();
              });
            }
          });
        }
      });
    });
  }

  describe('variations', function () {
    it(`'a/b/c/d' -> 'a' (c.leave: setTimeout_0)`, async function () {
      @customElement({ name: 'root', template: '<au-viewport>' })
      class Root extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
          super(hia);
        }
      }
      @customElement({ name: 'a', template: '<au-viewport>' })
      class A extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
          super(hia);
        }
      }
      @customElement({ name: 'b', template: '<au-viewport>' })
      class B extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
          super(hia);
        }
      }
      @customElement({ name: 'c', template: '<au-viewport>' })
      class C extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
          super(hia, HookSpecs.create({ leave: hookSpecs.leave.setTimeout_0 }));
        }
      }
      @customElement({ name: 'd', template: null })
      class D extends TestRouteViewModelBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
          super(hia);
        }
      }

      const { router, hia, tearDown } = await createFixture(Root, [A, B, C, D], getDefaultHIAConfig, getDefaultRouterOptions);

      hia.setPhase(`('' -> 'a/b/c/d')`);
      await router.goto('a/b/c/d');

      hia.setPhase(`('a/b/c/d' -> 'a')`);
      await router.goto('a');

      await tearDown();

      assert.deepStrictEqual(
        hia.notifyHistory,
        [
          `start.root.beforeBind`,
          `start.root.afterBind`,
          `start.root.afterAttach`,
          `start.root.afterAttachChildren`,

          `('' -> 'a/b/c/d').a.canEnter`,
          `('' -> 'a/b/c/d').a.enter`,
          `('' -> 'a/b/c/d').a.beforeBind`,
          `('' -> 'a/b/c/d').a.afterBind`,
          `('' -> 'a/b/c/d').a.afterAttach`,
          `('' -> 'a/b/c/d').a.afterAttachChildren`,

          `('' -> 'a/b/c/d').b.canEnter`,
          `('' -> 'a/b/c/d').b.enter`,
          `('' -> 'a/b/c/d').b.beforeBind`,
          `('' -> 'a/b/c/d').b.afterBind`,
          `('' -> 'a/b/c/d').b.afterAttach`,
          `('' -> 'a/b/c/d').b.afterAttachChildren`,

          `('' -> 'a/b/c/d').c.canEnter`,
          `('' -> 'a/b/c/d').c.enter`,
          `('' -> 'a/b/c/d').c.beforeBind`,
          `('' -> 'a/b/c/d').c.afterBind`,
          `('' -> 'a/b/c/d').c.afterAttach`,
          `('' -> 'a/b/c/d').c.afterAttachChildren`,

          `('' -> 'a/b/c/d').d.canEnter`,
          `('' -> 'a/b/c/d').d.enter`,
          `('' -> 'a/b/c/d').d.beforeBind`,
          `('' -> 'a/b/c/d').d.afterBind`,
          `('' -> 'a/b/c/d').d.afterAttach`,
          `('' -> 'a/b/c/d').d.afterAttachChildren`,

          `('a/b/c/d' -> 'a').b.canLeave`,
          `('a/b/c/d' -> 'a').c.canLeave`,
          `('a/b/c/d' -> 'a').d.canLeave`,

          `('a/b/c/d' -> 'a').b.leave`,
          `('a/b/c/d' -> 'a').c.leave`,
          `('a/b/c/d' -> 'a').d.leave`,

          `('a/b/c/d' -> 'a').b.beforeDetach`,
          `('a/b/c/d' -> 'a').b.beforeUnbind`,
          `('a/b/c/d' -> 'a').b.afterUnbind`,
          `('a/b/c/d' -> 'a').c.beforeDetach`,
          `('a/b/c/d' -> 'a').c.beforeUnbind`,
          `('a/b/c/d' -> 'a').c.afterUnbind`,
          `('a/b/c/d' -> 'a').d.beforeDetach`,
          `('a/b/c/d' -> 'a').d.beforeUnbind`,
          `('a/b/c/d' -> 'a').d.afterUnbind`,
          `('a/b/c/d' -> 'a').d.afterUnbindChildren`,
          `('a/b/c/d' -> 'a').c.afterUnbindChildren`,
          `('a/b/c/d' -> 'a').b.afterUnbindChildren`,
          `('a/b/c/d' -> 'a').b.dispose`,
          `('a/b/c/d' -> 'a').c.dispose`,
          `('a/b/c/d' -> 'a').d.dispose`,

          `stop.root.beforeDetach`,
          `stop.root.beforeUnbind`,
          `stop.root.afterUnbind`,

          `stop.a.beforeDetach`,
          `stop.a.beforeUnbind`,
          `stop.a.afterUnbind`,
          `stop.a.afterUnbindChildren`,

          `stop.root.afterUnbindChildren`,
        ],
      );

      hia.dispose();
    });
  });
});

function addIf(
  condition: boolean,
  itemsIfTrue: string[] = [],
  itemsIfFalse: string[] = [],
): string[] {
  return condition ? itemsIfTrue : itemsIfFalse;
}

function join(sep: string, ...parts: string[]): string {
  return parts.filter(function (x) {
    return x.length > 0 && x.split('@')[0].length > 0;
  }).join(sep);
}

const getCalls = {
  [`$x -> ''`](
    prefix: string,
    $x: string,
    isStopPhase: boolean,
  ): string[] {
    return [
      ...addIf(
        !isStopPhase,
        [
          `${prefix}.${$x}.canLeave`,
          `${prefix}.${$x}.leave`,
        ],
      ),
      `${prefix}.${$x}.beforeDetach`,
      `${prefix}.${$x}.beforeUnbind`,
      `${prefix}.${$x}.afterUnbind`,
      `${prefix}.${$x}.afterUnbindChildren`,
      ...addIf(
        !isStopPhase,
        [
          `${prefix}.${$x}.dispose`,
        ],
      ),
    ];
  },
  [`'' -> $x`](
    prefix: string,
    $x: string,
  ): string[] {
    return [
      `${prefix}.${$x}.canEnter`,
      `${prefix}.${$x}.enter`,

      `${prefix}.${$x}.beforeBind`,
      `${prefix}.${$x}.afterBind`,
      `${prefix}.${$x}.afterAttach`,
      `${prefix}.${$x}.afterAttachChildren`,
    ];
  },
  [`$1 -> $2`](
    prefix: string,
    $1: string,
    $2: string,
  ): string[] {
    if ($1 === '') {
      return getCalls[`'' -> $x`](prefix, $2);
    }

    if ($2 === '') {
      return getCalls[`$x -> ''`](prefix, $1, false);
    }

    return [
      `${prefix}.${$1}.canLeave`,
      `${prefix}.${$2}.canEnter`,
      `${prefix}.${$1}.leave`,
      `${prefix}.${$2}.enter`,

      `${prefix}.${$2}.beforeBind`,
      `${prefix}.${$2}.afterBind`,
      `${prefix}.${$2}.afterAttach`,
      `${prefix}.${$2}.afterAttachChildren`,
      `${prefix}.${$1}.beforeDetach`,
      `${prefix}.${$1}.beforeUnbind`,
      `${prefix}.${$1}.afterUnbind`,
      `${prefix}.${$1}.afterUnbindChildren`,
      `${prefix}.${$1}.dispose`,
    ];
  },
  [`'' -> $x$0+$x$1`](
    prefix: string,
    $x$0: string,
    $x$1: string,
    async: boolean,
  ): string[] {
    if ($x$0 === '') {
      return getCalls[`'' -> $x`](prefix, $x$1);
    }

    if ($x$1 === '') {
      return getCalls[`'' -> $x`](prefix, $x$0);
    }

    return [
      `${prefix}.${$x$0}.canEnter`,
      `${prefix}.${$x$1}.canEnter`,
      `${prefix}.${$x$0}.enter`,
      `${prefix}.${$x$1}.enter`,

      ...addIf(
        async,
        [
          `${prefix}.${$x$0}.beforeBind`,
          `${prefix}.${$x$1}.beforeBind`,
          `${prefix}.${$x$0}.afterBind`,
          `${prefix}.${$x$1}.afterBind`,
          `${prefix}.${$x$0}.afterAttach`,
          `${prefix}.${$x$1}.afterAttach`,
          `${prefix}.${$x$0}.afterAttachChildren`,
          `${prefix}.${$x$1}.afterAttachChildren`,
        ],
        [
          `${prefix}.${$x$0}.beforeBind`,
          `${prefix}.${$x$0}.afterBind`,
          `${prefix}.${$x$0}.afterAttach`,
          `${prefix}.${$x$0}.afterAttachChildren`,
          `${prefix}.${$x$1}.beforeBind`,
          `${prefix}.${$x$1}.afterBind`,
          `${prefix}.${$x$1}.afterAttach`,
          `${prefix}.${$x$1}.afterAttachChildren`,
        ],
      ),
    ];
  },
  [`$x$0+$x$1 -> ''`](
    prefix: string,
    $x$0: string,
    $x$1: string,
    isStopPhase: boolean,
    async: boolean,
  ): string[] {
    if ($x$0 === '') {
      return getCalls[`$x -> ''`](prefix, $x$1, isStopPhase);
    }

    if ($x$1 === '') {
      return getCalls[`$x -> ''`](prefix, $x$0, isStopPhase);
    }

    if (isStopPhase) {
      if (async) {
        return [
          `${prefix}.${$x$0}.beforeDetach`,
          `${prefix}.${$x$1}.beforeDetach`,
          `${prefix}.${$x$0}.beforeUnbind`,
          `${prefix}.${$x$1}.beforeUnbind`,
          `${prefix}.${$x$0}.afterUnbind`,
          `${prefix}.${$x$1}.afterUnbind`,
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$1}.afterUnbindChildren`,
        ];
      }

      // In 'stop' phase, reason the last two hooks are ordered the way they are is
      // because the controllers are linked to the parent controller in `deactivate` and so those hooks only
      // happen after everything else happened.
      // This linking does not occur in the same way when controllers are deactivated in isolation by the router.
      return [
        `${prefix}.${$x$0}.beforeDetach`,
        `${prefix}.${$x$0}.beforeUnbind`,
        `${prefix}.${$x$0}.afterUnbind`,
        `${prefix}.${$x$1}.beforeDetach`,
        `${prefix}.${$x$1}.beforeUnbind`,
        `${prefix}.${$x$1}.afterUnbind`,
        `${prefix}.${$x$0}.afterUnbindChildren`,
        `${prefix}.${$x$1}.afterUnbindChildren`,
      ];
    }

    return [
      `${prefix}.${$x$0}.canLeave`,
      `${prefix}.${$x$1}.canLeave`,
      `${prefix}.${$x$0}.leave`,
      `${prefix}.${$x$1}.leave`,

      ...addIf(
        async,
        [
          `${prefix}.${$x$0}.beforeDetach`,
          `${prefix}.${$x$1}.beforeDetach`,
          `${prefix}.${$x$0}.beforeUnbind`,
          `${prefix}.${$x$1}.beforeUnbind`,
          `${prefix}.${$x$0}.afterUnbind`,
          `${prefix}.${$x$1}.afterUnbind`,
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$1}.afterUnbindChildren`,
          `${prefix}.${$x$1}.dispose`,
          `${prefix}.${$x$0}.dispose`,
        ],
        [
          `${prefix}.${$x$0}.beforeDetach`,
          `${prefix}.${$x$0}.beforeUnbind`,
          `${prefix}.${$x$0}.afterUnbind`,
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$0}.dispose`,
          `${prefix}.${$x$1}.beforeDetach`,
          `${prefix}.${$x$1}.beforeUnbind`,
          `${prefix}.${$x$1}.afterUnbind`,
          `${prefix}.${$x$1}.afterUnbindChildren`,
          `${prefix}.${$x$1}.dispose`,
        ],
      ),
    ];
  },
  [`$1$0+$1$1 -> $2$0+$2$1`](
    prefix: string,
    $1$0: string,
    $1$1: string,
    $2$0: string,
    $2$1: string,
    async: boolean,
  ): string[] {
    if ($1$0 === $2$0) {
      return getCalls[`$1 -> $2`](prefix, $1$1, $2$1);
    }

    if ($1$1 === $2$1) {
      return getCalls[`$1 -> $2`](prefix, $1$0, $2$0);
    }

    if ($1$0 === '') {
      if ($1$1 === '') {
        return getCalls[`'' -> $x$0+$x$1`](prefix, $2$0, $2$1, async);
      }
      if ($2$1 === '') {
        return getCalls[`'' -> $x$0+$x$1`](prefix, $2$0, $1$1, async);
      }

      return [
        `${prefix}.${$1$1}.canLeave`,
        `${prefix}.${$2$0}.canEnter`,
        `${prefix}.${$2$1}.canEnter`,
        `${prefix}.${$1$1}.leave`,
        `${prefix}.${$2$0}.enter`,
        `${prefix}.${$2$1}.enter`,

        ...addIf(
          async,
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
          ],
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
          ],
        ),
      ];
    }

    if ($1$1 === '') {
      return [
        `${prefix}.${$1$0}.canLeave`,
        `${prefix}.${$2$0}.canEnter`,
        `${prefix}.${$2$1}.canEnter`,
        `${prefix}.${$1$0}.leave`,
        `${prefix}.${$2$0}.enter`,
        `${prefix}.${$2$1}.enter`,

        ...addIf(
          async,
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
          ],
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$1}.afterAttachChildren`,
          ],
        ),
      ];
    }

    if ($2$0 === '') {
      if ($1$1 === '') {
        return getCalls[`$x$0+$x$1 -> ''`](prefix, $1$0, $2$1, false, async);
      }
      if ($2$1 === '') {
        return getCalls[`$x$0+$x$1 -> ''`](prefix, $1$0, $1$1, false, async);
      }

      return [
        `${prefix}.${$1$0}.canLeave`,
        `${prefix}.${$1$1}.canLeave`,
        `${prefix}.${$2$1}.canEnter`,
        `${prefix}.${$1$0}.leave`,
        `${prefix}.${$1$1}.leave`,
        `${prefix}.${$2$1}.enter`,

        ...addIf(
          async,
          [
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
          ],
          [
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
          ],
        ),
      ];
    }

    if ($2$1 === '') {
      return [
        `${prefix}.${$1$0}.canLeave`,
        `${prefix}.${$1$1}.canLeave`,
        `${prefix}.${$2$0}.canEnter`,
        `${prefix}.${$1$0}.leave`,
        `${prefix}.${$1$1}.leave`,
        `${prefix}.${$2$0}.enter`,

        ...addIf(
          async,
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
          ],
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
          ],
        ),
      ];
    }

    return [
      `${prefix}.${$1$0}.canLeave`,
      `${prefix}.${$1$1}.canLeave`,
      `${prefix}.${$2$0}.canEnter`,
      `${prefix}.${$2$1}.canEnter`,
      `${prefix}.${$1$0}.leave`,
      `${prefix}.${$1$1}.leave`,
      `${prefix}.${$2$0}.enter`,
      `${prefix}.${$2$1}.enter`,

      ...addIf(
        async,
        [
          `${prefix}.${$2$0}.beforeBind`,
          `${prefix}.${$2$1}.beforeBind`,
          `${prefix}.${$2$0}.afterBind`,
          `${prefix}.${$2$1}.afterBind`,
          `${prefix}.${$2$0}.afterAttach`,
          `${prefix}.${$2$1}.afterAttach`,
          `${prefix}.${$2$0}.afterAttachChildren`,
          `${prefix}.${$2$1}.afterAttachChildren`,
          `${prefix}.${$1$0}.beforeDetach`,
          `${prefix}.${$1$1}.beforeDetach`,
          `${prefix}.${$1$0}.beforeUnbind`,
          `${prefix}.${$1$1}.beforeUnbind`,
          `${prefix}.${$1$0}.afterUnbind`,
          `${prefix}.${$1$1}.afterUnbind`,
          `${prefix}.${$1$0}.afterUnbindChildren`,
          `${prefix}.${$1$1}.afterUnbindChildren`,
          `${prefix}.${$1$0}.dispose`,
          `${prefix}.${$1$1}.dispose`,
        ],
        [
          `${prefix}.${$2$0}.beforeBind`,
          `${prefix}.${$2$0}.afterBind`,
          `${prefix}.${$2$0}.afterAttach`,
          `${prefix}.${$2$0}.afterAttachChildren`,
          `${prefix}.${$1$0}.beforeDetach`,
          `${prefix}.${$1$0}.beforeUnbind`,
          `${prefix}.${$1$0}.afterUnbind`,
          `${prefix}.${$1$0}.afterUnbindChildren`,
          `${prefix}.${$1$0}.dispose`,
          `${prefix}.${$2$1}.beforeBind`,
          `${prefix}.${$2$1}.afterBind`,
          `${prefix}.${$2$1}.afterAttach`,
          `${prefix}.${$2$1}.afterAttachChildren`,
          `${prefix}.${$1$1}.beforeDetach`,
          `${prefix}.${$1$1}.beforeUnbind`,
          `${prefix}.${$1$1}.afterUnbind`,
          `${prefix}.${$1$1}.afterUnbindChildren`,
          `${prefix}.${$1$1}.dispose`,
        ],
      ),
    ];
  },
  [`'' -> $x$p/$x$c`](
    prefix: string,
    $x$p: string,
    $x$c: string,
    strategy: 'static' | 'dynamic',
  ): string[] {
    if ($x$c === '') {
      return getCalls[`'' -> $x`](prefix, $x$p);
    }

    switch (strategy) {
      case 'static':
        return [
          `${prefix}.${$x$p}.canEnter`,
          `${prefix}.${$x$c}.canEnter`,
          `${prefix}.${$x$p}.enter`,
          `${prefix}.${$x$c}.enter`,

          `${prefix}.${$x$p}.beforeBind`,
          `${prefix}.${$x$p}.afterBind`,
          `${prefix}.${$x$p}.afterAttach`,
          `${prefix}.${$x$c}.beforeBind`,
          `${prefix}.${$x$c}.afterBind`,
          `${prefix}.${$x$c}.afterAttach`,
          `${prefix}.${$x$c}.afterAttachChildren`,
          `${prefix}.${$x$p}.afterAttachChildren`,
        ];
      case 'dynamic':
        return [
          `${prefix}.${$x$p}.canEnter`,
          `${prefix}.${$x$p}.enter`,

          `${prefix}.${$x$p}.beforeBind`,
          `${prefix}.${$x$p}.afterBind`,
          `${prefix}.${$x$p}.afterAttach`,
          `${prefix}.${$x$p}.afterAttachChildren`,

          `${prefix}.${$x$c}.canEnter`,
          `${prefix}.${$x$c}.enter`,

          `${prefix}.${$x$c}.beforeBind`,
          `${prefix}.${$x$c}.afterBind`,
          `${prefix}.${$x$c}.afterAttach`,
          `${prefix}.${$x$c}.afterAttachChildren`,
        ];
    }
  },
  [`$x$p/$x$c -> ''`](
    prefix: string,
    $x$p: string,
    $x$c: string,
    isStopPhase: boolean,
  ): string[] {
    if ($x$c === '') {
      return getCalls[`$x -> ''`](prefix, $x$p, isStopPhase);
    }

    return [
      ...addIf(
        !isStopPhase,
        [
          `${prefix}.${$x$p}.canLeave`,
          `${prefix}.${$x$c}.canLeave`,
          `${prefix}.${$x$p}.leave`,
          `${prefix}.${$x$c}.leave`,
        ],
      ),
      `${prefix}.${$x$p}.beforeDetach`,
      `${prefix}.${$x$p}.beforeUnbind`,
      `${prefix}.${$x$p}.afterUnbind`,
      `${prefix}.${$x$c}.beforeDetach`,
      `${prefix}.${$x$c}.beforeUnbind`,
      `${prefix}.${$x$c}.afterUnbind`,
      `${prefix}.${$x$c}.afterUnbindChildren`,
      `${prefix}.${$x$p}.afterUnbindChildren`,
      ...addIf(
        !isStopPhase,
        [
          `${prefix}.${$x$p}.dispose`,
          `${prefix}.${$x$c}.dispose`,
        ],
      ),
    ];
  },
  [`$1$p/$1$c -> $2$p/$2$c`](
    prefix: string,
    $1$p: string,
    $1$c: string,
    $2$p: string,
    $2$c: string,
    strategy: 'static' | 'dynamic',
  ): string[] {
    if ($1$p === $2$p) {
      return getCalls[`$1 -> $2`](prefix, $1$c, $2$c);
    }

    if ($1$c === '') {
      if ($2$c === '') {
        return getCalls[`$1 -> $2`](prefix, $1$p, $2$p);
      }

      if ($1$p === '') {
        return getCalls[`'' -> $x$p/$x$c`](prefix, $2$p, $2$c, strategy);
      }

      switch (strategy) {
        case 'static':
          return [
            `${prefix}.${$1$p}.canLeave`,
            `${prefix}.${$2$p}.canEnter`,
            `${prefix}.${$2$c}.canEnter`,
            `${prefix}.${$1$p}.leave`,
            `${prefix}.${$2$p}.enter`,
            `${prefix}.${$2$c}.enter`,

            `${prefix}.${$2$p}.beforeBind`,
            `${prefix}.${$2$p}.afterBind`,
            `${prefix}.${$2$p}.afterAttach`,
            `${prefix}.${$2$c}.beforeBind`,
            `${prefix}.${$2$c}.afterBind`,
            `${prefix}.${$2$c}.afterAttach`,
            `${prefix}.${$2$c}.afterAttachChildren`,
            `${prefix}.${$2$p}.afterAttachChildren`,
            `${prefix}.${$1$p}.beforeDetach`,
            `${prefix}.${$1$p}.beforeUnbind`,
            `${prefix}.${$1$p}.afterUnbind`,
            `${prefix}.${$1$p}.afterUnbindChildren`,
            `${prefix}.${$1$p}.dispose`,
          ];
        case 'dynamic':
          return [
            `${prefix}.${$1$p}.canLeave`,
            `${prefix}.${$2$p}.canEnter`,
            `${prefix}.${$1$p}.leave`,
            `${prefix}.${$2$p}.enter`,

            `${prefix}.${$2$p}.beforeBind`,
            `${prefix}.${$2$p}.afterBind`,
            `${prefix}.${$2$p}.afterAttach`,
            `${prefix}.${$2$p}.afterAttachChildren`,
            `${prefix}.${$1$p}.beforeDetach`,
            `${prefix}.${$1$p}.beforeUnbind`,
            `${prefix}.${$1$p}.afterUnbind`,
            `${prefix}.${$1$p}.afterUnbindChildren`,
            `${prefix}.${$1$p}.dispose`,

            `${prefix}.${$2$c}.canEnter`,
            `${prefix}.${$2$c}.enter`,

            `${prefix}.${$2$c}.beforeBind`,
            `${prefix}.${$2$c}.afterBind`,
            `${prefix}.${$2$c}.afterAttach`,
            `${prefix}.${$2$c}.afterAttachChildren`,
          ];
      }
    }

    if ($2$c === '') {
      if ($2$p === '') {
        return getCalls[`$x$p/$x$c -> ''`](prefix, $1$p, $1$c, false);
      }

      return [
        `${prefix}.${$1$p}.canLeave`,
        `${prefix}.${$1$c}.canLeave`,
        `${prefix}.${$2$p}.canEnter`,
        `${prefix}.${$1$p}.leave`,
        `${prefix}.${$1$c}.leave`,
        `${prefix}.${$2$p}.enter`,

        `${prefix}.${$2$p}.beforeBind`,
        `${prefix}.${$2$p}.afterBind`,
        `${prefix}.${$2$p}.afterAttach`,
        `${prefix}.${$2$p}.afterAttachChildren`,
        `${prefix}.${$1$p}.beforeDetach`,
        `${prefix}.${$1$p}.beforeUnbind`,
        `${prefix}.${$1$p}.afterUnbind`,
        `${prefix}.${$1$c}.beforeDetach`,
        `${prefix}.${$1$c}.beforeUnbind`,
        `${prefix}.${$1$c}.afterUnbind`,
        `${prefix}.${$1$c}.afterUnbindChildren`,
        `${prefix}.${$1$p}.afterUnbindChildren`,
        `${prefix}.${$1$p}.dispose`,
        `${prefix}.${$1$c}.dispose`,
      ];
    }

    switch (strategy) {
      case 'static':
        return [
          `${prefix}.${$1$p}.canLeave`,
          `${prefix}.${$1$c}.canLeave`,
          `${prefix}.${$2$p}.canEnter`,
          `${prefix}.${$2$c}.canEnter`,
          `${prefix}.${$1$p}.leave`,
          `${prefix}.${$1$c}.leave`,
          `${prefix}.${$2$p}.enter`,
          `${prefix}.${$2$c}.enter`,

          `${prefix}.${$2$p}.beforeBind`,
          `${prefix}.${$2$p}.afterBind`,
          `${prefix}.${$2$p}.afterAttach`,
          `${prefix}.${$2$c}.beforeBind`,
          `${prefix}.${$2$c}.afterBind`,
          `${prefix}.${$2$c}.afterAttach`,
          `${prefix}.${$2$c}.afterAttachChildren`,
          `${prefix}.${$2$p}.afterAttachChildren`,
          `${prefix}.${$1$p}.beforeDetach`,
          `${prefix}.${$1$p}.beforeUnbind`,
          `${prefix}.${$1$p}.afterUnbind`,
          `${prefix}.${$1$c}.beforeDetach`,
          `${prefix}.${$1$c}.beforeUnbind`,
          `${prefix}.${$1$c}.afterUnbind`,
          `${prefix}.${$1$c}.afterUnbindChildren`,
          `${prefix}.${$1$p}.afterUnbindChildren`,
          `${prefix}.${$1$p}.dispose`,
          `${prefix}.${$1$c}.dispose`,
        ];
      case 'dynamic':
        return [
          `${prefix}.${$1$p}.canLeave`,
          `${prefix}.${$1$c}.canLeave`,
          `${prefix}.${$2$p}.canEnter`,
          `${prefix}.${$1$p}.leave`,
          `${prefix}.${$1$c}.leave`,
          `${prefix}.${$2$p}.enter`,

          `${prefix}.${$2$p}.beforeBind`,
          `${prefix}.${$2$p}.afterBind`,
          `${prefix}.${$2$p}.afterAttach`,
          `${prefix}.${$2$p}.afterAttachChildren`,
          `${prefix}.${$1$p}.beforeDetach`,
          `${prefix}.${$1$p}.beforeUnbind`,
          `${prefix}.${$1$p}.afterUnbind`,
          `${prefix}.${$1$c}.beforeDetach`,
          `${prefix}.${$1$c}.beforeUnbind`,
          `${prefix}.${$1$c}.afterUnbind`,
          `${prefix}.${$1$c}.afterUnbindChildren`,
          `${prefix}.${$1$p}.afterUnbindChildren`,
          `${prefix}.${$1$p}.dispose`,
          `${prefix}.${$1$c}.dispose`,

          `${prefix}.${$2$c}.canEnter`,
          `${prefix}.${$2$c}.enter`,

          `${prefix}.${$2$c}.beforeBind`,
          `${prefix}.${$2$c}.afterBind`,
          `${prefix}.${$2$c}.afterAttach`,
          `${prefix}.${$2$c}.afterAttachChildren`,
        ];
    }
  },
};
