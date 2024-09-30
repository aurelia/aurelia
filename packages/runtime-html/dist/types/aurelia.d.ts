import { IAppRoot, IAppRootConfig } from './app-root';
import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
export interface IAurelia extends Aurelia {
}
export declare const IAurelia: import("@aurelia/kernel").InterfaceSymbol<IAurelia>;
export declare class Aurelia implements IDisposable {
    readonly container: IContainer;
    get isRunning(): boolean;
    get isStarting(): boolean;
    get isStopping(): boolean;
    get root(): IAppRoot;
    private next;
    constructor(container?: IContainer);
    register(...params: unknown[]): this;
    app(config: ISinglePageAppConfig): Omit<this, 'register' | 'app' | 'enhance'>;
    /**
     * @param parentController - The owning controller of the view created by this enhance call
     */
    enhance<T extends object>(config: IEnhancementConfig<T>): IAppRoot<T> | Promise<IAppRoot<T>>;
    waitForIdle(): Promise<void>;
    start(root?: IAppRoot | undefined): void | Promise<void>;
    stop(dispose?: boolean): void | Promise<void>;
    dispose(): void;
}
export type ISinglePageAppConfig<T extends object = object> = Omit<IAppRootConfig<T>, 'strictBinding'> & {
    host: Element;
};
export type IEnhancementConfig<T extends object = object> = IAppRootConfig<T> & {
    host: Element;
    /**
     * The binding context of the enhancement. Will be instantiate by DI if a constructor is given
     */
    component: T | Constructable<T>;
    /**
     * A predefined container for the enhanced view.
     */
    container?: IContainer;
};
//# sourceMappingURL=aurelia.d.ts.map