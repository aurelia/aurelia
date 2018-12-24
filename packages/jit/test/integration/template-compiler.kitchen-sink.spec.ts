import { expect } from 'chai';
import { tearDown, setupAndStart, cleanup, defineCustomElement } from './prepare';
import { baseSuite } from './template-compiler.base';
import { IContainer, Constructable, DI, IRegistry, Tracer, RuntimeCompilationResources, Registration } from '../../../kernel/src/index';;
import { Aurelia, ICustomElementType, ILifecycle, CustomElementResource, DOM, IDOM, ISignaler, Lifecycle, TextNodeSequence, IExpressionParser, LifecycleFlags, INodeSequence, NodeSequenceFactory, ITemplateCompiler } from '../../../runtime/src/index';
import { BasicConfiguration, TemplateBinder, ResourceModel, IAttributeParser } from '../../src/index';
import { enableTracing, SymbolTraceWriter, disableTracing } from '../unit/util';
import { stringifyTemplateDefinition } from '../../src/debugging';


const dom = <any>new DOM(<any>document);
const domRegistration = Registration.instance(IDOM, dom);

const spec = 'template-compiler.kitchen-sink';

// TemplateCompiler - integration with various different parts
describe(spec, () => {
  it('startup with App type', () => {
    const component = CustomElementResource.define({ name: 'app', template: `<template>\${message}</template>` }, class { message = 'Hello!' });
    const host = document.createElement('div');
    const au = new Aurelia().register(BasicConfiguration).app({ host, component }).start();
    expect(host.textContent).to.equal('Hello!');
    au.stop();
    expect(host.textContent).to.equal('');
    au.start();
    expect(host.textContent).to.equal('Hello!');
    au.stop();
    expect(host.textContent).to.equal('');
  });

  it('test', () => {
    const rows: any[] = [
      {
        show: true,
        prop1: { text1: 'p011', text2: 'p012' },
        prop2: { text1: 'p021', text2: 'p022' },
        prop3: { text1: 'p031', text2: 'p032' },
        prop4: { text1: 'p041', text2: 'p042' },
        prop5: { text1: 'p051', text2: 'p052' }
      },
      {
        show: true,
        prop1: { text1: 'p111', text2: 'p112' },
        prop2: { text1: 'p121', text2: 'p122' },
        prop3: { text1: 'p131', text2: 'p132' },
        prop4: { text1: 'p141', text2: 'p142' },
        prop5: { text1: 'p151', text2: 'p152' }
      },
      {
        show: true,
        prop1: { text1: 'p211', text2: 'p212' },
        prop2: { text1: 'p221', text2: 'p222' },
        prop3: { text1: 'p231', text2: 'p232' },
        prop4: { text1: 'p241', text2: 'p242' },
        prop5: { text1: 'p251', text2: 'p252' }
      },
      {
        show: true,
        prop1: { text1: 'p311', text2: 'p312' },
        prop2: { text1: 'p321', text2: 'p322' },
        prop3: { text1: 'p331', text2: 'p332' },
        prop4: { text1: 'p341', text2: 'p342' },
        prop5: { text1: 'p351', text2: 'p352' }
      },
      {
        show: true,
        prop1: { text1: 'p411', text2: 'p412' },
        prop2: { text1: 'p421', text2: 'p422' },
        prop3: { text1: 'p431', text2: 'p432' },
        prop4: { text1: 'p441', text2: 'p442' },
        prop5: { text1: 'p451', text2: 'p452' }
      },
      {
        show: true,
        prop1: { text1: 'p511', text2: 'p512' },
        prop2: { text1: 'p521', text2: 'p522' },
        prop3: { text1: 'p531', text2: 'p532' },
        prop4: { text1: 'p541', text2: 'p542' },
        prop5: { text1: 'p551', text2: 'p552' }
      },
    ];

    const cols: any[] = [
      { name: 'prop1', show: true },
      { name: 'prop2', show: true },
      { name: 'prop3', show: true },
      { name: 'prop4', show: true },
      { name: 'prop5', show: true }
    ];

    function getDisplayText() {
      let result = '';
      for (const row of rows) {
        for (const col of cols) {
          if (row.show && col.show) {
            result += row[col.name] && row[col.name].text1;
          } else {
            result += row[col.name] && row[col.name].text2;
          }
        }
      }
      return result;
    }

    const Col = CustomElementResource.define({
      name: 'col',
      template: `<template><template if.bind="row.show && col.show">\${row[col.name].text1}</template><template else>\${row[col.name].text2}</template></template>`
    }, class {
      row: any;
      col: any;
      static bindables = { row: { property: 'row', attribute: 'row' }, col: { property: 'col', attribute: 'col' } };
      created() {

      }
      binding() {

      }
      bound() {

      }
      attaching() {

      }
      attached() {

      }
      detaching() {

      }
      detached() {

      }
      unbinding() {

      }
      unbound() {

      }
    });

    const Row = CustomElementResource.define({
      name: 'row',
      template: `<template><col repeat.for="col of cols" col.bind="col" row.bind="row"></col></template>`
    }, class {
      row: any;
      cols: any[];
      static bindables = { row: { property: 'row', attribute: 'row' }, cols: { property: 'cols', attribute: 'cols' } };
      created() {

      }
      binding() {

      }
      bound() {

      }
      attaching() {

      }
      attached() {

      }
      detaching() {

      }
      detached() {

      }
      unbinding() {

      }
      unbound() {

      }
    });

    const CustomTable = CustomElementResource.define({
      name: 'custom-table',
      template: `<template><row repeat.for="row of rows" row.bind="row" cols.bind="cols"></row></template>`
    }, class {
      rows: any[];
      cols: any[];
      static bindables = { rows: { property: 'rows', attribute: 'rows' }, cols: { property: 'cols', attribute: 'cols' } };
      created() {

      }
      binding() {

      }
      bound() {

      }
      attaching() {

      }
      attached() {

      }
      detaching() {

      }
      detached() {

      }
      unbinding() {

      }
      unbound() {

      }
    });

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><custom-table rows.bind="rows" cols.bind="cols"></custom-table></template>`
    }, class {
      rows = rows;
      cols = cols;
      created() {

      }
      binding() {

      }
      bound() {

      }
      attaching() {

      }
      attached() {

      }
      detaching() {

      }
      detached() {

      }
      unbinding() {

      }
      unbound() {

      }
    });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);
    container.register(<any>Col, <any>Row, <any>CustomTable);
    const lifecycle = container.get(ILifecycle);
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });
    au.start();

    const text1 = getDisplayText();
    expect(host.textContent).to.equal(text1);

    cols[0].show = false;
    cols[3].show = false;
    rows[2].show = false;
    rows[4].show = false;
    rows.push({
      show: true,
      prop1: { text1: 'p611', text2: 'p612' },
      prop2: { text1: 'p621', text2: 'p622' },
      prop3: { text1: 'p631', text2: 'p632' },
      prop4: { text1: 'p641', text2: 'p642' },
      prop5: { text1: 'p651', text2: 'p652' },
      prop6: { text1: 'p661', text2: 'p662' },
      prop7: { text1: 'p671', text2: 'p672' }
    });
    cols.push({ name: 'prop7', show: true })

    const text2 = getDisplayText();

    expect(host.textContent).to.equal(text1);

    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal(text2);

    au.stop();

    expect(host.textContent).to.equal('');

    au.start();

    expect(host.textContent).to.equal(text2);

  });


  it('attached task awaited indirectly', async () => {

    const Foo = CustomElementResource.define({
      name: 'foo',
      template: `<template><div ref="div">bar</div></template>`
    }, class {
      $lifecycle: ILifecycle;
      attaching() {
        this.$lifecycle.registerTask({
          done: false,
          canCancel() {return false;},
          cancel() {},
          wait() {
            this.done = true;
            return Promise.resolve();
          }
        })
      }
    });

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><foo if.bind="true"></foo></template>`
    }, class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);
    container.register(<any>Foo);
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('');

    await Promise.resolve();

    expect(host.textContent).to.equal('bar');

    au.stop();

    expect(host.textContent).to.equal('');

    au.start();

    expect(host.textContent).to.equal('');

    await Promise.resolve();

    expect(host.textContent).to.equal('bar');

    au.stop();

    expect(host.textContent).to.equal('');
  });


  it('attached task awaited directly', async () => {

    const Foo = CustomElementResource.define({
      name: 'foo',
      template: `<template><div ref="div">bar</div></template>`
    }, class {
      $lifecycle: ILifecycle;
      attaching() {
        this.$lifecycle.registerTask({
          done: false,
          canCancel() {return false;},
          cancel() {},
          wait() {
            this.done = true;
            return Promise.resolve();
          }
        })
      }
    });

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><foo if.bind="true"></foo></template>`
    }, class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);
    container.register(<any>Foo);
    const lifecycle = container.get(ILifecycle);
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    lifecycle.beginAttach();
    au.start();
    let task = lifecycle.endAttach(LifecycleFlags.fromStartTask);

    expect(host.textContent).to.equal('');

    await task.wait();

    expect(host.textContent).to.equal('bar');

    au.stop();

    expect(host.textContent).to.equal('');

    lifecycle.beginAttach();
    au.start();
    task = lifecycle.endAttach(LifecycleFlags.fromStartTask);

    expect(host.textContent).to.equal('');

    await task.wait();

    expect(host.textContent).to.equal('bar');

    au.stop();

    expect(host.textContent).to.equal('');
  });


  it('attached task (triple then) awaited indirectly', async () => {

    const Foo = CustomElementResource.define({
      name: 'foo',
      template: `<template><div ref="div">bar</div></template>`
    }, class {
      $lifecycle: ILifecycle;
      attaching() {
        this.$lifecycle.registerTask({
          done: false,
          canCancel() {return false;},
          cancel() {},
          wait() {
            this.done = true;
            return Promise.resolve().then(() => {}).then(() => {}).then(() => {});
          }
        })
      }
    });

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><foo if.bind="true"></foo></template>`
    }, class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);
    container.register(<any>Foo);
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('');

    await Promise.resolve();

    expect(host.textContent).to.equal('');

    await Promise.resolve();

    expect(host.textContent).to.equal('bar');

    au.stop();

    expect(host.textContent).to.equal('');

    au.start();

    expect(host.textContent).to.equal('');

    await Promise.resolve();

    expect(host.textContent).to.equal('');

    await Promise.resolve();

    expect(host.textContent).to.equal('bar');

    au.stop();

    expect(host.textContent).to.equal('');
  });


  it('attached task (triple then) awaited directly', async () => {

    const Foo = CustomElementResource.define({
      name: 'foo',
      template: `<template><div ref="div">bar</div></template>`
    }, class {
      $lifecycle: ILifecycle;
      attaching() {
        this.$lifecycle.registerTask({
          done: false,
          canCancel() {return false;},
          cancel() {},
          wait() {
            this.done = true;
            return Promise.resolve().then(() => {}).then(() => {}).then(() => {});
          }
        })
      }
    });

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><foo if.bind="true"></foo></template>`
    }, class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);
    container.register(<any>Foo);
    const lifecycle = container.get(ILifecycle);
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    lifecycle.beginAttach();
    au.start();
    let task = lifecycle.endAttach(LifecycleFlags.fromStartTask);

    expect(host.textContent).to.equal('');

    await task.wait();

    expect(host.textContent).to.equal('bar');

    au.stop();

    expect(host.textContent).to.equal('');

    lifecycle.beginAttach();
    au.start();
    task = lifecycle.endAttach(LifecycleFlags.fromStartTask);

    expect(host.textContent).to.equal('');

    await task.wait();

    expect(host.textContent).to.equal('bar');

    au.stop();

    expect(host.textContent).to.equal('');
  });


  it('detached task awaited indirectly', async () => {

    const Foo = CustomElementResource.define({
      name: 'foo',
      template: `<template><div ref="div">bar</div></template>`
    }, class {
      $lifecycle: ILifecycle;
      detaching() {
        this.$lifecycle.registerTask({
          done: false,
          canCancel() {return false;},
          cancel() {},
          wait() {
            this.done = true;
            return Promise.resolve();
          }
        })
      }
    });

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><foo if.bind="true"></foo></template>`
    }, class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);
    container.register(<any>Foo);
    const lifecycle = container.get(ILifecycle);
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('bar');

    lifecycle.beginDetach();
    au.stop();
    lifecycle.endDetach(LifecycleFlags.fromStopTask);

    expect(host.textContent).to.equal('bar');
    await Promise.resolve();
    expect(host.textContent).to.equal('');

    au.start();

    expect(host.textContent).to.equal('bar');

    lifecycle.beginDetach();
    au.stop();
    lifecycle.endDetach(LifecycleFlags.fromStopTask);

    expect(host.textContent).to.equal('bar');
    await Promise.resolve();
    expect(host.textContent).to.equal('');

  });


  it('detached task awaited directly', async () => {

    const Foo = CustomElementResource.define({
      name: 'foo',
      template: `<template><div ref="div">bar</div></template>`
    }, class {
      $lifecycle: ILifecycle;
      detaching() {
        this.$lifecycle.registerTask({
          done: false,
          canCancel() {return false;},
          cancel() {},
          wait() {
            this.done = true;
            return Promise.resolve();
          }
        })
      }
    });

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><foo if.bind="true"></foo></template>`
    }, class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);
    container.register(<any>Foo);
    const lifecycle = container.get(ILifecycle);
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('bar');

    lifecycle.beginDetach();
    au.stop();
    let task = lifecycle.endDetach(LifecycleFlags.fromStopTask);

    expect(host.textContent).to.equal('bar');
    await task.wait();
    expect(host.textContent).to.equal('');

    au.start();

    expect(host.textContent).to.equal('bar');

    lifecycle.beginDetach();
    au.stop();
    task = lifecycle.endDetach(LifecycleFlags.fromStopTask);

    expect(host.textContent).to.equal('bar');
    await task.wait();
    expect(host.textContent).to.equal('');

  });


  it('detached task (triple then) awaited indirectly', async () => {

    const Foo = CustomElementResource.define({
      name: 'foo',
      template: `<template><div ref="div">bar</div></template>`
    }, class {
      $lifecycle: ILifecycle;
      detaching() {
        this.$lifecycle.registerTask({
          done: false,
          canCancel() {return false;},
          cancel() {},
          wait() {
            this.done = true;
            return Promise.resolve().then(() => {}).then(() => {}).then(() => {});
          }
        })
      }
    });

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><foo if.bind="true"></foo></template>`
    }, class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);
    container.register(<any>Foo);
    const lifecycle = container.get(ILifecycle);
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('bar');

    lifecycle.beginDetach();
    au.stop();
    lifecycle.endDetach(LifecycleFlags.fromStopTask);

    expect(host.textContent).to.equal('bar');
    await Promise.resolve();
    expect(host.textContent).to.equal('bar');
    await Promise.resolve();
    expect(host.textContent).to.equal('');

    au.start();

    expect(host.textContent).to.equal('bar');

    lifecycle.beginDetach();
    au.stop();
    lifecycle.endDetach(LifecycleFlags.fromStopTask);

    expect(host.textContent).to.equal('bar');
    await Promise.resolve();
    expect(host.textContent).to.equal('bar');
    await Promise.resolve();
    expect(host.textContent).to.equal('');
  });


  it('detached task (triple then) awaited directly', async () => {

    const Foo = CustomElementResource.define({
      name: 'foo',
      template: `<template><div ref="div">bar</div></template>`
    }, class {
      $lifecycle: ILifecycle;
      detaching() {
        this.$lifecycle.registerTask({
          done: false,
          canCancel() {return false;},
          cancel() {},
          wait() {
            this.done = true;
            return Promise.resolve().then(() => {}).then(() => {}).then(() => {});
          }
        })
      }
    });

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><foo if.bind="true"></foo></template>`
    }, class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);
    container.register(<any>Foo);
    const lifecycle = container.get(ILifecycle);
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('bar');

    lifecycle.beginDetach();
    au.stop();
    let task = lifecycle.endDetach(LifecycleFlags.fromStopTask);

    expect(host.textContent).to.equal('bar');
    await task.wait();
    expect(host.textContent).to.equal('');

    au.start();

    expect(host.textContent).to.equal('bar');

    lifecycle.beginDetach();
    au.stop();
    task = lifecycle.endDetach(LifecycleFlags.fromStopTask);

    expect(host.textContent).to.equal('bar');
    await task.wait();
    expect(host.textContent).to.equal('');
  });


  it('signaler', async () => {

    const items = [0,1,2];
    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><div repeat.for="i of 3">\${items[i] & signal:'updateItem'}</div></template>`
    }, class {
      items = items;
    });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);

    const signaler = container.get(ISignaler);
    const lifecycle = container.get(ILifecycle) as Lifecycle;
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('012');

    items[0] = 2;

    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('012');

    signaler.dispatchSignal('updateItem', LifecycleFlags.fromFlush);

    expect(host.textContent).to.equal('212');

  });


  it('signaler + oneTime', async () => {

    const items = [0,1,2];
    const App = CustomElementResource.define({
      name: 'app',
      template: `<template><div repeat.for="i of 3">\${items[i] & signal:'updateItem' & oneTime}</div></template>`
    }, class {
      items = items;
    });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);

    const signaler = container.get(ISignaler);
    const lifecycle = container.get(ILifecycle) as Lifecycle;
    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('012');

    items[0] = 2;

    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('012');

    signaler.dispatchSignal('updateItem', LifecycleFlags.fromFlush);

    expect(host.textContent).to.equal('212');

  });

  it('render hook', async () => {

    const App = CustomElementResource.define({
      name: 'app',
      template: `<template></template>`
    }, class {
      $nodes: INodeSequence;
      render() {
        this.$nodes = new NodeSequenceFactory(dom, 'foo').createNodeSequence();
      }
    });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('foo');

  });

  for (const [title, appMarkup, ceMarkup, appProp, ceProp, appValue, ceValue, target, expected] of [
    [
      `single, static`,
      `<div replace-part="bar">43</div>`,
      `<div replaceable part="bar">42</div>`,
      null,
      null,
      null,
      null,
      '',
      `43`
    ],
    [
      `multiple, static`,
      `<div replace-part="bar">43</div>`.repeat(2),
      `<div replaceable part="bar">42</div>`.repeat(2),
      null,
      null,
      null,
      null,
      '',
      `43`.repeat(2)
    ]
  ]) {
    it(`replaceable - ${title}`, () => {

      const App = defineCustomElement('app', `<template><foo>${appMarkup}</foo></template>`, class {});
      const Foo = defineCustomElement('foo', `<template>${ceMarkup}</template>`, class {});

      const container = DI.createContainer();
      container.register(<IRegistry>BasicConfiguration, <any>Foo);

      const au = new Aurelia(<any>container);

      const host = document.createElement('div');
      const component = new App();

      au.app({ host, component });

      au.start();

      expect(host.textContent).to.equal(expected);

    });
  }

  it(`replaceable - bind to target scope`, () => {

    const App = defineCustomElement('app', `<template><foo><div replace-part="bar">\${baz}</div></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><div replaceable part="bar"></div></template>`, <any>class { baz = 'abc' });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable - bind to parent scope`, () => {

    const App = defineCustomElement('app', `<template><foo><div replace-part="bar">\${baz}</div></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><div replaceable part="bar"></div></template>`, <any>class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('def');

  });

  it(`replaceable/template - bind to target scope`, () => {

    const App = defineCustomElement('app', `<template><foo><template replace-part="bar">\${baz}</template></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><template replaceable part="bar"></template></template>`, <any>class { baz = 'abc' });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable/template - bind to parent scope`, () => {

    const App = defineCustomElement('app', `<template><foo><template replace-part="bar">\${baz}</template></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><template replaceable part="bar"></template></template>`, <any>class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('def');

  });

  it(`replaceable/template - uses last on name conflict`, () => {

    const App = defineCustomElement('app', `<template><foo><template replace-part="bar">\${qux}</template><template replace-part="bar">\${baz}</template></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><template replaceable part="bar"></template></template>`, <any>class {});

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('def');

  });

  it(`replaceable/template - same part multiple times`, () => {

    const App = defineCustomElement('app', `<template><foo><template replace-part="bar">\${baz}</template></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><template replaceable part="bar"></template><template replaceable part="bar"></template></template>`, <any>class { baz = 'abc' });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abcabc');

  });

  // TODO: fix this scenario
  xit(`replaceable/template - parent template controller`, () => {

    const App = defineCustomElement('app', `<template><foo><template if.bind="true"><template replace-part="bar">\${baz}</template></template></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><template replaceable part="bar"></template></template>`, <any>class { baz = 'abc' });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable/template - sibling lefthand side template controller`, () => {

    const App = defineCustomElement('app', `<template><foo><template if.bind="true" replace-part="bar">\${baz}</template></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><template replaceable part="bar"></template></template>`, <any>class { baz = 'abc' });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable/template - sibling righthand side template controller`, () => {

    const App = defineCustomElement('app', `<template><foo><template replace-part="bar" if.bind="true">\${baz}</template></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><template replaceable part="bar"></template></template>`, <any>class { baz = 'abc' });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });

  it(`replaceable/template - sibling if/else with conflicting part names`, () => {

    const App = defineCustomElement('app', `<template><foo><template replace-part="bar" if.bind="true">\${baz}</template></foo><foo><template replace-part="bar" if.bind="false">\${baz}</template></foo></template>`, <any>class { baz = 'def' });
    const Foo = defineCustomElement('foo', `<template><template replaceable part="bar"></template></template>`, <any>class { baz = 'abc'; });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration, <any>Foo);

    const au = new Aurelia(<any>container);

    const host = document.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('abc');

  });
});

describe('xml node compiler tests', () => {
  // TODO: add some content assertions and verify different kinds of xml compilation
  // (for now these tests are just to ensure the binder doesn't hang or crash when given "unusual" node types)
  const markups = [
    '<?xml?>',
    '<?xml version="1.0" encoding="utf-8"?>',
    '<?xml?>\n<a/>',
    '<?xml?>\n<a>\n\v<b/>\n</a>',
    '<?go there?>',
    '<?go there?><?come here?>',
    '<!-- \t Hello, World! \t -->',
    '<!-- \t Hello \t -->\n<!-- \t World \t -->',
    '<![CDATA[ \t <foo></bar> \t ]]>',
    '<![CDATA[ \t data]]><![CDATA[< > " and & \t ]]>',
    '<!DOCTYPE note [\n<!ENTITY foo "baa">]>',
    '<a/>',
    '<a/>\n<a/>',
    '<a/>\n<b/>',
    '<a x="hello"/>',
    '<a x="1.234" y="It\'s"/>',
    '<a> \t Hi \t </a>',
    '<a>  Hi \n There \t </a>',
    '<a>\n\v<b/>\n</a>',
    '<a>\n\v<b>\n\v\v<c/>\n\v</b>\n</a>'
  ];

  for (const markup of markups) {
    it(markup, () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(markup, 'application/xml');
      const fakeSurrogate = { firstChild: doc, attributes: [] };

      const container = DI.createContainer();
      container.register(<IRegistry>BasicConfiguration);
      const resources = new ResourceModel(new RuntimeCompilationResources(<any>container));
      const attrParser = container.get(IAttributeParser) as IAttributeParser;
      const exprParser = container.get(IExpressionParser) as IExpressionParser;
      const binder = new TemplateBinder(resources, attrParser, <any>exprParser);

      const result = binder.bind(dom, <any>fakeSurrogate);
      expect(result.physicalNode).to.equal(fakeSurrogate);
    });
  }
});


describe("generated.template-compiler.static (with tracing)", function () {
  function setup() {
      enableTracing();
      Tracer.enableLiveLogging(SymbolTraceWriter);
      const container = DI.createContainer();
      container.register(BasicConfiguration);
      const au = new Aurelia(container);
      const host = document.createElement("div");
      return { au, host };
  }
  function verify(au, host, expected, description) {
      au.start();
      const outerHtmlAfterStart1 = host.outerHTML;
      expect(host.textContent).to.equal(expected, "after start #1");
      au.stop();
      const outerHtmlAfterStop1 = host.outerHTML;
      expect(host.textContent).to.equal("", "after stop #1");
      au.start();
      const outerHtmlAfterStart2 = host.outerHTML;
      expect(host.textContent).to.equal(expected, "after start #2");
      au.stop();
      const outerHtmlAfterStop2 = host.outerHTML;
      expect(host.textContent).to.equal("", "after stop #2");
      expect(outerHtmlAfterStart1).to.equal(outerHtmlAfterStart2, "outerHTML after start #1 / #2");
      expect(outerHtmlAfterStop1).to.equal(outerHtmlAfterStop2, "outerHTML after stop #1 / #2");

      console.log('\n'+stringifyTemplateDefinition(description, 0));
      disableTracing();
  }
  it("tag$01 text$01 _", function () {
      const { au, host } = setup();
      const App = CustomElementResource.define({ name: "app", template: "<template><div>a</div></template>" }, class {
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$01 text$03 _", function () {
      const { au, host } = setup();
      const App = CustomElementResource.define({ name: "app", template: "<template><div>${msg}</div></template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$02 text$01 _", function () {
      const { au, host } = setup();
      const App = CustomElementResource.define({ name: "app", template: "<template>a</template>" }, class {
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$02 text$03 _", function () {
      const { au, host } = setup();
      const App = CustomElementResource.define({ name: "app", template: "<template>${msg}</template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$03 text$03 _", function () {
      const { au, host } = setup();
      const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
          static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
          msg = "";
          not = "";
          item = "";
      });
      au.register(MyFoo);
      const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$04 text$03 _", function () {
      const { au, host } = setup();
      const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
          static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
          msg = "";
          not = "";
          item = "";
      });
      au.register(MyFoo);
      const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$05 text$03 _", function () {
      const { au, host } = setup();
      const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
          static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
          static containerless = true;
          msg = "";
          not = "";
          item = "";
      });
      au.register(MyFoo);
      const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$06 text$03 _", function () {
      const { au, host } = setup();
      const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
          static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
          static containerless = true;
          msg = "";
          not = "";
          item = "";
      });
      au.register(MyFoo);
      const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$07 text$03 _", function () {
      const { au, host } = setup();
      const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
          static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
          static shadowOptions = { mode: "open" };
          msg = "";
          not = "";
          item = "";
      });
      au.register(MyFoo);
      const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$08 text$03 _", function () {
      const { au, host } = setup();
      const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
          static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
          static shadowOptions = { mode: "open" };
          msg = "";
          not = "";
          item = "";
      });
      au.register(MyFoo);
      const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$09 text$03 _", function () {
      const { au, host } = setup();
      const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
          static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
          static shadowOptions = { mode: "closed" };
          msg = "";
          not = "";
          item = "";
      });
      au.register(MyFoo);
      const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
  it("tag$10 text$03 _", function () {
      const { au, host } = setup();
      const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
          static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
          static shadowOptions = { mode: "closed" };
          msg = "";
          not = "";
          item = "";
      });
      au.register(MyFoo);
      const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template>" }, class {
          msg = "a";
      });
      const component = new App();
      au.app({ host, component });
      verify(au, host, "a", App.description);
  });
});
