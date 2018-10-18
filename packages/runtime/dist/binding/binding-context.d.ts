import { IIndexable } from '@aurelia/kernel';
import { StrictPrimitive } from './ast';
import { IBindScope, ObservedCollection, PropertyObserver } from './observation';
export interface IObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj = Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> {
}
export declare type ObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj = Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> = {
    [P in TKey]: PropertyObserver;
} & {
    getOrCreate(obj: IBindingContext | IOverrideContext, key: string): PropertyObserver;
};
export interface IBindingContext {
    [key: string]: ObservedCollection | StrictPrimitive | IIndexable;
    readonly $synthetic?: true;
    readonly $observers?: ObserversLookup<IOverrideContext>;
    getObservers(): ObserversLookup<IOverrideContext>;
}
export interface IOverrideContext {
    [key: string]: ObservedCollection | StrictPrimitive | IIndexable;
    readonly $synthetic?: true;
    readonly $observers?: ObserversLookup<IOverrideContext>;
    readonly bindingContext: IBindingContext | IBindScope;
    readonly parentOverrideContext: IOverrideContext | null;
    getObservers(): ObserversLookup<IOverrideContext>;
}
export interface IScope {
    readonly bindingContext: IBindingContext | IBindScope;
    readonly overrideContext: IOverrideContext;
}
export declare class BindingContext implements IBindingContext {
    [key: string]: ObservedCollection | StrictPrimitive | IIndexable;
    readonly $synthetic: true;
    $observers: ObserversLookup<IOverrideContext>;
    private constructor();
    static create(obj?: IIndexable): BindingContext;
    static create(key: string, value: ObservedCollection | StrictPrimitive | IIndexable): BindingContext;
    static get(scope: IScope, name: string, ancestor: number): IBindingContext | IOverrideContext | IBindScope;
    getObservers(): ObserversLookup<IOverrideContext>;
}
export declare class Scope implements IScope {
    readonly bindingContext: IBindingContext | IBindScope;
    readonly overrideContext: IOverrideContext;
    private constructor();
    static create(bc: IBindingContext | IBindScope, oc: IOverrideContext | null): Scope;
    static fromOverride(oc: IOverrideContext): Scope;
    static fromParent(ps: IScope, bc: IBindingContext | IBindScope): Scope;
}
export declare class OverrideContext implements IOverrideContext {
    readonly bindingContext: IBindingContext | IBindScope;
    readonly parentOverrideContext: IOverrideContext | null;
    [key: string]: ObservedCollection | StrictPrimitive | IIndexable;
    readonly $synthetic: true;
    private constructor();
    static create(bc: IBindingContext | IBindScope, poc: IOverrideContext | null): OverrideContext;
    getObservers(): ObserversLookup<IOverrideContext>;
}
//# sourceMappingURL=binding-context.d.ts.map