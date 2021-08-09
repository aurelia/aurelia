import { IExpressionParser } from '@aurelia/runtime';
import { IAttrMapper } from '../attribute-mapper.js';
import { PropertyBindingInstruction } from '../renderer.js';
import type { Constructable, IContainer, IResourceKind, ResourceType, ResourceDefinition, PartialResourceDefinition } from '@aurelia/kernel';
import type { IInstruction } from '../renderer.js';
import type { AttrSyntax } from './attribute-pattern.js';
import type { BindableDefinition } from '../bindable.js';
import type { CustomAttributeDefinition } from './custom-attribute.js';
import type { CustomElementDefinition } from './custom-element.js';
/**
 * Characteristics of a binding command.
 */
export declare const enum CommandType {
    None = 0,
    IgnoreAttr = 1
}
export declare type PartialBindingCommandDefinition = PartialResourceDefinition<{
    readonly type?: string | null;
}>;
export interface IPlainAttrCommandInfo {
    readonly node: Element;
    readonly attr: AttrSyntax;
    readonly bindable: null;
    readonly def: null;
}
export interface IBindableCommandInfo {
    readonly node: Element;
    readonly attr: AttrSyntax;
    readonly bindable: BindableDefinition;
    readonly def: CustomAttributeDefinition | CustomElementDefinition;
}
export declare type ICommandBuildInfo = IPlainAttrCommandInfo | IBindableCommandInfo;
export declare type BindingCommandInstance<T extends {} = {}> = {
    type: CommandType;
    name: string;
    build(info: ICommandBuildInfo): IInstruction;
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
export declare const BindingCommand: Readonly<BindingCommandKind>;
export declare class OneTimeBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.None;
    get name(): string;
    constructor(m: IAttrMapper, xp: IExpressionParser);
    build(info: ICommandBuildInfo): PropertyBindingInstruction;
}
export declare class ToViewBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.None;
    get name(): string;
    constructor(attrMapper: IAttrMapper, exprParser: IExpressionParser);
    build(info: ICommandBuildInfo): PropertyBindingInstruction;
}
export declare class FromViewBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.None;
    get name(): string;
    constructor(m: IAttrMapper, xp: IExpressionParser);
    build(info: ICommandBuildInfo): PropertyBindingInstruction;
}
export declare class TwoWayBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.None;
    get name(): string;
    constructor(m: IAttrMapper, xp: IExpressionParser);
    build(info: ICommandBuildInfo): PropertyBindingInstruction;
}
export declare class DefaultBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.None;
    get name(): string;
    constructor(m: IAttrMapper, xp: IExpressionParser);
    build(info: ICommandBuildInfo): PropertyBindingInstruction;
}
export declare class CallBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.None;
    get name(): string;
    constructor(xp: IExpressionParser);
    build(info: ICommandBuildInfo): IInstruction;
}
export declare class ForBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.None;
    get name(): string;
    constructor(xp: IExpressionParser);
    build(info: ICommandBuildInfo): IInstruction;
}
export declare class TriggerBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.IgnoreAttr;
    get name(): string;
    constructor(xp: IExpressionParser);
    build(info: ICommandBuildInfo): IInstruction;
}
export declare class DelegateBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.IgnoreAttr;
    get name(): string;
    constructor(xp: IExpressionParser);
    build(info: ICommandBuildInfo): IInstruction;
}
export declare class CaptureBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.IgnoreAttr;
    get name(): string;
    constructor(xp: IExpressionParser);
    build(info: ICommandBuildInfo): IInstruction;
}
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
export declare class AttrBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.IgnoreAttr;
    get name(): string;
    constructor(xp: IExpressionParser);
    build(info: ICommandBuildInfo): IInstruction;
}
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
export declare class StyleBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.IgnoreAttr;
    get name(): string;
    constructor(xp: IExpressionParser);
    build(info: ICommandBuildInfo): IInstruction;
}
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
export declare class ClassBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.IgnoreAttr;
    get name(): string;
    constructor(xp: IExpressionParser);
    build(info: ICommandBuildInfo): IInstruction;
}
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
export declare class RefBindingCommand implements BindingCommandInstance {
    readonly type: CommandType.IgnoreAttr;
    get name(): string;
    constructor(xp: IExpressionParser);
    build(info: ICommandBuildInfo): IInstruction;
}
//# sourceMappingURL=binding-command.d.ts.map