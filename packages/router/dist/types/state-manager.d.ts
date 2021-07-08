import { ICustomElementController } from '@aurelia/runtime-html';
export declare const IStateManager: import("@aurelia/kernel").InterfaceSymbol<IStateManager>;
export interface IStateManager {
    saveState(controller: ICustomElementController): void;
    restoreState(controller: ICustomElementController): void;
}
export declare class ScrollStateManager implements IStateManager {
    private readonly cache;
    saveState(controller: ICustomElementController): void;
    restoreState(controller: ICustomElementController): void;
}
//# sourceMappingURL=state-manager.d.ts.map