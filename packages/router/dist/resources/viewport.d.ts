import { Router } from '../router';
import { Viewport } from '../viewport';
export declare class ViewportCustomElement {
    private router;
    private element;
    static readonly inject: ReadonlyArray<Function>;
    name: string;
    scope: boolean;
    usedBy: string;
    viewport: Viewport;
    constructor(router: Router, element: Element);
    attached(): void;
    unbound(): void;
}
//# sourceMappingURL=viewport.d.ts.map