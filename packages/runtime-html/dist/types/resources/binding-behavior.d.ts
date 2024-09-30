import { ResourceType } from '@aurelia/kernel';
import { type Scope } from '@aurelia/runtime';
import type { Constructable, IContainer, IServiceLocator, PartialResourceDefinition, ResourceDefinition } from '@aurelia/kernel';
import { type IResourceKind } from './resources-shared';
import { IBinding } from '../binding/interfaces-bindings';
export type PartialBindingBehaviorDefinition = PartialResourceDefinition;
export type BindingBehaviorStaticAuDefinition = PartialBindingBehaviorDefinition & {
    type: 'binding-behavior';
};
export type BindingBehaviorType<T extends Constructable = Constructable> = ResourceType<T, BindingBehaviorInstance>;
export type BindingBehaviorInstance<T extends {} = {}> = {
    type?: 'instance' | 'factory';
    bind?(scope: Scope, binding: IBinding, ...args: unknown[]): void;
    unbind?(scope: Scope, binding: IBinding, ...args: unknown[]): void;
} & T;
export type BindingBehaviorKind = IResourceKind & {
    isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never);
    define<T extends Constructable>(name: string, Type: T): BindingBehaviorType<T>;
    define<T extends Constructable>(def: PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
    getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T>;
    find(container: IContainer, name: string): BindingBehaviorDefinition | null;
    get(container: IServiceLocator, name: string): BindingBehaviorInstance;
};
export type BindingBehaviorDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext) => BindingBehaviorType<T>;
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
    register(container: IContainer, aliasName?: string | undefined): void;
}
export declare const BindingBehavior: Readonly<BindingBehaviorKind>;
//# sourceMappingURL=binding-behavior.d.ts.map