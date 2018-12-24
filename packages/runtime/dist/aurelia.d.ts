import { IContainer, IRegistry } from '@aurelia/kernel';
import { IDOM } from './dom';
import { IDocument } from './dom.interfaces';
import { ICustomElement } from './resources/custom-element';
export interface ISinglePageApp {
    dom?: IDOM;
    host: unknown;
    component: unknown;
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
    /**
     * Use the supplied `dom` directly for this `Aurelia` instance.
     */
    useDOM(dom: IDOM): this;
    /**
     * Create a new HTML `DOM` backed by the supplied `document`.
     */
    useDOM(document: IDocument): this;
    /**
     * Either create a new HTML `DOM` backed by the supplied `document` or uses the supplied `DOM` directly.
     *
     * If no argument is provided, uses the default global `document` variable.
     * (this will throw an error in non-browser environments).
     */
    useDOM(domOrDocument?: IDOM | IDocument): this;
}
//# sourceMappingURL=aurelia.d.ts.map