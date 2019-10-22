import { Tracer } from '@aurelia/kernel';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { stringifyTemplateDefinition } from '@aurelia/jit-html';
import { disableTracing, enableTracing, getVisibleText, TestContext, assert } from '@aurelia/testing';

describe.skip('tracing', function () {
  function setup() {
    enableTracing();
    Tracer.enableLiveLogging();
    const ctx = TestContext.createHTMLTestContext();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');
    return { au, host };
  }
  function verify(au, host, expected, description) {
    au.start();
    const outerHtmlAfterStart1 = host.outerHTML;
    assert.strictEqual(getVisibleText(au, host), expected, 'after start #1');
    au.stop();
    const outerHtmlAfterStop1 = host.outerHTML;
    assert.strictEqual(getVisibleText(au, host), '', 'after stop #1');
    au.start();
    const outerHtmlAfterStart2 = host.outerHTML;
    assert.strictEqual(getVisibleText(au, host), expected, 'after start #2');
    au.stop();
    const outerHtmlAfterStop2 = host.outerHTML;
    assert.strictEqual(getVisibleText(au, host), '', 'after stop #2');
    assert.strictEqual(outerHtmlAfterStart1, outerHtmlAfterStart2, 'outerHTML after start #1 / #2');
    assert.strictEqual(outerHtmlAfterStop1, outerHtmlAfterStop2, 'outerHTML after stop #1 / #2');

    console.log(`\n${stringifyTemplateDefinition(description, 0)}`);
    disableTracing();
  }
  it('tag$01 text$01 _', function () {
    const { au, host } = setup();
    const App = CustomElement.define({ name: 'app', template: '<template><div>a</div></template>' }, class {
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$01 text$03 _', function () {
    const { au, host } = setup();
    const App = CustomElement.define({ name: 'app', template: `<template><div>\${msg}</div></template>` }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$02 text$01 _', function () {
    const { au, host } = setup();
    const App = CustomElement.define({ name: 'app', template: '<template>a</template>' }, class {
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$02 text$03 _', function () {
    const { au, host } = setup();
    const App = CustomElement.define({ name: 'app', template: `<template>\${msg}</template>` }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$03 text$03 _', function () {
    const { au, host } = setup();
    const MyFoo = CustomElement.define({ name: 'my-foo', template: `<template>\${msg}</template>` }, class {
      public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
      public msg = '';
      public not = '';
      public item = '';
    });
    au.register(MyFoo);
    const App = CustomElement.define({ name: 'app', template: '<template><my-foo msg.bind="msg"></my-foo></template>' }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$04 text$03 _', function () {
    const { au, host } = setup();
    const MyFoo = CustomElement.define({ name: 'my-foo', template: '<template><template replaceable="part1"></template><template replaceable="part2"></template></template>' }, class {
      public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
      public msg = '';
      public not = '';
      public item = '';
    });
    au.register(MyFoo);
    const App = CustomElement.define({ name: 'app', template: `<template><my-foo msg.bind="msg"><template replace="part1">\${msg}</template></my-foo></template>` }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$05 text$03 _', function () {
    const { au, host } = setup();
    const MyFoo = CustomElement.define({ name: 'my-foo', template: `<template>\${msg}</template>` }, class {
      public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
      public static containerless = true;
      public msg = '';
      public not = '';
      public item = '';
    });
    au.register(MyFoo);
    const App = CustomElement.define({ name: 'app', template: '<template><my-foo msg.bind="msg"></my-foo></template>' }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$06 text$03 _', function () {
    const { au, host } = setup();
    const MyFoo = CustomElement.define({ name: 'my-foo', template: '<template><template replaceable="part1"></template><template replaceable="part2"></template></template>' }, class {
      public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
      public static containerless = true;
      public msg = '';
      public not = '';
      public item = '';
    });
    au.register(MyFoo);
    const App = CustomElement.define({ name: 'app', template: `<template><my-foo msg.bind="msg"><template replace="part1">\${msg}</template></my-foo></template>` }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$07 text$03 _', function () {
    const { au, host } = setup();
    const MyFoo = CustomElement.define({ name: 'my-foo', template: `<template>\${msg}</template>` }, class {
      public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
      public static shadowOptions = { mode: 'open' };
      public msg = '';
      public not = '';
      public item = '';
    });
    au.register(MyFoo);
    const App = CustomElement.define({ name: 'app', template: '<template><my-foo msg.bind="msg"></my-foo></template>' }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$08 text$03 _', function () {
    const { au, host } = setup();
    const MyFoo = CustomElement.define({ name: 'my-foo', template: '<template><template replaceable="part1"></template><template replaceable="part2"></template></template>' }, class {
      public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
      public static shadowOptions = { mode: 'open' };
      public msg = '';
      public not = '';
      public item = '';
    });
    au.register(MyFoo);
    const App = CustomElement.define({ name: 'app', template: `<template><my-foo msg.bind="msg"><template replace="part1">\${msg}</template></my-foo></template>` }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$09 text$03 _', function () {
    const { au, host } = setup();
    const MyFoo = CustomElement.define({ name: 'my-foo', template: `<template>\${msg}</template>` }, class {
      public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
      public static shadowOptions = { mode: 'closed' };
      public msg = '';
      public not = '';
      public item = '';
    });
    au.register(MyFoo);
    const App = CustomElement.define({ name: 'app', template: '<template><my-foo msg.bind="msg"></my-foo></template>' }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
  it('tag$10 text$03 _', function () {
    const { au, host } = setup();
    const MyFoo = CustomElement.define({ name: 'my-foo', template: '<template><template replaceable="part1"></template><template replaceable="part2"></template></template>' }, class {
      public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
      public static shadowOptions = { mode: 'closed' };
      public msg = '';
      public not = '';
      public item = '';
    });
    au.register(MyFoo);
    const App = CustomElement.define({ name: 'app', template: `<template><my-foo msg.bind="msg"><template replace="part1">\${msg}</template></my-foo></template>` }, class {
      public msg = 'a';
    });
    const component = new App();
    au.app({ host, component });
    verify(au, host, 'a', CustomElement.getDefinition(App));
  });
});
