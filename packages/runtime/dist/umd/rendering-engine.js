(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "./definitions", "./dom", "./lifecycle", "./observation/subscriber-collection", "./render-context", "./resources/custom-element", "./templating/controller", "./templating/view"], factory);
    }
})(function (require, exports) {
    "use strict";
    var ChildrenObserver_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("./definitions");
    const dom_1 = require("./dom");
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
            this.validSourceLookup = new Map();
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
            let validSource = this.validSourceLookup.get(definition);
            if (validSource === void 0) {
                validSource = definitions_1.buildTemplateDefinition(null, definition);
                this.validSourceLookup.set(definition, validSource);
            }
            let factoryRecord = this.viewFactoryLookup.get(validSource);
            if (factoryRecord === void 0) {
                factoryRecord = Object.create(null);
                this.viewFactoryLookup.set(validSource, factoryRecord);
            }
            const parentContextId = parentContext === void 0 ? 0 : parentContext.id;
            let factory = factoryRecord[parentContextId];
            if (factory === void 0) {
                const template = this.templateFromSource(dom, validSource, parentContext, void 0);
                factory = new view_1.ViewFactory(validSource.name, template, this.lifecycle);
                factory.setCacheSize(validSource.cache, true);
                factoryRecord[parentContextId] = factory;
            }
            return factory;
        }
        templateFromSource(dom, definition, parentContext, componentType) {
            if (parentContext == void 0) {
                parentContext = this.container;
            }
            if (definition.template != void 0) {
                const renderContext = new render_context_1.RenderContext(dom, parentContext, definition.dependencies, componentType);
                if (definition.build.required) {
                    const compilerName = definition.build.compiler || defaultCompilerName;
                    const compiler = this.compilers[compilerName];
                    if (compiler === undefined) {
                        throw kernel_1.Reporter.error(20, compilerName);
                    }
                    definition = compiler.compile(dom, definition, renderContext.createRuntimeCompilationResources(), ViewCompileFlags.surrogate);
                }
                return this.templateFactory.create(renderContext, definition);
            }
            return exports.noViewTemplate;
        }
    }
    exports.RenderingEngine = RenderingEngine;
    RenderingEngine.inject = [kernel_1.IContainer, exports.ITemplateFactory, lifecycle_1.ILifecycle, kernel_1.all(exports.ITemplateCompiler)];
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
    function defaultChildQuery(projector) {
        return projector.children;
    }
    function defaultChildFilter(node, controller, viewModel) {
        return !!viewModel;
    }
    function defaultChildMap(node, controller, viewModel) {
        return viewModel;
    }
});
//# sourceMappingURL=rendering-engine.js.map