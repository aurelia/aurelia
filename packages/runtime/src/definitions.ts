import {
  Constructable,
  DI,
  ResourceDefinition,
  IContainer,
  IResourceKind,
  Registration,
  Metadata,
  Protocol,
} from '@aurelia/kernel';
import {
  IForOfStatement,
  IInterpolationExpression,
  IsBindingBehavior
} from './ast';
import {
  BindingMode,
} from './flags';
import {
  PartialCustomElementDefinition,
  CustomElementDefinition,
} from './resources/custom-element';

/**
 * TargetedInstructionType enum values become the property names for the associated renderers when they are injected
 * into the `Renderer`.
 *
 * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
 *
 * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
 * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
 */
export const enum TargetedInstructionType {
  hydrateElement = 'ra',
  hydrateAttribute = 'rb',
  hydrateTemplateController = 'rc',
  hydrateLetElement = 'rd',
  setProperty = 're',
  interpolation = 'rf',
  propertyBinding = 'rg',
  callBinding = 'rh',
  letBinding = 'ri',
  refBinding = 'rj',
  iteratorBinding = 'rk',
}

export type PartialCustomElementDefinitionParts = Record<string, PartialCustomElementDefinition>;
export type CustomElementDefinitionParts = Record<string, CustomElementDefinition>;

export type InstructionTypeName = string;

export const ITargetedInstruction = DI.createInterface<ITargetedInstruction>('ITargetedInstruction').noDefault();
export interface ITargetedInstruction {
  type: InstructionTypeName;
}

export type NodeInstruction =
  IHydrateElementInstruction |
  IHydrateTemplateController |
  IHydrateLetElementInstruction;

export type AttributeInstruction =
  IInterpolationInstruction |
  IPropertyBindingInstruction |
  IIteratorBindingInstruction |
  ICallBindingInstruction |
  IRefBindingInstruction |
  ISetPropertyInstruction |
  ILetBindingInstruction |
  IHydrateAttributeInstruction;

export type TargetedInstruction = NodeInstruction | AttributeInstruction;

// TODO: further improve specificity and integrate with the definitions;
export type InstructionRow = [TargetedInstruction, ...AttributeInstruction[]];

export function isTargetedInstruction(value: unknown): value is TargetedInstruction {
  const type = (value as { type?: string }).type;
  return typeof type === 'string' && type.length === 2;
}

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

export class HooksDefinition {
  public static readonly none: Readonly<HooksDefinition> = Object.freeze(new HooksDefinition({}));

  public readonly hasRender: boolean;
  public readonly hasCreated: boolean;

  public readonly hasBinding: boolean;
  public readonly hasBound: boolean;

  public readonly hasUnbinding: boolean;
  public readonly hasUnbound: boolean;

  public readonly hasAttaching: boolean;
  public readonly hasAttached: boolean;

  public readonly hasDetaching: boolean;
  public readonly hasDetached: boolean;
  public readonly hasCaching: boolean;

  public constructor(target: object) {
    this.hasRender = 'render' in target;
    this.hasCreated = 'created' in target;
    this.hasBinding = 'binding' in target;
    this.hasBound = 'bound' in target;
    this.hasUnbinding = 'unbinding' in target;
    this.hasUnbound = 'unbound' in target;
    this.hasAttaching = 'attaching' in target;
    this.hasAttached = 'attached' in target;
    this.hasDetaching = 'detaching' in target;
    this.hasDetached = 'detached' in target;
    this.hasCaching = 'caching' in target;
  }
}

export function alias(...aliases: readonly string[]) {
  return function (target: Constructable) {
    const key = Protocol.annotation.keyFor('aliases');
    const existing = Metadata.getOwn(key, target);
    if (existing === void 0) {
      Metadata.define(key, aliases, target);
    } else {
      existing.push(...aliases);
    }
  };
}

export function registerAliases(aliases: readonly string[], resource: IResourceKind<Constructable, ResourceDefinition>, key: string, container: IContainer) {
  for (let i = 0, ii = aliases.length; i < ii; ++i) {
    Registration.alias(key, resource.keyFrom(aliases[i])).register(container);
  }
}
