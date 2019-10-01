(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    // For some reason rollup complains about `DI.createInterface<ITemplateElementFactory>().noDefault()` with this message:
    // "semantic error TS2742 The inferred type of 'ITemplateElementFactory' cannot be named without a reference to '@aurelia/jit/node_modules/@aurelia/kernel'. This is likely not portable. A type annotation is necessary"
    // So.. investigate why that happens (or rather, why it *only* happens here and not for the other 50)
    exports.ITemplateElementFactory = kernel_1.DI.createInterface('ITemplateElementFactory').noDefault();
    const { enter, leave } = kernel_1.Profiler.createTimer('TemplateElementFactory');
    const markupCache = {};
    /**
     * Default implementation for `ITemplateFactory` for use in an HTML based runtime.
     *
     * @internal
     */
    class HTMLTemplateElementFactory {
        constructor(dom) {
            this.dom = dom;
            this.template = dom.createTemplate();
        }
        static register(container) {
            return kernel_1.Registration.singleton(exports.ITemplateElementFactory, this).register(container);
        }
        createTemplate(input) {
            if (typeof input === 'string') {
                let result = markupCache[input];
                if (result === void 0) {
                    const template = this.template;
                    template.innerHTML = input;
                    const node = template.content.firstElementChild;
                    // if the input is either not wrapped in a template or there is more than one node,
                    // return the whole template that wraps it/them (and create a new one for the next input)
                    if (node == null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling != null) {
                        this.template = this.dom.createTemplate();
                        result = template;
                    }
                    else {
                        // the node to return is both a template and the only node, so return just the node
                        // and clean up the template for the next input
                        template.content.removeChild(node);
                        result = node;
                    }
                    markupCache[input] = result;
                }
                return result.cloneNode(true);
            }
            if (input.nodeName !== 'TEMPLATE') {
                // if we get one node that is not a template, wrap it in one
                const template = this.dom.createTemplate();
                template.content.appendChild(input);
                return template;
            }
            // we got a template element, remove it from the DOM if it's present there and don't
            // do any other processing
            if (input.parentNode != null) {
                input.parentNode.removeChild(input);
            }
            return input;
        }
    }
    exports.HTMLTemplateElementFactory = HTMLTemplateElementFactory;
    HTMLTemplateElementFactory.inject = [runtime_1.IDOM];
});
//# sourceMappingURL=template-element-factory.js.map