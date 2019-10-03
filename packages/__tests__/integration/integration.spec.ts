import { toArray } from '@aurelia/kernel';
import { assert, fail } from '@aurelia/testing';
import { startup, TestExecutionContext } from './app/startup';
import { CustomElement } from '@aurelia/runtime';
import { App } from './app/app';

describe.only('app', function () {

  function getText(el: Element) {
    return el && el.textContent.replace(/\s\s+/g, ' ').trim();
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
      const actual = toArray(host.querySelectorAll('read-only-text')).map(getText);
      const expected = new Array(actual.length).fill(0).map((_, i) => `text${i}`);

      assert.deepStrictEqual(actual, expected);
    });
  });

  it('changes in bound VM properties are correctly reflected in the read-only-texts', async function () {
    await executeTest(async ({ host, ctx }) => {
      (host.querySelector('button#staticTextChanger') as unknown as HTMLButtonElement).click();
      await ctx.lifecycle.nextFrame;

      const actual = toArray(host.querySelectorAll('read-only-text')).map(getText);
      const expected = ['text0', 'text1', 'newText2', 'newText3'];

      assert.deepStrictEqual(actual, expected);
    });
  });

  it('has some textual inputs with different binding modes', async function () {
    await executeTest(({ host }) => {
      const _static: HTMLInputElement = host.querySelector('#input-static input');
      const oneTime: HTMLInputElement = host.querySelector('#input-one-time input');
      const twoWay: HTMLInputElement = host.querySelector('#input-two-way input');
      const toView: HTMLInputElement = host.querySelector('#input-to-view input');
      const fromView: HTMLInputElement = host.querySelector('#input-from-view input');

      assert.equal(_static.value, 'input0');
      assert.equal(oneTime.value, 'input1');
      assert.equal(twoWay.value, 'input2');
      assert.equal(toView.value, 'input3');
      assert.equal(fromView.value, '');
    });
  });

  it('changes in the text-input are reflected correctly', async function () {
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

      const { viewModel } = CustomElement.behaviorFor(host) as unknown as { viewModel: App };
      assert.equal(viewModel.inputOneTime, 'input1');
      assert.equal(viewModel.inputTwoWay, newInputs[1]);
      assert.equal(viewModel.inputToView, 'input3');
      assert.equal(viewModel.inputFromView, newInputs[3]);
    });
  });

  it('changes in the vm property are reflected in text-inputs correctly', async function () {
    await executeTest(async ({ host, ctx }) => {
      const newInputs = new Array(4).fill(0).map((_, i) => `new input ${i + 1}`);
      const { viewModel } = CustomElement.behaviorFor(host) as unknown as { viewModel: App };
      viewModel.inputOneTime = newInputs[0];
      viewModel.inputTwoWay = newInputs[1];
      viewModel.inputToView = newInputs[2];
      viewModel.inputFromView = newInputs[3];

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

});
