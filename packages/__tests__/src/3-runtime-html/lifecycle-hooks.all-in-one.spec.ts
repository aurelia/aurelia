import {
  IController,
  ILifecycleHooks,
  lifecycleHooks
} from '@aurelia/runtime-html';
import { IActivationHooks, ICompileHooks, IHydratedController } from '@aurelia/runtime-html/dist/types/templating/controller';
import { assert, createFixture } from '@aurelia/testing';

type ViewModelHook = keyof ICompileHooks | keyof IActivationHooks<IHydratedController>;

const expectedViewModelHooks: Record<ViewModelHook, true> = {
  hydrating: true,
  hydrated: true,
  created: true,
  binding: true,
  bound: true,
  attaching: true,
  attached: true,
  detaching: true,
  unbinding: true,
  dispose: true,
  accept: true,
};

describe('3-runtime-html/lifecycle-hooks.all-in-one.spec.ts', function () {
  it('keeps view-model hook detection aligned with the lifecycle interfaces', async function () {
    const invokedHooks = new Set<ViewModelHook>();
    class App {
      hydrating() { invokedHooks.add('hydrating'); }
      hydrated() { invokedHooks.add('hydrated'); }
      created() { invokedHooks.add('created'); }
      binding() { invokedHooks.add('binding'); }
      bound() { invokedHooks.add('bound'); }
      attaching() { invokedHooks.add('attaching'); }
      attached() { invokedHooks.add('attached'); }
      detaching() { invokedHooks.add('detaching'); }
      unbinding() { invokedHooks.add('unbinding'); }
      dispose() { invokedHooks.add('dispose'); }
      accept() { invokedHooks.add('accept'); }
    }

    const fixture = await createFixture
      .component(App)
      .html``
      .build().started;
    const controller = fixture.component.$controller!;
    const detectedHooks = Object.fromEntries(
      Object.entries((controller as unknown as { _vmHooks: Record<string, boolean> })._vmHooks)
        .map(([name, isPresent]) => [name.slice(1), isPresent])
    );

    assert.deepStrictEqual(detectedHooks, expectedViewModelHooks);

    controller.accept(() => {});
    await fixture.tearDown();

    assert.deepStrictEqual(
      Array.from(invokedHooks).sort(),
      Object.keys(expectedViewModelHooks).sort()
    );
  });

  describe('[synchronous]', function () {
    let tracker: LifeycyleTracker | null = null;

    this.beforeEach(function () {
      tracker = new LifeycyleTracker();
    });

    @lifecycleHooks()
    class LoggingHook implements ILifecycleHooks<ICompileHooks & IActivationHooks<IHydratedController>> {

      hydrating() {
        tracker.hydrating++;
      }

      hydrated(): void {
        tracker.hydrated++;
      }

      created() {
        tracker.created++;
      }

      binding() {
        tracker.binding++;
      }

      bound() {
        tracker.bound++;
      }

      attaching() {
        tracker.attaching++;
      }

      attached() {
        tracker.attached++;
      }

      detaching() {
        tracker.detaching++;
      }

      unbinding() {
        tracker.unbinding++;
      }

      dispose() {
        throw new Error('ni');
      }

      accept() {
        throw new Error('ni');
      }
    }

    it('invokes global bound hooks', async function () {
      const { tearDown } = await createFixture
        .html`\${message}`
        .deps(LoggingHook)
        .build().started;

      assert.strictEqual(tracker.hydrating, 1);
      assert.strictEqual(tracker.hydrated, 1);
      assert.strictEqual(tracker.created, 1);
      assert.strictEqual(tracker.binding, 1);
      assert.strictEqual(tracker.bound, 1);
      assert.strictEqual(tracker.attaching, 1);
      assert.strictEqual(tracker.attached, 1);

      await tearDown();

      assert.strictEqual(tracker.hydrating, 1);
      assert.strictEqual(tracker.hydrated, 1);
      assert.strictEqual(tracker.created, 1);
      assert.strictEqual(tracker.binding, 1);
      assert.strictEqual(tracker.bound, 1);
      assert.strictEqual(tracker.attaching, 1);
      assert.strictEqual(tracker.attached, 1);
      assert.strictEqual(tracker.detaching, 1);
      assert.strictEqual(tracker.unbinding, 1);
    });

    class LifeycyleTracker {
      hydrating = 0;
      hydrated = 0;
      created = 0;
      binding = 0;
      bound = 0;
      attaching = 0;
      attached = 0;
      detaching = 0;
      unbinding = 0;
      controllers: IController[] = [];
    }
  });

  describe('[asynchronous]', function () {
    let tracker: AsyncLifeycyleTracker | null = null;

    this.beforeEach(function () {
      tracker = new AsyncLifeycyleTracker();
    });

    @lifecycleHooks()
    class AllLoggingHook {

      hydrating() {
        tracker.trace('lch.hydrating');
      }

      hydrated() {
        tracker.trace('lch.hydrated');
      }

      created() {
        tracker.trace('lch.created');
      }

      binding() {
        return logAndWait('lch.binding');
      }

      bound() {
        return logAndWait('lch.bound');
      }

      attaching() {
        return logAndWait('lch.attaching');
      }

      attached() {
        return logAndWait('lch.attached');
      }

      detaching() {
        return logAndWait('lch.detaching');
      }

      unbinding() {
        return logAndWait('lch.unbinding');
      }
    }

    it('invokes global hook in the right order', async function () {
      const { tearDown } = await createFixture
        .component(class {
          hydrating() {
            tracker.trace('comp.hydrating');
          }

          hydrated() {
            tracker.trace('comp.hydrated');
          }

          created() {
            tracker.trace('comp.created');
          }

          binding() {
            return logAndWait('comp.binding');
          }

          bound() {
            return logAndWait('comp.bound');
          }

          attaching() {
            return logAndWait('comp.attaching');
          }

          attached() {
            return logAndWait('comp.attached');
          }

          detaching() {
            return logAndWait('comp.detaching');
          }

          unbinding() {
            return logAndWait('comp.unbinding');
          }
        })
        .html``
        .deps(AllLoggingHook)
        .build().started;

      assert.deepStrictEqual(tracker.logs, [
        'lch.hydrating',
        'comp.hydrating',
        'lch.hydrated',
        'comp.hydrated',
        'lch.created',
        'comp.created',
        'lch.binding.start',
        'comp.binding.start',
        'lch.binding.end',
        'comp.binding.end',
        'lch.bound.start',
        'comp.bound.start',
        'lch.bound.end',
        'comp.bound.end',
        'lch.attaching.start',
        'comp.attaching.start',
        'lch.attaching.end',
        'comp.attaching.end',
        'lch.attached.start',
        'comp.attached.start',
        'lch.attached.end',
        'comp.attached.end',
      ]);

      await tearDown();

      assert.deepStrictEqual(tracker.logs, [
        'lch.hydrating',
        'comp.hydrating',
        'lch.hydrated',
        'comp.hydrated',
        'lch.created',
        'comp.created',
        'lch.binding.start',
        'comp.binding.start',
        'lch.binding.end',
        'comp.binding.end',
        'lch.bound.start',
        'comp.bound.start',
        'lch.bound.end',
        'comp.bound.end',
        'lch.attaching.start',
        'comp.attaching.start',
        'lch.attaching.end',
        'comp.attaching.end',
        'lch.attached.start',
        'comp.attached.start',
        'lch.attached.end',
        'comp.attached.end',

        // tear down phases

        'lch.detaching.start',
        'comp.detaching.start',
        'lch.detaching.end',
        'comp.detaching.end',

        'lch.unbinding.start',
        'comp.unbinding.start',
        'lch.unbinding.end',
        'comp.unbinding.end',
      ]);
    });

    const waitForTicks = async (count: number) => {
      while (count-- > 0) {
        await Promise.resolve();
      }
    };

    const logAndWait = (name: string, count = 5) => {
      tracker.trace(`${name}.start`);
      return waitForTicks(count).then(() => tracker.trace(`${name}.end`));
    };

    class AsyncLifeycyleTracker {
      logs: string[] = [];
      trace(msg: string): void {
        this.logs.push(msg);
      }
    }
  });
});
