import { IContainer } from '@aurelia/kernel';
import { ForOfStatement, type IsBindingBehavior } from '@aurelia/expression-parser';
import { type Collection, CollectionObserver, type IndexMap } from '@aurelia/runtime';
import { CustomAttributeStaticAuDefinition } from '../custom-attribute';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller';
type Items<C extends Collection = unknown[]> = C | undefined;
export declare class Repeat<C extends Collection = unknown[]> implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    views: ISyntheticView[];
    forOf: ForOfStatement;
    local: string;
    readonly $controller: ICustomAttributeController<this>;
    items: Items<C>;
    key: null | string | IsBindingBehavior;
    constructor();
    binding(_initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    attaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    unbinding(_initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    itemsChanged(): void;
    handleCollectionChange(collection: Collection, indexMap: IndexMap | undefined): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export declare const IRepeatableHandlerResolver: import("@aurelia/kernel").InterfaceSymbol<IRepeatableHandlerResolver>;
/**
 * An interface describings the capabilities of a repeatable handler.
 */
export interface IRepeatableHandlerResolver {
    resolve(value: unknown): IRepeatableHandler;
}
/**
 * A simple implementation for handling common array like values, such as:
 * - HTMLCollection
 * - NodeList
 * - FileList,
 * - etc...
 */
export declare class ArrayLikeHandler implements IRepeatableHandler<ArrayLike<unknown>> {
    static register(c: IContainer): void;
    handles(value: NonNullable<unknown>): boolean;
    iterate(items: ArrayLike<unknown>, func: (item: unknown, index: number, arr: ArrayLike<unknown>) => void): void;
}
/**
 * An interface describing a repeatable value handler
 */
export declare const IRepeatableHandler: import("@aurelia/kernel").InterfaceSymbol<IRepeatableHandler<Repeatable>>;
export interface IRepeatableHandler<TValue extends Repeatable = Repeatable> {
    handles(value: unknown): boolean;
    getObserver?(value: TValue): CollectionObserver | undefined;
    iterate(value: TValue, func: (item: unknown, index: number, value: TValue) => void): void;
}
type Repeatable = Collection | ArrayLike<unknown> | number | null | undefined;
export {};
//# sourceMappingURL=repeat.d.ts.map