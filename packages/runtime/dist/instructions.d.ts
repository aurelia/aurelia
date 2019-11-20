import { IForOfStatement, IInterpolationExpression, IsBindingBehavior } from './ast';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateLetElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetPropertyInstruction, ITargetedInstruction, TargetedInstructionType } from './definitions';
import { BindingMode } from './flags';
import { PartialCustomElementDefinition } from './resources/custom-element';
export declare class InterpolationInstruction implements IInterpolationInstruction {
    from: string | IInterpolationExpression;
    to: string;
    type: TargetedInstructionType.interpolation;
    constructor(from: string | IInterpolationExpression, to: string);
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
    from: string | IForOfStatement;
    to: string;
    type: TargetedInstructionType.iteratorBinding;
    constructor(from: string | IForOfStatement, to: string);
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
    parts?: Record<string, import("@aurelia/kernel").PartialResourceDefinition<{
        readonly cache?: number | "*" | undefined;
        readonly template?: unknown;
        readonly instructions?: readonly (readonly ITargetedInstruction[])[] | undefined;
        readonly dependencies?: readonly import("@aurelia/kernel").Key[] | undefined;
        readonly injectable?: import("./resources/custom-element").InjectableToken<any> | null | undefined;
        readonly needsCompile?: boolean | undefined;
        readonly surrogates?: readonly ITargetedInstruction[] | undefined;
        readonly bindables?: readonly string[] | Record<string, import(".").PartialBindableDefinition> | undefined;
        readonly childrenObservers?: Record<string, import(".").PartialChildrenDefinition<import("./dom").INode>> | undefined;
        readonly containerless?: boolean | undefined;
        readonly isStrictBinding?: boolean | undefined;
        readonly shadowOptions?: {
            mode: "open" | "closed";
        } | null | undefined;
        readonly hasSlots?: boolean | undefined;
        readonly strategy?: import("./flags").BindingStrategy | undefined;
        readonly hooks?: Readonly<import("./definitions").HooksDefinition> | undefined;
        readonly scopeParts?: readonly string[] | undefined;
    }>> | undefined;
    type: TargetedInstructionType.hydrateElement;
    constructor(res: string, instructions: ITargetedInstruction[], parts?: Record<string, import("@aurelia/kernel").PartialResourceDefinition<{
        readonly cache?: number | "*" | undefined;
        readonly template?: unknown;
        readonly instructions?: readonly (readonly ITargetedInstruction[])[] | undefined;
        readonly dependencies?: readonly import("@aurelia/kernel").Key[] | undefined;
        readonly injectable?: import("./resources/custom-element").InjectableToken<any> | null | undefined;
        readonly needsCompile?: boolean | undefined;
        readonly surrogates?: readonly ITargetedInstruction[] | undefined;
        readonly bindables?: readonly string[] | Record<string, import(".").PartialBindableDefinition> | undefined;
        readonly childrenObservers?: Record<string, import(".").PartialChildrenDefinition<import("./dom").INode>> | undefined;
        readonly containerless?: boolean | undefined;
        readonly isStrictBinding?: boolean | undefined;
        readonly shadowOptions?: {
            mode: "open" | "closed";
        } | null | undefined;
        readonly hasSlots?: boolean | undefined;
        readonly strategy?: import("./flags").BindingStrategy | undefined;
        readonly hooks?: Readonly<import("./definitions").HooksDefinition> | undefined;
        readonly scopeParts?: readonly string[] | undefined;
    }>> | undefined);
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
    link?: boolean | undefined;
    parts?: Record<string, import("@aurelia/kernel").PartialResourceDefinition<{
        readonly cache?: number | "*" | undefined;
        readonly template?: unknown;
        readonly instructions?: readonly (readonly ITargetedInstruction[])[] | undefined;
        readonly dependencies?: readonly import("@aurelia/kernel").Key[] | undefined;
        readonly injectable?: import("./resources/custom-element").InjectableToken<any> | null | undefined;
        readonly needsCompile?: boolean | undefined;
        readonly surrogates?: readonly ITargetedInstruction[] | undefined;
        readonly bindables?: readonly string[] | Record<string, import(".").PartialBindableDefinition> | undefined;
        readonly childrenObservers?: Record<string, import(".").PartialChildrenDefinition<import("./dom").INode>> | undefined;
        readonly containerless?: boolean | undefined;
        readonly isStrictBinding?: boolean | undefined;
        readonly shadowOptions?: {
            mode: "open" | "closed";
        } | null | undefined;
        readonly hasSlots?: boolean | undefined;
        readonly strategy?: import("./flags").BindingStrategy | undefined;
        readonly hooks?: Readonly<import("./definitions").HooksDefinition> | undefined;
        readonly scopeParts?: readonly string[] | undefined;
    }>> | undefined;
    type: TargetedInstructionType.hydrateTemplateController;
    constructor(def: PartialCustomElementDefinition, res: string, instructions: ITargetedInstruction[], link?: boolean | undefined, parts?: Record<string, import("@aurelia/kernel").PartialResourceDefinition<{
        readonly cache?: number | "*" | undefined;
        readonly template?: unknown;
        readonly instructions?: readonly (readonly ITargetedInstruction[])[] | undefined;
        readonly dependencies?: readonly import("@aurelia/kernel").Key[] | undefined;
        readonly injectable?: import("./resources/custom-element").InjectableToken<any> | null | undefined;
        readonly needsCompile?: boolean | undefined;
        readonly surrogates?: readonly ITargetedInstruction[] | undefined;
        readonly bindables?: readonly string[] | Record<string, import(".").PartialBindableDefinition> | undefined;
        readonly childrenObservers?: Record<string, import(".").PartialChildrenDefinition<import("./dom").INode>> | undefined;
        readonly containerless?: boolean | undefined;
        readonly isStrictBinding?: boolean | undefined;
        readonly shadowOptions?: {
            mode: "open" | "closed";
        } | null | undefined;
        readonly hasSlots?: boolean | undefined;
        readonly strategy?: import("./flags").BindingStrategy | undefined;
        readonly hooks?: Readonly<import("./definitions").HooksDefinition> | undefined;
        readonly scopeParts?: readonly string[] | undefined;
    }>> | undefined);
}
export declare class LetElementInstruction implements IHydrateLetElementInstruction {
    instructions: ILetBindingInstruction[];
    toBindingContext: boolean;
    type: TargetedInstructionType.hydrateLetElement;
    constructor(instructions: ILetBindingInstruction[], toBindingContext: boolean);
}
export declare class LetBindingInstruction implements ILetBindingInstruction {
    from: string | IsBindingBehavior | IInterpolationExpression;
    to: string;
    type: TargetedInstructionType.letBinding;
    constructor(from: string | IsBindingBehavior | IInterpolationExpression, to: string);
}
//# sourceMappingURL=instructions.d.ts.map