/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { customElement } from '@aurelia/runtime';
import { IRouterOptions, ResolutionStrategy, SwapStrategy } from '@aurelia/router';
import { assert } from '@aurelia/testing';

import { IHookInvocationAggregator, IHIAConfig } from './_shared/hook-invocation-tracker';
import { TestRouteViewModelBase, HookSpecs } from './_shared/view-models';
import { hookSpecsMap } from './_shared/hook-spec';
import { getCalls, getStopPhaseCalls } from './_shared/get-calls';
import { createFixture } from './_shared/create-fixture';

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

function getDefaultHIAConfig(): IHIAConfig {
  return {
    resolveTimeoutMs: 100,
    resolveLabels: [],
  };
}

export interface IRouterOptionsSpec {
  resolutionStrategy: ResolutionStrategy;
  swapStrategy: SwapStrategy;
}

export interface IComponentSpec {
  kind: 'all-sync' | 'all-async';
  hookSpecs: HookSpecs;
}

describe('router hooks', function () {
  const routerOptionsSpecs: IRouterOptionsSpec[] = [
    {
      resolutionStrategy: 'static',
      swapStrategy: 'parallel',
    },
    {
      resolutionStrategy: 'static',
      swapStrategy: 'add-first',
    },
    {
      resolutionStrategy: 'static',
      swapStrategy: 'remove-first',
    },
    {
      resolutionStrategy: 'dynamic',
      swapStrategy: 'parallel',
    },
    {
      resolutionStrategy: 'dynamic',
      swapStrategy: 'add-first',
    },
    {
      resolutionStrategy: 'dynamic',
      swapStrategy: 'remove-first',
    },
  ];

  const componentSpecs: IComponentSpec[] = [
    {
      kind: 'all-sync',
      hookSpecs: HookSpecs.create({
        beforeBind: hookSpecsMap.beforeBind.sync,
        afterBind: hookSpecsMap.afterBind.sync,
        afterAttach: hookSpecsMap.afterAttach.sync,
        afterAttachChildren: hookSpecsMap.afterAttachChildren.sync,

        beforeDetach: hookSpecsMap.beforeDetach.sync,
        beforeUnbind: hookSpecsMap.beforeUnbind.sync,
        afterUnbind: hookSpecsMap.afterUnbind.sync,
        afterUnbindChildren: hookSpecsMap.afterUnbindChildren.sync,

        canEnter: hookSpecsMap.canEnter.sync,
        enter: hookSpecsMap.enter.sync,
        canLeave: hookSpecsMap.canLeave.sync,
        leave: hookSpecsMap.leave.sync,
      }),
    },
    {
      kind: 'all-async',
      hookSpecs: HookSpecs.create({
        beforeBind: hookSpecsMap.beforeBind.async1,
        afterBind: hookSpecsMap.afterBind.async1,
        afterAttach: hookSpecsMap.afterAttach.async1,
        afterAttachChildren: hookSpecsMap.afterAttachChildren.async1,

        beforeDetach: hookSpecsMap.beforeDetach.async1,
        beforeUnbind: hookSpecsMap.beforeUnbind.async1,
        afterUnbind: hookSpecsMap.afterUnbind.async1,
        afterUnbindChildren: hookSpecsMap.afterUnbindChildren.async1,

        canEnter: hookSpecsMap.canEnter.async1,
        enter: hookSpecsMap.enter.async1,
        canLeave: hookSpecsMap.canLeave.async1,
        leave: hookSpecsMap.leave.async1,
      }),
    },
    {
      kind: 'all-async',
      hookSpecs: HookSpecs.create({
        beforeBind: hookSpecsMap.beforeBind.async2,
        afterBind: hookSpecsMap.afterBind.async2,
        afterAttach: hookSpecsMap.afterAttach.async2,
        afterAttachChildren: hookSpecsMap.afterAttachChildren.async2,

        beforeDetach: hookSpecsMap.beforeDetach.async2,
        beforeUnbind: hookSpecsMap.beforeUnbind.async2,
        afterUnbind: hookSpecsMap.afterUnbind.async2,
        afterUnbindChildren: hookSpecsMap.afterUnbindChildren.async2,

        canEnter: hookSpecsMap.canEnter.async2,
        enter: hookSpecsMap.enter.async2,
        canLeave: hookSpecsMap.canLeave.async2,
        leave: hookSpecsMap.leave.async2,
      }),
    },
  ];

  for (const componentSpec of componentSpecs) {
    const { kind, hookSpecs } = componentSpec;

    @customElement({ name: 'a01', template: null })
    class A01 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }
    @customElement({ name: 'a02', template: null })
    class A02 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }
    @customElement({ name: 'a03', template: null })
    class A03 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }
    @customElement({ name: 'a04', template: null })
    class A04 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }

    const A0 = [A01, A02, A03, A04];

    @customElement({ name: 'root1', template: vp(1) })
    class Root1 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }
    @customElement({ name: 'a11', template: vp(1) })
    class A11 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }
    @customElement({ name: 'a12', template: vp(1) })
    class A12 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }
    @customElement({ name: 'a13', template: vp(1) })
    class A13 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }
    @customElement({ name: 'a14', template: vp(1) })
    class A14 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }

    const A1 = [A11, A12, A13, A14];

    @customElement({ name: 'root2', template: vp(2) })
    class Root2 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }
    @customElement({ name: 'a21', template: vp(2) })
    class A21 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }
    @customElement({ name: 'a22', template: vp(2) })
    class A22 extends TestRouteViewModelBase {
      public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
    }

    const A2 = [A21, A22];

    const A = [...A0, ...A1, ...A2];

    describe(`componentSpec.kind:'${kind}'`, function () {
      for (const routerOptionsSpec of routerOptionsSpecs) {
        const { resolutionStrategy, swapStrategy } = routerOptionsSpec;

        const getRouterOptions = (): IRouterOptions => {
          return {
            resolutionStrategy,
            swapStrategy,
          };
        };

        describe(`resolutionStrategy:'${resolutionStrategy}',swapStrategy:'${swapStrategy}'`, function () {
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

                  ...getCalls['"" -> $x'](t1, $1),

                  ...getCalls['$1 -> $2'](t2, $1, $2, routerOptionsSpec, componentSpec),

                  ...getCalls['$1 -> $2'](t3, $2, $3, routerOptionsSpec, componentSpec),

                  ...getCalls['$1 -> $2'](t4, $3, $4, routerOptionsSpec, componentSpec),

                  `stop.root1.beforeDetach`,
                  `stop.root1.beforeUnbind`,
                  `stop.root1.afterUnbind`,

                  ...getStopPhaseCalls['$x -> ""'](`stop`, $4),

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

                  ...getCalls['"" -> $x$0+$x$1'](t1, $1$0, $1$1, routerOptionsSpec, componentSpec),

                  ...getCalls['$1$0+$1$1 -> $2$0+$2$1'](t2, $1$0, $1$1, $2$0, $2$1, routerOptionsSpec, componentSpec),

                  ...getCalls['$1$0+$1$1 -> $2$0+$2$1'](t3, $2$0, $2$1, $1$0, $1$1, routerOptionsSpec, componentSpec),

                  ...getCalls['$1$0+$1$1 -> $2$0+$2$1'](t4, $1$0, $1$1, $2$0, $2$1, routerOptionsSpec, componentSpec),

                  `stop.root2.beforeDetach`,
                  `stop.root2.beforeUnbind`,
                  `stop.root2.afterUnbind`,

                  ...getStopPhaseCalls['$x$0+$x$1 -> ""'](`stop`, $2$0, $2$1, componentSpec),

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

                  ...getCalls['"" -> $x$p/$x$c'](t1, $1p, $1c, routerOptionsSpec, componentSpec),

                  ...getCalls['$1$p/$1$c -> $2$p/$2$c'](t2, $1p, $1c, $2p, $2c, routerOptionsSpec, componentSpec),

                  ...getCalls['$1$p/$1$c -> $2$p/$2$c'](t3, $2p, $2c, $1p, $1c, routerOptionsSpec, componentSpec),

                  ...getCalls['$1$p/$1$c -> $2$p/$2$c'](t4, $1p, $1c, $2p, $2c, routerOptionsSpec, componentSpec),

                  `stop.root1.beforeDetach`,
                  `stop.root1.beforeUnbind`,
                  `stop.root1.afterUnbind`,

                  ...getStopPhaseCalls['$x$p/$x$c -> ""'](`stop`, $2p, $2c),

                  `stop.root1.afterUnbindChildren`,
                ],
              );

              hia.dispose();
            });
          }
        });
      }

    });
  }

  for (const routerOptionsSpec of routerOptionsSpecs) {
    const { resolutionStrategy, swapStrategy } = routerOptionsSpec;

    const getRouterOptions = (): IRouterOptions => {
      return {
        resolutionStrategy,
        swapStrategy,
      };
    };

    describe(`resolutionStrategy:'${resolutionStrategy}',swapStrategy:'${swapStrategy}'`, function () {
      for (const hookSpec of [
        HookSpecs.create({
          canLeave: hookSpecsMap.canLeave.setTimeout_0,
        }),
        HookSpecs.create({ leave: hookSpecsMap.leave.setTimeout_0 }),
        HookSpecs.create({
          canEnter: hookSpecsMap.canEnter.setTimeout_0,
        }),
        HookSpecs.create({
          enter: hookSpecsMap.enter.setTimeout_0,
        }),

        HookSpecs.create({
          beforeBind: hookSpecsMap.beforeBind.setTimeout_0,
        }),
        HookSpecs.create({
          afterBind: hookSpecsMap.afterBind.setTimeout_0,
        }),
        HookSpecs.create({
          afterAttach: hookSpecsMap.afterAttach.setTimeout_0,
        }),

        HookSpecs.create({
          beforeDetach: hookSpecsMap.beforeDetach.setTimeout_0,
        }),
        HookSpecs.create({
          beforeUnbind: hookSpecsMap.beforeUnbind.setTimeout_0,
        }),
        HookSpecs.create({
          afterUnbind: hookSpecsMap.afterUnbind.setTimeout_0,
        }),
      ]) {
        it(`'a/b/c/d' -> 'a' (c.hookSpec:${hookSpec})`, async function () {
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
              super(hia, hookSpec);
            }
          }
          @customElement({ name: 'd', template: null })
          class D extends TestRouteViewModelBase {
            public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
              super(hia);
            }
          }

          const { router, hia, tearDown } = await createFixture(Root, [A, B, C, D], getDefaultHIAConfig, getRouterOptions);

          hia.setPhase(`('' -> 'a/b/c/d')`);
          await router.goto('a/b/c/d');

          hia.setPhase(`('a/b/c/d' -> 'a')`);
          await router.goto('a');

          await tearDown();

          switch (resolutionStrategy) {
            case 'dynamic': {
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

                  `('a/b/c/d' -> 'a').d.canLeave`,
                  `('a/b/c/d' -> 'a').c.canLeave`,
                  `('a/b/c/d' -> 'a').b.canLeave`,

                  `('a/b/c/d' -> 'a').d.leave`,
                  `('a/b/c/d' -> 'a').c.leave`,
                  `('a/b/c/d' -> 'a').b.leave`,

                  `('a/b/c/d' -> 'a').d.beforeDetach`,
                  `('a/b/c/d' -> 'a').d.beforeUnbind`,
                  `('a/b/c/d' -> 'a').d.afterUnbind`,
                  `('a/b/c/d' -> 'a').d.afterUnbindChildren`,
                  `('a/b/c/d' -> 'a').d.dispose`,
                  `('a/b/c/d' -> 'a').c.beforeDetach`,
                  `('a/b/c/d' -> 'a').c.beforeUnbind`,
                  `('a/b/c/d' -> 'a').c.afterUnbind`,
                  `('a/b/c/d' -> 'a').c.afterUnbindChildren`,
                  `('a/b/c/d' -> 'a').c.dispose`,
                  `('a/b/c/d' -> 'a').b.beforeDetach`,
                  `('a/b/c/d' -> 'a').b.beforeUnbind`,
                  `('a/b/c/d' -> 'a').b.afterUnbind`,
                  `('a/b/c/d' -> 'a').b.afterUnbindChildren`,
                  `('a/b/c/d' -> 'a').b.dispose`,

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
              break;
            }
            case 'static': {
              assert.deepStrictEqual(
                hia.notifyHistory,
                [
                  `start.root.beforeBind`,
                  `start.root.afterBind`,
                  `start.root.afterAttach`,
                  `start.root.afterAttachChildren`,

                  `('' -> 'a/b/c/d').a.canEnter`,
                  `('' -> 'a/b/c/d').b.canEnter`,
                  `('' -> 'a/b/c/d').c.canEnter`,
                  `('' -> 'a/b/c/d').d.canEnter`,

                  `('' -> 'a/b/c/d').a.enter`,
                  `('' -> 'a/b/c/d').b.enter`,
                  `('' -> 'a/b/c/d').c.enter`,
                  `('' -> 'a/b/c/d').d.enter`,

                  `('' -> 'a/b/c/d').a.beforeBind`,
                  `('' -> 'a/b/c/d').a.afterBind`,
                  `('' -> 'a/b/c/d').a.afterAttach`,
                  `('' -> 'a/b/c/d').b.beforeBind`,
                  `('' -> 'a/b/c/d').b.afterBind`,
                  `('' -> 'a/b/c/d').b.afterAttach`,
                  `('' -> 'a/b/c/d').c.beforeBind`,
                  `('' -> 'a/b/c/d').c.afterBind`,
                  `('' -> 'a/b/c/d').c.afterAttach`,
                  `('' -> 'a/b/c/d').d.beforeBind`,
                  `('' -> 'a/b/c/d').d.afterBind`,
                  `('' -> 'a/b/c/d').d.afterAttach`,
                  `('' -> 'a/b/c/d').d.afterAttachChildren`,
                  `('' -> 'a/b/c/d').c.afterAttachChildren`,
                  `('' -> 'a/b/c/d').b.afterAttachChildren`,
                  `('' -> 'a/b/c/d').a.afterAttachChildren`,

                  `('a/b/c/d' -> 'a').d.canLeave`,
                  `('a/b/c/d' -> 'a').c.canLeave`,
                  `('a/b/c/d' -> 'a').b.canLeave`,

                  `('a/b/c/d' -> 'a').d.leave`,
                  `('a/b/c/d' -> 'a').c.leave`,
                  `('a/b/c/d' -> 'a').b.leave`,

                  `('a/b/c/d' -> 'a').d.beforeDetach`,
                  `('a/b/c/d' -> 'a').d.beforeUnbind`,
                  `('a/b/c/d' -> 'a').d.afterUnbind`,
                  `('a/b/c/d' -> 'a').d.afterUnbindChildren`,
                  `('a/b/c/d' -> 'a').d.dispose`,
                  `('a/b/c/d' -> 'a').c.beforeDetach`,
                  `('a/b/c/d' -> 'a').c.beforeUnbind`,
                  `('a/b/c/d' -> 'a').c.afterUnbind`,
                  `('a/b/c/d' -> 'a').c.afterUnbindChildren`,
                  `('a/b/c/d' -> 'a').c.dispose`,
                  `('a/b/c/d' -> 'a').b.beforeDetach`,
                  `('a/b/c/d' -> 'a').b.beforeUnbind`,
                  `('a/b/c/d' -> 'a').b.afterUnbind`,
                  `('a/b/c/d' -> 'a').b.afterUnbindChildren`,
                  `('a/b/c/d' -> 'a').b.dispose`,

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
              break;
            }
          }

          hia.dispose();
        });
      }
    });
  }
});

function join(sep: string, ...parts: string[]): string {
  return parts.filter(function (x) {
    return x.length > 0 && x.split('@')[0].length > 0;
  }).join(sep);
}
