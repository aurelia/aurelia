import { IContainer, DI, PLATFORM } from '../../../kernel/src';
import { BasicConfiguration } from '../../src';
import {
  Aurelia, IChangeSet, CustomElementResource, valueConverter,
  customElement, bindable, SetterObserver, Binding,
  PropertyAccessor, ElementPropertyAccessor, Observer
} from '../../../runtime/src';
import { expect } from 'chai';
import { spy } from 'sinon';
import { eachCartesianJoinFactory, h } from './util';


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


describe.only('TemplateCompiler (integration)', () => {
  let container: IContainer;
  let au: Aurelia;
  let host: HTMLElement;
  let component: ReturnType<typeof createCustomElement>;
  let cs: IChangeSet

  beforeEach(() => {
    container = DI.createContainer();
    cs = container.get(IChangeSet);
    container.register(TestConfiguration, BasicConfiguration)
    host = document.createElement('app');
    document.body.appendChild(host);
    au = new Aurelia(container);
  });

  afterEach(() => {
    au.stop();
    document.body.removeChild(host);
  });

  it(`textBinding - interpolation`, () => {
    component = createCustomElement(`<template>\${message}</template>`);
    au.app({ host, component }).start();
    expect(host.innerText).to.equal('');
    component.message = 'hello!';
    expect(host.innerText).to.equal('');
    cs.flushChanges();
    expect(host.innerText).to.equal('hello!');
  });

  it(`textBinding - interpolation with template`, () => {
    component = createCustomElement(`<template>\${\`\${message}\`}</template>`);
    au.app({ host, component }).start();
    expect(host.innerText).to.equal('');
    component.message = 'hello!';
    expect(host.innerText).to.equal('');
    cs.flushChanges();
    expect(host.innerText).to.equal('hello!');
  });

  it(`styleBinding - bind`, () => {
    component = createCustomElement(`<template><div style.bind="foo"></div></template>`);
    au.app({ host, component }).start();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('');
    component.foo = 'color: green;';
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('');
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('color: green;');
  });

  it(`styleBinding - interpolation`, () => {
    component = createCustomElement(`<template><div style="\${foo}"></div></template>`);
    au.app({ host, component }).start();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('');
    component.foo = 'color: green;';
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('');
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('color: green;');
  });

  it(`classBinding - bind`, () => {
    component = createCustomElement(`<template><div class.bind="foo"></div></template>`);
    au.app({ host, component }).start();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('au');
    component.foo = 'foo bar';
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('au');
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('au foo bar');
  });

  it(`classBinding - interpolation`, () => {
    component = createCustomElement(`<template><div class="\${foo}"></div></template>`);
    au.app({ host, component }).start();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('\${foo} au');
    component.foo = 'foo bar';
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('\${foo} au');
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('\${foo} au foo bar'); // TODO: fix this
  });

  it(`oneTimeBinding - input.value`, () => {
    component = createCustomElement(`<template><input value.one-time="message"></template>`);
    au.app({ host, component }).start();
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    expect(host.firstChild['value']).to.equal('');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
  });

  it(`toViewBinding - input.value`, () => {
    component = createCustomElement(`<template><input value.to-view="message"></template>`);
    au.app({ host, component }).start();
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    expect(host.firstChild['value']).to.equal('');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('hello!');
  });

  it(`fromViewBinding - input.value`, () => {
    component = createCustomElement(`<template><input value.from-view="message"></template>`);
    au.app({ host, component }).start();
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    expect(host.firstChild['value']).to.equal('');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
  });

  it(`twoWayBinding - input.value`, () => {
    component = createCustomElement(`<template><input value.two-way="message"></template>`);
    au.app({ host, component }).start();
    expect(component.message).to.be.undefined;
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
  });

  it(`twoWayBinding - input.value - jsonValueConverter`, () => {
    component = createCustomElement(`<template><input value.two-way="message | json"></template>`);
    au.app({ host, component }).start();
    expect(component.message).to.be.undefined;
    host.firstChild['value'] = '{"foo":"bar"}';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.deep.equal({ foo: 'bar' });
    component.message = { bar: 'baz' };
    expect(host.firstChild['value']).to.equal('{"foo":"bar"}');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('{"bar":"baz"}');
  });

  it(`oneTimeBindingBehavior - input.value`, () => {
    component = createCustomElement(`<template><input value.to-view="message & oneTime"></template>`);
    au.app({ host, component }).start();
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    expect(host.firstChild['value']).to.equal('');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
  });

  it(`toViewBindingBehavior - input.value`, () => {
    component = createCustomElement(`<template><input value.one-time="message & toView"></template>`);
    au.app({ host, component }).start();
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    expect(host.firstChild['value']).to.equal('');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('hello!');
  });

  it(`debounceBindingBehavior - input.value`, done => {
    component = createCustomElement(`<template><input value.to-view="message & debounce:50"></template>`);
    au.app({ host, component }).start();
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
      done();
    }, 175);
  });

  // TODO: fix throttle
  // it(`throttleBindingBehavior - input.value`, done => {
  //   component = createCustomElement(`<template><input value.to-view="message & throttle:50"></template>`);
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
    component = createCustomElement(`<template><input value.one-time="message & fromView"></template>`);
    au.app({ host, component }).start();
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    expect(host.firstChild['value']).to.equal('');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
  });

  it(`twoWayBindingBehavior - input.value`, () => {
    component = createCustomElement(`<template><input value.one-time="message & twoWay"></template>`);
    au.app({ host, component }).start();
    expect(component.message).to.be.undefined;
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
  });

  it(`toViewBinding - input checkbox`, () => {
    component = createCustomElement(`<template><input checked.to-view="checked" type="checkbox"></template>`);
    au.app({ host, component }).start();
    expect(host.firstChild['checked']).to.be.false;
    component.checked = true;
    expect(host.firstChild['checked']).to.be.false;
    cs.flushChanges();
    expect(host.firstChild['checked']).to.be.true;
  });

  it(`twoWayBinding - input checkbox`, () => {
    component = createCustomElement(`<template><input checked.two-way="checked" type="checkbox"></template>`);
    au.app({ host, component }).start();
    expect(component.checked).to.be.undefined;
    host.firstChild['checked'] = true;
    expect(component.checked).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.checked).to.be.true;
  });

  it.only(`toViewBinding - select single`, () => {
    component = createCustomElement(
      // `<template>
      //   <select value.to-view="selectedValue">
      //     ${[1,2].map(v => `<option value="${v}"></option>`).join('')}
      //   </select>
      // </template>`
      h('template',
        null,
        h('select',
          { 'value.to-view': 'selectedValue' },
          ...[1,2].map(v => h('option', { value: v }))
        )
      )
    );
    // component = createCustomElement(`<template><select value.to-view="selectedValue"><option value="1"></option><option value="2"></option></select></template>`);
    au.app({ host, component }).start();
    expect(host.firstElementChild['value']).to.equal('1');
    component.selectedValue = '2';
    expect(host.firstElementChild['value']).to.equal('1');
    cs.flushChanges();
    expect(host.firstElementChild['value']).to.equal('2');
    expect(host.firstElementChild.childNodes.item(1)['selected']).to.be.true;
  });

  it.only(`twoWayBinding - select single`, () => {
    component = createCustomElement(
      h('template',
        null,
        h('select',
          { 'value.two-way': 'selectedValue' },
          ...[1,2].map(v => h('option', { value: v }))
        )
      )
    );
    // component = createCustomElement(`<template><select value.two-way="selectedValue"><option value="1"></option><option value="2"></option></select></template>`);
    au.app({ host, component }).start();
    expect(component.selectedValue).to.be.undefined;
    host.firstChild.childNodes.item(1)['selected'] = true;
    expect(component.selectedValue).to.be.undefined;
    debugger;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.selectedValue).to.equal('2');
  });

  it(`trigger - button`, () => {
    component = createCustomElement(`<template><button click.trigger="doStuff()"></button></template>`);
    au.app({ host, component }).start();
    component.doStuff = spy();
    host.firstChild.dispatchEvent(new CustomEvent('click'));
    expect(component.doStuff).to.have.been.called;
  });

  it(`delegate - button`, () => {
    component = createCustomElement(`<template><button click.delegate="doStuff()"></button></template>`);
    au.app({ host, component }).start();
    component.doStuff = spy();
    host.firstChild.dispatchEvent(new CustomEvent('click', { bubbles: true }));
    expect(component.doStuff).to.have.been.called;
  });

  it(`capture - button`, () => {
    component = createCustomElement(`<template><button click.capture="doStuff()"></button></template>`);
    au.app({ host, component }).start();
    component.doStuff = spy()
    host.firstChild.dispatchEvent(new CustomEvent('click', { bubbles: true }));
    expect(component.doStuff).to.have.been.called;
  });

  describe(`repeater`, () => {
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
        ([iterable, itemTemplate, textContent, initialize]) => `<template><template repeat.for="item of ${iterable}">${itemTemplate}</template></template>`
      ]
    ], ([iterable, itemTemplate, textContent, initialize], markup) => {
      it(markup, () => {
        component = createCustomElement(markup);
        au.app({ host, component }).start();
        expect(host.textContent.trim()).to.equal(''); // TODO: we kind of want to get rid of those spaces.. preferably
        initialize(component)
        expect(host.textContent.trim()).to.equal('');
        cs.flushChanges();
        expect(host.textContent).to.equal(textContent);
      });
    })
  });

  it(`nested repeater - array`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items"><div repeat.for="child of item">\${child}</div></div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent.trim()).to.equal('');
    component.items = [['1'], ['2'], ['3']];
    expect(host.textContent.trim()).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
  });

  it(`repeater - sorted primitive array - asc`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items | sort">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent.trim()).to.equal('');
    component.items = ['3', '2', '1'];
    expect(host.textContent.trim()).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
  });

  it(`repeater - sorted primitive array - desc`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items | sort:null:'desc'">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent.trim()).to.equal('');
    component.items = ['1', '2', '3'];
    expect(host.textContent.trim()).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('321');
  });

  it(`repeater with nested if`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items"><div if.bind="$parent.show">\${item}</div></div></template>`);
    au.app({ host, component }).start();
    expect(host.textContent.trim()).to.equal('');
    component.items = [['1'], ['2'], ['3']];
    component.show = true;
    expect(host.textContent.trim()).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
  });

  it(`repeater with sibling if`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items" if.bind="$parent.show">\${item}</div></template>`);
    au.app({ host, component }).start();
    expect(host.textContent.trim()).to.equal('');
    component.items = [['1'], ['2'], ['3']];
    component.show = true;
    expect(host.textContent.trim()).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
  });

  it(`repeater with parent-sibling if`, () => {
    component = createCustomElement(`<template><div if.bind="show" repeat.for="item of items">\${item}</div></template>`);
    au.app({ host, component }).start();
    expect(host.textContent.trim()).to.equal('');
    component.items = [['1'], ['2'], ['3']];
    component.show = true;
    expect(host.textContent.trim()).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
    component.show = false;
    expect(host.textContent.trim()).to.equal('');
  });


  // TODO: implement this in template compiler
  it(`if - shows and hides`, () => {
    component = createCustomElement(`<template><div if.bind="foo">bar</div></template>`);
    component.foo = true;
    au.app({ host, component: component }).start();
    cs.flushChanges();
    expect(host.textContent).to.equal('bar');
    component.foo = false;
    cs.flushChanges();
    expect(host.textContent).to.equal('');
  });

  it(`if - shows and hides - toggles else`, () => {
    component = createCustomElement(`<template><div if.bind="foo">bar</div><div else>baz</div></template>`);
    component.foo = true;
    au.app({ host, component: component }).start();
    cs.flushChanges();
    expect(host.innerText).to.equal('bar');
    component.foo = false;
    cs.flushChanges();
    expect(host.innerText).to.equal('baz');
    component.foo = true;
    cs.flushChanges();
    expect(host.innerText).to.equal('bar');
  });

  it(`custom elements`, () => {
    component = createCustomElement(
      `<template><name-tag name="bigopon"></name-tag></template>`,
    );
    au.app({ host, component: component }).start();
    cs.flushChanges();
    expect(host.textContent).to.equal('bigopon');
  });

  describe('[as-element]', () => {

    it('works with custom element with [as-element]', () => {
      component = createCustomElement(
        `<template><div as-element="name-tag" name="bigopon"></div></template>`,
      );
      au.app({ host, component: component }).start();
      cs.flushChanges();
      expect(host.textContent).to.equal('bigopon');
    });

    it('ignores tag name', () => {
      component = createCustomElement(
        `<template><name-tag as-element="div" name="bigopon">Fred</name-tag></template>`,
      );
      au.app({ host, component: component }).start();
      expect(host.textContent).to.equal('Fred');
    });
  });

  it('<let/>', () => {
    component = createCustomElement(
      '<template><let full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>',
    );
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal(' ');
    component.firstName = 'bi';
    component.lastName = 'go';
    expect(host.textContent).to.equal(' ');
    cs.flushChanges();
    expect(host.textContent).to.equal('bi go');
  });

  it('<let [to-view-model] />', () => {
    component = createCustomElement(
      '<template><let to-view-model full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>',
    );
    au.app({ host, component: component }).start();
    component.firstName = 'bi';
    expect(component.fullName).to.equal('bi undefined');
    component.lastName = 'go';
    expect(component.fullName).to.equal('bi go');
    cs.flushChanges();
    expect(host.textContent).to.equal('bi go');
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
    container.register(...customElementCtors);
    component = createCustomElement('<template><foo1 value.bind="value"></foo1>\${value}</template>');
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

          expect(current.$bindables[2]).to.be.instanceof(Binding);
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
          expect(current.$bindables[3]).to.be.instanceof(Binding);
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
          expect(current.$bindables[3]).to.be.instanceof(Binding);
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
  });
});
