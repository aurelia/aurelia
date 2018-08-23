// // Note: these tests are in a separate file from element-observation because they come directly from vCurrent. Needs to be consolidated at some point.
// import {
//   checkDelay,
//   createObserverLocator,
//   getBinding,
//   createScopeForTest
// } from './shared';
// import { expect } from 'chai';
// import { spy } from 'sinon';
// import { BindingMode, DOM, IObserverLocator, Binding, BindingFlags, IBindingTargetObserver, IChangeSet } from '@aurelia/runtime';
// import { createElement } from '../util';

// describe('CheckedObserver', async () => {
//   let observerLocator: IObserverLocator;

//   before(() => {
//     observerLocator = createObserverLocator();
//   });

//   describe('checkbox - array of strings', async () => {
//     let obj: any;
//     let el: HTMLInputElement & { $observers: Record<string, IBindingTargetObserver> };
//     let binding: Binding;

//     before(() => {
//       obj = { selectedItems: [] };
//       el = <any>createElement('<input type="checkbox" value="A" />');
//       observerLocator.getObserver(el, 'value');
//       document.body.appendChild(el);
//       binding = getBinding(observerLocator, obj, 'selectedItems', el, 'checked', BindingMode.twoWay).binding;
//     });

//     it('binds', async () => {
//       binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       await Promise.resolve();
//       expect(el.checked).to.be.false;
//     });

//     it('responds to model change', async () => {
//       obj.selectedItems.push('A');
//       await Promise.resolve();
//       expect(el.checked).to.be.true;
//     });

//     it('responds to element value change', async () => {
//       expect(el.checked).to.be.true;
//       el.$observers.value.setValue('ZZZZ', BindingFlags.targetOrigin);
//       await Promise.resolve();
//       expect(el.checked).to.be.false;
//       el.$observers.value.setValue('A', BindingFlags.targetOrigin);
//       await Promise.resolve();
//       expect(el.checked).to.be.true;
//     });

//     it('responds to element change', async () => {
//       el.checked = false;
//       el.dispatchEvent(new CustomEvent('change'));
//       expect(obj.selectedItems.length).to.equal(0);
//       await Promise.resolve();
//     });

//     it('notifies', async () => {
//       let targetObserver = binding.targetObserver;
//       const spySubscriber = { handleChange: spy() };
//       let oldValue = binding.targetObserver.getValue();
//       let newValue = [];
//       targetObserver.subscribe(spySubscriber);
//       targetObserver.setValue(newValue, BindingFlags.sourceOrigin);
//       expect(spySubscriber).to.have.been.calledWith(newValue, oldValue, BindingFlags.sourceOrigin);
//     });

//     it('unbinds', async () => {
//       var targetObserver = binding.targetObserver;
//       targetObserver['$unbind'] = spy();
//       binding.$unbind(BindingFlags.unbindOrigin);
//       expect(targetObserver.$unbind).to.have.been.called;
//     });

//     after(() => {
//       document.body.removeChild(el);
//     });
//   });

//   describe('checkbox - array of objects', async () => {
//     let obj: any;
//     let el: HTMLInputElement & { $observers: Record<string, IBindingTargetObserver> };
//     let binding: Binding;

//     before(() => {
//       obj = { selectedItems: [], itemA: {} };
//       el = <any>createElement('<input type="checkbox" />');
//       el.model = obj.itemA;
//       observerLocator.getObserver(el, 'model');
//       document.body.appendChild(el);
//       binding = getBinding(observerLocator, obj, 'selectedItems', el, 'checked', BindingMode.twoWay).binding;
//     });

//     it('binds', async () => {
//       binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       expect(el.checked).to.be.false;
//     });

//     it('responds to model change', async () => {
//       obj.selectedItems.push(obj.itemA);
//       await Promise.resolve();
//       expect(el.checked).to.be.true;
//     });

//     it('responds to element value change', async () => {
//       expect(el.checked).to.be.true;
//       el.$observers.model.setValue({}, BindingFlags.sourceOrigin);
//       await Promise.resolve();
//       expect(el.checked).to.be.false;
//       el.$observers.model.setValue(obj.itemA, BindingFlags.sourceOrigin);
//       await Promise.resolve();
//       expect(el.checked).to.be.true;
//     });

//     it('responds to element change', async () => {
//       el.checked = false;
//       el.dispatchEvent(new CustomEvent('change'));
//       await Promise.resolve();
//       expect(obj.selectedItems.length).to.equal(0);
//     });

//     it('notifies', async () => {
//       let targetObserver = binding.targetObserver;
//       const spySubscriber = { handleChange: spy() };
//       let oldValue = binding.targetObserver.getValue();
//       let newValue = [];
//       targetObserver.subscribe(spySubscriber);
//       targetObserver.setValue(newValue, BindingFlags.sourceOrigin);
//       expect(spySubscriber).to.have.been.calledWith(newValue, oldValue, BindingFlags.sourceOrigin);
//     });

//     it('unbinds', async () => {
//       var targetObserver = binding.targetObserver;
//       targetObserver['$unbind'] = spy();
//       binding.$unbind(BindingFlags.unbindOrigin);
//       expect(targetObserver.$unbind).to.have.been.called;
//     });

//     after(() => {
//       document.body.removeChild(el);
//     });
//   });

//   describe('checkbox - array of objects with matcher', async () => {
//     let obj: any;
//     let el: HTMLInputElement & { $observers: Record<string, IBindingTargetObserver> };
//     let binding: Binding;

//     before(() => {
//       obj = { selectedItems: [], itemA: { foo: 'A' } };
//       el = <any>createElement('<input type="checkbox" />');
//       el.model = obj.itemA;
//       document.body.appendChild(el);
//       binding = getBinding(observerLocator, obj, 'selectedItems', el, 'checked', BindingMode.twoWay).binding;
//     });

//     it('binds', async () => {
//       binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       el.matcher = (a, b) => a.foo === b.foo;
//       expect(el.checked).to.be.false;
//     });

//     it('responds to model change', async () => {
//       obj.selectedItems.push({ foo: 'A' });
//       await Promise.resolve();
//       expect(el.checked).to.be.true;
//     });

//     it('responds to element change', async () => {
//       el.checked = false;
//       el.dispatchEvent(new CustomEvent('change'));
//       await Promise.resolve();
//       expect(obj.selectedItems.length).to.equal(0);
//     });

//     it('notifies', async () => {
//       let targetObserver = binding.targetObserver;
//       const spySubscriber = { handleChange: spy() };
//       let oldValue = binding.targetObserver.getValue();
//       let newValue = [];
//       targetObserver.subscribe(spySubscriber);
//       targetObserver.setValue(newValue, BindingFlags.sourceOrigin);
//       expect(spySubscriber).to.have.been.calledWith(newValue, oldValue, BindingFlags.sourceOrigin);
//     });

//     it('unbinds', async () => {
//       var targetObserver = binding.targetObserver;
//       targetObserver['$unbind'] = spy();
//       binding.$unbind(BindingFlags.unbindOrigin);
//       expect(targetObserver.$unbind).to.have.been.called;
//     });

//     after(() => {
//       document.body.removeChild(el);
//     });
//   });

//   describe('checkbox - boolean', async () => {
//     let obj: any;
//     let el: HTMLInputElement & { $observers: Record<string, IBindingTargetObserver> };
//     let binding: Binding;

//     before(() => {
//       obj = { checked: false };
//       el = <any>createElement('<input type="checkbox" />');
//       document.body.appendChild(el);
//       binding = getBinding(observerLocator, obj, 'checked', el, 'checked', BindingMode.twoWay).binding;;
//     });

//     it('binds', async () => {
//       binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       expect(el.checked).to.be.false;
//     });

//     it('responds to model change', async () => {
//       obj.checked = true;
//       await Promise.resolve();
//       expect(el.checked).to.be.true;
//     });

//     it('responds to element change', async () => {
//       el.checked = false;
//       el.dispatchEvent(new CustomEvent('change'));
//       await Promise.resolve();
//       expect(obj.checked).to.be.false;
//     });

//     it('notifies', async () => {
//       let targetObserver = binding.targetObserver;
//       const spySubscriber = { handleChange: spy() };
//       let oldValue = binding.targetObserver.getValue();
//       let newValue = true;
//       targetObserver.subscribe(spySubscriber);
//       targetObserver.setValue(newValue, BindingFlags.sourceOrigin);
//       expect(spySubscriber).to.have.been.calledWith(newValue, oldValue, BindingFlags.sourceOrigin);
//     });

//     it('unbinds', async () => {
//       var targetObserver = binding.targetObserver;
//       targetObserver['$unbind'] = spy();
//       binding.$unbind(BindingFlags.unbindOrigin);
//       expect(targetObserver.$unbind).to.have.been.called;
//     });

//     after(() => {
//       document.body.removeChild(el);
//     });
//   });

//   describe('checkbox - late-bound value', async () => {
//     let obj: any;
//     let el: HTMLInputElement & { $observers: Record<string, IBindingTargetObserver> };
//     let binding: Binding;
//     let binding2: Binding;

//     before(() => {
//       obj = { selectedItems: ['A'], value: 'A' };
//       el = <any>createElement('<input type="checkbox" />');
//       document.body.appendChild(el);
//       binding = getBinding(observerLocator, obj, 'selectedItems', el, 'checked', BindingMode.twoWay).binding;
//       binding2 = getBinding(observerLocator, obj, 'value', el, 'value', BindingMode.toView).binding;
//     });

//     it('binds', async () => {
//       binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       binding2.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       expect(el.checked).to.be.false;
//       await Promise.resolve();
//       expect(el.checked).to.be.true;
//     });

//     it('responds to model change', async () => {
//       obj.selectedItems.pop();
//       await Promise.resolve();
//       expect(el.checked).to.be.false;
//     });

//     it('responds to element change', async () => {
//       el.checked = true;
//       el.dispatchEvent(new CustomEvent('change'));
//       await Promise.resolve();
//       expect(obj.selectedItems.length).to.equal(1);
//     });

//     it('notifies', async () => {
//       let targetObserver = binding.targetObserver;
//       const spySubscriber = { handleChange: spy() };
//       let oldValue = binding.targetObserver.getValue();
//       let newValue = [];
//       targetObserver.subscribe(spySubscriber);
//       targetObserver.setValue(newValue, BindingFlags.sourceOrigin);
//       expect(spySubscriber).to.have.been.calledWith(newValue, oldValue, BindingFlags.sourceOrigin);
//     });

//     it('unbinds', async () => {
//       var targetObserver = binding.targetObserver;
//       targetObserver['$unbind'] = spy();
//       binding.$unbind(BindingFlags.unbindOrigin);
//       expect(targetObserver.$unbind).to.have.been.called;
//       binding2.$unbind(BindingFlags.unbindOrigin);
//     });

//     after(() => {
//       document.body.removeChild(el);
//     });
//   });

//   describe('radio - string', async () => {
//     let obj: any;
//     let el: HTMLInputElement & { $observers: Record<string, IBindingTargetObserver> };
//     let radios: (ReturnType<typeof getBinding>)[];

//     before(() => {
//       obj = { value: 'B' };
//       el = <any>createElement(
//         `<div>
//           <input name="test" type="radio" value="A" />
//           <input name="test" type="radio" value="B" />
//           <input name="test" type="radio" value="C" />
//         </div>`);
//       document.body.appendChild(el);
//       radios = [
//         getBinding(observerLocator, obj, 'value', el.children.item(0), 'checked', BindingMode.twoWay),
//         getBinding(observerLocator, obj, 'value', el.children.item(1), 'checked', BindingMode.twoWay),
//         getBinding(observerLocator, obj, 'value', el.children.item(2), 'checked', BindingMode.twoWay)];
//     });

//     it('binds', async () => {
//       radios[0].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       radios[1].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       radios[2].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       expect(radios[0].view.checked).to.be.false;
//       expect(radios[1].view.checked).to.be.true;
//       expect(radios[2].view.checked).to.be.false;
//     });

//     it('responds to model change', async () => {
//       obj.value = 'A'
//       await Promise.resolve();
//       expect(radios[0].view.checked).to.be.true;
//       expect(radios[1].view.checked).to.be.false;
//       expect(radios[2].view.checked).to.be.false;
//     });

//     it('responds to element change', async () => {
//       radios[2].view.checked = true;
//       radios[2].view.dispatchEvent(new CustomEvent('change'));
//       await Promise.resolve();
//       expect(radios[0].view.checked).to.be.false;
//       expect(radios[1].view.checked).to.be.false;
//       expect(radios[2].view.checked).to.be.true;
//       expect(obj.value).to.equal('C');
//     });

//     it('unbinds', async () => {
//       var i = radios.length;
//       while(i--) {
//         radios[i].targetObserver['$unbind'] = spy();
//         radios[i].binding.$unbind(BindingFlags.unbindOrigin);
//         expect(radios[i].targetObserver.$unbind).to.have.been.called;
//       }
//     });

//     after(() => {
//       document.body.removeChild(el);
//     });
//   });

//   describe('radio - non-string', async () => {
//     let obj: any;
//     let el: HTMLInputElement & { $observers: Record<string, IBindingTargetObserver> };
//     let radios: (ReturnType<typeof getBinding>)[];

//     before(() => {
//       obj = { value: false };
//       el = <any>createElement(
//         `<div>
//           <input name="test" type="radio" />
//           <input name="test" type="radio" />
//           <input name="test" type="radio" />
//         </div>`);
//       document.body.appendChild(el);
//       el.children.item(0).model = null;
//       el.children.item(1).model = false;
//       el.children.item(2).model = true;
//       radios = [
//         getBinding(observerLocator, obj, 'value', el.children.item(0), 'checked', BindingMode.twoWay),
//         getBinding(observerLocator, obj, 'value', el.children.item(1), 'checked', BindingMode.twoWay),
//         getBinding(observerLocator, obj, 'value', el.children.item(2), 'checked', BindingMode.twoWay)];
//     });

//     it('binds', async () => {
//       radios[0].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       radios[1].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       radios[2].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       expect(radios[0].view.checked).to.be.false;
//       expect(radios[1].view.checked).to.be.true;
//       expect(radios[2].view.checked).to.be.false;
//     });

//     it('responds to model change', async () => {
//       obj.value = null;
//       await Promise.resolve();
//       expect(radios[0].view.checked).to.be.true;
//       expect(radios[1].view.checked).to.be.false;
//       expect(radios[2].view.checked).to.be.false;
//     });

//     it('responds to element change', async () => {
//       radios[2].view.checked = true;
//       radios[2].view.dispatchEvent(new CustomEvent('change'));
//       await Promise.resolve();
//       expect(radios[0].view.checked).to.be.false;
//       expect(radios[1].view.checked).to.be.false;
//       expect(radios[2].view.checked).to.be.true;
//       expect(obj.value).to.be.true;
//     });

//     it('unbinds', async () => {
//       var i = radios.length;
//       while(i--) {
//         radios[i].targetObserver['$unbind'] = spy();
//         radios[i].binding.$unbind(BindingFlags.unbindOrigin);
//         expect(radios[i].targetObserver.$unbind).to.have.been.called;
//       }
//     });

//     after(() => {
//       document.body.removeChild(el);
//     });
//   });

//   describe('radio - objects with matcher', async () => {
//     let obj: any;
//     let el: HTMLInputElement & { $observers: Record<string, IBindingTargetObserver> };
//     let radios: (ReturnType<typeof getBinding>)[];

//     before(() => {
//       obj = { value: { foo: 'B' } };
//       el = <any>createElement(
//         `<div>
//           <input name="test" type="radio" />
//           <input name="test" type="radio" />
//           <input name="test" type="radio" />
//         </div>`);
//       document.body.appendChild(el);
//       el.children.item(0).model = { foo: 'A' };
//       el.children.item(1).model = { foo: 'B' };
//       el.children.item(2).model = { foo: 'C' };
//       radios = [
//         getBinding(observerLocator, obj, 'value', el.children.item(0), 'checked', BindingMode.twoWay),
//         getBinding(observerLocator, obj, 'value', el.children.item(1), 'checked', BindingMode.twoWay),
//         getBinding(observerLocator, obj, 'value', el.children.item(2), 'checked', BindingMode.twoWay)];
//     });

//     it('binds', async () => {
//       radios[0].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       radios[1].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       radios[2].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       let matcher = (a, b) => a.foo === b.foo;
//       el.children.item(0).matcher = matcher;
//       el.children.item(1).matcher = matcher;
//       el.children.item(2).matcher = matcher;
//       await Promise.resolve();
//       expect(radios[0].view.checked).to.be.false;
//       expect(radios[1].view.checked).to.be.true;
//       expect(radios[2].view.checked).to.be.false;
//     });

//     it('responds to model change', async () => {
//       obj.value = { foo: 'A' };
//       await Promise.resolve();
//       expect(radios[0].view.checked).to.be.true;
//       expect(radios[1].view.checked).to.be.false;
//       expect(radios[2].view.checked).to.be.false;
//     });

//     it('responds to element change', async () => {
//       radios[2].view.checked = true;
//       radios[2].view.dispatchEvent(new CustomEvent('change'));
//       await Promise.resolve();
//       expect(radios[0].view.checked).to.be.false;
//       expect(radios[1].view.checked).to.be.false;
//       expect(radios[2].view.checked).to.be.true;
//       expect(obj.value).to.equal(radios[2].view.model);
//     });

//     it('unbinds', async () => {
//       var i = radios.length;
//       while(i--) {
//         radios[i].targetObserver['$unbind'] = spy();
//         radios[i].binding.$unbind(BindingFlags.unbindOrigin);
//         expect(radios[i].targetObserver.$unbind).to.have.been.called;
//       }
//     });

//     after(() => {
//       document.body.removeChild(el);
//     });
//   });

//   describe('radio - undefined model', async () => {
//     let obj: any;
//     let el: HTMLInputElement & { $observers: Record<string, IBindingTargetObserver> };
//     let radios: (ReturnType<typeof getBinding>)[];

//     before(() => {
//       obj = { value: undefined };
//       el = <any>createElement(
//         `<div>
//           <input name="test" type="radio" />
//           <input name="test" type="radio" />
//           <input name="test" type="radio" />
//         </div>`);
//       document.body.appendChild(el);
//       el.children.item(0).model = undefined;
//       el.children.item(1).model = 1;
//       el.children.item(2).model = 2;
//       radios = [
//         getBinding(observerLocator, obj, 'value', el.children.item(0), 'checked', BindingMode.twoWay),
//         getBinding(observerLocator, obj, 'value', el.children.item(1), 'checked', BindingMode.twoWay),
//         getBinding(observerLocator, obj, 'value', el.children.item(2), 'checked', BindingMode.twoWay)];
//     });

//     it('binds', async () => {
//       radios[0].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       radios[1].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       radios[2].binding.$bind(BindingFlags.bindOrigin, createScopeForTest(obj));
//       expect(radios[0].view.checked).to.be.true;
//       expect(radios[1].view.checked).to.be.false;
//       expect(radios[2].view.checked).to.be.false;
//     });

//     it('responds to model change', async () => {
//       obj.value = 1;
//       await Promise.resolve();
//       expect(radios[0].view.checked).to.be.false;
//       expect(radios[1].view.checked).to.be.true;
//       expect(radios[2].view.checked).to.be.false;
//     });

//     it('responds to element change', async () => {
//       radios[2].view.checked = true;
//       radios[2].view.dispatchEvent(new CustomEvent('change'));
//       await Promise.resolve();
//       expect(radios[0].view.checked).to.be.false;
//       expect(radios[1].view.checked).to.be.false;
//       expect(radios[2].view.checked).to.be.true;
//       expect(obj.value).to.equal(2);
//     });

//     it('unbinds', async () => {
//       var i = radios.length;
//       while(i--) {
//         radios[i].targetObserver['$unbind'] = spy();
//         radios[i].binding.$unbind(BindingFlags.unbindOrigin);
//         expect(radios[i].targetObserver.$unbind).to.have.been.called;
//       }
//     });

//     after(() => {
//       document.body.removeChild(el);
//     });
//   });
// });
