import { BindingSymbol, IBindingCommand, PlainAttributeSymbol } from '@aurelia/jit';
import { IRegistry } from '@aurelia/kernel';
import { BindingType } from '@aurelia/runtime';
import { HTMLAttributeInstruction } from '@aurelia/runtime-html';
export interface TriggerBindingCommand extends IBindingCommand {
}
/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
export declare class TriggerBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.TriggerCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
export interface DelegateBindingCommand extends IBindingCommand {
}
/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
export declare class DelegateBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.DelegateCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
export interface CaptureBindingCommand extends IBindingCommand {
}
/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
export declare class CaptureBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.CaptureCommand;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
export interface AttrBindingCommand extends IBindingCommand {
}
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
export declare class AttrBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.IsProperty;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
export interface StyleBindingCommand extends IBindingCommand {
}
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
export declare class StyleBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.IsProperty;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
export interface ClassBindingCommand extends IBindingCommand {
}
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
export declare class ClassBindingCommand implements IBindingCommand {
    static readonly register: IRegistry['register'];
    readonly bindingType: BindingType.IsProperty;
    constructor();
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
//# sourceMappingURL=binding-command.d.ts.map