import { Constructable, IContainer, Key } from '@aurelia/kernel';
import { IDOM, INode, IViewFactory, CustomElementDefinition, IRenderContext } from '@aurelia/runtime';
import { HTMLTargetedInstruction } from './definitions';
import { ISyntheticView } from '@aurelia/runtime/dist/lifecycle';
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
    get definition(): CustomElementDefinition;
    getContext(parentContainer: IContainer): IRenderContext<T>;
    createView(parentContainer: IContainer): ISyntheticView<T>;
    getViewFactory(parentContainer: IContainer): IViewFactory<T>;
}
//# sourceMappingURL=create-element.d.ts.map