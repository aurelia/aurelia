import { IObservation, observable } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/effect.spec.ts', function () {
  it('runs effect with @observable', async function () {
    const { ctx, component, startPromise, tearDown } = createFixture('<div ref="div"></div>', class App {
      public div: HTMLDivElement;
    });

    await startPromise;

    class MouseTracker {
      @observable()
      public coord: [number, number] = [0, 0];

      public pretendMouseMove(x: number, y: number): void {
        this.coord = [x, y];
      }
    }

    assert.instanceOf(component.div, ctx.Element);

    let runCount = 0;
    const div = component.div;
    const observation = ctx.container.get(IObservation);
    const mouseTracker = new MouseTracker();
    const effect = observation.run(() => {
      runCount++;
      div.textContent = mouseTracker.coord.join(', ');
    });
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '0, 0');

    mouseTracker.pretendMouseMove(1, 2);
    assert.strictEqual(runCount, 2);
    assert.strictEqual(div.textContent, '1, 2');

    effect.stop();
    mouseTracker.pretendMouseMove(3, 4);
    assert.strictEqual(runCount, 2);
    assert.strictEqual(div.textContent, '1, 2');

    await tearDown();

    mouseTracker.pretendMouseMove(5, 6);
    assert.strictEqual(runCount, 2);
    assert.strictEqual(div.textContent, '1, 2');
  });

  it('does not track @observable accessed outside of effect', async function () {
    const { ctx, component, startPromise, tearDown } = createFixture('<div ref="div"></div>', class App {
      public div: HTMLDivElement;
    });

    await startPromise;

    class MouseTracker {
      @observable()
      public coord: [number, number] = [0, 0];

      public pretendMouseMove(x: number, y: number): void {
        this.coord = [x, y];
      }
    }

    assert.instanceOf(component.div, ctx.Element);

    let runCount = 0;
    const div = component.div;
    const observation = ctx.container.get(IObservation);
    const mouseTracker = new MouseTracker();
    const { coord } = mouseTracker;
    const effect = observation.run(() => {
      runCount++;
      div.textContent = coord.join(', ');
    });
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '0, 0');

    mouseTracker.pretendMouseMove(1, 2);
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '0, 0');

    effect.stop();
    mouseTracker.pretendMouseMove(3, 4);
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '0, 0');

    await tearDown();

    mouseTracker.pretendMouseMove(5, 6);
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '0, 0');
  });

  it('does not track @observable accessed inside a promise inside an effect', async function () {
    const { ctx, component, startPromise, tearDown } = createFixture('<div ref="div"></div>', class App {
      public div: HTMLDivElement;
    });

    await startPromise;

    class MouseTracker {
      @observable()
      public coord: [number, number] = [0, 0];

      public pretendMouseMove(x: number, y: number): void {
        this.coord = [x, y];
      }
    }

    assert.instanceOf(component.div, ctx.Element);

    let runCount = 0;
    const div = component.div;
    const observation = ctx.container.get(IObservation);
    const mouseTracker = new MouseTracker();
    const effect = observation.run(() => {
      runCount++;
      Promise.resolve().then(() => {
        div.textContent = mouseTracker.coord.join(', ');
      }).catch(ex => {
        div.textContent = String(ex);
      });
    });
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '');
    await Promise.resolve();
    assert.strictEqual(div.textContent, '0, 0');

    mouseTracker.pretendMouseMove(1, 2);
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '0, 0');
    await Promise.resolve();
    assert.strictEqual(div.textContent, '0, 0');

    effect.stop();
    mouseTracker.pretendMouseMove(3, 4);
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '0, 0');
    await Promise.resolve();
    assert.strictEqual(div.textContent, '0, 0');

    await tearDown();

    mouseTracker.pretendMouseMove(5, 6);
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '0, 0');
    await Promise.resolve();
    assert.strictEqual(div.textContent, '0, 0');
  });

  it('runs recursive effect with @observable', async function () {
    const { ctx, component, startPromise, tearDown } = createFixture('<div ref="div"></div>', class App {
      public div: HTMLDivElement;
    });

    await startPromise;

    class MouseTracker {
      @observable()
      public coord: [number, number] = [0, 0];

      public pretendMouseMove(x: number, y: number): void {
        this.coord = [x, y];
      }
    }

    assert.instanceOf(component.div, ctx.Element);

    let runCount = 0;
    const div = component.div;
    const observation = ctx.container.get(IObservation);
    const mouseTracker = new MouseTracker();
    const effect = observation.run(() => {
      runCount++;
      div.textContent = mouseTracker.coord.join(', ');
      if (runCount < 10) {
        mouseTracker.coord = [runCount, runCount];
      } else {
        runCount = 0;
      }
    });
    assert.strictEqual(runCount, 0);
    assert.strictEqual(div.textContent, '9, 9');

    mouseTracker.pretendMouseMove(1, 2);
    assert.strictEqual(runCount, 0);
    assert.strictEqual(div.textContent, '9, 9');

    effect.stop();
    runCount = 1;
    mouseTracker.pretendMouseMove(3, 4);
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '9, 9');

    await tearDown();

    mouseTracker.pretendMouseMove(5, 6);
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '9, 9');
  });

  it('runs recursive effect with @observable until max', async function () {
    const { ctx, component, startPromise, tearDown } = createFixture(
      '<div ref="div"></div>',
      class App {
        public div: HTMLDivElement;
      });

    await startPromise;

    class MouseTracker {
      @observable()
      public coord: [number, number] = [0, 0];

      public pretendMouseMove(x: number, y: number): void {
        this.coord = [x, y];
      }
    }

    let runCount = 0;
    let errorCaught = null;
    const div = component.div;
    const observation = ctx.container.get(IObservation);
    const mouseTracker = new MouseTracker();
    const tryRun = (fn: () => any) => {
      try {
        fn();
      } catch (ex) {
        errorCaught = ex;
      }
    };

    tryRun(() => {
      observation.run(() => {
        runCount++;
        div.textContent = mouseTracker.coord.join(', ');
        if (runCount < 20) {
          mouseTracker.coord = [runCount, runCount];
        } else {
          runCount = 0;
        }
      });
    });

    assert.instanceOf(errorCaught, Error);
    // 11 because effect only run recursively 10 items max
    assert.strictEqual(runCount, 11);
    assert.strictEqual(div.textContent, '10, 10');

    runCount = 0;
    errorCaught = null;
    tryRun(() => {
      mouseTracker.pretendMouseMove(1, 2);
    });

    assert.instanceOf(errorCaught, Error);
    assert.strictEqual(runCount, 11);
    assert.strictEqual(div.textContent, '10, 10');

    await tearDown();

    // effect are independent of application
    // so even after app torn down, it still runs
    // can only stop it via `effect.stop()`
    runCount = 10;
    errorCaught = null;
    tryRun(() => {
      mouseTracker.pretendMouseMove(1, 2);
    });

    // runCount starts at 10
    // so there won't be any over run error thrown
    assert.strictEqual(errorCaught, null);
    assert.strictEqual(runCount, 0);
    assert.strictEqual(div.textContent, '19, 19');
  });

  describe('watch effect', function () {
    let observation: IObservation;
    let tearDown: () => void;

    beforeEach(function () {
      const { container, tearDown: $tearDown } = createFixture('');
      tearDown = $tearDown as () => void;
      observation = container.get(IObservation);
    });

    it('runs immediately', function () {
      let v = 0;
      observation.watch({ a: 1 }, o => o.a, vv => v = vv);
      assert.strictEqual(v, 1);
    });

    it('does not run immediately', function () {
      let v = 0;
      const { run } = observation.watch({ a: 1 }, o => o.a, vv => v = vv, { immediate: false });
      assert.strictEqual(v, 0);
      run();
      assert.strictEqual(v, 1);
    });

    it('does not run after stopped', function () {
      let v = 0;
      const obj = { a: 1 };
      const { stop } = observation.watch(obj, o => o.a, vv => v = vv);
      stop();
      obj.a = 2;
      assert.strictEqual(v, 1);
    });

    it('runs can be called again', function () {
      let v = 0;
      const { run } = observation.watch({ a: 1 }, o => o.a, _ => v++);
      run();
      assert.strictEqual(v, 2);
    });

    it('runs independently with owning application', function () {
      let v = 0;
      const obj = { a: 1 };
      const { run } = observation.watch(obj, o => o.a, _ => v++);
      run();
      assert.strictEqual(v, 2);

      tearDown();
      obj.a = 2;
      assert.strictEqual(v, 3);
    });
  });
});
