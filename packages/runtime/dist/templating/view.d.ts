import { Constructable, ConstructableClass } from '@aurelia/kernel';
import { INode } from '../dom';
import { LifecycleFlags } from '../flags';
import { ILifecycle, IViewFactory, ICustomElementViewModel, ISyntheticView, ICustomElementController, ICustomAttributeController } from '../lifecycle';
import { Scope } from '../observation/binding-context';
import { PartialCustomElementDefinition, CustomElementDefinition } from '../resources/custom-element';
import { IRenderContext } from './render-context';
import { AuSlotContentType } from '../resources/custom-elements/au-slot';
export declare class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
    name: string;
    readonly context: IRenderContext<T>;
    private readonly lifecycle;
    readonly contentType: AuSlotContentType | undefined;
    readonly projectionScope: Scope | null;
    static maxCacheSize: number;
    isCaching: boolean;
    private cache;
    private cacheSize;
    constructor(name: string, context: IRenderContext<T>, lifecycle: ILifecycle, contentType: AuSlotContentType | undefined, projectionScope?: Scope | null);
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(controller: ISyntheticView<T>): boolean;
    tryReturnToCache(controller: ISyntheticView<T>): boolean;
    create(flags?: LifecycleFlags, parentController?: ISyntheticView<T> | ICustomElementController<T> | ICustomAttributeController<T> | undefined): ISyntheticView<T>;
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