import { ConsoleSink, LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { ISignaler } from '@aurelia/runtime';
import { customElement, valueConverter, Aurelia, ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture, TestContext } from '@aurelia/testing';

describe('3-runtime-html/signaler.integration.spec.ts', function () {
  it('1 non-observed input and 2 observed inputs - toView', async function () {
    const ctx = TestContext.create();
    const tq = ctx.platform.domWriteQueue;

    ctx.container.register(LoggerConfiguration.create({ sinks: [ConsoleSink], level: LogLevel.warn }));
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');

    let counter = 0;

    @valueConverter({ name: 'add' })
    class AddValueConverter {
      public toView(input: number, factor: number): number {
        return input + (++counter * factor);
      }
    }

    @customElement({
      name: 'app',
      template: `\${input | add:factor & signal:'increment'}`,
      dependencies: [AddValueConverter],
    })
    class App {
      public input: number = 0;
      public factor: number = 1;

      public constructor(
        @ISignaler private readonly signaler: ISignaler,
      ) {}

      public increment(): void {
        this.signaler.dispatchSignal('increment');
      }
    }

    const component = au.container.get(App);
    au.app({ host, component });

    await au.start();

    assert.visibleTextEqual(host, '1', 'assert #1');
    assert.areTaskQueuesEmpty();

    component.increment();
    assert.visibleTextEqual(host, '1', 'assert #2');
    tq.flush();
    assert.visibleTextEqual(host, '2', 'assert #3');

    component.factor = 2;
    assert.visibleTextEqual(host, '2', 'assert #4');
    tq.flush();
    assert.visibleTextEqual(host, '6', 'assert #5');

    component.increment();
    assert.visibleTextEqual(host, '6', 'assert #6');
    tq.flush();
    assert.visibleTextEqual(host, '8', 'assert #7');

    component.input = 10;
    assert.visibleTextEqual(host, '8', 'assert #8');
    tq.flush();
    assert.visibleTextEqual(host, '20', 'assert #9');

    component.increment();
    assert.visibleTextEqual(host, '20', 'assert #10');
    tq.flush();
    assert.visibleTextEqual(host, '22', 'assert #11');

    await au.stop();
  });

  describe('array index assignment with repeater', function () {
    for (const expr of [
      `& signal:'updateItem'`,
      `& oneTime & signal:'updateItem'`,
      `& signal:'updateItem' & oneTime`,
    ]) {
      it(expr, async function () {
        const ctx = TestContext.create();
        const tq = ctx.platform.domWriteQueue;

        ctx.container.register(LoggerConfiguration.create({ $console: console, level: LogLevel.warn }));
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement('div');

        const items = [0, 1, 2];

        @customElement({
          name: 'app',
          template: `<div repeat.for="i of 3">\${items[i] ${expr}}</div>`,
        })
        class App {
          public items: number[] = items;

          public constructor(
            @ISignaler private readonly signaler: ISignaler,
          ) {}

          public updateItem(): void {
            this.signaler.dispatchSignal('updateItem');
          }
        }

        const component = au.container.get(App);
        au.app({ host, component });

        await au.start();

        assert.visibleTextEqual(host, '012', 'assert #1');
        assert.areTaskQueuesEmpty();

        items[0] = 2;
        assert.areTaskQueuesEmpty();
        component.updateItem();
        assert.visibleTextEqual(host, '012', 'assert #2');
        tq.flush();
        assert.visibleTextEqual(host, '212', 'assert #3');

        items[0] = 3;
        items[1] = 4;
        items[2] = 5;
        assert.areTaskQueuesEmpty();
        component.updateItem();
        assert.visibleTextEqual(host, '212', 'assert #3');
        tq.flush();
        assert.visibleTextEqual(host, '345', 'assert #4');

        items.reverse();
        assert.visibleTextEqual(host, '345', 'assert #5');
        if (expr.includes('oneTime')) {
          tq.flush();
          assert.visibleTextEqual(host, '345', 'assert #6');
          component.updateItem();
          assert.visibleTextEqual(host, '345', 'assert #7');
          tq.flush();
          assert.visibleTextEqual(host, '543', 'assert #8');
        } else {
          tq.flush();
          assert.visibleTextEqual(host, '543', 'assert #9');
        }

        items[1] = 6;
        assert.areTaskQueuesEmpty();
        component.updateItem();
        assert.visibleTextEqual(host, '543', 'assert #10');
        tq.flush();
        assert.visibleTextEqual(host, '563', 'assert #11');

        await au.stop();
      });
    }
  });

  it('takes signal from multiple value converters', function () {
    let addCount = 0;
    let minusCount = 0;
    const { assertText, flush, container } = createFixture
      .component({ value: 0 })
      .html`\${value | add | minus}`
      .deps(
        ValueConverter.define('add', class {
          signals = ['add'];
          toView = v => {
            addCount++;
            return v + 2;
          };
        }),
        ValueConverter.define('minus', class {
          signals = ['minus'];
          toView = v => {
            minusCount++;
            return v - 1;
          };
        }),
      )
      .build();

    assertText('1');
    assert.strictEqual(addCount, 1);
    assert.strictEqual(minusCount, 1);
    container.get(ISignaler).dispatchSignal('add');

    assert.strictEqual(addCount, 2);
    assert.strictEqual(minusCount, 2);
    container.get(ISignaler).dispatchSignal('minus');

    flush();
    assertText('1');
  });
});
