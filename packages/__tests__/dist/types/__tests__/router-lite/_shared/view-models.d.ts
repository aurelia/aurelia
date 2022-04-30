import { ICustomElementController, IHydratedController, IHydratedParentController, LifecycleFlags } from '@aurelia/runtime-html';
import { Params, RouteNode, NavigationInstruction, IRouteViewModel } from '@aurelia/router-lite';
import { IHookInvocationAggregator } from './hook-invocation-tracker.js';
import { IHookSpec } from './hook-spec.js';
export interface ITestRouteViewModel extends IRouteViewModel {
    readonly $controller: ICustomElementController<this>;
    readonly name: string;
    binding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    bound(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    attached(initiator: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    unbinding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    canLoad(params: Params, next: RouteNode, current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
    load(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
    canUnload(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
    unload(next: RouteNode | null, current: RouteNode): void | Promise<void>;
}
export declare class HookSpecs {
    readonly binding: IHookSpec<'binding'>;
    readonly bound: IHookSpec<'bound'>;
    readonly attaching: IHookSpec<'attaching'>;
    readonly attached: IHookSpec<'attached'>;
    readonly detaching: IHookSpec<'detaching'>;
    readonly unbinding: IHookSpec<'unbinding'>;
    readonly $dispose: IHookSpec<'dispose'>;
    readonly canLoad: IHookSpec<'canLoad'>;
    readonly load: IHookSpec<'load'>;
    readonly canUnload: IHookSpec<'canUnload'>;
    readonly unload: IHookSpec<'unload'>;
    static get DEFAULT(): HookSpecs;
    private constructor();
    static create(input: Partial<HookSpecs>): HookSpecs;
    dispose(): void;
    toString(exclude?: string): string;
}
export declare abstract class TestRouteViewModelBase implements ITestRouteViewModel {
    readonly hia: IHookInvocationAggregator;
    readonly specs: HookSpecs;
    readonly $controller: ICustomElementController<this>;
    get name(): string;
    constructor(hia: IHookInvocationAggregator, specs?: HookSpecs);
    binding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    bound(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    attached(initiator: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    unbinding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    canLoad(params: Params, next: RouteNode, current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
    load(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
    canUnload(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
    unload(next: RouteNode | null, current: RouteNode): void | Promise<void>;
    protected $binding(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $bound(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $attaching(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $attached(_initiator: IHydratedController, _flags: LifecycleFlags): void | Promise<void>;
    protected $detaching(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $unbinding(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $canLoad(_params: Params, _next: RouteNode, _current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
    protected $load(_params: Params, _next: RouteNode, _current: RouteNode | null): void | Promise<void>;
    protected $canUnload(_next: RouteNode | null, _current: RouteNode): boolean | Promise<boolean>;
    protected $unload(_next: RouteNode | null, _current: RouteNode): void | Promise<void>;
    protected $dispose(): void;
}
//# sourceMappingURL=view-models.d.ts.map