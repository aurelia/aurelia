import { Aurelia, CustomElement } from '@aurelia/runtime-html';
import { TestContext, assert } from "@aurelia/testing";

describe("arrow-fn", function () {
  function createFixture() {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement("div");
    return { au, host };
  }

  it("can sort number array", async function () {
    const { au, host } = createFixture();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items.sort((a, b) => a - b)">\${i}</div>`
      },
      class {
        items = [5, 7, 1, 3, 2, 8, 4, 6];
      }
    );
    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '12345678');
    await au.stop();

    au.dispose();
  });

  it.skip("can reactively sort number array", async function () {
    const { au, host } = createFixture();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items.sort((a, b) => a - b)">\${i}</div>`
      },
      class {
        items = [5, 7, 1, 3, 2, 8, 4, 6];
      }
    );
    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '12345678');
    component.items.push(0);
    assert.strictEqual(host.textContent, '012345678');
    await au.stop();

    au.dispose();
  });

  it("can reduce number array", async function () {
    const { au, host } = createFixture();
    const App = CustomElement.define(
      {
        name: "app",
        template: `\${items.reduce((sum, x) => sum + x, 0)}`
      },
      class {
        items = [5, 7, 1, 3, 2, 8, 4, 6];
      }
    );
    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '36');
    await au.stop();

    au.dispose();
  });

  it.skip("can reactively reduce number array", async function () {
    const { au, host } = createFixture();
    const App = CustomElement.define(
      {
        name: "app",
        template: `\${items.reduce((sum, x) => sum + x, 0)}`
      },
      class {
        items = [5, 7, 1, 3, 2, 8, 4, 6];
      }
    );
    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '36');
    component.items.push(4);
    assert.strictEqual(host.textContent, '40');
    await au.stop();

    au.dispose();
  });

  it("can call nested arrow inline", async function () {
    const { au, host } = createFixture();
    const App = CustomElement.define(
      {
        name: "app",
        template: `\${(a => b => a + b)(1)(2)}`
      },
      class {}
    );
    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '3');
    await au.stop();

    au.dispose();
  });

  it("can call arrow inline with rest", async function () {
    const { au, host } = createFixture();
    const App = CustomElement.define(
      {
        name: "app",
        template: `\${((...args) => args[0] + args[1] + args[2])(1, 2, 3)}`
      },
      class {}
    );
    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, '6');
    await au.stop();

    au.dispose();
  });

  it("can flatMap nested fn", async function () {
    const { au, host } = createFixture();
    const App = CustomElement.define(
      {
        name: "app",
        template: `
          <div repeat.for="item of items.flatMap(x => [x].concat(x.children.flatMap(y => [y].concat(y.children))))">\${item.name}-</div>
        `.trim()
      },
      class {
        items = [
          { name: 'a1', children: [{ name: 'b1', children: [{ name: 'c1' }] }] },
          { name: 'a2', children: [{ name: 'b2', children: [{ name: 'c2' }] }] }
        ];
      }
    );
    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, 'a1-b1-c1-a2-b2-c2-');
    await au.stop();

    au.dispose();
  });

  it("can flatMap nested fn and access parent scope", async function () {
    const { au, host } = createFixture();
    const App = CustomElement.define(
      {
        name: "app",
        template: `
          <div repeat.for="item of items.flatMap(x => x.children.flatMap(y => ([x, y].concat(y.children))))">\${item.name}-</div>
        `.trim()
      },
      class {
        items = [
          { name: 'a1', children: [{ name: 'b1', children: [{ name: 'c1' }] }] },
          { name: 'a2', children: [{ name: 'b2', children: [{ name: 'c2' }] }] }
        ];
      }
    );
    const component = new App();
    au.app({ host, component });
    await au.start();
    assert.strictEqual(host.textContent, 'a1-b1-c1-a2-b2-c2-');
    await au.stop();

    au.dispose();
  });
});
