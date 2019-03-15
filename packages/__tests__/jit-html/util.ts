import {
  DI,
  IContainer,
  IRegistry,
  Profiler,
  Registration
} from '@aurelia/kernel';
import {
  IDOM,
  ILifecycle,
  IObserverLocator,
  IProjectorLocator,
  IRenderer,
  IRenderingEngine,
  ITemplateCompiler
} from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { padLeft } from '../test-lib';
import { padRight } from './unit/util';

export function getVisibleText(au, host) {
  const context = { text: host.textContent };
  $getVisibleText(au.root(), context);
  return context.text;
}

function $getVisibleText(root, context) {
  let current = root.$componentHead;
  while (current) {
    if (current.$projector && current.$projector.shadowRoot) {
      context.text += current.$projector.shadowRoot.textContent;
      $getVisibleText(current, context);
    } else if (current.currentView) { // replaceable, with
      $getVisibleText(current.currentView, context);
    } else if (current.coordinator && current.coordinator.currentView) { // if, else, au-compose
      $getVisibleText(current.coordinator.currentView, context);
    } else if (current.views) { // repeat
      for (const view of current.views) {
        $getVisibleText(view, context);
      }
    }
    current = current.$nextComponent;
  }
}

export function writeProfilerReport(testName: string): void {
  let msg = '\n';
  Profiler.report(function (name, duration, topLevel, total) {
    msg += `[Profiler:${testName}] ${padRight(name, 25)}: ${padLeft(Math.round(duration * 10) / 10, 7)}ms; ${padLeft(topLevel, 7)} measures; ${padLeft(total, 7)} calls; ~${Math.round(duration / total * 100) / 100}ms/call\n`;
  });
  console.log(msg);
}

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
    if (this._container == null) {
      this._container = DI.createContainer(this.config);
      Registration.instance(IDOM, this.dom).register(this._container);
      Registration.instance(HTMLTestContext, this).register(this._container);
    }
    return this._container;
  }
  public get templateCompiler(): ITemplateCompiler {
    if (this._templateCompiler == null) {
      this._templateCompiler = this.container.get(ITemplateCompiler);
    }
    return this._templateCompiler;
  }
  public get observerLocator(): IObserverLocator {
    if (this._observerLocator == null) {
      this._observerLocator = this.container.get(IObserverLocator);
    }
    return this._observerLocator;
  }
  public get lifecycle(): ILifecycle & { flushCount?: number } {
    if (this._lifecycle == null) {
      this._lifecycle = this.container.get(ILifecycle);
    }
    return this._lifecycle;
  }
  public get renderer(): IRenderer {
    if (this._renderer == null) {
      this._renderer = this.container.get(IRenderer);
    }
    return this._renderer;
  }
  public get projectorLocator(): IProjectorLocator {
    if (this._projectorLocator == null) {
      this._projectorLocator = this.container.get(IProjectorLocator);
    }
    return this._projectorLocator;
  }
  public get renderingEngine(): IRenderingEngine {
    if (this._renderingEngine == null) {
      this._renderingEngine = this.container.get(IRenderingEngine);
    }
    return this._renderingEngine;
  }

  private _container: IContainer;
  private _templateCompiler: ITemplateCompiler;
  private _observerLocator: IObserverLocator;
  private _lifecycle: ILifecycle;
  private _renderer: IRenderer;
  private _projectorLocator: IProjectorLocator;
  private _renderingEngine: IRenderingEngine;
  private readonly domParser: HTMLDivElement;

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
    this.domParser = this.doc.createElement('div');
    this.dom = new HTMLDOM(this.wnd, this.doc, NodeType, ElementType, HTMLElementType, CustomEventType);
    this._container = null;
    this._templateCompiler = null;
    this._observerLocator = null;
    this._lifecycle = null;
    this._renderer = null;
    this._projectorLocator = null;
    this._renderingEngine = null;
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
    throw new Error('No createHTMLTestContext function has been provided');
  }
};
