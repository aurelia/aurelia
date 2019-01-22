import { IContainer, PLATFORM } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, ILifecycle } from '@aurelia/runtime';
import { expect } from 'chai';
import { baseSuite } from './template-compiler.base';

const spec = 'template-compiler.repeater';

const suite = baseSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, [string, string, string, (component: any) => void], string>(spec);
suite.addDataSlot('e')
  .addData('01').setValue([`[a,b,c]`,             `\${item}`,               `123`,    (c: {a: number; b: number; c: number}) => {c.a = 1; c.b = 2; c.c = 3; }]) // tslint:disable-line:no-statements-same-line
  .addData('02').setValue([`[c,b,a]|sort`,        `\${item}`,               `123`,    (c: {a: number; b: number; c: number}) => {c.a = 1; c.b = 2; c.c = 3; }]) // tslint:disable-line:no-statements-same-line
  .addData('03').setValue([`[1+1,2+1,3+1]`,       `\${item}`,               `234`,    PLATFORM.noop])
  .addData('04').setValue([`[1,2,3]`,             `\${item}`,               `123`,    PLATFORM.noop])
  .addData('05').setValue([`[3,2,1]|sort`,        `\${item}`,               `123`,    PLATFORM.noop])
  .addData('06').setValue([`[{i:1},{i:2},{i:3}]`, `\${item.i}`,             `123`,    PLATFORM.noop])
  .addData('07').setValue([`[[1],[2],[3]]`,       `\${item[0]}`,            `123`,    PLATFORM.noop])
  .addData('08').setValue([`[[a],[b],[c]]`,       `\${item[0]}`,            `123`,    (c: {a: number; b: number; c: number}) => {c.a = 1; c.b = 2; c.c = 3; }]) // tslint:disable-line:no-statements-same-line
  .addData('09').setValue([`3`,                   `\${item}`,               `012`,    PLATFORM.noop])
  .addData('10').setValue([`null`,                `\${item}`,               ``,       PLATFORM.noop])
  .addData('11').setValue([`undefined`,           `\${item}`,               ``,       PLATFORM.noop])
  .addData('12').setValue([`items`,               `\${item}`,               `123`,    (c: {items: string[]}) => c.items = ['1', '2', '3']])
  .addData('13').setValue([`items|sort`,          `\${item}`,               `123`,    (c: {items: string[]}) => c.items = ['3', '2', '1']])
  .addData('14').setValue([`items`,               `\${item.i}`,             `123`,    (c: {items: {i: number}[]}) => c.items = [{i: 1}, {i: 2}, {i: 3}]])
  .addData('15').setValue([`items|sort:'i'`,      `\${item.i}`,             `123`,    (c: {items: {i: number}[]}) => c.items = [{i: 3}, {i: 2}, {i: 1}]])
  .addData('16').setValue([`items`,               `\${item}`,               `123`,    (c: {items: Set<string>}) => c.items = new Set(['1', '2', '3'])])
  .addData('17').setValue([`items`,               `\${item[0]}\${item[1]}`, `1a2b3c`, (c: {items: Map<string, string>}) => c.items = new Map([['1', 'a'], ['2', 'b'], ['3', 'c']])]);

suite.addDataSlot('f')
  .addData('01').setFactory(({e: [items, tpl]}) => `<template><div repeat.for="item of ${items}">${tpl}</div></template>`)
  .addData('02').setFactory(({e: [items, tpl]}) => `<template><div repeat.for="item of ${items}" if.bind="true">${tpl}</div></template>`)
  .addData('03').setFactory(({e: [items, tpl]}) => `<template><div if.bind="true" repeat.for="item of ${items}">${tpl}</div></template>`)
  .addData('04').setFactory(({e: [items, tpl]}) => `<template><div if.bind="false"></div><div else repeat.for="item of ${items}">${tpl}</div></template>`)
  .addData('05').setFactory(({e: [items, tpl]}) => `<template><template repeat.for="item of ${items}">${tpl}</template></template>`)
  .addData('06').setFactory(({e: [items, tpl]}) => `<template><template repeat.for="item of ${items}"><div if.bind="true">${tpl}</div></template></template>`)
  .addData('07').setFactory(({e: [items, tpl]}) => `<template><template repeat.for="item of ${items}"><div if.bind="false"></div><div else>${tpl}</div></template></template>`)
  .addData('08').setFactory(({e: [items, tpl]}) => `<template><div repeat.for="item of ${items} & keyed">${tpl}</div></template>`)
  .addData('09').setFactory(({e: [items, tpl]}) => `<template><div repeat.for="item of ${items} & keyed" if.bind="true">${tpl}</div></template>`)
  .addData('10').setFactory(({e: [items, tpl]}) => `<template><div if.bind="true" repeat.for="item of ${items} & keyed">${tpl}</div></template>`)
  .addData('11').setFactory(({e: [items, tpl]}) => `<template><div if.bind="false"></div><div else repeat.for="item of ${items} & keyed">${tpl}</div></template>`)
  .addData('12').setFactory(({e: [items, tpl]}) => `<template><template repeat.for="item of ${items} & keyed">${tpl}</template></template>`)
  .addData('13').setFactory(({e: [items, tpl]}) => `<template><template repeat.for="item of ${items} & keyed"><div if.bind="true">${tpl}</div></template></template>`)
  .addData('14').setFactory(({e: [items, tpl]}) => `<template><template repeat.for="item of ${items} & keyed"><div if.bind="false"></div><div else>${tpl}</div></template></template>`);

suite.addActionSlot('setup')
  .addAction(null, ctx => {
    const {  b: au, c: lifecycle, d: host, e: [a1, a2, expected, initialize], f: markup } = ctx;
    class App {}
    const $App = CustomElementResource.define({ name: 'app', template: markup }, App);
    const component = new $App();
    initialize(component);

    au.app({ component, host }).start();

    expect(host.textContent).to.equal(expected);

    au.stop();

    expect(lifecycle['flushCount']).to.equal(0);
    expect(host.textContent).to.equal('');
  });

suite.load();
suite.run();
