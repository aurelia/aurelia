import { CustomElementDefinition } from '../resources/custom-element.js';
import type { Constructable, ConstructableClass } from '@aurelia/kernel';
import type { LifecycleFlags } from '@aurelia/runtime';
import type { ICustomElementViewModel, ISyntheticView, ICustomElementController, ICustomAttributeController } from './controller.js';
import type { IRenderContext } from './render-context.js';
import type { PartialCustomElementDefinition } from '../resources/custom-element.js';
export interface IViewFactory extends ViewFactory {
}
export declare const IViewFactory: import("@aurelia/kernel").InterfaceSymbol<IViewFactory>;
export declare class ViewFactory implements IViewFactory {
    name: string;
    readonly context: IRenderContext;
    static maxCacheSize: number;
    isCaching: boolean;
    private cache;
    private cacheSize;
    constructor(name: string, context: IRenderContext);
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(controller: ISyntheticView): boolean;
    tryReturnToCache(controller: ISyntheticView): boolean;
    create(flags?: LifecycleFlags, parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined): ISyntheticView;
}
export declare const Views: {
    name: string;
    has(value: object): boolean;
    get(value: object | Constructable): readonly CustomElementDefinition[];
    add<T extends Constructable<{}>>(Type: T, partialDefinition: PartialCustomElementDefinition): readonly CustomElementDefinition[];
};
export declare function view(v: PartialCustomElementDefinition): <T extends Constructable<{}>>(target: T) => void;
export declare type ClassInstance<T> = T & {
    readonly constructor: Function;
};
export declare type ViewSelector = (object: ICustomElementViewModel, views: readonly PartialCustomElementDefinition[]) => string;
export declare type ComposableObjectComponentType<T extends ICustomElementViewModel> = ConstructableClass<{
    viewModel: T;
} & ICustomElementViewModel>;
export declare const IViewLocator: import("@aurelia/kernel").InterfaceSymbol<IViewLocator>;
export interface IViewLocator extends ViewLocator {
}
export declare class ViewLocator {
    private readonly modelInstanceToBoundComponent;
    private readonly modelTypeToUnboundComponent;
    getViewComponentForObject<T extends ClassInstance<ICustomElementViewModel>>(object: T | null | undefined, viewNameOrSelector?: string | ViewSelector): ComposableObjectComponentType<T> | null;
    private getOrCreateBoundComponent;
    private getOrCreateUnboundComponent;
    private getViewName;
    private getView;
}
//# sourceMappingURL=view.d.ts.map