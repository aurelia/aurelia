import { IBindingTargetAccessor, IBindingTargetObserver, IObservable } from '../observation';
export interface IDirtyChecker {
    createProperty(obj: IObservable, propertyName: string): IBindingTargetAccessor;
}
export declare const IDirtyChecker: import("@aurelia/kernel/dist/di").InterfaceSymbol<IDirtyChecker>;
export interface DirtyCheckProperty extends IBindingTargetObserver {
}
//# sourceMappingURL=dirty-checker.d.ts.map