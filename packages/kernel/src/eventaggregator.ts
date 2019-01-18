import { IContainer, IResolver, Registration } from './di';
import { Constructable } from './interfaces';
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

/**
 * Represents a disposable subscription to an EventAggregator event.
 */
export interface Subscription {
  /**
   * Disposes the subscription.
   */
  dispose(): void;
}

/**
 * Enables loosely coupled publish/subscribe messaging.
 * @param data The optional data published on the channel.
 * @param event The event that triggered the callback. Only available on channel based messaging.
 */
export type EventAggregatorCallback = (data?: unknown, event?: string) => unknown;

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

  public static register(container: IContainer): IResolver<EventAggregator> {
    return Registration.singleton(EventAggregator, this).register(container);
  }

  /**
   * Publishes a message.
   * @param channelOrType The event or channel to publish to.
   * @param data The data to publish on the channel.
   */
  public publish(channel: string, data?: unknown): void;
  public publish(type: InstanceType<Constructable>, data?: unknown): void;
  public publish(channelOrType: string | InstanceType<Constructable>, data?: unknown): void {
    let subscribers: (EventAggregatorCallback | Handler)[];
    let i: number;

    if (!channelOrType) {
      throw Reporter.error(0); // TODO: create error code for 'Event was invalid.'
    }

    if (typeof channelOrType === 'string') {
      subscribers = this.eventLookup[channelOrType];
      if (subscribers) {
        subscribers = subscribers.slice();
        i = subscribers.length;

        while (i--) {
          invokeCallback(subscribers[i] as EventAggregatorCallback, data, channelOrType);
        }
      }
    } else {
      subscribers = this.messageHandlers.slice();
      i = subscribers.length;

      while (i--) {
        invokeHandler(subscribers[i] as Handler, channelOrType);
      }
    }
  }

  /**
   * Subscribes to a message channel or message type.
   * @param channelOrType The event channel or event data type.
   * @param callback The callback to be invoked when the specified message is published.
   */
  public subscribe(channel: string, callback: EventAggregatorCallback): Subscription;
  public subscribe(type: Constructable, callback: EventAggregatorCallback): Subscription;
  public subscribe(channelOrType: string | Constructable, callback: EventAggregatorCallback): Subscription {
    let handler: EventAggregatorCallback | Handler;
    let subscribers: (EventAggregatorCallback | Handler)[];

    if (!channelOrType) {
      throw Reporter.error(0); // TODO: create error code for 'Event channel/type was invalid.'
    }

    if (typeof channelOrType === 'string') {
      handler = callback;
      subscribers = this.eventLookup[channelOrType] || (this.eventLookup[channelOrType] = []);
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
   * Subscribes to a message channel or message type, then disposes the subscription automatically after the first message is received.
   * @param channelOrType The event channel or event data type.
   * @param callback The callback to be invoked when the specified message is published.
   */
  public subscribeOnce(channel: string, callback: EventAggregatorCallback): Subscription;
  public subscribeOnce(type: Constructable, callback: EventAggregatorCallback): Subscription;
  public subscribeOnce(channelOrType: string | Constructable, callback: EventAggregatorCallback): Subscription {
    const sub = this.subscribe(channelOrType as Constructable, (data, event) => {
      sub.dispose();
      return callback(data, event);
    });

    return sub;
  }
}
