import { Constructable, InterfaceSymbol } from '@aurelia/kernel';
import { ICustomElement, IElementTemplateProvider, INode, IRenderContext, IRenderingEngine, LifecycleFlags, TemplateDefinition } from '@aurelia/runtime';
import { Router } from '../router';
import { Viewport } from '../viewport';
export interface ViewportCustomElement extends ICustomElement<Element> {
}
export declare class ViewportCustomElement {
    static readonly inject: ReadonlyArray<InterfaceSymbol | Constructable>;
    name: string;
    scope: boolean;
    usedBy: string;
    default: string;
    noLink: boolean;
    noHistory: boolean;
    stateful: boolean;
    viewport: Viewport;
    private readonly router;
    private readonly element;
    private readonly renderingEngine;
    constructor(router: Router, element: Element, renderingEngine: IRenderingEngine);
    render(flags: LifecycleFlags, host: INode, parts: Record<string, TemplateDefinition>, parentContext: IRenderContext | null): IElementTemplateProvider | void;
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