import { Constructable, DI, IDisposable, IEventAggregator } from '@aurelia/kernel';

export const IEventManager = DI.createInterface<IEventManager>('IEventManager').withDefault(x => x.singleton(EventManager));
export interface IEventManager extends EventManager { }

/**
 * Enables loosely coupled publish/subscribe messaging and subscription management.
 */
export class EventManager {
  /**
   * The subscribers's subscriptions.
   */
  private readonly subscriptions = new Map<unknown, Map<string | Constructable, IDisposable>>();

  public constructor(
    @IEventAggregator private readonly ea: IEventAggregator,
  ) { }

  /**
   * Publishes a message.
   *
   * @param channel - The channel to publish to.
   * @param message - The message to publish on the channel.
   */
  public publish<T, C extends string>(
    channel: C,
    message: T,
  ): void;
  /**
   * Publishes a message.
   *
   * @param instance - The instance to publish.
   */
  public publish<T extends Constructable>(
    instance: InstanceType<T>,
  ): void;
  public publish<T extends Constructable | string>(
    channelOrInstance: T extends Constructable ? InstanceType<T> : T,
    message?: unknown,
  ): void {
    this.ea.publish(channelOrInstance as string, message); // Not only string, but this works
  }

  /**
   * Subscribes to a message channel.
   *
   * @param subscriber - The subscriber.
   * @param channel - The event channel.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribe<T, C extends string>(
    subscriber: unknown,
    channel: C,
    callback: (message: T, channel: C) => void,
  ): void;
  /**
   * Subscribes to a message type.
   *
   * @param subscriber - The subscriber.
   * @param type - The event message type.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribe<T extends Constructable>(
    subscriber: unknown,
    type: T,
    callback: (message: InstanceType<T>) => void,
  ): void;
  public subscribe(
    subscriber: unknown,
    channelOrType: string | Constructable,
    callback: (...args: unknown[]) => void,
  ): void {
    // Clear existing subscription
    if (this.subscribes(subscriber, channelOrType as string)) { // Not only string, but this works
      this.unsubscribe(subscriber, channelOrType as string); // Not only string, but this works
    }
    const disposable = this.ea.subscribe(channelOrType as string, callback); // Not only string, but this works
    console.log('Subscribe', subscriber, channelOrType);
    let subscriptions = this.subscriptions.get(subscriber);
    if (subscriptions === void 0) {
      subscriptions = new Map<Constructable, IDisposable>();
    }
    subscriptions.set(channelOrType, disposable);
    this.subscriptions.set(subscriber, subscriptions);
  }

  /**
   * Unsubscribe a message channel subscription.
   *
   * @param subscriber - The subscriber.
   * @param channel - The event channel.
   */
  public unsubscribe<T, C extends string>(
    subscriber: unknown,
    channel?: C,
  ): void;
  /**
   * Unsubscribe a message channel subscription.
   *
   * @param subscriber - The subscriber.
   * @param type - The event message type.
   */
  public unsubscribe<T extends Constructable>(
    subscriber: unknown,
    type?: T,
  ): void;
  public unsubscribe(
    subscriber: unknown,
    channelOrType?: string | Constructable,
  ): void {
    const subscriptions = this.subscriptions.get(subscriber) as Map<string | Constructable, IDisposable>;
    if (channelOrType === void 0) {
      for (const key of subscriptions.keys()) {
        this.unsubscribe(subscriber, key as string); // Not only string, but this works
      }
      return;
    }
    const disposable = subscriptions.get(channelOrType as string); // Not only string, but this works
    disposable!.dispose();
    console.log('Unsubscribe', subscriber, channelOrType);
    subscriptions.delete(channelOrType as string); // Not only string, but this works
    this.subscriptions.set(subscriber, subscriptions);
  }

  /**
   * Whether a subscriber subscribes to a message channel.
   *
   * @param subscriber - The subscriber.
   * @param channel - The event channel.
   */
  public subscribes<T, C extends string>(
    subscriber: unknown,
    channel: C,
  ): boolean;
  /**
   * Whether a subscriber subscribes to a message channel.
   *
   * @param subscriber - The subscriber.
   * @param type - The event message type.
   */
  public subscribes<T extends Constructable>(
    subscriber: unknown,
    type: T,
  ): boolean;
  public subscribes(
    subscriber: unknown,
    channelOrType?: string | Constructable,
  ): boolean {
    const subscriptions = this.subscriptions.get(subscriber);
    if (subscriptions === void 0) {
      return false;
    }
    if (channelOrType === void 0) {
      return true;
    }
    return subscriptions.has(channelOrType);
  }
}
