/* eslint-disable import/no-mutable-exports */
import { DI, IContainer, IRegistration, IRegistry, Registration } from '@aurelia/kernel';
import { IObserverLocator } from '@aurelia/runtime';
import {
  ITemplateCompiler,
  IPlatform,
  StandardConfiguration,
} from '@aurelia/runtime-html';

export class TestContext {
  public static readonly ambient: TestContext;

  public get wnd(): Window & typeof globalThis { return this.platform.globalThis as Window & typeof globalThis; }
  public get doc(): Document { return this.platform.document; }
  public get userAgent(): string { return this.platform.window.navigator.userAgent; }

  public get UIEvent() { return this.platform.globalThis.UIEvent; }
  public get Event() { return this.platform.globalThis.Event; }
  public get CustomEvent() { return this.platform.globalThis.CustomEvent; }
  public get Node() { return this.platform.globalThis.Node; }
  public get Element() { return this.platform.globalThis.Element; }
  public get HTMLElement() { return this.platform.globalThis.HTMLElement; }
  public get HTMLDivElement() { return this.platform.globalThis.HTMLDivElement; }
  public get Text() { return this.platform.globalThis.Text; }
  public get Comment() { return this.platform.globalThis.Comment; }
  public get DOMParser() { return this.platform.globalThis.DOMParser; }

  /** @internal */
  private _container: IContainer | undefined = void 0;
  public get container(): IContainer {
    if (this._container === void 0) {
      this._container = DI.createContainer();
      StandardConfiguration.register(this._container);
      this._container.register(
        Registration.instance(TestContext, this),
      );
      if (this._container.has(IPlatform, true) === false) {
        this._container.register(PLATFORMRegistration);
      }
    }
    return this._container;
  }
  /** @internal */
  private _platform: IPlatform | undefined = void 0;
  public get platform(): IPlatform {
    if (this._platform === void 0) {
      this._platform = this.container.get(IPlatform);
    }
    return this._platform;
  }
  /** @internal */
  private _templateCompiler: ITemplateCompiler | undefined = void 0;
  public get templateCompiler(): ITemplateCompiler {
    if (this._templateCompiler === void 0) {
      this._templateCompiler = this.container.get(ITemplateCompiler);
    }
    return this._templateCompiler;
  }
  private oL: IObserverLocator | undefined = void 0;
  public get observerLocator(): IObserverLocator {
    if (this.oL === void 0) {
      this.oL = this.container.get(IObserverLocator);
    }
    return this.oL;
  }
  /** @internal */
  private _domParser: HTMLDivElement | undefined = void 0;
  public get domParser(): HTMLDivElement {
    if (this._domParser === void 0) {
      this._domParser = this.doc.createElement('div');
    }
    return this._domParser;
  }

  private constructor() {}

  public static create(): TestContext {
    return new TestContext();
  }

  public createElementFromMarkup(markup: string): HTMLElement {
    this.domParser.innerHTML = markup;
    return this.domParser.firstElementChild as HTMLElement;
  }

  public createElement<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K];
  public createElement<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K];
  public createElement<E extends HTMLElement = HTMLElement>(selectors: string): E;
  public createElement(name: string): HTMLElement {
    return this.doc.createElement(name);
  }

  public createAttribute(name: string, value: string): Attr {
    const attr = this.doc.createAttribute(name);
    attr.value = value;
    return attr;
  }

  public type(host: HTMLElement, selector: string, value: string): void {
    const el = host.querySelector(selector) as HTMLElement & { value: string };
    el.value = value;
    el.dispatchEvent(new this.CustomEvent('change', { bubbles: true }));
  }
}

// Note: our tests shouldn't rely directly on this global variable, but retrieve the platform from a container instead.
// This keeps the door open for more easily mocking the task queues or certain globals (such as Date) in the future.
// It's OK to use this for environment or feature checks necessary to conditionally run tests that only work in specific envs,
// or for initializing test data (creating template elements) before actually running the tests that use that data.
// For existing usages that "violate" the above: do NOT introduce more of them. Intent is to get rid of those in a future test cleanup pass. Please don't create more work for when that time comes.
export let PLATFORM: IPlatform;
export let PLATFORMRegistration: IRegistration<IPlatform>;

export function setPlatform(p: IPlatform): void {
  PLATFORM = p;
  PLATFORMRegistration = Registration.instance(IPlatform, p);
}

export function createContainer(...registries: IRegistry[]): IContainer {
  return DI.createContainer().register(
    PLATFORMRegistration,
    ...registries,
  );
}
