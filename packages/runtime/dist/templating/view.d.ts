import { Constructable, ConstructableClass, IContainer, IResolver } from '@aurelia/kernel';
import { INode } from '../dom';
import { LifecycleFlags } from '../flags';
import { ILifecycle, IViewFactory, ICustomElementViewModel, ISyntheticView } from '../lifecycle';
import { PartialCustomElementDefinition, CustomElementDefinition } from '../resources/custom-element';
import { IRenderContext } from './render-context';
import { AuSlotContentType } from '../resources/custom-elements/au-slot';
import { IScope } from '../observation';
export declare class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
    name: string;
    readonly context: IRenderContext<T>;
    private readonly lifecycle;
    readonly contentType: AuSlotContentType | undefined;
    readonly projectionScope: IScope | null;
    static maxCacheSize: number;
    isCaching: boolean;
    private cache;
    private cacheSize;
    constructor(name: string, context: IRenderContext<T>, lifecycle: ILifecycle, contentType: AuSlotContentType | undefined, projectionScope?: IScope | null);
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(controller: ISyntheticView<T>): boolean;
    tryReturnToCache(controller: ISyntheticView<T>): boolean;
    create(flags?: LifecycleFlags): ISyntheticView<T>;
}
export declare const Views: {
    name: string;
    has(value: object): boolean;
    get(value: object | Constructable): readonly CustomElementDefinition[];
    add<T extends Constructable<{}>>(Type: T, partialDefinition: PartialCustomElementDefinition): readonly CustomElementDefinition[];
};
export declare function view(v: PartialCustomElementDefinition): <T extends Constructable<{}>>(target: T) => void;
export declare const IViewLocator: import("@aurelia/kernel").InterfaceSymbol<IViewLocator>;
export interface IViewLocator {
    getViewComponentForObject<T extends ClassInstance<ICustomElementViewModel>>(object: T | null | undefined, viewNameOrSelector?: string | ViewSelector): ComposableObjectComponentType<T> | null;
}
export declare type ClassInstance<T> = T & {
    readonly constructor: Function;
};
export declare type ViewSelector = (object: ICustomElementViewModel, views: readonly PartialCustomElementDefinition[]) => string;
export declare type ComposableObjectComponentType<T extends ICustomElementViewModel> = ConstructableClass<{
    viewModel: T;
} & ICustomElementViewModel>;
export declare class ViewLocator implements IViewLocator {
    private readonly modelInstanceToBoundComponent;
    private readonly modelTypeToUnboundComponent;
    static register(container: IContainer): IResolver<IViewLocator>;
    getViewComponentForObject<T extends ClassInstance<ICustomElementViewModel>>(object: T | null | undefined, viewNameOrSelector?: string | ViewSelector): ComposableObjectComponentType<T> | null;
    private getOrCreateBoundComponent;
    private getOrCreateUnboundComponent;
    private getViewName;
    private getView;
}
//# sourceMappingURL=view.d.ts.map