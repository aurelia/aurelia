import {
  DI,
  IEventAggregator,
  IDisposable,
  ILogger,
} from '@aurelia/kernel';

class Envelope<T> {
  public constructor(
    /**
     * A unique serial number that makes individual events more easily distinguishable in chronological order.
     *
     * Mainly for debugging purposes.
     */
    public readonly serial: number,
    public readonly message: T,
  ) {}
}

class Subscription implements IDisposable {
  public constructor(
    /**
     * A unique serial number that makes individual subscribers more easily distinguishable in chronological order.
     *
     * Mainly for debugging purposes.
     */
    public readonly serial: number,
    private readonly inner: IDisposable,
  ) {}

  public dispose(): void {
    this.inner.dispose();
  }
}

export const IRouterEvents = DI.createInterface<IRouterEvents>('IRouterEvents').withDefault(x => x.singleton(RouterEvents));

export interface IRouterEvents {
  publish(event: string, message: unknown): void;
  subscribe<T>(event: string, callback: (message: T) => void): void;
  unsubscribeAll(): void;
}

export class RouterEvents implements IRouterEvents {
  private envelopeSerial: number = 0;
  private subscriptionSerial: number = 0;
  private readonly subscriptions: Subscription[] = [];

  public constructor(
    @IEventAggregator private readonly ea: IEventAggregator,
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('RouterEvents');
  }

  public publish(event: string, message: unknown): void {
    const envelope = new Envelope(++this.envelopeSerial, message);

    this.logger.debug(`publishing '${event}' #${envelope.serial}`);

    this.ea.publish(event, envelope);
  }

  public subscribe<T>(event: string, callback: (message: T) => void): void {
    const subscription = new Subscription(
      ++this.subscriptionSerial,
      this.ea.subscribe(event, (envelope: Envelope<T>) => {
        this.logger.debug(`handling '${event}' #${envelope.serial} for subscription #${subscription.serial}`);
        callback(envelope.message);
      })
    );

    this.subscriptions.push(subscription);
  }

  public unsubscribeAll(): void {
    this.subscriptions.splice(0).forEach(x => x.dispose());
  }
}
