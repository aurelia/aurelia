import { Constructable, EventAggregator, IContainer, ILogger, MaybePromise } from '@aurelia/kernel';
import { Metadata } from '@aurelia/metadata';
import { IObserverLocator } from '@aurelia/runtime';
import { CustomElement, Aurelia, IPlatform, type ICustomElementViewModel, CustomElementDefinition } from '@aurelia/runtime-html';
import { assert } from './assert';
import { hJsx } from './h';
import { TestContext } from './test-context';
import { getVisibleText } from './specialized-assertions';

const fixtureHooks = new EventAggregator();
export const onFixtureCreated = <T>(callback: (fixture: IFixture<T>) => unknown) => {
  return fixtureHooks.subscribe('fixture:created', (fixture: IFixture<T>) => {
    try {
      callback(fixture);
    } catch (ex) {
      console.log('(!) Error in fixture:created callback');
      console.log(ex);
    }
  });
};

export type ObjectType<T> = T extends Constructable<infer U> ? U : T;

// eslint-disable-next-line max-lines-per-function
export function createFixture<T extends object>(
  template: string | Node,
  $class?: T,
  registrations: unknown[] = [],
  autoStart: boolean = true,
  ctx: TestContext = TestContext.create(),
): IFixture<ICustomElementViewModel & ObjectType<T>> {
  type K = ObjectType<T>;
  const { container } = ctx;
  container.register(...registrations);

  // platform and observer locator have side effect when accessed on ctx
  // they will trigger default registration of interfaces if there's been no registration before it
  // hence evaluate platform + observer locator only after we have registered all the dependencies
  const { platform, observerLocator } = ctx;
  const root = ctx.doc.body.appendChild(ctx.createElement('div'));
  const host = root.appendChild(ctx.createElement('app'));
  const au = new Aurelia(container);
  const $$class: Constructable<K> = typeof $class === 'function'
    ? $class as unknown as Constructable<K>
    : $class == null
      ? class { } as Constructable<K>
      : function $Ctor() {
        Object.setPrototypeOf($class, $Ctor.prototype);
        return $class;
      } as unknown as Constructable<K>;

  const annotations: (Exclude<keyof CustomElementDefinition, 'Type' | 'key' | 'type' | 'register' | 'toString'>)[] =
    ['aliases', 'bindables', 'cache', 'capture', 'containerless', 'dependencies', 'enhance'];
  if ($$class !== $class as any && $class != null) {
    annotations.forEach(anno => {
      Metadata.define(anno, CustomElement.getAnnotation($class as unknown as Constructable<K>, anno), $$class);
    });
  }

  const existingDefs = (CustomElement.isType($$class) ? CustomElement.getDefinition($$class) : {}) as CustomElementDefinition;
  const App = CustomElement.define<Constructable<K>>({
    ...existingDefs,
    name: 'app',
    template,
  }, $$class);

  if (container.has(App, true)) {
    throw new Error(
      'Container of the context contains instance of the application root component. ' +
      'Consider using a different class, or context as it will likely cause surprises in tests.'
    );
  }
  const component = container.get(App);

  let startPromise: Promise<void> | void = void 0;

  function start() {
    if (autoStart) {
      try {
        au.app({ host: host, component });
        startPromise = au.start();
      } catch (ex) {
        try {
          const dispose = () => {
            root.remove();
            au.dispose();
          };
          const ret = au.stop();
          if (ret instanceof Promise)
            void ret.then(dispose);
          else
            dispose();
        } catch {
          console.warn('(!) corrupted fixture state, should isolate the failing test and restart the run'
            + 'as it is likely that this failing fixture creation will pollute others.');
        }

        throw ex;
      }
    }
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
  function getAllBy(selector: string) {
    return Array.from(host.querySelectorAll<HTMLElement>(selector));
  }
  function queryBy(selector: string) {
    const elements = host.querySelectorAll<HTMLElement>(selector);
    if (elements.length > 1) {
      throw new Error(`There is more than 1 element with selector "${selector}": ${elements.length} found`);
    }
    return elements.length === 0 ? null : elements[0];
  }
  function strictQueryBy(selector: string, queryErrorSuffixMessage: string = ''): HTMLElement {
    const elements = host.querySelectorAll<HTMLElement>(selector);
    if (elements.length > 1) {
      throw new Error(`There is more than 1 element with selector "${selector}": ${elements.length} found${queryErrorSuffixMessage ? ` ${queryErrorSuffixMessage}` : ''}`);
    }
    if (elements.length === 0) {
      throw new Error(`There is no element with selector "${selector}" found${queryErrorSuffixMessage ? ` ${queryErrorSuffixMessage}` : ''}`);
    }
    return elements[0];
  }
  function assertText(selector: string, text?: string) {
    if (arguments.length === 2) {
      const el = strictQueryBy(selector);
      if (el === null) {
        throw new Error(`No element found for selector "${selector}" to compare text content with "${text}"`);
      }
      assert.strictEqual(getVisibleText(el), text);
    } else {
      assert.strictEqual(getVisibleText(host), selector);
    }
  }
  function assertTextContain(selector: string, text?: string) {
    if (arguments.length === 2) {
      const el = strictQueryBy(selector);
      if (el === null) {
        throw new Error(`No element found for selector "${selector}" to compare text content with "${text}"`);
      }
      assert.includes(getVisibleText(el)!, text!);
    } else {
      assert.includes(getVisibleText(host)!, selector);
    }
  }
  function getInnerHtml(el: Element, compact?: boolean) {
    let actual = el.innerHTML;
    if (compact) {
      actual = actual
        .replace(/<!--au-start-->/g, '')
        .replace(/<!--au-end-->/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return actual;
  }
  function assertHtml(selectorOrHtml: string, html: string = selectorOrHtml, { compact }: { compact?: boolean } = { compact: false }) {
    if (arguments.length > 1) {
      const el = strictQueryBy(selectorOrHtml, `to compare innerHTML against "${html}`);
      assert.strictEqual(getInnerHtml(el, compact), html);
    } else {
      assert.strictEqual(getInnerHtml(host, compact), selectorOrHtml);
    }
  }
  function assertClass(selector: string, ...classes: string[]) {
    const el = strictQueryBy(selector, `to assert className contains "${classes}"`);
    classes.forEach(c => assert.contains(el.classList, c));
  }
  function assertAttr(selector: string, name: string, value: string | null) {
    const el = strictQueryBy(selector, `to compare attribute "${name}" against "${value}"`);
    assert.strictEqual(el.getAttribute(name), value);
  }
  function assertAttrNS(selector: string, namespace: string, name: string, value: string | null) {
    const el = strictQueryBy(selector, `to compare attribute "${name}" against "${value}"`);
    assert.strictEqual(el.getAttributeNS(namespace, name), value);
  }
  function assertStyles(selector: string, styles: CSSStyleDeclaration) {
    const el = strictQueryBy(selector, `to compare style attribute against ${JSON.stringify(styles ?? {})}`);
    const elStyles: Partial<CSSStyleDeclaration> = {};
    for (const rule in styles) {
      elStyles[rule] = el.style[rule];
    }
    assert.deepStrictEqual(elStyles, styles);
  }
  function assertValue(selector: string, value: string | null) {
    const el = strictQueryBy(selector, `to compare value against "${value}"`);
    assert.strictEqual((el as any).value, value);
  }
  function trigger(selector: string, event: string, init?: CustomEventInit): void {
    const el = strictQueryBy(selector, `to fire event "${event}"`);
    el.dispatchEvent(new ctx.CustomEvent(event, init));
  }
  ['click', 'change', 'input', 'scroll'].forEach(event => {
    Object.defineProperty(trigger, event, {
      configurable: true, writable: true, value: (selector: string, init?: CustomEventInit): void => {
        const el = strictQueryBy(selector, `to fire event "${event}"`);
        el.dispatchEvent(new ctx.CustomEvent(event, init));
      }
    });
  });
  function type(selector: string | Element, value: string): void {
    const el = typeof selector === 'string' ? strictQueryBy(selector, `to emulate input for "${value}"`) : selector;
    if (el === null || !/input|textarea/i.test(el.nodeName)) {
      throw new Error(`No <input>/<textarea> element found for selector "${selector}" to emulate input for "${value}"`);
    }
    (el as HTMLInputElement).value = value;
    el.dispatchEvent(new platform.window.Event('input'));
  }

  const scrollBy = (selector: string, init: number | ScrollToOptions) => {
    const el = strictQueryBy(selector, `to scroll by "${JSON.stringify(init)}"`);
    el.scrollBy(typeof init === 'number' ? { top: init } : init);
    el.dispatchEvent(new platform.window.Event('scroll'));
  };

  const flush = (time?: number) => {
    ctx.platform.domWriteQueue.flush(time);
  };

  const stop = (dispose: boolean = false): void | Promise<void> => {
    let ret: MaybePromise<void> = void 0;
    try {
      ret = au.stop(dispose);
    } finally {
      if (dispose) {
        if (++tornCount > 1) {
          console.log('(!) Fixture has already been torn down');
        } else {
          const $dispose = () => {
            root.remove();
            au.dispose();
          };
          if (ret instanceof Promise) {
            ret = ret.then($dispose);
          } else {
            $dispose();
          }
        }
      }
    }
    return ret;
  };

  let app: ReturnType<Aurelia['app']>;

  const fixture = new class Results implements IFixture<K> {
    public startPromise = startPromise;
    public ctx = ctx;
    public container = container;
    public platform = platform;
    public testHost = root;
    public appHost = host;
    public au = au;
    public component = component;
    public observerLocator = observerLocator;
    public logger = container.get(ILogger);
    public hJsx = hJsx.bind(ctx.doc);

    public start() {
      return (app ??= au.app({ host: host, component })).start();
    }

    public tearDown() {
      return stop(true);
    }

    public stop = stop;

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

    public printHtml(): string {
      const html = host.innerHTML;
      console.log(html);
      return html;
    }

    public getBy = getBy;
    public getAllBy = getAllBy;
    public queryBy = queryBy;
    public assertText = assertText;
    public assertTextContain = assertTextContain;
    public assertHtml = assertHtml;
    public assertClass = assertClass;
    public assertAttr = assertAttr;
    public assertAttrNS = assertAttrNS;
    public assertStyles = assertStyles;
    public assertValue = assertValue;
    public createEvent = (name: string, init?: CustomEventInit) => new platform.CustomEvent(name, init);
    public trigger = trigger as ITrigger;
    public type = type;
    public scrollBy = scrollBy;
    public flush = flush;
  }();

  fixtureHooks.publish('fixture:created', fixture);
  start();

  return fixture;
}

export interface IFixture<T> {
  readonly startPromise: void | Promise<void>;
  readonly ctx: TestContext;
  readonly container: IContainer;
  readonly platform: IPlatform;
  readonly testHost: HTMLElement;
  readonly appHost: HTMLElement;
  readonly au: Aurelia;
  readonly component: ICustomElementViewModel & T;
  readonly observerLocator: IObserverLocator;
  readonly logger: ILogger;
  readonly torn: boolean;
  start(): void | Promise<void>;
  /**
   * @deprecated use `stop(true)` instead
   */
  tearDown(): void | Promise<void>;
  stop(dispose?: boolean): void | Promise<void>;
  readonly started: Promise<IFixture<T>>;

  /**
   * Print to console and return the innerHTML of the current application
   */
  printHtml(): string;

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
   * Assert the text content of the current application host equals to a given string
   */
  assertTextContain(text: string): void;
  /**
   * Assert the text content of an element matching the given selector inside the application host equals to a given string.
   *
   * Will throw if there' more than one elements with matching selector
   */
  assertTextContain(selector: string, text: string): void;

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
  /**
   * Assert an element based on the given selector has the given css classes
   */
  assertClass(selector: string, ...classes: string[]): void;
  /**
   * Assert the attribute value of an element matching the given selector inside the application host equals to a given string.
   *
   * Will throw if there' more than one elements with matching selector
   */
  assertAttr(selector: string, name: string, value: string): void;
  /**
   * Assert the attribute value of an element matching the given selector inside the application host equals to a given string.
   *
   * Will throw if there' more than one elements with matching selector
   */
  assertAttrNS(selector: string, namespace: string, name: string, value: string): void;
  /**
   * Assert the style values of an element matching the given record (kebab-case properties as in the style attributes),
   * rather than the camelCase as in the property of `element.style`
   */
  assertStyles(selector: string, styles: Partial<CSSStyleDeclaration>): void;
  /**
   * Assert the value of an element matching the given selector inside the application host equals to a given value.
   *
   * Will throw if there' more than one elements with matching selector
   */
  assertValue(selector: string, value: unknown): void;
  /**
   * Create a custom event by the given name and init for the current platform
   */
  createEvent<T>(name: string, init?: CustomEventInit<T>): CustomEvent;

  /**
   * Find an input or text area by the selector and emulate a keyboard event with the given value
   */
  type(selector: string | Element, value: string): void;

  hJsx(name: string, attrs: Record<string, string> | null, ...children: (Node | string | (Node | string)[])[]): HTMLElement;

  trigger: ITrigger;

  /**
   * A helper to scroll and trigger a scroll even on an element matching the given selector
   */
  scrollBy(selector: string, options: number | ScrollToOptions): void;

  flush(): void;
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
type CreateBuilder<T, Availables extends BuilderMethodNames> = {
  [key in Availables]:
    key extends 'html'
      ? {
        (html: string): CreateBuilder<T, Exclude<Availables, 'html'>>;
        (html: TemplateStringsArray, ...values: TemplateValues<T>[]): CreateBuilder<T, Exclude<Availables, 'html'>>;
      }
      : (...args: Parameters<IFixtureBuilderBase<T>[key]>) => CreateBuilder<T, Exclude<Availables, key>>
} & ('html' extends Availables ? {} : { build(): IFixture<T> });

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
    return this as unknown as CreateBuilder<T, Exclude<BuilderMethodNames, 'html'>>;
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
    return createFixture<any>(
      typeof this._html === 'string' ? this._html : brokenProcessFastTemplate(this._html, ...this._htmlArgs ?? []),
      this._comp,
      this._args
    );
  }
}

function brokenProcessFastTemplate(html: TemplateStringsArray, ..._args: unknown[]): string {
  let result = html[0];
  for (let i = 0; i < _args.length; ++i) {
    result += String(_args[i]) + html[i + 1];
  }
  return result;
}

createFixture.html = <T = Record<PropertyKey, any>>(html: string | TemplateStringsArray, ...values: TemplateValues<T>[]) => new FixtureBuilder<T>().html(html, ...values);
createFixture.component = <T, K extends ObjectType<T>>(component: T) => new FixtureBuilder<K>().component(component as unknown as K);
createFixture.deps = <T = Record<PropertyKey, any>>(...deps: unknown[]) => new FixtureBuilder<T>().deps(...deps);

/* eslint-disable */
function testBuilderTypings() {
  type Expect<T extends true> = T;
  type Equal<A, B> =
    (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
      ? true
      : false;
  type IsType<A, B> = A extends B ? B extends A ? 1 : never : never;

  // @ts-expect-error
  const a1 = createFixture.component({}).build();
  const A1: IsType<typeof a1, any> = 1;

  // @ts-expect-error
  const a2 = createFixture.component({}).deps().build();
  const A2: IsType<typeof a2, any> = 1;

  const a3 = createFixture.component({}).deps().html``.build();
  const A3: IsType<typeof a3, IFixture<{}>> = 1;

  const ac1 = createFixture.component({ a: 1 }).deps().html``.build();
  const AC1: IsType<typeof ac1, IFixture<{ a: number }>> = 1;

  const ac2 = createFixture.component(class Abc { a = 1 }).deps().html``.build();
  const ac21: IsType<typeof ac2.component, { a: number }> = 1;
  const AC2: IsType<typeof ac2, IFixture<{ a: number }>> = 1;
  type AC3 = Expect<Equal<typeof ac2, IFixture<{ a: number }>>>;

  const a4 = createFixture.html``.build();
  const A4: IsType<typeof a4, IFixture<{}>> = 1;

  // @ts-expect-error
  const a5 = createFixture.html``.component().deps().build();
  const A5: IsType<typeof a5, any> = 1;

  // @ts-expect-error
  const a6 = createFixture.deps().build();
  const A6: IsType<typeof a6, any> = 1;

  // @ts-expect-error
  const a7 = createFixture.deps().component({}).build();
  const A7: IsType<typeof a7, any> = 1;

  const a8 = createFixture.deps().component({}).html``.build();
  const A8: IsType<typeof a8, IFixture<{}>> = 1;

  const { component } = createFixture(
    'abc',
    { a: [1, 2] }
  );
  const C1: IsType<{ a: number[] }, typeof component> = 1;
}
/* eslint-enable */
