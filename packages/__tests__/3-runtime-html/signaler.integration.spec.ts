import { LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { customElement, ISignaler, valueConverter, Aurelia } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('signaler.integration', function () {
  it('1 non-observed input and 2 observed inputs - toView', async function () {
    const ctx = TestContext.createHTMLTestContext();
    const tq = ctx.scheduler.getRenderTaskQueue();

    ctx.container.register(LoggerConfiguration.create({ $console: console, level: LogLevel.warn }));
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

    assert.visibleTextEqual(au.root, '1', 'assert #1');
    assert.isSchedulerEmpty();

    component.increment();
    assert.visibleTextEqual(au.root, '1', 'assert #2');
    tq.flush();
    assert.visibleTextEqual(au.root, '2', 'assert #3');

    component.factor = 2;
    assert.visibleTextEqual(au.root, '2', 'assert #4');
    tq.flush();
    assert.visibleTextEqual(au.root, '6', 'assert #5');

    component.increment();
    assert.visibleTextEqual(au.root, '6', 'assert #6');
    tq.flush();
    assert.visibleTextEqual(au.root, '8', 'assert #7');

    component.input = 10;
    assert.visibleTextEqual(au.root, '8', 'assert #8');
    tq.flush();
    assert.visibleTextEqual(au.root, '20', 'assert #9');

    component.increment();
    assert.visibleTextEqual(au.root, '20', 'assert #10');
    tq.flush();
    assert.visibleTextEqual(au.root, '22', 'assert #11');

    await au.stop();
  });

  describe('array index assignment with repeater', function () {
    for (const expr of [
      `& signal:'updateItem'`,
      `& oneTime & signal:'updateItem'`,
      `& signal:'updateItem' & oneTime`,
    ]) {
      it(expr, async function () {
        const ctx = TestContext.createHTMLTestContext();
        const tq = ctx.scheduler.getRenderTaskQueue();

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

        assert.visibleTextEqual(au.root, '012', 'assert #1');
        assert.isSchedulerEmpty();

        items[0] = 2;
        assert.isSchedulerEmpty();
        component.updateItem();
        assert.visibleTextEqual(au.root, '012', 'assert #2');
        tq.flush();
        assert.visibleTextEqual(au.root, '212', 'assert #3');

        items[0] = 3;
        items[1] = 4;
        items[2] = 5;
        assert.isSchedulerEmpty();
        component.updateItem();
        assert.visibleTextEqual(au.root, '212', 'assert #3');
        tq.flush();
        assert.visibleTextEqual(au.root, '345', 'assert #4');

        items.reverse();
        assert.visibleTextEqual(au.root, '345', 'assert #5');
        if (expr.includes('oneTime')) {
          tq.flush();
          assert.visibleTextEqual(au.root, '345', 'assert #6');
          component.updateItem();
          assert.visibleTextEqual(au.root, '345', 'assert #7');
          tq.flush();
          assert.visibleTextEqual(au.root, '543', 'assert #8');
        } else {
          tq.flush();
          assert.visibleTextEqual(au.root, '543', 'assert #9');
        }

        items[1] = 6;
        assert.isSchedulerEmpty();
        component.updateItem();
        assert.visibleTextEqual(au.root, '543', 'assert #10');
        tq.flush();
        assert.visibleTextEqual(au.root, '563', 'assert #11');

        await au.stop();
      });
    }
  });
});
