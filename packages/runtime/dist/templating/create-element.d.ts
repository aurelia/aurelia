import { Constructable, IRegistry } from '@aurelia/kernel';
import { TargetedInstruction, TemplateDefinition } from '../definitions';
import { INode } from '../dom.interfaces';
import { IRenderContext, IView, IViewFactory } from '../lifecycle';
import { ICustomElementType } from '../resources/custom-element';
import { IRenderingEngine, ITemplate } from './lifecycle-render';
export declare function createElement(tagOrType: string | Constructable, props?: Record<string, string | TargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan;
export declare class RenderPlan {
    private readonly dependencies;
    private readonly instructions;
    private readonly node;
    private lazyDefinition;
    constructor(node: INode, instructions: TargetedInstruction[][], dependencies: ReadonlyArray<IRegistry>);
    readonly definition: TemplateDefinition;
    getElementTemplate(engine: IRenderingEngine, Type?: ICustomElementType): ITemplate;
    createView(engine: IRenderingEngine, parentContext?: IRenderContext): IView;
    getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext): IViewFactory;
}
//# sourceMappingURL=create-element.d.ts.map