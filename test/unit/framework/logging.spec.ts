import * as LogManager from '../../../src/framework/logging';

describe('A simple log manager test', () => {
  it('should return a logger', () => {
    var logger = LogManager.getLogger('test');
    expect(logger).not.toBe(null);
  });

  // TODO: This test fails sometimes
  // it('should default to logLevel none', () => {
  //   var logger = LogManager.getLogger('test2');
  //   expect(logger.level).toBe(LogManager.logLevel.none);
  // });
});

describe('The log manager ', () => {
  var logName = 'test',
    logger,
    testAppender;

  class TestAppender {
    debug(args) {}
    info(args) {}
    warn(args) {}
    error(args) {}
  }

  beforeEach(() => {
    testAppender = new TestAppender();

    spyOn(testAppender, 'debug');
    spyOn(testAppender, 'info');
    spyOn(testAppender, 'warn');
    spyOn(testAppender, 'error');

    LogManager.clearAppenders();
    LogManager.addAppender(testAppender);

    logger = LogManager.getLogger(logName);
    LogManager.setLevel(LogManager.logLevel.none);
  });

  describe('when calling getAppenders ', () => {
    it('should return an array of added appenders', () => {
      const testAppender2 = new TestAppender();
      LogManager.addAppender(testAppender2);
      const appenders = LogManager.getAppenders();
      expect(appenders instanceof Array).toBeTruthy();
      expect(appenders).toEqual([testAppender, testAppender2]);
    });

    it('should not expose the internal appenders array', () => {
      LogManager.getAppenders().push(new TestAppender());
      expect(LogManager.getAppenders()).toEqual([testAppender]);
    });
  });

  it('should remove all appenders when calling clearAppenders', () => {
    LogManager.addAppender(new TestAppender());
    expect(LogManager.getAppenders().length).toBe(2);
    LogManager.clearAppenders();
    expect(LogManager.getAppenders().length).toBe(0);
  });

  it('should remove the test appender', () => {
    LogManager.setLevel(LogManager.logLevel.debug);
    LogManager.removeAppender(testAppender);
    logger.debug('foo');
    expect(testAppender.debug.calls.count()).toBe(0);
  });

  it('should not add logLevel "none" as a method of Logger.', () => {
    expect(logger.none).toBeUndefined();
  });

  it('should call only call debug when logLevel is debug', () => {
    LogManager.setLevel(LogManager.logLevel.debug);
    logger.debug('foo');

    LogManager.setLevel(LogManager.logLevel.info);
    logger.debug('foo');

    LogManager.setLevel(LogManager.logLevel.warn);
    logger.debug('foo');

    LogManager.setLevel(LogManager.logLevel.error);
    logger.debug('foo');

    LogManager.setLevel(LogManager.logLevel.none);
    logger.debug('foo');

    expect(testAppender.debug.calls.count()).toBe(1);
  });

  it('should call only call info when logLevel is debug or info', () => {
    LogManager.setLevel(LogManager.logLevel.debug);
    logger.info('foo');

    LogManager.setLevel(LogManager.logLevel.info);
    logger.info('foo');

    LogManager.setLevel(LogManager.logLevel.warn);
    logger.info('foo');

    LogManager.setLevel(LogManager.logLevel.error);
    logger.info('foo');

    LogManager.setLevel(LogManager.logLevel.none);
    logger.info('foo');

    expect(testAppender.info.calls.count()).toBe(2);
  });

  it('should call only call warn when logLevel is debug, info, or warn', () => {
    LogManager.setLevel(LogManager.logLevel.debug);
    logger.warn('foo');

    LogManager.setLevel(LogManager.logLevel.info);
    logger.warn('foo');

    LogManager.setLevel(LogManager.logLevel.warn);
    logger.warn('foo');

    LogManager.setLevel(LogManager.logLevel.error);
    logger.warn('foo');

    LogManager.setLevel(LogManager.logLevel.none);
    logger.warn('foo');

    expect(testAppender.warn.calls.count()).toBe(3);
  });

  it('should call only call error when logLevel is debug, info, warn, or error', () => {
    LogManager.setLevel(LogManager.logLevel.debug);
    logger.error('foo');

    LogManager.setLevel(LogManager.logLevel.info);
    logger.error('foo');

    LogManager.setLevel(LogManager.logLevel.warn);
    logger.error('foo');

    LogManager.setLevel(LogManager.logLevel.error);
    logger.error('foo');

    LogManager.setLevel(LogManager.logLevel.none);
    logger.error('foo');

    expect(testAppender.error.calls.count()).toBe(4);
  });

  it('should pass arguments to the appender', () => {
    LogManager.setLevel(LogManager.logLevel.debug);
    logger.debug(123);

    expect(testAppender.debug).toHaveBeenCalledWith(logger, 123);
  });

  it('should pass multiple arguments to the appender', () => {
    var objectToLog = {
      id: 1,
      name: 'John'
    };

    LogManager.setLevel(LogManager.logLevel.debug);
    logger.debug(123, objectToLog);

    expect(testAppender.debug).toHaveBeenCalledWith(logger, 123, objectToLog);
  });

  // TODO: This test fails
  // it('should throw an exception if the Logger class is newed up by the developer', () => {
  //   var attemptingToNewUpALogger = () => {
  //     var myNewLogger = new LogManager.Logger(undefined);
  //   };
  //   expect(attemptingToNewUpALogger).toThrow();
  // });

  it('should be able to return the global logLevel', () => {
    LogManager.setLevel(LogManager.logLevel.debug);
    var globalLogLevel = LogManager.getLevel();

    expect(globalLogLevel).toEqual(LogManager.logLevel.debug);
  });

  describe('setting logLevel per individual logger instance', () => {
    it('should not log if specific logger logLevel is none', () => {
      //  get a new logger we can squelch individually
      let logger2 = LogManager.getLogger('test2');

      // sets log level for ALL loggers to debug
      LogManager.setLevel(LogManager.logLevel.debug);

      // set logger-specific level - turning off logging for the logger2 source
      logger2.setLevel(LogManager.logLevel.none);

      logger.debug('foo'); // this should log
      logger2.debug('foo'); // this should not

      expect(testAppender.debug.calls.count()).toBe(1);
    });

    it('can log at different levels for different loggers', () => {
      var logger2 = LogManager.getLogger('test2');

      logger.setLevel(LogManager.logLevel.error);
      logger2.setLevel(LogManager.logLevel.debug);

      logger.debug('foo');
      logger.info('for');
      logger.error('foo');
      logger.warn('foo');

      logger2.debug('foo');

      expect(testAppender.debug.calls.count()).toBe(1);
      expect(testAppender.debug.calls.argsFor(0)).toEqual([jasmine.objectContaining({ id: 'test2' }), 'foo']);
      expect(testAppender.error.calls.count()).toBe(1);
      expect(testAppender.error.calls.argsFor(0)).toEqual([jasmine.objectContaining({ id: 'test' }), 'foo']);
    });

    it('setting LogManager log level resets any logger-specific levels', () => {
      var logger2 = LogManager.getLogger('test2');

      logger.setLevel(LogManager.logLevel.warn);
      logger2.setLevel(LogManager.logLevel.debug);
      // this overrides the individual log levels set above
      LogManager.setLevel(LogManager.logLevel.error);

      expect(logger2.level).toBe(LogManager.logLevel.error);
      expect(logger.level).toBe(LogManager.logLevel.error);
    });

    it('carries a global logLevel with which all created loggers are initialized', () => {
      LogManager.setLevel(LogManager.logLevel.debug);
      var logger2 = LogManager.getLogger('test2');
      expect(logger2.level).toBe(LogManager.logLevel.debug);
    });
  });
});

describe('The log manager', () => {
  var logName = 'test',
    logger,
    testAppender,
    customLevelAppender;
  var customLevel = { name: 'trace', value: 35 }; // Value between info and debug.

  class TestAppender {
    debug(args) {}
    info(args) {}
    warn(args) {}
    error(args) {}
  }

  class CustomLevelAppender {
    debug(args) {}
    info(args) {}
    warn(args) {}
    error(args) {}
    trace(args) {}
  }

  beforeEach(() => {
    LogManager.clearAppenders();
    testAppender = new TestAppender();
    customLevelAppender = new CustomLevelAppender();
  });

  function addLevel() {
    LogManager.addCustomLevel(customLevel.name, customLevel.value);
  }
  function removeLevel() {
    LogManager.removeCustomLevel(customLevel.name);
  }

  describe('calling addCustomLevel', () => {
    describe('should add level to logLevels', () => {
      beforeEach(addLevel);
      afterEach(removeLevel);

      it('with provided name', () => {
        expect(LogManager.logLevel[customLevel.name]).toBeDefined();
      });

      it('with the provided severity value', () => {
        expect(LogManager.logLevel[customLevel.name]).toBe(customLevel.value);
      });
    });

    it('should throw when level exists.', () => {
      expect(() => {
        LogManager.addCustomLevel('info', customLevel.value);
      }).toThrow();
    });

    it('should throw when severity value is not a number.', () => {
      expect(() => {
        LogManager.addCustomLevel(customLevel.name, 'Invalid' as any);
      }).toThrow();
    });

    function addsLevelAsMethod() {
      it('adds the level as a method of Logger', () => {
        const logger: any = LogManager.getLogger(logName);
        expect(logger.trace).toBeUndefined();
        addLevel();
        expect(typeof logger.trace).toBe('function');
        removeLevel();
      });
    }

    describe('before appenders have been added', () => {
      addsLevelAsMethod();
    });

    describe('after appenders have been added', () => {
      beforeEach(() => {
        LogManager.addAppender(testAppender);
        LogManager.addAppender(customLevelAppender);
      });

      addsLevelAsMethod();
    });
  });

  describe('calling removeCustomLevel', () => {
    it('removes level from logLevels', () => {
      addLevel();
      expect(LogManager.logLevel[customLevel.name]).toBeDefined();
      removeLevel();
      expect(LogManager.logLevel[customLevel.name]).toBeUndefined();
    });

    it('does nothing if level does not exist.', () => {
      expect(() => {
        LogManager.removeCustomLevel('nonexistent');
      }).not.toThrow();
    });

    let level;
    for (level in (LogManager as any).logLevels) {
      it(`should throw when called with built-in level "${level}"`, () => {
        expect(() => {
          LogManager.removeCustomLevel(level);
        }).toThrow();
      });
    }

    it('removes the level as a method of Logger', () => {
      const logger: any = LogManager.getLogger(logName);
      addLevel();
      expect(logger.trace).toBeDefined();
      removeLevel();
      expect(logger.trace).toBeUndefined();
    });
  });

  describe('', () => {
    beforeEach(() => {
      addLevel();
      LogManager.clearAppenders();
      customLevelAppender = new CustomLevelAppender();
      spyOn(customLevelAppender, 'trace');
    });
    afterEach(removeLevel);

    it('calls custom method on supported appenders.', () => {
      LogManager.addAppender(customLevelAppender);
      const logger: any = LogManager.getLogger(logName);
      logger.setLevel(LogManager.logLevel.debug);
      logger.trace('foo');
      expect(customLevelAppender.trace.calls.count()).toBe(1);
    });

    it('does not call custom method on appender when level is higher than custom severity value.', () => {
      LogManager.addAppender(customLevelAppender);
      const logger: any = LogManager.getLogger(logName);
      logger.setLevel(LogManager.logLevel.info);
      logger.trace('foo');
      expect(customLevelAppender.trace.calls.count()).toBe(0);
    });

    it('does not attempt to call custom method on unsupported appenders.', () => {
      testAppender = new TestAppender();
      LogManager.addAppender(testAppender);
      const logger: any = LogManager.getLogger(logName);
      logger.setLevel(LogManager.logLevel.debug);
      expect(() => {
        logger.trace('foo');
      }).not.toThrow();
    });
  });
});
