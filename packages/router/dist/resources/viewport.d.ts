import { Key } from '@aurelia/kernel';
import { IController, INode, IRenderContext, IRenderingEngine, LifecycleFlags, TemplateDefinition } from '@aurelia/runtime';
import { IRouter } from '../router';
import { Viewport } from '../viewport';
export declare class ViewportCustomElement {
    private readonly router;
    private readonly element;
    private readonly renderingEngine;
    static readonly inject: readonly Key[];
    name: string;
    usedBy: string;
    default: string;
    noScope: boolean;
    noLink: boolean;
    noHistory: boolean;
    stateful: boolean;
    viewport: Viewport | null;
    $controller: IController;
    constructor(router: IRouter, element: Element, renderingEngine: IRenderingEngine);
    render(flags: LifecycleFlags, host: INode, parts: Record<string, TemplateDefinition>, parentContext: IRenderContext | null): void;
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