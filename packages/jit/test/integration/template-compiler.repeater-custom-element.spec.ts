import { customElement, bindable, CustomElementResource, DOM, Aurelia, Lifecycle } from '../../../runtime/src/index';;
import { setupAndStart, tearDown, setup } from "./prepare";
import { expect } from "chai";
import { BasicConfiguration } from '../../src';
import { LifecycleFlags } from '../../../runtime/src/index';


const spec = 'template-compiler.repeater-custom-element';


describe('', () => {
  // repeater with custom element
  it('03.', () => {
    @customElement({ name: 'foo', template: '<template>a</template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { }
    const { au, lifecycle, host, component } = setupAndStart(`<template><foo repeat.for="i of count"></foo></template>`, null, Foo);
    component.count = 3;
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('aaa');

    tearDown(au, lifecycle, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with different name than outer property
  it('04.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, lifecycle, host, component } = setupAndStart(`<template><foo text.bind="theText" repeat.for="i of count"></foo></template>`, null, Foo);
    component.count = 3;
    component.theText = 'a';
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('aaa');

    tearDown(au, lifecycle, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with same name as outer property
  it('05.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, lifecycle, host, component } = setupAndStart(`<template><foo text.bind="text" repeat.for="i of count"></foo></template>`, null, Foo);
    component.count = 3;
    component.text = 'a';
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('aaa');

    tearDown(au, lifecycle, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with different name than outer property, reversed, undefined property
  it('06.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, lifecycle, host, component } = setupAndStart(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);

    component.count = 3;
    component.theText = 'a';
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('undefinedundefinedundefined');

    tearDown(au, lifecycle, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with same name as outer property, reversed, undefined property
  it('07.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, lifecycle, host, component } = setupAndStart(`<template><foo repeat.for="i of count" text.bind="text"></foo></template>`, null, Foo);
    component.count = 3;
    component.text = 'a';
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('undefinedundefinedundefined');

    tearDown(au, lifecycle, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with different name than outer property, reversed
  it('08.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text; }
    const { au, lifecycle, host, component } = setup(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);
    component.theText = 'a';
    component.count = 3;

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('aaa');

    tearDown(au, lifecycle, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with same name as outer property, reversed
  it('09.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text; }
    const { au, lifecycle, host, component } = setup(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);
    component.theText = 'a';
    component.count = 3;

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('aaa');

    tearDown(au, lifecycle, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element with repeater
  it('10.', () => {
    @customElement({ name: 'foo', template: '<template><div repeat.for="item of todos">${item}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable todos: any[] }
    const { au, lifecycle, host, component } = setup(`<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, null, Foo);
    component.todos = ['a', 'b', 'c']
    component.count = 3;

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('abcabcabc');

    component.count = 1;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('abc');

    component.count = 3;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('abcabcabc');

    tearDown(au, lifecycle, host);
  });

  // repeater with custom element with repeater, nested arrays
  it('11.', () => {
    @customElement({ name: 'foo', template: '<template><div repeat.for="innerTodos of todos"><div repeat.for="item of innerTodos">${item}</div></div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable todos: any[] }
    const { au, lifecycle, host, component } = setup(`<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, null, Foo);
    component.todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']]
    component.count = 3;

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('abcabcabcabcabcabcabcabcabc');

    component.count = 1;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('abcabcabc');

    component.count = 3;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('abcabcabcabcabcabcabcabcabc');

    tearDown(au, lifecycle, host);
  });

  // repeater with custom element and children observer
  it('12.', async () => {
    let childrenCount = 0;
    let childrenChangedCount = 0;
    const FooEl = CustomElementResource.define({
      name: 'foo-el',
      template: `<template>\${txt}<foo-el if.bind="cur<max" cnt.bind="cnt" max.bind="max" cur.bind="cur+1" txt.bind="txt" repeat.for="i of cnt"></foo-el></template>`
    }, class {
      static shadowOptions = { mode: 'open' };
      static bindables = {
        cnt: { property: 'cnt', attribute: 'cnt' },
        max: { property: 'max', attribute: 'max' },
        cur: { property: 'cur', attribute: 'cur' },
        txt: { property: 'txt', attribute: 'txt' }
      }
      $children;
      attached() {
        childrenCount += this.$children.length;
      }
      $childrenChanged() {
        childrenChangedCount++;
      }
    });
    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><foo-el cnt.bind="cnt" max.bind="max" cur="0" txt.bind="txt" repeat.for="i of cnt" ref.bind="'foo'+i"></foo-el></template>`
    }, class {
      static shadowOptions = { mode: 'open' };
      cnt = 10;
      max = 3;
      txt = 'a';
      $children;
    });
    const host = DOM.createElement('div');
    const au = new Aurelia();
    au.register(BasicConfiguration);
    au.register(FooEl);
    const component = new App();
    au.app({ host, component });

    au.start();

    expect(host.textContent.length).to.equal(1110);
    expect(host.textContent).to.equal('a'.repeat(1110));

    expect(childrenChangedCount).to.equal(0);

    expect(childrenCount).to.equal(1100);
    expect(component.$children.length).to.equal(10);

    component.cnt = 11;

    await Promise.resolve();

    expect(component.$children.length).to.equal(11);
    expect(childrenChangedCount).to.equal(110);
    expect(childrenCount).to.equal(1100 + 110*2 + 11*2);

    au.stop();
    expect(host.textContent).to.equal('');
  });

})
