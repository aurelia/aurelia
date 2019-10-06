import { DI, IDisposable } from '@aurelia/kernel';
import { DelegationStrategy, IDOM } from '@aurelia/runtime';

export interface IManagedEvent extends Event {
  propagationStopped?: boolean;
  // legacy
  path?: EventTarget[];
  standardStopPropagation?(): void;
  // old composedPath
  deepPath?(): EventTarget[];
}

// Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
/** @internal */
export function findOriginalEventTarget(event: IManagedEvent): EventTarget {
  return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
}

function stopPropagation(this: IManagedEvent): void {
  this.standardStopPropagation!();
  this.propagationStopped = true;
}

function handleCapturedEvent(event: IManagedEvent): void {
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
    target = target.parentNode!;
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

function handleDelegatedEvent(event: IManagedEvent): void {
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
    target = target.parentNode!;
  }
}

export class ListenerTracker {
  private readonly dom: IDOM;
  private readonly capture: boolean;
  private readonly eventName: string;
  private readonly listener: EventListenerOrEventListenerObject;
  private count: number;

  public constructor(dom: IDOM, eventName: string, listener: EventListenerOrEventListenerObject, capture: boolean) {
    this.dom = dom;
    this.capture = capture;
    this.count = 0;
    this.eventName = eventName;
    this.listener = listener;
  }

  public increment(): void {
    this.count++;
    if (this.count === 1) {
      this.dom.addEventListener(this.eventName, this.listener, null, this.capture);
    }
  }

  public decrement(): void {
    this.count--;
    if (this.count === 0) {
      this.dom.removeEventListener(this.eventName, this.listener, null, this.capture);
    }
  }

  /* @internal */
  public dispose(): void {
    if (this.count > 0) {
      this.count = 0;
      this.dom.removeEventListener(this.eventName, this.listener, null, this.capture);
    }
  }
}

/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
export class DelegateOrCaptureSubscription implements IDisposable {
  public entry: { decrement(): void };
  public lookup: Record<string, EventListenerOrEventListenerObject>;
  public targetEvent: string;

  public constructor(
    entry: { decrement(): void },
    lookup: Record<string, EventListenerOrEventListenerObject>,
    targetEvent: string,
    callback: EventListenerOrEventListenerObject
  ) {
    this.entry = entry;
    this.lookup = lookup;
    this.targetEvent = targetEvent;
    lookup[targetEvent] = callback;
  }

  public dispose(): void {
    this.entry.decrement();
    this.lookup[this.targetEvent] = null!;
  }
}

/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
export class TriggerSubscription implements IDisposable {
  public target: Node;
  public targetEvent: string;
  public callback: EventListenerOrEventListenerObject;
  private readonly dom: IDOM;

  public constructor(
    dom: IDOM,
    target: Node,
    targetEvent: string,
    callback: EventListenerOrEventListenerObject
  ) {
    this.dom = dom;
    this.target = target;
    this.targetEvent = targetEvent;
    this.callback = callback;
    dom.addEventListener(targetEvent, callback, target);
  }

  public dispose(): void {
    this.dom.removeEventListener(this.targetEvent, this.callback, this.target);
  }
}

export interface  IEventTargetWithLookups extends Node {
  delegatedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
  capturedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
}

export interface IElementConfiguration {
  tagName: string;
  properties: Record<string, string[]>;
}

export interface IEventSubscriber extends IDisposable {
  subscribe(node: Node, callbackOrListener: EventListenerOrEventListenerObject): void;
}

export class EventSubscriber implements IEventSubscriber {
  private readonly dom: IDOM;
  private readonly events: string[];
  private target: Node;
  private handler: EventListenerOrEventListenerObject;

  public constructor(dom: IDOM, events: string[]) {
    this.dom = dom;
    this.events = events;
    this.target = null!;
    this.handler = null!;
  }

  public subscribe(node: Node, callbackOrListener: EventListenerOrEventListenerObject): void {
    this.target = node;
    this.handler = callbackOrListener;

    const add = this.dom.addEventListener;
    const events = this.events;

    for (let i = 0, ii = events.length; ii > i; ++i) {
      add(events[i], callbackOrListener, node);
    }
  }

  public dispose(): void {
    const node = this.target;
    const callbackOrListener = this.handler;
    const events = this.events;
    const dom = this.dom;

    for (let i = 0, ii = events.length; ii > i; ++i) {
      dom.removeEventListener(events[i], callbackOrListener, node);
    }

    this.target = this.handler = null!;
  }
}

export type EventSubscription = DelegateOrCaptureSubscription | TriggerSubscription;

export interface IEventManager extends IDisposable {
  addEventListener(dom: IDOM, target: Node, targetEvent: string, callbackOrListener: EventListenerOrEventListenerObject, delegate: DelegationStrategy): IDisposable;
}

export const IEventManager = DI.createInterface<IEventManager>('IEventManager').withDefault(x => x.singleton(EventManager));

/** @internal */
export class EventManager implements IEventManager {
  public readonly delegatedHandlers: Record<string, ListenerTracker> = {};
  public readonly capturedHandlers: Record<string, ListenerTracker> = {};

  public constructor() {
    this.delegatedHandlers = {};
    this.capturedHandlers = {};
  }

  public addEventListener(
    dom: IDOM,
    target: IEventTargetWithLookups,
    targetEvent: string,
    callbackOrListener: EventListenerOrEventListenerObject,
    strategy: DelegationStrategy
  ): EventSubscription {
    let delegatedHandlers: Record<string, ListenerTracker> | undefined;
    let capturedHandlers: Record<string, ListenerTracker> | undefined;
    let handlerEntry: ListenerTracker | undefined;

    if (strategy === DelegationStrategy.bubbling) {
      delegatedHandlers = this.delegatedHandlers;
      handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new ListenerTracker(dom, targetEvent, handleDelegatedEvent, false));
      handlerEntry.increment();
      const delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
      return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
    }
    if (strategy === DelegationStrategy.capturing) {
      capturedHandlers = this.capturedHandlers;
      handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new ListenerTracker(dom, targetEvent, handleCapturedEvent, true));
      handlerEntry.increment();
      const capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});
      return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
    }
    return new TriggerSubscription(dom, target, targetEvent, callbackOrListener);
  }

  public dispose(): void {
    let key: string;
    const { delegatedHandlers, capturedHandlers } = this;
    for (key in delegatedHandlers) {
      delegatedHandlers[key].dispose();
    }
    for (key in capturedHandlers) {
      capturedHandlers[key].dispose();
    }
  }
}
