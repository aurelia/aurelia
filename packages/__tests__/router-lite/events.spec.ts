import { Class, DI, IDisposable, LogLevel, noop } from '@aurelia/kernel';
import { IRouter, IRouterEvents, route, RouterConfiguration } from '@aurelia/router-lite';
import { AppTask, Aurelia, customElement } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { TestRouterConfiguration } from './_shared/configuration.js';

describe('events', function () {
  type RouterTestStartOptions<TAppRoot> = {
    appRoot: Class<TAppRoot>;
    registrations?: any[];
  };

  async function start<TAppRoot>({ appRoot, registrations = [] }: RouterTestStartOptions<TAppRoot>) {
    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(
      TestRouterConfiguration.for(LogLevel.warn),
      RouterConfiguration,
      ...registrations,
      ISomeService,
      AppTask.creating(ISomeService, noop), // force the service creation
      AppTask.deactivating(ISomeService, service => service.dispose())
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component: appRoot, host }).start();
    const rootVm = au.root.controller.viewModel as TAppRoot;
    return { host, au, container, rootVm };
  }

  const ISomeService = DI.createInterface<ISomeService>('ISomeService', x => x.singleton(SomeService));
  interface ISomeService extends SomeService { }
  class SomeService implements IDisposable {
    private readonly subscriptions: IDisposable[];
    public log: string[] = [];
    public constructor(@IRouterEvents events: IRouterEvents) {
      this.subscriptions = [
        events.subscribe('au:router:location-change', (event) => {
          this.log.push(`${event.name} - ${event.id} - '${event.url}'`);
        }),
        events.subscribe('au:router:navigation-start', (event) => {
          this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl()}'`);
        }),
        events.subscribe('au:router:navigation-end', (event) => {
          this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl()}'`);
        }),
        events.subscribe('au:router:navigation-cancel', (event) => {
          this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl()}' - ${String(event.reason)}`);
        }),
        events.subscribe('au:router:navigation-error', (event) => {
          this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl()}' - ${String(event.error)}`);
        }),
      ];
    }
    public clear() {
      this.log.length = 0;
    }
    public dispose(): void {
      const subscriptions = this.subscriptions;
      this.subscriptions.length = 0;
      const len = subscriptions.length;
      for (let i = 0; i < len; i++) {
        subscriptions[i].dispose();
      }
    }
  }

  it('successful navigation', async function () {
    @customElement({ name: 'c-1', template: 'c1' })
    class ChildOne { }

    @customElement({ name: 'c-2', template: 'c2' })
    class ChildTwo { }

    @route({
      routes: [
        { path: ['', 'c1'], component: ChildOne },
        { path: 'c2', component: ChildTwo },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root });
    const service = container.get(ISomeService);
    const router = container.get(IRouter);

    // init
    assert.html.textContent(host, 'c1');
    assert.deepStrictEqual(service.log, [
      'au:router:navigation-start - 1 - \'\'',
      'au:router:navigation-end - 1 - \'\'',
    ]);

    // round#1
    service.clear();
    await router.load('c2');
    assert.html.textContent(host, 'c2');
    assert.deepStrictEqual(service.log, [
      'au:router:navigation-start - 2 - \'c2\'',
      'au:router:navigation-end - 2 - \'c2\'',
    ]);

    // round#2
    service.clear();
    await router.load('c1');
    assert.html.textContent(host, 'c1');
    assert.deepStrictEqual(service.log, [
      'au:router:navigation-start - 3 - \'c1\'',
      'au:router:navigation-end - 3 - \'c1\'',
    ]);

    await au.stop();
  });
});
