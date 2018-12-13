import { ForOfStatement, Interpolation, IsBindingBehavior } from './binding/ast';
import { BindingMode } from './binding/binding-mode';
import { DelegationStrategy } from './binding/event-manager';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateLetElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetBindingInstruction, IListenerBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITargetedInstruction, ITemplateDefinition, ITextBindingInstruction, TargetedInstruction, TargetedInstructionType } from './definitions';
import { INode } from './dom.interfaces';
export declare class TextBindingInstruction implements ITextBindingInstruction {
    type: TargetedInstructionType.textBinding;
    from: string | Interpolation;
    constructor(from: string | Interpolation);
}
export declare class InterpolationInstruction implements IInterpolationInstruction {
    type: TargetedInstructionType.interpolation;
    from: string | Interpolation;
    to: string;
    constructor(from: string | Interpolation, to: string);
}
export declare class OneTimeBindingInstruction implements IPropertyBindingInstruction {
    type: TargetedInstructionType.propertyBinding;
    from: string | IsBindingBehavior;
    mode: BindingMode.oneTime;
    oneTime: true;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class ToViewBindingInstruction implements IPropertyBindingInstruction {
    type: TargetedInstructionType.propertyBinding;
    from: string | IsBindingBehavior;
    mode: BindingMode.toView;
    oneTime: false;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class FromViewBindingInstruction implements IPropertyBindingInstruction {
    type: TargetedInstructionType.propertyBinding;
    from: string | IsBindingBehavior;
    mode: BindingMode.fromView;
    oneTime: false;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class TwoWayBindingInstruction implements IPropertyBindingInstruction {
    type: TargetedInstructionType.propertyBinding;
    from: string | IsBindingBehavior;
    mode: BindingMode.twoWay;
    oneTime: false;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class IteratorBindingInstruction implements IIteratorBindingInstruction {
    type: TargetedInstructionType.iteratorBinding;
    from: string | ForOfStatement;
    to: string;
    constructor(from: string | ForOfStatement, to: string);
}
export declare class TriggerBindingInstruction implements IListenerBindingInstruction {
    type: TargetedInstructionType.listenerBinding;
    from: string | IsBindingBehavior;
    preventDefault: true;
    strategy: DelegationStrategy.none;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class DelegateBindingInstruction implements IListenerBindingInstruction {
    type: TargetedInstructionType.listenerBinding;
    from: string | IsBindingBehavior;
    preventDefault: false;
    strategy: DelegationStrategy.bubbling;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class CaptureBindingInstruction implements IListenerBindingInstruction {
    type: TargetedInstructionType.listenerBinding;
    from: string | IsBindingBehavior;
    preventDefault: false;
    strategy: DelegationStrategy.capturing;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class CallBindingInstruction implements ICallBindingInstruction {
    type: TargetedInstructionType.callBinding;
    from: string | IsBindingBehavior;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class RefBindingInstruction implements IRefBindingInstruction {
    type: TargetedInstructionType.refBinding;
    from: string | IsBindingBehavior;
    constructor(from: string | IsBindingBehavior);
}
export declare class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
    type: TargetedInstructionType.stylePropertyBinding;
    from: string | IsBindingBehavior;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetPropertyInstruction implements ISetPropertyInstruction {
    type: TargetedInstructionType.setProperty;
    to: string;
    value: unknown;
    constructor(value: unknown, to: string);
}
export declare class SetAttributeInstruction implements ITargetedInstruction {
    type: TargetedInstructionType.setAttribute;
    to: string;
    value: string;
    constructor(value: string, to: string);
}
export declare class HydrateElementInstruction implements IHydrateElementInstruction {
    type: TargetedInstructionType.hydrateElement;
    contentOverride?: INode;
    instructions: TargetedInstruction[];
    parts?: Record<string, ITemplateDefinition>;
    res: string;
    constructor(res: string, instructions: TargetedInstruction[], parts?: Record<string, ITemplateDefinition>, contentOverride?: INode);
}
export declare class HydrateAttributeInstruction implements IHydrateAttributeInstruction {
    type: TargetedInstructionType.hydrateAttribute;
    instructions: TargetedInstruction[];
    res: string;
    constructor(res: string, instructions: TargetedInstruction[]);
}
export declare class HydrateTemplateController implements IHydrateTemplateController {
    type: TargetedInstructionType.hydrateTemplateController;
    def: ITemplateDefinition;
    instructions: TargetedInstruction[];
    link?: boolean;
    res: string;
    constructor(def: ITemplateDefinition, res: string, instructions: TargetedInstruction[], link?: boolean);
}
export declare class LetElementInstruction implements IHydrateLetElementInstruction {
    type: TargetedInstructionType.hydrateLetElement;
    instructions: ILetBindingInstruction[];
    toViewModel: boolean;
    constructor(instructions: ILetBindingInstruction[], toViewModel: boolean);
}
export declare class LetBindingInstruction implements ILetBindingInstruction {
    type: TargetedInstructionType.letBinding;
    from: string | IsBindingBehavior | Interpolation;
    to: string;
    constructor(from: string | IsBindingBehavior | Interpolation, to: string);
}
//# sourceMappingURL=instructions.d.ts.map