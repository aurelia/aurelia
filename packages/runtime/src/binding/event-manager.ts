import { DI, IDisposable } from '../../kernel';
import { DOM, INode } from '../dom';

export interface IEventWithStandardPropagation extends Event {
  propagationStopped?: boolean;
  standardStopPropagation?: Event['stopPropagation'];
}

/*@internal*/
export type CompatibleEvent = {
  target?: EventTarget;

  // legacy
  path?: EventTarget[];

  // old composedPath
  deepPath?(): EventTarget[];

  // current spec
  composedPath?(): EventTarget[];
};

//Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
/*@internal*/
export function findOriginalEventTarget(event: Event & CompatibleEvent): EventTarget {
  return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
}

function stopPropagation(this: IEventWithStandardPropagation): void {
  this.standardStopPropagation();
  this.propagationStopped = true;
}

function handleCapturedEvent(event: IEventWithStandardPropagation): void {
  event.propagationStopped = false;
  let target: IEventTargetWithLookups = findOriginalEventTarget(event) as EventTarget & IEventTargetWithLookups;
  const orderedCallbacks = [];
  /**
   * During capturing phase, event 'bubbles' down from parent. Needs to reorder callback from root down to target
   */
  while (target) {
    if (target.capturedCallbacks) {
      const callback = target.capturedCallbacks[event.type];
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
    const orderedCallback = orderedCallbacks[i];
    if ('handleEvent' in orderedCallback) {
      orderedCallback.handleEvent(event);
    } else {
      orderedCallback(event);
    }
  }
}

function handleDelegatedEvent(event: IEventWithStandardPropagation): void {
  event.propagationStopped = false;
  let target: IEventTargetWithLookups = findOriginalEventTarget(event) as EventTarget & IEventTargetWithLookups;
  while (target && !event.propagationStopped) {
    if (target.delegatedCallbacks) {
      const callback = target.delegatedCallbacks[event.type];
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

export class ListenerTracker {
  private count: number = 0;

  constructor(
    private eventName: string,
    private listener: EventListenerOrEventListenerObject,
    private capture: boolean
  ) { }

  public increment(): void {
    this.count++;
    if (this.count === 1) {
      DOM.addEventListener(this.eventName, this.listener, null, this.capture);
    }
  }

  public decrement(): void {
    this.count--;
    if (this.count === 0) {
      DOM.removeEventListener(this.eventName, this.listener, null, this.capture);
    }
  }
}

/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
export class DelegateOrCaptureSubscription {
  constructor(
    public entry: ListenerTracker,
    public lookup: Record<string, EventListenerOrEventListenerObject>,
    public targetEvent: string,
    callback: EventListenerOrEventListenerObject
  ) {
    lookup[targetEvent] = callback;
  }

  public dispose(): void {
    this.entry.decrement();
    this.lookup[this.targetEvent] = null;
  }
}

/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
export class TriggerSubscription {
  constructor(
    public target: INode,
    public targetEvent: string,
    public callback: EventListenerOrEventListenerObject
  ) {
    DOM.addEventListener(targetEvent, callback, target);
  }

  public dispose(): void {
    DOM.removeEventListener(this.targetEvent, this.callback, this.target);
  }
}

export interface  IEventTargetWithLookups extends INode {
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

  public subscribe(node: INode, callbackOrListener: EventListenerOrEventListenerObject): void {
    this.target = node;
    this.handler = callbackOrListener;

    const add = DOM.addEventListener;
    const events = this.events;

    for (let i = 0, ii = events.length; ii > i; ++i) {
      add(events[i], callbackOrListener, node);
    }
  }

  public dispose(): void {
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

export type EventSubscription = DelegateOrCaptureSubscription | TriggerSubscription;

export interface IEventManager {
  registerElementConfiguration(config: IElementConfiguration): void;
  getElementHandler(target: INode, propertyName: string): IEventSubscriber | null;
  addEventListener(target: INode, targetEvent: string, callbackOrListener: EventListenerOrEventListenerObject, delegate: DelegationStrategy): IDisposable;
}

export const IEventManager = DI.createInterface<IEventManager>()
  .withDefault(x => x.singleton(EventManager));

/*@internal*/
export class EventManager implements IEventManager {
  public elementHandlerLookup: Record<string, Record<string, string[]>> = {};
  public delegatedHandlers: Record<string, ListenerTracker> = {};
  public capturedHandlers: Record<string, ListenerTracker> = {};

  constructor() {
    this.registerElementConfiguration({
      tagName: 'INPUT',
      properties: {
        value: ['change', 'input'],
        checked: ['change', 'input'],
        files: ['change', 'input']
      }
    });
    this.registerElementConfiguration({
      tagName: 'TEXTAREA',
      properties: {
        value: ['change', 'input']
      }
    });
    this.registerElementConfiguration({
      tagName: 'SELECT',
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

  public registerElementConfiguration(config: IElementConfiguration): void {
    const properties = config.properties;
    const lookup: Record<string, string[]> = this.elementHandlerLookup[config.tagName] = {};

    for (const propertyName in properties) {
      if (properties.hasOwnProperty(propertyName)) {
        lookup[propertyName] = properties[propertyName];
      }
    }
  }

  public getElementHandler(target: INode, propertyName: string): IEventSubscriber | null {
    const tagName = target['tagName'];
    const lookup = this.elementHandlerLookup;

    if (tagName) {
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

  public addEventListener(
    target: IEventTargetWithLookups,
    targetEvent: string,
    callbackOrListener: EventListenerOrEventListenerObject,
    strategy: DelegationStrategy
  ): EventSubscription {
    let delegatedHandlers: Record<string, ListenerTracker> | undefined;
    let capturedHandlers: Record<string, ListenerTracker> | undefined;
    let handlerEntry: ListenerTracker | ListenerTracker | undefined;

    if (strategy === DelegationStrategy.bubbling) {
      delegatedHandlers = this.delegatedHandlers;
      handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleDelegatedEvent, false));
      handlerEntry.increment();
      const delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
      return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
    }
    if (strategy === DelegationStrategy.capturing) {
      capturedHandlers = this.capturedHandlers;
      handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleCapturedEvent, true));
      handlerEntry.increment();
      const capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});
      return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
    }
    return new TriggerSubscription(target, targetEvent, callbackOrListener);
  }
}
