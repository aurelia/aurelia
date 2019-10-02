import { IContainer, IRegistry } from '@aurelia/kernel';
import { Aurelia as $Aurelia, CompositionRoot, ILifecycleTask, ISinglePageApp } from '@aurelia/runtime';
export declare class Aurelia extends $Aurelia<HTMLElement> {
    constructor(container?: IContainer);
    static start(root: CompositionRoot<HTMLElement> | undefined): ILifecycleTask;
    static app(config: ISinglePageApp<HTMLElement> | unknown): Aurelia;
    static register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): Aurelia;
    app(config: ISinglePageApp<HTMLElement> | unknown): this;
}
//# sourceMappingURL=quick-start.d.ts.map