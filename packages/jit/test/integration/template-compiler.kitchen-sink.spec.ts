import { expect } from 'chai';
import { tearDown, setupAndStart, cleanup, defineCustomElement } from './prepare';
import { baseSuite } from './template-compiler.base';
import { IContainer, Constructable, DI, IRegistry } from '../../../kernel/src/index';;
import { Aurelia, ICustomElementType, ILifecycle, CustomElementResource, DOM, ISignaler, Lifecycle, TextNodeSequence } from '../../../runtime/src/index';
import { LifecycleFlags } from '../../../runtime/src/index';
import { BasicConfiguration } from '../../src/index';
import { INodeSequence, NodeSequenceFactory } from '@aurelia/runtime';

const spec = 'template-compiler.kitchen-sink';

// TemplateCompiler - integration with various different parts
describe(spec, () => {
  it('startup with App type', () => {
    const component = CustomElementResource.define({ name: 'app', template: `<template>\${message}</template>` }, class { message = 'Hello!' });
    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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

    const host = DOM.createElement('div');
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
        this.$nodes = NodeSequenceFactory.createFor('foo').createNodeSequence();
      }
    });

    const container = DI.createContainer();
    container.register(<IRegistry>BasicConfiguration);

    const au = new Aurelia(<any>container);

    const host = DOM.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    expect(host.textContent).to.equal('foo');

  });
});
