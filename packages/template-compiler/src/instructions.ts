import {
  type ForOfStatement,
  type Interpolation,
  type IsBindingBehavior,
} from '@aurelia/expression-parser';
import { IAttributeComponentDefinition, IElementComponentDefinition } from './interfaces-template-compiler';
import { createInterface, isString, objectFreeze } from './utilities';
import { AttrSyntax } from './attribute-pattern';
import { BindingMode } from './binding-mode';

/** @internal */ export const hydrateElement = 'ra';
/** @internal */ export const hydrateAttribute = 'rb';
/** @internal */ export const hydrateTemplateController = 'rc';
/** @internal */ export const hydrateLetElement = 'rd';
/** @internal */ export const setProperty = 're';
/** @internal */ export const interpolation = 'rf';
/** @internal */ export const propertyBinding = 'rg';
/** @internal */ export const letBinding = 'ri';
/** @internal */ export const refBinding = 'rj';
/** @internal */ export const iteratorBinding = 'rk';
/** @internal */ export const multiAttr = 'rl';
/** @internal */ export const textBinding = 'ha';
/** @internal */ export const listenerBinding = 'hb';
/** @internal */ export const attributeBinding = 'hc';
/** @internal */ export const stylePropertyBinding = 'hd';
/** @internal */ export const setAttribute = 'he';
/** @internal */ export const setClassAttribute = 'hf';
/** @internal */ export const setStyleAttribute = 'hg';
/** @internal */ export const spreadBinding = 'hs';
/** @internal */ export const spreadElementProp = 'hp';

export const InstructionType = /*@__PURE__*/ objectFreeze({
  hydrateElement,
  hydrateAttribute,
  hydrateTemplateController,
  hydrateLetElement,
  setProperty,
  interpolation,
  propertyBinding,
  letBinding,
  refBinding,
  iteratorBinding,
  multiAttr,
  textBinding,
  listenerBinding,
  attributeBinding,
  stylePropertyBinding,
  setAttribute,
  setClassAttribute,
  setStyleAttribute,
  spreadBinding,
  spreadElementProp,
});
export type InstructionType = typeof InstructionType[keyof typeof InstructionType];

export interface IInstruction {
  readonly type: string;
}
export const IInstruction = /*@__PURE__*/createInterface<IInstruction>('Instruction');

export function isInstruction(value: unknown): value is IInstruction {
  const type = (value as { type?: string }).type;
  return isString(type) && type.length === 2;
}

export class InterpolationInstruction {
  public readonly type = interpolation;

  public constructor(
    public from: string | Interpolation,
    public to: string,
  ) {}
}

export class PropertyBindingInstruction {
  public readonly type = propertyBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
    public mode: BindingMode,
  ) {}
}

export class IteratorBindingInstruction {
  public readonly type = iteratorBinding;

  public constructor(
    public forOf: string | ForOfStatement,
    public to: string,
    public props: MultiAttrInstruction[],
  ) {}
}

export class RefBindingInstruction {
  public readonly type = refBinding;

  public constructor(
    public readonly from: string | IsBindingBehavior,
    public readonly to: string
  ) {}
}

export class SetPropertyInstruction {
  public readonly type = setProperty;

  public constructor(
    public value: unknown,
    public to: string,
  ) {}
}

export class MultiAttrInstruction {
  public readonly type = multiAttr;

  public constructor(
    public value: string,
    public to: string,
    public command: string | null,
  ) {}
}

export class HydrateElementInstruction<
  T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
  TDef extends IElementComponentDefinition = IElementComponentDefinition,
> {
  public readonly type = hydrateElement;

  public constructor(
    /**
     * The name of the custom element this instruction is associated with
     */
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    public res: string | /* Constructable |  */TDef,
    /**
     * Bindable instructions for the custom element instance
     */
    public props: IInstruction[],
    /**
     * Indicates what projections are associated with the element usage
     */
    public projections: Record<string, TDef> | null,
    /**
     * Indicates whether the usage of the custom element was with a containerless attribute or not
     */
    public containerless: boolean,
    /**
     * A list of captured attr syntaxes
     */
    public captures: AttrSyntax[] | undefined,
    /**
     * Any data associated with this instruction
     */
    public readonly data: T,
  ) {
  }
}

export class HydrateAttributeInstruction {
  public readonly type = hydrateAttribute;

  public constructor(
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    public res: string | /* Constructable |  */IAttributeComponentDefinition,
    public alias: string | undefined,
    /**
     * Bindable instructions for the custom attribute instance
     */
    public props: IInstruction[],
  ) {}
}

export class HydrateTemplateController {
  public readonly type = hydrateTemplateController;

  public constructor(
    public def: IElementComponentDefinition,
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    public res: string | /* Constructable |  */IAttributeComponentDefinition,
    public alias: string | undefined,
    /**
     * Bindable instructions for the template controller instance
     */
    public props: IInstruction[],
  ) {}
}

export class HydrateLetElementInstruction {
  public readonly type = hydrateLetElement;

  public constructor(
    public instructions: LetBindingInstruction[],
    public toBindingContext: boolean,
  ) {}
}

export class LetBindingInstruction {
  public readonly type = letBinding;

  public constructor(
    public from: string | IsBindingBehavior | Interpolation,
    public to: string,
  ) {}
}

export class TextBindingInstruction {
  public readonly type = textBinding;

  public constructor(
    public from: string | IsBindingBehavior,
  ) {}
}

export class ListenerBindingInstruction {
  public readonly type = listenerBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
    public capture: boolean,
    public modifier: string | null,
  ) {}
}
export class StylePropertyBindingInstruction {
  public readonly type = stylePropertyBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class SetAttributeInstruction {
  public readonly type = setAttribute;

  public constructor(
    public value: string,
    public to: string,
  ) {}
}

export class SetClassAttributeInstruction {
  public readonly type: typeof InstructionType.setClassAttribute = setClassAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class SetStyleAttributeInstruction {
  public readonly type: typeof InstructionType.setStyleAttribute = setStyleAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class AttributeBindingInstruction {
  public readonly type = attributeBinding;

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

export class SpreadBindingInstruction {
  public readonly type = spreadBinding;
}

export class SpreadElementPropBindingInstruction {
  public readonly type = spreadElementProp;
  public constructor(
    public readonly instructions: IInstruction,
  ) {}
}
