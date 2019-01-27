import {
  IContainer,
  ITraceInfo,
  Registration,
  Tracer
} from '@aurelia/kernel';
import { expect } from 'chai';
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
  Tracer as DebugTracer
} from '../../debug/src/tracer';
import {
  CustomElementResource,
  ICustomElement,
  ILifecycle,
  IObserverLocator,
  IScope,
  ITemplateDefinition,
  LifecycleFlags as LF,
  OverrideContext,
  Scope,
  stringifyLifecycleFlags
} from '../src/index';
import { Lifecycle } from '../src/lifecycle';
import { ObserverLocator } from '../src/observation/observer-locator';

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

export const BindingTraceWriter = {
  write(info: ITraceInfo): void {
    let output: string = '(';
    const params = info.params;
    for (let i = 0, ii = params.length; i < ii; ++i) {
      const p = info.params[i];
      switch (typeof p) {
        case 'string':
        case 'boolean':
          output += p.toString();
          break;
        case 'number':
          output += p > 0 ? `flags=${stringifyLifecycleFlags(p)}` : '0';
          break;
        case 'object':
          if (p === null) {
            output += 'null';
          } else {
            output += '[object Object]';
          }
          break;
        case 'undefined':
          output += 'undefined';
          break;
        default:
          output += '?';
      }
      if (i + 1 < ii) {
        output += ', ';
      }
    }
    output += ')';
    console.debug(`${'  '.repeat(info.depth)}${info.objName}.${info.methodName} - ${output}`);
  }
};

const RuntimeTracer = { ...Tracer };
export function enableTracing() {
  Object.assign(Tracer, DebugTracer);
  Tracer.enabled = true;
}
export function disableTracing() {
  Tracer.flushAll(null);
  Object.assign(Tracer, RuntimeTracer);
  Tracer.enabled = false;
}

export const checkDelay = 20;

export function createScopeForTest(bindingContext: any = {}, parentBindingContext?: any): IScope {
  if (parentBindingContext) {
    return Scope.create(LF.none, bindingContext, OverrideContext.create(LF.none, bindingContext, OverrideContext.create(LF.none, parentBindingContext, null)));
  }
  return Scope.create(LF.none, bindingContext, OverrideContext.create(LF.none, bindingContext, null));
}

function countSubscribers(observer: any): number {
  let count = 0;
  if (observer._context0) {
    count++;
  }
  if (observer._context1) {
    count++;
  }
  if (observer._context2) {
    count++;
  }
  if (observer._contextsRest) {
    count += observer._contextsRest.length;
  }
  return count;
}

export function executeSharedPropertyObserverTests(observer: any, done: () => void): void {
  const context = 'test-context';
  let callable0: any = { call: spy() };
  const callable1 = { call: spy() };
  const callable2 = { call: spy() };
  const callable3 = { call: spy() };
  const callable4 = { call: spy() };
  const callable5 = { call: spy() };
  let oldValue;
  let newValue;
  const values = ['alkjdfs', 0, false, {}, [], null, undefined, 'foo'];
  let next;
  spy(observer, 'addSubscriber');
  spy(observer, 'removeSubscriber');
  // hasSubscribers, hasSubscriber
  expect(observer.hasSubscribers()).to.equal(false);
  expect(observer.hasSubscriber(context, callable0)).to.equal(false);
  observer.subscribe(context, callable0);
  expect(observer.addSubscriber).to.have.been.calledWith(context, callable0);
  expect(countSubscribers(observer)).to.equal(1);
  expect(observer.hasSubscribers()).to.equal(true);
  expect(observer.hasSubscriber(context, callable0)).to.equal(true);
  // doesn't allow multiple subscribe
  observer.subscribe(context, callable0);
  expect(observer.addSubscriber).to.have.been.calledWith(context, callable0);
  expect(countSubscribers(observer)).to.equal(1);
  // doesn't allow multiple unsubscribe
  observer.unsubscribe(context, callable0);
  expect(observer.removeSubscriber).to.have.been.calledWith(context, callable0);
  expect(countSubscribers(observer)).to.equal(0);
  observer.unsubscribe(context, callable0);
  expect(observer.removeSubscriber).to.have.been.calledWith(context, callable0);
  expect(countSubscribers(observer)).to.equal(0);

  // overflows into "rest" array
  observer.subscribe(context, callable0);
  expect(observer._callable0).to.equal(callable0);
  expect(countSubscribers(observer)).to.equal(1);
  expect(observer.hasSubscribers()).to.equal(true);
  expect(observer.hasSubscriber(context, callable0)).to.equal(true);

  observer.subscribe(context, callable1);
  expect(observer._callable1).to.equal(callable1);
  expect(countSubscribers(observer)).to.equal(2);
  expect(observer.hasSubscribers()).to.equal(true);
  expect(observer.hasSubscriber(context, callable1)).to.equal(true);

  observer.subscribe(context, callable2);
  expect(observer._callable2).to.equal(callable2);
  expect(countSubscribers(observer)).to.equal(3);
  expect(observer.hasSubscribers()).to.equal(true);
  expect(observer.hasSubscriber(context, callable2)).to.equal(true);

  observer.subscribe(context, callable3);
  expect(observer._callablesRest[0]).to.equal(callable3);
  expect(countSubscribers(observer)).to.equal(4);
  expect(observer.hasSubscribers()).to.equal(true);
  expect(observer.hasSubscriber(context, callable3)).to.equal(true);

  observer.subscribe(context, callable4);
  expect(observer._callablesRest[1]).to.equal(callable4);
  expect(countSubscribers(observer)).to.equal(5);
  expect(observer.hasSubscribers()).to.equal(true);
  expect(observer.hasSubscriber(context, callable4)).to.equal(true);

  observer.subscribe(context, callable5);
  expect(observer._callablesRest[2]).to.equal(callable5);
  expect(countSubscribers(observer)).to.equal(6);
  expect(observer.hasSubscribers()).to.equal(true);
  expect(observer.hasSubscriber(context, callable5)).to.equal(true);

  // reuses empty slots
  observer.unsubscribe(context, callable2);
  expect(observer._callable2).to.equal(null);
  expect(countSubscribers(observer)).to.equal(5);
  expect(observer.hasSubscribers()).to.equal(true);
  expect(observer.hasSubscriber(context, callable2)).to.equal(false);

  observer.subscribe(context, callable2);
  expect(observer._callable2).to.equal(callable2);
  expect(countSubscribers(observer)).to.equal(6);
  expect(observer.hasSubscribers()).to.equal(true);
  expect(observer.hasSubscriber(context, callable2)).to.equal(true);

  // handles unsubscribe during callable0
  let unsubscribeDuringCallbackTested = false;
  observer.unsubscribe(context, callable0);
  callable0 = {
    call: (_context: any, _newValue: any, _oldValue: any): void => {
      observer.unsubscribe(_context, callable1);
      observer.unsubscribe(_context, callable2);
      observer.unsubscribe(_context, callable3);
      observer.unsubscribe(_context, callable4);
      observer.unsubscribe(_context, callable5);
    }
  };
  spy(callable0, 'call');
  observer.subscribe(context, callable0);

  next = () => {
    if (values.length) {
      oldValue = observer.getValue();
      newValue = values.splice(0, 1)[0];
      observer.setValue(newValue);
      setTimeout(() => {
        expect(callable0.call).to.have.been.calledWith(context, newValue, oldValue);
        if (!unsubscribeDuringCallbackTested) {
          unsubscribeDuringCallbackTested = true;
          expect(callable1.call).to.have.been.calledWith(context, newValue, oldValue);
          expect(callable2.call).to.have.been.calledWith(context, newValue, oldValue);
          expect(callable3.call).to.have.been.calledWith(context, newValue, oldValue);
          expect(callable4.call).to.have.been.calledWith(context, newValue, oldValue);
          expect(callable5.call).to.have.been.calledWith(context, newValue, oldValue);
        }
        next();
      },         checkDelay * 2);
    } else {
      observer.unsubscribe(context, callable0);
      callable0.call.resetHistory();
      observer.setValue('bar');
      setTimeout(() => {
        expect(callable0.call).not.to.have.been.called;
        expect(observer._callable0).to.equal(null);
        expect(observer._callable1).to.equal(null);
        expect(observer._callable2).to.equal(null);
        expect(observer._callablesRest.length).to.equal(0);
        done();
      },         checkDelay * 2);
    }
  };

  next();
}

/**
 * Increment the specified (numeric) values (or properties) by the specified number
 */
export function incrementItems(items: any[], by: number, fixture?: IRepeaterFixture): void {
  let i = 0;
  const len = items.length;
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
  return component;
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

export function createObserverLocator(containerOrLifecycle?: IContainer | ILifecycle): IObserverLocator {
  let lifecycle: ILifecycle;
  if (containerOrLifecycle === undefined) {
    lifecycle = new Lifecycle();
  } else if ('get' in containerOrLifecycle) {
    lifecycle = containerOrLifecycle.get(ILifecycle);
  }
  const dummyLocator: any = {
    handles(): boolean {
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
