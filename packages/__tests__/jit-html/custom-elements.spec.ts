// import {
//   Aurelia,
//   bindable,
//   Binding,
//   customElement,
//   CustomElementResource,
//   InterpolationBinding,
//   LifecycleFlags,
//   PropertyAccessor,
//   SelfObserver,
//   SetterObserver
// } from '@aurelia/runtime';
// import { ElementPropertyAccessor } from '@aurelia/runtime-html';
// import { HTMLTestContext, TestContext, TestConfiguration, setupAndStart, tearDown } from '@aurelia/testing';

// // TemplateCompiler - custom element integration
// describe('custom-elements', function () {
//   let ctx: HTMLTestContext;

//   beforeEach(function () {
//     ctx = TestContext.createHTMLTestContext();
//   });

//   // custom elements
//   it('01.', function () {
//     ctx.container.register(TestConfiguration);
//     const { au, lifecycle, host } = setupAndStart(ctx, `<template><name-tag name="bigopon"></name-tag></template>`, null);

//     assert.strictEqual(host.textContent, 'bigopon', `host.textContent`);

//     tearDown(au, lifecycle, host);
//   });

//   //[as-element]
//   describe('02.', function () {

//     //works with custom element with [as-element]
//     it('01.', function () {
//       ctx.container.register(TestConfiguration);
//       const { au, lifecycle, host } = setupAndStart(ctx, `<template><div as-element="name-tag" name="bigopon"></div></template>`, null);

//       assert.strictEqual(host.textContent, 'bigopon', `host.textContent`);

//       tearDown(au, lifecycle, host);
//     });

//     //ignores tag name
//     it('02.', function () {
//       ctx.container.register(TestConfiguration);
//       const { au, lifecycle, host } = setupAndStart(ctx, `<template><name-tag as-element="div" name="bigopon">Fred</name-tag></template>`, null);

//       assert.strictEqual(host.textContent, 'Fred', `host.textContent`);

//       tearDown(au, lifecycle, host);
//     });
//   });

//   //<let/>
//   it('03.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, '<template><let full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>', null);
//     assert.strictEqual(host.textContent, 'undefined undefined', `host.textContent`);

//     component.firstName = 'bi';
//     component.lastName = 'go';

//     assert.strictEqual(host.textContent, 'undefined undefined', `host.textContent`);

//     lifecycle.processFlushQueue(LifecycleFlags.none);

//     assert.strictEqual(host.textContent, 'bi go', `host.textContent`);

//     tearDown(au, lifecycle, host);
//   });

//   //<let [to-view-model] />
//   it('04.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(ctx, '<template><let to-view-model full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>', null);
//     component.firstName = 'bi';
//     assert.strictEqual(component.fullName, 'bi undefined', `component.fullName`);
//     component.lastName = 'go';
//     assert.strictEqual(component.fullName, 'bi go', `component.fullName`);
//     lifecycle.processFlushQueue(LifecycleFlags.none);
//     assert.strictEqual(host.textContent, 'bi go', `host.textContent`);
//     tearDown(au, lifecycle, host);
//   });

//   //initial values propagate through multiple nested custom elements connected via bindables
//   it('05.', function () {
//     let boundCalls = 0;

//     @customElement({ name: 'foo1', template: `<template><foo2 value.bind="value" value2.bind="value1"></foo2>\${value}</template>` })
//     class Foo1 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo1.this.value', `this.value`);
//         assert.strictEqual(this.value1, 'w00t1', 'Foo1.this.value1', `this.value1`);
//         boundCalls++;
//       }
//       public valueChanged(newValue: any): void {
//         this.value1 = `${newValue}1`;
//       }
//     }

//     @customElement({ name: 'foo2', template: `<template><foo3 value.bind="value" value2.bind="value2"></foo3>\${value}</template>` })
//     class Foo2 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo2.this.value', `this.value`);
//         assert.strictEqual(this.value1, 'w00t1', 'Foo2.this.value1', `this.value1`);
//         assert.strictEqual(this.value2, 'w00t1', 'Foo2.this.value2', `this.value2`);
//         boundCalls++;
//       }
//       public valueChanged(newValue: any): void {
//         this.value1 = `${newValue}1`;
//       }
//     }

//     @customElement({ name: 'foo3', template: `<template><foo4 value.bind="value" value2.bind="value2"></foo4>\${value}</template>` })
//     class Foo3 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo3.this.value', `this.value`);
//         assert.strictEqual(this.value1, 'w00t1', 'Foo3.this.value1', `this.value1`);
//         assert.strictEqual(this.value2, 'w00t1', 'Foo3.this.value2', `this.value2`);
//         boundCalls++;
//       }
//       public valueChanged(newValue: any): void {
//         this.value1 = `${newValue}1`;
//       }
//     }

//     @customElement({ name: 'foo4', template: `<template><foo5 value.bind="value" value2.bind="value2"></foo5>\${value}</template>` })
//     class Foo4 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo4.this.value', `this.value`);
//         assert.strictEqual(this.value1, 'w00t1', 'Foo4.this.value1', `this.value1`);
//         assert.strictEqual(this.value2, 'w00t1', 'Foo4.this.value2', `this.value2`);
//         boundCalls++;
//       }
//       public valueChanged(newValue: any): void {
//         this.value1 = `${newValue}1`;
//       }
//     }

//     @customElement({ name: 'foo5', template: `<template>\${value}</template>` })
//     class Foo5 {
//       @bindable()
//       public value: any;
//       public value1: any;
//       @bindable()
//       public value2: any;
//       public bound(): void {
//         assert.strictEqual(this.value, 'w00t', 'Foo5.this.value', `this.value`);
//         assert.strictEqual(this.value1, 'w00t1', 'Foo5.this.value1', `this.value1`);
//         assert.strictEqual(this.value2, 'w00t1', 'Foo5.this.value2', `this.value2`);
//         boundCalls++;
//       }
//       public valueChanged(newValue: any): void {
//         this.value1 = `${newValue}1`;
//       }
//     }

//     const customElementCtors: any[] = [Foo1, Foo2, Foo3, Foo4, Foo5];
//     const { container, lifecycle } = ctx;
//     container.register(...customElementCtors);
//     container.register(TestConfiguration);
//     const host = ctx.createElement('app');
//     const au = new Aurelia(container);
//     const App = CustomElementResource.define({ name: 'app', template: '<template><foo1 value.bind="value"></foo1>\${value}</template>' }, null);
//     const component = new App();
//     component.value = 'w00t';
//     au.app({ host, component }).start();

//     assert.strictEqual(boundCalls, 5, `boundCalls`);

//     let i = 0;
//     let current = component;
//     let cur: any;
//     while (i < 5) {
//       const childCtor = customElementCtors[i];
//       expect(current.$componentHead).to.be.a('object');
//       assert.strictEqual(current.$componentHead, current.$componentTail, `current.$componentHead`);
//       assert.instanceOf(current.$componentHead, childCtor, `current.$componentHead`);

//       switch (i) {
//         case 0: // root component -> foo1
//           cur = current.$bindingHead;
//           assert.instanceOf(cur, Binding, `cur`);
//           assert.instanceOf(cur._observer0, SetterObserver, `cur._observer0`);
//           assert.strictEqual(cur._observer1, undefined, `cur._observer1`);
//           assert.instanceOf(cur.targetObserver, PropertyAccessor, `cur.targetObserver`);

//           cur = cur.$nextBinding;
//           assert.instanceOf(cur, InterpolationBinding, `cur`);
//           assert.strictEqual(cur.target.nodeName, '#text', `cur.target.nodeName`);
//           assert.instanceOf(cur.targetObserver, ElementPropertyAccessor, `cur.targetObserver`);
//           assert.strictEqual(cur.$nextBinding, null, 'cur.$nextBinding', `cur.$nextBinding`);

//           cur = current = current.$componentHead;
//           assert.instanceOf(cur, childCtor, `cur.$componentHead ${i}`, `cur`);
//           break;
//         case 1: // foo1 -> foo2
//           cur = current.$bindingHead;
//           assert.instanceOf(cur, Binding, `cur`);
//           assert.instanceOf(cur._observer0, SelfObserver, `cur._observer0`);
//           assert.strictEqual(cur._observer1, undefined, `cur._observer1`);
//           assert.instanceOf(cur.targetObserver, PropertyAccessor, `cur.targetObserver`);

//           cur = cur.$nextBinding;
//           assert.instanceOf(cur, Binding, `cur`);
//           assert.instanceOf(cur._observer0, SetterObserver, `cur._observer0`);
//           assert.strictEqual(cur._observer1, undefined, `cur._observer1`);
//           assert.instanceOf(cur.targetObserver, PropertyAccessor, `cur.targetObserver`);

//           cur = cur.$nextBinding;
//           assert.instanceOf(cur, InterpolationBinding, `cur`);
//           assert.strictEqual(cur.target.nodeName, '#text', `cur.target.nodeName`);
//           assert.instanceOf(cur.targetObserver, ElementPropertyAccessor, `cur.targetObserver`);
//           assert.strictEqual(cur.$nextBinding, null, 'cur.$nextBinding', `cur.$nextBinding`);

//           cur = current = current.$componentHead;
//           assert.instanceOf(cur, childCtor, `cur.$componentHead ${i}`, `cur`);
//           break;
//         case 2:
//         case 3:
//         case 4: // foo2 -> foo3-5
//           cur = current.$bindingHead;
//           assert.instanceOf(cur, Binding, `cur`);
//           assert.instanceOf(cur._observer0, SelfObserver, `cur._observer0`);
//           assert.strictEqual(cur._observer1, undefined, `cur._observer1`);
//           assert.instanceOf(cur.targetObserver, PropertyAccessor, `cur.targetObserver`);

//           cur = cur.$nextBinding;
//           assert.instanceOf(cur, Binding, `cur`);
//           assert.instanceOf(cur._observer0, SelfObserver, `cur._observer0`);
//           assert.strictEqual(cur._observer1, undefined, `cur._observer1`);
//           assert.instanceOf(cur.targetObserver, PropertyAccessor, `cur.targetObserver`);

//           cur = cur.$nextBinding;
//           assert.instanceOf(cur, InterpolationBinding, `cur`);
//           assert.strictEqual(cur.target.nodeName, '#text', `cur.target.nodeName`);
//           assert.instanceOf(cur.targetObserver, ElementPropertyAccessor, `cur.targetObserver`);
//           assert.strictEqual(cur.$nextBinding, null, 'cur.$nextBinding', `cur.$nextBinding`);

//           cur = current = current.$componentHead;
//           assert.instanceOf(cur, childCtor, `cur.$componentHead ${i}`, `cur`);
//       }

//       i++;
//     }

//     assert.strictEqual(lifecycle['flushCount'], 0, `lifecycle['flushCount']`);
//     assert.strictEqual(host.textContent, 'w00t'.repeat(6), `host.textContent`);

//     component.value = 'w00t00t';
//     assert.strictEqual(current.value, 'w00t00t', `current.value`);
//     assert.strictEqual(host.textContent, 'w00t'.repeat(6), `host.textContent`);
//     assert.strictEqual(lifecycle['flushCount'], 6, `lifecycle['flushCount']`);

//     lifecycle.processFlushQueue(LifecycleFlags.none);
//     assert.strictEqual(host.textContent, 'w00t00t'.repeat(6), `host.textContent`);
//     tearDown(au, lifecycle, host);
//   });
// });
