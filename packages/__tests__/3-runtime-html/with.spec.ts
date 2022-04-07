import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/with.spec.ts', function () {
  it('works with static scope', async function () {
    const template = `Application name: \${name}
    <div with.bind="contract">
      Contact name: <input value.bind="name">
      Contact address: <input value.bind="address">
    </div>`;
    const { ctx, appHost, component, startPromise, tearDown } = createFixture(
      template,
      class App {
        public name = 'Contract editor';
        public contract = {
          name: 'name-1',
          address: 'address-1'
        };
      }
    );

    await startPromise;

    assert.includes(appHost.textContent, 'Application name: Contract editor');
    const [input1, input2] = Array.from(appHost.querySelectorAll('input'));

    assert.strictEqual(input1.value, 'name-1');
    assert.strictEqual(input2.value, 'address-1');

    input1.value = 'name-11';
    input1.dispatchEvent(new ctx.Event('change'));
    assert.strictEqual(component.contract.name, 'name-11');

    await tearDown();
  });

  it('works with dynamic scope', async function () {
    const template = `
    <button repeat.for="contract of contracts" click.trigger="selected = contract">\${contract}</button>
    <div with.bind="selected">
      <input value.bind="name">
      <input value.bind="address">
    </div>`;
    const { ctx, appHost, startPromise, tearDown } = createFixture(
      template,
      class App {
        public contracts = [{
          name: 'name-1',
          address: 'address-1'
        }, {
          name: 'name-2',
          address: 'address-2'
        }];
      }
    );

    await startPromise;

    const buttons = Array.from(appHost.querySelectorAll('button'));
    const [input1, input2] = Array.from(appHost.querySelectorAll('input'));

    assert.strictEqual(input1.value, '');
    assert.strictEqual(input2.value, '');

    buttons[0].click();
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(input1.value, 'name-1');
    assert.strictEqual(input2.value, 'address-1');

    await tearDown();
  });

  it('works with dynamic scope + various kind of binding', async function () {
    const template = `
    <button repeat.for="contract of contracts" click.trigger="selected = contract">\${contract}</button>
    <div with.bind="selected">
      <input value.bind="name">
      <input value.bind="address">
      <span data-name=\${name} data-address.attr="address" ref="$parent.span">\${name}</span>
    </div>`;
    const { ctx, appHost, component, startPromise, tearDown } = createFixture(
      template,
      class App {
        public span: HTMLSpanElement;
        public contracts = [{
          name: 'name-1',
          address: 'address-1'
        }, {
          name: 'name-2',
          address: 'address-2'
        }];
      }
    );

    await startPromise;

    const buttons = Array.from(appHost.querySelectorAll('button'));
    const [input1, input2] = Array.from(appHost.querySelectorAll('input'));

    assert.strictEqual(input1.value, '');
    assert.strictEqual(input2.value, '');

    buttons[0].click();
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(input1.value, 'name-1');
    assert.strictEqual(input2.value, 'address-1');

    const span = appHost.querySelector('span');
    assert.strictEqual(span.textContent, 'name-1');
    assert.strictEqual(span.getAttribute('data-name'), 'name-1');
    assert.strictEqual(span.getAttribute('data-address'), 'address-1');

    assert.strictEqual(component.span, span);

    await tearDown();
  });
});
