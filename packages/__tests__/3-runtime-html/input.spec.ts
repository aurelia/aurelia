import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/input.spec.ts', function () {
  it('works: input[text] value.bind', async function () {
    const { startPromise, appHost, tearDown, component, ctx } = createFixture(
      `<input value.bind="message">`,
      class App {
        public message = 'Hello';
      }
    );
    await startPromise;

    const input= appHost.querySelector('input');
    assert.strictEqual(input.value, 'Hello');

    input.value = 'world';
    input.dispatchEvent(new ctx.Event('change'));
    assert.strictEqual(component.message, 'world');

    component.message = 'hello world';
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(input.value, 'hello world');

    await tearDown();
  });

  it('works: input[number] + value-as-number.bind', async function () {
    const { startPromise, appHost, tearDown, component, ctx } = createFixture(
      `<input type=number value-as-number.bind="count">`,
      class App {
        public count = 0;
      }
    );
    await startPromise;

    const input= appHost.querySelector('input');
    assert.strictEqual(input.value, '0');
    assert.strictEqual(input.valueAsNumber, 0);

    input.value = '100';
    input.dispatchEvent(new ctx.Event('change'));
    assert.strictEqual(component.count, 100);

    await tearDown();
  });

  it('works: textarea + value.bind', async function () {
    const { startPromise, appHost, tearDown, component, ctx } = createFixture(
      `<textarea value.bind="message">`,
      class App {
        public message = 'Hello';
      }
    );
    await startPromise;

    const input= appHost.querySelector('textarea');
    assert.strictEqual(input.value, 'Hello');

    input.value = 'world';
    input.dispatchEvent(new ctx.Event('change'));
    assert.strictEqual(component.message, 'world');

    component.message = 'hello world';
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(input.value, 'hello world');

    await tearDown();
  });
});
