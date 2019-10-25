import { IContainer, IRegistry, Constructable } from '@aurelia/kernel';
import { ILifecycle, IObserverLocator, IProjectorLocator, IRenderer, IRenderingEngine, ITemplateCompiler, IScheduler } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
export declare class HTMLTestContext {
    readonly wnd: Window;
    readonly doc: Document;
    readonly dom: HTMLDOM;
    readonly UIEvent: typeof UIEvent;
    readonly Event: typeof Event;
    readonly CustomEvent: typeof CustomEvent;
    readonly Node: typeof Node;
    readonly Element: typeof Element;
    readonly HTMLElement: typeof HTMLElement;
    readonly HTMLDivElement: typeof HTMLDivElement;
    readonly Text: typeof Text;
    readonly Comment: typeof Comment;
    readonly DOMParser: typeof DOMParser;
    private readonly config;
    readonly container: IContainer;
    readonly scheduler: IScheduler;
    readonly templateCompiler: ITemplateCompiler;
    readonly observerLocator: IObserverLocator;
    readonly lifecycle: ILifecycle;
    readonly renderer: IRenderer;
    readonly projectorLocator: IProjectorLocator;
    readonly renderingEngine: IRenderingEngine;
    readonly domParser: HTMLDivElement;
    private _container?;
    private _scheduler?;
    private _templateCompiler?;
    private _observerLocator?;
    private _lifecycle?;
    private _renderer?;
    private _projectorLocator?;
    private _renderingEngine?;
    private _domParser?;
    private readonly Scheduler;
    private constructor();
    static create(config: IRegistry, wnd: Window, Scheduler: Constructable<IScheduler>, UIEventType: typeof UIEvent, EventType: typeof Event, CustomEventType: typeof CustomEvent, NodeType: typeof Node, ElementType: typeof Element, HTMLElementType: typeof HTMLElement, HTMLDivElementType: typeof HTMLDivElement, TextType: typeof Text, CommentType: typeof Comment, DOMParserType: typeof DOMParser, CSSStyleSheetType: typeof CSSStyleSheet, ShadowRootType: typeof ShadowRoot): HTMLTestContext;
    createElementFromMarkup(markup: string): HTMLElement;
    createElement(name: string): HTMLElement;
    createAttribute(name: string, value: string): Attr;
}
export declare const TestContext: {
    createHTMLTestContext(): HTMLTestContext;
};
//# sourceMappingURL=html-test-context.d.ts.map