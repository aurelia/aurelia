(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@aurelia/jit'), require('@aurelia/jit-html'), require('@aurelia/kernel'), require('@aurelia/runtime-html-jsdom')) :
  typeof define === 'function' && define.amd ? define(['exports', '@aurelia/jit', '@aurelia/jit-html', '@aurelia/kernel', '@aurelia/runtime-html-jsdom'], factory) :
  (global = global || self, factory(global.jitHtmlJsdom = {}, global.jit, global.jitHtml, global.kernel, global.runtimeHtmlJsdom));
}(this, function (exports, jit, jitHtml, kernel, runtimeHtmlJsdom) { 'use strict';

  const { enter, leave } = kernel.Profiler.createTimer('BasicConfiguration');
  /**
   * A DI configuration object containing html-specific, jsdom-specific registrations:
   * - `BasicConfiguration` from `@aurelia/runtime-html-jsdom`
   * - `DefaultComponents` from `@aurelia/jit`
   * - `DefaultBindingSyntax` from `@aurelia/jit`
   * - `DefaultBindingLanguage` from `@aurelia/jit`
   * - `DefaultComponents` from `@aurelia/jit-html`
   * - `DefaultBindingLanguage` from `@aurelia/jit-html`
   */
  const BasicConfiguration = {
      /**
       * Apply this configuration to the provided container.
       */
      register(container) {
          if (kernel.Profiler.enabled) {
              enter();
          }
          runtimeHtmlJsdom.BasicConfiguration
              .register(container)
              .register(...jit.DefaultBindingLanguage, ...jit.DefaultBindingSyntax, ...jit.DefaultComponents, ...jitHtml.DefaultBindingLanguage, ...jitHtml.DefaultComponents);
          if (kernel.Profiler.enabled) {
              leave();
          }
          return container;
      },
      /**
       * Create a new container with this configuration applied to it.
       */
      createContainer() {
          if (kernel.Profiler.enabled) {
              enter();
          }
          const container = this.register(kernel.DI.createContainer());
          if (kernel.Profiler.enabled) {
              leave();
          }
          return container;
      }
  };

  exports.BasicConfiguration = BasicConfiguration;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
