import { IContainer, IResolver } from '@aurelia/kernel';
import { IAddEventListenerOptions, IComment, IDocument, IDocumentFragment, IEventListenerOptions, IEventListenerOrEventListenerObject, IHTMLElement, IHTMLTemplateElement, IMutationCallback, IMutationObserver, IMutationObserverInit, INode, INodeSequence, IRenderLocation, IShadowRootInit, IText } from './dom.interfaces';
export declare const IDOM: import("@aurelia/kernel").InterfaceSymbol<IDOM>;
export interface IDOM {
    addClass(node: unknown, className: string): void;
    addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
    appendChild(parent: unknown, child: unknown): void;
    attachShadow(host: unknown, options: unknown): IDocumentFragment;
    cloneNode<T>(node: T, deep?: boolean): T;
    convertToRenderLocation(node: unknown): IRenderLocation;
    createComment(text: string): IComment;
    createDocumentFragment(markupOrNode?: unknown): IDocumentFragment;
    createElement(name: string): IHTMLElement;
    createNodeObserver(target: unknown, callback: unknown, options: unknown): IMutationObserver;
    createTemplate(markup?: unknown): IHTMLTemplateElement;
    createTextNode(text: string): IText;
    getAttribute(node: unknown, name: string): string;
    hasClass(node: unknown, className: string): boolean;
    hasParent(node: unknown): boolean;
    insertBefore(nodeToInsert: unknown, referenceNode: unknown): void;
    isMarker(node: unknown): node is IHTMLElement;
    isNodeInstance(potentialNode: unknown): potentialNode is INode;
    isRenderLocation(node: unknown): node is IRenderLocation;
    registerElementResolver(container: IContainer, resolver: IResolver): void;
    remove(node: unknown): void;
    removeAttribute(node: unknown, name: string): void;
    removeClass(node: unknown, className: string): void;
    removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
    replaceNode(newChild: unknown, oldChild: unknown): void;
    setAttribute(node: unknown, name: string, value: string): void;
}
export declare class DOM implements IDOM {
    private readonly doc;
    constructor(doc: IDocument);
    addClass(node: IHTMLElement, className: string): void;
    addEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject, publisher?: INode, options?: boolean | IAddEventListenerOptions): void;
    appendChild(parent: INode, child: INode): void;
    attachShadow(host: IHTMLElement, options: IShadowRootInit): IDocumentFragment;
    cloneNode<T>(node: T, deep?: boolean): T;
    convertToRenderLocation(node: INode): IRenderLocation;
    createComment(text: string): IComment;
    createDocumentFragment(markupOrNode?: string | INode): IDocumentFragment;
    createElement(name: string): IHTMLElement;
    createNodeObserver(target: INode, callback: IMutationCallback, options: IMutationObserverInit): IMutationObserver;
    createTemplate(markup?: unknown): IHTMLTemplateElement;
    createTextNode(text: string): IText;
    getAttribute(node: IHTMLElement, name: string): string;
    hasClass(node: IHTMLElement, className: string): boolean;
    hasParent(node: INode): boolean;
    insertBefore(nodeToInsert: INode, referenceNode: INode): void;
    isMarker(node: unknown): node is IHTMLElement;
    isNodeInstance(potentialNode: unknown): potentialNode is INode;
    isRenderLocation(node: unknown): node is IRenderLocation;
    registerElementResolver(container: IContainer, resolver: IResolver): void;
    remove(node: INode): void;
    removeAttribute(node: IHTMLElement, name: string): void;
    removeClass(node: IHTMLElement, className: string): void;
    removeEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject, publisher?: INode, options?: boolean | IEventListenerOptions): void;
    replaceNode(newChild: INode, oldChild: INode): void;
    setAttribute(node: IHTMLElement, name: string, value: string): void;
}
export declare const NodeSequence: {
    empty: INodeSequence;
};
/**
 * An specialized INodeSequence with optimizations for text (interpolation) bindings
 * The contract of this INodeSequence is:
 * - the previous element is an `au-m` node
 * - text is the actual text node
 */
export declare class TextNodeSequence implements INodeSequence {
    dom: IDOM;
    firstChild: IText;
    lastChild: IText;
    childNodes: IText[];
    private targets;
    constructor(dom: IDOM, text: IText);
    findTargets(): ArrayLike<INode>;
    insertBefore(refNode: INode): void;
    appendTo(parent: INode): void;
    remove(): void;
}
export interface INodeSequenceFactory {
    createNodeSequence(): INodeSequence;
}
export declare class NodeSequenceFactory implements INodeSequenceFactory {
    private readonly dom;
    private readonly deepClone;
    private readonly node;
    private readonly Type;
    constructor(dom: IDOM, markupOrNode: string | INode);
    createNodeSequence(): INodeSequence;
}
export interface AuMarker extends INode {
}
//# sourceMappingURL=dom.d.ts.map