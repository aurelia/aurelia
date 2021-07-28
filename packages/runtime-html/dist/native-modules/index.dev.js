export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from '../../../platform/dist/native-modules/index.js';
import { BrowserPlatform } from '../../../platform-browser/dist/native-modules/index.js';
export { BrowserPlatform } from '../../../platform-browser/dist/native-modules/index.js';
import { Protocol, getPrototypeChain, Metadata, firstDefined, kebabCase, noop, emptyArray, DI, all, Registration, IPlatform as IPlatform$1, mergeArrays, fromDefinitionOrDefault, pascalCase, fromAnnotationOrTypeOrDefault, fromAnnotationOrDefinitionOrTypeOrDefault, IContainer, nextId, optional, InstanceProvider, ILogger, isObject, onResolve, resolveAll, camelCase, toArray, emptyObject, IServiceLocator, compareNumber, transient } from '../../../kernel/dist/native-modules/index.js';
import { BindingMode, subscriberCollection, withFlushQueue, connectable, registerAliases, ConnectableSwitcher, ProxyObservable, Scope, IObserverLocator, IExpressionParser, AccessScopeExpression, DelegationStrategy, BindingBehaviorExpression, BindingBehaviorFactory, PrimitiveLiteralExpression, bindingBehavior, BindingInterceptor, ISignaler, PropertyAccessor, INodeObserverLocator, SetterObserver, IDirtyChecker, alias, applyMutationsToIndices, getCollectionObserver as getCollectionObserver$1, BindingContext, synchronizeIndices, valueConverter } from '../../../runtime/dist/native-modules/index.js';
export { Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, BindingMode, BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, Char, CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, CustomExpression, DelegationStrategy, DirtyCheckProperty, DirtyCheckSettings, ExpressionKind, ForOfStatement, HtmlLiteralExpression, IDirtyChecker, IExpressionParser, INodeObserverLocator, IObserverLocator, ISignaler, Interpolation, LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, ObserverLocator, OverrideContext, Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, Scope, SetObserver, SetterObserver, TaggedTemplateExpression, TemplateExpression, UnaryExpression, ValueConverter, ValueConverterDefinition, ValueConverterExpression, alias, applyMutationsToIndices, bindingBehavior, cloneIndexMap, connectable, copyIndexMap, createIndexMap, disableArrayObservation, disableMapObservation, disableSetObservation, enableArrayObservation, enableMapObservation, enableSetObservation, getCollectionObserver, isIndexMap, observable, parseExpression, registerAliases, subscriberCollection, synchronizeIndices, valueConverter } from '../../../runtime/dist/native-modules/index.js';

/*! *****************************************************************************
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

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function bindable(configOrTarget, prop) {
    let config;
    function decorator($target, $prop) {
        if (arguments.length > 1) {
            // Non invocation:
            // - @bindable
            // Invocation with or w/o opts:
            // - @bindable()
            // - @bindable({...opts})
            config.property = $prop;
        }
        Metadata.define(baseName$1, BindableDefinition.create($prop, config), $target.constructor, $prop);
        Protocol.annotation.appendTo($target.constructor, Bindable.keyFrom($prop));
    }
    if (arguments.length > 1) {
        // Non invocation:
        // - @bindable
        config = {};
        decorator(configOrTarget, prop);
        return;
    }
    else if (typeof configOrTarget === 'string') {
        // ClassDecorator
        // - @bindable('bar')
        // Direct call:
        // - @bindable('bar')(Foo)
        config = {};
        return decorator;
    }
    // Invocation with or w/o opts:
    // - @bindable()
    // - @bindable({...opts})
    config = configOrTarget === void 0 ? {} : configOrTarget;
    return decorator;
}
function isBindableAnnotation(key) {
    return key.startsWith(baseName$1);
}
const baseName$1 = Protocol.annotation.keyFor('bindable');
const Bindable = Object.freeze({
    name: baseName$1,
    keyFrom(name) {
        return `${baseName$1}:${name}`;
    },
    from(...bindableLists) {
        const bindables = {};
        const isArray = Array.isArray;
        function addName(name) {
            bindables[name] = BindableDefinition.create(name);
        }
        function addDescription(name, def) {
            bindables[name] = def instanceof BindableDefinition ? def : BindableDefinition.create(name, def);
        }
        function addList(maybeList) {
            if (isArray(maybeList)) {
                maybeList.forEach(addName);
            }
            else if (maybeList instanceof BindableDefinition) {
                bindables[maybeList.property] = maybeList;
            }
            else if (maybeList !== void 0) {
                Object.keys(maybeList).forEach(name => addDescription(name, maybeList[name]));
            }
        }
        bindableLists.forEach(addList);
        return bindables;
    },
    for(Type) {
        let def;
        const builder = {
            add(configOrProp) {
                let prop;
                let config;
                if (typeof configOrProp === 'string') {
                    prop = configOrProp;
                    config = { property: prop };
                }
                else {
                    prop = configOrProp.property;
                    config = configOrProp;
                }
                def = BindableDefinition.create(prop, config);
                if (!Metadata.hasOwn(baseName$1, Type, prop)) {
                    Protocol.annotation.appendTo(Type, Bindable.keyFrom(prop));
                }
                Metadata.define(baseName$1, def, Type, prop);
                return builder;
            },
            mode(mode) {
                def.mode = mode;
                return builder;
            },
            callback(callback) {
                def.callback = callback;
                return builder;
            },
            attribute(attribute) {
                def.attribute = attribute;
                return builder;
            },
            primary() {
                def.primary = true;
                return builder;
            },
            set(setInterpreter) {
                def.set = setInterpreter;
                return builder;
            }
        };
        return builder;
    },
    getAll(Type) {
        const propStart = baseName$1.length + 1;
        const defs = [];
        const prototypeChain = getPrototypeChain(Type);
        let iProto = prototypeChain.length;
        let iDefs = 0;
        let keys;
        let keysLen;
        let Class;
        let i;
        while (--iProto >= 0) {
            Class = prototypeChain[iProto];
            keys = Protocol.annotation.getKeys(Class).filter(isBindableAnnotation);
            keysLen = keys.length;
            for (i = 0; i < keysLen; ++i) {
                defs[iDefs++] = Metadata.getOwn(baseName$1, Class, keys[i].slice(propStart));
            }
        }
        return defs;
    },
});
class BindableDefinition {
    constructor(attribute, callback, mode, primary, property, set) {
        this.attribute = attribute;
        this.callback = callback;
        this.mode = mode;
        this.primary = primary;
        this.property = property;
        this.set = set;
    }
    static create(prop, def = {}) {
        return new BindableDefinition(firstDefined(def.attribute, kebabCase(prop)), firstDefined(def.callback, `${prop}Changed`), firstDefined(def.mode, BindingMode.toView), firstDefined(def.primary, false), firstDefined(def.property, prop), firstDefined(def.set, noop));
    }
}
/* eslint-enable @typescript-eslint/no-unused-vars,spaced-comment */

class BindableObserver {
    constructor(obj, key, cbName, set, 
    // todo: a future feature where the observer is not instantiated via a controller
    // this observer can become more static, as in immediately available when used
    // in the form of a decorator
    $controller) {
        this.obj = obj;
        this.key = key;
        this.set = set;
        this.$controller = $controller;
        // todo: name too long. just value/oldValue, or v/oV
        this.value = void 0;
        /** @internal */
        this._oldValue = void 0;
        this.f = 0 /* none */;
        const cb = obj[cbName];
        const cbAll = obj.propertyChanged;
        const hasCb = this._hasCb = typeof cb === 'function';
        const hasCbAll = this._hasCbAll = typeof cbAll === 'function';
        const hasSetter = this._hasSetter = set !== noop;
        this.cb = hasCb ? cb : noop;
        this._cbAll = hasCbAll ? cbAll : noop;
        // when user declare @bindable({ set })
        // it's expected to work from the start,
        // regardless where the assignment comes from: either direct view model assignment or from binding during render
        // so if either getter/setter config is present, alter the accessor straight await
        if (this.cb === void 0 && !hasCbAll && !hasSetter) {
            this._observing = false;
        }
        else {
            this._observing = true;
            const val = obj[key];
            this.value = hasSetter && val !== void 0 ? set(val) : val;
            this._createGetterSetter();
        }
    }
    get type() { return 1 /* Observer */; }
    getValue() {
        return this.value;
    }
    setValue(newValue, flags) {
        if (this._hasSetter) {
            newValue = this.set(newValue);
        }
        if (this._observing) {
            const currentValue = this.value;
            if (Object.is(newValue, currentValue)) {
                return;
            }
            this.value = newValue;
            this._oldValue = currentValue;
            this.f = flags;
            // todo: controller (if any) state should determine the invocation instead
            if ( /* either not instantiated via a controller */this.$controller == null
                /* or the controller instantiating this is bound */ || this.$controller.isBound) {
                if (this._hasCb) {
                    this.cb.call(this.obj, newValue, currentValue, flags);
                }
                if (this._hasCbAll) {
                    this._cbAll.call(this.obj, this.key, newValue, currentValue, flags);
                }
            }
            this.queue.add(this);
            // this.subs.notify(newValue, currentValue, flags);
        }
        else {
            // See SetterObserver.setValue for explanation
            this.obj[this.key] = newValue;
        }
    }
    subscribe(subscriber) {
        if (!this._observing === false) {
            this._observing = true;
            const currentValue = this.obj[this.key];
            this.value = this._hasSetter
                ? this.set(currentValue)
                : currentValue;
            this._createGetterSetter();
        }
        this.subs.add(subscriber);
    }
    flush() {
        oV$4 = this._oldValue;
        this._oldValue = this.value;
        this.subs.notify(this.value, oV$4, this.f);
    }
    /** @internal */
    _createGetterSetter() {
        Reflect.defineProperty(this.obj, this.key, {
            enumerable: true,
            configurable: true,
            get: ( /* Bindable Observer */) => this.value,
            set: (/* Bindable Observer */ value) => {
                this.setValue(value, 0 /* none */);
            }
        });
    }
}
subscriberCollection(BindableObserver);
withFlushQueue(BindableObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$4 = void 0;

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
    _hasOfMultiple(char) {
        return this.chars.includes(char);
    }
    _hasOfSingle(char) {
        return this.chars === char;
    }
    _hasOfNone(char) {
        return false;
    }
    _hasOfMultipleInverse(char) {
        return !this.chars.includes(char);
    }
    _hasOfSingleInverse(char) {
        return this.chars !== char;
    }
    _hasOfNoneInverse(char) {
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
/** @internal */
class State$1 {
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
        const patterns = this.patterns;
        if (!patterns.includes(pattern)) {
            patterns.push(pattern);
        }
        let state = this.findChild(charSpec);
        if (state == null) {
            state = new State$1(charSpec, pattern);
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
/** @internal */
class StaticSegment {
    constructor(text) {
        this.text = text;
        const len = this.len = text.length;
        const specs = this.specs = [];
        let i = 0;
        for (; len > i; ++i) {
            specs.push(new CharSpec(text[i], false, false, false));
        }
    }
    eachChar(callback) {
        const len = this.len;
        const specs = this.specs;
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
        this.spec = new CharSpec(symbols, true, false, true);
    }
    eachChar(callback) {
        callback(this.spec);
    }
}
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
class SegmentTypes {
    constructor() {
        this.statics = 0;
        this.dynamics = 0;
        this.symbols = 0;
    }
}
const ISyntaxInterpreter = DI.createInterface('ISyntaxInterpreter', x => x.singleton(SyntaxInterpreter));
class SyntaxInterpreter {
    constructor() {
        this.rootState = new State$1(null);
        this.initialStates = [this.rootState];
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
            currentState = this.rootState;
            def = defs[i];
            pattern = def.pattern;
            types = new SegmentTypes();
            segments = this.parse(def, types);
            len = segments.length;
            charSpecCb = (ch) => {
                currentState = currentState.append(ch, pattern);
            };
            for (j = 0; len > j; ++j) {
                segments[j].eachChar(charSpecCb);
            }
            currentState.types = types;
            currentState.isEndpoint = true;
            ++i;
        }
    }
    interpret(name) {
        const interpretation = new Interpretation();
        const len = name.length;
        let states = this.initialStates;
        let i = 0;
        let state;
        for (; i < len; ++i) {
            states = this.getNextStates(states, name.charAt(i), interpretation);
            if (states.length === 0) {
                break;
            }
        }
        states = states.filter(isEndpoint);
        if (states.length > 0) {
            states.sort(sortEndpoint);
            state = states[0];
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
        let i = 0;
        for (; i < len; ++i) {
            state = states[i];
            nextStates.push(...state.findMatches(ch, interpretation));
        }
        return nextStates;
    }
    parse(def, types) {
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
    return a.isEndpoint;
}
function sortEndpoint(a, b) {
    // both a and b are endpoints
    // compare them based on the number of static, then dynamic & symbol fragments
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
}
class AttrSyntax {
    constructor(rawName, rawValue, target, command) {
        this.rawName = rawName;
        this.rawValue = rawValue;
        this.target = target;
        this.command = command;
    }
}
const IAttributePattern = DI.createInterface('IAttributePattern');
const IAttributeParser = DI.createInterface('IAttributeParser', x => x.singleton(AttributeParser));
class AttributeParser {
    constructor(interpreter, attrPatterns) {
        /** @internal */
        this._cache = {};
        this._interpreter = interpreter;
        const patterns = this._patterns = {};
        const allDefs = attrPatterns.reduce((allDefs, attrPattern) => {
            const patternDefs = AttributePattern.getPatternDefinitions(attrPattern.constructor);
            patternDefs.forEach(def => patterns[def.pattern] = attrPattern);
            return allDefs.concat(patternDefs);
        }, emptyArray);
        interpreter.add(allDefs);
    }
    parse(name, value) {
        let interpretation = this._cache[name];
        if (interpretation == null) {
            interpretation = this._cache[name] = this._interpreter.interpret(name);
        }
        const pattern = interpretation.pattern;
        if (pattern == null) {
            return new AttrSyntax(name, value, name, null);
        }
        else {
            return this._patterns[pattern][pattern](name, value, interpretation.parts);
        }
    }
}
/** @internal */
AttributeParser.inject = [ISyntaxInterpreter, all(IAttributePattern)];
function attributePattern(...patternDefs) {
    return function decorator(target) {
        return AttributePattern.define(patternDefs, target);
    };
}
class AttributePatternResourceDefinition {
    constructor(Type) {
        this.Type = Type;
        this.name = (void 0);
    }
    register(container) {
        Registration.singleton(IAttributePattern, this.Type).register(container);
    }
}
const apBaseName = Protocol.resource.keyFor('attribute-pattern');
const annotationKey = 'attribute-pattern-definitions';
const AttributePattern = Object.freeze({
    name: apBaseName,
    definitionAnnotationKey: annotationKey,
    define(patternDefs, Type) {
        const definition = new AttributePatternResourceDefinition(Type);
        Metadata.define(apBaseName, definition, Type);
        Protocol.resource.appendTo(Type, apBaseName);
        Protocol.annotation.set(Type, annotationKey, patternDefs);
        Protocol.annotation.appendTo(Type, annotationKey);
        return Type;
    },
    getPatternDefinitions(Type) {
        return Protocol.annotation.get(Type, annotationKey);
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
let ColonPrefixedBindAttributePattern = class ColonPrefixedBindAttributePattern {
    ':PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
    }
};
ColonPrefixedBindAttributePattern = __decorate([
    attributePattern({ pattern: ':PART', symbols: ':' })
], ColonPrefixedBindAttributePattern);
let AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
    '@PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
    }
};
AtPrefixedTriggerAttributePattern = __decorate([
    attributePattern({ pattern: '@PART', symbols: '@' })
], AtPrefixedTriggerAttributePattern);

const createLookup = () => Object.create(null);
const hasOwnProperty = Object.prototype.hasOwnProperty;
const IsDataAttribute = createLookup();
const isDataAttribute = (obj, key, svgAnalyzer) => {
    if (IsDataAttribute[key] === true) {
        return true;
    }
    if (typeof key !== 'string') {
        return false;
    }
    const prefix = key.slice(0, 5);
    // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
    // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
    return IsDataAttribute[key] =
        prefix === 'aria-' ||
            prefix === 'data-' ||
            svgAnalyzer.isStandardSvgAttribute(obj, key);
};

const IPlatform = IPlatform$1;

const ISVGAnalyzer = DI.createInterface('ISVGAnalyzer', x => x.singleton(NoopSVGAnalyzer));
class NoopSVGAnalyzer {
    isStandardSvgAttribute(node, attributeName) {
        return false;
    }
}
function o(keys) {
    const lookup = createLookup();
    let key;
    for (key of keys) {
        lookup[key] = true;
    }
    return lookup;
}
class SVGAnalyzer {
    constructor(platform) {
        /** @internal */
        this._svgElements = Object.assign(createLookup(), {
            'a': o(['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'target', 'transform', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'altGlyph': o(['class', 'dx', 'dy', 'externalResourcesRequired', 'format', 'glyphRef', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'altglyph': createLookup(),
            'altGlyphDef': o(['id', 'xml:base', 'xml:lang', 'xml:space']),
            'altglyphdef': createLookup(),
            'altGlyphItem': o(['id', 'xml:base', 'xml:lang', 'xml:space']),
            'altglyphitem': createLookup(),
            'animate': o(['accumulate', 'additive', 'attributeName', 'attributeType', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'animateColor': o(['accumulate', 'additive', 'attributeName', 'attributeType', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'animateMotion': o(['accumulate', 'additive', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keyPoints', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'origin', 'path', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'rotate', 'systemLanguage', 'to', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'animateTransform': o(['accumulate', 'additive', 'attributeName', 'attributeType', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'type', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'circle': o(['class', 'cx', 'cy', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'r', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space']),
            'clipPath': o(['class', 'clipPathUnits', 'externalResourcesRequired', 'id', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space']),
            'color-profile': o(['id', 'local', 'name', 'rendering-intent', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'cursor': o(['externalResourcesRequired', 'id', 'requiredExtensions', 'requiredFeatures', 'systemLanguage', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'defs': o(['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space']),
            'desc': o(['class', 'id', 'style', 'xml:base', 'xml:lang', 'xml:space']),
            'ellipse': o(['class', 'cx', 'cy', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rx', 'ry', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space']),
            'feBlend': o(['class', 'height', 'id', 'in', 'in2', 'mode', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feColorMatrix': o(['class', 'height', 'id', 'in', 'result', 'style', 'type', 'values', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feComponentTransfer': o(['class', 'height', 'id', 'in', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feComposite': o(['class', 'height', 'id', 'in', 'in2', 'k1', 'k2', 'k3', 'k4', 'operator', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feConvolveMatrix': o(['bias', 'class', 'divisor', 'edgeMode', 'height', 'id', 'in', 'kernelMatrix', 'kernelUnitLength', 'order', 'preserveAlpha', 'result', 'style', 'targetX', 'targetY', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feDiffuseLighting': o(['class', 'diffuseConstant', 'height', 'id', 'in', 'kernelUnitLength', 'result', 'style', 'surfaceScale', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feDisplacementMap': o(['class', 'height', 'id', 'in', 'in2', 'result', 'scale', 'style', 'width', 'x', 'xChannelSelector', 'xml:base', 'xml:lang', 'xml:space', 'y', 'yChannelSelector']),
            'feDistantLight': o(['azimuth', 'elevation', 'id', 'xml:base', 'xml:lang', 'xml:space']),
            'feFlood': o(['class', 'height', 'id', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feFuncA': o(['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space']),
            'feFuncB': o(['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space']),
            'feFuncG': o(['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space']),
            'feFuncR': o(['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space']),
            'feGaussianBlur': o(['class', 'height', 'id', 'in', 'result', 'stdDeviation', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feImage': o(['class', 'externalResourcesRequired', 'height', 'id', 'preserveAspectRatio', 'result', 'style', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feMerge': o(['class', 'height', 'id', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feMergeNode': o(['id', 'xml:base', 'xml:lang', 'xml:space']),
            'feMorphology': o(['class', 'height', 'id', 'in', 'operator', 'radius', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feOffset': o(['class', 'dx', 'dy', 'height', 'id', 'in', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'fePointLight': o(['id', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y', 'z']),
            'feSpecularLighting': o(['class', 'height', 'id', 'in', 'kernelUnitLength', 'result', 'specularConstant', 'specularExponent', 'style', 'surfaceScale', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feSpotLight': o(['id', 'limitingConeAngle', 'pointsAtX', 'pointsAtY', 'pointsAtZ', 'specularExponent', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y', 'z']),
            'feTile': o(['class', 'height', 'id', 'in', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'feTurbulence': o(['baseFrequency', 'class', 'height', 'id', 'numOctaves', 'result', 'seed', 'stitchTiles', 'style', 'type', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'filter': o(['class', 'externalResourcesRequired', 'filterRes', 'filterUnits', 'height', 'id', 'primitiveUnits', 'style', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'font': o(['class', 'externalResourcesRequired', 'horiz-adv-x', 'horiz-origin-x', 'horiz-origin-y', 'id', 'style', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'xml:base', 'xml:lang', 'xml:space']),
            'font-face': o(['accent-height', 'alphabetic', 'ascent', 'bbox', 'cap-height', 'descent', 'font-family', 'font-size', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'hanging', 'id', 'ideographic', 'mathematical', 'overline-position', 'overline-thickness', 'panose-1', 'slope', 'stemh', 'stemv', 'strikethrough-position', 'strikethrough-thickness', 'underline-position', 'underline-thickness', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'widths', 'x-height', 'xml:base', 'xml:lang', 'xml:space']),
            'font-face-format': o(['id', 'string', 'xml:base', 'xml:lang', 'xml:space']),
            'font-face-name': o(['id', 'name', 'xml:base', 'xml:lang', 'xml:space']),
            'font-face-src': o(['id', 'xml:base', 'xml:lang', 'xml:space']),
            'font-face-uri': o(['id', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'foreignObject': o(['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'g': o(['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space']),
            'glyph': o(['arabic-form', 'class', 'd', 'glyph-name', 'horiz-adv-x', 'id', 'lang', 'orientation', 'style', 'unicode', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'xml:base', 'xml:lang', 'xml:space']),
            'glyphRef': o(['class', 'dx', 'dy', 'format', 'glyphRef', 'id', 'style', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'glyphref': createLookup(),
            'hkern': o(['g1', 'g2', 'id', 'k', 'u1', 'u2', 'xml:base', 'xml:lang', 'xml:space']),
            'image': o(['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'preserveAspectRatio', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'line': o(['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'x1', 'x2', 'xml:base', 'xml:lang', 'xml:space', 'y1', 'y2']),
            'linearGradient': o(['class', 'externalResourcesRequired', 'gradientTransform', 'gradientUnits', 'id', 'spreadMethod', 'style', 'x1', 'x2', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y1', 'y2']),
            'marker': o(['class', 'externalResourcesRequired', 'id', 'markerHeight', 'markerUnits', 'markerWidth', 'orient', 'preserveAspectRatio', 'refX', 'refY', 'style', 'viewBox', 'xml:base', 'xml:lang', 'xml:space']),
            'mask': o(['class', 'externalResourcesRequired', 'height', 'id', 'maskContentUnits', 'maskUnits', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'metadata': o(['id', 'xml:base', 'xml:lang', 'xml:space']),
            'missing-glyph': o(['class', 'd', 'horiz-adv-x', 'id', 'style', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'xml:base', 'xml:lang', 'xml:space']),
            'mpath': o(['externalResourcesRequired', 'id', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'path': o(['class', 'd', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'pathLength', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space']),
            'pattern': o(['class', 'externalResourcesRequired', 'height', 'id', 'patternContentUnits', 'patternTransform', 'patternUnits', 'preserveAspectRatio', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'viewBox', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'polygon': o(['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'points', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space']),
            'polyline': o(['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'points', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space']),
            'radialGradient': o(['class', 'cx', 'cy', 'externalResourcesRequired', 'fx', 'fy', 'gradientTransform', 'gradientUnits', 'id', 'r', 'spreadMethod', 'style', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'rect': o(['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rx', 'ry', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'script': o(['externalResourcesRequired', 'id', 'type', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'set': o(['attributeName', 'attributeType', 'begin', 'dur', 'end', 'externalResourcesRequired', 'fill', 'id', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'stop': o(['class', 'id', 'offset', 'style', 'xml:base', 'xml:lang', 'xml:space']),
            'style': o(['id', 'media', 'title', 'type', 'xml:base', 'xml:lang', 'xml:space']),
            'svg': o(['baseProfile', 'class', 'contentScriptType', 'contentStyleType', 'externalResourcesRequired', 'height', 'id', 'onabort', 'onactivate', 'onclick', 'onerror', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onresize', 'onscroll', 'onunload', 'onzoom', 'preserveAspectRatio', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'version', 'viewBox', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y', 'zoomAndPan']),
            'switch': o(['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space']),
            'symbol': o(['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'preserveAspectRatio', 'style', 'viewBox', 'xml:base', 'xml:lang', 'xml:space']),
            'text': o(['class', 'dx', 'dy', 'externalResourcesRequired', 'id', 'lengthAdjust', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'textLength', 'transform', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'textPath': o(['class', 'externalResourcesRequired', 'id', 'lengthAdjust', 'method', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'spacing', 'startOffset', 'style', 'systemLanguage', 'textLength', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'title': o(['class', 'id', 'style', 'xml:base', 'xml:lang', 'xml:space']),
            'tref': o(['class', 'dx', 'dy', 'externalResourcesRequired', 'id', 'lengthAdjust', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'textLength', 'x', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'tspan': o(['class', 'dx', 'dy', 'externalResourcesRequired', 'id', 'lengthAdjust', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'textLength', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'use': o(['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'view': o(['externalResourcesRequired', 'id', 'preserveAspectRatio', 'viewBox', 'viewTarget', 'xml:base', 'xml:lang', 'xml:space', 'zoomAndPan']),
            'vkern': o(['g1', 'g2', 'id', 'k', 'u1', 'u2', 'xml:base', 'xml:lang', 'xml:space']),
        });
        /** @internal */
        this._svgPresentationElements = o([
            'a',
            'altGlyph',
            'animate',
            'animateColor',
            'circle',
            'clipPath',
            'defs',
            'ellipse',
            'feBlend',
            'feColorMatrix',
            'feComponentTransfer',
            'feComposite',
            'feConvolveMatrix',
            'feDiffuseLighting',
            'feDisplacementMap',
            'feFlood',
            'feGaussianBlur',
            'feImage',
            'feMerge',
            'feMorphology',
            'feOffset',
            'feSpecularLighting',
            'feTile',
            'feTurbulence',
            'filter',
            'font',
            'foreignObject',
            'g',
            'glyph',
            'glyphRef',
            'image',
            'line',
            'linearGradient',
            'marker',
            'mask',
            'missing-glyph',
            'path',
            'pattern',
            'polygon',
            'polyline',
            'radialGradient',
            'rect',
            'stop',
            'svg',
            'switch',
            'symbol',
            'text',
            'textPath',
            'tref',
            'tspan',
            'use',
        ]);
        /** @internal */
        this._svgPresentationAttributes = o([
            'alignment-baseline',
            'baseline-shift',
            'clip-path',
            'clip-rule',
            'clip',
            'color-interpolation-filters',
            'color-interpolation',
            'color-profile',
            'color-rendering',
            'color',
            'cursor',
            'direction',
            'display',
            'dominant-baseline',
            'enable-background',
            'fill-opacity',
            'fill-rule',
            'fill',
            'filter',
            'flood-color',
            'flood-opacity',
            'font-family',
            'font-size-adjust',
            'font-size',
            'font-stretch',
            'font-style',
            'font-variant',
            'font-weight',
            'glyph-orientation-horizontal',
            'glyph-orientation-vertical',
            'image-rendering',
            'kerning',
            'letter-spacing',
            'lighting-color',
            'marker-end',
            'marker-mid',
            'marker-start',
            'mask',
            'opacity',
            'overflow',
            'pointer-events',
            'shape-rendering',
            'stop-color',
            'stop-opacity',
            'stroke-dasharray',
            'stroke-dashoffset',
            'stroke-linecap',
            'stroke-linejoin',
            'stroke-miterlimit',
            'stroke-opacity',
            'stroke-width',
            'stroke',
            'text-anchor',
            'text-decoration',
            'text-rendering',
            'unicode-bidi',
            'visibility',
            'word-spacing',
            'writing-mode',
        ]);
        this.SVGElement = platform.globalThis.SVGElement;
        const div = platform.document.createElement('div');
        div.innerHTML = '<svg><altGlyph /></svg>';
        if (div.firstElementChild.nodeName === 'altglyph') {
            // handle chrome casing inconsistencies.
            const svg = this._svgElements;
            let tmp = svg.altGlyph;
            svg.altGlyph = svg.altglyph;
            svg.altglyph = tmp;
            tmp = svg.altGlyphDef;
            svg.altGlyphDef = svg.altglyphdef;
            svg.altglyphdef = tmp;
            tmp = svg.altGlyphItem;
            svg.altGlyphItem = svg.altglyphitem;
            svg.altglyphitem = tmp;
            tmp = svg.glyphRef;
            svg.glyphRef = svg.glyphref;
            svg.glyphref = tmp;
        }
    }
    static register(container) {
        return Registration.singleton(ISVGAnalyzer, this).register(container);
    }
    isStandardSvgAttribute(node, attributeName) {
        var _a;
        if (!(node instanceof this.SVGElement)) {
            return false;
        }
        return (this._svgPresentationElements[node.nodeName] === true && this._svgPresentationAttributes[attributeName] === true ||
            ((_a = this._svgElements[node.nodeName]) === null || _a === void 0 ? void 0 : _a[attributeName]) === true);
    }
}
/**
 * @internal
 */
SVGAnalyzer.inject = [IPlatform];

const IAttrMapper = DI
    .createInterface('IAttrMapper', x => x.singleton(AttrMapper));
class AttrMapper {
    constructor(svg) {
        this.svg = svg;
        /** @internal */
        this.fns = [];
        /** @internal */
        this._tagAttrMap = createLookup();
        /** @internal */
        this._globalAttrMap = createLookup();
        this.useMapping({
            LABEL: { for: 'htmlFor' },
            IMG: { usemap: 'useMap' },
            INPUT: {
                maxlength: 'maxLength',
                minlength: 'minLength',
                formaction: 'formAction',
                formenctype: 'formEncType',
                formmethod: 'formMethod',
                formnovalidate: 'formNoValidate',
                formtarget: 'formTarget',
                inputmode: 'inputMode',
            },
            TEXTAREA: { maxlength: 'maxLength' },
            TD: { rowspan: 'rowSpan', colspan: 'colSpan' },
            TH: { rowspan: 'rowSpan', colspan: 'colSpan' },
        });
        this.useGlobalMapping({
            accesskey: 'accessKey',
            contenteditable: 'contentEditable',
            tabindex: 'tabIndex',
            textcontent: 'textContent',
            innerhtml: 'innerHTML',
            scrolltop: 'scrollTop',
            scrollleft: 'scrollLeft',
            readonly: 'readOnly',
        });
    }
    /** @internal */
    static get inject() { return [ISVGAnalyzer]; }
    /**
     * Allow application to teach Aurelia how to define how to map attributes to properties
     * based on element tagName
     */
    useMapping(config) {
        var _a;
        var _b;
        let newAttrMapping;
        let targetAttrMapping;
        let tagName;
        let attr;
        for (tagName in config) {
            newAttrMapping = config[tagName];
            targetAttrMapping = (_a = (_b = this._tagAttrMap)[tagName]) !== null && _a !== void 0 ? _a : (_b[tagName] = createLookup());
            for (attr in newAttrMapping) {
                if (targetAttrMapping[attr] !== void 0) {
                    throw createMappedError(attr, tagName);
                }
                targetAttrMapping[attr] = newAttrMapping[attr];
            }
        }
    }
    /**
     * Allow applications to teach Aurelia how to define how to map attributes to properties
     * for all elements
     */
    useGlobalMapping(config) {
        const mapper = this._globalAttrMap;
        for (const attr in config) {
            if (mapper[attr] !== void 0) {
                throw createMappedError(attr, '*');
            }
            mapper[attr] = config[attr];
        }
    }
    /**
     * Add a given function to a list of fns that will be used
     * to check if `'bind'` command can be understood as `'two-way'` command.
     */
    useTwoWay(fn) {
        this.fns.push(fn);
    }
    /**
     * Returns true if an attribute should be two way bound based on an element
     */
    isTwoWay(node, attrName) {
        return shouldDefaultToTwoWay(node, attrName)
            || this.fns.length > 0 && this.fns.some(fn => fn(node, attrName));
    }
    /**
     * Retrieves the mapping information this mapper have for an attribute on an element
     */
    map(node, attr) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._tagAttrMap[node.nodeName]) === null || _a === void 0 ? void 0 : _a[attr]) !== null && _b !== void 0 ? _b : this._globalAttrMap[attr]) !== null && _c !== void 0 ? _c : (isDataAttribute(node, attr, this.svg)
            ? attr
            : null);
    }
}
function shouldDefaultToTwoWay(element, attr) {
    switch (element.nodeName) {
        case 'INPUT':
            switch (element.type) {
                case 'checkbox':
                case 'radio':
                    return attr === 'checked';
                // note:
                // ideally, it should check for corresponding input type first
                // as 'files' shouldn't be two way on a number input, for example
                // but doing it this way is acceptable-ish, as the common user expectations,
                // and the behavior of the control for these properties are the same,
                // regardless the type of the <input>
                default:
                    return attr === 'value' || attr === 'files' || attr === 'value-as-number' || attr === 'value-as-date';
            }
        case 'TEXTAREA':
        case 'SELECT':
            return attr === 'value';
        default:
            switch (attr) {
                case 'textcontent':
                case 'innerhtml':
                    return element.hasAttribute('contenteditable');
                case 'scrolltop':
                case 'scrollleft':
                    return true;
                default:
                    return false;
            }
    }
}
function createMappedError(attr, tagName) {
    return new Error(`Attribute ${attr} has been already registered for ${tagName === '*' ? 'all elements' : `<${tagName}/>`}`);
}

class CallBinding {
    constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.targetObserver = observerLocator.getAccessor(target, targetProperty);
    }
    callSource(args) {
        const overrideContext = this.$scope.overrideContext;
        overrideContext.$event = args;
        const result = this.sourceExpression.evaluate(8 /* mustEvaluate */, this.$scope, this.locator, null);
        Reflect.deleteProperty(overrideContext, '$event');
        return result;
    }
    $bind(flags, scope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, this.interceptor);
        }
        this.targetObserver.setValue(($args) => this.interceptor.callSource($args), flags, this.target, this.targetProperty);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.interceptor);
        }
        this.$scope = void 0;
        this.targetObserver.setValue(null, flags, this.target, this.targetProperty);
        this.isBound = false;
    }
    observe(obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}

/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
class AttributeObserver {
    constructor(obj, prop, attr) {
        this.prop = prop;
        this.attr = attr;
        // layout is not certain, depends on the attribute being flushed to owner element
        // but for simple start, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.value = null;
        /** @internal */
        this._oldValue = null;
        /** @internal */
        this._hasChanges = false;
        /** @internal */
        this.f = 0 /* none */;
        this.obj = obj;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.value;
    }
    setValue(value, flags) {
        this.value = value;
        this._hasChanges = value !== this._oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this._flushChanges();
        }
    }
    /** @internal */
    _flushChanges() {
        if (this._hasChanges) {
            this._hasChanges = false;
            const value = this.value;
            const attr = this.attr;
            this._oldValue = value;
            switch (attr) {
                case 'class': {
                    // Why does class attribute observer setValue look different with class attribute accessor?
                    // ==============
                    // For class list
                    // newValue is simply checked if truthy or falsy
                    // and toggle the class accordingly
                    // -- the rule of this is quite different to normal attribute
                    //
                    // for class attribute, observer is different in a way that it only observes one class at a time
                    // this also comes from syntax, where it would typically be my-class.class="someProperty"
                    //
                    // so there is no need for separating class by space and add all of them like class accessor
                    this.obj.classList.toggle(this.prop, !!value);
                    break;
                }
                case 'style': {
                    let priority = '';
                    let newValue = value;
                    if (typeof newValue === 'string' && newValue.includes('!important')) {
                        priority = 'important';
                        newValue = newValue.replace('!important', '');
                    }
                    this.obj.style.setProperty(this.prop, newValue, priority);
                    break;
                }
                default: {
                    if (value == null) {
                        this.obj.removeAttribute(attr);
                    }
                    else {
                        this.obj.setAttribute(attr, String(value));
                    }
                }
            }
        }
    }
    handleMutation(mutationRecords) {
        let shouldProcess = false;
        for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
            const record = mutationRecords[i];
            if (record.type === 'attributes' && record.attributeName === this.prop) {
                shouldProcess = true;
                break;
            }
        }
        if (shouldProcess) {
            let newValue;
            switch (this.attr) {
                case 'class':
                    newValue = this.obj.classList.contains(this.prop);
                    break;
                case 'style':
                    newValue = this.obj.style.getPropertyValue(this.prop);
                    break;
                default:
                    throw new Error(`AUR0651:${this.attr}`);
            }
            if (newValue !== this.value) {
                this._oldValue = this.value;
                this.value = newValue;
                this._hasChanges = false;
                this.f = 0 /* none */;
                this.queue.add(this);
            }
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.value = this._oldValue = this.obj.getAttribute(this.prop);
            startObservation(this.obj.ownerDocument.defaultView.MutationObserver, this.obj, this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            stopObservation(this.obj, this);
        }
    }
    flush() {
        oV$3 = this._oldValue;
        this._oldValue = this.value;
        this.subs.notify(this.value, oV$3, this.f);
    }
}
subscriberCollection(AttributeObserver);
withFlushQueue(AttributeObserver);
const startObservation = ($MutationObserver, element, subscriber) => {
    if (element.$eMObs === undefined) {
        element.$eMObs = new Set();
    }
    if (element.$mObs === undefined) {
        (element.$mObs = new $MutationObserver(handleMutation)).observe(element, { attributes: true });
    }
    element.$eMObs.add(subscriber);
};
const stopObservation = (element, subscriber) => {
    const $eMObservers = element.$eMObs;
    if ($eMObservers && $eMObservers.delete(subscriber)) {
        if ($eMObservers.size === 0) {
            element.$mObs.disconnect();
            element.$mObs = undefined;
        }
        return true;
    }
    return false;
};
const handleMutation = (mutationRecords) => {
    mutationRecords[0].target.$eMObs.forEach(invokeHandleMutation, mutationRecords);
};
function invokeHandleMutation(s) {
    s.handleMutation(this);
}
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$3 = void 0;

/**
 * A subscriber that is used for subcribing to target observer & invoking `updateSource` on a binding
 */
class BindingTargetSubscriber {
    constructor(b) {
        this.b = b;
    }
    // deepscan-disable-next-line
    handleChange(value, _, flags) {
        const b = this.b;
        if (value !== b.sourceExpression.evaluate(flags, b.$scope, b.locator, null)) {
            b.updateSource(value, flags);
        }
    }
}

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime: oneTime$1, toView: toView$2, fromView: fromView$1 } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime$1 = toView$2 | oneTime$1;
const taskOptions = {
    reusable: false,
    preempt: true,
};
/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
class AttributeBinding {
    constructor(sourceExpression, target, 
    // some attributes may have inner structure
    // such as class -> collection of class names
    // such as style -> collection of style rules
    //
    // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
    targetAttribute, targetProperty, mode, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.targetAttribute = targetAttribute;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = null;
        this.task = null;
        this.targetSubscriber = null;
        this.persistentFlags = 0 /* none */;
        this.value = void 0;
        this.target = target;
        this.p = locator.get(IPlatform);
        this.oL = observerLocator;
    }
    updateTarget(value, flags) {
        flags |= this.persistentFlags;
        this.targetObserver.setValue(value, flags, this.target, this.targetProperty);
    }
    updateSource(value, flags) {
        flags |= this.persistentFlags;
        this.sourceExpression.assign(flags, this.$scope, this.locator, value);
    }
    handleChange(newValue, _previousValue, flags) {
        if (!this.isBound) {
            return;
        }
        flags |= this.persistentFlags;
        const mode = this.mode;
        const interceptor = this.interceptor;
        const sourceExpression = this.sourceExpression;
        const $scope = this.$scope;
        const locator = this.locator;
        const targetObserver = this.targetObserver;
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0 && (targetObserver.type & 4 /* Layout */) > 0;
        let shouldConnect = false;
        let task;
        if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.obs.count > 1) {
            shouldConnect = (mode & oneTime$1) === 0;
            if (shouldConnect) {
                this.obs.version++;
            }
            newValue = sourceExpression.evaluate(flags, $scope, locator, interceptor);
            if (shouldConnect) {
                this.obs.clear(false);
            }
        }
        if (newValue !== this.value) {
            this.value = newValue;
            if (shouldQueueFlush) {
                // Queue the new one before canceling the old one, to prevent early yield
                task = this.task;
                this.task = this.p.domWriteQueue.queueTask(() => {
                    this.task = null;
                    interceptor.updateTarget(newValue, flags);
                }, taskOptions);
                task === null || task === void 0 ? void 0 : task.cancel();
            }
            else {
                interceptor.updateTarget(newValue, flags);
            }
        }
    }
    $bind(flags, scope) {
        var _a;
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        // Store flags which we can only receive during $bind and need to pass on
        // to the AST during evaluate/connect/assign
        this.persistentFlags = flags & 961 /* persistentBindingFlags */;
        this.$scope = scope;
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, this.interceptor);
        }
        let targetObserver = this.targetObserver;
        if (!targetObserver) {
            targetObserver = this.targetObserver = new AttributeObserver(this.target, this.targetProperty, this.targetAttribute);
        }
        // during bind, binding behavior might have changed sourceExpression
        sourceExpression = this.sourceExpression;
        const $mode = this.mode;
        const interceptor = this.interceptor;
        let shouldConnect = false;
        if ($mode & toViewOrOneTime$1) {
            shouldConnect = ($mode & toView$2) > 0;
            interceptor.updateTarget(this.value = sourceExpression.evaluate(flags, scope, this.locator, shouldConnect ? interceptor : null), flags);
        }
        if ($mode & fromView$1) {
            targetObserver.subscribe((_a = this.targetSubscriber) !== null && _a !== void 0 ? _a : (this.targetSubscriber = new BindingTargetSubscriber(interceptor)));
        }
        this.isBound = true;
    }
    $unbind(flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        // clear persistent flags
        this.persistentFlags = 0 /* none */;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.interceptor);
        }
        this.$scope = null;
        this.value = void 0;
        if (this.targetSubscriber) {
            this.targetObserver.unsubscribe(this.targetSubscriber);
        }
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        this.obs.clear(true);
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
}
connectable(AttributeBinding);

const { toView: toView$1 } = BindingMode;
const queueTaskOptions = {
    reusable: false,
    preempt: true,
};
// a pseudo binding to manage multiple InterpolationBinding s
// ========
// Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
// value converters and binding behaviors.
// Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
// in which case the renderer will create the TextBinding directly
class InterpolationBinding {
    constructor(observerLocator, interpolation, target, targetProperty, mode, locator, taskQueue) {
        this.interpolation = interpolation;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.locator = locator;
        this.taskQueue = taskQueue;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.task = null;
        this.oL = observerLocator;
        this.targetObserver = observerLocator.getAccessor(target, targetProperty);
        const expressions = interpolation.expressions;
        const partBindings = this.partBindings = Array(expressions.length);
        const ii = expressions.length;
        let i = 0;
        for (; ii > i; ++i) {
            partBindings[i] = new InterpolationPartBinding(expressions[i], target, targetProperty, locator, observerLocator, this);
        }
    }
    updateTarget(value, flags) {
        const partBindings = this.partBindings;
        const staticParts = this.interpolation.parts;
        const ii = partBindings.length;
        let result = '';
        let i = 0;
        if (ii === 1) {
            result = staticParts[0] + partBindings[0].value + staticParts[1];
        }
        else {
            result = staticParts[0];
            for (; ii > i; ++i) {
                result += partBindings[i].value + staticParts[i + 1];
            }
        }
        const targetObserver = this.targetObserver;
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0 && (targetObserver.type & 4 /* Layout */) > 0;
        let task;
        if (shouldQueueFlush) {
            // Queue the new one before canceling the old one, to prevent early yield
            task = this.task;
            this.task = this.taskQueue.queueTask(() => {
                this.task = null;
                targetObserver.setValue(result, flags, this.target, this.targetProperty);
            }, queueTaskOptions);
            task === null || task === void 0 ? void 0 : task.cancel();
            task = null;
        }
        else {
            targetObserver.setValue(result, flags, this.target, this.targetProperty);
        }
    }
    $bind(flags, scope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        const partBindings = this.partBindings;
        const ii = partBindings.length;
        let i = 0;
        for (; ii > i; ++i) {
            partBindings[i].$bind(flags, scope);
        }
        this.updateTarget(void 0, flags);
    }
    $unbind(flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.$scope = void 0;
        const partBindings = this.partBindings;
        const ii = partBindings.length;
        let i = 0;
        for (; ii > i; ++i) {
            partBindings[i].interceptor.$unbind(flags);
        }
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
    }
}
class InterpolationPartBinding {
    constructor(sourceExpression, target, targetProperty, locator, observerLocator, owner) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.locator = locator;
        this.owner = owner;
        this.interceptor = this;
        // at runtime, mode may be overriden by binding behavior
        // but it wouldn't matter here, just start with something for later check
        this.mode = BindingMode.toView;
        this.value = '';
        this.task = null;
        this.isBound = false;
        this.oL = observerLocator;
    }
    handleChange(newValue, oldValue, flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        const obsRecord = this.obs;
        const canOptimize = sourceExpression.$kind === 10082 /* AccessScope */ && obsRecord.count === 1;
        let shouldConnect = false;
        if (!canOptimize) {
            shouldConnect = (this.mode & toView$1) > 0;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, this.$scope, this.locator, shouldConnect ? this.interceptor : null);
            if (shouldConnect) {
                obsRecord.clear(false);
            }
        }
        if (newValue != this.value) {
            this.value = newValue;
            if (newValue instanceof Array) {
                this.observeCollection(newValue);
            }
            this.owner.updateTarget(newValue, flags);
        }
    }
    handleCollectionChange(indexMap, flags) {
        this.owner.updateTarget(void 0, flags);
    }
    $bind(flags, scope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, this.interceptor);
        }
        this.value = this.sourceExpression.evaluate(flags, scope, this.locator, (this.mode & toView$1) > 0 ? this.interceptor : null);
        if (this.value instanceof Array) {
            this.observeCollection(this.value);
        }
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.interceptor);
        }
        this.$scope = void 0;
        this.obs.clear(true);
    }
}
connectable(InterpolationPartBinding);
/**
 * A binding for handling the element content interpolation
 */
class ContentBinding {
    constructor(sourceExpression, target, locator, observerLocator, p, strict) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.locator = locator;
        this.p = p;
        this.strict = strict;
        this.interceptor = this;
        // at runtime, mode may be overriden by binding behavior
        // but it wouldn't matter here, just start with something for later check
        this.mode = BindingMode.toView;
        this.value = '';
        this.task = null;
        this.isBound = false;
        this.oL = observerLocator;
    }
    updateTarget(value, flags) {
        var _a, _b;
        const target = this.target;
        const NodeCtor = this.p.Node;
        const oldValue = this.value;
        this.value = value;
        if (oldValue instanceof NodeCtor) {
            (_a = oldValue.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(oldValue);
        }
        if (value instanceof NodeCtor) {
            target.textContent = '';
            (_b = target.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(value, target);
        }
        else {
            target.textContent = String(value);
        }
    }
    handleChange(newValue, oldValue, flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        const obsRecord = this.obs;
        const canOptimize = sourceExpression.$kind === 10082 /* AccessScope */ && obsRecord.count === 1;
        let shouldConnect = false;
        if (!canOptimize) {
            shouldConnect = (this.mode & toView$1) > 0;
            if (shouldConnect) {
                obsRecord.version++;
            }
            flags |= this.strict ? 1 /* isStrictBindingStrategy */ : 0;
            newValue = sourceExpression.evaluate(flags, this.$scope, this.locator, shouldConnect ? this.interceptor : null);
            if (shouldConnect) {
                obsRecord.clear(false);
            }
        }
        if (newValue === this.value) {
            // in a frequent update, e.g collection mutation in a loop
            // value could be changing frequently and previous update task may be stale at this point
            // cancel if any task going on because the latest value is already the same
            (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
            this.task = null;
            return;
        }
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0;
        if (shouldQueueFlush) {
            this.queueUpdate(newValue, flags);
        }
        else {
            this.updateTarget(newValue, flags);
        }
    }
    handleCollectionChange() {
        this.queueUpdate(this.value, 0 /* none */);
    }
    $bind(flags, scope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, this.interceptor);
        }
        flags |= this.strict ? 1 /* isStrictBindingStrategy */ : 0;
        const v = this.value = this.sourceExpression.evaluate(flags, scope, this.locator, (this.mode & toView$1) > 0 ? this.interceptor : null);
        if (v instanceof Array) {
            this.observeCollection(v);
        }
        this.updateTarget(v, flags);
    }
    $unbind(flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.interceptor);
        }
        // TODO: should existing value (either connected node, or a string)
        // be removed when this binding is unbound?
        // this.updateTarget('', flags);
        this.$scope = void 0;
        this.obs.clear(true);
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
    }
    // queue a force update
    queueUpdate(newValue, flags) {
        const task = this.task;
        this.task = this.p.domWriteQueue.queueTask(() => {
            this.task = null;
            this.updateTarget(newValue, flags);
        }, queueTaskOptions);
        task === null || task === void 0 ? void 0 : task.cancel();
    }
}
connectable(ContentBinding);

class LetBinding {
    constructor(sourceExpression, targetProperty, observerLocator, locator, toBindingContext = false) {
        this.sourceExpression = sourceExpression;
        this.targetProperty = targetProperty;
        this.locator = locator;
        this.toBindingContext = toBindingContext;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.task = null;
        this.target = null;
        this.oL = observerLocator;
    }
    handleChange(newValue, _previousValue, flags) {
        if (!this.isBound) {
            return;
        }
        const target = this.target;
        const targetProperty = this.targetProperty;
        const previousValue = target[targetProperty];
        this.obs.version++;
        newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.interceptor);
        this.obs.clear(false);
        if (newValue !== previousValue) {
            target[targetProperty] = newValue;
        }
    }
    $bind(flags, scope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.target = (this.toBindingContext ? scope.bindingContext : scope.overrideContext);
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, this.interceptor);
        }
        // sourceExpression might have been changed during bind
        this.target[this.targetProperty]
            = this.sourceExpression.evaluate(flags | 2 /* fromBind */, scope, this.locator, this.interceptor);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.interceptor);
        }
        this.$scope = void 0;
        this.obs.clear(true);
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
}
connectable(LetBinding);

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;
const updateTaskOpts = {
    reusable: false,
    preempt: true,
};
class PropertyBinding {
    constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator, taskQueue) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.locator = locator;
        this.taskQueue = taskQueue;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.targetObserver = void 0;
        this.persistentFlags = 0 /* none */;
        this.task = null;
        this.targetSubscriber = null;
        this.oL = observerLocator;
    }
    updateTarget(value, flags) {
        flags |= this.persistentFlags;
        this.targetObserver.setValue(value, flags, this.target, this.targetProperty);
    }
    updateSource(value, flags) {
        flags |= this.persistentFlags;
        this.sourceExpression.assign(flags, this.$scope, this.locator, value);
    }
    handleChange(newValue, _previousValue, flags) {
        if (!this.isBound) {
            return;
        }
        flags |= this.persistentFlags;
        const targetObserver = this.targetObserver;
        const interceptor = this.interceptor;
        const sourceExpression = this.sourceExpression;
        const $scope = this.$scope;
        const locator = this.locator;
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0 && (targetObserver.type & 4 /* Layout */) > 0;
        const obsRecord = this.obs;
        let shouldConnect = false;
        // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
        if (sourceExpression.$kind !== 10082 /* AccessScope */ || obsRecord.count > 1) {
            // todo: in VC expressions, from view also requires connect
            shouldConnect = this.mode > oneTime;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, $scope, locator, interceptor);
            if (shouldConnect) {
                obsRecord.clear(false);
            }
        }
        if (shouldQueueFlush) {
            // Queue the new one before canceling the old one, to prevent early yield
            task = this.task;
            this.task = this.taskQueue.queueTask(() => {
                interceptor.updateTarget(newValue, flags);
                this.task = null;
            }, updateTaskOpts);
            task === null || task === void 0 ? void 0 : task.cancel();
            task = null;
        }
        else {
            interceptor.updateTarget(newValue, flags);
        }
    }
    $bind(flags, scope) {
        var _a;
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        // Force property binding to always be strict
        flags |= 1 /* isStrictBindingStrategy */;
        // Store flags which we can only receive during $bind and need to pass on
        // to the AST during evaluate/connect/assign
        this.persistentFlags = flags & 961 /* persistentBindingFlags */;
        this.$scope = scope;
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, this.interceptor);
        }
        const observerLocator = this.oL;
        const $mode = this.mode;
        let targetObserver = this.targetObserver;
        if (!targetObserver) {
            if ($mode & fromView) {
                targetObserver = observerLocator.getObserver(this.target, this.targetProperty);
            }
            else {
                targetObserver = observerLocator.getAccessor(this.target, this.targetProperty);
            }
            this.targetObserver = targetObserver;
        }
        // during bind, binding behavior might have changed sourceExpression
        // deepscan-disable-next-line
        sourceExpression = this.sourceExpression;
        const interceptor = this.interceptor;
        const shouldConnect = ($mode & toView) > 0;
        if ($mode & toViewOrOneTime) {
            interceptor.updateTarget(sourceExpression.evaluate(flags, scope, this.locator, shouldConnect ? interceptor : null), flags);
        }
        if ($mode & fromView) {
            targetObserver.subscribe((_a = this.targetSubscriber) !== null && _a !== void 0 ? _a : (this.targetSubscriber = new BindingTargetSubscriber(interceptor)));
            if (!shouldConnect) {
                interceptor.updateSource(targetObserver.getValue(this.target, this.targetProperty), flags);
            }
        }
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        this.persistentFlags = 0 /* none */;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.interceptor);
        }
        this.$scope = void 0;
        task = this.task;
        if (this.targetSubscriber) {
            this.targetObserver.unsubscribe(this.targetSubscriber);
        }
        if (task != null) {
            task.cancel();
            task = this.task = null;
        }
        this.obs.clear(true);
        this.isBound = false;
    }
}
connectable(PropertyBinding);
let task = null;

class RefBinding {
    constructor(sourceExpression, target, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
    }
    $bind(flags, scope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, this);
        }
        this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.evaluate(flags, this.$scope, this.locator, null) === this.target) {
            sourceExpression.assign(flags, this.$scope, this.locator, null);
        }
        // source expression might have been modified durring assign, via a BB
        // deepscan-disable-next-line
        sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.interceptor);
        }
        this.$scope = void 0;
        this.isBound = false;
    }
    observe(obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}

const IAppTask = DI.createInterface('IAppTask');
class $AppTask {
    constructor(slot, key, cb) {
        /** @internal */
        this.c = (void 0);
        this.slot = slot;
        this.k = key;
        this.cb = cb;
    }
    register(container) {
        return this.c = container.register(Registration.instance(IAppTask, this));
    }
    run() {
        const key = this.k;
        const cb = this.cb;
        return key === null
            ? cb()
            : cb(this.c.get(key));
    }
}
const AppTask = Object.freeze({
    beforeCreate: createAppTaskSlotHook('beforeCreate'),
    hydrating: createAppTaskSlotHook('hydrating'),
    hydrated: createAppTaskSlotHook('hydrated'),
    beforeActivate: createAppTaskSlotHook('beforeActivate'),
    afterActivate: createAppTaskSlotHook('afterActivate'),
    beforeDeactivate: createAppTaskSlotHook('beforeDeactivate'),
    afterDeactivate: createAppTaskSlotHook('afterDeactivate'),
});
function createAppTaskSlotHook(slotName) {
    function appTaskFactory(keyOrCallback, callback) {
        if (typeof callback === 'function') {
            return new $AppTask(slotName, keyOrCallback, callback);
        }
        return new $AppTask(slotName, null, keyOrCallback);
    }
    return appTaskFactory;
}

function children(configOrTarget, prop) {
    let config;
    function decorator($target, $prop) {
        if (arguments.length > 1) {
            // Non invocation:
            // - @children
            // Invocation with or w/o opts:
            // - @children()
            // - @children({...opts})
            config.property = $prop;
        }
        Metadata.define(baseName, ChildrenDefinition.create($prop, config), $target.constructor, $prop);
        Protocol.annotation.appendTo($target.constructor, Children.keyFrom($prop));
    }
    if (arguments.length > 1) {
        // Non invocation:
        // - @children
        config = {};
        decorator(configOrTarget, prop);
        return;
    }
    else if (typeof configOrTarget === 'string') {
        // ClassDecorator
        // - @children('bar')
        // Direct call:
        // - @children('bar')(Foo)
        config = {};
        return decorator;
    }
    // Invocation with or w/o opts:
    // - @children()
    // - @children({...opts})
    config = configOrTarget === void 0 ? {} : configOrTarget;
    return decorator;
}
function isChildrenObserverAnnotation(key) {
    return key.startsWith(baseName);
}
const baseName = Protocol.annotation.keyFor('children-observer');
const Children = Object.freeze({
    name: Protocol.annotation.keyFor('children-observer'),
    keyFrom(name) {
        return `${baseName}:${name}`;
    },
    from(...childrenObserverLists) {
        const childrenObservers = {};
        const isArray = Array.isArray;
        function addName(name) {
            childrenObservers[name] = ChildrenDefinition.create(name);
        }
        function addDescription(name, def) {
            childrenObservers[name] = ChildrenDefinition.create(name, def);
        }
        function addList(maybeList) {
            if (isArray(maybeList)) {
                maybeList.forEach(addName);
            }
            else if (maybeList instanceof ChildrenDefinition) {
                childrenObservers[maybeList.property] = maybeList;
            }
            else if (maybeList !== void 0) {
                Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
            }
        }
        childrenObserverLists.forEach(addList);
        return childrenObservers;
    },
    getAll(Type) {
        const propStart = baseName.length + 1;
        const defs = [];
        const prototypeChain = getPrototypeChain(Type);
        let iProto = prototypeChain.length;
        let iDefs = 0;
        let keys;
        let keysLen;
        let Class;
        while (--iProto >= 0) {
            Class = prototypeChain[iProto];
            keys = Protocol.annotation.getKeys(Class).filter(isChildrenObserverAnnotation);
            keysLen = keys.length;
            for (let i = 0; i < keysLen; ++i) {
                defs[iDefs++] = Metadata.getOwn(baseName, Class, keys[i].slice(propStart));
            }
        }
        return defs;
    },
});
const childObserverOptions$1 = { childList: true };
class ChildrenDefinition {
    constructor(callback, property, options, query, filter, map) {
        this.callback = callback;
        this.property = property;
        this.options = options;
        this.query = query;
        this.filter = filter;
        this.map = map;
    }
    static create(prop, def = {}) {
        var _a;
        return new ChildrenDefinition(firstDefined(def.callback, `${prop}Changed`), firstDefined(def.property, prop), (_a = def.options) !== null && _a !== void 0 ? _a : childObserverOptions$1, def.query, def.filter, def.map);
    }
}
/**
 * @internal
 *
 * A special observer for observing the children of a custom element. Unlike other observer that starts/stops
 * based on the changes in the subscriber addition/removal, this is a controlled observers.
 *
 * The controller of a custom element should totally control when this observer starts/stops.
 */
class ChildrenObserver {
    constructor(controller, obj, propertyKey, cbName, query = defaultChildQuery, filter = defaultChildFilter, map = defaultChildMap, options) {
        this.controller = controller;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.query = query;
        this.filter = filter;
        this.map = map;
        this.options = options;
        this.observing = false;
        this.children = (void 0);
        this.observer = void 0;
        this.callback = obj[cbName];
        Reflect.defineProperty(this.obj, this.propertyKey, {
            enumerable: true,
            configurable: true,
            get: () => this.getValue(),
            set: () => { return; },
        });
    }
    getValue() {
        return this.observing ? this.children : this.get();
    }
    setValue(value) { }
    start() {
        var _a;
        if (!this.observing) {
            this.observing = true;
            this.children = this.get();
            ((_a = this.observer) !== null && _a !== void 0 ? _a : (this.observer = new this.controller.host.ownerDocument.defaultView.MutationObserver(() => { this._onChildrenChanged(); })))
                .observe(this.controller.host, this.options);
        }
    }
    stop() {
        if (this.observing) {
            this.observing = false;
            this.observer.disconnect();
            this.children = emptyArray;
        }
    }
    _onChildrenChanged() {
        this.children = this.get();
        if (this.callback !== void 0) {
            this.callback.call(this.obj);
        }
        this.subs.notify(this.children, undefined, 0 /* none */);
    }
    // freshly retrieve the children everytime
    // in case this observer is not observing
    get() {
        return filterChildren(this.controller, this.query, this.filter, this.map);
    }
}
subscriberCollection()(ChildrenObserver);
function defaultChildQuery(controller) {
    return controller.host.childNodes;
}
function defaultChildFilter(node, controller, viewModel) {
    return !!viewModel;
}
function defaultChildMap(node, controller, viewModel) {
    return viewModel;
}
const forOpts = { optional: true };
/** @internal */
function filterChildren(controller, query, filter, map) {
    var _a;
    const nodes = query(controller);
    const ii = nodes.length;
    const children = [];
    let node;
    let $controller;
    let viewModel;
    let i = 0;
    for (; i < ii; ++i) {
        node = nodes[i];
        $controller = CustomElement.for(node, forOpts);
        viewModel = (_a = $controller === null || $controller === void 0 ? void 0 : $controller.viewModel) !== null && _a !== void 0 ? _a : null;
        if (filter(node, $controller, viewModel)) {
            children.push(map(node, $controller, viewModel));
        }
    }
    return children;
}

function customAttribute(nameOrDef) {
    return function (target) {
        return CustomAttribute.define(nameOrDef, target);
    };
}
function templateController(nameOrDef) {
    return function (target) {
        return CustomAttribute.define(typeof nameOrDef === 'string'
            ? { isTemplateController: true, name: nameOrDef }
            : { isTemplateController: true, ...nameOrDef }, target);
    };
}
class CustomAttributeDefinition {
    constructor(Type, name, aliases, key, defaultBindingMode, isTemplateController, bindables, noMultiBindings, watches) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.defaultBindingMode = defaultBindingMode;
        this.isTemplateController = isTemplateController;
        this.bindables = bindables;
        this.noMultiBindings = noMultiBindings;
        this.watches = watches;
    }
    static create(nameOrDef, Type) {
        const getAnnotation = CustomAttribute.getAnnotation;
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        return new CustomAttributeDefinition(Type, firstDefined(getAnnotation(Type, 'name'), name), mergeArrays(getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), CustomAttribute.keyFrom(name), firstDefined(getAnnotation(Type, 'defaultBindingMode'), def.defaultBindingMode, Type.defaultBindingMode, BindingMode.toView), firstDefined(getAnnotation(Type, 'isTemplateController'), def.isTemplateController, Type.isTemplateController, false), Bindable.from(...Bindable.getAll(Type), getAnnotation(Type, 'bindables'), Type.bindables, def.bindables), firstDefined(getAnnotation(Type, 'noMultiBindings'), def.noMultiBindings, Type.noMultiBindings, false), mergeArrays(Watch.getAnnotation(Type), Type.watches));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.transient(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, CustomAttribute, key, container);
    }
}
const caBaseName = Protocol.resource.keyFor('custom-attribute');
const CustomAttribute = Object.freeze({
    name: caBaseName,
    keyFrom(name) {
        return `${caBaseName}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(caBaseName, value);
    },
    for(node, name) {
        var _a;
        return ((_a = getRef(node, CustomAttribute.keyFrom(name))) !== null && _a !== void 0 ? _a : void 0);
    },
    define(nameOrDef, Type) {
        const definition = CustomAttributeDefinition.create(nameOrDef, Type);
        Metadata.define(caBaseName, definition, definition.Type);
        Metadata.define(caBaseName, definition, definition);
        Protocol.resource.appendTo(Type, caBaseName);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(caBaseName, Type);
        if (def === void 0) {
            throw new Error(`AUR0702:${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
});

function watch(expressionOrPropertyAccessFn, changeHandlerOrCallback) {
    if (!expressionOrPropertyAccessFn) {
        throw new Error('AUR0715');
    }
    return function decorator(target, key, descriptor) {
        const isClassDecorator = key == null;
        const Type = isClassDecorator ? target : target.constructor;
        const watchDef = new WatchDefinition(expressionOrPropertyAccessFn, isClassDecorator ? changeHandlerOrCallback : descriptor.value);
        // basic validation
        if (isClassDecorator) {
            if (typeof changeHandlerOrCallback !== 'function'
                && (changeHandlerOrCallback == null || !(changeHandlerOrCallback in Type.prototype))) {
                throw new Error(`AUR0716:${String(changeHandlerOrCallback)}@${Type.name}}`);
            }
        }
        else if (typeof (descriptor === null || descriptor === void 0 ? void 0 : descriptor.value) !== 'function') {
            throw new Error(`AUR0717:${String(key)}`);
        }
        Watch.add(Type, watchDef);
        // if the code looks like this:
        // @watch(...)
        // @customAttribute(...)
        // class Abc {}
        //
        // then @watch is called after @customAttribute
        // which means the attribute definition won't have the watch definition
        //
        // temporarily works around this order sensitivity by manually add the watch def
        // manual
        if (CustomAttribute.isType(Type)) {
            CustomAttribute.getDefinition(Type).watches.push(watchDef);
        }
        if (CustomElement.isType(Type)) {
            CustomElement.getDefinition(Type).watches.push(watchDef);
        }
    };
}
class WatchDefinition {
    constructor(expression, callback) {
        this.expression = expression;
        this.callback = callback;
    }
}
const noDefinitions = emptyArray;
const watchBaseName = Protocol.annotation.keyFor('watch');
const Watch = {
    name: watchBaseName,
    add(Type, definition) {
        let watchDefinitions = Metadata.getOwn(watchBaseName, Type);
        if (watchDefinitions == null) {
            Metadata.define(watchBaseName, watchDefinitions = [], Type);
        }
        watchDefinitions.push(definition);
    },
    getAnnotation(Type) {
        var _a;
        return (_a = Metadata.getOwn(watchBaseName, Type)) !== null && _a !== void 0 ? _a : noDefinitions;
    },
};

function customElement(nameOrDef) {
    return function (target) {
        return CustomElement.define(nameOrDef, target);
    };
}
function useShadowDOM(targetOrOptions) {
    if (targetOrOptions === void 0) {
        return function ($target) {
            CustomElement.annotate($target, 'shadowOptions', { mode: 'open' });
        };
    }
    if (typeof targetOrOptions !== 'function') {
        return function ($target) {
            CustomElement.annotate($target, 'shadowOptions', targetOrOptions);
        };
    }
    CustomElement.annotate(targetOrOptions, 'shadowOptions', { mode: 'open' });
}
function containerless(target) {
    if (target === void 0) {
        return function ($target) {
            CustomElement.annotate($target, 'containerless', true);
        };
    }
    CustomElement.annotate(target, 'containerless', true);
}
const definitionLookup = new WeakMap();
class CustomElementDefinition {
    constructor(Type, name, aliases, key, cache, template, instructions, dependencies, injectable, needsCompile, surrogates, bindables, childrenObservers, containerless, isStrictBinding, shadowOptions, hasSlots, enhance, watches, processContent) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.cache = cache;
        this.template = template;
        this.instructions = instructions;
        this.dependencies = dependencies;
        this.injectable = injectable;
        this.needsCompile = needsCompile;
        this.surrogates = surrogates;
        this.bindables = bindables;
        this.childrenObservers = childrenObservers;
        this.containerless = containerless;
        this.isStrictBinding = isStrictBinding;
        this.shadowOptions = shadowOptions;
        this.hasSlots = hasSlots;
        this.enhance = enhance;
        this.watches = watches;
        this.processContent = processContent;
    }
    static create(nameOrDef, Type = null) {
        const getAnnotation = CustomElement.getAnnotation;
        if (Type === null) {
            const def = nameOrDef;
            if (typeof def === 'string') {
                throw new Error(`AUR0704:${nameOrDef}`);
            }
            const name = fromDefinitionOrDefault('name', def, CustomElement.generateName);
            if (typeof def.Type === 'function') {
                // This needs to be a clone (it will usually be the compiler calling this signature)
                // TODO: we need to make sure it's documented that passing in the type via the definition (while passing in null
                // as the "Type" parameter) effectively skips type analysis, so it should only be used this way for cloning purposes.
                Type = def.Type;
            }
            else {
                Type = CustomElement.generateType(pascalCase(name));
            }
            return new CustomElementDefinition(Type, name, mergeArrays(def.aliases), fromDefinitionOrDefault('key', def, () => CustomElement.keyFrom(name)), fromDefinitionOrDefault('cache', def, () => 0), fromDefinitionOrDefault('template', def, () => null), mergeArrays(def.instructions), mergeArrays(def.dependencies), fromDefinitionOrDefault('injectable', def, () => null), fromDefinitionOrDefault('needsCompile', def, () => true), mergeArrays(def.surrogates), Bindable.from(def.bindables), Children.from(def.childrenObservers), fromDefinitionOrDefault('containerless', def, () => false), fromDefinitionOrDefault('isStrictBinding', def, () => false), fromDefinitionOrDefault('shadowOptions', def, () => null), fromDefinitionOrDefault('hasSlots', def, () => false), fromDefinitionOrDefault('enhance', def, () => false), fromDefinitionOrDefault('watches', def, () => emptyArray), fromAnnotationOrTypeOrDefault('processContent', Type, () => null));
        }
        // If a type is passed in, we ignore the Type property on the definition if it exists.
        // TODO: document this behavior
        if (typeof nameOrDef === 'string') {
            return new CustomElementDefinition(Type, nameOrDef, mergeArrays(getAnnotation(Type, 'aliases'), Type.aliases), CustomElement.keyFrom(nameOrDef), fromAnnotationOrTypeOrDefault('cache', Type, () => 0), fromAnnotationOrTypeOrDefault('template', Type, () => null), mergeArrays(getAnnotation(Type, 'instructions'), Type.instructions), mergeArrays(getAnnotation(Type, 'dependencies'), Type.dependencies), fromAnnotationOrTypeOrDefault('injectable', Type, () => null), fromAnnotationOrTypeOrDefault('needsCompile', Type, () => true), mergeArrays(getAnnotation(Type, 'surrogates'), Type.surrogates), Bindable.from(...Bindable.getAll(Type), getAnnotation(Type, 'bindables'), Type.bindables), Children.from(...Children.getAll(Type), getAnnotation(Type, 'childrenObservers'), Type.childrenObservers), fromAnnotationOrTypeOrDefault('containerless', Type, () => false), fromAnnotationOrTypeOrDefault('isStrictBinding', Type, () => false), fromAnnotationOrTypeOrDefault('shadowOptions', Type, () => null), fromAnnotationOrTypeOrDefault('hasSlots', Type, () => false), fromAnnotationOrTypeOrDefault('enhance', Type, () => false), mergeArrays(Watch.getAnnotation(Type), Type.watches), fromAnnotationOrTypeOrDefault('processContent', Type, () => null));
        }
        // This is the typical default behavior, e.g. from regular CustomElement.define invocations or from @customElement deco
        // The ViewValueConverter also uses this signature and passes in a definition where everything except for the 'hooks'
        // property needs to be copied. So we have that exception for 'hooks', but we may need to revisit that default behavior
        // if this turns out to be too opinionated.
        const name = fromDefinitionOrDefault('name', nameOrDef, CustomElement.generateName);
        return new CustomElementDefinition(Type, name, mergeArrays(getAnnotation(Type, 'aliases'), nameOrDef.aliases, Type.aliases), CustomElement.keyFrom(name), fromAnnotationOrDefinitionOrTypeOrDefault('cache', nameOrDef, Type, () => 0), fromAnnotationOrDefinitionOrTypeOrDefault('template', nameOrDef, Type, () => null), mergeArrays(getAnnotation(Type, 'instructions'), nameOrDef.instructions, Type.instructions), mergeArrays(getAnnotation(Type, 'dependencies'), nameOrDef.dependencies, Type.dependencies), fromAnnotationOrDefinitionOrTypeOrDefault('injectable', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('needsCompile', nameOrDef, Type, () => true), mergeArrays(getAnnotation(Type, 'surrogates'), nameOrDef.surrogates, Type.surrogates), Bindable.from(...Bindable.getAll(Type), getAnnotation(Type, 'bindables'), Type.bindables, nameOrDef.bindables), Children.from(...Children.getAll(Type), getAnnotation(Type, 'childrenObservers'), Type.childrenObservers, nameOrDef.childrenObservers), fromAnnotationOrDefinitionOrTypeOrDefault('containerless', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('isStrictBinding', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('shadowOptions', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('hasSlots', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('enhance', nameOrDef, Type, () => false), mergeArrays(nameOrDef.watches, Watch.getAnnotation(Type), Type.watches), fromAnnotationOrDefinitionOrTypeOrDefault('processContent', nameOrDef, Type, () => null));
    }
    static getOrCreate(partialDefinition) {
        if (partialDefinition instanceof CustomElementDefinition) {
            return partialDefinition;
        }
        if (definitionLookup.has(partialDefinition)) {
            return definitionLookup.get(partialDefinition);
        }
        const definition = CustomElementDefinition.create(partialDefinition);
        definitionLookup.set(partialDefinition, definition);
        // Make sure the full definition can be retrieved from dynamically created classes as well
        Metadata.define(CustomElement.name, definition, definition.Type);
        return definition;
    }
    register(container) {
        const { Type, key, aliases } = this;
        if (!container.has(key, false)) {
            Registration.transient(key, Type).register(container);
            Registration.aliasTo(key, Type).register(container);
            registerAliases(aliases, CustomElement, key, container);
        }
    }
}
const defaultForOpts = {
    name: undefined,
    searchParents: false,
    optional: false,
};
const ceBaseName = Protocol.resource.keyFor('custom-element');
const CustomElement = Object.freeze({
    name: ceBaseName,
    keyFrom(name) {
        return `${ceBaseName}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(ceBaseName, value);
    },
    for(node, opts = defaultForOpts) {
        if (opts.name === void 0 && opts.searchParents !== true) {
            const controller = getRef(node, ceBaseName);
            if (controller === null) {
                if (opts.optional === true) {
                    return null;
                }
                throw new Error('AUR0705');
            }
            return controller;
        }
        if (opts.name !== void 0) {
            if (opts.searchParents !== true) {
                const controller = getRef(node, ceBaseName);
                if (controller === null) {
                    throw new Error('AUR0706');
                }
                if (controller.is(opts.name)) {
                    return controller;
                }
                return (void 0);
            }
            let cur = node;
            let foundAController = false;
            while (cur !== null) {
                const controller = getRef(cur, ceBaseName);
                if (controller !== null) {
                    foundAController = true;
                    if (controller.is(opts.name)) {
                        return controller;
                    }
                }
                cur = getEffectiveParentNode(cur);
            }
            if (foundAController) {
                return (void 0);
            }
            throw new Error('AUR0707');
        }
        let cur = node;
        while (cur !== null) {
            const controller = getRef(cur, ceBaseName);
            if (controller !== null) {
                return controller;
            }
            cur = getEffectiveParentNode(cur);
        }
        throw new Error('AUR0708');
    },
    define(nameOrDef, Type) {
        const definition = CustomElementDefinition.create(nameOrDef, Type);
        Metadata.define(ceBaseName, definition, definition.Type);
        Metadata.define(ceBaseName, definition, definition);
        Protocol.resource.appendTo(definition.Type, ceBaseName);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(ceBaseName, Type);
        if (def === void 0) {
            throw new Error(`AUR0703:${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
    generateName: (function () {
        let id = 0;
        return function () {
            return `unnamed-${++id}`;
        };
    })(),
    createInjectable() {
        const $injectable = function (target, property, index) {
            const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
            annotationParamtypes[index] = $injectable;
            return target;
        };
        $injectable.register = function (container) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return {
                resolve(container, requestor) {
                    if (requestor.has($injectable, true)) {
                        return requestor.get($injectable);
                    }
                    else {
                        return null;
                    }
                },
            };
        };
        return $injectable;
    },
    generateType: (function () {
        const nameDescriptor = {
            value: '',
            writable: false,
            enumerable: false,
            configurable: true,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defaultProto = {};
        return function (name, proto = defaultProto) {
            // Anonymous class ensures that minification cannot cause unintended side-effects, and keeps the class
            // looking similarly from the outside (when inspected via debugger, etc).
            const Type = class {
            };
            // Define the name property so that Type.name can be used by end users / plugin authors if they really need to,
            // even when minified.
            nameDescriptor.value = name;
            Reflect.defineProperty(Type, 'name', nameDescriptor);
            // Assign anything from the prototype that was passed in
            if (proto !== defaultProto) {
                Object.assign(Type.prototype, proto);
            }
            return Type;
        };
    })(),
});
const pcHookMetadataProperty = Protocol.annotation.keyFor('processContent');
function processContent(hook) {
    return hook === void 0
        ? function (target, propertyKey, _descriptor) {
            Metadata.define(pcHookMetadataProperty, ensureHook(target, propertyKey), target);
        }
        : function (target) {
            hook = ensureHook(target, hook);
            const def = Metadata.getOwn(ceBaseName, target);
            if (def !== void 0) {
                def.processContent = hook;
            }
            else {
                Metadata.define(pcHookMetadataProperty, hook, target);
            }
            return target;
        };
}
function ensureHook(target, hook) {
    if (typeof hook === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
        hook = target[hook];
    }
    const hookType = typeof hook;
    if (hookType !== 'function') {
        throw new Error(`AUR0709:${hookType}`);
    }
    return hook;
}

class ClassAttributeAccessor {
    constructor(obj) {
        this.obj = obj;
        this.type = 2 /* Node */ | 4 /* Layout */;
        this.value = '';
        /** @internal */
        this._oldValue = '';
        this.doNotCache = true;
        /** @internal */
        this._nameIndex = {};
        /** @internal */
        this._version = 0;
        /** @internal */
        this._hasChanges = false;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.value;
    }
    setValue(newValue, flags) {
        this.value = newValue;
        this._hasChanges = newValue !== this._oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this._flushChanges();
        }
    }
    /** @internal */
    _flushChanges() {
        if (this._hasChanges) {
            this._hasChanges = false;
            const currentValue = this.value;
            const nameIndex = this._nameIndex;
            const classesToAdd = getClassesToAdd(currentValue);
            let version = this._version;
            this._oldValue = currentValue;
            // Get strings split on a space not including empties
            if (classesToAdd.length > 0) {
                this._addClassesAndUpdateIndex(classesToAdd);
            }
            this._version += 1;
            // First call to setValue?  We're done.
            if (version === 0) {
                return;
            }
            // Remove classes from previous version.
            version -= 1;
            for (const name in nameIndex) {
                if (!Object.prototype.hasOwnProperty.call(nameIndex, name) || nameIndex[name] !== version) {
                    continue;
                }
                // TODO: this has the side-effect that classes already present which are added again,
                // will be removed if they're not present in the next update.
                // Better would be do have some configurability for this behavior, allowing the user to
                // decide whether initial classes always need to be kept, always removed, or something in between
                this.obj.classList.remove(name);
            }
        }
    }
    /** @internal */
    _addClassesAndUpdateIndex(classes) {
        const node = this.obj;
        const ii = classes.length;
        let i = 0;
        let className;
        for (; i < ii; i++) {
            className = classes[i];
            if (className.length === 0) {
                continue;
            }
            this._nameIndex[className] = this._version;
            node.classList.add(className);
        }
    }
}
function getClassesToAdd(object) {
    if (typeof object === 'string') {
        return splitClassString(object);
    }
    if (typeof object !== 'object') {
        return emptyArray;
    }
    if (object instanceof Array) {
        const len = object.length;
        if (len > 0) {
            const classes = [];
            let i = 0;
            for (; len > i; ++i) {
                classes.push(...getClassesToAdd(object[i]));
            }
            return classes;
        }
        else {
            return emptyArray;
        }
    }
    const classes = [];
    let property;
    for (property in object) {
        // Let non typical values also evaluate true so disable bool check
        if (Boolean(object[property])) {
            // We must do this in case object property has a space in the name which results in two classes
            if (property.includes(' ')) {
                classes.push(...splitClassString(property));
            }
            else {
                classes.push(property);
            }
        }
    }
    return classes;
}
function splitClassString(classString) {
    const matches = classString.match(/\S+/g);
    if (matches === null) {
        return emptyArray;
    }
    return matches;
}

function cssModules(...modules) {
    return new CSSModulesProcessorRegistry(modules);
}
class CSSModulesProcessorRegistry {
    constructor(modules) {
        this.modules = modules;
    }
    register(container) {
        var _a;
        const classLookup = Object.assign({}, ...this.modules);
        const ClassCustomAttribute = CustomAttribute.define({
            name: 'class',
            bindables: ['value'],
        }, (_a = class CustomAttributeClass {
                constructor(element) {
                    this.element = element;
                }
                binding() {
                    this.valueChanged();
                }
                valueChanged() {
                    if (!this.value) {
                        this.element.className = '';
                        return;
                    }
                    this.element.className = getClassesToAdd(this.value).map(x => classLookup[x] || x).join(' ');
                }
            },
            _a.inject = [INode],
            _a));
        container.register(ClassCustomAttribute);
    }
}
function shadowCSS(...css) {
    return new ShadowDOMRegistry(css);
}
const IShadowDOMStyleFactory = DI.createInterface('IShadowDOMStyleFactory', x => x.cachedCallback(handler => {
    if (AdoptedStyleSheetsStyles.supported(handler.get(IPlatform))) {
        return handler.get(AdoptedStyleSheetsStylesFactory);
    }
    return handler.get(StyleElementStylesFactory);
}));
class ShadowDOMRegistry {
    constructor(css) {
        this.css = css;
    }
    register(container) {
        const sharedStyles = container.get(IShadowDOMGlobalStyles);
        const factory = container.get(IShadowDOMStyleFactory);
        container.register(Registration.instance(IShadowDOMStyles, factory.createStyles(this.css, sharedStyles)));
    }
}
class AdoptedStyleSheetsStylesFactory {
    constructor(p) {
        this.p = p;
        this.cache = new Map();
    }
    createStyles(localStyles, sharedStyles) {
        return new AdoptedStyleSheetsStyles(this.p, localStyles, this.cache, sharedStyles);
    }
}
AdoptedStyleSheetsStylesFactory.inject = [IPlatform];
class StyleElementStylesFactory {
    constructor(p) {
        this.p = p;
    }
    createStyles(localStyles, sharedStyles) {
        return new StyleElementStyles(this.p, localStyles, sharedStyles);
    }
}
StyleElementStylesFactory.inject = [IPlatform];
const IShadowDOMStyles = DI.createInterface('IShadowDOMStyles');
const IShadowDOMGlobalStyles = DI.createInterface('IShadowDOMGlobalStyles', x => x.instance({ applyTo: noop }));
class AdoptedStyleSheetsStyles {
    constructor(p, localStyles, styleSheetCache, sharedStyles = null) {
        this.sharedStyles = sharedStyles;
        this.styleSheets = localStyles.map(x => {
            let sheet;
            if (x instanceof p.CSSStyleSheet) {
                sheet = x;
            }
            else {
                sheet = styleSheetCache.get(x);
                if (sheet === void 0) {
                    sheet = new p.CSSStyleSheet();
                    sheet.replaceSync(x);
                    styleSheetCache.set(x, sheet);
                }
            }
            return sheet;
        });
    }
    static supported(p) {
        return 'adoptedStyleSheets' in p.ShadowRoot.prototype;
    }
    applyTo(shadowRoot) {
        if (this.sharedStyles !== null) {
            this.sharedStyles.applyTo(shadowRoot);
        }
        // https://wicg.github.io/construct-stylesheets/
        // https://developers.google.com/web/updates/2019/02/constructable-stylesheets
        shadowRoot.adoptedStyleSheets = [
            ...shadowRoot.adoptedStyleSheets,
            ...this.styleSheets
        ];
    }
}
class StyleElementStyles {
    constructor(p, localStyles, sharedStyles = null) {
        this.p = p;
        this.localStyles = localStyles;
        this.sharedStyles = sharedStyles;
    }
    applyTo(shadowRoot) {
        const styles = this.localStyles;
        const p = this.p;
        for (let i = styles.length - 1; i > -1; --i) {
            const element = p.document.createElement('style');
            element.innerHTML = styles[i];
            shadowRoot.prepend(element);
        }
        if (this.sharedStyles !== null) {
            this.sharedStyles.applyTo(shadowRoot);
        }
    }
}
const StyleConfiguration = {
    shadowDOM(config) {
        return AppTask.beforeCreate(IContainer, container => {
            if (config.sharedStyles != null) {
                const factory = container.get(IShadowDOMStyleFactory);
                container.register(Registration.instance(IShadowDOMGlobalStyles, factory.createStyles(config.sharedStyles, null)));
            }
        });
    }
};

const { enter, exit } = ConnectableSwitcher;
const { wrap, unwrap } = ProxyObservable;
class ComputedWatcher {
    constructor(obj, observerLocator, get, cb, useProxy) {
        this.obj = obj;
        this.get = get;
        this.cb = cb;
        this.useProxy = useProxy;
        this.interceptor = this;
        this.value = void 0;
        this.isBound = false;
        // todo: maybe use a counter allow recursive call to a certain level
        this.running = false;
        this.oL = observerLocator;
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    $bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.compute();
    }
    $unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.obs.clear(true);
    }
    run() {
        if (!this.isBound || this.running) {
            return;
        }
        const obj = this.obj;
        const oldValue = this.value;
        const newValue = this.compute();
        if (!Object.is(newValue, oldValue)) {
            // should optionally queue
            this.cb.call(obj, newValue, oldValue, obj);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            enter(this);
            return this.value = unwrap(this.get.call(void 0, this.useProxy ? wrap(this.obj) : this.obj, this));
        }
        finally {
            this.obs.clear(false);
            this.running = false;
            exit(this);
        }
    }
}
class ExpressionWatcher {
    constructor(scope, locator, oL, expression, callback) {
        this.scope = scope;
        this.locator = locator;
        this.oL = oL;
        this.expression = expression;
        this.callback = callback;
        this.interceptor = this;
        this.isBound = false;
        this.obj = scope.bindingContext;
    }
    handleChange(value) {
        const expr = this.expression;
        const obj = this.obj;
        const oldValue = this.value;
        const canOptimize = expr.$kind === 10082 /* AccessScope */ && this.obs.count === 1;
        if (!canOptimize) {
            this.obs.version++;
            value = expr.evaluate(0, this.scope, this.locator, this);
            this.obs.clear(false);
        }
        if (!Object.is(value, oldValue)) {
            this.value = value;
            // should optionally queue for batch synchronous
            this.callback.call(obj, value, oldValue, obj);
        }
    }
    $bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.obs.version++;
        this.value = this.expression.evaluate(0 /* none */, this.scope, this.locator, this);
        this.obs.clear(false);
    }
    $unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.obs.clear(true);
        this.value = void 0;
    }
}
connectable(ComputedWatcher);
connectable(ExpressionWatcher);

const ILifecycleHooks = DI.createInterface('ILifecycleHooks');
class LifecycleHooksEntry {
    constructor(definition, instance) {
        this.definition = definition;
        this.instance = instance;
    }
}
/**
 * This definition has no specific properties yet other than the type, but is in place for future extensions.
 *
 * See: https://github.com/aurelia/aurelia/issues/1044
 */
class LifecycleHooksDefinition {
    constructor(Type, propertyNames) {
        this.Type = Type;
        this.propertyNames = propertyNames;
    }
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    static create(def, Type) {
        const propertyNames = new Set();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let proto = Type.prototype;
        while (proto !== Object.prototype) {
            for (const name of Object.getOwnPropertyNames(proto)) {
                // This is the only check we will do for now. Filtering on e.g. function types might not always work properly when decorators come into play. This would need more testing first.
                if (name !== 'constructor') {
                    propertyNames.add(name);
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            proto = Object.getPrototypeOf(proto);
        }
        return new LifecycleHooksDefinition(Type, propertyNames);
    }
    register(container) {
        Registration.singleton(ILifecycleHooks, this.Type).register(container);
    }
}
const containerLookup = new WeakMap();
const lhBaseName = Protocol.annotation.keyFor('lifecycle-hooks');
const LifecycleHooks = Object.freeze({
    name: lhBaseName,
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    define(def, Type) {
        const definition = LifecycleHooksDefinition.create(def, Type);
        Metadata.define(lhBaseName, definition, Type);
        Protocol.resource.appendTo(Type, lhBaseName);
        return definition.Type;
    },
    resolve(ctx) {
        let lookup = containerLookup.get(ctx);
        if (lookup === void 0) {
            lookup = new LifecycleHooksLookupImpl();
            const root = ctx.root;
            const instances = root.id === ctx.id
                ? ctx.getAll(ILifecycleHooks)
                // if it's not root, only resolve it from the current context when it has the resolver
                // to maintain resources semantic: current -> root
                : ctx.has(ILifecycleHooks, false)
                    ? [...root.getAll(ILifecycleHooks), ...ctx.getAll(ILifecycleHooks)]
                    : root.getAll(ILifecycleHooks);
            let instance;
            let definition;
            let entry;
            let name;
            let entries;
            for (instance of instances) {
                definition = Metadata.getOwn(lhBaseName, instance.constructor);
                entry = new LifecycleHooksEntry(definition, instance);
                for (name of definition.propertyNames) {
                    entries = lookup[name];
                    if (entries === void 0) {
                        lookup[name] = [entry];
                    }
                    else {
                        entries.push(entry);
                    }
                }
            }
        }
        return lookup;
    },
});
class LifecycleHooksLookupImpl {
}
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
function lifecycleHooks() {
    return function decorator(target) {
        return LifecycleHooks.define({}, target);
    };
}

const IViewFactory = DI.createInterface('IViewFactory');
class ViewFactory {
    constructor(container, def) {
        this.isCaching = false;
        this.cache = null;
        this.cacheSize = -1;
        this.name = def.name;
        this.container = container;
        this.def = def;
    }
    setCacheSize(size, doNotOverrideIfAlreadySet) {
        if (size) {
            if (size === '*') {
                size = ViewFactory.maxCacheSize;
            }
            else if (typeof size === 'string') {
                size = parseInt(size, 10);
            }
            if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
                this.cacheSize = size;
            }
        }
        if (this.cacheSize > 0) {
            this.cache = [];
        }
        else {
            this.cache = null;
        }
        this.isCaching = this.cacheSize > 0;
    }
    canReturnToCache(controller) {
        return this.cache != null && this.cache.length < this.cacheSize;
    }
    tryReturnToCache(controller) {
        if (this.canReturnToCache(controller)) {
            this.cache.push(controller);
            return true;
        }
        return false;
    }
    create(flags, parentController) {
        const cache = this.cache;
        let controller;
        if (cache != null && cache.length > 0) {
            controller = cache.pop();
            return controller;
        }
        controller = Controller.$view(this, flags, parentController);
        return controller;
    }
}
ViewFactory.maxCacheSize = 0xFFFF;
const seenViews = new WeakSet();
function notYetSeen($view) {
    return !seenViews.has($view);
}
function toCustomElementDefinition($view) {
    seenViews.add($view);
    return CustomElementDefinition.create($view);
}
const viewsBaseName = Protocol.resource.keyFor('views');
const Views = Object.freeze({
    name: viewsBaseName,
    has(value) {
        return typeof value === 'function' && (Metadata.hasOwn(viewsBaseName, value) || '$views' in value);
    },
    get(value) {
        if (typeof value === 'function' && '$views' in value) {
            // TODO: a `get` operation with side effects is not a good thing. Should refactor this to a proper resource kind.
            const $views = value.$views;
            const definitions = $views.filter(notYetSeen).map(toCustomElementDefinition);
            for (const def of definitions) {
                Views.add(value, def);
            }
        }
        let views = Metadata.getOwn(viewsBaseName, value);
        if (views === void 0) {
            Metadata.define(viewsBaseName, views = [], value);
        }
        return views;
    },
    add(Type, partialDefinition) {
        const definition = CustomElementDefinition.create(partialDefinition);
        let views = Metadata.getOwn(viewsBaseName, Type);
        if (views === void 0) {
            Metadata.define(viewsBaseName, views = [definition], Type);
        }
        else {
            views.push(definition);
        }
        return views;
    },
});
function view(v) {
    return function (target) {
        Views.add(target, v);
    };
}
const IViewLocator = DI.createInterface('IViewLocator', x => x.singleton(ViewLocator));
class ViewLocator {
    constructor() {
        /** @internal */
        this._modelInstanceToBoundComponent = new WeakMap();
        /** @internal */
        this._modelTypeToUnboundComponent = new Map();
    }
    getViewComponentForObject(object, viewNameOrSelector) {
        if (object) {
            const availableViews = Views.has(object.constructor) ? Views.get(object.constructor) : [];
            const resolvedViewName = typeof viewNameOrSelector === 'function'
                ? viewNameOrSelector(object, availableViews)
                : this._getViewName(availableViews, viewNameOrSelector);
            return this._getOrCreateBoundComponent(object, availableViews, resolvedViewName);
        }
        return null;
    }
    /** @internal */
    _getOrCreateBoundComponent(object, availableViews, resolvedViewName) {
        let lookup = this._modelInstanceToBoundComponent.get(object);
        let BoundComponent;
        if (lookup === void 0) {
            lookup = {};
            this._modelInstanceToBoundComponent.set(object, lookup);
        }
        else {
            BoundComponent = lookup[resolvedViewName];
        }
        if (BoundComponent === void 0) {
            const UnboundComponent = this._getOrCreateUnboundComponent(object, availableViews, resolvedViewName);
            BoundComponent = CustomElement.define(CustomElement.getDefinition(UnboundComponent), class extends UnboundComponent {
                constructor() {
                    super(object);
                }
            });
            lookup[resolvedViewName] = BoundComponent;
        }
        return BoundComponent;
    }
    /** @internal */
    _getOrCreateUnboundComponent(object, availableViews, resolvedViewName) {
        let lookup = this._modelTypeToUnboundComponent.get(object.constructor);
        let UnboundComponent;
        if (lookup === void 0) {
            lookup = {};
            this._modelTypeToUnboundComponent.set(object.constructor, lookup);
        }
        else {
            UnboundComponent = lookup[resolvedViewName];
        }
        if (UnboundComponent === void 0) {
            UnboundComponent = CustomElement.define(this._getView(availableViews, resolvedViewName), class {
                constructor(viewModel) {
                    this.viewModel = viewModel;
                }
                define(controller, hydrationContext, definition) {
                    const vm = this.viewModel;
                    controller.scope = Scope.fromParent(controller.scope, vm);
                    if (vm.define !== void 0) {
                        return vm.define(controller, hydrationContext, definition);
                    }
                }
            });
            const proto = UnboundComponent.prototype;
            if ('hydrating' in object) {
                proto.hydrating = function hydrating(controller) {
                    this.viewModel.hydrating(controller);
                };
            }
            if ('hydrated' in object) {
                proto.hydrated = function hydrated(controller) {
                    this.viewModel.hydrated(controller);
                };
            }
            if ('created' in object) {
                proto.created = function created(controller) {
                    this.viewModel.created(controller);
                };
            }
            if ('binding' in object) {
                proto.binding = function binding(initiator, parent, flags) {
                    return this.viewModel.binding(initiator, parent, flags);
                };
            }
            if ('bound' in object) {
                proto.bound = function bound(initiator, parent, flags) {
                    return this.viewModel.bound(initiator, parent, flags);
                };
            }
            if ('attaching' in object) {
                proto.attaching = function attaching(initiator, parent, flags) {
                    return this.viewModel.attaching(initiator, parent, flags);
                };
            }
            if ('attached' in object) {
                proto.attached = function attached(initiator, flags) {
                    return this.viewModel.attached(initiator, flags);
                };
            }
            if ('detaching' in object) {
                proto.detaching = function detaching(initiator, parent, flags) {
                    return this.viewModel.detaching(initiator, parent, flags);
                };
            }
            if ('unbinding' in object) {
                proto.unbinding = function unbinding(initiator, parent, flags) {
                    return this.viewModel.unbinding(initiator, parent, flags);
                };
            }
            if ('dispose' in object) {
                proto.dispose = function dispose() {
                    this.viewModel.dispose();
                };
            }
            lookup[resolvedViewName] = UnboundComponent;
        }
        return UnboundComponent;
    }
    /** @internal */
    _getViewName(views, requestedName) {
        if (requestedName) {
            return requestedName;
        }
        if (views.length === 1) {
            return views[0].name;
        }
        return 'default-view';
    }
    /** @internal */
    _getView(views, name) {
        const v = views.find(x => x.name === name);
        if (v === void 0) {
            throw new Error(`Could not find view: ${name}`);
        }
        return v;
    }
}

const IRendering = DI.createInterface('IRendering', x => x.singleton(Rendering));
class Rendering {
    constructor(container) {
        /** @internal */
        this._compilationCache = new WeakMap();
        /** @internal */
        this._fragmentCache = new WeakMap();
        this._p = (this._ctn = container.root).get(IPlatform);
        this._empty = new FragmentNodeSequence(this._p, this._p.document.createDocumentFragment());
    }
    get renderers() {
        return this.rs == null
            ? (this.rs = this._ctn.getAll(IRenderer, false).reduce((all, r) => {
                all[r.instructionType] = r;
                return all;
            }, createLookup()))
            : this.rs;
    }
    compile(definition, container, compilationInstruction) {
        if (definition.needsCompile !== false) {
            const compiledMap = this._compilationCache;
            const compiler = container.get(ITemplateCompiler);
            let compiled = compiledMap.get(definition);
            if (compiled == null) {
                compiledMap.set(definition, compiled = compiler.compile(definition, container, compilationInstruction));
            }
            else {
                // todo:
                // should only register if the compiled def resolution is string
                // instead of direct resources
                container.register(...compiled.dependencies);
            }
            return compiled;
        }
        return definition;
    }
    getViewFactory(definition, container) {
        return new ViewFactory(container, CustomElementDefinition.getOrCreate(definition));
    }
    createNodes(definition) {
        if (definition.enhance === true) {
            return new FragmentNodeSequence(this._p, definition.template);
        }
        let fragment;
        const cache = this._fragmentCache;
        if (cache.has(definition)) {
            fragment = cache.get(definition);
        }
        else {
            const p = this._p;
            const doc = p.document;
            const template = definition.template;
            let tpl;
            if (template === null) {
                fragment = null;
            }
            else if (template instanceof p.Node) {
                if (template.nodeName === 'TEMPLATE') {
                    fragment = doc.adoptNode(template.content);
                }
                else {
                    (fragment = doc.adoptNode(doc.createDocumentFragment())).appendChild(template.cloneNode(true));
                }
            }
            else {
                tpl = doc.createElement('template');
                if (typeof template === 'string') {
                    tpl.innerHTML = template;
                }
                doc.adoptNode(fragment = tpl.content);
            }
            cache.set(definition, fragment);
        }
        return fragment == null
            ? this._empty
            : new FragmentNodeSequence(this._p, fragment.cloneNode(true));
    }
    render(flags, controller, targets, definition, host) {
        const rows = definition.instructions;
        const renderers = this.renderers;
        const ii = targets.length;
        if (targets.length !== rows.length) {
            throw new Error(`AUR0757:${ii}<>${rows.length}`);
        }
        let i = 0;
        let j = 0;
        let jj = 0;
        let row;
        let instruction;
        let target;
        if (ii > 0) {
            while (ii > i) {
                row = rows[i];
                target = targets[i];
                j = 0;
                jj = row.length;
                while (jj > j) {
                    instruction = row[j];
                    renderers[instruction.type].render(flags, controller, target, instruction);
                    ++j;
                }
                ++i;
            }
        }
        if (host !== void 0 && host !== null) {
            row = definition.surrogates;
            if ((jj = row.length) > 0) {
                j = 0;
                while (jj > j) {
                    instruction = row[j];
                    renderers[instruction.type].render(flags, controller, host, instruction);
                    ++j;
                }
            }
        }
    }
}
/** @internal */
Rendering.inject = [IContainer];

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
var MountTarget;
(function (MountTarget) {
    MountTarget[MountTarget["none"] = 0] = "none";
    MountTarget[MountTarget["host"] = 1] = "host";
    MountTarget[MountTarget["shadowRoot"] = 2] = "shadowRoot";
    MountTarget[MountTarget["location"] = 3] = "location";
})(MountTarget || (MountTarget = {}));
const optionalCeFind = { optional: true };
const controllerLookup = new WeakMap();
class Controller {
    constructor(container, vmKind, flags, definition, 
    /**
     * The viewFactory. Only present for synthetic views.
     */
    viewFactory, 
    /**
     * The backing viewModel. Only present for custom attributes and elements.
     */
    viewModel, 
    /**
     * The physical host dom node.
     *
     * For containerless elements, this node will be removed from the DOM and replaced by a comment, which is assigned to the `location` property.
     *
     * For ShadowDOM elements, this will be the original declaring element, NOT the shadow root (the shadow root is stored on the `shadowRoot` property)
     */
    host) {
        this.container = container;
        this.vmKind = vmKind;
        this.flags = flags;
        this.definition = definition;
        this.viewFactory = viewFactory;
        this.viewModel = viewModel;
        this.host = host;
        this.id = nextId('au$component');
        this.head = null;
        this.tail = null;
        this.next = null;
        this.parent = null;
        this.bindings = null;
        this.children = null;
        this.hasLockedScope = false;
        this.isStrictBinding = false;
        this.scope = null;
        this.isBound = false;
        // If a host from another custom element was passed in, then this will be the controller for that custom element (could be `au-viewport` for example).
        // In that case, this controller will create a new host node (with the definition's name) and use that as the target host for the nodes instead.
        // That host node is separately mounted to the host controller's original host node.
        this.hostController = null;
        this.mountTarget = 0 /* none */;
        this.shadowRoot = null;
        this.nodes = null;
        this.location = null;
        this.lifecycleHooks = null;
        this.state = 0 /* none */;
        /** @internal */
        this._fullyNamed = false;
        /** @internal */
        this._childrenObs = emptyArray;
        this.$initiator = null;
        this.$flags = 0 /* none */;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this._activatingStack = 0;
        this._detachingStack = 0;
        this._unbindingStack = 0;
        this.logger = null;
        this.debug = false;
        this._rendering = container.root.get(IRendering);
        switch (vmKind) {
            case 1 /* customAttribute */:
            case 0 /* customElement */:
                // todo: cache-able based on constructor type
                this.hooks = new HooksDefinition(viewModel);
                break;
            case 2 /* synthetic */:
                this.hooks = HooksDefinition.none;
                break;
        }
    }
    get isActive() {
        return (this.state & (1 /* activating */ | 2 /* activated */)) > 0 && (this.state & 4 /* deactivating */) === 0;
    }
    get name() {
        var _a;
        if (this.parent === null) {
            switch (this.vmKind) {
                case 1 /* customAttribute */:
                    return `[${this.definition.name}]`;
                case 0 /* customElement */:
                    return this.definition.name;
                case 2 /* synthetic */:
                    return this.viewFactory.name;
            }
        }
        switch (this.vmKind) {
            case 1 /* customAttribute */:
                return `${this.parent.name}>[${this.definition.name}]`;
            case 0 /* customElement */:
                return `${this.parent.name}>${this.definition.name}`;
            case 2 /* synthetic */:
                return this.viewFactory.name === ((_a = this.parent.definition) === null || _a === void 0 ? void 0 : _a.name)
                    ? `${this.parent.name}[view]`
                    : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    static getCached(viewModel) {
        return controllerLookup.get(viewModel);
    }
    static getCachedOrThrow(viewModel) {
        const $el = Controller.getCached(viewModel);
        if ($el === void 0) {
            throw new Error(`AUR0500:${viewModel}`);
        }
        return $el;
    }
    /**
     * Create a controller for a custom element based on a given set of parameters
     *
     * @param ctn - The own container of the custom element
     * @param viewModel - The view model object (can be any object if a definition is specified)
     *
     * Semi private API
     */
    static $el(ctn, viewModel, host, hydrationInst, flags = 0 /* none */, 
    // Use this when `instance.constructor` is not a custom element type
    // to pass on the CustomElement definition
    definition = void 0) {
        if (controllerLookup.has(viewModel)) {
            return controllerLookup.get(viewModel);
        }
        definition = definition !== null && definition !== void 0 ? definition : CustomElement.getDefinition(viewModel.constructor);
        const controller = new Controller(
        /* container      */ ctn, 0 /* customElement */, 
        /* flags          */ flags, 
        /* definition     */ definition, 
        /* viewFactory    */ null, 
        /* viewModel      */ viewModel, 
        /* host           */ host);
        // the hydration context this controller is provided with
        const hydrationContext = ctn.get(optional(IHydrationContext));
        if (definition.dependencies.length > 0) {
            ctn.register(...definition.dependencies);
        }
        // each CE controller provides its own hydration context for its internal template
        ctn.registerResolver(IHydrationContext, new InstanceProvider('IHydrationContext', new HydrationContext(controller, hydrationInst, hydrationContext)));
        controllerLookup.set(viewModel, controller);
        if (hydrationInst == null || hydrationInst.hydrate !== false) {
            controller._hydrateCustomElement(hydrationInst, hydrationContext);
        }
        return controller;
    }
    /**
     * Create a controller for a custom attribute based on a given set of parameters
     *
     * @param ctn - own container associated with the custom attribute object
     * @param viewModel - the view model object
     * @param host - host element where this custom attribute is used
     * @param flags
     * @param definition - the definition of the custom attribute,
     * will be used to override the definition associated with the view model object contructor if given
     */
    static $attr(ctn, viewModel, host, flags = 0 /* none */, 
    /**
     * The definition that will be used to hydrate the custom attribute view model
     *
     * If not given, will be the one associated with the constructor of the attribute view model given.
     */
    definition) {
        if (controllerLookup.has(viewModel)) {
            return controllerLookup.get(viewModel);
        }
        definition = definition !== null && definition !== void 0 ? definition : CustomAttribute.getDefinition(viewModel.constructor);
        const controller = new Controller(
        /* own ct         */ ctn, 1 /* customAttribute */, 
        /* flags          */ flags, 
        /* definition     */ definition, 
        /* viewFactory    */ null, 
        /* viewModel      */ viewModel, 
        /* host           */ host);
        controllerLookup.set(viewModel, controller);
        controller._hydrateCustomAttribute();
        return controller;
    }
    /**
     * Create a synthetic view (controller) for a given factory
     *
     * @param viewFactory
     * @param flags
     * @param parentController - the parent controller to connect the created view with. Used in activation
     *
     * Semi private API
     */
    static $view(viewFactory, flags = 0 /* none */, parentController = void 0) {
        const controller = new Controller(
        /* container      */ viewFactory.container, 2 /* synthetic */, 
        /* flags          */ flags, 
        /* definition     */ null, 
        /* viewFactory    */ viewFactory, 
        /* viewModel      */ null, 
        /* host           */ null);
        controller.parent = parentController !== null && parentController !== void 0 ? parentController : null;
        controller._hydrateSynthetic( /* context */);
        return controller;
    }
    /** @internal */
    _hydrateCustomElement(hydrationInst, 
    /**
     * The context where this custom element is hydrated.
     *
     * This is the context controller creating this this controller
     */
    hydrationContext) {
        this.logger = this.container.get(ILogger).root;
        this.debug = this.logger.config.level <= 1 /* debug */;
        if (this.debug) {
            this.logger = this.logger.scopeTo(this.name);
        }
        const container = this.container;
        const flags = this.flags;
        const instance = this.viewModel;
        let definition = this.definition;
        this.scope = Scope.create(instance, null, true);
        if (definition.watches.length > 0) {
            createWatchers(this, container, definition, instance);
        }
        createObservers(this, definition, flags, instance);
        this._childrenObs = createChildrenObservers(this, definition, flags, instance);
        if (this.hooks.hasDefine) {
            if (this.debug) {
                this.logger.trace(`invoking define() hook`);
            }
            const result = instance.define(
            /* controller      */ this, 
            /* parentContainer */ hydrationContext, 
            /* definition      */ definition);
            if (result !== void 0 && result !== definition) {
                definition = CustomElementDefinition.getOrCreate(result);
            }
        }
        this.lifecycleHooks = LifecycleHooks.resolve(container);
        // Support Recursive Components by adding self to own context
        definition.register(container);
        if (definition.injectable !== null) {
            container.registerResolver(definition.injectable, new InstanceProvider('definition.injectable', instance));
        }
        // If this is the root controller, then the AppRoot will invoke things in the following order:
        // - Controller.hydrateCustomElement
        // - runAppTasks('hydrating') // may return a promise
        // - Controller.compile
        // - runAppTasks('hydrated') // may return a promise
        // - Controller.compileChildren
        // This keeps hydration synchronous while still allowing the composition root compile hooks to do async work.
        if (hydrationInst == null || hydrationInst.hydrate !== false) {
            this._hydrate(hydrationInst);
            this._hydrateChildren();
        }
    }
    /** @internal */
    _hydrate(hydrationInst) {
        if (this.hooks.hasHydrating) {
            if (this.debug) {
                this.logger.trace(`invoking hydrating() hook`);
            }
            this.viewModel.hydrating(this);
        }
        const compiledDef = this._compiledDef = this._rendering.compile(this.definition, this.container, hydrationInst);
        const { shadowOptions, isStrictBinding, hasSlots, containerless } = compiledDef;
        this.isStrictBinding = isStrictBinding;
        if ((this.hostController = CustomElement.for(this.host, optionalCeFind)) !== null) {
            this.host = this.container.root.get(IPlatform).document.createElement(this.definition.name);
        }
        setRef(this.host, CustomElement.name, this);
        setRef(this.host, this.definition.key, this);
        if (shadowOptions !== null || hasSlots) {
            if (containerless) {
                throw new Error('AUR0501');
            }
            setRef(this.shadowRoot = this.host.attachShadow(shadowOptions !== null && shadowOptions !== void 0 ? shadowOptions : defaultShadowOptions), CustomElement.name, this);
            setRef(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2 /* shadowRoot */;
        }
        else if (containerless) {
            setRef(this.location = convertToRenderLocation(this.host), CustomElement.name, this);
            setRef(this.location, this.definition.key, this);
            this.mountTarget = 3 /* location */;
        }
        else {
            this.mountTarget = 1 /* host */;
        }
        this.viewModel.$controller = this;
        this.nodes = this._rendering.createNodes(compiledDef);
        if (this.hooks.hasHydrated) {
            if (this.debug) {
                this.logger.trace(`invoking hydrated() hook`);
            }
            this.viewModel.hydrated(this);
        }
    }
    /** @internal */
    _hydrateChildren() {
        this._rendering.render(
        /* flags      */ this.flags, 
        /* controller */ this, 
        /* targets    */ this.nodes.findTargets(), 
        /* definition */ this._compiledDef, 
        /* host       */ this.host);
        if (this.hooks.hasCreated) {
            if (this.debug) {
                this.logger.trace(`invoking created() hook`);
            }
            this.viewModel.created(this);
        }
    }
    _hydrateCustomAttribute() {
        const definition = this.definition;
        const instance = this.viewModel;
        if (definition.watches.length > 0) {
            createWatchers(this, this.container, definition, instance);
        }
        createObservers(this, definition, this.flags, instance);
        instance.$controller = this;
        this.lifecycleHooks = LifecycleHooks.resolve(this.container);
        if (this.hooks.hasCreated) {
            if (this.debug) {
                this.logger.trace(`invoking created() hook`);
            }
            this.viewModel.created(this);
        }
    }
    _hydrateSynthetic() {
        this._compiledDef = this._rendering.compile(this.viewFactory.def, this.container, null);
        this.isStrictBinding = this._compiledDef.isStrictBinding;
        this._rendering.render(
        /* flags      */ this.flags, 
        /* controller */ this, 
        /* targets    */ (this.nodes = this._rendering.createNodes(this._compiledDef)).findTargets(), 
        /* definition */ this._compiledDef, 
        /* host       */ void 0);
    }
    activate(initiator, parent, flags, scope) {
        var _a;
        switch (this.state) {
            case 0 /* none */:
            case 8 /* deactivated */:
                if (!(parent === null || parent.isActive)) {
                    // If this is not the root, and the parent is either:
                    // 1. Not activated, or activating children OR
                    // 2. Deactivating itself
                    // abort.
                    return;
                }
                // Otherwise, proceed normally.
                // 'deactivated' and 'none' are treated the same because, from an activation perspective, they mean the same thing.
                this.state = 1 /* activating */;
                break;
            case 2 /* activated */:
                // If we're already activated, no need to do anything.
                return;
            case 32 /* disposed */:
                throw new Error(`AUR0502:${this.name}`);
            default:
                throw new Error(`AUR0503:${this.name} ${stringifyState(this.state)}`);
        }
        this.parent = parent;
        if (this.debug && !this._fullyNamed) {
            this._fullyNamed = true;
            ((_a = this.logger) !== null && _a !== void 0 ? _a : (this.logger = this.container.get(ILogger).root.scopeTo(this.name))).trace(`activate()`);
        }
        flags |= 2 /* fromBind */;
        switch (this.vmKind) {
            case 0 /* customElement */:
                // Custom element scope is created and assigned during hydration
                this.scope.parentScope = scope !== null && scope !== void 0 ? scope : null;
                break;
            case 1 /* customAttribute */:
                this.scope = scope !== null && scope !== void 0 ? scope : null;
                break;
            case 2 /* synthetic */:
                // maybe only check when there's not already a scope
                if (scope === void 0 || scope === null) {
                    throw new Error('AUR0504');
                }
                if (!this.hasLockedScope) {
                    this.scope = scope;
                }
                break;
        }
        if (this.isStrictBinding) {
            flags |= 1 /* isStrictBindingStrategy */;
        }
        this.$initiator = initiator;
        this.$flags = flags;
        // opposing leave is called in attach() (which will trigger attached())
        this._enterActivating();
        if (this.hooks.hasBinding) {
            if (this.debug) {
                this.logger.trace(`binding()`);
            }
            const ret = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this._ensurePromise();
                ret.then(() => {
                    this.bind();
                }).catch(err => {
                    this._reject(err);
                });
                return this.$promise;
            }
        }
        this.bind();
        return this.$promise;
    }
    bind() {
        if (this.debug) {
            this.logger.trace(`bind()`);
        }
        let i = 0;
        let ii = this._childrenObs.length;
        let ret;
        // timing: after binding, before bound
        // reason: needs to start observing before all the bindings finish their $bind phase,
        //         so that changes in one binding can be reflected into the other, regardless the index of the binding
        //
        // todo: is this timing appropriate?
        if (ii > 0) {
            while (ii > i) {
                this._childrenObs[i].start();
                ++i;
            }
        }
        if (this.bindings !== null) {
            i = 0;
            ii = this.bindings.length;
            while (ii > i) {
                this.bindings[i].$bind(this.$flags, this.scope);
                ++i;
            }
        }
        if (this.hooks.hasBound) {
            if (this.debug) {
                this.logger.trace(`bound()`);
            }
            ret = this.viewModel.bound(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this._ensurePromise();
                ret.then(() => {
                    this.isBound = true;
                    this._attach();
                }).catch(err => {
                    this._reject(err);
                });
                return;
            }
        }
        this.isBound = true;
        this._attach();
    }
    _append(...nodes) {
        switch (this.mountTarget) {
            case 1 /* host */:
                this.host.append(...nodes);
                break;
            case 2 /* shadowRoot */:
                this.shadowRoot.append(...nodes);
                break;
            case 3 /* location */: {
                let i = 0;
                for (; i < nodes.length; ++i) {
                    this.location.parentNode.insertBefore(nodes[i], this.location);
                }
                break;
            }
        }
    }
    _attach() {
        if (this.debug) {
            this.logger.trace(`attach()`);
        }
        if (this.hostController !== null) {
            switch (this.mountTarget) {
                case 1 /* host */:
                case 2 /* shadowRoot */:
                    this.hostController._append(this.host);
                    break;
                case 3 /* location */:
                    this.hostController._append(this.location.$start, this.location);
                    break;
            }
        }
        switch (this.mountTarget) {
            case 1 /* host */:
                this.nodes.appendTo(this.host, this.definition != null && this.definition.enhance);
                break;
            case 2 /* shadowRoot */: {
                const container = this.container;
                const styles = container.has(IShadowDOMStyles, false)
                    ? container.get(IShadowDOMStyles)
                    : container.get(IShadowDOMGlobalStyles);
                styles.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }
            case 3 /* location */:
                this.nodes.insertBefore(this.location);
                break;
        }
        if (this.hooks.hasAttaching) {
            if (this.debug) {
                this.logger.trace(`attaching()`);
            }
            const ret = this.viewModel.attaching(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this._ensurePromise();
                this._enterActivating();
                ret.then(() => {
                    this._leaveActivating();
                }).catch(err => {
                    this._reject(err);
                });
            }
        }
        // attaching() and child activation run in parallel, and attached() is called when both are finished
        if (this.children !== null) {
            let i = 0;
            for (; i < this.children.length; ++i) {
                // Any promises returned from child activation are cumulatively awaited before this.$promise resolves
                void this.children[i].activate(this.$initiator, this, this.$flags, this.scope);
            }
        }
        // attached() is invoked by Controller#leaveActivating when `activatingStack` reaches 0
        this._leaveActivating();
    }
    deactivate(initiator, parent, flags) {
        switch ((this.state & ~16 /* released */)) {
            case 2 /* activated */:
                // We're fully activated, so proceed with normal deactivation.
                this.state = 4 /* deactivating */;
                break;
            case 0 /* none */:
            case 8 /* deactivated */:
            case 32 /* disposed */:
            case 8 /* deactivated */ | 32 /* disposed */:
                // If we're already deactivated (or even disposed), or never activated in the first place, no need to do anything.
                return;
            default:
                throw new Error(`AUR0505:${this.name} ${stringifyState(this.state)}`);
        }
        if (this.debug) {
            this.logger.trace(`deactivate()`);
        }
        this.$initiator = initiator;
        this.$flags = flags;
        if (initiator === this) {
            this._enterDetaching();
        }
        let i = 0;
        // timing: before deactiving
        // reason: avoid queueing a callback from the mutation observer, caused by the changes of nodes by repeat/if etc...
        // todo: is this appropriate timing?
        if (this._childrenObs.length) {
            for (; i < this._childrenObs.length; ++i) {
                this._childrenObs[i].stop();
            }
        }
        if (this.children !== null) {
            for (i = 0; i < this.children.length; ++i) {
                // Child promise results are tracked by enter/leave combo's
                void this.children[i].deactivate(initiator, this, flags);
            }
        }
        if (this.hooks.hasDetaching) {
            if (this.debug) {
                this.logger.trace(`detaching()`);
            }
            const ret = this.viewModel.detaching(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this._ensurePromise();
                initiator._enterDetaching();
                ret.then(() => {
                    initiator._leaveDetaching();
                }).catch(err => {
                    initiator._reject(err);
                });
            }
        }
        // Note: if a 3rd party plugin happens to do any async stuff in a template controller before calling deactivate on its view,
        // then the linking will become out of order.
        // For framework components, this shouldn't cause issues.
        // We can only prevent that by linking up after awaiting the detaching promise, which would add an extra tick + a fair bit of
        // overhead on this hot path, so it's (for now) a deliberate choice to not account for such situation.
        // Just leaving the note here so that we know to look here if a weird detaching-related timing issue is ever reported.
        if (initiator.head === null) {
            initiator.head = this;
        }
        else {
            initiator.tail.next = this;
        }
        initiator.tail = this;
        if (initiator !== this) {
            // Only detaching is called + the linked list is built when any controller that is not the initiator, is deactivated.
            // The rest is handled by the initiator.
            // This means that descendant controllers have to make sure to await the initiator's promise before doing any subsequent
            // controller api calls, or race conditions might occur.
            return;
        }
        this._leaveDetaching();
        return this.$promise;
    }
    removeNodes() {
        switch (this.vmKind) {
            case 0 /* customElement */:
            case 2 /* synthetic */:
                this.nodes.remove();
                this.nodes.unlink();
        }
        if (this.hostController !== null) {
            switch (this.mountTarget) {
                case 1 /* host */:
                case 2 /* shadowRoot */:
                    this.host.remove();
                    break;
                case 3 /* location */:
                    this.location.$start.remove();
                    this.location.remove();
                    break;
            }
        }
    }
    unbind() {
        if (this.debug) {
            this.logger.trace(`unbind()`);
        }
        const flags = this.$flags | 4 /* fromUnbind */;
        let i = 0;
        if (this.bindings !== null) {
            for (; i < this.bindings.length; ++i) {
                this.bindings[i].$unbind(flags);
            }
        }
        this.parent = null;
        switch (this.vmKind) {
            case 1 /* customAttribute */:
                this.scope = null;
                break;
            case 2 /* synthetic */:
                if (!this.hasLockedScope) {
                    this.scope = null;
                }
                if ((this.state & 16 /* released */) === 16 /* released */ &&
                    !this.viewFactory.tryReturnToCache(this) &&
                    this.$initiator === this) {
                    this.dispose();
                }
                break;
            case 0 /* customElement */:
                this.scope.parentScope = null;
                break;
        }
        if ((flags & 32 /* dispose */) === 32 /* dispose */ && this.$initiator === this) {
            this.dispose();
        }
        this.state = (this.state & 32 /* disposed */) | 8 /* deactivated */;
        this.$initiator = null;
        this._resolve();
    }
    _ensurePromise() {
        if (this.$promise === void 0) {
            this.$promise = new Promise((resolve, reject) => {
                this.$resolve = resolve;
                this.$reject = reject;
            });
            if (this.$initiator !== this) {
                this.parent._ensurePromise();
            }
        }
    }
    _resolve() {
        if (this.$promise !== void 0) {
            _resolve = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            _resolve();
            _resolve = void 0;
        }
    }
    _reject(err) {
        if (this.$promise !== void 0) {
            _reject = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            _reject(err);
            _reject = void 0;
        }
        if (this.$initiator !== this) {
            this.parent._reject(err);
        }
    }
    _enterActivating() {
        ++this._activatingStack;
        if (this.$initiator !== this) {
            this.parent._enterActivating();
        }
    }
    _leaveActivating() {
        if (--this._activatingStack === 0) {
            if (this.hooks.hasAttached) {
                if (this.debug) {
                    this.logger.trace(`attached()`);
                }
                _retPromise = this.viewModel.attached(this.$initiator, this.$flags);
                if (_retPromise instanceof Promise) {
                    this._ensurePromise();
                    _retPromise.then(() => {
                        this.state = 2 /* activated */;
                        // Resolve this.$promise, signaling that activation is done (path 1 of 2)
                        this._resolve();
                        if (this.$initiator !== this) {
                            this.parent._leaveActivating();
                        }
                    }).catch(err => {
                        this._reject(err);
                    });
                    _retPromise = void 0;
                    return;
                }
                _retPromise = void 0;
            }
            this.state = 2 /* activated */;
            // Resolve this.$promise (if present), signaling that activation is done (path 2 of 2)
            this._resolve();
        }
        if (this.$initiator !== this) {
            this.parent._leaveActivating();
        }
    }
    _enterDetaching() {
        ++this._detachingStack;
    }
    _leaveDetaching() {
        if (--this._detachingStack === 0) {
            // Note: this controller is the initiator (detach is only ever called on the initiator)
            if (this.debug) {
                this.logger.trace(`detach()`);
            }
            this._enterUnbinding();
            this.removeNodes();
            let cur = this.$initiator.head;
            while (cur !== null) {
                if (cur !== this) {
                    if (cur.debug) {
                        cur.logger.trace(`detach()`);
                    }
                    cur.removeNodes();
                }
                if (cur.hooks.hasUnbinding) {
                    if (cur.debug) {
                        cur.logger.trace('unbinding()');
                    }
                    _retPromise = cur.viewModel.unbinding(cur.$initiator, cur.parent, cur.$flags);
                    if (_retPromise instanceof Promise) {
                        this._ensurePromise();
                        this._enterUnbinding();
                        _retPromise.then(() => {
                            this._leaveUnbinding();
                        }).catch(err => {
                            this._reject(err);
                        });
                    }
                    _retPromise = void 0;
                }
                cur = cur.next;
            }
            this._leaveUnbinding();
        }
    }
    _enterUnbinding() {
        ++this._unbindingStack;
    }
    _leaveUnbinding() {
        if (--this._unbindingStack === 0) {
            if (this.debug) {
                this.logger.trace(`unbind()`);
            }
            let cur = this.$initiator.head;
            let next = null;
            while (cur !== null) {
                if (cur !== this) {
                    cur.isBound = false;
                    cur.unbind();
                }
                next = cur.next;
                cur.next = null;
                cur = next;
            }
            this.head = this.tail = null;
            this.isBound = false;
            this.unbind();
        }
    }
    addBinding(binding) {
        if (this.bindings === null) {
            this.bindings = [binding];
        }
        else {
            this.bindings[this.bindings.length] = binding;
        }
    }
    addChild(controller) {
        if (this.children === null) {
            this.children = [controller];
        }
        else {
            this.children[this.children.length] = controller;
        }
    }
    is(name) {
        switch (this.vmKind) {
            case 1 /* customAttribute */: {
                return CustomAttribute.getDefinition(this.viewModel.constructor).name === name;
            }
            case 0 /* customElement */: {
                return CustomElement.getDefinition(this.viewModel.constructor).name === name;
            }
            case 2 /* synthetic */:
                return this.viewFactory.name === name;
        }
    }
    lockScope(scope) {
        this.scope = scope;
        this.hasLockedScope = true;
    }
    setHost(host) {
        if (this.vmKind === 0 /* customElement */) {
            setRef(host, CustomElement.name, this);
            setRef(host, this.definition.key, this);
        }
        this.host = host;
        this.mountTarget = 1 /* host */;
        return this;
    }
    setShadowRoot(shadowRoot) {
        if (this.vmKind === 0 /* customElement */) {
            setRef(shadowRoot, CustomElement.name, this);
            setRef(shadowRoot, this.definition.key, this);
        }
        this.shadowRoot = shadowRoot;
        this.mountTarget = 2 /* shadowRoot */;
        return this;
    }
    setLocation(location) {
        if (this.vmKind === 0 /* customElement */) {
            setRef(location, CustomElement.name, this);
            setRef(location, this.definition.key, this);
        }
        this.location = location;
        this.mountTarget = 3 /* location */;
        return this;
    }
    release() {
        this.state |= 16 /* released */;
    }
    dispose() {
        if (this.debug) {
            this.logger.trace(`dispose()`);
        }
        if ((this.state & 32 /* disposed */) === 32 /* disposed */) {
            return;
        }
        this.state |= 32 /* disposed */;
        if (this.hooks.hasDispose) {
            this.viewModel.dispose();
        }
        if (this.children !== null) {
            this.children.forEach(callDispose);
            this.children = null;
        }
        this.hostController = null;
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (this.viewModel !== null) {
            controllerLookup.delete(this.viewModel);
            this.viewModel = null;
        }
        this.viewModel = null;
        this.host = null;
        this.shadowRoot = null;
    }
    accept(visitor) {
        if (visitor(this) === true) {
            return true;
        }
        if (this.hooks.hasAccept && this.viewModel.accept(visitor) === true) {
            return true;
        }
        if (this.children !== null) {
            const { children } = this;
            for (let i = 0, ii = children.length; i < ii; ++i) {
                if (children[i].accept(visitor) === true) {
                    return true;
                }
            }
        }
    }
}
function getLookup(instance) {
    let lookup = instance.$observers;
    if (lookup === void 0) {
        Reflect.defineProperty(instance, '$observers', {
            enumerable: false,
            value: lookup = {},
        });
    }
    return lookup;
}
function createObservers(controller, definition, 
// deepscan-disable-next-line
_flags, instance) {
    const bindables = definition.bindables;
    const observableNames = Object.getOwnPropertyNames(bindables);
    const length = observableNames.length;
    if (length > 0) {
        let name;
        let bindable;
        let i = 0;
        const observers = getLookup(instance);
        for (; i < length; ++i) {
            name = observableNames[i];
            if (observers[name] === void 0) {
                bindable = bindables[name];
                observers[name] = new BindableObserver(instance, name, bindable.callback, bindable.set, controller);
            }
        }
    }
}
function createChildrenObservers(controller, definition, 
// deepscan-disable-next-line
_flags, instance) {
    const childrenObservers = definition.childrenObservers;
    const childObserverNames = Object.getOwnPropertyNames(childrenObservers);
    const length = childObserverNames.length;
    if (length > 0) {
        const observers = getLookup(instance);
        const obs = [];
        let name;
        let i = 0;
        let childrenDescription;
        for (; i < length; ++i) {
            name = childObserverNames[i];
            if (observers[name] == void 0) {
                childrenDescription = childrenObservers[name];
                obs[obs.length] = observers[name] = new ChildrenObserver(controller, instance, name, childrenDescription.callback, childrenDescription.query, childrenDescription.filter, childrenDescription.map, childrenDescription.options);
            }
        }
        return obs;
    }
    return emptyArray;
}
const AccessScopeAstMap = new Map();
const getAccessScopeAst = (key) => {
    let ast = AccessScopeAstMap.get(key);
    if (ast == null) {
        ast = new AccessScopeExpression(key, 0);
        AccessScopeAstMap.set(key, ast);
    }
    return ast;
};
function createWatchers(controller, context, definition, instance) {
    const observerLocator = context.get(IObserverLocator);
    const expressionParser = context.get(IExpressionParser);
    const watches = definition.watches;
    const scope = controller.vmKind === 0 /* customElement */
        ? controller.scope
        // custom attribute does not have own scope
        : Scope.create(instance, null, true);
    const ii = watches.length;
    let expression;
    let callback;
    let ast;
    let i = 0;
    for (; ii > i; ++i) {
        ({ expression, callback } = watches[i]);
        callback = typeof callback === 'function'
            ? callback
            : Reflect.get(instance, callback);
        if (typeof callback !== 'function') {
            throw new Error(`AUR0506:${String(callback)}`);
        }
        if (typeof expression === 'function') {
            controller.addBinding(new ComputedWatcher(instance, observerLocator, expression, callback, 
            // there should be a flag to purposely disable proxy
            // AOT: not true for IE11
            true));
        }
        else {
            ast = typeof expression === 'string'
                ? expressionParser.parse(expression, 53 /* BindCommand */)
                : getAccessScopeAst(expression);
            controller.addBinding(new ExpressionWatcher(scope, context, observerLocator, ast, callback));
        }
    }
}
function isCustomElementController(value) {
    return value instanceof Controller && value.vmKind === 0 /* customElement */;
}
function isCustomElementViewModel(value) {
    return isObject(value) && CustomElement.isType(value.constructor);
}
class HooksDefinition {
    constructor(target) {
        this.hasDefine = 'define' in target;
        this.hasHydrating = 'hydrating' in target;
        this.hasHydrated = 'hydrated' in target;
        this.hasCreated = 'created' in target;
        this.hasBinding = 'binding' in target;
        this.hasBound = 'bound' in target;
        this.hasAttaching = 'attaching' in target;
        this.hasAttached = 'attached' in target;
        this.hasDetaching = 'detaching' in target;
        this.hasUnbinding = 'unbinding' in target;
        this.hasDispose = 'dispose' in target;
        this.hasAccept = 'accept' in target;
    }
}
HooksDefinition.none = new HooksDefinition({});
const defaultShadowOptions = {
    mode: 'open'
};
var ViewModelKind;
(function (ViewModelKind) {
    ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
    ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
    ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
})(ViewModelKind || (ViewModelKind = {}));
var State;
(function (State) {
    State[State["none"] = 0] = "none";
    State[State["activating"] = 1] = "activating";
    State[State["activated"] = 2] = "activated";
    State[State["deactivating"] = 4] = "deactivating";
    State[State["deactivated"] = 8] = "deactivated";
    State[State["released"] = 16] = "released";
    State[State["disposed"] = 32] = "disposed";
})(State || (State = {}));
function stringifyState(state) {
    const names = [];
    if ((state & 1 /* activating */) === 1 /* activating */) {
        names.push('activating');
    }
    if ((state & 2 /* activated */) === 2 /* activated */) {
        names.push('activated');
    }
    if ((state & 4 /* deactivating */) === 4 /* deactivating */) {
        names.push('deactivating');
    }
    if ((state & 8 /* deactivated */) === 8 /* deactivated */) {
        names.push('deactivated');
    }
    if ((state & 16 /* released */) === 16 /* released */) {
        names.push('released');
    }
    if ((state & 32 /* disposed */) === 32 /* disposed */) {
        names.push('disposed');
    }
    return names.length === 0 ? 'none' : names.join('|');
}
const IController = DI.createInterface('IController');
const IHydrationContext = DI.createInterface('IHydrationContext');
class HydrationContext {
    constructor(controller, instruction, parent) {
        this.instruction = instruction;
        this.parent = parent;
        this.controller = controller;
    }
}
function callDispose(disposable) {
    disposable.dispose();
}
// some reuseable variables to avoid creating nested blocks inside hot paths of controllers
let _resolve;
let _reject;
let _retPromise;

const IAppRoot = DI.createInterface('IAppRoot');
const IWorkTracker = DI.createInterface('IWorkTracker', x => x.singleton(WorkTracker));
class WorkTracker {
    constructor(logger) {
        /** @internal */
        this._stack = 0;
        /** @internal */
        this._promise = null;
        /** @internal */
        this._resolve = null;
        this._logger = logger.scopeTo('WorkTracker');
    }
    start() {
        this._logger.trace(`start(stack:${this._stack})`);
        ++this._stack;
    }
    finish() {
        this._logger.trace(`finish(stack:${this._stack})`);
        if (--this._stack === 0) {
            const resolve = this._resolve;
            if (resolve !== null) {
                this._resolve = this._promise = null;
                resolve();
            }
        }
    }
    wait() {
        this._logger.trace(`wait(stack:${this._stack})`);
        if (this._promise === null) {
            if (this._stack === 0) {
                return Promise.resolve();
            }
            this._promise = new Promise(resolve => {
                this._resolve = resolve;
            });
        }
        return this._promise;
    }
}
/** @internal */
WorkTracker.inject = [ILogger];
class AppRoot {
    constructor(config, platform, container, rootProvider) {
        this.config = config;
        this.platform = platform;
        this.container = container;
        this.controller = (void 0);
        /** @internal */
        this._hydratePromise = void 0;
        this.host = config.host;
        this.work = container.get(IWorkTracker);
        rootProvider.prepare(this);
        container.registerResolver(INode, container.registerResolver(platform.Element, new InstanceProvider('ElementProvider', config.host)));
        this._hydratePromise = onResolve(this._runAppTasks('beforeCreate'), () => {
            const component = config.component;
            const childCtn = container.createChild();
            let instance;
            if (CustomElement.isType(component)) {
                instance = this.container.get(component);
            }
            else {
                instance = config.component;
            }
            const hydrationInst = { hydrate: false, projections: null };
            const controller = (this.controller = Controller.$el(childCtn, instance, this.host, hydrationInst, 0 /* none */));
            controller._hydrateCustomElement(hydrationInst, /* root does not have hydration context */ null);
            return onResolve(this._runAppTasks('hydrating'), () => {
                controller._hydrate(null);
                return onResolve(this._runAppTasks('hydrated'), () => {
                    controller._hydrateChildren();
                    this._hydratePromise = void 0;
                });
            });
        });
    }
    activate() {
        return onResolve(this._hydratePromise, () => {
            return onResolve(this._runAppTasks('beforeActivate'), () => {
                return onResolve(this.controller.activate(this.controller, null, 2 /* fromBind */, void 0), () => {
                    return this._runAppTasks('afterActivate');
                });
            });
        });
    }
    deactivate() {
        return onResolve(this._runAppTasks('beforeDeactivate'), () => {
            return onResolve(this.controller.deactivate(this.controller, null, 0 /* none */), () => {
                return this._runAppTasks('afterDeactivate');
            });
        });
    }
    /** @internal */
    _runAppTasks(slot) {
        return resolveAll(...this.container.getAll(IAppTask).reduce((results, task) => {
            if (task.slot === slot) {
                results.push(task.run());
            }
            return results;
        }, []));
    }
    dispose() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.dispose();
    }
}

class Refs {
}
function getRef(node, name) {
    var _a, _b;
    return (_b = (_a = node.$au) === null || _a === void 0 ? void 0 : _a[name]) !== null && _b !== void 0 ? _b : null;
}
function setRef(node, name, controller) {
    var _a;
    var _b;
    ((_a = (_b = node).$au) !== null && _a !== void 0 ? _a : (_b.$au = new Refs()))[name] = controller;
}
const INode = DI.createInterface('INode');
const IEventTarget = DI.createInterface('IEventTarget', x => x.cachedCallback(handler => {
    if (handler.has(IAppRoot, true)) {
        return handler.get(IAppRoot).host;
    }
    return handler.get(IPlatform).document;
}));
const IRenderLocation = DI.createInterface('IRenderLocation');
var NodeType;
(function (NodeType) {
    NodeType[NodeType["Element"] = 1] = "Element";
    NodeType[NodeType["Attr"] = 2] = "Attr";
    NodeType[NodeType["Text"] = 3] = "Text";
    NodeType[NodeType["CDATASection"] = 4] = "CDATASection";
    NodeType[NodeType["EntityReference"] = 5] = "EntityReference";
    NodeType[NodeType["Entity"] = 6] = "Entity";
    NodeType[NodeType["ProcessingInstruction"] = 7] = "ProcessingInstruction";
    NodeType[NodeType["Comment"] = 8] = "Comment";
    NodeType[NodeType["Document"] = 9] = "Document";
    NodeType[NodeType["DocumentType"] = 10] = "DocumentType";
    NodeType[NodeType["DocumentFragment"] = 11] = "DocumentFragment";
    NodeType[NodeType["Notation"] = 12] = "Notation";
})(NodeType || (NodeType = {}));
const effectiveParentNodeOverrides = new WeakMap();
/**
 * Returns the effective parentNode according to Aurelia's component hierarchy.
 *
 * Used by Aurelia to find the closest parent controller relative to a node.
 *
 * This method supports 3 additional scenarios that `node.parentNode` does not support:
 * - Containerless elements. The parentNode in this case is a comment precending the element under specific conditions, rather than a node wrapping the element.
 * - ShadowDOM. If a `ShadowRoot` is encountered, this method retrieves the associated controller via the metadata api to locate the original host.
 * - Portals. If the provided node was moved to a different location in the DOM by a `portal` attribute, then the original parent of the node will be returned.
 *
 * @param node - The node to get the parent for.
 * @returns Either the closest parent node, the closest `IRenderLocation` (comment node that is the containerless host), original portal host, or `null` if this is either the absolute document root or a disconnected node.
 */
function getEffectiveParentNode(node) {
    // TODO: this method needs more tests!
    // First look for any overrides
    if (effectiveParentNodeOverrides.has(node)) {
        return effectiveParentNodeOverrides.get(node);
    }
    // Then try to get the nearest au-start render location, which would be the containerless parent,
    // again looking for any overrides along the way.
    // otherwise return the normal parent node
    let containerlessOffset = 0;
    let next = node.nextSibling;
    while (next !== null) {
        if (next.nodeType === 8 /* Comment */) {
            switch (next.textContent) {
                case 'au-start':
                    // If we see an au-start before we see au-end, it will precede the host of a sibling containerless element rather than a parent.
                    // So we use the offset to ignore the next au-end
                    ++containerlessOffset;
                    break;
                case 'au-end':
                    if (containerlessOffset-- === 0) {
                        return next;
                    }
            }
        }
        next = next.nextSibling;
    }
    if (node.parentNode === null && node.nodeType === 11 /* DocumentFragment */) {
        // Could be a shadow root; see if there's a controller and if so, get the original host via the projector
        const controller = CustomElement.for(node);
        if (controller === void 0) {
            // Not a shadow root (or at least, not one created by Aurelia)
            // Nothing more we can try, just return null
            return null;
        }
        if (controller.mountTarget === 2 /* shadowRoot */) {
            return getEffectiveParentNode(controller.host);
        }
    }
    return node.parentNode;
}
function setEffectiveParentNode(childNodeOrNodeSequence, parentNode) {
    if (childNodeOrNodeSequence.platform !== void 0 && !(childNodeOrNodeSequence instanceof childNodeOrNodeSequence.platform.Node)) {
        const nodes = childNodeOrNodeSequence.childNodes;
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            effectiveParentNodeOverrides.set(nodes[i], parentNode);
        }
    }
    else {
        effectiveParentNodeOverrides.set(childNodeOrNodeSequence, parentNode);
    }
}
function convertToRenderLocation(node) {
    if (isRenderLocation(node)) {
        return node; // it's already a IRenderLocation (converted by FragmentNodeSequence)
    }
    const locationEnd = node.ownerDocument.createComment('au-end');
    const locationStart = node.ownerDocument.createComment('au-start');
    if (node.parentNode !== null) {
        node.parentNode.replaceChild(locationEnd, node);
        locationEnd.parentNode.insertBefore(locationStart, locationEnd);
    }
    locationEnd.$start = locationStart;
    return locationEnd;
}
function isRenderLocation(node) {
    return node.textContent === 'au-end';
}
class FragmentNodeSequence {
    constructor(platform, fragment) {
        this.platform = platform;
        this.fragment = fragment;
        this.isMounted = false;
        this.isLinked = false;
        this.next = void 0;
        this.refNode = void 0;
        const targetNodeList = fragment.querySelectorAll('.au');
        let i = 0;
        let ii = targetNodeList.length;
        let target;
        // eslint-disable-next-line
        let targets = this.targets = Array(ii);
        while (ii > i) {
            // eagerly convert all markers to RenderLocations (otherwise the renderer
            // will do it anyway) and store them in the target list (since the comments
            // can't be queried)
            target = targetNodeList[i];
            if (target.nodeName === 'AU-M') {
                // note the renderer will still call this method, but it will just return the
                // location if it sees it's already a location
                targets[i] = convertToRenderLocation(target);
            }
            else {
                // also store non-markers for consistent ordering
                targets[i] = target;
            }
            ++i;
        }
        const childNodeList = fragment.childNodes;
        const childNodes = this.childNodes = Array(ii = childNodeList.length);
        i = 0;
        while (ii > i) {
            childNodes[i] = childNodeList[i];
            ++i;
        }
        this.firstChild = fragment.firstChild;
        this.lastChild = fragment.lastChild;
    }
    findTargets() {
        return this.targets;
    }
    insertBefore(refNode) {
        if (this.isLinked && !!this.refNode) {
            this.addToLinked();
        }
        else {
            const parent = refNode.parentNode;
            if (this.isMounted) {
                let current = this.firstChild;
                let next;
                const end = this.lastChild;
                while (current != null) {
                    next = current.nextSibling;
                    parent.insertBefore(current, refNode);
                    if (current === end) {
                        break;
                    }
                    current = next;
                }
            }
            else {
                this.isMounted = true;
                refNode.parentNode.insertBefore(this.fragment, refNode);
            }
        }
    }
    appendTo(parent, enhance = false) {
        if (this.isMounted) {
            let current = this.firstChild;
            let next;
            const end = this.lastChild;
            while (current != null) {
                next = current.nextSibling;
                parent.appendChild(current);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
        else {
            this.isMounted = true;
            if (!enhance) {
                parent.appendChild(this.fragment);
            }
        }
    }
    remove() {
        if (this.isMounted) {
            this.isMounted = false;
            const fragment = this.fragment;
            const end = this.lastChild;
            let next;
            let current = this.firstChild;
            while (current !== null) {
                next = current.nextSibling;
                fragment.appendChild(current);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
    }
    addToLinked() {
        const refNode = this.refNode;
        const parent = refNode.parentNode;
        if (this.isMounted) {
            let current = this.firstChild;
            let next;
            const end = this.lastChild;
            while (current != null) {
                next = current.nextSibling;
                parent.insertBefore(current, refNode);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
        else {
            this.isMounted = true;
            parent.insertBefore(this.fragment, refNode);
        }
    }
    unlink() {
        this.isLinked = false;
        this.next = void 0;
        this.refNode = void 0;
    }
    link(next) {
        this.isLinked = true;
        if (isRenderLocation(next)) {
            this.refNode = next;
        }
        else {
            this.next = next;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (this.next !== void 0) {
            this.refNode = this.next.firstChild;
        }
        else {
            this.refNode = void 0;
        }
    }
}
const IWindow = DI.createInterface('IWindow', x => x.callback(handler => handler.get(IPlatform).window));
const ILocation = DI.createInterface('ILocation', x => x.callback(handler => handler.get(IWindow).location));
const IHistory = DI.createInterface('IHistory', x => x.callback(handler => handler.get(IWindow).history));

const options = {
    [DelegationStrategy.capturing]: { capture: true },
    [DelegationStrategy.bubbling]: { capture: false },
};
/**
 * Listener binding. Handle event binding between view and view model
 */
class Listener {
    constructor(platform, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventDelegator, locator) {
        this.platform = platform;
        this.targetEvent = targetEvent;
        this.delegationStrategy = delegationStrategy;
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.preventDefault = preventDefault;
        this.eventDelegator = eventDelegator;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.handler = null;
    }
    callSource(event) {
        const overrideContext = this.$scope.overrideContext;
        overrideContext.$event = event;
        const result = this.sourceExpression.evaluate(8 /* mustEvaluate */, this.$scope, this.locator, null);
        Reflect.deleteProperty(overrideContext, '$event');
        if (result !== true && this.preventDefault) {
            event.preventDefault();
        }
        return result;
    }
    handleEvent(event) {
        this.interceptor.callSource(event);
    }
    $bind(flags, scope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, this.interceptor);
        }
        if (this.delegationStrategy === DelegationStrategy.none) {
            this.target.addEventListener(this.targetEvent, this);
        }
        else {
            this.handler = this.eventDelegator.addEventListener(this.locator.get(IEventTarget), this.target, this.targetEvent, this, options[this.delegationStrategy]);
        }
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.interceptor);
        }
        this.$scope = null;
        if (this.delegationStrategy === DelegationStrategy.none) {
            this.target.removeEventListener(this.targetEvent, this);
        }
        else {
            this.handler.dispose();
            this.handler = null;
        }
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
    observe(obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}

const defaultOptions = {
    capture: false,
};
class ListenerTracker {
    constructor(_publisher, _eventName, _options = defaultOptions) {
        this._publisher = _publisher;
        this._eventName = _eventName;
        this._options = _options;
        this._count = 0;
        this._captureLookups = new Map();
        this._bubbleLookups = new Map();
    }
    _increment() {
        if (++this._count === 1) {
            this._publisher.addEventListener(this._eventName, this, this._options);
        }
    }
    _decrement() {
        if (--this._count === 0) {
            this._publisher.removeEventListener(this._eventName, this, this._options);
        }
    }
    dispose() {
        if (this._count > 0) {
            this._count = 0;
            this._publisher.removeEventListener(this._eventName, this, this._options);
        }
        this._captureLookups.clear();
        this._bubbleLookups.clear();
    }
    _getLookup(target) {
        const lookups = this._options.capture === true ? this._captureLookups : this._bubbleLookups;
        let lookup = lookups.get(target);
        if (lookup === void 0) {
            lookups.set(target, lookup = Object.create(null));
        }
        return lookup;
    }
    handleEvent(event) {
        const lookups = this._options.capture === true ? this._captureLookups : this._bubbleLookups;
        const path = event.composedPath();
        if (this._options.capture === true) {
            path.reverse();
        }
        for (const target of path) {
            const lookup = lookups.get(target);
            if (lookup === void 0) {
                continue;
            }
            const listener = lookup[this._eventName];
            if (listener === void 0) {
                continue;
            }
            if (typeof listener === 'function') {
                listener(event);
            }
            else {
                listener.handleEvent(event);
            }
            if (event.cancelBubble === true) {
                return;
            }
        }
    }
}
/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
class DelegateSubscription {
    constructor(_tracker, _lookup, _eventName, callback) {
        this._tracker = _tracker;
        this._lookup = _lookup;
        this._eventName = _eventName;
        _tracker._increment();
        _lookup[_eventName] = callback;
    }
    dispose() {
        this._tracker._decrement();
        this._lookup[this._eventName] = void 0;
    }
}
class EventSubscriber {
    constructor(config) {
        this.config = config;
        this.target = null;
        this.handler = null;
    }
    subscribe(node, callbackOrListener) {
        this.target = node;
        this.handler = callbackOrListener;
        let event;
        for (event of this.config.events) {
            node.addEventListener(event, callbackOrListener);
        }
    }
    dispose() {
        const { target, handler } = this;
        let event;
        if (target !== null && handler !== null) {
            for (event of this.config.events) {
                target.removeEventListener(event, handler);
            }
        }
        this.target = this.handler = null;
    }
}
const IEventDelegator = DI.createInterface('IEventDelegator', x => x.singleton(EventDelegator));
class EventDelegator {
    constructor() {
        /** @internal */
        this._trackerMaps = Object.create(null);
    }
    addEventListener(publisher, target, eventName, listener, options) {
        var _a;
        var _b;
        const trackerMap = (_a = (_b = this._trackerMaps)[eventName]) !== null && _a !== void 0 ? _a : (_b[eventName] = new Map());
        let tracker = trackerMap.get(publisher);
        if (tracker === void 0) {
            trackerMap.set(publisher, tracker = new ListenerTracker(publisher, eventName, options));
        }
        return new DelegateSubscription(tracker, tracker._getLookup(target), eventName, listener);
    }
    dispose() {
        for (const eventName in this._trackerMaps) {
            const trackerMap = this._trackerMaps[eventName];
            for (const tracker of trackerMap.values()) {
                tracker.dispose();
            }
            trackerMap.clear();
        }
    }
}

// A specific file for primitive of au slot to avoid circular dependencies
const IProjections = DI.createInterface("IProjections");
const IAuSlotsInfo = DI.createInterface('IAuSlotsInfo');
class AuSlotsInfo {
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots) {
        this.projectedSlots = projectedSlots;
    }
}

var InstructionType;
(function (InstructionType) {
    InstructionType["hydrateElement"] = "ra";
    InstructionType["hydrateAttribute"] = "rb";
    InstructionType["hydrateTemplateController"] = "rc";
    InstructionType["hydrateLetElement"] = "rd";
    InstructionType["setProperty"] = "re";
    InstructionType["interpolation"] = "rf";
    InstructionType["propertyBinding"] = "rg";
    InstructionType["callBinding"] = "rh";
    InstructionType["letBinding"] = "ri";
    InstructionType["refBinding"] = "rj";
    InstructionType["iteratorBinding"] = "rk";
    InstructionType["textBinding"] = "ha";
    InstructionType["listenerBinding"] = "hb";
    InstructionType["attributeBinding"] = "hc";
    InstructionType["stylePropertyBinding"] = "hd";
    InstructionType["setAttribute"] = "he";
    InstructionType["setClassAttribute"] = "hf";
    InstructionType["setStyleAttribute"] = "hg";
})(InstructionType || (InstructionType = {}));
const IInstruction = DI.createInterface('Instruction');
function isInstruction(value) {
    const type = value.type;
    return typeof type === 'string' && type.length === 2;
}
class InterpolationInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rf" /* interpolation */; }
}
class PropertyBindingInstruction {
    constructor(from, to, mode) {
        this.from = from;
        this.to = to;
        this.mode = mode;
    }
    get type() { return "rg" /* propertyBinding */; }
}
class IteratorBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rk" /* iteratorBinding */; }
}
class CallBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rh" /* callBinding */; }
}
class RefBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rj" /* refBinding */; }
}
class SetPropertyInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
    }
    get type() { return "re" /* setProperty */; }
}
class HydrateElementInstruction {
    constructor(
    /**
     * The name of the custom element this instruction is associated with
     */
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    res, alias, 
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
    containerless) {
        this.res = res;
        this.alias = alias;
        this.props = props;
        this.projections = projections;
        this.containerless = containerless;
        /**
         * A special property that can be used to store <au-slot/> usage information
         */
        this.auSlot = null;
    }
    get type() { return "ra" /* hydrateElement */; }
}
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
    }
    get type() { return "rb" /* hydrateAttribute */; }
}
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
    }
    get type() { return "rc" /* hydrateTemplateController */; }
}
class HydrateLetElementInstruction {
    constructor(instructions, toBindingContext) {
        this.instructions = instructions;
        this.toBindingContext = toBindingContext;
    }
    get type() { return "rd" /* hydrateLetElement */; }
}
class LetBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "ri" /* letBinding */; }
}
class TextBindingInstruction {
    constructor(from, 
    /**
     * Indicates whether the value of the expression "from"
     * should be evaluated in strict mode.
     *
     * In none strict mode, "undefined" and "null" are coerced into empty string
     */
    strict) {
        this.from = from;
        this.strict = strict;
    }
    get type() { return "ha" /* textBinding */; }
}
class ListenerBindingInstruction {
    constructor(from, to, preventDefault, strategy) {
        this.from = from;
        this.to = to;
        this.preventDefault = preventDefault;
        this.strategy = strategy;
    }
    get type() { return "hb" /* listenerBinding */; }
}
class StylePropertyBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "hd" /* stylePropertyBinding */; }
}
class SetAttributeInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
    }
    get type() { return "he" /* setAttribute */; }
}
class SetClassAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hf" /* setClassAttribute */;
    }
}
class SetStyleAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hg" /* setStyleAttribute */;
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
    }
    get type() { return "hc" /* attributeBinding */; }
}
const ITemplateCompiler = DI.createInterface('ITemplateCompiler');
const IRenderer = DI.createInterface('IRenderer');
function renderer(instructionType) {
    return function decorator(target) {
        // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
        const decoratedTarget = function (...args) {
            const instance = new target(...args);
            instance.instructionType = instructionType;
            return instance;
        };
        // make sure we register the decorated constructor with DI
        decoratedTarget.register = function register(container) {
            Registration.singleton(IRenderer, decoratedTarget).register(container);
        };
        // copy over any metadata such as annotations (set by preceding decorators) as well as static properties set by the user
        // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
        // the length (number of ctor arguments) is copied for the same reason
        const metadataKeys = Metadata.getOwnKeys(target);
        for (const key of metadataKeys) {
            Metadata.define(key, Metadata.getOwn(key, target), decoratedTarget);
        }
        const ownProperties = Object.getOwnPropertyDescriptors(target);
        Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
            Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
        });
        return decoratedTarget;
    };
}
function ensureExpression(parser, srcOrExpr, bindingType) {
    if (typeof srcOrExpr === 'string') {
        return parser.parse(srcOrExpr, bindingType);
    }
    return srcOrExpr;
}
function getTarget(potentialTarget) {
    if (potentialTarget.viewModel != null) {
        return potentialTarget.viewModel;
    }
    return potentialTarget;
}
function getRefTarget(refHost, refTargetName) {
    if (refTargetName === 'element') {
        return refHost;
    }
    switch (refTargetName) {
        case 'controller':
            // this means it supports returning undefined
            return CustomElement.for(refHost);
        case 'view':
            // todo: returns node sequences for fun?
            throw new Error('AUR0750');
        case 'view-model':
            // this means it supports returning undefined
            return CustomElement.for(refHost).viewModel;
        default: {
            const caController = CustomAttribute.for(refHost, refTargetName);
            if (caController !== void 0) {
                return caController.viewModel;
            }
            const ceController = CustomElement.for(refHost, { name: refTargetName });
            if (ceController === void 0) {
                throw new Error(`AUR0751:${refTargetName}`);
            }
            return ceController.viewModel;
        }
    }
}
let SetPropertyRenderer = 
/** @internal */
class SetPropertyRenderer {
    render(f, renderingCtrl, target, instruction) {
        const obj = getTarget(target);
        if (obj.$observers !== void 0 && obj.$observers[instruction.to] !== void 0) {
            obj.$observers[instruction.to].setValue(instruction.value, 2 /* fromBind */);
        }
        else {
            obj[instruction.to] = instruction.value;
        }
    }
};
SetPropertyRenderer = __decorate([
    renderer("re" /* setProperty */)
    /** @internal */
], SetPropertyRenderer);
let CustomElementRenderer = 
/** @internal */
class CustomElementRenderer {
    constructor(r, p) {
        this.r = r;
        this.p = p;
    }
    static get inject() { return [IRendering, IPlatform]; }
    render(f, renderingCtrl, target, instruction) {
        /* eslint-disable prefer-const */
        let def;
        let Ctor;
        let component;
        let childCtrl;
        const res = instruction.res;
        const projections = instruction.projections;
        const ctxContainer = renderingCtrl.container;
        const container = createElementContainer(
        /* platform         */ this.p, 
        /* parentController */ renderingCtrl, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* location         */ target, 
        /* auSlotsInfo      */ projections == null ? void 0 : new AuSlotsInfo(Object.keys(projections)));
        switch (typeof res) {
            case 'string':
                def = ctxContainer.find(CustomElement, res);
                if (def == null) {
                    throw new Error(`AUR0752:${res}@${renderingCtrl['name']}`);
                }
                break;
            // constructor based instruction
            // will be enabled later if needed.
            // As both AOT + runtime based can use definition for perf
            // -----------------
            // case 'function':
            //   def = CustomElement.getDefinition(res);
            //   break;
            default:
                def = res;
        }
        Ctor = def.Type;
        component = container.invoke(Ctor);
        container.registerResolver(Ctor, new InstanceProvider(def.key, component));
        childCtrl = Controller.$el(
        /* own container       */ container, 
        /* viewModel           */ component, 
        /* host                */ target, 
        /* instruction         */ instruction, 
        /* flags               */ f, 
        /* definition          */ def);
        f = childCtrl.flags;
        setRef(target, def.key, childCtrl);
        const renderers = this.r.renderers;
        const props = instruction.props;
        const ii = props.length;
        let i = 0;
        let propInst;
        while (ii > i) {
            propInst = props[i];
            renderers[propInst.type].render(f, renderingCtrl, childCtrl, propInst);
            ++i;
        }
        renderingCtrl.addChild(childCtrl);
        /* eslint-enable prefer-const */
    }
};
CustomElementRenderer = __decorate([
    renderer("ra" /* hydrateElement */)
    /** @internal */
], CustomElementRenderer);
let CustomAttributeRenderer = 
/** @internal */
class CustomAttributeRenderer {
    constructor(r, p) {
        this.r = r;
        this.p = p;
    }
    static get inject() { return [IRendering, IPlatform]; }
    render(f, 
    /**
     * The cotroller that is currently invoking this renderer
     */
    renderingCtrl, target, instruction) {
        /* eslint-disable prefer-const */
        let ctxContainer = renderingCtrl.container;
        let def;
        switch (typeof instruction.res) {
            case 'string':
                def = ctxContainer.find(CustomAttribute, instruction.res);
                if (def == null) {
                    throw new Error(`AUR0753:${instruction.res}@${renderingCtrl['name']}`);
                }
                break;
            // constructor based instruction
            // will be enabled later if needed.
            // As both AOT + runtime based can use definition for perf
            // -----------------
            // case 'function':
            //   def = CustomAttribute.getDefinition(instruction.res);
            //   break;
            default:
                def = instruction.res;
        }
        const component = invokeAttribute(
        /* platform         */ this.p, 
        /* attr definition  */ def, 
        /* parentController */ renderingCtrl, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ void 0, 
        /* location         */ void 0);
        const childController = Controller.$attr(
        /* context ct */ renderingCtrl.container, 
        /* viewModel  */ component, 
        /* host       */ target, 
        /* flags      */ f, 
        /* definition */ def);
        setRef(target, def.key, childController);
        const renderers = this.r.renderers;
        const props = instruction.props;
        const ii = props.length;
        let i = 0;
        let propInst;
        while (ii > i) {
            propInst = props[i];
            renderers[propInst.type].render(f, renderingCtrl, childController, propInst);
            ++i;
        }
        renderingCtrl.addChild(childController);
        /* eslint-enable prefer-const */
    }
};
CustomAttributeRenderer = __decorate([
    renderer("rb" /* hydrateAttribute */)
    /** @internal */
], CustomAttributeRenderer);
let TemplateControllerRenderer = 
/** @internal */
class TemplateControllerRenderer {
    constructor(r, p) {
        this.r = r;
        this.p = p;
    }
    static get inject() { return [IRendering, IPlatform]; }
    render(f, renderingCtrl, target, instruction) {
        var _a;
        /* eslint-disable prefer-const */
        let ctxContainer = renderingCtrl.container;
        let def;
        switch (typeof instruction.res) {
            case 'string':
                def = ctxContainer.find(CustomAttribute, instruction.res);
                if (def == null) {
                    throw new Error(`AUR0754:${instruction.res}@${renderingCtrl['name']}`);
                }
                break;
            // constructor based instruction
            // will be enabled later if needed.
            // As both AOT + runtime based can use definition for perf
            // -----------------
            // case 'function':
            //   def = CustomAttribute.getDefinition(instruction.res);
            //   break;
            default:
                def = instruction.res;
        }
        const viewFactory = this.r.getViewFactory(instruction.def, ctxContainer);
        const renderLocation = convertToRenderLocation(target);
        const component = invokeAttribute(
        /* platform         */ this.p, 
        /* attr definition  */ def, 
        /* parentController */ renderingCtrl, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ viewFactory, 
        /* location         */ renderLocation);
        const childController = Controller.$attr(
        /* container ct */ renderingCtrl.container, 
        /* viewModel    */ component, 
        /* host         */ target, 
        /* flags        */ f, 
        /* definition   */ def);
        setRef(renderLocation, def.key, childController);
        (_a = component.link) === null || _a === void 0 ? void 0 : _a.call(component, f, renderingCtrl, childController, target, instruction);
        const renderers = this.r.renderers;
        const props = instruction.props;
        const ii = props.length;
        let i = 0;
        let propInst;
        while (ii > i) {
            propInst = props[i];
            renderers[propInst.type].render(f, renderingCtrl, childController, propInst);
            ++i;
        }
        renderingCtrl.addChild(childController);
        /* eslint-enable prefer-const */
    }
};
TemplateControllerRenderer = __decorate([
    renderer("rc" /* hydrateTemplateController */)
    /** @internal */
], TemplateControllerRenderer);
let LetElementRenderer = 
/** @internal */
class LetElementRenderer {
    constructor(parser, oL) {
        this.parser = parser;
        this.oL = oL;
    }
    render(f, renderingCtrl, target, instruction) {
        target.remove();
        const childInstructions = instruction.instructions;
        const toBindingContext = instruction.toBindingContext;
        const container = renderingCtrl.container;
        const ii = childInstructions.length;
        let childInstruction;
        let expr;
        let binding;
        let i = 0;
        while (ii > i) {
            childInstruction = childInstructions[i];
            expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
            binding = new LetBinding(expr, childInstruction.to, this.oL, container, toBindingContext);
            renderingCtrl.addBinding(expr.$kind === 38962 /* BindingBehavior */
                ? applyBindingBehavior(binding, expr, container)
                : binding);
            ++i;
        }
    }
};
LetElementRenderer = __decorate([
    renderer("rd" /* hydrateLetElement */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], LetElementRenderer);
let CallBindingRenderer = 
/** @internal */
class CallBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.oL = observerLocator;
    }
    render(f, renderingCtrl, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
        const binding = new CallBinding(expr, getTarget(target), instruction.to, this.oL, renderingCtrl.container);
        renderingCtrl.addBinding(expr.$kind === 38962 /* BindingBehavior */
            ? applyBindingBehavior(binding, expr, renderingCtrl.container)
            : binding);
    }
};
CallBindingRenderer.inject = [IExpressionParser, IObserverLocator];
CallBindingRenderer = __decorate([
    renderer("rh" /* callBinding */)
    /** @internal */
], CallBindingRenderer);
let RefBindingRenderer = 
/** @internal */
class RefBindingRenderer {
    constructor(parser) {
        this.parser = parser;
    }
    render(f, renderingCtrl, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
        const binding = new RefBinding(expr, getRefTarget(target, instruction.to), renderingCtrl.container);
        renderingCtrl.addBinding(expr.$kind === 38962 /* BindingBehavior */
            ? applyBindingBehavior(binding, expr, renderingCtrl.container)
            : binding);
    }
};
RefBindingRenderer = __decorate([
    renderer("rj" /* refBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser)
], RefBindingRenderer);
let InterpolationBindingRenderer = 
/** @internal */
class InterpolationBindingRenderer {
    constructor(parser, oL, p) {
        this.parser = parser;
        this.oL = oL;
        this.p = p;
    }
    render(f, renderingCtrl, target, instruction) {
        const container = renderingCtrl.container;
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        const binding = new InterpolationBinding(this.oL, expr, getTarget(target), instruction.to, BindingMode.toView, container, this.p.domWriteQueue);
        const partBindings = binding.partBindings;
        const ii = partBindings.length;
        let i = 0;
        let partBinding;
        for (; ii > i; ++i) {
            partBinding = partBindings[i];
            if (partBinding.sourceExpression.$kind === 38962 /* BindingBehavior */) {
                partBindings[i] = applyBindingBehavior(partBinding, partBinding.sourceExpression, container);
            }
        }
        renderingCtrl.addBinding(binding);
    }
};
InterpolationBindingRenderer = __decorate([
    renderer("rf" /* interpolation */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], InterpolationBindingRenderer);
let PropertyBindingRenderer = 
/** @internal */
class PropertyBindingRenderer {
    constructor(parser, oL, p) {
        this.parser = parser;
        this.oL = oL;
        this.p = p;
    }
    render(flags, renderingCtrl, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
        const binding = new PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.oL, renderingCtrl.container, this.p.domWriteQueue);
        renderingCtrl.addBinding(expr.$kind === 38962 /* BindingBehavior */
            ? applyBindingBehavior(binding, expr, renderingCtrl.container)
            : binding);
    }
};
PropertyBindingRenderer = __decorate([
    renderer("rg" /* propertyBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], PropertyBindingRenderer);
let IteratorBindingRenderer = 
/** @internal */
class IteratorBindingRenderer {
    constructor(parser, oL, p) {
        this.parser = parser;
        this.oL = oL;
        this.p = p;
    }
    render(f, renderingCtrl, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
        const binding = new PropertyBinding(expr, getTarget(target), instruction.to, BindingMode.toView, this.oL, renderingCtrl.container, this.p.domWriteQueue);
        renderingCtrl.addBinding(binding);
        // todo: fix bb + repeat
        // renderingController.addBinding(expr.iterable.$kind === ExpressionKind.BindingBehavior
        //   ? applyBindingBehavior(binding, expr.iterable, renderingController.container)
        //   : binding);
    }
};
IteratorBindingRenderer = __decorate([
    renderer("rk" /* iteratorBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], IteratorBindingRenderer);
let behaviorExpressionIndex = 0;
const behaviorExpressions = [];
function applyBindingBehavior(binding, expression, locator) {
    while (expression instanceof BindingBehaviorExpression) {
        behaviorExpressions[behaviorExpressionIndex++] = expression;
        expression = expression.expression;
    }
    while (behaviorExpressionIndex > 0) {
        const behaviorExpression = behaviorExpressions[--behaviorExpressionIndex];
        const behaviorOrFactory = locator.get(behaviorExpression.behaviorKey);
        if (behaviorOrFactory instanceof BindingBehaviorFactory) {
            binding = behaviorOrFactory.construct(binding, behaviorExpression);
        }
    }
    behaviorExpressions.length = 0;
    return binding;
}
let TextBindingRenderer = 
/** @internal */
class TextBindingRenderer {
    constructor(parser, oL, p) {
        this.parser = parser;
        this.oL = oL;
        this.p = p;
    }
    render(f, renderingCtrl, target, instruction) {
        const container = renderingCtrl.container;
        const next = target.nextSibling;
        const parent = target.parentNode;
        const doc = this.p.document;
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        const staticParts = expr.parts;
        const dynamicParts = expr.expressions;
        const ii = dynamicParts.length;
        let i = 0;
        let text = staticParts[0];
        let binding;
        let part;
        if (text !== '') {
            parent.insertBefore(doc.createTextNode(text), next);
        }
        for (; ii > i; ++i) {
            part = dynamicParts[i];
            binding = new ContentBinding(part, 
            // using a text node instead of comment, as a mean to:
            // support seamless transition between a html node, or a text
            // reduce the noise in the template, caused by html comment
            parent.insertBefore(doc.createTextNode(''), next), container, this.oL, this.p, instruction.strict);
            renderingCtrl.addBinding(part.$kind === 38962 /* BindingBehavior */
                // each of the dynamic expression of an interpolation
                // will be mapped to a ContentBinding
                ? applyBindingBehavior(binding, part, container)
                : binding);
            // while each of the static part of an interpolation
            // will just be a text node
            text = staticParts[i + 1];
            if (text !== '') {
                parent.insertBefore(doc.createTextNode(text), next);
            }
        }
        if (target.nodeName === 'AU-M') {
            target.remove();
        }
    }
};
TextBindingRenderer = __decorate([
    renderer("ha" /* textBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], TextBindingRenderer);
let ListenerBindingRenderer = 
/** @internal */
class ListenerBindingRenderer {
    constructor(parser, eventDelegator, p) {
        this.parser = parser;
        this.eventDelegator = eventDelegator;
        this.p = p;
    }
    render(f, renderingCtrl, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
        const binding = new Listener(this.p, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, renderingCtrl.container);
        renderingCtrl.addBinding(expr.$kind === 38962 /* BindingBehavior */
            ? applyBindingBehavior(binding, expr, renderingCtrl.container)
            : binding);
    }
};
ListenerBindingRenderer = __decorate([
    renderer("hb" /* listenerBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IEventDelegator),
    __param(2, IPlatform)
], ListenerBindingRenderer);
let SetAttributeRenderer = 
/** @internal */
class SetAttributeRenderer {
    render(f, _, target, instruction) {
        target.setAttribute(instruction.to, instruction.value);
    }
};
SetAttributeRenderer = __decorate([
    renderer("he" /* setAttribute */)
    /** @internal */
], SetAttributeRenderer);
let SetClassAttributeRenderer = class SetClassAttributeRenderer {
    render(f, _, target, instruction) {
        addClasses(target.classList, instruction.value);
    }
};
SetClassAttributeRenderer = __decorate([
    renderer("hf" /* setClassAttribute */)
], SetClassAttributeRenderer);
let SetStyleAttributeRenderer = class SetStyleAttributeRenderer {
    render(f, _, target, instruction) {
        target.style.cssText += instruction.value;
    }
};
SetStyleAttributeRenderer = __decorate([
    renderer("hg" /* setStyleAttribute */)
], SetStyleAttributeRenderer);
let StylePropertyBindingRenderer = 
/** @internal */
class StylePropertyBindingRenderer {
    constructor(parser, oL, p) {
        this.parser = parser;
        this.oL = oL;
        this.p = p;
    }
    render(f, renderingCtrl, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.oL, renderingCtrl.container, this.p.domWriteQueue);
        renderingCtrl.addBinding(expr.$kind === 38962 /* BindingBehavior */
            ? applyBindingBehavior(binding, expr, renderingCtrl.container)
            : binding);
    }
};
StylePropertyBindingRenderer = __decorate([
    renderer("hd" /* stylePropertyBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], StylePropertyBindingRenderer);
let AttributeBindingRenderer = 
/** @internal */
class AttributeBindingRenderer {
    constructor(parser, oL) {
        this.parser = parser;
        this.oL = oL;
    }
    render(f, renderingCtrl, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = new AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, BindingMode.toView, this.oL, renderingCtrl.container);
        renderingCtrl.addBinding(expr.$kind === 38962 /* BindingBehavior */
            ? applyBindingBehavior(binding, expr, renderingCtrl.container)
            : binding);
    }
};
AttributeBindingRenderer = __decorate([
    renderer("hc" /* attributeBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], AttributeBindingRenderer);
// http://jsben.ch/7n5Kt
function addClasses(classList, className) {
    const len = className.length;
    let start = 0;
    for (let i = 0; i < len; ++i) {
        if (className.charCodeAt(i) === 0x20) {
            if (i !== start) {
                classList.add(className.slice(start, i));
            }
            start = i + 1;
        }
        else if (i + 1 === len) {
            classList.add(className.slice(start));
        }
    }
}
const elProviderName = 'ElementProvider';
const controllerProviderName = 'IController';
const instructionProviderName = 'IInstruction';
const locationProviderName = 'IRenderLocation';
const slotInfoProviderName = 'IAuSlotsInfo';
function createElementContainer(p, renderingCtrl, host, instruction, location, auSlotsInfo) {
    const ctn = renderingCtrl.container.createChild();
    // todo:
    // both node provider and location provider may not be allowed to throw
    // if there's no value associated, unlike InstanceProvider
    // reason being some custom element can have `containerless` attribute on them
    // causing the host to disappear, and replace by a location instead
    ctn.registerResolver(p.Element, ctn.registerResolver(INode, new InstanceProvider(elProviderName, host)));
    ctn.registerResolver(IController, new InstanceProvider(controllerProviderName, renderingCtrl));
    ctn.registerResolver(IInstruction, new InstanceProvider(instructionProviderName, instruction));
    ctn.registerResolver(IRenderLocation, location == null
        ? noLocationProvider
        : new InstanceProvider(locationProviderName, location));
    ctn.registerResolver(IViewFactory, noViewFactoryProvider);
    ctn.registerResolver(IAuSlotsInfo, auSlotsInfo == null
        ? noAuSlotProvider
        : new InstanceProvider(slotInfoProviderName, auSlotsInfo));
    return ctn;
}
class ViewFactoryProvider {
    constructor(
    /**
     * The factory instance that this provider will resolves to,
     * until explicitly overridden by prepare call
     */
    factory) {
        this.f = factory;
    }
    get $isResolver() { return true; }
    resolve() {
        const f = this.f;
        if (f === null) {
            throw new Error('AUR7055');
        }
        if (typeof f.name !== 'string' || f.name.length === 0) {
            throw new Error('AUR0756');
        }
        return f;
    }
}
function invokeAttribute(p, definition, renderingCtrl, host, instruction, viewFactory, location, auSlotsInfo) {
    const ctn = renderingCtrl.container.createChild();
    ctn.registerResolver(p.Element, ctn.registerResolver(INode, new InstanceProvider(elProviderName, host)));
    ctn.registerResolver(IController, new InstanceProvider(controllerProviderName, renderingCtrl));
    ctn.registerResolver(IInstruction, new InstanceProvider(instructionProviderName, instruction));
    ctn.registerResolver(IRenderLocation, location == null
        ? noLocationProvider
        : new InstanceProvider(locationProviderName, location));
    ctn.registerResolver(IViewFactory, viewFactory == null
        ? noViewFactoryProvider
        : new ViewFactoryProvider(viewFactory));
    ctn.registerResolver(IAuSlotsInfo, auSlotsInfo == null
        ? noAuSlotProvider
        : new InstanceProvider(slotInfoProviderName, auSlotsInfo));
    return ctn.invoke(definition.Type);
}
const noLocationProvider = new InstanceProvider(locationProviderName);
const noViewFactoryProvider = new ViewFactoryProvider(null);
const noAuSlotProvider = new InstanceProvider(slotInfoProviderName, new AuSlotsInfo(emptyArray));

function bindingCommand(nameOrDefinition) {
    return function (target) {
        return BindingCommand.define(nameOrDefinition, target);
    };
}
class BindingCommandDefinition {
    constructor(Type, name, aliases, key, type) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.type = type;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        const getAnnotation = BindingCommand.getAnnotation;
        return new BindingCommandDefinition(Type, firstDefined(getAnnotation(Type, 'name'), name), mergeArrays(getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), BindingCommand.keyFrom(name), firstDefined(getAnnotation(Type, 'type'), def.type, Type.type, null));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.singleton(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, BindingCommand, key, container);
    }
}
const cmdBaseName = Protocol.resource.keyFor('binding-command');
const BindingCommand = Object.freeze({
    name: cmdBaseName,
    keyFrom(name) {
        return `${cmdBaseName}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(cmdBaseName, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingCommandDefinition.create(nameOrDef, Type);
        Metadata.define(cmdBaseName, definition, definition.Type);
        Metadata.define(cmdBaseName, definition, definition);
        Protocol.resource.appendTo(Type, cmdBaseName);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(cmdBaseName, Type);
        if (def === void 0) {
            throw new Error(`AUR0701:${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
});
let OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 49 /* OneTimeCommand */;
    }
    static get inject() { return [IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, BindingMode.oneTime);
    }
};
OneTimeBindingCommand = __decorate([
    bindingCommand('one-time')
], OneTimeBindingCommand);
let ToViewBindingCommand = class ToViewBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 50 /* ToViewCommand */;
    }
    static get inject() { return [IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, BindingMode.toView);
    }
};
ToViewBindingCommand = __decorate([
    bindingCommand('to-view')
], ToViewBindingCommand);
let FromViewBindingCommand = class FromViewBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 51 /* FromViewCommand */;
    }
    static get inject() { return [IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, BindingMode.fromView);
    }
};
FromViewBindingCommand = __decorate([
    bindingCommand('from-view')
], FromViewBindingCommand);
let TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 52 /* TwoWayCommand */;
    }
    static get inject() { return [IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, BindingMode.twoWay);
    }
};
TwoWayBindingCommand = __decorate([
    bindingCommand('two-way')
], TwoWayBindingCommand);
let DefaultBindingCommand = class DefaultBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 53 /* BindCommand */;
    }
    static get inject() { return [IAttrMapper]; }
    build(info) {
        var _a;
        const attrName = info.attr.target;
        const bindable = info.bindable;
        let defaultMode;
        let mode;
        let target;
        if (bindable == null) {
            mode = this.m.isTwoWay(info.node, attrName) ? BindingMode.twoWay : BindingMode.toView;
            target = (_a = this.m.map(info.node, attrName)) !== null && _a !== void 0 ? _a : camelCase(attrName);
        }
        else {
            defaultMode = info.def.defaultBindingMode;
            mode = bindable.mode === BindingMode.default || bindable.mode == null
                ? defaultMode == null || defaultMode === BindingMode.default
                    ? BindingMode.toView
                    : defaultMode
                : bindable.mode;
            target = bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, mode);
    }
};
DefaultBindingCommand = __decorate([
    bindingCommand('bind')
], DefaultBindingCommand);
let CallBindingCommand = class CallBindingCommand {
    constructor() {
        this.bindingType = 153 /* CallCommand */;
    }
    build(info) {
        const target = info.bindable === null
            ? camelCase(info.attr.target)
            : info.bindable.property;
        return new CallBindingInstruction(info.expr, target);
    }
};
CallBindingCommand = __decorate([
    bindingCommand('call')
], CallBindingCommand);
let ForBindingCommand = class ForBindingCommand {
    constructor() {
        this.bindingType = 539 /* ForCommand */;
    }
    build(info) {
        const target = info.bindable === null
            ? camelCase(info.attr.target)
            : info.bindable.property;
        return new IteratorBindingInstruction(info.expr, target);
    }
};
ForBindingCommand = __decorate([
    bindingCommand('for')
], ForBindingCommand);
let TriggerBindingCommand = class TriggerBindingCommand {
    constructor() {
        this.bindingType = 4182 /* TriggerCommand */;
    }
    build(info) {
        return new ListenerBindingInstruction(info.expr, info.attr.target, true, DelegationStrategy.none);
    }
};
TriggerBindingCommand = __decorate([
    bindingCommand('trigger')
], TriggerBindingCommand);
let DelegateBindingCommand = class DelegateBindingCommand {
    constructor() {
        this.bindingType = 4184 /* DelegateCommand */;
    }
    build(info) {
        return new ListenerBindingInstruction(info.expr, info.attr.target, false, DelegationStrategy.bubbling);
    }
};
DelegateBindingCommand = __decorate([
    bindingCommand('delegate')
], DelegateBindingCommand);
let CaptureBindingCommand = class CaptureBindingCommand {
    constructor() {
        this.bindingType = 4183 /* CaptureCommand */;
    }
    build(info) {
        return new ListenerBindingInstruction(info.expr, info.attr.target, false, DelegationStrategy.capturing);
    }
};
CaptureBindingCommand = __decorate([
    bindingCommand('capture')
], CaptureBindingCommand);
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
let AttrBindingCommand = class AttrBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new AttributeBindingInstruction(info.attr.target, info.expr, info.attr.target);
    }
};
AttrBindingCommand = __decorate([
    bindingCommand('attr')
], AttrBindingCommand);
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
let StyleBindingCommand = class StyleBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new AttributeBindingInstruction('style', info.expr, info.attr.target);
    }
};
StyleBindingCommand = __decorate([
    bindingCommand('style')
], StyleBindingCommand);
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
let ClassBindingCommand = class ClassBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new AttributeBindingInstruction('class', info.expr, info.attr.target);
    }
};
ClassBindingCommand = __decorate([
    bindingCommand('class')
], ClassBindingCommand);
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
let RefBindingCommand = class RefBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new RefBindingInstruction(info.expr, info.attr.target);
    }
};
RefBindingCommand = __decorate([
    bindingCommand('ref')
], RefBindingCommand);

const ITemplateElementFactory = DI.createInterface('ITemplateElementFactory', x => x.singleton(TemplateElementFactory));
const markupCache = {};
class TemplateElementFactory {
    constructor(p) {
        this.p = p;
        this._template = p.document.createElement('template');
    }
    createTemplate(input) {
        var _a;
        if (typeof input === 'string') {
            let result = markupCache[input];
            if (result === void 0) {
                const template = this._template;
                template.innerHTML = input;
                const node = template.content.firstElementChild;
                // if the input is either not wrapped in a template or there is more than one node,
                // return the whole template that wraps it/them (and create a new one for the next input)
                if (node == null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling != null) {
                    this._template = this.p.document.createElement('template');
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
            const template = this.p.document.createElement('template');
            template.content.appendChild(input);
            return template;
        }
        // we got a template element, remove it from the DOM if it's present there and don't
        // do any other processing
        (_a = input.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(input);
        return input.cloneNode(true);
    }
}
TemplateElementFactory.inject = [IPlatform];

// todo: replace existing resource code with this resolver
// ===================
// export const resource = function <T extends Key>(key: T) {
//   function Resolver(target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number) {
//     DI.inject(Resolver)(target, property, descriptor);
//   }
//   Resolver.$isResolver = true;
//   Resolver.resolve = function (handler: IContainer, requestor: IContainer) {
//     if (/* is root? */requestor.root === requestor) {
//       return requestor.get(key);
//     }
//     return requestor.has(key, false)
//       ? requestor.get(key)
//       : requestor.root.get(key);
//   };
//   return Resolver as IResolver<T> & ((...args: unknown[]) => any);
// };
/**
 * A resolver builder for resolving all registrations of a key
 * with resource semantic (leaf + root + ignore middle layer container)
 */
const allResources = function (key) {
    function Resolver(target, property, descriptor) {
        DI.inject(Resolver)(target, property, descriptor);
    }
    Resolver.$isResolver = true;
    Resolver.resolve = function (handler, requestor) {
        if ( /* is root? */requestor.root === requestor) {
            return requestor.getAll(key, false);
        }
        return requestor.has(key, false)
            ? requestor.getAll(key, false).concat(requestor.root.getAll(key, false))
            : requestor.root.getAll(key, false);
    };
    return Resolver;
};

class TemplateCompiler {
    constructor() {
        this.debug = false;
        this.resolveResources = true;
    }
    static register(container) {
        return Registration.singleton(ITemplateCompiler, this).register(container);
    }
    compile(partialDefinition, container, compilationInstruction) {
        var _a, _b, _c, _d;
        const definition = CustomElementDefinition.getOrCreate(partialDefinition);
        if (definition.template === null || definition.template === void 0) {
            return definition;
        }
        if (definition.needsCompile === false) {
            return definition;
        }
        compilationInstruction !== null && compilationInstruction !== void 0 ? compilationInstruction : (compilationInstruction = emptyCompilationInstructions);
        const context = new CompilationContext(partialDefinition, container, compilationInstruction, null, null, void 0);
        const template = typeof definition.template === 'string' || !partialDefinition.enhance
            ? context._templateFactory.createTemplate(definition.template)
            : definition.template;
        const isTemplateElement = template.nodeName === 'TEMPLATE' && template.content != null;
        const content = isTemplateElement ? template.content : template;
        const hooks = container.get(allResources(ITemplateCompilerHooks));
        const ii = hooks.length;
        let i = 0;
        if (ii > 0) {
            while (ii > i) {
                (_b = (_a = hooks[i]).compiling) === null || _b === void 0 ? void 0 : _b.call(_a, template);
                ++i;
            }
        }
        if (template.hasAttribute(localTemplateIdentifier)) {
            throw new Error('AUR0701');
        }
        this._compileLocalElement(content, context);
        this._compileNode(content, context);
        return CustomElementDefinition.create({
            ...partialDefinition,
            name: partialDefinition.name || CustomElement.generateName(),
            dependencies: ((_c = partialDefinition.dependencies) !== null && _c !== void 0 ? _c : emptyArray).concat((_d = context.deps) !== null && _d !== void 0 ? _d : emptyArray),
            instructions: context.rows,
            surrogates: isTemplateElement
                ? this._compileSurrogate(template, context)
                : emptyArray,
            template,
            hasSlots: context.hasSlot,
            needsCompile: false,
        });
    }
    /** @internal */
    _compileSurrogate(el, context) {
        var _a;
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
        // eslint-disable-next-line
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
                throw new Error(`AUR0702:${attrName}`);
            }
            bindingCommand = context._createCommand(attrSyntax);
            if (bindingCommand !== null && bindingCommand.bindingType & 4096 /* IgnoreAttr */) {
                // when the binding command overrides everything
                // just pass the target as is to the binding command, and treat it as a normal attribute:
                // active.class="..."
                // background.style="..."
                // my-attr.attr="..."
                expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);
                commandBuildInfo.node = el;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.expr = expr;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                instructions.push(bindingCommand.build(commandBuildInfo));
                // to next attribute
                continue;
            }
            attrDef = context._findAttr(realAttrTarget);
            if (attrDef !== null) {
                if (attrDef.isTemplateController) {
                    throw new Error(`AUR0703:${realAttrTarget}`);
                }
                bindableInfo = BindablesInfo.from(attrDef, true);
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
                        expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
                        attrBindableInstructions = [
                            expr === null
                                ? new SetPropertyInstruction(realAttrValue, primaryBindable.property)
                                : new InterpolationInstruction(expr, primaryBindable.property)
                        ];
                    }
                    else {
                        // custom attribute with binding command:
                        // my-attr.bind="..."
                        // my-attr.two-way="..."
                        expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);
                        commandBuildInfo.node = el;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.expr = expr;
                        commandBuildInfo.bindable = primaryBindable;
                        commandBuildInfo.def = attrDef;
                        attrBindableInstructions = [bindingCommand.build(commandBuildInfo)];
                    }
                }
                el.removeAttribute(attrName);
                --i;
                --ii;
                (attrInstructions !== null && attrInstructions !== void 0 ? attrInstructions : (attrInstructions = [])).push(new HydrateAttributeInstruction(
                // todo: def/ def.Type or def.name should be configurable
                //       example: AOT/runtime can use def.Type, but there are situation
                //       where instructions need to be serialized, def.name should be used
                this.resolveResources ? attrDef : attrDef.name, attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0, attrBindableInstructions));
                continue;
            }
            if (bindingCommand === null) {
                expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
                if (expr != null) {
                    el.removeAttribute(attrName);
                    --i;
                    --ii;
                    instructions.push(new InterpolationInstruction(expr, 
                    // if not a bindable, then ensure plain attribute are mapped correctly:
                    // e.g: colspan -> colSpan
                    //      innerhtml -> innerHTML
                    //      minlength -> minLength etc...
                    (_a = context._attrMapper.map(el, realAttrTarget)) !== null && _a !== void 0 ? _a : camelCase(realAttrTarget)));
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
                expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);
                commandBuildInfo.node = el;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.expr = expr;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                instructions.push(bindingCommand.build(commandBuildInfo));
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
            bindingCommand = context._createCommand(attrSyntax);
            if (bindingCommand !== null) {
                // supporting one time may not be as simple as it appears
                // as the let expression could compute its value from various expressions,
                // which means some value could be unavailable by the time it computes.
                //
                // Onetime means it will not have appropriate value, but it's also a good thing,
                // since often one it's just a simple declaration
                // todo: consider supporting one-time for <let>
                if (bindingCommand.bindingType === 50 /* ToViewCommand */
                    || bindingCommand.bindingType === 53 /* BindCommand */) {
                    letInstructions.push(new LetBindingInstruction(exprParser.parse(realAttrValue, bindingCommand.bindingType), camelCase(realAttrTarget)));
                    continue;
                }
                throw new Error(`AUR0704:${attrSyntax.command}`);
            }
            expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
            letInstructions.push(new LetBindingInstruction(expr === null ? new PrimitiveLiteralExpression(realAttrValue) : expr, camelCase(realAttrTarget)));
        }
        context.rows.push([new HydrateLetElementInstruction(letInstructions, toBindingContext)]);
        // probably no need to replace
        // as the let itself can be used as is
        // though still need to mark el as target to ensure the instruction is matched with a target
        return this._markAsTarget(el).nextSibling;
    }
    /** @internal */
    // eslint-disable-next-line
    _compileElement(el, context) {
        var _a, _b, _c, _d, _e;
        var _f, _g;
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
        //    2.1.
        //      if element is an <au-slot/> compile its content into auSlot property of the element instruction created
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
        const elName = ((_a = el.getAttribute('as-element')) !== null && _a !== void 0 ? _a : el.nodeName).toLowerCase();
        const elDef = context._findElement(elName);
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
        // eslint-disable-next-line
        let bindablesInfo;
        let primaryBindable;
        let realAttrTarget;
        let realAttrValue;
        let processContentResult = true;
        let hasContainerless = false;
        if (elName === 'slot') {
            context.root.hasSlot = true;
        }
        if (elDef !== null) {
            // todo: this is a bit ... powerful
            // maybe do not allow it to process its own attributes
            processContentResult = (_b = elDef.processContent) === null || _b === void 0 ? void 0 : _b.call(elDef.Type, el, context.p);
            // might have changed during the process
            attrs = el.attributes;
            ii = attrs.length;
        }
        if (context.root.def.enhance && el.classList.contains('au')) {
            throw new Error(`AUR0705`);
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
                case 'as-element':
                case 'containerless':
                    removeAttr();
                    if (!hasContainerless) {
                        hasContainerless = attrName === 'containerless';
                    }
                    continue;
            }
            attrSyntax = context._attrParser.parse(attrName, attrValue);
            bindingCommand = context._createCommand(attrSyntax);
            if (bindingCommand !== null && bindingCommand.bindingType & 4096 /* IgnoreAttr */) {
                // when the binding command overrides everything
                // just pass the target as is to the binding command, and treat it as a normal attribute:
                // active.class="..."
                // background.style="..."
                // my-attr.attr="..."
                expr = exprParser.parse(attrValue, bindingCommand.bindingType);
                commandBuildInfo.node = el;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.expr = expr;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                (plainAttrInstructions !== null && plainAttrInstructions !== void 0 ? plainAttrInstructions : (plainAttrInstructions = [])).push(bindingCommand.build(commandBuildInfo));
                removeAttr();
                // to next attribute
                continue;
            }
            realAttrTarget = attrSyntax.target;
            realAttrValue = attrSyntax.rawValue;
            // if not a ignore attribute binding command
            // then process with the next possibilities
            attrDef = context._findAttr(realAttrTarget);
            // when encountering an attribute,
            // custom attribute takes precedence over custom element bindables
            if (attrDef !== null) {
                bindablesInfo = BindablesInfo.from(attrDef, true);
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
                    attrBindableInstructions = this._compileMultiBindings(el, attrValue, attrDef, context);
                }
                else {
                    primaryBindable = bindablesInfo.primary;
                    // custom attribute + single value + WITHOUT binding command:
                    // my-attr=""
                    // my-attr="${}"
                    if (bindingCommand === null) {
                        expr = exprParser.parse(attrValue, 2048 /* Interpolation */);
                        attrBindableInstructions = [
                            expr === null
                                ? new SetPropertyInstruction(attrValue, primaryBindable.property)
                                : new InterpolationInstruction(expr, primaryBindable.property)
                        ];
                    }
                    else {
                        // custom attribute with binding command:
                        // my-attr.bind="..."
                        // my-attr.two-way="..."
                        expr = exprParser.parse(attrValue, bindingCommand.bindingType);
                        commandBuildInfo.node = el;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.expr = expr;
                        commandBuildInfo.bindable = primaryBindable;
                        commandBuildInfo.def = attrDef;
                        attrBindableInstructions = [bindingCommand.build(commandBuildInfo)];
                    }
                }
                removeAttr();
                if (attrDef.isTemplateController) {
                    (tcInstructions !== null && tcInstructions !== void 0 ? tcInstructions : (tcInstructions = [])).push(new HydrateTemplateController(voidDefinition, 
                    // todo: def/ def.Type or def.name should be configurable
                    //       example: AOT/runtime can use def.Type, but there are situation
                    //       where instructions need to be serialized, def.name should be used
                    this.resolveResources ? attrDef : attrDef.name, void 0, attrBindableInstructions));
                }
                else {
                    (attrInstructions !== null && attrInstructions !== void 0 ? attrInstructions : (attrInstructions = [])).push(new HydrateAttributeInstruction(
                    // todo: def/ def.Type or def.name should be configurable
                    //       example: AOT/runtime can use def.Type, but there are situation
                    //       where instructions need to be serialized, def.name should be used
                    this.resolveResources ? attrDef : attrDef.name, attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0, attrBindableInstructions));
                }
                continue;
            }
            if (bindingCommand === null) {
                // reaching here means:
                // + maybe a bindable attribute with interpolation
                // + maybe a plain attribute with interpolation
                // + maybe a plain attribute
                if (elDef !== null) {
                    bindablesInfo = BindablesInfo.from(elDef, false);
                    bindable = bindablesInfo.attrs[realAttrTarget];
                    if (bindable !== void 0) {
                        expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
                        (elBindableInstructions !== null && elBindableInstructions !== void 0 ? elBindableInstructions : (elBindableInstructions = [])).push(expr == null
                            ? new SetPropertyInstruction(realAttrValue, bindable.property)
                            : new InterpolationInstruction(expr, bindable.property));
                        removeAttr();
                        continue;
                    }
                }
                // reaching here means:
                // + maybe a plain attribute with interpolation
                // + maybe a plain attribute
                expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
                if (expr != null) {
                    // if it's an interpolation, remove the attribute
                    removeAttr();
                    (plainAttrInstructions !== null && plainAttrInstructions !== void 0 ? plainAttrInstructions : (plainAttrInstructions = [])).push(new InterpolationInstruction(expr, 
                    // if not a bindable, then ensure plain attribute are mapped correctly:
                    // e.g: colspan -> colSpan
                    //      innerhtml -> innerHTML
                    //      minlength -> minLength etc...
                    (_c = context._attrMapper.map(el, realAttrTarget)) !== null && _c !== void 0 ? _c : camelCase(realAttrTarget)));
                }
                // if not a custom attribute + no binding command + not a bindable + not an interpolation
                // then it's just a plain attribute, do nothing
                continue;
            }
            // reaching here means:
            // + has binding command
            // + not an overriding binding command
            // + not a custom attribute
            removeAttr();
            if (elDef !== null) {
                // if the element is a custom element
                // - prioritize bindables on a custom element before plain attributes
                bindablesInfo = BindablesInfo.from(elDef, false);
                bindable = bindablesInfo.attrs[realAttrTarget];
                if (bindable !== void 0) {
                    // if it looks like: <my-el value.bind>
                    // it means        : <my-el value.bind="value">
                    // this is a shortcut
                    // and reuse attrValue variable
                    attrValue = attrValue.length === 0
                        && (bindingCommand.bindingType & (53 /* BindCommand */
                            | 49 /* OneTimeCommand */
                            | 50 /* ToViewCommand */
                            | 52 /* TwoWayCommand */)) > 0
                        ? camelCase(attrName)
                        : attrValue;
                    expr = exprParser.parse(attrValue, bindingCommand.bindingType);
                    commandBuildInfo.node = el;
                    commandBuildInfo.attr = attrSyntax;
                    commandBuildInfo.expr = expr;
                    commandBuildInfo.bindable = bindable;
                    commandBuildInfo.def = elDef;
                    (elBindableInstructions !== null && elBindableInstructions !== void 0 ? elBindableInstructions : (elBindableInstructions = [])).push(bindingCommand.build(commandBuildInfo));
                    continue;
                }
            }
            // reaching here means:
            // + a plain attribute
            // + has binding command
            expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);
            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.expr = expr;
            commandBuildInfo.bindable = null;
            commandBuildInfo.def = null;
            (plainAttrInstructions !== null && plainAttrInstructions !== void 0 ? plainAttrInstructions : (plainAttrInstructions = [])).push(bindingCommand.build(commandBuildInfo));
        }
        resetCommandBuildInfo();
        if (this._shouldReorderAttrs(el) && plainAttrInstructions != null && plainAttrInstructions.length > 1) {
            this._reorder(el, plainAttrInstructions);
        }
        // 2. ensure that element instruction is present if this element is a custom element
        if (elDef !== null) {
            elementInstruction = new HydrateElementInstruction(
            // todo: def/ def.Type or def.name should be configurable
            //       example: AOT/runtime can use def.Type, but there are situation
            //       where instructions need to be serialized, def.name should be used
            this.resolveResources ? elDef : elDef.name, void 0, (elBindableInstructions !== null && elBindableInstructions !== void 0 ? elBindableInstructions : emptyArray), null, hasContainerless);
            // 2.1 prepare fallback content for <au-slot/>
            if (elName === 'au-slot') {
                const slotName = el.getAttribute('name') || /* name="" is the same with no name */ 'default';
                const template = context.h('template');
                const fallbackContentContext = context._createChild();
                let node = el.firstChild;
                while (node !== null) {
                    // a special case:
                    // <au-slot> doesn't have its own template
                    // so anything attempting to project into it is discarded
                    // doing so during compilation via removing the node,
                    // instead of considering it as part of the fallback view
                    if (node.nodeType === 1 && node.hasAttribute('au-slot')) {
                        el.removeChild(node);
                    }
                    else {
                        template.content.appendChild(node);
                    }
                    node = el.firstChild;
                }
                this._compileNode(template.content, fallbackContentContext);
                elementInstruction.auSlot = {
                    name: slotName,
                    fallback: CustomElementDefinition.create({
                        name: CustomElement.generateName(),
                        template,
                        instructions: fallbackContentContext.rows,
                        needsCompile: false,
                    }),
                };
                // todo: shouldn't have to eagerly replace everything like this
                // this is a leftover refactoring work from the old binder
                el = this._replaceByMarker(el, context);
            }
        }
        // 3. merge and sort all instructions into a single list
        //    as instruction list for this element
        if (plainAttrInstructions != null
            || elementInstruction != null
            || attrInstructions != null) {
            instructions = emptyArray.concat(elementInstruction !== null && elementInstruction !== void 0 ? elementInstruction : emptyArray, attrInstructions !== null && attrInstructions !== void 0 ? attrInstructions : emptyArray, plainAttrInstructions !== null && plainAttrInstructions !== void 0 ? plainAttrInstructions : emptyArray);
            // 3.1 mark as template for later hydration
            this._markAsTarget(el);
        }
        // 4. compiling child nodes
        let shouldCompileContent;
        if (tcInstructions != null) {
            // 4.1 if there is 1 or more [Template controller]
            ii = tcInstructions.length - 1;
            i = ii;
            tcInstruction = tcInstructions[i];
            let template;
            // assumption: el.parentNode is not null
            // but not always the case: e.g compile/enhance an element without parent with TC on it
            this._replaceByMarker(el, context);
            if (el.nodeName === 'TEMPLATE') {
                template = el;
            }
            else {
                template = context.h('template');
                template.content.appendChild(el);
            }
            const mostInnerTemplate = template;
            // 4.1.1.0. prepare child context for the inner template compilation
            const childContext = context._createChild(instructions == null ? [] : [instructions]);
            shouldCompileContent = elDef === null || !elDef.containerless && !hasContainerless && processContentResult !== false;
            // todo: shouldn't have to eagerly replace with a marker like this
            //       this should be the job of the renderer
            if (elDef !== null && elDef.containerless) {
                this._replaceByMarker(el, context);
            }
            let child;
            let childEl;
            let targetSlot;
            let projections;
            let slotTemplateRecord;
            let slotTemplates;
            let slotTemplate;
            let marker;
            let projectionCompilationContext;
            let j = 0, jj = 0;
            if (shouldCompileContent) {
                // 4.1.1.1.
                //  walks through the child nodes, and perform [au-slot] check
                //  note: this is a bit different with the summary above, possibly wrong since it will not throw
                //        on [au-slot] used on a non-custom-element + with a template controller on it
                if (elDef !== null) {
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
                    child = el.firstChild;
                    while (child !== null) {
                        if (child.nodeType === 1) {
                            // if has [au-slot] then it's a projection
                            childEl = child;
                            child = child.nextSibling;
                            targetSlot = childEl.getAttribute('au-slot');
                            if (targetSlot !== null) {
                                if (targetSlot === '') {
                                    targetSlot = 'default';
                                }
                                childEl.removeAttribute('au-slot');
                                el.removeChild(childEl);
                                ((_d = (_f = (slotTemplateRecord !== null && slotTemplateRecord !== void 0 ? slotTemplateRecord : (slotTemplateRecord = {})))[targetSlot]) !== null && _d !== void 0 ? _d : (_f[targetSlot] = [])).push(childEl);
                            }
                            // if not a targeted slot then use the common node method
                            // todo: in the future, there maybe more special case for a content of a custom element
                            //       it can be all done here
                        }
                        else {
                            child = child.nextSibling;
                        }
                    }
                    if (slotTemplateRecord != null) {
                        projections = {};
                        // aggregate all content targeting the same slot
                        // into a single template
                        // with some special rule around <template> element
                        for (targetSlot in slotTemplateRecord) {
                            template = context.h('template');
                            slotTemplates = slotTemplateRecord[targetSlot];
                            for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
                                slotTemplate = slotTemplates[j];
                                if (slotTemplate.nodeName === 'TEMPLATE') {
                                    // this means user has some thing more than [au-slot] on a template
                                    // consider this intentional, and use it as is
                                    // e.g:
                                    // <my-element>
                                    //   <template au-slot repeat.for="i of items">
                                    // ----vs----
                                    // <my-element>
                                    //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                                    if (slotTemplate.attributes.length > 0) {
                                        template.content.appendChild(slotTemplate);
                                    }
                                    else {
                                        template.content.appendChild(slotTemplate.content);
                                    }
                                }
                                else {
                                    template.content.appendChild(slotTemplate);
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
                            projections[targetSlot] = CustomElementDefinition.create({
                                name: CustomElement.generateName(),
                                template,
                                instructions: projectionCompilationContext.rows,
                                needsCompile: false,
                            });
                        }
                        elementInstruction.projections = projections;
                    }
                }
                // 4.1.1.2:
                //  recursively compiles the child nodes into the inner context
                // important:
                // ======================
                // only goes inside a template, if there is a template controller on it
                // otherwise, leave it alone
                if (el.nodeName === 'TEMPLATE') {
                    this._compileNode(el.content, childContext);
                }
                else {
                    child = el.firstChild;
                    while (child !== null) {
                        child = this._compileNode(child, childContext);
                    }
                }
            }
            tcInstruction.def = CustomElementDefinition.create({
                name: CustomElement.generateName(),
                template: mostInnerTemplate,
                instructions: childContext.rows,
                needsCompile: false,
            });
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
                template = context.h('template');
                // appending most inner template is inaccurate, as the most outer one
                // is not really the parent of the most inner one
                // but it's only for the purpose of creating a marker,
                // so it's just an optimization hack
                marker = context.h('au-m');
                marker.classList.add('au');
                template.content.appendChild(marker);
                tcInstruction.def = CustomElementDefinition.create({
                    name: CustomElement.generateName(),
                    template,
                    needsCompile: false,
                    instructions: [[tcInstructions[i + 1]]]
                });
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
            shouldCompileContent = elDef === null || !elDef.containerless && !hasContainerless && processContentResult !== false;
            // todo: shouldn't have to eagerly replace with a marker like this
            //       this should be the job of the renderer
            if (elDef !== null && elDef.containerless) {
                this._replaceByMarker(el, context);
            }
            if (shouldCompileContent && el.childNodes.length > 0) {
                let child = el.firstChild;
                let childEl;
                let targetSlot;
                let projections = null;
                let slotTemplateRecord;
                let slotTemplates;
                let slotTemplate;
                let template;
                let projectionCompilationContext;
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
                while (child !== null) {
                    if (child.nodeType === 1) {
                        // if has [au-slot] then it's a projection
                        childEl = child;
                        child = child.nextSibling;
                        targetSlot = childEl.getAttribute('au-slot');
                        if (targetSlot !== null) {
                            if (elDef === null) {
                                throw new Error(`AUR0706:${el.nodeName}[${targetSlot}]`);
                            }
                            if (targetSlot === '') {
                                targetSlot = 'default';
                            }
                            el.removeChild(childEl);
                            childEl.removeAttribute('au-slot');
                            ((_e = (_g = (slotTemplateRecord !== null && slotTemplateRecord !== void 0 ? slotTemplateRecord : (slotTemplateRecord = {})))[targetSlot]) !== null && _e !== void 0 ? _e : (_g[targetSlot] = [])).push(childEl);
                        }
                        // if not a targeted slot then use the common node method
                        // todo: in the future, there maybe more special case for a content of a custom element
                        //       it can be all done here
                    }
                    else {
                        child = child.nextSibling;
                    }
                }
                if (slotTemplateRecord != null) {
                    projections = {};
                    // aggregate all content targeting the same slot
                    // into a single template
                    // with some special rule around <template> element
                    for (targetSlot in slotTemplateRecord) {
                        template = context.h('template');
                        slotTemplates = slotTemplateRecord[targetSlot];
                        for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
                            slotTemplate = slotTemplates[j];
                            if (slotTemplate.nodeName === 'TEMPLATE') {
                                // this means user has some thing more than [au-slot] on a template
                                // consider this intentional, and use it as is
                                // e.g:
                                // <my-element>
                                //   <template au-slot repeat.for="i of items">
                                // ----vs----
                                // <my-element>
                                //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                                if (slotTemplate.attributes.length > 0) {
                                    template.content.appendChild(slotTemplate);
                                }
                                else {
                                    template.content.appendChild(slotTemplate.content);
                                }
                            }
                            else {
                                template.content.appendChild(slotTemplate);
                            }
                        }
                        // after aggregating all the [au-slot] templates into a single one
                        // compile it
                        projectionCompilationContext = context._createChild();
                        this._compileNode(template.content, projectionCompilationContext);
                        projections[targetSlot] = CustomElementDefinition.create({
                            name: CustomElement.generateName(),
                            template,
                            instructions: projectionCompilationContext.rows,
                            needsCompile: false,
                        });
                    }
                    elementInstruction.projections = projections;
                }
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
        let text = '';
        let current = node;
        while (current !== null && current.nodeType === 3) {
            text += current.textContent;
            current = current.nextSibling;
        }
        const expr = context._exprParser.parse(text, 2048 /* Interpolation */);
        if (expr === null) {
            return current;
        }
        const parent = node.parentNode;
        // prepare a marker
        parent.insertBefore(this._markAsTarget(context.h('au-m')), node);
        // and the corresponding instruction
        context.rows.push([new TextBindingInstruction(expr, !!context.def.isStrictBinding)]);
        // and cleanup all the DOM for rendering text binding
        node.textContent = '';
        current = node.nextSibling;
        while (current !== null && current.nodeType === 3) {
            parent.removeChild(current);
            current = node.nextSibling;
        }
        return node.nextSibling;
    }
    /** @internal */
    _compileMultiBindings(node, attrRawValue, attrDef, context) {
        // custom attribute + multiple values:
        // my-attr="prop1: literal1 prop2.bind: ...; prop3: literal3"
        // my-attr="prop1.bind: ...; prop2.bind: ..."
        // my-attr="prop1: ${}; prop2.bind: ...; prop3: ${}"
        const bindableAttrsInfo = BindablesInfo.from(attrDef, true);
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
            if (ch === 92 /* Backslash */) {
                ++i;
                // Ignore whatever comes next because it's escaped
            }
            else if (ch === 58 /* Colon */) {
                attrName = attrRawValue.slice(start, i);
                // Skip whitespace after colon
                while (attrRawValue.charCodeAt(++i) <= 32 /* Space */)
                    ;
                start = i;
                for (; i < valueLength; ++i) {
                    ch = attrRawValue.charCodeAt(i);
                    if (ch === 92 /* Backslash */) {
                        ++i;
                        // Ignore whatever comes next because it's escaped
                    }
                    else if (ch === 59 /* Semicolon */) {
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
                command = context._createCommand(attrSyntax);
                bindable = bindableAttrsInfo.attrs[attrSyntax.target];
                if (bindable == null) {
                    throw new Error(`AUR0707:${attrDef.name}.${attrSyntax.target}`);
                }
                if (command === null) {
                    expr = context._exprParser.parse(attrValue, 2048 /* Interpolation */);
                    instructions.push(expr === null
                        ? new SetPropertyInstruction(attrValue, bindable.property)
                        : new InterpolationInstruction(expr, bindable.property));
                }
                else {
                    expr = context._exprParser.parse(attrValue, command.bindingType);
                    commandBuildInfo.node = node;
                    commandBuildInfo.attr = attrSyntax;
                    commandBuildInfo.expr = expr;
                    commandBuildInfo.bindable = bindable;
                    commandBuildInfo.def = attrDef;
                    // instructions.push(command.compile(new BindingSymbol(command, bindable, expr, attrValue, attrName)));
                    instructions.push(command.build(commandBuildInfo));
                }
                // Skip whitespace after semicolon
                while (i < valueLength && attrRawValue.charCodeAt(++i) <= 32 /* Space */)
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
        const root = template;
        const localTemplates = toArray(root.querySelectorAll('template[as-custom-element]'));
        const numLocalTemplates = localTemplates.length;
        if (numLocalTemplates === 0) {
            return;
        }
        if (numLocalTemplates === root.childElementCount) {
            throw new Error('AUR0708');
        }
        const localTemplateNames = new Set();
        for (const localTemplate of localTemplates) {
            if (localTemplate.parentNode !== root) {
                throw new Error('AUR0709');
            }
            const name = processTemplateName(localTemplate, localTemplateNames);
            const LocalTemplateType = class LocalTemplate {
            };
            const content = localTemplate.content;
            const bindableEls = toArray(content.querySelectorAll('bindable'));
            const bindableInstructions = Bindable.for(LocalTemplateType);
            const properties = new Set();
            const attributes = new Set();
            for (const bindableEl of bindableEls) {
                if (bindableEl.parentNode !== content) {
                    throw new Error('AUR0710');
                }
                const property = bindableEl.getAttribute("property" /* property */);
                if (property === null) {
                    throw new Error('AUR0711');
                }
                const attribute = bindableEl.getAttribute("attribute" /* attribute */);
                if (attribute !== null
                    && attributes.has(attribute)
                    || properties.has(property)) {
                    throw new Error(`AUR0712:${property}+${attribute}`);
                }
                else {
                    if (attribute !== null) {
                        attributes.add(attribute);
                    }
                    properties.add(property);
                }
                bindableInstructions.add({
                    property,
                    attribute: attribute !== null && attribute !== void 0 ? attribute : void 0,
                    mode: getBindingMode(bindableEl),
                });
                const ignoredAttributes = bindableEl.getAttributeNames().filter((attrName) => !allowedLocalTemplateBindableAttributes.includes(attrName));
                if (ignoredAttributes.length > 0) ;
                content.removeChild(bindableEl);
            }
            context._addDep(CustomElement.define({ name, template: localTemplate }, LocalTemplateType));
            root.removeChild(localTemplate);
        }
    }
    _shouldReorderAttrs(el) {
        return el.nodeName === 'INPUT' && orderSensitiveInputType[el.type] === 1;
    }
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
            }
        }
    }
    /**
     * Mark an element as target with a special css class
     * and return it
     *
     * @internal
     */
    _markAsTarget(el) {
        el.classList.add('au');
        return el;
    }
    /**
     * Replace an element with a marker, and return the marker
     *
     * @internal
     */
    _replaceByMarker(node, context) {
        // todo: assumption made: parentNode won't be null
        const parent = node.parentNode;
        const marker = context.h('au-m');
        this._markAsTarget(parent.insertBefore(marker, node));
        parent.removeChild(node);
        return marker;
    }
}
// this class is intended to be an implementation encapsulating the information at the root level of a template
// this works at the time this is created because everything inside a template should be retrieved
// from the root itself.
// if anytime in the future, where it's desirable to retrieve information from somewhere other than root
// then consider dropping this
// goal: hide the root container, and all the resources finding calls
class CompilationContext {
    constructor(def, container, compilationInstruction, parent, root, instructions) {
        this.hasSlot = false;
        // todo: ideally binding command shouldn't have to be cached
        // it can just be a singleton where it' retrieved
        // the resources semantic should be defined by the resource itself,
        // rather than baked in the container
        this._commands = createLookup();
        const hasParent = parent !== null;
        this.c = container;
        this.root = root === null ? this : root;
        this.def = def;
        this.ci = compilationInstruction;
        this.parent = parent;
        this._templateFactory = hasParent ? parent._templateFactory : container.get(ITemplateElementFactory);
        // todo: attr parser should be retrieved based in resource semantic (current leaf + root + ignore parent)
        this._attrParser = hasParent ? parent._attrParser : container.get(IAttributeParser);
        this._exprParser = hasParent ? parent._exprParser : container.get(IExpressionParser);
        this._attrMapper = hasParent ? parent._attrMapper : container.get(IAttrMapper);
        this._logger = hasParent ? parent._logger : container.get(ILogger);
        this.p = hasParent ? parent.p : container.get(IPlatform);
        this.localEls = hasParent ? parent.localEls : new Set();
        this.rows = instructions !== null && instructions !== void 0 ? instructions : [];
    }
    _addDep(dep) {
        var _a;
        var _b;
        ((_a = (_b = this.root).deps) !== null && _a !== void 0 ? _a : (_b.deps = [])).push(dep);
        this.root.c.register(dep);
    }
    h(name) {
        const el = this.p.document.createElement(name);
        if (name === 'template') {
            this.p.document.adoptNode(el.content);
        }
        return el;
    }
    /**
     * Find the custom element definition of a given name
     */
    _findElement(name) {
        return this.c.find(CustomElement, name);
    }
    /**
     * Find the custom attribute definition of a given name
     */
    _findAttr(name) {
        return this.c.find(CustomAttribute, name);
    }
    /**
     * Create a new child compilation context
     */
    _createChild(instructions) {
        return new CompilationContext(this.def, this.c, this.ci, this, this.root, instructions);
    }
    /**
     * Retrieve a binding command resource instance.
     *
     * @param name - The parsed `AttrSyntax`
     *
     * @returns An instance of the command if it exists, or `null` if it does not exist.
     */
    _createCommand(syntax) {
        if (this.root !== this) {
            return this.root._createCommand(syntax);
        }
        const name = syntax.command;
        if (name === null) {
            return null;
        }
        let result = this._commands[name];
        if (result === void 0) {
            result = this.c.create(BindingCommand, name);
            if (result === null) {
                throw new Error(`AUR0713:${name}`);
            }
            this._commands[name] = result;
        }
        return result;
    }
}
function hasInlineBindings(rawValue) {
    const len = rawValue.length;
    let ch = 0;
    let i = 0;
    while (len > i) {
        ch = rawValue.charCodeAt(i);
        if (ch === 92 /* Backslash */) {
            ++i;
            // Ignore whatever comes next because it's escaped
        }
        else if (ch === 58 /* Colon */) {
            return true;
        }
        else if (ch === 36 /* Dollar */ && rawValue.charCodeAt(i + 1) === 123 /* OpenBrace */) {
            return false;
        }
        ++i;
    }
    return false;
}
function resetCommandBuildInfo() {
    commandBuildInfo.node
        = commandBuildInfo.attr
            = commandBuildInfo.expr
                = commandBuildInfo.bindable
                    = commandBuildInfo.def = null;
}
const emptyCompilationInstructions = { projections: null };
// eslint-disable-next-line
const voidDefinition = { name: 'unnamed' };
const commandBuildInfo = {
    node: null,
    expr: null,
    attr: null,
    bindable: null,
    def: null,
};
const invalidSurrogateAttribute = Object.assign(createLookup(), {
    'id': true,
    'name': true,
    'au-slot': true,
    'as-element': true,
});
const orderSensitiveInputType = {
    checkbox: 1,
    radio: 1,
    // todo: range is also sensitive to order, for min/max
};
const bindableAttrsInfoCache = new WeakMap();
class BindablesInfo {
    constructor(attrs, bindables, primary) {
        this.attrs = attrs;
        this.bindables = bindables;
        this.primary = primary;
    }
    static from(def, isAttr) {
        let info = bindableAttrsInfoCache.get(def);
        if (info == null) {
            const bindables = def.bindables;
            const attrs = createLookup();
            const defaultBindingMode = isAttr
                ? def.defaultBindingMode === void 0
                    ? BindingMode.default
                    : def.defaultBindingMode
                : BindingMode.default;
            let bindable;
            let prop;
            let hasPrimary = false;
            let primary;
            let attr;
            // from all bindables, pick the first primary bindable
            // if there is no primary, pick the first bindable
            // if there's no bindables, create a new primary with property value
            for (prop in bindables) {
                bindable = bindables[prop];
                attr = bindable.attribute;
                if (bindable.primary === true) {
                    if (hasPrimary) {
                        throw new Error(`AUR0714:${def.name}`);
                    }
                    hasPrimary = true;
                    primary = bindable;
                }
                else if (!hasPrimary && primary == null) {
                    primary = bindable;
                }
                attrs[attr] = BindableDefinition.create(prop, bindable);
            }
            if (bindable == null && isAttr) {
                // if no bindables are present, default to "value"
                primary = attrs.value = BindableDefinition.create('value', { mode: defaultBindingMode });
            }
            bindableAttrsInfoCache.set(def, info = new BindablesInfo(attrs, bindables, primary));
        }
        return info;
    }
}
var LocalTemplateBindableAttributes;
(function (LocalTemplateBindableAttributes) {
    LocalTemplateBindableAttributes["property"] = "property";
    LocalTemplateBindableAttributes["attribute"] = "attribute";
    LocalTemplateBindableAttributes["mode"] = "mode";
})(LocalTemplateBindableAttributes || (LocalTemplateBindableAttributes = {}));
const allowedLocalTemplateBindableAttributes = Object.freeze([
    "property" /* property */,
    "attribute" /* attribute */,
    "mode" /* mode */
]);
const localTemplateIdentifier = 'as-custom-element';
function processTemplateName(localTemplate, localTemplateNames) {
    const name = localTemplate.getAttribute(localTemplateIdentifier);
    if (name === null || name === '') {
        throw new Error('AUR0715');
    }
    if (localTemplateNames.has(name)) {
        throw new Error(`AUR0716:${name}`);
    }
    else {
        localTemplateNames.add(name);
        localTemplate.removeAttribute(localTemplateIdentifier);
    }
    return name;
}
function getBindingMode(bindable) {
    switch (bindable.getAttribute("mode" /* mode */)) {
        case 'oneTime':
            return BindingMode.oneTime;
        case 'toView':
            return BindingMode.toView;
        case 'fromView':
            return BindingMode.fromView;
        case 'twoWay':
            return BindingMode.twoWay;
        case 'default':
        default:
            return BindingMode.default;
    }
}
/**
 * An interface describing the hooks a compilation process should invoke.
 *
 * A feature available to the default template compiler.
 */
const ITemplateCompilerHooks = DI.createInterface('ITemplateCompilerHooks');
const typeToHooksDefCache = new WeakMap();
const hooksBaseName = Protocol.resource.keyFor('compiler-hooks');
const TemplateCompilerHooks = Object.freeze({
    name: hooksBaseName,
    define(Type) {
        let def = typeToHooksDefCache.get(Type);
        if (def === void 0) {
            typeToHooksDefCache.set(Type, def = new TemplateCompilerHooksDefinition(Type));
            Metadata.define(hooksBaseName, def, Type);
            Protocol.resource.appendTo(Type, hooksBaseName);
        }
        return Type;
    }
});
class TemplateCompilerHooksDefinition {
    constructor(Type) {
        this.Type = Type;
    }
    get name() { return ''; }
    register(c) {
        c.register(Registration.singleton(ITemplateCompilerHooks, this.Type));
    }
}
/**
 * Decorator: Indicates that the decorated class is a template compiler hooks.
 *
 * An instance of this class will be created and appropriate compilation hooks will be invoked
 * at different phases of the default compiler.
 */
/* eslint-disable */
// deepscan-disable-next-line
const templateCompilerHooks = (target) => {
    return target === void 0 ? decorator : decorator(target);
    function decorator(t) {
        return TemplateCompilerHooks.define(t);
    }
};
/* eslint-enable */

class BindingModeBehavior {
    constructor(mode) {
        this.mode = mode;
        /** @internal */
        this._originalModes = new Map();
    }
    bind(flags, scope, binding) {
        this._originalModes.set(binding, binding.mode);
        binding.mode = this.mode;
    }
    unbind(flags, scope, binding) {
        binding.mode = this._originalModes.get(binding);
        this._originalModes.delete(binding);
    }
}
class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.oneTime);
    }
}
class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.toView);
    }
}
class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.fromView);
    }
}
class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.twoWay);
    }
}
bindingBehavior('oneTime')(OneTimeBindingBehavior);
bindingBehavior('toView')(ToViewBindingBehavior);
bindingBehavior('fromView')(FromViewBindingBehavior);
bindingBehavior('twoWay')(TwoWayBindingBehavior);

const defaultDelay$1 = 200;
//
// A binding behavior that prevents
// - (v1 + v2) the view-model from being updated in two-way binding, OR
// - (v1) the the view from being updated in to-view binding,
// until a specified interval has passed without any changes
//
class DebounceBindingBehavior extends BindingInterceptor {
    constructor(binding, expr) {
        super(binding, expr);
        this.opts = { delay: defaultDelay$1 };
        this.firstArg = null;
        this.task = null;
        this.taskQueue = binding.locator.get(IPlatform$1).taskQueue;
        if (expr.args.length > 0) {
            this.firstArg = expr.args[0];
        }
    }
    callSource(args) {
        this.queueTask(() => this.binding.callSource(args));
        return void 0;
    }
    handleChange(newValue, oldValue, flags) {
        // when source has changed before the latest debounced value from target
        // then discard that value, and take latest value from source only
        if (this.task !== null) {
            this.task.cancel();
            this.task = null;
        }
        this.binding.handleChange(newValue, oldValue, flags);
    }
    updateSource(newValue, flags) {
        this.queueTask(() => this.binding.updateSource(newValue, flags));
    }
    queueTask(callback) {
        // Queue the new one before canceling the old one, to prevent early yield
        const task = this.task;
        this.task = this.taskQueue.queueTask(() => {
            this.task = null;
            return callback();
        }, this.opts);
        task === null || task === void 0 ? void 0 : task.cancel();
    }
    $bind(flags, scope) {
        if (this.firstArg !== null) {
            const delay = Number(this.firstArg.evaluate(flags, scope, this.locator, null));
            this.opts.delay = isNaN(delay) ? defaultDelay$1 : delay;
        }
        this.binding.$bind(flags, scope);
    }
    $unbind(flags) {
        var _a;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        this.binding.$unbind(flags);
    }
}
bindingBehavior('debounce')(DebounceBindingBehavior);

class SignalBindingBehavior {
    constructor(signaler) {
        /** @internal */
        this._lookup = new Map();
        this._signaler = signaler;
    }
    bind(flags, scope, binding, ...names) {
        if (!('handleChange' in binding)) {
            throw new Error('AUR0817');
        }
        if (names.length === 0) {
            throw new Error('AUR0818');
        }
        this._lookup.set(binding, names);
        let name;
        for (name of names) {
            this._signaler.addSignalListener(name, binding);
        }
    }
    unbind(flags, scope, binding) {
        const names = this._lookup.get(binding);
        this._lookup.delete(binding);
        let name;
        for (name of names) {
            this._signaler.removeSignalListener(name, binding);
        }
    }
}
/** @internal */
SignalBindingBehavior.inject = [ISignaler];
bindingBehavior('signal')(SignalBindingBehavior);

const defaultDelay = 200;
// A binding behavior that limits
// - (v1) the rate at which the view-model is updated in two-way bindings, OR
// - (v1 + v2) the rate at which the view is updated in to-view binding scenarios.
class ThrottleBindingBehavior extends BindingInterceptor {
    constructor(binding, expr) {
        super(binding, expr);
        this.opts = { delay: defaultDelay };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.delay = 0;
        this._platform = binding.locator.get(IPlatform$1);
        this._taskQueue = this._platform.taskQueue;
        if (expr.args.length > 0) {
            this.firstArg = expr.args[0];
        }
    }
    callSource(args) {
        this._queueTask(() => this.binding.callSource(args));
        return void 0;
    }
    handleChange(newValue, oldValue, flags) {
        // when source has changed before the latest throttled value from target
        // then discard that value, and take latest value from source only
        if (this.task !== null) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this._platform.performanceNow();
        }
        this.binding.handleChange(newValue, oldValue, flags);
    }
    updateSource(newValue, flags) {
        this._queueTask(() => this.binding.updateSource(newValue, flags));
    }
    _queueTask(callback) {
        const opts = this.opts;
        const platform = this._platform;
        const nextDelay = this.lastCall + opts.delay - platform.performanceNow();
        if (nextDelay > 0) {
            // Queue the new one before canceling the old one, to prevent early yield
            const task = this.task;
            opts.delay = nextDelay;
            this.task = this._taskQueue.queueTask(() => {
                this.lastCall = platform.performanceNow();
                this.task = null;
                opts.delay = this.delay;
                callback();
            }, opts);
            task === null || task === void 0 ? void 0 : task.cancel();
        }
        else {
            this.lastCall = platform.performanceNow();
            callback();
        }
    }
    $bind(flags, scope) {
        if (this.firstArg !== null) {
            const delay = Number(this.firstArg.evaluate(flags, scope, this.locator, null));
            this.opts.delay = this.delay = isNaN(delay) ? defaultDelay : delay;
        }
        this.binding.$bind(flags, scope);
    }
    $unbind(flags) {
        var _a;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        super.$unbind(flags);
    }
}
bindingBehavior('throttle')(ThrottleBindingBehavior);

/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see ElementPropertyAccessor
 */
class DataAttributeAccessor {
    constructor() {
        // ObserverType.Layout is not always true, it depends on the property
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    getValue(obj, key) {
        return obj.getAttribute(key);
    }
    setValue(newValue, f, obj, key) {
        if (newValue == void 0) {
            obj.removeAttribute(key);
        }
        else {
            obj.setAttribute(key, newValue);
        }
    }
}
const attrAccessor = new DataAttributeAccessor();

class AttrBindingBehavior {
    bind(flags, _scope, binding) {
        binding.targetObserver = attrAccessor;
    }
    unbind(flags, _scope, binding) {
        return;
    }
}
bindingBehavior('attr')(AttrBindingBehavior);

/** @internal */
function handleSelfEvent(event) {
    const target = event.composedPath()[0];
    if (this.target !== target) {
        return;
    }
    return this.selfEventCallSource(event);
}
class SelfBindingBehavior {
    bind(flags, _scope, binding) {
        if (!binding.callSource || !binding.targetEvent) {
            throw new Error('AUR0801');
        }
        binding.selfEventCallSource = binding.callSource;
        binding.callSource = handleSelfEvent;
    }
    unbind(flags, _scope, binding) {
        binding.callSource = binding.selfEventCallSource;
        binding.selfEventCallSource = null;
    }
}
bindingBehavior('self')(SelfBindingBehavior);

const nsMap = createLookup();
/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
class AttributeNSAccessor {
    constructor(
    /**
     * The namespace associated with this accessor
     */
    ns) {
        this.ns = ns;
        // ObserverType.Layout is not always true, it depends on the property
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    static forNs(ns) {
        var _a;
        return (_a = nsMap[ns]) !== null && _a !== void 0 ? _a : (nsMap[ns] = new AttributeNSAccessor(ns));
    }
    getValue(obj, propertyKey) {
        return obj.getAttributeNS(this.ns, propertyKey);
    }
    setValue(newValue, f, obj, key) {
        if (newValue == void 0) {
            obj.removeAttributeNS(this.ns, key);
        }
        else {
            obj.setAttributeNS(this.ns, key, newValue);
        }
    }
}

function defaultMatcher$1(a, b) {
    return a === b;
}
class CheckedObserver {
    constructor(obj, 
    // deepscan-disable-next-line
    _key, handler, observerLocator) {
        this.handler = handler;
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.value = void 0;
        /** @internal */
        this._oldValue = void 0;
        /** @internal */
        this._collectionObserver = void 0;
        /** @internal */
        this._valueObserver = void 0;
        /** @internal */
        this.f = 0 /* none */;
        this.obj = obj;
        this.oL = observerLocator;
    }
    getValue() {
        return this.value;
    }
    setValue(newValue, flags) {
        const currentValue = this.value;
        if (newValue === currentValue) {
            return;
        }
        this.value = newValue;
        this._oldValue = currentValue;
        this.f = flags;
        this._observe();
        this._synchronizeElement();
        this.queue.add(this);
    }
    handleCollectionChange(indexMap, flags) {
        this._synchronizeElement();
    }
    handleChange(newValue, previousValue, flags) {
        this._synchronizeElement();
    }
    /** @internal */
    _synchronizeElement() {
        const currentValue = this.value;
        const obj = this.obj;
        const elementValue = hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
        const isRadio = obj.type === 'radio';
        const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher$1;
        if (isRadio) {
            obj.checked = !!matcher(currentValue, elementValue);
        }
        else if (currentValue === true) {
            obj.checked = true;
        }
        else {
            let hasMatch = false;
            if (currentValue instanceof Array) {
                hasMatch = currentValue.findIndex(item => !!matcher(item, elementValue)) !== -1;
            }
            else if (currentValue instanceof Set) {
                for (const v of currentValue) {
                    if (matcher(v, elementValue)) {
                        hasMatch = true;
                        break;
                    }
                }
            }
            else if (currentValue instanceof Map) {
                for (const pair of currentValue) {
                    const existingItem = pair[0];
                    const $isChecked = pair[1];
                    // a potential complain, when only `true` is supported
                    // but it's consistent with array
                    if (matcher(existingItem, elementValue) && $isChecked === true) {
                        hasMatch = true;
                        break;
                    }
                }
            }
            obj.checked = hasMatch;
        }
    }
    handleEvent() {
        let currentValue = this._oldValue = this.value;
        const obj = this.obj;
        const elementValue = hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
        const isChecked = obj.checked;
        const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher$1;
        if (obj.type === 'checkbox') {
            if (currentValue instanceof Array) {
                // Array binding steps on a change event:
                // 1. find corresponding item INDEX in the Set based on current model/value and matcher
                // 2. is the checkbox checked?
                //    2.1. Yes: is the corresponding item in the Array (index === -1)?
                //        2.1.1 No: push the current model/value to the Array
                //    2.2. No: is the corresponding item in the Array (index !== -1)?
                //        2.2.1: Yes: remove the corresponding item
                // =================================================
                const index = currentValue.findIndex(item => !!matcher(item, elementValue));
                // if the checkbox is checkde, and there's no matching value in the existing array
                // add the checkbox model/value to the array
                if (isChecked && index === -1) {
                    currentValue.push(elementValue);
                }
                else if (!isChecked && index !== -1) {
                    // if the checkbox is not checked, and found a matching item in the array
                    // based on the checkbox model/value
                    // remove the existing item
                    currentValue.splice(index, 1);
                }
                // when existing currentValue is an array,
                // do not invoke callback as only the array obj has changed
                return;
            }
            else if (currentValue instanceof Set) {
                // Set binding steps on a change event:
                // 1. find corresponding item in the Set based on current model/value and matcher
                // 2. is the checkbox checked?
                //    2.1. Yes: is the corresponding item in the Set?
                //        2.1.1 No: add the current model/value to the Set
                //    2.2. No: is the corresponding item in the Set?
                //        2.2.1: Yes: remove the corresponding item
                // =================================================
                // 1. find corresponding item
                const unset = {};
                let existingItem = unset;
                for (const value of currentValue) {
                    if (matcher(value, elementValue) === true) {
                        existingItem = value;
                        break;
                    }
                }
                // 2.1. Checkbox is checked, is the corresponding item in the Set?
                //
                // if checkbox is checked and there's no value in the existing Set
                // add the checkbox model/value to the Set
                if (isChecked && existingItem === unset) {
                    // 2.1.1. add the current model/value to the Set
                    currentValue.add(elementValue);
                }
                else if (!isChecked && existingItem !== unset) {
                    // 2.2.1 Checkbox is unchecked, corresponding is in the Set
                    //
                    // if checkbox is not checked, and found a matching item in the Set
                    // based on the checkbox model/value
                    // remove the existing item
                    currentValue.delete(existingItem);
                }
                // when existing value is a Set,
                // do not invoke callback as only the Set has been mutated
                return;
            }
            else if (currentValue instanceof Map) {
                // Map binding steps on a change event
                // 1. find corresponding item in the Map based on current model/value and matcher
                // 2. Set the value of the corresponding item in the Map based on checked state of the checkbox
                // =================================================
                // 1. find the corresponding item
                let existingItem;
                for (const pair of currentValue) {
                    const currItem = pair[0];
                    if (matcher(currItem, elementValue) === true) {
                        existingItem = currItem;
                        break;
                    }
                }
                // 2. set the value of the corresponding item in the map
                // if checkbox is checked and there's no value in the existing Map
                // add the checkbox model/value to the Map as key,
                // and value will be checked state of the checkbox
                currentValue.set(existingItem, isChecked);
                // when existing value is a Map,
                // do not invoke callback as only the Map has been mutated
                return;
            }
            currentValue = isChecked;
        }
        else if (isChecked) {
            currentValue = elementValue;
        }
        else {
            // if it's a radio and it has been unchecked
            // do nothing, as the radio that was checked will fire change event and it will be handle there
            // a radio cannot be unchecked by user
            return;
        }
        this.value = currentValue;
        this.queue.add(this);
    }
    start() {
        this.handler.subscribe(this.obj, this);
        this._observe();
    }
    stop() {
        var _a, _b;
        this.handler.dispose();
        (_a = this._collectionObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this._collectionObserver = void 0;
        (_b = this._valueObserver) === null || _b === void 0 ? void 0 : _b.unsubscribe(this);
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.start();
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.stop();
        }
    }
    flush() {
        oV$2 = this._oldValue;
        this._oldValue = this.value;
        this.subs.notify(this.value, oV$2, this.f);
    }
    /** @internal */
    _observe() {
        var _a, _b, _c, _d, _e, _f, _g;
        const obj = this.obj;
        (_e = ((_a = this._valueObserver) !== null && _a !== void 0 ? _a : (this._valueObserver = (_c = (_b = obj.$observers) === null || _b === void 0 ? void 0 : _b.model) !== null && _c !== void 0 ? _c : (_d = obj.$observers) === null || _d === void 0 ? void 0 : _d.value))) === null || _e === void 0 ? void 0 : _e.subscribe(this);
        (_f = this._collectionObserver) === null || _f === void 0 ? void 0 : _f.unsubscribe(this);
        this._collectionObserver = void 0;
        if (obj.type === 'checkbox') {
            (_g = (this._collectionObserver = getCollectionObserver(this.value, this.oL))) === null || _g === void 0 ? void 0 : _g.subscribe(this);
        }
    }
}
subscriberCollection(CheckedObserver);
withFlushQueue(CheckedObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$2 = void 0;

const hasOwn = Object.prototype.hasOwnProperty;
const childObserverOptions = {
    childList: true,
    subtree: true,
    characterData: true
};
function defaultMatcher(a, b) {
    return a === b;
}
class SelectValueObserver {
    constructor(obj, 
    // deepscan-disable-next-line
    _key, handler, observerLocator) {
        this.handler = handler;
        // ObserverType.Layout is not always true
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.value = void 0;
        /** @internal */
        this._oldValue = void 0;
        /** @internal */
        this._hasChanges = false;
        /** @internal */
        this._arrayObserver = void 0;
        /** @internal */
        this._nodeObserver = void 0;
        /** @internal */
        this._observing = false;
        this.obj = obj;
        this.oL = observerLocator;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this._observing
            ? this.value
            : this.obj.multiple
                ? Array.from(this.obj.options).map(o => o.value)
                : this.obj.value;
    }
    setValue(newValue, flags) {
        this._oldValue = this.value;
        this.value = newValue;
        this._hasChanges = newValue !== this._oldValue;
        this._observeArray(newValue instanceof Array ? newValue : null);
        if ((flags & 256 /* noFlush */) === 0) {
            this._flushChanges();
        }
    }
    /** @internal */
    _flushChanges() {
        if (this._hasChanges) {
            this._hasChanges = false;
            this.syncOptions();
        }
    }
    handleCollectionChange() {
        // always sync "selected" property of <options/>
        // immediately whenever the array notifies its mutation
        this.syncOptions();
    }
    syncOptions() {
        var _a;
        const value = this.value;
        const obj = this.obj;
        const isArray = Array.isArray(value);
        const matcher = (_a = obj.matcher) !== null && _a !== void 0 ? _a : defaultMatcher;
        const options = obj.options;
        let i = options.length;
        while (i-- > 0) {
            const option = options[i];
            const optionValue = hasOwn.call(option, 'model') ? option.model : option.value;
            if (isArray) {
                option.selected = value.findIndex(item => !!matcher(optionValue, item)) !== -1;
                continue;
            }
            option.selected = !!matcher(optionValue, value);
        }
    }
    syncValue() {
        // Spec for synchronizing value from `<select/>`  to `SelectObserver`
        // When synchronizing value to observed <select/> element, do the following steps:
        // A. If `<select/>` is multiple
        //    1. Check if current value, called `currentValue` is an array
        //      a. If not an array, return true to signal value has changed
        //      b. If is an array:
        //        i. gather all current selected <option/>, in to array called `values`
        //        ii. loop through the `currentValue` array and remove items that are nolonger selected based on matcher
        //        iii. loop through the `values` array and add items that are selected based on matcher
        //        iv. Return false to signal value hasn't changed
        // B. If the select is single
        //    1. Let `value` equal the first selected option, if no option selected, then `value` is `null`
        //    2. assign `this.currentValue` to `this.oldValue`
        //    3. assign `value` to `this.currentValue`
        //    4. return `true` to signal value has changed
        const obj = this.obj;
        const options = obj.options;
        const len = options.length;
        const currentValue = this.value;
        let i = 0;
        if (obj.multiple) {
            // A.
            if (!(currentValue instanceof Array)) {
                // A.1.a
                return true;
            }
            // A.1.b
            // multi select
            let option;
            const matcher = obj.matcher || defaultMatcher;
            // A.1.b.i
            const values = [];
            while (i < len) {
                option = options[i];
                if (option.selected) {
                    values.push(hasOwn.call(option, 'model')
                        ? option.model
                        : option.value);
                }
                ++i;
            }
            let a;
            // A.1.b.ii
            i = 0;
            while (i < currentValue.length) {
                a = currentValue[i];
                // Todo: remove arrow fn
                if (values.findIndex(b => !!matcher(a, b)) === -1) {
                    currentValue.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
            // A.1.b.iii
            i = 0;
            while (i < values.length) {
                a = values[i];
                // Todo: remove arrow fn
                if (currentValue.findIndex(b => !!matcher(a, b)) === -1) {
                    currentValue.push(a);
                }
                ++i;
            }
            // A.1.b.iv
            return false;
        }
        // B. single select
        // B.1
        let value = null;
        let option;
        while (i < len) {
            option = options[i];
            if (option.selected) {
                value = hasOwn.call(option, 'model')
                    ? option.model
                    : option.value;
                break;
            }
            ++i;
        }
        // B.2
        this._oldValue = this.value;
        // B.3
        this.value = value;
        // B.4
        return true;
    }
    /** @internal */
    _start() {
        (this._nodeObserver = new this.obj.ownerDocument.defaultView.MutationObserver(this._handleNodeChange.bind(this)))
            .observe(this.obj, childObserverOptions);
        this._observeArray(this.value instanceof Array ? this.value : null);
        this._observing = true;
    }
    /** @internal */
    _stop() {
        var _a;
        this._nodeObserver.disconnect();
        (_a = this._arrayObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this._nodeObserver
            = this._arrayObserver
                = void 0;
        this._observing = false;
    }
    // todo: observe all kind of collection
    /** @internal */
    _observeArray(array) {
        var _a;
        (_a = this._arrayObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this._arrayObserver = void 0;
        if (array != null) {
            if (!this.obj.multiple) {
                throw new Error('AUR0654');
            }
            (this._arrayObserver = this.oL.getArrayObserver(array)).subscribe(this);
        }
    }
    handleEvent() {
        const shouldNotify = this.syncValue();
        if (shouldNotify) {
            this.queue.add(this);
            // this.subs.notify(this.currentValue, this.oldValue, LF.none);
        }
    }
    /** @internal */
    _handleNodeChange() {
        this.syncOptions();
        const shouldNotify = this.syncValue();
        if (shouldNotify) {
            this.queue.add(this);
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.handler.subscribe(this.obj, this);
            this._start();
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.handler.dispose();
            this._stop();
        }
    }
    flush() {
        oV$1 = this._oldValue;
        this._oldValue = this.value;
        this.subs.notify(this.value, oV$1, 0 /* none */);
    }
}
subscriberCollection(SelectValueObserver);
withFlushQueue(SelectValueObserver);
// a shared variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$1 = void 0;

const customPropertyPrefix = '--';
class StyleAttributeAccessor {
    constructor(obj) {
        this.obj = obj;
        this.type = 2 /* Node */ | 4 /* Layout */;
        this.value = '';
        /** @internal */
        this._oldValue = '';
        this.styles = {};
        this.version = 0;
        /** @internal */
        this._hasChanges = false;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(newValue, flags) {
        this.value = newValue;
        this._hasChanges = newValue !== this._oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this._flushChanges();
        }
    }
    _getStyleTuplesFromString(currentValue) {
        const styleTuples = [];
        const urlRegexTester = /url\([^)]+$/;
        let offset = 0;
        let currentChunk = '';
        let nextSplit;
        let indexOfColon;
        let attribute;
        let value;
        while (offset < currentValue.length) {
            nextSplit = currentValue.indexOf(';', offset);
            if (nextSplit === -1) {
                nextSplit = currentValue.length;
            }
            currentChunk += currentValue.substring(offset, nextSplit);
            offset = nextSplit + 1;
            // Make sure we never split a url so advance to next
            if (urlRegexTester.test(currentChunk)) {
                currentChunk += ';';
                continue;
            }
            indexOfColon = currentChunk.indexOf(':');
            attribute = currentChunk.substring(0, indexOfColon).trim();
            value = currentChunk.substring(indexOfColon + 1).trim();
            styleTuples.push([attribute, value]);
            currentChunk = '';
        }
        return styleTuples;
    }
    _getStyleTuplesFromObject(currentValue) {
        let value;
        let property;
        const styles = [];
        for (property in currentValue) {
            value = currentValue[property];
            if (value == null) {
                continue;
            }
            if (typeof value === 'string') {
                // Custom properties should not be tampered with
                if (property.startsWith(customPropertyPrefix)) {
                    styles.push([property, value]);
                    continue;
                }
                styles.push([kebabCase(property), value]);
                continue;
            }
            styles.push(...this._getStyleTuples(value));
        }
        return styles;
    }
    _getStyleTuplesFromArray(currentValue) {
        const len = currentValue.length;
        if (len > 0) {
            const styles = [];
            let i = 0;
            for (; len > i; ++i) {
                styles.push(...this._getStyleTuples(currentValue[i]));
            }
            return styles;
        }
        return emptyArray;
    }
    _getStyleTuples(currentValue) {
        if (typeof currentValue === 'string') {
            return this._getStyleTuplesFromString(currentValue);
        }
        if (currentValue instanceof Array) {
            return this._getStyleTuplesFromArray(currentValue);
        }
        if (currentValue instanceof Object) {
            return this._getStyleTuplesFromObject(currentValue);
        }
        return emptyArray;
    }
    /** @internal */
    _flushChanges() {
        if (this._hasChanges) {
            this._hasChanges = false;
            const currentValue = this.value;
            const styles = this.styles;
            const styleTuples = this._getStyleTuples(currentValue);
            let style;
            let version = this.version;
            this._oldValue = currentValue;
            let tuple;
            let name;
            let value;
            let i = 0;
            const len = styleTuples.length;
            for (; i < len; ++i) {
                tuple = styleTuples[i];
                name = tuple[0];
                value = tuple[1];
                this.setProperty(name, value);
                styles[name] = version;
            }
            this.styles = styles;
            this.version += 1;
            if (version === 0) {
                return;
            }
            version -= 1;
            for (style in styles) {
                if (!Object.prototype.hasOwnProperty.call(styles, style) || styles[style] !== version) {
                    continue;
                }
                this.obj.style.removeProperty(style);
            }
        }
    }
    setProperty(style, value) {
        let priority = '';
        if (value != null && typeof value.indexOf === 'function' && value.includes('!important')) {
            priority = 'important';
            value = value.replace('!important', '');
        }
        this.obj.style.setProperty(style, value, priority);
    }
    bind(flags) {
        this.value = this._oldValue = this.obj.style.cssText;
    }
}

/**
 * Observer for non-radio, non-checkbox input.
 */
class ValueAttributeObserver {
    constructor(obj, key, handler) {
        this.key = key;
        this.handler = handler;
        // ObserverType.Layout is not always true, it depends on the element & property combo
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.value = '';
        /** @internal */
        this._oldValue = '';
        /** @internal */
        this._hasChanges = false;
        this.obj = obj;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.value;
    }
    setValue(newValue, flags) {
        if (Object.is(newValue, this.value)) {
            return;
        }
        this._oldValue = this.value;
        this.value = newValue;
        this._hasChanges = true;
        if (!this.handler.config.readonly && (flags & 256 /* noFlush */) === 0) {
            this._flushChanges(flags);
        }
    }
    /** @internal */
    _flushChanges(flags) {
        var _a;
        if (this._hasChanges) {
            this._hasChanges = false;
            this.obj[this.key] = (_a = this.value) !== null && _a !== void 0 ? _a : this.handler.config.default;
            if ((flags & 2 /* fromBind */) === 0) {
                this.queue.add(this);
            }
        }
    }
    handleEvent() {
        this._oldValue = this.value;
        this.value = this.obj[this.key];
        if (this._oldValue !== this.value) {
            this._hasChanges = false;
            this.queue.add(this);
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.handler.subscribe(this.obj, this);
            this.value = this._oldValue = this.obj[this.key];
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.handler.dispose();
        }
    }
    flush() {
        oV = this._oldValue;
        this._oldValue = this.value;
        this.subs.notify(this.value, oV, 0 /* none */);
    }
}
subscriberCollection(ValueAttributeObserver);
withFlushQueue(ValueAttributeObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV = void 0;

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const xmlnsNS = 'http://www.w3.org/2000/xmlns/';
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
const nsAttributes = Object.assign(createLookup(), {
    'xlink:actuate': ['actuate', xlinkNS],
    'xlink:arcrole': ['arcrole', xlinkNS],
    'xlink:href': ['href', xlinkNS],
    'xlink:role': ['role', xlinkNS],
    'xlink:show': ['show', xlinkNS],
    'xlink:title': ['title', xlinkNS],
    'xlink:type': ['type', xlinkNS],
    'xml:lang': ['lang', xmlNS],
    'xml:space': ['space', xmlNS],
    'xmlns': ['xmlns', xmlnsNS],
    'xmlns:xlink': ['xlink', xmlnsNS],
});
const elementPropertyAccessor = new PropertyAccessor();
elementPropertyAccessor.type = 2 /* Node */ | 4 /* Layout */;
class NodeObserverConfig {
    constructor(config) {
        var _a;
        this.type = (_a = config.type) !== null && _a !== void 0 ? _a : ValueAttributeObserver;
        this.events = config.events;
        this.readonly = config.readonly;
        this.default = config.default;
    }
}
class NodeObserverLocator {
    constructor(locator, platform, dirtyChecker, svgAnalyzer) {
        this.locator = locator;
        this.platform = platform;
        this.dirtyChecker = dirtyChecker;
        this.svgAnalyzer = svgAnalyzer;
        this.allowDirtyCheck = true;
        /** @internal */
        this._events = createLookup();
        /** @internal */
        this._globalEvents = createLookup();
        /** @internal */
        this._overrides = createLookup();
        /** @internal */
        this._globalOverrides = createLookup();
        // todo: atm, platform is required to be resolved too eagerly for the `.handles()` check
        // also a lot of tests assume default availability of observation
        // those 2 assumptions make it not the right time to extract the following line into a
        // default configuration for NodeObserverLocator yet
        // but in the future, they should be, so apps that don't use check box/select, or implement a different
        // observer don't have to pay the of the default implementation
        const inputEvents = ['change', 'input'];
        const inputEventsConfig = { events: inputEvents, default: '' };
        this.useConfig({
            INPUT: {
                value: inputEventsConfig,
                valueAsNumber: { events: inputEvents, default: 0 },
                checked: { type: CheckedObserver, events: inputEvents },
                files: { events: inputEvents, readonly: true },
            },
            SELECT: {
                value: { type: SelectValueObserver, events: ['change'], default: '' },
            },
            TEXTAREA: {
                value: inputEventsConfig,
            },
        });
        const contentEventsConfig = { events: ['change', 'input', 'blur', 'keyup', 'paste'], default: '' };
        const scrollEventsConfig = { events: ['scroll'], default: 0 };
        this.useConfigGlobal({
            scrollTop: scrollEventsConfig,
            scrollLeft: scrollEventsConfig,
            textContent: contentEventsConfig,
            innerHTML: contentEventsConfig,
        });
        this.overrideAccessorGlobal('css', 'style', 'class');
        this.overrideAccessor({
            INPUT: ['value', 'checked', 'model'],
            SELECT: ['value'],
            TEXTAREA: ['value'],
        });
    }
    static register(container) {
        Registration.aliasTo(INodeObserverLocator, NodeObserverLocator).register(container);
        Registration.singleton(INodeObserverLocator, NodeObserverLocator).register(container);
    }
    // deepscan-disable-next-line
    handles(obj, _key) {
        return obj instanceof this.platform.Node;
    }
    useConfig(nodeNameOrConfig, key, eventsConfig) {
        var _a, _b;
        const lookup = this._events;
        let existingMapping;
        if (typeof nodeNameOrConfig === 'string') {
            existingMapping = (_a = lookup[nodeNameOrConfig]) !== null && _a !== void 0 ? _a : (lookup[nodeNameOrConfig] = createLookup());
            if (existingMapping[key] == null) {
                existingMapping[key] = new NodeObserverConfig(eventsConfig);
            }
            else {
                throwMappingExisted(nodeNameOrConfig, key);
            }
        }
        else {
            for (const nodeName in nodeNameOrConfig) {
                existingMapping = (_b = lookup[nodeName]) !== null && _b !== void 0 ? _b : (lookup[nodeName] = createLookup());
                const newMapping = nodeNameOrConfig[nodeName];
                for (key in newMapping) {
                    if (existingMapping[key] == null) {
                        existingMapping[key] = new NodeObserverConfig(newMapping[key]);
                    }
                    else {
                        throwMappingExisted(nodeName, key);
                    }
                }
            }
        }
    }
    useConfigGlobal(configOrKey, eventsConfig) {
        const lookup = this._globalEvents;
        if (typeof configOrKey === 'object') {
            for (const key in configOrKey) {
                if (lookup[key] == null) {
                    lookup[key] = new NodeObserverConfig(configOrKey[key]);
                }
                else {
                    throwMappingExisted('*', key);
                }
            }
        }
        else {
            if (lookup[configOrKey] == null) {
                lookup[configOrKey] = new NodeObserverConfig(eventsConfig);
            }
            else {
                throwMappingExisted('*', configOrKey);
            }
        }
    }
    // deepscan-disable-nextline
    getAccessor(obj, key, requestor) {
        var _a;
        if (key in this._globalOverrides || (key in ((_a = this._overrides[obj.tagName]) !== null && _a !== void 0 ? _a : emptyObject))) {
            return this.getObserver(obj, key, requestor);
        }
        switch (key) {
            // class / style / css attribute will be observed using .getObserver() per overrides
            //
            // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
            // but for now stick to what vCurrent does
            case 'src':
            case 'href':
            // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
            case 'role':
                return attrAccessor;
            default: {
                const nsProps = nsAttributes[key];
                if (nsProps !== undefined) {
                    return AttributeNSAccessor.forNs(nsProps[1]);
                }
                if (isDataAttribute(obj, key, this.svgAnalyzer)) {
                    return attrAccessor;
                }
                return elementPropertyAccessor;
            }
        }
    }
    overrideAccessor(tagNameOrOverrides, key) {
        var _a, _b;
        var _c, _d;
        let existingTagOverride;
        if (typeof tagNameOrOverrides === 'string') {
            existingTagOverride = (_a = (_c = this._overrides)[tagNameOrOverrides]) !== null && _a !== void 0 ? _a : (_c[tagNameOrOverrides] = createLookup());
            existingTagOverride[key] = true;
        }
        else {
            for (const tagName in tagNameOrOverrides) {
                for (const key of tagNameOrOverrides[tagName]) {
                    existingTagOverride = (_b = (_d = this._overrides)[tagName]) !== null && _b !== void 0 ? _b : (_d[tagName] = createLookup());
                    existingTagOverride[key] = true;
                }
            }
        }
    }
    /**
     * For all elements:
     * compose a list of properties,
     * to indicate that an overser should be returned instead of an accessor in `.getAccessor()`
     */
    overrideAccessorGlobal(...keys) {
        for (const key of keys) {
            this._globalOverrides[key] = true;
        }
    }
    getObserver(el, key, requestor) {
        var _a, _b;
        switch (key) {
            case 'role':
                return attrAccessor;
            case 'class':
                return new ClassAttributeAccessor(el);
            case 'css':
            case 'style':
                return new StyleAttributeAccessor(el);
        }
        const eventsConfig = (_b = (_a = this._events[el.tagName]) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : this._globalEvents[key];
        if (eventsConfig != null) {
            return new eventsConfig.type(el, key, new EventSubscriber(eventsConfig), requestor, this.locator);
        }
        const nsProps = nsAttributes[key];
        if (nsProps !== undefined) {
            return AttributeNSAccessor.forNs(nsProps[1]);
        }
        if (isDataAttribute(el, key, this.svgAnalyzer)) {
            // todo: should observe
            return attrAccessor;
        }
        if (key in el.constructor.prototype) {
            if (this.allowDirtyCheck) {
                return this.dirtyChecker.createProperty(el, key);
            }
            // consider:
            // - maybe add a adapter API to handle unknown obj/key combo
            throw new Error(`AUR0652:${String(key)}`);
        }
        else {
            // todo: probably still needs to get the property descriptor via getOwnPropertyDescriptor
            // but let's start with simplest scenario
            return new SetterObserver(el, key);
        }
    }
}
/** @internal */
NodeObserverLocator.inject = [IServiceLocator, IPlatform, IDirtyChecker, ISVGAnalyzer];
function getCollectionObserver(collection, observerLocator) {
    if (collection instanceof Array) {
        return observerLocator.getArrayObserver(collection);
    }
    if (collection instanceof Map) {
        return observerLocator.getMapObserver(collection);
    }
    if (collection instanceof Set) {
        return observerLocator.getSetObserver(collection);
    }
}
function throwMappingExisted(nodeName, key) {
    throw new Error(`AUR0653:${String(key)}@${nodeName}`);
}

class UpdateTriggerBindingBehavior {
    constructor(observerLocator) {
        this.oL = observerLocator;
    }
    bind(flags, _scope, binding, ...events) {
        if (events.length === 0) {
            throw new Error(`AUR0802`);
        }
        if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
            throw new Error('AUR0803');
        }
        // ensure the binding's target observer has been set.
        const targetObserver = this.oL.getObserver(binding.target, binding.targetProperty);
        if (!targetObserver.handler) {
            throw new Error('AUR0804');
        }
        binding.targetObserver = targetObserver;
        // stash the original element subscribe function.
        const originalHandler = targetObserver.handler;
        targetObserver.originalHandler = originalHandler;
        // replace the element subscribe function with one that uses the correct events.
        targetObserver.handler = new EventSubscriber(new NodeObserverConfig({
            default: originalHandler.config.default,
            events,
            readonly: originalHandler.config.readonly
        }));
    }
    unbind(flags, _scope, binding) {
        // restore the state of the binding.
        binding.targetObserver.handler.dispose();
        binding.targetObserver.handler = binding.targetObserver.originalHandler;
        binding.targetObserver.originalHandler = null;
    }
}
UpdateTriggerBindingBehavior.inject = [IObserverLocator];
bindingBehavior('updateTrigger')(UpdateTriggerBindingBehavior);

/**
 * Focus attribute for element focus binding
 */
let Focus = class Focus {
    constructor(_element, p) {
        this._element = _element;
        this.p = p;
        /**
         * Indicates whether `apply` should be called when `attached` callback is invoked
         */
        this._needsApply = false;
    }
    binding() {
        this.valueChanged();
    }
    /**
     * Invoked everytime the bound value changes.
     *
     * @param newValue - The new value.
     */
    valueChanged() {
        // In theory, we could/should react immediately
        // but focus state of an element cannot be achieved
        // while it's disconnected from the document
        // thus, there neesd to be a check if it's currently connected or not
        // before applying the value to the element
        if (this.$controller.isActive) {
            this.apply();
        }
        else {
            // If the element is not currently connect
            // toggle the flag to add pending work for later
            // in attached lifecycle
            this._needsApply = true;
        }
    }
    /**
     * Invoked when the attribute is attached to the DOM.
     */
    attached() {
        if (this._needsApply) {
            this._needsApply = false;
            this.apply();
        }
        const el = this._element;
        el.addEventListener('focus', this);
        el.addEventListener('blur', this);
    }
    /**
     * Invoked when the attribute is afterDetachChildren from the DOM.
     */
    afterDetachChildren() {
        const el = this._element;
        el.removeEventListener('focus', this);
        el.removeEventListener('blur', this);
    }
    /**
     * EventTarget interface handler for better memory usage
     */
    handleEvent(e) {
        // there are only two event listened to
        // if the even is focus, it menans the element is focused
        // only need to switch the value to true
        if (e.type === 'focus') {
            this.value = true;
        }
        else if (!this.isElFocused) {
            // else, it's blur event
            // when a blur event happens, there are two situations
            // 1. the element itself lost the focus
            // 2. window lost the focus
            // To handle both (1) and (2), only need to check if
            // current active element is still the same element of this focus custom attribute
            // If it's not, it's a blur event happened on Window because the browser tab lost focus
            this.value = false;
        }
    }
    /**
     * Focus/blur based on current value
     */
    apply() {
        const el = this._element;
        const isFocused = this.isElFocused;
        const shouldFocus = this.value;
        if (shouldFocus && !isFocused) {
            el.focus();
        }
        else if (!shouldFocus && isFocused) {
            el.blur();
        }
    }
    get isElFocused() {
        return this._element === this.p.document.activeElement;
    }
};
__decorate([
    bindable({ mode: BindingMode.twoWay })
], Focus.prototype, "value", void 0);
Focus = __decorate([
    __param(0, INode),
    __param(1, IPlatform)
], Focus);
customAttribute('focus')(Focus);

let Show = class Show {
    constructor(el, p, instr) {
        this.el = el;
        this.p = p;
        this.isActive = false;
        this.task = null;
        this.$val = '';
        this.$prio = '';
        this.update = () => {
            this.task = null;
            // Only compare at the synchronous moment when we're about to update, because the value might have changed since the update was queued.
            if (Boolean(this.value) !== this.isToggled) {
                if (this.isToggled === this.base) {
                    this.isToggled = !this.base;
                    // Note: in v1 we used the 'au-hide' class, but in v2 it's so trivial to conditionally apply classes (e.g. 'hide.class="someCondition"'),
                    // that it's probably better to avoid the CSS inject infra involvement and keep this CA as simple as possible.
                    // Instead, just store and restore the property values (with each mutation, to account for in-between updates), to cover the common cases, until there is convincing feedback to do otherwise.
                    this.$val = this.el.style.getPropertyValue('display');
                    this.$prio = this.el.style.getPropertyPriority('display');
                    this.el.style.setProperty('display', 'none', 'important');
                }
                else {
                    this.isToggled = this.base;
                    this.el.style.setProperty('display', this.$val, this.$prio);
                    // If the style attribute is now empty, remove it.
                    if (this.el.getAttribute('style') === '') {
                        this.el.removeAttribute('style');
                    }
                }
            }
        };
        // if this is declared as a 'hide' attribute, then this.base will be false, inverting everything.
        this.isToggled = this.base = instr.alias !== 'hide';
    }
    binding() {
        this.isActive = true;
        this.update();
    }
    detaching() {
        var _a;
        this.isActive = false;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
    }
    valueChanged() {
        if (this.isActive && this.task === null) {
            this.task = this.p.domWriteQueue.queueTask(this.update);
        }
    }
};
__decorate([
    bindable
], Show.prototype, "value", void 0);
Show = __decorate([
    __param(0, INode),
    __param(1, IPlatform),
    __param(2, IInstruction)
], Show);
alias('hide')(Show);
customAttribute('show')(Show);

class Portal {
    constructor(factory, originalLoc, p) {
        this.id = nextId('au$component');
        this.strict = false;
        this.p = p;
        // to make the shape of this object consistent.
        // todo: is this necessary
        this._currentTarget = p.document.createElement('div');
        this.view = factory.create();
        setEffectiveParentNode(this.view.nodes, originalLoc);
    }
    attaching(initiator, parent, flags) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        const newTarget = this._currentTarget = this._resolveTarget();
        this.view.setHost(newTarget);
        return this._activating(initiator, newTarget, flags);
    }
    detaching(initiator, parent, flags) {
        return this._deactivating(initiator, this._currentTarget, flags);
    }
    targetChanged() {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        const oldTarget = this._currentTarget;
        const newTarget = this._currentTarget = this._resolveTarget();
        if (oldTarget === newTarget) {
            return;
        }
        this.view.setHost(newTarget);
        // TODO(fkleuver): fix and test possible race condition
        const ret = onResolve(this._deactivating(null, newTarget, $controller.flags), () => {
            return this._activating(null, newTarget, $controller.flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    _activating(initiator, target, flags) {
        const { activating, callbackContext, view } = this;
        view.setHost(target);
        return onResolve(activating === null || activating === void 0 ? void 0 : activating.call(callbackContext, target, view), () => {
            return this._activate(initiator, target, flags);
        });
    }
    _activate(initiator, target, flags) {
        const { $controller, view } = this;
        if (initiator === null) {
            view.nodes.appendTo(target);
        }
        else {
            // TODO(fkleuver): fix and test possible race condition
            return onResolve(view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, $controller.scope), () => {
                return this._activated(target);
            });
        }
        return this._activated(target);
    }
    _activated(target) {
        const { activated, callbackContext, view } = this;
        return activated === null || activated === void 0 ? void 0 : activated.call(callbackContext, target, view);
    }
    _deactivating(initiator, target, flags) {
        const { deactivating, callbackContext, view } = this;
        return onResolve(deactivating === null || deactivating === void 0 ? void 0 : deactivating.call(callbackContext, target, view), () => {
            return this._deactivate(initiator, target, flags);
        });
    }
    _deactivate(initiator, target, flags) {
        const { $controller, view } = this;
        if (initiator === null) {
            view.nodes.remove();
        }
        else {
            return onResolve(view.deactivate(initiator, $controller, flags), () => {
                return this._deactivated(target);
            });
        }
        return this._deactivated(target);
    }
    _deactivated(target) {
        const { deactivated, callbackContext, view } = this;
        return deactivated === null || deactivated === void 0 ? void 0 : deactivated.call(callbackContext, target, view);
    }
    _resolveTarget() {
        const p = this.p;
        // with a $ in front to make it less confusing/error prone
        const $document = p.document;
        let target = this.target;
        let context = this.renderContext;
        if (target === '') {
            if (this.strict) {
                throw new Error('AUR0811');
            }
            return $document.body;
        }
        if (typeof target === 'string') {
            let queryContext = $document;
            if (typeof context === 'string') {
                context = $document.querySelector(context);
            }
            if (context instanceof p.Node) {
                queryContext = context;
            }
            target = queryContext.querySelector(target);
        }
        if (target instanceof p.Node) {
            return target;
        }
        if (target == null) {
            if (this.strict) {
                throw new Error('AUR0812');
            }
            return $document.body;
        }
        return target;
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
        this.callbackContext = null;
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
}
Portal.inject = [IViewFactory, IRenderLocation, IPlatform];
__decorate([
    bindable({ primary: true })
], Portal.prototype, "target", void 0);
__decorate([
    bindable({ callback: 'targetChanged' })
], Portal.prototype, "renderContext", void 0);
__decorate([
    bindable()
], Portal.prototype, "strict", void 0);
__decorate([
    bindable()
], Portal.prototype, "deactivating", void 0);
__decorate([
    bindable()
], Portal.prototype, "activating", void 0);
__decorate([
    bindable()
], Portal.prototype, "deactivated", void 0);
__decorate([
    bindable()
], Portal.prototype, "activated", void 0);
__decorate([
    bindable()
], Portal.prototype, "callbackContext", void 0);
templateController('portal')(Portal);

class FlagsTemplateController {
    constructor(factory, location, flags) {
        this.factory = factory;
        this.flags = flags;
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    attaching(initiator, parent, flags) {
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags | this.flags, $controller.scope);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
}
class FrequentMutations extends FlagsTemplateController {
    constructor(factory, location) {
        super(factory, location, 512 /* persistentTargetObserverQueue */);
    }
}
/**
 * @internal
 */
FrequentMutations.inject = [IViewFactory, IRenderLocation];
class ObserveShallow extends FlagsTemplateController {
    constructor(factory, location) {
        super(factory, location, 128 /* observeLeafPropertiesOnly */);
    }
}
/**
 * @internal
 */
ObserveShallow.inject = [IViewFactory, IRenderLocation];
templateController('frequent-mutations')(FrequentMutations);
templateController('observe-shallow')(ObserveShallow);

class If {
    constructor(ifFactory, location, work) {
        this.ifFactory = ifFactory;
        this.location = location;
        this.work = work;
        this.id = nextId('au$component');
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.value = false;
        /**
         * `false` to always dispose the existing `view` whenever the value of if changes to false
         */
        this.cache = true;
        this.pending = void 0;
        this._wantsDeactivate = false;
        this._swapId = 0;
    }
    attaching(initiator, parent, f) {
        let view;
        const ctrl = this.$controller;
        const swapId = this._swapId++;
        /**
         * returns true when
         * 1. entering deactivation of the [if] itself
         * 2. new swap has started since this change
         */
        const isCurrent = () => !this._wantsDeactivate && this._swapId === swapId + 1;
        return onResolve(this.pending, () => {
            var _a;
            if (!isCurrent()) {
                return;
            }
            this.pending = void 0;
            if (this.value) {
                view = (this.view = this.ifView = this.cache && this.ifView != null
                    ? this.ifView
                    : this.ifFactory.create(f));
            }
            else {
                // truthy -> falsy
                view = (this.view = this.elseView = this.cache && this.elseView != null
                    ? this.elseView
                    : (_a = this.elseFactory) === null || _a === void 0 ? void 0 : _a.create(f));
            }
            if (view == null) {
                return;
            }
            // todo: else view should set else location
            view.setLocation(this.location);
            // Promise return values from user VM hooks are awaited by the initiator
            this.pending = onResolve(view.activate(initiator, ctrl, f, ctrl.scope), () => {
                if (isCurrent()) {
                    this.pending = void 0;
                }
            });
            // old
            // void (this.view = this.updateView(this.value, f))?.activate(initiator, this.ctrl, f, this.ctrl.scope);
        });
    }
    detaching(initiator, parent, flags) {
        this._wantsDeactivate = true;
        return onResolve(this.pending, () => {
            var _a;
            this._wantsDeactivate = false;
            this.pending = void 0;
            // Promise return values from user VM hooks are awaited by the initiator
            void ((_a = this.view) === null || _a === void 0 ? void 0 : _a.deactivate(initiator, this.$controller, flags));
        });
    }
    valueChanged(newValue, oldValue, f) {
        if (!this.$controller.isActive) {
            return;
        }
        // change scenarios:
        // truthy -> truthy (do nothing)
        // falsy -> falsy (do nothing)
        // truthy -> falsy (no cache = destroy)
        // falsy -> truthy (no view = create)
        newValue = !!newValue;
        oldValue = !!oldValue;
        if (newValue === oldValue) {
            return;
        }
        this.work.start();
        const currView = this.view;
        const ctrl = this.$controller;
        const swapId = this._swapId++;
        /**
         * returns true when
         * 1. entering deactivation of the [if] itself
         * 2. new swap has started since this change
         */
        const isCurrent = () => !this._wantsDeactivate && this._swapId === swapId + 1;
        let view;
        return onResolve(onResolve(this.pending, () => this.pending = onResolve(currView === null || currView === void 0 ? void 0 : currView.deactivate(currView, ctrl, f), () => {
            var _a;
            if (!isCurrent()) {
                return;
            }
            // falsy -> truthy
            if (newValue) {
                view = (this.view = this.ifView = this.cache && this.ifView != null
                    ? this.ifView
                    : this.ifFactory.create(f));
            }
            else {
                // truthy -> falsy
                view = (this.view = this.elseView = this.cache && this.elseView != null
                    ? this.elseView
                    : (_a = this.elseFactory) === null || _a === void 0 ? void 0 : _a.create(f));
            }
            if (view == null) {
                return;
            }
            // todo: location should be based on either the [if]/[else] attribute
            //       instead of always the if
            view.setLocation(this.location);
            return onResolve(view.activate(view, ctrl, f, ctrl.scope), () => {
                if (isCurrent()) {
                    this.pending = void 0;
                }
            });
        })), () => this.work.finish());
    }
    dispose() {
        var _a, _b;
        (_a = this.ifView) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this.elseView) === null || _b === void 0 ? void 0 : _b.dispose();
        this.ifView
            = this.elseView
                = this.view
                    = void 0;
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
}
If.inject = [IViewFactory, IRenderLocation, IWorkTracker];
__decorate([
    bindable
], If.prototype, "value", void 0);
__decorate([
    bindable({
        set: v => v === '' || !!v && v !== 'false'
    })
], If.prototype, "cache", void 0);
templateController('if')(If);
class Else {
    constructor(factory) {
        this.factory = factory;
        this.id = nextId('au$component');
    }
    link(flags, controller, _childController, _target, _instruction) {
        const children = controller.children;
        const ifBehavior = children[children.length - 1];
        if (ifBehavior instanceof If) {
            ifBehavior.elseFactory = this.factory;
        }
        else if (ifBehavior.viewModel instanceof If) {
            ifBehavior.viewModel.elseFactory = this.factory;
        }
        else {
            throw new Error('AUR0810');
        }
    }
}
Else.inject = [IViewFactory];
templateController({ name: 'else' })(Else);

function dispose(disposable) {
    disposable.dispose();
}
class Repeat {
    constructor(location, parent, factory) {
        this.location = location;
        this.parent = parent;
        this.factory = factory;
        this.id = nextId('au$component');
        this._observer = void 0;
        this.views = [];
        this.key = void 0;
        this._normalizedItems = void 0;
    }
    binding(initiator, parent, flags) {
        this._checkCollectionObserver(flags);
        const bindings = this.parent.bindings;
        const ii = bindings.length;
        let binding = (void 0);
        let i = 0;
        for (; ii > i; ++i) {
            binding = bindings[i];
            if (binding.target === this && binding.targetProperty === 'items') {
                this.forOf = binding.sourceExpression;
                break;
            }
        }
        this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope, binding.locator, null);
    }
    attaching(initiator, parent, flags) {
        this._normalizeToArray(flags);
        return this._activateAllViews(initiator, flags);
    }
    detaching(initiator, parent, flags) {
        this._checkCollectionObserver(flags);
        return this._deactivateAllViews(initiator, flags);
    }
    // called by SetterObserver
    itemsChanged(flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        flags |= $controller.flags;
        this._checkCollectionObserver(flags);
        this._normalizeToArray(flags);
        const ret = onResolve(this._deactivateAllViews(null, flags), () => {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
            return this._activateAllViews(null, flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    // called by a CollectionObserver
    handleCollectionChange(indexMap, flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        flags |= $controller.flags;
        this._normalizeToArray(flags);
        if (indexMap === void 0) {
            const ret = onResolve(this._deactivateAllViews(null, flags), () => {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
                return this._activateAllViews(null, flags);
            });
            if (ret instanceof Promise) {
                ret.catch(err => { throw err; });
            }
        }
        else {
            const oldLength = this.views.length;
            applyMutationsToIndices(indexMap);
            // first detach+unbind+(remove from array) the deleted view indices
            if (indexMap.deletedItems.length > 0) {
                indexMap.deletedItems.sort(compareNumber);
                const ret = onResolve(this._deactivateAndRemoveViewsByKey(indexMap, flags), () => {
                    // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
                    return this._createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
                });
                if (ret instanceof Promise) {
                    ret.catch(err => { throw err; });
                }
            }
            else {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this._createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
            }
        }
    }
    // todo: subscribe to collection from inner expression
    _checkCollectionObserver(flags) {
        const oldObserver = this._observer;
        if ((flags & 4 /* fromUnbind */)) {
            if (oldObserver !== void 0) {
                oldObserver.unsubscribe(this);
            }
        }
        else if (this.$controller.isActive) {
            const newObserver = this._observer = getCollectionObserver$1(this.items);
            if (oldObserver !== newObserver && oldObserver) {
                oldObserver.unsubscribe(this);
            }
            if (newObserver) {
                newObserver.subscribe(this);
            }
        }
    }
    _normalizeToArray(flags) {
        const items = this.items;
        if (items instanceof Array) {
            this._normalizedItems = items;
            return;
        }
        const forOf = this.forOf;
        if (forOf === void 0) {
            return;
        }
        const normalizedItems = [];
        this.forOf.iterate(flags, items, (arr, index, item) => {
            normalizedItems[index] = item;
        });
        this._normalizedItems = normalizedItems;
    }
    _activateAllViews(initiator, flags) {
        let promises = void 0;
        let ret;
        let view;
        let viewScope;
        const { $controller, factory, local, location, items } = this;
        const parentScope = $controller.scope;
        const newLen = this.forOf.count(flags, items);
        const views = this.views = Array(newLen);
        this.forOf.iterate(flags, items, (arr, i, item) => {
            view = views[i] = factory.create(flags).setLocation(location);
            view.nodes.unlink();
            viewScope = Scope.fromParent(parentScope, BindingContext.create(local, item));
            setContextualProperties(viewScope.overrideContext, i, newLen);
            ret = view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, viewScope);
            if (ret instanceof Promise) {
                (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
            }
        });
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    _deactivateAllViews(initiator, flags) {
        let promises = void 0;
        let ret;
        let view;
        let i = 0;
        const { views, $controller } = this;
        const ii = views.length;
        for (; ii > i; ++i) {
            view = views[i];
            view.release();
            ret = view.deactivate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags);
            if (ret instanceof Promise) {
                (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
            }
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    _deactivateAndRemoveViewsByKey(indexMap, flags) {
        let promises = void 0;
        let ret;
        let view;
        const { $controller, views } = this;
        const deleted = indexMap.deletedItems;
        const deletedLen = deleted.length;
        let i = 0;
        for (; deletedLen > i; ++i) {
            view = views[deleted[i]];
            view.release();
            ret = view.deactivate(view, $controller, flags);
            if (ret instanceof Promise) {
                (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
            }
        }
        i = 0;
        let j = 0;
        for (; deletedLen > i; ++i) {
            j = deleted[i] - i;
            views.splice(j, 1);
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    _createAndActivateAndSortViewsByKey(oldLength, indexMap, flags) {
        var _a;
        let promises = void 0;
        let ret;
        let view;
        let viewScope;
        let i = 0;
        const { $controller, factory, local, _normalizedItems: normalizedItems, location, views } = this;
        const mapLen = indexMap.length;
        for (; mapLen > i; ++i) {
            if (indexMap[i] === -2) {
                view = factory.create(flags);
                views.splice(i, 0, view);
            }
        }
        if (views.length !== mapLen) {
            throw new Error(`AUR0814:${views.length}!=${mapLen}`);
        }
        const parentScope = $controller.scope;
        const newLen = indexMap.length;
        synchronizeIndices(views, indexMap);
        // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
        // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
        const seq = longestIncreasingSubsequence(indexMap);
        const seqLen = seq.length;
        let next;
        let j = seqLen - 1;
        i = newLen - 1;
        for (; i >= 0; --i) {
            view = views[i];
            next = views[i + 1];
            view.nodes.link((_a = next === null || next === void 0 ? void 0 : next.nodes) !== null && _a !== void 0 ? _a : location);
            if (indexMap[i] === -2) {
                viewScope = Scope.fromParent(parentScope, BindingContext.create(local, normalizedItems[i]));
                setContextualProperties(viewScope.overrideContext, i, newLen);
                view.setLocation(location);
                ret = view.activate(view, $controller, flags, viewScope);
                if (ret instanceof Promise) {
                    (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
                }
            }
            else if (j < 0 || seqLen === 1 || i !== seq[j]) {
                setContextualProperties(view.scope.overrideContext, i, newLen);
                view.nodes.insertBefore(view.location);
            }
            else {
                if (oldLength !== newLen) {
                    setContextualProperties(view.scope.overrideContext, i, newLen);
                }
                --j;
            }
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    dispose() {
        this.views.forEach(dispose);
        this.views = (void 0);
    }
    accept(visitor) {
        const { views } = this;
        if (views !== void 0) {
            for (let i = 0, ii = views.length; i < ii; ++i) {
                if (views[i].accept(visitor) === true) {
                    return true;
                }
            }
        }
    }
}
Repeat.inject = [IRenderLocation, IController, IViewFactory];
__decorate([
    bindable
], Repeat.prototype, "items", void 0);
templateController('repeat')(Repeat);
let maxLen = 16;
let prevIndices = new Int32Array(maxLen);
let tailIndices = new Int32Array(maxLen);
// Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
// with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
/** @internal */
function longestIncreasingSubsequence(indexMap) {
    const len = indexMap.length;
    if (len > maxLen) {
        maxLen = len;
        prevIndices = new Int32Array(len);
        tailIndices = new Int32Array(len);
    }
    let cursor = 0;
    let cur = 0;
    let prev = 0;
    let i = 0;
    let j = 0;
    let low = 0;
    let high = 0;
    let mid = 0;
    for (; i < len; i++) {
        cur = indexMap[i];
        if (cur !== -2) {
            j = prevIndices[cursor];
            prev = indexMap[j];
            if (prev !== -2 && prev < cur) {
                tailIndices[i] = j;
                prevIndices[++cursor] = i;
                continue;
            }
            low = 0;
            high = cursor;
            while (low < high) {
                mid = (low + high) >> 1;
                prev = indexMap[prevIndices[mid]];
                if (prev !== -2 && prev < cur) {
                    low = mid + 1;
                }
                else {
                    high = mid;
                }
            }
            prev = indexMap[prevIndices[low]];
            if (cur < prev || prev === -2) {
                if (low > 0) {
                    tailIndices[i] = prevIndices[low - 1];
                }
                prevIndices[low] = i;
            }
        }
    }
    i = ++cursor;
    const result = new Int32Array(i);
    cur = prevIndices[cursor - 1];
    while (cursor-- > 0) {
        result[cursor] = cur;
        cur = tailIndices[cur];
    }
    while (i-- > 0)
        prevIndices[i] = 0;
    return result;
}
function setContextualProperties(oc, index, length) {
    const isFirst = index === 0;
    const isLast = index === length - 1;
    const isEven = index % 2 === 0;
    oc.$index = index;
    oc.$first = isFirst;
    oc.$last = isLast;
    oc.$middle = !isFirst && !isLast;
    oc.$even = isEven;
    oc.$odd = !isEven;
    oc.$length = length;
}

class With {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = nextId('au$component');
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    valueChanged(newValue, oldValue, flags) {
        const $controller = this.$controller;
        const bindings = this.view.bindings;
        let scope;
        let i = 0, ii = 0;
        if ($controller.isActive && bindings != null) {
            scope = Scope.fromParent($controller.scope, newValue === void 0 ? {} : newValue);
            for (ii = bindings.length; ii > i; ++i) {
                bindings[i].$bind(2 /* fromBind */, scope);
            }
        }
    }
    attaching(initiator, parent, flags) {
        const { $controller, value } = this;
        const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
        return this.view.activate(initiator, $controller, flags, scope);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
}
With.inject = [IViewFactory, IRenderLocation];
__decorate([
    bindable
], With.prototype, "value", void 0);
templateController('with')(With);

let Switch = class Switch {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = nextId('au$component');
        /** @internal */
        this.cases = [];
        this.activeCases = [];
        /**
         * This is kept around here so that changes can be awaited from the tests.
         * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
         */
        this.promise = void 0;
    }
    link(flags, _controller, _childController, _target, _instruction) {
        this.view = this.factory.create(flags, this.$controller).setLocation(this.location);
    }
    attaching(initiator, parent, flags) {
        const view = this.view;
        const $controller = this.$controller;
        this.queue(() => view.activate(initiator, $controller, flags, $controller.scope));
        this.queue(() => this.swap(initiator, flags, this.value));
        return this.promise;
    }
    detaching(initiator, parent, flags) {
        this.queue(() => {
            const view = this.view;
            return view.deactivate(initiator, this.$controller, flags);
        });
        return this.promise;
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
    valueChanged(_newValue, _oldValue, flags) {
        if (!this.$controller.isActive) {
            return;
        }
        this.queue(() => this.swap(null, flags, this.value));
    }
    caseChanged($case, flags) {
        this.queue(() => this.handleCaseChange($case, flags));
    }
    handleCaseChange($case, flags) {
        const isMatch = $case.isMatch(this.value, flags);
        const activeCases = this.activeCases;
        const numActiveCases = activeCases.length;
        // Early termination #1
        if (!isMatch) {
            /** The previous match started with this; thus clear. */
            if (numActiveCases > 0 && activeCases[0].id === $case.id) {
                return this.clearActiveCases(null, flags);
            }
            /**
             * There are 2 different scenarios here:
             * 1. $case in activeCases: Indicates by-product of fallthrough. The starting case still satisfies. Return.
             * 2. $case not in activeCases: It was previously not active, and currently also not a match. Return.
             */
            return;
        }
        // Early termination #2
        if (numActiveCases > 0 && activeCases[0].id < $case.id) {
            // Even if this case now a match, the previous case still wins by as that has lower ordinal.
            return;
        }
        // compute the new active cases
        const newActiveCases = [];
        let fallThrough = $case.fallThrough;
        if (!fallThrough) {
            newActiveCases.push($case);
        }
        else {
            const cases = this.cases;
            const idx = cases.indexOf($case);
            for (let i = idx, ii = cases.length; i < ii && fallThrough; i++) {
                const c = cases[i];
                newActiveCases.push(c);
                fallThrough = c.fallThrough;
            }
        }
        return onResolve(this.clearActiveCases(null, flags, newActiveCases), () => {
            this.activeCases = newActiveCases;
            return this.activateCases(null, flags);
        });
    }
    swap(initiator, flags, value) {
        const newActiveCases = [];
        let fallThrough = false;
        for (const $case of this.cases) {
            if (fallThrough || $case.isMatch(value, flags)) {
                newActiveCases.push($case);
                fallThrough = $case.fallThrough;
            }
            if (newActiveCases.length > 0 && !fallThrough) {
                break;
            }
        }
        const defaultCase = this.defaultCase;
        if (newActiveCases.length === 0 && defaultCase !== void 0) {
            newActiveCases.push(defaultCase);
        }
        return onResolve(this.activeCases.length > 0
            ? this.clearActiveCases(initiator, flags, newActiveCases)
            : void 0, () => {
            this.activeCases = newActiveCases;
            if (newActiveCases.length === 0) {
                return;
            }
            return this.activateCases(initiator, flags);
        });
    }
    activateCases(initiator, flags) {
        const controller = this.$controller;
        if (!controller.isActive) {
            return;
        }
        const cases = this.activeCases;
        const length = cases.length;
        if (length === 0) {
            return;
        }
        const scope = controller.scope;
        // most common case
        if (length === 1) {
            return cases[0].activate(initiator, flags, scope);
        }
        return resolveAll(...cases.map(($case) => $case.activate(initiator, flags, scope)));
    }
    clearActiveCases(initiator, flags, newActiveCases = []) {
        const cases = this.activeCases;
        const numCases = cases.length;
        if (numCases === 0) {
            return;
        }
        if (numCases === 1) {
            const firstCase = cases[0];
            if (!newActiveCases.includes(firstCase)) {
                cases.length = 0;
                return firstCase.deactivate(initiator, flags);
            }
            return;
        }
        return onResolve(resolveAll(...cases.reduce((acc, $case) => {
            if (!newActiveCases.includes($case)) {
                acc.push($case.deactivate(initiator, flags));
            }
            return acc;
        }, [])), () => {
            cases.length = 0;
        });
    }
    queue(action) {
        const previousPromise = this.promise;
        let promise = void 0;
        promise = this.promise = onResolve(onResolve(previousPromise, action), () => {
            if (this.promise === promise) {
                this.promise = void 0;
            }
        });
    }
    accept(visitor) {
        if (this.$controller.accept(visitor) === true) {
            return true;
        }
        if (this.activeCases.some(x => x.accept(visitor))) {
            return true;
        }
    }
};
__decorate([
    bindable
], Switch.prototype, "value", void 0);
Switch = __decorate([
    templateController('switch'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation)
], Switch);
let Case = class Case {
    constructor(factory, locator, location, logger) {
        this.factory = factory;
        this.locator = locator;
        this.id = nextId('au$component');
        this.fallThrough = false;
        this.debug = logger.config.level <= 1 /* debug */;
        this.logger = logger.scopeTo(`${this.constructor.name}-#${this.id}`);
        this.view = this.factory.create().setLocation(location);
    }
    link(flags, controller, _childController, _target, _instruction) {
        const switchController = controller.parent;
        const $switch = switchController === null || switchController === void 0 ? void 0 : switchController.viewModel;
        if ($switch instanceof Switch) {
            this.$switch = $switch;
            this.linkToSwitch($switch);
        }
        else {
            throw new Error('AUR0815');
        }
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(initiator, flags);
    }
    isMatch(value, flags) {
        if (this.debug) {
            this.logger.debug('isMatch()');
        }
        const $value = this.value;
        if (Array.isArray($value)) {
            if (this.observer === void 0) {
                this.observer = this.observeCollection(flags, $value);
            }
            return $value.includes(value);
        }
        return $value === value;
    }
    valueChanged(newValue, _oldValue, flags) {
        var _a;
        if (Array.isArray(newValue)) {
            (_a = this.observer) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
            this.observer = this.observeCollection(flags, newValue);
        }
        else if (this.observer !== void 0) {
            this.observer.unsubscribe(this);
        }
        this.$switch.caseChanged(this, flags);
    }
    handleCollectionChange(_indexMap, flags) {
        this.$switch.caseChanged(this, flags);
    }
    activate(initiator, flags, scope) {
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags, scope);
    }
    deactivate(initiator, flags) {
        const view = this.view;
        if (!view.isActive) {
            return;
        }
        return view.deactivate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags);
    }
    dispose() {
        var _a, _b;
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        (_b = this.view) === null || _b === void 0 ? void 0 : _b.dispose();
        this.view = (void 0);
    }
    linkToSwitch(auSwitch) {
        auSwitch.cases.push(this);
    }
    observeCollection(flags, $value) {
        const observer = this.locator.getArrayObserver($value);
        observer.subscribe(this);
        return observer;
    }
    accept(visitor) {
        var _a;
        if (this.$controller.accept(visitor) === true) {
            return true;
        }
        return (_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor);
    }
};
__decorate([
    bindable
], Case.prototype, "value", void 0);
__decorate([
    bindable({
        set: v => {
            switch (v) {
                case 'true': return true;
                case 'false': return false;
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                default: return !!v;
            }
        },
        mode: BindingMode.oneTime
    })
], Case.prototype, "fallThrough", void 0);
Case = __decorate([
    templateController('case'),
    __param(0, IViewFactory),
    __param(1, IObserverLocator),
    __param(2, IRenderLocation),
    __param(3, ILogger)
], Case);
let DefaultCase = class DefaultCase extends Case {
    linkToSwitch($switch) {
        if ($switch.defaultCase !== void 0) {
            throw new Error('AUR0816');
        }
        $switch.defaultCase = this;
    }
};
DefaultCase = __decorate([
    templateController('default-case')
], DefaultCase);

let PromiseTemplateController = class PromiseTemplateController {
    constructor(factory, location, platform, logger) {
        this.factory = factory;
        this.location = location;
        this.platform = platform;
        this.id = nextId('au$component');
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.logger = logger.scopeTo('promise.resolve');
    }
    link(flags, _controller, _childController, _target, _instruction) {
        this.view = this.factory.create(flags, this.$controller).setLocation(this.location);
    }
    attaching(initiator, parent, flags) {
        const view = this.view;
        const $controller = this.$controller;
        return onResolve(view.activate(initiator, $controller, flags, this.viewScope = Scope.fromParent($controller.scope, {})), () => this.swap(initiator, flags));
    }
    valueChanged(_newValue, _oldValue, flags) {
        if (!this.$controller.isActive) {
            return;
        }
        this.swap(null, flags);
    }
    swap(initiator, flags) {
        var _a, _b;
        const value = this.value;
        if (!(value instanceof Promise)) {
            this.logger.warn(`The value '${String(value)}' is not a promise. No change will be done.`);
            return;
        }
        const q = this.platform.domWriteQueue;
        const fulfilled = this.fulfilled;
        const rejected = this.rejected;
        const pending = this.pending;
        const s = this.viewScope;
        let preSettlePromise;
        const defaultQueuingOptions = { reusable: false };
        const $swap = () => {
            // Note that the whole thing is not wrapped in a q.queueTask intentionally.
            // Because that would block the app till the actual promise is resolved, which is not the goal anyway.
            void resolveAll(
            // At first deactivate the fulfilled and rejected views, as well as activate the pending view.
            // The order of these 3 should not necessarily be sequential (i.e. order-irrelevant).
            preSettlePromise = (this.preSettledTask = q.queueTask(() => {
                return resolveAll(fulfilled === null || fulfilled === void 0 ? void 0 : fulfilled.deactivate(initiator, flags), rejected === null || rejected === void 0 ? void 0 : rejected.deactivate(initiator, flags), pending === null || pending === void 0 ? void 0 : pending.activate(initiator, flags, s));
            }, defaultQueuingOptions)).result, value
                .then((data) => {
                if (this.value !== value) {
                    return;
                }
                const fulfill = () => {
                    // Deactivation of pending view and the activation of the fulfilled view should not necessarily be sequential.
                    this.postSettlePromise = (this.postSettledTask = q.queueTask(() => resolveAll(pending === null || pending === void 0 ? void 0 : pending.deactivate(initiator, flags), rejected === null || rejected === void 0 ? void 0 : rejected.deactivate(initiator, flags), fulfilled === null || fulfilled === void 0 ? void 0 : fulfilled.activate(initiator, flags, s, data)), defaultQueuingOptions)).result;
                };
                if (this.preSettledTask.status === 1 /* running */) {
                    void preSettlePromise.then(fulfill);
                }
                else {
                    this.preSettledTask.cancel();
                    fulfill();
                }
            }, (err) => {
                if (this.value !== value) {
                    return;
                }
                const reject = () => {
                    // Deactivation of pending view and the activation of the rejected view should also not necessarily be sequential.
                    this.postSettlePromise = (this.postSettledTask = q.queueTask(() => resolveAll(pending === null || pending === void 0 ? void 0 : pending.deactivate(initiator, flags), fulfilled === null || fulfilled === void 0 ? void 0 : fulfilled.deactivate(initiator, flags), rejected === null || rejected === void 0 ? void 0 : rejected.activate(initiator, flags, s, err)), defaultQueuingOptions)).result;
                };
                if (this.preSettledTask.status === 1 /* running */) {
                    void preSettlePromise.then(reject);
                }
                else {
                    this.preSettledTask.cancel();
                    reject();
                }
            }));
        };
        if (((_a = this.postSettledTask) === null || _a === void 0 ? void 0 : _a.status) === 1 /* running */) {
            void this.postSettlePromise.then($swap);
        }
        else {
            (_b = this.postSettledTask) === null || _b === void 0 ? void 0 : _b.cancel();
            $swap();
        }
    }
    detaching(initiator, parent, flags) {
        var _a, _b;
        (_a = this.preSettledTask) === null || _a === void 0 ? void 0 : _a.cancel();
        (_b = this.postSettledTask) === null || _b === void 0 ? void 0 : _b.cancel();
        this.preSettledTask = this.postSettledTask = null;
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
};
__decorate([
    bindable
], PromiseTemplateController.prototype, "value", void 0);
PromiseTemplateController = __decorate([
    templateController('promise'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation),
    __param(2, IPlatform),
    __param(3, ILogger)
], PromiseTemplateController);
let PendingTemplateController = class PendingTemplateController {
    constructor(factory, location) {
        this.factory = factory;
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    link(flags, controller, _childController, _target, _instruction) {
        getPromiseController(controller).pending = this;
    }
    activate(initiator, flags, scope) {
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(view, this.$controller, flags, scope);
    }
    deactivate(initiator, flags) {
        const view = this.view;
        if (!view.isActive) {
            return;
        }
        return view.deactivate(view, this.$controller, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(initiator, flags);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
};
__decorate([
    bindable({ mode: BindingMode.toView })
], PendingTemplateController.prototype, "value", void 0);
PendingTemplateController = __decorate([
    templateController('pending'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation)
], PendingTemplateController);
let FulfilledTemplateController = class FulfilledTemplateController {
    constructor(factory, location) {
        this.factory = factory;
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    link(flags, controller, _childController, _target, _instruction) {
        getPromiseController(controller).fulfilled = this;
    }
    activate(initiator, flags, scope, resolvedValue) {
        this.value = resolvedValue;
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(view, this.$controller, flags, scope);
    }
    deactivate(initiator, flags) {
        const view = this.view;
        if (!view.isActive) {
            return;
        }
        return view.deactivate(view, this.$controller, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(initiator, flags);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
};
__decorate([
    bindable({ mode: BindingMode.toView })
], FulfilledTemplateController.prototype, "value", void 0);
FulfilledTemplateController = __decorate([
    templateController('then'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation)
], FulfilledTemplateController);
let RejectedTemplateController = class RejectedTemplateController {
    constructor(factory, location) {
        this.factory = factory;
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    link(flags, controller, _childController, _target, _instruction) {
        getPromiseController(controller).rejected = this;
    }
    activate(initiator, flags, scope, error) {
        this.value = error;
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(view, this.$controller, flags, scope);
    }
    deactivate(initiator, flags) {
        const view = this.view;
        if (!view.isActive) {
            return;
        }
        return view.deactivate(view, this.$controller, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(initiator, flags);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
};
__decorate([
    bindable({ mode: BindingMode.toView })
], RejectedTemplateController.prototype, "value", void 0);
RejectedTemplateController = __decorate([
    templateController('catch'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation)
], RejectedTemplateController);
function getPromiseController(controller) {
    const promiseController = controller.parent;
    const $promise = promiseController === null || promiseController === void 0 ? void 0 : promiseController.viewModel;
    if ($promise instanceof PromiseTemplateController) {
        return $promise;
    }
    throw new Error('AUR0813');
}
let PromiseAttributePattern = class PromiseAttributePattern {
    'promise.resolve'(name, value, _parts) {
        return new AttrSyntax(name, value, 'promise', 'bind');
    }
};
PromiseAttributePattern = __decorate([
    attributePattern({ pattern: 'promise.resolve', symbols: '' })
], PromiseAttributePattern);
let FulfilledAttributePattern = class FulfilledAttributePattern {
    'then'(name, value, _parts) {
        return new AttrSyntax(name, value, 'then', 'from-view');
    }
};
FulfilledAttributePattern = __decorate([
    attributePattern({ pattern: 'then', symbols: '' })
], FulfilledAttributePattern);
let RejectedAttributePattern = class RejectedAttributePattern {
    'catch'(name, value, _parts) {
        return new AttrSyntax(name, value, 'catch', 'from-view');
    }
};
RejectedAttributePattern = __decorate([
    attributePattern({ pattern: 'catch', symbols: '' })
], RejectedAttributePattern);

function createElement(p, tagOrType, props, children) {
    if (typeof tagOrType === 'string') {
        return createElementForTag(p, tagOrType, props, children);
    }
    if (CustomElement.isType(tagOrType)) {
        return createElementForType(p, tagOrType, props, children);
    }
    throw new Error(`Invalid Tag or Type.`);
}
/**
 * RenderPlan. Todo: describe goal of this class
 */
class RenderPlan {
    constructor(node, instructions, dependencies) {
        this.node = node;
        this.instructions = instructions;
        this.dependencies = dependencies;
        this._lazyDef = void 0;
    }
    get definition() {
        if (this._lazyDef === void 0) {
            this._lazyDef = CustomElementDefinition.create({
                name: CustomElement.generateName(),
                template: this.node,
                needsCompile: typeof this.node === 'string',
                instructions: this.instructions,
                dependencies: this.dependencies,
            });
        }
        return this._lazyDef;
    }
    createView(parentContainer) {
        return this.getViewFactory(parentContainer).create();
    }
    getViewFactory(parentContainer) {
        return parentContainer.root.get(IRendering).getViewFactory(this.definition, parentContainer.createChild().register(...this.dependencies));
    }
    /** @internal */
    mergeInto(parent, instructions, dependencies) {
        parent.appendChild(this.node);
        instructions.push(...this.instructions);
        dependencies.push(...this.dependencies);
    }
}
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
            if (isInstruction(value)) {
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
    const definition = CustomElement.getDefinition(Type);
    const instructions = [];
    const allInstructions = [instructions];
    const dependencies = [];
    const childInstructions = [];
    const bindables = definition.bindables;
    const element = p.document.createElement(definition.name);
    element.className = 'au';
    if (!dependencies.includes(Type)) {
        dependencies.push(Type);
    }
    instructions.push(new HydrateElementInstruction(definition, void 0, childInstructions, null, false));
    if (props) {
        Object.keys(props)
            .forEach(to => {
            const value = props[to];
            if (isInstruction(value)) {
                childInstructions.push(value);
            }
            else {
                if (bindables[to] === void 0) {
                    childInstructions.push(new SetAttributeInstruction(value, to));
                }
                else {
                    childInstructions.push(new SetPropertyInstruction(value, to));
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

function toLookup(acc, item) {
    const to = item.to;
    if (to !== void 0 && to !== 'subject' && to !== 'composing') {
        acc[to] = item;
    }
    return acc;
}
let AuRender = class AuRender {
    constructor(p, instruction, hdrContext, r) {
        this.p = p;
        this.r = r;
        this.id = nextId('au$component');
        this.component = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this._properties = instruction.props.reduce(toLookup, {});
        this._hdrContext = hdrContext;
    }
    attaching(initiator, parent, flags) {
        const { component, view } = this;
        if (view === void 0 || this.lastSubject !== component) {
            this.lastSubject = component;
            this.composing = true;
            return this.compose(void 0, component, initiator, flags);
        }
        return this.compose(view, component, initiator, flags);
    }
    detaching(initiator, parent, flags) {
        return this._deactivate(this.view, initiator, flags);
    }
    componentChanged(newValue, previousValue, flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        if (this.lastSubject === newValue) {
            return;
        }
        this.lastSubject = newValue;
        this.composing = true;
        flags |= $controller.flags;
        const ret = onResolve(this._deactivate(this.view, null, flags), () => {
            // TODO(fkleuver): handle & test race condition
            return this.compose(void 0, newValue, null, flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    compose(view, subject, initiator, flags) {
        return onResolve(view === void 0
            ? onResolve(subject, resolvedSubject => this._resolveView(resolvedSubject, flags))
            : view, resolvedView => this._activate(this.view = resolvedView, initiator, flags));
    }
    _deactivate(view, initiator, flags) {
        return view === null || view === void 0 ? void 0 : view.deactivate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags);
    }
    _activate(view, initiator, flags) {
        const { $controller } = this;
        return onResolve(view === null || view === void 0 ? void 0 : view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, $controller.scope), () => {
            this.composing = false;
        });
    }
    _resolveView(subject, flags) {
        const view = this._provideViewFor(subject, flags);
        if (view) {
            view.setLocation(this.$controller.location);
            view.lockScope(this.$controller.scope);
            return view;
        }
        return void 0;
    }
    _provideViewFor(comp, flags) {
        if (!comp) {
            return void 0;
        }
        const ctxContainer = this._hdrContext.controller.container;
        if (typeof comp === 'object') {
            if (isController(comp)) { // IController
                return comp;
            }
            if ('createView' in comp) { // RenderPlan
                return comp.createView(ctxContainer);
            }
            if ('create' in comp) { // IViewFactory
                return comp.create(flags);
            }
            if ('template' in comp) { // Raw Template Definition
                return this.r.getViewFactory(CustomElementDefinition.getOrCreate(comp), ctxContainer).create(flags);
            }
        }
        if (typeof comp === 'string') {
            const def = ctxContainer.find(CustomElement, comp);
            if (def == null) {
                throw new Error(`AUR0809:${comp}`);
            }
            comp = def.Type;
        }
        // Constructable (Custom Element Constructor)
        return createElement(this.p, comp, this._properties, this.$controller.host.childNodes).createView(ctxContainer);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
};
__decorate([
    bindable
], AuRender.prototype, "component", void 0);
__decorate([
    bindable({ mode: BindingMode.fromView })
], AuRender.prototype, "composing", void 0);
AuRender = __decorate([
    customElement({ name: 'au-render', template: null, containerless: true }),
    __param(0, IPlatform),
    __param(1, IInstruction),
    __param(2, IHydrationContext),
    __param(3, IRendering)
], AuRender);
function isController(subject) {
    return 'lockScope' in subject;
}

// Desired usage:
// <au-component view.bind="Promise<string>" view-model.bind="" model.bind="" />
// <au-component view.bind="<string>" model.bind="" />
//
class AuCompose {
    constructor(ctn, parent, host, p, 
    // todo: use this to retrieve au-slot instruction
    //        for later enhancement related to <au-slot/> + compose
    instruction, contextFactory) {
        this.ctn = ctn;
        this.parent = parent;
        this.host = host;
        this.p = p;
        this.scopeBehavior = 'auto';
        /** @internal */
        this.c = void 0;
        this.loc = instruction.containerless ? convertToRenderLocation(this.host) : void 0;
        this.r = ctn.get(IRendering);
        this._instruction = instruction;
        this._contextFactory = contextFactory;
    }
    /** @internal */
    static get inject() {
        return [IContainer, IController, INode, IPlatform, IInstruction, transient(CompositionContextFactory)];
    }
    get pending() {
        return this.pd;
    }
    get composition() {
        return this.c;
    }
    attaching(initiator, parent, flags) {
        return this.pd = onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, initiator, void 0)), (context) => {
            if (this._contextFactory.isCurrent(context)) {
                this.pd = void 0;
            }
        });
    }
    detaching(initiator) {
        const cmpstn = this.c;
        const pending = this.pd;
        this._contextFactory.invalidate();
        this.c = this.pd = void 0;
        return onResolve(pending, () => cmpstn === null || cmpstn === void 0 ? void 0 : cmpstn.deactivate(initiator));
    }
    /** @internal */
    propertyChanged(name) {
        if (name === 'model' && this.c != null) {
            // eslint-disable-next-line
            this.c.update(this.model);
            return;
        }
        this.pd = onResolve(this.pd, () => onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, name)), (context) => {
            if (this._contextFactory.isCurrent(context)) {
                this.pd = void 0;
            }
        }));
    }
    /** @internal */
    queue(change) {
        const factory = this._contextFactory;
        const compositionCtrl = this.c;
        // todo: handle consequitive changes that create multiple queues
        return onResolve(factory.create(change), context => {
            // Don't compose [stale] view/view model
            // by always ensuring that the composition context is the latest one
            if (factory.isCurrent(context)) {
                return onResolve(this.compose(context), (result) => {
                    // Don't activate [stale] controller
                    // by always ensuring that the composition context is the latest one
                    if (factory.isCurrent(context)) {
                        return onResolve(result.activate(), () => {
                            // Don't conclude the [stale] composition
                            // by always ensuring that the composition context is the latest one
                            if (factory.isCurrent(context)) {
                                // after activation, if the composition context is still the most recent one
                                // then the job is done
                                this.c = result;
                                return onResolve(compositionCtrl === null || compositionCtrl === void 0 ? void 0 : compositionCtrl.deactivate(change.initiator), () => context);
                            }
                            else {
                                // the stale controller should be deactivated
                                return onResolve(result.controller.deactivate(result.controller, this.$controller, 4 /* fromUnbind */), 
                                // todo: do we need to deactivate?
                                () => {
                                    result.controller.dispose();
                                    return context;
                                });
                            }
                        });
                    }
                    result.controller.dispose();
                    return context;
                });
            }
            return context;
        });
    }
    /** @internal */
    compose(context) {
        let comp;
        let compositionHost;
        let removeCompositionHost;
        // todo: when both view model and view are empty
        //       should it throw or try it best to proceed?
        //       current: proceed
        const { view, viewModel, model, initiator } = context.change;
        const { ctn: container, host, $controller, loc } = this;
        const srcDef = this.getDef(viewModel);
        const childCtn = container.createChild();
        const parentNode = loc == null ? host.parentNode : loc.parentNode;
        if (srcDef !== null) {
            if (srcDef.containerless) {
                throw new Error('AUR0806');
            }
            if (loc == null) {
                compositionHost = host;
                removeCompositionHost = () => {
                    // This is a normal composition, the content template is removed by deactivation process
                    // but the host remains
                };
            }
            else {
                // todo: should the host be appended later, during the activation phase instead?
                compositionHost = parentNode.insertBefore(this.p.document.createElement(srcDef.name), loc);
                removeCompositionHost = () => {
                    compositionHost.remove();
                };
            }
            comp = this.getVm(childCtn, viewModel, compositionHost);
        }
        else {
            compositionHost = loc == null
                ? host
                : loc;
            comp = this.getVm(childCtn, viewModel, compositionHost);
        }
        const compose = () => {
            // custom element based composition
            if (srcDef !== null) {
                const controller = Controller.$el(childCtn, comp, compositionHost, null, 0 /* none */, srcDef);
                return new CompositionController(controller, () => controller.activate(initiator !== null && initiator !== void 0 ? initiator : controller, $controller, 2 /* fromBind */), 
                // todo: call deactivate on the component view model
                (deactachInitiator) => onResolve(controller.deactivate(deactachInitiator !== null && deactachInitiator !== void 0 ? deactachInitiator : controller, $controller, 4 /* fromUnbind */), removeCompositionHost), 
                // casting is technically incorrect
                // but it's ignored in the caller anyway
                (model) => { var _a; return (_a = comp.activate) === null || _a === void 0 ? void 0 : _a.call(comp, model); }, context);
            }
            else {
                const targetDef = CustomElementDefinition.create({
                    name: CustomElement.generateName(),
                    template: view,
                });
                const viewFactory = this.r.getViewFactory(targetDef, childCtn);
                const controller = Controller.$view(viewFactory, 2 /* fromBind */, $controller);
                const scope = this.scopeBehavior === 'auto'
                    ? Scope.fromParent(this.parent.scope, comp)
                    : Scope.create(comp);
                if (isRenderLocation(compositionHost)) {
                    controller.setLocation(compositionHost);
                }
                else {
                    controller.setHost(compositionHost);
                }
                return new CompositionController(controller, () => controller.activate(initiator !== null && initiator !== void 0 ? initiator : controller, $controller, 2 /* fromBind */, scope), 
                // todo: call deactivate on the component view model
                // a difference with composing custom element is that we leave render location/host alone
                // as they all share the same host/render location
                (detachInitiator) => controller.deactivate(detachInitiator !== null && detachInitiator !== void 0 ? detachInitiator : controller, $controller, 4 /* fromUnbind */), 
                // casting is technically incorrect
                // but it's ignored in the caller anyway
                (model) => { var _a; return (_a = comp.activate) === null || _a === void 0 ? void 0 : _a.call(comp, model); }, context);
            }
        };
        if ('activate' in comp) {
            // todo: try catch
            // req:  ensure synchronosity of compositions that dont employ promise
            return onResolve(comp.activate(model), () => compose());
        }
        else {
            return compose();
        }
    }
    /** @internal */
    getVm(container, comp, host) {
        if (comp == null) {
            return new EmptyComponent$1();
        }
        if (typeof comp === 'object') {
            return comp;
        }
        const p = this.p;
        const isLocation = isRenderLocation(host);
        container.registerResolver(p.Element, container.registerResolver(INode, new InstanceProvider('ElementResolver', isLocation ? null : host)));
        container.registerResolver(IRenderLocation, new InstanceProvider('IRenderLocation', isLocation ? host : null));
        const instance = container.invoke(comp);
        container.registerResolver(comp, new InstanceProvider('au-compose.viewModel', instance));
        return instance;
    }
    /** @internal */
    getDef(component) {
        const Ctor = (typeof component === 'function'
            ? component
            : component === null || component === void 0 ? void 0 : component.constructor);
        return CustomElement.isType(Ctor)
            ? CustomElement.getDefinition(Ctor)
            : null;
    }
}
__decorate([
    bindable
], AuCompose.prototype, "view", void 0);
__decorate([
    bindable
], AuCompose.prototype, "viewModel", void 0);
__decorate([
    bindable
], AuCompose.prototype, "model", void 0);
__decorate([
    bindable({
        set: v => {
            if (v === 'scoped' || v === 'auto') {
                return v;
            }
            throw new Error('AUR0805');
        }
    })
], AuCompose.prototype, "scopeBehavior", void 0);
customElement('au-compose')(AuCompose);
class EmptyComponent$1 {
}
class CompositionContextFactory {
    constructor() {
        this.id = 0;
    }
    isFirst(context) {
        return context.id === 0;
    }
    isCurrent(context) {
        return context.id === this.id - 1;
    }
    create(changes) {
        return onResolve(changes.load(), (loaded) => new CompositionContext(this.id++, loaded));
    }
    // simplify increasing the id will invalidate all previously created context
    invalidate() {
        this.id++;
    }
}
class ChangeInfo {
    constructor(view, viewModel, model, initiator, src) {
        this.view = view;
        this.viewModel = viewModel;
        this.model = model;
        this.initiator = initiator;
        this.src = src;
    }
    load() {
        if (this.view instanceof Promise || this.viewModel instanceof Promise) {
            return Promise
                .all([this.view, this.viewModel])
                .then(([view, viewModel]) => {
                return new LoadedChangeInfo(view, viewModel, this.model, this.initiator, this.src);
            });
        }
        else {
            return new LoadedChangeInfo(this.view, this.viewModel, this.model, this.initiator, this.src);
        }
    }
}
class LoadedChangeInfo {
    constructor(view, viewModel, model, initiator, src) {
        this.view = view;
        this.viewModel = viewModel;
        this.model = model;
        this.initiator = initiator;
        this.src = src;
    }
}
class CompositionContext {
    constructor(id, change) {
        this.id = id;
        this.change = change;
    }
}
class CompositionController {
    constructor(controller, start, stop, update, context) {
        this.controller = controller;
        this.start = start;
        this.stop = stop;
        this.update = update;
        this.context = context;
        this.state = 0;
    }
    activate() {
        if (this.state !== 0) {
            throw new Error(`AUR0807:${this.controller.name}`);
        }
        this.state = 1;
        return this.start();
    }
    deactivate(detachInitator) {
        switch (this.state) {
            case 1:
                this.state = -1;
                return this.stop(detachInitator);
            case -1:
                throw new Error('AUR0808');
            default:
                this.state = -1;
        }
    }
}

class AuSlot {
    constructor(location, instruction, hdrContext, rendering) {
        var _a, _b;
        this._parentScope = null;
        this._outerScope = null;
        let factory;
        const slotInfo = instruction.auSlot;
        const projection = (_b = (_a = hdrContext.instruction) === null || _a === void 0 ? void 0 : _a.projections) === null || _b === void 0 ? void 0 : _b[slotInfo.name];
        if (projection == null) {
            factory = rendering.getViewFactory(slotInfo.fallback, hdrContext.controller.container);
            this._hasProjection = false;
        }
        else {
            factory = rendering.getViewFactory(projection, hdrContext.parent.controller.container);
            this._hasProjection = true;
        }
        this._hdrContext = hdrContext;
        this.view = factory.create().setLocation(location);
    }
    /** @internal */
    static get inject() { return [IRenderLocation, IInstruction, IHydrationContext, IRendering]; }
    binding(_initiator, _parent, _flags) {
        var _a;
        this._parentScope = this.$controller.scope.parentScope;
        let outerScope;
        if (this._hasProjection) {
            // if there is a projection,
            // then the au-slot should connect the outer scope with the inner scope binding context
            // via overlaying the outerscope with another scope that has
            // - binding context & override context pointing to the outer scope binding & override context respectively
            // - override context has the $host pointing to inner scope binding context
            outerScope = this._hdrContext.controller.scope.parentScope;
            (this._outerScope = Scope.fromParent(outerScope, outerScope.bindingContext))
                .overrideContext.$host = (_a = this.expose) !== null && _a !== void 0 ? _a : this._parentScope.bindingContext;
        }
    }
    attaching(initiator, parent, flags) {
        return this.view.activate(initiator, this.$controller, flags, this._hasProjection ? this._outerScope : this._parentScope);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    exposeChanged(v) {
        if (this._hasProjection && this._outerScope != null) {
            this._outerScope.overrideContext.$host = v;
        }
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
}
__decorate([
    bindable
], AuSlot.prototype, "expose", void 0);
customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);

const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ISanitizer = DI.createInterface('ISanitizer', x => x.singleton(class {
    sanitize(input) {
        return input.replace(SCRIPT_REGEX, '');
    }
}));
/**
 * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
 */
let SanitizeValueConverter = class SanitizeValueConverter {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    /**
     * Process the provided markup that flows to the view.
     *
     * @param untrustedMarkup - The untrusted markup to be sanitized.
     */
    toView(untrustedMarkup) {
        if (untrustedMarkup == null) {
            return null;
        }
        return this.sanitizer.sanitize(untrustedMarkup);
    }
};
SanitizeValueConverter = __decorate([
    __param(0, ISanitizer)
], SanitizeValueConverter);
valueConverter('sanitize')(SanitizeValueConverter);

let ViewValueConverter = class ViewValueConverter {
    constructor(viewLocator) {
        this.viewLocator = viewLocator;
    }
    toView(object, viewNameOrSelector) {
        return this.viewLocator.getViewComponentForObject(object, viewNameOrSelector);
    }
};
ViewValueConverter = __decorate([
    __param(0, IViewLocator)
], ViewValueConverter);
valueConverter('view')(ViewValueConverter);

const DebounceBindingBehaviorRegistration = DebounceBindingBehavior;
const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior;
const ToViewBindingBehaviorRegistration = ToViewBindingBehavior;
const FromViewBindingBehaviorRegistration = FromViewBindingBehavior;
const SignalBindingBehaviorRegistration = SignalBindingBehavior;
const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior;
const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior;
const ITemplateCompilerRegistration = TemplateCompiler;
const INodeObserverLocatorRegistration = NodeObserverLocator;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 */
const DefaultComponents = [
    ITemplateCompilerRegistration,
    INodeObserverLocatorRegistration,
];
const SVGAnalyzerRegistration = SVGAnalyzer;
const AtPrefixedTriggerAttributePatternRegistration = AtPrefixedTriggerAttributePattern;
const ColonPrefixedBindAttributePatternRegistration = ColonPrefixedBindAttributePattern;
const RefAttributePatternRegistration = RefAttributePattern;
const DotSeparatedAttributePatternRegistration = DotSeparatedAttributePattern;
/**
 * Default binding syntax for the following attribute name patterns:
 * - `ref`
 * - `target.command` (dot-separated)
 */
const DefaultBindingSyntax = [
    RefAttributePatternRegistration,
    DotSeparatedAttributePatternRegistration
];
/**
 * Binding syntax for short-hand attribute name patterns:
 * - `@target` (short-hand for `target.trigger`)
 * - `:target` (short-hand for `target.bind`)
 */
const ShortHandBindingSyntax = [
    AtPrefixedTriggerAttributePatternRegistration,
    ColonPrefixedBindAttributePatternRegistration
];
const CallBindingCommandRegistration = CallBindingCommand;
const DefaultBindingCommandRegistration = DefaultBindingCommand;
const ForBindingCommandRegistration = ForBindingCommand;
const FromViewBindingCommandRegistration = FromViewBindingCommand;
const OneTimeBindingCommandRegistration = OneTimeBindingCommand;
const ToViewBindingCommandRegistration = ToViewBindingCommand;
const TwoWayBindingCommandRegistration = TwoWayBindingCommand;
const RefBindingCommandRegistration = RefBindingCommand;
const TriggerBindingCommandRegistration = TriggerBindingCommand;
const DelegateBindingCommandRegistration = DelegateBindingCommand;
const CaptureBindingCommandRegistration = CaptureBindingCommand;
const AttrBindingCommandRegistration = AttrBindingCommand;
const ClassBindingCommandRegistration = ClassBindingCommand;
const StyleBindingCommandRegistration = StyleBindingCommand;
/**
 * Default HTML-specific (but environment-agnostic) binding commands:
 * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
 * - Function call: `.call`
 * - Collection observation: `.for`
 * - Event listeners: `.trigger`, `.delegate`, `.capture`
 */
const DefaultBindingLanguage = [
    DefaultBindingCommandRegistration,
    OneTimeBindingCommandRegistration,
    FromViewBindingCommandRegistration,
    ToViewBindingCommandRegistration,
    TwoWayBindingCommandRegistration,
    CallBindingCommandRegistration,
    ForBindingCommandRegistration,
    RefBindingCommandRegistration,
    TriggerBindingCommandRegistration,
    DelegateBindingCommandRegistration,
    CaptureBindingCommandRegistration,
    ClassBindingCommandRegistration,
    StyleBindingCommandRegistration,
    AttrBindingCommandRegistration,
];
const SanitizeValueConverterRegistration = SanitizeValueConverter;
const ViewValueConverterRegistration = ViewValueConverter;
const FrequentMutationsRegistration = FrequentMutations;
const ObserveShallowRegistration = ObserveShallow;
const IfRegistration = If;
const ElseRegistration = Else;
const RepeatRegistration = Repeat;
const WithRegistration = With;
const SwitchRegistration = Switch;
const CaseRegistration = Case;
const DefaultCaseRegistration = DefaultCase;
const PromiseTemplateControllerRegistration = PromiseTemplateController;
const PendingTemplateControllerRegistration = PendingTemplateController;
const FulfilledTemplateControllerRegistration = FulfilledTemplateController;
const RejectedTemplateControllerRegistration = RejectedTemplateController;
// TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
const PromiseAttributePatternRegistration = PromiseAttributePattern;
const FulfilledAttributePatternRegistration = FulfilledAttributePattern;
const RejectedAttributePatternRegistration = RejectedAttributePattern;
const AttrBindingBehaviorRegistration = AttrBindingBehavior;
const SelfBindingBehaviorRegistration = SelfBindingBehavior;
const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior;
const AuRenderRegistration = AuRender;
const AuComposeRegistration = AuCompose;
const PortalRegistration = Portal;
const FocusRegistration = Focus;
const ShowRegistration = Show;
/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`, `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`, `au-slot`
 * - Custom Attributes: `blur`, `focus`, `portal`
 * - Template controllers: `if`/`else`, `repeat`, `with`
 * - Value Converters: `sanitize`
 */
const DefaultResources = [
    DebounceBindingBehaviorRegistration,
    OneTimeBindingBehaviorRegistration,
    ToViewBindingBehaviorRegistration,
    FromViewBindingBehaviorRegistration,
    SignalBindingBehaviorRegistration,
    ThrottleBindingBehaviorRegistration,
    TwoWayBindingBehaviorRegistration,
    SanitizeValueConverterRegistration,
    ViewValueConverterRegistration,
    FrequentMutationsRegistration,
    ObserveShallowRegistration,
    IfRegistration,
    ElseRegistration,
    RepeatRegistration,
    WithRegistration,
    SwitchRegistration,
    CaseRegistration,
    DefaultCaseRegistration,
    PromiseTemplateControllerRegistration,
    PendingTemplateControllerRegistration,
    FulfilledTemplateControllerRegistration,
    RejectedTemplateControllerRegistration,
    // TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
    PromiseAttributePatternRegistration,
    FulfilledAttributePatternRegistration,
    RejectedAttributePatternRegistration,
    AttrBindingBehaviorRegistration,
    SelfBindingBehaviorRegistration,
    UpdateTriggerBindingBehaviorRegistration,
    AuRenderRegistration,
    AuComposeRegistration,
    PortalRegistration,
    FocusRegistration,
    ShowRegistration,
    AuSlot,
];
const CallBindingRendererRegistration = CallBindingRenderer;
const CustomAttributeRendererRegistration = CustomAttributeRenderer;
const CustomElementRendererRegistration = CustomElementRenderer;
const InterpolationBindingRendererRegistration = InterpolationBindingRenderer;
const IteratorBindingRendererRegistration = IteratorBindingRenderer;
const LetElementRendererRegistration = LetElementRenderer;
const PropertyBindingRendererRegistration = PropertyBindingRenderer;
const RefBindingRendererRegistration = RefBindingRenderer;
const SetPropertyRendererRegistration = SetPropertyRenderer;
const TemplateControllerRendererRegistration = TemplateControllerRenderer;
const ListenerBindingRendererRegistration = ListenerBindingRenderer;
const AttributeBindingRendererRegistration = AttributeBindingRenderer;
const SetAttributeRendererRegistration = SetAttributeRenderer;
const SetClassAttributeRendererRegistration = SetClassAttributeRenderer;
const SetStyleAttributeRendererRegistration = SetStyleAttributeRenderer;
const StylePropertyBindingRendererRegistration = StylePropertyBindingRenderer;
const TextBindingRendererRegistration = TextBindingRenderer;
/**
 * Default renderers for:
 * - PropertyBinding: `bind`, `one-time`, `to-view`, `from-view`, `two-way`
 * - IteratorBinding: `for`
 * - CallBinding: `call`
 * - RefBinding: `ref`
 * - InterpolationBinding: `${}`
 * - SetProperty
 * - `customElement` hydration
 * - `customAttribute` hydration
 * - `templateController` hydration
 * - `let` element hydration
 * - Listener Bindings: `trigger`, `capture`, `delegate`
 * - SetAttribute
 * - StyleProperty: `style`, `css`
 * - TextBinding: `${}`
 */
const DefaultRenderers = [
    PropertyBindingRendererRegistration,
    IteratorBindingRendererRegistration,
    CallBindingRendererRegistration,
    RefBindingRendererRegistration,
    InterpolationBindingRendererRegistration,
    SetPropertyRendererRegistration,
    CustomElementRendererRegistration,
    CustomAttributeRendererRegistration,
    TemplateControllerRendererRegistration,
    LetElementRendererRegistration,
    ListenerBindingRendererRegistration,
    AttributeBindingRendererRegistration,
    SetAttributeRendererRegistration,
    SetClassAttributeRendererRegistration,
    SetStyleAttributeRendererRegistration,
    StylePropertyBindingRendererRegistration,
    TextBindingRendererRegistration,
];
/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
const StandardConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultComponents, ...DefaultResources, ...DefaultBindingSyntax, ...DefaultBindingLanguage, ...DefaultRenderers);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};

const IAurelia = DI.createInterface('IAurelia');
class Aurelia {
    constructor(container = DI.createContainer()) {
        this.container = container;
        /** @internal */
        this._isRunning = false;
        /** @internal */
        this._isStarting = false;
        /** @internal */
        this._isStopping = false;
        // TODO:
        // root should just be a controller,
        // in all other parts of the framework, root of something is always the same type of that thing
        // i.e: container.root => a container, RouteContext.root => a RouteContext
        // Aurelia.root of a controller hierarchy should behave similarly
        /** @internal */
        this._root = void 0;
        this.next = void 0;
        /** @internal */
        this._startPromise = void 0;
        /** @internal */
        this._stopPromise = void 0;
        if (container.has(IAurelia, true)) {
            throw new Error('AUR0711');
        }
        container.registerResolver(IAurelia, new InstanceProvider('IAurelia', this));
        container.registerResolver(IAppRoot, this._rootProvider = new InstanceProvider('IAppRoot'));
    }
    get isRunning() { return this._isRunning; }
    get isStarting() { return this._isStarting; }
    get isStopping() { return this._isStopping; }
    get root() {
        if (this._root == null) {
            if (this.next == null) {
                throw new Error('AUR0710');
            }
            return this.next;
        }
        return this._root;
    }
    register(...params) {
        this.container.register(...params);
        return this;
    }
    app(config) {
        this.next = new AppRoot(config, this._initPlatform(config.host), this.container, this._rootProvider);
        return this;
    }
    /**
     * @param parentController - The owning controller of the view created by this enhance call
     */
    enhance(config, parentController) {
        var _a;
        const ctn = (_a = config.container) !== null && _a !== void 0 ? _a : this.container.createChild();
        const host = config.host;
        const p = this._initPlatform(host);
        const comp = config.component;
        let bc;
        if (typeof comp === 'function') {
            ctn.registerResolver(p.Element, ctn.registerResolver(INode, new InstanceProvider('ElementResolver', host)));
            bc = ctn.invoke(comp);
        }
        else {
            bc = comp;
        }
        ctn.registerResolver(IEventTarget, new InstanceProvider('IEventTarget', host));
        parentController = parentController !== null && parentController !== void 0 ? parentController : null;
        const view = Controller.$el(ctn, bc, host, null, void 0, CustomElementDefinition.create({ name: CustomElement.generateName(), template: host, enhance: true }));
        return onResolve(view.activate(view, parentController, 2 /* fromBind */), () => view);
    }
    async waitForIdle() {
        const platform = this.root.platform;
        await platform.domWriteQueue.yield();
        await platform.domReadQueue.yield();
        await platform.taskQueue.yield();
    }
    /** @internal */
    _initPlatform(host) {
        let p;
        if (!this.container.has(IPlatform, false)) {
            if (host.ownerDocument.defaultView === null) {
                throw new Error('AUR0712');
            }
            p = new BrowserPlatform(host.ownerDocument.defaultView);
            this.container.register(Registration.instance(IPlatform, p));
        }
        else {
            p = this.container.get(IPlatform);
        }
        return p;
    }
    start(root = this.next) {
        if (root == null) {
            throw new Error('AUR0713');
        }
        if (this._startPromise instanceof Promise) {
            return this._startPromise;
        }
        return this._startPromise = onResolve(this.stop(), () => {
            Reflect.set(root.host, '$aurelia', this);
            this._rootProvider.prepare(this._root = root);
            this._isStarting = true;
            return onResolve(root.activate(), () => {
                this._isRunning = true;
                this._isStarting = false;
                this._startPromise = void 0;
                this._dispatchEvent(root, 'au-started', root.host);
            });
        });
    }
    stop(dispose = false) {
        if (this._stopPromise instanceof Promise) {
            return this._stopPromise;
        }
        if (this._isRunning === true) {
            const root = this._root;
            this._isRunning = false;
            this._isStopping = true;
            return this._stopPromise = onResolve(root.deactivate(), () => {
                Reflect.deleteProperty(root.host, '$aurelia');
                if (dispose) {
                    root.dispose();
                }
                this._root = void 0;
                this._rootProvider.dispose();
                this._isStopping = false;
                this._dispatchEvent(root, 'au-stopped', root.host);
            });
        }
    }
    dispose() {
        if (this._isRunning || this._isStopping) {
            throw new Error('AUR0714');
        }
        this.container.dispose();
    }
    /** @internal */
    _dispatchEvent(root, name, target) {
        const ev = new root.platform.window.CustomEvent(name, { detail: this, bubbles: true, cancelable: true });
        target.dispatchEvent(ev);
    }
}

/**
 * The dialog service for composing view & view model into a dialog
 */
const IDialogService = DI.createInterface('IDialogService');
/**
 * The controller asscociated with every dialog view model
 */
const IDialogController = DI.createInterface('IDialogController');
/**
 * An interface describing the object responsible for creating the dom structure of a dialog
 */
const IDialogDomRenderer = DI.createInterface('IDialogDomRenderer');
/**
 * An interface describing the DOM structure of a dialog
 */
const IDialogDom = DI.createInterface('IDialogDom');
const IDialogGlobalSettings = DI.createInterface('IDialogGlobalSettings');
class DialogOpenResult {
    constructor(wasCancelled, dialog) {
        this.wasCancelled = wasCancelled;
        this.dialog = dialog;
    }
    static create(wasCancelled, dialog) {
        return new DialogOpenResult(wasCancelled, dialog);
    }
}
class DialogCloseResult {
    constructor(status, value) {
        this.status = status;
        this.value = value;
    }
    static create(status, value) {
        return new DialogCloseResult(status, value);
    }
}
var DialogDeactivationStatuses;
(function (DialogDeactivationStatuses) {
    DialogDeactivationStatuses["Ok"] = "ok";
    DialogDeactivationStatuses["Error"] = "error";
    DialogDeactivationStatuses["Cancel"] = "cancel";
    /**
     * If a view model refused to deactivate in canDeactivate,
     * then this status should be used to reflect that
     */
    DialogDeactivationStatuses["Abort"] = "abort";
})(DialogDeactivationStatuses || (DialogDeactivationStatuses = {}));
// #endregion

/**
 * A controller object for a Dialog instance.
 */
class DialogController {
    constructor(p, container) {
        this.p = p;
        this.ctn = container;
        this.closed = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    static get inject() { return [IPlatform, IContainer]; }
    /** @internal */
    activate(settings) {
        var _a;
        const container = this.ctn.createChild();
        const { model, template, rejectOnCancel } = settings;
        const hostRenderer = container.get(IDialogDomRenderer);
        const dialogTargetHost = (_a = settings.host) !== null && _a !== void 0 ? _a : this.p.document.body;
        const dom = this.dom = hostRenderer.render(dialogTargetHost, settings);
        const rootEventTarget = container.has(IEventTarget, true)
            ? container.get(IEventTarget)
            : null;
        const contentHost = dom.contentHost;
        this.settings = settings;
        // application root host may be a different element with the dialog root host
        // example:
        // <body>
        //   <my-app>
        //   <au-dialog-container>
        // when it's different, needs to ensure delegate bindings work
        if (rootEventTarget == null || !rootEventTarget.contains(dialogTargetHost)) {
            container.register(Registration.instance(IEventTarget, dialogTargetHost));
        }
        container.register(Registration.instance(INode, contentHost), Registration.instance(IDialogDom, dom));
        return new Promise(r => {
            var _a, _b;
            const cmp = Object.assign(this.cmp = this.getOrCreateVm(container, settings, contentHost), { $dialog: this });
            r((_b = (_a = cmp.canActivate) === null || _a === void 0 ? void 0 : _a.call(cmp, model)) !== null && _b !== void 0 ? _b : true);
        })
            .then(canActivate => {
            var _a;
            if (canActivate !== true) {
                dom.dispose();
                if (rejectOnCancel) {
                    throw createDialogCancelError(null, 'Dialog activation rejected');
                }
                return DialogOpenResult.create(true, this);
            }
            const cmp = this.cmp;
            return onResolve((_a = cmp.activate) === null || _a === void 0 ? void 0 : _a.call(cmp, model), () => {
                var _a;
                const ctrlr = this.controller = Controller.$el(container, cmp, contentHost, null, 0 /* none */, CustomElementDefinition.create((_a = this.getDefinition(cmp)) !== null && _a !== void 0 ? _a : { name: CustomElement.generateName(), template }));
                return onResolve(ctrlr.activate(ctrlr, null, 2 /* fromBind */), () => {
                    var _a;
                    dom.overlay.addEventListener((_a = settings.mouseEvent) !== null && _a !== void 0 ? _a : 'click', this);
                    return DialogOpenResult.create(false, this);
                });
            });
        }, e => {
            dom.dispose();
            throw e;
        });
    }
    /** @internal */
    deactivate(status, value) {
        if (this._closingPromise) {
            return this._closingPromise;
        }
        let deactivating = true;
        const { controller, dom, cmp, settings: { mouseEvent, rejectOnCancel } } = this;
        const dialogResult = DialogCloseResult.create(status, value);
        const promise = new Promise(r => {
            var _a, _b;
            r(onResolve((_b = (_a = cmp.canDeactivate) === null || _a === void 0 ? void 0 : _a.call(cmp, dialogResult)) !== null && _b !== void 0 ? _b : true, canDeactivate => {
                var _a;
                if (canDeactivate !== true) {
                    // we are done, do not block consecutive calls
                    deactivating = false;
                    this._closingPromise = void 0;
                    if (rejectOnCancel) {
                        throw createDialogCancelError(null, 'Dialog cancellation rejected');
                    }
                    return DialogCloseResult.create("abort" /* Abort */);
                }
                return onResolve((_a = cmp.deactivate) === null || _a === void 0 ? void 0 : _a.call(cmp, dialogResult), () => onResolve(controller.deactivate(controller, null, 4 /* fromUnbind */), () => {
                    dom.dispose();
                    dom.overlay.removeEventListener(mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : 'click', this);
                    if (!rejectOnCancel && status !== "error" /* Error */) {
                        this._resolve(dialogResult);
                    }
                    else {
                        this._reject(createDialogCancelError(value, 'Dialog cancelled with a rejection on cancel'));
                    }
                    return dialogResult;
                }));
            }));
        }).catch(reason => {
            this._closingPromise = void 0;
            throw reason;
        });
        // when component canDeactivate is synchronous, and returns something other than true
        // then the below assignment will override
        // the assignment inside the callback without the deactivating variable check
        this._closingPromise = deactivating ? promise : void 0;
        return promise;
    }
    /**
     * Closes the dialog with a successful output.
     *
     * @param value - The returned success output.
     */
    ok(value) {
        return this.deactivate("ok" /* Ok */, value);
    }
    /**
     * Closes the dialog with a cancel output.
     *
     * @param value - The returned cancel output.
     */
    cancel(value) {
        return this.deactivate("cancel" /* Cancel */, value);
    }
    /**
     * Closes the dialog with an error output.
     *
     * @param value - A reason for closing with an error.
     * @returns Promise An empty promise object.
     */
    error(value) {
        const closeError = createDialogCloseError(value);
        return new Promise(r => {
            var _a, _b;
            return r(onResolve((_b = (_a = this.cmp).deactivate) === null || _b === void 0 ? void 0 : _b.call(_a, DialogCloseResult.create("error" /* Error */, closeError)), () => onResolve(this.controller.deactivate(this.controller, null, 4 /* fromUnbind */), () => {
                this.dom.dispose();
                this._reject(closeError);
            })));
        });
    }
    /** @internal */
    handleEvent(event) {
        if ( /* user allows dismiss on overlay click */this.settings.overlayDismiss
            && /* did not click inside the host element */ !this.dom.contentHost.contains(event.target)) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.cancel();
        }
    }
    getOrCreateVm(container, settings, host) {
        const Component = settings.component;
        if (Component == null) {
            return new EmptyComponent();
        }
        if (typeof Component === 'object') {
            return Component;
        }
        const p = this.p;
        container.registerResolver(INode, container.registerResolver(p.Element, new InstanceProvider('ElementResolver', host)));
        return container.invoke(Component);
    }
    getDefinition(component) {
        const Ctor = (typeof component === 'function'
            ? component
            : component === null || component === void 0 ? void 0 : component.constructor);
        return CustomElement.isType(Ctor)
            ? CustomElement.getDefinition(Ctor)
            : null;
    }
}
class EmptyComponent {
}
function createDialogCancelError(output, msg) {
    const error = new Error(msg);
    error.wasCancelled = true;
    error.value = output;
    return error;
}
function createDialogCloseError(output) {
    const error = new Error();
    error.wasCancelled = false;
    error.value = output;
    return error;
}

/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
class DialogService {
    constructor(_ctn, p, _defaultSettings) {
        this._ctn = _ctn;
        this.p = p;
        this._defaultSettings = _defaultSettings;
        /**
         * The current dialog controllers
         *
         * @internal
         */
        this.dlgs = [];
    }
    get controllers() {
        return this.dlgs.slice(0);
    }
    get top() {
        const dlgs = this.dlgs;
        return dlgs.length > 0 ? dlgs[dlgs.length - 1] : null;
    }
    // tslint:disable-next-line:member-ordering
    static get inject() { return [IContainer, IPlatform, IDialogGlobalSettings]; }
    static register(container) {
        container.register(Registration.singleton(IDialogService, this), AppTask.beforeDeactivate(IDialogService, dialogService => onResolve(dialogService.closeAll(), (openDialogController) => {
            if (openDialogController.length > 0) {
                // todo: what to do?
                throw new Error(`AUR0901:${openDialogController.length}`);
            }
        })));
    }
    /**
     * Opens a new dialog.
     *
     * @param settings - Dialog settings for this dialog instance.
     * @returns A promise that settles when the dialog is closed.
     *
     * Example usage:
     * ```ts
     * dialogService.open({ component: () => MyDialog, template: 'my-template' })
     * dialogService.open({ component: () => MyDialog, template: document.createElement('my-template') })
     *
     * // JSX to hyperscript
     * dialogService.open({ component: () => MyDialog, template: <my-template /> })
     *
     * dialogService.open({ component: () => import('...'), template: () => fetch('my.server/dialog-view.html') })
     * ```
     */
    open(settings) {
        return asDialogOpenPromise(new Promise(resolve => {
            var _a;
            const $settings = DialogSettings.from(this._defaultSettings, settings);
            const container = (_a = $settings.container) !== null && _a !== void 0 ? _a : this._ctn.createChild();
            resolve(onResolve($settings.load(), loadedSettings => {
                const dialogController = container.invoke(DialogController);
                container.register(Registration.instance(IDialogController, dialogController));
                container.register(Registration.callback(DialogController, () => {
                    throw new Error('AUR0902');
                }));
                return onResolve(dialogController.activate(loadedSettings), openResult => {
                    if (!openResult.wasCancelled) {
                        if (this.dlgs.push(dialogController) === 1) {
                            this.p.window.addEventListener('keydown', this);
                        }
                        const $removeController = () => this.remove(dialogController);
                        dialogController.closed.then($removeController, $removeController);
                    }
                    return openResult;
                });
            }));
        }));
    }
    /**
     * Closes all open dialogs at the time of invocation.
     *
     * @returns All controllers whose close operation was cancelled.
     */
    closeAll() {
        return Promise
            .all(Array.from(this.dlgs)
            .map(controller => {
            if (controller.settings.rejectOnCancel) {
                // this will throw when calling cancel
                // so only leave return null as noop
                return controller.cancel().then(() => null);
            }
            return controller.cancel().then(result => result.status === "cancel" /* Cancel */
                ? null
                : controller);
        }))
            .then(unclosedControllers => unclosedControllers.filter(unclosed => !!unclosed));
    }
    /** @internal */
    remove(controller) {
        const dlgs = this.dlgs;
        const idx = dlgs.indexOf(controller);
        if (idx > -1) {
            this.dlgs.splice(idx, 1);
        }
        if (dlgs.length === 0) {
            this.p.window.removeEventListener('keydown', this);
        }
    }
    /** @internal */
    handleEvent(e) {
        const keyEvent = e;
        const key = getActionKey(keyEvent);
        if (key == null) {
            return;
        }
        const top = this.top;
        if (top === null || top.settings.keyboard.length === 0) {
            return;
        }
        const keyboard = top.settings.keyboard;
        if (key === 'Escape' && keyboard.includes(key)) {
            void top.cancel();
        }
        else if (key === 'Enter' && keyboard.includes(key)) {
            void top.ok();
        }
    }
}
class DialogSettings {
    static from(...srcs) {
        return Object.assign(new DialogSettings(), ...srcs)
            ._validate()
            ._normalize();
    }
    load() {
        const loaded = this;
        const cmp = this.component;
        const template = this.template;
        const maybePromise = resolveAll(...[
            cmp == null
                ? void 0
                : onResolve(cmp(), loadedCmp => { loaded.component = loadedCmp; }),
            typeof template === 'function'
                ? onResolve(template(), loadedTpl => { loaded.template = loadedTpl; })
                : void 0
        ]);
        return maybePromise instanceof Promise
            ? maybePromise.then(() => loaded)
            : loaded;
    }
    /** @internal */
    _validate() {
        if (this.component == null && this.template == null) {
            throw new Error('AUR0903');
        }
        return this;
    }
    /** @internal */
    _normalize() {
        if (this.keyboard == null) {
            this.keyboard = this.lock ? [] : ['Enter', 'Escape'];
        }
        if (typeof this.overlayDismiss !== 'boolean') {
            this.overlayDismiss = !this.lock;
        }
        return this;
    }
}
function whenClosed(onfulfilled, onrejected) {
    return this.then(openResult => openResult.dialog.closed.then(onfulfilled, onrejected), onrejected);
}
function asDialogOpenPromise(promise) {
    promise.whenClosed = whenClosed;
    return promise;
}
function getActionKey(e) {
    if ((e.code || e.key) === 'Escape' || e.keyCode === 27) {
        return 'Escape';
    }
    if ((e.code || e.key) === 'Enter' || e.keyCode === 13) {
        return 'Enter';
    }
    return undefined;
}

class DefaultDialogGlobalSettings {
    constructor() {
        this.lock = true;
        this.startingZIndex = 1000;
        this.rejectOnCancel = false;
    }
    static register(container) {
        Registration.singleton(IDialogGlobalSettings, this).register(container);
    }
}
const baseWrapperCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';
class DefaultDialogDomRenderer {
    constructor(p) {
        this.p = p;
        this.wrapperCss = `${baseWrapperCss} display:flex;`;
        this.overlayCss = baseWrapperCss;
        this.hostCss = 'position:relative;margin:auto;';
    }
    static register(container) {
        Registration.singleton(IDialogDomRenderer, this).register(container);
    }
    render(dialogHost) {
        const doc = this.p.document;
        const h = (name, css) => {
            const el = doc.createElement(name);
            el.style.cssText = css;
            return el;
        };
        const wrapper = dialogHost.appendChild(h('au-dialog-container', this.wrapperCss));
        const overlay = wrapper.appendChild(h('au-dialog-overlay', this.overlayCss));
        const host = wrapper.appendChild(h('div', this.hostCss));
        return new DefaultDialogDom(wrapper, overlay, host);
    }
}
/** @internal */
DefaultDialogDomRenderer.inject = [IPlatform];
class DefaultDialogDom {
    constructor(wrapper, overlay, contentHost) {
        this.wrapper = wrapper;
        this.overlay = overlay;
        this.contentHost = contentHost;
    }
    dispose() {
        this.wrapper.remove();
    }
}

function createDialogConfiguration(settingsProvider, registrations) {
    return {
        settingsProvider: settingsProvider,
        register: (ctn) => ctn.register(...registrations, AppTask.beforeCreate(() => settingsProvider(ctn.get(IDialogGlobalSettings)))),
        customize(cb, regs) {
            return createDialogConfiguration(cb, regs !== null && regs !== void 0 ? regs : registrations);
        },
    };
}
/**
 * A noop configuration for Dialog, should be used as:
```ts
DialogConfiguration.customize(settings => {
  // adjust default value of the settings
}, [all_implementations_here])
```
 */
const DialogConfiguration = createDialogConfiguration(() => {
    throw new Error('AUR0904');
}, [class NoopDialogGlobalSettings {
        static register(container) {
            container.register(Registration.singleton(IDialogGlobalSettings, this));
        }
    }]);
const DialogDefaultConfiguration = createDialogConfiguration(noop, [
    DialogService,
    DefaultDialogGlobalSettings,
    DefaultDialogDomRenderer,
]);

export { AdoptedStyleSheetsStyles, AppRoot, AppTask, AtPrefixedTriggerAttributePattern, AtPrefixedTriggerAttributePatternRegistration, AttrBindingBehavior, AttrBindingBehaviorRegistration, AttrBindingCommand, AttrBindingCommandRegistration, AttrSyntax, AttributeBinding, AttributeBindingInstruction, AttributeBindingRendererRegistration, AttributeNSAccessor, AttributePattern, AuCompose, AuRender, AuRenderRegistration, AuSlot, AuSlotsInfo, Aurelia, Bindable, BindableDefinition, BindableObserver, BindablesInfo, BindingCommand, BindingCommandDefinition, BindingModeBehavior, CSSModulesProcessorRegistry, CallBinding, CallBindingCommand, CallBindingCommandRegistration, CallBindingInstruction, CallBindingRendererRegistration, CaptureBindingCommand, CaptureBindingCommandRegistration, Case, CheckedObserver, Children, ChildrenDefinition, ChildrenObserver, ClassAttributeAccessor, ClassBindingCommand, ClassBindingCommandRegistration, ColonPrefixedBindAttributePattern, ColonPrefixedBindAttributePatternRegistration, ComputedWatcher, Controller, CustomAttribute, CustomAttributeDefinition, CustomAttributeRendererRegistration, CustomElement, CustomElementDefinition, CustomElementRendererRegistration, DataAttributeAccessor, DebounceBindingBehavior, DebounceBindingBehaviorRegistration, DefaultBindingCommand, DefaultBindingCommandRegistration, DefaultBindingLanguage, DefaultBindingSyntax, DefaultCase, DefaultComponents, DefaultDialogDom, DefaultDialogDomRenderer, DefaultDialogGlobalSettings, DefaultRenderers, DefaultResources, DelegateBindingCommand, DelegateBindingCommandRegistration, DialogCloseResult, DialogConfiguration, DialogController, DialogDeactivationStatuses, DialogDefaultConfiguration, DialogOpenResult, DialogService, DotSeparatedAttributePattern, DotSeparatedAttributePatternRegistration, Else, ElseRegistration, EventDelegator, EventSubscriber, ExpressionWatcher, Focus, ForBindingCommand, ForBindingCommandRegistration, FragmentNodeSequence, FrequentMutations, FromViewBindingBehavior, FromViewBindingBehaviorRegistration, FromViewBindingCommand, FromViewBindingCommandRegistration, FulfilledTemplateController, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, IAppRoot, IAppTask, IAttrMapper, IAttributeParser, IAttributePattern, IAuSlotsInfo, IAurelia, IController, IDialogController, IDialogDom, IDialogDomRenderer, IDialogGlobalSettings, IDialogService, IEventDelegator, IEventTarget, IHistory, IHydrationContext, IInstruction, ILifecycleHooks, ILocation, INode, INodeObserverLocatorRegistration, IPlatform, IProjections, IRenderLocation, IRenderer, IRendering, ISVGAnalyzer, ISanitizer, IShadowDOMGlobalStyles, IShadowDOMStyleFactory, IShadowDOMStyles, ISyntaxInterpreter, ITemplateCompiler, ITemplateCompilerHooks, ITemplateCompilerRegistration, ITemplateElementFactory, IViewFactory, IViewLocator, IWindow, IWorkTracker, If, IfRegistration, InstructionType, InterpolationBinding, InterpolationBindingRendererRegistration, InterpolationInstruction, Interpretation, IteratorBindingInstruction, IteratorBindingRendererRegistration, LetBinding, LetBindingInstruction, LetElementRendererRegistration, LifecycleHooks, LifecycleHooksDefinition, LifecycleHooksEntry, Listener, ListenerBindingInstruction, ListenerBindingRendererRegistration, NodeObserverConfig, NodeObserverLocator, NodeType, NoopSVGAnalyzer, ObserveShallow, OneTimeBindingBehavior, OneTimeBindingBehaviorRegistration, OneTimeBindingCommand, OneTimeBindingCommandRegistration, PendingTemplateController, Portal, PromiseTemplateController, PropertyBinding, PropertyBindingInstruction, PropertyBindingRendererRegistration, RefAttributePattern, RefAttributePatternRegistration, RefBinding, RefBindingCommandRegistration, RefBindingInstruction, RefBindingRendererRegistration, RejectedTemplateController, RenderPlan, Rendering, Repeat, RepeatRegistration, SVGAnalyzer, SVGAnalyzerRegistration, SanitizeValueConverter, SanitizeValueConverterRegistration, SelectValueObserver, SelfBindingBehavior, SelfBindingBehaviorRegistration, SetAttributeInstruction, SetAttributeRendererRegistration, SetClassAttributeInstruction, SetClassAttributeRendererRegistration, SetPropertyInstruction, SetPropertyRendererRegistration, SetStyleAttributeInstruction, SetStyleAttributeRendererRegistration, ShadowDOMRegistry, ShortHandBindingSyntax, SignalBindingBehavior, SignalBindingBehaviorRegistration, StandardConfiguration, StyleAttributeAccessor, StyleBindingCommand, StyleBindingCommandRegistration, StyleConfiguration, StyleElementStyles, StylePropertyBindingInstruction, StylePropertyBindingRendererRegistration, Switch, TemplateCompiler, TemplateCompilerHooks, TemplateControllerRendererRegistration, TextBindingInstruction, TextBindingRendererRegistration, ThrottleBindingBehavior, ThrottleBindingBehaviorRegistration, ToViewBindingBehavior, ToViewBindingBehaviorRegistration, ToViewBindingCommand, ToViewBindingCommandRegistration, TriggerBindingCommand, TriggerBindingCommandRegistration, TwoWayBindingBehavior, TwoWayBindingBehaviorRegistration, TwoWayBindingCommand, TwoWayBindingCommandRegistration, UpdateTriggerBindingBehavior, UpdateTriggerBindingBehaviorRegistration, ValueAttributeObserver, ViewFactory, ViewLocator, ViewModelKind, ViewValueConverter, ViewValueConverterRegistration, Views, Watch, With, WithRegistration, allResources, attributePattern, bindable, bindingCommand, children, containerless, convertToRenderLocation, createElement, cssModules, customAttribute, customElement, getEffectiveParentNode, getRef, isCustomElementController, isCustomElementViewModel, isInstruction, isRenderLocation, lifecycleHooks, processContent, renderer, setEffectiveParentNode, setRef, shadowCSS, templateCompilerHooks, templateController, useShadowDOM, view, watch };
//# sourceMappingURL=index.dev.js.map
