import { Constructable, IContainer, IDisposable, IFactory, IResolver, Key, Resolved, RuntimeCompilationResources, Transformer } from '@aurelia/kernel';
import { ITargetedInstruction, TemplateDefinition, TemplatePartDefinitions } from './definitions';
import { IDOM, INode, IRenderLocation } from './dom';
import { LifecycleFlags } from './flags';
import { IController, IRenderContext, IViewFactory } from './lifecycle';
import { ICustomElementType } from './resources/custom-element';
export declare class RenderContext implements IRenderContext {
    private readonly dom;
    private readonly parentContainer;
    private readonly dependencies;
    private readonly componentType?;
    readonly id: number;
    readonly parentId: number;
    private readonly container;
    private readonly renderableProvider;
    private readonly elementProvider;
    private readonly instructionProvider;
    private readonly factoryProvider;
    private readonly renderLocationProvider;
    private readonly renderer;
    constructor(dom: IDOM, parentContainer: IContainer, dependencies: readonly Key[], componentType?: ICustomElementType<Constructable<{}>> | undefined);
    has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
    get<K extends Key>(key: K | Key): Resolved<K>;
    getAll<K extends Key>(key: K | Key): readonly Resolved<K>[];
    register(...params: any[]): IContainer;
    registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T>;
    registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
    getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
    getFactory<T extends Constructable>(key: T): IFactory<T>;
    createChild(): IContainer;
    render(flags: LifecycleFlags, renderable: IController, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
    beginComponentOperation(renderable: IController, target: INode, instruction: ITargetedInstruction, factory: IViewFactory | null, parts?: TemplatePartDefinitions, location?: IRenderLocation): IDisposable;
    dispose(): void;
    createRuntimeCompilationResources(): RuntimeCompilationResources;
}
//# sourceMappingURL=render-context.d.ts.map