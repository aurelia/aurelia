import { all, DI, IContainer, ignore, IRegistry, optional, Registration } from './di';
import { bound, toLookup } from './functions';
import { Class, Constructable } from './interfaces';
import { getAnnotationKeyFor } from './resource';
import { Metadata } from '@aurelia/metadata';
import { IPlatform } from './platform';
import { createObject, defineMetadata, isFunction } from './utilities';

export const enum LogLevel {
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
  none = 6,
}

/**
 * Flags to enable/disable color usage in the logging output.
 */
export const enum ColorOptions {
  /**
   * Do not use ASCII color codes in logging output.
   */
  noColors = 0,
  /**
   * Use ASCII color codes in logging output. By default, timestamps and the TRC and DBG prefix are colored grey. INF white, WRN yellow, and ERR and FTL red.
   */
  colors = 1,
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
  sinks: (Class<ISink> | IRegistry)[];
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
export interface ILogger extends DefaultLogger {}

export const ILogConfig = DI.createInterface<ILogConfig>('ILogConfig', x => x.instance(new LogConfig(ColorOptions.noColors, LogLevel.warn)));
export const ISink = DI.createInterface<ISink>('ISink');
export const ILogEventFactory = DI.createInterface<ILogEventFactory>('ILogEventFactory', x => x.singleton(DefaultLogEventFactory));
export const ILogger = DI.createInterface<ILogger>('ILogger', x => x.singleton(DefaultLogger));
export const ILogScopes = DI.createInterface<string[]>('ILogScope');

interface SinkDefinition {
  handles: Exclude<LogLevel, LogLevel.none>[];
}

export const LoggerSink = Object.freeze({
  key: getAnnotationKeyFor('logger-sink-handles'),
  define<TSink extends ISink>(target: Constructable<TSink>, definition: SinkDefinition) {
    defineMetadata(this.key, definition.handles, target.prototype);
    return target;
  },
  getHandles<TSink extends ISink>(target: Constructable<TSink> | TSink) {
    return Metadata.get(this.key, target) as LogLevel[] | undefined;
  },
});
export function sink(definition: SinkDefinition) {
  return function <TSink extends ISink>(target: Constructable<TSink>): Constructable<TSink> {
    return LoggerSink.define(target, definition);
  };
}

export interface IConsoleLike {
  debug(message: string, ...optionalParams: unknown[]): void;
  info(message: string, ...optionalParams: unknown[]): void;
  warn(message: string, ...optionalParams: unknown[]): void;
  error(message: string, ...optionalParams: unknown[]): void;
}

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
export const format = toLookup({
  red<T extends string>(str: T): T {
    return `\u001b[31m${str}\u001b[39m` as T;
  },
  green<T extends string>(str: T): T {
    return `\u001b[32m${str}\u001b[39m` as T;
  },
  yellow<T extends string>(str: T): T {
    return `\u001b[33m${str}\u001b[39m` as T;
  },
  blue<T extends string>(str: T): T {
    return `\u001b[34m${str}\u001b[39m` as T;
  },
  magenta<T extends string>(str: T): T {
    return `\u001b[35m${str}\u001b[39m` as T;
  },
  cyan<T extends string>(str: T): T {
    return `\u001b[36m${str}\u001b[39m` as T;
  },
  white<T extends string>(str: T): T {
    return `\u001b[37m${str}\u001b[39m` as T;
  },
  grey<T extends string>(str: T): T {
    return `\u001b[90m${str}\u001b[39m` as T;
  },
} as const);

export interface ILogEvent {
  readonly severity: LogLevel;
  readonly optionalParams?: readonly unknown[];
  toString(): string;
}

export class LogConfig implements ILogConfig {
  public constructor(
    public readonly colorOptions: ColorOptions,
    public readonly level: LogLevel,
  ) {}
}

const getLogLevelString = (function () {
  const logLevelString = [
    toLookup({
      TRC: 'TRC',
      DBG: 'DBG',
      INF: 'INF',
      WRN: 'WRN',
      ERR: 'ERR',
      FTL: 'FTL',
      QQQ: '???',
    } as const),
    toLookup({
      TRC: format.grey('TRC'),
      DBG: format.grey('DBG'),
      INF: format.white('INF'),
      WRN: format.yellow('WRN'),
      ERR: format.red('ERR'),
      FTL: format.red('FTL'),
      QQQ: format.grey('???'),
    } as const),
  ] as const;

  return function (level: LogLevel, colorOptions: ColorOptions): string {
    if (level <= LogLevel.trace) {
      return logLevelString[colorOptions].TRC;
    }
    if (level <= LogLevel.debug) {
      return logLevelString[colorOptions].DBG;
    }
    if (level <= LogLevel.info) {
      return logLevelString[colorOptions].INF;
    }
    if (level <= LogLevel.warn) {
      return logLevelString[colorOptions].WRN;
    }
    if (level <= LogLevel.error) {
      return logLevelString[colorOptions].ERR;
    }
    if (level <= LogLevel.fatal) {
      return logLevelString[colorOptions].FTL;
    }
    return logLevelString[colorOptions].QQQ;
  };
})();

function getScopeString(scope: readonly string[], colorOptions: ColorOptions): string {
  if (colorOptions === ColorOptions.noColors) {
    return scope.join('.');
  }
  return scope.map(format.cyan).join('.');
}

function getIsoString(timestamp: number, colorOptions: ColorOptions): string {
  if (colorOptions === ColorOptions.noColors) {
    return new Date(timestamp).toISOString();
  }
  return format.grey(new Date(timestamp).toISOString());
}

export class DefaultLogEvent implements ILogEvent {
  public constructor(
    public readonly severity: LogLevel,
    public readonly message: string,
    public readonly optionalParams: unknown[],
    public readonly scope: readonly string[],
    public readonly colorOptions: ColorOptions,
    public readonly timestamp: number,
  ) {}

  public toString(): string {
    const { severity, message, scope, colorOptions, timestamp } = this;

    if (scope.length === 0) {
      return `${getIsoString(timestamp, colorOptions)} [${getLogLevelString(severity, colorOptions)}] ${message}`;
    }
    return `${getIsoString(timestamp, colorOptions)} [${getLogLevelString(severity, colorOptions)} ${getScopeString(scope, colorOptions)}] ${message}`;
  }
}

export class DefaultLogEventFactory implements ILogEventFactory {
  public constructor(
    @ILogConfig public readonly config: ILogConfig,
  ) {}

  public createLogEvent(logger: ILogger, level: LogLevel, message: string, optionalParams: unknown[]): ILogEvent {
    return new DefaultLogEvent(level, message, optionalParams, logger.scope, this.config.colorOptions, Date.now());
  }
}

export class ConsoleSink implements ISink {
  public static register(container: IContainer) {
    Registration.singleton(ISink, ConsoleSink).register(container);
  }

  public readonly handleEvent: (event: ILogEvent) => void;

  public constructor(
    @IPlatform p: IPlatform,
  ) {
    const $console = p.console as {
      debug(...args: unknown[]): void;
      info(...args: unknown[]): void;
      warn(...args: unknown[]): void;
      error(...args: unknown[]): void;
    };
    this.handleEvent = function emit(event: ILogEvent): void {
      const optionalParams = event.optionalParams;
      if (optionalParams === void 0 || optionalParams.length === 0) {
        const msg = event.toString();
        switch (event.severity) {
          case LogLevel.trace:
          case LogLevel.debug:
            return $console.debug(msg);
          case LogLevel.info:
            return $console.info(msg);
          case LogLevel.warn:
            return $console.warn(msg);
          case LogLevel.error:
          case LogLevel.fatal:
            return $console.error(msg);
        }
      } else {
        let msg = event.toString();
        let offset = 0;
        // console.log in chrome doesn't call .toString() on object inputs (https://bugs.chromium.org/p/chromium/issues/detail?id=1146817)
        while (msg.includes('%s')) {
          msg = msg.replace('%s', String(optionalParams[offset++]));
        }
        switch (event.severity) {
          case LogLevel.trace:
          case LogLevel.debug:
            return $console.debug(msg, ...optionalParams.slice(offset));
          case LogLevel.info:
            return $console.info(msg, ...optionalParams.slice(offset));
          case LogLevel.warn:
            return $console.warn(msg, ...optionalParams.slice(offset));
          case LogLevel.error:
          case LogLevel.fatal:
            return $console.error(msg, ...optionalParams.slice(offset));
        }
      }
    };
  }
}

export class DefaultLogger {
  /**
   * The root `ILogger` instance. On the root logger itself, this property circularly references the root. It is never null.
   *
   * When using `.scopeTo`, a new `ILogger` is created. That new logger will have the `root` property set to the global (non-scoped) logger.
   */
  public readonly root: ILogger;
  /**
   * The parent `ILogger` instance. On the root logger itself, this property circularly references the root. It is never null.
   *
   * When using `.scopeTo`, a new `ILogger` is created. That new logger will have the `parent` property set to the logger that it was created from.
   */
  public readonly parent: ILogger;
  /** @internal */
  public readonly traceSinks: ISink[];
  /** @internal */
  public readonly debugSinks: ISink[];
  /** @internal */
  public readonly infoSinks: ISink[];
  /** @internal */
  public readonly warnSinks: ISink[];
  /** @internal */
  public readonly errorSinks: ISink[];
  /** @internal */
  public readonly fatalSinks: ISink[];

  private readonly scopedLoggers: { [key: string]: ILogger | undefined } = createObject();

  public constructor(
    /**
     * The global logger configuration.
     */
    @ILogConfig public readonly config: ILogConfig,
    @ILogEventFactory private readonly factory: ILogEventFactory,
    @all(ISink) sinks: readonly ISink[],
    /**
     * The scopes that this logger was created for, if any.
     */
    @optional(ILogScopes) public readonly scope: string[] = [],
    @ignore parent: DefaultLogger | null = null,
  ) {
    let traceSinks: ISink[];
    let debugSinks: ISink[];
    let infoSinks: ISink[];
    let warnSinks: ISink[];
    let errorSinks: ISink[];
    let fatalSinks: ISink[];
    if (parent === null) {
      this.root = this;
      this.parent = this;

      traceSinks = this.traceSinks = [];
      debugSinks = this.debugSinks = [];
      infoSinks = this.infoSinks = [];
      warnSinks = this.warnSinks = [];
      errorSinks = this.errorSinks = [];
      fatalSinks = this.fatalSinks = [];
      for (const $sink of sinks) {
        const handles = LoggerSink.getHandles($sink);
        if (handles?.includes(LogLevel.trace) ?? true) {
          traceSinks.push($sink);
        }
        if (handles?.includes(LogLevel.debug) ?? true) {
          debugSinks.push($sink);
        }
        if (handles?.includes(LogLevel.info) ?? true) {
          infoSinks.push($sink);
        }
        if (handles?.includes(LogLevel.warn) ?? true) {
          warnSinks.push($sink);
        }
        if (handles?.includes(LogLevel.error) ?? true) {
          errorSinks.push($sink);
        }
        if (handles?.includes(LogLevel.fatal) ?? true) {
          fatalSinks.push($sink);
        }
      }
    } else {
      this.root = parent.root;
      this.parent = parent;

      traceSinks = this.traceSinks = parent.traceSinks;
      debugSinks = this.debugSinks = parent.debugSinks;
      infoSinks = this.infoSinks = parent.infoSinks;
      warnSinks = this.warnSinks = parent.warnSinks;
      errorSinks = this.errorSinks = parent.errorSinks;
      fatalSinks = this.fatalSinks = parent.fatalSinks;
    }
  }

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
  public trace(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  /**
   * Write to TRC output, if the configured `LogLevel` is set to `trace`.
   *
   * Intended for the most detailed information about internal app state.
   *
   * @param message - The message to pass to the `ILogEventFactory`.
   * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
   */
  public trace(message: unknown, ...optionalParams: unknown[]): void;
  @bound
  public trace(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
    if (this.config.level <= LogLevel.trace) {
      this.emit(this.traceSinks, LogLevel.trace, messageOrGetMessage, optionalParams);
    }
  }

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
  public debug(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  /**
   * Write to DBG output, if the configured `LogLevel` is set to `debug` or lower.
   *
   * Intended for information that is useful for debugging during development and has no long-term value.
   *
   * @param message - The message to pass to the `ILogEventFactory`.
   * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
   */
  public debug(message: unknown, ...optionalParams: unknown[]): void;
  @bound
  public debug(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
    if (this.config.level <= LogLevel.debug) {
      this.emit(this.debugSinks, LogLevel.debug, messageOrGetMessage, optionalParams);
    }
  }

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
  public info(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  /**
   * Write to trace UBF, if the configured `LogLevel` is set to `info` or lower.
   *
   * Intended for information about the general flow of the application that has long-term value.
   *
   * @param message - The message to pass to the `ILogEventFactory`.
   * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
   */
  public info(message: unknown, ...optionalParams: unknown[]): void;
  @bound
  public info(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
    if (this.config.level <= LogLevel.info) {
      this.emit(this.infoSinks, LogLevel.info, messageOrGetMessage, optionalParams);
    }
  }

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
  public warn(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  /**
   * Write to WRN output, if the configured `LogLevel` is set to `warn` or lower.
   *
   * Intended for unexpected circumstances that require attention but do not otherwise cause the current flow of execution to stop.
   *
   * @param message - The message to pass to the `ILogEventFactory`.
   * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
   */
  public warn(message: unknown, ...optionalParams: unknown[]): void;
  @bound
  public warn(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
    if (this.config.level <= LogLevel.warn) {
      this.emit(this.warnSinks, LogLevel.warn, messageOrGetMessage, optionalParams);
    }
  }

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
  public error(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  /**
   * Write to ERR output, if the configured `LogLevel` is set to `error` or lower.
   *
   * Intended for unexpected circumstances that cause the flow of execution in the current activity to stop but do not cause an app-wide failure.
   *
   * @param message - The message to pass to the `ILogEventFactory`.
   * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
   */
  public error(message: unknown, ...optionalParams: unknown[]): void;
  @bound
  public error(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
    if (this.config.level <= LogLevel.error) {
      this.emit(this.errorSinks, LogLevel.error, messageOrGetMessage, optionalParams);
    }
  }

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
  public fatal(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  /**
   * Write to FTL output, if the configured `LogLevel` is set to `fatal` or lower.
   *
   * Intended for unexpected circumstances that cause an app-wide failure or otherwise require immediate attention.
   *
   * @param message - The message to pass to the `ILogEventFactory`.
   * @param optionalParams - Any additional, optional params that should be passed to the `ILogEventFactory`
   */
  public fatal(message: unknown, ...optionalParams: unknown[]): void;
  @bound
  public fatal(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
    if (this.config.level <= LogLevel.fatal) {
      this.emit(this.fatalSinks, LogLevel.fatal, messageOrGetMessage, optionalParams);
    }
  }

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
  public scopeTo(name: string): ILogger {
    const scopedLoggers = this.scopedLoggers;
    let scopedLogger = scopedLoggers[name];
    if (scopedLogger === void 0) {
      scopedLogger = scopedLoggers[name] = new DefaultLogger(this.config, this.factory, (void 0)!, this.scope.concat(name), this);
    }
    return scopedLogger;
  }

  private emit(sinks: ISink[], level: LogLevel, msgOrGetMsg: unknown, optionalParams: unknown[]): void {
    const message = (isFunction(msgOrGetMsg) ? msgOrGetMsg() : msgOrGetMsg) as string;
    const event = this.factory.createLogEvent(this, level, message, optionalParams);
    for (let i = 0, ii = sinks.length; i < ii; ++i) {
      sinks[i].handleEvent(event);
    }
  }
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
 * container.register(LoggerConfiguration.create({sinks: [ConsoleSink]}))
 *
 * container.register(LoggerConfiguration.create({sinks: [ConsoleSink], level: LogLevel.debug}))
 *
 * ```
 */
export const LoggerConfiguration = toLookup({
  /**
   * @param $console - The `console` object to use. Can be the native `window.console` / `global.console`, but can also be a wrapper or mock that implements the same interface.
   * @param level - The global `LogLevel` to configure. Defaults to `warn` or higher.
   * @param colorOptions - Whether to use colors or not. Defaults to `noColors`. Colors are especially nice in nodejs environments but don't necessarily work (well) in all environments, such as browsers.
   */
  create(
    {
      level = LogLevel.warn,
      colorOptions = ColorOptions.noColors,
      sinks = [],
    }: Partial<ILoggingConfigurationOptions> = {}
  ): IRegistry {
    return toLookup({
      register(container: IContainer): IContainer {
        container.register(
          Registration.instance(ILogConfig, new LogConfig(colorOptions, level)),
        );
        for (const $sink of sinks) {
          if (isFunction($sink)) {
            container.register(Registration.singleton(ISink, $sink));
          } else {
            container.register($sink);
          }
        }
        return container;
      },
    });
  },
});
