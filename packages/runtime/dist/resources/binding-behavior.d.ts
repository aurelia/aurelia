import { Class, IResourceDefinition, IResourceKind, IResourceType } from '@aurelia/kernel';
import { IBinding } from '../binding/binding';
import { LifecycleFlags } from '../flags';
import { IScope } from '../observation';
export interface IBindingBehavior {
    bind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
}
export interface IBindingBehaviorDefinition extends IResourceDefinition {
}
export interface IBindingBehaviorType extends IResourceType<IBindingBehaviorDefinition, IBindingBehavior> {
}
export interface IBindingBehaviorResource extends IResourceKind<IBindingBehaviorDefinition, IBindingBehavior, Class<IBindingBehavior>> {
}
declare type BindingBehaviorDecorator = <TProto, TClass>(target: Class<TProto, TClass> & Partial<IBindingBehaviorType>) => Class<TProto, TClass> & IBindingBehaviorType;
export declare function bindingBehavior(name: string): BindingBehaviorDecorator;
export declare function bindingBehavior(definition: IBindingBehaviorDefinition): BindingBehaviorDecorator;
export declare const BindingBehaviorResource: IBindingBehaviorResource;
export {};
//# sourceMappingURL=binding-behavior.d.ts.map