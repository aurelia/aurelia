import { ForOfStatement, Interpolation, IsBindingBehavior } from './binding/ast';
import { BindingMode } from './binding/binding-mode';
import { DelegationStrategy } from './binding/event-manager';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetBindingInstruction, ILetElementInstruction, IListenerBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITargetedInstruction, ITemplateDefinition, ITextBindingInstruction, TargetedInstruction, TargetedInstructionType } from './definitions';
import { INode } from './dom';

export class TextBindingInstruction implements ITextBindingInstruction {
  public type: TargetedInstructionType.textBinding;

  public from: string | Interpolation;

  constructor(from: string | Interpolation) {
    this.type = TargetedInstructionType.textBinding;

    this.from = from;
  }
}

export class InterpolationInstruction implements IInterpolationInstruction {
  public type: TargetedInstructionType.interpolation;

  public from: string | Interpolation;
  public to: string;

  constructor(from: string | Interpolation, to: string) {
    this.type = TargetedInstructionType.interpolation;

    this.from = from;
    this.to = to;
  }
}

export class OneTimeBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding;

  public from: string | IsBindingBehavior;
  public mode: BindingMode.oneTime;
  public oneTime: true;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = TargetedInstructionType.propertyBinding;

    this.from = from;
    this.mode = BindingMode.oneTime;
    this.oneTime = true;
    this.to = to;
  }
}

export class ToViewBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding;

  public from: string | IsBindingBehavior;
  public mode: BindingMode.toView;
  public oneTime: false;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = TargetedInstructionType.propertyBinding;

    this.from = from;
    this.mode = BindingMode.toView;
    this.oneTime = false;
    this.to = to;
  }
}

export class FromViewBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding;

  public from: string | IsBindingBehavior;
  public mode: BindingMode.fromView;
  public oneTime: false;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = TargetedInstructionType.propertyBinding;

    this.from = from;
    this.mode = BindingMode.fromView;
    this.oneTime = false;
    this.to = to;
  }
}

export class TwoWayBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;

  public from: string | IsBindingBehavior;
  public mode: BindingMode.twoWay;
  public oneTime: false;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = TargetedInstructionType.propertyBinding;

    this.from = from;
    this.mode = BindingMode.twoWay;
    this.oneTime = false;
    this.to = to;
  }
}

export class IteratorBindingInstruction implements IIteratorBindingInstruction {
  public type: TargetedInstructionType.iteratorBinding;

  public from: string | ForOfStatement;
  public to: string;

  constructor(from: string | ForOfStatement, to: string) {
    this.type = TargetedInstructionType.iteratorBinding;

    this.from = from;
    this.to = to;
  }
}

export class TriggerBindingInstruction implements IListenerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding;

  public from: string | IsBindingBehavior;
  public preventDefault: true;
  public strategy: DelegationStrategy.none;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = TargetedInstructionType.listenerBinding;

    this.from = from;
    this.preventDefault = true;
    this.strategy = DelegationStrategy.none;
    this.to = to;
  }
}

export class DelegateBindingInstruction implements IListenerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding;

  public from: string | IsBindingBehavior;
  public preventDefault: false;
  public strategy: DelegationStrategy.bubbling;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = TargetedInstructionType.listenerBinding;

    this.from = from;
    this.preventDefault = false;
    this.strategy = DelegationStrategy.bubbling;
    this.to = to;
  }
}

export class CaptureBindingInstruction implements IListenerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding;

  public from: string | IsBindingBehavior;
  public preventDefault: false;
  public strategy: DelegationStrategy.capturing;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = TargetedInstructionType.listenerBinding;

    this.from = from;
    this.preventDefault = false;
    this.strategy = DelegationStrategy.capturing;
    this.to = to;
  }
}

export class CallBindingInstruction implements ICallBindingInstruction {
  public type: TargetedInstructionType.callBinding;

  public from: string | IsBindingBehavior;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = TargetedInstructionType.callBinding;

    this.from = from;
    this.to = to;
  }
}

export class RefBindingInstruction implements IRefBindingInstruction {
  public type: TargetedInstructionType.refBinding;

  public from: string | IsBindingBehavior;

  constructor(from: string | IsBindingBehavior) {
    this.type = TargetedInstructionType.refBinding;

    this.from = from;
  }
}

export class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
  public type: TargetedInstructionType.stylePropertyBinding;

  public from: string | IsBindingBehavior;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = TargetedInstructionType.stylePropertyBinding;

    this.from = from;
    this.to = to;
  }
}

export class SetPropertyInstruction implements ISetPropertyInstruction {
  public type: TargetedInstructionType.setProperty;

  public to: string;
  public value: unknown;

  constructor(value: unknown, to: string) {
    this.type = TargetedInstructionType.setProperty;

    this.to = to;
    this.value = value;
  }
}

export class SetAttributeInstruction implements ITargetedInstruction {
  public type: TargetedInstructionType.setAttribute;

  public to: string;
  public value: unknown;

  constructor(value: unknown, to: string) {
    this.type = TargetedInstructionType.setAttribute;

    this.to = to;
    this.value = value;
  }
}

export class HydrateElementInstruction implements IHydrateElementInstruction {
  public type: TargetedInstructionType.hydrateElement;

  public contentOverride?: INode;
  public instructions: TargetedInstruction[];
  public parts?: Record<string, ITemplateDefinition>;
  public res: string;

  constructor(res: string, instructions: TargetedInstruction[], parts?: Record<string, ITemplateDefinition>, contentOverride?: INode) {
    this.type = TargetedInstructionType.hydrateElement;

    this.contentOverride = contentOverride;
    this.instructions = instructions;
    this.parts = parts;
    this.res = res;
  }
}

export class HydrateAttributeInstruction implements IHydrateAttributeInstruction {
  public type: TargetedInstructionType.hydrateAttribute;

  public instructions: TargetedInstruction[];
  public res: string;

  constructor(res: string, instructions: TargetedInstruction[]) {
    this.type = TargetedInstructionType.hydrateAttribute;

    this.instructions = instructions;
    this.res = res;
  }
}

export class HydrateTemplateController implements IHydrateTemplateController {
  public type: TargetedInstructionType.hydrateTemplateController;

  public def: ITemplateDefinition;
  public instructions: TargetedInstruction[];
  public link?: boolean;
  public res: string;

  constructor(def: ITemplateDefinition, res: string, instructions: TargetedInstruction[], link?: boolean) {
    this.type = TargetedInstructionType.hydrateTemplateController;

    this.def = def;
    this.instructions = instructions;
    this.link = link;
    this.res = res;
  }
}

export class LetElementInstruction implements ILetElementInstruction {
  public type: TargetedInstructionType.letElement;

  public instructions: ILetBindingInstruction[];
  public toViewModel: boolean;

  constructor(instructions: ILetBindingInstruction[], toViewModel: boolean) {
    this.type = TargetedInstructionType.letElement;

    this.instructions = instructions;
    this.toViewModel = toViewModel;
  }
}

export class LetBindingInstruction implements ILetBindingInstruction {
  public type: TargetedInstructionType.letBinding;

  public from: string | IsBindingBehavior | Interpolation;
  public to: string;

  constructor(from: string | IsBindingBehavior | Interpolation, to: string) {
    this.type = TargetedInstructionType.letBinding;

    this.from = from;
    this.to = to;
  }
}
