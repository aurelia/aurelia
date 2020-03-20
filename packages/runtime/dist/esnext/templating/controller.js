import { mergeDistinct, nextId, } from '@aurelia/kernel';
import { HooksDefinition, } from '../definitions';
import { AggregateContinuationTask, ContinuationTask, hasAsyncWork, LifecycleTask, } from '../lifecycle-task';
import { Scope, } from '../observation/binding-context';
import { ProxyObserver, } from '../observation/proxy-observer';
import { BindableObserver, } from '../observation/bindable-observer';
import { IProjectorLocator, CustomElementDefinition, CustomElement, } from '../resources/custom-element';
import { CustomAttribute, } from '../resources/custom-attribute';
import { getRenderContext, } from './render-context';
import { ChildrenObserver } from './children';
const controllerLookup = new WeakMap();
export class Controller {
    constructor(vmKind, flags, lifecycle, hooks, 
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
        this.hooks = hooks;
        this.viewFactory = viewFactory;
        this.viewModel = viewModel;
        this.bindingContext = bindingContext;
        this.host = host;
        this.id = nextId('au$component');
        this.nextBound = void 0;
        this.nextUnbound = void 0;
        this.prevBound = void 0;
        this.prevUnbound = void 0;
        this.nextAttached = void 0;
        this.nextDetached = void 0;
        this.prevAttached = void 0;
        this.prevDetached = void 0;
        this.nextMount = void 0;
        this.nextUnmount = void 0;
        this.prevMount = void 0;
        this.prevUnmount = void 0;
        this.parent = void 0;
        this.bindings = void 0;
        this.controllers = void 0;
        this.state = 0 /* none */;
        this.scopeParts = void 0;
        this.isStrictBinding = false;
        this.scope = void 0;
        this.part = void 0;
        this.projector = void 0;
        this.nodes = void 0;
        this.context = void 0;
        this.location = void 0;
        this.mountStrategy = 1 /* insertBefore */;
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
    static forCustomElement(viewModel, lifecycle, host, parentContainer, parts, flags = 0 /* none */) {
        if (controllerLookup.has(viewModel)) {
            return controllerLookup.get(viewModel);
        }
        const definition = CustomElement.getDefinition(viewModel.constructor);
        flags |= definition.strategy;
        const controller = new Controller(0 /* customElement */, 
        /* flags          */ flags, 
        /* lifecycle      */ lifecycle, 
        /* hooks          */ definition.hooks, 
        /* viewFactory    */ void 0, 
        /* viewModel      */ viewModel, 
        /* bindingContext */ getBindingContext(flags, viewModel), 
        /* host           */ host);
        controllerLookup.set(viewModel, controller);
        controller.hydrateCustomElement(definition, parentContainer, parts);
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
        /* hooks          */ definition.hooks, 
        /* viewFactory    */ void 0, 
        /* viewModel      */ viewModel, 
        /* bindingContext */ getBindingContext(flags, viewModel), 
        /* host           */ host);
        controllerLookup.set(viewModel, controller);
        controller.hydrateCustomAttribute(definition);
        return controller;
    }
    static forSyntheticView(viewFactory, lifecycle, context, flags = 0 /* none */) {
        const controller = new Controller(2 /* synthetic */, 
        /* flags          */ flags, 
        /* lifecycle      */ lifecycle, 
        /* hooks          */ HooksDefinition.none, 
        /* viewFactory    */ viewFactory, 
        /* viewModel      */ void 0, 
        /* bindingContext */ void 0, 
        /* host           */ void 0);
        controller.hydrateSynthetic(context, viewFactory.parts);
        return controller;
    }
    hydrateCustomElement(definition, parentContainer, parts) {
        const flags = this.flags |= definition.strategy;
        const instance = this.viewModel;
        createObservers(this.lifecycle, definition, flags, instance);
        createChildrenObservers(this, definition, flags, instance);
        this.scope = Scope.create(flags, this.bindingContext, null);
        const hooks = this.hooks;
        if (hooks.hasCreate) {
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
            instance.afterCompile(this);
        }
        const targets = nodes.findTargets();
        compiledContext.render(
        /* flags      */ this.flags, 
        /* controller */ this, 
        /* targets    */ targets, 
        /* definition */ compiledDefinition, 
        /* host       */ this.host, 
        /* parts      */ parts);
        if (hooks.hasAfterCompileChildren) {
            instance.afterCompileChildren(this);
        }
    }
    hydrateCustomAttribute(definition) {
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
    addBinding(binding) {
        if (this.bindings === void 0) {
            this.bindings = [binding];
        }
        else {
            this.bindings[this.bindings.length] = binding;
        }
    }
    addController(controller) {
        if (this.controllers === void 0) {
            this.controllers = [controller];
        }
        else {
            this.controllers[this.controllers.length] = controller;
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
        this.state |= 256 /* hasLockedScope */;
    }
    hold(location, mountStrategy) {
        this.state = (this.state | 512 /* canBeCached */) ^ 512 /* canBeCached */;
        this.location = location;
        this.mountStrategy = mountStrategy;
    }
    release(flags) {
        this.state |= 512 /* canBeCached */;
        if ((this.state & 32 /* isAttached */) > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.viewFactory.canReturnToCache(this); // non-null is implied by the hook
        }
        return this.unmountSynthetic(flags);
    }
    bind(flags, scope, part) {
        this.part = part;
        // TODO: benchmark which of these techniques is fastest:
        // - the current one (enum with switch)
        // - set the name of the method in the constructor, e.g. this.bindMethod = 'bindCustomElement'
        //    and then doing this[this.bindMethod](flags, scope) instead of switch (eliminates branching
        //    but computed property access might be harmful to browser optimizations)
        // - make bind() a property and set it to one of the 3 methods in the constructor,
        //    e.g. this.bind = this.bindCustomElement (eliminates branching + reduces call stack depth by 1,
        //    but might make the call site megamorphic)
        flags |= 4096 /* fromBind */;
        switch (this.vmKind) {
            case 0 /* customElement */:
                return this.bindCustomElement(flags, scope);
            case 1 /* customAttribute */:
                return this.bindCustomAttribute(flags, scope);
            case 2 /* synthetic */:
                return this.bindSynthetic(flags, scope);
        }
    }
    unbind(flags) {
        flags |= 8192 /* fromUnbind */;
        switch (this.vmKind) {
            case 0 /* customElement */:
                return this.unbindCustomElement(flags);
            case 1 /* customAttribute */:
                return this.unbindCustomAttribute(flags);
            case 2 /* synthetic */:
                return this.unbindSynthetic(flags);
        }
    }
    afterBind(flags) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.bindingContext.afterBind(flags); // non-null is implied by the hook
    }
    afterUnbind(flags) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.bindingContext.afterUnbind(flags); // non-null is implied by the hook
    }
    attach(flags) {
        if ((this.state & 40 /* isAttachedOrAttaching */) > 0 && (flags & 33554432 /* reorderNodes */) === 0) {
            return;
        }
        flags |= 16384 /* fromAttach */;
        switch (this.vmKind) {
            case 0 /* customElement */:
                this.attachCustomElement(flags);
                break;
            case 1 /* customAttribute */:
                this.attachCustomAttribute(flags);
                break;
            case 2 /* synthetic */:
                this.attachSynthetic(flags);
        }
    }
    detach(flags) {
        if ((this.state & 40 /* isAttachedOrAttaching */) === 0) {
            return;
        }
        flags |= 32768 /* fromDetach */;
        switch (this.vmKind) {
            case 0 /* customElement */:
                this.detachCustomElement(flags);
                break;
            case 1 /* customAttribute */:
                this.detachCustomAttribute(flags);
                break;
            case 2 /* synthetic */:
                this.detachSynthetic(flags);
        }
    }
    afterAttach(flags) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.bindingContext.afterAttach(flags); // non-null is implied by the hook
    }
    afterDetach(flags) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.bindingContext.afterDetach(flags); // non-null is implied by the hook
    }
    mount(flags) {
        switch (this.vmKind) {
            case 0 /* customElement */:
                this.mountCustomElement(flags);
                break;
            case 2 /* synthetic */:
                this.mountSynthetic(flags);
        }
    }
    unmount(flags) {
        switch (this.vmKind) {
            case 0 /* customElement */:
                this.unmountCustomElement(flags);
                break;
            case 2 /* synthetic */:
                this.unmountSynthetic(flags);
        }
    }
    cache(flags) {
        switch (this.vmKind) {
            case 0 /* customElement */:
                this.cacheCustomElement(flags);
                break;
            case 1 /* customAttribute */:
                this.cacheCustomAttribute(flags);
                break;
            case 2 /* synthetic */:
                this.cacheSynthetic(flags);
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
    // #region bind/unbind
    bindCustomElement(flags, scope) {
        const $scope = this.scope;
        $scope.parentScope = scope === void 0 ? null : scope;
        $scope.scopeParts = this.scopeParts;
        if ((this.state & 4 /* isBound */) > 0) {
            return LifecycleTask.done;
        }
        flags |= 4096 /* fromBind */;
        this.state |= 1 /* isBinding */;
        this.lifecycle.afterBind.begin();
        if (this.hooks.hasBeforeBind) {
            const ret = this.bindingContext.beforeBind(flags);
            if (hasAsyncWork(ret)) {
                // this.scope could be reassigned during beforeBind so reference that instead of $scope.
                return new ContinuationTask(ret, this.bindBindings, this, flags, this.scope);
            }
        }
        return this.bindBindings(flags, this.scope);
    }
    bindCustomAttribute(flags, scope) {
        if ((this.state & 4 /* isBound */) > 0) {
            if (this.scope === scope) {
                return LifecycleTask.done;
            }
            flags |= 4096 /* fromBind */;
            const task = this.unbind(flags);
            if (!task.done) {
                return new ContinuationTask(task, this.bind, this, flags, scope);
            }
        }
        else {
            flags |= 4096 /* fromBind */;
        }
        this.state |= 1 /* isBinding */;
        this.scope = scope;
        this.lifecycle.afterBind.begin();
        if (this.hooks.hasBeforeBind) {
            const ret = this.bindingContext.beforeBind(flags);
            if (hasAsyncWork(ret)) {
                return new ContinuationTask(ret, this.endBind, this, flags);
            }
        }
        this.endBind(flags);
        return LifecycleTask.done;
    }
    bindSynthetic(flags, scope) {
        if (scope == void 0) {
            throw new Error(`Scope is null or undefined`); // TODO: create error code
        }
        scope.scopeParts = mergeDistinct(scope.scopeParts, this.scopeParts, false);
        if ((this.state & 4 /* isBound */) > 0) {
            if (this.scope === scope || (this.state & 256 /* hasLockedScope */) > 0) {
                return LifecycleTask.done;
            }
            flags |= 4096 /* fromBind */;
            const task = this.unbind(flags);
            if (!task.done) {
                return new ContinuationTask(task, this.bind, this, flags, scope);
            }
        }
        else {
            flags |= 4096 /* fromBind */;
        }
        if ((this.state & 256 /* hasLockedScope */) === 0) {
            this.scope = scope;
        }
        this.state |= 1 /* isBinding */;
        this.lifecycle.afterBind.begin();
        return this.bindBindings(flags, this.scope);
    }
    bindBindings(flags, scope) {
        const { bindings } = this;
        if (bindings !== void 0) {
            const { length } = bindings;
            if (this.isStrictBinding) {
                flags |= 4 /* isStrictBindingStrategy */;
            }
            for (let i = 0; i < length; ++i) {
                bindings[i].$bind(flags, scope, this.part);
            }
        }
        return this.bindControllers(flags, this.scope);
    }
    bindControllers(flags, scope) {
        let tasks = void 0;
        let task;
        const { controllers } = this;
        if (controllers !== void 0) {
            const { length } = controllers;
            for (let i = 0; i < length; ++i) {
                controllers[i].parent = this;
                task = controllers[i].bind(flags, scope, this.part);
                if (!task.done) {
                    if (tasks === void 0) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            }
        }
        if (tasks === void 0) {
            this.endBind(flags);
            return LifecycleTask.done;
        }
        return new AggregateContinuationTask(tasks, this.endBind, this, flags);
    }
    endBind(flags) {
        if (this.hooks.hasAfterBind) {
            this.lifecycle.afterBind.add(this);
        }
        this.state = this.state ^ 1 /* isBinding */ | 4 /* isBound */;
        this.lifecycle.afterBind.end(flags);
    }
    unbindCustomElement(flags) {
        if ((this.state & 4 /* isBound */) === 0) {
            return LifecycleTask.done;
        }
        this.scope.parentScope = null;
        this.state |= 2 /* isUnbinding */;
        flags |= 8192 /* fromUnbind */;
        this.lifecycle.afterUnbind.begin();
        if (this.hooks.hasBeforeUnbind) {
            const ret = this.bindingContext.beforeUnbind(flags);
            if (hasAsyncWork(ret)) {
                return new ContinuationTask(ret, this.unbindControllers, this, flags);
            }
        }
        return this.unbindControllers(flags);
    }
    unbindCustomAttribute(flags) {
        if ((this.state & 4 /* isBound */) === 0) {
            return LifecycleTask.done;
        }
        this.state |= 2 /* isUnbinding */;
        flags |= 8192 /* fromUnbind */;
        this.lifecycle.afterUnbind.begin();
        if (this.hooks.hasBeforeUnbind) {
            const ret = this.bindingContext.beforeUnbind(flags);
            if (hasAsyncWork(ret)) {
                return new ContinuationTask(ret, this.endUnbind, this, flags);
            }
        }
        this.endUnbind(flags);
        return LifecycleTask.done;
    }
    unbindSynthetic(flags) {
        if ((this.state & 4 /* isBound */) === 0) {
            return LifecycleTask.done;
        }
        this.state |= 2 /* isUnbinding */;
        flags |= 8192 /* fromUnbind */;
        this.lifecycle.afterUnbind.begin();
        return this.unbindControllers(flags);
    }
    unbindBindings(flags) {
        const { bindings } = this;
        if (bindings !== void 0) {
            for (let i = bindings.length - 1; i >= 0; --i) {
                bindings[i].$unbind(flags);
            }
        }
        this.endUnbind(flags);
    }
    unbindControllers(flags) {
        let tasks = void 0;
        let task;
        const { controllers } = this;
        if (controllers !== void 0) {
            for (let i = controllers.length - 1; i >= 0; --i) {
                task = controllers[i].unbind(flags);
                controllers[i].parent = void 0;
                if (!task.done) {
                    if (tasks === void 0) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            }
        }
        if (tasks === void 0) {
            this.unbindBindings(flags);
            return LifecycleTask.done;
        }
        return new AggregateContinuationTask(tasks, this.unbindBindings, this, flags);
    }
    endUnbind(flags) {
        switch (this.vmKind) {
            case 1 /* customAttribute */:
                this.scope = void 0;
                break;
            case 2 /* synthetic */:
                if ((this.state & 256 /* hasLockedScope */) === 0) {
                    this.scope = void 0;
                }
        }
        if (this.hooks.hasAfterUnbind) {
            this.lifecycle.afterUnbind.add(this);
        }
        this.state = (this.state | 6 /* isBoundOrUnbinding */) ^ 6 /* isBoundOrUnbinding */;
        this.lifecycle.afterUnbind.end(flags);
    }
    // #endregion
    // #region attach/detach
    attachCustomElement(flags) {
        flags |= 16384 /* fromAttach */;
        this.state |= 8 /* isAttaching */;
        this.lifecycle.mount.add(this);
        this.lifecycle.afterAttach.begin();
        if (this.hooks.hasBeforeAttach) {
            this.bindingContext.beforeAttach(flags);
        }
        this.attachControllers(flags);
        if (this.hooks.hasAfterAttach) {
            this.lifecycle.afterAttach.add(this);
        }
        this.state = this.state ^ 8 /* isAttaching */ | 32 /* isAttached */;
        this.lifecycle.afterAttach.end(flags);
    }
    attachCustomAttribute(flags) {
        flags |= 16384 /* fromAttach */;
        this.state |= 8 /* isAttaching */;
        this.lifecycle.afterAttach.begin();
        if (this.hooks.hasBeforeAttach) {
            this.bindingContext.beforeAttach(flags);
        }
        if (this.hooks.hasAfterAttach) {
            this.lifecycle.afterAttach.add(this);
        }
        this.state = this.state ^ 8 /* isAttaching */ | 32 /* isAttached */;
        this.lifecycle.afterAttach.end(flags);
    }
    attachSynthetic(flags) {
        if (((this.state & 32 /* isAttached */) > 0 && flags & 33554432 /* reorderNodes */) > 0) {
            this.lifecycle.mount.add(this);
        }
        else {
            flags |= 16384 /* fromAttach */;
            this.state |= 8 /* isAttaching */;
            this.lifecycle.mount.add(this);
            this.lifecycle.afterAttach.begin();
            this.attachControllers(flags);
            this.state = this.state ^ 8 /* isAttaching */ | 32 /* isAttached */;
            this.lifecycle.afterAttach.end(flags);
        }
    }
    detachCustomElement(flags) {
        flags |= 32768 /* fromDetach */;
        this.state |= 16 /* isDetaching */;
        this.lifecycle.afterDetach.begin();
        this.lifecycle.unmount.add(this);
        if (this.hooks.hasBeforeDetach) {
            this.bindingContext.beforeDetach(flags);
        }
        this.detachControllers(flags);
        if (this.hooks.hasAfterDetach) {
            this.lifecycle.afterDetach.add(this);
        }
        this.state = (this.state | 48 /* isAttachedOrDetaching */) ^ 48 /* isAttachedOrDetaching */;
        this.lifecycle.afterDetach.end(flags);
    }
    detachCustomAttribute(flags) {
        flags |= 32768 /* fromDetach */;
        this.state |= 16 /* isDetaching */;
        this.lifecycle.afterDetach.begin();
        if (this.hooks.hasBeforeDetach) {
            this.bindingContext.beforeDetach(flags);
        }
        if (this.hooks.hasAfterDetach) {
            this.lifecycle.afterDetach.add(this);
        }
        this.state = (this.state | 48 /* isAttachedOrDetaching */) ^ 48 /* isAttachedOrDetaching */;
        this.lifecycle.afterDetach.end(flags);
    }
    detachSynthetic(flags) {
        flags |= 32768 /* fromDetach */;
        this.state |= 16 /* isDetaching */;
        this.lifecycle.afterDetach.begin();
        this.lifecycle.unmount.add(this);
        this.detachControllers(flags);
        this.state = (this.state | 48 /* isAttachedOrDetaching */) ^ 48 /* isAttachedOrDetaching */;
        this.lifecycle.afterDetach.end(flags);
    }
    attachControllers(flags) {
        const { controllers } = this;
        if (controllers !== void 0) {
            const { length } = controllers;
            for (let i = 0; i < length; ++i) {
                controllers[i].attach(flags);
            }
        }
    }
    detachControllers(flags) {
        const { controllers } = this;
        if (controllers !== void 0) {
            for (let i = controllers.length - 1; i >= 0; --i) {
                controllers[i].detach(flags);
            }
        }
    }
    // #endregion
    // #region mount/unmount/cache
    mountCustomElement(flags) {
        if ((this.state & 64 /* isMounted */) > 0) {
            return;
        }
        this.state |= 64 /* isMounted */;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.projector.project(this.nodes); // non-null is implied by the hook
    }
    mountSynthetic(flags) {
        const nodes = this.nodes; // non null is implied by the hook
        const location = this.location; // non null is implied by the hook
        this.state |= 64 /* isMounted */;
        switch (this.mountStrategy) {
            case 2 /* append */:
                nodes.appendTo(location);
                break;
            default:
                nodes.insertBefore(location);
        }
    }
    unmountCustomElement(flags) {
        if ((this.state & 64 /* isMounted */) === 0) {
            return;
        }
        this.state = (this.state | 64 /* isMounted */) ^ 64 /* isMounted */;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.projector.take(this.nodes); // non-null is implied by the hook
    }
    unmountSynthetic(flags) {
        if ((this.state & 64 /* isMounted */) === 0) {
            return false;
        }
        this.state = (this.state | 64 /* isMounted */) ^ 64 /* isMounted */;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.nodes.remove(); // non-null is implied by the hook
        this.nodes.unlink();
        if ((this.state & 512 /* canBeCached */) > 0) {
            this.state = (this.state | 512 /* canBeCached */) ^ 512 /* canBeCached */;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (this.viewFactory.tryReturnToCache(this)) { // non-null is implied by the hook
                return true;
            }
        }
        return false;
    }
    cacheCustomElement(flags) {
        flags |= 65536 /* fromCache */;
        if (this.hooks.hasCaching) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.bindingContext.caching(flags); // non-null is implied by the hook
        }
    }
    cacheCustomAttribute(flags) {
        flags |= 65536 /* fromCache */;
        if (this.hooks.hasCaching) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.bindingContext.caching(flags); // non-null is implied by the hook
        }
        const { controllers } = this;
        if (controllers !== void 0) {
            const { length } = controllers;
            for (let i = length - 1; i >= 0; --i) {
                controllers[i].cache(flags);
            }
        }
    }
    cacheSynthetic(flags) {
        const { controllers } = this;
        if (controllers !== void 0) {
            const { length } = controllers;
            for (let i = length - 1; i >= 0; --i) {
                controllers[i].cache(flags);
            }
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
//# sourceMappingURL=controller.js.map