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
export const Reporter = {
  level: LogLevel.warn,
  write(code: number, ...params: unknown[]): void { return; },
  error(code: number, ...params: unknown[]): Error { return new Error(`Code ${code}`); }
};
