import { AppTask, IListenerBehaviorOptions } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/listener.spec.ts', function () {
  it('invokes expression', async function () {
    let log = 0;
    const { getBy } = await createFixture(
      '<button click.trigger="onClick()">',
      { onClick() { log++; } },
    ).promise;

    getBy('button').click();
    assert.strictEqual(log, 1);
  });

  it('invoke handler after evaluating expression when expAsHandler = true', async function () {
    let log = 0;
    const { getBy } = await createFixture(
      '<button click.trigger="onClick">',
      { onClick() { log++; } },
      [AppTask.beforeCreate(IListenerBehaviorOptions, o => { o.expAsHandler = true; })]
    ).promise;

    getBy('button').click();
    assert.strictEqual(log, 1);
  });
});
