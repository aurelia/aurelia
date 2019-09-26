import { Constructable, ConstructableClass, IContainer, IResolver } from '@aurelia/kernel';
import { ITemplateDefinition, TemplatePartDefinitions } from '../definitions';
import { INode } from '../dom';
import { LifecycleFlags } from '../flags';
import { IController, ILifecycle, IViewFactory, IViewModel } from '../lifecycle';
import { ITemplate } from '../rendering-engine';
export declare class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
    static maxCacheSize: number;
    readonly parentContextId: number;
    isCaching: boolean;
    name: string;
    parts: TemplatePartDefinitions;
    private cache;
    private cacheSize;
    private readonly lifecycle;
    private readonly template;
    constructor(name: string, template: ITemplate<T>, lifecycle: ILifecycle);
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(controller: IController<T>): boolean;
    tryReturnToCache(controller: IController<T>): boolean;
    create(flags?: LifecycleFlags): IController<T>;
    addParts(parts: Record<string, ITemplateDefinition>): void;
}
declare type HasAssociatedViews = {
    $views: ITemplateDefinition[];
};
export declare function view(v: ITemplateDefinition): <T extends Constructable<{}>>(target: T & Partial<HasAssociatedViews>) => void;
export declare const IViewLocator: import("@aurelia/kernel").InterfaceSymbol<IViewLocator>;
export interface IViewLocator {
    getViewComponentForObject<T extends ClassInstance<ComposableObject>>(object: T | null | undefined, viewNameOrSelector?: string | ViewSelector): ComposableObjectComponentType<T> | null;
}
export declare type ClassInstance<T> = T & {
    readonly constructor: Function;
};
export declare type ComposableObject = Omit<IViewModel, '$controller'>;
export declare type ViewSelector = (object: ComposableObject, views: ITemplateDefinition[]) => string;
export declare type ComposableObjectComponentType<T extends ComposableObject> = ConstructableClass<{
    viewModel: T;
} & ComposableObject>;
export declare class ViewLocator implements IViewLocator {
    private readonly modelInstanceToBoundComponent;
    private readonly modelTypeToUnboundComponent;
    static register(container: IContainer): IResolver<IViewLocator>;
    getViewComponentForObject<T extends ClassInstance<ComposableObject>>(object: T | null | undefined, viewNameOrSelector?: string | ViewSelector): ComposableObjectComponentType<T> | null;
    private getOrCreateBoundComponent;
    private getOrCreateUnboundComponent;
    private getViewName;
    private getView;
}
export {};
//# sourceMappingURL=view.d.ts.map