import { IContainer, IResolver } from '@aurelia/kernel';
import { IController } from './lifecycle';
import { IScheduler } from './scheduler';
export interface INode extends Object {
    $au?: Record<string, IController<this>>;
}
export declare const INode: import("@aurelia/kernel").InterfaceSymbol<INode>;
export declare const IRenderLocation: import("@aurelia/kernel").InterfaceSymbol<IRenderLocation<INode>>;
export interface IRenderLocation<T extends INode = INode> extends INode {
    $start?: IRenderLocation<T>;
    $nodes?: INodeSequence<T> | Readonly<{}>;
}
/**
 * Represents a DocumentFragment
 */
export interface INodeSequence<T extends INode = INode> extends INode {
    readonly isMounted: boolean;
    readonly isLinked: boolean;
    readonly next?: INodeSequence<T>;
    /**
     * The nodes of this sequence.
     */
    readonly childNodes: ArrayLike<T>;
    readonly firstChild: T;
    readonly lastChild: T;
    /**
     * Find all instruction targets in this sequence.
     */
    findTargets(): ArrayLike<T>;
    /**
     * Insert this sequence as a sibling before refNode
     */
    insertBefore(refNode: T | IRenderLocation<T>): void;
    /**
     * Append this sequence as a child to parent
     */
    appendTo(parent: T): void;
    /**
     * Remove this sequence from the DOM.
     */
    remove(): void;
    addToLinked(): void;
    unlink(): void;
    link(next: INodeSequence<T> | IRenderLocation<T> | undefined): void;
}
export declare const IDOM: import("@aurelia/kernel").InterfaceSymbol<IDOM<INode>>;
export interface IDOM<T extends INode = INode> {
    addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
    appendChild(parent: T, child: T): void;
    cloneNode<TClone extends T>(node: TClone, deep?: boolean): TClone;
    convertToRenderLocation(node: T): IRenderLocation<T>;
    createDocumentFragment(markupOrNode?: string | T): T;
    createElement(name: string): T;
    createCustomEvent(eventType: string, options?: unknown): unknown;
    dispatchEvent(evt: unknown): void;
    createNodeObserver?(node: T, cb: (...args: unknown[]) => void, init: unknown): unknown;
    createTemplate(markup?: string): T;
    createTextNode(text: string): T;
    insertBefore(nodeToInsert: T, referenceNode: T): void;
    isMarker(node: unknown): node is T;
    isNodeInstance(potentialNode: unknown): potentialNode is T;
    isRenderLocation(node: unknown): node is IRenderLocation<T>;
    makeTarget(node: T): void;
    registerElementResolver(container: IContainer, resolver: IResolver): void;
    remove(node: T): void;
    removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
    setAttribute(node: T, name: string, value: unknown): void;
}
export declare const DOM: IDOM & {
    readonly isInitialized: boolean;
    readonly scheduler: IScheduler;
    initialize(dom: IDOM): void;
    destroy(): void;
};
export declare const NodeSequence: {
    empty: INodeSequence<INode>;
};
export interface INodeSequenceFactory<T extends INode = INode> {
    createNodeSequence(): INodeSequence<T>;
}
//# sourceMappingURL=dom.d.ts.map