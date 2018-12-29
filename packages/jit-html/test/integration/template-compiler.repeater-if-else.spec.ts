import { IContainer } from '@aurelia/kernel';
import {
  Aurelia,
  bindable,
  ILifecycle,
  LifecycleFlags
} from '@aurelia/runtime';
import { expect } from 'chai';
import { baseSuite } from './template-compiler.base';
import { defineCustomElement, trimFull } from './util';

const spec = 'template-compiler.repeater-if-else';

const parentSuite = baseSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, any, string, [any[], string, string], string, number, any>(spec);

// repeater + if + custom element
parentSuite.addDataSlot('f') // Template (custom element)
  .addData('01').setValue(
    `<template>
      <div repeat.for="item of items">
        <div if.bind="display">
          \${item.if}
        </div>
        <div else>
          \${item.else}
        </div>
      </div>
    </template>`)
  .addData('02').setValue(
    `<template>
      <div repeat.for="item of items">
        <div if.bind="display">
          <div if.bind="true">
            \${item.if}
          </div>
        </div>
        <div else>
          \${item.else}
        </div>
      </div>
    </template>`)
  .addData('03').setValue(
    `<template>
      <div repeat.for="item of items">
        <div if.bind="display">
          <div if.bind="false">
            do_not_show
          </div>
          <div else>
            \${item.if}
          </div>
        </div>
        <div else>
          \${item.else}
        </div>
      </div>
    </template>`)
  .addData('04').setValue(
    `<template>
      <div if.bind="true" repeat.for="item of items">
        <div if.bind="display">
          \${item.if}
        </div>
        <div else>
          \${item.else}
        </div>
      </div>
    </template>`)
  .addData('05').setValue(
    `<template>
      <div if.bind="false">do_not_show</div>
      <div else repeat.for="item of items">
        <div if.bind="display">
          \${item.if}
        </div>
        <div else>
          \${item.else}
        </div>
      </div>
    </template>`)
  .addData('06').setValue(
    `<template>
      <div repeat.for="item of items">
        <div if.bind="display" repeat.for="i of 1">
          \${item.if}
        </div>
        <div else repeat.for="i of 1">
          \${item.else}
        </div>
      </div>
    </template>`)
  .addData('07').setValue(
    `<template>
      <div if.bind="true" repeat.for="item of items">
        <div if.bind="display" repeat.for="i of 1">
          \${item.if}
        </div>
        <div else repeat.for="i of 1">
          \${item.else}
        </div>
      </div>
    </template>`)
  .addData('08').setValue(
    `<template>
      <div repeat.for="a of 1">
        <div repeat.for="item of items">
          <div if.bind="display">
            \${item.if}
          </div>
          <div else>
            \${item.else}
          </div>
        </div>
      </div>
    </template>`)
  .addData('09').setValue(
    `<template>
      <template repeat.for="item of items">
        <div if.bind="display">
          \${item.if}
        </div>
        <div else>
          \${item.else}
        </div>
      </template>
    </template>`)
  .addData('10').setValue(
    `<template>
      <div repeat.for="item of items">
        <template if.bind="display">
          \${item.if}
        </template>
        <template else>
          \${item.else}
        </template>
      </div>
    </template>`)
  .addData('11').setValue(
    `<template>
      <template repeat.for="item of items">
        <template if.bind="display">
          \${item.if}
        </template>
        <template else>
          \${item.else}
        </template>
      </template>
    </template>`)
  .addData('12').setValue(
    `<template>
      <div if.bind="display" repeat.for="item of items">
        \${item.if}
      </div>
      <div else repeat.for="item of items">
        \${item.else}
      </div>
    </template>`)
  .addData('13').setValue(
    `<template>
      <div if.bind="display">
        <div repeat.for="item of items">
          \${item.if}
        </div>
      </div>
      <div else>
        <div repeat.for="item of items">
          \${item.else}
        </div>
      </div>
    </template>`)
  .addData('14').setValue(
    `<template>
      <div repeat.for="item of items" with.bind="item">
        <div if.bind="display">
          \${if}
        </div>
        <div else>
          \${else}
        </div>
      </div>
    </template>`)
  .addData('15').setValue(
    `<template>
      <div repeat.for="item of items">
        <div with.bind="item">
          <div if.bind="display">
            \${if}
          </div>
          <div else>
            \${else}
          </div>
        </div>
      </div>
    </template>`);

parentSuite.addDataSlot('g') // Items (initial)
  .addData('01').setFactory(c => [[{if: 1,   else: 2},   {if: 3,   else: 4}                                              ], '13',   '24'])
  .addData('02').setFactory(c => [[{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}, {if: 'g', else: 'h'}], 'aceg', 'bdfh']);

parentSuite.addDataSlot('h') // Markup (app)
  .addData('01').setValue(
    `<template>
      <foo repeat.for="i of count" items.bind="items" display.bind="display">
      </foo>
    </template>`)
  .addData('02').setValue(
    `<template>
      <foo repeat.for="i of count" if.bind="true" items.bind="items" display.bind="display">
      </foo>
    </template>`)
  .addData('03').setValue(
    `<template>
      <div repeat.for="i of count">
        <div if.bind="false">
          do_not_show
        </div>
        <foo else items.bind="items" display.bind="display">
        </foo>
      </div>
    </template>`)
  .addData('04').setValue(
    `<template>
      <foo if.bind="true" repeat.for="i of count" items.bind="items" display.bind="display">
      </foo>
    </template>`)
  .addData('05').setValue(
    `<template>
      <div if.bind="false">
        do_not_show
      </div>
      <foo else repeat.for="i of count" items.bind="items" display.bind="display">
      </foo>
    </template>`);
// // TODO: doesn't remove all nodes it needs to remove (or something), renders too much
//   .addData('06').setValue(
//     `<template>
//       <div if.bind="false">
//         do_not_show
//       </div>
//       <foo items.bind="items" display.bind="display" else repeat.for="i of count">
//       </foo>
//     </template>`)
// // TODO: incorrect bindings (or something), renders too little
  // .addData('07').setValue(
  //   `<template>
  //     <foo items.bind="items" display.bind="display" repeat.for="i of count">
  //     </foo>
  //   </template>`)

parentSuite.addDataSlot('i') // count
  .addData('01').setValue(1)
  .addData('02').setValue(3);

parentSuite.addActionSlot('setup')
  .addAction(null, ctx => {
    const { a: container, b: au, c: lifecycle, d: host, f: template, g: [initialItems, ifText, elseText], h: markup, i: count } = ctx;
    class Foo {
      @bindable public items: any[];
      @bindable public display: boolean;
    }
    const $Foo = defineCustomElement('foo', template, Foo);
    container.register($Foo);
    class App {
      public items: any[] = initialItems;
      public display: boolean = false;
      public count: number = count;
    }
    const $App = defineCustomElement('app', markup, App);
    const component = new $App();
    au.app({ host, component }).start();
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal(elseText.repeat(count));

    ctx.e = component;
  });

const mutations = parentSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, any, string, [any[], string, string], string, number, any>();
const removals = parentSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, any, string, [any[], string, string], string, number, any>();
const additions = parentSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, any, string, [any[], string, string], string, number, any>();

mutations.addActionSlot('mutate') // Tests/assertions
  // swap the if/else
  .addAction('01', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.display = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal(ifText.repeat(count));
  })
  // swap the if/else twice
  .addAction('02', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.display = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    component.display = false;
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal(elseText.repeat(count));
  })
  // assign items with the if/else swapped
  .addAction('03', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items = [{if: 2, else: 1}, {if: 4, else: 3}];
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal('13'.repeat(count));
  })
  // change the if/else values of the items
  .addAction('04', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items[0].if = 5;
    component.items[0].else = 6;
    component.items[1].if = 7;
    component.items[1].else = 8;
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal(('68' + elseText.slice(2)).repeat(count));
  })
  // reverse the items
  .addAction('05', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items.reverse();
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal((elseText.split('').reverse().join('')).repeat(count));
  })
  // reverse the items + swap the if/else
  .addAction('06', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items.reverse();
    component.display = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal((ifText.split('').reverse().join('')).repeat(count));
  });

removals.addActionSlot('remove')
  // assign an item less
  .addAction('01', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items = [{if: 'a', else: 'b'}];
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal('b'.repeat(count));
  })
  // assign an item less + swap the if/else
  .addAction('02', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items = [{if: 'a', else: 'b'}];
    component.display = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal('a'.repeat(count));
  })
  // pop an item
  .addAction('03', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items.pop();
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal(elseText.slice(0, -1).repeat(count));
  })
  // pop an item + swap the if/else
  .addAction('04', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items.pop();
    component.display = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal(ifText.slice(0, -1).repeat(count));
  });

additions.addActionSlot('add')
  // assign an item more
  .addAction('01', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items = component.items.slice().concat({if: 'x', else: 'y'});
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal((elseText + 'y').repeat(count));
  })
  // assign an item more + swap the if/else
  .addAction('02', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items = [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}];
    component.display = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal('ace'.repeat(count));
  })
  // push an item
  .addAction('03', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items.push({if: 5, else: 6});
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal((elseText + '6').repeat(count));
  })
  // push an item + swap the if/else
  .addAction('04', ctx => {
    const { c: lifecycle, d: host, e: component, g: [g1, ifText, elseText], i: count } = ctx;
    component.items.push({if: 5, else: 6});
    component.display = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(trimFull(host.textContent)).to.equal((ifText + '5').repeat(count));
  });

for (const suite of [mutations, removals, additions]) {
  suite.addActionSlot('teardown')
    .addAction(null, ctx => {
      const { b: au, c: lifecycle, d: host } = ctx;
      au.stop();
      expect(lifecycle['flushCount']).to.equal(0);
      expect(trimFull(host.textContent)).to.equal('');
    });

  suite.load();
  suite.run();
}
