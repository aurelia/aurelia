import { IModule } from '@aurelia/kernel';
import { ICustomElementViewModel, ICustomElementController, PartialCustomElementDefinition, CustomElementDefinition } from '@aurelia/runtime-html';
import { IRouteViewModel } from './component-agent.js';
import { RouteType } from './route.js';
import { IRouteContext } from './route-context.js';
import { INavigationOptions, NavigationOptions } from './router.js';
export declare type RouteContextLike = IRouteContext | ICustomElementViewModel | ICustomElementController | HTMLElement;
/**
 * Either a `RouteableComponent`, a string (name) that can be resolved to one or a ViewportInstruction:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IViewportInstruction`: a viewport instruction object.
 * - `RouteableComponent`: see `RouteableComponent`.
 *
 * NOTE: differs from `Routeable` only in having `IViewportIntruction` instead of `IChildRouteConfig`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 */
export declare type NavigationInstruction = string | IViewportInstruction | RouteableComponent;
/**
 * A component type, instance of definition that can be navigated to:
 * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
 * - `Promise<IModule>`: a lazy loaded module, e.g. the return value of a dynamic import expression pointing to a file with a routeable component as the default export or the first named export.
 * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
 * - `IRouteViewModel`: an existing component instance.
 */
export declare type RouteableComponent = RouteType | Promise<IModule> | PartialCustomElementDefinition | IRouteViewModel;
export declare type Params = {
    [key: string]: string | undefined;
};
export declare const IViewportInstruction: import("@aurelia/kernel").InterfaceSymbol<IViewportInstruction>;
export interface IViewportInstruction {
    readonly context?: RouteContextLike | null;
    readonly append?: boolean;
    /**
     * The component to load.
     *
     * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
     * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
     * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
     * - `IRouteViewModel`: an existing component instance.
     */
    readonly component: string | RouteableComponent;
    /**
     * The name of the viewport this component should be loaded into.
     */
    readonly viewport?: string | null;
    /**
     * The parameters to pass into the component.
     */
    readonly params?: Params | null;
    /**
     * The child routes to load underneath the context of this instruction's component.
     */
    readonly children?: readonly NavigationInstruction[];
}
export declare class ViewportInstruction<TComponent extends ITypedNavigationInstruction_T = ITypedNavigationInstruction_Component> implements IViewportInstruction {
    readonly context: RouteContextLike | null;
    append: boolean;
    readonly component: TComponent;
    readonly viewport: string | null;
    readonly params: Params | null;
    readonly children: ViewportInstruction[];
    private constructor();
    static create(instruction: NavigationInstruction, context?: RouteContextLike | null): ViewportInstruction;
    contains(other: ViewportInstruction): boolean;
    equals(other: ViewportInstruction): boolean;
    clone(): this;
    toUrlComponent(recursive?: boolean): string;
    toString(): string;
}
export interface IRedirectInstruction {
    readonly path: string;
    readonly redirectTo: string;
}
export declare class RedirectInstruction implements IRedirectInstruction {
    readonly path: string;
    readonly redirectTo: string;
    private constructor();
    static create(instruction: IRedirectInstruction): RedirectInstruction;
    equals(other: RedirectInstruction): boolean;
    toUrlComponent(): string;
    toString(): string;
}
export declare class ViewportInstructionTree {
    readonly options: NavigationOptions;
    readonly isAbsolute: boolean;
    readonly children: ViewportInstruction[];
    readonly queryParams: Params;
    readonly fragment: string | null;
    constructor(options: NavigationOptions, isAbsolute: boolean, children: ViewportInstruction[], queryParams: Params, fragment: string | null);
    static create(instructionOrInstructions: NavigationInstruction | NavigationInstruction[], options?: INavigationOptions): ViewportInstructionTree;
    equals(other: ViewportInstructionTree): boolean;
    toUrl(): string;
    toString(): string;
}
export declare const enum NavigationInstructionType {
    string = 0,
    ViewportInstruction = 1,
    CustomElementDefinition = 2,
    Promise = 3,
    IRouteViewModel = 4
}
export interface ITypedNavigationInstruction<TInstruction extends NavigationInstruction, TType extends NavigationInstructionType> {
    readonly type: TType;
    readonly value: TInstruction;
    equals(other: ITypedNavigationInstruction_T): boolean;
    toUrlComponent(): string;
    clone(): this;
}
export interface ITypedNavigationInstruction_string extends ITypedNavigationInstruction<string, NavigationInstructionType.string> {
}
export interface ITypedNavigationInstruction_ViewportInstruction extends ITypedNavigationInstruction<ViewportInstruction, NavigationInstructionType.ViewportInstruction> {
}
export interface ITypedNavigationInstruction_CustomElementDefinition extends ITypedNavigationInstruction<CustomElementDefinition, NavigationInstructionType.CustomElementDefinition> {
}
export interface ITypedNavigationInstruction_Promise extends ITypedNavigationInstruction<Promise<IModule>, NavigationInstructionType.Promise> {
}
export interface ITypedNavigationInstruction_IRouteViewModel extends ITypedNavigationInstruction<IRouteViewModel, NavigationInstructionType.IRouteViewModel> {
}
export declare type ITypedNavigationInstruction_T = (ITypedNavigationInstruction_Component | ITypedNavigationInstruction_ViewportInstruction);
export declare type ITypedNavigationInstruction_Component = (ITypedNavigationInstruction_ResolvedComponent | ITypedNavigationInstruction_Promise);
export declare type ITypedNavigationInstruction_ResolvedComponent = (ITypedNavigationInstruction_string | ITypedNavigationInstruction_CustomElementDefinition | ITypedNavigationInstruction_IRouteViewModel);
export declare class TypedNavigationInstruction<TInstruction extends NavigationInstruction, TType extends NavigationInstructionType> implements ITypedNavigationInstruction<TInstruction, TType> {
    readonly type: TType;
    readonly value: TInstruction;
    private constructor();
    static create(instruction: string): ITypedNavigationInstruction_string;
    static create(instruction: IViewportInstruction): ITypedNavigationInstruction_ViewportInstruction;
    static create(instruction: RouteType | PartialCustomElementDefinition): ITypedNavigationInstruction_CustomElementDefinition;
    static create(instruction: Promise<IModule>): ITypedNavigationInstruction_Promise;
    static create(instruction: IRouteViewModel): ITypedNavigationInstruction_IRouteViewModel;
    static create(instruction: Exclude<NavigationInstruction, IViewportInstruction>): Exclude<ITypedNavigationInstruction_T, ITypedNavigationInstruction_ViewportInstruction>;
    static create(instruction: NavigationInstruction): ITypedNavigationInstruction_T;
    equals(this: ITypedNavigationInstruction_T, other: ITypedNavigationInstruction_T): boolean;
    clone(): this;
    toUrlComponent(this: ITypedNavigationInstruction_T): string;
    toString(this: ITypedNavigationInstruction_T): string;
}
//# sourceMappingURL=instructions.d.ts.map