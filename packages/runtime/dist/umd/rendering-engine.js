(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "./definitions", "./dom", "./lifecycle", "./observation/subscriber-collection", "./templating/controller", "./templating/view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("./definitions");
    const dom_1 = require("./dom");
    const lifecycle_1 = require("./lifecycle");
    const subscriber_collection_1 = require("./observation/subscriber-collection");
    const controller_1 = require("./templating/controller");
    const view_1 = require("./templating/view");
    exports.ITemplateCompiler = kernel_1.DI.createInterface('ITemplateCompiler').noDefault();
    var ViewCompileFlags;
    (function (ViewCompileFlags) {
        ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
        ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
        ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
    })(ViewCompileFlags = exports.ViewCompileFlags || (exports.ViewCompileFlags = {}));
    exports.ITemplateFactory = kernel_1.DI.createInterface('ITemplateFactory').noDefault();
    // This is the main implementation of ITemplate.
    // It is used to create instances of IController based on a compiled TemplateDefinition.
    // TemplateDefinitions are hand-coded today, but will ultimately be the output of the
    // TemplateCompiler either through a JIT or AOT process.
    // Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
    // and create instances of it on demand.
    class CompiledTemplate {
        constructor(dom, definition, factory, renderContext) {
            this.dom = dom;
            this.definition = definition;
            this.factory = factory;
            this.renderContext = renderContext;
        }
        render(viewModelOrController, host, parts, flags = 0 /* none */) {
            const controller = viewModelOrController instanceof controller_1.Controller
                ? viewModelOrController
                : viewModelOrController.$controller;
            if (controller == void 0) {
                throw new Error(`Controller is missing from the view model`); // TODO: create error code
            }
            const nodes = controller.nodes = this.factory.createNodeSequence();
            controller.context = this.renderContext;
            controller.scopeParts = this.definition.scopeParts;
            flags |= this.definition.strategy;
            this.renderContext.render(flags, controller, nodes.findTargets(), this.definition, host, parts);
        }
    }
    exports.CompiledTemplate = CompiledTemplate;
    // This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
    /** @internal */
    exports.noViewTemplate = {
        renderContext: (void 0),
        dom: (void 0),
        definition: (void 0),
        render(viewModelOrController) {
            const controller = viewModelOrController instanceof controller_1.Controller ? viewModelOrController : viewModelOrController.$controller;
            controller.nodes = dom_1.NodeSequence.empty;
            controller.context = void 0;
        }
    };
    const defaultCompilerName = 'default';
    exports.IInstructionRenderer = kernel_1.DI.createInterface('IInstructionRenderer').noDefault();
    exports.IRenderer = kernel_1.DI.createInterface('IRenderer').noDefault();
    exports.IRenderingEngine = kernel_1.DI.createInterface('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));
    /** @internal */
    class RenderingEngine {
        constructor(container, templateFactory, lifecycle, templateCompilers) {
            this.container = container;
            this.templateFactory = templateFactory;
            this.viewFactoryLookup = new Map();
            this.lifecycle = lifecycle;
            this.templateLookup = new Map();
            this.compilers = templateCompilers.reduce((acc, item) => {
                acc[item.name] = item;
                return acc;
            }, Object.create(null));
        }
        // @ts-ignore
        getElementTemplate(dom, definition, parentContext, componentType) {
            if (definition == void 0) {
                return void 0;
            }
            let found = this.templateLookup.get(definition);
            if (!found) {
                found = this.templateFromSource(dom, definition, parentContext, componentType);
                this.templateLookup.set(definition, found);
            }
            return found;
        }
        getViewFactory(dom, definition, parentContext) {
            if (definition == void 0) {
                throw new Error(`No definition provided`); // TODO: create error code
            }
            let factory = this.viewFactoryLookup.get(definition);
            if (!factory) {
                const validSource = definitions_1.buildTemplateDefinition(null, definition);
                const template = this.templateFromSource(dom, validSource, parentContext, void 0);
                factory = new view_1.ViewFactory(validSource.name, template, this.lifecycle);
                factory.setCacheSize(validSource.cache, true);
                this.viewFactoryLookup.set(definition, factory);
            }
            return factory;
        }
        templateFromSource(dom, definition, parentContext, componentType) {
            if (parentContext == void 0) {
                parentContext = this.container;
            }
            if (definition.template != void 0) {
                const renderContext = createRenderContext(dom, parentContext, definition.dependencies, componentType);
                if (definition.build.required) {
                    const compilerName = definition.build.compiler || defaultCompilerName;
                    const compiler = this.compilers[compilerName];
                    if (compiler === undefined) {
                        throw kernel_1.Reporter.error(20, compilerName);
                    }
                    definition = compiler.compile(dom, definition, new kernel_1.RuntimeCompilationResources(renderContext), ViewCompileFlags.surrogate);
                }
                return this.templateFactory.create(renderContext, definition);
            }
            return exports.noViewTemplate;
        }
    }
    RenderingEngine.inject = [kernel_1.IContainer, exports.ITemplateFactory, lifecycle_1.ILifecycle, kernel_1.all(exports.ITemplateCompiler)];
    exports.RenderingEngine = RenderingEngine;
    function createRenderContext(dom, parent, dependencies, componentType) {
        const context = parent.createChild();
        const renderableProvider = new kernel_1.InstanceProvider();
        const elementProvider = new kernel_1.InstanceProvider();
        const instructionProvider = new kernel_1.InstanceProvider();
        const factoryProvider = new ViewFactoryProvider();
        const renderLocationProvider = new kernel_1.InstanceProvider();
        const renderer = context.get(exports.IRenderer);
        dom.registerElementResolver(context, elementProvider);
        context.registerResolver(lifecycle_1.IViewFactory, factoryProvider);
        context.registerResolver(lifecycle_1.IController, renderableProvider);
        context.registerResolver(definitions_1.ITargetedInstruction, instructionProvider);
        context.registerResolver(dom_1.IRenderLocation, renderLocationProvider);
        if (dependencies != void 0) {
            context.register(...dependencies);
        }
        //If the element has a view, support Recursive Components by adding self to own view template container.
        if (componentType) {
            componentType.register(context);
        }
        context.render = function (flags, renderable, targets, templateDefinition, host, parts) {
            renderer.render(flags, dom, this, renderable, targets, templateDefinition, host, parts);
        };
        // @ts-ignore
        context.beginComponentOperation = function (renderable, target, instruction, factory, parts, location) {
            renderableProvider.prepare(renderable);
            elementProvider.prepare(target);
            instructionProvider.prepare(instruction);
            if (factory) {
                factoryProvider.prepare(factory, parts);
            }
            if (location) {
                renderLocationProvider.prepare(location);
            }
            return context;
        };
        context.dispose = function () {
            factoryProvider.dispose();
            renderableProvider.dispose();
            instructionProvider.dispose();
            elementProvider.dispose();
            renderLocationProvider.dispose();
        };
        return context;
    }
    exports.createRenderContext = createRenderContext;
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
                const renderingEngine = handler.get(exports.IRenderingEngine);
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
    function hasChildrenChanged(viewModel) {
        return viewModel != void 0 && '$childrenChanged' in viewModel;
    }
    /** @internal */
    let ChildrenObserver = class ChildrenObserver {
        constructor(lifecycle, controller) {
            this.hasChanges = false;
            this.children = (void 0);
            this.controller = controller;
            this.lifecycle = lifecycle;
            this.controller = controller_1.Controller.forCustomElement(controller, (void 0), (void 0));
            this.projector = this.controller.projector;
            this.observing = false;
            this.ticking = false;
        }
        getValue() {
            if (!this.observing) {
                this.observing = true;
                this.projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); });
                this.children = findElements(this.projector.children);
            }
            return this.children;
        }
        setValue(newValue) { }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.callSubscribers(this.children, undefined, flags | 16 /* updateTargetInstance */);
                this.hasChanges = false;
            }
        }
        subscribe(subscriber) {
            if (!this.ticking) {
                this.ticking = true;
                this.lifecycle.enqueueRAF(this.flushRAF, this, 24576 /* bind */);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (this.ticking && !this.hasSubscribers()) {
                this.ticking = false;
                this.lifecycle.dequeueRAF(this.flushRAF, this);
            }
        }
        onChildrenChanged() {
            this.children = findElements(this.projector.children);
            if (hasChildrenChanged(this.controller.viewModel)) {
                this.controller.viewModel.$childrenChanged();
            }
            this.hasChanges = true;
        }
    };
    ChildrenObserver = tslib_1.__decorate([
        subscriber_collection_1.subscriberCollection()
    ], ChildrenObserver);
    exports.ChildrenObserver = ChildrenObserver;
    /** @internal */
    function findElements(nodes) {
        const components = [];
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            const current = nodes[i];
            const component = definitions_1.customElementBehavior(current);
            if (component != void 0) {
                components.push(component);
            }
        }
        return components;
    }
    exports.findElements = findElements;
});
//# sourceMappingURL=rendering-engine.js.map