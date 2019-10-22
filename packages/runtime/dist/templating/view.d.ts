import { Constructable, ConstructableClass, IContainer, IResolver } from '@aurelia/kernel';
import { INode } from '../dom';
import { LifecycleFlags } from '../flags';
import { IController, ILifecycle, IViewFactory, IViewModel } from '../lifecycle';
import { ITemplate } from '../rendering-engine';
import { PartialCustomElementDefinition, CustomElementDefinition } from '../resources/custom-element';
import { PartialCustomElementDefinitionParts } from '../definitions';
export declare class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
    static maxCacheSize: number;
    readonly parentContextId: number;
    isCaching: boolean;
    name: string;
    parts: PartialCustomElementDefinitionParts;
    private cache;
    private cacheSize;
    private readonly lifecycle;
    private readonly template;
    constructor(name: string, template: ITemplate<T>, lifecycle: ILifecycle);
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(controller: IController<T>): boolean;
    tryReturnToCache(controller: IController<T>): boolean;
    create(flags?: LifecycleFlags): IController<T>;
    addParts(parts: PartialCustomElementDefinitionParts): void;
}
export declare const Views: {
    name: string;
    has(value: object): boolean;
    get(value: object | Constructable<{}>): readonly CustomElementDefinition<Constructable<{}>>[];
    add<T extends Constructable<{}>>(Type: T, partialDefinition: import("@aurelia/kernel").PartialResourceDefinition<{
        readonly cache?: number | "*" | undefined;
        readonly template?: unknown;
        readonly instructions?: readonly (readonly import("../definitions").ITargetedInstruction[])[] | undefined;
        readonly dependencies?: readonly import("@aurelia/kernel").Key[] | undefined;
        readonly needsCompile?: boolean | undefined;
        readonly surrogates?: readonly import("../definitions").ITargetedInstruction[] | undefined;
        readonly bindables?: readonly string[] | Record<string, import("./bindable").PartialBindableDefinition> | undefined;
        readonly childrenObservers?: Record<string, import("./children").PartialChildrenDefinition<INode>> | undefined;
        readonly containerless?: boolean | undefined;
        readonly isStrictBinding?: boolean | undefined;
        readonly shadowOptions?: {
            mode: "open" | "closed";
        } | null | undefined;
        readonly hasSlots?: boolean | undefined;
        readonly strategy?: import("../flags").BindingStrategy | undefined;
        readonly hooks?: Readonly<import("../definitions").HooksDefinition> | undefined;
        readonly scopeParts?: readonly string[] | undefined;
    }>): readonly CustomElementDefinition<Constructable<{}>>[];
};
export declare function view(v: PartialCustomElementDefinition): <T extends Constructable<{}>>(target: T) => void;
export declare const IViewLocator: import("@aurelia/kernel").InterfaceSymbol<IViewLocator>;
export interface IViewLocator {
    getViewComponentForObject<T extends ClassInstance<ComposableObject>>(object: T | null | undefined, viewNameOrSelector?: string | ViewSelector): ComposableObjectComponentType<T> | null;
}
export declare type ClassInstance<T> = T & {
    readonly constructor: Function;
};
export declare type ComposableObject = Omit<IViewModel, '$controller'>;
export declare type ViewSelector = (object: ComposableObject, views: readonly PartialCustomElementDefinition[]) => string;
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
//# sourceMappingURL=view.d.ts.map