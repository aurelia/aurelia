/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { customElement } from '@aurelia/runtime';
import { IRouterOptions, DeferralJuncture, SwapStrategy, route, Route } from '@aurelia/router';
import { assert } from '@aurelia/testing';

import { IHookInvocationAggregator, IHIAConfig, HookName } from './_shared/hook-invocation-tracker';
import { TestRouteViewModelBase, HookSpecs } from './_shared/view-models';
import { hookSpecsMap } from './_shared/hook-spec';
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
export function* prepend(
  prefix: string,
  component: string,
  ...calls: (HookName | '')[]
) {
  for (const call of calls) {
    if (call === '') {
      yield '';
    } else {
      yield `${prefix}.${component}.${call}`;
    }
  }
}

export function* prependDeferrable(
  prefix: string,
  component: string,
  deferUntil: DeferralJuncture,
  ...calls: (HookName | '')[]
) {
  switch (deferUntil) {
    case 'none':
      yield `${prefix}.${component}.canLoad`;
      yield `${prefix}.${component}.load`;
      break;
    case 'guard-hooks':
      yield `${prefix}.${component}.load`;
      break;
  }

  for (const call of calls) {
    if (call === '') {
      yield '';
    } else {
      yield `${prefix}.${component}.${call}`;
    }
  }
}

export function* interleave(
  ...generators: Generator<string, void>[]
) {
  while (generators.length > 0) {
    for (let i = 0, ii = generators.length; i < ii; ++i) {
      const gen = generators[i];
      const next = gen.next();
      if (next.done) {
        generators.splice(i, 1);
        --i;
        --ii;
      } else {
        const value = next.value as string;
        if (value) {
          yield value;
        }
      }
    }
  }
}

export interface IRouterOptionsSpec {
  deferUntil: DeferralJuncture;
  swapStrategy: SwapStrategy;
  toString(): string;
}

export interface IComponentSpec {
  kind: 'all-sync' | 'all-async';
  hookSpecs: HookSpecs;
}

describe('router config', function () {
  // describe('monomorphic timings', function () {
  //   const deferUntils: DeferralJuncture[] = [
  //     'none',
  //     'guard-hooks',
  //     'load-hooks',
  //   ];
  //   const swapStrategies: SwapStrategy[] = [
  //     'parallel-remove-first',
  //     'sequential-add-first',
  //     'sequential-remove-first',
  //   ];
  //   const routerOptionsSpecs: IRouterOptionsSpec[] = [];
  //   for (const deferUntil of deferUntils) {
  //     for (const swapStrategy of swapStrategies) {
  //       routerOptionsSpecs.push({
  //         deferUntil,
  //         swapStrategy,
  //         toString() {
  //           return `deferUntil:'${deferUntil}',swapStrategy:'${swapStrategy}'`;
  //         },
  //       });
  //     }
  //   }

  //   const componentSpecs: IComponentSpec[] = [
  //     {
  //       kind: 'all-sync',
  //       hookSpecs: HookSpecs.create({
  //         beforeBind: hookSpecsMap.beforeBind.sync,
  //         afterBind: hookSpecsMap.afterBind.sync,
  //         afterAttach: hookSpecsMap.afterAttach.sync,
  //         afterAttachChildren: hookSpecsMap.afterAttachChildren.sync,

  //         beforeDetach: hookSpecsMap.beforeDetach.sync,
  //         beforeUnbind: hookSpecsMap.beforeUnbind.sync,
  //         afterUnbind: hookSpecsMap.afterUnbind.sync,
  //         afterUnbindChildren: hookSpecsMap.afterUnbindChildren.sync,

  //         canLoad: hookSpecsMap.canLoad.sync,
  //         load: hookSpecsMap.load.sync,
  //         canUnload: hookSpecsMap.canUnload.sync,
  //         unload: hookSpecsMap.unload.sync,
  //       }),
  //     },
  //     {
  //       kind: 'all-async',
  //       hookSpecs: getAllAsyncSpecs(1),
  //     },
  //   ];

  //   for (const componentSpec of componentSpecs) {
  //     const { kind, hookSpecs } = componentSpec;

  //     describe(`componentSpec.kind:'${kind}'`, function () {
  //       for (const routerOptionsSpec of routerOptionsSpecs) {
  //         const getRouterOptions = (): IRouterOptions => routerOptionsSpec;

  //         describe(`${routerOptionsSpec}`, function () {
  //           describe('single', function () {
  //             interface ISpec {
  //               t1: string;
  //               t2: string;
  //               t3: string;
  //               t4: string;
  //             }

  //             it(`works`, async function () {
  //               @customElement({ name: 'a01', template: null })
  //               class A01 extends TestRouteViewModelBase {
  //                 public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
  //               }

  //               @route({
  //                 children: [
  //                   {
  //                     path: 'a',
  //                     component: A01,
  //                   },
  //                 ],
  //               })
  //               @customElement({ name: 'root1', template: vp(1) })
  //               class Root1 extends TestRouteViewModelBase {
  //                 public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia, hookSpecs); }
  //               }

  //               const { router, hia } = await createFixture(Root1, [], getDefaultHIAConfig, getRouterOptions);

  //               hia.setPhase('');
  //               await router.load(t1);

  //               await tearDown();

  //               hia.dispose();
  //             });
  //           });
  //         });
  //       }
  //     });
  //   }
  // });

  for (const inDependencies of [true, false]) {
    describe(`inDependencies: ${inDependencies}`, function () {
      for (const routingMode of ['configured-first', 'configured-only'] as const) {
        describe(`routingMode: '${routingMode}'`, function () {
          it(`can load a configured child route with direct path and explicit component`, async function () {
            @customElement({ name: 'a01', template: null })
            class A01 {}

            @route({ children: [{ path: 'a', component: A01 }] })
            @customElement({ name: 'root', template: vp(1), dependencies: inDependencies ? [A01] : [] })
            class Root {}

            const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({ routingMode }));

            await router.load('a');
          });

          it(`can load a configured child route with indirect path and explicit component`, async function () {
            @route({ path: 'a' })
            @customElement({ name: 'a01', template: null })
            class A01 {}

            @route({ children: [A01] })
            @customElement({ name: 'root', template: vp(1), dependencies: inDependencies ? [A01] : [] })
            class Root {}

            const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({ routingMode }));

            await router.load('a');
          });
        });
      }
    });
  }

  it(`can load a direct route by name which is listed as a dependency when routingMode is 'configured-first'`, async function () {
    @customElement({ name: 'a01', template: null })
    class A01 {}

    @customElement({ name: 'root', template: vp(1), dependencies: [A01] })
    class Root {}

    const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({ routingMode: 'configured-first' }));

    await router.load('a01');
  });

  it(`can load a configured child route by name when routingMode is 'configured-first'`, async function () {
    @customElement({ name: 'a01', template: null })
    class A01 {}

    @route({ children: [A01] })
    @customElement({ name: 'root', template: vp(1) })
    class Root {}

    const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({ routingMode: 'configured-first' }));

    await router.load('a01');
  });

  it(`can load a configured child route by name when routingMode is 'configured-only'`, async function () {
    @customElement({ name: 'a01', template: null })
    class A01 {}

    @route({ children: [A01] })
    @customElement({ name: 'root', template: vp(1) })
    class Root {}

    const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({ routingMode: 'configured-only' }));

    await router.load('a01');
  });

  it(`can navigate to deep dependencies as long as they are declared`, async function () {
    @customElement({ name: 'c01', template: null })
    class C01 {}

    @customElement({ name: 'b11', template: vp(1), dependencies: [C01] })
    class B11 {}

    @customElement({ name: 'a11', template: vp(1), dependencies: [B11] })
    class A11 {}

    @customElement({ name: 'root', template: vp(1), dependencies: [A11] })
    class Root {}

    const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({}));

    await router.load('a11/b11/c01');
  });

  it(`works with single multi segment static path`, async function () {
    @customElement({ name: 'a01', template: null })
    class A01 {}

    @route({ children: [{ path: 'a/x', component: A01 }] })
    @customElement({ name: 'root', template: vp(1) })
    class Root {}

    const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({}));

    await router.load('a/x');
  });

  it(`works with single multi segment dynamic path`, async function () {
    @customElement({ name: 'a01', template: null })
    class A01 {}

    @route({ children: [{ path: 'a/:x', component: A01 }] })
    @customElement({ name: 'root', template: vp(1) })
    class Root {}

    const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({}));

    await router.load('a/1');
  });

  it(`works with single multi segment static path with single child`, async function () {
    @customElement({ name: 'b01', template: null })
    class B01 {}

    @route({ children: [{ path: 'b', component: B01 }] })
    @customElement({ name: 'a11', template: vp(1) })
    class A11 {}

    @route({ children: [{ path: 'a/x', component: A11 }] })
    @customElement({ name: 'root', template: vp(1) })
    class Root {}

    const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({}));

    await router.load('a/x/b');
  });

  it(`works with single multi segment static path with single multi segment static child`, async function () {
    @customElement({ name: 'b01', template: null })
    class B01 {}

    @route({ children: [{ path: 'b/x', component: B01 }] })
    @customElement({ name: 'a11', template: vp(1) })
    class A11 {}

    @route({ children: [{ path: 'a/x', component: A11 }] })
    @customElement({ name: 'root', template: vp(1) })
    class Root {}

    const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({}));

    await router.load('a/x/b/x');
  });

  it(`works with single static path with single multi segment static child`, async function () {
    @customElement({ name: 'b01', template: null })
    class B01 {}

    @route({ children: [{ path: 'b/x', component: B01 }] })
    @customElement({ name: 'a11', template: vp(1) })
    class A11 {}

    @route({ children: [{ path: 'a', component: A11 }] })
    @customElement({ name: 'root', template: vp(1) })
    class Root {}

    const { router } = await createFixture(Root, [], getDefaultHIAConfig, () => ({}));

    await router.load('a/b/x');
  });

  describe(`throw error when`, function () {
    function getErrorMsg({
      routingMode,
      isRegistered,
      instruction,
      parent,
      parentPath,
    }: {
      routingMode: 'configured-first' | 'configured-only';
      isRegistered: boolean;
      instruction: string;
      parent: string;
      parentPath: string;
    }) {
      switch (routingMode) {
        case 'configured-first':
          return `'${instruction}' did not match any configured route or registered component name at '${parentPath}' - did you forget to add the component '${instruction}' to the dependencies of '${parent}' or to register it as a global dependency?`;
        case 'configured-only':
          if (isRegistered) {
            return `'${instruction}' did not match any configured route, but it does match a registered component name at '${parentPath}' - did you forget to add a @route({ path: '${instruction}' }) decorator to '${instruction}' or unintentionally set routingMode to 'configured-only'?`;
          } else {
            return `'${instruction}' did not match any configured route or registered component name at '${parentPath}' - did you forget to add '${instruction}' to the children list of the route decorator of '${parent}'?`;
          }
      }
    }

    for (const routingMode of ['configured-first', 'configured-only'] as const) {
      // In these cases, whatever fails in 'configured-first' should also fail in 'configured-only',
      // so we could run these with only 'configured-first', but just to make sure we just loop through both modes for all cases.
      describe(`routingMode is '${routingMode}'`, function () {
        const routerOptions: IRouterOptions = { routingMode };
        const getRouterOptions = () => routerOptions;

        it(`load a configured child route with indirect path by name`, async function () {
          @route({ path: 'a' })
          @customElement({ name: 'a01', template: null })
          class A01 {}

          @route({ children: [A01] })
          @customElement({ name: 'root', template: vp(1) })
          class Root {}

          const { router } = await createFixture(Root, [], getDefaultHIAConfig, getRouterOptions);

          let e: Error | null = null;
          try {
            await router.load('a01');
          } catch (err) {
            e = err;
          }

          assert.notStrictEqual(e, null);
          assert.strictEqual(e.message, getErrorMsg({
            routingMode,
            isRegistered: false,
            instruction: 'a01',
            parent: 'root',
            parentPath: 'root',
          }));
        });

        it(`load a direct route by indirect path when listed only as a dependency`, async function () {
          @route({ path: 'a' })
          @customElement({ name: 'a01', template: null })
          class A01 {}

          @customElement({ name: 'root', template: vp(1), dependencies: [A01] })
          class Root {}

          const { router } = await createFixture(Root, [], getDefaultHIAConfig, getRouterOptions);

          let e: Error | null = null;
          try {
            await router.load('a');
          } catch (err) {
            e = err;
          }

          assert.notStrictEqual(e, null);
          assert.strictEqual(e.message, getErrorMsg({
            routingMode,
            isRegistered: false,
            instruction: 'a',
            parent: 'root',
            parentPath: 'root',
          }));
        });
      });
    }

    describe(`routingMode is 'configured-first'`, function () {
      const routerOptions: IRouterOptions = { routingMode: 'configured-first' };
      const getRouterOptions = () => routerOptions;

      it(`navigate to deep dependencies that are indirectly circular`, async function () {
        @customElement({ name: 'b11', template: vp(1) })
        class B11 {}

        @customElement({ name: 'a11', template: vp(1), dependencies: [B11] })
        class A11 {}

        @customElement({ name: 'root', template: vp(1), dependencies: [A11] })
        class Root {}

        const { router } = await createFixture(Root, [], getDefaultHIAConfig, getRouterOptions);

        let e: Error | null = null;
        try {
          await router.load('a11/b11/a11');
        } catch (err) {
          e = err;
        }

        assert.notStrictEqual(e, null);
        assert.strictEqual(e.message, getErrorMsg({
          routingMode: 'configured-first',
          isRegistered: false,
          instruction: 'a11',
          parent: 'b11',
          parentPath: 'root/a11/b11',
        }));
      });
    });

    describe(`routingMode is 'configured-only'`, function () {
      const routerOptions: IRouterOptions = { routingMode: 'configured-only' };
      const getRouterOptions = () => routerOptions;

      it(`load a direct route by name which is listed as a dependency`, async function () {
        @customElement({ name: 'a01', template: null })
        class A01 {}

        @customElement({ name: 'root', template: vp(1), dependencies: [A01] })
        class Root {}

        const { router } = await createFixture(Root, [], getDefaultHIAConfig, getRouterOptions);

        let e: Error | null = null;
        try {
          await router.load('a01');
        } catch (err) {
          e = err;
        }

        assert.notStrictEqual(e, null);
        assert.strictEqual(e.message, getErrorMsg({
          routingMode: 'configured-only',
          isRegistered: true,
          instruction: 'a01',
          parent: 'root',
          parentPath: 'root',
        }));
      });
    });
  });
});

function join(sep: string, ...parts: string[]): string {
  return parts.filter(function (x) {
    return x && x.split('@')[0];
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

    canLoad: hookSpecsMap.canLoad.async(count),
    load: hookSpecsMap.load.async(count),
    canUnload: hookSpecsMap.canUnload.async(count),
    unload: hookSpecsMap.unload.async(count),
  });
}

