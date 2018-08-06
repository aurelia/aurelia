// tslint:disable:no-reserved-keywords
import { DI, Immutable } from '@aurelia/kernel';
import { IExpression } from '../binding/ast';
import { BindingMode } from '../binding/binding-mode';
import { DelegationStrategy } from '../binding/event-manager';
import { INode } from '../dom';
import { ResourceDescription } from '../resource';
import { IBindableDescription } from './bindable';

export enum TargetedInstructionType {
  textBinding = 1,
  propertyBinding = 2,
  listenerBinding = 3,
  callBinding = 4,
  refBinding = 5,
  stylePropertyBinding = 6,
  setProperty = 7,
  setAttribute = 8,
  hydrateSlot = 9,
  hydrateElement = 10,
  hydrateAttribute = 11,
  hydrateTemplateController = 12
}

export interface IBuildInstruction {
  required: boolean;
  compiler: string;
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
  IPropertyBindingInstruction |
  IListenerBindingInstruction |
  ICallBindingInstruction |
  IRefBindingInstruction |
  IStylePropertyBindingInstruction |
  ISetPropertyInstruction |
  ISetAttributeInstruction |
  IHydrateSlotInstruction |
  IHydrateElementInstruction |
  IHydrateAttributeInstruction |
  IHydrateTemplateController;

export interface ITextBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.textBinding;
  srcOrExpr: string | IExpression;
}

export interface IPropertyBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.propertyBinding;
  mode: BindingMode;
  srcOrExpr: string | IExpression;
  dest: string;
  oneTime?: boolean;
}

export interface IListenerBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.listenerBinding;
  srcOrExpr: string | IExpression;
  dest: string;
  strategy: DelegationStrategy;
  preventDefault: boolean;
}

export interface ICallBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.callBinding,
  srcOrExpr: string | IExpression;
  dest: string;
}

export interface IRefBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.refBinding;
  srcOrExpr: string | IExpression;
}

export interface IStylePropertyBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.stylePropertyBinding;
  srcOrExpr: string | IExpression;
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

export interface IHydrateSlotInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateSlot;
  name?: string;
  dest?: string;
  fallback?: ITemplateSource;
}

export interface IHydrateElementInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateElement;
  res: any;
  instructions: TargetedInstruction[];
  parts?: Record<string, ITemplateSource>;
  contentOverride?: INode; // Usage: Compose and View.fromCompiledContent
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
