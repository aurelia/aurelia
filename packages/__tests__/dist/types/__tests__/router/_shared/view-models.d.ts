import { ICustomElementController, IHydratedController, IHydratedParentController, LifecycleFlags } from '@aurelia/runtime-html';
import { Parameters, IRouteableComponent, LoadInstruction, Navigation, Viewport, RoutingInstruction } from '@aurelia/router';
import { IHookInvocationAggregator } from './hook-invocation-tracker.js';
import { IHookSpec } from './hook-spec.js';
export interface ITestRouteViewModel extends IRouteableComponent {
    readonly $controller: ICustomElementController<this>;
    readonly name: string;
    viewport: Viewport;
    binding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    bound(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    attached(initiator: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    unbinding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    canLoad(params: Parameters, instruction: RoutingInstruction, navigation: Navigation): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
    load(params: Parameters, instruction: RoutingInstruction, navigation: Navigation): void | Promise<void>;
    canUnload(instruction: RoutingInstruction, navigation: Navigation): boolean | Promise<boolean>;
    unload(instruction: RoutingInstruction, navigation: Navigation): void | Promise<void>;
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
    viewport: Viewport;
    get name(): string;
    constructor(hia: IHookInvocationAggregator, specs?: HookSpecs);
    binding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    bound(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    attached(initiator: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    unbinding(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    canLoad(params: Parameters, instruction: RoutingInstruction, navigation: Navigation): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
    load(params: Parameters, instruction: RoutingInstruction, navigation: Navigation): void | Promise<void>;
    canUnload(instruction: RoutingInstruction, navigation: Navigation): boolean | Promise<boolean>;
    unload(instruction: RoutingInstruction, navigation: Navigation): void | Promise<void>;
    protected $binding(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $bound(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $attaching(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $attached(_initiator: IHydratedController, _flags: LifecycleFlags): void | Promise<void>;
    protected $detaching(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $unbinding(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    protected $canLoad(_params: Parameters, _instruction: RoutingInstruction, _navigation: Navigation): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
    protected $load(_params: Parameters, _instruction: RoutingInstruction, _navigation: Navigation): void | Promise<void>;
    protected $canUnload(_instruction: RoutingInstruction, _navigation: Navigation): boolean | Promise<boolean>;
    protected $unload(_instruction: RoutingInstruction, _navigation: Navigation): void | Promise<void>;
    protected $dispose(): void;
}
//# sourceMappingURL=view-models.d.ts.map