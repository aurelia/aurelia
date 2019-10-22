(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "./definitions", "./instructions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    const definitions_1 = require("./definitions");
    const instructions_1 = require("./instructions");
    function createElement(dom, tagOrType, props, children) {
        if (typeof tagOrType === 'string') {
            return createElementForTag(dom, tagOrType, props, children);
        }
        else if (runtime_1.CustomElement.isType(tagOrType)) {
            return createElementForType(dom, tagOrType, props, children);
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
        constructor(dom, node, instructions, dependencies) {
            this.dom = dom;
            this.node = node;
            this.instructions = instructions;
            this.dependencies = dependencies;
            this.lazyDefinition = void 0;
        }
        get definition() {
            if (this.lazyDefinition === void 0) {
                this.lazyDefinition = runtime_1.CustomElementDefinition.create({
                    name: runtime_1.CustomElement.generateName(),
                    template: this.node,
                    needsCompile: typeof this.node === 'string',
                    instructions: this.instructions,
                    dependencies: this.dependencies,
                });
            }
            return this.lazyDefinition;
        }
        getElementTemplate(engine, Type) {
            return engine.getElementTemplate(this.dom, this.definition, void 0, Type);
        }
        createView(flags, engine, parentContext) {
            return this.getViewFactory(engine, parentContext).create();
        }
        getViewFactory(engine, parentContext) {
            return engine.getViewFactory(this.dom, this.definition, parentContext);
        }
        /** @internal */
        mergeInto(parent, instructions, dependencies) {
            this.dom.appendChild(parent, this.node);
            instructions.push(...this.instructions);
            dependencies.push(...this.dependencies);
        }
    }
    exports.RenderPlan = RenderPlan;
    function createElementForTag(dom, tagName, props, children) {
        const instructions = [];
        const allInstructions = [];
        const dependencies = [];
        const element = dom.createElement(tagName);
        let hasInstructions = false;
        if (props) {
            Object.keys(props)
                .forEach(to => {
                const value = props[to];
                if (definitions_1.isHTMLTargetedInstruction(value)) {
                    hasInstructions = true;
                    instructions.push(value);
                }
                else {
                    dom.setAttribute(element, to, value);
                }
            });
        }
        if (hasInstructions) {
            dom.makeTarget(element);
            allInstructions.push(instructions);
        }
        if (children) {
            addChildren(dom, element, children, allInstructions, dependencies);
        }
        return new RenderPlan(dom, element, allInstructions, dependencies);
    }
    function createElementForType(dom, Type, props, children) {
        const definition = runtime_1.CustomElement.getDefinition(Type);
        const tagName = definition.name;
        const instructions = [];
        const allInstructions = [instructions];
        const dependencies = [];
        const childInstructions = [];
        const bindables = definition.bindables;
        const element = dom.createElement(tagName);
        dom.makeTarget(element);
        if (!dependencies.includes(Type)) {
            dependencies.push(Type);
        }
        instructions.push(new runtime_1.HydrateElementInstruction(tagName, childInstructions));
        if (props) {
            Object.keys(props)
                .forEach(to => {
                const value = props[to];
                if (definitions_1.isHTMLTargetedInstruction(value)) {
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
                        childInstructions.push(new instructions_1.SetAttributeInstruction(value, to));
                    }
                }
            });
        }
        if (children) {
            addChildren(dom, element, children, allInstructions, dependencies);
        }
        return new RenderPlan(dom, element, allInstructions, dependencies);
    }
    function addChildren(dom, parent, children, allInstructions, dependencies) {
        for (let i = 0, ii = children.length; i < ii; ++i) {
            const current = children[i];
            switch (typeof current) {
                case 'string':
                    dom.appendChild(parent, dom.createTextNode(current));
                    break;
                case 'object':
                    if (dom.isNodeInstance(current)) {
                        dom.appendChild(parent, current);
                    }
                    else if ('mergeInto' in current) {
                        current.mergeInto(parent, allInstructions, dependencies);
                    }
            }
        }
    }
});
//# sourceMappingURL=create-element.js.map