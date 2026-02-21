import { tasksSettled, IObservation, observable } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/effect.spec.ts', function () {
  it('runs effect cleanup', async function () {
    const { container, component } = createFixture('', class App {
      @observable
      a = 1;
    });

    let v: unknown;
    let count = 0;
    container.get(IObservation).run(() => {
      v = component.a;

      return () => count++;
    });

    assert.strictEqual(v, 1);
    assert.strictEqual(count, 0);

    component.a = 2;

    assert.strictEqual(v, 2);
    assert.strictEqual(count, 1);
  });

  it('does not runs after effect has been stopped', async function () {
    const { container, component } = createFixture('', class App {
      @observable
      a = 1;
    });

    let v: unknown;
    let count = 0;
    const { stop }= container.get(IObservation).run(() => {
      v = component.a;

      return () => count++;
    });

    assert.strictEqual(v, 1);
    assert.strictEqual(count, 0);

    stop();

    component.a = 2;

    assert.strictEqual(v, 1);
    // but still run cleanup
    assert.strictEqual(count, 1);
  });

  it('throws when stopping a stopped effect', function () {
    const { container } = createFixture('');
    const effect = container.get(IObservation).run(() => { /* intentionally empty */ });
    effect.stop();
    assert.throws(() => effect.stop());
  });

  it('run is noop after effect has been stopped', function () {
    const { container } = createFixture('', class App {
      @observable
      public a = 1;
    });

    let runCount = 0;
    const effect = container.get(IObservation).run(() => {
      runCount++;
    });

    assert.strictEqual(runCount, 1);

    effect.stop();
    effect.run();

    assert.strictEqual(runCount, 1);
  });

  it('runs effect with @observable', async function () {
    const { ctx, component, tearDown } = await createFixture('<div ref="div"></div>', class App {
      public div: HTMLDivElement;
    }).started;

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
    const { ctx, component, tearDown } = await createFixture('<div ref="div"></div>', class App {
      public div: HTMLDivElement;
    }).started;

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
    const { ctx, component, tearDown } = await createFixture('<div ref="div"></div>', class App {
      public div: HTMLDivElement;
    }).started;

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
    const { ctx, component, tearDown } = await createFixture('<div ref="div"></div>', class App {
      public div: HTMLDivElement;
    }).started;

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
    const { ctx, component, tearDown } = await createFixture(
      '<div ref="div"></div>',
      class App {
        public div: HTMLDivElement;
      }
    ).started;

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

    describe('getter', function () {
      it('runs immediately', function () {
        let v = 0;
        observation.watch({ a: 1 }, o => o.a, vv => v = vv);
        assert.strictEqual(v, 1);
      });

      it('does not run immediately', function () {
        let v = 0;
        const obj = { a: 1 };
        const { run } = observation.watch(obj, o => o.a, vv => v = vv, { immediate: false });
        assert.strictEqual(v, 0);
        obj.a = 2;
        assert.strictEqual(v, 0);
        run();
        assert.strictEqual(v, 2);
      });

      it('observes but does not run when immediate is false', async function () {
        let v = 0;
        const obj = { a: 1 };
        observation.watch(obj, o => o.a, vv => v = vv, { immediate: false });
        assert.strictEqual(v, 0);
        obj.a = 111;
        assert.strictEqual(v, 0);
        await Promise.resolve();
        assert.strictEqual(v, 111);
      });

      it('calling run multiple times calls the callback each time', function () {
        let count = 0;
        const obj = { a: 1 };
        const { run } = observation.watch(obj, o => o.a, _ => count++);
        assert.strictEqual(count, 1);
        run();
        assert.strictEqual(count, 2);
        run();
        assert.strictEqual(count, 3);
      });

      it('does not run after stopped', function () {
        let v = 0;
        const obj = { a: 1 };
        const { stop } = observation.watch(obj, o => o.a, vv => v = vv);
        stop();
        obj.a = 2;
        assert.strictEqual(v, 1);
      });

      it('throws when stop is called after stopped', function () {
        const obj = { a: 1 };
        const { stop } = observation.watch(obj, o => o.a, vv => vv);
        stop();
        assert.throws(() => stop());
      });

      it('run is noop after stopped', function () {
        let count = 0;
        const obj = { a: 1 };
        const { run, stop } = observation.watch(obj, o => o.a, _ => count++);
        assert.strictEqual(count, 1);
        stop();
        run();
        assert.strictEqual(count, 1);
      });

      it('runs independently with owning application', async function () {
        let v = 0;
        const obj = { a: 1 };
        observation.watch(obj, o => o.a, vv => v = vv);
        assert.strictEqual(v, 1);

        tearDown();
        obj.a = 2;
        await tasksSettled();
        assert.strictEqual(v, 2);
      });

      it('calls cleanup function in next run', async function () {
        let v = 0;
        let cancelled = 0;
        const obj = { a: 1 };
        observation.watch(obj, o => o.a, vv => {
          v = vv;
          return () => cancelled++;
        });
        assert.strictEqual(v, 1);
        assert.strictEqual(cancelled, 0);
        obj.a = 2;
        assert.strictEqual(v, 1);
        assert.strictEqual(cancelled, 0);
        await tasksSettled();
        assert.strictEqual(v, 2);
        assert.strictEqual(cancelled, 1);
      });

      it('calls cleanup function when stopped', function () {
        let v = 0;
        let cancelled = 0;
        const obj = { a: 1 };
        const { stop } = observation.watch(obj, o => o.a, vv => {
          v = vv;
          return () => cancelled++;
        });
        assert.strictEqual(v, 1);
        assert.strictEqual(cancelled, 0);
        stop();
        assert.strictEqual(v, 1);
        assert.strictEqual(cancelled, 1);
      });
    });

    describe('watch expression effect', function () {
      it('runs immediately', function () {
        let v = 0;
        observation.watch<number>({ a: 1 }, 'a', vv => v = vv);
        assert.strictEqual(v, 1);
      });

      it('runs immediately when initial value is undefined', function () {
        let v: number | undefined = undefined;
        let count = 0;
        observation.watch<number | undefined>({}, 'a', vv => {
          v = vv;
          count++;
        });
        assert.strictEqual(v, void 0);
        assert.strictEqual(count, 1);
      });

      it('does not run immediately when immediate is false', function () {
        let v = 0;
        const { run } = observation.watch<number>({ a: 1 }, 'a', vv => v = vv, { immediate: false });
        assert.strictEqual(v, 0);
        run();
        assert.strictEqual(v, 1);
      });

      it('observes but does not run when immediate is false', async function () {
        let v = 0;
        const obj = { a: 1 };
        observation.watch<number>(obj, 'a', vv => v = vv, { immediate: false });
        assert.strictEqual(v, 0);
        obj.a = 111;
        assert.strictEqual(v, 111);
      });

      it('calling run multiple times calls the callback each time', function () {
        let count = 0;
        const obj = { a: 1 };
        const { run } = observation.watch<number>(obj, 'a', _ => count++);
        assert.strictEqual(count, 1);
        run();
        assert.strictEqual(count, 2);
        run();
        assert.strictEqual(count, 3);
      });

      it('does not run after stopped', function () {
        let v = 0;
        const obj = { a: 1 };
        const { stop } = observation.watch<number>(obj, 'a', vv => v = vv);
        stop();
        obj.a = 2;
        assert.strictEqual(v, 1);
      });

      it('throws when stop is called after stopped', function () {
        const obj = { a: 1 };
        const { stop } = observation.watch<number>(obj, 'a', vv => vv);
        stop();
        assert.throws(() => stop());
      });

      it('runs independently with owning application', function () {
        let v = 0;
        const obj = { a: 1 };
        observation.watch<number>(obj, 'a', _ => v++);
        assert.strictEqual(v, 1);

        tearDown();
        obj.a = 2;
        assert.strictEqual(v, 2);
      });

      it('calls cleanup function in next run', function () {
        let v = 0;
        let cancelled = 0;
        const obj = { a: 1 };
        observation.watch<number>(obj, 'a', vv => {
          v = vv;
          return () => cancelled++;
        });
        assert.strictEqual(v, 1);
        assert.strictEqual(cancelled, 0);
        obj.a = 2;
        assert.strictEqual(v, 2);
        assert.strictEqual(cancelled, 1);
      });

      it('calls cleanup function when stopped', function () {
        let v = 0;
        let cancelled = 0;
        const obj = { a: 1 };
        const { stop } = observation.watch<number>(obj, 'a', vv => {
          v = vv;
          return () => cancelled++;
        });
        assert.strictEqual(v, 1);
        assert.strictEqual(cancelled, 0);
        stop();
        assert.strictEqual(v, 1);
        assert.strictEqual(cancelled, 1);
      });
    });
  });
});
