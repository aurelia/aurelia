/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { nextId, isObject, ILogger, resolveAll, Metadata, DI, } from '@aurelia/kernel';
import { Scope, ILifecycle, BindableObserver, } from '@aurelia/runtime';
import { convertToRenderLocation } from '../dom';
import { CustomElementDefinition, CustomElement } from '../resources/custom-element';
import { CustomAttribute } from '../resources/custom-attribute';
import { getRenderContext } from './render-context';
import { ChildrenObserver } from './children';
import { IAppRoot } from '../app-root';
import { IPlatform } from '../platform';
import { IShadowDOMGlobalStyles, IShadowDOMStyles } from './styles';
function callDispose(disposable) {
    disposable.dispose();
}
export var MountTarget;
(function (MountTarget) {
    MountTarget[MountTarget["none"] = 0] = "none";
    MountTarget[MountTarget["host"] = 1] = "host";
    MountTarget[MountTarget["shadowRoot"] = 2] = "shadowRoot";
    MountTarget[MountTarget["location"] = 3] = "location";
})(MountTarget || (MountTarget = {}));
const controllerLookup = new WeakMap();
export class Controller {
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
        this.mountTarget = 0 /* none */;
        this.shadowRoot = null;
        this.nodes = null;
        this.context = null;
        this.location = null;
        this.state = 0 /* none */;
        this.logger = null;
        this.debug = false;
        this.fullyNamed = false;
        this.$initiator = null;
        this.$flags = 0 /* none */;
        if (root === null && container.has(IAppRoot, true)) {
            this.root = container.get(IAppRoot);
        }
        this.platform = container.get(IPlatform);
        this.lifecycle = container.get(ILifecycle);
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
        var _a, _b, _c, _d, _e;
        let parentName = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '';
        parentName = parentName.length > 0 ? `${parentName} -> ` : '';
        switch (this.vmKind) {
            case 1 /* customAttribute */:
                return `${parentName}Attribute<${(_c = this.viewModel) === null || _c === void 0 ? void 0 : _c.constructor.name}>`;
            case 0 /* customElement */:
                return `${parentName}Element<${(_d = this.viewModel) === null || _d === void 0 ? void 0 : _d.constructor.name}>`;
            case 2 /* synthetic */:
                return `${parentName}View<${(_e = this.viewFactory) === null || _e === void 0 ? void 0 : _e.name}>`;
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
        var _a;
        const controller = new Controller(
        /* root           */ root, 
        /* container      */ context, 2 /* synthetic */, 
        /* flags          */ flags, 
        /* definition     */ null, 
        /* viewFactory    */ viewFactory, 
        /* viewModel      */ null, 
        /* host           */ null);
        // deepscan-disable-next-line
        controller.parent = (_a = parentController) !== null && _a !== void 0 ? _a : null;
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
        createObservers(this.lifecycle, definition, flags, instance);
        createChildrenObservers(this, definition, flags, instance);
        this.scope = Scope.create(flags, this.viewModel, null, true);
        const hooks = this.hooks;
        if (hooks.hasDefine) {
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
        if (shadowOptions !== null || hasSlots) {
            if (containerless) {
                throw new Error('You cannot combine the containerless custom element option with Shadow DOM.');
            }
            Metadata.define(CustomElement.name, this, this.host);
            this.setShadowRoot(this.shadowRoot = this.host.attachShadow(shadowOptions !== null && shadowOptions !== void 0 ? shadowOptions : defaultShadowOptions));
        }
        else if (containerless) {
            this.setLocation(this.location = convertToRenderLocation(this.host));
        }
        else {
            this.setHost(this.host);
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
        createObservers(this.lifecycle, definition, this.flags, instance);
        instance.$controller = this;
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
        flags |= 32 /* fromBind */;
        switch (this.vmKind) {
            case 0 /* customElement */:
                // Custom element scope is created and assigned during hydration
                this.scope.parentScope = scope !== null && scope !== void 0 ? scope : null;
                break;
            case 1 /* customAttribute */:
                this.scope = scope !== null && scope !== void 0 ? scope : null;
                break;
            case 2 /* synthetic */:
                if (scope === void 0 || scope === null) {
                    throw new Error(`Scope is null or undefined`);
                }
                if (!this.hasLockedScope) {
                    this.scope = scope;
                }
                break;
        }
        if (this.isStrictBinding) {
            flags |= 4 /* isStrictBindingStrategy */;
        }
        this.$initiator = initiator;
        this.$flags = flags;
        if (this.hooks.hasBinding) {
            if (this.debug) {
                this.logger.trace(`binding()`);
            }
            const ret = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                return ret.then(this.bind.bind(this));
            }
        }
        return this.bind();
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
                return ret.then(this.attach.bind(this));
            }
        }
        return this.attach();
    }
    attach() {
        var _a;
        if (this.debug) {
            this.logger.trace(`attach()`);
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
        let ret = void 0;
        let promises = void 0;
        if (this.hooks.hasAttaching) {
            if (this.debug) {
                this.logger.trace(`attaching()`);
            }
            ret = this.viewModel.attaching(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                promises = [ret];
            }
        }
        if (this.children !== null) {
            for (let i = 0; i < this.children.length; ++i) {
                ret = this.children[i].activate(this.$initiator, this, this.$flags, this.scope, this.hostScope);
                if (ret instanceof Promise) {
                    (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
                }
            }
        }
        ret = promises === void 0 ? void 0 : resolveAll(...promises);
        if (ret instanceof Promise) {
            return ret.then(this.attached.bind(this));
        }
        return this.attached();
    }
    attached() {
        this.state = 2 /* activated */;
        if (this.hooks.hasAttached) {
            if (this.debug) {
                this.logger.trace(`attached()`);
            }
            return this.viewModel.attached(this.$initiator, this.$flags);
        }
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
        let promises = void 0;
        let ret = void 0;
        if (this.children !== null) {
            for (let i = 0; i < this.children.length; ++i) {
                ret = this.children[i].deactivate(initiator, this, flags);
                if (ret instanceof Promise) {
                    (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
                }
            }
        }
        if (this.hooks.hasDetaching) {
            if (this.debug) {
                this.logger.trace(`detaching()`);
            }
            ret = this.viewModel.detaching(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
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
        ret = promises === void 0 ? void 0 : resolveAll(...promises);
        if (initiator !== this) {
            // Only detaching is called + the linked list is built when any controller that is not the initiator, is deactivated.
            // The rest is handled by the initiator.
            // This means that descendant controllers have to make sure to await the initiator's promise before doing any subsequent
            // controller api calls, or race conditions might occur.
            return ret;
        }
        if (ret instanceof Promise) {
            return ret.then(this.detach.bind(this));
        }
        return this.detach();
    }
    detach() {
        if (this.debug) {
            this.logger.trace(`detach()`);
        }
        switch (this.vmKind) {
            case 0 /* customElement */:
            case 2 /* synthetic */:
                this.nodes.remove();
                this.nodes.unlink();
        }
        let promises = void 0;
        let ret = void 0;
        let cur = this.$initiator.head;
        let next = null;
        while (cur !== null) {
            if (cur !== this) {
                if (cur.debug) {
                    cur.logger.trace(`detach()`);
                }
                switch (cur.vmKind) {
                    case 0 /* customElement */:
                    case 2 /* synthetic */:
                        cur.nodes.remove();
                        cur.nodes.unlink();
                }
            }
            ret = cur.unbinding();
            if (ret instanceof Promise) {
                (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
            }
            next = cur.next;
            cur.next = null;
            cur = next;
        }
        this.head = this.tail = null;
        if (promises !== void 0) {
            return resolveAll(...promises);
        }
    }
    unbinding() {
        if (this.hooks.hasUnbinding) {
            if (this.debug) {
                this.logger.trace(`unbinding()`);
            }
            const ret = this.viewModel.unbinding(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                return ret.then(this.unbind.bind(this));
            }
        }
        return this.unbind();
    }
    unbind() {
        if (this.debug) {
            this.logger.trace(`unbind()`);
        }
        const flags = this.$flags | 64 /* fromUnbind */;
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
                    !this.viewFactory.tryReturnToCache(this)) {
                    this.dispose();
                }
                break;
            case 0 /* customElement */:
                this.scope.parentScope = null;
                break;
        }
        if ((flags & 512 /* dispose */) === 512 /* dispose */) {
            this.dispose();
        }
        this.state = (this.state & 32 /* disposed */) | 8 /* deactivated */;
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
            Metadata.define(CustomElement.name, this, host);
        }
        this.host = host;
        this.mountTarget = 1 /* host */;
        return this;
    }
    setShadowRoot(shadowRoot) {
        if (this.vmKind === 0 /* customElement */) {
            Metadata.define(CustomElement.name, this, shadowRoot);
        }
        this.shadowRoot = shadowRoot;
        this.mountTarget = 2 /* shadowRoot */;
        return this;
    }
    setLocation(location) {
        if (this.vmKind === 0 /* customElement */) {
            Metadata.define(CustomElement.name, this, location);
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
function createObservers(lifecycle, definition, flags, instance) {
    const bindables = definition.bindables;
    const observableNames = Object.getOwnPropertyNames(bindables);
    const length = observableNames.length;
    if (length > 0) {
        let name;
        let bindable;
        const observers = getLookup(instance);
        for (let i = 0; i < length; ++i) {
            name = observableNames[i];
            if (observers[name] === void 0) {
                bindable = bindables[name];
                observers[name] = new BindableObserver(lifecycle, flags, instance, name, bindable.callback, bindable.set);
            }
        }
    }
}
function createChildrenObservers(controller, definition, flags, instance) {
    const childrenObservers = definition.childrenObservers;
    const childObserverNames = Object.getOwnPropertyNames(childrenObservers);
    const length = childObserverNames.length;
    if (length > 0) {
        const observers = getLookup(instance);
        let name;
        for (let i = 0; i < length; ++i) {
            name = childObserverNames[i];
            if (observers[name] == void 0) {
                const childrenDescription = childrenObservers[name];
                observers[name] = new ChildrenObserver(controller, instance, flags, name, childrenDescription.callback, childrenDescription.query, childrenDescription.filter, childrenDescription.map, childrenDescription.options);
            }
        }
    }
}
export function isCustomElementController(value) {
    return value instanceof Controller && value.vmKind === 0 /* customElement */;
}
export function isCustomElementViewModel(value) {
    return isObject(value) && CustomElement.isType(value.constructor);
}
export class HooksDefinition {
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
export var ViewModelKind;
(function (ViewModelKind) {
    ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
    ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
    ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
})(ViewModelKind || (ViewModelKind = {}));
export var State;
(function (State) {
    State[State["none"] = 0] = "none";
    State[State["activating"] = 1] = "activating";
    State[State["activated"] = 2] = "activated";
    State[State["deactivating"] = 4] = "deactivating";
    State[State["deactivated"] = 8] = "deactivated";
    State[State["released"] = 16] = "released";
    State[State["disposed"] = 32] = "disposed";
})(State || (State = {}));
export function stringifyState(state) {
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
export const IController = DI.createInterface('IController').noDefault();
//# sourceMappingURL=controller.js.map