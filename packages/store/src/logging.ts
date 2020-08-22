import { StoreOptions } from './store';

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
  if (options.logDefinitions?.hasOwnProperty(definition) &&
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    options.logDefinitions[definition] &&
    // eslint-disable-next-line compat/compat
    Object.values(LogLevel).includes(options.logDefinitions[definition]!)) {
    return options.logDefinitions[definition]!;
  }

  return defaultLevel;
}
