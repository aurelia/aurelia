import { AttributeInstruction, BindingType } from '@aurelia/runtime';
import { IBindingCommand } from './binding-command';
import { BindingSymbol, PlainAttributeSymbol } from './semantic-model';
export declare class OneTimeBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.OneTimeCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class ToViewBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.ToViewCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class FromViewBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.FromViewCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class TwoWayBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.TwoWayCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class DefaultBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.BindCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class CallBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.CallCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
export declare class ForBindingCommand implements IBindingCommand {
    readonly bindingType: BindingType.ForCommand;
    compile(binding: PlainAttributeSymbol | BindingSymbol): AttributeInstruction;
}
//# sourceMappingURL=binding-commands.d.ts.map