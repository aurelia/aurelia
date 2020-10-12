import { IContainer, InstanceProvider, IDisposable } from '@aurelia/kernel';
import { IDOM, INode } from './dom';
import { BindingStrategy } from './flags';
import { ICustomElementController } from './lifecycle';
export interface ISinglePageApp<THost extends INode = INode> {
    strategy?: BindingStrategy;
    dom?: IDOM;
    host: THost;
    component: unknown;
}
export interface ICompositionRoot<T extends INode = INode> extends CompositionRoot<T> {
}
export declare const ICompositionRoot: import("@aurelia/kernel").InterfaceSymbol<ICompositionRoot<INode>>;
export declare class CompositionRoot<T extends INode = INode> implements IDisposable {
    readonly config: ISinglePageApp<T>;
    readonly container: IContainer;
    readonly host: T & {
        $aurelia?: IAurelia<T>;
    };
    readonly dom: IDOM<T>;
    controller: ICustomElementController<T>;
    private hydratePromise;
    private readonly enhanceDefinition;
    private readonly strategy;
    private readonly lifecycle;
    constructor(config: ISinglePageApp<T>, container: IContainer, rootProvider: InstanceProvider<ICompositionRoot<T>>, enhance?: boolean);
    activate(): void | Promise<void>;
    deactivate(): void | Promise<void>;
    dispose(): void;
}
export interface IAurelia<T extends INode = INode> extends Aurelia<T> {
}
export declare const IAurelia: import("@aurelia/kernel").InterfaceSymbol<IAurelia<INode>>;
export declare class Aurelia<TNode extends INode = INode> implements IDisposable {
    readonly container: IContainer;
    private _isRunning;
    get isRunning(): boolean;
    private _isStarting;
    get isStarting(): boolean;
    private _isStopping;
    get isStopping(): boolean;
    private _root;
    get root(): ICompositionRoot<TNode>;
    private next;
    private readonly rootProvider;
    constructor(container?: IContainer);
    register(...params: any[]): this;
    app(config: ISinglePageApp<TNode>): Omit<this, 'register' | 'app' | 'enhance'>;
    enhance(config: ISinglePageApp<TNode>): Omit<this, 'register' | 'app' | 'enhance'>;
    private startPromise;
    start(root?: ICompositionRoot<TNode> | undefined): void | Promise<void>;
    private stopPromise;
    stop(): void | Promise<void>;
    dispose(): void;
    private dispatchEvent;
}
export declare const IDOMInitializer: import("@aurelia/kernel").InterfaceSymbol<IDOMInitializer>;
export interface IDOMInitializer {
    initialize(config?: ISinglePageApp): IDOM;
}
//# sourceMappingURL=aurelia.d.ts.map