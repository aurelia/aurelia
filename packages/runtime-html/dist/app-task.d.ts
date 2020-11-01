import { IContainer, Key, Resolved } from '@aurelia/kernel';
export declare type TaskSlot = ('beforeCreate' | 'hydrating' | 'hydrated' | 'beforeActivate' | 'afterActivate' | 'beforeDeactivate' | 'afterDeactivate');
export declare const IAppTask: import("@aurelia/kernel").InterfaceSymbol<IAppTask>;
export interface IAppTask extends Pick<$AppTask, 'slot' | 'run' | 'register'> {
}
export interface ICallbackSlotChooser<K extends Key> extends Pick<$AppTask<K>, 'beforeCreate' | 'hydrating' | 'hydrated' | 'beforeActivate' | 'afterActivate' | 'beforeDeactivate' | 'afterDeactivate'> {
}
export interface ICallbackChooser<K extends Key> extends Pick<$AppTask<K>, 'call'> {
}
declare class $AppTask<K extends Key = Key> {
    private readonly key;
    slot: TaskSlot;
    callback: (instance: unknown) => void | Promise<void>;
    container: IContainer;
    private constructor();
    static with<K1 extends Key>(key: K1): ICallbackSlotChooser<K1>;
    beforeCreate(): ICallbackChooser<K>;
    hydrating(): ICallbackChooser<K>;
    hydrated(): ICallbackChooser<K>;
    beforeActivate(): ICallbackChooser<K>;
    afterActivate(): ICallbackChooser<K>;
    beforeDeactivate(): ICallbackChooser<K>;
    afterDeactivate(): ICallbackChooser<K>;
    at(slot: TaskSlot): ICallbackChooser<K>;
    call<K1 extends Key = K>(fn: (instance: Resolved<K1>) => void | Promise<void>): IAppTask;
    register(container: IContainer): IContainer;
    run(): void | Promise<void>;
}
export declare const AppTask: {
    with<K extends Key>(key: K): ICallbackSlotChooser<K>;
};
export {};
//# sourceMappingURL=app-task.d.ts.map