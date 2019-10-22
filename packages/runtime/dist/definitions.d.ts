import { Constructable, ResourceDefinition, IContainer, IResourceKind } from '@aurelia/kernel';
import { IForOfStatement, IInterpolationExpression, IsBindingBehavior } from './ast';
import { BindingMode } from './flags';
import { PartialCustomElementDefinition, CustomElementDefinition } from './resources/custom-element';
/**
 * TargetedInstructionType enum values become the property names for the associated renderers when they are injected
 * into the `Renderer`.
 *
 * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
 *
 * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
 * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
 */
export declare const enum TargetedInstructionType {
    hydrateElement = "ra",
    hydrateAttribute = "rb",
    hydrateTemplateController = "rc",
    hydrateLetElement = "rd",
    setProperty = "re",
    interpolation = "rf",
    propertyBinding = "rg",
    callBinding = "rh",
    letBinding = "ri",
    refBinding = "rj",
    iteratorBinding = "rk"
}
export declare type PartialCustomElementDefinitionParts = Record<string, PartialCustomElementDefinition>;
export declare type CustomElementDefinitionParts = Record<string, CustomElementDefinition>;
export declare type InstructionTypeName = string;
export declare const ITargetedInstruction: import("@aurelia/kernel").InterfaceSymbol<ITargetedInstruction>;
export interface ITargetedInstruction {
    type: InstructionTypeName;
}
export declare type NodeInstruction = IHydrateElementInstruction | IHydrateTemplateController | IHydrateLetElementInstruction;
export declare type AttributeInstruction = IInterpolationInstruction | IPropertyBindingInstruction | IIteratorBindingInstruction | ICallBindingInstruction | IRefBindingInstruction | ISetPropertyInstruction | ILetBindingInstruction | IHydrateAttributeInstruction;
export declare type TargetedInstruction = NodeInstruction | AttributeInstruction;
export declare type InstructionRow = [TargetedInstruction, ...AttributeInstruction[]];
export declare function isTargetedInstruction(value: unknown): value is TargetedInstruction;
export interface IInterpolationInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.interpolation;
    from: string | IInterpolationExpression;
    to: string;
}
export interface IPropertyBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.propertyBinding;
    mode: BindingMode;
    from: string | IsBindingBehavior;
    to: string;
    oneTime?: boolean;
}
export interface IIteratorBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.iteratorBinding;
    from: string | IForOfStatement;
    to: string;
}
export interface ICallBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.callBinding;
    from: string | IsBindingBehavior;
    to: string;
}
export interface IRefBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.refBinding;
    from: string | IsBindingBehavior;
    to: string;
}
export interface ISetPropertyInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.setProperty;
    value: unknown;
    to: string;
}
export interface IHydrateElementInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateElement;
    res: string;
    instructions: ITargetedInstruction[];
    parts?: Record<string, PartialCustomElementDefinition>;
}
export interface IHydrateAttributeInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateAttribute;
    res: string;
    instructions: ITargetedInstruction[];
}
export interface IHydrateTemplateController extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateTemplateController;
    res: string;
    instructions: ITargetedInstruction[];
    def: PartialCustomElementDefinition;
    link?: boolean;
    parts?: Record<string, PartialCustomElementDefinition>;
}
export interface IHydrateLetElementInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateLetElement;
    instructions: ILetBindingInstruction[];
    toBindingContext: boolean;
}
export interface ILetBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.letBinding;
    from: string | IsBindingBehavior | IInterpolationExpression;
    to: string;
}
export declare class HooksDefinition {
    static readonly none: Readonly<HooksDefinition>;
    readonly hasRender: boolean;
    readonly hasCreated: boolean;
    readonly hasBinding: boolean;
    readonly hasBound: boolean;
    readonly hasUnbinding: boolean;
    readonly hasUnbound: boolean;
    readonly hasAttaching: boolean;
    readonly hasAttached: boolean;
    readonly hasDetaching: boolean;
    readonly hasDetached: boolean;
    readonly hasCaching: boolean;
    constructor(target: object);
}
export declare function alias(...aliases: readonly string[]): (target: Constructable<{}>) => void;
export declare function registerAliases(aliases: readonly string[], resource: IResourceKind<Constructable, ResourceDefinition>, key: string, container: IContainer): void;
//# sourceMappingURL=definitions.d.ts.map