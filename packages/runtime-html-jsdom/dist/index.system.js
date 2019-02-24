System.register('runtimeHtmlJsdom', ['@aurelia/kernel', '@aurelia/runtime', '@aurelia/runtime-html', 'jsdom'], function (exports, module) {
  'use strict';
  var DI, Registration, IContainer, IDOMInitializer, IDOM, BasicConfiguration$1, HTMLDOM, JSDOM;
  return {
    setters: [function (module) {
      DI = module.DI;
      Registration = module.Registration;
      IContainer = module.IContainer;
    }, function (module) {
      IDOMInitializer = module.IDOMInitializer;
      IDOM = module.IDOM;
    }, function (module) {
      BasicConfiguration$1 = module.BasicConfiguration;
      HTMLDOM = module.HTMLDOM;
    }, function (module) {
      JSDOM = module.JSDOM;
    }],
    execute: function () {

      class JSDOMInitializer {
          constructor(container) {
              this.container = container;
              this.jsdom = new JSDOM();
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
                  else if (config.host.ownerDocument) {
                      dom = new HTMLDOM(this.jsdom.window, config.host.ownerDocument, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent);
                  }
                  else {
                      if (config.host) {
                          this.jsdom.window.document.body.appendChild(config.host);
                      }
                      dom = new HTMLDOM(this.jsdom.window, this.jsdom.window.document, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent);
                  }
              }
              else {
                  dom = new HTMLDOM(this.jsdom.window, this.jsdom.window.document, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent);
              }
              Registration.instance(IDOM, dom).register(this.container);
              return dom;
          }
      }
      JSDOMInitializer.inject = [IContainer];
      const IDOMInitializerRegistration = exports('IDOMInitializerRegistration', JSDOMInitializer);
      /**
       * Default HTML-specific, jsdom-specific implementations for the following interfaces:
       * - `IDOMInitializer`
       */
      const DefaultComponents = exports('DefaultComponents', [
          IDOMInitializerRegistration
      ]);
      /**
       * A DI configuration object containing html-specific, jsdom-specific registrations:
       * - `BasicConfiguration` from `@aurelia/runtime-html`
       * - `DefaultComponents`
       */
      const BasicConfiguration = exports('BasicConfiguration', {
          /**
           * Apply this configuration to the provided container.
           */
          register(container) {
              return BasicConfiguration$1
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
