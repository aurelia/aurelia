import { customElement, bindable } from "@aurelia/runtime";
import { setupAndStart, tearDown, setup } from "./prepare";
import { expect } from "chai";


const spec = 'template-compiler.repeater-custom-element';


describe('', () => {
  // repeater with custom element
  it('03.', () => {
    @customElement({ name: 'foo', template: '<template>a</template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { }
    const { au, host, cs, component } = setupAndStart(`<template><foo repeat.for="i of count"></foo></template>`, null, Foo);
    component.count = 3;
    cs.flushChanges();

    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with different name than outer property
  it('04.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, host, cs, component } = setupAndStart(`<template><foo text.bind="theText" repeat.for="i of count"></foo></template>`, null, Foo);
    component.count = 3;
    component.theText = 'a';
    cs.flushChanges();

    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with same name as outer property
  it('05.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, host, cs, component } = setupAndStart(`<template><foo text.bind="text" repeat.for="i of count"></foo></template>`, null, Foo);
    component.count = 3;
    component.text = 'a';
    cs.flushChanges();

    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with different name than outer property, reversed, undefined property
  it('06.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, host, cs, component } = setupAndStart(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);

    component.count = 3;
    component.theText = 'a';
    cs.flushChanges();

    expect(host.textContent).to.equal('undefinedundefinedundefined');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with same name as outer property, reversed, undefined property
  it('07.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, host, cs, component } = setupAndStart(`<template><foo repeat.for="i of count" text.bind="text"></foo></template>`, null, Foo);
    component.count = 3;
    component.text = 'a';
    cs.flushChanges();

    expect(host.textContent).to.equal('undefinedundefinedundefined');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with different name than outer property, reversed
  it('08.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text; }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);
    component.theText = 'a';
    component.count = 3;

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with same name as outer property, reversed
  it('09.', () => {
    @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text; }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);
    component.theText = 'a';
    component.count = 3;

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element with repeater
  it('10.', () => {
    @customElement({ name: 'foo', template: '<template><div repeat.for="item of todos">${item}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable todos: any[] }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, null, Foo);
    component.todos = ['a', 'b', 'c']
    component.count = 3;

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('abcabcabc');

    component.count = 1;
    cs.flushChanges();
    expect(host.textContent).to.equal('abc');

    component.count = 3;
    cs.flushChanges();
    expect(host.textContent).to.equal('abcabcabc');

    tearDown(au, cs, host);
  });

  // repeater with custom element with repeater, nested arrays
  it('11.', () => {
    @customElement({ name: 'foo', template: '<template><div repeat.for="innerTodos of todos"><div repeat.for="item of innerTodos">${item}</div></div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable todos: any[] }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, null, Foo);
    component.todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']]
    component.count = 3;

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('abcabcabcabcabcabcabcabcabc');

    component.count = 1;
    cs.flushChanges();
    expect(host.textContent).to.equal('abcabcabc');

    component.count = 3;
    cs.flushChanges();
    expect(host.textContent).to.equal('abcabcabcabcabcabcabcabcabc');

    tearDown(au, cs, host);
  });

})
