System.register('jitHtmlJsdom', ['@aurelia/jit', '@aurelia/jit-html', '@aurelia/kernel', '@aurelia/runtime-html-jsdom'], function (exports, module) {
  'use strict';
  var DefaultBindingLanguage, DefaultBindingSyntax, DefaultComponents, DefaultBindingLanguage$1, DefaultComponents$1, Profiler, DI, BasicConfiguration$1;
  return {
    setters: [function (module) {
      DefaultBindingLanguage = module.DefaultBindingLanguage;
      DefaultBindingSyntax = module.DefaultBindingSyntax;
      DefaultComponents = module.DefaultComponents;
    }, function (module) {
      DefaultBindingLanguage$1 = module.DefaultBindingLanguage;
      DefaultComponents$1 = module.DefaultComponents;
    }, function (module) {
      Profiler = module.Profiler;
      DI = module.DI;
    }, function (module) {
      BasicConfiguration$1 = module.BasicConfiguration;
    }],
    execute: function () {

      const { enter, leave } = Profiler.createTimer('BasicConfiguration');
      /**
       * A DI configuration object containing html-specific, jsdom-specific registrations:
       * - `BasicConfiguration` from `@aurelia/runtime-html-jsdom`
       * - `DefaultComponents` from `@aurelia/jit`
       * - `DefaultBindingSyntax` from `@aurelia/jit`
       * - `DefaultBindingLanguage` from `@aurelia/jit`
       * - `DefaultComponents` from `@aurelia/jit-html`
       * - `DefaultBindingLanguage` from `@aurelia/jit-html`
       */
      const BasicConfiguration = exports('BasicConfiguration', {
          /**
           * Apply this configuration to the provided container.
           */
          register(container) {
              if (Profiler.enabled) {
                  enter();
              }
              BasicConfiguration$1
                  .register(container)
                  .register(...DefaultBindingLanguage, ...DefaultBindingSyntax, ...DefaultComponents, ...DefaultBindingLanguage$1, ...DefaultComponents$1);
              if (Profiler.enabled) {
                  leave();
              }
              return container;
          },
          /**
           * Create a new container with this configuration applied to it.
           */
          createContainer() {
              if (Profiler.enabled) {
                  enter();
              }
              const container = this.register(DI.createContainer());
              if (Profiler.enabled) {
                  leave();
              }
              return container;
          }
      });

    }
  };
});
//# sourceMappingURL=index.system.js.map
