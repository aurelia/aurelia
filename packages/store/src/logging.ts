import { StoreOptions } from "./store";
import { Logger } from "aurelia-logging";

export enum LogLevel {
  trace = "trace",
  debug = "debug",
  info = "info",
  log = "log",
  warn = "warn",
  error = "error"
}

export class LoggerIndexed extends Logger {
  [key: string]: any;
}

export interface LogDefinitions {
  performanceLog?: LogLevel;
  dispatchedActions?: LogLevel;
  devToolsStatus?: LogLevel;
}

export function getLogType(
  options: Partial<StoreOptions>,
  definition: keyof LogDefinitions,
  defaultLevel: LogLevel
): LogLevel {
  if (definition &&
    options.logDefinitions?.hasOwnProperty(definition) &&
    options.logDefinitions[definition] &&
    Object.values(LogLevel).includes(options.logDefinitions[definition]!)) {
    return options.logDefinitions[definition]!;
  }

  return defaultLevel;
}
