import { ViewportInstruction } from './viewport-instruction';
export class InstructionResolver {
    constructor() {
        this.separators = {
            viewport: '@',
            sibling: '+',
            scope: '/',
            noScope: '!',
            parameters: '(',
            parametersEnd: ')',
            parameter: '&',
            add: '+',
            clear: '-',
            action: '.',
        };
    }
    activate(options) {
        options = options || {};
        this.separators = { ...this.separators, ...options.separators };
    }
    get clearViewportInstruction() {
        return this.separators.clear;
    }
    parseViewportInstructions(instructions) {
        if (instructions === null || instructions === '') {
            return [];
        }
        if (instructions.startsWith('/')) {
            instructions = instructions.slice(1);
        }
        return instructions.split(this.separators.sibling).map((instruction) => this.parseViewportInstruction(instruction));
    }
    parseViewportInstruction(instruction) {
        const instructions = instruction.split(this.separators.scope).map((scopeInstruction) => this.parseAViewportInstruction(scopeInstruction));
        for (let i = 0; i < instructions.length - 1; i++) {
            instructions[i].nextScopeInstruction = instructions[i + 1];
        }
        return instructions[0];
    }
    stringifyViewportInstructions(instructions) {
        return instructions.map((instruction) => this.stringifyViewportInstruction(instruction)).join(this.separators.sibling);
    }
    stringifyViewportInstruction(instruction, excludeViewport = false) {
        if (typeof instruction === 'string') {
            return this.stringifyAViewportInstruction(instruction, excludeViewport);
        }
        else {
            const instructions = [instruction];
            while (instruction = instruction.nextScopeInstruction) {
                instructions.push(instruction);
            }
            return instructions.map((scopeInstruction) => this.stringifyAViewportInstruction(scopeInstruction, excludeViewport)).join(this.separators.scope);
        }
    }
    parseScopedViewportInstruction(instruction) {
        return instruction.split(this.separators.scope).map((scopeInstruction) => this.parseViewportInstruction(scopeInstruction));
    }
    stringifyScopedViewportInstruction(instructions) {
        if (!Array.isArray(instructions)) {
            return this.stringifyScopedViewportInstruction([instructions]);
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
        return { clear: clearViewports, newPath };
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
    removeStateDuplicates(states) {
        let sorted = states.slice().sort((a, b) => b.split(this.separators.scope).length - a.split(this.separators.scope).length);
        sorted = sorted.map((value) => `${this.separators.scope}${value}${this.separators.scope}`);
        let unique = [];
        if (sorted.length) {
            unique.push(sorted.shift());
            while (sorted.length) {
                const state = sorted.shift();
                if (state && unique.every(value => {
                    return value.indexOf(state) === -1;
                })) {
                    unique.push(state);
                }
            }
        }
        unique = unique.map((value) => value.substring(1, value.length - 1));
        unique.sort((a, b) => a.split(this.separators.scope).length - b.split(this.separators.scope).length);
        return unique;
    }
    flattenViewportInstructions(instructions) {
        const flat = [];
        for (const instruction of instructions) {
            flat.push(instruction);
            if (instruction.nextScopeInstruction) {
                flat.push(...this.flattenViewportInstructions([instruction.nextScopeInstruction]));
            }
        }
        return flat;
    }
    stateStringsToString(stateStrings, clear = false) {
        const strings = stateStrings.slice();
        if (clear) {
            strings.unshift(this.clearViewportInstruction);
        }
        return strings.join(this.separators.sibling);
    }
    parseAViewportInstruction(instruction) {
        let scope = true;
        // No scope is always at the end, regardless of anything else
        if (instruction.endsWith(this.separators.noScope)) {
            scope = false;
            instruction = instruction.slice(0, -this.separators.noScope.length);
        }
        const [componentPart, viewport] = instruction.split(this.separators.viewport);
        const [component, ...parameters] = componentPart.split(this.separators.parameters);
        let parametersString = parameters.length ? parameters.join(this.separators.parameters) : undefined;
        // The parameter separator can be either a standalone character (such as / or =) or a pair of enclosing characters
        // (such as ()). The separating character is consumed but the end character is not, so we still need to remove that.
        if (this.separators.parametersEnd.length && parametersString && parametersString.endsWith(this.separators.parametersEnd)) {
            parametersString = parametersString.slice(0, -this.separators.parametersEnd.length);
        }
        return new ViewportInstruction(component, viewport, parametersString, scope);
    }
    stringifyAViewportInstruction(instruction, excludeViewport = false) {
        if (typeof instruction === 'string') {
            return this.stringifyViewportInstruction(this.parseViewportInstruction(instruction), excludeViewport);
        }
        else {
            let instructionString = instruction.componentName;
            if (instruction.parametersString) {
                // TODO: Review parameters in ViewportInstruction
                instructionString += this.separators.parameters + instruction.parametersString + this.separators.parametersEnd;
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
//# sourceMappingURL=instruction-resolver.js.map