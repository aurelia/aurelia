import { eachCartesianJoinFactory } from "./util";
import { PLATFORM, IIndexable } from "@aurelia/kernel";
import { expect } from "chai";
import { tearDown, setupAndStart, setup, cleanup } from "./prepare";
import { IChangeSet, customElement, bindable, Aurelia } from "@aurelia/runtime";
import { TestSuite } from '../../../../scripts/test-suite';

const spec = 'template-compiler.repeater';

const suite01 = new TestSuite<[string, string, string, (component: any) => void], string>(`${spec}.01`);

suite01.addDataSlot('a')
  .addData('01').setValue([`[a,b,c]`,             `\${item}`,               `123`,    c => {c.a=1;c.b=2;c.c=3}])
  .addData('02').setValue([`[c,b,a]|sort`,        `\${item}`,               `123`,    c => {c.a=1;c.b=2;c.c=3}])
  .addData('03').setValue([`[1+1,2+1,3+1]`,       `\${item}`,               `234`,    PLATFORM.noop])
  .addData('04').setValue([`[1,2,3]`,             `\${item}`,               `123`,    PLATFORM.noop])
  .addData('05').setValue([`[3,2,1]|sort`,        `\${item}`,               `123`,    PLATFORM.noop])
  .addData('06').setValue([`[{i:1},{i:2},{i:3}]`, `\${item.i}`,             `123`,    PLATFORM.noop])
  .addData('07').setValue([`[[1],[2],[3]]`,       `\${item[0]}`,            `123`,    PLATFORM.noop])
  .addData('08').setValue([`[[a],[b],[c]]`,       `\${item[0]}`,            `123`,    c => {c.a=1;c.b=2;c.c=3}])
  .addData('09').setValue([`3`,                   `\${item}`,               `012`,    PLATFORM.noop])
  .addData('10').setValue([`null`,                `\${item}`,               ``,       PLATFORM.noop])
  .addData('11').setValue([`undefined`,           `\${item}`,               ``,       PLATFORM.noop])
  .addData('12').setValue([`items`,               `\${item}`,               `123`,    c=>c.items=['1','2','3']])
  .addData('13').setValue([`items|sort`,          `\${item}`,               `123`,    c=>c.items=['3','2','1']])
  .addData('14').setValue([`items`,               `\${item.i}`,             `123`,    c=>c.items=[{i:1},{i:2},{i:3}]])
  .addData('15').setValue([`items|sort:'i'`,      `\${item.i}`,             `123`,    c=>c.items=[{i:3},{i:2},{i:1}]])
  .addData('16').setValue([`items`,               `\${item}`,               `123`,    c=>c.items=new Set(['1','2','3'])])
  .addData('17').setValue([`items`,               `\${item[0]}\${item[1]}`, `1a2b3c`, c=>c.items=new Map([['1','a'],['2','b'],['3','c']])]);

suite01.addDataSlot('b')
  .addData('01').setFactory(({a: [items, tpl]}) => `<template><div repeat.for="item of ${items}">${tpl}</div></template>`)
  .addData('02').setFactory(({a: [items, tpl]}) => `<template><div repeat.for="item of ${items}" if.bind="true">${tpl}</div></template>`)
  .addData('03').setFactory(({a: [items, tpl]}) => `<template><div if.bind="true" repeat.for="item of ${items}">${tpl}</div></template>`)
  .addData('04').setFactory(({a: [items, tpl]}) => `<template><div if.bind="false"></div><div else repeat.for="item of ${items}">${tpl}</div></template>`)
  .addData('05').setFactory(({a: [items, tpl]}) => `<template><template repeat.for="item of ${items}">${tpl}</template></template>`)
  .addData('06').setFactory(({a: [items, tpl]}) => `<template><template repeat.for="item of ${items}"><div if.bind="true">${tpl}</div></template></template>`)
  .addData('07').setFactory(({a: [items, tpl]}) => `<template><template repeat.for="item of ${items}"><div if.bind="false"></div><div else>${tpl}</div></template></template>`);

suite01.addActionSlot('test')
  .addAction('1', ({a: [a0, a1, expected, initialize], b: markup}) => {
    const { au, host, cs, component } = setupAndStart(markup, null);
    initialize(component)
    expect(host.textContent.trim()).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal(expected);
    tearDown(au, cs, host);
  });

suite01.load();
suite01.run();

// repeater + if + custom element
const suite02 = new TestSuite<string, [any[], string, string], string, number, HTMLElement, IChangeSet, any, Aurelia>(`${spec}.02`);

suite02.addDataSlot('a') // Template (custom element)
  .addData('01').setValue(`<template><div repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></template>`)
  .addData('02').setValue(`<template><div repeat.for="item of items"><div if.bind="display"><div if.bind="true">\${item.if}</div></div><div else>\${item.else}</div></div></template>`)
  .addData('03').setValue(`<template><div repeat.for="item of items"><div if.bind="display"><div if.bind="false">do_not_show</div><div else>\${item.if}</div></div><div else>\${item.else}</div></div></template>`)
  .addData('04').setValue(`<template><div if.bind="true" repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></template>`)
  .addData('05').setValue(`<template><div if.bind="false">do_not_show</div><div else repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></template>`)
  .addData('06').setValue(`<template><div repeat.for="item of items"><div if.bind="display" repeat.for="i of 1">\${item.if}</div><div else repeat.for="i of 1">\${item.else}</div></div></template>`)
  .addData('07').setValue(`<template><div if.bind="true" repeat.for="item of items"><div if.bind="display" repeat.for="i of 1">\${item.if}</div><div else repeat.for="i of 1">\${item.else}</div></div></template>`)
  .addData('08').setValue(`<template><div repeat.for="a of 1"><div repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></div></template>`)
  .addData('09').setValue(`<template><template repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></template></template>`)
//.addData('10').setValue(`<template><div repeat.for="item of items"><template if.bind="display">\${item.if}</template><template else>\${item.else}</template></div></template>`) // TODO: renderLocation is removed instead of view nodes
//.addData('11').setValue(`<template><template repeat.for="item of items"><template if.bind="display">\${item.if}</template><template else>\${item.else}</template></template></template>`) // TODO: renderLocation is removed instead of view nodes
  .addData('12').setValue(`<template><div if.bind="display" repeat.for="item of items">\${item.if}</div><div else repeat.for="item of items">\${item.else}</div></div></template>`)
  .addData('13').setValue(`<template><div if.bind="display"><div repeat.for="item of items">\${item.if}</div></div><div else><div repeat.for="item of items">\${item.else}</div></div></template>`)
//.addData('14').setValue(`<template><div repeat.for="item of items" with.bind="item"><div if.bind="display">\${if}</div><div else>\${else}</div></div></template>`) // TODO: throws code 253
//.addData('15').setValue(`<template><div repeat.for="item of items"><div with.bind="item"><div if.bind="display">\${if}</div><div else>\${else}</div></div></div></template>`) // TODO: throws code 253

suite02.addDataSlot('b') // Items (initial)
  .addData('01').setFactory(c => [[{if: 1,   else: 2},   {if: 3,   else: 4}                                              ], '13',   '24'])
  .addData('02').setFactory(c => [[{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}, {if: 'g', else: 'h'}], 'aceg', 'bdfh'])

suite02.addDataSlot('c') // Markup (app)
  .addData('01').setValue(`<template><foo repeat.for="i of count" if.bind="true" items.bind="items" display.bind="display"></foo></template>`)
//.addData('02').setValue(`<template><div repeat.for="i of count" if.bind="false">do_not_show</div><foo else items.bind="items" display.bind="display"></foo></template>`)
  .addData('03').setValue(`<template><foo repeat.for="i of count" items.bind="items" display.bind="display"></foo></template>`)
//.addData('04').setValue(`<template><foo items.bind="items" display.bind="display" if.bind="true" repeat.for="i of count"></foo></template>`)
//.addData('05').setValue(`<template><div if.bind="false">do_not_show</div><foo items.bind="items" display.bind="display" else repeat.for="i of count"></foo></template>`)
//.addData('06').setValue(`<template><foo items.bind="items" display.bind="display" repeat.for="i of count"></foo></template>`)

suite02.addDataSlot('d') // count
  .addData('01').setValue(1)
  .addData('02').setValue(3)

suite02.addActionSlot('setup')
  .addAction('1', ctx => {
    const { a: template, b: [initialItems, ifText, elseText], c: markup, d: count } = ctx;
    @customElement({ name: 'foo', templateOrNode: template, instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable public items: any; @bindable public display: boolean; }

    const { au, host, cs, component } = setup(markup, null, Foo);
    component.display = false;
    component.items = initialItems;
    component.count = count;
    au.app({ host, component }).start();
    cs.flushChanges();

    expect(host.textContent).to.equal(elseText.repeat(count));

    ctx.e = host;
    ctx.f = cs;
    ctx.g = component;
    ctx.h = au;
  });

suite02.addActionSlot('mutate') // Tests/assertions
  // swap the if/else
  .addAction('01', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.display = true;
    cs.flushChanges();

    expect(host.textContent).to.equal(ifText.repeat(count));
  })
  // swap the if/else twice
  .addAction('02', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.display = true;
    cs.flushChanges();
    component.display = false;
    cs.flushChanges();

    expect(host.textContent).to.equal(elseText.repeat(count));
  })
  // assign items with the if/else swapped
  .addAction('03', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items = [{if: 2, else: 1}, {if: 4, else: 3}];
    cs.flushChanges();

    expect(host.textContent).to.equal('13'.repeat(count));
  })
  // change the if/else values of the items
  .addAction('04', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items[0].if = 5;
    component.items[0].else = 6;
    component.items[1].if = 7;
    component.items[1].else = 8;
    cs.flushChanges();

    expect(host.textContent).to.equal(('68' + elseText.slice(2)).repeat(count));
  })
  // assign an item less
  .addAction('05', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items = [{if: 'a', else: 'b'}];
    cs.flushChanges();

    expect(host.textContent).to.equal('b'.repeat(count));
  })
  // assign an item less + swap the if/else
  .addAction('06', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items = [{if: 'a', else: 'b'}];
    component.display = true;
    cs.flushChanges();

    expect(host.textContent).to.equal('a'.repeat(count));
  })
  // pop an item
  .addAction('07', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items.pop();
    cs.flushChanges();

    expect(host.textContent).to.equal(elseText.slice(0, -1).repeat(count));
  })
  // pop an item + swap the if/else
  .addAction('08', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items.pop();
    component.display = true;
    cs.flushChanges();

    expect(host.textContent).to.equal(ifText.slice(0, -1).repeat(count));
  })
  // assign an item more
  .addAction('09', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items = [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}];
    cs.flushChanges();

    expect(host.textContent).to.equal('bdf'.repeat(count));
  })
  // assign an item more + swap the if/else
  .addAction('10', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items = [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}];
    component.display = true;
    cs.flushChanges();

    expect(host.textContent).to.equal('ace'.repeat(count));
  })
  // push an item
  .addAction('11', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items.push({if: 5, else: 6});
    cs.flushChanges();

    expect(host.textContent).to.equal((elseText + '6').repeat(count));
  })
  // push an item + swap the if/else
  .addAction('12', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items.push({if: 5, else: 6});
    component.display = true;
    cs.flushChanges();

    expect(host.textContent).to.equal((ifText + '5').repeat(count));
  })
  // reverse the items
  .addAction('13', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items.reverse();
    cs.flushChanges();

    expect(host.textContent).to.equal((elseText.split('').reverse().join('')).repeat(count));
  })
  // reverse the items + swap the if/else
  .addAction('14', ({ b: [b1, ifText, elseText], d: count, e: host, f: cs, g: component}) => {
    component.items.reverse();
    component.display = true;
    cs.flushChanges();

    expect(host.textContent).to.equal((ifText.split('').reverse().join('')).repeat(count));
  });

suite02.addActionSlot('teardown')
  .addAction('1', ({ e: host, f: cs, h: au}) => {
    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

suite02.load();
suite02.runOnly();

// TemplateCompiler - repeater / template controller integration
describe('template-compiler.repeater', () => {
  beforeEach(cleanup);
  afterEach(cleanup);


  // // repeater + if + custom element
  // describe(`02.`, () => {
  //   eachCartesianJoinFactory(
  //     [
  //       // Template (custom element)
  //       <(() => [string, string])[]>[
  //         () => ['101', `<template><div repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></template>`],
  //         () => ['102', `<template><div repeat.for="item of items"><div if.bind="display"><div if.bind="true">\${item.if}</div></div><div else>\${item.else}</div></div></template>`],
  //         () => ['103', `<template><div repeat.for="item of items"><div if.bind="display"><div if.bind="false">do_not_show</div><div else>\${item.if}</div></div><div else>\${item.else}</div></div></template>`],
  //         () => ['104', `<template><div if.bind="true" repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></template>`],
  //         () => ['105', `<template><div if.bind="false">do_not_show</div><div else repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></template>`],
  //         () => ['106', `<template><div repeat.for="item of items"><div if.bind="display" repeat.for="i of 1">\${item.if}</div><div else repeat.for="i of 1">\${item.else}</div></div></template>`],
  //         () => ['107', `<template><div if.bind="true" repeat.for="item of items"><div if.bind="display" repeat.for="i of 1">\${item.if}</div><div else repeat.for="i of 1">\${item.else}</div></div></template>`],
  //         () => ['108', `<template><div repeat.for="a of 1"><div repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></div></template>`],
  //         () => ['109', `<template><template repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></template></template>`],
  //       //() => ['110', `<template><div repeat.for="item of items"><template if.bind="display">\${item.if}</template><template else>\${item.else}</template></div></template>`], // TODO: renderLocation is removed instead of view nodes
  //       //() => ['111', `<template><template repeat.for="item of items"><template if.bind="display">\${item.if}</template><template else>\${item.else}</template></template></template>`], // TODO: renderLocation is removed instead of view nodes
  //         () => ['112', `<template><div if.bind="display" repeat.for="item of items">\${item.if}</div><div else repeat.for="item of items">\${item.else}</div></div></template>`],
  //         () => ['113', `<template><div if.bind="display"><div repeat.for="item of items">\${item.if}</div></div><div else><div repeat.for="item of items">\${item.else}</div></div></template>`],
  //       //() => ['114', `<template><div repeat.for="item of items" with.bind="item"><div if.bind="display">\${if}</div><div else>\${else}</div></div></template>`], // TODO: throws code 253
  //       //() => ['115', `<template><div repeat.for="item of items"><div with.bind="item"><div if.bind="display">\${if}</div><div else>\${else}</div></div></div></template>`] // TODO: throws code 253
  //       ],
  //       // Items (initial)
  //       <(() => [string, any[], string, string])[]>[
  //         () => ['201', [{if: 1, else: 2}, {if: 3, else: 4}], '13', '24'],
  //         () => ['202', [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}, {if: 'g', else: 'h'}], 'aceg', 'bdfh']
  //       ],
  //       // Markup (app)
  //       <(() => [string, string])[]>[
  //         () => ['301', `<template><foo repeat.for="i of count" if.bind="true" items.bind="items" display.bind="display"></foo></template>`],
  //       //() => ['302', `<template><div repeat.for="i of count" if.bind="false">do_not_show</div><foo else items.bind="items" display.bind="display"></foo></template>`],
  //         () => ['303', `<template><foo repeat.for="i of count" items.bind="items" display.bind="display"></foo></template>`],
  //       //() => ['304', `<template><foo items.bind="items" display.bind="display" if.bind="true" repeat.for="i of count"></foo></template>`],
  //       //() => ['305', `<template><div if.bind="false">do_not_show</div><foo items.bind="items" display.bind="display" else repeat.for="i of count"></foo></template>`],
  //       //() => ['306', `<template><foo items.bind="items" display.bind="display" repeat.for="i of count"></foo></template>`]
  //       ],
  //       // count
  //       <(() => [string, number])[]>[
  //         () => ['401', 1],
  //         () => ['402', 3]
  //       ],
  //       // Tests/assertions
  //       <(($1: [string, string], $2: [string, any[], string, string], $3: [string, string], $4: [string, number]) => [string, (host: HTMLElement, cs: IChangeSet, component: IIndexable) => void])[]>[

  //         // swap the if/else
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['501', (host, cs, component) => {
  //           component.display = true;
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal(ifText.repeat(count));
  //         }],

  //         // swap the if/else twice
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['502', (host, cs, component) => {
  //           component.display = true;
  //           cs.flushChanges();
  //           component.display = false;
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal(elseText.repeat(count));
  //         }],

  //         // assign items with the if/else swapped
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['503', (host, cs, component) => {
  //           component.items = [{if: 2, else: 1}, {if: 4, else: 3}];
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal('13'.repeat(count));
  //         }],

  //         // change the if/else values of the items
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['504', (host, cs, component) => {
  //           component.items[0].if = 5;
  //           component.items[0].else = 6;
  //           component.items[1].if = 7;
  //           component.items[1].else = 8;
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal(('68' + elseText.slice(2)).repeat(count));
  //         }],

  //         // assign an item less
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['505', (host, cs, component) => {
  //           component.items = [{if: 'a', else: 'b'}];
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal('b'.repeat(count));
  //         }],

  //         // assign an item less + swap the if/else
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['506', (host, cs, component) => {
  //           component.items = [{if: 'a', else: 'b'}];
  //           component.display = true;
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal('a'.repeat(count));
  //         }],

  //         // pop an item
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['507', (host, cs, component) => {
  //           component.items.pop();
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal(elseText.slice(0, -1).repeat(count));
  //         }],

  //         // pop an item + swap the if/else
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['508', (host, cs, component) => {
  //           component.items.pop();
  //           component.display = true;
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal(ifText.slice(0, -1).repeat(count));
  //         }],

  //         // assign an item more
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['509', (host, cs, component) => {
  //           component.items = [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}];
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal('bdf'.repeat(count));
  //         }],

  //         // assign an item more + swap the if/else
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['510', (host, cs, component) => {
  //           component.items = [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}];
  //           component.display = true;
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal('ace'.repeat(count));
  //         }],

  //         // push an item
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['511', (host, cs, component) => {
  //           component.items.push({if: 5, else: 6});
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal((elseText + '6').repeat(count));
  //         }],

  //         // push an item + swap the if/else
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['512', (host, cs, component) => {
  //           component.items.push({if: 5, else: 6});
  //           component.display = true;
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal((ifText + '5').repeat(count));
  //         }],

  //         // reverse the items
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['513', (host, cs, component) => {
  //           component.items.reverse();
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal((elseText.split('').reverse().join('')).repeat(count));
  //         }],

  //         // reverse the items + swap the if/else
  //         ($1, [$21, $22, ifText, elseText], $3, [$41, count])  => ['514', (host, cs, component) => {
  //           component.items.reverse();
  //           component.display = true;
  //           cs.flushChanges();

  //           expect(host.textContent).to.equal((ifText.split('').reverse().join('')).repeat(count));
  //         }]
  //       ]
  //     ],
  //     ([caseId1, template], [caseId2, initialItems, ifText, elseText], [caseId3, markup], [caseId4, count], [caseId5, action]) => {

  //       it(`${caseId1}.${caseId2}.${caseId3}.${caseId4}.${caseId5}`, () => {
  //         @customElement({ name: 'foo', templateOrNode: template, instructions: [], build: { required: true, compiler: 'default' } })
  //         class Foo { @bindable public items: any; @bindable public display: boolean; }

  //         const { au, host, cs, component } = setup(markup, null, Foo);
  //         component.display = false;
  //         component.items = initialItems;
  //         component.count = count;
  //         au.app({ host, component }).start();
  //         cs.flushChanges();

  //         expect(host.textContent).to.equal(elseText.repeat(count));

  //         action(host, cs, component);

  //         tearDown(au, cs, host);
  //         expect(host.textContent).to.equal('');
  //       });
  //     }
  //   )
  // });

  // repeater with custom element
  it('03.', () => {
    @customElement({ name: 'foo', templateOrNode: '<template>a</template>', instructions: [], build: { required: true, compiler: 'default' } })
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
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
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
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
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
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
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
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
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
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text; }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);
    component.theText = 'a';
    component.count = 3;
    au.app({ host, component }).start();
    cs.flushChanges();
    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element + inner bindable with same name as outer property, reversed
  it('09.', () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text; }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);
    component.theText = 'a';
    component.count = 3;
    au.app({ host, component }).start();
    cs.flushChanges();
    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // repeater with custom element with repeater
  it('10.', () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div repeat.for="item of todos">${item}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable todos: any[] }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, null, Foo);
    component.todos = ['a', 'b', 'c']
    component.count = 3;
    au.app({ host, component }).start();
    cs.flushChanges();
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
    @customElement({ name: 'foo', templateOrNode: '<template><div repeat.for="innerTodos of todos"><div repeat.for="item of innerTodos">${item}</div></div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable todos: any[] }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, null, Foo);
    component.todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']]
    component.count = 3;
    au.app({ host, component }).start();
    cs.flushChanges();
    expect(host.textContent).to.equal('abcabcabcabcabcabcabcabcabc');

    component.count = 1;
    cs.flushChanges();
    expect(host.textContent).to.equal('abcabcabc');

    component.count = 3;
    cs.flushChanges();
    expect(host.textContent).to.equal('abcabcabcabcabcabcabcabcabc');

    tearDown(au, cs, host);
  });

  // nested repeater - array
  it('12.', () => {
    const { au, host, cs, component } = setupAndStart(
      `<template><div repeat.for="item of items"><div repeat.for="child of item">\${child}</div></div></template>`,
      class App { items = [['1'], ['2'], ['3']] }
    );
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    tearDown(au, cs, host);
  });

  // repeater - sorted primitive array - asc
  it('13.', () => {
    const { au, host, cs, component } = setupAndStart(
      `<template><div repeat.for="item of items | sort">\${item}</div></template>`,
      class App { items = ['3', '2', '1']; }
    );
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    tearDown(au, cs, host);
  });

  // repeater - sorted primitive array - desc
  it('14.', () => {
    const { au, host, cs, component } = setupAndStart(
      `<template><div repeat.for="item of items | sort:null:'desc'">\${item}</div></template>`,
      class App { items = ['1', '2', '3']; }
    );
    cs.flushChanges();
    expect(host.textContent).to.equal('321');
    tearDown(au, cs, host);
  });

  // repeater with nested if
  it('15.', () => {
    const { au, host, cs, component } = setupAndStart(
      `<template><div repeat.for="item of items"><div if.bind="$parent.show">\${item}</div></div></template>`,
      class App { items = [['1'], ['2'], ['3']]; show = true; }
    );
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
    tearDown(au, cs, host);
  });

  // repeater with sibling if
  it('16.', () => {
    const { au, host, cs, component } = setupAndStart(
      `<template><div repeat.for="item of items" if.bind="$parent.show">\${item}</div></template>`,
      class App { items = [['1'], ['2'], ['3']]; show = true; }
    );
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
    tearDown(au, cs, host);
  });

  // repeater with parent-sibling if
  it('17.', () => {
    const { au, host, cs, component } = setupAndStart(
      `<template><div if.bind="show" repeat.for="item of items">\${item}</div></template>`,
      class App { items = [['1'], ['2'], ['3']]; show = true; }
    );
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
    tearDown(au, cs, host);
  });

  // repeater with nested if/else (divs)
  it('18.', () => {
    const { au, host, cs, component } = setupAndStart(
      `<template><div repeat.for="item of items"><div if.bind="show">\${item.if}</div><div else>\${item.else}</div></div></template>`,
      class App { items = [{if:'1',else:'2'},{if:'3',else:'4'}]; show = true; }
    );
    cs.flushChanges();

    expect(host.textContent).to.equal('13');

    component.show = false;
    cs.flushChanges();

    expect(host.textContent.trim()).to.equal('24');

    tearDown(au, cs, host);
  });

  // repeater with nested if/else (outer div, inner template)
  // it('19.', () => {
  //   const { au, host, cs, component } = setupAndStart(
  //     `<template><div repeat.for="item of items"><template if.bind="show">\${item.if}</template><template else>\${item.else}</template></div></template>`,
  //     class App { items = [{if:'1',else:'2'},{if:'3',else:'4'}]; show = true; }
  //   );
  //   cs.flushChanges();

  //   expect(host.textContent).to.equal('13');

  //   component.show = false;
  //   cs.flushChanges();

  //   expect(host.textContent.trim()).to.equal('24');

  //   tearDown(au, cs, host);
  // });
});
