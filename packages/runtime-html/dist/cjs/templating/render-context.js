"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderContext = exports.getRenderContext = exports.isRenderContext = void 0;
const dom_js_1 = require("../dom.js");
const renderer_js_1 = require("../renderer.js");
const custom_element_js_1 = require("../resources/custom-element.js");
const view_js_1 = require("./view.js");
const platform_js_1 = require("../platform.js");
const definitionContainerLookup = new WeakMap();
const fragmentCache = new WeakMap();
function isRenderContext(value) {
    return value instanceof RenderContext;
}
exports.isRenderContext = isRenderContext;
let renderContextCount = 0;
function getRenderContext(partialDefinition, container) {
    const definition = custom_element_js_1.CustomElementDefinition.getOrCreate(partialDefinition);
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
exports.getRenderContext = getRenderContext;
getRenderContext.count = 0;
// A simple counter for debugging purposes only
Reflect.defineProperty(getRenderContext, 'count', {
    get: () => renderContextCount
});
const emptyNodeCache = new WeakMap();
const getRenderersSymb = Symbol();
const compiledDefCache = new WeakMap();
class RenderContext {
    constructor(definition, container) {
        var _a;
        var _b;
        this.definition = definition;
        this.fragment = null;
        this.factory = void 0;
        this.isCompiled = false;
        this.renderers = Object.create(null);
        this.compiledDefinition = (void 0);
        ++renderContextCount;
        this.container = container;
        // note: it's incorrect to get rendereres only from root,
        //       as they could also be considered normal resources
        //       though it's highly practical for limiting renderers to the global scope
        const renderers = (_a = (_b = container.root)[getRenderersSymb]) !== null && _a !== void 0 ? _a : (_b[getRenderersSymb] = container.root.getAll(renderer_js_1.IRenderer));
        let i = 0;
        let renderer;
        for (; i < renderers.length; ++i) {
            renderer = renderers[i];
            this.renderers[renderer.instructionType] = renderer;
        }
        this.root = container.root;
        this.platform = container.get(platform_js_1.IPlatform);
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
            const compiler = container.get(renderer_js_1.ITemplateCompiler);
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
            factory = this.factory = new view_js_1.ViewFactory(name, this);
        }
        return factory;
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
    // #endregion
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
exports.RenderContext = RenderContext;
//# sourceMappingURL=render-context.js.map