/* eslint-disable no-console */
import { Constructable, EventAggregator, IContainer } from '@aurelia/kernel';
import { IObserverLocator } from '@aurelia/runtime';
import { CustomElement, Aurelia, IPlatform, type ICustomElementViewModel } from '@aurelia/runtime-html';
import { assert } from './assert';
import { TestContext } from './test-context';

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

export function createFixture<
  T,
  K = (T extends Constructable<infer U> ? U : T)
>(template: string | Node,
  $class?: T,
  registrations: unknown[] = [],
  autoStart: boolean = true,
  ctx: TestContext = TestContext.create(),
): IFixture<ICustomElementViewModel & K> {
  const { container, platform, observerLocator } = ctx;
  container.register(...registrations);
  const root = ctx.doc.body.appendChild(ctx.doc.createElement('div'));
  const host = root.appendChild(ctx.createElement('app'));
  const au = new Aurelia(container);
  const $$class: Constructable<K> = typeof $class === 'function'
    ? $class as unknown as Constructable<K>
    : $class == null
      ? class {} as Constructable<K>
      : function $Ctor() {
        Object.setPrototypeOf($class, $Ctor.prototype);
        return $class;
      } as unknown as Constructable<K>;

  const App = CustomElement.define<Constructable<K>>({ name: 'app', template }, $$class);

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

  const getBy: Document['querySelector'] = (selector: string): HTMLElement => {
    const elements = host.querySelectorAll<HTMLElement>(selector);
    if (elements.length > 1) {
      throw new Error(`There is more than 1 element with selector "${selector}": ${elements.length} found`);
    }
    if (elements.length === 0) {
      throw new Error(`No element found for selector: "${selector}"`);
    }
    return elements[0];
  };
  const getAllBy = (selector: string) => {
    return Array.from(host.querySelectorAll<HTMLElement>(selector));
  };
  const queryBy = (selector: string): HTMLElement | null => {
    const elements = host.querySelectorAll<HTMLElement>(selector);
    if (elements.length > 1) {
      throw new Error(`There is more than 1 element with selector "${selector}": ${elements.length} found`);
    }
    return elements.length === 0 ? null : elements[0];
  };
  const assertText = (selector: string, text: string): void => {
    const el = queryBy(selector);
    if (el === null) {
      throw new Error(`No element found for selector "${selector}" to compare text content with "${text}"`);
    }
    assert.strictEqual(el.textContent, text);
  };
  const trigger = ((selector: string, event: string, init?: CustomEventInit): void => {
    const el = queryBy(selector);
    if (el === null) {
      throw new Error(`No element found for selector "${selector}" to fire event "${event}"`);
    }
    el.dispatchEvent(new ctx.CustomEvent(event, init));
  }) as ITrigger;
  ['click', 'change', 'input'].forEach(event => {
    Object.defineProperty(trigger, event, { configurable: true, writable: true, value: (selector: string, init?: CustomEventInit): void => {
      const el = queryBy(selector);
      if (el === null) {
        throw new Error(`No element found for selector "${selector}" to fire event "${event}"`);
      }
      el.dispatchEvent(new ctx.CustomEvent(event, init));
    } });
  });

  const fixture = new class Results implements IFixture<K> {
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
    public get promise(): Promise<IFixture<K>> {
      return Promise.resolve(startPromise).then(() => this as IFixture<K>);
    }

    public getBy = getBy;
    public getAllBy = getAllBy;
    public queryBy = queryBy;
    public assertText = assertText;
    public trigger = trigger;
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
  readonly promise: Promise<IFixture<T>>;

  /**
   * Returns the first element that is a descendant of node that matches selectors, and throw if there is more than one, or none found
   */
  getBy<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K];
  getBy<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K];
  getBy<E extends Element = Element>(selectors: string): E | null;
  /**
   * Returns all element descendants of node that match selectors.
   */
  getAllBy<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K][];
  getAllBy<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K][];
  getAllBy<E extends Element = Element>(selectors: string): E[];
  /**
   * Returns the first element that is a descendant of node that matches selectors, and null if none found
   */
  queryBy<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
  queryBy<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
  queryBy<E extends Element = Element>(selectors: string): E | null;
  assertText(selector: string, text: string): void;
  trigger: ITrigger;
}

export type ITrigger = ((selector: string, event: string, init: CustomEventInit) => void) & {
  click(selector: string, init?: CustomEventInit): void;
  change(selector: string, init?: CustomEventInit): void;
  input(selector: string, init?: CustomEventInit): void;
};
