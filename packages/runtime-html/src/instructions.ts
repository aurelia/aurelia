import {
  DelegationStrategy,
  IInterpolationExpression,
  IsBindingBehavior,
  ITargetedInstruction
} from '@aurelia/runtime';
import {
  HTMLTargetedInstructionType,
  IListenerBindingInstruction,
  IStylePropertyBindingInstruction,
  ITextBindingInstruction
} from './definitions';

export class TextBindingInstruction implements ITextBindingInstruction {
  public type: HTMLTargetedInstructionType.textBinding;

  public from: string | IInterpolationExpression;

  constructor(from: string | IInterpolationExpression) {
    this.type = HTMLTargetedInstructionType.textBinding;

    this.from = from;
  }
}

export class TriggerBindingInstruction implements IListenerBindingInstruction {
  public type: HTMLTargetedInstructionType.listenerBinding;

  public from: string | IsBindingBehavior;
  public preventDefault: true;
  public strategy: DelegationStrategy.none;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = HTMLTargetedInstructionType.listenerBinding;

    this.from = from;
    this.preventDefault = true;
    this.strategy = DelegationStrategy.none;
    this.to = to;
  }
}

export class DelegateBindingInstruction implements IListenerBindingInstruction {
  public type: HTMLTargetedInstructionType.listenerBinding;

  public from: string | IsBindingBehavior;
  public preventDefault: false;
  public strategy: DelegationStrategy.bubbling;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = HTMLTargetedInstructionType.listenerBinding;

    this.from = from;
    this.preventDefault = false;
    this.strategy = DelegationStrategy.bubbling;
    this.to = to;
  }
}

export class CaptureBindingInstruction implements IListenerBindingInstruction {
  public type: HTMLTargetedInstructionType.listenerBinding;

  public from: string | IsBindingBehavior;
  public preventDefault: false;
  public strategy: DelegationStrategy.capturing;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = HTMLTargetedInstructionType.listenerBinding;

    this.from = from;
    this.preventDefault = false;
    this.strategy = DelegationStrategy.capturing;
    this.to = to;
  }
}

export class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
  public type: HTMLTargetedInstructionType.stylePropertyBinding;

  public from: string | IsBindingBehavior;
  public to: string;

  constructor(from: string | IsBindingBehavior, to: string) {
    this.type = HTMLTargetedInstructionType.stylePropertyBinding;

    this.from = from;
    this.to = to;
  }
}

export class SetAttributeInstruction implements ITargetedInstruction {
  public type: HTMLTargetedInstructionType.setAttribute;

  public to: string;
  public value: string;

  constructor(value: string, to: string) {
    this.type = HTMLTargetedInstructionType.setAttribute;

    this.to = to;
    this.value = value;
  }
}
