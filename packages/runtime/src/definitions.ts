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
  ForOfStatement,
  Interpolation,
  IsBindingBehavior,
} from './binding/ast';
import {
  BindingMode,
} from './flags';
import {
  PartialCustomElementDefinition,
} from './resources/custom-element';
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

export const enum TemplateControllerLinkType {
  none,
  sibling,
  parent,
}

export type InstructionTypeName = string;

export const ITargetedInstruction = DI.createInterface<ITargetedInstruction>('ITargetedInstruction').noDefault();
export interface ITargetedInstruction {
  type: InstructionTypeName;
}

export interface IHydrateInstruction extends ITargetedInstruction {
  readonly instructions: readonly ITargetedInstruction[];
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
  linkType: TemplateControllerLinkType;
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

export class HooksDefinition {
  public static readonly none: Readonly<HooksDefinition> = new HooksDefinition({});

  public readonly hasCreate: boolean;

  public readonly hasBeforeCompile: boolean;
  public readonly hasAfterCompile: boolean;
  public readonly hasAfterCompileChildren: boolean;

  public readonly hasBeforeBind: boolean;
  public readonly hasAfterBind: boolean;
  public readonly hasAfterAttach: boolean;
  public readonly hasAfterAttachChildren: boolean;

  public readonly hasBeforeDetach: boolean;
  public readonly hasBeforeUnbind: boolean;
  public readonly hasAfterUnbind: boolean;
  public readonly hasAfterUnbindChildren: boolean;

  public readonly hasDispose: boolean;
  public readonly hasAccept: boolean;

  public constructor(target: object) {
    this.hasCreate = 'create' in target;

    this.hasBeforeCompile = 'beforeCompile' in target;
    this.hasAfterCompile = 'afterCompile' in target;
    this.hasAfterCompileChildren = 'afterCompileChildren' in target;

    this.hasBeforeBind = 'beforeBind' in target;
    this.hasAfterBind = 'afterBind' in target;
    this.hasAfterAttach = 'afterAttach' in target;
    this.hasAfterAttachChildren = 'afterAttachChildren' in target;

    this.hasBeforeDetach = 'beforeDetach' in target;
    this.hasBeforeUnbind = 'beforeUnbind' in target;
    this.hasAfterUnbind = 'afterUnbind' in target;
    this.hasAfterUnbindChildren = 'afterUnbindChildren' in target;

    this.hasDispose = 'dispose' in target;
    this.hasAccept = 'accept' in target;
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
    Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
  }
}
