import { Constructable, Immutable, Omit } from '@aurelia/kernel';
import { ForOfStatement, Interpolation, IsBindingBehavior } from './binding/ast';
import { BindingMode } from './binding/binding-mode';
import { DelegationStrategy } from './binding/event-manager';
import { INode } from './dom';
import { ResourceDescription } from './resource';
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
    letElement = "n",
    letBinding = "o",
    renderStrategy = "z"
}
export interface IBuildInstruction {
    required: boolean;
    compiler?: string;
}
export interface ITemplateDefinition {
    name?: string;
    cache?: '*' | number;
    template?: string | INode;
    instructions?: TargetedInstruction[][];
    dependencies?: any[];
    build?: IBuildInstruction;
    surrogates?: TargetedInstruction[];
    bindables?: Record<string, IBindableDescription>;
    containerless?: boolean;
    shadowOptions?: ShadowRootInit;
    hasSlots?: boolean;
}
export declare type TemplateDefinition = ResourceDescription<ITemplateDefinition>;
export declare type TemplatePartDefinitions = Record<string, Immutable<ITemplateDefinition>>;
export declare type BindableDefinitions = Record<string, Immutable<IBindableDescription>>;
export interface IAttributeDefinition {
    name: string;
    defaultBindingMode?: BindingMode;
    aliases?: string[];
    isTemplateController?: boolean;
    bindables?: Record<string, IBindableDescription>;
}
export declare type AttributeDefinition = Immutable<Required<IAttributeDefinition>> | null;
export declare const ITargetedInstruction: import("@aurelia/kernel/dist/di").IDefaultableInterfaceSymbol<ITargetedInstruction>;
export interface ITargetedInstruction {
    type: TargetedInstructionType;
}
export declare type TargetedInstruction = ITextBindingInstruction | IInterpolationInstruction | IPropertyBindingInstruction | IIteratorBindingInstruction | IListenerBindingInstruction | ICallBindingInstruction | IRefBindingInstruction | IStylePropertyBindingInstruction | ISetPropertyInstruction | ISetAttributeInstruction | IHydrateElementInstruction | IHydrateAttributeInstruction | IHydrateTemplateController | IRenderStrategyInstruction | ILetElementInstruction;
export declare function isTargetedInstruction(value: {
    type?: string;
}): value is TargetedInstruction;
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
    value: unknown;
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
export interface IRenderStrategyInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.renderStrategy;
    name: string;
}
export interface ILetElementInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.letElement;
    instructions: ILetBindingInstruction[];
    toViewModel: boolean;
}
export interface ILetBindingInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.letBinding;
    from: string | IsBindingBehavior | Interpolation;
    to: string;
}
declare type CustomElementStaticProperties = Pick<TemplateDefinition, 'containerless' | 'shadowOptions' | 'bindables'>;
declare type CustomAttributeStaticProperties = Pick<AttributeDefinition, 'bindables'>;
export declare type CustomElementConstructor = Constructable & CustomElementStaticProperties;
export declare type CustomAttributeConstructor = Constructable & CustomAttributeStaticProperties;
export declare function buildTemplateDefinition(ctor: CustomElementConstructor, name: string): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: null, def: Immutable<ITemplateDefinition>): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: CustomElementConstructor | null, nameOrDef: string | Immutable<ITemplateDefinition>): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: CustomElementConstructor | null, name: string | null, template: string | INode, cache?: number | '*' | null, build?: IBuildInstruction | boolean | null, bindables?: Record<string, IBindableDescription> | null, instructions?: ReadonlyArray<ReadonlyArray<TargetedInstruction>> | null, dependencies?: ReadonlyArray<unknown> | null, surrogates?: ReadonlyArray<TargetedInstruction> | null, containerless?: boolean | null, shadowOptions?: {
    mode: 'open' | 'closed';
} | null, hasSlots?: boolean | null): TemplateDefinition;
export {};
//# sourceMappingURL=definitions.d.ts.map