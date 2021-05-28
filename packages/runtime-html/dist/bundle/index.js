export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from '@aurelia/platform';
import { BrowserPlatform } from '@aurelia/platform-browser';
export { BrowserPlatform } from '@aurelia/platform-browser';
import { Protocol, getPrototypeChain, Metadata, firstDefined, kebabCase, noop, emptyArray, DI, all, Registration, IPlatform as IPlatform$1, fromDefinitionOrDefault, pascalCase, mergeArrays, fromAnnotationOrTypeOrDefault, fromAnnotationOrDefinitionOrTypeOrDefault, InstanceProvider, IContainer, nextId, ILogger, isObject, onResolve, resolveAll, camelCase, toArray, emptyObject, IServiceLocator, compareNumber } from '@aurelia/kernel';
import { BindingMode, subscriberCollection, withFlushQueue, connectable, registerAliases, Scope, ConnectableSwitcher, ProxyObservable, IObserverLocator, IExpressionParser, AccessScopeExpression, DelegationStrategy, BindingBehaviorExpression, BindingBehaviorFactory, bindingBehavior, BindingInterceptor, ISignaler, PropertyAccessor, INodeObserverLocator, SetterObserver, IDirtyChecker, alias, applyMutationsToIndices, getCollectionObserver as getCollectionObserver$1, BindingContext, synchronizeIndices, valueConverter } from '@aurelia/runtime';
export { Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, BindingMode, BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, Char, CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, CustomExpression, DelegationStrategy, DirtyCheckProperty, DirtyCheckSettings, ExpressionKind, ForOfStatement, HtmlLiteralExpression, IDirtyChecker, IExpressionParser, INodeObserverLocator, IObserverLocator, ISignaler, Interpolation, LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, ObserverLocator, OverrideContext, ParserState, Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, Scope, SetObserver, SetterObserver, TaggedTemplateExpression, TemplateExpression, UnaryExpression, ValueConverter, ValueConverterDefinition, ValueConverterExpression, alias, applyMutationsToIndices, bindingBehavior, cloneIndexMap, connectable, copyIndexMap, createIndexMap, disableArrayObservation, disableMapObservation, disableSetObservation, enableArrayObservation, enableMapObservation, enableSetObservation, getCollectionObserver, isIndexMap, observable, parse, parseExpression, registerAliases, subscriberCollection, synchronizeIndices, valueConverter } from '@aurelia/runtime';

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
        Metadata.define(Bindable.name, BindableDefinition.create($prop, config), $target.constructor, $prop);
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
    return key.startsWith(Bindable.name);
}
const Bindable = {
    name: Protocol.annotation.keyFor('bindable'),
    keyFrom(name) {
        return `${Bindable.name}:${name}`;
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
                if (!Metadata.hasOwn(Bindable.name, Type, prop)) {
                    Protocol.annotation.appendTo(Type, Bindable.keyFrom(prop));
                }
                Metadata.define(Bindable.name, def, Type, prop);
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
        const propStart = Bindable.name.length + 1;
        const defs = [];
        const prototypeChain = getPrototypeChain(Type);
        let iProto = prototypeChain.length;
        let iDefs = 0;
        let keys;
        let keysLen;
        let Class;
        while (--iProto >= 0) {
            Class = prototypeChain[iProto];
            keys = Protocol.annotation.getKeys(Class).filter(isBindableAnnotation);
            keysLen = keys.length;
            for (let i = 0; i < keysLen; ++i) {
                defs[iDefs++] = Metadata.getOwn(Bindable.name, Class, keys[i].slice(propStart));
            }
        }
        return defs;
    },
};
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
    constructor(obj, propertyKey, cbName, set, 
    // todo: a future feature where the observer is not instantiated via a controller
    // this observer can become more static, as in immediately available when used
    // in the form of a decorator
    $controller) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.set = set;
        this.$controller = $controller;
        // todo: name too long. just value/oldValue, or v/oV
        this.value = void 0;
        this.oldValue = void 0;
        this.f = 0 /* none */;
        const cb = obj[cbName];
        const cbAll = obj.propertyChanged;
        const hasCb = this.hasCb = typeof cb === 'function';
        const hasCbAll = this.hasCbAll = typeof cbAll === 'function';
        const hasSetter = this.hasSetter = set !== noop;
        this.cb = hasCb ? cb : noop;
        this.cbAll = hasCbAll ? cbAll : noop;
        // when user declare @bindable({ set })
        // it's expected to work from the start,
        // regardless where the assignment comes from: either direct view model assignment or from binding during render
        // so if either getter/setter config is present, alter the accessor straight await
        if (this.cb === void 0 && !hasCbAll && !hasSetter) {
            this.observing = false;
        }
        else {
            this.observing = true;
            const val = obj[propertyKey];
            this.value = hasSetter && val !== void 0 ? set(val) : val;
            this.createGetterSetter();
        }
    }
    get type() { return 1 /* Observer */; }
    getValue() {
        return this.value;
    }
    setValue(newValue, flags) {
        if (this.hasSetter) {
            newValue = this.set(newValue);
        }
        if (this.observing) {
            const currentValue = this.value;
            if (Object.is(newValue, currentValue)) {
                return;
            }
            this.value = newValue;
            this.oldValue = currentValue;
            this.f = flags;
            // todo: controller (if any) state should determine the invocation instead
            if ( /* either not instantiated via a controller */this.$controller == null
                /* or the controller instantiating this is bound */ || this.$controller.isBound) {
                if (this.hasCb) {
                    this.cb.call(this.obj, newValue, currentValue, flags);
                }
                if (this.hasCbAll) {
                    this.cbAll.call(this.obj, this.propertyKey, newValue, currentValue, flags);
                }
            }
            this.queue.add(this);
            // this.subs.notify(newValue, currentValue, flags);
        }
        else {
            // See SetterObserver.setValue for explanation
            this.obj[this.propertyKey] = newValue;
        }
    }
    subscribe(subscriber) {
        if (!this.observing === false) {
            this.observing = true;
            const currentValue = this.obj[this.propertyKey];
            this.value = this.hasSetter
                ? this.set(currentValue)
                : currentValue;
            this.createGetterSetter();
        }
        this.subs.add(subscriber);
    }
    flush() {
        oV$4 = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV$4, this.f);
    }
    createGetterSetter() {
        Reflect.defineProperty(this.obj, this.propertyKey, {
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
class Interpretation {
    constructor() {
        this.parts = emptyArray;
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
            this.parts = emptyArray;
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
/** @internal */
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
let AttributeParser = class AttributeParser {
    constructor(interpreter, attrPatterns) {
        this.interpreter = interpreter;
        this.cache = {};
        const patterns = this.patterns = {};
        attrPatterns.forEach(attrPattern => {
            const defs = AttributePattern.getPatternDefinitions(attrPattern.constructor);
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
    __param(0, ISyntaxInterpreter),
    __param(1, all(IAttributePattern))
], AttributeParser);
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
const AttributePattern = Object.freeze({
    name: Protocol.resource.keyFor('attribute-pattern'),
    definitionAnnotationKey: 'attribute-pattern-definitions',
    define(patternDefs, Type) {
        const definition = new AttributePatternResourceDefinition(Type);
        const { name, definitionAnnotationKey } = AttributePattern;
        Metadata.define(name, definition, Type);
        Protocol.resource.appendTo(Type, name);
        Protocol.annotation.set(Type, definitionAnnotationKey, patternDefs);
        Protocol.annotation.appendTo(Type, definitionAnnotationKey);
        return Type;
    },
    getPatternDefinitions(Type) {
        return Protocol.annotation.get(Type, AttributePattern.definitionAnnotationKey);
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

class CallBinding {
    constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$hostScope = null;
        this.targetObserver = observerLocator.getObserver(target, targetProperty);
    }
    callSource(args) {
        const overrideContext = this.$scope.overrideContext;
        // really need to delete the following line
        // and the for..in loop below
        // convenience in the template won't outweight the draw back of such confusing feature
        // OR, at the very least, use getter/setter for each property in args to get/set original source
        // ---
        Object.assign(overrideContext, args);
        const result = this.sourceExpression.evaluate(8 /* mustEvaluate */, this.$scope, this.$hostScope, this.locator, null);
        for (const prop in args) {
            Reflect.deleteProperty(overrideContext, prop);
        }
        return result;
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
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
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.targetObserver.setValue(null, flags, this.target, this.targetProperty);
        this.isBound = false;
    }
    observeProperty(obj, propertyName) {
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
    constructor(platform, observerLocator, obj, propertyKey, targetAttribute) {
        this.platform = platform;
        this.observerLocator = observerLocator;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.targetAttribute = targetAttribute;
        this.value = null;
        this.oldValue = null;
        this.hasChanges = false;
        // layout is not certain, depends on the attribute being flushed to owner element
        // but for simple start, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.f = 0 /* none */;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.value;
    }
    setValue(value, flags) {
        this.value = value;
        this.hasChanges = value !== this.oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const currentValue = this.value;
            this.oldValue = currentValue;
            switch (this.targetAttribute) {
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
                    this.obj.classList.toggle(this.propertyKey, !!currentValue);
                    break;
                }
                case 'style': {
                    let priority = '';
                    let newValue = currentValue;
                    if (typeof newValue === 'string' && newValue.includes('!important')) {
                        priority = 'important';
                        newValue = newValue.replace('!important', '');
                    }
                    this.obj.style.setProperty(this.propertyKey, newValue, priority);
                }
            }
        }
    }
    handleMutation(mutationRecords) {
        let shouldProcess = false;
        for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
            const record = mutationRecords[i];
            if (record.type === 'attributes' && record.attributeName === this.propertyKey) {
                shouldProcess = true;
                break;
            }
        }
        if (shouldProcess) {
            let newValue;
            switch (this.targetAttribute) {
                case 'class':
                    newValue = this.obj.classList.contains(this.propertyKey);
                    break;
                case 'style':
                    newValue = this.obj.style.getPropertyValue(this.propertyKey);
                    break;
                default:
                    throw new Error(`Unsupported targetAttribute: ${this.targetAttribute}`);
            }
            if (newValue !== this.value) {
                this.oldValue = this.value;
                this.value = newValue;
                this.hasChanges = false;
                this.f = 0 /* none */;
                this.queue.add(this);
            }
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.value = this.oldValue = this.obj.getAttribute(this.propertyKey);
            startObservation(this.obj.ownerDocument.defaultView.MutationObserver, this.obj, this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            stopObservation(this.obj, this);
        }
    }
    flush() {
        oV$3 = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV$3, this.f);
    }
}
subscriberCollection(AttributeObserver);
withFlushQueue(AttributeObserver);
const startObservation = ($MutationObserver, element, subscription) => {
    if (element.$eMObservers === undefined) {
        element.$eMObservers = new Set();
    }
    if (element.$mObserver === undefined) {
        (element.$mObserver = new $MutationObserver(handleMutation)).observe(element, { attributes: true });
    }
    element.$eMObservers.add(subscription);
};
const stopObservation = (element, subscription) => {
    const $eMObservers = element.$eMObservers;
    if ($eMObservers && $eMObservers.delete(subscription)) {
        if ($eMObservers.size === 0) {
            element.$mObserver.disconnect();
            element.$mObserver = undefined;
        }
        return true;
    }
    return false;
};
const handleMutation = (mutationRecords) => {
    mutationRecords[0].target.$eMObservers.forEach(invokeHandleMutation, mutationRecords);
};
function invokeHandleMutation(s) {
    s.handleMutation(this);
}
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$3 = void 0;

const IPlatform = IPlatform$1;

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
        if (value !== b.sourceExpression.evaluate(flags, b.$scope, b.$hostScope, b.locator, null)) {
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
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = null;
        this.$hostScope = null;
        this.task = null;
        this.targetSubscriber = null;
        this.persistentFlags = 0 /* none */;
        this.value = void 0;
        this.target = target;
        this.$platform = locator.get(IPlatform);
    }
    updateTarget(value, flags) {
        flags |= this.persistentFlags;
        this.targetObserver.setValue(value, flags, this.target, this.targetProperty);
    }
    updateSource(value, flags) {
        flags |= this.persistentFlags;
        this.sourceExpression.assign(flags, this.$scope, this.$hostScope, this.locator, value);
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
        if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.obs.count > 1) {
            const shouldConnect = (mode & oneTime$1) === 0;
            if (shouldConnect) {
                this.obs.version++;
            }
            newValue = sourceExpression.evaluate(flags, $scope, this.$hostScope, locator, interceptor);
            if (shouldConnect) {
                this.obs.clear(false);
            }
        }
        let task;
        if (newValue !== this.value) {
            this.value = newValue;
            if (shouldQueueFlush) {
                // Queue the new one before canceling the old one, to prevent early yield
                task = this.task;
                this.task = this.$platform.domWriteQueue.queueTask(() => {
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
    $bind(flags, scope, hostScope, projection) {
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
        this.$hostScope = hostScope;
        this.projection = projection;
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        let targetObserver = this.targetObserver;
        if (!targetObserver) {
            targetObserver = this.targetObserver = new AttributeObserver(this.$platform, this.observerLocator, this.target, this.targetProperty, this.targetAttribute);
        }
        // during bind, binding behavior might have changed sourceExpression
        sourceExpression = this.sourceExpression;
        const $mode = this.mode;
        const interceptor = this.interceptor;
        if ($mode & toViewOrOneTime$1) {
            const shouldConnect = ($mode & toView$2) > 0;
            interceptor.updateTarget(this.value = sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator, shouldConnect ? interceptor : null), flags);
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
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope
            = this.$hostScope
                = null;
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
        this.observerLocator = observerLocator;
        this.interpolation = interpolation;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.locator = locator;
        this.taskQueue = taskQueue;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
        this.task = null;
        this.targetObserver = observerLocator.getAccessor(target, targetProperty);
        const expressions = interpolation.expressions;
        const partBindings = this.partBindings = Array(expressions.length);
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            partBindings[i] = new InterpolationPartBinding(expressions[i], target, targetProperty, locator, observerLocator, this);
        }
    }
    updateTarget(value, flags) {
        const partBindings = this.partBindings;
        const staticParts = this.interpolation.parts;
        const ii = partBindings.length;
        let result = '';
        if (ii === 1) {
            result = staticParts[0] + partBindings[0].value + staticParts[1];
        }
        else {
            result = staticParts[0];
            for (let i = 0; ii > i; ++i) {
                result += partBindings[i].value + staticParts[i + 1];
            }
        }
        const targetObserver = this.targetObserver;
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0 && (targetObserver.type & 4 /* Layout */) > 0;
        if (shouldQueueFlush) {
            // Queue the new one before canceling the old one, to prevent early yield
            const task = this.task;
            this.task = this.taskQueue.queueTask(() => {
                this.task = null;
                targetObserver.setValue(result, flags, this.target, this.targetProperty);
            }, queueTaskOptions);
            task === null || task === void 0 ? void 0 : task.cancel();
        }
        else {
            targetObserver.setValue(result, flags, this.target, this.targetProperty);
        }
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        const partBindings = this.partBindings;
        for (let i = 0, ii = partBindings.length; ii > i; ++i) {
            partBindings[i].$bind(flags, scope, hostScope);
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
        for (let i = 0, ii = partBindings.length; i < ii; ++i) {
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
        this.observerLocator = observerLocator;
        this.owner = owner;
        this.interceptor = this;
        // at runtime, mode may be overriden by binding behavior
        // but it wouldn't matter here, just start with something for later check
        this.mode = BindingMode.toView;
        this.value = '';
        this.$hostScope = null;
        this.task = null;
        this.isBound = false;
    }
    handleChange(newValue, oldValue, flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        const obsRecord = this.obs;
        const canOptimize = sourceExpression.$kind === 10082 /* AccessScope */ && obsRecord.count === 1;
        if (!canOptimize) {
            const shouldConnect = (this.mode & toView$1) > 0;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, shouldConnect ? this.interceptor : null);
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
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        const v = this.value = this.sourceExpression.evaluate(flags, scope, hostScope, this.locator, (this.mode & toView$1) > 0 ? this.interceptor : null);
        if (v instanceof Array) {
            this.observeCollection(v);
        }
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
        this.obs.clear(true);
    }
}
connectable(InterpolationPartBinding);
/**
 * A binding for handling the element content interpolation
 */
class ContentBinding {
    constructor(sourceExpression, target, locator, observerLocator, p) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.p = p;
        this.interceptor = this;
        // at runtime, mode may be overriden by binding behavior
        // but it wouldn't matter here, just start with something for later check
        this.mode = BindingMode.toView;
        this.value = '';
        this.$hostScope = null;
        this.task = null;
        this.isBound = false;
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
        if (!canOptimize) {
            const shouldConnect = (this.mode & toView$1) > 0;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, shouldConnect ? this.interceptor : null);
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
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        const v = this.value = this.sourceExpression.evaluate(flags, scope, hostScope, this.locator, (this.mode & toView$1) > 0 ? this.interceptor : null);
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
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        // TODO: should existing value (either connected node, or a string)
        // be removed when this binding is unbound?
        // this.updateTarget('', flags);
        this.$scope = void 0;
        this.$hostScope = null;
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
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.toBindingContext = toBindingContext;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
        this.task = null;
        this.target = null;
    }
    handleChange(newValue, _previousValue, flags) {
        if (!this.isBound) {
            return;
        }
        const target = this.target;
        const targetProperty = this.targetProperty;
        const previousValue = target[targetProperty];
        this.obs.version++;
        newValue = this.sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, this.interceptor);
        this.obs.clear(false);
        if (newValue !== previousValue) {
            target[targetProperty] = newValue;
        }
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.$hostScope = hostScope;
        this.target = (this.toBindingContext ? (hostScope !== null && hostScope !== void 0 ? hostScope : scope).bindingContext : (hostScope !== null && hostScope !== void 0 ? hostScope : scope).overrideContext);
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        // sourceExpression might have been changed during bind
        this.target[this.targetProperty]
            = this.sourceExpression.evaluate(flags | 2 /* fromBind */, scope, hostScope, this.locator, this.interceptor);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
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
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.taskQueue = taskQueue;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
        this.targetObserver = void 0;
        this.persistentFlags = 0 /* none */;
        this.task = null;
        this.targetSubscriber = null;
    }
    updateTarget(value, flags) {
        flags |= this.persistentFlags;
        this.targetObserver.setValue(value, flags, this.target, this.targetProperty);
    }
    updateSource(value, flags) {
        flags |= this.persistentFlags;
        this.sourceExpression.assign(flags, this.$scope, this.$hostScope, this.locator, value);
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
        // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
        if (sourceExpression.$kind !== 10082 /* AccessScope */ || obsRecord.count > 1) {
            // todo: in VC expressions, from view also requires connect
            const shouldConnect = this.mode > oneTime;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, $scope, this.$hostScope, locator, interceptor);
            if (shouldConnect) {
                obsRecord.clear(false);
            }
        }
        if (shouldQueueFlush) {
            // Queue the new one before canceling the old one, to prevent early yield
            const task = this.task;
            this.task = this.taskQueue.queueTask(() => {
                interceptor.updateTarget(newValue, flags);
                this.task = null;
            }, updateTaskOpts);
            task === null || task === void 0 ? void 0 : task.cancel();
        }
        else {
            interceptor.updateTarget(newValue, flags);
        }
    }
    $bind(flags, scope, hostScope) {
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
        this.$hostScope = hostScope;
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        const $mode = this.mode;
        let targetObserver = this.targetObserver;
        if (!targetObserver) {
            const observerLocator = this.observerLocator;
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
            interceptor.updateTarget(sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator, shouldConnect ? interceptor : null), flags);
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
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
        const task = this.task;
        if (this.targetSubscriber) {
            this.targetObserver.unsubscribe(this.targetSubscriber);
        }
        if (task != null) {
            task.cancel();
            this.task = null;
        }
        this.obs.clear(true);
        this.isBound = false;
    }
}
connectable(PropertyBinding);

class RefBinding {
    constructor(sourceExpression, target, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this);
        }
        this.sourceExpression.assign(flags, this.$scope, hostScope, this.locator, this.target);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, null) === this.target) {
            sourceExpression.assign(flags, this.$scope, this.$hostScope, this.locator, null);
        }
        // source expression might have been modified durring assign, via a BB
        // deepscan-disable-next-line
        sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
        this.isBound = false;
    }
    observeProperty(obj, propertyName) {
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
        Metadata.define(Children.name, ChildrenDefinition.create($prop, config), $target.constructor, $prop);
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
    return key.startsWith(Children.name);
}
const Children = {
    name: Protocol.annotation.keyFor('children-observer'),
    keyFrom(name) {
        return `${Children.name}:${name}`;
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
        const propStart = Children.name.length + 1;
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
                defs[iDefs++] = Metadata.getOwn(Children.name, Class, keys[i].slice(propStart));
            }
        }
        return defs;
    },
};
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
/** @internal */
let ChildrenObserver = class ChildrenObserver {
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
        this.callback = obj[cbName];
        Reflect.defineProperty(this.obj, this.propertyKey, {
            enumerable: true,
            configurable: true,
            get: () => this.getValue(),
            set: () => { return; },
        });
    }
    getValue() {
        this.tryStartObserving();
        return this.children;
    }
    setValue(newValue) { }
    subscribe(subscriber) {
        this.tryStartObserving();
        this.subs.add(subscriber);
    }
    tryStartObserving() {
        if (!this.observing) {
            this.observing = true;
            this.children = filterChildren(this.controller, this.query, this.filter, this.map);
            const obs = new this.controller.host.ownerDocument.defaultView.MutationObserver(() => { this.onChildrenChanged(); });
            obs.observe(this.controller.host, this.options);
        }
    }
    onChildrenChanged() {
        this.children = filterChildren(this.controller, this.query, this.filter, this.map);
        if (this.callback !== void 0) {
            this.callback.call(this.obj);
        }
        this.subs.notify(this.children, undefined, 0 /* none */);
    }
};
ChildrenObserver = __decorate([
    subscriberCollection()
], ChildrenObserver);
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
    const children = [];
    for (let i = 0, ii = nodes.length; i < ii; ++i) {
        const node = nodes[i];
        const $controller = CustomElement.for(node, forOpts);
        const viewModel = (_a = $controller === null || $controller === void 0 ? void 0 : $controller.viewModel) !== null && _a !== void 0 ? _a : null;
        if (filter(node, $controller, viewModel)) {
            children.push(map(node, $controller, viewModel));
        }
    }
    return children;
}

function watch(expressionOrPropertyAccessFn, changeHandlerOrCallback) {
    if (!expressionOrPropertyAccessFn) {
        throw new Error('Invalid watch config. Expected an expression or a fn');
    }
    return function decorator(target, key, descriptor) {
        const isClassDecorator = key == null;
        const Type = isClassDecorator ? target : target.constructor;
        // basic validation
        if (isClassDecorator) {
            if (typeof changeHandlerOrCallback !== 'function'
                && (changeHandlerOrCallback == null || !(changeHandlerOrCallback in Type.prototype))) {
                throw new Error(`Invalid change handler config. Method "${String(changeHandlerOrCallback)}" not found in class ${Type.name}`);
            }
        }
        else if (typeof (descriptor === null || descriptor === void 0 ? void 0 : descriptor.value) !== 'function') {
            throw new Error(`decorated target ${String(key)} is not a class method.`);
        }
        Watch.add(Type, new WatchDefinition(expressionOrPropertyAccessFn, isClassDecorator ? changeHandlerOrCallback : descriptor.value));
    };
}
class WatchDefinition {
    constructor(expression, callback) {
        this.expression = expression;
        this.callback = callback;
    }
}
const noDefinitions = emptyArray;
const Watch = {
    name: Protocol.annotation.keyFor('watch'),
    add(Type, definition) {
        let watchDefinitions = Metadata.getOwn(Watch.name, Type);
        if (watchDefinitions == null) {
            Metadata.define(Watch.name, watchDefinitions = [], Type);
        }
        watchDefinitions.push(definition);
    },
    getAnnotation(Type) {
        var _a;
        return (_a = Metadata.getOwn(Watch.name, Type)) !== null && _a !== void 0 ? _a : noDefinitions;
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
    constructor(Type, name, aliases, key, cache, template, instructions, dependencies, injectable, needsCompile, surrogates, bindables, childrenObservers, containerless, isStrictBinding, shadowOptions, hasSlots, enhance, projectionsMap, watches, processContent) {
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
        this.projectionsMap = projectionsMap;
        this.watches = watches;
        this.processContent = processContent;
    }
    static create(nameOrDef, Type = null) {
        if (Type === null) {
            const def = nameOrDef;
            if (typeof def === 'string') {
                throw new Error(`Cannot create a custom element definition with only a name and no type: ${nameOrDef}`);
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
            return new CustomElementDefinition(Type, name, mergeArrays(def.aliases), fromDefinitionOrDefault('key', def, () => CustomElement.keyFrom(name)), fromDefinitionOrDefault('cache', def, () => 0), fromDefinitionOrDefault('template', def, () => null), mergeArrays(def.instructions), mergeArrays(def.dependencies), fromDefinitionOrDefault('injectable', def, () => null), fromDefinitionOrDefault('needsCompile', def, () => true), mergeArrays(def.surrogates), Bindable.from(def.bindables), Children.from(def.childrenObservers), fromDefinitionOrDefault('containerless', def, () => false), fromDefinitionOrDefault('isStrictBinding', def, () => false), fromDefinitionOrDefault('shadowOptions', def, () => null), fromDefinitionOrDefault('hasSlots', def, () => false), fromDefinitionOrDefault('enhance', def, () => false), fromDefinitionOrDefault('projectionsMap', def, () => new Map()), fromDefinitionOrDefault('watches', def, () => emptyArray), fromAnnotationOrTypeOrDefault('processContent', Type, () => null));
        }
        // If a type is passed in, we ignore the Type property on the definition if it exists.
        // TODO: document this behavior
        if (typeof nameOrDef === 'string') {
            return new CustomElementDefinition(Type, nameOrDef, mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), Type.aliases), CustomElement.keyFrom(nameOrDef), fromAnnotationOrTypeOrDefault('cache', Type, () => 0), fromAnnotationOrTypeOrDefault('template', Type, () => null), mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), Type.instructions), mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), Type.dependencies), fromAnnotationOrTypeOrDefault('injectable', Type, () => null), fromAnnotationOrTypeOrDefault('needsCompile', Type, () => true), mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), Type.surrogates), Bindable.from(...Bindable.getAll(Type), CustomElement.getAnnotation(Type, 'bindables'), Type.bindables), Children.from(...Children.getAll(Type), CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers), fromAnnotationOrTypeOrDefault('containerless', Type, () => false), fromAnnotationOrTypeOrDefault('isStrictBinding', Type, () => false), fromAnnotationOrTypeOrDefault('shadowOptions', Type, () => null), fromAnnotationOrTypeOrDefault('hasSlots', Type, () => false), fromAnnotationOrTypeOrDefault('enhance', Type, () => false), fromAnnotationOrTypeOrDefault('projectionsMap', Type, () => new Map()), mergeArrays(Watch.getAnnotation(Type), Type.watches), fromAnnotationOrTypeOrDefault('processContent', Type, () => null));
        }
        // This is the typical default behavior, e.g. from regular CustomElement.define invocations or from @customElement deco
        // The ViewValueConverter also uses this signature and passes in a definition where everything except for the 'hooks'
        // property needs to be copied. So we have that exception for 'hooks', but we may need to revisit that default behavior
        // if this turns out to be too opinionated.
        const name = fromDefinitionOrDefault('name', nameOrDef, CustomElement.generateName);
        return new CustomElementDefinition(Type, name, mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), nameOrDef.aliases, Type.aliases), CustomElement.keyFrom(name), fromAnnotationOrDefinitionOrTypeOrDefault('cache', nameOrDef, Type, () => 0), fromAnnotationOrDefinitionOrTypeOrDefault('template', nameOrDef, Type, () => null), mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), nameOrDef.instructions, Type.instructions), mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), nameOrDef.dependencies, Type.dependencies), fromAnnotationOrDefinitionOrTypeOrDefault('injectable', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('needsCompile', nameOrDef, Type, () => true), mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), nameOrDef.surrogates, Type.surrogates), Bindable.from(...Bindable.getAll(Type), CustomElement.getAnnotation(Type, 'bindables'), Type.bindables, nameOrDef.bindables), Children.from(...Children.getAll(Type), CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers, nameOrDef.childrenObservers), fromAnnotationOrDefinitionOrTypeOrDefault('containerless', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('isStrictBinding', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('shadowOptions', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('hasSlots', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('enhance', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('projectionsMap', nameOrDef, Type, () => new Map()), mergeArrays(nameOrDef.watches, Watch.getAnnotation(Type), Type.watches), fromAnnotationOrDefinitionOrTypeOrDefault('processContent', nameOrDef, Type, () => null));
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
        Registration.transient(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, CustomElement, key, container);
    }
}
const defaultForOpts = {
    name: undefined,
    searchParents: false,
    optional: false,
};
const CustomElement = {
    name: Protocol.resource.keyFor('custom-element'),
    keyFrom(name) {
        return `${CustomElement.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(CustomElement.name, value);
    },
    for(node, opts = defaultForOpts) {
        if (opts.name === void 0 && opts.searchParents !== true) {
            const controller = getRef(node, CustomElement.name);
            if (controller === null) {
                if (opts.optional === true) {
                    return null;
                }
                throw new Error(`The provided node is not a custom element or containerless host.`);
            }
            return controller;
        }
        if (opts.name !== void 0) {
            if (opts.searchParents !== true) {
                const controller = getRef(node, CustomElement.name);
                if (controller === null) {
                    throw new Error(`The provided node is not a custom element or containerless host.`);
                }
                if (controller.is(opts.name)) {
                    return controller;
                }
                return (void 0);
            }
            let cur = node;
            let foundAController = false;
            while (cur !== null) {
                const controller = getRef(cur, CustomElement.name);
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
            throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
        }
        let cur = node;
        while (cur !== null) {
            const controller = getRef(cur, CustomElement.name);
            if (controller !== null) {
                return controller;
            }
            cur = getEffectiveParentNode(cur);
        }
        throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
    },
    define(nameOrDef, Type) {
        const definition = CustomElementDefinition.create(nameOrDef, Type);
        Metadata.define(CustomElement.name, definition, definition.Type);
        Metadata.define(CustomElement.name, definition, definition);
        Protocol.resource.appendTo(definition.Type, CustomElement.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(CustomElement.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
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
};
const pcHookMetadataProperty = Protocol.annotation.keyFor('processContent');
function processContent(hook) {
    return hook === void 0
        ? function (target, propertyKey, _descriptor) {
            Metadata.define(pcHookMetadataProperty, ensureHook(target, propertyKey), target);
        }
        : function (target) {
            hook = ensureHook(target, hook);
            const def = Metadata.getOwn(CustomElement.name, target);
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
        throw new Error(`Invalid @processContent hook. Expected the hook to be a function (when defined in a class, it needs to be a static function) but got a ${hookType}.`);
    }
    return hook;
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
        return new CustomAttributeDefinition(Type, firstDefined(CustomAttribute.getAnnotation(Type, 'name'), name), mergeArrays(CustomAttribute.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), CustomAttribute.keyFrom(name), firstDefined(CustomAttribute.getAnnotation(Type, 'defaultBindingMode'), def.defaultBindingMode, Type.defaultBindingMode, BindingMode.toView), firstDefined(CustomAttribute.getAnnotation(Type, 'isTemplateController'), def.isTemplateController, Type.isTemplateController, false), Bindable.from(...Bindable.getAll(Type), CustomAttribute.getAnnotation(Type, 'bindables'), Type.bindables, def.bindables), firstDefined(CustomAttribute.getAnnotation(Type, 'noMultiBindings'), def.noMultiBindings, Type.noMultiBindings, false), mergeArrays(Watch.getAnnotation(Type), Type.watches));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.transient(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, CustomAttribute, key, container);
    }
}
const CustomAttribute = {
    name: Protocol.resource.keyFor('custom-attribute'),
    keyFrom(name) {
        return `${CustomAttribute.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(CustomAttribute.name, value);
    },
    for(node, name) {
        var _a;
        return ((_a = getRef(node, CustomAttribute.keyFrom(name))) !== null && _a !== void 0 ? _a : void 0);
    },
    define(nameOrDef, Type) {
        const definition = CustomAttributeDefinition.create(nameOrDef, Type);
        Metadata.define(CustomAttribute.name, definition, definition.Type);
        Metadata.define(CustomAttribute.name, definition, definition);
        Protocol.resource.appendTo(Type, CustomAttribute.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(CustomAttribute.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
};

const IViewFactory = DI.createInterface('IViewFactory');
class ViewFactory {
    constructor(name, context, contentType, projectionScope = null) {
        this.name = name;
        this.context = context;
        this.contentType = contentType;
        this.projectionScope = projectionScope;
        this.isCaching = false;
        this.cache = null;
        this.cacheSize = -1;
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
        controller = Controller.forSyntheticView(null, this.context, this, flags, parentController);
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
const Views = {
    name: Protocol.resource.keyFor('views'),
    has(value) {
        return typeof value === 'function' && (Metadata.hasOwn(Views.name, value) || '$views' in value);
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
        let views = Metadata.getOwn(Views.name, value);
        if (views === void 0) {
            Metadata.define(Views.name, views = [], value);
        }
        return views;
    },
    add(Type, partialDefinition) {
        const definition = CustomElementDefinition.create(partialDefinition);
        let views = Metadata.getOwn(Views.name, Type);
        if (views === void 0) {
            Metadata.define(Views.name, views = [definition], Type);
        }
        else {
            views.push(definition);
        }
        return views;
    },
};
function view(v) {
    return function (target) {
        Views.add(target, v);
    };
}
const IViewLocator = DI.createInterface('IViewLocator', x => x.singleton(ViewLocator));
class ViewLocator {
    constructor() {
        this.modelInstanceToBoundComponent = new WeakMap();
        this.modelTypeToUnboundComponent = new Map();
    }
    getViewComponentForObject(object, viewNameOrSelector) {
        if (object) {
            const availableViews = Views.has(object.constructor) ? Views.get(object.constructor) : [];
            const resolvedViewName = typeof viewNameOrSelector === 'function'
                ? viewNameOrSelector(object, availableViews)
                : this.getViewName(availableViews, viewNameOrSelector);
            return this.getOrCreateBoundComponent(object, availableViews, resolvedViewName);
        }
        return null;
    }
    getOrCreateBoundComponent(object, availableViews, resolvedViewName) {
        let lookup = this.modelInstanceToBoundComponent.get(object);
        let BoundComponent;
        if (lookup === void 0) {
            lookup = {};
            this.modelInstanceToBoundComponent.set(object, lookup);
        }
        else {
            BoundComponent = lookup[resolvedViewName];
        }
        if (BoundComponent === void 0) {
            const UnboundComponent = this.getOrCreateUnboundComponent(object, availableViews, resolvedViewName);
            BoundComponent = CustomElement.define(CustomElement.getDefinition(UnboundComponent), class extends UnboundComponent {
                constructor() {
                    super(object);
                }
            });
            lookup[resolvedViewName] = BoundComponent;
        }
        return BoundComponent;
    }
    getOrCreateUnboundComponent(object, availableViews, resolvedViewName) {
        let lookup = this.modelTypeToUnboundComponent.get(object.constructor);
        let UnboundComponent;
        if (lookup === void 0) {
            lookup = {};
            this.modelTypeToUnboundComponent.set(object.constructor, lookup);
        }
        else {
            UnboundComponent = lookup[resolvedViewName];
        }
        if (UnboundComponent === void 0) {
            UnboundComponent = CustomElement.define(this.getView(availableViews, resolvedViewName), class {
                constructor(viewModel) {
                    this.viewModel = viewModel;
                }
                define(controller, parentContainer, definition) {
                    const vm = this.viewModel;
                    controller.scope = Scope.fromParent(controller.scope, vm);
                    if (vm.define !== void 0) {
                        return vm.define(controller, parentContainer, definition);
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
    getViewName(views, requestedName) {
        if (requestedName) {
            return requestedName;
        }
        if (views.length === 1) {
            return views[0].name;
        }
        return 'default-view';
    }
    getView(views, name) {
        const v = views.find(x => x.name === name);
        if (v === void 0) {
            throw new Error(`Could not find view: ${name}`);
        }
        return v;
    }
}

const IProjections = DI.createInterface("IProjections");
var AuSlotContentType;
(function (AuSlotContentType) {
    AuSlotContentType[AuSlotContentType["Projection"] = 0] = "Projection";
    AuSlotContentType[AuSlotContentType["Fallback"] = 1] = "Fallback";
})(AuSlotContentType || (AuSlotContentType = {}));
class SlotInfo {
    constructor(name, type, projectionContext) {
        this.name = name;
        this.type = type;
        this.projectionContext = projectionContext;
    }
}
class ProjectionContext {
    constructor(content, scope = null) {
        this.content = content;
        this.scope = scope;
    }
}
class RegisteredProjections {
    constructor(scope, projections) {
        this.scope = scope;
        this.projections = projections;
    }
}
const IProjectionProvider = DI.createInterface('IProjectionProvider', x => x.singleton(ProjectionProvider));
const projectionMap = new WeakMap();
class ProjectionProvider {
    registerProjections(projections, scope) {
        for (const [instruction, $projections] of projections) {
            projectionMap.set(instruction, new RegisteredProjections(scope, $projections));
        }
    }
    getProjectionFor(instruction) {
        var _a;
        return (_a = projectionMap.get(instruction)) !== null && _a !== void 0 ? _a : null;
    }
}
class AuSlot {
    constructor(factory, location) {
        this.hostScope = null;
        this.view = factory.create().setLocation(location);
        this.isProjection = factory.contentType === AuSlotContentType.Projection;
        this.outerScope = factory.projectionScope;
    }
    /**
     * @internal
     */
    static get inject() { return [IViewFactory, IRenderLocation]; }
    binding(_initiator, _parent, _flags) {
        this.hostScope = this.$controller.scope.parentScope;
    }
    attaching(initiator, parent, flags) {
        var _a;
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags, (_a = this.outerScope) !== null && _a !== void 0 ? _a : this.hostScope, this.hostScope);
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
customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);
const IAuSlotsInfo = DI.createInterface('AuSlotsInfo');
class AuSlotsInfo {
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots) {
        this.projectedSlots = projectedSlots;
    }
}

const definitionContainerLookup = new WeakMap();
const definitionContainerProjectionsLookup = new WeakMap();
const fragmentCache = new WeakMap();
function isRenderContext(value) {
    return value instanceof RenderContext;
}
function getRenderContext(partialDefinition, parentContainer, projections) {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    // injectable completely prevents caching, ensuring that each instance gets a new context context
    if (definition.injectable !== null) {
        return new RenderContext(definition, parentContainer);
    }
    if (projections == null) {
        let containerLookup = definitionContainerLookup.get(definition);
        if (containerLookup === void 0) {
            definitionContainerLookup.set(definition, containerLookup = new WeakMap());
        }
        let context = containerLookup.get(parentContainer);
        if (context === void 0) {
            containerLookup.set(parentContainer, context = new RenderContext(definition, parentContainer));
        }
        return context;
    }
    let containerProjectionsLookup = definitionContainerProjectionsLookup.get(definition);
    if (containerProjectionsLookup === void 0) {
        definitionContainerProjectionsLookup.set(definition, containerProjectionsLookup = new WeakMap());
    }
    let projectionsLookup = containerProjectionsLookup.get(parentContainer);
    if (projectionsLookup === void 0) {
        containerProjectionsLookup.set(parentContainer, projectionsLookup = new WeakMap());
    }
    let context = projectionsLookup.get(projections);
    if (context === void 0) {
        projectionsLookup.set(projections, context = new RenderContext(definition, parentContainer));
    }
    return context;
}
const emptyNodeCache = new WeakMap();
class RenderContext {
    constructor(definition, parentContainer) {
        this.definition = definition;
        this.parentContainer = parentContainer;
        this.viewModelProvider = void 0;
        this.fragment = null;
        this.factory = void 0;
        this.isCompiled = false;
        this.renderers = Object.create(null);
        this.compiledDefinition = (void 0);
        this.root = parentContainer.root;
        const container = this.container = parentContainer.createChild();
        // TODO(fkleuver): get contextual + root renderers
        const renderers = container.getAll(IRenderer);
        let i = 0;
        let renderer;
        for (; i < renderers.length; ++i) {
            renderer = renderers[i];
            this.renderers[renderer.instructionType] = renderer;
        }
        this.projectionProvider = container.get(IProjectionProvider);
        container.registerResolver(IViewFactory, this.factoryProvider = new ViewFactoryProvider(), true);
        container.registerResolver(IController, this.parentControllerProvider = new InstanceProvider('IController'), true);
        container.registerResolver(IInstruction, this.instructionProvider = new InstanceProvider('IInstruction'), true);
        container.registerResolver(IRenderLocation, this.renderLocationProvider = new InstanceProvider('IRenderLocation'), true);
        container.registerResolver(IAuSlotsInfo, this.auSlotsInfoProvider = new InstanceProvider('IAuSlotsInfo'), true);
        const p = this.platform = container.get(IPlatform);
        const ep = this.elementProvider = new InstanceProvider('ElementResolver');
        container.registerResolver(INode, ep);
        container.registerResolver(p.Node, ep);
        container.registerResolver(p.Element, ep);
        container.registerResolver(p.HTMLElement, ep);
        container.register(...definition.dependencies);
    }
    get id() {
        return this.container.id;
    }
    // #region IServiceLocator api
    has(key, searchAncestors) {
        return this.container.has(key, searchAncestors);
    }
    get(key) {
        return this.container.get(key);
    }
    getAll(key) {
        return this.container.getAll(key);
    }
    // #endregion
    // #region IContainer api
    register(...params) {
        return this.container.register(...params);
    }
    registerResolver(key, resolver) {
        return this.container.registerResolver(key, resolver);
    }
    // public deregisterResolverFor<K extends Key, T = K>(key: K): void {
    //   this.container.deregisterResolverFor(key);
    // }
    registerTransformer(key, transformer) {
        return this.container.registerTransformer(key, transformer);
    }
    getResolver(key, autoRegister) {
        return this.container.getResolver(key, autoRegister);
    }
    invoke(key, dynamicDependencies) {
        return this.container.invoke(key, dynamicDependencies);
    }
    getFactory(key) {
        return this.container.getFactory(key);
    }
    registerFactory(key, factory) {
        this.container.registerFactory(key, factory);
    }
    createChild() {
        return this.container.createChild();
    }
    find(kind, name) {
        return this.container.find(kind, name);
    }
    create(kind, name) {
        return this.container.create(kind, name);
    }
    disposeResolvers() {
        this.container.disposeResolvers();
    }
    // #endregion
    // #region IRenderContext api
    compile(targetedProjections) {
        let compiledDefinition;
        if (this.isCompiled) {
            return this;
        }
        this.isCompiled = true;
        const definition = this.definition;
        if (definition.needsCompile) {
            const container = this.container;
            const compiler = container.get(ITemplateCompiler);
            compiledDefinition = this.compiledDefinition = compiler.compile(definition, container, targetedProjections);
        }
        else {
            compiledDefinition = this.compiledDefinition = definition;
        }
        // Support Recursive Components by adding self to own context
        compiledDefinition.register(this);
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
    getViewFactory(name, contentType, projectionScope) {
        let factory = this.factory;
        if (factory === void 0) {
            if (name === void 0) {
                name = this.definition.name;
            }
            factory = this.factory = new ViewFactory(name, this, contentType, projectionScope);
        }
        return factory;
    }
    beginChildComponentOperation(instance) {
        const definition = this.definition;
        if (definition.injectable !== null) {
            if (this.viewModelProvider === void 0) {
                this.container.registerResolver(definition.injectable, this.viewModelProvider = new InstanceProvider('definition.injectable'));
            }
            this.viewModelProvider.prepare(instance);
        }
        return this;
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
    // TODO: split up into 2 methods? getComponentFactory + getSyntheticFactory or something
    getComponentFactory(parentController, host, instruction, viewFactory, location, auSlotsInfo) {
        if (parentController !== void 0) {
            this.parentControllerProvider.prepare(parentController);
        }
        if (host !== void 0) {
            // TODO: fix provider input type, Key is probably not a good constraint
            this.elementProvider.prepare(host);
        }
        if (instruction !== void 0) {
            this.instructionProvider.prepare(instruction);
        }
        if (location !== void 0) {
            this.renderLocationProvider.prepare(location);
        }
        if (viewFactory !== void 0) {
            this.factoryProvider.prepare(viewFactory);
        }
        if (auSlotsInfo !== void 0) {
            this.auSlotsInfoProvider.prepare(auSlotsInfo);
        }
        return this;
    }
    // #endregion
    // #region IComponentFactory api
    createComponent(resourceKey) {
        return this.container.get(resourceKey);
    }
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
        this.elementProvider.dispose();
    }
    // #endregion
    // #region IProjectionProvider api
    registerProjections(projections, scope) {
        this.projectionProvider.registerProjections(projections, scope);
    }
    getProjectionFor(instruction) {
        return this.projectionProvider.getProjectionFor(instruction);
    }
}
/** @internal */
class ViewFactoryProvider {
    constructor() {
        this.factory = null;
    }
    prepare(factory) {
        this.factory = factory;
    }
    get $isResolver() { return true; }
    resolve(_handler, _requestor) {
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

class ClassAttributeAccessor {
    constructor(obj) {
        this.obj = obj;
        this.value = '';
        this.oldValue = '';
        this.doNotCache = true;
        this.nameIndex = {};
        this.version = 0;
        this.hasChanges = false;
        this.isActive = false;
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.value;
    }
    setValue(newValue, flags) {
        this.value = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const currentValue = this.value;
            const nameIndex = this.nameIndex;
            let version = this.version;
            this.oldValue = currentValue;
            const classesToAdd = getClassesToAdd(currentValue);
            // Get strings split on a space not including empties
            if (classesToAdd.length > 0) {
                this.addClassesAndUpdateIndex(classesToAdd);
            }
            this.version += 1;
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
    addClassesAndUpdateIndex(classes) {
        const node = this.obj;
        for (let i = 0, ii = classes.length; i < ii; i++) {
            const className = classes[i];
            if (className.length === 0) {
                continue;
            }
            this.nameIndex[className] = this.version;
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
            for (let i = 0; i < len; ++i) {
                classes.push(...getClassesToAdd(object[i]));
            }
            return classes;
        }
        else {
            return emptyArray;
        }
    }
    const classes = [];
    for (const property in object) {
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
let AdoptedStyleSheetsStylesFactory = class AdoptedStyleSheetsStylesFactory {
    constructor(p) {
        this.p = p;
        this.cache = new Map();
    }
    createStyles(localStyles, sharedStyles) {
        return new AdoptedStyleSheetsStyles(this.p, localStyles, this.cache, sharedStyles);
    }
};
AdoptedStyleSheetsStylesFactory = __decorate([
    __param(0, IPlatform)
], AdoptedStyleSheetsStylesFactory);
let StyleElementStylesFactory = class StyleElementStylesFactory {
    constructor(p) {
        this.p = p;
    }
    createStyles(localStyles, sharedStyles) {
        return new StyleElementStyles(this.p, localStyles, sharedStyles);
    }
};
StyleElementStylesFactory = __decorate([
    __param(0, IPlatform)
], StyleElementStylesFactory);
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
        this.observerLocator = observerLocator;
        this.get = get;
        this.cb = cb;
        this.useProxy = useProxy;
        this.interceptor = this;
        this.value = void 0;
        this.isBound = false;
        // todo: maybe use a counter allow recursive call to a certain level
        this.running = false;
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
    constructor(scope, locator, observerLocator, expression, callback) {
        this.scope = scope;
        this.locator = locator;
        this.observerLocator = observerLocator;
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
            value = expr.evaluate(0, this.scope, null, this.locator, this);
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
        this.value = this.expression.evaluate(0 /* none */, this.scope, null, this.locator, this);
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
const LifecycleHooks = {
    name: Protocol.annotation.keyFor('lifecycle-hooks'),
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    define(def, Type) {
        const definition = LifecycleHooksDefinition.create(def, Type);
        Metadata.define(LifecycleHooks.name, definition, Type);
        Protocol.resource.appendTo(Type, LifecycleHooks.name);
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
                definition = Metadata.getOwn(LifecycleHooks.name, instance.constructor);
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
};
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

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
function callDispose(disposable) {
    disposable.dispose();
}
var MountTarget;
(function (MountTarget) {
    MountTarget[MountTarget["none"] = 0] = "none";
    MountTarget[MountTarget["host"] = 1] = "host";
    MountTarget[MountTarget["shadowRoot"] = 2] = "shadowRoot";
    MountTarget[MountTarget["location"] = 3] = "location";
})(MountTarget || (MountTarget = {}));
const optional = { optional: true };
const controllerLookup = new WeakMap();
class Controller {
    constructor(root, container, vmKind, flags, definition, 
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
        this.root = root;
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
        this.hostScope = null;
        this.isBound = false;
        // If a host from another custom element was passed in, then this will be the controller for that custom element (could be `au-viewport` for example).
        // In that case, this controller will create a new host node (with the definition's name) and use that as the target host for the nodes instead.
        // That host node is separately mounted to the host controller's original host node.
        this.hostController = null;
        this.mountTarget = 0 /* none */;
        this.shadowRoot = null;
        this.nodes = null;
        this.context = null;
        this.location = null;
        this.lifecycleHooks = null;
        this.state = 0 /* none */;
        this.logger = null;
        this.debug = false;
        this.fullyNamed = false;
        this.$initiator = null;
        this.$flags = 0 /* none */;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.activatingStack = 0;
        this.detachingStack = 0;
        this.unbindingStack = 0;
        if (root === null && container.has(IAppRoot, true)) {
            this.root = container.get(IAppRoot);
        }
        this.platform = container.get(IPlatform);
        switch (vmKind) {
            case 1 /* customAttribute */:
            case 0 /* customElement */:
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
        const controller = Controller.getCached(viewModel);
        if (controller === void 0) {
            throw new Error(`There is no cached controller for the provided ViewModel: ${String(viewModel)}`);
        }
        return controller;
    }
    static forCustomElement(root, container, viewModel, host, 
    // projections *targeted* for this custom element. these are not the projections *provided* by this custom element.
    targetedProjections, flags = 0 /* none */, hydrate = true, 
    // Use this when `instance.constructor` is not a custom element type to pass on the CustomElement definition
    definition = void 0) {
        if (controllerLookup.has(viewModel)) {
            return controllerLookup.get(viewModel);
        }
        definition = definition !== null && definition !== void 0 ? definition : CustomElement.getDefinition(viewModel.constructor);
        const controller = new Controller(
        /* root           */ root, 
        /* container      */ container, 0 /* customElement */, 
        /* flags          */ flags, 
        /* definition     */ definition, 
        /* viewFactory    */ null, 
        /* viewModel      */ viewModel, 
        /* host           */ host);
        controllerLookup.set(viewModel, controller);
        if (hydrate) {
            controller.hydrateCustomElement(container, targetedProjections);
        }
        return controller;
    }
    static forCustomAttribute(root, container, viewModel, host, flags = 0 /* none */) {
        if (controllerLookup.has(viewModel)) {
            return controllerLookup.get(viewModel);
        }
        const definition = CustomAttribute.getDefinition(viewModel.constructor);
        const controller = new Controller(
        /* root           */ root, 
        /* container      */ container, 1 /* customAttribute */, 
        /* flags          */ flags, 
        /* definition     */ definition, 
        /* viewFactory    */ null, 
        /* viewModel      */ viewModel, 
        /* host           */ host);
        controllerLookup.set(viewModel, controller);
        controller.hydrateCustomAttribute();
        return controller;
    }
    static forSyntheticView(root, context, viewFactory, flags = 0 /* none */, parentController = void 0) {
        const controller = new Controller(
        /* root           */ root, 
        /* container      */ context, 2 /* synthetic */, 
        /* flags          */ flags, 
        /* definition     */ null, 
        /* viewFactory    */ viewFactory, 
        /* viewModel      */ null, 
        /* host           */ null);
        controller.parent = parentController !== null && parentController !== void 0 ? parentController : null;
        controller.hydrateSynthetic(context);
        return controller;
    }
    /** @internal */
    hydrateCustomElement(parentContainer, targetedProjections) {
        var _a;
        this.logger = parentContainer.get(ILogger).root;
        this.debug = this.logger.config.level <= 1 /* debug */;
        if (this.debug) {
            this.logger = this.logger.scopeTo(this.name);
        }
        let definition = this.definition;
        const flags = this.flags;
        const instance = this.viewModel;
        this.scope = Scope.create(instance, null, true);
        if (definition.watches.length > 0) {
            createWatchers(this, this.container, definition, instance);
        }
        createObservers(this, definition, flags, instance);
        createChildrenObservers(this, definition, flags, instance);
        if (this.hooks.hasDefine) {
            if (this.debug) {
                this.logger.trace(`invoking define() hook`);
            }
            const result = instance.define(
            /* controller      */ this, 
            /* parentContainer */ parentContainer, 
            /* definition      */ definition);
            if (result !== void 0 && result !== definition) {
                definition = CustomElementDefinition.getOrCreate(result);
            }
        }
        const context = this.context = getRenderContext(definition, parentContainer, targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.projections);
        this.lifecycleHooks = LifecycleHooks.resolve(context);
        // Support Recursive Components by adding self to own context
        definition.register(context);
        if (definition.injectable !== null) {
            // If the element is registered as injectable, support injecting the instance into children
            context.beginChildComponentOperation(instance);
        }
        // If this is the root controller, then the AppRoot will invoke things in the following order:
        // - Controller.hydrateCustomElement
        // - runAppTasks('hydrating') // may return a promise
        // - Controller.compile
        // - runAppTasks('hydrated') // may return a promise
        // - Controller.compileChildren
        // This keeps hydration synchronous while still allowing the composition root compile hooks to do async work.
        if (((_a = this.root) === null || _a === void 0 ? void 0 : _a.controller) !== this) {
            this.hydrate(targetedProjections);
            this.hydrateChildren();
        }
    }
    /** @internal */
    hydrate(targetedProjections) {
        if (this.hooks.hasHydrating) {
            if (this.debug) {
                this.logger.trace(`invoking hasHydrating() hook`);
            }
            this.viewModel.hydrating(this);
        }
        const compiledContext = this.context.compile(targetedProjections);
        const { projectionsMap, shadowOptions, isStrictBinding, hasSlots, containerless } = compiledContext.compiledDefinition;
        compiledContext.registerProjections(projectionsMap, this.scope);
        // once the projections are registered, we can cleanup the projection map to prevent memory leaks.
        projectionsMap.clear();
        this.isStrictBinding = isStrictBinding;
        if ((this.hostController = CustomElement.for(this.host, optional)) !== null) {
            this.host = this.platform.document.createElement(this.context.definition.name);
        }
        setRef(this.host, CustomElement.name, this);
        setRef(this.host, this.definition.key, this);
        if (shadowOptions !== null || hasSlots) {
            if (containerless) {
                throw new Error('You cannot combine the containerless custom element option with Shadow DOM.');
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
        this.nodes = compiledContext.createNodes();
        if (this.hooks.hasHydrated) {
            if (this.debug) {
                this.logger.trace(`invoking hasHydrated() hook`);
            }
            this.viewModel.hydrated(this);
        }
    }
    /** @internal */
    hydrateChildren() {
        const targets = this.nodes.findTargets();
        this.context.render(
        /* flags      */ this.flags, 
        /* controller */ this, 
        /* targets    */ targets, 
        /* definition */ this.context.compiledDefinition, 
        /* host       */ this.host);
        if (this.hooks.hasCreated) {
            if (this.debug) {
                this.logger.trace(`invoking created() hook`);
            }
            this.viewModel.created(this);
        }
    }
    hydrateCustomAttribute() {
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
    hydrateSynthetic(context) {
        this.context = context;
        const compiledContext = context.compile(null);
        const compiledDefinition = compiledContext.compiledDefinition;
        this.isStrictBinding = compiledDefinition.isStrictBinding;
        const nodes = this.nodes = compiledContext.createNodes();
        const targets = nodes.findTargets();
        compiledContext.render(
        /* flags      */ this.flags, 
        /* controller */ this, 
        /* targets    */ targets, 
        /* definition */ compiledDefinition, 
        /* host       */ void 0);
    }
    activate(initiator, parent, flags, scope, hostScope) {
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
                throw new Error(`${this.name} trying to activate a controller that is disposed.`);
            default:
                throw new Error(`${this.name} unexpected state: ${stringifyState(this.state)}.`);
        }
        this.parent = parent;
        if (this.debug && !this.fullyNamed) {
            this.fullyNamed = true;
            this.logger = this.context.get(ILogger).root.scopeTo(this.name);
            this.logger.trace(`activate()`);
        }
        this.hostScope = hostScope !== null && hostScope !== void 0 ? hostScope : null;
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
                    throw new Error(`Scope is null or undefined`);
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
        this.enterActivating();
        if (this.hooks.hasBinding) {
            if (this.debug) {
                this.logger.trace(`binding()`);
            }
            const ret = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this.ensurePromise();
                ret.then(() => {
                    this.bind();
                }).catch(err => {
                    this.reject(err);
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
        if (this.bindings !== null) {
            for (let i = 0; i < this.bindings.length; ++i) {
                this.bindings[i].$bind(this.$flags, this.scope, this.hostScope);
            }
        }
        if (this.hooks.hasBound) {
            if (this.debug) {
                this.logger.trace(`bound()`);
            }
            const ret = this.viewModel.bound(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this.ensurePromise();
                ret.then(() => {
                    this.isBound = true;
                    this.attach();
                }).catch(err => {
                    this.reject(err);
                });
                return;
            }
        }
        this.isBound = true;
        this.attach();
    }
    append(...nodes) {
        switch (this.mountTarget) {
            case 1 /* host */:
                this.host.append(...nodes);
                break;
            case 2 /* shadowRoot */:
                this.shadowRoot.append(...nodes);
                break;
            case 3 /* location */:
                for (let i = 0; i < nodes.length; ++i) {
                    this.location.parentNode.insertBefore(nodes[i], this.location);
                }
                break;
        }
    }
    attach() {
        var _a;
        if (this.debug) {
            this.logger.trace(`attach()`);
        }
        if (this.hostController !== null) {
            switch (this.mountTarget) {
                case 1 /* host */:
                case 2 /* shadowRoot */:
                    this.hostController.append(this.host);
                    break;
                case 3 /* location */:
                    this.hostController.append(this.location.$start, this.location);
                    break;
            }
        }
        switch (this.mountTarget) {
            case 1 /* host */:
                this.nodes.appendTo(this.host, (_a = this.definition) === null || _a === void 0 ? void 0 : _a.enhance);
                break;
            case 2 /* shadowRoot */: {
                const styles = this.context.has(IShadowDOMStyles, false)
                    ? this.context.get(IShadowDOMStyles)
                    : this.context.get(IShadowDOMGlobalStyles);
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
                this.ensurePromise();
                this.enterActivating();
                ret.then(() => {
                    this.leaveActivating();
                }).catch(err => {
                    this.reject(err);
                });
            }
        }
        // attaching() and child activation run in parallel, and attached() is called when both are finished
        if (this.children !== null) {
            for (let i = 0; i < this.children.length; ++i) {
                // Any promises returned from child activation are cumulatively awaited before this.$promise resolves
                void this.children[i].activate(this.$initiator, this, this.$flags, this.scope, this.hostScope);
            }
        }
        // attached() is invoked by Controller#leaveActivating when `activatingStack` reaches 0
        this.leaveActivating();
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
                throw new Error(`${this.name} unexpected state: ${stringifyState(this.state)}.`);
        }
        if (this.debug) {
            this.logger.trace(`deactivate()`);
        }
        this.$initiator = initiator;
        this.$flags = flags;
        if (initiator === this) {
            this.enterDetaching();
        }
        if (this.children !== null) {
            for (let i = 0; i < this.children.length; ++i) {
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
                this.ensurePromise();
                initiator.enterDetaching();
                ret.then(() => {
                    initiator.leaveDetaching();
                }).catch(err => {
                    initiator.reject(err);
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
        this.leaveDetaching();
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
        if (this.bindings !== null) {
            for (let i = 0; i < this.bindings.length; ++i) {
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
        this.resolve();
    }
    ensurePromise() {
        if (this.$promise === void 0) {
            this.$promise = new Promise((resolve, reject) => {
                this.$resolve = resolve;
                this.$reject = reject;
            });
            if (this.$initiator !== this) {
                this.parent.ensurePromise();
            }
        }
    }
    resolve() {
        if (this.$promise !== void 0) {
            const resolve = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            resolve();
        }
    }
    reject(err) {
        if (this.$promise !== void 0) {
            const reject = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            reject(err);
        }
        if (this.$initiator !== this) {
            this.parent.reject(err);
        }
    }
    enterActivating() {
        ++this.activatingStack;
        if (this.$initiator !== this) {
            this.parent.enterActivating();
        }
    }
    leaveActivating() {
        if (--this.activatingStack === 0) {
            if (this.hooks.hasAttached) {
                if (this.debug) {
                    this.logger.trace(`attached()`);
                }
                const ret = this.viewModel.attached(this.$initiator, this.$flags);
                if (ret instanceof Promise) {
                    this.ensurePromise();
                    ret.then(() => {
                        this.state = 2 /* activated */;
                        // Resolve this.$promise, signaling that activation is done (path 1 of 2)
                        this.resolve();
                        if (this.$initiator !== this) {
                            this.parent.leaveActivating();
                        }
                    }).catch(err => {
                        this.reject(err);
                    });
                    return;
                }
            }
            this.state = 2 /* activated */;
            // Resolve this.$promise (if present), signaling that activation is done (path 2 of 2)
            this.resolve();
        }
        if (this.$initiator !== this) {
            this.parent.leaveActivating();
        }
    }
    enterDetaching() {
        ++this.detachingStack;
    }
    leaveDetaching() {
        if (--this.detachingStack === 0) {
            // Note: this controller is the initiator (detach is only ever called on the initiator)
            if (this.debug) {
                this.logger.trace(`detach()`);
            }
            this.enterUnbinding();
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
                    const ret = cur.viewModel.unbinding(cur.$initiator, cur.parent, cur.$flags);
                    if (ret instanceof Promise) {
                        this.ensurePromise();
                        this.enterUnbinding();
                        ret.then(() => {
                            this.leaveUnbinding();
                        }).catch(err => {
                            this.reject(err);
                        });
                    }
                }
                cur = cur.next;
            }
            this.leaveUnbinding();
        }
    }
    enterUnbinding() {
        ++this.unbindingStack;
    }
    leaveUnbinding() {
        if (--this.unbindingStack === 0) {
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
    addController(controller) {
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
                const def = CustomAttribute.getDefinition(this.viewModel.constructor);
                return def.name === name;
            }
            case 0 /* customElement */: {
                const def = CustomElement.getDefinition(this.viewModel.constructor);
                return def.name === name;
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
        this.context = null;
        this.location = null;
        this.viewFactory = null;
        if (this.viewModel !== null) {
            controllerLookup.delete(this.viewModel);
            this.viewModel = null;
        }
        this.viewModel = null;
        this.host = null;
        this.shadowRoot = null;
        this.root = null;
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
    getTargetAccessor(propertyName) {
        const { bindings } = this;
        if (bindings !== null) {
            const binding = bindings.find(b => b.targetProperty === propertyName);
            if (binding !== void 0) {
                return binding.targetObserver;
            }
        }
        return void 0;
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
        let name;
        let i = 0;
        let childrenDescription;
        for (; i < length; ++i) {
            name = childObserverNames[i];
            if (observers[name] == void 0) {
                childrenDescription = childrenObservers[name];
                observers[name] = new ChildrenObserver(controller, instance, name, childrenDescription.callback, childrenDescription.query, childrenDescription.filter, childrenDescription.map, childrenDescription.options);
            }
        }
    }
}
const AccessScopeAst = {
    map: new Map(),
    for(key) {
        let ast = AccessScopeAst.map.get(key);
        if (ast == null) {
            ast = new AccessScopeExpression(key, 0);
            AccessScopeAst.map.set(key, ast);
        }
        return ast;
    },
};
function createWatchers(controller, context, definition, instance) {
    const observerLocator = context.get(IObserverLocator);
    const expressionParser = context.get(IExpressionParser);
    const watches = definition.watches;
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
            throw new Error(`Invalid callback for @watch decorator: ${String(callback)}`);
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
                : AccessScopeAst.for(expression);
            controller.addBinding(new ExpressionWatcher(controller.scope, context, observerLocator, ast, callback));
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

const IAppRoot = DI.createInterface('IAppRoot');
const IWorkTracker = DI.createInterface('IWorkTracker', x => x.singleton(WorkTracker));
let WorkTracker = class WorkTracker {
    constructor(logger) {
        this.logger = logger;
        this.stack = 0;
        this.promise = null;
        this.resolve = null;
        this.logger = logger.scopeTo('WorkTracker');
    }
    start() {
        this.logger.trace(`start(stack:${this.stack})`);
        ++this.stack;
    }
    finish() {
        this.logger.trace(`finish(stack:${this.stack})`);
        if (--this.stack === 0) {
            const resolve = this.resolve;
            if (resolve !== null) {
                this.resolve = this.promise = null;
                resolve();
            }
        }
    }
    wait() {
        this.logger.trace(`wait(stack:${this.stack})`);
        if (this.promise === null) {
            if (this.stack === 0) {
                return Promise.resolve();
            }
            this.promise = new Promise(resolve => {
                this.resolve = resolve;
            });
        }
        return this.promise;
    }
};
WorkTracker = __decorate([
    __param(0, ILogger)
], WorkTracker);
class AppRoot {
    constructor(config, platform, container, rootProvider, enhance = false) {
        this.config = config;
        this.platform = platform;
        this.container = container;
        this.controller = (void 0);
        this.hydratePromise = void 0;
        this.host = config.host;
        this.work = container.get(IWorkTracker);
        rootProvider.prepare(this);
        if (container.has(INode, false) && container.get(INode) !== config.host) {
            this.container = container.createChild();
        }
        this.container.register(Registration.instance(INode, config.host));
        if (enhance) {
            const component = config.component;
            this.enhanceDefinition = CustomElement.getDefinition(CustomElement.isType(component)
                ? CustomElement.define({ ...CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
                : CustomElement.define({ name: (void 0), template: this.host, enhance: true }));
        }
        this.hydratePromise = onResolve(this.runAppTasks('beforeCreate'), () => {
            const instance = CustomElement.isType(config.component)
                ? this.container.get(config.component)
                : config.component;
            const controller = (this.controller = Controller.forCustomElement(this, container, instance, this.host, null, 0 /* none */, false, this.enhanceDefinition));
            controller.hydrateCustomElement(container, null);
            return onResolve(this.runAppTasks('hydrating'), () => {
                controller.hydrate(null);
                return onResolve(this.runAppTasks('hydrated'), () => {
                    controller.hydrateChildren();
                    this.hydratePromise = void 0;
                });
            });
        });
    }
    activate() {
        return onResolve(this.hydratePromise, () => {
            return onResolve(this.runAppTasks('beforeActivate'), () => {
                return onResolve(this.controller.activate(this.controller, null, 2 /* fromBind */, void 0), () => {
                    return this.runAppTasks('afterActivate');
                });
            });
        });
    }
    deactivate() {
        return onResolve(this.runAppTasks('beforeDeactivate'), () => {
            return onResolve(this.controller.deactivate(this.controller, null, 0 /* none */), () => {
                return this.runAppTasks('afterDeactivate');
            });
        });
    }
    /** @internal */
    runAppTasks(slot) {
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
        const targets = this.targets = Array(ii);
        while (i < ii) {
            // eagerly convert all markers to RenderLocations (otherwise the renderer
            // will do it anyway) and store them in the target list (since the comments
            // can't be queried)
            const target = targetNodeList[i];
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
        i = 0;
        ii = childNodeList.length;
        const childNodes = this.childNodes = Array(ii);
        while (i < ii) {
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
                const end = this.lastChild;
                let next;
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
            const end = this.lastChild;
            let next;
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
            const end = this.lastChild;
            let next;
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
        this.$hostScope = null;
        this.handler = null;
    }
    callSource(event) {
        const overrideContext = this.$scope.overrideContext;
        overrideContext.$event = event;
        const result = this.sourceExpression.evaluate(8 /* mustEvaluate */, this.$scope, this.$hostScope, this.locator, null);
        Reflect.deleteProperty(overrideContext, '$event');
        if (result !== true && this.preventDefault) {
            event.preventDefault();
        }
        return result;
    }
    handleEvent(event) {
        this.interceptor.callSource(event);
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.$hostScope = hostScope;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        if (this.delegationStrategy === DelegationStrategy.none) {
            this.target.addEventListener(this.targetEvent, this);
        }
        else {
            const eventTarget = this.locator.get(IEventTarget);
            this.handler = this.eventDelegator.addEventListener(eventTarget, this.target, this.targetEvent, this, options[this.delegationStrategy]);
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
            sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
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
    observeProperty(obj, propertyName) {
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
    constructor(publisher, eventName, options = defaultOptions) {
        this.publisher = publisher;
        this.eventName = eventName;
        this.options = options;
        this.count = 0;
        this.captureLookups = new Map();
        this.bubbleLookups = new Map();
    }
    increment() {
        if (++this.count === 1) {
            this.publisher.addEventListener(this.eventName, this, this.options);
        }
    }
    decrement() {
        if (--this.count === 0) {
            this.publisher.removeEventListener(this.eventName, this, this.options);
        }
    }
    dispose() {
        if (this.count > 0) {
            this.count = 0;
            this.publisher.removeEventListener(this.eventName, this, this.options);
        }
        this.captureLookups.clear();
        this.bubbleLookups.clear();
    }
    /** @internal */
    getLookup(target) {
        const lookups = this.options.capture === true ? this.captureLookups : this.bubbleLookups;
        let lookup = lookups.get(target);
        if (lookup === void 0) {
            lookups.set(target, lookup = Object.create(null));
        }
        return lookup;
    }
    /** @internal */
    handleEvent(event) {
        const lookups = this.options.capture === true ? this.captureLookups : this.bubbleLookups;
        const path = event.composedPath();
        if (this.options.capture === true) {
            path.reverse();
        }
        for (const target of path) {
            const lookup = lookups.get(target);
            if (lookup === void 0) {
                continue;
            }
            const listener = lookup[this.eventName];
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
    constructor(tracker, lookup, eventName, callback) {
        this.tracker = tracker;
        this.lookup = lookup;
        this.eventName = eventName;
        tracker.increment();
        lookup[eventName] = callback;
    }
    dispose() {
        this.tracker.decrement();
        this.lookup[this.eventName] = void 0;
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
        for (const event of this.config.events) {
            node.addEventListener(event, callbackOrListener);
        }
    }
    dispose() {
        const { target, handler } = this;
        if (target !== null && handler !== null) {
            for (const event of this.config.events) {
                target.removeEventListener(event, handler);
            }
        }
        this.target = this.handler = null;
    }
}
const IEventDelegator = DI.createInterface('IEventDelegator', x => x.singleton(EventDelegator));
class EventDelegator {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        this.trackerMaps = Object.create(null);
    }
    addEventListener(publisher, target, eventName, listener, options) {
        var _a;
        var _b;
        const trackerMap = (_a = (_b = this.trackerMaps)[eventName]) !== null && _a !== void 0 ? _a : (_b[eventName] = new Map());
        let tracker = trackerMap.get(publisher);
        if (tracker === void 0) {
            trackerMap.set(publisher, tracker = new ListenerTracker(publisher, eventName, options));
        }
        return new DelegateSubscription(tracker, tracker.getLookup(target), eventName, listener);
    }
    dispose() {
        for (const eventName in this.trackerMaps) {
            const trackerMap = this.trackerMaps[eventName];
            for (const tracker of trackerMap.values()) {
                tracker.dispose();
            }
            trackerMap.clear();
        }
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
    constructor(res, alias, instructions, slotInfo) {
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
        this.slotInfo = slotInfo;
    }
    get type() { return "ra" /* hydrateElement */; }
}
class HydrateAttributeInstruction {
    constructor(res, alias, instructions) {
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
    }
    get type() { return "rb" /* hydrateAttribute */; }
}
class HydrateTemplateController {
    constructor(def, res, alias, instructions) {
        this.def = def;
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
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
    constructor(from) {
        this.from = from;
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
function getTarget$1(potentialTarget) {
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
            throw new Error('Not supported API');
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
                throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
            }
            return ceController.viewModel;
        }
    }
}
let SetPropertyRenderer = 
/** @internal */
class SetPropertyRenderer {
    render(flags, context, controller, target, instruction) {
        const obj = getTarget$1(target);
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
    render(flags, context, controller, target, instruction) {
        var _a;
        let viewFactory;
        const slotInfo = instruction.slotInfo;
        if (slotInfo !== null) {
            const projectionCtx = slotInfo.projectionContext;
            viewFactory = getRenderContext(projectionCtx.content, context).getViewFactory(void 0, slotInfo.type, projectionCtx.scope);
        }
        const targetedProjections = context.getProjectionFor(instruction);
        const factory = context.getComponentFactory(
        /* parentController */ controller, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ viewFactory, 
        /* location         */ target, 
        /* auSlotsInfo      */ new AuSlotsInfo(Object.keys((_a = targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.projections) !== null && _a !== void 0 ? _a : {})));
        const key = CustomElement.keyFrom(instruction.res);
        const component = factory.createComponent(key);
        const childController = Controller.forCustomElement(
        /* root                */ controller.root, 
        /* container           */ context, 
        /* viewModel           */ component, 
        /* host                */ target, 
        /* targetedProjections */ targetedProjections, 
        /* flags               */ flags);
        flags = childController.flags;
        setRef(target, key, childController);
        context.renderChildren(
        /* flags        */ flags, 
        /* instructions */ instruction.instructions, 
        /* controller   */ controller, 
        /* target       */ childController);
        controller.addController(childController);
        factory.dispose();
    }
};
CustomElementRenderer = __decorate([
    renderer("ra" /* hydrateElement */)
    /** @internal */
], CustomElementRenderer);
let CustomAttributeRenderer = 
/** @internal */
class CustomAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        const factory = context.getComponentFactory(
        /* parentController */ controller, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ void 0, 
        /* location         */ void 0);
        const key = CustomAttribute.keyFrom(instruction.res);
        const component = factory.createComponent(key);
        const childController = Controller.forCustomAttribute(
        /* root      */ controller.root, 
        /* container */ context, 
        /* viewModel */ component, 
        /* host      */ target, 
        /* flags     */ flags);
        setRef(target, key, childController);
        context.renderChildren(
        /* flags        */ flags, 
        /* instructions */ instruction.instructions, 
        /* controller   */ controller, 
        /* target       */ childController);
        controller.addController(childController);
        factory.dispose();
    }
};
CustomAttributeRenderer = __decorate([
    renderer("rb" /* hydrateAttribute */)
    /** @internal */
], CustomAttributeRenderer);
let TemplateControllerRenderer = 
/** @internal */
class TemplateControllerRenderer {
    render(flags, context, controller, target, instruction) {
        var _a;
        const viewFactory = getRenderContext(instruction.def, context).getViewFactory();
        const renderLocation = convertToRenderLocation(target);
        const componentFactory = context.getComponentFactory(
        /* parentController */ controller, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ viewFactory, 
        /* location         */ renderLocation);
        const key = CustomAttribute.keyFrom(instruction.res);
        const component = componentFactory.createComponent(key);
        const childController = Controller.forCustomAttribute(
        /* root      */ controller.root, 
        /* container */ context, 
        /* viewModel */ component, 
        /* host      */ target, 
        /* flags     */ flags);
        setRef(renderLocation, key, childController);
        (_a = component.link) === null || _a === void 0 ? void 0 : _a.call(component, flags, context, controller, childController, target, instruction);
        context.renderChildren(
        /* flags        */ flags, 
        /* instructions */ instruction.instructions, 
        /* controller   */ controller, 
        /* target       */ childController);
        controller.addController(childController);
        componentFactory.dispose();
    }
};
TemplateControllerRenderer = __decorate([
    renderer("rc" /* hydrateTemplateController */)
    /** @internal */
], TemplateControllerRenderer);
let LetElementRenderer = 
/** @internal */
class LetElementRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, context, controller, target, instruction) {
        target.remove();
        const childInstructions = instruction.instructions;
        const toBindingContext = instruction.toBindingContext;
        let childInstruction;
        let expr;
        let binding;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            childInstruction = childInstructions[i];
            expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
            binding = applyBindingBehavior(new LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext), expr, context);
            controller.addBinding(binding);
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
        this.observerLocator = observerLocator;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
        const binding = applyBindingBehavior(new CallBinding(expr, getTarget$1(target), instruction.to, this.observerLocator, context), expr, context);
        controller.addBinding(binding);
    }
};
CallBindingRenderer = __decorate([
    renderer("rh" /* callBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], CallBindingRenderer);
let RefBindingRenderer = 
/** @internal */
class RefBindingRenderer {
    constructor(parser) {
        this.parser = parser;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
        const binding = applyBindingBehavior(new RefBinding(expr, getRefTarget(target, instruction.to), context), expr, context);
        controller.addBinding(binding);
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
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        const binding = new InterpolationBinding(this.observerLocator, expr, getTarget$1(target), instruction.to, BindingMode.toView, context, this.platform.domWriteQueue);
        const partBindings = binding.partBindings;
        const ii = partBindings.length;
        let i = 0;
        let partBinding;
        for (; ii > i; ++i) {
            partBinding = partBindings[i];
            partBindings[i] = applyBindingBehavior(partBinding, partBinding.sourceExpression, context);
        }
        controller.addBinding(binding);
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
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
        const binding = applyBindingBehavior(new PropertyBinding(expr, getTarget$1(target), instruction.to, instruction.mode, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
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
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
        const binding = applyBindingBehavior(new PropertyBinding(expr, getTarget$1(target), instruction.to, BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
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
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const next = target.nextSibling;
        const parent = target.parentNode;
        const doc = this.platform.document;
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        const staticParts = expr.parts;
        const dynamicParts = expr.expressions;
        const ii = dynamicParts.length;
        let i = 0;
        let text = staticParts[0];
        if (text !== '') {
            parent.insertBefore(doc.createTextNode(text), next);
        }
        for (; ii > i; ++i) {
            // each of the dynamic expression of an interpolation
            // will be mapped to a ContentBinding
            controller.addBinding(applyBindingBehavior(new ContentBinding(dynamicParts[i], 
            // using a text node instead of comment, as a mean to:
            // support seamless transition between a html node, or a text
            // reduce the noise in the template, caused by html comment
            parent.insertBefore(doc.createTextNode(''), next), context, this.observerLocator, this.platform), dynamicParts[i], context));
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
    constructor(parser, eventDelegator) {
        this.parser = parser;
        this.eventDelegator = eventDelegator;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
        const binding = applyBindingBehavior(new Listener(context.platform, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, context), expr, context);
        controller.addBinding(binding);
    }
};
ListenerBindingRenderer = __decorate([
    renderer("hb" /* listenerBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IEventDelegator)
], ListenerBindingRenderer);
let SetAttributeRenderer = 
/** @internal */
class SetAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        target.setAttribute(instruction.to, instruction.value);
    }
};
SetAttributeRenderer = __decorate([
    renderer("he" /* setAttribute */)
    /** @internal */
], SetAttributeRenderer);
let SetClassAttributeRenderer = class SetClassAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        addClasses(target.classList, instruction.value);
    }
};
SetClassAttributeRenderer = __decorate([
    renderer("hf" /* setClassAttribute */)
], SetClassAttributeRenderer);
let SetStyleAttributeRenderer = class SetStyleAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        target.style.cssText += instruction.value;
    }
};
SetStyleAttributeRenderer = __decorate([
    renderer("hg" /* setStyleAttribute */)
], SetStyleAttributeRenderer);
let StylePropertyBindingRenderer = 
/** @internal */
class StylePropertyBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = applyBindingBehavior(new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
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
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = applyBindingBehavior(new AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, BindingMode.toView, this.observerLocator, context), expr, context);
        controller.addBinding(binding);
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

var SymbolFlags;
(function (SymbolFlags) {
    SymbolFlags[SymbolFlags["type"] = 1023] = "type";
    SymbolFlags[SymbolFlags["isTemplateController"] = 1] = "isTemplateController";
    SymbolFlags[SymbolFlags["isProjection"] = 2] = "isProjection";
    SymbolFlags[SymbolFlags["isCustomAttribute"] = 4] = "isCustomAttribute";
    SymbolFlags[SymbolFlags["isPlainAttribute"] = 8] = "isPlainAttribute";
    SymbolFlags[SymbolFlags["isCustomElement"] = 16] = "isCustomElement";
    SymbolFlags[SymbolFlags["isLetElement"] = 32] = "isLetElement";
    SymbolFlags[SymbolFlags["isPlainElement"] = 64] = "isPlainElement";
    SymbolFlags[SymbolFlags["isText"] = 128] = "isText";
    SymbolFlags[SymbolFlags["isBinding"] = 256] = "isBinding";
    SymbolFlags[SymbolFlags["isAuSlot"] = 512] = "isAuSlot";
    SymbolFlags[SymbolFlags["hasMarker"] = 1024] = "hasMarker";
    SymbolFlags[SymbolFlags["hasTemplate"] = 2048] = "hasTemplate";
    SymbolFlags[SymbolFlags["hasAttributes"] = 4096] = "hasAttributes";
    SymbolFlags[SymbolFlags["hasBindings"] = 8192] = "hasBindings";
    SymbolFlags[SymbolFlags["hasChildNodes"] = 16384] = "hasChildNodes";
    SymbolFlags[SymbolFlags["hasProjections"] = 32768] = "hasProjections";
})(SymbolFlags || (SymbolFlags = {}));
function createMarker(p) {
    const marker = p.document.createElement('au-m');
    marker.className = 'au';
    return marker;
}
/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
class TemplateControllerSymbol {
    constructor(p, syntax, info, res = info.name) {
        this.syntax = syntax;
        this.info = info;
        this.res = res;
        this.flags = 1 /* isTemplateController */ | 1024 /* hasMarker */;
        this.physicalNode = null;
        this.template = null;
        this.templateController = null;
        this._bindings = null;
        this.marker = createMarker(p);
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
}
class ProjectionSymbol {
    constructor(name, template) {
        this.name = name;
        this.template = template;
        this.flags = 2 /* isProjection */;
    }
}
/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
class CustomAttributeSymbol {
    constructor(syntax, info, res = info.name) {
        this.syntax = syntax;
        this.info = info;
        this.res = res;
        this.flags = 4 /* isCustomAttribute */;
        this._bindings = null;
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
}
/**
 * An attribute, with either a binding command or an interpolation, whose target is the html
 * attribute of the element.
 *
 * This will never target a bindable property of a custom attribute or element;
 */
class PlainAttributeSymbol {
    constructor(syntax, command, expression) {
        this.syntax = syntax;
        this.command = command;
        this.expression = expression;
        this.flags = 8 /* isPlainAttribute */;
    }
}
/**
 * Either an attribute on an custom element that maps to a declared bindable property of that element,
 * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
 * value of a custom attribute with multiple bindings usage.
 *
 * This will always target a bindable property of a custom attribute or element;
 */
class BindingSymbol {
    constructor(command, bindable, expression, rawValue, target) {
        this.command = command;
        this.bindable = bindable;
        this.expression = expression;
        this.rawValue = rawValue;
        this.target = target;
        this.flags = 256 /* isBinding */;
    }
}
/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
class CustomElementSymbol {
    constructor(p, physicalNode, info, res = info.name, bindables = info.bindables) {
        this.physicalNode = physicalNode;
        this.info = info;
        this.res = res;
        this.bindables = bindables;
        this.flags = 16 /* isCustomElement */;
        this.isTarget = true;
        this.templateController = null;
        this._customAttributes = null;
        this._plainAttributes = null;
        this._bindings = null;
        this._childNodes = null;
        this._projections = null;
        if (info.containerless) {
            this.isContainerless = true;
            this.marker = createMarker(p);
            this.flags |= 1024 /* hasMarker */;
        }
        else {
            this.isContainerless = false;
            this.marker = null;
        }
    }
    get customAttributes() {
        if (this._customAttributes === null) {
            this._customAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes === null) {
            this._plainAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
    get childNodes() {
        if (this._childNodes === null) {
            this._childNodes = [];
            this.flags |= 16384 /* hasChildNodes */;
        }
        return this._childNodes;
    }
    get projections() {
        if (this._projections === null) {
            this._projections = [];
            this.flags |= 32768 /* hasProjections */;
        }
        return this._projections;
    }
}
class LetElementSymbol {
    constructor(p, physicalNode, marker = createMarker(p)) {
        this.physicalNode = physicalNode;
        this.marker = marker;
        this.flags = 32 /* isLetElement */ | 1024 /* hasMarker */;
        this.toBindingContext = false;
        this._bindings = null;
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
}
/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
class PlainElementSymbol {
    constructor(physicalNode) {
        this.physicalNode = physicalNode;
        this.flags = 64 /* isPlainElement */;
        this.isTarget = false;
        this.templateController = null;
        this.hasSlots = false;
        this._customAttributes = null;
        this._plainAttributes = null;
        this._childNodes = null;
    }
    get customAttributes() {
        if (this._customAttributes === null) {
            this._customAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes === null) {
            this._plainAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get childNodes() {
        if (this._childNodes === null) {
            this._childNodes = [];
            this.flags |= 16384 /* hasChildNodes */;
        }
        return this._childNodes;
    }
}
/**
 * A standalone text node that has an interpolation.
 */
class TextSymbol {
    constructor(p, physicalNode, interpolation, marker = createMarker(p)) {
        this.physicalNode = physicalNode;
        this.interpolation = interpolation;
        this.marker = marker;
        this.flags = 128 /* isText */ | 1024 /* hasMarker */;
    }
}
/**
 * A pre-processed piece of information about a defined bindable property on a custom
 * element or attribute, optimized for consumption by the template compiler.
 */
class BindableInfo {
    constructor(
    /**
     * The pre-processed *property* (not attribute) name of the bindable, which is
     * (in order of priority):
     *
     * 1. The `property` from the description (if defined)
     * 2. The name of the property of the bindable itself
     */
    propName, 
    /**
     * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
     *
     * 1. The `mode` from the bindable (if defined and not bindingMode.default)
     * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
     * 3. `bindingMode.toView`
     */
    mode) {
        this.propName = propName;
        this.mode = mode;
    }
}
const elementInfoLookup = new WeakMap();
/**
 * Pre-processed information about a custom element resource, optimized
 * for consumption by the template compiler.
 */
class ElementInfo {
    constructor(name, alias, containerless) {
        this.name = name;
        this.alias = alias;
        this.containerless = containerless;
        /**
         * A lookup of the bindables of this element, indexed by the (pre-processed)
         * attribute names as they would be found in parsed markup.
         */
        this.bindables = Object.create(null);
    }
    static from(def, alias) {
        if (def === null) {
            return null;
        }
        let rec = elementInfoLookup.get(def);
        if (rec === void 0) {
            elementInfoLookup.set(def, rec = Object.create(null));
        }
        let info = rec[alias];
        if (info === void 0) {
            info = rec[alias] = new ElementInfo(def.name, alias === def.name ? void 0 : alias, def.containerless);
            const bindables = def.bindables;
            const defaultBindingMode = BindingMode.toView;
            let bindable;
            let prop;
            let attr;
            let mode;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                // explicitly provided attribute name has priority over the derived implicit attribute name
                if (bindable.attribute !== void 0) {
                    attr = bindable.attribute;
                }
                else {
                    // derive the attribute name from the resolved property name
                    attr = kebabCase(prop);
                }
                if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                info.bindables[attr] = new BindableInfo(prop, mode);
            }
        }
        return info;
    }
}
const attrInfoLookup = new WeakMap();
/**
 * Pre-processed information about a custom attribute resource, optimized
 * for consumption by the template compiler.
 */
class AttrInfo {
    constructor(name, alias, isTemplateController, noMultiBindings) {
        this.name = name;
        this.alias = alias;
        this.isTemplateController = isTemplateController;
        this.noMultiBindings = noMultiBindings;
        /**
         * A lookup of the bindables of this attribute, indexed by the (pre-processed)
         * bindable names as they would be found in the attribute value.
         *
         * Only applicable to multi attribute bindings (semicolon-separated).
         */
        this.bindables = Object.create(null);
        /**
         * The single or first bindable of this attribute, or a default 'value'
         * bindable if no bindables were defined on the attribute.
         *
         * Only applicable to single attribute bindings (where the attribute value
         * contains no semicolons)
         */
        this.bindable = null;
    }
    static from(def, alias) {
        if (def === null) {
            return null;
        }
        let rec = attrInfoLookup.get(def);
        if (rec === void 0) {
            attrInfoLookup.set(def, rec = Object.create(null));
        }
        let info = rec[alias];
        if (info === void 0) {
            info = rec[alias] = new AttrInfo(def.name, alias === def.name ? void 0 : alias, def.isTemplateController, def.noMultiBindings);
            const bindables = def.bindables;
            const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== BindingMode.default
                ? def.defaultBindingMode
                : BindingMode.toView;
            let bindable;
            let prop;
            let mode;
            let hasPrimary = false;
            let isPrimary = false;
            let bindableInfo;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                isPrimary = bindable.primary === true;
                bindableInfo = info.bindables[prop] = new BindableInfo(prop, mode);
                if (isPrimary) {
                    if (hasPrimary) {
                        throw new Error('primary already exists');
                    }
                    hasPrimary = true;
                    info.bindable = bindableInfo;
                }
                // set to first bindable by convention
                if (info.bindable === null) {
                    info.bindable = bindableInfo;
                }
            }
            // if no bindables are present, default to "value"
            if (info.bindable === null) {
                info.bindable = new BindableInfo('value', defaultBindingMode);
            }
        }
        return info;
    }
}

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
        return new BindingCommandDefinition(Type, firstDefined(BindingCommand.getAnnotation(Type, 'name'), name), mergeArrays(BindingCommand.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), BindingCommand.keyFrom(name), firstDefined(BindingCommand.getAnnotation(Type, 'type'), def.type, Type.type, null));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.singleton(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, BindingCommand, key, container);
    }
}
const BindingCommand = {
    name: Protocol.resource.keyFor('binding-command'),
    keyFrom(name) {
        return `${BindingCommand.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(BindingCommand.name, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingCommandDefinition.create(nameOrDef, Type);
        Metadata.define(BindingCommand.name, definition, definition.Type);
        Metadata.define(BindingCommand.name, definition, definition);
        Protocol.resource.appendTo(Type, BindingCommand.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(BindingCommand.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
};
function getTarget(binding, makeCamelCase) {
    if (binding.flags & 256 /* isBinding */) {
        return binding.bindable.propName;
    }
    else if (makeCamelCase) {
        return camelCase(binding.syntax.target);
    }
    else {
        return binding.syntax.target;
    }
}
let OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor() {
        this.bindingType = 49 /* OneTimeCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.oneTime);
    }
};
OneTimeBindingCommand = __decorate([
    bindingCommand('one-time')
], OneTimeBindingCommand);
let ToViewBindingCommand = class ToViewBindingCommand {
    constructor() {
        this.bindingType = 50 /* ToViewCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.toView);
    }
};
ToViewBindingCommand = __decorate([
    bindingCommand('to-view')
], ToViewBindingCommand);
let FromViewBindingCommand = class FromViewBindingCommand {
    constructor() {
        this.bindingType = 51 /* FromViewCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.fromView);
    }
};
FromViewBindingCommand = __decorate([
    bindingCommand('from-view')
], FromViewBindingCommand);
let TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor() {
        this.bindingType = 52 /* TwoWayCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.twoWay);
    }
};
TwoWayBindingCommand = __decorate([
    bindingCommand('two-way')
], TwoWayBindingCommand);
let DefaultBindingCommand = class DefaultBindingCommand {
    constructor() {
        this.bindingType = 53 /* BindCommand */;
    }
    compile(binding) {
        let mode = BindingMode.default;
        if (binding instanceof BindingSymbol) {
            mode = binding.bindable.mode;
        }
        else {
            const command = binding.syntax.command;
            switch (command) {
                case 'bind':
                case 'to-view':
                    mode = BindingMode.toView;
                    break;
                case 'one-time':
                    mode = BindingMode.oneTime;
                    break;
                case 'from-view':
                    mode = BindingMode.fromView;
                    break;
                case 'two-way':
                    mode = BindingMode.twoWay;
                    break;
            }
        }
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), mode === BindingMode.default ? BindingMode.toView : mode);
    }
};
DefaultBindingCommand = __decorate([
    bindingCommand('bind')
], DefaultBindingCommand);
let CallBindingCommand = class CallBindingCommand {
    constructor() {
        this.bindingType = 153 /* CallCommand */;
    }
    compile(binding) {
        return new CallBindingInstruction(binding.expression, getTarget(binding, true));
    }
};
CallBindingCommand = __decorate([
    bindingCommand('call')
], CallBindingCommand);
let ForBindingCommand = class ForBindingCommand {
    constructor() {
        this.bindingType = 539 /* ForCommand */;
    }
    compile(binding) {
        return new IteratorBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
ForBindingCommand = __decorate([
    bindingCommand('for')
], ForBindingCommand);
let TriggerBindingCommand = class TriggerBindingCommand {
    constructor() {
        this.bindingType = 4182 /* TriggerCommand */;
    }
    compile(binding) {
        return new ListenerBindingInstruction(binding.expression, getTarget(binding, false), true, DelegationStrategy.none);
    }
};
TriggerBindingCommand = __decorate([
    bindingCommand('trigger')
], TriggerBindingCommand);
let DelegateBindingCommand = class DelegateBindingCommand {
    constructor() {
        this.bindingType = 4184 /* DelegateCommand */;
    }
    compile(binding) {
        return new ListenerBindingInstruction(binding.expression, getTarget(binding, false), false, DelegationStrategy.bubbling);
    }
};
DelegateBindingCommand = __decorate([
    bindingCommand('delegate')
], DelegateBindingCommand);
let CaptureBindingCommand = class CaptureBindingCommand {
    constructor() {
        this.bindingType = 4183 /* CaptureCommand */;
    }
    compile(binding) {
        return new ListenerBindingInstruction(binding.expression, getTarget(binding, false), false, DelegationStrategy.capturing);
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
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        const target = getTarget(binding, false);
        return new AttributeBindingInstruction(target, binding.expression, target);
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
    compile(binding) {
        return new AttributeBindingInstruction('style', binding.expression, getTarget(binding, false));
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
    compile(binding) {
        return new AttributeBindingInstruction('class', binding.expression, getTarget(binding, false));
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
    compile(binding) {
        return new RefBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
RefBindingCommand = __decorate([
    bindingCommand('ref')
], RefBindingCommand);

const IsDataAttribute = createLookup();
function isDataAttribute(obj, key, svgAnalyzer) {
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
}
function createLookup() {
    return Object.create(null);
}

const ISVGAnalyzer = DI.createInterface('ISVGAnalyzer', x => x.singleton(NoopSVGAnalyzer));
class NoopSVGAnalyzer {
    isStandardSvgAttribute(node, attributeName) {
        return false;
    }
}
function o(keys) {
    const lookup = Object.create(null);
    for (const key of keys) {
        lookup[key] = true;
    }
    return lookup;
}
class SVGAnalyzer {
    constructor(platform) {
        this.svgElements = Object.assign(Object.create(null), {
            'a': o(['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'target', 'transform', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space']),
            'altGlyph': o(['class', 'dx', 'dy', 'externalResourcesRequired', 'format', 'glyphRef', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y']),
            'altglyph': Object.create(null),
            'altGlyphDef': o(['id', 'xml:base', 'xml:lang', 'xml:space']),
            'altglyphdef': Object.create(null),
            'altGlyphItem': o(['id', 'xml:base', 'xml:lang', 'xml:space']),
            'altglyphitem': Object.create(null),
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
            'glyphref': Object.create(null),
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
        this.svgPresentationElements = o([
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
        this.svgPresentationAttributes = o([
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
            const svg = this.svgElements;
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
        return (this.svgPresentationElements[node.nodeName] === true && this.svgPresentationAttributes[attributeName] === true ||
            ((_a = this.svgElements[node.nodeName]) === null || _a === void 0 ? void 0 : _a[attributeName]) === true);
    }
}
/**
 * @internal
 */
SVGAnalyzer.inject = [IPlatform];

const IAttrSyntaxTransformer = DI
    .createInterface('IAttrSyntaxTransformer', x => x.singleton(AttrSyntaxTransformer));
class AttrSyntaxTransformer {
    constructor(svg) {
        this.svg = svg;
        /**
         * @internal
         */
        this.fns = [];
        /**
         * @internal
         */
        this.tagAttrMap = createLookup();
        /**
         * @internal
         */
        this.globalAttrMap = createLookup();
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
            targetAttrMapping = (_a = (_b = this.tagAttrMap)[tagName]) !== null && _a !== void 0 ? _a : (_b[tagName] = createLookup());
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
        const mapper = this.globalAttrMap;
        for (const attr in config) {
            if (mapper[attr] !== void 0) {
                throw createMappedError(attr, '*');
            }
            mapper[attr] = config[attr];
        }
    }
    /**
     * Add a given function to a list of fns that will be used
     * to check if `'bind'` command can be transformed to `'two-way'` command.
     *
     * If one of those functions in this lists returns true, the `'bind'` command
     * will be transformed into `'two-way'` command.
     *
     * The function will be called with 2 parameters:
     * - element: the element that the template compiler is currently working with
     * - property: the target property name
     */
    useTwoWay(fn) {
        this.fns.push(fn);
    }
    /**
     * @internal
     */
    transform(node, attrSyntax) {
        var _a, _b, _c;
        if (attrSyntax.command === 'bind' &&
            (
            // note: even though target could possibly be mapped to a different name
            // the final property name shouldn't affect the two way transformation
            // as they both should work with original source attribute name
            shouldDefaultToTwoWay(node, attrSyntax.target) ||
                this.fns.length > 0 && this.fns.some(fn => fn(node, attrSyntax.target)))) {
            attrSyntax.command = 'two-way';
        }
        const attr = attrSyntax.target;
        attrSyntax.target = (_c = (_b = (_a = this.tagAttrMap[node.tagName]) === null || _a === void 0 ? void 0 : _a[attr]) !== null && _b !== void 0 ? _b : this.globalAttrMap[attr]) !== null && _c !== void 0 ? _c : (isDataAttribute(node, attr, this.svg)
            ? attr
            : camelCase(attr));
        // attrSyntax.target = this.map(node.tagName, attrSyntax.target);
    }
}
function shouldDefaultToTwoWay(element, attr) {
    switch (element.tagName) {
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

const invalidSurrogateAttribute = Object.assign(Object.create(null), {
    'id': true,
    'au-slot': true,
});
const attributesToIgnore = Object.assign(Object.create(null), {
    'as-element': true,
});
function hasInlineBindings(rawValue) {
    const len = rawValue.length;
    let ch = 0;
    for (let i = 0; i < len; ++i) {
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
    }
    return false;
}
function processInterpolationText(symbol) {
    const node = symbol.physicalNode;
    const parentNode = node.parentNode;
    while (node.nextSibling !== null && node.nextSibling.nodeType === 3 /* Text */) {
        parentNode.removeChild(node.nextSibling);
    }
    node.textContent = '';
    parentNode.insertBefore(symbol.marker, node);
}
function isTemplateControllerOf(proxy, manifest) {
    return proxy !== manifest;
}
/**
 * A (temporary) standalone function that purely does the DOM processing (lifting) related to template controllers.
 * It's a first refactoring step towards separating DOM parsing/binding from mutations.
 */
function processTemplateControllers(p, manifestProxy, manifest) {
    const manifestNode = manifest.physicalNode;
    let current = manifestProxy;
    let currentTemplate;
    while (isTemplateControllerOf(current, manifest)) {
        if (current.template === manifest) {
            // the DOM linkage is still in its original state here so we can safely assume the parentNode is non-null
            manifestNode.parentNode.replaceChild(current.marker, manifestNode);
            // if the manifest is a template element (e.g. <template repeat.for="...">) then we can skip one lift operation
            // and simply use the template directly, saving a bit of work
            if (manifestNode.nodeName === 'TEMPLATE') {
                current.physicalNode = manifestNode;
                // the template could safely stay without affecting anything visible, but let's keep the DOM tidy
                manifestNode.remove();
            }
            else {
                // the manifest is not a template element so we need to wrap it in one
                currentTemplate = current.physicalNode = p.document.createElement('template');
                currentTemplate.content.appendChild(manifestNode);
            }
        }
        else {
            currentTemplate = current.physicalNode = p.document.createElement('template');
            currentTemplate.content.appendChild(current.marker);
        }
        manifestNode.removeAttribute(current.syntax.rawName);
        current = current.template;
    }
}
// - on binding plain attribute, if there's interpolation
// the attribute itself should be removed completely
// otherwise, produce invalid output sometimes.
// e.g
// <input value=${value}>
//    without removing: `<input value="">
//    with removing: `<input>
// <circle cx=${x}>
//    without removing `<circle cx="">
//    with removing: `<circle>
//
// - custom attribute probably should be removed too
var AttrBindingSignal;
(function (AttrBindingSignal) {
    AttrBindingSignal[AttrBindingSignal["none"] = 0] = "none";
    AttrBindingSignal[AttrBindingSignal["remove"] = 1] = "remove";
})(AttrBindingSignal || (AttrBindingSignal = {}));
/**
 * TemplateBinder. Todo: describe goal of this class
 */
class TemplateBinder {
    constructor(platform, container, attrParser, exprParser, attrSyntaxTransformer) {
        this.platform = platform;
        this.container = container;
        this.attrParser = attrParser;
        this.exprParser = exprParser;
        this.attrSyntaxTransformer = attrSyntaxTransformer;
        this.commandLookup = Object.create(null);
    }
    bind(node) {
        const surrogate = new PlainElementSymbol(node);
        const attributes = node.attributes;
        let i = 0;
        let attr;
        let attrSyntax;
        let bindingCommand = null;
        let attrInfo = null;
        while (i < attributes.length) {
            attr = attributes[i];
            attrSyntax = this.attrParser.parse(attr.name, attr.value);
            if (invalidSurrogateAttribute[attrSyntax.target] === true) {
                throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
                // TODO: use reporter
            }
            bindingCommand = this.getBindingCommand(attrSyntax, true);
            if (bindingCommand === null || (bindingCommand.bindingType & 4096 /* IgnoreAttr */) === 0) {
                attrInfo = AttrInfo.from(this.container.find(CustomAttribute, attrSyntax.target), attrSyntax.target);
                if (attrInfo === null) {
                    // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                    // NOTE: on surrogate, we don't care about removing the attribute with interpolation
                    // as the element is not used (cloned)
                    this.bindPlainAttribute(
                    /* node       */ node, 
                    /* attrSyntax */ attrSyntax, 
                    /* attr       */ attr, 
                    /* surrogate  */ surrogate, 
                    /* manifest   */ surrogate);
                }
                else if (attrInfo.isTemplateController) {
                    throw new Error('Cannot have template controller on surrogate element.');
                    // TODO: use reporter
                }
                else {
                    this.bindCustomAttribute(
                    /* attrSyntax */ attrSyntax, 
                    /* attrInfo   */ attrInfo, 
                    /* command    */ bindingCommand, 
                    /* manifest   */ surrogate);
                }
            }
            else {
                // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                // NOTE: on surrogate, we don't care about removing the attribute with interpolation
                // as the element is not used (cloned)
                this.bindPlainAttribute(
                /* node       */ node, 
                /* attrSyntax */ attrSyntax, 
                /* attr       */ attr, 
                /* surrogate  */ surrogate, 
                /* manifest   */ surrogate);
            }
            ++i;
        }
        this.bindChildNodes(
        /* node               */ node, 
        /* surrogate          */ surrogate, 
        /* manifest           */ surrogate, 
        /* manifestRoot       */ null, 
        /* parentManifestRoot */ null);
        return surrogate;
    }
    bindManifest(parentManifest, node, surrogate, manifest, manifestRoot, parentManifestRoot) {
        var _a, _b, _c, _d;
        switch (node.nodeName) {
            case 'LET':
                // let cannot have children and has some different processing rules, so return early
                this.bindLetElement(
                /* parentManifest */ parentManifest, 
                /* node           */ node);
                return;
            case 'SLOT':
                surrogate.hasSlots = true;
                break;
        }
        let name = node.getAttribute('as-element');
        if (name === null) {
            name = node.nodeName.toLowerCase();
        }
        const isAuSlot = name === 'au-slot';
        const definition = this.container.find(CustomElement, name);
        const elementInfo = ElementInfo.from(definition, name);
        let compileChildren = true;
        if (elementInfo === null) {
            // there is no registered custom element with this name
            manifest = new PlainElementSymbol(node);
        }
        else {
            // it's a custom element so we set the manifestRoot as well (for storing replaces)
            compileChildren = ((_c = (_b = (_a = definition === null || definition === void 0 ? void 0 : definition.processContent) === null || _a === void 0 ? void 0 : _a.bind(definition.Type)) === null || _b === void 0 ? void 0 : _b(node, this.platform)) !== null && _c !== void 0 ? _c : true);
            parentManifestRoot = manifestRoot;
            const ceSymbol = new CustomElementSymbol(this.platform, node, elementInfo);
            if (isAuSlot) {
                ceSymbol.flags = 512 /* isAuSlot */;
                ceSymbol.slotName = (_d = node.getAttribute("name")) !== null && _d !== void 0 ? _d : "default";
            }
            manifestRoot = manifest = ceSymbol;
        }
        if (compileChildren) {
            // lifting operations done by template controllers and replaces effectively unlink the nodes, so start at the bottom
            this.bindChildNodes(
            /* node               */ node, 
            /* surrogate          */ surrogate, 
            /* manifest           */ manifest, 
            /* manifestRoot       */ manifestRoot, 
            /* parentManifestRoot */ parentManifestRoot);
        }
        // the parentManifest will receive either the direct child nodes, or the template controllers / replaces
        // wrapping them
        this.bindAttributes(
        /* node               */ node, 
        /* parentManifest     */ parentManifest, 
        /* surrogate          */ surrogate, 
        /* manifest           */ manifest, 
        /* manifestRoot       */ manifestRoot, 
        /* parentManifestRoot */ parentManifestRoot);
        if (manifestRoot === manifest && manifest.isContainerless) {
            node.parentNode.replaceChild(manifest.marker, node);
        }
        else if (manifest.isTarget) {
            node.classList.add('au');
        }
    }
    bindLetElement(parentManifest, node) {
        const symbol = new LetElementSymbol(this.platform, node);
        parentManifest.childNodes.push(symbol);
        const attributes = node.attributes;
        let i = 0;
        while (i < attributes.length) {
            const attr = attributes[i];
            if (attr.name === 'to-binding-context') {
                node.removeAttribute('to-binding-context');
                symbol.toBindingContext = true;
                continue;
            }
            const attrSyntax = this.attrParser.parse(attr.name, attr.value);
            const command = this.getBindingCommand(attrSyntax, false);
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
            const to = camelCase(attrSyntax.target);
            const info = new BindableInfo(to, BindingMode.toView);
            symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));
            ++i;
        }
        node.parentNode.replaceChild(symbol.marker, node);
    }
    bindAttributes(node, parentManifest, surrogate, manifest, manifestRoot, parentManifestRoot) {
        var _a, _b, _c;
        // This is the top-level symbol for the current depth.
        // If there are no template controllers or replaces, it is always the manifest itself.
        // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
        let manifestProxy = manifest;
        let previousController = (void 0);
        let currentController = (void 0);
        const attributes = node.attributes;
        let i = 0;
        let attr;
        let bindSignal;
        let attrSyntax;
        let bindingCommand = null;
        let attrInfo = null;
        while (i < attributes.length) {
            attr = attributes[i];
            ++i;
            if (attributesToIgnore[attr.name] === true) {
                continue;
            }
            attrSyntax = this.attrParser.parse(attr.name, attr.value);
            bindingCommand = this.getBindingCommand(attrSyntax, true);
            if (bindingCommand === null || (bindingCommand.bindingType & 4096 /* IgnoreAttr */) === 0) {
                attrInfo = AttrInfo.from(this.container.find(CustomAttribute, attrSyntax.target), attrSyntax.target);
                if (attrInfo === null) {
                    // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                    bindSignal = this.bindPlainAttribute(
                    /* node       */ node, 
                    /* attrSyntax */ attrSyntax, 
                    /* attr       */ attr, 
                    /* surrogate  */ surrogate, 
                    /* manifest   */ manifest);
                    if (bindSignal === 1 /* remove */) {
                        node.removeAttributeNode(attr);
                        --i;
                    }
                }
                else if (attrInfo.isTemplateController) {
                    // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
                    // so keep setting manifest.templateController to the latest template controller we find
                    currentController = manifest.templateController = this.declareTemplateController(
                    /* attrSyntax */ attrSyntax, 
                    /* attrInfo   */ attrInfo);
                    // the proxy and the manifest are only identical when we're at the first template controller (since the controller
                    // is assigned to the proxy), so this evaluates to true at most once per node
                    if (manifestProxy === manifest) {
                        currentController.template = manifest;
                        manifestProxy = currentController;
                    }
                    else {
                        currentController.templateController = previousController;
                        currentController.template = previousController.template;
                        previousController.template = currentController;
                    }
                    previousController = currentController;
                }
                else {
                    // a regular custom attribute
                    this.bindCustomAttribute(
                    /* attrSyntax */ attrSyntax, 
                    /* attrInfo   */ attrInfo, 
                    /* command    */ bindingCommand, 
                    /* manifest   */ manifest);
                }
            }
            else {
                // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                bindSignal = this.bindPlainAttribute(
                /* node       */ node, 
                /* attrSyntax */ attrSyntax, 
                /* attr       */ attr, 
                /* surrogate  */ surrogate, 
                /* manifest   */ manifest);
                if (bindSignal === 1 /* remove */) {
                    node.removeAttributeNode(attr);
                    --i;
                }
            }
        }
        if (node.tagName === 'INPUT') {
            const type = node.type;
            if (type === 'checkbox' || type === 'radio') {
                this.ensureAttributeOrder(manifest);
            }
        }
        let projection = node.getAttribute('au-slot');
        if (projection === '') {
            projection = 'default';
        }
        const hasProjection = projection !== null;
        if (hasProjection && isTemplateControllerOf(manifestProxy, manifest)) {
            // prevents <some-el au-slot TEMPLATE.CONTROLLER></some-el>.
            throw new Error(`Unsupported usage of [au-slot="${projection}"] along with a template controller (if, else, repeat.for etc.) found (example: <some-el au-slot if.bind="true"></some-el>).`);
            /**
             * TODO: prevent <template TEMPLATE.CONTROLLER><some-el au-slot></some-el></template>.
             * But there is not easy way for now, as the attribute binding is done after binding the child nodes.
             * This means by the time the template controller in the ancestor is processed, the projection is already registered.
             */
        }
        const parentName = (_b = (_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute('as-element')) !== null && _b !== void 0 ? _b : (_c = node.parentNode) === null || _c === void 0 ? void 0 : _c.nodeName.toLowerCase();
        if (hasProjection
            && (manifestRoot === null
                || parentName === void 0
                || this.container.find(CustomElement, parentName) === null)) {
            /**
             * Prevents the following cases:
             * - <template><div au-slot></div></template>
             * - <my-ce><div><div au-slot></div></div></my-ce>
             * - <my-ce><div au-slot="s1"><div au-slot="s2"></div></div></my-ce>
             */
            throw new Error(`Unsupported usage of [au-slot="${projection}"]. It seems that projection is attempted, but not for a custom element.`);
        }
        processTemplateControllers(this.platform, manifestProxy, manifest);
        const projectionOwner = manifest === manifestRoot ? parentManifestRoot : manifestRoot;
        if (!hasProjection || projectionOwner === null) {
            // the proxy is either the manifest itself or the outer-most controller; add it directly to the parent
            parentManifest.childNodes.push(manifestProxy);
        }
        else if (hasProjection) {
            projectionOwner.projections.push(new ProjectionSymbol(projection, manifestProxy));
            node.removeAttribute('au-slot');
            node.remove();
        }
    }
    // TODO: refactor to use render priority slots (this logic shouldn't be in the template binder)
    ensureAttributeOrder(manifest) {
        // swap the order of checked and model/value attribute, so that the required observers are prepared for checked-observer
        const attributes = manifest.plainAttributes;
        let modelOrValueIndex = void 0;
        let checkedIndex = void 0;
        let found = 0;
        for (let i = 0; i < attributes.length && found < 3; i++) {
            switch (attributes[i].syntax.target) {
                case 'model':
                case 'value':
                case 'matcher':
                    modelOrValueIndex = i;
                    found++;
                    break;
                case 'checked':
                    checkedIndex = i;
                    found++;
                    break;
            }
        }
        if (checkedIndex !== void 0 && modelOrValueIndex !== void 0 && checkedIndex < modelOrValueIndex) {
            [attributes[modelOrValueIndex], attributes[checkedIndex]] = [attributes[checkedIndex], attributes[modelOrValueIndex]];
        }
    }
    bindChildNodes(node, surrogate, manifest, manifestRoot, parentManifestRoot) {
        let childNode;
        if (node.nodeName === 'TEMPLATE') {
            childNode = node.content.firstChild;
        }
        else {
            childNode = node.firstChild;
        }
        let nextChild;
        while (childNode !== null) {
            switch (childNode.nodeType) {
                case 1 /* Element */:
                    nextChild = childNode.nextSibling;
                    this.bindManifest(
                    /* parentManifest     */ manifest, 
                    /* node               */ childNode, 
                    /* surrogate          */ surrogate, 
                    /* manifest           */ manifest, 
                    /* manifestRoot       */ manifestRoot, 
                    /* parentManifestRoot */ parentManifestRoot);
                    childNode = nextChild;
                    break;
                case 3 /* Text */:
                    childNode = this.bindText(
                    /* textNode */ childNode, 
                    /* manifest */ manifest).nextSibling;
                    break;
                case 4 /* CDATASection */:
                case 7 /* ProcessingInstruction */:
                case 8 /* Comment */:
                case 10 /* DocumentType */:
                    childNode = childNode.nextSibling;
                    break;
                case 9 /* Document */:
                case 11 /* DocumentFragment */:
                    childNode = childNode.firstChild;
            }
        }
    }
    bindText(textNode, manifest) {
        const interpolation = this.exprParser.parse(textNode.wholeText, 2048 /* Interpolation */);
        if (interpolation !== null) {
            const symbol = new TextSymbol(this.platform, textNode, interpolation);
            manifest.childNodes.push(symbol);
            processInterpolationText(symbol);
        }
        let next = textNode;
        while (next.nextSibling !== null && next.nextSibling.nodeType === 3 /* Text */) {
            next = next.nextSibling;
        }
        return next;
    }
    declareTemplateController(attrSyntax, attrInfo) {
        let symbol;
        const attrRawValue = attrSyntax.rawValue;
        const command = this.getBindingCommand(attrSyntax, false);
        // multi-bindings logic here is similar to (and explained in) bindCustomAttribute
        const isMultiBindings = attrInfo.noMultiBindings === false && command === null && hasInlineBindings(attrRawValue);
        if (isMultiBindings) {
            symbol = new TemplateControllerSymbol(this.platform, attrSyntax, attrInfo);
            this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
        }
        else {
            symbol = new TemplateControllerSymbol(this.platform, attrSyntax, attrInfo);
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrRawValue, bindingType);
            symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrRawValue, attrSyntax.target));
        }
        return symbol;
    }
    bindCustomAttribute(attrSyntax, attrInfo, command, manifest) {
        let symbol;
        const attrRawValue = attrSyntax.rawValue;
        // Custom attributes are always in multiple binding mode,
        // except when they can't be
        // When they cannot be:
        //        * has explicit configuration noMultiBindings: false
        //        * has binding command, ie: <div my-attr.bind="...">.
        //          In this scenario, the value of the custom attributes is required to be a valid expression
        //        * has no colon: ie: <div my-attr="abcd">
        //          In this scenario, it's simply invalid syntax. Consider style attribute rule-value pair: <div style="rule: ruleValue">
        const isMultiBindings = attrInfo.noMultiBindings === false && command === null && hasInlineBindings(attrRawValue);
        if (isMultiBindings) {
            // a multiple-bindings attribute usage (semicolon separated binding) is only valid without a binding command;
            // the binding commands must be declared in each of the property bindings
            symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
            this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
        }
        else {
            symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrRawValue, bindingType);
            symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrRawValue, attrSyntax.target));
        }
        manifest.customAttributes.push(symbol);
        manifest.isTarget = true;
    }
    bindMultiAttribute(symbol, attrInfo, value) {
        const bindables = attrInfo.bindables;
        const valueLength = value.length;
        let attrName = void 0;
        let attrValue = void 0;
        let start = 0;
        let ch = 0;
        for (let i = 0; i < valueLength; ++i) {
            ch = value.charCodeAt(i);
            if (ch === 92 /* Backslash */) {
                ++i;
                // Ignore whatever comes next because it's escaped
            }
            else if (ch === 58 /* Colon */) {
                attrName = value.slice(start, i);
                // Skip whitespace after colon
                while (value.charCodeAt(++i) <= 32 /* Space */)
                    ;
                start = i;
                for (; i < valueLength; ++i) {
                    ch = value.charCodeAt(i);
                    if (ch === 92 /* Backslash */) {
                        ++i;
                        // Ignore whatever comes next because it's escaped
                    }
                    else if (ch === 59 /* Semicolon */) {
                        attrValue = value.slice(start, i);
                        break;
                    }
                }
                if (attrValue === void 0) {
                    // No semicolon found, so just grab the rest of the value
                    attrValue = value.slice(start);
                }
                const attrSyntax = this.attrParser.parse(attrName, attrValue);
                const attrTarget = camelCase(attrSyntax.target);
                const command = this.getBindingCommand(attrSyntax, false);
                const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrValue, bindingType);
                let bindable = bindables[attrTarget];
                if (bindable === undefined) {
                    // everything in a multi-bindings expression must be used,
                    // so if it's not a bindable then we create one on the spot
                    bindable = bindables[attrTarget] = new BindableInfo(attrTarget, BindingMode.toView);
                }
                symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrValue, attrTarget));
                // Skip whitespace after semicolon
                while (i < valueLength && value.charCodeAt(++i) <= 32 /* Space */)
                    ;
                start = i;
                attrName = void 0;
                attrValue = void 0;
            }
        }
    }
    bindPlainAttribute(node, attrSyntax, attr, surrogate, manifest) {
        const attrTarget = attrSyntax.target;
        const attrRawValue = attrSyntax.rawValue;
        const command = this.getBindingCommand(attrSyntax, false);
        const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
        let isInterpolation = false;
        let expr;
        if ((manifest.flags & 16 /* isCustomElement */) > 0) {
            const bindable = manifest.bindables[attrTarget];
            if (bindable != null) {
                // if it looks like this
                // <my-el value.bind>
                // it means
                // <my-el value.bind="value">
                // this is a shortcut
                const realAttrValue = attrRawValue.length === 0
                    && (bindingType
                        & (53 /* BindCommand */
                            | 49 /* OneTimeCommand */
                            | 50 /* ToViewCommand */
                            | 52 /* TwoWayCommand */)) > 0
                    ? camelCase(attrTarget)
                    : attrRawValue;
                expr = this.exprParser.parse(realAttrValue, bindingType);
                // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
                // the template compiler will translate it to the correct instruction
                manifest.bindings.push(new BindingSymbol(command, bindable, expr, attrRawValue, attrTarget));
                isInterpolation = bindingType === 2048 /* Interpolation */ && expr != null;
                manifest.isTarget = true;
                return isInterpolation
                    ? 1 /* remove */
                    : 0 /* none */;
            }
        }
        // plain attribute, on a normal, or a custom element here
        // regardless, can process the same way
        expr = this.exprParser.parse(attrRawValue, bindingType);
        isInterpolation = bindingType === 2048 /* Interpolation */ && expr != null;
        if ((bindingType & 4096 /* IgnoreAttr */) === 0) {
            this.attrSyntaxTransformer.transform(node, attrSyntax);
        }
        if (expr != null) {
            // either a binding command, an interpolation, or a ref
            manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
            manifest.isTarget = true;
        }
        else if (manifest === surrogate) {
            // any attributes, even if they are plain (no command/interpolation etc), should be added if they
            // are on the surrogate element
            manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
        }
        return isInterpolation
            ? 1 /* remove */
            : 0 /* none */;
    }
    /**
     * Retrieve a binding command resource.
     *
     * @param name - The parsed `AttrSyntax`
     *
     * @returns An instance of the command if it exists, or `null` if it does not exist.
     */
    getBindingCommand(syntax, optional) {
        const name = syntax.command;
        if (name === null) {
            return null;
        }
        let result = this.commandLookup[name];
        if (result === void 0) {
            result = this.container.create(BindingCommand, name);
            if (result === null) {
                if (optional) {
                    return null;
                }
                throw new Error(`Unknown binding command: ${name}`);
            }
            this.commandLookup[name] = result;
        }
        return result;
    }
}

const ITemplateElementFactory = DI.createInterface('ITemplateElementFactory', x => x.singleton(TemplateElementFactory));
const markupCache = {};
let TemplateElementFactory = class TemplateElementFactory {
    constructor(p) {
        this.p = p;
        this.template = p.document.createElement('template');
    }
    createTemplate(input) {
        var _a;
        if (typeof input === 'string') {
            let result = markupCache[input];
            if (result === void 0) {
                const template = this.template;
                template.innerHTML = input;
                const node = template.content.firstElementChild;
                // if the input is either not wrapped in a template or there is more than one node,
                // return the whole template that wraps it/them (and create a new one for the next input)
                if (node == null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling != null) {
                    this.template = this.p.document.createElement('template');
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
};
TemplateElementFactory = __decorate([
    __param(0, IPlatform)
], TemplateElementFactory);

class CustomElementCompilationUnit {
    constructor(partialDefinition, surrogate, template) {
        this.partialDefinition = partialDefinition;
        this.surrogate = surrogate;
        this.template = template;
        this.instructions = [];
        this.surrogates = [];
        this.projectionsMap = new Map();
    }
    toDefinition() {
        const def = this.partialDefinition;
        return CustomElementDefinition.create({
            ...def,
            instructions: mergeArrays(def.instructions, this.instructions),
            surrogates: mergeArrays(def.surrogates, this.surrogates),
            template: this.template,
            needsCompile: false,
            hasSlots: this.surrogate.hasSlots,
            projectionsMap: this.projectionsMap,
        });
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
/**
 * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
 *
 * @internal
 */
let TemplateCompiler = class TemplateCompiler {
    constructor(factory, attrParser, exprParser, attrSyntaxModifier, logger, p) {
        this.factory = factory;
        this.attrParser = attrParser;
        this.exprParser = exprParser;
        this.attrSyntaxModifier = attrSyntaxModifier;
        this.p = p;
        this.logger = logger.scopeTo('TemplateCompiler');
    }
    get name() {
        return 'default';
    }
    static register(container) {
        return Registration.singleton(ITemplateCompiler, this).register(container);
    }
    compile(partialDefinition, context, targetedProjections) {
        const definition = CustomElementDefinition.getOrCreate(partialDefinition);
        if (definition.template === null || definition.template === void 0) {
            return definition;
        }
        const { attrParser, exprParser, attrSyntaxModifier, factory } = this;
        const p = context.get(IPlatform);
        const binder = new TemplateBinder(p, context, attrParser, exprParser, attrSyntaxModifier);
        const template = definition.enhance === true
            ? definition.template
            : factory.createTemplate(definition.template);
        processLocalTemplates(template, definition, context, p, this.logger);
        const surrogate = binder.bind(template);
        const compilation = this.compilation = new CustomElementCompilationUnit(definition, surrogate, template);
        const customAttributes = surrogate.customAttributes;
        const plainAttributes = surrogate.plainAttributes;
        const customAttributeLength = customAttributes.length;
        const plainAttributeLength = plainAttributes.length;
        if (customAttributeLength + plainAttributeLength > 0) {
            let offset = 0;
            for (let i = 0; customAttributeLength > i; ++i) {
                compilation.surrogates[offset] = this.compileCustomAttribute(customAttributes[i]);
                offset++;
            }
            for (let i = 0; i < plainAttributeLength; ++i) {
                compilation.surrogates[offset] = this.compilePlainAttribute(plainAttributes[i], true);
                offset++;
            }
        }
        this.compileChildNodes(surrogate, compilation.instructions, compilation.projectionsMap, targetedProjections);
        const compiledDefinition = compilation.toDefinition();
        this.compilation = null;
        return compiledDefinition;
    }
    compileChildNodes(parent, instructionRows, projections, targetedProjections) {
        if ((parent.flags & 16384 /* hasChildNodes */) > 0) {
            const childNodes = parent.childNodes;
            const ii = childNodes.length;
            let childNode;
            for (let i = 0; i < ii; ++i) {
                childNode = childNodes[i];
                if ((childNode.flags & 128 /* isText */) > 0) {
                    instructionRows.push([new TextBindingInstruction(childNode.interpolation)]);
                }
                else if ((childNode.flags & 32 /* isLetElement */) > 0) {
                    const bindings = childNode.bindings;
                    const instructions = [];
                    let binding;
                    const jj = bindings.length;
                    for (let j = 0; j < jj; ++j) {
                        binding = bindings[j];
                        instructions[j] = new LetBindingInstruction(binding.expression, binding.target);
                    }
                    instructionRows.push([new HydrateLetElementInstruction(instructions, childNode.toBindingContext)]);
                }
                else {
                    this.compileParentNode(childNode, instructionRows, projections, targetedProjections);
                }
            }
        }
    }
    compileCustomElement(symbol, instructionRows, projections, targetedProjections) {
        var _a;
        const isAuSlot = (symbol.flags & 512 /* isAuSlot */) > 0;
        // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
        const instructionRow = this.compileAttributes(symbol, 1);
        const slotName = symbol.slotName;
        let slotInfo = null;
        if (isAuSlot) {
            const targetedProjection = (_a = targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.projections) === null || _a === void 0 ? void 0 : _a[slotName];
            slotInfo = targetedProjection !== void 0
                ? new SlotInfo(slotName, AuSlotContentType.Projection, new ProjectionContext(targetedProjection, targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.scope))
                : new SlotInfo(slotName, AuSlotContentType.Fallback, new ProjectionContext(this.compileProjectionFallback(symbol, projections, targetedProjections)));
        }
        const instruction = instructionRow[0] = new HydrateElementInstruction(symbol.res, symbol.info.alias, this.compileBindings(symbol), slotInfo);
        const compiledProjections = this.compileProjections(symbol, projections, targetedProjections);
        if (compiledProjections !== null) {
            projections.set(instruction, compiledProjections);
        }
        instructionRows.push(instructionRow);
        if (!isAuSlot) {
            this.compileChildNodes(symbol, instructionRows, projections, targetedProjections);
        }
    }
    compilePlainElement(symbol, instructionRows, projections, targetedProjections) {
        const attributes = this.compileAttributes(symbol, 0);
        if (attributes.length > 0) {
            instructionRows.push(attributes);
        }
        this.compileChildNodes(symbol, instructionRows, projections, targetedProjections);
    }
    compileParentNode(symbol, instructionRows, projections, targetedProjections) {
        switch (symbol.flags & 1023 /* type */) {
            case 16 /* isCustomElement */:
            case 512 /* isAuSlot */:
                this.compileCustomElement(symbol, instructionRows, projections, targetedProjections);
                break;
            case 64 /* isPlainElement */:
                this.compilePlainElement(symbol, instructionRows, projections, targetedProjections);
                break;
            case 1 /* isTemplateController */:
                this.compileTemplateController(symbol, instructionRows, projections, targetedProjections);
        }
    }
    compileTemplateController(symbol, instructionRows, projections, targetedProjections) {
        var _a;
        const bindings = this.compileBindings(symbol);
        const controllerInstructionRows = [];
        this.compileParentNode(symbol.template, controllerInstructionRows, projections, targetedProjections);
        const def = CustomElementDefinition.create({
            name: (_a = symbol.info.alias) !== null && _a !== void 0 ? _a : symbol.info.name,
            template: symbol.physicalNode,
            instructions: controllerInstructionRows,
            needsCompile: false,
        });
        instructionRows.push([new HydrateTemplateController(def, symbol.res, symbol.info.alias, bindings)]);
    }
    compileBindings(symbol) {
        let bindingInstructions;
        if ((symbol.flags & 8192 /* hasBindings */) > 0) {
            // either a custom element with bindings, a custom attribute / template controller with dynamic options,
            // or a single value custom attribute binding
            const { bindings } = symbol;
            const len = bindings.length;
            bindingInstructions = Array(len);
            let i = 0;
            for (; i < len; ++i) {
                bindingInstructions[i] = this.compileBinding(bindings[i]);
            }
        }
        else {
            bindingInstructions = emptyArray;
        }
        return bindingInstructions;
    }
    compileBinding(symbol) {
        if (symbol.command === null) {
            // either an interpolation or a normal string value assigned to an element or attribute binding
            if (symbol.expression === null) {
                // the template binder already filtered out non-bindables, so we know we need a setProperty here
                return new SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
            }
            else {
                // either an element binding interpolation or a dynamic options attribute binding interpolation
                return new InterpolationInstruction(symbol.expression, symbol.bindable.propName);
            }
        }
        else {
            // either an element binding command, dynamic options attribute binding command,
            // or custom attribute / template controller (single value) binding command
            return symbol.command.compile(symbol);
        }
    }
    compileAttributes(symbol, offset) {
        let attributeInstructions;
        if ((symbol.flags & 4096 /* hasAttributes */) > 0) {
            // any attributes on a custom element (which are not bindables) or a plain element
            const customAttributes = symbol.customAttributes;
            const plainAttributes = symbol.plainAttributes;
            const customAttributeLength = customAttributes.length;
            const plainAttributesLength = plainAttributes.length;
            attributeInstructions = Array(offset + customAttributeLength + plainAttributesLength);
            for (let i = 0; customAttributeLength > i; ++i) {
                attributeInstructions[offset] = this.compileCustomAttribute(customAttributes[i]);
                offset++;
            }
            for (let i = 0; plainAttributesLength > i; ++i) {
                attributeInstructions[offset] = this.compilePlainAttribute(plainAttributes[i], false);
                offset++;
            }
        }
        else if (offset > 0) {
            attributeInstructions = Array(offset);
        }
        else {
            attributeInstructions = emptyArray;
        }
        return attributeInstructions;
    }
    compileCustomAttribute(symbol) {
        // a normal custom attribute (not template controller)
        const bindings = this.compileBindings(symbol);
        return new HydrateAttributeInstruction(symbol.res, symbol.info.alias, bindings);
    }
    compilePlainAttribute(symbol, isOnSurrogate) {
        if (symbol.command === null) {
            const syntax = symbol.syntax;
            if (symbol.expression === null) {
                const attrRawValue = syntax.rawValue;
                if (isOnSurrogate) {
                    switch (syntax.target) {
                        case 'class':
                            return new SetClassAttributeInstruction(attrRawValue);
                        case 'style':
                            return new SetStyleAttributeInstruction(attrRawValue);
                        // todo:  define how to merge other attribute peacefully
                        //        this is an existing feature request
                    }
                }
                // a plain attribute on a surrogate
                return new SetAttributeInstruction(attrRawValue, syntax.target);
            }
            else {
                // a plain attribute with an interpolation
                return new InterpolationInstruction(symbol.expression, syntax.target);
            }
        }
        else {
            // a plain attribute with a binding command
            return symbol.command.compile(symbol);
        }
    }
    // private compileAttribute(symbol: IAttributeSymbol): AttributeInstruction {
    //   // any attribute on a custom element (which is not a bindable) or a plain element
    //   if (symbol.flags & SymbolFlags.isCustomAttribute) {
    //     return this.compileCustomAttribute(symbol as CustomAttributeSymbol);
    //   } else {
    //     return this.compilePlainAttribute(symbol as PlainAttributeSymbol);
    //   }
    // }
    compileProjections(symbol, projectionMap, targetedProjections) {
        if ((symbol.flags & 32768 /* hasProjections */) === 0) {
            return null;
        }
        const p = this.p;
        const projections = Object.create(null);
        const $projections = symbol.projections;
        const len = $projections.length;
        for (let i = 0; i < len; ++i) {
            const projection = $projections[i];
            const name = projection.name;
            const instructions = [];
            this.compileParentNode(projection.template, instructions, projectionMap, targetedProjections);
            const definition = projections[name];
            if (definition === void 0) {
                let template = projection.template.physicalNode;
                if (template.tagName !== 'TEMPLATE') {
                    const _template = p.document.createElement('template');
                    _template.content.appendChild(template);
                    template = _template;
                }
                projections[name] = CustomElementDefinition.create({ name, template, instructions, needsCompile: false });
            }
            else {
                // consolidate the projections to same slot
                definition.template.content.appendChild(projection.template.physicalNode);
                definition.instructions.push(...instructions);
            }
        }
        return projections;
    }
    compileProjectionFallback(symbol, projections, targetedProjections) {
        const instructions = [];
        this.compileChildNodes(symbol, instructions, projections, targetedProjections);
        const template = this.p.document.createElement('template');
        template.content.append(...toArray(symbol.physicalNode.childNodes));
        return CustomElementDefinition.create({ name: CustomElement.generateName(), template, instructions, needsCompile: false });
    }
};
TemplateCompiler = __decorate([
    __param(0, ITemplateElementFactory),
    __param(1, IAttributeParser),
    __param(2, IExpressionParser),
    __param(3, IAttrSyntaxTransformer),
    __param(4, ILogger),
    __param(5, IPlatform)
], TemplateCompiler);
function processTemplateName(localTemplate, localTemplateNames) {
    const name = localTemplate.getAttribute(localTemplateIdentifier);
    if (name === null || name === '') {
        throw new Error('The value of "as-custom-element" attribute cannot be empty for local template');
    }
    if (localTemplateNames.has(name)) {
        throw new Error(`Duplicate definition of the local template named ${name}`);
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
function processLocalTemplates(template, definition, context, p, logger) {
    let root;
    if (template.nodeName === 'TEMPLATE') {
        if (template.hasAttribute(localTemplateIdentifier)) {
            throw new Error('The root cannot be a local template itself.');
        }
        root = template.content;
    }
    else {
        root = template;
    }
    const localTemplates = toArray(root.querySelectorAll('template[as-custom-element]'));
    const numLocalTemplates = localTemplates.length;
    if (numLocalTemplates === 0) {
        return;
    }
    if (numLocalTemplates === root.childElementCount) {
        throw new Error('The custom element does not have any content other than local template(s).');
    }
    const localTemplateNames = new Set();
    for (const localTemplate of localTemplates) {
        if (localTemplate.parentNode !== root) {
            throw new Error('Local templates needs to be defined directly under root.');
        }
        const name = processTemplateName(localTemplate, localTemplateNames);
        const localTemplateType = class LocalTemplate {
        };
        const content = localTemplate.content;
        const bindableEls = toArray(content.querySelectorAll('bindable'));
        const bindableInstructions = Bindable.for(localTemplateType);
        const properties = new Set();
        const attributes = new Set();
        for (const bindableEl of bindableEls) {
            if (bindableEl.parentNode !== content) {
                throw new Error('Bindable properties of local templates needs to be defined directly under root.');
            }
            const property = bindableEl.getAttribute("property" /* property */);
            if (property === null) {
                throw new Error(`The attribute 'property' is missing in ${bindableEl.outerHTML}`);
            }
            const attribute = bindableEl.getAttribute("attribute" /* attribute */);
            if (attribute !== null
                && attributes.has(attribute)
                || properties.has(property)) {
                throw new Error(`Bindable property and attribute needs to be unique; found property: ${property}, attribute: ${attribute}`);
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
            if (ignoredAttributes.length > 0) {
                logger.warn(`The attribute(s) ${ignoredAttributes.join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
            }
            content.removeChild(bindableEl);
        }
        const localTemplateDefinition = CustomElement.define({ name, template: localTemplate }, localTemplateType);
        // the casting is needed here as the dependencies are typed as readonly array
        definition.dependencies.push(localTemplateDefinition);
        context.register(localTemplateDefinition);
        root.removeChild(localTemplate);
    }
}

class BindingModeBehavior {
    constructor(mode) {
        this.mode = mode;
        this.originalModes = new Map();
    }
    bind(flags, scope, hostScope, binding) {
        this.originalModes.set(binding, binding.mode);
        binding.mode = this.mode;
    }
    unbind(flags, scope, hostScope, binding) {
        binding.mode = this.originalModes.get(binding);
        this.originalModes.delete(binding);
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
    $bind(flags, scope, hostScope) {
        if (this.firstArg !== null) {
            const delay = Number(this.firstArg.evaluate(flags, scope, hostScope, this.locator, null));
            this.opts.delay = isNaN(delay) ? defaultDelay$1 : delay;
        }
        this.binding.$bind(flags, scope, hostScope);
    }
    $unbind(flags) {
        var _a;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        this.binding.$unbind(flags);
    }
}
bindingBehavior('debounce')(DebounceBindingBehavior);

let SignalBindingBehavior = class SignalBindingBehavior {
    constructor(signaler) {
        this.signaler = signaler;
        this.lookup = new Map();
    }
    bind(flags, scope, hostScope, binding, ...names) {
        if (!('handleChange' in binding)) {
            throw new Error(`The signal behavior can only be used with bindings that have a 'handleChange' method`);
        }
        if (names.length === 0) {
            throw new Error(`At least one signal name must be passed to the signal behavior, e.g. \`expr & signal:'my-signal'\``);
        }
        this.lookup.set(binding, names);
        for (const name of names) {
            this.signaler.addSignalListener(name, binding);
        }
    }
    unbind(flags, scope, hostScope, binding) {
        const names = this.lookup.get(binding);
        this.lookup.delete(binding);
        for (const name of names) {
            this.signaler.removeSignalListener(name, binding);
        }
    }
};
SignalBindingBehavior = __decorate([
    __param(0, ISignaler)
], SignalBindingBehavior);
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
        this.platform = binding.locator.get(IPlatform$1);
        this.taskQueue = this.platform.taskQueue;
        if (expr.args.length > 0) {
            this.firstArg = expr.args[0];
        }
    }
    callSource(args) {
        this.queueTask(() => this.binding.callSource(args));
        return void 0;
    }
    handleChange(newValue, oldValue, flags) {
        // when source has changed before the latest throttled value from target
        // then discard that value, and take latest value from source only
        if (this.task !== null) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this.platform.performanceNow();
        }
        this.binding.handleChange(newValue, oldValue, flags);
    }
    updateSource(newValue, flags) {
        this.queueTask(() => this.binding.updateSource(newValue, flags));
    }
    queueTask(callback) {
        const opts = this.opts;
        const platform = this.platform;
        const nextDelay = this.lastCall + opts.delay - platform.performanceNow();
        if (nextDelay > 0) {
            // Queue the new one before canceling the old one, to prevent early yield
            const task = this.task;
            opts.delay = nextDelay;
            this.task = this.taskQueue.queueTask(() => {
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
    $bind(flags, scope, hostScope) {
        if (this.firstArg !== null) {
            const delay = Number(this.firstArg.evaluate(flags, scope, hostScope, this.locator, null));
            this.opts.delay = this.delay = isNaN(delay) ? defaultDelay : delay;
        }
        this.binding.$bind(flags, scope, hostScope);
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
        this.propertyKey = '';
        // ObserverType.Layout is not always true, it depends on the property
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    getValue(obj, key) {
        return obj.getAttribute(key);
    }
    setValue(newValue, flags, obj, key) {
        if (newValue == void 0) {
            obj.removeAttribute(key);
        }
        else {
            obj.setAttribute(key, newValue);
        }
    }
}
const attrAccessor = new DataAttributeAccessor();

let AttrBindingBehavior = class AttrBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        binding.targetObserver = attrAccessor;
    }
    unbind(flags, _scope, _hostScope, binding) {
        return;
    }
};
AttrBindingBehavior = __decorate([
    bindingBehavior('attr')
], AttrBindingBehavior);

/** @internal */
function handleSelfEvent(event) {
    const target = event.composedPath()[0];
    if (this.target !== target) {
        return;
    }
    return this.selfEventCallSource(event);
}
let SelfBindingBehavior = class SelfBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        if (!binding.callSource || !binding.targetEvent) {
            throw new Error('Self binding behavior only supports events.');
        }
        binding.selfEventCallSource = binding.callSource;
        binding.callSource = handleSelfEvent;
    }
    unbind(flags, _scope, _hostScope, binding) {
        binding.callSource = binding.selfEventCallSource;
        binding.selfEventCallSource = null;
    }
};
SelfBindingBehavior = __decorate([
    bindingBehavior('self')
], SelfBindingBehavior);

const nsMap = Object.create(null);
/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
class AttributeNSAccessor {
    constructor(namespace) {
        this.namespace = namespace;
        // ObserverType.Layout is not always true, it depends on the property
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    static forNs(ns) {
        var _a;
        return (_a = nsMap[ns]) !== null && _a !== void 0 ? _a : (nsMap[ns] = new AttributeNSAccessor(ns));
    }
    getValue(obj, propertyKey) {
        return obj.getAttributeNS(this.namespace, propertyKey);
    }
    setValue(newValue, flags, obj, key) {
        if (newValue == void 0) {
            obj.removeAttributeNS(this.namespace, key);
        }
        else {
            obj.setAttributeNS(this.namespace, key, newValue);
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
        this.observerLocator = observerLocator;
        this.value = void 0;
        this.oldValue = void 0;
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.collectionObserver = void 0;
        this.valueObserver = void 0;
        this.f = 0 /* none */;
        this.obj = obj;
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
        this.oldValue = currentValue;
        this.f = flags;
        this.observe();
        this.synchronizeElement();
        this.queue.add(this);
    }
    handleCollectionChange(indexMap, flags) {
        this.synchronizeElement();
    }
    handleChange(newValue, previousValue, flags) {
        this.synchronizeElement();
    }
    synchronizeElement() {
        const currentValue = this.value;
        const obj = this.obj;
        const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
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
        let currentValue = this.oldValue = this.value;
        const obj = this.obj;
        const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
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
        this.observe();
    }
    stop() {
        var _a, _b;
        this.handler.dispose();
        (_a = this.collectionObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this.collectionObserver = void 0;
        (_b = this.valueObserver) === null || _b === void 0 ? void 0 : _b.unsubscribe(this);
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
        oV$2 = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV$2, this.f);
    }
    observe() {
        var _a, _b, _c, _d, _e, _f, _g;
        const obj = this.obj;
        (_e = ((_a = this.valueObserver) !== null && _a !== void 0 ? _a : (this.valueObserver = (_c = (_b = obj.$observers) === null || _b === void 0 ? void 0 : _b.model) !== null && _c !== void 0 ? _c : (_d = obj.$observers) === null || _d === void 0 ? void 0 : _d.value))) === null || _e === void 0 ? void 0 : _e.subscribe(this);
        (_f = this.collectionObserver) === null || _f === void 0 ? void 0 : _f.unsubscribe(this);
        this.collectionObserver = void 0;
        if (obj.type === 'checkbox') {
            (_g = (this.collectionObserver = getCollectionObserver(this.value, this.observerLocator))) === null || _g === void 0 ? void 0 : _g.subscribe(this);
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
        this.observerLocator = observerLocator;
        this.value = void 0;
        this.oldValue = void 0;
        this.hasChanges = false;
        // ObserverType.Layout is not always true
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.arrayObserver = void 0;
        this.nodeObserver = void 0;
        this.observing = false;
        this.obj = obj;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.observing
            ? this.value
            : this.obj.multiple
                ? Array.from(this.obj.options).map(o => o.value)
                : this.obj.value;
    }
    setValue(newValue, flags) {
        this.oldValue = this.value;
        this.value = newValue;
        this.hasChanges = newValue !== this.oldValue;
        this.observeArray(newValue instanceof Array ? newValue : null);
        if ((flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
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
            // A.1.b.ii
            i = 0;
            while (i < currentValue.length) {
                const a = currentValue[i];
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
                const a = values[i];
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
        while (i < len) {
            const option = options[i];
            if (option.selected) {
                value = hasOwn.call(option, 'model')
                    ? option.model
                    : option.value;
                break;
            }
            ++i;
        }
        // B.2
        this.oldValue = this.value;
        // B.3
        this.value = value;
        // B.4
        return true;
    }
    start() {
        (this.nodeObserver = new this.obj.ownerDocument.defaultView.MutationObserver(this.handleNodeChange.bind(this)))
            .observe(this.obj, childObserverOptions);
        this.observeArray(this.value instanceof Array ? this.value : null);
        this.observing = true;
    }
    stop() {
        var _a;
        this.nodeObserver.disconnect();
        (_a = this.arrayObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this.nodeObserver
            = this.arrayObserver
                = void 0;
        this.observing = false;
    }
    // todo: observe all kind of collection
    observeArray(array) {
        var _a;
        (_a = this.arrayObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this.arrayObserver = void 0;
        if (array != null) {
            if (!this.obj.multiple) {
                throw new Error('Only null or Array instances can be bound to a multi-select.');
            }
            (this.arrayObserver = this.observerLocator.getArrayObserver(array)).subscribe(this);
        }
    }
    handleEvent() {
        const shouldNotify = this.syncValue();
        if (shouldNotify) {
            this.queue.add(this);
            // this.subs.notify(this.currentValue, this.oldValue, LF.none);
        }
    }
    handleNodeChange() {
        this.syncOptions();
        const shouldNotify = this.syncValue();
        if (shouldNotify) {
            this.queue.add(this);
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.handler.subscribe(this.obj, this);
            this.start();
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.handler.dispose();
            this.stop();
        }
    }
    flush() {
        oV$1 = this.oldValue;
        this.oldValue = this.value;
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
        this.value = '';
        this.oldValue = '';
        this.styles = {};
        this.version = 0;
        this.hasChanges = false;
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(newValue, flags) {
        this.value = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    getStyleTuplesFromString(currentValue) {
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
    getStyleTuplesFromObject(currentValue) {
        let value;
        const styles = [];
        for (const property in currentValue) {
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
            styles.push(...this.getStyleTuples(value));
        }
        return styles;
    }
    getStyleTuplesFromArray(currentValue) {
        const len = currentValue.length;
        if (len > 0) {
            const styles = [];
            for (let i = 0; i < len; ++i) {
                styles.push(...this.getStyleTuples(currentValue[i]));
            }
            return styles;
        }
        return emptyArray;
    }
    getStyleTuples(currentValue) {
        if (typeof currentValue === 'string') {
            return this.getStyleTuplesFromString(currentValue);
        }
        if (currentValue instanceof Array) {
            return this.getStyleTuplesFromArray(currentValue);
        }
        if (currentValue instanceof Object) {
            return this.getStyleTuplesFromObject(currentValue);
        }
        return emptyArray;
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const currentValue = this.value;
            const styles = this.styles;
            const styleTuples = this.getStyleTuples(currentValue);
            let style;
            let version = this.version;
            this.oldValue = currentValue;
            let tuple;
            let name;
            let value;
            const len = styleTuples.length;
            for (let i = 0; i < len; ++i) {
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
        this.value = this.oldValue = this.obj.style.cssText;
    }
}

/**
 * Observer for non-radio, non-checkbox input.
 */
class ValueAttributeObserver {
    constructor(obj, propertyKey, handler) {
        this.propertyKey = propertyKey;
        this.handler = handler;
        this.value = '';
        this.oldValue = '';
        this.hasChanges = false;
        // ObserverType.Layout is not always true, it depends on the element & property combo
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
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
        this.oldValue = this.value;
        this.value = newValue;
        this.hasChanges = true;
        if (!this.handler.config.readonly && (flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        var _a;
        if (this.hasChanges) {
            this.hasChanges = false;
            this.obj[this.propertyKey] = (_a = this.value) !== null && _a !== void 0 ? _a : this.handler.config.default;
            if ((flags & 2 /* fromBind */) === 0) {
                this.queue.add(this);
            }
        }
    }
    handleEvent() {
        this.oldValue = this.value;
        this.value = this.obj[this.propertyKey];
        if (this.oldValue !== this.value) {
            this.hasChanges = false;
            this.queue.add(this);
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.handler.subscribe(this.obj, this);
            this.value = this.oldValue = this.obj[this.propertyKey];
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.handler.dispose();
        }
    }
    flush() {
        oV = this.oldValue;
        this.oldValue = this.value;
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
        this.events = createLookup();
        this.globalEvents = createLookup();
        this.overrides = createLookup();
        this.globalOverrides = createLookup();
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
        const lookup = this.events;
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
        const lookup = this.globalEvents;
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
        if (key in this.globalOverrides || (key in ((_a = this.overrides[obj.tagName]) !== null && _a !== void 0 ? _a : emptyObject))) {
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
            existingTagOverride = (_a = (_c = this.overrides)[tagNameOrOverrides]) !== null && _a !== void 0 ? _a : (_c[tagNameOrOverrides] = createLookup());
            existingTagOverride[key] = true;
        }
        else {
            for (const tagName in tagNameOrOverrides) {
                for (const key of tagNameOrOverrides[tagName]) {
                    existingTagOverride = (_b = (_d = this.overrides)[tagName]) !== null && _b !== void 0 ? _b : (_d[tagName] = createLookup());
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
            this.globalOverrides[key] = true;
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
        const eventsConfig = (_b = (_a = this.events[el.tagName]) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : this.globalEvents[key];
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
            throw new Error(`Unable to observe property ${String(key)}. Register observation mapping with .useConfig().`);
        }
        else {
            // todo: probably still needs to get the property descriptor via getOwnPropertyDescriptor
            // but let's start with simplest scenario
            return new SetterObserver(el, key);
        }
    }
}
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
    throw new Error(`Mapping for property ${String(key)} of <${nodeName} /> already exists`);
}

let UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
    constructor(observerLocator) {
        this.observerLocator = observerLocator;
    }
    bind(flags, _scope, _hostScope, binding, ...events) {
        if (events.length === 0) {
            throw new Error('The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">');
        }
        if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
            throw new Error('The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.');
        }
        // ensure the binding's target observer has been set.
        const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty);
        if (!targetObserver.handler) {
            throw new Error('The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.');
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
    unbind(flags, _scope, _hostScope, binding) {
        // restore the state of the binding.
        binding.targetObserver.handler.dispose();
        binding.targetObserver.handler = binding.targetObserver.originalHandler;
        binding.targetObserver.originalHandler = null;
    }
};
UpdateTriggerBindingBehavior = __decorate([
    bindingBehavior('updateTrigger'),
    __param(0, IObserverLocator)
], UpdateTriggerBindingBehavior);

const unset = Symbol();
// Using passive to help with performance
const defaultCaptureEventInit = {
    passive: true,
    capture: true
};
// Using passive to help with performance
const defaultBubbleEventInit = {
    passive: true
};
// weakly connect a document to a blur manager
// to avoid polluting the document properties
const blurDocMap = new WeakMap();
class BlurManager {
    constructor(platform) {
        this.platform = platform;
        this.blurs = [];
        blurDocMap.set(platform.document, this);
        this.handler = createHandler(this, this.blurs);
    }
    static createFor(platform) {
        return blurDocMap.get(platform.document) || new BlurManager(platform);
    }
    register(blur) {
        const blurs = this.blurs;
        if (!blurs.includes(blur) && blurs.push(blur) === 1) {
            this.addListeners();
        }
    }
    unregister(blur) {
        const blurs = this.blurs;
        const index = blurs.indexOf(blur);
        if (index > -1) {
            blurs.splice(index, 1);
        }
        if (blurs.length === 0) {
            this.removeListeners();
        }
    }
    addListeners() {
        const p = this.platform;
        const doc = p.document;
        const win = p.window;
        const handler = this.handler;
        if (win.navigator.pointerEnabled) {
            doc.addEventListener('pointerdown', handler, defaultCaptureEventInit);
        }
        doc.addEventListener('touchstart', handler, defaultCaptureEventInit);
        doc.addEventListener('mousedown', handler, defaultCaptureEventInit);
        doc.addEventListener('focus', handler, defaultCaptureEventInit);
        win.addEventListener('blur', handler, defaultBubbleEventInit);
    }
    removeListeners() {
        const p = this.platform;
        const doc = p.document;
        const win = p.window;
        const handler = this.handler;
        if (win.navigator.pointerEnabled) {
            doc.removeEventListener('pointerdown', handler, defaultCaptureEventInit);
        }
        doc.removeEventListener('touchstart', handler, defaultCaptureEventInit);
        doc.removeEventListener('mousedown', handler, defaultCaptureEventInit);
        doc.removeEventListener('focus', handler, defaultCaptureEventInit);
        win.removeEventListener('blur', handler, defaultBubbleEventInit);
    }
}
let Blur = class Blur {
    constructor(element, p) {
        this.element = element;
        this.p = p;
        /**
         * By default, the behavior should be least surprise possible, that:
         *
         * it searches for anything from root context,
         * and root context is document body
         */
        this.linkedMultiple = true;
        this.searchSubTree = true;
        this.linkingContext = null;
        this.value = unset;
        this.manager = BlurManager.createFor(p);
    }
    attached() {
        this.manager.register(this);
    }
    detaching() {
        this.manager.unregister(this);
    }
    handleEventTarget(target) {
        if (this.value === false) {
            return;
        }
        const p = this.p;
        if (target === p.window || target === p.document || !this.contains(target)) {
            this.triggerBlur();
        }
    }
    contains(target) {
        if (!this.value) {
            return false;
        }
        let els;
        let i;
        let j, jj;
        let link;
        const element = this.element;
        if (containsElementOrShadowRoot(element, target)) {
            return true;
        }
        if (!this.linkedWith) {
            return false;
        }
        const doc = this.p.document;
        const linkedWith = this.linkedWith;
        const linkingContext = this.linkingContext;
        const searchSubTree = this.searchSubTree;
        const linkedMultiple = this.linkedMultiple;
        const links = Array.isArray(linkedWith) ? linkedWith : [linkedWith];
        const contextNode = (typeof linkingContext === 'string'
            ? doc.querySelector(linkingContext)
            : linkingContext)
            || doc.body;
        const ii = links.length;
        for (i = 0; ii > i; ++i) {
            link = links[i];
            // When user specify to link with something by a string, it acts as a CSS selector
            // We need to do some querying stuff to determine if target above is contained.
            if (typeof link === 'string') {
                // Default behavior, search the whole tree, from context that user specified, which default to document body
                if (searchSubTree) {
                    // todo: are there too many knobs?? Consider remove "linkedMultiple"??
                    if (!linkedMultiple) {
                        const el = contextNode.querySelector(link);
                        els = el !== null ? [el] : emptyArray;
                    }
                    else {
                        els = contextNode.querySelectorAll(link);
                    }
                    jj = els.length;
                    for (j = 0; jj > j; ++j) {
                        if (els[j].contains(target)) {
                            return true;
                        }
                    }
                }
                else {
                    // default to document body, if user didn't define a linking context, and wanted to ignore subtree.
                    // This is specifically performant and useful for dialogs, plugins
                    // that usually generate contents to document body
                    els = contextNode.children;
                    jj = els.length;
                    for (j = 0; jj > j; ++j) {
                        if (els[j].matches(link)) {
                            return true;
                        }
                    }
                }
            }
            else {
                // When user passed in something that is not a string,
                // simply check if has method `contains` (allow duck typing)
                // and call it against target.
                // This enables flexible usages
                if (link && link.contains(target)) {
                    return true;
                }
            }
        }
        return false;
    }
    triggerBlur() {
        this.value = false;
        if (typeof this.onBlur === 'function') {
            this.onBlur.call(null);
        }
    }
};
__decorate([
    bindable()
], Blur.prototype, "value", void 0);
__decorate([
    bindable()
], Blur.prototype, "onBlur", void 0);
__decorate([
    bindable()
], Blur.prototype, "linkedWith", void 0);
__decorate([
    bindable()
], Blur.prototype, "linkedMultiple", void 0);
__decorate([
    bindable()
], Blur.prototype, "searchSubTree", void 0);
__decorate([
    bindable()
], Blur.prototype, "linkingContext", void 0);
Blur = __decorate([
    customAttribute('blur'),
    __param(0, INode),
    __param(1, IPlatform)
], Blur);
const containsElementOrShadowRoot = (container, target) => {
    if (container.contains(target)) {
        return true;
    }
    let parentNode = null;
    while (target != null) {
        if (target === container) {
            return true;
        }
        parentNode = target.parentNode;
        if (parentNode === null && target.nodeType === 11 /* DocumentFragment */) {
            target = target.host;
            continue;
        }
        target = parentNode;
    }
    return false;
};
const createHandler = (manager, checkTargets) => {
    // *******************************
    // EVENTS ORDER
    // -----------------------------
    // pointerdown
    // touchstart
    // pointerup
    // touchend
    // mousedown
    // --------------
    // BLUR
    // FOCUS
    // --------------
    // mouseup
    // click
    //
    // ******************************
    //
    // There are cases focus happens without mouse interaction (keyboard)
    // So it needs to capture both mouse / focus movement
    //
    // ******************************
    let hasChecked = false;
    const revertCheckage = () => {
        hasChecked = false;
    };
    const markChecked = () => {
        hasChecked = true;
        manager.platform.domWriteQueue.queueTask(revertCheckage, { preempt: true });
    };
    const handleMousedown = (e) => {
        if (!hasChecked) {
            handleEvent(e);
            markChecked();
        }
    };
    /**
     * Handle globally captured focus event
     * This can happen via a few way:
     * User clicks on a focusable element
     * User uses keyboard to navigate to a focusable element
     * User goes back to the window from another browser tab
     * User clicks on a non-focusable element
     * User clicks on the window, outside of the document
     */
    const handleFocus = (e) => {
        if (hasChecked) {
            return;
        }
        // there are two way a focus gets captured on window
        // when the windows itself got focus
        // and when an element in the document gets focus
        // when the window itself got focus, reacting to it is quite unnecessary
        // as it doesn't really affect element inside the document
        // Do a simple check and bail immediately
        const isWindow = e.target === manager.platform.window;
        if (isWindow) {
            for (let i = 0, ii = checkTargets.length; ii > i; ++i) {
                checkTargets[i].triggerBlur();
            }
        }
        else {
            handleEvent(e);
        }
        markChecked();
    };
    const handleWindowBlur = () => {
        hasChecked = false;
        for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
            checkTargets[i].triggerBlur();
        }
    };
    const handleEvent = (e) => {
        const target = e.composed ? e.composedPath()[0] : e.target;
        if (target === null) {
            return;
        }
        for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
            checkTargets[i].handleEventTarget(target);
        }
    };
    return {
        onpointerdown: handleMousedown,
        ontouchstart: handleMousedown,
        onmousedown: handleMousedown,
        onfocus: handleFocus,
        onblur: handleWindowBlur,
        handleEvent(e) {
            this[`on${e.type}`](e);
        }
    };
};

/**
 * Focus attribute for element focus binding
 */
let Focus = class Focus {
    constructor(element, p) {
        this.element = element;
        this.p = p;
        /**
         * Indicates whether `apply` should be called when `attached` callback is invoked
         */
        this.needsApply = false;
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
            this.needsApply = true;
        }
    }
    /**
     * Invoked when the attribute is attached to the DOM.
     */
    attached() {
        if (this.needsApply) {
            this.needsApply = false;
            this.apply();
        }
        const el = this.element;
        el.addEventListener('focus', this);
        el.addEventListener('blur', this);
    }
    /**
     * Invoked when the attribute is afterDetachChildren from the DOM.
     */
    afterDetachChildren() {
        const el = this.element;
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
        const el = this.element;
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
        return this.element === this.p.document.activeElement;
    }
};
__decorate([
    bindable({ mode: BindingMode.twoWay })
], Focus.prototype, "value", void 0);
Focus = __decorate([
    customAttribute('focus'),
    __param(0, INode),
    __param(1, IPlatform)
], Focus);

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
    customAttribute('show'),
    alias('hide'),
    __param(0, INode),
    __param(1, IPlatform),
    __param(2, IInstruction)
], Show);

let Portal = class Portal {
    constructor(factory, originalLoc, p) {
        this.factory = factory;
        this.originalLoc = originalLoc;
        this.p = p;
        this.id = nextId('au$component');
        this.strict = false;
        // to make the shape of this object consistent.
        // todo: is this necessary
        this.currentTarget = p.document.createElement('div');
        this.view = this.factory.create();
        setEffectiveParentNode(this.view.nodes, originalLoc);
    }
    attaching(initiator, parent, flags) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        const newTarget = this.currentTarget = this.resolveTarget();
        this.view.setHost(newTarget);
        return this.$activating(initiator, newTarget, flags);
    }
    detaching(initiator, parent, flags) {
        return this.$deactivating(initiator, this.currentTarget, flags);
    }
    targetChanged() {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        const oldTarget = this.currentTarget;
        const newTarget = this.currentTarget = this.resolveTarget();
        if (oldTarget === newTarget) {
            return;
        }
        this.view.setHost(newTarget);
        // TODO(fkleuver): fix and test possible race condition
        const ret = onResolve(this.$deactivating(null, newTarget, $controller.flags), () => {
            return this.$activating(null, newTarget, $controller.flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    $activating(initiator, target, flags) {
        const { activating, callbackContext, view } = this;
        view.setHost(target);
        return onResolve(activating === null || activating === void 0 ? void 0 : activating.call(callbackContext, target, view), () => {
            return this.activate(initiator, target, flags);
        });
    }
    activate(initiator, target, flags) {
        const { $controller, view } = this;
        if (initiator === null) {
            view.nodes.appendTo(target);
        }
        else {
            // TODO(fkleuver): fix and test possible race condition
            return onResolve(view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, $controller.scope), () => {
                return this.$activated(target);
            });
        }
        return this.$activated(target);
    }
    $activated(target) {
        const { activated, callbackContext, view } = this;
        return activated === null || activated === void 0 ? void 0 : activated.call(callbackContext, target, view);
    }
    $deactivating(initiator, target, flags) {
        const { deactivating, callbackContext, view } = this;
        return onResolve(deactivating === null || deactivating === void 0 ? void 0 : deactivating.call(callbackContext, target, view), () => {
            return this.deactivate(initiator, target, flags);
        });
    }
    deactivate(initiator, target, flags) {
        const { $controller, view } = this;
        if (initiator === null) {
            view.nodes.remove();
        }
        else {
            return onResolve(view.deactivate(initiator, $controller, flags), () => {
                return this.$deactivated(target);
            });
        }
        return this.$deactivated(target);
    }
    $deactivated(target) {
        const { deactivated, callbackContext, view } = this;
        return deactivated === null || deactivated === void 0 ? void 0 : deactivated.call(callbackContext, target, view);
    }
    resolveTarget() {
        const p = this.p;
        // with a $ in front to make it less confusing/error prone
        const $document = p.document;
        let target = this.target;
        let context = this.renderContext;
        if (target === '') {
            if (this.strict) {
                throw new Error('Empty querySelector');
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
                throw new Error('Portal target not found');
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
};
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
Portal = __decorate([
    templateController('portal'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation),
    __param(2, IPlatform)
], Portal);

class FlagsTemplateController {
    constructor(factory, location, flags) {
        this.factory = factory;
        this.flags = flags;
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    attaching(initiator, parent, flags) {
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags | this.flags, $controller.scope, $controller.hostScope);
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

let If = class If {
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
        this.pending = void 0;
        this.wantsDeactivate = false;
    }
    attaching(initiator, parent, flags) {
        return onResolve(this.pending, () => {
            var _a;
            this.pending = void 0;
            // Promise return values from user VM hooks are awaited by the initiator
            void ((_a = (this.view = this.updateView(this.value, flags))) === null || _a === void 0 ? void 0 : _a.activate(initiator, this.$controller, flags, this.$controller.scope, this.$controller.hostScope));
        });
    }
    detaching(initiator, parent, flags) {
        this.wantsDeactivate = true;
        return onResolve(this.pending, () => {
            var _a;
            this.wantsDeactivate = false;
            this.pending = void 0;
            // Promise return values from user VM hooks are awaited by the initiator
            void ((_a = this.view) === null || _a === void 0 ? void 0 : _a.deactivate(initiator, this.$controller, flags));
        });
    }
    valueChanged(newValue, oldValue, flags) {
        if (!this.$controller.isActive) {
            return;
        }
        this.pending = onResolve(this.pending, () => {
            return this.swap(flags);
        });
    }
    swap(flags) {
        var _a;
        if (this.view === this.updateView(this.value, flags)) {
            return;
        }
        this.work.start();
        const ctrl = this.$controller;
        return onResolve((_a = this.view) === null || _a === void 0 ? void 0 : _a.deactivate(this.view, ctrl, flags), () => {
            // return early if detaching was called during the swap
            if (this.wantsDeactivate) {
                return;
            }
            // value may have changed during deactivate
            const nextView = this.view = this.updateView(this.value, flags);
            return onResolve(nextView === null || nextView === void 0 ? void 0 : nextView.activate(nextView, ctrl, flags, ctrl.scope, ctrl.hostScope), () => {
                this.work.finish();
                // only null the pending promise if nothing changed since the activation start
                if (this.view === this.updateView(this.value, flags)) {
                    this.pending = void 0;
                }
            });
        });
    }
    /** @internal */
    updateView(value, flags) {
        if (value) {
            return this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
        }
        if (this.elseFactory !== void 0) {
            return this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
        }
        return void 0;
    }
    /** @internal */
    ensureView(view, factory, flags) {
        if (view === void 0) {
            view = factory.create(flags);
            view.setLocation(this.location);
        }
        return view;
    }
    dispose() {
        var _a, _b;
        (_a = this.ifView) === null || _a === void 0 ? void 0 : _a.dispose();
        this.ifView = void 0;
        (_b = this.elseView) === null || _b === void 0 ? void 0 : _b.dispose();
        this.elseView = void 0;
        this.view = void 0;
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
], If.prototype, "value", void 0);
If = __decorate([
    templateController('if'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation),
    __param(2, IWorkTracker)
], If);
let Else = class Else {
    constructor(factory) {
        this.factory = factory;
        this.id = nextId('au$component');
    }
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        const children = controller.children;
        const ifBehavior = children[children.length - 1];
        if (ifBehavior instanceof If) {
            ifBehavior.elseFactory = this.factory;
        }
        else if (ifBehavior.viewModel instanceof If) {
            ifBehavior.viewModel.elseFactory = this.factory;
        }
        else {
            throw new Error(`Unsupported IfBehavior`); // TODO: create error code
        }
    }
};
Else = __decorate([
    templateController({ name: 'else' }),
    __param(0, IViewFactory)
], Else);

function dispose(disposable) {
    disposable.dispose();
}
let Repeat = class Repeat {
    constructor(location, parent, factory) {
        this.location = location;
        this.parent = parent;
        this.factory = factory;
        this.id = nextId('au$component');
        this.hasPendingInstanceMutation = false;
        this.observer = void 0;
        this.views = [];
        this.key = void 0;
        this.normalizedItems = void 0;
    }
    binding(initiator, parent, flags) {
        this.checkCollectionObserver(flags);
        const bindings = this.parent.bindings;
        let binding = (void 0);
        for (let i = 0, ii = bindings.length; i < ii; ++i) {
            binding = bindings[i];
            if (binding.target === this && binding.targetProperty === 'items') {
                this.forOf = binding.sourceExpression;
                break;
            }
        }
        this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope, null, binding.locator, null);
    }
    attaching(initiator, parent, flags) {
        this.normalizeToArray(flags);
        return this.activateAllViews(initiator, flags);
    }
    detaching(initiator, parent, flags) {
        this.checkCollectionObserver(flags);
        return this.deactivateAllViews(initiator, flags);
    }
    // called by SetterObserver
    itemsChanged(flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        flags |= $controller.flags;
        this.checkCollectionObserver(flags);
        this.normalizeToArray(flags);
        const ret = onResolve(this.deactivateAllViews(null, flags), () => {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
            return this.activateAllViews(null, flags);
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
        this.normalizeToArray(flags);
        if (indexMap === void 0) {
            const ret = onResolve(this.deactivateAllViews(null, flags), () => {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
                return this.activateAllViews(null, flags);
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
                const ret = onResolve(this.deactivateAndRemoveViewsByKey(indexMap, flags), () => {
                    // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
                    return this.createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
                });
                if (ret instanceof Promise) {
                    ret.catch(err => { throw err; });
                }
            }
            else {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
            }
        }
    }
    // todo: subscribe to collection from inner expression
    checkCollectionObserver(flags) {
        const oldObserver = this.observer;
        if ((flags & 4 /* fromUnbind */)) {
            if (oldObserver !== void 0) {
                oldObserver.unsubscribe(this);
            }
        }
        else if (this.$controller.isActive) {
            const newObserver = this.observer = getCollectionObserver$1(this.items);
            if (oldObserver !== newObserver && oldObserver) {
                oldObserver.unsubscribe(this);
            }
            if (newObserver) {
                newObserver.subscribe(this);
            }
        }
    }
    normalizeToArray(flags) {
        const items = this.items;
        if (items instanceof Array) {
            this.normalizedItems = items;
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
        this.normalizedItems = normalizedItems;
    }
    activateAllViews(initiator, flags) {
        let promises = void 0;
        let ret;
        let view;
        let viewScope;
        const { $controller, factory, local, location, items } = this;
        const parentScope = $controller.scope;
        const hostScope = $controller.hostScope;
        const newLen = this.forOf.count(flags, items);
        const views = this.views = Array(newLen);
        this.forOf.iterate(flags, items, (arr, i, item) => {
            view = views[i] = factory.create(flags).setLocation(location);
            view.nodes.unlink();
            viewScope = Scope.fromParent(parentScope, BindingContext.create(local, item));
            setContextualProperties(viewScope.overrideContext, i, newLen);
            ret = view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, viewScope, hostScope);
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
    deactivateAllViews(initiator, flags) {
        let promises = void 0;
        let ret;
        let view;
        const { views, $controller } = this;
        for (let i = 0, ii = views.length; i < ii; ++i) {
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
    deactivateAndRemoveViewsByKey(indexMap, flags) {
        let promises = void 0;
        let ret;
        let view;
        const { $controller, views } = this;
        const deleted = indexMap.deletedItems;
        const deletedLen = deleted.length;
        let i = 0;
        for (; i < deletedLen; ++i) {
            view = views[deleted[i]];
            view.release();
            ret = view.deactivate(view, $controller, flags);
            if (ret instanceof Promise) {
                (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
            }
        }
        i = 0;
        let j = 0;
        for (; i < deletedLen; ++i) {
            j = deleted[i] - i;
            views.splice(j, 1);
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    createAndActivateAndSortViewsByKey(oldLength, indexMap, flags) {
        var _a;
        let promises = void 0;
        let ret;
        let view;
        let viewScope;
        const { $controller, factory, local, normalizedItems, location, views } = this;
        const mapLen = indexMap.length;
        for (let i = 0; i < mapLen; ++i) {
            if (indexMap[i] === -2) {
                view = factory.create(flags);
                views.splice(i, 0, view);
            }
        }
        if (views.length !== mapLen) {
            // TODO: create error code and use reporter with more informative message
            throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
        }
        const parentScope = $controller.scope;
        const hostScope = $controller.hostScope;
        const newLen = indexMap.length;
        synchronizeIndices(views, indexMap);
        // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
        // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
        const seq = longestIncreasingSubsequence(indexMap);
        const seqLen = seq.length;
        let next;
        let j = seqLen - 1;
        let i = newLen - 1;
        for (; i >= 0; --i) {
            view = views[i];
            next = views[i + 1];
            view.nodes.link((_a = next === null || next === void 0 ? void 0 : next.nodes) !== null && _a !== void 0 ? _a : location);
            if (indexMap[i] === -2) {
                viewScope = Scope.fromParent(parentScope, BindingContext.create(local, normalizedItems[i]));
                setContextualProperties(viewScope.overrideContext, i, newLen);
                view.setLocation(location);
                ret = view.activate(view, $controller, flags, viewScope, hostScope);
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
};
__decorate([
    bindable
], Repeat.prototype, "items", void 0);
Repeat = __decorate([
    templateController('repeat'),
    __param(0, IRenderLocation),
    __param(1, IController),
    __param(2, IViewFactory)
], Repeat);
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

let With = class With {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = nextId('au$component');
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    valueChanged(newValue, oldValue, flags) {
        if (this.$controller.isActive) {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.activateView(this.view, 2 /* fromBind */);
        }
    }
    attaching(initiator, parent, flags) {
        return this.activateView(initiator, flags);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    activateView(initiator, flags) {
        const { $controller, value } = this;
        const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
        return this.view.activate(initiator, $controller, flags, scope, $controller.hostScope);
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
};
__decorate([
    bindable
], With.prototype, "value", void 0);
With = __decorate([
    templateController('with'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation)
], With);

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
    link(flags, _parentContext, _controller, _childController, _target, _instruction) {
        this.view = this.factory.create(flags, this.$controller).setLocation(this.location);
    }
    attaching(initiator, parent, flags) {
        const view = this.view;
        const $controller = this.$controller;
        this.queue(() => view.activate(initiator, $controller, flags, $controller.scope, $controller.hostScope));
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
        const hostScope = controller.hostScope;
        // most common case
        if (length === 1) {
            return cases[0].activate(initiator, flags, scope, hostScope);
        }
        return resolveAll(...cases.map(($case) => $case.activate(initiator, flags, scope, hostScope)));
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
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        const switchController = controller.parent;
        const $switch = switchController === null || switchController === void 0 ? void 0 : switchController.viewModel;
        if ($switch instanceof Switch) {
            this.$switch = $switch;
            this.linkToSwitch($switch);
        }
        else {
            throw new Error('The parent switch not found; only `*[switch] > *[case|default-case]` relation is supported.');
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
    activate(initiator, flags, scope, hostScope) {
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags, scope, hostScope);
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
            throw new Error('Multiple \'default-case\'s are not allowed.');
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
    link(flags, _parentContext, _controller, _childController, _target, _instruction) {
        this.view = this.factory.create(flags, this.$controller).setLocation(this.location);
    }
    attaching(initiator, parent, flags) {
        const view = this.view;
        const $controller = this.$controller;
        return onResolve(view.activate(initiator, $controller, flags, this.viewScope = Scope.fromParent($controller.scope, {}), $controller.hostScope), () => this.swap(initiator, flags));
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
        const $controller = this.$controller;
        const s = this.viewScope;
        const hs = $controller.hostScope;
        let preSettlePromise;
        const defaultQueuingOptions = { reusable: false };
        const $swap = () => {
            // Note that the whole thing is not wrapped in a q.queueTask intentionally.
            // Because that would block the app till the actual promise is resolved, which is not the goal anyway.
            void resolveAll(
            // At first deactivate the fulfilled and rejected views, as well as activate the pending view.
            // The order of these 3 should not necessarily be sequential (i.e. order-irrelevant).
            preSettlePromise = (this.preSettledTask = q.queueTask(() => {
                return resolveAll(fulfilled === null || fulfilled === void 0 ? void 0 : fulfilled.deactivate(initiator, flags), rejected === null || rejected === void 0 ? void 0 : rejected.deactivate(initiator, flags), pending === null || pending === void 0 ? void 0 : pending.activate(initiator, flags, s, hs));
            }, defaultQueuingOptions)).result, value
                .then((data) => {
                if (this.value !== value) {
                    return;
                }
                const fulfill = () => {
                    // Deactivation of pending view and the activation of the fulfilled view should not necessarily be sequential.
                    this.postSettlePromise = (this.postSettledTask = q.queueTask(() => resolveAll(pending === null || pending === void 0 ? void 0 : pending.deactivate(initiator, flags), rejected === null || rejected === void 0 ? void 0 : rejected.deactivate(initiator, flags), fulfilled === null || fulfilled === void 0 ? void 0 : fulfilled.activate(initiator, flags, s, hs, data)), defaultQueuingOptions)).result;
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
                    this.postSettlePromise = (this.postSettledTask = q.queueTask(() => resolveAll(pending === null || pending === void 0 ? void 0 : pending.deactivate(initiator, flags), fulfilled === null || fulfilled === void 0 ? void 0 : fulfilled.deactivate(initiator, flags), rejected === null || rejected === void 0 ? void 0 : rejected.activate(initiator, flags, s, hs, err)), defaultQueuingOptions)).result;
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
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        getPromiseController(controller).pending = this;
    }
    activate(initiator, flags, scope, hostScope) {
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(view, this.$controller, flags, scope, hostScope);
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
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        getPromiseController(controller).fulfilled = this;
    }
    activate(initiator, flags, scope, hostScope, resolvedValue) {
        this.value = resolvedValue;
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(view, this.$controller, flags, scope, hostScope);
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
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        getPromiseController(controller).rejected = this;
    }
    activate(initiator, flags, scope, hostScope, error) {
        this.value = error;
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(view, this.$controller, flags, scope, hostScope);
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
    throw new Error('The parent promise.resolve not found; only `*[promise.resolve] > *[pending|then|catch]` relation is supported.');
}
// TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
// @attributePattern({ pattern: 'promise.resolve', symbols: '' })
// export class PromiseAttributePattern {
//   public 'promise.resolve'(name: string, value: string, _parts: string[]): AttrSyntax {
//     return new AttrSyntax(name, value, 'promise', 'bind');
//   }
// }
// @attributePattern({ pattern: 'then', symbols: '' })
// export class FulfilledAttributePattern {
//   public 'then'(name: string, value: string, _parts: string[]): AttrSyntax {
//     return new AttrSyntax(name, value, 'then', 'from-view');
//   }
// }
// @attributePattern({ pattern: 'catch', symbols: '' })
// export class RejectedAttributePattern {
//   public 'catch'(name: string, value: string, _parts: string[]): AttrSyntax {
//     return new AttrSyntax(name, value, 'catch', 'from-view');
//   }
// }

function createElement(p, tagOrType, props, children) {
    if (typeof tagOrType === 'string') {
        return createElementForTag(p, tagOrType, props, children);
    }
    else if (CustomElement.isType(tagOrType)) {
        return createElementForType(p, tagOrType, props, children);
    }
    else {
        throw new Error(`Invalid tagOrType.`);
    }
}
/**
 * RenderPlan. Todo: describe goal of this class
 */
class RenderPlan {
    constructor(node, instructions, dependencies) {
        this.node = node;
        this.instructions = instructions;
        this.dependencies = dependencies;
        this.lazyDefinition = void 0;
    }
    get definition() {
        if (this.lazyDefinition === void 0) {
            this.lazyDefinition = CustomElementDefinition.create({
                name: CustomElement.generateName(),
                template: this.node,
                needsCompile: typeof this.node === 'string',
                instructions: this.instructions,
                dependencies: this.dependencies,
            });
        }
        return this.lazyDefinition;
    }
    getContext(parentContainer) {
        return getRenderContext(this.definition, parentContainer);
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
    instructions.push(new HydrateElementInstruction(tagName, void 0, childInstructions, null));
    if (props) {
        Object.keys(props)
            .forEach(to => {
            const value = props[to];
            if (isInstruction(value)) {
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
                    childInstructions.push(new SetAttributeInstruction(value, to));
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
let Compose = class Compose {
    constructor(p, instruction) {
        this.p = p;
        this.id = nextId('au$component');
        this.subject = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this.properties = instruction.instructions.reduce(toLookup, {});
    }
    attaching(initiator, parent, flags) {
        const { subject, view } = this;
        if (view === void 0 || this.lastSubject !== subject) {
            this.lastSubject = subject;
            this.composing = true;
            return this.compose(void 0, subject, initiator, flags);
        }
        return this.compose(view, subject, initiator, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(this.view, initiator, flags);
    }
    subjectChanged(newValue, previousValue, flags) {
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
        const ret = onResolve(this.deactivate(this.view, null, flags), () => {
            // TODO(fkleuver): handle & test race condition
            return this.compose(void 0, newValue, null, flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    compose(view, subject, initiator, flags) {
        return onResolve(view === void 0
            ? onResolve(subject, resolvedSubject => {
                return this.resolveView(resolvedSubject, flags);
            })
            : view, resolvedView => {
            return this.activate(resolvedView, initiator, flags);
        });
    }
    deactivate(view, initiator, flags) {
        return view === null || view === void 0 ? void 0 : view.deactivate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags);
    }
    activate(view, initiator, flags) {
        const { $controller } = this;
        return onResolve(view === null || view === void 0 ? void 0 : view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, $controller.scope, $controller.hostScope), () => {
            this.composing = false;
        });
    }
    resolveView(subject, flags) {
        const view = this.provideViewFor(subject, flags);
        if (view) {
            view.setLocation(this.$controller.location);
            view.lockScope(this.$controller.scope);
            return view;
        }
        return void 0;
    }
    provideViewFor(subject, flags) {
        if (!subject) {
            return void 0;
        }
        if (isController(subject)) { // IController
            return subject;
        }
        if ('createView' in subject) { // RenderPlan
            return subject.createView(this.$controller.context);
        }
        if ('create' in subject) { // IViewFactory
            return subject.create(flags);
        }
        if ('template' in subject) { // Raw Template Definition
            const definition = CustomElementDefinition.getOrCreate(subject);
            return getRenderContext(definition, this.$controller.context).getViewFactory().create(flags);
        }
        // Constructable (Custom Element Constructor)
        return createElement(this.p, subject, this.properties, this.$controller.host.childNodes).createView(this.$controller.context);
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
], Compose.prototype, "subject", void 0);
__decorate([
    bindable({ mode: BindingMode.fromView })
], Compose.prototype, "composing", void 0);
Compose = __decorate([
    customElement({ name: 'au-compose', template: null, containerless: true }),
    __param(0, IPlatform),
    __param(1, IInstruction)
], Compose);
function isController(subject) {
    return 'lockScope' in subject;
}

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
// export const PromiseAttributePatternRegistration = PromiseAttributePattern as unknown as IRegistry;
// export const FulfilledAttributePatternRegistration = FulfilledAttributePattern as unknown as IRegistry;
// export const RejectedAttributePatternRegistration = RejectedAttributePattern as unknown as IRegistry;
const AttrBindingBehaviorRegistration = AttrBindingBehavior;
const SelfBindingBehaviorRegistration = SelfBindingBehavior;
const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior;
const ComposeRegistration = Compose;
const PortalRegistration = Portal;
const FocusRegistration = Focus;
const BlurRegistration = Blur;
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
    // PromiseAttributePatternRegistration,
    // FulfilledAttributePatternRegistration,
    // RejectedAttributePatternRegistration,
    AttrBindingBehaviorRegistration,
    SelfBindingBehaviorRegistration,
    UpdateTriggerBindingBehaviorRegistration,
    ComposeRegistration,
    PortalRegistration,
    FocusRegistration,
    BlurRegistration,
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
        this._isRunning = false;
        this._isStarting = false;
        this._isStopping = false;
        this._root = void 0;
        this.next = void 0;
        this.startPromise = void 0;
        this.stopPromise = void 0;
        if (container.has(IAurelia, true)) {
            throw new Error('An instance of Aurelia is already registered with the container or an ancestor of it.');
        }
        container.register(Registration.instance(IAurelia, this));
        container.registerResolver(IAppRoot, this.rootProvider = new InstanceProvider('IAppRoot'));
    }
    get isRunning() { return this._isRunning; }
    get isStarting() { return this._isStarting; }
    get isStopping() { return this._isStopping; }
    get root() {
        if (this._root == void 0) {
            if (this.next == void 0) {
                throw new Error(`root is not defined`); // TODO: create error code
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
        this.next = new AppRoot(config, this.initPlatform(config.host), this.container, this.rootProvider, false);
        return this;
    }
    enhance(config) {
        this.next = new AppRoot(config, this.initPlatform(config.host), this.container, this.rootProvider, true);
        return this;
    }
    async waitForIdle() {
        const platform = this.root.platform;
        await platform.domWriteQueue.yield();
        await platform.domReadQueue.yield();
        await platform.taskQueue.yield();
    }
    initPlatform(host) {
        let p;
        if (!this.container.has(IPlatform, false)) {
            if (host.ownerDocument.defaultView === null) {
                throw new Error(`Failed to initialize the platform object. The host element's ownerDocument does not have a defaultView`);
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
        if (root == void 0) {
            throw new Error(`There is no composition root`);
        }
        if (this.startPromise instanceof Promise) {
            return this.startPromise;
        }
        return this.startPromise = onResolve(this.stop(), () => {
            Reflect.set(root.host, '$aurelia', this);
            this.rootProvider.prepare(this._root = root);
            this._isStarting = true;
            return onResolve(root.activate(), () => {
                this._isRunning = true;
                this._isStarting = false;
                this.startPromise = void 0;
                this.dispatchEvent(root, 'au-started', root.host);
            });
        });
    }
    stop(dispose = false) {
        if (this.stopPromise instanceof Promise) {
            return this.stopPromise;
        }
        if (this._isRunning === true) {
            const root = this._root;
            this._isRunning = false;
            this._isStopping = true;
            return this.stopPromise = onResolve(root.deactivate(), () => {
                Reflect.deleteProperty(root.host, '$aurelia');
                if (dispose) {
                    root.dispose();
                }
                this._root = void 0;
                this.rootProvider.dispose();
                this._isStopping = false;
                this.dispatchEvent(root, 'au-stopped', root.host);
            });
        }
    }
    dispose() {
        if (this._isRunning || this._isStopping) {
            throw new Error(`The aurelia instance must be fully stopped before it can be disposed`);
        }
        this.container.dispose();
    }
    dispatchEvent(root, name, target) {
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
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    static get inject() { return [IPlatform, IContainer]; }
    /** @internal */
    activate(settings) {
        var _a;
        const { ctn: container } = this;
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
                const ctrlr = this.controller = Controller.forCustomElement(null, container, cmp, contentHost, null, 0 /* none */, true, CustomElementDefinition.create((_a = this.getDefinition(cmp)) !== null && _a !== void 0 ? _a : { name: CustomElement.generateName(), template }));
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
        if (this.closingPromise) {
            return this.closingPromise;
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
                    this.closingPromise = void 0;
                    if (rejectOnCancel) {
                        throw createDialogCancelError(null, 'Dialog cancellation rejected');
                    }
                    return DialogCloseResult.create("abort" /* Abort */);
                }
                return onResolve((_a = cmp.deactivate) === null || _a === void 0 ? void 0 : _a.call(cmp, dialogResult), () => onResolve(controller.deactivate(controller, null, 4 /* fromUnbind */), () => {
                    dom.dispose();
                    dom.overlay.removeEventListener(mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : 'click', this);
                    if (!rejectOnCancel && status !== "error" /* Error */) {
                        this.resolve(dialogResult);
                    }
                    else {
                        this.reject(createDialogCancelError(value, 'Dialog cancelled with a rejection on cancel'));
                    }
                    return dialogResult;
                }));
            }));
        }).catch(reason => {
            this.closingPromise = void 0;
            throw reason;
        });
        // when component canDeactivate is synchronous, and returns something other than true
        // then the below assignment will override
        // the assignment inside the callback without the deactivating variable check
        this.closingPromise = deactivating ? promise : void 0;
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
                this.reject(closeError);
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
        const ep = new InstanceProvider('ElementResolver');
        ep.prepare(host);
        container.registerResolver(INode, ep);
        container.registerResolver(p.Node, ep);
        container.registerResolver(p.Element, ep);
        container.registerResolver(p.HTMLElement, ep);
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
    constructor(container, p, defaultSettings) {
        this.container = container;
        this.p = p;
        this.defaultSettings = defaultSettings;
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
                throw new Error(`There are still ${openDialogController.length} open dialog(s).`);
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
            const $settings = DialogSettings.from(this.defaultSettings, settings);
            const container = (_a = $settings.container) !== null && _a !== void 0 ? _a : this.container.createChild();
            resolve(onResolve($settings.load(), loadedSettings => {
                const dialogController = container.invoke(DialogController);
                container.register(Registration.instance(IDialogController, dialogController));
                container.register(Registration.callback(DialogController, () => {
                    throw new Error('Invalid injection of DialogController. Use IDialogController instead.');
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
            .validate()
            .normalize();
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
    validate() {
        if (this.component == null && this.template == null) {
            throw new Error('Invalid Dialog Settings. You must provide "component", "template" or both.');
        }
        return this;
    }
    normalize() {
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
        const host = overlay.appendChild(h('div', this.hostCss));
        return new DefaultDialogDom(wrapper, overlay, host);
    }
}
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
    throw new Error('Invalid dialog configuration. ' +
        'Specify the implementations for ' +
        '<IDialogService>, <IDialogGlobalSettings> and <IDialogDomRenderer>, ' +
        'or use the DialogDefaultConfiguration export.');
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

export { AdoptedStyleSheetsStyles, AppRoot, AppTask, AtPrefixedTriggerAttributePattern, AtPrefixedTriggerAttributePatternRegistration, AttrBindingBehavior, AttrBindingBehaviorRegistration, AttrBindingCommand, AttrBindingCommandRegistration, AttrInfo, AttrSyntax, AttributeBinding, AttributeBindingInstruction, AttributeBindingRendererRegistration, AttributeNSAccessor, AttributePattern, AuSlot, AuSlotContentType, AuSlotsInfo, Aurelia, Bindable, BindableDefinition, BindableInfo, BindableObserver, BindingCommand, BindingCommandDefinition, BindingModeBehavior, BindingSymbol, Blur, BlurManager, CSSModulesProcessorRegistry, CallBinding, CallBindingCommand, CallBindingCommandRegistration, CallBindingInstruction, CallBindingRendererRegistration, CaptureBindingCommand, CaptureBindingCommandRegistration, Case, CheckedObserver, Children, ChildrenDefinition, ChildrenObserver, ClassAttributeAccessor, ClassBindingCommand, ClassBindingCommandRegistration, ColonPrefixedBindAttributePattern, ColonPrefixedBindAttributePatternRegistration, Compose, ComposeRegistration, ComputedWatcher, Controller, CustomAttribute, CustomAttributeDefinition, CustomAttributeRendererRegistration, CustomAttributeSymbol, CustomElement, CustomElementDefinition, CustomElementRendererRegistration, CustomElementSymbol, DataAttributeAccessor, DebounceBindingBehavior, DebounceBindingBehaviorRegistration, DefaultBindingCommand, DefaultBindingCommandRegistration, DefaultBindingLanguage, DefaultBindingSyntax, DefaultCase, DefaultComponents, DefaultDialogDom, DefaultDialogDomRenderer, DefaultDialogGlobalSettings, DefaultRenderers, DefaultResources, DelegateBindingCommand, DelegateBindingCommandRegistration, DialogCloseResult, DialogConfiguration, DialogController, DialogDeactivationStatuses, DialogDefaultConfiguration, DialogOpenResult, DialogService, DotSeparatedAttributePattern, DotSeparatedAttributePatternRegistration, ElementInfo, Else, ElseRegistration, EventDelegator, EventSubscriber, ExpressionWatcher, Focus, ForBindingCommand, ForBindingCommandRegistration, FragmentNodeSequence, FrequentMutations, FromViewBindingBehavior, FromViewBindingBehaviorRegistration, FromViewBindingCommand, FromViewBindingCommandRegistration, FulfilledTemplateController, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, IAppRoot, IAppTask, IAttrSyntaxTransformer, IAttributeParser, IAttributePattern, IAuSlotsInfo, IAurelia, IController, IDialogController, IDialogDom, IDialogDomRenderer, IDialogGlobalSettings, IDialogService, IEventDelegator, IEventTarget, IHistory, IInstruction, ILifecycleHooks, ILocation, INode, INodeObserverLocatorRegistration, IPlatform, IProjectionProvider, IProjections, IRenderLocation, IRenderer, ISVGAnalyzer, ISanitizer, IShadowDOMGlobalStyles, IShadowDOMStyleFactory, IShadowDOMStyles, ISyntaxInterpreter, ITemplateCompiler, ITemplateCompilerRegistration, ITemplateElementFactory, IViewFactory, IViewLocator, IWindow, IWorkTracker, If, IfRegistration, InstructionType, InterpolationBinding, InterpolationBindingRendererRegistration, InterpolationInstruction, Interpretation, IteratorBindingInstruction, IteratorBindingRendererRegistration, LetBinding, LetBindingInstruction, LetElementRendererRegistration, LetElementSymbol, LifecycleHooks, LifecycleHooksDefinition, LifecycleHooksEntry, Listener, ListenerBindingInstruction, ListenerBindingRendererRegistration, NodeObserverConfig, NodeObserverLocator, NodeType, NoopSVGAnalyzer, ObserveShallow, OneTimeBindingBehavior, OneTimeBindingBehaviorRegistration, OneTimeBindingCommand, OneTimeBindingCommandRegistration, PendingTemplateController, PlainAttributeSymbol, PlainElementSymbol, Portal, ProjectionContext, ProjectionSymbol, PromiseTemplateController, PropertyBinding, PropertyBindingInstruction, PropertyBindingRendererRegistration, RefAttributePattern, RefAttributePatternRegistration, RefBinding, RefBindingCommandRegistration, RefBindingInstruction, RefBindingRendererRegistration, RegisteredProjections, RejectedTemplateController, RenderPlan, Repeat, RepeatRegistration, SVGAnalyzer, SVGAnalyzerRegistration, SanitizeValueConverter, SanitizeValueConverterRegistration, SelectValueObserver, SelfBindingBehavior, SelfBindingBehaviorRegistration, SetAttributeInstruction, SetAttributeRendererRegistration, SetClassAttributeInstruction, SetClassAttributeRendererRegistration, SetPropertyInstruction, SetPropertyRendererRegistration, SetStyleAttributeInstruction, SetStyleAttributeRendererRegistration, ShadowDOMRegistry, ShortHandBindingSyntax, SignalBindingBehavior, SignalBindingBehaviorRegistration, SlotInfo, StandardConfiguration, StyleAttributeAccessor, StyleBindingCommand, StyleBindingCommandRegistration, StyleConfiguration, StyleElementStyles, StylePropertyBindingInstruction, StylePropertyBindingRendererRegistration, Switch, SymbolFlags, TemplateBinder, TemplateControllerRendererRegistration, TemplateControllerSymbol, TextBindingInstruction, TextBindingRendererRegistration, TextSymbol, ThrottleBindingBehavior, ThrottleBindingBehaviorRegistration, ToViewBindingBehavior, ToViewBindingBehaviorRegistration, ToViewBindingCommand, ToViewBindingCommandRegistration, TriggerBindingCommand, TriggerBindingCommandRegistration, TwoWayBindingBehavior, TwoWayBindingBehaviorRegistration, TwoWayBindingCommand, TwoWayBindingCommandRegistration, UpdateTriggerBindingBehavior, UpdateTriggerBindingBehaviorRegistration, ValueAttributeObserver, ViewFactory, ViewLocator, ViewModelKind, ViewValueConverter, ViewValueConverterRegistration, Views, Watch, With, WithRegistration, attributePattern, bindable, bindingCommand, children, containerless, convertToRenderLocation, createElement, cssModules, customAttribute, customElement, getEffectiveParentNode, getRef, getRenderContext, getTarget, isCustomElementController, isCustomElementViewModel, isInstruction, isRenderContext, isRenderLocation, lifecycleHooks, processContent, renderer, setEffectiveParentNode, setRef, shadowCSS, templateController, useShadowDOM, view, watch };
//# sourceMappingURL=index.js.map
