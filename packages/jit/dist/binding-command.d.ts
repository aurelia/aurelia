import { Class, IRegistry, IResourceDefinition, IResourceKind, IResourceType } from '@aurelia/kernel';
import { AttributeInstruction, BindingType } from '@aurelia/runtime';
import { BindingSymbol, PlainAttributeSymbol } from './template-binder';
export interface IBindingCommand {
    bindingType: BindingType;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
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
export interface OneTimeBindingCommand extends IBindingCommand {
}
export declare class OneTimeBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.OneTimeCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface ToViewBindingCommand extends IBindingCommand {
}
export declare class ToViewBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.ToViewCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface FromViewBindingCommand extends IBindingCommand {
}
export declare class FromViewBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.FromViewCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface TwoWayBindingCommand extends IBindingCommand {
}
export declare class TwoWayBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.TwoWayCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface DefaultBindingCommand extends IBindingCommand {
}
export declare class DefaultBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.BindCommand;
    $1: typeof OneTimeBindingCommand.prototype.compile;
    $2: typeof ToViewBindingCommand.prototype.compile;
    $4: typeof FromViewBindingCommand.prototype.compile;
    $6: typeof TwoWayBindingCommand.prototype.compile;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface TriggerBindingCommand extends IBindingCommand {
}
export declare class TriggerBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.TriggerCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface DelegateBindingCommand extends IBindingCommand {
}
export declare class DelegateBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.DelegateCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface CaptureBindingCommand extends IBindingCommand {
}
export declare class CaptureBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.CaptureCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export interface CallBindingCommand extends IBindingCommand {
}
export declare class CallBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.CallCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class ForBindingCommand implements IBindingCommand {
    static register: IRegistry['register'];
    bindingType: BindingType.ForCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export {};
//# sourceMappingURL=binding-command.d.ts.map