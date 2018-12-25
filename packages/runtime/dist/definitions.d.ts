import { Immutable, IRegistry, IResourceDefinition, Omit, ResourceDescription, ResourcePartDescription } from '@aurelia/kernel';
import { ForOfStatement, Interpolation, IsBindingBehavior } from './binding/ast';
import { BindingMode } from './binding/binding-mode';
import { IShadowRootInit } from './dom.interfaces';
import { DelegationStrategy } from './observation/event-manager';
import { CustomElementConstructor } from './resources/custom-element';
export declare type BindableSource = Omit<IBindableDescription, 'property'>;
export interface IBindableDescription {
    mode?: BindingMode;
    callback?: string;
    attribute?: string;
    property?: string;
}
export declare const enum TargetedInstructionType {
    textBinding = "a",
    interpolation = "b",
    propertyBinding = "c",
    iteratorBinding = "d",
    listenerBinding = "e",
    callBinding = "f",
    refBinding = "g",
    stylePropertyBinding = "h",
    setProperty = "i",
    setAttribute = "j",
    hydrateElement = "k",
    hydrateAttribute = "l",
    hydrateTemplateController = "m",
    hydrateLetElement = "n",
    letBinding = "o"
}
export interface IBuildInstruction {
    required: boolean;
    compiler?: string;
}
export interface ITemplateDefinition extends IResourceDefinition {
    cache?: '*' | number;
    template?: unknown;
    instructions?: TargetedInstruction[][];
    dependencies?: IRegistry[];
    build?: IBuildInstruction;
    surrogates?: TargetedInstruction[];
    bindables?: Record<string, IBindableDescription>;
    containerless?: boolean;
    shadowOptions?: IShadowRootInit;
    hasSlots?: boolean;
}
export declare type TemplateDefinition = ResourceDescription<ITemplateDefinition>;
export declare type TemplatePartDefinitions = Record<string, ResourcePartDescription<ITemplateDefinition>>;
export declare type BindableDefinitions = Record<string, Immutable<IBindableDescription>>;
export interface IAttributeDefinition extends IResourceDefinition {
    defaultBindingMode?: BindingMode;
    aliases?: string[];
    isTemplateController?: boolean;
    hasDynamicOptions?: boolean;
    bindables?: Record<string, IBindableDescription>;
}
export declare type AttributeDefinition = Immutable<Required<IAttributeDefinition>> | null;
export declare const ITargetedInstruction: import("@aurelia/kernel").IDefaultableInterfaceSymbol<ITargetedInstruction>;
export interface ITargetedInstruction {
    type: TargetedInstructionType;
}
export declare type NodeInstruction = ITextBindingInstruction | IHydrateElementInstruction | IHydrateTemplateController | IHydrateLetElementInstruction;
export declare type AttributeInstruction = IInterpolationInstruction | IPropertyBindingInstruction | IIteratorBindingInstruction | IListenerBindingInstruction | ICallBindingInstruction | IRefBindingInstruction | IStylePropertyBindingInstruction | ISetPropertyInstruction | ISetAttributeInstruction | ILetBindingInstruction | IHydrateAttributeInstruction;
export declare type TargetedInstruction = NodeInstruction | AttributeInstruction;
export declare type InstructionRow = [TargetedInstruction, ...AttributeInstruction[]];
export declare function isTargetedInstruction(value: unknown): value is TargetedInstruction;
export interface ITextBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.textBinding;
    from: string | Interpolation;
}
export interface IInterpolationInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.interpolation;
    from: string | Interpolation;
    to: string;
}
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
export interface IListenerBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.listenerBinding;
    from: string | IsBindingBehavior;
    to: string;
    strategy: DelegationStrategy;
    preventDefault: boolean;
}
export interface ICallBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.callBinding;
    from: string | IsBindingBehavior;
    to: string;
}
export interface IRefBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.refBinding;
    from: string | IsBindingBehavior;
}
export interface IStylePropertyBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.stylePropertyBinding;
    from: string | IsBindingBehavior;
    to: string;
}
export interface ISetPropertyInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.setProperty;
    value: unknown;
    to: string;
}
export interface ISetAttributeInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.setAttribute;
    value: string;
    to: string;
}
export interface IHydrateElementInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateElement;
    res: string;
    instructions: TargetedInstruction[];
    parts?: Record<string, ITemplateDefinition>;
}
export interface IHydrateAttributeInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateAttribute;
    res: string;
    instructions: TargetedInstruction[];
}
export interface IHydrateTemplateController extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateTemplateController;
    res: string;
    instructions: TargetedInstruction[];
    def: ITemplateDefinition;
    link?: boolean;
}
export interface IHydrateLetElementInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateLetElement;
    instructions: ILetBindingInstruction[];
    toViewModel: boolean;
}
export interface ILetBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.letBinding;
    from: string | IsBindingBehavior | Interpolation;
    to: string;
}
export declare function buildTemplateDefinition(ctor: CustomElementConstructor, name: string): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: null, def: Immutable<ITemplateDefinition>): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: CustomElementConstructor | null, nameOrDef: string | Immutable<ITemplateDefinition>): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: CustomElementConstructor | null, name: string | null, template: unknown, cache?: number | '*' | null, build?: IBuildInstruction | boolean | null, bindables?: Record<string, IBindableDescription> | null, instructions?: ReadonlyArray<ReadonlyArray<TargetedInstruction>> | null, dependencies?: ReadonlyArray<unknown> | null, surrogates?: ReadonlyArray<TargetedInstruction> | null, containerless?: boolean | null, shadowOptions?: {
    mode: 'open' | 'closed';
} | null, hasSlots?: boolean | null): TemplateDefinition;
//# sourceMappingURL=definitions.d.ts.map