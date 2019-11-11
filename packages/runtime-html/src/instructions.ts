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
  public type: HTMLTargetedInstructionType.textBinding = HTMLTargetedInstructionType.textBinding;

  public constructor(
    public from: string | IInterpolationExpression,
  ) {}
}

export class TriggerBindingInstruction implements IListenerBindingInstruction {
  public type: HTMLTargetedInstructionType.listenerBinding = HTMLTargetedInstructionType.listenerBinding;

  public preventDefault: true = true;
  public strategy: DelegationStrategy.none = DelegationStrategy.none;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class DelegateBindingInstruction implements IListenerBindingInstruction {
  public type: HTMLTargetedInstructionType.listenerBinding = HTMLTargetedInstructionType.listenerBinding;

  public preventDefault: false = false;
  public strategy: DelegationStrategy.bubbling = DelegationStrategy.bubbling;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class CaptureBindingInstruction implements IListenerBindingInstruction {
  public type: HTMLTargetedInstructionType.listenerBinding = HTMLTargetedInstructionType.listenerBinding;

  public preventDefault: false = false;
  public strategy: DelegationStrategy.capturing = DelegationStrategy.capturing;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
  public type: HTMLTargetedInstructionType.stylePropertyBinding = HTMLTargetedInstructionType.stylePropertyBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class SetAttributeInstruction implements ITargetedInstruction {
  public type: HTMLTargetedInstructionType.setAttribute = HTMLTargetedInstructionType.setAttribute;

  public constructor(
    public value: string,
    public to: string,
  ) {}
}

export class SetClassAttributeInstruction implements ITargetedInstruction {
  public readonly type: HTMLTargetedInstructionType.setClassAttribute = HTMLTargetedInstructionType.setClassAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class SetStyleAttributeInstruction implements ITargetedInstruction {
  public readonly type: HTMLTargetedInstructionType.setStyleAttribute = HTMLTargetedInstructionType.setStyleAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class AttributeBindingInstruction implements IAttributeBindingInstruction {
  public type: HTMLTargetedInstructionType.attributeBinding = HTMLTargetedInstructionType.attributeBinding;

  public constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    public attr: string,
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}
