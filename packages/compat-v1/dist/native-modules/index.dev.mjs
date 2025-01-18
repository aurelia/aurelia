import { BindingBehaviorExpression, ValueConverterExpression, AssignExpression, ConditionalExpression, AccessThisExpression, AccessScopeExpression, AccessMemberExpression, AccessKeyedExpression, CallScopeExpression, CallMemberExpression, CallFunctionExpression, BinaryExpression, UnaryExpression, PrimitiveLiteralExpression, ArrayLiteralExpression, ObjectLiteralExpression, TemplateExpression, TaggedTemplateExpression, ArrayBindingPattern, ObjectBindingPattern, BindingIdentifier, ForOfStatement, Interpolation, DestructuringAssignmentExpression, DestructuringAssignmentSingleExpression, DestructuringAssignmentRestExpression, ArrowFunction, astVisit, Unparser, IExpressionParser } from '../../../expression-parser/dist/native-modules/index.mjs';
import { astEvaluate, astAssign, astBind, astUnbind, IObserverLocator, getCollectionObserver, Scope } from '../../../runtime/dist/native-modules/index.mjs';
import { mixinUseScope, mixingBindingLimited, mixinAstEvaluator, renderer, IListenerBindingOptions, IEventTarget, AppTask, PropertyBinding, AttributeBinding, ListenerBinding, LetBinding, InterpolationPartBinding, ContentBinding, RefBinding, AuCompose, CustomElement, BindableDefinition, ExpressionWatcher } from '../../../runtime-html/dist/native-modules/index.mjs';
import { Protocol, isString, camelCase, resolve, isFunction, DI, createLookup, getResourceKeyFor } from '../../../kernel/dist/native-modules/index.mjs';
import { Metadata } from '../../../metadata/dist/native-modules/index.mjs';

let defined$1 = false;
function defineAstMethods() {
    if (defined$1) {
        return;
    }
    defined$1 = true;
    const def = (Klass, name, value) => Object.defineProperty(Klass.prototype, name, { configurable: true, enumerable: false, writable: true, value });
    [
        BindingBehaviorExpression,
        ValueConverterExpression,
        AssignExpression,
        ConditionalExpression,
        AccessThisExpression,
        AccessScopeExpression,
        AccessMemberExpression,
        AccessKeyedExpression,
        CallScopeExpression,
        CallMemberExpression,
        CallFunctionExpression,
        BinaryExpression,
        UnaryExpression,
        PrimitiveLiteralExpression,
        ArrayLiteralExpression,
        ObjectLiteralExpression,
        TemplateExpression,
        TaggedTemplateExpression,
        ArrayBindingPattern,
        ObjectBindingPattern,
        BindingIdentifier,
        ForOfStatement,
        Interpolation,
        DestructuringAssignmentExpression,
        DestructuringAssignmentSingleExpression,
        DestructuringAssignmentRestExpression,
        ArrowFunction,
    ].forEach(ast => {
        def(ast, 'evaluate', function (...args) {
            return astEvaluate(this, ...args);
        });
        def(ast, 'assign', function (...args) {
            return astAssign(this, ...args);
        });
        def(ast, 'accept', function (...args) {
            return astVisit(this, ...args);
        });
        def(ast, 'bind', function (...args) {
            return astBind(this, ...args);
        });
        def(ast, 'unbind', function (...args) {
            return astUnbind(this, ...args);
        });
    });
    console.warn('"evaluate"/"assign"/"accept"/"visit"/"bind"/"unbind" are only valid on AST with ast $kind "Custom".'
        + ' Import and use astEvaluate/astAssign/astVisit/astBind/astUnbind accordingly.');
}

// /** @internal */ export const rethrow = (err: unknown) => { throw err; };
// /** @internal */ export const areEqual = Object.is;
/** @internal */
const def = Reflect.defineProperty;
/** @internal */
const defineHiddenProp = (obj, key, value) => {
    def(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value
    });
    return value;
};
/** @internal */
const ensureExpression = (parser, srcOrExpr, expressionType) => {
    if (isString(srcOrExpr)) {
        return parser.parse(srcOrExpr, expressionType);
    }
    return srcOrExpr;
};
/** @internal */ const etIsFunction = 'IsFunction';
/** @internal */ const getMetadata = Metadata.get;
/** @internal */ Metadata.has;
/** @internal */ const defineMetadata = Metadata.define;
const { annotation } = Protocol;
/** @internal */ const getAnnotationKeyFor = annotation.keyFor;

const callRegisteredContainer = new WeakSet();
const callSyntax = {
    register(container) {
        if (!callRegisteredContainer.has(container)) {
            callRegisteredContainer.add(container);
            container.register(CallBindingCommand, CallBindingRenderer);
        }
    }
};
const instructionType = 'rh';
class CallBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = instructionType;
    }
}
class CallBindingCommand {
    get ignoreAttr() { return false; }
    build(info, exprParser) {
        const target = info.bindable === null
            ? camelCase(info.attr.target)
            : info.bindable.name;
        return new CallBindingInstruction(exprParser.parse(info.attr.rawValue, etIsFunction), target);
    }
}
CallBindingCommand.$au = {
    type: 'binding-command',
    name: 'call',
};
const CallBindingRenderer = /*@__PURE__*/ renderer(class CallBindingRenderer {
    constructor() {
        this.target = instructionType;
    }
    render(renderingCtrl, target, instruction, platform, exprParser, observerLocator) {
        const expr = ensureExpression(exprParser, instruction.from, etIsFunction);
        renderingCtrl.addBinding(new CallBinding(renderingCtrl.container, observerLocator, expr, getTarget(target), instruction.to));
    }
}, null);
function getTarget(potentialTarget) {
    if (potentialTarget.viewModel != null) {
        return potentialTarget.viewModel;
    }
    return potentialTarget;
}
class CallBinding {
    constructor(locator, observerLocator, ast, target, targetProperty) {
        this.ast = ast;
        this.target = target;
        this.targetProperty = targetProperty;
        this.isBound = false;
        // see Listener binding for explanation
        /** @internal */
        this.boundFn = false;
        this.l = locator;
        this.targetObserver = observerLocator.getAccessor(target, targetProperty);
    }
    callSource(args) {
        const overrideContext = this._scope.overrideContext;
        overrideContext.$event = args;
        const result = astEvaluate(this.ast, this._scope, this, null);
        Reflect.deleteProperty(overrideContext, '$event');
        return result;
    }
    bind(_scope) {
        if (this.isBound) {
            if (this._scope === _scope) {
                return;
            }
            this.unbind();
        }
        this._scope = _scope;
        astBind(this.ast, _scope, this);
        this.targetObserver.setValue(($args) => this.callSource($args), this.target, this.targetProperty);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        astUnbind(this.ast, this._scope, this);
        this._scope = void 0;
        this.targetObserver.setValue(null, this.target, this.targetProperty);
    }
}
(() => {
    mixinUseScope(CallBinding);
    mixingBindingLimited(CallBinding, () => 'callSource');
    mixinAstEvaluator(CallBinding);
})();

const preventDefaultRegisteredContainer = new WeakSet();
const eventPreventDefaultBehavior = {
    /* istanbul ignore next */
    register(container) {
        if (preventDefaultRegisteredContainer.has(container)) {
            return;
        }
        preventDefaultRegisteredContainer.add(container);
        container.get(IListenerBindingOptions).prevent = true;
    }
};
const delegateRegisteredContainer = new WeakSet();
const delegateSyntax = {
    /* istanbul ignore next */
    register(container) {
        if (!delegateRegisteredContainer.has(container)) {
            delegateRegisteredContainer.add(container);
            container.register(IEventDelegator, DelegateBindingCommand, ListenerBindingRenderer);
        }
    }
};
class DelegateBindingCommand {
    get ignoreAttr() { return true; }
    build(info, exprParser) {
        return new DelegateBindingInstruction(exprParser.parse(info.attr.rawValue, etIsFunction), info.attr.target, true);
    }
}
DelegateBindingCommand.$au = {
    type: 'binding-command',
    name: 'delegate',
};
/** @internal */
const ListenerBindingRenderer = /*@__PURE__*/ renderer(class ListenerBindingRenderer {
    constructor() {
        this.target = 'dl';
        /** @internal */
        this._eventDelegator = resolve(IEventDelegator);
    }
    render(renderingCtrl, target, instruction, platform, exprParser) {
        const expr = ensureExpression(exprParser, instruction.from, etIsFunction);
        renderingCtrl.addBinding(new DelegateListenerBinding(renderingCtrl.container, expr, target, instruction.to, this._eventDelegator, new DelegateListenerOptions(instruction.preventDefault)));
    }
}, null);
class DelegateBindingInstruction {
    constructor(from, to, preventDefault) {
        this.from = from;
        this.to = to;
        this.preventDefault = preventDefault;
        this.type = 'dl';
    }
}
class DelegateListenerOptions {
    constructor(prevent) {
        this.prevent = prevent;
    }
}
/**
 * Listener binding. Handle event binding between view and view model
 */
class DelegateListenerBinding {
    constructor(locator, ast, target, targetEvent, eventDelegator, options) {
        this.ast = ast;
        this.target = target;
        this.targetEvent = targetEvent;
        this.eventDelegator = eventDelegator;
        this.isBound = false;
        this.handler = null;
        /**
         * Indicates if this binding evaluates an ast and get a function, that function should be bound
         * to the instance it is on
         *
         * @internal
         */
        this.boundFn = true;
        this.self = false;
        this.l = locator;
        this._options = options;
    }
    callSource(event) {
        const overrideContext = this._scope.overrideContext;
        overrideContext.$event = event;
        let result = astEvaluate(this.ast, this._scope, this, null);
        delete overrideContext.$event;
        if (isFunction(result)) {
            result = result(event);
        }
        if (result !== true && this._options.prevent) {
            event.preventDefault();
        }
        return result;
    }
    handleEvent(event) {
        if (this.self) {
            /* istanbul ignore next */
            if (this.target !== event.composedPath()[0]) {
                return;
            }
        }
        this.callSource(event);
    }
    bind(_scope) {
        if (this.isBound) {
            if (this._scope === _scope) {
                return;
            }
            this.unbind();
        }
        this._scope = _scope;
        astBind(this.ast, _scope, this);
        this.handler = this.eventDelegator.addEventListener(this.l.get(IEventTarget), this.target, this.targetEvent, this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        astUnbind(this.ast, this._scope, this);
        this._scope = void 0;
        this.handler.dispose();
        this.handler = null;
    }
}
(() => {
    mixinUseScope(DelegateListenerBinding);
    mixingBindingLimited(DelegateListenerBinding, () => 'callSource');
    mixinAstEvaluator(DelegateListenerBinding);
})();
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
            lookups.set(target, lookup = createLookup());
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
            if (isFunction(listener)) {
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
const IEventDelegator = /*@__PURE__*/ DI.createInterface('IEventDelegator', x => x.cachedCallback((handler) => {
    const instance = handler.invoke(EventDelegator);
    handler.register(AppTask.deactivating(() => instance.dispose()));
    return instance;
}));
class EventDelegator {
    constructor() {
        /** @internal */
        this._trackerMaps = createLookup();
    }
    addEventListener(publisher, target, eventName, listener, options) {
        const trackerMap = this._trackerMaps[eventName] ??= new Map();
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

/* eslint-disable no-console */
let defined = false;
const defineBindingMethods = () => {
    if (defined)
        return;
    defined = true;
    [
        [PropertyBinding, 'Property binding'],
        [AttributeBinding, 'Attribute binding'],
        [ListenerBinding, 'Listener binding'],
        [CallBinding, 'Call binding'],
        [LetBinding, 'Let binding'],
        [InterpolationPartBinding, 'Interpolation binding'],
        [ContentBinding, 'Text binding'],
        [RefBinding, 'Ref binding'],
        [DelegateListenerBinding, 'Delegate Listener binding']
    ].forEach(([b, name]) => {
        Object.defineProperty(b.prototype, 'sourceExpression', {
            configurable: true,
            enumerable: false,
            get() {
                console.warn(getMessage(name, this.ast));
                return this.ast;
            },
            set(v) {
                console.warn(getMessage(name, this.ast));
                Reflect.set(this, 'ast', v);
            }
        });
    });
    const getMessage = (name, ast) => console.warn(`[DEV:aurelia] @deprecated "sourceExpression" property for expression on ${name}. It has been renamed to "ast". expression: "${Unparser.unparse(ast)}"`);
};

let compatEnabled = false;
let addedMetadata = false;
const prototype = AuCompose.prototype;
const ignore = Symbol();
const originalAttaching = prototype.attaching;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const originalPropertyChanged = prototype.propertyChanged;
/**
 * Ensure `<au-compose/>` works with v1 syntaxes:
 * - Prop: viewModel -> component:
 * - template syntax: view-model.bind -> component.bind
 *
 * - Prop: view -> template
 * - template syntax: view.bind -> template.bind
 */
function enableComposeCompat() {
    if (compatEnabled) {
        return;
    }
    compatEnabled = true;
    if (!addedMetadata) {
        addedMetadata = true;
        const def = CustomElement.getDefinition(AuCompose);
        def.bindables.viewModel = BindableDefinition.create('viewModel');
        def.bindables.view = BindableDefinition.create('view');
    }
    defineHiddenProp(prototype, 'viewModelChanged', function (value) {
        this.component = value;
    });
    defineHiddenProp(prototype, 'viewChanged', function (value) {
        this.template = value;
    });
    defineHiddenProp(prototype, 'attaching', function (...rest) {
        this[ignore] = true;
        if (this.viewModel !== void 0) {
            this.component = this.viewModel;
        }
        if (this.view !== void 0) {
            this.template = this.view;
        }
        this[ignore] = false;
        return originalAttaching.apply(this, rest);
    });
    defineHiddenProp(prototype, 'propertyChanged', function (name) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (this[ignore]) {
            return;
        }
        switch (name) {
            // already handled via the change handler calls
            case 'viewModel':
            case 'view': return;
        }
        return originalPropertyChanged.call(this, name);
    });
}
function disableComposeCompat() {
    if (!compatEnabled) {
        return;
    }
    if (addedMetadata) {
        addedMetadata = false;
        const def = CustomElement.getDefinition(AuCompose);
        delete def.bindables.viewModel;
        delete def.bindables.view;
    }
    compatEnabled = false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete prototype.viewModelChanged;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete prototype.viewChanged;
    defineHiddenProp(prototype, 'attaching', originalAttaching);
    defineHiddenProp(prototype, 'propertyChanged', originalPropertyChanged);
}

class BindingEngine {
    constructor() {
        this.parser = resolve(IExpressionParser);
        this.observerLocator = resolve(IObserverLocator);
    }
    propertyObserver(object, prop) {
        return {
            subscribe: (callback) => {
                const observer = this.observerLocator.getObserver(object, prop);
                const subscriber = {
                    handleChange: (newValue, oldValue) => callback(newValue, oldValue)
                };
                observer.subscribe(subscriber);
                return {
                    dispose: () => observer.unsubscribe(subscriber)
                };
            },
        };
    }
    collectionObserver(collection) {
        return {
            subscribe: (callback) => {
                const observer = getCollectionObserver(collection);
                const subscriber = {
                    handleCollectionChange: (collection, indexMap) => callback(collection, indexMap)
                };
                observer?.subscribe(subscriber);
                return {
                    dispose: () => observer?.unsubscribe(subscriber)
                };
            }
        };
    }
    expressionObserver(bindingContext, expression) {
        const scope = Scope.create(bindingContext, {}, true);
        return {
            subscribe: callback => {
                const observer = new ExpressionWatcher(scope, null, this.observerLocator, this.parser.parse(expression, 'IsProperty'), callback);
                observer.bind();
                return {
                    dispose: () => observer.unbind()
                };
            }
        };
    }
}

function noView(target, context) {
    if (target === void 0) {
        return function ($target, $context) {
            $context.addInitializer(function () {
                setTemplate($target, null);
            });
        };
    }
    context.addInitializer(function () {
        setTemplate(target, null);
    });
}
/**
 * Decorator: Indicates that the custom element has a markup defined inline in this decorator.
 */
function inlineView(template) {
    return function ($target, context) {
        context.addInitializer(function () {
            setTemplate($target, template);
        });
    };
}
const elementTypeName = 'custom-element';
const elementBaseName = /*@__PURE__*/ getResourceKeyFor(elementTypeName);
const annotateElementMetadata = (Type, prop, value) => {
    defineMetadata(value, Type, getAnnotationKeyFor(prop));
};
/** Manipulates the `template` property of the custom element definition for the type, when present else it annotates the type. */
function setTemplate(target, template) {
    const def = getMetadata(elementBaseName, target);
    if (def === void 0) {
        annotateElementMetadata(target, 'template', template);
        return;
    }
    def.template = template;
}

/**
 * Register all services/functionalities necessary for a v1 app to work with Aurelia v2.
 *
 * Ideally should only be used for migration as there maybe be perf penalties to application doing it this way.
 */
const compatRegistration = {
    register(container) {
        defineAstMethods();
        defineBindingMethods();
        enableComposeCompat();
        container.register(eventPreventDefaultBehavior, delegateSyntax, callSyntax);
    }
};

export { BindingEngine, CallBinding, CallBindingCommand, CallBindingInstruction, CallBindingRenderer, DelegateBindingCommand, DelegateBindingInstruction, DelegateListenerBinding, DelegateListenerOptions, EventDelegator, IEventDelegator, ListenerBindingRenderer, callSyntax, compatRegistration, delegateSyntax, disableComposeCompat, enableComposeCompat, eventPreventDefaultBehavior, inlineView, noView };
//# sourceMappingURL=index.dev.mjs.map
