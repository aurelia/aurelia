/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { mergeDistinct, nextId, isObject, ILogger, resolveAll, } from '@aurelia/kernel';
import { HooksDefinition, } from '../definitions';
import { stringifyState, } from '../lifecycle';
import { Scope, } from '../observation/binding-context';
import { ProxyObserver, } from '../observation/proxy-observer';
import { BindableObserver, } from '../observation/bindable-observer';
import { IProjectorLocator, CustomElementDefinition, CustomElement, } from '../resources/custom-element';
import { CustomAttribute, } from '../resources/custom-attribute';
import { getRenderContext, } from './render-context';
import { ChildrenObserver, } from './children';
import { IStartTaskManager } from '../lifecycle-task';
function callDispose(disposable) {
    disposable.dispose();
}
const controllerLookup = new WeakMap();
export class Controller {
    constructor(vmKind, flags, lifecycle, definition, hooks, 
    /**
     * The viewFactory. Only present for synthetic views.
     */
    viewFactory, 
    /**
     * The backing viewModel. This is never a proxy. Only present for custom attributes and elements.
     */
    viewModel, 
    /**
     * The binding context. This may be a proxy. If it is not, then it is the same instance as the viewModel. Only present for custom attributes and elements.
     */
    bindingContext, 
    /**
     * The physical host dom node. Only present for custom elements.
     */
    host) {
        this.vmKind = vmKind;
        this.flags = flags;
        this.lifecycle = lifecycle;
        this.definition = definition;
        this.hooks = hooks;
        this.viewFactory = viewFactory;
        this.viewModel = viewModel;
        this.bindingContext = bindingContext;
        this.host = host;
        this.id = nextId('au$component');
        this.head = null;
        this.tail = null;
        this.next = null;
        this.parent = null;
        this.bindings = void 0;
        this.children = void 0;
        this.hasLockedScope = false;
        this.scopeParts = void 0;
        this.isStrictBinding = false;
        this.scope = void 0;
        this.part = void 0;
        this.projector = void 0;
        this.nodes = void 0;
        this.context = void 0;
        this.location = void 0;
        this.mountStrategy = 1 /* insertBefore */;
        this.state = 0 /* none */;
        this.promise = void 0;
        this.resolve = void 0;
        this.reject = void 0;
        this.logger = null;
        this.debug = false;
        this.fullyNamed = false;
        this.canceling = false;
    }
    get isActive() {
        return (this.state & (1 /* activating */ | 14 /* activated */)) > 0 && (this.state & 16 /* deactivating */) === 0;
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
    static forCustomElement(viewModel, lifecycle, host, parentContainer, parts, flags = 0 /* none */, hydrate = true, 
    // Use this when `instance.constructor` is not a custom element type to pass on the CustomElement definition
    definition = void 0) {
        if (controllerLookup.has(viewModel)) {
            return controllerLookup.get(viewModel);
        }
        definition = definition !== null && definition !== void 0 ? definition : CustomElement.getDefinition(viewModel.constructor);
        flags |= definition.strategy;
        const controller = new Controller(0 /* customElement */, 
        /* flags          */ flags, 
        /* lifecycle      */ lifecycle, 
        /* definition     */ definition, 
        /* hooks          */ definition.hooks, 
        /* viewFactory    */ void 0, 
        /* viewModel      */ viewModel, 
        /* bindingContext */ getBindingContext(flags, viewModel), 
        /* host           */ host);
        controllerLookup.set(viewModel, controller);
        if (hydrate) {
            controller.hydrateCustomElement(parentContainer, parts);
        }
        return controller;
    }
    static forCustomAttribute(viewModel, lifecycle, host, flags = 0 /* none */) {
        if (controllerLookup.has(viewModel)) {
            return controllerLookup.get(viewModel);
        }
        const definition = CustomAttribute.getDefinition(viewModel.constructor);
        flags |= definition.strategy;
        const controller = new Controller(1 /* customAttribute */, 
        /* flags          */ flags, 
        /* lifecycle      */ lifecycle, 
        /* definition     */ definition, 
        /* hooks          */ definition.hooks, 
        /* viewFactory    */ void 0, 
        /* viewModel      */ viewModel, 
        /* bindingContext */ getBindingContext(flags, viewModel), 
        /* host           */ host);
        controllerLookup.set(viewModel, controller);
        controller.hydrateCustomAttribute();
        return controller;
    }
    static forSyntheticView(viewFactory, lifecycle, context, flags = 0 /* none */) {
        const controller = new Controller(2 /* synthetic */, 
        /* flags          */ flags, 
        /* lifecycle      */ lifecycle, 
        /* definition     */ void 0, 
        /* hooks          */ HooksDefinition.none, 
        /* viewFactory    */ viewFactory, 
        /* viewModel      */ void 0, 
        /* bindingContext */ void 0, 
        /* host           */ void 0);
        controller.hydrateSynthetic(context, viewFactory.parts);
        return controller;
    }
    hydrateCustomElement(parentContainer, parts) {
        this.logger = parentContainer.get(ILogger).root;
        this.debug = this.logger.config.level <= 1 /* debug */;
        if (this.debug) {
            this.logger = this.logger.scopeTo(this.name);
        }
        let definition = this.definition;
        const flags = this.flags |= definition.strategy;
        const instance = this.viewModel;
        createObservers(this.lifecycle, definition, flags, instance);
        createChildrenObservers(this, definition, flags, instance);
        this.scope = Scope.create(flags, this.bindingContext, null);
        const hooks = this.hooks;
        if (hooks.hasCreate) {
            if (this.debug) {
                this.logger.trace(`invoking create() hook`);
            }
            const result = instance.create(
            /* controller      */ this, 
            /* parentContainer */ parentContainer, 
            /* definition      */ definition, 
            /* parts           */ parts);
            if (result !== void 0 && result !== definition) {
                definition = CustomElementDefinition.getOrCreate(result);
            }
        }
        const context = this.context = getRenderContext(definition, parentContainer, parts);
        // Support Recursive Components by adding self to own context
        definition.register(context);
        if (definition.injectable !== null) {
            // If the element is registered as injectable, support injecting the instance into children
            context.beginChildComponentOperation(instance);
        }
        if (hooks.hasBeforeCompile) {
            if (this.debug) {
                this.logger.trace(`invoking hasBeforeCompile() hook`);
            }
            instance.beforeCompile(this);
        }
        const compiledContext = context.compile();
        const compiledDefinition = compiledContext.compiledDefinition;
        this.scopeParts = compiledDefinition.scopeParts;
        this.isStrictBinding = compiledDefinition.isStrictBinding;
        const projectorLocator = parentContainer.get(IProjectorLocator);
        this.projector = projectorLocator.getElementProjector(context.dom, this, this.host, compiledDefinition);
        instance.$controller = this;
        const nodes = this.nodes = compiledContext.createNodes();
        if (hooks.hasAfterCompile) {
            if (this.debug) {
                this.logger.trace(`invoking hasAfterCompile() hook`);
            }
            instance.afterCompile(this);
        }
        const taskmgr = parentContainer.get(IStartTaskManager);
        taskmgr.runBeforeCompileChildren(parentContainer);
        const targets = nodes.findTargets();
        compiledContext.render(
        /* flags      */ this.flags, 
        /* controller */ this, 
        /* targets    */ targets, 
        /* definition */ compiledDefinition, 
        /* host       */ this.host, 
        /* parts      */ parts);
        if (hooks.hasAfterCompileChildren) {
            if (this.debug) {
                this.logger.trace(`invoking afterCompileChildren() hook`);
            }
            instance.afterCompileChildren(this);
        }
    }
    hydrateCustomAttribute() {
        const definition = this.definition;
        const flags = this.flags | definition.strategy;
        const instance = this.viewModel;
        createObservers(this.lifecycle, definition, flags, instance);
        instance.$controller = this;
    }
    hydrateSynthetic(context, parts) {
        this.context = context;
        const compiledContext = context.compile();
        const compiledDefinition = compiledContext.compiledDefinition;
        this.scopeParts = compiledDefinition.scopeParts;
        this.isStrictBinding = compiledDefinition.isStrictBinding;
        const nodes = this.nodes = compiledContext.createNodes();
        const targets = nodes.findTargets();
        compiledContext.render(
        /* flags      */ this.flags, 
        /* controller */ this, 
        /* targets    */ targets, 
        /* definition */ compiledDefinition, 
        /* host       */ void 0, 
        /* parts      */ parts);
    }
    cancel(initiator, parent, flags) {
        var _a, _b, _c, _d;
        if (this.canceling) {
            return;
        }
        this.canceling = true;
        if ((this.state & 1 /* activating */) === 1 /* activating */) {
            this.state = (this.state ^ 1 /* activating */) | 16 /* deactivating */;
            (_b = (_a = this.bindingContext) === null || _a === void 0 ? void 0 : _a.onCancel) === null || _b === void 0 ? void 0 : _b.call(_a, initiator, parent, flags);
            if ((this.state & 4 /* activateChildrenCalled */) === 4 /* activateChildrenCalled */ &&
                this.children !== void 0) {
                for (const child of this.children) {
                    child.cancel(initiator, parent, flags);
                }
            }
        }
        else if ((this.state & 16 /* deactivating */) === 16 /* deactivating */) {
            this.state = (this.state ^ 16 /* deactivating */) | 1 /* activating */;
            (_d = (_c = this.bindingContext) === null || _c === void 0 ? void 0 : _c.onCancel) === null || _d === void 0 ? void 0 : _d.call(_c, initiator, parent, flags);
            if ((this.state & 64 /* deactivateChildrenCalled */) === 64 /* deactivateChildrenCalled */ &&
                this.children !== void 0) {
                for (const child of this.children) {
                    child.cancel(initiator, parent, flags);
                }
            }
        }
    }
    activate(initiator, parent, flags, scope, part) {
        this.canceling = false;
        switch (this.state) {
            case 0 /* none */:
            case 224 /* deactivated */:
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
            case 14 /* activated */:
                // If we're already activated, no need to do anything.
                return;
            case 512 /* disposed */:
                throw new Error(`${this.name} trying to activate a controller that is disposed.`);
            default:
                if ((this.state & 1 /* activating */) === 1 /* activating */) {
                    // We're already activating, so no need to do anything.
                    return this.promise;
                }
                if ((this.state & 16 /* deactivating */) === 16 /* deactivating */) {
                    // We're in an incomplete deactivation, so we can still abort some of it.
                    // Simply add the 'activating' bit (and remove 'deactivating' so we know what was the last request) and return.
                    this.state = (this.state ^ 16 /* deactivating */) | 1 /* activating */;
                    if ((this.state & 64 /* deactivateChildrenCalled */) === 64 /* deactivateChildrenCalled */ &&
                        this.children !== void 0) {
                        return resolveAll(this.onResolve(this.$activateChildren(initiator, parent, flags)), this.promise);
                    }
                    return this.promise;
                }
                else {
                    throw new Error(`${this.name} unexpected state: ${stringifyState(this.state)}.`);
                }
        }
        this.parent = parent;
        if (this.debug && !this.fullyNamed) {
            this.fullyNamed = true;
            this.logger = this.context.get(ILogger).root.scopeTo(this.name);
            this.logger.trace(`activate()`);
        }
        this.part = part;
        flags |= 32 /* fromBind */;
        switch (this.vmKind) {
            case 0 /* customElement */:
                // Custom element scope is created and assigned during hydration
                this.scope.parentScope = scope === void 0 ? null : scope;
                this.scope.scopeParts = this.scopeParts;
                break;
            case 1 /* customAttribute */:
                this.scope = scope;
                break;
            case 2 /* synthetic */:
                if (scope === void 0 || scope === null) {
                    throw new Error(`Scope is null or undefined`);
                }
                scope.scopeParts = mergeDistinct(scope.scopeParts, this.scopeParts, false);
                if (!this.hasLockedScope) {
                    this.scope = scope;
                }
                break;
        }
        if (this.isStrictBinding) {
            flags |= 4 /* isStrictBindingStrategy */;
        }
        return this.beforeBind(initiator, parent, flags);
    }
    beforeBind(initiator, parent, flags) {
        var _a, _b;
        if (this.debug) {
            this.logger.trace(`beforeBind()`);
        }
        return this.onResolve((_b = (_a = this.bindingContext) === null || _a === void 0 ? void 0 : _a.beforeBind) === null || _b === void 0 ? void 0 : _b.call(_a, initiator, parent, flags), () => {
            return this.bind(initiator, parent, flags);
        });
    }
    bind(initiator, parent, flags) {
        if (this.debug) {
            this.logger.trace(`bind()`);
        }
        this.state |= 2 /* beforeBindCalled */;
        if ((this.state & 16 /* deactivating */) === 16 /* deactivating */) {
            return this.afterUnbind(initiator, parent, flags);
        }
        if (this.bindings !== void 0) {
            const { scope, part, bindings } = this;
            for (let i = 0, ii = bindings.length; i < ii; ++i) {
                bindings[i].$bind(flags, scope, part);
            }
        }
        return this.afterBind(initiator, parent, flags);
    }
    afterBind(initiator, parent, flags) {
        var _a, _b;
        if (this.debug) {
            this.logger.trace(`afterBind()`);
        }
        return this.onResolve((_b = (_a = this.bindingContext) === null || _a === void 0 ? void 0 : _a.afterBind) === null || _b === void 0 ? void 0 : _b.call(_a, initiator, parent, flags), () => {
            return this.attach(initiator, parent, flags);
        });
    }
    attach(initiator, parent, flags) {
        if (this.debug) {
            this.logger.trace(`attach()`);
        }
        if ((this.state & 16 /* deactivating */) === 16 /* deactivating */) {
            return this.beforeUnbind(initiator, parent, flags);
        }
        switch (this.vmKind) {
            case 0 /* customElement */:
                this.projector.project(this.nodes);
                break;
            case 2 /* synthetic */:
                switch (this.mountStrategy) {
                    case 2 /* append */:
                        this.nodes.appendTo(this.location);
                        break;
                    case 1 /* insertBefore */:
                        this.nodes.insertBefore(this.location);
                        break;
                }
                break;
        }
        return this.afterAttach(initiator, parent, flags);
    }
    afterAttach(initiator, parent, flags) {
        var _a, _b;
        if (this.debug) {
            this.logger.trace(`afterAttach()`);
        }
        return this.onResolve((_b = (_a = this.bindingContext) === null || _a === void 0 ? void 0 : _a.afterAttach) === null || _b === void 0 ? void 0 : _b.call(_a, initiator, parent, flags), () => {
            return this.activateChildren(initiator, parent, flags);
        });
    }
    activateChildren(initiator, parent, flags) {
        if (this.debug) {
            this.logger.trace(`activateChildren()`);
        }
        this.state |= 4 /* activateChildrenCalled */;
        return this.onResolve(this.$activateChildren(initiator, parent, flags), () => {
            return this.endActivate(initiator, parent, flags);
        });
    }
    $activateChildren(initiator, parent, flags) {
        if (this.children !== void 0) {
            const { children, scope, part } = this;
            return resolveAll(...children.map(child => {
                return child.activate(initiator, this, flags, scope, part);
            }));
        }
    }
    endActivate(initiator, parent, flags) {
        if (this.debug) {
            this.logger.trace(`afterAttachChildren()`);
        }
        this.state ^= 4 /* activateChildrenCalled */;
        if ((this.state & 16 /* deactivating */) === 16 /* deactivating */) {
            clearLinks(initiator);
            return this.beforeDetach(initiator, parent, flags);
        }
        else if ((this.state & 32 /* beforeDetachCalled */) === 32 /* beforeDetachCalled */) {
            this.state ^= 32 /* beforeDetachCalled */;
            this.resolvePromise();
            return;
        }
        let promises = void 0;
        let ret;
        if (initiator.head === null) {
            initiator.head = this;
        }
        else {
            initiator.tail.next = this;
        }
        initiator.tail = this;
        if (initiator === this) {
            if (initiator.head !== null) {
                let cur = initiator.head;
                initiator.head = initiator.tail = null;
                let next;
                do {
                    ret = cur.afterAttachChildren(initiator, parent, flags);
                    if (ret instanceof Promise) {
                        (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
                    }
                    next = cur.next;
                    cur.next = null;
                    cur = next;
                } while (cur !== null);
                if (promises !== void 0) {
                    const promise = promises.length === 1
                        ? promises[0]
                        : Promise.all(promises);
                    return promise.then(() => {
                        this.resolvePromise();
                    });
                }
            }
            this.resolvePromise();
        }
    }
    afterAttachChildren(initiator, parent, flags) {
        var _a, _b;
        return this.onResolve((_b = (_a = this.bindingContext) === null || _a === void 0 ? void 0 : _a.afterAttachChildren) === null || _b === void 0 ? void 0 : _b.call(_a, initiator, flags), () => {
            if ((this.state & 16 /* deactivating */) === 16 /* deactivating */) {
                this.state = 14 /* activated */;
                // If the cancellation of activation was requested once the children were already activating,
                // then there were no more sensible cancellation points and we had to wait out the remainder of the operation.
                // Now, after activation finally finished, we can proceed to deactivate.
                return this.deactivate(this, parent, flags);
            }
            this.state = 14 /* activated */;
            if (initiator !== this) {
                // For the initiator, the promise is resolved at the end of endAactivate because that promise resolution
                // has to come after all descendant postEndActivate calls resolved. Otherwise, the initiator might resolve
                // while some of its descendants are still busy.
                this.resolvePromise();
            }
        });
    }
    deactivate(initiator, parent, flags) {
        this.canceling = false;
        switch ((this.state & ~256 /* released */)) {
            case 14 /* activated */:
                // We're fully activated, so proceed with normal deactivation.
                this.state = 16 /* deactivating */;
                break;
            case 0 /* none */:
            case 224 /* deactivated */:
            case 512 /* disposed */:
            case 224 /* deactivated */ | 512 /* disposed */:
                // If we're already deactivated (or even disposed), or never activated in the first place, no need to do anything.
                return;
            default:
                if ((this.state & 16 /* deactivating */) === 16 /* deactivating */) {
                    // We're already deactivating, so no need to do anything.
                    return this.promise;
                }
                if ((this.state & 1 /* activating */) === 1 /* activating */) {
                    // We're in an incomplete activation, so we can still abort some of it.
                    // Simply add the 'deactivating' bit (and remove 'activating' so we know what was the last request) and return.
                    this.state = (this.state ^ 1 /* activating */) | 16 /* deactivating */;
                    if ((this.state & 4 /* activateChildrenCalled */) === 4 /* activateChildrenCalled */ &&
                        this.children !== void 0) {
                        return resolveAll(this.onResolve(this.$deactivateChildren(initiator, parent, flags)), this.promise);
                    }
                    return this.promise;
                }
                else {
                    throw new Error(`${this.name} unexpected state: ${stringifyState(this.state)}.`);
                }
        }
        if (this.debug) {
            this.logger.trace(`deactivate()`);
        }
        return this.beforeDetach(initiator, parent, flags);
    }
    beforeDetach(initiator, parent, flags) {
        var _a, _b;
        if (this.debug) {
            this.logger.trace(`beforeDetach()`);
        }
        return this.onResolve((_b = (_a = this.bindingContext) === null || _a === void 0 ? void 0 : _a.beforeDetach) === null || _b === void 0 ? void 0 : _b.call(_a, initiator, parent, flags), () => {
            return this.detach(initiator, parent, flags);
        });
    }
    detach(initiator, parent, flags) {
        if (this.debug) {
            this.logger.trace(`detach()`);
        }
        this.state |= 32 /* beforeDetachCalled */;
        if ((this.state & 1 /* activating */) === 1 /* activating */) {
            return this.afterAttach(initiator, parent, flags);
        }
        switch (this.vmKind) {
            case 0 /* customElement */:
                this.projector.take(this.nodes);
                break;
            case 2 /* synthetic */:
                this.nodes.remove();
                this.nodes.unlink();
                break;
        }
        return this.beforeUnbind(initiator, parent, flags);
    }
    beforeUnbind(initiator, parent, flags) {
        var _a, _b;
        if (this.debug) {
            this.logger.trace(`beforeUnbind()`);
        }
        return this.onResolve((_b = (_a = this.bindingContext) === null || _a === void 0 ? void 0 : _a.beforeUnbind) === null || _b === void 0 ? void 0 : _b.call(_a, initiator, parent, flags), () => {
            return this.unbind(initiator, parent, flags);
        });
    }
    unbind(initiator, parent, flags) {
        if (this.debug) {
            this.logger.trace(`unbind()`);
        }
        if ((this.state & 1 /* activating */) === 1 /* activating */) {
            return this.afterBind(initiator, parent, flags);
        }
        flags |= 64 /* fromUnbind */;
        if (this.bindings !== void 0) {
            const { bindings } = this;
            for (let i = 0, ii = bindings.length; i < ii; ++i) {
                bindings[i].$unbind(flags);
            }
        }
        return this.afterUnbind(initiator, parent, flags);
    }
    afterUnbind(initiator, parent, flags) {
        var _a, _b;
        if (this.debug) {
            this.logger.trace(`afterUnbind()`);
        }
        return this.onResolve((_b = (_a = this.bindingContext) === null || _a === void 0 ? void 0 : _a.afterUnbind) === null || _b === void 0 ? void 0 : _b.call(_a, initiator, parent, flags), () => {
            return this.deactivateChildren(initiator, parent, flags);
        });
    }
    deactivateChildren(initiator, parent, flags) {
        if (this.debug) {
            this.logger.trace(`deactivateChildren()`);
        }
        this.state |= 64 /* deactivateChildrenCalled */;
        return this.onResolve(this.$deactivateChildren(initiator, parent, flags), () => {
            return this.endDeactivate(initiator, parent, flags);
        });
    }
    $deactivateChildren(initiator, parent, flags) {
        if (this.children !== void 0) {
            const { children } = this;
            return resolveAll(...children.map(child => {
                return child.deactivate(initiator, this, flags);
            }));
        }
    }
    endDeactivate(initiator, parent, flags) {
        if (this.debug) {
            this.logger.trace(`afterUnbindChildren()`);
        }
        this.state ^= 64 /* deactivateChildrenCalled */;
        if ((this.state & 1 /* activating */) === 1 /* activating */) {
            // In a short-circuit it's possible that descendants have already started building the links for afterUnbindChildren hooks.
            // Those hooks are never invoked (because only the initiator can do that), but we still need to clear the list so as to avoid corrupting the next lifecycle.
            clearLinks(initiator);
            return this.beforeBind(initiator, parent, flags);
        }
        else if ((this.state & 2 /* beforeBindCalled */) === 2 /* beforeBindCalled */) {
            this.state ^= 2 /* beforeBindCalled */;
            this.resolvePromise();
            return;
        }
        let promises = void 0;
        let ret;
        if (initiator.head === null) {
            initiator.head = this;
        }
        else {
            initiator.tail.next = this;
        }
        initiator.tail = this;
        if (initiator === this) {
            if (initiator.head !== null) {
                let cur = initiator.head;
                initiator.head = initiator.tail = null;
                let next;
                do {
                    ret = cur.afterUnbindChildren(initiator, parent, flags);
                    if (ret instanceof Promise) {
                        (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
                    }
                    next = cur.next;
                    cur.next = null;
                    cur = next;
                } while (cur !== null);
                if (promises !== void 0) {
                    const promise = promises.length === 1
                        ? promises[0]
                        : Promise.all(promises);
                    return promise.then(() => {
                        this.resolvePromise();
                    });
                }
            }
            this.resolvePromise();
        }
    }
    afterUnbindChildren(initiator, parent, flags) {
        var _a, _b;
        return this.onResolve((_b = (_a = this.bindingContext) === null || _a === void 0 ? void 0 : _a.afterUnbindChildren) === null || _b === void 0 ? void 0 : _b.call(_a, initiator, flags), () => {
            this.parent = null;
            switch (this.vmKind) {
                case 1 /* customAttribute */:
                    this.scope = void 0;
                    break;
                case 2 /* synthetic */:
                    if (!this.hasLockedScope) {
                        this.scope = void 0;
                    }
                    if ((this.state & 256 /* released */) === 256 /* released */ &&
                        !this.viewFactory.tryReturnToCache(this)) {
                        this.dispose();
                    }
                    break;
                case 0 /* customElement */:
                    this.scope.parentScope = null;
                    break;
            }
            if ((this.state & 1 /* activating */) === 1 /* activating */) {
                this.state = (this.state & 512 /* disposed */) | 224 /* deactivated */;
                return this.activate(this, parent, flags);
            }
            if ((flags & 512 /* dispose */) === 512 /* dispose */) {
                this.dispose();
            }
            this.state = (this.state & 512 /* disposed */) | 224 /* deactivated */;
            if (initiator !== this) {
                // For the initiator, the promise is resolved at the end of endDeactivate because that promise resolution
                // has to come after all descendant postEndDeactivate calls resolved. Otherwise, the initiator might resolve
                // while some of its descendants are still busy.
                this.resolvePromise();
            }
        });
    }
    onResolve(maybePromise, resolveCallback) {
        if (maybePromise instanceof Promise) {
            if (this.promise === void 0) {
                this.promise = new Promise((resolve, reject) => {
                    this.resolve = resolve;
                    this.reject = reject;
                });
            }
            maybePromise = maybePromise.catch(err => {
                var _a;
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error(err);
                const reject = this.reject;
                this.promise = this.resolve = this.reject = void 0;
                reject(err);
                throw err;
            });
            return resolveCallback === void 0
                ? maybePromise
                : maybePromise.then(resolveCallback);
        }
        if (resolveCallback !== void 0) {
            return resolveCallback();
        }
    }
    addBinding(binding) {
        if (this.bindings === void 0) {
            this.bindings = [binding];
        }
        else {
            this.bindings[this.bindings.length] = binding;
        }
    }
    addController(controller) {
        if (this.children === void 0) {
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
    setLocation(location, mountStrategy) {
        this.location = location;
        this.mountStrategy = mountStrategy;
    }
    release() {
        this.state |= 256 /* released */;
    }
    dispose() {
        if (this.debug) {
            this.logger.trace(`dispose()`);
        }
        if ((this.state & 512 /* disposed */) === 512 /* disposed */) {
            return;
        }
        this.state |= 512 /* disposed */;
        if (this.hooks.hasDispose) {
            this.bindingContext.dispose();
        }
        if (this.children !== void 0) {
            this.children.forEach(callDispose);
            this.children = void 0;
        }
        if (this.bindings !== void 0) {
            this.bindings.forEach(callDispose);
            this.bindings = void 0;
        }
        this.scope = void 0;
        this.projector = void 0;
        this.nodes = void 0;
        this.context = void 0;
        this.location = void 0;
        this.viewFactory = void 0;
        if (this.viewModel !== void 0) {
            controllerLookup.delete(this.viewModel);
            this.viewModel = void 0;
        }
        this.bindingContext = void 0;
        this.host = void 0;
    }
    accept(visitor) {
        if (visitor(this) === true) {
            return true;
        }
        if (this.hooks.hasAccept && this.bindingContext.accept(visitor) === true) {
            return true;
        }
        if (this.children !== void 0) {
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
        if (bindings !== void 0) {
            const binding = bindings.find(b => b.targetProperty === propertyName);
            if (binding !== void 0) {
                return binding.targetObserver;
            }
        }
        return void 0;
    }
    resolvePromise() {
        const resolve = this.resolve;
        if (resolve !== void 0) {
            this.promise = this.resolve = this.reject = void 0;
            resolve();
        }
    }
}
function getBindingContext(flags, instance) {
    if (instance.noProxy === true || (flags & 2 /* proxyStrategy */) === 0) {
        return instance;
    }
    return ProxyObserver.getOrCreate(instance).proxy;
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
        if ((flags & 2 /* proxyStrategy */) > 0) {
            for (let i = 0; i < length; ++i) {
                name = observableNames[i];
                bindable = bindables[name];
                new BindableObserver(lifecycle, flags, ProxyObserver.getOrCreate(instance).proxy, name, bindable.callback, bindable.set);
            }
        }
        else {
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
function clearLinks(initiator) {
    let cur = initiator.head;
    initiator.head = initiator.tail = null;
    let next;
    while (cur !== null) {
        next = cur.next;
        cur.next = null;
        cur = next;
    }
}
export function isCustomElementController(value) {
    return value instanceof Controller && value.vmKind === 0 /* customElement */;
}
export function isCustomElementViewModel(value) {
    return isObject(value) && CustomElement.isType(value.constructor);
}
//# sourceMappingURL=controller.js.map