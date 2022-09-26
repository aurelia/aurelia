import { batch } from '@aurelia/runtime';
import { Aurelia, Controller, CustomElement } from '@aurelia/runtime-html';
import { TestContext, assert } from "@aurelia/testing";

describe("repeat.keyed", function () {
  function createFixture() {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement("div");
    return { au, host, w: ctx.wnd };
  }

  class Item {
    constructor(
      public k: string,
    ) {}
  }

  it("non-keyed - simple replacement", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    const $$4 = new Item('4');
    items.splice(4, 1, $$4);
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '01234');
    assert.strictEqual(mutations!.length, 2);

    await au.stop();

    au.dispose();
  });

  it("non-keyed - simple move", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    batch(() => {
      items.splice(4, 1, $0);
      items.splice(0, 1, $4);
    });
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '41230');
    assert.strictEqual(mutations!.length, 4);

    await au.stop();

    au.dispose();
  });

  it("keyed - simple replacement (same key, same pos)", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    const $$4 = new Item('4');
    items.splice(4, 1, $$4);
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '01234');
    assert.strictEqual(mutations, null);

    await au.stop();

    au.dispose();
  });

  it("keyed - simple move (same key)", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    batch(() => {
      items.splice(4, 1, $0);
      items.splice(0, 1, $4);
    });
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '41230');
    assert.strictEqual(mutations!.length, 4);

    await au.stop();

    au.dispose();
  });

  it("keyed - simple mutation (different key)", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    const $5 = new Item('5');
    items.splice(4, 1, $5);
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '01235');
    assert.strictEqual(mutations!.length, 2);

    await au.stop();

    au.dispose();
  });

  it("index assignment - same items", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    items[1] = $3;
    items[3] = $1;
    const $5 = new Item('5');
    items.push($5);
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '032145');
    assert.strictEqual(mutations!.length, 5);

    await au.stop();

    au.dispose();
  });

  it("index assignment - new items with same key", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    items[0] = new Item('0');
    items[1] = new Item('1');
    items[2] = new Item('2');
    items[3] = new Item('3');
    items[4] = new Item('4');
    const $$5 = new Item('5');
    items.push($$5);
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '012345');
    assert.strictEqual(mutations!.length, 1); // 1x add

    await au.stop();

    au.dispose();
  });

  it("array replacement - same items, no moves", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    component.items = [$0, $1, $2, $3, $4];
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '01234');
    assert.strictEqual(mutations, null);

    await au.stop();

    au.dispose();
  });

  it("array replacement - same items, 2 moves", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    component.items = [$4, $1, $2, $3, $0];
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '41230');
    assert.strictEqual(mutations!.length, 4); // 2x move

    await au.stop();

    au.dispose();
  });

  it("array replacement - new items with same key, no moves", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    component.items = [
      new Item('0'),
      new Item('1'),
      new Item('2'),
      new Item('3'),
      new Item('4'),
    ];
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '01234');
    assert.strictEqual(mutations, null);

    await au.stop();

    au.dispose();
  });

  it("array replacement - new items with same key, 2 moves", async function () {
    const { au, host, w } = createFixture();
    const $0 = new Item('0');
    const $1 = new Item('1');
    const $2 = new Item('2');
    const $3 = new Item('3');
    const $4 = new Item('4');
    const items = [$0, $1, $2, $3, $4];

    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items" key="k">\${i.k}</div>`
      },
      class {
        items = items;
      }
    );

    let mutations: MutationRecord[] | null = null;
    const obs = new w.MutationObserver(_mutations => mutations = _mutations);

    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '01234');

    obs.observe(host, { childList: true });
    component.items = [
      new Item('0'),
      new Item('3'),
      new Item('2'),
      new Item('1'),
      new Item('4'),
    ];
    await Promise.resolve();
    obs.disconnect();

    assert.strictEqual(host.textContent, '03214');
    assert.strictEqual(mutations!.length, 4);

    await au.stop();

    au.dispose();
  });
});
