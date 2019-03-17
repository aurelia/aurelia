import {
  BasicConfiguration as BasicBrowserConfiguration
} from '@aurelia/jit-html-browser';
import {
  BasicConfiguration as BasicJSDOMConfiguration
} from '@aurelia/jit-html-jsdom';
import {
  DI,
  IContainer,
  IRegistry,
  Registration
} from '@aurelia/kernel';
import {
  IDOM,
  ILifecycle,
  IObserverLocator,
  IProjectorLocator,
  IRenderer,
  IRenderingEngine,
  ITemplateCompiler,
  DOM
} from '@aurelia/runtime';
import {
  HTMLDOM
} from '@aurelia/runtime-html';
import { JSDOM } from 'jsdom';

export class HTMLTestContext {
  public readonly wnd: Window;
  public readonly doc: Document;
  public readonly dom: HTMLDOM;

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

  private readonly config: IRegistry;

  public get container(): IContainer {
    if (this._container === void 0) {
      this._container = DI.createContainer(this.config);
      Registration.instance(IDOM, this.dom).register(this._container);
      Registration.instance(HTMLTestContext, this).register(this._container);
    }
    return this._container;
  }
  public get templateCompiler(): ITemplateCompiler {
    if (this._templateCompiler == void 0) {
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
  public get lifecycle(): ILifecycle & { flushCount?: number } {
    if (this._lifecycle === void 0) {
      this._lifecycle = this.container.get(ILifecycle);
    }
    return this._lifecycle;
  }
  public get renderer(): IRenderer {
    if (this._renderer === void 0) {
      this._renderer = this.container.get(IRenderer);
    }
    return this._renderer;
  }
  public get projectorLocator(): IProjectorLocator {
    if (this._projectorLocator === void 0) {
      this._projectorLocator = this.container.get(IProjectorLocator);
    }
    return this._projectorLocator;
  }
  public get renderingEngine(): IRenderingEngine {
    if (this._renderingEngine === void 0) {
      this._renderingEngine = this.container.get(IRenderingEngine);
    }
    return this._renderingEngine;
  }
  public get domParser(): HTMLDivElement {
    if (this._domParser === void 0) {
      this._domParser = this.doc.createElement('div');
    }
    return this._domParser;
  }

  private _container?: IContainer;
  private _templateCompiler?: ITemplateCompiler;
  private _observerLocator?: IObserverLocator;
  private _lifecycle?: ILifecycle;
  private _renderer?: IRenderer;
  private _projectorLocator?: IProjectorLocator;
  private _renderingEngine?: IRenderingEngine;
  private _domParser?: HTMLDivElement;

  private constructor(
    config: IRegistry,
    wnd: Window,
    UIEventType: typeof UIEvent,
    EventType: typeof Event,
    CustomEventType: typeof CustomEvent,
    NodeType: typeof Node,
    ElementType: typeof Element,
    HTMLElementType: typeof HTMLElement,
    HTMLDivElementType: typeof HTMLDivElement,
    TextType: typeof Text,
    CommentType: typeof Comment,
    DOMParserType: typeof DOMParser
  ) {
    this.config = config;
    this.wnd = wnd;
    this.UIEvent = UIEventType;
    this.Event = EventType;
    this.CustomEvent = CustomEventType;
    this.Node = NodeType;
    this.Element = ElementType;
    this.HTMLElement = HTMLElementType;
    this.HTMLDivElement = HTMLDivElementType;
    this.Text = TextType;
    this.Comment = CommentType;
    this.DOMParser = DOMParserType;
    this.doc = wnd.document;
    this.dom = new HTMLDOM(this.wnd, this.doc, NodeType, ElementType, HTMLElementType, CustomEventType);
    this._container = void 0;
    this._templateCompiler = void 0;
    this._observerLocator = void 0;
    this._lifecycle = void 0;
    this._renderer = void 0;
    this._projectorLocator = void 0;
    this._renderingEngine = void 0;
    this._domParser = void 0;
  }

  public static create(
    config: IRegistry,
    wnd: Window,
    UIEventType: typeof UIEvent,
    EventType: typeof Event,
    CustomEventType: typeof CustomEvent,
    NodeType: typeof Node,
    ElementType: typeof Element,
    HTMLElementType: typeof HTMLElement,
    HTMLDivElementType: typeof HTMLDivElement,
    TextType: typeof Text,
    CommentType: typeof Comment,
    DOMParserType: typeof DOMParser
  ): HTMLTestContext {
    return new HTMLTestContext(
      config,
      wnd,
      UIEventType,
      EventType,
      CustomEventType,
      NodeType,
      ElementType,
      HTMLElementType,
      HTMLDivElementType,
      TextType,
      CommentType,
      DOMParserType
    );
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

function createJSDOMTestContext(): HTMLTestContext {
  const jsdom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);

  return HTMLTestContext.create(
    BasicJSDOMConfiguration,
    jsdom.window,
    jsdom.window.UIEvent,
    jsdom.window.Event,
    jsdom.window.CustomEvent,
    jsdom.window.Node,
    jsdom.window.Element,
    jsdom.window.HTMLElement,
    jsdom.window.HTMLDivElement,
    jsdom.window.Text,
    jsdom.window.Comment,
    jsdom.window.DOMParser
  );
}

function createBrowserTestContext(): HTMLTestContext {
  return HTMLTestContext.create(
    BasicBrowserConfiguration,
    window,
    UIEvent,
    Event,
    CustomEvent,
    Node,
    Element,
    HTMLElement,
    HTMLDivElement,
    Text,
    Comment,
    DOMParser
  );
}

export function initializeJSDOMTestContext(): void {
  TestContext.createHTMLTestContext = createJSDOMTestContext;
  // Just trigger the HTMLDOM to be resolved once so it sets the DOM globals
  TestContext.createHTMLTestContext().dom.createElement('div');
}

export function initializeBrowserTestContext(): void {
  TestContext.createHTMLTestContext = createBrowserTestContext;
  // Just trigger the HTMLDOM to be resolved once so it sets the DOM globals
  TestContext.createHTMLTestContext().dom.createElement('div');
}
