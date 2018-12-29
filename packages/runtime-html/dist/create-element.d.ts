import { Constructable, IRegistry } from '@aurelia/kernel';
import { ICustomElementType, IDOM, INode, IRenderContext, IRenderingEngine, ITemplate, IView, IViewFactory, TemplateDefinition } from '@aurelia/runtime';
import { HTMLTargetedInstruction } from './definitions';
export declare function createElement<T extends INode = Node>(dom: IDOM<T>, tagOrType: string | Constructable, props?: Record<string, string | HTMLTargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan<T>;
export declare class RenderPlan<T extends INode = Node> {
    private readonly dom;
    private readonly dependencies;
    private readonly instructions;
    private readonly node;
    private lazyDefinition;
    constructor(dom: IDOM<T>, node: T, instructions: HTMLTargetedInstruction[][], dependencies: ReadonlyArray<IRegistry>);
    readonly definition: TemplateDefinition;
    getElementTemplate(engine: IRenderingEngine, Type?: ICustomElementType<T>): ITemplate<T>;
    createView(engine: IRenderingEngine, parentContext?: IRenderContext): IView;
    getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext): IViewFactory;
}
//# sourceMappingURL=create-element.d.ts.map