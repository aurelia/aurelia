import { ILogger, LogLevel, Registration, resolve } from '@aurelia/kernel';
import { ChildActivationSuspensionInstruction, IRouter, IRouteViewModel, NavigationInstruction, Params, route, RouteNode, RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, CustomElement, customElement, ICustomElementViewModel, IHydratedController, IPlatform } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { TestRouterConfiguration } from './_shared/configuration.js';
import { EventLog, IKnownScopes } from './_shared/event-log.js';

describe.only('router-lite/child-route-activation-suspension.spec.ts', function () {

  abstract class BaseViewModel implements IRouteViewModel, ICustomElementViewModel {
    public readonly logger: ILogger = resolve(ILogger).scopeTo(this.constructor.name);

    public canLoad(_params: Params, _next: RouteNode, _current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | ChildActivationSuspensionInstruction | Promise<boolean | NavigationInstruction | NavigationInstruction[] | ChildActivationSuspensionInstruction> {
      this.logger.trace('canLoad');
      return true;
    }

    public loading(_params: Params, _next: RouteNode, _current: RouteNode | null): void | Promise<void> {
      this.logger.trace('loading');
    }

    public binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
      this.logger.trace('binding');
    }

    public bound(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
      this.logger.trace('bound');
    }

    public attaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
      this.logger.trace('attaching');
    }

    public attached(_initiator: IHydratedController): void | Promise<void> {
      this.logger.trace('attached');
    }

    public detaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
      this.logger.trace('detaching');
    }

    public unbinding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
      this.logger.trace('unbinding');
    }

    public canUnload(_next: RouteNode | null, _current: RouteNode): boolean | Promise<boolean> {
      this.logger.trace('canUnload');
      return true;
    }

    public unloading(_next: RouteNode | null, _current: RouteNode): void | Promise<void> {
      this.logger.trace('unloading');
    }
  }

  async function createFixture(rootComponent: unknown, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(
      TestRouterConfiguration.for(
        LogLevel.trace,
        [
          EventLog
          // uncomment the following line to see the logs in console - debug
          /* , ConsoleSink */
        ]),
      RouterConfiguration,
      ...registrations
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component: rootComponent as object, host }).start();
    return { au, container, host };
  }

  it('child route activation can be suspended - continue on resolution', async function () {
    @customElement({ name: 'c-1', template: 'c-1' })
    class C1 extends BaseViewModel { }

    @customElement({ name: 'c-2', template: 'c-2' })
    class C2 extends BaseViewModel { }

    @route({ routes: [C1, C2] })
    @customElement({
      name: 'p-1', template: `p-1
  <template promise.bind="loadingPromise">
    <template pending>Waiting</template>
    <au-viewport then></au-viewport>
  </template>` })
    class P1 extends BaseViewModel {
      private loadingPromise!: Promise<void>;
      public promiseResolver!: () => void;

      public canLoad(_params: Params, _next: RouteNode, _current: RouteNode | null): ChildActivationSuspensionInstruction {
        void super.canLoad(_params, _next, _current);
        this.loadingPromise = new Promise(resolve => {
          this.promiseResolver = resolve;
        });
        return {
          continueOn: 'resolution',
          promise: this.loadingPromise
        };
      }
    }

    @route({ routes: [P1] })
    @customElement({ name: 'app', template: `<au-viewport></au-viewport>` })
    class App { }

    const { au, container, host } = await createFixture(App, [
      P1,
      C1,
      C2,
      Registration.instance(IKnownScopes, [P1.name, C1.name, C2.name])
    ]);
    console.log('fixture created');
    const platform = container.get(IPlatform);
    const domQueue = platform.domQueue;
    const queue = platform.taskQueue;
    const eventLog = EventLog.getInstance(container);
    const router = container.get(IRouter);

    const loadPromise = router.load('p-1/c-1');
    console.log('router load done');
    await eventLog.assertLogAsync([
      /P1] canLoad/,
      /P1] loading/,
      /P1] binding/,
      /P1] bound/,
      /P1] attaching/,
      /P1] attached/,
    ], 'round #1');
    await domQueue.yield();
    assert.html.textContent(host, 'p-1 Waiting');

    eventLog.clear();
    console.log('resolving promise');
    CustomElement.for<P1>(host.querySelector('p-1')!).viewModel.promiseResolver();
    await eventLog.assertLogAsync([
      /C1] canLoad/,
      /C1] loading/,
      /C1] binding/,
      /C1] bound/,
      /C1] attaching/,
      /C1] attached/,
    ], 'round #1 - continued');

    // await loadPromise;
    // await domQueue.yield();
    // eventLog.assertLog([
    //   /C1] canLoad/,
    //   /C1] loading/,
    //   /C1] binding/,
    //   /C1] bound/,
    //   /C1] attaching/,
    //   /C1] attached/,
    // ], 'round #1 - continued');

    await au.stop(true);
  });
});
