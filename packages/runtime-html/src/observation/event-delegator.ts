import { DI } from '@aurelia/kernel';
import type { NodeObserverConfig } from './observer-locator';
import type { IDisposable } from '@aurelia/kernel';

const defaultOptions: AddEventListenerOptions = {
  capture: false,
};

class ListenerTracker implements IDisposable {
  private count: number = 0;
  private readonly captureLookups: Map<EventTarget, Record<string, EventListenerOrEventListenerObject | undefined>> = new Map();
  private readonly bubbleLookups: Map<EventTarget, Record<string, EventListenerOrEventListenerObject | undefined>> = new Map();

  public constructor(
    private readonly publisher: EventTarget,
    private readonly eventName: string,
    private readonly options: AddEventListenerOptions = defaultOptions,
  ) {}

  public increment(): void {
    if (++this.count === 1) {
      this.publisher.addEventListener(this.eventName, this, this.options);
    }
  }

  public decrement(): void {
    if (--this.count === 0) {
      this.publisher.removeEventListener(this.eventName, this, this.options);
    }
  }

  public dispose(): void {
    if (this.count > 0) {
      this.count = 0;
      this.publisher.removeEventListener(this.eventName, this, this.options);
    }
    this.captureLookups.clear();
    this.bubbleLookups.clear();
  }

  /** @internal */
  public getLookup(target: EventTarget): Record<string, EventListenerOrEventListenerObject | undefined> {
    const lookups = this.options.capture === true ? this.captureLookups : this.bubbleLookups;
    let lookup = lookups.get(target);
    if (lookup === void 0) {
      lookups.set(target, lookup = Object.create(null) as Record<string, EventListenerOrEventListenerObject | undefined>);
    }
    return lookup;
  }

  /** @internal */
  public handleEvent(event: Event): void {
    const lookups = this.options.capture === true ? this.captureLookups : this.bubbleLookups;
    const path = event.composedPath();
    if (this.options.capture === true) {
      path.reverse();
    }
    for (const target of path) {
      const lookup = lookups.get(target);
      if (lookup === void 0) {
        continue;
      }
      const listener = lookup[this.eventName];
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
export class DelegateSubscription implements IDisposable {
  public constructor(
    private readonly tracker: ListenerTracker,
    private readonly lookup: Record<string, EventListenerOrEventListenerObject | undefined>,
    private readonly eventName: string,
    callback: EventListenerOrEventListenerObject
  ) {
    tracker.increment();
    lookup[eventName] = callback;
  }

  public dispose(): void {
    this.tracker.decrement();
    this.lookup[this.eventName] = void 0;
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
    for (const event of this.config.events) {
      node.addEventListener(event, callbackOrListener);
    }
  }

  public dispose(): void {
    const { target, handler } = this;
    if (target !== null && handler !== null) {
      for (const event of this.config.events) {
        target.removeEventListener(event, handler);
      }
    }

    this.target = this.handler = null!;
  }
}

export interface IEventDelegator extends EventDelegator {}
export const IEventDelegator = DI.createInterface<IEventDelegator>('IEventDelegator', x => x.singleton(EventDelegator));

export class EventDelegator implements IDisposable {
  private readonly trackerMaps: Record<string, Map<EventTarget, ListenerTracker> | undefined> = Object.create(null);

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  public constructor() { /* do not remove, is necessary for fulfilling the TS (new() => ...) type */ }

  public addEventListener(
    publisher: EventTarget,
    target: Node,
    eventName: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions,
  ): IDisposable {
    const trackerMap = this.trackerMaps[eventName] ??= new Map<EventTarget, ListenerTracker>();
    let tracker = trackerMap.get(publisher);
    if (tracker === void 0) {
      trackerMap.set(publisher, tracker = new ListenerTracker(publisher, eventName, options));
    }
    return new DelegateSubscription(tracker, tracker.getLookup(target), eventName, listener);
  }

  public dispose(): void {
    for (const eventName in this.trackerMaps) {
      const trackerMap = this.trackerMaps[eventName]!;
      for (const tracker of trackerMap.values()) {
        tracker.dispose();
      }
      trackerMap.clear();
    }
  }
}
