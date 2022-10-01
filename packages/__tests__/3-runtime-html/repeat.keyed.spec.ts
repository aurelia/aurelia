import { batch } from '@aurelia/runtime';
import { Aurelia, CustomElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { TestContext, assert } from "@aurelia/testing";

describe("repeat.keyed", function () {
  function $(k: number) {
    return new Item(`${k}`);
  }
  class Item {
    constructor(
      public k: string,
    ) {}
  }

  describe('array', function () {
    class Component {
      constructor(
        public items: Item[],
      ) {}
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

        await fn({ au, host, mutations, mutate, component });

        await au.stop();
        au.dispose();
      }

      function $it(title: string, fn: (ctx: $ctx) => Promise<void>) {
        it(title, async function () { await testFn.bind(this)(fn); });
      }
      $it.only = function (title: string, fn: (ctx: $ctx) => Promise<void>) {
        it.only(title, async function () { await testFn.bind(this)(fn); });
      }
      $it.skip = function (title: string, fn: (ctx: $ctx) => Promise<void>) {
        it.skip(title, async function () { await testFn.bind(this)(fn); });
      }

      $it('simple replacement', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          const $$4 = $(4);
          component.items.splice(4, 1, $$4);
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations.length, 2);
      });

      $it('simple move', async function ({ au, host, mutations, mutate, component }) {
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
      });
    });

    describe('keyed', function () {
      async function testFn(fn: (ctx: $ctx) => Promise<void>) {
        const ctx = TestContext.create();
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement("div");

        const App = CustomElement.define(
          {
            name: "app",
            template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
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

        await fn({ au, host, mutations, mutate, component });

        await au.stop();
        au.dispose();
      }

      function $it(title: string, fn: (ctx: $ctx) => Promise<void>) {
        it(title, async function () { await testFn.bind(this)(fn); });
      }
      $it.only = function (title: string, fn: (ctx: $ctx) => Promise<void>) {
        it.only(title, async function () { await testFn.bind(this)(fn); });
      }
      $it.skip = function (title: string, fn: (ctx: $ctx) => Promise<void>) {
        it.skip(title, async function () { await testFn.bind(this)(fn); });
      }

      describe('array replacement', function () {
        $it('no initial items, only additions', async function ({ au, host, mutations, mutate, component }) {
          await au.start();
          assert.strictEqual(host.textContent, '');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(4)];
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 5, 'mutations.length');
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '2', 'mutations[2].addedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '1', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '0', 'mutations[4].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '2', 'mutations[2].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '2', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '0', 'mutations[2].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '3', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '1', 'mutations[2].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '0', 'mutations[2].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '0', 'mutations[2].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '0', 'mutations[2].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].removedNodes.length, 1, 'mutations[3].removedNodes.length');
          assert.strictEqual(mutations[4].removedNodes.length, 1, 'mutations[4].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].removedNodes[0].textContent, '3', 'mutations[3].removedNodes[0].textContent');
          assert.strictEqual(mutations[4].removedNodes[0].textContent, '4', 'mutations[4].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '3', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '3', 'mutations[2].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '3', 'mutations[2].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].removedNodes.length, 1, 'mutations[3].removedNodes.length');
          assert.strictEqual(mutations[4].removedNodes.length, 1, 'mutations[4].removedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[6].addedNodes.length, 1, 'mutations[6].addedNodes.length');
          assert.strictEqual(mutations[7].addedNodes.length, 1, 'mutations[7].addedNodes.length');
          assert.strictEqual(mutations[8].addedNodes.length, 1, 'mutations[8].addedNodes.length');
          assert.strictEqual(mutations[9].addedNodes.length, 1, 'mutations[9].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].removedNodes[0].textContent, '3', 'mutations[3].removedNodes[0].textContent');
          assert.strictEqual(mutations[4].removedNodes[0].textContent, '4', 'mutations[4].removedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '9', 'mutations[5].addedNodes[0].textContent');
          assert.strictEqual(mutations[6].addedNodes[0].textContent, '8', 'mutations[6].addedNodes[0].textContent');
          assert.strictEqual(mutations[7].addedNodes[0].textContent, '7', 'mutations[7].addedNodes[0].textContent');
          assert.strictEqual(mutations[8].addedNodes[0].textContent, '6', 'mutations[8].addedNodes[0].textContent');
          assert.strictEqual(mutations[9].addedNodes[0].textContent, '5', 'mutations[9].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '7', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '6', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '5', 'mutations[5].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '3', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '9', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '8', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '7', 'mutations[5].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '3', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '8', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '7', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '6', 'mutations[5].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '9', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '7', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '5', 'mutations[5].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '3', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '8', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '7', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '5', 'mutations[5].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '3', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '8', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '6', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '5', 'mutations[5].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '0', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '4', 'mutations[3].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent'); // different item is moved due to lis
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '3', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '3', 'mutations[3].addedNodes[0].textContent');
        });

        $it('0 moves from pos 0 to 1', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(1), $(0), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '1023456789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
        });

        $it('0 moves from pos 0 to 2', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(1), $(2), $(0), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '1203456789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '0', 'mutations[1].addedNodes[0].textContent');
        });

        $it('0 moves from pos 0 to 3', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(1), $(2), $(3), $(0), $(4), $(5), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '1230456789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '0', 'mutations[1].addedNodes[0].textContent');
        });

        $it('0 moves from pos 0 to 5', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(1), $(2), $(3), $(4), $(5), $(0), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '1234506789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '0', 'mutations[1].addedNodes[0].textContent');
        });

        $it('0 moves from pos 0 to 8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(0), $(9)];
          });

          assert.strictEqual(host.textContent, '1234567809');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '0', 'mutations[1].addedNodes[0].textContent');
        });

        $it('0 moves from pos 0 to 9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9), $(0)];
          });

          assert.strictEqual(host.textContent, '1234567890');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '0', 'mutations[1].addedNodes[0].textContent');
        });

        $it('1 moves from pos 1 to 2', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(2), $(1), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '0213456789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
        });

        $it('1 moves from pos 1 to 3', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(2), $(3), $(1), $(4), $(5), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '0231456789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
        });

        $it('1 moves from pos 1 to 5', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(2), $(3), $(4), $(5), $(1), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '0234516789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
        });

        $it('1 moves from pos 1 to 8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(1), $(9)];
          });

          assert.strictEqual(host.textContent, '0234567819');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
        });

        $it('1 moves from pos 1 to 9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9), $(1)];
          });

          assert.strictEqual(host.textContent, '0234567891');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
        });

        $it('2 moves from pos 2 to 3', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(3), $(2), $(4), $(5), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '0132456789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '3', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
        });

        $it('2 moves from pos 2 to 5', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(3), $(4), $(5), $(2), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '0134526789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
        });

        $it('2 moves from pos 2 to 8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(3), $(4), $(5), $(6), $(7), $(8), $(2), $(9)];
          });

          assert.strictEqual(host.textContent, '0134567829');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
        });

        $it('2 moves from pos 2 to 9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(3), $(4), $(5), $(6), $(7), $(8), $(9), $(2)];
          });

          assert.strictEqual(host.textContent, '0134567892');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
        });

        $it('3 moves from pos 3 to 5', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(4), $(5), $(3), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '0124536789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '3', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
        });

        $it('3 moves from pos 3 to 8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(4), $(5), $(6), $(7), $(8), $(3), $(9)];
          });

          assert.strictEqual(host.textContent, '0124567839');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '3', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
        });

        $it('3 moves from pos 3 to 9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(4), $(5), $(6), $(7), $(8), $(9), $(3)];
          });

          assert.strictEqual(host.textContent, '0124567893');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '3', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
        });

        $it('4 moves from pos 4 to 5', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(5), $(4), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '0123546789');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '5', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '5', 'mutations[1].addedNodes[0].textContent');
        });

        $it('4 moves from pos 4 to 8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(5), $(6), $(7), $(8), $(4), $(9)];
          });

          assert.strictEqual(host.textContent, '0123567849');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '4', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '4', 'mutations[1].addedNodes[0].textContent');
        });

        $it('4 moves from pos 4 to 9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(5), $(6), $(7), $(8), $(9), $(4)];
          });

          assert.strictEqual(host.textContent, '0123567894');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '4', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '4', 'mutations[1].addedNodes[0].textContent');
        });

        $it('5 moves from pos 5 to 8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(6), $(7), $(8), $(5), $(9)];
          });

          assert.strictEqual(host.textContent, '0123467859');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '5', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '5', 'mutations[1].addedNodes[0].textContent');
        });

        $it('5 moves from pos 5 to 9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(6), $(7), $(8), $(9), $(5)];
          });

          assert.strictEqual(host.textContent, '0123467895');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '5', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '5', 'mutations[1].addedNodes[0].textContent');
        });

        $it('6 moves from pos 6 to 8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(7), $(8), $(6), $(9)];
          });

          assert.strictEqual(host.textContent, '0123457869');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '6', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '6', 'mutations[1].addedNodes[0].textContent');
        });

        $it('6 moves from pos 6 to 9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(7), $(8), $(9), $(6)];
          });

          assert.strictEqual(host.textContent, '0123457896');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '6', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '6', 'mutations[1].addedNodes[0].textContent');
        });

        $it('7 moves from pos 7 to 8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(8), $(7), $(9)];
          });

          assert.strictEqual(host.textContent, '0123456879');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '8', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '8', 'mutations[1].addedNodes[0].textContent');
        });

        $it('7 moves from pos 7 to 9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(8), $(9), $(7)];
          });

          assert.strictEqual(host.textContent, '0123456897');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '7', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '7', 'mutations[1].addedNodes[0].textContent');
        });

        $it('8 moves from pos 8 to 9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(9), $(8)];
          });

          assert.strictEqual(host.textContent, '0123456798');
          assert.strictEqual(mutations.length, 2);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '9', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '9', 'mutations[1].addedNodes[0].textContent');
        });

        $it('0,1 moves from pos 0,1 to 2,3', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(2), $(3), $(0), $(1), $(4), $(5), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '2301456789');
          assert.strictEqual(mutations.length, 4);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '3', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '2', 'mutations[3].addedNodes[0].textContent');
        });

        $it('0,1 moves from pos 0,1 to 3,4', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(2), $(3), $(4), $(0), $(1), $(5), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '2340156789');
          assert.strictEqual(mutations.length, 4);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '0', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '0', 'mutations[3].addedNodes[0].textContent');
        });

        $it('0,1 moves from pos 0,1 to 6,7', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(2), $(3), $(4), $(5), $(6), $(7), $(0), $(1), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '2345670189');
          assert.strictEqual(mutations.length, 4);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '0', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '0', 'mutations[3].addedNodes[0].textContent');
        });

        $it('0,1 moves from pos 0,1 to 8,9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9), $(0), $(1)];
          });

          assert.strictEqual(host.textContent, '2345678901');
          assert.strictEqual(mutations.length, 4);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '1', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '0', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '0', 'mutations[3].addedNodes[0].textContent');
        });

        $it('2,3 moves from pos 2,3 to 6,7', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(4), $(5), $(6), $(7), $(2), $(3), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '0145672389');
          assert.strictEqual(mutations.length, 4);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '3', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '2', 'mutations[3].addedNodes[0].textContent');
        });

        $it('2,3 moves from pos 2,3 to 8,9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(4), $(5), $(6), $(7), $(8), $(9), $(2), $(3)];
          });

          assert.strictEqual(host.textContent, '0145678923');
          assert.strictEqual(mutations.length, 4);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '3', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '2', 'mutations[3].addedNodes[0].textContent');
        });

        $it('4,5 moves from pos 4,5 to 6,7', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(6), $(7), $(4), $(5), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '0123674589');
          assert.strictEqual(mutations.length, 4);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '7', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '7', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '6', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '6', 'mutations[3].addedNodes[0].textContent');
        });

        $it('4,5 moves from pos 4,5 to 8,9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(1), $(2), $(3), $(6), $(7), $(8), $(9), $(4), $(5)];
          });

          assert.strictEqual(host.textContent, '0123678945');
          assert.strictEqual(mutations.length, 4);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '5', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '5', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '4', 'mutations[3].addedNodes[0].textContent');
        });

        $it('0,1,2 moves from pos 0,1,2 to 3,4,5', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(3), $(4), $(5), $(0), $(1), $(2), $(6), $(7), $(8), $(9)];
          });

          assert.strictEqual(host.textContent, '3450126789');
          assert.strictEqual(mutations.length, 6);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '5', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '5', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '4', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].removedNodes[0].textContent, '3', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '3', 'mutations[3].addedNodes[0].textContent');
        });

        $it('0,1,2 moves from pos 0,1,2 to 6,7,8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(3), $(4), $(5), $(6), $(7), $(8), $(0), $(1), $(2), $(9)];
          });

          assert.strictEqual(host.textContent, '3456780129');
          assert.strictEqual(mutations.length, 6);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '1', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '1', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].removedNodes[0].textContent, '0', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '0', 'mutations[3].addedNodes[0].textContent');
        });

        $it('0,1,2 moves from pos 0,1,2 to 7,8,9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(3), $(4), $(5), $(6), $(7), $(8), $(9), $(0), $(1), $(2)];
          });

          assert.strictEqual(host.textContent, '3456789012');
          assert.strictEqual(mutations.length, 6);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '1', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '1', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].removedNodes[0].textContent, '0', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '0', 'mutations[3].addedNodes[0].textContent');
        });

        $it('1,2,3 moves from pos 1,2,3 to 6,7,8', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(4), $(5), $(6), $(7), $(8), $(1), $(2), $(3), $(9)];
          });

          assert.strictEqual(host.textContent, '0456781239');
          assert.strictEqual(mutations.length, 6);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '3', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '2', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].removedNodes[0].textContent, '1', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '1', 'mutations[3].addedNodes[0].textContent');
        });

        $it('1,2,3 moves from pos 1,2,3 to 7,8,9', async function ({ au, host, mutations, mutate, component }) {
          component.items = [$(0), $(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9)];

          await au.start();
          assert.strictEqual(host.textContent, '0123456789');

          await mutate(() => {
            component.items = [$(0), $(4), $(5), $(6), $(7), $(8), $(9), $(1), $(2), $(3)];
          });

          assert.strictEqual(host.textContent, '0456789123');
          assert.strictEqual(mutations.length, 6);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '3', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '2', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].removedNodes[0].textContent, '1', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '1', 'mutations[3].addedNodes[0].textContent');
        });
      });

      describe('item replacement', function () {
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '4', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '5', 'mutations[1].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '0', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '4', 'mutations[3].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[3].removedNodes.length, 1, 'mutations[3].removedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '5', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '2', 'mutations[2].addedNodes[0].textContent'); // different item is moved due to lis
          assert.strictEqual(mutations[3].removedNodes[0].textContent, '3', 'mutations[3].removedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '3', 'mutations[4].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '5', 'mutations[0].addedNodes[0].textContent');
        });
      });
    });
  });

  describe('set', function () {
    class Component {
      constructor(
        public items: Set<Item>,
      ) {}
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
            template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
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

        await fn({ au, host, mutations, mutate, component });

        await au.stop();
        au.dispose();
      }

      function $it(title: string, fn: (ctx: $ctx) => Promise<void>) {
        it(title, async function () { await testFn.bind(this)(fn); });
      }
      $it.only = function (title: string, fn: (ctx: $ctx) => Promise<void>) {
        it.only(title, async function () { await testFn.bind(this)(fn); });
      }
      $it.skip = function (title: string, fn: (ctx: $ctx) => Promise<void>) {
        it.skip(title, async function () { await testFn.bind(this)(fn); });
      }

      describe('set replacement', function () {
        $it('no initial items, only additions', async function ({ au, host, mutations, mutate, component }) {
          await au.start();
          assert.strictEqual(host.textContent, '');

          await mutate(() => {
            component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 5, 'mutations.length');
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '2', 'mutations[2].addedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '1', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '0', 'mutations[4].addedNodes[0].textContent');
        });

        $it('2 initial items, 3 additions at end', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(0), $(1)]);

          await au.start();
          assert.strictEqual(host.textContent, '01');

          await mutate(() => {
            component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 3);
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '2', 'mutations[2].addedNodes[0].textContent');
        });

        $it('2 initial items, 3 additions at start', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(3), $(4)]);

          await au.start();
          assert.strictEqual(host.textContent, '34');

          await mutate(() => {
            component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 3);
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '2', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '0', 'mutations[2].addedNodes[0].textContent');
        });

        $it('2 initial items, 3 additions interleaved', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(1), $(3)]);

          await au.start();
          assert.strictEqual(host.textContent, '13');

          await mutate(() => {
            component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 3);
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '0', 'mutations[2].addedNodes[0].textContent');
        });

        $it('remove all initial items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Set([]);
          });

          assert.strictEqual(host.textContent, '');
          assert.strictEqual(mutations.length, 5);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].removedNodes.length, 1, 'mutations[3].removedNodes.length');
          assert.strictEqual(mutations[4].removedNodes.length, 1, 'mutations[4].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].removedNodes[0].textContent, '3', 'mutations[3].removedNodes[0].textContent');
          assert.strictEqual(mutations[4].removedNodes[0].textContent, '4', 'mutations[4].removedNodes[0].textContent');
        });

        $it('remove first 3 items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Set([$(3), $(4)]);
          });

          assert.strictEqual(host.textContent, '34');
          assert.strictEqual(mutations.length, 3);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
        });

        $it('remove last 3 items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Set([$(0), $(1)]);
          });

          assert.strictEqual(host.textContent, '01');
          assert.strictEqual(mutations.length, 3);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '3', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
        });

        $it('remove 3 interleaved items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Set([$(1), $(3)]);
          });

          assert.strictEqual(host.textContent, '13');
          assert.strictEqual(mutations.length, 3);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
        });

        $it('replace first 3 items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Set([$(5), $(6), $(7), $(3), $(4)]);
          });

          assert.strictEqual(host.textContent, '56734');
          assert.strictEqual(mutations.length, 6);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '7', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '6', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '5', 'mutations[5].addedNodes[0].textContent');
        });

        $it('replace last 3 items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Set([$(0), $(1), $(7), $(8), $(9)]);
          });

          assert.strictEqual(host.textContent, '01789');
          assert.strictEqual(mutations.length, 6);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '3', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '9', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '8', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '7', 'mutations[5].addedNodes[0].textContent');
        });

        $it('replace 3 interleaved items', async function ({ au, host, mutations, mutate, component }) {
          component.items = new Set([$(0), $(1), $(2), $(3), $(4)]);

          await au.start();
          assert.strictEqual(host.textContent, '01234');

          await mutate(() => {
            component.items = new Set([$(5), $(1), $(7), $(3), $(9)]);
          });

          assert.strictEqual(host.textContent, '51739');
          assert.strictEqual(mutations.length, 6);
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '9', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '7', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '5', 'mutations[5].addedNodes[0].textContent');
        });
      });
    });
  });

  describe('map', function () {
    class Component {
      constructor(
        public items: Map<number, Item>,
      ) {}
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

        await fn({ au, host, mutations, mutate, component });

        await au.stop();
        au.dispose();
      }

      function $it(title: string, fn: (ctx: $ctx) => Promise<void>) {
        it(title, async function () { await testFn.bind(this)(fn); });
      }
      $it.only = function (title: string, fn: (ctx: $ctx) => Promise<void>) {
        it.only(title, async function () { await testFn.bind(this)(fn); });
      }
      $it.skip = function (title: string, fn: (ctx: $ctx) => Promise<void>) {
        it.skip(title, async function () { await testFn.bind(this)(fn); });
      }

      describe('map replacement', function () {
        $it('no initial items, only additions', async function ({ au, host, mutations, mutate, component }) {
          await au.start();
          assert.strictEqual(host.textContent, '');

          await mutate(() => {
            component.items = new Map([[0, $(0)], [1, $(1)], [2, $(2)], [3, $(3)], [4, $(4)]]);
          });

          assert.strictEqual(host.textContent, '01234');
          assert.strictEqual(mutations.length, 5, 'mutations.length');
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '2', 'mutations[2].addedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '1', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '0', 'mutations[4].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '3', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '2', 'mutations[2].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '2', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '1', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '0', 'mutations[2].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].addedNodes.length, 1, 'mutations[0].addedNodes.length');
          assert.strictEqual(mutations[1].addedNodes.length, 1, 'mutations[1].addedNodes.length');
          assert.strictEqual(mutations[2].addedNodes.length, 1, 'mutations[2].addedNodes.length');
          assert.strictEqual(mutations[0].addedNodes[0].textContent, '4', 'mutations[0].addedNodes[0].textContent');
          assert.strictEqual(mutations[1].addedNodes[0].textContent, '2', 'mutations[1].addedNodes[0].textContent');
          assert.strictEqual(mutations[2].addedNodes[0].textContent, '0', 'mutations[2].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].removedNodes.length, 1, 'mutations[3].removedNodes.length');
          assert.strictEqual(mutations[4].removedNodes.length, 1, 'mutations[4].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].removedNodes[0].textContent, '3', 'mutations[3].removedNodes[0].textContent');
          assert.strictEqual(mutations[4].removedNodes[0].textContent, '4', 'mutations[4].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '3', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '1', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '2', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '7', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '6', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '5', 'mutations[5].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '2', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '3', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '9', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '8', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '7', 'mutations[5].addedNodes[0].textContent');
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
          assert.strictEqual(mutations[0].removedNodes.length, 1, 'mutations[0].removedNodes.length');
          assert.strictEqual(mutations[1].removedNodes.length, 1, 'mutations[1].removedNodes.length');
          assert.strictEqual(mutations[2].removedNodes.length, 1, 'mutations[2].removedNodes.length');
          assert.strictEqual(mutations[3].addedNodes.length, 1, 'mutations[3].addedNodes.length');
          assert.strictEqual(mutations[4].addedNodes.length, 1, 'mutations[4].addedNodes.length');
          assert.strictEqual(mutations[5].addedNodes.length, 1, 'mutations[5].addedNodes.length');
          assert.strictEqual(mutations[0].removedNodes[0].textContent, '0', 'mutations[0].removedNodes[0].textContent');
          assert.strictEqual(mutations[1].removedNodes[0].textContent, '2', 'mutations[1].removedNodes[0].textContent');
          assert.strictEqual(mutations[2].removedNodes[0].textContent, '4', 'mutations[2].removedNodes[0].textContent');
          assert.strictEqual(mutations[3].addedNodes[0].textContent, '9', 'mutations[3].addedNodes[0].textContent');
          assert.strictEqual(mutations[4].addedNodes[0].textContent, '7', 'mutations[4].addedNodes[0].textContent');
          assert.strictEqual(mutations[5].addedNodes[0].textContent, '5', 'mutations[5].addedNodes[0].textContent');
        });
      });
    });
  });
});
