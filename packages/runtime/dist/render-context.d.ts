import { Constructable, IContainer, IDisposable, IFactory, IResolver, Key, Resolved, RuntimeCompilationResources, Transformer } from '@aurelia/kernel';
import { ITargetedInstruction, PartialCustomElementDefinitionParts } from './definitions';
import { IDOM, INode, IRenderLocation } from './dom';
import { LifecycleFlags } from './flags';
import { IController, IRenderContext, IViewFactory } from './lifecycle';
import { CustomElementDefinition } from './resources/custom-element';
export declare class RenderContext implements IRenderContext {
    private readonly dom;
    private readonly parentContainer;
    private readonly dependencies;
    private readonly componentType?;
    readonly id: number;
    readonly path: string;
    readonly parentId: number;
    private readonly container;
    private readonly renderableProvider;
    private readonly elementProvider;
    private readonly instructionProvider;
    private readonly factoryProvider;
    private readonly renderLocationProvider;
    private readonly renderer;
    constructor(dom: IDOM, parentContainer: IContainer, dependencies: readonly Key[], componentType?: import("@aurelia/kernel").ResourceType<Constructable<{}>, import("./lifecycle").IViewModel<INode>, import("@aurelia/kernel").PartialResourceDefinition<{
        readonly cache?: number | "*" | undefined;
        readonly template?: unknown;
        readonly instructions?: readonly (readonly ITargetedInstruction[])[] | undefined;
        readonly dependencies?: readonly Key[] | undefined;
        readonly needsCompile?: boolean | undefined;
        readonly surrogates?: readonly ITargetedInstruction[] | undefined;
        readonly bindables?: readonly string[] | Record<string, import(".").PartialBindableDefinition> | undefined;
        readonly childrenObservers?: Record<string, import(".").PartialChildrenDefinition<INode>> | undefined;
        readonly containerless?: boolean | undefined;
        readonly isStrictBinding?: boolean | undefined;
        readonly shadowOptions?: {
            mode: "open" | "closed";
        } | null | undefined;
        readonly hasSlots?: boolean | undefined;
        readonly strategy?: import("./flags").BindingStrategy | undefined;
        readonly hooks?: Readonly<import("./definitions").HooksDefinition> | undefined;
        readonly scopeParts?: readonly string[] | undefined;
    }>, {}> | undefined);
    has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
    get<K extends Key>(key: K | Key): Resolved<K>;
    getAll<K extends Key>(key: K | Key): readonly Resolved<K>[];
    register(...params: any[]): IContainer;
    registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T>;
    registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
    getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
    getFactory<T extends Constructable>(key: T): IFactory<T> | null;
    createChild(): IContainer;
    render(flags: LifecycleFlags, controller: IController, targets: ArrayLike<INode>, definition: CustomElementDefinition, host?: INode, parts?: PartialCustomElementDefinitionParts): void;
    beginComponentOperation(renderable: IController, target: INode, instruction: ITargetedInstruction, factory: IViewFactory | null, parts?: PartialCustomElementDefinitionParts, location?: IRenderLocation): IDisposable;
    dispose(): void;
    createRuntimeCompilationResources(): RuntimeCompilationResources;
}
//# sourceMappingURL=render-context.d.ts.map