import { Event } from './Event';

/**
 * Create an event handler that can be invoked multiple times
 */
const getHandler = (self: EventTarget, handler: EventListenerOrEventListenerObject) =>
  (handler as EventListenerObject).handleEvent ?
    e => (handler as EventListenerObject).handleEvent(e) :
    e => (handler as Function).call(self, e);

/**
 * Create a handler that will be invoked only once
 */
const getOnce = (
  self: EventTarget,
  type: string,
  handler: EventListenerOrEventListenerObject,
  options: IEventListenerOptions
) => e => {
  self.removeEventListener(type, handler, options);
  getHandler(self, handler)(e);
};

type IEventHandler = (e: Event) => void;

interface IEventHandlersMap {
  handlers: EventListenerOrEventListenerObject[];
  callbacks: IEventHandler[];
}

interface IEventListenerOptions {
  once: boolean;
}

// interface EventTarget // https://dom.spec.whatwg.org/#eventtarget
export class EventTarget {

  private _eventTarget: Record<string, IEventHandlersMap>;

  constructor() {
    this._eventTarget = Object.create(null);
  }

  addEventListener(type: string, handler: EventListenerOrEventListenerObject, options: boolean | IEventListenerOptions): void {
    const listener = this._eventTarget[type] || (this._eventTarget[type] = {
      handlers: [],
      callbacks: []
    });
    const i = listener.handlers.indexOf(handler);
    if (i < 0) {
      listener.callbacks[listener.handlers.push(handler) - 1] =
        options && (options as IEventListenerOptions).once ?
          getOnce(this, type, handler, options as IEventListenerOptions) :
          getHandler(this, handler);
    }
  }

  removeEventListener(type: string, handler: EventListenerOrEventListenerObject, options: boolean | IEventListenerOptions): void {
    const listener = this._eventTarget[type];
    if (listener) {
      const i = listener.handlers.indexOf(handler);
      if (-1 < i) {
        listener.handlers.splice(i, 1);
        listener.callbacks.splice(i, 1);
        if (listener.handlers.length < 1) {
          delete this._eventTarget[type];
        }
      }
    }
  }

  dispatchEvent(event: Event) {
    const type = event.type;
    let node = this;
    if (!event.target) event.target = node;
    if (!event.currentTarget) event.currentTarget = node;
    event.eventPhase = Event.AT_TARGET;
    do {
      if (type in node._eventTarget) {
        node._eventTarget[type].callbacks.some(
          cb => (cb(event), event.cancelImmediateBubble)
        );
      }
      event.eventPhase = Event.BUBBLING_PHASE;
    } while (event.bubbles && !event.cancelBubble && (node = (node as any).parentNode));
  }
}
