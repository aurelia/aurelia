import {
  type ForOfStatement,
  type Interpolation,
  type IsBindingBehavior,
} from '@aurelia/expression-parser';
import { IAttributeComponentDefinition, IElementComponentDefinition } from './interfaces-template-compiler';
import { tcCreateInterface } from './utilities';
import { AttrSyntax } from './attribute-pattern';
import { BindingMode } from './binding-mode';

/**
 * Instruction type numeric ranges:
 *
 * Core instruction types (prefix: it):
 *   0-9:    Hydration instructions (itHydrateElement, itHydrateAttribute, etc.)
 *   10-29:  Property/binding instructions (itSetProperty, itPropertyBinding, etc.)
 *   30-49:  DOM binding instructions (itTextBinding, itListenerBinding, etc.)
 *   50-59:  Spread instructions
 *   60-99:  Reserved for future core use
 *
 * Plugin ranges:
 *   100-119: @aurelia/i18n (itTranslation, itTranslationBind, itTranslationParameters)
 *   120-139: @aurelia/state (itStateBinding, itDispatchBinding)
 *   140-159: @aurelia/compat-v1 (itCall, itDelegate)
 *   160-199: Reserved for future official plugins
 *   200+:    Third-party plugins
 */

// Hydration instructions (0-9)
export const itHydrateElement = 0;
export const itHydrateAttribute = 1;
export const itHydrateTemplateController = 2;
export const itHydrateLetElement = 3;

// Property/binding instructions (10-29)
export const itSetProperty = 10;
export const itInterpolation = 11;
export const itPropertyBinding = 12;
export const itLetBinding = 13;
export const itRefBinding = 14;
export const itIteratorBinding = 15;
export const itMultiAttr = 16;

// DOM binding instructions (30-49)
export const itTextBinding = 30;
export const itListenerBinding = 31;
export const itAttributeBinding = 32;
export const itStylePropertyBinding = 33;
export const itSetAttribute = 34;
export const itSetClassAttribute = 35;
export const itSetStyleAttribute = 36;

// Spread instructions (50-59)
export const itSpreadTransferedBinding = 50;
export const itSpreadElementProp = 51;
export const itSpreadValueBinding = 52;

/**
 * Base instruction interface - use `Instruction` union type for stricter typing
 */
export interface IInstruction {
  readonly type: number;
}
export const IInstruction = /*@__PURE__*/tcCreateInterface<IInstruction>('Instruction');

export function isInstruction(value: unknown): value is IInstruction {
  const type = (value as { type?: number }).type;
  return typeof type === 'number' && type >= 0 && type < 100;
}

export interface InterpolationInstruction extends IInstruction {
  readonly type: typeof itInterpolation;
  readonly from: string | Interpolation;
  readonly to: string;
}

export interface PropertyBindingInstruction extends IInstruction {
  readonly type: typeof itPropertyBinding;
  readonly from: string | IsBindingBehavior;
  readonly to: string;
  readonly mode: BindingMode;
}

export interface IteratorBindingInstruction extends IInstruction {
  readonly type: typeof itIteratorBinding;
  readonly forOf: string | ForOfStatement;
  readonly to: string;
  readonly props: MultiAttrInstruction[];
}

export interface RefBindingInstruction extends IInstruction {
  readonly type: typeof itRefBinding;
  readonly from: string | IsBindingBehavior;
  readonly to: string;
}

export interface SetPropertyInstruction extends IInstruction {
  readonly type: typeof itSetProperty;
  readonly value: unknown;
  readonly to: string;
}

export interface MultiAttrInstruction extends IInstruction {
  readonly type: typeof itMultiAttr;
  readonly value: string;
  readonly to: string;
  readonly command: string | null;
}

export interface HydrateElementInstruction<
  T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
  TDef extends IElementComponentDefinition = IElementComponentDefinition,
> extends IInstruction {
  readonly type: typeof itHydrateElement;
  /**
   * The name of the custom element this instruction is associated with
   */
  readonly res: string | /* Constructable | */ TDef;
  /**
   * Bindable instructions for the custom element instance
   */
  readonly props: IInstruction[];
  /**
   * Indicates what projections are associated with the element usage
   */
  readonly projections: Record<string, TDef> | null;
  /**
   * Indicates whether the usage of the custom element was with a containerless attribute or not
   */
  readonly containerless: boolean;
  /**
   * A list of captured attr syntaxes
   */
  readonly captures: AttrSyntax[] | undefined;
  /**
   * Any data associated with this instruction
   */
  readonly data: T;
}

export interface HydrateAttributeInstruction<T extends IAttributeComponentDefinition = IAttributeComponentDefinition> extends IInstruction {
  readonly type: typeof itHydrateAttribute;
  readonly res: string | /* Constructable | */ T;
  readonly alias: string | undefined;
  /**
   * Bindable instructions for the custom attribute instance
   */
  readonly props: IInstruction[];
}

export interface HydrateTemplateController<T extends IAttributeComponentDefinition = IAttributeComponentDefinition> extends IInstruction {
  readonly type: typeof itHydrateTemplateController;
  readonly def: IElementComponentDefinition;
  readonly res: string | /* Constructable | */ T;
  readonly alias: string | undefined;
  /**
   * Bindable instructions for the template controller instance
   */
  readonly props: IInstruction[];
}

export interface HydrateLetElementInstruction extends IInstruction {
  readonly type: typeof itHydrateLetElement;
  readonly instructions: LetBindingInstruction[];
  readonly toBindingContext: boolean;
}

export interface LetBindingInstruction extends IInstruction {
  readonly type: typeof itLetBinding;
  readonly from: string | IsBindingBehavior | Interpolation;
  readonly to: string;
}

export interface TextBindingInstruction extends IInstruction {
  readonly type: typeof itTextBinding;
  readonly from: string | IsBindingBehavior;
}

export interface ListenerBindingInstruction extends IInstruction {
  readonly type: typeof itListenerBinding;
  readonly from: string | IsBindingBehavior;
  readonly to: string;
  readonly capture: boolean;
  readonly modifier: string | null;
}

export interface StylePropertyBindingInstruction extends IInstruction {
  readonly type: typeof itStylePropertyBinding;
  readonly from: string | IsBindingBehavior;
  readonly to: string;
}

export interface SetAttributeInstruction extends IInstruction {
  readonly type: typeof itSetAttribute;
  readonly value: string;
  readonly to: string;
}

export interface SetClassAttributeInstruction extends IInstruction {
  readonly type: typeof itSetClassAttribute;
  readonly value: string;
}

export interface SetStyleAttributeInstruction extends IInstruction {
  readonly type: typeof itSetStyleAttribute;
  readonly value: string;
}

export interface AttributeBindingInstruction extends IInstruction {
  readonly type: typeof itAttributeBinding;
  /**
   * `attr` and `to` have the same value on a normal attribute
   * Will be different on `class` and `style`
   * on `class`: attr = `class` (from binding command), to = attribute name
   * on `style`: attr = `style` (from binding command), to = attribute name
   */
  readonly attr: string;
  readonly from: string | IsBindingBehavior;
  readonly to: string;
}

export interface SpreadTransferedBindingInstruction extends IInstruction {
  readonly type: typeof itSpreadTransferedBinding;
}

/**
 * When spreading any attribute bindings onto an element,
 * it's possible that some attributes will be targeting the bindable properties of a custom element
 * This instruction is used to express that
 */
export interface SpreadElementPropBindingInstruction extends IInstruction {
  readonly type: typeof itSpreadElementProp;
  readonly instruction: IInstruction;
}

export interface SpreadValueBindingInstruction extends IInstruction {
  readonly type: typeof itSpreadValueBinding;
  readonly target: '$bindables' | '$element';
  readonly from: string;
}

/**
 * Discriminated union of all core instruction types.
 * Use this for stricter typing instead of IInstruction where possible.
 */
export type Instruction =
  | InterpolationInstruction
  | PropertyBindingInstruction
  | IteratorBindingInstruction
  | RefBindingInstruction
  | SetPropertyInstruction
  | MultiAttrInstruction
  | HydrateElementInstruction
  | HydrateAttributeInstruction
  | HydrateTemplateController
  | HydrateLetElementInstruction
  | LetBindingInstruction
  | TextBindingInstruction
  | ListenerBindingInstruction
  | StylePropertyBindingInstruction
  | SetAttributeInstruction
  | SetClassAttributeInstruction
  | SetStyleAttributeInstruction
  | AttributeBindingInstruction
  | SpreadTransferedBindingInstruction
  | SpreadElementPropBindingInstruction
  | SpreadValueBindingInstruction;
