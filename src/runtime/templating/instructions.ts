import { DI } from "../di";
import { DelegationStrategy } from "../binding/event-manager";
import { BindingMode } from "../binding/binding-mode";

export enum TargetedInstructionType {
  textBinding = 0,
  oneWayBinding = 1,
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

export interface ICompiledViewSource {
  name?: string;
  template: string;
  targetInstructions: Array<TargetedInstruction[]>;
  dependencies?: any[];
  surrogateInstructions?: TargetedInstruction[];
  observables?: Record<string, IBindableInstruction>;
  containerless?: boolean;
  shadowOptions?: ShadowRootInit;
  hasSlots?: boolean;
}

export interface IBindableInstruction {
  mode?: BindingMode;
  callback?: string;
  attribute?: string;
}

export const ITargetedInstruction = DI.createInterface('ITargetedInstruction');
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
  type: TargetedInstructionType.oneWayBinding;
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
  dest: string;
  value: any;
}

export interface ISetAttributeInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.setAttribute;
  dest: string;
  value: any;
}

export interface IHydrateSlotInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateSlot;
  name?: string;
  dest?: string;
  fallback?: ICompiledViewSource;
}

export interface IHydrateElementInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateElement;
  res: any;
  instructions: TargetedInstruction[];
  replacements?: Record<string, ICompiledViewSource>;
  contentElement?: Element; // Usage: Compose
}

export interface IHydrateAttributeInstruction extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateAttribute;
  res: any;
  instructions: TargetedInstruction[];
}

export interface IHydrateTemplateController extends ITargetedInstruction {
  type: TargetedInstructionType.hydrateTemplateController;
  res: any;
  src: ICompiledViewSource;
  instructions: TargetedInstruction[];
  link?: boolean;
}
