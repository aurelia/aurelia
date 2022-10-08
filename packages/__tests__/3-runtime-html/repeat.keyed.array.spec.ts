/* eslint-disable @typescript-eslint/no-unused-vars */
import { batch } from '@aurelia/runtime';
import { Aurelia, CustomElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { TestContext, assert } from "@aurelia/testing";

describe("3-runtime-html/repeat.keyed.spec.ts", function () {
  function $(k: number) {
    return new Item(`${k}`);
  }
  class Item {
    constructor(
      public k: string,
    ) { }
  }

  function assertAdd(start: number, mutations: MutationRecord[], ...textContents: unknown[]) {
    const end = start + textContents.length - 1;
    for (let i = start; i <= end; ++i) {
      const mutation = mutations[i];
      const textContent = textContents[i - start];
      assert.strictEqual(mutation.addedNodes.length, 1, `mutations[${i}].addedNodes.length`);
      assert.strictEqual(mutation.addedNodes[0].textContent, String(textContent), `mutations[${i}].addedNodes[0].textContent`);
    }
  }

  function assertRem(start: number, mutations: MutationRecord[], ...textContents: unknown[]) {
    const end = start + textContents.length - 1;
    for (let i = start; i <= end; ++i) {
      const mutation = mutations[i];
      const textContent = textContents[i - start];
      assert.strictEqual(mutation.removedNodes.length, 1, `mutations[${i}].removedNodes.length`);
      assert.strictEqual(mutation.removedNodes[0].textContent, String(textContent), `mutations[${i}].removedNodes[0].textContent`);
    }
  }

  describe('array', function () {
    class Component {
      constructor(
        public items: Item[],
      ) { }
    }

    type $ctx = {
      au: Aurelia;
      host: HTMLElement;
      mutations: MutationRecord[];
      mutate: (cb: () => void) => Promise<void>;
      component: ICustomElementViewModel & Component;
    };

    describe('non-keyed', function () {
      async function testFn(fn: (ctx: $ctx) => Promise<void>) {
        const ctx = TestContext.create();
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement("div");

        const App = CustomElement.define(
          {
            name: "app",
            template: `<div repeat.for="i of items">\${i.k}</div>`
          },
          Component,
        );

        const mutations: MutationRecord[] = [];
        const obs = new ctx.wnd.MutationObserver(_mutations => mutations.splice(0, mutations.length, ..._mutations));

        const component = new App();
        au.app({ host, component });

        async function mutate(cb: () => void) {
          obs.observe(host, { childList: true });
          cb();
          await Promise.resolve();
          obs.disconnect();
        }

        try {
          await fn({ au, host, mutations, mutate, component });
        } finally {
          await au.stop();
          au.dispose();
        }
      }

      const $it = create$it(testFn);

      $it('mutate: simple replacement', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          const $$4 = $(4);
          component.items.splice(4, 1, $$4);
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations.length, 2);
        assertRem(0, mutations, 4);
        assertAdd(1, mutations, 4);
      });

      $it('mutate: simple move', async function ({ au, host, mutations, mutate, component }) {
        const [$0, $1, $2, $3, $4] = component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          batch(() => {
            component.items.splice(4, 1, $0);
            component.items.splice(0, 1, $4);
          });
        });

        assert.strictEqual(host.textContent, '41230');
        assert.strictEqual(mutations.length, 4);
        assertRem(0, mutations, 0, 4);
        assertAdd(2, mutations, 0, 4);
      });

      $it('reassign: new array, different items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(0), $(1), $(2), $(3), $(4)];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations.length, 10);
        assertRem(0, mutations, 0, 1, 2, 3, 4);
        assertAdd(5, mutations, 4, 3, 2, 1, 0);
      });

      $it('reassign: new array, same items', async function ({ au, host, mutations, mutate, component }) {
        const [$0, $1, $2, $3, $4] = component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$0, $1, $2, $3, $4];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations.length, 0);
      });

      $it('reassign: new array with same items, 1 swap', async function ({ au, host, mutations, mutate, component }) {
        const [$0, $1, $2, $3, $4] = component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$4, $1, $2, $3, $0];
        });

        assert.strictEqual(host.textContent, '41230');
        assert.strictEqual(mutations.length, 4);
        assertRem(0, mutations, 0);
        assertAdd(1, mutations, 0);
        assertRem(2, mutations, 4);
        assertAdd(3, mutations, 4);
      });
    });

    for (const spec of [
      { title: 'literal', expr: 'i of items; key: k', text: '${i.k}' },
      { title: 'expression', expr: 'i of items; key.bind: i.k', text: '${i.k}' }
    ]) {
      describe(`keyed - ${spec.title}`, function () {
        async function testFn(fn: (ctx: $ctx) => Promise<void>) {
          const ctx = TestContext.create();
          const au = new Aurelia(ctx.container);
          const host = ctx.createElement("div");

          const App = CustomElement.define(
            {
              name: "app",
              template: `<div repeat.for="${spec.expr}">${spec.text}</div>`
            },
            Component,
          );

          const mutations: MutationRecord[] = [];
          const obs = new ctx.wnd.MutationObserver(_mutations => mutations.splice(0, mutations.length, ..._mutations));

          const component = new App();
          au.app({ host, component });

          async function mutate(cb: () => void) {
            obs.observe(host, { childList: true });
            cb();
            await Promise.resolve();
            obs.disconnect();
          }

          try {
            await fn({ au, host, mutations, mutate, component });
          } finally {
            await au.stop();
            au.dispose();
          }
        }

        const $it = create$it(testFn);

        describe('reassign: ', function () {
          $it('no initial items, only additions', async function ({ au, host, mutations, mutate, component }) {
            await au.start();
            assert.strictEqual(host.textContent, '');

            await mutate(() => {
              component.items = [$(0), $(1), $(2), $(3), $(4)];
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 5, 'mutations.length');
            assertAdd(0, mutations, 4, 3, 2, 1, 0);
          });

          $it('2 initial items, 3 additions at end', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1)];

            await au.start();
            assert.strictEqual(host.textContent, '01');

            await mutate(() => {
              component.items = [$(0), $(1), $(2), $(3), $(4)];
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 3);
            assertAdd(0, mutations, 4, 3, 2);
          });

          $it('2 initial items, 3 additions at start', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '34');

            await mutate(() => {
              component.items = [$(0), $(1), $(2), $(3), $(4)];
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 3);
            assertAdd(0, mutations, 2, 1, 0);
          });

          $it('2 initial items, 3 additions in middle', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '04');

            await mutate(() => {
              component.items = [$(0), $(1), $(2), $(3), $(4)];
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 3);
            assertAdd(0, mutations, 3, 2, 1);
          });

          $it('2 initial items, 3 additions interleaved', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(1), $(3)];

            await au.start();
            assert.strictEqual(host.textContent, '13');

            await mutate(() => {
              component.items = [$(0), $(1), $(2), $(3), $(4)];
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 3);
            assertAdd(0, mutations, 4, 2, 0);
          });

          $it('2 initial items, 1/2 additions interleaved', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(1), $(2)];

            await au.start();
            assert.strictEqual(host.textContent, '12');

            await mutate(() => {
              component.items = [$(0), $(1), $(2), $(3), $(4)];
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 3);
            assertAdd(0, mutations, 4, 3, 0);
          });

          $it('2 initial items, 2/1 additions interleaved', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(2), $(3)];

            await au.start();
            assert.strictEqual(host.textContent, '23');

            await mutate(() => {
              component.items = [$(0), $(1), $(2), $(3), $(4)];
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 3);
            assertAdd(0, mutations, 4, 1, 0);
          });

          $it('remove all initial items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [];
            });

            assert.strictEqual(host.textContent, '');
            assert.strictEqual(mutations.length, 5);
            assertRem(0, mutations, 0, 1, 2, 3, 4);
          });

          $it('remove first 3 items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(3), $(4)];
            });

            assert.strictEqual(host.textContent, '34');
            assert.strictEqual(mutations.length, 3);
            assertRem(0, mutations, 0, 1, 2);
          });

          $it('remove last 3 items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(0), $(1)];
            });

            assert.strictEqual(host.textContent, '01');
            assert.strictEqual(mutations.length, 3);
            assertRem(0, mutations, 2, 3, 4);
          });

          $it('remove middle 3 items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(0), $(4)];
            });

            assert.strictEqual(host.textContent, '04');
            assert.strictEqual(mutations.length, 3);
            assertRem(0, mutations, 1, 2, 3);
          });

          $it('remove 3 interleaved items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(1), $(3)];
            });

            assert.strictEqual(host.textContent, '13');
            assert.strictEqual(mutations.length, 3);
            assertRem(0, mutations, 0, 2, 4);
          });

          $it('remove 1/2 interleaved items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(1), $(4)];
            });

            assert.strictEqual(host.textContent, '14');
            assert.strictEqual(mutations.length, 3);
            assertRem(0, mutations, 0, 2, 3);
          });

          $it('remove 2/1 interleaved items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(0), $(3)];
            });

            assert.strictEqual(host.textContent, '03');
            assert.strictEqual(mutations.length, 3);
            assertRem(0, mutations, 1, 2, 4);
          });

          $it('replace all initial items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(5), $(6), $(7), $(8), $(9)];
            });

            assert.strictEqual(host.textContent, '56789');
            assert.strictEqual(mutations.length, 10);
            assertRem(0, mutations, 0, 1, 2, 3, 4);
            assertAdd(5, mutations, 9, 8, 7, 6, 5);
          });

          $it('replace first 3 items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(5), $(6), $(7), $(3), $(4)];
            });

            assert.strictEqual(host.textContent, '56734');
            assert.strictEqual(mutations.length, 6);
            assertRem(0, mutations, 0, 1, 2);
            assertAdd(3, mutations, 7, 6, 5);
          });

          $it('replace last 3 items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(0), $(1), $(7), $(8), $(9)];
            });

            assert.strictEqual(host.textContent, '01789');
            assert.strictEqual(mutations.length, 6);
            assertRem(0, mutations, 2, 3, 4);
            assertAdd(3, mutations, 9, 8, 7);
          });

          $it('replace middle 3 items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(0), $(6), $(7), $(8), $(4)];
            });

            assert.strictEqual(host.textContent, '06784');
            assert.strictEqual(mutations.length, 6);
            assertRem(0, mutations, 1, 2, 3);
            assertAdd(3, mutations, 8, 7, 6);
          });

          $it('replace 3 interleaved items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(5), $(1), $(7), $(3), $(9)];
            });

            assert.strictEqual(host.textContent, '51739');
            assert.strictEqual(mutations.length, 6);
            assertRem(0, mutations, 0, 2, 4);
            assertAdd(3, mutations, 9, 7, 5);
          });

          $it('replace 1/2 interleaved items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(5), $(1), $(7), $(8), $(4)];
            });

            assert.strictEqual(host.textContent, '51784');
            assert.strictEqual(mutations.length, 6);
            assertRem(0, mutations, 0, 2, 3);
            assertAdd(3, mutations, 8, 7, 5);
          });

          $it('replace 2/1 interleaved items', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(5), $(6), $(2), $(8), $(4)];
            });

            assert.strictEqual(host.textContent, '56284');
            assert.strictEqual(mutations.length, 6);
            assertRem(0, mutations, 0, 1, 3);
            assertAdd(3, mutations, 8, 6, 5);
          });

          $it('same items, no moves', async function ({ au, host, mutations, mutate, component }) {
            const [$0, $1, $2, $3, $4] = component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$0, $1, $2, $3, $4];
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 0);
          });

          $it('same items, 2 moves', async function ({ au, host, mutations, mutate, component }) {
            const [$0, $1, $2, $3, $4] = component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$4, $1, $2, $3, $0];
            });

            assert.strictEqual(host.textContent, '41230');
            assert.strictEqual(mutations.length, 4); // 2x move
            assertRem(0, mutations, 0);
            assertAdd(1, mutations, 0);
            assertRem(2, mutations, 4);
            assertAdd(3, mutations, 4);
          });

          $it('new items with same key, no moves', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(0), $(1), $(2), $(3), $(4)];
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 0);
          });

          $it('new items with same key, 2 moves', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items = [$(0), $(3), $(2), $(1), $(4)];
            });

            assert.strictEqual(host.textContent, '03214');
            assert.strictEqual(mutations.length, 4);
            assertRem(0, mutations, 2);
            assertAdd(1, mutations, 2);
            assertRem(2, mutations, 3);
            assertAdd(3, mutations, 3);
          });

          $it('move first item to second position (left outer edge diff)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(1), $(0), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];
            });

            assert.strictEqual(host.textContent, '1023456789');
            assert.strictEqual(mutations.length, 2);
            assertRem(0, mutations, 1);
            assertAdd(1, mutations, 1);
          });

          $it('move first item to third position (left inner edge diff)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(1), $(2), $(0), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];
            });

            assert.strictEqual(host.textContent, '1203456789');
            assert.strictEqual(mutations.length, 2);
            assertRem(0, mutations, 0);
            assertAdd(1, mutations, 0);
          });

          $it('move first item to second-last position (right inner edge diff)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(0), $(9)];
            });

            assert.strictEqual(host.textContent, '1234567809');
            assert.strictEqual(mutations.length, 2);
            assertRem(0, mutations, 0);
            assertAdd(1, mutations, 0);
          });

          $it('move first item to last position (right outer edge diff)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9), $(0)];
            });

            assert.strictEqual(host.textContent, '1234567890');
            assert.strictEqual(mutations.length, 2);
            assertRem(0, mutations, 0);
            assertAdd(1, mutations, 0);
          });

          $it('move second item to third position (left outer edge diff with narrowed left edge)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(0), $(2), $(1), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];
            });

            assert.strictEqual(host.textContent, '0213456789');
            assert.strictEqual(mutations.length, 2);
            assertRem(0, mutations, 2);
            assertAdd(1, mutations, 2);
          });

          $it('move second item to fourth position (left inner edge diff with narrowed left edge)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(0), $(2), $(3), $(1), $(4), $(5), $(6), $(7), $(8), $(9)];
            });

            assert.strictEqual(host.textContent, '0231456789');
            assert.strictEqual(mutations.length, 2);
            assertRem(0, mutations, 1);
            assertAdd(1, mutations, 1);
          });

          $it('move second item to second-last position (right inner edge diff with narrowed left edge)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(0), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(1), $(9)];
            });

            assert.strictEqual(host.textContent, '0234567819');
            assert.strictEqual(mutations.length, 2);
            assertRem(0, mutations, 1);
            assertAdd(1, mutations, 1);
          });

          $it('move second item to last position (right outer edge diff with narrowed left edge)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(0), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9), $(1)];
            });

            assert.strictEqual(host.textContent, '0234567891');
            assert.strictEqual(mutations.length, 2);
            assertRem(0, mutations, 1);
            assertAdd(1, mutations, 1);
          });

          $it('move first two items to third and fourth positions (left outer edge diff with multiple items)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(2), $(3), $(0), $(1), $(4), $(5), $(6), $(7), $(8), $(9)];
            });

            assert.strictEqual(host.textContent, '2301456789');
            assert.strictEqual(mutations.length, 4);
            assertRem(0, mutations, 3);
            assertAdd(1, mutations, 3);
            assertRem(2, mutations, 2);
            assertAdd(3, mutations, 2);
          });

          $it('move first two items to fourth and fifth positions (left inner edge diff with multiple items)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(2), $(3), $(4), $(0), $(1), $(5), $(6), $(7), $(8), $(9)];
            });

            assert.strictEqual(host.textContent, '2340156789');
            assert.strictEqual(mutations.length, 4);
            assertRem(0, mutations, 1);
            assertAdd(1, mutations, 1);
            assertRem(2, mutations, 0);
            assertAdd(3, mutations, 0);
          });

          $it('move first two items to third-last and second-last positions (right inner edge diff with multiple items)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(2), $(3), $(4), $(5), $(6), $(7), $(8), $(0), $(1), $(9)];
            });

            assert.strictEqual(host.textContent, '2345678019');
            assert.strictEqual(mutations.length, 4);
            assertRem(0, mutations, 1);
            assertAdd(1, mutations, 1);
            assertRem(2, mutations, 0);
            assertAdd(3, mutations, 0);
          });

          $it('move first two items to second-last and last positions (right outer edge diff with multiple items)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9), $(0), $(1)];
            });

            assert.strictEqual(host.textContent, '2345678901');
            assert.strictEqual(mutations.length, 4);
            assertRem(0, mutations, 1);
            assertAdd(1, mutations, 1);
            assertRem(2, mutations, 0);
            assertAdd(3, mutations, 0);
          });

          $it('move second and third item to third-last and second-last positions (right inner edge diff with multiple items and narrowed left edge)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(0), $(3), $(4), $(5), $(6), $(7), $(8), $(1), $(2), $(9)];
            });

            assert.strictEqual(host.textContent, '0345678129');
            assert.strictEqual(mutations.length, 4);
            assertRem(0, mutations, 2);
            assertAdd(1, mutations, 2);
            assertRem(2, mutations, 1);
            assertAdd(3, mutations, 1);
          });

          $it('move second and third item to second-last and last positions (right outer edge diff with multiple items and narrowed left edge)', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

            await au.start();
            assert.strictEqual(host.textContent, '0123456789');

            await mutate(() => {
              component.items = [$(0), $(3), $(4), $(5), $(6), $(7), $(8), $(9), $(1), $(2)];
            });

            assert.strictEqual(host.textContent, '0345678912');
            assert.strictEqual(mutations.length, 4);
            assertRem(0, mutations, 2);
            assertAdd(1, mutations, 2);
            assertRem(2, mutations, 1);
            assertAdd(3, mutations, 1);
          });
        });

        describe('mutate: ', function () {
          $it('same key, same pos', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items.splice(4, 1, $(4));
            });

            assert.strictEqual(host.textContent, '01234');
            assert.strictEqual(mutations.length, 0);
          });

          $it('different key', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items.splice(4, 1, $(5));
            });

            assert.strictEqual(host.textContent, '01235');
            assert.strictEqual(mutations.length, 2);
            assertRem(0, mutations, 4);
            assertAdd(1, mutations, 5);
          });
        });

        describe('item swap', function () {
          $it('same key', async function ({ au, host, mutations, mutate, component }) {
            const [$0, $1, $2, $3, $4] = component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              batch(() => {
                component.items.splice(4, 1, $0);
                component.items.splice(0, 1, $4);
              });
            });

            assert.strictEqual(host.textContent, '41230');
            assert.strictEqual(mutations.length, 4);
            assertRem(0, mutations, 0);
            assertAdd(1, mutations, 0);
            assertRem(2, mutations, 4);
            assertAdd(3, mutations, 4);
          });
        });

        describe('index assignment', function () {
          $it('same items', async function ({ au, host, mutations, mutate, component }) {
            const [$0, $1, $2, $3, $4] = component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items[1] = $3;
              component.items[3] = $1;
              component.items.push($(5));
            });

            assert.strictEqual(host.textContent, '032145');
            assert.strictEqual(mutations.length, 5);
            assertAdd(0, mutations, 5);
            assertRem(1, mutations, 2);
            assertAdd(2, mutations, 2);
            assertRem(3, mutations, 3);
            assertAdd(4, mutations, 3);
          });

          $it('new items with same key', async function ({ au, host, mutations, mutate, component }) {
            component.items = [$(0), $(1), $(2), $(3), $(4)];

            await au.start();
            assert.strictEqual(host.textContent, '01234');

            await mutate(() => {
              component.items[0] = $(0);
              component.items[1] = $(1);
              component.items[2] = $(2);
              component.items[3] = $(3);
              component.items[4] = $(4);
              component.items.push($(5));
            });

            assert.strictEqual(host.textContent, '012345');
            assert.strictEqual(mutations.length, 1); // 1x add
            assertAdd(0, mutations, 5);
          });
        });
      });
    }
  });
});

function create$it<K extends any[], T extends (...args: K) => unknown>(testFn: T) {
  function $it(title: string, fn: (ctx: K[0]) => Promise<void>) {
    it(title, async function () { await testFn.bind(this)(fn); });
  }
  $it.only = function (title: string, fn: (ctx: K[0]) => Promise<void>) {
    // eslint-disable-next-line mocha/no-exclusive-tests
    it.only(title, async function () { await testFn.bind(this)(fn); });
  };
  $it.skip = function (title: string, fn: (ctx: K[0]) => Promise<void>) {
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip(title, async function () { await testFn.bind(this)(fn); });
  };

  return $it;
}
