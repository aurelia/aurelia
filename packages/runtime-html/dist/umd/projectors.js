(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./dom", "./resources/custom-element", "./styles/shadow-dom-styles"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HostProjector = exports.ContainerlessProjector = exports.ShadowDOMProjector = exports.ProjectorLocator = exports.IProjectorLocator = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const dom_1 = require("./dom");
    const custom_element_1 = require("./resources/custom-element");
    const shadow_dom_styles_1 = require("./styles/shadow-dom-styles");
    const defaultShadowOptions = {
        mode: 'open'
    };
    exports.IProjectorLocator = kernel_1.DI.createInterface('IProjectorLocator').withDefault(x => x.singleton(ProjectorLocator));
    class ProjectorLocator {
        getElementProjector($component, host, def) {
            if (def.shadowOptions || def.hasSlots) {
                if (def.containerless) {
                    throw new Error('You cannot combine the containerless custom element option with Shadow DOM.');
                }
                return new ShadowDOMProjector($component, host, def);
            }
            if (def.containerless) {
                return new ContainerlessProjector($component, host);
            }
            return new HostProjector($component, host, def.enhance);
        }
    }
    exports.ProjectorLocator = ProjectorLocator;
    const childObserverOptions = { childList: true };
    class ShadowDOMProjector {
        constructor(
        // eslint-disable-next-line @typescript-eslint/prefer-readonly
        $controller, host, definition) {
            this.$controller = $controller;
            this.host = host;
            let shadowOptions;
            if (definition.shadowOptions instanceof Object &&
                'mode' in definition.shadowOptions) {
                shadowOptions = definition.shadowOptions;
            }
            else {
                shadowOptions = defaultShadowOptions;
            }
            this.shadowRoot = host.attachShadow(shadowOptions);
            kernel_1.Metadata.define(custom_element_1.CustomElement.name, $controller, this.host);
            kernel_1.Metadata.define(custom_element_1.CustomElement.name, $controller, this.shadowRoot);
        }
        get children() {
            return this.host.childNodes;
        }
        subscribeToChildrenChange(callback, options = childObserverOptions) {
            // TODO: add a way to dispose/disconnect
            const obs = new this.host.ownerDocument.defaultView.MutationObserver(callback);
            obs.observe(this.host, options);
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
    class ContainerlessProjector {
        constructor($controller, host) {
            if (host.childNodes.length) {
                this.childNodes = kernel_1.toArray(host.childNodes);
            }
            else {
                this.childNodes = kernel_1.emptyArray;
            }
            this.host = dom_1.convertToRenderLocation(host);
            kernel_1.Metadata.define(custom_element_1.CustomElement.name, $controller, this.host);
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
    class HostProjector {
        constructor($controller, host, enhance) {
            this.host = host;
            this.enhance = enhance;
            kernel_1.Metadata.define(custom_element_1.CustomElement.name, $controller, host);
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
            nodes.appendTo(this.host, this.enhance);
        }
        take(nodes) {
            nodes.remove();
            nodes.unlink();
        }
    }
    exports.HostProjector = HostProjector;
});
//# sourceMappingURL=projectors.js.map