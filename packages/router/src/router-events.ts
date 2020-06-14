import {
  DI,
  IEventAggregator,
  IDisposable,
  ILogger,
} from '@aurelia/kernel';
import { RouteExpression } from './route-expression';
import { ManagedState } from './router';

class Subscription implements IDisposable {
  private disposed: boolean = false;

  public constructor(
    private readonly events: IRouterEvents,
    /**
     * A unique serial number that makes individual subscribers more easily distinguishable in chronological order.
     *
     * Mainly for debugging purposes.
     */
    public readonly serial: number,
    private readonly inner: IDisposable,
  ) {}

  public dispose(): void {
    if (!this.disposed) {
      this.disposed = true;

      this.inner.dispose();
      const subscriptions = this.events['subscriptions'];
      subscriptions.splice(subscriptions.indexOf(this), 1);
    }
  }
}

export const IRouterEvents = DI.createInterface<IRouterEvents>('IRouterEvents').withDefault(x => x.singleton(RouterEvents));

export interface IRouterEvents extends RouterEvents {}

export class RouterEvents implements IRouterEvents {
  private subscriptionSerial: number = 0;
  private readonly subscriptions: Subscription[] = [];

  public constructor(
    @IEventAggregator private readonly ea: IEventAggregator,
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('RouterEvents');
  }

  public publish(event: RouterEvent): void {
    this.logger.trace(() => `publishing ${event.toString()}`);

    this.ea.publish(event.name, event);
  }

  public subscribe<T extends RouterEvent['name']>(event: T, callback: (message: NameToEvent[T]) => void): IDisposable {
    const subscription = new Subscription(
      this,
      ++this.subscriptionSerial,
      this.ea.subscribe(event, (message: NameToEvent[T]) => {
        this.logger.trace(() => `handling ${event.toString()} for subscription #${subscription.serial}`);
        callback(message);
      })
    );

    this.subscriptions.push(subscription);
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
    return `LocationChangeEvent(id:${this.id},url:'${this.url}',trigger:'${this.trigger}')`;
  }
}

export class NavigationStartEvent {
  public get name(): 'au:router:navigation-start' { return 'au:router:navigation-start'; }

  public constructor(
    public readonly id: number,
    public readonly route: RouteExpression,
    public readonly trigger: 'popstate' | 'hashchange' | 'api',
    public readonly managedState: ManagedState | null,
  ) {}

  public toString(): string {
    return `NavigationStartEvent(id:${this.id},route:'${this.route.toString()}',trigger:'${this.trigger}')`;
  }
}

export class NavigationEndEvent {
  public get name(): 'au:router:navigation-end' { return 'au:router:navigation-end'; }

  public constructor(
    public readonly id: number,
    public readonly route: RouteExpression,
    public readonly finalRoute: RouteExpression,
  ) {}

  public toString(): string {
    return `NavigationEndEvent(id:${this.id},route:'${this.route.toString()}',finalRoute:'${this.finalRoute.toString()}')`;
  }
}

export class NavigationCancelEvent {
  public get name(): 'au:router:navigation-cancel' { return 'au:router:navigation-cancel'; }

  public constructor(
    public readonly id: number,
    public readonly route: RouteExpression,
    public readonly reason: unknown,
  ) {}

  public toString(): string {
    return `NavigationCancelEvent(id:${this.id},route:'${this.route.toString()}',reason:${String(this.reason)})`;
  }
}

export class NavigationErrorEvent {
  public get name(): 'au:router:navigation-error' { return 'au:router:navigation-error'; }

  public constructor(
    public readonly id: number,
    public readonly route: RouteExpression,
    public readonly error: unknown,
  ) {}

  public toString(): string {
    return `NavigationErrorEvent(id:${this.id},route:'${this.route.toString()}',error:${String(this.error)})`;
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
