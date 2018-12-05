import { ForOfStatement, Interpolation, IsBindingBehavior } from './binding/ast';
import { BindingMode } from './binding/binding-mode';
import { DelegationStrategy } from './binding/event-manager';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetBindingInstruction, ILetElementInstruction, IListenerBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITargetedInstruction, ITemplateDefinition, ITextBindingInstruction, TargetedInstruction, TargetedInstructionType } from './definitions';
import { INode } from './dom';

// tslint:disable:no-reserved-keywords | TODO: get rid of this suppression and fix the error

export class TextBindingInstruction implements ITextBindingInstruction {
  public type: TargetedInstructionType.textBinding = TargetedInstructionType.textBinding;
  constructor(public from: string | Interpolation) {}
}
export class InterpolationInstruction implements IInterpolationInstruction {
  public type: TargetedInstructionType.interpolation = TargetedInstructionType.interpolation;
  constructor(public from: string | Interpolation, public to: string) {}
}
export class OneTimeBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;
  public oneTime: true = true;
  public mode: BindingMode.oneTime = BindingMode.oneTime;
  constructor(public from: string | IsBindingBehavior, public to: string) {}
}
export class ToViewBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;
  public oneTime: false = false;
  public mode: BindingMode.toView = BindingMode.toView;
  constructor(public from: string | IsBindingBehavior, public to: string) {}
}
export class FromViewBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;
  public oneTime: false = false;
  public mode: BindingMode.fromView = BindingMode.fromView;
  constructor(public from: string | IsBindingBehavior, public to: string) {}
}
export class TwoWayBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;
  public oneTime: false = false;
  public mode: BindingMode.twoWay = BindingMode.twoWay;
  constructor(public from: string | IsBindingBehavior, public to: string) {}
}
export class IteratorBindingInstruction implements IIteratorBindingInstruction {
  public type: TargetedInstructionType.iteratorBinding = TargetedInstructionType.iteratorBinding;
  constructor(public from: string | ForOfStatement, public to: string) {}
}
export class TriggerBindingInstruction implements IListenerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding = TargetedInstructionType.listenerBinding;
  public strategy: DelegationStrategy.none = DelegationStrategy.none;
  public preventDefault: true = true;
  constructor(public from: string | IsBindingBehavior, public to: string) {}
}
export class DelegateBindingInstruction implements IListenerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding = TargetedInstructionType.listenerBinding;
  public strategy: DelegationStrategy.bubbling = DelegationStrategy.bubbling;
  public preventDefault: false = false;
  constructor(public from: string | IsBindingBehavior, public to: string) {}
}
export class CaptureBindingInstruction implements IListenerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding = TargetedInstructionType.listenerBinding;
  public strategy: DelegationStrategy.capturing = DelegationStrategy.capturing;
  public preventDefault: false = false;
  constructor(public from: string | IsBindingBehavior, public to: string) {}
}
export class CallBindingInstruction implements ICallBindingInstruction {
  public type: TargetedInstructionType.callBinding = TargetedInstructionType.callBinding;
  constructor(public from: string | IsBindingBehavior, public to: string) {}
}
export class RefBindingInstruction implements IRefBindingInstruction {
  public type: TargetedInstructionType.refBinding = TargetedInstructionType.refBinding;
  constructor(public from: string | IsBindingBehavior) {}
}
export class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
  public type: TargetedInstructionType.stylePropertyBinding = TargetedInstructionType.stylePropertyBinding;
  constructor(public from: string | IsBindingBehavior, public to: string) {}
}
export class SetPropertyInstruction implements ISetPropertyInstruction {
  public type: TargetedInstructionType.setProperty = TargetedInstructionType.setProperty;
  constructor(public value: unknown, public to: string) {}
}
export class SetAttributeInstruction implements ITargetedInstruction {
  public type: TargetedInstructionType.setAttribute = TargetedInstructionType.setAttribute;
  constructor(public value: unknown, public to: string) {}
}
export class HydrateElementInstruction implements IHydrateElementInstruction {
  public type: TargetedInstructionType.hydrateElement = TargetedInstructionType.hydrateElement;
  constructor(public res: string, public instructions: TargetedInstruction[], public parts?: Record<string, ITemplateDefinition>, public contentOverride?: INode) {}
}
export class HydrateAttributeInstruction implements IHydrateAttributeInstruction {
  public type: TargetedInstructionType.hydrateAttribute = TargetedInstructionType.hydrateAttribute;
  constructor(public res: string, public instructions: TargetedInstruction[]) {}
}
export class HydrateTemplateController implements IHydrateTemplateController {
  public type: TargetedInstructionType.hydrateTemplateController = TargetedInstructionType.hydrateTemplateController;
  constructor(public def: ITemplateDefinition, public res: string, public instructions: TargetedInstruction[], public link?: boolean) {}
}
export class LetElementInstruction implements ILetElementInstruction {
  public type: TargetedInstructionType.letElement = TargetedInstructionType.letElement;
  constructor(public instructions: ILetBindingInstruction[], public toViewModel: boolean) {}
}
export class LetBindingInstruction implements ILetBindingInstruction {
  public type: TargetedInstructionType.letBinding = TargetedInstructionType.letBinding;
  constructor(public from: string | IsBindingBehavior | Interpolation, public to: string) {}
}
