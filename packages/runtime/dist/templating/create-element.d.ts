import { Constructable } from '@aurelia/kernel';
import { INode } from '../dom';
import { ICustomElementType } from './custom-element';
import { TargetedInstruction, TemplateDefinition } from './instructions';
import { IRenderContext } from './render-context';
import { IRenderingEngine } from './rendering-engine';
import { ITemplate } from './template';
import { IView, IViewFactory } from './view';
declare type ChildType = PotentialRenderable | string | INode;
export declare function createElement(tagOrType: string | Constructable, props?: any, children?: ArrayLike<ChildType>): PotentialRenderable;
export declare class PotentialRenderable {
    private readonly node;
    private readonly instructions;
    private readonly dependencies;
    private lazyDefinition;
    constructor(node: INode, instructions: TargetedInstruction[][], dependencies: ReadonlyArray<any>);
    readonly definition: TemplateDefinition;
    getElementTemplate(engine: IRenderingEngine, type?: ICustomElementType): ITemplate;
    createView(engine: IRenderingEngine, parentContext?: IRenderContext): IView;
    getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext): IViewFactory;
}
export {};
//# sourceMappingURL=create-element.d.ts.map