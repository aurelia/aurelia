import { IContainer, IRegistration, IRegistry } from '@aurelia/kernel';
import { IObserverLocator, ITemplateCompiler, IPlatform } from '@aurelia/runtime-html';
export declare class TestContext {
    static readonly ambient: TestContext;
    get wnd(): Window & typeof globalThis;
    get doc(): Document;
    get userAgent(): string;
    get UIEvent(): {
        new (type: string, eventInitDict?: UIEventInit | undefined): UIEvent;
        prototype: UIEvent;
    };
    get Event(): {
        new (type: string, eventInitDict?: EventInit | undefined): Event;
        prototype: Event;
        readonly AT_TARGET: number;
        readonly BUBBLING_PHASE: number;
        readonly CAPTURING_PHASE: number;
        readonly NONE: number;
    };
    get CustomEvent(): {
        new <T>(typeArg: string, eventInitDict?: CustomEventInit<T> | undefined): CustomEvent<T>;
        prototype: CustomEvent<any>;
    };
    get Node(): {
        new (): Node;
        prototype: Node;
        readonly ATTRIBUTE_NODE: number;
        readonly CDATA_SECTION_NODE: number;
        readonly COMMENT_NODE: number;
        readonly DOCUMENT_FRAGMENT_NODE: number;
        readonly DOCUMENT_NODE: number;
        readonly DOCUMENT_POSITION_CONTAINED_BY: number;
        readonly DOCUMENT_POSITION_CONTAINS: number;
        readonly DOCUMENT_POSITION_DISCONNECTED: number;
        readonly DOCUMENT_POSITION_FOLLOWING: number;
        readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
        readonly DOCUMENT_POSITION_PRECEDING: number;
        readonly DOCUMENT_TYPE_NODE: number;
        readonly ELEMENT_NODE: number;
        readonly ENTITY_NODE: number;
        readonly ENTITY_REFERENCE_NODE: number;
        readonly NOTATION_NODE: number;
        readonly PROCESSING_INSTRUCTION_NODE: number;
        readonly TEXT_NODE: number;
    };
    get Element(): {
        new (): Element;
        prototype: Element;
    };
    get HTMLElement(): {
        new (): HTMLElement;
        prototype: HTMLElement;
    };
    get HTMLDivElement(): {
        new (): HTMLDivElement;
        prototype: HTMLDivElement;
    };
    get Text(): {
        new (data?: string | undefined): Text;
        prototype: Text;
    };
    get Comment(): {
        new (data?: string | undefined): Comment;
        prototype: Comment;
    };
    get DOMParser(): {
        new (): DOMParser;
        prototype: DOMParser;
    };
    private _container;
    get container(): IContainer;
    private _platform;
    get platform(): IPlatform;
    private _templateCompiler;
    get templateCompiler(): ITemplateCompiler;
    private oL;
    get observerLocator(): IObserverLocator;
    private _domParser;
    get domParser(): HTMLDivElement;
    private constructor();
    static create(): TestContext;
    createElementFromMarkup(markup: string): HTMLElement;
    createElement(name: string): HTMLElement;
    createAttribute(name: string, value: string): Attr;
    type(host: HTMLElement, selector: string, value: string): void;
}
export declare let PLATFORM: IPlatform;
export declare let PLATFORMRegistration: IRegistration<IPlatform>;
export declare function setPlatform(p: IPlatform): void;
export declare function createContainer(...registries: IRegistry[]): IContainer;
//# sourceMappingURL=test-context.d.ts.map