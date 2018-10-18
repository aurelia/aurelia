import { IContainer, IRegistry } from '@aurelia/kernel';
import { ICustomElement } from './templating/custom-element';
export interface ISinglePageApp {
    host: any;
    component: any;
}
export declare class Aurelia {
    private container;
    private components;
    private startTasks;
    private stopTasks;
    private isStarted;
    private _root;
    constructor(container?: IContainer);
    register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this;
    app(config: ISinglePageApp): this;
    root(): ICustomElement | null;
    start(): this;
    stop(): this;
}
//# sourceMappingURL=aurelia.d.ts.map