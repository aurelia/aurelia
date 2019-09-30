import { Constructable, IContainer, IRegistry } from '@aurelia/kernel';
import { IController, ICustomElementType, IDOM, INode, IRenderContext, IRenderingEngine, ITemplate, IViewFactory, LifecycleFlags, TemplateDefinition } from '@aurelia/runtime';
import { HTMLTargetedInstruction } from './definitions';
export declare function createElement<T extends INode = Node, C extends Constructable = Constructable>(dom: IDOM<T>, tagOrType: string | C, props?: Record<string, string | HTMLTargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan<T>;
/**
 * RenderPlan. Todo: describe goal of this class
 */
export declare class RenderPlan<T extends INode = Node> {
    private readonly dom;
    private readonly dependencies;
    private readonly instructions;
    private readonly node;
    private lazyDefinition?;
    constructor(dom: IDOM<T>, node: T, instructions: HTMLTargetedInstruction[][], dependencies: readonly IRegistry[]);
    readonly definition: TemplateDefinition;
    getElementTemplate(engine: IRenderingEngine, Type?: ICustomElementType): ITemplate<T>;
    createView(flags: LifecycleFlags, engine: IRenderingEngine, parentContext?: IRenderContext<T> | IContainer): IController;
    getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext<T> | IContainer): IViewFactory;
}
//# sourceMappingURL=create-element.d.ts.map