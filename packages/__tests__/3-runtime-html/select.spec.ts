// import { Primitive } from '@aurelia/kernel';
// import { LifecycleFlags as LF } from '@aurelia/runtime';
// import { SelectValueObserver } from '@aurelia/runtime-html';
// import { HTMLTestContext, TestContext,h,
//   setup,
//   setupAndStart,
//   tearDown
// } from '@aurelia/testing';

// // TemplateCompiler - <select/> Integration
// describe('select', function () {
//   let ctx: HTMLTestContext;

//   beforeEach(function () {
//     ctx = TestContext.createHTMLTestContext();
//   });

//   //<select/> - single
//   describe('01.', function () {

//     //works with multiple toView bindings
//     it('01.', function () {
//       const { au, lifecycle, host, observerLocator, component } = createFixture(
//         ctx,
//         `<template>
//           <select id="select1" value.to-view="selectedValue">
//             <option>1</option>
//             <option>2</option>
//           </select>
//           <select id="select2" value.to-view="selectedValue">
//             <option>1</option>
//             <option>2</option>
//           </select>
//           <select id="select3" value.to-view="selectedValue">
//             <option>3</option>
//             <option>4</option>
//           </select>
//         </template>`,
//         class App {
//           public selectedValue: string = '2';
//         }
//       );
//       au.app({ host, component }).start();
//       const select1: HTMLSelectElement = host.querySelector('#select1');
//       const select2: HTMLSelectElement = host.querySelector('#select2');
//       const select3: HTMLSelectElement = host.querySelector('#select3');
//       // Inititally, <select/>s are not affected by view model values
//       // assert.strictEqual(select1.value, `select1.value`, '1', `select1.value, `select1.value``);
//       // assert.strictEqual(select2.value, `select2.value`, '1', `select2.value, `select2.value``);
//       // assert.strictEqual(select3.value, `select3.value`, '3', `select3.value, `select3.value``);
//       // lifecycle.flush(LF.none);
//       // after flush changes, view model value should propagate to <select/>s
//       assert.strictEqual(select1.value, `select1.value`, '2', `select1.value, `select1.value``);
//       assert.strictEqual(select2.value, `select2.value`, '2', `select2.value, `select2.value``);
//       // vCurrent does not attempt to correct <select/> value
//       // vNext shouldn't for compat
//       assert.strictEqual(select3.value, `select3.value`, '3', `select3.value, `select3.value``);
//       const observer3 = observerLocator.getObserver(select3, 'value') as SelectValueObserver;
//       assert.strictEqual(observer3.currentValue, `observer3.currentValue`, '2', `observer3.currentValue, `observer3.currentValue``);

//       // expect no state changes after flushing
//       lifecycle.processFlushQueue(LF.none);
//       assert.strictEqual(select1.value, `select1.value`, '2', `select1.value, `select1.value``);
//       assert.strictEqual(select2.value, `select2.value`, '2', `select2.value, `select2.value``);
//       assert.strictEqual(select3.value, `select3.value`, '3', `select3.value, `select3.value``);
//       assert.strictEqual(observer3.currentValue, `observer3.currentValue`, '2', `observer3.currentValue, `observer3.currentValue``);

//       tearDown(au, lifecycle, host);
//     });

//     //works with mixed of multiple binding: twoWay + toView
//     it('02.', function () {
//       const { au, lifecycle, host, observerLocator, component } = createFixture(
//         ctx,
//         `<template>
//           <select id="select1" value.to-view="selectedValue">
//             <option>1</option>
//             <option>2</option>
//           </select>
//           <select id="select2" value.two-way="selectedValue">
//             <option>1</option>
//             <option>2</option>
//           </select>
//           <select id="select3" value.to-view="selectedValue">
//             <option>3</option>
//             <option>4</option>
//           </select>
//         </template>`,
//         class App {
//           public selectedValue: string = '2';
//         }
//       );
//       au.app({ host, component }).start();
//       const select1: HTMLSelectElement = host.querySelector('#select1');
//       const select2: HTMLSelectElement = host.querySelector('#select2');
//       const select3: HTMLSelectElement = host.querySelector('#select3');
//       //assert.strictEqual(component.selectedValue, `component.selectedValue`, '2', `component.selectedValue, `component.selectedValue``);
//       // Inititally, <select/>s are not affected by view model values
//       // assert.strictEqual(select1.value, `select1.value`, '1', `select1.value, `select1.value``);
//       // assert.strictEqual(select2.value, `select2.value`, '1', `select2.value, `select2.value``);
//       // assert.strictEqual(select3.value, `select3.value`, '3', `select3.value, `select3.value``);
//       // lifecycle.flush(LF.none);
//       assert.strictEqual(component.selectedValue, `component.selectedValue #1`, '2', `component.selectedValue, `component.selectedValue #1``);

//       // Verify observer 3 will take the view model value, regardless valid value from view model
//       const observer3 = observerLocator.getObserver(select3, 'value') as SelectValueObserver;
//       assert.strictEqual(observer3.currentValue, `observer3.currentValue #2`, '2', `observer3.currentValue, `observer3.currentValue #2``);

//       // simulate change from under input
//       select2.value = '1';
//       select2.dispatchEvent(new ctx.CustomEvent('change', { bubbles: true }));

//       assert.strictEqual(component.selectedValue, `component.selectedValue #3`, '1', `component.selectedValue, `component.selectedValue #3``);
//       const observer1 = observerLocator.getObserver(select1, 'value') as SelectValueObserver;
//       assert.strictEqual(observer1.currentValue, `observer1.currentValue #4`, '1', `observer1.currentValue, `observer1.currentValue #4``);
//       // verify observer 3 will take the view model value from changes, regardless valid value from view model
//       assert.strictEqual(observer3.currentValue, `observer3.currentValue #5`, '1', `observer3.currentValue, `observer3.currentValue #5``);

//       // expect no state changes after flushing
//       lifecycle.processFlushQueue(LF.none);
//       assert.strictEqual(component.selectedValue, `component.selectedValue #6`, '1', `component.selectedValue, `component.selectedValue #6``);
//       assert.strictEqual(observer1.currentValue, `observer1.currentValue #7`, '1', `observer1.currentValue, `observer1.currentValue #7``);
//       assert.strictEqual(observer3.currentValue, `observer3.currentValue #8`, '1', `observer3.currentValue, `observer3.currentValue #8``);

//       tearDown(au, lifecycle, host);
//     });
//   });

//   //<select/> - multiple
//   describe('02.', function () {

//     //works with multiple toView bindings without pre-selection
//     it('01.', function () {
//       const { au, lifecycle, host, observerLocator, component } = setupAndStart(
//         ctx,
//         `<template>
//           <select id="select1" multiple value.to-view="selectedValues">
//             <option id="o11">1</option>
//             <option id="o12">2</option>
//             <option id="o13">5</option>
//             <option id="o14">7</option>
//           </select>
//           <select id="select2" multiple value.to-view="selectedValues">
//             <option id="o21">2</option>
//             <option id="o22">4</option>
//             <option id="o23">5</option>
//             <option id="o24">6</option>
//           </select>
//           <select id="select3" multiple value.to-view="selectedValues">
//             <option id="o31">8</option>
//             <option id="o32">9</option>
//             <option id="o33">10</option>
//             <option id="o34">11</option>
//             <option id="o35">12</option>
//           </select>
//         </template>`,
//         class App {
//           public selectedValues: Primitive[] = ['1', 2, '2', 3, '3'];
//         }
//       );
//       const select1 = host.querySelector('#select1');
//       const select2 = host.querySelector('#select2');
//       const select3 = host.querySelector('#select3');
//       const observer1 = observerLocator.getObserver(select1, 'value') as SelectValueObserver;
//       const observer2 = observerLocator.getObserver(select2, 'value') as SelectValueObserver;
//       const observer3 = observerLocator.getObserver(select3, 'value') as SelectValueObserver;
//       assert.strictEqual(observer1.currentValue, `observer1.currentValue`, component.selectedValues, `observer1.currentValue, `observer1.currentValue``);
//       assert.strictEqual(observer2.currentValue, `observer2.currentValue`, component.selectedValues, `observer2.currentValue, `observer2.currentValue``);
//       assert.strictEqual(observer3.currentValue, `observer3.currentValue`, component.selectedValues, `observer3.currentValue, `observer3.currentValue``);
//       lifecycle.processFlushQueue(LF.none);
//       const options = host.querySelectorAll('option');
//       options.forEach(optionA => {
//         expect(optionA.selected, `optionA.selected`).to.be[component.selectedValues.includes(optionA.value) ? 'true' : 'false'];
//       });
//       component.selectedValues = [];
//       lifecycle.processFlushQueue(LF.none);
//       options.forEach(optionB => {
//         assert.strictEqual(optionB.selected, `optionB.selected`, false, `optionB.selected, `optionB.selected``);
//       });

//       // expect no state changes after flushing
//       lifecycle.processFlushQueue(LF.none);
//       options.forEach(optionC => {
//         assert.strictEqual(optionC.selected, `optionC.selected`, false, `optionC.selected, `optionC.selected``);
//       });

//       tearDown(au, lifecycle, host);
//     });

//     //works with mixed of two-way + to-view bindings with pre-selection
//     it('02.', function () {
//       const { au, lifecycle, host, observerLocator, component } = setupAndStart(
//         ctx,
//         `<template>
//           <select id="select1" multiple value.to-view="selectedValues">
//             <option id="o11">1</option>
//             <option id="o12">2</option>
//             <option id="o13" selected>5</option>
//             <option id="o14" selected>7</option>
//           </select>
//           <select id="select2" multiple value.two-way="selectedValues">
//             <option id="o21">2</option>
//             <option id="o22">4</option>
//             <option id="o23" selected>5</option>
//             <option id="o24" selected>6</option>
//           </select>
//           <select id="select3" multiple value.two-way="selectedValues">
//             <option id="o31">8</option>
//             <option id="o32">9</option>
//             <option id="o33" selected>10</option>
//             <option id="o34">11</option>
//             <option id="o35" selected>12</option>
//           </select>
//         </template>`,
//         class App {
//           public selectedValues: Primitive[] = [];
//         }
//       );
//       const select1: HTMLSelectElement = host.querySelector('#select1');
//       const select2: HTMLSelectElement = host.querySelector('#select2');
//       const select3: HTMLSelectElement = host.querySelector('#select3');
//       const observer1 = observerLocator.getObserver(select1, 'value') as SelectValueObserver;
//       const observer2 = observerLocator.getObserver(select2, 'value') as SelectValueObserver;
//       const observer3 = observerLocator.getObserver(select3, 'value') as SelectValueObserver;
//       assert.strictEqual(observer1.currentValue, `observer1.currentValue`, component.selectedValues, `observer1.currentValue, `observer1.currentValue``);
//       assert.strictEqual(observer2.currentValue, `observer2.currentValue`, component.selectedValues, `observer2.currentValue, `observer2.currentValue``);
//       assert.strictEqual(observer3.currentValue, `observer3.currentValue`, component.selectedValues, `observer3.currentValue, `observer3.currentValue``);
//       lifecycle.processFlushQueue(LF.none);
//       const options = host.querySelectorAll('option');
//       options.forEach(option1 => {
//         expect(option1.selected, `option1.selected`).to.be[component.selectedValues.includes(option1.value) ? 'true' : 'false'];
//       });
//       component.selectedValues = [];
//       lifecycle.processFlushQueue(LF.none);
//       options.forEach(option2 => {
//         assert.strictEqual(option2.selected, `option2.selected`, false, `option2.selected, `option2.selected``);
//       });

//       [].forEach.call(select3.options, (option3: HTMLOptionElement) => {
//         option3.selected = true;
//       });
//       select3.dispatchEvent(new ctx.CustomEvent('change', { bubbles: true }));
//       assert.strictEqual(component.selectedValues.toString(), `component.selectedValues.toString()`, ['8', '9', '10', '11', '12'].toString(), `component.selectedValues.toString(), `component.selectedValues.toString()``);
//       [].forEach.call(select2.options, (option4: HTMLOptionElement) => {
//         option4.selected = true;
//       });

//       // expect no state changes after flushing
//       lifecycle.processFlushQueue(LF.none);
//       assert.strictEqual(component.selectedValues.toString(), `component.selectedValues.toString()`, ['8', '9', '10', '11', '12'].toString(), `component.selectedValues.toString(), `component.selectedValues.toString()``);
//       [].forEach.call(select2.options, (option5: HTMLOptionElement) => {
//         option5.selected = true;
//       });

//       tearDown(au, lifecycle, host);
//     });
//   });

//   //toViewBinding - select single
//   it('03.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(
//       ctx,
//       template(ctx.doc, null,
//                select(ctx.doc,
//                       { 'value.to-view': 'selectedValue' },
//                       ...[1, 2].map(v => option(ctx.doc, { value: v }))
//         )
//       ),
//       null
//     );
//     assert.strictEqual(host.firstElementChild['value'], `host.firstElementChild['value']`, '1', `host.firstElementChild['value'], `host.firstElementChild['value']``);
//     component.selectedValue = '2';
//     assert.strictEqual(host.firstElementChild['value'], `host.firstElementChild['value']`, '1', `host.firstElementChild['value'], `host.firstElementChild['value']``);
//     lifecycle.processFlushQueue(LF.none);
//     assert.strictEqual(host.firstElementChild['value'], `host.firstElementChild['value']`, '2', `host.firstElementChild['value'], `host.firstElementChild['value']``);
//     assert.strictEqual(host.firstElementChild.childNodes.item(1)['selected'], `host.firstElementChild.childNodes.item(1)['selected']`, true, `host.firstElementChild.childNodes.item(1)['selected'], `host.firstElementChild.childNodes.item(1)['selected']``);
//     tearDown(au, lifecycle, host);
//   });

//   //twoWayBinding - select single
//   it('04.', function () {
//     const { au, lifecycle, host, component } = setupAndStart(
//       ctx,
//       h(ctx.doc, 'template',
//         null,
//         h(ctx.doc, 'select',
//           { 'value.two-way': 'selectedValue' },
//           ...[1, 2].map(v => h(ctx.doc, 'option', { value: v }))
//         )
//       ),
//       null
//     );
//     assert.strictEqual(component.selectedValue, `component.selectedValue`, undefined, `component.selectedValue, `component.selectedValue``);
//     host.firstChild.childNodes.item(1)['selected'] = true;
//     assert.strictEqual(component.selectedValue, `component.selectedValue`, undefined, `component.selectedValue, `component.selectedValue``);
//     host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
//     assert.strictEqual(component.selectedValue, `component.selectedValue`, '2', `component.selectedValue, `component.selectedValue``);
//     tearDown(au, lifecycle, host);
//   });

//   function template(doc: Document, attrs: Record<string, any> | null, ...children: Element[]) {
//     return h(doc, 'template', attrs, ...children);
//   }

//   function select(doc: Document, attrs: Record<string, any> | null, ...children: (HTMLOptionElement | HTMLOptGroupElement)[]) {
//     return h(doc, 'select', attrs, ...children);
//   }

//   function option(doc: Document, attrs: Record<string, any> | null) {
//     return h(doc, 'option', attrs);
//   }
// });
