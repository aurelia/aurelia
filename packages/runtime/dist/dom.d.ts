import { IContainer, IResolver } from '@aurelia/kernel';
import { IAddEventListenerOptions, IChildNode, IComment, IDocumentFragment, IElement, IEventListenerOptions, IEventListenerOrEventListenerObject, IEventTarget, IHTMLElement, IHTMLTemplateElement, IMutationCallback, IMutationObserver, IMutationObserverInit, INode, INodeSequence, IRenderLocation, IShadowRootInit, IText } from './dom.interfaces';
export declare const DOM: {
    createDocumentFragment(markupOrNode?: unknown): IDocumentFragment;
    createTemplate(markup?: unknown): IHTMLTemplateElement;
    addClass(node: IElement, className: string): void;
    addEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject, publisher?: IEventTarget, options?: boolean | IAddEventListenerOptions): void;
    appendChild(parent: INode, child: INode): void;
    attachShadow(host: IElement, options: IShadowRootInit): IDocumentFragment;
    cloneNode<T extends INode = INode>(node: T, deep?: boolean): T;
    convertToRenderLocation(node: INode): IRenderLocation;
    createComment(text: string): IComment;
    createElement: <T extends IHTMLElement, TTag extends string>(tagName: TTag) => TTag extends "template" ? IHTMLTemplateElement : TTag extends "slot" ? import("./dom.interfaces").IHTMLSlotElement : T;
    createNodeObserver(target: INode, callback: IMutationCallback, options: IMutationObserverInit): IMutationObserver;
    createTextNode(text: string): IText;
    getAttribute(node: IElement, name: string): string;
    hasClass(node: IElement, className: string): boolean;
    insertBefore(nodeToInsert: INode, referenceNode: INode): void;
    isMarker(node: INode): node is IElement;
    isCommentNodeType(node: INode): node is IComment;
    isDocumentFragmentType(node: INode): node is IDocumentFragment;
    isElementNodeType(node: INode): node is IElement;
    isNodeInstance(potentialNode: unknown): potentialNode is INode;
    isTextNodeType(node: INode): node is IText;
    migrateChildNodes(currentParent: INode, newParent: INode): void;
    registerElementResolver(container: IContainer, resolver: IResolver<any>): void;
    remove(node: INode | IChildNode): void;
    removeAttribute(node: IElement, name: string): void;
    removeClass(node: IElement, className: string): void;
    removeEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject, publisher?: IEventTarget, options?: boolean | IEventListenerOptions): void;
    replaceNode(newChild: INode, oldChild: INode): void;
    setAttribute(node: IElement, name: string, value: string): void;
};
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
    firstChild: IText;
    lastChild: IText;
    childNodes: IText[];
    private targets;
    constructor(text: IText);
    findTargets(): ArrayLike<INode>;
    insertBefore(refNode: INode): void;
    appendTo(parent: INode): void;
    remove(): void;
}
export interface INodeSequenceFactory {
    createNodeSequence(): INodeSequence;
}
export declare class NodeSequenceFactory {
    private readonly deepClone;
    private readonly node;
    private readonly Type;
    constructor(fragment: IDocumentFragment);
    static createFor(markupOrNode: unknown): NodeSequenceFactory;
    createNodeSequence(): INodeSequence;
}
export interface AuMarker extends INode {
}
//# sourceMappingURL=dom.d.ts.map