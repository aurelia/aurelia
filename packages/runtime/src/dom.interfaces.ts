import { DI, PLATFORM } from '@aurelia/kernel';

export const enum NodeType {
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

export interface IEventListener {
  // tslint:disable-next-line:callable-types
  (evt: IEvent): void;
}

export interface IEventListenerObject {
  handleEvent(evt: IEvent): void;
}

export interface IEventListenerOptions {
  capture?: boolean;
}

export interface IAddEventListenerOptions extends IEventListenerOptions {
  once?: boolean;
  passive?: boolean;
}

export type IEventListenerOrEventListenerObject = IEventListener | IEventListenerObject;

export interface IEvent {
  readonly target: IEventTarget | null;
  readonly type: string;
  composedPath(): IEventTarget[];
  preventDefault(): void;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
}

export interface IEventTarget {
  addEventListener(type: string, listener: IEventListenerOrEventListenerObject | null, options?: boolean | IAddEventListenerOptions): void;
  dispatchEvent(event: IEvent): boolean;
  removeEventListener(type: string, callback: IEventListenerOrEventListenerObject | null, options?: IEventListenerOptions | boolean): void;
}

export interface IGetRootNodeOptions {
  composed?: boolean;
}

export interface IParentNode {
  readonly firstElementChild: IElement | null;
  readonly lastElementChild: IElement | null;
  querySelector<E extends IElement = IElement>(selectors: string): E | null;
  querySelectorAll<E extends IElement = IElement>(selectors: string): ArrayLike<E>;
}

export interface IChildNode extends INode {
  remove(): void;
}

export interface INodeLike {
  readonly childNodes: ArrayLike<INode>;
  readonly firstChild: INode | null;
  readonly lastChild: INode | null;
}

export interface INode extends INodeLike, IEventTarget {
  readonly childNodes: ArrayLike<IChildNode>;
  readonly firstChild: IChildNode | null;
  readonly lastChild: IChildNode | null;
  readonly nextSibling: INode | null;
  readonly nodeName: string;
  readonly nodeType: NodeType;
  readonly parentNode: INode & IParentNode | null;
  readonly previousSibling: INode | null;
  textContent: string | null;
  appendChild<T extends INode>(newChild: T): T;
  cloneNode(deep?: boolean): INode;
  /**
   * Returns node's shadow-including root.
   */
  getRootNode(options?: IGetRootNodeOptions): INode;
  insertBefore<T extends INode>(newChild: T, refChild: INode | null): T;
  removeChild<T extends INode>(oldChild: T): T;
  replaceChild<T extends INode>(newChild: INode, oldChild: T): T;
}

export interface IHTMLSlotElement extends IHTMLElement {
  readonly nodeName: 'SLOT';
  name: string;
}

export interface ISlotable {
  readonly assignedSlot: IHTMLSlotElement | null;
}

export interface INamedNodeMap {
  readonly length: number;
  item(index: number): IAttr | null;
  [index: number]: IAttr;
}

export interface IDOMTokenList {
  readonly length: number;
  value: string;
  add(...tokens: string[]): void;
  contains(token: string): boolean;
  item(index: number): string | null;
  remove(...tokens: string[]): void;
  replace(oldToken: string, newToken: string): void;
  // tslint:disable-next-line:no-any
  forEach(callbackfn: (value: string, key: number, parent: IDOMTokenList) => void, thisArg?: any): void;
  [index: number]: string;
}

export interface IDocumentOrShadowRoot {
  /**
   * Retrieves a collection of styleSheet objects representing the style sheets that correspond to each instance of a link or style object in the document.
   */
  readonly styleSheets: IStyleSheetList;
}

export interface IStyleSheet {
  readonly href: string | null;
  readonly ownerNode: INode;
  readonly parentStyleSheet: IStyleSheet | null;
}

export interface IStyleSheetList {
  readonly length: number;
  item(index: number): IStyleSheet | null;
  [index: number]: IStyleSheet;
}

export type IShadowRootMode = 'open' | 'closed';

export interface IShadowRoot extends IDocumentOrShadowRoot, IDocumentFragment {
  readonly host: IElement;
  innerHTML: string;
  readonly mode: IShadowRootMode;
}

export interface IShadowRootInit {
  delegatesFocus?: boolean;
  mode: 'open' | 'closed';
}

export interface IAttr extends INode {
  readonly nodeType: NodeType.Attr;
  readonly name: string;
  value: string;
}

export interface ICSSStyleDeclaration {
  cssText: string;
  readonly length: number;
  getPropertyPriority(propertyName: string): string;
  getPropertyValue(propertyName: string): string;
  item(index: number): string;
  removeProperty(propertyName: string): string;
  setProperty(propertyName: string, value: string | null, priority?: string | null): void;
  [index: number]: string;
}

export interface IElementCSSInlineStyle {
  readonly style: ICSSStyleDeclaration;
}

export type IInsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

export interface IElement extends INode, IParentNode, IChildNode, ISlotable {
  readonly nodeType: NodeType.Element;
  readonly assignedSlot: IHTMLSlotElement | null;
  readonly attributes: INamedNodeMap;
  readonly classList: IDOMTokenList;
  className: string;
  innerHTML: string;
  outerHTML: string;
  /**
   * Returns element's shadow root, if any, and if shadow root's mode is "open", and null otherwise.
   */
  readonly shadowRoot: IShadowRoot | null;
  /**
   * Returns the value of element's slot content attribute. Can be set to change it.
   */
  slot: string;
  /**
   * Returns the HTML-uppercased qualified name.
   */
  readonly tagName: string;
  attachShadow(shadowRootInitDict: IShadowRootInit): IShadowRoot;
  getAttribute(qualifiedName: string): string | null;
  getAttributeNS(namespace: string | null, localName: string): string | null;
  /**
   * Returns the qualified names of all element's attributes. Can contain duplicates.
   */
  getAttributeNames(): string[];
  getAttributeNode(name: string): IAttr | null;
  hasAttribute(qualifiedName: string): boolean;
  hasAttributes(): boolean;
  insertAdjacentElement(position: IInsertPosition, insertedElement: IElement): IElement | null;
  removeAttribute(qualifiedName: string): void;
  removeAttributeNode(attr: IAttr): IAttr;
  setAttribute(qualifiedName: string, value: string): void;
  setAttributeNS(namespace: string | null, qualifiedName: string, value: string): void;
  setAttributeNode(attr: IAttr): IAttr | null;

  addEventListener(type: string, listener: IEventListenerOrEventListenerObject, options?: boolean | IAddEventListenerOptions): void;
  removeEventListener(type: string, listener: IEventListenerOrEventListenerObject, options?: boolean | IEventListenerOptions): void;
}

export interface IHTMLElement extends IElement, IElementCSSInlineStyle {}
export interface ISVGElement extends IElement, IElementCSSInlineStyle {}

export interface IHTMLInputElement extends IHTMLElement {
  readonly nodeName: 'INPUT';
  value: string;
  checked: boolean;
  type: string;
}

export interface IHTMLSelectElement extends IHTMLElement {
  readonly nodeName: 'SELECT';
  multiple: boolean;
  value: string;
  readonly options: ArrayLike<IHTMLOptionElement>;
}

export interface IHTMLOptionElement extends IHTMLElement {
  readonly nodeName: 'OPTION';
  selected: boolean;
  value: string;
}

export interface IDocumentFragment extends INode, IParentNode {
  readonly nodeType: NodeType.DocumentFragment;
  readonly nodeName: '#document-fragment';
}

export interface IHTMLTemplateElement extends IHTMLElement {
  readonly content: IDocumentFragment;
  readonly nodeName: 'TEMPLATE';
}

export interface IText extends INode, IChildNode, ISlotable {
  readonly nodeType: NodeType.Text;
  readonly nodeName: '#text';
  readonly wholeText: string;
}

export interface IComment extends INode, IChildNode {
  readonly nodeType: NodeType.Comment;
  readonly nodeName: '#comment';
}

export interface IMutationObserverInit {
  attributeFilter?: string[];
  attributeOldValue?: boolean;
  attributes?: boolean;
  characterData?: boolean;
  characterDataOldValue?: boolean;
  childList?: boolean;
  subtree?: boolean;
}

export type IMutationRecordType = 'attributes' | 'characterData' | 'childList';

interface IMutationRecord {
  readonly addedNodes: ArrayLike<INode>;
  readonly attributeName: string | null;
  readonly attributeNamespace: string | null;
  readonly nextSibling: INode | null;
  readonly oldValue: string | null;
  readonly previousSibling: INode | null;
  readonly removedNodes: ArrayLike<INode>;
  readonly target: INode;
  readonly type: IMutationRecordType;
}

export interface IMutationCallback {
  // tslint:disable-next-line:callable-types
  (mutations: IMutationRecord[], observer: IMutationObserver): void;
}

export interface IMutationObserver {
  disconnect(): void;
  observe(target: INode, options?: IMutationObserverInit): void;
}

export interface IDocument extends INode, IDocumentOrShadowRoot, IParentNode {
  createComment(data: string): IComment;
  createDocumentFragment(): IDocumentFragment;
  createElement<T extends IHTMLElement, TTag extends string>(tagName: TTag): TTag extends 'template' ? IHTMLTemplateElement : T;
  createTextNode(data: string): IText;
}

// --------------------------------------------------------------------------
// ------------------- Aurelia-specific stuff starts here -------------------
// --------------------------------------------------------------------------

export interface IManagedEvent extends IEvent {
  propagationStopped?: boolean;
  // legacy
  path?: IEventTarget[];
  standardStopPropagation?(): void;
  // old composedPath
  deepPath?(): IEventTarget[];
}

export const INode = DI.createInterface<INode>().noDefault();

export const IRenderLocation = DI.createInterface<IRenderLocation>().noDefault();
export interface IRenderLocation extends INode {
  $start?: IRenderLocation;
  $nodes?: INodeSequence | Readonly<{}>;
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
