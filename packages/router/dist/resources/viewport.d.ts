import { IController, INode, LifecycleFlags } from '@aurelia/runtime';
import { IRouter } from '../router';
import { Viewport } from '../viewport';
export declare class ViewportCustomElement {
    private readonly router;
    name: string;
    usedBy: string;
    default: string;
    noScope: boolean;
    noLink: boolean;
    noHistory: boolean;
    stateful: boolean;
    viewport: Viewport | null;
    $controller: IController;
    private readonly element;
    constructor(router: IRouter, element: INode);
    bound(): void;
    unbound(): void;
    attached(): void;
    connect(): void;
    disconnect(): void;
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): Promise<void>;
    detaching(flags: LifecycleFlags): Promise<void>;
    unbinding(flags: LifecycleFlags): Promise<void>;
}
//# sourceMappingURL=viewport.d.ts.map