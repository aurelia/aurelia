(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@aurelia/kernel'), require('@aurelia/runtime'), require('@aurelia/runtime-html'), require('jsdom')) :
  typeof define === 'function' && define.amd ? define(['exports', '@aurelia/kernel', '@aurelia/runtime', '@aurelia/runtime-html', 'jsdom'], factory) :
  (global = global || self, factory(global.runtimeHtmlJsdom = {}, global.kernel, global.runtime, global.runtimeHtml, global.jsdom));
}(this, function (exports, kernel, runtime, runtimeHtml, jsdom) { 'use strict';

  class JSDOMInitializer {
      constructor(container) {
          this.container = container;
          this.jsdom = new jsdom.JSDOM();
      }
      static register(container) {
          return kernel.Registration.singleton(runtime.IDOMInitializer, this).register(container);
      }
      initialize(config) {
          if (this.container.has(runtime.IDOM, false)) {
              return this.container.get(runtime.IDOM);
          }
          let dom;
          if (config !== undefined) {
              if (config.dom !== undefined) {
                  dom = config.dom;
              }
              else if (config.host.ownerDocument) {
                  dom = new runtimeHtml.HTMLDOM(this.jsdom.window, config.host.ownerDocument, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent);
              }
              else {
                  if (config.host) {
                      this.jsdom.window.document.body.appendChild(config.host);
                  }
                  dom = new runtimeHtml.HTMLDOM(this.jsdom.window, this.jsdom.window.document, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent);
              }
          }
          else {
              dom = new runtimeHtml.HTMLDOM(this.jsdom.window, this.jsdom.window.document, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent);
          }
          kernel.Registration.instance(runtime.IDOM, dom).register(this.container);
          return dom;
      }
  }
  JSDOMInitializer.inject = [kernel.IContainer];
  const IDOMInitializerRegistration = JSDOMInitializer;
  /**
   * Default HTML-specific, jsdom-specific implementations for the following interfaces:
   * - `IDOMInitializer`
   */
  const DefaultComponents = [
      IDOMInitializerRegistration
  ];
  /**
   * A DI configuration object containing html-specific, jsdom-specific registrations:
   * - `BasicConfiguration` from `@aurelia/runtime-html`
   * - `DefaultComponents`
   */
  const BasicConfiguration = {
      /**
       * Apply this configuration to the provided container.
       */
      register(container) {
          return runtimeHtml.BasicConfiguration
              .register(container)
              .register(...DefaultComponents);
      },
      /**
       * Create a new container with this configuration applied to it.
       */
      createContainer() {
          return this.register(kernel.DI.createContainer());
      }
  };

  exports.IDOMInitializerRegistration = IDOMInitializerRegistration;
  exports.DefaultComponents = DefaultComponents;
  exports.BasicConfiguration = BasicConfiguration;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
