(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.kernel = {}));
}(this, function (exports) { 'use strict';

  const $global = (function () {
      // https://github.com/Microsoft/tslint-microsoft-contrib/issues/415
      // tslint:disable:no-typeof-undefined
      if (typeof global !== 'undefined') {
          return global;
      }
      if (typeof self !== 'undefined') {
          return self;
      }
      if (typeof window !== 'undefined') {
          return window;
      }
      // tslint:enable:no-typeof-undefined
      try {
          // Not all environments allow eval and Function. Use only as a last resort:
          // tslint:disable-next-line:no-function-constructor-with-string-args function-constructor
          return new Function('return this')();
      }
      catch (_a) {
          // If all fails, give up and create an object.
          // tslint:disable-next-line:no-object-literal-type-assertion
          return {};
      }
      // @ts-ignore 2683
  })();
  // performance.now polyfill for non-browser envs based on https://github.com/myrne/performance-now
  const $now = (function () {
      let getNanoSeconds;
      let hrtime;
      let loadTime;
      let moduleLoadTime;
      let nodeLoadTime;
      let upTime;
      if (($global.performance !== undefined && $global.performance !== null) && $global.performance.now) {
          const $performance = $global.performance;
          return function () {
              return $performance.now();
          };
      }
      else if (($global.process !== undefined && $global.process !== null) && $global.process.hrtime) {
          const now = function () {
              return (getNanoSeconds() - nodeLoadTime) / 1e6;
          };
          hrtime = $global.process.hrtime;
          getNanoSeconds = function () {
              let hr;
              hr = hrtime();
              return hr[0] * 1e9 + hr[1];
          };
          moduleLoadTime = getNanoSeconds();
          upTime = $global.process.uptime() * 1e9;
          nodeLoadTime = moduleLoadTime - upTime;
          return now;
      }
      else if (Date.now) {
          const now = function () {
              return Date.now() - loadTime;
          };
          loadTime = Date.now();
          return now;
      }
      else {
          const now = function () {
              return new Date().getTime() - loadTime;
          };
          loadTime = new Date().getTime();
          return now;
      }
  })();
  // RAF polyfill for non-browser envs from https://github.com/chrisdickinson/raf/blob/master/index.js
  const $raf = (function () {
      const vendors = ['moz', 'webkit'];
      const suffix = 'AnimationFrame';
      let raf = $global[`request${suffix}`];
      let caf = $global[`cancel${suffix}`] || $global[`cancelRequest${suffix}`];
      for (let i = 0; !raf && i < vendors.length; ++i) {
          raf = $global[`${vendors[i]}Request${suffix}`];
          caf = $global[`${vendors[i]}Cancel${suffix}`] || $global[`${vendors[i]}CancelRequest${suffix}`];
      }
      // Some versions of FF have rAF but not cAF
      if (!raf || !caf) {
          let last = 0;
          let id = 0;
          const queue = [];
          const frameDuration = 1000 / 60;
          raf = function (callback) {
              let _now;
              let next;
              if (queue.length === 0) {
                  _now = $now();
                  next = Math.max(0, frameDuration - (_now - last));
                  last = next + _now;
                  setTimeout(function () {
                      const cp = queue.slice(0);
                      // Clear queue here to prevent callbacks from appending listeners to the current frame's queue
                      queue.length = 0;
                      for (let i = 0; i < cp.length; ++i) {
                          if (!cp[i].cancelled) {
                              try {
                                  cp[i].callback(last);
                              }
                              catch (e) {
                                  setTimeout(function () { throw e; }, 0);
                              }
                          }
                      }
                  }, Math.round(next));
              }
              queue.push({
                  handle: ++id,
                  callback: callback,
                  cancelled: false
              });
              return id;
          };
          caf = function (handle) {
              for (let i = 0; i < queue.length; ++i) {
                  if (queue[i].handle === handle) {
                      queue[i].cancelled = true;
                  }
              }
          };
      }
      const $$raf = function (callback) {
          return raf.call($global, callback);
      };
      $$raf.cancel = function () {
          caf.apply($global, arguments);
      };
      $global.requestAnimationFrame = raf;
      $global.cancelAnimationFrame = caf;
      return $$raf;
  })();
  const camelCaseLookup = {};
  const kebabCaseLookup = {};
  const PLATFORM = {
      global: $global,
      emptyArray: Object.freeze([]),
      emptyObject: Object.freeze({}),
      noop() { return; },
      now: $now,
      camelCase(input) {
          // benchmark: http://jsben.ch/qIz4Z
          let value = camelCaseLookup[input];
          if (value !== undefined)
              return value;
          value = '';
          let first = true;
          let sep = false;
          let char;
          for (let i = 0, ii = input.length; i < ii; ++i) {
              char = input.charAt(i);
              if (char === '-' || char === '.' || char === '_') {
                  sep = true; // skip separators
              }
              else {
                  value = value + (first ? char.toLowerCase() : (sep ? char.toUpperCase() : char));
                  sep = false;
              }
              first = false;
          }
          return camelCaseLookup[input] = value;
      },
      kebabCase(input) {
          // benchmark: http://jsben.ch/v7K9T
          let value = kebabCaseLookup[input];
          if (value !== undefined)
              return value;
          value = '';
          let first = true;
          let char, lower;
          for (let i = 0, ii = input.length; i < ii; ++i) {
              char = input.charAt(i);
              lower = char.toLowerCase();
              value = value + (first ? lower : (char !== lower ? `-${lower}` : lower));
              first = false;
          }
          return kebabCaseLookup[input] = value;
      },
      toArray(input) {
          // benchmark: http://jsben.ch/xjsyF
          const len = input.length;
          const arr = Array(len);
          for (let i = 0; i < len; ++i) {
              arr[i] = input[i];
          }
          return arr;
      },
      requestAnimationFrame(callback) {
          return $raf(callback);
      },
      clearInterval(handle) {
          $global.clearInterval(handle);
      },
      clearTimeout(handle) {
          $global.clearTimeout(handle);
      },
      // tslint:disable-next-line:no-any
      setInterval(handler, timeout, ...args) {
          return $global.setInterval(handler, timeout, ...args);
      },
      // tslint:disable-next-line:no-any
      setTimeout(handler, timeout, ...args) {
          return $global.setTimeout(handler, timeout, ...args);
      }
  };

  const Reporter = {
      write(code, ...params) { return; },
      error(code, ...params) { return new Error(`Code ${code}`); }
  };
  const Tracer = {
      /**
       * A convenience property for the user to conditionally call the tracer.
       * This saves unnecessary `noop` and `slice` calls in non-AOT scenarios even if debugging is disabled.
       * In AOT these calls will simply be removed entirely.
       *
       * This property **only** turns on tracing if `@aurelia/debug` is included and configured as well.
       */
      enabled: false,
      liveLoggingEnabled: false,
      liveWriter: null,
      /**
       * Call this at the start of a method/function.
       * Each call to `enter` **must** have an accompanying call to `leave` for the tracer to work properly.
       * @param name Any human-friendly name to identify the traced method with.
       * @param args Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
       */
      enter(name, args) { return; },
      /**
       * Call this at the end of a method/function. Pops one trace item off the stack.
       */
      leave() { return; },
      /**
       * Writes only the trace info leading up to the current method call.
       * @param writer An object to write the output to.
       */
      writeStack(writer) { return; },
      /**
       * Writes all trace info captured since the previous flushAll operation.
       * @param writer An object to write the output to. Can be null to simply reset the tracer state.
       */
      flushAll(writer) { return; },
      /**
       * Writes out each trace info item as they are traced.
       * @param writer An object to write the output to.
       */
      enableLiveLogging(writer) { return; },
      /**
       * Stops writing out each trace info item as they are traced.
       */
      disableLiveLogging() { return; }
  };

  // Shims to augment the Reflect object with methods used from the Reflect Metadata API proposal:
  // https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
  // https://rbuckton.github.io/reflect-metadata/
  // As the official spec proposal uses "any", we use it here as well and suppress related typedef linting warnings.
  if (!('getOwnMetadata' in Reflect)) {
      // tslint:disable-next-line:no-any
      Reflect.getOwnMetadata = function (metadataKey, target) {
          return target[metadataKey];
      };
      // tslint:disable-next-line:no-any
      Reflect.metadata = function (metadataKey, metadataValue) {
          return function (target) {
              target[metadataKey] = metadataValue;
          };
      };
  }
  const DI = {
      createContainer() {
          return new Container();
      },
      getDesignParamTypes(target) {
          return Reflect.getOwnMetadata('design:paramtypes', target) || PLATFORM.emptyArray;
      },
      getDependencies(Type) {
          let dependencies;
          if (Type.inject === undefined) {
              dependencies = DI.getDesignParamTypes(Type);
          }
          else {
              dependencies = [];
              let ctor = Type;
              while (typeof ctor === 'function') {
                  if (ctor.hasOwnProperty('inject')) {
                      dependencies.push(...ctor.inject);
                  }
                  ctor = Object.getPrototypeOf(ctor);
              }
          }
          return dependencies;
      },
      createInterface(friendlyName) {
          const Key = function (target, property, index) {
              if (target === undefined) {
                  throw Reporter.error(16, Key); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
              }
              Key.friendlyName = friendlyName || 'Interface';
              (target.inject || (target.inject = []))[index] = Key;
              return target;
          };
          Key.noDefault = function () {
              return Key;
          };
          Key.withDefault = function (configure) {
              Key.withDefault = function () {
                  throw Reporter.error(17, Key);
              };
              Key.register = function (container, key) {
                  const trueKey = key || Key;
                  return configure({
                      instance(value) {
                          return container.registerResolver(trueKey, new Resolver(trueKey, 0 /* instance */, value));
                      },
                      singleton(value) {
                          return container.registerResolver(trueKey, new Resolver(trueKey, 1 /* singleton */, value));
                      },
                      transient(value) {
                          return container.registerResolver(trueKey, new Resolver(trueKey, 2 /* transient */, value));
                      },
                      callback(value) {
                          return container.registerResolver(trueKey, new Resolver(trueKey, 3 /* callback */, value));
                      },
                      aliasTo(destinationKey) {
                          return container.registerResolver(trueKey, new Resolver(trueKey, 5 /* alias */, destinationKey));
                      },
                  });
              };
              return Key;
          };
          return Key;
      },
      inject(...dependencies) {
          return function (target, key, descriptor) {
              if (typeof descriptor === 'number') { // It's a parameter decorator.
                  if (!target.hasOwnProperty('inject')) {
                      const types = DI.getDesignParamTypes(target);
                      target.inject = types.slice();
                  }
                  if (dependencies.length === 1) {
                      target.inject[descriptor] = dependencies[0];
                  }
              }
              else if (key) { // It's a property decorator. Not supported by the container without plugins.
                  const actualTarget = target.constructor;
                  (actualTarget.inject || (actualTarget.inject = {}))[key] = dependencies[0];
              }
              else if (descriptor) { // It's a function decorator (not a Class constructor)
                  const fn = descriptor.value;
                  fn.inject = dependencies;
              }
              else { // It's a class decorator.
                  if (dependencies.length === 0) {
                      const types = DI.getDesignParamTypes(target);
                      target.inject = types.slice();
                  }
                  else {
                      target.inject = dependencies;
                  }
              }
          };
      },
      // tslint:disable:jsdoc-format
      /**
       * Registers the `target` class as a transient dependency; each time the dependency is resolved
       * a new instance will be created.
       *
       * @param target The class / constructor function to register as transient.
       * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
       *
       * Example usage:
    ```ts
    // On an existing class
    class Foo { }
    DI.transient(Foo);
    
    // Inline declaration
    const Foo = DI.transient(class { });
    // Foo is now strongly typed with register
    Foo.register(container);
    ```
       */
      // tslint:enable:jsdoc-format
      transient(target) {
          target.register = function register(container) {
              const registration = Registration.transient(target, target);
              return registration.register(container, target);
          };
          return target;
      },
      // tslint:disable:jsdoc-format
      /**
       * Registers the `target` class as a singleton dependency; the class will only be created once. Each
       * consecutive time the dependency is resolved, the same instance will be returned.
       *
       * @param target The class / constructor function to register as a singleton.
       * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
       * Example usage:
    ```ts
    // On an existing class
    class Foo { }
    DI.singleton(Foo);
    
    // Inline declaration
    const Foo = DI.singleton(class { });
    // Foo is now strongly typed with register
    Foo.register(container);
    ```
       */
      // tslint:enable:jsdoc-format
      singleton(target) {
          target.register = function register(container) {
              const registration = Registration.singleton(target, target);
              return registration.register(container, target);
          };
          return target;
      }
  };
  const IContainer = DI.createInterface('IContainer').noDefault();
  const IServiceLocator = IContainer;
  function createResolver(getter) {
      return function (key) {
          const Key = function Key(target, property, descriptor) {
              DI.inject(Key)(target, property, descriptor);
          };
          Key.resolve = function (handler, requestor) {
              return getter(key, handler, requestor);
          };
          return Key;
      };
  }
  const inject = DI.inject;
  function transientDecorator(target) {
      return DI.transient(target);
  }
  function transient(target) {
      return target === undefined ? transientDecorator : transientDecorator(target);
  }
  function singletonDecorator(target) {
      return DI.singleton(target);
  }
  function singleton(target) {
      return target === undefined ? singletonDecorator : singletonDecorator(target);
  }
  const all = createResolver((key, handler, requestor) => requestor.getAll(key));
  const lazy = createResolver((key, handler, requestor) => {
      let instance = null; // cache locally so that lazy always returns the same instance once resolved
      return () => {
          if (instance === null) {
              instance = requestor.get(key);
          }
          return instance;
      };
  });
  const optional = createResolver((key, handler, requestor) => {
      if (requestor.has(key, true)) {
          return requestor.get(key);
      }
      else {
          return null;
      }
  });
  /** @internal */
  class Resolver {
      constructor(key, strategy, state) {
          this.key = key;
          this.strategy = strategy;
          this.state = state;
      }
      register(container, key) {
          return container.registerResolver(key || this.key, this);
      }
      resolve(handler, requestor) {
          switch (this.strategy) {
              case 0 /* instance */:
                  return this.state;
              case 1 /* singleton */: {
                  this.strategy = 0 /* instance */;
                  const factory = handler.getFactory(this.state);
                  return this.state = factory.construct(handler);
              }
              case 2 /* transient */: {
                  // Always create transients from the requesting container
                  const factory = handler.getFactory(this.state);
                  return factory.construct(requestor);
              }
              case 3 /* callback */:
                  return this.state(handler, requestor, this);
              case 4 /* array */:
                  return this.state[0].resolve(handler, requestor);
              case 5 /* alias */:
                  return handler.get(this.state);
              default:
                  throw Reporter.error(6, this.strategy);
          }
      }
      getFactory(container) {
          switch (this.strategy) {
              case 1 /* singleton */:
              case 2 /* transient */:
                  return container.getFactory(this.state);
              default:
                  return null;
          }
      }
  }
  /** @internal */
  class Factory {
      constructor(Type, invoker, dependencies) {
          this.Type = Type;
          this.invoker = invoker;
          this.dependencies = dependencies;
          this.transformers = null;
      }
      static create(Type) {
          const dependencies = DI.getDependencies(Type);
          const invoker = classInvokers[dependencies.length] || fallbackInvoker;
          return new Factory(Type, invoker, dependencies);
      }
      construct(container, dynamicDependencies) {
          const transformers = this.transformers;
          let instance = dynamicDependencies !== undefined
              ? this.invoker.invokeWithDynamicDependencies(container, this.Type, this.dependencies, dynamicDependencies)
              : this.invoker.invoke(container, this.Type, this.dependencies);
          if (transformers === null) {
              return instance;
          }
          for (let i = 0, ii = transformers.length; i < ii; ++i) {
              instance = transformers[i](instance);
          }
          return instance;
      }
      registerTransformer(transformer) {
          if (this.transformers === null) {
              this.transformers = [];
          }
          this.transformers.push(transformer);
          return true;
      }
  }
  const containerResolver = {
      resolve(handler, requestor) {
          return requestor;
      }
  };
  function isRegistry(obj) {
      return typeof obj.register === 'function';
  }
  /** @internal */
  class Container {
      constructor(configuration = {}) {
          this.parent = null;
          this.resolvers = new Map();
          this.configuration = configuration;
          this.factories = configuration.factories || (configuration.factories = new Map());
          this.resourceLookup = configuration.resourceLookup || (configuration.resourceLookup = Object.create(null));
          this.resolvers.set(IContainer, containerResolver);
      }
      register(...params) {
          for (let i = 0, ii = params.length; i < ii; ++i) {
              const current = params[i];
              if (isRegistry(current)) {
                  current.register(this);
              }
              else {
                  const keys = Object.keys(current);
                  for (let j = 0, jj = keys.length; j < jj; ++j) {
                      const value = current[keys[j]];
                      // note: we could remove this if-branch and call this.register directly
                      // - the extra check is just a perf tweak to create fewer unnecessary arrays by the spread operator
                      if (isRegistry(value)) {
                          value.register(this);
                      }
                      else {
                          this.register(value);
                      }
                  }
              }
          }
      }
      registerResolver(key, resolver) {
          validateKey(key);
          const resolvers = this.resolvers;
          const result = resolvers.get(key);
          if (result === undefined) {
              resolvers.set(key, resolver);
              if (typeof key === 'string') {
                  this.resourceLookup[key] = resolver;
              }
          }
          else if (result instanceof Resolver && result.strategy === 4 /* array */) {
              result.state.push(resolver);
          }
          else {
              resolvers.set(key, new Resolver(key, 4 /* array */, [result, resolver]));
          }
          return resolver;
      }
      registerTransformer(key, transformer) {
          const resolver = this.getResolver(key);
          if (resolver === null) {
              return false;
          }
          if (resolver.getFactory) {
              const handler = resolver.getFactory(this);
              if (handler === null) {
                  return false;
              }
              return handler.registerTransformer(transformer);
          }
          return false;
      }
      getResolver(key, autoRegister = true) {
          validateKey(key);
          if (key.resolve) {
              return key;
          }
          let current = this;
          while (current !== null) {
              const resolver = current.resolvers.get(key);
              if (resolver === undefined) {
                  if (current.parent === null) {
                      return autoRegister ? this.jitRegister(key, current) : null;
                  }
                  current = current.parent;
              }
              else {
                  return resolver;
              }
          }
          return null;
      }
      has(key, searchAncestors = false) {
          return this.resolvers.has(key)
              ? true
              : searchAncestors && this.parent !== null
                  ? this.parent.has(key, true)
                  : false;
      }
      get(key) {
          validateKey(key);
          if (key.resolve) {
              return key.resolve(this, this);
          }
          let current = this;
          while (current !== null) {
              let resolver = current.resolvers.get(key);
              if (resolver === undefined) {
                  if (current.parent === null) {
                      resolver = this.jitRegister(key, current);
                      return resolver.resolve(current, this);
                  }
                  current = current.parent;
              }
              else {
                  return resolver.resolve(current, this);
              }
          }
      }
      getAll(key) {
          validateKey(key);
          let current = this;
          while (current !== null) {
              const resolver = current.resolvers.get(key);
              if (resolver === undefined) {
                  if (this.parent === null) {
                      return PLATFORM.emptyArray;
                  }
                  current = current.parent;
              }
              else {
                  return buildAllResponse(resolver, current, this);
              }
          }
          return PLATFORM.emptyArray;
      }
      getFactory(Type) {
          let factory = this.factories.get(Type);
          if (factory === undefined) {
              factory = Factory.create(Type);
              this.factories.set(Type, factory);
          }
          return factory;
      }
      createChild() {
          const config = this.configuration;
          const childConfig = { factories: config.factories, resourceLookup: Object.assign({}, config.resourceLookup) };
          const child = new Container(childConfig);
          child.parent = this;
          return child;
      }
      jitRegister(keyAsValue, handler) {
          if (keyAsValue.register) {
              const registrationResolver = keyAsValue.register(handler, keyAsValue);
              if (!(registrationResolver && registrationResolver.resolve)) {
                  throw Reporter.error(40); // did not return a valid resolver from the static register method
              }
              return registrationResolver;
          }
          const resolver = new Resolver(keyAsValue, 1 /* singleton */, keyAsValue);
          handler.resolvers.set(keyAsValue, resolver);
          return resolver;
      }
  }
  const Registration = {
      instance(key, value) {
          return new Resolver(key, 0 /* instance */, value);
      },
      singleton(key, value) {
          return new Resolver(key, 1 /* singleton */, value);
      },
      transient(key, value) {
          return new Resolver(key, 2 /* transient */, value);
      },
      callback(key, callback) {
          return new Resolver(key, 3 /* callback */, callback);
      },
      alias(originalKey, aliasKey) {
          return new Resolver(aliasKey, 5 /* alias */, originalKey);
      },
      interpret(interpreterKey, ...rest) {
          return {
              register(container) {
                  const resolver = container.getResolver(interpreterKey);
                  if (resolver !== null) {
                      let registry = null;
                      if (resolver.getFactory) {
                          const factory = resolver.getFactory(container);
                          if (factory !== null) {
                              registry = factory.construct(container, rest);
                          }
                      }
                      else {
                          registry = resolver.resolve(container, container);
                      }
                      if (registry !== null) {
                          registry.register(container);
                      }
                  }
              }
          };
      }
  };
  /** @internal */
  function validateKey(key) {
      // note: design:paramTypes which will default to Object if the param types cannot be statically analyzed by tsc
      // this check is intended to properly report on that problem - under no circumstance should Object be a valid key anyway
      if (key === null || key === undefined || key === Object) {
          throw Reporter.error(5);
      }
  }
  function buildAllResponse(resolver, handler, requestor) {
      if (resolver instanceof Resolver && resolver.strategy === 4 /* array */) {
          const state = resolver.state;
          let i = state.length;
          const results = new Array(i);
          while (i--) {
              results[i] = state[i].resolve(handler, requestor);
          }
          return results;
      }
      return [resolver.resolve(handler, requestor)];
  }
  /** @internal */
  const classInvokers = [
      {
          invoke(container, Type) {
              return new Type();
          },
          invokeWithDynamicDependencies
      },
      {
          invoke(container, Type, deps) {
              return new Type(container.get(deps[0]));
          },
          invokeWithDynamicDependencies
      },
      {
          invoke(container, Type, deps) {
              return new Type(container.get(deps[0]), container.get(deps[1]));
          },
          invokeWithDynamicDependencies
      },
      {
          invoke(container, Type, deps) {
              return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
          },
          invokeWithDynamicDependencies
      },
      {
          invoke(container, Type, deps) {
              return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]));
          },
          invokeWithDynamicDependencies
      },
      {
          invoke(container, Type, deps) {
              return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]), container.get(deps[4]));
          },
          invokeWithDynamicDependencies
      }
  ];
  /** @internal */
  const fallbackInvoker = {
      invoke: invokeWithDynamicDependencies,
      invokeWithDynamicDependencies
  };
  /** @internal */
  function invokeWithDynamicDependencies(container, Type, staticDependencies, dynamicDependencies) {
      let i = staticDependencies.length;
      let args = new Array(i);
      let lookup;
      while (i--) {
          lookup = staticDependencies[i];
          if (lookup === null || lookup === undefined) {
              throw Reporter.error(7, `Index ${i}.`);
          }
          else {
              args[i] = container.get(lookup);
          }
      }
      if (dynamicDependencies !== undefined) {
          args = args.concat(dynamicDependencies);
      }
      return Reflect.construct(Type, args);
  }

  class RuntimeCompilationResources {
      constructor(context) {
          this.context = context;
      }
      find(kind, name) {
          const key = kind.keyFrom(name);
          const resourceLookup = this.context.resourceLookup;
          let resolver = resourceLookup[key];
          if (resolver === undefined) {
              resolver = resourceLookup[key] = this.context.getResolver(key, false);
          }
          if (resolver !== null && resolver.getFactory) {
              const factory = resolver.getFactory(this.context);
              if (factory !== null) {
                  const description = factory.Type.description;
                  return description === undefined ? null : description;
              }
          }
          return null;
      }
      create(kind, name) {
          const key = kind.keyFrom(name);
          const resourceLookup = this.context.resourceLookup;
          let resolver = resourceLookup[key];
          if (resolver === undefined) {
              resolver = resourceLookup[key] = this.context.getResolver(key, false);
          }
          if (resolver !== null) {
              const instance = resolver.resolve(this.context, this.context);
              return instance === undefined ? null : instance;
          }
          return null;
      }
  }

  exports.all = all;
  exports.DI = DI;
  exports.IContainer = IContainer;
  exports.inject = inject;
  exports.IServiceLocator = IServiceLocator;
  exports.lazy = lazy;
  exports.optional = optional;
  exports.Registration = Registration;
  exports.singleton = singleton;
  exports.transient = transient;
  exports.PLATFORM = PLATFORM;
  exports.Reporter = Reporter;
  exports.Tracer = Tracer;
  exports.RuntimeCompilationResources = RuntimeCompilationResources;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
