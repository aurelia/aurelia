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

export interface ITemplateSource {
  name?: string;
  cache?: '*' | number;
  templateOrNode?: string | INode;
  instructions?: TargetedInstruction[][];
  dependencies?: any[];
  build?: IBuildInstruction;
  surrogates?: TargetedInstruction[];
  bindables?: Record<string, IBindableDescription>;
  containerless?: boolean;
  shadowOptions?: ShadowRootInit;
  hasSlots?: boolean;
}

export type TemplateDefinition = ResourceDescription<ITemplateSource>;
export type TemplatePartDefinitions = Record<string, Immutable<ITemplateSource>>;
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

export function isTargetedInstruction(value: any): value is TargetedInstruction {
  const type = value.type;
  return typeof type === 'string' && instructionTypeValues.indexOf(type) !== -1;
}

export interface ITextBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.textBinding;
  srcOrExpr: string | Interpolation;
}

export interface IInterpolationInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.interpolation;
  srcOrExpr: string | Interpolation;
  dest: string;
}

export interface IInterpolationInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.interpolation;
  srcOrExpr: string | Interpolation;
  dest: string;
}

export interface IPropertyBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.propertyBinding;
  mode: BindingMode;
  srcOrExpr: string | IsBindingBehavior;
  dest: string;
  oneTime?: boolean;
}

export interface IIteratorBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.iteratorBinding;
  srcOrExpr: string | ForOfStatement;
  dest: string;
}

export interface IListenerBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.listenerBinding;
  srcOrExpr: string | IsBindingBehavior;
  dest: string;
  strategy: DelegationStrategy;
  preventDefault: boolean;
}

export interface ICallBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.callBinding;
  srcOrExpr: string | IsBindingBehavior;
  dest: string;
}

export interface IRefBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.refBinding;
  srcOrExpr: string | IsBindingBehavior;
}

export interface IStylePropertyBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.stylePropertyBinding;
  srcOrExpr: string | IsBindingBehavior;
  dest: string;
}

export interface ISetPropertyInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.setProperty;
  value: any;
  dest: string;
}

export interface ISetAttributeInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.setAttribute;
  value: any;
  dest: string;
}

export interface IHydrateElementInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateElement;
  res: any;
  instructions: TargetedInstruction[];
  parts?: Record<string, ITemplateSource>;
}

export interface IHydrateAttributeInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateAttribute;
  res: any;
  instructions: TargetedInstruction[];
}

export interface IHydrateTemplateController extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateTemplateController;
  res: any;
  instructions: TargetedInstruction[];
  src: ITemplateSource;
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
  srcOrExpr: string | IsBindingBehavior | Interpolation;
  dest: string;
}
