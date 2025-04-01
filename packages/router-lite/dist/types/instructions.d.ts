import { IModule } from '@aurelia/kernel';
import { ICustomElementViewModel, ICustomElementController, PartialCustomElementDefinition, CustomElementDefinition } from '@aurelia/runtime-html';
import { IRouteViewModel } from './component-agent';
import { RouteType } from './route';
import { type $RecognizedRoute, IRouteContext } from './route-context';
import { INavigationOptions, NavigationOptions, type RouterOptions } from './options';
import { IUrlParser } from './url-parser';
import { RouteNode } from './route-tree';
import { RecognizedRoute } from '@aurelia/route-recognizer';
export declare const defaultViewportName = "default";
export type RouteContextLike = IRouteContext | ICustomElementViewModel | ICustomElementController | HTMLElement;
/**
 * Either a `RouteableComponent`, a string (name) that can be resolved to one or a ViewportInstruction:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IViewportInstruction`: a viewport instruction object.
 * - `RouteableComponent`: see `RouteableComponent`.
 *
 * NOTE: differs from `Routeable` only in having `IViewportInstruction` instead of `IChildRouteConfig`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 */
export type NavigationInstruction = string | IViewportInstruction | RouteableComponent | NavigationStrategy;
/**
 * A component type, instance of definition that can be navigated to:
 * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
 * - `Promise<IModule>`: a lazy loaded module, e.g. the return value of a dynamic import expression pointing to a file with a routeable component as the default export or the first named export.
 * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
 * - `IRouteViewModel`: an existing component instance.
 */
export type RouteableComponent = RouteType | (() => RouteType) | Promise<IModule> | CustomElementDefinition | IRouteViewModel;
export type Params = {
    [key: string]: string | undefined;
};
export type IExtendedViewportInstruction = IViewportInstruction & {
    readonly open?: number;
    readonly close?: number;
};
export interface IViewportInstruction {
    /**
     * The component to load.
     *
     * - `string`: A string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally).
     * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
     * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
     * - `IRouteViewModel`: an existing component instance.
     *
     */
    readonly component: string | RouteableComponent;
    /**
     * The name of the viewport this component should be loaded into.
     */
    readonly viewport?: string | null;
    /**
     * The parameters to pass into the component.
     *
     * Note that this is only important till a {@link $RecognizedRoute | recognized route} is created from the `component`.
     * After the recognized route is created, the 'recognized' parameters are included in that, and that's what is used when invoking the hook functions.
     * Thus, when creating a viewport-instruction directly with a recognized route, the parameters can be ignored.
     */
    readonly params?: Params | null;
    /**
     * The child routes to load underneath the context of this instruction's component.
     */
    readonly children?: readonly NavigationInstruction[];
    /**
     * Normally, when the recognized route is null, in the process of creating a route node, it will be attempted to recognize a configured route for the given `component`.
     * Therefore, when a recognized route is provided when creating the `ViewportInstruction`, the process of recognizing the `component` can be completely skipped.
     */
    readonly recognizedRoute: $RecognizedRoute | null;
}
export declare class ViewportInstruction<TComponent extends ITypedNavigationInstruction_T = ITypedNavigationInstruction_Component> implements IExtendedViewportInstruction {
    readonly open: number;
    readonly close: number;
    readonly recognizedRoute: $RecognizedRoute | null;
    readonly component: TComponent;
    readonly viewport: string | null;
    readonly params: Readonly<Params> | null;
    readonly children: ViewportInstruction[];
    private constructor();
    static create(instruction: NavigationInstruction | IExtendedViewportInstruction): ViewportInstruction;
    contains(other: ViewportInstruction): boolean;
    equals(other: ViewportInstruction): boolean;
    toUrlComponent(recursive?: boolean): string;
    toString(): string;
}
export declare class ViewportInstructionTree {
    readonly options: NavigationOptions;
    readonly isAbsolute: boolean;
    readonly children: ViewportInstruction[];
    readonly queryParams: Readonly<URLSearchParams>;
    readonly fragment: string | null;
    constructor(options: NavigationOptions, isAbsolute: boolean, children: ViewportInstruction[], queryParams: Readonly<URLSearchParams>, fragment: string | null);
    static create(instructionOrInstructions: NavigationInstruction | NavigationInstruction[], routerOptions: RouterOptions, options?: INavigationOptions | NavigationOptions, rootCtx?: IRouteContext | null): ViewportInstructionTree;
    equals(other: ViewportInstructionTree): boolean;
    toUrl(isFinalInstruction: boolean, parser: IUrlParser): string;
    toPath(): string;
    toString(): string;
}
type NavigationStrategyComponent = string | RouteType | Promise<IModule> | CustomElementDefinition;
export declare class NavigationStrategy {
    constructor(
    /** @internal */ getComponent: (viewportInstruction: IViewportInstruction, ctx: IRouteContext, node: RouteNode, route: RecognizedRoute<unknown>) => NavigationStrategyComponent);
}
export interface ITypedNavigationInstruction<TInstruction extends NavigationInstruction, TType extends NavigationInstructionType> {
    readonly type: TType;
    readonly value: TInstruction;
    equals(other: ITypedNavigationInstruction_T): boolean;
    toUrlComponent(): string;
    _clone(): this;
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
export interface ITypedNavigationInstruction_NavigationStrategy extends ITypedNavigationInstruction<NavigationStrategy, NavigationInstructionType.NavigationStrategy> {
}
export type ITypedNavigationInstruction_T = (ITypedNavigationInstruction_Component | ITypedNavigationInstruction_ViewportInstruction | ITypedNavigationInstruction_NavigationStrategy);
export type ITypedNavigationInstruction_Component = (ITypedNavigationInstruction_ResolvedComponent | ITypedNavigationInstruction_Promise);
export type ITypedNavigationInstruction_ResolvedComponent = (ITypedNavigationInstruction_string | ITypedNavigationInstruction_CustomElementDefinition | ITypedNavigationInstruction_IRouteViewModel);
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
    toUrlComponent(this: ITypedNavigationInstruction_T): string;
    toString(this: ITypedNavigationInstruction_T): string;
}
export {};
//# sourceMappingURL=instructions.d.ts.map