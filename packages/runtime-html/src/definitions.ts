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
  stylePropertyBinding = 'hc',
  setAttribute = 'hd'
}

export type HTMLNodeInstruction =
  NodeInstruction |
  ITextBindingInstruction;

export type HTMLAttributeInstruction =
  AttributeInstruction |
  IListenerBindingInstruction |
  IStylePropertyBindingInstruction |
  ISetAttributeInstruction;

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
