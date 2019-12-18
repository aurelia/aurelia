import { INode, LifecycleFlags, ICustomElementController } from '@aurelia/runtime';
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
    $controller: ICustomElementController;
    private readonly element;
    constructor(router: IRouter, element: INode);
    afterBind(): void;
    afterUnbind(): void;
    afterAttach(): void;
    connect(): void;
    disconnect(): void;
    beforeBind(flags: LifecycleFlags): void;
    beforeAttach(flags: LifecycleFlags): Promise<void>;
    beforeDetach(flags: LifecycleFlags): Promise<void>;
    beforeUnbind(flags: LifecycleFlags): Promise<void>;
}
//# sourceMappingURL=viewport.d.ts.map