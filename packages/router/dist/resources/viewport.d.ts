import { IContainer } from '@aurelia/kernel';
import { INode, LifecycleFlags, ICompiledCustomElementController, ICustomElementViewModel, ICustomElementController, IHydratedController, IHydratedParentController, ISyntheticView } from '@aurelia/runtime';
import { IRouter } from '../router';
import { Viewport } from '../viewport';
export interface IRoutingController extends ICustomElementController<Element> {
    routingContainer?: IContainer;
}
export interface IConnectedCustomElement extends ICustomElementViewModel<Element> {
    element: Element;
    container: IContainer;
    controller: IRoutingController;
}
export declare const ParentViewport: import("@aurelia/runtime/dist/resources/custom-element").InjectableToken<import("@aurelia/kernel").Key>;
export declare class ViewportCustomElement implements ICustomElementViewModel<Element> {
    private readonly router;
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
    readonly $controller: ICustomElementController<Element, this>;
    controller: IRoutingController;
    readonly element: Element;
    private isBound;
    constructor(router: IRouter, element: INode, container: IContainer, parentViewport: ViewportCustomElement);
    afterCompile(controller: ICompiledCustomElementController): unknown;
    beforeBind(initiator: IHydratedController<Element>, parent: IHydratedParentController<Element> | null, flags: LifecycleFlags): void | Promise<void>;
    afterAttach(initiator: IHydratedController<Element>, parent: IHydratedParentController<Element> | null, flags: LifecycleFlags): void | Promise<void>;
    beforeUnbind(initiator: IHydratedController<Element>, parent: ISyntheticView<Element> | ICustomElementController<Element, ICustomElementViewModel<Element>> | null, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void | Promise<void>;
    connect(): void;
    disconnect(): void;
    private getAttribute;
    private getClosestCustomElement;
    private waitForRouterStart;
}
//# sourceMappingURL=viewport.d.ts.map