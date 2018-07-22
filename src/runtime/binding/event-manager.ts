import { IDisposable } from '../../kernel/interfaces';
import { DI } from '../../kernel/di';
import { INode, DOM } from '../dom';

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

class ListenerTracker {
  private count = 0;

  constructor(
    private eventName: string, 
    private listener: EventListenerOrEventListenerObject, 
    private capture: boolean
  ) { }

  increment() {
    this.count++;

    if (this.count === 1) {
      DOM.addEventListener(this.eventName, this.listener, null, this.capture);
    }
  }

  decrement() {
    this.count--;

    if (this.count === 0) {
      DOM.removeEventListener(this.eventName, this.listener, null, this.capture);
    }
  }
}

/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
class DelegateOrCaptureSubscription {
  constructor(
    public entry: ListenerTracker,
    public lookup: Record<string, EventListenerOrEventListenerObject>,
    public targetEvent: string,
    callback: EventListenerOrEventListenerObject
  ) {
    lookup[targetEvent] = callback;
  }

  dispose() {
    this.entry.decrement();
    this.lookup[this.targetEvent] = null;
  }
}

/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
class TriggerSubscription {
  constructor(
    public target: INode,
    public targetEvent: string,
    public callback: EventListenerOrEventListenerObject
  ) {
    DOM.addEventListener(targetEvent, callback, target);
  }

  dispose() {
    DOM.removeEventListener(this.targetEvent, this.callback, this.target);
  }
}

type EventTargetWithLookups = INode & {
  delegatedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
  capturedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
}

export enum DelegationStrategy {
  none = 0,
  capturing = 1,
  bubbling = 2
}

export interface IElementConfiguration {
  tagName: string;
  properties: Record<string, string[]>;
}

export interface IEventSubscriber extends IDisposable {
  subscribe(node: INode, callbackOrListener: EventListenerOrEventListenerObject): void;
}

export class EventSubscriber implements IEventSubscriber {
  private target: INode;
  private handler: EventListenerOrEventListenerObject;

  constructor(private readonly events: string[]) {
    this.events = events;
    this.target = null;
    this.handler = null;
  }

  subscribe(node: INode, callbackOrListener: EventListenerOrEventListenerObject) {
    this.target = node;
    this.handler = callbackOrListener;

    const add = DOM.addEventListener;
    const events = this.events;

    for (let i = 0, ii = events.length; ii > i; ++i) {
      add(events[i], callbackOrListener, node);
    }
  }

  dispose() {
    const node = this.target;
    const callbackOrListener = this.handler;
    const events = this.events;
    const remove = DOM.removeEventListener;

    for (let i = 0, ii = events.length; ii > i; ++i) {
      remove(events[i], callbackOrListener, node);
    }

    this.target = this.handler = null;
  }
}

export interface IEventManager {
  registerElementConfiguration(config: IElementConfiguration): void;
  getElementHandler(target: INode, propertyName: string): IEventSubscriber | null;
  addEventListener(target: INode, targetEvent: string, callbackOrListener: EventListenerOrEventListenerObject, delegate: DelegationStrategy): IDisposable;
}

export const IEventManager = DI.createInterface<IEventManager>()
  .withDefault(x => x.singleton(EventManager));

class EventManager implements IEventManager {
  elementHandlerLookup: Record<string, Record<string, string[]>> = {};
  delegatedHandlers: Record<string, ListenerTracker> = {};
  capturedHandlers: Record<string, ListenerTracker> = {};

  constructor() {
    this.registerElementConfiguration({
      tagName: 'input',
      properties: {
        value: ['change', 'input'],
        checked: ['change', 'input'],
        files: ['change', 'input']
      }
    });

    this.registerElementConfiguration({
      tagName: 'textarea',
      properties: {
        value: ['change', 'input']
      }
    });

    this.registerElementConfiguration({
      tagName: 'select',
      properties: {
        value: ['change']
      }
    });

    this.registerElementConfiguration({
      tagName: 'content editable',
      properties: {
        value: ['change', 'input', 'blur', 'keyup', 'paste']
      }
    });

    this.registerElementConfiguration({
      tagName: 'scrollable element',
      properties: {
        scrollTop: ['scroll'],
        scrollLeft: ['scroll']
      }
    });
  }

  registerElementConfiguration(config: IElementConfiguration) {
    let tagName = config.tagName.toLowerCase();
    let properties = config.properties;
    let lookup: Record<string, string[]> = this.elementHandlerLookup[tagName] = {};

    for (let propertyName in properties) {
      if (properties.hasOwnProperty(propertyName)) {
        lookup[propertyName] = properties[propertyName];
      }
    }
  }

  getElementHandler(target: INode, propertyName: string): IEventSubscriber | null {
    let name = target['tagName'];
    let lookup = this.elementHandlerLookup;

    if (name) {
      if (lookup[name] && lookup[name][propertyName]) {
        return new EventSubscriber(lookup[name][propertyName]);
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
    target: INode,
    targetEvent: string,
    callbackOrListener: EventListenerOrEventListenerObject,
    strategy: DelegationStrategy
  ) {
    let delegatedHandlers: Record<string, ListenerTracker> | undefined;
    let capturedHandlers: Record<string, ListenerTracker> | undefined;
    let handlerEntry: ListenerTracker | ListenerTracker | undefined;

    if (strategy === DelegationStrategy.bubbling) {
      delegatedHandlers = this.delegatedHandlers;
      
      handlerEntry = delegatedHandlers[targetEvent]
        || (delegatedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleDelegatedEvent, false));
      
      let delegatedCallbacks = (<EventTargetWithLookups>target).delegatedCallbacks 
        || ((<EventTargetWithLookups>target).delegatedCallbacks = {});

      return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
    }

    if (strategy === DelegationStrategy.capturing) {
      capturedHandlers = this.capturedHandlers;
      
      handlerEntry = capturedHandlers[targetEvent] 
        || (capturedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleCapturedEvent, true));
      
      let capturedCallbacks = (<EventTargetWithLookups>target).capturedCallbacks
        || ((<EventTargetWithLookups>target).capturedCallbacks = {});

      return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
    }

    return new TriggerSubscription(target, targetEvent, callbackOrListener);
  }
}
