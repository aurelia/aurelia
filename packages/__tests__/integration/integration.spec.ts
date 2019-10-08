import { CustomElement } from '@aurelia/runtime';
import { assert, fail } from '@aurelia/testing';
import { App } from './app/app';
import { startup, TestExecutionContext } from './app/startup';

describe('app', function () {

  function getText(el: Element) {
    return el && el.textContent.replace(/\s\s+/g, ' ').trim();
  }

  function getViewModel<T>(element: Element) {
    const { viewModel } = CustomElement.behaviorFor(element) as unknown as { viewModel: T };
    return viewModel;
  }

  async function executeTest(testFunction: (ctx: TestExecutionContext) => Promise<void> | void) {
    const ctx = await startup();
    try {
      await testFunction(ctx);
    } catch (e) {
      fail(e);
    } finally {
      await ctx.tearDown();
    }
  }

  it('has some readonly texts with different binding modes', async function () {
    await executeTest(({ host }) => {
      for (let i = 0; i < 4; i++) {
        assert.equal(getText(host.querySelector(`read-only-text#text${i}`)), `text${i}`);
      }
    });
  });

  it('changes in bound VM properties are correctly reflected in the read-only-texts', async function () {
    await executeTest(async ({ host, ctx }) => {
      (host.querySelector('button#staticTextChanger') as unknown as HTMLButtonElement).click();
      await ctx.lifecycle.nextFrame;

      assert.equal(getText(host.querySelector("read-only-text#text0")), "text0");
      assert.equal(getText(host.querySelector("read-only-text#text1")), "text1");
      assert.equal(getText(host.querySelector("read-only-text#text2")), "newText2");
      assert.equal(getText(host.querySelector("read-only-text#text3")), "newText3");
    });
  });

  it('has some textual inputs with different binding modes', async function () {
    await executeTest(({ host }) => {
      const _static: HTMLInputElement = host.querySelector('#input-static input');
      const oneTime: HTMLInputElement = host.querySelector('#input-one-time input');
      const twoWay: HTMLInputElement = host.querySelector('#input-two-way input');
      const toView: HTMLInputElement = host.querySelector('#input-to-view input');
      const fromView: HTMLInputElement = host.querySelector('#input-from-view input');
      const blurredInputTw: HTMLInputElement = host.querySelector('#blurred-input-two-way input');
      const blurredInputFv: HTMLInputElement = host.querySelector('#blurred-input-from-view input');

      const vm = getViewModel<App>(host);

      assert.equal(_static.value, 'input0');
      assert.equal(oneTime.value, vm.inputOneTime);
      assert.equal(twoWay.value, vm.inputTwoWay);
      assert.equal(toView.value, vm.inputToView);
      assert.equal(fromView.value, '');
      assert.equal(blurredInputTw.value, vm.inputBlrTw);
      assert.equal(blurredInputFv.value, '');
    });
  });

  it('changes in the text-input are reflected correctly as per binding mode', async function () {
    await executeTest(async ({ host, ctx }) => {
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
  });

  it('changes in the vm property are reflected in text-inputs correctly as per binding mode', async function () {
    await executeTest(async ({ host, ctx }) => {
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

      assert.equal(oneTime.value, 'input1');
      assert.equal(twoWay.value, newInputs[1]);
      assert.equal(toView.value, newInputs[2]);
      assert.equal(fromView.value, '');
    });
  });

  it('changes in the text-input are reflected correctly according to update-trigger event', async function () {
    await executeTest(async ({ host, ctx }) => {
      const twoWay: HTMLInputElement = host.querySelector('#blurred-input-two-way input');
      const fromView: HTMLInputElement = host.querySelector('#blurred-input-from-view input');

      const vm = getViewModel<App>(host);
      assert.equal(twoWay.value, vm.inputBlrTw);
      assert.equal(fromView.value, '');

      const newInputFv = 'new blurred input fv', newInputTw = 'new blurred input tw';
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
  });

  it.skip('uses specs-viewer to "compose" display for heterogenous collection of things', async function () {
    await executeTest(({ host }) => {
      const specsViewer = host.querySelector('specs-viewer');
      assert.notEqual(specsViewer, null);
      console.log(specsViewer.outerHTML);

      const vm = getViewModel<App>(host);
      const [camera, laptop] = vm.things;
      assert.equal(getText(specsViewer.querySelector("h2")), `${camera.modelNumber} by ${camera.make}`);
    });
  });

  it('uses a user preference control that "computes" the full name of the user correctly - static', async function () {
    await executeTest(async ({ host, ctx }) => {

      const { user } = getViewModel<App>(host);

      const userPref = host.querySelector('user-preference');

      const statc = userPref.querySelector("#static");
      const nonStatic = userPref.querySelector("#nonStatic");
      const wrongStatic = userPref.querySelector("#wrongStatic");

      assert.equal(getText(statc), 'John Doe', 'incorrect text statc');
      assert.equal(getText(nonStatic), 'infant', 'incorrect text nonStatic');
      assert.equal(getText(wrongStatic), 'infant', 'incorrect text wrongStatic');

      const { changes: uc } = user;
      uc.clear();
      user.firstName = 'Jane';
      ctx.lifecycle.processRAFQueue(undefined);
      assert.equal(getText(statc), 'Jane Doe', 'incorrect text statc - fname');
      assert.equal(getText(nonStatic), 'infant', 'incorrect text nonStatic - fname');
      assert.equal(getText(wrongStatic), 'infant', 'incorrect text wrongStatic - fname');
      assert.equal(uc.has('static'), true, 'static change should have triggered - fname');
      assert.equal(uc.has('nonStatic'), false, 'nonStatic change should not have triggered - fname');
      assert.equal(uc.has('wrongStatic'), false, 'wrongStatic change should not have triggered - fname');

      uc.clear();
      user.age = 10;
      ctx.lifecycle.processRAFQueue(undefined);
      assert.equal(getText(statc), 'Jane Doe', 'incorrect text statc - age');
      assert.equal(getText(nonStatic), 'Jane Doe', 'incorrect text nonStatic - age');
      assert.equal(getText(wrongStatic), 'Jane Doe', 'incorrect text wrongStatic - age');
      assert.equal(uc.has('static'), false, 'static change should not have triggered - age');
      assert.equal(uc.has('nonStatic'), true, 'nonStatic change should have triggered - age');
      assert.equal(uc.has('wrongStatic'), true, 'wrongStatic change should have triggered - age');

      uc.clear();
      user.lastName = 'Smith';
      ctx.lifecycle.processRAFQueue(undefined);
      assert.equal(getText(statc), 'Jane Smith', 'incorrect text statc - lname');
      assert.equal(getText(nonStatic), 'Jane Smith', 'incorrect text nonStatic - lname');
      assert.equal(getText(wrongStatic), 'Jane Doe', 'incorrect text wrongStatic - lname');
      assert.equal(uc.has('static'), true, 'static change should have triggered - lname');
      assert.equal(uc.has('nonStatic'), true, 'nonStatic change should have triggered - lname');
      assert.equal(uc.has('wrongStatic'), false, 'wrongStatic change should have triggered - lname');
    });
  });

  it('uses a user preference control that "computes" the organization of the user correctly - volatile', async function () {
    await executeTest(async ({ host, ctx }) => {

      const { user } = getViewModel<App>(host);

      const userPref = host.querySelector('user-preference');

      const nonVolatile = userPref.querySelector("#nonVolatile");
      const volatile = userPref.querySelector("#volatile");

      assert.equal(getText(nonVolatile), 'Role1, Org1', 'incorrect text nonVolatile');
      assert.equal(getText(volatile), 'City1, Country1', 'incorrect text volatile');

      const { changes: uc } = user;
      uc.clear();
      user.roleNonVolatile = 'Role2';
      user.locationVolatile = 'Country2';
      ctx.lifecycle.processRAFQueue(undefined);
      assert.equal(getText(nonVolatile), 'Role2, Org1', 'incorrect text nonVolatile - role');
      assert.equal(getText(volatile), 'City1, Country2', 'incorrect text volatile - country');
      assert.equal(uc.has('nonVolatile'), true, 'nonVolatile change should have triggered - role');
      assert.equal(uc.has('volatile'), true, 'volatile change should have triggered - country');

      uc.clear();
      user.organization = 'Org2'
      user.city = 'City2';
      ctx.lifecycle.processRAFQueue(undefined);
      assert.equal(getText(nonVolatile), 'Role2, Org1', 'incorrect text nonVolatile - role');
      assert.equal(getText(volatile), 'City2, Country2', 'incorrect text volatile - country');
      assert.equal(uc.has('nonVolatile'), false, 'nonVolatile change should not have triggered - role');
      assert.equal(uc.has('volatile'), true, 'volatile change should have triggered - country');
    });
  });
});
