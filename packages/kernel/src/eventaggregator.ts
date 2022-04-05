import { DI } from './di.js';
import { Constructable, IDisposable } from './interfaces.js';
import { isString } from './utilities.js';

/**
 * Represents a handler for an EventAggregator event.
 */
class Handler<T extends Constructable> {
  public constructor(
    public readonly messageType: T,
    public readonly callback: (message: InstanceType<T>) => void,
  ) {}

  public handle(message: InstanceType<T>): void {
    if (message instanceof this.messageType) {
      this.callback.call(null, message);
    }
  }
}

export const IEventAggregator = DI.createInterface<IEventAggregator>('IEventAggregator', x => x.singleton(EventAggregator));
export interface IEventAggregator extends EventAggregator {}

/**
 * Enables loosely coupled publish/subscribe messaging.
 */
export class EventAggregator {
  /** @internal */
  public readonly eventLookup: Record<string, ((message: unknown, channel: string) => void)[]> = {};
  /** @internal */
  public readonly messageHandlers: Handler<Constructable>[] = [];

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
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!channelOrInstance) {
      throw new Error(`Invalid channel name or instance: ${channelOrInstance}.`);
    }

    if (isString(channelOrInstance)) {
      let subscribers = this.eventLookup[channelOrInstance];
      if (subscribers !== void 0) {
        subscribers = subscribers.slice();
        let i = subscribers.length;

        while (i-- > 0) {
          subscribers[i](message, channelOrInstance);
        }
      }
    } else {
      const subscribers = this.messageHandlers.slice();
      let i = subscribers.length;

      while (i-- > 0) {
        subscribers[i].handle(channelOrInstance);
      }
    }
  }

  /**
   * Subscribes to a message channel.
   *
   * @param channel - The event channel.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribe<T, C extends string>(
    channel: C,
    callback: (message: T, channel: C) => void,
  ): IDisposable;
  /**
   * Subscribes to a message type.
   *
   * @param type - The event message type.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribe<T extends Constructable>(
    type: T,
    callback: (message: InstanceType<T>) => void,
  ): IDisposable;
  public subscribe(
    channelOrType: string | Constructable,
    callback: (...args: unknown[]) => void,
  ): IDisposable {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!channelOrType) {
      throw new Error(`Invalid channel name or type: ${channelOrType}.`);
    }

    let handler: unknown;
    let subscribers: unknown[];

    if (isString(channelOrType)) {
      if (this.eventLookup[channelOrType] === void 0) {
        this.eventLookup[channelOrType] = [];
      }
      handler = callback;
      subscribers = this.eventLookup[channelOrType];
    } else {
      handler = new Handler(channelOrType, callback);

      subscribers = this.messageHandlers;
    }

    subscribers.push(handler);

    return {
      dispose(): void {
        const idx = subscribers.indexOf(handler);
        if (idx !== -1) {
          subscribers.splice(idx, 1);
        }
      }
    };
  }

  /**
   * Subscribes to a message channel, then disposes the subscription automatically after the first message is received.
   *
   * @param channel - The event channel.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribeOnce<T, C extends string>(
    channel: C,
    callback: (message: T, channel: C) => void,
  ): IDisposable;
  /**
   * Subscribes to a message type, then disposes the subscription automatically after the first message is received.
   *
   * @param type - The event message type.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribeOnce<T extends Constructable>(
    type: T,
    callback: (message: InstanceType<T>) => void,
  ): IDisposable;
  public subscribeOnce(
    channelOrType: string | Constructable,
    callback: (...args: unknown[]) => void,
  ): IDisposable {
    const sub = this.subscribe(channelOrType as string, function (message, event) {
      sub.dispose();
      callback(message, event);
    });

    return sub;
  }
}
