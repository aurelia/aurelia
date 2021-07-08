import type { Constructable } from '@aurelia/kernel';
import type { ISubscriberCollection, IAccessor, ISubscribable, IObserver } from '@aurelia/runtime';
import type { ICustomElementViewModel, ICustomElementController } from './controller.js';
export declare type PartialChildrenDefinition = {
    callback?: string;
    property?: string;
    options?: MutationObserverInit;
    query?: (controller: ICustomElementController) => ArrayLike<Node>;
    filter?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => boolean;
    map?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => any;
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
    from(...childrenObserverLists: readonly (ChildrenDefinition | Record<string, PartialChildrenDefinition> | readonly string[] | undefined)[]): Record<string, ChildrenDefinition>;
    getAll(Type: Constructable): readonly ChildrenDefinition[];
};
export declare class ChildrenDefinition {
    readonly callback: string;
    readonly property: string;
    readonly options?: MutationObserverInit | undefined;
    readonly query?: ((controller: ICustomElementController) => ArrayLike<Node>) | undefined;
    readonly filter?: ((node: Node, controller?: ICustomElementController<ICustomElementViewModel> | null | undefined, viewModel?: ICustomElementViewModel | undefined) => boolean) | undefined;
    readonly map?: ((node: Node, controller?: ICustomElementController<ICustomElementViewModel> | null | undefined, viewModel?: ICustomElementViewModel | undefined) => any) | undefined;
    private constructor();
    static create(prop: string, def?: PartialChildrenDefinition): ChildrenDefinition;
}
export interface ChildrenObserver extends IAccessor, ISubscribable, ISubscriberCollection, IObserver {
}
//# sourceMappingURL=children.d.ts.map