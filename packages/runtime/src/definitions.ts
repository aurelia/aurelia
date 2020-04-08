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

const parentPartsOwnPartsLookup = new WeakMap<PartialCustomElementDefinitionParts, WeakMap<PartialCustomElementDefinitionParts, PartialCustomElementDefinitionParts>>();

/**
 * Efficiently merge parts, performing the minimal amount of work / using the minimal amount of memory.
 *
 * If either of the two part records is undefined, the other will simply be returned.
 *
 * If both are undefined, undefined will be returned.
 *
 * If neither are undefined, a new object will be returned where parts of the second value will be written last (and thus may overwrite duplicate named parts).
 *
 * This function is idempotent via a WeakMap cache: results are cached and if the same two variables are provided again, the same object will be returned.
 */
export function mergeParts(
  parentParts: PartialCustomElementDefinitionParts | undefined,
  ownParts: PartialCustomElementDefinitionParts | undefined,
): PartialCustomElementDefinitionParts | undefined {
  if (parentParts === ownParts) {
    return parentParts;
  }
  if (parentParts === void 0) {
    return ownParts;
  }
  if (ownParts === void 0) {
    return parentParts;
  }

  let ownPartsLookup = parentPartsOwnPartsLookup.get(parentParts);
  if (ownPartsLookup === void 0) {
    parentPartsOwnPartsLookup.set(
      parentParts,
      ownPartsLookup = new WeakMap(),
    );
  }

  let mergedParts = ownPartsLookup.get(ownParts);
  if (mergedParts === void 0) {
    ownPartsLookup.set(
      ownParts,
      mergedParts = {
        ...parentParts,
        ...ownParts,
      },
    );
  }

  return mergedParts;
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

export interface IHydrateElementInstruction extends IHydrateInstruction {
  type: TargetedInstructionType.hydrateElement;
  res: string;
  instructions: ITargetedInstruction[];
  parts?: Record<string, PartialCustomElementDefinition>;
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
  parts?: Record<string, PartialCustomElementDefinition>;
}

export interface IHydrateLetElementInstruction extends IHydrateInstruction {
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
  public static readonly none: Readonly<HooksDefinition> = new HooksDefinition({});

  public readonly hasCreate: boolean;
  public readonly hasBeforeCompile: boolean;
  public readonly hasAfterCompile: boolean;
  public readonly hasAfterCompileChildren: boolean;

  public readonly hasBeforeBind: boolean;
  public readonly hasAfterBind: boolean;

  public readonly hasBeforeUnbind: boolean;
  public readonly hasAfterUnbind: boolean;

  public readonly hasBeforeAttach: boolean;
  public readonly hasAfterAttach: boolean;

  public readonly hasBeforeDetach: boolean;
  public readonly hasAfterDetach: boolean;
  public readonly hasCaching: boolean;

  public constructor(target: object) {
    this.hasCreate = 'create' in target;
    this.hasBeforeCompile = 'beforeCompile' in target;
    this.hasAfterCompile = 'afterCompile' in target;
    this.hasAfterCompileChildren = 'afterCompileChildren' in target;
    this.hasBeforeBind = 'beforeBind' in target;
    this.hasAfterBind = 'afterBind' in target;
    this.hasBeforeUnbind = 'beforeUnbind' in target;
    this.hasAfterUnbind = 'afterUnbind' in target;
    this.hasBeforeAttach = 'beforeAttach' in target;
    this.hasAfterAttach = 'afterAttach' in target;
    this.hasBeforeDetach = 'beforeDetach' in target;
    this.hasAfterDetach = 'afterDetach' in target;
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
    Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
  }
}
