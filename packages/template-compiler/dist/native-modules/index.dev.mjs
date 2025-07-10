import { DI, Registration, getResourceKeyFor, registrableMetadataKey, emptyArray, resolve, IContainer, isString, firstDefined, mergeArrays, Protocol, resourceBaseName, resource, camelCase, IPlatform, createImplementationRegister, noop, toArray, pascalCase, ILogger, allResources } from '../../../kernel/dist/native-modules/index.mjs';
import { Metadata } from '../../../metadata/dist/native-modules/index.mjs';
import { PrimitiveLiteralExpression, IExpressionParser } from '../../../expression-parser/dist/native-modules/index.mjs';

/** @internal */ const tcCreateInterface = DI.createInterface;
/** @internal */ const tcObjectFreeze = Object.freeze;
/** @internal */ const { aliasTo: aliasRegistration, singleton: singletonRegistration } = Registration;
/** ExpressionType */
/** @internal */ const etInterpolation = 'Interpolation';
/** @internal */ const etIsFunction = 'IsFunction';
/** @internal */ const etIsProperty = 'IsProperty';
/** @internal */ const definitionTypeElement = 'custom-element';

// Note: the oneTime binding now has a non-zero value for 2 reasons:
//  - plays nicer with bitwise operations (more consistent code, more explicit settings)
//  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
//
// Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
// This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
/**
 * Mode of a binding to operate
 * - 1 / one time - bindings should only update the target once
 * - 2 / to view - bindings should update the target and observe the source for changes to update again
 * - 3 / from view - bindings should update the source and observe the target for changes to update again
 * - 6 / two way - bindings should observe both target and source for changes to update the other side
 * - 0 / default - undecided mode, bindings, depends on the circumstance, may decide what to do accordingly
 */
const BindingMode = /*@__PURE__*/ tcObjectFreeze({
    /**
     * Unspecified mode, bindings may act differently with this mode
     */
    default: 0,
    oneTime: 1,
    toView: 2,
    fromView: 4,
    twoWay: 6,
});

/**
 * An interface describing the template compiler used by Aurelia applicaitons
 */
const ITemplateCompiler = /*@__PURE__*/ tcCreateInterface('ITemplateCompiler');

/**
 * An interface describing the API for mapping attributes to properties
 */
const IAttrMapper = /*@__PURE__*/ tcCreateInterface('IAttrMapper');

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */
/** @internal */
const createMappedError = (code, ...details) => {
        const paddedCode = String(code).padStart(4, '0');
        const message = getMessageByCode(code, ...details);
        const link = `https://docs.aurelia.io/developer-guides/error-messages/0088-to-0723/aur${paddedCode}`;
        return new Error(`AUR${paddedCode}: ${message}\n\nFor more information, see: ${link}`);
    }
    ;

const errorsMap = {
    [88 /* ErrorNames.attribute_pattern_already_initialized */]: 'AttributeParser is already initialized; cannot add patterns after initialization.',
    [89 /* ErrorNames.attribute_pattern_duplicate */]: 'Attribute pattern "{{0}}" has already been registered.',
    [99 /* ErrorNames.method_not_implemented */]: 'Method {{0}} not implemented',
    [157 /* ErrorNames.binding_command_existed */]: `Binding command {{0}} has already been registered.`,
    [701 /* ErrorNames.compiler_root_is_local */]: `Template compilation error in element "{{0:name}}": the root <template> cannot be a local element template.`,
    [702 /* ErrorNames.compiler_invalid_surrogate_attr */]: `Template compilation error: attribute "{{0}}" is invalid on element surrogate.`,
    [703 /* ErrorNames.compiler_no_tc_on_surrogate */]: `Template compilation error: template controller "{{0}}" is invalid on element surrogate.`,
    [704 /* ErrorNames.compiler_invalid_let_command */]: `Template compilation error: Invalid command "{{0:.command}}" for <let>. Only to-view/bind supported.`,
    [706 /* ErrorNames.compiler_au_slot_on_non_element */]: `Template compilation error: detected projection with [au-slot="{{0}}"] attempted on a non custom element {{1}}.`,
    [707 /* ErrorNames.compiler_binding_to_non_bindable */]: `Template compilation error: creating binding to non-bindable property {{0}} on {{1}}.`,
    [708 /* ErrorNames.compiler_template_only_local_template */]: `Template compilation error: the custom element "{{0}}" does not have any content other than local template(s).`,
    [709 /* ErrorNames.compiler_local_el_not_under_root */]: `Template compilation error: local element template needs to be defined directly under root of element "{{0}}".`,
    [710 /* ErrorNames.compiler_local_el_bindable_not_under_root */]: `Template compilation error: bindable properties of local element "{{0}}" template needs to be defined directly under <template>.`,
    [711 /* ErrorNames.compiler_local_el_bindable_name_missing */]: `Template compilation error: the attribute 'property' is missing in {{0:outerHTML}} in local element "{{1}}"`,
    [712 /* ErrorNames.compiler_local_el_bindable_duplicate */]: `Template compilation error: Bindable property and attribute needs to be unique; found property: {{0}}, attribute: {{1}}`,
    [713 /* ErrorNames.compiler_unknown_binding_command */]: `Template compilation error: unknown binding command: "{{0}}".{{0:bindingCommandHelp}}`,
    [714 /* ErrorNames.compiler_primary_already_existed */]: `Template compilation error: primary already exists on element/attribute "{{0}}"`,
    [715 /* ErrorNames.compiler_local_name_empty */]: `Template compilation error: the value of "as-custom-element" attribute cannot be empty for local element in element "{{0}}"`,
    [716 /* ErrorNames.compiler_duplicate_local_name */]: `Template compilation error: duplicate definition of the local template named "{{0}} in element {{1}}"`,
    [717 /* ErrorNames.compiler_slot_without_shadowdom */]: `Template compilation error: detected a usage of "<slot>" element without specifying shadow DOM options in element: {{0}}`,
    [718 /* ErrorNames.compiler_no_spread_tc */]: `Spreading template controller "{{0}}" is not supported.`,
    [719 /* ErrorNames.compiler_attr_mapper_duplicate_mapping */]: `Attribute {{0}} has been already registered for {{1:element}}`,
    [720 /* ErrorNames.compiler_no_reserved_spread_syntax */]: `Spreading syntax "...xxx" is reserved. Encountered "...{{0}}"`,
    [721 /* ErrorNames.compiler_no_reserved_$bindable */]: `Usage of $bindables is only allowed on custom element. Encountered: <{{0}} {{1}}="{{2}}">`,
    [722 /* ErrorNames.compiler_no_dom_api */]: 'Invalid platform object provided to the compilation, no DOM API found.',
    [723 /* ErrorNames.compiler_invalid_class_binding_syntax */]: `Template compilation error: Invalid comma-separated class binding syntax in {{0}}. It resulted in no valid class names after parsing.`,
    [9998 /* ErrorNames.no_spread_template_controller */]: 'Spread binding does not support spreading custom attributes/template controllers. Did you build the spread instruction manually?',
};
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(cooked);
        while (matches != null) {
            const method = matches[1]?.slice(1);
            let value = details[i];
            if (value != null) {
                switch (method) {
                    case 'nodeName':
                        value = value.nodeName.toLowerCase();
                        break;
                    case 'name':
                        value = value.name;
                        break;
                    case 'typeof':
                        value = typeof value;
                        break;
                    case 'ctor':
                        value = value.constructor.name;
                        break;
                    case 'controller':
                        value = value.controller.name;
                        break;
                    case 'target@property':
                        value = `${value.target}@${value.targetProperty}`;
                        break;
                    case 'toString':
                        value = Object.prototype.toString.call(value);
                        break;
                    case 'join(!=)':
                        value = value.join('!=');
                        break;
                    case 'bindingCommandHelp':
                        value = getBindingCommandHelp(value);
                        break;
                    case 'element':
                        value = value === '*' ? 'all elements' : `<${value} />`;
                        break;
                    default: {
                        // property access
                        if (method?.startsWith('.')) {
                            value = String(value[method.slice(1)]);
                        }
                        else {
                            value = String(value);
                        }
                    }
                }
            }
            cooked = cooked.slice(0, matches.index) + value + cooked.slice(regex.lastIndex);
            matches = regex.exec(cooked);
        }
    }
    return cooked;
};
function getBindingCommandHelp(name) {
    switch (name) {
        case 'delegate':
            return `\nThe ".delegate" binding command has been removed in v2.`
                + ` Binding command ".trigger" should be used instead.`
                + ` If you are migrating v1 application, install compat package`
                + ` to add back the ".delegate" binding command for ease of migration.`;
        case 'call':
            return `\nThe ".call" binding command has been removed in v2.`
                + ` If you want to pass a callback that preserves the context of the function call,`
                + ` you can use lambda instead. Refer to lambda expression doc for more details.`;
        default:
            return '';
    }
}

var _a, _b, _c, _d, _e;
class CharSpec {
    constructor(chars, repeat, isSymbol, isInverted) {
        this.chars = chars;
        this.repeat = repeat;
        this.isSymbol = isSymbol;
        this.isInverted = isInverted;
        if (isInverted) {
            switch (chars.length) {
                case 0:
                    this.has = this._hasOfNoneInverse;
                    break;
                case 1:
                    this.has = this._hasOfSingleInverse;
                    break;
                default:
                    this.has = this._hasOfMultipleInverse;
            }
        }
        else {
            switch (chars.length) {
                case 0:
                    this.has = this._hasOfNone;
                    break;
                case 1:
                    this.has = this._hasOfSingle;
                    break;
                default:
                    this.has = this._hasOfMultiple;
            }
        }
    }
    equals(other) {
        return this.chars === other.chars
            && this.repeat === other.repeat
            && this.isSymbol === other.isSymbol
            && this.isInverted === other.isInverted;
    }
    /** @internal */
    _hasOfMultiple(char) {
        return this.chars.includes(char);
    }
    /** @internal */
    _hasOfSingle(char) {
        return this.chars === char;
    }
    /** @internal */
    _hasOfNone(_char) {
        return false;
    }
    /** @internal */
    _hasOfMultipleInverse(char) {
        return !this.chars.includes(char);
    }
    /** @internal */
    _hasOfSingleInverse(char) {
        return this.chars !== char;
    }
    /** @internal */
    _hasOfNoneInverse(_char) {
        return true;
    }
}
class Interpretation {
    constructor() {
        this.parts = emptyArray;
        /** @internal */
        this._pattern = '';
        /** @internal */
        this._currentRecord = {};
        /** @internal */
        this._partsRecord = {};
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
            this.parts = emptyArray;
        }
        else {
            this._pattern = value;
            this.parts = this._partsRecord[value];
        }
    }
    append(pattern, ch) {
        const currentRecord = this._currentRecord;
        if (currentRecord[pattern] === undefined) {
            currentRecord[pattern] = ch;
        }
        else {
            currentRecord[pattern] += ch;
        }
    }
    next(pattern) {
        const currentRecord = this._currentRecord;
        let partsRecord;
        if (currentRecord[pattern] !== undefined) {
            partsRecord = this._partsRecord;
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
class AttrParsingState {
    get _pattern() {
        return this._isEndpoint ? this._patterns[0] : null;
    }
    constructor(charSpec, ...patterns) {
        this.charSpec = charSpec;
        this._nextStates = [];
        this._types = null;
        this._isEndpoint = false;
        this._patterns = patterns;
    }
    findChild(charSpec) {
        const nextStates = this._nextStates;
        const len = nextStates.length;
        let child = null;
        let i = 0;
        for (; i < len; ++i) {
            child = nextStates[i];
            if (charSpec.equals(child.charSpec)) {
                return child;
            }
        }
        return null;
    }
    append(charSpec, pattern) {
        const patterns = this._patterns;
        if (!patterns.includes(pattern)) {
            patterns.push(pattern);
        }
        let state = this.findChild(charSpec);
        if (state == null) {
            state = new AttrParsingState(charSpec, pattern);
            this._nextStates.push(state);
            if (charSpec.repeat) {
                state._nextStates.push(state);
            }
        }
        return state;
    }
    findMatches(ch, interpretation) {
        // TODO: reuse preallocated arrays
        const results = [];
        const nextStates = this._nextStates;
        const len = nextStates.length;
        let childLen = 0;
        let child = null;
        let i = 0;
        let j = 0;
        for (; i < len; ++i) {
            child = nextStates[i];
            if (child.charSpec.has(ch)) {
                results.push(child);
                childLen = child._patterns.length;
                j = 0;
                if (child.charSpec.isSymbol) {
                    for (; j < childLen; ++j) {
                        interpretation.next(child._patterns[j]);
                    }
                }
                else {
                    for (; j < childLen; ++j) {
                        interpretation.append(child._patterns[j], ch);
                    }
                }
            }
        }
        return results;
    }
}
/** @internal */
class StaticSegment {
    constructor(text) {
        this.text = text;
        const len = this._len = text.length;
        const specs = this._specs = [];
        let i = 0;
        for (; len > i; ++i) {
            specs.push(new CharSpec(text[i], false, false, false));
        }
    }
    eachChar(callback) {
        const len = this._len;
        const specs = this._specs;
        let i = 0;
        for (; len > i; ++i) {
            callback(specs[i]);
        }
    }
}
/** @internal */
class DynamicSegment {
    constructor(symbols) {
        this.text = 'PART';
        this._spec = new CharSpec(symbols, true, false, true);
    }
    eachChar(callback) {
        callback(this._spec);
    }
}
/** @internal */
class SymbolSegment {
    constructor(text) {
        this.text = text;
        this._spec = new CharSpec(text, false, true, false);
    }
    eachChar(callback) {
        callback(this._spec);
    }
}
class SegmentTypes {
    constructor() {
        this.statics = 0;
        this.dynamics = 0;
        this.symbols = 0;
    }
}
const ISyntaxInterpreter = /*@__PURE__*/ tcCreateInterface('ISyntaxInterpreter', x => x.singleton(SyntaxInterpreter));
/**
 * The default implementation of @see {ISyntaxInterpreter}.
 */
class SyntaxInterpreter {
    constructor() {
        /** @internal */
        this._rootState = new AttrParsingState(null);
        /** @internal */
        this._initialStates = [this._rootState];
    }
    // todo: this only works if this method is ever called only once
    add(defs) {
        defs = defs.slice(0).sort((d1, d2) => d1.pattern > d2.pattern ? 1 : -1);
        const ii = defs.length;
        let currentState;
        let def;
        let pattern;
        let types;
        let segments;
        let len;
        let charSpecCb;
        let i = 0;
        let j;
        while (ii > i) {
            currentState = this._rootState;
            def = defs[i];
            pattern = def.pattern;
            types = new SegmentTypes();
            segments = this._parse(def, types);
            len = segments.length;
            charSpecCb = (ch) => currentState = currentState.append(ch, pattern);
            for (j = 0; len > j; ++j) {
                segments[j].eachChar(charSpecCb);
            }
            currentState._types = types;
            currentState._isEndpoint = true;
            ++i;
        }
    }
    interpret(name) {
        const interpretation = new Interpretation();
        const len = name.length;
        let states = this._initialStates;
        let i = 0;
        let state;
        for (; i < len; ++i) {
            states = this._getNextStates(states, name.charAt(i), interpretation);
            if (states.length === 0) {
                break;
            }
        }
        states = states.filter(isEndpoint);
        if (states.length > 0) {
            states.sort(sortEndpoint);
            state = states[0];
            if (!state.charSpec.isSymbol) {
                interpretation.next(state._pattern);
            }
            interpretation.pattern = state._pattern;
        }
        return interpretation;
    }
    /** @internal */
    _getNextStates(states, ch, interpretation) {
        // TODO: reuse preallocated arrays
        const nextStates = [];
        let state = null;
        const len = states.length;
        let i = 0;
        for (; i < len; ++i) {
            state = states[i];
            nextStates.push(...state.findMatches(ch, interpretation));
        }
        return nextStates;
    }
    /** @internal */
    _parse(def, types) {
        const result = [];
        const pattern = def.pattern;
        const len = pattern.length;
        const symbols = def.symbols;
        let i = 0;
        let start = 0;
        let c = '';
        while (i < len) {
            c = pattern.charAt(i);
            if (symbols.length === 0 || !symbols.includes(c)) {
                if (i === start) {
                    if (c === 'P' && pattern.slice(i, i + 4) === 'PART') {
                        start = i = (i + 4);
                        result.push(new DynamicSegment(symbols));
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
function isEndpoint(a) {
    return a._isEndpoint;
}
function sortEndpoint(a, b) {
    // both a and b are endpoints
    // compare them based on the number of static, then dynamic & symbol fragments
    const aTypes = a._types;
    const bTypes = b._types;
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
}
class AttrSyntax {
    constructor(rawName, rawValue, target, command, parts = null) {
        this.rawName = rawName;
        this.rawValue = rawValue;
        this.target = target;
        this.command = command;
        this.parts = parts;
    }
}
const IAttributePattern = /*@__PURE__*/ tcCreateInterface('IAttributePattern');
const IAttributeParser = /*@__PURE__*/ tcCreateInterface('IAttributeParser', x => x.singleton(AttributeParser));
/**
 * The default implementation of the @see IAttributeParser interface
 */
class AttributeParser {
    constructor() {
        /** @internal */
        this._cache = {};
        /**
         * A 2 level record with the same key on both levels.
         * Just a trick to maintain `this` + have simple lookup + support multi patterns per class definition
         *
         * @internal
         */
        this._patterns = {};
        /** @internal */
        this._initialized = false;
        /** @internal */
        this._allDefinitions = [];
        this._interpreter = resolve(ISyntaxInterpreter);
        this._container = resolve(IContainer);
    }
    registerPattern(patterns, Type) {
        if (this._initialized)
            throw createMappedError(88 /* ErrorNames.attribute_pattern_already_initialized */);
        const $patterns = this._patterns;
        for (const { pattern } of patterns) {
            if ($patterns[pattern] != null)
                throw createMappedError(89 /* ErrorNames.attribute_pattern_duplicate */, pattern);
            $patterns[pattern] = { patternType: Type };
        }
        this._allDefinitions.push(...patterns);
    }
    /** @internal */
    _initialize() {
        this._interpreter.add(this._allDefinitions);
        const _container = this._container;
        for (const [, value] of Object.entries(this._patterns)) {
            value.pattern = _container.get(value.patternType);
        }
    }
    parse(name, value) {
        // Optimization Idea: move the initialization to an AppTask
        if (!this._initialized) {
            this._initialize();
            this._initialized = true;
        }
        let interpretation = this._cache[name];
        if (interpretation == null) {
            interpretation = this._cache[name] = this._interpreter.interpret(name);
        }
        const pattern = interpretation.pattern;
        if (pattern == null) {
            return new AttrSyntax(name, value, name, null, null);
        }
        else {
            return this._patterns[pattern].pattern[pattern](name, value, interpretation.parts);
        }
    }
}
/**
 * Decorator to be used on attr pattern classes
 */
function attributePattern(...patternDefs) {
    return function decorator(target, context) {
        const registrable = AttributePattern.create(patternDefs, target);
        // Decorators are by nature static, so we need to store the metadata on the class itself, assuming only one set of patterns per class.
        context.metadata[registrableMetadataKey] = registrable;
        return target;
    };
}
const AttributePattern = /*@__PURE__*/ tcObjectFreeze({
    name: getResourceKeyFor('attribute-pattern'),
    create(patternDefs, Type) {
        return {
            register(container) {
                container.get(IAttributeParser).registerPattern(patternDefs, Type);
                singletonRegistration(IAttributePattern, Type).register(container);
            }
        };
    },
});
class DotSeparatedAttributePattern {
    'PART.PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
    }
    'PART.PART.PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, `${parts[0]}.${parts[1]}`, parts[2]);
    }
}
_a = Symbol.metadata;
DotSeparatedAttributePattern[_a] = {
    [registrableMetadataKey]: /*@__PURE__*/ AttributePattern.create([
        { pattern: 'PART.PART', symbols: '.' },
        { pattern: 'PART.PART.PART', symbols: '.' }
    ], DotSeparatedAttributePattern)
};
class RefAttributePattern {
    'ref'(rawName, rawValue, _parts) {
        return new AttrSyntax(rawName, rawValue, 'element', 'ref');
    }
    'PART.ref'(rawName, rawValue, parts) {
        let target = parts[0];
        if (target === 'view-model') {
            target = 'component';
            {
                // eslint-disable-next-line no-console
                console.warn(`[aurelia] Detected view-model.ref usage: "${rawName}=${rawValue}".`
                    + ` This is deprecated and component.ref should be used instead`);
            }
        }
        return new AttrSyntax(rawName, rawValue, target, 'ref');
    }
}
_b = Symbol.metadata;
RefAttributePattern[_b] = {
    [registrableMetadataKey]: /*@__PURE__*/ AttributePattern.create([
        { pattern: 'ref', symbols: '' },
        { pattern: 'PART.ref', symbols: '.' }
    ], RefAttributePattern)
};
class EventAttributePattern {
    'PART.trigger:PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger', parts);
    }
    'PART.capture:PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'capture', parts);
    }
}
_c = Symbol.metadata;
EventAttributePattern[_c] = {
    [registrableMetadataKey]: /*@__PURE__*/ AttributePattern.create([
        { pattern: 'PART.trigger:PART', symbols: '.:' },
        { pattern: 'PART.capture:PART', symbols: '.:' },
    ], EventAttributePattern)
};
class ColonPrefixedBindAttributePattern {
    ':PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
    }
}
_d = Symbol.metadata;
ColonPrefixedBindAttributePattern[_d] = {
    [registrableMetadataKey]: /*@__PURE__*/ AttributePattern.create([{ pattern: ':PART', symbols: ':' }], ColonPrefixedBindAttributePattern)
};
class AtPrefixedTriggerAttributePattern {
    '@PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
    }
    '@PART:PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger', [parts[0], 'trigger', ...parts.slice(1)]);
    }
}
_e = Symbol.metadata;
AtPrefixedTriggerAttributePattern[_e] = {
    [registrableMetadataKey]: /*@__PURE__*/ AttributePattern.create([
        { pattern: '@PART', symbols: '@' },
        { pattern: '@PART:PART', symbols: '@:' },
    ], AtPrefixedTriggerAttributePattern)
};

/** @internal */ const getMetadata = Metadata.get;
/** @internal */ Metadata.has;
/** @internal */ const defineMetadata = Metadata.define;

/** @internal */ const hydrateElement = 'ra';
/** @internal */ const hydrateAttribute = 'rb';
/** @internal */ const hydrateTemplateController = 'rc';
/** @internal */ const hydrateLetElement = 'rd';
/** @internal */ const setProperty = 're';
/** @internal */ const interpolation = 'rf';
/** @internal */ const propertyBinding = 'rg';
/** @internal */ const letBinding = 'ri';
/** @internal */ const refBinding = 'rj';
/** @internal */ const iteratorBinding = 'rk';
/** @internal */ const multiAttr = 'rl';
/** @internal */ const textBinding = 'ha';
/** @internal */ const listenerBinding = 'hb';
/** @internal */ const attributeBinding = 'hc';
/** @internal */ const stylePropertyBinding = 'hd';
/** @internal */ const setAttribute = 'he';
/** @internal */ const setClassAttribute = 'hf';
/** @internal */ const setStyleAttribute = 'hg';
/** @internal */ const spreadTransferedBinding = 'hs';
/** @internal */ const spreadElementProp = 'hp';
/** @internal */ const spreadValueBinding = 'svb';
const InstructionType = /*@__PURE__*/ tcObjectFreeze({
    hydrateElement,
    hydrateAttribute,
    hydrateTemplateController,
    hydrateLetElement,
    setProperty,
    interpolation,
    propertyBinding,
    letBinding,
    refBinding,
    iteratorBinding,
    multiAttr,
    textBinding,
    listenerBinding,
    attributeBinding,
    stylePropertyBinding,
    setAttribute,
    setClassAttribute,
    setStyleAttribute,
    spreadTransferedBinding,
    spreadElementProp,
    spreadValueBinding,
});
const IInstruction = /*@__PURE__*/ tcCreateInterface('Instruction');
class InterpolationInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = interpolation;
    }
}
class PropertyBindingInstruction {
    constructor(from, to, mode) {
        this.from = from;
        this.to = to;
        this.mode = mode;
        this.type = propertyBinding;
    }
}
class IteratorBindingInstruction {
    constructor(forOf, to, props) {
        this.forOf = forOf;
        this.to = to;
        this.props = props;
        this.type = iteratorBinding;
    }
}
class RefBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = refBinding;
    }
}
class SetPropertyInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
        this.type = setProperty;
    }
}
class MultiAttrInstruction {
    constructor(value, to, command) {
        this.value = value;
        this.to = to;
        this.command = command;
        this.type = multiAttr;
    }
}
class HydrateElementInstruction {
    constructor(
    /**
     * The name of the custom element this instruction is associated with
     */
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    res, 
    /**
     * Bindable instructions for the custom element instance
     */
    props, 
    /**
     * Indicates what projections are associated with the element usage
     */
    projections, 
    /**
     * Indicates whether the usage of the custom element was with a containerless attribute or not
     */
    containerless, 
    /**
     * A list of captured attr syntaxes
     */
    captures, 
    /**
     * Any data associated with this instruction
     */
    data) {
        this.res = res;
        this.props = props;
        this.projections = projections;
        this.containerless = containerless;
        this.captures = captures;
        this.data = data;
        this.type = hydrateElement;
    }
}
// the template type gives an opportunity for implementor of resources resolver to provide a more specific type
class HydrateAttributeInstruction {
    constructor(
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    res, alias, 
    /**
     * Bindable instructions for the custom attribute instance
     */
    props) {
        this.res = res;
        this.alias = alias;
        this.props = props;
        this.type = hydrateAttribute;
    }
}
// the template type gives an opportunity for implementor of resources resolver to provide a more specific type
class HydrateTemplateController {
    constructor(def, 
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    res, alias, 
    /**
     * Bindable instructions for the template controller instance
     */
    props) {
        this.def = def;
        this.res = res;
        this.alias = alias;
        this.props = props;
        this.type = hydrateTemplateController;
    }
}
class HydrateLetElementInstruction {
    constructor(instructions, toBindingContext) {
        this.instructions = instructions;
        this.toBindingContext = toBindingContext;
        this.type = hydrateLetElement;
    }
}
class LetBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = letBinding;
    }
}
class TextBindingInstruction {
    constructor(from) {
        this.from = from;
        this.type = textBinding;
    }
}
class ListenerBindingInstruction {
    constructor(from, to, capture, modifier) {
        this.from = from;
        this.to = to;
        this.capture = capture;
        this.modifier = modifier;
        this.type = listenerBinding;
    }
}
class StylePropertyBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = stylePropertyBinding;
    }
}
class SetAttributeInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
        this.type = setAttribute;
    }
}
class SetClassAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = setClassAttribute;
    }
}
class SetStyleAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = setStyleAttribute;
    }
}
class AttributeBindingInstruction {
    constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr, from, to) {
        this.attr = attr;
        this.from = from;
        this.to = to;
        this.type = attributeBinding;
    }
}
class SpreadTransferedBindingInstruction {
    constructor() {
        this.type = spreadTransferedBinding;
    }
}
/**
 * When spreading any attribute bindings onto an element,
 * it's possible that some attributes will be targeting the bindable properties of a custom element
 * This instruction is used to express that
 */
class SpreadElementPropBindingInstruction {
    constructor(instruction) {
        this.instruction = instruction;
        this.type = spreadElementProp;
    }
}
class SpreadValueBindingInstruction {
    constructor(target, from) {
        this.target = target;
        this.from = from;
        this.type = spreadValueBinding;
    }
}

function bindingCommand(nameOrDefinition) {
    return function (target, context) {
        context.addInitializer(function () {
            BindingCommand.define(nameOrDefinition, target);
        });
        return target;
    };
}
class BindingCommandDefinition {
    constructor(Type, name, aliases, key) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (isString(nameOrDef)) {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        return new BindingCommandDefinition(Type, firstDefined(getCommandAnnotation(Type, 'name'), name), mergeArrays(getCommandAnnotation(Type, 'aliases'), def.aliases, Type.aliases), getCommandKeyFrom(name));
    }
    register(container, aliasName) {
        const $Type = this.Type;
        const key = typeof aliasName === 'string' ? getCommandKeyFrom(aliasName) : this.key;
        const aliases = this.aliases;
        if (!container.has(key, false)) {
            container.register(container.has($Type, false) ? null : singletonRegistration($Type, $Type), aliasRegistration($Type, key), ...aliases.map(alias => aliasRegistration($Type, getCommandKeyFrom(alias))));
        } /* istanbul ignore next */
        else {
            // eslint-disable-next-line no-console
            console.warn(`[DEV:aurelia] ${createMappedError(157 /* ErrorNames.binding_command_existed */, this.name)}`);
        }
    }
}
const bindingCommandTypeName = 'binding-command';
const cmdBaseName = /*@__PURE__*/ getResourceKeyFor(bindingCommandTypeName);
const getCommandKeyFrom = (name) => `${cmdBaseName}:${name}`;
const getCommandAnnotation = (Type, prop) => getMetadata(Protocol.annotation.keyFor(prop), Type);
const BindingCommand = /*@__PURE__*/ (() => {
    const staticResourceDefinitionMetadataKey = '__au_static_resource__';
    const getDefinitionFromStaticAu = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    Type, typeName, createDef) => {
        let def = getMetadata(staticResourceDefinitionMetadataKey, Type);
        if (def == null) {
            if (Type.$au?.type === typeName) {
                def = createDef(Type.$au, Type);
                defineMetadata(def, Type, staticResourceDefinitionMetadataKey);
            }
        }
        return def;
    };
    return tcObjectFreeze({
        name: cmdBaseName,
        keyFrom: getCommandKeyFrom,
        // isType<T>(value: T): value is (T extends Constructable ? BindingCommandType<T> : never) {
        //   return isFunction(value) && hasOwnMetadata(cmdBaseName, value);
        // },
        define(nameOrDef, Type) {
            const definition = BindingCommandDefinition.create(nameOrDef, Type);
            const $Type = definition.Type;
            // registration of resource name is a requirement for the resource system in kernel (module-loader)
            defineMetadata(definition, $Type, cmdBaseName, resourceBaseName);
            return $Type;
        },
        getAnnotation: getCommandAnnotation,
        find(container, name) {
            const Type = container.find(bindingCommandTypeName, name);
            return Type == null
                ? null
                : getMetadata(cmdBaseName, Type) ?? getDefinitionFromStaticAu(Type, bindingCommandTypeName, BindingCommandDefinition.create) ?? null;
        },
        get(container, name) {
            {
                try {
                    return container.get(resource(getCommandKeyFrom(name)));
                }
                catch (ex) {
                    // eslint-disable-next-line no-console
                    console.log(`\n\n\n[DEV:aurelia] Cannot retrieve binding command with name\n\n\n\n\n`, name);
                    throw ex;
                }
            }
            return container.get(resource(getCommandKeyFrom(name)));
        },
    });
})();
class OneTimeBindingCommand {
    get ignoreAttr() { return false; }
    build(info, exprParser, attrMapper) {
        const attr = info.attr;
        let target = attr.target;
        let value = info.attr.rawValue;
        value = value === '' ? camelCase(target) : value;
        if (info.bindable == null) {
            target = attrMapper.map(info.node, target)
                // if the mapper doesn't know how to map it
                // use the default behavior, which is camel-casing
                ?? camelCase(target);
        }
        else {
            target = info.bindable.name;
        }
        return new PropertyBindingInstruction(exprParser.parse(value, etIsProperty), target, 1 /* InternalBindingMode.oneTime */);
    }
}
OneTimeBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'one-time',
};
class ToViewBindingCommand {
    get ignoreAttr() { return false; }
    build(info, exprParser, attrMapper) {
        const attr = info.attr;
        let target = attr.target;
        let value = info.attr.rawValue;
        value = value === '' ? camelCase(target) : value;
        if (info.bindable == null) {
            target = attrMapper.map(info.node, target)
                // if the mapper doesn't know how to map it
                // use the default behavior, which is camel-casing
                ?? camelCase(target);
        }
        else {
            target = info.bindable.name;
        }
        return new PropertyBindingInstruction(exprParser.parse(value, etIsProperty), target, 2 /* InternalBindingMode.toView */);
    }
}
ToViewBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'to-view',
};
class FromViewBindingCommand {
    get ignoreAttr() { return false; }
    build(info, exprParser, attrMapper) {
        const attr = info.attr;
        let target = attr.target;
        let value = attr.rawValue;
        value = value === '' ? camelCase(target) : value;
        if (info.bindable == null) {
            target = attrMapper.map(info.node, target)
                // if the mapper doesn't know how to map it
                // use the default behavior, which is camel-casing
                ?? camelCase(target);
        }
        else {
            target = info.bindable.name;
        }
        return new PropertyBindingInstruction(exprParser.parse(value, etIsProperty), target, 4 /* InternalBindingMode.fromView */);
    }
}
FromViewBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'from-view',
};
class TwoWayBindingCommand {
    get ignoreAttr() { return false; }
    build(info, exprParser, attrMapper) {
        const attr = info.attr;
        let target = attr.target;
        let value = attr.rawValue;
        value = value === '' ? camelCase(target) : value;
        if (info.bindable == null) {
            target = attrMapper.map(info.node, target)
                // if the mapper doesn't know how to map it
                // use the default behavior, which is camel-casing
                ?? camelCase(target);
        }
        else {
            target = info.bindable.name;
        }
        return new PropertyBindingInstruction(exprParser.parse(value, etIsProperty), target, 6 /* InternalBindingMode.twoWay */);
    }
}
TwoWayBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'two-way',
};
class DefaultBindingCommand {
    get ignoreAttr() { return false; }
    build(info, exprParser, attrMapper) {
        const attr = info.attr;
        const bindable = info.bindable;
        let value = attr.rawValue;
        let target = attr.target;
        let defDefaultMode;
        let mode;
        value = value === '' ? camelCase(target) : value;
        if (bindable == null) {
            mode = attrMapper.isTwoWay(info.node, target) ? 6 /* InternalBindingMode.twoWay */ : 2 /* InternalBindingMode.toView */;
            target = attrMapper.map(info.node, target)
                // if the mapper doesn't know how to map it
                // use the default behavior, which is camel-casing
                ?? camelCase(target);
        }
        else {
            defDefaultMode = info.def.defaultBindingMode ?? 0;
            mode = bindable.mode === 0 || bindable.mode == null
                ? defDefaultMode == null || defDefaultMode === 0
                    ? 2 /* InternalBindingMode.toView */
                    : defDefaultMode
                : bindable.mode;
            target = bindable.name;
        }
        return new PropertyBindingInstruction(exprParser.parse(value, etIsProperty), target, isString(mode)
            ? BindingMode[mode] ?? 0 /* InternalBindingMode.default */
            : mode);
    }
}
DefaultBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'bind',
};
class ForBindingCommand {
    constructor() {
        /** @internal */
        this._attrParser = resolve(IAttributeParser);
    }
    get ignoreAttr() { return false; }
    build(info, exprParser) {
        const target = info.bindable === null
            ? camelCase(info.attr.target)
            : info.bindable.name;
        const forOf = exprParser.parse(info.attr.rawValue, 'IsIterator');
        let props = emptyArray;
        if (forOf.semiIdx > -1) {
            const attr = info.attr.rawValue.slice(forOf.semiIdx + 1);
            const i = attr.indexOf(':');
            if (i > -1) {
                const attrName = attr.slice(0, i).trim();
                const attrValue = attr.slice(i + 1).trim();
                const attrSyntax = this._attrParser.parse(attrName, attrValue);
                props = [new MultiAttrInstruction(attrValue, attrSyntax.target, attrSyntax.command)];
            }
        }
        return new IteratorBindingInstruction(forOf, target, props);
    }
}
ForBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'for',
};
class TriggerBindingCommand {
    get ignoreAttr() { return true; }
    build(info, exprParser) {
        return new ListenerBindingInstruction(exprParser.parse(info.attr.rawValue, etIsFunction), info.attr.target, false, info.attr.parts?.[2] ?? null);
    }
}
TriggerBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'trigger',
};
class CaptureBindingCommand {
    get ignoreAttr() { return true; }
    build(info, exprParser) {
        return new ListenerBindingInstruction(exprParser.parse(info.attr.rawValue, etIsFunction), info.attr.target, true, info.attr.parts?.[2] ?? null);
    }
}
CaptureBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'capture',
};
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
class AttrBindingCommand {
    get ignoreAttr() { return true; }
    build(info, exprParser) {
        const attr = info.attr;
        const target = attr.target;
        let value = attr.rawValue;
        value = value === '' ? camelCase(target) : value;
        return new AttributeBindingInstruction(target, exprParser.parse(value, etIsProperty), target);
    }
}
AttrBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'attr',
};
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
class StyleBindingCommand {
    get ignoreAttr() { return true; }
    build(info, exprParser) {
        return new AttributeBindingInstruction('style', exprParser.parse(info.attr.rawValue, etIsProperty), info.attr.target);
    }
}
StyleBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'style',
};
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
class ClassBindingCommand {
    get ignoreAttr() { return true; }
    build(info, exprParser) {
        let target = info.attr.target;
        if (target.includes(",")) {
            const classes = target
                .split(",")
                .filter(c => c.length > 0);
            if (classes.length === 0) {
                throw createMappedError(723 /* ErrorNames.compiler_invalid_class_binding_syntax */);
            }
            target = classes.join(' ');
        }
        return new AttributeBindingInstruction("class", exprParser.parse(info.attr.rawValue, etIsProperty), target);
    }
}
ClassBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'class',
};
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
class RefBindingCommand {
    get ignoreAttr() { return true; }
    build(info, exprParser) {
        return new RefBindingInstruction(exprParser.parse(info.attr.rawValue, etIsProperty), info.attr.target);
    }
}
RefBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'ref',
};
class SpreadValueBindingCommand {
    get ignoreAttr() { return false; }
    build(info) {
        return new SpreadValueBindingInstruction(info.attr.target, info.attr.rawValue);
    }
}
SpreadValueBindingCommand.$au = {
    type: bindingCommandTypeName,
    name: 'spread',
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const ITemplateElementFactory = /*@__PURE__*/ tcCreateInterface('ITemplateElementFactory', x => x.singleton(TemplateElementFactory));
const markupCache = {};
class TemplateElementFactory {
    constructor() {
        /** @internal */
        this.p = resolve(IPlatform);
        /** @internal */
        this._template = this.t();
    }
    t() {
        return this.p.document.createElement('template');
    }
    createTemplate(input) {
        if (isString(input)) {
            let result = markupCache[input];
            if (result === void 0) {
                const template = this._template;
                template.innerHTML = input;
                const node = template.content.firstElementChild;
                // if the input is either not wrapped in a template or there is more than one node,
                // return the whole template that wraps it/them (and create a new one for the next input)
                if (needsWrapping(node)) {
                    this._template = this.t();
                    result = template;
                }
                else {
                    // the node to return is both a template and the only node, so return just the node
                    // and clean up the template for the next input
                    template.content.removeChild(node);
                    result = node;
                }
                markupCache[input] = result;
            }
            return result.cloneNode(true);
        }
        if (input.nodeName !== 'TEMPLATE') {
            // if we get one node that is not a template, wrap it in one
            const template = this.t();
            template.content.appendChild(input);
            return template;
        }
        // we got a template element, remove it from the DOM if it's present there and don't
        // do any other processing
        input.parentNode?.removeChild(input);
        return input.cloneNode(true);
        function needsWrapping(node) {
            if (node == null)
                return true;
            if (node.nodeName !== 'TEMPLATE')
                return true;
            // At this point the node is a template element.
            // If the template has meaningful siblings, then it needs wrapping.
            // low-hanging fruit: check the next element sibling
            const nextElementSibling = node.nextElementSibling;
            if (nextElementSibling != null)
                return true;
            // check the previous sibling
            const prevSibling = node.previousSibling;
            if (prevSibling != null) {
                switch (prevSibling.nodeType) {
                    // The previous sibling cannot be an element, because the node is the first element in the template.
                    case 3: // Text
                        return prevSibling.textContent.trim().length > 0;
                }
            }
            // the previous sibling was not meaningful, so check the next sibling
            const nextSibling = node.nextSibling;
            if (nextSibling != null) {
                switch (nextSibling.nodeType) {
                    // element is already checked above
                    case 3: // Text
                        return nextSibling.textContent.trim().length > 0;
                }
            }
            // neither the previous nor the next sibling was meaningful, hence the template does not need wrapping
            return false;
        }
    }
}

/** @internal */
const auLocationStart = 'au-start';
/** @internal */
const auLocationEnd = 'au-end';
/** @internal */
const insertBefore = (parent, newChildNode, target) => {
    return parent.insertBefore(newChildNode, target);
};
/** @internal */
const insertManyBefore = (parent, target, newChildNodes) => {
    if (parent === null) {
        return;
    }
    const ii = newChildNodes.length;
    let i = 0;
    while (ii > i) {
        parent.insertBefore(newChildNodes[i], target);
        ++i;
    }
};
/** @internal */
const appendToTemplate = (parent, child) => {
    return parent.content.appendChild(child);
};
/** @internal */
const appendManyToTemplate = (parent, children) => {
    const ii = children.length;
    let i = 0;
    while (ii > i) {
        parent.content.appendChild(children[i]);
        ++i;
    }
};
/** @internal */
const isElement = (node) => node.nodeType === 1;
/** @internal */
const isTextNode = (node) => node.nodeType === 3;

const auslotAttr = 'au-slot';
const defaultSlotName = 'default';
const generateElementName = ((id) => () => `anonymous-${++id}`)(0);
class TemplateCompiler {
    constructor() {
        this.debug = false;
        this.resolveResources = true;
    }
    compile(definition, container) {
        if (definition.template == null || definition.needsCompile === false) {
            return definition;
        }
        const context = new CompilationContext(definition, container, null, null, void 0);
        const template = isString(definition.template) || !definition.enhance
            ? context._templateFactory.createTemplate(definition.template)
            : definition.template;
        const isTemplateElement = template.nodeName === TEMPLATE_NODE_NAME && template.content != null;
        const content = isTemplateElement ? template.content : template;
        const hooks = TemplateCompilerHooks.findAll(container);
        const ii = hooks.length;
        let i = 0;
        if (ii > 0) {
            while (ii > i) {
                hooks[i].compiling?.(template);
                ++i;
            }
        }
        if (template.hasAttribute(localTemplateIdentifier)) {
            throw createMappedError(701 /* ErrorNames.compiler_root_is_local */, definition);
        }
        this._compileLocalElement(content, context);
        this._compileNode(content, context);
        const compiledDef = {
            ...definition,
            name: definition.name || generateElementName(),
            dependencies: (definition.dependencies ?? emptyArray).concat(context.deps ?? emptyArray),
            instructions: context.rows,
            surrogates: isTemplateElement
                ? this._compileSurrogate(template, context)
                : emptyArray,
            template,
            hasSlots: context.hasSlot,
            needsCompile: false,
        };
        return compiledDef;
    }
    compileSpread(requestor, attrSyntaxs, container, target, targetDef) {
        const context = new CompilationContext(requestor, container, null, null, void 0);
        const instructions = [];
        const elDef = targetDef ?? context._findElement(target.nodeName.toLowerCase());
        const isCustomElement = elDef !== null;
        const exprParser = context._exprParser;
        const ii = attrSyntaxs.length;
        let i = 0;
        let attrSyntax;
        let attrDef = null;
        let attrInstructions;
        let attrBindableInstructions;
        let bindablesInfo;
        let bindable;
        let primaryBindable;
        let bindingCommand = null;
        let expr;
        let isMultiBindings;
        let attrTarget;
        let attrValue;
        for (; ii > i; ++i) {
            attrSyntax = attrSyntaxs[i];
            attrTarget = attrSyntax.target;
            attrValue = attrSyntax.rawValue;
            if (attrTarget === '...$attrs') {
                instructions.push(new SpreadTransferedBindingInstruction());
                continue;
            }
            bindingCommand = context._getCommand(attrSyntax);
            if (bindingCommand !== null && bindingCommand.ignoreAttr) {
                // when the binding command overrides everything
                // just pass the target as is to the binding command, and treat it as a normal attribute:
                // active.class="..."
                // background.style="..."
                // my-attr.attr="..."
                commandBuildInfo.node = target;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                instructions.push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));
                // to next attribute
                continue;
            }
            if (isCustomElement) {
                // if the element is a custom element
                // - prioritize bindables on a custom element before plain attributes
                bindablesInfo = context._getBindables(elDef);
                bindable = bindablesInfo.attrs[attrTarget];
                if (bindable !== void 0) {
                    if (bindingCommand == null) {
                        expr = exprParser.parse(attrValue, etInterpolation);
                        instructions.push(new SpreadElementPropBindingInstruction(expr == null
                            ? new SetPropertyInstruction(attrValue, bindable.name)
                            : new InterpolationInstruction(expr, bindable.name)));
                    }
                    else {
                        commandBuildInfo.node = target;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.bindable = bindable;
                        commandBuildInfo.def = elDef;
                        instructions.push(new SpreadElementPropBindingInstruction(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper)));
                    }
                    continue;
                }
            }
            attrDef = context._findAttr(attrTarget);
            if (attrDef !== null) {
                if (attrDef.isTemplateController) {
                    throw createMappedError(9998 /* ErrorNames.no_spread_template_controller */, attrTarget);
                }
                bindablesInfo = context._getBindables(attrDef);
                // Custom attributes are always in multiple binding mode,
                // except when they can't be
                // When they cannot be:
                //        * has explicit configuration noMultiBindings: false
                //        * has binding command, ie: <div my-attr.bind="...">.
                //          In this scenario, the value of the custom attributes is required to be a valid expression
                //        * has no colon: ie: <div my-attr="abcd">
                //          In this scenario, it's simply invalid syntax.
                //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
                isMultiBindings = attrDef.noMultiBindings === false
                    && bindingCommand === null
                    && hasInlineBindings(attrValue);
                if (isMultiBindings) {
                    attrBindableInstructions = this._compileMultiBindings(target, attrValue, attrDef, context);
                }
                else {
                    primaryBindable = bindablesInfo.primary;
                    // custom attribute + single value + WITHOUT binding command:
                    // my-attr=""
                    // my-attr="${}"
                    if (bindingCommand === null) {
                        expr = exprParser.parse(attrValue, etInterpolation);
                        attrBindableInstructions = [
                            expr === null
                                ? new SetPropertyInstruction(attrValue, primaryBindable.name)
                                : new InterpolationInstruction(expr, primaryBindable.name)
                        ];
                    }
                    else {
                        // custom attribute with binding command:
                        // my-attr.bind="..."
                        // my-attr.two-way="..."
                        commandBuildInfo.node = target;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.bindable = primaryBindable;
                        commandBuildInfo.def = attrDef;
                        attrBindableInstructions = [bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper)];
                    }
                }
                (attrInstructions ??= []).push(new HydrateAttributeInstruction(
                // todo: def/ def.Type or def.name should be configurable
                //       example: AOT/runtime can use def.Type, but there are situation
                //       where instructions need to be serialized, def.name should be used
                this.resolveResources ? attrDef : attrDef.name, attrDef.aliases != null && attrDef.aliases.includes(attrTarget) ? attrTarget : void 0, attrBindableInstructions));
                continue;
            }
            if (bindingCommand == null) {
                expr = exprParser.parse(attrValue, etInterpolation);
                // reaching here means:
                // + maybe a plain attribute with interpolation
                // + maybe a plain attribute
                if (expr != null) {
                    instructions.push(new InterpolationInstruction(expr, 
                    // if not a bindable, then ensure plain attribute are mapped correctly:
                    // e.g: colspan -> colSpan
                    //      innerhtml -> innerHTML
                    //      minlength -> minLength etc...
                    context._attrMapper.map(target, attrTarget) ?? camelCase(attrTarget)));
                }
                else {
                    switch (attrTarget) {
                        case 'class':
                            instructions.push(new SetClassAttributeInstruction(attrValue));
                            break;
                        case 'style':
                            instructions.push(new SetStyleAttributeInstruction(attrValue));
                            break;
                        default:
                            // if not a custom attribute + no binding command + not a bindable + not an interpolation
                            // then it's just a plain attribute
                            instructions.push(new SetAttributeInstruction(attrValue, attrTarget));
                    }
                }
            }
            else {
                // reaching here means:
                // + a plain attribute with binding command
                commandBuildInfo.node = target;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                instructions.push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));
            }
        }
        resetCommandBuildInfo();
        if (attrInstructions != null) {
            return attrInstructions.concat(instructions);
        }
        return instructions;
    }
    /** @internal */
    _compileSurrogate(el, context) {
        const instructions = [];
        const attrs = el.attributes;
        const exprParser = context._exprParser;
        let ii = attrs.length;
        let i = 0;
        let attr;
        let attrName;
        let attrValue;
        let attrSyntax;
        let attrDef = null;
        let attrInstructions;
        let attrBindableInstructions;
        let bindableInfo;
        let primaryBindable;
        let bindingCommand = null;
        let expr;
        let isMultiBindings;
        let realAttrTarget;
        let realAttrValue;
        for (; ii > i; ++i) {
            attr = attrs[i];
            attrName = attr.name;
            attrValue = attr.value;
            attrSyntax = context._attrParser.parse(attrName, attrValue);
            realAttrTarget = attrSyntax.target;
            realAttrValue = attrSyntax.rawValue;
            if (invalidSurrogateAttribute[realAttrTarget]) {
                throw createMappedError(702 /* ErrorNames.compiler_invalid_surrogate_attr */, attrName);
            }
            bindingCommand = context._getCommand(attrSyntax);
            if (bindingCommand !== null && bindingCommand.ignoreAttr) {
                // when the binding command overrides everything
                // just pass the target as is to the binding command, and treat it as a normal attribute:
                // active.class="..."
                // background.style="..."
                // my-attr.attr="..."
                commandBuildInfo.node = el;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                instructions.push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));
                // to next attribute
                continue;
            }
            attrDef = context._findAttr(realAttrTarget);
            if (attrDef !== null) {
                if (attrDef.isTemplateController) {
                    throw createMappedError(703 /* ErrorNames.compiler_no_tc_on_surrogate */, realAttrTarget);
                }
                bindableInfo = context._getBindables(attrDef);
                // Custom attributes are always in multiple binding mode,
                // except when they can't be
                // When they cannot be:
                //        * has explicit configuration noMultiBindings: false
                //        * has binding command, ie: <div my-attr.bind="...">.
                //          In this scenario, the value of the custom attributes is required to be a valid expression
                //        * has no colon: ie: <div my-attr="abcd">
                //          In this scenario, it's simply invalid syntax.
                //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
                isMultiBindings = attrDef.noMultiBindings === false
                    && bindingCommand === null
                    && hasInlineBindings(realAttrValue);
                if (isMultiBindings) {
                    attrBindableInstructions = this._compileMultiBindings(el, realAttrValue, attrDef, context);
                }
                else {
                    primaryBindable = bindableInfo.primary;
                    // custom attribute + single value + WITHOUT binding command:
                    // my-attr=""
                    // my-attr="${}"
                    if (bindingCommand === null) {
                        expr = exprParser.parse(realAttrValue, etInterpolation);
                        attrBindableInstructions = expr === null
                            ? realAttrValue === ''
                                // when the attribute usage is <div attr>
                                // it's considered as no bindings
                                ? []
                                : [new SetPropertyInstruction(realAttrValue, primaryBindable.name)]
                            : [new InterpolationInstruction(expr, primaryBindable.name)];
                    }
                    else {
                        // custom attribute with binding command:
                        // my-attr.bind="..."
                        // my-attr.two-way="..."
                        commandBuildInfo.node = el;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.bindable = primaryBindable;
                        commandBuildInfo.def = attrDef;
                        attrBindableInstructions = [bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper)];
                    }
                }
                el.removeAttribute(attrName);
                --i;
                --ii;
                (attrInstructions ??= []).push(new HydrateAttributeInstruction(
                // todo: def/ def.Type or def.name should be configurable
                //       example: AOT/runtime can use def.Type, but there are situation
                //       where instructions need to be serialized, def.name should be used
                this.resolveResources ? attrDef : attrDef.name, attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0, attrBindableInstructions));
                continue;
            }
            if (bindingCommand === null) {
                expr = exprParser.parse(realAttrValue, etInterpolation);
                if (expr != null) {
                    el.removeAttribute(attrName);
                    --i;
                    --ii;
                    instructions.push(new InterpolationInstruction(expr, 
                    // if not a bindable, then ensure plain attribute are mapped correctly:
                    // e.g: colspan -> colSpan
                    //      innerhtml -> innerHTML
                    //      minlength -> minLength etc...
                    context._attrMapper.map(el, realAttrTarget) ?? camelCase(realAttrTarget)));
                }
                else {
                    switch (attrName) {
                        case 'class':
                            instructions.push(new SetClassAttributeInstruction(realAttrValue));
                            break;
                        case 'style':
                            instructions.push(new SetStyleAttributeInstruction(realAttrValue));
                            break;
                        default:
                            // if not a custom attribute + no binding command + not a bindable + not an interpolation
                            // then it's just a plain attribute
                            instructions.push(new SetAttributeInstruction(realAttrValue, attrName));
                    }
                }
            }
            else {
                commandBuildInfo.node = el;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                instructions.push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));
            }
        }
        resetCommandBuildInfo();
        if (attrInstructions != null) {
            return attrInstructions.concat(instructions);
        }
        return instructions;
    }
    // overall flow:
    // each of the method will be responsible for compiling its corresponding node type
    // and it should return the next node to be compiled
    /** @internal */
    _compileNode(node, context) {
        switch (node.nodeType) {
            case 1:
                switch (node.nodeName) {
                    case 'LET':
                        return this._compileLet(node, context);
                    // ------------------------------------
                    // todo: possible optimization:
                    // when two conditions below are met:
                    // 1. there's no attribute on au slot,
                    // 2. there's no projection
                    //
                    // -> flatten the au-slot into children as this is just a static template
                    // ------------------------------------
                    // case 'AU-SLOT':
                    //   return this.auSlot(node as Element, container, context);
                    default:
                        return this._compileElement(node, context);
                }
            case 3:
                return this._compileText(node, context);
            case 11: {
                let current = node.firstChild;
                while (current !== null) {
                    current = this._compileNode(current, context);
                }
                break;
            }
        }
        return node.nextSibling;
    }
    /** @internal */
    _compileLet(el, context) {
        const attrs = el.attributes;
        const ii = attrs.length;
        const letInstructions = [];
        const exprParser = context._exprParser;
        let toBindingContext = false;
        let i = 0;
        let attr;
        let attrSyntax;
        let attrName;
        let attrValue;
        let bindingCommand;
        let realAttrTarget;
        let realAttrValue;
        let expr;
        for (; ii > i; ++i) {
            attr = attrs[i];
            attrName = attr.name;
            attrValue = attr.value;
            if (attrName === 'to-binding-context') {
                toBindingContext = true;
                continue;
            }
            attrSyntax = context._attrParser.parse(attrName, attrValue);
            realAttrTarget = attrSyntax.target;
            realAttrValue = attrSyntax.rawValue;
            bindingCommand = context._getCommand(attrSyntax);
            if (bindingCommand !== null) {
                if (attrSyntax.command === 'bind') {
                    letInstructions.push(new LetBindingInstruction(exprParser.parse(realAttrValue, etIsProperty), camelCase(realAttrTarget)));
                }
                else {
                    throw createMappedError(704 /* ErrorNames.compiler_invalid_let_command */, attrSyntax);
                }
                continue;
            }
            expr = exprParser.parse(realAttrValue, etInterpolation);
            if (expr === null) {
                {
                    // eslint-disable-next-line no-console
                    console.warn(`[DEV:aurelia] Property "${realAttrTarget}" is declared with literal string ${realAttrValue}. ` +
                        `Did you mean ${realAttrTarget}.bind="${realAttrValue}"?`);
                }
            }
            letInstructions.push(new LetBindingInstruction(expr === null ? new PrimitiveLiteralExpression(realAttrValue) : expr, camelCase(realAttrTarget)));
        }
        context.rows.push([new HydrateLetElementInstruction(letInstructions, toBindingContext)]);
        // probably no need to replace
        // as the let itself can be used as is
        // though still need to mark el as target to ensure the instruction is matched with a target
        return this._markAsTarget(el, context).nextSibling;
    }
    /** @internal */
    // eslint-disable-next-line
    _compileElement(el, context) {
        // overall, the template compiler does it job by compiling one node,
        // and let that the process of compiling that node point to the next node to be compiled.
        // ----------------------------------------
        // a summary of this 650 line long function:
        // 1. walk through all attributes to put them into their corresponding instruction groups
        //    template controllers      -> list 1
        //    custom attributes         -> list 2
        //    plain attrs with bindings -> list 3
        //    el bindables              -> list 4
        // 2. ensure element instruction is present
        // 3. sort instructions:
        //    hydrate custom element instruction
        //    hydrate custom attribute instructions
        //    rest kept as is (except special cases & to-be-decided)
        //    3.1
        //      mark this element as a target for later hydration
        // 4. Compiling child nodes of this element
        //    4.1.
        //      If 1 or more [Template controller]:
        //      4.1.1.
        //          Start processing the most inner (most right TC in list 1) similarly to step 4.2:
        //          4.1.1.0.
        //          let innerContext = context.createChild();
        //          4.1.1.1.
        //              walks through the child nodes, and perform a [au-slot] check
        //              - if this is a custom element, then extract all [au-slot] annotated elements into corresponding templates by their target slot name
        //              - else throw an error as [au-slot] is used on non-custom-element
        //          4.1.1.2.
        //              recursively compiles the child nodes into the innerContext
        //      4.1.2.
        //          Start processing other Template controllers by walking the TC list (list 1) RIGHT -> LEFT
        //          Explanation:
        //              If there' are multiple template controllers on an element,
        //              only the most inner template controller will have access to the template with the current element
        //              other "outer" template controller will only need to see a marker pointing to a definition of the inner one
        //    4.2.
        //      NO [Template controller]
        //      4.2.1.
        //          walks through the child nodes, and perform a [au-slot] check
        //          - if this is a custom element, then extract all [au-slot] annotated elements into corresponding templates by their target slot name
        //          - else throw an error as [au-slot] is used on non-custom-element
        //      4.2.2
        //          recursively compiles the child nodes into the current context
        // 5. Returning the next node for the compilation
        const nextSibling = el.nextSibling;
        const elName = (el.getAttribute('as-element') ?? el.nodeName).toLowerCase();
        const elDef = context._findElement(elName);
        const isCustomElement = elDef !== null;
        const isShadowDom = isCustomElement && elDef.shadowOptions != null;
        const capture = elDef?.capture;
        const hasCaptureFilter = capture != null && typeof capture !== 'boolean';
        const captures = capture ? [] : emptyArray;
        const exprParser = context._exprParser;
        const removeAttr = this.debug
            ? noop
            : () => {
                el.removeAttribute(attrName);
                --i;
                --ii;
            };
        let attrs = el.attributes;
        let instructions;
        let ii = attrs.length;
        let i = 0;
        let attr;
        let attrName;
        let attrValue;
        let attrSyntax;
        /**
         * A list of plain attribute bindings/interpolation bindings
         */
        let plainAttrInstructions;
        let elBindableInstructions;
        let attrDef = null;
        let isMultiBindings = false;
        let bindable;
        let attrInstructions;
        let attrBindableInstructions;
        let tcInstructions;
        let tcInstruction;
        let expr;
        let elementInstruction;
        let bindingCommand = null;
        let bindablesInfo;
        let primaryBindable;
        let realAttrTarget;
        let realAttrValue;
        let processContentResult = true;
        let hasContainerless = false;
        let canCapture = false;
        let needsMarker = false;
        let elementMetadata;
        let spreadIndex = 0;
        if (elName === 'slot') {
            if (context.root.def.shadowOptions == null) {
                throw createMappedError(717 /* ErrorNames.compiler_slot_without_shadowdom */, context.root.def.name);
            }
            context.root.hasSlot = true;
        }
        if (isCustomElement) {
            elementMetadata = {};
            // todo: this is a bit ... powerful
            // maybe do not allow it to process its own attributes
            processContentResult = elDef.processContent?.call(elDef.Type, el, context.p, elementMetadata);
            // might have changed during the process
            attrs = el.attributes;
            ii = attrs.length;
        }
        // 1. walk and compile through all attributes
        //    for each of them, put in appropriate group.
        //    ex. plain attr with binding -> plain attr instruction list
        //        template controller     -> tc instruction list
        //        custom attribute        -> ca instruction list
        //        el bindable attribute   -> el bindable instruction list
        for (; ii > i; ++i) {
            attr = attrs[i];
            attrName = attr.name;
            attrValue = attr.value;
            switch (attrName) {
                // ignore these 2 attributes
                case 'as-element':
                case 'containerless':
                    removeAttr();
                    hasContainerless = hasContainerless || attrName === 'containerless';
                    continue;
            }
            attrSyntax = context._attrParser.parse(attrName, attrValue);
            bindingCommand = context._getCommand(attrSyntax);
            realAttrTarget = attrSyntax.target;
            realAttrValue = attrSyntax.rawValue;
            if (capture && (!hasCaptureFilter || hasCaptureFilter && capture(realAttrTarget))) {
                if (bindingCommand != null && bindingCommand.ignoreAttr) {
                    removeAttr();
                    captures.push(attrSyntax);
                    continue;
                }
                canCapture = realAttrTarget !== auslotAttr
                    && realAttrTarget !== 'slot'
                    && ((spreadIndex = realAttrTarget.indexOf('...')) === -1
                        // the following condition will allow syntaxes:
                        // ...$bindables
                        // ...some.expression
                        || (spreadIndex === 0 && (realAttrTarget === '...$attrs')));
                if (canCapture) {
                    bindablesInfo = context._getBindables(elDef);
                    // if capture is on, capture everything except:
                    // - as-element
                    // - containerless
                    // - bindable properties
                    // - template controller
                    if (bindablesInfo.attrs[realAttrTarget] == null && !context._findAttr(realAttrTarget)?.isTemplateController) {
                        removeAttr();
                        captures.push(attrSyntax);
                        continue;
                    }
                }
            }
            if (realAttrTarget === '...$attrs') {
                (plainAttrInstructions ??= []).push(new SpreadTransferedBindingInstruction());
                removeAttr();
                continue;
            }
            if (bindingCommand?.ignoreAttr) {
                // when the binding command overrides everything
                // just pass the target as is to the binding command, and treat it as a normal attribute:
                // active.class="..."
                // background.style="..."
                // my-attr.attr="..."
                commandBuildInfo.node = el;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                (plainAttrInstructions ??= []).push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));
                removeAttr();
                // to next attribute
                continue;
            }
            if (realAttrTarget.indexOf('...') === 0) {
                if (isCustomElement && (realAttrTarget = realAttrTarget.slice(3)) !== '$element') {
                    (elBindableInstructions ??= []).push(new SpreadValueBindingInstruction('$bindables', realAttrTarget === '$bindables' ? realAttrValue : realAttrTarget));
                    removeAttr();
                    continue;
                }
                {
                    if (realAttrTarget === '$bindable' || realAttrTarget === 'bindables') {
                        // eslint-disable-next-line no-console
                        console.warn(`[DEV:aurelia] Detected usage of ${realAttrTarget} on <${el.nodeName}>, did you mean "$bindables"?`);
                    }
                }
                throw createMappedError(720 /* ErrorNames.compiler_no_reserved_spread_syntax */, realAttrTarget);
            }
            // reaching here means:
            // + there may or may not be a binding command, but it won't be an overriding command
            if (isCustomElement) {
                // if the element is a custom element
                // - prioritize bindables on a custom element before plain attributes
                bindablesInfo = context._getBindables(elDef);
                bindable = bindablesInfo.attrs[realAttrTarget];
                if (bindable !== void 0) {
                    if (bindingCommand === null) {
                        expr = exprParser.parse(realAttrValue, etInterpolation);
                        (elBindableInstructions ??= []).push(expr == null
                            ? new SetPropertyInstruction(realAttrValue, bindable.name)
                            : new InterpolationInstruction(expr, bindable.name));
                    }
                    else {
                        commandBuildInfo.node = el;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.bindable = bindable;
                        commandBuildInfo.def = elDef;
                        (elBindableInstructions ??= []).push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));
                    }
                    removeAttr();
                    {
                        attrDef = context._findAttr(realAttrTarget);
                        if (attrDef !== null) {
                            // eslint-disable-next-line no-console
                            console.warn(`[DEV:aurelia] Binding with bindable "${realAttrTarget}" on custom element "${elDef.name}" is ambiguous.` +
                                `There is a custom attribute with the same name.`);
                        }
                    }
                    continue;
                }
                if (realAttrTarget === '$bindables') {
                    if (bindingCommand != null) {
                        commandBuildInfo.node = el;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.bindable = null;
                        commandBuildInfo.def = elDef;
                        {
                            const instruction = bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper);
                            if (!(instruction instanceof SpreadValueBindingInstruction)) {
                                // eslint-disable-next-line no-console
                                console.warn(`[DEV:aurelia] Binding with "$bindables" on custom element "${elDef.name}" with command ${attrSyntax.command} ` +
                                    ` did not result in a spread binding instruction. This likely won't work as expected.`);
                            }
                            (elBindableInstructions ??= []).push(instruction);
                        }
                    }
                    else {
                        // eslint-disable-next-line no-console
                        console.warn(`[DEV:aurelia] Usage of "$bindables" on custom element "<${elDef.name}>" is ignored.`);
                    }
                    removeAttr();
                    continue;
                }
            }
            if (realAttrTarget === '$bindables') {
                throw createMappedError(721 /* ErrorNames.compiler_no_reserved_$bindable */, el.nodeName, realAttrTarget, realAttrValue);
            }
            // reaching here means:
            // + there may or may not be a binding command, but it won't be an overriding command
            // + the attribute is not targeting a bindable property of a custom element
            //
            // + maybe it's a custom attribute
            // + maybe it's a plain attribute
            // check for custom attributes before plain attributes
            attrDef = context._findAttr(realAttrTarget);
            if (attrDef !== null) {
                bindablesInfo = context._getBindables(attrDef);
                // Custom attributes are always in multiple binding mode,
                // except when they can't be
                // When they cannot be:
                //        * has explicit configuration noMultiBindings: false
                //        * has binding command, ie: <div my-attr.bind="...">.
                //          In this scenario, the value of the custom attributes is required to be a valid expression
                //        * has no colon: ie: <div my-attr="abcd">
                //          In this scenario, it's simply invalid syntax.
                //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
                isMultiBindings = attrDef.noMultiBindings === false
                    && bindingCommand === null
                    && hasInlineBindings(realAttrValue);
                if (isMultiBindings) {
                    attrBindableInstructions = this._compileMultiBindings(el, realAttrValue, attrDef, context);
                }
                else {
                    primaryBindable = bindablesInfo.primary;
                    // custom attribute + single value + WITHOUT binding command:
                    // my-attr=""
                    // my-attr="${}"
                    if (bindingCommand === null) {
                        expr = exprParser.parse(realAttrValue, etInterpolation);
                        attrBindableInstructions = expr === null
                            ? realAttrValue === ''
                                // when the attribute usage is <div attr>
                                // it's considered as no bindings
                                ? []
                                : [new SetPropertyInstruction(realAttrValue, primaryBindable.name)]
                            : [new InterpolationInstruction(expr, primaryBindable.name)];
                    }
                    else {
                        // custom attribute with binding command:
                        // my-attr.bind="..."
                        // my-attr.two-way="..."
                        commandBuildInfo.node = el;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.bindable = primaryBindable;
                        commandBuildInfo.def = attrDef;
                        attrBindableInstructions = [bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper)];
                    }
                }
                removeAttr();
                if (attrDef.isTemplateController) {
                    (tcInstructions ??= []).push(new HydrateTemplateController(voidDefinition, 
                    // todo: def/ def.Type or def.name should be configurable
                    //       example: AOT/runtime can use def.Type, but there are situation
                    //       where instructions need to be serialized, def.name should be used
                    this.resolveResources ? attrDef : attrDef.name, void 0, attrBindableInstructions));
                }
                else {
                    (attrInstructions ??= []).push(new HydrateAttributeInstruction(
                    // todo: def/ def.Type or def.name should be configurable
                    //       example: AOT/runtime can use def.Type, but there are situation
                    //       where instructions need to be serialized, def.name should be used
                    this.resolveResources ? attrDef : attrDef.name, attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0, attrBindableInstructions));
                }
                continue;
            }
            // reaching here means:
            // + it's a plain attribute
            // + there may or may not be a binding command, but it won't be an overriding command
            if (bindingCommand === null) {
                // reaching here means:
                // + maybe a plain attribute with interpolation
                // + maybe a plain attribute
                expr = exprParser.parse(realAttrValue, etInterpolation);
                if (expr != null) {
                    // if it's an interpolation, remove the attribute
                    removeAttr();
                    (plainAttrInstructions ??= []).push(new InterpolationInstruction(expr, 
                    // if not a bindable, then ensure plain attribute are mapped correctly:
                    // e.g: colspan -> colSpan
                    //      innerhtml -> innerHTML
                    //      minlength -> minLength etc...
                    context._attrMapper.map(el, realAttrTarget) ?? camelCase(realAttrTarget)));
                }
                continue;
            }
            // reaching here means:
            // + has binding command
            // + not an overriding binding command
            // + not a custom attribute
            // + not a custom element bindable
            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.bindable = null;
            commandBuildInfo.def = null;
            (plainAttrInstructions ??= []).push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));
            removeAttr();
        }
        resetCommandBuildInfo();
        if (this._shouldReorderAttrs(el, plainAttrInstructions) && plainAttrInstructions != null && plainAttrInstructions.length > 1) {
            this._reorder(el, plainAttrInstructions);
        }
        // 2. ensure that element instruction is present if this element is a custom element
        if (isCustomElement) {
            elementInstruction = new HydrateElementInstruction(
            // todo: def/ def.Type or def.name should be configurable
            //       example: AOT/runtime can use def.Type, but there are situation
            //       where instructions need to be serialized, def.name should be used
            this.resolveResources ? elDef : elDef.name, (elBindableInstructions ?? emptyArray), null, hasContainerless, captures, elementMetadata);
        }
        // 3. merge and sort all instructions into a single list
        //    as instruction list for this element
        if (plainAttrInstructions != null
            || elementInstruction != null
            || attrInstructions != null) {
            instructions = emptyArray.concat(elementInstruction ?? emptyArray, attrInstructions ?? emptyArray, plainAttrInstructions ?? emptyArray);
            // 3.1 mark as template for later hydration
            // this._markAsTarget(el, context);
            needsMarker = true;
        }
        // 4. compiling child nodes
        let shouldCompileContent;
        if (tcInstructions != null) {
            // 4.1 if there is 1 or more [Template controller]
            ii = tcInstructions.length - 1;
            i = ii;
            tcInstruction = tcInstructions[i];
            let template;
            if (isMarker(el)) {
                template = context.t();
                appendManyToTemplate(template, [
                    // context.h(MARKER_NODE_NAME),
                    context._marker(),
                    context._comment(auLocationStart),
                    context._comment(auLocationEnd),
                ]);
            }
            else {
                // assumption: el.parentNode is not null
                // but not always the case: e.g compile/enhance an element without parent with TC on it
                this._replaceByMarker(el, context);
                if (el.nodeName === 'TEMPLATE') {
                    template = el;
                }
                else {
                    template = context.t();
                    appendToTemplate(template, el);
                }
            }
            const mostInnerTemplate = template;
            // 4.1.1.0. prepare child context for the inner template compilation
            const childContext = context._createChild(instructions == null ? [] : [instructions]);
            let childEl;
            let targetSlot;
            let hasAuSlot = false;
            let projections;
            let slotTemplateRecord;
            let slotTemplates;
            let slotTemplate;
            let marker;
            let projectionCompilationContext;
            let j = 0, jj = 0;
            // 4.1.1.1.
            //  walks through the child nodes, and perform [au-slot] check
            //  note: this is a bit different with the summary above, possibly wrong since it will not throw
            //        on [au-slot] used on a non-custom-element + with a template controller on it
            // for each child element of a custom element
            // scan for [au-slot], if there's one
            // then extract the element into a projection definition
            // this allows support for [au-slot] declared on the same element with anther template controller
            // e.g:
            //
            // can do:
            //  <my-el>
            //    <div au-slot if.bind="..."></div>
            //    <div if.bind="..." au-slot></div>
            //  </my-el>
            //
            // instead of:
            //  <my-el>
            //    <template au-slot><div if.bind="..."></div>
            //  </my-el>
            let child = el.firstChild;
            let isEmptyTextNode = false;
            if (processContentResult !== false) {
                while (child !== null) {
                    targetSlot = isElement(child) ? child.getAttribute(auslotAttr) : null;
                    hasAuSlot = targetSlot !== null || isCustomElement && !isShadowDom;
                    childEl = child.nextSibling;
                    if (hasAuSlot) {
                        if (!isCustomElement) {
                            throw createMappedError(706 /* ErrorNames.compiler_au_slot_on_non_element */, targetSlot, elName);
                        }
                        child.removeAttribute?.(auslotAttr);
                        // ignore all whitespace
                        isEmptyTextNode = isTextNode(child) && child.textContent.trim() === '';
                        if (!isEmptyTextNode) {
                            ((slotTemplateRecord ??= {})[targetSlot || defaultSlotName] ??= []).push(child);
                        }
                        el.removeChild(child);
                    }
                    child = childEl;
                }
            }
            if (slotTemplateRecord != null) {
                projections = {};
                // aggregate all content targeting the same slot
                // into a single template
                // with some special rule around <template> element
                for (targetSlot in slotTemplateRecord) {
                    template = context.t();
                    slotTemplates = slotTemplateRecord[targetSlot];
                    for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
                        slotTemplate = slotTemplates[j];
                        if (slotTemplate.nodeName === 'TEMPLATE') {
                            // this means user has some thing more than [au-slot] on a template
                            // consider this intentional, and use it as is
                            // e.g:
                            // case 1
                            // <my-element>
                            //   <template au-slot repeat.for="i of items">
                            // ----vs----
                            // case 2
                            // <my-element>
                            //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                            if (slotTemplate.attributes.length > 0) {
                                // case 1
                                appendToTemplate(template, slotTemplate);
                            }
                            else {
                                // case 2
                                appendToTemplate(template, slotTemplate.content);
                            }
                        }
                        else {
                            appendToTemplate(template, slotTemplate);
                        }
                    }
                    // after aggregating all the [au-slot] templates into a single one
                    // compile it
                    // technically, the most inner template controller compilation context
                    // is the parent of this compilation context
                    // but for simplicity in compilation, maybe start with a flatter hierarchy
                    // also, it wouldn't have any real uses
                    projectionCompilationContext = context._createChild();
                    this._compileNode(template.content, projectionCompilationContext);
                    projections[targetSlot] = {
                        name: generateElementName(),
                        type: definitionTypeElement,
                        template,
                        instructions: projectionCompilationContext.rows,
                        needsCompile: false,
                    };
                }
                elementInstruction.projections = projections;
            }
            if (needsMarker) {
                if (isCustomElement && (hasContainerless || elDef.containerless)) {
                    this._replaceByMarker(el, context);
                }
                else {
                    this._markAsTarget(el, context);
                }
            }
            shouldCompileContent = !isCustomElement || !elDef.containerless && !hasContainerless && processContentResult !== false;
            if (shouldCompileContent) {
                // 4.1.1.2:
                //  recursively compiles the child nodes into the inner context
                // important:
                // ======================
                // only goes inside a template, if there is a template controller on it
                // otherwise, leave it alone
                if (el.nodeName === TEMPLATE_NODE_NAME) {
                    this._compileNode(el.content, childContext);
                }
                else {
                    child = el.firstChild;
                    while (child !== null) {
                        child = this._compileNode(child, childContext);
                    }
                }
            }
            tcInstruction.def = {
                name: generateElementName(),
                type: definitionTypeElement,
                template: mostInnerTemplate,
                instructions: childContext.rows,
                needsCompile: false,
            };
            // 4.1.2.
            //  Start processing other Template controllers by walking the TC list (list 1) RIGHT -> LEFT
            while (i-- > 0) {
                // for each of the template controller from [right] to [left]
                // do create:
                // (1) a template
                // (2) add a marker to the template
                // (3) an instruction
                // instruction will be corresponded to the marker
                // =========================
                tcInstruction = tcInstructions[i];
                template = context.t();
                // appending most inner template is inaccurate, as the most outer one
                // is not really the parent of the most inner one
                // but it's only for the purpose of creating a marker,
                // so it's just an optimization hack
                // marker = this._markAsTarget(context.h(MARKER_NODE_NAME));
                // marker = context.h(MARKER_NODE_NAME);
                marker = context._marker();
                appendManyToTemplate(template, [
                    marker,
                    context._comment(auLocationStart),
                    context._comment(auLocationEnd),
                ]);
                tcInstruction.def = {
                    name: generateElementName(),
                    type: definitionTypeElement,
                    template,
                    needsCompile: false,
                    instructions: [[tcInstructions[i + 1]]],
                };
            }
            // the most outer template controller should be
            // the only instruction for peek instruction of the current context
            // e.g
            // <div if.bind="yes" with.bind="scope" repeat.for="i of items" data-id="i.id">
            // results in:
            // -----------
            //
            //  TC(if-[value=yes])
            //    | TC(with-[value=scope])
            //        | TC(repeat-[...])
            //            | div(data-id-[value=i.id])
            context.rows.push([tcInstruction]);
        }
        else {
            // 4.2
            //
            // if there's no template controller
            // then the instruction built is appropriate to be assigned as the peek row
            // and before the children compilation
            if (instructions != null) {
                context.rows.push(instructions);
            }
            let child = el.firstChild;
            let childEl;
            let targetSlot;
            let hasAuSlot = false;
            let projections = null;
            let slotTemplateRecord;
            let slotTemplates;
            let slotTemplate;
            let template;
            let projectionCompilationContext;
            let isEmptyTextNode = false;
            let j = 0, jj = 0;
            // 4.2.1.
            //    walks through the child nodes and perform [au-slot] check
            // --------------------
            // for each child element of a custom element
            // scan for [au-slot], if there's one
            // then extract the element into a projection definition
            // this allows support for [au-slot] declared on the same element with anther template controller
            // e.g:
            //
            // can do:
            //  <my-el>
            //    <div au-slot if.bind="..."></div>
            //    <div if.bind="..." au-slot></div>
            //  </my-el>
            //
            // instead of:
            //  <my-el>
            //    <template au-slot><div if.bind="..."></div>
            //  </my-el>
            if (processContentResult !== false) {
                while (child !== null) {
                    targetSlot = isElement(child) ? child.getAttribute(auslotAttr) : null;
                    hasAuSlot = targetSlot !== null || isCustomElement && !isShadowDom;
                    childEl = child.nextSibling;
                    if (hasAuSlot) {
                        if (!isCustomElement) {
                            throw createMappedError(706 /* ErrorNames.compiler_au_slot_on_non_element */, targetSlot, elName);
                        }
                        child.removeAttribute?.(auslotAttr);
                        // ignore all whitespace
                        isEmptyTextNode = isTextNode(child) && child.textContent.trim() === '';
                        if (!isEmptyTextNode) {
                            ((slotTemplateRecord ??= {})[targetSlot || defaultSlotName] ??= []).push(child);
                        }
                        el.removeChild(child);
                    }
                    child = childEl;
                }
            }
            if (slotTemplateRecord != null) {
                projections = {};
                // aggregate all content targeting the same slot
                // into a single template
                // with some special rule around <template> element
                for (targetSlot in slotTemplateRecord) {
                    template = context.t();
                    slotTemplates = slotTemplateRecord[targetSlot];
                    for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
                        slotTemplate = slotTemplates[j];
                        if (slotTemplate.nodeName === TEMPLATE_NODE_NAME) {
                            // this means user has some thing more than [au-slot] on a template
                            // consider this intentional, and use it as is
                            // e.g:
                            // case 1
                            // <my-element>
                            //   <template au-slot repeat.for="i of items">
                            // ----vs----
                            // case 2
                            // <my-element>
                            //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                            if (slotTemplate.attributes.length > 0) {
                                // case 1
                                appendToTemplate(template, slotTemplate);
                            }
                            else {
                                // case 2
                                appendToTemplate(template, slotTemplate.content);
                            }
                        }
                        else {
                            appendToTemplate(template, slotTemplate);
                        }
                    }
                    // after aggregating all the [au-slot] templates into a single one
                    // compile it
                    projectionCompilationContext = context._createChild();
                    this._compileNode(template.content, projectionCompilationContext);
                    projections[targetSlot] = {
                        name: generateElementName(),
                        type: definitionTypeElement,
                        template,
                        instructions: projectionCompilationContext.rows,
                        needsCompile: false,
                    };
                }
                elementInstruction.projections = projections;
            }
            if (needsMarker) {
                if (isCustomElement && (hasContainerless || elDef.containerless)) {
                    this._replaceByMarker(el, context);
                }
                else {
                    this._markAsTarget(el, context);
                }
            }
            shouldCompileContent = !isCustomElement || !elDef.containerless && !hasContainerless && processContentResult !== false;
            if (shouldCompileContent && el.childNodes.length > 0) {
                // 4.2.2
                //    recursively compiles the child nodes into current context
                child = el.firstChild;
                while (child !== null) {
                    child = this._compileNode(child, context);
                }
            }
        }
        // 5. returns the next node to be compiled
        return nextSibling;
    }
    /** @internal */
    _compileText(node, context) {
        const parent = node.parentNode;
        const expr = context._exprParser.parse(node.textContent, etInterpolation);
        const next = node.nextSibling;
        let parts;
        let expressions;
        let i;
        let ii;
        let part;
        if (expr !== null) {
            ({ parts, expressions } = expr);
            // foreach normal part, turn into a standard text node
            if ((part = parts[0])) {
                insertBefore(parent, context._text(part), node);
            }
            for (i = 0, ii = expressions.length; ii > i; ++i) {
                // foreach expression part, turn into a marker
                insertManyBefore(parent, node, [
                    // context.h(MARKER_NODE_NAME),
                    context._marker(),
                    // empty text node will not be cloned when doing fragment.cloneNode()
                    // so give it an empty space instead
                    context._text(' '),
                ]);
                // foreach normal part, turn into a standard text node
                if ((part = parts[i + 1])) {
                    insertBefore(parent, context._text(part), node);
                }
                // and the corresponding instruction
                context.rows.push([new TextBindingInstruction(expressions[i])]);
            }
            parent.removeChild(node);
        }
        return next;
    }
    /** @internal */
    _compileMultiBindings(node, attrRawValue, attrDef, context) {
        // custom attribute + multiple values:
        // my-attr="prop1: literal1 prop2.bind: ...; prop3: literal3"
        // my-attr="prop1.bind: ...; prop2.bind: ..."
        // my-attr="prop1: ${}; prop2.bind: ...; prop3: ${}"
        const bindableAttrsInfo = context._getBindables(attrDef);
        const valueLength = attrRawValue.length;
        const instructions = [];
        let attrName = void 0;
        let attrValue = void 0;
        let start = 0;
        let ch = 0;
        let expr;
        let attrSyntax;
        let command;
        let bindable;
        for (let i = 0; i < valueLength; ++i) {
            ch = attrRawValue.charCodeAt(i);
            if (ch === 92 /* Char.Backslash */) {
                ++i;
                // Ignore whatever comes next because it's escaped
            }
            else if (ch === 58 /* Char.Colon */) {
                attrName = attrRawValue.slice(start, i);
                // Skip whitespace after colon
                while (attrRawValue.charCodeAt(++i) <= 32 /* Char.Space */)
                    ;
                start = i;
                for (; i < valueLength; ++i) {
                    ch = attrRawValue.charCodeAt(i);
                    if (ch === 92 /* Char.Backslash */) {
                        ++i;
                        // Ignore whatever comes next because it's escaped
                    }
                    else if (ch === 59 /* Char.Semicolon */) {
                        attrValue = attrRawValue.slice(start, i);
                        break;
                    }
                }
                if (attrValue === void 0) {
                    // No semicolon found, so just grab the rest of the value
                    attrValue = attrRawValue.slice(start);
                }
                attrSyntax = context._attrParser.parse(attrName, attrValue);
                // ================================================
                // todo: should it always camel case???
                // const attrTarget = camelCase(attrSyntax.target);
                // ================================================
                command = context._getCommand(attrSyntax);
                bindable = bindableAttrsInfo.attrs[attrSyntax.target];
                if (bindable == null) {
                    throw createMappedError(707 /* ErrorNames.compiler_binding_to_non_bindable */, attrSyntax.target, attrDef.name);
                }
                if (command === null) {
                    expr = context._exprParser.parse(attrValue, etInterpolation);
                    instructions.push(expr === null
                        ? new SetPropertyInstruction(attrValue, bindable.name)
                        : new InterpolationInstruction(expr, bindable.name));
                }
                else {
                    commandBuildInfo.node = node;
                    commandBuildInfo.attr = attrSyntax;
                    commandBuildInfo.bindable = bindable;
                    commandBuildInfo.def = attrDef;
                    instructions.push(command.build(commandBuildInfo, context._exprParser, context._attrMapper));
                }
                // Skip whitespace after semicolon
                while (i < valueLength && attrRawValue.charCodeAt(++i) <= 32 /* Char.Space */)
                    ;
                start = i;
                attrName = void 0;
                attrValue = void 0;
            }
        }
        resetCommandBuildInfo();
        return instructions;
    }
    /** @internal */
    _compileLocalElement(template, context) {
        const elName = context.root.def.name;
        const root = template;
        const localTemplates = toArray(root.querySelectorAll('template[as-custom-element]'));
        const numLocalTemplates = localTemplates.length;
        if (numLocalTemplates === 0) {
            return;
        }
        if (numLocalTemplates === root.childElementCount) {
            throw createMappedError(708 /* ErrorNames.compiler_template_only_local_template */, elName);
        }
        const localTemplateNames = new Set();
        const localElementTypes = [];
        for (const localTemplate of localTemplates) {
            if (localTemplate.parentNode !== root) {
                throw createMappedError(709 /* ErrorNames.compiler_local_el_not_under_root */, elName);
            }
            const name = processTemplateName(elName, localTemplate, localTemplateNames);
            const content = localTemplate.content;
            const bindableEls = toArray(content.querySelectorAll('bindable'));
            const properties = new Set();
            const attributes = new Set();
            const bindables = bindableEls.reduce((allBindables, bindableEl) => {
                if (bindableEl.parentNode !== content) {
                    throw createMappedError(710 /* ErrorNames.compiler_local_el_bindable_not_under_root */, name);
                }
                const property = bindableEl.getAttribute("name" /* LocalTemplateBindableAttributes.name */);
                if (property === null) {
                    throw createMappedError(711 /* ErrorNames.compiler_local_el_bindable_name_missing */, bindableEl, name);
                }
                const attribute = bindableEl.getAttribute("attribute" /* LocalTemplateBindableAttributes.attribute */);
                if (attribute !== null
                    && attributes.has(attribute)
                    || properties.has(property)) {
                    throw createMappedError(712 /* ErrorNames.compiler_local_el_bindable_duplicate */, properties, attribute);
                }
                else {
                    if (attribute !== null) {
                        attributes.add(attribute);
                    }
                    properties.add(property);
                }
                const ignoredAttributes = toArray(bindableEl.attributes).filter((attr) => !allowedLocalTemplateBindableAttributes.includes(attr.name));
                if (ignoredAttributes.length > 0) {
                    console.warn(`[DEV:aurelia] The attribute(s) ${ignoredAttributes.map(attr => attr.name).join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
                }
                bindableEl.remove();
                allBindables[property] = {
                    name: property,
                    attribute: attribute ?? void 0,
                    mode: bindableEl.getAttribute("mode" /* LocalTemplateBindableAttributes.mode */) ?? 'default'
                };
                return allBindables;
            }, {});
            class LocalDepType {
            }
            LocalDepType.$au = {
                type: definitionTypeElement,
                name,
                template: localTemplate,
                bindables,
            };
            Reflect.defineProperty(LocalDepType, 'name', { value: pascalCase(name) });
            localElementTypes.push(LocalDepType);
            root.removeChild(localTemplate);
        }
        // if we have a template like this
        //
        // my-app.html
        // <template as-custom-element="le-1">
        //  <le-2></le-2>
        // </template>
        // <template as-custom-element="le-2">...</template>
        //
        // without registering dependencies properly, <le-1> will not see <le-2> as a custom element
        const compilationDeps = (context.root.def.dependencies ?? []).concat(context.root.def.Type == null ? emptyArray : [context.root.def.Type]);
        for (const localElementType of localElementTypes) {
            localElementType.dependencies = compilationDeps.concat(localElementTypes.filter(d => d !== localElementType));
            context._addLocalDep(localElementType);
        }
    }
    /** @internal */
    _shouldReorderAttrs(el, instructions) {
        const nodeName = el.nodeName;
        return nodeName === 'INPUT' && orderSensitiveInputType[el.type] === 1
            || nodeName === 'SELECT' && (el.hasAttribute('multiple')
                || instructions?.some(i => i.type === propertyBinding && i.to === 'multiple'));
    }
    /** @internal */
    _reorder(el, instructions) {
        switch (el.nodeName) {
            case 'INPUT': {
                const _instructions = instructions;
                // swap the order of checked and model/value attribute,
                // so that the required observers are prepared for checked-observer
                let modelOrValueOrMatcherIndex = void 0;
                let checkedIndex = void 0;
                let found = 0;
                let instruction;
                for (let i = 0; i < _instructions.length && found < 3; i++) {
                    instruction = _instructions[i];
                    switch (instruction.to) {
                        case 'model':
                        case 'value':
                        case 'matcher':
                            modelOrValueOrMatcherIndex = i;
                            found++;
                            break;
                        case 'checked':
                            checkedIndex = i;
                            found++;
                            break;
                    }
                }
                if (checkedIndex !== void 0 && modelOrValueOrMatcherIndex !== void 0 && checkedIndex < modelOrValueOrMatcherIndex) {
                    [_instructions[modelOrValueOrMatcherIndex], _instructions[checkedIndex]] = [_instructions[checkedIndex], _instructions[modelOrValueOrMatcherIndex]];
                }
                break;
            }
            case 'SELECT': {
                const _instructions = instructions;
                let valueIndex = 0;
                let multipleIndex = 0;
                // a variable to stop the loop as soon as we find both value & multiple binding indices
                let found = 0;
                let instruction;
                // swap the order of multiple and value bindings
                for (let i = 0; i < _instructions.length && found < 2; ++i) {
                    instruction = _instructions[i];
                    switch (instruction.to) {
                        case 'multiple':
                            multipleIndex = i;
                            found++;
                            break;
                        case 'value':
                            valueIndex = i;
                            found++;
                            break;
                    }
                    if (found === 2 && valueIndex < multipleIndex) {
                        [_instructions[multipleIndex], _instructions[valueIndex]] = [_instructions[valueIndex], _instructions[multipleIndex]];
                    }
                }
            }
        }
    }
    /**
     * Mark an element as target with a special css class
     * and return it
     *
     * @internal
     */
    _markAsTarget(el, context) {
        insertBefore(el.parentNode, context._comment('au*'), el);
        // el.classList.add('au');
        return el;
    }
    /**
     * Replace an element with a marker, and return the marker
     *
     * @internal
     */
    _replaceByMarker(node, context) {
        if (isMarker(node)) {
            return node;
        }
        // todo: assumption made: parentNode won't be null
        const parent = node.parentNode;
        // const marker = this._markAsTarget(context.h(MARKER_NODE_NAME));
        const marker = context._marker();
        // insertBefore(parent, marker, node);
        insertManyBefore(parent, node, [
            marker,
            context._comment(auLocationStart),
            context._comment(auLocationEnd),
        ]);
        parent.removeChild(node);
        return marker;
    }
}
TemplateCompiler.register = createImplementationRegister(ITemplateCompiler);
const TEMPLATE_NODE_NAME = 'TEMPLATE';
const isMarker = (el) => el.nodeValue === 'au*';
// && isComment(nextSibling = el.nextSibling) && nextSibling.textContent === auStartComment
// && isComment(nextSibling = el.nextSibling) && nextSibling.textContent === auEndComment;
// const isComment = (el: Node | null): el is Comment => el?.nodeType === 8;
// this class is intended to be an implementation encapsulating the information at the root level of a template
// this works at the time this is created because everything inside a template should be retrieved
// from the root itself.
// if anytime in the future, where it's desirable to retrieve information from somewhere other than root
// then consider dropping this
// goal: hide the root container, and all the resources finding calls
class CompilationContext {
    constructor(def, container, parent, root, instructions) {
        this.hasSlot = false;
        this.deps = null;
        const hasParent = parent !== null;
        this.c = container;
        this.root = root === null ? this : root;
        this.def = def;
        this.parent = parent;
        this._resourceResolver = hasParent ? parent._resourceResolver : container.get(IResourceResolver);
        this._commandResolver = hasParent ? parent._commandResolver : container.get(IBindingCommandResolver);
        this._templateFactory = hasParent ? parent._templateFactory : container.get(ITemplateElementFactory);
        // todo: attr parser should be retrieved based in resource semantic (current leaf + root + ignore parent)
        this._attrParser = hasParent ? parent._attrParser : container.get(IAttributeParser);
        this._exprParser = hasParent ? parent._exprParser : container.get(IExpressionParser);
        this._attrMapper = hasParent ? parent._attrMapper : container.get(IAttrMapper);
        this._logger = hasParent ? parent._logger : container.get(ILogger);
        if (typeof (this.p = hasParent ? parent.p : container.get(IPlatform)).document?.nodeType !== 'number') {
            throw createMappedError(722 /* ErrorNames.compiler_no_dom_api */);
        }
        this.localEls = hasParent ? parent.localEls : new Set();
        this.rows = instructions ?? [];
    }
    _addLocalDep(Type) {
        (this.root.deps ??= []).push(Type);
        this.root.c.register(Type);
        return this;
    }
    _text(text) {
        return this.p.document.createTextNode(text);
    }
    _comment(text) {
        return this.p.document.createComment(text);
    }
    _marker() {
        return this._comment('au*');
    }
    h(name) {
        const el = this.p.document.createElement(name);
        if (name === 'template') {
            this.p.document.adoptNode(el.content);
        }
        return el;
    }
    t() {
        return this.h('template');
    }
    /**
     * Find the custom element definition of a given name
     */
    _findElement(name) {
        return this._resourceResolver.el(this.c, name);
    }
    /**
     * Find the custom attribute definition of a given name
     */
    _findAttr(name) {
        return this._resourceResolver.attr(this.c, name);
    }
    _getBindables(def) {
        return this._resourceResolver.bindables(def);
    }
    /**
     * Create a new child compilation context
     */
    _createChild(instructions) {
        return new CompilationContext(this.def, this.c, this, this.root, instructions);
    }
    /**
     * Retrieve a binding command resource instance.
     *
     * @param name - The parsed `AttrSyntax`
     *
     * @returns An instance of the command if it exists, or `null` if it does not exist.
     */
    _getCommand(syntax) {
        const name = syntax.command;
        if (name === null) {
            return null;
        }
        return this._commandResolver.get(this.c, name);
    }
}
const hasInlineBindings = (rawValue) => {
    const len = rawValue.length;
    let ch = 0;
    let i = 0;
    while (len > i) {
        ch = rawValue.charCodeAt(i);
        if (ch === 92 /* Char.Backslash */) {
            ++i;
            // Ignore whatever comes next because it's escaped
        }
        else if (ch === 58 /* Char.Colon */) {
            return true;
        }
        else if (ch === 36 /* Char.Dollar */ && rawValue.charCodeAt(i + 1) === 123 /* Char.OpenBrace */) {
            return false;
        }
        ++i;
    }
    return false;
};
const resetCommandBuildInfo = () => {
    commandBuildInfo.node
        = commandBuildInfo.attr
            = commandBuildInfo.bindable
                = commandBuildInfo.def = null;
};
const voidDefinition = { name: 'unnamed', type: definitionTypeElement };
const commandBuildInfo = {
    node: null,
    attr: null,
    bindable: null,
    def: null,
};
const invalidSurrogateAttribute = {
    'id': true,
    'name': true,
    'au-slot': true,
    'as-element': true,
};
const orderSensitiveInputType = {
    checkbox: 1,
    radio: 1,
    // todo: range is also sensitive to order, for min/max
};
const IResourceResolver = /*@__PURE__*/ tcCreateInterface('IResourceResolver');
const IBindingCommandResolver = /*@__PURE__*/ tcCreateInterface('IBindingCommandResolver', x => {
    class DefaultBindingCommandResolver {
        constructor() {
            this._cache = new WeakMap();
        }
        get(c, name) {
            let record = this._cache.get(c);
            if (!record) {
                this._cache.set(c, record = {});
            }
            return name in record ? record[name] : (record[name] = BindingCommand.get(c, name));
        }
    }
    return x.singleton(DefaultBindingCommandResolver);
});

const allowedLocalTemplateBindableAttributes = tcObjectFreeze([
    "name" /* LocalTemplateBindableAttributes.name */,
    "attribute" /* LocalTemplateBindableAttributes.attribute */,
    "mode" /* LocalTemplateBindableAttributes.mode */
]);
const localTemplateIdentifier = 'as-custom-element';
const processTemplateName = (owningElementName, localTemplate, localTemplateNames) => {
    const name = localTemplate.getAttribute(localTemplateIdentifier);
    if (name === null || name === '') {
        throw createMappedError(715 /* ErrorNames.compiler_local_name_empty */, owningElementName);
    }
    if (localTemplateNames.has(name)) {
        throw createMappedError(716 /* ErrorNames.compiler_duplicate_local_name */, name, owningElementName);
    }
    else {
        localTemplateNames.add(name);
        localTemplate.removeAttribute(localTemplateIdentifier);
    }
    return name;
};
/**
 * An interface describing the hooks a compilation process should invoke.
 *
 * A feature available to the default template compiler.
 */
const ITemplateCompilerHooks = /*@__PURE__*/ tcCreateInterface('ITemplateCompilerHooks');
const TemplateCompilerHooks = tcObjectFreeze({
    name: /*@__PURE__*/ getResourceKeyFor('compiler-hooks'),
    define(Type) {
        return {
            register(container) {
                singletonRegistration(ITemplateCompilerHooks, Type).register(container);
            }
        };
    },
    findAll(container) {
        return container.get(allResources(ITemplateCompilerHooks));
    }
});
/**
 * Decorator: Indicates that the decorated class is a template compiler hooks.
 *
 * An instance of this class will be created and appropriate compilation hooks will be invoked
 * at different phases of the default compiler.
 */
/* eslint-disable */
// deepscan-disable-next-line
const templateCompilerHooks = (target, context) => {
    return target === void 0 ? decorator : decorator(target, context);
    function decorator(t, context) {
        context.metadata[registrableMetadataKey] = TemplateCompilerHooks.define(t);
        return t;
    }
};

export { AtPrefixedTriggerAttributePattern, AttrBindingCommand, AttrSyntax, AttributeBindingInstruction, AttributeParser, AttributePattern, BindingCommand, BindingCommandDefinition, BindingMode, CaptureBindingCommand, ClassBindingCommand, ColonPrefixedBindAttributePattern, DefaultBindingCommand, DotSeparatedAttributePattern, EventAttributePattern, ForBindingCommand, FromViewBindingCommand, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, IAttrMapper, IAttributeParser, IAttributePattern, IBindingCommandResolver, IInstruction, IResourceResolver, ISyntaxInterpreter, ITemplateCompiler, ITemplateCompilerHooks, ITemplateElementFactory, InstructionType, InterpolationInstruction, Interpretation, IteratorBindingInstruction, LetBindingInstruction, ListenerBindingInstruction, MultiAttrInstruction, OneTimeBindingCommand, PropertyBindingInstruction, RefAttributePattern, RefBindingCommand, RefBindingInstruction, SetAttributeInstruction, SetClassAttributeInstruction, SetPropertyInstruction, SetStyleAttributeInstruction, SpreadElementPropBindingInstruction, SpreadTransferedBindingInstruction, SpreadValueBindingCommand, SpreadValueBindingInstruction, StyleBindingCommand, StylePropertyBindingInstruction, SyntaxInterpreter, TemplateCompiler, TemplateCompilerHooks, TextBindingInstruction, ToViewBindingCommand, TriggerBindingCommand, TwoWayBindingCommand, attributePattern, bindingCommand, generateElementName, templateCompilerHooks };
//# sourceMappingURL=index.dev.mjs.map
