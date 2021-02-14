import { toArray } from '@aurelia/kernel';
import { DirtyCheckProperty, IDirtyChecker } from '@aurelia/runtime';
import { assert, getVisibleText, eachCartesianJoin } from '@aurelia/testing';
import { App, Product } from './app/app.js';
import { Cards } from './app/molecules/cards/cards.js';
import { LetDemo } from './app/molecules/let-demo/let-demo.js';
import { RandomGenerator } from './app/molecules/random-generator/random-generator.js';
import { $it, assertCalls, getViewModel } from './util.js';
import { ComponentMode } from './app/startup.js';

describe('app', function () {
  eachCartesianJoin([
    ['app', 'enhance'] as ['app' , 'enhance'],
    [ComponentMode.class, ComponentMode.instance,],
  ], function (method, componentMode) {
    $it(`has some readonly texts with different binding modes - ${method} - ${componentMode}`, function ({ host }) {
      for (let i = 0; i < 4; i++) {
        const selector = `read-only-text#text${i}`;
        assert.html.textContent(selector, `text${i}`, `incorrect text for ${selector}`, host);
      }
    }, { method, componentMode });

    $it(`changes in bound VM properties are correctly reflected in the read-only-texts - ${method} - ${componentMode}`, function ({ host, ctx }) {
      ((host.querySelector('button#staticTextChanger') as unknown) as HTMLButtonElement).click();
      ctx.platform.domWriteQueue.flush();

      assert.html.textContent('read-only-text#text0', 'text0', 'incorrect text for read-only-text#text0', host);
      assert.html.textContent('read-only-text#text1', 'text1', 'incorrect text for read-only-text#text1', host);
      assert.html.textContent('read-only-text#text2', 'newText2', 'incorrect text for read-only-text#text2', host);
      assert.html.textContent('read-only-text#text3', 'newText3', 'incorrect text for read-only-text#text3', host);
    }, { method, componentMode });

    $it(`has some textual inputs with different binding modes - ${method} - ${componentMode}`, function ({ host }) {
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
    }, { method, componentMode });

    $it(`binds interpolated string to read-only-texts - ${method} - ${componentMode}`, function ({ host, ctx }) {
      const el = host.querySelector('#interpolated-text');
      const vm = getViewModel<App>(host);
      assert.html.textContent(el, `interpolated: ${vm.text4}${vm.text5}`, `incorrect text`);

      const text1 = 'hello',
        text2 = 'world';

      vm.text4 = text1;
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(el, `interpolated: ${text1}${vm.text5}`, `incorrect text - change1`, host);

      vm.text5 = text2;
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(el, `interpolated: ${text1}${text2}`, `incorrect text - change2`, host);
    }, { method, componentMode });

    $it(`changes in the text-input are reflected correctly as per binding mode - ${method} - ${componentMode}`, function ({ host, ctx }) {
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

      ctx.platform.domWriteQueue.flush();

      const vm = getViewModel<App>(host);
      assert.equal(vm.inputOneTime, 'input1');
      assert.equal(vm.inputTwoWay, newInputs[1]);
      assert.equal(vm.inputToView, 'input3');
      assert.equal(vm.inputFromView, newInputs[3]);
    }, { method, componentMode });

    $it(`changes in the vm property are reflected in text-inputs correctly as per binding mode - ${method} - ${componentMode}`, function ({ host, ctx }) {
      const newInputs = new Array(4).fill(0).map((_, i) => `new input ${i + 1}`);
      const vm = getViewModel<App>(host);
      vm.inputOneTime = newInputs[0];
      vm.inputTwoWay = newInputs[1];
      vm.inputToView = newInputs[2];
      vm.inputFromView = newInputs[3];

      ctx.platform.domWriteQueue.flush();

      const oneTime: HTMLInputElement = host.querySelector('#input-one-time input');
      const twoWay: HTMLInputElement = host.querySelector('#input-two-way input');
      const toView: HTMLInputElement = host.querySelector('#input-to-view input');
      const fromView: HTMLInputElement = host.querySelector('#input-from-view input');

      assert.html.value(oneTime, 'input1');
      assert.html.value(twoWay, newInputs[1]);
      assert.html.value(toView, newInputs[2]);
      assert.html.value(fromView, '');
    }, { method, componentMode });

    $it(`changes in the text-input are reflected correctly according to update-trigger event - ${method} - ${componentMode}`, function ({ host, ctx }) {
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
      ctx.platform.domWriteQueue.flush();

      assert.notEqual(vm.inputBlrTw, newInputTw);
      assert.notEqual(vm.inputBlrFv, newInputFv);

      twoWay.dispatchEvent(new Event('blur'));
      fromView.dispatchEvent(new Event('blur'));
      ctx.platform.domWriteQueue.flush();

      assert.equal(vm.inputBlrTw, newInputTw);
      assert.equal(vm.inputBlrFv, newInputFv);
    }, { method, componentMode });

    $it.skip("uses specs-viewer to 'compose' display for heterogenous collection of things", function ({ host }) {
      const specsViewer = host.querySelector('specs-viewer');
      assert.notEqual(specsViewer, null);

      const vm = getViewModel<App>(host);
      const [camera, /* laptop */] = vm.things;
      assert.html.textContent('h2', `${camera.modelNumber} by ${camera.make}`, 'incorrect text', specsViewer);
    }, { method, componentMode });

    $it(`uses a user preference control that 'computes' the full name of the user correctly - static - ${method} - ${componentMode}`, function ({ host, ctx, callCollection: { calls } }) {
      const appVm = getViewModel<App>(host);
      const { user } = appVm;

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
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(statc, 'Jane Doe', 'incorrect text statc - fname');
      assert.html.textContent(nonStatic, 'infant', 'incorrect text nonStatic - fname');
      assert.greaterThan(calls.length, index);

      index = calls.length;
      user.age = 10;
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(statc, 'Jane Doe', 'incorrect text statc - age');
      assert.html.textContent(nonStatic, 'Jane Doe', 'incorrect text nonStatic - age');
      assert.greaterThan(calls.length, index);

      index = calls.length;
      user.lastName = 'Smith';
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(statc, 'Jane Smith', 'incorrect text statc - lname');
      assert.html.textContent(nonStatic, 'Jane Smith', 'incorrect text nonStatic - lname');
      assert.greaterThan(calls.length, index);
    }, { method, componentMode });

    $it(`uses a user preference control that 'computes' the organization of the user correctly ${method} - ${componentMode}`, function ({ host, ctx, callCollection: { calls } }) {
      const { user } = getViewModel<App>(host);

      const userPref = host.querySelector('user-preference');

      const $userRole = userPref.querySelector('#user_role');
      const $userLocation = userPref.querySelector('#user_location');

      assert.html.textContent($userRole, 'Role1, Org1', 'incorrect text #user_role');
      assert.html.textContent($userLocation, 'City1, Country1', 'incorrect text #user_location');

      const dirtyChecker = ctx.container.get(IDirtyChecker);
      const dirty = (dirtyChecker['tracked'] as DirtyCheckProperty[]).filter(prop => Object.is(user, prop.obj) && ['roleNonVolatile', 'locationVolatile'].includes(prop.propertyKey));
      assert.equal(dirty.length, 0, 'dirty checker should not have been applied');

      let index = calls.length;
      user.$role = 'Role2';
      user.$location = 'Country2';
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent($userRole, 'Role2, Org1', 'incorrect text #user_role - role');
      assert.html.textContent($userLocation, 'City1, Country2', 'incorrect text #user_location - country');
      assert.greaterThan(calls.length, index);
      assertCalls(
        calls,
        index,
        user,
        [
          'get $role',
        ],
        [],
      );

      index = calls.length;
      user.organization = 'Org2';
      user.city = 'City2';
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent($userRole, 'Role2, Org2', 'incorrect text #user_role - role');
      assert.html.textContent($userLocation, 'City2, Country2', 'incorrect text #user_location - country');
      assert.greaterThan(calls.length, index);
      assertCalls(
        calls,
        index,
        user,
        ['get $role'],
        [],
      );
    }, { method, componentMode });

    $it(`uses a user preference control gets dirty checked for non-configurable property - ${method} - ${componentMode}`, function ({ host, ctx: { container } }) {
      const { user } = getViewModel<App>(host);
      const userPref = host.querySelector('user-preference');
      const indeterminate = userPref.querySelector('#indeterminate');
      assert.html.textContent(indeterminate, 'test', 'incorrect text indeterminate');

      // assert that it is being dirty checked
      const dirtyChecker = container.get(IDirtyChecker);
      const dirtyCheckProperty = (dirtyChecker['tracked'] as DirtyCheckProperty[]).find(prop => Object.is(user.arr, prop.obj) && prop.propertyKey === 'indeterminate');
      assert.strictEqual(dirtyCheckProperty, undefined);
      // todo: the following has been commented as it's not correct
      // it's asserting that a property "intermediate" on an array should be dirty checked, but it shouldn't
      // though still keeping the code here, as we need a todo for reminding us to add more tests for dirty checker
      //
      // =============================================
      // assert.notEqual(dirtyCheckProperty, undefined);
      // const isDirtySpy = createSpy(dirtyCheckProperty, 'isDirty', true);

      // // asser disable
      // DirtyCheckSettings.disabled = true;
      // isDirtySpy.reset();

      // await platform.domWriteQueue.yield();
      // assert.equal(isDirtySpy.calls.length, 0);

      // DirtyCheckSettings.disabled = false;

      // // assert rate
      // await platform.domWriteQueue.yield();
      // const prevCallCount = isDirtySpy.calls.length;

      // isDirtySpy.reset();
      // DirtyCheckSettings.timeoutsPerCheck = 2;

      // await platform.domWriteQueue.yield();
      // assert.greaterThan(isDirtySpy.calls.length, prevCallCount);
      // DirtyCheckSettings.resetToDefault();

      // // assert flush
      // const flushSpy = createSpy(dirtyCheckProperty, 'flush', true);
      // const newValue = 'foo';
      // user.arr.indeterminate = newValue;

      // // await `DirtyCheckSettings.timeoutsPerCheck` frames (domWriteQueue.yield only awaits one persistent loop)
      // await platform.domWriteQueue.yield(DirtyCheckSettings.timeoutsPerCheck);
      // assert.html.textContent(indeterminate, newValue, 'incorrect text indeterminate - after change');
      // assert.equal(flushSpy.calls.length, 1);
    }, { method, componentMode });

    $it(`uses a radio-button-list that renders a map as a list of radio buttons - rbl-checked-model - ${method} - ${componentMode}`, function ({ host, ctx }) {
      const app = getViewModel<App>(host);
      const contacts = app.contacts1;
      const contactsArr = Array.from(contacts);
      const rbl = host.querySelector(`radio-button-list #rbl-checked-model`);
      let labels = toArray(rbl.querySelectorAll('label'));
      let size = contacts.size;
      assert.equal(labels.length, size);

      // assert radio buttons and selection
      let prevCheckedIndex: number;
      for (let i = 0; i < size; i++) {
        const [number, type] = contactsArr[i];
        assert.html.textContent(labels[i], type, `incorrect label for label#${i + 1}`);
        if (app.chosenContact1 === number) {
          prevCheckedIndex = i;
          const input = labels[i].querySelector('input');
          assert.notEqual(input, null);
          assert.equal(input.checked, true, 'expected radio button to be checked');
        }
      }

      // assert if the choice is changed in VM, it is propagated to view
      app.chosenContact1 = contactsArr[0][0];
      ctx.platform.domWriteQueue.flush();
      assert.equal(labels[0].querySelector('input').checked, true, 'expected change of checked status - checked');
      assert.equal(labels[prevCheckedIndex].querySelector('input').checked, false, 'expected change of checked status - unchecked');

      // assert that when choice is changed from view, it is propagaetd to VM
      const lastIndex = size - 1;
      const lastChoice = labels[lastIndex];
      lastChoice.click();
      ctx.platform.domWriteQueue.flush();
      assert.equal(lastChoice.querySelector('input').checked, true, 'expected to be checked');
      assert.equal(app.chosenContact1, contactsArr[lastIndex][0], 'expected change to porapagate to vm');

      // assert that change of map is reflected
      // add
      const newContacts = [[111, 'home2'], [222, 'work2']] as const;
      contacts.set(...newContacts[0]);
      contacts.set(...newContacts[1]);
      ctx.platform.domWriteQueue.flush();
      labels = toArray(rbl.querySelectorAll('label'));
      size = contacts.size;
      assert.equal(labels.length, size);
      assert.html.textContent(labels[size - 1], newContacts[1][1], 'incorrect text');
      assert.html.textContent(labels[size - 2], newContacts[0][1], 'incorrect text');

      // change value of existing key - last
      contacts.set(222, 'work3');
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(rbl.querySelector('label:last-of-type'), 'work3', 'incorrect text');
      // change value of existing key - middle
      contacts.set(111, 'home3');
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(rbl.querySelector(`label:nth-of-type(${size - 1})`), 'home3', 'incorrect text');

      // delete single item
      contacts.delete(111);
      ctx.platform.domWriteQueue.flush();
      labels = toArray(rbl.querySelectorAll('label'));
      assert.equal(labels.length, size - 1);

      // clear map
      contacts.clear();
      ctx.platform.domWriteQueue.flush();
      labels = toArray(rbl.querySelectorAll('label'));
      assert.equal(labels.length, 0, `expected no label ${rbl.outerHTML}`);
    }, { method, componentMode });

    $it(`uses a radio-button-list that renders a map as a list of radio buttons - rbl-model-checked - ${method} - ${componentMode}`, function ({ host, ctx }) {
      const app = getViewModel<App>(host);
      const contacts = app.contacts2;
      const contactsArr = Array.from(contacts);
      const rbl = host.querySelector(`radio-button-list #rbl-model-checked`);
      const labels = toArray(rbl.querySelectorAll('label'));
      const size = contacts.size;
      assert.equal(labels.length, size);

      // assert radio buttons and selection
      let prevCheckedIndex: number;
      for (let i = 0; i < size; i++) {
        const [number, type] = contactsArr[i];
        assert.html.textContent(labels[i], type, `incorrect label for label#${i + 1}`);
        if (app.chosenContact2 === number) {
          prevCheckedIndex = i;
          const input = labels[i].querySelector('input');
          assert.notEqual(input, null);
          assert.equal(input.checked, true, 'expected radio button to be checked');
        }
      }

      // assert if the choice is changed in VM, it is propagated to view
      app.chosenContact2 = contactsArr[0][0];
      ctx.platform.domWriteQueue.flush();
      assert.equal(labels[0].querySelector('input').checked, true, 'expected change of checked status - checked');
      assert.equal(labels[prevCheckedIndex].querySelector('input').checked, false, 'expected change of checked status - unchecked');

      // assert that when choice is changed from view, it is propagaetd to VM
      const lastIndex = size - 1;
      const lastChoice = labels[lastIndex];
      lastChoice.click();
      ctx.platform.domWriteQueue.flush();
      assert.equal(lastChoice.querySelector('input').checked, true, 'expected to be checked');
      assert.equal(app.chosenContact2, contactsArr[lastIndex][0], 'expected change to porapagate to vm');
    }, { method, componentMode });

    [
      { id: 'rbl-obj-array', collProp: 'contacts3' as const, chosenProp: 'chosenContact3' as const },
      { id: 'rbl-obj-array-matcher', collProp: 'contacts4' as const, chosenProp: 'chosenContact4' as const },
      { id: 'rbl-obj-array-matcher-order', collProp: 'contacts5' as const, chosenProp: 'chosenContact5' as const }
    ].map(({ id, collProp, chosenProp }) =>
      $it(`binds an object array to radio-button-list - ${id} - ${method} - ${componentMode}`, function ({ host, ctx }) {
        const app = getViewModel<App>(host);
        const contacts = app[collProp];
        const rbl = host.querySelector(`radio-button-list #${id}`);
        const labels = toArray(rbl.querySelectorAll('label'));
        const size = contacts.length;
        assert.equal(labels.length, size);

        // assert radio buttons and selection
        for (let i = 0; i < size; i++) {
          const { type } = contacts[i];
          assert.html.textContent(labels[i], type, `incorrect label for label#${i + 1}`);
        }
        assert.equal(labels[0].querySelector('input').checked, true, 'expected radio button to be checked');

        // assert if the choice is changed in VM, it is propagated to view
        app[chosenProp] = contacts[1];
        ctx.platform.domWriteQueue.flush();
        assert.equal(labels[1].querySelector('input').checked, true, 'expected change of checked status - checked');
        assert.equal(labels[0].querySelector('input').checked, false, 'expected change of checked status - unchecked');

        // assert that when choice is changed from view, it is propagaetd to VM
        const lastIndex = size - 1;
        const lastChoice = labels[lastIndex];
        lastChoice.click();
        ctx.platform.domWriteQueue.flush();
        assert.equal(lastChoice.querySelector('input').checked, true, 'expected to be checked');
        if (id.includes('matcher')) {
          assert.deepEqual(app[chosenProp], contacts[2], 'expected change to porapagate to vm');
        } else {
          assert.equal(app[chosenProp], contacts[2], 'expected change to porapagate to vm');
        }
      }, { method, componentMode })
    );

    [{ id: 'rbl-string-array', collProp: 'contacts6' as const, chosenProp: 'chosenContact6' as const }, { id: 'rbl-string-array-order', collProp: 'contacts7' as const, chosenProp: 'chosenContact7' as const }].map(({ id, collProp, chosenProp }) =>
      $it(`binds a string array to radio-button-list - ${id} - ${method} - ${componentMode}`, function ({ host, ctx }) {
        const app = getViewModel<App>(host);
        const contacts = app[collProp];
        const rbl = host.querySelector(`radio-button-list #${id}`);
        const labels = toArray(rbl.querySelectorAll('label'));
        const size = contacts.length;
        assert.equal(labels.length, size);

        // assert radio buttons and selection
        for (let i = 0; i < size; i++) {
          assert.html.textContent(labels[i], contacts[i], `incorrect label for label#${i + 1}`);
        }
        assert.equal(labels[0].querySelector('input').checked, true, 'expected radio button to be checked');

        // assert if the choice is changed in VM, it is propagated to view
        app[chosenProp] = contacts[1];
        ctx.platform.domWriteQueue.flush();
        assert.equal(labels[1].querySelector('input').checked, true, 'expected change of checked status - checked');
        assert.equal(labels[0].querySelector('input').checked, false, 'expected change of checked status - unchecked');

        // assert that when choice is changed from view, it is propagaetd to VM
        const lastIndex = size - 1;
        const lastChoice = labels[lastIndex];
        lastChoice.click();
        ctx.platform.domWriteQueue.flush();
        assert.equal(lastChoice.querySelector('input').checked, true, 'expected to be checked');
        assert.deepEqual(app[chosenProp], contacts[2], 'expected change to porapagate to vm');
      }, { method, componentMode })
    );

    $it(`uses a tri-state-boolean - ${method} - ${componentMode}`, function ({ host, ctx }) {
      const app = getViewModel<App>(host);
      const tsb = host.querySelector(`tri-state-boolean`);
      const labels = toArray(tsb.querySelectorAll('label'));

      // assert radio buttons and selection
      assert.html.textContent(labels[0], app.noDisplayValue, `incorrect label for noValue`);
      assert.html.textContent(labels[1], app.trueValue, `incorrect label for true`);
      assert.html.textContent(labels[2], app.falseValue, `incorrect label for false`);
      assert.equal(labels[0].querySelector('input').checked, false, `should not have been checked for noValue`);
      assert.equal(labels[1].querySelector('input').checked, false, `should not have been checked for true`);
      assert.equal(labels[2].querySelector('input').checked, false, `should not have been checked for false`);

      // assert if the choice is changed in VM, it is propagated to view
      app.likesCake = true;
      ctx.platform.domWriteQueue.flush();
      assert.equal(labels[1].querySelector('input').checked, true, `should have been checked for true`);

      // assert that when choice is changed from view, it is propagaetd to VM
      labels[2].click();
      ctx.platform.domWriteQueue.flush();
      assert.equal(labels[2].querySelector('input').checked, true, `should have been checked for false`);
      assert.equal(app.likesCake, false, 'expected change to porapagate to vm');
    }, { method, componentMode });

    $it(`uses a checkbox to bind boolean consent property - ${method} - ${componentMode}`, function ({ host, ctx }) {
      const app = getViewModel<App>(host);
      assert.equal(app.hasAgreed, undefined);

      const consent: HTMLInputElement = host.querySelector(`#consent input`);
      assert.equal(consent.checked, false, 'unchecked1');

      consent.click();
      ctx.platform.domWriteQueue.flush();
      assert.equal(app.hasAgreed, true, 'checked');

      app.hasAgreed = false;
      ctx.platform.domWriteQueue.flush();
      assert.equal(consent.checked, false, 'unchecked2');
    }, { method, componentMode });

    [{ id: 'cbl-obj-array', collProp: 'products1' as const, chosenProp: 'chosenProducts1' as const }, { id: 'cbl-obj-array-matcher', collProp: 'products2' as const, chosenProp: 'chosenProducts2' as const }].map(({ id, collProp, chosenProp }) =>
      $it(`binds an object array to checkbox-list - ${id} - ${method} - ${componentMode}`, function ({ host, ctx }) {
        const app = getViewModel<App>(host);
        const products = app[collProp];
        const inputs: HTMLInputElement[] = toArray(host.querySelectorAll(`checkbox-list #${id} label input[type=checkbox]`));
        const size = products.length;
        assert.equal(inputs.length, size);

        // assert radio buttons and selection
        assert.equal(inputs[0].checked, true, 'checked0');

        // assert if the choice is changed in VM, it is propagated to view
        app[chosenProp].push(products[1]);
        ctx.platform.domWriteQueue.flush();
        assert.equal(inputs[0].checked, true, 'checked00');
        assert.equal(inputs[1].checked, true, 'checked1');

        // assert that when choice is changed from view, it is propagaetd to VM
        inputs[0].click();
        inputs[2].click();
        ctx.platform.domWriteQueue.flush();
        assert.equal(inputs[2].checked, true, 'checked2');
        const actual = app[chosenProp].sort((pa: Product, pb: Product) => pa.id - pb.id);
        if (id.includes('matcher')) {
          assert.deepEqual(actual, [products[1], products[2]], 'expected change to porapagate to vm');
        } else {
          assert.equal(actual[0], products[1], 'expected change to porapagate to vm - 1');
          assert.equal(actual[1], products[2], 'expected change to porapagate to vm - 2');
        }
      }, { method, componentMode })
    );
    $it(`changes in array are reflected in checkbox-list - ${method} - ${componentMode}`, function ({ host, ctx }) {
      const getInputs = () => toArray(host.querySelectorAll<HTMLInputElement>(`checkbox-list #cbl-obj-array label input[type=checkbox]`));
      const app = getViewModel<App>(host);
      const products = app.products1;
      assert.equal(getInputs().length, products.length);

      // splice
      const newProduct1 = { id: 10, name: 'Mouse' };
      products.splice(0, 1, newProduct1);
      ctx.platform.domWriteQueue.flush();
      let inputs: HTMLInputElement[] = getInputs();
      assert.html.textContent(inputs[0].parentElement, `${newProduct1.id}-${newProduct1.name}`, 'incorrect label0');
      assert.equal(inputs[0].checked, false, 'unchecked0');

      // push
      const newProduct2 = { id: 20, name: 'Keyboard' };
      products.push(newProduct2);
      ctx.platform.domWriteQueue.flush();
      inputs = getInputs();
      assert.html.textContent(inputs[products.length - 1].parentElement, `${newProduct2.id}-${newProduct2.name}`, 'incorrect label0');

      // pop
      products.pop();
      ctx.platform.domWriteQueue.flush();
      assert.equal(getInputs().length, products.length);

      // shift
      products.shift();
      ctx.platform.domWriteQueue.flush();
      assert.equal(getInputs().length, products.length);

      // unshift
      const newProducts = new Array(20).fill(0).map((_, i) => ({ id: i * 10, name: `foo${i + 1}` }));
      products.unshift(...newProducts);
      ctx.platform.domWriteQueue.flush();
      inputs = getInputs();
      for (let i = 0; i < 20; i++) {
        assert.html.textContent(inputs[i].parentElement, `${newProducts[i].id}-${newProducts[i].name}`, `incorrect label${i + 1}`);
      }
      assert.equal(inputs.length, products.length);

      // sort
      products.sort((pa, pb) => (pa.name < pb.name ? -1 : 1));
      ctx.platform.domWriteQueue.flush();
      inputs = getInputs();
      assert.deepEqual(inputs.map(i => getVisibleText(i.parentElement as any, true)), products.map(p => `${p.id}-${p.name}`));

      // reverse
      products.reverse();
      ctx.platform.domWriteQueue.flush();
      inputs = getInputs();
      assert.deepEqual(inputs.map(i => getVisibleText(i.parentElement as any, true)), products.map(p => `${p.id}-${p.name}`));

      // clear
      products.splice(0);
      ctx.platform.domWriteQueue.flush();
      inputs = getInputs();
      assert.equal(inputs.length, 0);
    }, { method, componentMode });

    $it(`binds an action to the command - ${method} - ${componentMode}`, function ({ host, ctx }) {
      const app = getViewModel<App>(host);
      assert.equal(app.somethingDone, false);

      (host.querySelector<HTMLButtonElement>('command button')).click();
      ctx.platform.domWriteQueue.flush();
      assert.equal(app.somethingDone, true);
    }, { method, componentMode });

    $it(`uses a let-demo - ${method} - ${componentMode}`, function ({ host, ctx }) {
      const demo = host.querySelector('let-demo');
      const vm = getViewModel<LetDemo>(demo);

      const not = demo.querySelector('#not');
      const and = demo.querySelector('#and');
      const or = demo.querySelector('#or');
      const xor = demo.querySelector('#xor');
      const xnor = demo.querySelector('#xnor');
      const xorLoose = demo.querySelector('#xor-loose');
      const xnorLoose = demo.querySelector('#xnor-loose');

      // 00
      assert.html.textContent(not, 'true', 'not1');
      assert.html.textContent(and, 'false', 'and1');
      assert.html.textContent(or, 'false', 'or1');
      assert.html.textContent(xor, 'false', 'xor1');
      assert.html.textContent(xnor, 'true', 'xnor1');
      assert.html.textContent(xorLoose, 'false', 'xorLoose1');
      assert.html.textContent(xnorLoose, 'true', 'xnorLoose1');

      // 10
      vm.a = true;
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(not, 'false', 'not2');
      assert.html.textContent(and, 'false', 'and2');
      assert.html.textContent(or, 'true', 'or2');
      assert.html.textContent(xor, 'true', 'xor2');
      assert.html.textContent(xnor, 'false', 'xnor2');
      assert.html.textContent(xorLoose, 'true', 'xorLoose2');
      assert.html.textContent(xnorLoose, 'false', 'xnorLoose2');

      // 11
      vm.b = true;
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(and, 'true', 'and3');
      assert.html.textContent(or, 'true', 'or3');
      assert.html.textContent(xor, 'false', 'xor3');
      assert.html.textContent(xnor, 'true', 'xnor3');
      assert.html.textContent(xorLoose, 'false', 'xorLoose3');
      assert.html.textContent(xnorLoose, 'true', 'xnorLoose3');

      // 01
      vm.a = false;
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(and, 'false', 'and4');
      assert.html.textContent(or, 'true', 'or4');
      assert.html.textContent(xor, 'true', 'xor4');
      assert.html.textContent(xnor, 'false', 'xnor4');
      assert.html.textContent(xorLoose, 'true', 'xorLoose4');
      assert.html.textContent(xnorLoose, 'false', 'xnorLoose4');

      const ecYSq = demo.querySelector('#ecysq');
      const ecY = demo.querySelector('#ecy');
      const linex = demo.querySelector('#linex');

      const { line, ec } = vm;
      const getEcYSqNum = () => ec.x ** 3 - ec.a * ec.x + ec.b;
      const getEcYsq = () => getEcYSqNum().toString();
      const getEcY = () => Math.sqrt(getEcYSqNum()).toString();
      const getLinex = () => ((line.y - line.intercept) / line.slope).toString();

      assert.html.textContent(ecYSq, getEcYsq(), 'ecysq1');
      assert.html.textContent(ecY, getEcY(), 'ecy1');
      assert.html.textContent(linex, getLinex(), 'linex1');

      line.slope = 4;
      ec.a = 10;
      ctx.platform.domWriteQueue.flush();
      assert.html.textContent(ecYSq, getEcYsq(), 'ecysq2');
      assert.html.textContent(ecY, getEcY(), 'ecy2');
      assert.html.textContent(linex, getLinex(), 'linex2');
    }, { method, componentMode });

    [
      {
        id: 1,
        title: `binds number-string object array to select-dropdwon`,
        collProp: 'items1' as const,
        chosenProp: 'selectedItem1' as const
      },
      {
        id: 2,
        title: `binds object-string object array to select-dropdwon`,
        collProp: 'items2' as const,
        chosenProp: 'selectedItem2' as const
      },
      {
        id: 3,
        title: `binds object-string object array with matcher to select-dropdwon`,
        collProp: 'items3' as const,
        chosenProp: 'selectedItem3' as const
      },
      {
        id: 4,
        title: `binds string-string array to select-dropdwon`,
        collProp: 'items4' as const,
        chosenProp: 'selectedItem4' as const
      }
    ].map(({ id, title, collProp, chosenProp }) =>
      $it(`${title} - ${method} - ${componentMode}`, function ({ host, ctx }) {
        const app = getViewModel<App>(host);
        const items = app[collProp];
        const select: HTMLSelectElement = host.querySelector(`select-dropdown select#select${id}`);
        const options: HTMLOptionElement[] = toArray(select.querySelectorAll('option'));
        const size = items.length;

        // initial
        assert.equal(options.length, size + 1);
        assert.equal(options[1].selected, true, 'option0');

        // assert if the choice is changed in VM, it is propagated to view
        app[chosenProp] = items[1].id;
        ctx.platform.domWriteQueue.flush();
        assert.equal(options[2].selected, true, 'option1');

        // assert that when choice is changed from view, it is propagaetd to VM
        [options[2].selected, options[3].selected] = [false, true];
        select.dispatchEvent(new Event('change'));
        ctx.platform.domWriteQueue.flush();
        if (title.includes('matcher')) {
          assert.deepEqual(app[chosenProp], items[2].id, 'selectedProp');
        } else {
          assert.equal(app[chosenProp], items[2].id, 'selectedProp');
        }
      }, { method, componentMode })
    );

    [
      {
        id: 11,
        title: `binds number-string object array to select-dropdwon - multiple`,
        collProp: 'items1' as const,
        chosenProp: 'selectedItems1' as const
      },
      {
        id: 21,
        title: `binds object-string object array to select-dropdwon - multiple`,
        collProp: 'items2' as const,
        chosenProp: 'selectedItems2' as const
      },
      {
        id: 31,
        title: `binds object-string object array with matcher to select-dropdwon - multiple`,
        collProp: 'items3' as const,
        chosenProp: 'selectedItems3' as const
      },
      {
        id: 41,
        title: `binds string-string array to select-dropdwon - multiple`,
        collProp: 'items4' as const,
        chosenProp: 'selectedItems4' as const
      }
    ].map(({ id, title, collProp, chosenProp }) =>
      $it(`${title} - ${method} - ${componentMode}`, function ({ host, ctx }) {
        const app = getViewModel<App>(host);
        const items = app[collProp];
        const select: HTMLSelectElement = host.querySelector(`select-dropdown select#select${id}`);
        const options: HTMLOptionElement[] = toArray(select.querySelectorAll('option'));
        const size = items.length;

        // initial
        assert.equal(options.length, size + 1);
        assert.equal(options[1].selected, true, 'option10');

        // assert if the choice is changed in VM, it is propagated to view
        app[chosenProp].push(items[1].id);
        ctx.platform.domWriteQueue.flush();
        assert.equal(options[1].selected, true, 'option11');
        assert.equal(options[2].selected, true, 'option21');

        // assert that when choice is changed from view, it is propagaetd to VM
        options[3].selected = true;
        select.dispatchEvent(new Event('change'));
        ctx.platform.domWriteQueue.flush();
        assert.equal(options[1].selected, true, 'option13');
        assert.equal(options[2].selected, true, 'option23');
        assert.equal(options[3].selected, true, 'option33');
        if (title.includes('matcher')) {
          assert.deepEqual(app[chosenProp], items.map(i => i.id), 'selectedProp');
        } else {
          assert.equal(items.every((item, i) => Object.is(item.id, app[chosenProp][i])), true);
        }
      }, { method, componentMode })
    );

    [
      { useCSSModule: false, selectedHeaderColor: 'rgb(255, 0, 0)', selectedDetailsColor: 'rgb(106, 106, 106)' },
      { useCSSModule: true, selectedHeaderColor: 'rgb(0, 0, 255)', selectedDetailsColor: 'rgb(203, 203, 203)' },
    ].map(({ useCSSModule, selectedHeaderColor, selectedDetailsColor }) =>
      $it(`uses cards to display topic details which marks the selected topic with a specific color - useCSSModule:${useCSSModule} - ${method} - ${componentMode}`,
        async function ({ host, ctx }) {
          const container1 = host.querySelector('cards #cards1');
          const container2 = host.querySelector('cards #cards2');
          const cards1 = toArray(container1.querySelectorAll('div'));
          const cards2 = toArray(container2.querySelectorAll('div'));

          assert.html.computedStyle(container1, { display: 'flex' }, 'incorrect container1 display');
          assert.html.computedStyle(container2, { display: 'flex' }, 'incorrect container2 display');
          assert.equal(cards1.every((card) => card.querySelector('footer').classList.contains('foo-bar')), true);
          assert.html.computedStyle(cards1[0], { backgroundColor: selectedHeaderColor }, 'incorrect selected background1 - container1');
          assert.html.computedStyle(cards1[0].querySelector('span'), { color: selectedDetailsColor }, 'incorrect selected color1 - container1');
          assert.html.computedStyle(cards2[0], { backgroundColor: selectedHeaderColor }, 'incorrect selected background1 - container2');
          assert.html.computedStyle(cards2[0].querySelector('span'), { color: selectedDetailsColor }, 'incorrect selected color1 - container2');

          cards1[1].click();
          ctx.platform.domWriteQueue.flush();

          assert.html.computedStyle(cards1[0], { backgroundColor: 'rgba(0, 0, 0, 0)' }, 'incorrect background1 - container1');
          assert.html.computedStyle(cards1[0].querySelector('span'), { color: 'rgb(0, 0, 0)' }, 'incorrect color1 - container1');
          assert.html.computedStyle(cards1[1], { backgroundColor: selectedHeaderColor }, 'incorrect selected background2 - container1');
          assert.html.computedStyle(cards1[1].querySelector('span'), { color: selectedDetailsColor }, 'incorrect selected color2 - container1');

          assert.html.computedStyle(cards2[0], { backgroundColor: 'rgba(0, 0, 0, 0)' }, 'incorrect background1 - container2');
          assert.html.computedStyle(cards2[0].querySelector('span'), { color: 'rgb(0, 0, 0)' }, 'incorrect color1 - container2');
          assert.html.computedStyle(cards2[1], { backgroundColor: selectedHeaderColor }, 'incorrect selected background2 - container2');
          assert.html.computedStyle(cards2[1].querySelector('span'), { color: selectedDetailsColor }, 'incorrect selected color2 - container2');
        },
        { useCSSModule, method, componentMode }));

    $it(`cards uses inline styles - ${method} - ${componentMode}`, async function ({ host, ctx }) {
      const cardsEl = host.querySelector('cards');
      const cardsVm = getViewModel<Cards>(cardsEl);

      for (const id of ['simple-style', 'inline-bound-style', 'bound-style-obj', 'bound-style-array', 'bound-style-str']) {
        assert.html.computedStyle(
          cardsEl.querySelector(`p#${id}`),
          { backgroundColor: 'rgb(255, 0, 0)', fontWeight: '700' },
          `style ${id}`
        );
      }

      cardsVm.styleStr = 'background-color: rgb(0, 0, 255); border: 1px solid rgb(0, 255, 0)';
      cardsVm.styleObj = { 'background-color': 'rgb(0, 0, 255)', 'border': '1px solid rgb(0, 255, 0)' };
      cardsVm.styleArray = [{ 'background-color': 'rgb(0, 0, 255)' }, { 'border': '1px solid rgb(0, 255, 0)' }];
      ctx.platform.domWriteQueue.flush();

      for (const id of ['bound-style-obj', 'bound-style-array', 'bound-style-str']) {
        const para = cardsEl.querySelector(`p#${id}`);
        assert.html.computedStyle(
          para,
          {
            backgroundColor: 'rgb(0, 0, 255)',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
            borderRightWidth: '1px',
            borderLeftWidth: '1px',
            borderTopStyle: 'solid',
            borderBottomStyle: 'solid',
            borderRightStyle: 'solid',
            borderLeftStyle: 'solid',
            borderTopColor: 'rgb(0, 255, 0)',
            borderBottomColor: 'rgb(0, 255, 0)',
            borderRightColor: 'rgb(0, 255, 0)',
            borderLeftColor: 'rgb(0, 255, 0)',
          },
          `style ${id} - post change`);
        assert.html.notComputedStyle(
          para,
          { fontWeight: '700' },
          `font-weight ${id} - post change`);
      }
    }, { method, componentMode });

    $it(`cards have image - ${method} - ${componentMode}`, async function ({ host, ctx }) {
      const images: HTMLImageElement[] = toArray(host.querySelectorAll('cards #cards1 div img'));
      const { heroes } = getViewModel<App>(host);

      for (let i = 0; i < images.length; i++) {
        assert.equal(images[i].src.endsWith(heroes[i].imgSrc), true, `incorrect img src#${i + 1}`);
      }

      heroes[0].imgSrc = undefined;
      ctx.platform.domWriteQueue.flush();
      assert.equal(images[0].src, '', `expected null img src`);

      const imgSrc = "foobar.jpg";
      heroes[0].imgSrc = imgSrc;
      ctx.platform.domWriteQueue.flush();
      assert.equal(images[0].src.endsWith(imgSrc), true, `incorrect img src`);
    }, { method, componentMode });

    $it(`uses random-generator which generates a random number iff the container div is clicked - ${method} - ${componentMode}`, async function ({ host, ctx }) {
      const ce = host.querySelector("random-generator");
      const vm = getViewModel<RandomGenerator>(ce);
      const container = ce.querySelector("div");
      const button = container.querySelector("button");

      let prev = vm.random;
      const assertAttr = () => {
        assert.strictEqual(container['foobar'], vm.random, 'container.foobar === vm.random');
        // 1) foo-bar.bind="random & attr" !== 2) foobar.bind="random",
        // (1) targets fooBar(which will be turned to foobar) attribute, while 2 targets foobar property,
        // and foobar attribute is not linked to foobar property
        // so they have different values
        assert.strictEqual(container.getAttribute('foobar'), String(vm.random), 'container.getAttribute(foobar) === String(vm.random)');
        assert.strictEqual(container['foo-bar'], undefined, 'container.foo-bar === undefined');
        assert.strictEqual(container.getAttribute('foo-bar'), null, 'container.getAttribute(foo-bar) === null');
      };
      assertAttr();

      // self BB
      container.click();
      ctx.platform.domWriteQueue.flush();
      assert.notEqual(vm.random, prev, 'new random expected1');
      assertAttr();

      prev = vm.random;
      button.click();
      ctx.platform.domWriteQueue.flush();
      assert.equal(vm.random, prev, 'new random not expected');

      container.click();
      ctx.platform.domWriteQueue.flush();
      assert.notEqual(vm.random, prev, 'new random expected2');
      assertAttr();
    }, { method, componentMode });
  });
});
