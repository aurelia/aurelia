import { Constructable, IContainer, IResourceKind, ResourceType, ResourceDefinition, PartialResourceDefinition } from '@aurelia/kernel';
import { BindingType, ITargetedInstruction } from '@aurelia/runtime';
import { BindingSymbol, PlainAttributeSymbol } from './semantic-model';
export declare type PartialBindingCommandDefinition = PartialResourceDefinition<{
    readonly type?: string | null;
}>;
export declare type BindingCommandInstance<T extends {} = {}> = {
    bindingType: BindingType;
    compile(binding: PlainAttributeSymbol | BindingSymbol): ITargetedInstruction;
} & T;
export declare type BindingCommandType<T extends Constructable = Constructable> = ResourceType<T, BindingCommandInstance, PartialBindingCommandDefinition>;
export declare type BindingCommandKind = IResourceKind<BindingCommandType, BindingCommandDefinition> & {
    isType<T>(value: T): value is (T extends Constructable ? BindingCommandType<T> : never);
    define<T extends Constructable>(name: string, Type: T): BindingCommandType<T>;
    define<T extends Constructable>(def: PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
    getDefinition<T extends Constructable>(Type: T): BindingCommandDefinition<T>;
    annotate<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K, value: PartialBindingCommandDefinition[K]): void;
    getAnnotation<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K): PartialBindingCommandDefinition[K];
};
export declare type BindingCommandDecorator = <T extends Constructable>(Type: T) => BindingCommandType<T>;
export declare function bindingCommand(name: string): BindingCommandDecorator;
export declare function bindingCommand(definition: PartialBindingCommandDefinition): BindingCommandDecorator;
export declare class BindingCommandDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, BindingCommandInstance> {
    readonly Type: BindingCommandType<T>;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly key: string;
    readonly type: string | null;
    private constructor();
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: BindingCommandType<T>): BindingCommandDefinition<T>;
    register(container: IContainer): void;
}
export declare const BindingCommand: BindingCommandKind;
export declare function getTarget(binding: PlainAttributeSymbol | BindingSymbol, makeCamelCase: boolean): string;
//# sourceMappingURL=binding-command.d.ts.map