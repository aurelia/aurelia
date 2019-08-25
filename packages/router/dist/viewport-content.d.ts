import { IContainer } from '@aurelia/kernel';
import { IRenderContext } from '@aurelia/runtime';
import { ComponentAppellation, INavigatorInstruction, IRouteableComponent, IRouteableComponentType, ReentryBehavior } from './interfaces';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare const enum ContentStatus {
    none = 0,
    created = 1,
    loaded = 2,
    initialized = 3,
    added = 4
}
export declare class ViewportContent {
    content: ComponentAppellation | null;
    parameters: string;
    instruction: INavigatorInstruction;
    componentInstance: IRouteableComponent | null;
    contentStatus: ContentStatus;
    entered: boolean;
    fromCache: boolean;
    reentry: boolean;
    constructor(content?: ComponentAppellation | null, parameters?: string, instruction?: INavigatorInstruction, context?: IRenderContext | IContainer | null);
    equalComponent(other: ViewportContent): boolean;
    equalParameters(other: ViewportContent): boolean;
    reentryBehavior(): ReentryBehavior;
    isCacheEqual(other: ViewportContent): boolean;
    createComponent(context: IRenderContext | IContainer): void;
    destroyComponent(): void;
    canEnter(viewport: Viewport, previousInstruction: INavigatorInstruction): Promise<boolean | ViewportInstruction[]>;
    canLeave(nextInstruction: INavigatorInstruction | null): Promise<boolean>;
    enter(previousInstruction: INavigatorInstruction): Promise<void>;
    leave(nextInstruction: INavigatorInstruction | null): Promise<void>;
    loadComponent(context: IRenderContext | IContainer, element: Element): Promise<void>;
    unloadComponent(): void;
    initializeComponent(): void;
    terminateComponent(stateful?: boolean): void;
    addComponent(element: Element): void;
    removeComponent(element: Element, stateful?: boolean): void;
    freeContent(element: Element, nextInstruction: INavigatorInstruction | null, stateful?: boolean): Promise<void>;
    toComponentName(): string | null;
    toComponentType(context: IRenderContext | IContainer): IRouteableComponentType | null;
    toComponentInstance(context: IRenderContext | IContainer): IRouteableComponent | null;
}
//# sourceMappingURL=viewport-content.d.ts.map