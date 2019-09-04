(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./styles/shadow-dom-styles"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const shadow_dom_styles_1 = require("./styles/shadow-dom-styles");
    const slice = Array.prototype.slice;
    const defaultShadowOptions = {
        mode: 'open'
    };
    class HTMLProjectorLocator {
        static register(container) {
            return kernel_1.Registration.singleton(runtime_1.IProjectorLocator, this).register(container);
        }
        getElementProjector(dom, $component, host, def) {
            if (def.shadowOptions || def.hasSlots) {
                if (def.containerless) {
                    throw kernel_1.Reporter.error(21);
                }
                return new ShadowDOMProjector(dom, $component, host, def);
            }
            if (def.containerless) {
                return new ContainerlessProjector(dom, $component, host);
            }
            return new HostProjector($component, host);
        }
    }
    exports.HTMLProjectorLocator = HTMLProjectorLocator;
    const childObserverOptions = { childList: true };
    /** @internal */
    class ShadowDOMProjector {
        constructor(dom, $controller, host, definition) {
            this.dom = dom;
            this.host = host;
            this.$controller = $controller;
            let shadowOptions;
            if (definition.shadowOptions instanceof Object &&
                'mode' in definition.shadowOptions) {
                shadowOptions = definition.shadowOptions;
            }
            else {
                shadowOptions = defaultShadowOptions;
            }
            this.shadowRoot = host.attachShadow(shadowOptions);
            this.host.$controller = $controller;
            this.shadowRoot.$controller = $controller;
        }
        get children() {
            return this.host.childNodes;
        }
        subscribeToChildrenChange(callback, options = childObserverOptions) {
            // TODO: add a way to dispose/disconnect
            this.dom.createNodeObserver(this.host, callback, options);
        }
        provideEncapsulationSource() {
            return this.shadowRoot;
        }
        project(nodes) {
            const context = this.$controller.context;
            const styles = context.has(shadow_dom_styles_1.IShadowDOMStyles, false)
                ? context.get(shadow_dom_styles_1.IShadowDOMStyles)
                : context.get(shadow_dom_styles_1.IShadowDOMGlobalStyles);
            styles.applyTo(this.shadowRoot);
            nodes.appendTo(this.shadowRoot);
        }
        take(nodes) {
            nodes.remove();
            nodes.unlink();
        }
    }
    exports.ShadowDOMProjector = ShadowDOMProjector;
    /** @internal */
    class ContainerlessProjector {
        constructor(dom, $controller, host) {
            if (host.childNodes.length) {
                this.childNodes = kernel_1.toArray(host.childNodes);
            }
            else {
                this.childNodes = kernel_1.PLATFORM.emptyArray;
            }
            this.host = dom.convertToRenderLocation(host);
            this.host.$controller = $controller;
        }
        get children() {
            return this.childNodes;
        }
        subscribeToChildrenChange(callback) {
            // TODO: turn this into an error
            // Containerless does not have a container node to observe children on.
        }
        provideEncapsulationSource() {
            return this.host.getRootNode();
        }
        project(nodes) {
            nodes.insertBefore(this.host);
        }
        take(nodes) {
            nodes.remove();
            nodes.unlink();
        }
    }
    exports.ContainerlessProjector = ContainerlessProjector;
    /** @internal */
    class HostProjector {
        constructor($controller, host) {
            this.host = host;
            this.host.$controller = $controller;
        }
        get children() {
            return this.host.childNodes;
        }
        subscribeToChildrenChange(callback) {
            // Do nothing since this scenario will never have children.
        }
        provideEncapsulationSource() {
            return this.host.getRootNode();
        }
        project(nodes) {
            nodes.appendTo(this.host);
        }
        take(nodes) {
            nodes.remove();
            nodes.unlink();
        }
    }
    exports.HostProjector = HostProjector;
});
//# sourceMappingURL=projectors.js.map