System.register('runtimeHtmlBrowser', ['@aurelia/kernel', '@aurelia/runtime', '@aurelia/runtime-html'], function (exports, module) {
  'use strict';
  var DI, Registration, IContainer, IDOMInitializer, IDOM, BasicConfiguration, HTMLDOM;
  return {
    setters: [function (module) {
      DI = module.DI;
      Registration = module.Registration;
      IContainer = module.IContainer;
    }, function (module) {
      IDOMInitializer = module.IDOMInitializer;
      IDOM = module.IDOM;
    }, function (module) {
      BasicConfiguration = module.BasicConfiguration;
      HTMLDOM = module.HTMLDOM;
    }],
    execute: function () {

      class BrowserDOMInitializer {
          constructor(container) {
              this.container = container;
          }
          static register(container) {
              return Registration.singleton(IDOMInitializer, this).register(container);
          }
          initialize(config) {
              if (this.container.has(IDOM, false)) {
                  return this.container.get(IDOM);
              }
              let dom;
              if (config !== undefined) {
                  if (config.dom !== undefined) {
                      dom = config.dom;
                  }
                  else if (config.host.ownerDocument !== null) {
                      dom = new HTMLDOM(window, config.host.ownerDocument, Node, Element, HTMLElement);
                  }
                  else {
                      dom = new HTMLDOM(window, document, Node, Element, HTMLElement);
                  }
              }
              else {
                  dom = new HTMLDOM(window, document, Node, Element, HTMLElement);
              }
              Registration.instance(IDOM, dom).register(this.container);
              return dom;
          }
      }
      BrowserDOMInitializer.inject = [IContainer];
      const IDOMInitializerRegistration = exports('IDOMInitializerRegistration', BrowserDOMInitializer);
      /**
       * Default HTML-specific, browser-specific implementations for the following interfaces:
       * - `IDOMInitializer`
       */
      const DefaultComponents = exports('DefaultComponents', [
          IDOMInitializerRegistration
      ]);
      /**
       * A DI configuration object containing html-specific, browser-specific registrations:
       * - `BasicConfiguration` from `@aurelia/runtime-html`
       * - `DefaultComponents`
       */
      const BasicConfiguration$1 = exports('BasicConfiguration', {
          /**
           * Apply this configuration to the provided container.
           */
          register(container) {
              return BasicConfiguration
                  .register(container)
                  .register(...DefaultComponents);
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
