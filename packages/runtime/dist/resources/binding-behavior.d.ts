import { Constructable, IContainer, ResourceDefinition, IResourceKind, ResourceType, PartialResourceDefinition } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IScope } from '../observation';
import { IBinding } from '../lifecycle';
export declare type PartialBindingBehaviorDefinition = PartialResourceDefinition;
export declare type BindingBehaviorInstance<T extends {} = {}> = {
    bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...args: T[]): void;
} & T;
export declare type BindingBehaviorType<T extends Constructable = Constructable> = ResourceType<T, BindingBehaviorInstance>;
export declare type BindingBehaviorKind = IResourceKind<BindingBehaviorType, BindingBehaviorDefinition> & {
    isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never);
    define<T extends Constructable>(name: string, Type: T): BindingBehaviorType<T>;
    define<T extends Constructable>(def: PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
    getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T>;
    annotate<K extends keyof PartialBindingBehaviorDefinition>(Type: Constructable, prop: K, value: PartialBindingBehaviorDefinition[K]): void;
    getAnnotation<K extends keyof PartialBindingBehaviorDefinition>(Type: Constructable, prop: K): PartialBindingBehaviorDefinition[K];
};
export declare type BindingBehaviorDecorator = <T extends Constructable>(Type: T) => BindingBehaviorType<T>;
export declare function bindingBehavior(definition: PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export declare function bindingBehavior(name: string): BindingBehaviorDecorator;
export declare function bindingBehavior(nameOrDef: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export declare class BindingBehaviorDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, BindingBehaviorInstance> {
    readonly Type: BindingBehaviorType<T>;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly key: string;
    private constructor();
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: BindingBehaviorType<T>): BindingBehaviorDefinition<T>;
    register(container: IContainer): void;
}
export declare const BindingBehavior: BindingBehaviorKind;
//# sourceMappingURL=binding-behavior.d.ts.map