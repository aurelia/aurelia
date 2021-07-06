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
const fragmentCache = new WeakMap();
export function isRenderContext(value) {
    return value instanceof RenderContext;
}
let renderContextCount = 0;
export function getRenderContext(partialDefinition, container) {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
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
getRenderContext.count = 0;
// A simple counter for debugging purposes only
Reflect.defineProperty(getRenderContext, 'count', {
    get: () => renderContextCount
});
const emptyNodeCache = new WeakMap();
const getRenderersSymb = Symbol();
const compiledDefCache = new WeakMap();
export class RenderContext {
    constructor(definition, container) {
        var _a;
        var _b;
        this.definition = definition;
        this.fragment = null;
        this.factory = void 0;
        this.isCompiled = false;
        this.renderers = Object.create(null);
        this.compiledDefinition = (void 0);
        this.resourceInvoker = null;
        ++renderContextCount;
        this.container = container;
        // note: it's incorrect to get rendereres only from root,
        //       as they could also be considered normal resources
        //       though it's highly practical for limiting renderers to the global scope
        const renderers = (_a = (_b = container.root)[getRenderersSymb]) !== null && _a !== void 0 ? _a : (_b[getRenderersSymb] = container.root.getAll(IRenderer));
        let i = 0;
        let renderer;
        for (; i < renderers.length; ++i) {
            renderer = renderers[i];
            this.renderers[renderer.instructionType] = renderer;
        }
        this.root = container.root;
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
            let compiledMap = compiledDefCache.get(container.root);
            if (compiledMap == null) {
                compiledDefCache.set(container.root, compiledMap = new WeakMap());
            }
            let compiled = compiledMap.get(definition);
            if (compiled == null) {
                compiledMap.set(definition, compiled = compiler.compile(definition, container, compilationInstruction));
            }
            else {
                container.register(...compiled.dependencies);
            }
            compiledDefinition = this.compiledDefinition = compiled;
        }
        else {
            compiledDefinition = this.compiledDefinition = definition;
        }
        // Support Recursive Components by adding self to own context
        compiledDefinition.register(this.container);
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
        const p = this.platform;
        const container = this.container.createChild();
        const nodeProvider = new InstanceProvider('ElementProvider', host);
        // todo:
        // both node provider and location provider may not be allowed to throw
        // if there's no value associated, unlike InstanceProvider
        // reason being some custom element can have `containerless` attribute on them
        // causing the host to disappear, and replace by a location instead
        container.registerResolver(INode, nodeProvider);
        container.registerResolver(p.Node, nodeProvider);
        container.registerResolver(p.Element, nodeProvider);
        container.registerResolver(p.HTMLElement, nodeProvider);
        container.registerResolver(IController, new InstanceProvider('IController', parentController));
        container.registerResolver(IInstruction, new InstanceProvider('IInstruction', instruction));
        container.registerResolver(IRenderLocation, location == null
            ? noLocationProvider
            : new InstanceProvider('IRenderLocation', location));
        container.registerResolver(IViewFactory, viewFactory == null
            ? noViewFactoryProvider
            : new ViewFactoryProvider(viewFactory));
        container.registerResolver(IAuSlotsInfo, auSlotsInfo == null
            ? noAuSlotProvider
            : new InstanceProvider('AuSlotInfo', auSlotsInfo));
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
class ViewFactoryProvider {
    constructor(
    /**
     * The factory instance that this provider will resolves to,
     * until explicitly overridden by prepare call
     */
    factory) {
        this.factory = null;
        if (factory !== void 0) {
            this.factory = factory;
        }
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