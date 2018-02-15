/**
* Specifies the available logging levels.
*/
interface LogLevel {
  /**
  * No logging.
  */
  none: number,
  /**
  * Log only error messages.
  */
  error: number,
  /**
  * Log warnings messages or above.
  */
  warn: number,
  /**
  * Log informational messages or above.
  */
  info: number,
  /**
  * Log all messages.
  */
  debug: number,

  /**
  * Additional log levels defined at runtime.
  */
  [level: string]: number
}

/**
* Specifies the available logging levels.
*/
export const logLevel: LogLevel = {
  none: 0,
  error: 10,
  warn: 20,
  info: 30,
  debug: 40
};

let loggers = {};
let appenders = [];
let globalDefaultLevel = logLevel.none;
let slice = Array.prototype.slice;

const standardLevels = ['none', 'error', 'warn', 'info', 'debug'];

function isStandardLevel(level: string) {
  return standardLevels.filter(l => l === level).length > 0;
}

function appendArgs() {
  return [this].concat(slice.call(arguments));
}

function logFactory(level) {
  const threshold = logLevel[level];
  return function() {
    // In this function, this === logger
    if (this.level < threshold) {
      return;
    }
    // We don't want to disable optimizations (such as inlining) in this function
    // so we do the arguments manipulation in another function.
    // Note that Function#apply is very special for V8.
    const args = appendArgs.apply(this, arguments);
    let i = appenders.length;
    while (i--) {
      appenders[i][level](...args);
    }
  };
}

function logFactoryCustom(level) {
  //This function is the same as logFactory() except that it checks that the method
  //is defined on the appender.
  const threshold = logLevel[level];
  return function() {
    // In this function, this === logger
    if (this.level < threshold) {
      return;
    }
    // We don't want to disable optimizations (such as inlining) in this function
    // so we do the arguments manipulation in another function.
    // Note that Function#apply is very special for V8.
    const args = appendArgs.apply(this, arguments);
    let i = appenders.length;
    while (i--) {
      const appender = appenders[i];
      if (appender[level] !== undefined) {
        appender[level](...args);
      }
    }
  };
}

function connectLoggers() {
  let proto = Logger.prototype;
  for (let level in logLevel) {
    if (isStandardLevel(level)) {
      if (level !== 'none') {
        proto[level] = logFactory(level);
      }
    } else {
      proto[level] = logFactoryCustom(level);
    }
  }
}

function disconnectLoggers() {
  let proto = Logger.prototype;
  for (let level in logLevel) {
    if (level !== 'none') {
      proto[level] = function() { };
    }
  }
}

/**
* Gets the instance of a logger associated with a particular id (or creates one if it doesn't already exist).
*
* @param id The id of the logger you wish to get an instance of.
* @return The instance of the logger, or creates a new logger if none exists for that id.
*/
export function getLogger(id: string): Logger {
  return loggers[id] || new Logger(id);
}

/**
* Implemented by classes which wish to append log data to a target data store.
*/
interface Appender {

  /**
  * Appends a debug log.
  *
  * @param logger The source logger.
  * @param rest The data to log.
  */
  debug(logger: Logger, ...rest: any[]): void;

  /**
  * Appends an info log.
  *
  * @param logger The source logger.
  * @param rest The data to log.
  */
  info(logger: Logger, ...rest: any[]): void;

  /**
  * Appends a warning log.
  *
  * @param logger The source logger.
  * @param rest The data to log.
  */
  warn(logger: Logger, ...rest: any[]): void;

  /**
  * Appends an error log.
  *
  * @param logger The source logger.
  * @param rest The data to log.
  */
  error(logger: Logger, ...rest: any[]): void;
}

/**
* Adds an appender capable of processing logs and channeling them to an output.
*
* @param appender An appender instance to begin processing logs with.
*/
export function addAppender(appender: Appender): void {
  if (appenders.push(appender) === 1) {
    connectLoggers();
  }
}

/**
* Removes an appender.
* @param appender An appender that has been added previously.
*/
export function removeAppender(appender: Appender): void {
  appenders = appenders.filter(a => a !== appender);
}

/**
 * Gets an array of all appenders.
 */
export function getAppenders() {
  return [...appenders];
}

/**
 * Removes all appenders.
 */
export function clearAppenders(): void {
  appenders = [];
  disconnectLoggers();
}

/**
 * Adds a custom log level that will be added as an additional method to Logger.
 * Logger will call the corresponding method on any appenders that support it.
 *
 * @param name The name for the new log level.
 * @param value The numeric severity value for the level (higher is more severe).
 */
export function addCustomLevel(name: string, value: number): void {
  if (logLevel[name] !== undefined) {
    throw Error(`Log level "${name}" already exists.`);
  }

  if (isNaN(value)) {
    throw Error('Value must be a number.');
  }

  logLevel[name] = value;

  if (appenders.length > 0) {
    //Reinitialize the Logger prototype with the new method.
    connectLoggers();
  } else {
    //Add the custom level as a noop by default.
    Logger.prototype[name] = function() { };
  }
}

/**
 * Removes a custom log level.
 * @param name The name of a custom log level that has been added previously.
 */
export function removeCustomLevel(name: string): void {
  if (logLevel[name] === undefined) {
    return;
  }

  if (isStandardLevel(name)) {
    throw Error(`Built-in log level "${name}" cannot be removed.`);
  }

  delete logLevel[name];
  delete Logger.prototype[name];
}

/**
* Sets the level of logging for ALL the application loggers.
*
* @param level Matches a value of logLevel specifying the level of logging.
*/
export function setLevel(level: number): void {
  globalDefaultLevel = level;
  for (let key in loggers) {
    loggers[key].setLevel(level);
  }
}

/**
* Gets the level of logging of ALL the application loggers.
*
* @return The logLevel value used in all loggers.
*/
export function getLevel(): number {
  return globalDefaultLevel;
}

/**
* A logger logs messages to a set of appenders, depending on the log level that is set.
*/
export class Logger {
  /**
  * The id that the logger was created with.
  */
  id: string;

  /**
   * The logging severity level for this logger
   */
  level: number;

  /**
  * You cannot instantiate the logger directly - you must use the getLogger method instead.
  */
  constructor(id: string) {
    let cached = loggers[id];
    if (cached) {
      return cached;
    }

    loggers[id] = this;
    this.id = id;
    this.level = globalDefaultLevel;
  }

  /**
   * Logs a debug message.
   *
   * @param message The message to log.
   * @param rest The data to log.
   */
  debug(message: string, ...rest: any[]): void {}

  /**
   * Logs info.
   *
   * @param message The message to log.
   * @param rest The data to log.
   */
  info(message: string, ...rest: any[]): void {}

  /**
   * Logs a warning.
   *
   * @param message The message to log.
   * @param rest The data to log.
   */
  warn(message: string, ...rest: any[]): void {}

  /**
   * Logs an error.
   *
   * @param message The message to log.
   * @param rest The data to log.
   */
  error(message: string, ...rest: any[]): void {}

  /**
   * Sets the level of logging for this logger instance
   *
   * @param level Matches a value of logLevel specifying the level of logging.
   */
  setLevel(level: number): void {
    this.level = level;
  }
}
