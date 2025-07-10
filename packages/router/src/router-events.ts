import { DI, IEventAggregator, IDisposable, ILogger, resolve } from '@aurelia/kernel';

import type { ViewportInstructionTree } from './instructions';
import { Events, trace } from './events';

export type RoutingTrigger = 'popstate' | 'hashchange' | 'api';

export const AuNavId = 'au-nav-id' as const;
export type AuNavId = typeof AuNavId;
export type ManagedState = {
  [k: string]: unknown;
  [AuNavId]: number;
};

class Subscription implements IDisposable {
  /** @internal */ private _disposed: boolean = false;

  public constructor(
    /** @internal */ private readonly _events: IRouterEvents,
    /**
     * A unique serial number that makes individual subscribers more easily distinguishable in chronological order.
     *
     * Mainly for debugging purposes.
     */
    /** @internal */ public readonly _serial: number,
    /** @internal */ private readonly _inner: IDisposable,
  ) {}

  public dispose(): void {
    if (!this._disposed) {
      this._disposed = true;

      this._inner.dispose();
      const subscriptions = this._events['_subscriptions'];
      subscriptions.splice(subscriptions.indexOf(this), 1);
    }
  }
}

export const IRouterEvents = /*@__PURE__*/DI.createInterface<IRouterEvents>('IRouterEvents', x => x.singleton(RouterEvents));
export interface IRouterEvents extends RouterEvents { }
export class RouterEvents implements IRouterEvents {
  /** @internal */ private _subscriptionSerial: number = 0;
  /** @internal */ private readonly _subscriptions: Subscription[] = [];

  /** @internal */ private readonly _ea: IEventAggregator = resolve(IEventAggregator);
  /** @internal */ private readonly _logger: ILogger = resolve(ILogger).scopeTo('RouterEvents');

  public publish(event: RouterEvent): void {
    if(__DEV__) trace(this._logger, Events.rePublishingEvent, event);

    this._ea.publish(event.name, event);
  }

  public subscribe<T extends RouterEvent['name']>(event: T, callback: (message: NameToEvent[T]) => void): IDisposable {
    const subscription = new Subscription(
      this,
      ++this._subscriptionSerial,
      this._ea.subscribe(event, (message: NameToEvent[T]) => {
        if(__DEV__) trace(this._logger, Events.reInvokingSubscriber, subscription._serial, event);
        callback(message);
      })
    );

    this._subscriptions.push(subscription);
    return subscription;
  }
}

export class LocationChangeEvent {
  public get name(): 'au:router:location-change' { return 'au:router:location-change'; }

  public constructor(
    public readonly id: number,
    public readonly url: string,
    public readonly trigger: 'popstate' | 'hashchange',
    public readonly state: {} | null,
  ) {}

  public toString(): string {
    return __DEV__
      ? `LocationChangeEvent(id:${this.id},url:'${this.url}',trigger:'${this.trigger}')`
      : `LocationChangeEvent`;
  }
}

export class NavigationStartEvent {
  public get name(): 'au:router:navigation-start' { return 'au:router:navigation-start'; }

  public constructor(
    public readonly id: number,
    public readonly instructions: ViewportInstructionTree,
    public readonly trigger: RoutingTrigger,
    public readonly managedState: ManagedState | null,
  ) {}

  public toString(): string {
    return __DEV__
      ? `NavigationStartEvent(id:${this.id},instructions:'${this.instructions}',trigger:'${this.trigger}')`
      : `NavigationStartEvent`;
  }
}

export class NavigationEndEvent {
  public get name(): 'au:router:navigation-end' { return 'au:router:navigation-end'; }

  public constructor(
    public readonly id: number,
    public readonly instructions: ViewportInstructionTree,
    public readonly finalInstructions: ViewportInstructionTree,
  ) {}

  public toString(): string {
    return __DEV__
      ? `NavigationEndEvent(id:${this.id},instructions:'${this.instructions}',finalInstructions:'${this.finalInstructions}')`
      : `NavigationEndEvent`;
  }
}

export class NavigationCancelEvent {
  public get name(): 'au:router:navigation-cancel' { return 'au:router:navigation-cancel'; }

  public constructor(
    public readonly id: number,
    public readonly instructions: ViewportInstructionTree,
    public readonly reason: unknown,
  ) {}

  public toString(): string {
    return __DEV__
      ? `NavigationCancelEvent(id:${this.id},instructions:'${this.instructions}',reason:${String(this.reason)})`
      : `NavigationCancelEvent`;
  }
}

export class NavigationErrorEvent {
  public get name(): 'au:router:navigation-error' { return 'au:router:navigation-error'; }

  public constructor(
    public readonly id: number,
    public readonly instructions: ViewportInstructionTree,
    public readonly error: unknown,
  ) {}

  public toString(): string {
    return __DEV__
      ? `NavigationErrorEvent(id:${this.id},instructions:'${this.instructions}',error:${String(this.error)})`
      : `NavigationErrorEvent`;
  }
}

type NameToEvent = {
  [LocationChangeEvent.prototype.name]: LocationChangeEvent;
  [NavigationStartEvent.prototype.name]: NavigationStartEvent;
  [NavigationEndEvent.prototype.name]: NavigationEndEvent;
  [NavigationCancelEvent.prototype.name]: NavigationCancelEvent;
  [NavigationErrorEvent.prototype.name]: NavigationErrorEvent;
};

export type RouterEvent = (
  LocationChangeEvent |
  NavigationStartEvent |
  NavigationEndEvent |
  NavigationCancelEvent |
  NavigationErrorEvent
);
