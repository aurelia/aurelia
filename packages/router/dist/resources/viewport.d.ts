import { IContainer } from '@aurelia/kernel';
import { INode, LifecycleFlags, ICompiledCustomElementController, ICustomElementViewModel, ICustomElementController, IHydratedController, IHydratedParentController, ISyntheticView } from '@aurelia/runtime-html';
import { IRouter } from '../router.js';
import { Viewport } from '../viewport.js';
export interface IRoutingController extends ICustomElementController {
    routingContainer?: IContainer;
}
export interface IConnectedCustomElement extends ICustomElementViewModel {
    element: HTMLElement;
    container: IContainer;
    controller: IRoutingController;
}
export declare const ParentViewport: import("@aurelia/runtime-html/dist/resources/custom-element").InjectableToken<any>;
export declare class ViewportCustomElement implements ICustomElementViewModel {
    private readonly router;
    readonly element: INode<HTMLElement>;
    container: IContainer;
    readonly parentViewport: ViewportCustomElement;
    name: string;
    usedBy: string;
    default: string;
    fallback: string;
    noScope: boolean;
    noLink: boolean;
    noTitle: boolean;
    noHistory: boolean;
    stateful: boolean;
    viewport: Viewport | null;
    readonly $controller: ICustomElementController<this>;
    controller: IRoutingController;
    private isBound;
    constructor(router: IRouter, element: INode<HTMLElement>, container: IContainer, parentViewport: ViewportCustomElement);
    hydrated(controller: ICompiledCustomElementController): unknown;
    binding(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void>;
    attaching(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void>;
    unbinding(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void | Promise<void>;
    connect(): void;
    disconnect(): void;
    private getAttribute;
    private getClosestCustomElement;
    private waitForRouterStart;
}
//# sourceMappingURL=viewport.d.ts.map