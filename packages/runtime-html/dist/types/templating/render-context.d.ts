import { INode, INodeSequence } from '../dom.js';
import { IInstruction, ICompliationInstruction } from '../renderer.js';
import { CustomElementDefinition } from '../resources/custom-element.js';
import { IViewFactory } from './view.js';
import { IPlatform } from '../platform.js';
import { IController } from './controller.js';
import type { IContainer } from '@aurelia/kernel';
import type { LifecycleFlags } from '@aurelia/runtime';
import type { IHydratableController } from './controller.js';
import type { PartialCustomElementDefinition } from '../resources/custom-element.js';
export declare function isRenderContext(value: unknown): value is IRenderContext;
/**
 * A render context that wraps an `IContainer` and must be compiled before it can be used for composing.
 */
export interface IRenderContext {
    readonly platform: IPlatform;
    /**
     * The `CustomElementDefinition` that this `IRenderContext` was created with.
     *
     * If a `PartialCustomElementDefinition` was used to create this context, then this property will be the return value of `CustomElementDefinition.getOrCreate`.
     */
    readonly definition: CustomElementDefinition;
    /**
     * The `IContainer` (which may be, but is not guaranteed to be, an `IRenderContext`) that this `IRenderContext` was created with.
     */
    readonly container: IContainer;
    /**
     * Compiles the backing `CustomElementDefinition` (if needed) and returns the compiled `IRenderContext` that exposes the compiled `CustomElementDefinition` as well as composing operations.
     *
     * This operation is idempotent.
     *
     * @returns The compiled `IRenderContext`.
     */
    compile(compilationInstruction: ICompliationInstruction | null): ICompiledRenderContext;
    /**
     * Creates an (or returns the cached) `IViewFactory` that can be used to create synthetic view controllers.
     *
     * @returns Either a new `IViewFactory` (if this is the first call), or a cached one.
     */
    getViewFactory(name?: string): IViewFactory;
}
/**
 * A compiled `IRenderContext` that can create instances of `INodeSequence` (based on the template of the compiled definition)
 * and begin a component operation to create new component instances.
 */
export interface ICompiledRenderContext extends IRenderContext {
    /**
     * The compiled `CustomElementDefinition`.
     *
     * If the passed-in `PartialCustomElementDefinition` had a non-null `template` and `needsCompile` set to `true`, this will be a new definition created by the `ITemplateCompiler`.
     */
    readonly compiledDefinition: CustomElementDefinition;
    /**
     * Returns a new `INodeSequence` based on the document fragment from the compiled `CustomElementDefinition`.
     *
     * A new instance will be created from a clone of the fragment on each call.
     *
     * @returns An new instance of `INodeSequence` if there is a template, otherwise a shared empty instance.
     */
    createNodes(): INodeSequence;
    render(flags: LifecycleFlags, controller: IController, targets: ArrayLike<INode>, templateDefinition: CustomElementDefinition, host: INode | null | undefined): void;
    renderChildren(flags: LifecycleFlags, instructions: readonly IInstruction[], controller: IController, target: unknown): void;
}
export declare function getRenderContext(partialDefinition: PartialCustomElementDefinition, container: IContainer): IRenderContext;
export declare namespace getRenderContext {
    var count: number;
}
export declare class RenderContext implements ICompiledRenderContext {
    readonly definition: CustomElementDefinition;
    get id(): number;
    readonly root: IContainer;
    readonly container: IContainer;
    private fragment;
    private factory;
    private isCompiled;
    readonly platform: IPlatform;
    private readonly renderers;
    compiledDefinition: CustomElementDefinition;
    constructor(definition: CustomElementDefinition, container: IContainer);
    compile(compilationInstruction: ICompliationInstruction | null): ICompiledRenderContext;
    getViewFactory(name?: string): IViewFactory;
    createNodes(): INodeSequence;
    render(flags: LifecycleFlags, controller: IHydratableController, targets: ArrayLike<INode>, definition: CustomElementDefinition, host: INode | null | undefined): void;
    renderChildren(flags: LifecycleFlags, instructions: readonly IInstruction[], controller: IHydratableController, target: unknown): void;
    dispose(): void;
}
//# sourceMappingURL=render-context.d.ts.map