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

export function createFixture<T, K = (T extends Constructable<infer U> ? U : T)>(
  template: string | Node,
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
  const assertText = (selector: string, text?: string): void => {
    if (arguments.length === 2) {
      const el = queryBy(selector);
      if (el === null) {
        throw new Error(`No element found for selector "${selector}" to compare text content with "${text}"`);
      }
      assert.strictEqual(el.textContent, text);
    } else {
      assert.strictEqual(host.textContent, selector);
    }
  };
  const assertHtml = (selector: string, html?: string) => {
    if (arguments.length === 2) {
      const el = queryBy(selector);
      if (el === null) {
        throw new Error(`No element found for selector "${selector}" to compare innerHTML with "${html}"`);
      }
      assert.strictEqual(el.innerHTML, html);
    } else {
      assert.strictEqual(host.innerHTML, selector);
    }
  };
  const trigger = ((selector: string, event: string, init?: CustomEventInit): void => {
    const el = queryBy(selector);
    if (el === null) {
      throw new Error(`No element found for selector "${selector}" to fire event "${event}"`);
    }
    el.dispatchEvent(new ctx.CustomEvent(event, init));
  }) as ITrigger;
  ['click', 'change', 'input', 'scroll'].forEach(event => {
    Object.defineProperty(trigger, event, { configurable: true, writable: true, value: (selector: string, init?: CustomEventInit): void => {
      const el = queryBy(selector);
      if (el === null) {
        throw new Error(`No element found for selector "${selector}" to fire event "${event}"`);
      }
      el.dispatchEvent(new ctx.CustomEvent(event, init));
    } });
  });

  const scrollBy = (selector: string, init: number | ScrollToOptions) => {
    const el = queryBy(selector);
    if (el === null) {
      throw new Error(`No element found for selector "${selector}" to scroll by "${JSON.stringify(init)}"`);
    }
    el.scrollBy(typeof init === 'number' ? { top: init } : init);
    el.dispatchEvent(new Event('scroll'));
  };

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

    public tearDown() {
      if (++tornCount === 2) {
        console.log('(!) Fixture has already been torn down');
        return;
      }
      const dispose = () => {
        root.remove();
        au.dispose();
      };
      const ret = au.stop();
      if (ret instanceof Promise)
        return ret.then(dispose);
      else
        return dispose();
    }

    public get torn() {
      return tornCount > 0;
    }

    /**
     * @returns a promise that resolves after the associated app has started
     */
    public get started(): Promise<IFixture<K>> {
      if (startPromise instanceof Promise) {
        return Promise.resolve(startPromise).then(() => this as IFixture<K>);
      }
      return Promise.resolve(this);
    }

    public getBy = getBy;
    public getAllBy = getAllBy;
    public queryBy = queryBy;
    public assertText = assertText;
    public assertHtml = assertHtml;
    public trigger = trigger;
    public scrollBy = scrollBy;
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
  tearDown(): void | Promise<void>;
  readonly started: Promise<IFixture<T>>;

  /**
   * Returns the first element that is a descendant of node that matches selectors, and throw if there is more than one, or none found
   */
  getBy<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K];
  getBy<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K];
  getBy<E extends HTMLElement = HTMLElement>(selectors: string): E | null;
  /**
   * Returns all element descendants of node that match selectors.
   */
  getAllBy<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K][];
  getAllBy<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K][];
  getAllBy<E extends HTMLElement = HTMLElement>(selectors: string): E[];
  /**
   * Returns the first element that is a descendant of node that matches selectors, and null if none found
   */
  queryBy<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
  queryBy<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
  queryBy<E extends HTMLElement = HTMLElement>(selectors: string): E | null;

  /**
   * Assert the text content of the current application host equals to a given string
   */
  assertText(text: string): void;
  /**
   * Assert the text content of an element matching the given selector inside the application host equals to a given string.
   *
   * Will throw if there' more than one elements with matching selector
   */
  assertText(selector: string, text: string): void;

  /**
   * Assert the inner html of the current application host equals to the given html string
   */
  assertHtml(html: string): void;
  /**
   * Assert the inner html of an element matching the selector inside the current application host equals to the given html string.
   *
   * Will throw if there' more than one elements with matching selector
   */
  assertHtml(selector: string, html: string): void;

  trigger: ITrigger;

  /**
   * A helper to scroll and trigger a scroll even on an element matching the given selector
   */
  scrollBy(selector: string, options: number | ScrollToOptions): void;
}

export type ITrigger = ((selector: string, event: string, init?: CustomEventInit) => void) & {
  click(selector: string, init?: CustomEventInit): void;
  change(selector: string, init?: CustomEventInit): void;
  input(selector: string, init?: CustomEventInit): void;
  scroll(selector: string, init?: CustomEventInit): void;
};

export interface IFixtureBuilderBase<T, E = {}> {
  html(html: string): this & E;
  html<M>(html: TemplateStringsArray, ...values: TemplateValues<M>[]): this & E;
  component(comp: T): this & E;
  deps(...args: unknown[]): this & E;
}

type BuilderMethodNames = 'html' | 'component' | 'deps';
type CreateBuilder<T, Availables extends BuilderMethodNames = BuilderMethodNames> = {
  [key in Availables]:
    key extends 'html'
      ? {
        (html: string): CreateBuilder<T, Exclude<Availables, 'html'>> & { build(): IFixture<T> };
        (html: TemplateStringsArray, ...values: TemplateValues<T>[]): CreateBuilder<T, Exclude<Availables, 'html'>> & { build(): IFixture<T> };
      }
        : (...args: Parameters<IFixtureBuilderBase<T>[key]>) => CreateBuilder<T, Exclude<Availables, key>>
} & (never extends Availables ? { build(): IFixture<T> } : {});

type TaggedTemplateLambda<M> = (vm: M) => unknown;
type TemplateValues<M> = string | number | TaggedTemplateLambda<M>;

class FixtureBuilder<T> {
  private _html?: string | TemplateStringsArray;
  private _htmlArgs?: TemplateValues<T>[];
  private _comp?: T;
  private _args?: unknown[];

  public html(html: string | TemplateStringsArray, ...htmlArgs: TemplateValues<T>[]): CreateBuilder<T, Exclude<BuilderMethodNames, 'html'>> {
    this._html = html;
    this._htmlArgs = htmlArgs;
    return this;
  }

  public component(comp: T): CreateBuilder<T, Exclude<BuilderMethodNames, 'component'>> {
    this._comp = comp;
    return this;
  }

  public deps(...args: unknown[]): CreateBuilder<T, Exclude<BuilderMethodNames, 'deps'>> {
    this._args = args;
    return this;
  }

  public build() {
    if (this._html === void 0) {
      throw new Error('Builder is not ready, missing template, call .html()/.html`` first');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createFixture<any>(
      typeof this._html === 'string' ? this._html : brokenProcessFastTemplate(this._html, ...this._htmlArgs ?? []),
      this._comp,
      this._args
    );
  }
}

function brokenProcessFastTemplate(html: TemplateStringsArray, ..._args: unknown[]): string {
  return html.join('');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
createFixture.html = <T = Record<string, any>>(html: string | TemplateStringsArray, ...values: TemplateValues<T>[]) => new FixtureBuilder<T>().html(html, ...values) ;
createFixture.component = <T>(component: T) => new FixtureBuilder<T>().component(component);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
createFixture.deps = <T = Record<string, any>>(...deps: unknown[]) => new FixtureBuilder<T>().deps(...deps);
