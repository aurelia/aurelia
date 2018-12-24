import { Constructable, IRegistry } from '@aurelia/kernel';
import { TargetedInstruction, TemplateDefinition } from '../definitions';
import { IDOM } from '../dom';
import { INode } from '../dom.interfaces';
import { IRenderContext, IView, IViewFactory } from '../lifecycle';
import { ICustomElementType } from '../resources/custom-element';
import { IRenderingEngine, ITemplate } from './lifecycle-render';
export declare function createElement(dom: IDOM, tagOrType: string | Constructable, props?: Record<string, string | TargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan;
export declare class RenderPlan {
    private readonly dom;
    private readonly dependencies;
    private readonly instructions;
    private readonly node;
    private lazyDefinition;
    constructor(dom: IDOM, node: INode, instructions: TargetedInstruction[][], dependencies: ReadonlyArray<IRegistry>);
    readonly definition: TemplateDefinition;
    getElementTemplate(engine: IRenderingEngine, Type?: ICustomElementType): ITemplate;
    createView(engine: IRenderingEngine, parentContext?: IRenderContext): IView;
    getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext): IViewFactory;
}
//# sourceMappingURL=create-element.d.ts.map