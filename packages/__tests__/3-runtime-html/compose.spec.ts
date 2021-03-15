import { IContainer } from '@aurelia/kernel';
import {
  CustomElement,
  IObserverLocator,
  view,
  customElement,
  getRenderContext,
  Aurelia,
  RenderPlan,
  IPlatform,
} from '@aurelia/runtime-html';
import {
  eachCartesianJoin,
  TestContext,
  trimFull,
  assert,
} from '@aurelia/testing';

const spec = 'compose';

describe(spec, function () {
  function createFixture(): SpecContext {
    const ctx = TestContext.create();
    const { container, platform, observerLocator } = ctx;
    const au = new Aurelia(container);
    const host = platform.document.createElement('div');

    return { container, platform, au, host, observerLocator };
  }

  interface SpecContext {
    container: IContainer;
    platform: IPlatform;
    au: Aurelia;
    host: HTMLElement;
    observerLocator: IObserverLocator;
  }
  interface Spec {
    t: string;
  }
  interface SubjectSpec extends Spec {
    expectedText: string;
    createSubject(ctx: SpecContext): any;
  }
  interface TemplateSpec extends Spec {
    template: string;
  }

  const subjectSpecs: SubjectSpec[] = [
    {
      t: '1',
      createSubject: () => ({ template: `<template>Hello!</template>` }),
      expectedText: 'Hello!'
    },
    {
      t: '2',
      createSubject: () => Promise.resolve({ template: `<template>Hello!</template>` }),
      expectedText: 'Hello!'
    },
    {
      t: '3',
      createSubject: () => Promise.resolve().then(() => {
        return new Promise(resolve => {
          setTimeout(() => { resolve({ template: `<template>Hello!</template>` }); }, 50);
        });
      }),
      expectedText: 'Hello!'
    },
    {
      t: '4',
      createSubject: ctx => getRenderContext({ name: 'cmp', template: `<template>Hello!</template>` }, ctx.container).getViewFactory(),
      expectedText: 'Hello!'
    },
    // {
    //   t: '5',
    //   createSubject: ctx => getRenderContext({ name: 'cmp', template: `<template>Hello!</template>` }, ctx.container).getViewFactory().create(),
    //   expectedText: 'Hello!'
    // },
    {
      t: '6',
      createSubject: ctx => new RenderPlan(`<div>Hello!</div>` as any, [], []),
      expectedText: 'Hello!'
    }
  ];

  const templateSpecs: TemplateSpec[] = [
    {
      t: '1',
      template: `<template><au-compose subject.bind="sub"></au-compose></template>`
    },
    {
      t: '2',
      template: `<template><template as-element="au-compose" subject.bind="sub"></template></template>`
    },
    {
      t: '13',
      template: `<template><au-compose repeat.for="i of 1" subject.bind="sub"></au-compose></template>`
    },
    {
      t: '4',
      template: `<template><au-compose if.bind="true" subject.bind="sub"></au-compose></template>`
    },
    {
      t: '5',
      template: `<template><div if.bind="false"></div><au-compose else subject.bind="sub"></au-compose></template>`
    },
    {
      t: '16',
      template: `<template><au-compose if.bind="true" repeat.for="i of 1" subject.bind="sub"></au-compose></template>`
    },
    {
      t: '17',
      template: `<template><au-compose if.bind="true" repeat.for="i of 1" subject.bind="sub"></au-compose></template>`
    },
    {
      t: '18',
      template: `<template><au-compose subject.bind="sub" if.bind="true" repeat.for="i of 1"></au-compose></template>`
    },
    {
      t: '19',
      template: `<template><au-compose if.bind="true" subject.bind="sub" repeat.for="i of 1"></au-compose></template>`
    },
  ];

  eachCartesianJoin([subjectSpecs, templateSpecs], (subjectSpec, templateSpec) => {
    const { createSubject, expectedText } = subjectSpec;
    const { template } = templateSpec;

    it(`verify au-compose behavior - subjectSpec ${subjectSpec.t}, templateSpec ${templateSpec.t}`, async function () {
      const ctx = createFixture();
      const subject = createSubject(ctx);
      const { au, host } = ctx;

      class App { public sub: any = null; }
      CustomElement.define({ name: 'app', template }, App);
      const component = new App();
      component.sub = subject;
      const task = au.app({ host, component }).start();
      if (subject instanceof Promise) {
        assert.strictEqual(trimFull(host.textContent), '', `host.textContent #1`);
        await task;
        assert.strictEqual(trimFull(host.textContent), expectedText, `host.textContent #2`);
      } else {
        assert.strictEqual(trimFull(host.textContent), expectedText, `host.textContent #3`);
      }
      await au.stop();
    });
  });

  describe('With the ViewLocator value converter', function () {
    it('can compose a vanilla JS class instance', async function () {
      const { au, host } = createFixture();

      @view({ name: 'default-view', template: `\${message}` })
      class MyModel {
        public message = 'Hello world!';
      }

      @customElement({ name: 'app', template: '<au-compose subject.bind="model | view"></au-compose>' })
      class App {
        public model = new MyModel();
      }

      au.app({ host, component: App });
      await au.start();

      assert.visibleTextEqual(host, 'Hello world!');

      await au.stop();

      au.dispose();
    });
  });
});
