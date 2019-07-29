import { Key } from '@aurelia/kernel';
import { IController, INode, IRenderContext, IRenderingEngine, LifecycleFlags, TemplateDefinition } from '@aurelia/runtime';
import { IRouter } from '../router';
import { Viewport } from '../viewport';
export declare class ViewportCustomElement {
    static readonly inject: readonly Key[];
    name: string;
    scope: boolean;
    usedBy: string;
    default: string;
    noLink: boolean;
    noHistory: boolean;
    stateful: boolean;
    viewport: Viewport;
    $controller: IController;
    private readonly router;
    private readonly element;
    private readonly renderingEngine;
    constructor(router: IRouter, element: Element, renderingEngine: IRenderingEngine);
    render(flags: LifecycleFlags, host: INode, parts: Record<string, TemplateDefinition>, parentContext: IRenderContext | null): void;
    bound(): void;
    unbound(): void;
    connect(): void;
    disconnect(): void;
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
}
//# sourceMappingURL=viewport.d.ts.map