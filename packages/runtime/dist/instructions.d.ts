import { IForOfStatement, IInterpolationExpression, IsBindingBehavior } from './ast';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateLetElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetPropertyInstruction, ITargetedInstruction, TargetedInstructionType, PartialCustomElementDefinitionParts } from './definitions';
import { BindingMode } from './flags';
import { PartialCustomElementDefinition } from './resources/custom-element';
export declare class InterpolationInstruction implements IInterpolationInstruction {
    type: TargetedInstructionType.interpolation;
    from: string | IInterpolationExpression;
    to: string;
    constructor(from: string | IInterpolationExpression, to: string);
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
    from: string | IForOfStatement;
    to: string;
    constructor(from: string | IForOfStatement, to: string);
}
export declare class CallBindingInstruction implements ICallBindingInstruction {
    type: TargetedInstructionType.callBinding;
    from: string | IsBindingBehavior;
    to: string;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class RefBindingInstruction implements IRefBindingInstruction {
    readonly from: string | IsBindingBehavior;
    readonly to: string;
    type: TargetedInstructionType.refBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetPropertyInstruction implements ISetPropertyInstruction {
    type: TargetedInstructionType.setProperty;
    to: string;
    value: unknown;
    constructor(value: unknown, to: string);
}
export declare class HydrateElementInstruction implements IHydrateElementInstruction {
    type: TargetedInstructionType.hydrateElement;
    instructions: ITargetedInstruction[];
    parts?: PartialCustomElementDefinitionParts;
    res: string;
    constructor(res: string, instructions: ITargetedInstruction[], parts?: PartialCustomElementDefinitionParts);
}
export declare class HydrateAttributeInstruction implements IHydrateAttributeInstruction {
    type: TargetedInstructionType.hydrateAttribute;
    instructions: ITargetedInstruction[];
    res: string;
    constructor(res: string, instructions: ITargetedInstruction[]);
}
export declare class HydrateTemplateController implements IHydrateTemplateController {
    type: TargetedInstructionType.hydrateTemplateController;
    def: PartialCustomElementDefinition;
    instructions: ITargetedInstruction[];
    link?: boolean;
    parts?: PartialCustomElementDefinitionParts;
    res: string;
    constructor(def: PartialCustomElementDefinition, res: string, instructions: ITargetedInstruction[], link?: boolean, parts?: PartialCustomElementDefinitionParts);
}
export declare class LetElementInstruction implements IHydrateLetElementInstruction {
    type: TargetedInstructionType.hydrateLetElement;
    instructions: ILetBindingInstruction[];
    toBindingContext: boolean;
    constructor(instructions: ILetBindingInstruction[], toBindingContext: boolean);
}
export declare class LetBindingInstruction implements ILetBindingInstruction {
    type: TargetedInstructionType.letBinding;
    from: string | IsBindingBehavior | IInterpolationExpression;
    to: string;
    constructor(from: string | IsBindingBehavior | IInterpolationExpression, to: string);
}
//# sourceMappingURL=instructions.d.ts.map