import { Constructable, IContainer, IResourceKind, ResourceType, ResourceDefinition, PartialResourceDefinition } from '@aurelia/kernel';
import { BindingType } from '@aurelia/runtime';
import { IInstruction, AttributeInstruction, RefBindingInstruction } from '../renderer.js';
import { BindingSymbol, PlainAttributeSymbol } from '../semantic-model.js';
export declare type PartialBindingCommandDefinition = PartialResourceDefinition<{
    readonly type?: string | null;
}>;
export declare type BindingCommandInstance<T extends {} = {}> = {
    bindingType: BindingType;
    compile(binding: PlainAttributeSymbol | BindingSymbol): IInstruction;
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
export declare class OneTimeBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.OneTimeCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class ToViewBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.ToViewCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class FromViewBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.FromViewCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class TwoWayBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.TwoWayCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class DefaultBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.BindCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class CallBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.CallCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class ForBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.ForCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class TriggerBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.TriggerCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class DelegateBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.DelegateCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class CaptureBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.CaptureCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
export declare class AttrBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.IsProperty;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
export declare class StyleBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.IsProperty;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
export declare class ClassBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.IsProperty;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
export declare class RefBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.IsProperty | BindingType.IgnoreCustomAttr;
    compile(binding: PlainAttributeSymbol | BindingSymbol): RefBindingInstruction;
}
//# sourceMappingURL=binding-command.d.ts.map