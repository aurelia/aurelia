import { Constructable, Decoratable, Decorated } from '@aurelia/kernel';
import { IScope, LifecycleFlags } from '../observation';
import { IResourceDefinition, IResourceKind, IResourceType } from '../resource';
import { IBinding } from './binding';
export interface IBindingBehavior {
    bind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
}
export interface IBindingBehaviorDefinition extends IResourceDefinition {
}
export interface IBindingBehaviorType extends IResourceType<IBindingBehaviorDefinition, IBindingBehavior> {
}
declare type BindingBehaviorDecorator = <T extends Constructable>(target: Decoratable<IBindingBehavior, T>) => Decorated<IBindingBehavior, T> & IBindingBehaviorType;
export declare function bindingBehavior(name: string): BindingBehaviorDecorator;
export declare function bindingBehavior(definition: IBindingBehaviorDefinition): BindingBehaviorDecorator;
export declare const BindingBehaviorResource: IResourceKind<IBindingBehaviorDefinition, IBindingBehaviorType>;
export {};
//# sourceMappingURL=binding-behavior.d.ts.map