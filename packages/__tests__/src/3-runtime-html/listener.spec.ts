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

  describe('invoke assignment handler', function () {
    describe('with arrow fn', function () {
      it('prefix increment', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => ++a">',
          { a: 0 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 1);
      });

      it('prefix increment assign', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => b = ++a">',
          { a: 0, b: 0 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 1);
        assert.strictEqual(component.b, 1);
      });

      it('postfix increment', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => a++">',
          { a: 0 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 1);
      });

      it('postfix increment assign', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => b = a++">',
          { a: 0, b: 0 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 1);
        assert.strictEqual(component.b, 0);
      });

      it('prefix decrement', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => --a">',
          { a: 1 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 0);
      });

      it('prefix decrement assign', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => b = --a">',
          { a: 1, b: 1 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 0);
        assert.strictEqual(component.b, 0);
      });

      it('postfix decrement', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => a--">',
          { a: 1 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 0);
      });

      it('postfix decrement assign', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => b = a--">',
          { a: 1, b: 1 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 0);
        assert.strictEqual(component.b, 1);
      });

      it('assignment increment', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => a += 2">',
          { a: 0 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 2);
      });

      it('assignment increment assign', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => b = a += 2">',
          { a: 0, b: 0 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 2);
        assert.strictEqual(component.b, 2);
      });

      it('assignment division', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => a /= 2">',
          { a: 2 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 1);
      });

      it('assignment multiplication', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => a *= 2">',
          { a: 2 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 4);
      });

      it('assignment decrement', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="() => a -= 2">',
          { a: 2 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 0);
      });
    });

    describe('without arrow fn', function () {
      it('prefix increment', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="++a">',
          { a: 0 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 1);
      });

      it('postfix increment', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="a++">',
          { a: 0 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 1);
      });

      it('assignment increment', function () {
        const { trigger, component } = createFixture(
          '<button click.trigger="a += 2">',
          { a: 0 },
        );

        trigger.click('button');
        assert.strictEqual(component.a, 2);
      });
    });
  });
});
