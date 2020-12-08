import { IContainer, IDisposable } from '@aurelia/kernel';
import { IAppRoot, ISinglePageApp } from './app-root.js';
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
    private readonly rootProvider;
    constructor(container?: IContainer);
    register(...params: any[]): this;
    app(config: ISinglePageApp): Omit<this, 'register' | 'app' | 'enhance'>;
    enhance(config: ISinglePageApp): Omit<this, 'register' | 'app' | 'enhance'>;
    waitForIdle(): Promise<void>;
    private initPlatform;
    private startPromise;
    start(root?: IAppRoot | undefined): void | Promise<void>;
    private stopPromise;
    stop(dispose?: boolean): void | Promise<void>;
    dispose(): void;
    private dispatchEvent;
}
//# sourceMappingURL=aurelia.d.ts.map