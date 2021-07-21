import { IAppRoot, ISinglePageApp } from './app-root.js';
import { ICustomElementController, IHydratedParentController } from './templating/controller.js';
import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
export interface IAurelia extends Aurelia {
}
export declare const IAurelia: import("@aurelia/kernel").InterfaceSymbol<IAurelia>;
export declare class Aurelia implements IDisposable {
    readonly container: IContainer;
    private _isRunning;
    get isRunning(): boolean;
    private _isStarting;
    get isStarting(): boolean;
    private _isStopping;
    get isStopping(): boolean;
    private _root;
    get root(): IAppRoot;
    private next;
    private readonly _rootProvider;
    constructor(container?: IContainer);
    register(...params: any[]): this;
    app(config: ISinglePageApp): Omit<this, 'register' | 'app' | 'enhance'>;
    /**
     * @param parentController - The owning controller of the view created by this enhance call
     */
    enhance<T extends unknown, K = T extends Constructable<infer I> ? I : T>(config: IEnhancementConfig<T>, parentController?: IHydratedParentController | null): ICustomElementController<K> | Promise<ICustomElementController<K>>;
    waitForIdle(): Promise<void>;
    private _initPlatform;
    private _startPromise;
    start(root?: IAppRoot | undefined): void | Promise<void>;
    private _stopPromise;
    stop(dispose?: boolean): void | Promise<void>;
    dispose(): void;
    private _dispatchEvent;
}
export interface IEnhancementConfig<T> {
    host: Element;
    /**
     * The binding context of the enhancement. Will be instantiate by DI if a constructor is given
     */
    component: T;
    /**
     * A predefined container for the enhanced view.
     */
    container?: IContainer;
}
//# sourceMappingURL=aurelia.d.ts.map