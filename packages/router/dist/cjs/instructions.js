"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedNavigationInstruction = exports.NavigationInstructionType = exports.ViewportInstructionTree = exports.RedirectInstruction = exports.ViewportInstruction = exports.IViewportInstruction = void 0;
/* eslint-disable @typescript-eslint/restrict-template-expressions */
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const validation_js_1 = require("./validation.js");
const router_js_1 = require("./router.js");
const route_expression_js_1 = require("./route-expression.js");
const util_js_1 = require("./util.js");
exports.IViewportInstruction = kernel_1.DI.createInterface('IViewportInstruction');
class ViewportInstruction {
    constructor(context, append, open, close, component, viewport, params, children) {
        this.context = context;
        this.append = append;
        this.open = open;
        this.close = close;
        this.component = component;
        this.viewport = viewport;
        this.params = params;
        this.children = children;
    }
    static create(instruction, context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (instruction instanceof ViewportInstruction) {
            return instruction;
        }
        if (validation_js_1.isPartialViewportInstruction(instruction)) {
            const component = TypedNavigationInstruction.create(instruction.component);
            const children = (_b = (_a = instruction.children) === null || _a === void 0 ? void 0 : _a.map(ViewportInstruction.create)) !== null && _b !== void 0 ? _b : [];
            return new ViewportInstruction((_d = (_c = instruction.context) !== null && _c !== void 0 ? _c : context) !== null && _d !== void 0 ? _d : null, (_e = instruction.append) !== null && _e !== void 0 ? _e : false, (_f = instruction.open) !== null && _f !== void 0 ? _f : 0, (_g = instruction.close) !== null && _g !== void 0 ? _g : 0, component, (_h = instruction.viewport) !== null && _h !== void 0 ? _h : null, (_j = instruction.params) !== null && _j !== void 0 ? _j : null, children);
        }
        const typedInstruction = TypedNavigationInstruction.create(instruction);
        return new ViewportInstruction(context !== null && context !== void 0 ? context : null, false, 0, 0, typedInstruction, null, null, []);
    }
    contains(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length < otherChildren.length) {
            return false;
        }
        // TODO(fkleuver): incorporate viewports when null / '' descrepancies are fixed,
        // as well as params when inheritance is fully fixed
        if (!this.component.equals(other.component)) {
            return false;
        }
        for (let i = 0, ii = otherChildren.length; i < ii; ++i) {
            if (!thisChildren[i].contains(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    equals(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length !== otherChildren.length) {
            return false;
        }
        if (
        // TODO(fkleuver): decide if we really need to include `context` in this comparison
        !this.component.equals(other.component) ||
            this.viewport !== other.viewport ||
            !validation_js_1.shallowEquals(this.params, other.params)) {
            return false;
        }
        for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
            if (!thisChildren[i].equals(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    clone() {
        return new ViewportInstruction(this.context, this.append, this.open, this.close, this.component.clone(), this.viewport, this.params === null ? null : { ...this.params }, [...this.children]);
    }
    toUrlComponent(recursive = true) {
        // TODO(fkleuver): use the context to determine create full tree
        const component = this.component.toUrlComponent();
        const params = this.params === null || Object.keys(this.params).length === 0 ? '' : `(${stringifyParams(this.params)})`;
        const viewport = this.viewport === null || this.viewport.length === 0 ? '' : `@${this.viewport}`;
        const thisPart = `${'('.repeat(this.open)}${component}${params}${viewport}${')'.repeat(this.close)}`;
        const childPart = recursive ? this.children.map(x => x.toUrlComponent()).join('+') : '';
        if (thisPart.length > 0) {
            if (childPart.length > 0) {
                return [thisPart, childPart].join('/');
            }
            return thisPart;
        }
        return childPart;
    }
    toString() {
        const component = `c:${this.component}`;
        const viewport = this.viewport === null || this.viewport.length === 0 ? '' : `viewport:${this.viewport}`;
        const children = this.children.length === 0 ? '' : `children:[${this.children.map(String).join(',')}]`;
        const props = [component, viewport, children].filter(Boolean).join(',');
        return `VPI(${props})`;
    }
}
exports.ViewportInstruction = ViewportInstruction;
function stringifyParams(params) {
    const keys = Object.keys(params);
    const values = Array(keys.length);
    const indexKeys = [];
    const namedKeys = [];
    for (const key of keys) {
        if (kernel_1.isArrayIndex(key)) {
            indexKeys.push(Number(key));
        }
        else {
            namedKeys.push(key);
        }
    }
    for (let i = 0; i < keys.length; ++i) {
        const indexKeyIdx = indexKeys.indexOf(i);
        if (indexKeyIdx > -1) {
            values[i] = params[i];
            indexKeys.splice(indexKeyIdx, 1);
        }
        else {
            const namedKey = namedKeys.shift();
            values[i] = `${namedKey}=${params[namedKey]}`;
        }
    }
    return values.join(',');
}
class RedirectInstruction {
    constructor(path, redirectTo) {
        this.path = path;
        this.redirectTo = redirectTo;
    }
    static create(instruction) {
        if (instruction instanceof RedirectInstruction) {
            return instruction;
        }
        return new RedirectInstruction(instruction.path, instruction.redirectTo);
    }
    equals(other) {
        return this.path === other.path && this.redirectTo === other.redirectTo;
    }
    toUrlComponent() {
        return this.path;
    }
    toString() {
        return `RI(path:'${this.path}',redirectTo:'${this.redirectTo}')`;
    }
}
exports.RedirectInstruction = RedirectInstruction;
/**
 * Associate the object with an id so it can be stored in history as a serialized url segment.
 *
 * WARNING: As the implementation is right now, this is a memory leak disaster.
 * This is really a placeholder implementation at the moment and should NOT be used / advertised for production until a leak-free solution is made.
 */
const getObjectId = (function () {
    let lastId = 0;
    const objectIdMap = new Map();
    return function (obj) {
        let id = objectIdMap.get(obj);
        if (id === void 0) {
            objectIdMap.set(obj, id = ++lastId);
        }
        return id;
    };
})();
class ViewportInstructionTree {
    constructor(options, isAbsolute, children, queryParams, fragment) {
        this.options = options;
        this.isAbsolute = isAbsolute;
        this.children = children;
        this.queryParams = queryParams;
        this.fragment = fragment;
    }
    static create(instructionOrInstructions, options) {
        const $options = router_js_1.NavigationOptions.create({ ...options });
        if (instructionOrInstructions instanceof ViewportInstructionTree) {
            return new ViewportInstructionTree($options, instructionOrInstructions.isAbsolute, instructionOrInstructions.children.map(x => ViewportInstruction.create(x, $options.context)), instructionOrInstructions.queryParams, instructionOrInstructions.fragment);
        }
        if (instructionOrInstructions instanceof Array) {
            return new ViewportInstructionTree($options, false, instructionOrInstructions.map(x => ViewportInstruction.create(x, $options.context)), Object.freeze(new URLSearchParams()), null);
        }
        if (typeof instructionOrInstructions === 'string') {
            const expr = route_expression_js_1.RouteExpression.parse(instructionOrInstructions, $options.useUrlFragmentHash);
            return expr.toInstructionTree($options);
        }
        return new ViewportInstructionTree($options, false, [ViewportInstruction.create(instructionOrInstructions, $options.context)], Object.freeze(new URLSearchParams()), null);
    }
    equals(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length !== otherChildren.length) {
            return false;
        }
        for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
            if (!thisChildren[i].equals(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    toUrl() {
        const path = this.children.map(x => x.toUrlComponent()).join('+');
        const query = this.queryParams.toString();
        return query !== '' ? `${path}?${query}` : path;
    }
    toString() {
        return `[${this.children.map(String).join(',')}]`;
    }
}
exports.ViewportInstructionTree = ViewportInstructionTree;
var NavigationInstructionType;
(function (NavigationInstructionType) {
    NavigationInstructionType[NavigationInstructionType["string"] = 0] = "string";
    NavigationInstructionType[NavigationInstructionType["ViewportInstruction"] = 1] = "ViewportInstruction";
    NavigationInstructionType[NavigationInstructionType["CustomElementDefinition"] = 2] = "CustomElementDefinition";
    NavigationInstructionType[NavigationInstructionType["Promise"] = 3] = "Promise";
    NavigationInstructionType[NavigationInstructionType["IRouteViewModel"] = 4] = "IRouteViewModel";
})(NavigationInstructionType = exports.NavigationInstructionType || (exports.NavigationInstructionType = {}));
class TypedNavigationInstruction {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static create(instruction) {
        if (instruction instanceof TypedNavigationInstruction) {
            return instruction;
        }
        if (typeof instruction === 'string') {
            return new TypedNavigationInstruction(0 /* string */, instruction);
        }
        else if (!kernel_1.isObject(instruction)) {
            // Typings prevent this from happening, but guard it anyway due to `as any` and the sorts being a thing in userland code and tests.
            validation_js_1.expectType('function/class or object', '', instruction);
        }
        else if (typeof instruction === 'function') {
            // This is the class itself
            // CustomElement.getDefinition will throw if the type is not a custom element
            const definition = runtime_html_1.CustomElement.getDefinition(instruction);
            return new TypedNavigationInstruction(2 /* CustomElementDefinition */, definition);
        }
        else if (instruction instanceof Promise) {
            return new TypedNavigationInstruction(3 /* Promise */, instruction);
        }
        else if (validation_js_1.isPartialViewportInstruction(instruction)) {
            const viewportInstruction = ViewportInstruction.create(instruction);
            return new TypedNavigationInstruction(1 /* ViewportInstruction */, viewportInstruction);
        }
        else if (runtime_html_1.isCustomElementViewModel(instruction)) {
            return new TypedNavigationInstruction(4 /* IRouteViewModel */, instruction);
        }
        else if (instruction instanceof runtime_html_1.CustomElementDefinition) {
            // We might have gotten a complete definition. In that case use it as-is.
            return new TypedNavigationInstruction(2 /* CustomElementDefinition */, instruction);
        }
        else if (validation_js_1.isPartialCustomElementDefinition(instruction)) {
            // If we just got a partial definition, define a new anonymous class
            const Type = runtime_html_1.CustomElement.define(instruction);
            const definition = runtime_html_1.CustomElement.getDefinition(Type);
            return new TypedNavigationInstruction(2 /* CustomElementDefinition */, definition);
        }
        else {
            throw new Error(`Invalid component ${util_js_1.tryStringify(instruction)}: must be either a class, a custom element ViewModel, or a (partial) custom element definition`);
        }
    }
    equals(other) {
        switch (this.type) {
            case 2 /* CustomElementDefinition */:
            case 4 /* IRouteViewModel */:
            case 3 /* Promise */:
            case 0 /* string */:
                return this.type === other.type && this.value === other.value;
            case 1 /* ViewportInstruction */:
                return this.type === other.type && this.value.equals(other.value);
        }
    }
    clone() {
        return new TypedNavigationInstruction(this.type, this.value);
    }
    toUrlComponent() {
        switch (this.type) {
            case 2 /* CustomElementDefinition */:
                return this.value.name;
            case 4 /* IRouteViewModel */:
            case 3 /* Promise */:
                return `au$obj${getObjectId(this.value)}`;
            case 1 /* ViewportInstruction */:
                return this.value.toUrlComponent();
            case 0 /* string */:
                return this.value;
        }
    }
    toString() {
        switch (this.type) {
            case 2 /* CustomElementDefinition */:
                return `CEDef(name:'${this.value.name}')`;
            case 3 /* Promise */:
                return `Promise`;
            case 4 /* IRouteViewModel */:
                return `VM(name:'${runtime_html_1.CustomElement.getDefinition(this.value.constructor).name}')`;
            case 1 /* ViewportInstruction */:
                return this.value.toString();
            case 0 /* string */:
                return `'${this.value}'`;
        }
    }
}
exports.TypedNavigationInstruction = TypedNavigationInstruction;
//# sourceMappingURL=instructions.js.map