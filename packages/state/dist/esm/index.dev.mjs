import { DI, Registration, resolve, optional, all, ILogger, lazy, onResolve, isPromise, camelCase, IContainer, Protocol } from '@aurelia/kernel';
import { Scope, connectable, astEvaluate, astBind, astUnbind } from '@aurelia/runtime';
import { IWindow, mixinAstEvaluator, mixingBindingLimited, BindingMode, BindingBehavior, renderer, AppTask, LifecycleHooks, ILifecycleHooks } from '@aurelia/runtime-html';

/** @internal */
const createInterface = DI.createInterface;
/** @internal */
function createStateBindingScope(state, scope) {
    const overrideContext = { bindingContext: state };
    const stateScope = Scope.create(state, overrideContext, true);
    stateScope.parent = scope;
    return stateScope;
}
/** @internal */
function isSubscribable$1(v) {
    return v instanceof Object && 'subscribe' in v;
}

const IActionHandler = /*@__PURE__*/ createInterface('IActionHandler');
const IStore = /*@__PURE__*/ createInterface('IStore');
const IState = /*@__PURE__*/ createInterface('IState');

const actionHandlerSymbol = '__au_ah__';
const ActionHandler = Object.freeze({
    define(actionHandler) {
        function registry(state, action) {
            return actionHandler(state, action);
        }
        registry[actionHandlerSymbol] = true;
        registry.register = function (c) {
            Registration.instance(IActionHandler, actionHandler).register(c);
        };
        return registry;
    },
    isType: (r) => typeof r === 'function' && actionHandlerSymbol in r,
});

const IDevToolsExtension = /*@__PURE__*/ createInterface("IDevToolsExtension", x => x.cachedCallback((container) => {
    const win = container.get(IWindow);
    const devToolsExtension = win.__REDUX_DEVTOOLS_EXTENSION__;
    return devToolsExtension ?? null;
}));

class Store {
    static register(c) {
        c.register(Registration.singleton(this, this), Registration.aliasTo(this, IStore));
    }
    constructor() {
        /** @internal */ this._subs = new Set();
        /** @internal */ this._dispatching = false;
        /** @internal */ this._dispatchQueues = [];
        this._initialState = this._state = resolve(optional(IState)) ?? new State();
        this._handlers = resolve(all(IActionHandler));
        this._logger = resolve(ILogger);
        this._getDevTools = resolve(lazy(IDevToolsExtension));
    }
    subscribe(subscriber) {
        {
            if (this._subs.has(subscriber)) {
                this._logger.warn('A subscriber is trying to subscribe to state change again.');
                return;
            }
        }
        this._subs.add(subscriber);
    }
    unsubscribe(subscriber) {
        {
            if (!this._subs.has(subscriber)) {
                this._logger.warn('Unsubscribing a non-listening subscriber');
                return;
            }
        }
        this._subs.delete(subscriber);
    }
    /** @internal */
    _setState(state) {
        const prevState = this._state;
        this._state = state;
        this._subs.forEach(sub => sub.handleStateChange(state, prevState));
    }
    getState() {
        {
            return new Proxy(this._state, new StateProxyHandler(this, this._logger));
        }
    }
    /** @internal */
    _handleAction(handlers, $state, $action) {
        for (const handler of handlers) {
            $state = onResolve($state, $state => handler($state, $action));
        }
        return onResolve($state, s => s);
    }
    dispatch(action) {
        if (this._dispatching) {
            this._dispatchQueues.push(action);
            return;
        }
        this._dispatching = true;
        const afterDispatch = ($state) => {
            return onResolve($state, s => {
                const $$action = this._dispatchQueues.shift();
                if ($$action != null) {
                    return onResolve(this._handleAction(this._handlers, s, $$action), state => {
                        this._setState(state);
                        return afterDispatch(state);
                    });
                }
                else {
                    this._dispatching = false;
                }
            });
        };
        const newState = this._handleAction(this._handlers, this._state, action);
        if (isPromise(newState)) {
            return newState.then($state => {
                this._setState($state);
                return afterDispatch(this._state);
            }, ex => {
                this._dispatching = false;
                throw ex;
            });
        }
        else {
            this._setState(newState);
            return afterDispatch(this._state);
        }
    }
    /* istanbul ignore next */
    connectDevTools(options) {
        const extension = this._getDevTools();
        const hasDevTools = extension != null;
        if (!hasDevTools) {
            throw new Error('Devtools extension is not available');
        }
        options.name ??= 'Aurelia State plugin';
        const devTools = extension.connect(options);
        devTools.init(this._initialState);
        devTools.subscribe((message) => {
            this._logger.info('DevTools sent a message:', message);
            const payload = typeof message.payload === 'string'
                ? tryParseJson(message.payload)
                : message.payload;
            if (payload === void 0) {
                return;
            }
            if (message.type === "ACTION") {
                if (payload == null) {
                    throw new Error('DevTools sent an action with no payload');
                }
                void new Promise(r => {
                    r(this.dispatch(payload));
                }).catch((ex) => {
                    throw new Error(`Issue when trying to dispatch an action through devtools:\n${ex}`);
                }).then(() => {
                    devTools.send('ACTION', this._state);
                });
                return;
            }
            if (message.type === "DISPATCH" && payload != null) {
                switch (payload.type) {
                    case "JUMP_TO_STATE":
                    case "JUMP_TO_ACTION":
                        this._setState(JSON.parse(message.state));
                        return;
                    case "COMMIT":
                        devTools.init(this._state);
                        return;
                    case "RESET":
                        devTools.init(this._initialState);
                        this._setState(this._initialState);
                        return;
                    case "ROLLBACK": {
                        const parsedState = JSON.parse(message.state);
                        this._setState(parsedState);
                        devTools.send('ROLLBACK', parsedState);
                        return;
                    }
                }
            }
        });
    }
}
class State {
}
class StateProxyHandler {
    constructor(
    /** @internal */ _owner, 
    /** @internal */ _logger) {
        this._owner = _owner;
        this._logger = _logger;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set(target, prop, value, receiver) {
        this._logger.warn(`State is immutable. Dispatch an action to create a new state`);
        return true;
    }
}
/* eslint-enable */
function tryParseJson(str) {
    try {
        return JSON.parse(str);
    }
    catch (ex) {
        // eslint-disable-next-line no-console
        console.log(`Error parsing JSON:\n${(str ?? '').slice(0, 200)}\n${ex}`);
        return undefined;
    }
}

class StateBinding {
    constructor(controller, locator, observerLocator, ast, target, prop, store, strict) {
        this.isBound = false;
        /** @internal */ this._value = void 0;
        /** @internal */ this._sub = void 0;
        /** @internal */ this._updateCount = 0;
        // see Listener binding for explanation
        /** @internal */
        this.boundFn = false;
        this.mode = BindingMode.toView;
        this._controller = controller;
        this.l = locator;
        this._store = store;
        this.oL = observerLocator;
        this.ast = ast;
        this.target = target;
        this.targetProperty = prop;
        this.strict = strict;
    }
    updateTarget(value) {
        const targetAccessor = this._targetObserver;
        const target = this.target;
        const prop = this.targetProperty;
        const updateCount = this._updateCount++;
        const isCurrentValue = () => updateCount === this._updateCount - 1;
        this._unsub();
        if (isSubscribable(value)) {
            this._sub = value.subscribe($value => {
                if (isCurrentValue()) {
                    targetAccessor.setValue($value, target, prop);
                }
            });
            return;
        }
        if (value instanceof Promise) {
            void value.then($value => {
                if (isCurrentValue()) {
                    targetAccessor.setValue($value, target, prop);
                }
            }, () => { });
            return;
        }
        targetAccessor.setValue(value, target, prop);
    }
    bind(_scope) {
        if (this.isBound) {
            return;
        }
        this._targetObserver = this.oL.getAccessor(this.target, this.targetProperty);
        this._store.subscribe(this);
        this.updateTarget(this._value = astEvaluate(this.ast, this._scope = createStateBindingScope(this._store.getState(), _scope), this, this.mode > BindingMode.oneTime ? this : null));
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this._unsub();
        // also disregard incoming future value of promise resolution if any
        this._updateCount++;
        this._scope = void 0;
        this._store.unsubscribe(this);
    }
    handleChange(newValue) {
        if (!this.isBound)
            return;
        const obsRecord = this.obs;
        obsRecord.version++;
        newValue = astEvaluate(this.ast, this._scope, this, this);
        obsRecord.clear();
        this.updateTarget(newValue);
    }
    handleStateChange() {
        if (!this.isBound)
            return;
        const state = this._store.getState();
        const _scope = this._scope;
        const overrideContext = _scope.overrideContext;
        _scope.bindingContext = overrideContext.bindingContext = state;
        const value = astEvaluate(this.ast, _scope, this, this.mode > BindingMode.oneTime ? this : null);
        if (value === this._value) {
            return;
        }
        this._value = value;
        this.updateTarget(value);
    }
    /** @internal */
    _unsub() {
        if (typeof this._sub === 'function') {
            this._sub();
        }
        else if (this._sub !== void 0) {
            this._sub.dispose?.();
            this._sub.unsubscribe?.();
        }
        this._sub = void 0;
    }
}
(() => {
    connectable(StateBinding, null);
    mixinAstEvaluator(StateBinding);
    mixingBindingLimited(StateBinding, () => 'updateTarget');
})();
function isSubscribable(v) {
    return v instanceof Object && 'subscribe' in v;
}

const bindingStateSubscriberMap = new WeakMap();
class StateBindingBehavior {
    constructor() {
        /** @internal */ this._store = resolve(IStore);
    }
    bind(scope, binding) {
        const isStateBinding = binding instanceof StateBinding;
        scope = isStateBinding ? scope : createStateBindingScope(this._store.getState(), scope);
        let subscriber;
        if (!isStateBinding) {
            subscriber = bindingStateSubscriberMap.get(binding);
            if (subscriber == null) {
                bindingStateSubscriberMap.set(binding, subscriber = new StateSubscriber(binding, scope));
            }
            else {
                subscriber._wrappedScope = scope;
            }
            this._store.subscribe(subscriber);
            if (!binding.useScope) {
                // eslint-disable-next-line no-console
                console.warn(`Binding ${binding.constructor.name} does not support "state" binding behavior`);
            }
            binding.useScope?.(scope);
        }
    }
    unbind(scope, binding) {
        const isStateBinding = binding instanceof StateBinding;
        if (!isStateBinding) {
            this._store.unsubscribe(bindingStateSubscriberMap.get(binding));
            bindingStateSubscriberMap.delete(binding);
        }
    }
}
BindingBehavior.define('state', StateBindingBehavior);
class StateSubscriber {
    constructor(_binding, _wrappedScope) {
        this._binding = _binding;
        this._wrappedScope = _wrappedScope;
    }
    handleStateChange(state) {
        const scope = this._wrappedScope;
        const overrideContext = scope.overrideContext;
        scope.bindingContext = overrideContext.bindingContext = state;
        this._binding.handleChange?.(undefined, undefined);
    }
}

class StateDispatchBinding {
    constructor(locator, expr, target, prop, store, strict) {
        this.isBound = false;
        // see Listener binding for explanation
        /** @internal */
        this.boundFn = false;
        this.l = locator;
        this._store = store;
        this.ast = expr;
        this._target = target;
        this._targetProperty = prop;
        this.strict = strict;
    }
    callSource(e) {
        const scope = this._scope;
        scope.overrideContext.$event = e;
        const value = astEvaluate(this.ast, scope, this, null);
        delete scope.overrideContext.$event;
        void this._store.dispatch(value);
    }
    handleEvent(e) {
        this.callSource(e);
    }
    bind(_scope) {
        if (this.isBound) {
            return;
        }
        astBind(this.ast, _scope, this);
        this._scope = createStateBindingScope(this._store.getState(), _scope);
        this._target.addEventListener(this._targetProperty, this);
        this._store.subscribe(this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        astUnbind(this.ast, this._scope, this);
        this._scope = void 0;
        this._target.removeEventListener(this._targetProperty, this);
        this._store.unsubscribe(this);
    }
    handleStateChange(state) {
        const scope = this._scope;
        const overrideContext = scope.overrideContext;
        scope.bindingContext = overrideContext.bindingContext = state;
    }
}
(() => {
    connectable(StateDispatchBinding, null);
    mixinAstEvaluator(StateDispatchBinding);
    mixingBindingLimited(StateDispatchBinding, () => 'callSource');
})();

class StateBindingCommand {
    get ignoreAttr() { return false; }
    build(info, parser, attrMapper) {
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
        return new StateBindingInstruction(value, target);
    }
}
StateBindingCommand.$au = {
    type: 'binding-command',
    name: 'state',
};
class DispatchBindingCommand {
    get ignoreAttr() { return true; }
    build(info) {
        const attr = info.attr;
        return new DispatchBindingInstruction(attr.target, attr.rawValue);
    }
}
DispatchBindingCommand.$au = {
    type: 'binding-command',
    name: 'dispatch',
};
class StateBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = 'sb';
    }
}
class DispatchBindingInstruction {
    constructor(from, ast) {
        this.from = from;
        this.ast = ast;
        this.type = 'sd';
    }
}
const StateBindingInstructionRenderer = /*@__PURE__*/ renderer(class StateBindingInstructionRenderer {
    constructor() {
        this.target = 'sb';
        /** @internal */ this._stateContainer = resolve(IStore);
    }
    render(renderingCtrl, target, instruction, platform, exprParser, observerLocator) {
        const ast = ensureExpression(exprParser, instruction.from, 'IsFunction');
        renderingCtrl.addBinding(new StateBinding(renderingCtrl, renderingCtrl.container, observerLocator, ast, target, instruction.to, this._stateContainer, renderingCtrl.strict ?? false));
    }
}, null);
const DispatchBindingInstructionRenderer = /*@__PURE__*/ renderer(class DispatchBindingInstructionRenderer {
    constructor() {
        this.target = 'sd';
        /** @internal */ this._stateContainer = resolve(IStore);
    }
    render(renderingCtrl, target, instruction, platform, exprParser) {
        const expr = ensureExpression(exprParser, instruction.ast, 'IsProperty');
        renderingCtrl.addBinding(new StateDispatchBinding(renderingCtrl.container, expr, target, instruction.from, this._stateContainer, renderingCtrl.strict ?? false));
    }
}, null);
function ensureExpression(parser, srcOrExpr, expressionType) {
    if (typeof srcOrExpr === 'string') {
        return parser.parse(srcOrExpr, expressionType);
    }
    return srcOrExpr;
}

const standardRegistrations = [
    StateBindingCommand,
    StateBindingInstructionRenderer,
    DispatchBindingCommand,
    DispatchBindingInstructionRenderer,
    StateBindingBehavior,
    Store,
];
const createConfiguration = (initialState, actionHandlers, options = {}) => {
    return {
        register: (c) => {
            c.register(Registration.instance(IState, initialState), ...standardRegistrations, ...actionHandlers.map(ActionHandler.define), 
            /* istanbul ignore next */
            AppTask.creating(IContainer, container => {
                const store = container.get(IStore);
                const devTools = container.get(IDevToolsExtension);
                if (options.devToolsOptions?.disable !== true && devTools != null) {
                    store.connectDevTools(options.devToolsOptions ?? {});
                }
            }));
        },
        init: (state, optionsOrHandler, ...actionHandlers) => {
            const isHandler = typeof optionsOrHandler === 'function';
            const options = isHandler ? {} : optionsOrHandler;
            actionHandlers = isHandler ? [optionsOrHandler, ...actionHandlers] : actionHandlers;
            return createConfiguration(state, actionHandlers, options);
        }
    };
};
const StateDefaultConfiguration = /*@__PURE__*/ createConfiguration({}, []);

class StateGetterBinding {
    constructor(target, prop, store, getValue) {
        this.isBound = false;
        /** @internal */ this._value = void 0;
        /** @internal */ this._sub = void 0;
        /** @internal */ this._updateCount = 0;
        this._store = store;
        this.$get = getValue;
        this.target = target;
        this.key = prop;
    }
    updateTarget(value) {
        const target = this.target;
        const prop = this.key;
        const updateCount = this._updateCount++;
        const isCurrentValue = () => updateCount === this._updateCount - 1;
        this._unsub();
        if (isSubscribable$1(value)) {
            this._sub = value.subscribe($value => {
                if (isCurrentValue()) {
                    target[prop] = $value;
                }
            });
            return;
        }
        if (value instanceof Promise) {
            void value.then($value => {
                if (isCurrentValue()) {
                    target[prop] = $value;
                }
            }, () => { });
            return;
        }
        target[prop] = value;
    }
    bind(_scope) {
        if (this.isBound) {
            return;
        }
        const state = this._store.getState();
        this._scope = createStateBindingScope(state, _scope);
        this._store.subscribe(this);
        this.updateTarget(this._value = this.$get(state));
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this._unsub();
        // also disregard incoming future value of promise resolution if any
        this._updateCount++;
        this._scope = void 0;
        this._store.unsubscribe(this);
    }
    handleStateChange(state) {
        const _scope = this._scope;
        const overrideContext = _scope.overrideContext;
        _scope.bindingContext = overrideContext.bindingContext = state;
        const value = this.$get(this._store.getState());
        if (value === this._value) {
            return;
        }
        this._value = value;
        this.updateTarget(value);
    }
    /** @internal */
    _unsub() {
        if (typeof this._sub === 'function') {
            this._sub();
        }
        else if (this._sub !== void 0) {
            this._sub.dispose?.();
            this._sub.unsubscribe?.();
        }
        this._sub = void 0;
    }
}
connectable(StateGetterBinding, null);

/**
 * A decorator for component properties whose values derived from global state
 * Usage example:
 *
 * ```ts
 * class MyComponent {
 *  \@fromState(s => s.items)
 *   data: Item[]
 * }
 * ```
 */
function fromState(getValue) {
    return function (target, context) {
        if (!((target === void 0 && context.kind === 'field') || (typeof target === 'function' && context.kind === 'setter'))) {
            throw new Error(`Invalid usage. @state can only be used on a field ${target} - ${context.kind}`);
        }
        const key = context.name;
        const dependencies = context.metadata[dependenciesKey] ??= [];
        // As we don't have a way to grab the constructor function here, we add both the hooks as dependencies.
        // However, the hooks checks how the component is used and adds only a single binding.
        // Improvement idea: add a way to declare the target types for the hooks and lazily create the hooks only for those types (sort of hook factory?).
        dependencies.push(new HydratingLifecycleHooks(getValue, key), new CreatedLifecycleHooks(getValue, key));
    };
}
const dependenciesKey = Protocol.annotation.keyFor('dependencies');
class HydratingLifecycleHooks {
    constructor($get, key) {
        this.$get = $get;
        this.key = key;
    }
    register(c) {
        Registration.instance(ILifecycleHooks, this).register(c);
    }
    hydrating(vm, controller) {
        const container = controller.container;
        if (controller.vmKind !== 'customElement')
            return;
        controller.addBinding(new StateGetterBinding(vm, this.key, container.get(IStore), this.$get));
    }
}
LifecycleHooks.define({}, HydratingLifecycleHooks);
class CreatedLifecycleHooks {
    constructor($get, key) {
        this.$get = $get;
        this.key = key;
    }
    register(c) {
        Registration.instance(ILifecycleHooks, this).register(c);
    }
    created(vm, controller) {
        const container = controller.container;
        if (controller.vmKind !== 'customAttribute')
            return;
        controller.addBinding(new StateGetterBinding(vm, this.key, container.get(IStore), this.$get));
    }
}
LifecycleHooks.define({}, CreatedLifecycleHooks);

export { ActionHandler, DispatchBindingCommand, DispatchBindingInstruction, DispatchBindingInstructionRenderer, IActionHandler, IState, IStore, StateBinding, StateBindingBehavior, StateBindingCommand, StateBindingInstruction, StateBindingInstructionRenderer, StateDefaultConfiguration, StateDispatchBinding, fromState };
//# sourceMappingURL=index.dev.mjs.map
