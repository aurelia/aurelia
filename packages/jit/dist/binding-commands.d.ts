import { AttributeInstruction, BindingType } from '@aurelia/runtime';
import { BindingCommandInstance } from './binding-command';
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
//# sourceMappingURL=binding-commands.d.ts.map