(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "./lifecycle", "./observation/subscriber-collection", "./render-context", "./resources/custom-element", "./templating/controller", "./templating/view"], factory);
    }
})(function (require, exports) {
    "use strict";
    var ChildrenObserver_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const lifecycle_1 = require("./lifecycle");
    const subscriber_collection_1 = require("./observation/subscriber-collection");
    const render_context_1 = require("./render-context");
    const custom_element_1 = require("./resources/custom-element");
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
    // It is used to create instances of IController based on a compiled CustomElementDefinition.
    // TemplateDefinitions are hand-coded today, but will ultimately be the output of the
    // TemplateCompiler either through a JIT or AOT process.
    // Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a CustomElementDefinition
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
            controller.isStrictBinding = this.definition.isStrictBinding;
            flags |= this.definition.strategy;
            this.renderContext.render(flags, controller, nodes.findTargets(), this.definition, host, parts);
        }
    }
    exports.CompiledTemplate = CompiledTemplate;
    exports.IInstructionRenderer = kernel_1.DI.createInterface('IInstructionRenderer').noDefault();
    exports.IRenderer = kernel_1.DI.createInterface('IRenderer').noDefault();
    exports.IRenderingEngine = kernel_1.DI.createInterface('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));
    /** @internal */
    let RenderingEngine = class RenderingEngine {
        constructor(container, templateFactory, lifecycle, compiler) {
            this.container = container;
            this.templateFactory = templateFactory;
            this.lifecycle = lifecycle;
            this.compiler = compiler;
        }
        getElementTemplate(dom, definition, parentContext, componentType) {
            if (definition == void 0) {
                return void 0;
            }
            if (parentContext == void 0) {
                parentContext = this.container;
            }
            return this.templateFromSource(dom, definition, parentContext, componentType);
        }
        getViewFactory(dom, partialDefinition, parentContext) {
            if (partialDefinition == void 0) {
                throw new Error(`No definition provided`); // TODO: create error code
            }
            let definition;
            if (partialDefinition instanceof custom_element_1.CustomElementDefinition) {
                definition = partialDefinition;
            }
            else if (kernel_1.Metadata.hasOwn(custom_element_1.CustomElement.name, partialDefinition)) {
                definition = kernel_1.Metadata.getOwn(custom_element_1.CustomElement.name, partialDefinition);
            }
            else {
                definition = custom_element_1.CustomElementDefinition.create(partialDefinition);
                // Make sure the full definition can be retrieved both from the partialDefinition as well as its dynamically created class
                kernel_1.Metadata.define(custom_element_1.CustomElement.name, definition, partialDefinition);
                kernel_1.Metadata.define(custom_element_1.CustomElement.name, definition, definition.Type);
            }
            if (parentContext == void 0) {
                parentContext = this.container;
            }
            const factorykey = custom_element_1.CustomElement.keyFrom(`${parentContext.path}:factory`);
            let factory = kernel_1.Metadata.getOwn(factorykey, definition);
            if (factory === void 0) {
                const template = this.templateFromSource(dom, definition, parentContext, void 0);
                factory = new view_1.ViewFactory(definition.name, template, this.lifecycle);
                factory.setCacheSize(definition.cache, true);
                kernel_1.Metadata.define(factorykey, factory, definition);
            }
            return factory;
        }
        templateFromSource(dom, definition, parentContext, componentType) {
            const templateKey = custom_element_1.CustomElement.keyFrom(`${parentContext.path}:template`);
            let template = kernel_1.Metadata.getOwn(templateKey, definition);
            if (template === void 0) {
                template = this.templateFromSourceCore(dom, definition, parentContext, componentType);
                kernel_1.Metadata.define(templateKey, template, definition);
            }
            return template;
        }
        templateFromSourceCore(dom, definition, parentContext, componentType) {
            const renderContext = new render_context_1.RenderContext(dom, parentContext, definition.dependencies, componentType);
            if (definition.template != void 0 && definition.needsCompile) {
                const compiledDefinitionKey = custom_element_1.CustomElement.keyFrom(`${parentContext.path}:compiled-definition`);
                let compiledDefinition = kernel_1.Metadata.getOwn(compiledDefinitionKey, definition);
                if (compiledDefinition === void 0) {
                    compiledDefinition = this.compiler.compile(dom, definition, renderContext.createRuntimeCompilationResources(), ViewCompileFlags.surrogate);
                    kernel_1.Metadata.define(compiledDefinitionKey, compiledDefinition, definition);
                }
                return this.templateFactory.create(renderContext, compiledDefinition);
            }
            return this.templateFactory.create(renderContext, definition);
        }
    };
    RenderingEngine = tslib_1.__decorate([
        tslib_1.__param(0, kernel_1.IContainer),
        tslib_1.__param(1, exports.ITemplateFactory),
        tslib_1.__param(2, lifecycle_1.ILifecycle),
        tslib_1.__param(3, exports.ITemplateCompiler)
    ], RenderingEngine);
    exports.RenderingEngine = RenderingEngine;
    /** @internal */
    let ChildrenObserver = ChildrenObserver_1 = class ChildrenObserver {
        constructor(controller, viewModel, flags, propertyName, cbName, query = defaultChildQuery, filter = defaultChildFilter, map = defaultChildMap, options) {
            this.propertyKey = propertyName;
            this.obj = viewModel;
            this.callback = viewModel[cbName];
            this.query = query;
            this.filter = filter;
            this.map = map;
            this.options = options;
            this.children = (void 0);
            this.controller = controller;
            this.observing = false;
            this.persistentFlags = flags & 2080374799 /* persistentBindingFlags */;
            this.createGetterSetter();
        }
        getValue() {
            this.tryStartObserving();
            return this.children;
        }
        setValue(newValue) { }
        subscribe(subscriber) {
            this.tryStartObserving();
            this.addSubscriber(subscriber);
        }
        tryStartObserving() {
            if (!this.observing) {
                this.observing = true;
                const projector = this.controller.projector;
                this.children = filterChildren(projector, this.query, this.filter, this.map);
                projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); }, this.options);
            }
        }
        onChildrenChanged() {
            this.children = filterChildren(this.controller.projector, this.query, this.filter, this.map);
            if (this.callback !== void 0) {
                this.callback.call(this.obj);
            }
            this.callSubscribers(this.children, undefined, this.persistentFlags | 16 /* updateTargetInstance */);
        }
        createGetterSetter() {
            if (!Reflect.defineProperty(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                get: () => this.getValue(),
                set: () => { },
            })) {
                kernel_1.Reporter.write(1, this.propertyKey, this.obj);
            }
        }
    };
    ChildrenObserver = ChildrenObserver_1 = tslib_1.__decorate([
        subscriber_collection_1.subscriberCollection()
    ], ChildrenObserver);
    exports.ChildrenObserver = ChildrenObserver;
    function defaultChildQuery(projector) {
        return projector.children;
    }
    function defaultChildFilter(node, controller, viewModel) {
        return !!viewModel;
    }
    function defaultChildMap(node, controller, viewModel) {
        return viewModel;
    }
    /** @internal */
    function filterChildren(projector, query, filter, map) {
        const nodes = query(projector);
        const children = [];
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            const node = nodes[i];
            const controller = custom_element_1.CustomElement.behaviorFor(node);
            const viewModel = controller ? controller.viewModel : null;
            if (filter(node, controller, viewModel)) {
                children.push(map(node, controller, viewModel));
            }
        }
        return children;
    }
    exports.filterChildren = filterChildren;
});
//# sourceMappingURL=rendering-engine.js.map