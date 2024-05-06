import { createInterface } from './di';
import { ErrorNames, createMappedError } from './errors';
import { Constructable, IDisposable } from './interfaces';
import { isString } from './utilities';

/**
 * Represents a handler for an EventAggregator event.
 */
class Handler<T extends Constructable> {
  public constructor(
    private readonly type: T,
    private readonly cb: (message: InstanceType<T>) => void,
  ) {}

  public handle(message: InstanceType<T>): void {
    if (message instanceof this.type) {
      this.cb.call(null, message);
    }
  }
}

export const IEventAggregator = /*@__PURE__*/createInterface<IEventAggregator>('IEventAggregator', x => x.singleton(EventAggregator));
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
  public publish<C extends string>(channel: C, message?: unknown): void;
  /**
   * Publishes a message.
   *
   * @param instance - The instance to publish.
   */
  public publish<T extends Constructable>(instance: InstanceType<T>): void;
  public publish<T extends Constructable | string>(
    channelOrInstance: T extends Constructable ? InstanceType<T> : T,
    message?: unknown,
  ): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!channelOrInstance) {
      throw createMappedError(ErrorNames.event_aggregator_publish_invalid_event_name, channelOrInstance);
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
  public subscribe<T, C extends string = string>(
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
      throw createMappedError(ErrorNames.event_aggregator_subscribe_invalid_event_name, channelOrType);
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
    const sub = this.subscribe(channelOrType as string, (message, event) => {
      sub.dispose();
      callback(message, event);
    });

    return sub;
  }
}
