import { IExpressionParser } from '@aurelia/runtime';
import { IAttrMapper } from '../compiler/attribute-mapper';
import { PropertyBindingInstruction } from '../renderer';
import type { Constructable, IContainer, IResourceKind, ResourceType, ResourceDefinition, PartialResourceDefinition } from '@aurelia/kernel';
import type { IInstruction } from '../renderer';
import { AttrSyntax, IAttributeParser } from './attribute-pattern';
import type { BindableDefinition } from '../bindable';
import type { CustomAttributeDefinition } from './custom-attribute';
import type { CustomElementDefinition } from './custom-element';
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
    build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): IInstruction;
} & T;
export declare type BindingCommandType<T extends Constructable = Constructable> = ResourceType<T, BindingCommandInstance, PartialBindingCommandDefinition>;
export declare type BindingCommandKind = IResourceKind<BindingCommandType, BindingCommandDefinition> & {
    define<T extends Constructable>(name: string, Type: T): BindingCommandType<T>;
    define<T extends Constructable>(def: PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
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
    get type(): CommandType.None;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class ToViewBindingCommand implements BindingCommandInstance {
    get type(): CommandType.None;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class FromViewBindingCommand implements BindingCommandInstance {
    get type(): CommandType.None;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class TwoWayBindingCommand implements BindingCommandInstance {
    get type(): CommandType.None;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class DefaultBindingCommand implements BindingCommandInstance {
    get type(): CommandType.None;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class ForBindingCommand implements BindingCommandInstance {
    get type(): CommandType.None;
    static get inject(): unknown[];
    constructor(attrParser: IAttributeParser);
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
export declare class TriggerBindingCommand implements BindingCommandInstance {
    get type(): CommandType.IgnoreAttr;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
export declare class CaptureBindingCommand implements BindingCommandInstance {
    get type(): CommandType.IgnoreAttr;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
export declare class AttrBindingCommand implements BindingCommandInstance {
    get type(): CommandType.IgnoreAttr;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
export declare class StyleBindingCommand implements BindingCommandInstance {
    get type(): CommandType.IgnoreAttr;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
export declare class ClassBindingCommand implements BindingCommandInstance {
    get type(): CommandType.IgnoreAttr;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
export declare class RefBindingCommand implements BindingCommandInstance {
    get type(): CommandType.IgnoreAttr;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
export declare class SpreadBindingCommand implements BindingCommandInstance {
    get type(): CommandType.IgnoreAttr;
    build(_info: ICommandBuildInfo): IInstruction;
}
//# sourceMappingURL=binding-command.d.ts.map