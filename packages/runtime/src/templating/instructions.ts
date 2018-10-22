// tslint:disable:no-reserved-keywords
import { DI, Immutable } from '@aurelia/kernel';
import { ForOfStatement, Interpolation, IsBindingBehavior } from '../binding/ast';
import { BindingMode } from '../binding/binding-mode';
import { DelegationStrategy } from '../binding/event-manager';
import { INode } from '../dom';
import { ResourceDescription } from '../resource';
import { IBindableDescription } from './bindable';

export const enum TargetedInstructionType {
  textBinding = 'a',
  interpolation = 'b',
  propertyBinding = 'c',
  iteratorBinding = 'd',
  listenerBinding = 'e',
  callBinding = 'f',
  refBinding = 'g',
  stylePropertyBinding = 'h',
  setProperty = 'i',
  setAttribute = 'j',
  hydrateElement = 'k',
  hydrateAttribute = 'l',
  hydrateTemplateController = 'm',
  letElement = 'n',
  letBinding = 'o',
  renderStrategy = 'z',
}

const instructionTypeValues = 'abcdefghijkl';

export interface IBuildInstruction {
  required: boolean;
  compiler?: string;
}

export interface ITemplateDefinition {
  name?: string;
  cache?: '*' | number;
  template?: string | INode;
  instructions?: TargetedInstruction[][];
  dependencies?: any[];
  build?: IBuildInstruction;
  surrogates?: TargetedInstruction[];
  bindables?: Record<string, IBindableDescription>;
  containerless?: boolean;
  shadowOptions?: ShadowRootInit;
  hasSlots?: boolean;
}

export type TemplateDefinition = ResourceDescription<ITemplateDefinition>;
export type TemplatePartDefinitions = Record<string, Immutable<ITemplateDefinition>>;
export type BindableDefinitions = Record<string, Immutable<IBindableDescription>>;

export const ITargetedInstruction = DI.createInterface<ITargetedInstruction>();
export interface ITargetedInstruction {
  type: TargetedInstructionType;
}

export type TargetedInstruction =
  ITextBindingInstruction |
  IInterpolationInstruction |
  IPropertyBindingInstruction |
  IIteratorBindingInstruction |
  IListenerBindingInstruction |
  ICallBindingInstruction |
  IRefBindingInstruction |
  IStylePropertyBindingInstruction |
  ISetPropertyInstruction |
  ISetAttributeInstruction |
  IHydrateElementInstruction |
  IHydrateAttributeInstruction |
  IHydrateTemplateController |
  IRenderStrategyInstruction |
  ILetElementInstruction;

export function isTargetedInstruction(value: { type?: string }): value is TargetedInstruction {
  const type = value.type;
  return typeof type === 'string' && instructionTypeValues.indexOf(type) !== -1;
}

export interface ITextBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.textBinding;
  from: string | Interpolation;
}

export interface IInterpolationInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.interpolation;
  from: string | Interpolation;
  to: string;
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

export interface IListenerBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.listenerBinding;
  from: string | IsBindingBehavior;
  to: string;
  strategy: DelegationStrategy;
  preventDefault: boolean;
}

export interface ICallBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.callBinding;
  from: string | IsBindingBehavior;
  to: string;
}

export interface IRefBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.refBinding;
  from: string | IsBindingBehavior;
}

export interface IStylePropertyBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.stylePropertyBinding;
  from: string | IsBindingBehavior;
  to: string;
}

export interface ISetPropertyInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.setProperty;
  value: unknown;
  to: string;
}

export interface ISetAttributeInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.setAttribute;
  value: unknown;
  to: string;
}

export interface IHydrateElementInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateElement;
  res: string;
  instructions: TargetedInstruction[];
  parts?: Record<string, ITemplateDefinition>;
}

export interface IHydrateAttributeInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateAttribute;
  res: string;
  instructions: TargetedInstruction[];
}

export interface IHydrateTemplateController extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateTemplateController;
  res: string;
  instructions: TargetedInstruction[];
  def: ITemplateDefinition;
  link?: boolean;
}

export interface IRenderStrategyInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.renderStrategy;
  name: string;
}

export interface ILetElementInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.letElement;
  instructions: ILetBindingInstruction[];
  toViewModel: boolean;
}

export interface ILetBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.letBinding;
  from: string | IsBindingBehavior | Interpolation;
  to: string;
}
