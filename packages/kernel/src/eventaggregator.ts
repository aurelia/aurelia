import { IContainer, IResolver, Registration } from './di';
import { Constructable } from './interfaces';
import { Reporter } from './reporter';

/**
 * Represents a handler for an EventAggregator event.
 */
class Handler {
  public messageType: Constructable;
  public callback: EventAggregatorCallback;

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

export type EventAggregatorCallback = (data?: unknown, event?: string) => unknown;

/**
 * Enables loosely coupled publish/subscribe messaging.
 */
export class EventAggregator {
  public eventLookup: Record<string, EventAggregatorCallback[]>;
  public messageHandlers: Handler[];

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
   * @param event The event or channel to publish to.
   * @param data The data to publish on the channel.
   */
  public publish(event: string | InstanceType<Constructable>, data?: unknown): void {
    let subscribers: (EventAggregatorCallback | Handler)[];
    let i: number;

    if (!event) {
      throw new Error('Event was invalid.');
    }

    if (typeof event === 'string') {
      subscribers = this.eventLookup[event];
      if (subscribers) {
        subscribers = subscribers.slice();
        i = subscribers.length;

        while (i--) {
          invokeCallback(subscribers[i] as EventAggregatorCallback, data, event);
        }
      }
    } else {
      subscribers = this.messageHandlers.slice();
      i = subscribers.length;

      while (i--) {
        invokeHandler(subscribers[i] as Handler, event);
      }
    }
  }

  /**
   * Subscribes to a message channel or message type.
   * @param event The event channel or event data type.
   * @param callback The callback to be invoked when the specified message is published.
   */
  public subscribe(event: string | Constructable, callback: EventAggregatorCallback): Subscription {
    let handler: EventAggregatorCallback | Handler;
    let subscribers;

    if (!event) {
      throw new Error('Event channel/type was invalid.');
    }

    if (typeof event === 'string') {
      handler = callback;
      subscribers = this.eventLookup[event] || (this.eventLookup[event] = []);
    } else {
      handler = new Handler(event, callback);
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
   * @param event The event channel or event data type.
   * @param callback The callback to be invoked when the specified message is published.
   */
  public subscribeOnce(event: string | Constructable, callback: EventAggregatorCallback): Subscription {
    const sub = this.subscribe(event, (a, b) => {
      sub.dispose();
      return callback(a, b);
    });

    return sub;
  }
}
