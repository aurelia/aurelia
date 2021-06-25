import { InstanceProvider } from '@aurelia/kernel';
import { FragmentNodeSequence, INode, IRenderLocation } from '../dom.js';
import { IRenderer, ITemplateCompiler, IInstruction } from '../renderer.js';
import { CustomElementDefinition } from '../resources/custom-element.js';
import { CustomAttribute } from '../resources/custom-attribute.js';
import { IViewFactory, ViewFactory } from './view.js';
import { IAuSlotsInfo } from '../resources/custom-elements/au-slot.js';
import { IPlatform } from '../platform.js';
import { IController } from './controller.js';
const definitionContainerLookup = new WeakMap();
const definitionContainerProjectionsLookup = new WeakMap();
const fragmentCache = new WeakMap();
export function isRenderContext(value) {
    return value instanceof RenderContext;
}
let renderContextCount = 0;
export function getRenderContext(partialDefinition, container, projections) {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    // injectable completely prevents caching, ensuring that each instance gets a new context context
    if (definition.injectable !== null) {
        return new RenderContext(definition, container);
    }
    if (projections == null) {
        let containerLookup = definitionContainerLookup.get(definition);
        if (containerLookup === void 0) {
            definitionContainerLookup.set(definition, containerLookup = new WeakMap());
        }
        let context = containerLookup.get(container);
        if (context === void 0) {
            containerLookup.set(container, context = new RenderContext(definition, container));
        }
        return context;
    }
    let containerProjectionsLookup = definitionContainerProjectionsLookup.get(definition);
    if (containerProjectionsLookup === void 0) {
        definitionContainerProjectionsLookup.set(definition, containerProjectionsLookup = new WeakMap());
    }
    let projectionsLookup = containerProjectionsLookup.get(container);
    if (projectionsLookup === void 0) {
        containerProjectionsLookup.set(container, projectionsLookup = new WeakMap());
    }
    let context = projectionsLookup.get(projections);
    if (context === void 0) {
        projectionsLookup.set(projections, context = new RenderContext(definition, container));
    }
    return context;
}
getRenderContext.count = 0;
// A simple counter for debugging purposes only
Reflect.defineProperty(getRenderContext, 'count', {
    get: () => renderContextCount
});
const emptyNodeCache = new WeakMap();
export class RenderContext {
    constructor(definition, parentContainer) {
        this.definition = definition;
        this.parentContainer = parentContainer;
        this.viewModelProvider = void 0;
        this.fragment = null;
        this.factory = void 0;
        this.isCompiled = false;
        this.renderers = Object.create(null);
        this.compiledDefinition = (void 0);
        this.resourceInvoker = null;
        ++renderContextCount;
        const container = this.container = parentContainer;
        // TODO(fkleuver): get contextual + root renderers
        const renderers = container.getAll(IRenderer);
        let i = 0;
        let renderer;
        for (; i < renderers.length; ++i) {
            renderer = renderers[i];
            this.renderers[renderer.instructionType] = renderer;
        }
        this.root = parentContainer.root;
        this.platform = container.get(IPlatform);
        this.elementProvider = new InstanceProvider('ElementResolver');
        this.factoryProvider = new ViewFactoryProvider();
        this.parentControllerProvider = new InstanceProvider('IController');
        this.instructionProvider = new InstanceProvider('IInstruction');
        this.renderLocationProvider = new InstanceProvider('IRenderLocation');
        this.auSlotsInfoProvider = new InstanceProvider('IAuSlotsInfo');
    }
    get id() {
        return this.container.id;
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
    invoke(key, dynamicDependencies) {
        return this.container.invoke(key, dynamicDependencies);
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
    compile(compilationInstruction) {
        let compiledDefinition;
        if (this.isCompiled) {
            return this;
        }
        this.isCompiled = true;
        const definition = this.definition;
        if (definition.needsCompile) {
            const container = this.container;
            const compiler = container.get(ITemplateCompiler);
            compiledDefinition = this.compiledDefinition = compiler.compile(definition, container, compilationInstruction);
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
    getViewFactory(name) {
        let factory = this.factory;
        if (factory === void 0) {
            if (name === void 0) {
                name = this.definition.name;
            }
            factory = this.factory = new ViewFactory(name, this);
        }
        return factory;
    }
    beginChildComponentOperation(instance) {
        const definition = this.definition;
        if (definition.injectable !== null) {
            if (this.viewModelProvider === void 0) {
                this.container.registerResolver(definition.injectable, this.viewModelProvider = new InstanceProvider('definition.injectable'));
            }
            this.viewModelProvider.prepare(instance);
        }
        return this;
    }
    // #endregion
    // #region ICompiledRenderContext api
    createNodes() {
        if (this.compiledDefinition.enhance === true) {
            return new FragmentNodeSequence(this.platform, this.compiledDefinition.template);
        }
        if (this.fragment === null) {
            let emptyNodes = emptyNodeCache.get(this.platform);
            if (emptyNodes === void 0) {
                emptyNodeCache.set(this.platform, emptyNodes = new FragmentNodeSequence(this.platform, this.platform.document.createDocumentFragment()));
            }
            return emptyNodes;
        }
        return new FragmentNodeSequence(this.platform, this.fragment.cloneNode(true));
    }
    // #endregion
    createElementContainer(parentController, host, instruction, viewFactory, location, auSlotsInfo) {
        const ctxContainer = this.container;
        const p = this.platform;
        const container = ctxContainer.createChild();
        const nodeProvider = new InstanceProvider('ElementProvider');
        const controllerProvider = new InstanceProvider('IController');
        const instructionProvider = new InstanceProvider('IInstruction');
        let viewFactoryProvider;
        let locationProvider;
        let slotInfoProvider;
        controllerProvider.prepare(parentController);
        nodeProvider.prepare(host);
        instructionProvider.prepare(instruction);
        if (viewFactory == null) {
            viewFactoryProvider = noViewFactoryProvider;
        }
        else {
            viewFactoryProvider = new ViewFactoryProvider();
            viewFactoryProvider.prepare(viewFactory);
        }
        if (location == null) {
            locationProvider = noLocationProvider;
        }
        else {
            locationProvider = new InstanceProvider('IRenderLocation');
            locationProvider.prepare(location);
        }
        if (auSlotsInfo == null) {
            slotInfoProvider = noAuSlotProvider;
        }
        else {
            slotInfoProvider = new InstanceProvider('AuSlotInfo');
            slotInfoProvider.prepare(auSlotsInfo);
        }
        container.registerResolver(INode, nodeProvider);
        container.registerResolver(p.Node, nodeProvider);
        container.registerResolver(p.Element, nodeProvider);
        container.registerResolver(p.HTMLElement, nodeProvider);
        container.registerResolver(IController, controllerProvider);
        container.registerResolver(IInstruction, instructionProvider);
        container.registerResolver(IRenderLocation, locationProvider);
        container.registerResolver(IViewFactory, viewFactoryProvider);
        container.registerResolver(IAuSlotsInfo, slotInfoProvider);
        return container;
    }
    invokeAttribute(parentController, host, instruction, viewFactory, location, auSlotsInfo) {
        const p = this.platform;
        const eProvider = this.elementProvider;
        const pcProvider = this.parentControllerProvider;
        const iProvider = this.instructionProvider;
        const fProvider = this.factoryProvider;
        const rlProvider = this.renderLocationProvider;
        const siProvider = this.auSlotsInfoProvider;
        const container = this.container;
        const definition = container.find(CustomAttribute, instruction.res);
        const Ctor = definition.Type;
        let invoker = this.resourceInvoker;
        if (invoker == null) {
            invoker = container.createChild();
            invoker.registerResolver(INode, eProvider, true);
            invoker.registerResolver(p.Node, eProvider);
            invoker.registerResolver(p.Element, eProvider);
            invoker.registerResolver(p.HTMLElement, eProvider);
            invoker.registerResolver(IController, pcProvider, true);
            invoker.registerResolver(IInstruction, iProvider, true);
            invoker.registerResolver(IRenderLocation, rlProvider, true);
            invoker.registerResolver(IViewFactory, fProvider, true);
            invoker.registerResolver(IAuSlotsInfo, siProvider, true);
        }
        eProvider.prepare(host);
        pcProvider.prepare(parentController);
        iProvider.prepare(instruction);
        // null or undefined wouldn't matter
        // as it can just throw if trying to inject something non-existant
        fProvider.prepare(viewFactory);
        rlProvider.prepare(location);
        siProvider.prepare(auSlotsInfo);
        const instance = invoker.invoke(Ctor);
        invoker.dispose();
        return instance;
    }
    // public create
    // #region IComponentFactory api
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
        throw new Error('Cannot dispose a render context');
    }
}
/** @internal */
export class ViewFactoryProvider {
    constructor() {
        this.factory = null;
    }
    prepare(factory) {
        this.factory = factory;
    }
    get $isResolver() { return true; }
    resolve() {
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
const noLocationProvider = new InstanceProvider('IRenderLocation');
const noViewFactoryProvider = new ViewFactoryProvider();
const noAuSlotProvider = new InstanceProvider('AuSlotsInfo');
//# sourceMappingURL=render-context.js.map