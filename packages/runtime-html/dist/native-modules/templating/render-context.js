import { InstanceProvider, } from '../../../../kernel/dist/native-modules/index.js';
import { FragmentNodeSequence, INode, IRenderLocation } from '../dom.js';
import { IRenderer, ITemplateCompiler, IInstruction } from '../renderer.js';
import { CustomElementDefinition } from '../resources/custom-element.js';
import { IViewFactory, ViewFactory } from './view.js';
import { IAuSlotsInfo, IProjectionProvider } from '../resources/custom-elements/au-slot.js';
import { IPlatform } from '../platform.js';
import { IController } from './controller.js';
const definitionContainerLookup = new WeakMap();
const definitionContainerProjectionsLookup = new WeakMap();
const fragmentCache = new WeakMap();
export function isRenderContext(value) {
    return value instanceof RenderContext;
}
export function getRenderContext(partialDefinition, parentContainer, projections) {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
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
        this.root = parentContainer.root;
        const container = this.container = parentContainer.createChild();
        // TODO(fkleuver): get contextual + root renderers
        const renderers = container.getAll(IRenderer);
        for (let i = 0; i < renderers.length; ++i) {
            const renderer = renderers[i];
            this.renderers[renderer.instructionType] = renderer;
        }
        this.projectionProvider = container.get(IProjectionProvider);
        const p = this.platform = container.get(IPlatform);
        container.registerResolver(IViewFactory, this.factoryProvider = new ViewFactoryProvider(), true);
        container.registerResolver(IController, this.parentControllerProvider = new InstanceProvider('IController'), true);
        container.registerResolver(IInstruction, this.instructionProvider = new InstanceProvider('IInstruction'), true);
        container.registerResolver(IRenderLocation, this.renderLocationProvider = new InstanceProvider('IRenderLocation'), true);
        container.registerResolver(IAuSlotsInfo, this.auSlotsInfoProvider = new InstanceProvider('IAuSlotsInfo'), true);
        const ep = this.elementProvider = new InstanceProvider('ElementResolver');
        container.registerResolver(INode, ep);
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
            const compiler = container.get(ITemplateCompiler);
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
            factory = this.factory = new ViewFactory(name, this, contentType, projectionScope);
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
/** @internal */
export class ViewFactoryProvider {
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
//# sourceMappingURL=render-context.js.map