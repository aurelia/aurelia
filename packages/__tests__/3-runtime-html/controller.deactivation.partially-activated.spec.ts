import {
  Class,
  DI,
  onResolve,
} from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  ICustomElementController,
  ICustomElementViewModel,
  IHydratedController,
  IPlatform,
  If,
  customElement,
} from '@aurelia/runtime-html';
import {
  TestContext,
  assert,
} from '@aurelia/testing';

describe('3-runtime-html/controller.deactivation.partially-activated.spec.ts', function () {

  type Hook = (_initiator: IHydratedController, _parent?: IHydratedController) => void | Promise<void>;

  interface INotifierManager extends NotifierManager { }
  const INotifierManager = DI.createInterface<INotifierManager>('INotifierManager', x => x.singleton(NotifierManager));

  class NotifierManager {

    private prefix: string = 'start';

    private readonly log: string[] = [];

    public createInvoker(vm: TestVM, hookName: string, hook: Hook): Hook {
      const ceName = CustomElement.getDefinition(vm.constructor).name;
      hook = hook.bind(vm);
      const mgr = vm.mgr;
      return function $hook(_initiator: IHydratedController, _parent?: IHydratedController) {
        mgr.log.push(`${mgr.prefix}.${ceName}.${hookName}.enter`);
        return onResolve(
          hook(_initiator, _parent),
          () => { mgr.log.push(`${mgr.prefix}.${ceName}.${hookName}.leave`); }
        );
      };
    }

    public assertLog(expected: string[], message: string) {
      const log = this.log;
      const len = Math.max(log.length, expected.length);
      for (let i = 0; i < len; i++) {
        assert.strictEqual(log[i], expected[i], `${message} - unexpected log at index${i}: ${log[i]}; actual log: ${JSON.stringify(log, undefined, 2)}`);
      }
    }

    public setPrefix(prefix: string) {
      this.prefix = prefix;
      this.log.length = 0;
    }
  }

  abstract class TestVM implements ICustomElementViewModel {
    public constructor(
      @INotifierManager public readonly mgr: INotifierManager,
    ) {
      this.binding = mgr.createInvoker(this, 'binding', this.$binding);
      this.bound = mgr.createInvoker(this, 'bound', this.$bound);
      this.attaching = mgr.createInvoker(this, 'attaching', this.$attaching);
      this.attached = mgr.createInvoker(this, 'attached', this.$attached);
      this.detaching = mgr.createInvoker(this, 'detaching', this.$detaching);
      this.unbinding = mgr.createInvoker(this, 'unbinding', this.$unbinding);
      this.dispose = mgr.createInvoker(this, 'dispose', this.$dispose) as () => void;
    }

    public binding: Hook;
    public bound: Hook;
    public attaching: Hook;
    public attached: Hook;
    public detaching: Hook;
    public unbinding: Hook;
    public dispose: () => void;

    protected $binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> { /* noop */ }
    protected $bound(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> { /* noop */ }
    protected $attaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> { /* noop */ }
    protected $attached(_initiator: IHydratedController): void | Promise<void> { /* noop */ }
    protected $detaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> { /* noop */ }
    protected $unbinding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> { /* noop */ }
    protected $dispose(): void { /* noop */ }
  }

  async function start<TAppRoot>(appRoot: Class<TAppRoot>, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(
      INotifierManager,
      ...registrations
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    let startUpError: unknown = null;
    try {
      await au.app({ component: appRoot, host }).start();
    } catch (e) {
      startUpError = e;
    }
    const rootVm = au.root.controller.viewModel as TAppRoot;
    return { host, au, container, rootVm, startUpError };
  }

  for (const hook of ['binding', 'bound', 'attaching', 'attached'] as const) {
    describe(`activation aborted by error from ${hook}`, function () {
      it(`Aurelia instance can be deactivated  - root`, async function () {
        @customElement({ name: 'ro-ot', template: '' })
        class Root extends TestVM {
          public [`$${hook}`](_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
            throw new Error('Synthetic test error');
          }
        }

        const { startUpError, au, container } = await start(Root);
        const mgr = container.get(INotifierManager);

        assert.instanceOf(startUpError, Error);

        const logs = [];
        /* eslint-disable no-fallthrough */
        switch (hook) {
          case 'attached': logs.push('start.ro-ot.attached.enter', 'start.ro-ot.attaching.leave');
          case 'attaching': logs.push('start.ro-ot.attaching.enter', 'start.ro-ot.bound.leave');
          case 'bound': logs.push('start.ro-ot.bound.enter', 'start.ro-ot.binding.leave');
          case 'binding': logs.push('start.ro-ot.binding.enter');
        }
        /* eslint-enable no-fallthrough */
        logs.reverse();
        mgr.assertLog(logs, 'start');

        mgr.setPrefix('stop');
        let stopError: unknown = null;
        try {
          await au.stop(true);
        } catch (e) {
          stopError = e;
        }

        assert.strictEqual(stopError, null);

        // Because aurelia could not be started
        mgr.assertLog([], 'stop');
      });

      it(`Aurelia instance can be deactivated - children CE`, async function () {
        @customElement({ name: 'c-1', template: '' })
        class C1 extends TestVM {
          public [`$${hook}`](_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
            throw new Error('Synthetic test error');
          }
        }

        @customElement({ name: 'ro-ot', template: '<c-1></c-1>' })
        class Root extends TestVM { }

        const { startUpError, au, container } = await start(Root, C1);
        const mgr = container.get(INotifierManager);

        const logs = [];
        /* eslint-disable no-fallthrough */
        switch (hook) {
          case 'attached': logs.push('start.c-1.attached.enter', 'start.c-1.attaching.leave');
          case 'attaching': logs.push('start.c-1.attaching.enter', 'start.c-1.bound.leave');
          case 'bound': logs.push('start.c-1.bound.enter', 'start.c-1.binding.leave');
          case 'binding': logs.push('start.c-1.binding.enter');
        }
        /* eslint-enable no-fallthrough */
        logs.reverse();

        mgr.assertLog([
          'start.ro-ot.binding.enter',
          'start.ro-ot.binding.leave',
          'start.ro-ot.bound.enter',
          'start.ro-ot.bound.leave',
          'start.ro-ot.attaching.enter',
          'start.ro-ot.attaching.leave',
          ...logs
        ], 'start');

        assert.instanceOf(startUpError, Error);

        mgr.setPrefix('stop');
        let stopError: unknown = null;
        try {
          await au.stop(true);
        } catch (e) {
          stopError = e;
        }

        assert.strictEqual(stopError, null);
        // Because aurelia could not be started
        mgr.assertLog([], 'stop');
      });

      it(`Aurelia instance can be deactivated - individual CE deactivation via template controller (if.bind)`, async function () {

        function getErredActivationLog() {
          const logs = [];
          /* eslint-disable no-fallthrough */
          switch (hook) {
            case 'attached': logs.push('phase#1.c-2.attached.enter', 'phase#1.c-2.attaching.leave');
            case 'attaching': logs.push('phase#1.c-2.attaching.enter', 'phase#1.c-2.bound.leave');
            case 'bound': logs.push('phase#1.c-2.bound.enter', 'phase#1.c-2.binding.leave');
            case 'binding': logs.push('phase#1.c-2.binding.enter');
          }
          /* eslint-enable no-fallthrough */
          logs.reverse();
          logs.unshift(
            'phase#1.c-1.detaching.enter',
            'phase#1.c-1.detaching.leave',
            'phase#1.c-1.unbinding.enter',
            'phase#1.c-1.unbinding.leave',
          );
          return logs;
        }

        function getErredDeactivationLog() {
          return [
            ...(
              hook === 'attached' || hook === 'attaching'
                ? [
                  'phase#2.c-2.detaching.enter',
                  'phase#2.c-2.detaching.leave',
                  'phase#2.c-2.unbinding.enter',
                  'phase#2.c-2.unbinding.leave'
                ]
                : []
            ),
            'phase#2.c-1.binding.enter',
            'phase#2.c-1.binding.leave',
            'phase#2.c-1.bound.enter',
            'phase#2.c-1.bound.leave',
            'phase#2.c-1.attaching.enter',
            'phase#2.c-1.attaching.leave',
            'phase#2.c-1.attached.enter',
            'phase#2.c-1.attached.leave',
          ];
        }

        @customElement({ name: 'c-1', template: 'c1' })
        class C1 extends TestVM { }

        @customElement({ name: 'c-2', template: 'c2' })
        class C2 extends TestVM {
          public [`$${hook}`](_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
            throw new Error('Synthetic test error');
          }
        }

        @customElement({ name: 'ro-ot', template: '<c-1 if.bind="showC1"></c-1><c-2 else></c-2>' })
        class Root extends TestVM {
          public showC1: boolean = true;
          public readonly $controller!: ICustomElementController<this>;
        }

        const { au, rootVm, host, container } = await start(Root, C1, C2);

        assert.html.textContent(host, 'c1', 'start.textContent');
        const mgr = container.get(INotifierManager);
        mgr.assertLog([
          'start.ro-ot.binding.enter',
          'start.ro-ot.binding.leave',
          'start.ro-ot.bound.enter',
          'start.ro-ot.bound.leave',
          'start.ro-ot.attaching.enter',
          'start.ro-ot.attaching.leave',
          'start.c-1.binding.enter',
          'start.c-1.binding.leave',
          'start.c-1.bound.enter',
          'start.c-1.bound.leave',
          'start.c-1.attaching.enter',
          'start.c-1.attaching.leave',
          'start.c-1.attached.enter',
          'start.c-1.attached.leave',
          'start.ro-ot.attached.enter',
          'start.ro-ot.attached.leave',
        ], 'start');

        mgr.setPrefix('phase#1');
        try {
          rootVm.showC1 = false;
          assert.fail('expected error');
        } catch (e) {
          assert.instanceOf(e, Error, 'swap');
        }

        mgr.assertLog(getErredActivationLog(), 'phase#1');

        assert.html.textContent(host, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');

        mgr.setPrefix('phase#2');
        rootVm.showC1 = true;
        assert.html.textContent(host, 'c1', 'phase#2.textContent');

        mgr.assertLog(getErredDeactivationLog(), 'phase#2');

        mgr.setPrefix('stop');
        let error: unknown = null;
        try {
          await au.stop(true);
        } catch (e) {
          error = e;
        }

        assert.strictEqual(error, null, 'stop');
        mgr.assertLog([
          'stop.c-1.detaching.enter',
          'stop.c-1.detaching.leave',
          'stop.ro-ot.detaching.enter',
          'stop.ro-ot.detaching.leave',
          'stop.c-1.unbinding.enter',
          'stop.c-1.unbinding.leave',
          'stop.ro-ot.unbinding.enter',
          'stop.ro-ot.unbinding.leave',
          'stop.ro-ot.dispose.enter',
          'stop.ro-ot.dispose.leave',
          'stop.c-1.dispose.enter',
          'stop.c-1.dispose.leave',
          'stop.c-2.dispose.enter',
          'stop.c-2.dispose.leave',
        ], 'stop');
      });
    });

    // TODO: remove
    if (hook !== 'binding') continue;

    describe(`long running activation promise on ${hook} - promise is resolved`, function () {

      it(`Individual CE deactivation via template controller (if.bind)`, async function () {

        function getPendingActivationLog() {
          const logs = [];
          /* eslint-disable no-fallthrough */
          switch (hook) {
            case 'attached': logs.push('phase#1.c-2.attached.enter', 'phase#1.c-2.attaching.leave');
            case 'attaching': logs.push('phase#1.c-2.attaching.enter', 'phase#1.c-2.bound.leave');
            case 'bound': logs.push('phase#1.c-2.bound.enter', 'phase#1.c-2.binding.leave');
            case 'binding': logs.push('phase#1.c-2.binding.enter');
          }
          /* eslint-enable no-fallthrough */
          logs.reverse();
          logs.unshift(
            'phase#1.c-1.detaching.enter',
            'phase#1.c-1.detaching.leave',
            'phase#1.c-1.unbinding.enter',
            'phase#1.c-1.unbinding.leave',
          );
          return logs;
        }

        function getDeactivationLog() {
          return [
            ...(
              hook === 'attached' || hook === 'attaching'
                ? [
                  'phase#2.c-2.detaching.enter',
                  'phase#2.c-2.detaching.leave',
                  'phase#2.c-2.unbinding.enter',
                  'phase#2.c-2.unbinding.leave'
                ]
                : []
            ),
            'phase#2.c-1.binding.enter',
            'phase#2.c-1.binding.leave',
            'phase#2.c-1.bound.enter',
            'phase#2.c-1.bound.leave',
            'phase#2.c-1.attaching.enter',
            'phase#2.c-1.attaching.leave',
            'phase#2.c-1.attached.enter',
            'phase#2.c-1.attached.leave',
          ];
        }

        @customElement({ name: 'c-1', template: 'c1' })
        class C1 extends TestVM {
          public readonly $controller!: ICustomElementController<this>;
        }

        interface IPromiseManager {
          createPromise(): Promise<void>;
        }
        const promiseManager = new (class implements IPromiseManager {
          private _mode: 'resolved' | 'long-running' = 'long-running';
          private _resolve: () => void | null = null;
          private _currentPromise: Promise<void> | null = null;
          public get currentPromise(): Promise<void> | null { return this._currentPromise; }

          public createPromise(): Promise<void> {
            return this._currentPromise = this._mode === 'resolved'
              ? Promise.resolve()
              : new Promise<void>((res) => this._resolve = res);
          }

          public resolve() {
            this._resolve?.();
          }

          public setMode(value: 'resolved' | 'long-running'): void {
            this._mode = value;
            this._resolve = null;
          }
        })();
        const IPromiseManager = DI.createInterface<IPromiseManager>('IPromiseManager', x => x.instance(promiseManager));

        @customElement({ name: 'c-2', template: 'c2' })
        class C2 extends TestVM {
          public readonly $controller!: ICustomElementController<this>;
          public constructor(
            @INotifierManager mgr: INotifierManager,
            @IPromiseManager private readonly promiseManager: IPromiseManager
          ) { super(mgr); }

          public [`$${hook}`](_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
            return this.promiseManager.createPromise();
          }
        }

        @customElement({ name: 'ro-ot', template: '<c-1 if.bind="showC1"></c-1><c-2 else></c-2>' })
        class Root extends TestVM {
          public showC1: boolean = true;
          public readonly $controller!: ICustomElementController<this>;
        }

        const { au, rootVm, host, container } = await start(Root, C1, C2);
        const queue = container.get(IPlatform).taskQueue;

        assert.html.textContent(host, 'c1', 'start.textContent');
        const mgr = container.get(INotifierManager);
        mgr.assertLog([
          'start.ro-ot.binding.enter',
          'start.ro-ot.binding.leave',
          'start.ro-ot.bound.enter',
          'start.ro-ot.bound.leave',
          'start.ro-ot.attaching.enter',
          'start.ro-ot.attaching.leave',
          'start.c-1.binding.enter',
          'start.c-1.binding.leave',
          'start.c-1.bound.enter',
          'start.c-1.bound.leave',
          'start.c-1.attaching.enter',
          'start.c-1.attaching.leave',
          'start.c-1.attached.enter',
          'start.c-1.attached.leave',
          'start.ro-ot.attached.enter',
          'start.ro-ot.attached.leave',
        ], 'start');

        const ifCtrl = rootVm.$controller.children[0];
        const ifVm = ifCtrl.viewModel as If;

        // phase#1: try to activate c-2 with long-running promise
        mgr.setPrefix('phase#1');
        rootVm.showC1 = false;

        const expectedLog = getPendingActivationLog();
        mgr.assertLog(expectedLog, 'phase#1 - pre-resolve');
        assert.html.textContent(host, /* hook === 'attached' || hook === 'attaching' ? 'c2' : */ '', 'phase#1.textContent');

        // trigger deactivation then resolve the promise and wait for everything
        const deactivationPromise = ifVm.elseView.deactivate(ifVm.elseView, ifCtrl);
        promiseManager.resolve();
        queue.queueTask(() => Promise.resolve());
        await Promise.all([promiseManager.currentPromise, deactivationPromise, queue.yield(), ifVm['pending']]);
        expectedLog.push(
          `phase#1.c-2.${hook}.leave`,
        );
        mgr.assertLog(expectedLog, 'phase#1 - post-resolve');

        // phase#2: try to activate c-1 - should work
        mgr.setPrefix('phase#2');
        rootVm.showC1 = true;
        queue.queueTask(() => Promise.resolve());
        await queue.yield();

        assert.html.textContent(host, 'c1', 'phase#2.textContent');
        mgr.assertLog(getDeactivationLog(), 'phase#2');

        // phase#3: try to activate c-2 with resolved promise - should work
        promiseManager.setMode('resolved');
        mgr.setPrefix('phase#3');
        rootVm.showC1 = false;
        queue.queueTask(() => Promise.resolve());
        queue.queueTask(() => Promise.resolve());
        await queue.yield();

        assert.html.textContent(host, 'c2', 'phase#3.textContent');
        mgr.assertLog([
          'phase#3.c-1.detaching.enter',
          'phase#3.c-1.detaching.leave',
          'phase#3.c-1.unbinding.enter',
          'phase#3.c-1.unbinding.leave',
          'phase#3.c-2.binding.enter',
          'phase#3.c-2.binding.leave',
          'phase#3.c-2.bound.enter',
          'phase#3.c-2.bound.leave',
          'phase#3.c-2.attaching.enter',
          'phase#3.c-2.attaching.leave',
          'phase#3.c-2.attached.enter',
          'phase#3.c-2.attached.leave',
        ], 'phase#3');

        // phase#4: try to activate c-1 - should work - JFF
        mgr.setPrefix('phase#4');
        rootVm.showC1 = true;
        queue.queueTask(() => Promise.resolve());
        await queue.yield();

        assert.html.textContent(host, 'c1', 'phase#4.textContent');
        mgr.assertLog([
          'phase#4.c-2.detaching.enter',
          'phase#4.c-2.detaching.leave',
          'phase#4.c-2.unbinding.enter',
          'phase#4.c-2.unbinding.leave',
          'phase#4.c-1.binding.enter',
          'phase#4.c-1.binding.leave',
          'phase#4.c-1.bound.enter',
          'phase#4.c-1.bound.leave',
          'phase#4.c-1.attaching.enter',
          'phase#4.c-1.attaching.leave',
          'phase#4.c-1.attached.enter',
          'phase#4.c-1.attached.leave',
        ], 'phase#4');

        // phase#5: try to activate c-2 with resolved promise - should work
        mgr.setPrefix('phase#5');
        rootVm.showC1 = false;
        queue.queueTask(() => Promise.resolve());
        queue.queueTask(() => Promise.resolve());
        await queue.yield();

        assert.html.textContent(host, 'c2', 'phase#5.textContent');
        mgr.assertLog([
          'phase#5.c-1.detaching.enter',
          'phase#5.c-1.detaching.leave',
          'phase#5.c-1.unbinding.enter',
          'phase#5.c-1.unbinding.leave',
          'phase#5.c-2.binding.enter',
          'phase#5.c-2.binding.leave',
          'phase#5.c-2.bound.enter',
          'phase#5.c-2.bound.leave',
          'phase#5.c-2.attaching.enter',
          'phase#5.c-2.attaching.leave',
          'phase#5.c-2.attached.enter',
          'phase#5.c-2.attached.leave',
        ], 'phase#5');

        // stop
        mgr.setPrefix('stop');
        let error: unknown = null;
        try {
          await au.stop(true);
        } catch (e) {
          error = e;
        }

        assert.strictEqual(error, null, 'stop');
        mgr.assertLog([
          'stop.c-2.detaching.enter',
          'stop.c-2.detaching.leave',
          'stop.ro-ot.detaching.enter',
          'stop.ro-ot.detaching.leave',
          'stop.c-2.unbinding.enter',
          'stop.c-2.unbinding.leave',
          'stop.ro-ot.unbinding.enter',
          'stop.ro-ot.unbinding.leave',
          'stop.ro-ot.dispose.enter',
          'stop.ro-ot.dispose.leave',
          'stop.c-1.dispose.enter',
          'stop.c-1.dispose.leave',
          'stop.c-2.dispose.enter',
          'stop.c-2.dispose.leave',
        ], 'stop');
      });
    });
  }
});
