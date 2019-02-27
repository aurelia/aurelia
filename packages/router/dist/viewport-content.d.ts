import { ICustomElement, ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export interface IRouteableCustomElementType extends Partial<ICustomElementType> {
    parameters?: string[];
}
export interface IRouteableCustomElement extends ICustomElement {
    canEnter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | string | ViewportInstruction[] | Promise<boolean | string | ViewportInstruction[]>;
    enter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
    canLeave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | Promise<boolean>;
    leave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
}
export declare const enum ContentStatus {
    none = 0,
    created = 1,
    loaded = 2,
    initialized = 3,
    added = 4
}
export declare class ViewportContent {
    content: IRouteableCustomElementType | string;
    parameters: string;
    instruction: INavigationInstruction;
    component: IRouteableCustomElement;
    contentStatus: ContentStatus;
    entered: boolean;
    fromCache: boolean;
    constructor(content?: Partial<ICustomElementType> | string, parameters?: string, instruction?: INavigationInstruction, context?: IRenderContext);
    isChange(other: ViewportContent): boolean;
    isCacheEqual(other: ViewportContent): boolean;
    createComponent(context: IRenderContext): void;
    destroyComponent(): void;
    canEnter(viewport: Viewport, previousInstruction: INavigationInstruction): Promise<boolean | ViewportInstruction[]>;
    canLeave(nextInstruction: INavigationInstruction): Promise<boolean>;
    enter(previousInstruction: INavigationInstruction): Promise<void>;
    leave(nextInstruction: INavigationInstruction): Promise<void>;
    loadComponent(context: IRenderContext, element: Element): Promise<void>;
    unloadComponent(): void;
    initializeComponent(): void;
    terminateComponent(stateful?: boolean): void;
    addComponent(element: Element): void;
    removeComponent(element: Element, stateful?: boolean): void;
    freeContent(element: Element, nextInstruction: INavigationInstruction, stateful?: boolean): Promise<void>;
    componentName(): string;
    componentType(context: IRenderContext): IRouteableCustomElementType;
    componentInstance(context: IRenderContext): IRouteableCustomElement;
}
//# sourceMappingURL=viewport-content.d.ts.map