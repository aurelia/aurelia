import { ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/listener.spec.ts', function () {
  it('invokes expression', function () {
    let log = 0;
    const { getBy } = createFixture(
      '<button click.trigger="onClick()">',
      { onClick() { log++; } },
    );

    getBy('button').click();
    assert.strictEqual(log, 1);
  });

  it('works with value converter', function () {
    let log = 0;
    let vcLog = 0;
    const { trigger } = createFixture(
      '<button click.trigger="onClick() | identity">',
      { onClick() { log++; } },
      [ValueConverter.define('identity', class {
        toView(a: any) {
          vcLog++;
          return a;
        }
      })]
    );

    trigger.click('button');
    assert.strictEqual(log, 1);
    assert.strictEqual(vcLog, 1);
  });

  it('invoke handler after evaluating expression', function () {
    let log = 0;
    const { trigger } = createFixture(
      '<button click.trigger="onClick">',
      { onClick() { log++; } },
    );

    trigger.click('button');
    assert.strictEqual(log, 1);
  });

  it('invokes handler after evaluating expression with correct context', function () {
    const { component, trigger } = createFixture(
      '<button click.trigger="onClick">',
      { log: 0, onClick() { this.log++; } },
    );

    trigger.click('button');
    assert.strictEqual(component.log, 1);
  });

  it('invoke lambda handler', function () {
    let log = 0;
    const { trigger } = createFixture(
      '<button click.trigger="() => onClick()">',
      { onClick() { log++; } },
    );

    trigger.click('button');
    assert.strictEqual(log, 1);
  });
});
