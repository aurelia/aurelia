import {
  IContainer,
  Registration
} from '@aurelia/kernel';
import { spy } from 'sinon';
import {
  _,
  createElement,
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
import { h } from '../../../scripts/test-lib-dom';
import {
  CustomElementResource,
  ICustomElement,
  ILifecycle,
  IObserverLocator,
  ITemplateDefinition,
  Lifecycle,
  ObserverLocator
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


const newline = /\r?\n/g;

/**
 * Increment the specified (numeric) values (or properties) by the specified number
 */
export function incrementItems(items: any[], by: number, fixture?: IRepeaterFixture): void {
  let i = 0;
  let len = items.length;
  if (fixture) {
    const prop = fixture.propName;
    while (i < len) {
      items[i][prop] += by;
      i++;
    }
  } else {
    while (i < len) {
      items[i] += by;
      i++;
    }
  }
}


/**
 * Create a customElement based on the provided fixture
 *
 * (currently specific to repeater)
 */
export function createRepeater(fixture: IRepeaterFixture, initialItems: any[], def: ITemplateDefinition): ICustomElement {
  const Type = CustomElementResource.define(def, class {});
  const component = new Type();
  component[fixture.colName] = initialItems;
  return component as ICustomElement;
}

export class SpySubscriber {
  constructor() {
    this.handleChange = spy();
    this.handleBatchedChange = spy();
  }
  handleChange: ReturnType<typeof spy>;
  handleBatchedChange: ReturnType<typeof spy>;
  resetHistory() {
    this.handleChange.resetHistory();
    this.handleBatchedChange.resetHistory();
  }
}

export function createObserverLocator(containerOrLifecycle?: IContainer | ILifecycle): IObserverLocator {
  let lifecycle: ILifecycle;
  if (containerOrLifecycle === undefined) {
    lifecycle = new Lifecycle();
  } else if ('get' in containerOrLifecycle) {
    lifecycle = containerOrLifecycle.get(ILifecycle);
  } else {
    lifecycle = lifecycle;
  }
  const dummyLocator: any = {
    handles(obj: any): boolean {
      return false;
    }
  };
  const observerLocator = new ObserverLocator(lifecycle, null, dummyLocator, dummyLocator);
  if (containerOrLifecycle !== undefined && 'get' in containerOrLifecycle) {
    Registration.instance(IObserverLocator, observerLocator).register(containerOrLifecycle, IObserverLocator);
  }
  return observerLocator;
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

export {
  _,
  stringify,
  jsonStringify,
  htmlStringify,
  verifyEqual,
  createElement,
  padRight,
  massSpy,
  massStub,
  massReset,
  massRestore,
  ensureNotCalled,
  eachCartesianJoin,
  eachCartesianJoinFactory,
  getAllPropertyDescriptors,
  h
};
