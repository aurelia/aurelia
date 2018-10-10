import { InterpolationBinding } from './../../../runtime/src/binding/interpolation-binding';
import { IContainer, DI, PLATFORM, IIndexable } from '../../../kernel/src';
import { BasicConfiguration } from '../../src';
import {
  Aurelia, IChangeSet, CustomElementResource, valueConverter,
  customElement, bindable, SetterObserver, Binding,
  PropertyAccessor, ElementPropertyAccessor, Observer
} from '../../../runtime/src';
import { expect } from 'chai';
import { spy } from 'sinon';
import { eachCartesianJoinFactory, h } from './util';
import { eachCartesianJoin } from '../integration/util';


@valueConverter('sort')
export class SortValueConverter {
  public toView(arr: any[], prop?: string, dir: 'asc' | 'desc' = 'asc'): any[] {
    if (Array.isArray(arr)) {
      const factor = dir === 'asc' ? 1 : -1;
      if (prop && prop.length) {
        arr.sort((a, b) => a[prop] - b[prop] * factor);
      } else {
        arr.sort((a, b) => a - b * factor);
      }
    }
    return arr;
  }
}

@valueConverter('json')
export class JsonValueConverter {
  public toView(input: any): string {
    return JSON.stringify(input);
  }
  public fromView(input: string): any {
    return JSON.parse(input);
  }
}


@customElement({
  name: 'name-tag',
  templateOrNode: '<template>${name}</template>',
  build: { required: true, compiler: 'default' },
  dependencies: [],
  instructions: [],
  surrogates: []
})
class NameTag {

  @bindable()
  name: string;
}

const globalResources: any[] = [
  SortValueConverter,
  JsonValueConverter,
  NameTag
];

const TestConfiguration = {
  register(container: IContainer) {
    container.register(...globalResources);
  }
}

function createCustomElement(markup: string | Element, ...dependencies: Function[]): { [key: string]: any } {
  return new (CustomElementResource.define({
    name: 'app',
    dependencies: [...dependencies],
    templateOrNode: markup,
    build: { required: true, compiler: 'default' },
    instructions: [],
    surrogates: []
  }, class App { }))();
}

function stringify(o) {
  let cache = [];
  const result = JSON.stringify(o, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (value instanceof Node) {
        return value['innerHTML']
      }
      if (cache.indexOf(value) !== -1) {
        try {
          return JSON.parse(JSON.stringify(value));
        } catch (error) {
          return;
        }
      }
      cache.push(value);
    }
    return value;
  });
  cache = null;
  return result;
}

function setup(template: string, ...registrations: any[]) {
  const container = DI.createContainer();
  container.register(...registrations);
  const cs = container.get<IChangeSet>(IChangeSet);
  container.register(TestConfiguration, BasicConfiguration)
  const host = document.createElement('app');
  document.body.appendChild(host);
  const au = new Aurelia(container);
  const component = createCustomElement(template);
  au.app({ host, component }).start();
  return { container, cs, host, au, component };
}

function tearDown(au: Aurelia, cs: IChangeSet, host: HTMLElement) {
  au.stop();
  expect(cs.size).to.equal(0);
  document.body.removeChild(host);
}

describe('TemplateCompiler (integration)', () => {
  it(`textBinding - interpolation`, () => {
    const { au, host, cs, component } = setup(`<template>\${message}</template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.innerText).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`textBinding - interpolation with template`, () => {
    const { au, host, cs, component } = setup(`<template>\${\`\${message}\`}</template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.innerText).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`styleBinding - bind`, () => {
    const { au, host, cs, component } = setup(`<template><div style.bind="foo"></div></template>`);
    component.foo = 'color: green;';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('color: green;');
    tearDown(au, cs, host);
  });

  it(`styleBinding - interpolation`, () => {
    const { au, host, cs, component } = setup(`<template><div style="\${foo}"></div></template>`);
    component.foo = 'color: green;';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('color: green;');
    tearDown(au, cs, host);
  });

  it(`classBinding - bind`, () => {
    const { au, host, cs, component } = setup(`<template><div class.bind="foo"></div></template>`);
    component.foo = 'foo bar';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('au foo bar');
    tearDown(au, cs, host);
  });

  it(`classBinding - interpolation`, () => {
    const { au, host, cs, component } = setup(`<template><div class="\${foo}"></div></template>`);
    component.foo = 'foo bar';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('\${foo} au foo bar'); // TODO: fix this
    tearDown(au, cs, host);
  });

  it(`oneTimeBinding - input.value`, () => {
    const { au, host, cs, component } = setup(`<template><input value.one-time="message"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    tearDown(au, cs, host);
  });

  it(`toViewBinding - input.value`, () => {
    const { au, host, cs, component } = setup(`<template><input value.to-view="message"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`fromViewBinding - input.value`, () => {
    const { au, host, cs, component } = setup(`<template><input value.from-view="message"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`twoWayBinding - input.value`, () => {
    const { au, host, cs, component } = setup(`<template><input value.two-way="message"></template>`);
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`twoWayBinding - input.value - jsonValueConverter`, () => {
    const { au, host, cs, component } = setup(`<template><input value.two-way="message | json"></template>`);
    expect(component.message).to.be.undefined;
    host.firstChild['value'] = '{"foo":"bar"}';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.deep.equal({ foo: 'bar' });
    component.message = { bar: 'baz' };
    expect(host.firstChild['value']).to.equal('{"foo":"bar"}');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('{"bar":"baz"}');
    tearDown(au, cs, host);
  });

  it(`oneTimeBindingBehavior - input.value`, () => {
    const { au, host, cs, component } = setup(`<template><input value.to-view="message & oneTime"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    tearDown(au, cs, host);
  });

  it(`toViewBindingBehavior - input.value`, () => {
    const { au, host, cs, component } = setup(`<template><input value.one-time="message & toView"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`debounceBindingBehavior - input.value`, done => {
    const { au, host, cs, component } = setup(`<template><input value.to-view="message & debounce:50"></template>`);
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('');
      component.message = 'hello!!';
    }, 25);
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('');
      component.message = 'hello!!!';
    }, 50);
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('');
    }, 75);
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('hello!!!');
      tearDown(au, cs, host);
      done();
    }, 175);
  });

  // TODO: fix throttle
  // it(`throttleBindingBehavior - input.value`, done => {
  //   const { au, host, cs, component } = setup(`<template><input value.to-view="message & throttle:50"></template>`);
  //   au.app({ host, component }).start();
  //   expect(host.firstChild['value']).to.equal('');
  //   component.message = 'hello!';
  //   cs.flushChanges();
  //   expect(host.firstChild['value']).to.equal('hello!');
  //   component.message = 'hello!!';
  //   cs.flushChanges();
  //   expect(host.firstChild['value']).to.equal('hello!');
  //   component.message = 'hello!!!';
  //   cs.flushChanges();
  //   expect(host.firstChild['value']).to.equal('hello!');
  //   setTimeout(() => {
  //     component.message = 'hello!!!!';
  //     cs.flushChanges();
  //     expect(host.firstChild['value']).to.equal('hello!!!!');
  //     done();
  //   }, 75);
  // });

  it(`fromViewBindingBehavior - input.value`, () => {
    const { au, host, cs, component } = setup(`<template><input value.one-time="message & fromView"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`twoWayBindingBehavior - input.value`, () => {
    const { au, host, cs, component } = setup(`<template><input value.one-time="message & twoWay"></template>`);
    expect(component.message).to.be.undefined;
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`toViewBinding - input checkbox`, () => {
    const { au, host, cs, component } = setup(`<template><input checked.to-view="checked" type="checkbox"></template>`);
    expect(host.firstChild['checked']).to.be.false;
    component.checked = true;
    expect(host.firstChild['checked']).to.be.false;
    cs.flushChanges();
    expect(host.firstChild['checked']).to.be.true;
    tearDown(au, cs, host);
  });

  it(`twoWayBinding - input checkbox`, () => {
    const { au, host, cs, component } = setup(`<template><input checked.two-way="checked" type="checkbox"></template>`);
    expect(component.checked).to.be.undefined;
    host.firstChild['checked'] = true;
    expect(component.checked).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.checked).to.be.true;
    tearDown(au, cs, host);
  });

  it(`toViewBinding - select single`, () => {
    const { au, host, cs, component } = setup(
      <any>template(null,
        select(
          { 'value.to-view': 'selectedValue' },
          ...[1,2].map(v => option({ value: v }))
        )
      )
    );
    // const { au, host, cs, component } = setup(`<template><select value.to-view="selectedValue"><option value="1"></option><option value="2"></option></select></template>`);
    expect(host.firstElementChild['value']).to.equal('1');
    component.selectedValue = '2';
    expect(host.firstElementChild['value']).to.equal('1');
    cs.flushChanges();
    expect(host.firstElementChild['value']).to.equal('2');
    expect(host.firstElementChild.childNodes.item(1)['selected']).to.be.true;
    tearDown(au, cs, host);
  });

  it(`twoWayBinding - select single`, () => {
    const { au, host, cs, component } = setup(
      <any>h('template',
        null,
        h('select',
          { 'value.two-way': 'selectedValue' },
          ...[1,2].map(v => h('option', { value: v }))
        )
      )
    );
    // const { au, host, cs, component } = setup(`<template><select value.two-way="selectedValue"><option value="1"></option><option value="2"></option></select></template>`);
    expect(component.selectedValue).to.be.undefined;
    host.firstChild.childNodes.item(1)['selected'] = true;
    expect(component.selectedValue).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.selectedValue).to.equal('2');
    tearDown(au, cs, host);
  });

  it(`trigger - button`, () => {
    const { au, host, cs, component } = setup(`<template><button click.trigger="doStuff()"></button></template>`);
    component.doStuff = spy();
    host.firstChild.dispatchEvent(new CustomEvent('click'));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, cs, host);
  });

  it(`delegate - button`, () => {
    const { au, host, cs, component } = setup(`<template><button click.delegate="doStuff()"></button></template>`);
    component.doStuff = spy();
    host.firstChild.dispatchEvent(new CustomEvent('click', { bubbles: true }));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, cs, host);
  });

  it(`capture - button`, () => {
    const { au, host, cs, component } = setup(`<template><button click.capture="doStuff()"></button></template>`);
    component.doStuff = spy()
    host.firstChild.dispatchEvent(new CustomEvent('click', { bubbles: true }));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, cs, host);
  });

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
        const { au, host, cs, component } = setup(markup);
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
          const { au, host, cs, component } = setup(template);
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
    const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count"></foo></template>`, Foo);
    component.count = 3;
    cs.flushChanges();
    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  it(`repeater with custom element + inner bindable with different name than outer property`, () => {
    @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
    class Foo { @bindable text: string; }
    const { au, host, cs, component } = setup(`<template><foo text.bind="theText" repeat.for="i of count"></foo></template>`, Foo);
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
    const { au, host, cs, component } = setup(`<template><foo text.bind="text" repeat.for="i of count"></foo></template>`, Foo);
    component.count = 3;
    component.text = 'a';
    cs.flushChanges();
    expect(host.textContent).to.equal('aaa');

    tearDown(au, cs, host);
    expect(host.textContent).to.equal('');
  });

  // TODO: this doesn't work (note that this is the same as the 2 tests above but the attributes swapped around)
  // it(`repeater with custom element + inner bindable with different name than outer property, reversed`, () => {
  //   @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
  //   class Foo { @bindable text: string; }
  //   const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, Foo);
  //   component.count = 3;
  //   component.theText = 'a';
  //   cs.flushChanges();
  //   expect(host.textContent).to.equal('aaa');

  //   tearDown(au, cs, host);
  //   expect(host.textContent).to.equal('');
  // });

  // it(`repeater with custom element + inner bindable with same name as outer property, reversed`, () => {
  //   @customElement({ name: 'foo', templateOrNode: '<template><div>${text}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
  //   class Foo { @bindable text: string; }
  //   const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" text.bind="text"></foo></template>`, Foo);
  //   component.count = 3;
  //   component.text = 'a';
  //   cs.flushChanges();
  //   expect(host.textContent).to.equal('aaa');

  //   tearDown(au, cs, host);
  //   expect(host.textContent).to.equal('');
  // });

  // TODO: this doesn't work (the repeater inside the custom element doesn't render)
  // it(`repeater with custom element with repeater`, () => {
  //   @customElement({ name: 'foo', templateOrNode: '<template><div repeat.for="item of todos">${item}</div></template>', instructions: [], build: { required: true, compiler: 'default' } })
  //   class Foo { @bindable todos: any[] }
  //   const { au, host, cs, component } = setup(`<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, Foo);
  //   component.count = 3;
  //   component.items = ['a', 'b', 'c']
  //   cs.flushChanges();
  //   expect(host.textContent).to.equal('abcabcabc');

  //   // component.count = 1;
  //   // cs.flushChanges();
  //   // expect(host.textContent).to.equal('abc');

  //   // component.count = 3;
  //   // cs.flushChanges();
  //   // expect(host.textContent).to.equal('abcabcabc');

  //   tearDown(au, cs, host);
  // });

  it(`nested repeater - array`, () => {
    const { au, host, cs, component } = setup(`<template><div repeat.for="item of items"><div repeat.for="child of item">\${child}</div></div></template>`);
    component.items = [['1'], ['2'], ['3']];
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    tearDown(au, cs, host);
  });

  it(`repeater - sorted primitive array - asc`, () => {
    const { au, host, cs, component } = setup(`<template><div repeat.for="item of items | sort">\${item}</div></template>`);
    component.items = ['3', '2', '1'];
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    tearDown(au, cs, host);
  });

  it(`repeater - sorted primitive array - desc`, () => {
    const { au, host, cs, component } = setup(`<template><div repeat.for="item of items | sort:null:'desc'">\${item}</div></template>`);
    component.items = ['1', '2', '3'];
    cs.flushChanges();
    expect(host.textContent).to.equal('321');
    tearDown(au, cs, host);
  });

  it(`repeater with nested if`, () => {
    const { au, host, cs, component } = setup(`<template><div repeat.for="item of items"><div if.bind="$parent.show">\${item}</div></div></template>`);
    component.items = [['1'], ['2'], ['3']];
    component.show = true;
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
    tearDown(au, cs, host);
  });

  it(`repeater with sibling if`, () => {
    const { au, host, cs, component } = setup(`<template><div repeat.for="item of items" if.bind="$parent.show">\${item}</div></template>`);
    component.items = [['1'], ['2'], ['3']];
    component.show = true;
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
    tearDown(au, cs, host);
  });

  it(`repeater with parent-sibling if`, () => {
    const { au, host, cs, component } = setup(`<template><div if.bind="show" repeat.for="item of items">\${item}</div></template>`);
    component.items = [['1'], ['2'], ['3']];
    component.show = true;
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
    tearDown(au, cs, host);
  });


  // TODO: implement this in template compiler
  it(`if - shows and hides`, () => {
    const { au, host, cs, component } = setup(`<template><div if.bind="foo">bar</div></template>`);
    component.foo = true;
    cs.flushChanges();
    expect(host.textContent).to.equal('bar');
    component.foo = false;
    cs.flushChanges();
    expect(host.textContent).to.equal('');
    tearDown(au, cs, host);
  });

  it(`if - shows and hides - toggles else`, () => {
    const { au, host, cs, component } = setup(`<template><div if.bind="foo">bar</div><div else>baz</div></template>`);
    component.foo = true;
    cs.flushChanges();
    expect(host.innerText).to.equal('bar');
    component.foo = false;
    cs.flushChanges();
    expect(host.innerText).to.equal('baz');
    component.foo = true;
    cs.flushChanges();
    expect(host.innerText).to.equal('bar');
    tearDown(au, cs, host);
  });

  it(`custom elements`, () => {
    const { au, host, cs, component } = setup(
      `<template><name-tag name="bigopon"></name-tag></template>`,
    );
    cs.flushChanges();
    expect(host.textContent).to.equal('bigopon');
    tearDown(au, cs, host);
  });

  describe('[as-element]', () => {

    it('works with custom element with [as-element]', () => {
      const { au, host, cs, component } = setup(
        `<template><div as-element="name-tag" name="bigopon"></div></template>`,
      );
      cs.flushChanges();
      expect(host.textContent).to.equal('bigopon');
      tearDown(au, cs, host);
    });

    it('ignores tag name', () => {
      const { au, host, cs, component } = setup(
        `<template><name-tag as-element="div" name="bigopon">Fred</name-tag></template>`,
      );
      expect(host.textContent).to.equal('Fred');
      tearDown(au, cs, host);
    });
  });

  it('<let/>', () => {
    const { au, host, cs, component } = setup(
      '<template><let full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>',
    );
    expect(host.textContent).to.equal(' ');
    component.firstName = 'bi';
    component.lastName = 'go';
    expect(host.textContent).to.equal(' ');
    cs.flushChanges();
    expect(host.textContent).to.equal('bi go');
    tearDown(au, cs, host);
  });

  it('<let [to-view-model] />', () => {
    const { au, host, cs, component } = setup(
      '<template><let to-view-model full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>',
    );
    component.firstName = 'bi';
    expect(component.fullName).to.equal('bi undefined');
    component.lastName = 'go';
    expect(component.fullName).to.equal('bi go');
    cs.flushChanges();
    expect(host.textContent).to.equal('bi go');
    tearDown(au, cs, host);
  });

  it('initial values propagate through multiple nested custom elements connected via bindables', () => {
    const build = { required: true, compiler: 'default' };
    let boundCalls = 0;

    @customElement({ name: 'foo1', templateOrNode: `<template><foo2 value.bind="value" value2.bind="value1"></foo2>\${value}</template>`, instructions: [], build })
    class Foo1 {
      @bindable()
      public value: any;
      public value1: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        boundCalls++;
      }
    }

    @customElement({ name: 'foo2', templateOrNode: `<template><foo3 value.bind="value" value2.bind="value2"></foo3>\${value}</template>`, instructions: [], build })
    class Foo2 {
      @bindable()
      public value: any;
      public value1: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      @bindable()
      public value2: any;
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        expect(this.value2).to.equal('w00t1');
        boundCalls++;
      }
    }

    @customElement({ name: 'foo3', templateOrNode: `<template><foo4 value.bind="value" value2.bind="value2"></foo4>\${value}</template>`, instructions: [], build })
    class Foo3 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        expect(this.value2).to.equal('w00t1');
        boundCalls++;
      }
    }

    @customElement({ name: 'foo4', templateOrNode: `<template><foo5 value.bind="value" value2.bind="value2"></foo5>\${value}</template>`, instructions: [], build })
    class Foo4 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        expect(this.value2).to.equal('w00t1');
        boundCalls++;
      }
    }

    @customElement({ name: 'foo5', templateOrNode: `<template>\${value}</template>`, instructions: [], build })
    class Foo5 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        expect(this.value2).to.equal('w00t1');
        boundCalls++;
      }
    }

    const customElementCtors: any[] = [Foo1, Foo2, Foo3, Foo4, Foo5];
    const container = DI.createContainer();
    container.register(...customElementCtors);
    const cs = container.get<IChangeSet>(IChangeSet);
    container.register(TestConfiguration, BasicConfiguration)
    const host = document.createElement('app');
    document.body.appendChild(host);
    const au = new Aurelia(container);
    const component = createCustomElement('<template><foo1 value.bind="value"></foo1>\${value}</template>');
    component.value = 'w00t';
    au.app({ host, component }).start();

    expect(boundCalls).to.equal(5);

    let i = 0;
    let current = component;
    while (i < 5) {
      const childCtor = customElementCtors[i];
      expect(current.$attachables.length).to.equal(1);
      expect(current.$attachables[0]).to.be.instanceof(childCtor);

      switch (i) {
        case 0: // root component -> foo1
          expect(current.$bindables.length).to.equal(3);
          expect(current.$bindables[0]).to.be.instanceof(Binding);
          expect(current.$bindables[0]._observer0).be.instanceof(SetterObserver);
          expect(current.$bindables[0]._observer1).to.be.undefined;
          expect(current.$bindables[0].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[1]).to.be.instanceof(childCtor);

          expect(current.$bindables[2]).to.be.instanceof(InterpolationBinding);
          expect(current.$bindables[2].target.nodeName).to.equal('#text');
          expect(current.$bindables[2].targetObserver).to.be.instanceof(ElementPropertyAccessor);
          current = current.$bindables[1];
          break;
        case 1: // foo1 -> foo2
          expect(current.$bindables.length).to.equal(4);
          expect(current.$bindables[0]).to.be.instanceof(Binding);
          expect(current.$bindables[0]._observer0).be.instanceof(Observer);
          expect(current.$bindables[0]._observer1).to.be.undefined;
          expect(current.$bindables[0].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[1]).to.be.instanceof(Binding);
          expect(current.$bindables[1]._observer0).be.instanceof(SetterObserver);
          expect(current.$bindables[1]._observer1).to.be.undefined;
          expect(current.$bindables[1].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[2]).to.be.instanceof(childCtor);
          expect(current.$bindables[3]).to.be.instanceof(InterpolationBinding);
          expect(current.$bindables[3].target.nodeName).to.equal('#text');
          expect(current.$bindables[3].targetObserver).to.be.instanceof(ElementPropertyAccessor);
          current = current.$bindables[2];
          break;
        case 2:
        case 3:
        case 4: // foo2 -> foo3-5
          expect(current.$bindables.length).to.equal(4);
          expect(current.$bindables[0]).to.be.instanceof(Binding);
          expect(current.$bindables[0]._observer0).be.instanceof(Observer);
          expect(current.$bindables[0]._observer1).to.be.undefined;
          expect(current.$bindables[0].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[1]).to.be.instanceof(Binding);
          expect(current.$bindables[1]._observer0).be.instanceof(Observer);
          expect(current.$bindables[1]._observer1).to.be.undefined;
          expect(current.$bindables[1].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[2]).to.be.instanceof(childCtor);
          expect(current.$bindables[3]).to.be.instanceof(InterpolationBinding);
          expect(current.$bindables[3].target.nodeName).to.equal('#text');
          expect(current.$bindables[3].targetObserver).to.be.instanceof(ElementPropertyAccessor);
          current = current.$bindables[2];
      }

      i++;
    }

    expect(host.textContent).to.equal(' '.repeat(6));
    expect(cs.size).to.equal(6);
    const changes = cs.toArray();
    expect(changes[0]).to.be.instanceof(ElementPropertyAccessor);
    expect(changes[1]).to.be.instanceof(ElementPropertyAccessor);
    expect(changes[2]).to.be.instanceof(ElementPropertyAccessor);
    expect(changes[3]).to.be.instanceof(ElementPropertyAccessor);
    expect(changes[4]).to.be.instanceof(ElementPropertyAccessor);
    expect(changes[5]).to.be.instanceof(ElementPropertyAccessor);

    component.value = 'w00t00t';
    expect(current.value).to.equal('w00t00t');
    expect(host.textContent).to.equal(' '.repeat(6));
    expect(cs.size).to.equal(6);

    cs.flushChanges();
    expect(host.textContent).to.equal('w00t00t'.repeat(6));
    tearDown(au, cs, host);
  });

  function template(attrs: Record<string, any> | null, ...children: Element[]) {
    return h('template', attrs, ...children);
  }

  function select(attrs: Record<string, any> | null, ...children: (HTMLOptionElement | HTMLOptGroupElement)[]) {
    return h('select', attrs, ...children);
  }

  function option(attrs: Record<string, any> | null) {
    return h('option', attrs);
  }
});
