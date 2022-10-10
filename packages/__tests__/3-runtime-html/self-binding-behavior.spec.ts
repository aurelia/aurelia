import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/self-binding-behavior.spec.ts', function () {
  it('works with event binding', function () {
    let count = 0;
    const { getBy } = createFixture
      .component({
        call() {
          count++;
        },
        call2() {
          count = 2;
        }
      })
      .html`<div click.trigger="call() & self"><button click.trigger="call2()">Click me</button></div>`
      .build();

    getBy('button').click();
    assert.strictEqual(count, 2);

    getBy('div').click();
    assert.strictEqual(count, 3);
  });

  it('throws on non listener binding', async function () {
    const { appHost, start } = createFixture(`<div click.bind="m & self">`, {}, [], false);
    assert.throws(() => start());
    appHost.remove();
  });
});
