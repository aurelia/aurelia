import { DI } from '@aurelia/kernel';
import {
  BindingMode,
  DelegationStrategy,
  ForOfStatement,
  Interpolation,
  IsBindingBehavior,
} from '@aurelia/runtime';
import { PartialCustomElementDefinition } from './resources/custom-element';
import { SlotInfo } from './resources/custom-elements/au-slot';

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

export type InstructionTypeName = string;

export interface IInstruction {
  readonly type: InstructionTypeName;
}
export const IInstruction = DI.createInterface<IInstruction>('Instruction').noDefault();

export function isInstruction(value: unknown): value is IInstruction {
  const type = (value as { type?: string }).type;
  return typeof type === 'string' && type.length === 2;
}

export class InterpolationInstruction {
  public get type(): InstructionType.interpolation { return InstructionType.interpolation; }

  public constructor(
    public from: string | Interpolation,
    public to: string,
  ) {}
}

export class PropertyBindingInstruction {
  public get type(): InstructionType.propertyBinding { return InstructionType.propertyBinding; }

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
    public mode: BindingMode,
  ) {}
}

export class IteratorBindingInstruction {
  public get type(): InstructionType.iteratorBinding { return InstructionType.iteratorBinding; }

  public constructor(
    public from: string | ForOfStatement,
    public to: string,
  ) {}
}

export class CallBindingInstruction {
  public get type(): InstructionType.callBinding { return InstructionType.callBinding; }

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class RefBindingInstruction {
  public get type(): InstructionType.refBinding { return InstructionType.refBinding; }

  public constructor(
    public readonly from: string | IsBindingBehavior,
    public readonly to: string
  ) {}
}

export class SetPropertyInstruction {
  public get type(): InstructionType.setProperty { return InstructionType.setProperty; }

  public constructor(
    public value: unknown,
    public to: string,
  ) {}
}

export class HydrateElementInstruction {
  public get type(): InstructionType.composeElement { return InstructionType.composeElement; }

  public constructor(
    public res: string,
    public instructions: IInstruction[],
    public slotInfo: SlotInfo | null,
  ) {}
}

export class HydrateAttributeInstruction {
  public get type(): InstructionType.composeAttribute { return InstructionType.composeAttribute; }

  public constructor(
    public res: string,
    public instructions: IInstruction[],
  ) {}
}

export class HydrateTemplateController {
  public get type(): InstructionType.composeTemplateController { return InstructionType.composeTemplateController; }

  public constructor(
    public def: PartialCustomElementDefinition,
    public res: string,
    public instructions: IInstruction[],
  ) {}
}

export class HydrateLetElementInstruction {
  public get type(): InstructionType.composeLetElement { return InstructionType.composeLetElement; }

  public constructor(
    public instructions: LetBindingInstruction[],
    public toBindingContext: boolean,
  ) {}
}

export class LetBindingInstruction {
  public get type(): InstructionType.letBinding { return InstructionType.letBinding; }

  public constructor(
    public from: string | IsBindingBehavior | Interpolation,
    public to: string,
  ) {}
}

export class TextBindingInstruction {
  public get type(): InstructionType.textBinding { return InstructionType.textBinding; }

  public constructor(
    public from: string | Interpolation,
  ) {}
}

export class TriggerBindingInstruction {
  public get type(): InstructionType.listenerBinding { return InstructionType.listenerBinding; }

  public preventDefault: true = true;
  public strategy: DelegationStrategy.none = DelegationStrategy.none;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class DelegateBindingInstruction {
  public get type(): InstructionType.listenerBinding { return InstructionType.listenerBinding; }

  public preventDefault: false = false;
  public strategy: DelegationStrategy.bubbling = DelegationStrategy.bubbling;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class CaptureBindingInstruction {
  public get type(): InstructionType.listenerBinding { return InstructionType.listenerBinding; }

  public preventDefault: false = false;
  public strategy: DelegationStrategy.capturing = DelegationStrategy.capturing;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class StylePropertyBindingInstruction {
  public get type(): InstructionType.stylePropertyBinding { return InstructionType.stylePropertyBinding; }

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class SetAttributeInstruction {
  public get type(): InstructionType.setAttribute { return InstructionType.setAttribute; }

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
  public get type(): InstructionType.attributeBinding { return InstructionType.attributeBinding; }

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
