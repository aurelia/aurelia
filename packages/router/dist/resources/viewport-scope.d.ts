import { INode, LifecycleFlags, ICompiledCustomElementController, ICustomElementViewModel, ICustomElementController, IHydratedController, ISyntheticView } from '@aurelia/runtime-html';
import { IContainer } from '@aurelia/kernel';
import { IRouter } from '../router.js';
import { ViewportScope } from '../viewport-scope.js';
import { IRoutingController } from './viewport.js';
export declare const ParentViewportScope: import("@aurelia/runtime-html/dist/resources/custom-element").InjectableToken<any>;
export declare class ViewportScopeCustomElement implements ICustomElementViewModel {
    private readonly router;
    readonly element: INode<HTMLElement>;
    container: IContainer;
    private readonly parent;
    private readonly parentController;
    name: string;
    catches: string;
    collection: boolean;
    source: unknown[] | null;
    viewportScope: ViewportScope | null;
    readonly $controller: ICustomElementController<this>;
    controller: IRoutingController;
    private isBound;
    constructor(router: IRouter, element: INode<HTMLElement>, container: IContainer, parent: ViewportScopeCustomElement, parentController: IHydratedController);
    hydrated(controller: ICompiledCustomElementController): void;
    bound(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null, flags: LifecycleFlags): void;
    unbinding(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null, flags: LifecycleFlags): void | Promise<void>;
    afterUnbound(): void;
    connect(): void;
    disconnect(): void;
    private getAttribute;
    private isCustomElementController;
    private isCustomElementViewModel;
    private getClosestCustomElement;
}
//# sourceMappingURL=viewport-scope.d.ts.map