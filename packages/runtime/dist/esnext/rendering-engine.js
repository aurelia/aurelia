var ChildrenObserver_1;
import { __decorate, __param } from "tslib";
import { DI, IContainer, Reporter, Metadata, } from '@aurelia/kernel';
import { ILifecycle, } from './lifecycle';
import { subscriberCollection } from './observation/subscriber-collection';
import { RenderContext } from './render-context';
import { CustomElement, CustomElementDefinition, } from './resources/custom-element';
import { Controller } from './templating/controller';
import { ViewFactory } from './templating/view';
export const ITemplateCompiler = DI.createInterface('ITemplateCompiler').noDefault();
export var ViewCompileFlags;
(function (ViewCompileFlags) {
    ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
    ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
    ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
})(ViewCompileFlags || (ViewCompileFlags = {}));
export const ITemplateFactory = DI.createInterface('ITemplateFactory').noDefault();
// This is the main implementation of ITemplate.
// It is used to create instances of IController based on a compiled CustomElementDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a CustomElementDefinition
// and create instances of it on demand.
export class CompiledTemplate {
    constructor(dom, definition, factory, renderContext) {
        this.dom = dom;
        this.definition = definition;
        this.factory = factory;
        this.renderContext = renderContext;
    }
    render(viewModelOrController, host, parts, flags = 0 /* none */) {
        const controller = viewModelOrController instanceof Controller
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
export const IInstructionRenderer = DI.createInterface('IInstructionRenderer').noDefault();
export const IRenderer = DI.createInterface('IRenderer').noDefault();
export const IRenderingEngine = DI.createInterface('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));
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
        if (partialDefinition instanceof CustomElementDefinition) {
            definition = partialDefinition;
        }
        else if (Metadata.hasOwn(CustomElement.name, partialDefinition)) {
            definition = Metadata.getOwn(CustomElement.name, partialDefinition);
        }
        else {
            definition = CustomElementDefinition.create(partialDefinition);
            // Make sure the full definition can be retrieved both from the partialDefinition as well as its dynamically created class
            Metadata.define(CustomElement.name, definition, partialDefinition);
            Metadata.define(CustomElement.name, definition, definition.Type);
        }
        if (parentContext == void 0) {
            parentContext = this.container;
        }
        const factorykey = CustomElement.keyFrom(`${parentContext.path}:factory`);
        let factory = Metadata.getOwn(factorykey, definition);
        if (factory === void 0) {
            const template = this.templateFromSource(dom, definition, parentContext, void 0);
            factory = new ViewFactory(definition.name, template, this.lifecycle);
            factory.setCacheSize(definition.cache, true);
            Metadata.define(factorykey, factory, definition);
        }
        return factory;
    }
    templateFromSource(dom, definition, parentContext, componentType) {
        const templateKey = CustomElement.keyFrom(`${parentContext.path}:template`);
        let template = Metadata.getOwn(templateKey, definition);
        if (template === void 0) {
            template = this.templateFromSourceCore(dom, definition, parentContext, componentType);
            Metadata.define(templateKey, template, definition);
        }
        return template;
    }
    templateFromSourceCore(dom, definition, parentContext, componentType) {
        const renderContext = new RenderContext(dom, parentContext, definition.dependencies, componentType);
        if (definition.template != void 0 && definition.needsCompile) {
            const compiledDefinitionKey = CustomElement.keyFrom(`${parentContext.path}:compiled-definition`);
            let compiledDefinition = Metadata.getOwn(compiledDefinitionKey, definition);
            if (compiledDefinition === void 0) {
                compiledDefinition = this.compiler.compile(dom, definition, renderContext.createRuntimeCompilationResources(), ViewCompileFlags.surrogate);
                Metadata.define(compiledDefinitionKey, compiledDefinition, definition);
            }
            return this.templateFactory.create(renderContext, compiledDefinition);
        }
        return this.templateFactory.create(renderContext, definition);
    }
};
RenderingEngine = __decorate([
    __param(0, IContainer),
    __param(1, ITemplateFactory),
    __param(2, ILifecycle),
    __param(3, ITemplateCompiler)
], RenderingEngine);
export { RenderingEngine };
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
            Reporter.write(1, this.propertyKey, this.obj);
        }
    }
};
ChildrenObserver = ChildrenObserver_1 = __decorate([
    subscriberCollection()
], ChildrenObserver);
export { ChildrenObserver };
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
export function filterChildren(projector, query, filter, map) {
    const nodes = query(projector);
    const children = [];
    for (let i = 0, ii = nodes.length; i < ii; ++i) {
        const node = nodes[i];
        const controller = CustomElement.behaviorFor(node);
        const viewModel = controller ? controller.viewModel : null;
        if (filter(node, controller, viewModel)) {
            children.push(map(node, controller, viewModel));
        }
    }
    return children;
}
//# sourceMappingURL=rendering-engine.js.map