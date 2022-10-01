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
      assert.strictEqual(mutations!.length, 2);
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
      assert.strictEqual(mutations!.length, 4);
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
        assert.strictEqual(mutations!.length, 5);
      });

      $it('2 initial items, 3 additions at end', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1)];

        await au.start();
        assert.strictEqual(host.textContent, '01');

        await mutate(() => {
          component.items = [$(0), $(1), $(2), $(3), $(4)];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('2 initial items, 3 additions at start', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '34');

        await mutate(() => {
          component.items = [$(0), $(1), $(2), $(3), $(4)];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('2 initial items, 3 additions in middle', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '04');

        await mutate(() => {
          component.items = [$(0), $(1), $(2), $(3), $(4)];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('2 initial items, 3 additions interleaved', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(1), $(3)];

        await au.start();
        assert.strictEqual(host.textContent, '13');

        await mutate(() => {
          component.items = [$(0), $(1), $(2), $(3), $(4)];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('2 initial items, 1/2 additions interleaved', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(1), $(2)];

        await au.start();
        assert.strictEqual(host.textContent, '12');

        await mutate(() => {
          component.items = [$(0), $(1), $(2), $(3), $(4)];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('2 initial items, 2/1 additions interleaved', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(2), $(3)];

        await au.start();
        assert.strictEqual(host.textContent, '23');

        await mutate(() => {
          component.items = [$(0), $(1), $(2), $(3), $(4)];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('remove all initial items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [];
        });

        assert.strictEqual(host.textContent, '');
        assert.strictEqual(mutations!.length, 5);
      });

      $it('remove first 3 items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(3), $(4)];
        });

        assert.strictEqual(host.textContent, '34');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('remove last 3 items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(0), $(1)];
        });

        assert.strictEqual(host.textContent, '01');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('remove middle 3 items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(0), $(4)];
        });

        assert.strictEqual(host.textContent, '04');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('remove 3 interleaved items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(1), $(3)];
        });

        assert.strictEqual(host.textContent, '13');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('remove 1/2 interleaved items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(1), $(4)];
        });

        assert.strictEqual(host.textContent, '14');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('remove 2/1 interleaved items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(0), $(3)];
        });

        assert.strictEqual(host.textContent, '03');
        assert.strictEqual(mutations!.length, 3);
      });

      $it('replace all initial items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(5), $(6), $(7), $(8), $(9)];
        });

        assert.strictEqual(host.textContent, '56789');
        assert.strictEqual(mutations!.length, 10);
      });

      $it('replace first 3 items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(5), $(6), $(7), $(3), $(4)];
        });

        assert.strictEqual(host.textContent, '56734');
        assert.strictEqual(mutations!.length, 6);
      });

      $it('replace last 3 items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(0), $(1), $(7), $(8), $(9)];
        });

        assert.strictEqual(host.textContent, '01789');
        assert.strictEqual(mutations!.length, 6);
      });

      $it('replace middle 3 items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(0), $(6), $(7), $(8), $(4)];
        });

        assert.strictEqual(host.textContent, '06784');
        assert.strictEqual(mutations!.length, 6);
      });

      $it('replace 3 interleaved items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(5), $(1), $(7), $(3), $(9)];
        });

        assert.strictEqual(host.textContent, '51739');
        assert.strictEqual(mutations!.length, 6);
      });

      $it('replace 1/2 interleaved items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(5), $(1), $(7), $(8), $(4)];
        });

        assert.strictEqual(host.textContent, '51784');
        assert.strictEqual(mutations!.length, 6);
      });

      $it('replace 2/1 interleaved items', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(5), $(6), $(2), $(8), $(4)];
        });

        assert.strictEqual(host.textContent, '56284');
        assert.strictEqual(mutations!.length, 6);
      });

      $it('same items, no moves', async function ({ au, host, mutations, mutate, component }) {
        const [$0, $1, $2, $3, $4] = component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$0, $1, $2, $3, $4];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations!.length, 0);
      });

      $it('same items, 2 moves', async function ({ au, host, mutations, mutate, component }) {
        const [$0, $1, $2, $3, $4] = component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$4, $1, $2, $3, $0];
        });

        assert.strictEqual(host.textContent, '41230');
        assert.strictEqual(mutations!.length, 4); // 2x move
      });

      $it('new items with same key, no moves', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(0), $(1), $(2), $(3), $(4)];
        });

        assert.strictEqual(host.textContent, '01234');
        assert.strictEqual(mutations!.length, 0);
      });

      $it('new items with same key, 2 moves', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items = [$(0), $(3), $(2), $(1), $(4)];
        });

        assert.strictEqual(host.textContent, '03214');
        assert.strictEqual(mutations!.length, 4);
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
        assert.strictEqual(mutations!.length, 0);
      });

      $it('different key', async function ({ au, host, mutations, mutate, component }) {
        component.items = [$(0), $(1), $(2), $(3), $(4)];

        await au.start();
        assert.strictEqual(host.textContent, '01234');

        await mutate(() => {
          component.items.splice(4, 1, $(5));
        });

        assert.strictEqual(host.textContent, '01235');
        assert.strictEqual(mutations!.length, 2);
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
        assert.strictEqual(mutations!.length, 4);
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
        assert.strictEqual(mutations!.length, 5);
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
        assert.strictEqual(mutations!.length, 1); // 1x add
      });
    });
  });
});
