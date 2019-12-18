import { IContainer, IResolver } from '@aurelia/kernel';
import { IDOM, INode, INodeSequence, IRenderLocation } from '@aurelia/runtime';
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
/**
 * IDOM implementation for Html.
 */
export declare class HTMLDOM implements IDOM {
    readonly window: Window;
    readonly document: Document;
    readonly Node: typeof Node;
    readonly Element: typeof Element;
    readonly HTMLElement: typeof HTMLElement;
    readonly CustomEvent: typeof CustomEvent;
    readonly CSSStyleSheet: typeof CSSStyleSheet;
    readonly ShadowRoot: typeof ShadowRoot;
    private readonly emptyNodes;
    constructor(window: Window, document: Document, TNode: typeof Node, TElement: typeof Element, THTMLElement: typeof HTMLElement, TCustomEvent: typeof CustomEvent, TCSSStyleSheet: typeof CSSStyleSheet, TShadowRoot: typeof ShadowRoot);
    static register(container: IContainer): IResolver<IDOM>;
    addEventListener(eventName: string, subscriber: EventListenerOrEventListenerObject, publisher?: Node, options?: boolean | AddEventListenerOptions): void;
    appendChild(parent: Node, child: Node): void;
    cloneNode<T>(node: T, deep?: boolean): T;
    convertToRenderLocation(node: Node): IRenderLocation;
    createDocumentFragment(markupOrNode?: string | Node): DocumentFragment;
    createNodeSequence(fragment: DocumentFragment | null): FragmentNodeSequence;
    createElement(name: string): HTMLElement;
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
    createCustomEvent<T = any>(eventType: string, options?: CustomEventInit<T>): CustomEvent<T>;
    dispatchEvent(evt: Event): void;
    createNodeObserver(node: Node, cb: MutationCallback, init: MutationObserverInit): MutationObserver;
    createTemplate(markup?: unknown): HTMLTemplateElement;
    createTextNode(text: string): Text;
    /**
     * Returns the effective parentNode according to Aurelia's component hierarchy.
     *
     * Used by Aurelia to find the closest parent controller relative to a node.
     *
     * This method supports 3 additional scenarios that `node.parentNode` does not support:
     * - Containerless elements. The parentNode in this case is a comment precending the element under specific conditions, rather than a node wrapping the element.
     * - ShadowDOM. If a `ShadowRoot` is encountered, this method retrieves the associated controller via the metadata api to locate the original host.
     * - Portals. If the provided node was moved to a different location in the DOM by a `portal` attribute, then the original parent of the node will be returned.
     *
     * @param node - The node to get the parent for.
     * @returns Either the closest parent node, the closest `IRenderLocation` (comment node that is the containerless host), original portal host, or `null` if this is either the absolute document root or a disconnected node.
     */
    getEffectiveParentNode(node: Node): Node | null;
    /**
     * Set the effective parentNode, overriding the DOM-based structure that `getEffectiveParentNode` otherwise defaults to.
     *
     * Used by Aurelia's `portal` template controller to retain the linkage between the portaled nodes (after they are moved to the portal target) and the original `portal` host.
     *
     * @param nodeSequence - The node sequence whose children that, when `getEffectiveParentNode` is called on, return the supplied `parentNode`.
     * @param parentNode - The node to return when `getEffectiveParentNode` is called on any child of the supplied `nodeSequence`.
     */
    setEffectiveParentNode(nodeSequence: INodeSequence, parentNode: Node): void;
    /**
     * Set the effective parentNode, overriding the DOM-based structure that `getEffectiveParentNode` otherwise defaults to.
     *
     * Used by Aurelia's `portal` template controller to retain the linkage between the portaled nodes (after they are moved to the portal target) and the original `portal` host.
     *
     * @param childNode - The node that, when `getEffectiveParentNode` is called on, returns the supplied `parentNode`.
     * @param parentNode - The node to return when `getEffectiveParentNode` is called on the supplied `childNode`.
     */
    setEffectiveParentNode(childNode: Node, parentNode: Node): void;
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
declare const $DOM: HTMLDOM;
export { $DOM as DOM };
export interface AuMarker extends INode {
}
//# sourceMappingURL=dom.d.ts.map