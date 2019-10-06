import { Constructable, IResourceDefinition, Key, Omit, ResourceDescription, ResourcePartDescription, IContainer, IResourceKind } from '@aurelia/kernel';
import { IForOfStatement, IInterpolationExpression, IsBindingBehavior } from './ast';
import { INode } from './dom';
import { BindingMode, BindingStrategy } from './flags';
import { IController, IViewModel } from './lifecycle';
import { IElementProjector } from './resources/custom-element';
export declare type IElementHydrationOptions = {
    parts?: Record<string, TemplateDefinition>;
};
export declare type BindableSource = Omit<IBindableDescription, 'property'>;
export interface IBindableDescription {
    mode?: BindingMode;
    callback?: string;
    attribute?: string;
    property?: string;
    primary?: boolean;
}
export interface IChildrenObserverDescription<TNode extends INode = INode> {
    callback?: string;
    property?: string;
    options?: MutationObserverInit;
    query?: (projector: IElementProjector<TNode>) => ArrayLike<TNode>;
    filter?: (node: INode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => boolean;
    map?: (node: INode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => any;
}
export declare type ChildrenObserverSource = Omit<IChildrenObserverDescription, 'property'>;
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
export interface IBuildInstruction {
    required: boolean;
    compiler?: string;
}
export interface ITemplateDefinition extends IResourceDefinition {
    cache?: '*' | number;
    template?: unknown;
    instructions?: ITargetedInstruction[][];
    dependencies?: Key[];
    build?: IBuildInstruction;
    surrogates?: ITargetedInstruction[];
    bindables?: Record<string, IBindableDescription> | string[];
    childrenObservers?: Record<string, IChildrenObserverDescription>;
    containerless?: boolean;
    shadowOptions?: {
        mode: 'open' | 'closed';
    };
    hasSlots?: boolean;
    strategy?: BindingStrategy;
    hooks?: Readonly<HooksDefinition>;
    scopeParts?: readonly string[];
}
export declare type TemplateDefinition = ResourceDescription<ITemplateDefinition>;
export declare type TemplatePartDefinitions = Record<string, ResourcePartDescription<ITemplateDefinition>>;
export declare type BindableDefinitions = Record<string, IBindableDescription>;
export interface IAttributeDefinition extends IResourceDefinition {
    defaultBindingMode?: BindingMode;
    isTemplateController?: boolean;
    hasDynamicOptions?: boolean;
    bindables?: Record<string, IBindableDescription> | string[];
    strategy?: BindingStrategy;
    hooks?: Readonly<HooksDefinition>;
}
export declare type AttributeDefinition = Required<IAttributeDefinition>;
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
    parts?: Record<string, ITemplateDefinition>;
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
    def: ITemplateDefinition;
    link?: boolean;
    parts?: Record<string, ITemplateDefinition>;
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
export declare type CustomElementConstructor = Constructable & {
    containerless?: TemplateDefinition['containerless'];
    shadowOptions?: TemplateDefinition['shadowOptions'];
    bindables?: TemplateDefinition['bindables'];
    aliases?: string[];
    childrenObservers?: TemplateDefinition['childrenObservers'];
};
export declare function buildTemplateDefinition(ctor: CustomElementConstructor, name: string): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: null, def: ITemplateDefinition): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: CustomElementConstructor | null, nameOrDef: string | ITemplateDefinition): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: CustomElementConstructor | null, name: string | null, template: unknown, cache?: number | '*' | null, build?: IBuildInstruction | boolean | null, bindables?: Record<string, IBindableDescription> | null, instructions?: readonly (readonly ITargetedInstruction[])[] | null, dependencies?: readonly unknown[] | null, surrogates?: readonly ITargetedInstruction[] | null, containerless?: boolean | null, shadowOptions?: {
    mode: 'open' | 'closed';
} | null, hasSlots?: boolean | null, strategy?: BindingStrategy | null, childrenObservers?: Record<string, IChildrenObserverDescription> | null, aliases?: readonly string[] | null): TemplateDefinition;
export declare function alias(...aliases: string[]): (instance: Constructable<any>) => Constructable<any>;
export declare function registerAliases<T, F>(aliases: string[], resource: IResourceKind<T, F>, key: string, container: IContainer): void;
//# sourceMappingURL=definitions.d.ts.map