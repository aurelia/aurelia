import { ICustomElement, ICustomElementType, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { Router } from './router';
import { Scope } from './scope';
import { IRouteableCustomElement, IViewportOptions } from './viewport';
export interface IRouteableCustomElementType extends ICustomElementType {
    parameters?: string[];
}
export interface IRouteableCustomElement extends ICustomElement {
    canEnter?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | Promise<boolean>;
    enter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
    canLeave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | Promise<boolean>;
    leave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
}
export interface IViewportOptions {
    scope?: boolean;
    usedBy?: string | string[];
    default?: string;
    noLink?: boolean;
    noHistory?: boolean;
    forceDescription?: boolean;
}
export declare class Viewport {
    name: string;
    element: Element;
    context: IRenderContext;
    owningScope: Scope;
    scope: Scope;
    options?: IViewportOptions;
    content: IRouteableCustomElementType;
    nextContent: IRouteableCustomElementType | string;
    parameters: string;
    nextParameters: string;
    instruction: INavigationInstruction;
    nextInstruction: INavigationInstruction;
    component: IRouteableCustomElement;
    nextComponent: IRouteableCustomElement;
    private readonly router;
    private clear;
    private elementResolve?;
    private previousViewportState?;
    private entered;
    constructor(router: Router, name: string, element: Element, context: IRenderContext, owningScope: Scope, scope: Scope, options?: IViewportOptions);
    setNextContent(content: ICustomElementType | string, instruction: INavigationInstruction): boolean;
    setElement(element: Element, context: IRenderContext, options: IViewportOptions): void;
    remove(element: Element, context: IRenderContext): boolean;
    canLeave(): Promise<boolean>;
    canEnter(): Promise<boolean>;
    enter(): Promise<boolean>;
    loadContent(): Promise<boolean>;
    finalizeContentChange(): void;
    restorePreviousContent(): Promise<void>;
    description(full?: boolean): string;
    scopedDescription(full?: boolean): string;
    wantComponent(component: ICustomElementType | string): boolean;
    acceptComponent(component: ICustomElementType | string): boolean;
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    componentName(component: IRouteableCustomElementType | string): string;
    componentType(component: IRouteableCustomElementType | string): IRouteableCustomElementType;
    componentInstance(component: IRouteableCustomElementType | string): IRouteableCustomElement;
    private clearState;
    private loadComponent;
    private unloadComponent;
    private initializeComponent;
    private terminateComponent;
    private addComponent;
    private removeComponent;
    private waitForElement;
}
//# sourceMappingURL=viewport.d.ts.map