import { DOM } from '../dom';
import { IDisposable, IEventSubscriber, IEventManager, IDelegationStrategy } from './binding-interfaces';

//Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
function findOriginalEventTarget(event: any) {
  return (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
}

function stopPropagation() {
  this.standardStopPropagation();
  this.propagationStopped = true;
}

function handleCapturedEvent(event: Event & { propagationStopped?: boolean; standardStopPropagation?: Event['stopPropagation'] }) {
  event.propagationStopped = false;
  let target = findOriginalEventTarget(event);

  let orderedCallbacks = [];
  /**
   * During capturing phase, event 'bubbles' down from parent. Needs to reorder callback from root down to target
   */
  while (target) {
    if (target.capturedCallbacks) {
      let callback = target.capturedCallbacks[event.type];
      if (callback) {
        if (event.stopPropagation !== stopPropagation) {
          event.standardStopPropagation = event.stopPropagation;
          event.stopPropagation = stopPropagation;
        }
        orderedCallbacks.push(callback);
      }
    }
    target = target.parentNode;
  }
  for (let i = orderedCallbacks.length - 1; i >= 0 && !event.propagationStopped; i--) {
    let orderedCallback = orderedCallbacks[i];
    if ('handleEvent' in orderedCallback) {
      orderedCallback.handleEvent(event);
    } else {
      orderedCallback(event);
    }
  }
}

class CapturedHandlerEntry {
  count = 0;

  constructor(private eventName: string) {
    this.eventName = eventName;
  }

  increment() {
    this.count++;

    if (this.count === 1) {
      DOM.addEventListener(this.eventName, handleCapturedEvent, true);
    }
  }

  decrement() {
    this.count--;

    if (this.count === 0) {
      DOM.removeEventListener(this.eventName, handleCapturedEvent, true);
    }
  }
}

function handleDelegatedEvent(event: Event & { propagationStopped?: boolean; standardStopPropagation?: Event['stopPropagation'] }) {
  event.propagationStopped = false;
  let target = findOriginalEventTarget(event);

  while (target && !event.propagationStopped) {
    if (target.delegatedCallbacks) {
      let callback = target.delegatedCallbacks[event.type];
      if (callback) {
        if (event.stopPropagation !== stopPropagation) {
          event.standardStopPropagation = event.stopPropagation;
          event.stopPropagation = stopPropagation;
        }
        if ('handleEvent' in callback) {
          callback.handleEvent(event);
        } else {
          callback(event);
        }
      }
    }

    target = target.parentNode;
  }
}

class DelegatedHandlerEntry {
  private count = 0;

  constructor(
    private eventName: string
  ) {
  }

  increment() {
    this.count++;

    if (this.count === 1) {
      DOM.addEventListener(this.eventName, handleDelegatedEvent, false);
    }
  }

  decrement() {
    this.count--;

    if (this.count === 0) {
      DOM.removeEventListener(this.eventName, handleDelegatedEvent);
    }
  }
}

interface IAureliaEventTarget extends EventTarget {
  delegatedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
  capturedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
}

interface IEventStrategy {
  subscribe(
    target: IAureliaEventTarget,
    targetEvent: string,
    callback: EventListenerOrEventListenerObject,
    strategy: IDelegationStrategy[keyof IDelegationStrategy]
  ): IDisposable;
}

/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
class DelegationEntryHandler {
  constructor(
    public entry: DelegatedHandlerEntry | CapturedHandlerEntry,
    public lookup: Record<string, EventListenerOrEventListenerObject>,
    public targetEvent: string,
    callback: EventListenerOrEventListenerObject
  ) {
    lookup[targetEvent] = callback;
  }

  dispose() {
    this.entry.decrement();
    this.lookup[this.targetEvent] = null;
    this.entry = this.lookup = this.targetEvent = null;
  }
}

/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
class EventHandler {
  constructor(
    public target: EventTarget,
    public targetEvent: string,
    public callback: EventListenerOrEventListenerObject
  ) {
    target.addEventListener(targetEvent, callback);
  }

  dispose() {
    this.target.removeEventListener(this.targetEvent, this.callback);
    this.target = this.targetEvent = this.callback = null;
  }
}

class DefaultEventStrategy implements IEventStrategy {
  delegatedHandlers: Record<string, DelegatedHandlerEntry> = {};
  capturedHandlers: Record<string, CapturedHandlerEntry> = {};

  subscribe(
    target: IAureliaEventTarget,
    targetEvent: string,
    callback: EventListenerOrEventListenerObject,
    strategy: IDelegationStrategy[keyof IDelegationStrategy]
  ) {

    let delegatedHandlers: Record<string, DelegatedHandlerEntry> | undefined;
    let capturedHandlers: Record<string, CapturedHandlerEntry> | undefined;
    let handlerEntry: DelegatedHandlerEntry | CapturedHandlerEntry | undefined;

    if (strategy === delegationStrategy.bubbling) {
      delegatedHandlers = this.delegatedHandlers;
      handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new DelegatedHandlerEntry(targetEvent));
      let delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});

      return new DelegationEntryHandler(handlerEntry, delegatedCallbacks, targetEvent, callback);
    }
    if (strategy === delegationStrategy.capturing) {
      capturedHandlers = this.capturedHandlers;
      handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new CapturedHandlerEntry(targetEvent));
      let capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});

      return new DelegationEntryHandler(handlerEntry, capturedCallbacks, targetEvent, callback);
    }

    return new EventHandler(target, targetEvent, callback);
  }
}

export const delegationStrategy: IDelegationStrategy = {
  none: 0,
  capturing: 1,
  bubbling: 2
};


export interface IElementEventHandlerConfig extends Record<string, Record<string, string[]>> { }

export class EventManager implements IEventManager {
  public static instance = new EventManager();

  elementHandlerLookup: IElementEventHandlerConfig = {};
  eventStrategyLookup: Record<string, IEventStrategy> = {};
  defaultEventStrategy = new DefaultEventStrategy();

  constructor() {
    this.registerElementConfig({
      tagName: 'input',
      properties: {
        value: ['change', 'input'],
        checked: ['change', 'input'],
        files: ['change', 'input']
      }
    });

    this.registerElementConfig({
      tagName: 'textarea',
      properties: {
        value: ['change', 'input']
      }
    });

    this.registerElementConfig({
      tagName: 'select',
      properties: {
        value: ['change']
      }
    });

    this.registerElementConfig({
      tagName: 'content editable',
      properties: {
        value: ['change', 'input', 'blur', 'keyup', 'paste']
      }
    });

    this.registerElementConfig({
      tagName: 'scrollable element',
      properties: {
        scrollTop: ['scroll'],
        scrollLeft: ['scroll']
      }
    });
  }

  registerElementConfig(config: { tagName: string, properties: Record<string, string[]> }) {
    let tagName = config.tagName.toLowerCase();
    let properties = config.properties;
    let propertyName;

    let lookup: Record<string, string[]> = this.elementHandlerLookup[tagName] = {};

    for (propertyName in properties) {
      if (properties.hasOwnProperty(propertyName)) {
        lookup[propertyName] = properties[propertyName];
      }
    }
  }

  registerEventStrategy(eventName: string, strategy: IEventStrategy) {
    this.eventStrategyLookup[eventName] = strategy;
  }

  getElementHandler(target: Element, propertyName: string): EventSubscriber | null {
    let tagName;
    let lookup = this.elementHandlerLookup;

    if (target.tagName) {
      tagName = target.tagName.toLowerCase();

      if (lookup[tagName] && lookup[tagName][propertyName]) {
        return new EventSubscriber(lookup[tagName][propertyName]);
      }

      if (propertyName === 'textContent' || propertyName === 'innerHTML') {
        return new EventSubscriber(lookup['content editable'].value);
      }

      if (propertyName === 'scrollTop' || propertyName === 'scrollLeft') {
        return new EventSubscriber(lookup['scrollable element'][propertyName]);
      }
    }

    return null;
  }

  addEventListener(
    target: EventTarget,
    targetEvent: string,
    callbackOrListener: EventListenerOrEventListenerObject,
    delegate: IDelegationStrategy[keyof IDelegationStrategy]
  ) {
    return (this.eventStrategyLookup[targetEvent] || this.defaultEventStrategy)
      .subscribe(target, targetEvent, callbackOrListener, delegate);
  }
}

export class EventSubscriber implements IEventSubscriber {

  private target: EventTarget;
  private handler: EventListenerOrEventListenerObject;

  constructor(public readonly events: string[]) {
    this.events = events;
    this.target = null;
    this.handler = null;
  }

  subscribe(element: EventTarget, callbackOrListener: EventListenerOrEventListenerObject) {
    this.target = element;
    this.handler = callbackOrListener;

    let events = this.events;
    for (let i = 0, ii = events.length; ii > i; ++i) {
      element.addEventListener(events[i], callbackOrListener);
    }
  }

  dispose() {
    let element = this.target;
    let callbackOrListener = this.handler;
    let events = this.events;
    for (let i = 0, ii = events.length; ii > i; ++i) {
      element.removeEventListener(events[i], callbackOrListener);
    }
    this.target = this.handler = null;
  }
}
