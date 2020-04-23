(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../definitions", "../dom", "../lifecycle", "../renderer", "../resources/custom-element", "./view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("../definitions");
    const dom_1 = require("../dom");
    const lifecycle_1 = require("../lifecycle");
    const renderer_1 = require("../renderer");
    const custom_element_1 = require("../resources/custom-element");
    const view_1 = require("./view");
    const definitionContainerLookup = new WeakMap();
    const definitionContainerPartsLookup = new WeakMap();
    const fragmentCache = new WeakMap();
    function isRenderContext(value) {
        return value instanceof RenderContext;
    }
    exports.isRenderContext = isRenderContext;
    function getRenderContext(partialDefinition, parentContainer, parts) {
        const definition = custom_element_1.CustomElementDefinition.getOrCreate(partialDefinition);
        if (isRenderContext(parentContainer)) {
            parts = definitions_1.mergeParts(parentContainer.parts, parts);
        }
        // injectable completely prevents caching, ensuring that each instance gets a new render context
        if (definition.injectable !== null) {
            return new RenderContext(definition, parentContainer, parts);
        }
        if (parts === void 0) {
            let containerLookup = definitionContainerLookup.get(definition);
            if (containerLookup === void 0) {
                definitionContainerLookup.set(definition, containerLookup = new WeakMap());
            }
            let context = containerLookup.get(parentContainer);
            if (context === void 0) {
                containerLookup.set(parentContainer, context = new RenderContext(definition, parentContainer, parts));
            }
            return context;
        }
        let containerPartsLookup = definitionContainerPartsLookup.get(definition);
        if (containerPartsLookup === void 0) {
            definitionContainerPartsLookup.set(definition, containerPartsLookup = new WeakMap());
        }
        let partsLookup = containerPartsLookup.get(parentContainer);
        if (partsLookup === void 0) {
            containerPartsLookup.set(parentContainer, partsLookup = new WeakMap());
        }
        let context = partsLookup.get(parts);
        if (context === void 0) {
            partsLookup.set(parts, context = new RenderContext(definition, parentContainer, parts));
        }
        return context;
    }
    exports.getRenderContext = getRenderContext;
    class RenderContext {
        constructor(definition, parentContainer, parts) {
            this.definition = definition;
            this.parentContainer = parentContainer;
            this.parts = parts;
            this.viewModelProvider = void 0;
            this.fragment = null;
            this.factory = void 0;
            this.isCompiled = false;
            this.compiledDefinition = (void 0);
            const container = this.container = parentContainer.createChild();
            this.renderer = container.get(renderer_1.IRenderer);
            container.registerResolver(lifecycle_1.IViewFactory, this.factoryProvider = new ViewFactoryProvider(), true);
            container.registerResolver(lifecycle_1.IController, this.parentControllerProvider = new kernel_1.InstanceProvider(), true);
            container.registerResolver(definitions_1.ITargetedInstruction, this.instructionProvider = new kernel_1.InstanceProvider(), true);
            container.registerResolver(dom_1.IRenderLocation, this.renderLocationProvider = new kernel_1.InstanceProvider(), true);
            (this.dom = container.get(dom_1.IDOM)).registerElementResolver(container, this.elementProvider = new kernel_1.InstanceProvider());
            container.register(...definition.dependencies);
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
        disposeResolvers() {
            this.container.disposeResolvers();
        }
        // #endregion
        // #region IRenderContext api
        compile() {
            let compiledDefinition;
            if (this.isCompiled) {
                return this;
            }
            this.isCompiled = true;
            const definition = this.definition;
            if (definition.needsCompile) {
                const container = this.container;
                const compiler = container.get(renderer_1.ITemplateCompiler);
                compiledDefinition = this.compiledDefinition = compiler.compile(definition, container);
            }
            else {
                compiledDefinition = this.compiledDefinition = definition;
            }
            // Support Recursive Components by adding self to own context
            compiledDefinition.register(this);
            if (fragmentCache.has(compiledDefinition)) {
                this.fragment = fragmentCache.get(compiledDefinition);
            }
            else {
                const template = compiledDefinition.template;
                if (template === null) {
                    fragmentCache.set(compiledDefinition, null);
                }
                else {
                    fragmentCache.set(compiledDefinition, this.fragment = this.dom.createDocumentFragment(template));
                }
            }
            return this;
        }
        getViewFactory(name) {
            let factory = this.factory;
            if (factory === void 0) {
                if (name === void 0) {
                    name = this.definition.name;
                }
                const lifecycle = this.parentContainer.get(lifecycle_1.ILifecycle);
                factory = this.factory = new view_1.ViewFactory(name, this, lifecycle, this.parts);
            }
            return factory;
        }
        beginChildComponentOperation(instance) {
            const definition = this.definition;
            if (definition.injectable !== null) {
                if (this.viewModelProvider === void 0) {
                    this.container.registerResolver(definition.injectable, this.viewModelProvider = new kernel_1.InstanceProvider());
                }
                this.viewModelProvider.prepare(instance);
            }
            return this;
        }
        // #endregion
        // #region ICompiledRenderContext api
        createNodes() {
            return this.dom.createNodeSequence(this.fragment);
        }
        // TODO: split up into 2 methods? getComponentFactory + getSyntheticFactory or something
        getComponentFactory(parentController, host, instruction, viewFactory, location) {
            if (parentController !== void 0) {
                this.parentControllerProvider.prepare(parentController);
            }
            if (host !== void 0) {
                // TODO: fix provider input type, Key is probably not a good constraint
                this.elementProvider.prepare(host);
            }
            if (instruction !== void 0) {
                this.instructionProvider.prepare(instruction);
            }
            if (location !== void 0) {
                this.renderLocationProvider.prepare(location);
            }
            if (viewFactory !== void 0) {
                this.factoryProvider.prepare(viewFactory);
            }
            return this;
        }
        // #endregion
        // #region IComponentFactory api
        createComponent(resourceKey) {
            return this.container.get(resourceKey);
        }
        render(flags, controller, targets, templateDefinition, host, parts) {
            this.renderer.render(flags, this, controller, targets, templateDefinition, host, parts);
        }
        renderInstructions(flags, instructions, controller, target, parts) {
            this.renderer.renderInstructions(flags, this, instructions, controller, target, parts);
        }
        dispose() {
            this.elementProvider.dispose();
            this.container.disposeResolvers();
        }
    }
    exports.RenderContext = RenderContext;
    /** @internal */
    class ViewFactoryProvider {
        constructor() {
            this.factory = null;
        }
        prepare(factory) {
            this.factory = factory;
        }
        get $isResolver() { return true; }
        resolve(handler, requestor) {
            const factory = this.factory;
            if (factory === null) { // unmet precondition: call prepare
                throw kernel_1.Reporter.error(50); // TODO: organize error codes
            }
            if (typeof factory.name !== 'string' || factory.name.length === 0) { // unmet invariant: factory must have a name
                throw kernel_1.Reporter.error(51); // TODO: organize error codes
            }
            return factory.resolve(requestor);
        }
        dispose() {
            this.factory = null;
        }
    }
    exports.ViewFactoryProvider = ViewFactoryProvider;
});
//# sourceMappingURL=render-context.js.map