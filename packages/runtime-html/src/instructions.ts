import {
  BindingMode,
  DelegationStrategy,
  ForOfStatement,
  Interpolation,
  IsBindingBehavior,
  ITargetedInstruction,
  PartialCustomElementDefinition,
  SlotInfo,
} from '@aurelia/runtime';

/**
 * TargetedInstructionType enum values become the property names for the associated renderers when they are injected
 * into the `Composer`.
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
  textBinding = 'ha',
  listenerBinding = 'hb',
  attributeBinding = 'hc',
  stylePropertyBinding = 'hd',
  setAttribute = 'he',
  setClassAttribute = 'hf',
  setStyleAttribute = 'hg',
}

export type PropertyBindingInstruction = (
  OneTimeBindingInstruction |
  ToViewBindingInstruction |
  FromViewBindingInstruction |
  TwoWayBindingInstruction
);

export type ListenerBindingInstruction = (
  TriggerBindingInstruction |
  DelegateBindingInstruction |
  CaptureBindingInstruction
);

export type NodeInstruction =
  HydrateElementInstruction |
  HydrateTemplateController |
  HydrateLetElementInstruction |
  TextBindingInstruction;

export type AttributeInstruction =
  InterpolationInstruction |
  PropertyBindingInstruction |
  IteratorBindingInstruction |
  CallBindingInstruction |
  RefBindingInstruction |
  SetPropertyInstruction |
  LetBindingInstruction |
  HydrateAttributeInstruction |
  ListenerBindingInstruction |
  AttributeBindingInstruction |
  StylePropertyBindingInstruction |
  SetAttributeInstruction |
  SetClassAttributeInstruction |
  SetStyleAttributeInstruction;

export type TargetedInstruction = NodeInstruction | AttributeInstruction;
export type InstructionRow = [TargetedInstruction, ...AttributeInstruction[]];

export function isTargetedInstruction(value: unknown): value is TargetedInstruction {
  const type = (value as { type?: string }).type;
  return typeof type === 'string' && type.length === 2;
}

export class InterpolationInstruction {
  public type: TargetedInstructionType.interpolation = TargetedInstructionType.interpolation;

  public constructor(
    public from: string | Interpolation,
    public to: string,
  ) {}
}

export class OneTimeBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;

  public mode: BindingMode.oneTime = BindingMode.oneTime;
  public oneTime: true = true;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class ToViewBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;

  public mode: BindingMode.toView = BindingMode.toView;
  public oneTime: false = false;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class FromViewBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;

  public mode: BindingMode.fromView = BindingMode.fromView;
  public oneTime: false = false;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class TwoWayBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;

  public mode: BindingMode.twoWay = BindingMode.twoWay;
  public oneTime: false = false;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class IteratorBindingInstruction {
  public type: TargetedInstructionType.iteratorBinding = TargetedInstructionType.iteratorBinding;

  public constructor(
    public from: string | ForOfStatement,
    public to: string,
  ) {}
}

export class CallBindingInstruction {
  public type: TargetedInstructionType.callBinding = TargetedInstructionType.callBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class RefBindingInstruction {
  public type: TargetedInstructionType.refBinding = TargetedInstructionType.refBinding;

  public constructor(
    public readonly from: string | IsBindingBehavior,
    public readonly to: string
  ) {
    this.type = TargetedInstructionType.refBinding;
  }
}

export class SetPropertyInstruction {
  public type: TargetedInstructionType.setProperty = TargetedInstructionType.setProperty;

  public constructor(
    public value: unknown,
    public to: string,
  ) {}
}

export class HydrateElementInstruction {
  public type: TargetedInstructionType.hydrateElement = TargetedInstructionType.hydrateElement;

  public constructor(
    public res: string,
    public instructions: ITargetedInstruction[],
    public slotInfo: SlotInfo | null,
  ) {}
}

export class HydrateAttributeInstruction {
  public type: TargetedInstructionType.hydrateAttribute = TargetedInstructionType.hydrateAttribute;

  public constructor(
    public res: string,
    public instructions: ITargetedInstruction[],
  ) {}
}

export class HydrateTemplateController {
  public type: TargetedInstructionType.hydrateTemplateController = TargetedInstructionType.hydrateTemplateController;

  public constructor(
    public def: PartialCustomElementDefinition,
    public res: string,
    public instructions: ITargetedInstruction[],
    public link?: boolean,
  ) {}
}

export class HydrateLetElementInstruction {
  public type: TargetedInstructionType.hydrateLetElement = TargetedInstructionType.hydrateLetElement;

  public constructor(
    public instructions: LetBindingInstruction[],
    public toBindingContext: boolean,
  ) {}
}

export class LetBindingInstruction {
  public type: TargetedInstructionType.letBinding = TargetedInstructionType.letBinding;

  public constructor(
    public from: string | IsBindingBehavior | Interpolation,
    public to: string,
  ) {}
}

export class TextBindingInstruction {
  public type: TargetedInstructionType.textBinding = TargetedInstructionType.textBinding;

  public constructor(
    public from: string | Interpolation,
  ) {}
}

export class TriggerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding = TargetedInstructionType.listenerBinding;

  public preventDefault: true = true;
  public strategy: DelegationStrategy.none = DelegationStrategy.none;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class DelegateBindingInstruction {
  public type: TargetedInstructionType.listenerBinding = TargetedInstructionType.listenerBinding;

  public preventDefault: false = false;
  public strategy: DelegationStrategy.bubbling = DelegationStrategy.bubbling;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class CaptureBindingInstruction {
  public type: TargetedInstructionType.listenerBinding = TargetedInstructionType.listenerBinding;

  public preventDefault: false = false;
  public strategy: DelegationStrategy.capturing = DelegationStrategy.capturing;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class StylePropertyBindingInstruction {
  public type: TargetedInstructionType.stylePropertyBinding = TargetedInstructionType.stylePropertyBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class SetAttributeInstruction {
  public type: TargetedInstructionType.setAttribute = TargetedInstructionType.setAttribute;

  public constructor(
    public value: string,
    public to: string,
  ) {}
}

export class SetClassAttributeInstruction {
  public readonly type: TargetedInstructionType.setClassAttribute = TargetedInstructionType.setClassAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class SetStyleAttributeInstruction {
  public readonly type: TargetedInstructionType.setStyleAttribute = TargetedInstructionType.setStyleAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class AttributeBindingInstruction {
  public type: TargetedInstructionType.attributeBinding = TargetedInstructionType.attributeBinding;

  public constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    public attr: string,
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}
