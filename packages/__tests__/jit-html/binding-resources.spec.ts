// import { HTMLTestContext, TestContext, setupAndStart, tearDown } from '@aurelia/testing';

// // TemplateCompiler - Binding Resources integration
// describe('binding-resources', function () {
//   let ctx: HTMLTestContext;

//   beforeEach(function () {
//     ctx = TestContext.createHTMLTestContext();
//   });

//   // debounceBindingBehavior - input.value
//   it('01.', done => {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.to-view="message & debounce:50"></template>`, null);
//     assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
//     component.message = 'hello!';
//     setTimeout(() => {
//       assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
//       component.message = 'hello!!';
//     },         25);
//     setTimeout(() => {
//       assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
//       component.message = 'hello!!!';
//     },         50);
//     setTimeout(() => {
//       assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
//     },         75);
//     setTimeout(() => {
//       assert.strictEqual(host.firstChild['value'], 'hello!!!', `host.firstChild['value']`);
//       tearDown(au, lifecycle, host);
//       done();
//     },         175);
//   });

//   // TODO: fix throttle
//   // it(`throttleBindingBehavior - input.value`, done => {
//   //   const { au, lifecycle, host, component } = setup(`<template><input value.to-view="message & throttle:50"></template>`);
//   //   au.app({ host, component }).start();
//   //   assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
//   //   component.message = 'hello!';
//   //   lifecycle.flush(LifecycleFlags.none);
//   //   assert.strictEqual(host.firstChild['value'], 'hello!', `host.firstChild['value']`);
//   //   component.message = 'hello!!';
//   //   lifecycle.flush(LifecycleFlags.none);
//   //   assert.strictEqual(host.firstChild['value'], 'hello!', `host.firstChild['value']`);
//   //   component.message = 'hello!!!';
//   //   lifecycle.flush(LifecycleFlags.none);
//   //   assert.strictEqual(host.firstChild['value'], 'hello!', `host.firstChild['value']`);
//   //   setTimeout(() => {
//   //     component.message = 'hello!!!!';
//   //     lifecycle.flush(LifecycleFlags.none);
//   //     assert.strictEqual(host.firstChild['value'], 'hello!!!!', `host.firstChild['value']`);
//   //     done();
//   //   }, 75);
//   // });
// });
