import { InstanceProvider, } from '@aurelia/kernel';
import { ITargetedInstruction, } from '../definitions';
import { IDOM, IRenderLocation } from '../dom';
import { IController, ILifecycle, IViewFactory, } from '../lifecycle';
import { IRenderer, ITemplateCompiler } from '../renderer';
import { CustomElementDefinition } from '../resources/custom-element';
import { ViewFactory } from './view';
import { IProjectionProvider } from '../resources/custom-elements/au-slot';
const definitionContainerLookup = new WeakMap();
const definitionContainerProjectionsLookup = new WeakMap();
const fragmentCache = new WeakMap();
export function isRenderContext(value) {
    return value instanceof RenderContext;
}
export function getRenderContext(partialDefinition, parentContainer, projections) {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    // injectable completely prevents caching, ensuring that each instance gets a new render context
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
export class RenderContext {
    constructor(definition, parentContainer) {
        this.definition = definition;
        this.parentContainer = parentContainer;
        this.viewModelProvider = void 0;
        this.fragment = null;
        this.factory = void 0;
        this.isCompiled = false;
        this.compiledDefinition = (void 0);
        const container = this.container = parentContainer.createChild();
        this.renderer = container.get(IRenderer);
        this.projectionProvider = container.get(IProjectionProvider);
        container.registerResolver(IViewFactory, this.factoryProvider = new ViewFactoryProvider(), true);
        container.registerResolver(IController, this.parentControllerProvider = new InstanceProvider('IController'), true);
        container.registerResolver(ITargetedInstruction, this.instructionProvider = new InstanceProvider('ITargetedInstruction'), true);
        container.registerResolver(IRenderLocation, this.renderLocationProvider = new InstanceProvider('IRenderLocation'), true);
        (this.dom = container.get(IDOM)).registerElementResolver(container, this.elementProvider = new InstanceProvider('ElementResolver'));
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
            const template = compiledDefinition.template;
            if (template === null) {
                fragmentCache.set(compiledDefinition, null);
            }
            else {
                fragmentCache.set(compiledDefinition, this.fragment = this.definition.enhance ? template : this.dom.createDocumentFragment(template));
            }
        }
        return this;
    }
    getViewFactory(name, contentType, projectionScope) {
        let factory = this.factory;
        if (factory === void 0) {
            if (name === void 0) {
                name = this.definition.name;
            }
            const lifecycle = this.parentContainer.get(ILifecycle);
            factory = this.factory = new ViewFactory(name, this, lifecycle, contentType, projectionScope);
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
        return this.dom.createNodeSequence(this.fragment, !this.definition.enhance);
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
    render(flags, controller, targets, templateDefinition, host) {
        this.renderer.render(flags, this, controller, targets, templateDefinition, host);
    }
    renderInstructions(flags, instructions, controller, target) {
        this.renderer.renderInstructions(flags, this, instructions, controller, target);
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