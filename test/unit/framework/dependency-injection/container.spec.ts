import { Container } from '../../../../src/framework/dependency-injection/container';


describe('container', () => {
  describe('injection', () => {
    it('instantiates class without injected services', function() {
      class App {}

      let container = new Container();
      let app = container.get(App);

      expect(app).toEqual(jasmine.any(App));
    });

    it('uses static inject method (ES6)', function() {
      class Logger {}

      class App {
        logger;
        static inject() {
          return [Logger];
        }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      let app = container.get(App);
      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('uses static inject property (TypeScript,CoffeeScript,ES5)', function() {
      class Logger {}

      class App {
        static inject;
        logger;
        constructor(logger) {
          this.logger = logger;
        }
      }

      App.inject = [Logger];

      let container = new Container();
      let app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });
  });

  describe('inheritence', function() {
    class Logger {}
    class Service {}

    it('loads dependencies for the parent class', function() {
      class ParentApp {
        static inject() {
          return [Logger];
        }
        logger;
        constructor(logger) {
          this.logger = logger;
        }
      }

      class ChildApp extends ParentApp {
        constructor(dep) {
          super(dep);
        }
      }

      let container = new Container();
      let app = container.get(ChildApp);
      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('loads dependencies for the child class', function() {
      class ParentApp {}

      class ChildApp extends ParentApp {
        static inject() {
          return [Service];
        }
        service;
        constructor(service, ...rest) {
          super();
          this.service = service;
        }
      }

      let container = new Container();
      let app = container.get(ChildApp);
      expect(app.service).toEqual(jasmine.any(Service));
    });

    it('loads dependencies for both classes', function() {
      class ParentApp {
        static inject() {
          return [Logger];
        }
        logger;
        constructor(logger) {
          this.logger = logger;
        }
      }

      class ChildApp extends ParentApp {
        static inject() {
          return [Service];
        }
        service;
        constructor(service, dep) {
          super(dep);
          this.service = service;
        }
      }

      let container = new Container();
      let app = container.get(ChildApp);
      expect(app.service).toEqual(jasmine.any(Service));
      expect(app.logger).toEqual(jasmine.any(Logger));
    });
  });

  describe('registration', () => {
    it('asserts keys are defined', () => {
      let container = new Container();

      expect(() => container.get(null)).toThrow();
      expect(() => container.get(undefined)).toThrow();

      expect(() => container.registerInstance(null, {})).toThrow();
      expect(() => container.registerInstance(undefined, {})).toThrow();

      expect(() => container.registerSingleton(null)).toThrow();
      expect(() => container.registerSingleton(undefined)).toThrow();

      expect(() => container.registerTransient(null)).toThrow();
      expect(() => container.registerTransient(undefined)).toThrow();

      expect(() => container.autoRegister(null)).toThrow();
      expect(() => container.autoRegister(undefined)).toThrow();

      expect(() => container.autoRegisterAll([null])).toThrow();
      expect(() => container.autoRegisterAll([undefined])).toThrow();

      expect(() => container.registerHandler(null, undefined)).toThrow();
      expect(() => container.registerHandler(undefined, undefined)).toThrow();

      expect(() => (container as any).hasHandler(null)).toThrow();
      expect(() => (container as any).hasHandler(undefined)).toThrow();
    });

    it('configures transient (non singleton) via api', () => {
      class Logger {}

      class App1 {
        static inject() {
          return [Logger];
        }
        logger;
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() {
          return [Logger];
        }
        logger;
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      container.registerTransient(Logger, Logger);

      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('configures instance via api', () => {
      class Logger {}

      class App1 {
        logger;
        static inject() {
          return [Logger];
        }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        logger;
        static inject() {
          return [Logger];
        }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      let instance = new Logger();
      container.registerInstance(Logger, instance);

      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).toBe(instance);
      expect(app2.logger).toBe(instance);
    });

    it('configures custom via api', () => {
      class Logger {}

      class App1 {
        logger;
        static inject() {
          return [Logger];
        }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        logger;
        static inject() {
          return [Logger];
        }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      container.registerHandler(Logger, c => 'something strange');

      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).toEqual('something strange');
      expect(app2.logger).toEqual('something strange');
    });

    it('configures key as service when transient api only provided with key', () => {
      class Logger {}

      let container = new Container();
      container.registerTransient(Logger);

      let logger1 = container.get(Logger);
      let logger2 = container.get(Logger);

      expect(logger1).toEqual(jasmine.any(Logger));
      expect(logger2).toEqual(jasmine.any(Logger));
      expect(logger2).not.toBe(logger1);
    });

    it('configures key as service when singleton api only provided with key', () => {
      class Logger {}

      let container = new Container();
      container.registerSingleton(Logger);

      let logger1 = container.get(Logger);
      let logger2 = container.get(Logger);

      expect(logger1).toEqual(jasmine.any(Logger));
      expect(logger2).toEqual(jasmine.any(Logger));
      expect(logger2).toBe(logger1);
    });

    it('configures concrete singleton via api for abstract dependency', () => {
      class LoggerBase {}
      class Logger extends LoggerBase {}

      class App {
        logger;
        static inject() {
          return [LoggerBase];
        }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      container.registerSingleton(LoggerBase, Logger);

      let app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('configures concrete transient via api for abstract dependency', () => {
      class LoggerBase {}
      class Logger extends LoggerBase {}

      class App {
        logger;
        static inject() {
          return [LoggerBase];
        }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      container.registerTransient(LoggerBase, Logger);

      let app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });
  });
});
