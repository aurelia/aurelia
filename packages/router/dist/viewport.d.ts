import { ICustomElement, ICustomElementType } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { Router } from './router';
import { Scope } from './scope';
import { IViewportOptions } from './viewport';
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
    private router;
    name: string;
    element: Element;
    owningScope: Scope;
    scope: Scope;
    options?: IViewportOptions;
    content: ICustomElementType;
    nextContent: ICustomElementType;
    instruction: INavigationInstruction;
    nextInstruction: INavigationInstruction;
    component: IRouteableCustomElement;
    nextComponent: IRouteableCustomElement;
    private clear;
    constructor(router: Router, name: string, element: Element, owningScope: Scope, scope: Scope, options?: IViewportOptions);
    setNextContent(content: ICustomElementType | string, instruction: INavigationInstruction): boolean;
    canLeave(): Promise<boolean>;
    canEnter(): Promise<boolean>;
    loadContent(guard?: number): Promise<boolean>;
    description(full?: boolean): string;
    scopedDescription(full?: boolean): string;
    wantComponent(component: ICustomElementType | string): boolean;
    acceptComponent(component: ICustomElementType | string): boolean;
    private loadComponent;
    private waitForElement;
    private wait;
}
//# sourceMappingURL=viewport.d.ts.map