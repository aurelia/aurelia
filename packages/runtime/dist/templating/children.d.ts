import { Constructable } from '@aurelia/kernel';
import { INode } from '../dom';
import { IController, IViewModel } from '../lifecycle';
import { IElementProjector } from '../resources/custom-element';
export declare type PartialChildrenDefinition<TNode extends INode = INode> = {
    callback?: string;
    property?: string;
    options?: MutationObserverInit;
    query?: (projector: IElementProjector<TNode>) => ArrayLike<TNode>;
    filter?: (node: TNode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => boolean;
    map?: (node: TNode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => any;
};
/**
 * Decorator: Specifies custom behavior for an array children property that synchronizes its items with child content nodes of the element.
 *
 * @param config - The overrides
 */
export declare function children(config?: PartialChildrenDefinition): PropertyDecorator;
/**
 * Decorator: Specifies an array property on a class that synchronizes its items with child content nodes of the element.
 *
 * @param prop - The property name
 */
export declare function children(prop: string): ClassDecorator;
/**
 * Decorator: Decorator: Specifies an array property that synchronizes its items with child content nodes of the element.
 *
 * @param target - The class
 * @param prop - The property name
 */
export declare function children(target: {}, prop: string): void;
export declare const Children: {
    name: string;
    keyFrom(name: string): string;
    from(...childrenObserverLists: readonly (readonly string[] | ChildrenDefinition<INode> | Record<string, PartialChildrenDefinition<INode>> | undefined)[]): Record<string, ChildrenDefinition<INode>>;
    getAll(Type: Constructable<{}>): readonly ChildrenDefinition<INode>[];
};
export declare class ChildrenDefinition<TNode extends INode = INode> {
    readonly callback: string;
    readonly property: string;
    readonly options?: MutationObserverInit | undefined;
    readonly query?: ((projector: IElementProjector<TNode>) => ArrayLike<TNode>) | undefined;
    readonly filter?: ((node: TNode, controller?: IController<TNode, IViewModel<TNode>> | undefined, viewModel?: IViewModel<TNode> | undefined) => boolean) | undefined;
    readonly map?: ((node: TNode, controller?: IController<TNode, IViewModel<TNode>> | undefined, viewModel?: IViewModel<TNode> | undefined) => any) | undefined;
    private constructor();
    static create<TNode extends INode = INode>(prop: string, def?: PartialChildrenDefinition<TNode>): ChildrenDefinition<TNode>;
}
//# sourceMappingURL=children.d.ts.map