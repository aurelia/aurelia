import { DI } from '../../kernel/di';
import { DelegationStrategy } from '../binding/event-manager';
import { INode } from '../dom';
import { Immutable } from '../../kernel/interfaces';
import { ResourceDescription } from '../resource';
import { IBindableDescription } from './bindable';

export enum TargetedInstructionType {
  textBinding = 0,
  toViewBinding = 1,
  fromViewBinding = 2,
  twoWayBinding = 3,
  listenerBinding = 4,
  callBinding = 5,
  refBinding = 6,
  stylePropertyBinding = 7,
  setProperty = 8,
  setAttribute = 9,
  hydrateSlot = 10,
  hydrateElement = 11,
  hydrateAttribute = 12,
  hydrateTemplateController = 13
}

export interface IBuildInstruction {
  required: boolean;
  compiler: string;
}

export interface ITemplateSource {
  name?: string;
  cache?: "*" | number;
  template?: string;
  instructions?: Array<TargetedInstruction[]>;
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

type TargetedInstruction =
  ITextBindingInstruction |
  IOneWayBindingInstruction | 
  IFromViewBindingInstruction | 
  ITwoWayBindingInstruction | 
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
  src: string;
}

export interface IOneWayBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.toViewBinding;
  src: string;
  dest: string;
}

export interface IFromViewBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.fromViewBinding;
  src: string;
  dest: string;
}

export interface ITwoWayBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.twoWayBinding;
  src: string;
  dest: string;
}

export interface IListenerBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.listenerBinding;
  src: string;
  dest: string;
  strategy: DelegationStrategy;
  preventDefault: boolean;
}

export interface ICallBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.callBinding,
  src: string;
  dest: string;
}

export interface IRefBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.refBinding;
  src: string;
}

export interface IStylePropertyBindingInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.stylePropertyBinding;
  src: string;
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
