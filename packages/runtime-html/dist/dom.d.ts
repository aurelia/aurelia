import { IContainer, IResolver } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, INode, INodeSequence, IRenderContext, IRenderLocation, ISinglePageApp, ITemplate, ITemplateFactory, TemplateDefinition } from '@aurelia/runtime';
export declare const enum NodeType {
    Element = 1,
    Attr = 2,
    Text = 3,
    CDATASection = 4,
    EntityReference = 5,
    Entity = 6,
    ProcessingInstruction = 7,
    Comment = 8,
    Document = 9,
    DocumentType = 10,
    DocumentFragment = 11,
    Notation = 12
}
export declare class HTMLDOM implements IDOM {
    private readonly doc;
    constructor(doc: Document);
    addEventListener(eventName: string, subscriber: EventListenerOrEventListenerObject, publisher?: Node, options?: boolean | AddEventListenerOptions): void;
    appendChild(parent: Node, child: Node): void;
    cloneNode<T>(node: T, deep?: boolean): T;
    convertToRenderLocation(node: Node): IRenderLocation;
    createDocumentFragment(markupOrNode?: string | Node): DocumentFragment;
    createElement(name: string): HTMLElement;
    createTemplate(markup?: unknown): HTMLTemplateElement;
    createTextNode(text: string): Text;
    insertBefore(nodeToInsert: Node, referenceNode: Node): void;
    isMarker(node: unknown): node is HTMLElement;
    isNodeInstance(potentialNode: unknown): potentialNode is Node;
    isRenderLocation(node: unknown): node is IRenderLocation;
    makeTarget(node: unknown): void;
    registerElementResolver(container: IContainer, resolver: IResolver): void;
    remove(node: Node): void;
    removeEventListener(eventName: string, subscriber: EventListenerOrEventListenerObject, publisher?: Node, options?: boolean | EventListenerOptions): void;
    setAttribute(node: Element, name: string, value: unknown): void;
}
/**
 * A specialized INodeSequence with optimizations for text (interpolation) bindings
 * The contract of this INodeSequence is:
 * - the previous element is an `au-m` node
 * - text is the actual text node
 */
export declare class TextNodeSequence implements INodeSequence {
    dom: HTMLDOM;
    firstChild: Text;
    lastChild: Text;
    childNodes: Text[];
    private targets;
    constructor(dom: HTMLDOM, text: Text);
    findTargets(): ArrayLike<Node>;
    insertBefore(refNode: Node): void;
    appendTo(parent: Node): void;
    remove(): void;
}
export interface NodeSequenceFactory {
    createNodeSequence(): INodeSequence;
}
export declare class NodeSequenceFactory implements NodeSequenceFactory {
    private readonly dom;
    private readonly deepClone;
    private readonly node;
    private readonly Type;
    constructor(dom: IDOM, markupOrNode: string | Node);
}
export interface AuMarker extends INode {
}
export declare class HTMLDOMInitializer implements IDOMInitializer {
    static inject: unknown[];
    private readonly container;
    constructor(container: IContainer);
    /**
     * Either create a new HTML `DOM` backed by the supplied `document` or uses the supplied `DOM` directly.
     *
     * If no argument is provided, uses the default global `document` variable.
     * (this will throw an error in non-browser environments).
     */
    initialize(config?: ISinglePageApp<Node>): IDOM;
}
export declare class HTMLTemplateFactory implements ITemplateFactory {
    static inject: unknown[];
    private readonly dom;
    constructor(dom: IDOM);
    create(parentRenderContext: IRenderContext, definition: TemplateDefinition): ITemplate;
}
//# sourceMappingURL=dom.d.ts.map