import type { Constructable, IContainer, ResourceDefinition, IResourceKind, ResourceType, PartialResourceDefinition } from '@aurelia/kernel';
export declare type PartialValueConverterDefinition = PartialResourceDefinition;
export declare type ValueConverterInstance<T extends {} = {}> = {
    toView(input: unknown, ...args: unknown[]): unknown;
    fromView?(input: unknown, ...args: unknown[]): unknown;
} & T;
export declare type ValueConverterType<T extends Constructable = Constructable> = ResourceType<T, ValueConverterInstance>;
export declare type ValueConverterKind = IResourceKind<ValueConverterType, ValueConverterDefinition> & {
    isType<T>(value: T): value is (T extends Constructable ? ValueConverterType<T> : never);
    define<T extends Constructable>(name: string, Type: T): ValueConverterType<T>;
    define<T extends Constructable>(def: PartialValueConverterDefinition, Type: T): ValueConverterType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialValueConverterDefinition, Type: T): ValueConverterType<T>;
    getDefinition<T extends Constructable>(Type: T): ValueConverterDefinition<T>;
    annotate<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K, value: PartialValueConverterDefinition[K]): void;
    getAnnotation<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K): PartialValueConverterDefinition[K];
};
export declare type ValueConverterDecorator = <T extends Constructable>(Type: T) => ValueConverterType<T>;
export declare function valueConverter(definition: PartialValueConverterDefinition): ValueConverterDecorator;
export declare function valueConverter(name: string): ValueConverterDecorator;
export declare function valueConverter(nameOrDef: string | PartialValueConverterDefinition): ValueConverterDecorator;
export declare class ValueConverterDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, ValueConverterInstance> {
    readonly Type: ValueConverterType<T>;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly key: string;
    private constructor();
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialValueConverterDefinition, Type: ValueConverterType<T>): ValueConverterDefinition<T>;
    register(container: IContainer): void;
}
export declare const ValueConverter: ValueConverterKind;
//# sourceMappingURL=value-converter.d.ts.map