import { IContainer, DI, Registration } from '@aurelia/kernel';
import { TemplateCompiler, register } from '@aurelia/jit';
import { Aurelia, Repeat, If, Else, ITemplateCompiler, IChangeSet, CustomElementResource } from '@aurelia/runtime';
import { expect } from 'chai';
import { ExpressionParser } from '../../../../runtime/src/binding/expression-parser';
import { spy } from 'sinon';


const globalResources: any[] = [
  If,
  Else,
  Repeat
];

const TestConfiguration = {
  register(container: IContainer) {
    container.register(
      <any>ExpressionParser,
      Registration.singleton(ITemplateCompiler, TemplateCompiler),
      ...globalResources
    );
  }
}

function createCustomElement(markup: string): { [key: string]: any } {
  return new (CustomElementResource.define({
    name: 'app',
    dependencies: [],
    templateOrNode: markup,
    build: { required: true, compiler: 'default' },
    instructions: [],
    surrogates: []
  }, class App {}))();
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
  let au: Aurelia;
  let host: HTMLElement;
  let component: ReturnType<typeof createCustomElement>;
  let cs: IChangeSet

  beforeEach(() => {
    const container = DI.createContainer();
    cs = container.get(IChangeSet);
    register(container);
    host = document.createElement('app');
    document.body.appendChild(host);
    au = new Aurelia(container).register(TestConfiguration);
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

  it(`toViewBinding - input.value`, () => {
    component = createCustomElement(`<template><input value.to-view="message"></template>`);
    au.app({ host, component }).start();
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    expect(host.firstChild['value']).to.equal('');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('hello!');
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

  // TODO: fix delegate/capture :)
  // it(`delegate - button`, done => {
  //   component = createCustomElement(`<template><button click.delegate="doStuff()"></button></template>`);
  //   au.app({ host, component }).start();
  //   component.doStuff = spy()
  //   host.firstChild.dispatchEvent(new CustomEvent('click', { bubbles: true }))

  //   setTimeout(() => {
  //     expect(component.doStuff).to.have.been.called;
  //     done();
  //   });
  // });

  it(`repeater - array`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.innerText).to.equal('');
    component.items = ['1', '2', '3'];
    expect(host.innerText).to.equal('');
    cs.flushChanges();
    expect(host.innerText).to.equal('123');
  });

  it(`repeater - array literal`, () => {
    component = createCustomElement(`<template><div repeat.for="item of [1,2,3]">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.innerText).to.equal('');
    cs.flushChanges();
    expect(host.innerText).to.equal('123');
  });

  it(`repeater - array object literal`, () => {
    component = createCustomElement(`<template><div repeat.for="item of [{i:1},{i:2},{i:3}]">\${item.i}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.innerText).to.equal('');
    cs.flushChanges();
    expect(host.innerText).to.equal('123');
  });

  it(`repeater - set`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items">\${item}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.innerText).to.equal('');
    component.items = new Set(['1', '2', '3']);
    expect(host.innerText).to.equal('');
    cs.flushChanges();
    expect(host.innerText).to.equal('123');
  });

  it(`repeater - map`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items">\${item[0]}\${item[1]}</div></template>`);
    au.app({ host, component: component }).start();
    expect(host.innerText).to.equal('');
    component.items = new Map([['1', '1'], ['2', '2'], ['3', '3']]);
    expect(host.innerText).to.equal('');
    cs.flushChanges();
    expect(host.innerText).to.equal('112233');
  });

  it(`nested repeater - array`, () => {
    component = createCustomElement(`<template><div repeat.for="item of items"><div repeat.for="child of item">\${child}</div></div></template>`);
    au.app({ host, component: component }).start();
    expect(host.innerText).to.equal('');
    component.items = [['1'], ['2'], ['3']];
    expect(host.innerText).to.equal('');
    cs.flushChanges();
    expect(host.innerText).to.equal('123');
  });

});
