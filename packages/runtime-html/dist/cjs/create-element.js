"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderPlan = exports.createElement = void 0;
const renderer_js_1 = require("./renderer.js");
const custom_element_js_1 = require("./resources/custom-element.js");
const render_context_js_1 = require("./templating/render-context.js");
function createElement(p, tagOrType, props, children) {
    if (typeof tagOrType === 'string') {
        return createElementForTag(p, tagOrType, props, children);
    }
    else if (custom_element_js_1.CustomElement.isType(tagOrType)) {
        return createElementForType(p, tagOrType, props, children);
    }
    else {
        throw new Error(`Invalid tagOrType.`);
    }
}
exports.createElement = createElement;
/**
 * RenderPlan. Todo: describe goal of this class
 */
class RenderPlan {
    constructor(node, instructions, dependencies) {
        this.node = node;
        this.instructions = instructions;
        this.dependencies = dependencies;
        this.lazyDefinition = void 0;
        this.childFor = new WeakMap();
    }
    get definition() {
        if (this.lazyDefinition === void 0) {
            this.lazyDefinition = custom_element_js_1.CustomElementDefinition.create({
                name: custom_element_js_1.CustomElement.generateName(),
                template: this.node,
                needsCompile: typeof this.node === 'string',
                instructions: this.instructions,
                dependencies: this.dependencies,
            });
        }
        return this.lazyDefinition;
    }
    getContext(container) {
        const childFor = this.childFor;
        let childContainer = childFor.get(container);
        if (childContainer == null) {
            childFor.set(container, (childContainer = container.createChild()).register(...this.dependencies));
        }
        return render_context_js_1.getRenderContext(this.definition, childContainer);
    }
    createView(parentContainer) {
        return this.getViewFactory(parentContainer).create();
    }
    getViewFactory(parentContainer) {
        return this.getContext(parentContainer).getViewFactory();
    }
    /** @internal */
    mergeInto(parent, instructions, dependencies) {
        parent.appendChild(this.node);
        instructions.push(...this.instructions);
        dependencies.push(...this.dependencies);
    }
}
exports.RenderPlan = RenderPlan;
function createElementForTag(p, tagName, props, children) {
    const instructions = [];
    const allInstructions = [];
    const dependencies = [];
    const element = p.document.createElement(tagName);
    let hasInstructions = false;
    if (props) {
        Object.keys(props)
            .forEach(to => {
            const value = props[to];
            if (renderer_js_1.isInstruction(value)) {
                hasInstructions = true;
                instructions.push(value);
            }
            else {
                element.setAttribute(to, value);
            }
        });
    }
    if (hasInstructions) {
        element.className = 'au';
        allInstructions.push(instructions);
    }
    if (children) {
        addChildren(p, element, children, allInstructions, dependencies);
    }
    return new RenderPlan(element, allInstructions, dependencies);
}
function createElementForType(p, Type, props, children) {
    const definition = custom_element_js_1.CustomElement.getDefinition(Type);
    const tagName = definition.name;
    const instructions = [];
    const allInstructions = [instructions];
    const dependencies = [];
    const childInstructions = [];
    const bindables = definition.bindables;
    const element = p.document.createElement(tagName);
    element.className = 'au';
    if (!dependencies.includes(Type)) {
        dependencies.push(Type);
    }
    instructions.push(new renderer_js_1.HydrateElementInstruction(tagName, void 0, childInstructions, null, false));
    if (props) {
        Object.keys(props)
            .forEach(to => {
            const value = props[to];
            if (renderer_js_1.isInstruction(value)) {
                childInstructions.push(value);
            }
            else {
                const bindable = bindables[to];
                if (bindable !== void 0) {
                    childInstructions.push({
                        type: "re" /* setProperty */,
                        to,
                        value
                    });
                }
                else {
                    childInstructions.push(new renderer_js_1.SetAttributeInstruction(value, to));
                }
            }
        });
    }
    if (children) {
        addChildren(p, element, children, allInstructions, dependencies);
    }
    return new RenderPlan(element, allInstructions, dependencies);
}
function addChildren(p, parent, children, allInstructions, dependencies) {
    for (let i = 0, ii = children.length; i < ii; ++i) {
        const current = children[i];
        switch (typeof current) {
            case 'string':
                parent.appendChild(p.document.createTextNode(current));
                break;
            case 'object':
                if (current instanceof p.Node) {
                    parent.appendChild(current);
                }
                else if ('mergeInto' in current) {
                    current.mergeInto(parent, allInstructions, dependencies);
                }
        }
    }
}
//# sourceMappingURL=create-element.js.map