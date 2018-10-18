import { Immutable } from '@aurelia/kernel';
import { ForOfStatement, Interpolation, IsBindingBehavior } from '../binding/ast';
import { BindingMode } from '../binding/binding-mode';
import { DelegationStrategy } from '../binding/event-manager';
import { INode } from '../dom';
import { ResourceDescription } from '../resource';
import { IBindableDescription } from './bindable';
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
export declare const ITargetedInstruction: import("@aurelia/kernel/dist/di").IDefaultableInterfaceSymbol<ITargetedInstruction>;
export interface ITargetedInstruction {
    type: TargetedInstructionType;
}
export declare type TargetedInstruction = ITextBindingInstruction | IInterpolationInstruction | IPropertyBindingInstruction | IIteratorBindingInstruction | IListenerBindingInstruction | ICallBindingInstruction | IRefBindingInstruction | IStylePropertyBindingInstruction | ISetPropertyInstruction | ISetAttributeInstruction | IHydrateElementInstruction | IHydrateAttributeInstruction | IHydrateTemplateController | IRenderStrategyInstruction | ILetElementInstruction;
export declare function isTargetedInstruction(value: any): value is TargetedInstruction;
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
    value: any;
    to: string;
}
export interface ISetAttributeInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.setAttribute;
    value: any;
    to: string;
}
export interface IHydrateElementInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateElement;
    res: any;
    instructions: TargetedInstruction[];
    parts?: Record<string, ITemplateDefinition>;
}
export interface IHydrateAttributeInstruction extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateAttribute;
    res: any;
    instructions: TargetedInstruction[];
}
export interface IHydrateTemplateController extends ITargetedInstruction {
    type: TargetedInstructionType.hydrateTemplateController;
    res: any;
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
//# sourceMappingURL=instructions.d.ts.map