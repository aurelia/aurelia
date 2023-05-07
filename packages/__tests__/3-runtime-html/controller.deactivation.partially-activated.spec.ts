import {
  DI,
  onResolve,
} from '@aurelia/kernel';
import {
  CustomElement,
  ICustomElementController,
  ICustomElementViewModel,
  IHydratedController,
  IPlatform,
  If,
  customElement,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture
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

  interface IPromiseManager {
    createPromise(): Promise<void>;
  }
  const IPromiseManager = DI.createInterface<IPromiseManager>('IPromiseManager', x => x.singleton(PromiseManager));

  type PromiseManagerMode = 'pending' | 'resolved' | 'rejected';
  class PromiseManager implements IPromiseManager {
    private _mode: PromiseManagerMode = 'pending';
    private _resolve: () => void | null = null;
    private _reject: (err: unknown) => void | null = null;
    private _currentPromise: Promise<void> | null = null;
    public get currentPromise(): Promise<void> | null { return this._currentPromise; }

    public createPromise(): Promise<void> {
      switch (this._mode) {
        case 'pending': return this._currentPromise = new Promise<void>((res, rej) => { this._resolve = res; this._reject = rej; });
        case 'resolved': return this._currentPromise = Promise.resolve();
        case 'rejected': return this._currentPromise = Promise.reject();
      }
    }

    public resolve() {
      this._resolve?.();
    }

    public reject(err: unknown) {
      this._reject?.(err);
    }

    public setMode(value: PromiseManagerMode): void {
      this._mode = value;
      this._resolve = null;
      this._reject = null;
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

  for (const hook of ['binding', 'bound', 'attaching', 'attached'] as const) {
    describe(`activation aborted by error from ${hook}`, function () {
      it(`Aurelia instance can be deactivated  - root`, async function () {
        class Root extends TestVM {
          public [`$${hook}`](_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
            throw new Error('Synthetic test error');
          }
        }

        const { container, start, stop } = createFixture('', Root, [INotifierManager], false);
        const mgr = container.get(INotifierManager);

        try {
          await start();
          assert.fail('expected error on start up');
        } catch (err) {
          assert.instanceOf(err, Error);
        }

        const logs = [];
        /* eslint-disable no-fallthrough */
        switch (hook) {
          case 'attached': logs.push('start.app.attached.enter', 'start.app.attaching.leave');
          case 'attaching': logs.push('start.app.attaching.enter', 'start.app.bound.leave');
          case 'bound': logs.push('start.app.bound.enter', 'start.app.binding.leave');
          case 'binding': logs.push('start.app.binding.enter');
        }
        /* eslint-enable no-fallthrough */
        logs.reverse();
        mgr.assertLog(logs, 'start');

        mgr.setPrefix('stop');
        let stopError: unknown = null;
        try {
          await stop(true);
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

        class Root extends TestVM { }

        const { container, start, stop } = createFixture('<c-1></c-1>', Root, [C1, INotifierManager], false);
        const mgr = container.get(INotifierManager);

        try {
          await start();
          assert.fail('expected error on start up');
        } catch (err) {
          assert.instanceOf(err, Error);
        }

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
          'start.app.binding.enter',
          'start.app.binding.leave',
          'start.app.bound.enter',
          'start.app.bound.leave',
          'start.app.attaching.enter',
          'start.app.attaching.leave',
          ...logs
        ], 'start');

        mgr.setPrefix('stop');
        let stopError: unknown = null;
        try {
          await stop(true);
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

        class Root extends TestVM {
          public showC1: boolean = true;
          public readonly $controller!: ICustomElementController<this>;
        }

        const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager]);
        const rootVm = au.root.controller.viewModel as Root;

        assert.html.textContent(appHost, 'c1', 'start.textContent');
        const mgr = container.get(INotifierManager);
        mgr.assertLog([
          'start.app.binding.enter',
          'start.app.binding.leave',
          'start.app.bound.enter',
          'start.app.bound.leave',
          'start.app.attaching.enter',
          'start.app.attaching.leave',
          'start.c-1.binding.enter',
          'start.c-1.binding.leave',
          'start.c-1.bound.enter',
          'start.c-1.bound.leave',
          'start.c-1.attaching.enter',
          'start.c-1.attaching.leave',
          'start.c-1.attached.enter',
          'start.c-1.attached.leave',
          'start.app.attached.enter',
          'start.app.attached.leave',
        ], 'start');

        mgr.setPrefix('phase#1');
        try {
          rootVm.showC1 = false;
          assert.fail('expected error');
        } catch (e) {
          assert.instanceOf(e, Error, 'swap');
        }

        mgr.assertLog(getErredActivationLog(), 'phase#1');

        assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');

        mgr.setPrefix('phase#2');
        rootVm.showC1 = true;
        assert.html.textContent(appHost, 'c1', 'phase#2.textContent');

        mgr.assertLog(getErredDeactivationLog(), 'phase#2');

        mgr.setPrefix('stop');
        let error: unknown = null;
        try {
          await stop(true);
        } catch (e) {
          error = e;
        }

        assert.strictEqual(error, null, 'stop');
        mgr.assertLog([
          'stop.c-1.detaching.enter',
          'stop.c-1.detaching.leave',
          'stop.app.detaching.enter',
          'stop.app.detaching.leave',
          'stop.c-1.unbinding.enter',
          'stop.c-1.unbinding.leave',
          'stop.app.unbinding.enter',
          'stop.app.unbinding.leave',
          'stop.app.dispose.enter',
          'stop.app.dispose.leave',
          'stop.c-1.dispose.enter',
          'stop.c-1.dispose.leave',
          'stop.c-2.dispose.enter',
          'stop.c-2.dispose.leave',
        ], 'stop');
      });
    });

    describe(`long running activation promise on ${hook} - promise is resolved`, function () {

      it(`Individual CE deactivation via template controller (if.bind)`, async function () {

        function getPendingActivationLog(isSettled: boolean) {
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
          if (!isSettled) return logs;

          logs.push(`phase#1.c-2.${hook}.leave`);
          switch (hook) {
            case 'attaching':
            case 'attached':
              logs.push(
                'phase#1.c-2.detaching.enter',
                'phase#1.c-2.detaching.leave',
                'phase#1.c-2.unbinding.enter',
                'phase#1.c-2.unbinding.leave',
              );
              break;
          }
          return logs;
        }

        @customElement({ name: 'c-1', template: 'c1' })
        class C1 extends TestVM {
          public readonly $controller!: ICustomElementController<this>;
        }

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

        @customElement({ name: 'app', template: '<c-1 if.bind="showC1"></c-1><c-2 else></c-2>' })
        class Root extends TestVM {
          public showC1: boolean = true;
          public readonly $controller!: ICustomElementController<this>;
        }

        const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager, IPromiseManager]);
        const rootVm = au.root.controller.viewModel as Root;
        const queue = container.get(IPlatform).taskQueue;
        const promiseManager = container.get<PromiseManager>(IPromiseManager);

        assert.html.textContent(appHost, 'c1', 'start.textContent');
        const mgr = container.get(INotifierManager);
        mgr.assertLog([
          'start.app.binding.enter',
          'start.app.binding.leave',
          'start.app.bound.enter',
          'start.app.bound.leave',
          'start.app.attaching.enter',
          'start.app.attaching.leave',
          'start.c-1.binding.enter',
          'start.c-1.binding.leave',
          'start.c-1.bound.enter',
          'start.c-1.bound.leave',
          'start.c-1.attaching.enter',
          'start.c-1.attaching.leave',
          'start.c-1.attached.enter',
          'start.c-1.attached.leave',
          'start.app.attached.enter',
          'start.app.attached.leave',
        ], 'start');

        const ifCtrl = rootVm.$controller.children[0];
        const ifVm = ifCtrl.viewModel as If;

        // phase#1: try to activate c-2 with long-running promise
        mgr.setPrefix('phase#1');
        rootVm.showC1 = false;

        const expectedLog = getPendingActivationLog(false);
        mgr.assertLog(expectedLog, 'phase#1 - pre-resolve');
        assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');

        // trigger deactivation then resolve the promise and wait for everything
        /**
         * Note on manual deactivation instead of setting the flag to false:
         * The `if`-TC is not preemptive.
         * That is it waits always for the previous change.
         * Thus, setting the flag to false would only queue the deactivation rather than a pre-emptive action.
         * We might want to change the `if`-TC to be pre-emptive, but that requires more discussion among team and community.
         */
        const deactivationPromise = ifVm.elseView.deactivate(ifVm.elseView, ifCtrl);
        promiseManager.resolve();
        queue.queueTask(() => Promise.resolve());
        await Promise.all([promiseManager.currentPromise, deactivationPromise, queue.yield(), ifVm['pending']]);
        mgr.assertLog(getPendingActivationLog(true), 'phase#1 - post-resolve');

        // phase#2: try to activate c-1 - should work
        mgr.setPrefix('phase#2');
        rootVm.showC1 = true;
        queue.queueTask(() => Promise.resolve());
        await queue.yield();

        assert.html.textContent(appHost, 'c1', 'phase#2.textContent');
        mgr.assertLog([
          'phase#2.c-1.binding.enter',
          'phase#2.c-1.binding.leave',
          'phase#2.c-1.bound.enter',
          'phase#2.c-1.bound.leave',
          'phase#2.c-1.attaching.enter',
          'phase#2.c-1.attaching.leave',
          'phase#2.c-1.attached.enter',
          'phase#2.c-1.attached.leave',
        ], 'phase#2');

        // phase#3: try to activate c-2 with resolved promise - should work
        promiseManager.setMode('resolved');
        mgr.setPrefix('phase#3');
        rootVm.showC1 = false;
        queue.queueTask(() => Promise.resolve());
        queue.queueTask(() => Promise.resolve());
        await queue.yield();

        assert.html.textContent(appHost, 'c2', 'phase#3.textContent');
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

        assert.html.textContent(appHost, 'c1', 'phase#4.textContent');
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

        assert.html.textContent(appHost, 'c2', 'phase#5.textContent');
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
          await stop(true);
        } catch (e) {
          error = e;
        }

        assert.strictEqual(error, null, 'stop');
        mgr.assertLog([
          'stop.c-2.detaching.enter',
          'stop.c-2.detaching.leave',
          'stop.app.detaching.enter',
          'stop.app.detaching.leave',
          'stop.c-2.unbinding.enter',
          'stop.c-2.unbinding.leave',
          'stop.app.unbinding.enter',
          'stop.app.unbinding.leave',
          'stop.app.dispose.enter',
          'stop.app.dispose.leave',
          'stop.c-1.dispose.enter',
          'stop.c-1.dispose.leave',
          'stop.c-2.dispose.enter',
          'stop.c-2.dispose.leave',
        ], 'stop');
      });
    });

    describe(`long running activation promise on ${hook} - promise is rejected`, function () {

      it(`Individual CE deactivation via template controller (if.bind)`, async function () {

        function getPendingActivationLog(prefix: string, isDeactivated: boolean) {
          const logs = [];
          /* eslint-disable no-fallthrough */
          switch (hook) {
            case 'attached': logs.push(
              `${prefix}.c-2.attached.enter`,
              `${prefix}.c-2.attaching.leave`,
            );
            case 'attaching': logs.push(
              `${prefix}.c-2.attaching.enter`,
              `${prefix}.c-2.bound.leave`,
            );
            case 'bound': logs.push(
              `${prefix}.c-2.bound.enter`,
              `${prefix}.c-2.binding.leave`,
            );
            case 'binding': logs.push(
              `${prefix}.c-2.binding.enter`,
            );
          }
          /* eslint-enable no-fallthrough */
          logs.reverse();
          logs.unshift(
            `${prefix}.c-1.detaching.enter`,
            `${prefix}.c-1.detaching.leave`,
            `${prefix}.c-1.unbinding.enter`,
            `${prefix}.c-1.unbinding.leave`,
          );
          if (!isDeactivated) return logs;

          // logs.push(`phase#1.c-2.${hook}.leave`);
          switch (hook) {
            case 'attaching':
            case 'attached':
              logs.push(
                `${prefix}.c-2.detaching.enter`,
                `${prefix}.c-2.detaching.leave`,
                `${prefix}.c-2.unbinding.enter`,
                `${prefix}.c-2.unbinding.leave`,
              );
              break;
          }
          return logs;
        }

        @customElement({ name: 'c-1', template: 'c1' })
        class C1 extends TestVM {
          public readonly $controller!: ICustomElementController<this>;
        }

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

        @customElement({ name: 'app', template: '<c-1 if.bind="showC1"></c-1><c-2 else></c-2>' })
        class Root extends TestVM {
          public showC1: boolean = true;
          public readonly $controller!: ICustomElementController<this>;
        }

        const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager, IPromiseManager]);
        const rootVm = au.root.controller.viewModel as Root;
        const queue = container.get(IPlatform).taskQueue;
        const promiseManager = container.get<PromiseManager>(IPromiseManager);

        assert.html.textContent(appHost, 'c1', 'start.textContent');
        const mgr = container.get(INotifierManager);
        mgr.assertLog([
          'start.app.binding.enter',
          'start.app.binding.leave',
          'start.app.bound.enter',
          'start.app.bound.leave',
          'start.app.attaching.enter',
          'start.app.attaching.leave',
          'start.c-1.binding.enter',
          'start.c-1.binding.leave',
          'start.c-1.bound.enter',
          'start.c-1.bound.leave',
          'start.c-1.attaching.enter',
          'start.c-1.attaching.leave',
          'start.c-1.attached.enter',
          'start.c-1.attached.leave',
          'start.app.attached.enter',
          'start.app.attached.leave',
        ], 'start');

        const ifCtrl = rootVm.$controller.children[0];
        const ifVm = ifCtrl.viewModel as If;

        // phase#1: try to activate c-2 with long-running promise
        mgr.setPrefix('phase#1');
        rootVm.showC1 = false;

        const expectedLog = getPendingActivationLog('phase#1', false);
        mgr.assertLog(expectedLog, 'phase#1 - pre-reject');
        assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');

        // trigger deactivation then reject the promise and wait for everything
        /**
         * Note on manual deactivation instead of setting the flag to false:
         * The `if`-TC is not preemptive.
         * That is it waits always for the previous change.
         * Thus, setting the flag to false would only queue the deactivation rather than a pre-emptive action.
         * We might want to change the `if`-TC to be pre-emptive, but that requires more discussion among team and community.
         */
        const deactivationPromise = ifVm.elseView.deactivate(ifVm.elseView, ifCtrl);
        promiseManager.reject(new Error('Synthetic test error - phase#1'));
        queue.queueTask(() => Promise.resolve());
        await Promise.allSettled([promiseManager.currentPromise, deactivationPromise, queue.yield(), ifVm['pending']]);
        mgr.assertLog(getPendingActivationLog('phase#1', true), 'phase#1 - post-reject');
        /** clear pending promise from if as it cannot handle a activation rejection by itself */
        ifVm['pending'] = void 0;

        // phase#2: try to activate c-1 - should work
        mgr.setPrefix('phase#2');
        rootVm.showC1 = true;
        queue.queueTask(() => Promise.resolve());
        await queue.yield();

        assert.html.textContent(appHost, 'c1', 'phase#2.textContent');
        mgr.assertLog([
          'phase#2.c-1.binding.enter',
          'phase#2.c-1.binding.leave',
          'phase#2.c-1.bound.enter',
          'phase#2.c-1.bound.leave',
          'phase#2.c-1.attaching.enter',
          'phase#2.c-1.attaching.leave',
          'phase#2.c-1.attached.enter',
          'phase#2.c-1.attached.leave',
        ], 'phase#2');

        // phase#3: try to activate c-2 with rejected promise - should work
        promiseManager.setMode('rejected');
        mgr.setPrefix('phase#3');
        rootVm.showC1 = false;
        queue.queueTask(() => Promise.resolve());
        queue.queueTask(() => Promise.resolve());
        await queue.yield();

        assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#3.textContent');
        mgr.assertLog(getPendingActivationLog('phase#3', false), 'phase#3');
        /** clear pending promise from if as it cannot handle a activation rejection by itself */
        ifVm['pending'] = void 0;

        // phase#4: try to activate c-1 - should work - JFF
        mgr.setPrefix('phase#4');
        rootVm.showC1 = true;
        queue.queueTask(() => Promise.resolve());
        await queue.yield();

        assert.html.textContent(appHost, 'c1', 'phase#4.textContent');
        mgr.assertLog([
          ...(hook === 'attaching' || hook === 'attached'
            ? [
              'phase#4.c-2.detaching.enter',
              'phase#4.c-2.detaching.leave',
              'phase#4.c-2.unbinding.enter',
              'phase#4.c-2.unbinding.leave',
            ]
            : []
          ),
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

        assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#5.textContent');
        mgr.assertLog(getPendingActivationLog('phase#5', false), 'phase#5');
        /** clear pending promise from if as it cannot handle a activation rejection by itself */
        ifVm['pending'] = void 0;

        // stop
        mgr.setPrefix('stop');
        let error: unknown = null;
        try {
          await stop(true);
        } catch (e) {
          error = e;
        }

        assert.strictEqual(error, null, 'stop');
        mgr.assertLog([
          ...(hook === 'attaching' || hook === 'attached'
            ? [
              'stop.c-2.detaching.enter',
              'stop.c-2.detaching.leave',
            ]
            : []
          ),
          'stop.app.detaching.enter',
          'stop.app.detaching.leave',
          ...(hook === 'attaching' || hook === 'attached'
            ? [
              'stop.c-2.unbinding.enter',
              'stop.c-2.unbinding.leave',
            ]
            : []
          ),
          'stop.app.unbinding.enter',
          'stop.app.unbinding.leave',
          'stop.app.dispose.enter',
          'stop.app.dispose.leave',
          'stop.c-1.dispose.enter',
          'stop.c-1.dispose.leave',
          'stop.c-2.dispose.enter',
          'stop.c-2.dispose.leave',
        ], 'stop');
      });
    });

  }
});
