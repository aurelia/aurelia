import { Constructable, IContainer, Key } from '@aurelia/kernel';
import { Instruction } from './instructions';
import { ISyntheticView } from './lifecycle';
import { IPlatform } from './platform';
import { CustomElementDefinition } from './resources/custom-element';
import { ICompositionContext } from './templating/composition-context';
import { IViewFactory } from './templating/view';
export declare function createElement<C extends Constructable = Constructable>(p: IPlatform, tagOrType: string | C, props?: Record<string, string | Instruction>, children?: ArrayLike<unknown>): CompositionPlan;
/**
 * CompositionPlan. Todo: describe goal of this class
 */
export declare class CompositionPlan {
    private readonly node;
    private readonly instructions;
    private readonly dependencies;
    private lazyDefinition?;
    constructor(node: Node, instructions: Instruction[][], dependencies: Key[]);
    get definition(): CustomElementDefinition;
    getContext(parentContainer: IContainer): ICompositionContext;
    createView(parentContainer: IContainer): ISyntheticView;
    getViewFactory(parentContainer: IContainer): IViewFactory;
}
//# sourceMappingURL=create-element.d.ts.map