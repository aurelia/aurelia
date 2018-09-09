import { IContainer, DI, Registration } from '../../../../kernel/src/index';
import { TemplateCompiler, register, BasicConfiguration } from '../../../src/index';
import {
  Aurelia, Repeat, If, Else, ITemplateCompiler, IChangeSet, CustomElementResource, valueConverter,
  OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, TwoWayBindingBehavior,
  DebounceBindingBehavior, ThrottleBindingBehavior, ResourceDescription, ITemplateSource, customElement,
  bindable
} from '../../../../runtime/src/index';
import { expect } from 'chai';
import { ExpressionParser } from '../../../../runtime/src/binding/expression-parser';
import { spy } from 'sinon';


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

function createCustomElement(markup: string, ...dependencies: Function[]): { [key: string]: any } {
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


describe('TemplateCompiler (integration)', () => {
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

  it(`toViewBinding - select single`, () => {
    component = createCustomElement(`<template><select value.to-view="selectedValue"><option value="1"></option><option value="2"></option></select></template>`);
    au.app({ host, component }).start();
    expect(host.firstChild['value']).to.equal('1');
    component.selectedValue = '2';
    expect(host.firstChild['value']).to.equal('1');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('2');
    expect(host.firstChild.childNodes.item(1)['selected']).to.be.true;
  });

  it(`twoWayBinding - select single`, () => {
    component = createCustomElement(`<template><select value.two-way="selectedValue"><option value="1"></option><option value="2"></option></select></template>`);
    au.app({ host, component }).start();
    expect(component.selectedValue).to.be.undefined;
    host.firstChild.childNodes.item(1)['selected'] = true;
    expect(component.selectedValue).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.selectedValue).to.equal('2');
  });

  it(`trigger - button`, () => {
    component = createCustomElement(`<template><button click.trigger="doStuff()"></button></template>`);
    au.app({ host, component }).start();
    component.doStuff = spy()
    host.firstChild.dispatchEvent(new CustomEvent('click'))
    expect(component.doStuff).to.have.been.called;
  });

  it(`delegate - button`, () => {
    component = createCustomElement(`<template><button click.delegate="doStuff()"></button></template>`);
    au.app({ host, component }).start();
    component.doStuff = spy()
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

  it(`repeater - array`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    component.items = ['1', '2', '3'];
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.outerHTML).to.equal('<app><div>1</div><div>2</div><div>3</div><!--au-loc--></app>');
    expect(host.innerText).to.equal('1\n2\n3');
    expect(host.textContent).to.equal('123');
  });

  it(`repeater - array literal`, () => {
    component = createCustomElement(`<template><div repeat.for="item of [1,2,3]">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
  });

  it(`repeater - array object literal`, () => {
    component = createCustomElement(`<template><div repeat.for="item of [{i:1},{i:2},{i:3}]">\${item.i}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
  });

  it(`repeater - set`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    component.items = new Set(['1', '2', '3']);
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
  });

  it(`repeater - map`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items">\${item[0]}\${item[1]}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    component.items = new Map([['1', '1'], ['2', '2'], ['3', '3']]);
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('112233');
  });

  it(`nested repeater - array`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items"><div repeat.for="child of item">\${child}</div></div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    component.items = [['1'], ['2'], ['3']];
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
  });

  it(`repeater - sorted primitive array - asc`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items | sort">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    component.items = ['3', '2', '1'];
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
  });

  it(`repeater - sorted primitive array - desc`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items | sort:null:'desc'">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    component.items = ['1', '2', '3'];
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('321');
  });

  it(`repeater - sorted object array - asc`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items | sort:'id'">\${item.id}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    component.items = [{ id: '3' }, { id: '2' }, { id: '1' }];
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('123');
  });

  it(`repeater - sorted object array - desc`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items | sort:'id':'desc'">\${item.id}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.textContent).to.equal('');
    component.items = [{ id: '1' }, { id: '2' }, { id: '3' }];
    expect(host.textContent).to.equal('');
    cs.flushChanges();
    expect(host.textContent).to.equal('321');
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
});
