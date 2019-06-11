import { IContainer, IRegistry } from '@aurelia/kernel';
import { IDOM, INode } from './dom';
import { BindingStrategy } from './flags';
import { ICustomElement } from './resources/custom-element';
export interface ISinglePageApp<THost extends INode = INode> {
    strategy?: BindingStrategy;
    dom?: IDOM;
    host: THost;
    component: unknown;
}
export declare class Aurelia {
    private readonly container;
    private readonly components;
    private readonly startTasks;
    private readonly stopTasks;
    private isStarted;
    private _root;
    constructor(container?: IContainer);
    register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this;
    app(config: ISinglePageApp): this;
    root(): ICustomElement | null;
    start(): this;
    stop(): this;
}
export declare const IDOMInitializer: import("@aurelia/kernel").InterfaceSymbol<IDOMInitializer>;
export interface IDOMInitializer {
    initialize(config?: ISinglePageApp): IDOM;
}
//# sourceMappingURL=aurelia.d.ts.map