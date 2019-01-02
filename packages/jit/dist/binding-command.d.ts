import { Class, IRegistry, IResourceDefinition, IResourceKind, IResourceType } from '@aurelia/kernel';
import { AttributeInstruction, BindingMode, BindingType, ITargetedInstruction } from '@aurelia/runtime';
import { BindingSymbol, PlainAttributeSymbol } from './semantic-model';
export interface IBindingCommand {
    bindingType: BindingType;
    compile(binding: PlainAttributeSymbol | BindingSymbol): ITargetedInstruction;
}
export interface IBindingCommandDefinition extends IResourceDefinition {
}
export interface IBindingCommandType extends IResourceType<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>> {
}
export interface IBindingCommandResource extends IResourceKind<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>> {
}
declare type BindingCommandDecorator = <TProto, TClass>(target: Class<TProto, TClass> & Partial<IBindingCommandType>) => Class<TProto, TClass> & IBindingCommandType;
export declare function bindingCommand(name: string): BindingCommandDecorator;
export declare function bindingCommand(definition: IBindingCommandDefinition): BindingCommandDecorator;
export declare const BindingCommandResource: IBindingCommandResource;
export declare function getTarget(binding: PlainAttributeSymbol | BindingSymbol, camelCase: boolean): string;
export declare function getMode(binding: PlainAttributeSymbol | BindingSymbol): BindingMode;
export interface OneTimeBindingCommand extends IBindingCommand {
}
export declare class OneTimeBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.OneTimeCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface ToViewBindingCommand extends IBindingCommand {
}
export declare class ToViewBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.ToViewCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface FromViewBindingCommand extends IBindingCommand {
}
export declare class FromViewBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.FromViewCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface TwoWayBindingCommand extends IBindingCommand {
}
export declare class TwoWayBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.TwoWayCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface DefaultBindingCommand extends IBindingCommand {
}
export declare class DefaultBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.BindCommand;
    readonly $1: typeof OneTimeBindingCommand.prototype.compile;
    readonly $2: typeof ToViewBindingCommand.prototype.compile;
    readonly $4: typeof FromViewBindingCommand.prototype.compile;
    readonly $6: typeof TwoWayBindingCommand.prototype.compile;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface CallBindingCommand extends IBindingCommand {
}
export declare class CallBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.CallCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface ForBindingCommand extends IBindingCommand {
}
export declare class ForBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.ForCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export {};
//# sourceMappingURL=binding-command.d.ts.map