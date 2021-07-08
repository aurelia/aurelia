import type { IContainer, IRegistry, Key, Resolved } from '@aurelia/kernel';
export declare type TaskSlot = ('beforeCreate' | 'hydrating' | 'hydrated' | 'beforeActivate' | 'afterActivate' | 'beforeDeactivate' | 'afterDeactivate');
export declare const IAppTask: import("@aurelia/kernel").InterfaceSymbol<IAppTask>;
export interface IAppTask extends Pick<$AppTask, 'slot' | 'run' | 'register'> {
}
declare class $AppTask<K extends Key = Key> {
    readonly slot: TaskSlot;
    constructor(slot: TaskSlot, key: K | null, cb: AppTaskCallback<K> | AppTaskCallbackNoArg);
    register(container: IContainer): IContainer;
    run(): void | Promise<void>;
}
export declare const AppTask: Readonly<{
    beforeCreate: {
        <T extends Key = Key>(callback: AppTaskCallbackNoArg): IRegistry;
        <T_1 extends Key = Key>(key: T_1, callback: AppTaskCallback<T_1>): IRegistry;
    };
    hydrating: {
        <T extends Key = Key>(callback: AppTaskCallbackNoArg): IRegistry;
        <T_1 extends Key = Key>(key: T_1, callback: AppTaskCallback<T_1>): IRegistry;
    };
    hydrated: {
        <T extends Key = Key>(callback: AppTaskCallbackNoArg): IRegistry;
        <T_1 extends Key = Key>(key: T_1, callback: AppTaskCallback<T_1>): IRegistry;
    };
    beforeActivate: {
        <T extends Key = Key>(callback: AppTaskCallbackNoArg): IRegistry;
        <T_1 extends Key = Key>(key: T_1, callback: AppTaskCallback<T_1>): IRegistry;
    };
    afterActivate: {
        <T extends Key = Key>(callback: AppTaskCallbackNoArg): IRegistry;
        <T_1 extends Key = Key>(key: T_1, callback: AppTaskCallback<T_1>): IRegistry;
    };
    beforeDeactivate: {
        <T extends Key = Key>(callback: AppTaskCallbackNoArg): IRegistry;
        <T_1 extends Key = Key>(key: T_1, callback: AppTaskCallback<T_1>): IRegistry;
    };
    afterDeactivate: {
        <T extends Key = Key>(callback: AppTaskCallbackNoArg): IRegistry;
        <T_1 extends Key = Key>(key: T_1, callback: AppTaskCallback<T_1>): IRegistry;
    };
}>;
export declare type AppTaskCallbackNoArg = () => void | Promise<void>;
export declare type AppTaskCallback<T> = (arg: Resolved<T>) => void | Promise<void>;
export {};
//# sourceMappingURL=app-task.d.ts.map