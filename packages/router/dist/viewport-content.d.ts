import { IContainer } from '@aurelia/kernel';
import { IController } from '@aurelia/runtime';
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
    constructor(content?: ViewportInstruction, instruction?: INavigatorInstruction, container?: IContainer | null);
    get componentInstance(): IRouteableComponent | null;
    get viewport(): Viewport | null;
    equalComponent(other: ViewportContent): boolean;
    equalParameters(other: ViewportContent): boolean;
    reentryBehavior(): ReentryBehavior;
    isCacheEqual(other: ViewportContent): boolean;
    createComponent(container: IContainer, fallback?: string): void;
    destroyComponent(): void;
    canEnter(viewport: Viewport, previousInstruction: INavigatorInstruction): Promise<boolean | ViewportInstruction[]>;
    canLeave(nextInstruction: INavigatorInstruction | null): Promise<boolean>;
    enter(previousInstruction: INavigatorInstruction): Promise<void>;
    leave(nextInstruction: INavigatorInstruction | null): Promise<void>;
    loadComponent(container: IContainer, element: Element, viewport: Viewport): Promise<void>;
    unloadComponent(cache: ViewportContent[], stateful?: boolean): void;
    initializeComponent(parent: IController): void;
    terminateComponent(stateful?: boolean): Promise<void>;
    addComponent(element: Element): void;
    removeComponent(element: Element | null, stateful?: boolean): void;
    freeContent(element: Element | null, nextInstruction: INavigatorInstruction | null, cache: ViewportContent[], stateful?: boolean): Promise<void>;
    toComponentName(): string | null;
    toComponentType(container: IContainer): RouteableComponentType | null;
    toComponentInstance(container: IContainer): IRouteableComponent | null;
}
//# sourceMappingURL=viewport-content.d.ts.map