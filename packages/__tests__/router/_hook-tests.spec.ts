/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { customElement, CustomElement } from '@aurelia/runtime';
import { IRouterOptions, ResolutionStrategy, LifecycleStrategy, SwapStrategy, IRouter } from '@aurelia/router';
import { assert } from '@aurelia/testing';

import { IHookInvocationAggregator, IHIAConfig, HookName } from './_shared/hook-invocation-tracker';
import { TestRouteViewModelBase, HookSpecs } from './_shared/view-models';
import { hookSpecsMap } from './_shared/hook-spec';
import { getStopPhaseCalls, getCalls, interleave, activate, deactivate } from './_shared/get-calls';
import { createFixture } from './_shared/create-fixture';
import { Constructable, IContainer, ILogger } from '@aurelia/kernel';

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
  lifecycleStrategy: LifecycleStrategy;
  swapStrategy: SwapStrategy;
  toString(): string;
}

export interface IComponentSpec {
  kind: 'all-sync' | 'all-async';
  hookSpecs: HookSpecs;
}

describe('router hooks', function () {
  describe('monomorphic timings', function () {
    const resolutionStrategies: ResolutionStrategy[] = [
      'static',
      'dynamic',
    ];
    const lifecycleStrategies: LifecycleStrategy[] = [
      'phased',
      'parallel',
    ];
    const swapStrategies: SwapStrategy[] = [
      'parallel',
      'add-first',
      'remove-first',
    ];
    const routerOptionsSpecs: IRouterOptionsSpec[] = [];
    for (const resolutionStrategy of resolutionStrategies) {
      for (const lifecycleStrategy of lifecycleStrategies) {
        for (const swapStrategy of swapStrategies) {
          routerOptionsSpecs.push({
            resolutionStrategy,
            lifecycleStrategy,
            swapStrategy,
            toString() {
              return `resolutionStrategy:'${resolutionStrategy}',lifecycleStrategy:'${lifecycleStrategy}',swapStrategy:'${swapStrategy}'`;
            },
          });
        }
      }
    }

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
        hookSpecs: getAllAsyncSpecs(1),
      },
      // {
      //   kind: 'all-async',
      //   hookSpecs: getAllAsyncSpecs(2),
      // },
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
          const getRouterOptions = (): IRouterOptions => routerOptionsSpec;

          describe(`${routerOptionsSpec}`, function () {
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
                await router.load($1);

                hia.setPhase(t2);
                await router.load($2);

                hia.setPhase(t3);
                await router.load($3);

                hia.setPhase(t4);
                await router.load($4);

                await tearDown();

                assert.deepStrictEqual(
                  hia.notifyHistory,
                  [
                    `start.root1.beforeBind`,
                    `start.root1.afterBind`,
                    `start.root1.afterAttach`,
                    `start.root1.afterAttachChildren`,

                    ...getCalls[componentSpec.kind]['"" -> $x'](t1, $1),

                    ...getCalls[componentSpec.kind]['$1 -> $2'](t2, $1, $2, routerOptionsSpec, componentSpec),

                    ...getCalls[componentSpec.kind]['$1 -> $2'](t3, $2, $3, routerOptionsSpec, componentSpec),

                    ...getCalls[componentSpec.kind]['$1 -> $2'](t4, $3, $4, routerOptionsSpec, componentSpec),

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
                await router.load($1);

                hia.setPhase(t2);
                await router.load($2);

                hia.setPhase(t3);
                await router.load($1);

                hia.setPhase(t4);
                await router.load($2);

                await tearDown();

                assert.deepStrictEqual(
                  hia.notifyHistory,
                  [
                    `start.root2.beforeBind`,
                    `start.root2.afterBind`,
                    `start.root2.afterAttach`,
                    `start.root2.afterAttachChildren`,

                    ...getCalls[componentSpec.kind]['"" -> $x$0+$x$1'](t1, $1$0, $1$1, routerOptionsSpec, componentSpec),

                    ...getCalls[componentSpec.kind]['$1$0+$1$1 -> $2$0+$2$1'](t2, $1$0, $1$1, $2$0, $2$1, routerOptionsSpec, componentSpec),

                    ...getCalls[componentSpec.kind]['$1$0+$1$1 -> $2$0+$2$1'](t3, $2$0, $2$1, $1$0, $1$1, routerOptionsSpec, componentSpec),

                    ...getCalls[componentSpec.kind]['$1$0+$1$1 -> $2$0+$2$1'](t4, $1$0, $1$1, $2$0, $2$1, routerOptionsSpec, componentSpec),

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
                await router.load($1);

                hia.setPhase(t2);
                await router.load($2);

                hia.setPhase(t3);
                await router.load($1);

                hia.setPhase(t4);
                await router.load($2);

                await tearDown();

                assert.deepStrictEqual(
                  hia.notifyHistory,
                  [
                    `start.root1.beforeBind`,
                    `start.root1.afterBind`,
                    `start.root1.afterAttach`,
                    `start.root1.afterAttachChildren`,

                    ...getCalls[componentSpec.kind]['"" -> $x$p/$x$c'](t1, $1p, $1c, routerOptionsSpec, componentSpec),

                    ...getCalls[componentSpec.kind]['$1$p/$1$c -> $2$p/$2$c'](t2, $1p, $1c, $2p, $2c, routerOptionsSpec, componentSpec),

                    ...getCalls[componentSpec.kind]['$1$p/$1$c -> $2$p/$2$c'](t3, $2p, $2c, $1p, $1c, routerOptionsSpec, componentSpec),

                    ...getCalls[componentSpec.kind]['$1$p/$1$c -> $2$p/$2$c'](t4, $1p, $1c, $2p, $2c, routerOptionsSpec, componentSpec),

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
  });

  describe('parent-child timings', function () {
    const resolutionStrategies: ResolutionStrategy[] = [
      'static',
      'dynamic',
    ];
    const lifecycleStrategies: LifecycleStrategy[] = [
      'phased',
      'parallel',
    ];
    const swapStrategies: SwapStrategy[] = [
      'parallel',
      'add-first',
      'remove-first',
    ];
    const routerOptionsSpecs: IRouterOptionsSpec[] = [];
    for (const resolutionStrategy of resolutionStrategies) {
      for (const lifecycleStrategy of lifecycleStrategies) {
        for (const swapStrategy of swapStrategies) {
          routerOptionsSpecs.push({
            resolutionStrategy,
            lifecycleStrategy,
            swapStrategy,
            toString() {
              return `resolutionStrategy:'${resolutionStrategy}',lifecycleStrategy:'${lifecycleStrategy}',swapStrategy:'${swapStrategy}'`;
            },
          });
        }
      }
    }

    for (const routerOptionsSpec of routerOptionsSpecs) {
      const getRouterOptions = (): IRouterOptions => routerOptionsSpec;

      describe(`${routerOptionsSpec}`, function () {
        for (const hookSpec of [
          HookSpecs.create({
            canLeave: hookSpecsMap.canLeave.setTimeout_0,
          }),
          HookSpecs.create({
            leave: hookSpecsMap.leave.setTimeout_0,
          }),
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
            @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
            class Root extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia);
              }
            }
            @customElement({ name: 'a', template: '<au-viewport></au-viewport>' })
            class A extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia);
              }
            }
            @customElement({ name: 'b', template: '<au-viewport></au-viewport>' })
            class B extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia);
              }
            }
            @customElement({ name: 'c', template: '<au-viewport></au-viewport>' })
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
            await router.load('a/b/c/d');

            hia.setPhase(`('a/b/c/d' -> 'a')`);
            await router.load('a');

            await tearDown();

            switch (routerOptionsSpec.lifecycleStrategy) {
              case 'phased': {
                switch (routerOptionsSpec.resolutionStrategy) {
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
                break;
              }
              case 'parallel': {
                switch (routerOptionsSpec.resolutionStrategy) {
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
                        `('a/b/c/d' -> 'a').d.beforeDetach`,
                        `('a/b/c/d' -> 'a').d.beforeUnbind`,
                        `('a/b/c/d' -> 'a').d.afterUnbind`,
                        `('a/b/c/d' -> 'a').d.afterUnbindChildren`,
                        `('a/b/c/d' -> 'a').d.dispose`,

                        `('a/b/c/d' -> 'a').c.leave`,
                        `('a/b/c/d' -> 'a').c.beforeDetach`,
                        `('a/b/c/d' -> 'a').c.beforeUnbind`,
                        `('a/b/c/d' -> 'a').c.afterUnbind`,
                        `('a/b/c/d' -> 'a').c.afterUnbindChildren`,
                        `('a/b/c/d' -> 'a').c.dispose`,

                        `('a/b/c/d' -> 'a').b.leave`,
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
                        `('' -> 'a/b/c/d').a.beforeBind`,
                        `('' -> 'a/b/c/d').a.afterBind`,
                        `('' -> 'a/b/c/d').a.afterAttach`,

                        `('' -> 'a/b/c/d').b.enter`,
                        `('' -> 'a/b/c/d').b.beforeBind`,
                        `('' -> 'a/b/c/d').b.afterBind`,
                        `('' -> 'a/b/c/d').b.afterAttach`,

                        `('' -> 'a/b/c/d').c.enter`,
                        `('' -> 'a/b/c/d').c.beforeBind`,
                        `('' -> 'a/b/c/d').c.afterBind`,
                        `('' -> 'a/b/c/d').c.afterAttach`,

                        `('' -> 'a/b/c/d').d.enter`,
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
                        `('a/b/c/d' -> 'a').d.beforeDetach`,
                        `('a/b/c/d' -> 'a').d.beforeUnbind`,
                        `('a/b/c/d' -> 'a').d.afterUnbind`,
                        `('a/b/c/d' -> 'a').d.afterUnbindChildren`,
                        `('a/b/c/d' -> 'a').d.dispose`,

                        `('a/b/c/d' -> 'a').c.leave`,
                        `('a/b/c/d' -> 'a').c.beforeDetach`,
                        `('a/b/c/d' -> 'a').c.beforeUnbind`,
                        `('a/b/c/d' -> 'a').c.afterUnbind`,
                        `('a/b/c/d' -> 'a').c.afterUnbindChildren`,
                        `('a/b/c/d' -> 'a').c.dispose`,

                        `('a/b/c/d' -> 'a').b.leave`,
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
              }
            }

            hia.dispose();
          });
        }

      });
    }
  });

  describe('single incoming sibling transition', function () {
    const resolutionStrategies: ResolutionStrategy[] = [
      'static',
      'dynamic',
    ];
    const lifecycleStrategies: LifecycleStrategy[] = [
      'phased',
      'parallel',
    ];
    const swapStrategies: SwapStrategy[] = [
      'parallel',
      'add-first',
      'remove-first',
    ];
    const routerOptionsSpecs: IRouterOptionsSpec[] = [];
    for (const resolutionStrategy of resolutionStrategies) {
      for (const lifecycleStrategy of lifecycleStrategies) {
        for (const swapStrategy of swapStrategies) {
          routerOptionsSpecs.push({
            resolutionStrategy,
            lifecycleStrategy,
            swapStrategy,
            toString() {
              return `resolutionStrategy:'${resolutionStrategy}',lifecycleStrategy:'${lifecycleStrategy}',swapStrategy:'${swapStrategy}'`;
            },
          });
        }
      }
    }

    interface ISiblingTransitionSpec {
      a: HookSpecs;
      b: HookSpecs;
    }

    for (const routerOptionsSpec of routerOptionsSpecs) {
      const getRouterOptions = (): IRouterOptions => routerOptionsSpec;

      describe(`${routerOptionsSpec}`, function () {

        function runTest(
          spec: ISiblingTransitionSpec,
          getExpectedNotifyHistory: (
            spec: ISiblingTransitionSpec,
            phase1: string,
          ) => Generator<string, void>,
        ) {
          const title = Object.keys(spec).map(key => `${key}:${spec[key].toString('async1')}`).filter(x => x.length > 2).join(',');
          it(title, async function () {
            const { a, b } = spec;

            @customElement({ name: 'root', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })
            class Root extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia);
              }
            }
            @customElement({ name: 'a', template: null })
            class A extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia, a);
              }
            }
            @customElement({ name: 'b', template: null })
            class B extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia, b);
              }
            }

            const { router, hia, tearDown } = await createFixture(Root, [A, B], getDefaultHIAConfig, getRouterOptions);

            const phase1 = `('' -> 'a$0+b$1')`;

            hia.setPhase(phase1);
            await router.load('a@$0+b@$1');

            await tearDown();

            const expected = [...getExpectedNotifyHistory(spec, phase1)];
            assert.deepStrictEqual(hia.notifyHistory, expected);

            hia.dispose();
          });
        }

        for (const [aCanEnter, bCanEnter, aEnter, bEnter] of [
          [1, 1,  1,  2],
          [1, 1,  1,  3],
          [1, 1,  1,  4],
          [1, 1,  1,  5],
          [1, 1,  1,  6],
          [1, 1,  1,  7],
          [1, 1,  1,  8],
          [1, 1,  1,  9],
          [1, 1,  1, 10],
          [1, 1,  2,  1],
          [1, 1,  3,  1],
          [1, 1,  4,  1],
          [1, 1,  5,  1],
          [1, 1,  6,  1],
          [1, 1,  7,  1],
          [1, 1,  8,  1],
          [1, 1,  9,  1],
          [1, 1, 10,  1],
          [1, 5,  1,  2],
          [1, 5,  1, 10],
          [1, 5,  2,  1],
          [1, 5, 10,  1],
          [5, 1,  1,  2],
          [5, 1,  1, 10],
          [5, 1,  2,  1],
          [5, 1, 10,  1],
        ]) {
          runTest({
            a: HookSpecs.create({
              ...getAllAsyncSpecs(1),
              canEnter: hookSpecsMap.canEnter.async(aCanEnter),
              enter: hookSpecsMap.enter.async(aEnter),
            }),
            b: HookSpecs.create({
              ...getAllAsyncSpecs(1),
              canEnter: hookSpecsMap.canEnter.async(bCanEnter),
              enter: hookSpecsMap.enter.async(bEnter),
            }),
          }, function* (spec, phase1) {
            yield* activate(`start`, 'root', true, false);

            if (aCanEnter <= bCanEnter) {
              yield `${phase1}.a.canEnter`;
              yield `${phase1}.b.canEnter`;
            } else {
              yield `${phase1}.b.canEnter`;
              yield `${phase1}.a.canEnter`;
            }

            switch (routerOptionsSpec.lifecycleStrategy) {
              case 'phased':
                if (aEnter < bEnter) {
                  yield `${phase1}.a.enter`;
                  yield `${phase1}.b.enter`;
                } else {
                  yield `${phase1}.b.enter`;
                  yield `${phase1}.a.enter`;
                }

                yield* interleave(
                  activate(phase1, 'a', true, false),
                  activate(phase1, 'b', true, false),
                );

                yield* deactivate(`stop`, 'root', false, false);
                yield* interleave(
                  deactivate(`stop`, 'a', false, false),
                  deactivate(`stop`, 'b', false, false),
                );
                yield `stop.root.afterUnbindChildren`;
                yield `stop.a.afterUnbindChildren`;
                yield `stop.b.afterUnbindChildren`;
                break;
              case 'parallel': {
                yield* interleave(
                  (function* () {
                    if (aEnter > 7) { yield ''; }
                    if (aEnter > 4) { yield ''; }
                    if (aEnter > 1) { yield ''; }
                    yield `${phase1}.a.enter`;
                    if (aEnter > 5) { yield ''; }
                    if (aEnter > 2) { yield ''; }
                    yield* activate(phase1, 'a', true, false);
                  })(),
                  (function* () {
                    if (bEnter > 9) { yield ''; }
                    if (bEnter > 6) { yield ''; }
                    if (bEnter > 3) { yield ''; }
                    yield `${phase1}.b.enter`;
                    if (bEnter > 5) { yield ''; }
                    if (bEnter > 2) { yield ''; }
                    yield* activate(phase1, 'b', true, false);
                  })(),
                );

                yield* deactivate(`stop`, 'root', false, false);
                yield* interleave(
                  deactivate(`stop`, 'a', false, false),
                  deactivate(`stop`, 'b', false, false),
                );
                yield `stop.root.afterUnbindChildren`;
                yield `stop.a.afterUnbindChildren`;
                yield `stop.b.afterUnbindChildren`;
                break;
              }
            }
          });
        }
      });
    }
  });

  describe('single incoming parent-child transition', function () {
    const resolutionStrategies: ResolutionStrategy[] = [
      'static',
      'dynamic',
    ];
    const lifecycleStrategies: LifecycleStrategy[] = [
      'phased',
      'parallel',
    ];
    const swapStrategies: SwapStrategy[] = [
      'parallel',
      'add-first',
      'remove-first',
    ];
    const routerOptionsSpecs: IRouterOptionsSpec[] = [];
    for (const resolutionStrategy of resolutionStrategies) {
      for (const lifecycleStrategy of lifecycleStrategies) {
        for (const swapStrategy of swapStrategies) {
          routerOptionsSpecs.push({
            resolutionStrategy,
            lifecycleStrategy,
            swapStrategy,
            toString() {
              return `resolutionStrategy:'${resolutionStrategy}',lifecycleStrategy:'${lifecycleStrategy}',swapStrategy:'${swapStrategy}'`;
            },
          });
        }
      }
    }

    interface IParentChildTransitionSpec {
      a1: HookSpecs;
      a2: HookSpecs;
    }

    for (const routerOptionsSpec of routerOptionsSpecs) {
      const getRouterOptions = (): IRouterOptions => routerOptionsSpec;

      describe(`${routerOptionsSpec}`, function () {

        function runTest(
          spec: IParentChildTransitionSpec,
          getExpectedNotifyHistory: (
            spec: IParentChildTransitionSpec,
            phase1: string,
          ) => Generator<string, void>,
        ) {
          const title = Object.keys(spec).map(key => `${key}:${spec[key].toString('async1')}`).filter(x => x.length > 2).join(',');
          it(title, async function () {
            const { a1, a2 } = spec;

            @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
            class Root extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia);
              }
            }
            @customElement({ name: 'a1', template: '<au-viewport></au-viewport>' })
            class A1 extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia, a1);
              }
            }
            @customElement({ name: 'a2', template: null })
            class A2 extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia, a2);
              }
            }

            const { router, hia, tearDown } = await createFixture(Root, [A1, A2], getDefaultHIAConfig, getRouterOptions);

            const phase1 = `('' -> 'a1/a2')`;

            hia.setPhase(phase1);
            await router.load('a1/a2');

            await tearDown();

            const expected = [...getExpectedNotifyHistory(spec, phase1)];
            assert.deepStrictEqual(hia.notifyHistory, expected);

            hia.dispose();
          });
        }

        for (const [a1CanEnter, a2CanEnter, a1Enter, a2Enter] of [
          [1, 5,  1,  5],
          [1, 5,  5,  1],
          [5, 1,  1,  5],
          [5, 1,  5,  1],
        ]) {
          runTest({
            a1: HookSpecs.create({
              ...getAllAsyncSpecs(1),
              canEnter: hookSpecsMap.canEnter.async(a1CanEnter),
              enter: hookSpecsMap.enter.async(a1Enter),
            }),
            a2: HookSpecs.create({
              ...getAllAsyncSpecs(1),
              canEnter: hookSpecsMap.canEnter.async(a2CanEnter),
              enter: hookSpecsMap.enter.async(a2Enter),
            }),
          }, function* (spec, phase1) {
            yield* activate(`start`, 'root', true, false);

            switch (routerOptionsSpec.resolutionStrategy) {
              case 'dynamic':
                yield `${phase1}.a1.canEnter`;
                yield `${phase1}.a1.enter`;
                yield* activate(phase1, 'a1', false, false);
                yield `${phase1}.a1.afterAttachChildren`;

                yield `${phase1}.a2.canEnter`;
                yield `${phase1}.a2.enter`;
                yield* activate(phase1, 'a2', false, false);
                yield `${phase1}.a2.afterAttachChildren`;

                yield* deactivate(`stop`, 'root', false, false);
                yield* deactivate(`stop`, 'a1', false, false);
                yield* deactivate(`stop`, 'a2', false, false);
                yield `stop.root.afterUnbindChildren`;
                yield `stop.a2.afterUnbindChildren`;
                yield `stop.a1.afterUnbindChildren`;
                break;
              case 'static':
                yield `${phase1}.a1.canEnter`;
                yield `${phase1}.a2.canEnter`;
                switch (routerOptionsSpec.lifecycleStrategy) {
                  case 'parallel':
                    yield `${phase1}.a1.enter`;
                    yield* activate(phase1, 'a1', false, false);
                    yield `${phase1}.a2.enter`;
                    yield* activate(phase1, 'a2', false, false);
                    break;
                  case 'phased':
                    yield `${phase1}.a1.enter`;
                    yield `${phase1}.a2.enter`;
                    yield* activate(phase1, 'a1', false, false);
                    yield* activate(phase1, 'a2', false, false);
                    break;
                }
                yield `${phase1}.a2.afterAttachChildren`;
                yield `${phase1}.a1.afterAttachChildren`;

                yield* deactivate(`stop`, 'root', false, false);
                yield* deactivate(`stop`, 'a1', false, false);
                yield* deactivate(`stop`, 'a2', false, false);
                yield `stop.root.afterUnbindChildren`;
                yield `stop.a2.afterUnbindChildren`;
                yield `stop.a1.afterUnbindChildren`;
                break;
            }
          });
        }
      });
    }
  });

  describe('single incoming parentsiblings-childsiblings transition', function () {
    const resolutionStrategies: ResolutionStrategy[] = [
      'static',
      'dynamic',
    ];
    const lifecycleStrategies: LifecycleStrategy[] = [
      'phased',
      'parallel',
    ];
    const swapStrategies: SwapStrategy[] = [
      'parallel',
      'add-first',
      'remove-first',
    ];
    const routerOptionsSpecs: IRouterOptionsSpec[] = [];
    for (const resolutionStrategy of resolutionStrategies) {
      for (const lifecycleStrategy of lifecycleStrategies) {
        for (const swapStrategy of swapStrategies) {
          routerOptionsSpecs.push({
            resolutionStrategy,
            lifecycleStrategy,
            swapStrategy,
            toString() {
              return `resolutionStrategy:'${resolutionStrategy}',lifecycleStrategy:'${lifecycleStrategy}',swapStrategy:'${swapStrategy}'`;
            },
          });
        }
      }
    }

    interface IParentSiblingsChildSiblingsTransitionSpec {
      a1: HookSpecs;
      a2: HookSpecs;
      b1: HookSpecs;
      b2: HookSpecs;
    }

    for (const routerOptionsSpec of routerOptionsSpecs) {
      const getRouterOptions = (): IRouterOptions => routerOptionsSpec;

      describe(`${routerOptionsSpec}`, function () {

        function runTest(
          spec: IParentSiblingsChildSiblingsTransitionSpec,
          getExpectedNotifyHistory: (
            spec: IParentSiblingsChildSiblingsTransitionSpec,
            phase1: string,
          ) => Generator<string, void>,
        ) {
          const title = Object.keys(spec).map(key => `${key}:${spec[key].toString('async1')}`).filter(x => x.length > 2).join(',');
          it(title, async function () {
            const { a1, a2, b1, b2 } = spec;

            @customElement({ name: 'root', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })
            class Root extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia);
              }
            }
            @customElement({ name: 'a1', template: '<au-viewport></au-viewport>' })
            class A1 extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia, a1);
              }
            }
            @customElement({ name: 'a2', template: null })
            class A2 extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia, a2);
              }
            }
            @customElement({ name: 'b1', template: '<au-viewport></au-viewport>' })
            class B1 extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia, b1);
              }
            }
            @customElement({ name: 'b2', template: null })
            class B2 extends TestRouteViewModelBase {
              public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) {
                super(hia, b2);
              }
            }

            const { router, hia, tearDown } = await createFixture(Root, [A1, A2, B1, B2], getDefaultHIAConfig, getRouterOptions);

            const phase1 = `('' -> 'a1@$0/a2+b1@$1/b2')`;

            hia.setPhase(phase1);
            await router.load('a1@$0/a2+b1@$1/b2');

            await tearDown();

            const expected = [...getExpectedNotifyHistory(spec, phase1)];
            assert.deepStrictEqual(hia.notifyHistory, expected);

            hia.dispose();
          });
        }

        for (const [
          a1CanEnter, a2CanEnter, b1CanEnter, b2CanEnter,
          a1Enter, a2Enter, b1Enter, b2Enter,
        ] of [
          // canEnter variations
          [
            2, 1, 1, 1,
            1, 1, 1, 1,
          ],
          [
            1, 1, 2, 1,
            1, 1, 1, 1,
          ],
          [
            2, 1, 1, 2,
            1, 1, 1, 1,
          ],
          [
            1, 2, 2, 1,
            1, 1, 1, 1,
          ],
          [
            3, 1, 1, 1,
            1, 1, 1, 1,
          ],
          [
            1, 1, 3, 1,
            1, 1, 1, 1,
          ],
          [
            3, 1, 1, 3,
            1, 1, 1, 1,
          ],
          [
            1, 3, 3, 1,
            1, 1, 1, 1,
          ],
          [
            4, 1, 1, 1,
            1, 1, 1, 1,
          ],
          [
            1, 1, 4, 1,
            1, 1, 1, 1,
          ],
          [
            4, 1, 1, 4,
            1, 1, 1, 1,
          ],
          [
            1, 4, 4, 1,
            1, 1, 1, 1,
          ],
          [
            5, 1, 1, 1,
            1, 1, 1, 1,
          ],
          [
            1, 1, 5, 1,
            1, 1, 1, 1,
          ],
          [
            5, 1, 1, 5,
            1, 1, 1, 1,
          ],
          [
            1, 5, 5, 1,
            1, 1, 1, 1,
          ],
          [
            10, 1, 1, 1,
            1, 1, 1, 1,
          ],
          [
            1, 1, 10, 1,
            1, 1, 1, 1,
          ],
          // enter variations
          [
            1, 1, 1, 1,
            2, 1, 1, 1,
          ],
          [
            1, 1, 1, 1,
            1, 1, 2, 1,
          ],
          [
            1, 1, 1, 1,
            2, 1, 1, 2,
          ],
          [
            1, 1, 1, 1,
            1, 2, 2, 1,
          ],
          [
            1, 1, 1, 1,
            3, 1, 1, 1,
          ],
          [
            1, 1, 1, 1,
            1, 1, 3, 1,
          ],
          [
            1, 1, 1, 1,
            3, 1, 1, 3,
          ],
          [
            1, 1, 1, 1,
            1, 3, 3, 1,
          ],
          [
            1, 1, 1, 1,
            4, 1, 1, 1,
          ],
          [
            1, 1, 1, 1,
            1, 1, 4, 1,
          ],
          [
            1, 1, 1, 1,
            4, 1, 1, 4,
          ],
          [
            1, 1, 1, 1,
            1, 4, 4, 1,
          ],
          [
            1, 1, 1, 1,
            5, 1, 1, 1,
          ],
          [
            1, 1, 1, 1,
            1, 1, 5, 1,
          ],
          [
            1, 1, 1, 1,
            5, 1, 1, 5,
          ],
          [
            1, 1, 1, 1,
            1, 5, 5, 1,
          ],
          [
            1, 1, 1, 1,
            10, 1, 1, 1,
          ],
          [
            1, 1, 1, 1,
            1, 1, 10, 1,
          ],
        ]) {
          runTest({
            a1: HookSpecs.create({
              ...getAllAsyncSpecs(1),
              canEnter: hookSpecsMap.canEnter.async(a1CanEnter),
              enter: hookSpecsMap.enter.async(a1Enter),
            }),
            a2: HookSpecs.create({
              ...getAllAsyncSpecs(1),
              canEnter: hookSpecsMap.canEnter.async(a2CanEnter),
              enter: hookSpecsMap.enter.async(a2Enter),
            }),
            b1: HookSpecs.create({
              ...getAllAsyncSpecs(1),
              canEnter: hookSpecsMap.canEnter.async(b1CanEnter),
              enter: hookSpecsMap.enter.async(b1Enter),
            }),
            b2: HookSpecs.create({
              ...getAllAsyncSpecs(1),
              canEnter: hookSpecsMap.canEnter.async(b2CanEnter),
              enter: hookSpecsMap.enter.async(b2Enter),
            }),
          }, function* (spec, phase1) {
            yield* activate(`start`, 'root', true, false);

            switch (routerOptionsSpec.resolutionStrategy) {
              case 'dynamic':
                yield* interleave(
                  (function* () {
                    if (a1CanEnter > 1) { yield ''; }
                    if (a1CanEnter > 9) { yield ''; }
                    yield `${phase1}.a1.canEnter`;
                  })(),
                  (function* () {
                    if (b1CanEnter > 4) { yield ''; }
                    yield `${phase1}.b1.canEnter`;
                  })(),
                );
                switch (routerOptionsSpec.lifecycleStrategy) {
                  case 'phased':
                    yield* interleave(
                      (function* () {
                        if (a1Enter > 1) { yield ''; }
                        if (a1Enter > 4) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        yield `${phase1}.a1.enter`;
                      })(),
                      (function* () {
                        if (b1Enter > 3) { yield ''; }
                        if (b1Enter > 4) { yield ''; }
                        yield `${phase1}.b1.enter`;
                      })(),
                    );
                    yield* interleave(
                      (function* () {
                        yield `${phase1}.a1.beforeBind`;
                        yield `${phase1}.a1.afterBind`;
                        yield `${phase1}.a1.afterAttach`;
                        yield `${phase1}.a1.afterAttachChildren`;

                        if (a2CanEnter > 1) { yield ''; }
                        yield `${phase1}.a2.canEnter`;
                        if (a2CanEnter > 3) { yield ''; }
                        if (a2Enter > 1) { yield ''; }
                        yield `${phase1}.a2.enter`;
                        if (a2CanEnter > 2) { yield ''; }
                        if (a2CanEnter > 4) { yield ''; }
                        if (a2Enter > 2) { yield ''; }
                        if (a2Enter > 4) { yield ''; }
                        yield `${phase1}.a2.beforeBind`;
                        yield `${phase1}.a2.afterBind`;
                        yield `${phase1}.a2.afterAttach`;
                        if (b2CanEnter > 4) { yield ''; }
                        yield `${phase1}.a2.afterAttachChildren`;
                      })(),
                      (function* () {
                        yield `${phase1}.b1.beforeBind`;
                        yield `${phase1}.b1.afterBind`;
                        yield `${phase1}.b1.afterAttach`;
                        yield `${phase1}.b1.afterAttachChildren`;

                        yield `${phase1}.b2.canEnter`;
                        if (b2CanEnter > 3) { yield ''; }
                        if (b2CanEnter > 4) { yield ''; }
                        yield `${phase1}.b2.enter`;
                        if (b2CanEnter > 2) { yield ''; }
                        if (b2Enter > 2) { yield ''; }
                        if (b2Enter > 3) { yield ''; }
                        yield `${phase1}.b2.beforeBind`;
                        yield `${phase1}.b2.afterBind`;
                        if (a2CanEnter > 3) { yield ''; }
                        yield `${phase1}.b2.afterAttach`;
                        yield `${phase1}.b2.afterAttachChildren`;
                      })(),
                    );
                    break;
                  case 'parallel':
                    yield* interleave(
                      (function* () {
                        if (a1Enter > 9) { yield ''; }
                        if (a1Enter > 4) { yield ''; }
                        if (a1Enter > 1) { yield ''; }
                        yield `${phase1}.a1.enter`;
                        if (a1Enter > 2) { yield ''; }
                        yield `${phase1}.a1.beforeBind`;
                        yield `${phase1}.a1.afterBind`;
                        yield `${phase1}.a1.afterAttach`;
                        yield `${phase1}.a1.afterAttachChildren`;

                        if (b1Enter > 2) { yield ''; }
                        if (b1Enter > 3) { yield ''; }
                        if (b1Enter > 4) { yield ''; }
                        if (b1Enter > 9) { yield ''; }
                        if (a2CanEnter > 1) { yield ''; }
                        yield `${phase1}.a2.canEnter`;
                        if (a2CanEnter > 2) { yield ''; }
                        if (b2CanEnter > 2) { yield ''; }
                        if (a2CanEnter > 4) { yield ''; }
                        if (a2Enter > 1) { yield ''; }
                        if (a2Enter > 4) { yield ''; }
                        if (b1Enter > 9) { yield ''; }
                        yield `${phase1}.a2.enter`;
                        if (b2Enter > 1) { yield ''; }
                        if (a2Enter > 2) { yield ''; }
                        yield `${phase1}.a2.beforeBind`;
                        yield `${phase1}.a2.afterBind`;
                        yield `${phase1}.a2.afterAttach`;
                        yield `${phase1}.a2.afterAttachChildren`;
                      })(),
                      (function* () {
                        if (b1Enter > 9) { yield ''; }
                        if (b1Enter > 9) { yield ''; }
                        if (b1Enter > 3) { yield ''; }
                        yield `${phase1}.b1.enter`;
                        if (b1Enter > 2) { yield ''; }
                        yield `${phase1}.b1.beforeBind`;
                        yield `${phase1}.b1.afterBind`;
                        yield `${phase1}.b1.afterAttach`;
                        yield `${phase1}.b1.afterAttachChildren`;

                        if (a1Enter > 1) { yield ''; }
                        if (a1Enter > 2) { yield ''; }
                        if (a1Enter > 4) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        if ((b2Enter - a1Enter) > 2) { yield ''; }
                        if (b1Enter > 4) { yield ''; }
                        if (b2CanEnter > 2) { yield ''; }
                        yield `${phase1}.b2.canEnter`;
                        if (b2CanEnter > 2) { yield ''; }
                        if (b2CanEnter > 3) { yield ''; }
                        if (b2Enter > 1) { yield ''; }
                        if (b2Enter > 3) { yield ''; }
                        yield `${phase1}.b2.enter`;
                        if (b2Enter > 2) { yield ''; }
                        yield `${phase1}.b2.beforeBind`;
                        yield `${phase1}.b2.afterBind`;
                        yield `${phase1}.b2.afterAttach`;
                        yield `${phase1}.b2.afterAttachChildren`;
                      })(),
                    );
                    break;
                }

                yield* deactivate(`stop`, 'root', false, false);
                yield* interleave(
                  deactivate(`stop`, 'a1', false, false),
                  deactivate(`stop`, 'b1', false, false),
                );
                yield* interleave(
                  deactivate(`stop`, 'a2', false, false),
                  deactivate(`stop`, 'b2', false, false),
                );
                yield `stop.root.afterUnbindChildren`;
                yield `stop.a2.afterUnbindChildren`;
                yield `stop.b2.afterUnbindChildren`;
                yield `stop.a1.afterUnbindChildren`;
                yield `stop.b1.afterUnbindChildren`;
                break;
              case 'static':
                yield* interleave(
                  (function* () {
                    if (a1CanEnter > 1) { yield ''; }
                    if (a1CanEnter > 9) { yield ''; }
                    yield `${phase1}.a1.canEnter`;
                    if (a2CanEnter > 4) { yield ''; }
                    yield `${phase1}.a2.canEnter`;
                  })(),
                  (function* () {
                    if (b1CanEnter > 4) { yield ''; }
                    yield `${phase1}.b1.canEnter`;
                    yield `${phase1}.b2.canEnter`;
                  })(),
                );
                switch (routerOptionsSpec.lifecycleStrategy) {
                  case 'phased':
                    yield* interleave(
                      (function* () {
                        if (a1Enter > 1) { yield ''; }
                        if (a1Enter > 4) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        yield `${phase1}.a1.enter`;
                        if (a2Enter > 3) { yield ''; }
                        if (a2Enter > 4) { yield ''; }
                        yield `${phase1}.a2.enter`;
                      })(),
                      (function* () {
                        if (b1Enter > 3) { yield ''; }
                        if (b1Enter > 4) { yield ''; }
                        yield `${phase1}.b1.enter`;
                        if (b2Enter > 4) { yield ''; }
                        yield `${phase1}.b2.enter`;
                      })(),
                    );
                    yield* interleave(
                      activate(phase1, 'a1', false, false),
                      activate(phase1, 'b1', false, false),
                    );
                    yield* interleave(
                      activate(phase1, 'a2', false, false),
                      activate(phase1, 'b2', false, false),
                    );
                    yield `${phase1}.a2.afterAttachChildren`;
                    yield `${phase1}.a1.afterAttachChildren`;
                    yield `${phase1}.b2.afterAttachChildren`;
                    yield `${phase1}.b1.afterAttachChildren`;
                    break;
                  case 'parallel': {
                    // TODO(fkleuver): clean this up (urgently)
                    yield* interleave(
                      (function* () {
                        if (a1Enter > 1) { yield ''; }
                        if (a1Enter > 4) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        yield `${phase1}.a1.enter`;
                        if (a1Enter > 2) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        yield `${phase1}.a1.beforeBind`;
                        yield `${phase1}.a1.afterBind`;
                        if (a1Enter > 3) { yield ''; }
                        yield `${phase1}.a1.afterAttach`;
                        if (a2Enter > 2) { yield ''; }
                        if (a2Enter > 4) { yield ''; }
                        yield `${phase1}.a2.enter`;
                        if (a1Enter > 4) { yield ''; }
                        if (a2Enter > 1) { yield ''; }
                        if (a2Enter > 3) { yield ''; }
                        if (a2Enter > 4) { yield ''; }
                        yield `${phase1}.a2.beforeBind`;
                        if (b1Enter > 1) { yield ''; }
                        yield `${phase1}.a2.afterBind`;
                        if (b2Enter > 4) { yield ''; }
                        yield `${phase1}.a2.afterAttach`;
                        if (a1Enter > 1) { yield ''; }
                        if (b1Enter > 2) { yield ''; }
                        if (b1Enter > 3) { yield ''; }
                        if (b1Enter > 4) { yield ''; }
                        if (b1Enter > 4) { yield ''; }
                        yield `${phase1}.a2.afterAttachChildren`;
                        yield `${phase1}.a1.afterAttachChildren`;
                      })(),
                      (function* () {
                        if (b1Enter > 3) { yield ''; }
                        if (b1Enter > 9) { yield ''; }
                        if (b1Enter > 9) { yield ''; }
                        yield `${phase1}.b1.enter`;
                        if (b1Enter > 2) { yield ''; }
                        if (b1Enter > 9) { yield ''; }
                        if (b1Enter > 9) { yield ''; }
                        if (b1Enter > 9) { yield ''; }
                        yield `${phase1}.b1.beforeBind`;
                        if (b1Enter > 4) { yield ''; }
                        yield `${phase1}.b1.afterBind`;
                        if (b1Enter > 4) { yield ''; }
                        yield `${phase1}.b1.afterAttach`;
                        if (b1Enter > 1) { yield ''; }
                        if (b2Enter > 2) { yield ''; }
                        if (b2Enter > 3) { yield ''; }
                        yield `${phase1}.b2.enter`;
                        if (b2Enter > 1) { yield ''; }
                        if (b2Enter > 4) { yield ''; }
                        if (b2Enter > 4) { yield ''; }
                        yield `${phase1}.b2.beforeBind`;
                        if (a1Enter > 4) { yield ''; }
                        if (a2Enter > 1) { yield ''; }
                        yield `${phase1}.b2.afterBind`;
                        if (a1Enter > 3) { yield ''; }
                        yield `${phase1}.b2.afterAttach`;
                        if (b1Enter > 1) { yield ''; }
                        if (a1Enter > 2) { yield ''; }
                        if (a1Enter > 4) { yield ''; }
                        if (b2Enter > 1) { yield ''; }
                        if (b2Enter > 1) { yield ''; }
                        if (a2Enter > 2) { yield ''; }
                        if (a2Enter > 3) { yield ''; }
                        if (a2Enter > 4) { yield ''; }
                        if (a2Enter > 4) { yield ''; }
                        if (a1CanEnter > 1) { yield ''; }
                        if (b1CanEnter > 1) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        if (a1Enter > 9) { yield ''; }
                        yield `${phase1}.b2.afterAttachChildren`;
                        yield `${phase1}.b1.afterAttachChildren`;
                      })(),
                    );
                    break;
                  }
                }

                yield* deactivate(`stop`, 'root', false, false);
                yield* interleave(
                  deactivate(`stop`, 'a1', false, false),
                  deactivate(`stop`, 'b1', false, false),
                );
                yield* interleave(
                  deactivate(`stop`, 'a2', false, false),
                  deactivate(`stop`, 'b2', false, false),
                );
                yield `stop.root.afterUnbindChildren`;
                yield `stop.a2.afterUnbindChildren`;
                yield `stop.b2.afterUnbindChildren`;
                yield `stop.a1.afterUnbindChildren`;
                yield `stop.b1.afterUnbindChildren`;
                break;
            }
          });
        }
      });
    }
  });

  describe('error handling', function () {
    const resolutionStrategies: ResolutionStrategy[] = [
      'static',
      'dynamic',
    ];
    const lifecycleStrategies: LifecycleStrategy[] = [
      'phased',
      'parallel',
    ];
    const swapStrategies: SwapStrategy[] = [
      'parallel',
      'add-first',
      'remove-first',
    ];
    const routerOptionsSpecs: IRouterOptionsSpec[] = [];
    for (const resolutionStrategy of resolutionStrategies) {
      for (const lifecycleStrategy of lifecycleStrategies) {
        for (const swapStrategy of swapStrategies) {
          routerOptionsSpecs.push({
            resolutionStrategy,
            lifecycleStrategy,
            swapStrategy,
            toString() {
              return `resolutionStrategy:'${resolutionStrategy}',lifecycleStrategy:'${lifecycleStrategy}',swapStrategy:'${swapStrategy}'`;
            },
          });
        }
      }
    }
    interface IErrorSpec {
      action: (router: IRouter, container: IContainer) => Promise<void>;
      messageMatcher: RegExp;
      stackMatcher: RegExp;
      toString(): string;
    }

    for (const routerOptionsSpec of routerOptionsSpecs) {
      const getRouterOptions = (): IRouterOptions => routerOptionsSpec;

      describe(`${routerOptionsSpec}`, function () {
        function runTest(
          spec: IErrorSpec,
        ) {
          it(`re-throws ${spec}`, async function () {
            @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
            class Root {}

            const { router, container, tearDown } = await createFixture(Root, [], getDefaultHIAConfig, getRouterOptions);

            let err: Error | undefined = void 0;
            try {
              await spec.action(router, container);
            } catch ($err) {
              err = $err;
            }

            if (err === void 0) {
              assert.fail(`Expected an error, but no error was thrown`);
            } else {
              assert.match(err.message, spec.messageMatcher, `Expected message to match`);
              assert.match(err.stack, spec.stackMatcher, `Expected stack to match`);
            }

            try {
              await tearDown();
            } catch ($err) {
              if (($err.message as string).includes('error in')) {
                // The router should by default "remember" the last error and propagate it once again from the first deactivated viewport
                // on the next shutdown attempt.
                // This is the error we expect, so ignore it
              } else {
                // Re-throw anything else which would not be an expected error (e.g. "unexpected state" shouldn't happen if the router handled
                // the last error)
                throw $err;
              }
            }
          });
        }

        for (const hookName of [
          'beforeBind',
          'afterBind',
          'afterAttach',
          'afterAttachChildren',
          'canEnter',
          'enter',
        ] as HookName[]) {
          runTest({
            async action(router, container) {
              const target = CustomElement.define({ name: 'a', template: null }, class Target {
                public async [hookName]() {
                  throw new Error(`error in ${hookName}`);
                }
              });

              container.register(target);
              await router.load(target);
            },
            messageMatcher: new RegExp(`error in ${hookName}`),
            stackMatcher: new RegExp(`Target.${hookName}`),
            toString() {
              return String(this.messageMatcher);
            },
          });
        }

        for (const hookName of [
          'beforeDetach',
          'beforeUnbind',
          'afterUnbind',
          'afterUnbindChildren',
          'canLeave',
          'leave',
        ] as HookName[]) {
          runTest({
            async action(router, container) {
              const target1 = CustomElement.define({ name: 'a', template: null }, class Target1 {
                public async [hookName]() {
                  throw new Error(`error in ${hookName}`);
                }
              });

              // These shouldn't throw
              const target2 = CustomElement.define({ name: 'a', template: null }, class Target2 {
                public async beforeBind() { throw new Error(`error in beforeBind`); }
                public async afterBind() { throw new Error(`error in afterBind`); }
                public async afterAttach() { throw new Error(`error in afterAttach`); }
                public async canEnter() { throw new Error(`error in canEnter`); }
                public async enter() { throw new Error(`error in enter`); }
              });

              container.register(target1, target2);
              await router.load(target1);
              await router.load(target2);
            },
            messageMatcher: new RegExp(`error in ${hookName}`),
            stackMatcher: new RegExp(`Target1.${hookName}`),
            toString() {
              return String(this.messageMatcher);
            },
          });
        }
      });
    }
  });
});

function join(sep: string, ...parts: string[]): string {
  return parts.filter(function (x) {
    return x.length > 0 && x.split('@')[0].length > 0;
  }).join(sep);
}

function getAllAsyncSpecs(count: number): HookSpecs {
  return HookSpecs.create({
    beforeBind: hookSpecsMap.beforeBind.async(count),
    afterBind: hookSpecsMap.afterBind.async(count),
    afterAttach: hookSpecsMap.afterAttach.async(count),
    afterAttachChildren: hookSpecsMap.afterAttachChildren.async(count),

    beforeDetach: hookSpecsMap.beforeDetach.async(count),
    beforeUnbind: hookSpecsMap.beforeUnbind.async(count),
    afterUnbind: hookSpecsMap.afterUnbind.async(count),
    afterUnbindChildren: hookSpecsMap.afterUnbindChildren.async(count),

    canEnter: hookSpecsMap.canEnter.async(count),
    enter: hookSpecsMap.enter.async(count),
    canLeave: hookSpecsMap.canLeave.async(count),
    leave: hookSpecsMap.leave.async(count),
  });
}
