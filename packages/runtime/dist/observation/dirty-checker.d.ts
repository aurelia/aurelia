import { IBindingTargetObserver, IObservable, IPropertySubscriber, LifecycleFlags } from '../observation';
export interface IDirtyChecker {
    createProperty(obj: IObservable, propertyName: string): IBindingTargetObserver;
    addProperty(property: DirtyCheckProperty): void;
    removeProperty(property: DirtyCheckProperty): void;
}
export declare const IDirtyChecker: import("@aurelia/kernel").InterfaceSymbol<IDirtyChecker>;
export interface DirtyCheckProperty extends IBindingTargetObserver {
}
export declare class DirtyCheckProperty implements DirtyCheckProperty {
    obj: IObservable;
    oldValue: unknown;
    propertyKey: string;
    private readonly dirtyChecker;
    constructor(dirtyChecker: IDirtyChecker, obj: IObservable, propertyKey: string);
    isDirty(): boolean;
    getValue(): unknown;
    setValue(newValue: unknown): void;
    flush(flags: LifecycleFlags): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
}
//# sourceMappingURL=dirty-checker.d.ts.map