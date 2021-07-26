import { DI } from '@aurelia/kernel';
import type { NodeObserverConfig } from './observer-locator';
import type { IDisposable } from '@aurelia/kernel';

const defaultOptions: AddEventListenerOptions = {
  capture: false,
};

class ListenerTracker implements IDisposable {
  private _count: number = 0;
  private readonly _captureLookups: Map<EventTarget, Record<string, EventListenerOrEventListenerObject | undefined>> = new Map();
  private readonly _bubbleLookups: Map<EventTarget, Record<string, EventListenerOrEventListenerObject | undefined>> = new Map();

  public constructor(
    private readonly _publisher: EventTarget,
    private readonly _eventName: string,
    private readonly _options: AddEventListenerOptions = defaultOptions,
  ) {}

  public _increment(): void {
    if (++this._count === 1) {
      this._publisher.addEventListener(this._eventName, this, this._options);
    }
  }

  public _decrement(): void {
    if (--this._count === 0) {
      this._publisher.removeEventListener(this._eventName, this, this._options);
    }
  }

  public dispose(): void {
    if (this._count > 0) {
      this._count = 0;
      this._publisher.removeEventListener(this._eventName, this, this._options);
    }
    this._captureLookups.clear();
    this._bubbleLookups.clear();
  }

  public _getLookup(target: EventTarget): Record<string, EventListenerOrEventListenerObject | undefined> {
    const lookups = this._options.capture === true ? this._captureLookups : this._bubbleLookups;
    let lookup = lookups.get(target);
    if (lookup === void 0) {
      lookups.set(target, lookup = Object.create(null) as Record<string, EventListenerOrEventListenerObject | undefined>);
    }
    return lookup;
  }

  public handleEvent(event: Event): void {
    const lookups = this._options.capture === true ? this._captureLookups : this._bubbleLookups;
    const path = event.composedPath();
    if (this._options.capture === true) {
      path.reverse();
    }
    for (const target of path) {
      const lookup = lookups.get(target);
      if (lookup === void 0) {
        continue;
      }
      const listener = lookup[this._eventName];
      if (listener === void 0) {
        continue;
      }
      if (typeof listener === 'function') {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
      if (event.cancelBubble === true) {
        return;
      }
    }
  }
}

/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
class DelegateSubscription implements IDisposable {
  public constructor(
    private readonly _tracker: ListenerTracker,
    private readonly _lookup: Record<string, EventListenerOrEventListenerObject | undefined>,
    private readonly _eventName: string,
    callback: EventListenerOrEventListenerObject
  ) {
    _tracker._increment();
    _lookup[_eventName] = callback;
  }

  public dispose(): void {
    this._tracker._decrement();
    this._lookup[this._eventName] = void 0;
  }
}

export class EventSubscriber {
  private target: EventTarget | null = null;
  private handler: EventListenerOrEventListenerObject | null = null;

  public constructor(
    public readonly config: NodeObserverConfig,
  ) {}

  public subscribe(node: EventTarget, callbackOrListener: EventListenerOrEventListenerObject): void {
    this.target = node;
    this.handler = callbackOrListener;
    let event: string;
    for (event of this.config.events) {
      node.addEventListener(event, callbackOrListener);
    }
  }

  public dispose(): void {
    const { target, handler } = this;
    let event: string;
    if (target !== null && handler !== null) {
      for (event of this.config.events) {
        target.removeEventListener(event, handler);
      }
    }

    this.target = this.handler = null!;
  }
}

export interface IEventDelegator extends EventDelegator {}
export const IEventDelegator = DI.createInterface<IEventDelegator>('IEventDelegator', x => x.singleton(EventDelegator));

export class EventDelegator implements IDisposable {
  /** @internal */
  private readonly _trackerMaps: Record<string, Map<EventTarget, ListenerTracker> | undefined> = Object.create(null);

  public addEventListener(
    publisher: EventTarget,
    target: Node,
    eventName: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions,
  ): IDisposable {
    const trackerMap = this._trackerMaps[eventName] ??= new Map<EventTarget, ListenerTracker>();
    let tracker = trackerMap.get(publisher);
    if (tracker === void 0) {
      trackerMap.set(publisher, tracker = new ListenerTracker(publisher, eventName, options));
    }
    return new DelegateSubscription(tracker, tracker._getLookup(target), eventName, listener);
  }

  public dispose(): void {
    for (const eventName in this._trackerMaps) {
      const trackerMap = this._trackerMaps[eventName]!;
      for (const tracker of trackerMap.values()) {
        tracker.dispose();
      }
      trackerMap.clear();
    }
  }
}
