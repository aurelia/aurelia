/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { customElement } from '@aurelia/runtime';
import { IRouterOptions } from '@aurelia/router';
import { assert } from '@aurelia/testing';

import { IHookInvocationAggregator, IHIAConfig } from './_shared/hook-invocation-tracker';
import { TestRouteViewModelBase, HookSpecs } from './_shared/view-models';
import { hookSpecs } from './_shared/hook-spec';
import { getCalls } from './_shared/get-calls';
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

// function getDefaultRouterOptions(): IRouterOptions {
//   return {};
// }

describe('router hooks', function () {
  const strategies = [
    // 'static',
    'dynamic',
  ] as const;

  const timings = [
    // 'sync',
    'async1',
    // 'async2',
  ] as const;

  for (const strategy of strategies) {
    const getRouterOptions = (): IRouterOptions => {
      return {
        // resolutionStrategy: strategy,
        useUrlFragmentHash: true,
        useHref: true,
        statefulHistoryLength: 0,
        useDirectRoutes: true,
        useConfiguredRoutes: true,
        title: {
          appTitle: "${componentTitles}\${appTitleSeparator}Aurelia",
          appTitleSeparator: ' | ',
          componentTitleOrder: 'top-down',
          componentTitleSeparator: ' > ',
          useComponentNames: true,
          componentPrefix: 'app-',
        }
      };
    };

    describe(`strategy: '${strategy}'`, function () {
      for (const timing of timings) {
        const async = true; // timing !== 'sync';

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
              [['', 'a02'], ['a03', 'a02']],
              [['a01', 'a02'], ['', 'a02']],

              [['a01', 'a02'], ['a02', 'a02']],
              [['', 'a02'], ['a02', 'a02']],
              [['a01', 'a02'], ['', 'a02']],

              [['a02', 'a02'], ['a01', 'a02']],
              [['', 'a02'], ['a01', 'a02']],
              [['a02', 'a02'], ['', 'a02']],
              // Only $1 changes with every nav
              [['a01', 'a02'], ['a01', 'a03']],
              [['a01', ''], ['a01', 'a03']],
              [['a01', 'a02'], ['a01', '']],

              [['a01', 'a02'], ['a01', 'a01']],
              [['a01', ''], ['a01', 'a01']],
              [['a01', 'a02'], ['a01', '']],

              [['a01', 'a01'], ['a01', 'a02']],
              [['a01', ''], ['a01', 'a02']],
              [['a01', 'a01'], ['a01', '']],
              // Both $0 and $1 change with every nav
              [['a01', 'a02'], ['a03', 'a04']],
              [['', 'a02'], ['a03', 'a04']],
              [['a01', ''], ['a03', 'a04']],
              [['a01', 'a02'], ['', 'a04']],
              [['a01', 'a02'], ['a03', '']],

              [['a01', 'a02'], ['a02', 'a01']],
              [['', 'a02'], ['a02', 'a01']],
              [['a01', ''], ['a02', 'a01']],
              [['a01', 'a02'], ['', 'a01']],
              [['a01', 'a02'], ['a02', '']],

              [['a01', 'a02'], ['a04', 'a01']],
              [['', 'a02'], ['a04', 'a01']],
              [['a01', ''], ['a04', 'a01']],
              [['a01', 'a02'], ['', 'a01']],
              [['a01', 'a02'], ['a04', '']],
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
              [['a11', ''], ['a11', 'a02']],
              [['a11', 'a01'], ['a11', '']],

              [['a11', 'a11'], ['a11', 'a02']],
              [['a11', 'a11'], ['a11', '']],

              [['a11', 'a01'], ['a11', 'a11']],
              [['a11', ''], ['a11', 'a11']],
              // Both parent and child change with every nav
              [['a11', 'a01'], ['a12', 'a02']],
              [['a11', ''], ['a12', 'a02']],
              [['a11', 'a01'], ['a12', '']],

              [['a11', 'a11'], ['a12', 'a02']],
              [['a11', 'a11'], ['a12', 'a12']],
              [['a11', 'a11'], ['a12', '']],

              [['a12', 'a02'], ['a11', 'a11']],
              [['a12', 'a12'], ['a11', 'a11']],
              [['a12', ''], ['a11', 'a11']],

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
        });
      }

      describe('variations', function () {
        for (const hookSpec of [
          HookSpecs.create({ canLeave: hookSpecs.canLeave.setTimeout_0 }),
          HookSpecs.create({ leave: hookSpecs.leave.setTimeout_0 }),
          HookSpecs.create({ canEnter: hookSpecs.canEnter.setTimeout_0 }),
          HookSpecs.create({ enter: hookSpecs.enter.setTimeout_0 }),

          HookSpecs.create({ beforeBind: hookSpecs.beforeBind.setTimeout_0 }),
          HookSpecs.create({ afterBind: hookSpecs.afterBind.setTimeout_0 }),
          HookSpecs.create({ afterAttach: hookSpecs.afterAttach.setTimeout_0 }),

          HookSpecs.create({ beforeDetach: hookSpecs.beforeDetach.setTimeout_0 }),
          HookSpecs.create({ beforeUnbind: hookSpecs.beforeUnbind.setTimeout_0 }),
          HookSpecs.create({ afterUnbind: hookSpecs.afterUnbind.setTimeout_0 }),
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

            switch (strategy) {
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
                break;
              }
              // case 'static': {
              //   assert.deepStrictEqual(
              //     hia.notifyHistory,
              //     [
              //       `start.root.beforeBind`,
              //       `start.root.afterBind`,
              //       `start.root.afterAttach`,
              //       `start.root.afterAttachChildren`,

              //       `('' -> 'a/b/c/d').a.canEnter`,
              //       `('' -> 'a/b/c/d').b.canEnter`,
              //       `('' -> 'a/b/c/d').c.canEnter`,
              //       `('' -> 'a/b/c/d').d.canEnter`,

              //       `('' -> 'a/b/c/d').a.enter`,
              //       `('' -> 'a/b/c/d').b.enter`,
              //       `('' -> 'a/b/c/d').c.enter`,
              //       `('' -> 'a/b/c/d').d.enter`,

              //       `('' -> 'a/b/c/d').a.beforeBind`,
              //       `('' -> 'a/b/c/d').a.afterBind`,
              //       `('' -> 'a/b/c/d').a.afterAttach`,
              //       `('' -> 'a/b/c/d').b.beforeBind`,
              //       `('' -> 'a/b/c/d').b.afterBind`,
              //       `('' -> 'a/b/c/d').b.afterAttach`,
              //       `('' -> 'a/b/c/d').c.beforeBind`,
              //       `('' -> 'a/b/c/d').c.afterBind`,
              //       `('' -> 'a/b/c/d').c.afterAttach`,
              //       `('' -> 'a/b/c/d').d.beforeBind`,
              //       `('' -> 'a/b/c/d').d.afterBind`,
              //       `('' -> 'a/b/c/d').d.afterAttach`,
              //       `('' -> 'a/b/c/d').d.afterAttachChildren`,
              //       `('' -> 'a/b/c/d').c.afterAttachChildren`,
              //       `('' -> 'a/b/c/d').b.afterAttachChildren`,
              //       `('' -> 'a/b/c/d').a.afterAttachChildren`,

              //       `('a/b/c/d' -> 'a').b.canLeave`,
              //       `('a/b/c/d' -> 'a').c.canLeave`,
              //       `('a/b/c/d' -> 'a').d.canLeave`,

              //       `('a/b/c/d' -> 'a').b.leave`,
              //       `('a/b/c/d' -> 'a').c.leave`,
              //       `('a/b/c/d' -> 'a').d.leave`,

              //       `('a/b/c/d' -> 'a').b.beforeDetach`,
              //       `('a/b/c/d' -> 'a').b.beforeUnbind`,
              //       `('a/b/c/d' -> 'a').b.afterUnbind`,
              //       `('a/b/c/d' -> 'a').c.beforeDetach`,
              //       `('a/b/c/d' -> 'a').c.beforeUnbind`,
              //       `('a/b/c/d' -> 'a').c.afterUnbind`,
              //       `('a/b/c/d' -> 'a').d.beforeDetach`,
              //       `('a/b/c/d' -> 'a').d.beforeUnbind`,
              //       `('a/b/c/d' -> 'a').d.afterUnbind`,
              //       `('a/b/c/d' -> 'a').d.afterUnbindChildren`,
              //       `('a/b/c/d' -> 'a').c.afterUnbindChildren`,
              //       `('a/b/c/d' -> 'a').b.afterUnbindChildren`,
              //       `('a/b/c/d' -> 'a').b.dispose`,
              //       `('a/b/c/d' -> 'a').c.dispose`,
              //       `('a/b/c/d' -> 'a').d.dispose`,

              //       `stop.root.beforeDetach`,
              //       `stop.root.beforeUnbind`,
              //       `stop.root.afterUnbind`,

              //       `stop.a.beforeDetach`,
              //       `stop.a.beforeUnbind`,
              //       `stop.a.afterUnbind`,
              //       `stop.a.afterUnbindChildren`,

              //       `stop.root.afterUnbindChildren`,
              //     ],
              //   );
              //   break;
              // }
            }

            hia.dispose();
          });
        }
      });
    });
  }
});

function join(sep: string, ...parts: string[]): string {
  return parts.filter(function (x) {
    return x.length > 0 && x.split('@')[0].length > 0;
  }).join(sep);
}
