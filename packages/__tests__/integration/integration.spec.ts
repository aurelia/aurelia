/* eslint-disable mocha/no-skipped-tests, mocha/no-exclusive-tests, @typescript-eslint/strict-boolean-expressions, @typescript-eslint/strict-boolean-expressions */
import { toArray } from '@aurelia/kernel';
import { CustomElement, DirtyCheckProperty, DirtyCheckSettings, IDirtyChecker } from '@aurelia/runtime';
import { assert, Call, createSpy, fail } from '@aurelia/testing';
import { App } from './app/app';
import { startup, TestExecutionContext } from './app/startup';

describe('app', function() {
  function createTestFunction(testFunction: (ctx: TestExecutionContext) => Promise<void> | void) {
    return async function() {
      const ctx = await startup();
      try {
        await testFunction(ctx);
      } catch (e) {
        fail(e);
      } finally {
        await ctx.tearDown();
      }
    };
  }
  function $it(title: string, testFunction: (ctx: TestExecutionContext) => Promise<void> | void) {
    it(title, createTestFunction(testFunction));
  }
  $it.skip = function(title: string, testFunction: (ctx: TestExecutionContext) => Promise<void> | void) {
    it.skip(title, createTestFunction(testFunction));
  };
  $it.only = function(title: string, testFunction: (ctx: TestExecutionContext) => Promise<void> | void) {
    it.only(title, createTestFunction(testFunction));
  };

  function getViewModel<T>(element: Element) {
    const { viewModel } = (CustomElement.behaviorFor(element) as unknown) as { viewModel: T };
    return viewModel;
  }
  function assertCalls(calls: Call[], fromIndex: number, instance: any, expectedCalls: string[], unexpectedCalls?: string[], message?: string) {
    const recentCalls = new Set(calls.slice(fromIndex).map(c => Object.is(c.instance, instance) && c.method));
    for (const expectedCall of expectedCalls) {
      assert.equal(recentCalls.has(expectedCall), true, `${message || ''} expected ${expectedCall}`);
    }
    for (const expectedCall of unexpectedCalls) {
      assert.equal(recentCalls.has(expectedCall), false, `${message || ''} not expected ${expectedCall}`);
    }
  }
  function wait(ms = 300) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  $it('has some readonly texts with different binding modes', function({ host }) {
    for (let i = 0; i < 4; i++) {
      const selector = `read-only-text#text${i}`;
      assert.html.textContent(selector, `text${i}`, `incorrect text for ${selector}`, host);
    }
  });

  $it('changes in bound VM properties are correctly reflected in the read-only-texts', function({ host, ctx }) {
    ((host.querySelector('button#staticTextChanger') as unknown) as HTMLButtonElement).click();
    ctx.lifecycle.processRAFQueue(undefined);

    assert.html.textContent('read-only-text#text0', 'text0', 'incorrect text for read-only-text#text0', host);
    assert.html.textContent('read-only-text#text1', 'text1', 'incorrect text for read-only-text#text1', host);
    assert.html.textContent('read-only-text#text2', 'newText2', 'incorrect text for read-only-text#text2', host);
    assert.html.textContent('read-only-text#text3', 'newText3', 'incorrect text for read-only-text#text3', host);
  });

  $it('has some textual inputs with different binding modes', function({ host }) {
    const _static: HTMLInputElement = host.querySelector('#input-static input');
    const oneTime: HTMLInputElement = host.querySelector('#input-one-time input');
    const twoWay: HTMLInputElement = host.querySelector('#input-two-way input');
    const toView: HTMLInputElement = host.querySelector('#input-to-view input');
    const fromView: HTMLInputElement = host.querySelector('#input-from-view input');
    const blurredInputTw: HTMLInputElement = host.querySelector('#blurred-input-two-way input');
    const blurredInputFv: HTMLInputElement = host.querySelector('#blurred-input-from-view input');

    const vm = getViewModel<App>(host);

    assert.html.value(_static, 'input0');
    assert.html.value(oneTime, vm.inputOneTime);
    assert.html.value(twoWay, vm.inputTwoWay);
    assert.html.value(toView, vm.inputToView);
    assert.html.value(fromView, '');
    assert.html.value(blurredInputTw, vm.inputBlrTw);
    assert.html.value(blurredInputFv, '');
  });

  $it('binds interpolated string to read-only-texts', function({ host, ctx }) {
    const el = host.querySelector('#interpolated-text');
    const vm = getViewModel<App>(host);
    assert.html.textContent(el, `interpolated: ${vm.text4}${vm.text5}`, `incorrect text`);

    const text1 = 'hello',
      text2 = 'world';

    vm.text4 = text1;
    ctx.lifecycle.processRAFQueue(undefined);
    assert.html.textContent(el, `interpolated: ${text1}${vm.text5}`, `incorrect text - change1`, host);

    vm.text5 = text2;
    ctx.lifecycle.processRAFQueue(undefined);
    assert.html.textContent(el, `interpolated: ${text1}${text2}`, `incorrect text - change2`, host);
  });

  $it('changes in the text-input are reflected correctly as per binding mode', function({ host, ctx }) {
    const oneTime: HTMLInputElement = host.querySelector('#input-one-time input');
    const twoWay: HTMLInputElement = host.querySelector('#input-two-way input');
    const toView: HTMLInputElement = host.querySelector('#input-to-view input');
    const fromView: HTMLInputElement = host.querySelector('#input-from-view input');

    const newInputs = new Array(4).fill(0).map((_, i) => `new input ${i + 1}`);

    oneTime.value = newInputs[0];
    oneTime.dispatchEvent(new Event('change'));

    twoWay.value = newInputs[1];
    twoWay.dispatchEvent(new Event('change'));

    toView.value = newInputs[2];
    toView.dispatchEvent(new Event('change'));

    fromView.value = newInputs[3];
    fromView.dispatchEvent(new Event('change'));

    ctx.lifecycle.processRAFQueue(undefined);

    const vm = getViewModel<App>(host);
    assert.equal(vm.inputOneTime, 'input1');
    assert.equal(vm.inputTwoWay, newInputs[1]);
    assert.equal(vm.inputToView, 'input3');
    assert.equal(vm.inputFromView, newInputs[3]);
  });

  $it('changes in the vm property are reflected in text-inputs correctly as per binding mode', function({ host, ctx }) {
    const newInputs = new Array(4).fill(0).map((_, i) => `new input ${i + 1}`);
    const vm = getViewModel<App>(host);
    vm.inputOneTime = newInputs[0];
    vm.inputTwoWay = newInputs[1];
    vm.inputToView = newInputs[2];
    vm.inputFromView = newInputs[3];

    ctx.lifecycle.processRAFQueue(undefined);

    const oneTime: HTMLInputElement = host.querySelector('#input-one-time input');
    const twoWay: HTMLInputElement = host.querySelector('#input-two-way input');
    const toView: HTMLInputElement = host.querySelector('#input-to-view input');
    const fromView: HTMLInputElement = host.querySelector('#input-from-view input');

    assert.html.value(oneTime, 'input1');
    assert.html.value(twoWay, newInputs[1]);
    assert.html.value(toView, newInputs[2]);
    assert.html.value(fromView, '');
  });

  $it('changes in the text-input are reflected correctly according to update-trigger event', function({ host, ctx }) {
    const twoWay: HTMLInputElement = host.querySelector('#blurred-input-two-way input');
    const fromView: HTMLInputElement = host.querySelector('#blurred-input-from-view input');

    const vm = getViewModel<App>(host);
    assert.html.value(twoWay, vm.inputBlrTw);
    assert.html.value(fromView, '');

    const newInputFv = 'new blurred input fv',
      newInputTw = 'new blurred input tw';
    twoWay.value = newInputTw;
    twoWay.dispatchEvent(new Event('change'));
    fromView.value = newInputFv;
    fromView.dispatchEvent(new Event('change'));
    ctx.lifecycle.processRAFQueue(undefined);

    assert.notEqual(vm.inputBlrTw, newInputTw);
    assert.notEqual(vm.inputBlrFv, newInputFv);

    twoWay.dispatchEvent(new Event('blur'));
    fromView.dispatchEvent(new Event('blur'));
    ctx.lifecycle.processRAFQueue(undefined);

    assert.equal(vm.inputBlrTw, newInputTw);
    assert.equal(vm.inputBlrFv, newInputFv);
  });

  $it.skip("uses specs-viewer to 'compose' display for heterogenous collection of things", function({ host }) {
    const specsViewer = host.querySelector('specs-viewer');
    assert.notEqual(specsViewer, null);
    console.log(specsViewer.outerHTML);

    const vm = getViewModel<App>(host);
    const [camera, laptop] = vm.things;
    assert.html.textContent('h2', `${camera.modelNumber} by ${camera.make}`, 'incorrect text', specsViewer);
  });

  $it("uses a user preference control that 'computes' the full name of the user correctly - static", function({ host, ctx, callCollection: { calls } }) {
    const { user } = getViewModel<App>(host);

    const userPref = host.querySelector('user-preference');

    const statc = userPref.querySelector('#static');
    const nonStatic = userPref.querySelector('#nonStatic');
    const wrongStatic = userPref.querySelector('#wrongStatic');

    assert.html.textContent(statc, 'John Doe', 'incorrect text statc');
    assert.html.textContent(nonStatic, 'infant', 'incorrect text nonStatic');
    assert.html.textContent(wrongStatic, 'infant', 'incorrect text wrongStatic');

    const dirtyChecker = ctx.container.get(IDirtyChecker);
    const dirty = (dirtyChecker['tracked'] as DirtyCheckProperty[]).filter(prop => Object.is(user, prop.obj) && ['fullNameStatic', 'fullNameNonStatic', 'fullNameWrongStatic'].includes(prop.propertyKey));
    assert.equal(dirty.length, 0, 'dirty checker should not have been applied');

    let index = calls.length;
    user.firstName = 'Jane';
    ctx.lifecycle.processRAFQueue(undefined);
    assert.html.textContent(statc, 'Jane Doe', 'incorrect text statc - fname');
    assert.html.textContent(nonStatic, 'infant', 'incorrect text nonStatic - fname');
    assert.html.textContent(wrongStatic, 'infant', 'incorrect text wrongStatic - fname');
    assert.greaterThan(calls.length, index);
    assertCalls(calls, index, user, ['get fullNameStatic'], ['get fullNameNonStatic', 'get fullNameWrongStatic']);

    index = calls.length;
    user.age = 10;
    ctx.lifecycle.processRAFQueue(undefined);
    assert.html.textContent(statc, 'Jane Doe', 'incorrect text statc - age');
    assert.html.textContent(nonStatic, 'Jane Doe', 'incorrect text nonStatic - age');
    assert.html.textContent(wrongStatic, 'Jane Doe', 'incorrect text wrongStatic - age');
    assert.greaterThan(calls.length, index);
    assertCalls(calls, index, user, ['get fullNameNonStatic', 'get fullNameWrongStatic'], ['get fullNameStatic']);

    index = calls.length;
    user.lastName = 'Smith';
    ctx.lifecycle.processRAFQueue(undefined);
    assert.html.textContent(statc, 'Jane Smith', 'incorrect text statc - lname');
    assert.html.textContent(nonStatic, 'Jane Smith', 'incorrect text nonStatic - lname');
    assert.html.textContent(wrongStatic, 'Jane Doe', 'incorrect text wrongStatic - lname');
    assert.greaterThan(calls.length, index);
    assertCalls(calls, index, user, ['get fullNameStatic', 'get fullNameNonStatic'], ['get fullNameWrongStatic']);
  });

  $it("uses a user preference control that 'computes' the organization of the user correctly - volatile", function({ host, ctx, callCollection: { calls } }) {
    const { user } = getViewModel<App>(host);

    const userPref = host.querySelector('user-preference');

    const nonVolatile = userPref.querySelector('#nonVolatile');
    const volatile = userPref.querySelector('#volatile');

    assert.html.textContent(nonVolatile, 'Role1, Org1', 'incorrect text nonVolatile');
    assert.html.textContent(volatile, 'City1, Country1', 'incorrect text volatile');

    const dirtyChecker = ctx.container.get(IDirtyChecker);
    const dirty = (dirtyChecker['tracked'] as DirtyCheckProperty[]).filter(prop => Object.is(user, prop.obj) && ['roleNonVolatile', 'locationVolatile'].includes(prop.propertyKey));
    assert.equal(dirty.length, 0, 'dirty checker should not have been applied');

    let index = calls.length;
    user.roleNonVolatile = 'Role2';
    user.locationVolatile = 'Country2';
    ctx.lifecycle.processRAFQueue(undefined);
    assert.html.textContent(nonVolatile, 'Role2, Org1', 'incorrect text nonVolatile - role');
    assert.html.textContent(volatile, 'City1, Country2', 'incorrect text volatile - country');
    assert.greaterThan(calls.length, index);
    assertCalls(calls, index, user, ['get roleNonVolatile', 'get locationVolatile'], []);

    index = calls.length;
    user.organization = 'Org2';
    user.city = 'City2';
    ctx.lifecycle.processRAFQueue(undefined);
    assert.html.textContent(nonVolatile, 'Role2, Org1', 'incorrect text nonVolatile - role');
    assert.html.textContent(volatile, 'City2, Country2', 'incorrect text volatile - country');
    assert.greaterThan(calls.length, index);
    assertCalls(calls, index, user, ['get locationVolatile'], ['get roleNonVolatile']);
  });

  $it('uses a user preference control gets dirty checked for non-configurable property', async function({ host, ctx: { lifecycle, container } }) {
    const { user } = getViewModel<App>(host);
    const userPref = host.querySelector('user-preference');
    const indeterminate = userPref.querySelector('#indeterminate');
    assert.html.textContent(indeterminate, 'test', 'incorrect text indeterminate');

    lifecycle.enqueueRAF(() => {
      /* noop */
    });
    lifecycle.processRAFQueue(undefined);
    const fps = lifecycle.FPS;

    // assert that it is being dirty checked
    const dirtyChecker = container.get(IDirtyChecker);
    const dirtyCheckProperty = (dirtyChecker['tracked'] as DirtyCheckProperty[]).find(prop => Object.is(user.arr, prop.obj) && prop.propertyKey === 'indeterminate');
    assert.notEqual(dirtyCheckProperty, undefined);
    const isDirtySpy = createSpy(dirtyCheckProperty, 'isDirty', true);

    // asser disable
    DirtyCheckSettings.disabled = true;
    isDirtySpy.reset();
    await wait();
    assert.equal(isDirtySpy.calls.length, 0);
    DirtyCheckSettings.resetToDefault();

    // assert rate
    await wait();
    const prevCallCount = isDirtySpy.calls.length;
    assert.lessThanOrEqualTo(prevCallCount, (fps / DirtyCheckSettings.framesPerCheck) * (3 / 10));

    isDirtySpy.reset();
    DirtyCheckSettings.framesPerCheck = 2;

    await wait();
    assert.greaterThan(isDirtySpy.calls.length, prevCallCount);
    DirtyCheckSettings.resetToDefault();

    // assert flush
    const flushSpy = createSpy(dirtyCheckProperty, 'flush', true);
    const newValue = 'foo';
    user.arr.indeterminate = newValue;
    await wait();
    assert.html.textContent(indeterminate, newValue, 'incorrect text indeterminate - after change');
    assert.equal(flushSpy.calls.length, 1);
  });

  $it('uses a radio-button-list that renders a map as a list of radio buttons', async function({ host, ctx }) {
    const app = getViewModel<App>(host);
    const contacts = app.contacts;
    const contactsArr = Array.from(contacts);
    const rbl = host.querySelector('radio-button-list');
    let labels = toArray(rbl.querySelectorAll('label'));
    let size = contacts.size;
    assert.equal(labels.length, size);

    // assert radio buttons and selection
    let prevCheckedIndex: number;
    for (let i = 0; i < size; i++) {
      const [number, type] = contactsArr[i];
      assert.html.textContent(labels[i], type, `incorrect label for label#${i + 1}`);
      if (app.chosenContact === number) {
        prevCheckedIndex = i;
        const input = labels[i].querySelector('input');
        assert.notEqual(input, null);
        assert.equal(input.checked, true, 'expected radio button to be checked');
      }
    }

    // assert if the choice is changed in VM, it is propagated to view
    app.chosenContact = contactsArr[0][0];
    ctx.lifecycle.processRAFQueue(undefined);
    assert.equal(labels[0].querySelector('input').checked, true, 'expected change of checked status - checked');
    assert.equal(labels[prevCheckedIndex].querySelector('input').checked, false, 'expected change of checked status - unchecked');

    // assert that when choice is changed from view, it is propagaetd to VM
    const lastIndex = size - 1;
    const lastChoice = labels[lastIndex];
    lastChoice.click();
    ctx.lifecycle.processRAFQueue(undefined);
    assert.equal(lastChoice.querySelector('input').checked, true, 'expected to be checked');
    assert.equal(app.chosenContact, contactsArr[lastIndex][0], 'expected change to porapagate to vm');

    // assert that change of map is reflected
    // add
    const newContacts = [[111, 'home2'], [222, 'work2']] as const;
    contacts.set(...newContacts[0]);
    contacts.set(...newContacts[1]);
    ctx.lifecycle.processRAFQueue(undefined);
    labels = toArray(rbl.querySelectorAll('label'));
    size = contacts.size;
    assert.equal(labels.length, size);
    assert.html.textContent(labels[size - 1], newContacts[1][1], 'incorrect text');
    assert.html.textContent(labels[size - 2], newContacts[0][1], 'incorrect text');

    // change value of existing key
    contacts.set(222, 'work3');
    ctx.lifecycle.processRAFQueue(undefined);
    assert.html.textContent(rbl.querySelector('label:last-of-type'), 'work3', 'incorrect text');
  });
});
