import {
  DelegationStrategy,
  IInterpolationExpression,
  IsBindingBehavior,
  ITargetedInstruction
} from '@aurelia/runtime';
import {
  HTMLTargetedInstructionType,
  IAttributeBindingInstruction,
  IListenerBindingInstruction,
  IStylePropertyBindingInstruction,
  ITextBindingInstruction
} from './definitions';

export class TextBindingInstruction implements ITextBindingInstruction {
  public type: HTMLTargetedInstructionType.textBinding;

  public from: string | IInterpolationExpression;

  public constructor(from: string | IInterpolationExpression) {
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

  public constructor(from: string | IsBindingBehavior, to: string) {
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

  public constructor(from: string | IsBindingBehavior, to: string) {
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

  public constructor(from: string | IsBindingBehavior, to: string) {
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

  public constructor(from: string | IsBindingBehavior, to: string) {
    this.type = HTMLTargetedInstructionType.stylePropertyBinding;

    this.from = from;
    this.to = to;
  }
}

export class SetAttributeInstruction implements ITargetedInstruction {
  public type: HTMLTargetedInstructionType.setAttribute;

  public to: string;
  public value: string;

  public constructor(value: string, to: string) {
    this.type = HTMLTargetedInstructionType.setAttribute;

    this.to = to;
    this.value = value;
  }
}

export class SetClassAttributeInstruction implements ITargetedInstruction {
  public readonly type: HTMLTargetedInstructionType.setClassAttribute;

  public readonly value: string;

  public constructor(value: string) {
    this.type = HTMLTargetedInstructionType.setClassAttribute;
    this.value = value;
  }
}

export class SetStyleAttributeInstruction implements ITargetedInstruction {
  public readonly type: HTMLTargetedInstructionType.setStyleAttribute;

  public readonly value: string;

  public constructor(value: string) {
    this.type = HTMLTargetedInstructionType.setStyleAttribute;
    this.value = value;
  }
}

export class AttributeBindingInstruction implements IAttributeBindingInstruction {
  public type: HTMLTargetedInstructionType.attributeBinding;

  public from: string | IsBindingBehavior;
  /**
   * `attr` and `to` have the same value on a normal attribute
   * Will be different on `class` and `style`
   * on `class`: attr = `class` (from binding command), to = attribute name
   * on `style`: attr = `style` (from binding command), to = attribute name
   */
  public attr: string;
  public to: string;

  public constructor(attr: string, from: string | IsBindingBehavior, to: string) {
    this.type = HTMLTargetedInstructionType.attributeBinding;

    this.from = from;
    this.attr = attr;
    this.to = to;
  }
}
