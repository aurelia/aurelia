import { IContainer, IResolver } from '@aurelia/kernel';
import { ICustomElement } from '.';
export interface INodeLike {
    readonly firstChild: INode | null;
    readonly lastChild: INode | null;
    readonly childNodes: ArrayLike<INode>;
}
export interface INode extends INodeLike {
    readonly parentNode: INode | null;
    readonly nextSibling: INode | null;
    readonly previousSibling: INode | null;
    readonly content?: INode;
}
export interface ICustomElementHost extends INode {
    $customElement?: ICustomElement;
}
export declare const INode: import("@aurelia/kernel/dist/di").InterfaceSymbol<INode>;
export interface IRenderLocation extends ICustomElementHost {
}
export declare const IRenderLocation: import("@aurelia/kernel/dist/di").InterfaceSymbol<IRenderLocation>;
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
    createNodeSequenceFactory(markupOrNode: string | INode): () => INodeSequence;
    createElement(name: string): INode;
    createText(text: string): INode;
    createNodeObserver(target: INode, callback: MutationCallback, options: MutationObserverInit): MutationObserver;
    attachShadow(host: INode, options: ShadowRootInit): INode;
    createTemplate(): INode;
    createFragment(): INode;
    cloneNode(node: INode, deep?: boolean): INode;
    migrateChildNodes(currentParent: INode, newParent: INode): void;
    isNodeInstance(potentialNode: any): potentialNode is INode;
    isElementNodeType(node: INode): boolean;
    isTextNodeType(node: INode): boolean;
    remove(node: INodeLike): void;
    replaceNode(newChild: INode, oldChild: INode): void;
    appendChild(parent: INode, child: INode): void;
    insertBefore(nodeToInsert: INode, referenceNode: INode): void;
    getAttribute(node: INode, name: string): any;
    setAttribute(node: INode, name: string, value: any): void;
    removeAttribute(node: INode, name: string): void;
    hasClass(node: INode, className: string): boolean;
    addClass(node: INode, className: string): void;
    removeClass(node: INode, className: string): void;
    addEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any): void;
    removeEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any): void;
    isAllWhitespace(node: INode): boolean;
    treatAsNonWhitespace(node: INode): void;
    convertToRenderLocation(node: INode): IRenderLocation;
    registerElementResolver(container: IContainer, resolver: IResolver<any>): void;
};
export declare const NodeSequence: {
    empty: INodeSequence;
};
/**
 * An specialized INodeSequence with optimizations for text (interpolation) bindings
 * The contract of this INodeSequence is:
 * - the previous element is an `au-marker` node
 * - text is the actual text node
 */
export declare class TextNodeSequence implements INodeSequence {
    firstChild: Text;
    lastChild: Text;
    childNodes: Text[];
    private targets;
    constructor(text: Text);
    findTargets(): ArrayLike<INode>;
    insertBefore(refNode: Node): void;
    appendTo(parent: Node): void;
    remove(): void;
}
//# sourceMappingURL=dom.d.ts.map