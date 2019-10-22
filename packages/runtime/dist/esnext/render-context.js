import { InstanceProvider, Reporter, RuntimeCompilationResources, } from '@aurelia/kernel';
import { ITargetedInstruction } from './definitions';
import { IDOM, IRenderLocation } from './dom';
import { IController, IViewFactory } from './lifecycle';
import { IRenderer, IRenderingEngine } from './rendering-engine';
import { CustomElement } from './resources/custom-element';
export class RenderContext {
    constructor(dom, parentContainer, dependencies, componentType) {
        this.dom = dom;
        this.parentContainer = parentContainer;
        this.dependencies = dependencies;
        this.componentType = componentType;
        const container = (this.container = parentContainer.createChild());
        const renderableProvider = (this.renderableProvider = new InstanceProvider());
        const elementProvider = (this.elementProvider = new InstanceProvider());
        const instructionProvider = (this.instructionProvider = new InstanceProvider());
        const factoryProvider = (this.factoryProvider = new ViewFactoryProvider());
        const renderLocationProvider = (this.renderLocationProvider = new InstanceProvider());
        this.renderer = container.get(IRenderer);
        dom.registerElementResolver(container, elementProvider);
        container.registerResolver(IViewFactory, factoryProvider);
        container.registerResolver(IController, renderableProvider);
        container.registerResolver(ITargetedInstruction, instructionProvider);
        container.registerResolver(IRenderLocation, renderLocationProvider);
        if (dependencies != void 0) {
            container.register(...dependencies);
        }
        // If the element has a view, support Recursive Components by adding self to own view template container.
        if (componentType) {
            CustomElement.getDefinition(componentType).register(container);
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
        return new RuntimeCompilationResources(this.container);
    }
}
/** @internal */
export class ViewFactoryProvider {
    prepare(factory, parts) {
        this.factory = factory;
        factory.addParts(parts);
    }
    resolve(handler, requestor) {
        const factory = this.factory;
        if (factory == null) { // unmet precondition: call prepare
            throw Reporter.error(50); // TODO: organize error codes
        }
        if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
            throw Reporter.error(51); // TODO: organize error codes
        }
        const found = factory.parts[factory.name];
        if (found) {
            const renderingEngine = handler.get(IRenderingEngine);
            const dom = handler.get(IDOM);
            return renderingEngine.getViewFactory(dom, found, requestor);
        }
        return factory;
    }
    dispose() {
        this.factory = null;
    }
}
//# sourceMappingURL=render-context.js.map