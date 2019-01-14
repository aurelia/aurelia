import { IBindingTargetObserver, IObservable, IPropertySubscriber, LifecycleFlags } from '../observation';
export interface IDirtyChecker {
    createProperty(obj: IObservable, propertyName: string): IBindingTargetObserver;
    addProperty(property: DirtyCheckProperty): void;
    removeProperty(property: DirtyCheckProperty): void;
}
export declare const IDirtyChecker: import("@aurelia/kernel").InterfaceSymbol<IDirtyChecker>;
export declare const DirtyCheckSettings: {
    /**
     * Default: `6`
     *
     * Adjust the global dirty check frequency.
     * Measures in "frames per check", such that (given an FPS of 60):
     * - A value of 1 will result in 60 dirty checks per second
     * - A value of 6 will result in 10 dirty checks per second
     */
    framesPerCheck: number;
    /**
     * Default: `false`
     *
     * Disable dirty-checking entirely. Properties that cannot be observed without dirty checking
     * or an adapter, will simply not be observed.
     */
    disabled: boolean;
    /**
     * Default: `true`
     *
     * Log a warning message to the console if a property is being dirty-checked.
     */
    warn: boolean;
    /**
     * Default: `false`
     *
     * Throw an error if a property is being dirty-checked.
     */
    throw: boolean;
    /**
     * Resets all dirty checking settings to the framework's defaults.
     */
    resetToDefault(): void;
};
export interface DirtyCheckProperty extends IBindingTargetObserver {
}
export declare class DirtyCheckProperty implements DirtyCheckProperty {
    obj: IObservable;
    oldValue: unknown;
    propertyKey: string;
    private readonly dirtyChecker;
    constructor(dirtyChecker: IDirtyChecker, obj: IObservable, propertyKey: string);
    isDirty(): boolean;
    flush(flags: LifecycleFlags): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
}
//# sourceMappingURL=dirty-checker.d.ts.map