import { IContainer, IResolver, Registration } from './di';
import { Constructable, IDisposable } from './interfaces';
import { Reporter } from './reporter';

/**
 * Represents a handler for an EventAggregator event.
 */
class Handler {
  /** @internal */
  public readonly messageType: Constructable;
  /** @internal */
  public readonly callback: EventAggregatorCallback;

  constructor(messageType: Constructable, callback: EventAggregatorCallback) {
    this.messageType = messageType;
    this.callback = callback;
  }

  public handle(message: InstanceType<Constructable>): void {
    if (message instanceof this.messageType) {
      this.callback.call(null, message);
    }
  }
}

function invokeCallback(callback: EventAggregatorCallback, data: unknown, event: string): void {
  try {
    callback(data, event);
  } catch (e) {
    Reporter.error(0, e); // TODO: create error code
  }
}

function invokeHandler(handler: Handler, data: InstanceType<Constructable>): void {
  try {
    handler.handle(data);
  } catch (e) {
    Reporter.error(0, e); // TODO: create error code
  }
}

// TODO: move this to a v1-compat package
export interface Subscription extends IDisposable {}

/**
 * Enables loosely coupled publish/subscribe messaging.
 * @param data The optional data published on the channel.
 * @param event The event that triggered the callback. Only available on channel based messaging.
 */
export type EventAggregatorCallback<T = unknown> = (data?: T, event?: string) => unknown;

/**
 * Enables loosely coupled publish/subscribe messaging.
 */
export class EventAggregator {
  /** @internal */
  public readonly eventLookup: Record<string, EventAggregatorCallback[]>;
  /** @internal */
  public readonly messageHandlers: Handler[];

  /**
   * Creates an instance of the EventAggregator class.
   */
  constructor() {
    this.eventLookup = {};
    this.messageHandlers = [];
  }

  /**
   * Publishes a message.
   * @param channel The channel to publish to.
   * @param data The data to publish on the channel.
   */
  public publish(channel: string, data?: unknown): void;
  /**
   * Publishes a message.
   * @param channelOrType The event to publish to.
   * @param data The data to publish on the channel.
   */
  public publish(type: InstanceType<Constructable>): void;
  public publish(channelOrType: string | InstanceType<Constructable>, data?: unknown): void {
    let subscribers: (EventAggregatorCallback | Handler)[];
    let i: number;

    if (!channelOrType) {
      throw Reporter.error(0); // TODO: create error code for 'Event was invalid.'
    }

    if (typeof channelOrType === 'string') {
      const channel: string = channelOrType;
      subscribers = this.eventLookup[channel];
      if (subscribers) {
        subscribers = subscribers.slice();
        i = subscribers.length;

        while (i--) {
          invokeCallback(subscribers[i] as EventAggregatorCallback, data, channel);
        }
      }
    } else {
      const type: InstanceType<Constructable> = channelOrType;
      subscribers = this.messageHandlers.slice();
      i = subscribers.length;

      while (i--) {
        invokeHandler(subscribers[i] as Handler, type);
      }
    }
  }

  /**
   * Subscribes to a message channel.
   * @param channelOrType The event channel.
   * @param callback The callback to be invoked when the specified message is published.
   */
  public subscribe<T>(channel: string, callback: EventAggregatorCallback<T>): IDisposable;
  /**
   * Subscribes to a message type.
   * @param channelOrType The event data type.
   * @param callback The callback to be invoked when the specified message is published.
   */
  public subscribe<T extends Constructable>(type: T, callback: EventAggregatorCallback<InstanceType<T>>): IDisposable;
  public subscribe<T extends Constructable>(channelOrType: string | T, callback: EventAggregatorCallback<T | InstanceType<T>>): IDisposable {
    let handler: EventAggregatorCallback | Handler;
    let subscribers: (EventAggregatorCallback | Handler)[];

    if (!channelOrType) {
      throw Reporter.error(0); // TODO: create error code for 'Event channel/type was invalid.'
    }

    if (typeof channelOrType === 'string') {
      const channel: string = channelOrType;
      handler = callback;
      subscribers = this.eventLookup[channel] || (this.eventLookup[channel] = []);
    } else {
      const type: T = channelOrType;
      handler = new Handler(type, callback);
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
   * @param channel The event channel.
   * @param callback The callback to be invoked when the specified message is published.
   */
  public subscribeOnce<T>(channel: string, callback: EventAggregatorCallback<T>): IDisposable;
  /**
   * Subscribes to a message type, then disposes the subscription automatically after the first message is received.
   * @param type The event data type.
   * @param callback The callback to be invoked when the specified message is published.
   */
  public subscribeOnce<T extends Constructable>(type: T, callback: EventAggregatorCallback<InstanceType<T>>): IDisposable;
  public subscribeOnce<T extends Constructable>(channelOrType: string | T, callback: EventAggregatorCallback<T | InstanceType<T>>): IDisposable {
    const sub = this.subscribe(channelOrType as T, (data?: T, event?: string) => {
      sub.dispose();
      return callback(data, event);
    });

    return sub;
  }
}
