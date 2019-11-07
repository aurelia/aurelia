import { toLookup } from './functions';
import { DI, all, IRegistry, IContainer, Registration } from './di';
import { LogLevel } from './reporter';

export const enum ColorOptions {
  noColors = 0,
  colors = 1,
}

export interface ILogConfig {
  colorOptions: ColorOptions;
  level: LogLevel;
}

export interface ILogEventFactory {
  createLogEvent(logger: ILogger, logLevel: LogLevel, message: string, optionalParams: unknown[]): ILogEvent;
}

export interface ISink {
  emit(event: ILogEvent): void;
}

export interface ILogger {
  readonly root: ILogger;
  readonly parent: ILogger;
  readonly scope: readonly string[];
  readonly config: ILogConfig;

  trace(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  trace(message: unknown, ...optionalParams: unknown[]): void;

  debug(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  debug(message: unknown, ...optionalParams: unknown[]): void;

  info(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  info(message: unknown, ...optionalParams: unknown[]): void;

  warn(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  warn(message: unknown, ...optionalParams: unknown[]): void;

  error(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  error(message: unknown, ...optionalParams: unknown[]): void;

  fatal(getMessage: () => unknown, ...optionalParams: unknown[]): void;
  fatal(message: unknown, ...optionalParams: unknown[]): void;

  scopeTo(name: string): ILogger;
}

export const ILogConfig = DI.createInterface<ILogConfig>('ILogConfig').noDefault();
export const ISink = DI.createInterface<ISink>('ISink').noDefault();
export const ILogEventFactory = DI.createInterface<ILogEventFactory>('ILogEventFactory').noDefault();
export const ILogger = DI.createInterface<ILogger>('ILogger').noDefault();

export interface IConsoleLike {
  debug(message: string, ...optionalParams: unknown[]): void;
  info(message: string, ...optionalParams: unknown[]): void;
  warn(message: string, ...optionalParams: unknown[]): void;
  error(message: string, ...optionalParams: unknown[]): void;
}

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
const format = toLookup({
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
  // eslint-disable-next-line @typescript-eslint/unbound-method
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
  public readonly emit: (event: ILogEvent) => void;

  public constructor($console: IConsoleLike) {
    this.emit = function emit(event: ILogEvent): void {
      const optionalParams = event.optionalParams;
      if (optionalParams === void 0 || optionalParams.length === 0) {
        switch (event.severity) {
          case LogLevel.trace:
          case LogLevel.debug:
            return $console.debug(event.toString());
          case LogLevel.info:
            return $console.info(event.toString());
          case LogLevel.warn:
            return $console.warn(event.toString());
          case LogLevel.error:
          case LogLevel.fatal:
            return $console.error(event.toString());
        }
      } else {
        switch (event.severity) {
          case LogLevel.trace:
          case LogLevel.debug:
            return $console.debug(event.toString(), ...optionalParams);
          case LogLevel.info:
            return $console.info(event.toString(), ...optionalParams);
          case LogLevel.warn:
            return $console.warn(event.toString(), ...optionalParams);
          case LogLevel.error:
          case LogLevel.fatal:
            return $console.error(event.toString(), ...optionalParams);
        }
      }
    };
  }
}

export class DefaultLogger implements ILogger {
  public readonly root: ILogger;
  public readonly parent: ILogger;

  public readonly trace: (...args: unknown[]) => void;
  public readonly debug: (...args: unknown[]) => void;
  public readonly info: (...args: unknown[]) => void;
  public readonly warn: (...args: unknown[]) => void;
  public readonly error: (...args: unknown[]) => void;
  public readonly fatal: (...args: unknown[]) => void;

  private readonly scopedLoggers: { [key: string]: ILogger | undefined } = Object.create(null);

  public constructor(
    @ILogConfig public readonly config: ILogConfig,
    @ILogEventFactory private readonly factory: ILogEventFactory,
    @all(ISink) private readonly sinks: ISink[],
    public readonly scope: string[] = [],
    parent: ILogger | null = null,
  ) {
    if (parent === null) {
      this.root = this;
      this.parent = this;
    } else {
      this.root = parent.root;
      this.parent = parent;
    }

    const sinksLen = sinks.length;
    let i = 0;

    const emit = (level: LogLevel, msgOrGetMsg: unknown, optionalParams: unknown[]): void => {
      const message = typeof msgOrGetMsg === 'function' ? msgOrGetMsg() : msgOrGetMsg;
      const event = factory.createLogEvent(this, level, message, optionalParams);
      for (i = 0; i < sinksLen; ++i) {
        sinks[i].emit(event);
      }
    };

    this.trace = function trace(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
      if (config.level <= LogLevel.trace) {
        emit(LogLevel.trace, messageOrGetMessage, optionalParams);
      }
    };

    this.debug = function debug(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
      if (config.level <= LogLevel.debug) {
        emit(LogLevel.debug, messageOrGetMessage, optionalParams);
      }
    };

    this.info = function info(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
      if (config.level <= LogLevel.info) {
        emit(LogLevel.info, messageOrGetMessage, optionalParams);
      }
    };

    this.warn = function warn(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
      if (config.level <= LogLevel.warn) {
        emit(LogLevel.warn, messageOrGetMessage, optionalParams);
      }
    };

    this.error = function error(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
      if (config.level <= LogLevel.error) {
        emit(LogLevel.error, messageOrGetMessage, optionalParams);
      }
    };

    this.fatal = function fatal(messageOrGetMessage: unknown, ...optionalParams: unknown[]): void {
      if (config.level <= LogLevel.fatal) {
        emit(LogLevel.fatal, messageOrGetMessage, optionalParams);
      }
    };
  }

  public scopeTo(name: string): ILogger {
    const scopedLoggers = this.scopedLoggers;
    let scopedLogger = scopedLoggers[name];
    if (scopedLogger === void 0) {
      scopedLogger = scopedLoggers[name] = new DefaultLogger(this.config, this.factory, this.sinks, this.scope.concat(name), this);
    }
    return scopedLogger;
  }
}

export const LoggerConfiguration = toLookup({
  create(
    $console: IConsoleLike,
    level: LogLevel = LogLevel.warn,
    colorOptions = ColorOptions.noColors,
  ): IRegistry {
    return toLookup({
      register(container: IContainer): IContainer {
        return container.register(
          Registration.instance(ILogConfig, new LogConfig(colorOptions, level)),
          Registration.instance(ISink, new ConsoleSink($console)),
          Registration.singleton(ILogEventFactory, DefaultLogEventFactory),
          Registration.singleton(ILogger, DefaultLogger),
        );
      },
    });
  },
});
