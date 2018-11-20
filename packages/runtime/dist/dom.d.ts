import { IContainer, IResolver, PLATFORM } from '@aurelia/kernel';
export declare const ELEMENT_NODE = 1;
export declare const ATTRIBUTE_NODE = 2;
export declare const TEXT_NODE = 3;
export declare const COMMENT_NODE = 8;
export declare const DOCUMENT_FRAGMENT_NODE = 11;
export interface INodeLike {
    readonly firstChild: INode | null;
    readonly lastChild: INode | null;
    readonly childNodes: ArrayLike<INode>;
}
export declare const INode: import("@aurelia/kernel/dist/di").InterfaceSymbol<INode>;
export interface INode extends INodeLike {
    textContent: string;
    readonly parentNode: INode | null;
    readonly nextSibling: INode | null;
    readonly previousSibling: INode | null;
    readonly nodeName: string;
    readonly nodeType: number;
}
export interface IRemovableNode extends INode {
    remove(): void;
}
export declare const IEncapsulationSource: import("@aurelia/kernel/dist/di").InterfaceSymbol<IEncapsulationSource>;
export interface IEncapsulationSource extends INode {
}
export interface IAttr extends Partial<INode> {
    readonly name: string;
    value: string;
}
export interface IElement extends INode {
    readonly content?: IDocumentFragment;
}
export interface IStyleDeclaration {
    cssText: string;
    setProperty(propertyName: string, value: string, priority?: string): void;
    removeProperty(propertyName: string): void;
}
export interface IHTMLElement extends IElement {
    readonly style: IStyleDeclaration;
    setAttributeNS(namespace: string, qualifiedName: string, value: string): void;
    getAttributeNS(namespace: string, qualifiedName: string): string;
}
export interface IInputElement extends IElement {
    readonly type: string;
    value: string;
    checked: boolean;
}
export interface IText extends INode {
    readonly nodeName: '#text';
    readonly nodeType: typeof TEXT_NODE;
}
export interface IComment extends INode {
    readonly nodeName: '#comment';
    readonly nodeType: typeof COMMENT_NODE;
}
export interface IDocumentFragment extends INode {
    readonly nodeName: '#document-fragment';
    readonly nodeType: typeof DOCUMENT_FRAGMENT_NODE;
}
export declare const IRenderLocation: import("@aurelia/kernel/dist/di").InterfaceSymbol<IRenderLocation>;
export interface IRenderLocation extends INode {
    $start?: IRenderLocation;
    $nodes?: INodeSequence | typeof PLATFORM['emptyObject'];
}
/**
 * Represents a DocumentFragment
 */
export interface INodeSequence extends INodeLike {
    /**
     * The nodes of this sequence.
     */
    childNodes: ReadonlyArray<INode>;
    /**
     * Find all instruction targets in this sequence.
     */
    findTargets(): ArrayLike<INode> | ReadonlyArray<INode>;
    /**
     * Insert this sequence as a sibling before refNode
     */
    insertBefore(refNode: INode): void;
    /**
     * Append this sequence as a child to parent
     */
    appendTo(parent: INode): void;
    /**
     * Remove this sequence from its parent.
     */
    remove(): void;
}
export interface INodeObserver {
    disconnect(): void;
}
export declare const DOM: {
    createDocumentFragment(markupOrNode?: string | IElement): IDocumentFragment;
    createTemplate(markup?: string): IElement;
    addClass(node: INode, className: string): void;
    addEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any): void;
    appendChild(parent: INode, child: INode): void;
    attachShadow(host: IElement, options: ShadowRootInit): IDocumentFragment;
    cloneNode<T extends INode = INode>(node: T, deep?: boolean): T;
    convertToRenderLocation(node: INode): IRenderLocation;
    createComment(text: string): IComment;
    createElement(name: string): IElement;
    createNodeObserver(target: INode, callback: MutationCallback, options: MutationObserverInit): MutationObserver;
    createTextNode(text: string): IText;
    getAttribute(node: INode, name: string): any;
    hasClass(node: INode, className: string): boolean;
    insertBefore(nodeToInsert: INode, referenceNode: INode): void;
    isAllWhitespace(node: INode): boolean;
    isCommentNodeType(node: INode): node is IComment;
    isDocumentFragmentType(node: INode): node is IDocumentFragment;
    isElementNodeType(node: INode): node is IElement;
    isNodeInstance(potentialNode: any): potentialNode is INode;
    isTextNodeType(node: INode): node is IText;
    migrateChildNodes(currentParent: INode, newParent: INode): void;
    registerElementResolver(container: IContainer, resolver: IResolver<any>): void;
    remove(node: INodeLike): void;
    removeAttribute(node: INode, name: string): void;
    removeClass(node: INode, className: string): void;
    removeEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any): void;
    replaceNode(newChild: INode, oldChild: INode): void;
    setAttribute(node: INode, name: string, value: any): void;
    treatAsNonWhitespace(node: INode): void;
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
    static createFor(markupOrNode: string | INode): NodeSequenceFactory;
    createNodeSequence(): INodeSequence;
}
//# sourceMappingURL=dom.d.ts.map