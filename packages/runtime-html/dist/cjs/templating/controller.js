"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IController = exports.stringifyState = exports.State = exports.ViewModelKind = exports.HooksDefinition = exports.isCustomElementViewModel = exports.isCustomElementController = exports.Controller = exports.MountTarget = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const bindable_observer_js_1 = require("../observation/bindable-observer.js");
const dom_js_1 = require("../dom.js");
const custom_element_js_1 = require("../resources/custom-element.js");
const custom_attribute_js_1 = require("../resources/custom-attribute.js");
const render_context_js_1 = require("./render-context.js");
const children_js_1 = require("./children.js");
const app_root_js_1 = require("../app-root.js");
const platform_js_1 = require("../platform.js");
const styles_js_1 = require("./styles.js");
const watchers_js_1 = require("./watchers.js");
const lifecycle_hooks_js_1 = require("./lifecycle-hooks.js");
function callDispose(disposable) {
    disposable.dispose();
}
var MountTarget;
(function (MountTarget) {
    MountTarget[MountTarget["none"] = 0] = "none";
    MountTarget[MountTarget["host"] = 1] = "host";
    MountTarget[MountTarget["shadowRoot"] = 2] = "shadowRoot";
    MountTarget[MountTarget["location"] = 3] = "location";
})(MountTarget = exports.MountTarget || (exports.MountTarget = {}));
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
        this.id = kernel_1.nextId('au$component');
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
        if (root === null && container.has(app_root_js_1.IAppRoot, true)) {
            this.root = container.get(app_root_js_1.IAppRoot);
        }
        this.platform = container.get(platform_js_1.IPlatform);
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
        definition = definition !== null && definition !== void 0 ? definition : custom_element_js_1.CustomElement.getDefinition(viewModel.constructor);
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
        const definition = custom_attribute_js_1.CustomAttribute.getDefinition(viewModel.constructor);
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
        this.logger = parentContainer.get(kernel_1.ILogger).root;
        this.debug = this.logger.config.level <= 1 /* debug */;
        if (this.debug) {
            this.logger = this.logger.scopeTo(this.name);
        }
        let definition = this.definition;
        const flags = this.flags;
        const instance = this.viewModel;
        this.scope = runtime_1.Scope.create(instance, null, true);
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
                definition = custom_element_js_1.CustomElementDefinition.getOrCreate(result);
            }
        }
        const context = this.context = render_context_js_1.getRenderContext(definition, parentContainer, targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.projections);
        this.lifecycleHooks = lifecycle_hooks_js_1.LifecycleHooks.resolve(context);
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
        if ((this.hostController = custom_element_js_1.CustomElement.for(this.host, optional)) !== null) {
            this.host = this.platform.document.createElement(this.context.definition.name);
        }
        dom_js_1.setRef(this.host, custom_element_js_1.CustomElement.name, this);
        dom_js_1.setRef(this.host, this.definition.key, this);
        if (shadowOptions !== null || hasSlots) {
            if (containerless) {
                throw new Error('You cannot combine the containerless custom element option with Shadow DOM.');
            }
            dom_js_1.setRef(this.shadowRoot = this.host.attachShadow(shadowOptions !== null && shadowOptions !== void 0 ? shadowOptions : defaultShadowOptions), custom_element_js_1.CustomElement.name, this);
            dom_js_1.setRef(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2 /* shadowRoot */;
        }
        else if (containerless) {
            dom_js_1.setRef(this.location = dom_js_1.convertToRenderLocation(this.host), custom_element_js_1.CustomElement.name, this);
            dom_js_1.setRef(this.location, this.definition.key, this);
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
        this.lifecycleHooks = lifecycle_hooks_js_1.LifecycleHooks.resolve(this.container);
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
            this.logger = this.context.get(kernel_1.ILogger).root.scopeTo(this.name);
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
                const styles = this.context.has(styles_js_1.IShadowDOMStyles, false)
                    ? this.context.get(styles_js_1.IShadowDOMStyles)
                    : this.context.get(styles_js_1.IShadowDOMGlobalStyles);
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
                const def = custom_attribute_js_1.CustomAttribute.getDefinition(this.viewModel.constructor);
                return def.name === name;
            }
            case 0 /* customElement */: {
                const def = custom_element_js_1.CustomElement.getDefinition(this.viewModel.constructor);
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
            dom_js_1.setRef(host, custom_element_js_1.CustomElement.name, this);
            dom_js_1.setRef(host, this.definition.key, this);
        }
        this.host = host;
        this.mountTarget = 1 /* host */;
        return this;
    }
    setShadowRoot(shadowRoot) {
        if (this.vmKind === 0 /* customElement */) {
            dom_js_1.setRef(shadowRoot, custom_element_js_1.CustomElement.name, this);
            dom_js_1.setRef(shadowRoot, this.definition.key, this);
        }
        this.shadowRoot = shadowRoot;
        this.mountTarget = 2 /* shadowRoot */;
        return this;
    }
    setLocation(location) {
        if (this.vmKind === 0 /* customElement */) {
            dom_js_1.setRef(location, custom_element_js_1.CustomElement.name, this);
            dom_js_1.setRef(location, this.definition.key, this);
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
exports.Controller = Controller;
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
                observers[name] = new bindable_observer_js_1.BindableObserver(instance, name, bindable.callback, bindable.set, controller);
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
                observers[name] = new children_js_1.ChildrenObserver(controller, instance, name, childrenDescription.callback, childrenDescription.query, childrenDescription.filter, childrenDescription.map, childrenDescription.options);
            }
        }
    }
}
const AccessScopeAst = {
    map: new Map(),
    for(key) {
        let ast = AccessScopeAst.map.get(key);
        if (ast == null) {
            ast = new runtime_1.AccessScopeExpression(key, 0);
            AccessScopeAst.map.set(key, ast);
        }
        return ast;
    },
};
function createWatchers(controller, context, definition, instance) {
    const observerLocator = context.get(runtime_1.IObserverLocator);
    const expressionParser = context.get(runtime_1.IExpressionParser);
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
            controller.addBinding(new watchers_js_1.ComputedWatcher(instance, observerLocator, expression, callback, 
            // there should be a flag to purposely disable proxy
            // AOT: not true for IE11
            true));
        }
        else {
            ast = typeof expression === 'string'
                ? expressionParser.parse(expression, 53 /* BindCommand */)
                : AccessScopeAst.for(expression);
            controller.addBinding(new watchers_js_1.ExpressionWatcher(controller.scope, context, observerLocator, ast, callback));
        }
    }
}
function isCustomElementController(value) {
    return value instanceof Controller && value.vmKind === 0 /* customElement */;
}
exports.isCustomElementController = isCustomElementController;
function isCustomElementViewModel(value) {
    return kernel_1.isObject(value) && custom_element_js_1.CustomElement.isType(value.constructor);
}
exports.isCustomElementViewModel = isCustomElementViewModel;
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
exports.HooksDefinition = HooksDefinition;
HooksDefinition.none = new HooksDefinition({});
const defaultShadowOptions = {
    mode: 'open'
};
var ViewModelKind;
(function (ViewModelKind) {
    ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
    ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
    ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
})(ViewModelKind = exports.ViewModelKind || (exports.ViewModelKind = {}));
var State;
(function (State) {
    State[State["none"] = 0] = "none";
    State[State["activating"] = 1] = "activating";
    State[State["activated"] = 2] = "activated";
    State[State["deactivating"] = 4] = "deactivating";
    State[State["deactivated"] = 8] = "deactivated";
    State[State["released"] = 16] = "released";
    State[State["disposed"] = 32] = "disposed";
})(State = exports.State || (exports.State = {}));
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
exports.stringifyState = stringifyState;
exports.IController = kernel_1.DI.createInterface('IController');
//# sourceMappingURL=controller.js.map