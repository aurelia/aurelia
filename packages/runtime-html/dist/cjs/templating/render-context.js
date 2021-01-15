"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewFactoryProvider = exports.RenderContext = exports.getRenderContext = exports.isRenderContext = void 0;
const kernel_1 = require("@aurelia/kernel");
const dom_js_1 = require("../dom.js");
const renderer_js_1 = require("../renderer.js");
const custom_element_js_1 = require("../resources/custom-element.js");
const view_js_1 = require("./view.js");
const au_slot_js_1 = require("../resources/custom-elements/au-slot.js");
const platform_js_1 = require("../platform.js");
const controller_js_1 = require("./controller.js");
const definitionContainerLookup = new WeakMap();
const definitionContainerProjectionsLookup = new WeakMap();
const fragmentCache = new WeakMap();
function isRenderContext(value) {
    return value instanceof RenderContext;
}
exports.isRenderContext = isRenderContext;
function getRenderContext(partialDefinition, parentContainer, projections) {
    const definition = custom_element_js_1.CustomElementDefinition.getOrCreate(partialDefinition);
    // injectable completely prevents caching, ensuring that each instance gets a new context context
    if (definition.injectable !== null) {
        return new RenderContext(definition, parentContainer);
    }
    if (projections == null) {
        let containerLookup = definitionContainerLookup.get(definition);
        if (containerLookup === void 0) {
            definitionContainerLookup.set(definition, containerLookup = new WeakMap());
        }
        let context = containerLookup.get(parentContainer);
        if (context === void 0) {
            containerLookup.set(parentContainer, context = new RenderContext(definition, parentContainer));
        }
        return context;
    }
    let containerProjectionsLookup = definitionContainerProjectionsLookup.get(definition);
    if (containerProjectionsLookup === void 0) {
        definitionContainerProjectionsLookup.set(definition, containerProjectionsLookup = new WeakMap());
    }
    let projectionsLookup = containerProjectionsLookup.get(parentContainer);
    if (projectionsLookup === void 0) {
        containerProjectionsLookup.set(parentContainer, projectionsLookup = new WeakMap());
    }
    let context = projectionsLookup.get(projections);
    if (context === void 0) {
        projectionsLookup.set(projections, context = new RenderContext(definition, parentContainer));
    }
    return context;
}
exports.getRenderContext = getRenderContext;
const emptyNodeCache = new WeakMap();
class RenderContext {
    constructor(definition, parentContainer) {
        this.definition = definition;
        this.parentContainer = parentContainer;
        this.viewModelProvider = void 0;
        this.fragment = null;
        this.factory = void 0;
        this.isCompiled = false;
        this.renderers = Object.create(null);
        this.compiledDefinition = (void 0);
        const container = this.container = parentContainer.createChild();
        // TODO(fkleuver): get contextual + root renderers
        const renderers = container.getAll(renderer_js_1.IRenderer);
        for (let i = 0; i < renderers.length; ++i) {
            const renderer = renderers[i];
            this.renderers[renderer.instructionType] = renderer;
        }
        this.projectionProvider = container.get(au_slot_js_1.IProjectionProvider);
        const p = this.platform = container.get(platform_js_1.IPlatform);
        container.registerResolver(view_js_1.IViewFactory, this.factoryProvider = new ViewFactoryProvider(), true);
        container.registerResolver(controller_js_1.IController, this.parentControllerProvider = new kernel_1.InstanceProvider('IController'), true);
        container.registerResolver(renderer_js_1.IInstruction, this.instructionProvider = new kernel_1.InstanceProvider('IInstruction'), true);
        container.registerResolver(dom_js_1.IRenderLocation, this.renderLocationProvider = new kernel_1.InstanceProvider('IRenderLocation'), true);
        container.registerResolver(au_slot_js_1.IAuSlotsInfo, this.auSlotsInfoProvider = new kernel_1.InstanceProvider('IAuSlotsInfo'), true);
        const ep = this.elementProvider = new kernel_1.InstanceProvider('ElementResolver');
        container.registerResolver(dom_js_1.INode, ep);
        container.registerResolver(p.Node, ep);
        container.registerResolver(p.Element, ep);
        container.registerResolver(p.HTMLElement, ep);
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
    // public deregisterResolverFor<K extends Key, T = K>(key: K): void {
    //   this.container.deregisterResolverFor(key);
    // }
    registerTransformer(key, transformer) {
        return this.container.registerTransformer(key, transformer);
    }
    getResolver(key, autoRegister) {
        return this.container.getResolver(key, autoRegister);
    }
    getFactory(key) {
        return this.container.getFactory(key);
    }
    registerFactory(key, factory) {
        this.container.registerFactory(key, factory);
    }
    createChild() {
        return this.container.createChild();
    }
    find(kind, name) {
        return this.container.find(kind, name);
    }
    create(kind, name) {
        return this.container.create(kind, name);
    }
    disposeResolvers() {
        this.container.disposeResolvers();
    }
    // #endregion
    // #region IRenderContext api
    compile(targetedProjections) {
        let compiledDefinition;
        if (this.isCompiled) {
            return this;
        }
        this.isCompiled = true;
        const definition = this.definition;
        if (definition.needsCompile) {
            const container = this.container;
            const compiler = container.get(renderer_js_1.ITemplateCompiler);
            compiledDefinition = this.compiledDefinition = compiler.compile(definition, container, targetedProjections);
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
            const doc = this.platform.document;
            const template = compiledDefinition.template;
            if (template === null || this.definition.enhance === true) {
                this.fragment = null;
            }
            else if (template instanceof this.platform.Node) {
                if (template.nodeName === 'TEMPLATE') {
                    this.fragment = doc.adoptNode(template.content);
                }
                else {
                    (this.fragment = doc.adoptNode(doc.createDocumentFragment())).appendChild(template);
                }
            }
            else {
                const tpl = doc.createElement('template');
                doc.adoptNode(tpl.content);
                if (typeof template === 'string') {
                    tpl.innerHTML = template;
                }
                this.fragment = tpl.content;
            }
            fragmentCache.set(compiledDefinition, this.fragment);
        }
        return this;
    }
    getViewFactory(name, contentType, projectionScope) {
        let factory = this.factory;
        if (factory === void 0) {
            if (name === void 0) {
                name = this.definition.name;
            }
            factory = this.factory = new view_js_1.ViewFactory(name, this, contentType, projectionScope);
        }
        return factory;
    }
    beginChildComponentOperation(instance) {
        const definition = this.definition;
        if (definition.injectable !== null) {
            if (this.viewModelProvider === void 0) {
                this.container.registerResolver(definition.injectable, this.viewModelProvider = new kernel_1.InstanceProvider('definition.injectable'));
            }
            this.viewModelProvider.prepare(instance);
        }
        return this;
    }
    // #endregion
    // #region ICompiledRenderContext api
    createNodes() {
        if (this.compiledDefinition.enhance === true) {
            return new dom_js_1.FragmentNodeSequence(this.platform, this.compiledDefinition.template);
        }
        if (this.fragment === null) {
            let emptyNodes = emptyNodeCache.get(this.platform);
            if (emptyNodes === void 0) {
                emptyNodeCache.set(this.platform, emptyNodes = new dom_js_1.FragmentNodeSequence(this.platform, this.platform.document.createDocumentFragment()));
            }
            return emptyNodes;
        }
        return new dom_js_1.FragmentNodeSequence(this.platform, this.fragment.cloneNode(true));
    }
    // TODO: split up into 2 methods? getComponentFactory + getSyntheticFactory or something
    getComponentFactory(parentController, host, instruction, viewFactory, location, auSlotsInfo) {
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
        if (auSlotsInfo !== void 0) {
            this.auSlotsInfoProvider.prepare(auSlotsInfo);
        }
        return this;
    }
    // #endregion
    // #region IComponentFactory api
    createComponent(resourceKey) {
        return this.container.get(resourceKey);
    }
    render(flags, controller, targets, definition, host) {
        if (targets.length !== definition.instructions.length) {
            throw new Error(`The compiled template is not aligned with the render instructions. There are ${targets.length} targets and ${definition.instructions.length} instructions.`);
        }
        for (let i = 0; i < targets.length; ++i) {
            this.renderChildren(
            /* flags        */ flags, 
            /* instructions */ definition.instructions[i], 
            /* controller   */ controller, 
            /* target       */ targets[i]);
        }
        if (host !== void 0 && host !== null) {
            this.renderChildren(
            /* flags        */ flags, 
            /* instructions */ definition.surrogates, 
            /* controller   */ controller, 
            /* target       */ host);
        }
    }
    renderChildren(flags, instructions, controller, target) {
        for (let i = 0; i < instructions.length; ++i) {
            const current = instructions[i];
            this.renderers[current.type].render(flags, this, controller, target, current);
        }
    }
    dispose() {
        this.elementProvider.dispose();
    }
    // #endregion
    // #region IProjectionProvider api
    registerProjections(projections, scope) {
        this.projectionProvider.registerProjections(projections, scope);
    }
    getProjectionFor(instruction) {
        return this.projectionProvider.getProjectionFor(instruction);
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
    resolve(_handler, _requestor) {
        const factory = this.factory;
        if (factory === null) {
            throw new Error('Cannot resolve ViewFactory before the provider was prepared.');
        }
        if (typeof factory.name !== 'string' || factory.name.length === 0) {
            throw new Error('Cannot resolve ViewFactory without a (valid) name.');
        }
        return factory;
    }
    dispose() {
        this.factory = null;
    }
}
exports.ViewFactoryProvider = ViewFactoryProvider;
//# sourceMappingURL=render-context.js.map