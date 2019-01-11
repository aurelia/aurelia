System.register('jitPixi', ['@aurelia/jit', '@aurelia/jit-html', '@aurelia/kernel', '@aurelia/runtime-pixi'], function (exports, module) {
  'use strict';
  var DefaultBindingLanguage, DefaultBindingSyntax, DefaultComponents, DefaultBindingLanguage$1, DefaultComponents$1, DI, BasicConfiguration;
  return {
    setters: [function (module) {
      DefaultBindingLanguage = module.DefaultBindingLanguage;
      DefaultBindingSyntax = module.DefaultBindingSyntax;
      DefaultComponents = module.DefaultComponents;
    }, function (module) {
      DefaultBindingLanguage$1 = module.DefaultBindingLanguage;
      DefaultComponents$1 = module.DefaultComponents;
    }, function (module) {
      DI = module.DI;
    }, function (module) {
      BasicConfiguration = module.BasicConfiguration;
    }],
    execute: function () {

      /**
       * A DI configuration object containing html-, pixi- and browser-specific registrations:
       * - `BasicConfiguration` from `@aurelia/runtime-pixi`
       * - `DefaultComponents` from `@aurelia/jit`
       * - `DefaultBindingSyntax` from `@aurelia/jit`
       * - `DefaultBindingLanguage` from `@aurelia/jit`
       * - `DefaultComponents` from `@aurelia/jit-html`
       * - `DefaultBindingLanguage` from `@aurelia/jit-html`
       */
      const BasicConfiguration$1 = exports('BasicConfiguration', {
          /**
           * Apply this configuration to the provided container.
           */
          register(container) {
              return BasicConfiguration
                  .register(container)
                  .register(...DefaultBindingLanguage, ...DefaultBindingSyntax, ...DefaultComponents, ...DefaultBindingLanguage$1, ...DefaultComponents$1);
          },
          /**
           * Create a new container with this configuration applied to it.
           */
          createContainer() {
              return this.register(DI.createContainer());
          }
      });

    }
  };
});
//# sourceMappingURL=index.system.js.map
