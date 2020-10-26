import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import {
  eachCartesianJoin,
  TestContext,
  TestConfiguration,
  assert,
} from '@aurelia/testing';

const spec = 'repeater';

describe(spec, function () {
  interface Spec {
    t: string;
  }
  interface BindSpec extends Spec {
    forof: string;
    item: string;
    expected: string;
    initialize(component: unknown): void;
  }
  interface TemplateSpec extends Spec {
    createTemplate(forof: string, item: string): string;
  }

  const bindSpecs: BindSpec[] = [
    {
      t: '01',
      forof: `[a,b,c]`,
      item: `\${item}`,
      expected: `123`,
      initialize(c: {a: number; b: number; c: number}) {
        c.a = 1;
        c.b = 2;
        c.c = 3;
      }
    },
    {
      t: '02',
      forof: `[c,b,a]|sort`,
      item: `\${item}`,
      expected: `123`,
      initialize(c: {a: number; b: number; c: number}) {
        c.a = 1;
        c.b = 2;
        c.c = 3;
      }
    },
    {
      t: '03',
      forof: `[1+1,2+1,3+1]`,
      item: `\${item}`,
      expected: `234`,
      initialize() { return; }
    },
    {
      t: '04',
      forof: `[1,2,3]`,
      item: `\${item}`,
      expected: `123`,
      initialize() { return; }
    },
    {
      t: '05',
      forof: `[3,2,1]|sort`,
      item: `\${item}`,
      expected: `123`,
      initialize() { return; }
    },
    {
      t: '06',
      forof: `[{i:1},{i:2},{i:3}]`,
      item: `\${item.i}`,
      expected: `123`,
      initialize() { return; }
    },
    {
      t: '07',
      forof: `[[1],[2],[3]]`,
      item: `\${item[0]}`,
      expected: `123`,
      initialize() { return; }
    },
    {
      t: '08',
      forof: `[[a],[b],[c]]`,
      item: `\${item[0]}`,
      expected: `123`,
      initialize(c: {a: number; b: number; c: number}) {
        c.a = 1;
        c.b = 2;
        c.c = 3;
      }
    },
    {
      t: '09',
      forof: `3`,
      item: `\${item}`,
      expected: `012`,
      initialize() { return; }
    },
    {
      t: '10',
      forof: `null`,
      item: `\${item}`,
      expected: ``,
      initialize() { return; }
    },
    {
      t: '11',
      forof: `undefined`,
      item: `\${item}`,
      expected: ``,
      initialize() { return; }
    },
    {
      t: '12',
      forof: `items`,
      item: `\${item}`,
      expected: `123`,
      initialize(c: {items: string[]}) {
        c.items = ['1', '2', '3'];
      }
    },
    {
      t: '13',
      forof: `items|sort`,
      item: `\${item}`,
      expected: `123`,
      initialize(c: {items: string[]}) {
        c.items = ['3', '2', '1'];
      }
    },
    {
      t: '14',
      forof: `items`,
      item: `\${item.i}`,
      expected: `123`,
      initialize(c: {items: {i: number}[]}) {
        c.items = [{i: 1}, {i: 2}, {i: 3}];
      }
    },
    {
      t: '15',
      forof: `items|sort:'i'`,
      item: `\${item.i}`,
      expected: `123`,
      initialize(c: {items: {i: number}[]}) {
        c.items = [{i: 3}, {i: 2}, {i: 1}];
      }
    },
    {
      t: '16',
      forof: `items`,
      item: `\${item}`,
      expected: `123`,
      initialize(c: {items: Set<string>}) {
        c.items = new Set(['1', '2', '3']);
      }
    },
    {
      t: '17',
      forof: `items`,
      item: `\${item[0]}\${item[1]}`,
      expected: `1a2b3c`,
      initialize(c: {items: Map<string, string>}) {
        c.items = new Map([['1', 'a'], ['2', 'b'], ['3', 'c']]);
      }
    }
  ];

  const templateSpecs: TemplateSpec[] = [
    {
      t: '01',
      createTemplate(items, tpl) {
        return `<template><div repeat.for="item of ${items}">${tpl}</div></template>`;
      }
    },
    {
      t: '02',
      createTemplate(items, tpl) {
        return `<template><div repeat.for="item of ${items}" if.bind="true">${tpl}</div></template>`;
      }
    },
    {
      t: '03',
      createTemplate(items, tpl) {
        return `<template><div if.bind="true" repeat.for="item of ${items}">${tpl}</div></template>`;
      }
    },
    {
      t: '04',
      createTemplate(items, tpl) {
        return `<template><div if.bind="false"></div><div else repeat.for="item of ${items}">${tpl}</div></template>`;
      }
    },
    {
      t: '05',
      createTemplate(items, tpl) {
        return `<template><template repeat.for="item of ${items}">${tpl}</template></template>`;
      }
    },
    {
      t: '06',
      createTemplate(items, tpl) {
        return `<template><template repeat.for="item of ${items}"><div if.bind="true">${tpl}</div></template></template>`;
      }
    },
    {
      t: '07',
      createTemplate(items, tpl) {
        return `<template><template repeat.for="item of ${items}"><div if.bind="false"></div><div else>${tpl}</div></template></template>`;
      }
    },
  ];

  eachCartesianJoin([bindSpecs, templateSpecs], (bindSpec, templateSpec) => {
    it(`bindSpec ${bindSpec.t}, templateSpec ${templateSpec.t}`, async function () {
      const { forof, item, expected, initialize } = bindSpec;
      const { createTemplate } = templateSpec;

      const ctx = TestContext.create();
      const { container } = ctx;
      container.register(TestConfiguration);

      const markup = createTemplate(forof, item);
      const App = CustomElement.define({ name: 'app', template: markup }, class {});

      const host = ctx.createElement('div');
      const component = new App();
      initialize(component);

      const au = new Aurelia(container);
      au.app({ host, component });
      await au.start();

      assert.strictEqual(host.textContent, expected, 'host.textContent');

      await au.stop();

      assert.strictEqual(host.textContent, '', 'host.textContent');

      au.dispose();
      });
  });
});
