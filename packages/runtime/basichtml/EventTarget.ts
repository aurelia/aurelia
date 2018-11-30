import { Event } from './Event';

const getHandler = (self: EventTarget, handler: EventListenerOrEventListenerObject) =>
  (handler as EventListenerObject).handleEvent ?
    e => (handler as EventListenerObject).handleEvent(e) :
    e => (handler as Function).call(self, e);

const getOnce = (self, type, handler, options) =>
  e => {
    self.removeEventListener(type, handler, options);
    getHandler(self, handler)(e);
  };

// interface EventTarget // https://dom.spec.whatwg.org/#eventtarget
export class EventTarget {

  private _eventTarget: Record<string, any>;

  constructor() {
    this._eventTarget = Object.create(null);
  }

  addEventListener(type: string, handler: EventListenerOrEventListenerObject, options: boolean | EventListenerOptions) {
    const listener = this._eventTarget[type] || (this._eventTarget[type] = {
      handlers: [],
      callbacks: []
    });
    const i = listener.handlers.indexOf(handler);
    if (i < 0) {
      listener.callbacks[listener.handlers.push(handler) - 1] =
        options && (options as any).once ?
          getOnce(this, type, handler, options) :
          getHandler(this, handler);
    }
  }

  removeEventListener(type, handler, options) {
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

};
