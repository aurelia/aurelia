import { Constructable, IDisposable } from './interfaces.js';
export declare const IEventAggregator: import("./di.js").InterfaceSymbol<IEventAggregator>;
export interface IEventAggregator extends EventAggregator {
}
/**
 * Enables loosely coupled publish/subscribe messaging.
 */
export declare class EventAggregator {
    /**
     * Publishes a message.
     *
     * @param channel - The channel to publish to.
     * @param message - The message to publish on the channel.
     */
    publish<T, C extends string>(channel: C, message: T): void;
    /**
     * Publishes a message.
     *
     * @param instance - The instance to publish.
     */
    publish<T extends Constructable>(instance: InstanceType<T>): void;
    /**
     * Subscribes to a message channel.
     *
     * @param channel - The event channel.
     * @param callback - The callback to be invoked when the specified message is published.
     */
    subscribe<T, C extends string>(channel: C, callback: (message: T, channel: C) => void): IDisposable;
    /**
     * Subscribes to a message type.
     *
     * @param type - The event message type.
     * @param callback - The callback to be invoked when the specified message is published.
     */
    subscribe<T extends Constructable>(type: T, callback: (message: InstanceType<T>) => void): IDisposable;
    /**
     * Subscribes to a message channel, then disposes the subscription automatically after the first message is received.
     *
     * @param channel - The event channel.
     * @param callback - The callback to be invoked when the specified message is published.
     */
    subscribeOnce<T, C extends string>(channel: C, callback: (message: T, channel: C) => void): IDisposable;
    /**
     * Subscribes to a message type, then disposes the subscription automatically after the first message is received.
     *
     * @param type - The event message type.
     * @param callback - The callback to be invoked when the specified message is published.
     */
    subscribeOnce<T extends Constructable>(type: T, callback: (message: InstanceType<T>) => void): IDisposable;
}
//# sourceMappingURL=eventaggregator.d.ts.map