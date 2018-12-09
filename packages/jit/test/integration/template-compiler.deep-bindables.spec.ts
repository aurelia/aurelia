import { expect } from "chai";
import { defineCustomElement, createCustomElement, TestConfiguration } from "./prepare";
import { ILifecycle, bindable, Aurelia, ICustomElementType, DOM, IObserverLocator, IHTMLElement, IHTMLTemplateElement } from '../../../runtime/src/index';
import { baseSuite } from "./template-compiler.base";
import { IContainer, Constructable, DI } from "@aurelia/kernel";
import { trimFull } from "./util";
import { BasicConfiguration } from "../../src";
import { LifecycleFlags } from '../../../runtime/src/index';

const spec = 'template-compiler.deep-bindables';

type TFooA = Constructable<{ a1: string; a2: string; a3: string }> & ICustomElementType;
type TFooB = Constructable<{ b1: string; b2: string; b3: string }> & ICustomElementType;
type TFooC = Constructable<{ c1: string; c2: string; c3: string }> & ICustomElementType;
type TApp = Constructable<{ $1: string; $2: string; $3: string }> & ICustomElementType & TFooA & TFooB & TFooC;

// #region parentSuite
const parentSuite = baseSuite.clone<IContainer, Aurelia, ILifecycle, IHTMLElement, TApp, TFooA, TFooB, TFooC, IHTMLElement, IHTMLElement, IHTMLElement>(spec);

parentSuite.addDataSlot('e').addData('app').setFactory(ctx => {
  const { a: container } = ctx;
  const template = DOM.createTemplate();
  const text = DOM.createTextNode('${$1}${$2}${$3}');
  const fooA_el = DOM.createElement('foo-a');

  fooA_el.setAttribute('a1.bind', '$1');
  fooA_el.setAttribute('a2.bind', '$2');
  fooA_el.setAttribute('a3.bind', '$3');

  template.content.appendChild(text);
  template.content.appendChild(fooA_el);

  const $App = defineCustomElement('app', template, class App {});
  container.register($App);
  ctx.i = fooA_el;
  return $App;
});
parentSuite.addDataSlot('f').addData('foo-a').setFactory(ctx => {
  const { a: container } = ctx;
  const template = DOM.createElement('template');
  const text = DOM.createTextNode('${a1}${a2}${a3}');
  const fooB_el = DOM.createElement('foo-b');

  fooB_el.setAttribute('b1.bind', 'a1');
  fooB_el.setAttribute('b2.bind', 'a2');
  fooB_el.setAttribute('b3.bind', 'a3');

  template.content.appendChild(text);
  template.content.appendChild(fooB_el);

  class FooA {
    @bindable() public a1: string;
    @bindable() public a2: string;
    @bindable() public a3: string;
    @bindable() public display: boolean;
    @bindable() public things: any[];
  }
  const $FooA = defineCustomElement('foo-a', template, FooA);
  container.register($FooA);
  ctx.j = fooB_el;
  return $FooA;
});
parentSuite.addDataSlot('g').addData('foo-b').setFactory(ctx => {
  const { a: container } = ctx;
  const template = DOM.createElement('template');
  const text = DOM.createTextNode('${b1}${b2}${b3}');
  const fooC_el = DOM.createElement('foo-c');

  fooC_el.setAttribute('c1.bind', 'b1');
  fooC_el.setAttribute('c2.bind', 'b2');
  fooC_el.setAttribute('c3.bind', 'b3');

  template.content.appendChild(text);
  template.content.appendChild(fooC_el);

  class FooB {
    @bindable() public b1: string;
    @bindable() public b2: string;
    @bindable() public b3: string;
    @bindable() public display: boolean;
    @bindable() public things: any[];
  }
  const $FooB = defineCustomElement('foo-b', template, FooB);
  container.register($FooB);
  ctx.k = fooC_el;
  return $FooB;
});
parentSuite.addDataSlot('h').addData('foo-c').setFactory(ctx => {
  const { a: container } = ctx;
  const template = DOM.createElement('template');
  const text = DOM.createTextNode('${c1}${c2}${c3}');

  template.content.appendChild(text);

  class FooC {
    @bindable() public c1: string;
    @bindable() public c2: string;
    @bindable() public c3: string;
    @bindable() public display: boolean;
    @bindable() public things: any[];
  }
  const $FooC = defineCustomElement('foo-c', template, FooC);
  container.register($FooC);
  return $FooC;
});

// #endregion

// #region basic
const nonWrappedBasic = parentSuite.clone<IContainer, Aurelia, ILifecycle, IHTMLElement, TApp, TFooA, TFooB, TFooC, IHTMLElement, IHTMLElement, IHTMLElement>(spec);
const wrappedBasic = parentSuite.clone<IContainer, Aurelia, ILifecycle, IHTMLElement, TApp, TFooA, TFooB, TFooC, IHTMLElement, IHTMLElement, IHTMLElement>(spec);

wrappedBasic.addActionSlot('wrap in div')
  .addAction('setup', ctx => {
    const {
      e: { description: { template: appTemplate } },
      f: { description: { template: fooATemplate } },
      g: { description: { template: fooBTemplate } },
      h: { description: { template: fooCTemplate } }
    } = ctx;

    for (const template of [appTemplate, fooATemplate, fooBTemplate, fooCTemplate] as IHTMLTemplateElement[]) {
      const div = DOM.createElement('div');
      div.appendChild(template.content);
      template.content.appendChild(div);
    }
  });

for (const suite of [nonWrappedBasic, wrappedBasic]) {
  suite.addActionSlot('act')
    .addAction('assign', ctx => {
      const { b: au, c: lifecycle, d: host, e: app } = ctx;

      const component = new app();
      component.$1 = '1';
      component.$2 = '2';
      component.$3 = '3';

      au.app({ host, component }).start();

      expect(host.textContent).to.equal('123'.repeat(4));
    })
    .addAction('no assign', ctx => {
      const { b: au, c: lifecycle, d: host, e: app } = ctx;
      const component = new app();

      au.app({ host, component }).start();

      expect(host.textContent).to.equal('undefined'.repeat(12));
    })

  suite.addActionSlot('teardown')
    .addAction(null, ctx => {
      const { a: container, b: au, c: lifecycle, d: host, e: app, f: fooA, g: fooB, h: fooC } = ctx;

      au.stop();
      expect(lifecycle['flushCount']).to.equal(0);
      //expect(host.textContent).to.equal('');
    });

  suite.load();
  suite.run();
}
// #endregion

// #region noBindables
const noBindables = parentSuite.clone<IContainer, Aurelia, ILifecycle, IHTMLElement, TApp, TFooA, TFooB, TFooC, IHTMLElement, IHTMLElement, IHTMLElement>(spec);
noBindables.addActionSlot('remove bindables')
  .addAction('setup', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      while (el.attributes[0]) {
        el.removeAttribute(el.attributes[0].name);
      }
    }
  });

noBindables.addActionSlot('act')
  .addAction('assign 1', ctx => {
    const { b: au, c: lifecycle, d: host, e: app } = ctx;

    const component = new app();
    component.$1 = '1';
    component.$2 = '2';
    component.$3 = '3';

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('123' + 'undefined'.repeat(9));
  })
  .addAction('assign 2', ctx => {
    const { b: au, c: lifecycle, d: host, e: app } = ctx;

    const component = new app();
    component.a1 = '1';
    component.a2 = '2';
    component.a3 = '3';

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('undefined'.repeat(12));
  })
  .addAction('assign 3', ctx => {
    const { b: au, c: lifecycle, d: host, e: app } = ctx;

    const component = new app();
    component.b1 = '1';
    component.b2 = '2';
    component.b3 = '3';

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('undefined'.repeat(12));
  })
  .addAction('assign 4', ctx => {
    const { b: au, c: lifecycle, d: host, e: app } = ctx;

    const component = new app();
    component.c1 = '1';
    component.c2 = '2';
    component.c3 = '3';

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('undefined'.repeat(12));
  });

noBindables.load();
noBindables.run();

// #endregion

// #region duplicated
const duplicated = parentSuite.clone<IContainer, Aurelia, ILifecycle, IHTMLElement, TApp, TFooA, TFooB, TFooC, IHTMLElement, IHTMLElement, IHTMLElement>(spec);
duplicated.addActionSlot('duplicate')
  .addAction('setup', ctx => {
    const { f: $fooA, g: $fooB, h: $fooC,  i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    const fooC_clone = fooC_el.cloneNode(true);
    for (let i = 0; i < 100; ++i) {
      ($fooB.description.template as IHTMLTemplateElement).content.appendChild(fooC_clone.cloneNode(true));
    }

    const fooB_clone = fooB_el.cloneNode(true);
    for (let i = 0; i < 10; ++i) {
      ($fooA.description.template as IHTMLTemplateElement).content.appendChild(fooB_clone.cloneNode(true));
    }
  });

duplicated.addActionSlot('act')
  .addAction('assign', ctx => {
    const { b: au, c: lifecycle, d: host, e: app } = ctx;

    const component = new app();
    component.$1 = '1';
    component.$2 = '2';
    component.$3 = '3';

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('123'.repeat(1124));
  })
  .addAction('no assign', ctx => {
    const { b: au, c: lifecycle, d: host, e: app } = ctx;
    const component = new app();

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('undefined'.repeat(1124 * 3));
  })

duplicated.load();
duplicated.run();

// #endregion

// #region staticTemplateCtrl
const staticTemplateCtrl = parentSuite.clone<IContainer, Aurelia, ILifecycle, IHTMLElement, TApp, TFooA, TFooB, TFooC, IHTMLElement, IHTMLElement, IHTMLElement>(spec);

staticTemplateCtrl.addActionSlot('static template controller')
  .addAction('prepend if+repeat', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      let attributes = [];
      while (el.attributes[0]) {
        attributes.push(el.attributes[0]);
        el.removeAttribute(el.attributes[0].name);
      }
      el.setAttribute('if.bind', 'true');
      el.setAttribute('repeat.for', 'i of 1');
      while (attributes[0]) {
        el.setAttribute(attributes[0].name, attributes[0].value);
        attributes.shift();
      }
    }
  })
  .addAction('prepend if', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      let attributes = [];
      while (el.attributes[0]) {
        attributes.push(el.attributes[0]);
        el.removeAttribute(el.attributes[0].name);
      }
      el.setAttribute('if.bind', 'true');
      while (attributes[0]) {
        el.setAttribute(attributes[0].name, attributes[0].value);
        attributes.shift();
      }
    }
  })
  .addAction('prepend repeat', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      let attributes = [];
      while (el.attributes[0]) {
        attributes.push(el.attributes[0]);
        el.removeAttribute(el.attributes[0].name);
      }
      el.setAttribute('repeat.for', 'i of 1');
      while (attributes[0]) {
        el.setAttribute(attributes[0].name, attributes[0].value);
        attributes.shift();
      }
    }
  })
  .addAction('append if+repeat', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      el.setAttribute('if.bind', 'true');
      el.setAttribute('repeat.for', 'i of 1');
    }
  })
  .addAction('append repeat', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      el.setAttribute('repeat.for', 'i of 1');
    }
  })
  .addAction('append if', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      el.setAttribute('if.bind', 'true');
    }
  });

staticTemplateCtrl.addActionSlot('act')
  .addAction(null, ctx => {
    const { b: au, c: lifecycle, d: host, e: app } = ctx;

    const component = <any>new app();
    component.$1 = '1';
    component.$2 = '2';
    component.$3 = '3';

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('123'.repeat(4));
  })

staticTemplateCtrl.load();
staticTemplateCtrl.run();

// #endregion

// #region boundTemplateCtrl
const boundTemplateCtrl = parentSuite.clone<IContainer, Aurelia, ILifecycle, IHTMLElement, TApp, TFooA, TFooB, TFooC, IHTMLElement, IHTMLElement, IHTMLElement>(spec);

boundTemplateCtrl.addActionSlot('bound template controller')
  .addAction('prepend if+repeat', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      let attributes = [];
      while (el.attributes[0]) {
        attributes.push(el.attributes[0]);
        el.removeAttribute(el.attributes[0].name);
      }
      el.setAttribute('if.bind', 'display');
      el.setAttribute('repeat.for', 'i of things');
      el.setAttribute('things.bind', 'things');
      el.setAttribute('display.bind', 'display');
      while (attributes[0]) {
        el.setAttribute(attributes[0].name, attributes[0].value);
        attributes.shift();
      }
    }
  })
  .addAction('prepend repeat', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      let attributes = [];
      while (el.attributes[0]) {
        attributes.push(el.attributes[0]);
        el.removeAttribute(el.attributes[0].name);
      }
      el.setAttribute('repeat.for', 'i of things');
      el.setAttribute('things.bind', 'things');
      while (attributes[0]) {
        el.setAttribute(attributes[0].name, attributes[0].value);
        attributes.shift();
      }
    }
  })
  .addAction('prepend if', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      let attributes = [];
      while (el.attributes[0]) {
        attributes.push(el.attributes[0]);
        el.removeAttribute(el.attributes[0].name);
      }
      el.setAttribute('if.bind', 'display');
      el.setAttribute('display.bind', 'display');
      while (attributes[0]) {
        el.setAttribute(attributes[0].name, attributes[0].value);
        attributes.shift();
      }
    }
  })
  .addAction('append if+repeat', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      el.setAttribute('things.bind', 'things');
      el.setAttribute('display.bind', 'display');
      el.setAttribute('if.bind', 'display');
      el.setAttribute('repeat.for', 'i of things');
    }
  })
  .addAction('append repeat', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      el.setAttribute('things.bind', 'things');
      el.setAttribute('repeat.for', 'i of things');
    }
  })
  .addAction('append if', ctx => {
    const { i: fooA_el, j: fooB_el, k: fooC_el } = ctx;
    for (const el of [fooA_el, fooB_el, fooC_el]) {
      el.setAttribute('display.bind', 'display');
      el.setAttribute('if.bind', 'display');
    }
  });

boundTemplateCtrl.addActionSlot('act')
  .addAction('1', ctx => {
    const { b: au, c: lifecycle, d: host, e: app } = ctx;

    const component = <any>new app();
    component.$1 = '1';
    component.$2 = '2';
    component.$3 = '3';
    component.display = true;
    component.things = [1];

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('123'.repeat(4));
  })
  .addAction('2', ctx => {
    const { b: au, c: lifecycle, d: host, e: app } = ctx;

    const component = new app();
    component.$1 = '1';
    component.$2 = '2';
    component.$3 = '3';

    au.app({ host, component }).start();

    expect(host.textContent).to.equal('123');
  })

boundTemplateCtrl.load();
boundTemplateCtrl.run();
// #endregion
