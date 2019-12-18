import { IContainer } from '@aurelia/kernel';
import { INavigatorInstruction, IRouteableComponent, RouteableComponentType, ReentryBehavior } from './interfaces';
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
    content: ViewportInstruction;
    instruction: INavigatorInstruction;
    contentStatus: ContentStatus;
    entered: boolean;
    fromCache: boolean;
    fromHistory: boolean;
    reentry: boolean;
    private taggedNodes;
    constructor(content?: ViewportInstruction, instruction?: INavigatorInstruction, context?: IContainer | null);
    get componentInstance(): IRouteableComponent | null;
    equalComponent(other: ViewportContent): boolean;
    equalParameters(other: ViewportContent): boolean;
    reentryBehavior(): ReentryBehavior;
    isCacheEqual(other: ViewportContent): boolean;
    createComponent(context: IContainer): void;
    destroyComponent(): void;
    canEnter(viewport: Viewport, previousInstruction: INavigatorInstruction): Promise<boolean | ViewportInstruction[]>;
    canLeave(nextInstruction: INavigatorInstruction | null): Promise<boolean>;
    enter(previousInstruction: INavigatorInstruction): Promise<void>;
    leave(nextInstruction: INavigatorInstruction | null): Promise<void>;
    loadComponent(context: IContainer, element: Element, viewport: Viewport): Promise<void>;
    unloadComponent(cache: ViewportContent[], stateful?: boolean): void;
    clearTaggedNodes(): void;
    initializeComponent(): void;
    terminateComponent(stateful?: boolean): Promise<void>;
    addComponent(element: Element): void;
    removeComponent(element: Element | null, stateful?: boolean): void;
    freeContent(element: Element | null, nextInstruction: INavigatorInstruction | null, cache: ViewportContent[], stateful?: boolean): Promise<void>;
    toComponentName(): string | null;
    toComponentType(context: IContainer): RouteableComponentType | null;
    toComponentInstance(context: IContainer): IRouteableComponent | null;
}
//# sourceMappingURL=viewport-content.d.ts.map