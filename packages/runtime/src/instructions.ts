import {
  IForOfStatement,
  IInterpolationExpression,
  IsBindingBehavior,
} from './ast';
import {
  ICallBindingInstruction,
  IHydrateAttributeInstruction,
  IHydrateElementInstruction,
  IHydrateLetElementInstruction,
  IHydrateTemplateController,
  IInterpolationInstruction,
  IIteratorBindingInstruction,
  ILetBindingInstruction,
  IPropertyBindingInstruction,
  IRefBindingInstruction,
  ISetPropertyInstruction,
  ITargetedInstruction,
  TargetedInstructionType,
  PartialCustomElementDefinitionParts
} from './definitions';
import { BindingMode } from './flags';
import { PartialCustomElementDefinition } from './resources/custom-element';

export class InterpolationInstruction implements IInterpolationInstruction {
  public type: TargetedInstructionType.interpolation = TargetedInstructionType.interpolation;

  public constructor(
    public from: string | IInterpolationExpression,
    public to: string,
  ) {}
}

export class OneTimeBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;

  public mode: BindingMode.oneTime = BindingMode.oneTime;
  public oneTime: true = true;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class ToViewBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;

  public mode: BindingMode.toView = BindingMode.toView;
  public oneTime: false = false;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class FromViewBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;

  public mode: BindingMode.fromView = BindingMode.fromView;
  public oneTime: false = false;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class TwoWayBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding = TargetedInstructionType.propertyBinding;

  public mode: BindingMode.twoWay = BindingMode.twoWay;
  public oneTime: false = false;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class IteratorBindingInstruction implements IIteratorBindingInstruction {
  public type: TargetedInstructionType.iteratorBinding = TargetedInstructionType.iteratorBinding;

  public constructor(
    public from: string | IForOfStatement,
    public to: string,
  ) {}
}

export class CallBindingInstruction implements ICallBindingInstruction {
  public type: TargetedInstructionType.callBinding = TargetedInstructionType.callBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class RefBindingInstruction implements IRefBindingInstruction {
  public type: TargetedInstructionType.refBinding = TargetedInstructionType.refBinding;

  public constructor(
    public readonly from: string | IsBindingBehavior,
    public readonly to: string
  ) {
    this.type = TargetedInstructionType.refBinding;
  }
}

export class SetPropertyInstruction implements ISetPropertyInstruction {
  public type: TargetedInstructionType.setProperty = TargetedInstructionType.setProperty;

  public constructor(
    public value: unknown,
    public to: string,
  ) {}
}

export class HydrateElementInstruction implements IHydrateElementInstruction {
  public type: TargetedInstructionType.hydrateElement = TargetedInstructionType.hydrateElement;

  public constructor(
    public res: string,
    public instructions: ITargetedInstruction[],
    public parts?: PartialCustomElementDefinitionParts,
  ) {}
}

export class HydrateAttributeInstruction implements IHydrateAttributeInstruction {
  public type: TargetedInstructionType.hydrateAttribute = TargetedInstructionType.hydrateAttribute;

  public constructor(
    public res: string,
    public instructions: ITargetedInstruction[],
  ) {}
}

export class HydrateTemplateController implements IHydrateTemplateController {
  public type: TargetedInstructionType.hydrateTemplateController = TargetedInstructionType.hydrateTemplateController;

  public constructor(
    public def: PartialCustomElementDefinition,
    public res: string,
    public instructions: ITargetedInstruction[],
    public link?: boolean,
    public parts?: PartialCustomElementDefinitionParts,
  ) {}
}

export class LetElementInstruction implements IHydrateLetElementInstruction {
  public type: TargetedInstructionType.hydrateLetElement = TargetedInstructionType.hydrateLetElement;

  public constructor(
    public instructions: ILetBindingInstruction[],
    public toBindingContext: boolean,
  ) {}
}

export class LetBindingInstruction implements ILetBindingInstruction {
  public type: TargetedInstructionType.letBinding = TargetedInstructionType.letBinding;

  public constructor(
    public from: string | IsBindingBehavior | IInterpolationExpression,
    public to: string,
  ) {}
}
