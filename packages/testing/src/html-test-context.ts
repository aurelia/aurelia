import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import {
  IDOM,
  ILifecycle,
  IObserverLocator,
  IProjectorLocator,
  IComposer,
  IScheduler,
  ITemplateCompiler,
} from '@aurelia/runtime';
import { HTMLDOM, IPlatform } from '@aurelia/runtime-html';
import { createDOMScheduler } from '@aurelia/scheduler-dom';
import { BrowserPlatform } from '@aurelia/platform-browser';

export class HTMLTestContext {
  public readonly doc: Document;
  public readonly dom: HTMLDOM;
  public readonly platform: IPlatform;
  public readonly userAgent: string;

  public readonly UIEvent: typeof UIEvent;
  public readonly Event: typeof Event;
  public readonly CustomEvent: typeof CustomEvent;
  public readonly Node: typeof Node;
  public readonly Element: typeof Element;
  public readonly HTMLElement: typeof HTMLElement;
  public readonly HTMLDivElement: typeof HTMLDivElement;
  public readonly Text: typeof Text;
  public readonly Comment: typeof Comment;
  public readonly DOMParser: typeof DOMParser;

  public get container(): IContainer {
    if (this._container === void 0) {
      this._container = DI.createContainer().register(
        this.config,
        Registration.instance(IDOM, this.dom),
        Registration.instance(IPlatform, this.platform),
        Registration.instance(HTMLTestContext, this),
      );
      this._container.register(
        Registration.instance(IScheduler, createDOMScheduler(this._container, this.wnd)),
      );
    }
    return this._container;
  }
  public get scheduler(): IScheduler {
    if (this._scheduler === void 0) {
      this._scheduler = this.container.register(
        Registration.instance(IScheduler, createDOMScheduler(this.container, this.wnd))
      ).get(IScheduler);
    }
    return this._scheduler;
  }
  public get templateCompiler(): ITemplateCompiler {
    if (this._templateCompiler === void 0) {
      this._templateCompiler = this.container.get(ITemplateCompiler);
    }
    return this._templateCompiler;
  }
  public get observerLocator(): IObserverLocator {
    if (this._observerLocator === void 0) {
      this._observerLocator = this.container.get(IObserverLocator);
    }
    return this._observerLocator;
  }
  public get lifecycle(): ILifecycle {
    if (this._lifecycle === void 0) {
      this._lifecycle = this.container.get(ILifecycle);
    }
    return this._lifecycle;
  }
  public get composer(): IComposer {
    if (this._composer === void 0) {
      this._composer = this.container.get(IComposer);
    }
    return this._composer;
  }
  public get projectorLocator(): IProjectorLocator {
    if (this._projectorLocator === void 0) {
      this._projectorLocator = this.container.get(IProjectorLocator);
    }
    return this._projectorLocator;
  }
  public get domParser(): HTMLDivElement {
    if (this._domParser === void 0) {
      this._domParser = this.doc.createElement('div');
    }
    return this._domParser;
  }

  private _container?: IContainer;
  private _scheduler?: IScheduler;
  private _templateCompiler?: ITemplateCompiler;
  private _observerLocator?: IObserverLocator;
  private _lifecycle?: ILifecycle;
  private _composer?: IComposer;
  private _projectorLocator?: IProjectorLocator;
  private _domParser?: HTMLDivElement;

  private constructor(
    private readonly config: IRegistry,
    public readonly wnd: Window & typeof globalThis,
  ) {
    this.userAgent = wnd.navigator.userAgent;
    this.UIEvent = wnd.UIEvent;
    this.Event = wnd.Event;
    this.CustomEvent = wnd.CustomEvent;
    this.Node = wnd.Node;
    this.Element = wnd.Element;
    this.HTMLElement = wnd.HTMLElement;
    this.HTMLDivElement = wnd.HTMLDivElement;
    this.Text = wnd.Text;
    this.Comment = wnd.Comment;
    this.DOMParser = wnd.DOMParser;
    this.doc = wnd.document;
    this.dom = new HTMLDOM(wnd.document.body);
    this.platform = new BrowserPlatform(wnd);
    this._container = void 0;
    this._scheduler = void 0;
    this._templateCompiler = void 0;
    this._observerLocator = void 0;
    this._lifecycle = void 0;
    this._composer = void 0;
    this._projectorLocator = void 0;
    this._domParser = void 0;
  }

  public static create(config: IRegistry, $window: Window & typeof globalThis): HTMLTestContext {
    return new HTMLTestContext(config, $window);
  }

  public createElementFromMarkup(markup: string): HTMLElement {
    this.domParser.innerHTML = markup;
    return this.domParser.firstElementChild as HTMLElement;
  }

  public createElement(name: string): HTMLElement {
    return this.doc.createElement(name);
  }

  public createAttribute(name: string, value: string): Attr {
    const attr = this.doc.createAttribute(name);
    attr.value = value;
    return attr;
  }
}

export const TestContext = {
  createHTMLTestContext(): HTMLTestContext {
    throw new Error('No createHTMLTestContext function has been provided. Did you forget to call initializeJSDOMTestContext() or initializeBrowserTestContext()?');
  }
};
