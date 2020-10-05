import { Constructable, ResourceDefinition, IContainer, IResourceKind } from '@aurelia/kernel';
import { ForOfStatement, Interpolation, IsBindingBehavior } from './binding/ast';
import { BindingMode } from './flags';
import { PartialCustomElementDefinition } from './resources/custom-element';
import { SlotInfo } from './resources/custom-elements/au-slot';
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
export declare type InstructionTypeName = string;
export declare const ITargetedInstruction: import("@aurelia/kernel").InterfaceSymbol<ITargetedInstruction>;
export interface ITargetedInstruction {
    type: InstructionTypeName;
}
export interface IHydrateInstruction extends ITargetedInstruction {
    readonly instructions: readonly ITargetedInstruction[];
}
export declare type NodeInstruction = IHydrateElementInstruction | IHydrateTemplateController | IHydrateLetElementInstruction;
export declare type AttributeInstruction = IInterpolationInstruction | IPropertyBindingInstruction | IIteratorBindingInstruction | ICallBindingInstruction | IRefBindingInstruction | ISetPropertyInstruction | ILetBindingInstruction | IHydrateAttributeInstruction;
export declare type TargetedInstruction = NodeInstruction | AttributeInstruction;
export declare type InstructionRow = [TargetedInstruction, ...AttributeInstruction[]];
export declare function isTargetedInstruction(value: unknown): value is TargetedInstruction;
export interface IInterpolationInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.interpolation;
    from: string | Interpolation;
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
    from: string | ForOfStatement;
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
export interface IHydrateElementInstruction extends IHydrateInstruction {
    type: TargetedInstructionType.hydrateElement;
    res: string;
    instructions: ITargetedInstruction[];
    slotInfo: SlotInfo | null;
}
export interface IHydrateAttributeInstruction extends IHydrateInstruction {
    type: TargetedInstructionType.hydrateAttribute;
    res: string;
    instructions: ITargetedInstruction[];
}
export interface IHydrateTemplateController extends IHydrateInstruction {
    type: TargetedInstructionType.hydrateTemplateController;
    res: string;
    instructions: ITargetedInstruction[];
    def: PartialCustomElementDefinition;
    link?: boolean;
}
export interface IHydrateLetElementInstruction extends IHydrateInstruction {
    type: TargetedInstructionType.hydrateLetElement;
    instructions: ILetBindingInstruction[];
    toBindingContext: boolean;
}
export interface ILetBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.letBinding;
    from: string | IsBindingBehavior | Interpolation;
    to: string;
}
export declare class HooksDefinition {
    static readonly none: Readonly<HooksDefinition>;
    readonly hasCreate: boolean;
    readonly hasBeforeCompile: boolean;
    readonly hasAfterCompile: boolean;
    readonly hasAfterCompileChildren: boolean;
    readonly hasBeforeBind: boolean;
    readonly hasAfterBind: boolean;
    readonly hasAfterAttach: boolean;
    readonly hasAfterAttachChildren: boolean;
    readonly hasBeforeDetach: boolean;
    readonly hasBeforeUnbind: boolean;
    readonly hasAfterUnbind: boolean;
    readonly hasAfterUnbindChildren: boolean;
    readonly hasDispose: boolean;
    readonly hasAccept: boolean;
    constructor(target: object);
}
export declare function alias(...aliases: readonly string[]): (target: Constructable) => void;
export declare function registerAliases(aliases: readonly string[], resource: IResourceKind<Constructable, ResourceDefinition>, key: string, container: IContainer): void;
//# sourceMappingURL=definitions.d.ts.map