import { IIndexable, StrictPrimitive } from '@aurelia/kernel';
import { IBindScope } from '../lifecycle';
import { IBindingContext, IOverrideContext, IScope, ObservedCollection, ObserversLookup } from '../observation';
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