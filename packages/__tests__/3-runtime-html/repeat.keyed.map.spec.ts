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

  describe('Map', function () {
    class Component {
      constructor(
        public items: Map<number, Item>,
      ) { }
    }

    type $ctx = {
      au: Aurelia;
      host: HTMLElement;
      mutations: MutationRecord[];
      mutate: (cb: () => void) => Promise<void>;
      component: ICustomElementViewModel & Component;
    };

    describe('keyed', function () {
      async function testFn(fn: (ctx: $ctx) => Promise<void>) {
        const ctx = TestContext.create();
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement("div");

        const App = CustomElement.define(
          {
            name: "app",
            template: `<div repeat.for="[$k, $v] of items" key="k">\${$v.k}</div>`
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
            component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 5, 'mutations.length');
          assertAdd(0, mutations, 4, 3, 2, 1, 0);
        });

        $it('2 initial items, 3 additions at end', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[0, $(0)], [1, $(1)]]);

          await au.start();
          assert.strictEqual(host.textContent, '01');

          await mutate(() => {
            component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 3);
          assertAdd(0, mutations, 4, 3, 2);
        });

        $it('2 initial items, 3 additions at start', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[3, $(3)], [4, $(4)]]);

          await au.start();
          assert.strictEqual(host.textContent, '34');

          await mutate(() => {
            component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 3);
          assertAdd(0, mutations, 2, 1, 0);
        });

        $it('2 initial items, 3 additions interleaved', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[1, $(1)], [3, $(3)]]);

          await au.start();
          assert.strictEqual(host.textContent, '13');

          await mutate(() => {
            component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 3);
          assertAdd(0, mutations, 4, 2, 0);
        });

        $it('remove all initial items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Map([]);
          });

          assert.strictEqual(host.textContent, '');
          assert.strictEqual(mutations.length, 5);
          assertRem(0, mutations, 0, 1, 2, 3, 4);
        });

        $it('remove first 3 items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Map([[3, $(3)], [4, $(4)]]);
          });

          assert.strictEqual(host.textContent, '34');
          assert.strictEqual(mutations.length, 3);
          assertRem(0, mutations, 0, 1, 2);
        });

        $it('remove last 3 items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Map([[0, $(0)], [1, $(1)]]);
          });

          assert.strictEqual(host.textContent, '01');
          assert.strictEqual(mutations.length, 3);
          assertRem(0, mutations, 2, 3, 4);
        });

        $it('remove 3 interleaved items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Map([[1, $(1)], [3, $(3)]]);
          });

          assert.strictEqual(host.textContent, '13');
          assert.strictEqual(mutations.length, 3);
          assertRem(0, mutations, 0, 2, 4);
        });

        $it('replace first 3 items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Map([[5, $(5)], [6, $(6)], [7, $(7)], [3, $(3)], [4, $(4)]]);
          });

          assert.strictEqual(host.textContent, '56734');
          assert.strictEqual(mutations.length, 6);
          assertRem(0, mutations, 0, 1, 2);
          assertAdd(3, mutations, 7, 6, 5);
        });

        $it('replace last 3 items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Map([[0, $(0)], [1, $(1)], [7, $(7)], [8, $(8)], [9, $(9)]]);
          });

          assert.strictEqual(host.textContent, '01789');
          assert.strictEqual(mutations.length, 6);
          assertRem(0, mutations, 2, 3, 4);
          assertAdd(3, mutations, 9, 8, 7);
        });

        $it('replace 3 interleaved items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Map([[5, $(5)], [1, $(1)], [7, $(7)], [3, $(3)], [9, $(9)]]);
          });

          assert.strictEqual(host.textContent, '51739');
          assert.strictEqual(mutations.length, 6);
          assertRem(0, mutations, 0, 2, 4);
          assertAdd(3, mutations, 9, 7, 5);
        });
      });
    });
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
