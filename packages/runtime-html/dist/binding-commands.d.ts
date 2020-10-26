import { BindingType } from '@aurelia/runtime';
import { BindingCommandInstance } from './binding-command';
import { AttributeInstruction, RefBindingInstruction } from './instructions';
import { BindingSymbol, PlainAttributeSymbol } from './semantic-model';
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
/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
export declare class TriggerBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.TriggerCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
export declare class DelegateBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.DelegateCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
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
 * Binding command to refer different targets (element, custom element/attribute view models, controller) afterAttachChildren to an element
 */
export declare class RefBindingCommand implements BindingCommandInstance {
    readonly bindingType: BindingType.IsProperty | BindingType.IgnoreCustomAttr;
    compile(binding: PlainAttributeSymbol | BindingSymbol): RefBindingInstruction;
}
//# sourceMappingURL=binding-commands.d.ts.map