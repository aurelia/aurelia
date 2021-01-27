import { ICustomElementController, IHydratedController, LifecycleFlags, ICustomElementViewModel, ILifecycleHooks } from '@aurelia/runtime-html';
import { RouteDefinition } from './route-definition.js';
import { RouteNode } from './route-tree.js';
import { IRouteContext } from './route-context.js';
import { Params, NavigationInstruction } from './instructions.js';
import { Transition } from './router.js';
import { Batch } from './util.js';
export interface IRouteViewModel extends ICustomElementViewModel {
    canLoad?(params: Params, next: RouteNode, current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
    load?(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
    canUnload?(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
    unload?(next: RouteNode | null, current: RouteNode): void | Promise<void>;
}
export declare class ComponentAgent<T extends IRouteViewModel = IRouteViewModel> {
    readonly instance: T;
    readonly controller: ICustomElementController<T>;
    readonly definition: RouteDefinition;
    readonly routeNode: RouteNode;
    readonly ctx: IRouteContext;
    private readonly logger;
    readonly canLoadHooks: readonly ILifecycleHooks<IRouteViewModel, 'canLoad'>[];
    readonly loadHooks: readonly ILifecycleHooks<IRouteViewModel, 'load'>[];
    readonly canUnloadHooks: readonly ILifecycleHooks<IRouteViewModel, 'canUnload'>[];
    readonly unloadHooks: readonly ILifecycleHooks<IRouteViewModel, 'unload'>[];
    private readonly hasCanLoad;
    private readonly hasLoad;
    private readonly hasCanUnload;
    private readonly hasUnload;
    constructor(instance: T, controller: ICustomElementController<T>, definition: RouteDefinition, routeNode: RouteNode, ctx: IRouteContext);
    static for<T extends IRouteViewModel>(componentInstance: T, hostController: ICustomElementController, routeNode: RouteNode, ctx: IRouteContext): ComponentAgent<T>;
    activate(initiator: IHydratedController | null, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    deactivate(initiator: IHydratedController | null, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    canUnload(tr: Transition, next: RouteNode | null, b: Batch): void;
    canLoad(tr: Transition, next: RouteNode, b: Batch): void;
    unload(tr: Transition, next: RouteNode | null, b: Batch): void;
    load(tr: Transition, next: RouteNode, b: Batch): void;
    toString(): string;
}
//# sourceMappingURL=component-agent.d.ts.map