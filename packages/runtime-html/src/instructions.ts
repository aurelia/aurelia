import {
  BindingMode,
  DelegationStrategy,
  ForOfStatement,
  Interpolation,
  IsBindingBehavior,
  IInstruction,
  PartialCustomElementDefinition,
  SlotInfo,
} from '@aurelia/runtime';

/**
 * InstructionType enum values become the property names for the associated renderers when they are injected
 * into the `Composer`.
 *
 * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
 *
 * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
 * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
 */
export const enum InstructionType {
  composeElement = 'ra',
  composeAttribute = 'rb',
  composeTemplateController = 'rc',
  composeLetElement = 'rd',
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

export type Instruction = NodeInstruction | AttributeInstruction;
export type InstructionRow = [Instruction, ...AttributeInstruction[]];

export function isInstruction(value: unknown): value is Instruction {
  const type = (value as { type?: string }).type;
  return typeof type === 'string' && type.length === 2;
}

export class InterpolationInstruction {
  public type: InstructionType.interpolation = InstructionType.interpolation;

  public constructor(
    public from: string | Interpolation,
    public to: string,
  ) {}
}

export class OneTimeBindingInstruction {
  public type: InstructionType.propertyBinding = InstructionType.propertyBinding;

  public mode: BindingMode.oneTime = BindingMode.oneTime;
  public oneTime: true = true;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class ToViewBindingInstruction {
  public type: InstructionType.propertyBinding = InstructionType.propertyBinding;

  public mode: BindingMode.toView = BindingMode.toView;
  public oneTime: false = false;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class FromViewBindingInstruction {
  public type: InstructionType.propertyBinding = InstructionType.propertyBinding;

  public mode: BindingMode.fromView = BindingMode.fromView;
  public oneTime: false = false;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class TwoWayBindingInstruction {
  public type: InstructionType.propertyBinding = InstructionType.propertyBinding;

  public mode: BindingMode.twoWay = BindingMode.twoWay;
  public oneTime: false = false;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class IteratorBindingInstruction {
  public type: InstructionType.iteratorBinding = InstructionType.iteratorBinding;

  public constructor(
    public from: string | ForOfStatement,
    public to: string,
  ) {}
}

export class CallBindingInstruction {
  public type: InstructionType.callBinding = InstructionType.callBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class RefBindingInstruction {
  public type: InstructionType.refBinding = InstructionType.refBinding;

  public constructor(
    public readonly from: string | IsBindingBehavior,
    public readonly to: string
  ) {
    this.type = InstructionType.refBinding;
  }
}

export class SetPropertyInstruction {
  public type: InstructionType.setProperty = InstructionType.setProperty;

  public constructor(
    public value: unknown,
    public to: string,
  ) {}
}

export class HydrateElementInstruction {
  public type: InstructionType.composeElement = InstructionType.composeElement;

  public constructor(
    public res: string,
    public instructions: IInstruction[],
    public slotInfo: SlotInfo | null,
  ) {}
}

export class HydrateAttributeInstruction {
  public type: InstructionType.composeAttribute = InstructionType.composeAttribute;

  public constructor(
    public res: string,
    public instructions: IInstruction[],
  ) {}
}

export class HydrateTemplateController {
  public type: InstructionType.composeTemplateController = InstructionType.composeTemplateController;

  public constructor(
    public def: PartialCustomElementDefinition,
    public res: string,
    public instructions: IInstruction[],
  ) {}
}

export class HydrateLetElementInstruction {
  public type: InstructionType.composeLetElement = InstructionType.composeLetElement;

  public constructor(
    public instructions: LetBindingInstruction[],
    public toBindingContext: boolean,
  ) {}
}

export class LetBindingInstruction {
  public type: InstructionType.letBinding = InstructionType.letBinding;

  public constructor(
    public from: string | IsBindingBehavior | Interpolation,
    public to: string,
  ) {}
}

export class TextBindingInstruction {
  public type: InstructionType.textBinding = InstructionType.textBinding;

  public constructor(
    public from: string | Interpolation,
  ) {}
}

export class TriggerBindingInstruction {
  public type: InstructionType.listenerBinding = InstructionType.listenerBinding;

  public preventDefault: true = true;
  public strategy: DelegationStrategy.none = DelegationStrategy.none;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class DelegateBindingInstruction {
  public type: InstructionType.listenerBinding = InstructionType.listenerBinding;

  public preventDefault: false = false;
  public strategy: DelegationStrategy.bubbling = DelegationStrategy.bubbling;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class CaptureBindingInstruction {
  public type: InstructionType.listenerBinding = InstructionType.listenerBinding;

  public preventDefault: false = false;
  public strategy: DelegationStrategy.capturing = DelegationStrategy.capturing;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class StylePropertyBindingInstruction {
  public type: InstructionType.stylePropertyBinding = InstructionType.stylePropertyBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class SetAttributeInstruction {
  public type: InstructionType.setAttribute = InstructionType.setAttribute;

  public constructor(
    public value: string,
    public to: string,
  ) {}
}

export class SetClassAttributeInstruction {
  public readonly type: InstructionType.setClassAttribute = InstructionType.setClassAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class SetStyleAttributeInstruction {
  public readonly type: InstructionType.setStyleAttribute = InstructionType.setStyleAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class AttributeBindingInstruction {
  public type: InstructionType.attributeBinding = InstructionType.attributeBinding;

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
