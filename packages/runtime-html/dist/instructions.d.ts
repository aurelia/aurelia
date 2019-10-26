import { DelegationStrategy, IInterpolationExpression, IsBindingBehavior, ITargetedInstruction } from '@aurelia/runtime';
import { HTMLTargetedInstructionType, IAttributeBindingInstruction, IListenerBindingInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction } from './definitions';
export declare class TextBindingInstruction implements ITextBindingInstruction {
    from: string | IInterpolationExpression;
    type: HTMLTargetedInstructionType.textBinding;
    constructor(from: string | IInterpolationExpression);
}
export declare class TriggerBindingInstruction implements IListenerBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: HTMLTargetedInstructionType.listenerBinding;
    preventDefault: true;
    strategy: DelegationStrategy.none;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class DelegateBindingInstruction implements IListenerBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: HTMLTargetedInstructionType.listenerBinding;
    preventDefault: false;
    strategy: DelegationStrategy.bubbling;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class CaptureBindingInstruction implements IListenerBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: HTMLTargetedInstructionType.listenerBinding;
    preventDefault: false;
    strategy: DelegationStrategy.capturing;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: HTMLTargetedInstructionType.stylePropertyBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetAttributeInstruction implements ITargetedInstruction {
    value: string;
    to: string;
    type: HTMLTargetedInstructionType.setAttribute;
    constructor(value: string, to: string);
}
export declare class SetClassAttributeInstruction implements ITargetedInstruction {
    readonly value: string;
    readonly type: HTMLTargetedInstructionType.setClassAttribute;
    constructor(value: string);
}
export declare class SetStyleAttributeInstruction implements ITargetedInstruction {
    readonly value: string;
    readonly type: HTMLTargetedInstructionType.setStyleAttribute;
    constructor(value: string);
}
export declare class AttributeBindingInstruction implements IAttributeBindingInstruction {
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr: string;
    from: string | IsBindingBehavior;
    to: string;
    type: HTMLTargetedInstructionType.attributeBinding;
    constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr: string, from: string | IsBindingBehavior, to: string);
}
//# sourceMappingURL=instructions.d.ts.map