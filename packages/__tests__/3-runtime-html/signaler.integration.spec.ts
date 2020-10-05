import { LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { Aurelia, customElement, ISignaler, valueConverter } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('signaler.integration', function () {
  it('1 non-observed input and 2 observed inputs - toView', async function () {
    const ctx = TestContext.createHTMLTestContext();
    const tq = ctx.scheduler.getRenderTaskQueue();

    ctx.container.register(LoggerConfiguration.create({ $console: console, level: LogLevel.trace }));
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

    await au.start().wait();

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

    await au.stop().wait();
  });
});
