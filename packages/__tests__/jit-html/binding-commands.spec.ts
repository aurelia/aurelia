// import { Aurelia, CustomElement as CE, IViewModel, LifecycleFlags as LF } from '@aurelia/runtime';
// import { IEventManager } from '@aurelia/runtime-html';
// import { HTMLTestContext, TestContext, TestConfiguration, setupAndStart, setupWithDocumentAndStart, tearDown } from '@aurelia/testing';

// // TemplateCompiler - Binding Commands integration
// describe('binding-commands', function () {
//   let ctx: HTMLTestContext;

//   beforeEach(function () {
//     ctx = TestContext.createHTMLTestContext();
//   });

//   // textBinding - interpolation
//   it('01.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template>\${message}</template>`, null);
//     component.message = 'hello!';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.textContent, 'hello!', `host.textContent`);
//     tearDown(au, lifecycle, host);
//   });

//   // textBinding - interpolation with template
//   it('02.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template>\${\`\${message}\`}</template>`, null);
//     component.message = 'hello!';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.textContent, 'hello!', `host.textContent`);
//     tearDown(au, lifecycle, host);
//   });

//   // styleBinding - bind
//   it('03.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div style.bind="foo"></div></template>`, null);
//     component.foo = 'color: green;';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual((host.firstElementChild as HTMLElement).style.cssText, 'color: green;', `(host.firstElementChild as HTMLElement).style.cssText`);
//     tearDown(au, lifecycle, host);
//   });

//   // styleBinding - interpolation
//   it('04.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div style="\${foo}"></div></template>`, null);
//     component.foo = 'color: green;';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual((host.firstElementChild as HTMLElement).style.cssText, 'color: green;', `(host.firstElementChild as HTMLElement).style.cssText`);
//     tearDown(au, lifecycle, host);
//   });

//   // classBinding - bind
//   it('05.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div class.bind="foo"></div></template>`, null);
//     component.foo = 'foo bar';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual((host.firstElementChild as HTMLElement).classList.toString(), 'au foo bar', `(host.firstElementChild as HTMLElement).classList.toString()`);
//     tearDown(au, lifecycle, host);
//   });

//   // classBinding - interpolation
//   it('06.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div class="\${foo}"></div></template>`, null);
//     component.foo = 'foo bar';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual((host.firstElementChild as HTMLElement).classList.toString(), 'au foo bar', `(host.firstElementChild as HTMLElement).classList.toString()`);
//     tearDown(au, lifecycle, host);
//   });

//   // oneTimeBinding - input.value
//   it('07.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.one-time="message"></template>`, null);
//     component.message = 'hello!';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
//     tearDown(au, lifecycle, host);
//   });

//   // toViewBinding - input.value
//   it('08.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.to-view="message"></template>`, null);
//     component.message = 'hello!';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.firstChild['value'], 'hello!', `host.firstChild['value']`);
//     tearDown(au, lifecycle, host);
//   });

//   // fromViewBinding - input.value
//   it('09.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.from-view="message"></template>`, null);
//     component.message = 'hello!';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
//     host.firstChild['value'] = 'hello!';
//     host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
//     assert.strictEqual(component.message, 'hello!', `component.message`);
//     tearDown(au, lifecycle, host);
//   });

//   // twoWayBinding - input.value
//   it('10.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.two-way="message"></template>`, null);
//     host.firstChild['value'] = 'hello!';
//     assert.strictEqual(component.message, undefined, `component.message`);
//     host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
//     assert.strictEqual(component.message, 'hello!', `component.message`);
//     tearDown(au, lifecycle, host);
//   });

//   // twoWayBinding - input.value - jsonValueConverter
//   it('11.', function () {
//     ctx.container.register(TestConfiguration);
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.two-way="message | json"></template>`, null);
//     assert.strictEqual(component.message, undefined, `component.message`);
//     host.firstChild['value'] = '{"foo":"bar"}';
//     assert.strictEqual(component.message, undefined, `component.message`);
//     host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
//     assert.deepStrictEqual(component.message, { foo: 'bar' }, `component.message`);
//     component.message = { bar: 'baz' };
//     assert.strictEqual(host.firstChild['value'], '{"foo":"bar"}', `host.firstChild['value']`);
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.firstChild['value'], '{"bar":"baz"}', `host.firstChild['value']`);
//     tearDown(au, lifecycle, host);
//   });

//   // oneTimeBindingBehavior - input.value
//   it('12.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.to-view="message & oneTime"></template>`, null);
//     component.message = 'hello!';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
//     tearDown(au, lifecycle, host);
//   });

//   // toViewBindingBehavior - input.value
//   it('13.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.one-time="message & toView"></template>`, null);
//     component.message = 'hello!';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.firstChild['value'], 'hello!', `host.firstChild['value']`);
//     tearDown(au, lifecycle, host);
//   });

//   // fromViewBindingBehavior - input.value
//   it('14.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.one-time="message & fromView"></template>`, null);
//     component.message = 'hello!';
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
//     host.firstChild['value'] = 'hello!';
//     host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
//     assert.strictEqual(component.message, 'hello!', `component.message`);
//     tearDown(au, lifecycle, host);
//   });

//   // twoWayBindingBehavior - input.value
//   it('15.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.one-time="message & twoWay"></template>`, null);
//     assert.strictEqual(component.message, undefined, `component.message`);
//     host.firstChild['value'] = 'hello!';
//     assert.strictEqual(component.message, undefined, `component.message`);
//     host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
//     assert.strictEqual(component.message, 'hello!', `component.message`);
//     tearDown(au, lifecycle, host);
//   });

//   // toViewBinding - input checkbox
//   it('16.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input checked.to-view="checked" type="checkbox"></template>`, null);
//     assert.strictEqual(host.firstChild['checked'], false, `host.firstChild['checked']`);
//     component.checked = true;
//     assert.strictEqual(host.firstChild['checked'], false, `host.firstChild['checked']`);
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.firstChild['checked'], true, `host.firstChild['checked']`);
//     tearDown(au, lifecycle, host);
//   });

//   // twoWayBinding - input checkbox
//   it('17.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input checked.two-way="checked" type="checkbox"></template>`, null);
//     assert.strictEqual(component.checked, undefined, `component.checked`);
//     host.firstChild['checked'] = true;
//     assert.strictEqual(component.checked, undefined, `component.checked`);
//     host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
//     assert.strictEqual(component.checked, true, `component.checked`);
//     tearDown(au, lifecycle, host);
//   });

//   // trigger - button
//   it('18.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><button click.trigger="doStuff()"></button></template>`, null);
//     component.doStuff = spy();
//     host.firstChild.dispatchEvent(new ctx.CustomEvent('click'));
//     expect(component.doStuff).to.have.been.called;
//     tearDown(au, lifecycle, host);
//   });

//   // delegate - button
//   it('19.', function () {
//     const { au, lifecycle, host, component } = setupWithDocumentAndStart(ctx, `<template><button click.delegate="doStuff()"></button></template>`, null);
//     try {
//       component.doStuff = spy();
//       host.firstChild.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));
//       expect(component.doStuff).to.have.been.called;
//     } finally {
//       const em = ctx.container.get(IEventManager);
//       em.dispose();
//       tearDown(au, lifecycle, host);
//     }
//   });

//   // capture - button
//   it('20.', function () {
//     const { au, lifecycle, host, component } = setupWithDocumentAndStart(ctx, `<template><button click.capture="doStuff()"></button></template>`, null);
//     try {
//       component.doStuff = spy();
//       host.firstChild.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));
//       expect(component.doStuff).to.have.been.called;
//     } finally {
//       const em = ctx.container.get(IEventManager);
//       em.dispose();
//       tearDown(au, lifecycle, host);
//     }
//   });

//   // two-way bindings between multiple custom elements
//   it('100', function () {
//     const App = CE.define(
//       {
//         name: 'app',
//         template: '${a}<foo b.two-way="a"></foo>',
//         dependencies: [
//           CE.define(
//             {
//               name: 'foo',
//               template: '${b}',
//               bindables: ['b']
//             },
//             class {
//               public b: string;

//               public attached(this: this & IViewModel<Node>): void {
//                 assert.strictEqual(this.b, 'x', `this.b`);
//                 assert.strictEqual(this.$host.textContent, 'x', `this.$host.textContent`);
//                 this.b = 'y';
//               }
//             }
//           )
//         ]
//       },
//       class {
//         public a: string;

//         public bound(this: this & IViewModel<Node>): void {
//           assert.strictEqual(this.a, 'x', `this.a`);
//         }

//         public attached(this: this & IViewModel<Node>): void {
//           assert.strictEqual(this.a, 'y', `this.a`);
//           assert.strictEqual(this.$host.textContent, 'xx', `this.$host.textContent`);
//         }
//       }
//     );

//     const host = ctx.createElement('div');
//     const component = new App();

//     component.a = 'x';

//     const au = new Aurelia(ctx.container);
//     au.app({ host, component });
//     au.start();

//     assert.strictEqual(host.textContent, 'xx', `host.textContent`);

//     ctx.lifecycle.processFlushQueue(LF.none);

//     assert.strictEqual(component.a, 'y', `component.a`);
//     assert.strictEqual(host.textContent, 'yy', `host.textContent`);
//   });
// });
