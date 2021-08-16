import type { StoreOptions } from './store.js';

export enum LogLevel {
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error'
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
  // eslint-disable-next-line no-prototype-builtins
  if (options.logDefinitions?.hasOwnProperty(definition) &&
    options.logDefinitions[definition] &&
    Object.values(LogLevel).includes(options.logDefinitions[definition]!)) {
    return options.logDefinitions[definition]!;
  }

  return defaultLevel;
}
