import { CustomElementType } from '@aurelia/runtime';
import { ComponentAppellation, INavigatorInstruction, IRoute } from './interfaces';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';
import { IScopeOwner, IScopeOwnerOptions, Scope } from './scope';
export interface IViewportScopeOptions extends IScopeOwnerOptions {
    catches?: string | string[];
    collection?: boolean;
    source?: unknown[] | null;
}
export declare class ViewportScope implements IScopeOwner {
    name: string;
    readonly router: IRouter;
    element: Element | null;
    rootComponentType: CustomElementType | null;
    options: IViewportScopeOptions;
    connectedScope: Scope;
    path: string | null;
    content: ViewportInstruction | null;
    nextContent: ViewportInstruction | null;
    available: boolean;
    sourceItem: unknown | null;
    sourceItemIndex: number;
    private remove;
    private add;
    constructor(name: string, router: IRouter, element: Element | null, owningScope: Scope | null, scope: boolean, rootComponentType?: CustomElementType | null, // temporary. Metadata will probably eliminate it
    options?: IViewportScopeOptions);
    get scope(): Scope;
    get owningScope(): Scope;
    get enabled(): boolean;
    set enabled(enabled: boolean);
    get isViewport(): boolean;
    get isViewportScope(): boolean;
    get isEmpty(): boolean;
    get passThroughScope(): boolean;
    get siblings(): ViewportScope[];
    get source(): unknown[] | null;
    get catches(): string[];
    get default(): string | undefined;
    setNextContent(content: ComponentAppellation | ViewportInstruction, instruction: INavigatorInstruction): boolean;
    canLeave(): Promise<boolean>;
    canEnter(): Promise<boolean | ViewportInstruction[]>;
    enter(): Promise<boolean>;
    loadContent(): Promise<boolean>;
    finalizeContentChange(): void;
    abortContentChange(): Promise<void>;
    acceptSegment(segment: string): boolean;
    beforeBind(): void;
    beforeUnbind(): void;
    getAvailableSourceItem(): unknown | null;
    addSourceItem(): unknown;
    removeSourceItem(): void;
    getRoutes(): IRoute[] | null;
}
//# sourceMappingURL=viewport-scope.d.ts.map