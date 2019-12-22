import { IContainer } from '@aurelia/kernel';
import { INode, LifecycleFlags, ICompiledCustomElementController, ICustomElementViewModel, ICustomElementController } from '@aurelia/runtime';
import { IRouter } from '../router';
import { Viewport } from '../viewport';
export declare const ParentViewport: import("@aurelia/runtime/dist/resources/custom-element").InjectableToken<import("@aurelia/kernel").Key>;
export declare class ViewportCustomElement implements ICustomElementViewModel<Element> {
    private readonly router;
    private container;
    private readonly parentViewport;
    name: string;
    usedBy: string;
    default: string;
    fallback: string;
    noScope: boolean;
    noLink: boolean;
    noHistory: boolean;
    stateful: boolean;
    viewport: Viewport | null;
    readonly $controller: ICustomElementController<Element, this>;
    private readonly element;
    private isBound;
    constructor(router: IRouter, element: INode, container: IContainer, parentViewport: ViewportCustomElement);
    afterCompile(controller: ICompiledCustomElementController): void;
    afterUnbind(): void;
    connect(): void;
    disconnect(): void;
    beforeBind(flags: LifecycleFlags): void;
    beforeAttach(flags: LifecycleFlags): Promise<void>;
    beforeDetach(flags: LifecycleFlags): Promise<void>;
    beforeUnbind(flags: LifecycleFlags): Promise<void>;
    private getAttribute;
}
//# sourceMappingURL=viewport.d.ts.map