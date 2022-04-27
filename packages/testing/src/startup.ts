/* eslint-disable no-console */
import { Constructable, EventAggregator, IContainer } from '@aurelia/kernel';
import { IObserverLocator } from '@aurelia/runtime';
import { CustomElement, Aurelia, IPlatform, ICustomElementViewModel } from '@aurelia/runtime-html';
import { TestContext } from './test-context.js';

const fixtureHooks = new EventAggregator();
export const onFixtureCreated = <T>(callback: (fixture: IFixture<T>) => unknown) => {
  return fixtureHooks.subscribe('fixture:created', (fixture: IFixture<T>) => {
    try {
      callback(fixture);
    } catch(ex) {
      console.log('(!) Error in fixture:created callback');
      console.log(ex);
    }
  });
};

export function createFixture<T>(template: string | Node,
  $class?: Constructable<T>,
  registrations: unknown[] = [],
  autoStart: boolean = true,
  ctx: TestContext = TestContext.create(),
): IFixture<T> {
  const { container, platform, observerLocator } = ctx;
  container.register(...registrations);
  const root = ctx.doc.body.appendChild(ctx.doc.createElement('div'));
  const host = root.appendChild(ctx.createElement('app'));
  const au = new Aurelia(container);
  const App = CustomElement.define({ name: 'app', template }, $class ?? class { } as Constructable<T>);
  if (container.has(App, true)) {
    throw new Error(
      'Container of the context cotains instance of the application root component. ' +
      'Consider using a different class, or context as it will likely cause surprises in tests.'
    );
  }
  const component = container.get(App);

  let startPromise: Promise<void> | void = void 0;
  if (autoStart) {
    au.app({ host: host, component });
    startPromise = au.start();
  }

  let tornCount = 0;

  const fixture = new class Results {
    public startPromise = startPromise;
    public ctx = ctx;
    public host = ctx.doc.firstElementChild as HTMLElement;
    public container = container;
    public platform = platform;
    public testHost = root;
    public appHost = host;
    public au = au;
    public component = component;
    public observerLocator = observerLocator;

    public async start() {
      await au.app({ host: host, component }).start();
    }

    public async tearDown() {
      if (++tornCount === 2) {
        console.log('(!) Fixture has already been torn down');
        return;
      }
      await au.stop();
      root.remove();
      au.dispose();
    }

    public get torn() {
      return tornCount > 0;
    }

    /**
     * @returns a promise that resolves after the associated app has started
     */
    public get promise(): Promise<Results> {
      return Promise.resolve(startPromise).then(() => this as Results);
    }
  }();

  fixtureHooks.publish('fixture:created', fixture);

  return fixture;
}

export interface IFixture<T> {
  readonly startPromise: void | Promise<void>;
  readonly ctx: TestContext;
  readonly host: HTMLElement;
  readonly container: IContainer;
  readonly platform: IPlatform;
  readonly testHost: HTMLElement;
  readonly appHost: HTMLElement;
  readonly au: Aurelia;
  readonly component: ICustomElementViewModel & T;
  readonly observerLocator: IObserverLocator;
  readonly torn: boolean;
  start(): Promise<void>;
  tearDown(): Promise<void>;
  readonly promise: Promise<this>;
}
