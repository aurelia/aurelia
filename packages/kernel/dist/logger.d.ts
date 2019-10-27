import { IRegistry } from './di';
import { LogLevel } from './reporter';
export declare const enum ColorOptions {
    noColors = 0,
    colors = 1
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
export declare const ILogConfig: import("./di").InterfaceSymbol<ILogConfig>;
export declare const ISink: import("./di").InterfaceSymbol<ISink>;
export declare const ILogEventFactory: import("./di").InterfaceSymbol<ILogEventFactory>;
export declare const ILogger: import("./di").InterfaceSymbol<ILogger>;
export interface IConsoleLike {
    debug(message: string, ...optionalParams: unknown[]): void;
    info(message: string, ...optionalParams: unknown[]): void;
    warn(message: string, ...optionalParams: unknown[]): void;
    error(message: string, ...optionalParams: unknown[]): void;
}
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
    readonly emit: (event: ILogEvent) => void;
    constructor($console: IConsoleLike);
}
export declare class DefaultLogger implements ILogger {
    readonly config: ILogConfig;
    private readonly factory;
    private readonly sinks;
    readonly scope: string[];
    readonly root: ILogger;
    readonly parent: ILogger;
    readonly trace: (...args: unknown[]) => void;
    readonly debug: (...args: unknown[]) => void;
    readonly info: (...args: unknown[]) => void;
    readonly warn: (...args: unknown[]) => void;
    readonly error: (...args: unknown[]) => void;
    readonly fatal: (...args: unknown[]) => void;
    constructor(config: ILogConfig, factory: ILogEventFactory, sinks: ISink[], scope?: string[], parent?: ILogger | null);
    scopeTo(name: string): ILogger;
}
export declare const LoggerConfiguration: {
    create($console: IConsoleLike, level?: LogLevel, colorOptions?: ColorOptions): IRegistry;
};
//# sourceMappingURL=logger.d.ts.map