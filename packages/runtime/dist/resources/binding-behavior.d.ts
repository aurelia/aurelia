import { Class, Constructable, IResourceDefinition, IResourceKind, IResourceType } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { IScope } from '../observation';
export interface IBindingBehavior<T = any[]> {
    bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
}
export interface IBindingBehaviorDefinition extends IResourceDefinition {
}
declare type BindingBehaviorStaticProperties = Required<Pick<IBindingBehaviorDefinition, 'aliases'>>;
export interface IBindingBehaviorType<C extends Constructable = Constructable> extends IResourceType<IBindingBehaviorDefinition, InstanceType<C> & IBindingBehavior>, BindingBehaviorStaticProperties {
}
export interface IBindingBehaviorResource extends IResourceKind<IBindingBehaviorDefinition, IBindingBehavior, Class<IBindingBehavior>> {
}
export declare function bindingBehavior(definition: IBindingBehaviorDefinition): BindingBehaviorDecorator;
export declare function bindingBehavior(name: string): BindingBehaviorDecorator;
export declare function bindingBehavior(nameOrDefinition: string | IBindingBehaviorDefinition): BindingBehaviorDecorator;
export declare const BindingBehavior: Readonly<IBindingBehaviorResource>;
export declare type BindingBehaviorDecorator = <T extends Constructable>(target: T) => T & IBindingBehaviorType<T>;
export {};
//# sourceMappingURL=binding-behavior.d.ts.map