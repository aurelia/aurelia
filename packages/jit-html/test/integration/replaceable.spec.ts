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
});
