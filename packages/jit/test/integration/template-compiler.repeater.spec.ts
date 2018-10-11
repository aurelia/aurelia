import { eachCartesianJoinFactory } from "./util";
import { PLATFORM, IIndexable } from "@aurelia/kernel";
import { expect } from "chai";
import { tearDown, setupAndStart, setup } from "./prepare";
import { IChangeSet, customElement, bindable } from "@aurelia/runtime";

describe('TemplateCompiler - repeater / template controller integration', () => {

  describe(`repeater + if/else`, () => {
    eachCartesianJoinFactory([
      <(() => [string, string, string, (component: any) => void])[]>[
        () => [`[a,b,c]`,             `\${item}`,               `123`,    c => {c.a=1;c.b=2;c.c=3}],
        () => [`[c,b,a]|sort`,        `\${item}`,               `123`,    c => {c.a=1;c.b=2;c.c=3}],
        () => [`[1+1,2+1,3+1]`,       `\${item}`,               `234`,    PLATFORM.noop],
        () => [`[1,2,3]`,             `\${item}`,               `123`,    PLATFORM.noop],
        () => [`[3,2,1]|sort`,        `\${item}`,               `123`,    PLATFORM.noop],
        () => [`[{i:1},{i:2},{i:3}]`, `\${item.i}`,             `123`,    PLATFORM.noop],
        () => [`[[1],[2],[3]]`,       `\${item[0]}`,            `123`,    PLATFORM.noop],
        () => [`[[a],[b],[c]]`,       `\${item[0]}`,            `123`,    c => {c.a=1;c.b=2;c.c=3}],
        () => [`3`,                   `\${item}`,               `012`,    PLATFORM.noop],
        () => [`null`,                `\${item}`,               ``,       PLATFORM.noop],
        () => [`undefined`,           `\${item}`,               ``,       PLATFORM.noop],
        () => [`items`,               `\${item}`,               `123`,    c=>c.items=['1','2','3']],
        () => [`items|sort`,          `\${item}`,               `123`,    c=>c.items=['3','2','1']],
        () => [`items`,               `\${item.i}`,             `123`,    c=>c.items=[{i:1},{i:2},{i:3}]],
        () => [`items|sort:'i'`,      `\${item.i}`,             `123`,    c=>c.items=[{i:3},{i:2},{i:1}]],
        () => [`items`,               `\${item}`,               `123`,    c=>c.items=new Set(['1','2','3'])],
        () => [`items`,               `\${item[0]}\${item[1]}`, `1a2b3c`, c=>c.items=new Map([['1','a'],['2','b'],['3','c']])]
      ],
      <(($2: [string, string, string, (component: any) => void]) => string)[]>[
        ([iterable, itemTemplate, textContent, initialize]) => `<template><div repeat.for="item of ${iterable}">${itemTemplate}</div></template>`,
        ([iterable, itemTemplate, textContent, initialize]) => `<template><div repeat.for="item of ${iterable}" if.bind="true">${itemTemplate}</div></template>`,
        ([iterable, itemTemplate, textContent, initialize]) => `<template><div if.bind="true" repeat.for="item of ${iterable}">${itemTemplate}</div></template>`,
        ([iterable, itemTemplate, textContent, initialize]) => `<template><div if.bind="false"></div><div else repeat.for="item of ${iterable}">${itemTemplate}</div></template>`,
        ([iterable, itemTemplate, textContent, initialize]) => `<template><template repeat.for="item of ${iterable}">${itemTemplate}</template></template>`,
        ([iterable, itemTemplate, textContent, initialize]) => `<template><template repeat.for="item of ${iterable}"><div if.bind="true">${itemTemplate}</div></template></template>`,
        ([iterable, itemTemplate, textContent, initialize]) => `<template><template repeat.for="item of ${iterable}"><div if.bind="false"></div><div else>${itemTemplate}</div></template></template>`
      ]
    ], ([iterable, itemTemplate, textContent, initialize], markup) => {
      it(markup, () => {
        const { au, host, cs, component } = setupAndStart(markup);
        initialize(component)
        expect(host.textContent.trim()).to.equal('');
        cs.flushChanges();
        expect(host.textContent).to.equal(textContent);
        tearDown(au, cs, host);
      });
    })
  });

  describe(`repeater + if + custom element`, () => {
    eachCartesianJoinFactory(
      [
        // Template (custom element)
        <(() => [number, string])[]>[
          () => [1, `<template><div repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></template>`],
          () => [2, `<template><div repeat.for="item of items"><div if.bind="display"><div if.bind="true">\${item.if}</div></div><div else>\${item.else}</div></div></template>`],
          () => [3, `<template><div repeat.for="item of items"><div if.bind="display"><div if.bind="false">do_not_show</div><div else>\${item.if}</div></div><div else>\${item.else}</div></div></template>`],
          () => [4, `<template><div if.bind="true" repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></template>`],
          () => [5, `<template><div if.bind="false">do_not_show</div><div else repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></template>`],
          () => [6, `<template><div repeat.for="item of items"><div if.bind="display" repeat.for="i of 1">\${item.if}</div><div else repeat.for="i of 1">\${item.else}</div></div></template>`],
          () => [7, `<template><div if.bind="true" repeat.for="item of items"><div if.bind="display" repeat.for="i of 1">\${item.if}</div><div else repeat.for="i of 1">\${item.else}</div></div></template>`],
          // () => [8, `<template><div repeat.for="a of 1"><div repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></div></div></template>`], // TODO: doesn't render anything
          // () => [9, `<template><template repeat.for="item of items"><div if.bind="display">\${item.if}</div><div else>\${item.else}</div></template></template>`], // TODO: renderLocation is removed instead of view nodes
          // () => [10, `<template><div repeat.for="item of items"><template if.bind="display">\${item.if}</template><template else>\${item.else}</template></div></template>`], // TODO: renderLocation is removed instead of view nodes
          // () => [11, `<template><template repeat.for="item of items"><template if.bind="display">\${item.if}</template><template else>\${item.else}</template></template></template>`], // TODO: renderLocation is removed instead of view nodes
          () => [12, `<template><div if.bind="display" repeat.for="item of items">\${item.if}</div><div else repeat.for="item of items">\${item.else}</div></div></template>`],
          () => [13, `<template><div if.bind="display"><div repeat.for="item of items">\${item.if}</div></div><div else><div repeat.for="item of items">\${item.else}</div></div></template>`],
          //() => [14, `<template><div repeat.for="item of items" with.bind="item"><div if.bind="display">\${if}</div><div else>\${else}</div></div></template>`], // TODO: throws code 253
          //() => [15, `<template><div repeat.for="item of items"><div with.bind="item"><div if.bind="display">\${if}</div><div else>\${else}</div></div></div></template>`] // TODO: throws code 253
        ],
        // Items (initial)
        <(() => [number, any[], string, string])[]>[
          () => [1, [{if: 1, else: 2}, {if: 3, else: 4}], '13', '24'],
          () => [2, [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}, {if: 'g', else: 'h'}], 'aceg', 'bdfh']
        ],
        // Markup (app)
        <(() => [number, string])[]>[
          () => [1, `<template><foo repeat.for="i of count" if.bind="true" items.bind="items" display.bind="display"></foo></template>`],
          () => [2, `<template><div repeat.for="i of count" if.bind="false">do_not_show</div><foo else items.bind="items" display.bind="display"></foo></template>`],
          () => [3, `<template><foo repeat.for="i of count" items.bind="items" display.bind="display"></foo></template>`],
          () => [4, `<template><foo items.bind="items" display.bind="display" if.bind="true" repeat.for="i of count"></foo></template>`],
          () => [5, `<template><div if.bind="false">do_not_show</div><foo items.bind="items" display.bind="display" else repeat.for="i of count"></foo></template>`],
          () => [6, `<template><foo items.bind="items" display.bind="display" repeat.for="i of count"></foo></template>`]
        ],
        // count
        <(() => number)[]>[
          () => 1,
          //() => 3 // TODO: the outer repeater completely doesn't work, it always renders 1 foo regardless of the count property
        ],
        // Tests/assertions
        <(($1: [number, string], $2: [number, any[], string, string], $3: [number, string], $4: number) => [string, (host: HTMLElement, cs: IChangeSet, component: IIndexable) => void])[]>[
          ($1, [$21, $22, ifText, elseText], $3, count)  => [`swap the if/else`, (host, cs, component) => {
            component.display = true;
            cs.flushChanges();

            expect(host.textContent).to.equal(ifText.repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`swap the if/else twice`, (host, cs, component) => {
            component.display = true;
            cs.flushChanges();
            component.display = false;
            cs.flushChanges();

            expect(host.textContent).to.equal(elseText.repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`assign items with the if/else swapped`, (host, cs, component) => {
            component.items = [{if: 2, else: 1}, {if: 4, else: 3}];
            cs.flushChanges();

            expect(host.textContent).to.equal('13'.repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`change the if/else values of the items`, (host, cs, component) => {
            component.items[0].if = 5;
            component.items[0].else = 6;
            component.items[1].if = 7;
            component.items[1].else = 8;
            cs.flushChanges();

            expect(host.textContent).to.equal(('68' + elseText.slice(2)).repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`assign an item less`, (host, cs, component) => {
            component.items = [{if: 'a', else: 'b'}];
            cs.flushChanges();

            expect(host.textContent).to.equal('b');
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`assign an item less + swap the if/else`, (host, cs, component) => {
            component.items = [{if: 'a', else: 'b'}];
            component.display = true;
            cs.flushChanges();

            expect(host.textContent).to.equal('a'.repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`pop an item`, (host, cs, component) => {
            component.items.pop();
            cs.flushChanges();

            expect(host.textContent).to.equal(elseText.slice(0, -1).repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`pop an item + swap the if/else`, (host, cs, component) => {
            component.items.pop();
            component.display = true;
            cs.flushChanges();

            expect(host.textContent).to.equal(ifText.slice(0, -1).repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`assign an item more`, (host, cs, component) => {
            component.items = [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}];
            cs.flushChanges();

            expect(host.textContent).to.equal('bdf'.repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`assign an item more + swap the if/else`, (host, cs, component) => {
            component.items = [{if: 'a', else: 'b'}, {if: 'c', else: 'd'}, {if: 'e', else: 'f'}];
            component.display = true;
            cs.flushChanges();

            expect(host.textContent).to.equal('ace'.repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`push an item`, (host, cs, component) => {
            component.items.push({if: 5, else: 6});
            cs.flushChanges();

            expect(host.textContent).to.equal((elseText + '6').repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`push an item + swap the if/else`, (host, cs, component) => {
            component.items.push({if: 5, else: 6});
            component.display = true;
            cs.flushChanges();

            expect(host.textContent).to.equal((ifText + '5').repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`reverse the items`, (host, cs, component) => {
            component.items.reverse();
            cs.flushChanges();

            expect(host.textContent).to.equal((elseText.split('').reverse().join('')).repeat(count));
          }],

          ($1, [$21, $22, ifText, elseText], $3, count)  => [`reverse the items + swap the if/else`, (host, cs, component) => {
            component.items.reverse();
            component.display = true;
            cs.flushChanges();

            expect(host.textContent).to.equal((ifText.split('').reverse().join('')).repeat(count));
          }]
        ]
      ],
      ([templateCase, template], [itemsCase, initialItems, ifText, elseText], [markupCase, markup], count, [actionText, action]) => {

        @customElement({ name: 'foo', templateOrNode: template, instructions: [], build: { required: true, compiler: 'default' } })
        class Foo { @bindable public items: any; @bindable public display: boolean; }

        it(`template:${templateCase},items:${itemsCase},markup:${markupCase},count=${count}: ${actionText}`, () => {
          const { au, host, cs, component } = setupAndStart(template);
          component.display = false;
          component.items = initialItems;
          component.count = count;
          cs.flushChanges();

          expect(host.textContent).to.equal(elseText.repeat(count));

          action(host, cs, component);

          tearDown(au, cs, host);
          expect(host.textContent).to.equal('');
        });
      }
    )
  });


  it(`repeater with custom element`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template>a</template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { }
    const { au, host, cs, component } = setupAndStart(`<template><foo repeat.for="i of count"></foo></template>`, Foo);
    component.count = 3;
    cs.flushChanges();
    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  it(`repeater with custom element + inner bindable with different name than outer property`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, host, cs, component } = setupAndStart(`<template><foo text.bind="theText" repeat.for="i of count"></foo></template>`, Foo);
    component.count = 3;
    component.theText = 'a';
    cs.flushChanges();
    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  it(`repeater with custom element + inner bindable with same name as outer property`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, host, cs, component } = setupAndStart(`<template><foo text.bind="text" repeat.for="i of count"></foo></template>`, Foo);
    component.count = 3;
    component.text = 'a';
    cs.flushChanges();
    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  it(`repeater with custom element + inner bindable with different name than outer property, reversed, undefined property`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, host, cs, component } = setupAndStart(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, Foo);

    component.count = 3;
    component.theText = 'a';
    cs.flushChanges();
    expect(host.textContent).to.equal('undefinedundefinedundefined');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  it(`repeater with custom element + inner bindable with same name as outer property, reversed, undefined property`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, host, cs, component } = setupAndStart(`<template><foo repeat.for="i of count" text.bind="text"></foo></template>`, Foo);
    component.count = 3;
    component.text = 'a';
    cs.flushChanges();
    expect(host.textContent).to.equal('undefinedundefinedundefined');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  it(`repeater with custom element + inner bindable with different name than outer property, reversed`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text; }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, Foo);
    component.theText = 'a';
    component.count = 3;
    cs.flushChanges();
    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  it(`repeater with custom element + inner bindable with same name as outer property, reversed`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text; }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, Foo);
    component.theText = 'a';
    component.count = 3;
    cs.flushChanges();
    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  it(`repeater with custom element with repeater`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div repeat.for="item of todos">${item}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable todos: any[] }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, Foo);
    component.todos = ['a', 'b', 'c']
    component.count = 3;
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

  it(`repeater with custom element with repeater, nested arrays`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div repeat.for="innerTodos of todos"><div repeat.for="item of innerTodos">${item}</div></div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable todos: any[] }
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, Foo);
    component.todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']]
    component.count = 3;
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

  it(`nested repeater - array`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div repeat.for="item of items"><div repeat.for="child of item">\${child}</div></div></template>`);
    component.items = [['1'], ['2'], ['3']];
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    tearDown(au, cs, host);
  });

  it(`repeater - sorted primitive array - asc`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div repeat.for="item of items | sort">\${item}</div></template>`);
    component.items = ['3', '2', '1'];
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    tearDown(au, cs, host);
  });

  it(`repeater - sorted primitive array - desc`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div repeat.for="item of items | sort:null:'desc'">\${item}</div></template>`);
    component.items = ['1', '2', '3'];
    cs.flushChanges();
    expect(host.textContent).to.equal('321');
    tearDown(au, cs, host);
  });

  it(`repeater with nested if`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div repeat.for="item of items"><div if.bind="$parent.show">\${item}</div></div></template>`);
    component.items = [['1'], ['2'], ['3']];
    component.show = true;
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
    tearDown(au, cs, host);
  });

  it(`repeater with sibling if`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div repeat.for="item of items" if.bind="$parent.show">\${item}</div></template>`);
    component.items = [['1'], ['2'], ['3']];
    component.show = true;
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
    tearDown(au, cs, host);
  });

  it(`repeater with parent-sibling if`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div if.bind="show" repeat.for="item of items">\${item}</div></template>`);
    component.items = [['1'], ['2'], ['3']];
    component.show = true;
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
    tearDown(au, cs, host);
  });
});
