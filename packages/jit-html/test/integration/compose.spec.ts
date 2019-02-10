import { IContainer } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElementResource,
  IDOM,
  ILifecycle,
  IObserverLocator,
  IRenderingEngine,
  LifecycleFlags } from '@aurelia/runtime';
import { RenderPlan } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { eachCartesianJoin } from '../unit/util';
import { TestContext } from '../util';
import { trimFull } from './util';

const build = { required: true, compiler: 'default' };
const spec = 'compose';

describe(spec, function () {
  function setup(): SpecContext {
    const ctx = TestContext.createHTMLTestContext();
    const { container, dom, lifecycle, observerLocator, renderingEngine: re } = ctx;
    const au = new Aurelia(container);
    const host = dom.createElement('div');

    return { container, dom, au, host, lifecycle, re, observerLocator };
  }

  interface SpecContext {
    container: IContainer;
    dom: IDOM;
    au: Aurelia;
    host: HTMLElement;
    lifecycle: ILifecycle;
    re: IRenderingEngine;
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
      createSubject: () => ({ template: `<template>Hello!</template>`, build }),
      expectedText: 'Hello!'
    },
    {
      t: '2',
      createSubject: () => Promise.resolve({ template: `<template>Hello!</template>`, build }),
      expectedText: 'Hello!'
    },
    {
      t: '3',
      createSubject: () => Promise.resolve().then(() => {
        return new Promise(resolve => {
          setTimeout(() => { resolve({ template: `<template>Hello!</template>`, build }); }, 50);
        });
      }),
      expectedText: 'Hello!'
    },
    {
      t: '4',
      // @ts-ignore
      createSubject: ctx => ctx.re.getViewFactory(ctx.dom, { name: 'cmp', template: `<template>Hello!</template>`, build }, ctx.container),
      expectedText: 'Hello!'
    },
    {
      t: '5',
      // @ts-ignore
      createSubject: ctx => ctx.re.getViewFactory(ctx.dom, {  name: 'cmp', template: `<template>Hello!</template>`, build }, ctx.container).create(),
      expectedText: 'Hello!'
    },
    {
      t: '6',
      createSubject: ctx => new RenderPlan(ctx.dom, `<div>Hello!</div>`, [], []),
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
      t: '23',
      template: `<template><au-compose repeat.for="i of 1 & keyed" subject.bind="sub"></au-compose></template>`
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
    {
      t: '26',
      template: `<template><au-compose if.bind="true" repeat.for="i of 1 & keyed" subject.bind="sub"></au-compose></template>`
    },
    {
      t: '27',
      template: `<template><au-compose if.bind="true" repeat.for="i of 1 & keyed" subject.bind="sub"></au-compose></template>`
    },
    {
      t: '28',
      template: `<template><au-compose subject.bind="sub" if.bind="true" repeat.for="i of 1 & keyed"></au-compose></template>`
    },
    {
      t: '29',
      template: `<template><au-compose if.bind="true" subject.bind="sub" repeat.for="i of 1 & keyed"></au-compose></template>`
    },
  ];

  eachCartesianJoin([subjectSpecs, templateSpecs], (subjectSpec, templateSpec) => {
    const { createSubject, expectedText } = subjectSpec;
    const { template } = templateSpec;

    it(`verify au-compose behavior - subjectSpec ${subjectSpec.t}, templateSpec ${templateSpec.t}`, async function () {
      const ctx = setup();
      const subject = createSubject(ctx);
      const { au, host, lifecycle } = ctx;

      class App { public sub: any = null; }
      CustomElementResource.define({ name: 'app', template }, App);
      const component = new App();
      component.sub = subject;
      au.app({ host, component }).start();
      lifecycle.processFlushQueue(LifecycleFlags.none);
      if (subject instanceof Promise) {
        expect(trimFull(host.textContent)).to.equal('');
        await subject;
        expect(trimFull(host.textContent)).to.equal(expectedText);
      } else {
        expect(trimFull(host.textContent)).to.equal(expectedText);
      }
    });
  });
});
