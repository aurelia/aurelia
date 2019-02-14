import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { expect } from 'chai';
import { TestContext } from '../util';

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

      const App = CustomElementResource.define({ name: 'app', template: `<template><foo>${appMarkup}</foo></template>` }, class {});
      const Foo = CustomElementResource.define({ name: 'foo', template: `<template>${ceMarkup}</template>` }, class {});

      const ctx = TestContext.createHTMLTestContext();
      ctx.container.register(Foo);
      const au = new Aurelia(ctx.container);

      const host = ctx.createElement('div');
      const component = new App();

      au.app({ host, component });

      au.start();

      expect(host.textContent).to.equal(expected);

    });
  }

  it(`replaceable - bind to target scope`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><div replace-part="bar">\${baz}</div></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><div replaceable part="bar"></div></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable - bind to parent scope`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><div replace-part="bar">\${baz}</div></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><div replaceable part="bar"></div></template>` }, class {});

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('def');

  });

  it(`replaceable/template - bind to target scope`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><template replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable/template - bind to parent scope`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><template replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class {});

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('def');

  });

  it(`replaceable/template - uses last on name conflict`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><template replace-part="bar">\${qux}</template><template replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class {});

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('def');

  });

  it(`replaceable/template - same part multiple times`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><template replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><template replaceable part="bar"></template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abcabc');

  });

  // TODO: fix this scenario
  xit(`replaceable/template - parent template controller`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><template if.bind="true"><template replace-part="bar">\${baz}</template></template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable/template - sibling lefthand side template controller`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><template if.bind="true" replace-part="bar">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable/template - sibling righthand side template controller`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><template replace-part="bar" if.bind="true">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable/template - sibling if/else with conflicting part names`, function () {

    const App = CustomElementResource.define({ name: 'app', template: `<template><foo><template replace-part="bar" if.bind="true">\${baz}</template></foo><foo><template replace-part="bar" if.bind="false">\${baz}</template></foo></template>` }, class { public baz = 'def'; });
    const Foo = CustomElementResource.define({ name: 'foo', template: `<template><template replaceable part="bar"></template></template>` }, class { public baz = 'abc'; });

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  describe('Difficult cases', function() {
    describe('with multiple nested replaceable from 1 -> 10 levels', function() {
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
        let i = 0;
        while (level > i) {
          content += i === level - 1 ? `replaceable-p-${i}` : 'replace-part-p';
          ++i;
        }
        return content;
      };

      for (let i = 1; 11 > i; ++i) {
        it(`works with replaceable on normal <div/> with. Nesting level: ${i}`, function() {
          const App = CustomElementResource.define(
            { name: 'app', template: `<template><foo><template replace-part="p-${i}"><span>replace-part-p</span><template></foo></template>` },
            class App {}
          );
          const Foo = CustomElementResource.define(
            { name: 'foo', template: `<template>${createReplaceableDiv(i)}</template>` },
            class Foo {}
          );

          const ctx = TestContext.createHTMLTestContext();
          ctx.container.register(Foo);
          const au = new Aurelia(ctx.container);

          const host = ctx.createElement('div');
          const component = new App();

          au.app({ host, component });

          au.start();

          expect(host.textContent, 'host.textContent').to.equal(buildExpectedTextContent(i));
          tearDown(au);
        });
      }
    });

    describe('with multiple replaceables + all no nested replaceable + From 1 -> 10 siblings', function() {
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
        it(`works with replaceable on normal <div/>. Siblings count: ${i}`, function() {
          const App = CustomElementResource.define(
            { name: 'app', template:
              `<template><foo>${buildReplacementTemplate(i)}</foo></template>`
            },
            class App {}
          );
          const Foo = CustomElementResource.define(
            { name: 'foo', template: `<template>${buildReplaceableDiv(i)}</template>` },
            class Foo {}
          );
          
          const ctx = TestContext.createHTMLTestContext();
          ctx.container.register(Foo);
          const au = new Aurelia(ctx.container);

          const host = ctx.createElement('div');
          const component = new App();

          au.app({ host, component });
          au.start();

          expect(host.textContent, `[i=${i}]host.textContent`).to.equal(`replace-part-p`.repeat(i));
          tearDown(au);
        });
      }
    });

    describe('with multiple replaceables + with nested replaceables + from 1 -> 10 siblings + from 1 -> nesting levels', function() {
      // in this part, we will test replacing a replaceable somewhere between 1 -> 10 levels of nesting replaceable
      // with only 1 replacement
      const maxReplaceableSiblingCount = 10;
      const maxDepth = 10;
      const buildNestedReplaceableDiv = (baseSiblingIndex: number, nestedDepth: number) => {
        let template = '';
        let currentBaseLevel = 0;
        while (baseSiblingIndex > currentBaseLevel) {
          let currentDepth = 0;
          let $template = `<div replaceable part="p-${currentBaseLevel}-0">replaceable-p-${currentBaseLevel}-0`;
          while (nestedDepth > currentDepth) {
            $template += `<div replaceable part="p-${currentBaseLevel}-${currentDepth}">replaceable-p-${currentBaseLevel}-${currentDepth}`;
            ++currentDepth;
          }
          while (currentDepth > 0) {
            $template += '</div>';
            --currentDepth;
          }
          $template += '<div>';
          template += $template;
          ++currentBaseLevel;
        }
        return template;
      };
      const buildNestedReplacementTemplate = (baseSiblingIndex: number, nestedDepth: number) => {
        return `<template replace-part="p-${baseSiblingIndex}-${nestedDepth}">replace-part-p${baseSiblingIndex}-${nestedDepth}</template>`;
      };
      const buildExpectedTextContent = (baseSiblingIndex: number, nestedDepth: number) => {
        let currentBaseIndex = 0;
        let finalTextContent = '';
        while (maxReplaceableSiblingCount > currentBaseIndex) {
          if (baseSiblingIndex > currentBaseIndex) {
            let i = 0;
            while (maxDepth > i) {
              finalTextContent += `replaceable-p-${currentBaseIndex}-${i}`;
              ++i;
            }
          } else if (baseSiblingIndex === currentBaseIndex) {
            let currentDepth = 0;
            /**
             * <template replaceable>
             *   <template replaceable>
             *      <template replaceable>  <----- replacement here won't affect any level above it
             *        <template>            <--x-- but will terminate all replacement after it
             */
            while (nestedDepth > currentDepth) {
              finalTextContent += `replaceable-p-${currentBaseIndex}-${currentDepth}`;
            }
            finalTextContent += `replace-part-p-${currentBaseIndex}-${nestedDepth}`;
          } else {
            let i = 0;
            while (maxDepth > i) {
              finalTextContent += `replaceable-p-${currentBaseIndex}-${i}`;
              ++i;
            }
          }
          ++currentBaseIndex;
        }
        return finalTextContent;
      };

      for (let baseReplaceableCount = 0; 10 > baseReplaceableCount; ++baseReplaceableCount) {
        for (let nestedDepth = 0; 10 > nestedDepth; ++nestedDepth) {
          it(`works with replaceable on normal <div/>. Siblings count: ${baseReplaceableCount}`, function() {
            const App = CustomElementResource.define(
              { name: 'app', template:
                `<template><foo>${buildNestedReplacementTemplate(baseReplaceableCount, nestedDepth)}</foo></template>`
              },
              class App {}
            );
            const Foo = CustomElementResource.define(
              { name: 'foo', template: `<template>${buildNestedReplaceableDiv(baseReplaceableCount, nestedDepth)}</template>` },
              class Foo {}
            );

            const ctx = TestContext.createHTMLTestContext();
            ctx.container.register(Foo);
            const au = new Aurelia(ctx.container);

            const host = ctx.createElement('div');
            const component = new App();

            au.app({ host, component });
            au.start();

            expect(
              host.textContent,
              `[base=${baseReplaceableCount}, depth=${nestedDepth}]host.textContent`
            ).to.equal(buildExpectedTextContent(baseReplaceableCount, nestedDepth));
            tearDown(au);
          });
        }
      }
    });
  });

  interface ITestItem {
    idx: number;
    name: string;
  }

  function tearDown(au: Aurelia) {
    au.stop();
    (au.root().$host as Element).remove();
  }

  function createItems(count: number, baseName: string = 'item') {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `${baseName}-${idx}` }
    });
  }
});
