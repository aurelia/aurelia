import { BindingSymbol, IBindingCommand, PlainAttributeSymbol } from '@aurelia/jit';
import { IRegistry } from '@aurelia/kernel';
import { BindingType } from '@aurelia/runtime';
import { HTMLAttributeInstruction } from '@aurelia/runtime-html';
export interface TriggerBindingCommand extends IBindingCommand {
}
export declare class TriggerBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.TriggerCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
export interface DelegateBindingCommand extends IBindingCommand {
}
export declare class DelegateBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.DelegateCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
export interface CaptureBindingCommand extends IBindingCommand {
}
export declare class CaptureBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.CaptureCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
//# sourceMappingURL=binding-command.d.ts.map