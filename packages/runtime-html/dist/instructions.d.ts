import { DelegationStrategy, IInterpolationExpression, IsBindingBehavior, ITargetedInstruction } from '@aurelia/runtime';
import { HTMLTargetedInstructionType, IAttributeBindingInstruction, IListenerBindingInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction } from './definitions';
export declare class TextBindingInstruction implements ITextBindingInstruction {
    type: HTMLTargetedInstructionType.textBinding;
    from: string | IInterpolationExpression;
    constructor(from: string | IInterpolationExpression);
}
export declare class TriggerBindingInstruction implements IListenerBindingInstruction {
    type: HTMLTargetedInstructionType.listenerBinding;
    from: string | IsBindingBehavior;
    preventDefault: true;
    strategy: DelegationStrategy.none;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class DelegateBindingInstruction implements IListenerBindingInstruction {
    type: HTMLTargetedInstructionType.listenerBinding;
    from: string | IsBindingBehavior;
    preventDefault: false;
    strategy: DelegationStrategy.bubbling;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class CaptureBindingInstruction implements IListenerBindingInstruction {
    type: HTMLTargetedInstructionType.listenerBinding;
    from: string | IsBindingBehavior;
    preventDefault: false;
    strategy: DelegationStrategy.capturing;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
    type: HTMLTargetedInstructionType.stylePropertyBinding;
    from: string | IsBindingBehavior;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetAttributeInstruction implements ITargetedInstruction {
    type: HTMLTargetedInstructionType.setAttribute;
    to: string;
    value: string;
    constructor(value: string, to: string);
}
export declare class SetClassAttributeInstruction implements ITargetedInstruction {
    readonly type: HTMLTargetedInstructionType.setClassAttribute;
    readonly value: string;
    constructor(value: string);
}
export declare class SetStyleAttributeInstruction implements ITargetedInstruction {
    readonly type: HTMLTargetedInstructionType.setStyleAttribute;
    readonly value: string;
    constructor(value: string);
}
export declare class AttributeBindingInstruction implements IAttributeBindingInstruction {
    type: HTMLTargetedInstructionType.attributeBinding;
    from: string | IsBindingBehavior;
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr: string;
    to: string;
    constructor(attr: string, from: string | IsBindingBehavior, to: string);
}
//# sourceMappingURL=instructions.d.ts.map