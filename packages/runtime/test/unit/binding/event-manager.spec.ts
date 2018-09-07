import { ListenerTracker, DelegateOrCaptureSubscription, TriggerSubscription, EventSubscriber, EventManager, DelegationStrategy, DOM } from '../../../src/index';
import { expect } from 'chai';
import { spy } from 'sinon';
import { _, createElement } from '../util';

const CAPTURING_PHASE = 1;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;

function eventPropertiesShallowClone<T extends Event>(e: T): T & { instance: T, target: Node } {
  return <any>{
    bubbles: e.bubbles,
    cancelable: e.cancelable,
    cancelBubble: e.cancelBubble,
    composed: e.composed,
    currentTarget: e.currentTarget,
    deepPath: e.deepPath,
    defaultPrevented: e.defaultPrevented,
    detail: (<any>e).detail,
    eventPhase: e.eventPhase,
    srcElement: e.srcElement,
    target: e.target,
    timeStamp: e.timeStamp,
    type: e.type,
    isTrusted: e.isTrusted,
    returnValue: e.returnValue,
    instance: e
  };
}

describe('ListenerTracker', () => {
  function setup(eventName: string, listener: EventListenerOrEventListenerObject, capture: boolean, bubbles: boolean) {
    const handlerPath: Array<ReturnType<typeof eventPropertiesShallowClone>> = [];
    const handler = function (e: UIEvent) {
      handlerPath.push(eventPropertiesShallowClone(e));
    }
    if (listener === null) {
      listener = handler;
    } else {
      listener['handleEvent'] = handler;
    }
    const sut = new ListenerTracker(eventName, listener, capture);
    const el = document.createElement('div');
    el.addEventListener(eventName, listener, capture);
    document.body.appendChild(el);
    const event = new UIEvent(eventName, {
      bubbles,
      cancelable: true,
      view: window
    });
    return { sut, el, event, handlerPath };
  }

  function tearDown({ sut, el }: Partial<ReturnType<typeof setup>>) {
    document.removeEventListener(sut['eventName'], sut['listener'], sut['capture']);
    el.removeEventListener(sut['eventName'], sut['listener'], sut['capture']);
    document.body.removeChild(el);
  }

  for (const increment of [1, 2]) {
    for (const eventName of ['foo', 'change', 'input', 'blur', 'keyup', 'paste', 'scroll']) {
      for (const capture of [true, false, undefined]) {
        for (const bubbles of [true, false]) {
          for (const listener of [null, { handleEvent: null }]) {
            describe('increment()', () => {
              it(_`adds the event listener (increment=${increment}, eventName=${eventName}, capture=${capture}, bubbles=${bubbles}, listener=${listener})`, () => {
                const { sut, el, event, handlerPath } = setup(eventName, listener, capture, bubbles);
                for (let i = 0; i < increment; ++i) {
                  sut.increment();
                }

                el.dispatchEvent(event);

                if (capture === true) {
                  expect(handlerPath.length).to.equal(2);
                  expect(handlerPath[0].eventPhase).to.equal(CAPTURING_PHASE);
                  expect(handlerPath[1].eventPhase).to.equal(AT_TARGET);
                } else {
                  if (bubbles === true) {
                    expect(handlerPath.length).to.equal(2);
                    expect(handlerPath[0].eventPhase).to.equal(AT_TARGET);
                    expect(handlerPath[1].eventPhase).to.equal(BUBBLING_PHASE);
                  } else {
                    expect(handlerPath.length).to.equal(1);
                    expect(handlerPath[0].eventPhase).to.equal(AT_TARGET);
                  }
                }

                el.dispatchEvent(event);

                if (capture === true) {
                  expect(handlerPath.length).to.equal(4);
                  expect(handlerPath[2].eventPhase).to.equal(CAPTURING_PHASE);
                  expect(handlerPath[3].eventPhase).to.equal(AT_TARGET);
                } else {
                  if (bubbles === true) {
                    expect(handlerPath.length).to.equal(4);
                    expect(handlerPath[2].eventPhase).to.equal(AT_TARGET);
                    expect(handlerPath[3].eventPhase).to.equal(BUBBLING_PHASE);
                  } else {
                    expect(handlerPath.length).to.equal(2);
                    expect(handlerPath[1].eventPhase).to.equal(AT_TARGET);
                  }
                }

                tearDown({ sut, el });
              });
            });

            describe('decrement()', () => {
              it(_`removes the event listener (increment=${increment}, eventName=${eventName}, capture=${capture}, bubbles=${bubbles}, listener=${listener})`, () => {
                const { sut, el, event, handlerPath } = setup(eventName, listener, capture, bubbles);
                for (let i = 0; i < increment; ++i) {
                  sut.increment();
                }

                el.dispatchEvent(event);

                if (capture === true) {
                  expect(handlerPath.length).to.equal(2);
                  expect(handlerPath[0].eventPhase).to.equal(CAPTURING_PHASE);
                  expect(handlerPath[1].eventPhase).to.equal(AT_TARGET);
                } else {
                  if (bubbles === true) {
                    expect(handlerPath.length).to.equal(2);
                    expect(handlerPath[0].eventPhase).to.equal(AT_TARGET);
                    expect(handlerPath[1].eventPhase).to.equal(BUBBLING_PHASE);
                  } else {
                    expect(handlerPath.length).to.equal(1);
                    expect(handlerPath[0].eventPhase).to.equal(AT_TARGET);
                  }
                }

                for (let i = 0; i < increment; ++i) {
                  sut.decrement();
                }

                el.dispatchEvent(event);
                if (capture === true || bubbles === true) {
                  expect(handlerPath.length).to.equal(3);
                  expect(handlerPath[2].eventPhase).to.equal(AT_TARGET);
                } else {
                  expect(handlerPath.length).to.equal(2);
                  expect(handlerPath[1].eventPhase).to.equal(AT_TARGET);
                }

                tearDown({ sut, el });
              });
            });
          }
        }
      }
    }
  }
});

describe('DelegateOrCaptureSubscription', () => {
  function setup(eventName: string) {
    const entry = <ListenerTracker><any>{ decrement: spy() };
    const lookup = {};
    const callback = spy();
    const sut = new DelegateOrCaptureSubscription(entry, lookup, eventName, callback);

    return { entry, lookup, callback, sut };
  }

  for (const eventName of ['foo', 'bar']) {
    it(_`dispose() decrements and removes the callback (eventName=${eventName})`, () => {
      const { sut, lookup, callback, entry } = setup(eventName);
      expect(lookup[eventName]).to.equal(callback);
      sut.dispose();
      expect(lookup[eventName]).to.be.null;
      expect(entry.decrement).to.have.been.calledOnce;
    });
  }
});

describe('TriggerSubscription', () => {
  function setup(listener: EventListenerOrEventListenerObject, eventName: string, bubbles: boolean) {
    const handler = spy();

    if (listener === null) {
      listener = handler;
    } else {
      listener['handleEvent'] = handler;
    }

    const el = document.createElement('div');
    document.body.appendChild(el);
    const event = new UIEvent(eventName, {
      bubbles,
      cancelable: true,
      view: window
    });

    const callback = spy();
    const sut = new TriggerSubscription(el, eventName, callback);

    return { callback, sut, handler, event, el };
  }

  function tearDown({ el }: Partial<ReturnType<typeof setup>>) {
    document.body.removeChild(el);
  }

  for(const bubbles of [true, false]) {
    for (const eventName of ['foo', 'bar']) {
      for (const listener of [null, { handleEvent: null }]) {
        it(_`dispose() removes the event listener (eventName=${eventName}, bubbles=${bubbles}, listener=${listener})`, () => {
          const { sut, callback, event, el } = setup(listener, eventName, bubbles);

          el.dispatchEvent(event);

          expect(callback).to.have.been.calledOnce;
          expect(callback.getCalls()[0]).to.have.been.calledWith(event);

          el.dispatchEvent(event);

          expect(callback).to.have.been.calledTwice;
          expect(callback.getCalls()[1]).to.have.been.calledWith(event);

          sut.dispose();

          el.dispatchEvent(event);

          expect(callback).to.have.been.calledTwice;

          tearDown({ el });
        });
      }
    }
  }
});

describe('EventSubscriber', () => {
  function setup(listener: EventListenerOrEventListenerObject, eventNames: string[], bubbles: boolean) {
    const handler = spy();

    if (listener === null) {
      listener = handler;
    } else {
      listener['handleEvent'] = handler;
    }

    const el = document.createElement('div');
    document.body.appendChild(el);
    const events = eventNames.map(eventName => {
      return new UIEvent(eventName, {
        bubbles,
        cancelable: true,
        view: window
      });
    })

    const sut = new EventSubscriber(eventNames);

    return { sut, handler, listener, events, el };
  }

  function tearDown({ el }: Partial<ReturnType<typeof setup>>) {
    document.body.removeChild(el);
  }

  for(const bubbles of [true, false]) {
    for (const eventNames of [['foo', 'bar', 'baz'], ['click', 'change', 'input']]) {
      for (const listenerObj of [null, { handleEvent: null }]) {
        it(_`subscribe() adds the event listener (eventNames=${eventNames}, bubbles=${bubbles}, listenerObj=${listenerObj})`, () => {
          const { sut, handler, listener, events, el } = setup(listenerObj, eventNames, bubbles);

          sut.subscribe(el, listener);

          for (let i = 0, ii = events.length; i < ii; ++i) {
            const event = events[i];
            el.dispatchEvent(event);
            expect(handler.getCalls().length).to.equal(i + 1);
            expect(handler.getCalls()[i]).to.have.been.calledWith(event);
          }

          for (let i = 0, ii = events.length; i < ii; ++i) {
            const event = events[i];
            el.dispatchEvent(event);
            expect(handler.getCalls().length).to.equal(i + 4);
            expect(handler.getCalls()[i + 3]).to.have.been.calledWith(event);
          }

          sut.dispose();

          for (let i = 0, ii = events.length; i < ii; ++i) {
            const event = events[i];
            el.dispatchEvent(event);
          }

          expect(handler.getCalls().length).to.equal(6);

          tearDown({ el });
        });
      }
    }
  }
});

describe('EventManager', () => {

  it(`initializes with correct default element configurations`, () => {
    const sut = new EventManager();
    const lookup = sut.elementHandlerLookup;

    expect(lookup['INPUT']['value'].length).to.equal(2);
    expect(lookup['INPUT']['value']).to.include('change');
    expect(lookup['INPUT']['value']).to.include('input');

    expect(lookup['INPUT']['checked'].length).to.equal(2);
    expect(lookup['INPUT']['checked']).to.include('change');
    expect(lookup['INPUT']['checked']).to.include('input');

    expect(lookup['INPUT']['files'].length).to.equal(2);
    expect(lookup['INPUT']['files']).to.include('change');
    expect(lookup['INPUT']['files']).to.include('input');

    expect(lookup['TEXTAREA']['value'].length).to.equal(2);
    expect(lookup['TEXTAREA']['value']).to.include('change');
    expect(lookup['TEXTAREA']['value']).to.include('input');

    expect(lookup['SELECT']['value'].length).to.equal(1);
    expect(lookup['SELECT']['value']).to.include('change');

    expect(lookup['content editable']['value'].length).to.equal(5);
    expect(lookup['content editable']['value']).to.include('change');
    expect(lookup['content editable']['value']).to.include('input');
    expect(lookup['content editable']['value']).to.include('blur');
    expect(lookup['content editable']['value']).to.include('keyup');
    expect(lookup['content editable']['value']).to.include('paste');

    expect(lookup['scrollable element']['scrollTop'].length).to.equal(1);
    expect(lookup['scrollable element']['scrollTop']).to.include('scroll');
    expect(lookup['scrollable element']['scrollLeft'].length).to.equal(1);
    expect(lookup['scrollable element']['scrollLeft']).to.include('scroll');
  });

  it(`registerElementConfiguration() registers the configuration`, () => {
    const sut = new EventManager();
    sut.registerElementConfiguration({
      tagName: 'FOO',
      properties: {
        bar: ['baz']
      }
    });

    const lookup = sut.elementHandlerLookup;
    expect(lookup['FOO']['bar'].length).to.equal(1);
    expect(lookup['FOO']['bar']).to.include('baz');
  });

  it(`registerElementConfiguration() does not register configuration from higher up the prototype chain`, () => {
    const sut = new EventManager();
    class ElementProperties {
      public bar: string[];
      constructor() {
        this.bar = ['baz']
      }
    }
    ElementProperties.prototype['qux'] = ['quux'];
    sut.registerElementConfiguration({
      tagName: 'FOO',
      properties: <any>new ElementProperties()
    });

    const lookup = sut.elementHandlerLookup;
    expect(lookup['FOO']['bar'].length).to.equal(1);
    expect(lookup['FOO']['bar']).to.include('baz');
  });

  describe(`getElementHandler()`, () => {
    const sut = new EventManager();
    const lookup = sut.elementHandlerLookup;

    for (let tagName in lookup) {
      let expectedEventNames: string[];
      let propertyNames: string[];
      switch (tagName) {
        case 'content editable':
          tagName = 'div';
          propertyNames = ['textContent', 'innerHTML'];
          expectedEventNames = ['change', 'input', 'blur', 'keyup', 'paste'];
          break;
        case 'scrollable element':
          tagName = 'div';
          propertyNames = ['scrollTop', 'scrollLeft'];
          expectedEventNames = ['scroll'];
          break;
        default:
          propertyNames = Object.keys(lookup[tagName]);
      }
      for (const propertyName of propertyNames) {
        if (expectedEventNames === undefined) {
          expectedEventNames = lookup[tagName][propertyName];
        }
        it(_`tagName=${tagName}, propertyName=${propertyName} returns handler with eventNames=${expectedEventNames}`, () => {
          const handler = sut.getElementHandler(createElement(`<${tagName}></${tagName}>`), propertyName);
          expect(handler['events']).to.deep.equal(expectedEventNames);
        })
      }
    }

    it(`returns null if the target does not have a tagName`, () => {
      const text = document.createTextNode('asdf');
      const handler = sut.getElementHandler(text, 'textContent');
      expect(handler).to.be.null;
    });

    it(`returns null if the property does not exist in the configuration`, () => {
      const el = createElement('<input></input>');
      let handler = sut.getElementHandler(el, 'value');
      expect(handler).not.to.be.null;
      handler = sut.getElementHandler(el, 'value1');
      expect(handler).to.be.null;
    });
  });

  describe('addEventListener()', () => {
    function setup(
      eventName: string,
      listener: EventListenerOrEventListenerObject,
      bubbles: boolean,
      stopPropagation: boolean,
      returnValue: any,
      strategy: DelegationStrategy,
      shadow: string) {

      const childHandlerPath: Array<ReturnType<typeof eventPropertiesShallowClone>> = [];
      const parentHandlerPath: Array<ReturnType<typeof eventPropertiesShallowClone>> = [];
      const childHandler = function (e: UIEvent) {
        childHandlerPath.push(eventPropertiesShallowClone(e));
        if (stopPropagation) {
          e.stopPropagation();
        }
        return returnValue;
      }
      const parentHandler = function (e: UIEvent) {
        parentHandlerPath.push(eventPropertiesShallowClone(e));
        if (stopPropagation) {
          e.stopPropagation();
        }
        return returnValue;
      }
      let childListener: EventListenerOrEventListenerObject;
      let parentListener: EventListenerOrEventListenerObject;
      if (listener === null) {
        childListener = childHandler;
        parentListener = parentHandler;
      } else {
        childListener = { handleEvent: childHandler };
        parentListener = { handleEvent: parentHandler };
      }

      const sut = new EventManager();
      const wrapper = document.createElement('div');
      const parentEl = document.createElement('parent-div');
      const childEl = document.createElement('child-div');
      const parentSubscription = sut.addEventListener(parentEl, eventName, parentListener, strategy);
      const childSubscription = sut.addEventListener(childEl, eventName, childListener, strategy);
      parentEl.appendChild(childEl);
      if (shadow !== null) {
        const shadowRoot = wrapper.attachShadow(<any>{ mode: shadow });
        shadowRoot.appendChild(parentEl);
      } else {
        wrapper.appendChild(parentEl);
      }
      document.body.appendChild(wrapper);
      const event = new UIEvent(eventName, {
        bubbles,
        cancelable: true,
        view: window
      });
      return { sut, wrapper, parentEl, childEl, parentSubscription, childSubscription, childListener, parentListener, childHandlerPath, parentHandlerPath, event };
    }

    function tearDown({ wrapper, parentSubscription, childSubscription }: Partial<ReturnType<typeof setup>>) {
      parentSubscription.dispose();
      childSubscription.dispose();
      document.body.removeChild(wrapper);
    }

    const hasShadow = Element.prototype.attachShadow !== undefined;
    for (const eventName of ['click']) {
      for (const bubbles of [true, false]) {
        for (const strategy of [DelegationStrategy.bubbling, DelegationStrategy.capturing, DelegationStrategy.none]) {
          for (const stopPropagation of [true, false]) {
            for (const returnValue of [true, false, undefined]) {
              // TODO: for firefox this won't work because ShadowDOM is not implemented yet. The webcomponents polyfill won't make it work either. Need to investigate what we can or cannot support.
              for (const shadow of hasShadow ? [null, 'open', 'closed'] : [null]) { // TODO: 'open' should probably work in some way, so we need to try and fix this
                for (const listenerObj of [null, { handleEvent: null }]) {
                  it(_`strategy=${DelegationStrategy[strategy]}, eventName=${eventName}, bubbles=${bubbles}, stopPropagation=${stopPropagation}, returnValue=${returnValue}, shadow=${shadow}, listener=${listenerObj}`, () => {
                    const {
                      sut,
                      wrapper,
                      parentEl,
                      childEl,
                      parentSubscription,
                      childSubscription,
                      parentListener,
                      childListener,
                      parentHandlerPath,
                      childHandlerPath,
                      event
                    } = setup(eventName, listenerObj, bubbles, stopPropagation, returnValue, strategy, shadow);

                    switch (strategy) {
                      case DelegationStrategy.bubbling:
                      case DelegationStrategy.capturing:
                        expect(parentSubscription).to.be.instanceof(DelegateOrCaptureSubscription);
                        expect(childSubscription).to.be.instanceof(DelegateOrCaptureSubscription);
                        break;
                      case DelegationStrategy.none:
                        expect(parentSubscription).to.be.instanceof(TriggerSubscription);
                        expect(childSubscription).to.be.instanceof(TriggerSubscription);
                        break;
                    }

                    childEl.dispatchEvent(event);

                    switch (strategy) {
                      case DelegationStrategy.bubbling:
                        if (bubbles && shadow === null) {
                          expect(childHandlerPath.length).to.equal(1, 'childHandlerPath.length');
                          expect(childHandlerPath[0].eventPhase).to.equal(BUBBLING_PHASE, 'eventPhase');
                          expect(childHandlerPath[0].target.nodeName).to.equal('CHILD-DIV');
                          expect(childHandlerPath[0].currentTarget).to.equal(document);
                          if (stopPropagation) {
                            expect(parentHandlerPath.length).to.equal(0, 'parentHandlerPath.length');
                          } else {
                            expect(parentHandlerPath.length).to.equal(1, 'parentHandlerPath.length');
                            expect(parentHandlerPath[0].eventPhase).to.equal(BUBBLING_PHASE, 'eventPhase');
                            expect(parentHandlerPath[0].target.nodeName).to.equal('CHILD-DIV');
                            expect(parentHandlerPath[0].currentTarget).to.equal(document);
                          }
                        } else {
                          expect(childHandlerPath.length).to.equal(0, 'childHandlerPath.length');
                          expect(parentHandlerPath.length).to.equal(0, 'parentHandlerPath.length');
                        }
                        break;
                      case DelegationStrategy.capturing:
                        if (shadow === null) {
                          expect(parentHandlerPath.length).to.equal(1, 'parentHandlerPath.length');
                          expect(parentHandlerPath[0].eventPhase).to.equal(CAPTURING_PHASE, 'eventPhase');
                          expect(parentHandlerPath[0].target.nodeName).to.equal('CHILD-DIV');
                          expect(parentHandlerPath[0].currentTarget).to.equal(document);
                          if (stopPropagation) {
                            expect(childHandlerPath.length).to.equal(0, 'childHandlerPath.length');
                          } else {
                            expect(childHandlerPath.length).to.equal(1, 'childHandlerPath.length');
                            expect(childHandlerPath[0].eventPhase).to.equal(CAPTURING_PHASE, 'eventPhase');
                            expect(childHandlerPath[0].target.nodeName).to.equal('CHILD-DIV');
                            expect(childHandlerPath[0].currentTarget).to.equal(document);
                          }
                        } else {
                          expect(parentHandlerPath.length).to.equal(0, 'parentHandlerPath.length');
                          expect(childHandlerPath.length).to.equal(0, 'childHandlerPath.length');
                        }
                        break;
                      case DelegationStrategy.none:
                        expect(childHandlerPath.length).to.equal(1, 'childHandlerPath.length');
                        expect(childHandlerPath[0].eventPhase).to.equal(AT_TARGET, 'eventPhase');
                        expect(childHandlerPath[0].target.nodeName).to.equal('CHILD-DIV');
                        expect(childHandlerPath[0].currentTarget).to.equal(childEl);
                        if (bubbles && !stopPropagation) {
                          expect(parentHandlerPath.length).to.equal(1, 'parentHandlerPath.length');
                          expect(parentHandlerPath[0].eventPhase).to.equal(BUBBLING_PHASE, 'eventPhase');
                          expect(parentHandlerPath[0].target.nodeName).to.equal('CHILD-DIV');
                          expect(parentHandlerPath[0].currentTarget).to.equal(parentEl);
                        } else {
                          expect(parentHandlerPath.length).to.equal(0, 'parentHandlerPath.length');
                        }
                        break;
                    }

                    childHandlerPath.splice(0);
                    parentHandlerPath.splice(0);

                    parentEl.dispatchEvent(event);

                    switch (strategy) {
                      case DelegationStrategy.bubbling:
                        expect(childHandlerPath.length).to.equal(0, 'childHandlerPath.length');
                        if (bubbles && shadow === null) {
                          expect(parentHandlerPath.length).to.equal(1, 'parentHandlerPath.length');
                          expect(parentHandlerPath[0].eventPhase).to.equal(BUBBLING_PHASE, 'eventPhase');
                          expect(parentHandlerPath[0].target.nodeName).to.equal('PARENT-DIV');
                          expect(parentHandlerPath[0].currentTarget).to.equal(document);
                        } else {
                          expect(parentHandlerPath.length).to.equal(0, 'parentHandlerPath.length');
                        }
                        break;
                      case DelegationStrategy.capturing:
                        expect(childHandlerPath.length).to.equal(0, 'childHandlerPath.length');
                        if (shadow === null) {
                          expect(parentHandlerPath.length).to.equal(1, 'parentHandlerPath.length');
                          expect(parentHandlerPath[0].eventPhase).to.equal(CAPTURING_PHASE, 'eventPhase');
                          expect(parentHandlerPath[0].target.nodeName).to.equal('PARENT-DIV');
                          expect(parentHandlerPath[0].currentTarget).to.equal(document);
                        } else {
                          expect(parentHandlerPath.length).to.equal(0, 'parentHandlerPath.length');
                        }
                        break;
                      case DelegationStrategy.none:
                        expect(childHandlerPath.length).to.equal(0, 'childHandlerPath.length');
                        expect(parentHandlerPath.length).to.equal(1, 'parentHandlerPath.length');
                        expect(parentHandlerPath[0].eventPhase).to.equal(AT_TARGET, 'eventPhase');
                        expect(parentHandlerPath[0].target.nodeName).to.equal('PARENT-DIV');
                        expect(parentHandlerPath[0].currentTarget).to.equal(parentEl);
                        break;
                    }

                    tearDown({ wrapper, parentSubscription, childSubscription })
                  });
                }
              }
            }
          }
        }
      }
    }
  });
});
