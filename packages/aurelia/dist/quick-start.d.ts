import { IContainer } from '@aurelia/kernel';
import { Aurelia as $Aurelia, ICompositionRoot, ISinglePageApp } from '@aurelia/runtime';
export declare class Aurelia extends $Aurelia<HTMLElement> {
    constructor(container?: IContainer);
    static start(root: ICompositionRoot<HTMLElement> | undefined): void | Promise<void>;
    static app(config: ISinglePageApp<HTMLElement> | unknown): Omit<Aurelia, 'register' | 'app' | 'enhance'>;
    static enhance(config: ISinglePageApp<HTMLElement>): Omit<Aurelia, 'register' | 'app' | 'enhance'>;
    static register(...params: readonly unknown[]): Aurelia;
    app(config: ISinglePageApp<HTMLElement> | unknown): Omit<this, 'register' | 'app' | 'enhance'>;
}
//# sourceMappingURL=quick-start.d.ts.map