(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./definitions", "./dom", "./lifecycle", "./rendering-engine", "./resources/custom-element"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("./definitions");
    const dom_1 = require("./dom");
    const lifecycle_1 = require("./lifecycle");
    const rendering_engine_1 = require("./rendering-engine");
    const custom_element_1 = require("./resources/custom-element");
    class RenderContext {
        constructor(dom, parentContainer, dependencies, componentType) {
            this.dom = dom;
            this.parentContainer = parentContainer;
            this.dependencies = dependencies;
            this.componentType = componentType;
            const container = (this.container = parentContainer.createChild());
            const renderableProvider = (this.renderableProvider = new kernel_1.InstanceProvider());
            const elementProvider = (this.elementProvider = new kernel_1.InstanceProvider());
            const instructionProvider = (this.instructionProvider = new kernel_1.InstanceProvider());
            const factoryProvider = (this.factoryProvider = new ViewFactoryProvider());
            const renderLocationProvider = (this.renderLocationProvider = new kernel_1.InstanceProvider());
            this.renderer = container.get(rendering_engine_1.IRenderer);
            dom.registerElementResolver(container, elementProvider);
            container.registerResolver(lifecycle_1.IViewFactory, factoryProvider);
            container.registerResolver(lifecycle_1.IController, renderableProvider);
            container.registerResolver(definitions_1.ITargetedInstruction, instructionProvider);
            container.registerResolver(dom_1.IRenderLocation, renderLocationProvider);
            if (dependencies != void 0) {
                container.register(...dependencies);
            }
            // If the element has a view, support Recursive Components by adding self to own view template container.
            if (componentType) {
                custom_element_1.CustomElement.getDefinition(componentType).register(container);
            }
        }
        get id() {
            return this.container.id;
        }
        get path() {
            return this.container.path;
        }
        get parentId() {
            return this.parentContainer.id;
        }
        // #region IServiceLocator api
        has(key, searchAncestors) {
            return this.container.has(key, searchAncestors);
        }
        get(key) {
            return this.container.get(key);
        }
        getAll(key) {
            return this.container.getAll(key);
        }
        // #endregion
        // #region IContainer api
        register(...params) {
            return this.container.register(...params);
        }
        registerResolver(key, resolver) {
            return this.container.registerResolver(key, resolver);
        }
        registerTransformer(key, transformer) {
            return this.container.registerTransformer(key, transformer);
        }
        getResolver(key, autoRegister) {
            return this.container.getResolver(key, autoRegister);
        }
        getFactory(key) {
            return this.container.getFactory(key);
        }
        createChild() {
            return this.container.createChild();
        }
        // #endregion
        render(flags, controller, targets, definition, host, parts) {
            this.renderer.render(flags, this.dom, this, controller, targets, definition, host, parts);
        }
        beginComponentOperation(renderable, target, instruction, factory, parts, location) {
            this.renderableProvider.prepare(renderable);
            this.elementProvider.prepare(target);
            this.instructionProvider.prepare(instruction);
            if (factory) {
                this.factoryProvider.prepare(factory, parts);
            }
            if (location) {
                this.renderLocationProvider.prepare(location);
            }
            return this;
        }
        dispose() {
            this.factoryProvider.dispose();
            this.renderableProvider.dispose();
            this.instructionProvider.dispose();
            this.elementProvider.dispose();
            this.renderLocationProvider.dispose();
        }
        createRuntimeCompilationResources() {
            return new kernel_1.RuntimeCompilationResources(this.container);
        }
    }
    exports.RenderContext = RenderContext;
    /** @internal */
    class ViewFactoryProvider {
        prepare(factory, parts) {
            this.factory = factory;
            factory.addParts(parts);
        }
        resolve(handler, requestor) {
            const factory = this.factory;
            if (factory == null) { // unmet precondition: call prepare
                throw kernel_1.Reporter.error(50); // TODO: organize error codes
            }
            if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
                throw kernel_1.Reporter.error(51); // TODO: organize error codes
            }
            const found = factory.parts[factory.name];
            if (found) {
                const renderingEngine = handler.get(rendering_engine_1.IRenderingEngine);
                const dom = handler.get(dom_1.IDOM);
                return renderingEngine.getViewFactory(dom, found, requestor);
            }
            return factory;
        }
        dispose() {
            this.factory = null;
        }
    }
    exports.ViewFactoryProvider = ViewFactoryProvider;
});
//# sourceMappingURL=render-context.js.map