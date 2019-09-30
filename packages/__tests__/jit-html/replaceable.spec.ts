import { Aurelia, CustomElement, LifecycleFlags as LF } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('replaceable', function () {
  for (const [title, appMarkup, ceMarkup, , , , , , expected] of [
    [
      `single, static`,
      `<div replace-part="bar">43</div>`,
      `<div replaceable part="bar">42</div>`,
      null,
      null,
      null,
      null,
      '',
      `43`
    ],
    [
      `multiple, static`,
      `<div replace-part="bar">43</div>`.repeat(2),
      `<div replaceable part="bar">42</div>`.repeat(2),
      null,
      null,
      null,
      null,
      '',
      `43`.repeat(2)
    ]
  ]) {
    it(`replaceable - ${title}`, function () {

      const App = CustomElement.define({ name: 'app', template: `<template><foo>${appMarkup}</foo></template>` }, class { });
      const Foo = CustomElement.define({ name: 'foo', template: `<template>${ceMarkup}</template>` }, class { });

      const ctx = TestContext.createHTMLTestContext();
      ctx.container.register(Foo);
      const au = new Aurelia(ctx.container);

      const host = ctx.createElement('div');
      const component = new App();

      au.app({ host, component });

      au.start();

      assert.strictEqual(host.textContent, expected, `host.textContent`);

    });
  }

  it(`replaceable - bind to target scope`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><div replace-part="bar">\${baz}</div></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><div replaceable part="bar"></div></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'abc', `host.textContent`);

  });

  it(`replaceable - default bind to parent containerless template element no name short`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><div>\${baz}</div></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable></template></template>` }, class { public baz = 'abc'; });
    Foo.containerless = true;

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'def', `host.textContent`);

  });

  // TODO: run this case with more combinations
  it(`replaceable - bind to parent scope when binding inside replace-part has multiple template controllers in between`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><div replace-part="bar"><div if.bind="true" repeat.for="i of 1">\${baz}</div></div></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><div replaceable part="bar"></div></template>` }, class { });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'def', `host.textContent`);

  });

  it(`replaceable - default bind to target containerless template element short`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><template replace-part>\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable/></template>` }, class { public baz = 'abc'; });
    Foo.containerless = true;

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'abc', `host.textContent`);

  });

  it(`replaceable - default bind to parent containerless no element short template`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo>\${baz}</foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable/></template>` }, class { public baz = 'abc'; });
    Foo.containerless = true;

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'def', `host.textContent`);

  });

  it(`replaceable - default bind to parent containerless no element long template`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo>\${baz}</foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable></template></template>` }, class { public baz = 'abc'; });
    Foo.containerless = true;

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'def', `host.textContent`);

  });

  // TODO: run this case with more combinations
  it(`replaceable - bind to parent scope when binding inside replace-part has multiple template controllers in between`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><div replace-part="bar"><div if.bind="true" repeat.for="i of 1">\${baz}</div></div></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><div replaceable part="bar"></div></template>` }, class { });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'def', `host.textContent`);

  });

  // TODO: run this case with more combinations
  it(`replaceable - bind to parent scope when binding inside replace-part has an if that starts as false`, async function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><div replace-part="bar"><div if.bind="show">\${baz}</div></div></foo></template>` }, class { public baz = 'def'; public show = false; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><div replaceable part="bar"></div></template>` }, class { });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    await au.start().wait();

    assert.strictEqual(host.textContent, '', `host.textContent`);

    component.show = true;

    ctx.lifecycle.processRAFQueue(LF.none);

    assert.strictEqual(host.textContent, 'def', `host.textContent`);
  });

  it(`replaceable - bind to parent scope`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><div replace-part="bar">\${baz}</div></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><div replaceable part="bar"></div></template>` }, class { });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'def', `host.textContent`);

  });

  it(`replaceable/template - bind to target scope`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><template replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'abc', `host.textContent`);

  });

  it(`replaceable/template - bind to parent scope`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><template replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'def', `host.textContent`);

  });

  it(`replaceable/template - uses last on name conflict`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><template replace-part="bar">\${qux}</template><template replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'def', `host.textContent`);

  });

  it(`replaceable/template - same part multiple times`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><template replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable part="bar"></template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'abcabc', `host.textContent`);

  });

  // TODO: fix this scenario
  it(`replaceable/template - parent template controller`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><template if.bind="true"><template replace-part="bar">\${baz}</template></template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'abc', `host.textContent`);

  });

  it(`replaceable/template - sibling lefthand side template controller`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><template if.bind="true" replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'abc', `host.textContent`);

  });

  it(`replaceable/template - sibling righthand side template controller`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><template replace-part="bar" if.bind="true">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'abc', `host.textContent`);

  });

  it(`replaceable/template - sibling if/else with conflicting part names`, function () {

    const App = CustomElement.define({ name: 'app', template: `<template><foo><template replace-part="bar" if.bind="true">\${baz}</template></foo><foo><template replace-part="bar" if.bind="false">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElement.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'abc', `host.textContent`);

  });

  describe('Difficult cases', function () {
    describe('with multiple nested replaceable from 1 -> 10 levels', function () {
      const createReplaceableDiv = (level: number) => {
        let currentLevel = 0;
        let template = '';
        while (level > currentLevel) {
          template += `<div replaceable part="p-${currentLevel + 1}">replaceable-p-${currentLevel + 1}`;
          ++currentLevel;
        }
        while (currentLevel > 0) {
          template += '</div>';
          --currentLevel;
        }
        return template;
      };
      const buildExpectedTextContent = (level: number) => {
        if (level === 1) {
          return 'replace-part-p';
        }
        let content = '';
        let i = 1;
        while (level >= i) {
          content += i === level ? 'replace-part-p' : `replaceable-p-${i}`;
          ++i;
        }
        return content;
      };

      for (let i = 1; 11 > i; ++i) {
        it(`works with replaceable on normal <div/> with. Nesting level: ${i}`, function () {
          const App = CustomElement.define(
            { name: 'app', template: `<template><foo><template replace-part="p-${i}"><span>replace-part-p</span></template></foo></template>` },
            class App { }
          );
          const Foo = CustomElement.define(
            { name: 'foo', template: `<template>${createReplaceableDiv(i)}</template>` },
            class Foo { }
          );

          const ctx = TestContext.createHTMLTestContext();
          ctx.container.register(Foo);
          const au = new Aurelia(ctx.container);

          const host = ctx.createElement('div');
          const component = new App();

          au.app({ host, component });

          au.start();

          assert.strictEqual(host.textContent, buildExpectedTextContent(i), 'host.textContent');
          tearDown(au);
        });
      }
    });

    describe('with multiple replaceables + all no nested replaceable + From 1 -> 10 siblings', function () {
      const buildReplacementTemplate = (count: number) => {
        let template = '';
        let i = 0;
        while (count > i) {
          template += `<template replace-part="p-${i}">replace-part-p</template>`;
          ++i;
        }
        return template;
      };
      const buildReplaceableDiv = (count: number) => {
        let template = '';
        let i = 0;
        while (count > i) {
          template += `<div replaceable part="p-${i}"></div>`;
          ++i;
        }
        return template;
      };
      for (let i = 1; 11 > i; ++i) {
        it(`works with replaceable on normal <div/>. Siblings count: ${i}`, function () {
          const App = CustomElement.define(
            {
              name: 'app', template:
                `<template><foo>${buildReplacementTemplate(i)}</foo></template>`
            },
            class App { }
          );
          const Foo = CustomElement.define(
            { name: 'foo', template: `<template>${buildReplaceableDiv(i)}</template>` },
            class Foo { }
          );

          const ctx = TestContext.createHTMLTestContext();
          ctx.container.register(Foo);
          const au = new Aurelia(ctx.container);

          const host = ctx.createElement('div');
          const component = new App();

          au.app({ host, component });
          au.start();

          assert.strictEqual(host.textContent, `replace-part-p`.repeat(i), `[i=${i}]host.textContent`);
          tearDown(au);
        });
      }
    });
  });

  interface ITestItem {
    idx: number;
    name: string;
  }

  function tearDown(au: Aurelia) {
    au.stop();
    (au.root.host as Element).remove();
  }

  function createItems(count: number, baseName: string = 'item') {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `${baseName}-${idx}` };
    });
  }
});
