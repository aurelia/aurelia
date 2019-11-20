import { Constructable, IContainer, IDisposable, IFactory, IResolver, Key, Resolved, RuntimeCompilationResources, Transformer } from '@aurelia/kernel';
import { ITargetedInstruction, PartialCustomElementDefinitionParts } from './definitions';
import { IDOM, INode, IRenderLocation } from './dom';
import { LifecycleFlags } from './flags';
import { IController, IRenderContext, IViewFactory, IViewModel } from './lifecycle';
import { CustomElementDefinition, CustomElementType } from './resources/custom-element';
export declare class RenderContext implements IRenderContext {
    private readonly dom;
    private readonly parentContainer;
    get id(): number;
    get path(): string;
    get parentId(): number;
    private readonly container;
    private readonly renderableProvider;
    private readonly elementProvider;
    private readonly instructionProvider;
    private readonly factoryProvider;
    private readonly renderLocationProvider;
    private readonly renderer;
    constructor(dom: IDOM, parentContainer: IContainer, dependencies: readonly Key[], componentType?: CustomElementType, componentInstance?: IViewModel);
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