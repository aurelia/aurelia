import {
  IObserverLocator,
} from '@aurelia/runtime';
import {
  bindable,
  BindableObserver,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/batch.spec.ts', function () {

  it('handle recursive batches', async function () {
    const { component, appHost, startPromise, tearDown } = createFixture(`
      <button click.trigger="incr()">Incr()</button>
      <button click.trigger="decr()">Decr()</button>
      <div id="logs"><div repeat.for="log of logs">\${log}</div></div>
    `, MyApp);

    await startPromise;

    assert.deepStrictEqual(component.logs, []);
    const [incrButton, decrButton] = Array.from(appHost.querySelectorAll('button'));
    incrButton.click();

    assert.deepStrictEqual(
      component.logs,
      (Array
        .from({ length: 9 })
        .reduce((acc: unknown[], _: unknown, idx: number) => {
          acc.push(['P.1. countChanged()', idx + 1], ['S.1. handleChange()', idx + 1]);
          return acc;
        }, []) as unknown[])
        .concat([
          ['P.1. countChanged()', 10],
          ['After incr()', 10]
        ])
    );

    decrButton.click();
    const logs = (Array
      .from({ length: 9 })
      .reduce((acc: unknown[], _: unknown, idx: number) => {
        acc.push(['P.1. countChanged()', idx + 1], ['S.1. handleChange()', idx + 1]);
        return acc;
      }, []) as unknown[])
      .concat([
        ['P.1. countChanged()', 10],
        ['After incr()', 10]
      ]);

    assert.deepStrictEqual(
      component.logs,
      logs
        .concat(
          Array
            .from({ length: 9 })
            .reduce((acc: unknown[], _: unknown, idx: number) => {
              // start at 10 when click, but the first value log will be after the substraction of 1, which is 10 - 1
              acc.push(['P.1. countChanged()', 9 - idx], ['S.1. handleChange()', 9 - idx]);
              return acc;
            }, []) as unknown[]
        )
        .concat([
          ['P.1. countChanged()', 0],
          ['After decr()', 0]
        ])
    );

    await tearDown();
  });

  class MyApp {
    public message = 'Hello Aurelia 2!';

    public logs = [];

    @bindable
    public count: number = 0;

    public countObs: BindableObserver;
    public obsLoc: IObserverLocator;

    public created() {
      this.countObs = this['$controller'].container.get(IObserverLocator).getObserver(this, 'count');
      this.countObs.subscribe({
        handleChange: (value, oldValue) => {
          if (value > 0 && value < 10) {
            this.log('S.1. handleChange()', value);
            if (value > oldValue) {
              this.count++;
            } else {
              this.count--;
            }
          }
        }
      });
    }

    public countChanged(value: number) {
      this.log('P.1. countChanged()', value);
    }

    public incr() {
      if (this.count < 10) {
        this.count++;
        this.log('After incr()', this.count);
        // console.assert(this.count, 9);
      }
    }

    public decr() {
      if (this.count > 0) {
        this.count--;
        this.log('After decr()', this.count);
        // console.assert(this.count, 1);
      }
    }

    public log(...msgs: unknown[]) {
      this.logs.push(msgs);
    }
  }
});
