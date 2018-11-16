import { Constructable, Decoratable, Decorated } from '@aurelia/kernel';
import { IScope, LifecycleFlags } from '../observation';
import { IResourceKind, IResourceType } from '../resource';
import { IBinding } from './binding';
export interface IBindingBehavior {
    bind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
}
export interface IBindingBehaviorSource {
    name: string;
}
export interface IBindingBehaviorType extends IResourceType<IBindingBehaviorSource> {
}
declare type BindingBehaviorDecorator = <T extends Constructable>(target: Decoratable<IBindingBehavior, T>) => Decorated<IBindingBehavior, T> & IBindingBehaviorType;
export declare function bindingBehavior(name: string): BindingBehaviorDecorator;
export declare function bindingBehavior(source: IBindingBehaviorSource): BindingBehaviorDecorator;
export declare const BindingBehaviorResource: IResourceKind<IBindingBehaviorSource, IBindingBehaviorType>;
export {};
//# sourceMappingURL=binding-behavior.d.ts.map