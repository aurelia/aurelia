import { Constructable, IContainer, Key } from '@aurelia/kernel';
import { IController, CustomElementType, IDOM, INode, IRenderContext, IRenderingEngine, ITemplate, IViewFactory, LifecycleFlags, CustomElementDefinition } from '@aurelia/runtime';
import { HTMLTargetedInstruction } from './definitions';
export declare function createElement<T extends INode = Node, C extends Constructable = Constructable>(dom: IDOM<T>, tagOrType: string | C, props?: Record<string, string | HTMLTargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan<T>;
/**
 * RenderPlan. Todo: describe goal of this class
 */
export declare class RenderPlan<T extends INode = Node> {
    private readonly dom;
    private readonly node;
    private readonly instructions;
    private readonly dependencies;
    private lazyDefinition?;
    constructor(dom: IDOM<T>, node: T, instructions: HTMLTargetedInstruction[][], dependencies: Key[]);
    readonly definition: CustomElementDefinition;
    getElementTemplate(engine: IRenderingEngine, Type?: CustomElementType): ITemplate<T> | undefined;
    createView(flags: LifecycleFlags, engine: IRenderingEngine, parentContext?: IRenderContext<T> | IContainer): IController;
    getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext<T> | IContainer): IViewFactory;
}
//# sourceMappingURL=create-element.d.ts.map