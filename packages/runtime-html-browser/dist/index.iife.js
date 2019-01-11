this.au = this.au || {};
this.au.runtimeHtmlBrowser = (function (exports, kernel, runtime, runtimeHtml) {
  'use strict';

  class BrowserDOMInitializer {
      constructor(container) {
          this.container = container;
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
              else if (config.host.ownerDocument !== null) {
                  dom = new runtimeHtml.HTMLDOM(window, config.host.ownerDocument, Node, Element, HTMLElement);
              }
              else {
                  dom = new runtimeHtml.HTMLDOM(window, document, Node, Element, HTMLElement);
              }
          }
          else {
              dom = new runtimeHtml.HTMLDOM(window, document, Node, Element, HTMLElement);
          }
          kernel.Registration.instance(runtime.IDOM, dom).register(this.container);
          return dom;
      }
  }
  BrowserDOMInitializer.inject = [kernel.IContainer];
  const IDOMInitializerRegistration = BrowserDOMInitializer;
  /**
   * Default HTML-specific, browser-specific implementations for the following interfaces:
   * - `IDOMInitializer`
   */
  const DefaultComponents = [
      IDOMInitializerRegistration
  ];
  /**
   * A DI configuration object containing html-specific, browser-specific registrations:
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

  return exports;

}({}, kernel, runtime, runtimeHtml));
//# sourceMappingURL=index.iife.js.map
