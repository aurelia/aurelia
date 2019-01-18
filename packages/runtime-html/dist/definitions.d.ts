import { AttributeInstruction, DelegationStrategy, IInterpolationExpression, IsBindingBehavior, ITargetedInstruction, NodeInstruction } from '@aurelia/runtime';
export declare const enum HTMLTargetedInstructionType {
    textBinding = "ha",
    listenerBinding = "hb",
    stylePropertyBinding = "hc",
    setAttribute = "hd"
}
export declare type HTMLNodeInstruction = NodeInstruction | ITextBindingInstruction;
export declare type HTMLAttributeInstruction = AttributeInstruction | IListenerBindingInstruction | IStylePropertyBindingInstruction | ISetAttributeInstruction;
export declare type HTMLTargetedInstruction = HTMLNodeInstruction | HTMLAttributeInstruction;
export declare type HTMLInstructionRow = [HTMLTargetedInstruction, ...HTMLAttributeInstruction[]];
export declare function isHTMLTargetedInstruction(value: unknown): value is HTMLTargetedInstruction;
export interface ITextBindingInstruction extends ITargetedInstruction {
    type: HTMLTargetedInstructionType.textBinding;
    from: string | IInterpolationExpression;
}
export interface IListenerBindingInstruction extends ITargetedInstruction {
    type: HTMLTargetedInstructionType.listenerBinding;
    from: string | IsBindingBehavior;
    to: string;
    strategy: DelegationStrategy;
    preventDefault: boolean;
}
export interface IStylePropertyBindingInstruction extends ITargetedInstruction {
    type: HTMLTargetedInstructionType.stylePropertyBinding;
    from: string | IsBindingBehavior;
    to: string;
}
export interface ISetAttributeInstruction extends ITargetedInstruction {
    type: HTMLTargetedInstructionType.setAttribute;
    value: string;
    to: string;
}
//# sourceMappingURL=definitions.d.ts.map