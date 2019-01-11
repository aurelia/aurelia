import { ICustomElement, ICustomElementType, LifecycleFlags } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { Router } from './router';
import { Scope } from './scope';
import { IRouteableCustomElement, IViewportOptions } from './viewport';
export interface IRouteableCustomElementType extends ICustomElementType {
    parameters?: string[];
}
export interface IRouteableCustomElement extends ICustomElement {
    canEnter?: Function;
    enter?: Function;
    canLeave?: Function;
    leave?: Function;
}
export interface IViewportOptions {
    scope?: boolean;
    usedBy?: string | string[];
    forceDescription?: boolean;
}
export declare class Viewport {
    name: string;
    element: Element;
    owningScope: Scope;
    scope: Scope;
    options?: IViewportOptions;
    content: IRouteableCustomElementType;
    nextContent: IRouteableCustomElementType;
    parameters: string;
    nextParameters: string;
    instruction: INavigationInstruction;
    nextInstruction: INavigationInstruction;
    component: IRouteableCustomElement;
    nextComponent: IRouteableCustomElement;
    private readonly router;
    private clear;
    private elementResolve;
    constructor(router: Router, name: string, element: Element, owningScope: Scope, scope: Scope, options?: IViewportOptions);
    setNextContent(content: ICustomElementType | string, instruction: INavigationInstruction): boolean;
    setElement(element: Element, options: IViewportOptions): void;
    canLeave(): Promise<boolean>;
    canEnter(): Promise<boolean>;
    loadContent(): Promise<boolean>;
    description(full?: boolean): string;
    scopedDescription(full?: boolean): string;
    wantComponent(component: ICustomElementType | string): boolean;
    acceptComponent(component: ICustomElementType | string): boolean;
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    private loadComponent;
    private addComponent;
    private removeComponent;
    private waitForElement;
}
//# sourceMappingURL=viewport.d.ts.map