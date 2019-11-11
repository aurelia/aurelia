/* eslint-disable quotes, @typescript-eslint/explicit-member-accessibility */
import { Aurelia, CustomElement } from "@aurelia/runtime";
import { TestContext, assert } from "@aurelia/testing";

describe("generated.template-compiler.repeat", function () {
  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement("div");
    return { au, host };
  }
  it("10 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [1, 0];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '10');
    component.items.sort();
    assert.strictEqual(host.textContent, '01');
  });
  it("01 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [0, 1];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '01');
    component.items.sort();
    assert.strictEqual(host.textContent, '01');
  });

  it("012 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [0, 1, 2];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '012');
    component.items.sort();
    assert.strictEqual(host.textContent, '012');
  });
  it("021 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [0, 2, 1];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '021');
    component.items.sort();
    assert.strictEqual(host.textContent, '012');
  });
  it("102 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [1, 0, 2];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '102');
    component.items.sort();
    assert.strictEqual(host.textContent, '012');
  });
  it("120 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [1, 2, 0];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '120');
    component.items.sort();
    assert.strictEqual(host.textContent, '012');
  });
  it("201 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [2, 0, 1];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '201');
    component.items.sort();
    assert.strictEqual(host.textContent, '012');
  });
  it("210 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [2, 1, 0];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '210');
    component.items.sort();
    assert.strictEqual(host.textContent, '012');
  });

  it("0123 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [0, 1, 2, 3];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '0123');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("0132 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [0, 1, 3, 2];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '0132');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("0213 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [0, 2, 1, 3];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '0213');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("0231 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [0, 2, 3, 1];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '0231');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("0312 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [0, 3, 1, 2];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '0312');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("0321 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [0, 3, 2, 1];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '0321');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("1023 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [1, 0, 2, 3];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '1023');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("1032 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [1, 0, 3, 2];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '1032');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("1203 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [1, 2, 0, 3];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '1203');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("1230 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [1, 2, 3, 0];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '1230');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("1302 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [1, 3, 0, 2];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '1302');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("1320 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [1, 3, 2, 0];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '1320');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("2013 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [2, 0, 1, 3];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '2013');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("2031 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [2, 0, 3, 1];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '2031');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("2103 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [2, 1, 0, 3];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '2103');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("2130 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [2, 1, 3, 0];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '2130');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("2301 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [2, 3, 0, 1];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '2301');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("2310 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [2, 3, 1, 0];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '2310');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("3012 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [3, 0, 1, 2];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '3012');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("3021 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [3, 0, 2, 1];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '3021');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("3102 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [3, 1, 0, 2];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '3102');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("3120 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [3, 1, 2, 0];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '3120');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("3201 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [3, 2, 0, 1];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '3201');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
  it("3210 _", function () {
    const { au, host } = setup();
    const App = CustomElement.define(
      {
        name: "app",
        template: `<div repeat.for="i of items">\${i}</div>`
      },
      class {
        items = [3, 2, 1, 0];
      }
    );
    const component = new App();
    au.app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, '3210');
    component.items.sort();
    assert.strictEqual(host.textContent, '0123');
  });
});
