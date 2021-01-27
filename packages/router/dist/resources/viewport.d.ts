import { ILogger } from '@aurelia/kernel';
import { ICustomElementViewModel, IHydratedController, LifecycleFlags, ICompiledCustomElementController } from '@aurelia/runtime-html';
import { IRouteContext } from '../route-context.js';
export interface IViewport {
    readonly name: string;
    readonly usedBy: string;
    readonly default: string;
    readonly fallback: string;
    readonly noScope: boolean;
    readonly noLink: boolean;
    readonly noHistory: boolean;
    readonly stateful: boolean;
}
export declare class ViewportCustomElement implements ICustomElementViewModel, IViewport {
    private readonly logger;
    private readonly ctx;
    name: string;
    usedBy: string;
    default: string;
    fallback: string;
    noScope: boolean;
    noLink: boolean;
    noHistory: boolean;
    stateful: boolean;
    private agent;
    private controller;
    constructor(logger: ILogger, ctx: IRouteContext);
    hydrated(controller: ICompiledCustomElementController): void;
    attaching(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    toString(): string;
}
//# sourceMappingURL=viewport.d.ts.map