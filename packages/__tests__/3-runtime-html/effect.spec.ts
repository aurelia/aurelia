import { IEffectRunner, observable, IEffect } from '@aurelia/runtime';
import { bindable, customAttribute, INode } from '@aurelia/runtime-html';
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
    const runner = ctx.container.get(IEffectRunner);
    const mouseTracker = new MouseTracker();
    const effect = runner.run(() => {
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

  it.skip('runs effect with @bindable', async function () {
    let runCount = 0;

    @customAttribute('mouse-tracker')
    class MouseTracker {
      public static inject = [INode, IEffectRunner];
      @bindable({ set: v => v })
      public coord: [number, number] = [0, 0];
      private effect?: IEffect;

      public constructor(
        public host: HTMLDivElement,
        public effectRunner: IEffectRunner,
      ) {}

      public pretendMouseMove(x: number, y: number): void {
        this.coord = [x, y];
      }

      public binding() {
        this.effect = this.effectRunner.run(() => {
          runCount++;
          debugger
          this.host.textContent = this.coord.join(', ');
        });
      }

      public unbinding() {
        this.effect?.stop();
      }
    }
    const { component, startPromise, tearDown } = createFixture(
      '<div ref="div" mouse-tracker mouse-tracker.ref="mouseTracker"></div>',
      class App {
        public div: HTMLDivElement;
        public mouseTracker: MouseTracker;
      },
      [MouseTracker]
    );

    await startPromise;

    assert.instanceOf(component.mouseTracker, MouseTracker);

    const { div, mouseTracker } = component;
    assert.strictEqual(runCount, 1);
    assert.strictEqual(div.textContent, '0, 0');

    mouseTracker.pretendMouseMove(1, 2);
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
    const runner = ctx.container.get(IEffectRunner);
    const mouseTracker = new MouseTracker();
    const { coord } = mouseTracker;
    const effect = runner.run(() => {
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
});
