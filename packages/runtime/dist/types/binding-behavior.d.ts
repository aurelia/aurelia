import { ResourceType } from '@aurelia/kernel';
import { Collection, IndexMap, LifecycleFlags } from './observation.js';
import type { Constructable, IContainer, ResourceDefinition, IResourceKind, PartialResourceDefinition, IServiceLocator } from '@aurelia/kernel';
import type { BindingObserverRecord, IConnectableBinding } from './binding/connectable.js';
import type { BindingBehaviorExpression, ForOfStatement, IBindingBehaviorExpression, IsBindingBehavior } from './binding/ast.js';
import type { IObserverLocator } from './observation/observer-locator.js';
import type { IBinding } from './observation.js';
import type { Scope } from './observation/binding-context.js';
export declare type PartialBindingBehaviorDefinition = PartialResourceDefinition<{
    strategy?: BindingBehaviorStrategy;
}>;
export declare type BindingBehaviorInstance<T extends {} = {}> = {
    bind(flags: LifecycleFlags, scope: Scope, binding: IBinding, ...args: T[]): void;
    unbind(flags: LifecycleFlags, scope: Scope, binding: IBinding, ...args: T[]): void;
} & T;
export declare const enum BindingBehaviorStrategy {
    singleton = 1,
    interceptor = 2
}
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
    readonly strategy: BindingBehaviorStrategy;
    private constructor();
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: BindingBehaviorType<T>): BindingBehaviorDefinition<T>;
    register(container: IContainer): void;
}
export declare class BindingBehaviorFactory<T extends Constructable = Constructable> {
    private readonly container;
    private readonly Type;
    private readonly deps;
    constructor(container: IContainer, Type: BindingBehaviorType<T>);
    construct(binding: IInterceptableBinding, expr: BindingBehaviorExpression): IInterceptableBinding;
}
export declare type IInterceptableBinding = Exclude<IConnectableBinding, 'updateTarget' | 'updateSource' | 'callSource' | 'handleChange'> & {
    updateTarget?(value: unknown, flags: LifecycleFlags): void;
    updateSource?(value: unknown, flags: LifecycleFlags): void;
    callSource?(args: object): unknown;
    handleChange?(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
};
export interface BindingInterceptor extends IConnectableBinding {
}
export declare class BindingInterceptor implements IInterceptableBinding {
    readonly binding: IInterceptableBinding;
    readonly expr: IBindingBehaviorExpression;
    interceptor: this;
    get observerLocator(): IObserverLocator;
    get locator(): IServiceLocator;
    get $scope(): Scope | undefined;
    get isBound(): boolean;
    get obs(): BindingObserverRecord;
    get sourceExpression(): IsBindingBehavior | ForOfStatement;
    constructor(binding: IInterceptableBinding, expr: IBindingBehaviorExpression);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    callSource(args: object): unknown;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    observeProperty(obj: object, key: string): void;
    observeCollection(observer: Collection): void;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
}
export declare const BindingBehavior: BindingBehaviorKind;
//# sourceMappingURL=binding-behavior.d.ts.map