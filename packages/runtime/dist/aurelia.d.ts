import { IContainer } from '@aurelia/kernel';
import { IActivator } from './activator';
import { IDOM, INode } from './dom';
import { BindingStrategy } from './flags';
import { ICustomElementViewModel, ILifecycle, ICustomElementController } from './lifecycle';
import { ILifecycleTask } from './lifecycle-task';
export interface ISinglePageApp<THost extends INode = INode> {
    strategy?: BindingStrategy;
    dom?: IDOM;
    host: THost;
    component: unknown;
}
export declare class CompositionRoot<T extends INode = INode> {
    readonly config: ISinglePageApp<T>;
    readonly container: IContainer;
    readonly host: T & {
        $aurelia?: Aurelia<T>;
    };
    readonly dom: IDOM<T>;
    readonly strategy: BindingStrategy;
    readonly lifecycle: ILifecycle;
    readonly activator: IActivator;
    task: ILifecycleTask;
    controller?: ICustomElementController<T>;
    viewModel?: ICustomElementViewModel<T>;
    private createTask?;
    constructor(config: ISinglePageApp<T>, container: IContainer);
    activate(antecedent?: ILifecycleTask): ILifecycleTask;
    deactivate(antecedent?: ILifecycleTask): ILifecycleTask;
    private create;
}
export declare class Aurelia<TNode extends INode = INode> {
    readonly container: IContainer;
    get isRunning(): boolean;
    get isStarting(): boolean;
    get isStopping(): boolean;
    get root(): CompositionRoot<TNode>;
    private task;
    private _isRunning;
    private _isStarting;
    private _isStopping;
    private _root?;
    private next?;
    constructor(container?: IContainer);
    register(...params: any[]): this;
    app(config: ISinglePageApp<TNode>): Omit<this, 'register' | 'app'>;
    start(root?: CompositionRoot<TNode> | undefined): ILifecycleTask;
    stop(root?: CompositionRoot<TNode> | undefined): ILifecycleTask;
    wait(): Promise<void>;
    private onBeforeStart;
    private onAfterStart;
    private onBeforeStop;
    private onAfterStop;
    private dispatchEvent;
}
export declare const IDOMInitializer: import("@aurelia/kernel").InterfaceSymbol<IDOMInitializer>;
export interface IDOMInitializer {
    initialize(config?: ISinglePageApp): IDOM;
}
//# sourceMappingURL=aurelia.d.ts.map