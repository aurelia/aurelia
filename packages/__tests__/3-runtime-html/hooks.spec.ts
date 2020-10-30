// import { Aurelia, CustomElement, ILifecycle, LifecycleFlags } from '@aurelia/runtime';
// import { TestContext } from '@aurelia/testing';

// describe('hooks', function () {
//   it('test', function () {
//     const rows: any[] = [
//       {
//         show: true,
//         prop1: { text1: 'p011', text2: 'p012' },
//         prop2: { text1: 'p021', text2: 'p022' },
//         prop3: { text1: 'p031', text2: 'p032' },
//         prop4: { text1: 'p041', text2: 'p042' },
//         prop5: { text1: 'p051', text2: 'p052' }
//       },
//       {
//         show: true,
//         prop1: { text1: 'p111', text2: 'p112' },
//         prop2: { text1: 'p121', text2: 'p122' },
//         prop3: { text1: 'p131', text2: 'p132' },
//         prop4: { text1: 'p141', text2: 'p142' },
//         prop5: { text1: 'p151', text2: 'p152' }
//       },
//       {
//         show: true,
//         prop1: { text1: 'p211', text2: 'p212' },
//         prop2: { text1: 'p221', text2: 'p222' },
//         prop3: { text1: 'p231', text2: 'p232' },
//         prop4: { text1: 'p241', text2: 'p242' },
//         prop5: { text1: 'p251', text2: 'p252' }
//       },
//       {
//         show: true,
//         prop1: { text1: 'p311', text2: 'p312' },
//         prop2: { text1: 'p321', text2: 'p322' },
//         prop3: { text1: 'p331', text2: 'p332' },
//         prop4: { text1: 'p341', text2: 'p342' },
//         prop5: { text1: 'p351', text2: 'p352' }
//       },
//       {
//         show: true,
//         prop1: { text1: 'p411', text2: 'p412' },
//         prop2: { text1: 'p421', text2: 'p422' },
//         prop3: { text1: 'p431', text2: 'p432' },
//         prop4: { text1: 'p441', text2: 'p442' },
//         prop5: { text1: 'p451', text2: 'p452' }
//       },
//       {
//         show: true,
//         prop1: { text1: 'p511', text2: 'p512' },
//         prop2: { text1: 'p521', text2: 'p522' },
//         prop3: { text1: 'p531', text2: 'p532' },
//         prop4: { text1: 'p541', text2: 'p542' },
//         prop5: { text1: 'p551', text2: 'p552' }
//       },
//     ];

//     const cols: any[] = [
//       { name: 'prop1', show: true },
//       { name: 'prop2', show: true },
//       { name: 'prop3', show: true },
//       { name: 'prop4', show: true },
//       { name: 'prop5', show: true }
//     ];

//     function getDisplayText() {
//       let result = '';
//       for (const row of rows) {
//         for (const col of cols) {
//           if (row.show && col.show) {
//             result += row[col.name] && row[col.name].text1;
//           } else {
//             result += row[col.name] && row[col.name].text2;
//           }
//         }
//       }
//       return result;
//     }

//     const Col = CustomElement.define({
//       name: 'col',
//       template: `<template><template if.bind="row.show && col.show">\${row[col.name].text1}</template><template else>\${row[col.name].text2}</template></template>`
//     },                                       class {
//       public static bindables = { row: { property: 'row', attribute: 'row' }, col: { property: 'col', attribute: 'col' } };
//       public row: any;
//       public col: any;
//       public created() {
//         return;
//       }
//       public binding() {
//         return;
//       }
//       public bound() {
//         return;
//       }
//       public beforeAttach() {
//         return;
//       }
//       public attached() {
//         return;
//       }
//       public detaching() {
//         return;
//       }
//       public afterDetachChildren() {
//         return;
//       }
//       public unbinding() {
//         return;
//       }
//       public afterUnbindChildren() {
//         return;
//       }
//     });

//     const Row = CustomElement.define({
//       name: 'row',
//       template: `<template><col repeat.for="col of cols" col.bind="col" row.bind="row"></col></template>`
//     },                                       class {
//       public static bindables = { row: { property: 'row', attribute: 'row' }, cols: { property: 'cols', attribute: 'cols' } };
//       public row: any;
//       public cols: any[];
//       public created() {
//         return;
//       }
//       public binding() {
//         return;
//       }
//       public bound() {
//         return;
//       }
//       public beforeAttach() {
//         return;
//       }
//       public attached() {
//         return;
//       }
//       public detaching() {
//         return;
//       }
//       public afterDetachChildren() {
//         return;
//       }
//       public unbinding() {
//         return;
//       }
//       public afterUnbindChildren() {
//         return;
//       }
//     });

//     const CustomTable = CustomElement.define({
//       name: 'custom-table',
//       template: `<template><row repeat.for="row of rows" row.bind="row" cols.bind="cols"></row></template>`
//     },                                               class {
//       public static bindables = { rows: { property: 'rows', attribute: 'rows' }, cols: { property: 'cols', attribute: 'cols' } };
//       public rows: any[];
//       public cols: any[];
//       public created() {
//         return;
//       }
//       public binding() {
//         return;
//       }
//       public bound() {
//         return;
//       }
//       public beforeAttach() {
//         return;
//       }
//       public attached() {
//         return;
//       }
//       public detaching() {
//         return;
//       }
//       public afterDetachChildren() {
//         return;
//       }
//       public unbinding() {
//         return;
//       }
//       public afterUnbindChildren() {
//         return;
//       }
//     });

//     const App = CustomElement.define({
//       name: 'app',
//       template: `<template><custom-table rows.bind="rows" cols.bind="cols"></custom-table></template>`
//     },                                       class {
//       public rows = rows;
//       public cols = cols;
//       public created() {
//         return;
//       }
//       public binding() {
//         return;
//       }
//       public bound() {
//         return;
//       }
//       public beforeAttach() {
//         return;
//       }
//       public attached() {
//         return;
//       }
//       public detaching() {
//         return;
//       }
//       public afterDetachChildren() {
//         return;
//       }
//       public unbinding() {
//         return;
//       }
//       public afterUnbindChildren() {
//         return;
//       }
//     });

//     const ctx = TestContext.createHTMLTestContext();
//     ctx.container.register(Col, Row, CustomTable);
//     const lifecycle = ctx.lifecycle;
//     const au = new Aurelia(ctx.container);

//     const host = ctx.createElement('div');
//     const component = new App();

//     au.app({ host, component });
//     au.start();

//     const text1 = getDisplayText();
//     assert.strictEqual(host.textContent, text1, `host.textContent`);

//     cols[0].show = false;
//     cols[3].show = false;
//     rows[2].show = false;
//     rows[4].show = false;
//     rows.push({
//       show: true,
//       prop1: { text1: 'p611', text2: 'p612' },
//       prop2: { text1: 'p621', text2: 'p622' },
//       prop3: { text1: 'p631', text2: 'p632' },
//       prop4: { text1: 'p641', text2: 'p642' },
//       prop5: { text1: 'p651', text2: 'p652' },
//       prop6: { text1: 'p661', text2: 'p662' },
//       prop7: { text1: 'p671', text2: 'p672' }
//     });
//     cols.push({ name: 'prop7', show: true });

//     const text2 = getDisplayText();

//     assert.strictEqual(host.textContent, text1, `host.textContent`);

//     lifecycle.processFlushQueue(LifecycleFlags.none);

//     assert.strictEqual(host.textContent, text2, `host.textContent`);

//     au.stop();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     au.start();

//     assert.strictEqual(host.textContent, text2, `host.textContent`);

//   });

//   it('attached task awaited indirectly', async function () {

//     const Foo = CustomElement.define({
//       name: 'foo',
//       template: `<template><div ref="div">bar</div></template>`
//     },                                       class {
//       public $lifecycle: ILifecycle;
//       public beforeAttach() {
//         this.$lifecycle.registerTask({
//           done: false,
//           canCancel() { return false; },
//           cancel() { return; },
//           wait() {
//             this.done = true;
//             return Promise.resolve();
//           }
//         });
//       }
//     });

//     const App = CustomElement.define({
//       name: 'app',
//       template: `<template><foo if.bind="true"></foo></template>`
//     },                                       class {});

//     const ctx = TestContext.createHTMLTestContext();
//     ctx.container.register(Foo);
//     const au = new Aurelia(ctx.container);

//     const host = ctx.createElement('div');
//     const component = new App();

//     au.app({ host, component });

//     au.start();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await Promise.resolve();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     au.stop();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     au.start();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await Promise.resolve();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     au.stop();

//     assert.strictEqual(host.textContent, '', `host.textContent`);
//   });

//   it('attached task awaited directly', async function () {

//     const Foo = CustomElement.define({
//       name: 'foo',
//       template: `<template><div ref="div">bar</div></template>`
//     },                                       class {
//       public $lifecycle: ILifecycle;
//       public beforeAttach() {
//         this.$lifecycle.registerTask({
//           done: false,
//           canCancel() { return false; },
//           cancel() { return; },
//           wait() {
//             this.done = true;
//             return Promise.resolve();
//           }
//         });
//       }
//     });

//     const App = CustomElement.define({
//       name: 'app',
//       template: `<template><foo if.bind="true"></foo></template>`
//     },                                       class {});

//     const ctx = TestContext.createHTMLTestContext();
//     ctx.container.register(Foo);
//     const lifecycle = ctx.lifecycle;
//     const au = new Aurelia(ctx.container);

//     const host = ctx.createElement('div');
//     const component = new App();

//     au.app({ host, component });

//     lifecycle.beginAttach();
//     au.start();
//     let task = lifecycle.endAttach(LifecycleFlags.fromStartTask);

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await task.wait();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     au.stop();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     lifecycle.beginAttach();
//     au.start();
//     task = lifecycle.endAttach(LifecycleFlags.fromStartTask);

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await task.wait();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     au.stop();

//     assert.strictEqual(host.textContent, '', `host.textContent`);
//   });

//   it('attached task (triple then) awaited indirectly', async function () {

//     const Foo = CustomElement.define({
//       name: 'foo',
//       template: `<template><div ref="div">bar</div></template>`
//     },                                       class {
//       public $lifecycle: ILifecycle;
//       public beforeAttach() {
//         this.$lifecycle.registerTask({
//           done: false,
//           canCancel() { return false; },
//           cancel() { return; },
//           wait() {
//             this.done = true;
//             return Promise.resolve().then(() => { return; }).then(() => { return; }).then(() => { return; });
//           }
//         });
//       }
//     });

//     const App = CustomElement.define({
//       name: 'app',
//       template: `<template><foo if.bind="true"></foo></template>`
//     },                                       class {});

//     const ctx = TestContext.createHTMLTestContext();
//     ctx.container.register(Foo);
//     const au = new Aurelia(ctx.container);

//     const host = ctx.createElement('div');
//     const component = new App();

//     au.app({ host, component });

//     au.start();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await Promise.resolve();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await Promise.resolve();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     au.stop();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     au.start();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await Promise.resolve();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await Promise.resolve();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     au.stop();

//     assert.strictEqual(host.textContent, '', `host.textContent`);
//   });

//   it('attached task (triple then) awaited directly', async function () {

//     const Foo = CustomElement.define({
//       name: 'foo',
//       template: `<template><div ref="div">bar</div></template>`
//     },                                       class {
//       public $lifecycle: ILifecycle;
//       public beforeAttach() {
//         this.$lifecycle.registerTask({
//           done: false,
//           canCancel() { return false; },
//           cancel() { return; },
//           wait() {
//             this.done = true;
//             return Promise.resolve().then(() => { return; }).then(() => {return; }).then(() => { return; });
//           }
//         });
//       }
//     });

//     const App = CustomElement.define({
//       name: 'app',
//       template: `<template><foo if.bind="true"></foo></template>`
//     },                                       class {});

//     const ctx = TestContext.createHTMLTestContext();
//     ctx.container.register(Foo);
//     const lifecycle = ctx.lifecycle;
//     const au = new Aurelia(ctx.container);

//     const host = ctx.createElement('div');
//     const component = new App();

//     au.app({ host, component });

//     lifecycle.beginAttach();
//     au.start();
//     let task = lifecycle.endAttach(LifecycleFlags.fromStartTask);

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await task.wait();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     au.stop();

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     lifecycle.beginAttach();
//     au.start();
//     task = lifecycle.endAttach(LifecycleFlags.fromStartTask);

//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     await task.wait();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     au.stop();

//     assert.strictEqual(host.textContent, '', `host.textContent`);
//   });

//   it('afterDetachChildren task awaited indirectly', async function () {

//     const Foo = CustomElement.define({
//       name: 'foo',
//       template: `<template><div ref="div">bar</div></template>`
//     },                                       class {
//       public $lifecycle: ILifecycle;
//       public detaching() {
//         this.$lifecycle.registerTask({
//           done: false,
//           canCancel() { return false; },
//           cancel() { return; },
//           wait() {
//             this.done = true;
//             return Promise.resolve();
//           }
//         });
//       }
//     });

//     const App = CustomElement.define({
//       name: 'app',
//       template: `<template><foo if.bind="true"></foo></template>`
//     },                                       class {});

//     const ctx = TestContext.createHTMLTestContext();
//     ctx.container.register(Foo);
//     const lifecycle = ctx.lifecycle;
//     const au = new Aurelia(ctx.container);

//     const host = ctx.createElement('div');
//     const component = new App();

//     au.app({ host, component });

//     au.start();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     lifecycle.beginDetach();
//     au.stop();
//     lifecycle.endDetach(LifecycleFlags.fromStopTask);

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await Promise.resolve();
//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     au.start();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     lifecycle.beginDetach();
//     au.stop();
//     lifecycle.endDetach(LifecycleFlags.fromStopTask);

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await Promise.resolve();
//     assert.strictEqual(host.textContent, '', `host.textContent`);

//   });

//   it('afterDetachChildren task awaited directly', async function () {

//     const Foo = CustomElement.define({
//       name: 'foo',
//       template: `<template><div ref="div">bar</div></template>`
//     },                                       class {
//       public $lifecycle: ILifecycle;
//       public detaching() {
//         this.$lifecycle.registerTask({
//           done: false,
//           canCancel() { return false; },
//           cancel() { return; },
//           wait() {
//             this.done = true;
//             return Promise.resolve();
//           }
//         });
//       }
//     });

//     const App = CustomElement.define({
//       name: 'app',
//       template: `<template><foo if.bind="true"></foo></template>`
//     },                                       class {});

//     const ctx = TestContext.createHTMLTestContext();
//     ctx.container.register(Foo);
//     const lifecycle = ctx.lifecycle;
//     const au = new Aurelia(ctx.container);

//     const host = ctx.createElement('div');
//     const component = new App();

//     au.app({ host, component });

//     au.start();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     lifecycle.beginDetach();
//     au.stop();
//     let task = lifecycle.endDetach(LifecycleFlags.fromStopTask);

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await task.wait();
//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     au.start();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     lifecycle.beginDetach();
//     au.stop();
//     task = lifecycle.endDetach(LifecycleFlags.fromStopTask);

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await task.wait();
//     assert.strictEqual(host.textContent, '', `host.textContent`);

//   });

//   it('afterDetachChildren task (triple then) awaited indirectly', async function () {

//     const Foo = CustomElement.define({
//       name: 'foo',
//       template: `<template><div ref="div">bar</div></template>`
//     },                                       class {
//       public $lifecycle: ILifecycle;
//       public detaching() {
//         this.$lifecycle.registerTask({
//           done: false,
//           canCancel() { return false; },
//           cancel() { return; },
//           wait() {
//             this.done = true;
//             return Promise.resolve().then(() => { return; }).then(() => { return; }).then(() => { return; });
//           }
//         });
//       }
//     });

//     const App = CustomElement.define({
//       name: 'app',
//       template: `<template><foo if.bind="true"></foo></template>`
//     },                                       class {});

//     const ctx = TestContext.createHTMLTestContext();
//     ctx.container.register(Foo);
//     const lifecycle = ctx.lifecycle;
//     const au = new Aurelia(ctx.container);

//     const host = ctx.createElement('div');
//     const component = new App();

//     au.app({ host, component });

//     au.start();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     lifecycle.beginDetach();
//     au.stop();
//     lifecycle.endDetach(LifecycleFlags.fromStopTask);

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await Promise.resolve();
//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await Promise.resolve();
//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     au.start();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     lifecycle.beginDetach();
//     au.stop();
//     lifecycle.endDetach(LifecycleFlags.fromStopTask);

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await Promise.resolve();
//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await Promise.resolve();
//     assert.strictEqual(host.textContent, '', `host.textContent`);
//   });

//   it('afterDetachChildren task (triple then) awaited directly', async function () {

//     const Foo = CustomElement.define({
//       name: 'foo',
//       template: `<template><div ref="div">bar</div></template>`
//     },                                       class {
//       public $lifecycle: ILifecycle;
//       public detaching() {
//         this.$lifecycle.registerTask({
//           done: false,
//           canCancel() { return false; },
//           cancel() { return; },
//           wait() {
//             this.done = true;
//             return Promise.resolve().then(() => { return; }).then(() => { return; }).then(() => {return; });
//           }
//         });
//       }
//     });

//     const App = CustomElement.define({
//       name: 'app',
//       template: `<template><foo if.bind="true"></foo></template>`
//     },                                       class {});

//     const ctx = TestContext.createHTMLTestContext();
//     ctx.container.register(Foo);
//     const lifecycle = ctx.lifecycle;
//     const au = new Aurelia(ctx.container);

//     const host = ctx.createElement('div');
//     const component = new App();

//     au.app({ host, component });

//     au.start();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     lifecycle.beginDetach();
//     au.stop();
//     let task = lifecycle.endDetach(LifecycleFlags.fromStopTask);

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await task.wait();
//     assert.strictEqual(host.textContent, '', `host.textContent`);

//     au.start();

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);

//     lifecycle.beginDetach();
//     au.stop();
//     task = lifecycle.endDetach(LifecycleFlags.fromStopTask);

//     assert.strictEqual(host.textContent, 'bar', `host.textContent`);
//     await task.wait();
//     assert.strictEqual(host.textContent, '', `host.textContent`);
//   });
// });
