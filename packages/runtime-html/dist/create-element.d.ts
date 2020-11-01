import { Constructable, IContainer, Key } from '@aurelia/kernel';
import { IInstruction } from './renderer';
import { IPlatform } from './platform';
import { CustomElementDefinition } from './resources/custom-element';
import { IRenderContext } from './templating/render-context';
import { IViewFactory } from './templating/view';
import type { ISyntheticView } from './templating/controller';
export declare function createElement<C extends Constructable = Constructable>(p: IPlatform, tagOrType: string | C, props?: Record<string, string | IInstruction>, children?: ArrayLike<unknown>): RenderPlan;
/**
 * RenderPlan. Todo: describe goal of this class
 */
export declare class RenderPlan {
    private readonly node;
    private readonly instructions;
    private readonly dependencies;
    private lazyDefinition?;
    constructor(node: Node, instructions: IInstruction[][], dependencies: Key[]);
    get definition(): CustomElementDefinition;
    getContext(parentContainer: IContainer): IRenderContext;
    createView(parentContainer: IContainer): ISyntheticView;
    getViewFactory(parentContainer: IContainer): IViewFactory;
}
//# sourceMappingURL=create-element.d.ts.map