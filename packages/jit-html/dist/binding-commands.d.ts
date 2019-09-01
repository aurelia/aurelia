import { BindingSymbol, IBindingCommand, PlainAttributeSymbol } from '@aurelia/jit';
import { BindingType, RefBindingInstruction } from '@aurelia/runtime';
import { HTMLAttributeInstruction } from '@aurelia/runtime-html';
/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
export declare class TriggerBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.TriggerCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
export declare class DelegateBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.DelegateCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
export declare class CaptureBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.CaptureCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
export declare class AttrBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.IsProperty;
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
export declare class StyleBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.IsProperty;
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
export declare class ClassBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.IsProperty;
    compile(binding: PlainAttributeSymbol | BindingSymbol): HTMLAttributeInstruction;
}
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
export declare class RefBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.IsProperty | BindingType.IgnoreCustomAttr;
    compile(binding: PlainAttributeSymbol | BindingSymbol): RefBindingInstruction;
}
//# sourceMappingURL=binding-commands.d.ts.map