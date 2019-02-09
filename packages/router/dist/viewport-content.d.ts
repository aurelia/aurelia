import { ICustomElement, ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { IComponentViewportParameters } from './router';
export interface IRouteableCustomElementType extends ICustomElementType {
    parameters?: string[];
}
export interface IRouteableCustomElement extends ICustomElement {
    canEnter?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | string | IComponentViewportParameters[] | Promise<boolean | string | IComponentViewportParameters[]>;
    enter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
    canLeave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | Promise<boolean>;
    leave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
}
export declare const enum ContentStatus {
    none = 0,
    loaded = 1,
    initialized = 2,
    entered = 3,
    added = 4
}
export declare class ViewportContent {
    content: IRouteableCustomElementType | string;
    parameters: string;
    instruction: INavigationInstruction;
    component: IRouteableCustomElement;
    contentStatus: ContentStatus;
    fromCache: boolean;
    constructor(content?: ICustomElementType | string, parameters?: string, instruction?: INavigationInstruction, context?: IRenderContext);
    isChange(other: ViewportContent): boolean;
    isCacheEqual(other: ViewportContent): boolean;
    loadComponent(context: IRenderContext, element: Element): Promise<void>;
    unloadComponent(): void;
    initializeComponent(): void;
    terminateComponent(stateful?: boolean): void;
    addComponent(element: Element): void;
    removeComponent(element: Element, stateful?: boolean): void;
    freeContent(element: Element, stateful?: boolean): Promise<void>;
    componentName(): string;
    componentType(context: IRenderContext): IRouteableCustomElementType;
    componentInstance(context: IRenderContext): IRouteableCustomElement;
}
//# sourceMappingURL=viewport-content.d.ts.map