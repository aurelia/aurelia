import { IRegistry } from './di.js';
import { Class, Constructable } from './interfaces.js';
export declare const enum LogLevel {
    /**
     * The most detailed information about internal app state.
     *
     * Disabled by default and should never be enabled in a production environment.
     */
    trace = 0,
    /**
     * Information that is useful for debugging during development and has no long-term value.
     */
    debug = 1,
    /**
     * Information about the general flow of the application that has long-term value.
     */
    info = 2,
    /**
     * Unexpected circumstances that require attention but do not otherwise cause the current flow of execution to stop.
     */
    warn = 3,
    /**
     * Unexpected circumstances that cause the flow of execution in the current activity to stop but do not cause an app-wide failure.
     */
    error = 4,
    /**
     * Unexpected circumstances that cause an app-wide failure or otherwise require immediate attention.
     */
    fatal = 5,
    /**
     * No messages should be written.
     */
    none = 6
}
/**
 * Flags to enable/disable color usage in the logging output.
 */
export declare const enum ColorOptions {
    /**
     * Do not use ASCII color codes in logging output.
     */
    noColors = 0,
    /**
     * Use ASCII color codes in logging output. By default, timestamps and the TRC and DBG prefix are colored grey. INF white, WRN yellow, and ERR and FTL red.
     */
    colors = 1
}
/**
 * The global logger configuration.
 *
 * Properties on this object can be changed during runtime and will affect logging of all components that are housed under the same root DI container as the logger.
 */
export interface ILogConfig {
    /**
     * The global color options.
     */
    colorOptions: ColorOptions;
    /**
     * The global log level. Only log calls with the same level or higher are emitted.
     */
    level: LogLevel;
}
interface ILoggingConfigurationOptions extends ILogConfig {
    $console: IConsoleLike;
    sinks: Class<ISink>[];
}
/**
 * Component that creates log event objects based on raw inputs sent to `ILogger`.
 *
 * To customize what data is sent to the sinks, replace the implementation for this interface with your own.
 *
 * @example
 *
 * ```ts
 * export class MyLogEventFactory {
 *   public createLogEvent(logger: ILogger, logLevel: LogLevel, message: string, optionalParams: unknown[]): ILogEvent {
 *     return {
 *       logLevel,
 *       optionalParams,
 *       toString() {
 *         return `[${logger.scope.join('.')}] ${message} ${optionalParams.join(', ')}`;
 *       }
 *     };
 *   }
 * }
 *
 * container.register(Registration.singleton(ILogEventFactory, MyLogEventFactory));
 * ```
 */
export interface ILogEventFactory {
    /**
     * Create a log event object based on the input parameters sent to `ILogger`.
     *
     * @param logger - The `ILogger` that received the message.
     * @param logLevel - The `LogLevel` associated with the `ILogger` method that the message was passed into. E.g. `logger.debug` will result in `LogLevel.debug`
     * @param message - The message (first parameter) that was passed into the logger. If a function was passed into the logger, this will be the return value of that function.
     * @param optionalParams - Additional optional parameters there were passed into the logger, if any.
     *
     * @returns An `ILogEvent` object that, by default, only has a `.toString()` method.
     *
     * This is called by the default console sink to get the message to emit to the console.
     * It could be any object of any shape, as long as the registered sinks understand that shape.
     */
    createLogEvent(logger: ILogger, logLevel: LogLevel, message: string, optionalParams: unknown[]): ILogEvent;
}
/**
 * A logging sink that emits `ILogEvent` objects to any kind of output. This can be the console, a database, a web api, a file, etc.
 *
 * Multiple sinks can be registered, and all events will be emitted to all of them.
 *
 * @example
 * // A buffered file sink that writes once per second:
 *
 * ```ts
 * export class BufferedFileSink {
 *   private readonly buffer: ILogEvent[] = [];
 *
 *   constructor() {
 *     setInterval(() => {
 *       const events = this.buffer.splice(0);
 *       if (events.length > 0) {
 *         fs.appendFileSync('my-log.txt', events.map(e => e.toString()).join('\n'));
 *       }
 *     }, 1000);
 *   }
 *
 *   public emit(event: ILogEvent): void {
 *     this.buffer.push(event);
 *   }
 * }
 *
 * container.register(Registration.singleton(ISink, BufferedFileSink));
 * ```
 */
export interface ISink {
    /**
     * Handle the provided `ILogEvent` to the output interface wrapped by this sink.
     *
     * @param event - The event object to emit. Built-in sinks will call `.toString()` on the event object but custom sinks can do anything they like with the event.
     */
    handleEvent(event: ILogEvent): void;
}
/**
 * The main interface to the logging API.
 *
 * Inject this as a dependency in your components to add centralized, configurable logging capabilities to your application.
 */
export interface ILogger extends DefaultLogger {
}
export declare const ILogConfig: import("./di.js").InterfaceSymbol<ILogConfig>;
export declare const ISink: import("./di.js").InterfaceSymbol<ISink>;
export declare const ILogEventFactory: import("./di.js").InterfaceSymbol<ILogEventFactory>;
export declare const ILogger: import("./di.js").InterfaceSymbol<ILogger>;
export declare const ILogScopes: import("./di.js").InterfaceSymbol<string[]>;
interface SinkDefinition {
    handles: Exclude<LogLevel, LogLevel.none>[];
}
export declare const LoggerSink: Readonly<{
    key: string;
    define<TSink extends ISink>(target: Constructable<TSink>, definition: SinkDefinition): Constructable<TSink>;
    getHandles<TSink_1 extends ISink>(target: TSink_1 | Constructable<TSink_1>): LogLevel[] | undefined;
}>;
export declare function sink(definition: SinkDefinition): <TSink extends ISink>(target: Constructable<TSink>) => Constructable<TSink>;
export interface IConsoleLike {
    debug(message: string, ...optionalParams: unknown[]): void;
    info(message: string, ...optionalParams: unknown[]): void;
    warn(message: string, ...optionalParams: unknown[]): void;
    error(message: string, ...optionalParams: unknown[]): void;
}
export declare const format: {
    readonly red: <T extends string>(str: T) => T;
    readonly green: <T_1 extends string>(str: T_1) => T_1;
    readonly yellow: <T_2 extends string>(str: T_2) => T_2;
    readonly blue: <T_3 extends string>(str: T_3) => T_3;
    readonly magenta: <T_4 extends string>(str: T_4) => T_4;
    readonly cyan: <T_5 extends string>(str: T_5) => T_5;
    readonly white: <T_6 extends string>(str: T_6) => T_6;
    readonly grey: <T_7 extends string>(str: T_7) => T_7;
};
export interface ILogEvent {
    readonly severity: LogLevel;
    readonly optionalParams?: readonly unknown[];
    toString(): string;
}
export declare class LogConfig implements ILogConfig {
    readonly colorOptions: ColorOptions;
    readonly level: LogLevel;
    constructor(colorOptions: ColorOptions, level: LogLevel);
}
export declare class DefaultLogEvent implements ILogEvent {
    readonly severity: LogLevel;
    readonly message: string;
    readonly optionalParams: unknown[];
    readonly scope: readonly string[];
    readonly colorOptions: ColorOptions;
    readonly timestamp: number;
    constructor(severity: LogLevel, message: string, optionalParams: unknown[], scope: readonly string[], colorOptions: ColorOptions, timestamp: number);
    toString(): string;
}
export declare class DefaultLogEventFactory implements ILogEventFactory {
    readonly config: ILogConfig;
    constructor(config: ILogConfig);
    createLogEvent(logger: ILogger, level: LogLevel, message: string, optionalParams: unknown[]): ILogEvent;
}
export declare class ConsoleSink implements ISink {
    readonly handleEvent: (event: ILogEvent) => void;
    constructor($console: IConsoleLike);
}
export declare class DefaultLogger {
    /**
     * The global logger configuration.
     */
    readonly config: ILogConfig;
    private readonly factory;
    /**
     * The scopes that this logger was created for, if any.
     */
    readonly scope: string[];
    /**
     * The root `ILogger` instance. On the root logger itself, this property circularly references the root. It is never null.
     *
     * When using `.scopeTo`, a new `ILogger` is created. That new logger will have the `root` property set to the global (non-scoped) logger.
     */
    readonly root: ILogger;
    /**
     * The parent `ILogger` instance. On the root logger itself, this property circularly references the root. It is never null.
     *
     * When using `.scopeTo`, a new `ILogger` is created. That new logger will have the `parent` property set to the logger that it was created from.
     */
    readonly parent: ILogger;
    private readonly scopedLoggers;
    constructor(
    /**
     * The global logger configuration.
     */
    config: ILogConfig, factory: ILogEventFactory, sinks: readonly ISink[], 
    /**
     * The scopes that this logger was created for, if any.
     */
    scope?: string[], parent?: DefaultLogger | null);
    /**
     * Write to TRC output, if the configured `LogLevel` is set to `trace`.
     *
     * Intended for the most detailed information about internal app state.
     *
     * @param getMessage - A function to build the message to pass to the `ILogEventFactory`.
     * Only called if the configured `LogLevel` dictates that these messages be emitted.
     * Use this when creating the log message is potentially expensive and should only be done if the log is actually emitted.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    trace(getMessage: () => unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to TRC output, if the configured `LogLevel` is set to `trace`.
     *
     * Intended for the most detailed information about internal app state.
     *
     * @param message - The message to pass to the `ILogEventFactory`.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    trace(message: unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to DBG output, if the configured `LogLevel` is set to `debug` or lower.
     *
     * Intended for information that is useful for debugging during development and has no long-term value.
     *
     * @param getMessage - A function to build the message to pass to the `ILogEventFactory`.
     * Only called if the configured `LogLevel` dictates that these messages be emitted.
     * Use this when creating the log message is potentially expensive and should only be done if the log is actually emitted.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    debug(getMessage: () => unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to DBG output, if the configured `LogLevel` is set to `debug` or lower.
     *
     * Intended for information that is useful for debugging during development and has no long-term value.
     *
     * @param message - The message to pass to the `ILogEventFactory`.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    debug(message: unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to trace UBF, if the configured `LogLevel` is set to `info` or lower.
     *
     * Intended for information about the general flow of the application that has long-term value.
     *
     * @param getMessage - A function to build the message to pass to the `ILogEventFactory`.
     * Only called if the configured `LogLevel` dictates that these messages be emitted.
     * Use this when creating the log message is potentially expensive and should only be done if the log is actually emitted.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    info(getMessage: () => unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to trace UBF, if the configured `LogLevel` is set to `info` or lower.
     *
     * Intended for information about the general flow of the application that has long-term value.
     *
     * @param message - The message to pass to the `ILogEventFactory`.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    info(message: unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to WRN output, if the configured `LogLevel` is set to `warn` or lower.
     *
     * Intended for unexpected circumstances that require attention but do not otherwise cause the current flow of execution to stop.
     *
     * @param getMessage - A function to build the message to pass to the `ILogEventFactory`.
     * Only called if the configured `LogLevel` dictates that these messages be emitted.
     * Use this when creating the log message is potentially expensive and should only be done if the log is actually emitted.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    warn(getMessage: () => unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to WRN output, if the configured `LogLevel` is set to `warn` or lower.
     *
     * Intended for unexpected circumstances that require attention but do not otherwise cause the current flow of execution to stop.
     *
     * @param message - The message to pass to the `ILogEventFactory`.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    warn(message: unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to ERR output, if the configured `LogLevel` is set to `error` or lower.
     *
     * Intended for unexpected circumstances that cause the flow of execution in the current activity to stop but do not cause an app-wide failure.
     *
     * @param getMessage - A function to build the message to pass to the `ILogEventFactory`.
     * Only called if the configured `LogLevel` dictates that these messages be emitted.
     * Use this when creating the log message is potentially expensive and should only be done if the log is actually emitted.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    error(getMessage: () => unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to ERR output, if the configured `LogLevel` is set to `error` or lower.
     *
     * Intended for unexpected circumstances that cause the flow of execution in the current activity to stop but do not cause an app-wide failure.
     *
     * @param message - The message to pass to the `ILogEventFactory`.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    error(message: unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to FTL output, if the configured `LogLevel` is set to `fatal` or lower.
     *
     * Intended for unexpected circumstances that cause an app-wide failure or otherwise require immediate attention.
     *
     * @param getMessage - A function to build the message to pass to the `ILogEventFactory`.
     * Only called if the configured `LogLevel` dictates that these messages be emitted.
     * Use this when creating the log message is potentially expensive and should only be done if the log is actually emitted.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    fatal(getMessage: () => unknown, ...optionalParams: unknown[]): void;
    /**
     * Write to FTL output, if the configured `LogLevel` is set to `fatal` or lower.
     *
     * Intended for unexpected circumstances that cause an app-wide failure or otherwise require immediate attention.
     *
     * @param message - The message to pass to the `ILogEventFactory`.
     * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
     */
    fatal(message: unknown, ...optionalParams: unknown[]): void;
    /**
     * Create a new logger with an additional permanent prefix added to the logging outputs.
     * When chained, multiple scopes are separated by a dot.
     *
     * This is preliminary API and subject to change before alpha release.
     *
     * @example
     *
     * ```ts
     * export class MyComponent {
     *   constructor(@ILogger private logger: ILogger) {
     *     this.logger.debug('before scoping');
     *     // console output: '[DBG] before scoping'
     *     this.logger = logger.scopeTo('MyComponent');
     *     this.logger.debug('after scoping');
     *     // console output: '[DBG MyComponent] after scoping'
     *   }
     *
     *   public doStuff(): void {
     *     const logger = this.logger.scopeTo('doStuff()');
     *     logger.debug('doing stuff');
     *     // console output: '[DBG MyComponent.doStuff()] doing stuff'
     *   }
     * }
     * ```
     */
    scopeTo(name: string): ILogger;
    private emit;
}
/**
 * A basic `ILogger` configuration that configures a single `console` sink based on provided options.
 *
 * NOTE: You *must* register the return value of `.create` with the container / au instance, not this `LoggerConfiguration` object itself.
 *
 * @example
 * ```ts
 * container.register(LoggerConfiguration.create());
 *
 * container.register(LoggerConfiguration.create({$console: console}))
 *
 * container.register(LoggerConfiguration.create({$console: console, level: LogLevel.debug}))
 *
 * container.register(LoggerConfiguration.create({
 *  $console: {
 *     debug: noop,
 *     info: noop,
 *     warn: noop,
 *     error: msg => {
 *       throw new Error(msg);
 *     }
 *  },
 *  level: LogLevel.debug
 * }))
 *
 * ```
 */
export declare const LoggerConfiguration: {
    /**
     * @param $console - The `console` object to use. Can be the native `window.console` / `global.console`, but can also be a wrapper or mock that implements the same interface.
     * @param level - The global `LogLevel` to configure. Defaults to `warn` or higher.
     * @param colorOptions - Whether to use colors or not. Defaults to `noColors`. Colors are especially nice in nodejs environments but don't necessarily work (well) in all environments, such as browsers.
     */
    create({ $console, level, colorOptions, sinks, }?: Partial<ILoggingConfigurationOptions>): IRegistry;
};
export {};
//# sourceMappingURL=logger.d.ts.map