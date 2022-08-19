import { IDisposable } from '@aurelia/kernel';
import {
  EventDelegator,
  EventSubscriber,
  NodeObserverConfig,
} from '@aurelia/runtime-html';
import { _, TestContext, assert, createSpy } from '@aurelia/testing';

const CAPTURING_PHASE = 1;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;

const EventPhaseText = ['', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE'];

function assertHandlerPath(expectedPhases: number[], actualPhases: ReturnType<typeof eventPropertiesShallowClone>[]): void {
  const expectedLen = expectedPhases.length;
  const actualLen = actualPhases.length;
  const errors: string[] = [];
  if (expectedLen !== actualLen) {
    errors.push(`Expected handlerPath.length to equal ${expectedLen}, but got: ${actualLen}`);
  }
  let expected: number;
  let actual: number;
  for (let i = 0; i < expectedLen && i < actualLen; ++i) {
    expected = expectedPhases[i];
    actual = actualPhases[i].eventPhase;
    if (expected !== actual) {
      errors.push(`Expected handlerPath[${i}] to equal ${EventPhaseText[expected]}, but got: ${EventPhaseText[actual]}`);
    }
  }

  if (errors.length > 0) {
    const msg = `ASSERTION ERRORS:\n${errors.map(e => `  - ${e}`).join('\n')}`;
    throw new Error(msg);
  }
}

function eventPropertiesShallowClone<T extends Event>(e: T): T & { instance: T; target: Node } {
  return {
    bubbles: e.bubbles,
    cancelable: e.cancelable,
    cancelBubble: e.cancelBubble,
    composed: e.composed,
    currentTarget: e.currentTarget,
    defaultPrevented: e.defaultPrevented,
    detail: (e as any).detail,
    eventPhase: e.eventPhase,
    srcElement: e.srcElement,
    target: e.target,
    timeStamp: e.timeStamp,
    type: e.type,
    isTrusted: e.isTrusted,
    returnValue: e.returnValue,
    instance: e
  } as any;
}

describe('ListenerTracker', function () {
  function createFixture(eventName: string, listener: EventListenerOrEventListenerObject, capture: boolean, bubbles: boolean) {
    const ctx = TestContext.create();
    const handlerPath: ReturnType<typeof eventPropertiesShallowClone>[] = [];
    function handler(e: UIEvent) {
      handlerPath.push(eventPropertiesShallowClone(e));
    }
    function copyHandler() {
      if (listener == null) {
        return (e: UIEvent) => handler(e);
      } else {
        return {
          handleEvent(e: UIEvent) { return handler(e); },
        };
      }
    }
    const sut = new EventDelegator();
    const el = ctx.createElement('div');
    el.addEventListener(eventName, copyHandler(), capture);
    ctx.doc.body.appendChild(el);
    const event = new ctx.UIEvent(eventName, {
      bubbles,
      cancelable: true,
      view: ctx.wnd
    });
    return { ctx, sut, el, event, copyHandler, handlerPath, eventName, listener, capture };
  }

  function tearDown({ ctx, sut, el, eventName, listener, capture }: Partial<ReturnType<typeof createFixture>>) {
    ctx.doc.removeEventListener(eventName, listener, capture);
    ctx.doc.body.removeChild(el);
    sut.dispose();
  }

  for (const increment of [1, 2]) {
    for (const eventName of ['foo', 'change', 'input', 'blur', 'keyup', 'paste', 'scroll']) {
      for (const capture of [true, false, undefined]) {
        for (const bubbles of [true, false]) {
          for (const listener of [null, { handleEvent: null }] as (((ev: Event) => void) | { handleEvent(ev: Event): void })[]) {
            describe('increment()', function () {
              it(_`adds the event listener (increment=${increment}, eventName=${eventName}, capture=${capture}, bubbles=${bubbles}, listener=${listener})`, function () {
                const { ctx, sut, el, event, handlerPath, copyHandler } = createFixture(eventName, listener, capture, bubbles);
                for (let i = 0; i < increment; ++i) {
                  sut.addEventListener(ctx.doc.body, el, eventName, copyHandler(), { capture });
                }

                el.dispatchEvent(event);

                if (capture === true) {
                  assertHandlerPath([CAPTURING_PHASE, AT_TARGET], handlerPath);
                } else {
                  if (bubbles === true) {
                    assertHandlerPath([AT_TARGET, BUBBLING_PHASE], handlerPath);
                  } else {
                    assertHandlerPath([AT_TARGET], handlerPath);
                  }
                }

                el.dispatchEvent(event);

                if (capture === true) {
                  assertHandlerPath([CAPTURING_PHASE, AT_TARGET, CAPTURING_PHASE, AT_TARGET], handlerPath);
                } else {
                  if (bubbles === true) {
                    assertHandlerPath([AT_TARGET, BUBBLING_PHASE, AT_TARGET, BUBBLING_PHASE], handlerPath);
                  } else {
                    assertHandlerPath([AT_TARGET, AT_TARGET], handlerPath);
                  }
                }

                tearDown({ ctx, sut, el, eventName, listener, capture });
              });
            });

            describe('decrement()', function () {
              it(_`removes the event listener (increment=${increment}, eventName=${eventName}, capture=${capture}, bubbles=${bubbles}, listener=${listener})`, function () {
                const { ctx, sut, el, event, handlerPath, copyHandler } = createFixture(eventName, listener, capture, bubbles);
                const disposables: IDisposable[] = [];
                for (let i = 0; i < increment; ++i) {
                  disposables.push(sut.addEventListener(ctx.doc.body, el, eventName, copyHandler(), { capture }));
                }

                el.dispatchEvent(event);

                if (capture === true) {
                  assertHandlerPath([CAPTURING_PHASE, AT_TARGET], handlerPath);
                } else {
                  if (bubbles === true) {
                    assertHandlerPath([AT_TARGET, BUBBLING_PHASE], handlerPath);
                  } else {
                    assertHandlerPath([AT_TARGET], handlerPath);
                  }
                }

                for (let i = 0; i < increment; ++i) {
                  disposables[i].dispose();
                }

                el.dispatchEvent(event);
                if (bubbles === true && capture !== true) {
                  assertHandlerPath([AT_TARGET, BUBBLING_PHASE, AT_TARGET], handlerPath);
                } else if (capture === true && bubbles !== true) {
                  assertHandlerPath([CAPTURING_PHASE, AT_TARGET, AT_TARGET], handlerPath);
                } else if (capture === true && bubbles === true) {
                  assertHandlerPath([CAPTURING_PHASE, AT_TARGET, AT_TARGET], handlerPath);
                } else {
                  assertHandlerPath([AT_TARGET, AT_TARGET], handlerPath);
                }

                tearDown({ ctx, sut, el, eventName, listener, capture });
              });
            });
          }
        }
      }
    }
  }
});

describe('EventSubscriber', function () {
  function createFixture(listener: EventListenerOrEventListenerObject, eventNames: string[], bubbles: boolean) {
    const ctx = TestContext.create();
    const handler = createSpy();

    if (listener == null) {
      listener = handler;
    } else {
      listener['handleEvent'] = handler;
    }

    const el = ctx.createElement('div');
    ctx.doc.body.appendChild(el);
    const events = eventNames.map(eventName => {
      return new ctx.UIEvent(eventName, {
        bubbles,
        cancelable: true,
        view: ctx.wnd
      });
    });

    const sut = new EventSubscriber(new NodeObserverConfig({ events: eventNames }));

    return { ctx, sut, handler, listener, events, el };
  }

  function tearDown({ ctx, el }: Partial<ReturnType<typeof createFixture>>) {
    ctx.doc.body.removeChild(el);
  }

  for (const bubbles of [true, false]) {
    for (const eventNames of [['foo', 'bar', 'baz'], ['click', 'change', 'input']]) {
      for (const listenerObj of [null, { handleEvent: null }]) {
        it(_`subscribe() adds the event listener (eventNames=${eventNames}, bubbles=${bubbles}, listenerObj=${listenerObj})`, function () {
          const { ctx, sut, handler, listener, events, el } = createFixture(listenerObj, eventNames, bubbles);

          sut.subscribe(el, listener);

          for (let i = 0, ii = events.length; i < ii; ++i) {
            const event = events[i];
            el.dispatchEvent(event);
            assert.strictEqual(handler.calls.length, i + 1, 'handler.calls.length');
            assert.deepStrictEqual(handler.calls[i], [event], `handler.calls[${i}]`);
          }

          for (let i = 0, ii = events.length; i < ii; ++i) {
            const event = events[i];
            el.dispatchEvent(event);
            assert.strictEqual(handler.calls.length, i + 4, 'handler.calls.length');
            assert.deepStrictEqual(handler.calls[i + 3], [event], `handler.calls[${i + 3}]`);
          }

          sut.dispose();

          for (let i = 0, ii = events.length; i < ii; ++i) {
            const event = events[i];
            el.dispatchEvent(event);
          }

          assert.strictEqual(handler.calls.length, 6, 'handler.calls.length');

          tearDown({ ctx, el });
        });
      }
    }
  }
});

describe('EventDelegator', function () {

  // it(`initializes with correct default element configurations`, function () {
  //   const sut = new EventDelegator();
  //   const lookup = sut.elementHandlerLookup;

  //   assert.strictEqual(lookup['INPUT']['value'].length, 2, `lookup['INPUT']['value'].length`);
  //   expect(lookup['INPUT']['value']).to.include('change');
  //   expect(lookup['INPUT']['value']).to.include('input');

  //   assert.strictEqual(lookup['INPUT']['checked'].length, 2, `lookup['INPUT']['checked'].length`);
  //   expect(lookup['INPUT']['checked']).to.include('change');
  //   expect(lookup['INPUT']['checked']).to.include('input');

  //   assert.strictEqual(lookup['INPUT']['files'].length, 2, `lookup['INPUT']['files'].length`);
  //   expect(lookup['INPUT']['files']).to.include('change');
  //   expect(lookup['INPUT']['files']).to.include('input');

  //   assert.strictEqual(lookup['TEXTAREA']['value'].length, 2, `lookup['TEXTAREA']['value'].length`);
  //   expect(lookup['TEXTAREA']['value']).to.include('change');
  //   expect(lookup['TEXTAREA']['value']).to.include('input');

  //   assert.strictEqual(lookup['SELECT']['value'].length, 1, `lookup['SELECT']['value'].length`);
  //   expect(lookup['SELECT']['value']).to.include('change');

  //   assert.strictEqual(lookup['content editable']['value'].length, 5, `lookup['content editable']['value'].length`);
  //   expect(lookup['content editable']['value']).to.include('change');
  //   expect(lookup['content editable']['value']).to.include('input');
  //   expect(lookup['content editable']['value']).to.include('blur');
  //   expect(lookup['content editable']['value']).to.include('keyup');
  //   expect(lookup['content editable']['value']).to.include('paste');

  //   assert.strictEqual(lookup['scrollable element']['scrollTop'].length, 1, `lookup['scrollable element']['scrollTop'].length`);
  //   expect(lookup['scrollable element']['scrollTop']).to.include('scroll');
  //   assert.strictEqual(lookup['scrollable element']['scrollLeft'].length, 1, `lookup['scrollable element']['scrollLeft'].length`);
  //   expect(lookup['scrollable element']['scrollLeft']).to.include('scroll');
  // });

  // it(`registerElementConfiguration() registers the configuration`, function () {
  //   const sut = new EventDelegator();
  //   sut.registerElementConfiguration({
  //     tagName: 'FOO',
  //     properties: {
  //       bar: ['baz']
  //     }
  //   });

  //   const lookup = sut.elementHandlerLookup;
  //   assert.strictEqual(lookup['FOO']['bar'].length, 1, `lookup['FOO']['bar'].length`);
  //   expect(lookup['FOO']['bar']).to.include('baz');
  // });

  // it(`registerElementConfiguration() does not register configuration from higher up the prototype chain`, function () {
  //   const sut = new EventDelegator();
  //   class ElementProperties {
  //     public bar: string[];
  //     constructor() {
  //       this.bar = ['baz'];
  //     }
  //   }
  //   ElementProperties.prototype['qux'] = ['quux'];
  //   sut.registerElementConfiguration({
  //     tagName: 'FOO',
  //     properties: new ElementProperties() as any
  //   });

  //   const lookup = sut.elementHandlerLookup;
  //   assert.strictEqual(lookup['FOO']['bar'].length, 1, `lookup['FOO']['bar'].length`);
  //   expect(lookup['FOO']['bar']).to.include('baz');
  // });

  // describe(`getElementHandler()`, function () {
  //   const sut = new EventDelegator();
  //   const lookup = sut.elementHandlerLookup;

  //   for (let tagName in lookup) {
  //     let expectedEventNames: string[];
  //     let propertyNames: string[];
  //     switch (tagName) {
  //       case 'content editable':
  //         tagName = 'div';
  //         propertyNames = ['textContent', 'innerHTML'];
  //         expectedEventNames = ['change', 'input', 'blur', 'keyup', 'paste'];
  //         break;
  //       case 'scrollable element':
  //         tagName = 'div';
  //         propertyNames = ['scrollTop', 'scrollLeft'];
  //         expectedEventNames = ['scroll'];
  //         break;
  //       default:
  //         propertyNames = Object.keys(lookup[tagName]);
  //     }
  //     for (const propertyName of propertyNames) {
  //       if (expectedEventNames === undefined) {
  //         expectedEventNames = lookup[tagName][propertyName];
  //       }
  //       it(_`tagName=${tagName}, propertyName=${propertyName} returns handler with eventNames=${expectedEventNames}`, function () {
  //         const handler = sut.getElementHandler(ctx.dom, ctx.createElement(`<${tagName}></${tagName}>`), propertyName);
  //         assert.deepStrictEqual(handler['events'], expectedEventNames, `handler['events']`);
  //       });
  //     }
  //   }

  //   it(`returns null if the target does not have a tagName`, function () {
  //     const text = ctx.doc.createTextNode('asdf');
  //     const handler = sut.getElementHandler(ctx.dom, text, 'textContent');
  //     assert.strictEqual(handler, null, `handler`);
  //   });

  //   it(`returns null if the property does not exist in the configuration`, function () {
  //     const el = ctx.createElement('<input></input>');
  //     let handler = sut.getElementHandler(ctx.dom, el, 'value');
  //     assert.notStrictEqual(handler, null, `handler`);
  //     handler = sut.getElementHandler(ctx.dom, el, 'value1');
  //     assert.strictEqual(handler, null, `handler`);
  //   });
  // });

  describe('addEventListener()', function () {
    function createFixture(
      eventName: string,
      listener: EventListenerOrEventListenerObject,
      bubbles: boolean,
      stopPropagation: boolean,
      returnValue: any,
      opts: AddEventListenerOptions,
      shadow: string) {

      const ctx = TestContext.create();

      const childHandlerPath: ReturnType<typeof eventPropertiesShallowClone>[] = [];
      const parentHandlerPath: ReturnType<typeof eventPropertiesShallowClone>[] = [];
      const childHandler = function (e: UIEvent) {
        childHandlerPath.push(eventPropertiesShallowClone(e));
        if (stopPropagation) {
          e.stopPropagation();
        }
        return returnValue;
      };
      const parentHandler = function (e: UIEvent) {
        parentHandlerPath.push(eventPropertiesShallowClone(e));
        if (stopPropagation) {
          e.stopPropagation();
        }
        return returnValue;
      };
      let childListener: EventListenerOrEventListenerObject;
      let parentListener: EventListenerOrEventListenerObject;
      if (listener == null) {
        childListener = childHandler;
        parentListener = parentHandler;
      } else {
        childListener = { handleEvent: childHandler };
        parentListener = { handleEvent: parentHandler };
      }

      const sut = new EventDelegator();
      const wrapper = ctx.createElement('div');
      const parentEl = ctx.createElement('parent-div');
      const childEl = ctx.createElement('child-div');
      const parentSubscription = sut.addEventListener(ctx.doc, parentEl, eventName, parentListener, opts);
      const childSubscription = sut.addEventListener(ctx.doc, childEl, eventName, childListener, opts);
      parentEl.appendChild(childEl);
      if (shadow !== null) {
        const shadowRoot = wrapper.attachShadow({ mode: shadow } as any);
        shadowRoot.appendChild(parentEl);
      } else {
        wrapper.appendChild(parentEl);
      }
      ctx.doc.body.appendChild(wrapper);
      const event = new ctx.UIEvent(eventName, {
        bubbles,
        cancelable: true,
        view: ctx.wnd
      });
      return { ctx, sut, wrapper, parentEl, childEl, parentSubscription, childSubscription, childListener, parentListener, childHandlerPath, parentHandlerPath, event };
    }

    function tearDown({ ctx, wrapper, parentSubscription, childSubscription }: Partial<ReturnType<typeof createFixture>>) {
      parentSubscription.dispose();
      childSubscription.dispose();
      ctx.doc.body.removeChild(wrapper);
    }

    // jsdom supports ShadowDOM, so if element is not defined (meaning we're in jsdom), test ShadowDOM features
    const hasShadow = typeof Element === 'undefined' || Element.prototype.attachShadow !== undefined;
    for (const eventName of ['click']) {
      for (const bubbles of [true, false]) {
        for (const opts of [{ capture: true }, { capture: false }] as AddEventListenerOptions[]) {
          for (const stopPropagation of [true, false]) {
            for (const returnValue of [true, false, undefined]) {
              for (const shadow of hasShadow ? [null, 'open', 'closed'] : [null]) { // TODO: 'open' should probably work in some way, so we need to try and fix this
                for (const listenerObj of [null, { handleEvent: null }]) {
                  it(_`opts=${opts}, eventName=${eventName}, bubbles=${bubbles}, stopPropagation=${stopPropagation}, returnValue=${returnValue}, shadow=${shadow}, listener=${listenerObj}`, function () {
                    const {
                      ctx,
                      wrapper,
                      parentEl,
                      childEl,
                      parentSubscription,
                      childSubscription,
                      parentHandlerPath,
                      childHandlerPath,
                      event
                    } = createFixture(eventName, listenerObj, bubbles, stopPropagation, returnValue, opts, shadow);

                    childEl.dispatchEvent(event);

                    if (opts.capture === true) {
                      if (shadow == null) {
                        assert.strictEqual(parentHandlerPath.length, 1, 'parentHandlerPath.length');
                        assert.strictEqual(parentHandlerPath[0].eventPhase, CAPTURING_PHASE, 'eventPhase');
                        assert.strictEqual(parentHandlerPath[0].target.nodeName, 'CHILD-DIV', `parentHandlerPath[0].target.nodeName`);
                        assert.strictEqual(parentHandlerPath[0].currentTarget, ctx.doc, `parentHandlerPath[0].currentTarget`);
                        if (stopPropagation) {
                          assert.strictEqual(childHandlerPath.length, 0, 'childHandlerPath.length');
                        } else {
                          assert.strictEqual(childHandlerPath.length, 1, 'childHandlerPath.length');
                          assert.strictEqual(childHandlerPath[0].eventPhase, CAPTURING_PHASE, 'eventPhase');
                          assert.strictEqual(childHandlerPath[0].target.nodeName, 'CHILD-DIV', `childHandlerPath[0].target.nodeName`);
                          assert.strictEqual(childHandlerPath[0].currentTarget, ctx.doc, `childHandlerPath[0].currentTarget`);
                        }
                      } else {
                        assert.strictEqual(parentHandlerPath.length, 0, 'parentHandlerPath.length');
                        assert.strictEqual(childHandlerPath.length, 0, 'childHandlerPath.length');
                      }
                    } else {
                      if (bubbles && shadow == null) {
                        assert.strictEqual(childHandlerPath.length, 1, 'childHandlerPath.length');
                        assert.strictEqual(childHandlerPath[0].eventPhase, BUBBLING_PHASE, 'eventPhase');
                        assert.strictEqual(childHandlerPath[0].target.nodeName, 'CHILD-DIV', `childHandlerPath[0].target.nodeName`);
                        assert.strictEqual(childHandlerPath[0].currentTarget, ctx.doc, `childHandlerPath[0].currentTarget`);
                        if (stopPropagation) {
                          assert.strictEqual(parentHandlerPath.length, 0, 'parentHandlerPath.length');
                        } else {
                          assert.strictEqual(parentHandlerPath.length, 1, 'parentHandlerPath.length');
                          assert.strictEqual(parentHandlerPath[0].eventPhase, BUBBLING_PHASE, 'eventPhase');
                          assert.strictEqual(parentHandlerPath[0].target.nodeName, 'CHILD-DIV', `parentHandlerPath[0].target.nodeName`);
                          assert.strictEqual(parentHandlerPath[0].currentTarget, ctx.doc, `parentHandlerPath[0].currentTarget`);
                        }
                      } else {
                        assert.strictEqual(childHandlerPath.length, 0, 'childHandlerPath.length');
                        assert.strictEqual(parentHandlerPath.length, 0, 'parentHandlerPath.length');
                      }
                    }

                    childHandlerPath.splice(0);
                    parentHandlerPath.splice(0);

                    parentEl.dispatchEvent(event);

                    if (opts.capture === true) {
                      assert.strictEqual(childHandlerPath.length, 0, 'childHandlerPath.length');
                      if (shadow == null) {
                        assert.strictEqual(parentHandlerPath.length, 1, 'parentHandlerPath.length');
                        assert.strictEqual(parentHandlerPath[0].eventPhase, CAPTURING_PHASE, 'eventPhase');
                        assert.strictEqual(parentHandlerPath[0].target.nodeName, 'PARENT-DIV', `parentHandlerPath[0].target.nodeName`);
                        assert.strictEqual(parentHandlerPath[0].currentTarget, ctx.doc, `parentHandlerPath[0].currentTarget`);
                      } else {
                        assert.strictEqual(parentHandlerPath.length, 0, 'parentHandlerPath.length');
                      }
                    } else {
                      assert.strictEqual(childHandlerPath.length, 0, 'childHandlerPath.length');
                      if (bubbles && shadow == null) {
                        assert.strictEqual(parentHandlerPath.length, 1, 'parentHandlerPath.length');
                        assert.strictEqual(parentHandlerPath[0].eventPhase, BUBBLING_PHASE, 'eventPhase');
                        assert.strictEqual(parentHandlerPath[0].target.nodeName, 'PARENT-DIV', `parentHandlerPath[0].target.nodeName`);
                        assert.strictEqual(parentHandlerPath[0].currentTarget, ctx.doc, `parentHandlerPath[0].currentTarget`);
                      } else {
                        assert.strictEqual(parentHandlerPath.length, 0, 'parentHandlerPath.length');
                      }
                    }

                    tearDown({ ctx, wrapper, parentSubscription, childSubscription });
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
