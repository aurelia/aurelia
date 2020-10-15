import { ForOfStatement, Interpolation, IsBindingBehavior } from './binding/ast';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateLetElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetPropertyInstruction, ITargetedInstruction, TargetedInstructionType } from './definitions';
import { BindingMode } from './flags';
import { PartialCustomElementDefinition } from './resources/custom-element';
import { SlotInfo } from './resources/custom-elements/au-slot';
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
    mode: BindingMode.oneTime;
    oneTime: true;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class ToViewBindingInstruction implements IPropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.propertyBinding;
    mode: BindingMode.toView;
    oneTime: false;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class FromViewBindingInstruction implements IPropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.propertyBinding;
    mode: BindingMode.fromView;
    oneTime: false;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class TwoWayBindingInstruction implements IPropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.propertyBinding;
    mode: BindingMode.twoWay;
    oneTime: false;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class IteratorBindingInstruction implements IIteratorBindingInstruction {
    from: string | ForOfStatement;
    to: string;
    type: TargetedInstructionType.iteratorBinding;
    constructor(from: string | ForOfStatement, to: string);
}
export declare class CallBindingInstruction implements ICallBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: TargetedInstructionType.callBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class RefBindingInstruction implements IRefBindingInstruction {
    readonly from: string | IsBindingBehavior;
    readonly to: string;
    type: TargetedInstructionType.refBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetPropertyInstruction implements ISetPropertyInstruction {
    value: unknown;
    to: string;
    type: TargetedInstructionType.setProperty;
    constructor(value: unknown, to: string);
}
export declare class HydrateElementInstruction implements IHydrateElementInstruction {
    res: string;
    instructions: ITargetedInstruction[];
    slotInfo: SlotInfo | null;
    type: TargetedInstructionType.hydrateElement;
    constructor(res: string, instructions: ITargetedInstruction[], slotInfo: SlotInfo | null);
}
export declare class HydrateAttributeInstruction implements IHydrateAttributeInstruction {
    res: string;
    instructions: ITargetedInstruction[];
    type: TargetedInstructionType.hydrateAttribute;
    constructor(res: string, instructions: ITargetedInstruction[]);
}
export declare class HydrateTemplateController implements IHydrateTemplateController {
    def: PartialCustomElementDefinition;
    res: string;
    instructions: ITargetedInstruction[];
    type: TargetedInstructionType.hydrateTemplateController;
    constructor(def: PartialCustomElementDefinition, res: string, instructions: ITargetedInstruction[]);
}
export declare class LetElementInstruction implements IHydrateLetElementInstruction {
    instructions: ILetBindingInstruction[];
    toBindingContext: boolean;
    type: TargetedInstructionType.hydrateLetElement;
    constructor(instructions: ILetBindingInstruction[], toBindingContext: boolean);
}
export declare class LetBindingInstruction implements ILetBindingInstruction {
    from: string | IsBindingBehavior | Interpolation;
    to: string;
    type: TargetedInstructionType.letBinding;
    constructor(from: string | IsBindingBehavior | Interpolation, to: string);
}
//# sourceMappingURL=instructions.d.ts.map