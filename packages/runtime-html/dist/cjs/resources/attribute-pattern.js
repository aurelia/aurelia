"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtPrefixedTriggerAttributePattern = exports.ColonPrefixedBindAttributePattern = exports.RefAttributePattern = exports.DotSeparatedAttributePattern = exports.AttributePattern = exports.AttributePatternResourceDefinition = exports.attributePattern = exports.AttributeParser = exports.IAttributeParser = exports.IAttributePattern = exports.AttrSyntax = exports.SyntaxInterpreter = exports.ISyntaxInterpreter = exports.SegmentTypes = exports.SymbolSegment = exports.DynamicSegment = exports.StaticSegment = exports.State = exports.Interpretation = exports.CharSpec = void 0;
const kernel_1 = require("@aurelia/kernel");
/** @internal */
class CharSpec {
    constructor(chars, repeat, isSymbol, isInverted) {
        this.chars = chars;
        this.repeat = repeat;
        this.isSymbol = isSymbol;
        this.isInverted = isInverted;
        if (isInverted) {
            switch (chars.length) {
                case 0:
                    this.has = this.hasOfNoneInverse;
                    break;
                case 1:
                    this.has = this.hasOfSingleInverse;
                    break;
                default:
                    this.has = this.hasOfMultipleInverse;
            }
        }
        else {
            switch (chars.length) {
                case 0:
                    this.has = this.hasOfNone;
                    break;
                case 1:
                    this.has = this.hasOfSingle;
                    break;
                default:
                    this.has = this.hasOfMultiple;
            }
        }
    }
    equals(other) {
        return this.chars === other.chars
            && this.repeat === other.repeat
            && this.isSymbol === other.isSymbol
            && this.isInverted === other.isInverted;
    }
    hasOfMultiple(char) {
        return this.chars.includes(char);
    }
    hasOfSingle(char) {
        return this.chars === char;
    }
    hasOfNone(char) {
        return false;
    }
    hasOfMultipleInverse(char) {
        return !this.chars.includes(char);
    }
    hasOfSingleInverse(char) {
        return this.chars !== char;
    }
    hasOfNoneInverse(char) {
        return true;
    }
}
exports.CharSpec = CharSpec;
class Interpretation {
    constructor() {
        this.parts = kernel_1.emptyArray;
        this._pattern = '';
        this.currentRecord = {};
        this.partsRecord = {};
    }
    get pattern() {
        const value = this._pattern;
        if (value === '') {
            return null;
        }
        else {
            return value;
        }
    }
    set pattern(value) {
        if (value == null) {
            this._pattern = '';
            this.parts = kernel_1.emptyArray;
        }
        else {
            this._pattern = value;
            this.parts = this.partsRecord[value];
        }
    }
    append(pattern, ch) {
        const { currentRecord } = this;
        if (currentRecord[pattern] === undefined) {
            currentRecord[pattern] = ch;
        }
        else {
            currentRecord[pattern] += ch;
        }
    }
    next(pattern) {
        const { currentRecord } = this;
        if (currentRecord[pattern] !== undefined) {
            const { partsRecord } = this;
            if (partsRecord[pattern] === undefined) {
                partsRecord[pattern] = [currentRecord[pattern]];
            }
            else {
                partsRecord[pattern].push(currentRecord[pattern]);
            }
            currentRecord[pattern] = undefined;
        }
    }
}
exports.Interpretation = Interpretation;
/** @internal */
class State {
    constructor(charSpec, ...patterns) {
        this.charSpec = charSpec;
        this.nextStates = [];
        this.types = null;
        this.isEndpoint = false;
        this.patterns = patterns;
    }
    get pattern() {
        return this.isEndpoint ? this.patterns[0] : null;
    }
    findChild(charSpec) {
        const nextStates = this.nextStates;
        const len = nextStates.length;
        let child = null;
        for (let i = 0; i < len; ++i) {
            child = nextStates[i];
            if (charSpec.equals(child.charSpec)) {
                return child;
            }
        }
        return null;
    }
    append(charSpec, pattern) {
        const { patterns } = this;
        if (!patterns.includes(pattern)) {
            patterns.push(pattern);
        }
        let state = this.findChild(charSpec);
        if (state == null) {
            state = new State(charSpec, pattern);
            this.nextStates.push(state);
            if (charSpec.repeat) {
                state.nextStates.push(state);
            }
        }
        return state;
    }
    findMatches(ch, interpretation) {
        // TODO: reuse preallocated arrays
        const results = [];
        const nextStates = this.nextStates;
        const len = nextStates.length;
        let childLen = 0;
        let child = null;
        let i = 0;
        let j = 0;
        for (; i < len; ++i) {
            child = nextStates[i];
            if (child.charSpec.has(ch)) {
                results.push(child);
                childLen = child.patterns.length;
                j = 0;
                if (child.charSpec.isSymbol) {
                    for (; j < childLen; ++j) {
                        interpretation.next(child.patterns[j]);
                    }
                }
                else {
                    for (; j < childLen; ++j) {
                        interpretation.append(child.patterns[j], ch);
                    }
                }
            }
        }
        return results;
    }
}
exports.State = State;
/** @internal */
class StaticSegment {
    constructor(text) {
        this.text = text;
        const len = this.len = text.length;
        const specs = this.specs = [];
        for (let i = 0; i < len; ++i) {
            specs.push(new CharSpec(text[i], false, false, false));
        }
    }
    eachChar(callback) {
        const { len, specs } = this;
        for (let i = 0; i < len; ++i) {
            callback(specs[i]);
        }
    }
}
exports.StaticSegment = StaticSegment;
/** @internal */
class DynamicSegment {
    constructor(symbols) {
        this.text = 'PART';
        this.spec = new CharSpec(symbols, true, false, true);
    }
    eachChar(callback) {
        callback(this.spec);
    }
}
exports.DynamicSegment = DynamicSegment;
/** @internal */
class SymbolSegment {
    constructor(text) {
        this.text = text;
        this.spec = new CharSpec(text, false, true, false);
    }
    eachChar(callback) {
        callback(this.spec);
    }
}
exports.SymbolSegment = SymbolSegment;
/** @internal */
class SegmentTypes {
    constructor() {
        this.statics = 0;
        this.dynamics = 0;
        this.symbols = 0;
    }
}
exports.SegmentTypes = SegmentTypes;
exports.ISyntaxInterpreter = kernel_1.DI.createInterface('ISyntaxInterpreter', x => x.singleton(SyntaxInterpreter));
class SyntaxInterpreter {
    constructor() {
        this.rootState = new State(null);
        this.initialStates = [this.rootState];
    }
    add(defOrDefs) {
        let i = 0;
        if (Array.isArray(defOrDefs)) {
            const ii = defOrDefs.length;
            for (; i < ii; ++i) {
                this.add(defOrDefs[i]);
            }
            return;
        }
        let currentState = this.rootState;
        const def = defOrDefs;
        const pattern = def.pattern;
        const types = new SegmentTypes();
        const segments = this.parse(def, types);
        const len = segments.length;
        const callback = (ch) => {
            currentState = currentState.append(ch, pattern);
        };
        for (i = 0; i < len; ++i) {
            segments[i].eachChar(callback);
        }
        currentState.types = types;
        currentState.isEndpoint = true;
    }
    interpret(name) {
        const interpretation = new Interpretation();
        let states = this.initialStates;
        const len = name.length;
        for (let i = 0; i < len; ++i) {
            states = this.getNextStates(states, name.charAt(i), interpretation);
            if (states.length === 0) {
                break;
            }
        }
        states.sort((a, b) => {
            if (a.isEndpoint) {
                if (!b.isEndpoint) {
                    return -1;
                }
            }
            else if (b.isEndpoint) {
                return 1;
            }
            else {
                return 0;
            }
            const aTypes = a.types;
            const bTypes = b.types;
            if (aTypes.statics !== bTypes.statics) {
                return bTypes.statics - aTypes.statics;
            }
            if (aTypes.dynamics !== bTypes.dynamics) {
                return bTypes.dynamics - aTypes.dynamics;
            }
            if (aTypes.symbols !== bTypes.symbols) {
                return bTypes.symbols - aTypes.symbols;
            }
            return 0;
        });
        if (states.length > 0) {
            const state = states[0];
            if (!state.charSpec.isSymbol) {
                interpretation.next(state.pattern);
            }
            interpretation.pattern = state.pattern;
        }
        return interpretation;
    }
    getNextStates(states, ch, interpretation) {
        // TODO: reuse preallocated arrays
        const nextStates = [];
        let state = null;
        const len = states.length;
        for (let i = 0; i < len; ++i) {
            state = states[i];
            nextStates.push(...state.findMatches(ch, interpretation));
        }
        return nextStates;
    }
    parse(def, types) {
        const result = [];
        const pattern = def.pattern;
        const len = pattern.length;
        let i = 0;
        let start = 0;
        let c = '';
        while (i < len) {
            c = pattern.charAt(i);
            if (!def.symbols.includes(c)) {
                if (i === start) {
                    if (c === 'P' && pattern.slice(i, i + 4) === 'PART') {
                        start = i = (i + 4);
                        result.push(new DynamicSegment(def.symbols));
                        ++types.dynamics;
                    }
                    else {
                        ++i;
                    }
                }
                else {
                    ++i;
                }
            }
            else if (i !== start) {
                result.push(new StaticSegment(pattern.slice(start, i)));
                ++types.statics;
                start = i;
            }
            else {
                result.push(new SymbolSegment(pattern.slice(start, i + 1)));
                ++types.symbols;
                start = ++i;
            }
        }
        if (start !== i) {
            result.push(new StaticSegment(pattern.slice(start, i)));
            ++types.statics;
        }
        return result;
    }
}
exports.SyntaxInterpreter = SyntaxInterpreter;
class AttrSyntax {
    constructor(rawName, rawValue, target, command) {
        this.rawName = rawName;
        this.rawValue = rawValue;
        this.target = target;
        this.command = command;
    }
}
exports.AttrSyntax = AttrSyntax;
exports.IAttributePattern = kernel_1.DI.createInterface('IAttributePattern');
exports.IAttributeParser = kernel_1.DI.createInterface('IAttributeParser', x => x.singleton(AttributeParser));
let AttributeParser = class AttributeParser {
    constructor(interpreter, attrPatterns) {
        this.interpreter = interpreter;
        this.cache = {};
        const patterns = this.patterns = {};
        attrPatterns.forEach(attrPattern => {
            const defs = exports.AttributePattern.getPatternDefinitions(attrPattern.constructor);
            interpreter.add(defs);
            defs.forEach(def => {
                patterns[def.pattern] = attrPattern;
            });
        });
    }
    parse(name, value) {
        let interpretation = this.cache[name];
        if (interpretation == null) {
            interpretation = this.cache[name] = this.interpreter.interpret(name);
        }
        const pattern = interpretation.pattern;
        if (pattern == null) {
            return new AttrSyntax(name, value, name, null);
        }
        else {
            return this.patterns[pattern][pattern](name, value, interpretation.parts);
        }
    }
};
AttributeParser = __decorate([
    __param(0, exports.ISyntaxInterpreter),
    __param(1, kernel_1.all(exports.IAttributePattern))
], AttributeParser);
exports.AttributeParser = AttributeParser;
function attributePattern(...patternDefs) {
    return function decorator(target) {
        return exports.AttributePattern.define(patternDefs, target);
    };
}
exports.attributePattern = attributePattern;
class AttributePatternResourceDefinition {
    constructor(Type) {
        this.Type = Type;
        this.name = (void 0);
    }
    register(container) {
        kernel_1.Registration.singleton(exports.IAttributePattern, this.Type).register(container);
    }
}
exports.AttributePatternResourceDefinition = AttributePatternResourceDefinition;
exports.AttributePattern = Object.freeze({
    name: kernel_1.Protocol.resource.keyFor('attribute-pattern'),
    definitionAnnotationKey: 'attribute-pattern-definitions',
    define(patternDefs, Type) {
        const definition = new AttributePatternResourceDefinition(Type);
        const { name, definitionAnnotationKey } = exports.AttributePattern;
        kernel_1.Metadata.define(name, definition, Type);
        kernel_1.Protocol.resource.appendTo(Type, name);
        kernel_1.Protocol.annotation.set(Type, definitionAnnotationKey, patternDefs);
        kernel_1.Protocol.annotation.appendTo(Type, definitionAnnotationKey);
        return Type;
    },
    getPatternDefinitions(Type) {
        return kernel_1.Protocol.annotation.get(Type, exports.AttributePattern.definitionAnnotationKey);
    }
});
let DotSeparatedAttributePattern = class DotSeparatedAttributePattern {
    'PART.PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
    }
    'PART.PART.PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], parts[2]);
    }
};
DotSeparatedAttributePattern = __decorate([
    attributePattern({ pattern: 'PART.PART', symbols: '.' }, { pattern: 'PART.PART.PART', symbols: '.' })
], DotSeparatedAttributePattern);
exports.DotSeparatedAttributePattern = DotSeparatedAttributePattern;
let RefAttributePattern = class RefAttributePattern {
    'ref'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, 'element', 'ref');
    }
    'PART.ref'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'ref');
    }
};
RefAttributePattern = __decorate([
    attributePattern({ pattern: 'ref', symbols: '' }, { pattern: 'PART.ref', symbols: '.' })
], RefAttributePattern);
exports.RefAttributePattern = RefAttributePattern;
let ColonPrefixedBindAttributePattern = class ColonPrefixedBindAttributePattern {
    ':PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
    }
};
ColonPrefixedBindAttributePattern = __decorate([
    attributePattern({ pattern: ':PART', symbols: ':' })
], ColonPrefixedBindAttributePattern);
exports.ColonPrefixedBindAttributePattern = ColonPrefixedBindAttributePattern;
let AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
    '@PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
    }
};
AtPrefixedTriggerAttributePattern = __decorate([
    attributePattern({ pattern: '@PART', symbols: '@' })
], AtPrefixedTriggerAttributePattern);
exports.AtPrefixedTriggerAttributePattern = AtPrefixedTriggerAttributePattern;
//# sourceMappingURL=attribute-pattern.js.map