import { Constructable, InterfaceSymbol } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { Router } from '../router';
import { Viewport } from '../viewport';
export declare class ViewportCustomElement {
    static readonly inject: ReadonlyArray<InterfaceSymbol | Constructable>;
    name: string;
    scope: boolean;
    usedBy: string;
    default: string;
    noLink: boolean;
    noHistory: boolean;
    viewport: Viewport;
    private readonly router;
    private readonly element;
    constructor(router: Router, element: Element);
    attached(): void;
    detached(): void;
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
}
//# sourceMappingURL=viewport.d.ts.map