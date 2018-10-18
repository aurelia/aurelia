import { BindingMode, DelegationStrategy, ForOfStatement, ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetBindingInstruction, ILetElementInstruction, IListenerBindingInstruction, INode, Interpolation, IPropertyBindingInstruction, IRefBindingInstruction, IsBindingBehavior, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITargetedInstruction, ITemplateDefinition, ITextBindingInstruction, TargetedInstruction, TargetedInstructionType } from '@aurelia/runtime';
export declare class TextBindingInstruction implements ITextBindingInstruction {
    from: string | Interpolation;
    type: TargetedInstructionType.textBinding;
    constructor(from: string | Interpolation);
}
export declare class InterpolationInstruction implements IInterpolationInstruction {
    from: string | Interpolation;
    to: string;
    type: TargetedInstructionType.interpolation;
    constructor(from: string | Interpolation, to: string);
}
export declare class OneTimeBindingInstruction implements IPropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.propertyBinding;
    oneTime: true;
    mode: BindingMode.oneTime;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class ToViewBindingInstruction implements IPropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.propertyBinding;
    oneTime: false;
    mode: BindingMode.toView;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class FromViewBindingInstruction implements IPropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.propertyBinding;
    oneTime: false;
    mode: BindingMode.fromView;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class TwoWayBindingInstruction implements IPropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.propertyBinding;
    oneTime: false;
    mode: BindingMode.twoWay;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class IteratorBindingInstruction implements IIteratorBindingInstruction {
    from: string | ForOfStatement;
    to: string;
    type: TargetedInstructionType.iteratorBinding;
    constructor(from: string | ForOfStatement, to: string);
}
export declare class TriggerBindingInstruction implements IListenerBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.listenerBinding;
    strategy: DelegationStrategy.none;
    preventDefault: true;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class DelegateBindingInstruction implements IListenerBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.listenerBinding;
    strategy: DelegationStrategy.bubbling;
    preventDefault: false;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class CaptureBindingInstruction implements IListenerBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.listenerBinding;
    strategy: DelegationStrategy.capturing;
    preventDefault: false;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class CallBindingInstruction implements ICallBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.callBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class RefBindingInstruction implements IRefBindingInstruction {
    from: string | IsBindingBehavior;
    type: TargetedInstructionType.refBinding;
    constructor(from: string | IsBindingBehavior);
}
export declare class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.stylePropertyBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetPropertyInstruction implements ISetPropertyInstruction {
    value: any;
    to: string;
    type: TargetedInstructionType.setProperty;
    constructor(value: any, to: string);
}
export declare class SetAttributeInstruction implements ITargetedInstruction {
    value: any;
    to: string;
    type: TargetedInstructionType.setAttribute;
    constructor(value: any, to: string);
}
export declare class HydrateElementInstruction implements IHydrateElementInstruction {
    res: any;
    instructions: TargetedInstruction[];
    parts?: Record<string, ITemplateDefinition>;
    contentOverride?: INode;
    type: TargetedInstructionType.hydrateElement;
    constructor(res: any, instructions: TargetedInstruction[], parts?: Record<string, ITemplateDefinition>, contentOverride?: INode);
}
export declare class HydrateAttributeInstruction implements IHydrateAttributeInstruction {
    res: any;
    instructions: TargetedInstruction[];
    type: TargetedInstructionType.hydrateAttribute;
    constructor(res: any, instructions: TargetedInstruction[]);
}
export declare class HydrateTemplateController implements IHydrateTemplateController {
    def: ITemplateDefinition;
    res: any;
    instructions: TargetedInstruction[];
    link?: boolean;
    type: TargetedInstructionType.hydrateTemplateController;
    constructor(def: ITemplateDefinition, res: any, instructions: TargetedInstruction[], link?: boolean);
}
export declare class LetElementInstruction implements ILetElementInstruction {
    instructions: ILetBindingInstruction[];
    toViewModel: boolean;
    type: TargetedInstructionType.letElement;
    constructor(instructions: ILetBindingInstruction[], toViewModel: boolean);
}
export declare class LetBindingInstruction implements ILetBindingInstruction {
    from: string | IsBindingBehavior | Interpolation;
    to: string;
    type: TargetedInstructionType.letBinding;
    constructor(from: string | IsBindingBehavior | Interpolation, to: string);
}
//# sourceMappingURL=instructions.d.ts.map