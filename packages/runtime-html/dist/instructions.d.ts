import { BindingMode, DelegationStrategy, ForOfStatement, Interpolation, IsBindingBehavior } from '@aurelia/runtime';
import { IInstruction } from './definitions';
import { PartialCustomElementDefinition } from './resources/custom-element';
import { SlotInfo } from './resources/custom-elements/au-slot';
/**
 * InstructionType enum values become the property names for the associated renderers when they are injected
 * into the `Composer`.
 *
 * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
 *
 * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
 * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
 */
export declare const enum InstructionType {
    composeElement = "ra",
    composeAttribute = "rb",
    composeTemplateController = "rc",
    composeLetElement = "rd",
    setProperty = "re",
    interpolation = "rf",
    propertyBinding = "rg",
    callBinding = "rh",
    letBinding = "ri",
    refBinding = "rj",
    iteratorBinding = "rk",
    textBinding = "ha",
    listenerBinding = "hb",
    attributeBinding = "hc",
    stylePropertyBinding = "hd",
    setAttribute = "he",
    setClassAttribute = "hf",
    setStyleAttribute = "hg"
}
export declare type PropertyBindingInstruction = (OneTimeBindingInstruction | ToViewBindingInstruction | FromViewBindingInstruction | TwoWayBindingInstruction);
export declare type ListenerBindingInstruction = (TriggerBindingInstruction | DelegateBindingInstruction | CaptureBindingInstruction);
export declare type NodeInstruction = HydrateElementInstruction | HydrateTemplateController | HydrateLetElementInstruction | TextBindingInstruction;
export declare type AttributeInstruction = InterpolationInstruction | PropertyBindingInstruction | IteratorBindingInstruction | CallBindingInstruction | RefBindingInstruction | SetPropertyInstruction | LetBindingInstruction | HydrateAttributeInstruction | ListenerBindingInstruction | AttributeBindingInstruction | StylePropertyBindingInstruction | SetAttributeInstruction | SetClassAttributeInstruction | SetStyleAttributeInstruction;
export declare type Instruction = NodeInstruction | AttributeInstruction;
export declare type InstructionRow = [Instruction, ...AttributeInstruction[]];
export declare function isInstruction(value: unknown): value is Instruction;
export declare class InterpolationInstruction {
    from: string | Interpolation;
    to: string;
    type: InstructionType.interpolation;
    constructor(from: string | Interpolation, to: string);
}
export declare class OneTimeBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.propertyBinding;
    mode: BindingMode.oneTime;
    oneTime: true;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class ToViewBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.propertyBinding;
    mode: BindingMode.toView;
    oneTime: false;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class FromViewBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.propertyBinding;
    mode: BindingMode.fromView;
    oneTime: false;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class TwoWayBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.propertyBinding;
    mode: BindingMode.twoWay;
    oneTime: false;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class IteratorBindingInstruction {
    from: string | ForOfStatement;
    to: string;
    type: InstructionType.iteratorBinding;
    constructor(from: string | ForOfStatement, to: string);
}
export declare class CallBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.callBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class RefBindingInstruction {
    readonly from: string | IsBindingBehavior;
    readonly to: string;
    type: InstructionType.refBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetPropertyInstruction {
    value: unknown;
    to: string;
    type: InstructionType.setProperty;
    constructor(value: unknown, to: string);
}
export declare class HydrateElementInstruction {
    res: string;
    instructions: IInstruction[];
    slotInfo: SlotInfo | null;
    type: InstructionType.composeElement;
    constructor(res: string, instructions: IInstruction[], slotInfo: SlotInfo | null);
}
export declare class HydrateAttributeInstruction {
    res: string;
    instructions: IInstruction[];
    type: InstructionType.composeAttribute;
    constructor(res: string, instructions: IInstruction[]);
}
export declare class HydrateTemplateController {
    def: PartialCustomElementDefinition;
    res: string;
    instructions: IInstruction[];
    type: InstructionType.composeTemplateController;
    constructor(def: PartialCustomElementDefinition, res: string, instructions: IInstruction[]);
}
export declare class HydrateLetElementInstruction {
    instructions: LetBindingInstruction[];
    toBindingContext: boolean;
    type: InstructionType.composeLetElement;
    constructor(instructions: LetBindingInstruction[], toBindingContext: boolean);
}
export declare class LetBindingInstruction {
    from: string | IsBindingBehavior | Interpolation;
    to: string;
    type: InstructionType.letBinding;
    constructor(from: string | IsBindingBehavior | Interpolation, to: string);
}
export declare class TextBindingInstruction {
    from: string | Interpolation;
    type: InstructionType.textBinding;
    constructor(from: string | Interpolation);
}
export declare class TriggerBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.listenerBinding;
    preventDefault: true;
    strategy: DelegationStrategy.none;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class DelegateBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.listenerBinding;
    preventDefault: false;
    strategy: DelegationStrategy.bubbling;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class CaptureBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.listenerBinding;
    preventDefault: false;
    strategy: DelegationStrategy.capturing;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class StylePropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.stylePropertyBinding;
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetAttributeInstruction {
    value: string;
    to: string;
    type: InstructionType.setAttribute;
    constructor(value: string, to: string);
}
export declare class SetClassAttributeInstruction {
    readonly value: string;
    readonly type: InstructionType.setClassAttribute;
    constructor(value: string);
}
export declare class SetStyleAttributeInstruction {
    readonly value: string;
    readonly type: InstructionType.setStyleAttribute;
    constructor(value: string);
}
export declare class AttributeBindingInstruction {
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr: string;
    from: string | IsBindingBehavior;
    to: string;
    type: InstructionType.attributeBinding;
    constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr: string, from: string | IsBindingBehavior, to: string);
}
//# sourceMappingURL=instructions.d.ts.map