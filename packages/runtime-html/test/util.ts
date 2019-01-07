import { IContainer, Registration } from '@aurelia/kernel';
import {
  IDOM,
  ILifecycle,
  IObserverLocator,
  IProjectorLocator,
  IRenderer,
  IRenderingEngine,
  IScope,
  OverrideContext,
  Scope,
  State
} from '@aurelia/runtime';
import { spy } from 'sinon';
import {
  _,
  eachCartesianJoin,
  eachCartesianJoinFactory,
  ensureNotCalled,
  getAllPropertyDescriptors,
  htmlStringify,
  jsonStringify,
  massReset,
  massRestore,
  massSpy,
  massStub,
  padRight,
  stringify,
  verifyEqual
} from '../../../scripts/test-lib';
import {
  BasicConfiguration,
  HTMLDOM
} from '../src/index';

/**
 * Object describing a test fixture
 *
 * (currently specific to repeater)
 */
export interface IRepeaterFixture {
  elName: string;
  colName: string;
  itemName: string;
  propName?: string;
}

export const checkDelay = 20;

export function createScopeForTest(bindingContext: any = {}, parentBindingContext?: any): IScope {
  if (parentBindingContext) {
    return Scope.create(bindingContext, OverrideContext.create(bindingContext, OverrideContext.create(parentBindingContext, null)));
  }
  return Scope.create(bindingContext, OverrideContext.create(bindingContext, null));
}

export class SpySubscriber {
  public handleChange: ReturnType<typeof spy>;
  public handleBatchedChange: ReturnType<typeof spy>;
  constructor() {
    this.handleChange = spy();
    this.handleBatchedChange = spy();
  }
  public resetHistory() {
    this.handleChange.resetHistory();
    this.handleBatchedChange.resetHistory();
  }
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// These attributes are valid on every HTML element and we want to rule out any potential quirk by ensuring
// the DataAttributeObserver functions correctly for each of them
export const globalAttributeNames = [
  'xml:lang',
  'xml:base',

  'accesskey',
  'autocapitalize',
  'aria-foo',
  'class',
  'contenteditable',
  'contextmenu',
  'data-foo',
  'dir',
  'draggable',
  'dropzone',
  'hidden',
  'id',
  'is',
  'itemid',
  'itemprop',
  'itemref',
  'itemscope',
  'itemtype',
  'lang',
  'slot',
  'spellcheck',
  'style',
  'tabindex',
  'title',
  'translate',

  'onabort',
  'onautocomplete',
  'onautocompleteerror',
  'onblur',
  'oncancel',
  'oncanplay',
  'oncanplaythrough',
  'onchange',
  'onclick',
  'onclose',
  'oncontextmenu',
  'oncuechange',
  'ondblclick',
  'ondrag',
  'ondragend',
  'ondragenter',
  'ondragexit',
  'ondragleave',
  'ondragover',
  'ondragstart',
  'ondrop',
  'ondurationchange',
  'onemptied',
  'onended',
  'onerror',
  'onfocus',
  'oninput',
  'oninvalid',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onload',
  'onloadeddata',
  'onloadedmetadata',
  'onloadstart',
  'onmousedown',
  'onmouseenter',
  'onmouseleave',
  'onmousemove',
  'onmouseout',
  'onmouseover',
  'onmouseup',
  'onmousewheel',
  'onpause',
  'onplay',
  'onplaying',
  'onprogress',
  'onratechange',
  'onreset',
  'onresize',
  'onscroll',
  'onseeked',
  'onseeking',
  'onselect',
  'onshow',
  'onsort',
  'onstalled',
  'onsubmit',
  'onsuspend',
  'ontimeupdate',
  'ontoggle',
  'onvolumechange',
  'onwaiting'
];

export class HTMLTestContext {
  public readonly wnd: Window;
  public readonly doc: Document;
  public readonly dom: HTMLDOM;

  public readonly UIEvent: typeof UIEvent;
  public readonly Event: typeof Event;
  public readonly CustomEvent: typeof CustomEvent;
  public readonly Node: typeof Node;
  public readonly Element: typeof Element;
  public readonly HTMLElement: typeof HTMLElement;
  public readonly HTMLDivElement: typeof HTMLDivElement;
  public readonly Text: typeof Text;
  public readonly Comment: typeof Comment;

  public get container(): IContainer {
    if (this._container === null) {
      this._container = BasicConfiguration.createContainer();
      Registration.instance(IDOM, this.dom).register(this._container);
      Registration.instance(HTMLTestContext, this).register(this._container);
    }
    return this._container;
  }
  public get observerLocator(): IObserverLocator {
    if (this._observerLocator === null) {
      this._observerLocator = this.container.get(IObserverLocator);
    }
    return this._observerLocator;
  }
  public get lifecycle(): ILifecycle & { flushCount?: number } {
    if (this._lifecycle === null) {
      this._lifecycle = this.container.get(ILifecycle);
    }
    return this._lifecycle;
  }
  public get renderer(): IRenderer {
    if (this._renderer === null) {
      this._renderer = this.container.get(IRenderer);
    }
    return this._renderer;
  }
  public get projectorLocator(): IProjectorLocator {
    if (this._projectorLocator === null) {
      this._projectorLocator = this.container.get(IProjectorLocator);
    }
    return this._projectorLocator;
  }
  public get renderingEngine(): IRenderingEngine {
    if (this._renderingEngine === null) {
      this._renderingEngine = this.container.get(IRenderingEngine);
    }
    return this._renderingEngine;
  }

  private _container: IContainer;
  private _observerLocator: IObserverLocator;
  private _lifecycle: ILifecycle;
  private _renderer: IRenderer;
  private _projectorLocator: IProjectorLocator;
  private _renderingEngine: IRenderingEngine;
  private readonly domParser: HTMLDivElement;

  private constructor(
    wnd: Window,
    UIEventType: typeof UIEvent,
    EventType: typeof Event,
    CustomEventType: typeof CustomEvent,
    NodeType: typeof Node,
    ElementType: typeof Element,
    HTMLElementType: typeof HTMLElement,
    HTMLDivElementType: typeof HTMLDivElement,
    TextType: typeof Text,
    CommentType: typeof Comment
  ) {
    this.wnd = wnd;
    this.UIEvent = UIEventType;
    this.Event = EventType;
    this.CustomEvent = CustomEventType;
    this.Node = NodeType;
    this.Element = ElementType;
    this.HTMLElement = HTMLElementType;
    this.HTMLDivElement = HTMLDivElementType;
    this.Text = TextType;
    this.Comment = CommentType;
    this.doc = wnd.document;
    this.domParser = this.doc.createElement('div');
    this.dom = new HTMLDOM(this.wnd, this.doc, NodeType, ElementType, HTMLElementType);
    this._container = null;
    this._observerLocator = null;
    this._lifecycle = null;
    this._renderer = null;
    this._projectorLocator = null;
    this._renderingEngine = null;
  }

  public static create(
    wnd: Window,
    UIEventType: typeof UIEvent,
    EventType: typeof Event,
    CustomEventType: typeof CustomEvent,
    NodeType: typeof Node,
    ElementType: typeof Element,
    HTMLElementType: typeof HTMLElement,
    HTMLDivElementType: typeof HTMLDivElement,
    TextType: typeof Text,
    CommentType: typeof Comment
  ): HTMLTestContext {
    return new HTMLTestContext(
      wnd,
      UIEventType,
      EventType,
      CustomEventType,
      NodeType,
      ElementType,
      HTMLElementType,
      HTMLDivElementType,
      TextType,
      CommentType
    );
  }

  public createElementFromMarkup(markup: string): HTMLElement {
    this.domParser.innerHTML = markup;
    return this.domParser.firstElementChild as HTMLElement;
  }

  public createElement(name: string): HTMLElement {
    return this.doc.createElement(name);
  }
}

function isNodeOrTextOrComment(obj: any): obj is Text | Comment | Node {
  return obj.nodeType > 0;
}

const emptyArray = [];

export function h<T extends keyof HTMLElementTagNameMap, TChildren extends (string | number | boolean | null | undefined | Node)[]>(
  doc: Document,
  name: T,
  attrs: Record<string, any> = null,
  ...children: TChildren
): HTMLElementTagNameMap[T] {
  const el = doc.createElement<T>(name);
  for (const attr in attrs) {
    if (attr === 'class' || attr === 'className' || attr === 'cls') {
      let value: string[] = attrs[attr];
      value = value === undefined || value === null
        ? emptyArray
        : Array.isArray(value)
          ? value
          : (`${value}`).split(' ');
      el.classList.add(...value.filter(Boolean));
    } else if (attr in el || attr === 'data' || attr[0] === '_') {
      el[attr.replace(/^_/, '')] = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr]);
    }
  }
  const childrenCt = el.tagName === 'TEMPLATE' ? (el as HTMLTemplateElement).content : el;
  for (const child of children) {
    if (child === null || child === undefined) {
      continue;
    }
    childrenCt.appendChild(isNodeOrTextOrComment(child)
      ? child
      : doc.createTextNode(`${child}`)
    );
  }
  return el;
}

export const TestContext = {
  createHTMLTestContext(): HTMLTestContext {
    throw new Error('No createHTMLTestContext function has been provided');
  },
  // these are just needed by observer-locator.spec.ts to get the property descriptors from
  // the prototype chain
  Node: null as typeof Node,
  Element: null as typeof Element,
  HTMLElement: null as typeof HTMLElement,
  HTMLDivElement: null as typeof HTMLDivElement
};

export function addChaiAsserts_$state(_chai, utils) {
  const Assertion = _chai['Assertion'];

  Assertion.addProperty('$state');
  function getStateFlagName(state) {
    if (state === 0) return 'none';
    const names = [];
    if (state & State.isBinding) names.push('isBinding');
    if (state & State.isBound) names.push('isBound');
    if (state & State.isAttaching) names.push('isAttaching');
    if (state & State.isAttached) names.push('isAttached');
    if (state & State.isMounted) names.push('isMounted');
    if (state & State.isDetaching) names.push('isDetaching');
    if (state & State.isUnbinding) names.push('isUnbinding');
    if (state & State.isCached) names.push('isCached');
    return names.join('|');
  }

  for (const stateFlag of [
    State.none,
    State.isBinding,
    State.isBound,
    State.isAttaching,
    State.isAttached,
    State.isMounted,
    State.isDetaching,
    State.isUnbinding,
    State.isCached,
  ]) {
    const flagName = getStateFlagName(stateFlag);
    Assertion.addChainableMethod(
      flagName,
      function(msg) {
        msg = msg === undefined ? '' : msg + ' - ';
        const state = this._obj['$state'];
        let currentFlag = stateFlag;
        if (utils.flag(this, 'isBinding')) currentFlag |= State.isBinding;
        if (utils.flag(this, 'isBound')) currentFlag |= State.isBound;
        if (utils.flag(this, 'isAttaching')) currentFlag |= State.isAttaching;
        if (utils.flag(this, 'isAttached')) currentFlag |= State.isAttached;
        if (utils.flag(this, 'isMounted')) currentFlag |= State.isMounted;
        if (utils.flag(this, 'isDetaching')) currentFlag |= State.isDetaching;
        if (utils.flag(this, 'isUnbinding')) currentFlag |= State.isUnbinding;
        if (utils.flag(this, 'isCached')) currentFlag |= State.isCached;

        this.assert(
          (state & currentFlag) === currentFlag,
          `${msg}expected $state to have flags [${getStateFlagName(currentFlag)}], but got [${getStateFlagName(state)}]`,
          `${msg}expected $state to NOT have flags [${getStateFlagName(currentFlag)}], but got [${getStateFlagName(state)}]`);
      },
      function() {
        utils.flag(this, flagName, true);
      }
    );
  }
}

export {
  _,
  stringify,
  jsonStringify,
  htmlStringify,
  verifyEqual,
  padRight,
  massSpy,
  massStub,
  massReset,
  massRestore,
  ensureNotCalled,
  eachCartesianJoin,
  eachCartesianJoinFactory,
  getAllPropertyDescriptors
};
