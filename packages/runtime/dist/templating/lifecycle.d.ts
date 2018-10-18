import { Immutable, Omit } from '@aurelia/kernel';
import { ICustomElementType, IHydrateElementInstruction, IRenderable, IRenderingEngine, ITemplate } from '.';
import { BindingFlags, IChangeSet } from '../binding';
import { INode, INodeSequence } from '../dom';
export declare enum LifecycleFlags {
    none = 1,
    noTasks = 2,
    unbindAfterDetached = 4
}
export interface IAttach {
    readonly $isAttached: boolean;
    $attach(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
    $detach(lifecycle: IDetachLifecycle): void;
    $cache(): void;
}
export interface IElementTemplateProvider {
    getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType): ITemplate;
}
/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface ILifecycleHooks extends Partial<Omit<IRenderable, '$addNodes' | '$removeNodes'>> {
    /**
     * Only applies to `@customElement`. This hook is not invoked for `@customAttribute`s
     *
     * Called during `$hydrate`, after `this.$scope` and `this.$projector` are set.
     *
     * If this hook is implemented, it will be used instead of `renderingEngine.getElementTemplate`.
     * This allows you to completely override the default rendering behavior.
     *
     * In addition to providing the return value, it is the responsibility of the implementer to:
     * - Populate `this.$bindables` with any Bindings, child Views, custom elements and custom attributes
     * - Populate `this.$attachables` with any child Views, custom elements and custom attributes
     *
     * @param host The DOM node that declares this custom element
     * @param parts Replaceable parts, if any
     *
     * @returns Either an instance of `INodeSequence` with the nodes that need to be appended to the host,
     * or an implementation of `IElementTemplateProvider`
     *
     * @description
     * This is the first "hydrate" lifecycle hook. It happens only once per instance (contrary to bind/attach
     * which can happen many times per instance), though it can happen many times per type (once for each instance)
     */
    render?(host: INode, parts: Immutable<Pick<IHydrateElementInstruction, 'parts'>>): IElementTemplateProvider | INodeSequence;
    /**
     * Called at the end of `$hydrate`.
     *
     * The following key properties are now assigned and initialized (see `IRenderable` for more detail):
     * - `this.$bindables`
     * - `this.$attachables`
     * - `this.$scope` (null if this is a custom attribute, or contains the view model if this is a custom element)
     * - `this.$nodes`
     *
     * @description
     * This is the second and last "hydrate" lifecycle hook (after `render`). It happens only once per instance (contrary to bind/attach
     * which can happen many times per instance), though it can happen many times per type (once for each instance)
     *
     * This hook is called right before the `$bind` lifecycle starts, making this the last opportunity
     * for any high-level post processing on initialized properties.
     */
    created?(): void;
    /**
     * Called at the start of `$bind`, before this instance and its children (if any) are bound.
     *
     * - `this.$isBound` is false.
     * - `this.$scope` is initialized.
     *
     * @param flags Contextual information about the lifecycle, such as what triggered it.
     * Some uses for this hook:
     * - `flags & BindingFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
     * - `flags & BindingFlags.fromBind`: this is a normal `$bind` lifecycle
     * - `flags & BindingFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
     * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `ChangeSet` which is now being flushed
     *
     * @description
     * This is the first "create" lifecycle hook of the hooks that can occur multiple times per instance,
     * and the third lifecycle hook (after `render` and `created`) of the very first lifecycle.
     */
    binding?(flags: BindingFlags): void;
    /**
     * Called at the end of `$bind`, after this instance and its children (if any) are bound.
     *
     * - `$isBound` is true.
     * - `this.$scope` is initialized.
     *
     * @param flags Contextual information about the lifecycle, such as what triggered it.
     * Some uses for this hook:
     * - `flags & BindingFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
     * - `flags & BindingFlags.fromBind`: this is a normal `$bind` lifecycle
     * - `flags & BindingFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
     * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `ChangeSet` which is now being flushed
     *
     * @description
     * This is the second "create" lifecycle hook (after `binding`) of the hooks that can occur multiple times per instance,
     * and the fourth lifecycle hook (after `render`, `created` and `binding`) of the very first lifecycle.
     */
    bound?(flags: BindingFlags): void;
    /**
     * Called at the start of `$attach`, before this instance and its children (if any) are attached.
     *
     * `$isAttached` is false.
     *
     * @param encapsulationSource Ask Rob.
     * @param lifecycle Utility that encapsulates the attach sequence for a hierarchy of attachables and guarantees the correct attach order.
     *
     * @description
     * This is the third "create" lifecycle hook (after `binding` and `bound`) of the hooks that can occur multiple times per instance,
     * and the fifth lifecycle hook (after `render`, `created`, `binding` and `bound`) of the very first lifecycle
     *
     * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
     * the nodes are added to the DOM.
     */
    attaching?(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
    /**
     * Called at the end of `$attach`, after this instance and its children (if any) are attached.
     *
     * - `$isAttached` is true.
     *
     * @description
     * This is the fourth (and last) "create" lifecycle hook (after `binding`, `bound` and `attaching`) of the hooks that can occur
     * multiple times per instance, and the sixth lifecycle hook (after `render`, `created`, `binding`, `bound` and `attaching`)
     * of the very first lifecycle
     *
     * This instance and its children (if any) can be assumed
     * to be fully initialized, bound, rendered, added to the DOM and ready for use.
     */
    attached?(): void;
    /**
     * Called at the start of `$detach`, before this instance and its children (if any) are detached.
     *
     * - `$isAttached` is true.
     *
     * @param lifecycle Utility that encapsulates the detach sequence for a hierarchy of attachables and guarantees the correct detach order.
     *
     * @description
     * This is the first "cleanup" lifecycle hook.
     *
     * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
     * the nodes are removed from the DOM.
     */
    detaching?(lifecycle: IDetachLifecycle): void;
    /**
     * Called during `$removeNodes` (which happens during `$detach`), specifically after the
     * `$nodes` are removed from the DOM, but before the view is actually added to the cache.
     *
     * @description
     * This is the second "cleanup" lifecycle hook.
     *
     * This lifecycle is invoked if and only if the `ViewFactory` that created the `View` allows the view to be cached.
     *
     * Usually this hook is not invoked unless you explicitly set the cache size to to something greater than zero
     * on the resource description.
     */
    caching?(): void;
    /**
     * Called at the end of `$detach`, after this instance and its children (if any) are detached.
     *
     * - `$isAttached` is false.
     *
     * @description
     * This is the third "cleanup" lifecycle hook (after `detaching` and `caching`).
     *
     * The `$nodes` are now removed from the DOM and the `View` (if possible) is returned to cache.
     *
     * If no `$unbind` lifecycle is queued, this is the last opportunity to make state changes before the lifecycle ends.
     */
    detached?(): void;
    /**
     * Called at the start of `$unbind`, before this instance and its children (if any) are unbound.
     *
     * - `this.$isBound` is true.
     * - `this.$scope` is still available.
     *
     * @param flags Contextual information about the lifecycle, such as what triggered it.
     * Some uses for this hook:
     * - `flags & BindingFlags.fromBind`: the component is just switching scope
     * - `flags & BindingFlags.fromUnbind`: the component is really disposing
     * - `flags & BindingFlags.fromStopTask`: the Aurelia app is stopping
     *
     * @description
     * This is the fourth "cleanup" lifecycle hook (after `detaching`, `caching` and `detached`)
     *
     * Last opportunity to perform any source or target updates before the bindings are disconnected.
     *
     */
    unbinding?(flags: BindingFlags): void;
    /**
     * Called at the end of `$unbind`, after this instance and its children (if any) are unbound.
     *
     * - `this.$isBound` is false at this point.
     *
     * - `this.$scope` may not be available anymore (unless it's a `@customElement`)
     *
     * @param flags Contextual information about the lifecycle, such as what triggered it.
     * Some uses for this hook:
     * - `flags & BindingFlags.fromBind`: the component is just switching scope
     * - `flags & BindingFlags.fromUnbind`: the component is really disposing
     * - `flags & BindingFlags.fromStopTask`: the Aurelia app is stopping
     *
     * @description
     * This is the fifth (and last) "cleanup" lifecycle hook (after `detaching`, `caching`, `detached`
     * and `unbinding`).
     *
     * The lifecycle either ends here, or starts at `$bind` again.
     */
    unbound?(flags: BindingFlags): void;
}
export interface ILifecycleTask {
    readonly done: boolean;
    canCancel(): boolean;
    cancel(): void;
    wait(): Promise<void>;
}
export interface IAttachLifecycleController {
    attach(requestor: IAttach): IAttachLifecycleController;
    end(): ILifecycleTask;
}
declare type LifecycleAttachable = {
    attached(): void;
};
declare type LifecycleNodeAddable = Pick<IRenderable, '$addNodes'> & {};
export interface IAttachLifecycle {
    readonly flags: LifecycleFlags;
    registerTask(task: ILifecycleTask): void;
    createChild(): IAttachLifecycle;
    queueAddNodes(requestor: LifecycleNodeAddable): void;
    queueAttachedCallback(requestor: LifecycleAttachable): void;
}
export interface IDetachLifecycleController {
    detach(requestor: IAttach): IDetachLifecycleController;
    end(): ILifecycleTask;
}
declare type LifecycleDetachable = {
    detached(): void;
};
declare type LifecycleNodeRemovable = Pick<IRenderable, '$removeNodes'> & {};
export declare class AggregateLifecycleTask implements ILifecycleTask {
    done: boolean;
    private tasks;
    private waiter;
    private resolve;
    addTask(task: ILifecycleTask): void;
    canCancel(): boolean;
    cancel(): void;
    wait(): Promise<void>;
    private tryComplete;
    private complete;
}
export interface IDetachLifecycle {
    readonly flags: LifecycleFlags;
    registerTask(task: ILifecycleTask): void;
    createChild(): IDetachLifecycle;
    queueRemoveNodes(requestor: LifecycleNodeRemovable): void;
    queueDetachedCallback(requestor: LifecycleDetachable): void;
}
export declare const Lifecycle: {
    beginAttach(changeSet: IChangeSet, encapsulationSource: INode, flags: LifecycleFlags): IAttachLifecycleController;
    beginDetach(changeSet: IChangeSet, flags: LifecycleFlags): IDetachLifecycleController;
    done: {
        done: boolean;
        canCancel(): boolean;
        cancel(): void;
        wait(): Promise<void>;
    };
};
export {};
//# sourceMappingURL=lifecycle.d.ts.map