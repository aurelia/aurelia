import { IContainer } from '@aurelia/kernel';
import { Aurelia as $Aurelia, CompositionRoot, ILifecycleTask, ISinglePageApp } from '@aurelia/runtime';
export declare class Aurelia extends $Aurelia<HTMLElement> {
    constructor(container?: IContainer);
    static start(root: CompositionRoot<HTMLElement> | undefined): ILifecycleTask;
    static app(config: ISinglePageApp<HTMLElement> | unknown): Omit<Aurelia, 'register' | 'app'>;
    static register(...params: readonly unknown[]): Aurelia;
    app(config: ISinglePageApp<HTMLElement> | unknown): Omit<this, 'register' | 'app'>;
}
//# sourceMappingURL=quick-start.d.ts.map