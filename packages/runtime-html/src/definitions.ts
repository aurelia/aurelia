import {
  AttributeInstruction,
  DelegationStrategy,
  Interpolation,
  IsBindingBehavior,
  ITargetedInstruction,
  NodeInstruction
} from '@aurelia/runtime';

export const enum HTMLTargetedInstructionType {
  textBinding = 'ha',
  listenerBinding = 'hb',
  attributeBinding = 'hc',
  stylePropertyBinding = 'hd',
  setAttribute = 'he',
  setClassAttribute = 'hf',
  setStyleAttribute = 'hg',
}

export type HTMLNodeInstruction =
  NodeInstruction |
  ITextBindingInstruction;

export type HTMLAttributeInstruction =
  AttributeInstruction |
  IListenerBindingInstruction |
  IAttributeBindingInstruction |
  IStylePropertyBindingInstruction |
  ISetAttributeInstruction |
  ISetClassAttributeInstruction |
  ISetStyleAttributeInstruction;

export type HTMLTargetedInstruction = HTMLNodeInstruction | HTMLAttributeInstruction;
// TODO: further improve specificity and integrate with the definitions;
export type HTMLInstructionRow = [HTMLTargetedInstruction, ...HTMLAttributeInstruction[]];

export function isHTMLTargetedInstruction(value: unknown): value is HTMLTargetedInstruction {
  const type = (value as { type?: string }).type;
  return typeof type === 'string' && type.length === 2;
}

export interface ITextBindingInstruction extends ITargetedInstruction {
  type: HTMLTargetedInstructionType.textBinding;
  from: string | Interpolation;
}

export interface IListenerBindingInstruction extends ITargetedInstruction {
  type: HTMLTargetedInstructionType.listenerBinding;
  from: string | IsBindingBehavior;
  to: string;
  strategy: DelegationStrategy;
  preventDefault: boolean;
}

export interface IStylePropertyBindingInstruction extends ITargetedInstruction {
  type: HTMLTargetedInstructionType.stylePropertyBinding;
  from: string | IsBindingBehavior;
  to: string;
}

export interface ISetAttributeInstruction extends ITargetedInstruction {
  type: HTMLTargetedInstructionType.setAttribute;
  value: string;
  to: string;
}

export interface ISetClassAttributeInstruction extends ITargetedInstruction {
  type: HTMLTargetedInstructionType.setClassAttribute;
  value: string;
}

export interface ISetStyleAttributeInstruction extends ITargetedInstruction {
  type: HTMLTargetedInstructionType.setStyleAttribute;
  value: string;
}

export interface IAttributeBindingInstruction extends ITargetedInstruction {
  type: HTMLTargetedInstructionType.attributeBinding;
  from: string | IsBindingBehavior;

  /**
   * `attr` and `to` have the same value on a normal attribute
   * Will be different on `class` and `style`
   * on `class`: attr = `class` (from binding command), to = attribute name
   * on `style`: attr = `style` (from binding command), to = attribute name
   */
  attr: string;
  to: string;
}
