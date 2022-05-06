import { ValueConverter } from '@aurelia/runtime';
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

  it('works with value converter', async function () {
    let log = 0;
    let vcLog = 0;
    const { trigger } = await createFixture(
      '<button click.trigger="onClick() | identity">',
      { onClick() { log++; } },
      [ValueConverter.define('identity', class {
        toView(a: any) {
          vcLog++;
          return a;
        }
      })]
    ).promise;

    trigger.click('button');
    assert.strictEqual(log, 1);
    assert.strictEqual(vcLog, 1);
  });

  it('invoke handler after evaluating expression when expAsHandler = true', async function () {
    let log = 0;
    const { trigger } = await createFixture(
      '<button click.trigger="onClick">',
      { onClick() { log++; } },
      [AppTask.beforeCreate(IListenerBehaviorOptions, o => { o.expAsHandler = true; })]
    ).promise;

    trigger.click('button');
    assert.strictEqual(log, 1);
  });

  it('expAsHandler = true + value converter', async function () {
    let log = 0;
    let vcLog = 0;
    const { trigger } = await createFixture(
      '<button click.trigger="onClick | identity">',
      { onClick() { log++; } },
      [
        AppTask.beforeCreate(IListenerBehaviorOptions, o => { o.expAsHandler = true; }),
        ValueConverter.define('identity', class {
          toView(a: any) {
            vcLog++;
            return a;
          }
        })
      ]
    ).promise;

    trigger.click('button');
    assert.strictEqual(log, 1);
    assert.strictEqual(vcLog, 1);
  });
});
