"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionResolver = void 0;
const viewport_instruction_js_1 = require("./viewport-instruction.js");
class InstructionResolver {
    constructor() {
        this.separators = {
            viewport: '@',
            sibling: '+',
            scope: '/',
            scopeStart: '(',
            scopeEnd: ')',
            noScope: '!',
            parameters: '(',
            parametersEnd: ')',
            parameterSeparator: ',',
            parameterKeySeparator: '=',
            parameter: '&',
            add: '+',
            clear: '-',
            action: '.',
        };
    }
    start(options) {
        options = options || {};
        this.separators = { ...this.separators, ...options.separators };
    }
    get clearViewportInstruction() {
        return this.separators.clear;
    }
    get addViewportInstruction() {
        return this.separators.add;
    }
    isClearViewportInstruction(instruction) {
        return instruction instanceof viewport_instruction_js_1.ViewportInstruction
            ? instruction.componentName === this.clearViewportInstruction && !!instruction.viewportName
            : instruction.startsWith(this.clearViewportInstruction) && instruction !== this.clearViewportInstruction;
    }
    isAddViewportInstruction(instruction) {
        return instruction instanceof viewport_instruction_js_1.ViewportInstruction
            ? instruction.componentName === this.addViewportInstruction
            : (instruction === this.addViewportInstruction
                || instruction.startsWith(`${this.separators.add}${this.separators.viewport}`));
    }
    isClearViewportScopeInstruction(instruction) {
        return instruction instanceof viewport_instruction_js_1.ViewportInstruction
            ? instruction.componentName === this.clearViewportInstruction && !!instruction.viewportScope
            : instruction.startsWith(this.clearViewportInstruction) && instruction !== this.clearViewportInstruction;
    }
    isClearAllViewportsInstruction(instruction) {
        return instruction instanceof viewport_instruction_js_1.ViewportInstruction
            ? instruction.componentName === this.clearViewportInstruction && !instruction.viewportName
            : instruction === this.clearViewportInstruction;
    }
    isAddAllViewportsInstruction(instruction) {
        return instruction instanceof viewport_instruction_js_1.ViewportInstruction
            ? instruction.componentName === this.addViewportInstruction && !instruction.viewportName
            : instruction === this.addViewportInstruction;
    }
    createViewportInstruction(component, viewport, parameters, ownsScope = true, nextScopeInstructions = null) {
        if (component instanceof Promise) {
            return component.then((resolvedComponent) => {
                return this.createViewportInstruction(resolvedComponent, viewport, parameters, ownsScope, nextScopeInstructions);
            });
        }
        // const instruction: ViewportInstruction = new ViewportInstruction(component, viewport, parameters, ownsScope, nextScopeInstructions);
        // instruction.setInstructionResolver(this);
        // return instruction;
        return viewport_instruction_js_1.ViewportInstruction.create(this, component, viewport, parameters, ownsScope, nextScopeInstructions);
    }
    parseViewportInstructions(instructions) {
        const match = /^[./]+/.exec(instructions);
        let context = '';
        if (Array.isArray(match) && match.length > 0) {
            context = match[0];
            instructions = instructions.slice(context.length);
        }
        const parsedInstructions = this.parseViewportInstructionsWorker(instructions, true).instructions;
        for (const instruction of parsedInstructions) {
            instruction.context = context;
        }
        return parsedInstructions;
    }
    parseViewportInstruction(instruction) {
        const instructions = this.parseViewportInstructions(instruction);
        if (instructions.length) {
            return instructions[0];
        }
        return this.createViewportInstruction('');
    }
    stringifyViewportInstructions(instructions, excludeViewport = false, viewportContext = false) {
        return typeof (instructions) === 'string'
            ? instructions
            : instructions
                .map(instruction => this.stringifyViewportInstruction(instruction, excludeViewport, viewportContext))
                .filter(instruction => instruction && instruction.length)
                .join(this.separators.sibling);
    }
    stringifyViewportInstruction(instruction, excludeViewport = false, viewportContext = false) {
        if (typeof instruction === 'string') {
            return this.stringifyAViewportInstruction(instruction, excludeViewport);
        }
        else {
            let excludeCurrentViewport = excludeViewport;
            let excludeCurrentComponent = false;
            if (viewportContext) {
                if (instruction.viewport && instruction.viewport.options.noLink) {
                    return '';
                }
                if (!instruction.needsViewportDescribed && instruction.viewport && !instruction.viewport.options.forceDescription) {
                    excludeCurrentViewport = true;
                }
                if (instruction.viewport && instruction.viewport.options.fallback === instruction.componentName) {
                    excludeCurrentComponent = true;
                }
                if (!instruction.needsViewportDescribed && instruction.viewportScope) {
                    excludeCurrentViewport = true;
                }
            }
            let route = instruction.route ?? null;
            const nextInstructions = instruction.nextScopeInstructions;
            let stringified = instruction.context;
            // It's a configured route
            if (route !== null) {
                // Already added as part of a configuration, skip to next scope
                if (route === '') {
                    return Array.isArray(nextInstructions)
                        ? this.stringifyViewportInstructions(nextInstructions, excludeViewport, viewportContext)
                        : '';
                }
                route = route.matching;
                stringified += route.endsWith(this.separators.scope) ? route.slice(0, -this.separators.scope.length) : route;
            }
            else {
                stringified += this.stringifyAViewportInstruction(instruction, excludeCurrentViewport, excludeCurrentComponent);
            }
            if (Array.isArray(nextInstructions) && nextInstructions.length) {
                const nextStringified = this.stringifyViewportInstructions(nextInstructions, excludeViewport, viewportContext);
                if (nextStringified.length > 0) {
                    stringified += nextInstructions.length === 1 // TODO: This should really also check that the instructions have value
                        ? `${this.separators.scope}${nextStringified}`
                        : `${this.separators.scope}${this.separators.scopeStart}${nextStringified}${this.separators.scopeEnd}`;
                }
            }
            return stringified;
        }
    }
    stringifyScopedViewportInstructions(instructions) {
        if (!Array.isArray(instructions)) {
            return this.stringifyScopedViewportInstructions([instructions]);
        }
        return instructions.map((instruction) => this.stringifyViewportInstruction(instruction)).join(this.separators.scope);
    }
    encodeViewportInstructions(instructions) {
        return encodeURIComponent(this.stringifyViewportInstructions(instructions)).replace(/\(/g, '%28').replace(/\)/g, '%29');
    }
    decodeViewportInstructions(instructions) {
        return this.parseViewportInstructions(decodeURIComponent(instructions));
    }
    buildScopedLink(scopeContext, href) {
        if (scopeContext) {
            href = `/${scopeContext}${this.separators.scope}${href}`;
        }
        return href;
    }
    shouldClearViewports(path) {
        const clearViewports = (path === this.separators.clear || path.startsWith(this.separators.clear + this.separators.add));
        const newPath = path.startsWith(this.separators.clear) ? path.slice(2) : path;
        return { clearViewports, newPath };
    }
    mergeViewportInstructions(instructions) {
        const merged = [];
        for (let instruction of instructions) {
            if (typeof instruction === 'string') {
                instruction = this.parseViewportInstruction(instruction);
            }
            const index = merged.findIndex(merge => merge.sameViewport(instruction));
            if (index >= 0) {
                merged.splice(index, 1, instruction);
            }
            else {
                merged.push(instruction);
            }
        }
        return merged;
    }
    flattenViewportInstructions(instructions) {
        const flat = [];
        for (const instruction of instructions) {
            flat.push(instruction);
            if (instruction.nextScopeInstructions) {
                flat.push(...this.flattenViewportInstructions(instruction.nextScopeInstructions));
            }
        }
        return flat;
    }
    cloneViewportInstructions(instructions, keepInstances = false, context = false) {
        const clones = [];
        for (const instruction of instructions) {
            const clone = this.createViewportInstruction(instruction.componentName, instruction.viewportName, instruction.typedParameters !== null ? instruction.typedParameters : void 0);
            if (keepInstances) {
                clone.setComponent(instruction.componentInstance ?? instruction.componentType ?? instruction.componentName);
                clone.setViewport(instruction.viewport ?? instruction.viewportName);
            }
            clone.needsViewportDescribed = instruction.needsViewportDescribed;
            clone.route = instruction.route;
            if (context) {
                clone.context = instruction.context;
            }
            clone.viewportScope = keepInstances ? instruction.viewportScope : null;
            clone.scope = keepInstances ? instruction.scope : null;
            if (instruction.nextScopeInstructions) {
                clone.nextScopeInstructions = this.cloneViewportInstructions(instruction.nextScopeInstructions, keepInstances, context);
            }
            clones.push(clone);
        }
        return clones;
    }
    // TODO: Deal with separators in data and complex types
    parseComponentParameters(parameters, uriComponent = false) {
        if (parameters === undefined || parameters === null || parameters.length === 0) {
            return [];
        }
        if (typeof parameters === 'string') {
            const list = [];
            const params = parameters.split(this.separators.parameterSeparator);
            for (const param of params) {
                let key;
                let value;
                [key, value] = param.split(this.separators.parameterKeySeparator);
                if (value === void 0) {
                    value = uriComponent ? decodeURIComponent(key) : key;
                    key = void 0;
                }
                else if (uriComponent) {
                    key = decodeURIComponent(key);
                    value = decodeURIComponent(value);
                }
                list.push({ key, value });
            }
            return list;
        }
        if (Array.isArray(parameters)) {
            return parameters.map(param => ({ key: void 0, value: param }));
        }
        const keys = Object.keys(parameters);
        keys.sort();
        return keys.map(key => ({ key, value: parameters[key] }));
    }
    // TODO: Deal with separators in data and complex types
    stringifyComponentParameters(parameters, uriComponent = false) {
        if (!Array.isArray(parameters) || parameters.length === 0) {
            return '';
        }
        const seps = this.separators;
        return parameters
            .map(param => {
            const key = param.key !== void 0 && uriComponent ? encodeURIComponent(param.key) : param.key;
            const value = uriComponent ? encodeURIComponent(param.value) : param.value;
            return key !== void 0 && key !== value ? key + seps.parameterKeySeparator + value : value;
        })
            .join(seps.parameterSeparator);
    }
    matchScope(instructions, scope) {
        const matching = [];
        matching.push(...instructions.filter(instruction => instruction.scope === scope));
        matching.push(...instructions
            .filter(instr => instr.scope !== scope)
            .map(instr => Array.isArray(instr.nextScopeInstructions) ? this.matchScope(instr.nextScopeInstructions, scope) : [])
            .flat());
        return matching;
    }
    matchChildren(instructions, active) {
        for (const instruction of instructions) {
            const matching = active.filter(instr => instr.sameComponent(instruction));
            if (matching.length === 0) {
                return false;
            }
            if (Array.isArray(instruction.nextScopeInstructions)
                && instruction.nextScopeInstructions.length > 0
                && this.matchChildren(instruction.nextScopeInstructions, matching.map(instr => Array.isArray(instr.nextScopeInstructions) ? instr.nextScopeInstructions : []).flat()) === false) {
                return false;
            }
        }
        return true;
    }
    parseViewportInstructionsWorker(instructions, grouped = false) {
        if (!instructions) {
            return { instructions: [], remaining: '' };
        }
        if (instructions.startsWith(this.separators.scopeStart)) {
            instructions = `${this.separators.scope}${instructions}`;
        }
        const viewportInstructions = [];
        let guard = 1000;
        while (instructions.length && guard) {
            guard--;
            if (instructions.startsWith(this.separators.scope)) {
                instructions = instructions.slice(this.separators.scope.length);
                const scopeStart = instructions.startsWith(this.separators.scopeStart);
                if (scopeStart) {
                    instructions = instructions.slice(this.separators.scopeStart.length);
                }
                const { instructions: found, remaining } = this.parseViewportInstructionsWorker(instructions, scopeStart);
                if (viewportInstructions.length) {
                    viewportInstructions[viewportInstructions.length - 1].nextScopeInstructions = found;
                }
                else {
                    viewportInstructions.push(...found);
                }
                instructions = remaining;
            }
            else if (instructions.startsWith(this.separators.scopeEnd)) {
                if (grouped) {
                    instructions = instructions.slice(this.separators.scopeEnd.length);
                }
                return { instructions: viewportInstructions, remaining: instructions };
            }
            else if (instructions.startsWith(this.separators.sibling) && !this.isAddViewportInstruction(instructions)) {
                if (!grouped) {
                    return { instructions: viewportInstructions, remaining: instructions };
                }
                instructions = instructions.slice(this.separators.sibling.length);
            }
            else {
                const { instruction: viewportInstruction, remaining } = this.parseAViewportInstruction(instructions);
                viewportInstructions.push(viewportInstruction);
                instructions = remaining;
            }
        }
        return { instructions: viewportInstructions, remaining: instructions };
    }
    findNextToken(instruction, tokens) {
        const matches = {};
        // Tokens can have length > 1
        for (const token of tokens) {
            const tokenPos = instruction.indexOf(token);
            if (tokenPos > -1) {
                matches[token] = instruction.indexOf(token);
            }
        }
        const pos = Math.min(...Object.values(matches));
        for (const token in matches) {
            if (matches[token] === pos) {
                return { token, pos };
            }
        }
        return { token: '', pos: -1 };
    }
    parseAViewportInstruction(instruction) {
        const seps = this.separators;
        const tokens = [seps.parameters, seps.viewport, seps.noScope, seps.scopeEnd, seps.scope, seps.sibling];
        let component = void 0;
        let parametersString = void 0;
        let viewport = void 0;
        let scope = true;
        let token;
        let pos;
        const specials = [seps.add, seps.clear];
        for (const special of specials) {
            if (instruction === special) {
                component = instruction;
                instruction = '';
                tokens.shift(); // parameters
                tokens.shift(); // viewport
                token = seps.viewport;
                break;
            }
        }
        if (component === void 0) {
            for (const special of specials) {
                if (instruction.startsWith(`${special}${seps.viewport}`)) {
                    component = special;
                    instruction = instruction.slice(`${special}${seps.viewport}`.length);
                    tokens.shift(); // parameters
                    tokens.shift(); // viewport
                    token = seps.viewport;
                    break;
                }
            }
        }
        if (component === void 0) {
            ({ token, pos } = this.findNextToken(instruction, tokens));
            component = pos !== -1 ? instruction.slice(0, pos) : instruction;
            instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';
            tokens.shift(); // parameters
            if (token === seps.parameters) {
                ({ token, pos } = this.findNextToken(instruction, [seps.parametersEnd]));
                parametersString = instruction.slice(0, pos);
                instruction = instruction.slice(pos + token.length);
                ({ token } = this.findNextToken(instruction, tokens));
                instruction = instruction.slice(token.length);
            }
            tokens.shift(); // viewport
        }
        if (token === seps.viewport) {
            ({ token, pos } = this.findNextToken(instruction, tokens));
            viewport = pos !== -1 ? instruction.slice(0, pos) : instruction;
            instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';
        }
        tokens.shift(); // noScope
        if (token === seps.noScope) {
            scope = false;
        }
        // Restore token that belongs to next instruction
        if (token === seps.scopeEnd || token === seps.scope || token === seps.sibling) {
            instruction = `${token}${instruction}`;
        }
        const viewportInstruction = this.createViewportInstruction(component, viewport, parametersString, scope);
        return { instruction: viewportInstruction, remaining: instruction };
    }
    stringifyAViewportInstruction(instruction, excludeViewport = false, excludeComponent = false) {
        if (typeof instruction === 'string') {
            return this.stringifyViewportInstruction(this.parseViewportInstruction(instruction), excludeViewport, excludeComponent);
        }
        else {
            let instructionString = !excludeComponent ? instruction.componentName : '';
            const specification = instruction.componentType ? instruction.componentType.parameters : null;
            const parameters = this.stringifyComponentParameters(instruction.toSortedParameters(specification));
            if (parameters.length > 0) {
                instructionString += !excludeComponent
                    ? `${this.separators.parameters}${parameters}${this.separators.parametersEnd}`
                    : parameters;
            }
            if (instruction.viewportName !== null && !excludeViewport) {
                instructionString += this.separators.viewport + instruction.viewportName;
            }
            if (!instruction.ownsScope) {
                instructionString += this.separators.noScope;
            }
            return instructionString || '';
        }
    }
}
exports.InstructionResolver = InstructionResolver;
//# sourceMappingURL=instruction-resolver.js.map