import { Omit } from '@aurelia/kernel';
import { INode } from './dom';
import { BindingFlags, IChangeSet, IScope } from './observation';
export declare const enum LifecycleState {
    none = 0,
    isBinding = 1,
    isBound = 2,
    isAttaching = 4,
    isAttached = 8,
    isDetaching = 16,
    isUnbinding = 32,
    isCached = 64,
    needsMount = 128
}
export declare enum LifecycleFlags {
    none = 1,
    noTasks = 2,
    unbindAfterDetached = 4
}
export declare const enum LifecycleHooks {
    none = 1,
    hasCreated = 2,
    hasBinding = 4,
    hasBound = 8,
    hasAttaching = 16,
    hasAttached = 32,
    hasDetaching = 64,
    hasDetached = 128,
    hasUnbinding = 256,
    hasUnbound = 512,
    hasRender = 1024,
    hasCaching = 2048
}
export interface ILifecycleCreated {
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
}
export interface ILifecycleBinding {
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
     * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
     *
     * @description
     * This is the first "create" lifecycle hook of the hooks that can occur multiple times per instance,
     * and the third lifecycle hook (after `render` and `created`) of the very first lifecycle.
     */
    binding?(flags: BindingFlags): void;
}
export interface ILifecycleBound {
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
     * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
     *
     * @description
     * This is the second "create" lifecycle hook (after `binding`) of the hooks that can occur multiple times per instance,
     * and the fourth lifecycle hook (after `render`, `created` and `binding`) of the very first lifecycle.
     */
    bound?(flags: BindingFlags): void;
}
export interface ILifecycleUnbinding {
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
}
export interface ILifecycleUnbound {
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
export interface ILifecycleAttaching {
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
}
export interface ILifecycleAttached {
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
}
export interface ILifecycleDetaching {
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
}
export interface ILifecycleDetached {
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
}
export interface ILifecycleCaching {
    /**
     * Called during `$unmount` (which happens during `$detach`), specifically after the
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
}
/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface ILifecycleHooks extends ILifecycleCreated, ILifecycleBinding, ILifecycleBound, ILifecycleUnbinding, ILifecycleUnbound, ILifecycleAttaching, ILifecycleAttached, ILifecycleDetaching, ILifecycleDetached, ILifecycleCaching {
}
export interface ILifecycleState {
    $state: LifecycleState;
}
export interface ILifecycleCache {
    $cache(): void;
}
export interface ICachable extends ILifecycleCache, ILifecycleState {
}
export interface ILifecycleAttach {
    $attach(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
}
export interface ILifecycleDetach {
    $detach(lifecycle: IDetachLifecycle): void;
}
export interface IAttach extends ILifecycleAttach, ILifecycleDetach, ICachable {
}
export interface ILifecycleMount {
    /**
     * Add the `$nodes` of this instance to the Host or RenderLocation that this instance is holding.
     */
    $mount(): void;
}
export interface ILifecycleUnmount {
    /**
     * Remove the `$nodes` of this instance from the Host or RenderLocation that this instance is holding, optionally returning them to a cache.
     * @returns
     * - `true` if the instance has been returned to the cache.
     * - `false` if the cache (typically ViewFactory) did not allow the instance to be cached.
     * - `undefined` (void) if the instance does not support caching. Functionally equivalent to `false`
     */
    $unmount(): boolean | void;
}
export interface IMountable extends ILifecycleMount, ILifecycleUnmount, ILifecycleState {
}
export interface ILifecycleUnbind {
    $unbind(flags: BindingFlags): void;
}
export interface ILifecycleBind {
    $bind(flags: BindingFlags, scope?: IScope): void;
}
export interface ILifecycleBindSelf {
    $bind(flags: BindingFlags): void;
}
export interface ILifecycleBindScope {
    $bind(flags: BindingFlags, scope: IScope): void;
}
export interface IBind extends ILifecycleBind, ILifecycleUnbind, ILifecycleState {
}
export interface IBindScope extends Omit<IBind, '$bind'>, ILifecycleBindScope {
}
export interface IBindSelf extends Omit<IBind, '$bind'>, ILifecycleBindSelf {
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
export interface IAttachLifecycle {
    readonly flags: LifecycleFlags;
    registerTask(task: ILifecycleTask): void;
    createChild(): IAttachLifecycle;
    queueMount(requestor: ILifecycleMount): void;
    queueAttachedCallback(requestor: ILifecycleAttached): void;
}
export interface IDetachLifecycleController {
    detach(requestor: IAttach): IDetachLifecycleController;
    end(): ILifecycleTask;
}
export interface IDetachLifecycle {
    readonly flags: LifecycleFlags;
    registerTask(task: ILifecycleTask): void;
    createChild(): IDetachLifecycle;
    queueUnmount(requestor: ILifecycleUnmount): void;
    queueDetachedCallback(requestor: ILifecycleDetached): void;
}
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
export declare const BindLifecycle: {
    boundDepth: number;
    boundHead: ILifecycleBound;
    boundTail: ILifecycleBound;
    queueBound(requestor: ILifecycleBound, flags: BindingFlags): void;
    unqueueBound(): void;
    unboundDepth: number;
    unboundHead: ILifecycleUnbound;
    unboundTail: ILifecycleUnbound;
    queueUnbound(requestor: ILifecycleUnbound, flags: BindingFlags): void;
    unqueueUnbound(): void;
};
//# sourceMappingURL=lifecycle.d.ts.map